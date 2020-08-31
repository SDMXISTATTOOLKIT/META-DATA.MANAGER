using AuthCore.Model;
using Connector.Connectors;
using DataModel;
using Infrastructure.STLogging.Factory;
using Infrastructure.STLogging.Interface;
using Infrastructure.Utils;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Text;
using Utility;

namespace BusinessLogic
{
    public class ConfigManager
    {
        readonly IConfiguration _configuration;
        readonly IMemoryCache _memoryCache;
        readonly IHttpContextAccessor _contextAccessor;
        readonly ISTLogger _logger;

        public ConfigManager(IConfiguration configuration)
        {
            _configuration = configuration;
            _logger = STLoggerFactory.Logger;
        }
        public ConfigManager(IConfiguration configuration, IMemoryCache memoryCache)
        {
            _configuration = configuration;
            _memoryCache = memoryCache;
            _logger = STLoggerFactory.Logger;
        }
        public ConfigManager(IConfiguration configuration, IMemoryCache memoryCache, IHttpContextAccessor contextAccessor)
        {
            _configuration = configuration;
            _memoryCache = memoryCache;
            _contextAccessor = contextAccessor;
            _logger = STLoggerFactory.Logger;
        }


        public enum ConfigType
        {
            Application = 0,
            Nodes = 1
        };

        public string GetConfig(ConfigType type)
        {
            try
            {
                return File.ReadAllText(GetConfigFilePath(type));
            }
            catch (Exception ex)
            {
                throw Utility.Utils.getCustomException("CONFIG_GET_ERROR",
                   @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - " + ex.Message, Infrastructure.STLogging.Interface.LogLevelEnum.Error);
            }
        }

        public bool SetConfig(ConfigType type, string config)
        {
            try
            {
                // converto la stringa json in una nuova stringa json indentata
                string indentedConfig = "";
                if (type == ConfigType.Application)
                {
                    var obj = JsonConvert.DeserializeObject<AppConfig>(config);
                    configureApplication(obj);
                    indentedConfig = JsonConvert.SerializeObject(obj, Formatting.Indented);
                }
                else
                {
                    var obj = JsonConvert.DeserializeObject(config);
                    indentedConfig = JsonConvert.SerializeObject(obj, Formatting.Indented);
                }

                string filePath = GetConfigFilePath(type);

                // creo la cartella se non esiste
                new FileInfo(filePath).Directory.Create();

                // crea o sovrascrive il file
                File.WriteAllText(filePath, indentedConfig);

                return true;
            }
            catch (Exception ex)
            {
                throw Utility.Utils.getCustomException("CONFIG_SET_ERROR",
                   @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - " + ex.Message, Infrastructure.STLogging.Interface.LogLevelEnum.Error);
            }
        }

        private void configureApplication(AppConfig appConfig)
        {
            if (appConfig.SuperUserCredentials != null)
            {
                var currentConfig = GetAppConfig();
                foreach (var item in appConfig.SuperUserCredentials)
                {
                    if (!String.IsNullOrWhiteSpace(item.password))
                    { //Check if user set new password
                        if (!item.password.Equals(item.confirmPassword))
                        {
                            throw Utility.Utils.getCustomException("SUPERUSER_PASSWORD_NOTMATCH",
                   @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - Password and Confirm not match", Infrastructure.STLogging.Interface.LogLevelEnum.Error);
                        }

                        item.password = Encoding.UTF8.GetString(Convert.FromBase64String(item.password));
                        item.password = Utils.Encrypt(item.password, _configuration["ENCRYPTION_PASSW"]);
                        item.confirmPassword = item.password;
                    }
                    else
                    { //Read the current password from file and set
                        var userAdmin = currentConfig.SuperUserCredentials.FirstOrDefault(user => user.username.Equals(item.username, StringComparison.InvariantCultureIgnoreCase));
                        if (userAdmin != null)
                        {
                            item.password = userAdmin.password;
                        }
                        else
                        { //if user not exist on file, set blank password
                            item.password = "";
                        }
                    }
                }
            }
        }

        private string GetConfigFilePath(ConfigType type)
        {
            switch (type)
            {

                case ConfigType.Application:
                    return _configuration["APP_CONFIG_PATH"].ToString();
                case ConfigType.Nodes:
                    return _configuration["NODES_CONFIG_PATH"].ToString();
                default:
                    return _configuration["APP_CONFIG_PATH"].ToString();
            }
        }

        public ClientConfig GetClientConfig()
        {
            var nodes = GetAllConfigurations();
            var listNodes = new List<NodeConfigurationDto>();
            foreach (var itemNode in nodes)
            {
                if (itemNode.General.Invisible)
                {
                    continue;
                }
                listNodes.Add(new NodeConfigurationDto { General = itemNode.General, Endpoint = { DataExplorerBaseURL = itemNode.Endpoint.DataExplorerBaseURL, MAEndpoint = itemNode.Endpoint.MAEndpoint, MetadataBaseURL = itemNode.Endpoint.MetadataBaseURL, HaveDMWS = !string.IsNullOrWhiteSpace(itemNode.Endpoint.DMEndpoint) }, Dcatapit = itemNode.DcatApIt, AnnotationTabs = itemNode.AnnotationTabs, Annotations = itemNode.Annotations });
            }
            
            var appConfig = GetAppConfig();

            return new ClientConfig
            {
                Nodes = listNodes,
                UserInterface = appConfig.UserInterface,
                DataManagement = appConfig.DataManagement
            };
        }

        public AppConfig GetAppConfig()
        {
            AppConfig appConfig;
            if (_memoryCache == null)
            {
                appConfig = ReadAppConfigFromFile();
            }
            else
            {
                appConfig = _memoryCache.GetOrCreate<AppConfig>
                              ("appConfig", entry =>
                              {
                                  return ReadAppConfigFromFile();
                              });
            }

            if (appConfig.EndpointSetting == null)
            {
                appConfig.EndpointSetting = new AppConfig.EndpointSettings();
            }
            if (appConfig.EndpointSetting.DmTimeOut == 0)
            {
                appConfig.EndpointSetting.DmTimeOut = 120;
            }
            if (appConfig.EndpointSetting.MaTimeOut == 0)
            {
                appConfig.EndpointSetting.MaTimeOut = 120;
            }
            if (appConfig.EndpointSetting.NsiTimeOut == 0)
            {
                appConfig.EndpointSetting.NsiTimeOut = 120;
            }

            return appConfig;
        }

        private AppConfig ReadAppConfigFromFile()
        {
            using (var file = File.OpenText(GetConfigFilePath(ConfigType.Application)))
            {
                var serializer = new JsonSerializer();
                return (AppConfig)serializer.Deserialize(file, typeof(AppConfig));
            }
        }

        public NodeConfig GetConfiguration(string nodeId)
        {
            return getConfiguration(nodeId);
        }

        public NodeConfig GetConfiguration()
        {
            var nodeIdStr = "";
            if (_contextAccessor.HttpContext.User.Identity.IsAuthenticated)
            {
                var nodeIdClaim = _contextAccessor.HttpContext.User.Claims.FirstOrDefault(item => item.Type.Equals("nodeId"));
                if (nodeIdClaim != null && !String.IsNullOrWhiteSpace(nodeIdClaim.Value))
                {
                    nodeIdStr = nodeIdClaim.Value;
                }
            }
            else
            {
                nodeIdStr = _contextAccessor.HttpContext.Request.Headers["nodeId"];
            }

            if (string.IsNullOrWhiteSpace(nodeIdStr))
            {
                throw Utility.Utils.getCustomException("CONFIG_NODE_NOT_FOUND",
                       @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - Node not found.", Infrastructure.STLogging.Interface.LogLevelEnum.Error);
            }

            return getConfiguration(nodeIdStr);
        }

        private NodeConfig getConfiguration(string nodeId)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name, Infrastructure.STLogging.Interface.LogLevelEnum.Debug);

            List<NodeConfig> nodes = readNodesConfigJsonFromFile();

            if (nodes == null || nodes.Count == 0)
            {
                throw Utility.Utils.getCustomException("CONFIG_NODE_NOT_FOUND",
                       @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - Node not found.", Infrastructure.STLogging.Interface.LogLevelEnum.Error);
            }

            if (nodeId == null || String.IsNullOrWhiteSpace(nodeId))
            {
                throw Utility.Utils.getCustomException("CONFIG_NODE_NOT_FOUND",
                       @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - Node not found.", Infrastructure.STLogging.Interface.LogLevelEnum.Error);
            }

            var result = nodes.Find(node => node.General.ID.Equals(nodeId, StringComparison.InvariantCultureIgnoreCase));


            if (_contextAccessor != null && _contextAccessor.HttpContext.User.Identity.IsAuthenticated)
            {
                _logger.Log($"ConfigManager GetConfiguration user is authenticated", Infrastructure.STLogging.Interface.LogLevelEnum.Debug);

                var maSidClaim = _contextAccessor.HttpContext.User.Claims.FirstOrDefault(item => item.Type.Equals("MA_SID"));
                if (maSidClaim != null && !String.IsNullOrWhiteSpace(maSidClaim.Value))
                {
                    _logger.Log($"ConfigManager GetConfiguration find masid from claim with value {maSidClaim.Value}", Infrastructure.STLogging.Interface.LogLevelEnum.Debug);
                    result.Endpoint.MASid = maSidClaim.Value;
                }

                result.General.Username = "";
                var usernameClaim = _contextAccessor.HttpContext.User.Claims.FirstOrDefault(item => item.Type.Equals("username"));
                if (usernameClaim != null && !String.IsNullOrWhiteSpace(usernameClaim.Value))
                {
                    _logger.Log($"ConfigManager GetConfiguration find username from claim with value {usernameClaim.Value}", Infrastructure.STLogging.Interface.LogLevelEnum.Debug);
                    result.General.Username = usernameClaim.Value;
                }

                result.General.Password = "";
                var guidSessionClaim = _contextAccessor.HttpContext.User.Claims.FirstOrDefault(item => item.Type.Equals("guidSession"));
                if (guidSessionClaim != null && !String.IsNullOrWhiteSpace(guidSessionClaim.Value))
                {

                    _contextAccessor.HttpContext.Session.TryGetValue(Utils.EncodeMD5String(guidSessionClaim.Value), out byte[] sessionValueByte);
                    string sessionValue = null;
                    if (sessionValueByte != null)
                    {
                        sessionValue = Encoding.ASCII.GetString(sessionValueByte);
                    }
                    if (string.IsNullOrWhiteSpace(sessionValue))
                    {
                        throw Utility.Utils.getCustomException("CONFIG_NODE_SESSION_NOT_FOUND",
                       @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - Session Node not found.", Infrastructure.STLogging.Interface.LogLevelEnum.Error);
                    }
                    _logger.Log($"ConfigManager GetConfiguration find session from claim with value {sessionValue}", Infrastructure.STLogging.Interface.LogLevelEnum.Debug);
                    result.General.Password = Utils.Decrypt(sessionValue, _configuration["ENCRYPTION_PASSW"]);
                }
            }

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name, Infrastructure.STLogging.Interface.LogLevelEnum.Debug);
            return result;
        }

        public List<NodeConfig> GetAllConfigurations()
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name, Infrastructure.STLogging.Interface.LogLevelEnum.Debug);
            var nodes = readNodesConfigJsonFromFile();

            if (nodes == null)
            {
                return new List<NodeConfig>();
            }

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name, Infrastructure.STLogging.Interface.LogLevelEnum.Debug);
            return nodes;
        }

        public bool SortConfiguration(List<string> orders)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name, Infrastructure.STLogging.Interface.LogLevelEnum.Debug);

            if (orders == null)
            {
                return false;
            }

            var nodeSort = new Dictionary<string, bool>();
            var nodes = GetAllConfigurations();
            var orderNodes = new List<NodeConfig>();

            foreach (var node in nodes)
            {
                if (!nodeSort.ContainsKey(node.General.ID))
                {
                    nodeSort.Add(node.General.ID, false);
                }
            }

            //Create sort list
            foreach (var ord in orders)
            {
                foreach (var node in nodes)
                {
                    if (node.General.ID.Equals(ord))
                    {
                        orderNodes.Add(node);
                        nodeSort[node.General.ID] = true;
                        break;
                    }
                }
            }
            //Add all nodeId that aren't in Sort List (prevent missing confgiuration\lost node)
            foreach (var item in nodeSort)
            {
                if (!item.Value)
                {
                    foreach (var node in nodes)
                    {
                        if (node.General.ID.Equals(item.Value))
                        {
                            orderNodes.Add(node);
                            break;
                        }
                    }
                }
            }

            var result = SetConfig(ConfigType.Nodes, JsonConvert.SerializeObject(orderNodes));

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name, Infrastructure.STLogging.Interface.LogLevelEnum.Debug);
            return result;
        }

        private List<NodeConfig> readNodesConfigJsonFromFile()
        {
            using (var file = File.OpenText(GetConfigFilePath(ConfigType.Nodes)))
            {
                return JsonConvert.DeserializeObject<List<NodeConfig>>(file.ReadToEnd());
            }
        }

        public ResultInizializeCheckAuthDb CheckAuthDB(NodeConfig checkNode, IMemoryCache _memoryCache, IHttpContextAccessor _contextAccessor)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name, Infrastructure.STLogging.Interface.LogLevelEnum.Debug);

            if (checkNode != null)
            { //Popolate data for node to check
                _logger.Log($"CheckAuthDB take node from client data", Infrastructure.STLogging.Interface.LogLevelEnum.Debug);
            }
            else if (_contextAccessor.HttpContext.User.Identity.IsAuthenticated &&
                checkNode == null)
            { //check the node of current user logged
                _logger.Log($"CheckAuthDB take node from user logged", Infrastructure.STLogging.Interface.LogLevelEnum.Debug);
                checkNode = new ConfigManager(_configuration, _memoryCache, _contextAccessor).GetConfiguration();
            }
            else
            { //Error: checkNode is null and user not authenticated
                throw Utils.getCustomException("CHECKAUTHDB_NODE_NOTCONFIG",
                           @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - Node to be checked has not been configured.", Infrastructure.STLogging.Interface.LogLevelEnum.Error);
            }

            var businessLogic = new Controller.BusinessLogic(checkNode, _configuration, _memoryCache, _contextAccessor);
            var result = businessLogic.CheckAuthDB(checkNode.Endpoint.MASid, true);

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name, Infrastructure.STLogging.Interface.LogLevelEnum.Debug);
            return result;
        }

        public ResultInizializeCheckAuthDb InizializeAuthDb(NodeConfig checkNode, IMemoryCache _memoryCache, IHttpContextAccessor _contextAccessor, string maSid)
        {
            if (checkNode == null &&
                _contextAccessor.HttpContext.User.Identity.IsAuthenticated)
            { //check the node of current user logged
                checkNode = new ConfigManager(_configuration, _memoryCache, _contextAccessor).GetConfiguration();
            }
            else if (checkNode == null)
            { //Error: checkNode is null and user not authenticated
                throw Utils.getCustomException("CHECKAUTHDB_NODE_NOTCONFIG",
                           @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - Node to be checked has not been configured.", Infrastructure.STLogging.Interface.LogLevelEnum.Error);
            }

            var businessLogic = new Controller.BusinessLogic(checkNode, _configuration, _memoryCache, _contextAccessor);
            return businessLogic.InizializeAuthDb(maSid, false);
        }

        public void SaveSingleNode(NodeConfig nodeConfig, IMemoryCache memoryCache)
        {
            var nodes = readNodesConfigJsonFromFile();

            var elementIndex = -1;
            var findConfig = false;
            foreach (var item in nodes)
            {
                elementIndex++;
                if (item.General.ID.Equals(nodeConfig.General.ID, StringComparison.InvariantCultureIgnoreCase))
                {
                    findConfig = true;
                    break;
                }
            }

            if (findConfig)
            {
                nodes[elementIndex] = nodeConfig;
            }
            else
            {
                nodes.Insert(nodes.Count, nodeConfig);
            }

            SetConfig(ConfigType.Nodes, JsonConvert.SerializeObject(nodes));

            if (memoryCache != null)
            { //remove all Proxy HttpClient from Cache
                _memoryCache.Remove(ProxyHttpClient.CalculateCacheKeyForEndpoint($"{nodeConfig.General.ID}_", EndPointType.SDMX));
                _memoryCache.Remove(ProxyHttpClient.CalculateCacheKeyForEndpoint($"{nodeConfig.General.ID}_", EndPointType.MA));
                _memoryCache.Remove(ProxyHttpClient.CalculateCacheKeyForEndpoint($"{nodeConfig.General.ID}_", EndPointType.DM));

                string cachedUser = "";
                _memoryCache.TryGetValue("CachedUser", out cachedUser);
                if (!string.IsNullOrWhiteSpace(cachedUser))
                {
                    var users = cachedUser.Split(";");
                    foreach (var item in users)
                    {
                        _memoryCache.Remove(ProxyHttpClient.CalculateCacheKeyForEndpoint($"{nodeConfig.General.ID}_{item}", EndPointType.SDMX));
                        _memoryCache.Remove(ProxyHttpClient.CalculateCacheKeyForEndpoint($"{nodeConfig.General.ID}_{item}", EndPointType.MA));
                        _memoryCache.Remove(ProxyHttpClient.CalculateCacheKeyForEndpoint($"{nodeConfig.General.ID}_{item}", EndPointType.DM));
                    }
                }
            }
        }

        public void AddAgencyToConfig(string nodeId, DataModel.Agency agency)
        {
            if (agency == null)
            {
                return;
            }

            var nodes = readNodesConfigJsonFromFile();

            NodeConfig node = null;
            foreach (var item in nodes)
            {
                if (item.General.ID.Equals(nodeId, StringComparison.InvariantCultureIgnoreCase))
                {
                    node = item;
                    break;
                }
            }

            if (node == null)
            {
                throw Utility.Utils.getCustomException("NODE_ID_NOT_FOUND",
                       @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - NodeId not found.", Infrastructure.STLogging.Interface.LogLevelEnum.Error);
            }

            var exist = node.Agencies.Exists(i => i.Id != null && i.Id.Equals(agency.Id, StringComparison.InvariantCultureIgnoreCase));
            if (exist)
            {
                throw Utility.Utils.getCustomException("AGENCY_ALREADY_IN_CONFIG",
                       @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - NodeId not found.", Infrastructure.STLogging.Interface.LogLevelEnum.Error);
            }

            node.Agencies.Add(agency);

            SetConfig(ConfigType.Nodes, JsonConvert.SerializeObject(nodes));

        }

        public void DeleteSingleNode(string nodeId, IMemoryCache memoryCache)
        {
            var nodes = readNodesConfigJsonFromFile();

            var elementIndex = -1;
            var findConfig = false;
            foreach (var item in nodes)
            {
                elementIndex++;
                if (item.General.ID.Equals(nodeId, StringComparison.InvariantCultureIgnoreCase))
                {
                    findConfig = true;
                    break;
                }
            }

            if (!findConfig)
            {
                throw Utility.Utils.getCustomException("NODE_ID_NOT_FOUND",
                       @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - NodeId to delete not found.", Infrastructure.STLogging.Interface.LogLevelEnum.Error);
            }

            nodes.RemoveAt(elementIndex);
            SetConfig(ConfigType.Nodes, JsonConvert.SerializeObject(nodes));

            if (memoryCache != null)
            { //remove all Proxy HttpClient from Cache
                _memoryCache.Remove(ProxyHttpClient.CalculateCacheKeyForEndpoint($"{nodeId}_", EndPointType.SDMX));
                _memoryCache.Remove(ProxyHttpClient.CalculateCacheKeyForEndpoint($"{nodeId}_", EndPointType.MA));
                _memoryCache.Remove(ProxyHttpClient.CalculateCacheKeyForEndpoint($"{nodeId}_", EndPointType.DM));

                string cachedUser = "";
                _memoryCache.TryGetValue("CachedUser", out cachedUser);
                if (!string.IsNullOrWhiteSpace(cachedUser))
                {
                    var users = cachedUser.Split(";");
                    foreach (var item in users)
                    {
                        if (string.IsNullOrWhiteSpace(item))
                        {
                            continue;
                        }
                        _memoryCache.Remove(ProxyHttpClient.CalculateCacheKeyForEndpoint($"{nodeId}_{item}", EndPointType.SDMX));
                        _memoryCache.Remove(ProxyHttpClient.CalculateCacheKeyForEndpoint($"{nodeId}_{item}", EndPointType.MA));
                        _memoryCache.Remove(ProxyHttpClient.CalculateCacheKeyForEndpoint($"{nodeId}_{item}", EndPointType.DM));
                    }
                }
            }
        }
    }

}
