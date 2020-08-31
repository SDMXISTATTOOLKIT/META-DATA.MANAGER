using AuthCore.Model;
using Connector.Connectors;
using DataModel;
using DDB.Entities;
using Infrastructure.STLogging.Factory;
using Infrastructure.STLogging.Interface;
using MA.Entities;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Caching.Memory;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using NSI.Entities;
using System;
using System.Collections.Generic;
using System.Data;
using System.IO;
using System.IO.Compression;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Security.Authentication;
using System.Text;
using System.Threading.Tasks;

namespace EndpointConnectors.Connectors
{
    public class DmApiConnector : IDmApiConnector
    {
        private string BaseUrl;
        private HttpClient HttpClient;
        readonly ISTLogger _logger;
        readonly AppConfig _appConfig;

        public bool IsConfigurated { get; private set; }

        readonly NodeConfig _nodeConfiguration;

        public DmApiConnector(NodeConfig nodeConfiguration, HttpClientHandler httpClientHandler, IMemoryCache memoryCache, bool bypassCache, AppConfig appConfig)
        {
            _logger = STLoggerFactory.Logger;
            _nodeConfiguration = nodeConfiguration;
            _appConfig = appConfig;
            if (string.IsNullOrWhiteSpace(_nodeConfiguration.Endpoint.DMEndpoint))
            {
                IsConfigurated = false;
                return;
            }
            BaseUrl = _nodeConfiguration.Endpoint.DMEndpoint.Trim();

            bypassCache = true;
            if (memoryCache != null && !bypassCache)
            {
                HttpClient = new ProxyHttpClient(memoryCache).Create(httpClientHandler, _nodeConfiguration, EndPointType.SDMX, 120);
            }
            else
            {
                HttpClient = new HttpClient(httpClientHandler, true)
                {
                    Timeout = TimeSpan.FromMinutes(_appConfig.EndpointSetting.DmTimeOut)
                };
                if (!string.IsNullOrWhiteSpace(_nodeConfiguration.General.Username))
                {
                    HttpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Basic", Convert.ToBase64String(Encoding.ASCII.GetBytes($"{_nodeConfiguration.General.Username}:{_nodeConfiguration.General.Password}")));
                }
                HttpClient.DefaultRequestHeaders.Add("Accept-Encoding", "gzip, deflate");
            }

            IsConfigurated = true;
        }

        private string Request(string path, HttpMethod method, dynamic payload, string guidSession = null)
        {
            if (!IsConfigurated)
            {
                throw Utility.Utils.getCustomException("NODE_DmApi_NOT_FOUND",
                       @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - Node not found.", Infrastructure.STLogging.Interface.LogLevelEnum.Error);
            }

            HttpResponseMessage response = null;

            var request = new HttpRequestMessage(method,
                BaseUrl + path);
            if (!string.IsNullOrWhiteSpace(guidSession))
            {
                request.Headers.Add("guidSession", guidSession);
            }
            else
            {
                request.Headers.Add("guidSession", "NOGUID");
            }
            request.Content = payload != null ? payload : null;

            response = HttpClient.SendAsync(request).Result;

            if (response.StatusCode == HttpStatusCode.OK)
            {
                return response.Content.ReadAsStringAsync().Result;

            }
            else if (response.StatusCode == HttpStatusCode.InternalServerError)
            {
                throw new ApplicationException(response.Content.ReadAsStringAsync().Result);
            }
            else if (response.StatusCode == HttpStatusCode.Unauthorized)
            {
                throw new AuthenticationException("UNAUTHORIZED");
            }
            else if (response.StatusCode == HttpStatusCode.Forbidden)
            {
                throw new UnauthorizedAccessException("FORBIDDEN");
            }
            else
            {
                throw new Exception("DM API: " + response.StatusCode + " - " + response.ReasonPhrase);
            }
        }

        public string GetCube(int? id)
        {
            return Request(id != null ? $@"/Builder/getCube/{id}" : "/Builder/getAvailableCubes", HttpMethod.Get, null);
        }

        public string GetAvailableCubesNoFilter()
        {
            return Request("/Builder/getAvailableCubesNoFilter", HttpMethod.Get, null);
        }

        public string SearchReportIds(int idMetadataSet, string identifierValue, string targetType)
        {
            if (idMetadataSet <= 0 || identifierValue == null || targetType == null)
            {
                return null;
            }

            return Request($@"/RM/SearchReportIds/{idMetadataSet}/{identifierValue}/{targetType}", HttpMethod.Get, null);
        }

        public string SearchReport(int idMetadataSet, string identifierValue, string targetType)
        {
            if (idMetadataSet <= 0 || identifierValue == null || targetType == null)
            {
                return null;
            }

            return Request($@"/RM/SearchReport/{idMetadataSet}/{identifierValue}/{targetType}", HttpMethod.Get, null);
        }

        public string GetReport(int reportId)
        {
            if (reportId <= 0)
            {
                return null;
            }
            return Request($@"/RM/GetReport/{reportId}", HttpMethod.Get, null);
        }

        public string GetMetadataSet(string idMetadataSet, bool? excludeReport, bool? withAttributes, bool? dbId)
        {
            if (idMetadataSet==null ||(idMetadataSet= idMetadataSet.Trim()).Length==0)
            {
                return null;
            }
            string url = $@"/RM/GetMetadataSet/{idMetadataSet}";
            
            if (excludeReport != null || withAttributes != null || dbId != null)
            {
                StringBuilder sb = new StringBuilder("?");
                if (excludeReport.HasValue)
                {
                    sb.Append("excludeReport=" + excludeReport.Value);
                }
                if (withAttributes.HasValue)
                {
                    if (sb.Length > 1)
                    {
                        sb.Append("&");
                    }
                    sb.Append("withAttributes=" + withAttributes.Value);
                }
                if (dbId.HasValue)
                {
                    if (sb.Length > 1)
                    {
                        sb.Append("&");
                    }
                    sb.Append("dbId=" + dbId.Value);
                }
                url = url + sb.ToString();
            }
            return Request(url, HttpMethod.Get, null);
        }

        public string GetAllMetadataSets()
        {
            return Request($@"/RM/GetMetadataSetList", HttpMethod.Get, null);
        }

        public string CreateMetadataSet(string metadata, string msdFileContent, string dcatIsMultilingual, string customIsPresentational)
        {
            return Request($@"/RM/CreateMetadataSet", HttpMethod.Post, new StringContent(JsonConvert.SerializeObject(
                new { metadata = metadata, msd = msdFileContent, DCAT_IsMultilingual = dcatIsMultilingual, CustomIsPresentational = customIsPresentational }), Encoding.UTF8, "application/json"));
        }

        public string CreateReport(string metadata, int idMetadataSet, string msdFileContent, string dcatIsMultilingual, string customIsPresentational, string msd)
        {
            if (msd == null)
            {
                msd = "";
            }
            return Request($@"/RM/CreateReport/{idMetadataSet}/{msd}", HttpMethod.Post, new StringContent(JsonConvert.SerializeObject(
                new { metadata = metadata, msd = msdFileContent, DCAT_IsMultilingual = dcatIsMultilingual, CustomIsPresentational = customIsPresentational }), Encoding.UTF8, "application/json"));
        }

        public string UpdateMetadataSet(string metadataSet, string msdFileContent, string dcatIsMultilingual, string customIsPresentational)
        {
            return Request($@"/RM/UpdateMetadataSet", HttpMethod.Put, new StringContent(JsonConvert.SerializeObject(
                new { metadata = metadataSet, msd = msdFileContent, DCAT_IsMultilingual = dcatIsMultilingual, CustomIsPresentational = customIsPresentational }), Encoding.UTF8, "application/json"));
        }

        public string UpdateReport(int idMetadataSet, string metadata, string msdFileContent, string dcatIsMultilingual, string customIsPresentational, string msd)
        {
            if (msd == null)
            {
                msd = "";
            }
            return Request($@"/RM/UpdateReport/{idMetadataSet}/{msd}", HttpMethod.Put, new StringContent(JsonConvert.SerializeObject(
                new { metadata = metadata, msd = msdFileContent, DCAT_IsMultilingual = dcatIsMultilingual, CustomIsPresentational = customIsPresentational }), Encoding.UTF8, "application/json"));
        }

        public string SearchReportByParams(int metadataSetId, string identifierValue, string targetType)
        {
            string uri = $@"/RM/SearchReportByParams?";
            if (metadataSetId > 0)
            {
                uri += "idMetadataSet=" + metadataSetId;
            }
            if (targetType != null)
            {
                if (metadataSetId > 0)
                {
                    uri += "&";
                }
                uri += "targetType=" + targetType;
            }
            if (identifierValue != null)
            {
                if (!uri.EndsWith("?"))
                {
                    uri += "&";
                }
                uri += "identifierValue=" + identifierValue;
            }
            return Request(uri, HttpMethod.Get, null);
        }

        public string UpdateReportState(string idMetadataSet, string repIdStr, string newState, string msd)
        {
            if (msd == null)
            {
                msd = "";
            }
            return Request($@"/RM/UpdateReportState/{idMetadataSet}/{repIdStr}/{msd}", HttpMethod.Put, new StringContent(JsonConvert.SerializeObject(
                new { reportState = newState }), Encoding.UTF8, "application/json"));
        }

        public string DeleteReport(int idReport, string msd)
        {
            if (msd == null)
            {
                msd = "";
            }
            return Request($@"/RM/DeleteReport/{idReport}/{msd}", HttpMethod.Delete, null);
        }

        public string DeleteMetadataSet(int idMetadataSet)
        {
            return Request($@"/RM/DeleteMetadataSet/" + idMetadataSet, HttpMethod.Delete, null);
        }

        public string SearchMetadataSetIdByDataflowURN(string dataflowURN)
        {
            return Request($@"/RM/SearchMetadataSetIdByDataflowURN/{dataflowURN}", HttpMethod.Get, null);
        }

        public string GetSimpleMetadataSet(string idMetadataSet)
        {
            if (idMetadataSet==null || (idMetadataSet= idMetadataSet.Trim()).Length==0)
            {
                return null;
            }
            return Request($@"/RM/GetSimpleMetadataSet/{idMetadataSet}", HttpMethod.Get, null);
        }

        public string GetDcs()
        {
            return Request("/Builder/getDCS", HttpMethod.Get, null);
        }

        public string CreateCube(string cube)
        {
            return Request("/Builder/createCube", HttpMethod.Post, new StringContent(cube, Encoding.UTF8, "application/json"));
        }
        public string CreateFileMapping(string fileMapping)
        {
            return Request("/Mapping/createDDBMapping", HttpMethod.Post, new StringContent(fileMapping, Encoding.UTF8, "application/json"));
        }

        public string CreateDDBDataflow(string df)
        {
            return Request("/DFBuilder/createDDBDataflow", HttpMethod.Post, new StringContent(df, Encoding.UTF8, "application/json"));
        }

        public string DeleteCube(int id)
        {
            return Request("/Builder/deleteCube?cubeId=" + id, HttpMethod.Delete, null);
        }

        public string DeleteFileMapping(int id)
        {
            return Request($@"/Mapping/deleteDDBMapping?idMapping={id}", HttpMethod.Delete, null);
        }

        public string DeleteDDBDataflow(int id)
        {
            return Request($@"/DFBuilder/deleteDDBDataflow?dfId={id}", HttpMethod.Delete, null);
        }

        public string GetFileMapping(int? id)
        {
            return Request(id != null ? $@"/Mapping/getDDBMapping/{id}" : "/Mapping/getDDBMappings", HttpMethod.Get, null);
        }

        public string GetDDBDataflow(int? id)
        {
            return Request(id != null ? $@"/DFBuilder/GetDDBDataflow/{id}" : "/DFBuilder/GetDDBDataflows", HttpMethod.Get, null);
        }
        public string GetDDBDataflowNoFilter(int? dataFlowId)
        {
            return Request(dataFlowId != null ? $@"/DFBuilder/GetDDBDataflowNoFilter/{dataFlowId}" : "/DFBuilder/GetDDBDataflowsNoFilter", HttpMethod.Get, null);
        }
        public string GetDDBDataflowsNoFilter(int cubeId)
        {
            return Request($@"/DFBuilder/GetDDBDataflowsNoFilter/{cubeId}", HttpMethod.Get, null);
        }

        public bool IsAgencyAssignToAnyUser(string agencyCode)
        {
            var result = Request($@"/Utils/IsAgencyAssignToAnyUser/{agencyCode}", HttpMethod.Get, null);
            if (string.IsNullOrWhiteSpace(result))
            {
                return false;
            }
            return Convert.ToBoolean(result);
        }
        

        public string SetHasTranscodingFlag(int dfId, bool value)
        {
            return Request($@"/DFBuilder/setHasTranscodingFlag/{dfId}/{value}", HttpMethod.Get, null);
        }

        public string SetHasContentConstraintFlag(int dfId, bool value)
        {
            return Request($@"/DFBuilder/setHasContentConstraintsFlag/{dfId}/{value}", HttpMethod.Get, null);
        }

        public string UploadFileOnServer(int? cubeId, IFormFile file)
        {
            string uri = cubeId != null ? $@"/Utils/uploadFileOnServer?cubeId={cubeId}" : "/Utils/uploadFileOnServer";
            return commonUploadFileOnServer(uri, file);
        }

        public string UploadReferenceMetadataFileOnServer(IFormFile file)
        {
            return commonUploadFileOnServer("/Utils/uploadReferenceMetadataFileOnServer", file);
        }

        public Stream ReferenceMetadataFileOnServer(string filename)
        {
            if (!IsConfigurated)
            {
                throw Utility.Utils.getCustomException("NODE_DmApi_NOT_FOUND",
                       @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - Node not found.", Infrastructure.STLogging.Interface.LogLevelEnum.Error);
            }
            var resultPost = HttpClient.GetAsync($"{BaseUrl}/Utils/ReferenceMetadataFileOnServer?filename={filename}").Result;
            return resultPost.Content.ReadAsStreamAsync().Result;
        }

        private string commonUploadFileOnServer(string uri, IFormFile file)
        {
            byte[] archiveFile;
            if (file.FileName.EndsWith(".zip", StringComparison.InvariantCultureIgnoreCase))
            {
                using (var br = new BinaryReader(file.OpenReadStream()))
                {
                    archiveFile = br.ReadBytes((int)file.OpenReadStream().Length);
                }
            }
            else
            {
                using (var archiveStream = new MemoryStream())
                {
                    using (var archive = new ZipArchive(archiveStream, ZipArchiveMode.Create, true))
                    {
                        var zipArchiveEntry = archive.CreateEntry(file.FileName, CompressionLevel.Fastest);
                        using (var zipStream = zipArchiveEntry.Open())
                        {
                            using (var ms = new MemoryStream())
                            {
                                file.CopyTo(ms);
                                var fileBytes = ms.ToArray();
                                zipStream.Write(fileBytes, 0, fileBytes.Length);
                            }
                        }
                    }
                    archiveFile = archiveStream.ToArray();
                }
            }
            MultipartFormDataContent multiContent = new MultipartFormDataContent();
            multiContent.Add(new ByteArrayContent(archiveFile), "file", file.FileName);
            return Request(uri, HttpMethod.Post, multiContent);
        }

        public string GetCSVHeader(char separator, char? delimiter, bool hasHeader, string filePath)
        {
            var delimiterStr = delimiter.HasValue ? $"/{delimiter}" : "";
            return Request($@"/Mapping/getCSVHeader/{separator}/{hasHeader}{delimiterStr}?filePath={Uri.EscapeDataString(filePath)}", HttpMethod.Get, null);
        }

        public string GetCSVTablePreview(OptionsTable optionsTable, char separator, char? delimiter, bool hasHeader, string filePath, string tid, int idMappingSpecialTimePeriod, string guidSession)
        {
            var tidStr = tid != null ? $"&tid={tid}" : "";
            var delimiterStr = delimiter.HasValue ? $"/{delimiter}" : "";
            return Request($@"/Utils/getCSVTablePreview/{separator}/{hasHeader}{delimiterStr}?filePath={Uri.EscapeDataString(filePath)}{tidStr}&idMappingSpecialTimePeriod={idMappingSpecialTimePeriod}", HttpMethod.Post, new StringContent(JsonConvert.SerializeObject(optionsTable), Encoding.UTF8, "application/json"), guidSession);
        }

        public string GetCSVTableColumnPreview(OptionsTable optionsTable, char separator, char? delimiter, bool hasHeader, string filePath, int idMappingSpecialTimePeriod, string guidSession)
        {
            var delimiterStr = delimiter.HasValue ? $"/{delimiter}" : "";

            return Request($@"/Utils/getCSVTableColumnPreview/{separator}/{hasHeader}{delimiterStr}?filePath={Uri.EscapeDataString(filePath)}&idMappingSpecialTimePeriod={idMappingSpecialTimePeriod}", HttpMethod.Post, new StringContent(JsonConvert.SerializeObject(optionsTable), Encoding.UTF8, "application/json"), guidSession);
        }

        public string ImportCSVData(char separator, char? delimiter, bool hasHeader, string importType, int cubeId, int mappingId, string filePath, string tid, int idMappingSpecialTimePeriod, bool embargo, bool ignoreCuncurrentUpload, bool checkFiltAttributes, string guidSession)
        {
            var delimiterStr = delimiter.HasValue ? $"/{delimiter}" : "";
            return Request($@"/Loader/importCSVData/{separator}/{hasHeader}/{importType}/{cubeId}/{mappingId}{delimiterStr}?filePath={Uri.EscapeDataString(filePath)}&idMappingSpecialTimePeriod={idMappingSpecialTimePeriod}&embargo={embargo}&ignoreCuncurrentUpload={ignoreCuncurrentUpload}&checkFiltAttributes={checkFiltAttributes}" + (tid != null ? $@"&tid={tid}" : ""), HttpMethod.Get, null, guidSession);
        }

        public string DisembargoCube(int cubeId)
        {
            return Request($@"/Loader/disembargoCube?idCube={cubeId}", HttpMethod.Post, null);
        }

        public string EmptyCube(int cubeId)
        {
            return Request($@"/Loader/emptyCube?idCube={cubeId}", HttpMethod.Post, null);
        }

        public string GetTablePreview(string tableName, OptionsTable optionsTable)
        {
            return Request($@"/Utils/getTablePreview/{tableName}", HttpMethod.Post, new StringContent(JsonConvert.SerializeObject(optionsTable), Encoding.UTF8, "application/json"));
        }

        public string GetTableColumnPreview(string tableName, OptionsTable optionsTable)
        {
            return Request($@"/Utils/getTableColumnPreview/{tableName}",
                            HttpMethod.Post,
                            new StringContent(JsonConvert.SerializeObject(optionsTable), Encoding.UTF8, "application/json"));
        }

        public string PreviewImportedFileCsvItem(OptionsTable optionsTable, ImportedItemCsvDTO importedItemCsvDTO, string filePath, string guidSession, bool remoteUpload, IHttpContextAccessor _contextAccessor)
        {
            if (remoteUpload)
            {
                using (var stream = File.OpenRead(filePath))
                {
                    var file = new FormFile(stream, 0, stream.Length, null, Path.GetFileName(stream.Name))
                    {
                        Headers = new HeaderDictionary(),
                        ContentType = "application/csv"
                    };
                    filePath = UploadFileOnServer(null, file).Replace("\"", "");
                    _contextAccessor.HttpContext.Session.Set("PreviewCSVFileRemote", Encoding.ASCII.GetBytes(filePath));
                }
            }
            _contextAccessor.HttpContext.Session.TryGetValue("PreviewCSVFileRemote", out byte[] valueByteOut);
            filePath = Encoding.ASCII.GetString(valueByteOut);
            var delimiterStr = !string.IsNullOrWhiteSpace(importedItemCsvDTO.TextDelimiter) ? $"/{importedItemCsvDTO.TextDelimiter}" : "";
            return Request($@"/Utils/getTableCSVPreview/{importedItemCsvDTO.TextSeparator}/{importedItemCsvDTO.FirstRowHeader}{delimiterStr}?filePath={Uri.EscapeDataString(filePath)}", HttpMethod.Post, new StringContent(JsonConvert.SerializeObject(optionsTable), Encoding.UTF8, "application/json"), guidSession);
        }

        public string GetConnectionString()
        {
            return Request($@"/Utils/getConnectionString", HttpMethod.Get, null);
        }

        public string GetSDMXMLTablePreview(string dsdXml, string agencyId, OptionsTable optionsTable, string filePath)
        {
            return Request(
                $@"/Utils/getSDMXMLTablePreview?agencyId={agencyId}&filePath={Uri.EscapeDataString(filePath)}",
                HttpMethod.Post,
                new StringContent(JsonConvert.SerializeObject(new { dsd = dsdXml, optionsTable = optionsTable }), Encoding.UTF8, "application/json")
            );
        }

        public string GetDDBDataflowPreview(DDBDataflow ddbDataflow, bool partialIgnoreCheckFilter)
        {
            return Request(
                $@"/DFBuilder/getDDBDataflowPreview?partialIgnoreCheckFilter={partialIgnoreCheckFilter}",
                HttpMethod.Post,
                new StringContent(JsonConvert.SerializeObject(ddbDataflow), Encoding.UTF8, "application/json")
            );
        }

        public async Task<string> DownloadDDBDataflowCsvAsync(DDBDataflow ddbDataflow, bool partialIgnoreCheckFilter, char separator, char? delimiter)
        {
            if (!IsConfigurated)
            {
                throw Utility.Utils.getCustomException("NODE_DmApi_NOT_FOUND",
                       @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - Node not found.", LogLevelEnum.Error);
            }
            var delimiterStr = delimiter.HasValue ? $"/{delimiter}" : "";
            _logger.Log("CALL DM API downloadDDBDataflowInCsv", LogLevelEnum.Debug);


            var httpRequestMessage = new HttpRequestMessage(method: HttpMethod.Post, requestUri: new Uri($@"{BaseUrl}/DFBuilder/downloadDDBDataflowInCsv/{separator}{delimiterStr}?partialIgnoreCheckFilter={partialIgnoreCheckFilter}"));
            httpRequestMessage.Content = new StringContent(JsonConvert.SerializeObject(ddbDataflow), Encoding.UTF8, "application/json");
            var resultPost = await HttpClient.SendAsync(httpRequestMessage, HttpCompletionOption.ResponseHeadersRead);
            _logger.Log("RESPONSE FROM DM API downloadDDBDataflowInCsv", LogLevelEnum.Debug);

            if (resultPost.StatusCode == HttpStatusCode.Forbidden)
            {
                throw new UnauthorizedAccessException();
            }
            else if (resultPost.StatusCode == HttpStatusCode.Unauthorized)
            {
                throw new AuthenticationException();
            }

            using (Stream streamToReadFrom = await resultPost.Content.ReadAsStreamAsync())
            {
                string fileToWriteTo = Path.GetTempFileName();
                using (Stream streamToWriteTo = File.Open(fileToWriteTo, FileMode.Create))
                {
                    await streamToReadFrom.CopyToAsync(streamToWriteTo);
                }
                _logger.Log($"DownloadDDBDataflowCsvAsync create file {fileToWriteTo}", LogLevelEnum.Debug);
                return fileToWriteTo;
            }
        }

        public string GetDataflowColumnPreview(string df, string colName, int pageNum, int pageSize, bool partialIgnoreCheckFilter = false)
        {
            return Request(
                $@"/DFBuilder/getDataflowColumnPreview?colName={colName}&numPage={pageNum}&pageSize={pageSize}&partialIgnoreCheckFilter={partialIgnoreCheckFilter}",
                HttpMethod.Post,
                new StringContent(df, Encoding.UTF8, "application/json")
            );
        }
        
        public string GetDataflowFromSDMXMLData(string filePath)
        {
            return Request(
                $@"/Loader/getDatflowSDMXMLData?filePath={Uri.EscapeDataString(filePath)}",
                HttpMethod.Get,
                null
            );
        }

        public string ImportSDMXMLData(string importType, string cubeId, string dsdXml, string dsdAgencyId, string filePath, string tid, bool embargo, bool ignoreCuncurrentUpload, bool checkFiltAttributes)
        {
            return Request(
                $@"/Loader/importSDMXMLData?importType={importType}&idCube={cubeId}&agencyId={dsdAgencyId}&filePath={Uri.EscapeDataString(filePath)}&embargo={embargo}&ignoreCuncurrentUpload={ignoreCuncurrentUpload}&checkFiltAttributes={checkFiltAttributes}"
                + (tid != null ? $@"&tid={tid}" : ""),
                HttpMethod.Post,
                new StringContent(JsonConvert.SerializeObject(new { dsd = dsdXml }), Encoding.UTF8, "application/json")
            );
        }

        public string ImportDCS(string categoryScheme, string agencyId)
        {
            return Request(
                $@"/Builder/importDCSFromMSDB?agencyId={agencyId}&orderAnnType={_nodeConfiguration.Annotations.CategorySchemesOrder}",
                HttpMethod.Post,
                new StringContent(JsonConvert.SerializeObject(categoryScheme), Encoding.UTF8, "application/json")
            );
        }

        public bool DDBReset()
        {
            var res = Request($@"/Utility/DDBReset", HttpMethod.Post, null);
            return JsonConvert.DeserializeObject<bool>(res);
        }

        #region User

        public User LoginUser(string username, string password)
        {
            HttpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Basic", Convert.ToBase64String(Encoding.ASCII.GetBytes($"{username}:{password}")));
            var response = HttpClient.PostAsync($"{BaseUrl}/User/LoginUser", null).Result;

            if (response.IsSuccessStatusCode)
            {
                string res = response.Content.ReadAsStringAsync().Result;
                return JsonConvert.DeserializeObject<User>(res);
            }
            else if (response.StatusCode == HttpStatusCode.Unauthorized)
            {
                return null;
            }
            else
            {
                string res = response.Content.ReadAsStringAsync().Result;
                try
                {
                    var err = JsonConvert.DeserializeObject<ErrorMessage>(res);
                    string msg = err.errorMessage == null ? (err.exceptionMessage == null ? "" : err.exceptionMessage) : err.errorMessage[0];
                    throw new Exception("MA API: " + response.StatusCode + " - " + msg);
                }
                catch
                {
                    var message = "";
                    if (res != null)
                    {
                        message = res;
                    }
                    throw new Exception("MA API: " + response.StatusCode + " - " + res);
                }
            }
        }

        public string CreateUser(string user)
        {
            return Request("/UserConfig/CreateUser", HttpMethod.Post, new StringContent(user, Encoding.UTF8, "application/json"));
        }

        public string UpdateUser(string user)
        {
            return Request("/UserConfig/UpdateUser", HttpMethod.Put, new StringContent(user, Encoding.UTF8, "application/json"));
        }

        public string DeleteUser(string user)
        {
            return Request("/UserConfig/DeleteUser", HttpMethod.Delete, new StringContent(user, Encoding.UTF8, "application/json"));
        }

        public List<string> GetUserCategory(string username)
        {
            var url = $"/User/GetMyCategory";
            if (!string.IsNullOrWhiteSpace(username))
            {
                url = $"/UserConfig/GetCategory/{username}";
            }
            var str = Request(url, HttpMethod.Get, null);
            return JsonConvert.DeserializeObject<List<string>>(str);
        }

        public Dictionary<string, bool> GetUserCube(string username)
        {
            var url = $"/User/GetMyCube";
            if (!string.IsNullOrWhiteSpace(username))
            {
                url = $"/UserConfig/GetCube/{username}";
            }
            var str = Request(url, HttpMethod.Get, null);
            return JsonConvert.DeserializeObject<Dictionary<string, bool>>(str);
        }

        public List<string> GetUserFunctionality(string username)
        {
            var url = $"/User/GetMyFunctionality";
            if (!string.IsNullOrWhiteSpace(username))
            {
                url = $"/UserConfig/GetFunctionality/{username}";
            }
            var str = Request(url, HttpMethod.Get, null);
            return JsonConvert.DeserializeObject<List<string>>(str);
        }

        public List<string> GetUserAgency(string username)
        {
            var url = $"/User/GetMyAgency";
            if (!string.IsNullOrWhiteSpace(username))
            {
                url = $"/UserConfig/GetAgency/{username}";
            }
            var str = Request(url, HttpMethod.Get, null);
            return JsonConvert.DeserializeObject<List<string>>(str);
        }

        public Dictionary<string, bool> GetUserDataflow(string username)
        {
            var url = $"/User/GetUserDataflow";
            if (!string.IsNullOrWhiteSpace(username))
            {
                url = $"/UserConfig/GetUserDataflow/{username}";
            }
            var str = Request(url, HttpMethod.Get, null);
            return JsonConvert.DeserializeObject<Dictionary<string, bool>>(str);
        }

        public Dictionary<string, bool> GetUserMetadataset(string username)
        {
            var url = $"/User/GetUserMetadataset";
            if (!string.IsNullOrWhiteSpace(username))
            {
                url = $"/UserConfig/GetUserMetadataset/{username}";
            }
            var str = Request(url, HttpMethod.Get, null);
            return JsonConvert.DeserializeObject<Dictionary<string, bool>>(str);
        }

        public List<string> GetAllAgency()
        {
            var url = $"/UserConfig/GetAllAgency/";
            var str = Request(url, HttpMethod.Get, null);
            return JsonConvert.DeserializeObject<List<string>>(str);
        }

        public List<string> GetAllDataflow()
        {
            var url = $"/UserConfig/GetAllDataflow/";
            var str = Request(url, HttpMethod.Get, null);
            return JsonConvert.DeserializeObject<List<string>>(str);
        }

        public List<string> GetAllMetadataFlow()
        {
            var url = $"/UserConfig/GetAllMetadataFlow/";
            var str = Request(url, HttpMethod.Get, null);
            return JsonConvert.DeserializeObject<List<string>>(str);
        }

        public List<string> GetAllRules()
        {
            var url = $"/UserConfig/GetAllRules/";
            var str = Request(url, HttpMethod.Get, null);
            return JsonConvert.DeserializeObject<List<string>>(str);
        }

        public UserDataDTO GetData(string username)
        {
            var url = $"/User/GetMyData";
            if (!string.IsNullOrWhiteSpace(username))
            {
                url = $"/UserConfig/GetData/{username}";
            }
            var str = Request(url, HttpMethod.Get, null);
            return JsonConvert.DeserializeObject<UserDataDTO>(str);
        }

        public List<UsersDTO> GetUsers()
        {
            var url = $"/UserConfig/GetUsers/";
            var str = Request(url, HttpMethod.Get, null);
            return JsonConvert.DeserializeObject<List<UsersDTO>>(str);
        }

        public string GetCategoryHierarchy()
        {
            return Request("/UserConfig/GetCategoryHierarchy", HttpMethod.Get, null);
        }

        public string GetFunctionalityHierarchy()
        {
            return Request("/UserConfig/GetFunctionalityHierarchy", HttpMethod.Get, null);
        }

        public string GetCubeHierarchy()
        {
            return Request("/UserConfig/GetCubeHierarchy", HttpMethod.Get, null);
        }

        public string AssignsAll(UserDataDTO userData)
        {
            return Request("/UserConfig/AssignsAll", HttpMethod.Post, new StringContent(JsonConvert.SerializeObject(userData), Encoding.UTF8, "application/json"));
        }

        public bool AssignCubeOwnership(string cubeCode, string username)
        {
            var result = Request($"/User/AssignCubeOwnership/{cubeCode}/{username}", HttpMethod.Post, null);
            return JsonConvert.DeserializeObject<bool>(result);
        }

        public bool AssignDataflowFirstOwnership(string dataflow, string username)
        {
            var result = Request($"/User/AssignDataflowFirstOwnership?dataflow={System.Web.HttpUtility.UrlEncode(dataflow)}", HttpMethod.Post, null);
            return JsonConvert.DeserializeObject<bool>(result);
        }

        public bool AssignDataflowOwnership(string dataflow, string username)
        {
            var result = Request($"/UserConfig/AssignDataflowOwnership/{username}?dataflow={System.Web.HttpUtility.UrlEncode(dataflow)}", HttpMethod.Post, null);
            return JsonConvert.DeserializeObject<bool>(result);
        }

        public bool AssignMetadataFlowFirstOwnership(string metadataFlow, string username)
        {
            var result = Request($"/User/AssignMetadataFlowFirstOwnership?metadataFlow={System.Web.HttpUtility.UrlEncode(metadataFlow)}", HttpMethod.Post, null);
            return JsonConvert.DeserializeObject<bool>(result);
        }

        public bool AssignMetadataFlowOwnership(string metadataFlow, string username)
        {
            var result = Request($"/UserConfig/AssignMetadataFlowOwnership/{username}?metadataFlow={System.Web.HttpUtility.UrlEncode(metadataFlow)}", HttpMethod.Post, null);
            return JsonConvert.DeserializeObject<bool>(result);
        }

        public EntityOwners GetOwners(string entity, string id)
        {
            var result = Request($"/User/GetOwners/{entity}?id={System.Web.HttpUtility.UrlEncode(id)}", HttpMethod.Get, null);
            return JsonConvert.DeserializeObject<EntityOwners>(result);
        }

        public void SetOwners(EntityOwners entityOwners)
        {
            Request($"/User/SetOwners", HttpMethod.Post, new StringContent(JsonConvert.SerializeObject(entityOwners), Encoding.UTF8, "application/json"));
        }

        public bool ChangePassword(string username, string password)
        {
            var result = Request("/UserConfig/ChangePassword", HttpMethod.Post, new StringContent(JsonConvert.SerializeObject(new { username = username, password = password }), Encoding.UTF8, "application/json"));
            return JsonConvert.DeserializeObject<bool>(result);
        }

        public bool ChangeMyPassword(string username, string password)
        {
            var result = Request("/User/ChangeMyPassword", HttpMethod.Post, new StringContent(JsonConvert.SerializeObject(new { username = username, password = password }), Encoding.UTF8, "application/json"));
            return JsonConvert.DeserializeObject<bool>(result);
        }

        public bool RecoveryPassword(IUserData userData)
        {
            var result = Request($"/User/RecoveryPassword", HttpMethod.Post, new StringContent(JsonConvert.SerializeObject(userData), Encoding.UTF8, "application/json"));
            return JsonConvert.DeserializeObject<bool>(result);
        }

        #endregion

        public Dictionary<string, List<string>> GetItemsCodelistFromDsd(List<string> dsdCheck)
        {
            var str = Request($@"/Utility/GetItemsCodelistFromDsd", HttpMethod.Post, new StringContent(JsonConvert.SerializeObject(dsdCheck), Encoding.UTF8, "application/json"));
            return JsonConvert.DeserializeObject<Dictionary<string, List<string>>>(str);
        }

        public Dictionary<string, List<string>> GetItemsCodelists(List<ArtefactIdentity> codeListsCheck)
        {
            var str = Request($@"/Utility/GetItemsFromCodeList", HttpMethod.Post, new StringContent(JsonConvert.SerializeObject(codeListsCheck), Encoding.UTF8, "application/json"));
            return JsonConvert.DeserializeObject<Dictionary<string, List<string>>>(str);
        }

        public Dictionary<string, List<string>> GetItemsFromCodeList(List<ArtefactIdentity> codeListCheck)
        {
            var str = Request($@"/Utility/GetItemsFromCodeList", HttpMethod.Post, new StringContent(JsonConvert.SerializeObject(codeListCheck), Encoding.UTF8, "application/json"));
            return JsonConvert.DeserializeObject<Dictionary<string, List<string>>>(str);
        }

        public void SyncCodeList(Dictionary<string, List<string>> itemsCodeListToSync)
        {
            Request($@"/Utility/SyncCodeList", HttpMethod.Post, new StringContent(JsonConvert.SerializeObject(itemsCodeListToSync), Encoding.UTF8, "application/json"));
        }

        public void SynchronizeAuthDB(List<string> allAgency, List<string> allDataflow, List<string> allMetadataFlows)
        {
            var sqlData = new JObject(new JProperty("agency", allAgency),
                                    new JProperty("dataflow", allDataflow),
                                    new JProperty("metadataFlow", allMetadataFlows));
            Request($@"/Utils/SynchronizeAuthDB", HttpMethod.Post, new StringContent(sqlData.ToString(), Encoding.UTF8, "application/json"));
        }

        public void RemoveTempTable()
        {
            Request($@"/Utils/RemoveTempTable", HttpMethod.Post, null);
        }

        public bool PingEndPoint()
        {
            if (!IsConfigurated)
            {
                return true;
            }

            Uri url = new Uri(_nodeConfiguration.Endpoint.DMEndpoint.Trim() + "/Ping");

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
                _logger.Log($"PingEndPoint DM Error: {ex.Message}", Infrastructure.STLogging.Interface.LogLevelEnum.Error);
                return false;
            }
        }

        public string InsertDCS(Category category)
        {
            return Request($@"/Builder/InsertDCS", HttpMethod.Post, new StringContent(JsonConvert.SerializeObject(category), Encoding.UTF8, "application/json"));
        }

        public void UpdateDCS(Category category)
        {
            Request($@"/Builder/UpdateDCS", HttpMethod.Put, new StringContent(JsonConvert.SerializeObject(category), Encoding.UTF8, "application/json"));
        }

        public string DeleteDCS(string catCode)
        {
            return Request($@"/Builder/DeleteDCS", HttpMethod.Delete, null);
        }

        public string CompareDSD(DsdReport dsdReport)
        {
            return Request($@"/Utility/CompareDSD", HttpMethod.Post, new StringContent(JsonConvert.SerializeObject(dsdReport), Encoding.UTF8, "application/json"));
        }

        public string UpgradeCube(DsdReport dsdReport)
        {
            return Request($@"/Utility/UpgradeCube", HttpMethod.Post, new StringContent(JsonConvert.SerializeObject(dsdReport), Encoding.UTF8, "application/json"));
        }

        public string GetDataFlowsFromDSD(ArtefactIdentity artefactIdentity)
        {
            return Request($@"/Utility/GetDataFlowsFromDSD/{artefactIdentity.ID}/{artefactIdentity.Agency}/{artefactIdentity.Version}", HttpMethod.Get, null);
        }

        public string GetFieldForCube(int idCube)
        {
            return Request($@"/Utility/FieldForCube/{idCube}", HttpMethod.Get, null);
        }

        public string GetSeriesForCube(int idCube, DDBDataflow ddbDataflow)
        {
            return Request($@"/Utility/SeriesForCube/{idCube}", HttpMethod.Post, new StringContent(JsonConvert.SerializeObject(ddbDataflow), Encoding.UTF8, "application/json"));
        }

        public void DeleteSeriesForCube(int idCube, List<int> sId)
        {
            Request($@"/Utility/RemoveSeriesForCube/{idCube}", HttpMethod.Put, new StringContent(JsonConvert.SerializeObject(sId), Encoding.UTF8, "application/json"));
        }

        public bool CheckEndPoint()
        {
            if (!IsConfigurated)
            {
                throw Utility.Utils.getCustomException("NODE_DmApi_NOT_FOUND",
                       @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - Node not found.", Infrastructure.STLogging.Interface.LogLevelEnum.Error);
            }

            HttpResponseMessage response = null;

            var request = new HttpRequestMessage(HttpMethod.Get,BaseUrl + "/Utility/CheckEndPoint");

            response = HttpClient.SendAsync(request).Result;

            return response.StatusCode == HttpStatusCode.OK;
        }


        public List<DsdWithDataflow> GetDSDWithDataflow()
        {
            var str = Request($@"/Utility/GetDSDWithDataflow", HttpMethod.Get, null);
            return JsonConvert.DeserializeObject<List<DsdWithDataflow>>(str);
        }

        #region Node Configuration

        /// <summary>
        /// Check if AuthDb have the connection string inizializated
        /// </summary>
        /// <returns></returns>
        public bool IsAuthDBConfigurated()
        {
            var resultStr = Request($@"/Utils/AuthDBConfigurated", HttpMethod.Get, null);
            bool.TryParse(resultStr, out bool result);

            return result;
        }

        public string GetMaSid()
        {
            return Request($@"/Utils/GetMaSid", HttpMethod.Get, null);
        }

        public string CreateTempTableForUniqueValues(string tableName, List<string> values)
        {
            return Request($@"/Utils/createTempTableForUniqueValues/{tableName}", HttpMethod.Post, new StringContent(JsonConvert.SerializeObject(values), Encoding.UTF8, "application/json"));
        }

        public ResultInizializeCheckAuthDb CheckAuthDB(string msSid, string msSidConn)
        {
            var checkData = new JObject(new JProperty("maSid", msSid),
                                            new JProperty("maSidConn", msSidConn));

            var resultStr = Request($@"/Utils/CheckAuthDB", HttpMethod.Post, new StringContent(checkData.ToString(), Encoding.UTF8, "application/json"));
            return JsonConvert.DeserializeObject<ResultInizializeCheckAuthDb>(resultStr);
        }

        public ResultInizializeCheckAuthDb InizializeAuthDb(string msdbConn, string maSid)
        {
            var confData = new JObject(new JProperty("maSidConn", msdbConn),
                                            new JProperty("maSid", maSid));
            var strResult = Request("/Utils/InizializeAuthDb", HttpMethod.Post, new StringContent(confData.ToString(), Encoding.UTF8, "application/json"));

            return JsonConvert.DeserializeObject<ResultInizializeCheckAuthDb>(strResult);
        }


        #endregion

        

    }
}
