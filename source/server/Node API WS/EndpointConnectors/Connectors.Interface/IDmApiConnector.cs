using AuthCore.Model;
using DataModel;
using DDB.Entities;
using Microsoft.AspNetCore.Http;
using NSI.Entities;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;

namespace EndpointConnectors.Connectors
{
    public interface IDmApiConnector
    {

        #region Builder

        /// <summary>
        /// Returns one or all available cubes.
        /// </summary>
        /// <param name="id">Cube id. Not specified for getting all cubes.</param>
        /// <returns></returns>
        string GetCube(int? id);

        /// <summary>
        /// Returns default category scheme.
        /// </summary>
        /// <returns></returns>
        string GetDcs();

        /// <summary>
        /// Creates a new cube.
        /// </summary>
        /// <param name="cube">JSON string containing the cube.</param>
        /// <returns></returns>
        string CreateCube(string cube);

        /// <summary>
        /// Deletes a cube.
        /// </summary>
        /// <param name="id">Id of the cube to be deleted.</param>
        /// <returns></returns>
        string DeleteCube(int id);

        /// <summary>
        /// Imports default category scheme.
        /// </summary>
        /// <param name="categoryScheme">SDMX-JSON containing category scheme to be imported.</param>
        /// <param name="agencyId">Agency id of the category scheme to be imported.</param>
        /// <returns></returns>
        string ImportDCS(string categoryScheme, string agencyId);

        #endregion Builder

        #region Mapping

        /// <summary>
        /// Creates a new file mapping.
        /// </summary>
        /// <param name="fileMapping">JSON string containing the mapping.</param>
        /// <returns></returns>
        string CreateFileMapping(string fileMapping);

        /// <summary>
        /// Deletes a file mapping.
        /// </summary>
        /// <param name="id">Id of the  mapping to be deleted.</param>
        /// <returns></returns>
        string DeleteFileMapping(int id);

        /// <summary>
        /// Returns one or all available file mappings.
        /// </summary>
        /// <param name="id">File Mapping id. Not specified for getting all file mappings.</param>
        /// <returns></returns>
        string GetFileMapping(int? id);

        /// <summary>
        /// Gets header of a csv file.
        /// </summary>
        /// <param name="separator">Separator of the csv file.</param>
        /// <param name="delimiter">Delimiter of the csv file.</param>
        /// <param name="hasHeader">True if the file has a header, false otherwise.</param>
        /// <param name="filePath">Path of the file from whom to get the header.</param>
        /// <returns></returns>
        string GetCSVHeader(char separator, char? delimiter, bool hasHeader, string filePath);

        #endregion Mapping

        #region Loader

        /// <summary>
        /// Imports a CSV file in a cube's FactS and FiltS tables.
        /// </summary>
        /// <param name="separator">Separator of the csv file.</param>
        /// <param name="delimiter">Delimiter of the csv file.</param>
        /// <param name="hasHeader">True if the file has a header, false otherwise.</param>
        /// <param name="importType">Import type: Series, Data or SeriesAndData</param>
        /// <param name="cubeId">Id of the cube in whom to import the data.</param>
        /// <param name="mappingId">Id of the mapping associated to the file to be imported.</param>
        /// <param name="filePath">Path of the file to import.</param>
        /// <param name="tid">Tid for the cube.</param>
        /// <param name="idMappingSpecialTimePeriod">(Optional) Id of the mapping with time period in .STAT format.</param>
        /// <param name="embargo">Whether the data have to be embargoed or not.</param>
        /// <param name="ignoreCuncurrentUpload">Ignore cuncurrency upload protection</param>
        /// <param name="checkFiltAttributes">Whether to check the coherence of attributes on FiltS table or not</param>
        /// <returns></returns>
        string ImportCSVData(char separator, char? delimiter, bool hasHeader, string importType, int cubeId, int mappingId, string filePath, string tid, int idMappingSpecialTimePeriod, bool embargo, bool ignoreCuncurrentUpload, bool checkFiltAttributes, string guidSession);

        /// <summary>
        /// Imports a SDMX-ML file in a cube's FactS and FiltS tables.
        /// </summary>
        /// <param name="importType">Import type: Series, Data or SeriesAndData</param>
        /// <param name="cubeId">Id of the cube in whom to import the data.</param>
        /// <param name="dsdXml">Xml string of the dsd associated to the cube.</param>
        /// <param name="dsdAgencyId">Agency id of the dsd associated to the cube.</param>
        /// <param name="filePath">Path of the file to import.</param>
        /// <param name="tid">Tid</param>
        /// <param name="embargo">Whether the data have to be embargoed or not.</param>
        /// <param name="ignoreCuncurrentUpload">Ignore cuncurrency upload protection</param>
        /// <param name="checkFiltAttributes">Whether to check the coherence of attributes on FiltS table or not</param>
        /// <returns></returns>
        string ImportSDMXMLData(string importType, string cubeId, string dsdXml, string dsdAgencyId, string filePath, string tid, bool embargo, bool ignoreCuncurrentUpload, bool checkFiltAttributes);

        #endregion Loader

        #region DataflowBuilder

        /// <summary>
        /// Returns one or all available ddb dataflows.
        /// </summary>
        /// <param name="id">Dataflow id. Not specified for getting all dataflows.</param>
        /// <returns></returns>
        string GetDDBDataflow(int? id);

        /// <summary>
        /// Returns one or all available ddb dataflows without filter by CubeUser or Agency.
        /// </summary>
        /// <param name="id">Dataflow id. Not specified for getting all dataflows.</param>
        /// <returns></returns>
        string GetDDBDataflowNoFilter(int? id);

        /// <summary>
        /// Returns one or all ddb dataflows assigned to Cube without filter be CubeUser or Agency.
        /// </summary>
        /// <param name="cubeId">Cube id.</param>
        /// <returns></returns>
        string GetDDBDataflowsNoFilter(int cubeId);

        /// <summary>
        /// Creates a new ddb dataflow.
        /// </summary>
        /// <param name="df">JSON string containing the ddb dataflow.</param>
        /// <returns></returns>
        string CreateDDBDataflow(string df);

        /// <summary>
        /// Deletes a ddb dataflow.
        /// </summary>
        /// <param name="id">Id of the ddb dataflow to be deleted.</param>
        /// <returns></returns>
        string DeleteDDBDataflow(int id);

        #endregion DataflowBuilder

        #region Utils

        /// <summary>
        /// Uploads file on file system.
        /// </summary>
        /// <param name="cubeId">Id of the cube to whom the file refers.</param>
        /// <param name="file">File to be uploaded.</param>
        /// <returns></returns>
        string UploadFileOnServer(int? cubeId, IFormFile file);

        /// <summary>
        /// Gets a DataTable preview from a csv file.
        /// </summary>
        /// <param name="optionsTable">Contains Number of page for paging and Page size for paging.</param>
        /// <param name="separator">Separator of the csv file.</param>
        /// <param name="delimiter">Delimiter of the csv file.</param>
        /// <param name="hasHeader">True if the file has a header, false otherwise.</param>
        /// <param name="filePath">Path of the file from whom to get the preview.</param>
        /// <param name="tid">Tid for the file.</param>
        /// <param name="idMappingSpecialTimePeriod">(Optional) Id of the mapping with time period in .STAT format.</param>
        /// <returns></returns>
        string GetCSVTablePreview(OptionsTable optionsTable, char separator, char? delimiter, bool hasHeader, string filePath, string tid, int idMappingSpecialTimePeriod, string guidSession);

        /// <summary>
        /// Gets a DataTable preview from a sdmxml file.
        /// </summary>
        /// <param name="dsdXml">Xml string of the dsd associated to the cube.</param>
        /// <param name="agencyId">Agency id of the dsd associated to the cube.</param>
        /// <param name="optionsTable">Contains Number of page for paging and Page size for paging.</param>
        /// <param name="filePath">Path of the file from whom to get the preview.</param>
        /// <returns></returns>
        string GetSDMXMLTablePreview(string dsdXml, string agencyId, OptionsTable optionsTable, string filePath);

        /// <summary>
        /// Gets a DataColumn preview from a csv file.
        /// </summary>
        /// <param name="optionsTable">Name of the column to get in preview, Number of page for paging, Page size for paging</param>
        /// <param name="separator">Separator of the csv file.</param>
        /// <param name="delimiter">Delimiter of the csv file.</param>
        /// <param name="hasHeader">True if the file has a header, false otherwise.</param>
        /// <param name="filePath">Path of the file from whom to get the preview.</param>
        /// <param name="idMappingSpecialTimePeriod">(Optional) Id of the mapping with time period in .STAT format.</param>
        /// <returns></returns>
        string GetCSVTableColumnPreview(OptionsTable optionsTable, char separator, char? delimiter, bool hasHeader, string filePath, int idMappingSpecialTimePeriod, string guidSession);

        /// <summary>
        /// Gets a DataTable preview from a table in DDB.
        /// </summary>
        /// <param name="tableName">Name of the table to get in preview.</param>
        /// <param name="optionsTable">Contains Number of page for paging and Page size for paging.</param>
        /// <returns></returns>
        string GetTablePreview(string tableName, OptionsTable optionsTable);

        /// <summary>
        /// Gets a DataTable preview from a column of a table in DDB.
        /// </summary>
        /// <param name="tableName">Name of the table to get in preview.</param>
        /// <param name="optionsTable">Name of the column of the table to get in preview, Number of page for paging, Page size for paging.</param>
        /// <returns></returns>
        string GetTableColumnPreview(string tableName, OptionsTable optionsTable);

        /// <summary>
        /// Gets a DataTable preview from a column of a DDB Dataflow.
        /// </summary>
        /// <param name="df">JSON serialization of the dataflow.</param>
        /// <param name="colName">Name of the column of the table to get in preview.</param>
        /// <param name="pageNum">Number of page for paging.</param>
        /// <param name="pageSize">Page size for paging.</param>
        /// <param name="partialIgnoreCheckFilter">partialIgnoreCheckFilter</param>
        /// <returns></returns>
        string GetDataflowColumnPreview(string df, string colName, int pageNum, int pageSize, bool partialIgnoreCheckFilter);

        /// <summary>
        /// Gets a DataTable preview from a dataflow in DDB.
        /// </summary>
        /// <param name="ddbDataflow">Columns of the dataflow to be shown.</param>
        /// <param name="checkFilter">The id of the dataflow (-1 for get all cube)</param>
        /// <returns></returns>
        string GetDDBDataflowPreview(DDBDataflow ddbDataflow, bool checkFilter);

        /// <summary>
        /// Get a dataflow in CSV format according with the given parameters.
        /// </summary>
        /// <param name="ddbDataflow">The list of columns of the dataflow to be downloaded.</param>
        /// <param name="partialIgnoreCheckFilter">Whether to check filter coerence for dataflow columns with a unique value or not.</param>
        /// <returns>Return a filepath with csv file</returns>
        Task<string> DownloadDDBDataflowCsvAsync(DDBDataflow ddbDataflow, bool partialIgnoreCheckFilter, char separator, char? delimiter);


        /// <summary>
        /// Checks if the XML Config and AuthDB Connection string have the identical value, if MA Sid have the same Sid and same connection string of MSDB on AuthDB
        /// </summary>
        /// <returns>Returns an object contain status config and a list of error mesage</returns>
        ResultInizializeCheckAuthDb CheckAuthDB(string msSid, string msSidConn);

        /// <summary>
        /// Calls DMApi for configure the connection string in AuthDb, if the AuthDb already configure and try to save a different connection string, return false
        /// </summary>
        /// <param name="msdbConn">Connection string for msdb (without password)</param>
        /// <param name="maSid">MAS Sid</param>
        /// <returns></returns>
        ResultInizializeCheckAuthDb InizializeAuthDb(string msdbConn, string maSid);

        /// <summary>
        /// Check is agency is assign to any user
        /// </summary>
        /// <param name="agencyCode">Agency code</param>
        /// <returns>boolean</returns>
        bool IsAgencyAssignToAnyUser(string agencyCode);

        #endregion Utils

        #region Utility

        /// <summary>
        /// Remove all Temp Table from DB
        /// </summary>
        /// <returns></returns>
        void RemoveTempTable(); 

        /// <summary>
        /// Get a DSD report and compare the structure 
        /// </summary>
        /// <param name="dsdReport">Report with structure of DSD to compare.</param>
        /// <returns>true if the strcuture is compatible</returns>
        string CompareDSD(DsdReport dsdReport);

        /// <summary>
        /// Upgrade all Attribute And Dimension of Cube used a DSD to Upgrade
        /// </summary>
        /// <param name="dsdReport">Dsd report</param>
        /// <returns></returns>
        string UpgradeCube(DsdReport dsdReport);
        
        string GetDataFlowsFromDSD(ArtefactIdentity artefactIdentity);

        string GetFieldForCube(int idCube);

        string GetSeriesForCube(int idCube, DDBDataflow ddbDataflow);

        void DeleteSeriesForCube(int idCube, List<int> sId);

        string PreviewImportedFileCsvItem(OptionsTable optionsTable, ImportedItemCsvDTO importedItemCsvDTO, string filePath, string guidSession, bool remoteUpload, IHttpContextAccessor _contextAccessor);

        /// <summary>
        /// Call DM API for get list of cube and check the WS is running correctly
        /// </summary>
        /// <returns>true if WS running</returns>
        bool CheckEndPoint();

        #endregion

        #region User

        // <summary>
        /// Login user on NodeApi
        /// </summary>
        /// <param name="username">/param>
        /// <param name="password">/param>
        /// <returns>Return the info of logged user</returns>
        User LoginUser(string username, string password);

        /// <summary>
        /// Create user on AuthDB
        /// </summary>
        /// <param name="user"></param>
        /// <returns></returns>
        string CreateUser(string user);

        /// <summary>
        /// Edit user on AuthDB
        /// </summary>
        /// <param name="user"></param>
        /// <returns></returns>
        string UpdateUser(string user);

        /// <summary>
        /// Delete user on AuthDB
        /// </summary>
        /// <param name="user"></param>
        /// <returns></returns>
        string DeleteUser(string user);

        /// <summary>
        /// Get all categoty of user
        /// </summary>
        /// <param name="username">/param>
        /// <returns></returns>
        List<string> GetUserCategory(string username);

        /// <summary>
        /// Get all cube of user
        /// </summary>
        /// <param name="username">/param>
        /// <returns></returns>
        Dictionary<string, bool> GetUserCube(string username);

        /// <summary>
        /// Get all functionality of user
        /// </summary>
        /// <param name="username">/param>
        /// <returns></returns>
        List<string> GetUserFunctionality(string username);

        /// <summary>
        /// Get all agency of user
        /// </summary>
        /// <param name="username">/param>
        /// <returns></returns>
        List<string> GetUserAgency(string username);

        /// <summary>
        /// Get all dataflow of user
        /// </summary>
        /// <param name="username">/param>
        /// <returns></returns>
        Dictionary<string, bool> GetUserDataflow(string username);

        /// <summary>
        /// Get all metadataset of user
        /// </summary>
        /// <param name="username">/param>
        /// <returns></returns>
        Dictionary<string, bool> GetUserMetadataset(string username);

        /// <summary>
        /// Get all agency on AuthDb
        /// </summary>
        /// <returns></returns>
        List<string> GetAllAgency();

        /// <summary>
        /// Get all dataflow on AuthDb
        /// </summary>
        /// <returns></returns>
        List<string> GetAllDataflow();

        /// <summary>
        /// Get all metadataflow on AuthDb
        /// </summary>
        /// <returns></returns>
        List<string> GetAllMetadataFlow();


        /// <summary>
        /// Get all rule on AuthDb
        /// </summary>
        /// <returns></returns>
        List<string> GetAllRules();

        /// <summary>
        /// Get all agency hierarchy
        /// </summary>
        /// <param name="user">/param>
        /// <returns></returns>
        string GetCategoryHierarchy();

        /// <summary>
        /// Get all cube hierarchy
        /// </summary>
        /// <param name="user"></param>
        /// <returns></returns>
        string GetCubeHierarchy();

        /// <summary>
        /// Return the MaSid configurated on AuthDb
        /// </summary>
        /// <returns></returns>
        string GetMaSid();

        /// <summary>
        /// Return the list of codelist to be sync for each dsd
        /// </summary>
        /// <returns>List of DSD with all CodeList and Items to be sync</returns>
        Dictionary<string, List<string>> GetItemsCodelistFromDsd(List<string> dsdCheck);

        /// <summary>
        /// Return the list of codelist to be sync for each dsd
        /// </summary>
        /// <returns>List of DSD with all CodeList and Items to be sync</returns>
        Dictionary<string, List<string>> GetItemsFromCodeList(List<ArtefactIdentity> codeListCheck);

        /// <summary>
        /// Sync codelist from MSDB to DDB. Insert all Items from MSDB to DDB (only insert operation, not remove the code not present in MSDB)
        /// </summary>
        /// <param name="checkCodeListResult">Codelist to sync</param>
        /// <returns></returns>
        void SyncCodeList(Dictionary<string, List<string>> itemsCodeListToSync);

        /// <summary>
        /// Assigns all data to specific user on AuthDB
        /// </summary>
        /// <param name="userData"></param>
        /// <returns></returns>
        string AssignsAll(UserDataDTO userData);

        /// <summary>
        /// Send mail from AuthDB with a new password for user
        /// </summary>
        /// <param name="userData">Must be conatins username, email and language</param>
        /// <returns></returns>
        bool RecoveryPassword(IUserData userData);

        /// <summary>
        /// Change user password
        /// </summary>
        /// <param name="username">username</param>
        /// <param name="password">password</param>
        /// <returns></returns>
        bool ChangePassword(string username, string password);

        /// <summary>
        /// Change user password for current user logged
        /// </summary>
        /// <param name="username">username</param>
        /// <param name="password">password</param>
        /// <returns></returns>
        bool ChangeMyPassword(string username, string password);


        /// <summary>
        /// Get all data from specific user on AuthDB
        /// </summary>
        /// <param name="username">username</param>
        /// <returns></returns>
        UserDataDTO GetData(string username);

        /// <summary>
        /// Get all users on AuthDB
        /// </summary>
        /// <returns></returns>
        List<UsersDTO> GetUsers();

        /// <summary>
        /// Get all dsd with dataflow associated
        /// </summary>
        /// <returns></returns>
        List<DsdWithDataflow> GetDSDWithDataflow();

        /// <summary>
        /// Assign cube ownership on AuthDB
        /// </summary>
        /// <returns></returns>
        bool AssignCubeOwnership(string cubeCode, string username);

        /// <summary>
        /// Assign Dataflow ownership on AuthDB only if there is not already an owner
        /// </summary>
        /// <returns></returns>
        bool AssignDataflowFirstOwnership(string dataflow, string username);

        /// <summary>
        /// Assign Dataflow ownership on AuthDB
        /// </summary>
        /// <returns></returns>
        bool AssignDataflowOwnership(string dataflow, string username);

        /// <summary>
        /// Assign MetadataFlow ownership on AuthDB only if there is not already an owner
        /// </summary>
        /// <returns></returns>
        bool AssignMetadataFlowFirstOwnership(string metadataFlow, string username);

        /// <summary>
        /// Assign MetadataFlow ownership on AuthDB
        /// </summary>
        /// <returns></returns>
        bool AssignMetadataFlowOwnership(string metadataFlow, string username);

        /// <summary>
        /// Get list of owners for specific entity id
        /// </summary>
        /// <returns></returns>
        EntityOwners GetOwners(string entity, string id);

        #endregion

    }
}
