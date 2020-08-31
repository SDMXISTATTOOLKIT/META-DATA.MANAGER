using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
 
namespace DataStore.Interface
{

    //
    // Summary:
    //     Bitwise flag that specifies one or more options to use with an instance of System.Data.SqlClient.SqlBulkCopy.
    [Flags]
    public enum BulkCopyOptions
    {
        //
        // Summary:
        //     Use the default values for all options.
        Default = 0,
        //
        // Summary:
        //     Preserve source identity values. When not specified, identity values are assigned
        //     by the destination.
        KeepIdentity = 1,
        //
        // Summary:
        //     Check constraints while data is being inserted. By default, constraints are not
        //     checked.
        CheckConstraints = 2,
        //
        // Summary:
        //     Obtain a bulk update lock for the duration of the bulk copy operation. When not
        //     specified, row locks are used.
        TableLock = 4,
        //
        // Summary:
        //     Preserve null values in the destination table regardless of the settings for
        //     default values. When not specified, null values are replaced by default values
        //     where applicable.
        KeepNulls = 8,
        //
        // Summary:
        //     When specified, cause the server to fire the insert triggers for the rows being
        //     inserted into the database.
        FireTriggers = 16,
        //
        // Summary:
        //     When specified, each batch of the bulk-copy operation will occur within a transaction.
        //     If you indicate this option and also provide a System.Data.SqlClient.SqlTransaction
        //     object to the constructor, an System.ArgumentException occurs.
        UseInternalTransaction = 32
    }

    public interface IBulkCopy: IDisposable
    {
        //
        // Summary:
        //     Number of rows in each batch. At the end of each batch, the rows in the batch
        //     are sent to the server.
        //
        // Returns:
        //     The integer value of the System.Data.SqlClient.SqlBulkCopy.BatchSize property,
        //     or zero if no value has been set.
        int BatchSize { get; set; }

        //
        // Summary:
        //     Number of seconds for the operation to complete before it times out.
        //
        // Returns:
        //     The integer value of the System.Data.SqlClient.SqlBulkCopy.BulkCopyTimeout property.
        //     The default is 30 seconds. A value of 0 indicates no limit; the bulk copy will
        //     wait indefinitely.
        int BulkCopyTimeout { get; set; }

        //
        // Summary:
        //     Name of the destination table on the server.
        //
        // Returns:
        //     The string value of the System.Data.SqlClient.SqlBulkCopy.DestinationTableName
        //     property, or null if none as been supplied.
        string DestinationTableName { get; set; }

        //
        // Summary:
        //     Returns a collection of System.Data.SqlClient.SqlBulkCopyColumnMapping items.
        //     Column mappings define the relationships between columns in the data source and
        //     columns in the destination.
        //
        // Returns:
        //     A collection of column mappings. By default, it is an empty collection.
        Dictionary<string,string> ColumnMappings { get; }

        //
        // Summary:
        //     Closes the System.Data.SqlClient.SqlBulkCopy instance.
        void Close();

        //
        // Summary:
        //     Copies all rows from the supplied System.Data.DataRow array to a destination
        //     table specified by the System.Data.SqlClient.SqlBulkCopy.DestinationTableName
        //     property of the System.Data.SqlClient.SqlBulkCopy object.
        //
        // Parameters:
        //   rows:
        //     An array of System.Data.DataRow objects that will be copied to the destination
        //     table.
        void WriteToServer(DataRow[] rows);

        //
        // Summary:
        //     Copies all rows in the supplied System.Data.DataTable to a destination table
        //     specified by the System.Data.SqlClient.SqlBulkCopy.DestinationTableName property
        //     of the System.Data.SqlClient.SqlBulkCopy object.
        //
        // Parameters:
        //   table:
        //     A System.Data.DataTable whose rows will be copied to the destination table.
        void WriteToServer(DataTable table);

        //
        // Summary:
        //     Copies only rows that match the supplied row state in the supplied System.Data.DataTable
        //     to a destination table specified by the System.Data.SqlClient.SqlBulkCopy.DestinationTableName
        //     property of the System.Data.SqlClient.SqlBulkCopy object.
        //
        // Parameters:
        //   table:
        //     A System.Data.DataTable whose rows will be copied to the destination table.
        //
        //   rowState:
        //     A value from the System.Data.DataRowState enumeration. Only rows matching the
        //     row state are copied to the destination.
        void WriteToServer(DataTable table, DataRowState rowState);

    }
}
