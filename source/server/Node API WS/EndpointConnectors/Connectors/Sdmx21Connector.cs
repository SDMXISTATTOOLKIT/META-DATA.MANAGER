using AuthCore.Model;
using Connector.Classes;
using Connector.Connectors;
using Connector.Connectors.Interface;
using DataModel;
using Infrastructure.STLogging.Factory;
using Infrastructure.STLogging.Interface;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Caching.Memory;
using NSI.Entities;
using Org.Sdmxsource.Sdmx.Api.Constants;
using Org.Sdmxsource.Sdmx.Api.Manager.Parse;
using Org.Sdmxsource.Sdmx.Api.Model;
using Org.Sdmxsource.Sdmx.Api.Model.Mutable;
using Org.Sdmxsource.Sdmx.Api.Model.Mutable.Base;
using Org.Sdmxsource.Sdmx.Api.Model.Mutable.CategoryScheme;
using Org.Sdmxsource.Sdmx.Api.Model.Mutable.Codelist;
using Org.Sdmxsource.Sdmx.Api.Model.Mutable.ConceptScheme;
using Org.Sdmxsource.Sdmx.Api.Model.Mutable.DataStructure;
using Org.Sdmxsource.Sdmx.Api.Model.Mutable.Mapping;
using Org.Sdmxsource.Sdmx.Api.Model.Mutable.MetadataStructure;
using Org.Sdmxsource.Sdmx.Api.Model.Mutable.Registry;
using Org.Sdmxsource.Sdmx.Api.Model.Objects;
using Org.Sdmxsource.Sdmx.Api.Model.Objects.Base;
using Org.Sdmxsource.Sdmx.Api.Model.Objects.CategoryScheme;
using Org.Sdmxsource.Sdmx.Api.Model.Objects.Codelist;
using Org.Sdmxsource.Sdmx.Api.Model.Objects.ConceptScheme;
using Org.Sdmxsource.Sdmx.Api.Model.Objects.DataStructure;
using Org.Sdmxsource.Sdmx.Api.Model.Objects.Mapping;
using Org.Sdmxsource.Sdmx.Api.Model.Objects.MetadataStructure;
using Org.Sdmxsource.Sdmx.Api.Model.Objects.Registry;
using Org.Sdmxsource.Sdmx.SdmxObjects.Model.Mutable.Base;
using Org.Sdmxsource.Sdmx.Structureparser.Manager.Parsing;
using Org.Sdmxsource.Sdmx.Util.Objects.Container;
using Org.Sdmxsource.Util.Io;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Net.Security;
using System.Security.Authentication;
using System.Security.Claims;
using System.Security.Cryptography.X509Certificates;
using System.Text;
using System.Xml;
using System.Xml.Linq;
using Utility;

namespace EndpointConnectors.Connectors
{
    public class Sdmx21Connector : ISdmx21Connector
    {
        /// <summary>
        /// The HTTP HEADER Content type value
        /// </summary>

        private const string namespaceMessage = "http://www.sdmx.org/resources/sdmxml/schemas/v2_1/message";

        readonly HttpClient _HttpClient;
        readonly HttpClientHandler _httpClientHandler;
        readonly NodeConfig _nodeConfiguration;
        readonly ISdmx21Protocol _protocol;
        readonly IHttpContextAccessor _contextAccessor;
        readonly ISTLogger _logger;
        readonly IMemoryCache _memoryCache;
        readonly AppConfig _appConfig;


        public Sdmx21Connector(NodeConfig nodeConfiguration, HttpClientHandler httpClientHandler, IMemoryCache memoryCache, AppConfig appConfig, IHttpContextAccessor contextAccessor, bool bypassCache)
        {
            _logger = STLoggerFactory.Logger;
            _nodeConfiguration = nodeConfiguration;
            _contextAccessor = contextAccessor;
            _httpClientHandler = httpClientHandler;
            _memoryCache = memoryCache;
            _appConfig = appConfig;

            if (_nodeConfiguration.Endpoint.NSIEndpointType.Equals("SOAP", StringComparison.InvariantCultureIgnoreCase))
            {
                _protocol = new Sdmx21SOAPConnector(appConfig.DefaultHeaderSubmitStructure);
            }
            else
            {
                _protocol = new Sdmx21RESTConnector(appConfig.DefaultHeaderSubmitStructure);
            }
            _HttpClient = createNewHttpClient(false, bypassCache);
            _HttpClient.DefaultRequestHeaders.Add("Accept-Encoding", "gzip, deflate");
        }

        private HttpClient createNewHttpClient(bool longOperation, bool bypassCache)
        {
            HttpClient newHttpClient;

            bypassCache = true;
            if (longOperation || _memoryCache == null || bypassCache)
            {
                if (_httpClientHandler == null)
                {

                    newHttpClient = new HttpClient(new HttpClientHandler
                    {
                        UseDefaultCredentials = true,
                        Proxy = WebRequest.DefaultWebProxy,
                        AutomaticDecompression = DecompressionMethods.GZip | DecompressionMethods.Deflate
                    }, true);
                }
                else
                {
                    newHttpClient = new HttpClient(_httpClientHandler, true);
                }
                newHttpClient.Timeout = longOperation ? TimeSpan.FromHours(5) : TimeSpan.FromMinutes(_appConfig.EndpointSetting.NsiTimeOut);
                if (!string.IsNullOrWhiteSpace(_nodeConfiguration.General.Username))
                {
                    newHttpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Basic", Convert.ToBase64String(Encoding.ASCII.GetBytes($"{_nodeConfiguration.General.Username}:{_nodeConfiguration.General.Password}")));
                }
                else if (!string.IsNullOrWhiteSpace(_nodeConfiguration.Endpoint.NSIReadOnlyUsername))
                {
                    newHttpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Basic", Convert.ToBase64String(Encoding.ASCII.GetBytes($"{_nodeConfiguration.Endpoint.NSIReadOnlyUsername}:{_nodeConfiguration.Endpoint.NSIReadOnlyPassword}")));
                }
            }
            else
            {
                newHttpClient = new ProxyHttpClient(_memoryCache).Create(_httpClientHandler, _nodeConfiguration, EndPointType.SDMX, longOperation ? 300 : 60);
            }

            _protocol.ConfigureHttpClient(newHttpClient, _nodeConfiguration);

            return newHttpClient;
        }

        public void ConfigureNameSpace()
        {
            _protocol.ConfigureNameSpace(_HttpClient);
        }

        #region CRUD

        public ISdmxObjects GetArtefacts(SdmxStructureEnumType artefact, string id, string agencyID, string version, StructureReferenceDetailEnumType refDetail = StructureReferenceDetailEnumType.None, string returnDetail = null)
        {
            HttpRequestMessage request = _protocol.GetArtefacts(artefact, id, agencyID, version, refDetail, returnDetail);
            XmlDocument response = SendRequest(request);

            if (response == null)
                return new SdmxObjectsImpl();

            return LoadSdmxObjects(response);
        }

        public bool CreateArtefacts(ISdmxObjects objs, bool withIdentity = false)
        {
            FilterResultByAgency(objs);
            return commonCreateArtefacts(objs, withIdentity);
        }

        public bool CreateArtefactsWithoutFilter(ISdmxObjects objs, bool withIdentity = false)
        {
            return commonCreateArtefacts(objs, withIdentity);
        }

        private bool commonCreateArtefacts(ISdmxObjects objs, bool withIdentity)
        {
            if (objs.GetAllMaintainables().Count <= 0)
            {
                throw Utils.getCustomException("ARTEFACTS_EMPTY",
                           @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - There aren't artefact to create.", Infrastructure.STLogging.Interface.LogLevelEnum.Error);
            }
            else if (objs.GetAllMaintainables().Count == 1)
            {
                var item = objs.GetAllMaintainables().First();
                var result = GetArtefacts(item.StructureType, item.Id, item.AgencyId, item.Version, StructureReferenceDetailEnumType.None, "Stub");
                if (result != null && result.GetAllMaintainables().Count > 0 && result.GetAllMaintainables().First().IsFinal.IsTrue)
                {
                    throw Utils.getCustomException("FINAL_ARTEFACTS_EXIST",
                           @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - Cannot create artefacts, already exist and final.", Infrastructure.STLogging.Interface.LogLevelEnum.Error);
                }

            }
            withIdentity = objs.Dataflows.Count > 0 || objs.Metadataflows.Count > 0;
            var request = _protocol.CreateArtefacts(objs, withIdentity);

            SendRequest(request);
            
            return true;
        }


        public bool UpdateArtefacts(ISdmxObjects objs, bool withIdentity = false, bool filterByAgency = true, bool settAnnotationChanged = true, string DDBConnectionString = null)
        {
            if (filterByAgency)
                FilterResultByAgency(objs);

            if (objs.GetAllMaintainables().Count <= 0)
            {
                throw Utils.getCustomException("ARTEFACTS_EMPTY",
                           @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - There aren't artefact to update.", Infrastructure.STLogging.Interface.LogLevelEnum.Error);
            }

            if (settAnnotationChanged)
            {
                foreach (var item in objs.Codelists)
                {
                    if (item.IsFinal != null && item.IsFinal.IsTrue)
                    {
                        var changed = item.Annotations.FirstOrDefault(annotation => annotation.Type != null &&  annotation.Type.Equals(_nodeConfiguration.Annotations.Changed));
                        if (changed == null)
                        {
                            IAnnotationMutableObject annotation = new AnnotationMutableCore()
                            {
                                Type = _nodeConfiguration.Annotations.Changed,
                                Id = _nodeConfiguration.Annotations.Changed,
                                Title = DDBConnectionString
                            };
                            objs.RemoveCodelist(item);
                            var codeList = item.MutableInstance;
                            codeList.Annotations.Add(annotation);
                            objs.AddCodelist(codeList.ImmutableInstance);
                        }
                    }
                }
            }

            var requests = _protocol.UpdateArtefacts(objs, withIdentity);

            foreach (var item in requests)
            {
                SendRequest(item);
            }

            return true;
        }

        public bool DeleteArtefact(ISdmxObjects objs, bool withIdentity = false)
        {
            FilterResultByAgency(objs);

            return commonDeleteArtefact(objs, withIdentity);
        }

        public bool DeleteArtefactWithoutFilter(ISdmxObjects objs, bool withIdentity = false)
        {
            return commonDeleteArtefact(objs, withIdentity);
        }

        private bool commonDeleteArtefact(ISdmxObjects objs, bool withIdentity)
        {
            if (objs.GetAllMaintainables().Count <= 0)
            {
                throw Utils.getCustomException("ARTEFACTS_EMPTY",
                           @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - There aren't artefact to delete.", Infrastructure.STLogging.Interface.LogLevelEnum.Error);
            }

            var requests = _protocol.DeleteArtefact(objs, withIdentity);

            var result = true;
            foreach (var item in requests)
            {
                var requestResult = SendRequest(item);
                if (requestResult == null && requests.Count <= 1)
                {
                    result = false;
                }
            }

            return result;
        }

        #endregion

        public bool PingEndPoint()
        {
            ServicePointManager.ServerCertificateValidationCallback =
            delegate (
                object s,
                X509Certificate certificate,
                X509Chain chain,
                SslPolicyErrors sslPolicyErrors
            ) {
                return true;
            };

            var pingArtefact = SdmxStructureEnumType.Null;
            if (!string.IsNullOrWhiteSpace(_nodeConfiguration.Endpoint.PingArtefact))
            {
                pingArtefact = ArtefactDataModel.BL.Utility.GetArtefactTypeEnum(_nodeConfiguration.Endpoint.PingArtefact);
            }
            if (pingArtefact == SdmxStructureEnumType.Null)
            {
                pingArtefact = SdmxStructureEnumType.ConceptScheme;
            }

            try
            {
                HttpRequestMessage request = _protocol.GetArtefacts(pingArtefact, null, null, null, StructureReferenceDetailEnumType.None, "Stub");
                XmlDocument response = SendRequest(request);
                if (response == null)
                {
                    _logger.Log($"PingEndPoint SDMX Return False", Infrastructure.STLogging.Interface.LogLevelEnum.Error);
                    return false;
                }
            }
            catch (Exception ex)
            {
                _logger.Log($"PingEndPoint SDMX Error: {ex.Message}", Infrastructure.STLogging.Interface.LogLevelEnum.Error);
                return false;
            }

            return true;
        }

        /// <summary>
        /// Sends a soap request. And return Execption in case of error
        /// </summary>
        /// <param name="request"></param>
        /// <returns></returns>
        private XmlDocument SendRequest(HttpRequestMessage request)
        {
            var responseXml = sendRequest(request, false);

            if (responseXml == null)
                return null;

            _protocol.ParseNsiErrorMessages(responseXml);

            return responseXml;
        }

        /// <summary>
        /// Sends a soap request and return message of the response
        /// </summary>
        /// <param name="request"></param>
        /// <returns></returns>
        private XmlDocument SendRequestWithoutErrorException(HttpRequestMessage request)
        {
            return sendRequest(request, false);
        }

        private XmlDocument SendRequestWithoutErrorException(HttpRequestMessage request, bool longOperation)
        {
            return sendRequest(request, longOperation);
        }

        private XmlDocument sendRequest(HttpRequestMessage request, bool longOperation)
        {
            HttpClient currentClient = _HttpClient;
            if (longOperation)
            {
                currentClient = createNewHttpClient(true, false);
                currentClient.DefaultRequestHeaders.Add("Accept-Encoding", "gzip, deflate");
            }
            using (var response = currentClient.SendAsync(request).Result)
            {
                if (response.StatusCode == HttpStatusCode.NotFound)
                {
                    //throw new Exception("SDMX WS: No artefacts found.");
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

                XmlDocument responseXml;

                try
                {
                    var soapResult = response.Content.ReadAsStringAsync().Result;
                    responseXml = new XmlDocument();
                    if (!String.IsNullOrWhiteSpace(soapResult))
                    {
                        responseXml.LoadXml(soapResult);
                    }
                }
                catch (Exception)
                {
                    throw new Exception("SDMX WS: " + response.StatusCode + " - " + response.ReasonPhrase);
                }

                if (responseXml.InnerText.Contains("No Results Found"))
                {
                    //throw new Exception("SDMX WS: No artefacts found.");
                    return null;
                }
                return responseXml;
            }
        }

        /// <summary>
        /// Convert an XmlDocument to an array of bytes.
        /// </summary>
        /// <param name="doc"></param>
        /// <returns></returns>
        private static byte[] ConvertToBytes(XmlDocument doc)
        {
            Encoding encoding = Encoding.UTF8;
            byte[] docAsBytes = encoding.GetBytes(doc.OuterXml);
            return docAsBytes;
        }

        /// <summary>
        /// Parses an a XmlDocument and get SdmxObjects contained in it.
        /// </summary>
        /// <param name="xDomSource"></param>
        /// <returns></returns>
        private static ISdmxObjects LoadSdmxObjects(XmlDocument xDomSource)
        {
            string xmlTemplate =
                $@"<?xml version=""1.0"" encoding=""UTF-8""?>
                <mes:Structure xmlns:mes=""{namespaceMessage}"">
                    <mes:Header>
                        <mes:ID>ISTATRegistryRetrieveTemplate</mes:ID>
                        <mes:Test>false</mes:Test>
                        <mes:Prepared>2014-05-06T21:53:11.874Z</mes:Prepared>
                        <mes:Sender id=""MG""/>
                        <mes:Receiver id=""unknown""/>
                    </mes:Header>
                </mes:Structure>";

            // Il documento template che verrà caricato con gli artefatti da importare
            XmlDocument xDomTemp = new XmlDocument();

            // Creo gli elementi del file template
            xDomTemp.InnerXml = xmlTemplate;

            // Il nodo root "Structure" del template
            XmlNode xTempStructNode = xDomTemp.SelectSingleNode("//*[local-name()='Structure']");

            // Creo il nodo "Structures" che conterrà gli artefatti
            XmlNode xSourceStructNode = xDomTemp.CreateNode(XmlNodeType.Element, "Structures", namespaceMessage);

            // Inserisco nel nodo "Structures" gli artefatti presenti nell' sdmx passato in input
            xSourceStructNode.InnerXml = xDomSource.SelectSingleNode("//*[local-name()='Structures']").InnerXml;

            // Aggiungo al template l'elemento "Structures" con gli artefatti da caricare
            xTempStructNode.AppendChild(xSourceStructNode);

            XmlMessage.FixDataType(xDomTemp);
            XmlMessage.FixLocale(xDomTemp, "la", "lo");

            // Converto il documento in un MemoryReadableLocation
            MemoryReadableLocation mRL = new MemoryReadableLocation(ConvertToBytes(xDomTemp));

            IStructureParsingManager _parsingManager = new StructureParsingManager();

            // Parse structures IStructureParsingManager is an instance field.
            IStructureWorkspace structureWorkspace = _parsingManager.ParseStructures(mRL);

            // Get immutable objects from workspace
            return structureWorkspace.GetStructureObjects(true);
        }



        #region Import XML


        //START CHECK FILE XML
        public List<ImportedItemXml> CheckImportedFileXmlSdmxObjects(string filePath, List<AppConfig.LanguageData> languages, bool filterAgency)
        {
            // Create SDMXObjects from XMLDocument
            var sdmxObjects = GetSdmxObjectsFromFileXML(filePath);

            var items = CheckAllObjectItem(sdmxObjects, languages, filterAgency);

            return items;
        }

        /// <summary>
        /// Create a ISdmxObjects from File XML
        /// </summary>
        /// <param name="filePath"></param>
        /// <returns>Path of file</returns>
        public ISdmxObjects GetSdmxObjectsFromFileXML(string filePath)
        {
            _logger.Log($"BusinessLogic GetSdmxObjectsFromFileXML start", Infrastructure.STLogging.Interface.LogLevelEnum.Debug);
            // Load XMLDOcument from File
            var xDocStructure = new XmlDocument();
            xDocStructure.Load(filePath);
            Org.Sdmxsource.Sdmx.Api.Util.IReadableDataLocation rdl = new Org.Sdmxsource.Util.Io.XmlDocReadableDataLocation(xDocStructure);
            StructureParsingManager spm = new StructureParsingManager();
            IStructureWorkspace workspace = spm.ParseStructures(rdl);
            ISdmxObjects sdmxObjects = workspace.GetStructureObjects(false);

            _logger.Log($"BusinessLogic GetSdmxObjectsFromFileXML end", Infrastructure.STLogging.Interface.LogLevelEnum.Debug);
            return sdmxObjects;
        }

        /// <summary>
        /// Check all item in SdmxObjects and return a status (importable or not)
        /// </summary>
        /// <param name="sdmxObjects"></param>
        /// <param name="languages"></param>
        /// <returns>List of all item and status</returns>
        private List<ImportedItemXml> CheckAllObjectItem(ISdmxObjects sdmxObjects, List<AppConfig.LanguageData> languages, bool filterAgency)
        {
            _logger.Log($"BusinessLogic CheckAllObjectItem start", Infrastructure.STLogging.Interface.LogLevelEnum.Debug);

            List<ImportedItemXml> items = new List<ImportedItemXml>();

            var agencies = ((ClaimsIdentity)_contextAccessor.HttpContext.User.Identity).Claims
                .Where(c => c.Type == User.ClaimAgency)
                .Select(c => c.Value).ToList();

            if (_logger.IsDebugEnabled)
            {
                foreach (var item in agencies)
                {
                    _logger.Log($"BusinessLogic CheckAllObjectItem agency item: {item}", Infrastructure.STLogging.Interface.LogLevelEnum.Debug);
                }
            }

            foreach (var itemObj in sdmxObjects.Codelists)
            {
                SetStatusItem(itemObj, items, SdmxStructureEnumType.CodeList, agencies, languages, filterAgency);
            }
            foreach (var itemObj in sdmxObjects.Dataflows)
            {
                SetStatusItem(itemObj, items, SdmxStructureEnumType.Dataflow, agencies, languages, filterAgency);
            }
            foreach (var itemObj in sdmxObjects.ConceptSchemes)
            {
                SetStatusItem(itemObj, items, SdmxStructureEnumType.ConceptScheme, agencies, languages, filterAgency);
            }
            foreach (var itemObj in sdmxObjects.CategorySchemes)
            {
                SetStatusItem(itemObj, items, SdmxStructureEnumType.CategoryScheme, agencies, languages, filterAgency);
            }
            foreach (var itemObj in sdmxObjects.DataStructures)
            {
                SetStatusItem(itemObj, items, SdmxStructureEnumType.Dsd, agencies, languages, filterAgency);
            }
            foreach (var itemObj in sdmxObjects.AgenciesSchemes)
            {
                SetStatusItem(itemObj, items, SdmxStructureEnumType.AgencyScheme, agencies, languages, filterAgency);
            }
            foreach (var itemObj in sdmxObjects.DataProviderSchemes)
            {
                SetStatusItem(itemObj, items, SdmxStructureEnumType.DataProviderScheme, agencies, languages, filterAgency);
            }
            foreach (var itemObj in sdmxObjects.DataConsumerSchemes)
            {
                SetStatusItem(itemObj, items, SdmxStructureEnumType.DataConsumerScheme, agencies, languages, filterAgency);
            }
            foreach (var itemObj in sdmxObjects.OrganisationUnitSchemes)
            {
                SetStatusItem(itemObj, items, SdmxStructureEnumType.OrganisationUnitScheme, agencies, languages, filterAgency);
            }
            foreach (var itemObj in sdmxObjects.ContentConstraintObjects)
            {
                SetStatusItem(itemObj, items, SdmxStructureEnumType.ContentConstraint, agencies, languages, filterAgency);
            }
            foreach (var itemObj in sdmxObjects.StructureSets)
            {
                SetStatusItem(itemObj, items, SdmxStructureEnumType.StructureSet, agencies, languages, filterAgency);
            }
            foreach (var itemObj in sdmxObjects.HierarchicalCodelists)
            {
                SetStatusItem(itemObj, items, SdmxStructureEnumType.HierarchicalCodelist, agencies, languages, filterAgency);
            }
            foreach (var itemObj in sdmxObjects.Categorisations)
            {
                SetStatusItem(itemObj, items, SdmxStructureEnumType.Categorisation, agencies, languages, filterAgency);
            }
            foreach (var itemObj in sdmxObjects.ProvisionAgreements)
            {
                SetStatusItem(itemObj, items, SdmxStructureEnumType.ProvisionAgreement, agencies, languages, filterAgency);
            }
            foreach (var itemObj in sdmxObjects.MetadataStructures)
            {
                SetStatusItem(itemObj, items, SdmxStructureEnumType.Msd, agencies, languages, filterAgency);
            }
            foreach (var itemObj in sdmxObjects.Metadataflows)
            {
                SetStatusItem(itemObj, items, SdmxStructureEnumType.MetadataFlow, agencies, languages, filterAgency);
            }

            _logger.Log($"BusinessLogic CheckAllObjectItem start", Infrastructure.STLogging.Interface.LogLevelEnum.Debug);
            return items;
        }

        /// <summary>
        /// Check if the item is importable. 
        /// Remove if it does not belong to the user's agency
        /// </summary>
        /// <param name=""></param>
        /// <returns></returns>
        private void SetStatusItem(IMaintainableObject itemObj, List<ImportedItemXml> items, SdmxStructureEnumType sdmxStructureEnumType, List<string> userAgencies, List<AppConfig.LanguageData> languages, bool filterAgency)
        {
            _logger.Log($"BusinessLogic SetStatusItem: START", Infrastructure.STLogging.Interface.LogLevelEnum.Debug);

            var itemIsOk = true;
            var type = ArtefactDataModel.BL.Utility.GetArtefactTypeString(sdmxStructureEnumType);
            try
            {
                var checkedObject = GetArtefacts(sdmxStructureEnumType, itemObj.Id, itemObj.AgencyId, itemObj.Version, StructureReferenceDetailEnumType.None, "Stub");

                _logger.Log($"BusinessLogic SetStatusItem: Type: {sdmxStructureEnumType} \t Id: {itemObj.Id} \t Agency: {itemObj.AgencyId} \t Version: {itemObj.Version}", Infrastructure.STLogging.Interface.LogLevelEnum.Debug);

                IMaintainableObject checkedItemList = null;
                switch (sdmxStructureEnumType)
                {
                    case SdmxStructureEnumType.CodeList:
                        checkedItemList = checkedObject.Codelists.FirstOrDefault();
                        break;
                    case SdmxStructureEnumType.Dataflow:
                        checkedItemList = checkedObject.Dataflows.FirstOrDefault();
                        break;
                    case SdmxStructureEnumType.ConceptScheme:
                        checkedItemList = checkedObject.ConceptSchemes.FirstOrDefault();
                        break;
                    case SdmxStructureEnumType.CategoryScheme:
                        checkedItemList = checkedObject.CategorySchemes.FirstOrDefault();
                        break;
                    case SdmxStructureEnumType.Dsd:
                        checkedItemList = checkedObject.DataStructures.FirstOrDefault();
                        break;
                    case SdmxStructureEnumType.AgencyScheme:
                        checkedItemList = checkedObject.AgenciesSchemes.FirstOrDefault();
                        break;
                    case SdmxStructureEnumType.DataProviderScheme:
                        checkedItemList = checkedObject.DataProviderSchemes.FirstOrDefault();
                        break;
                    case SdmxStructureEnumType.DataConsumerScheme:
                        checkedItemList = checkedObject.DataConsumerSchemes.FirstOrDefault();
                        break;
                    case SdmxStructureEnumType.OrganisationUnitScheme:
                        checkedItemList = checkedObject.OrganisationUnitSchemes.FirstOrDefault();
                        break;
                    case SdmxStructureEnumType.ContentConstraint:
                        checkedItemList = checkedObject.ContentConstraintObjects.FirstOrDefault();
                        break;
                    case SdmxStructureEnumType.StructureSet:
                        checkedItemList = checkedObject.StructureSets.FirstOrDefault();
                        break;
                    case SdmxStructureEnumType.HierarchicalCodelist:
                        checkedItemList = checkedObject.HierarchicalCodelists.FirstOrDefault();
                        break;
                    case SdmxStructureEnumType.Categorisation:
                        checkedItemList = checkedObject.Categorisations.FirstOrDefault();
                        break;
                    case SdmxStructureEnumType.Msd:
                        checkedItemList = checkedObject.MetadataStructures.FirstOrDefault();
                        break;
                    case SdmxStructureEnumType.MetadataFlow:
                        checkedItemList = checkedObject.Metadataflows.FirstOrDefault();
                        break;
                }

                if (checkedItemList != null && checkedItemList.IsFinal.IsTrue)
                {
                    if (_logger.IsDebugEnabled)
                    {
                        if (checkedItemList == null)
                        {
                            _logger.Log($"BusinessLogic SetStatusItem checkedItemList is null", Infrastructure.STLogging.Interface.LogLevelEnum.Debug);
                        }
                        if (checkedItemList.IsFinal.IsTrue)
                        {
                            _logger.Log($"BusinessLogic SetStatusItem checkedItemList IsFinal", Infrastructure.STLogging.Interface.LogLevelEnum.Debug);
                        }
                    }

                    itemIsOk = false;
                }
            }
            catch (Exception)
            {
                itemIsOk = true;
            }

            var findAgency = !filterAgency || userAgencies.Contains(itemObj.AgencyId);
            _logger.Log($"BusinessLogic SetStatusItem Agency Find: {findAgency} filterAgency: {filterAgency}", Infrastructure.STLogging.Interface.LogLevelEnum.Debug);
            if (findAgency)
            {
                items.Add(new ImportedItemXml(GetNameableName(itemObj, languages), itemObj.Id, itemObj.AgencyId, itemObj.Version, itemObj.IsFinal.IsTrue, type, itemIsOk));
            }
            _logger.Log($"BusinessLogic SetStatusItem: END", Infrastructure.STLogging.Interface.LogLevelEnum.Debug);
        }

        private Dictionary<string, string> GetNameableName(INameableObject nameableObject, List<AppConfig.LanguageData> languages)
        {
            var langs = new Dictionary<string, string>();

            if (nameableObject.Names == null)
            {
                return new Dictionary<string, string>();
            }

            foreach (var itemLang in languages)
            {
                foreach (ITextTypeWrapper name in nameableObject.Names)
                {
                    if (itemLang.Code.Equals(name.Locale, StringComparison.InvariantCultureIgnoreCase))
                    {
                        langs.Add(itemLang.Code, name.Value);
                    }
                }
            }
            return langs;
        }

        //END CHECK FILE XML


        //START IMPORT FILE XML

        /// <summary>
        /// Run the import from File XML
        /// </summary>
        /// <param name=""></param>
        /// <returns>List of all item and status</returns>
        public ImportedItemXmlResult ExecuteImportXml(List<ImportedItemXml> importedItem, string filePath, List<AppConfig.LanguageData> languages, bool filterAgency)
        {
            Infrastructure.Utils.LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            if (string.IsNullOrWhiteSpace(filePath) || !File.Exists(filePath))
            {
                throw Utils.getCustomException("IMPORTXML_FILENOTFOUND",
                           @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - File not found.", Infrastructure.STLogging.Interface.LogLevelEnum.Error);
            }
            #region tracer
            Stopwatch stopwatchImport = null;
            Stopwatch stopwatch = null;
            stopwatch = Stopwatch.StartNew();
            stopwatchImport = Stopwatch.StartNew();
            #endregion
            var sdmxObjects = GetSdmxObjectsFromFileXML(filePath);
            #region tracer
            if (_logger.IsDebugEnabled)
            {
                _logger.Log($"BusinessLogic ExecuteImportXml read file xml in {stopwatchImport.ElapsedMilliseconds}ms", Infrastructure.STLogging.Interface.LogLevelEnum.Debug);
                stopwatch = Stopwatch.StartNew();
            }
            #endregion
            ISdmxObjects newSdmxObjects = new SdmxObjectsImpl();
            var importedItemResult = new ImportedItemXmlResult();

            foreach (var myCurrentItem in importedItem)
            {
                var structureEnum = ArtefactDataModel.BL.Utility.GetArtefactTypeEnum(myCurrentItem.Type);
                SdmxUtils.PopolateSdmxObject(new ArtefactIdentity { Agency = myCurrentItem.Agency, ID = myCurrentItem.ID, Version = myCurrentItem.Version, EnumType = structureEnum, IsFinal = myCurrentItem.IsFinal != null && myCurrentItem.IsFinal.Value },
                                                sdmxObjects,
                                                newSdmxObjects);
            }

            //newSdmxObjects = PopolateAnnotationID(newSdmxObjects);

            if (FinalArtefactExists(newSdmxObjects))
            {
                throw Utils.getCustomException("IMPORTXML_FINAL_ARTEFACT_ERROR",
                           @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - The artefact exists and is final.", Infrastructure.STLogging.Interface.LogLevelEnum.Error);
            }


            var errorResult = CheckDsdReference(newSdmxObjects.DataStructures, newSdmxObjects);
            if (errorResult.Count > 0)
            {
                foreach (var dsd in errorResult)
                {
                    var urn = dsd.Key;
                    var substr = urn.Split('=')[1];
                    var dsdId = substr.Split(':')[1].Split('(')[0];
                    var dsdAgencyId = substr.Split(':')[0];
                    var dsdVersion = substr.Split('(')[1].Split(')')[0];
                    var mainTables = newSdmxObjects.GetMaintainables(SdmxStructureEnumType.Dsd);
                    var dsdItem = mainTables.SingleOrDefault(i=>i.AgencyId.Equals(dsdAgencyId) && i.Id.Equals(dsdId) && i.Version.Equals(dsdVersion));
                    if (dsdItem != null)
                    {
                        newSdmxObjects.RemoveMaintainable(dsdItem);
                    }
                }
            }
            

            #region tracer
            if (_logger.IsDebugEnabled)
            {
                _logger.Log($"BusinessLogic ExecuteImportXml start to paginate items", Infrastructure.STLogging.Interface.LogLevelEnum.Debug);
                stopwatch = Stopwatch.StartNew();
            }
            #endregion
            //var paginatedSdmxObjects = SdmxUtils.SdmxObjectsPaginated(newSdmxObjects, 2);
            var paginatedSdmxObjects = new List<ISdmxObjects> { newSdmxObjects };
            #region tracer
            if (_logger.IsDebugEnabled)
            {
                _logger.Log($"BusinessLogic ExecuteImportXml end to paginate items in {stopwatch.ElapsedMilliseconds}ms", Infrastructure.STLogging.Interface.LogLevelEnum.Debug);
            }
            #endregion

            var requests = new List<HttpRequestMessageWithIdentity>();
            foreach (var item in paginatedSdmxObjects)
            {
                if (filterAgency)
                {
                    FilterResultByAgency(item);
                }
                requests.Add(_protocol.CreateArtefacts(item, true));
                #region tracer
                if (_logger.IsDebugEnabled)
                {
                    _logger.Log($"BusinessLogic ExecuteImportXml item HttpRequest paginated created {stopwatch.ElapsedMilliseconds}ms", Infrastructure.STLogging.Interface.LogLevelEnum.Debug);
                    stopwatch.Restart();
                }
                #endregion
            }
            foreach (var item in requests)
            {
                try
                {
                    var responseXml = SendRequestWithoutErrorException(item, true);
                    getNsiImportFileResponse(responseXml, importedItemResult, item.Identity);
                    #region tracer
                    if (_logger.IsDebugEnabled)
                    {
                        _logger.Log($"BusinessLogic ExecuteImportXml item SendRequest {stopwatch.ElapsedMilliseconds}ms", Infrastructure.STLogging.Interface.LogLevelEnum.Debug);
                        stopwatch.Restart();
                    }
                    #endregion
                }
                catch (Exception ex)
                {
                    //Capture 50x error for REST. (SOAP will take in getNsiImportFileResponse)
                    foreach (var itemIdentity in item.Identity)
                    {
                        var itemRes = new ImportedItemXmlResult.ItemResult();
                        itemRes.Status = "Fail";
                        itemRes.MaintainableObject = $"{itemIdentity.EnumType.ToString()}={itemIdentity.Agency}:{itemIdentity.ID}({itemIdentity.Version})";
                        itemRes.Result = ex.Message;
                        importedItemResult.HaveError = true;
                        importedItemResult.ItemsMessage.Add(itemRes);
                        _logger.Log($"Metodo {System.Reflection.MethodBase.GetCurrentMethod().Name} - Identity: {itemRes.MaintainableObject} Reason: {ex.Message}", Infrastructure.STLogging.Interface.LogLevelEnum.Error);
                    }
                }
            }
            #region tracer
            if (_logger.IsDebugEnabled)
            {
                _logger.Log($"BusinessLogic ExecuteImportXml imported in {stopwatchImport.ElapsedMilliseconds}ms", Infrastructure.STLogging.Interface.LogLevelEnum.Debug);
            }
            #endregion
            //importedItemResult.ImportedItem = CheckImportedFileXmlSdmxObjects(filePath, languages);

            if (errorResult.Count > 0)
            {
                foreach (var dsd in errorResult)
                {
                    var itemRes = new ImportedItemXmlResult.ItemResult();
                    itemRes.Status = "Fail";
                    itemRes.MaintainableObject = dsd.Key;
                    itemRes.Result = "Reference non final artefacts: ";
                    itemRes.CustomMessage = "Reference non final artefacts:";
                    importedItemResult.HaveError = true;
                    foreach (var referenceError in dsd.Value)
                    {
                        itemRes.Result += $"[{referenceError}]";
                        itemRes.CustomMessage += $"[{referenceError}]";
                    }
                    importedItemResult.ItemsMessage.Add(itemRes);
                }
            }

            Infrastructure.Utils.LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);
            return importedItemResult;
        }

        public void ExecuteRemoteDuplicate(ISdmxObjects sdmxObject, ImportedFileResultBase importedItemResult)
        {
            var request = _protocol.CreateArtefacts(sdmxObject, true);
            var responseXml = SendRequestWithoutErrorException(request, true);
            getNsiImportFileResponse(responseXml, importedItemResult, request.Identity);
        }


        /// <summary>
        /// Take all response message of import
        /// </summary>
        /// <param name=""></param>
        /// <returns>Resturn a result off all item try to imported</returns>
        private void getNsiImportFileResponse(XmlDocument response, ImportedFileResultBase importedItemResult, List<ArtefactIdentity> artefactIdentity)
        {
            _protocol.GetNsiImportFileResponse(response, importedItemResult, artefactIdentity);
        }

        /*
        /// <summary>
        /// popolate all Annotation of the Item in SdmxObjects
        /// </summary>
        /// <param name=""></param>
        /// <returns></returns>
        private ISdmxObjects PopolateAnnotationID(ISdmxObjects sdmxObjects)
        {
            ISdmxObjects SdmxObjectsTemp = new SdmxObjectsImpl();
            IMutableObjects MutableObjects = SdmxObjectsTemp.MutableObjects;

            foreach (ICodelistObject tmpCodeList in sdmxObjects.Codelists)
            {
                ICodelistMutableObject codelist = tmpCodeList.MutableInstance;
                FillAnnotationID(codelist);

                foreach (ICodeMutableObject code in codelist.Items)
                    FillAnnotationID(code);

                MutableObjects.AddCodelist(codelist);
            }

            foreach (IConceptSchemeObject cs in sdmxObjects.ConceptSchemes)
            {
                IConceptSchemeMutableObject csM = cs.MutableInstance;
                FillAnnotationID(csM);

                foreach (IConceptMutableObject code in csM.Items)
                    FillAnnotationID(code);

                MutableObjects.AddConceptScheme(csM);
            }

            foreach (ICategorySchemeObject cs in sdmxObjects.CategorySchemes)
            {
                ICategorySchemeMutableObject csM = cs.MutableInstance;
                FillAnnotationID(csM);

                foreach (ICategoryMutableObject cat in csM.Items)
                    FillAnnotationID(cat);

                MutableObjects.AddCategoryScheme(csM);
            }

            foreach (IDataflowObject df in sdmxObjects.Dataflows)
            {
                IDataflowMutableObject dfM = df.MutableInstance;
                FillAnnotationID(dfM);

                MutableObjects.AddDataflow(dfM);
            }

            foreach (ICategorisationObject cat in sdmxObjects.Categorisations)
            {
                ICategorisationMutableObject catM = cat.MutableInstance;
                FillAnnotationID(catM);

                MutableObjects.AddCategorisation(catM);
            }

            foreach (IAgencyScheme aSch in sdmxObjects.AgenciesSchemes)
            {
                IAgencySchemeMutableObject aSchM = aSch.MutableInstance;
                FillAnnotationID(aSchM);

                foreach (IAgencyMutableObject ag in aSchM.Items)
                    FillAnnotationID(ag);

                MutableObjects.AddAgencyScheme(aSchM);
            }

            foreach (IDataProviderScheme dp in sdmxObjects.DataProviderSchemes)
            {
                IDataProviderSchemeMutableObject dpM = dp.MutableInstance;
                FillAnnotationID(dpM);

                foreach (IDataProviderMutableObject dat in dpM.Items)
                    FillAnnotationID(dat);

                MutableObjects.AddDataProviderScheme(dpM);
            }

            foreach (IDataConsumerScheme dc in sdmxObjects.DataConsumerSchemes)
            {
                IDataConsumerSchemeMutableObject dcM = dc.MutableInstance;
                FillAnnotationID(dcM);

                foreach (IDataConsumerMutableObject dat in dcM.Items)
                    FillAnnotationID(dat);

                MutableObjects.AddDataConsumerScheme(dcM);
            }

            foreach (IOrganisationUnitSchemeObject oi in sdmxObjects.OrganisationUnitSchemes)
            {
                IOrganisationUnitSchemeMutableObject oiM = oi.MutableInstance;
                FillAnnotationID(oiM);

                foreach (IOrganisationUnitMutableObject org in oiM.Items)
                    FillAnnotationID(org);

                MutableObjects.AddOrganisationUnitScheme(oiM);
            }

            foreach (IDataStructureObject dsd in sdmxObjects.DataStructures)
            {
                IDataStructureMutableObject dsdM = dsd.MutableInstance;
                FillAnnotationID(dsdM);
                FillAnnotationID(dsdM.PrimaryMeasure);

                if (dsdM.DimensionList != null)
                {
                    foreach (IDimensionMutableObject dim in dsdM.DimensionList.Dimensions)
                    {
                        FillAnnotationID(dim);
                    }
                }
                if (dsdM.AttributeList != null)
                {
                    foreach (IAttributeMutableObject att in dsdM.AttributeList.Attributes)
                    {
                        FillAnnotationID(att);
                    }
                }
                if (dsdM.Groups != null)
                {
                    foreach (IGroupMutableObject group in dsdM.Groups)
                    {
                        FillAnnotationID(group);
                    }
                }

                MutableObjects.AddDataStructure(dsdM);
            }

            foreach (IContentConstraintObject cc in sdmxObjects.ContentConstraintObjects)
            {
                IContentConstraintMutableObject catM = cc.MutableInstance;
                FillAnnotationID(catM);

                MutableObjects.AddContentConstraint(catM);
            }

            foreach (IStructureSetObject ss in sdmxObjects.StructureSets)
            {
                IStructureSetMutableObject ssM = ss.MutableInstance;
                FillAnnotationID(ssM);

                if (ssM.CodelistMapList != null)
                {
                    foreach (ICodelistMapMutableObject clm in ssM.CodelistMapList)
                    {
                        FillAnnotationID(clm);
                    }
                }

                if (ssM.StructureMapList != null)
                {
                    foreach (IStructureMapMutableObject sm in ssM.StructureMapList)
                    {
                        FillAnnotationID(sm);
                    }
                }

                MutableObjects.AddStructureSet(ssM);
            }

            foreach (IHierarchicalCodelistObject hcl in sdmxObjects.HierarchicalCodelists)
            {
                IHierarchicalCodelistMutableObject hclM = hcl.MutableInstance;
                FillAnnotationID(hclM);

                foreach (IHierarchyMutableObject hi in hclM.Hierarchies)
                    FillAnnotationID(hi);

                MutableObjects.AddHierarchicalCodelist(hclM);
            }

            foreach (IMetadataStructureDefinitionObject ms in sdmxObjects.MetadataStructures)
            {
                IMetadataStructureDefinitionMutableObject msM = ms.MutableInstance;

                FillAnnotationID(msM);

                if (msM.MetadataTargets != null)
                {
                    foreach (IMetadataTargetMutableObject dim in msM.MetadataTargets)
                    {
                        FillAnnotationID(dim);
                    }
                }
                if (msM.ReportStructures != null)
                {
                    foreach (IReportStructureMutableObject dim in msM.ReportStructures)
                    {
                        FillAnnotationID(dim);
                    }
                }

                MutableObjects.AddMetadataStructure(msM);
            }

            foreach (IMetadataFlow mf in sdmxObjects.Metadataflows)
            {
                IMetadataFlowMutableObject mfM = mf.MutableInstance;

                FillAnnotationID(mfM);

                MutableObjects.AddMetadataFlow(mfM);
            }


            return MutableObjects.ImmutableObjects;
        }

        private void FillAnnotationID(IAnnotableMutableObject AnnotableObject)
        {
            int AnnotationCounter = 0;
            int MatchingAnnotationCounter = 0;
            var lIDS = new List<string>();

            if (AnnotableObject.Annotations == null)
            {
                return;
            }
            foreach (IAnnotationMutableObject ann in AnnotableObject.Annotations)
            {
                if ((ann.Id == null || ann.Id.Trim() == String.Empty) && (ann.Type != _nodeConfiguration.Order.CategorySchemesOrderAnnotation && ann.Type != _nodeConfiguration.Order.CodelistsOrderAnnotation && ann.Type != _nodeConfiguration.Order.ConceptSchemesOrderAnnotation))
                {
                    ++AnnotationCounter;
                    ann.Id = "@" + AnnotationCounter.ToString() + "@";
                }
                else
                {
                    if (lIDS.Contains(ann.Id))
                    {
                        ++MatchingAnnotationCounter;
                        ann.Id = ann.Id + "_" + MatchingAnnotationCounter.ToString();
                    }
                }
                lIDS.Add(ann.Id);
            }
        }
        */


        /// <summary>
        /// Check if all item referenced from dsd are finals
        /// </summary>
        /// <param name=""></param>
        /// <returns></returns>
        public Dictionary<string, List<string>> CheckDsdReference(ISet<IDataStructureObject> dsd, ISdmxObjects sdmxObjects)
        {
            var error = new Dictionary<string, List<string>>();
            var allKeyChecked = new List<string>();
            foreach (var itemDsd in dsd)
            {
                var dsdKey = $"{itemDsd.StructureType.EnumType}={itemDsd.AgencyId}:{itemDsd.Id}({itemDsd.Version})";
                foreach (var crossReference in itemDsd.CrossReferences)
                {
                    var keyCheck = $"{crossReference.MaintainableStructureEnumType.EnumType}={crossReference.AgencyId}:{crossReference.MaintainableId}({crossReference.Version})";

                    if (allKeyChecked.Contains(keyCheck))
                    {
                        continue;
                    }

                    var isInError = false;
                    var items = sdmxObjects?.GetMaintainables(crossReference.MaintainableStructureEnumType.EnumType);
                    var artefactReferenced = items?.FirstOrDefault(i=>i.Id.Equals(crossReference.MaintainableId) && i.AgencyId.Equals(crossReference.AgencyId) && i.Version.Equals(crossReference.Version));
                    if (artefactReferenced == null)
                    {
                        var sdmxObjectsFromDB = GetArtefacts(crossReference.MaintainableStructureEnumType.EnumType, crossReference.MaintainableId, crossReference.AgencyId, crossReference.Version);
                        var artefactReferencedFromDB = sdmxObjectsFromDB.GetMaintainables(crossReference.MaintainableStructureEnumType.EnumType).FirstOrDefault();
                        isInError = artefactReferencedFromDB != null && (artefactReferencedFromDB.IsFinal == null || !artefactReferencedFromDB.IsFinal.IsTrue);
                    }
                    else
                    {
                        isInError = artefactReferenced.IsFinal == null || !artefactReferenced.IsFinal.IsTrue;
                    }

                    if (isInError)
                    {
                        if (!error.ContainsKey(dsdKey))
                        {
                            error.Add(dsdKey, new List<string>());
                        }
                        error[dsdKey].Add(keyCheck);
                    }
                    allKeyChecked.Add(keyCheck);
                }
            }

            return error;
        }

        /// <summary>
        /// Check if item in FinalStatus
        /// </summary>
        /// <param name=""></param>
        /// <returns></returns>
        private bool FinalArtefactExists(ISdmxObjects sdmxObjects)
        {
            ISdmxObjects sdmxContainer;

            try
            {
                if (sdmxObjects.HasCodelists)
                {
                    ICodelistObject itemObj = sdmxObjects.Codelists.FirstOrDefault();
                    sdmxContainer = GetArtefacts(SdmxStructureEnumType.CodeList, itemObj.Id, itemObj.AgencyId, itemObj.Version, StructureReferenceDetailEnumType.None, "Stub");
                    if (sdmxContainer.Codelists != null)
                    {
                        return sdmxContainer.Codelists.First().IsFinal.IsTrue;
                    }
                }
                if (sdmxObjects.HasConceptSchemes)
                {
                    IConceptSchemeObject itemObj = sdmxObjects.ConceptSchemes.FirstOrDefault();
                    sdmxContainer = GetArtefacts(SdmxStructureEnumType.ConceptScheme, itemObj.Id, itemObj.AgencyId, itemObj.Version, StructureReferenceDetailEnumType.None, "Stub");
                    if (sdmxContainer.ConceptSchemes != null)
                    {
                        return sdmxContainer.ConceptSchemes.First().IsFinal.IsTrue;
                    }
                }
                if (sdmxObjects.HasDataStructures)
                {
                    IDataStructureObject itemObj = sdmxObjects.DataStructures.FirstOrDefault();
                    sdmxContainer = GetArtefacts(SdmxStructureEnumType.Dsd, itemObj.Id, itemObj.AgencyId, itemObj.Version, StructureReferenceDetailEnumType.None, "Stub");
                    if (sdmxContainer.DataStructures != null)
                    {
                        return sdmxContainer.DataStructures.First().IsFinal.IsTrue;
                    }
                }
                if (sdmxObjects.HasCategorySchemes)
                {
                    ICategorySchemeObject itemObj = sdmxObjects.CategorySchemes.FirstOrDefault();
                    sdmxContainer = GetArtefacts(SdmxStructureEnumType.CategoryScheme, itemObj.Id, itemObj.AgencyId, itemObj.Version, StructureReferenceDetailEnumType.None, "Stub");
                    if (sdmxContainer.CategorySchemes != null)
                    {
                        return sdmxContainer.CategorySchemes.First().IsFinal.IsTrue;
                    }
                }
                if (sdmxObjects.HasDataflows)
                {
                    IDataflowObject itemObj = sdmxObjects.Dataflows.FirstOrDefault();
                    sdmxContainer = GetArtefacts(SdmxStructureEnumType.Dataflow, itemObj.Id, itemObj.AgencyId, itemObj.Version, StructureReferenceDetailEnumType.None, "Stub");
                    if (sdmxContainer.Dataflows != null)
                    {
                        return sdmxContainer.Dataflows.First().IsFinal.IsTrue;
                    }
                }
                if (sdmxObjects.HasCategorisations)
                {
                    ICategorisationObject itemObj = sdmxObjects.Categorisations.FirstOrDefault();
                    sdmxContainer = GetArtefacts(SdmxStructureEnumType.Categorisation, itemObj.Id, itemObj.AgencyId, itemObj.Version, StructureReferenceDetailEnumType.None, "Stub");
                    if (sdmxContainer.Categorisations != null)
                    {
                        return sdmxContainer.Categorisations.First().IsFinal.IsTrue;
                    }
                }
                if (sdmxObjects.HasMetadataStructures)
                {
                    IMetadataStructureDefinitionObject itemObj = sdmxObjects.MetadataStructures.FirstOrDefault();
                    sdmxContainer = GetArtefacts(SdmxStructureEnumType.MetadataSet, itemObj.Id, itemObj.AgencyId, itemObj.Version, StructureReferenceDetailEnumType.None, "Stub");
                    if (sdmxContainer.MetadataStructures != null)
                    {
                        return sdmxContainer.MetadataStructures.First().IsFinal.IsTrue;
                    }
                }
                if (sdmxObjects.HasMetadataflows)
                {
                    IMetadataFlow itemObj = sdmxObjects.Metadataflows.FirstOrDefault();
                    sdmxContainer = GetArtefacts(SdmxStructureEnumType.MetadataFlow, itemObj.Id, itemObj.AgencyId, itemObj.Version, StructureReferenceDetailEnumType.None, "Stub");
                    if (sdmxContainer.Metadataflows != null)
                    {
                        return sdmxContainer.Metadataflows.First().IsFinal.IsTrue;
                    }
                }
                if (sdmxObjects.HasAgenciesSchemes)
                {
                    IAgencyScheme itemObj = sdmxObjects.AgenciesSchemes.FirstOrDefault();
                    sdmxContainer = GetArtefacts(SdmxStructureEnumType.AgencyScheme, itemObj.Id, itemObj.AgencyId, itemObj.Version, StructureReferenceDetailEnumType.None, "Stub");
                    if (sdmxContainer.AgenciesSchemes != null)
                    {
                        return sdmxContainer.AgenciesSchemes.First().IsFinal.IsTrue;
                    }
                }
            }
            catch (Exception)
            {
                return false;
            }

            return false;
        }

        //END IMPORT FILE XML

        #endregion


        #region Import CSV

        public ImportedItemCsvResult ExecuteImportCsv(ISdmxObjects sdmxObjects)
        {
            var importedItemCsvResult = new ImportedItemCsvResult();

            //var paginatedSdmxObjects = SdmxUtils.SdmxObjectsPaginated(sdmxObjects, 30000);
            var paginatedSdmxObjects = new List<ISdmxObjects> { sdmxObjects };

            var requests = new List<HttpRequestMessageWithIdentity>();
            foreach (var itemObj in paginatedSdmxObjects)
            {
                requests.AddRange(_protocol.UpdateArtefacts(itemObj, true));
            }

            foreach (var item in requests)
            {
                try
                {
                    var responseXml = SendRequestWithoutErrorException(item);
                    getNsiImportFileResponse(responseXml, importedItemCsvResult, item.Identity);
                }
                catch (Exception ex)
                {
                    //Capture 50x error for REST. (SOAP will take in getNsiImportFileResponse)
                    foreach (var itemIdentity in item.Identity)
                    {
                        var itemRes = new ImportedItemXmlResult.ItemResult();
                        itemRes.Status = "Fail";
                        itemRes.MaintainableObject = $"{itemIdentity.EnumType.ToString()}={itemIdentity.Agency}:{itemIdentity.ID}({itemIdentity.Version})";
                        itemRes.Result = ex.Message;
                        importedItemCsvResult.HaveError = true;
                        importedItemCsvResult.ItemsMessage.Add(itemRes);
                        _logger.Log($"Metodo {System.Reflection.MethodBase.GetCurrentMethod().Name} - Identity: {itemRes.MaintainableObject} Reason: {ex.Message}", Infrastructure.STLogging.Interface.LogLevelEnum.Error);
                    }
                }
            }

            return importedItemCsvResult;
        }

        #endregion

        /// <summary>
        /// Remove all item in SdmxObjects that not belong to the user's agency
        /// </summary>
        /// <param name="sdmxObjects"></param>
        /// <returns></returns>
        private void FilterResultByAgency(ISdmxObjects sdmxObjects)
        {
            var userAgencies = ((ClaimsIdentity)_contextAccessor.HttpContext.User.Identity).Claims
                .Where(c => c.Type == User.ClaimAgency)
                .Select(c => c.Value).ToList();

            var itemObjAvaiable = sdmxObjects.GetAllMaintainables();

            foreach (var itemObj in itemObjAvaiable)
            {
                var findAgency = userAgencies.Contains(itemObj.AgencyId);
                if (findAgency)
                {
                    continue;
                }

                SdmxUtils.RemoveItemSdmxObject(itemObj, sdmxObjects);
            }
        }

        /// <summary>
        /// Check SdmxObjects items and throw an exception if one item not belong to the user's agency
        /// </summary>
        /// <param name="sdmxObjects"></param>
        /// <returns></returns>
        private void CheckPermissionByAgency(ISdmxObjects sdmxObjects)
        {
            var userAgencies = ((ClaimsIdentity)_contextAccessor.HttpContext.User.Identity).Claims
                .Where(c => c.Type == User.ClaimAgency)
                .Select(c => c.Value).ToList();

            var itemObjAvaiable = sdmxObjects.GetAllMaintainables();

            foreach (var itemObj in itemObjAvaiable)
            {
                var findAgency = userAgencies.Contains(itemObj.AgencyId);
                if (findAgency)
                {
                    continue;
                }

                throw Utility.Utils.getCustomException("INVALID_AGENCY",
                   @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - User haven't " + itemObj.AgencyId + ".", Infrastructure.STLogging.Interface.LogLevelEnum.Error);
            }

            return;
        }
        
    }
}
