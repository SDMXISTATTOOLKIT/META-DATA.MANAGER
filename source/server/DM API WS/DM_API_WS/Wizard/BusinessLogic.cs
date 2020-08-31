using AuthCore;
using AuthCore.Interface;
using AuthCore.Model;
using DataFactory;
using DM_API_WS.Wizard.Model;
using Infrastructure.STLogging.Factory;
using Infrastructure.STLogging.Interface;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using RMManager.RMDataProvider;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Threading.Tasks;

namespace DM_API_WS.Wizard
{
    /// <summary>
    /// Business logic
    /// </summary>
    public class BusinessLogic
    {
        readonly ISession _session;
        readonly ISTLogger _logger;

        /// <summary>
        /// Business logic.
        /// </summary>
        /// <param name="session">User session.</param>
        public BusinessLogic(ISession session)
        {
            _logger = STLoggerFactory.Logger;
            _session = session;
        }

        /// <summary>
        /// Checks if AuthDB is initialized
        /// </summary>
        /// <param name="session">The current session</param>
        /// <param name="authAppConfig">Configuration for authentication component</param>
        /// <param name="configData">Configuration data</param>
        /// <returns></returns>
        public ConfigData CheckAuthDB(ISession session, IOptionsMonitor<AuthAppOptions> authAppConfig, ConfigData configData)
        {
            var maClient = inizializeAuthenticatedClient(configData);
            var response = maClient.GetAsync(configData.MA + "/rest/auth/version/current").Result;

            if (response.StatusCode == HttpStatusCode.SeeOther 
                //From version 1.24.5 (??) does not use this IF
                || (response.StatusCode == HttpStatusCode.OK && response.RequestMessage.RequestUri.AbsolutePath.Contains("/version/available"))
                )
            {
                var availableObject = JObject.Parse(response.Content.ReadAsStringAsync().Result);
                configData.AuthDbVersion = (string)availableObject["version"];
                configData.AuthDbBaseInitialized = false;
                configData.StepMessage = "Authentication database needs be initialized to version " + configData.AuthDbVersion;
            }
            else if (response.IsSuccessStatusCode)
            {
                var availableObject = JObject.Parse(response.Content.ReadAsStringAsync().Result);
                configData.AuthDbVersion = (string)availableObject["version"];
                configData.AuthDbBaseInitialized = true;
                configData.StepMessage = "Authentication database is already initialized to version " + configData.AuthDbVersion;
            }
            else
            {
                var responseStr = response.StatusCode == HttpStatusCode.NotFound ? "Not Found" : response.Content.ReadAsStringAsync().Result;
                _logger.Log($"{configData.MA}/rest/auth/version/current: [{response.StatusCode}] {responseStr}", LogLevelEnum.Error);
                throw Utility.Utils.getCustomException($"MA WS response: [{response.StatusCode}] {responseStr}",
                        @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + $" - Ma API generic error to inizialize AuthDb (Status Code: {response.StatusCode}) {responseStr}", LogLevelEnum.Error);
            }
            configData.StepAction = "CheckAuthDB";


            if (configData.AuthDbBaseInitialized)
            {
                var authManager = new AuthCore.AuthManager(authAppConfig);
                configData.AuthDbExtInitialized = authManager.IsAuthDbExtInitialized();
            }
            else
            {
                configData.AuthDbExtInitialized = false;
            }
            configData.SelectedMappingStore = "";
            SetUserData(configData);
            return configData;
        }

        /// <summary>
        /// Initializes AuthDB
        /// </summary>
        /// <returns></returns>
        public ConfigData InizializeAuthDb()
        {
            var configData = GetUserData();

            var maClient = inizializeAuthenticatedClient(configData);
            var response = maClient.GetAsync(configData.MA + "/rest/auth/version/available").Result;
            if (!response.IsSuccessStatusCode)
            {
                throw Utility.Utils.getCustomException("NODE_MaApi_AVAILABLEERROR_INIZIALIZEAUTHDB",
                       @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + $" - Ma API error on available version (Status Code: {response.StatusCode})", Infrastructure.STLogging.Interface.LogLevelEnum.Error);
            }
            var availableObject = JObject.Parse(response.Content.ReadAsStringAsync().Result);
            var versionStr = availableObject["version"];

            var putVersion = $@"{{
  ""version"": ""{versionStr}""
}}";

            var resultPut = maClient.PutAsync(configData.MA + "/rest/auth/version/current", new StringContent(putVersion, Encoding.UTF8, "application/json")).Result;

            configData.AuthDbBaseInitialized = resultPut.IsSuccessStatusCode;
            configData.StepAction = "InizializeAuthDb";
            configData.StepMessage = "Initialized to version " + versionStr;
            configData.SelectedMappingStore = "";
            SetUserData(configData);
            return configData;
        }

        /// <summary>
        /// Extend the AuthDB
        /// </summary>
        /// <param name="authAppConfig">Configuration for authentication component</param>
        /// <returns></returns>
        public ConfigData ExtendAuthDB(IOptionsMonitor<AuthAppOptions> authAppConfig)
        {
            var configData = GetUserData();

            var authManager = new AuthCore.AuthManager(authAppConfig);
            authManager.ExtendAuthDb();

            configData.AuthDbBaseInitialized = true;
            configData.AuthDbExtInitialized = true;
            configData.SelectedMappingStore = "";
            configData.StepAction = "ExtendAuthDB";
            configData.StepMessage = "AuthDB extended complete";
            SetUserData(configData);
            return configData;
        }

        /// <summary>
        /// Returns available mapping stores
        /// </summary>
        /// <param name="session">The current session</param>
        /// <returns></returns>
        public ConfigData GetMappingStores(ISession session)
        {
            var mappingStore = new List<string>();

            var configData = GetUserData();

            var maClient = inizializeAuthenticatedClient(configData);

            var result = maClient.GetAsync(configData.MA + "/rest/store").Result;

            if (result.IsSuccessStatusCode)
            {
                var jsonList = result.Content.ReadAsStringAsync().Result;
                var jsonVal = JArray.Parse(jsonList);

                foreach (var item in jsonVal)
                {
                    var name = (string)item["name"];

                    if (!name.Equals("authdb", StringComparison.InvariantCultureIgnoreCase) && !mappingStore.Contains(name))
                    {
                        mappingStore.Add(name);
                    }
                }

                configData.MappingStores = mappingStore;
                configData.StepAction = "GetMappingStores";
                configData.StepMessage = "";
            }
            else
            {
                configData.MappingStores = mappingStore;
                configData.StepAction = "GetMappingStores";
                configData.StepMessage = "Some problem to download mapping store name";
            }
            SetUserData(configData);
            return configData;
        }

        /// <summary>
        /// Sets the mapping store
        /// </summary>
        /// <param name="mappingStore">mapping store name</param>
        public void SetMappingStore(string mappingStore)
        {
            var configData = GetUserData();
            configData.SelectedMappingStore = mappingStore;
            SetUserData(configData);
        }

        /// <summary>
        /// Checks if the MSDB is correctly configured
        /// </summary>
        /// <returns></returns>
        public ConfigData CheckMappingStore()
        {
            var configData = GetUserData();

            var maClient = inizializeAuthenticatedClient(configData);
            var checkResponse = maClient.GetAsync(configData.MA + $"/rest/store/{configData.SelectedMappingStore}/status").Result;

            if (!checkResponse.IsSuccessStatusCode)
            { //Incorrect MappingStore
                configData.StepMessage = "The selected mapping store is wrong";
                configData.ErrorSelectedMappingStore = true;
                return configData;
            }
            checkResponse = maClient.GetAsync(configData.MA + $"/rest/store/{configData.SelectedMappingStore}/version").Result;

            configData.ErrorSelectedMappingStore = false;
            if (checkResponse.IsSuccessStatusCode)
            {
                configData.StatusSelectedMappingStore = true;
                var availableObject = JObject.Parse(checkResponse.Content.ReadAsStringAsync().Result);
                configData.MappingStoreVersion = (string)availableObject["version"];
                configData.StepMessage = "Everything seems fine, version " + configData.MappingStoreVersion;
            }
            else
            {
                configData.StatusSelectedMappingStore = false;
                configData.StepMessage = "Initialization needed";
            }
            configData.StepAction = "CheckMappingStore";

            SetUserData(configData);
            return configData;
        }

        /// <summary>
        /// Initilalizes the MSDB
        /// </summary>
        /// <returns></returns>
        public ConfigData InizializeMappingStore()
        {
            var configData = GetUserData();

            var maClient = inizializeAuthenticatedClient(configData);

            var postBody = $@"{{
  ""initialize"": true
}}";
            var checkResponse = maClient.PostAsync(configData.MA + $"/rest/store/{configData.SelectedMappingStore}/status", new StringContent(postBody, Encoding.UTF8, "application/json")).Result;

            if (checkResponse.StatusCode == HttpStatusCode.Accepted)
            {
                configData.StatusSelectedMappingStore = true;

                var result = maClient.GetAsync(configData.MA + $"/rest/store/{configData.SelectedMappingStore}/version").Result;
                if (result.IsSuccessStatusCode)
                {
                    var availableObject = JObject.Parse(result.Content.ReadAsStringAsync().Result);
                    configData.MappingStoreVersion = (string)availableObject["version"];
                    configData.StepMessage = "OK. Initialized to version " + configData.MappingStoreVersion;
                }
                else
                {
                    configData.MappingStoreVersion = "";
                    configData.StepMessage = "Error: " + result.Content.ReadAsStringAsync().Result;
                }
            }
            else
            {
                configData.MappingStoreVersion = "";
                configData.StepMessage = "Error: " + checkResponse.Content.ReadAsStringAsync().Result;
            }
            System.Threading.Thread.Sleep(3000);
            configData.StepAction = "InizializeMappingStore";

            SetUserData(configData);
            return configData;
        }

        /// <summary>
        /// Checks if the DDB is correctly initialized
        /// </summary>
        /// <returns></returns>
        public ConfigData CheckDDB()
        {
            var configData = GetUserData();
            try
            {
                configData.StatusDDB = Factory.UtilsDataProv.CheckInizializedDDB();
            }
            catch (Exception ex)
            {
                configData.StatusDDB = false;
                configData.ErrorDDB = true;
                _logger.Log(ex.Message, LogLevelEnum.Error);
            }
            configData.StepAction = "CheckDDB";
            SetUserData(configData);
            return configData;
        }

        /// <summary>
        /// Initializes the DDB
        /// </summary>
        /// <returns></returns>
        public ConfigData InizializeDDB()
        {
            var configData = GetUserData();
            configData.StatusDDB = Factory.UtilsDataProv.CheckInizializedDDB();
            configData.StepAction = "InizializeDDB";
            if (!configData.StatusDDB)
            {
                Factory.UtilsDataProv.InizializeDDB();
            }
            SetUserData(configData);

            return configData;
        }

        /// <summary>
        /// Checks if the RMDB is correctly initialized
        /// </summary>
        /// <returns></returns>
        public ConfigData CheckRMDB()
        {
            IRMDataProvider rmProvider = new RMManager.RMDataProvider.RMDataProvider();
            var configData = GetUserData();
            try
            {
                configData.StatusRMDB = rmProvider.CheckInizializedRMDB();
            }
            catch (Exception ex)
            {
                configData.StatusRMDB = false;
                configData.ErrorRMDB = true;
                _logger.Log(ex.Message, LogLevelEnum.Error);
            }
            configData.StepAction = "CheckRMDB";
            SetUserData(configData);
            return configData;
        }

        /// <summary>
        /// Initializes the RMDB
        /// </summary>
        /// <returns></returns>
        public ConfigData InizializeRMDB()
        {
            IRMDataProvider rmProvider = new RMManager.RMDataProvider.RMDataProvider();
            var configData = GetUserData();
            configData.StatusRMDB = rmProvider.InizializeRMDB();
            configData.StepAction = "InizializeRMDB";
            if (!configData.StatusRMDB)
            {
                rmProvider.InizializeRMDB();
            }
            SetUserData(configData);

            return configData;
        }

        /// <summary>
        /// Returns the list of mapping stores
        /// </summary>
        /// <param name="mappingStores">The list of mapping stores' names.</param>
        /// <returns></returns>
        public SelectList ToSelectList(List<string> mappingStores)
        {
            var list = new List<SelectListItem>();

            foreach (var item in mappingStores)
            {
                list.Add(new SelectListItem()
                {
                    Text = item,
                    Value = item
                });
            }

            return new SelectList(list, "Value", "Text");
        }

        /// <summary>
        /// Sets data for the current user.
        /// </summary>
        /// <param name="configData">Data to be set.</param>
        private void SetUserData(ConfigData configData)
        {
            _session.SetString("UserData", JsonConvert.SerializeObject(configData));
        }

        /// <summary>
        /// Gets data for the current user.
        /// </summary>
        /// <returns></returns>
        public ConfigData GetUserData()
        {
            return JsonConvert.DeserializeObject<ConfigData>(_session.GetString("UserData"));
        }

        /// <summary>
        /// Call a Metadata WS API and return the status result.
        /// </summary>
        /// <returns></returns>
        public EndPointAPIStatusResponse GetMetadataAPIStatus(ConfigData configData)
        {
            var client = new HttpClient();
            if (!string.IsNullOrWhiteSpace(configData.MA) && !configData.MA.EndsWith("/"))
            {
                configData.MA += "/";
            }
            try
            {
                var response = client.GetAsync(configData.MA + "it/1/api/3/action/package_search?sort=id+asc&start=0&rows=100").Result;
                return new EndPointAPIStatusResponse { StatusCode = $"{(int)response.StatusCode} {response.StatusCode}", StatusMessage = "" };
            }
            catch (Exception ex)
            {
                return new EndPointAPIStatusResponse { StatusCode = ex.Message, StatusMessage = "" };
            }
        }

        /// <summary>
        /// Call a endpoint API and return the status result.
        /// </summary>
        /// <returns></returns>
        public EndPointAPIStatusResponse GetEndPointAPIStatus(ConfigData configData)
        {
            var client = new HttpClient();
            try
            {
                var response = client.GetAsync(configData.MA).Result;
                return new EndPointAPIStatusResponse { StatusCode = $"{(int)response.StatusCode} {response.StatusCode}", StatusMessage = response.Content.ReadAsStringAsync().Result };
            }
            catch (Exception ex)
            {
                return new EndPointAPIStatusResponse { StatusCode = ex.Message, StatusMessage = "" };
            }
        }

        /// <summary>
        /// Changes user's password.
        /// </summary>
        /// <param name="passwordData">Data for the new password.</param>
        /// <param name="authAppConfig">App Configuration.</param>
        /// <param name="userData">User's data.</param>
        /// <returns></returns>
        public ChangePasswordResult ChangePassword(ChangePasswordData passwordData, IOptionsMonitor<AuthAppOptions> authAppConfig, IUserData userData)
        {
            var manager = new AuthManager(authAppConfig);
            var isInizialized = manager.IsAuthDbInitialized();
            if (!isInizialized)
            {
                return ChangePasswordResult.DbNotInizialied;
            }
            IAuthManager _authManager = new AuthBasicManager(authAppConfig.CurrentValue, userData, _logger);
            var resultLogin = _authManager.CheckLogin(passwordData.Username, passwordData.Password);
            if (!resultLogin)
            {
                return ChangePasswordResult.InvalidLogin;
            }
            if (!passwordData.NewPassword.Equals(passwordData.ConfirmPassword))
            {
                return ChangePasswordResult.InvalidConfirmPassword;
            }
            manager.ChangePassword(new User { Username = passwordData.Username }, passwordData.NewPassword);
            return ChangePasswordResult.Ok;
        }

        private HttpClient inizializeAuthenticatedClient(ConfigData configData)
        {
            var client = new HttpClient();
            
            client.DefaultRequestHeaders.Accept.Clear();
            if (!string.IsNullOrWhiteSpace(configData.Username))
            {
                client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Basic", Convert.ToBase64String(Encoding.ASCII.GetBytes($"{configData.Username}:{configData.Password}")));
            }
            return client;
        }
    }
}
