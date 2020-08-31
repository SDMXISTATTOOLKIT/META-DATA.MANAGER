using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Data;
using DataStore.Interface;
 
namespace DataStore.Base
{
    public class SqlBulkAdapter
    {
        #region Campi privati
        
        private BaseDataStore mBaseDataStore;
        
        /// <summary>
        /// La connessione utilizzata dall'adapter
        /// </summary>
        private IDbConnection mConn;

        /// <summary>
        /// Transazione dentro la quale eseguire le operazioni
        /// </summary>
        private IDbTransaction mTrans;


        private bool mCreatePK = true;

        /// <summary>
        /// La tabella da inviare al server
        /// </summary>
        private DataTable mTb;

        /// <summary>
        /// Nome della tabella da aggiornare
        /// </summary>
        private string mDestTblName;

        /// <summary>
        /// Nome della tabella tamporanea utilizzata per gli update e i delete
        /// </summary>
        private string tempTblName;

        /// <summary>
        /// Messaggio di errore
        /// </summary>
        private string mError;

        /// <summary>
        /// Eccezione
        /// </summary>
        private Exception mException;

        #endregion

        #region Costruttori

        public SqlBulkAdapter(BaseDataStore baseDataStore)
        {
            mBaseDataStore = baseDataStore;
            mConn = mBaseDataStore.Connection;
        }
        
        public SqlBulkAdapter(BaseDataStore baseDataStore, bool createPK, IDbTransaction trans)
        {
            mBaseDataStore = baseDataStore;
            mConn = mBaseDataStore.Connection;
            mTrans = trans;
            mCreatePK = createPK;
        }

        #endregion

        #region Proprietà pubbliche

        /// <summary>
        /// Restituisce il messaggio di errore
        /// </summary>
        public string Error
        {
            get
            {
                return mError;
            }
        }

        /// <summary>
        /// Restituisce l'eccezione
        /// </summary>
        public Exception Exception
        {
            get
            {
                return mException;
            }
        }

        #endregion

        #region Metodi pubblici


        /// <summary>
        /// Esegue la insert delle righe added della tabella indicata nella tabella di destinazione indicata
        /// </summary>
        /// <param name="srcTable"></param>
        /// <param name="destTblName"></param>
        /// <returns></returns>
        public bool ExecInsert(DataTable srcTable, string destTblName)
        {
            return ExecInsert(srcTable, destTblName, false);
        }



        /// <summary>
        /// Esegue la insert delle righe added della tabella indicata nella tabella di destinazione indicata
        /// </summary>
        /// <param name="srcTable"></param>
        /// <param name="destTblName"></param>
        /// <returns></returns>
        public bool ExecInsert(DataTable srcTable, string destTblName, bool checkPk)
        {
            DataRow[] insertedRows = srcTable.Select("", "", DataViewRowState.Added);

            return ExecInsert(srcTable, destTblName, insertedRows, checkPk);
        }



        /// <summary>
        /// Esegue la insert delle righe added della tabella indicata nella tabella di destinazione indicata
        /// </summary>
        /// <param name="srcTable"></param>
        /// <param name="destTblName"></param>
        /// <param name="insertedRows"></param>
        /// <returns></returns>
        public bool ExecInsert(DataTable srcTable, string destTblName, DataRow[] insertedRows)
        {
            return ExecInsert(srcTable, destTblName, insertedRows, false);
        }

        /// <summary>
        /// Esegue la insert delle righe added della tabella indicata nella tabella di destinazione indicata
        /// </summary>
        /// <param name="srcTable"></param>
        /// <param name="destTblName"></param>
        /// <param name="insertedRows"></param>
        /// <returns></returns>
        public bool ExecInsert(DataTable srcTable, string destTblName, DataRow[] insertedRows, bool checkPk)
        {
            mError = "";
            mException = null;

            if (insertedRows.Length == 0)
            {
                return true;
            }

            mTb = srcTable;

            mDestTblName = destTblName;

            try
            {
                // ... creo la tabella temporanea
                CreateTempTable();

                try
                {
                    DoInsert(insertedRows, checkPk);
                }
                finally
                {
                    DropTempTable();
                }
            }
            catch (Exception ex)
            {
                mError = ex.Message;
                mException = ex;

                return false;
            }

            return true;
        }

        /// <summary>
        /// Esegue la update delle righe modified della tabella indicata nella tabella di destinazione indicata
        /// </summary>
        /// <param name="srcTable"></param>
        /// <param name="destTblName"></param>
        /// <returns></returns>
        public bool ExecUpdate(DataTable srcTable, string destTblName)
        {
            DataRow[] updatedRows = srcTable.Select("", "", DataViewRowState.ModifiedCurrent);

            return ExecUpdate(srcTable, destTblName, updatedRows);
        }

        /// <summary>
        /// Esegue la update delle righe modified della tabella indicata nella tabella di destinazione indicata
        /// </summary>
        /// <param name="srcTable"></param>
        /// <param name="destTblName"></param>
        /// <param name="updatedRows"></param>
        /// <returns></returns>
        public bool ExecUpdate(DataTable srcTable, string destTblName, DataRow[] updatedRows)
        {
            mError = "";
            mException = null;

            if (updatedRows.Length == 0)
            {
                return true;
            }

            mTb = srcTable;

            mDestTblName = destTblName;

            try
            {
                // ... creo la tabella temporanea
                CreateTempTable();

                try
                {
                    DoUpdate(updatedRows);
                }
                finally
                {
                    DropTempTable();
                }
            }
            catch (Exception ex)
            {
                mError = ex.Message;
                mException = ex;

                return false;
            }

            return true;
        }

        /// <summary>
        /// Esegue in banca dati l'inserimento e l'update delle righe di una tabella
        /// In base alla chiave primaria verrà deciso quali sono le righe da inserire e quali quelle da aggiornare
        /// </summary>
        /// <param name="srcTable"></param>
        /// <param name="destTblName"></param>
        /// <returns></returns>
        public bool ExecInsertUpdate(DataTable srcTable, string destTblName)
        {
            DataRow[] rows = srcTable.Select();

            return ExecInsertUpdate(srcTable, destTblName, rows);
        }

        /// <summary>
        /// Esegue in banca dati l'inserimento e l'update delle righe di una tabella
        /// In base alla chiave primaria verrà deciso quali sono le righe da inserire e quali quelle da aggiornare
        /// </summary>
        /// <param name="srcTable"></param>
        /// <param name="destTblName"></param>
        /// <param name="rows"></param>
        /// <returns></returns>
        public bool ExecInsertUpdate(DataTable srcTable, string destTblName, DataRow[] rows)
        {
            mError = "";
            mException = null;

            if (rows.Length == 0)
            {
                return true;
            }

            mTb = srcTable;

            mDestTblName = destTblName;

            try
            {
                // ... creo la tabella temporanea
                CreateTempTable();

                try
                {
                    DoInsertUpdate(rows);
                }
                finally
                {
                    DropTempTable();
                }
            }
            catch (Exception ex)
            {
                mError = ex.Message;
                mException = ex;

                return false;
            }

            return true;
        }

        /// <summary>
        /// Esegue la delete delle righe deleted della tabella indicata nella tabella di destinazione indicata
        /// </summary>
        /// <param name="srcTable"></param>
        /// <param name="destTblName"></param>
        /// <returns></returns>
        public bool ExecDelete(DataTable srcTable, string destTblName)
        {
            DataRow[] deletedRows = srcTable.Select("", "", DataViewRowState.Deleted);

            return ExecDelete(srcTable, destTblName, deletedRows);
        }

        /// <summary>
        /// Esegue la delete delle righe deleted della tabella indicata nella tabella di destinazione indicata
        /// </summary>
        /// <param name="srcTable"></param>
        /// <param name="destTblName"></param>
        /// <param name="deletedRows"></param>
        /// <returns></returns>
        public bool ExecDelete(DataTable srcTable, string destTblName, DataRow[] deletedRows)
        {
            mError = "";
            mException = null;

            if (deletedRows.Length == 0)
            {
                return true;
            }

            mTb = srcTable;

            mDestTblName = destTblName;

            try
            {
                // ... creo la tabella temporanea
                CreateTempTable();

                try
                {
                    DoDelete(deletedRows);
                }
                finally
                {
                    DropTempTable();
                }
            }
            catch (Exception ex)
            {
                mError = ex.Message;
                mException = ex;

                return false;
            }

            return true;
        }

        /// <summary>
        /// Esegue le insert, update e delete in base al rowstate delle righe della tabella associata all'adapter
        /// </summary>
        /// <param name="srcTable">La tabella contenente i dati per l'aggiornamento</param>
        /// <param name="destTblName">Il nome della tabella da aggiornare</param>
        public bool Update(DataTable srcTable, string destTblName)
        {
            mError = "";
            mException = null;

            mTb = srcTable;

            mDestTblName = destTblName;
            
            if(mTb.PrimaryKey.Length == 0 )
            {
                throw new Exception("Senza Pk non si può usare il Bulk adapter");
            }
            
            try
            {
                // ... creo la tabella temporanea
                CreateTempTable();

                try
                {
                    DoInsert();

                    DoUpdate();

                    DoDelete();
                }
                finally
                {
                    DropTempTable();
                }
            }
            catch (Exception ex)
            {
                mError = ex.Message;
                mException = ex;

                return false;
            }

            return true;
        }

        #endregion

        #region Metodi privati

        /// <summary>
        /// Inserisce in banca dati le righe con row state added
        /// </summary>
        private void DoInsert()
        {
            DataRow[] drArr = mTb.Select("", "", DataViewRowState.Added);

            DoInsert(drArr);
        }


        /// <summary>
        /// Inserisce in banca dati le righe con row state added
        /// </summary>
        private void DoInsert(DataRow[] insertedRows)
        {
            DoInsert(insertedRows, false);
        }


        /// <summary>
        /// Inserisce in banca dati le righe con row state added
        /// </summary>
        private void DoInsert(DataRow[] insertedRows, bool checkPkCollisions)
        {
            ClearTempTable();

            if (insertedRows.Length > 0)
            {
                // inserisco i dati nella tabella temporanea
                mBaseDataStore.WriteBulk(tempTblName, insertedRows);

                // inserisco i dati nella tabella originale
                string cmdInsert = null;
                
                if (checkPkCollisions)
                    cmdInsert = GetInsertCheckPkScript(tempTblName, mDestTblName);
                else
                    cmdInsert = GetInsertScript(tempTblName, mDestTblName);

                mBaseDataStore.ExecuteCommand(cmdInsert, transaction: mTrans);
            }

            // elimino i dati dalla tabella temporanea
            ClearTempTable();
        }

        /// <summary>
        /// Esegue in banca dati l'update delle righe con rows tate modified
        /// </summary>
        private void DoUpdate()
        {
            DataRow[] drArr = mTb.Select("", "", DataViewRowState.ModifiedCurrent);

            DoUpdate(drArr);
        }

        /// <summary>
        /// Esegue in banca dati l'update delle righe con rows tate modified
        /// </summary>
        private void DoUpdate(DataRow[] updatedRows)
        {
            ClearTempTable();

            // ci copio dentro tutte le righe modificate
          
            if (updatedRows.Length > 0)
            {
                mBaseDataStore.WriteBulk(tempTblName, updatedRows);

                // aggiorno i dati della tabella originale
                string cmdUpdate = GetUpdateScript(tempTblName, mDestTblName);

                if (cmdUpdate != null)
                {
                    mBaseDataStore.ExecuteCommand(cmdUpdate, transaction: mTrans);
                }
            }

            // elimino i dati dalla tabella temporanea
            ClearTempTable();
        }

        /// <summary>
        /// Esegue in banca dati l'inserimento e l'update delle righe di una tabella
        /// In base alla chiave primaria verrà deciso quali sono le righe da inserire e quali quelle da aggiornare
        /// </summary>
        private void DoInsertUpdate()
        {
            DataRow[] drArr = mTb.Select();

            DoInsertUpdate(drArr);
        }

        /// <summary>
        /// Esegue in banca dati l'inserimento e l'update delle righe di una tabella
        /// In base alla chiave primaria verrà deciso quali sono le righe da inserire e quali quelle da aggiornare
        /// </summary>
        private void DoInsertUpdate(DataRow[] rows)
        {
            ClearTempTable();

            // ci copio dentro tutte le righe modificate

            if (rows.Length > 0)
            {
                mBaseDataStore.WriteBulk(tempTblName, rows);

                // aggiorno i dati della tabella originale
                string cmdUpdate = GetUpdateScript(tempTblName, mDestTblName);

                if (cmdUpdate != null)
                {
                    mBaseDataStore.ExecuteCommand(cmdUpdate, transaction: mTrans);
                }

                // inserisco i dati nella tabella originale
                string cmdInsert = GetInsertCheckPkScript(tempTblName, mDestTblName);

                mBaseDataStore.ExecuteCommand(cmdInsert, transaction: mTrans);
            }

            // elimino i dati dalla tabella temporanea
            ClearTempTable();
        }

        /// <summary>
        /// Esegue in banca dati la delete delle righe con rows tate deleted
        /// </summary>
        private void DoDelete()
        {
            DataRow[] deletedRows = mTb.Select("", "", DataViewRowState.Deleted);

            DoDelete(deletedRows);
        }

        /// <summary>
        /// Esegue in banca dati la delete delle righe con rows tate deleted
        /// </summary>
        private void DoDelete(DataRow[] deletedRows)
        {
            if (deletedRows.Length > 0)
            {
                ClearTempTable();
                
                DataRow[] copyRows = CopyDeletedRows();

                if (copyRows.Length > 0)
                {
                    mBaseDataStore.WriteBulk(tempTblName, copyRows);

                    // cancello i dati dalla tabella originale
                    string cmdUpdate = GetDeleteScript(tempTblName, mDestTblName);

                    mBaseDataStore.ExecuteCommand(cmdUpdate, transaction: mTrans);
                }
            }
        }



        /// <summary>
        /// Tasferisce i dati al server. 
        /// </summary>
        /// <param name="blk"></param>
        /// <param name="copyRows"></param>
        private static void BulkWriteToServer(IBulkCopy blk, DataRow[] copyRows)
        {
            blk.BulkCopyTimeout = 60 * 2; // due minuti
            blk.BatchSize = (copyRows.Length / 10 + 1) * 10; //decina superiore al numero di righe

            try
            {
                blk.WriteToServer(copyRows);
            }
            catch // (SqlException ex)
            {
                //Se va in timeout(per il baco di.NET) si riprova con un altra dimensione di buffer dando un tempo più lungo

                blk.BulkCopyTimeout = 60 * 10; // 10 minuti
                blk.BatchSize = (copyRows.Length + 1) / 2;

                blk.WriteToServer(copyRows);
            }
        }


        #region Metodi per l'esecuzione di comandi SQL


        /// <summary>
        /// Esegue una copia delle righe deleted
        /// </summary>
        /// <returns></returns>
        private DataRow[] CopyDeletedRows()
        {
            DataRow[] rowsToCopy = mTb.Select("", "", DataViewRowState.Deleted);

            DataRow[] copyRows = new DataRow[rowsToCopy.Length];

            for (int i = 0; i < rowsToCopy.Length; i++)
            {
                DataRow copyRow = mTb.NewRow();

                DataRow rowToCopy = rowsToCopy[i];

                rowToCopy.RejectChanges();

                foreach (DataColumn col in mTb.Columns)
                {

                    copyRow[col.ColumnName] = rowToCopy[col.ColumnName];
                }

                rowToCopy.Delete();

                copyRows[i] = copyRow;
            }

            return copyRows;
        }

        #endregion

        #region Metodi per la gestione della tabella temporanea

        /// <summary>
        /// Crea la tabella temporanea
        /// </summary>
        private void CreateTempTable()
        {
            // creo il nome della tabella temporanea
            tempTblName = mBaseDataStore.GetTmpTableName();

            string cmdCreateTxt = GetTableCreationScript(tempTblName);

            mBaseDataStore.ExecuteCommand(cmdCreateTxt);
        }

        /// <summary>
        /// Elimina i dati dalla tabella temporanea
        /// </summary>
        private void ClearTempTable()
        {
            mBaseDataStore.ExecuteCommand("TRUNCATE TABLE " + tempTblName);
        }

        /// <summary>
        /// Elimina la tabella temporanea
        /// </summary>
        private void DropTempTable()
        {
            mBaseDataStore.ExecuteCommand("DROP TABLE " + tempTblName);
        }

       
        #endregion

        #region Metodi per gli script di creazione e aggiornamento delle tabelle temporanee


        /// <summary>
        /// Restituisce lo script di creazione della tabella gestita dall'adapter.
        /// </summary>
        /// <param name="tableName">Nome che verrà assegnato alla tabella creata</param>
        /// <returns></returns>
        private string GetTableCreationScript(string tableName)
        {
            return  mBaseDataStore.GetTableScript(mTb, tableName, mCreatePK);
        }

              

        /// <summary>
        /// Restituisce uno script di inserimento senza il controllo di PK duplicate  rispetto alla tabella di destinazione
        /// </summary>
        /// <param name="srcTableName"></param>
        /// <param name="destTableName"></param>
        /// <returns></returns>
        private string GetInsertScript(string srcTableName, string destTableName)
        {
            string cmdTxt = "INSERT INTO " + mBaseDataStore.QuoteName(destTableName) + " ( ";

            String colList = "";

            foreach (DataColumn col in mTb.Columns)
            {
                if (col.AutoIncrement)
                    continue;

                if (col.ColumnName == "FULLTEXT_COLUMN")
                    continue;

                if (colList != "")
                {
                    colList += ", ";
                }

                colList += mBaseDataStore.QuoteName(col.ColumnName);
            }

            cmdTxt += colList + " ) ";

            cmdTxt += " SELECT " + colList + " FROM " + srcTableName;

            return cmdTxt;
        }



        /// <summary>
        /// Restituisce uno script di inserimento con il controllo di duplicati rispetto alla tabella di destinazione
        /// </summary>
        /// <param name="srcTableName"></param>
        /// <param name="destTableName"></param>
        /// <returns></returns>
        private string GetInsertCheckPkScript(string srcTableName, string destTableName)
        {
            string cmdTxt = "INSERT INTO " + mBaseDataStore.QuoteName(destTableName) + " ( ";

            String colList = "";
            String selColList = "";
            string keyList = "";


            foreach (DataColumn col in mTb.Columns)
            {
                if (col.AutoIncrement)
                    continue;

                if (col.ColumnName == "FULLTEXT_COLUMN")
                    continue;

                if (colList != "")
                {
                    colList += ", ";
                }

                colList += col.ColumnName;

                if (selColList != "")
                {
                    selColList += ", ";
                }

                selColList += "SRC_T." + col.ColumnName;

            }

            keyList = BaseDataStore.GetCompareCollection(mTb.PrimaryKey, "SRC_T", "DEST_T", " AND ");

            cmdTxt += colList + " ) ";

            cmdTxt += " SELECT " + selColList + " FROM " + srcTableName + " SRC_T LEFT JOIN " + destTableName + " DEST_T ON " + keyList +
                         " WHERE DEST_T." + mTb.PrimaryKey[0].ColumnName + " IS NULL";

            return cmdTxt;
        }


        /// <summary>
        /// Restituisce il comando di update della tabella di destinazione tramite la tabella sorgente specificata
        /// </summary>
        /// <param name="srcTableName"></param>
        /// <param name="destTableName"></param>
        /// <returns></returns>
        private string GetUpdateScript(string srcTableName, string destTableName)
        {

            List<DataColumn> colColl = new List<DataColumn>();

            foreach (DataColumn col in mTb.Columns)
            {
                if (col.ColumnName == "FULLTEXT_COLUMN" || col.ColumnName == "OBJECTID") 
                    continue;

                // costruire una collezione di colonne che non sono chiave
                // l'update va fatta solo su queste colonne!!!
                colColl.Add(col);
            }

            foreach (DataColumn col in mTb.PrimaryKey)
            {
                if (colColl.Contains(col))
                    colColl.Remove(col);
            }

            return mBaseDataStore.GetUpdateScript(srcTableName, destTableName, colColl, mTb.PrimaryKey);
        }

        /// <summary>
        /// Restituisce lo script per eliminare le righe dalla tabella di destinazione che fanno join con quelle della tabella sorgente
        /// </summary>
        /// <param name="srcTableName"></param>
        /// <param name="destTableName"></param>
        /// <returns></returns>
        private string GetDeleteScript(string srcTableName, string destTableName)
        {
            string cmdTxt = "DELETE FROM " + destTableName + " FROM " + srcTableName + " WHERE ";

            return cmdTxt + BaseDataStore.GetCompareCollection(mTb.PrimaryKey, srcTableName, destTableName, " AND ");
        }        

        /// <summary>
        /// Restituisce il tipo SQL corrispondente al tipo c# indicato.
        /// </summary>
        /// <param name="dataType"></param>
        /// <returns></returns>
        private  string TypeMapping(Type dataType)
        {
            return mBaseDataStore.TypeMapping(dataType, 1000);
        }

        /// <summary>
        /// Esegue il mapping tra i principali tipi .NET e quelli SQL
        /// </summary>
        /// <param name="col"></param>
        /// <returns></returns>
        private  string TypeMapping(DataColumn col)
        {
            return mBaseDataStore.TypeMapping(col.DataType, col.MaxLength);
        }

        /// <summary>
        /// Indica se una colonna è chiave della tabella a cui appartiene
        /// </summary>
        /// <param name="col"></param>
        /// <returns></returns>
        private static bool IsKey(DataColumn col)
        {
            DataColumn[] keys = col.Table.PrimaryKey;

            foreach (DataColumn c in keys)
            {
                if (c == col)
                    return true;
            }

            return false;
        }

        #endregion

        #endregion

    }
}

