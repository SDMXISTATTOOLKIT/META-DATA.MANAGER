using Configuration;
using DataModel;
using DataStore.Interface;
using DDB.Entities;
using Microsoft.AspNetCore.Http;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.IO;
using System.IO.Compression;
using System.Linq;
using System.Text;
using System.Xml;

namespace DataProvider
{
    public class UtilsDataProvider : IUtilsDataProvider
    {
        #region Campi privati

        private IDataStore mDataStore;
        private string mDBSchema;
        SqlCommandBuilder mBuilder;

        #endregion Campi privati

        public UtilsDataProvider(IDataStore dataStore)
        {
            mDataStore = dataStore;
            mDBSchema = mDataStore.Schema;
            mBuilder = new SqlCommandBuilder();
        }

        public DataResults getTablePreview(string tableName, OptionsTable optionsTable)
        {
            if (optionsTable == null)
            {
                return null;
            }

            var table = mDataStore.GetTableDefinition(tableName);

            var strSortColumn = GenerateSortColumn(optionsTable, table);

            var strSelColumn = GenerateSelectColumn(optionsTable, table);

            string query = $"SELECT {strSelColumn} FROM {mBuilder.QuoteIdentifier(tableName)}";
            string queryCount = $"SELECT COUNT(*) FROM {mBuilder.QuoteIdentifier(tableName)}";

            //START FILTER
            var listParam = new List<STKeyValuePair>();
            var filter = GenerateFilter(optionsTable, table, listParam);
            if (!string.IsNullOrWhiteSpace(filter))
            {
                query = $"{query} WHERE {filter}";
                queryCount = $"{queryCount} WHERE {filter}";
            }
            //END FILTER

            try
            {
                var count = (int)mDataStore.ExecuteScalar(queryCount, listParam.ToArray());
                string pagedQuery = mDataStore.GetPagedQuery(query, strSortColumn, optionsTable.PageNum - 1, optionsTable.PageSize, optionsTable.SortByDesc, strSelColumn);
                DataTable dt = mDataStore.GetTable(pagedQuery, listParam.ToArray());
                if (dt.Columns.Contains("__ROW_NUMBER__"))
                {
                    dt.Columns.Remove("__ROW_NUMBER__");
                }

                var result = new DataResults { Data = dt, Count = count };
                if (optionsTable.SelCols == null || optionsTable.SelCols.Count <= 0)
                {
                    result.Columns = new List<string>();
                    foreach (var item in table)
                    {
                        result.Columns.Add(item.Key);
                    }
                }
                else
                {
                    result.Columns = optionsTable.SelCols;
                }
                
                return result;
            }
            catch (Exception ex)
            {
                throw Utility.Utils.getCustomException("GET_TABLE_PREVIEW",
                   @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - " + ex.Message, Infrastructure.STLogging.Interface.LogLevelEnum.Error);
            }
        }

        public string GenerateSortColumn(OptionsTable optionsTable, Dictionary<string, ColumnDefinition> table)
        {
            //START SORT
            var strSortColumn = table.First().Value.ColumnName;
            if (optionsTable.SelCols != null && optionsTable.SelCols.Count > 0)
            {
                strSortColumn = optionsTable.SelCols[0];
            }
            if (optionsTable.SortCols != null && optionsTable.SortCols.Count > 0)
            { //In case of sort throw an exception if sortCols haven't a name of column db (this control also prevents the sql injection)
                var i = 0;
                foreach (var item in optionsTable.SortCols)
                {
                    if (!table.Values.Any(val => val.ColumnName.Equals(item, StringComparison.InvariantCultureIgnoreCase)))
                    {
                        throw Utility.Utils.getCustomException("GET_TABLE_INVALID_COLUMN_NAME",
                       @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - sort on unknown column.", Infrastructure.STLogging.Interface.LogLevelEnum.Error);
                    }
                    strSortColumn = i > 0 ? $"{strSortColumn},{item}" : item;
                    i++;
                }
            }
            return strSortColumn;
            //END SORT
        }

        public string GenerateSelectColumn(OptionsTable optionsTable, Dictionary<string, ColumnDefinition> table)
        {
            //START SELECT
            var strSelColumn = "*";
            if (optionsTable.SelCols != null && optionsTable.SelCols.Count > 0)
            { //In case of sort throw an exception if selCols haven't a name of column db (this control also prevents the sql injection)
                var i = 0;
                strSelColumn = "";
                foreach (var item in optionsTable.SelCols)
                {
                    if (!table.Values.Any(val => val.ColumnName.Equals(item, StringComparison.InvariantCultureIgnoreCase)))
                    {
                        throw Utility.Utils.getCustomException("GET_TABLE_INVALID_COLUMN_SELECT",
                       @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - select on unknown column.", Infrastructure.STLogging.Interface.LogLevelEnum.Error);
                    }
                    strSelColumn = i > 0 ? $"{strSelColumn},{mBuilder.QuoteIdentifier(item)}" : mBuilder.QuoteIdentifier(item);
                    i++;
                }
            }
            return strSelColumn;
            //END SELECT
        }

        public DataResults getTableColumnPreview(string tableName, OptionsTable optionsTable)
        {
            if (optionsTable == null || optionsTable.SelCols == null || optionsTable.SelCols.Count <= 0)
            {
                return null;
            }

            var table = mDataStore.GetTableDefinition(tableName);

            var colName = optionsTable.SelCols[0];
            if (!table.Values.Any(val => val.ColumnName.Equals(colName, StringComparison.InvariantCultureIgnoreCase)))
            {
                throw Utility.Utils.getCustomException("GET_TABLE_COLUMN_PREVIEW_INVALID_COLUMN_SELECT",
               @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - select on unknown column.", Infrastructure.STLogging.Interface.LogLevelEnum.Error);
            }

            string query = $"SELECT DISTINCT {mBuilder.QuoteIdentifier(colName)} FROM {mBuilder.QuoteIdentifier(tableName)}";
            string queryCount = $"SELECT COUNT(DISTINCT {mBuilder.QuoteIdentifier(colName)}) FROM {mBuilder.QuoteIdentifier(tableName)}";

            //START FILTER
            var listParam = new List<STKeyValuePair>();
            var filter = GenerateFilter(optionsTable, table, listParam);
            if (!string.IsNullOrWhiteSpace(filter))
            {
                query = $"{query} WHERE {filter}";
                queryCount = $"{queryCount} WHERE {filter}";
            }
            //END FILTER

            try
            {
                var count = (int)mDataStore.ExecuteScalar(queryCount, listParam.ToArray());
                string pagedQuery = mDataStore.GetPagedQuery(query, colName, optionsTable.PageNum - 1, optionsTable.PageSize, optionsTable.SortByDesc);
                DataTable dt = mDataStore.GetTable(pagedQuery, listParam.ToArray());
                if (dt.Columns.Contains("__ROW_NUMBER__"))
                {
                    dt.Columns.Remove("__ROW_NUMBER__");
                }
                return new DataResults { Data = dt, Count = count, Columns = new List<string>(){ colName } };
            }
            catch (Exception ex)
            {
                throw Utility.Utils.getCustomException("GET_TABLE_COLUMN_PREVIEW",
                   @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - " + ex.Message, Infrastructure.STLogging.Interface.LogLevelEnum.Error);
            }
        }

        public string GenerateFilter(OptionsTable optionsTable, Dictionary<string, ColumnDefinition> table, List<STKeyValuePair> listParam)
        {
            var i = 0;
            if (optionsTable.FilterTable != null && optionsTable.FilterTable.Count > 0)
            { //In case of filter throw an exception if filterCols haven't a name of column db (this control also prevents the sql injection)
                var strFilterAnd = new StringBuilder();
                var strFilterOr = new StringBuilder();
                foreach (var item in optionsTable.FilterTable)
                {
                    var colFilter = table.Values.FirstOrDefault(val => val.ColumnName.Equals(item.ColName, StringComparison.InvariantCultureIgnoreCase));

                    var colName = mBuilder.QuoteIdentifier(colFilter.ColumnName);
                    var colParam = colFilter.ColumnName.Replace(' ', '_');
                    if (colFilter == null)
                    {
                        throw Utility.Utils.getCustomException("GET_TABLE_INVALID_COLUMN_NAME",
                        @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - filter on unknown column.", Infrastructure.STLogging.Interface.LogLevelEnum.Error);
                    }
                    if (!FilterTable.Operators.Contains(item.Oper.ToUpperInvariant()))
                    {
                        throw Utility.Utils.getCustomException("GET_TABLE_INVALID_OPERATOR_NAME",
                       @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - operator unknown.", Infrastructure.STLogging.Interface.LogLevelEnum.Error);
                    }
                    if (item.IsAnd && strFilterAnd.Length > 0)
                    {
                        strFilterAnd.Append(" AND ");
                    }
                    if (!item.IsAnd && strFilterOr.Length > 0)
                    {
                        strFilterOr.Append(" OR ");
                    }

                    if (item.IsAnd)
                    {
                        strFilterAnd.Append($"{colName} {item.Oper} {mDataStore.PARAM_PREFIX}{colParam}{i}");
                    }
                    else
                    {
                        strFilterOr.Append($"{colName} {item.Oper} {mDataStore.PARAM_PREFIX}{colParam}{i}");
                    }

                    if (item.Oper.Equals("LIKE", StringComparison.InvariantCultureIgnoreCase) || item.Oper.Equals("NOT LIKE", StringComparison.InvariantCultureIgnoreCase))
                    {
                        listParam.Add(new STKeyValuePair(colParam + i, $"%{item.Val}%"));
                    }
                    else
                    {
                        listParam.Add(new STKeyValuePair(colParam + i, item.Val));
                    }
                    i++;
                }
                if (strFilterAnd.Length > 0 && strFilterOr.Length > 0)
                {
                    return $"{strFilterAnd} AND ({strFilterOr})";
                }
                else if (strFilterAnd.Length > 0)
                {
                    return strFilterAnd.ToString();
                }
                else if (strFilterOr.Length > 0)
                {
                    return strFilterOr.ToString();
                }
            }
            return "";
        }

        public string uploadFileOnServer(IFormFile file, int idCube)
        {
            List<string> allowedFormats = new List<string>() { ".csv", ".xml", ".zip" };

            const int bufferSize = 4096;
            var fileName = "";
            var path = "";
            using (var zip = new ZipArchive(file.OpenReadStream(), ZipArchiveMode.Read))
            {
                foreach (var entry in zip.Entries)
                {
                    using (var stream = entry.Open())
                    {
                        fileName = entry.Name;
                        string baseDir = ConfigurationManager.AppSettings["DMApiSettings:IMPORT_FILE_BASE_DIR"].ToString() +
                                 (idCube == 0 ? "\\Temp" : getCubePath(idCube) + "\\DaCaricare");                    

                        string strFileName = Path.GetFileNameWithoutExtension(fileName) + "_" + DateTime.Now.ToString("yyyyMMdd_HHmmssfff") + Path.GetExtension(fileName);

                        path = Path.Combine(baseDir, strFileName);

                        FileInfo fileInfo = new FileInfo(path);
                        //creo la cartella se non esiste
                        fileInfo.Directory.Create();

                        //delete old files for mapping
                        if (idCube == 0)
                        {
                            string[] files = Directory.GetFiles(baseDir);
                            foreach (string oldFile in files)
                            {
                                var fi = new FileInfo(oldFile);
                                if (fi.LastAccessTime < DateTime.Now.AddDays(-1))
                                {
                                    try
                                    {
                                        fi.Delete();
                                    }
                                    catch(Exception)
                                    {

                                    }
                                }
                            }
                        }

                        using (FileStream ms = File.Create(path))
                        {
                            var buffer = new byte[bufferSize];
                            int numRead;
                            while ((numRead = stream.Read(buffer, 0, buffer.Length)) != 0)
                            {
                                ms.Write(buffer, 0, numRead);
                            }
                            ms.Position = 0;
                        }
                    }
                    break;
                }
            }

            if (!allowedFormats.Contains(Path.GetExtension(fileName.ToLower())))
            {
                File.Delete(path);
                throw Utility.Utils.getCustomException("FILE_UPLOAD_FORMAT",
                   @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - Impossible upload file " + Path.GetExtension(fileName) + " to server.", Infrastructure.STLogging.Interface.LogLevelEnum.Error);
            }

            try
            {
                //checks file format correctness
                Utility.SdmxUtils.checkFileFormat(fileName, false);

                return path.Replace(ConfigurationManager.AppSettings["DMApiSettings:IMPORT_FILE_BASE_DIR"], "");
            }
            catch (Exception ex)
            {
                File.Delete(path);
                throw Utility.Utils.getCustomException("UPLOAD_FILE_ON_SERVER",
                   @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - " + ex.Message, Infrastructure.STLogging.Interface.LogLevelEnum.Error);
            }
        }

        public string uploadReferenceMetadataFileOnServer(IFormFile file)
        {
            const int bufferSize = 4096;
            var fileName = "";
            var path = "";
            var newPath = "";
            using (var zip = new ZipArchive(file.OpenReadStream(), ZipArchiveMode.Read))
            {
                foreach (var entry in zip.Entries)
                {
                    using (var stream = entry.Open())
                    {
                        fileName = entry.Name;
                        string pathUpload = ConfigurationManager.AppSettings["DMApiSettings:IMPORT_REFERENCE_METADATA_BASE_DIR"].ToString();
                        
                        var fileNameOnly = Path.GetFileNameWithoutExtension(fileName);
                        var extension = Path.GetExtension(fileName);
                        
                        path = Path.Combine(pathUpload, fileName);

                        FileInfo fileInfo = new FileInfo(path);
                        //creates the folder if it does not exist
                        fileInfo.Directory.Create();
                        
                        newPath = path;
                        int count = 1;
                        while (File.Exists(newPath))
                        {
                            fileName = $"{fileNameOnly}({count++}){extension}";
                            newPath = Path.Combine(pathUpload, fileName);
                        }
                        //.Log($"upload file on {newFullPath}", Infrastructure.STLogging.Interface.LogLevelEnum.Info);

                        using (FileStream ms = File.Create(newPath))
                        {
                            var buffer = new byte[bufferSize];
                            int numRead;
                            while ((numRead = stream.Read(buffer, 0, buffer.Length)) != 0)
                            {
                                ms.Write(buffer, 0, numRead);
                            }
                            ms.Position = 0;
                        }
                    }
                    break;
                }
            }
            

            try
            {
                return fileName.Replace(ConfigurationManager.AppSettings["DMApiSettings:IMPORT_REFERENCE_METADATA_BASE_DIR"], "");
            }
            catch (Exception ex)
            {
                File.Delete(path);
                throw Utility.Utils.getCustomException("UPLOAD_FILE_ON_SERVER",
                   @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - " + ex.Message, Infrastructure.STLogging.Interface.LogLevelEnum.Error);
            }
        }

        public string referenceMetadataFileOnServer(string filename)
        {
            return Path.Combine(ConfigurationManager.AppSettings["DMApiSettings:IMPORT_REFERENCE_METADATA_BASE_DIR"].ToString(), filename);
        }
        public string getConnectionString()
        {
            return getConnectionString(ConfigurationManager.AppSettings["DataStoreSettings:DATA_PROVIDER_NAME"]);
        }
        public string getConnectionRMDBString()
        {
            return getConnectionString(ConfigurationManager.AppSettings["RMManagerSettings:DATA_PROVIDER_NAME"]);
        }

        public void RemoveTempTableAndViews()
        {
            string[] tables = mDataStore.GetExistingTables();

            foreach (string item in tables)
            {
                if(item.StartsWith("TMP_"))
                    mDataStore.ExecuteCommand("DROP TABLE " + mBuilder.QuoteIdentifier(item));
            }

            string[] views = mDataStore.GetExistingViews();

            foreach (string item in views)
            {
                if (item.StartsWith("TMP_"))
                    mDataStore.ExecuteCommand("DROP VIEW " + mBuilder.QuoteIdentifier(item));
            }
        }

        public bool CheckInizializedDDB()
        {
            return ((int) mDataStore.ExecuteScalar("SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = N'DDB_VERSION'"))>0;
        }

        public bool InizializeDDB()
        {
            try
            {
                if (CheckInizializedDDB())
                {
                    return false;
                }

                mDataStore.BeginTransaction();

                string sql = File.ReadAllText(@"config\base\DDB1.sql");
                foreach (var batch in sql.Split(new string[] { "\nGO", "\ngo" }, StringSplitOptions.RemoveEmptyEntries))
                {
                    mDataStore.ExecuteCommand(batch);
                }

                sql = File.ReadAllText(@"config\base\DDB2_upload_TIME_PERIOD.sql");
                foreach (var batch in sql.Split(new string[] { "\nGO", "\ngo" }, StringSplitOptions.RemoveEmptyEntries))
                {
                    mDataStore.ExecuteCommand(batch);
                }

                mDataStore.CommitTransaction();
            }
            catch (Exception ex)
            {
                mDataStore.RollbackTransaction();
                throw Utility.Utils.getCustomException("InizializeDDB",
                   @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - " + ex.Message, Infrastructure.STLogging.Interface.LogLevelEnum.Error);
            }
            return true;
        }

        public void createTempTableForUniqueValues(string tableName, List<string> values)
        {
            STKeyValuePair[] parameters = new STKeyValuePair[] { new STKeyValuePair("tableName", tableName) };

            if (mDataStore.ExistsTable(tableName))
            {
                mDataStore.ExecuteCommand($"DROP TABLE {mBuilder.QuoteIdentifier(tableName)}");
            }

            mDataStore.ExecuteCommand($@"CREATE TABLE {mBuilder.QuoteIdentifier(tableName)} (Code varchar(50) NOT NULL)");
            mDataStore.ExecuteCommand($@"ALTER TABLE {mBuilder.QuoteIdentifier(tableName)} ADD PRIMARY KEY(Code)");

            DataTable dt = new DataTable(tableName);
            dt.Columns.Add("Code", typeof(string));
            dt.Columns["Code"].MaxLength = 150;
            dt.PrimaryKey = new DataColumn[] { dt.Columns["Code"] };
            foreach (string c in values)
                dt.Rows.Add(new Object[] {c});

            mDataStore.InsertUpdateData(dt);
        }

        #region Private methods
        private string getConnectionString(string providerName)
        {
            try
            {
                if (providerName == null)
                {
                    return null;
                }
                var valueConnection = ConfigurationManager.AppSettings["DATA_PROVIDER_NAME:" + providerName + ":CONN_STR"];
                if (valueConnection == null)
                {
                    return null;
                }
                return Utility.Utils.Encrypt(valueConnection, ConfigurationManager.AppSettings["DMApiSettings:ENCRYPTION_PASSW"]);
            }
            catch (Exception ex)
            {
                throw Utility.Utils.getCustomException("GET_CONNECTION_STRING",
                   @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - " + ex.Message, Infrastructure.STLogging.Interface.LogLevelEnum.Error);
            }
        }

        private string getCubePath(int cubeId)
        {
            STKeyValuePair[] parameters = new STKeyValuePair[] { new STKeyValuePair("IDCube", cubeId) };

            DataTable tb = mDataStore.GetTable(@"SELECT * FROM CatCube WHERE IDCube = @IDCube", parameters);

            if (tb.Rows.Count != 1)
            {
                throw Utility.Utils.getCustomException("CUBE_NOT_FOUND",
                   @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - " + $" - Cube {cubeId} not found.", Infrastructure.STLogging.Interface.LogLevelEnum.Warn);
            }

            string catStr = DBNull.Value.Equals(tb.Rows[0]["IDCat"]) ? null : tb.Rows[0]["IDCat"].ToString();

            if (catStr == null)
                return "\\Uncategorised";

            List<Category> cats = new BuilderDataProvider(mDataStore).getDCS();

            Category cat = cats.Where(c => c.IDCat.ToString() == catStr).Single();

            string path = '\\' + cat.CatCode;

            while (cat.ParCode != null)
            {
                cat = cats.Where(c => c.CatCode == cat.ParCode).Single();
                path = '\\' + cat.CatCode + path;
            }

            return path;
        }

        #endregion Private methods
    }
}
