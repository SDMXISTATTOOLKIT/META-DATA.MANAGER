using DataModel;
using DDB.Entities;
using NSI.Entities;
using System.Collections.Generic;
using System.Data;
using System.IO;
using System.Threading.Tasks;

namespace DataProvider
{
    public interface IDataflowBuilderDataProvider
    {
        /// <summary>
        /// Returns the list of dataflows in the DDB.
        /// </summary>
        /// <returns>The list of dataflows in the DDB.</returns>
        List<DDBDataflow> getDDBDataflows();

        /// <summary>
        /// Returns the requested DDB Dataflow.
        /// </summary>
        /// <param name="id">The DDB Dataflow id.</param>
        /// <returns></returns>
        DDBDataflowWithCols getDDBDataflow(int id);

        /// <summary>
        /// Returns the requested DDB Dataflow.
        /// </summary>
        /// <param name="cubeId">The DDB Cube id.</param>
        /// <returns></returns>
        List<DDBDataflowWithCols> getDDBDataflowsNoFilter(int cubeId);
        

        /// <summary>
        /// Creates a new dataflow in the DDB.
        /// </summary>
        /// <param name="dataflow">The dataflow to be created.</param>
        /// <returns>The dataflow id in case of success, otherwise an exception is thrown.</returns>
        int createDDBDataflow(DDBDataflowWithCols dataflow);

        /// <summary>
        /// Get a dataflow in CSV format according with the given parameters.
        /// </summary>
        /// <param name="selCols">The list of columns of the dataflow to be downloaded.</param>
        /// <param name="idCube">The id of the cube associated to the dataflow.</param>
        /// <param name="idDataflow">The id of the dataflow (-1 for get all cube)</param>
        /// <param name="filter">A filter to be applied on the dataflow.</param>
        /// <param name="partialIgnoreCheckFilter"></param>
        /// <param name="separator">CSV separator used in the file.</param>
        /// <param name="delimiter">CSV delimiter used in the file.</param>
        /// <returns>Return a path with csv file</returns>
        Task<string> downloadDDBDataflowInCsvAsync(DDBDataflow ddbDataflow, bool partialIgnoreCheckFilter, char separator, char delimiter);

        /// <summary>
        /// Deletes the DDB Dataflow with the given id.
        /// </summary>
        /// <param name="id">The id of the dataflow to be deleted.</param>
        /// <returns>True in case of success, otherwise an exception is thrown.</returns>
        bool deleteDDBDataflow(int id);

        /// <summary>
        /// Returns a dataflow's data preview according with the given parameters.
        /// </summary>
        /// <param name="selCols">The list of columns of the dataflow to be downloaded.</param>
        /// <param name="idCube">The id of the cube associated to the dataflow.</param>
        /// <param name="idDataflow">The id of the dataflow (-1 for get all cube)</param>
        /// <param name="filter">A filter to be applied on the dataflow.</param>
        /// <param name="numPage">Page number (used for paging).</param>
        /// <param name="pageSize">Page size (used for paging)</param>
        /// <param name="sortCols">The list of columns for order data</param>
        /// <param name="sortByDesc">specific if sort by desc or asc</param>
        /// <param name="partialIgnoreCheckFilter"></param>
        /// <returns>A DataTable containing the requested data.</returns>
        DataResults getDDBDataflowPreview(DDBDataflow ddbDataflowc, bool partialIgnoreCheckFilter);

        /// <summary>
        /// Sets dataflow's transcoding flag to the given value.
        /// </summary>
        /// <param name="id">The DDB Dataflow id.</param>
        /// <param name="value">The value to be set for the flag (true or false).</param>
        /// <returns>True in case of success, otherwise an exception is thrown.</returns>
        bool setHasTranscodingFlag(int id, bool value);

        /// <summary>
        /// Sets dataflow's HasContentConstraints flag to the given value.
        /// </summary>
        /// <param name="id">The DDB Dataflow id.</param>
        /// <param name="value">The value to be set for the flag (true or false).</param>
        /// <returns>True in case of success, otherwise an exception is thrown.</returns>
        bool setHasContentConstraintsFlag(int id, bool value);

        /// <summary>
        /// Returns a preview of a dataflow's column according with the given parameters.
        /// </summary>
        /// <param name="df">The dataflow.</param>
        /// <param name="colName">The name of the column to be returned.</param>
        /// <param name="numPage">Page number (used for paging).</param>
        /// <param name="pageSize">Page size (used for paging)</param>
        /// <returns>A DataTable containing the requested data.</returns>
        DataTable getDataflowColumnPreview(DDBDataflowWithCols df, string colName, int numPage, int pageSize, bool partialIgnoreCheckFilter);
    }
}
