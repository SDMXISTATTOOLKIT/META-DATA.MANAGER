using Connector.Classes;
using Connector.Connectors.Interface;
using DataModel;
using EndpointConnectors;
using NSI.Entities;
using Org.Sdmxsource.Sdmx.Api.Constants;
using Org.Sdmxsource.Sdmx.Api.Model.Objects;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Xml;

namespace Connector.Connectors
{
    public class Sdmx21SOAPConnector : ISdmx21Protocol
    {
        private const string soapContentType = "text/xml;charset=\"utf-8\"";
        private NodeConfig _nodeConfiguration;
        private readonly AppConfig.Defaultheadersubmitstructure _defaultheadersubmitstructure;

        public Sdmx21SOAPConnector(AppConfig.Defaultheadersubmitstructure defaultheadersubmitstructure)
        {
            _defaultheadersubmitstructure = defaultheadersubmitstructure;
        }

        /// <summary>
        /// Configure HttpClient
        /// </summary>
        /// <param name="httpClient"></param>
        /// <param name="nodeConfiguration"></param>
        /// <param name="overwriteFormat">Response format (used only for REST), soap null value.</param>
        /// <returns>Path of file</returns>
        public void ConfigureHttpClient(HttpClient httpClient, NodeConfig nodeConfiguration)
        {
            _nodeConfiguration = nodeConfiguration;
        }

        /// <summary>
        /// Read WSDL and set a Namespace in Endpoint configuration
        /// </summary>
        /// <param name=""></param>
        /// <returns>Path of file</returns>
        public void ConfigureNameSpace(HttpClient httpClient)
        {
            //if (!string.IsNullOrWhiteSpace(_nodeConfiguration.Endpoint.Namespace))
            //{
            //    return;
            //}
            var request = new HttpRequestMessage()
            {
                RequestUri = new Uri(string.IsNullOrWhiteSpace(_nodeConfiguration.Endpoint.InitialWSDL) ? _nodeConfiguration.Endpoint.NSIEndpoint.Trim() + "?wsdl" : _nodeConfiguration.Endpoint.InitialWSDL.Trim()),
                Method = HttpMethod.Get,
            };

            request.Headers.Clear();

            using (var soapResponse = httpClient.SendAsync(request).Result)
            {
                if (soapResponse.StatusCode != HttpStatusCode.OK)
                {
                    throw new Exception("SDMX WS: " + soapResponse.StatusCode + " - " + soapResponse.ReasonPhrase);
                }

                var soapString = soapResponse.Content.ReadAsStringAsync().Result;

                var indexFirst = soapString.IndexOf("targetNamespace=\"", StringComparison.InvariantCultureIgnoreCase);
                if (indexFirst >= 0)
                {
                    var startString = soapString.Substring(indexFirst).Replace("targetNamespace=\"", "", StringComparison.InvariantCultureIgnoreCase);
                    var indexLast = startString.IndexOf('"');
                    if (indexLast >= 0)
                    {
                        _nodeConfiguration.Endpoint.Namespace = startString.Substring(0, indexLast);
                    }
                    else
                    {
                        throw Utility.Utils.getCustomException("WSDL_NOT_FOUND",
                  @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - WSDL_NOT_FOUND",
                  Infrastructure.STLogging.Interface.LogLevelEnum.Error);
                    }
                }
                else
                {
                    throw Utility.Utils.getCustomException("WSDL_NOT_FOUND",
                  @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - WSDL_NOT_FOUND",
                  Infrastructure.STLogging.Interface.LogLevelEnum.Error);
                }
            }
        }


        public HttpRequestMessage GetArtefacts(SdmxStructureEnumType artefact, string id, string agencyID, string version, StructureReferenceDetailEnumType refDetail, string returnDetail = null)
        {
            string soapAct = GetQuerySoapAction(artefact);

            var action = string.Format(
                    CultureInfo.InvariantCulture,
                    "{0}{1}{2}",
                    _nodeConfiguration.Endpoint.Namespace,
                    _nodeConfiguration.Endpoint.Namespace.EndsWith("/", StringComparison.Ordinal) ? string.Empty : "/",
                    soapAct);

            XmlDocument requestQueryMessage = XmlMessage.GetRequestQueryMessageXml(artefact, id, agencyID, version, soapAct, _nodeConfiguration.Endpoint.Prefix, _nodeConfiguration.Endpoint.Namespace, returnDetail, refDetail);

            var request = CreateSoapRequest(_nodeConfiguration.Endpoint.NSIEndpoint, action, requestQueryMessage);
            //if (!string.IsNullOrWhiteSpace(id) && artefact == SdmxStructureEnumType.CodeList)
            //{
            //    request.Headers.Add("Range", "values=0-3");
            //}
            return request;
        }

        /// <summary>
        /// Returns SoapAction associated to each type of artefact.
        /// </summary>
        /// <param name="artefactType"></param>
        /// <returns></returns>
        private static string GetQuerySoapAction(SdmxStructureEnumType artefactType)
        {
            switch (artefactType)
            {
                case SdmxStructureEnumType.CodeList:
                    return "GetCodelist";
                case SdmxStructureEnumType.CategoryScheme:
                    return "GetCategoryScheme";
                case SdmxStructureEnumType.ConceptScheme:
                    return "GetConceptScheme";
                case SdmxStructureEnumType.Dataflow:
                    return "GetDataflow";
                case SdmxStructureEnumType.Dsd:
                    return "GetDataStructure";
                case SdmxStructureEnumType.Categorisation:
                    return "GetCategorisation";
                case SdmxStructureEnumType.MetadataFlow:
                    return "GetMetadataflow";

                case SdmxStructureEnumType.Agency:
                    return "GetOrganisationScheme";

                case SdmxStructureEnumType.AgencyScheme:
                    return "GetOrganisationScheme";
                case SdmxStructureEnumType.DataProviderScheme:
                    return "GetOrganisationScheme";
                case SdmxStructureEnumType.DataConsumerScheme:
                    return "GetOrganisationScheme";
                case SdmxStructureEnumType.OrganisationUnitScheme:
                    return "GetOrganisationScheme";
                case SdmxStructureEnumType.StructureSet:
                    return "GetStructureSet";
                case SdmxStructureEnumType.ContentConstraint:
                    return "GetConstraint";
                case SdmxStructureEnumType.HierarchicalCodelist:
                    return "GetHierarchicalCodelist";
                case SdmxStructureEnumType.Msd:
                    return "GetMetadataStructure";

                default:
                    throw new NotImplementedException();
            }
        }

        /// <summary>
        /// Creates a request setting the proper header.
        /// </summary>
        /// <param name="url"></param>
        /// <param name="action"></param>
        /// <param name="soapEnvelopeXml"></param>
        /// <returns></returns>
        private static HttpRequestMessageWithIdentity CreateSoapRequest(string url, string action, XmlDocument soapEnvelopeXml)
        {
            var request = new HttpRequestMessageWithIdentity(method: HttpMethod.Post, requestUri: url.Trim());
            request.Headers.Add("SOAPAction", action);
            request.Headers.Add("ContentType", soapContentType);
            request.Headers.Add("Accept", "text/xml");
            request.Content = new StringContent(soapEnvelopeXml.OuterXml, Encoding.UTF8, "text/xml");
            return request;
        }

        public HttpRequestMessageWithIdentity CreateArtefacts(ISdmxObjects objs, bool withIdentity)
        {
            return CreateOrUpdateArtefacts(objs, withIdentity);
        }

        public List<HttpRequestMessageWithIdentity> UpdateArtefacts(ISdmxObjects objs, bool withIdentity)
        {
            return new List<HttpRequestMessageWithIdentity> { CreateOrUpdateArtefacts(objs, withIdentity) };
        }

        private HttpRequestMessageWithIdentity CreateOrUpdateArtefacts(ISdmxObjects objs, bool withIdentity)
        {
            XmlMessage XmlMsg = new XmlMessage(_defaultheadersubmitstructure);
            XmlDocument XmlDF = XmlMsg.GetSubmitStructureXmlMessage(_nodeConfiguration.Endpoint.NSIEndpointType, objs, "Replace");
            XmlDocument fullTmpl = XmlMessage.AddEnvelopeToSdmxQuery(XmlDF, "SubmitStructure", _nodeConfiguration.Endpoint.Prefix, _nodeConfiguration.Endpoint.Namespace);
            var request = CreateSoapRequest(_nodeConfiguration.Endpoint.NSIEndpoint, "SubmitStructure", fullTmpl);

            if (withIdentity && request != null)
            {
                var itemMaintainable = objs.GetAllMaintainables();
                foreach (var myCurrentItem in itemMaintainable)
                {
                    var artIdentity = new ArtefactIdentity { Agency = myCurrentItem.AgencyId, ID = myCurrentItem.Id, Version = myCurrentItem.Version, EnumType = myCurrentItem.StructureType.EnumType, IsFinal = myCurrentItem.IsFinal != null && myCurrentItem.IsFinal.IsTrue };
                    request.Identity.Add(artIdentity);
                }
            }

            return request;
        }

        public List<HttpRequestMessageWithIdentity> DeleteArtefact(ISdmxObjects objs, bool withIdentity)
        {
            var XmlMsg = new XmlMessage(_defaultheadersubmitstructure);
            var XmlDF = XmlMsg.GetSubmitStructureXmlMessage(_nodeConfiguration.Endpoint.NSIEndpointType, objs, "Delete");

            var fullTmpl = XmlMessage.AddEnvelopeToSdmxQuery(XmlDF, "SubmitStructure", _nodeConfiguration.Endpoint.Prefix, _nodeConfiguration.Endpoint.Namespace);
            var request = CreateSoapRequest(_nodeConfiguration.Endpoint.NSIEndpoint, "SubmitStructure", fullTmpl);

            if (withIdentity && request != null)
            {
                var itemMaintainable = objs.GetAllMaintainables();
                foreach (var myCurrentItem in itemMaintainable)
                {
                    var artIdentity = new ArtefactIdentity { Agency = myCurrentItem.AgencyId, ID = myCurrentItem.Id, Version = myCurrentItem.Version, EnumType = myCurrentItem.StructureType.EnumType, IsFinal = myCurrentItem.IsFinal != null && myCurrentItem.IsFinal.IsTrue };
                    request.Identity.Add(artIdentity);
                }
            }

            return new List<HttpRequestMessageWithIdentity> { request };
        }

        public void GetNsiImportFileResponse(XmlDocument response, ImportedFileResultBase importedItemResult, List<ArtefactIdentity> artefactIdentity)
        {
            if (response == null)
            {
                var itemRes = new ImportedItemXmlResult.ItemResult();
                foreach (var itemIdentity in artefactIdentity)
                {
                    itemRes.MaintainableObject += $"{itemIdentity.EnumType.ToString()}={itemIdentity.Agency}:{itemIdentity.ID}({itemIdentity.Version}) ";
                    itemRes.IsFinal = itemIdentity.IsFinal.HasValue && itemIdentity.IsFinal.Value;
                }
                itemRes.Status = "NotFound";
                itemRes.Result = "Response 404";
                importedItemResult.HaveError = true;
                importedItemResult.ItemsMessage.Add(itemRes);
                return;
            }

            var nodesSubmissionResult = response.SelectNodes("//*[local-name()='SubmissionResult']");

            var success = new HashSet<string>();
            var fail = new HashSet<string>();

            if (nodesSubmissionResult == null || nodesSubmissionResult.Count <= 0)
            {
                var nodesErrorResult = response.SelectNodes("//*[local-name()='Error']");
                if (nodesErrorResult == null || nodesErrorResult.Count <= 0)
                {
                    return;
                }

                var message = nodesErrorResult[0].InnerText;
                if (nodesErrorResult.Count == 2)
                {
                    message = $"{message} - {nodesErrorResult[1].InnerText}";
                }
                if (nodesErrorResult.Count == 3)
                {
                    message = $"{message} - {nodesErrorResult[1].InnerText} - {nodesErrorResult[2].InnerText}";
                }


                if (artefactIdentity.Count > 0)
                {
                    foreach (var itemIdentity in artefactIdentity)
                    {
                        var mainTable = $"{itemIdentity.EnumType.ToString()}={itemIdentity.Agency}:{itemIdentity.ID}({itemIdentity.Version})";
                        if (!fail.Contains(mainTable))
                        {
                            var itemRes = new ImportedItemXmlResult.ItemResult();
                            itemRes.MaintainableObject = mainTable;
                            itemRes.Status = "Fail";
                            itemRes.IsFinal = itemIdentity.IsFinal.HasValue && itemIdentity.IsFinal.Value;
                            itemRes.Result = message;
                            importedItemResult.HaveError = true;
                            importedItemResult.ItemsMessage.Add(itemRes);
                            fail.Add(mainTable);
                        }
                    }
                }
                else
                {
                    var itemRes = new ImportedItemXmlResult.ItemResult();
                    itemRes.MaintainableObject = "";
                    itemRes.Status = "Fail";
                    itemRes.Result = message;
                    importedItemResult.HaveError = true;
                    importedItemResult.ItemsMessage.Add(itemRes);
                }


                return;
            }
            
            foreach (XmlNode itemNodeResult in nodesSubmissionResult)
            {
                if (itemNodeResult.ChildNodes.Count <= 1)
                {
                    continue;
                }
                var itemRes = new ImportedItemXmlResult.ItemResult();

                var submittedStructure = itemNodeResult.ChildNodes[0];//SubmittedStructure
                if (submittedStructure != null)
                {
                    var nodeUrn = submittedStructure.ChildNodes[0];
                    if (nodeUrn != null)
                    {
                        itemRes.MaintainableObject = nodeUrn.InnerText;
                    }
                }

                var submittedMessage = itemNodeResult.ChildNodes[1];//StatusMessage
                if (submittedMessage == null || submittedMessage.ChildNodes.Count <= 0)
                {
                    continue;
                }
                foreach (XmlNode xhildNodesXErr in submittedMessage.ChildNodes)
                {
                    foreach (XmlNode xErr in xhildNodesXErr.ChildNodes)
                    {
                        if (xErr == null || xErr.InnerText == null)
                        {
                            continue;
                        }
                        itemRes.Result = itemRes.Result.Length > 0 ? $"{itemRes.Result} {xErr.InnerText}" : itemRes.Result = xErr.InnerText;
                       
                        try
                        {
                            var substr = itemRes.MaintainableObject.Split('=')[1];
                            var itemId = substr.Split(':')[1].Split('(')[0];
                            var itemAgencyId = substr.Split(':')[0];
                            var itemVersion = substr.Split('(')[1].Split(')')[0];

                            var itemFind = artefactIdentity.First(i => i.ID.Equals(itemId, StringComparison.InvariantCultureIgnoreCase) ||
                                                                    i.Agency.Equals(itemAgencyId, StringComparison.InvariantCultureIgnoreCase) ||
                                                                    i.Version.Equals(itemVersion, StringComparison.InvariantCultureIgnoreCase));
                            itemRes.IsFinal = itemFind.IsFinal.HasValue && itemFind.IsFinal.Value;
                        }
                        catch (Exception)
                        {

                        }
                    }
                    var status = submittedMessage.Attributes["status"]?.Value;
                    itemRes.Status = status;
                    if (!status.Equals("Success", StringComparison.InvariantCultureIgnoreCase))
                    {
                        if (!fail.Contains(itemRes.MaintainableObject))
                        {
                            importedItemResult.HaveError = true;
                            fail.Add(itemRes.MaintainableObject);
                            importedItemResult.ItemsMessage.Add(itemRes);
                        }
                    }
                    else
                    {
                        if (!success.Contains(itemRes.MaintainableObject))
                        {
                            success.Add(itemRes.MaintainableObject);
                            importedItemResult.ItemsMessage.Add(itemRes);
                        }
                    }
                }
            }
        }

        public void ParseNsiErrorMessages(XmlDocument response)
        {
            string msg = "";

            //espressione xPath per prendere eventuali msg di errore
            XmlNodeList nodes = response.SelectNodes("//*[local-name() = 'StatusMessage'][@status= 'Failure']");
            if (nodes != null && nodes.Count > 0)
            {
                //parso i messaggi
                XmlNodeList nodeList = response.SelectNodes("//*[local-name() = 'StatusMessage'][@status= 'Failure']/*[local-name() = 'MessageText']/*[local-name() = 'Text']");

                if (nodeList != null && nodeList.Count > 0)
                {
                    foreach (XmlNode childNode in nodeList)
                    {
                        if (true /*childNode.InnerText.StartsWith("Failure", StringComparison.InvariantCultureIgnoreCase) || childNode.InnerText.StartsWith("Not Deleted", StringComparison.InvariantCultureIgnoreCase) || childNode.InnerText.StartsWith("Not Updated", StringComparison.InvariantCultureIgnoreCase)*/)
                        {
                            msg += childNode.InnerText;
                            msg += System.Environment.NewLine;
                        }
                    }
                }
                throw new Exception("SDMX WS Error - " + msg);
            }


            var nodesErrorResult = response.SelectNodes("//*[local-name() = 'Fault']");
            if (nodesErrorResult == null || nodesErrorResult.Count <= 0)
            {
                return;
            }

            var nodeList2 = response.SelectNodes("//*[local-name() = 'Fault']/*[local-name() = 'detail']/*[local-name() = 'Error']/*[local-name() = 'ErrorMessage']");

            if (nodeList2 != null && nodeList2.Count > 0)
            {
                foreach (XmlNode childNode in nodeList2)
                {
                    msg += childNode.InnerText;
                    msg += System.Environment.NewLine;
                }
            }
            throw new Exception("SDMX WS Error - " + msg);
        }

    }
}
