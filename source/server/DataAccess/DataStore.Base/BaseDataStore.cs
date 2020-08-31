using DataStore.Interface;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Data;
using Infrastructure.STLogging.Factory;
using System.Data.Common;
using Configuration;

namespace DataStore.Base
{
    public abstract class BaseDataStore : IDataStore
    {
        public const string MULTIPLE_COMMAND_SEPARATOR = "##;##";

        /// <summary>
        /// Dizionario statico col le definition delle tabelle
        /// </summary>
        private static Dictionary<string, Dictionary<string, ColumnDefinition>> mTableDefDict = new Dictionary<string, Dictionary<string, ColumnDefinition>>();

        protected  const string SAFE_SUFFIX = "_SAFE";

        protected const int MIN_BULK_ROWS = 100;

        protected int mSRID = 0;
        
        protected Dictionary<string, int> mRegIdDict = new Dictionary<string, int>();

        #region Campi protetti

        private string mDataProviderName;
        private string mDataProviderType;

        protected string mSchema;
               
        protected string mUserId = "";
        protected string mPwd = "";
        protected string mDataSource = "";
        protected string mConnStr = null;


        protected DataStoreConfig mDataStoreConfig;

        protected string mIdField = null;
        protected int mIdFieldLength = -1;
        protected int mIdFieldPrefixLength = -1;

        protected IDbTransaction mCurrentTransaction = null;
        protected bool mMustCloseConnAfterTransaction = false;

        #endregion Campi protetti

        #region Costruttori e inizializzazione

        public BaseDataStore(string connStr, string schema)
        {
            mConnStr = connStr;
            mSchema = schema;

            string[] connStrComponents = connStr.Split(';');

            foreach (string component in connStrComponents)
            {
                if (component.Contains("User Id"))
                {
                    mUserId = component.Split('=')[1];
                }

                if (component.Contains("Password"))
                {
                    mPwd = component.Split('=')[1];
                }

                if (component.Contains("Data Source"))
                {
                    mDataSource = component.Split('=')[1];
                }
            }
        }

        public BaseDataStore(DataStoreConfig dataStoreConfig):this(dataStoreConfig.connStr,dataStoreConfig.schema)
        {
            mDataStoreConfig = dataStoreConfig;
        }

        #endregion Costruttori e inizializzazione

        public static string GetAliasedTextFilter(string tbName, string textFilter, string[] selectFields)
        {
            foreach (string fieldName in selectFields)
            {
                string regExpTxt = $@"([^\w]{fieldName}[^\w])|([^\w]{fieldName}[^\w])|([^\w]{fieldName}$)|(^{fieldName}[^\w])";              

                var res = Utility.RegExUtils.GetMatches(textFilter, regExpTxt);

                foreach (var m in res)
                    textFilter = textFilter.Replace(m[0], m[0].Replace(fieldName, tbName + "." + fieldName));
            }

            return textFilter;
        }

        /// <summary>
        /// Restituisce il nome del campo che costituisce la chiave primaria (ad es. IDGIS, RG_COD etc.)
        /// </summary>
        public string IDField
        {
            get
            {
                if (mIdField == null && mDataStoreConfig != null)
                    mIdField = mDataStoreConfig.idField;

                return mIdField;
            }
            set
            {
                mIdField = value;
            }
        }

        public int IDFieldLength
        {
            get
            {
                return mDataStoreConfig != null ? mDataStoreConfig.idFieldLength : -1;
            }
        }

        public int IDFieldPrefixLength
        {
            get
            {
                return mDataStoreConfig != null ? mDataStoreConfig.idFieldPrefixLength : -1;
            }
        }

        /// <summary>
        /// Restituisce il database di default della connessione.
        /// </summary>
        public string Database
        {
            get
            {
                return Connection.Database;
            }
        }

        public string Schema
        {
            get
            {
                return mSchema;
            }
        }

        public string PrefixDbParameter
        {
            get
            {
                return "@";
            }
        }
        


        #region Query Execution Functions

        /// <summary>
        /// Restituisce l'Uppercase di un espressione da usare in una query non case sensitive
        /// </summary>
        /// <param name="expression"></param>
        /// <returns></returns>
        public abstract string UCaseExpressionNCS(string expression);      

        /// <summary>
        /// Avvia una transazione.
        /// </summary>
        public void BeginTransaction(IsolationLevel iLevel = IsolationLevel.ReadCommitted)
        {
            if (Connection.State == ConnectionState.Closed)
            {
                Connection.Open();

                mMustCloseConnAfterTransaction = true;
            }

            mCurrentTransaction = Connection.BeginTransaction(iLevel);
        }

        /// <summary>
        /// Salva una transazione.
        /// </summary>
        public void CommitTransaction()
        {
            mCurrentTransaction.Commit();

            mCurrentTransaction = null;

            if (mMustCloseConnAfterTransaction)
            {
                Connection.Close();
            }
        }

        /// <summary>
        /// Annulla una transazione.
        /// </summary>
        public void RollbackTransaction()
        {
            mCurrentTransaction.Rollback();

            mCurrentTransaction = null;

            if (mMustCloseConnAfterTransaction)
            {
                Connection.Close();
            }
        }
                
        public abstract IDbConnection Connection { get; }

        public abstract IDbCommand CreateCommand(string txt, IDbConnection conn = null, IDbTransaction transaction = null);

                
        public abstract IDataAdapter CreateDataAdapter(IDbCommand cmd, bool withBuilder = false);

        public abstract IDbDataParameter CreateParameter(string name, object value);

        public abstract IDbDataParameter CreateParameter(string name, string filedName, Type valueType, int size);

        public abstract IBulkCopy GetBulkCopy(IDbConnection connection = null, BulkCopyOptions copyOptions = BulkCopyOptions.Default, IDbTransaction externalTransaction = null);


        internal protected IDbCommand CreateCommand(ref string cmdTxt, STKeyValuePair[] parameters = null, IDbTransaction transaction = null)
        {
            if (transaction == null)
            {
                transaction = mCurrentTransaction;
            }

            cmdTxt = PrepareQuery(cmdTxt);

            IDbCommand cmd = CreateCommand(cmdTxt, Connection);

            if (parameters != null)
            {
                foreach (var p in parameters)
                    cmd.Parameters.Add(CreateParameter(p.Key, p.Value));
            }

            if (transaction != null)
            {
                cmd.Transaction = transaction;
            }

            return cmd;
        }

        private string GetSafeFieldName(string fieldName)
        {
            if (ReservedWords.Contains(fieldName))
            {
                return START_ESCAPE_CHAR + fieldName + END_ESCAPE_CHAR;
            }

            return fieldName;
        }

        private string GetSafeParamName(string paramName)
        {
            if (ReservedWords.Contains(paramName))
            {
                return PARAM_PREFIX + paramName + SAFE_SUFFIX;
            }

            return PARAM_PREFIX + paramName;
        }

        internal protected IDbCommand CreateUpdateCmd(DataTable tbl, IDbTransaction transaction = null)
        {
            string tblName;

            var parameters = PrepareForCommand(tbl, out tblName);
            
            var whereClause = tbl.PrimaryKey.Select(c => GetSafeFieldName(c.ColumnName) + "=" + GetSafeParamName(c.ColumnName) )
                .Aggregate((s1, s2) => s1 + " AND " + s2);

            
        //se il comando di update si basa sul presupposto che ci sia sempre la chiave primaria allora le colonne della tabella devono essere almeno 1 in più rispetto alle chiavi primarie
        //altrimenti il comando di update non è corretto
            var fields = tbl.Columns.Cast<DataColumn>()
                    .Where(c => !tbl.PrimaryKey.Contains(c))
                    .Select(c => GetSafeFieldName(c.ColumnName) + "=" + GetSafeParamName(c.ColumnName))
                    .Aggregate(string.Empty, (s1, s2) => s1 == string.Empty ? s2 : s1 + ", " + s2);
                    

            var cmd = CreateCommand("UPDATE " + tblName + " SET " + fields + " WHERE " + whereClause, null, transaction) as DbCommand;

            cmd.Parameters.AddRange(parameters);
            
            return cmd;
        }

        internal protected IDbCommand CreateInsertCmd(DataTable tbl, IDbTransaction transaction = null)
        {
            string tblName;

            var parameters = PrepareForCommand(tbl, out tblName);

            var fields = tbl.Columns.Cast<DataColumn>()
                .Where(cc => !cc.AutoIncrement)
                .Select(c => GetSafeFieldName(c.ColumnName))
                .Aggregate((s1, s2) => QuoteName(s1) + ", " + QuoteName(s2));

            var values = tbl.Columns.Cast<DataColumn>()
                    .Where(cc => !cc.AutoIncrement)
                    .Select(c => GetSafeParamName(c.ColumnName))
                    .Aggregate((s1, s2) => s1 + ", " + s2);

            var cmd = CreateCommand("INSERT INTO " + GetSafeFieldName(tblName) + "(" + fields + ") VALUES (" + values + ")", null, transaction) as DbCommand;

            cmd.Parameters.AddRange(parameters);
            
            return cmd;
        }

        internal protected IDbCommand CreateDeleteCmd(DataTable tbl, IDbTransaction transaction = null)
        {
            string tblName;

            var parameters = PrepareForCommand(tbl, out tblName);
           
            var whereClause = tbl.PrimaryKey.Select(c => GetSafeFieldName(c.ColumnName) + "=" + GetSafeParamName(c.ColumnName))
                .Aggregate((s1, s2) => s1 + " AND " + s2);

            var cmd = CreateCommand("DELETE FROM " + tblName + " WHERE " + whereClause, null, transaction) as DbCommand;

            cmd.Parameters.AddRange(parameters);

            return cmd;
        }

        private IDbDataParameter[] PrepareForCommand(DataTable tbl, out string tblName)
        {
            if (string.IsNullOrEmpty(tbl.TableName))
                throw new Exception("TableName deve indicare il nome della tabella");

            tblName = GetTableName(tbl);

            //ottenere info della PK
            if (tbl.PrimaryKey == null || tbl.PrimaryKey.Length == 0)
                SetPKInfo(tbl, tblName);

            if (tbl.PrimaryKey == null || tbl.PrimaryKey.Length == 0)
                throw new Exception("PrimaryKey deve essere specificata");

            var parameters = tbl.Columns.Cast<DataColumn>()
                .Select(c =>
                {
                    string paramName = this.PARAM_PREFIX + c.ColumnName;

                    if (ReservedWords.Contains(c.ColumnName))
                    {
                        paramName += SAFE_SUFFIX;
                    }

                    return this.CreateParameter(paramName, c.ColumnName, c.DataType, c.MaxLength);
                })
                .ToArray();

            return parameters;
        }

        private string GetTableName(DataTable tbl)
        {
            string tblName = tbl.TableName;

            if (!string.IsNullOrEmpty(Schema) && !tblName.Contains(Schema))
                tblName = Schema + "." + QuoteName(tblName);

            return tblName;
        }

        internal protected void SetPKInfo(DataTable tbl, string tblName)
        {
            var pkcol = tbl.Columns.Cast<DataColumn>().FirstOrDefault(c => c.ColumnName == IDField);

            if( pkcol != null)
            {
                tbl.PrimaryKey = new DataColumn[] { pkcol };
            }
            else
            {
                var tblDef = GetTableDefinition(tblName);

                tbl.PrimaryKey = tblDef.Values.Where(c => c.IsPK).Select(c => tbl.Columns[c.ColumnName]).ToArray();
            }
        }

        protected abstract string ConcatCommands(string[] commands);

        protected string SplitCommand(string cmdTxt)
        {
            string[] cmdParts = cmdTxt.Split(new string[] { MULTIPLE_COMMAND_SEPARATOR }, StringSplitOptions.RemoveEmptyEntries);

            if (cmdParts.Length > 1)
            {
                return ConcatCommands(cmdParts);
            }
            else if (cmdParts.Length == 1)
            {
                return cmdParts[0];
            }

            return cmdTxt;
        }

        
        public int ExecuteCommand(string cmdTxt, STKeyValuePair[] parameters = null, int timeout = 0, IDbTransaction transaction = null)
        {

            var cmd = commonExecute(cmdTxt, parameters,  timeout, transaction);

            bool mustCloseConn = false;

            try
            {
                if (Connection.State != ConnectionState.Open)
                {
                    Connection.Open();
                    mustCloseConn = true;
                }

                STLoggerFactory.Logger.Log(this.GetType().Name + " - ExecuteCommand: " + cmd.CommandText, Infrastructure.STLogging.Interface.LogLevelEnum.Debug);

                return cmd.ExecuteNonQuery();
            }
            finally
            {
                cmd.Parameters.Clear();

                if (mustCloseConn)
                {
                    Connection.Close();
                }
            }
        }

        private IDbCommand commonExecute(string cmdTxt, STKeyValuePair[] parameters = null, int timeout = 0, IDbTransaction transaction = null)
        {
            if (transaction == null)
            {
                transaction = mCurrentTransaction;
            }

            cmdTxt = SplitCommand(cmdTxt);

            return CreateCommand(ref cmdTxt, parameters, transaction);
        }

        protected abstract string GetStoreProcedureCmd(string spName, STKeyValuePair[] spParams = null);

        /// <summary>
        /// Esegue una store procedure con dei parametri
        /// </summary>
        /// <param name="spName"></param>
        /// <param name="spParams"></param>
        /// <returns></returns>
        public int ExecuteStoreProcedure(string spName, STKeyValuePair[] spParams = null)
        {
            string cmdTxt = GetStoreProcedureCmd(spName, spParams);

            return ExecuteCommand(cmdTxt, spParams);
        }

        /// <summary>
        /// Esegue il reader e lascia la connessione aperta, che deve essere chiusa Dopo!
        /// </summary>
        /// <param name="cmdTxt"></param>
        /// <param name="parameters"></param>
        /// <param name="timeout"></param>
        /// <param name="transaction"></param>
        /// <returns></returns>
        public IDataReader ExecuteReader(string cmdTxt, STKeyValuePair[] parameters = null, int timeout = 0, System.Data.IDbTransaction transaction = null, CommandBehavior cmdBehabior = CommandBehavior.Default )
        {
            if (transaction == null)
            {
                transaction = mCurrentTransaction;
            }

            IDbCommand cmd = CreateCommand(ref cmdTxt, parameters, transaction);

            if (Connection.State != ConnectionState.Open)
            {
                Connection.Open();
            }

            STLoggerFactory.Logger.Log(this.GetType().Name + " - ExecuteReader: " + cmd.CommandText, Infrastructure.STLogging.Interface.LogLevelEnum.Debug);

            return cmd.ExecuteReader(cmdBehabior);
        }
        
        public DataTable GetTable(string cmdTxt, STKeyValuePair[] parameters = null, System.Data.IDbTransaction transaction = null)
        {
            if (transaction == null)
            {
                transaction = mCurrentTransaction;
            }

            IDbCommand cmd = CreateCommand(ref cmdTxt, parameters, transaction);

            IDataAdapter adp = CreateDataAdapter(cmd);

            STLoggerFactory.Logger.Log(this.GetType().Name +" - GetTable: " + cmd.CommandText, Infrastructure.STLogging.Interface.LogLevelEnum.Debug);

            DataSet ds = new DataSet();

            adp.Fill(ds);

            return ds.Tables[0];
        }


        public object ExecuteScalar(string cmdTxt, STKeyValuePair[] parameters = null, IDbTransaction transaction = null)
        {
            if (transaction == null)
            {
                transaction = mCurrentTransaction;
            }

            IDbCommand cmd = CreateCommand(ref cmdTxt, parameters, transaction);

            bool mustCloseConn = false;
            try
            {
                if (Connection.State != ConnectionState.Open)
                {
                    Connection.Open();
                    mustCloseConn = true;
                }

                STLoggerFactory.Logger.Log(this.GetType().Name + " - ExecuteScalar: " + cmd.CommandText, Infrastructure.STLogging.Interface.LogLevelEnum.Debug);

                object res = cmd.ExecuteScalar(); 

                return res;
                
            }
            finally
            {
                // attenzione: se la connessione fosse aperta non bisogna fare la commit della transaction, visto che
                // potrebbe servire ancora a qualcuno, così come la connessione.
                if (mustCloseConn)
                {
                    if (transaction != null)
                    {
                        transaction.Commit();
                    }

                    Connection.Close();
                }
            }
        }

        #endregion Query Execution Functions                

        #region Bulk Functions     

        public  void WriteBulk(string destTableName, System.Data.DataTable tbToWrite, int? timeout = null)
        {
            WriteBulk(destTableName, tbToWrite.Select(), timeout);
        }

        /// <summary>
        /// Effettua una bulk copy.
        /// </summary>
        /// <param name="destTableName"></param>
        /// <param name="rowsToWrite"></param>
        public abstract void WriteBulk(string destTableName, DataRow[] rowsToWrite, int? timeout = null);


        #endregion Bulk Functions

        #region Metadata functions

        /// <summary>
        /// Restituisce lo script di creazione della tabella a partire dal DataTable indicato.
        /// </summary>
        /// <param name="table"></param>
        /// <returns></returns>
        public string GetTableScript(DataTable table, string tbName, bool createPK =false, bool createSpIndex = false)
        {
            string colDefinition = "";
            string pkDefinition = "";

            //Si definiscono campi e chiavi
            foreach (DataColumn col in table.Columns)
            {
                if (col.ColumnName == null)
                    continue;

                string colName = col.ColumnName;
                bool isNullable = col.AllowDBNull;
                bool isKey = IsKey(col);
                Type dType = col.DataType;

                System.Int32 ColumnSize = col.MaxLength == -1 ? 5000 : col.MaxLength;

                Int16 NumPrecision = 38;
                Int16 NumScale = 8;

                //Si prende la definizione del tipo dato (nel server)
                string strType = TypeMapping(dType, ColumnSize, NumPrecision, NumScale);

                //si concatenano i campi
                if (colDefinition != string.Empty)
                {
                    colDefinition += ", ";
                }

                colName = this.QuoteName(colName);

                colDefinition += " " + colName + " " + strType + " " + (isNullable ? "" : " NOT ") + " NULL " + (col.AutoIncrement ? IdentityColumnExpression((int) col.AutoIncrementSeed, (int) col.AutoIncrementStep) : "");

                //si concatenano le chiavi
                if (isKey && createPK)
                {
                    if (pkDefinition != string.Empty)
                    {
                        pkDefinition += " , ";
                    }

                    pkDefinition += colName;
                }
            }

            //Si prepara l'identificativo della chiave primaria
            if (pkDefinition != string.Empty && createPK)
            {
                string pkName = "PK_" + tbName.GetHashCode().ToString("X8");
                string pkDefinitionInit = " CONSTRAINT " + pkName + " PRIMARY KEY ( ";
                pkDefinition = " , " + pkDefinitionInit + pkDefinition + " ) ";
            }

            string script = "CREATE TABLE " + tbName;
            script += "(";
            script += colDefinition + pkDefinition;
            script += ")";

            return script;
        }

        internal protected bool IsKey(DataColumn col)
        {
            if(col.Table.PrimaryKey!=null)
                return  col.Table.PrimaryKey.Contains(col);
            else 
                return col.ColumnName == IDField;
        }
        
        public abstract string TypeMapping(Type type, int columnSize, int columnPrecision=0, int columnScale=0);

        /// <summary>
        /// Restituisce lo script per creare una tabella direttamente da una query
        /// </summary>
        /// <param name="tableName"></param>
        /// <param name="select"></param>
        /// <returns></returns>
        public abstract string GetCreateTableFromSelectScript(string tableName, string select);


        public abstract string GetViewDefinition(string viewName);


        public Dictionary<string, ColumnDefinition> GetTableDefinition(string tableName)
        {
            Dictionary<string, ColumnDefinition> tbDef = null;

            lock (mTableDefDict)
            {
                if (mTableDefDict.ContainsKey(tableName))
                    tbDef = mTableDefDict[tableName];
            }

            if (tbDef == null)
            {
                DbDataAdapter adp = CreateDataAdapter(CreateCommand("SELECT * FROM " + tableName)) as DbDataAdapter;

                DataTable schemaTbl = new DataTable();

                adp.FillSchema(schemaTbl, SchemaType.Source);

                tbDef = schemaTbl.Columns.Cast<DataColumn>().Select(c => new ColumnDefinition
                {
                    ColumnName = c.ColumnName,
                    DataType = c.DataType.FullName,

                    //escludiamo OBJECTID fra le PK
                    IsPK = (schemaTbl.PrimaryKey.Contains(c) && c.ColumnName.ToUpper()!="OBJECTID") || c.ColumnName.Equals(IDField),
                    Nullable = c.AllowDBNull,
                    DataLength = c.MaxLength
                }).ToDictionary(r => r.ColumnName, r => r);

                lock (mTableDefDict)
                {
                    mTableDefDict[tableName] = tbDef;
                }
            }

            return tbDef;
        }

        protected abstract string GetSearchExistingTablesQuery(string nameFilter = null, string owner = null);

        protected abstract string GetSearchExistingViewsQuery(string nameFilter = null, string owner = null);

        protected abstract string GetSearchExistingIndexesQuery(string tableName);

        public string[] GetExistingTables(string nameFilter = null, string owner = null)
        {
            string query = GetSearchExistingTablesQuery(nameFilter, owner);

            DataTable res = this.GetTable(query);

            List<string> lstTables = new List<string>();

            foreach (DataRow dr in res.Select())
            {
                lstTables.Add(dr[0].ToString());
            }

            return lstTables.ToArray();
        }

        public string[] GetExistingViews(string nameFilter = null, string owner = null)
        {
            string query = GetSearchExistingViewsQuery(nameFilter, owner);

            DataTable res = this.GetTable(query);

            List<string> lstTables = new List<string>();

            foreach (DataRow dr in res.Select())
            {
                lstTables.Add(dr[0].ToString());
            }

            return lstTables.ToArray();
        }

        public string[] GetExistingIndexes(string tableName)
        {
            string query = GetSearchExistingIndexesQuery(tableName);

            DataTable res = this.GetTable(query);

            List<string> lstTables = new List<string>();

            foreach (DataRow dr in res.Select())
            {
                lstTables.Add(dr["NAME"].ToString());
            }

            return lstTables.ToArray();
        }

        public bool ExistsTable(string tableName, string owner = null)
        {
            string[] tables = GetExistingTables(tableName, owner);

            foreach (string tbl in tables)
            {
                if (tbl == tableName)
                {
                    return true;
                }
            }

            return false;
        }

        public bool ExistsView(string viewName, string owner = null)
        {
            string[] views = GetExistingViews(viewName, owner);

            foreach (string v in views)
            {
                if (v == viewName)
                {
                    return true;
                }
            }

            return false;
        }

        public bool ExistsIndex(string indexName, string tableName)
        {
            string[] indexes = GetExistingIndexes(tableName);

            foreach (string i in indexes)
            {
                if (i == indexName)
                {
                    return true;
                }
            }

            return false;
        }

        #endregion Metadata functions

        #region Query functions

        public abstract string ISNULL_FUNC_NAME { get; }

        public abstract string CONCAT_STRING_KEYWORD { get; }

        public abstract string START_ESCAPE_CHAR { get;  }

        public abstract string END_ESCAPE_CHAR { get; }

        public abstract string PARAM_PREFIX { get; }

        public abstract string END_MERGE_CHAR { get; }

        public abstract string GetSubstringOperator(string sourceStr, int fromPos, int length);

        public abstract string GetTrimOperator(string sourceStr);

        public abstract string GetDateDifferenceExpression(string startDateField, string endDateField, DateDiffPartEnum dateDiffPart);

        public abstract string GetCurrentDateExpression();

        public abstract string IdentityColumnExpression(int seed, int increment);

        public abstract string GetPersistedHashColumnExpression(List<string> cols);

        public abstract string GetHashColumnExpression(List<string> cols);

        /// <summary>
        /// Restituisce l'espressione per fare il parse di una data secondo un certo formato.
        /// </summary>
        /// <param name="dateExpr"></param>
        /// <param name="format"></param>
        /// <returns></returns>
        public abstract string GetParseDateExpression(string dateExpr, string format);

        public abstract string GetBitAndOperationExpression(string fieldName, string fieldValue);

        public abstract string GetBitOrOperationExpression(string fieldName, string fieldValue);

        internal protected virtual string PrepareQuery(string query)
        {
            if (START_ESCAPE_CHAR != "[")
            {
                query = query.Replace("[", START_ESCAPE_CHAR);
                query = query.Replace("]", END_ESCAPE_CHAR);
            }

            query = FixParameterNames(query);

            return query;
        }

        internal protected virtual string FixParameterNames(string query)
        {
            query = System.Text.RegularExpressions.Regex.Replace(query, @"@(\w*)", new System.Text.RegularExpressions.MatchEvaluator(MakeSafeParamName));

            if(PARAM_PREFIX!="@")
                query = query.Replace("@", PARAM_PREFIX);

            return query;
        }


        protected virtual string MakeSafeParamName(System.Text.RegularExpressions.Match match)
        {
            if (ReservedWords.Contains(match.Value.Substring(1).ToUpper()))
            {
                return match.Value + SAFE_SUFFIX;
            }
            return match.Value;
        }


        internal protected virtual string QuoteName(string fieldName)
        {
            if (!fieldName.StartsWith(START_ESCAPE_CHAR))
                return START_ESCAPE_CHAR + fieldName + END_ESCAPE_CHAR;
            else
                return fieldName;
        }


        /// <summary>
        /// Restituisce un nome per una tabella temporanea.
        /// </summary>
        /// <param name="schema"></param>
        /// <returns></returns>
        internal protected string GetTmpTableName(string schema = null)
        {
            string tbName = "TMP_";
            string ttp = ConfigurationManager.AppSettings["TEMP_TABLE_PREFIX"];

            if (ttp != null)
            {
                tbName = ttp;
            }
            
            tbName += Guid.NewGuid().GetHashCode().ToString("X8");

            if (!string.IsNullOrEmpty(schema))
            {
                tbName = schema + "." + tbName;
            }

            return tbName;
        }

        public abstract string GetPagedQuery(string query, string sortColumn, int pageIndex, int pageSize, bool sortByDesc);
        public abstract string GetPagedQuery(string query, string sortColumn, int pageIndex, int pageSize, bool sortByDesc, string selCols); 


        public string GetSelectString(string tableAlias, string[] fields)
        {
            string select = "";

            foreach (string field in fields)
            {
                if (select != "")
                {
                    select += ", ";
                }

                if (ReservedWords.Contains(field))
                {
                    select += tableAlias + "." + QuoteName(field);
                }
                else
                {
                    select += tableAlias + "." + field;
                }
            }
            return select;
        }

        internal protected abstract  ICollection<string> ReservedWords{ get; }

        protected abstract string GetViewUpdateScript(string srcTableName, string destTableName, ICollection<DataColumn> updateColumns, ICollection<DataColumn> primaryKeycolumns, Dictionary<string, string> colMapping = null);


        public string GetUpdateScript(string srcTableName, string destTableName, ICollection<DataColumn> updateColumns, ICollection<DataColumn> primaryKeycolumns, Dictionary<string, string> colMapping = null)
        {
            if (updateColumns.Count == 0)
            {
                // nel caso in cui la tabella sia tutta chiave non si può fare update.
                return null;
            }

            string cmdTxt = "MERGE INTO " + destTableName + @" 
                      USING " + srcTableName + @" ON (<KEY_LIST>)
                      WHEN MATCHED THEN UPDATE
                      SET <UPDATE_LIST>" + END_MERGE_CHAR;

            string updateList = GetCompareCollection(updateColumns, srcTableName, destTableName, ", ", colMapping);

            string keyList = GetCompareCollection(primaryKeycolumns, srcTableName, destTableName, " AND ");

            cmdTxt = cmdTxt.Replace("<KEY_LIST>", keyList).Replace("<UPDATE_LIST>", updateList);

            return cmdTxt;
        }



        /// <summary>
        /// Restituisce la stringa con i confronti tra le colonne delle due tabelle sorgente e destinatario
        /// </summary>
        /// <param name="colColl"></param>
        /// <param name="srcTableName"></param>
        /// <param name="destTableName"></param>
        /// <param name="separator"></param>
        /// <param name="colMapping"></param>
        /// <returns></returns>
        public static string GetCompareCollection(ICollection<DataColumn> colColl, string srcTableName, string destTableName, string separator, Dictionary<string, string> colMapping = null)
        {
            string strColl = "";

            foreach (DataColumn colKey in colColl)
            {
                if (strColl != "")
                {
                    strColl += separator;
                }

                if(colMapping==null || !colMapping.ContainsKey(colKey.ColumnName))
                    strColl += destTableName + ".[" + colKey.ColumnName + "] = " + srcTableName + ".[" + colKey.ColumnName+"]";
                else
                    strColl += destTableName + "." + colMapping[colKey.ColumnName] + " = " + srcTableName + "." + colKey.ColumnName;
            }

            return strColl;
        }

        #endregion Query functions


        #region Salvataggio di Datasets
        /// <summary>
        /// Effettua il salvataggio dei dati nel DataTable.
        /// Esegue le operazionidi Delete/Insert/Update in funzione dello stato delle righe
        /// Se necessario utilizza operazioni Bulk.
        /// </summary>
        public void UpdateChanges(DataTable tbl, IDbTransaction transaction = null)
        {
            if (transaction == null)
            {
                transaction = mCurrentTransaction;
            }

            if (string.IsNullOrEmpty(tbl.TableName))
                throw new Exception("TableName deve indicare il nome della tabella");

            var tblname = GetTableName(tbl);

            if (tbl.Rows.Count <= MIN_BULK_ROWS)
            {
                tbl = tbl.Copy(); //facciamo una copia per non modificare i dati originali

                var cols = tbl.Columns.Cast<DataColumn>().Select(c => QuoteName(c.ColumnName)).Aggregate((s1, s2) => s1 + ", " + s2);
                var cmd = "SELECT " + cols + " FROM " + tblname;

                var adp = CreateDataAdapter(CreateCommand(ref cmd, null, transaction)) as DbDataAdapter;
                adp.UpdateCommand = CreateUpdateCmd(tbl, transaction) as DbCommand;
                adp.InsertCommand = CreateInsertCmd(tbl, transaction) as DbCommand;
                adp.DeleteCommand = CreateDeleteCmd(tbl, transaction) as DbCommand;

                STLoggerFactory.Logger.Log(this.GetType().Name + " - UpdateChanges: " + tbl.Rows.Count.ToString() + @" righe con comandi
                " + adp.InsertCommand.CommandText + @"
                " + adp.UpdateCommand.CommandText + @"
                " + adp.DeleteCommand.CommandText, Infrastructure.STLogging.Interface.LogLevelEnum.Debug);

                adp.Update(tbl);
            }
            else // use bulk
            {
                SqlBulkAdapter bulkAdapter = new SqlBulkAdapter(this, false, transaction);

                if (!bulkAdapter.Update(tbl, tbl.TableName))
                {
                    throw new Exception("Errore nel salvataggio in bulk della tabella " + tbl.TableName + " - " + bulkAdapter.Error, bulkAdapter.Exception);
                }
            }
        }

        /// <summary>
        /// Effettua il salvataggio di una tabella in bulk verificando quali righe inserire e quali aggiornare
        /// </summary>
        /// <param name="tbl"></param>
        /// <param name="transaction"></param>
        public void InsertUpdateData(DataTable tbl, IDbTransaction transaction = null)
        {
            if (transaction == null)
            {
                transaction = mCurrentTransaction;
            }

            if (string.IsNullOrEmpty(tbl.TableName))
                throw new Exception("TableName deve indicare il nome della tabella");

            var tblname = GetTableName(tbl);
            
            SqlBulkAdapter bulkAdapter = new SqlBulkAdapter(this, false, transaction);

            if (!bulkAdapter.ExecInsertUpdate(tbl, tbl.TableName))
            {
                throw new Exception("Errore nel salvataggio in bulk della tabella " + tbl.TableName + " - " + bulkAdapter.Error, bulkAdapter.Exception);
            }
            
        }

        /// <summary>
        /// Effettua il salvataggio di tutte le tabelle del database 
        /// Se necessario utilizza operazioni Bulk.
        /// Esegue le operazionidi Delete/Insert/Update in funzione dello stato delle righe
        /// Esegue un analisi delle relazioni per determinare l'ordine di aggiornamento
        /// </summary>
        public void UpdateChanges(DataSet ds, IDbTransaction transaction = null)
        {
            List<string> tableOrderedList = new List<string>();

            foreach (DataTable dt in ds.Tables)
            {
                if (!tableOrderedList.Contains(dt.TableName))
                {
                    foreach (DataRelation dr in dt.ParentRelations)
                    {
                        if (!tableOrderedList.Contains(dr.ParentTable.TableName))
                        {
                            tableOrderedList.Insert(0, dr.ParentTable.TableName);
                        }
                    }
                }

                tableOrderedList.Insert(0, dt.TableName);
            }

            SqlBulkAdapter bulkAdapter = new SqlBulkAdapter(this, false, transaction);

            // Faccio prima le delete
            foreach (string tableName in tableOrderedList)
            {
                if (!bulkAdapter.ExecDelete(ds.Tables[tableName], tableName))
                {
                    throw new Exception("Errore nella cancellazione in bulk della tabella " + tableName + " - " + bulkAdapter.Error, bulkAdapter.Exception);
                }
            }

            // Poi faccio update e insert dopo aver invertito l'ordine
            tableOrderedList.Reverse();

            foreach (string tableName in tableOrderedList)
            {
                if (!bulkAdapter.ExecUpdate(ds.Tables[tableName], tableName))
                {
                    throw new Exception("Errore nell'aggiornamento in bulk della tabella " + tableName + " - " + bulkAdapter.Error, bulkAdapter.Exception);
                }

                if (!bulkAdapter.ExecInsert(ds.Tables[tableName], tableName))
                {
                    throw new Exception("Errore nell'inserimento in bulk della tabella " + tableName + " - " + bulkAdapter.Error, bulkAdapter.Exception);
                }
            }
        }

        #endregion Salvataggio di Datasets

        public string GetDateTextRepresentation(DateTime date)
        {
            return mDataStoreConfig.DateFormat == null ? date.ToString("yyyy/MM/dd HH:mm:ss.fff") : date.ToString(mDataStoreConfig.DateFormat);
        }

        public string GetDoubleTextRepresentation(double d)
        {
            return d.ToString().Replace(".", mDataStoreConfig.DecimalSeparator).Replace(",", mDataStoreConfig.DecimalSeparator);
        }


        #region Tabelle Temporanee

        /// <summary>
        /// Scrive la tabella indicata in una tabella temporanea. Restituisce il nome della tabella.
        /// </summary>
        /// <param name="tbToWrite"></param>
        /// <returns></returns>
        public string WriteTempTable(DataTable tbToWrite, bool createPK = false, bool createSpIndex = false)
        {
            var origTableName = tbToWrite.TableName;

            var tempTableName = GetTempTableName();

            try
            {
                tbToWrite.TableName = tempTableName;

                string createTempTableQuery = GetTableScript(tbToWrite, tempTableName, createPK, createSpIndex);

                ExecuteCommand(createTempTableQuery);

                WriteBulk(tempTableName, tbToWrite);

            }
            finally
            {
                tbToWrite.TableName = origTableName;
            }

            return tempTableName;
        }

        static protected string TEMP_TABLE_PREFIX
        {
            get
            {
                string ttp = ConfigurationManager.AppSettings["TEMP_TABLE_PREFIX"];

                if (ttp != null)
                {
                    return ttp;
                }

                return "TMP_";
            }
        }

        protected string TEMP_VIEW_PREFIX
        {
            get
            {
                string tvp = ConfigurationManager.AppSettings["TEMP_VIEW_PREFIX"];

                if (tvp != null)
                {
                    return tvp;
                }

                return "TMP_VIEW_";
            }
        }

        protected int TEMP_TABLE_EXPIRE_DAYS
        {
            get
            {

                string tted = ConfigurationManager.AppSettings["TEMP_TABLE_EXPIRE_DAYS"];

                if (tted != null)
                {
                    return int.Parse(tted);
                }

                return 1;
            }
        }

        public string DataProviderName
        {
            get
            {
                return mDataProviderName;
            }

            set
            {
                mDataProviderName = value;
            }
        }

        public string DataProviderType
        {
            get
            {
                return mDataProviderType;
            }

            set
            {
                mDataProviderType = value;
            }
        }

        protected abstract string GetExpiredObjectsQuery(int expireDays, string type = null, string objectPrefix = null);

        /// <summary>
        /// Restituisce un nome univoco da utilizzare per la creazione di tabelle temporanee
        /// </summary>
        /// <returns></returns>
        public string GetTempTableName()
        {
            return GetTempTablePrefixName() + Guid.NewGuid().GetHashCode().ToString("X8");
        }

        static public string GetTempTablePrefixName()
        {
            return TEMP_TABLE_PREFIX;
        }

        /// <summary>
        /// Restituisce un nome univoco da utilizzare per la creazione di view temporanee.
        /// </summary>
        /// <returns></returns>
        public string GetTempViewName()
        {
            return TEMP_VIEW_PREFIX + Guid.NewGuid().GetHashCode().ToString("X8");
        }

        /// <summary>
        /// Cancella le tabelle temporanee non utilizzate da più di un certo tempo
        /// </summary>
        public void ClearExpiredTempTables()
        {
            ClearExpiredObjects(TEMP_TABLE_EXPIRE_DAYS, "TABLE", TEMP_TABLE_PREFIX);
        }

        /// <summary>
        /// Cancella le view temporanee non utilizzate da più di un certo tempo.
        /// </summary>
        public void ClearExpiredTempViews()
        {
            ClearExpiredObjects(TEMP_TABLE_EXPIRE_DAYS, "VIEW", TEMP_TABLE_PREFIX);
        }

        public void ClearExpiredObjects(int expireDays, string type = null, string objectPrefix = null)
        {
            try
            {
                string getOldTempTablesQuery = GetExpiredObjectsQuery(expireDays, type, objectPrefix);

                DataTable res = GetTable(getOldTempTablesQuery);

                foreach (DataRow dr in res.Select())
                {
                    string objectName = dr["OBJECT_NAME"].ToString();
                    string objectType = dr["OBJECT_TYPE"].ToString();

                    string dropTable = "DROP " + ((objectType == "VIEW")? "VIEW " : "TABLE ") + objectName;

                    try
                    {
                        ExecuteCommand(dropTable);
                    }
                    catch (Exception ex)
                    {
                        STLoggerFactory.Logger.Log("BaseDataStore.ClearExpiredObjects - Errore nella cancellazione dell'oggetto " + objectName, ex, Infrastructure.STLogging.Interface.LogLevelEnum.Error);
                    }
                }
            }
            catch (Exception ex)
            {
                STLoggerFactory.Logger.Log("BaseDataStore.ClearExpiredObjects - Errore nella cancellazione degli oggetti temporanei non più utilizzate", ex, Infrastructure.STLogging.Interface.LogLevelEnum.Error);
            }
        }

        /// <summary>
        /// IDisposable - implementare
        /// </summary>
        public abstract void Dispose();

        #endregion Tabelle Temporanee

        /// <summary>
        /// Restituisce la query per ottenere le prime N righe a partire dal comando passato.
        /// </summary>
        /// <param name="cmdTxt"></param>
        /// <param name="numRows"></param>
        /// <returns></returns>
        public abstract string GetTopNRowsQuery(string cmdTxt, int numRows);

        public DataTable GetTableMetadata(string tableName)
        {
            string sql = this.GetSQLTableMetadata(tableName);

            DataTable dt = this.GetTable(sql);

            foreach(DataRow row in dt.Rows)
            {
                string sqlType = row["DATA_TYPE"].ToString();
                Type colType = this.SystemTypeMapping(sqlType);
                if (colType != null)
                {
                    row["DATA_TYPE"] = colType.AssemblyQualifiedName;
                }               
            }
            return dt;
        }

        protected abstract string GetSQLTableMetadata(string tableName);

        protected abstract Type SystemTypeMapping(string slqType);
        public abstract string GetShrinkFileExpression();

        public abstract DbParameter GetParameter(ColumnDefinition columnDefinition, object val);
        public abstract string GetDisableIndexExpression(string tableName, string indexName);
        public abstract string GetRebuildIndexExpression(string tableName, string indexName);
        public abstract string GetEnableCheckConstraintsExpression(string tableName);
        public abstract string GetDisableCheckConstraintsExpression(string tableName);
        public abstract string GetPrimaryKeyName(string tableName);
        public abstract string RenameTables(string oldTableName, string newTableName);
        public abstract string RenameKeys(string oldFkName, string newFkName);
    }

}

