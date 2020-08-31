using DataModel;
using DataStore.Interface;
using DDB.Entities;
using Infrastructure.STLogging.Factory;
using Infrastructure.STLogging.Interface;
using NSI.Entities;
using Org.Sdmx.Resources.SdmxMl.Schemas.V21.Query;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.IO;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using static DataProvider.DDB_NEW;

namespace DataProvider
{
    public class DataflowBuilderDataProvider : IDataflowBuilderDataProvider
    {
        #region Private fields

        private IDataStore mDataStore;
        private string mDBSchema;
        private BuilderDataProvider buildDP;
        SqlCommandBuilder mBuilder;
        readonly ISTLogger _logger;

        #endregion Private fields

        public DataflowBuilderDataProvider(IDataStore dataStore)
        {
            mDataStore = dataStore;
            mDBSchema = mDataStore.Schema;
            buildDP = new BuilderDataProvider(mDataStore);
            mBuilder = new SqlCommandBuilder();
            _logger = STLoggerFactory.Logger;
        }

        public int createDDBDataflow(DDBDataflowWithCols df)
        {
            //get the cube associated to the dataflow
            CubeWithDetails cube = buildDP.getCube(df.IDCube);

            //checks if columns selected for the df belong to the cube
            checkColumnsInCube(df, cube);

            //checks conditions on filter and adds implicit conditions
            df.Filter = checkFilter(df.Filter, df.DataflowColumns, cube);

            //checks all manadtory attributes have been loaded
            checkMandatoryAttribute(df, cube);

            mDataStore.BeginTransaction();

            try
            {
                //creates a row in CatDataFlow table
                int IDDf = insertCatDataFlowRow(df);

                //sets id for the dataflow inserted in the DB
                df.IDDataflow = IDDf;

                //creates rows in localised_CatDataFlow table
                insertLocalised_CatDataFlowRow(df);

                //creates dataflow's column
                insertDfColumns(df);

                //creates dataflow's views
                createDDBDataflowViews(df);

                mDataStore.CommitTransaction();
                return IDDf;
            }
            catch (Exception ex)
            {
                mDataStore.RollbackTransaction();
                throw ex;
            }
        }

        public bool deleteDDBDataflow(int id)
        {
            mDataStore.BeginTransaction();

            try
            {
                //delets view
                if (mDataStore.ExistsView($"Dataset_DF{id}_ViewCurrentData"))
                    mDataStore.ExecuteCommand($"DROP VIEW Dataset_DF{id}_ViewCurrentData");

                STKeyValuePair[] parameters = new STKeyValuePair[] { new STKeyValuePair("IDDataFlow", id) };

                //deletes the row of CatDataflow table (deletes its columns with CASCADE option)
                mDataStore.ExecuteCommand($"DELETE FROM CatDataFlow WHERE IDDataFlow = @IDDataFlow", parameters);
            }
            catch (Exception ex)
            {
                mDataStore.RollbackTransaction();
                throw Utility.Utils.getCustomException("DF_DELETE_ERROR",
                    @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - " + ex.Message, Infrastructure.STLogging.Interface.LogLevelEnum.Error);
            }

            mDataStore.CommitTransaction();
            return true;
        }

        public async Task<string> downloadDDBDataflowInCsvAsync(DDBDataflow ddbDataflow, bool partialIgnoreCheckFilter, char separator, char delimiter)
        {
            //checking filter for preventing SQL Injection
            CubeWithDetails cube = buildDP.getCube(ddbDataflow.IDCube);
            checkFilter(ddbDataflow.Filter, ddbDataflow.SqlData.SelCols, cube, partialIgnoreCheckFilter);

            IDataReader reader;
            try
            {
                var view = ddbDataflow.IDDataflow > 0 ? $"DF{ddbDataflow.IDDataflow}" : ddbDataflow.IDCube.ToString();
                string query = $"SELECT {string.Join(",", ddbDataflow.SqlData.SelCols)} FROM Dataset_{view}_ViewCurrentData";

                var filterStr = ddbDataflow.Filter?.ToSql();
                if (!string.IsNullOrWhiteSpace(filterStr))
                {
                    query += $" WHERE {filterStr}";
                }
                _logger.Log($"RUN query: {query}", LogLevelEnum.Debug);
                reader = mDataStore.ExecuteReader(query);
                _logger.Log($"END RUN query: {query}", LogLevelEnum.Debug);
            }
            catch (Exception ex)
            {
                _logger.Log("GENERATE_DDB_CUSTOM_CSV_ERROR:" + ex.Message, ex, LogLevelEnum.Error);
                throw Utility.Utils.getCustomException("DDB_CUSTOM_CSV_ERROR",
                    @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - " + ex.Message, LogLevelEnum.Error);
            }
            _logger.Log($"RUN asyncDataTableToCsvFile", LogLevelEnum.Debug);
            var filePathResult = await asyncDataTableToCsvFile(reader, ddbDataflow.SqlData.SelCols, true, separator, delimiter);
            _logger.Log($"END RUN asyncDataTableToCsvFile: {filePathResult}", LogLevelEnum.Debug);

            return filePathResult;
        }

        public DDBDataflowWithCols getDDBDataflow(int id)
        {
            STKeyValuePair[] parameters = new STKeyValuePair[] { new STKeyValuePair("IDDataFlow", id) };

            //executing queries
            DataTable tb0 = mDataStore.GetTable(@"SELECT * FROM CatDataFlow WHERE IDDataFlow = @IDDataFlow", parameters);

            if (tb0.Rows.Count != 1)
            {
                throw Utility.Utils.getCustomException("DF_NOT_FOUND",
                      @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + $" - Dataflow {id} not found.", Infrastructure.STLogging.Interface.LogLevelEnum.Warn);
            }

            DataTable tb1 = mDataStore.GetTable(@"SELECT * FROM localised_CatDataFlow WHERE IDMember = @IDDataFlow", parameters);

            if (tb1.Rows.Count < 1)
            {
                throw Utility.Utils.getCustomException("DF_WITHOUT_LABEL",
                      @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + $" - Dataflow {id} has no associated labels.", Infrastructure.STLogging.Interface.LogLevelEnum.Warn);
            }

            try
            {

                DataTable tb2 = mDataStore.GetTable(@"SELECT * FROM CatDataFlowColumns WHERE IDDataFlow = @IDDataFlow ORDER BY ColumnOrder ASC", parameters);

                //executes casts to typed DataTable
                CatDataFlowDataTable tbDf = new CatDataFlowDataTable();
                tbDf.Merge(tb0, true, MissingSchemaAction.Ignore);

                localised_CatDataFlowDataTable tbLoc = new localised_CatDataFlowDataTable();
                tbLoc.Merge(tb1, true, MissingSchemaAction.Ignore);

                CatDataFlowColumnsDataTable tbDfCols = new CatDataFlowColumnsDataTable();
                tbDfCols.Merge(tb2, true, MissingSchemaAction.Ignore);

                //generates the Dataflow getting its columns and associated labels in advance
                List<String> cols = tbDfCols.AsEnumerable().Where(r => r.IDDataFlow == id).Select(x => x.ColumnName).ToList();

                Dictionary<string, string> labels = new Dictionary<string, string>();
                foreach (DataRow r in tbLoc.Rows)
                    labels.Add(r["TwoLetterISO"].ToString(), r["Valore"].ToString());

                var filter = new Filter();
                if (!string.IsNullOrWhiteSpace(tbDf[0].Filter))
                {
                    filter.FiltersGroupAnd = Filter.BasicFilterFromSql(tbDf[0].Filter, false);
                }

                DDBDataflowWithCols df = new DDBDataflowWithCols(tbDf[0].IDDataFlow, tbDf[0].IDCube, tbDf[0].ID, tbDf[0].Agency, tbDf[0].Version, filter, tbDf[0].HasTranscoding, tbDf[0].HasContentConstraints, tbDf[0].LastUpdated, cols, labels);
                checkFilter(df.Filter, df.DataflowColumns, buildDP.getCube(df.IDCube));
                return df;
            }
            catch (Exception ex)
            {
                throw Utility.Utils.getCustomException("DF_RETRIEVING_ERROR",
                    @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - " + ex.Message, Infrastructure.STLogging.Interface.LogLevelEnum.Error);
            }
        }

        public List<DDBDataflowWithCols> getDDBDataflowsNoFilter(int cubeId)
        {
            try
            {
                var dataFlows = new List<DDBDataflowWithCols>();

                //Gets all DataFlows With DSD to be Upgraded
                var allCube = $@"SELECT cFlow.IDDataFlow 
                                FROM CatCube cCube
                                INNER JOIN CatDataFlow cFlow
                                ON cFlow.IDCube=cCube.IDCube 
                                WHERE cCube.IDCube={mDataStore.PARAM_PREFIX}CubeId";
                var listParam = new STKeyValuePair[] { new STKeyValuePair("CubeId", cubeId) };
                var reader = mDataStore.ExecuteReader(allCube, listParam);

                var dataFlowIds = new List<int>();
                while (reader.Read())
                {
                    dataFlowIds.Add((int)reader["IDDataFlow"]);
                }
                reader.Close();

                foreach (var id in dataFlowIds)
                {
                    dataFlows.Add(getDDBDataflow(id));
                }

                return dataFlows;
            }
            catch (Exception ex)
            {
                throw Utility.Utils.getCustomException("GETDATAFLOWSFROMDSD_ERROR",
                    @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - " + ex.Message, Infrastructure.STLogging.Interface.LogLevelEnum.Error);
            }
        }

        public List<DDBDataflow> getDDBDataflows()
        {
            try
            {
                List<DDBDataflow> dfList = new List<DDBDataflow>();

                DataTable dt1 = mDataStore.GetTable(@"SELECT * FROM CatDataFlow df INNER JOIN localised_CatDataFlow loc ON df.IDDataFlow = loc.IDMember");

                //selects distinct dataflows
                DataTable dt2 = new DataView(dt1).ToTable("Dataflows", true, "IDDataflow", "IDCube", "ID", "Agency", "Version", "Filter", "LastUpdated", "HasTranscoding", "HasContentConstraints");

                //executes casts to typed DataTable
                CatDataFlowDataTable tbDf = new CatDataFlowDataTable();
                tbDf.Merge(dt2, true, MissingSchemaAction.Ignore);

                localised_CatDataFlowDataTable tbLoc = new localised_CatDataFlowDataTable();
                tbLoc.Merge(dt1, true, MissingSchemaAction.Ignore);

                foreach (CatDataFlowRow dr in tbDf.Rows)
                {
                    //gets labels associated to the cube
                    DataTable tblFilt = tbLoc.AsEnumerable().Where(row => row.IDMember == dr.IDDataFlow).CopyToDataTable();

                    Dictionary<string, string> labels = new Dictionary<string, string>();
                    if (tblFilt.Rows.Count > 0)
                    {
                        foreach (DataRow r in tblFilt.Rows)
                            labels.Add(r["TwoLetterISO"].ToString(), r["Valore"].ToString());
                    }

                    var filter = new Filter();
                    if (!string.IsNullOrWhiteSpace(dr.Filter))
                    {
                        filter.FiltersGroupAnd = Filter.BasicFilterFromSql(dr.Filter, false);
                    }

                    dfList.Add(
                        new DDBDataflow(dr.IDDataFlow, dr.IDCube, dr.ID, dr.Agency, dr.Version, filter, dr.HasTranscoding, dr.HasContentConstraints, dr.LastUpdated, labels));
                }
                return dfList;
            }
            catch (Exception ex)
            {
                throw Utility.Utils.getCustomException("DF_RETRIEVING_DFS_ERROR",
                    @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - " + ex.Message, Infrastructure.STLogging.Interface.LogLevelEnum.Error);
            }
        }

        public DataResults getDDBDataflowPreview(DDBDataflow ddbDataflow, bool partialIgnoreCheckFilter)
        {
            //checks filter for preventing SQL Injection
            CubeWithDetails cube = buildDP.getCube(ddbDataflow.IDCube);
            checkFilter(ddbDataflow.Filter, ddbDataflow.SqlData.SelCols, cube, partialIgnoreCheckFilter);

            try
            {
                var view = ddbDataflow.IDDataflow > 0 ? $"DF{ddbDataflow.IDDataflow}" : ddbDataflow.IDCube.ToString();

                string query = $"SELECT {string.Join(",", ddbDataflow.SqlData.SelCols)} FROM Dataset_{view}_ViewCurrentData";
                string queryCount = $"SELECT COUNT(*) FROM Dataset_{view}_ViewCurrentData";

                var filterStr = ddbDataflow.Filter?.ToSql();
                if (!string.IsNullOrWhiteSpace(filterStr))
                {
                    query += $" WHERE {filterStr}";
                    queryCount += $" WHERE {filterStr}";
                }

                var strSortColumn = ddbDataflow.SqlData.SelCols.First();
                if (ddbDataflow?.SqlData?.SortCols != null && ddbDataflow.SqlData.SortCols.Count > 0)
                { //In case of sort throw an exception if sortCols haven't a name of a db column (this control also prevents sql injection)

                    //Get all columns
                    List<string> allCols = cube.Dimensions.Select(x => x.ColName).ToList();
                    allCols.AddRange(cube.Attributes.Select(x => x.ColName).ToList());
                    allCols.AddRange(cube.Measures.Select(x => x.ColName).ToList());

                    var i = 0;
                    foreach (var item in ddbDataflow.SqlData.SortCols)
                    {
                        if (!allCols.Contains(item))
                        {
                            throw Utility.Utils.getCustomException("DF_INVALID_COLUMN_NAME",
                            @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - Dataflow filter on unknown column.", Infrastructure.STLogging.Interface.LogLevelEnum.Error);
                        }

                        strSortColumn = i > 0 ? $"{strSortColumn},{item}" : item;
                        i++;
                    }
                }

                var count = (int)mDataStore.ExecuteScalar(queryCount);


                int countEmb = 0;
                if (mDataStore.ExistsTable("FactS_TEMP_" + ddbDataflow.IDCube))
                {
                    countEmb = (int)mDataStore.ExecuteScalar($"SELECT COUNT(*) FROM " + "FactS_TEMP_" + ddbDataflow.IDCube);
                }

                string pagedQuery = mDataStore.GetPagedQuery(query, strSortColumn, ddbDataflow.SqlData.NumPage - 1, ddbDataflow.SqlData.PageSize, ddbDataflow.SqlData.SortByDesc);
                DataTable dt = mDataStore.GetTable(pagedQuery);
                if (dt.Columns.Contains("__ROW_NUMBER__"))
                {
                    dt.Columns.Remove("__ROW_NUMBER__");
                }
                return new DataResults { Data = dt, Count = count, CountEmbargo = countEmb, Columns = ddbDataflow.SqlData.SelCols };
            }
            catch (Exception ex)
            {
                throw Utility.Utils.getCustomException("GET_TABLE_PREVIEW",
                    @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - " + ex.Message, Infrastructure.STLogging.Interface.LogLevelEnum.Error);
            }
        }

        public bool setHasTranscodingFlag(int id, bool value)
        {
            STKeyValuePair[] parameters = new STKeyValuePair[] { new STKeyValuePair("IDDataFlow", id), new STKeyValuePair("HasTranscoding", value) };

            try
            {
                mDataStore.ExecuteCommand($@"UPDATE CatDataFlow SET HasTranscoding = @HasTranscoding WHERE IDDataFlow = @IDDataFlow", parameters);
                return true;
            }
            catch (Exception ex)
            {
                throw Utility.Utils.getCustomException("DF_TRANSC_FLAG",
                    @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - " + ex.Message, Infrastructure.STLogging.Interface.LogLevelEnum.Error);
            }
        }

        public bool setHasContentConstraintsFlag(int id, bool value)
        {
            STKeyValuePair[] parameters = new STKeyValuePair[] { new STKeyValuePair("IDDataFlow", id), new STKeyValuePair("HasContentConstraints", value) };

            try
            {
                mDataStore.ExecuteCommand($@"UPDATE CatDataFlow SET HasContentConstraints = @HasContentConstraints WHERE IDDataFlow = @IDDataFlow", parameters);
                return true;
            }
            catch (Exception ex)
            {
                throw Utility.Utils.getCustomException("DF_CC_FLAG",
                    @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - " + ex.Message, Infrastructure.STLogging.Interface.LogLevelEnum.Error);
            }
        }

        public DataTable getDataflowColumnPreview(DDBDataflowWithCols df, string colName, int numPage, int pageSize, bool partialIgnoreCheckFilter)
        {
            try
            {
                //checks filter for preventing SQL Injection
                CubeWithDetails cube = buildDP.getCube(df.IDCube);
                checkFilter(df.Filter, df.DataflowColumns, cube, partialIgnoreCheckFilter);

                string tableName = $"Dataset_{df.IDCube}_ViewCurrentData";


                string query = $"SELECT DISTINCT {mBuilder.QuoteIdentifier(colName)} FROM {mBuilder.QuoteIdentifier(tableName)}";

                var filterWhere = df.Filter?.ToSql();
                if (!string.IsNullOrWhiteSpace(filterWhere))
                {
                    query += $" WHERE {filterWhere}";
                }


                string pagedQuery = mDataStore.GetPagedQuery(query, colName, numPage - 1, pageSize, df.sortByDesc);
                DataTable dt = mDataStore.GetTable(pagedQuery);
                if (dt.Columns.Contains("__ROW_NUMBER__"))
                {
                    dt.Columns.Remove("__ROW_NUMBER__");
                }
                return dt;
            }
            catch (Exception ex)
            {
                throw Utility.Utils.getCustomException("GET_TABLE_COLUMN_PREVIEW",
                   @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - " + ex.Message, Infrastructure.STLogging.Interface.LogLevelEnum.Error);
            }
        }

        #region Private Methods

        /// <summary>
        /// Inserts a row in CatDataflow table during the creation of a new dataflow.
        /// It throws an exception if ID + Agency + Version of the dataflow are already in use.
        /// </summary>
        /// <param name="df">The dataflow to be created</param>
        /// <returns>The id of the dataflow created.</returns>
        private int insertCatDataFlowRow(DDBDataflow df)
        {
            if (string.IsNullOrWhiteSpace(df.Version))
            {
                df.Version = "1.0";
            }
            else if (df.Version.Split('.').Length <= 1)
            {
                df.Version = df.Version + ".0";
            }
            List<STKeyValuePair> parameters = new List<STKeyValuePair> {
                new STKeyValuePair("ID", df.ID.Replace("'", "''")),
                new STKeyValuePair("Agency", df.Agency),
                new STKeyValuePair("Version", df.Version)
            };

            DataTable tb1 = mDataStore.GetTable($@"SELECT IDDataFlow FROM CatDataFlow WHERE ID = @ID AND Agency = @Agency AND Version = @Version", parameters.ToArray());
            if (tb1.Rows.Count != 0)
            {
                throw Utility.Utils.getCustomException("DF_DUPLICATED_CODE",
                      @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - Dataflow ID + Agency + Version already in use.", Infrastructure.STLogging.Interface.LogLevelEnum.Warn);
            }

            try
            {
                parameters.AddRange(
                    new List<STKeyValuePair> {
                        new STKeyValuePair("IDCube", df.IDCube),
                        new STKeyValuePair("Filter", df.Filter.ToSql())
                    }
                 );

                mDataStore.ExecuteCommand($@"INSERT INTO CatDataflow(IDCube, ID, Agency, Version, Filter, LastUpdated, HasTranscoding, HasContentConstraints) 
                                                VALUES (@IDCube, @ID, @Agency, @Version, @Filter, {mDataStore.GetCurrentDateExpression()}, 0, 0)", parameters.ToArray());

                //returns dataflow's ID
                DataTable tb2 = mDataStore.GetTable($@"SELECT IDDataFlow FROM CatDataFlow WHERE ID = @ID AND Agency = @Agency AND Version = @Version", parameters.ToArray());

                return int.Parse(tb2.Rows[0]["IDDataFlow"].ToString());
            }
            catch (Exception ex)
            {
                throw Utility.Utils.getCustomException("DF_CATDF_INSERT_ERROR",
                    @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - " + ex.Message, Infrastructure.STLogging.Interface.LogLevelEnum.Error);
            }
        }

        /// <summary>
        /// Insert rows in localised_CatDataFlow table during the creation of a new dataflow.
        /// It throws an exception if constraints are violated.
        /// </summary>
        /// <param name="df">The daatflow to be created.</param>
        private void insertLocalised_CatDataFlowRow(DDBDataflow df)
        {
            if (df.labels.Count == 0)
            {
                throw Utility.Utils.getCustomException("DF_NO_LABELS",
                                @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - Dataflow with no associated labels.", Infrastructure.STLogging.Interface.LogLevelEnum.Error);
            }

            localised_CatDataFlowDataTable dt = new localised_CatDataFlowDataTable();

            try
            {

                foreach (string lang in df.labels.Keys)
                    dt.Rows.Add(df.IDDataflow, lang, df.labels[lang]);

                mDataStore.UpdateChanges(dt);
            }
            catch (Exception ex)
            {
                throw Utility.Utils.getCustomException("DF_LABELS_CREATION",
                    @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - " + ex.Message, Infrastructure.STLogging.Interface.LogLevelEnum.Error);
            }
        }

        private async Task<MemoryStream> asyncDataTableToCsvMemory(DataTable dt, bool includeHeader, char separator, char delimiter)
        {
            var memoryStream = new MemoryStream();
            var sw = new StreamWriter(memoryStream);

            try
            {
                sw.AutoFlush = true;

                var nColumn = dt.Columns.Count;
                if (includeHeader)
                {
                    string[] s = new string[nColumn];
                    for (var j = 0; j < nColumn; j++)
                    {
                        if (dt.Columns[j].ColumnName.StartsWith("ID_"))
                        {
                            if (delimiter == char.MinValue)
                            {
                                s[j] = dt.Columns[j].ColumnName.Substring(3);
                            }
                            else
                            {
                                s[j] = $"{delimiter}{dt.Columns[j].ColumnName.Substring(3)}{delimiter}";
                            }
                        }
                        else
                        {
                            if (delimiter == char.MinValue)
                            {
                                s[j] = dt.Columns[j].ColumnName;
                            }
                            else
                            {
                                s[j] = $"{delimiter}{dt.Columns[j].ColumnName}{delimiter}";
                            }
                        }
                    }
                    await sw.WriteLineAsync(string.Join(separator, s));
                }
                for (var i = 0; i < dt.Rows.Count; i++)
                {
                    string[] s = new string[nColumn];
                    for (var j = 0; j < nColumn; j++)
                    {
                        if (!includeHeader && i == 0 && dt.Rows[i].ItemArray[j].ToString().StartsWith("ID"))
                        {
                            if (delimiter == char.MinValue)
                            {
                                s[j] = " " + dt.Rows[i].ItemArray[j].ToString();
                            }
                            else
                            {
                                s[j] = $"{delimiter}{dt.Rows[i].ItemArray[j]}{delimiter}";
                            }
                        }
                        else
                        {
                            if (delimiter == char.MinValue)
                            {
                                s[j] = dt.Rows[i].ItemArray[j].ToString();
                            }
                            else
                            {
                                s[j] = $"{delimiter}{dt.Rows[i].ItemArray[j]}{delimiter}";
                            }
                        }
                    }
                    await sw.WriteLineAsync(string.Join(separator, s));
                }

                memoryStream.Position = 0;

                return memoryStream;
            }
            catch (Exception)
            {
                sw.Dispose();
                memoryStream.Dispose();
                throw;
            }
        }

        private async Task<string> asyncDataTableToCsvFile(IDataReader reader, List<string> columns, bool includeHeader, char separator, char delimiter)
        {
            var filePath = $"TmpData\\Csv\\{Guid.NewGuid()}.csv";
            try
            {
                if (!Directory.Exists("TmpData"))
                {
                    Directory.CreateDirectory("TmpData");
                }
                if (!Directory.Exists("TmpData\\Csv"))
                {
                    Directory.CreateDirectory("TmpData\\Csv");
                }

                using (StreamWriter sw = new StreamWriter(new FileStream(filePath, FileMode.Create)))
                {
                    var nColumn = columns.Count;
                    if (includeHeader)
                    {
                        string[] s = new string[nColumn];
                        for (var j = 0; j < nColumn; j++)
                        {
                            if (columns[j].StartsWith("ID_"))
                            { //Only for first column and first row if starts with ID_
                                if (delimiter == char.MinValue)
                                {
                                    s[j] = columns[j].Substring(3);
                                }
                                else
                                {
                                    s[j] = $"{delimiter}{columns[j].Substring(3)}{delimiter}";
                                }
                            }
                            else
                            {
                                if (delimiter == char.MinValue)
                                {
                                    s[j] = columns[j];
                                }
                                else
                                {
                                    s[j] = $"{delimiter}{columns[j]}{delimiter}";
                                }
                            }
                        }
                        await sw.WriteLineAsync(string.Join(separator, s));
                    }

                    //for (var i = 0; i < columns.Rows.Count; i++)
                    var isFirstRow = true;
                    while (reader.Read())
                    {
                        string[] s = new string[nColumn];
                        for (var j = 0; j < nColumn; j++)
                        {
                            var firstRowFirstColumn = "";
                            if (isFirstRow && j == 0)
                            {
                                firstRowFirstColumn = reader[0].ToString();
                            }
                            if (!includeHeader && isFirstRow && firstRowFirstColumn.StartsWith("ID"))
                            { //Only for first column and first row if starts with ID
                                if (delimiter == char.MinValue)
                                {
                                    s[j] = " " + firstRowFirstColumn;
                                }
                                else
                                {
                                    s[j] = $"{delimiter}{firstRowFirstColumn}{delimiter}";
                                }
                            }
                            else
                            {
                                if (delimiter == char.MinValue)
                                {
                                    s[j] = reader[j].ToString();
                                }
                                else
                                {
                                    s[j] = $"{delimiter}{reader[j]}{delimiter}";
                                }
                            }
                        }
                        isFirstRow = false;
                        await sw.WriteLineAsync(string.Join(separator, s));
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.Log("GENERATE_DDB_CUSTOM_CSV_ERROR:" + ex.Message, ex, LogLevelEnum.Error);
                throw Utility.Utils.getCustomException("GENERATE_DDB_CUSTOM_CSV_ERROR",
                    @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - " + ex.Message, LogLevelEnum.Error);
            }
            return filePath;
        }

        /// <summary>
        /// Creates dataflow's column inserting corrispondent rows in CatDataFlowColumns table
        /// </summary>
        /// <param name="df">The dataflow to be created.</param>
        private void insertDfColumns(DDBDataflowWithCols df)
        {
            if (df.DataflowColumns == null || df.DataflowColumns.Count == 0)
            {
                throw Utility.Utils.getCustomException("DF_NO_COLS",
                                @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - DataFlow with no columns.", Infrastructure.STLogging.Interface.LogLevelEnum.Warn);
            }

            CatDataFlowColumnsDataTable dimDt = new CatDataFlowColumnsDataTable();

            try
            {
                var orderColumn = 1;
                foreach (string col in df.DataflowColumns)
                {
                    //inserts the row in the corrispondent DataTable
                    dimDt.Rows.Add(df.IDDataflow, col, orderColumn++);
                }
                mDataStore.UpdateChanges(dimDt);
            }
            catch (Exception ex)
            {
                throw Utility.Utils.getCustomException("DF_COL_CREATE",
                    @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - " + ex.Message, Infrastructure.STLogging.Interface.LogLevelEnum.Error);
            }
        }

        /// <summary>
        /// Controls if the dataflow has all the mandatory attributes correctly defined.
        /// For performance reasons, actually only the first 100 rows are checked
        /// </summary>
        /// <param name="df">The dataflow to be checked.</param>
        /// <param name="cube">The cube associated to the dataflow.</param>
        private void checkMandatoryAttribute(DDBDataflowWithCols df, CubeWithDetails cube)
        {
            Dictionary<string, string> err = new Dictionary<string, string>();

            //mandatory attributes
            List<string> mandCols = cube.Attributes.Where(x => x.IsMandatory).Select(c => c.ColName).ToList();

            string q = mDataStore.GetPagedQuery($"SELECT * FROM Dataset_{cube.IDCube}_ViewCurrentData", "SID", 0, 100, false);
            DataTable dt = mDataStore.GetTable(q);
            if (dt.Columns.Contains("__ROW_NUMBER__"))
            {
                dt.Columns.Remove("__ROW_NUMBER__");
            }
            if (dt.Rows.Count > 0 && mandCols.Count > 0)
            {
                foreach (string col in mandCols)
                {
                    foreach (DataRow dr in dt.Rows)
                    {
                        if (DBNull.Value.Equals(dr[col]))
                        {
                            err.Add(":" + col, "MAND_ATTR_NULL");
                            break;
                        }
                    }
                }
            }

            if (err.Count > 0)
            {
                Exception e = Utility.Utils.getCustomException("MAND_ATTR_NULL",
                    @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - Esistono attributi mandatory con colonne nulle.", Infrastructure.STLogging.Interface.LogLevelEnum.Error);
                e.Data.Add("Report", err);
                throw e;
            }
        }

        /// <summary>
        /// Checks if the filter on the dataflow is correctly defined:
        /// - for each NOT SELECTED column (always for TID column, if exists) there must be a WHERE condition on it unless only one value is present in the column
        /// - filters must be defined on cube's columns (possibly also on those not belonging to the dataflow)
        /// - if the column is not a non-alphanumeric measure the third argument must be between tops (')
        /// Filters are defined as follows: ( ColName =,<>,like,<,> 'Argument' AND/OR Condition 2 AND/OR ...) AND/OR (...)
        /// or ( ColName IN/NOT IN (Arg1,Arg2,...,ArgN)) AND (...)
        /// SIDE EFFECT: adds implicit filters for not selected columns with a single value but not explicit filter conditions on it
        /// </summary>
        /// <param name="filter">The dataflow's filter.</param>
        /// <param name="cols">Dataflow's column list.</param>
        /// <param name="cube">The cube associated to the dataflow.</param>
        /// <param name="partialIgnoreCheckFilter">Ignore filter condition on single values (used for export csv file)</param>
        /// <returns>The filter of the dataflow eventually extended with implicit conditions.</returns>
        private Filter checkFilter(Filter filter, List<string> cols, CubeWithDetails cube)
        {
            return commonCheckFilter(filter, cols, cube, false);
        }
        private Filter checkFilter(Filter filter, List<string> cols, CubeWithDetails cube, bool partialIgnoreCheckFilter)
        {
            return commonCheckFilter(filter, cols, cube, partialIgnoreCheckFilter);
        }
        private Filter commonCheckFilter(Filter filter, List<string> cols, CubeWithDetails cube, bool partialIgnoreCheckFilter)
        {
            Dictionary<string, string> err = new Dictionary<string, string>();

            //columns of the cube associated to the dataflow
            List<string> allCols = cube.Dimensions.Select(x => x.ColName).ToList();
            allCols.AddRange(cube.Attributes.Select(x => x.ColName).ToList());
            allCols.AddRange(cube.Measures.Select(x => x.ColName).ToList());

            //Tid column
            string tidCol = cube.Attributes.Where(a => a.IsTid).Select(x => x.ColName).SingleOrDefault();

            //conditions on the filter (if it is defined)
            //filter = "ID_REPORTING_TYPE NOT IN ('F%','V%') AND ID_REF_AREA IN ('76%') OR ID_FREQ IN ('A%')";

            //var filterParsed = "";



            if (!partialIgnoreCheckFilter)
            {
                //NOT selected columns for the dataflow on whom there is NOT a single-value filter and who have more than one possible values
                foreach (string col in allCols)
                {
                    if (!cols.Contains(col))
                    {
                        var whereFilter = filter.ToSql();
                        if (!string.IsNullOrWhiteSpace(whereFilter))
                        {
                            whereFilter = $" WHERE {whereFilter}";
                        }
                        else
                        {
                            whereFilter = "";
                        }
                        //checking if the column has more than one value
                        string q = mDataStore.GetPagedQuery($"SELECT DISTINCT [{col}] FROM Dataset_{cube.IDCube}_ViewCurrentData {whereFilter}", col, 0, 2, true);
                        var dt = mDataStore.GetTable(q);
                        int rows = dt.Rows.Count;
                        if (rows > 1)
                        {
                            err.Add(":" + col, "DF_FILTER_MISS_COND");
                        }
                        else if (rows == 1)
                        {
                            var val = dt.Rows[0][0].ToString();
                            createImplicitFilterIfNeed(col, val, filter);
                        }

                        /*else if (rows == 1)
                        {
                            //adding implicit conditions if missing
                            string val = dt.Rows[0][0].ToString();
                            if (filter == null || !(filter.Contains($"({col} = '{val}')") || filter.Contains($"{col} IN ('{val}')")))
                            {   //explicit conditions missing
                                filter = (filter == null || filter == "") ? "" : filter += " AND "; //adding AND cond if filter is not empty
                                filter = filter.Contains(" IN ") ? filter += $"{col} IN ('{val}')" : filter += $"({col} = '{val}')"; //adding cond according to filter type (advanced or not)
                            }
                        }*/
                    }
                }
            }
            //Throws an exception if cols haven't a name of a column in the db (this control also prevents sql injection)
            foreach (string col in cols)
            {
                if (!allCols.Contains(col))
                {
                    throw Utility.Utils.getCustomException("DF_INVALID_COLUMN_NAME",
                         @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - Dataflow filter on unknown column.", Infrastructure.STLogging.Interface.LogLevelEnum.Error);
                }
            }

            if (err.Count > 0)
            {
                Exception e = Utility.Utils.getCustomException("DF_FILTER",
                    @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - Incorrect filter conditions.", Infrastructure.STLogging.Interface.LogLevelEnum.Error);
                e.Data.Add("Report", err);
                throw e;
            }

            return filter;
        }

        private void createImplicitFilterIfNeed(string column, string val, Filter filter)
        {
            //TODO for now not manage FiltersGroupOr (never use)
            var needFilter = filter?.FiltersGroupAnd == null;
            if (!needFilter)
            { //Find for column and value used in filter (else add specific filter)
                needFilter = true;
                foreach (var itemGroupFilter in filter.FiltersGroupAnd)
                {
                    foreach (var itemFilter in itemGroupFilter.Value)
                    {
                        if (!itemFilter.ColumnName.Equals(column, StringComparison.InvariantCultureIgnoreCase))
                        { //Not found column
                            continue;
                        }
                        if (itemFilter.FilterValues.Any(x => x.Equals(val)))
                        { //Found column but and found value
                            needFilter = false;
                            break;
                        }
                    }
                }
            }
            else
            {
                if (filter == null)
                {
                    filter = new Filter();
                }
                filter.FiltersGroupAnd = new Dictionary<int, List<FilterObject>>();
            }

            if (!needFilter)
            {
                return;
            }

            var isAdvanced = filter.FiltersGroupAnd.Any(i=>i.Value.Any(k=>k.Operator.Equals("IN")|| k.Operator.Equals("NOT IN"))); //filter type(advanced or not)

            var key = filter.FiltersGroupAnd.Count;
            var value = new List<FilterObject> {
                new FilterObject {
                    ColumnName = column,
                    FilterValues = new List<string> { val },
                    WhereAndOr = "AND",
                    Operator = isAdvanced ? "IN" : "="
                }
            };
            filter.FiltersGroupAnd.Add(key, value);
        }

        private bool checkIfNeedDefaultFilterSql(Filter filter, string column, string value)
        {
            if (filter == null)
            {
                return true;
            }
            if (filter != null && filter.FiltersGroupAnd != null)
            { //OLD !(filter.Contains($"({col} = '{val}')") || filter.Contains($"{col} IN ('{val}')")))
                var filters = new List<FilterObject>();
                foreach (var iGroup in filter.FiltersGroupAnd)
                { //take all filter for columnname == column
                    foreach (var itemFilter in iGroup.Value)
                    {
                        if (itemFilter.ColumnName.Equals(column, StringComparison.InvariantCultureIgnoreCase))
                        { //Check if column have filter fo VALUE
                            if (itemFilter.FilterValues.Any(i => i.Equals(value)))
                            {
                                return false;
                            }
                        }
                    }
                }
            }
            if (filter != null && filter.FiltersGroupOr != null)
            { //OLD !(filter.Contains($"({col} = '{val}')") || filter.Contains($"{col} IN ('{val}')")))
                var filters = new List<FilterObject>();
                foreach (var iGroup in filter.FiltersGroupOr)
                { //take all filter for columnname == column
                    foreach (var itemFilter in iGroup.Value)
                    {
                        if (itemFilter.ColumnName.Equals(column, StringComparison.InvariantCultureIgnoreCase))
                        { //Check if column have filter fo VALUE
                            if (itemFilter.FilterValues.Any(i => i.Equals(value)))
                            {
                                return false;
                            }
                        }
                    }
                }
            }
            return true;
        }

        private string checkInWhereAndReWrite(string tok, CubeWithDetails cube, List<string> allCols)
        {
            //list of NOT alphanumeric measures
            var notAlphanMeasCols = cube.Measures.Where(c => !c.IsAlphanumeric).Select(x => x.ColName).ToList();

            var nameColumn = 0;
            var operatorColumn = 1;
            var args = tok.Split(" ");

            //condition on a cube's column
            if (!allCols.Contains(args[nameColumn]))
            {
                throw Utility.Utils.getCustomException("DF_FILTER",
                    @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - Dataflow filter on unknown column.", Infrastructure.STLogging.Interface.LogLevelEnum.Error);
            }
            //unknown OPERATOR for the condition
            if (!args[operatorColumn].ToUpperInvariant().Equals("IN") && !(args[operatorColumn].ToUpperInvariant().Equals("NOT") && args[operatorColumn + 1].ToUpperInvariant().Equals("IN")))
            {
                throw Utility.Utils.getCustomException("DF_FILTER",
                    @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - Dataflow filter with invalid operator.", Infrastructure.STLogging.Interface.LogLevelEnum.Error);
            }

            var reWriteWhere = new StringBuilder($"{args[0]} {args[1]} (");


            foreach (Match c in Regex.Matches(tok, @"\((.*?)\)"))
            {
                var i = 0;
                var values = c.Groups[1].ToString().Split(",");
                foreach (var valueColumn in values)
                {
                    //numeric column with not alphanumeric condition
                    if (notAlphanMeasCols.Contains(args[nameColumn]) && !float.TryParse(valueColumn, out float res))
                    {
                        throw Utility.Utils.getCustomException("DF_FILTER",
                            @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - Filter on measure with not numeric value.", Infrastructure.STLogging.Interface.LogLevelEnum.Error);
                    }
                    //textual column with condition not between tops (')
                    if (!notAlphanMeasCols.Contains(args[nameColumn]) && !Regex.Match(valueColumn, @"'([^']*)'").Success)
                    {
                        throw Utility.Utils.getCustomException("DF_FILTER",
                            @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - Filter on textual column with not textual argument.", Infrastructure.STLogging.Interface.LogLevelEnum.Error);
                    }
                    if (i > 0)
                    {
                        reWriteWhere.Append(", ");
                    }
                    reWriteWhere.Append(valueColumn.Trim());
                    i++;
                }
            }

            reWriteWhere.Append(")");

            return reWriteWhere.ToString();
        }

        private string checkGenericWhere(string token, CubeWithDetails cube, List<string> allCols)
        {
            var operators = new[] { "=", "<>", ">", "<", "LIKE" };

            //list of NOT alphanumeric measures
            var notAlphanMeasCols = cube.Measures.Where(c => !c.IsAlphanumeric).Select(x => x.ColName).ToList();

            foreach (Match c in Regex.Matches(token, @"\((.*?)\)"))
            {
                var tokens = c.Groups[1].ToString().Split(" AND | OR ");
                foreach (string tok in tokens)
                {
                    String[] args = tok.Split(" ");
                    var haveCondition = args.Length > 0;
                    var checkCount = 0;
                    while (haveCondition)
                    {
                        var nameColumn = 0;
                        var operatorColumn = 1;
                        var valueColumn = 2;
                        if (checkCount > 0)
                        {
                            nameColumn = 4 * checkCount;
                            operatorColumn = (4 * checkCount) + 1;
                            valueColumn = (4 * checkCount) + 2;
                        }

                        //condition on a cube's column
                        if (!allCols.Contains(args[nameColumn]))
                        {
                            throw Utility.Utils.getCustomException("DF_FILTER",
                                @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - Dataflow filter on unknown column.", Infrastructure.STLogging.Interface.LogLevelEnum.Error);
                        }

                        //unknown OPERATOR for the condition
                        if (!operators.Contains(args[operatorColumn].ToUpper()))
                        {
                            throw Utility.Utils.getCustomException("DF_FILTER",
                                @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - Dataflow filter with invalid operator.", Infrastructure.STLogging.Interface.LogLevelEnum.Error);
                        }

                        //numeric column with not alphanumeric condition
                        if (notAlphanMeasCols.Contains(args[nameColumn]) && !float.TryParse(args[valueColumn], out float res))
                        {
                            throw Utility.Utils.getCustomException("DF_FILTER",
                                @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - Filter on measure with not numeric value.", Infrastructure.STLogging.Interface.LogLevelEnum.Error);
                        }

                        //textual column with condition not between tops (')
                        if (!notAlphanMeasCols.Contains(args[nameColumn]) && !Regex.Match(args[valueColumn], @"'([^']*)'").Success)
                        {
                            throw Utility.Utils.getCustomException("DF_FILTER",
                                @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - Filter on textual column with not textual argument.", Infrastructure.STLogging.Interface.LogLevelEnum.Error);
                        }

                        checkCount++;
                        if (args.Length <= valueColumn + 1)
                        {
                            haveCondition = false;
                        }
                    }
                }
            }

            return token;
        }

        /// <summary>
        /// Verifies that all the columns defined in the df belong to the corrispondent cube and that columns associated to measures are included in the df.
        /// </summary>
        /// <param name="df">The dataflow to be checked.</param>
        /// <param name="cube">The cube associated to the df.</param>
        private void checkColumnsInCube(DDBDataflowWithCols df, CubeWithDetails cube)
        {
            List<string> measCols = cube.Measures.Select(x => x.ColName).ToList();

            foreach (string m in measCols)
            {
                if (!df.DataflowColumns.Contains(m))
                {
                    throw Utility.Utils.getCustomException("DF_NO_MEAS",
                        @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - Dataflow must contain all defined measures.", Infrastructure.STLogging.Interface.LogLevelEnum.Warn);
                }
            }

            List<string> cubeCols = cube.Dimensions.Select(x => x.ColName).ToList();
            cubeCols.AddRange(cube.Attributes.Select(x => x.ColName).ToList());
            cubeCols.AddRange(measCols);

            foreach (string col in df.DataflowColumns)
            {
                if (!cubeCols.Contains(col))
                {
                    throw Utility.Utils.getCustomException("DF_UNK_COLS",
                        @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - Dataflow columns must be components of the corrispondent cube.", Infrastructure.STLogging.Interface.LogLevelEnum.Warn);
                }
            }
        }

        /// <summary>
        /// Creates Dataset_<n>_ViewCurrentData view
        /// </summary>
        /// <param name="df">the dataflow.</param>
        private void createDDBDataflowViews(DDBDataflowWithCols df)
        {
            try
            {
                string cmd = $"CREATE VIEW [Dataset_DF{df.IDDataflow}_ViewCurrentData] AS " + Environment.NewLine +
                    $"SELECT {String.Join(",", df.DataflowColumns)} FROM Dataset_{df.IDCube}_ViewCurrentData";

                var filterStr = df.Filter?.ToSql();
                if (!string.IsNullOrWhiteSpace(filterStr))
                {
                    cmd += $" WHERE {filterStr}";
                }

                //creating view Dataset_DF<n>_ViewCurrentData
                mDataStore.ExecuteCommand(cmd);
            }
            catch (Exception ex)
            {
                throw Utility.Utils.getCustomException("DF_VIEW_DATA_CREATE",
                   @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - " + ex.Message, Infrastructure.STLogging.Interface.LogLevelEnum.Error);
            }
        }

        #endregion Private Methods
    }
}