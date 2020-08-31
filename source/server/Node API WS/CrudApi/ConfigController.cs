using API.Security;
using AuthCore.Model;
using AuthCore.Utils;
using BusinessLogic;
using Connector.Connectors;
using DataModel;
using Infrastructure.STLogging.Factory;
using Infrastructure.STLogging.Interface;
using Infrastructure.Utils;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.IO;
using System.Net.Http;
using System.Security.Authentication;
using static BusinessLogic.ConfigManager;

namespace API
{
    /// <summary>
    /// Config API
    /// </summary>
    [ApiController]
    [Route("/")]
    [EnableCors("CustomPolicy")]
    public class ConfigController : ControllerBase
    {
        readonly IMemoryCache _memoryCache;
        readonly IConfiguration _configuration;
        readonly IHttpContextAccessor _contextAccessor;
        readonly ISTLogger _logger;

        /// <summary>
        /// Constructor
        /// </summary>
        public ConfigController(IMemoryCache memoryCache, IConfiguration configuration, IHttpContextAccessor contextAccessor)
        {
            _memoryCache = memoryCache;
            _configuration = configuration;
            _contextAccessor = contextAccessor;
            _logger = STLoggerFactory.Logger;
        }

        /// <summary>
        /// Gets a configuration for the client
        /// </summary>
        [HttpGet("AppConfig")]
        public ActionResult<ClientConfig> GetClientConfig()
        {
            return new ConfigManager(_configuration, _memoryCache).GetClientConfig();
        }

        /// <summary>
        /// Pings all endpoint for checking if they are up
        /// </summary>
        [HttpGet("Ping")]
        public ActionResult<bool> PingEndPoint()
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);
            var configManager = CreateConfigManager();
            var nodeConfig = configManager.GetConfiguration();

            var businessLogic = CreateBusinessLogic(nodeConfig);
            var resultPing = businessLogic.PingEndPoint();

            if (_contextAccessor.HttpContext.User.Identity.IsAuthenticated)
            {
                var result = businessLogic.CheckAuthDB(nodeConfig.Endpoint.MASid, true);
            }

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);
            return resultPing;
        }

        /// <summary>
        /// Checks if AuthDB is configured properly
        /// </summary>
        [HttpGet("Config/CheckAuthDB")]
        [Authorize]
        public ActionResult<ResultInizializeCheckAuthDb> CheckAuthDB()
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);
            var userService = new UserService(_contextAccessor);
            if (!userService.CheckSuperUser())
            {
                throw new AuthenticationException("UNAUTHORIZED");
            }

            NodeConfig checkNode = null;
            var bodyString = new StreamReader(Request.Body).ReadToEnd();
            if (!string.IsNullOrWhiteSpace(bodyString))
            { //Unauthenticated user must be pass Node in a body message
                checkNode = JsonConvert.DeserializeObject<NodeConfig>(bodyString);
            }

            var configManager = new ConfigManager(_configuration);
            var result = configManager.CheckAuthDB(checkNode, _memoryCache, _contextAccessor);

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);
            return result;
        }

        /// <summary>
        /// Gets all agencies assigned to a specific user
        /// </summary>
        [HttpGet("GetAgency/{username?}")]
        [Authorize]
        public ActionResult<List<string>> GetAgency(string username = "")
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            if (string.IsNullOrWhiteSpace(username) && HttpContext.User.Identity.IsAuthenticated)
            {
                var result = UserUtils.GetAgencies(HttpContext.User.Identity);
                LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);
                return result;
            }
            else if (string.IsNullOrWhiteSpace(username))
            {
                LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);
                return new List<string>();
            }

            var nodeConfig = CreateConfigManager().GetConfiguration();
            var businessLogic = CreateBusinessLogic(nodeConfig);
            var listAgency = businessLogic.GetUserAgency(username);

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);
            return listAgency;
        }

        /// <summary>
        /// Gets all dataflows assigned to a specific user
        /// </summary>
        [HttpGet("GetDataflow/{username?}")]
        [Authorize]
        public ActionResult<Dictionary<string, bool>> GetDataflow(string username = "")
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            if (string.IsNullOrWhiteSpace(username) && HttpContext.User.Identity.IsAuthenticated)
            {
                var result = UserUtils.GetDataflow(HttpContext.User.Identity);
                LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);
                return result;
            }
            else if (string.IsNullOrWhiteSpace(username))
            {
                LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);
                return new Dictionary<string, bool>();
            }

            var nodeConfig = CreateConfigManager().GetConfiguration();
            var businessLogic = CreateBusinessLogic(nodeConfig);
            var listDataflow = businessLogic.GetUserDataflow(username);

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);
            return listDataflow;
        }

        /// <summary>
        /// Gets all metadatasets assigned to a specific user
        /// </summary>
        [HttpGet("GetMetadataSet/{username?}")]
        [Authorize]
        public ActionResult<Dictionary<string, bool>> GetMetadataSet(string username = "")
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            if (string.IsNullOrWhiteSpace(username) && HttpContext.User.Identity.IsAuthenticated)
            {
                var result = UserUtils.GetMetadataFlow(HttpContext.User.Identity);
                LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);
                return result;
            }
            else if (string.IsNullOrWhiteSpace(username))
            {
                LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);
                return new Dictionary<string, bool>();
            }

            var nodeConfig = CreateConfigManager().GetConfiguration();
            var businessLogic = CreateBusinessLogic(nodeConfig);
            var listMetadataset = businessLogic.GetUserMetadataset(username);

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);
            return listMetadataset;
        }

        /// <summary>
        /// Gets all agencies
        /// </summary>
        [HttpGet("GetAllAgency")]
        [Authorize]
        public ActionResult<List<string>> GetAllAgency()
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            var nodeConfig = CreateConfigManager().GetConfiguration();
            var businessLogic = CreateBusinessLogic(nodeConfig);
            var listAgency = businessLogic.GetAllAgency();

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);
            return listAgency;
        }

        /// <summary>
        /// Gets all dataflows 
        /// </summary>
        [HttpGet("GetAllDataflow")]
        [Authorize]
        public ActionResult<List<string>> GetAllDataflow()
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            var nodeConfig = CreateConfigManager().GetConfiguration();
            var businessLogic = CreateBusinessLogic(nodeConfig);
            var listAgency = businessLogic.GetAllDataflow();

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);
            return listAgency;
        }

        /// <summary>
        /// Gets all metadataflows
        /// </summary>
        [HttpGet("GetAllMetadataFlow")]
        [Authorize]
        public ActionResult<List<string>> GetAllMetadataflow()
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            var nodeConfig = CreateConfigManager().GetConfiguration();
            var businessLogic = CreateBusinessLogic(nodeConfig);
            var listMetadataFlow = businessLogic.GetAllMetadataFlow();

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);
            return listMetadataFlow;
        }

        /// <summary>
        /// Gets all rules assigned to a specific user
        /// </summary>
        [HttpGet("GetAllRules")]
        [Authorize]
        public ActionResult<List<string>> GetAllRules()
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            var nodeConfig = CreateConfigManager().GetConfiguration();
            var businessLogic = CreateBusinessLogic(nodeConfig);
            var listAgency = businessLogic.GetAllRules();

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);
            return listAgency;
        }

        /// <summary>
        /// Gets all cubes assigned to a specific user
        /// </summary>
        [HttpGet("GetCube/{username?}")]
        [Authorize]
        public ActionResult<List<string>> GetCube(string username = "")
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            if (string.IsNullOrWhiteSpace(username) && HttpContext.User.Identity.IsAuthenticated)
            {
                var result = UserUtils.GetCube(HttpContext.User.Identity);
                LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);
                return result;
            }
            else if (string.IsNullOrWhiteSpace(username))
            {
                LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);
                return new List<string>();
            }

            var nodeConfig = CreateConfigManager().GetConfiguration();
            var businessLogic = CreateBusinessLogic(nodeConfig);
            var allCube = businessLogic.GetUserCube(username);

            var listCube = new List<string>();
            foreach (var itemCube in allCube)
            {
                listCube.Add(itemCube.Key);
            }

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);
            return listCube;
        }

        /// <summary>
        /// Gets cube hierarchy from the AuthDB
        /// </summary>
        [HttpGet("GetCubeHierarchy")]
        [Authorize]
        public ActionResult<string> GetCubeHierarchy()
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            string cubeHierarchy = null;
            if (HttpContext.User.Identity.IsAuthenticated)
            {
                var nodeConfig = CreateConfigManager().GetConfiguration();
                var businessLogic = CreateBusinessLogic(nodeConfig);

                cubeHierarchy = businessLogic.GetCubeHierarchy();
            }

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);
            return cubeHierarchy;
        }

        /// <summary>
        /// Gets all functionalities assigned to a specific user
        /// </summary>
        [HttpGet("GetFunctionality/{username?}")]
        [Authorize]
        public ActionResult<List<string>> GetFunctionality(string username = "")
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            if (string.IsNullOrWhiteSpace(username) && HttpContext.User.Identity.IsAuthenticated)
            {
                var result = UserUtils.GetFunctionality(HttpContext.User.Identity);
                LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);
                return result;
            }
            else if (string.IsNullOrWhiteSpace(username))
            {
                LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);
                return new List<string>();
            }

            var nodeConfig = CreateConfigManager().GetConfiguration();
            var businessLogic = CreateBusinessLogic(nodeConfig);
            var listFunctionality = businessLogic.GetUserFunctionality(username);

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);
            return listFunctionality;
        }

        /// <summary>
        /// Gets functionality hierarchy from AuthDB
        /// </summary>
        [HttpGet("GetFunctionalityHierarchy")]
        [Authorize]
        public ActionResult<string> GetFunctionalityHierarchy()
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            string categoryHierarchy = null;
            if (HttpContext.User.Identity.IsAuthenticated)
            {
                var nodeConfig = CreateConfigManager().GetConfiguration();
                var businessLogic = CreateBusinessLogic(nodeConfig);

                categoryHierarchy = businessLogic.GetFunctionalityHierarchy();
            }

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);
            return categoryHierarchy;
        }

        /// <summary>
        /// Gets all categories assigned to a specific user
        /// </summary>
        [HttpGet("GetCategory/{username?}")]
        [Authorize]
        public ActionResult<List<string>> GetCategory(string username = "")
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            if (string.IsNullOrWhiteSpace(username) && HttpContext.User.Identity.IsAuthenticated)
            {
                var result = UserUtils.GetCategory(HttpContext.User.Identity);
                LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);
                return result;
            }
            else if (string.IsNullOrWhiteSpace(username))
            {
                LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);
                return new List<string>();
            }

            var nodeConfig = CreateConfigManager().GetConfiguration();
            var businessLogic = CreateBusinessLogic(nodeConfig);
            var listCategory = businessLogic.GetUserCategory(username);

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);
            return listCategory;
        }

        /// <summary>
        /// Gets category hierarchy from AuthDB
        /// </summary>
        [HttpGet("GetCategoryHierarchy")]
        [Authorize]
        public ActionResult<string> GetCategoryHierarchy()
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            string categoryHierarchy = null;
            if (HttpContext.User.Identity.IsAuthenticated)
            {
                var nodeConfig = CreateConfigManager().GetConfiguration();
                var businessLogic = CreateBusinessLogic(nodeConfig);

                categoryHierarchy = businessLogic.GetCategoryHierarchy();
            }

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);
            return categoryHierarchy;
        }

        /// <summary>
        /// Assigns all data for a specific user on AuthDB
        /// </summary>
        [HttpPost("AssignsAll")]
        [Authorize]
        public ActionResult<UserDataDTO> AssignsAll(UserDataDTO userData)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            UserDataDTO userDataDTO = null;
            if (HttpContext.User.Identity.IsAuthenticated)
            {
                var nodeConfig = CreateConfigManager().GetConfiguration();
                var businessLogic = CreateBusinessLogic(nodeConfig);

                userDataDTO = businessLogic.AssignsAll(userData);

                if (_memoryCache != null)
                {
                    _memoryCache.Set($"timestamp{userData.Username}", DateTime.Now.Ticks);
                }
            }

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);
            return userDataDTO;
        }

        /// <summary>
        /// Assigns cube ownership for a specific user on AuthDB
        /// </summary>
        [HttpPost("AssignCubeOwnership/{cubeCode}/{username}")]
        [Authorize]
        public ActionResult<bool> AssignCube(string cubeCode, string username)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);
            bool result = false;
            if (HttpContext.User.Identity.IsAuthenticated)
            {
                var nodeConfig = CreateConfigManager().GetConfiguration();
                var businessLogic = CreateBusinessLogic(nodeConfig);

                result = businessLogic.AssignCubeOwnership(cubeCode, username);

                if (_memoryCache != null)
                {
                    _memoryCache.Set($"timestamp{username}", DateTime.Now.Ticks);
                }
            }

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);
            return result;
        }

        /// <summary>
        /// Gets all data assigned to a specific user
        /// </summary>
        [HttpGet("GetData/{username?}")]
        [Authorize]
        public UserDataDTO GetData(string username = "")
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            //if (string.IsNullOrWhiteSpace(username) && HttpContext.User.Identity.IsAuthenticated)
            //{
            //    var user = new UserDataDTO();
            //    user.Agencies = UserUtils.GetAgencies(HttpContext.User.Identity);
            //    user.Category = UserUtils.GetCategory(HttpContext.User.Identity);
            //    user.Functionality = UserUtils.GetFunctionality(HttpContext.User.Identity);
            //    user.Cube = UserUtils.GetCube(HttpContext.User.Identity);
            //    user.CubeOwner = UserUtils.GetCubeOwner(HttpContext.User.Identity);
            //    user.Rules = UserUtils.GetRules(HttpContext.User.Identity);
            //    user.Username = UserUtils.GetUsername(HttpContext.User.Identity);
            //    user.Email = UserUtils.GetUserEmail(HttpContext.User.Identity);

            //    var dataflows = UserUtils.GetDataflow(HttpContext.User.Identity);
            //    user.DataflowOwner = new List<string>();
            //    user.Dataflow = new List<string>();
            //    foreach (var item in dataflows)
            //    {
            //        if (item.Value)
            //        {
            //            user.DataflowOwner.Add(item.Key);
            //        }
            //        else
            //        {
            //            user.Dataflow.Add(item.Key);
            //        }
            //    }

            //    var metadataFlows = UserUtils.GetMetadataFlow(HttpContext.User.Identity);
            //    user.MetadataFlowOwner = new List<string>();
            //    user.MetadataFlow = new List<string>();
            //    foreach (var item in metadataFlows)
            //    {
            //        if (item.Value)
            //        {
            //            user.MetadataFlowOwner.Add(item.Key);
            //        }
            //        else
            //        {
            //            user.MetadataFlow.Add(item.Key);
            //        }
            //    }

            //    LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);
            //    return user;
            //}
            //else if (string.IsNullOrWhiteSpace(username))
            //{
            //    LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);
            //    return null;
            //}

            var nodeConfig = CreateConfigManager().GetConfiguration();
            var businessLogic = CreateBusinessLogic(nodeConfig);
            UserDataDTO userData = null;
            if (HttpContext.User.Identity.IsAuthenticated)
            {
                userData = businessLogic.GetData(username);
            }

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);
            return userData;
        }

        /// <summary>
        /// Gets all users on AuthDB
        /// </summary>
        [HttpGet("GetUsers")]
        [Authorize]
        public List<UsersDTO> GetUsers()
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            var nodeConfig = CreateConfigManager().GetConfiguration();
            var businessLogic = CreateBusinessLogic(nodeConfig);
            var usersData = businessLogic.GetUsers();

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);
            return usersData;
        }

        /// <summary>
        /// Gets all the owners for a specific entity id on the AuthDB
        /// </summary>
        [HttpGet("GetOwners/{entity}")]
        [Authorize]
        public EntityOwners GetOwners(string entity, string id)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            var nodeConfig = CreateConfigManager().GetConfiguration();
            var businessLogic = CreateBusinessLogic(nodeConfig);
            var entityOwners = businessLogic.GetOwners(entity, id);

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);
            return entityOwners;
        }

        /// <summary>
        /// Sets all owners for a specific entity id on the AuthDB
        /// </summary>
        [HttpPost("SetOwners")]
        [Authorize]
        public bool SetOwners(EntityOwners entityOwners)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            var nodeConfig = CreateConfigManager().GetConfiguration();
            var businessLogic = CreateBusinessLogic(nodeConfig);
            businessLogic.SetOwners(entityOwners);

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);
            return true;
        }

        /// <summary>
        /// Returns is agency assign to any user
        /// </summary>
        /// <returns></returns>
        [HttpGet("IsAgencyAssignToAnyUser/{agencyCode}/{nodeId?}")]
        public bool IsAgencyAssignToAnyUser(string agencyCode, string nodeId = null)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);
            var userService = new UserService(_contextAccessor);
            if (!userService.CheckSuperUser())
            {
                throw new AuthenticationException("UNAUTHORIZED");
            }

            NodeConfig checkNode = null;
            var bodyString = new StreamReader(Request.Body).ReadToEnd();
            if (!string.IsNullOrWhiteSpace(bodyString))
            { //Unauthenticated user must be pass Node in a body message
                checkNode = JsonConvert.DeserializeObject<NodeConfig>(bodyString);
            }
            else if (!string.IsNullOrWhiteSpace(nodeId))
            {
                checkNode = CreateConfigManager().GetConfiguration(nodeId);
            }

            var businessLogic = CreateBusinessLogic(checkNode);
            var result = businessLogic.IsAgencyAssignToAnyUser(agencyCode);

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);
            return result;
        }

        #region Super User

        /// <summary>
        /// Gets Config Data
        /// </summary>
        /// <param name="type">config type (app, nodes, referenceMetadata)</param>
        [HttpGet("Configuration/{type}")]
        public ActionResult<string> GetConfig(string type)
        {
            var configType = mapStringToConfigType(type);

            if (configType == ConfigType.Nodes || configType == ConfigType.Application)
            {
                var userService = new UserService(_contextAccessor);
                if (!userService.CheckSuperUser())
                {
                    throw new AuthenticationException("UNAUTHORIZED");
                }
            }

            return new ConfigManager(_configuration).GetConfig(configType);
        }

        /// <summary>
        /// Sets a new configuration
        /// </summary>
        /// <param name="type">config type (app, nodes, referenceMetadata)</param>
        [HttpPost("Configuration/{type}")]
        public ActionResult<string> SetConfig(string type)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            var userService = new UserService(_contextAccessor);
            if (!userService.CheckSuperUser())
            {
                throw new AuthenticationException("UNAUTHORIZED");
            }

            _memoryCache.Remove(type + "Config");

            string config = new StreamReader(Request.Body).ReadToEnd();

            bool result = new ConfigManager(_configuration).SetConfig(mapStringToConfigType(type), config);

            return JsonConvert.SerializeObject(result);
        }

        /// <summary>
        /// Sets a new configuration
        /// </summary>
        /// <param name="type">config type (app, nodes, referenceMetadata)</param>
        [HttpPost("AddAgencyToConfig/{nodeId}")]
        public ActionResult AddAgencyToConfig(string nodeId, [FromBody] DataModel.Agency agency)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            var userService = new UserService(_contextAccessor);
            if (!userService.CheckSuperUser())
            {
                throw new AuthenticationException("UNAUTHORIZED");
            }

            CreateConfigManager().AddAgencyToConfig(nodeId, agency);

            var result = new ContentResult();
            result.ContentType = "application/text";
            result.Content = "Agency add";
            result.StatusCode = 200;
            return result;
        }

        /// <summary>
        /// Gets the list of all Sid for the MA endpoint
        /// </summary>
        [HttpPost("Config/GetListMaSid/{username?}/{password?}")]
        public ActionResult<List<string>> GetListMaSid([FromBody] NodeConfig nodeConfigurationClient, string username = "", string password = "")
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            var userService = new UserService(_contextAccessor);
            if (!userService.CheckSuperUser())
            {
                throw new AuthenticationException("UNAUTHORIZED");
            }


            nodeConfigurationClient.General.Username = username;
            if (!string.IsNullOrWhiteSpace(password))
            {
                nodeConfigurationClient.General.Password = System.Text.Encoding.UTF8.GetString(Convert.FromBase64String(password));
            }
            var businessLogic = new BusinessLogic.Controller.BusinessLogic(nodeConfigurationClient, _configuration, _memoryCache, _contextAccessor);

            var result = businessLogic.GetListMaSid();

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);
            return result;
        }

        /// <summary>
        /// Saves a node 
        /// </summary>
        [HttpPost("Config/SaveNode/{username?}/{password?}")]
        public ActionResult<ResultInizializeCheckAuthDb> SaveNode([FromBody] NodeConfig nodeConfigurationClient, string username = "", string password = "")
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            var userService = new UserService(_contextAccessor);
            if (!userService.CheckSuperUser())
            {
                throw new AuthenticationException("UNAUTHORIZED");
            }

            if (string.IsNullOrWhiteSpace(nodeConfigurationClient.Endpoint.MASid))
            {
                nodeConfigurationClient.Endpoint.MASid = "MappingStoreServer";
            }

            if (_memoryCache != null)
            { //removes all Proxy HttpClient from Cache (mandatory, because the new configuration change Proxy we use the old version in Cache)
                _memoryCache.Remove(ProxyHttpClient.CalculateCacheKeyForEndpoint(nodeConfigurationClient.General.ID, EndPointType.SDMX));
                _memoryCache.Remove(ProxyHttpClient.CalculateCacheKeyForEndpoint(nodeConfigurationClient.General.ID, EndPointType.MA));
                _memoryCache.Remove(ProxyHttpClient.CalculateCacheKeyForEndpoint(nodeConfigurationClient.General.ID, EndPointType.DM));
            }

            nodeConfigurationClient.General.Username = username;
            var tmpProxySetting = nodeConfigurationClient.Endpoint.BypassCache;
            nodeConfigurationClient.Endpoint.BypassCache = true;
            if (!string.IsNullOrWhiteSpace(password))
            {
                nodeConfigurationClient.General.Password = System.Text.Encoding.UTF8.GetString(Convert.FromBase64String(password));
            }
            var businessLogic = new BusinessLogic.Controller.BusinessLogic(nodeConfigurationClient, _configuration, _memoryCache, _contextAccessor);
            businessLogic.ConfigureNameSpace();

            ResultInizializeCheckAuthDb result = null;
            try
            {
                result = businessLogic.InizializeAuthDb(nodeConfigurationClient.Endpoint.MASid, false);

                if (result.Invalid)
                {
                    foreach (var errorCode in result.ErrorMessage)
                    {
                        throw Utility.Utils.getCustomException(errorCode,
                               $"Metodo  {System.Reflection.MethodBase.GetCurrentMethod().Name} - {result.ErrorMessage}", LogLevelEnum.Error);
                    }
                    throw Utility.Utils.getCustomException("CHECKAUTHDB_UNKNOW_ERROR",
                               $"Metodo  {System.Reflection.MethodBase.GetCurrentMethod().Name} - Unknow Error", LogLevelEnum.Error);
                }

                if (!string.IsNullOrWhiteSpace(nodeConfigurationClient.Endpoint.MAEndpoint) && !string.IsNullOrWhiteSpace(nodeConfigurationClient.Endpoint.DMEndpoint))
                {
                    businessLogic.SynchronizeAuthDB();
                }

                nodeConfigurationClient.Endpoint.BypassCache = tmpProxySetting;
                CreateConfigManager().SaveSingleNode(nodeConfigurationClient, _memoryCache);
            }
            catch (AuthenticationException)
            {
                throw new AuthenticationException("NODE_UNAUTHORIZED");
            }
            catch (UnauthorizedAccessException)
            {
                throw new AuthenticationException("NODE_FORBIDDEN");
            }

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);
            return result;
        }

        /// <summary>
        /// Deletes a node 
        /// </summary>
        [HttpDelete("Config/DeleteNode/{nodeId}")]
        public ActionResult<bool> DeleteNode(string nodeId)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            var userService = new UserService(_contextAccessor);
            if (!userService.CheckSuperUser())
            {
                throw new AuthenticationException("UNAUTHORIZED");
            }

            CreateConfigManager().DeleteSingleNode(nodeId, _memoryCache);

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);
            return true;
        }

        /// <summary>
        /// Inizializes the AuthDb 
        /// </summary>
        [HttpPost("Config/InizializeAuthDb/{maSid}")]
        public ActionResult<ResultInizializeCheckAuthDb> InizializeAuthDb(string maSid)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);
            var userService = new UserService(_contextAccessor);
            if (!userService.CheckSuperUser())
            {
                throw new AuthenticationException("UNAUTHORIZED");
            }

            NodeConfig checkNode = null;
            var bodyString = new StreamReader(Request.Body).ReadToEnd();
            if (!string.IsNullOrWhiteSpace(bodyString))
            { //Unauthenticated user must be pass Node in a body message
                var nodeConfigSuperAdmin = JsonConvert.DeserializeObject<NodeConfigSuperAdmin>(bodyString);
                checkNode = nodeConfigSuperAdmin;
                checkNode.General.Username = nodeConfigSuperAdmin.Username;
                checkNode.General.Password = nodeConfigSuperAdmin.Password;
            }

            ResultInizializeCheckAuthDb result = null;
            try
            {
                var configManager = new ConfigManager(_configuration);
                result = configManager.InizializeAuthDb(checkNode, _memoryCache, _contextAccessor, maSid);
            }
            catch (AuthenticationException)
            {
                throw new AuthenticationException("NODE_UNAUTHORIZED");
            }
            catch (UnauthorizedAccessException)
            {
                throw new AuthenticationException("NODE_FORBIDDEN");
            }

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);
            return result;
        }

        /// <summary>
        /// Gets a list of MA Sid that can be used for the current endpoint configuration 
        /// </summary>
        [HttpGet("Config/GetListAvaiableMaSid")]
        public ActionResult<List<string>> GetListAvaiableMaSid()
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);
            var userService = new UserService(_contextAccessor);
            if (!userService.CheckSuperUser())
            {
                throw new AuthenticationException("UNAUTHORIZED");
            }

            NodeConfig checkNode = null;
            var bodyString = new StreamReader(Request.Body).ReadToEnd();
            if (!string.IsNullOrWhiteSpace(bodyString))
            { //Unauthenticated user must be pass Node in a body message
                var nodeConfigSuperAdmin = JsonConvert.DeserializeObject<NodeConfigSuperAdmin>(bodyString);
                checkNode = nodeConfigSuperAdmin;
                checkNode.General.Username = nodeConfigSuperAdmin.Username;
                checkNode.General.Password = nodeConfigSuperAdmin.Password;
            }

            List<string> result = null;
            try
            {
                var nodeConfig = CreateConfigManager().GetConfiguration();
                var businessLogic = CreateBusinessLogic(nodeConfig);

                result = businessLogic.GetListAvaiableMaSid();
            }
            catch (AuthenticationException)
            {
                throw new AuthenticationException("NODE_UNAUTHORIZED");
            }
            catch (UnauthorizedAccessException)
            {
                throw new AuthenticationException("NODE_FORBIDDEN");
            }

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);
            return result;
        }

        /// <summary>
        /// Sorts the configuration nodes
        /// </summary>
        [HttpPost("Config/SortConfiguration")]
        public ActionResult<bool> SortConfiguration([FromBody] List<string> orders)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);
            var userService = new UserService(_contextAccessor);
            if (!userService.CheckSuperUser())
            {
                throw new AuthenticationException("UNAUTHORIZED");
            }

            var result = CreateConfigManager().SortConfiguration(orders);

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);
            return result;
        }

        ///// <summary>
        ///// Gets the list of all Sid for the MA endpoint
        ///// </summary>
        //[HttpGet("Config/GetListMaSid")]
        //[Authorize]
        //public ActionResult<List<string>> GetListMaSid()
        //{
        //    LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

        //    var userService = new UserService(_contextAccessor);
        //    if (!userService.CheckSuperUser())
        //    {
        //        throw new AuthenticationException("UNAUTHORIZED");
        //    }

        //    var nodeConfig = new ConfigManager(_configuration, _memoryCache, _contextAccessor).GetConfiguration();
        //    var businessLogic = new BusinessLogic.Controller.BusinessLogic(nodeConfig, _configuration, _memoryCache, _contextAccessor);

        //    var result = businessLogic.GetListMaSid();

        //    LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);
        //    return result;
        //}

        /// <summary>
        /// Gets the connection string corrispondent to the MA Sid
        /// </summary>
        [HttpGet("Config/GetConnectionString/{maSid}")]
        [Authorize]
        public ActionResult<string> GetConnectionString(string maSid)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            var userService = new UserService(_contextAccessor);
            if (!userService.CheckSuperUser())
            {
                throw new AuthenticationException("UNAUTHORIZED");
            }

            string result = "";
            try
            {
                var nodeConfig = CreateConfigManager().GetConfiguration();
                var businessLogic = CreateBusinessLogic(nodeConfig);

                result = businessLogic.GetMAConnectionString(maSid).ConnectionString;
            }
            catch (AuthenticationException)
            {
                throw new AuthenticationException("NODE_UNAUTHORIZED");
            }
            catch (UnauthorizedAccessException)
            {
                throw new AuthenticationException("NODE_FORBIDDEN");
            }

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);
            return result;
        }

        /// <summary>
        /// Creates a user on AuthDb
        /// </summary>
        /// <param name="user">user data</param>
        /// <returns></returns>
        [HttpPost("Config/CreateUser")]
        [Authorize]
        public JsonResult CreateUser([FromBody] User user)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            var nodeConfig = CreateConfigManager().GetConfiguration();
            var businessLogic = CreateBusinessLogic(nodeConfig);
            var newUser = businessLogic.CreateUser(user);

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);
            return new JsonResult(newUser);
        }

        /// <summary>
        /// Delete a user on AuthDb
        /// </summary>
        /// <param name="username">username</param>
        /// <returns></returns>
        [HttpDelete("Config/DeleteUser/{username}")]
        [Authorize]
        public bool DeleteUser(string username)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);
            var nodeConfig = CreateConfigManager().GetConfiguration();
            var businessLogic = CreateBusinessLogic(nodeConfig);
            businessLogic.DeleteUser(new User { Username = username });
            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);
            return true;
        }

        /// <summary>
        /// Edits only user data and password (if not empty) on AuthDB
        /// </summary>
        /// <param name="user">user data</param>
        /// <returns></returns>
        [HttpPut("Config/UpdateUser")]
        [Authorize]
        public JsonResult EditUser([FromBody] User user)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            var nodeConfig = CreateConfigManager().GetConfiguration();
            var businessLogic = CreateBusinessLogic(nodeConfig);
            var editUser = businessLogic.UpdateUser(user);

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);
            return new JsonResult(editUser);
        }

        /// <summary>
        /// Changes user logged password
        /// </summary>
        [Authorize]
        [HttpPost("Config/ChangeMyPassword")]
        public IActionResult ChangeMyPassword([FromBody] User userData)
        {
            if (!UserUtils.GetUsername(HttpContext.User.Identity).Equals(userData.Username, StringComparison.InvariantCultureIgnoreCase))
            {
                return BadRequest();
            }
            var nodeConfig = CreateConfigManager().GetConfiguration();
            var businessLogic = CreateBusinessLogic(nodeConfig);

            businessLogic.ChangeMyPassword(userData.Username, userData.Password);

            return Ok();
        }


        /// <summary>
        /// Checks if SDMX WS is working
        /// </summary>
        [HttpGet("Config/CheckEndPointNSI/{nodeId}")]
        public ActionResult<bool> CheckEndPointNSI(string nodeId)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            var userService = new UserService(_contextAccessor);
            if (!userService.CheckSuperUser())
            {
                throw new AuthenticationException("UNAUTHORIZED");
            }

            var nodeConfig = CreateConfigManager().GetConfiguration(nodeId);
            var businessLogic = CreateBusinessLogic(nodeConfig);

            var result = businessLogic.CheckEndPointNSI();

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);
            return result;
        }

        /// <summary>
        /// Checks if MA is working
        /// </summary>
        [HttpGet("Config/CheckEndPointMA/{nodeId}")]
        public ActionResult<bool> CheckEndPointMA(string nodeId)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            var userService = new UserService(_contextAccessor);
            if (!userService.CheckSuperUser())
            {
                throw new AuthenticationException("UNAUTHORIZED");
            }

            var nodeConfig = CreateConfigManager().GetConfiguration(nodeId);
            var businessLogic = CreateBusinessLogic(nodeConfig);

            var result = businessLogic.CheckEndPointMA();

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);
            return result;
        }

        /// <summary>
        /// Checks if DM is working
        /// </summary>
        [HttpGet("Config/CheckEndPointDM/{nodeId}")]
        public ActionResult<bool> CheckEndPointDM(string nodeId)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            var userService = new UserService(_contextAccessor);
            if (!userService.CheckSuperUser())
            {
                throw new AuthenticationException("UNAUTHORIZED");
            }

            var nodeConfig = CreateConfigManager().GetConfiguration(nodeId);
            var businessLogic = CreateBusinessLogic(nodeConfig);

            var result = businessLogic.CheckEndPointDM();

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);
            return result;
        }

        /// <summary>
        /// Checks if SDMX WS is working
        /// </summary>
        [HttpPost("Config/CheckEndPointNSI")]
        public ActionResult<bool> CheckEndPointNSI([FromBody] NodeConfigDTO nodeConfigDTO)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            var userService = new UserService(_contextAccessor);
            if (!userService.CheckSuperUser())
            {
                throw new AuthenticationException("UNAUTHORIZED");
            }

            var nodeConfig = nodeConfigFromDTO(nodeConfigDTO);

            var businessLogic = CreateBusinessLogic(nodeConfig);
            var result = businessLogic.CheckEndPointNSI();

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);
            return result;
        }

        /// <summary>
        /// Checks if DM is working
        /// </summary>
        [HttpPost("Config/CheckEndPointMA")]
        public ActionResult<bool> CheckEndPointMA([FromBody] NodeConfigDTO nodeConfigDTO)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            var userService = new UserService(_contextAccessor);
            if (!userService.CheckSuperUser())
            {
                throw new AuthenticationException("UNAUTHORIZED");
            }

            var nodeConfig = nodeConfigFromDTO(nodeConfigDTO);

            var businessLogic = CreateBusinessLogic(nodeConfig);
            var result = businessLogic.CheckEndPointMA();

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);
            return result;
        }

        /// <summary>
        /// Checks if DM is working
        /// </summary>
        [HttpPost("Config/CheckEndPointDM")]
        public ActionResult<bool> CheckEndPointDM([FromBody] NodeConfigDTO nodeConfigDTO)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            var userService = new UserService(_contextAccessor);
            if (!userService.CheckSuperUser())
            {
                throw new AuthenticationException("UNAUTHORIZED");
            }

            var nodeConfig = nodeConfigFromDTO(nodeConfigDTO);

            var businessLogic = CreateBusinessLogic(nodeConfig);
            var result = businessLogic.CheckEndPointDM();

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);
            return result;
        }

        private NodeConfig nodeConfigFromDTO(NodeConfigDTO nodeConfigDTO)
        {
            var nodeConfig = new NodeConfig();
            nodeConfig.General = new NodeConfig.nGeneral();
            nodeConfig.General.Username = "";
            nodeConfig.Proxy = new NodeConfig.nProxy();
            nodeConfig.Proxy.Address = nodeConfigDTO.Address;
            nodeConfig.Proxy.Enabled = nodeConfigDTO.Enabled;
            nodeConfig.Proxy.Password = nodeConfigDTO.Password;
            nodeConfig.Proxy.Port = nodeConfigDTO.Port;
            nodeConfig.Proxy.Username = nodeConfigDTO.Username;
            nodeConfig.Proxy.UseSystemProxy = nodeConfigDTO.UseSystemProxy;
            nodeConfig.Endpoint = new NodeConfig.nEndpoint();
            nodeConfig.Endpoint.NSIEndpointType = nodeConfigDTO.NSIEndpointType ?? "SOAP";
            nodeConfig.Endpoint.NSIEndpoint = nodeConfigDTO.EndPointUrl;
            nodeConfig.Endpoint.MAEndpoint = nodeConfigDTO.EndPointUrl;
            nodeConfig.Endpoint.DMEndpoint = nodeConfigDTO.EndPointUrl;
            nodeConfig.Endpoint.PingArtefact = nodeConfigDTO.PingArtefact;
            nodeConfig.Endpoint.NSIReadOnlyUsername = nodeConfigDTO.NSIReadOnlyUsername;
            nodeConfig.Endpoint.NSIReadOnlyPassword = nodeConfigDTO.NSIReadOnlyPassword;
            nodeConfig.Endpoint.BypassCache = nodeConfigDTO.BypassCache;

            return nodeConfig;
        }

        #endregion

        private ConfigManager CreateConfigManager()
        {
            return new ConfigManager(_configuration, _memoryCache, _contextAccessor);
        }

        private BusinessLogic.Controller.BusinessLogic CreateBusinessLogic(NodeConfig nodeConfig)
        {
            return new BusinessLogic.Controller.BusinessLogic(nodeConfig, _configuration, _memoryCache, _contextAccessor);
        }

        private static ConfigType mapStringToConfigType(string str)
        {
            switch (str)
            {
                case "app":
                    return ConfigType.Application;
                case "nodes":
                    return ConfigType.Nodes;
                default:
                    return ConfigType.Application;
            }
        }
    }
}
