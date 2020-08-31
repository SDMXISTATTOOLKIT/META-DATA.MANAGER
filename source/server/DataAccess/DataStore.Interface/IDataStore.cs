using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Common;
using System.Linq;
using System.Text;
using System.Threading.Tasks;


namespace DataStore.Interface
{
    
    public interface IDataStore: IDisposable
    {
        /// <summary>
        /// DataProvider Name del datastore
        /// </summary>
        string DataProviderName { get; set; }

        /// <summary>
        /// DataProvider Type del datastore
        /// </summary>
        string DataProviderType { get; set; }

        /// <summary>
        /// Restituisce il database della connessione.
        /// </summary>
        string Database { get; }

        /// <summary>
        /// Restituisce lo schema da utilizzare nelle query.
        /// </summary>
        string Schema { get; }

        /// <summary>
        /// Return prefix for DbParamater
        /// </summary>
        string PARAM_PREFIX { get; }

        /// <summary>
        /// Avvia una transazione.
        /// </summary>
        void BeginTransaction(IsolationLevel iLevel = IsolationLevel.ReadCommitted);

        /// <summary>
        /// Salva una transazione.
        /// </summary>
        void CommitTransaction();

        /// <summary>
        /// Annulla una transazione.
        /// </summary>
        void RollbackTransaction();

        /// <summary>
        /// Esegue il comando indicato con parametri. Attenzione, lascia la connessione nello stato in cui è.
        /// </summary>
        /// <param name="cmdTxt"></param>
        /// <param name="parameters"></param>
        /// <param name="timeout"></param>
        /// <param name="sqlTrans"></param>
        int ExecuteCommand(string cmdTxt, STKeyValuePair[] parameters = null, int timeout = 0, IDbTransaction transaction = null);

        /// <summary>
        /// Esegue il comando indicato con parametri e ritorna un datareader. Attenzione, lascia la connessione nello stato in cui è.
        /// </summary>
        /// <param name="cmdTxt"></param>
        /// <param name="parameters"></param>
        /// <param name="timeout"></param>
        /// <param name="sqlTrans"></param>
        IDataReader ExecuteReader(string cmdTxt, STKeyValuePair[] parameters = null, int timeout = 0, IDbTransaction transaction = null, CommandBehavior cmdBehabior = CommandBehavior.Default);

        /// <summary>
        /// Esegue una store procedure con dei parametri
        /// </summary>
        /// <param name="spName"></param>
        /// <param name="spParams"></param>
        /// <returns></returns>
        int ExecuteStoreProcedure(string spName, STKeyValuePair[] spParams = null);

        /// <summary>
        /// Riempie una tabella con la query indicata e la restituisce.
        /// </summary>
        /// <param name="cmdTxt"></param>
        /// <param name="parameters"></param>
        /// <param name="sqlTrans"></param>
        /// <returns></returns>
        DataTable GetTable(string cmdTxt, STKeyValuePair[] parameters = null, IDbTransaction transaction = null);
        

        /// <summary>
        /// Restituisce il valore della prima colonna della prima riga della query indicata.
        /// </summary>
        /// <param name="cmdTxt"></param>
        /// <param name="parameters"></param>
        /// <param name="sqlTrans"></param>
        /// <returns></returns>
        object ExecuteScalar(string cmdTxt, STKeyValuePair[] parameters = null, IDbTransaction transaction = null);


        /// <summary>
        /// Effettua una bulk copy.
        /// </summary>
        /// <param name="destTableName"></param>
        /// <param name="tbToWrite"></param>
        void WriteBulk(string destTableName, DataTable tbToWrite, int? timeout = null);


        /// <summary>
        /// Effettua una bulk copy.
        /// </summary>
        /// <param name="destTableName"></param>
        /// <param name="rowsToWrite"></param>
        void WriteBulk(string destTableName, DataRow[] rowsToWrite, int? timeout = null);

        /// <summary>
        /// Effettua il salvataggio dei dati nel DataTable.
        /// Esegue le operazionidi Delete/Insert/Update in funzione dello stato delle righe
        /// Se necessario utilizza operazioni Bulk.
        /// </summary>
        void UpdateChanges(DataTable tbl, IDbTransaction transaction = null);

        /// <summary>
        /// Effettua il salvataggio di tutte le tabelle del database 
        /// Se necessario utilizza operazioni Bulk.
        /// Esegue le operazionidi Delete/Insert/Update in funzione dello stato delle righe
        /// Esegue un analisi delle relazioni per determinare l'ordine di aggiornamento
        /// </summary>
        void UpdateChanges(DataSet ds, IDbTransaction transaction = null);

        /// <summary>
        /// Effettua il salvataggio di una tabella in bulk verificando quali righe inserire e quali aggiornare
        /// </summary>
        /// <param name="tbl"></param>
        /// <param name="transaction"></param>
        void InsertUpdateData(DataTable tbl, IDbTransaction transaction = null);

        /// <summary>
        /// Restituisce la query paginata a partire dalla query indicata.
        /// </summary>
        /// <param name="query"></param>
        /// <param name="sortColumn"></param>
        /// <param name="pageIndex"></param>
        /// <param name="pageSize"></param>
        /// <param name="sortByDesc"></param>
        /// <param name="selCols"></param>
        /// <returns></returns>
        string GetPagedQuery(string query, string sortColumn, int pageIndex, int pageSize, bool sortByDesc);
        string GetPagedQuery(string query, string sortColumn, int pageIndex, int pageSize, bool sortByDesc, string selCols);

        /// <summary>
        /// Restituisce la stringa da utilizzare per una select a partire dai nomi dei campi.
        /// Effettua gli escape necessari quando i campi coincidono con parole chiave.
        /// </summary>
        /// <param name="fields"></param>
        /// <returns></returns>
        string GetSelectString(string tableName, string[] fields);

        /// <summary>
        /// Restituisce la definizione della view indicata.
        /// </summary>
        /// <param name="viewName"></param>
        /// <returns></returns>
        string GetViewDefinition(string viewName);

        /// <summary>
        /// Restituisce lo script di creazione della tabella a partire dal DataTable indicato.
        /// </summary>
        /// <param name="table"></param>
        /// <returns></returns>
        string GetTableScript(DataTable table, string tbName, bool createPK = false, bool createSpIndex = false);

        /// <summary>
        /// Restituisce lo script per creare una tabella direttamente da una query
        /// </summary>
        /// <param name="tableName"></param>
        /// <param name="select"></param>
        /// <returns></returns>
        string GetCreateTableFromSelectScript(string tableName, string select);

        /// <summary>
        /// Restituisce la struttura della tabella indicata leggendo la definizione dal DB.
        /// </summary>
        /// <param name="tableName"></param>
        /// <returns></returns>
        Dictionary<string, ColumnDefinition> GetTableDefinition(string tableName);

        string ISNULL_FUNC_NAME
        {
            get;
        }

        string CONCAT_STRING_KEYWORD
        {
            get;
        }

        string START_ESCAPE_CHAR
        {
            get;
        }

        string END_ESCAPE_CHAR 
        {
            get;
        }

        /// <summary>
        /// Restituisce il carattere di chiusura delle espressioni MERGE.
        /// </summary>
        /// <returns></returns>
        string END_MERGE_CHAR { get; }

        /// <summary>
        /// Restituisce uno script per aggiornare una tabella a partire da un'altra
        /// </summary>
        /// <param name="srcTableName"></param>
        /// <param name="destTableName"></param>
        /// <returns></returns>
        string GetUpdateScript(string srcTableName, string destTableName, ICollection<DataColumn> updateColumns, ICollection<DataColumn> primaryKeycolumns, Dictionary<string, string> colMapping = null);


        /// <summary>
        /// Restituisce l'espressione per ottenere la differenza tra due date espressa nell'unità di misura indicata da dateDiffPart.
        /// </summary>
        /// <param name="startDateField"></param>
        /// <param name="endDateField"></param>
        /// <param name="dateDiffPart"></param>
        /// <returns></returns>
        string GetDateDifferenceExpression(string startDateField, string endDateField, DateDiffPartEnum dateDiffPart);

        /// <summary>
        /// Restituisce l'espressione per ottenere la data corrente.
        /// </summary>
        /// <returns></returns>
        string GetCurrentDateExpression();

        /// <summary>
        /// Restituisce l'espressione per identificare una colonna come identity durante la creazione di una tabella.
        /// </summary>
        /// <param name="seed"></param>
        /// <param name="increment"></param>
        /// <returns></returns>
        string IdentityColumnExpression(int seed, int increment);

        /// <summary>
        /// Restituisce l'espressione per fare il parse di una data secondo un certo formato.
        /// </summary>
        /// <param name="dateExpr"></param>
        /// <param name="format"></param>
        /// <returns></returns>
        string GetParseDateExpression(string dateExpr, string format);

        /// <summary>
        /// Restituisce l'espressione per fare lo shrink del file di transaction log del db.
        /// </summary>
        /// <returns></returns>
        string GetShrinkFileExpression();

        /// <summary>
        /// Restituisce l'espressione per calcolare l'and bit a bit del campo indicato con il valore indicato.
        /// </summary>
        /// <param name="fieldName"></param>
        /// <param name="fieldValue"></param>
        /// <returns></returns>
        string GetBitAndOperationExpression(string fieldName, string fieldValue);

        /// <summary>
        /// Restituisce l'espressione per calcolare l'or bit a bit del campo indicato con il valore indicato.
        /// </summary>
        /// <param name="fieldName"></param>
        /// <param name="fieldValue"></param>
        /// <returns></returns>
        string GetBitOrOperationExpression(string fieldName, string fieldValue);

        /// <summary>
        /// Restituisce il nome delle PK (da file di configurazione)
        /// </summary>
        string IDField { get; set; }

        /// <summary>
        /// Restituisce la lunghezza del campo chiave primaria
        /// </summary>
        int IDFieldLength { get; }

        /// <summary>
        /// Restituisce la lunghezza del prefisso della chiave primaria
        /// </summary>
        int IDFieldPrefixLength { get; }

        //Restituisce il costrutto substring in funzione del tipo di datastore
        string GetSubstringOperator(string sourceStr, int fromPos, int length);

        //Restituisce il costrutto trim in funzione del tipo di datastore
        string GetTrimOperator(string sourceStr);

        /// <summary>
        /// Restituisce i nomi delle tabelle esistenti nel db applicando un eventuale filtro sui nomi
        /// Per ora sul filtro facciamo inizia per, poi vediamo come estendere
        /// </summary>
        /// <param name="nameFilter"></param>
        /// <returns></returns>
        string[] GetExistingTables(string nameFilter = null, string owner = null);

        /// <summary>
        /// Restituisce i nomi delle view esistenti nel db applicando un eventuale filtro sui nomi
        /// Per ora sul filtro facciamo inizia per, poi vediamo come estendere
        /// </summary>
        /// <param name="nameFilter"></param>
        /// <returns></returns>
        string[] GetExistingViews(string nameFilter = null, string owner = null);

        /// <summary>
        /// Verifica se una tabella esiste nel database
        /// </summary>
        /// <param name="tableName"></param>
        /// <returns></returns>
        bool ExistsTable(string tableName, string owner = null);

        /// <summary>
        /// Verifica se una view esiste nel database
        /// </summary>
        /// <param name="viewName"></param>
        /// <param name="owner"></param>
        /// <returns></returns>
        bool ExistsView(string viewName, string owner = null);

        /// <summary>
        /// Verifica se una view esiste nel database
        /// </summary>
        /// <param name="indexName">nome dell'indeice</param>
        /// <param name="tableName">nome della tabella</param>
        /// <returns></returns>
        bool ExistsIndex(string indexName, string tableName);

        /// <summary>
        /// Restituisce la rappresentazione testuale di una data.
        /// </summary>
        /// <param name="date"></param>
        /// <returns></returns>
        string GetDateTextRepresentation(DateTime date);

        /// <summary>
        /// Restituisce la rappresentazione testuale di un double.
        /// </summary>
        /// <param name="d"></param>
        /// <returns></returns>
        string GetDoubleTextRepresentation(double d);

        /// <summary>
        /// Restituisce l'espressione per definire una colonna attraverso la funzione hash della concatenazione dei valori delle colonne passate come parametro
        /// </summary>
        /// <param name="cols">elenco di nomi delle colonne</param>
        /// <returns></returns>
        string GetPersistedHashColumnExpression(List<string> cols);

        /// <summary>
        /// Restituisce l'espressione per calcolare la funzione hash della concatenazione dei valori delle colonne passate come parametro
        /// </summary>
        /// <param name="cols">elenco di nomi delle colonne</param>
        /// <returns></returns>
        string GetHashColumnExpression(List<string> cols);

        /// <summary>
        /// Trasforma un espressione in ucase per usarla in una query in modalità non case sensitive.
        /// </summary>
        /// <param name="expression"></param>
        /// <returns></returns>
        string UCaseExpressionNCS(string expression);

        #region Tabelle Temporanee 

        string GetTempTableName();

        string GetTempViewName();

        void ClearExpiredObjects(int expireDays, string type = null, string objectPrefix = null);

        void ClearExpiredTempTables();

        void ClearExpiredTempViews();

        #endregion Tabelle Temporanee 

        /// <summary>
        /// Scrive la tabella indicata in una tabella temporanea. Restituisce il nome della tabella.
        /// </summary>
        /// <param name="tbToWrite"></param>
        /// <returns></returns>
        string WriteTempTable(DataTable tbToWrite, bool createPK = false, bool createSpIndex = false);

        /// <summary>
        /// Restituisce la query per ottenere le prime N righe a partire dal comando passato.
        /// </summary>
        /// <param name="cmdTxt"></param>
        /// <param name="numRows"></param>
        /// <returns></returns>
        string GetTopNRowsQuery(string cmdTxt, int numRows);

        /// <summary>
        /// Restituisce i metadati di una tabella
        /// </summary>
        /// <param name="tableName"></param>
        /// <returns></returns>
        DataTable GetTableMetadata(string tableName);

        /// <summary>
        /// Returns the command for disabling an index of a table
        /// </summary>
        /// <param name="tableName"></param>
        /// <returns></returns>
        string GetDisableIndexExpression(string tableName, string indexName);

        /// <summary>
        /// Returns the command for rebuilding an index of a table
        /// </summary>
        /// <param name="tableName"></param>
        /// <returns></returns>
        string GetRebuildIndexExpression(string tableName, string indexName);

        /// <summary>
        /// Returns the command for enabling checking of all constraints in a table
        /// </summary>
        /// <param name="tableName"></param>
        /// <returns></returns>
        string GetEnableCheckConstraintsExpression(string tableName);

        /// <summary>
        /// Returns the command for disabling checking all constraints in a table
        /// </summary>
        /// <param name="tableName"></param>
        /// <returns></returns>
        string GetDisableCheckConstraintsExpression(string tableName);

        /// <summary>
        /// Returns the name of the primary key of the table if exists.
        /// </summary>
        /// <param name="tableName"></param>
        /// <returns></returns>
        string GetPrimaryKeyName(string tableName);

        /// <summary>
        /// Renames a table.
        /// </summary>
        /// <param name="oldTableName">Old name of the table.</param>
        /// <param name="newTableName">New name of the table.</param>
        /// <returns></returns>
        string RenameTables(string oldTableName, string newTableName);

        /// <summary>
        /// Renames a key.
        /// </summary>
        /// <param name="oldFkName">Old name of the key.</param>
        /// <param name="newFkName">New name of the key.</param>
        /// <returns></returns>
        string RenameKeys(string oldFkName, string newFkName);

        /// <summary>
        /// Gets a parameter for query
        /// </summary>
        /// <param name="columnDefinition"></param>
        /// <param name="val"></param>
        /// <returns></returns>
        DbParameter GetParameter(ColumnDefinition columnDefinition, object val);
    }

    public class ColumnDefinition
    {
        public string ColumnName { get; set; }
        public string DataType { get; set; }
        public string ProviderDataType { get; set; }
        public int DataLength { get; set; }
        public int DataPrecision { get; set; }
        public int DataScale { get; set; }
        public bool Nullable { get; set; }
        public bool IsPK { get; set; }
    }

    public enum DateDiffPartEnum
    {
        Seconds,
        Minutes,
        Hours,
        Days
    }

}
