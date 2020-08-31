using System;
using System.Collections.Generic;
using System.Data;
using System.IO;
using DataStore.Interface;
using Org.Sdmxsource.Sdmx.Api.Manager.Retrieval;
using Org.Sdmxsource.Sdmx.Api.Model.Data;
using Org.Sdmxsource.Sdmx.Api.Model.Objects.DataStructure;
using Org.Sdmxsource.Sdmx.Api.Util;
using Org.Sdmxsource.Util.Io;
using DDB.Entities;
using Org.Sdmxsource.Sdmx.Api.Engine;
using Org.Sdmxsource.Sdmx.DataParser.Manager;
using Org.Sdmxsource.Sdmx.StructureRetrieval.Manager;
using Infrastructure.STLogging.Factory;
using Org.Sdmxsource.Sdmx.Api.Model.Objects;
using Org.Sdmxsource.Sdmx.Util.Objects.Container;
using System.Linq;
using Infrastructure.Utils;
using static DataProvider.DDB_NEW;
using Configuration;
using System.Data.SqlClient;
using Microsoft.Extensions.Caching.Memory;
using Attribute = DDB.Entities.Attribute;

namespace DataProvider
{
    public class LoaderDataProvider : ILoaderDataProvider
    {
        #region Campi privati

        private IDataStore mDataStore;
        private string mDBSchema;
        private BuilderDataProvider buildDP;
        private MappingDataProvider mappDP;
        SqlCommandBuilder mBuilder;

        //max number of rows before file import fails
        private int maxNumErr = int.Parse(ConfigurationManager.AppSettings["DMApiSettings:MAX_CROSS_ERROR_NUM"]);

        //number of rows in a page for Pagination (10 MLN by default)
        private int pageSize = int.Parse(ConfigurationManager.AppSettings["DMApiSettings:MAX_BLOCK_SIZE_IMPORT"]);

        //Timeout upload cube
        private int timeOutCubeUpload = int.Parse(ConfigurationManager.AppSettings["DMApiSettings:MAX_TIME_CUBE_IMPORT_DATA"] ?? "120");

        #endregion Campi privati

        public LoaderDataProvider(IDataStore dataStore)
        {
            mDataStore = dataStore;
            mDBSchema = mDataStore.Schema;
            buildDP = new BuilderDataProvider(mDataStore);
            mappDP = new MappingDataProvider(mDataStore);
            mBuilder = new SqlCommandBuilder();
        }

        public bool importAttributeFile(int idMapping, string filePath)
        {
            throw new NotImplementedException();
        }

        public SdmxReport importData(ImportTypeEnum importType, string tempTableName, int IDMapping, int IDCube, string filePath, long loadTime, bool embargo, bool ignoreCuncurrentUpload, bool checkFiltAttributes)
        {
            int ins = 0, insSeries = 0;
            string newFilePath = filePath;
            List<string> keyCols = null;

            try
            {
                var watch = System.Diagnostics.Stopwatch.StartNew();

                //verifying temp table exist
                if (!mDataStore.ExistsTable(tempTableName))
                {
                    throw Utility.Utils.getCustomException("LOADING_TEMP_TABLE_NOT_EXISTENT",
                        @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - Temp table cannot be found.", Infrastructure.STLogging.Interface.LogLevelEnum.Error);
                }

                MappingWithComponents mapp = null;

                //if IDMapping is not null I check its correctness
                if (IDMapping != 0)
                {
                    //retrieving the mapping (controlling its correctness)
                    mapp = mappDP.getDDBMapping(IDMapping);

                    //verifying all columns of the mapping exist in the temp table
                    Dictionary<string, ColumnDefinition> colDict = mDataStore.GetTableDefinition(tempTableName);
                    string[] columnNames = colDict.Values.Select(x => x.ColumnName).ToArray();

                    foreach (ComponentMapping comp in mapp.Components)
                    {
                        if (!columnNames.Contains(comp.ColumnName))
                        {
                            throw Utility.Utils.getCustomException("LOADING_CSV_NOT_MATCHING_MAPPING",
                                @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - CSV file does not match mapping definition.", Infrastructure.STLogging.Interface.LogLevelEnum.Error);
                        }
                    }

                    //forcing cube id
                    IDCube = mapp.IDCube;
                }

                CubeWithDetails c = buildDP.getCube(IDCube);

                //deleting and recreating FactS_TEMP table if embargo = false
                if (!c.HasEmbargoedData)
                {
                    if (mDataStore.ExistsTable($"FactS_TEMP_{IDCube}"))
                    {
                        mDataStore.ExecuteCommand($"DROP TABLE FactS_TEMP_{IDCube}");
                    }

                    //WARNING TODO: no sql standard
                    mDataStore.ExecuteCommand($"SELECT * INTO FactS_TEMP_{IDCube} FROM FactS{IDCube}");

                    //adding indexes to FactS_TEMP_Table
                    AddIndexesOnFact($"FactS_TEMP_{IDCube}");
                }

                //creating column store index for temp table
                try
                {
                    STLoggerFactory.Logger.Log(@"Creating columnstore index for temp table...", Infrastructure.STLogging.Interface.LogLevelEnum.Info);
                    mDataStore.ExecuteCommand($"CREATE CLUSTERED COLUMNSTORE INDEX [colIdx] ON {mBuilder.QuoteIdentifier(tempTableName)};");
                }
                catch (Exception)
                {
                    STLoggerFactory.Logger.Log(@"Error for creating columnstore index for temp table...", Infrastructure.STLogging.Interface.LogLevelEnum.Info);
                }

                //importing codes for not-coded attributes and dimensions
                STLoggerFactory.Logger.Log(@"Import of Not Coded Attributes and Dimension started...", Infrastructure.STLogging.Interface.LogLevelEnum.Info);
                importNotCodedAttributes(c, mapp, tempTableName);
                importNotCodedDimensions(c, mapp, tempTableName);

                //if I have a TID attribute I verify it is a single value
                bool hasUserDefinedTid = !(c.Attributes.Where(a => a.IsTid).Select(x => x.Code).SingleOrDefault() == null);
                if (hasUserDefinedTid)
                {
                    string tid = checkTidUniqueness(tempTableName, "_TID_");

                    //importing TID (if necessary) into AttTEXT_FREE@SDMX table
                    importTid(tid);
                }

                //dictionary containing rows with errors
                Dictionary<string, string> warnDict = new Dictionary<string, string>();

                //building the view for temp table mapping
                string mappedTempTabViewName = createMappedTempTabView(IDCube, IDMapping, tempTableName, hasUserDefinedTid);

                //logging and deleting rows with duplicates on key fields
                STLoggerFactory.Logger.Log(@"Getting duplicated rows...", Infrastructure.STLogging.Interface.LogLevelEnum.Info);
                getDuplicatedRows(ref warnDict, c, mapp, tempTableName);

                //logging and deleting rows with wrong references to codes of attributes, dimensions or measures
                STLoggerFactory.Logger.Log(@"Getting wrong cross references...", Infrastructure.STLogging.Interface.LogLevelEnum.Info);
                getWrongCrossReferenceRows(ref warnDict, c, mapp, tempTableName, mappedTempTabViewName);
                if (mDataStore.ExistsTable($"TEMP_{IDCube}_OBS_VALUE"))
                    getWrongCodedObsValue(ref warnDict, c, mapp, tempTableName, mappedTempTabViewName);

                DataTable dtNum = mDataStore.GetTable($"SELECT COUNT(*) as NUM FROM FiltS{c.IDCube}");
                int initRows = int.Parse(dtNum.Rows[0]["NUM"].ToString());

                //creating column store indexes only in Update
                /*if (initRows > 0)
                {
                    if (importType != ImportTypeEnum.Series)
                    {
                        CreateColumnStoreIdxOnFact($"FactS_TEMP_{c.IDCube}");
                    }

                    CreateColumnStoreIdxOnFilt($"FiltS{c.IDCube}");
                }*/

                //importing series into Filt table
                string seriesViewName = "";
                if (importType != ImportTypeEnum.Data)
                {
                    //creating a temp view for loading series
                    seriesViewName = createSeriesView(c, mapp, mappedTempTabViewName);

                    //checking attributes partial correctness
                    STLoggerFactory.Logger.Log(@"Getting wrong attributes...", Infrastructure.STLogging.Interface.LogLevelEnum.Info);
                    getWrongAttributes(ref warnDict, c, tempTableName, mappedTempTabViewName, seriesViewName);

                    //importing series
                    STLoggerFactory.Logger.Log(@"Loading series...", Infrastructure.STLogging.Interface.LogLevelEnum.Info);
                    insSeries = loadSeries(seriesViewName, c, mapp);
                }

                //verifying all data have an associated series in Filt table
                if (importType == ImportTypeEnum.Data)
                {
                    STLoggerFactory.Logger.Log(@"Getting rows with no series...", Infrastructure.STLogging.Interface.LogLevelEnum.Info);
                    getNoSeriesRows(ref warnDict, tempTableName, mappedTempTabViewName, c);
                }

                //key columns on Filt
                keyCols = c.Dimensions.Select(cc => cc.ColName).ToList();
                string tidCol = c.Attributes.Where(a => a.IsTid).Select(x => x.ColName).SingleOrDefault();
                if (tidCol != null)
                    keyCols.Add(tidCol);

                //importing data into FactS_TEMP table
                if (importType != ImportTypeEnum.Series)
                {
                    STLoggerFactory.Logger.Log(@"Loading data...", Infrastructure.STLogging.Interface.LogLevelEnum.Info);
                    ins = loadData(tempTableName, mappedTempTabViewName, c);
                }

                //importing Dataset level attributes (done here so not have to manage rollback)
                if (importType != ImportTypeEnum.Data)
                {
                    STLoggerFactory.Logger.Log(@"Loading dataset level attributes...", Infrastructure.STLogging.Interface.LogLevelEnum.Info);
                    loadDsLevAtts(seriesViewName, c);
                    mDataStore.ExecuteCommand($"DROP VIEW {mBuilder.QuoteIdentifier(seriesViewName)}");
                }

                //deleting column store indexes only in Update
                /*if (initRows > 0)
                {
                    DeleteColumnStoreIdxOnFilt($"FiltS{c.IDCube}", keyCols);
                    if (importType != ImportTypeEnum.Series)
                    {
                        DeleteColumnStoreIdxOnFact($"FactS_TEMP_{c.IDCube}");
                    }
                }*/

                mDataStore.ExecuteCommand($"DROP VIEW {mappedTempTabViewName}");

                if (importType != ImportTypeEnum.Series)
                    mDataStore.ExecuteCommand($"DROP TABLE {mBuilder.QuoteIdentifier(tempTableName)}");

                //checking FiltS attributes if requested
                if (checkFiltAttributes)
                    checkFiltAtts(c);

                if (mDataStore.ExistsTable($"TMP_ATT_RB_{IDCube}"))
                    mDataStore.ExecuteCommand($"DROP TABLE [TMP_ATT_RB_{IDCube}]");

                if (mDataStore.ExistsTable($"TEMP_{IDCube}_OBS_VALUE"))
                    mDataStore.ExecuteCommand($"DROP TABLE TEMP_{IDCube}_OBS_VALUE");

                STKeyValuePair[] parameters = new STKeyValuePair[] { new STKeyValuePair("IDCube", c.IDCube) };

                if (embargo)
                {
                    mDataStore.ExecuteCommand($"UPDATE CatCube SET HasEmbargoedData = 1 WHERE IDCube = @IDCube", parameters);
                }
                else
                {
                    //if I do not have embargoed data I switch FactS_TEMP with FactS
                    if (!c.HasEmbargoedData)
                    {
                        try
                        {
                            mDataStore.BeginTransaction();
                            switchFactTables(c.IDCube);
                            //deleteing FactS_TEMP if empty
                            mDataStore.ExecuteCommand($"IF (NOT EXISTS(SELECT 1 FROM FactS_TEMP_{c.IDCube})) BEGIN DROP TABLE FactS_TEMP_{c.IDCube} END");
                            mDataStore.CommitTransaction();
                        }
                        catch (Exception ex)
                        {
                            mDataStore.RollbackTransaction();
                            throw ex;
                        }
                    }
                }

                mDataStore.ExecuteCommand($"UPDATE CatCube SET LastUpdated = {mDataStore.GetCurrentDateExpression()} WHERE IDCube = @IDCube", parameters);

                //moving the file in the "Caricati" folder
                try
                {
                    newFilePath = filePath.Substring(0, filePath.IndexOf("\\DaCaricare\\")) + "\\Caricati\\" +
                            c.Code + "_" + DateTime.Now.ToString("yyyyMMdd_HHmmss") + filePath.Substring(filePath.LastIndexOf('.'));

                    LoadingDataTable dt = new LoadingDataTable();
                    dt.Rows.Add(null, c.IDCube, ins, newFilePath, tempTableName, mDataStore.GetDateTextRepresentation(DateTime.Now));
                    mDataStore.UpdateChanges(dt);

                    FileInfo fileInfo = new System.IO.FileInfo(newFilePath);
                    fileInfo.Directory.Create();

                    System.IO.Directory.Move(filePath, newFilePath);
                }
                catch (Exception ex)
                {
                    STLoggerFactory.Logger.Log(@"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - Error in moving imported file: " + ex.Message
                    , Infrastructure.STLogging.Interface.LogLevelEnum.Warn);
                }

                //calculating wrong codes and generating file for report
                List<string> wrongLines = new List<string>();

                Dictionary<string, string> warnDictNew = warnDict;
                if (filePath.Substring(filePath.LastIndexOf('.') + 1).ToLower() == "csv")
                    warnDictNew = generateWrongLinesAndErrorCodes(warnDict, ref wrongLines, newFilePath, IDMapping, mapp);

                watch.Stop();
                string elapsedMs = ((watch.ElapsedMilliseconds / 1000) + loadTime).ToString() + " s";

                return new SdmxReport(elapsedMs, ins, insSeries, newFilePath, warnDictNew, wrongLines.ToArray());
            }
            catch (Exception ex)
            {
                if (mDataStore.ExistsTable(tempTableName))
                    mDataStore.ExecuteCommand($"DROP TABLE {mBuilder.QuoteIdentifier(tempTableName)}");

                if (mDataStore.ExistsTable($"TEMP_{IDCube}_OBS_VALUE"))
                    mDataStore.ExecuteCommand($"DROP TABLE TEMP_{IDCube}_OBS_VALUE");

                rollBackFiltAttributes(IDCube, insSeries);

                /*if(keyCols != null)
                    DeleteColumnStoreIdxOnFilt($"FiltS{IDCube}", keyCols);

                if (importType != ImportTypeEnum.Series)
                {
                    DeleteColumnStoreIdxOnFact($"FactS_TEMP_{IDCube}");
                }*/

                throw ex;
            }

        }

        public string preloadSDMXML(string filePath, ISdmxObjects sdmxObjects, string tid, IMemoryCache memoryCache, string guidSession)
        {
            try
            {
                string filePathCSV = writeSDMXtoCSV(filePath, sdmxObjects);
                return mappDP.preloadCSV(';', Char.MinValue, true, filePathCSV, tid, memoryCache, guidSession, 0);
            }
            catch (Exception ex)
            {
                throw Utility.Utils.getCustomException("SDMXML_PRELOAD",
                   @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - " + ex.Message, Infrastructure.STLogging.Interface.LogLevelEnum.Error);
            }
        }

        public bool disembargoCube(int idCube)
        {
            try
            {
                mDataStore.BeginTransaction();
                switchFactTables(idCube);
                STKeyValuePair[] parameters = new STKeyValuePair[] { new STKeyValuePair("IDCube", idCube) };
                mDataStore.ExecuteCommand($"UPDATE CatCube SET HasEmbargoedData = 0 WHERE IDCube = @IDCube", parameters);

                mDataStore.CommitTransaction();
                return true;
            }
            catch (Exception ex)
            {
                mDataStore.RollbackTransaction();
                throw Utility.Utils.getCustomException("DISEMBARGO_CUBE",
                   @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - " + ex.Message, Infrastructure.STLogging.Interface.LogLevelEnum.Error);
            }
        }

        public bool emptyCube(int idCube)
        {
            STKeyValuePair[] parameters = new STKeyValuePair[] { new STKeyValuePair("IDCube", idCube) };
            DataTable dt1 = mDataStore.GetTable(@"SELECT * FROM CatDataflow WHERE IDCube = @IDCube", parameters);
            if (dt1.Rows.Count > 0)
            {
                throw Utility.Utils.getCustomException("CUBE_WITH_ASSOCIATED_DATAFLOWS",
                    @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - Cannot empty cube with associated dataflows.", Infrastructure.STLogging.Interface.LogLevelEnum.Warn);
            }

            try
            {
                mDataStore.BeginTransaction();

                mDataStore.ExecuteCommand($"TRUNCATE TABLE FactS{idCube}");

                if (mDataStore.ExistsTable($"FactS_TEMP_{idCube}"))
                {
                    mDataStore.ExecuteCommand($"TRUNCATE TABLE FactS_TEMP_{idCube}");
                }

                mDataStore.ExecuteCommand($"DELETE FROM FiltS{idCube}");
                if (mDataStore.ExistsTable($"AttDsLev{idCube}"))
                {
                    mDataStore.ExecuteCommand($"TRUNCATE TABLE AttDsLev{idCube}");
                }

                //remove Embargo
                mDataStore.ExecuteCommand($"UPDATE CatCube SET HasEmbargoedData = 0 WHERE IDCube = @IDCube", parameters);

                mDataStore.CommitTransaction();
                return true;
            }
            catch (Exception ex)
            {
                mDataStore.RollbackTransaction();
                throw Utility.Utils.getCustomException("EMPTY_CUBE",
                   @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - " + ex.Message, Infrastructure.STLogging.Interface.LogLevelEnum.Error);
            }
        }

        #region Metodi Privati

        /// <summary>
        /// Calculates wrong lines in file and error codes for lines with wrong references.
        /// </summary>
        /// <param name="warnDict">dictionary of warnings</param>
        /// <param name="wrongLines">list of wrong lines</param>
        /// <param name="filePath">path of the file that has been loaded</param>
        /// <param name="IDMapping">id of the mapping for the file</param>
        /// <param name="mapp">the mapping for the file</param>
        /// <returns>a new dictionary of warnings</returns>
        private Dictionary<string, string> generateWrongLinesAndErrorCodes(Dictionary<string, string> warnDict, ref List<string> wrongLines, string filePath, int IDMapping, MappingWithComponents mapp)
        {
            Dictionary<string, string> warnDictNew = new Dictionary<string, string>();

            try
            {
                if (warnDict.Count > 0)
                {
                    string header = File.ReadLines(filePath).Take(1).First();
                    wrongLines.Add(header);

                    string separator = IDMapping > 0 ? mapp.CSVSeparator : ";";
                    string[] cols = header.Split(separator);

                    foreach (string s in warnDict.Keys)
                    {
                        int idx = s.IndexOf(":");
                        if (idx < 0)
                            idx = s.Length;
                        int rowNum = int.Parse(s.Substring(0, idx));
                        string line = File.ReadLines(filePath).Skip(rowNum - 1).Take(1).First();

                        if (warnDict[s] == "FILE_IMPORT_WRONG_CROSS_REF")
                        {

                            string col = s.Substring(s.IndexOf(":") + 1);
                            int pos = Array.IndexOf(cols, col);
                            //file without header: col names are Col_0, Col_1, etc.
                            if (pos < 0)
                            {
                                pos = int.Parse(s.Substring(s.IndexOf("_") + 1));
                            }

                            string value = line.Split(separator)[pos];
                            warnDictNew.Add(rowNum + "@" + value + ":" + col, "FILE_IMPORT_WRONG_CROSS_REF");
                        }
                        else
                        {
                            warnDictNew.Add(s, warnDict[s]);
                        }
                        wrongLines.Add(line);
                    }
                }
            }
            catch (Exception ex)
            {
                throw Utility.Utils.getCustomException("LOAD_GEN_COMPLEX_REPORT",
                    @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - " + ex.Message, Infrastructure.STLogging.Interface.LogLevelEnum.Error);
            }

            return warnDictNew;
        }

        public string getDataflowFromXmlImport(string filePath)
        {
            using (StreamReader streamFile = new StreamReader(filePath))
            {
                using (StreamReader _stream = new StreamReader(streamFile.BaseStream))
                {
                    ReadableDataLocationFactory fact = new ReadableDataLocationFactory();
                    IReadableDataLocation rdl = fact.GetReadableDataLocation(_stream.BaseStream);

                    ISdmxObjectRetrievalManager retrievalManager = new InMemoryRetrievalManager();

                    DataReaderManager dataReader = new DataReaderManager();
                    IDataReaderEngine dataEngine = dataReader.GetDataReaderEngine(rdl, retrievalManager);

                    var df = dataEngine.Header.Structures.FirstOrDefault();
                    if (df?.StructureReference == null)
                    {
                        return "";
                    }
                    return $"{df.StructureReference.AgencyId}+{df.StructureReference.MaintainableId}+{df.StructureReference.Version}";
                }
            }
        }


        /// <summary>
        /// Converts an SDMX file into CSV.
        /// </summary>
        /// <param name="filePath">Path of the SDMX file to be converted.</param>
        /// <param name="dsdObj">DSD referenced by the cube.</param>
        /// <param name="transcode_time">Transcode time object (optional) for time transcoding. NB. NOT USED</param>
        /// <returns>Path of the converted file.</returns>
        private string writeSDMXtoCSV(string filePath, ISdmxObjects dsdObj, TranscodeTime transcode_time = null)
        {
            STLoggerFactory.Logger.Log(@"Converting SDMX to CSV started...", Infrastructure.STLogging.Interface.LogLevelEnum.Info);

            using (StreamReader streamFile = new System.IO.StreamReader(filePath))
            {
                string tempCsvFilename = Path.GetTempPath() + "TEMP_FILE_" + new System.Random().Next(0, int.MaxValue) + ".csv";
                StreamWriter csvOutput = new System.IO.StreamWriter(tempCsvFilename);

                char separator = ';';
                List<string> currentRow;
                List<string> header = new List<string>();
                bool writeHeader = true;

                using (StreamReader _stream = new StreamReader(streamFile.BaseStream))
                {
                    using (csvOutput)
                    {
                        ReadableDataLocationFactory fact = new ReadableDataLocationFactory();
                        IReadableDataLocation rdl = fact.GetReadableDataLocation(_stream.BaseStream);

                        try
                        {
                            ISdmxObjectRetrievalManager retrievalManager = new InMemoryRetrievalManager(dsdObj);

                            DataReaderManager dataReader = new DataReaderManager();
                            IDataReaderEngine dataEngine = dataReader.GetDataReaderEngine(rdl, retrievalManager);

                            if (dataEngine != null)
                            {
                                dataEngine.Reset();

                                while (dataEngine.MoveNextDataset())
                                {
                                    IDataStructureObject dsd = dataEngine.DataStructure;

                                    List<KeyValuePair<IList<IKeyValue>, IList<IKeyValue>>> groupAttributeDef = new List<KeyValuePair<IList<IKeyValue>, IList<IKeyValue>>>();

                                    Dictionary<string, int> headerIndx = new Dictionary<string, int>();
                                    int i = 0;
                                    foreach (var dimension in dsd.GetDimensions())
                                    {
                                        header.Add(dimension.Id);
                                        headerIndx[dimension.Id] = i;
                                        i++;
                                    }
                                    foreach (var attribute in dsd.Attributes)
                                    {
                                        header.Add(attribute.Id);
                                        headerIndx[attribute.Id] = i;
                                        i++;
                                    }
                                    header.Add("OBS_VALUE");
                                    headerIndx["OBS_VALUE"] = i;

                                    var attributesDataSetLevel = dataEngine.DatasetAttributes;


                                    while (dataEngine.MoveNextKeyable())
                                    {

                                        IKeyable currentKey = dataEngine.CurrentKey;

                                        if (currentKey.GroupName != null)
                                        {
                                            KeyValuePair<IList<IKeyValue>, IList<IKeyValue>> groupAttrAssignment =
                                                new KeyValuePair<IList<IKeyValue>, IList<IKeyValue>>(currentKey.Key, currentKey.Attributes);
                                            groupAttributeDef.Add(groupAttrAssignment);
                                        }

                                        while (dataEngine.MoveNextObservation())
                                        {
                                            currentRow = new List<string>();
                                            var currentRowArray = new string[header.Count];
                                            for (i = 0; i < currentRowArray.Length; i++) currentRowArray[i] = "";

                                            IObservation obs = dataEngine.CurrentObservation;
                                            var freq = TranscodeTime.TypePeriod.A.ToString();

                                            //adds column for key of attributes at level series
                                            foreach (IKeyValue keyValue in currentKey.Attributes)
                                            {
                                                currentRowArray[headerIndx[keyValue.Concept]] = keyValue.Code;

                                            }

                                            //adds column for key of attributes at level dataset /* added 22.02.2018 */
                                            foreach (IKeyValue keyValue in attributesDataSetLevel)
                                            {
                                                currentRowArray[headerIndx[keyValue.Concept]] = keyValue.Code;
                                            }

                                            //adds column for key of dim
                                            foreach (IKeyValue keyValue in currentKey.Key)
                                            {
                                                currentRowArray[headerIndx[keyValue.Concept]] = keyValue.Code;

                                                if (keyValue.Concept == dsd.FrequencyDimension.Id)
                                                    freq = keyValue.Code.Trim();
                                            }

                                            //adds column for key of attributes to level observation
                                            foreach (IKeyValue keyValue in obs.Attributes)
                                            {
                                                currentRowArray[headerIndx[keyValue.Concept]] = keyValue.Code.Replace("\n", " ");
                                            }

                                            //adds columns for key of attributes at level group
                                            foreach (var attributeDef in groupAttributeDef)
                                            {
                                                bool setAttribute = true;
                                                foreach (var condition in attributeDef.Key)
                                                {
                                                    if (currentRowArray[headerIndx[condition.Concept]] != condition.Code)
                                                    {
                                                        setAttribute = false;
                                                        break;
                                                    }
                                                }
                                                if (setAttribute)
                                                {
                                                    foreach (var attribute in attributeDef.Value)
                                                    {
                                                        currentRowArray[headerIndx[attribute.Concept]] = attribute.Code;
                                                    }
                                                }
                                            }

                                            //adds column Cross Sectional Value
                                            if (obs.CrossSection)
                                            {
                                                currentRowArray[headerIndx[obs.CrossSectionalValue.Concept]] = obs.CrossSectionalValue.Code.Trim();
                                            }

                                            //applies transcoding
                                            string obsTime = obs.ObsTime;

                                            bool useTranscode = false;
                                            if (obs.ObsTimeFormat.FrequencyCode == TranscodeTime.TypePeriod.A.ToString())
                                                useTranscode = false;

                                            if (useTranscode)
                                            {
                                                int sepIndex = obsTime.IndexOf('-');
                                                string period = string.Empty;
                                                string period_change = obsTime[sepIndex].ToString();
                                                int nextChar;

                                                if (!int.TryParse(obsTime[sepIndex + 1].ToString(), out nextChar))
                                                {
                                                    period = obsTime[sepIndex + 1].ToString();
                                                    period_change += period;
                                                }
                                                else period = TranscodeTime.TypePeriod.M.ToString();

                                                if (dsd.HasFrequencyDimension() && currentRowArray[headerIndx[dsd.FrequencyDimension.Id]] != null)
                                                    period = currentRowArray[headerIndx[dsd.FrequencyDimension.Id]];

                                                TranscodeTime _transcode_time = new TranscodeTime();
                                                _transcode_time.stopChar = period_change;
                                                _transcode_time.periodChar = (TranscodeTime.TypePeriod)Enum.Parse(typeof(TranscodeTime.TypePeriod), period);

                                                obsTime = _transcode_time.TransCodific(obsTime);
                                            }

                                            //adds TIME_PERIOD column
                                            currentRowArray[headerIndx["TIME_PERIOD"]] = obsTime;

                                        //adds OBS_VALUE column
                                        if (obs.ObservationValue == null)
                                        {
                                            currentRowArray[headerIndx["OBS_VALUE"]] = "";
                                        }
                                        else if (obs.ObservationValue.Trim() != "NaN")
                                            currentRowArray[headerIndx["OBS_VALUE"]] = obs.ObservationValue.Trim();

                                            if (writeHeader)
                                            {
                                                i = 0;
                                                foreach (var concept in header)
                                                {
                                                    if (i > 0) csvOutput.Write(separator);
                                                    csvOutput.Write(concept);
                                                    i++;
                                                }
                                                csvOutput.Write(Environment.NewLine);
                                                writeHeader = false;
                                            }
                                            int j = 0;
                                            foreach (var item in currentRowArray)
                                            {
                                                if (j > 0) csvOutput.Write(separator);
                                                csvOutput.Write(item);
                                                j++;
                                            }
                                            csvOutput.Write(Environment.NewLine);
                                        }
                                    }
                                    break;
                                }
                            }
                        }
                        catch (Exception ex)
                        {
                            throw Utility.Utils.getCustomException("SDMX_TO_CSV_FILE_CONVERTING",
                                @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - " + ex.Message, Infrastructure.STLogging.Interface.LogLevelEnum.Error);
                        }
                        finally
                        {
                            rdl.Close();
                        }
                    }
                }
                //returns the name of the csv file created
                return tempCsvFilename;
            }
        }

        /// <summary>
        /// Imports TID value, if it is not already present, in AttTEXT_FREE@SDMX table.
        /// </summary>
        /// <param name="tid">Tid value.</param>
        private void importTid(string tid)
        {
            STKeyValuePair[] parameters = new STKeyValuePair[] { new STKeyValuePair("Tid", tid) };

            try
            {
                //imports the tid if needed
                string qTid = $"SELECT * FROM AttTEXT_FREE@SDMX WHERE Code = @Tid";
                DataTable tidDt = mDataStore.GetTable(qTid, parameters);
                if (tidDt.Rows.Count == 0)
                {
                    mDataStore.ExecuteCommand($"INSERT INTO AttTEXT_FREE@SDMX VALUES(@Tid, NULL, {mDataStore.GetCurrentDateExpression()})", parameters);
                }
            }
            catch (Exception ex)
            {
                throw Utility.Utils.getCustomException("IMPORT_DATA_IMPORT_TID",
                   @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - " + ex.Message, Infrastructure.STLogging.Interface.LogLevelEnum.Error);
            }
        }

        /// <summary>
        /// Imports codes of not-coded attributes into their physical tables.
        /// </summary>
        /// <param name="c">The cube where we are importing data.</param>
        /// <param name="mapp">Mapping for the cube. It is NULL if we are importing a SDMX-ML file.</param>
        /// <param name="tableName">Temp table containing data to be loaded.</param>
        private void importNotCodedAttributes(CubeWithDetails c, MappingWithComponents mapp, string tableName)
        {
            try
            {
                List<string> mappedAtts = null;

                if (mapp != null)
                {
                    mappedAtts = mapp.Components
                                    .Where(x => x.CubeComponentType == CubeComponentTypeEnum.Attribute)
                                    .Select(y => y.CubeComponentCode).ToList();
                }

                List<string> notCodedAtts = c.Attributes
                                             .Where(x => x.CodelistCode == null && !x.IsTid && (mapp == null || mappedAtts.Contains(x.Code)))
                                             .Select(a => a.Code).ToList();

                for (int i = 0; i < notCodedAtts.Count; i++)
                {
                    DDB.Entities.Attribute a = c.Attributes.Where(x => x.Code == notCodedAtts[i]).Single();
                    string colTempName = (mapp == null) ? colTempName = notCodedAtts[i] :
                        mapp.Components.Where(x => x.CubeComponentCode == notCodedAtts[i]).Select(cm => cm.ColumnName).Single();

                    string hashExp = mDataStore.GetHashColumnExpression(new List<string>() { $"tmp.{mBuilder.QuoteIdentifier(colTempName)}" });

                    string q = $@"INSERT INTO {mBuilder.QuoteIdentifier(a.MemberTable)}
                                 SELECT DISTINCT CONVERT(varchar(100), {hashExp}, 2), NULL, {mDataStore.GetCurrentDateExpression()}, tmp.{mBuilder.QuoteIdentifier(colTempName)}
                                 FROM {mBuilder.QuoteIdentifier(tableName)} tmp
                                 LEFT JOIN {mBuilder.QuoteIdentifier(a.MemberTable)} att on tmp.{mBuilder.QuoteIdentifier(colTempName)} = att.Text
                                 WHERE att.Text is null AND tmp.{mBuilder.QuoteIdentifier(colTempName)} is not null";

                    mDataStore.ExecuteCommand(q);
                }
            }
            catch (Exception ex)
            {
                throw Utility.Utils.getCustomException("IMPORT_DATA_IMPORT_NOT_CODED_ATTS",
                   @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - " + ex.Message, Infrastructure.STLogging.Interface.LogLevelEnum.Error);
            }
        }

        /// <summary>
        /// Imports codes of not-coded dimensions (not temporal) into their physical tables.
        /// </summary>
        /// <param name="c">The cube where we are importing data.</param>
        /// <param name="mapp">Mapping for the cube. It is NULL if we are importing a SDMX-ML file.</param>
        /// <param name="tableName">Temp table containing data to be loaded.</param>
        private void importNotCodedDimensions(CubeWithDetails c, MappingWithComponents mapp, string tableName)
        {
            try
            {
                List<string> mappedDims = null;

                if (mapp != null)
                {
                    mappedDims = mapp.Components
                                    .Where(x => x.CubeComponentType == CubeComponentTypeEnum.Dimension)
                                    .Select(y => y.CubeComponentCode).ToList();
                }

                List<string> notCodedDims = c.Dimensions
                                             .Where(x => x.CodelistCode == null && !x.IsTimeSeriesDim && (mapp == null || mappedDims.Contains(x.Code)))
                                             .Select(a => a.Code).ToList();

                for (int i = 0; i < notCodedDims.Count; i++)
                {
                    Dimension d = c.Dimensions.Where(x => x.Code == notCodedDims[i]).Single();
                    string colTempName = (mapp == null) ? colTempName = notCodedDims[i] :
                        mapp.Components.Where(x => x.CubeComponentCode == notCodedDims[i]).Select(cm => cm.ColumnName).Single();

                    string hashExp = mDataStore.GetHashColumnExpression(new List<string>() { $"tmp.{mBuilder.QuoteIdentifier(colTempName)}" });

                    string q = $@"INSERT INTO {mBuilder.QuoteIdentifier(d.MemberTable)}
                                 SELECT DISTINCT CONVERT(varchar(100), {hashExp}, 2), NULL, {mDataStore.GetCurrentDateExpression()}, tmp.{mBuilder.QuoteIdentifier(colTempName)}
                                 FROM {mBuilder.QuoteIdentifier(tableName)} tmp
                                 LEFT JOIN {mBuilder.QuoteIdentifier(d.MemberTable)} dim on tmp.{mBuilder.QuoteIdentifier(colTempName)} = dim.Text
                                 WHERE dim.Text is null AND tmp.{mBuilder.QuoteIdentifier(colTempName)} is not null";

                    mDataStore.ExecuteCommand(q);
                }
            }
            catch (Exception ex)
            {
                throw Utility.Utils.getCustomException("IMPORT_DATA_IMPORT_NOT_CODED_DIMS",
                   @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - " + ex.Message, Infrastructure.STLogging.Interface.LogLevelEnum.Error);
            }
        }

        #region metodi check errori in CSV

        /// <summary>
        /// Logs and deletes from temp table rows with duplicated keys.
        /// </summary>
        /// <param name="warnDict">dictionary of warnings</param>
        /// <param name="cube">the cube where data are being loaded</param>
        /// <param name="mapp">mapping for the cube. NULL for SDMX-ML file imports.</param>
        /// <param name="tempTableName">the temp table</param>
        /// <returns></returns>
        private void getDuplicatedRows(ref Dictionary<string, string> warnDict, CubeWithDetails cube, MappingWithComponents mapp, string tempTableName)
        {
            try
            {
                //gets key columns for the table (i.e. dimensions)
                List<string> keyCols;

                if (mapp != null)
                {
                    keyCols = mapp.Components
                                  .Where(c => c.CubeComponentType == CubeComponentTypeEnum.Dimension || c.CubeComponentType == CubeComponentTypeEnum.TimeDimension)
                                  .Select(x => x.ColumnName).ToList();
                }
                else
                {
                    keyCols = cube.Dimensions
                                  .Select(x => x.Code).ToList();
                }

                List<string> measCols;

                if (mapp != null)
                {
                    measCols = mapp.Components
                                  .Where(c => c.CubeComponentType == CubeComponentTypeEnum.Measure)
                                  .Select(x => x.ColumnName).ToList();
                }
                else
                {
                    measCols = cube.Measures
                                  .Select(x => x.Code).ToList();
                }

                //gets duplicated rows
                DataTable dtDupl = findDuplicatedRows(tempTableName, keyCols);

                if (dtDupl.Rows.Count > 0)
                {
                    //checking for duplicated rows with conflict for measures: this case must block the whole process (see Task 975)
                    keyCols.AddRange(measCols);
                    DataTable dtDuplObs = findDuplicatedRows(tempTableName, keyCols);

                    //duplicated rows with conflict for measures: this case must block the whole process (see Task 975)
                    if (dtDuplObs.Rows.Count < dtDupl.Rows.Count)
                    {
                        List<int> rows = dtDuplObs.AsEnumerable().Select(x => int.Parse(x["NumRow"].ToString())).ToList();

                        //phisically deletes duplicated rows from the temp table
                        foreach (DataRow row in dtDupl.Rows)
                        {
                            //adding rows with duplicates on dimension but not on dim+measures
                            if (!rows.Contains(int.Parse(row["NumRow"].ToString())))
                            {
                                warnDict.Add(row["NumRow"].ToString(), "FILE_IMPORT_DUPL_ROW_CONFL");
                            }

                            if (warnDict.Count > maxNumErr)
                            {
                                throw new FormatException("Maximum number of rows with errors reached");
                            }
                        }

                        throw new InvalidDataException();
                    }
                    else
                    {

                        //phisically deletes duplicated rows from the temp table
                        foreach (DataRow row in dtDupl.Rows)
                        {
                            warnDict.Add(row["NumRow"].ToString(), "FILE_IMPORT_DUPL_ROW");
                            row.Delete();

                            if (warnDict.Count > maxNumErr)
                            {
                                throw new FormatException("Maximum number of rows with errors reached");
                            }
                        }

                        dtDupl.TableName = tempTableName;
                        dtDupl.PrimaryKey = new DataColumn[] { dtDupl.Columns["NumRow"] };
                        mDataStore.UpdateChanges(dtDupl);
                    }
                }
            }
            catch (InvalidDataException ex)
            {
                Exception e = Utility.Utils.getCustomException("DUPL_ROWS_UNRES_CONFLICT",
                   @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - " + ex.Message, Infrastructure.STLogging.Interface.LogLevelEnum.Error);
                e.Data.Add("Report", warnDict);
                throw e;
            }
            catch (FormatException ex)
            {
                Exception e = Utility.Utils.getCustomException("IMPORT_DATA_MAX_NUM_WRONG_ROWS",
                   @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - " + ex.Message, Infrastructure.STLogging.Interface.LogLevelEnum.Error);
                e.Data.Add("Report", warnDict);
                throw e;
            }
            catch (Exception ex)
            {
                throw Utility.Utils.getCustomException("IMPORT_DATA_CHECKING_DUPL_ROWS",
                   @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - " + ex.Message, Infrastructure.STLogging.Interface.LogLevelEnum.Error);
            }
        }

        /// <summary>
        /// Create indexes on Temp table's key columns
        /// </summary>
        /// <param name="IDMapping">Mapping id</param>
        /// <param name="mapp">The mapping</param>
        /// <param name="c">The associated cube</param>
        /// <param name="tempTableName">name of the temp table.</param>
        private void createIndexesForTempTable(int IDMapping, MappingWithComponents mapp, CubeWithDetails c, string tempTableName)
        {
            STLoggerFactory.Logger.Log(@"Creating indexes for temp table...", Infrastructure.STLogging.Interface.LogLevelEnum.Info);
            List<string> keyCols = c.Dimensions.Select(x => x.Code).ToList();

            if (IDMapping > 0)
            {
                keyCols = mapp.Components.Where(x => keyCols.Contains(x.CubeComponentCode)).Select(y => y.ColumnName).ToList();
            }

            foreach (string d in keyCols)
                mDataStore.ExecuteCommand($"CREATE NONCLUSTERED INDEX {mBuilder.QuoteIdentifier("IDX_" + d)} ON {mBuilder.QuoteIdentifier(tempTableName)}({mBuilder.QuoteIdentifier(d)});");

        }

        /// <summary>
        /// Checks TID univocity in the table given as a parmeter.
        /// </summary>
        /// <param name="tempTableName">the temp table.</param>
        /// <param name="tidCol">name of the columns corrispondent to the tid.</param>
        /// <returns>the TID value in case of success, otherwise an exception is thrown.</returns>
        private string checkTidUniqueness(string tempTableName, string tidCol)
        {
            DataTable dt = mDataStore.GetTable($"SELECT DISTINCT {tidCol} FROM {mBuilder.QuoteIdentifier(tempTableName)}");
            if (dt.Rows.Count != 1)
            {
                throw Utility.Utils.getCustomException("IMPORT_DATA_CHECKING_TID_UNIQUENESS",
                        @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - TID is not unique.", Infrastructure.STLogging.Interface.LogLevelEnum.Error);
            }

            return dt.Rows[0][0].ToString();
        }

        /// <summary>
        /// Logs and deletes from temp table rows without an associated series.
        /// </summary>
        /// <param name="warnDict">dictionary of warnings.</param>
        /// <param name="tableName">temp table to be analysed.</param>
        /// <param name="mappedTempTabViewName">a view containing temp table values mapped on keys</param>
        /// <param name="cube">the cube where data are being loaded</param>
        /// <returns></returns>
        private void getNoSeriesRows(ref Dictionary<string, string> warnDict, string tableName, string mappedTempTabViewName, CubeWithDetails cube)
        {
            try
            {
                //non-temporal dimensions
                List<string> keyCols = cube.Dimensions
                                           .Where(c => !c.IsTimeSeriesDim)
                                           .Select(x => x.ColName).ToList();

                //gets rows without associated series
                string joinPred = "";
                foreach (string col in keyCols)
                {
                    joinPred += "v.[" + col + "] =  f.[" + col + "] AND ";
                }

                string q = $"SELECT v.NumRow" + Environment.NewLine +
                           $"FROM {mBuilder.QuoteIdentifier(mappedTempTabViewName)} v" + Environment.NewLine +
                           $"LEFT JOIN FiltS{cube.IDCube} f ON {joinPred.Substring(0, joinPred.Length - 5)}" + Environment.NewLine +
                           $"WHERE f.SID is NULL";

                DataTable dt = mDataStore.GetTable(mDataStore.GetPagedQuery(q, "NumRow", 0, maxNumErr + 10, false));

                if (dt.Rows.Count > 0)
                {
                    //phisically deletes rows without an associated series from the temp table
                    foreach (DataRow row in dt.Rows)
                    {
                        warnDict.Add(row["NumRow"].ToString(), "FILE_IMPORT_NO_ASSOCIATED_SERIES");
                        row.Delete();
                        if (warnDict.Count > maxNumErr)
                        {
                            throw new FormatException("Maximum number of rows with errors reached");
                        }
                    }
                    dt.TableName = tableName;
                    dt.PrimaryKey = new DataColumn[] { dt.Columns["NumRow"] };
                    mDataStore.UpdateChanges(dt);
                }
            }
            catch (Exception ex)
            {
                throw Utility.Utils.getCustomException("IMPORT_DATA_CHECKING_NO_SERIES_ROWS",
                   @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - " + ex.Message, Infrastructure.STLogging.Interface.LogLevelEnum.Error);
            }
        }

        /// <summary>
        /// Interrupts the import logging rows with attachment level different from Observation with different values for the same series.
        /// </summary>
        /// <param name="warnDict">dictionary of warnings</param>
        /// <param name="cube">the cube where data are being loaded</param>
        /// <param name="tempTableName">the temp table to be analysed</param>
        /// <param name="mappedTempTabViewName">a view containing temp table values mapped on keys</param>
        /// <param name="seriesViewName">temp view containing series to be inserted in FiltS table</param>
        /// <returns></returns>
        private void getWrongAttributes(ref Dictionary<string, string> warnDict, CubeWithDetails cube, string tempTableName, string mappedTempTabViewName, string seriesViewName)
        {
            //checks there are no attributes with attachment level different from Observation with different values for the same series
            try
            {
                //non temporal dimensions
                List<string> keyCols = cube.Dimensions
                                           .Where(c => !c.IsTimeSeriesDim)
                                           .Select(x => x.ColName).ToList();

                //gets series with duplicated attributes (they may create problems on following steps)
                DataTable dtDupl = findDuplicatedRows(seriesViewName, keyCols);

                if (dtDupl.Rows.Count > 0)
                {
                    //log series with duplicated attributes and returns a blocking error
                    foreach (DataRow dr in dtDupl.Rows)
                    {
                        string whereClause = "";

                        foreach (DataColumn dc in dtDupl.Columns)
                            if (dc.ColumnName != "RN" && !DBNull.Value.Equals(dr[dc]))
                                whereClause += $"v.[{dc.ColumnName}] = {dr[dc].ToString()} AND ";

                        string q = $@"SELECT NumRow 
                                  FROM {mBuilder.QuoteIdentifier(mappedTempTabViewName)} v
                                  WHERE {whereClause.Substring(0, whereClause.Length - 5)}";

                        DataTable dtErrTemp = mDataStore.GetTable(mDataStore.GetPagedQuery(q, "NumRow", 0, maxNumErr + 10, false));

                        //stores rows to be deleted
                        foreach (DataRow row in dtErrTemp.Rows)
                        {
                            warnDict.Add(row["NumRow"].ToString(), "FILE_IMPORT_WRONG_ATTRIBUTE");

                            if (warnDict.Count > maxNumErr)
                            {
                                throw new FormatException("Maximum number of rows with errors reached");
                            }
                            throw new InvalidDataException();
                        }
                    }
                }
            }
            catch (InvalidDataException ex)
            {
                Exception e = Utility.Utils.getCustomException("ATTS_UNRES_CONFLICT",
                   @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - " + ex.Message, Infrastructure.STLogging.Interface.LogLevelEnum.Error);
                e.Data.Add("Report", warnDict);
                throw e;
            }
            catch (Exception ex)
            {
                throw Utility.Utils.getCustomException("IMPORT_DATA_CHECKING_WRONG_ATTRIBUTES",
                   @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - " + ex.Message, Infrastructure.STLogging.Interface.LogLevelEnum.Error);
            }
        }

        /// <summary>
        /// Checks if there are duplicated rows in the given table grouping rows by the given keyCols
        /// </summary>
        /// <param name="tableName">The table to be checked.</param>
        /// <param name="keyCols">Columns to be used for partitioning.</param>
        /// <returns>DataTable with the duplicated rows.</returns>
        private DataTable findDuplicatedRows(string tableName, List<string> keyCols)
        {
            string keyColPred = "";
            foreach (string col in keyCols)
            {
                keyColPred += "[" + col + "], ";
            }
            keyColPred = keyColPred.Substring(0, keyColPred.Length - 2);

            Dictionary<string, ColumnDefinition> dtSch = mDataStore.GetTableDefinition(tableName);

            string ordCol = dtSch.Keys.Contains("NumRow") ? "NumRow" : keyCols[0];

            string qDupl = $@"  SELECT *
                                FROM(
                                    SELECT *,
                                    ROW_NUMBER() OVER(PARTITION BY {keyColPred} ORDER by [{ordCol}] ASC) as RN
                                    FROM {mBuilder.QuoteIdentifier(tableName)}) tbl
                                WHERE RN > 1";

            DataTable dtDupl = mDataStore.GetTable(mDataStore.GetPagedQuery(qDupl, ordCol, 0, maxNumErr + 10, false));

            return dtDupl;
        }

        /// <summary>
        /// Logs and deletes from temp table rows with wrong references to codes of dimensions or attributes.
        /// </summary>
        /// <param name="warnDict">dictionary of warnings</param>
        /// <param name="cube">the cube where data are being loaded</param>
        /// <param name="mapp">mapping for the cube. It is NULL if we are importing a SDMX-ML file.</param>
        /// <param name="tableName">the table to be analyzed</param>
        /// <param name="mappedTempTabViewName">temp view containing series to be loaded</param>
        private void getWrongCrossReferenceRows(ref Dictionary<string, string> warnDict, CubeWithDetails cube, MappingWithComponents mapp, string tableName, string mappedTempTabViewName)
        {
            try
            {
                DataTable dtMet = mDataStore.GetTableMetadata(mappedTempTabViewName);
                List<string> cols = dtMet.AsEnumerable().Select(row => row["FIELD_NAME"].ToString()).ToList();

                string wherePred = "", casePred = "";

                //list of measures
                List<string> measures = cube.Measures.Select(x => x.ColName).ToList();

                //list of not coded attributes: they can have null values
                List<string> notCodedAttrCol = cube.Attributes.Where(c => c.CodelistCode == null).Select(x => x.ColName).ToList();

                //list of non mandatory attributes
                List<string> conditionalAttrCol = cube.Attributes.Where(c => !c.IsMandatory).Select(x => x.ColName).ToList();

                for (int i = 0; i < cols.Count; i++)
                {
                    string colName = cols.ElementAt(i);

                    //getting file's column associated to the table from the associated element of the cube
                    string cubeEl = null;
                    cubeEl = cube.Attributes.Where(a => a.ColName == colName).Select(x => x.Code).SingleOrDefault();
                    if (cubeEl == null)
                    {
                        cubeEl = cube.Dimensions.Where(d => d.ColName == colName).Select(x => x.Code).SingleOrDefault();
                    }
                    if (cubeEl == null)
                    {
                        cubeEl = cube.Measures.Where(m => m.ColName == colName).Select(x => x.Code).SingleOrDefault();
                    }

                    string csvCol = (mapp == null) ? cubeEl : mapp.Components.Where(x => x.CubeComponentCode == cubeEl).Select(y => y.ColumnName).SingleOrDefault();

                    if (colName != "NumRow" && !notCodedAttrCol.Contains(colName) && !measures.Contains(colName) && !conditionalAttrCol.Contains(colName))
                    {
                        wherePred += Environment.NewLine + $@"{colName} is null OR";
                        casePred += Environment.NewLine + $@"WHEN {colName} is null THEN '{csvCol}'";
                    }
                    else if (colName != "NumRow" && !notCodedAttrCol.Contains(colName) && !measures.Contains(colName) && conditionalAttrCol.Contains(colName))
                    {
                        wherePred += Environment.NewLine + $@"{colName} = -1 OR";
                        casePred += Environment.NewLine + $@"WHEN {colName} = -1 THEN '{csvCol}'";
                    }
                }

                string query = $"SELECT NumRow," + Environment.NewLine +
                               $"CASE {casePred} END as ErrCol" + Environment.NewLine +
                               $"FROM {mBuilder.QuoteIdentifier(mappedTempTabViewName)}" + Environment.NewLine +
                               $"WHERE {wherePred.Substring(0, wherePred.Length - 3)}";

                string qq = mDataStore.GetPagedQuery(query, "NumRow", 0, maxNumErr + 10, false);

                DataTable dtRef = mDataStore.GetTable(qq);
                if (dtRef.Rows.Count > 0)
                {
                    //phisically deletes from the temp table rows with wrong references
                    foreach (DataRow row in dtRef.Rows)
                    {
                        warnDict.Add(row["NumRow"].ToString() + ":" + row["ErrCol"].ToString(), "FILE_IMPORT_WRONG_CROSS_REF");
                        row.Delete();

                        if (warnDict.Count > maxNumErr)
                        {
                            throw new FormatException("Maximum number of rows with errors reached");
                        }
                    }

                    dtRef.TableName = tableName;
                    dtRef.PrimaryKey = new DataColumn[] { dtRef.Columns["NumRow"] };
                    mDataStore.UpdateChanges(dtRef);
                }
            }
            catch (FormatException ex)
            {
                Exception e = Utility.Utils.getCustomException("IMPORT_DATA_MAX_NUM_WRONG_ROWS",
                   @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - " + ex.Message, Infrastructure.STLogging.Interface.LogLevelEnum.Error);
                e.Data.Add("Report", warnDict);
                throw e;
            }
            catch (Exception ex)
            {
                throw Utility.Utils.getCustomException("IMPORT_DATA_CHECKING_WRONG_CROSS_REF",
                   @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - " + ex.Message, Infrastructure.STLogging.Interface.LogLevelEnum.Error);
            }
        }

        /// <summary>
        /// Logs and deletes from temp table rows with wrong references to the coded measure.
        /// </summary>
        /// <param name="warnDict">dictionary of warnings</param>
        /// <param name="cube">the cube where data are being loaded</param>
        /// <param name="mapp">mapping for the cube. It is NULL if we are importing a SDMX-ML file.</param>
        /// <param name="tableName">the table to be analyzed</param>
        /// <param name="mappedTempTabViewName">temp view containing series to be loaded</param>
        private void getWrongCodedObsValue(ref Dictionary<string, string> warnDict, CubeWithDetails cube, MappingWithComponents mapp, string tableName, string mappedTempTabViewName)
        {
            try
            {              
                string q = $"SELECT NumRow" + Environment.NewLine +
                               $"FROM {mBuilder.QuoteIdentifier(mappedTempTabViewName)} m" + Environment.NewLine +
                               $"LEFT JOIN TEMP_{cube.IDCube}_OBS_VALUE tmp on m.OBS_VALUE = tmp.Code " + Environment.NewLine +
                               $"WHERE tmp.Code is null";

                DataTable dtRef = mDataStore.GetTable(q);
                if (dtRef.Rows.Count > 0)
                {
                    //phisically deletes from the temp table rows with wrong references
                    foreach (DataRow row in dtRef.Rows)
                    {
                        warnDict.Add(row["NumRow"].ToString(), "FILE_IMPORT_WRONG_CODED_OBS_VALUE");
                        row.Delete();

                        if (warnDict.Count > maxNumErr)
                        {
                            throw new FormatException("Maximum number of rows with errors reached");
                        }
                    }

                    dtRef.TableName = tableName;
                    dtRef.PrimaryKey = new DataColumn[] { dtRef.Columns["NumRow"] };
                    mDataStore.UpdateChanges(dtRef);
                }
            }
            catch (FormatException ex)
            {
                Exception e = Utility.Utils.getCustomException("IMPORT_DATA_MAX_NUM_WRONG_ROWS",
                   @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - " + ex.Message, Infrastructure.STLogging.Interface.LogLevelEnum.Error);
                e.Data.Add("Report", warnDict);
                throw e;
            }
            catch (Exception ex)
            {
                throw Utility.Utils.getCustomException("IMPORT_DATA_CHECKING_CODED_OBS_VALUE",
                   @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - " + ex.Message, Infrastructure.STLogging.Interface.LogLevelEnum.Error);
            }
        }

        #endregion metodi check errori in CSV

        /// <summary>
        /// Performs the loading of the series of the temp table into the FiltS table based on the mapping given as parameter.
        /// </summary>
        /// <param name="seriesViewName">temp view containing only series to be loaded</param>
        /// <param name="cube">the cube where data are being loaded</param>
        /// <param name="mapp">Mapping for the cube. It is NULL if we are importing a SDMX-ML file.</param>
        /// <returns>The number of inserted series in case of success, otherwise an exception is thrown.</returns>
        private int loadSeries(string seriesViewName, CubeWithDetails cube, MappingWithComponents mapp)
        {
            int maxSid = int.MaxValue;

            try
            {
                //columns that are key in FiltS table: dimensions + (optional) tid column
                List<string> keyCols = cube.Dimensions.Select(c => c.ColName).ToList();
                string tidCol = cube.Attributes.Where(a => a.IsTid).Select(x => x.ColName).SingleOrDefault();
                if (tidCol != null)
                    keyCols.Add(tidCol);

                List<string> attCols = cube.Attributes.Select(c => c.ColName).ToList();

                //list of not-mapped columns (possible only for attributes)
                List<string> notMappedCols = new List<string>();

                if (mapp != null)
                {
                    List<string> mappedAtts = mapp.Components
                                                  .Where(a => a.CubeComponentType == CubeComponentTypeEnum.Attribute)
                                                  .Select(x => x.CubeComponentCode).ToList();

                    notMappedCols = cube.Attributes
                                        .Where(a => !mappedAtts.Contains(a.Code) && !a.IsTid)
                                        .Select(c => c.ColName).ToList();
                }

                //inserts data into FiltS table
                Dictionary<string, ColumnDefinition> dic = mDataStore.GetTableDefinition($"FiltS{cube.IDCube}");

                DataTable dtNum = mDataStore.GetTable($"SELECT COUNT(*) as NUM, max(SID) as MAX_SID FROM FiltS{cube.IDCube}");
                int initRows = int.Parse(dtNum.Rows[0]["NUM"].ToString());
                maxSid = DBNull.Value.Equals(dtNum.Rows[0]["MAX_SID"]) ? 0 : int.Parse(dtNum.Rows[0]["MAX_SID"].ToString());

                string insPred = "", joinPred = "", selPred = "", attrPred = "", selRB = "";

                for (int i = 0; i < dic.Keys.Count; i++)
                {
                    string colName = dic.Keys.ToArray()[i];
                    if (colName != "SID" && colName != "CALC_COL" && !notMappedCols.Contains(colName))
                    {
                        selPred += $"[{colName}], ";
                        insPred += $"tmp.[{colName}], ";

                        if (keyCols.Contains(colName))
                            joinPred += $"tmp.[{colName}] = f.[{colName}] AND ";
                    }

                    if (attCols.Contains(colName) && !notMappedCols.Contains(colName))
                    {
                        attrPred += $"(tmp.[{colName}] != f.[{colName}] OR (tmp.[{colName}] IS NULL AND f.[{colName}] IS NOT NULL) OR (tmp.[{colName}] IS NOT NULL AND f.[{colName}] IS NULL)) OR ";
                        selRB += $"f.[{colName}], ";
                    }
                }

                selPred = selPred.Substring(0, selPred.Length - 2);
                insPred = insPred.Substring(0, insPred.Length - 2);
                joinPred = joinPred.Substring(0, joinPred.Length - 5);


                //updates attributes for series (ref. mail 27/11/18)
                if (attrPred.Length > 0 && initRows > 0)
                {
                    attrPred = attrPred.Substring(0, attrPred.Length - 4);
                    selRB = "[SID], " + selRB.Substring(0, selRB.Length - 2);

                    string qUpd = $"SELECT {insPred}" + Environment.NewLine +
                              $"FROM {mBuilder.QuoteIdentifier(seriesViewName)} tmp" + Environment.NewLine +
                              $"LEFT JOIN FiltS{cube.IDCube} f ON {joinPred}" + Environment.NewLine +
                              $"WHERE f.SID is not NULL AND ({attrPred})";

                    DataTable dtUpd = mDataStore.GetTable(qUpd);

                    if (dtUpd.Rows.Count > 0)
                    {
                        string qRB = $"SELECT {selRB} INTO [TMP_ATT_RB_{cube.IDCube}]" + Environment.NewLine +
                                     $"FROM {mBuilder.QuoteIdentifier(seriesViewName)} tmp" + Environment.NewLine +
                                     $"LEFT JOIN FiltS{cube.IDCube} f ON {joinPred}" + Environment.NewLine +
                                     $"WHERE f.SID is not NULL AND ({attrPred})";

                        //rollback table
                        if (mDataStore.ExistsTable($"TMP_ATT_RB_{cube.IDCube}"))
                            mDataStore.ExecuteCommand($"DROP TABLE [TMP_ATT_RB_{cube.IDCube}]");
                        mDataStore.ExecuteCommand(qRB);

                        //sets rows' state to Updated
                        foreach (DataRow dr in dtUpd.Rows)
                            dr[0] = dr[0];

                        dtUpd.PrimaryKey = dtUpd.Columns.Cast<DataColumn>().Where(x => keyCols.Contains(x.ColumnName)).ToArray();
                        dtUpd.TableName = "FiltS" + cube.IDCube;
                        mDataStore.UpdateChanges(dtUpd);
                    }
                }

                //inserts new series
                string qIns = $"{insPred}" + Environment.NewLine +
                              $"FROM {mBuilder.QuoteIdentifier(seriesViewName)} tmp" + Environment.NewLine +
                              $"LEFT JOIN FiltS{cube.IDCube} f ON {joinPred}" + Environment.NewLine +
                              $"WHERE f.SID is NULL";

                DataTable dtCount = mDataStore.GetTable($"SELECT COUNT(*) AS CNT FROM (SELECT " + qIns + ") q");
                int totCount = int.Parse(dtCount.Rows[0]["CNT"].ToString());

                int page = 0;

                //paged insert
                while (page * pageSize < totCount)
                {
                    //always first page as I am executing a left join!
                    //string qq = mDataStore.GetPagedQuery(qIns, selPred, 0, pageSize, false, selPred);
                    string qIns2 = $"INSERT INTO FiltS{cube.IDCube}({selPred})" + Environment.NewLine +
                                   $"SELECT TOP {pageSize} {qIns}";

                    mDataStore.ExecuteCommand(qIns2);
                    page++;
                }

                return totCount;
            }
            catch (Exception ex)
            {
                STLoggerFactory.Logger.Log(@"Starting Rollback for Data...", Infrastructure.STLogging.Interface.LogLevelEnum.Info);

                mDataStore.ExecuteCommand($"DELETE FROM FiltS{cube.IDCube} WHERE SID > {maxSid};");

                throw Utility.Utils.getCustomException("IMPORT_DATA_LOADING_SERIES",
                   @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - " + ex.Message, Infrastructure.STLogging.Interface.LogLevelEnum.Error);
            }
        }

        /// <summary>
        /// Executes rollback of attributes at Dimension or DimensionGroup attachment level stored in FiltS table
        /// </summary>
        /// <param name="idCube">Id of the cube</param>
        /// <param name="numSeriesToDel">The number of series to be deleted</param>
        private void rollBackFiltAttributes(int idCube, int numSeriesToDel)
        {
            string tbName = $"TMP_ATT_RB_{idCube}";

            try
            {
                mDataStore.BeginTransaction();

                //deleting records and series inserted
                string qSel = $"SELECT TOP({numSeriesToDel}) SID FROM FiltS{idCube} ORDER BY SID DESC";
                string q1 = $"DELETE FROM FactS_TEMP_{idCube} WHERE SID IN ({qSel})";
                string q2 = $"DELETE FROM FiltS{idCube} WHERE SID IN ({qSel})";

                mDataStore.ExecuteCommand(q1);
                mDataStore.ExecuteCommand(q2);

                if (mDataStore.ExistsTable(tbName))
                {
                    string setPred = "";

                    DataTable dtMet = mDataStore.GetTableMetadata(tbName);
                    List<string> cols = dtMet.AsEnumerable().Select(row => row["FIELD_NAME"].ToString()).ToList();

                    foreach (string col in cols)
                    {
                        if (col != "SID")
                            setPred += $"[{col}] = tmp.[{col}], ";
                    }

                    string q = $"UPDATE f" + Environment.NewLine +
                                $"SET {setPred.Substring(0, setPred.Length - 2)}" + Environment.NewLine +
                                $"FROM FiltS{idCube} f" + Environment.NewLine +
                                $"INNER JOIN {tbName} tmp on f.SID = tmp.SID";

                    mDataStore.ExecuteCommand(q);
                    mDataStore.ExecuteCommand($"DROP TABLE {tbName}");
                }
                mDataStore.CommitTransaction();
            }
            catch (Exception e)
            {
                mDataStore.RollbackTransaction();
                throw e;
            }
        }

        /// <summary>
        /// Checks attributes stored on Filt table. If an attribute is not coherent an exception is thrown
        /// </summary>
        /// <param name="cube">The cube to be checked</param>
        private void checkFiltAtts(CubeWithDetails cube)
        {
            try
            {
                List<Attribute> atts = cube.Attributes.Where(a => a.AttachmentLevel == AttachmentLevel.Series || a.AttachmentLevel == AttachmentLevel.Group).ToList();
                if (atts.Count > 0)
                {
                    //creating TEMP view on FactS_TEMP
                    string view = mDataStore.GetViewDefinition($"Dataset_{cube.IDCube}_ViewCurrentData");
                    view = view.Replace("FactS", "FactS_TEMP_").Replace("_ViewCurrentData", "_TEMP_ViewCurrentData");
                    mDataStore.ExecuteCommand(view);

                    foreach (Attribute a in atts)
                    {
                        string q = $"SELECT d.ColName FROM CatAttDim ad INNER JOIN CatDim d ON ad.IDDim = d.IDDim WHERE ad.IDAtt = {a.IDAtt}";
                        DataTable dt = mDataStore.GetTable(q);
                        if (dt.Rows.Count > 0)
                        {
                            string dim = "";
                            foreach (DataRow dr in dt.Rows)
                            {
                                dim += dr["ColName"].ToString() + ", ";
                            }

                            //check if the cube has tid
                            DataTable dtMet = mDataStore.GetTableMetadata($"Dataset_{cube.IDCube}_ViewCurrentData");
                            List<string> cols = dtMet.AsEnumerable().Select(row => row["FIELD_NAME"].ToString()).ToList();
                            if (cols.Contains("ID_TID"))
                                dim += "ID_TID, ";

                            dim = dim.Substring(0, dim.Length - 2);

                            //performs group by on the dimension defined for the attribute
                            string qAtt = $"SELECT {dim}, COUNT(DISTINCT({a.ColName})) AS N FROM {$"Dataset_{cube.IDCube}_TEMP_ViewCurrentData"} GROUP BY {dim}";
                            DataTable dt2 = mDataStore.GetTable(qAtt);
                            if (dt2.Rows.Count > 0)
                            {
                                foreach (DataRow dr in dt2.Rows)
                                {
                                    //if there are more than 1 record an exception is thrown
                                    if (int.Parse(dr["N"].ToString()) != 1)
                                    {
                                        throw new FormatException($"Attribute {a.Code} is not coherent with its attachment level");
                                    }
                                }
                            }
                        }
                    }
                }
            }
            finally
            {
                if (mDataStore.ExistsView($"Dataset_{cube.IDCube}_TEMP_ViewCurrentData"))
                    mDataStore.ExecuteCommand($"DROP VIEW Dataset_{cube.IDCube}_TEMP_ViewCurrentData");
            }
        }

        /// <summary>
        /// Performs the loading of dataset level attributes into the AttDsLev table based on the mapping given as parameter.
        /// TO DO: No SQL STANDARD!!
        /// </summary>
        /// <param name="seriesViewName">temp view containing only series to be loaded</param>
        /// <param name="cube">the cube where data are being loaded</param>
        private void loadDsLevAtts(string seriesViewName, CubeWithDetails cube)
        {
            try
            {
                //colNames in seriesView
                List<string> cols = mDataStore.GetTableDefinition(seriesViewName).Values.Select(x => x.ColumnName).ToList();

                //getting Dataset Level attributes
                List<Attribute> dsLevAtts = cube.Attributes.Where(a => !a.IsTid && a.AttachmentLevel == AttachmentLevel.Dataset && cols.Contains(a.ColName)).ToList();
                if (dsLevAtts.Count <= 0)
                    return;

                string tidValue = null;
                bool hasTid = cube.Attributes.AsEnumerable().Where(c => c.IsTid).ToArray().Length > 0;
                if (hasTid)
                {
                    DataTable dt = mDataStore.GetTable($"SELECT TOP 1 ID_TID as TID FROM {seriesViewName} s WHERE ID_TID is not NULL");
                    tidValue = dt.Rows[0]["TID"].ToString();
                }

                string insPred = $"INSERT INTO AttDsLev{cube.IDCube}(ID_TID, ", valPred = "VALUES(" + (tidValue == null ? "NULL, " : $"{tidValue}, ");

                bool found = false;
                //gets values for Dataset Level attributes
                foreach (Attribute a in dsLevAtts)
                {
                    DataTable dt = mDataStore.GetTable($"SELECT DISTINCT TOP 2 {a.ColName} FROM {seriesViewName} WHERE {a.ColName} is not NULL");
                    if (dt.Rows.Count != 0)
                    {
                        found = true;
                        //dataset level attribute with multiple value
                        if (dt.Rows.Count > 1)
                        {
                            throw new Exception();
                        }

                        insPred += a.ColName + ", ";
                        valPred += dt.Rows[0][a.ColName].ToString() + ", ";
                    }
                }

                if (found)
                {
                    //delets old values for the attributes if exist
                    mDataStore.ExecuteCommand($"DELETE FROM AttDsLev{cube.IDCube} WHERE ID_TID " + (tidValue == null ? "is null" : $"= {tidValue}"));

                    //inserts new record
                    insPred = insPred.Substring(0, insPred.Length - 2) + ")";
                    valPred = valPred.Substring(0, valPred.Length - 2) + ")";
                    mDataStore.ExecuteCommand($"{insPred} {valPred}");
                }
            }
            catch (Exception ex)
            {
                throw Utility.Utils.getCustomException("IMPORT_DS_LEV_ATTRIBUTES",
                   @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - " + ex.Message, Infrastructure.STLogging.Interface.LogLevelEnum.Error);
            }
        }

        /// <summary>
        /// Performs the loading of the data of the temp table into the FactS_TEMP table based on the mapping given as parameter.
        /// </summary>
        /// <param name="tableName">the temp table containing the data to be loaded</param>
        /// <param name="mappedTempTabViewName">Vista temporanea contenente i valori della tabella temporanea mappati sulle chiavi.</param>
        /// <param name="cube">the cube where data are being loaded</param>
        /// <returns>The number of inserted records in case of success, otherwise an exception is thrown.</returns>
        private int loadData(string tableName, string mappedTempTabViewName, CubeWithDetails cube)
        {
            string timeCol = null;
            string myDateTime = mDataStore.GetDateTextRepresentation(DateTime.Now);

            try
            {
                Dictionary<string, ColumnDefinition> dtMapped = mDataStore.GetTableDefinition(mappedTempTabViewName);

                //columns for the join
                List<string> joinCols = cube.Dimensions.AsEnumerable().Where(c => !c.IsTimeSeriesDim).Select(x => x.ColName).ToList();
                string tidCol = cube.Attributes.AsEnumerable().Where(c => c.IsTid).Select(x => x.ColName).SingleOrDefault();
                if (tidCol != null)
                    joinCols.Add(tidCol);

                List<string> attrCols = cube.Attributes.AsEnumerable()
                                                       .Where(a => a.AttachmentLevel != AttachmentLevel.Observation)
                                                       .Select(x => x.ColName).ToList();

                string insPred = "", selPred = "", joinPred = "";

                for (int i = 0; i < dtMapped.Values.Count; i++)
                {
                    string colName = dtMapped.Values.ElementAt(i).ColumnName;

                    if (joinCols.Contains(colName))
                        joinPred += $"v.[{colName}] = f.[{colName}] AND ";
                    else if (colName != "NumRow" && !attrCols.Contains(colName))
                    {
                        insPred += $"[{colName}], ";
                        selPred += $"v.[{colName}], ";
                    }
                }

                timeCol = cube.Dimensions
                                    .AsEnumerable()
                                    .Where(d => d.IsTimeSeriesDim)
                                    .Select(x => x.ColName).SingleOrDefault();

                insPred = insPred.Substring(0, insPred.Length - 2);
                selPred = selPred.Substring(0, selPred.Length - 2);
                joinPred = joinPred.Substring(0, joinPred.Length - 5);

                //rows to be deleted (those that have the key <SID, TimePeriod> already present in the Fact table) 
                //TODO: performance: se risultato join è troppo grosso si potrebbe fare più join usando la funzione modulo
                string qDel = $"DELETE fa" + Environment.NewLine +
                              $"FROM {mBuilder.QuoteIdentifier(mappedTempTabViewName)} v" + Environment.NewLine +
                              $"INNER JOIN FiltS{cube.IDCube} f ON {joinPred}" + Environment.NewLine +
                              $"INNER JOIN FactS_TEMP_{cube.IDCube} fa ON f.SID = fa.SID";
                if (timeCol != null)
                    qDel += $" AND v.[{timeCol}] = fa.[{timeCol}]";

                //new data
                string qIns = $"SELECT f.SID, {mDataStore.GetCurrentDateExpression()} as InsertDate, {selPred}" + Environment.NewLine +
                              $"FROM {mBuilder.QuoteIdentifier(mappedTempTabViewName)} v" + Environment.NewLine +
                              $"INNER JOIN FiltS{cube.IDCube} f ON {joinPred}";

                //number of inserted rows
                string qCount = $"SELECT COUNT(*) AS CNT FROM {mappedTempTabViewName}";

                DataTable dtCount = mDataStore.GetTable(qCount);
                int totCount = int.Parse(dtCount.Rows[0]["CNT"].ToString());

                //int page = 0;

                string ordCol = "SID";
                if (timeCol != null) ordCol += ", " + timeCol;

                //executing Delete
                mDataStore.ExecuteCommand(qDel);

                //paged insert
                /*while (page * pageSize < totCount)
                {
                    string qq = mDataStore.GetPagedQuery(qIns, ordCol, page, pageSize, false, $"SID, InsertDate, {insPred}");
                    string qIns2 = $"INSERT INTO FactS_TEMP_{cube.IDCube}(SID, InsertDate, {insPred})" + Environment.NewLine +
                                   $"{qq}";

                    mDataStore.ExecuteCommand(qIns2);
                    page++;
                }*/

                string qIns2 = $"INSERT INTO FactS_TEMP_{cube.IDCube}(SID, InsertDate, {insPred})" + Environment.NewLine +
                                   $"{qIns}";
                mDataStore.ExecuteCommand(qIns2);

                return totCount;
            }
            catch (Exception ex)
            {
                throw Utility.Utils.getCustomException("IMPORT_DATA_LOADING_DATA",
                   @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - " + ex.Message, Infrastructure.STLogging.Interface.LogLevelEnum.Error);
            }
        }

        /// <summary>
        /// Creates a temporary view for series loading.
        /// </summary>
        /// <param name="cube">the cube where data are being loaded</param>
        /// <param name="mapp">Mapping for the cube. It is NULL if we are importing a SDMX-ML file.</param>
        /// <param name="mappedTempTabViewName">Temp table containing temp table values mapped on keys</param>
        /// <returns>The name of the temp view created.</returns>
        private string createSeriesView(CubeWithDetails cube, MappingWithComponents mapp, string mappedTempTabViewName)
        {
            try
            {
                //non temporal dimensions
                List<string> keyCols = cube.Dimensions
                                           .Where(c => !c.IsTimeSeriesDim)
                                           .Select(x => x.ColName).ToList();

                //mapped attributes
                List<string> mappedAtts = new List<string>();

                if (mapp != null)
                {
                    mappedAtts = mapp.Components
                                     .Where(a => a.CubeComponentType == CubeComponentTypeEnum.Attribute)
                                     .Select(x => x.CubeComponentCode).ToList();

                    //mapped attributes with Attachment Level different from Observation
                    keyCols.AddRange(cube.Attributes
                                         .Where(a => a.AttachmentLevel != AttachmentLevel.Observation && (mappedAtts.Contains(a.Code) || a.IsTid))
                                         .Select(x => x.ColName).ToList());
                }
                else
                {
                    //mapped attributes with Attachment Level different from Observation
                    keyCols.AddRange(cube.Attributes
                                         .Where(a => a.AttachmentLevel != AttachmentLevel.Observation)
                                         .Select(x => x.ColName).ToList());
                }

                //creates a view for distinct series
                string selPred = "";
                foreach (string col in keyCols)
                {
                    selPred += "[" + col + "], ";
                }
                selPred = selPred.Substring(0, selPred.Length - 2);

                string seriesViewName = mDataStore.GetTempViewName();

                string cmdView = $@"CREATE VIEW {mBuilder.QuoteIdentifier(seriesViewName)} AS 
                                    SELECT DISTINCT {selPred}
                                    FROM {mBuilder.QuoteIdentifier(mappedTempTabViewName)}";

                mDataStore.ExecuteCommand(cmdView);

                return seriesViewName;
            }
            catch (Exception ex)
            {
                throw Utility.Utils.getCustomException("IMPORT_DATA_CREATING_SERIES_VIEW",
                   @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - " + ex.Message, Infrastructure.STLogging.Interface.LogLevelEnum.Error);
            }
        }

        /// <summary>
        /// Creates a temp view for loading temp table.
        /// </summary>
        /// <param name="IDCube">the id of the cube where data are being loaded</param>
        /// <param name="IDMapping">Mapping for the cube. It is 0 if we are importing a SDMX-ML file.</param>
        /// <param name="tableName">the temp table containing the data to be loaded.</param>
        /// <param name="hasUserDefinedTid">Whether the cube has a user-defined tid or not.</param>
        /// <returns>The name of the temp view created.</returns>
        private string createMappedTempTabView(int IDCube, int IDMapping, string tableName, bool hasUserDefinedTid)
        {
            try
            {
                string q = "";

                STKeyValuePair[] parameters = new STKeyValuePair[] { new STKeyValuePair("IDCube", IDCube), new STKeyValuePair("IDMapping", IDMapping) };

                if (IDMapping != 0)
                {
                    q = $@" SELECT comp.ColumnName, dim.MemberTable, dim.ColName, NULL as IsAlphanumeric, 1 as IsMandatory, dim.CodelistCode, CubeComponentType
                        FROM ComponentMapping comp
                        INNER JOIN CatDim dim on comp.CubeComponentCode = dim.Code
                        WHERE IDMapping = @IDMapping AND dim.IDCube = @IDCube AND CubeComponentType IN ('Dimension', 'TimeDimension')
                        UNION
                        SELECT comp.ColumnName, att.MemberTable, att.ColName, NULL as IsAlphanumeric, att.IsMandatory, att.CodelistCode, CubeComponentType
                        FROM ComponentMapping comp
                        INNER JOIN CatAtt att on comp.CubeComponentCode = att.Code
                        WHERE IDMapping = @IDMapping AND att.IDCube = @IDCube AND CubeComponentType = 'Attribute'
                        UNION
                        SELECT comp.ColumnName, NULL as MemberTable, meas.ColName, meas.IsAlphanumeric, 1 as IsMandatory, NULL, CubeComponentType
                        FROM ComponentMapping comp
                        INNER JOIN CatMeas meas on comp.CubeComponentCode = meas.Code
                        WHERE IDMapping = @IDMapping AND meas.IDCube = @IDCube AND CubeComponentType = 'Measure'";
                }
                else
                {
                    q = $@" SELECT dim.Code as ColumnName, dim.MemberTable, dim.ColName, NULL as IsAlphanumeric, 1 as IsMandatory, dim.CodelistCode,
                                   CASE WHEN IsTimeSeriesDim = 1 then 'TimeDimension' else 'Dimension' END as CubeComponentType
                        FROM CatDim dim
                        WHERE dim.IDCube = @IDCube
                        UNION
                        SELECT att.Code as ColumnName, att.MemberTable, att.ColName, NULL as IsAlphanumeric, att.IsMandatory, att.CodelistCode, 'Attribute' as CubeComponentType
                        FROM CatAtt att
                        WHERE att.IDCube = @IDCube and att.IsTid = 0
                        UNION
                        SELECT meas.Code as ColumnName, NULL as MemberTable, meas.ColName, meas.IsAlphanumeric, 1 as IsMandatory, NULL, 'Measure' as CubeComponentType
                        FROM CatMeas meas
                        WHERE meas.IDCube = @IDCube";
                }

                DataTable colDt = mDataStore.GetTable(q, parameters);
                string selPred = "", joinPred = "";

                for (int i = 0; i < colDt.Rows.Count; i++)
                {
                    if (!DBNull.Value.Equals(colDt.Rows[i]["MemberTable"]))
                    {
                        //the only fields that may have NULL values are NOT-mandatory attributes: they are given a -1 value that means WRONG_VALUE
                        if (int.Parse(colDt.Rows[i]["IsMandatory"].ToString()) == 0 && !DBNull.Value.Equals(colDt.Rows[i]["CodelistCode"]))
                        {
                            selPred += Environment.NewLine + $", CASE WHEN tmp.[{colDt.Rows[i]["ColumnName"].ToString()}] IS NOT NULL AND t{i}.IDMember is NULL then -1 ELSE t{i}.IDMember END as [{colDt.Rows[i]["ColName"].ToString()}]";
                        }
                        else
                        {
                            selPred += Environment.NewLine + $", t{i}.IDMember as [{colDt.Rows[i]["ColName"].ToString()}]";
                        }
                        string field = DBNull.Value.Equals(colDt.Rows[i]["CodelistCode"]) && !(colDt.Rows[i]["CubeComponentType"].ToString() == "TimeDimension") ? "Text" : "Code";
                        joinPred += Environment.NewLine + $@"LEFT JOIN [{colDt.Rows[i]["MemberTable"].ToString()}] as t{i} ON tmp.[{colDt.Rows[i]["ColumnName"].ToString()}] = t{i}.{field}";
                    }
                    else //measures must not be mapped and do not have tables to be put in join
                    {
                        string temp = bool.Parse(colDt.Rows[i]["IsAlphanumeric"].ToString()) ?
                            $"tmp.[{ colDt.Rows[i]["ColumnName"].ToString()}]" : $"CAST(tmp.[{ colDt.Rows[i]["ColumnName"].ToString()}] as float)";
                        selPred += $", {temp} as [{colDt.Rows[i]["ColName"].ToString()}]";
                    }
                }

                //if the cube has a user-defined tid a column is added
                if (hasUserDefinedTid)
                {
                    selPred += ", tTid.IDMember AS [ID_TID]";
                    joinPred += Environment.NewLine + "LEFT JOIN [AttTEXT_FREE@SDMX] as tTid ON tmp._TID_ = tTid.Code";
                }

                string viewName = mDataStore.GetTempViewName();

                //NB I use TOP for forcing SQL-SERVER query planner to read all the query results  *** CUSTOM SQL SERVER ***
                string query = $"CREATE VIEW {mBuilder.QuoteIdentifier(viewName)} AS" + Environment.NewLine +
                               $"SELECT TOP 1000000000 NumRow {selPred}" + Environment.NewLine +
                               $"FROM {mBuilder.QuoteIdentifier(tableName)} tmp {joinPred}";// + Environment.NewLine +
                               //$"ORDER BY NumRow";

                mDataStore.ExecuteCommand(query);

                return viewName;
            }
            catch (Exception ex)
            {
                throw Utility.Utils.getCustomException("IMPORT_DATA_CREATING_TEMP_TABLE_VIEW",
                   @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - " + ex.Message, Infrastructure.STLogging.Interface.LogLevelEnum.Error);
            }
        }

        private void CreateColumnStoreIdxOnFilt(string tbName)
        {
            try
            {
                mDataStore.BeginTransaction();
                STLoggerFactory.Logger.Log(@"Creating columnstore index for Filt table...", Infrastructure.STLogging.Interface.LogLevelEnum.Info);

                string pkName = mDataStore.GetPrimaryKeyName(tbName);
                string idxName = "UQ_" + tbName + "_Code";

                mDataStore.ExecuteCommand($"ALTER TABLE {mBuilder.QuoteIdentifier(tbName)} DROP CONSTRAINT {mBuilder.QuoteIdentifier(pkName)}");

                if (mDataStore.ExistsIndex(idxName, tbName))
                    mDataStore.ExecuteCommand($"ALTER TABLE {mBuilder.QuoteIdentifier(tbName)} DROP CONSTRAINT {mBuilder.QuoteIdentifier(idxName)}");

                mDataStore.ExecuteCommand($"CREATE CLUSTERED COLUMNSTORE INDEX [colIdx] ON {mBuilder.QuoteIdentifier(tbName)};");
                mDataStore.CommitTransaction();
            }
            catch (Exception ex)
            {
                mDataStore.RollbackTransaction();
                STLoggerFactory.Logger.Log(ex.StackTrace, Infrastructure.STLogging.Interface.LogLevelEnum.Warn);
                return;
            }
        }

        private void DeleteColumnStoreIdxOnFilt(string tbName, List<string> pkCols)
        {
            try
            {
                mDataStore.BeginTransaction();
                STLoggerFactory.Logger.Log(@"Deleting columnstore index for Filt table...", Infrastructure.STLogging.Interface.LogLevelEnum.Info);

                string pkName = "PK_" + tbName.GetHashCode().ToString("X8");
                string idxName = "UQ_" + tbName + "_Code";

                if (mDataStore.ExistsIndex("colIdx", tbName))
                    mDataStore.ExecuteCommand($"DROP INDEX colIdx ON {mBuilder.QuoteIdentifier(tbName)}");

                //case with more than 16 columns as a key
                if (pkCols.Count > 16)
                {
                    List<DataColumn> keyCol = new List<DataColumn>();

                    //columns for dimensions
                    foreach (string col in pkCols)
                    {
                        keyCol.Add(new DataColumn(col, typeof(int)));
                    }

                    //adds a computed columns with the hash of the concatenation of the cast to string of the columns in the key (with a separator)
                    string cmd = $@"ALTER TABLE {mBuilder.QuoteIdentifier(tbName)} ADD CALC_COL {mDataStore.GetPersistedHashColumnExpression(keyCol.Select(x => x.ColumnName).ToList())} NOT NULL";
                    mDataStore.ExecuteCommand(cmd);
                    //sets the computed column as primary key
                    mDataStore.ExecuteCommand($@"ALTER TABLE {mBuilder.QuoteIdentifier(tbName)} ADD CONSTRAINT {mBuilder.QuoteIdentifier(pkName)} PRIMARY KEY(CALC_COL);");
                }
                else
                {
                    string keyPred = "";
                    foreach (string k in pkCols)
                    {
                        if (k != "ID_TIME_PERIOD")
                            keyPred += mBuilder.QuoteIdentifier(k) + ", ";
                    }

                    mDataStore.ExecuteCommand($@"ALTER TABLE {mBuilder.QuoteIdentifier(tbName)} ADD CONSTRAINT {mBuilder.QuoteIdentifier(pkName)} PRIMARY KEY({keyPred.Substring(0, keyPred.Length - 2)});");
                }

                if (!mDataStore.ExistsIndex(idxName, tbName))
                    mDataStore.ExecuteCommand($@"ALTER TABLE {mBuilder.QuoteIdentifier(tbName)} ADD CONSTRAINT {idxName} UNIQUE(SID);");
                mDataStore.CommitTransaction();
            }
            catch (Exception ex)
            {
                mDataStore.RollbackTransaction();
                STLoggerFactory.Logger.Log(ex.StackTrace, Infrastructure.STLogging.Interface.LogLevelEnum.Warn);
                return;
            }
        }

        private void CreateColumnStoreIdxOnFact(string tbName)
        {
            try
            {
                mDataStore.BeginTransaction();
                STLoggerFactory.Logger.Log(@"Creating columnstore index for Fact table...", Infrastructure.STLogging.Interface.LogLevelEnum.Info);

                string pkName = mDataStore.GetPrimaryKeyName(tbName);
                string fkName = tbName.Replace("Fact", "Filt").Replace("_TEMP_", "") + "_" + tbName + "_FK1";

                mDataStore.ExecuteCommand($"ALTER TABLE {mBuilder.QuoteIdentifier(tbName)} DROP CONSTRAINT {mBuilder.QuoteIdentifier(pkName)}");
                mDataStore.ExecuteCommand($"ALTER TABLE {mBuilder.QuoteIdentifier(tbName)} DROP CONSTRAINT {mBuilder.QuoteIdentifier(fkName)}");

                mDataStore.ExecuteCommand($"CREATE CLUSTERED COLUMNSTORE INDEX [colIdx] ON {mBuilder.QuoteIdentifier(tbName)};");
                mDataStore.CommitTransaction();
            }
            catch (Exception ex)
            {
                mDataStore.RollbackTransaction();
                STLoggerFactory.Logger.Log(ex.StackTrace, Infrastructure.STLogging.Interface.LogLevelEnum.Warn);
                return;
            }
        }

        private void AddIndexesOnFact(string tbName)
        {
            string pkName = "PK_" + tbName.GetHashCode().ToString("X8");
            string fkName = tbName.Replace("Fact", "Filt").Replace("_TEMP_", "") + "_" + tbName + "_FK1";

            DataTable dtMet = mDataStore.GetTableMetadata(tbName);
            List<string> cols = dtMet.AsEnumerable().Select(row => row["FIELD_NAME"].ToString()).ToList();

            string keyPred = $"{mBuilder.QuoteIdentifier("SID")}";
            if (cols.Contains("ID_TIME_PERIOD"))
            {
                keyPred += ", " + mBuilder.QuoteIdentifier("ID_TIME_PERIOD");
            }

            mDataStore.ExecuteCommand($@"ALTER TABLE {mBuilder.QuoteIdentifier(tbName)} ADD CONSTRAINT {mBuilder.QuoteIdentifier(pkName)} PRIMARY KEY({keyPred});");

            mDataStore.ExecuteCommand($@"ALTER TABLE {mBuilder.QuoteIdentifier(tbName)} ADD CONSTRAINT {mBuilder.QuoteIdentifier(fkName)}
                                         FOREIGN KEY (SID)
                                         REFERENCES {mBuilder.QuoteIdentifier(tbName).Replace("Fact", "Filt").Replace("_TEMP_", "")} (SID);");
        }

        private void DeleteColumnStoreIdxOnFact(string tbName)
        {
            try
            {
                mDataStore.BeginTransaction();
                STLoggerFactory.Logger.Log(@"Deleting columnstore index for Fact table...", Infrastructure.STLogging.Interface.LogLevelEnum.Info);

                if (mDataStore.ExistsIndex("colIdx", tbName))
                    mDataStore.ExecuteCommand($"DROP INDEX colIdx ON {mBuilder.QuoteIdentifier(tbName)}");

                AddIndexesOnFact(tbName);

                mDataStore.CommitTransaction();
            }
            catch (Exception ex)
            {
                mDataStore.RollbackTransaction();
                STLoggerFactory.Logger.Log(ex.StackTrace, Infrastructure.STLogging.Interface.LogLevelEnum.Warn);
                return;
            }

        }

        /// <summary>
        /// Switches FactS and FactS_TEMP tables modifying data that can be accessed in production
        /// </summary>
        /// <param name="idCube">Id of the cube</param>
        private void switchFactTables(int idCube)
        {
            try
            {
                string tb1 = $"FactS{idCube}";
                string tb2 = $"FactS_XX_{idCube}";
                string tb3 = $"FactS_TEMP_{idCube}";

                //renaming tables
                mDataStore.ExecuteCommand(mDataStore.RenameTables(tb1, tb2));
                mDataStore.ExecuteCommand(mDataStore.RenameTables(tb3, tb1));
                mDataStore.ExecuteCommand(mDataStore.RenameTables(tb2, tb3));

                //renaming fk relations
                string fk1 = $"FiltS{idCube}_{tb1}_FK1";
                string fk2 = $"FiltS{idCube}_{tb2}_FK1";
                string fk3 = $"FiltS{idCube}_{tb3}_FK1";

                mDataStore.ExecuteCommand(mDataStore.RenameKeys(fk1, fk2));
                mDataStore.ExecuteCommand(mDataStore.RenameKeys(fk3, fk1));
                mDataStore.ExecuteCommand(mDataStore.RenameKeys(fk2, fk3));

                //renaming pk
                string pk1 = mDataStore.GetPrimaryKeyName(tb1);
                string pk3 = mDataStore.GetPrimaryKeyName(tb3);
                string pk2 = $"PK_XX_{tb2}";

                mDataStore.ExecuteCommand(mDataStore.RenameKeys(pk1, pk2));
                mDataStore.ExecuteCommand(mDataStore.RenameKeys(pk3, pk1));
                mDataStore.ExecuteCommand(mDataStore.RenameKeys(pk2, pk3));
            }
            catch (Exception ex)
            {
                throw Utility.Utils.getCustomException("SWITCHING_FACT_TABLES",
                   @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - " + ex.Message, Infrastructure.STLogging.Interface.LogLevelEnum.Error);
            }
        }

        public void StartUploadCube(int cubeId, DateTime startOperation)
        {
            mDataStore.ExecuteCommand($"INSERT INTO UploadOps (IDCube, UploadDate) VALUES ({mDataStore.PARAM_PREFIX}IDCube, {mDataStore.PARAM_PREFIX}UploadDate)", new STKeyValuePair[] { new STKeyValuePair("IDCube", cubeId), new STKeyValuePair("UploadDate", startOperation) });
        }

        public UploadOps StatusUploadCube(int cubeId)
        {
            UploadOps result = null;
            var reader = mDataStore.ExecuteReader($"SELECT * FROM UploadOps WHERE IDCube={mDataStore.PARAM_PREFIX}IDCube ORDER BY UploadDate DESC", new STKeyValuePair[] { new STKeyValuePair("IDCube", cubeId) });
            try
            {
                if (reader.Read())
                {
                    var uploadDate = (DateTime)reader["UploadDate"];
                    if (DateTime.Now <= uploadDate.AddMinutes(timeOutCubeUpload))
                    {
                        result = new UploadOps { IDCube = (int)reader["IDCube"], UploadDate = uploadDate };
                    }
                }
            }
            catch (Exception)
            {
                throw;
            }
            finally
            {
                reader.Close();
            }

            return result;
        }

        public void EndUploadCube(int cubeId, DateTime startOperation)
        {

            mDataStore.ExecuteCommand($"DELETE FROM UploadOps WHERE (IDCube={mDataStore.PARAM_PREFIX}IDCube AND UploadDate={mDataStore.PARAM_PREFIX}UploadDate) OR (UploadDate<{mDataStore.PARAM_PREFIX}UploadDateTimeOut)",
                new STKeyValuePair[] { new STKeyValuePair("IDCube", cubeId),
                                        new STKeyValuePair("UploadDate", startOperation), //Remove current operation
                                        new STKeyValuePair("UploadDateTimeOut", startOperation.AddMinutes(-timeOutCubeUpload)) //Remove timeout operation
                });
        }

        #endregion Metodi Privati
    }
}