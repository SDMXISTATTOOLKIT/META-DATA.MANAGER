using Connector.Classes;
using Connector.Connectors.Interface;
using DataModel;
using EndpointConnectors;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Configuration;
using NSI.Entities;
using Org.Sdmxsource.Sdmx.Api.Constants;
using Org.Sdmxsource.Sdmx.Api.Model.Objects;
using Org.Sdmxsource.Sdmx.Api.Model.Objects.Base;
using Org.Sdmxsource.Sdmx.Api.Model.Objects.CategoryScheme;
using Org.Sdmxsource.Sdmx.Api.Model.Objects.Codelist;
using Org.Sdmxsource.Sdmx.Api.Model.Objects.ConceptScheme;
using Org.Sdmxsource.Sdmx.Api.Model.Objects.DataStructure;
using Org.Sdmxsource.Sdmx.Api.Model.Objects.Mapping;
using Org.Sdmxsource.Sdmx.Api.Model.Objects.Registry;
using Org.Sdmxsource.Sdmx.Util.Objects.Container;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Security.Authentication;
using System.Text;
using System.Xml;
using Utility;

namespace Connector.Connectors
{
    public class Sdmx21RESTConnector : ISdmx21Protocol
    {
        private const string restAccept = "application/vnd.sdmx.structure+xml;version=2.1";
        private NodeConfig _nodeConfiguration;
        private readonly AppConfig.Defaultheadersubmitstructure _defaultheadersubmitstructure;

        public Sdmx21RESTConnector(AppConfig.Defaultheadersubmitstructure defaultheadersubmitstructure)
        {
            _defaultheadersubmitstructure = defaultheadersubmitstructure;
        }

        /// <summary>
        /// Configure HttpClient
        /// </summary>
        /// <param name="httpClient"></param>
        /// <param name="nodeConfiguration"></param>
        /// <returns>Path of file</returns>
        public void ConfigureHttpClient(HttpClient httpClient, NodeConfig nodeConfiguration)
        {
            _nodeConfiguration = nodeConfiguration;
            httpClient.DefaultRequestHeaders.Add("Accept", restAccept);
        }

        public HttpRequestMessage GetArtefacts(SdmxStructureEnumType artefact, string id, string agencyID, string version, StructureReferenceDetailEnumType refDetail, string returnDetail = null)
        {
            var withLike = false; //I don't find any case of TRUE
            var restquery = ComposeRestQuery(artefact, withLike, id, agencyID, version, refDetail, returnDetail);
            var request = CreateRestRequest(restquery, null, HttpMethod.Get);
            //if (!string.IsNullOrWhiteSpace(id) && artefact == SdmxStructureEnumType.CodeList)
            //{
            //    //Limit Items Return
            //    request.Headers.Add("Range", "values=0-300");
            //}
            return request;
        }

        private HttpRequestMessageWithIdentity CreateRestRequest(string paramiters, string bodyXml, HttpMethod method)
        {
            Uri url = new Uri(_nodeConfiguration.Endpoint.NSIEndpoint.Trim());
            if (!url.LocalPath.EndsWith("/"))
            {
                url = new Uri(_nodeConfiguration.Endpoint.NSIEndpoint.Replace(url.LocalPath, url.LocalPath + "/"));
            }

            var request = new HttpRequestMessageWithIdentity(method: method, requestUri: $"{url}{paramiters}");
            
            if (!String.IsNullOrWhiteSpace(bodyXml))
            {
                request.Content = new StreamContent(new MemoryStream(Encoding.UTF8.GetBytes(bodyXml)));
            }

            return request;
        }
        
        private string ComposeRestQuery(SdmxStructureEnumType artefactType, bool withLike, string id, string agencyID, string version, StructureReferenceDetailEnumType refDetail, string returnDetail)
        {
            if (!string.IsNullOrWhiteSpace(returnDetail) && returnDetail.Equals("stub", StringComparison.InvariantCultureIgnoreCase))
            { //Mapping name from SOAP to REST
                returnDetail = _nodeConfiguration.Endpoint.SupportAllCompleteStubs ? "allcompletestubs" : "allstubs";
            }
            string originalReturnDetail = returnDetail;
            string queryRest = "";

            queryRest += ArtefactDataModel.BL.Utility.GetArtefactTypeString(artefactType);

            // SET ID,Agency 
            if (!withLike)
            {
                queryRest += "/" + (!string.IsNullOrWhiteSpace(agencyID) ? agencyID : "all");
                queryRest += "/" + (!string.IsNullOrWhiteSpace(id) ? id : "all");
                if (!string.IsNullOrWhiteSpace(version))
                {
                    queryRest += $"/{version}";
                }
                else
                {
                    queryRest += $"/all";
                }
            }
            else
            {
                queryRest += "/all/all/all";
            }

            returnDetail = _nodeConfiguration.Endpoint.SupportAllCompleteStubs ? "allcompletestubs" : "allstubs";
            bool isSingleArtefactRequest = id != null && agencyID != null && version != null;
            returnDetail = isSingleArtefactRequest || refDetail != StructureReferenceDetailEnumType.None ||
                artefactType == SdmxStructureEnumType.Dsd || artefactType == SdmxStructureEnumType.Dataflow || artefactType == SdmxStructureEnumType.Categorisation || artefactType == SdmxStructureEnumType.Agency || artefactType == SdmxStructureEnumType.AgencyScheme || artefactType == SdmxStructureEnumType.ContentConstraint || artefactType == SdmxStructureEnumType.MetadataFlow ? "Full" : returnDetail;

            
            if (!string.IsNullOrWhiteSpace(originalReturnDetail))
            {
                returnDetail = originalReturnDetail;
            }
            queryRest += $"/?detail={returnDetail}&references={refDetail.ToString()}";

            return queryRest;
        }

        public HttpRequestMessageWithIdentity CreateArtefacts(ISdmxObjects objs, bool withIdentity = true)
        {
            XmlMessage XmlMsg = new XmlMessage(_defaultheadersubmitstructure);
            XmlDocument XmlDF = XmlMsg.GetSubmitStructureXmlMessage(_nodeConfiguration.Endpoint.NSIEndpointType, objs, "Replace");

            var request = CreateRestRequest("structure/", XmlDF.InnerXml, HttpMethod.Post);

            if (withIdentity && request != null)
            {
                var itemCreate = objs.GetAllMaintainables();
                if (itemCreate != null)
                {
                    foreach (var myCurrentItem in itemCreate)
                    {
                        var artIdentity = new ArtefactIdentity { Agency = myCurrentItem.AgencyId, ID = myCurrentItem.Id, Version = myCurrentItem.Version, EnumType = myCurrentItem.StructureType.EnumType, IsFinal = myCurrentItem.IsFinal != null &&myCurrentItem.IsFinal.IsTrue };
                        request.Identity.Add(artIdentity);
                    }
                }   
            }

            return request;
        }

        public List<HttpRequestMessageWithIdentity> UpdateArtefacts(ISdmxObjects sdmxObjects, bool withIdentity = true)
        {
            var requests = new List<HttpRequestMessageWithIdentity>();

            XmlMessage XmlMsg = new XmlMessage(_defaultheadersubmitstructure);

            var itemUpdate = sdmxObjects.GetAllMaintainables();

            if (itemUpdate != null)
            {
                foreach (var myCurrentItem in itemUpdate)
                { //REST permit one update at a time
                    ISdmxObjects editSdmxObjects = new SdmxObjectsImpl();
                    var artIdentity = new ArtefactIdentity { Agency = myCurrentItem.AgencyId, ID = myCurrentItem.Id, Version = myCurrentItem.Version, EnumType = myCurrentItem.StructureType.EnumType, IsFinal = myCurrentItem.IsFinal != null && myCurrentItem.IsFinal.IsTrue };

                    //Popolate data artIdentity from sdmxObjects to editSdmxObjects
                    SdmxUtils.PopolateSdmxObject(artIdentity,
                                                sdmxObjects,
                                                editSdmxObjects);
                    
                    XmlDocument XmlDF = XmlMsg.GetSubmitStructureXmlMessage(_nodeConfiguration.Endpoint.NSIEndpointType, editSdmxObjects, "Replace");
                    var queryString = $"{ArtefactDataModel.BL.Utility.GetArtefactTypeString(myCurrentItem.StructureType)}/{myCurrentItem.AgencyId}/{myCurrentItem.Id}/{myCurrentItem.Version}";
                    var request = CreateRestRequest(queryString, XmlDF.InnerXml, HttpMethod.Put);

                    if (withIdentity)
                    {
                        request.Identity = new List<ArtefactIdentity> { artIdentity };
                    }

                    requests.Add(request);
                }
            }

            return requests;
        }

        public List<HttpRequestMessageWithIdentity> DeleteArtefact(ISdmxObjects objs, bool withIdentity = true)
        {
            var requests = new List<HttpRequestMessageWithIdentity>();
            var itemDelete = objs.GetAllMaintainables();

            if (itemDelete != null)
            {
                foreach (var item in itemDelete)
                { //REST permit one delete at a time
                    var queryString = $"{ArtefactDataModel.BL.Utility.GetArtefactTypeString(item.StructureType)}/{item.AgencyId}/{item.Id}/{item.Version}";
                    var request = CreateRestRequest(queryString, "", HttpMethod.Delete);

                    if (withIdentity)
                    {
                        var identity = new ArtefactIdentity(item.Id, item.AgencyId, item.Version);
                        identity.EnumType = item.StructureType;
                        identity.IsFinal = item.IsFinal != null && item.IsFinal.IsTrue;
                        request.Identity = new List<ArtefactIdentity> { identity };
                    }
                    
                    requests.Add(request);
                }
            }

            return requests;
        }

        public void GetNsiImportFileResponse(XmlDocument response, ImportedFileResultBase importedItemResult, List<ArtefactIdentity> artefactIdentity)
        {
            var success = new HashSet<string>();
            var fail = new HashSet<string>();

            if (response == null)
            {
                if (artefactIdentity.Count>0)
                {
                    foreach (var itemIdentity in artefactIdentity)
                    {
                        var mainTable = $"{itemIdentity.EnumType.ToString()}={itemIdentity.Agency}:{itemIdentity.ID}({itemIdentity.Version})";
                        if (!fail.Contains(mainTable))
                        {
                            var itemRes = new ImportedItemXmlResult.ItemResult();
                            itemRes.MaintainableObject = mainTable;
                            itemRes.IsFinal = itemIdentity.IsFinal.HasValue && itemIdentity.IsFinal.Value;
                            itemRes.Status = "NotFound";
                            itemRes.Result = "Response 404";
                            importedItemResult.HaveError = true;
                            importedItemResult.ItemsMessage.Add(itemRes);
                            fail.Add(mainTable);
                        }
                    }
                }
                else
                {
                    var itemRes = new ImportedItemXmlResult.ItemResult();
                    itemRes.MaintainableObject ="";
                    itemRes.Status = "NotFound";
                    itemRes.Result = "Response 404";
                    importedItemResult.HaveError = true;
                    importedItemResult.ItemsMessage.Add(itemRes);
                }
                return;
            }

            if (string.IsNullOrWhiteSpace(response.InnerText) || response.InnerText.StartsWith("Created", StringComparison.InvariantCultureIgnoreCase))
            {
                if (artefactIdentity.Count > 0)
                {
                    foreach (var itemIdentity in artefactIdentity)
                    {
                        var mainTable = $"{itemIdentity.EnumType.ToString()}={itemIdentity.Agency}:{itemIdentity.ID}({itemIdentity.Version})";
                        if (!success.Contains(mainTable))
                        {
                            var itemRes = new ImportedItemXmlResult.ItemResult();
                            itemRes.MaintainableObject = $"{itemIdentity.EnumType.ToString()}={itemIdentity.Agency}:{itemIdentity.ID}({itemIdentity.Version})";
                            itemRes.IsFinal = itemIdentity.IsFinal.HasValue && itemIdentity.IsFinal.Value;
                            itemRes.Result = "Success";
                            itemRes.Status = "Success";
                            importedItemResult.ItemsMessage.Add(itemRes);
                            success.Add(mainTable);
                        }
                    }
                }
                else
                {
                    var itemRes = new ImportedItemXmlResult.ItemResult();
                    itemRes.MaintainableObject = "";
                    itemRes.Result = "Success";
                    itemRes.Status = "Success";
                    importedItemResult.ItemsMessage.Add(itemRes);
                }
                    
                return;
            }

            var allError = response.SelectNodes("//*[local-name() = 'Error']");
            if (allError == null)
            {
                return;
            }

            var warning = new HashSet<string>();
            foreach (XmlNode item in allError)
            {
                foreach (XmlNode child in item.ChildNodes)
                { //parse message
                    var itemRes = new ImportedItemXmlResult.ItemResult();
                    foreach (var itemIdentity in artefactIdentity)
                    {
                        itemRes.MaintainableObject += $"{itemIdentity.EnumType.ToString()}={itemIdentity.Agency}:{itemIdentity.ID}({itemIdentity.Version}) ";
                        itemRes.IsFinal = itemIdentity.IsFinal.HasValue && itemIdentity.IsFinal.Value;
                    }
                    var errorCode = child.Attributes["code"].Value;
                    if (!string.IsNullOrWhiteSpace(errorCode))
                    {
                        errorCode = $"[{errorCode}]: ";
                    }
                    itemRes.Result = $"{errorCode}{item.InnerText}";
                    itemRes.Status = "Warning";

                    if (!warning.Contains(itemRes.MaintainableObject))
                    {
                        importedItemResult.HaveError = true;
                        importedItemResult.ItemsMessage.Add(itemRes);
                        warning.Add(itemRes.MaintainableObject);
                    }
                }
            }
        }

        public void ParseNsiErrorMessages(XmlDocument response)
        {
            if (string.IsNullOrWhiteSpace(response.InnerText))
            {
                return;
            }
            
            //Error message in REST format
            var msg = new StringBuilder();
            var allError = response.SelectNodes("//*[local-name() = 'Error']");
            if (allError == null)
            {
                return;
            }
            foreach (XmlNode item in allError)
            {
                foreach (XmlNode child in item.ChildNodes)
                { //parse message
                    var errorCode = child.Attributes["code"].Value;
                    if (errorCode == "201" || errorCode == "200")
                    {
                        continue;
                    }
                    if (!string.IsNullOrWhiteSpace(errorCode))
                    {
                        errorCode = $"[{errorCode}]: ";
                    }
                    msg.AppendLine($"{errorCode}{item.InnerText}");
                }
            }
            if (msg.Length > 0)
            {
                throw new Exception("SDMX WS Error - " + msg);
            }


            //If the return error in SOAP format (remote hypothesis)
            //xPath expression to take any error msg
            XmlNodeList nodes = response.SelectNodes("//*[local-name() = 'StatusMessage'][@status= 'Failure']");
            if (nodes != null && nodes.Count > 0)
            { //parse message
                XmlNodeList nodeList = response.SelectNodes("//*[local-name() = 'StatusMessage'][@status= 'Failure']/*[local-name() = 'MessageText']/*[local-name() = 'Text']");

                if (nodeList != null && nodeList.Count > 0)
                {
                    foreach (XmlNode childNode in nodeList)
                    {
                        if (childNode.InnerText.StartsWith("Failure", StringComparison.InvariantCultureIgnoreCase) || childNode.InnerText.StartsWith("Not Deleted", StringComparison.InvariantCultureIgnoreCase))
                        {
                            msg.AppendLine(childNode.InnerText);
                        }
                    }
                }
                throw new Exception("SDMX WS Error - " + msg);
            }
        }

        public void ConfigureNameSpace(HttpClient httpClient)
        {
            //REST NO NEED NAMESPACE FROM WSDL
        }
    }
}
