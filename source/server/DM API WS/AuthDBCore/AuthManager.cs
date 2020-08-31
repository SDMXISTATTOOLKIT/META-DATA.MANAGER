using AuthCore.Interface;
using AuthCore.Model;
using AuthCore.Utils;
using Infrastructure.STLogging.Factory;
using Infrastructure.STLogging.Interface;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.Data.Common;
using System.Linq;
using System.Text;

namespace AuthCore
{
    public class AuthManager
    {
        readonly IOptionsMonitor<AuthAppOptions> _config;
        readonly IDBConnector _connector;
        readonly ISTLogger _logger;

        public AuthManager(IOptionsMonitor<AuthAppOptions> config)
        {
            _config = config;
            _logger = STLoggerFactory.Logger;
            _connector = new BaseDBConnector(config.CurrentValue, _logger);
        }

        public void SynchronizeAuthDB(List<string> listAgency, List<string> listDataflow, List<string> allMetadataFlow)
        {
            _connector.SynchronizeAuthDB(listAgency, listDataflow, allMetadataFlow);
        }

        public void SynchronizeAuthDB(bool syncCubeAndCategory, bool syncAgency, List<string> listAgency, bool syncDataflow, List<string> listDataflow, bool syncMetadataset, List<string> allMetadataFlow)
        {
            _connector.SynchronizeAuthDB(syncCubeAndCategory, syncAgency, listAgency, syncDataflow, listDataflow, syncMetadataset, allMetadataFlow);
        }

        public void ExtendAuthDb()
        {
            _connector.ExtendAuthDb();
        }

        /// <summary>
        /// Checks if user exist on AuthDb
        /// </summary>
        /// <param name="username"></param>
        /// <returns></returns>
        public long UserExists(string username)
        {
            return _connector.UserExists(username);
        }

        /// <summary>
        /// Create user on AuthDb
        /// </summary>
        /// <param name="user"></param>
        /// <returns></returns>
        public void CreateUser(IUserData user)
        {
            _connector.CreateUser(user);
        }

        /// <summary>
        /// Edit user on AuthDb
        /// </summary>
        /// <param name="user"></param>
        /// <returns></returns>
        public void UpdateUser(IUserData user)
        {
            if (_connector.UserExists(user.Username) <= 0)
            {
                throw GenericUtils.GetCustomException("USER_NOT_PRESENT",
                   @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - User not present in database", GenericUtils.LogLevelEnum.Error);
            }

            if (user.Password != null)
            {
                var passwordData = new User { Username = user.Username };
                _connector.GetUserAccount(passwordData);
                var currentConfig = _config.CurrentValue;
                user.Algorithm = passwordData.Algorithm ?? currentConfig.AlgorithmDefault;
                user.Salt = passwordData.Salt;
                user.Password = EncryptUtils.EncrypPassword(user.Password, passwordData.Salt, passwordData.Algorithm);
            }

            _connector.UpdateUser(user);
        }

        /// <summary>
        /// Delete user on AuthDb
        /// </summary>
        /// <param name="user"></param>
        /// <returns></returns>
        public bool DeleteUser(IUserData user)
        {
            return _connector.DeleteUser(user);
        }

        /// <summary>
        /// Assign agency at user on AuthDb
        /// </summary>
        /// <param name="user"></param>
        /// <returns></returns>
        public IUserData AssignsAgency(IUserData user)
        {
            var userId = _connector.UserExists(user.Username);
            if (userId <= 0)
            {
                return null;
            }
            user.Agencies = _connector.AssignsAgency(user.Agencies, userId);

            return user;
        }

        /// <summary>
        /// Assign category at user on AuthDb
        /// </summary>
        /// <param name="user"></param>
        /// <returns></returns>
        public IUserData AssignsCategory(IUserData user)
        {
            var userId = _connector.UserExists(user.Username);
            if (userId <= 0)
            {
                return null;
            }
            user.Category = _connector.AssignsCategory(user.Category, userId);

            return user;
        }

        /// <summary>
        /// Assign cube at user on AuthDb
        /// </summary>
        /// <param name="user"></param>
        /// <returns></returns>
        public IUserData AssignsCube(IUserData user)
        {
            var userId = _connector.UserExists(user.Username);
            if (userId <= 0)
            {
                return null;
            }

            var allCubes = new Dictionary<string, bool>();
            if (user.Cube != null || user.CubeOwner != null)
            {
                if (user.Cube != null)
                {
                    foreach (var item in user.Cube)
                    {
                        if (allCubes.ContainsKey(item))
                        {
                            allCubes.Add(item, false);
                        }
                    }
                }
                if (user.CubeOwner != null)
                {
                    foreach (var item in user.CubeOwner)
                    {
                        if (allCubes.ContainsKey(item))
                        {
                            allCubes.Add(item, true);
                        }
                    }
                }
                var resultCube = _connector.AssignsCube(allCubes, userId);

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
            }


            return user;
        }

        /// <summary>
        /// Assign cube at user on AuthDb
        /// </summary>
        /// <param name="user"></param>
        /// <returns></returns>
        public bool AssignCubeOwnership(string cubeCode, string username)
        {
            var userId = _connector.UserExists(username);
            if (userId <= 0)
            {
                return false;
            }
            _connector.AddCube(new List<string> { cubeCode }, userId, true);

            return true;
        }

        public bool HaveDataflowOwnership(string dataflow)
        {
            return _connector.HaveDataflowOwnership(dataflow);
        }

        public bool AssignDataflowOwnership(string dataflow, string username)
        {
            var userId = _connector.UserExists(username);
            if (userId <= 0)
            {
                return false;
            }
            _connector.AddDataflow(new List<string> { dataflow }, userId, true);

            return true;
        }

        public bool HaveMetadataFlowOwnership(string metadataflow)
        {
            return _connector.HaveMetadataFlowOwnership(metadataflow);
        }

        public bool AssignMetadataFlowOwnership(string metadataFlow, string username)
        {
            var userId = _connector.UserExists(username);
            if (userId <= 0)
            {
                return false;
            }
            _connector.AddMetadataFlow(new List<string> { metadataFlow }, userId, true);

            return true;
        }


        /// <summary>
        /// Assign functionality at user on AuthDb
        /// </summary>
        /// <param name="user"></param>
        /// <returns></returns>
        public IUserData AssignsFunctionality(IUserData user)
        {
            var userId = _connector.UserExists(user.Username);
            if (userId <= 0)
            {
                return null;
            }

            user.Functionality = _connector.AssignsFunctionality(user.Functionality, userId);

            return user;
        }

        public IUserData AssignsDataflow(IUserData user)
        {
            var userId = _connector.UserExists(user.Username);
            if (userId <= 0)
            {
                return null;
            }
            var dataflow = new Dictionary<string, bool>();
            foreach (var item in user.Dataflow)
            {
                dataflow.Add(item, false);
            }
            foreach (var item in user.DataflowOwner)
            {
                dataflow.Add(item, true);
            }
            dataflow = _connector.AssignsDataflow(dataflow, userId);

            user.Dataflow = new List<string>();
            user.DataflowOwner = new List<string>();
            foreach (var item in dataflow)
            {
                if (item.Value)
                {
                    user.DataflowOwner.Add(item.Key);
                }
                else
                {
                    user.Dataflow.Add(item.Key);
                }
            }

            return user;
        }

        public IUserData AssignsMetadataFlow(IUserData user)
        {
            var userId = _connector.UserExists(user.Username);
            if (userId <= 0)
            {
                return null;
            }

            var metadataset = new Dictionary<string, bool>();
            foreach (var item in user.MetadataFlow)
            {
                metadataset.Add(item, false);
            }
            foreach (var item in user.MetadataFlowOwner)
            {
                metadataset.Add(item, true);
            }
            metadataset = _connector.AssignsDataflow(metadataset, userId);

            user.Dataflow = new List<string>();
            user.DataflowOwner = new List<string>();
            foreach (var item in metadataset)
            {
                if (item.Value)
                {
                    user.MetadataFlowOwner.Add(item.Key);
                }
                else
                {
                    user.MetadataFlow.Add(item.Key);
                }
            }

            return user;
        }

        public IUserData AssignsAll(IUserData user)
        {
            var userId = _connector.UserExists(user.Username);
            if (userId <= 0)
            {
                return null;
            }
            user.Id = userId;
            return _connector.AssignsAll(user, userId);
        }

        public bool AddAgency(IUserData user)
        {
            var userId = _connector.UserExists(user.Username);
            if (userId <= 0)
            {
                return false;
            }
            _connector.AddAgency(user.Agencies, userId);

            return true;
        }

        public bool AddCategory(IUserData user)
        {
            var userId = _connector.UserExists(user.Username);
            if (userId <= 0)
            {
                return false;
            }
            _connector.AddCategory(user.Category, userId);

            return true;
        }

        public bool AddCube(string username, string cube, bool isOwner)
        {
            return AddCube(username, new List<string> { cube }, isOwner);
        }
        public bool AddCube(string username, List<string> cube, bool isOwner)
        {
            var userId = _connector.UserExists(username);
            if (userId <= 0)
            {
                return false;
            }
            _connector.AddCube(cube, userId, isOwner);

            return true;
        }

        public bool AddMetadataFlow(string username, string metadataflow, bool isOwner)
        {
            return AddMetadataFlow(username, new List<string> { metadataflow }, isOwner);
        }

        public bool AddMetadataFlow(string username, List<string> metadataflow, bool isOwner)
        {
            var userId = _connector.UserExists(username);
            if (userId <= 0)
            {
                return false;
            }
            _connector.AddMetadataFlow(metadataflow, userId, isOwner);

            return true;
        }

        public bool AddDataflow(string username, string dataflow, bool isOwner)
        {
            return AddDataflow(username, new List<string> { dataflow }, isOwner);
        }

        public bool AddDataflow(string username, List<string> dataflow, bool isOwner)
        {
            var userId = _connector.UserExists(username);
            if (userId <= 0)
            {
                return false;
            }
            _connector.AddDataflow(dataflow, userId, isOwner);

            return true;
        }


        public bool AddFunctionality(IUserData user)
        {
            var userId = _connector.UserExists(user.Username);
            if (userId <= 0)
            {
                return false;
            }

            _connector.AddFunctionality(user.Functionality, userId);

            return true;
        }

        public bool AddRule(IUserData user)
        {
            var userId = _connector.UserExists(user.Username);
            if (userId <= 0)
            {
                return false;
            }

            _connector.AddRule(user.Functionality, userId);

            return true;
        }

        public List<string> GetCategory(IUserData user)
        {
            return _connector.GetCategory(user.Username);
        }
        public List<string> GetCategory(string username)
        {
            return _connector.GetCategory(username);
        }
        public List<CategoryHierarchy> GetCategoryHierarchy()
        {
            return _connector.GetCategoryHierarchy();
        }

        public Dictionary<string, bool> GetCube(IUserData user)
        {
            return _connector.GetCube(user.Username, _connector.GetCategory(user.Username));
        }
        public Dictionary<string, bool> GetCube(string username)
        {
            return _connector.GetCube(username, _connector.GetCategory(username));
        }
        public List<CubeHierarchy> GetCubeHierarchy()
        {
            return _connector.GetCubeHierarchy();
        }

        public List<string> GetFunctionality(IUserData user)
        {
            return _connector.GetFunctionality(user.Username);
        }
        public List<string> GetFunctionality(string username)
        {
            return _connector.GetFunctionality(username);
        }
        public List<FunctionalityHierarchy> GetFunctionalityHierarchy()
        {
            return _connector.GetFunctionalityHierarchy();
        }

        public List<string> GetAgency(IUserData user)
        {
            return _connector.GetAgency(user.Username);
        }
        public List<string> GetAgency(string username)
        {
            return _connector.GetAgency(username);
        }
        public List<string> GetAllAgency()
        {
            return _connector.GetAllAgency();
        }
        public List<string> GetAllRules()
        {
            return _connector.GetAllRules();
        }
        public List<string> GetAllDataflow()
        {
            return _connector.GetAllDataflow();
        }
        public List<string> GetAllMetadataFlow()
        {
            return _connector.GetAllMetadataFlow();
        }

        public List<UsersDTO> GetUsers(string filterByUser)
        {
            return _connector.GetUsers(filterByUser);
        }

        /// <summary>
        /// Change password to user on AuthDb
        /// </summary>
        /// <param name="user"></param>
        /// <param name="newPassword"></param>
        /// <returns></returns>
        public bool ChangePassword(IUserData userData, string newPassword)
        {
            _connector.GetUserAccount(userData);

            if (userData == null)
            {
                throw GenericUtils.GetCustomException("USER_NOT_PRESENT",
                    @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - User not present in database", GenericUtils.LogLevelEnum.Error);
            }

            if (!string.IsNullOrWhiteSpace(newPassword))
            {
                var currentConfig = _config.CurrentValue;
                var algorit = userData.Algorithm ?? currentConfig.AlgorithmDefault;
                newPassword = EncryptUtils.EncrypPassword(newPassword, userData.Salt, algorit);

                var result = _connector.ChangePassword(newPassword, userData.Salt, algorit, userData.Id);

                return true;
            }
            return false;
        }

        /// <summary>
        /// Get data from user
        /// </summary>
        /// <param name="username"></param>
        /// <returns></returns>
        public bool GetUserData(IUserData userData)
        {
            var result = _connector.GetUserAccount(userData);
            if (!result)
            {
                return result;
            }
            return _connector.GetUserData(userData);
        }

        public Dictionary<string, string> GetOwners(string entity, string id)
        {
            return _connector.GetOwners(entity, id);
        }

        public List<string> GetRules(string username)
        {
            return _connector.GetRule(username);
        }

        public void SetOwners(string entity, string id, List<string> username)
        {
            _connector.SetOwners(entity, id, username);
        }

        /// <summary>
        /// generate a new password at user on AuthDb
        /// </summary>
        /// <param name="user"></param>
        /// <returns></returns>
        public bool RecoveryPassword(ISmtpClient smtpClient, IUserData userData)
        {
            var currentConfig = _config.CurrentValue;
            var userMailRecovery = userData.Email;
            var currentUser = _connector.GetUsers(userData.Username).FirstOrDefault();
            _connector.GetUserAccount(userData);

            if (userData == null || currentUser == null)
            {
                throw GenericUtils.GetCustomException("USER_NOT_PRESENT",
                    @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - User not present in database", GenericUtils.LogLevelEnum.Error);
            }

            if (!currentUser.Email.Equals(userMailRecovery, StringComparison.InvariantCultureIgnoreCase))
            {
                throw GenericUtils.GetCustomException("USER_NOT_PRESENT",
                    @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - User not present in database", GenericUtils.LogLevelEnum.Error);
            }

            var newPassword = generateRandomPassword(8);
            var algorit = userData.Algorithm ?? currentConfig.AlgorithmDefault;
            var cryptPassword = EncryptUtils.EncrypPassword(newPassword, userData.Salt, algorit);

            var result = _connector.ChangePassword(cryptPassword, userData.Salt, algorit, userData.Id);
            if (!result)
            {
                return false;
            }

            smtpClient.SendMailNewPassword(userData.Email, userData.Username, newPassword, userData.Language);

            return true;
        }

        public bool IsAuthDbInitialized()
        {
            return _connector.IsAuthDbInitialized();
        }

        public bool IsAuthDbExtInitialized()
        {
            return _connector.IsAuthDbExtInitialized();
        }

        public bool RemoveDDBDataPermission()
        {
            return _connector.RemoveDDBDataPermission();
        }

        #region Node Configuration

        public bool IsAuthDBConfigurated()
        {
            return _connector.IsAuthDBConfigurated();
        }

        public ResultInizializeCheckAuthDb InizializeAuthDb(string msdbConnectionString, string ddbConnectionString, string rmdbConnectionString, string maSidName)
        {
            _logger.Log($"AuthManager InizializeAuthDb Start", LogLevelEnum.Debug);

            var resultInizializeCheckAuthDb = new ResultInizializeCheckAuthDb();

            //CHECK MA SID
            _logger.Log($"InizializeAuthDb check ma sid", LogLevelEnum.Debug);

            var dbMasSid = GetMaSid();
            if (!string.IsNullOrWhiteSpace(dbMasSid) && !maSidName.Equals(dbMasSid))
            {
                resultInizializeCheckAuthDb.Invalid = true;
                resultInizializeCheckAuthDb.ErrorMessage.Add($"MASID_INVALID");
                return resultInizializeCheckAuthDb;
            }

            //CHECK MSDB
            if (msdbConnectionString != null)
            {
                _logger.Log($"BaseDBConnector InizializeAuthDb check msdb", LogLevelEnum.Debug);
                var msdbSqlConn = new DbConnectionStringBuilder();
                msdbSqlConn.ConnectionString = GetMsDBConnectionStringOrEmpty();
                var maSidConn = new DbConnectionStringBuilder();
                maSidConn.ConnectionString = msdbConnectionString;
                compareConnectionString(resultInizializeCheckAuthDb, "MSDB", msdbSqlConn, maSidConn, true);
            }

            //CHECK DDB
            _logger.Log($"BaseDBConnector InizializeAuthDb check ddb", LogLevelEnum.Debug);
            var ddbSqlConn = new DbConnectionStringBuilder();
            ddbSqlConn.ConnectionString = GetDDBConnectionStringOrEmpty();
            var ddbXmlConn = new DbConnectionStringBuilder();
            ddbXmlConn.ConnectionString = ddbConnectionString;
            if (!(string.IsNullOrWhiteSpace(ddbSqlConn?.ConnectionString) &&
                string.IsNullOrWhiteSpace(ddbXmlConn?.ConnectionString)))
            {
                compareConnectionString(resultInizializeCheckAuthDb, "DDB", ddbSqlConn, ddbXmlConn, true);
            }
            

            //CHECK RMDB
            _logger.Log($"BaseDBConnector InizializeAuthDb check rmdb", LogLevelEnum.Debug);
            var rmdbSqlConn = new DbConnectionStringBuilder();
            rmdbSqlConn.ConnectionString = GetRMDBConnectionStringOrEmpty();
            var rmdbXmlConn = new DbConnectionStringBuilder();
            rmdbXmlConn.ConnectionString = rmdbConnectionString;
            if (!(string.IsNullOrWhiteSpace(rmdbSqlConn?.ConnectionString) &&
                string.IsNullOrWhiteSpace(rmdbXmlConn?.ConnectionString)))
            {
                compareConnectionString(resultInizializeCheckAuthDb, "RMDB", rmdbSqlConn, rmdbXmlConn, true);
            }
            

            if (resultInizializeCheckAuthDb.Invalid)
            {
                return resultInizializeCheckAuthDb;
            }


            var msdb = new DbConnectionStringBuilder { ConnectionString = msdbConnectionString ?? "" };
            var ddb = new DbConnectionStringBuilder { ConnectionString = ddbConnectionString };
            var rmdb = new DbConnectionStringBuilder { ConnectionString = rmdbConnectionString };

            _connector.InizializeAuthDb(msdb, ddb, rmdb, maSidName);

            _logger.Log($"AuthManager InizializeAuthDb End", LogLevelEnum.Debug);
            return resultInizializeCheckAuthDb;
        }

        public ResultInizializeCheckAuthDb CheckAuthDB(string msdbConnectionString, string ddbConnectionString, string rmdbConnectionString, string maSidName)
        {
            _logger.Log($"AuthManager CheckAuthDB Start", LogLevelEnum.Debug);

            var resultCheckAuthDb = new ResultInizializeCheckAuthDb();

            //CHECK maSid
            _logger.Log($"BaseDBConnector CheckAuthDB check ma sid", LogLevelEnum.Debug);

            if (maSidName.Equals("TEST_ONLY_IF_AUTHDB_IS_INIZIALIZE", StringComparison.InvariantCultureIgnoreCase) && 
                string.IsNullOrWhiteSpace(GetMaSid()))
            {
                resultCheckAuthDb.Invalid = true;
                resultCheckAuthDb.ErrorMessage.Add("MASID_NOTPRESENT");
                return resultCheckAuthDb;
            }
            else if (!maSidName.Equals("TEST_ONLY_IF_AUTHDB_IS_INIZIALIZE", StringComparison.InvariantCultureIgnoreCase) &&
                    !maSidName.Equals(GetMaSid()))
            {
                resultCheckAuthDb.Invalid = true;
                resultCheckAuthDb.ErrorMessage.Add("MASID_INVALID");
                return resultCheckAuthDb;
            }

            //CHECK MSDB
            if (msdbConnectionString != null)
            {
                _logger.Log($"BaseDBConnector InizializeAuthDb check msdb", LogLevelEnum.Debug);
                var msdbSqlConn = new DbConnectionStringBuilder();
                msdbSqlConn.ConnectionString = GetMsDBConnectionString();
                var maSidConn = new DbConnectionStringBuilder();
                maSidConn.ConnectionString = msdbConnectionString;
                _logger.Log($"msdbSqlConn.ConnectionString" + msdbSqlConn.ConnectionString, LogLevelEnum.Debug);
                _logger.Log($"maSidConn.ConnectionString" + maSidConn.ConnectionString, LogLevelEnum.Debug);
                compareConnectionString(resultCheckAuthDb, "MSDB", msdbSqlConn, maSidConn, false);
            }

            //CHECK DDB
            _logger.Log($"BaseDBConnector InizializeAuthDb check ddb", LogLevelEnum.Debug);
            var ddbSqlConn = new DbConnectionStringBuilder();
            ddbSqlConn.ConnectionString = GetDDBConnectionString(true);
            if (!string.IsNullOrWhiteSpace(ddbConnectionString) || !string.IsNullOrWhiteSpace(ddbSqlConn.ConnectionString))
            {
                if ((!string.IsNullOrWhiteSpace(ddbConnectionString) && string.IsNullOrWhiteSpace(ddbSqlConn.ConnectionString)) ||
                    (string.IsNullOrWhiteSpace(ddbConnectionString) && !string.IsNullOrWhiteSpace(ddbSqlConn.ConnectionString)))
                {
                    resultCheckAuthDb.Invalid = true;
                    resultCheckAuthDb.ErrorMessage.Add($"INVALID_AUTHDB_CONFIGURATION");
                }
                else
                {
                    var ddbXmlConn = new DbConnectionStringBuilder();
                    ddbXmlConn.ConnectionString = ddbConnectionString;
                    _logger.Log($"ddbSqlConn.ConnectionString" + ddbSqlConn.ConnectionString, LogLevelEnum.Debug);
                    _logger.Log($"ddbXmlConn.ConnectionString" + ddbXmlConn.ConnectionString, LogLevelEnum.Debug);
                    compareConnectionString(resultCheckAuthDb, "DDB", ddbSqlConn, ddbXmlConn, false);
                }
            }


            //CHECK RMDB
            _logger.Log($"BaseDBConnector InizializeAuthDb check rmdb", LogLevelEnum.Debug);
            var rmdbSqlConn = new DbConnectionStringBuilder();
            rmdbSqlConn.ConnectionString = GetRMDBConnectionString(true);
            if (!string.IsNullOrWhiteSpace(rmdbConnectionString) || !string.IsNullOrWhiteSpace(rmdbSqlConn.ConnectionString))
            {
                if ((!string.IsNullOrWhiteSpace(rmdbConnectionString) && string.IsNullOrWhiteSpace(rmdbSqlConn.ConnectionString)) ||
                    (string.IsNullOrWhiteSpace(rmdbConnectionString) && !string.IsNullOrWhiteSpace(rmdbSqlConn.ConnectionString)))
                {
                    resultCheckAuthDb.Invalid = true;
                    resultCheckAuthDb.ErrorMessage.Add($"INVALID_AUTHDB_CONFIGURATION");
                }
                else
                {
                    var rmdbXmlConn = new DbConnectionStringBuilder();
                    rmdbXmlConn.ConnectionString = rmdbConnectionString;
                    _logger.Log($"rmdbSqlConn.ConnectionString" + rmdbSqlConn.ConnectionString, LogLevelEnum.Debug);
                    _logger.Log($"rmdbXmlConn.ConnectionString" + rmdbXmlConn.ConnectionString, LogLevelEnum.Debug);
                    compareConnectionString(resultCheckAuthDb, "RMDB", rmdbSqlConn, rmdbXmlConn, false);
                }
            }



            _logger.Log($"AuthManager CheckAuthDB End", LogLevelEnum.Debug);
            return resultCheckAuthDb;
        }

        public string GetDDBConnectionString(bool allowNullString)
        {
            return _connector.GetDDBConnectionString(allowNullString);
        }

        public string GetRMDBConnectionString(bool allowNullString)
        {
            return _connector.GetRMDBConnectionString(allowNullString);
        }

        public string GetMsDBConnectionString()
        {
            return _connector.GetMsDBConnectionString();
        }

        public string GetDDBConnectionStringOrEmpty()
        {
            try
            {
                return _connector.GetDDBConnectionString(false);
            }
            catch (Exception ex)
            {
                if (ex.Message.Equals("DDB_CONFIG_ERROR"))
                {
                    return "";
                }
                throw;
            }
        }

        public string GetRMDBConnectionStringOrEmpty()
        {
            try
            {
                return _connector.GetRMDBConnectionString(false);
            }
            catch (Exception ex)
            {
                if (ex.Message.Equals("RMDB_CONFIG_ERROR"))
                {
                    return "";
                }
                throw;
            }
        }

        public string GetMsDBConnectionStringOrEmpty()
        {
            try
            {
                return _connector.GetMsDBConnectionString();
            }
            catch (Exception ex)
            {
                if (ex.Message.Equals("MSDB_CONFIG_ERROR"))
                {
                    return "";
                }
                throw;
            }
        }

        public string GetMaSid()
        {
            return _connector.GetMaSid();
        }

        public bool IsAgencyAssignToAnyUser(string agencyCode)
        {
            return _connector.IsAgencyAssignToAnyUser(agencyCode);
        }

        public string GetCubeCodeFromId(long cubeId)
        {
            return _connector.GetCubeCodeFromId(cubeId);
        }

        #endregion

        /// <summary>
        /// Generate a random password
        /// </summary>
        /// <param name="length"></param>
        /// <param name="nonAlphanumeric"></param>
        /// <param name="digit"></param>
        /// <param name="lowercase"></param>
        /// <param name="uppercase"></param>
        /// <returns></returns>
        private string generateRandomPassword(int length, bool nonAlphanumeric = true, bool digit = true, bool lowercase = true, bool uppercase = true)
        {
            var password = new StringBuilder();
            var random = new Random();

            while (password.Length < length)
            {
                char c = (char)random.Next(32, 126);

                password.Append(c);

                if (char.IsDigit(c))
                    digit = false;
                else if (char.IsLower(c))
                    lowercase = false;
                else if (char.IsUpper(c))
                    uppercase = false;
                else if (!char.IsLetterOrDigit(c))
                    nonAlphanumeric = false;
            }

            if (nonAlphanumeric)
                password.Append((char)random.Next(33, 48));
            if (digit)
                password.Append((char)random.Next(48, 58));
            if (lowercase)
                password.Append((char)random.Next(97, 123));
            if (uppercase)
                password.Append((char)random.Next(65, 91));

            return password.ToString();
        }

        /// <summary>
        /// Compares connection string and puts the differences in ResultInizializeCheckAuthDb 
        /// </summary>
        /// <returns></returns>
        private void compareConnectionString(ResultInizializeCheckAuthDb resultInizializeCheckAuthDb, string dbType, DbConnectionStringBuilder source, DbConnectionStringBuilder target, bool checkForInizialize)
        {
            if ((source == null || string.IsNullOrWhiteSpace(source.ConnectionString))
                && checkForInizialize
                )
            { //Inizializes it's true in case of Empty string on AuthDb
                _logger.Log($"compareConnectionString return in first step", LogLevelEnum.Debug);
                return;
            }

            //Each file must be have a identical value for Data Source, Initial Catalog, User ID, Port
            if (source.ContainsKey("Data Source") && target.ContainsKey("Data Source"))
            {
                if (!((string)source["Data Source"]).Equals((string)target["Data Source"], StringComparison.InvariantCultureIgnoreCase))
                {
                    resultInizializeCheckAuthDb.Invalid = true;
                    resultInizializeCheckAuthDb.ErrorMessage.Add($"INVALID_AUTHDB_CONFIGURATION");
                    _logger.Log($"compareConnectionString return  FALSE Data Source0", LogLevelEnum.Debug);
                }
            }
            else if (!source.ContainsKey("Data Source") && target.ContainsKey("Data Source"))
            {
                resultInizializeCheckAuthDb.Invalid = true;
                resultInizializeCheckAuthDb.ErrorMessage.Add($"INVALID_AUTHDB_CONFIGURATION");
                _logger.Log($"compareConnectionString return  FALSE Data Source1", LogLevelEnum.Debug);
            }
            else if (source.ContainsKey("Data Source") && !target.ContainsKey("Data Source"))
            {
                resultInizializeCheckAuthDb.Invalid = true;
                resultInizializeCheckAuthDb.ErrorMessage.Add($"INVALID_AUTHDB_CONFIGURATION");
                _logger.Log($"compareConnectionString return  FALSE Data Source2", LogLevelEnum.Debug);
            }
            if (source.ContainsKey("Initial Catalog") && target.ContainsKey("Initial Catalog"))
            {
                if (!((string)source["Initial Catalog"]).Equals((string)target["Initial Catalog"], StringComparison.InvariantCultureIgnoreCase))
                {
                    resultInizializeCheckAuthDb.Invalid = true;
                    resultInizializeCheckAuthDb.ErrorMessage.Add($"INVALID_AUTHDB_CONFIGURATION");
                    _logger.Log($"compareConnectionString return  FALSE Initial Catalog0", LogLevelEnum.Debug);
                }
            }
            else if (!source.ContainsKey("Initial Catalog") && target.ContainsKey("Initial Catalog"))
            {
                resultInizializeCheckAuthDb.Invalid = true;
                resultInizializeCheckAuthDb.ErrorMessage.Add($"INVALID_AUTHDB_CONFIGURATION");
                _logger.Log($"compareConnectionString return  FALSE Initial Catalog1", LogLevelEnum.Debug);
            }
            else if (source.ContainsKey("Initial Catalog") && !target.ContainsKey("Initial Catalog"))
            {
                resultInizializeCheckAuthDb.Invalid = true;
                resultInizializeCheckAuthDb.ErrorMessage.Add($"INVALID_AUTHDB_CONFIGURATION");
                _logger.Log($"compareConnectionString return  FALSE Initial Catalog2", LogLevelEnum.Debug);
            }
            if (source.ContainsKey("User ID") && target.ContainsKey("User ID"))
            {
                if (!((string)source["User ID"]).Equals((string)target["User ID"], StringComparison.InvariantCultureIgnoreCase))
                {
                    resultInizializeCheckAuthDb.Invalid = true;
                    resultInizializeCheckAuthDb.ErrorMessage.Add($"INVALID_AUTHDB_CONFIGURATION");
                    _logger.Log($"compareConnectionString return  FALSE User ID 1", LogLevelEnum.Debug);
                }
            }
            else if (!source.ContainsKey("User ID") && target.ContainsKey("User ID"))
            {
                resultInizializeCheckAuthDb.Invalid = true;
                resultInizializeCheckAuthDb.ErrorMessage.Add($"INVALID_AUTHDB_CONFIGURATION");
                _logger.Log($"compareConnectionString return  FALSE User ID2", LogLevelEnum.Debug);
            }
            else if (source.ContainsKey("User ID") && !target.ContainsKey("User ID"))
            {
                resultInizializeCheckAuthDb.Invalid = true;
                resultInizializeCheckAuthDb.ErrorMessage.Add($"INVALID_AUTHDB_CONFIGURATION");
                _logger.Log($"compareConnectionString return  FALSE User ID", LogLevelEnum.Debug);
            }
            if (source.ContainsKey("Port") && target.ContainsKey("Port"))
            {
                if (!source["Port"].Equals(target["Port"]))
                {
                    resultInizializeCheckAuthDb.Invalid = true;
                    resultInizializeCheckAuthDb.ErrorMessage.Add($"INVALID_AUTHDB_CONFIGURATION");
                    _logger.Log($"compareConnectionString return  FALSE Port1", LogLevelEnum.Debug);
                }
            }
            else if (!source.ContainsKey("Port") && target.ContainsKey("Port"))
            {
                resultInizializeCheckAuthDb.Invalid = true;
                resultInizializeCheckAuthDb.ErrorMessage.Add($"INVALID_AUTHDB_CONFIGURATION");
                _logger.Log($"compareConnectionString return  FALSE Port2", LogLevelEnum.Debug);
            }
            else if (source.ContainsKey("Port") && !target.ContainsKey("Port"))
            {
                resultInizializeCheckAuthDb.Invalid = true;
                resultInizializeCheckAuthDb.ErrorMessage.Add($"INVALID_AUTHDB_CONFIGURATION");
                _logger.Log($"compareConnectionString return  FALSE Port3", LogLevelEnum.Debug);
            }
        }

    }
}
