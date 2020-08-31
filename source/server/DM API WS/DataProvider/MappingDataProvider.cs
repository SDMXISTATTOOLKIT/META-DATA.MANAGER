using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using Configuration;
using DataStore.Interface;
using DDB.Entities;
using Infrastructure.STLogging.Factory;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Caching.Memory;
using Utility;
using static DataProvider.DDB_NEW;

namespace DataProvider
{
    public class MappingDataProvider : IMappingDataProvider
    {
        #region Private fields

        private IDataStore mDataStore;
        private string mDBSchema;
        SqlCommandBuilder mBuilder;

        private const int maxColSize = 4000;

        #endregion Private fields

        public MappingDataProvider(IDataStore dataStore)
        {
            mDataStore = dataStore;
            mDBSchema = mDataStore.Schema;
            mBuilder = new SqlCommandBuilder();
        }

        public int createDDBMapping(MappingWithComponents mapp)
        {
            //checks the given Mapping: if an error is raised the corrispondent exception is thrown
            checkDDBMapping(mapp, true);

            mDataStore.BeginTransaction();

            try
            {
                MappingDataTable mappDt = new MappingDataTable();
                ComponentMappingDataTable compDt = new ComponentMappingDataTable();

                string timeStmp = mDataStore.GetDateTextRepresentation(DateTime.Now);

                mappDt.Rows.Add(null, mapp.IDCube, mDataStore.GetDateTextRepresentation(DateTime.Now), mapp.Name, mapp.Description, mapp.Tid, 
                    mapp.CSVSeparator, mapp.CSVDelimiter, mapp.HasHeader, mapp.HasSpecialTimePeriod);
                mDataStore.UpdateChanges(mappDt);

                STKeyValuePair[] parameters = new STKeyValuePair[] { new STKeyValuePair("Name", mapp.Name)};

                //gets the database Id for the Mapping
                DataTable dt = mDataStore.GetTable($@"SELECT IDMapping FROM Mapping WHERE Name = @Name ORDER BY TimeStmp desc", parameters);
                int idMapp = int.Parse(dt.Rows[0]["IDMapping"].ToString());

                //inserts Mapping components
                foreach (ComponentMapping comp in mapp.Components)
                {
                    compDt.Rows.Add(null, idMapp, comp.ColumnName, comp.CubeComponentCode, comp.CubeComponentType);
                }
                mDataStore.UpdateChanges(compDt);

                mDataStore.CommitTransaction();
                return idMapp;
            }
            catch (Exception ex)
            {
                mDataStore.RollbackTransaction();
                throw Utility.Utils.getCustomException("MAPPING_CREATE_ERROR",
                   @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - " + ex.Message, Infrastructure.STLogging.Interface.LogLevelEnum.Error);
            }
        }

        public bool deleteDDBMapping(int idMapping)
        {
            STKeyValuePair[] parameters = new STKeyValuePair[] { new STKeyValuePair("IDMapping", idMapping) };

            mDataStore.BeginTransaction();

            try
            {
                //deletes the row corrispondent to the mapping (components are deleted thanks to CASCADE option)
                mDataStore.ExecuteCommand($"DELETE FROM Mapping WHERE IDMapping = @IDMapping", parameters);
            }
            catch (Exception ex)
            {
                mDataStore.RollbackTransaction();
                throw Utility.Utils.getCustomException("MAPPING_DELETE_ERROR",
                   @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - " + ex.Message, Infrastructure.STLogging.Interface.LogLevelEnum.Error);
            }

            mDataStore.CommitTransaction();
            return true;
        }

        public MappingWithComponents getDDBMapping(int idMapping)
        {
            STKeyValuePair[] parameters = new STKeyValuePair[] { new STKeyValuePair("IDMapping", idMapping) };

            DataTable dt1 = mDataStore.GetTable($@"SELECT * FROM Mapping WHERE IDMapping = @IDMapping", parameters);
            DataTable dt2 = mDataStore.GetTable($@"SELECT * FROM ComponentMapping WHERE IDMapping = @IDMapping", parameters);

            if (dt1.Rows.Count == 0)
            {
                throw Utility.Utils.getCustomException("MAPPING_NOT_EXISTENT",
                    @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - Requested mapping is not existent.", Infrastructure.STLogging.Interface.LogLevelEnum.Warn);
            }
            if (dt2.Rows.Count == 0)
            {
                throw Utility.Utils.getCustomException("MAPPING_EMPTY",
                    @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - Requested mapping is empty.", Infrastructure.STLogging.Interface.LogLevelEnum.Warn);
            }

            try
            {
                //executes a cast to typed DataTables
                MappingDataTable tbMapp = new MappingDataTable();
                tbMapp.Merge(dt1, true, MissingSchemaAction.Ignore);

                ComponentMappingDataTable tbComp = new ComponentMappingDataTable();
                tbComp.Merge(dt2, true, MissingSchemaAction.Ignore);

                //adds Mapping's components
                List<ComponentMapping> comps = new List<ComponentMapping>();
                foreach (ComponentMappingRow row in tbComp)
                {
                    comps.Add(new ComponentMapping(row.IDComponent, row.IDMapping, row.ColumnName,
                        row.CubeComponentCode, (CubeComponentTypeEnum)Enum.Parse(typeof(CubeComponentTypeEnum), row.CubeComponentType)));
                }

                MappingWithComponents mwc = new MappingWithComponents(tbMapp[0].IDMapping, tbMapp[0].IDCube, tbMapp[0].Name, tbMapp[0].Description, tbMapp[0].Tid,
                    tbMapp[0].CSVDelimiter, tbMapp[0].CSVSeparator, tbMapp[0].HasHeader, tbMapp[0].HasSpecialTimePeriod, comps);
                checkDDBMapping(mwc, false);
                return mwc;
            }
            catch (Exception ex)
            {
                throw Utility.Utils.getCustomException("MAPPINGS_RETRIEVING_ERROR",
                   @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - " + ex.Message, Infrastructure.STLogging.Interface.LogLevelEnum.Error);
            }
        }

        public List<Mapping> getDDBMappings()
        {
            try
            {
                List<Mapping> mapps = new List<Mapping>();
                DataTable dt1 = mDataStore.GetTable(@"SELECT * FROM Mapping ORDER BY IDMapping ASC");

                if (dt1.Rows.Count == 0)
                    return mapps;

                //executes a cast to typed DataTables
                MappingDataTable tbMapp = new MappingDataTable();
                tbMapp.Merge(dt1, true, MissingSchemaAction.Ignore);

                //creates a Mapping for each row without getting their components
                foreach (MappingRow dr in tbMapp.Rows)
                    mapps.Add(new Mapping(dr.IDMapping, dr.IDCube, dr.Name, dr.Description, dr.Tid, dr.CSVDelimiter, dr.CSVSeparator, dr.HasHeader, dr.HasSpecialTimePeriod));

                return mapps;
            }
            catch (Exception ex)
            {
                throw Utility.Utils.getCustomException("MAPPINGS_RETRIEVING_ERROR",
                   @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - " + ex.Message, Infrastructure.STLogging.Interface.LogLevelEnum.Error);
            }
        }

        public string preloadCSV(char CSVSeparator, char CSVDelimiter, bool hasHeader, string filePath, string tid, IMemoryCache memoryCache, string guidSession, int idMappingSpecialTimePeriod)
        {
            STLoggerFactory.Logger.Log(@"Loading csv in temp table started...", Infrastructure.STLogging.Interface.LogLevelEnum.Info);

            //transactions are managed at application level in order to keep transaction log dimension low
            string tblName = mDataStore.GetTempTableName();

            //checks file's correctness and gets the header
            string[] headers = getCSVHeader(CSVSeparator, CSVDelimiter, hasHeader, filePath);

            try
            {
                DataTable dt = new DataTable();

                //creates the columns and adds a new primary key column with row number
                DataColumn dc = dt.Columns.Add("NumRow", typeof(int));
                dc.AllowDBNull = false;

                foreach (string header in headers)
                {
                    dt.Columns.Add(header, typeof(string));
                    dt.Columns[header].MaxLength = maxColSize;
                }

                dt.PrimaryKey = new DataColumn[] { dc };

                //creats TID column if requested
                if (tid != null)
                {
                    dt.Columns.Add("_TID_", typeof(string));
                    dt.Columns["_TID_"].MaxLength = maxColSize;
                }

                //creats _FREQ_ column if requested
                if (idMappingSpecialTimePeriod != 0)
                {
                    dt.Columns.Add("_FREQ_", typeof(string));
                    dt.Columns["_FREQ_"].MaxLength = maxColSize;
                }

                //creates temp table
                dt.TableName = tblName;
                string createQuery = mDataStore.GetTableScript(dt, tblName);
                mDataStore.ExecuteCommand(createQuery);

                //loads rows
                int blockSize = int.Parse(ConfigurationManager.AppSettings["DMApiSettings:MAX_BLOCK_SIZE"]);

                using (StreamReader sr = new StreamReader(filePath, Utils.GetFileEncoding(filePath)))
                {
                    //if header is present, first row is skipped
                    if (hasHeader)
                        sr.ReadLine();

                    //number of inserted rows
                    int ins = 0;

                    MappingWithComponents mapp = null;
                    if (idMappingSpecialTimePeriod > 0)
                        mapp = getDDBMapping(idMappingSpecialTimePeriod);


                    while (!sr.EndOfStream)
                    {
                        var csvLine = sr.ReadLine();
                        string[] rows;
                        if (!CSVDelimiter.Equals(default(char)))
                        {
                            rows = Utils.CsvParser(csvLine, CSVDelimiter, CSVSeparator);
                        }
                        else
                        {
                            rows = csvLine.Split(CSVSeparator);
                        }


                        DataRow dr = dt.NewRow();
                        ins++;
                        dr[0] = ins + (hasHeader ? 1 : 0);

                        float res;

                        for (int i = 0; i < headers.Length; i++)
                        {
                            dr[i + 1] = (rows[i] == "" || rows[i] == " " || rows[i] == "NaN") ? null :
                                float.TryParse(rows[i], NumberStyles.Any, CultureInfo.GetCultureInfo("it-IT"), out res) ? rows[i].Replace(",", ".") : rows[i];
                        }

                        //sets _TID_ value if needed
                        if (tid != null)
                            dr[dr.Table.Columns["_TID_"].Ordinal] = tid;

                        //sets _FREQ_ and TIME_PERIOD values if needed
                        if(mapp != null)
                        {
                            //gets TIME_PERIOD column position
                            string colName = mapp.Components.Where(x => x.CubeComponentType == CubeComponentTypeEnum.TimeDimension).Select(y => y.ColumnName).SingleOrDefault();
                            if (colName == null)
                            {
                                STLoggerFactory.Logger.Log(@"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - .STAT files must have a Time Dimension"
                                                , Infrastructure.STLogging.Interface.LogLevelEnum.Error);
                                throw new Exception();
                            }
                            int timePos = Array.IndexOf(headers, colName);

                            //checks format 2001 -> <A, 2001> or 2001M1 -> <M, 2001-01> or 2001Q1 -> <Q, 2001-Q1> or 2001S1 -> <S, 2001-S1>
                            try
                            {
                                string val = rows[timePos];
                                TranscodeTime tt = new TranscodeTime();

                                //gets frequency
                                string freq = tt.GetFreqFromTimePeriod(val);

                                //gets TIME_PERIOD
                                string timePer = tt.TranscodeTimePeriod(val);

                                dr[timePos + 1] = timePer;
                                dr[dr.Table.Columns["_FREQ_"].Ordinal] = freq;

                            }
                            catch(Exception ex)
                            {
                                STLoggerFactory.Logger.Log(@"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - .STAT file with invalid format. - " + ex.Message
                                                , Infrastructure.STLogging.Interface.LogLevelEnum.Error);
                                throw new Exception();
                            }
                        }

                        dt.Rows.Add(dr);

                        //inserts rows in blocks
                        if (dt.Rows.Count == blockSize)
                        {
                            mDataStore.UpdateChanges(dt);
                            dt.Clear();
                        }
                    }
                }

                //inserts remaining rows
                if (dt.Rows.Count > 0)
                {
                    mDataStore.UpdateChanges(dt);
                    dt.Clear();
                }

                if (memoryCache != null)
                {
                    var result = memoryCache.GetOrCreate(tblName, entry =>
                    {
                        entry.SetSlidingExpiration(TimeSpan.FromMinutes(120));
                        entry.RegisterPostEvictionCallback((object key, object value, EvictionReason reason, object state) =>
                        {
                            if (mDataStore.ExistsTable(tblName))
                                mDataStore.ExecuteCommand($"DROP TABLE {mBuilder.QuoteIdentifier(tblName)}");
                        });
                        return true;
                    });
                }

                DateTime c = System.DateTime.Now;
                return tblName;
            }
            catch (Exception ex)
            {
                //delets temp table
                if (mDataStore.ExistsTable(tblName))
                    mDataStore.ExecuteCommand($"DROP TABLE {mBuilder.QuoteIdentifier(tblName)}");

                throw Utility.Utils.getCustomException("CSV_PRELOAD",
                   @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - " + ex.Message, Infrastructure.STLogging.Interface.LogLevelEnum.Error);
            }
        }

        public string[] getCSVHeader(char CSVSeparator, char CSVDelimiter, bool hasHeader, string filePath)
        {
            try
            {
                //checks file's format correctness
                //checkFileFormat(file, true);
                
                using (StreamReader sr = new StreamReader(filePath, Utils.GetFileEncoding(filePath)))
                {
                    if (hasHeader)
                    {
                        var csvLine = sr.ReadLine();
                        string[] header;
                        
                        if (!CSVDelimiter.Equals(default(char)))
                        {
                            header = Utils.CsvParser(csvLine, CSVDelimiter, CSVSeparator);
                        }
                        else
                        {
                            header = csvLine.Split(CSVSeparator);
                        }

                        List<string> results = new List<string>();

                        foreach (string s in header)
                        {
                            if (s.Contains(" "))
                            {
                                STLoggerFactory.Logger.Log(@"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - Columns' names cannot contain spaces."
                                    , Infrastructure.STLogging.Interface.LogLevelEnum.Error);
                                throw new Exception();
                            }

                            if (results.Contains(s))
                            {
                                STLoggerFactory.Logger.Log(@"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - Columns' names must be unique."
                                    , Infrastructure.STLogging.Interface.LogLevelEnum.Error);
                                throw new Exception();
                            }

                            results.Add(s);
                        }

                        return results.ToArray();
                    }
                    else
                    {
                        var csvLine = sr.ReadLine();
                        string[] headers;

                        if (!CSVDelimiter.Equals(default(char)))
                        {
                            headers = Utils.CsvParser(csvLine, CSVDelimiter, CSVSeparator);
                        }
                        else
                        {
                            headers = csvLine.Split(CSVSeparator);
                        }

                        for (int i = 0; i < headers.Length; i++)
                            headers[i] = "Col_" + i;
                        return headers;
                    }
                }
            }
            catch (Exception ex)
            {
                throw Utility.Utils.getCustomException("CSV_HEADER_RETRIEVING_ERROR",
                   @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - " + ex.Message, Infrastructure.STLogging.Interface.LogLevelEnum.Error);
            }
        }

        #region Private methods

        /// <summary>
        /// Checks the given Mapping's correctness
        /// </summary>
        /// <param name="mapp">The mapping to be verified.</param>
        /// <param name="checkName">Whether to check mapping's name uniqueness or not.</param>
        /// <returns>True in case of success, otherwise an exception is thrown.</returns>
        private bool checkDDBMapping(MappingWithComponents mapp, bool checkName)
        {
            STKeyValuePair[] parameters = new STKeyValuePair[] { new STKeyValuePair("Name", mapp.Name) };

            //checks the chosen name is not already in use
            if (checkName)
            {
                DataTable tb1 = mDataStore.GetTable($@"SELECT IDMapping FROM Mapping WHERE Name = @Name", parameters);
                if (tb1.Rows.Count != 0)
                {
                    throw Utility.Utils.getCustomException("MAPPING_CREATE_DUPLICATED_NAME",
                        @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - Mapping name is already in use.", Infrastructure.STLogging.Interface.LogLevelEnum.Warn);
                }
            }

            //checks the mapping is not empty
            if (mapp.Components.Count == 0)
            {
                throw Utility.Utils.getCustomException("MAPPING_EMPTY",
                    @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - Mapping cannot be empty.", Infrastructure.STLogging.Interface.LogLevelEnum.Warn);
            }

            List<String> mappAttr = mapp.Components
                                        .Where(m => m.CubeComponentType == CubeComponentTypeEnum.Attribute)
                                        .Select(l => l.CubeComponentCode).ToList();
            List<String> mappDim = mapp.Components
                                       .Where(m => m.CubeComponentType == CubeComponentTypeEnum.Dimension || m.CubeComponentType == CubeComponentTypeEnum.TimeDimension)
                                       .Select(l => l.CubeComponentCode).ToList();
            List<String> mappMeas = mapp.Components
                                        .Where(m => m.CubeComponentType == CubeComponentTypeEnum.Measure)
                                        .Select(l => l.CubeComponentCode).ToList();

            //gets the associated cube
            CubeWithDetails c = new BuilderDataProvider(mDataStore).getCube(mapp.IDCube);

            //checks all dimensions, measures and mandatory attributes are mapped
            foreach (Dimension d in c.Dimensions)
                if (!mappDim.Contains(d.Code))
                {
                    throw Utility.Utils.getCustomException("MAPPING_CHECK_NOT_MAPPED_COMPONENT",
                        @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - Not all cube dimensions have been mapped.", Infrastructure.STLogging.Interface.LogLevelEnum.Warn);
                }

            if (c.Attributes != null && c.Attributes.Count > 0)
            {
                foreach (DDB.Entities.Attribute a in c.Attributes)
                    if (a.IsMandatory && !mappAttr.Contains(a.Code) && !a.IsTid)
                    {
                        throw Utility.Utils.getCustomException("MAPPING_CHECK_NOT_MAPPED_COMPONENT",
                            @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - Not all cube mandatory attributes have been mapped.", Infrastructure.STLogging.Interface.LogLevelEnum.Warn);
                    }
            }

            foreach (Measure m in c.Measures)
                if (!mappMeas.Contains(m.Code))
                {
                    throw Utility.Utils.getCustomException("MAPPING_CHECK_NOT_MAPPED_COMPONENT",
                            @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - Not all cube measures have been mapped.", Infrastructure.STLogging.Interface.LogLevelEnum.Warn);
                }

            return true;
        }

        /// <summary>
        /// Checks file's format correctness.
        /// </summary>
        /// <param name="file">The file to be checked.</param>
        /// <param name="onlyCsv">Whether the file format can be only CSV.</param>
        private void checkFileFormat(IFormFile file, bool onlyCsv)
        {
            // check file type (only .csv)
            string[] chunks = file.FileName.Split('.');
            string fileExt = chunks[chunks.Length - 1];

            if (onlyCsv && fileExt.ToLower() != "csv")
            {
                throw new Exception();
            }

            //file vuoto
            if (file == null || file.Length == 0)
            {
                throw new Exception();
            }
        }

        #endregion Private methods
    }
}
