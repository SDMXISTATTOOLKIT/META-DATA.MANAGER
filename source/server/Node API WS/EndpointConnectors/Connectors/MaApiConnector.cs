using Connector.Connectors;
using DataModel;
using Infrastructure.STLogging.Factory;
using Infrastructure.STLogging.Interface;
using MA.Entities;
using Microsoft.Extensions.Caching.Memory;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.IO;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Security.Authentication;
using System.Text;
using System.Threading.Tasks;

namespace EndpointConnectors.Connectors
{
    public class MaApiConnector : IMaApiConnector
    {
        private string BaseUrl;
        private HttpClient HttpClient;
        readonly ISTLogger _logger;
        readonly AppConfig _appConfig;

        public bool IsConfigurated { get; private set; }

        readonly NodeConfig _nodeConfiguration;

        public MaApiConnector(NodeConfig nodeConfiguration, HttpClientHandler httpClientHandler, IMemoryCache memoryCache, bool bypassCache, AppConfig appConfig)
        {
            _logger = STLoggerFactory.Logger;
            _nodeConfiguration = nodeConfiguration;
            _appConfig = appConfig;
            if (string.IsNullOrWhiteSpace(_nodeConfiguration.Endpoint.MAEndpoint))
            {
                IsConfigurated = false;
                return;
            }
            bypassCache = true;
            var tmpUrl = _nodeConfiguration.Endpoint.MAEndpoint.Trim();
            if (tmpUrl.EndsWith("/"))
            {
                tmpUrl = tmpUrl.Substring(0, tmpUrl.LastIndexOf("/"));
            }
            BaseUrl = tmpUrl.Trim();

            if (memoryCache != null && !bypassCache)
            {
                HttpClient = new ProxyHttpClient(memoryCache).Create(httpClientHandler, _nodeConfiguration, EndPointType.MA);
            }
            else
            {
                HttpClient = new HttpClient(httpClientHandler, true)
                {
                    Timeout = TimeSpan.FromMinutes(_appConfig.EndpointSetting.MaTimeOut)
                };
                if (!string.IsNullOrWhiteSpace(_nodeConfiguration.General.Username))
                {
                    HttpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Basic", Convert.ToBase64String(Encoding.ASCII.GetBytes($"{_nodeConfiguration.General.Username}:{_nodeConfiguration.General.Password}")));
                }
                HttpClient.DefaultRequestHeaders.Add("Accept-Encoding", "gzip, deflate");
            }

            IsConfigurated = true;
        }

        private string Request(string path, HttpMethod method, dynamic payload)
        {
            if (!IsConfigurated)
            {
                throw Utility.Utils.getCustomException("NODE_MaApi_NOT_FOUND",
                       @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - Node not found.", Infrastructure.STLogging.Interface.LogLevelEnum.Error);
            }

            HttpResponseMessage response = null;

            if (method == HttpMethod.Post)
            {
                response = HttpClient.PostAsync(BaseUrl + path, payload != null ? payload : null).Result;
            }
            else if (method == HttpMethod.Get)
            {
                response = HttpClient.GetAsync(BaseUrl + path).Result;
            }
            else if (method == HttpMethod.Put)
            {
                response = HttpClient.PutAsync(BaseUrl + path, payload != null ? payload : null).Result;
            }
            else if (method == HttpMethod.Delete)
            {
                response = HttpClient.DeleteAsync(BaseUrl + path).Result;
            }

            if (response.IsSuccessStatusCode)
            {
                return response.Content.ReadAsStringAsync().Result;

            }
            else
            {
                if (response.StatusCode == HttpStatusCode.NotFound)
                {
                    return null;
                }
                else if (response.StatusCode == HttpStatusCode.Unauthorized)
                {
                    throw new AuthenticationException("UNAUTHORIZED");
                }
                else if (response.StatusCode == HttpStatusCode.Forbidden)
                {
                    throw new UnauthorizedAccessException("FORBIDDEN");
                }

                string res = response.Content.ReadAsStringAsync().Result;
                var err = JsonConvert.DeserializeObject<ErrorMessage>(res);
                string msg = err.errorMessage == null ? (err.exceptionMessage == null ? "" : err.exceptionMessage) : err.errorMessage[0];
                throw new Exception("MA API: " + response.StatusCode + " - " + msg);
            }
        }

        public string GetEntity(string type, int? id)
        {
            return Request(id != null ? $@"/rest/entity/{_nodeConfiguration.Endpoint.MASid}/{type}/{id}" : $@"/rest/entity/{_nodeConfiguration.Endpoint.MASid}/{type}", HttpMethod.Get, null);
        }

        public string DeleteEntity(string type, int id)
        {
            return Request($@"/rest/entity/{_nodeConfiguration.Endpoint.MASid}/{type}/{id}", HttpMethod.Delete, null);
        }

        public string CreateDDBConnection(DDBConnection conn)
        {
            Entities ent = new Entities();
            ent.AddDdbConnection(1, conn);
            EntityMessage msg = new EntityMessage(ent);
            StringContent cont = new StringContent(JsonConvert.SerializeObject(msg), Encoding.UTF8, "application/json");

            return Request($@"/rest/entity/{_nodeConfiguration.Endpoint.MASid}/ddb", HttpMethod.Post, cont);
        }

        public string CreateDataset(Dataset ds)
        {
            Entities ent = new Entities();
            ent.AddDataset(1, ds);
            EntityMessage msg = new EntityMessage(ent);
            StringContent cont = new StringContent(JsonConvert.SerializeObject(msg), Encoding.UTF8, "application/json");

            return Request($@"/rest/entity/{_nodeConfiguration.Endpoint.MASid}/dataset", HttpMethod.Post, cont);
        }

        public string CreateDatasetColumns(string[] dc, int dsId)
        {
            Entities ent = new Entities();

            for (int i = 1; i <= dc.Length; i++)
            {
                ent.AddDatasetColumn(i, new DatasetColumn(dc[i - 1], dsId.ToString()));
            }
            EntityMessage msg = new EntityMessage(ent);
            StringContent cont = new StringContent(JsonConvert.SerializeObject(msg), Encoding.UTF8, "application/json");

            return Request($@"/rest/entity/{_nodeConfiguration.Endpoint.MASid}/column", HttpMethod.Post, cont);
        }

        public string CreateMappingSet(MappingSet ms)
        {
            Entities ent = new Entities();
            ent.AddMappingSet(1, ms);
            EntityMessage msg = new EntityMessage(ent);
            StringContent cont = new StringContent(JsonConvert.SerializeObject(msg), Encoding.UTF8, "application/json");

            return Request($@"/rest/entity/{_nodeConfiguration.Endpoint.MASid}/mappingset", HttpMethod.Post, cont);
        }

        public string CreateMappings(GenericMapping[] mapp)
        {
            Entities ent = new Entities();

            for (int i = 1; i <= mapp.Length; i++)
            {
                ent.AddMapping(i, mapp[i - 1]);
            }
            EntityMessage msg = new EntityMessage(ent);
            StringContent cont = new StringContent(JsonConvert.SerializeObject(msg), Encoding.UTF8, "application/json");


            return Request($@"/rest/entity/{_nodeConfiguration.Endpoint.MASid}/mapping", HttpMethod.Post, cont);
        }

        public string CreateTranscodings(Transcoding[] tr)
        {
            Entities ent = new Entities();

            for (int i = 1; i <= tr.Length; i++)
            {
                ent.AddTranscoding(i, tr[i - 1]);
            }
            EntityMessage msg = new EntityMessage(ent);
            StringContent cont = new StringContent(JsonConvert.SerializeObject(msg), Encoding.UTF8, "application/json");


            return Request($@"/rest/entity/{_nodeConfiguration.Endpoint.MASid}/transcoding", HttpMethod.Post, cont);
        }

        public string CreateContentConstraintsForComponent(int msId, int compId)
        {
            return Request($@"/rest/mappingset/contentconstraint/{_nodeConfiguration.Endpoint.MASid}/{msId}/{compId}", HttpMethod.Post, null);
        }

        public string CreateContentConstraints(int msId)
        {
            return Request($@"/rest/mappingset/contentconstraint/{_nodeConfiguration.Endpoint.MASid}/{msId}", HttpMethod.Post, null);
        }

        public string CreateTranscodingsWithRulesFromCc(int msId, string agCc, string idCc, string versCc)
        {
            return Request($@"/rest/mappingset/rule/{_nodeConfiguration.Endpoint.MASid}/{msId}/contentconstraint/{agCc}/{idCc}/{versCc}", HttpMethod.Post, null);
        }

        public string CreateTranscodingRules(List<MaRule> rules)
        {
            Entities ent = new Entities();

            ent.AddTranscodingRules(rules);
            EntityMessage msg = new EntityMessage(ent);
            StringContent cont = new StringContent(JsonConvert.SerializeObject(msg), Encoding.UTF8, "application/json");


            return Request($@"/rest/entity/{_nodeConfiguration.Endpoint.MASid}/transcodingrule", HttpMethod.Post, cont);
        }

        public string CreateHeaderTemplate(HeaderTemplate ht)
        {
            Entities ent = new Entities();
            ent.AddHeaderTemplate(1, ht);
            EntityMessage msg = new EntityMessage(ent);
            StringContent cont = new StringContent(JsonConvert.SerializeObject(msg), Encoding.UTF8, "application/json");

            return Request($@"/rest/entity/{_nodeConfiguration.Endpoint.MASid}/header_template", HttpMethod.Post, cont);
        }

        public bool PingEndPoint(string artefactType)
        {
            if (!IsConfigurated)
            {
                return true;
            }

            //MA Endpoint Url must end with /
            string urlStr = _nodeConfiguration.Endpoint.MAEndpoint.Trim();
            urlStr = urlStr.EndsWith("/") ? urlStr : urlStr + "/";
            if (!string.IsNullOrWhiteSpace(artefactType))
            {
                urlStr += "sdmx/rest/" + artefactType.ToLowerInvariant();
            }

            Uri url = new Uri(urlStr);

            var request = new HttpRequestMessage(method: HttpMethod.Get, requestUri: url);
            try
            {
                using (var response = HttpClient.SendAsync(request).Result)
                {
                    if (response.StatusCode == HttpStatusCode.OK)
                    {
                        return true;
                    }
                    return false; //Return false in case of 401 and 403?
                }
            }
            catch (Exception ex)
            {
                _logger.Log($"PingEndPoint MA Error: {ex.Message}", LogLevelEnum.Error);
                return false;
            }
        }

        #region Node Configuration


        public string GetListMaSid()
        {
            return Request($@"/rest/store", HttpMethod.Get, null);
        }

        public string GetMAConnectionString(string connectionId)
        {
            return Request($@"/rest/store/{connectionId}", HttpMethod.Get, null);
        }

        public bool CheckExistsArtefact(string type, string id, string agencyId, string version)
        {
            return Request($@"/sdmx/rest/{type}/{agencyId}/{id}/{version}", HttpMethod.Get, null) != null;
        }

        public bool IsAuthDbInizialize()
        {
            if (!IsConfigurated)
            {
                throw Utility.Utils.getCustomException("NODE_MaApi_NOT_FOUND",
                       @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - Node not found.", Infrastructure.STLogging.Interface.LogLevelEnum.Error);
            }

            var response = HttpClient.GetAsync(BaseUrl + "/rest/auth/version/current").Result;

            if (response.IsSuccessStatusCode)
            {
                return true;
            }
            else if (response.StatusCode == HttpStatusCode.SeeOther)
            {
                return false;
            }
            else
            {
                throw Utility.Utils.getCustomException("NODE_MaApi_UNKNOWERROR_INIZIALIZEAUTHDB",
                       @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + $" - Ma API generic error to inizialize AuthDb (Status Code: {response.StatusCode})", Infrastructure.STLogging.Interface.LogLevelEnum.Error);
            }
        }

        public bool InizializeAuthDb()
        {
            if (!IsConfigurated)
            {
                throw Utility.Utils.getCustomException("NODE_MaApi_NOT_FOUND",
                       @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - Node not found.", Infrastructure.STLogging.Interface.LogLevelEnum.Error);
            }

            var result = IsAuthDbInizialize();

            if (result)
            {
                return true;
            }

            var response = HttpClient.GetAsync(BaseUrl + "/rest/auth/version/available").Result;
            if (!response.IsSuccessStatusCode)
            {
                throw Utility.Utils.getCustomException("NODE_MaApi_AVAILABLEERROR_INIZIALIZEAUTHDB",
                       @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + $" - Ma API error on available version (Status Code: {response.StatusCode})", Infrastructure.STLogging.Interface.LogLevelEnum.Error);
            }
            var jsonObject = response.Content.ReadAsStringAsync().Result;
            var availableObject = JObject.Parse(jsonObject);
            var versionStr = availableObject["version"];

            var putVersion = $@"{{
  ""version"": ""{versionStr}""
}}";
            var resultPut = Request(BaseUrl + "/rest/auth/version/current", HttpMethod.Put, new StringContent(putVersion, Encoding.UTF8, "application/json"));

            if (resultPut == null)
            {
                return false;
            }

            return true;
        }

        public async Task<string> DownloadDDBDataflow(string id, string agency, string version, string format, string observation = null)
        {
            HttpRequestMessage httpRequestMessage;

            var strUri = _nodeConfiguration.Endpoint.MAEndpoint;
            Uri url = new Uri(strUri);
            if (strUri.EndsWith("/"))
            {
                strUri = strUri.Substring(0, strUri.LastIndexOf("/"));
            }
            var urlDownload = $"/sdmx/rest/data/{agency},{id},{version}/all/?detail=full";
            if (format.Equals("application/vnd.sdmx.structurespecificdata+xml;version=2.1", StringComparison.InvariantCultureIgnoreCase))
            {
                observation = string.IsNullOrWhiteSpace(observation) ? "TIME_PERIOD" : observation;
                urlDownload += $"&dimensionAtObservation={observation}";
            }
            
            httpRequestMessage = new HttpRequestMessage(method: HttpMethod.Get, requestUri: new Uri(strUri + urlDownload));
            httpRequestMessage.Headers.Add("Accept", format);

            using (HttpResponseMessage response = await HttpClient.SendAsync(httpRequestMessage, HttpCompletionOption.ResponseHeadersRead))
            {
                if (response.StatusCode == HttpStatusCode.OK)
                {
                    using (Stream streamToReadFrom = await response.Content.ReadAsStreamAsync())
                    {
                        string fileToWriteTo = Path.GetTempFileName();
                        using (Stream streamToWriteTo = File.Open(fileToWriteTo, FileMode.Create))
                        {
                            await streamToReadFrom.CopyToAsync(streamToWriteTo);
                        }
                        _logger.Log($"DownloadDDBDataflow create file {fileToWriteTo}", LogLevelEnum.Debug);
                        return fileToWriteTo;
                    }
                }
                else if (response.StatusCode == HttpStatusCode.NotFound)
                {
                    throw Utility.Utils.getCustomException("DATAFLOW_DOWNLOAD_MA_NOTFOUND",
                           @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + $" - Ma API not found dataflow {agency},{id},{version}", Infrastructure.STLogging.Interface.LogLevelEnum.Error);
                }
                else if (response.StatusCode == HttpStatusCode.InternalServerError || response.StatusCode == HttpStatusCode.Forbidden)
                {
                    string errorMessage = "";
                    try
                    {
                        var strError = response.Content.ReadAsStringAsync().Result;
                        var jError = JObject.Parse(strError);

                        errorMessage = (string)jError["errorMessage"];
                    }
                    catch (Exception)
                    {

                    }
                    finally
                    {
                        if (errorMessage.Contains("doesn't contains a mapping set"))
                        {
                            throw Utility.Utils.getCustomException("DATAFLOW_DOWNLOAD_MISSING_MAPPINGSET",
                           @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + $" - Ma API not found dataflow {agency},{id},{version}", Infrastructure.STLogging.Interface.LogLevelEnum.Error);
                        }
                        else if (response.StatusCode == HttpStatusCode.Forbidden)
                        {
                            throw Utility.Utils.getCustomException(errorMessage,
                           @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + $" - Ma API dataflow error {agency},{id},{version}", Infrastructure.STLogging.Interface.LogLevelEnum.Error);
                        }
                        else
                        {
                            throw new Exception("INTERNALSERVERERROR");
                        }
                    }

                }
                else if (response.StatusCode == HttpStatusCode.Unauthorized)
                {
                    throw new AuthenticationException("UNAUTHORIZED");
                }
                return null;
            }
        }


        #endregion

    }
}
