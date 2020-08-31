using Infrastructure.STLogging.Interface;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Security.Authentication;
using System.Threading.Tasks;

namespace Metadata_API_WS.connector
{
    public class NodeApiConnector
    {
        private string BaseUrl;
        private string NodeId;
        private HttpClient HttpClient;
        readonly ISTLogger _logger;
        readonly IConfiguration _appConfig;

        public bool IsConfigurated { get; private set; }

        public NodeApiConnector(IConfiguration configuration) {
            NodeId = configuration["NodeId"];
            BaseUrl = configuration["NodeBaseUrl"];
            if (string.IsNullOrWhiteSpace(BaseUrl))
            {
                IsConfigurated = false;
                return;
            }
            IsConfigurated = true;

            HttpClientHandler httpClientHandler = new HttpClientHandler
            {
                UseDefaultCredentials = true,
                Proxy = WebRequest.DefaultWebProxy,
                AutomaticDecompression = DecompressionMethods.GZip | DecompressionMethods.Deflate
            };
            HttpClient = new HttpClient(httpClientHandler, true);
        }

        /// <summary>
        /// Gets a Msd (if all params are null returns all)
        /// </summary>
        /// <param name="id">Artefact id.</param>
        /// <param name="agencyID">Artefact agency.</param>
        /// <param name="version">Artefact version.</param>
        /// <param name="nodeId">Node Id.</param>
        /// <returns>Msd</returns>
        public string GetMetadataStructure(string id, string agencyID, string version, string nodeId = null)
        {
            if (string.IsNullOrWhiteSpace(nodeId) && string.IsNullOrWhiteSpace(this.NodeId))
            {
                throw new Exception("Request nodeId parameter not found!");
            }
                
            string path = "/msd/"+id+"/"+agencyID+"/"+version;
            return RequestString(path, HttpMethod.Get, null, null, nodeId);
        }

        /// <summary>
        /// Gets a Concept Scheme (if all params are null returns all)
        /// </summary>
        /// <param name="id">Artefact id.</param>
        /// <param name="agencyID">Artefact agency.</param>
        /// <param name="version">Artefact version.</param>
        /// <returns>ConceptScheme</returns>
        public string GetConceptScheme(string id, string agencyID, string version, string nodeId = null)
        {
            if (string.IsNullOrWhiteSpace(nodeId) && string.IsNullOrWhiteSpace(this.NodeId))
            {
                throw new Exception("Request nodeId parameter not found!");
            }

            string path = "/conceptScheme/" + id + "/" + agencyID + "/" + version;
            return RequestString(path, HttpMethod.Get, null, null, nodeId);
        }

        /// <summary>
        /// Gets Node Api configurations
        /// </summary>
        /// <returns>Node Api configurations</returns>
        public string GetNodeApiConfig(string nodeId = null)
        {
            if (string.IsNullOrWhiteSpace(nodeId) && string.IsNullOrWhiteSpace(this.NodeId))
            {
                throw new Exception("Request nodeId parameter not found!");
            }
            string path = "/appConfig";
            return RequestString(path, HttpMethod.Get, null, null, nodeId);
        }

        /// <summary>
        /// Download a metadata file from the dmapi file-system.
        /// </summary>
        /// <param name="filename">The file to be download.</param>
        /// <returns>Download the file in case of success, otherwise an exception is thrown.</returns>
        public HttpResponseMessage ReferenceMetadataFileOnServer(string filename, string nodeId = null)
        {
            if (string.IsNullOrWhiteSpace(nodeId) && string.IsNullOrWhiteSpace(this.NodeId))
            {
                throw new Exception("Request nodeId parameter not found!");
            }
            string path = "/ReferenceMetadataFileOnServer?filename=" + filename;
            return Request(path, HttpMethod.Get, null, null, nodeId);
        }

        /// <summary>
        /// Searches a specific MetadataSet by Id.
        /// </summary>
        /// <param name="idMetadataSet">MetadataSet id</param>
        /// <param name="excludeReport">True for not retrieve report data</param>
        /// <param name="withAttributes">False for not retrieve attribute data</param>
        /// <returns>MetadataSet found like sdmx-json message</returns>
        public string GetJsonMetadataSet(string idMetadataSet, bool? excludeReport, bool? withAttributes, string nodeId = null)
        {
            if (string.IsNullOrWhiteSpace(nodeId) && string.IsNullOrWhiteSpace(this.NodeId))
            {
                throw new Exception("Request nodeId parameter not found!");
            }

            string path = "/api/RM/getJsonMetadataset/" + idMetadataSet;
            if (excludeReport.HasValue || withAttributes.HasValue)
            {
                path += "?";
                if (excludeReport.HasValue)
                {
                    path += "excludeReport=" + excludeReport;
                    if (withAttributes.HasValue)
                    {
                        path += "&";
                    }
                }
                if (withAttributes.HasValue)
                {
                    path += "withAttributes=" + withAttributes;
                }
            }
            return RequestString(path, HttpMethod.Get, null, null, nodeId);
        }

        private HttpResponseMessage Request(string path, HttpMethod method, dynamic payload, string guidSession = null, string clientNodeId = null)
        {
            if (!IsConfigurated)
            {
                throw Utility.Utils.getCustomException("NODE_NodeApi_NOT_FOUND",
                       @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - Node not found.", Infrastructure.STLogging.Interface.LogLevelEnum.Error);
            }

            HttpResponseMessage response = null;

            var request = new HttpRequestMessage(method,
                BaseUrl + path);

            if (!string.IsNullOrWhiteSpace(clientNodeId))
            {
                request.Headers.Add("nodeid", clientNodeId);
            }
            else if (!string.IsNullOrWhiteSpace(NodeId))
            {
                request.Headers.Add("nodeid", NodeId);
            }

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
                return response;

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
                throw new Exception("NODE API: " + response.StatusCode + " - " + response.ReasonPhrase);
            }
        }

        private string RequestString(string path, HttpMethod method, dynamic payload, string guidSession = null, string clientNodeId = null)
        {
            HttpResponseMessage response = this.Request(path, method, payload, guidSession, clientNodeId);
            return response.Content.ReadAsStringAsync().Result;
        }
    }
}
