using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using DataStore.Interface;
using Infrastructure.STLogging.Factory;
using System.Data.SqlClient;
using DataStore.Base;
using System.Data.Common;

namespace DataStore.SQLServerDataStore
{
    public class SQLServerDataStore : BaseDataStore
    {
        #region Campi privati

        private SqlConnection mConn;

        #endregion Campi privati

        #region Campi protetti

        static ICollection<string> mReservedWords = new HashSet<string>(new string[] { "UID", "LOCK", "SCHEMA" });


        #endregion Campi protetti

        #region Costruttori e inizializzazione

        public SQLServerDataStore(string connStr, string schema) : base(connStr, schema)
        {
        }
        public SQLServerDataStore(DataStoreConfig dataStoreConfig)
            : base(dataStoreConfig)
        {
        }

        #endregion Costruttori e inizializzazione

        #region Implementazione IDatabaseUtils

        public override IDbConnection Connection
        {
            get
            {
                if (mConn == null)
                {


                    mConn = new SqlConnection(mConnStr);

                    mConn.StateChange += (sender, e) =>
                    {
                        if (e.CurrentState == ConnectionState.Open)
                        {
                            SqlCommand cmd = new SqlCommand("set transaction isolation level read uncommitted", mConn);
                            cmd.ExecuteNonQuery();
                            cmd.Dispose();
                        }
                    };
                }

                return mConn;
            }
        }

        void mConn_StateChange(object sender, StateChangeEventArgs e)
        {
            throw new NotImplementedException();
        }


        public override IDbCommand CreateCommand(string txt, IDbConnection conn, IDbTransaction transaction = null)
        {
            if (transaction == null)
            {
                transaction = mCurrentTransaction;
            }

            SqlCommand cmd = new SqlCommand(txt, (conn ?? Connection) as SqlConnection);

            cmd.CommandTimeout = 0;

            if (transaction != null)
            {
                ((IDbCommand)cmd).Transaction = transaction;
            }

            return cmd;
        }

        public override IBulkCopy GetBulkCopy(IDbConnection connection = null, BulkCopyOptions copyOptions = BulkCopyOptions.Default, IDbTransaction externalTransaction = null)
        {
            return new SQLBulkCopyWrapper(connection ?? Connection, copyOptions, externalTransaction);
        }

        public override IDataAdapter CreateDataAdapter(IDbCommand cmd, bool withBuilder = false)
        {
            var adp = new SqlDataAdapter(cmd as SqlCommand);

            if (withBuilder)
            {
                var cmdBld = new SqlCommandBuilder(adp);
                adp.DeleteCommand = cmdBld.GetDeleteCommand();
                adp.InsertCommand = cmdBld.GetInsertCommand();
                adp.UpdateCommand = cmdBld.GetUpdateCommand();
            }

            return adp;
        }

        public override IDbDataParameter CreateParameter(string name, string filedName, Type valueType, int size)
        {

            if (!name.StartsWith(PARAM_PREFIX))
            {
                name = PARAM_PREFIX + name;
            }

            string udtTypeName = "";

            SqlDbType dbType = SqlTypeMaping(valueType, out udtTypeName, size);

            SqlParameter parameter = new SqlParameter(name, dbType, size, filedName);

            if (!string.IsNullOrEmpty(udtTypeName))
            {
                parameter.UdtTypeName = udtTypeName;
            }

            return parameter;
        }


        public override IDbDataParameter CreateParameter(string name, object value)
        {

            if (!name.StartsWith(PARAM_PREFIX))
            {
                name = PARAM_PREFIX + name;
            }

            if (value == null)
            {
                value = DBNull.Value;
            }

            IDbDataParameter parameter = null;

            parameter = new SqlParameter(name, value);

            return parameter;

        }


        public override string GetBitAndOperationExpression(string fieldName, string fieldValue)
        {
            return "(" + fieldName + " & CAST(" + fieldValue + " as bigint))";
        }

        public override string GetCurrentDateExpression()
        {
            return "getdate()";
        }

        public override string GetDateDifferenceExpression(string startDateField, string endDateField, DateDiffPartEnum dateDiffPart)
        {
            string script = "DATEDIFF (<DATE_PART>, " + startDateField + ", " + endDateField + ")";

            if (dateDiffPart == DateDiffPartEnum.Minutes)
                script = script.Replace("<DATE_PART>", "minute");
            else if (dateDiffPart == DateDiffPartEnum.Hours)
                script = script.Replace("<DATE_PART>", "hour");
            else if (dateDiffPart == DateDiffPartEnum.Days)
                script = script.Replace("<DATE_PART>", "day");
            else
                script = script.Replace("<DATE_PART>", "second");

            return script;
        }

        /// <summary>
        /// Restituisce l'espressione per fare il parse di una data secondo un certo formato.
        /// </summary>
        /// <param name="dateExpr"></param>
        /// <param name="format"></param>
        /// <returns></returns>
        public override string GetParseDateExpression(string dateExpr, string format)
        {
            if (format == "yyyymmdd")
            {
                return $"cast({dateExpr} as datetime)";
            }

            throw new Exception($"Formato {format} non supportato");
        }

        public override string GetBitOrOperationExpression(string fieldName, string fieldValue)
        {
            return "(" + fieldName + " | CAST(" + fieldValue + " as bigint))";
        }

        protected override string GetStoreProcedureCmd(string spName, STKeyValuePair[] spParams = null)
        {
            string cmdTxt = "EXECUTE " + spName;

            if (spParams != null)
            {
                foreach (STKeyValuePair spp in spParams)
                {
                    cmdTxt += " @" + spp.Key.ToString() + ",";
                }

                if (cmdTxt.EndsWith(","))
                {
                    cmdTxt = cmdTxt.Substring(0, cmdTxt.Length - 1);
                }
            }

            return cmdTxt;
        }

        public override string GetPagedQuery(string query, string sortColumn, int pageIndex, int pageSize, bool sortByDesc)
        {
            return GetPagedQuery(query, sortColumn, pageIndex, pageSize, sortByDesc, "*");
        }

        public override string GetPagedQuery(string query, string sortColumn, int pageIndex, int pageSize, bool sortByDesc, string selCols)
        {
            var strSelCols = "*";
            if (!string.IsNullOrWhiteSpace(selCols))
            {
                strSelCols = selCols;
            }

            if (pageIndex == 0)
            {
                var strPageSize = "";
                if (pageSize >= 0)
                {
                    strPageSize = $"TOP {pageSize}";
                }
                string cmdTxt = $@"SELECT {strPageSize} {strSelCols} FROM (<query>) q ORDER BY <sortColumn> <orderByDesc>";

                return cmdTxt.Replace("<query>", query)
                    .Replace("<sortColumn>", sortColumn)
                    .Replace("<orderByDesc>", sortByDesc ? "DESC" : "ASC");
            }
            else
            {

                string cmdTxt = $@"
                SELECT  {strSelCols}
                FROM    (
                    SELECT *,
                           ROW_NUMBER() OVER(ORDER BY <sortColumn> <orderByDesc>) __ROW_NUMBER__
                        FROM    (<query>) q
                )qq
                ORDER BY __ROW_NUMBER__ OFFSET (<pageIndex> * <pageSize>) ROWS FETCH NEXT <pageSize> ROWS ONLY";

                return cmdTxt.Replace("<query>", query)
                        .Replace("<sortColumn>", sortColumn)
                        .Replace("<pageIndex>", pageIndex.ToString())
                        .Replace("<pageSize>", pageSize.ToString())
                        .Replace("<orderByDesc>", sortByDesc ? "DESC" : "ASC");
            }
        }

            public string GetPagedQueryOld(string query, string sortColumn, int pageIndex, int pageSize, bool sortByDesc, string selCols)
        {
            //TODO: Using OFFSET and FETCH in SQL Server 2012

            var strSelCols = "*";
            if (!string.IsNullOrWhiteSpace(selCols))
            {
                strSelCols = selCols;
            }

            if (pageIndex == 0)
            {
                var strPageSize = "";
                if (pageSize >= 0)
                {
                    strPageSize = $"TOP {pageSize}";
                }
                string cmdTxt = $@"SELECT {strPageSize} {strSelCols} FROM (<query>) q ORDER BY <sortColumn> <orderByDesc>";

                return cmdTxt.Replace("<query>", query)
                    .Replace("<sortColumn>", sortColumn)
                    .Replace("<orderByDesc>", sortByDesc ? "DESC" : "ASC");
            }
            else
            {
                string cmdTxt = $@"WITH PageNumbers AS(
                        SELECT *,
                                ROW_NUMBER() OVER(ORDER BY <sortColumn> <orderByDesc>) __ROW_NUMBER__
                        FROM    (<query>) q
                )
                SELECT  {strSelCols}
                FROM    PageNumbers
                WHERE   __ROW_NUMBER__  BETWEEN (<pageIndex> * <pageSize> + 1)
                        AND ( (<pageIndex> + 1) * <pageSize>)";

                return cmdTxt.Replace("<query>", query)
                    .Replace("<sortColumn>", sortColumn)
                    .Replace("<pageIndex>", pageIndex.ToString())
                    .Replace("<pageSize>", pageSize.ToString())
                    .Replace("<orderByDesc>", sortByDesc ? "DESC" : "ASC");
            }
        }

        public override string ISNULL_FUNC_NAME
        {
            get
            {
                return "ISNULL";
            }
        }

        public override string CONCAT_STRING_KEYWORD
        {
            get
            {
                return "+";
            }
        }

        public override string START_ESCAPE_CHAR
        {
            get
            {
                return "[";
            }
        }

        public override string END_ESCAPE_CHAR
        {
            get
            {
                return "]";
            }
        }

        public override string PARAM_PREFIX { get { return "@"; } }

        public override string END_MERGE_CHAR
        {
            get
            {
                return ";";
            }
        }

        #endregion Implementazione IDatabaseUtils

        public override string UCaseExpressionNCS(string expression)
        {
            //In sqlserver non serve fare l'ucase perché di default le query sono già non case sensitive
            return expression;
        }

        public override string TypeMapping(Type type, int columnSize, int columnPrecision = 0, int columnScale = 0)
        {
            switch (type.FullName)
            {
                case "System.Int64":
                case "System.UInt64":
                    return "bigint";

                case "System.Byte[]":
                    if (columnSize <= 0 || columnSize > 2000)
                    {
                        return "image";
                    }
                    else
                    {
                        return "varbinary(" + columnSize.ToString() + ")";
                    }

                case "System.Boolean":
                    return "bit";

                case "System.String":
                    if (columnSize <= 0 || columnSize > 4000)
                    {
                        return "text";
                    }
                    else
                    {
                        return "nvarchar(" + columnSize.ToString() + ")";
                    }

                case "System.DateTime":
                    return "datetime";

                case "System.Decimal":
                    if (columnScale >= 127)
                    {
                        return "decimal";
                    }

                    string precision = (columnPrecision > 0 && columnPrecision < 38) ? columnPrecision.ToString() : "38";
                    string scale = (columnScale > -84 && columnScale < 127) ? "," + columnScale.ToString() : "";

                    return "numeric(" + precision + scale + ")";

                case "System.Double":
                    return "float";

                case "System.Single":
                    return "real";

                case "System.Guid":
                    return "uniqueidentifier";

                case "System.Int32":
                case "System.UInt32":
                    return "int";

                case "System.Int16":
                case "System.UInt16":
                    return "smallint";

                default:
                    throw new ArgumentOutOfRangeException("type", $"Unable to map this type {type.FullName}.");
            }
        }

        private SqlDbType SqlTypeMaping(Type type, out string udtTypeName, int columnSize = 0, int columnPrecision = 0, int columnScale = 0)
        {
            udtTypeName = "";

            switch (type.FullName)
            {
                case "System.Int64":
                case "System.UInt64":
                    return SqlDbType.BigInt;

                case "System.Byte[]":
                    if (columnSize <= 0 || columnSize > 2000)
                    {
                        return SqlDbType.Image;
                    }
                    else
                    {
                        return SqlDbType.VarBinary;
                    }

                case "System.Boolean":
                    return SqlDbType.Bit;

                case "System.String":
                    if (columnSize == 0)
                    {
                        return SqlDbType.Text;
                    }
                    else
                    {
                        return SqlDbType.NVarChar;
                    }

                case "System.DateTime":
                    return SqlDbType.DateTime;

                case "System.Decimal":
                    return SqlDbType.Decimal;

                case "System.Double":
                    return SqlDbType.Float;

                case "System.Single":
                    return SqlDbType.Real;

                case "System.Guid":
                    return SqlDbType.UniqueIdentifier;

                case "System.Int32":
                case "System.UInt32":
                    return SqlDbType.Int;

                case "System.Int16":
                case "System.UInt16":
                    return SqlDbType.SmallInt;

                default:
                    throw new ArgumentOutOfRangeException("type", $"Unable to map this type {type.FullName}.");
            }
        }

        protected override ICollection<string> ReservedWords
        {
            get
            {
                return mReservedWords;
            }
        }

        /// <summary>
        /// Restituisce lo script per creare una tabella direttamente da una query
        /// </summary>
        /// <param name="tableName"></param>
        /// <param name="select"></param>
        /// <returns></returns>
        public override string GetCreateTableFromSelectScript(string tableName, string select)
        {
            int idx = select.ToUpper().IndexOf("FROM");

            string selectFieldsPart = select.Substring(0, idx);

            string selectFromPart = select.Substring(idx);

            return selectFieldsPart + " INTO " + tableName + @"
" + selectFromPart;
        }

        public override string GetViewDefinition(string viewName)
        {
            string viewDefinition = null;

            string cmdTxt = @"SELECT TABLE_NAME as ViewName, VIEW_DEFINITION as ViewDefinition FROM INFORMATION_SCHEMA.Views
                                WHERE TABLE_NAME = '" + viewName + "'";

            IDataReader reader = ExecuteReader(cmdTxt);

            try
            {
                if (reader.Read())
                {
                    viewDefinition = reader["ViewDefinition"].ToString();
                }
            }
            finally
            {
                reader.Close();

                if (Connection.State == ConnectionState.Open)
                    Connection.Close();
            }

            return viewDefinition;
        }


        public override string GetSubstringOperator(string sourceStr, int fromPos, int length)
        {
            return "SUBSTRING(" + sourceStr + ", " + fromPos.ToString() + ", " + length.ToString() + ")";
        }

        public override string GetTrimOperator(string sourceStr)
        {
            return "RTRIM(LTRIM(" + sourceStr + "))";
        }

        protected override string GetSearchExistingIndexesQuery(string tableName)
        {
            return $@"SELECT*
                      FROM sys.indexes
                      WHERE object_id = OBJECT_ID('{tableName}')";
         }


        protected override string GetSearchExistingTablesQuery(string nameFilter = null, string owner = null)
        {
            if (string.IsNullOrEmpty(owner))
            {
                owner = mSchema;
            }

            string query = @"select table_name from INFORMATION_SCHEMA.TABLES
                             WHERE  table_schema = '" + owner + @"'
                                    AND TABLE_TYPE = 'BASE TABLE'";

            if (!string.IsNullOrEmpty(nameFilter))
            {
                query += " AND table_name like '" + nameFilter + "%'";
            }

            return query;
        }

        protected override string GetSearchExistingViewsQuery(string nameFilter = null, string owner = null)
        {
            if (string.IsNullOrEmpty(owner))
            {
                owner = mSchema;
            }

            string query = @"select table_name from INFORMATION_SCHEMA.TABLES
                            WHERE table_schema = '" + owner + @"'
                            AND TABLE_TYPE = 'VIEW'";

            if (!string.IsNullOrEmpty(nameFilter))
            {
                query += " AND table_name like '" + nameFilter + "%'";
            }

            return query;
        }

        protected override string ConcatCommands(string[] commands)
        {
            string cmdTxt = "";

            foreach (string cmd in commands)
            {
                cmdTxt += cmd + ";\r\n";
            }

            return cmdTxt;
        }

        protected override string GetViewUpdateScript(string srcTableName, string destTableName, ICollection<DataColumn> updateColumns, ICollection<DataColumn> primaryKeycolumns, Dictionary<string, string> colMapping = null)
        {
            var upds = updateColumns
                .Select(c => c.ColumnName)
                .Select(c => $"{((colMapping != null && colMapping.ContainsKey(c)) ? colMapping[c] : c)} = TMP.{c}").Select(c => this.QuoteName(c)).Aggregate((c1, c2) => $"{c1}, {c2}");

            var pks = primaryKeycolumns
                .Select(c => c.ColumnName)
                .Select(c => $"<DEST_TABLE>.{((colMapping != null && colMapping.ContainsKey(c)) ? colMapping[c] : c)} = TMP.{c}").Aggregate((c1, c2) => $"{c1} AND {c2}");

            var cmdUpd = $@"UPDATE <DEST_TABLE>
                            SET {upds} 
                            FROM <SRC_TABLE> TMP
                            WHERE {pks}";

            return cmdUpd.Replace("<SRC_TABLE>", srcTableName).Replace("<DEST_TABLE>", destTableName);
        }


        /// <summary>
        /// Restituisce la query per ottenere le prime N righe a partire dal comando passato.
        /// </summary>
        /// <param name="cmdTxt"></param>
        /// <param name="numRows"></param>
        /// <returns></returns>
        public override string GetTopNRowsQuery(string cmdTxt, int numRows)
        {
            int idx = cmdTxt.ToUpper().IndexOf("SELECT");

            if (idx == -1)
            {
                throw new Exception("La query passata non è nel formato corretto: deve rappresentare una selezione.");
            }

            return cmdTxt.Insert(idx + 6, $" TOP {numRows} ");
        }

        public override void Dispose()
        {
            if (mConn != null)
            {
                mConn.Dispose();
            }
        }

        protected override string GetExpiredObjectsQuery(int expireDays, string type = null, string objectPrefix = null)
        {
            string query = @"SELECT o.NAME as OBJECT_NAME, CASE WHEN o.type = 'V' THEN 'VIEW' ELSE 'TABLE' END as OBJECT_TYPE
                             FROM sys.ALL_OBJECTS o
                             left join sys.SCHEMAS s on o.schema_id = s.schema_id
                             WHERE s.name = '" + this.Schema + @"' AND
                                DATEADD(DAY, " + TEMP_TABLE_EXPIRE_DAYS.ToString() + @", o.modify_date) < GETDATE()";

            if (!string.IsNullOrEmpty(type))
            {
                if (type == "TABLE")
                {
                    query += @"AND o.type = 'U'";
                }
                else if (type == "VIEW")
                {
                    query += @"AND o.type = 'V'";
                }
            }

            if (!string.IsNullOrEmpty(objectPrefix))
            {
                query += "AND o.NAME like '" + objectPrefix + @"%'";
            }

            return query;
        }

        public override void WriteBulk(string destTableName, DataRow[] rowsToWrite, int? timeout = null)
        {
            if (rowsToWrite.Length == 0)
            {
                return;
            }

            DataTable tbToWrite = rowsToWrite[0].Table;

            List<SqlBulkCopyColumnMapping> lstColMappings = tbToWrite.Columns.Cast<DataColumn>()
                        .Select(c => new SqlBulkCopyColumnMapping(c.ColumnName, c.ColumnName)).ToList();

            _WriteBulk(destTableName, rowsToWrite, lstColMappings, timeout);
        }

        protected void _WriteBulk(string destTableName, DataRow[] rowsToWrite, ICollection<SqlBulkCopyColumnMapping> colMappings, int? timeout = null)
        {
            bool mustCloseConn = false;

            try
            {
                if (Connection.State != ConnectionState.Open)
                {
                    Connection.Open();

                    mustCloseConn = true;
                }

                SqlBulkCopy bulk = new SqlBulkCopy(Connection as SqlConnection, SqlBulkCopyOptions.Default, (SqlTransaction)mCurrentTransaction);

                if (timeout != null)
                {
                    bulk.BulkCopyTimeout = timeout.Value;
                }

                if (colMappings != null)
                    foreach (var colMapping in colMappings)
                        bulk.ColumnMappings.Add(colMapping);

                bulk.DestinationTableName = destTableName;

                bulk.BatchSize = 10000;

                STLoggerFactory.Logger.Log(this.GetType().Name + " - _WriteBulk: " + rowsToWrite.Length.ToString() + " in " + destTableName, Infrastructure.STLogging.Interface.LogLevelEnum.Debug);

                bulk.WriteToServer(rowsToWrite);
            }
            finally
            {
                if (mustCloseConn)
                {
                    Connection.Close();
                }
            }
        }

        /// <summary>
        /// Restituisce la query per avere i metadati di una tabella
        /// </summary>
        /// <param name="tableName"></param>
        /// <returns></returns>
        protected override string GetSQLTableMetadata(string tableName)
        {
            string sql = null;

            sql = @"SELECT S.TABLE_NAME,S.COLUMN_NAME AS FIELD_NAME, S.COLUMN_NAME as ALIAS_NAME, NULL as DOMAIN_NAME, null as SUB_TYPE_NAME, S.DATA_TYPE, S.IS_NULLABLE,  S.CHARACTER_MAXIMUM_LENGTH CHAR_LENGTH,  PK.PK_COLUMN_NAME  
                        FROM INFORMATION_SCHEMA.COLUMNS S  
                        LEFT JOIN 
                        (  
	                        SELECT TABLE_NAME, COLUMN_NAME AS PK_COLUMN_NAME 
	                        FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE  
	                        WHERE OBJECTPROPERTY(OBJECT_ID(CONSTRAINT_SCHEMA + '.' + QUOTENAME(CONSTRAINT_NAME)), 'IsPrimaryKey') = 1  
		                        AND TABLE_SCHEMA = '" + this.Schema + @"' AND TABLE_NAME = '" + tableName + @"' 
                        ) PK ON PK.PK_COLUMN_NAME = S.COLUMN_NAME  
                        WHERE TABLE_SCHEMA ='" + this.Schema + @"' AND S.TABLE_NAME = '" + tableName + "'";

            return sql;

        }

        public override DbParameter GetParameter(ColumnDefinition columnDefinition, object val)
        {
            throw new NotImplementedException();
        }

        protected override Type SystemTypeMapping(string slqType)
        {
            switch (slqType.ToLower())
            {
                case "bigint":
                    return Type.GetType("System.Int64");
                case "binary":
                case "varbinary":
                case "image":
                    return Type.GetType("System.Byte[]");
                case "bit":
                    return Type.GetType("System.Boolean");
                case "char":
                case "nchar":
                case "ntext":
                case "nvarchar":
                case "text":
                case "varchar":
                case "xml":
                    return Type.GetType("System.String");
                case "date":
                case "datetime":
                case "datetime2":
                case "datetimeoffset":
                case "smalldatetime":
                case "time":
                case "timestamp":
                    return Type.GetType("System.DateTime");
                case "decimal":
                case "numeric":
                    return Type.GetType("System.Decimal");
                case "float":
                    return Type.GetType("System.Double");
                case "int":
                    return Type.GetType("System.Int32");
                case "real":
                    return Type.GetType("System.Single");
                case "smallint":
                case "tinyint":
                    return Type.GetType("System.Int16");
                case "uniqueidentifier":
                    return Type.GetType("System.Guid");
                default:
                    throw new ArgumentOutOfRangeException("type", $"Unable to map this type {slqType}.");

            }
        }
        public override string IdentityColumnExpression(int seed, int increment)
        {
            return $"IDENTITY({seed},{increment})";
        }

        public override string GetPersistedHashColumnExpression(List<string> cols)
        {
            return $"AS {GetHashColumnExpression(cols)} PERSISTED";
        }

        public override string GetHashColumnExpression(List<string> cols)
        {
            string q = "HASHBYTES('MD5', ";

            for (int i = 0; i < cols.Count; i++)
            {
                q += $"CAST({cols[i]} AS VARCHAR(MAX))";
                if (i != cols.Count - 1)
                    q += " + '|@|' + ";
            }

            q += ")";
            return q;
        }

        public override string GetShrinkFileExpression()
        {
            //2 è l'id del file di log (costante), 1 è la dimensione a cui si vuole ridurre
            return $"DBCC SHRINKFILE(2, 1);";
        }

        public override string GetDisableIndexExpression(string tableName, string indexName)
        {
            return $"ALTER INDEX {indexName} ON {tableName}  DISABLE; ";
        }

        public override string GetRebuildIndexExpression(string tableName, string indexName)
        {
            return $"ALTER INDEX {indexName} ON {tableName}  REBUILD; ";
        }

        public override string GetEnableCheckConstraintsExpression(string tableName)
        {
            return $"sp_msforeachtable \"ALTER TABLE {tableName} WITH CHECK CHECK CONSTRAINT ALL\";";
        }

        public override string GetDisableCheckConstraintsExpression(string tableName)
        {
            return $"sp_msforeachtable \"ALTER TABLE {tableName} NOCHECK CONSTRAINT ALL\";";
        }

        public override string GetPrimaryKeyName(string tableName)
        {
            DataTable dt = GetTable($@"SELECT CONSTRAINT_NAME as PK_NAME
                            FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
                            WHERE OBJECTPROPERTY(OBJECT_ID(CONSTRAINT_SCHEMA + '.' + QUOTENAME(CONSTRAINT_NAME)), 'IsPrimaryKey') = 1
                            AND TABLE_NAME = '{tableName}'");
            if (dt.Rows.Count == 0)
                return null;

            return dt.Rows[0]["PK_NAME"].ToString();
        }

        public override string RenameTables(string oldTableName, string newTableName)
        {
            return $"exec sp_rename {oldTableName}, {newTableName}";
        }

        public override string RenameKeys(string oldFkName, string newFkName)
        {
            return $"exec sp_rename {oldFkName}, {newFkName}";
        }
    }
}
