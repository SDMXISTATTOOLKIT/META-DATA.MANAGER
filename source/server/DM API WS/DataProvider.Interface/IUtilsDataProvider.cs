using DataModel;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Data;
using System.IO;
using System.Text;
using System.Threading.Tasks;

namespace DataProvider
{
    public interface IUtilsDataProvider
    {
        /// <summary>
        /// Uploads a file on the file-system.
        /// </summary>
        /// <param name="file">The file to be uploaded.</param>
        /// <param name="idCube">The id of the cube to whom the file refers.</param>
        /// <returns>The path of the uploaded file in case of success, otherwise an exception is thrown.</returns>
        string uploadFileOnServer(IFormFile file, int idCube);

        /// <summary>
        /// Uploads a file on the file-system.
        /// </summary>
        /// <param name="file">The file to be uploaded.</param>
        /// <returns>The filename of the uploaded file in case of success, otherwise an exception is thrown.</returns>
        string uploadReferenceMetadataFileOnServer(IFormFile file);

        /// <summary>
        /// Gets a path file on the file-system.
        /// </summary>
        /// <param name="filename">The file.</param>
        String referenceMetadataFileOnServer(string filename);

        /// <summary>
        /// Returns a paged preview of a table in the DDB.
        /// </summary>
        /// <param name="tableName">The table name.</param>
        /// <param name="optionsTable">Contains option for paging, filter, sort</param>
        /// <returns></returns>
        DataResults getTablePreview(string tableName, OptionsTable optionsTable);

        /// <summary>
        /// Returns a paged preview of a column of a table in the DDB.
        /// </summary>
        /// <param name="tableName">The table name.</param>
        /// <param name="optionsTable">The column name, Page number (used for paging), Page size (used for paging).</param>
        /// <returns></returns>
        DataResults getTableColumnPreview(string tableName, OptionsTable optionsTable);

        /// <summary>
        /// Returns a string with the encrypted connection string for the current DDB.
        /// </summary>
        /// <returns></returns>
        string getConnectionString();

        /// <summary>
        /// Returns a string with the encrypted connection string for the current RMDB.
        /// </summary>
        /// <returns></returns>
        string getConnectionRMDBString();

        /// <summary>
        /// Removes all temp table from sql db
        /// </summary>
        /// <returns></returns>
        void RemoveTempTableAndViews();


        /// <summary>
        /// Checks if DDB is inizialized
        /// </summary>
        bool CheckInizializedDDB();

        /// <summary>
        /// Checks if DDB is inizialized
        /// </summary>
        bool InizializeDDB();

        /// <summary>
        /// Insert a list of string in a single-column table
        /// </summary>
        /// <param name="tableName">The name of the table.</param>
        /// <param name="values">The list of values to be inserted.</param>
        void createTempTableForUniqueValues(string tableName, List<string> values);
    }
}
