using AuthCore.Model;
using System.Collections.Generic;
using System.Data.Common;

namespace AuthCore.Interface
{
    public interface IDBConnector
    {
        /// <summary>
        /// Take the username from userData and popolate object with user data (set null if username not exist)
        /// </summary>
        /// <param name="userData">userData with Username set</param>
        /// <returns>Return false if username not exist</returns>
        bool GetUserAccount(IUserData userData);

        /// <summary>
        /// Get a user data for current user
        /// </summary>
        /// <param name="userData"></param>
        /// <returns>Return false if username not exist</returns>
        bool GetUserData(IUserData userData);

        /// <summary>
        /// Get all owners of specific entity id on AuthDB
        /// </summary>
        /// <param name="entity">Type of entity</param>
        /// <param name="id">Id of entity</param>
        /// <returns></returns>
        Dictionary<string, string> GetOwners(string entity, string id);

        /// <summary>
        /// Set all owners on specific entity id on AuthDB
        /// </summary>
        /// <param name="entity">Type of entity</param>
        /// <param name="id">Id of entity</param>
        /// <param name="username">list of username to assign</param>
        void SetOwners(string entity, string id, List<string> username);

        /// <summary>
        /// Sync AuthDB (Agency, Category, Cube)
        /// </summary>
        /// <param name="listAgency">list of agency to sync on AuthDB</param>
        /// <returns></returns>
        void SynchronizeAuthDB(List<string> listAgency, List<string> listDataflow, List<string> allMetadataFlow);

        /// <summary>
        /// Sync AuthDB (Agency, Category, Cube)
        /// </summary>
        /// <param name="syncCubeAndCategory">true for sync Cube and Category on AuthDB</param>
        /// <param name="syncAgency">true for sync Agency on AuthDB</param>
        /// <param name="listAgency">list of agency to sync on AuthDB</param>
        /// <param name="syncDataflow">list of dataflow to sync on AuthDB</param>
        /// <param name="listDataflow">true for sync MetadataFlow on AuthDB</param>
        /// <param name="syncMetadataFlow">true for sync MetadataFlow on AuthDB</param>
        /// <param name="listMetadataFlow">true for sync MetadataFlow on AuthDB</param>
        /// <returns></returns>
        void SynchronizeAuthDB(bool syncCubeAndCategory, bool syncAgency, List<string> listAgency, bool syncDataflow, List<string> listDataflow, bool syncMetadataFlow, List<string> listMetadataFlow);

        /// <summary>
        /// Get connection string for MSDB
        /// </summary>
        /// <param name="user">/param>
        /// <returns></returns>
        long UserExists(string username);

        /// <summary>
        /// Create user on AuthDB
        /// </summary>
        /// <param name="user">/param>
        /// <returns></returns>
        void CreateUser(IUserData user);

        /// <summary>
        /// Edit only user data and password (if not empty) on AuthDB
        /// </summary>
        /// <param name="user">/param>
        /// <returns></returns>
        void UpdateUser(IUserData user);

        /// <summary>
        /// Delete user on AuthDB
        /// </summary>
        /// <param name="user">/param>
        /// <returns></returns>
        bool DeleteUser(IUserData user);
        
        /// <summary>
        /// Assigns agency at user on AuthDb
        /// </summary>
        /// <param name="user">/param>
        /// <returns></returns>
        List<string> AssignsAgency(List<string> agency, long userId);

        /// <summary>
        /// Add an agency to the list of user agencies on AuthDb
        /// </summary>
        /// <param name="user">/param>
        /// <returns></returns>
        void AddAgency(List<string> agency, long userId);

        /// <summary>
        /// Get agency assign at user
        /// </summary>
        /// <param name="user">/param>
        /// <returns></returns>
        List<string> GetAgency(string username);

        /// <summary>
        /// Get all agency in AuthDB
        /// </summary>
        /// <returns></returns>
        List<string> GetAllAgency();

        /// <summary>
        /// Get all dataflow in AuthDB
        /// </summary>
        /// <returns></returns>
        List<string> GetAllDataflow();

        /// <summary>
        /// Get all metadataflow in AuthDB
        /// </summary>
        /// <returns></returns>
        List<string> GetAllMetadataFlow();

        /// <summary>
        /// Add an rule to the list of user rules on AuthDb
        /// </summary>
        /// <param name="user">/param>
        /// <returns></returns>
        void AddRule(List<string> rule, long userId);

        /// <summary>
        /// Assigns rule at user on AuthDb
        /// </summary>
        /// <param name="user">/param>
        /// <returns></returns>
        List<string> AssignsRule(List<string> rule, long userId);

        /// <summary>
        /// Get rule assign at user
        /// </summary>
        /// <param name="">/param>
        /// <returns></returns>
        List<string> GetRule(string username);

        /// <summary>
        /// Get all rule in AuthDB
        /// </summary>
        /// <returns></returns>
        List<string> GetAllRules();

        /// <summary>
        /// Assigns category at user on AuthDb
        /// </summary>
        /// <param name="user">/param>
        /// <returns></returns>
        List<string> AssignsCategory(List<string> category, long userId);
        
        /// <summary>
        /// Add an category to the list of user agencies on AuthDb
        /// </summary>
        /// <param name="user">/param>
        /// <returns></returns>
        void AddCategory(List<string> category, long userId);

        /// <summary>
        /// Get category assign at user
        /// </summary>
        /// <param name="user">/param>
        /// <returns></returns>
        List<string> GetCategory(string username);

        /// <summary>
        /// Get all category hierarchy
        /// </summary>
        /// <returns></returns>
        List<CategoryHierarchy> GetCategoryHierarchy();

        /// <summary>
        /// Assigns cube at user on AuthDb
        /// </summary>
        /// <param name="userId">/param>
        /// <returns></returns>
        Dictionary<string, bool> AssignsCube(Dictionary<string, bool> cube, long userId);

        /// <summary>
        /// Add an cube to the list of user cubes on AuthDb
        /// </summary>
        /// <param name="user">/param>
        /// <returns></returns>
        void AddCube(List<string> cube, long userId, bool isOwner);

        /// <summary>
        /// Add an metadataflow to the list of user entity on AuthDb
        /// </summary>
        /// <param name="user">/param>
        /// <returns></returns>
        void AddMetadataFlow(List<string> metadataset, long userId, bool isOwner);

        /// <summary>
        /// Add an dataflow to the list of user entity on AuthDb
        /// </summary>
        /// <param name="user">/param>
        /// <returns></returns>
        void AddDataflow(List<string> dataflow, long userId, bool isOwner); 

        /// <summary>
        /// Get cube assign at user
        /// </summary>
        /// <param name="userId">/param>
        /// <returns></returns>
        Dictionary<string, bool> GetCube(string username, List<string> userCategory);

        /// <summary>
        /// Assigns dataflow at user on AuthDb
        /// </summary>
        /// <param name="user">/param>
        /// <returns></returns>
        Dictionary<string, bool> AssignsDataflow(Dictionary<string, bool> dataflow, long userId);

        /// <summary>
        /// Assigns metadataflow at user on AuthDb
        /// </summary>
        /// <param name="userId">/param>
        /// <returns></returns>
        Dictionary<string, bool> AssignsMetadataFlow(Dictionary<string, bool> metadataset, long userId);

        /// <summary>
        /// Get cube assign at user
        /// </summary>
        /// <param name="user">/param>
        /// <returns></returns>
        List<CubeHierarchy> GetCubeHierarchy();

        /// <summary>
        /// Get a code from a cube id
        /// </summary>
        /// <param name="cubeId">/param>
        /// <returns></returns>
        string GetCubeCodeFromId(long cubeId);
        
        /// <summary>
        /// Assigns functionality at user on AuthDb
        /// </summary>
        /// <param name="user">/param>
        /// <returns></returns>
        List<string> AssignsFunctionality(List<string> functionality, long userId);

        /// <summary>
        /// Add an functionality to the list of user agencies on AuthDb
        /// </summary>
        /// <param name="user">/param>
        /// <returns></returns>
        void AddFunctionality(List<string> functionality, long userId);

        /// <summary>
        /// Get functionality assign at user
        /// </summary>
        /// <param name="username">/param>
        /// <returns></returns>
        List<string> GetFunctionality(string username);

        /// <summary>
        /// Get all functionality hierarchy
        /// </summary>
        /// <returns></returns>
        List<FunctionalityHierarchy> GetFunctionalityHierarchy();

        /// <summary>
        /// Assigns all userData set in input
        /// </summary>
        /// <param name="userData">input data for assign</param>
        /// <returns>a IUserData with all new userData setted</returns>
        IUserData AssignsAll(IUserData userData, long userId);


        /// <summary>
        /// Change password at user on AuthDb
        /// </summary>
        /// <param name="newPassword">crypt password</param>
        /// <param name="salt">salt used to crypt</param>
        /// <param name="algorithm">algorithm used to crypt</param>
        /// <param name="userId">userId to change password</param>
        /// <returns></returns>
        bool ChangePassword(string newPassword, string salt, string algorithm, long userId);
        
        /// <summary>
        /// Check if AuthDb have the connection string inizializated (not check if they are correct)
        /// </summary>
        /// <returns></returns>
        bool IsAuthDBConfigurated();

        /// <summary>
        /// Configure AuthDb
        /// </summary>
        /// <param name=""></param>
        /// <returns></returns>
        void InizializeAuthDb(DbConnectionStringBuilder msdbConn, DbConnectionStringBuilder ddbConn, DbConnectionStringBuilder rmdbConn, string maSid);

        /// <summary>
        /// Create table for Extend AuthDB
        /// </summary>
        /// <param name=""></param>
        /// <returns></returns>
        void ExtendAuthDb();

        /// <summary>
        /// Get connection string for AuthDB saved in appsettings
        /// </summary>
        /// <param name=""></param>
        /// <returns></returns>
        string GetAuthDbConnectionString();

        /// <summary>
        /// Get connection string for MsDB saved in AuthDb (without password)
        /// </summary>
        /// <param name=""></param>
        /// <returns></returns>
        string GetMsDBConnectionString();

        /// <summary>
        /// Get connection string for DDB saved in AuthDb
        /// </summary>
        /// <param name=""></param>
        /// <returns></returns>
        string GetDDBConnectionString(bool allowNullString);

        /// <summary>
        /// Get connection string for RMDB saved in AuthDb 
        /// </summary>
        /// <param name=""></param>
        /// <returns></returns>
        string GetRMDBConnectionString(bool allowNullString);

        /// <summary>
        /// Get MaSid saved in AuthDb 
        /// </summary>
        /// <param name=""></param>
        /// <returns></returns>
        string GetMaSid();

        /// <summary>
        /// Get all users on AuthDb 
        /// </summary>
        /// <returns></returns>
        bool IsAgencyAssignToAnyUser(string agencyCode);

        /// <summary>
        /// Get all users on AuthDb 
        /// </summary>
        /// <returns></returns>
        List<UsersDTO> GetUsers(string filterByUser);

        /// <summary>
        /// Check if Auth DB is initialized
        /// </summary>
        /// <returns></returns>
        bool IsAuthDbInitialized(); 

        /// <summary>
        /// Check if Auth DB have the Ext table
        /// </summary>
        /// <returns></returns>
        bool IsAuthDbExtInitialized();

        /// <summary>
        /// Check if Auth DB have an owner for dataflow
        /// </summary>
        /// <returns></returns>
        bool HaveDataflowOwnership(string dataflow);

        /// <summary>
        /// Check if Auth DB have an owner for metadataflow
        /// </summary>
        /// <returns></returns>
        bool HaveMetadataFlowOwnership(string metadataflow);

        /// <summary>
        /// Remove ddb data permission
        /// </summary>
        /// <returns></returns>
        bool RemoveDDBDataPermission();
    }
}
