using DataStore.Interface;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Data;
using System.Data.SqlClient;

namespace DataStore.SQLServerDataStore
{
    public class SQLBulkCopyWrapper : IBulkCopy
    {

        SqlBulkCopy mSqlBulkCopy;
        
        public SQLBulkCopyWrapper(IDbConnection conn, BulkCopyOptions options, IDbTransaction trans )
        {
            mSqlBulkCopy = new SqlBulkCopy((SqlConnection)conn, (SqlBulkCopyOptions) options, (SqlTransaction)trans);
        }

        public int BatchSize
        {
            get
            {
                return mSqlBulkCopy.BatchSize;
            }

            set
            {
                mSqlBulkCopy.BatchSize = value;
            }
        }

        public int BulkCopyTimeout
        {
            get
            {
                return mSqlBulkCopy.BulkCopyTimeout;
            }

            set
            {
                mSqlBulkCopy.BulkCopyTimeout = value;
            }
        }

        public Dictionary<string, string> ColumnMappings { get; } = new Dictionary<string, string>();

        public string DestinationTableName
        {
            get
            {
                return mSqlBulkCopy.DestinationTableName;
            }

            set
            {
                mSqlBulkCopy.DestinationTableName = value;
            }
        }

        public void Close()
        {
            mSqlBulkCopy.Close();
        }

        public void Dispose()
        {
            //TO BE IMPLEMENTED
        }

        public void WriteToServer(DataTable table)
        {
            SetMappigs();

            mSqlBulkCopy.WriteToServer(table);
        }

        public void WriteToServer(DataRow[] rows)
        {
            SetMappigs();

            mSqlBulkCopy.WriteToServer(rows);
        }

        public void WriteToServer(DataTable table, DataRowState rowState)
        {
            SetMappigs();

            mSqlBulkCopy.WriteToServer(table, rowState);
        }

        private void SetMappigs()
        {
            mSqlBulkCopy.ColumnMappings.Clear();

            if (ColumnMappings.Count > 0)
            {
                foreach (var cmap in ColumnMappings)
                    mSqlBulkCopy.ColumnMappings.Add(cmap.Key, cmap.Value);
            }
        }


    }
}
