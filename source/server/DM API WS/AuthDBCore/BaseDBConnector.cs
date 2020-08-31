using AuthCore.Interface;
using AuthCore.Model;
using AuthCore.Utils;
using Infrastructure.STLogging.Interface;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Common;
using System.Data.SqlClient;
using System.IO;
using System.Linq;
using System.Security.Cryptography;
using System.Text;

namespace AuthCore
{
    public class BaseDBConnector : IDBConnector
    {
        readonly AuthAppOptions _config;
        readonly Provider _dbProvider;
        readonly ISTLogger _logger;

        public BaseDBConnector(AuthAppOptions config, ISTLogger logger)
        {
            Enum.TryParse(config.DbAuthenticationProvider, out _dbProvider);
            _config = config;
            _logger = logger;
        }

        public bool GetUserAccount(IUserData userData)
        {
            return getUserAccount(userData.Username, userData);
        }

        public bool GetUserData(IUserData userData)
        {
            getUserData(userData);

            return userData != null;
        }

        public string GetAuthDbConnectionString()
        {
            return _config.CONN_STR;
        }

        public string GetMsDBConnectionString()
        {
            using (var connection = GetConnection(_config.CONN_STR))
            {
                connection.Open();
                return getMsDBConnectionString(connection);
            }
        }

        public string GetDDBConnectionString(bool allowNullString)
        {
            using (var connection = GetConnection(_config.CONN_STR))
            {
                connection.Open();
                return getDDBConnectionString(connection, allowNullString);
            }
        }

        public string GetRMDBConnectionString(bool allowNullString)
        {
            using (var connection = GetConnection(_config.CONN_STR))
            {
                connection.Open();
                return getRMDBConnectionString(connection, allowNullString);
            }
        }

        public string GetMaSid()
        {
            using (var connection = GetConnection(_config.CONN_STR))
            {
                connection.Open();
                return getMA_SID(connection);
            }
        }

        public void SynchronizeAuthDB(List<string> listAgency, List<string> listDataflow, List<string> allMetadataFlow)
        {
            SynchronizeAuthDB(true, true, listAgency, true, listDataflow, true, allMetadataFlow);
        }

        public void SynchronizeAuthDB(bool syncCubeAndCategory, bool syncAgency, List<string> listAgency, bool syncDataflow, List<string> listDataflow, bool syncMetadataFlow, List<string> listMetadataFlow)
        {
            _logger.Log($"BaseDBConnector SynchronizeAuthDB start syncCubeAndCategory {syncCubeAndCategory} \t agency {syncAgency} \t syncDataflow {syncDataflow} \t syncMetadataFlow {syncMetadataFlow}", LogLevelEnum.Info);
            if (listAgency == null)
            {
                listAgency = new List<string>();
            }
            if (_logger.IsDebugEnabled)
            {
                foreach (var item in listAgency)
                {
                    _logger.Log($"listAgency item: {item}", LogLevelEnum.Debug);
                }
            }

            var strConnDdb = "";
            using (var connection = GetConnection(_config.CONN_STR))
            {
                connection.Open();
                try
                {
                    strConnDdb = getDDBConnectionString(connection, false);
                }
                catch (Exception)
                {

                }
            }

            //Take all Category & Cube
            var listCube = new Dictionary<string, string>();
            var listCategory = new Dictionary<string, List<string>>();
            const string rootElementCatCode = "#ROOTELEMENTCATCODE#";
            if (syncCubeAndCategory && !string.IsNullOrWhiteSpace(strConnDdb))
            {
                using (var connection = GetConnection(strConnDdb))
                {
                    connection.Open();

                    //Take all Category
                    _logger.Log($"BaseDBConnector SynchronizeAuthDB start take Category", LogLevelEnum.Info);
                    var sqlCategory = GetQuery("ALL_CATEGORY");

                    var command = GetCommand(sqlCategory, connection);
                    using (var reader = command.ExecuteReader())
                    {
                        while (reader.Read())
                        {
                            var parent = reader.GetString(0);
                            if (!listCategory.ContainsKey(parent))
                            {
                                listCategory.Add(parent, new List<string>());
                            }
                            listCategory[parent].Add(reader.GetString(1));
                        }
                    }
                    _logger.Log($"BaseDBConnector SynchronizeAuthDB end take Category", LogLevelEnum.Info);

                    //Take all Cube
                    _logger.Log($"BaseDBConnector SynchronizeAuthDB start take Cube", LogLevelEnum.Info);
                    var sqlCube = GetQuery("ALL_CUBE");

                    command = GetCommand(sqlCube, connection);
                    using (var reader = command.ExecuteReader())
                    {
                        while (reader.Read())
                        {
                            var cube = reader.GetString(0);
                            if (!listCube.ContainsKey(cube))
                            {
                                listCube.Add(cube, !reader.IsDBNull(1) ? reader.GetString(1) : "");
                            }
                            else
                            { //This case is not possibile (unless wrong data in DB)
                                listCube[cube] = reader.GetString(1);
                            }
                        }
                    }
                    if (_logger.IsDebugEnabled)
                    {
                        foreach (var item in listCube)
                        {
                            _logger.Log($"listCube item Key: {item.Key} Value: {item.Value}", LogLevelEnum.Debug);
                        }
                    }
                    _logger.Log($"BaseDBConnector SynchronizeAuthDB end take Cube", LogLevelEnum.Info);
                }
            }

            //Sync
            var CategoryCode2Id = new Dictionary<string, int>();
            using (var connection = GetConnection(_config.CONN_STR))
            {
                connection.Open();

                var transaction = connection.BeginTransaction();

                if (syncAgency)
                {
                    //
                    //Start Sync Agency
                    //
                    _logger.Log($"BaseDBConnector SynchronizeAuthDB start sync Agency", LogLevelEnum.Info);

                    var countAgency = 0;
                    var sqlAgencyCount = GetQuery("GET_AGENCY_COUNT");
                    var command = GetCommand(sqlAgencyCount, connection);
                    command.Transaction = transaction;
                    var result = command.ExecuteScalar();
                    if (result != null && result != DBNull.Value)
                    {
                        countAgency = (int)result;
                    }

                    var strInsertTmpTable = new StringBuilder();
                    var sqlParams = new List<DbParameter>();
                    var tmpTableName = "agencyTable";
                    var column = new List<Column> { new Column { Name = "ID_MSDB", DbType = GenericDbType.VarChar, Size = 150 } };
                    var i = 0;
                    foreach (var item in listAgency)
                    {
                        strInsertTmpTable.Append(PopolateVariableTable(tmpTableName, column, i));
                        sqlParams.Add(GetParameter($"ID_MSDB{i}", GenericDbType.VarChar, 150, item));
                        i++;
                    }

                    var sqlCreateTmpTable = GetVariableTable(tmpTableName, column);
                    var sqlMerge = GetQuery("MERGE_AGENCY").Replace("@@REPLACE_CREATE_TMPTABLE@@", sqlCreateTmpTable).Replace("@@REPLACE_INSERT_TMPTABLE@@", strInsertTmpTable.ToString());

                    command = GetCommand(sqlMerge, connection);
                    command.Transaction = transaction;
                    foreach (var item in sqlParams)
                    {
                        command.Parameters.Add(item);
                    }
                    command.ExecuteNonQuery();

                    if (countAgency == 0)
                    { //First Sync Agency, set permission for admin 
                        var sqlSetAgencyAdmin = GetQuery("SET_AGENCY_ADMIN");
                        command = GetCommand(sqlSetAgencyAdmin, connection);
                        command.Parameters.Add(GetParameter($"userAdmin", GenericDbType.VarChar, 255, "Admin"));
                        command.Transaction = transaction;
                        command.ExecuteNonQuery();
                    }

                    _logger.Log($"BaseDBConnector SynchronizeAuthDB end sync Agency", LogLevelEnum.Info);
                    //
                    //End Sync Agency
                    //
                }

                if (syncCubeAndCategory && !string.IsNullOrWhiteSpace(strConnDdb))
                {
                    //
                    //Start Sync Category
                    //
                    _logger.Log($"BaseDBConnector SynchronizeAuthDB start sync Category", LogLevelEnum.Info);
                    var sqlInsertOrUpdateCategory = GetQuery("CATEGORY_INSERT_UPDATE");

                    //Used for Delete
                    var strInsertTmpTable = new StringBuilder();
                    var sqlCategoryDeleteParams = new List<DbParameter>();
                    var tmpTableName = "categoryTable";
                    var column = new List<Column> { new Column { Name = "ID_MSDB", DbType = GenericDbType.VarChar, Size = 150 } };
                    var sqlCreateTmpTable = GetVariableTable(tmpTableName, column);
                    //Used for Delete

                    _logger.Log($"BaseDBConnector SynchronizeAuthDB sync Category generate ", LogLevelEnum.Debug);
                    var i = 0;
                    foreach (var itemParent in listCategory)
                    {
                        foreach (var itemCat in itemParent.Value)
                        {
                            var catCode = GetParameter("ID_MSDB", GenericDbType.VarChar, 150, itemCat);
                            var parentId = GetParameter("PARENT_CAT_ID", GenericDbType.Int, 4, DBNull.Value);
                            if (!itemParent.Key.Equals(rootElementCatCode))
                            {
                                parentId.Value = CategoryCode2Id[itemParent.Key];
                            }
                            var commandInsUpd = GetCommand(sqlInsertOrUpdateCategory, connection);
                            commandInsUpd.Transaction = transaction;
                            commandInsUpd.Parameters.Add(catCode);
                            commandInsUpd.Parameters.Add(parentId);
                            var id = (int)commandInsUpd.ExecuteScalar();
                            CategoryCode2Id.Add(itemCat, id);


                            //Used for Delete
                            strInsertTmpTable.Append(PopolateVariableTable(tmpTableName, column, i));
                            sqlCategoryDeleteParams.Add(GetParameter($"ID_MSDB{i}", GenericDbType.VarChar, 150, itemCat));
                            i++;
                        }
                    }

                    //Delete old category
                    _logger.Log($"BaseDBConnector SynchronizeAuthDB sync Category delete old category ", LogLevelEnum.Debug);
                    var sqlDelete = GetQuery("CATEGORY_DELETE_OLD").Replace("@@REPLACE_CREATE_TMPTABLE@@", sqlCreateTmpTable).Replace("@@REPLACE_INSERT_TMPTABLE@@", strInsertTmpTable.ToString());
                    var command = GetCommand(sqlDelete, connection);
                    command.Transaction = transaction;
                    foreach (var item in sqlCategoryDeleteParams)
                    {
                        command.Parameters.Add(item);
                    }
                    command.ExecuteNonQuery();
                    _logger.Log($"BaseDBConnector SynchronizeAuthDB end sync Category", LogLevelEnum.Info);
                    //
                    //End Sync Category
                    //

                    //
                    //Start Sync Cube
                    //
                    _logger.Log($"BaseDBConnector SynchronizeAuthDB start sync Cube", LogLevelEnum.Info);
                    var sqlInsertOrUpdateCube = GetQuery("CUBE_INSERT_UPDATE");
                    //Used for Delete
                    strInsertTmpTable = new StringBuilder();
                    var sqlCubeDeleteParams = new List<DbParameter>();
                    tmpTableName = "cubeTable";
                    column = new List<Column> { new Column { Name = "Code", DbType = GenericDbType.VarChar, Size = 50 } };
                    sqlCreateTmpTable = GetVariableTable(tmpTableName, column);
                    //Used for Delete

                    i = 0;
                    foreach (var itemCube in listCube)
                    {
                        var catCode = GetParameter("CODE", GenericDbType.VarChar, 50, itemCube.Key);
                        var categoryId = GetParameter("CAT_ID", GenericDbType.Int, 4, DBNull.Value);
                        if (!string.IsNullOrEmpty(itemCube.Value))
                        {
                            categoryId.Value = CategoryCode2Id[itemCube.Value];
                        }
                        var commandInsUpd = GetCommand(sqlInsertOrUpdateCube, connection);
                        commandInsUpd.Transaction = transaction;
                        commandInsUpd.Parameters.Add(catCode);
                        commandInsUpd.Parameters.Add(categoryId);
                        commandInsUpd.ExecuteNonQuery();


                        //Used for Delete
                        strInsertTmpTable.Append(PopolateVariableTable(tmpTableName, column, i));
                        sqlCubeDeleteParams.Add(GetParameter($"Code{i}", GenericDbType.VarChar, 50, itemCube.Key));
                        i++;
                    }

                    //Delete old cube
                    _logger.Log($"BaseDBConnector SynchronizeAuthDB sync Cube delete old cube", LogLevelEnum.Debug);
                    var sqlDeleteNotIn = GetQuery("CUBE_DELETE_OLD").Replace("@@REPLACE_CREATE_TMPTABLE@@", sqlCreateTmpTable).Replace("@@REPLACE_INSERT_TMPTABLE@@", strInsertTmpTable.ToString());
                    command = GetCommand(sqlDeleteNotIn, connection);
                    command.Transaction = transaction;
                    foreach (var item in sqlCubeDeleteParams)
                    {
                        command.Parameters.Add(item);
                    }
                    command.ExecuteNonQuery();
                    _logger.Log($"BaseDBConnector SynchronizeAuthDB end sync Cube", LogLevelEnum.Info);
                    //
                    //End Sync Cube
                    //
                }

                if (syncDataflow && listDataflow != null)
                {
                    //
                    //Start Sync Dataflow
                    //
                    _logger.Log($"BaseDBConnector SynchronizeAuthDB start sync Dataflow", LogLevelEnum.Info);
                    var strInsertTmpTable = new StringBuilder();
                    var sqlParams = new List<DbParameter>();
                    var tmpTableName = "entityTable";
                    var column = new List<Column> { new Column { Name = "Identifier", DbType = GenericDbType.VarChar, Size = 150 } };
                    var i = 0;
                    foreach (var item in listDataflow)
                    {
                        strInsertTmpTable.Append(PopolateVariableTable(tmpTableName, column, i));
                        sqlParams.Add(GetParameter($"Identifier{i}", GenericDbType.VarChar, 150, item));
                        i++;
                    }

                    var sqlCreateTmpTable = GetVariableTable(tmpTableName, column);
                    var sqlMerge = GetQuery("MERGE_DATAFLOW").Replace("@@REPLACE_CREATE_TMPTABLE@@", sqlCreateTmpTable).Replace("@@REPLACE_INSERT_TMPTABLE@@", strInsertTmpTable.ToString());

                    var command = GetCommand(sqlMerge, connection);
                    command.Transaction = transaction;
                    foreach (var item in sqlParams)
                    {
                        command.Parameters.Add(item);
                    }
                    command.ExecuteNonQuery();
                    _logger.Log($"BaseDBConnector SynchronizeAuthDB end sync Dataflow", LogLevelEnum.Info);
                    //
                    //End Sync Dataflow
                    //
                }

                if (syncMetadataFlow && listMetadataFlow != null)
                {
                    //
                    //Start Sync MetadataFlow
                    //
                    _logger.Log($"BaseDBConnector SynchronizeAuthDB start sync MetadataFlow", LogLevelEnum.Info);
                    var strInsertTmpTable = new StringBuilder();
                    var sqlParams = new List<DbParameter>();
                    var tmpTableName = "entityTable";
                    var column = new List<Column> { new Column { Name = "Identifier", DbType = GenericDbType.VarChar, Size = 150 } };
                    var i = 0;
                    foreach (var item in listMetadataFlow)
                    {
                        strInsertTmpTable.Append(PopolateVariableTable(tmpTableName, column, i));
                        sqlParams.Add(GetParameter($"Identifier{i}", GenericDbType.VarChar, 150, item));
                        i++;
                    }

                    var sqlCreateTmpTable = GetVariableTable(tmpTableName, column);
                    var sqlMerge = GetQuery("MERGE_METADATAFLOW").Replace("@@REPLACE_CREATE_TMPTABLE@@", sqlCreateTmpTable).Replace("@@REPLACE_INSERT_TMPTABLE@@", strInsertTmpTable.ToString());

                    var command = GetCommand(sqlMerge, connection);
                    command.Transaction = transaction;
                    foreach (var item in sqlParams)
                    {
                        command.Parameters.Add(item);
                    }
                    command.ExecuteNonQuery();
                    _logger.Log($"BaseDBConnector SynchronizeAuthDB end sync MetadataFlow", LogLevelEnum.Info);
                    //
                    //End Sync Dataflow
                    //
                }

                transaction.Commit();

                _logger.Log($"BaseDBConnector SynchronizeAuthDB end", LogLevelEnum.Info);
            }
        }

        public long UserExists(string username)
        {
            _logger.Log($"BaseDBConnector UserExists start", LogLevelEnum.Info);
            if (string.IsNullOrWhiteSpace(username))
            {
                return 0;
            }
            using (var connection = GetConnection(_config.CONN_STR))
            {
                connection.Open();

                var sqlRules = GetQuery("GET_USERID");
                var sqlPar = GetParameter("Username", GenericDbType.VarChar, 255, username);

                var command = GetCommand(sqlRules, connection);
                command.Parameters.Add(sqlPar);

                _logger.Log($"BaseDBConnector UserExists end", LogLevelEnum.Info);
                var result = command.ExecuteScalar();
                if (result == null)
                {
                    return -1;
                }
                return (long)result;
            }
        }

        public void CreateUser(IUserData user)
        {
            _logger.Log($"BaseDBConnector CreateUser start", LogLevelEnum.Info);

            var userId = UserExists(user.Username);
            if (userId > 0)
            {
                throw GenericUtils.GetCustomException("USER_ALREADY_PRESENT",
                    @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - User already present in database", GenericUtils.LogLevelEnum.Error);
            }

            using (var connection = GetConnection(_config.CONN_STR))
            {
                connection.Open();

                var transaction = connection.BeginTransaction();

                var sqlUser = GetQuery("INSERT_USER");

                var command = GetCommand(sqlUser, connection);
                command.Transaction = transaction;
                command.Parameters.Add(GetParameter("USERNAME", GenericDbType.VarChar, 255, user.Username));
                user.Salt = saltGenerator();
                command.Parameters.Add(GetParameter("SALT", GenericDbType.VarChar, 255, user.Salt));
                user.Algorithm = _config.AlgorithmDefault;
                command.Parameters.Add(GetParameter("ALGORITHM", GenericDbType.VarChar, 255, user.Algorithm));
                command.Parameters.Add(GetParameter("DEFAULT_STORE_ID", GenericDbType.VarChar, 255, user.DefaultStoreID));
                user.Password = EncryptUtils.EncrypPassword(user.Password, user.Salt, user.Algorithm);
                command.Parameters.Add(GetParameter("PASSWORD", GenericDbType.VarChar, 255, user.Password));
                user.Id = (long)command.ExecuteScalar();

                assignsExtraData(user, connection, transaction);

                user.Agencies = assignsAgency(connection, user.Agencies, user.Id, transaction);
                user.Category = assignsCategory(connection, user.Category, user.Id, transaction);

                var cubes = new Dictionary<string, bool>();
                foreach (var iCube in user.CubeOwner)
                {
                    if (!cubes.ContainsKey(iCube))
                    {
                        cubes.Add(iCube, true);
                    }
                }
                foreach (var iCube in user.Cube)
                {
                    if (!cubes.ContainsKey(iCube))
                    {
                        cubes.Add(iCube, false);
                    }
                }
                var resultCube = assignsCube(connection, cubes, user.Id, transaction);
                user.Cube = new List<string>();
                user.CubeOwner = new List<string>();
                foreach (var item in resultCube)
                {
                    if (item.Value)
                    {
                        user.CubeOwner.Add(item.Key);
                    }
                    else
                    {
                        user.Cube.Add(item.Key);
                    }
                }


                var findBasicFunc = false;
                if (user.Functionality != null)
                {
                    foreach (var func in user.Functionality)
                    {
                        if (func.Equals("Basic", StringComparison.InvariantCultureIgnoreCase))
                        {
                            findBasicFunc = true;
                        }
                    }
                }
                if (!findBasicFunc)
                {
                    user.Functionality.Add("Basic");
                }
                user.Functionality = assignsFunctionality(connection, user.Functionality, user.Id, transaction);

                transaction.Commit();

                _logger.Log($"BaseDBConnector CreateUser end", LogLevelEnum.Info);
                return;
            }
        }

        public void UpdateUser(IUserData user)
        {
            _logger.Log($"BaseDBConnector UpdateUser start", LogLevelEnum.Info);

            user.Id = UserExists(user.Username);
            if (user.Id <= 0)
            {
                throw GenericUtils.GetCustomException("USER_NOT_PRESENT",
                    @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - User not present in database", GenericUtils.LogLevelEnum.Error);
            }

            using (var connection = GetConnection(_config.CONN_STR))
            {
                connection.Open();

                var transaction = connection.BeginTransaction();

                assignsExtraData(user, connection, transaction);

                if (user.Password != null)
                {
                    changePassword(connection, transaction, user.Password, user.Salt, user.Algorithm, user.Id);
                }

                transaction.Commit();

                _logger.Log($"BaseDBConnector UpdateUser end", LogLevelEnum.Info);
                return;
            }
        }

        public bool DeleteUser(IUserData user)
        {
            _logger.Log($"BaseDBConnector DeleteUser start", LogLevelEnum.Info);

            user.Id = UserExists(user.Username);
            if (user.Id <= 0)
            {
                throw GenericUtils.GetCustomException("USER_NOT_PRESENT",
                    @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - User not present in database", GenericUtils.LogLevelEnum.Error);
            }

            using (var connection = GetConnection(_config.CONN_STR))
            {
                connection.Open();
                var transaction = connection.BeginTransaction();

                var sqlRemove = GetQuery("DELETE_USER");
                var command = GetCommand(sqlRemove, connection);
                command.Transaction = transaction;
                command.Parameters.Add(GetParameter("UserId", GenericDbType.BigInt, 8, user.Id));
                var result = (int)command.ExecuteScalar() > 0;

                transaction.Commit();

                _logger.Log($"BaseDBConnector DeleteUser end", LogLevelEnum.Info);
                return result;
            }
        }

        public List<string> AssignsAgency(List<string> agency, long userId)
        {
            using (var connection = GetConnection(_config.CONN_STR))
            {
                connection.Open();

                return assignsAgency(connection, agency, userId, null);
            }
        }

        public List<string> AssignsCategory(List<string> category, long userId)
        {
            using (var connection = GetConnection(_config.CONN_STR))
            {
                connection.Open();

                return assignsCategory(connection, category, userId, null);
            }
        }

        public Dictionary<string, bool> AssignsCube(Dictionary<string, bool> cube, long userId)
        {
            using (var connection = GetConnection(_config.CONN_STR))
            {
                connection.Open();

                return assignsCube(connection, cube, userId, null);
            }
        }

        public List<string> AssignsRule(List<string> rule, long userId)
        {
            using (var connection = GetConnection(_config.CONN_STR))
            {
                connection.Open();

                return assignsRule(connection, rule, userId, null);
            }
        }

        public List<string> AssignsFunctionality(List<string> functionality, long userId)
        {
            using (var connection = GetConnection(_config.CONN_STR))
            {
                connection.Open();

                return assignsFunctionality(connection, functionality, userId, null);
            }
        }

        public Dictionary<string, bool> AssignsDataflow(Dictionary<string, bool> dataflow, long userId)
        {
            using (var connection = GetConnection(_config.CONN_STR))
            {
                connection.Open();

                return assignsDataflow(connection, dataflow, userId, null);
            }
        }

        public Dictionary<string, bool> AssignsMetadataFlow(Dictionary<string, bool> metadataFlow, long userId)
        {
            using (var connection = GetConnection(_config.CONN_STR))
            {
                connection.Open();

                return assignsMetadataFlow(connection, metadataFlow, userId, null);
            }
        }

        public IUserData AssignsAll(IUserData userData, long userId)
        {
            using (var connection = GetConnection(_config.CONN_STR))
            {
                connection.Open();
                var transaction = connection.BeginTransaction();

                if (userData.Agencies != null)
                {
                    assignsAgency(connection, userData.Agencies, userId, transaction);
                }

                if (userData.Category != null)
                {
                    assignsCategory(connection, userData.Category, userId, transaction);
                }

                if (userData.Rules != null)
                {
                    assignsRule(connection, userData.Rules, userId, transaction);
                }

                if (userData.Cube != null || userData.CubeOwner != null)
                {
                    var allCubes = new Dictionary<string, bool>();
                    if (userData.CubeOwner != null)
                    {
                        foreach (var item in userData.CubeOwner)
                        {
                            if (!allCubes.ContainsKey(item))
                            {
                                allCubes.Add(item, true);
                            }
                        }
                    }
                    if (userData.Cube != null)
                    {
                        foreach (var item in userData.Cube)
                        {
                            if (!allCubes.ContainsKey(item))
                            {
                                allCubes.Add(item, false);
                            }
                        }
                    }
                    assignsCube(connection, allCubes, userId, transaction);
                }

                if (userData.Functionality != null)
                {
                    assignsFunctionality(connection, userData.Functionality, userId, transaction);
                }

                if (userData.Dataflow != null)
                {
                    var dataflow = new Dictionary<string, bool>();
                    foreach (var item in userData.Dataflow)
                    {
                        dataflow.Add(item, false);
                    }
                    foreach (var item in userData.DataflowOwner)
                    {
                        dataflow.Add(item, true);
                    }
                    assignsDataflow(connection, dataflow, userId, transaction);
                }


                if (userData.MetadataFlow != null)
                {
                    var metadataflow = new Dictionary<string, bool>();
                    foreach (var item in userData.MetadataFlow)
                    {
                        metadataflow.Add(item, false);
                    }
                    foreach (var item in userData.MetadataFlowOwner)
                    {
                        metadataflow.Add(item, true);
                    }
                    assignsMetadataFlow(connection, metadataflow, userId, transaction);
                }

                transaction.Commit();

                getUserData(userData);

                return userData;
            }
        }


        public void AddFunctionality(List<string> functionality, long userId)
        {
            using (var connection = GetConnection(_config.CONN_STR))
            {
                connection.Open();

                addFunctionality(connection, functionality, userId, null);
            }
        }

        public void AddCube(List<string> cube, long userId, bool isOwner)
        {
            using (var connection = GetConnection(_config.CONN_STR))
            {
                connection.Open();

                addCube(connection, cube, userId, isOwner, null);
            }
        }

        public bool HaveDataflowOwnership(string dataflow)
        {
            _logger.Log($"BaseDBConnector HaveDataflowOwnership start", LogLevelEnum.Info);

            var result = 0;
            using (var connection = GetConnection(_config.CONN_STR))
            {
                connection.Open();

                var sqlRules = GetQuery("HAVE_DATAFLOW_OWNERSHIP");
                var sqlPar = GetParameter("IDENTIFIER", GenericDbType.VarChar, 250, dataflow);

                var command = GetCommand(sqlRules, connection);
                command.Parameters.Add(sqlPar);
                result = (int)command.ExecuteScalar();
                _logger.Log($"BaseDBConnector HaveDataflowOwnership Count: {result}", LogLevelEnum.Debug);
            }
            _logger.Log($"BaseDBConnector HaveDataflowOwnership end", LogLevelEnum.Info);

            return result > 0;
        }

        public bool HaveMetadataFlowOwnership(string metadataflow)
        {
            _logger.Log($"BaseDBConnector HaveMetadataFlowOwnership start", LogLevelEnum.Info);

            var result = 0;
            using (var connection = GetConnection(_config.CONN_STR))
            {
                connection.Open();

                var sqlRules = GetQuery("HAVE_METADATAFLOW_OWNERSHIP");
                var sqlPar = GetParameter("IDENTIFIER", GenericDbType.VarChar, 250, metadataflow);

                var command = GetCommand(sqlRules, connection);
                command.Parameters.Add(sqlPar);
                result = (int)command.ExecuteScalar();
                _logger.Log($"BaseDBConnector HaveMetadataFlowOwnership Count: {result}", LogLevelEnum.Debug);
            }
            _logger.Log($"BaseDBConnector HaveMetadataFlowOwnership end", LogLevelEnum.Info);

            return result > 0;
        }

        public void AddMetadataFlow(List<string> metadataFlow, long userId, bool isOwner)
        {
            using (var connection = GetConnection(_config.CONN_STR))
            {
                connection.Open();

                addMetadataFlow(connection, metadataFlow, userId, isOwner, null);
            }
        }

        public void AddDataflow(List<string> dataflow, long userId, bool isOwner)
        {
            using (var connection = GetConnection(_config.CONN_STR))
            {
                connection.Open();

                addDataflow(connection, dataflow, userId, isOwner, null);
            }
        }

        public void AddCategory(List<string> category, long userId)
        {
            using (var connection = GetConnection(_config.CONN_STR))
            {
                connection.Open();

                addCategory(connection, category, userId, null);
            }
        }

        public void AddAgency(List<string> agency, long userId)
        {
            using (var connection = GetConnection(_config.CONN_STR))
            {
                connection.Open();

                addAgency(connection, agency, userId, null);
            }
        }

        public void AddRule(List<string> rule, long userId)
        {
            using (var connection = GetConnection(_config.CONN_STR))
            {
                connection.Open();

                addRule(connection, rule, userId, null);
            }
        }

        public bool ChangePassword(string newPassword, string salt, string algorithm, long userId)
        {
            _logger.Log($"BaseDBConnector ChangePassword start", LogLevelEnum.Info);

            using (var connection = GetConnection(_config.CONN_STR))
            {
                connection.Open();

                var result = changePassword(connection, null, newPassword, salt, !string.IsNullOrWhiteSpace(algorithm) ? algorithm : "MD5", userId);

                _logger.Log($"BaseDBConnector ChangePassword end", LogLevelEnum.Info);
                return result;
            }
        }

        public string GetCubeCodeFromId(long cubeId)
        {
            _logger.Log($"BaseDBConnector GetCubeCodeFromId start", LogLevelEnum.Info);
            var strConnDdb = "";
            using (var connection = GetConnection(_config.CONN_STR))
            {
                connection.Open();
                strConnDdb = getDDBConnectionString(connection, false);
            }

            using (var connection = GetConnection(strConnDdb))
            {
                connection.Open();

                var sqlRules = GetQuery("CODE_FROM_CATCUBE");
                var sqlPar = GetParameter("IDCube", GenericDbType.Int, 4, cubeId);

                var command = GetCommand(sqlRules, connection);
                command.Parameters.Add(sqlPar);
                using (var reader = command.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        _logger.Log($"BaseDBConnector GetCubeCodeFromId end with result " + reader.GetString(0), LogLevelEnum.Info);
                        return reader.GetString(0);
                    }
                }
            }
            _logger.Log($"BaseDBConnector GetCubeCodeFromId end with null", LogLevelEnum.Info);
            return null;
        }

        public List<CategoryHierarchy> GetCategoryHierarchy()
        {
            using (var connection = GetConnection(_config.CONN_STR))
            {
                connection.Open();
                return getCategoryHierarchy(connection);
            }
        }

        public List<CubeHierarchy> GetCubeHierarchy()
        {
            using (var connection = GetConnection(_config.CONN_STR))
            {
                connection.Open();
                return getCubeHierarchy(connection);
            }
        }

        public List<FunctionalityHierarchy> GetFunctionalityHierarchy()
        {
            using (var connection = GetConnection(_config.CONN_STR))
            {
                connection.Open();
                return getFunctionalityHierarchy(connection);
            }
        }


        public List<string> GetAgency(string username)
        {
            using (var connection = GetConnection(_config.CONN_STR))
            {
                connection.Open();
                return getAgencyByUser(connection, username);
            }
        }

        public List<string> GetFunctionality(string username)
        {
            using (var connection = GetConnection(_config.CONN_STR))
            {
                connection.Open();
                return getFunctionalityByUser(connection, username);
            }
        }

        public List<string> GetRule(string username)
        {
            using (var connection = GetConnection(_config.CONN_STR))
            {
                connection.Open();
                return getRuleByUser(connection, username);
            }
        }

        public List<string> GetCategory(string username)
        {
            using (var connection = GetConnection(_config.CONN_STR))
            {
                connection.Open();
                return getCategoryByUser(connection, username);
            }
        }

        public Dictionary<string, bool> GetCube(string username, List<string> userCategory)
        {
            using (var connection = GetConnection(_config.CONN_STR))
            {
                connection.Open();
                return getCubeByUser(connection, username, userCategory);
            }
        }

        public List<string> GetAllAgency()
        {
            using (var connection = GetConnection(_config.CONN_STR))
            {
                connection.Open();
                _logger.Log($"BaseDBConnector GetAllAgency start", LogLevelEnum.Info);

                var agency = new List<string>();

                var sqlAgency = GetQuery("ALL_AGENCY");
                var command = GetCommand(sqlAgency, connection);
                using (var reader = command.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        agency.Add(reader.GetString(0));
                    }
                }

                if (_logger.IsDebugEnabled)
                {
                    foreach (var item in agency)
                    {
                        _logger.Log($"GetAllAgency item: {item}", LogLevelEnum.Debug);
                    }
                }
                _logger.Log($"BaseDBConnector GetAllAgency end", LogLevelEnum.Info);
                return agency;
            }
        }

        public List<string> GetAllDataflow()
        {
            using (var connection = GetConnection(_config.CONN_STR))
            {
                connection.Open();
                _logger.Log($"BaseDBConnector GetAllDataflow start", LogLevelEnum.Info);

                var dataflow = new List<string>();

                var sqlDataflow = GetQuery("ALL_DATAFLOW");
                var command = GetCommand(sqlDataflow, connection);
                using (var reader = command.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        dataflow.Add(reader.GetString(0));
                    }
                }

                if (_logger.IsDebugEnabled)
                {
                    foreach (var item in dataflow)
                    {
                        _logger.Log($"GetAllDataflow item: {item}", LogLevelEnum.Debug);
                    }
                }
                _logger.Log($"BaseDBConnector GetAllDataflow end", LogLevelEnum.Info);
                return dataflow;
            }
        }

        public List<string> GetAllMetadataFlow()
        {
            using (var connection = GetConnection(_config.CONN_STR))
            {
                connection.Open();
                _logger.Log($"BaseDBConnector GetAllMetadataFlow start", LogLevelEnum.Info);

                var metadataflow = new List<string>();

                var sqlMetadataflow = GetQuery("ALL_METADATAFLOW");
                var command = GetCommand(sqlMetadataflow, connection);
                using (var reader = command.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        metadataflow.Add(reader.GetString(0));
                    }
                }

                if (_logger.IsDebugEnabled)
                {
                    foreach (var item in metadataflow)
                    {
                        _logger.Log($"GetAllMetadataFlow item: {item}", LogLevelEnum.Debug);
                    }
                }
                _logger.Log($"BaseDBConnector GetAllMetadataFlow end", LogLevelEnum.Info);
                return metadataflow;
            }
        }

        public List<string> GetAllFunctionality()
        {
            using (var connection = GetConnection(_config.CONN_STR))
            {
                connection.Open();
                _logger.Log($"BaseDBConnector GetAllFunctionality start", LogLevelEnum.Info);

                var funcionality = new List<string>();

                var sqlFuncionality = GetQuery("ALL_AGENCY");
                var command = GetCommand(sqlFuncionality, connection);
                using (var reader = command.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        funcionality.Add(reader.GetString(0));
                    }
                }

                if (_logger.IsDebugEnabled)
                {
                    foreach (var item in funcionality)
                    {
                        _logger.Log($"GetAllFunctionality item: {item}", LogLevelEnum.Debug);
                    }
                }
                _logger.Log($"BaseDBConnector GetAllFunctionality end", LogLevelEnum.Info);
                return funcionality;
            }
        }

        public List<string> GetAllRules()
        {
            using (var connection = GetConnection(_config.CONN_STR))
            {
                connection.Open();
                _logger.Log($"BaseDBConnector GetAllRules start", LogLevelEnum.Info);

                var rules = new List<string>();

                var sqlRules = GetQuery("ALL_RULE");
                var command = GetCommand(sqlRules, connection);
                using (var reader = command.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        rules.Add(reader.GetString(0));
                    }
                }

                if (_logger.IsDebugEnabled)
                {
                    foreach (var item in rules)
                    {
                        _logger.Log($"GetAllRules item: {item}", LogLevelEnum.Debug);
                    }
                }
                _logger.Log($"BaseDBConnector GetAllRules end", LogLevelEnum.Info);
                return rules;
            }
        }


        public List<UsersDTO> GetUsers(string filterByUser)
        {
            using (var connection = GetConnection(_config.CONN_STR))
            {
                connection.Open();
                _logger.Log($"BaseDBConnector GetUsers start", LogLevelEnum.Info);

                var allUser = new List<UsersDTO>();

                var sqlUser = GetQuery("ALL_USER");
                var command = GetCommand(sqlUser, connection);
                using (var reader = command.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        var currentUser = reader.GetString(0);
                        if (string.IsNullOrWhiteSpace(filterByUser) || filterByUser.Equals(currentUser))
                        {
                            allUser.Add(new UsersDTO { Username = currentUser, Email = !reader.IsDBNull(1) ? reader.GetString(1) : "" });
                        }
                    }
                }

                if (_logger.IsDebugEnabled)
                {
                    foreach (var item in allUser)
                    {
                        _logger.Log($"GetUsers item: {item}", LogLevelEnum.Debug);
                    }
                }
                _logger.Log($"BaseDBConnector GetUsers end", LogLevelEnum.Info);
                return allUser;
            }
        }

        public Dictionary<string, string> GetOwners(string entity, string id)
        {
            using (var connection = GetConnection(_config.CONN_STR))
            {
                connection.Open();
                _logger.Log($"BaseDBConnector GetOwners start", LogLevelEnum.Info);

                var allUser = new Dictionary<string, string>();

                var sqlUser = GetQuery($"GET_OWNERS_{entity.ToUpperInvariant()}");
                var command = GetCommand(sqlUser, connection);
                command.Parameters.Add(GetParameter("IDENTIFIER", GenericDbType.VarChar, 250, id));
                using (var reader = command.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        allUser.Add(reader.GetString(0), reader.GetString(1));
                    }
                }

                if (_logger.IsDebugEnabled)
                {
                    foreach (var item in allUser)
                    {
                        _logger.Log($"GetOwners item: {item.Key}", LogLevelEnum.Debug);
                    }
                }
                _logger.Log($"BaseDBConnector GetOwners end", LogLevelEnum.Info);
                return allUser;
            }
        }

        public void SetOwners(string entity, string id, List<string> username)
        {
            _logger.Log($"BaseDBConnector SetOwners start", LogLevelEnum.Info);

            using (var connection = GetConnection(_config.CONN_STR))
            {
                connection.Open();
                
                if (username == null)
                {
                    return;
                }

                var strInsertTmpTable = new StringBuilder();
                var sqlParams = new List<DbParameter>();
                var tmpTableName = "usernameTable";
                var column = new List<Column> { new Column { Name = "Username", DbType = GenericDbType.VarChar, Size = 250 },
                                                new Column { Name = "EntityId", DbType = GenericDbType.VarChar, Size = 250 }};
                var i = 0;
                foreach (var item in username)
                {
                    strInsertTmpTable.Append(PopolateVariableTable(tmpTableName, column, i));
                    sqlParams.Add(GetParameter($"Username{i}", GenericDbType.VarChar, 255, item));
                    sqlParams.Add(GetParameter($"EntityId{i}", GenericDbType.VarChar, 255, id));
                    i++;
                }

                var sqlCreateTmpTable = GetVariableTable(tmpTableName, column);
                var sqlOwners = GetQuery($"SET_OWNERS_{entity}").Replace("@@REPLACE_CREATE_TMPTABLE@@", sqlCreateTmpTable).Replace("@@REPLACE_INSERT_TMPTABLE@@", strInsertTmpTable.ToString());

                var command = GetCommand(sqlOwners, connection);
                sqlParams.Add(GetParameter("EntityId", GenericDbType.VarChar, 250, id));

                foreach (var item in sqlParams)
                {
                    command.Parameters.Add(item);
                }

                command.ExecuteNonQuery();
                
            }
            _logger.Log($"BaseDBConnector SetOwners end", LogLevelEnum.Info);
        }

        public bool IsAuthDBConfigurated()
        {
            _logger.Log($"BaseDBConnector IsAuthDBConfigurated start", LogLevelEnum.Info);
            using (var connection = GetConnection(_config.CONN_STR))
            {
                connection.Open();

                var sid = getMA_SID(connection);

                if (string.IsNullOrWhiteSpace(sid))
                {
                    _logger.Log($"BaseDBConnector IsAuthDBConfigurated sid not found", LogLevelEnum.Debug);
                    return false;
                }

                var sqlCount = GetQuery("COUNT_CONNECTIONSTRING");
                var command = GetCommand(sqlCount, connection);

                _logger.Log($"BaseDBConnector IsAuthDBConfigurated end", LogLevelEnum.Info);
                //One record for connecttion (MSDB, DDB, RMDB)
                return (int)command.ExecuteScalar() >= 1;
            }
        }

        public bool IsAuthDbInitialized()
        {
            _logger.Log($"BaseDBConnector IsAuthDbInitialized start", LogLevelEnum.Info);
            using (var connection = GetConnection(_config.CONN_STR))
            {
                connection.Open();

                var sqlCount = GetQuery("ISAUTHDBINITIALIZED");
                var command = GetCommand(sqlCount, connection);

                _logger.Log($"BaseDBConnector IsAuthDbInitialized end", LogLevelEnum.Info);
                //One record for connecttion (MSDB, DDB, RMDB)
                return (int)command.ExecuteScalar() >= 1;
            }
        }

        public bool IsAgencyAssignToAnyUser(string agencyCode)
        {
            _logger.Log($"BaseDBConnector IsAgencyAssignToAnyUser start", LogLevelEnum.Info);
            using (var connection = GetConnection(_config.CONN_STR))
            {
                connection.Open();

                var sqlCount = GetQuery("ISAGENCYASSIGNTOANYUSER");
                var command = GetCommand(sqlCount, connection);
                command.Parameters.Add(GetParameter("AgencyCode", GenericDbType.VarChar, 250, agencyCode));

                _logger.Log($"BaseDBConnector IsAgencyAssignToAnyUser end", LogLevelEnum.Info);
                return (int)command.ExecuteScalar() > 0;
            }
        }

        public bool IsAuthDbExtInitialized()
        {
            _logger.Log($"BaseDBConnector IsAuthDbExtInitialized start", LogLevelEnum.Info);
            using (var connection = GetConnection(_config.CONN_STR))
            {
                connection.Open();

                var sqlCount = GetQuery("ISAUTHDBEXTINITIALIZED");
                var command = GetCommand(sqlCount, connection);

                _logger.Log($"BaseDBConnector IsAuthDbExtInitialized end", LogLevelEnum.Info);
                //One record for connecttion (MSDB, DDB, RMDB)
                return (int)command.ExecuteScalar() >= 1;
            }
        }

        public void ExtendAuthDb()
        {
            _logger.Log($"BaseDBConnector ExtendAuthDb start", LogLevelEnum.Info);
            using (var connection = GetConnection(_config.CONN_STR))
            {
                connection.Open();
                var transaction = connection.BeginTransaction();

                string sql = File.ReadAllText(@"config\base\AuthDB_EXT.sql");
                foreach (var batch in sql.Split(new string[] { "\nGO", "\ngo" }, StringSplitOptions.RemoveEmptyEntries))
                {
                    var command = GetCommand(batch, connection);
                    command.Transaction = transaction;
                    command.ExecuteNonQuery();
                }

                sql = File.ReadAllText(@"config\base\AuthDB_EXT2_PopulateLookups.sql");
                foreach (var batch in sql.Split(new string[] { "\nGO", "\ngo" }, StringSplitOptions.RemoveEmptyEntries))
                {
                    var command = GetCommand(batch, connection);
                    command.Transaction = transaction;
                    command.ExecuteNonQuery();
                }

                transaction.Commit();

                _logger.Log($"BaseDBConnector ExtendAuthDb end", LogLevelEnum.Info);
            }
        }

        public void InizializeAuthDb(DbConnectionStringBuilder msdbConn, DbConnectionStringBuilder ddbConn, DbConnectionStringBuilder rmdbConn, string maSid)
        {
            _logger.Log($"BaseDBConnector InizializeAuthDb start", LogLevelEnum.Info);

            if (_logger.IsDebugEnabled)
            {
                if (msdbConn != null)
                {
                    _logger.Log($"BaseDBConnector InizializeAuthDb msdbConn {msdbConn.ConnectionString}", LogLevelEnum.Debug);
                }
                if (ddbConn != null)
                {
                    _logger.Log($"BaseDBConnector InizializeAuthDb ddbConn {ddbConn.ConnectionString}", LogLevelEnum.Debug);
                }
                if (rmdbConn != null)
                {
                    _logger.Log($"BaseDBConnector InizializeAuthDb rmdbConn {rmdbConn.ConnectionString}", LogLevelEnum.Debug);
                }
                _logger.Log($"BaseDBConnector InizializeAuthDb maSid {maSid}", LogLevelEnum.Debug);
            }

            using (var connection = GetConnection(_config.CONN_STR))
            {
                connection.Open();
                var transaction = connection.BeginTransaction();

                var sqlConfigure = GetQuery("INIZIALIZEAUTHDB");
                var command = GetCommand(sqlConfigure, connection);
                command.Parameters.Add(GetParameter("msdbInsert", GenericDbType.Int, 1, 1));

                _logger.Log($"BaseDBConnector InizializeAuthDb insertConfigureAuthDb MSDB", LogLevelEnum.Info);
                insertConfigureAuthDb(command, msdbConn, "MSDB");
                if (!string.IsNullOrWhiteSpace(ddbConn?.ConnectionString))
                {
                    command.Parameters.Add(GetParameter("ddbInsert", GenericDbType.Int, 1, 1));
                    _logger.Log($"BaseDBConnector InizializeAuthDb insertConfigureAuthDb DDB", LogLevelEnum.Info);
                    insertConfigureAuthDb(command, ddbConn, "DDB");
                }
                else
                {
                    command.Parameters.Add(GetParameter("ddbInsert", GenericDbType.Int, 1, 0));
                    insertConfigureAuthDb(command, ddbConn, "DDB"); //FAKE CONFIG NOT USED
                }
                if (!string.IsNullOrWhiteSpace(rmdbConn?.ConnectionString))
                {
                    command.Parameters.Add(GetParameter("rmdbInsert", GenericDbType.Int, 1, 1));
                    _logger.Log($"BaseDBConnector InizializeAuthDb insertConfigureAuthDb RMDB", LogLevelEnum.Info);
                    insertConfigureAuthDb(command, rmdbConn, "RMDB");
                }
                else
                {
                    command.Parameters.Add(GetParameter("rmdbInsert", GenericDbType.Int, 1, 0));
                    insertConfigureAuthDb(command, ddbConn, "RMDB"); //FAKE CONFIG NOT USED
                }
                command.Parameters.Add(GetParameter("MA_SID", GenericDbType.VarChar, 100, maSid));
                command.Transaction = transaction;

                command.ExecuteNonQuery();

                transaction.Commit();
            }
            _logger.Log($"BaseDBConnector InizializeAuthDb end", LogLevelEnum.Info);
        }

        private void insertConfigureAuthDb(IDbCommand command, DbConnectionStringBuilder conn, string dbType)
        {
            _logger.Log($"BaseDBConnector insertConfigureAuthDb start", LogLevelEnum.Debug);

            var dbNumber = 0;
            switch (dbType.ToUpperInvariant())
            {
                case "MSDB":
                    dbNumber = 1;
                    break;
                case "DDB":
                    dbNumber = 2;
                    break;
                case "RMDB":
                    dbNumber = 3;
                    break;
                default:
                    throw new NotImplementedException();
            }

            var initialCatalog = "";
            if (conn.ContainsKey("Initial Catalog"))
            {
                initialCatalog = (string)conn["Initial Catalog"];
            }

            command.Parameters.Add(GetParameter($"DB_NAME{dbNumber}", GenericDbType.VarChar, 1000, initialCatalog));
            command.Parameters.Add(GetParameter($"DB_TYPE{dbNumber}", GenericDbType.VarChar, 50, dbType));
            command.Parameters.Add(GetParameter($"NAME{dbNumber}", GenericDbType.VarChar, 50, initialCatalog));

            var pass = "";
            if (conn.ContainsKey("Password"))
            {
                pass = (string)conn["Password"];
            }
            command.Parameters.Add(GetParameter($"DB_PASSWORD{dbNumber}", GenericDbType.VarChar, 50, pass));

            var originalDataSource = "";
            if (conn.ContainsKey("Data Source"))
            {
                originalDataSource = conn["Data Source"].ToString();
            }
            
            var dataSource = originalDataSource.Split(",")[0];
            var port = DefaultServerDbPort;
            if (conn.ContainsKey("Port"))
            {
                if (int.TryParse((string)conn["Port"], out int newPort))
                {
                    port = newPort;
                }
            }
            if (originalDataSource.Split(",").Length > 1)
            {
                if (int.TryParse(originalDataSource.Split(",")[1], out int newPort))
                {
                    port = newPort;
                }
            }

            command.Parameters.Add(GetParameter($"DB_PORT{dbNumber}", GenericDbType.Int, 4, port));

            command.Parameters.Add(GetParameter($"DB_SERVER{dbNumber}", GenericDbType.VarChar, 100, dataSource));
            command.Parameters.Add(GetParameter($"DB_USER{dbNumber}", GenericDbType.VarChar, 50, conn.ContainsKey("User Id") ? conn["User ID"] : DBNull.Value));
            command.Parameters.Add(GetParameter($"ADO_CONNECTION_STRING{dbNumber}", GenericDbType.VarChar, 2000, conn.ConnectionString));
            _logger.Log($"BaseDBConnector insertConfigureAuthDb end", LogLevelEnum.Debug);
        }


        #region Private

        /// <summary>
        /// Get a user account (Id, Username, Password, Salt, Algorith, DefaultStoreId)
        /// </summary>
        /// <param name="username"></param>
        /// <param name="userData"></param>
        /// <returns></returns>
        private bool getUserAccount(string username, IUserData userData)
        {
            _logger.Log($"BaseDBConnector getUserAccount start", LogLevelEnum.Info);
            if (userData == null)
            {
                throw new Exception("IUserData null");
            }
            if (string.IsNullOrWhiteSpace(username))
            {
                _logger.Log($"BaseDBConnector getUserAccount end with username empty", LogLevelEnum.Info);
                return false;
            }
            using (var connection = GetConnection(_config.CONN_STR))
            {
                connection.Open();

                var sqlRules = GetQuery("GET_USER_ACCOUNT");
                var sqlPar = GetParameter("USERNAME", GenericDbType.VarChar, 255, username);

                var command = GetCommand(sqlRules, connection);
                command.Parameters.Add(sqlPar);
                using (var reader = command.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        userData.Username = reader.GetString(0);
                        userData.Password = reader.GetString(1);
                        userData.Salt = reader.GetString(2);
                        userData.Algorithm = reader.GetString(3);
                        userData.DefaultStoreID = reader.GetString(4);
                        userData.Id = reader.GetInt64(5);
                        _logger.Log($"BaseDBConnector getUserAccount end", LogLevelEnum.Info);
                        return true;
                    }
                }
            }
            return false;
        }

        /// <summary>
        /// Get a user account (Agency, Category, Cube, Functionality)
        /// </summary>
        /// <returns></returns>
        private void getUserData(IUserData userData)
        {
            _logger.Log($"BaseDBConnector getUserData start", LogLevelEnum.Info);

            if (userData == null)
            {
                throw new Exception("IUserData null");
            }

            if (string.IsNullOrWhiteSpace(userData.Username))
            {
                return;
            }

            userData.Agencies = new List<string>();
            userData.Functionality = new List<string>();
            userData.Rules = new List<string>();
            userData.Category = new List<string>();
            userData.Cube = new List<string>();
            userData.CubeOwner = new List<string>();
            userData.Dataflow = new List<string>();
            userData.MetadataFlow = new List<string>();
            userData.DataflowOwner = new List<string>();
            userData.MetadataFlowOwner = new List<string>();

            using (var connection = GetConnection(_config.CONN_STR))
            {
                connection.Open();

                userData.MA_SID = getMA_SID(connection);
                userData.Rules = getRuleByUser(connection, userData.Username);
                userData.Agencies = getAgencyByUser(connection, userData.Username);
                userData.Functionality = getFunctionalityByUser(connection, userData.Username);
                userData.Category = getCategoryByUser(connection, userData.Username);
                var cubes = getCubeByUser(connection, userData.Username, userData.Category);
                foreach (var itemCube in cubes)
                {
                    if (itemCube.Value)
                    {
                        userData.CubeOwner.Add(itemCube.Key);
                    }
                    else
                    {
                        userData.Cube.Add(itemCube.Key);
                    }
                }

                var dataflow = getDataflowByUser(connection, userData.Username);
                foreach(var item in dataflow)
                {
                    if (item.Value)
                    {
                        userData.DataflowOwner.Add(item.Key);
                    }
                    else
                    {
                        userData.Dataflow.Add(item.Key);
                    }
                }

                var metadataFlow = getMetadataFlowByUser(connection, userData.Username);
                foreach (var item in metadataFlow)
                {
                    if (item.Value)
                    {
                        userData.MetadataFlowOwner.Add(item.Key);
                    }
                    else
                    {
                        userData.MetadataFlow.Add(item.Key);
                    }
                }
            }

            _logger.Log($"BaseDBConnector getUserData end", LogLevelEnum.Info);
        }

        private bool changePassword(IDbConnection connection, IDbTransaction transaction, string newPassword, string salt, string algorithm, long userId)
        {
            _logger.Log($"BaseDBConnector changePassword start", LogLevelEnum.Info);
            var sqlUser = GetQuery("CHANGE_PASSWORD");

            var command = GetCommand(sqlUser, connection);
            if (transaction != null)
            {
                command.Transaction = transaction;
            }
            command.Parameters.Add(GetParameter("Password", GenericDbType.VarChar, 255, newPassword));
            command.Parameters.Add(GetParameter("Salt", GenericDbType.VarChar, 250, salt));
            command.Parameters.Add(GetParameter("Algorithm", GenericDbType.VarChar, 50, !string.IsNullOrWhiteSpace(algorithm) ? algorithm : "MD5"));
            command.Parameters.Add(GetParameter("UserId", GenericDbType.BigInt, 8, userId));
            _logger.Log($"BaseDBConnector changePassword end", LogLevelEnum.Info);
            return (int)command.ExecuteScalar() > 0;
        }

        /// <summary>
        /// Get connection string for DDB
        /// </summary>
        /// <param name="connection"></param>
        /// <returns></returns>
        private string getDDBConnectionString(IDbConnection connection, bool allowNullString)
        {
            _logger.Log($"BaseDBConnector getDDBConnectionString start", LogLevelEnum.Info);

            var strConnDdb = "";
            //Take connection string DDB
            var sqlDdb = GetQuery("DDB_CONNSTRING");

            var command = GetCommand(sqlDdb, connection);
            using (var reader = command.ExecuteReader())
            {
                while (reader.Read())
                {
                    strConnDdb = reader.GetString(0);
                }
            }
            if (string.IsNullOrWhiteSpace(strConnDdb) && !allowNullString)
            {
                throw new Exception("DDB_CONFIG_ERROR");
            }

            _logger.Log($"BaseDBConnector getDDBConnectionString end", LogLevelEnum.Info);
            return strConnDdb;
        }

        /// <summary>
        /// Get connection string for MSDB
        /// </summary>
        /// <param name="connection"></param>
        /// <returns></returns>
        private string getMsDBConnectionString(IDbConnection connection)
        {
            _logger.Log($"BaseDBConnector getMsDBConnectionString start", LogLevelEnum.Info);

            var strConnMsdb = "";
            //Take connection string MSDB
            var sqlMsdb = GetQuery("MSDB_CONNSTRING");
            var command = GetCommand(sqlMsdb, connection);
            using (var reader = command.ExecuteReader())
            {
                while (reader.Read())
                {
                    strConnMsdb = reader.GetString(0);
                }
            }
            if (string.IsNullOrWhiteSpace(strConnMsdb))
            {
                throw new Exception("MSDB_CONFIG_ERROR");
            }

            _logger.Log($"BaseDBConnector getMsDBConnectionString end", LogLevelEnum.Info);
            return strConnMsdb;
        }

        /// <summary>
        /// Get connection string for RMDB
        /// </summary>
        /// <param name="connection"></param>
        /// <returns></returns>
        private string getRMDBConnectionString(IDbConnection connection, bool allowNullString)
        {
            _logger.Log($"BaseDBConnector getRMDBConnectionString start", LogLevelEnum.Info);

            var strConnDdb = "";
            //Take connection string RMDB
            var sqlDdb = GetQuery("RMDB_CONNSTRING");

            var command = GetCommand(sqlDdb, connection);
            using (var reader = command.ExecuteReader())
            {
                while (reader.Read())
                {
                    strConnDdb = reader.GetString(0);
                }
            }
            if (string.IsNullOrWhiteSpace(strConnDdb) && !allowNullString)
            {
                throw new Exception("RMDB_CONFIG_ERROR");
            }

            _logger.Log($"BaseDBConnector getRMDBConnectionString end", LogLevelEnum.Info);
            return strConnDdb;
        }

        private void assignsExtraData(IUserData user, IDbConnection connection, IDbTransaction transaction)
        {
            _logger.Log($"BaseDBConnector assignsExtraData start", LogLevelEnum.Info);

            var sqlExtraData = GetQuery("ASSIGN_EXTRADATA");
            var command = GetCommand(sqlExtraData, connection);
            if (transaction != null)
            {
                command.Transaction = transaction;
            }

            var sqlParams = new List<DbParameter>();
            sqlParams.Add(GetParameter("USER_ID", GenericDbType.BigInt, 8, user.Id));
            sqlParams.Add(GetParameter("Email", GenericDbType.VarChar, 255, user.Email));
            foreach (var item in sqlParams)
            {
                command.Parameters.Add(item);
            }
            command.ExecuteNonQuery();

            _logger.Log($"BaseDBConnector assignsExtraData end", LogLevelEnum.Info);
        }

        /// <summary>
        /// Assigns agency to a user
        /// </summary>
        /// <param name="connection"></param>
        /// <param name="agency">List of all agency for the user</param>
        /// <param name="userId">UserId to assign the agency</param>
        /// <param name="transaction"></param>
        /// <returns></returns>
        private List<string> assignsAgency(IDbConnection connection, List<string> agency, long userId, IDbTransaction transaction)
        {
            _logger.Log($"BaseDBConnector assignsAgency start", LogLevelEnum.Info);

            var result = new List<string>();

            if (agency == null)
            {
                return result;
            }

            var strInsertTmpTable = new StringBuilder();
            var sqlParams = new List<DbParameter>();
            var tmpTableName = "agencyTable";
            var column = new List<Column> { new Column { Name = "ID_MSDB", DbType = GenericDbType.VarChar, Size = 150 } };
            var i = 0;
            foreach (var item in agency)
            {
                strInsertTmpTable.Append(PopolateVariableTable(tmpTableName, column, i));
                sqlParams.Add(GetParameter($"ID_MSDB{i}", GenericDbType.VarChar, 150, item));
                i++;
            }

            var sqlCreateTmpTable = GetVariableTable(tmpTableName, column);
            var sqlAgency = GetQuery("ASSIGN_AGENCY").Replace("@@REPLACE_CREATE_TMPTABLE@@", sqlCreateTmpTable).Replace("@@REPLACE_INSERT_TMPTABLE@@", strInsertTmpTable.ToString());

            var command = GetCommand(sqlAgency, connection);
            if (transaction != null)
            {
                command.Transaction = transaction;
            }
            sqlParams.Add(GetParameter("UserId", GenericDbType.BigInt, 8, userId));
            foreach (var item in sqlParams)
            {
                command.Parameters.Add(item);
            }

            using (var reader = command.ExecuteReader())
            {
                while (reader.Read())
                {
                    result.Add(reader.GetString(0));
                }
            }
            if (_logger.IsDebugEnabled)
            {
                foreach (var item in result)
                {
                    _logger.Log($"assignsAgency item: {item}", LogLevelEnum.Debug);
                }
            }
            _logger.Log($"BaseDBConnector assignsAgency end", LogLevelEnum.Info);
            return result;
        }

        /// <summary>
        /// Assigns category to a user
        /// </summary>
        /// <param name="connection"></param>
        /// <param name="category">List of all category for the user</param>
        /// <param name="userId">UserId to assign the category</param>
        /// <param name="transaction"></param>
        /// <returns></returns>
        private List<string> assignsCategory(IDbConnection connection, List<string> category, long userId, IDbTransaction transaction)
        {
            _logger.Log($"BaseDBConnector assignsCategory start", LogLevelEnum.Info);

            var result = new List<string>();

            if (category == null)
            {
                return result;
            }


            var strInsertTmpTable = new StringBuilder();
            var sqlParams = new List<DbParameter>();
            var tmpTableName = "categoryTable";
            var column = new List<Column> { new Column { Name = "ID_MSDB", DbType = GenericDbType.VarChar, Size = 150 } };
            var i = 0;
            foreach (var item in category)
            {
                strInsertTmpTable.Append(PopolateVariableTable(tmpTableName, column, i));
                sqlParams.Add(GetParameter($"ID_MSDB{i}", GenericDbType.VarChar, 150, item));
                i++;
            }

            var sqlCreateTmpTable = GetVariableTable(tmpTableName, column);
            var sqlCategory = GetQuery("ASSIGN_CATEGORY").Replace("@@REPLACE_CREATE_TMPTABLE@@", sqlCreateTmpTable).Replace("@@REPLACE_INSERT_TMPTABLE@@", strInsertTmpTable.ToString());

            var command = GetCommand(sqlCategory, connection);
            if (transaction != null)
            {
                command.Transaction = transaction;
            }
            sqlParams.Add(GetParameter("UserId", GenericDbType.BigInt, 8, userId));

            foreach (var item in sqlParams)
            {
                command.Parameters.Add(item);
            }


            using (var reader = command.ExecuteReader())
            {
                while (reader.Read())
                {
                    result.Add(reader.GetString(0));
                }
            }

            if (_logger.IsDebugEnabled)
            {
                foreach (var item in result)
                {
                    _logger.Log($"assignsCategory item: {item}", LogLevelEnum.Debug);
                }
            }
            _logger.Log($"BaseDBConnector assignsCategory end", LogLevelEnum.Info);
            return result;
        }

        /// <summary>
        /// Assigns cube to a user
        /// </summary>
        /// <param name="connection"></param>
        /// <param name="cube">List of all cube for the user</param>
        /// <param name="userId">UserId to assign the cube</param>
        /// <param name="isOwner">true in case of owner of cube to assign</param>
        /// <param name="transaction"></param>
        /// <returns></returns>
        private Dictionary<string, bool> assignsCube(IDbConnection connection, Dictionary<string, bool> cube, long userId, IDbTransaction transaction)
        {
            _logger.Log($"BaseDBConnector assignsCube start", LogLevelEnum.Info);

            var result = new Dictionary<string, bool>();

            if (cube == null)
            {
                return result;
            }

            var strInsertTmpTable = new StringBuilder();
            var sqlParams = new List<DbParameter>();
            var tmpTableName = "cubeTable";
            var column = new List<Column> { new Column { Name = "CODE", DbType = GenericDbType.VarChar, Size = 50 },
                                            new Column { Name = "IsOwner", DbType = GenericDbType.Bit, Size = 1 }};
            var i = 0;
            foreach (var item in cube)
            {
                strInsertTmpTable.Append(PopolateVariableTable(tmpTableName, column, i));
                sqlParams.Add(GetParameter($"Code{i}", GenericDbType.VarChar, 50, item.Key));
                sqlParams.Add(GetParameter($"IsOwner{i}", GenericDbType.Bit, 1, item.Value));
                i++;
            }

            var sqlCreateTmpTable = GetVariableTable(tmpTableName, column);
            var sqlCategory = GetQuery("ASSIGN_CUBE").Replace("@@REPLACE_CREATE_TMPTABLE@@", sqlCreateTmpTable).Replace("@@REPLACE_INSERT_TMPTABLE@@", strInsertTmpTable.ToString());

            var command = GetCommand(sqlCategory, connection);
            if (transaction != null)
            {
                command.Transaction = transaction;
            }
            sqlParams.Add(GetParameter("UserId", GenericDbType.BigInt, 8, userId));

            foreach (var item in sqlParams)
            {
                command.Parameters.Add(item);
            }


            using (var reader = command.ExecuteReader())
            {
                while (reader.Read())
                {
                    result.Add(reader.GetString(0), reader.GetBoolean(1));
                }
            }

            if (_logger.IsDebugEnabled)
            {
                foreach (var item in result)
                {
                    _logger.Log($"assignsCube item: {item}", LogLevelEnum.Debug);
                }
            }
            _logger.Log($"BaseDBConnector assignsCube end", LogLevelEnum.Info);
            return result;
        }

        /// <summary>
        /// Assigns rule to a user
        /// </summary>
        /// <param name="connection"></param>
        /// <param name="rule">List of all rule for the user</param>
        /// <param name="userId">UserId to assign the rule</param>
        /// <param name="transaction"></param>
        /// <returns></returns>
        private List<string> assignsRule(IDbConnection connection, List<string> rule, long userId, IDbTransaction transaction)
        {
            _logger.Log($"BaseDBConnector assignsRule start", LogLevelEnum.Info);

            var result = new List<string>();

            if (rule == null)
            {
                return result;
            }

            var strInsertTmpTable = new StringBuilder();
            var sqlParams = new List<DbParameter>();
            var tmpTableName = "ruleTable";
            var column = new List<Column> { new Column { Name = "RULE_NAME", DbType = GenericDbType.VarChar, Size = 255 } };
            var i = 0;
            foreach (var item in rule)
            {
                strInsertTmpTable.Append(PopolateVariableTable(tmpTableName, column, i));
                sqlParams.Add(GetParameter($"RULE_NAME{i}", GenericDbType.VarChar, 255, item));
                i++;
            }

            var sqlCreateTmpTable = GetVariableTable(tmpTableName, column);
            var sqlCategory = GetQuery("ASSIGN_RULE").Replace("@@REPLACE_CREATE_TMPTABLE@@", sqlCreateTmpTable).Replace("@@REPLACE_INSERT_TMPTABLE@@", strInsertTmpTable.ToString());

            var command = GetCommand(sqlCategory, connection);
            if (transaction != null)
            {
                command.Transaction = transaction;
            }
            sqlParams.Add(GetParameter("UserId", GenericDbType.BigInt, 8, userId));

            foreach (var item in sqlParams)
            {
                command.Parameters.Add(item);
            }


            using (var reader = command.ExecuteReader())
            {
                while (reader.Read())
                {
                    result.Add(reader.GetString(0));
                }
            }

            if (_logger.IsDebugEnabled)
            {
                foreach (var item in result)
                {
                    _logger.Log($"assignsRule item: {item}", LogLevelEnum.Debug);
                }
            }
            _logger.Log($"BaseDBConnector assignsRule end", LogLevelEnum.Info);
            return result;
        }

        /// <summary>
        /// Assigns functionality to a user
        /// </summary>
        /// <param name="connection"></param>
        /// <param name="functionality">List of all functionality for the user</param>
        /// <param name="userId">UserId to assign the functionality</param>
        /// <param name="transaction"></param>
        /// <returns></returns>
        private List<string> assignsFunctionality(IDbConnection connection, List<string> functionality, long userId, IDbTransaction transaction)
        {
            _logger.Log($"BaseDBConnector assignsFunctionality start", LogLevelEnum.Info);

            var result = new List<string>();

            if (functionality == null)
            {
                return result;
            }

            var strInsertTmpTable = new StringBuilder();
            var sqlParams = new List<DbParameter>();
            var tmpTableName = "functionalityTable";
            var column = new List<Column> { new Column { Name = "FUNCT_NAME", DbType = GenericDbType.VarChar, Size = 150 } };
            var i = 0;
            foreach (var item in functionality)
            {
                strInsertTmpTable.Append(PopolateVariableTable(tmpTableName, column, i));
                sqlParams.Add(GetParameter($"FUNCT_NAME{i}", GenericDbType.VarChar, 150, item));
                i++;
            }

            var sqlCreateTmpTable = GetVariableTable(tmpTableName, column);
            var sqlFunctionality = GetQuery("ASSIGN_FUNCTIONALITY").Replace("@@REPLACE_CREATE_TMPTABLE@@", sqlCreateTmpTable).Replace("@@REPLACE_INSERT_TMPTABLE@@", strInsertTmpTable.ToString());

            var command = GetCommand(sqlFunctionality, connection);
            if (transaction != null)
            {
                command.Transaction = transaction;
            }
            sqlParams.Add(GetParameter("UserId", GenericDbType.BigInt, 8, userId));
            foreach (var item in sqlParams)
            {
                command.Parameters.Add(item);
            }
            using (var reader = command.ExecuteReader())
            {
                while (reader.Read())
                {
                    result.Add(reader.GetString(0));
                }
            }

            if (_logger.IsDebugEnabled)
            {
                foreach (var item in result)
                {
                    _logger.Log($"assignsFunctionality item: {item}", LogLevelEnum.Debug);
                }
            }
            _logger.Log($"BaseDBConnector assignsFunctionality end", LogLevelEnum.Info);
            return result;
        }

        /// <summary>
        /// Assigns dataflow to a user
        /// </summary>
        /// <param name="connection"></param>
        /// <param name="dataflow">List of all dataflow for the user</param>
        /// <param name="userId">UserId to assign the functionality</param>
        /// <param name="transaction"></param>
        /// <returns></returns>
        private Dictionary<string, bool> assignsDataflow(IDbConnection connection, Dictionary<string, bool> dataflow, long userId, IDbTransaction transaction)
        {
            _logger.Log($"BaseDBConnector assignsDataflow start", LogLevelEnum.Info);

            var result = new Dictionary<string, bool>();

            if (dataflow == null)
            {
                return result;
            }

            var strInsertTmpTable = new StringBuilder();
            var sqlParams = new List<DbParameter>();
            var tmpTableName = "dataflowTable";
            var column = new List<Column> { new Column { Name = "Identifier", DbType = GenericDbType.VarChar, Size = 150 },
                                            new Column { Name = "IsOwner", DbType = GenericDbType.Bit, Size = 1 }};
            var i = 0;
            foreach (var item in dataflow)
            {
                strInsertTmpTable.Append(PopolateVariableTable(tmpTableName, column, i));
                sqlParams.Add(GetParameter($"Identifier{i}", GenericDbType.VarChar, 150, item.Key));
                sqlParams.Add(GetParameter($"IsOwner{i}", GenericDbType.Bit, 1, item.Value));
                i++;
            }
            
            var sqlCreateTmpTable = GetVariableTable(tmpTableName, column);
            var sqlFunctionality = GetQuery("ASSIGN_DATAFLOW").Replace("@@REPLACE_CREATE_TMPTABLE@@", sqlCreateTmpTable).Replace("@@REPLACE_INSERT_TMPTABLE@@", strInsertTmpTable.ToString());

            var command = GetCommand(sqlFunctionality, connection);
            if (transaction != null)
            {
                command.Transaction = transaction;
            }
            sqlParams.Add(GetParameter("UserId", GenericDbType.BigInt, 8, userId));
            foreach (var item in sqlParams)
            {
                command.Parameters.Add(item);
            }
            using (var reader = command.ExecuteReader())
            {
                while (reader.Read())
                {
                    result.Add(reader.GetString(0), reader.GetBoolean(1));
                }
            }

            if (_logger.IsDebugEnabled)
            {
                foreach (var item in result)
                {
                    _logger.Log($"assignsDataflow item: {item}", LogLevelEnum.Debug);
                }
            }
            _logger.Log($"BaseDBConnector assignsDataflow end", LogLevelEnum.Info);
            return result;
        }

        /// <summary>
        /// Assigns metadataflow to a user
        /// </summary>
        /// <param name="connection"></param>
        /// <param name="metadataflow">List of all metadataflow for the user</param>
        /// <param name="userId">UserId to assign the functionality</param>
        /// <param name="transaction"></param>
        /// <returns></returns>
        private Dictionary<string, bool> assignsMetadataFlow(IDbConnection connection, Dictionary<string, bool> metadataflow, long userId, IDbTransaction transaction)
        {
            _logger.Log($"BaseDBConnector assignsMetadataFlow start", LogLevelEnum.Info);

            var result = new Dictionary<string, bool>();

            if (metadataflow == null)
            {
                return result;
            }

            var strInsertTmpTable = new StringBuilder();
            var sqlParams = new List<DbParameter>();
            var tmpTableName = "metadataflowTable";
            var column = new List<Column> { new Column { Name = "Identifier", DbType = GenericDbType.VarChar, Size = 150 },
                                            new Column { Name = "IsOwner", DbType = GenericDbType.Bit, Size = 1 }};
            var i = 0;
            foreach (var item in metadataflow)
            {
                strInsertTmpTable.Append(PopolateVariableTable(tmpTableName, column, i));
                sqlParams.Add(GetParameter($"Identifier{i}", GenericDbType.VarChar, 150, item.Key));
                sqlParams.Add(GetParameter($"IsOwner{i}", GenericDbType.Bit, 1, item.Value));
                i++;
            }

            var sqlCreateTmpTable = GetVariableTable(tmpTableName, column);
            var sqlMetadataflow = GetQuery("ASSIGN_METADATAFLOW").Replace("@@REPLACE_CREATE_TMPTABLE@@", sqlCreateTmpTable).Replace("@@REPLACE_INSERT_TMPTABLE@@", strInsertTmpTable.ToString());

            var command = GetCommand(sqlMetadataflow, connection);
            if (transaction != null)
            {
                command.Transaction = transaction;
            }
            sqlParams.Add(GetParameter("UserId", GenericDbType.BigInt, 8, userId));
            foreach (var item in sqlParams)
            {
                command.Parameters.Add(item);
            }
            using (var reader = command.ExecuteReader())
            {
                while (reader.Read())
                {
                    result.Add(reader.GetString(0), reader.GetBoolean(1));
                }
            }

            if (_logger.IsDebugEnabled)
            {
                foreach (var item in result)
                {
                    _logger.Log($"assignsMetadataFlow item: {item}", LogLevelEnum.Debug);
                }
            }
            _logger.Log($"BaseDBConnector assignsMetadataFlow end", LogLevelEnum.Info);
            return result;
        }

        private void addCube(IDbConnection connection, List<string> cube, long userId, bool isOwner, IDbTransaction transaction)
        {
            _logger.Log($"BaseDBConnector addCube start", LogLevelEnum.Info);

            var result = new List<string>();

            if (cube == null || cube.Count <= 0)
            {
                return;
            }

            foreach (var item in cube)
            {
                var command = GetCommand(GetQuery("ADD_CUBE"), connection);
                if (transaction != null)
                {
                    command.Transaction = transaction;
                }
                command.Parameters.Add(GetParameter("CODE", GenericDbType.VarChar, 50, item));
                command.Parameters.Add(GetParameter("USER_ID", GenericDbType.BigInt, 8, userId));
                command.Parameters.Add(GetParameter("FLG_IS_OWNER", GenericDbType.Bit, 1, isOwner));
                command.ExecuteNonQuery();
            }

            if (_logger.IsDebugEnabled)
            {
                foreach (var item in result)
                {
                    _logger.Log($"addCube item: {item}", LogLevelEnum.Debug);
                }
            }
            _logger.Log($"BaseDBConnector addCube end", LogLevelEnum.Info);
            return;
        }

        private void addCategory(IDbConnection connection, List<string> category, long userId, IDbTransaction transaction)
        {
            _logger.Log($"BaseDBConnector addCategory start", LogLevelEnum.Info);

            var result = new List<string>();

            if (category == null || category.Count <= 0)
            {
                return;
            }

            foreach (var item in category)
            {
                var command = GetCommand(GetQuery("ADD_CATEGORY"), connection);
                if (transaction != null)
                {
                    command.Transaction = transaction;
                }
                command.Parameters.Add(GetParameter("ID_MSDB", GenericDbType.VarChar, 150, item));
                command.Parameters.Add(GetParameter("USER_ID", GenericDbType.BigInt, 8, userId));
                command.ExecuteNonQuery();
            }

            if (_logger.IsDebugEnabled)
            {
                foreach (var item in result)
                {
                    _logger.Log($"addCategory item: {item}", LogLevelEnum.Debug);
                }
            }
            _logger.Log($"BaseDBConnector addCategory end", LogLevelEnum.Info);
            return;
        }

        private void addAgency(IDbConnection connection, List<string> agency, long userId, IDbTransaction transaction)
        {
            _logger.Log($"BaseDBConnector addAgency start", LogLevelEnum.Info);

            var result = new List<string>();

            if (agency == null || agency.Count <= 0)
            {
                return;
            }

            foreach (var item in agency)
            {
                var command = GetCommand(GetQuery("ADD_AGENCY"), connection);
                if (transaction != null)
                {
                    command.Transaction = transaction;
                }
                command.Parameters.Add(GetParameter("ID_MSDB", GenericDbType.VarChar, 150, item));
                command.Parameters.Add(GetParameter("USER_ID", GenericDbType.BigInt, 8, userId));
                command.ExecuteNonQuery();
            }

            if (_logger.IsDebugEnabled)
            {
                foreach (var item in result)
                {
                    _logger.Log($"addAgency item: {item}", LogLevelEnum.Debug);
                }
            }
            _logger.Log($"BaseDBConnector addAgency end", LogLevelEnum.Info);
            return;
        }

        private void addFunctionality(IDbConnection connection, List<string> functionality, long userId, IDbTransaction transaction)
        {
            _logger.Log($"BaseDBConnector addFunctionality start", LogLevelEnum.Info);

            var result = new List<string>();

            if (functionality == null || functionality.Count <= 0)
            {
                return;
            }

            foreach (var item in functionality)
            {
                var command = GetCommand(GetQuery("ADD_FUNCTIONALITY"), connection);
                if (transaction != null)
                {
                    command.Transaction = transaction;
                }
                command.Parameters.Add(GetParameter("FUNCT_NAME", GenericDbType.VarChar, 150, item));
                command.Parameters.Add(GetParameter("USER_ID", GenericDbType.BigInt, 8, userId));
                command.ExecuteNonQuery();
            }

            if (_logger.IsDebugEnabled)
            {
                foreach (var item in result)
                {
                    _logger.Log($"addFunctionality item: {item}", LogLevelEnum.Debug);
                }
            }
            _logger.Log($"BaseDBConnector addFunctionality end", LogLevelEnum.Info);
            return;
        }

        private void addRule(IDbConnection connection, List<string> rule, long userId, IDbTransaction transaction)
        {
            _logger.Log($"BaseDBConnector addRule start", LogLevelEnum.Info);

            var result = new List<string>();

            if (rule == null || rule.Count <= 0)
            {
                return;
            }

            foreach (var item in rule)
            {
                var command = GetCommand(GetQuery("ADD_RULE"), connection);
                if (transaction != null)
                {
                    command.Transaction = transaction;
                }
                command.Parameters.Add(GetParameter("RULE_NAME", GenericDbType.VarChar, 255, item));
                command.Parameters.Add(GetParameter("ID", GenericDbType.BigInt, 8, userId));
                command.ExecuteNonQuery();
            }

            if (_logger.IsDebugEnabled)
            {
                foreach (var item in result)
                {
                    _logger.Log($"addRule item: {item}", LogLevelEnum.Debug);
                }
            }
            _logger.Log($"BaseDBConnector addRule end", LogLevelEnum.Info);
            return;
        }

        private void addMetadataFlow(IDbConnection connection, List<string> metadataFlow, long userId, bool isOwner, IDbTransaction transaction)
        {
            _logger.Log($"BaseDBConnector addMetadataFlow start", LogLevelEnum.Info);

            var result = new List<string>();

            if (metadataFlow == null || metadataFlow.Count <= 0)
            {
                return;
            }

            foreach (var item in metadataFlow)
            {
                var command = GetCommand(GetQuery("ADD_METADATAFLOW"), connection);
                if (transaction != null)
                {
                    command.Transaction = transaction;
                }
                command.Parameters.Add(GetParameter("Identifier", GenericDbType.VarChar, 250, item));
                command.Parameters.Add(GetParameter("USER_ID", GenericDbType.BigInt, 8, userId));
                command.Parameters.Add(GetParameter("IsOwner", GenericDbType.Bit, 1, isOwner));
                command.ExecuteNonQuery();
            }

            if (_logger.IsDebugEnabled)
            {
                foreach (var item in result)
                {
                    _logger.Log($"addMetadataFlow item: {item}", LogLevelEnum.Debug);
                }
            }
            _logger.Log($"BaseDBConnector addMetadataFlow end", LogLevelEnum.Info);
            return;
        }

        private void addDataflow(IDbConnection connection, List<string> dataflow, long userId, bool isOwner, IDbTransaction transaction)
        {
            _logger.Log($"BaseDBConnector addDataflow start", LogLevelEnum.Info);

            var result = new List<string>();

            if (dataflow == null || dataflow.Count <= 0)
            {
                return;
            }

            foreach (var item in dataflow)
            {
                var command = GetCommand(GetQuery("ADD_DATAFLOW"), connection);
                if (transaction != null)
                {
                    command.Transaction = transaction;
                }
                command.Parameters.Add(GetParameter("Identifier", GenericDbType.VarChar, 250, item));
                command.Parameters.Add(GetParameter("USER_ID", GenericDbType.BigInt, 8, userId));
                command.Parameters.Add(GetParameter("IsOwner", GenericDbType.Bit, 1, isOwner));
                command.ExecuteNonQuery();
            }

            if (_logger.IsDebugEnabled)
            {
                foreach (var item in result)
                {
                    _logger.Log($"addDataflow item: {item}", LogLevelEnum.Debug);
                }
            }
            _logger.Log($"BaseDBConnector addDataflow end", LogLevelEnum.Info);
            return;
        }

        /// <summary>
        /// Get all agency for the specific user
        /// </summary>
        /// <returns></returns>
        private List<string> getAgencyByUser(IDbConnection connection, string username)
        {
            _logger.Log($"BaseDBConnector getAgencyByUser start", LogLevelEnum.Info);

            var agency = new List<string>();

            var sqlAgency = GetQuery("USER_AGENCY");
            var sqlPar = GetParameter("USERNAME", GenericDbType.VarChar, 255, username);
            var command = GetCommand(sqlAgency, connection);
            command.Parameters.Add(sqlPar);
            using (var reader = command.ExecuteReader())
            {
                while (reader.Read())
                {
                    agency.Add(reader.GetString(0));
                }
            }

            if (_logger.IsDebugEnabled)
            {
                foreach (var item in agency)
                {
                    _logger.Log($"getAgencyByUser item: {item}", LogLevelEnum.Debug);
                }
            }
            _logger.Log($"BaseDBConnector getAgencyByUser end", LogLevelEnum.Info);
            return agency;
        }

        private Dictionary<string, bool> getDataflowByUser(IDbConnection connection, string username)
        {
            _logger.Log($"BaseDBConnector getDataflowByUser start", LogLevelEnum.Info);

            var dataFlow = new Dictionary<string, bool>();

            var sqlDataflow = GetQuery("USER_DATAFLOW");
            var sqlPar = GetParameter("USERNAME", GenericDbType.VarChar, 255, username);
            var command = GetCommand(sqlDataflow, connection);
            command.Parameters.Add(sqlPar);
            using (var reader = command.ExecuteReader())
            {
                while (reader.Read())
                {
                    dataFlow.Add(reader.GetString(0), reader.GetBoolean(1));
                }
            }

            if (_logger.IsDebugEnabled)
            {
                foreach (var item in dataFlow)
                {
                    _logger.Log($"getDataflowByUser item: {item.Key}", LogLevelEnum.Debug);
                }
            }
            _logger.Log($"BaseDBConnector getDataflowByUser end", LogLevelEnum.Info);
            return dataFlow;
        }

        private Dictionary<string, bool> getMetadataFlowByUser(IDbConnection connection, string username)
        {
            _logger.Log($"BaseDBConnector getMetadataFlowByUser start", LogLevelEnum.Info);

            var dataFlow = new Dictionary<string, bool>();

            var sqlMetadataFlow = GetQuery("USER_METADATAFLOW");
            var sqlPar = GetParameter("USERNAME", GenericDbType.VarChar, 255, username);
            var command = GetCommand(sqlMetadataFlow, connection);
            command.Parameters.Add(sqlPar);
            using (var reader = command.ExecuteReader())
            {
                while (reader.Read())
                {
                    dataFlow.Add(reader.GetString(0), reader.GetBoolean(1));
                }
            }

            if (_logger.IsDebugEnabled)
            {
                foreach (var item in dataFlow)
                {
                    _logger.Log($"getMetadataFlowByUser item: {item.Key}", LogLevelEnum.Debug);
                }
            }
            _logger.Log($"BaseDBConnector getMetadataFlowByUser end", LogLevelEnum.Info);
            return dataFlow;
        }
        
        /// <summary>
        /// Get all functionality for the specific user
        /// </summary>
        /// <returns></returns>
        private List<string> getFunctionalityByUser(IDbConnection connection, string username)
        {
            _logger.Log($"BaseDBConnector getFunctionalityByUser start", LogLevelEnum.Info);

            var functionality = new List<string>();

            //take item and all his descendants
            var sqlFunctionality = GetQuery("USER_FUNCTIONALITY");
            var sqlPar = GetParameter("Username", GenericDbType.VarChar, 255, username);
            var command = GetCommand(sqlFunctionality, connection);
            command.Parameters.Add(sqlPar);
            using (var reader = command.ExecuteReader())
            {
                while (reader.Read())
                {
                    functionality.Add(reader.GetString(0));
                }
            }

            if (_logger.IsDebugEnabled)
            {
                foreach (var item in functionality)
                {
                    _logger.Log($"getFunctionalityByUser item: {item}", LogLevelEnum.Debug);
                }
            }
            _logger.Log($"BaseDBConnector getFunctionalityByUser end", LogLevelEnum.Info);
            return functionality;
        }

        /// <summary>
        /// Get the SID for MA configurated on AuthDb
        /// </summary>
        /// <returns></returns>
        private string getMA_SID(IDbConnection connection)
        {
            _logger.Log($"BaseDBConnector getMA_SID start", LogLevelEnum.Info);

            var sqlMASid = GetQuery("GET_MA_SID");
            var command = GetCommand(sqlMASid, connection);
            var dbValue = command.ExecuteScalar();

            if (dbValue != null && dbValue != DBNull.Value)
            {
                _logger.Log($"BaseDBConnector getMA_SID end with value", LogLevelEnum.Debug);
                return (string)dbValue;
            }
            _logger.Log($"BaseDBConnector getMA_SID end without value", LogLevelEnum.Info);
            return "";
        }

        /// <summary>
        /// Get all rules for the specific user
        /// </summary>
        /// <returns></returns>
        private List<string> getRuleByUser(IDbConnection connection, string username)
        {
            _logger.Log($"BaseDBConnector getRulesByUser start", LogLevelEnum.Info);
            var rules = new List<string>();

            var sqlRules = GetQuery("USER_RULES");
            var sqlPar = GetParameter("Username", GenericDbType.VarChar, 255, username);

            var command = GetCommand(sqlRules, connection);
            command.Parameters.Add(sqlPar);
            using (var reader = command.ExecuteReader())
            {
                while (reader.Read())
                {
                    rules.Add(reader.GetString(0));
                }
            }

            if (_logger.IsDebugEnabled)
            {
                foreach (var item in rules)
                {
                    _logger.Log($"getRulesByUser item: {item}", LogLevelEnum.Debug);
                }
            }
            _logger.Log($"BaseDBConnector getRulesByUser end", LogLevelEnum.Info);
            return rules;
        }

        /// <summary>
        /// Get all category for the specific user
        /// </summary>
        /// <returns></returns>
        private List<string> getCategoryByUser(IDbConnection connection, string username)
        {
            _logger.Log($"BaseDBConnector getCategoryByUser start", LogLevelEnum.Info);

            var category = new List<string>();

            //take item and all his descendants
            var sqlCategory = GetQuery("USER_CATEGORY");
            var sqlPar = GetParameter("Username", GenericDbType.VarChar, 255, username);
            var command = GetCommand(sqlCategory, connection);
            command.Parameters.Add(sqlPar);
            using (var reader = command.ExecuteReader())
            {
                while (reader.Read())
                {
                    category.Add(reader.GetString(0));
                }
            }

            if (_logger.IsDebugEnabled)
            {
                foreach (var item in category)
                {
                    _logger.Log($"getCategoryByUser item: {item}", LogLevelEnum.Debug);
                }
            }
            _logger.Log($"BaseDBConnector getCategoryByUser end", LogLevelEnum.Info);
            return category;
        }

        /// <summary>
        /// Get all cube for the specific user
        /// </summary>
        /// <returns></returns>
        private Dictionary<string, bool> getCubeByUser(IDbConnection connection, string username, List<string> userCategory)
        {
            _logger.Log($"BaseDBConnector getCubeByUser start", LogLevelEnum.Info);

            var cube = new Dictionary<string, bool>();

            //include teh cube associated with category
            var strCategoryInWhere = new StringBuilder();
            var allParams = new List<DbParameter>();
            var i = 0;
            foreach (var cat in userCategory)
            {
                if (i == 0)
                {
                    strCategoryInWhere.Append($"@@DbPar@@Code{i}");
                }
                else
                {
                    strCategoryInWhere.Append($", @@DbPar@@Code{i}");
                }
                allParams.Add(GetParameter($"Code{i}", GenericDbType.VarChar, 150, cat));
                i++;
            }
            var sqlCube = GetQuery("USER_CUBE");
            if (i > 0)
            { //If user have Agency, include all Cube assigned to that Agency
                sqlCube = GetQuery("USER_CUBE_UNION_CATEGORY").Replace("@@REPLACE_INWHERE@@", strCategoryInWhere.ToString()).Replace("@@REPLACE_TABLE_UNION@@", sqlCube);
            }

            allParams.Add(GetParameter("USERNAME", GenericDbType.VarChar, 255, username));
            var command = GetCommand(sqlCube, connection);
            foreach (var item in allParams)
            {
                command.Parameters.Add(item);
            }
            using (var reader = command.ExecuteReader())
            {
                while (reader.Read())
                {
                    var code = reader.GetString(0);
                    if (!cube.ContainsKey(code))
                    {
                        cube.Add(reader.GetString(0), reader.GetBoolean(1));
                    }
                }
            }

            if (_logger.IsDebugEnabled)
            {
                foreach (var item in cube)
                {
                    _logger.Log($"getCubeByUser item: {item}", LogLevelEnum.Debug);
                }
            }
            _logger.Log($"BaseDBConnector getCubeByUser end", LogLevelEnum.Info);
            return cube;
        }

        /// <summary>
        /// Get all category hierarchy present on AuthDb 
        /// </summary>
        /// <returns></returns>
        private List<CategoryHierarchy> getCategoryHierarchy(IDbConnection connection)
        {
            _logger.Log($"BaseDBConnector getCategoryHierarchy start", LogLevelEnum.Debug);

            //Take all Agency
            var rootCategory = new List<CategoryHierarchy>();
            var treeCategory = new Dictionary<int, CategoryHierarchy>();
            var sqlCategory = GetQuery("HIERARCHY_CATEGORY");

            var command = GetCommand(sqlCategory, connection);
            using (var reader = command.ExecuteReader())
            {
                while (reader.Read())
                {
                    var catId = reader.GetInt32(2);
                    var agencyCode = reader.GetString(0);

                    if (reader.GetInt32(3) == 0)
                    { //Root Level
                        var itemAgency = new CategoryHierarchy
                        {
                            Id = catId,
                            Agency = agencyCode
                        };
                        treeCategory.Add(catId, itemAgency);
                        rootCategory.Add(itemAgency);
                    }
                    else
                    {
                        var parentAgency = treeCategory[reader.GetInt32(1)];
                        var itemAgency = new CategoryHierarchy
                        {
                            Id = catId,
                            Agency = agencyCode
                        };
                        treeCategory.Add(catId, itemAgency);
                        parentAgency.Children.Add(itemAgency);
                    }
                }
            }

            _logger.Log($"BaseDBConnector getCategoryHierarchy end", LogLevelEnum.Debug);
            return rootCategory;
        }

        /// <summary>
        /// Get all cube hierarchy present on AuthDb 
        /// </summary>
        /// <returns></returns>
        private List<CubeHierarchy> getCubeHierarchy(IDbConnection connection)
        {
            _logger.Log($"BaseDBConnector getCubeHierarchy start", LogLevelEnum.Debug);

            //Take all Agency
            var rootCategory = new List<CubeHierarchy>();
            var treeCategoryy = new Dictionary<int, CubeHierarchy>();
            var sqlCube = GetQuery("HIERARCHY_CUBE");

            var command = GetCommand(sqlCube, connection);
            using (var reader = command.ExecuteReader())
            {
                while (reader.Read())
                {
                    var catId = reader.GetInt32(2);
                    var catCode = reader.GetString(0);
                    var cubeId = !reader.IsDBNull(4) ? reader.GetInt32(4) : -1;
                    var cubeCode = !reader.IsDBNull(5) ? reader.GetString(5) : "";


                    if (reader.GetInt32(3) == 0)
                    { //Root Level
                        var itemAgency = new CubeHierarchy
                        {
                            Id = catId,
                            Category = catCode
                        };
                        //Add child for first time (second time find the same id, is because thatcategory have more Cube inside)
                        if (!treeCategoryy.ContainsKey(catId))
                        {
                            treeCategoryy.Add(catId, itemAgency);
                            rootCategory.Add(itemAgency);
                        }
                        //Add cube inside of the category 
                        if (cubeId != -1)
                        {
                            treeCategoryy[catId].Cube.Add(new CubeDto { Id = cubeId, Code = cubeCode });
                        }

                    }
                    else
                    {
                        var parentAgency = treeCategoryy[reader.GetInt32(1)];
                        var itemAgency = new CubeHierarchy
                        {
                            Id = catId,
                            Category = catCode
                        };
                        //Add child for first time (second time find the same id, is because thatcategory have more Cube inside)
                        if (!treeCategoryy.ContainsKey(catId))
                        {
                            treeCategoryy.Add(catId, itemAgency);
                            parentAgency.Children.Add(itemAgency);
                        }
                        //Add cube inside of the category 
                        if (cubeId != -1)
                        {
                            treeCategoryy[catId].Cube.Add(new CubeDto { Id = cubeId, Code = cubeCode });
                        }
                    }
                }
            }

            _logger.Log($"BaseDBConnector getCubeHierarchy end", LogLevelEnum.Debug);
            return rootCategory;
        }

        /// <summary>
        /// Get all functionality hierarchy present on AuthDb 
        /// </summary>
        /// <returns></returns>
        private List<FunctionalityHierarchy> getFunctionalityHierarchy(IDbConnection connection)
        {
            _logger.Log($"BaseDBConnector getFunctionalityHierarchy start", LogLevelEnum.Debug);

            //Take all Agency
            var rootCategory = new List<FunctionalityHierarchy>();
            var treeCategory = new Dictionary<int, FunctionalityHierarchy>();
            var sqlCategory = GetQuery("HIERARCHY_FUNCTIONALITY");

            var command = GetCommand(sqlCategory, connection);
            using (var reader = command.ExecuteReader())
            {
                while (reader.Read())
                {
                    var catId = reader.GetInt32(2);
                    var functionalityCode = reader.GetString(0);

                    if (reader.GetInt32(3) == 0)
                    { //Root Level
                        var itemAgency = new FunctionalityHierarchy
                        {
                            Id = catId,
                            Functionality = functionalityCode
                        };
                        treeCategory.Add(catId, itemAgency);
                        rootCategory.Add(itemAgency);
                    }
                    else
                    {
                        var parentAgency = treeCategory[reader.GetInt32(1)];
                        var itemAgency = new FunctionalityHierarchy
                        {
                            Id = catId,
                            Functionality = functionalityCode
                        };
                        treeCategory.Add(catId, itemAgency);
                        parentAgency.Children.Add(itemAgency);
                    }
                }
            }

            _logger.Log($"BaseDBConnector getFunctionalityHierarchy end", LogLevelEnum.Debug);
            return rootCategory;
        }

        #region Abstract SQL

        private IDbConnection GetConnection(string connectionString)
        {
            switch (_dbProvider)
            {
                case Provider.MSSQL:
                    return new SqlConnection(connectionString);
                case Provider.ORACLE:
                //return new OracleConnection(connectionString);
                default:
                    throw new NotImplementedException();
            }
        }

        private IDbCommand GetCommand(string sql, IDbConnection connection)
        {
            if (_dbProvider == Provider.MSSQL)
            {
                var msSql = validateSqlString(sql);
                _logger.Log($"GetCommand msSql: {msSql}", LogLevelEnum.Debug);
                return new SqlCommand(msSql, (SqlConnection)connection);
            }
            else if (_dbProvider == Provider.ORACLE)
            {
                //var oracleSql = sql.Replace("@@DbPar@@", ":");
                //return new OracleCommand(oracleSql, (OracleConnection)connection);
            }
            throw new NotImplementedException();
        }

        private string validateSqlString(string sql)
        {
            return sql.Replace("@@DbPar@@", "@");
        }

        private DbParameter GetParameter(string paramName, GenericDbType genericDbType, int size, object value)
        {
            if (_dbProvider == Provider.MSSQL)
            {
                var item = new SqlParameter();
                item.ParameterName = $"@{paramName}";
                item.SqlDbType = ConvertEnumToMSSql(genericDbType);
                if (size != 0)
                {
                    item.Size = size;
                }
                item.Value = value;
                return item;
            }
            else if (_dbProvider == Provider.ORACLE)
            {
                //var item = new OracleParameter();
                //item.ParameterName = paramName;
                //item.OracleDbType = ConvertEnumToOracle(genericDbType);
                //if (size != 0)
                //{
                //    item.Size = size;
                //}
                //item.Value = value;
                //return item;
            }
            throw new NotImplementedException();
        }

        private string GetVariableTable(string tableName, List<Column> columns)
        {
            var sqlString = new StringBuilder();
            if (_dbProvider == Provider.MSSQL)
            {
                sqlString.Append($@"DECLARE @{tableName} TABLE(");
                var i = 0;
                foreach (var item in columns)
                {
                    if (i>0)
                    {
                        sqlString.Append(",");
                    }
                    sqlString.AppendLine($"{item.Name}    {ConvertEnumToColumnMSSql(item.DbType, item.Size)}");
                    i++;
                }
                sqlString.Append(");");
                return sqlString.ToString();
            }
            else if (_dbProvider == Provider.ORACLE)
            {
                sqlString.Append($@"CREATE PRIVATE TEMPORARY TABLE ora${tableName} (");
                foreach (var item in columns)
                {
                    sqlString.Append($"{item.Name}    {ConvertEnumToColumnOracle(item.DbType, item.Size)}");
                }
                sqlString.Append(") ON COMMIT DROP DEFINITION;");
                return sqlString.ToString();
            }

            throw new NotImplementedException();
        }

        private string PopolateVariableTable(string tableName, List<Column> columns, int rowNum)
        {
            var sql = new StringBuilder();
            if (_dbProvider == Provider.MSSQL)
            {
                var sqlColumn = new StringBuilder();
                var sqlParam = new StringBuilder();
                foreach (var item in columns)
                {
                    if (sqlColumn.Length>0)
                    {
                        sqlColumn.Append($", ");
                        sqlParam.Append($", ");
                    }
                    sqlColumn.Append($"{item.Name}");
                    sqlParam.Append($"@@DbPar@@{item.Name}{rowNum}");
                }
                return $"INSERT INTO @{tableName} ({sqlColumn}) VALUES ({sqlParam});";
            }
            //else if (_dbProvider == Provider.ORACLE)
            //{
                
            //}
            throw new NotImplementedException();
        }

        #endregion

        #region MSSQL Parsing

        private SqlDbType ConvertEnumToMSSql(GenericDbType dbType)
        {
            switch (dbType)
            {
                case GenericDbType.VarChar:
                    return SqlDbType.VarChar;
                case GenericDbType.Int:
                    return SqlDbType.Int;
                case GenericDbType.BigInt:
                    return SqlDbType.BigInt;
                case GenericDbType.Bit:
                    return SqlDbType.Bit;
                default:
                    return SqlDbType.VarChar;
            }
        }

        private string ConvertEnumToColumnMSSql(GenericDbType dbType, int size = 0)
        {
            var strSize = size > 0 ? size.ToString() : "MAX";
            switch (dbType)
            {
                case GenericDbType.VarChar:
                    return $"VARCHAR({size})";
                case GenericDbType.Int:
                    return "INTEGER";
                case GenericDbType.BigInt:
                    return "BIGINT";
                case GenericDbType.Bit:
                    return "BIT";
                default:
                    return "VARCHAR(MAX)";
            }
        }

        private string GetQuery(string queryName)
        {
            switch ($"{queryName.ToUpperInvariant()}#{_dbProvider.ToString()}")
            {
                case "ALL_CATEGORY#MSSQL":
                    return $@"WITH cat_tree as (
                                    SELECT cat.CatCode AS CatCode, cat.IDCat AS CatId, cat.IDParent AS ParentId, CAST('#ROOTELEMENTCATCODE#' AS varchar(50)) AS ParentCode, 0 As TreeLevel, Ord
                                    FROM [CatCategory] cat
                                    WHERE cat.IDParent IS NULL

                                    UNION ALL

                                    SELECT cat.CatCode AS CatCode, cat.IDCat AS CatId, cat.IDParent AS ParentId, parent.CatCode AS ParentCode, parent.TreeLevel+1 AS TreeLevel, cat.Ord
                                    FROM [CatCategory] cat
                                    JOIN cat_tree parent ON parent.CatId = cat.IDParent  
                                    )
                                    SELECT ParentCode, CatCode, TreeLevel
                                    FROM cat_tree
                                    ORDER BY TreeLevel, Ord";
                case "ALL_CUBE#MSSQL":
                    return $@"SELECT DISTINCT iCube.Code, ISNULL(cat.CatCode, '')
                                FROM [CatCube] iCube
                                INNER JOIN [CatCategory] cat
                                ON cat.IDCat=iCube.IDCat";
                case "ALL_RULE#MSSQL":
                    return $@"SELECT DISTINCT rules.RULE_NAME
                                FROM [ACCESS_RULE] rules";
                case "DDB_CONNSTRING#MSSQL":
                    return @"SELECT dbStr.ADO_CONNECTION_STRING 
                                    FROM AUTH_DB_CONNECTION dbConn
                                    INNER JOIN AUTH_CONNECTION_STRING dbStr
                                    ON dbStr.CONNECTION_ID=dbConn.DDB_CONN";
                case "RMDB_CONNSTRING#MSSQL":
                    return @"SELECT dbStr.ADO_CONNECTION_STRING 
                                    FROM AUTH_DB_CONNECTION dbConn
                                    INNER JOIN AUTH_CONNECTION_STRING dbStr
                                    ON dbStr.CONNECTION_ID=dbConn.RMDB_CONN";
                case "MSDB_CONNSTRING#MSSQL":
                    return @"SELECT dbStr.ADO_CONNECTION_STRING 
                                    FROM AUTH_DB_CONNECTION dbConn
                                    INNER JOIN AUTH_CONNECTION_STRING dbStr
                                    ON dbStr.CONNECTION_ID=dbConn.MSDB_CONN";
                case "GET_USERID#MSSQL":
                    return "SELECT ID FROM [SRI_USER] WHERE [USERNAME]=@@DbPar@@Username";
                case "INSERT_USER#MSSQL":
                    return @"INSERT INTO [SRI_USER] ([USERNAME], [PASSWORD], [SALT], [ALGORITHM], [DEFAULT_STORE_ID]) 
                                OUTPUT CAST(Inserted.ID AS bigint)
                                VALUES (@@DbPar@@USERNAME, @@DbPar@@PASSWORD, @@DbPar@@SALT, @@DbPar@@ALGORITHM, @@DbPar@@DEFAULT_STORE_ID)";
                case "ASSIGN_EXTRADATA#MSSQL":
                    return @"DELETE FROM [AUTH_USER_DATA] WHERE USER_ID=@@DbPar@@USER_ID

                                INSERT INTO [AUTH_USER_DATA] ([USER_ID], [Email]) 
                                VALUES (@@DbPar@@USER_ID, @@DbPar@@Email)";
                case "DELETE_USER#MSSQL":
                    return @"DELETE FROM [AUTH_USER_AGENCY] WHERE USER_ID=@@DbPar@@UserId;
                                DELETE FROM [AUTH_USER_CATEGORY] WHERE USER_ID=@@DbPar@@UserId;
                                DELETE FROM [AUTH_USER_CUBE] WHERE USER_ID=@@DbPar@@UserId;
                                DELETE FROM [AUTH_USER_FUNCTIONALITY] WHERE USER_ID=@@DbPar@@UserId;
                                DELETE FROM [AUTH_USER_ENTITY] WHERE USER_ID=@@DbPar@@UserId
                                DELETE FROM [SRI_USER] WHERE ID=@@DbPar@@UserId;
                                SELECT @@ROWCOUNT";
                case "CHANGE_PASSWORD#MSSQL":
                    return @"UPDATE [SRI_USER] SET [PASSWORD]=@@DbPar@@Password, [SALT]=@@DbPar@@Salt, [ALGORITHM]=@@DbPar@@Algorithm WHERE Id=@@DbPar@@UserId; SELECT @@ROWCOUNT";
                case "CODE_FROM_CATCUBE#MSSQL":
                    return "SELECT Code FROM CatCube WHERE IDCube=@@DbPar@@IDCube";
                case "ASSIGN_AGENCY#MSSQL":
                    return $@"@@REPLACE_CREATE_TMPTABLE@@

                            @@REPLACE_INSERT_TMPTABLE@@

                            DELETE FROM AUTH_USER_AGENCY WHERE [USER_ID]=@@DbPar@@UserId

                            INSERT INTO AUTH_USER_AGENCY ([USER_ID], AG_ID)
                            SELECT @@DbPar@@UserId, authAg.AG_ID
                            FROM AUTH_AGENCY authAg
                            INNER JOIN @agencyTable ag
                            ON ag.ID_MSDB=authAg.ID_MSDB;

                            SELECT authAg.ID_MSDB
                            FROM AUTH_AGENCY authAg
                            INNER JOIN AUTH_USER_AGENCY userAg
                            ON authAg.AG_ID=userAg.AG_ID
                            WHERE userAg.[USER_ID]=@@DbPar@@UserId";
                case "ASSIGN_CATEGORY#MSSQL":
                    return $@"@@REPLACE_CREATE_TMPTABLE@@

                                @@REPLACE_INSERT_TMPTABLE@@

                                DELETE FROM AUTH_USER_CATEGORY WHERE [USER_ID]=@@DbPar@@UserId

                                INSERT INTO AUTH_USER_CATEGORY ([USER_ID], CAT_ID)
                                SELECT @@DbPar@@UserId, authCat.CAT_ID
                                FROM AUTH_CATEGORY authCat
                                INNER JOIN @categoryTable cat
                                ON cat.ID_MSDB=authCat.ID_MSDB;

                                SELECT authCat.ID_MSDB
                                FROM AUTH_CATEGORY authCat
                                INNER JOIN AUTH_USER_CATEGORY userCat
                                ON authCat.CAT_ID=userCat.CAT_ID
                                WHERE userCat.[USER_ID]=@@DbPar@@UserId";
                case "ASSIGN_CUBE#MSSQL":
                    return $@"@@REPLACE_CREATE_TMPTABLE@@

                            @@REPLACE_INSERT_TMPTABLE@@

                            DELETE FROM AUTH_USER_CUBE WHERE [USER_ID]=@@DbPar@@UserId

                            INSERT INTO AUTH_USER_CUBE ([USER_ID], CUBE_ID, FLG_IS_OWNER)
                            SELECT @@DbPar@@UserId, authCube.CUBE_ID, cat.IsOwner
                            FROM AUTH_CUBE authCube
                            INNER JOIN @cubeTable cat
                            ON cat.CODE=authCube.CODE;

                            SELECT authCube.CODE, userCube.FLG_IS_OWNER
                            FROM AUTH_CUBE authCube
                            INNER JOIN AUTH_USER_CUBE userCube
                            ON authCube.CUBE_ID=userCube.CUBE_ID
                            WHERE userCube.[USER_ID]=@@DbPar@@UserId";
                case "ASSIGN_FUNCTIONALITY#MSSQL":
                    return $@"@@REPLACE_CREATE_TMPTABLE@@

                            @@REPLACE_INSERT_TMPTABLE@@

                            DELETE FROM AUTH_USER_FUNCTIONALITY WHERE [USER_ID]=@@DbPar@@UserId

                            INSERT INTO AUTH_USER_FUNCTIONALITY ([USER_ID], FUNCT_ID)
                            SELECT @@DbPar@@UserId, authFunc.FUNCT_ID
                            FROM AUTH_FUNCTIONALITY authFunc
                            INNER JOIN @functionalityTable funcTb
                            ON funcTb.FUNCT_NAME=authFunc.FUNCT_NAME;

                            SELECT authFunc.FUNCT_NAME
                            FROM AUTH_FUNCTIONALITY authFunc
                            INNER JOIN AUTH_USER_FUNCTIONALITY userFunc
                            ON authFunc.FUNCT_ID=userFunc.FUNCT_ID
                            WHERE userFunc.[USER_ID]=@@DbPar@@UserId";
                case "ASSIGN_DATAFLOW#MSSQL":
                    return $@"@@REPLACE_CREATE_TMPTABLE@@

                            @@REPLACE_INSERT_TMPTABLE@@

                            DELETE userEnt
                            FROM AUTH_USER_ENTITY userEnt
                            LEFT JOIN ENTITY ent
                            ON ent.ID=userEnt.ENTITY_ID
                            WHERE (ent.ID IS NULL OR ent.Type='Dataflow') AND [USER_ID]=@@DbPar@@UserId

                            INSERT INTO AUTH_USER_ENTITY ([USER_ID], ENTITY_ID, IsOwner)
                            SELECT @@DbPar@@UserId, authEntity.ID, dataflowTb.IsOwner
                            FROM ENTITY authEntity
                            INNER JOIN @dataflowTable dataflowTb
                            ON dataflowTb.Identifier=authEntity.Identifier
                            WHERE authEntity.Type='Dataflow';

                            SELECT authEntity.Identifier, userEntity.IsOwner
                            FROM ENTITY authEntity
                            INNER JOIN AUTH_USER_ENTITY userEntity
                            ON authEntity.ID=userEntity.ENTITY_ID
                            WHERE userEntity.[USER_ID]=@@DbPar@@UserId AND authEntity.Type='Dataflow'";
                case "ASSIGN_METADATAFLOW#MSSQL":
                    return $@"@@REPLACE_CREATE_TMPTABLE@@

                            @@REPLACE_INSERT_TMPTABLE@@

                            DELETE userEnt
                            FROM AUTH_USER_ENTITY userEnt
                            LEFT JOIN ENTITY ent
                            ON ent.ID=userEnt.ENTITY_ID
                            WHERE (ent.ID IS NULL OR ent.Type='MetadataFlow') AND [USER_ID]=@@DbPar@@UserId

                            INSERT INTO AUTH_USER_ENTITY ([USER_ID], ENTITY_ID, IsOwner)
                            SELECT @@DbPar@@UserId, authEntity.ID, dataflowTb.IsOwner
                            FROM ENTITY authEntity
                            INNER JOIN @metadataflowTable dataflowTb
                            ON dataflowTb.Identifier=authEntity.Identifier
                            WHERE authEntity.Type='MetadataFlow';

                            SELECT authEntity.Identifier, userEntity.IsOwner
                            FROM ENTITY authEntity
                            INNER JOIN AUTH_USER_ENTITY userEntity
                            ON authEntity.ID=userEntity.ENTITY_ID
                            WHERE userEntity.[USER_ID]=@@DbPar@@UserId AND authEntity.Type='MetadataFlow'";
                case "ASSIGN_RULE#MSSQL":
                    return $@"@@REPLACE_CREATE_TMPTABLE@@

                                @@REPLACE_INSERT_TMPTABLE@@

                                DELETE FROM USER_PERMISSION WHERE [ID]=@@DbPar@@UserId

                                INSERT INTO USER_PERMISSION (ID, RULE_NAME)
                                SELECT @@DbPar@@UserId, userPerm.RULE_NAME
                                FROM ACCESS_RULE userPerm
                                INNER JOIN @ruleTable rules
                                ON rules.RULE_NAME=userPerm.RULE_NAME;

                                SELECT perm.RULE_NAME
                                FROM ACCESS_RULE perm
                                INNER JOIN USER_PERMISSION userPerm
                                ON perm.RULE_NAME=userPerm.RULE_NAME
                                WHERE userPerm.ID=@@DbPar@@UserId";
                case "USER_AGENCY#MSSQL":
                    return @"SELECT agency.ID_MSDB
                            FROM [SRI_USER] users
                            INNER JOIN [AUTH_USER_AGENCY] userAgency 
                            ON users.ID=userAgency.[USER_ID]
                            INNER JOIN [AUTH_AGENCY] agency
                            ON userAgency.AG_ID=agency.AG_ID
                            WHERE users.USERNAME=@@DbPar@@USERNAME
                            ORDER BY ID_MSDB";
                case "USER_DATAFLOW#MSSQL":
                    return @"SELECT entity.Identifier, userEntity.IsOwner
                            FROM [SRI_USER] users
                            INNER JOIN [AUTH_USER_ENTITY] userEntity
                            ON users.ID=userEntity.[USER_ID]
                            INNER JOIN [ENTITY] entity
                            ON userEntity.ENTITY_ID=entity.ID
                            WHERE users.USERNAME=@@DbPar@@USERNAME AND entity.Type='Dataflow'
                            ORDER BY Identifier";
                case "USER_METADATAFLOW#MSSQL":
                    return @"SELECT entity.Identifier, userEntity.IsOwner
                            FROM [SRI_USER] users
                            INNER JOIN [AUTH_USER_ENTITY] userEntity
                            ON users.ID=userEntity.[USER_ID]
                            INNER JOIN [ENTITY] entity
                            ON userEntity.ENTITY_ID=entity.ID
                            WHERE users.USERNAME=@@DbPar@@USERNAME AND entity.Type='MetadataFlow'
                            ORDER BY Identifier";
                case "USER_FUNCTIONALITY#MSSQL":
                    return @"WITH func_tree as (
                            SELECT func.FUNCT_NAME, func.PARENT_FUNCT_ID, func.FUNCT_ID
                            FROM [SRI_USER] users
                            INNER JOIN AUTH_USER_FUNCTIONALITY userFunc 
                            ON userFunc.USER_ID=users.ID
                            INNER JOIN AUTH_FUNCTIONALITY func
                            ON func.FUNCT_ID=userFunc.FUNCT_ID -- START POINT 
                            WHERE users.USERNAME=@@DbPar@@Username

                            UNION ALL

                            SELECT func.FUNCT_NAME, func.PARENT_FUNCT_ID, func.FUNCT_ID
                            FROM AUTH_FUNCTIONALITY func
                            JOIN func_tree parent ON parent.FUNCT_ID = func.PARENT_FUNCT_ID  
                            )
                            SELECT DISTINCT *
                            FROM func_tree";
                case "USER_RULES#MSSQL":
                    return @"SELECT permImp.IMPLIES_RULE_NAME AS RulesName
                            FROM SRI_USER users
                            INNER JOIN USER_PERMISSION perm 
                            ON perm.ID=users.ID
                            INNER JOIN ACCESS_RULE_IMPLICIT permImp 
                            ON permImp.RULE_NAME=perm.RULE_NAME
                            WHERE users.USERNAME=@@DbPar@@Username

                            UNION

                            SELECT DISTINCT perm.RULE_NAME AS RulesName
                            FROM SRI_USER users
                            INNER JOIN USER_PERMISSION perm 
                            ON perm.ID=users.ID
                            WHERE users.USERNAME=@@DbPar@@Username";
                case "USER_CATEGORY#MSSQL":
                    return @"WITH cat_tree as (
	                            SELECT cat.ID_MSDB AS CatCode, cat.PARENT_CAT_ID, cat.CAT_ID
	                            FROM SRI_USER users
	                            INNER JOIN AUTH_USER_CATEGORY userCat 
	                            ON userCat.USER_ID=users.ID
	                            INNER JOIN AUTH_CATEGORY cat
	                            ON cat.CAT_ID=userCat.CAT_ID -- START POINT 
	                            WHERE users.USERNAME=@@DbPar@@Username

	                            UNION ALL

	                            SELECT cat.ID_MSDB AS CatCode, cat.PARENT_CAT_ID, cat.CAT_ID
	                            FROM AUTH_CATEGORY cat
	                            JOIN cat_tree parent ON parent.CAT_ID = cat.PARENT_CAT_ID  
                            )
                            SELECT DISTINCT CatCode
                            FROM cat_tree";
                case "USER_CUBE#MSSQL":
                    return @"SELECT CODE AS CubeCode, userCube.FLG_IS_OWNER AS IsOwner
                            FROM SRI_USER users
                            INNER JOIN AUTH_USER_CUBE userCube
                            ON users.ID=userCube.USER_ID
                            INNER JOIN AUTH_CUBE iCube
                            ON userCube.CUBE_ID=iCube.CUBE_ID
                            WHERE users.USERNAME=@@DbPar@@USERNAME";
                case "USER_CUBE_UNION_CATEGORY#MSSQL":
                    return $@"@@REPLACE_TABLE_UNION@@

                                UNION

                                SELECT CODE AS CubeCode, CAST(0 AS bit) AS IsOwner
                                FROM AUTH_CUBE iCube
                                INNER JOIN AUTH_CATEGORY cat
                                ON cat.CAT_ID=iCube.CAT_ID
                                WHERE cat.ID_MSDB IN (@@REPLACE_INWHERE@@)

                                ORDER BY IsOwner DESC";
                case "HIERARCHY_CATEGORY#MSSQL":
                    return @"WITH cat_tree as (
	                            SELECT cat.ID_MSDB AS CatCode, cat.PARENT_CAT_ID, cat.CAT_ID, 0 AS TreeLevel
	                            FROM AUTH_CATEGORY cat -- START POINT 
	                            WHERE cat.PARENT_CAT_ID IS NULL

	                            UNION ALL

	                            SELECT cat.ID_MSDB AS CatCode, cat.PARENT_CAT_ID, cat.CAT_ID, parent.TreeLevel+1 AS TreeLevel
	                            FROM AUTH_CATEGORY cat
	                            JOIN cat_tree parent ON parent.CAT_ID = cat.PARENT_CAT_ID  
                            )
                            SELECT DISTINCT *
                            FROM cat_tree
                            ORDER BY TreeLevel, PARENT_CAT_ID";
                case "HIERARCHY_FUNCTIONALITY#MSSQL":
                    return @"WITH funct_tree as (
	                            SELECT funct.FUNCT_NAME AS FunctCode, funct.PARENT_FUNCT_ID, funct.FUNCT_ID, 0 AS TreeLevel
	                            FROM AUTH_FUNCTIONALITY funct -- START POINT 
	                            WHERE funct.PARENT_FUNCT_ID IS NULL

	                            UNION ALL

	                            SELECT funct.FUNCT_NAME AS FunctCode, funct.PARENT_FUNCT_ID, funct.FUNCT_ID, parent.TreeLevel+1 AS TreeLevel
	                            FROM AUTH_FUNCTIONALITY funct
	                            JOIN funct_tree parent ON parent.FUNCT_ID = funct.PARENT_FUNCT_ID  
                            )
                            SELECT DISTINCT *
                            FROM funct_tree
                            ORDER BY TreeLevel, PARENT_FUNCT_ID";
                case "HIERARCHY_CUBE#MSSQL":
                    return @";WITH cube_tree as (
	                            SELECT cat.ID_MSDB AS CatCode, cat.PARENT_CAT_ID, cat.CAT_ID, 0 AS TreeLevel
	                            FROM AUTH_CATEGORY cat -- START POINT 
	                            WHERE cat.PARENT_CAT_ID IS NULL

	                            UNION ALL

	                            SELECT cat.ID_MSDB AS CatCode, cat.PARENT_CAT_ID, cat.CAT_ID, parent.TreeLevel+1 AS TreeLevel
	                            FROM AUTH_CATEGORY cat
	                            JOIN cube_tree parent ON parent.CAT_ID = cat.PARENT_CAT_ID  
                            )
                            SELECT cubeTree.CatCode, cubeTree.PARENT_CAT_ID, cubeTree.CAT_ID, cubeTree.TreeLevel, iCube.CUBE_ID AS CubeId, iCube.CODE AS CubeCode
                            FROM cube_tree cubeTree
							LEFT JOIN AUTH_CUBE iCube
							ON iCube.CAT_ID=cubeTree.CAT_ID
                            ORDER BY TreeLevel, PARENT_CAT_ID";
                case "GET_USER_ACCOUNT#MSSQL":
                    return @"SELECT userAccount.[USERNAME], ISNULL(userAccount.[PASSWORD], ''), ISNULL(userAccount.[SALT], ''), ISNULL(userAccount.[ALGORITHM], ''), ISNULL(userAccount.[DEFAULT_STORE_ID], ''), userAccount.ID AS IdUser
                            FROM [SRI_USER] userAccount
                            WHERE userAccount.[USERNAME]=@@DbPar@@USERNAME";
                case "MERGE_AGENCY#MSSQL":
                    return $@"@@REPLACE_CREATE_TMPTABLE@@

                            @@REPLACE_INSERT_TMPTABLE@@

                            DELETE userAgency
                            FROM AUTH_USER_AGENCY userAgency
                            INNER JOIN AUTH_AGENCY iAgency
                            ON iAgency.AG_ID=userAgency.AG_ID
                            LEFT JOIN @agencyTable tmpAgency 
                            ON tmpAgency.ID_MSDB=iAgency.ID_MSDB
                            WHERE tmpAgency.ID_MSDB IS NULL

                            MERGE [AUTH_AGENCY] AS TARGET
                            USING @agencyTable AS SOURCE 
                            ON (TARGET.ID_MSDB = SOURCE.ID_MSDB) 
                            WHEN NOT MATCHED BY TARGET THEN 
                            INSERT (ID_MSDB) 
                            VALUES (SOURCE.ID_MSDB)
                            WHEN NOT MATCHED BY SOURCE THEN 
                            DELETE;";
                case "MERGE_DATAFLOW#MSSQL":
                    return $@"@@REPLACE_CREATE_TMPTABLE@@

                            @@REPLACE_INSERT_TMPTABLE@@

                            DELETE userEntity
                            FROM AUTH_USER_ENTITY userEntity
                            INNER JOIN ENTITY iEntity
                            ON iEntity.ID=userEntity.ENTITY_ID
                            LEFT JOIN @entityTable tmpEntity 
                            ON tmpEntity.Identifier=iEntity.Identifier
                            WHERE tmpEntity.Identifier IS NULL AND iEntity.Type='Dataflow'

                            MERGE [ENTITY] AS TARGET
                            USING @entityTable AS SOURCE 
                            ON (TARGET.Identifier = SOURCE.Identifier AND TARGET.Type='Dataflow') 
                            WHEN NOT MATCHED BY TARGET THEN 
                            INSERT (Identifier, Type) 
                            VALUES (SOURCE.Identifier, 'Dataflow')
                            WHEN NOT MATCHED BY SOURCE AND TARGET.Type='Dataflow' THEN 
                            DELETE;";
                case "MERGE_METADATAFLOW#MSSQL":
                    return $@"@@REPLACE_CREATE_TMPTABLE@@

                            @@REPLACE_INSERT_TMPTABLE@@

                            DELETE userEntity
                            FROM AUTH_USER_ENTITY userEntity
                            INNER JOIN ENTITY iEntity
                            ON iEntity.ID=userEntity.ENTITY_ID
                            LEFT JOIN @entityTable tmpEntity 
                            ON tmpEntity.Identifier=iEntity.Identifier
                            WHERE tmpEntity.Identifier IS NULL AND iEntity.Type='MetadataFlow'

                            MERGE [ENTITY] AS TARGET
                            USING @entityTable AS SOURCE 
                            ON (TARGET.Identifier = SOURCE.Identifier AND TARGET.Type='MetadataFlow') 
                            WHEN NOT MATCHED BY TARGET THEN 
                            INSERT (Identifier, Type) 
                            VALUES (SOURCE.Identifier, 'MetadataFlow')
                            WHEN NOT MATCHED BY SOURCE AND TARGET.Type='MetadataFlow' THEN 
                            DELETE;";
                case "CATEGORY_INSERT_UPDATE#MSSQL":
                    return @"IF ((SELECT COUNT(*) 
                                FROM AUTH_CATEGORY
                                WHERE ID_MSDB=@@DbPar@@ID_MSDB) 
                                > 0)
                                BEGIN
	                                UPDATE AUTH_CATEGORY SET PARENT_CAT_ID=@@DbPar@@PARENT_CAT_ID WHERE ID_MSDB=@@DbPar@@ID_MSDB
	                                SELECT CAT_ID FROM AUTH_CATEGORY WHERE ID_MSDB=@ID_MSDB
                                END
                                ELSE
                                BEGIN
	                                INSERT INTO AUTH_CATEGORY (ID_MSDB, PARENT_CAT_ID)
	                                OUTPUT Inserted.CAT_ID
	                                VALUES(@@DbPar@@ID_MSDB, @@DbPar@@PARENT_CAT_ID);
                                END";
                case "CATEGORY_DELETE_OLD#MSSQL":
                    return $@"@@REPLACE_CREATE_TMPTABLE@@

                            @@REPLACE_INSERT_TMPTABLE@@

                            DELETE FROM userCat
                            FROM AUTH_USER_CATEGORY userCat
                            INNER JOIN AUTH_CATEGORY cat
                            ON cat.CAT_ID=userCat.CAT_ID
                            LEFT JOIN @categoryTable tmpCat 
                            ON tmpCat.ID_MSDB=cat.ID_MSDB
                            WHERE tmpCat.ID_MSDB IS NULL

                            DELETE userCube
                            FROM AUTH_USER_CUBE userCube
                            INNER JOIN AUTH_CUBE iCube
                            ON userCube.CUBE_ID=iCube.CUBE_ID
                            INNER JOIN AUTH_CATEGORY cat
                            ON cat.CAT_ID=iCube.CAT_ID
                            LEFT JOIN @categoryTable tmpCat 
                            ON tmpCat.ID_MSDB=cat.ID_MSDB
                            WHERE tmpCat.ID_MSDB IS NULL

                            DELETE iCube
                            FROM AUTH_CUBE iCube
                            INNER JOIN AUTH_CATEGORY cat
                            ON cat.CAT_ID=iCube.CAT_ID
                            LEFT JOIN @categoryTable tmpCat 
                            ON tmpCat.ID_MSDB=cat.ID_MSDB
                            WHERE tmpCat.ID_MSDB IS NULL

                            DELETE FROM AUTH_CATEGORY WHERE ID_MSDB NOT IN (SELECT ID_MSDB FROM @categoryTable)";
                case "CUBE_INSERT_UPDATE#MSSQL":
                    return @"IF ((SELECT COUNT(*) 
                                    FROM AUTH_CUBE
                                    WHERE CODE=@@DbPar@@CODE) 
                                    > 0)
                                    BEGIN
	                                    UPDATE AUTH_CUBE SET CAT_ID=@CAT_ID WHERE CODE=@@DbPar@@CODE
                                    END
                                    ELSE
                                    BEGIN
	                                    INSERT INTO AUTH_CUBE (CODE, CAT_ID)
	                                    VALUES(@@DbPar@@CODE, @@DbPar@@CAT_ID);
                                    END";
                case "CUBE_DELETE_OLD#MSSQL":
                    return @"@@REPLACE_CREATE_TMPTABLE@@

                            @@REPLACE_INSERT_TMPTABLE@@

                            DELETE userCube
                            FROM AUTH_USER_CUBE userCube
                            INNER JOIN AUTH_CUBE iCube
                            ON iCube.CUBE_ID=userCube.CUBE_ID
                            LEFT JOIN @cubeTable tmpCube 
                            ON tmpCube.CODE=iCube.CODE
                            WHERE tmpCube.CODE IS NULL

                            DELETE FROM AUTH_CUBE WHERE CODE NOT IN (SELECT Code FROM @cubeTable)";
                case "COUNT_CONNECTIONSTRING#MSSQL":
                    return @"SELECT COUNT(*)
                            FROM AUTH_CONNECTION_STRING connStr
                            WHERE connStr.CONNECTION_ID IN (
	                            SELECT dbConn.MSDB_CONN AS ConnId
	                            FROM AUTH_DB_CONNECTION dbConn
	                            UNION
	                            SELECT dbConn.DDB_CONN AS ConnId
	                            FROM AUTH_DB_CONNECTION dbConn
	                            UNION
	                            SELECT dbConn.RMDB_CONN AS ConnId
	                            FROM AUTH_DB_CONNECTION dbConn
                            )";
                case "GET_MA_SID#MSSQL":
                    return "SELECT MA_SID FROM AUTH_DB_CONNECTION";
               
                case "INIZIALIZEAUTHDB#MSSQL":
                    return @"DECLARE @msdb BIGINT;
                            DECLARE @ddb BIGINT;
                            DECLARE @rmdb BIGINT;

                            DELETE FROM AUTH_DB_CONNECTION;
                            DELETE FROM AUTH_CONNECTION_STRING;
                            
                            IF (@msdbInsert = 1)
                            BEGIN
                                INSERT INTO AUTH_CONNECTION_STRING ([DB_NAME], DB_TYPE, [NAME], DB_PASSWORD, DB_PORT, DB_SERVER, DB_USER, ADO_CONNECTION_STRING)
                                VALUES (@@DbPar@@DB_NAME1, @@DbPar@@DB_TYPE1, @@DbPar@@NAME1, @@DbPar@@DB_PASSWORD1, @@DbPar@@DB_PORT1, @@DbPar@@DB_SERVER1, @@DbPar@@DB_USER1, @@DbPar@@ADO_CONNECTION_STRING1)
                                SELECT @msdb = CAST(SCOPE_IDENTITY() AS bigint)
                            END 

                            IF (@ddbInsert = 1)
                            BEGIN
                                INSERT INTO AUTH_CONNECTION_STRING ([DB_NAME], DB_TYPE, [NAME], DB_PASSWORD, DB_PORT, DB_SERVER, DB_USER, ADO_CONNECTION_STRING)
                                VALUES (@@DbPar@@DB_NAME2, @@DbPar@@DB_TYPE2, @@DbPar@@NAME2, @@DbPar@@DB_PASSWORD2, @@DbPar@@DB_PORT2, @@DbPar@@DB_SERVER2, @@DbPar@@DB_USER2, @@DbPar@@ADO_CONNECTION_STRING2)
                                SELECT @ddb = CAST(SCOPE_IDENTITY() AS bigint)
                            END

                            IF (@rmdbInsert = 1)
                            BEGIN
                                INSERT INTO AUTH_CONNECTION_STRING ([DB_NAME], DB_TYPE, [NAME], DB_PASSWORD, DB_PORT, DB_SERVER, DB_USER, ADO_CONNECTION_STRING)
                                VALUES (@@DbPar@@DB_NAME3, @@DbPar@@DB_TYPE3, @@DbPar@@NAME3, @@DbPar@@DB_PASSWORD3, @@DbPar@@DB_PORT3, @@DbPar@@DB_SERVER3, @@DbPar@@DB_USER3, @@DbPar@@ADO_CONNECTION_STRING3)
                                SELECT @rmdb = CAST(SCOPE_IDENTITY() AS bigint)
                            END

                            INSERT INTO AUTH_DB_CONNECTION (MSDB_CONN, DDB_CONN, RMDB_CONN, MA_SID) VALUES (@msdb, @ddb, @rmdb, @@DbPar@@MA_SID)";
                case "ADD_FUNCTIONALITY#MSSQL":
                    return @"DECLARE @functID int
                            SELECT @functID = FUNCT_ID
                            FROM AUTH_FUNCTIONALITY
                            WHERE FUNCT_NAME=@@DbPar@@FUNCT_NAME

                            IF (@functID IS NULL)
                            BEGIN 
	                            RETURN
                            END
    
                            IF ((SELECT COUNT(*) 
                            FROM AUTH_USER_FUNCTIONALITY
                            WHERE FUNCT_ID=@functID AND [USER_ID]=@@DbPar@@USER_ID) <= 0)
                            BEGIN
	                            INSERT INTO AUTH_USER_FUNCTIONALITY ([USER_ID], FUNCT_ID) VALUES (@@DbPar@@USER_ID, @functID)
                            END";
                case "ADD_AGENCY#MSSQL":
                    return @"DECLARE @agID int
                            SELECT @agID = AG_ID
                            FROM AUTH_AGENCY
                            WHERE ID_MSDB=@@DbPar@@ID_MSDB

                            IF (@agID = NULL)
                            BEGIN 
	                            RETURN
                            END

                            IF ((SELECT COUNT(*) 
                            FROM AUTH_USER_AGENCY
                            WHERE AG_ID=@agID AND [USER_ID]=@@DbPar@@USER_ID) <= 0)
                            BEGIN
	                            INSERT INTO AUTH_USER_AGENCY ([USER_ID], AG_ID) VALUES (@@DbPar@@USER_ID, @agID)
                            END";
                case "ADD_CATEGORY#MSSQL":
                    return @"DECLARE @catID int
                            SELECT @catID = CAT_ID
                            FROM AUTH_CATEGORY
                            WHERE ID_MSDB=@@DbPar@@CAT_NAME

                            IF (@catID IS NULL)
                            BEGIN 
	                            RETURN
                            END

                            IF ((SELECT COUNT(*) 
                            FROM AUTH_USER_CATEGORY
                            WHERE CAT_ID=@catID AND [USER_ID]=@@DbPar@@USER_ID) <= 0)
                            BEGIN
	                            INSERT INTO AUTH_USER_CATEGORY ([USER_ID], CAT_ID) VALUES (@@DbPar@@USER_ID, @catID)
                            END";
                case "ADD_CUBE#MSSQL":
                    return @"DECLARE @cubeID int
                            SELECT @cubeID = CUBE_ID
                            FROM AUTH_CUBE
                            WHERE CODE=@@DbPar@@CODE

                            IF (@cubeID IS NULL)
                            BEGIN 
	                            RETURN
                            END

                            DELETE FROM AUTH_USER_CUBE WHERE USER_ID=@@DbPar@@USER_ID AND CUBE_ID=@cubeID
                            INSERT INTO AUTH_USER_CUBE ([USER_ID], CUBE_ID, FLG_IS_OWNER) VALUES (@@DbPar@@USER_ID, @cubeID, @@DbPar@@FLG_IS_OWNER)";
                case "ADD_DATAFLOW#MSSQL":
                    return @"DECLARE @dataflowID int
                            SELECT @dataflowID = ID
                            FROM ENTITY
                            WHERE Identifier=@@DbPar@@Identifier

                            IF (@dataflowID IS NULL)
                            BEGIN 
	                            RETURN
                            END

                            DELETE FROM AUTH_USER_ENTITY WHERE USER_ID=@@DbPar@@USER_ID AND ENTITY_ID=@dataflowID
                            INSERT INTO AUTH_USER_ENTITY ([USER_ID], ENTITY_ID, IsOwner) VALUES (@@DbPar@@USER_ID, @dataflowID, @@DbPar@@IsOwner)";
                case "ADD_METADATAFLOW#MSSQL":
                    return @"DECLARE @metadataflowID int
                            SELECT @metadataflowID = ID
                            FROM ENTITY
                            WHERE Identifier=@@DbPar@@Identifier

                            IF (@metadataflowID IS NULL)
                            BEGIN 
	                            RETURN
                            END

                            DELETE FROM AUTH_USER_ENTITY WHERE USER_ID=@@DbPar@@USER_ID AND ENTITY_ID=@metadataflowID
                            INSERT INTO AUTH_USER_ENTITY ([USER_ID], ENTITY_ID, IsOwner) VALUES (@@DbPar@@USER_ID, @metadataflowID, @@DbPar@@IsOwner)";
                case "ADD_RULE#MSSQL":
                    return @"DECLARE @RULE_SELECT nvarchar(200)
                            SELECT @RULE_SELECT = RULE_NAME
                            FROM ACCESS_RULE
                            WHERE RULE_NAME=@@DbPar@@RULE_NAME

                            IF (@RULE_SELECT IS NULL)
                            BEGIN 
	                            RETURN
                            END

                            IF ((SELECT COUNT(*) 
                            FROM USER_PERMISSION
                            WHERE RULE_NAME=@RULE_SELECT AND ID=@@DbPar@@USER_ID) <= 0)
                            BEGIN
	                            INSERT INTO USER_PERMISSION (ID, RULE_NAME) VALUES (@@DbPar@@USER_ID, @RULE_SELECT)
                            END";
                case "GET_AGENCY_COUNT#MSSQL":
                    return @"SELECT COUNT(*)
                            FROM [AUTH_AGENCY]
                            WHERE ID_MSDB <> 'INIT_AGENCY'";
                case "SET_AGENCY_ADMIN#MSSQL":
                    return @"DECLARE @userId BIGINT
                            SELECT @userId = ID FROM SRI_USER WHERE USERNAME=@userAdmin

                            DELETE FROM AUTH_USER_AGENCY 
                            WHERE USER_ID=@userId

                            INSERT INTO AUTH_USER_AGENCY (USER_ID, AG_ID)
                            SELECT @userId AS USER_ID, ag.AG_ID
                            FROM AUTH_AGENCY ag"; 
                case "ALL_AGENCY#MSSQL":
                    return @"SELECT agency.ID_MSDB
                            FROM [AUTH_AGENCY] agency
                            ORDER BY ID_MSDB";
                case "ALL_DATAFLOW#MSSQL":
                    return @"SELECT ent.Identifier
                            FROM [ENTITY] ent
                            WHERE Type='Dataflow'
                            ORDER BY Identifier";
                case "ALL_METADATAFLOW#MSSQL":
                    return @"SELECT ent.Identifier
                            FROM [ENTITY] ent
                            WHERE Type='MetadataFLow'
                            ORDER BY Identifier";
                case "ALL_USER#MSSQL":
                    return @"SELECT users.USERNAME, userData.Email
                            FROM SRI_USER users
                            LEFT JOIN AUTH_USER_DATA userData
                            ON userData.USER_ID=users.ID";
                case "GET_OWNERS_CUBE#MSSQL":
                    return @"SELECT users.USERNAME, userData.Email
                            FROM [AUTH_CUBE] ent
                            INNER JOIN AUTH_USER_CUBE userEnt
                            ON userEnt.CUBE_ID=ent.CUBE_ID
                            INNER JOIN SRI_USER users
                            ON users.ID=userEnt.USER_ID
                            INNER JOIN AUTH_USER_DATA userData
                            ON userData.USER_ID=users.ID
                            WHERE ent.CODE=@@DbPar@@IDENTIFIER";
                case "GET_OWNERS_DATAFLOW#MSSQL":
                    return @"SELECT users.USERNAME, userData.Email
                            FROM ENTITY ent
                            INNER JOIN AUTH_USER_ENTITY userEnt
                            ON userEnt.ENTITY_ID=ent.ID
                            INNER JOIN SRI_USER users
                            ON users.ID=userEnt.USER_ID
                            INNER JOIN AUTH_USER_DATA userData
                            ON userData.USER_ID=users.ID
                            WHERE ent.Type='Dataflow' AND ent.Identifier=@@DbPar@@IDENTIFIER";
                case "GET_OWNERS_METADATAFLOW#MSSQL":
                    return @"SELECT users.USERNAME, userData.Email
                            FROM ENTITY ent
                            INNER JOIN AUTH_USER_ENTITY userEnt
                            ON userEnt.ENTITY_ID=ent.ID
                            INNER JOIN SRI_USER users
                            ON users.ID=userEnt.USER_ID
                            INNER JOIN AUTH_USER_DATA userData
                            ON userData.USER_ID=users.ID
                            WHERE ent.Type='MetadataFlow' AND ent.Identifier=@@DbPar@@IDENTIFIER";
                case "SET_OWNERS_CUBE#MSSQL":
                    return @"@@REPLACE_CREATE_TMPTABLE@@

                            @@REPLACE_INSERT_TMPTABLE@@

                            DELETE userEnt
                            FROM AUTH_CUBE ent
                            INNER JOIN AUTH_USER_CUBE userEnt
                            ON userEnt.CUBE_ID=ent.CUBE_ID
                            WHERE ent.CODE=@@DbPar@@EntityId

                            INSERT INTO AUTH_USER_CUBE (USER_ID, CUBE_ID, FLG_IS_OWNER)
                            SELECT allUser.ID AS USER_ID, ent.CUBE_ID AS CUBE_ID, CAST(1 AS bit) AS FLG_IS_OWNER
                            FROM SRI_USER allUser
                            INNER JOIN @usernameTable userTable
                            ON userTable.Username=allUser.USERNAME
                            INNER JOIN AUTH_CUBE ent
                            ON ent.CODE=userTable.EntityId";
                case "SET_OWNERS_DATAFLOW#MSSQL":
                    return @"@@REPLACE_CREATE_TMPTABLE@@

                            @@REPLACE_INSERT_TMPTABLE@@

                            DELETE userEnt
                            FROM ENTITY ent
                            INNER JOIN AUTH_USER_ENTITY userEnt
                            ON userEnt.ENTITY_ID=ent.ID
                            WHERE ent.Type='DataFlow' AND ent.Identifier=@@DbPar@@EntityId

                            INSERT INTO AUTH_USER_ENTITY (USER_ID, ENTITY_ID, IsOwner)
                            SELECT allUser.ID AS USER_ID, ent.ID AS ENTITY_ID, CAST(1 AS bit) AS IsOwner
                            FROM SRI_USER allUser
                            INNER JOIN @usernameTable userTable
                            ON userTable.Username=allUser.USERNAME
                            INNER JOIN ENTITY ent
                            ON ent.Identifier=userTable.EntityId
                            WHERE ent.Type='DataFlow';";
                case "SET_OWNERS_METADATAFLOW#MSSQL":
                    return @"@@REPLACE_CREATE_TMPTABLE@@

                            @@REPLACE_INSERT_TMPTABLE@@

                            DELETE userEnt
                            FROM ENTITY ent
                            INNER JOIN AUTH_USER_ENTITY userEnt
                            ON userEnt.ENTITY_ID=ent.ID
                            WHERE ent.Type='MetadataFlow' AND ent.Identifier=@@DbPar@@EntityId

                            INSERT INTO AUTH_USER_ENTITY (USER_ID, ENTITY_ID, IsOwner)
                            SELECT allUser.ID AS USER_ID, ent.ID AS ENTITY_ID, CAST(1 AS bit) AS IsOwner
                            FROM SRI_USER allUser
                            INNER JOIN @usernameTable userTable
                            ON userTable.Username=allUser.USERNAME
                            INNER JOIN ENTITY ent
                            ON ent.Identifier=userTable.EntityId
                            WHERE ent.Type='MetadataFlow';";
                case "ISAUTHDBINITIALIZED#MSSQL":
                    return "SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = N'SRI_USER'";
                case "ISAUTHDBEXTINITIALIZED#MSSQL":
                    return "SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = N'AUTH_USER_DATA'";
                case "ISAGENCYASSIGNTOANYUSER#MSSQL":
                    return @"SELECT COUNT(*) 
                            FROM AUTH_AGENCY ag
                            INNER JOIN AUTH_USER_AGENCY us
                            ON us.AG_ID = ag.AG_ID
                            WHERE ag.ID_MSDB = @AgencyCode";
                case "HAVE_DATAFLOW_OWNERSHIP#MSSQL":
                    return @"SELECT COUNT(*) 
                            FROM ENTITY ent
                            INNER JOIN AUTH_USER_ENTITY userEnt
                            ON userEnt.ENTITY_ID=ent.ID
                            WHERE ent.Identifier=@@DbPar@@IDENTIFIER AND ent.Type='Dataflow' AND userEnt.IsOwner=1";
                case "HAVE_METADATAFLOW_OWNERSHIP#MSSQL":
                    return @"SELECT COUNT(*) 
                            FROM ENTITY ent
                            INNER JOIN AUTH_USER_ENTITY userEnt
                            ON userEnt.ENTITY_ID=ent.ID
                            WHERE ent.Identifier=@@DbPar@@IDENTIFIER AND ent.Type='MetadataFlow' AND userEnt.IsOwner=1";
                case "DELETE_DDBDATAPERMISSION#MSSQL":
                    return @"DELETE FROM [AUTH_USER_CUBE];
                            DELETE FROM [AUTH_USER_CATEGORY];
                            DELETE FROM [AUTH_CUBE];
                            DELETE FROM [AUTH_CATEGORY];";
                default:
                    throw new NotImplementedException();
            }
        }


        #endregion

        #region Oracle Parsing

        //private OracleDbType ConvertEnumToOracle(GenericDbType dbType)
        //{
        //    switch (dbType)
        //    {
        //        case GenericDbType.VarChar:
        //            return OracleDbType.Varchar2;
        //        case GenericDbType.Int:
        //            return OracleDbType.Int32;
        //        case GenericDbType.BigInt:
        //            return OracleDbType.Int64;
        //        case GenericDbType.Bit:
        //            return OracleDbType.Boolean;
        //        default:
        //            return OracleDbType.Varchar2;
        //    }
        //}

        private string ConvertEnumToColumnOracle(GenericDbType dbType, int size = 0)
        {
            switch (dbType)
            {
                case GenericDbType.VarChar:
                    return $"ARCHAR2({size})";
                case GenericDbType.Int:
                    return "NUMBER(10)";
                case GenericDbType.BigInt:
                    return "NUMBER(19)";
                case GenericDbType.Bit:
                    return "NUMBER(1)";
                default:
                    return "CLOB"; //VarChar(max)
            }
        }

        #endregion

        private class Column
        {
            public string Name { get; set; }
            public GenericDbType DbType { get; set; }
            public int Size { get; set; }
        }

        private enum GenericDbType
        {
            VarChar,
            Int,
            BigInt,
            Bit
        }

        private enum Provider { MSSQL, ORACLE }

        private int DefaultServerDbPort
        {
            get
            {
                switch (_dbProvider)
                {
                    case Provider.MSSQL:
                        return 1433;
                    case Provider.ORACLE:
                        return 1521;
                    default:
                        return 1433;
                }
            }
        }

        private string saltGenerator()
        {
            RNGCryptoServiceProvider rng = new RNGCryptoServiceProvider();
            byte[] buffer = new byte[16];

            rng.GetBytes(buffer);
            return BitConverter.ToString(buffer).Replace("-", "");
        }

        public bool RemoveDDBDataPermission()
        {
            using (var connection = GetConnection(_config.CONN_STR))
            {
                connection.Open();

                var command = GetCommand(GetQuery("DELETE_DDBDATAPERMISSION"), connection);
                command.ExecuteNonQuery();
            }

            return true;
        }

        #endregion

    }
}

