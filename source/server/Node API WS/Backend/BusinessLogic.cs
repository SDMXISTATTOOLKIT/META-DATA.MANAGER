using AuthCore.Model;
using AuthCore.Utils;
using Connector.Connectors;
using DataModel;
using DDB.Entities;
using EndpointConnectors.Connectors;
using Infrastructure.STLogging.Factory;
using Infrastructure.STLogging.Interface;
using Infrastructure.Utils;
using MA.Entities;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using Newtonsoft.Json.Serialization;
using NSI.Entities;
using Org.Sdmx.Resources.SdmxMl.Schemas.V21.Common;
using Org.Sdmxsource.Sdmx.Api.Constants;
using Org.Sdmxsource.Sdmx.Api.Manager.Parse;
using Org.Sdmxsource.Sdmx.Api.Model;
using Org.Sdmxsource.Sdmx.Api.Model.Mutable.Base;
using Org.Sdmxsource.Sdmx.Api.Model.Mutable.CategoryScheme;
using Org.Sdmxsource.Sdmx.Api.Model.Mutable.Codelist;
using Org.Sdmxsource.Sdmx.Api.Model.Mutable.ConceptScheme;
using Org.Sdmxsource.Sdmx.Api.Model.Mutable.DataStructure;
using Org.Sdmxsource.Sdmx.Api.Model.Mutable.MetadataStructure;
using Org.Sdmxsource.Sdmx.Api.Model.Mutable.Registry;
using Org.Sdmxsource.Sdmx.Api.Model.Objects;
using Org.Sdmxsource.Sdmx.Api.Model.Objects.Base;
using Org.Sdmxsource.Sdmx.Api.Model.Objects.CategoryScheme;
using Org.Sdmxsource.Sdmx.Api.Model.Objects.Codelist;
using Org.Sdmxsource.Sdmx.Api.Model.Objects.ConceptScheme;
using Org.Sdmxsource.Sdmx.Api.Model.Objects.DataStructure;
using Org.Sdmxsource.Sdmx.Api.Model.Objects.MetadataStructure;
using Org.Sdmxsource.Sdmx.Api.Model.Objects.Reference;
using Org.Sdmxsource.Sdmx.Api.Model.Objects.Registry;
using Org.Sdmxsource.Sdmx.SdmxObjects.Model;
using Org.Sdmxsource.Sdmx.SdmxObjects.Model.Mutable.Base;
using Org.Sdmxsource.Sdmx.SdmxObjects.Model.Mutable.CategoryScheme;
using Org.Sdmxsource.Sdmx.SdmxObjects.Model.Mutable.Codelist;
using Org.Sdmxsource.Sdmx.SdmxObjects.Model.Mutable.ConceptScheme;
using Org.Sdmxsource.Sdmx.SdmxObjects.Model.Mutable.DataStructure;
using Org.Sdmxsource.Sdmx.SdmxObjects.Model.Mutable.MetadataStructure;
using Org.Sdmxsource.Sdmx.SdmxObjects.Model.Mutable.Registry;
using Org.Sdmxsource.Sdmx.SdmxObjects.Model.Objects.MetadataStructure;
using Org.Sdmxsource.Sdmx.Structureparser.Engine.Writing;
using Org.Sdmxsource.Sdmx.Structureparser.Manager.Parsing;
using Org.Sdmxsource.Sdmx.Util.Objects.Container;
using Org.Sdmxsource.Sdmx.Util.Objects.Reference;
using Org.Sdmxsource.Translator;
using Org.Sdmxsource.Util.Io;
using RMDataProvider.Model;
using RMUtil;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Common;
using System.Data.SQLite;
using System.Diagnostics;
using System.Globalization;
using System.IO;
using System.IO.Compression;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using System.Xml.Serialization;
using Utility;

namespace BusinessLogic.Controller
{
    public class BusinessLogic
    {
        private Sdmx21Connector Sdmx21Connector;
        private DmApiConnector DmApiConnector;
        private MaApiConnector MaApiConnector;

        private DataflowProduction dfProd;
        private TestArtefacts testArtefacts;

        private readonly AppConfig appConfig;
        readonly IConfiguration _configuration;
        readonly ISTLogger _logger;
        readonly NodeConfig _nodeConfig;
        readonly IHttpContextAccessor _contextAccessor;
        readonly IMemoryCache _memoryCache;
        readonly HttpClientHandler _httpClientHandler;

        //RMCacheManager _rmCacheManager = null;

        public BusinessLogic(NodeConfig nodeConfiguration, IConfiguration configuration, IMemoryCache memoryCache, IHttpContextAccessor contextAccessor)
        {
            _configuration = configuration;
            _nodeConfig = nodeConfiguration;
            _contextAccessor = contextAccessor;
            _memoryCache = memoryCache;

            _httpClientHandler = ConfigureProxy(nodeConfiguration.Proxy);

            appConfig = new ConfigManager(configuration, _memoryCache).GetAppConfig();

            this.Sdmx21Connector = new Sdmx21Connector(nodeConfiguration, _httpClientHandler, _memoryCache, appConfig, _contextAccessor, nodeConfiguration.Endpoint.BypassCache);
            this.DmApiConnector = new DmApiConnector(nodeConfiguration, _httpClientHandler, _memoryCache, nodeConfiguration.Endpoint.BypassCache, appConfig);
            this.MaApiConnector = new MaApiConnector(nodeConfiguration, _httpClientHandler, _memoryCache, nodeConfiguration.Endpoint.BypassCache, appConfig);
            this.dfProd = new DataflowProduction(Sdmx21Connector, DmApiConnector, MaApiConnector, _configuration);
            this.testArtefacts = new TestArtefacts(nodeConfiguration, configuration, memoryCache, contextAccessor, Sdmx21Connector);
            _logger = STLoggerFactory.Logger;
        }

        #region READ

        /// <summary>
        /// Return HttpClientHandler for proxy if Enable or Null in case of Disabled
        /// </summary>
        public HttpClientHandler ConfigureProxy(NodeConfig.nProxy proxyConfig)
        {
            HttpClientHandler httpClientHandler = null;
            if (proxyConfig.Enabled)
            {
                httpClientHandler = new HttpClientHandler()
                {
                    UseProxy = true,
                    AutomaticDecompression = DecompressionMethods.GZip | DecompressionMethods.Deflate
                };

                if (proxyConfig.UseSystemProxy)
                {
                    httpClientHandler.Proxy = WebRequest.DefaultWebProxy;
                }
                else
                {
                    var proxy = new WebProxy(proxyConfig.Address, proxyConfig.Port) { BypassProxyOnLocal = false };
                    if (!String.IsNullOrWhiteSpace(proxyConfig.Username))
                    {
                        //Set credentials
                        ICredentials credentials = new NetworkCredential(proxyConfig.Username, proxyConfig.Password);
                        proxy.Credentials = credentials;
                    }

                    //Inizialize HttpClient with proxy
                    httpClientHandler.Proxy = proxy;
                }
            }
            else
            {
                httpClientHandler = new HttpClientHandler
                {
                    UseDefaultCredentials = true,
                    Proxy = WebRequest.DefaultWebProxy,
                    AutomaticDecompression = DecompressionMethods.GZip | DecompressionMethods.Deflate
                };
            }

            return httpClientHandler;
        }

        public void ConfigureNameSpace()
        {
            Sdmx21Connector.ConfigureNameSpace();
        }

        public List<int> SearchReportIds(int idMetadataSet, string identifierValue, string targetType)
        {
            try
            {
                string resultString = DmApiConnector.SearchReportIds(idMetadataSet, identifierValue, targetType);

                if (resultString == null || resultString.Length == 0)
                {
                    return null;
                }

                XmlSerializer serializer = new XmlSerializer(typeof(List<int>));
                using (StringReader stringreader = new StringReader(resultString))
                {
                    return (List<int>)serializer.Deserialize(stringreader);
                }
            }
            catch (Exception ex)
            {
                throw Utility.Utils.getCustomException("SEARCH_REPORT_ERROR",
                  @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - " + ex.Message, Infrastructure.STLogging.Interface.LogLevelEnum.Error);
            }
        }

        public List<ReportType> SearchReport(int idMetadataSet, string identifierValue, string targetType)
        {
            try
            {
                string resultString = DmApiConnector.SearchReport(idMetadataSet, identifierValue, targetType);

                if (resultString == null || resultString.Length == 0)
                {
                    return null;
                }

                XmlSerializer serializer = new XmlSerializer(typeof(List<ReportType>));
                using (StringReader stringreader = new StringReader(resultString))
                {
                    return (List<ReportType>)serializer.Deserialize(stringreader);
                }
            }
            catch (Exception ex)
            {
                throw Utility.Utils.getCustomException("SEARCH_REPORT_ERROR",
                  @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - " + ex.Message, Infrastructure.STLogging.Interface.LogLevelEnum.Error);
            }
        }

        public List<ReportType> SearchReportByParams(int metadataSetId, string identifierValue, string targetType)
        {
            string stringValue = DmApiConnector.SearchReportByParams(metadataSetId, identifierValue, targetType);
            XmlSerializer serializer = new XmlSerializer(typeof(List<ReportType>));
            using (TextReader reader = new StringReader(stringValue))
            {
                List<ReportType> result = (List<ReportType>)serializer.Deserialize(reader);
                return result;
            }
        }

        public ReportType GetReport(int reportId)
        {
            try
            {
                string stringValue = DmApiConnector.GetReport(reportId);
                XmlSerializer serializer = new XmlSerializer(typeof(ReportType));
                using (TextReader reader = new StringReader(stringValue))
                {
                    ReportType result = (ReportType)serializer.Deserialize(reader);
                    return result;
                }
            }
            catch (Exception ex)
            {
                throw Utility.Utils.getCustomException("GET_REPORT_ERROR",
                  @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - " + ex.Message, Infrastructure.STLogging.Interface.LogLevelEnum.Error);
            }
        }

        public MetadataSetType GetMetadataSet(string idMetadataSet, bool? excludeReport, bool? withAttributes, bool dbId = false)
        {
            try
            {
                string stringValue = DmApiConnector.GetMetadataSet(idMetadataSet, excludeReport, withAttributes, dbId);
                XmlSerializer serializer = new XmlSerializer(typeof(MetadataSetType));
                using (TextReader reader = new StringReader(stringValue))
                {
                    MetadataSetType result = (MetadataSetType)serializer.Deserialize(reader);
                    return result;
                }
            }
            catch (Exception ex)
            {
                throw Utility.Utils.getCustomException("GET_METADATASET_ERROR",
                  @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - " + ex.Message, Infrastructure.STLogging.Interface.LogLevelEnum.Error);
            }
        }

        public List<MetadataSetType> GetStoredMetadataSets()
        {
            try
            {
                string stringValue = DmApiConnector.GetAllMetadataSets();
                //return stringValue;
                XmlSerializer serializer = new XmlSerializer(typeof(List<MetadataSetType>));
                using (TextReader reader = new StringReader(stringValue))
                {
                    List<MetadataSetType> result = (List<MetadataSetType>)serializer.Deserialize(reader);
                    return result;
                }
            }
            catch (Exception ex)
            {
                throw Utility.Utils.getCustomException("GET_METADATASET_ERROR",
                  @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - " + ex.Message, Infrastructure.STLogging.Interface.LogLevelEnum.Error);
            }
        }

        public string CreateMetadataSet(string metadata, string msdFileContent)
        {
            try
            {
                return DmApiConnector.CreateMetadataSet(metadata, msdFileContent, _nodeConfig.Annotations.DCAT_IsMultilingual, _nodeConfig.Annotations.CustomIsPresentational);
            }
            catch (Exception ex)
            {
                throw Utility.Utils.getCustomException("CREATE_METADATASET_ERROR",
                  @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - " + ex.Message,
                  Infrastructure.STLogging.Interface.LogLevelEnum.Error);
            }
        }

        public ReportType UpdateReport(string metadataSetIdentifier, int idMetadataSet, string metadata, string msdFileContent)
        {
            try
            {
                string stringValue = DmApiConnector.UpdateReport(idMetadataSet, metadata, msdFileContent, _nodeConfig.Annotations.DCAT_IsMultilingual, _nodeConfig.Annotations.CustomIsPresentational, _nodeConfig.DcatApIt.MSD);

                try
                {
                    Task.Run(() => updateMetadataCacheAsync(metadataSetIdentifier, null));
                }
                catch (Exception ex)
                {
                    STLoggerFactory.Logger.Log("Error to updateCacheAsync", ex, Infrastructure.STLogging.Interface.LogLevelEnum.Warn);
                }

                XmlSerializer serializer = new XmlSerializer(typeof(ReportType));
                using (TextReader reader = new StringReader(stringValue))
                {
                    ReportType result = (ReportType)serializer.Deserialize(reader);
                    return result;
                }
            }
            catch (Exception ex)
            {
                if (ex.Message.Equals("FORBIDDEN"))
                {
                    throw;
                }
                throw Utility.Utils.getCustomException("UPDATE_REPORT_ERROR",
                  @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - " + ex.Message, Infrastructure.STLogging.Interface.LogLevelEnum.Error);
            }
        }

        public bool UpdateReportState(string idMetadataSet, string repIdStr, string newState)
        {
            bool reportDraftNotPublisheble = false;
            try
            {
                string stringValue = DmApiConnector.UpdateReportState(idMetadataSet, repIdStr, newState, _nodeConfig.DcatApIt.MSD);
                bool result = false;
                if (!Boolean.TryParse(stringValue, out result))
                {
                    if (stringValue.IndexOf("DRAFT") != -1)
                    {
                        reportDraftNotPublisheble = true;
                        throw new Exception(stringValue);
                    }
                }
                return result;
            }
            catch (Exception ex)
            {
                if (ex.Message.Equals("FORBIDDEN"))
                {
                    throw;
                }
                if (reportDraftNotPublisheble)
                {
                    throw Utility.Utils.getCustomException("DRAFT_REPORT_PUBLICATION",
                      @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - " + ex.Message, Infrastructure.STLogging.Interface.LogLevelEnum.Error);
                }
                else
                {
                    throw Utility.Utils.getCustomException("UPDATE_REPORT_ERRORUPDATE_REPORT_ERROR",
                      @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - " + ex.Message, Infrastructure.STLogging.Interface.LogLevelEnum.Error);
                }
            }
        }

        public int CreateReport(string metadata, int idMetadataSet, string msdFileContent)
        {
            try
            {
                string createdReportId = DmApiConnector.CreateReport(metadata, idMetadataSet, msdFileContent, _nodeConfig.Annotations.DCAT_IsMultilingual, _nodeConfig.Annotations.CustomIsPresentational, _nodeConfig.DcatApIt.MSD);
                return Int32.Parse(createdReportId);
            }
            catch (Exception ex)
            {
                if (ex.Message.Equals("FORBIDDEN"))
                {
                    throw;
                }
                throw Utility.Utils.getCustomException("CREATE_REPORT_ERROR",
                  @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - " + ex.Message,
                  Infrastructure.STLogging.Interface.LogLevelEnum.Error);
            }
        }

        public MetadataSetType UpdateMetadataSet(string idMetadataSet, string bodyContent, string msdFileContent)
        {
            try
            {
                string stringValue = DmApiConnector.UpdateMetadataSet(bodyContent, msdFileContent, _nodeConfig.Annotations.DCAT_IsMultilingual, _nodeConfig.Annotations.CustomIsPresentational);

                try
                {
                    Task.Run(() => updateMetadataCacheAsync(idMetadataSet.ToString(), null));
                }
                catch (Exception ex)
                {
                    STLoggerFactory.Logger.Log("Error to updateCacheAsync", ex, Infrastructure.STLogging.Interface.LogLevelEnum.Warn);
                }

                XmlSerializer serializer = new XmlSerializer(typeof(MetadataSetType));
                using (TextReader reader = new StringReader(stringValue))
                {
                    MetadataSetType result = (MetadataSetType)serializer.Deserialize(reader);
                    return result;
                }
            }
            catch (Exception ex)
            {
                throw Utility.Utils.getCustomException("UPDATE_METADATASET_ERROR",
                  @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - " + ex.Message, Infrastructure.STLogging.Interface.LogLevelEnum.Error);
            }
        }

        public List<int> SearchMetadataSetIdByDataflowURN(string dataflowURN)
        {
            try
            {
                string stringValue = DmApiConnector.SearchMetadataSetIdByDataflowURN(dataflowURN);
                XmlSerializer serializer = new XmlSerializer(typeof(List<int>));
                using (TextReader reader = new StringReader(stringValue))
                {
                    List<int> result = (List<int>)serializer.Deserialize(reader);
                    return result;
                }
            }
            catch (Exception ex)
            {
                throw Utility.Utils.getCustomException("SEARCH_METADATASET_ERROR",
                  @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - " + ex.Message, Infrastructure.STLogging.Interface.LogLevelEnum.Error);
            }
        }

        public MetadataSetType GetSimpleMetadataSet(string idMetadataSet)
        {
            try
            {
                string stringValue = DmApiConnector.GetSimpleMetadataSet(idMetadataSet);
                XmlSerializer serializer = new XmlSerializer(typeof(MetadataSetType));
                using (TextReader reader = new StringReader(stringValue))
                {
                    return (MetadataSetType)serializer.Deserialize(reader);
                }
            }
            catch (Exception ex)
            {
                throw Utility.Utils.getCustomException("GET_METADATASET_ERROR",
                  @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - " + ex.Message, Infrastructure.STLogging.Interface.LogLevelEnum.Error);
            }
        }

        public string DeleteMetadataSet(int idMetadataSet)
        {
            return DmApiConnector.DeleteMetadataSet(idMetadataSet);
        }

        public string DeleteReport(int idReport)
        {
            return DmApiConnector.DeleteReport(idReport, _nodeConfig.DcatApIt.MSD);
        }

        public string GetCube(int? id)
        {
            return DmApiConnector.GetCube(id);
        }

        public string GetAvailableCubesNoFilter()
        {
            return DmApiConnector.GetAvailableCubesNoFilter();
        }

        public string GetDCS()
        {
            return DmApiConnector.GetDcs();
        }

        public string GetFileMapping(int? id)
        {
            return DmApiConnector.GetFileMapping(id);
        }

        public string GetDDBDataflow(int? id)
        {
            return DmApiConnector.GetDDBDataflow(id);
        }

        public string GetDDBDataflowNoFilter(int? dataFlowId)
        {
            return DmApiConnector.GetDDBDataflowNoFilter(dataFlowId);
        }

        public string GetDDBDataflowsNoFilter(int cubeId)
        {
            return DmApiConnector.GetDDBDataflowsNoFilter(cubeId);
        }

        public async Task<DFDownload> DownloadDDBDataflow(DDBDataflow ddbDataflow, string format, string separator, string delimiter, bool zipped, string observation)
        {
            var resultDataFlow = DmApiConnector.GetDDBDataflow(ddbDataflow.IDDataflow);
            if (string.IsNullOrWhiteSpace(resultDataFlow))
            {
                throw Utility.Utils.getCustomException("DATAFLOW_DOWNLOAD_NOTFOUND",
                       @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + $" - Ma API not found dataflow {ddbDataflow.IDDataflow}", Infrastructure.STLogging.Interface.LogLevelEnum.Error);
            }
            var dataFlow = JsonConvert.DeserializeObject<DDBDataflowWithCols>(resultDataFlow);

            //generating MappingSet for df not in production
            int? msId = dfProd.GetMappingSetIdForDDBDataflow(ddbDataflow.IDDataflow);
            if (msId == null)
                dfProd.CreateMappingSetForDataflow(ddbDataflow.IDDataflow, null);

            Stream stream = null;
            var dfDownload = new DFDownload { Stream = stream, Format = "application/xml", Ext = "xml" };
            switch (format.ToUpperInvariant())
            {
                case "GENERICDATA":
                    dfDownload.Format = "application/vnd.sdmx.genericdata+xml;version=2.1";
                    dfDownload.Ext = "xml";
                    break;
                case "GENERICDATA20":
                    dfDownload.Format = "application/vnd.sdmx.genericdata+xml; version=2.0; charset=utf-8";
                    dfDownload.Ext = "xml";
                    break;
                case "JSONDATA":
                    dfDownload.Format = "application/vnd.sdmx.data+json";
                    dfDownload.Ext = "json";
                    break;
                case "JSONSTRUCTURE":
                    dfDownload.Format = "application/vnd.sdmx.structure+json;version=1.0.0";
                    dfDownload.Ext = "json";
                    break;
                case "STRUCTURE":
                    dfDownload.Format = "application/vnd.sdmx.structure+xml;version=2.1";
                    dfDownload.Ext = "xml";
                    break;
                case "STRUCTURESPECIFICDATA":
                    dfDownload.Format = "application/vnd.sdmx.structurespecificdata+xml;version=2.1";
                    dfDownload.Ext = "xml";
                    break;
                case "CSV":
                    dfDownload.Format = "text/csv";
                    dfDownload.Ext = "csv";
                    break;
                case "CUSTOMCSV":
                    dfDownload.Format = "text/csv";
                    dfDownload.Ext = "csv";
                    break;
                case "RDF":
                    dfDownload.Format = "application/rdf+xml";
                    dfDownload.Ext = "rdf";
                    break;
                case "XML":
                    dfDownload.Format = "application/xml";
                    dfDownload.Ext = "xml";
                    break;
                case "COMPACTDATA":
                    dfDownload.Format = "application/vnd.sdmx.compactdata+xml";
                    dfDownload.Ext = "xml";
                    break;
                case "CROSSSECTIONALDATA":
                    dfDownload.Format = "application/vnd.sdmx.crosssectionaldata+xml";
                    dfDownload.Ext = "xml";
                    break;
                case "EDIDATA":
                    dfDownload.Format = "application/vnd.sdmx.edidata";
                    dfDownload.Ext = "edidata";
                    break;
            }
            if (format.Equals("CUSTOMCSV", StringComparison.InvariantCultureIgnoreCase))
            {
                _logger.Log("Start Request stream for DownloadDDBDataflow", Infrastructure.STLogging.Interface.LogLevelEnum.Debug);
                dfDownload.FilePath = await DownloadDDBDataflowCsv(ddbDataflow, false, false, string.IsNullOrWhiteSpace(separator) ? ';' : separator[0], string.IsNullOrWhiteSpace(delimiter) ? (Nullable<char>)null : delimiter[0]);//USE DM API
                _logger.Log("End Request stream for DownloadDDBDataflow", Infrastructure.STLogging.Interface.LogLevelEnum.Debug);
            }
            else
            {
                dfDownload.FilePath = await MaApiConnector.DownloadDDBDataflow(dataFlow.ID, dataFlow.Agency, dataFlow.Version, dfDownload.Format, observation);
            }
            dfDownload.Stream = stream;

            //removing mapping set if created for df not in production
            if (msId == null)
            {
                dfProd.RemoveMappingSet(ddbDataflow.IDDataflow);
            }


            if (!dfDownload.FilePath.EndsWith(".zip", StringComparison.InvariantCultureIgnoreCase))
            {
                FileInfo infoSize = new FileInfo(dfDownload.FilePath);
                if (infoSize.Length >= 1073741824) //1Gb
                {
                    zipped = true;
                }
            }
            if (zipped)
            {
                string fileToWriteTo = Path.GetTempFileName();
                File.Delete(fileToWriteTo);
                fileToWriteTo += ".SH.download.zip";
                using (ZipArchive zip = ZipFile.Open(fileToWriteTo, ZipArchiveMode.Create))
                {
                    zip.CreateEntryFromFile(dfDownload.FilePath, $"Dataflow_{dataFlow.IDDataflow}_{dataFlow.ID}.{dfDownload.Ext}");
                }
                File.Delete(dfDownload.FilePath);
                dfDownload.Ext = "zip";
                dfDownload.Format = "application/zip";
                dfDownload.FilePath = fileToWriteTo;
                _logger.Log($"DownloadDDBDataflow create zip {fileToWriteTo}", Infrastructure.STLogging.Interface.LogLevelEnum.Debug);
            }

            return dfDownload;
        }

        public DFDownload DownloadMetadati(string format, string type, List<ArtefactIdentity> artefacts, bool includeReference, string lang, string separator, string delimiter, bool zipped, NodeConfig.nAnnotations nAnnotations)
        {
            SdmxStructureEnumType sdmxType;
            switch (type.ToUpperInvariant())
            {
                case "CODELIST":
                    sdmxType = SdmxStructureEnumType.CodeList;
                    break;
                case "CATEGORYSCHEME":
                    sdmxType = SdmxStructureEnumType.CategoryScheme;
                    break;
                case "CONCEPTSCHEME":
                    sdmxType = SdmxStructureEnumType.ConceptScheme;
                    break;
                case "DSD":
                    sdmxType = SdmxStructureEnumType.Dsd;
                    break;
                case "CATEGORISATION":
                    sdmxType = SdmxStructureEnumType.Categorisation;
                    break;
                case "DATAFLOW":
                    sdmxType = SdmxStructureEnumType.Dataflow;
                    break;
                case "METADATAFLOW":
                    sdmxType = SdmxStructureEnumType.MetadataFlow;
                    break;
                case "MSD":
                    sdmxType = SdmxStructureEnumType.Msd;
                    break;
                case "AGENCYSCHEME":
                    sdmxType = SdmxStructureEnumType.AgencyScheme;
                    break;
                case "CONTENTCONSTRAINT":
                    sdmxType = SdmxStructureEnumType.ContentConstraint;
                    break;
                case "HIERARCHICALCODELIST":
                    sdmxType = SdmxStructureEnumType.HierarchicalCodelist;
                    break;
                default:
                    sdmxType = SdmxStructureEnumType.CodeList;
                    break;
            }
            var dfDownload = new DFDownload { Format = "application/vnd.sdmx.structure+xml; charset=utf-8; version=2.1", Ext = "xml" };
            switch (format.ToUpperInvariant())
            {
                case "STRUCTURE":
                    dfDownload.Format = "application/vnd.sdmx.structure+xml; charset=utf-8; version=2.1";
                    dfDownload.Ext = "xml";
                    break;
                case "STRUCTURE20":
                    dfDownload.Format = "application/vnd.sdmx.structure+xml; charset=utf-8; version=2.0";
                    dfDownload.Ext = "xml";
                    break;
                case "STRUCTUREJSON":
                    dfDownload.Format = "application/vnd.sdmx.structure+json; charset=utf-8; version=1.0";
                    dfDownload.Ext = "xml";
                    break;
                case "STRUCTUREJSONWD":
                    dfDownload.Format = "application/vnd.sdmx.structure+json; charset=utf-8; version=1.0.0-wd";
                    dfDownload.Ext = "xml";
                    break;
                case "JSONDATA":
                    dfDownload.Format = "text/json; charset=utf-8";
                    dfDownload.Ext = "json";
                    break;
                case "RDF":
                    dfDownload.Format = "application/rdf+xml; charset=utf-8";
                    dfDownload.Ext = "rdf";
                    break;
                case "CSV":
                    dfDownload.Format = "application/vnd.sdmx.data+csv";
                    dfDownload.Ext = "csv";
                    break;
                case "RTF":
                    dfDownload.Format = "application/rtf";
                    dfDownload.Ext = "rtf";
                    break;
            }

            if (dfDownload.Ext.Equals("rtf", StringComparison.InvariantCultureIgnoreCase))
            {
                if (sdmxType != SdmxStructureEnumType.Dsd)
                {
                    throw new NotImplementedException();
                }
                foreach (var item in artefacts)
                {
                    //RTF can download only one for time
                    dfDownload.Stream = DownloadMetadata.GenerateRTFFile(Sdmx21Connector.GetArtefacts(sdmxType, item.ID, item.Agency, item.Version, StructureReferenceDetailEnumType.Children, "Full"), new CultureInfo(lang), includeReference);
                    break;
                }

                return dfDownload;
            }
            else
            {
                if (format.Equals("csv", StringComparison.InvariantCultureIgnoreCase) &&
                    sdmxType != SdmxStructureEnumType.CategoryScheme && sdmxType != SdmxStructureEnumType.ConceptScheme && sdmxType != SdmxStructureEnumType.CodeList)
                {
                    throw new NotImplementedException();
                }

                var sdmxObjects = new SdmxObjectsImpl();
                foreach (var item in artefacts)
                {
                    var itemAdd = Sdmx21Connector.GetArtefacts(sdmxType, item.ID, item.Agency, item.Version, includeReference ? StructureReferenceDetailEnumType.Children : StructureReferenceDetailEnumType.None, "Full");

                    if (artefacts.Count == 1)
                    {
                        sdmxObjects = new SdmxObjectsImpl(itemAdd);
                        break;//If a single download, take just first Object return witout any addItem in the switch
                    }

                    foreach (var itemArtefacts in itemAdd.GetAllMaintainables())
                    {
                        SdmxUtils.AddItemSdmxObject(itemArtefacts, sdmxObjects);
                    }
                }
                ISdmxObjects sdmxObjectOrder = null;
                try
                {
                    sdmxObjectOrder = DownloadMetadata.GetOrderArtefacts(sdmxObjects, format, separator, delimiter, nAnnotations, lang);
                }
                catch (Exception ex)
                {
                    sdmxObjectOrder = sdmxObjects;
                    _logger.Log("Some error in order object: " + ex.Message, Infrastructure.STLogging.Interface.LogLevelEnum.Error);
                }


                if (format.Equals("JSONDATA", StringComparison.InvariantCultureIgnoreCase))
                {
                    var str = GetSdmxJsonFromSdmxObjects(sdmxObjectOrder);
                    var byteArray = Encoding.ASCII.GetBytes(str);
                    dfDownload.Stream = new MemoryStream(byteArray);
                }
                else
                {
                    dfDownload.Stream = DownloadMetadata.ConvertArtefacts(sdmxType, sdmxObjectOrder, format, separator, delimiter, lang, nAnnotations);
                }

                if (zipped)
                {
                    var archiveStream = new MemoryStream();

                    using (var archive = new ZipArchive(archiveStream, ZipArchiveMode.Create, true))
                    {
                        var firstItem = artefacts.First();
                        var zinName = $"{sdmxType}_{firstItem.ID}+{firstItem.Agency}+{firstItem.Version}.{dfDownload.Ext}";
                        if (artefacts.Count == 1)
                        {
                            zinName = $"{firstItem.ID}+{firstItem.Agency}+{firstItem.Version}.{dfDownload.Ext}";
                        }
                        var zipArchiveEntry = archive.CreateEntry(zinName, CompressionLevel.Fastest);
                        using (var zipStream = zipArchiveEntry.Open())
                        {
                            using (var ms = new MemoryStream())
                            {
                                dfDownload.Stream.CopyTo(ms);
                                var fileBytes = ms.ToArray();
                                zipStream.Write(fileBytes, 0, fileBytes.Length);
                            }
                        }
                    }
                    archiveStream.Position = 0;
                    dfDownload.Stream = archiveStream;

                    dfDownload.Ext = "zip";
                }

                return dfDownload;
            }
        }

        public List<string> GetUserCategory(string username)
        {
            return DmApiConnector.GetUserCategory(username);
        }

        public Dictionary<string, bool> GetUserCube(string username)
        {
            return DmApiConnector.GetUserCube(username);
        }

        public List<string> GetUserFunctionality(string username)
        {
            return DmApiConnector.GetUserFunctionality(username);
        }

        public List<string> GetUserAgency(string username)
        {
            return DmApiConnector.GetUserAgency(username);
        }

        public Dictionary<string, bool> GetUserDataflow(string username)
        {
            return DmApiConnector.GetUserDataflow(username);
        }

        public Dictionary<string, bool> GetUserMetadataset(string username)
        {
            return DmApiConnector.GetUserMetadataset(username);
        }

        public List<string> GetAllAgency()
        {
            return DmApiConnector.GetAllAgency();
        }

        public List<string> GetAllDataflow()
        {
            return DmApiConnector.GetAllDataflow();
        }

        public List<string> GetAllMetadataFlow()
        {
            return DmApiConnector.GetAllMetadataFlow();
        }

        public List<string> GetAllRules()
        {
            return DmApiConnector.GetAllRules();
        }


        public UserDataDTO GetData(string username)
        {
            return DmApiConnector.GetData(username);
        }

        public List<UsersDTO> GetUsers()
        {
            return DmApiConnector.GetUsers();
        }

        public EntityOwners GetOwners(string entity, string id)
        {
            return DmApiConnector.GetOwners(entity, id);
        }

        public void SetOwners(EntityOwners entityOwners)
        {
            DmApiConnector.SetOwners(entityOwners);
        }

        public bool IsAgencyAssignToAnyUser(string agencyCode)
        {
            return DmApiConnector.IsAgencyAssignToAnyUser(agencyCode);
        }


        public string GetMAEntity(string type, int? id)
        {
            return MaApiConnector.GetEntity(type, id);
        }

        /// <summary>
        /// Returns the header for the given dataflow
        /// </summary>
        /// <param name="id">The id of the dataflow.</param>
        /// <param name="agency">The agency of the dataflow.</param>
        /// <param name="version">The version of the dataflow.</param>
        /// <returns></returns>
        public string GetDfHeader(string id, string agency, string version)
        {
            //Gets all the headers
            var temp = MaApiConnector.GetEntity("header_template", null);

            if (temp == null)
                return JsonConvert.SerializeObject(null);

            HeaderTemplate[] list = JsonConvert.DeserializeObject<HeaderTemplate[]>(temp);

            string headId = list.Where(h => h.parentId == $"urn:sdmx:org.sdmx.infomodel.datastructure.Dataflow={agency}:{id}({version})")
                              .Select(x => x.entityId)
                              .SingleOrDefault();

            if (headId == null)
                return JsonConvert.SerializeObject(null);

            string temp2 = MaApiConnector.GetEntity("header_template", int.Parse(headId));

            HeaderTemplate[] list2 = JsonConvert.DeserializeObject<HeaderTemplate[]>(temp2);

            if (list2 == null)
                return JsonConvert.SerializeObject(null);

            return JsonConvert.SerializeObject(list2[0]);
        }

        public string GetSdmxStructure(SdmxStructureEnumType artefactType, string id, string agencyID, string version, int numPage, int pageSize, StructureReferenceDetailEnumType refDetail = StructureReferenceDetailEnumType.None)
        {
            return commonGetSdmxStructure(artefactType, id, agencyID, version, numPage, pageSize, refDetail);
        }

        public string GetSdmxStructure(SdmxStructureEnumType artefactType, string id, string agencyID, string version, StructureReferenceDetailEnumType refDetail = StructureReferenceDetailEnumType.None)
        {
            return commonGetSdmxStructure(artefactType, id, agencyID, version, 1, -1, refDetail);
        }

        private string commonGetSdmxStructure(SdmxStructureEnumType artefactType, string id, string agencyID, string version, int numPage, int pageSize, StructureReferenceDetailEnumType refDetail)
        {
            Stopwatch stopwatch = null;
            stopwatch = Stopwatch.StartNew();
            var sdmxObject = Sdmx21Connector.GetArtefacts(artefactType, id, agencyID, version, refDetail);
            _logger.Log($"commonGetSdmxStructure GetArtefacts FULL {stopwatch.ElapsedMilliseconds}ms", Infrastructure.STLogging.Interface.LogLevelEnum.Debug);
            stopwatch.Restart();

            if (artefactType == SdmxStructureEnumType.CodeList)
            {
                if (_nodeConfig.Search != null && _nodeConfig.Search.ExcludeCodelists != null && sdmxObject.Codelists != null && _nodeConfig.Search.ExcludeCodelists.Count > 0)
                { //Filter CodeList
                    var result = sdmxObject.Codelists.Where(item => _nodeConfig.Search.ExcludeCodelists.Contains(item.Id));
                    foreach (var itemFilter in result)
                    {
                        sdmxObject.RemoveCodelist(itemFilter);
                    }
                }
                SdmxUtils.PaginatedCodeList(sdmxObject, numPage, pageSize);
            }
            else if (artefactType == SdmxStructureEnumType.ConceptScheme)
            {
                if (_nodeConfig.Search != null && _nodeConfig.Search.ExcludeConceptSchemes != null && _nodeConfig.Search.ExcludeConceptSchemes.Count > 0)
                { //Filter ConceptScheme
                    var result = sdmxObject.ConceptSchemes.Where(item => _nodeConfig.Search.ExcludeConceptSchemes.Contains(item.Id));
                    foreach (var itemFilter in result)
                    {
                        sdmxObject.RemoveConceptScheme(itemFilter);
                    }
                }
            }

            return GetSdmxJsonFromSdmxObjects(sdmxObject);
        }

        public ISdmxObjects GetSdmxObjects(SdmxStructureEnumType artefactType, string id, string agencyID, string version, StructureReferenceDetailEnumType refDetail = StructureReferenceDetailEnumType.None)
        {
            return Sdmx21Connector.GetArtefacts(artefactType, id, agencyID, version, refDetail);
        }

        /// <summary>
        /// Returns all DSDs having no annotations of type CustomDSD (used for DM - Builder)
        /// </summary>
        /// <returns></returns>
        public string GetDsdNoCustom()
        {
            ISdmxObjects objs = Sdmx21Connector.GetArtefacts(SdmxStructureEnumType.Dsd, null, null, null);
            ISdmxObjects filtObjs = new SdmxObjectsImpl();

            IEnumerator<IDataStructureObject> enumer = objs.DataStructures.GetEnumerator();
            while (enumer.MoveNext())
            {
                IDataStructureMutableObject dsd = enumer.Current.MutableInstance;

                //se la dsd NON ha un annotation CustomDSD la aggiungo tra gli oggetti da restituire
                IAnnotationMutableObject ann = dsd.Annotations.Where(x => x.Type == _nodeConfig.Annotations.CustomDSD).SingleOrDefault();

                if (ann == null)
                {
                    IDataStructureObject dsdImm = dsd.ImmutableInstance;
                    filtObjs.AddDataStructure(dsdImm);
                }
            }
            return GetSdmxJsonFromSdmxObjects(filtObjs);
        }

        public List<ArtefactIdentity> GetDsdUsedInDdb(string id = null, string agencyId = null, string version = null)
        {
            ISdmxObjects objs = Sdmx21Connector.GetArtefacts(SdmxStructureEnumType.Dsd, id, agencyId, version);
            ISdmxObjects filtObjs = new SdmxObjectsImpl();

            IEnumerator<IDataStructureObject> enumer = objs.DataStructures.GetEnumerator();
            while (enumer.MoveNext())
            {
                IDataStructureMutableObject dsd = enumer.Current.MutableInstance;

                //if the dsd has no CustomDSD Annotations it is added to the result
                IAnnotationMutableObject ann = dsd.Annotations.Where(x => x.Type == _nodeConfig.Annotations.CustomDSD).SingleOrDefault();

                if (ann == null)
                {
                    IDataStructureObject dsdImm = dsd.ImmutableInstance;
                    filtObjs.AddDataStructure(dsdImm);
                }
            }

            var optionsTable = new OptionsTable
            {
                SelCols = new List<string> { "DSDCode" },
                PageNum = 1,
                PageSize = -1
            };

            var dtAllDsdInDbb = JsonConvert.DeserializeObject<DataResults>(GetTablePreview("CatCube", optionsTable));

            var avaiableDsd = new List<ArtefactIdentity>();
            var checkDuplicate = new List<string>();
            foreach (DataRow itemDsd in dtAllDsdInDbb.Data.Rows)
            {
                var keyDsd = (string)itemDsd[0];
                var itemSplitDsdKey = keyDsd.Split('+');
                var dsdId = itemSplitDsdKey[0];
                var dsdAgency = itemSplitDsdKey[1];
                var dsdVersion = itemSplitDsdKey[2];
                var result = filtObjs.DataStructures.FirstOrDefault(dsd => dsd.Id.Equals(dsdId, StringComparison.InvariantCultureIgnoreCase) &&
                                                    dsd.AgencyId.Equals(dsdAgency, StringComparison.InvariantCultureIgnoreCase) &&
                                                    dsd.Version.Equals(dsdVersion, StringComparison.InvariantCultureIgnoreCase));
                if (result != null && !checkDuplicate.Contains(keyDsd))
                {
                    checkDuplicate.Add(keyDsd);
                    avaiableDsd.Add(new ArtefactIdentity { ID = result.Id, Agency = result.AgencyId, Version = result.Version, IsFinal = result.IsFinal.IsTrue });
                }
            }

            return avaiableDsd;
        }

        public List<ArtefactReference> ArtefactChildrenReference(SdmxStructureEnumType artefactType, string id, string agencyID, string version)
        {
            var children = Sdmx21Connector.GetArtefacts(artefactType, id, agencyID, version, StructureReferenceDetailEnumType.Children);

            var result = new List<ArtefactReference>();
            foreach (var item in children.GetAllMaintainables())
            {
                if (!item.Id.Equals(id, StringComparison.InvariantCultureIgnoreCase) ||
                    !item.AgencyId.Equals(agencyID, StringComparison.InvariantCultureIgnoreCase) ||
                    !item.Version.Equals(version, StringComparison.InvariantCultureIgnoreCase) ||
                    item.StructureType != artefactType)
                {
                    var art = new ArtefactReference { ID = item.Id, Agency = item.AgencyId, Version = item.Version, EnumType = item.StructureType, IsFinal = item.IsFinal.IsTrue, ReferenceType = "children", ArtefactType = item.StructureType.ToString() };
                    foreach (var lang in item.Names)
                    {
                        art.Names.Add(lang.Locale, lang.Value);
                    }
                    result.Add(art);
                }
            }

            return result;
        }

        public List<ArtefactReference> ArtefactParentsReference(SdmxStructureEnumType artefactType, string id, string agencyID, string version)
        {
            var parents = Sdmx21Connector.GetArtefacts(artefactType, id, agencyID, version, StructureReferenceDetailEnumType.Parents);

            var result = new List<ArtefactReference>();
            foreach (var item in parents.GetAllMaintainables())
            {
                if (!item.Id.Equals(id, StringComparison.InvariantCultureIgnoreCase) ||
                    !item.AgencyId.Equals(agencyID, StringComparison.InvariantCultureIgnoreCase) ||
                    !item.Version.Equals(version, StringComparison.InvariantCultureIgnoreCase) ||
                    item.StructureType != artefactType)
                {
                    var art = new ArtefactReference { ID = item.Id, Agency = item.AgencyId, Version = item.Version, EnumType = item.StructureType, IsFinal = item.IsFinal.IsTrue, ReferenceType = "parents", ArtefactType = item.StructureType.ToString() };
                    foreach (var lang in item.Names)
                    {
                        art.Names.Add(lang.Locale, lang.Value);
                    }
                    result.Add(art);
                }
            }

            return result;
        }

        #endregion

        #region CREATE

        /// <summary>
        /// Creates a cube querying SDMX WS and adding corrispondent codes for each attribute or dimension.
        /// Adds annotation of type AssociatedCube to the corrispondent DSD.
        /// </summary>
        /// <param name="cube"></param>
        /// <returns></returns>
        public string CreateCube(string cube)
        {
            string c = null;

            try
            {
                dynamic cubeObj = JObject.Parse(cube);

                void AddCodesToComponent(ref dynamic comp)
                {
                    if (comp.CodelistCode != null)
                    {
                        string[] triplet = ((string)comp.CodelistCode).Split("+");
                        string id = triplet[0], agencyId = triplet[1], version = triplet[2];

                        IEnumerator<ICodelistObject> codelistIter = Sdmx21Connector
                            .GetArtefacts(SdmxStructureEnumType.CodeList, id, agencyId, version)
                            .GetCodelists(agencyId)
                            .GetEnumerator();

                        codelistIter.MoveNext();
                        List<string> codes = new List<String>();
                        foreach (ICode code in codelistIter.Current.Items)
                        {
                            codes.Add(code.Id);
                        }
                        comp.codes = JToken.FromObject(codes);
                    }
                    else
                    {
                        comp.codes = null;
                    }
                }

                foreach (dynamic attribute in cubeObj.Attributes)
                {
                    AddCodesToComponent(attribute);
                }

                foreach (dynamic dimension in cubeObj.Dimensions)
                {
                    AddCodesToComponent(dimension);
                }

                c = JsonConvert.SerializeObject(cubeObj);

                //Add AssociatedCube annotation to Dsd
                AddAssdociatedCubeAnnotationToDsd(c);
            }
            catch (Exception ex)
            {
                throw Utility.Utils.getCustomException("CUBE_CREATE_ERROR",
                   @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - " + ex.Message, Infrastructure.STLogging.Interface.LogLevelEnum.Error);
            }
            return DmApiConnector.CreateCube(c);
        }

        public string CreateFileMapping(string fileMapping)
        {
            return DmApiConnector.CreateFileMapping(fileMapping);
        }

        /// <summary>
        /// Creates a DDBDataflow: it controls DDBDataflow and SDMX dataflow are not inconsistent and then creates corrispondent artefact in MSDB and DDB.
        /// Optionally creates dataflow's categorisations and header.
        /// If the dataflow has fewer columns than the original cube a new DSD is also created.
        /// </summary>
        /// <param name="ddbDF">Dataflow to be created in DDB.</param>
        /// <param name="msdbDF">SDMX-JSON containing dataflow to be created in MSDB.</param>
        /// <param name="msdbCat">SDMX-JSON containing categorisations to be created in MSDB.</param>
        /// <param name="msdbDF">HeaderTemplate to be created in MSDB.</param>
        /// <returns></returns>
        public string CreateDDBDataflow(DDBDataflowWithCols ddbDF, string msdbDF, string msdbCat, HeaderTemplate header)
        {
            try
            {
                ISdmxObjects obj = GetSdmxObjectsFromSdmxJson(msdbDF);

                if (obj.Dataflows.Count != 1)
                {
                    throw new Exception();
                }

                //getting the only dataflow
                IEnumerator<IDataflowObject> enumer = obj.Dataflows.GetEnumerator();
                enumer.MoveNext();
                IDataflowObject df = enumer.Current;

                //controlling coherence between the two structures
                if (!(df.Id == ddbDF.ID && df.AgencyId == ddbDF.Agency && df.Version == ddbDF.Version))
                {
                    throw new Exception();
                }

                //add annotation 'DDBDataflow' (in order not to delete a dataflow in MSDB with an associated dataflow in the DDB) if it does not exist (e.g. update case)
                bool hasDDBDfAnnotation = false;

                foreach (IAnnotationMutableObject oldAnn in df.MutableInstance.Annotations)
                {
                    if (oldAnn.Type == _nodeConfig.Annotations.DDBDataflow)
                    {
                        hasDDBDfAnnotation = true;
                        break;
                    }
                }

                if (!hasDDBDfAnnotation)
                {
                    AnnotationMutableCore ann = new AnnotationMutableCore();
                    ann.Id = _nodeConfig.Annotations.DDBDataflow;
                    ann.Type = _nodeConfig.Annotations.DDBDataflow;
                    ann.Title = GetEncodedConnectionString();
                    IDataflowMutableObject dfMut = df.MutableInstance;
                    dfMut.AddAnnotation(ann);
                    df = dfMut.ImmutableInstance;
                }

                //check Categorisations if passed as a parameter
                ISdmxObjects catObjs = null;
                if (msdbCat != "null")
                {
                    catObjs = GetSdmxObjectsFromSdmxJson(msdbCat);
                    if (catObjs.Categorisations.Count < 1)
                    {
                        throw new Exception();
                    }
                }

                return CreateDDBDataflow(ddbDF, df, catObjs, header);
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        /// <summary>
        /// Creates a DDBDataflow: it controls DDBDataflow and SDMX dataflow are not inconsistent and then creates corrispondent artefact in MSDB e DDB.
        /// Optionally creates dataflow's categorisations and header.
        /// If the dataflow has fewer columns than the original cube a new DSD is also created.
        /// </summary>
        /// <param name="ddbDF">Dataflow to be created in DDB.</param>
        /// <param name="df">Dataflow to be created in MSDB.</param>
        /// <param name="catObjs">Categorisations to be created in MSDB.</param>
        /// <param name="header">HeaderTemplate to be created in MSDB.</param>
        /// <returns></returns>
        private string CreateDDBDataflow(DDBDataflowWithCols ddbDF, IDataflowObject df, ISdmxObjects catObjs, HeaderTemplate header)
        {
            int idDf = 0;

            try
            {
                //SdmxObjs to be created: the df and a new custom dsd if the dataflow has fewer columns than the original cube
                _logger.Log("Creating dataflow on DDB", Infrastructure.STLogging.Interface.LogLevelEnum.Info);

                idDf = int.Parse(DmApiConnector.CreateDDBDataflow(JsonConvert.SerializeObject(ddbDF)));


                ISdmxObjects obj = GetDfWithNewDsd(ref ddbDF, df);

                _logger.Log("Creating dataflow (eventually with new custom DSD) on MSDB ", Infrastructure.STLogging.Interface.LogLevelEnum.Info);

                Sdmx21Connector.CreateArtefacts(obj);

                try
                {
                    SynchronizeAuthDB();
                    DmApiConnector.AssignDataflowFirstOwnership($"{obj.Dataflows.First().Id}+{obj.Dataflows.First().AgencyId}+{obj.Dataflows.First().Version}", Utils.GetUsername(_contextAccessor.HttpContext.User.Identity));
                }
                catch (Exception ex)
                {
                    _logger.Log("Error in AssignDataflowOwnership" + ex.Message + ex.StackTrace, Infrastructure.STLogging.Interface.LogLevelEnum.Error);
                }

                //adding Categorisations (cannot be done within previous operation)
                if (catObjs != null)
                {
                    _logger.Log("Creating dataflow's categorisations", Infrastructure.STLogging.Interface.LogLevelEnum.Info);

                    Sdmx21Connector.CreateArtefacts(catObjs);
                }

                if (header != null)
                {
                    _logger.Log("Creating dataflow's header", Infrastructure.STLogging.Interface.LogLevelEnum.Info);

                    MaApiConnector.CreateHeaderTemplate(header);
                }

                return JsonConvert.SerializeObject(idDf);
            }
            catch (Exception ex)
            {
                if (idDf > 0)
                {
                    _logger.Log("Rollback: deleting dataflow on DDB", Infrastructure.STLogging.Interface.LogLevelEnum.Info);

                    //cancello il dataflow sul DDB se era già stato creato correttamente
                    DmApiConnector.DeleteDDBDataflow(idDf);
                }

                throw ex;
            }
        }

        public string CreateArtefacts(string str)
        {
            var sdmxObject = GetSdmxObjectsFromSdmxJson(str);
            var result = Sdmx21Connector.CreateArtefacts(sdmxObject);
            try
            {
                if (result && (sdmxObject.HasMetadataflows || sdmxObject.HasDataflows))
                {
                    SynchronizeAuthDB();
                    foreach (var itemObj in sdmxObject.Metadataflows)
                    {
                        DmApiConnector.AssignMetadataFlowFirstOwnership($"{itemObj.Id}+{itemObj.AgencyId}+{itemObj.Version}", Utils.GetUsername(_contextAccessor.HttpContext.User.Identity));
                    }
                    foreach (var itemObj in sdmxObject.Dataflows)
                    {
                        DmApiConnector.AssignDataflowFirstOwnership($"{itemObj.Id}+{itemObj.AgencyId}+{itemObj.Version}", Utils.GetUsername(_contextAccessor.HttpContext.User.Identity));
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.Log("Error in CreateArtefacts Assign Ownership" + ex.Message + ex.StackTrace, Infrastructure.STLogging.Interface.LogLevelEnum.Error);
            }
            return JsonConvert.SerializeObject(result);
        }

        public string CreateArtefactsTest(bool isFullSet, bool isFinal)
        {
            return testArtefacts.TestCrudArtefacts(isFullSet, isFinal);
        }

        public string UpdateArtefacts(string str)
        {
            var obj = GetSdmxObjectsFromSdmxJson(str);

            var result = JsonConvert.SerializeObject(Sdmx21Connector.UpdateArtefacts(obj));

            try
            {
                Task.Run(() => updateArtefactCacheAsync(obj));
            }
            catch (Exception ex)
            {
                STLoggerFactory.Logger.Log("Error to updateCacheAsync", ex, Infrastructure.STLogging.Interface.LogLevelEnum.Warn);
            }


            return result;
        }

        private async Task updateArtefactCacheAsync(ISdmxObjects obj)
        {
            using (var client = new HttpClient(_httpClientHandler, true))
            {
                foreach (var item in obj.GetAllMaintainables())
                {
                    try
                    {
                        if (item.StructureType.EnumType != SdmxStructureEnumType.ConceptScheme &&
                            item.StructureType.EnumType != SdmxStructureEnumType.Msd &&
                            item.StructureType.EnumType != SdmxStructureEnumType.CodeList)
                        {
                            continue;
                        }

                        var request = new HttpRequestMessage(HttpMethod.Delete, _nodeConfig.Endpoint.MetadataBaseURL.Trim().TrimEnd('/').TrimEnd('\\') + $"/cleanArtefactInCache/{item.Id}/{item.AgencyId}/{item.Version}");

                        using (var response = await client.SendAsync(request))
                        {

                        }

                    }
                    catch (Exception ex)
                    {
                        STLoggerFactory.Logger.Log($"Error to updateCacheAsync artefact: {item.StructureType.StructureType}\t{item.Id}\t{item.AgencyId}\t{item.Version}", ex, Infrastructure.STLogging.Interface.LogLevelEnum.Warn);
                    }
                }
            }
        }

        private async Task updateMetadataCacheAsync(string metadataSetId, string reportId)
        {
            using (var client = new HttpClient(_httpClientHandler, true))
            {
                try
                {

                    var urlCompose = $"metadataSetId={metadataSetId}";
                    if (string.IsNullOrWhiteSpace(reportId))
                    {
                        urlCompose += $"&reportId={reportId}";
                    }
                    var request = new HttpRequestMessage(HttpMethod.Delete, _nodeConfig.Endpoint.MetadataBaseURL.Trim().TrimEnd('/').TrimEnd('\\') + $"/cleanRMMetadataInCache?{urlCompose}");

                    using (var response = await client.SendAsync(request))
                    {

                    }

                }
                catch (Exception ex)
                {
                    STLoggerFactory.Logger.Log($"Error to updateMetadataCacheAsync  metadataSetId: {metadataSetId}\treportId:{reportId}", ex, Infrastructure.STLogging.Interface.LogLevelEnum.Warn);
                }
            }
        }

        public string UpdateMSD(MSDRegistry msdRegistry)
        {

            var sdmxObject = Sdmx21Connector.GetArtefacts(SdmxStructureEnumType.Msd, msdRegistry.ID, msdRegistry.Agency, msdRegistry.Version, returnDetail: "Stub");
            if (!sdmxObject.HasMetadataStructures)
            {
                return JsonConvert.SerializeObject(false);
            }
            if (!sdmxObject.MetadataStructures.First().IsFinal.IsTrue)
            {
                sdmxObject = Sdmx21Connector.GetArtefacts(SdmxStructureEnumType.Msd, msdRegistry.ID, msdRegistry.Agency, msdRegistry.Version);
            }

            var msd = sdmxObject.MetadataStructures.First();

            var msdMutable = msd.MutableInstance;


            if (!msdMutable.FinalStructure.IsTrue && msdRegistry.IsFinal.HasValue && msdRegistry.IsFinal.Value)
            {
                msdMutable.FinalStructure = TertiaryBool.ParseBoolean(msdRegistry.IsFinal);
            }

            msdMutable.Uri = string.IsNullOrWhiteSpace(msdRegistry.Uri) ? null : new Uri(msdRegistry.Uri);
            msdMutable.StartDate = string.IsNullOrWhiteSpace(msdRegistry.ValidFrom) ? (DateTime?)null : Convert.ToDateTime(msdRegistry.ValidFrom);
            msdMutable.EndDate = string.IsNullOrWhiteSpace(msdRegistry.ValidTo) ? (DateTime?)null : Convert.ToDateTime(msdRegistry.ValidTo);

            msdMutable.Names.Clear();
            if (msdRegistry.Names != null)
            {
                foreach (var name in msdRegistry.Names)
                {
                    msdMutable.AddName(name.Key, name.Value);
                }
            }
            msdMutable.Descriptions.Clear();
            if (msdRegistry.Descriptions != null)
            {
                foreach (var desc in msdRegistry.Descriptions)
                {
                    msdMutable.AddDescription(desc.Key, desc.Value);
                }
            }
            msdMutable.Annotations.Clear();
            if (msdRegistry.Annotations != null)
            {
                foreach (var itemAnnotation in msdRegistry.Annotations)
                {
                    IAnnotationMutableObject annotation = new AnnotationMutableCore
                    {
                        Title = itemAnnotation.Title,
                        Type = itemAnnotation.Type,
                        Id = itemAnnotation.Id
                    };
                    if (itemAnnotation.Texts != null)
                    {
                        foreach (var itemText in itemAnnotation.Texts)
                        {
                            annotation.Text.Add(new TextTypeWrapperMutableCore { Locale = itemText.Key, Value = itemText.Value });
                        }
                    }
                    msdMutable.AddAnnotation(annotation);
                }
            }

            var msdUpdate = new SdmxObjectsImpl(msdMutable.ImmutableInstance);
            var result = JsonConvert.SerializeObject(Sdmx21Connector.UpdateArtefacts(msdUpdate));

            try
            {

                Task.Run(() => updateArtefactCacheAsync(msdUpdate));
            }
            catch (Exception ex)
            {
                STLoggerFactory.Logger.Log("Error to updateCacheAsync", ex, Infrastructure.STLogging.Interface.LogLevelEnum.Warn);
            }

            return result;
        }

        public string UpdateHierarchicalCodelist(HierarchicalCodelistRegistry hierarchicalCodelistRegistry)
        {

            var sdmxObject = Sdmx21Connector.GetArtefacts(SdmxStructureEnumType.HierarchicalCodelist, hierarchicalCodelistRegistry.ID, hierarchicalCodelistRegistry.Agency, hierarchicalCodelistRegistry.Version, returnDetail: "Stub");
            if (!sdmxObject.HasHierarchicalCodelists)
            {
                return JsonConvert.SerializeObject(false);
            }
            if (!sdmxObject.HierarchicalCodelists.First().IsFinal.IsTrue)
            {
                sdmxObject = Sdmx21Connector.GetArtefacts(SdmxStructureEnumType.HierarchicalCodelist, hierarchicalCodelistRegistry.ID, hierarchicalCodelistRegistry.Agency, hierarchicalCodelistRegistry.Version);
            }

            var msd = sdmxObject.HierarchicalCodelists.First();

            var msdMutable = msd.MutableInstance;


            if (!msdMutable.FinalStructure.IsTrue && hierarchicalCodelistRegistry.IsFinal.HasValue && hierarchicalCodelistRegistry.IsFinal.Value)
            {
                msdMutable.FinalStructure = TertiaryBool.ParseBoolean(hierarchicalCodelistRegistry.IsFinal);
            }

            msdMutable.Uri = string.IsNullOrWhiteSpace(hierarchicalCodelistRegistry.Uri) ? null : new Uri(hierarchicalCodelistRegistry.Uri);
            msdMutable.StartDate = string.IsNullOrWhiteSpace(hierarchicalCodelistRegistry.ValidFrom) ? (DateTime?)null : Convert.ToDateTime(hierarchicalCodelistRegistry.ValidFrom);
            msdMutable.EndDate = string.IsNullOrWhiteSpace(hierarchicalCodelistRegistry.ValidTo) ? (DateTime?)null : Convert.ToDateTime(hierarchicalCodelistRegistry.ValidTo);

            msdMutable.Names.Clear();
            if (hierarchicalCodelistRegistry.Names != null)
            {
                foreach (var name in hierarchicalCodelistRegistry.Names)
                {
                    msdMutable.AddName(name.Key, name.Value);
                }
            }
            msdMutable.Descriptions.Clear();
            if (hierarchicalCodelistRegistry.Descriptions != null)
            {
                foreach (var desc in hierarchicalCodelistRegistry.Descriptions)
                {
                    msdMutable.AddDescription(desc.Key, desc.Value);
                }
            }
            msdMutable.Annotations.Clear();
            if (hierarchicalCodelistRegistry.Annotations != null)
            {
                foreach (var itemAnnotation in hierarchicalCodelistRegistry.Annotations)
                {
                    IAnnotationMutableObject annotation = new AnnotationMutableCore
                    {
                        Title = itemAnnotation.Title,
                        Type = itemAnnotation.Type,
                        Id = itemAnnotation.Id
                    };
                    if (itemAnnotation.Texts != null)
                    {
                        foreach (var itemText in itemAnnotation.Texts)
                        {
                            annotation.Text.Add(new TextTypeWrapperMutableCore { Locale = itemText.Key, Value = itemText.Value });
                        }
                    }
                    msdMutable.AddAnnotation(annotation);
                }
            }


            var result = JsonConvert.SerializeObject(Sdmx21Connector.UpdateArtefacts(new SdmxObjectsImpl(msdMutable.ImmutableInstance)));
            return result;
        }

        #region Dataflow Production

        public string CreateMappingSetForDataflow(int dfId, string defaultValue)
        {
            dfProd.CreateMappingSetForDataflow(dfId, defaultValue);
            return JsonConvert.SerializeObject(true);
        }

        public string CreateTranscodingsForDataflow(int dfId)
        {
            dfProd.CreateTranscodingsForDataflow(dfId);
            return JsonConvert.SerializeObject(true);
        }

        public string CreateTranscodingsFromCCForDataflow(int dfId, string agCc, string idCc, string versCc)
        {
            dfProd.CreateTranscodingsFromCCForDataflow(dfId, agCc, idCc, versCc);
            return JsonConvert.SerializeObject(true);
        }

        public string CreateContentConstraintsForDataflow(int dfId)
        {
            dfProd.CreateContentConstraintsForDataflow(dfId);
            return JsonConvert.SerializeObject(true);
        }

        public string SetDataflowProductionFlag(int dfId, bool value)
        {
            dfProd.SetDataflowProductionFlag(dfId, value);
            return JsonConvert.SerializeObject(true);
        }

        public string RemoveMappingSetForDataflow(int dfId)
        {
            dfProd.RemoveMappingSet(dfId);
            return JsonConvert.SerializeObject(true);
        }

        public string RemoveTranscodingsForDataflow(int dfId)
        {
            dfProd.RemoveTranscodings(dfId);
            return JsonConvert.SerializeObject(true);
        }

        public string RemoveContentConstraintsForDataflow(int dfId)
        {
            dfProd.RemoveContentConstraints(dfId);
            return JsonConvert.SerializeObject(true);
        }

        public string GetMappingSetIdForDDBDataflow(int dfId)
        {
            return JsonConvert.SerializeObject(dfProd.GetMappingSetIdForDDBDataflow(dfId));
        }

        #endregion Dataflow Production

        public string CreateHeaderTemplate(string str)
        {
            return MaApiConnector.CreateHeaderTemplate(JsonConvert.DeserializeObject<HeaderTemplate>(str));
        }

        public int InsertDCS(DDB.Entities.Category category)
        {
            var str = DmApiConnector.InsertDCS(category);
            return Convert.ToInt32(str);
        }

        public void UpdateDCS(DDB.Entities.Category category)
        {
            DmApiConnector.UpdateDCS(category);
        }

        public bool DeleteDCS(string catCode)
        {
            var str = DmApiConnector.DeleteDCS(catCode);
            return Convert.ToBoolean(str);
        }

        #endregion

        #region DELETE

        /// <summary>
        /// Deletes the specified cube and the AssociatedCube annotation from its DSD
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        public string DeleteCube(int id)
        {
            string c = DmApiConnector.GetCube(id);
            DeleteAssociatedCubeAnnotationFromDsd(c);
            return DmApiConnector.DeleteCube(id);
        }

        public string DeleteFileMapping(int id)
        {
            return DmApiConnector.DeleteFileMapping(id);
        }

        /// <summary>
        /// Deletes an SDMX artefact from the MSDB. 
        /// If the artefact is a DSD, the method deletes it only if it has no AssociatedCube annotations.
        /// </summary>
        /// <param name="artefactType">The type of the artefact to delete.</param>
        /// <param name="id">The id of the artefact to delete.</param>
        /// <param name="agencyID">The agency of the artefact to delete.</param>
        /// <param name="version">The version of the artefact to delete.</param>
        /// <returns></returns>
        public string DeleteArtefact(SdmxStructureEnumType artefactType, string id, string agencyID, string version)
        {
            ISdmxObjects objs;
            try
            {
                if (artefactType == SdmxStructureEnumType.CategoryScheme)
                {
                    objs = Sdmx21Connector.GetArtefacts(artefactType, id, agencyID, version, StructureReferenceDetailEnumType.Parents);
                }
                //else if (artefactType == SdmxStructureEnumType.Dsd || artefactType == SdmxStructureEnumType.Dataflow || artefactType == SdmxStructureEnumType.Categorisation)
                //{ //Take annotation (untile REST support "StubAnnotation")
                //    objs = Sdmx21Connector.GetArtefacts(artefactType, id, agencyID, version);
                //}
                else if (artefactType == SdmxStructureEnumType.Categorisation || artefactType == SdmxStructureEnumType.MetadataFlow || artefactType == SdmxStructureEnumType.Dsd || artefactType == SdmxStructureEnumType.Dataflow || artefactType == SdmxStructureEnumType.ContentConstraint)
                {
                    objs = Sdmx21Connector.GetArtefacts(artefactType, id, agencyID, version, StructureReferenceDetailEnumType.None);
                }
                else
                {
                    objs = Sdmx21Connector.GetArtefacts(artefactType, id, agencyID, version, StructureReferenceDetailEnumType.None, "Stub");
                }
            }
            catch (Exception)
            {
                //artefact not found
                return JsonConvert.SerializeObject(true);
            }


            if (artefactType == SdmxStructureEnumType.Dsd)
            { //controls if the DSD has AssociatedCube annotations
                IEnumerator<IDataStructureObject> enumer = objs.DataStructures.GetEnumerator();
                enumer.MoveNext();
                IDataStructureMutableObject dsd = enumer.Current.MutableInstance;

                foreach (IAnnotationMutableObject ann in dsd.Annotations)
                {
                    if (ann.Type == _nodeConfig.Annotations.AssociatedCube || ann.Type == _nodeConfig.Annotations.CustomDSD)
                    {
                        throw Utility.Utils.getCustomException("DSD_WITH_ASSOCIATED_CUBES_OR_DF",
                            @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - The dsd has associated cubes or dataflows and cannot be deleted.", Infrastructure.STLogging.Interface.LogLevelEnum.Warn);
                    }
                }
            }
            else if (artefactType == SdmxStructureEnumType.Dataflow)
            { //controls if the Dataflow has DDBDataflow annotations

                IEnumerator<IDataflowObject> enumer = objs.Dataflows.GetEnumerator();
                enumer.MoveNext();
                IDataflowMutableObject df = enumer.Current.MutableInstance;

                foreach (IAnnotationMutableObject ann in df.Annotations)
                {
                    if (ann.Type != null && ann.Type.Equals(_nodeConfig.Annotations.DDBDataflow, StringComparison.InvariantCultureIgnoreCase))
                    {
                        throw Utility.Utils.getCustomException("DF_WITH_ASSOCIATED_DDB_DF",
                            @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - The dataflow has an associated DDB dataflow and cannot be deleted.", Infrastructure.STLogging.Interface.LogLevelEnum.Warn);
                    }
                    if (ann.Type != null && ann.Type.Equals(_nodeConfig.Annotations.HaveMetadata, StringComparison.InvariantCultureIgnoreCase))
                    {
                        throw Utility.Utils.getCustomException("DF_WITH_ASSOCIATED_METADATA",
                            @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - The dataflow has an associated metadata and cannot be deleted.", Infrastructure.STLogging.Interface.LogLevelEnum.Warn);
                    }
                }
            }
            else if (artefactType == SdmxStructureEnumType.MetadataFlow)
            { //controls if the Dataflow has DDBDataflow annotations

                IEnumerator<IMetadataFlow> enumer = objs.Metadataflows.GetEnumerator();
                enumer.MoveNext();
                IMetadataFlowMutableObject df = enumer.Current.MutableInstance;

                foreach (IAnnotationMutableObject ann in df.Annotations)
                {
                    if (ann.Type != null && ann.Type.Equals(_nodeConfig.Annotations.Metadataset, StringComparison.InvariantCultureIgnoreCase))
                    {
                        throw Utility.Utils.getCustomException("METADATAFLOW_WITH_ASSOCIATED_METADATASET",
                            @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - The metadataFlow has an associated metadataset and cannot be deleted.", Infrastructure.STLogging.Interface.LogLevelEnum.Warn);
                    }
                }
            }
            else if (artefactType == SdmxStructureEnumType.CategoryScheme)
            { //controls if the CategoryScheme have categorization
                if (objs.Categorisations.Count > 0)
                {
                    throw Utility.Utils.getCustomException("CATEGORYSCHEME_WITH_CATEGORIZATION",
                            @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - The CategoryScheme has an associated Categorisations and cannot be deleted.", Infrastructure.STLogging.Interface.LogLevelEnum.Warn);
                }
            }

            //use DeleteArtefact for filter by agency
            return JsonConvert.SerializeObject(Sdmx21Connector.DeleteArtefactWithoutFilter(objs));
        }

        /// <summary>
        /// Deletes a DDB Dataflow: corrispondent dataflow in MSDB is also deleted.
        /// </summary>
        /// <param name="id">The id of the DDBDataflow.</param>
        /// <param name="deleted">whether the ddb has been deleted or not.</param>
        /// <returns></returns>
        public string DeleteDDBDataflow(int id, ref bool deleted)
        {
            ISdmxObjects allObjs = null;
            ISdmxObjects delObjs = new SdmxObjectsImpl();
            ISdmxObjects catObjs = new SdmxObjectsImpl();
            DDBDataflowWithCols df = null;

            //removing DDB Dataflow from Production
            _logger.Log("Removing dataflow from production", Infrastructure.STLogging.Interface.LogLevelEnum.Info);
            dfProd.RemoveMappingSet(id);

            try
            {
                try
                {
                    df = JsonConvert.DeserializeObject<DDBDataflowWithCols>(DmApiConnector.GetDDBDataflow(id));
                    allObjs = Sdmx21Connector.GetArtefacts(SdmxStructureEnumType.Dataflow, df.ID, df.Agency, df.Version, StructureReferenceDetailEnumType.Parents);

                    //ricavo l'unico dataflow
                    IEnumerator<IDataflowObject> enumer = allObjs.Dataflows.GetEnumerator();
                    enumer.MoveNext();
                    IDataflowObject msdbDf = enumer.Current;
                    delObjs.AddDataflow(msdbDf);

                    delObjs = GetDfWithCustomDsd(df, msdbDf);
                }
                catch (Exception)
                {
                    //caso df non trovati
                    if (df != null)
                    {
                        _logger.Log("Rollback: deleting dataflow on DDB", Infrastructure.STLogging.Interface.LogLevelEnum.Info);
                        DmApiConnector.DeleteDDBDataflow(id);
                    }
                    if (delObjs.Dataflows != null && delObjs.Dataflows.Count > 0)
                    {
                        _logger.Log("Rollback: deleting dataflow on MSDB", Infrastructure.STLogging.Interface.LogLevelEnum.Info);
                        Sdmx21Connector.DeleteArtefact(delObjs);
                    }
                    return JsonConvert.SerializeObject(true);
                }

                //deleting categorisations if exist
                if (allObjs.Categorisations.Count > 0)
                {
                    IEnumerator<ICategorisationObject> enumer2 = allObjs.Categorisations.GetEnumerator();
                    while (enumer2.MoveNext())
                    {
                        catObjs.AddCategorisation(enumer2.Current);
                    }
                    _logger.Log("Deleting categorisations", Infrastructure.STLogging.Interface.LogLevelEnum.Info);
                    Sdmx21Connector.DeleteArtefact(catObjs);
                }

                //deleting header if exists
                HeaderTemplate ht = JsonConvert.DeserializeObject<HeaderTemplate>(GetDfHeader(df.ID, df.Agency, df.Version));

                if (ht != null)
                    MaApiConnector.DeleteEntity("header_template", int.Parse(ht.entityId));

                _logger.Log("Deleting dataflow on DDB", Infrastructure.STLogging.Interface.LogLevelEnum.Info);
                DmApiConnector.DeleteDDBDataflow(id);
                deleted = true;

                _logger.Log("Deleting dataflow (eventually with Custom Annotation) on MSDB", Infrastructure.STLogging.Interface.LogLevelEnum.Info);
                Sdmx21Connector.DeleteArtefact(delObjs);

                return JsonConvert.SerializeObject(true);
            }
            catch (Exception ex)
            {
                throw Utility.Utils.getCustomException("DF_DELETE_ERROR",
                   @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - " + ex.Message, Infrastructure.STLogging.Interface.LogLevelEnum.Error);
            }
        }

        public string DeleteMAEntity(string type, int id)
        {
            return MaApiConnector.DeleteEntity(type, id);
        }

        #endregion

        #region UTILITY

        public string UploadFileOnServer(int? cubeId, IFormFile file)
        {
            return DmApiConnector.UploadFileOnServer(cubeId, file);
        }

        /// <summary>
        /// Upload file on DM API 
        /// </summary>
        /// <param name="file"></param>
        /// <param name="allowedFormat"></param>
        /// <returns>Path of file</returns>
        public string UploadReferenceMetadataFileOnServer(IFormFile file)
        {
            return DmApiConnector.UploadReferenceMetadataFileOnServer(file);
        }

        public Stream ReferenceMetadataFileOnServer(string filename)
        {
            return DmApiConnector.ReferenceMetadataFileOnServer(filename);
        }

        /// <summary>
        /// Upload file on NodeAPI 
        /// </summary>
        /// <param name="file"></param>
        /// <param name="allowedFormat"></param>
        /// <returns>Path of file</returns>
        public string UploadFileOnNodeApi(IFormFile file, List<string> allowedFormat, string subDir)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            byte[] data;
            using (var br = new BinaryReader(file.OpenReadStream()))
            {
                data = br.ReadBytes((int)file.OpenReadStream().Length);
            }

            if (!Directory.Exists("Upload"))
            {
                Directory.CreateDirectory("Upload");
            }
            var pathUpload = $"Upload";
            if (!string.IsNullOrWhiteSpace(subDir))
            {
                pathUpload = $"{pathUpload}/{subDir}";
            }
            _logger.Log($"BusinessLogic UploadFileOnNodeApi pathUpload {pathUpload}", Infrastructure.STLogging.Interface.LogLevelEnum.Debug);
            if (!Directory.Exists(pathUpload))
            {
                Directory.CreateDirectory(pathUpload);
            }

            var fullPath = $"{pathUpload}/{Path.GetFileName(file.FileName)}";
            var fileNameOnly = Path.GetFileNameWithoutExtension(fullPath);
            var extension = Path.GetExtension(fullPath);

            if (!allowedFormat.Contains(extension.ToLower()))
            {
                throw Utility.Utils.getCustomException("FILE_UPLOAD_FORMAT",
                   @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - Impossible upload file " + extension + " to server.", Infrastructure.STLogging.Interface.LogLevelEnum.Error);
            }

            var path = Path.GetDirectoryName(fullPath);
            var newFullPath = fullPath;
            int count = 1;
            while (File.Exists(newFullPath))
            {
                string tempFileName = $"{fileNameOnly}({count++})";
                newFullPath = Path.Combine(path, tempFileName + extension);
            }
            _logger.Log($"BusinessLogic UploadFileOnNodeApi upload file on {newFullPath}", Infrastructure.STLogging.Interface.LogLevelEnum.Info);
            File.WriteAllBytes(newFullPath, data);

            //Delete old file
            if (subDir.Equals(_configuration["UPLOAD_IMPORT_STRUCTURE"], StringComparison.InvariantCultureIgnoreCase))
            {
                string[] files = Directory.GetFiles(pathUpload);
                foreach (string oldFile in files)
                {
                    var fi = new FileInfo(oldFile);
                    if (fi.LastAccessTime < DateTime.Now.AddDays(-3))
                    {
                        fi.Delete();
                    }
                }
            }

            return newFullPath;
        }

        public string GetCSVHeader(char separator, char? delimiter, bool hasHeader, string filePath)
        {
            return DmApiConnector.GetCSVHeader(separator, delimiter, hasHeader, filePath);
        }

        public string GetCSVTablePreview(OptionsTable optionsTable, char separator, char? delimiter, bool hasHeader, string filePath, string tid, int idMappingSpecialTimePeriod, string guidSession)
        {
            return DmApiConnector.GetCSVTablePreview(optionsTable, separator, delimiter, hasHeader, filePath, tid, idMappingSpecialTimePeriod, guidSession);
        }

        public string GetCSVTableColumnPreview(OptionsTable optionsTable, char separator, char? delimiter, bool hasHeader, string filePath, int idMappingSpecialTimePeriod, string guidSession)
        {
            return DmApiConnector.GetCSVTableColumnPreview(optionsTable, separator, delimiter, hasHeader, filePath, idMappingSpecialTimePeriod, guidSession);
        }

        public string ImportCSVData(char separator, char? delimiter, bool hasHeader, string importType, int idCube, int idMapping, string filePath, string tid, bool refreshProdDf, int idMappingSpecialTimePeriod, bool embargo, bool ignoreCuncurrentUpload, bool checkFiltAttributes, string guidSession)
        {
            //create a table with all values of the codes allowed for the primary measure if it is coded
            createCodedObsValueTable(idCube);

            string res = DmApiConnector.ImportCSVData(separator, delimiter, hasHeader, importType, idCube, idMapping, filePath, tid, idMappingSpecialTimePeriod, embargo, ignoreCuncurrentUpload, checkFiltAttributes, guidSession);

            if (refreshProdDf)
            {
                RefreshProductionDataflows(idCube);
            }
            return res;
        }

        /// <summary>
        /// Create a table TEMP_{idCube}_OBS_VALUE with all values of the codes allowed for the primary measure if it is coded
        /// </summary>
        /// <param name="idCube"></param>
        private void createCodedObsValueTable(int idCube)
        {
            string cube = DmApiConnector.GetCube(idCube);
            dynamic cubeObj = JObject.Parse(cube);
            string dsdCube = cubeObj.DSDCode;
            var dsdKey = dsdCube.Split('+');
            var dsdID = dsdKey[0];
            var dsdAgency = dsdKey[1];
            var dsdVersion = dsdKey[2];
            var sdmxObject = Sdmx21Connector.GetArtefacts(SdmxStructureEnumType.Dsd, dsdID, dsdAgency, dsdVersion);

            IRepresentation refRep = sdmxObject.DataStructures.First().PrimaryMeasure.Representation;

            if (refRep != null && refRep.Representation != null)
            {
                IMaintainableRefObject refObj = refRep.Representation.MaintainableReference;
                sdmxObject = Sdmx21Connector.GetArtefacts(SdmxStructureEnumType.CodeList, refObj.MaintainableId, refObj.AgencyId, refObj.Version);
                List<ICode> items = (List<ICode>)sdmxObject.Codelists.First().Items;
                DmApiConnector.CreateTempTableForUniqueValues($"TEMP_{idCube}_OBS_VALUE", items.Select(x => x.Id).ToList());
            }
        }

        private void RefreshProductionDataflows(int idCube)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            //Get all dataflows
            List<DDBDataflow> dfs = JsonConvert.DeserializeObject<List<DDBDataflow>>(DmApiConnector.GetDDBDataflow(null));

            //Regenerate CC and transcodings for dataflows built on the cube that already have them
            foreach (DDBDataflow df in dfs)
            {
                if (df.IDCube == idCube)
                {
                    if (df.HasTranscoding)
                    {
                        bool cc = df.HasContentConstraints;
                        try
                        {
                            RemoveTranscodingsForDataflow(df.IDDataflow);
                            CreateTranscodingsForDataflow(df.IDDataflow);

                            if (cc)
                            {
                                CreateContentConstraintsForDataflow(df.IDDataflow);
                            }
                        }
                        catch (Exception ex)
                        {
                            _logger.Log($"Error while recreating content constraints and transcodings for dataflow {df.IDDataflow}: {ex.Message} {ex.StackTrace}", Infrastructure.STLogging.Interface.LogLevelEnum.Warn);
                        }
                    }
                }
            }

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);
        }

        public string GetTablePreview(string tableName, OptionsTable optionsTable)
        {
            return DmApiConnector.GetTablePreview(tableName, optionsTable);
        }

        public string GetTableColumnPreview(string tablename, OptionsTable optionsTable)
        {
            return DmApiConnector.GetTableColumnPreview(tablename, optionsTable);
        }

        public string GetDDBDataflowPreview(DDBDataflow ddbDataflow, bool partialIgnoreCheckFilter)
        {
            return DmApiConnector.GetDDBDataflowPreview(ddbDataflow, partialIgnoreCheckFilter);
        }

        public CheckCodeListResult CheckCodelistToBeSynchronizedFromDsd(List<ArtefactIdentity> artefactIdentity)
        {
            var dsdToCheck = new Dictionary<string, List<ICodelistObject>>();

            if (artefactIdentity != null && artefactIdentity.Count > 0)
            { //Take specific DSD
                foreach (var itemDsd in artefactIdentity)
                {
                    createCodelistsCheckToBeSynchronized(dsdToCheck, itemDsd);
                }
            }
            else
            { //Take all DSD
                var tmpObj = Sdmx21Connector.GetArtefacts(SdmxStructureEnumType.Dsd, null, null, null);
                if (tmpObj == null)
                {
                    return new CheckCodeListResult();
                }
                foreach (var itemDsd in tmpObj.DataStructures)
                {
                    createCodelistsCheckToBeSynchronized(dsdToCheck, new ArtefactIdentity { ID = itemDsd.Id, Agency = itemDsd.AgencyId, Version = itemDsd.Version });
                }
            }
            if (dsdToCheck.Keys.Count <= 0)
            {
                return new CheckCodeListResult();
            }


            var listDsdToCheck = new List<string>();
            foreach (var item in dsdToCheck)
            {
                listDsdToCheck.Add(item.Key);
            }

            //Take all items CodeList inside of DDB
            var ddbItemsCodeList = DmApiConnector.GetItemsCodelistFromDsd(listDsdToCheck);

            var checkCodeListResult = new CheckCodeListResult();

            //Find and save in List, all items that are in MSDB but not fidn in DDB
            foreach (var dsd in dsdToCheck)
            {
                var objDsd = new DSD();
                var dsdKey = dsd.Key.Split('+');
                objDsd.Agency = dsdKey[0];
                objDsd.ID = dsdKey[1];
                objDsd.Version = dsdKey[2];

                foreach (var msdbCodeList in dsd.Value)
                {
                    var codeListKey = $"{msdbCodeList.Id}+{msdbCodeList.AgencyId}+{msdbCodeList.Version}";
                    var key = $"{dsd.Key}|{codeListKey}";
                    if (!ddbItemsCodeList.ContainsKey(key))
                    {
                        continue; //It can't happen
                    }
                    foreach (var msdbItem in msdbCodeList.Items)
                    {
                        var findItem = false;
                        if (ddbItemsCodeList[key].Contains(msdbItem.Id))
                        {
                            findItem = true;
                        }
                        if (!findItem)
                        { //item not find in DDB
                            if (!objDsd.CodeList.ContainsKey(codeListKey))
                            {
                                objDsd.CodeList.Add(codeListKey, new List<string>());
                            }
                            objDsd.CodeList[codeListKey].Add(msdbItem.Id);
                        }
                    }
                }
                checkCodeListResult.DSD.Add(objDsd);
            }

            return checkCodeListResult;
        }

        public void SyncCodeList(List<ArtefactIdentity> artefactIdentity)
        {
            var itemsCodeListToSync = new Dictionary<string, List<string>>();

            //Take all items CodeList inside of DDB
            var ddbItemsCodeList = DmApiConnector.GetItemsFromCodeList(artefactIdentity);

            ISdmxObjects updObjs = new SdmxObjectsImpl();

            foreach (var codeList in artefactIdentity)
            {
                var tmpObj = Sdmx21Connector.GetArtefacts(SdmxStructureEnumType.CodeList, codeList.ID, codeList.Agency, codeList.Version);
                if (tmpObj == null)
                {
                    continue;
                }
                var msdbCodeList = tmpObj.Codelists.FirstOrDefault();
                if (msdbCodeList == null || msdbCodeList.IsFinal == null || !msdbCodeList.IsFinal.IsTrue)
                {
                    continue;
                }

                var key = $"{msdbCodeList.Id}+{msdbCodeList.AgencyId}+{msdbCodeList.Version}";
                if (!ddbItemsCodeList.ContainsKey(key))
                {
                    continue; //Happen only when MSDB have multiple reference with DDB (in this case don't remove CHANGED)
                }
                foreach (var msdbItem in msdbCodeList.Items)
                {
                    var findItem = false;
                    if (ddbItemsCodeList[key].Contains(msdbItem.Id))
                    {
                        findItem = true;
                    }
                    if (!findItem)
                    { //item not find in DDB
                        if (!itemsCodeListToSync.ContainsKey(key))
                        {
                            itemsCodeListToSync.Add(key, new List<string>());

                            var codeListUpd = msdbCodeList.MutableInstance;
                            var changed = codeListUpd.Annotations.FirstOrDefault(annotation => annotation.Type != null && annotation.Type.Equals(_nodeConfig.Annotations.Changed, StringComparison.InvariantCultureIgnoreCase));
                            if (changed != null)
                            {
                                codeListUpd.Annotations.Remove(changed);
                            }
                            updObjs.AddCodelist(codeListUpd.ImmutableInstance);
                        }
                        itemsCodeListToSync[key].Add(msdbItem.Id);
                    }
                }
            }

            //Insert into DDB all items missing from MSDB
            if (itemsCodeListToSync.Count > 0)
            {
                DmApiConnector.SyncCodeList(itemsCodeListToSync);
            }


            //Remove annotation CHANGED after sync
            if (updObjs.Codelists.Count > 0)
            {
                Sdmx21Connector.UpdateArtefacts(updObjs, true, false, false);
            }
        }

        private void createCodelistsCheckToBeSynchronized(Dictionary<string, List<ICodelistObject>> dsdToCheck, ArtefactIdentity dsd)
        {
            var tmpObj = Sdmx21Connector.GetArtefacts(SdmxStructureEnumType.Dsd, dsd.ID, dsd.Agency, dsd.Version, StructureReferenceDetailEnumType.Children);
            if (tmpObj == null)
            {
                return;
            }
            foreach (var itemCodeList in tmpObj.Codelists)
            {
                var key = $"{dsd.ID}+{dsd.Agency}+{dsd.Version}";
                if (!dsdToCheck.ContainsKey(key))
                {
                    dsdToCheck.Add(key, new List<ICodelistObject>());
                }
                dsdToCheck[key].Add(itemCodeList);
            }
        }

        public List<CodeLisSyncDTO> GetAllCodelistToBeSynchronized()
        {
            var codeToSync = new List<ArtefactIdentity>();
            var msdbCodeList = Sdmx21Connector.GetArtefacts(SdmxStructureEnumType.CodeList, null, null, null);
            foreach (var itemCodeList in msdbCodeList.Codelists)
            {
                if (itemCodeList.IsFinal == null || !itemCodeList.IsFinal.IsTrue || itemCodeList.Annotations == null || itemCodeList.Annotations.Count <= 0)
                {
                    continue;
                }
                var changed = itemCodeList.Annotations.Any(item => item.Type != null && item.Type.Equals(_nodeConfig.Annotations.Changed, StringComparison.InvariantCultureIgnoreCase));
                if (!changed)
                {
                    continue;
                }

                codeToSync.Add(new ArtefactIdentity { Agency = itemCodeList.AgencyId, ID = itemCodeList.Id, Version = itemCodeList.Version, EnumType = SdmxStructureEnumType.CodeList });
            }

            //Take all items CodeList inside of DDB
            var ddbItemsCodeList = DmApiConnector.GetItemsCodelists(codeToSync);


            //Find and save in List, all items that are in MSDB but not fidn in DDB
            ISdmxObjects updObjs = new SdmxObjectsImpl();
            var codeToBeSync = new List<CodeLisSyncDTO>();
            foreach (var codeList in codeToSync)
            {
                var key = $"{codeList.ID}+{codeList.Agency}+{codeList.Version}";
                var msdbItemsCodeList = Sdmx21Connector.GetArtefacts(SdmxStructureEnumType.CodeList, codeList.ID, codeList.Agency, codeList.Version);
                if (!ddbItemsCodeList.ContainsKey(key))
                {
                    continue; //It can't happen
                }
                var countItemToSync = 0;
                foreach (var msdbItem in msdbItemsCodeList.Codelists.First().Items)
                {
                    var findItem = false;
                    if (ddbItemsCodeList[key].Contains(msdbItem.Id))
                    {
                        findItem = true;
                    }
                    if (!findItem)
                    { //item not find in DDB
                        countItemToSync++;
                    }
                }
                if (countItemToSync > 0)
                {
                    codeToBeSync.Add(new CodeLisSyncDTO { ID = codeList.ID, Agency = codeList.Agency, Version = codeList.Version, ItemsToSync = countItemToSync });
                }
                else
                { //Remove CHANGED for codelist with 0 Items to Sync
                    var codeListUpd = msdbItemsCodeList.Codelists.First().MutableInstance;
                    var changed = codeListUpd.Annotations.FirstOrDefault(annotation => annotation.Type != null && annotation.Type.Equals(_nodeConfig.Annotations.Changed, StringComparison.InvariantCultureIgnoreCase));
                    if (changed != null)
                    {
                        codeListUpd.Annotations.Remove(changed);
                    }
                    updObjs.AddCodelist(codeListUpd.ImmutableInstance);
                }
            }

            //Remove annotation CHANGED after sync
            if (updObjs.Codelists.Count > 0)
            {
                Sdmx21Connector.UpdateArtefacts(updObjs, true, false, false);
            }

            return codeToBeSync;
        }



        public async Task<string> DownloadDDBDataflowCsv(DDBDataflow ddbDataflow, bool partialIgnoreCheckFilter, bool zipped, char separator, char? delimiter)
        {
            var result = await DmApiConnector.DownloadDDBDataflowCsvAsync(ddbDataflow, partialIgnoreCheckFilter, separator, delimiter);

            FileInfo infoSize = new FileInfo(result);
            if (infoSize.Length >= 1073741824) //1Gb
            {
                zipped = true;
            }
            if (zipped)
            {
                string fileToWriteTo = Path.GetTempFileName();
                File.Delete(fileToWriteTo);
                fileToWriteTo += ".SH.download.zip";
                using (ZipArchive zip = ZipFile.Open(fileToWriteTo, ZipArchiveMode.Create))
                {
                    zip.CreateEntryFromFile(result, $"Cube{ddbDataflow.IDCube}.csv");
                }
                File.Delete(result);
                _logger.Log($"DownloadDDBDataflowCsv create zip {fileToWriteTo}", Infrastructure.STLogging.Interface.LogLevelEnum.Debug);
                return fileToWriteTo;
            }

            return result;
        }

        public string GetSDMXMLTablePreview(string dsdId, string dsdAgencyId, string dsdVersion, OptionsTable optionsTable, string filePath)
        {
            var dsd = Sdmx21Connector.GetArtefacts(SdmxStructureEnumType.Dsd, dsdId, dsdAgencyId, dsdVersion);

            string dataflowName = DmApiConnector.GetDataflowFromSDMXMLData(filePath);
            if (!string.IsNullOrWhiteSpace(dataflowName))
            {
                var values = dataflowName.Split("+");
                if (values.Length == 3)
                {
                    var dataflow = Sdmx21Connector.GetArtefacts(SdmxStructureEnumType.Dataflow, values[1], values[0], values[2]);
                    dsd.Merge(dataflow);
                }
            }

            return DmApiConnector.GetSDMXMLTablePreview(
                GetSdmxMlFromSdmxObjects(dsd),
                dsdAgencyId,
                optionsTable,
                filePath
            );
        }

        public string GetDataflowColumnPreview(DDBDataflowWithCols df, string colName, int pageNum, int pageSize)
        {
            string res = DmApiConnector.GetDataflowColumnPreview(
                JsonConvert.SerializeObject(df),
                colName,
                pageNum,
                pageSize,
                true
            );

            return res;
        }

        public string ImportSDMXMLData(string importType, string cubeId, string dsdId, string dsdAgencyId, string dsdVersion, string filePath, string tid, bool refreshProdDf, bool embargo, bool ignoreCuncurrentUpload, bool checkFiltAttributes)
        {
            //create a table with all values of the codes allowed for the primary measure if it is coded
            createCodedObsValueTable(int.Parse(cubeId));

            var dsd = Sdmx21Connector.GetArtefacts(SdmxStructureEnumType.Dsd, dsdId, dsdAgencyId, dsdVersion);

            string dataflowName = DmApiConnector.GetDataflowFromSDMXMLData(filePath);
            if (!string.IsNullOrWhiteSpace(dataflowName))
            {
                var values = dataflowName.Split("+");
                if (values.Length == 3)
                {
                    var dataflow = Sdmx21Connector.GetArtefacts(SdmxStructureEnumType.Dataflow, values[1], values[0], values[2]);
                    dsd.Merge(dataflow);
                }
            }


            string res = DmApiConnector.ImportSDMXMLData(
                importType,
                cubeId,
                GetSdmxMlFromSdmxObjects(dsd),
                dsdAgencyId,
                filePath,
                tid,
                embargo,
                ignoreCuncurrentUpload,
                checkFiltAttributes
            );

            if (refreshProdDf)
            {
                RefreshProductionDataflows(int.Parse(cubeId));
            }

            return res;
        }

        public string DisembargoCube(int idCube)
        {
            string res = DmApiConnector.DisembargoCube(idCube);

            //I regenerate CC and transcoding for dataflows having them
            RefreshProductionDataflows(idCube);

            return res;
        }

        public string EmptyCube(int idCube)
        {
            return DmApiConnector.EmptyCube(idCube);
        }

        public string ImportDCS(string id, string agencyId, string version)
        {
            return DmApiConnector.ImportDCS(GetSdmxStructure(SdmxStructureEnumType.CategoryScheme, id, agencyId, version), agencyId);
        }

        /// <summary>
        /// Call DMApi to sync all itms in AuthDB (Category, Agency, Cube)
        /// </summary>
        /// <param name=""></param>
        /// <returns></returns>
        public void SynchronizeAuthDB()
        {
            var allAgency = new List<string>();
            //var listAgency = Sdmx21Connector.GetArtefacts(SdmxStructureEnumType.Agency, null, null, null);
            //if (listAgency == null || listAgency.Agencies.Count == 0)
            //{
            //    allAgency = _nodeConfig.Agencies.Select(item => item.Id).ToList();
            //    if (allAgency == null || allAgency.Count == 0)
            //    {
            //        allAgency = appConfig.Agencies.Select(item => item.Id).ToList();
            //    }
            //}
            //else
            //{
            //    foreach (var item in listAgency.Agencies)
            //    {
            //        if (!allAgency.Contains(item.Id))
            //        {
            //            allAgency.Add(item.Id);
            //        }
            //    }
            //}

            allAgency = _nodeConfig.Agencies.Select(item => item.Id).Distinct().ToList();
            if (allAgency == null || allAgency.Count == 0)
            {
                allAgency = appConfig.Agencies.Select(item => item.Id).ToList();
            }

            var objDataflows = Sdmx21Connector.GetArtefacts(SdmxStructureEnumType.Dataflow, null, null, null, StructureReferenceDetailEnumType.None, "Stub");
            var allDataflow = new List<string>();
            foreach (var item in objDataflows.Dataflows)
            {
                allDataflow.Add($"{item.Id}+{item.AgencyId}+{item.Version}");
            }
            var objMetadataFlows = Sdmx21Connector.GetArtefacts(SdmxStructureEnumType.MetadataFlow, null, null, null, StructureReferenceDetailEnumType.None, "Stub");
            var allMetadataFlows = new List<string>();
            foreach (var item in objMetadataFlows.Metadataflows)
            {
                allMetadataFlows.Add($"{item.Id}+{item.AgencyId}+{item.Version}");
            }
            DmApiConnector.SynchronizeAuthDB(allAgency, allDataflow, allMetadataFlows);
        }

        /// <summary>
        /// Call DMApi to sync all itms in AuthDB (Category, Agency, Cube)
        /// </summary>
        /// <param name=""></param>
        /// <returns></returns>
        public Dictionary<string, Dictionary<string, string>> AgencyName()
        {
            var result = new Dictionary<string, Dictionary<string, string>>();
            var listAgency = Sdmx21Connector.GetArtefacts(SdmxStructureEnumType.Agency, null, null, null);

            //if (listAgency != null && listAgency.Agencies != null && listAgency.Agencies.Count > 0)
            //{
            //    foreach (var itemAg in listAgency.Agencies)
            //    {
            //        if (!result.ContainsKey(itemAg.Id))
            //        {
            //            result.Add(itemAg.Id, new Dictionary<string, string>());
            //            foreach (var item in itemAg.Names)
            //            {
            //                result[itemAg.Id].Add(item.Locale, item.Value);
            //            }
            //        }
            //    }
            //}
            //else
            //{
            foreach (var itemAg in _nodeConfig.Agencies)
            {
                if (!result.ContainsKey(itemAg.Id))
                {
                    result.Add(itemAg.Id, new Dictionary<string, string>());
                    result[itemAg.Id] = itemAg.Name;
                }
            }
            if (result.Count <= 0)
            {
                foreach (var itemAg in appConfig.Agencies)
                {
                    if (!result.ContainsKey(itemAg.Id))
                    {
                        result.Add(itemAg.Id, new Dictionary<string, string>());
                        result[itemAg.Id] = itemAg.Name;
                    }
                }
            }
            //}


            return result;
        }

        public bool DDBReset()
        {
            string DDBConnectionString = GetEncodedConnectionString();

            //Resets the DDB to its original state
            DmApiConnector.DDBReset();

            //removing dataflows with DDBDataflow annotation
            ISdmxObjects delDf = new SdmxObjectsImpl();
            ISdmxObjects delObjs = new SdmxObjectsImpl();
            ISdmxObjects dfs = Sdmx21Connector.GetArtefacts(SdmxStructureEnumType.Dataflow, null, null, null);

            if (dfs.HasDataflows)
            {
                foreach (IDataflowObject df in dfs.Dataflows)
                {
                    delObjs = new SdmxObjectsImpl();
                    foreach (var ann in df.Annotations)
                    {
                        if (ann.Type == _nodeConfig.Annotations.DDBDataflow && ann.Title.ToLower() == DDBConnectionString.ToLower())
                        {
                            ISdmxObjects cats = Sdmx21Connector.GetArtefacts(SdmxStructureEnumType.Dataflow, df.Id, df.AgencyId, df.Version, StructureReferenceDetailEnumType.Parents);

                            //deleting categorisations for the dataflows if exist
                            if (cats.Categorisations.Count > 0)
                            {
                                IEnumerator<ICategorisationObject> enumer = cats.Categorisations.GetEnumerator();
                                while (enumer.MoveNext())
                                {
                                    delObjs.AddCategorisation(enumer.Current);
                                }
                                _logger.Log("Deleting categorisations", Infrastructure.STLogging.Interface.LogLevelEnum.Info);

                                try
                                {
                                    if (delObjs.HasCategorisations)
                                        Sdmx21Connector.DeleteArtefact(delObjs);
                                }
                                catch (Exception ex)
                                {
                                    _logger.Log($"Error while removing DDBDataflow's categorisations: {ex.StackTrace}", Infrastructure.STLogging.Interface.LogLevelEnum.Error);
                                }
                            }

                            //deleting content constraints for the dataflows if exist
                            delObjs = new SdmxObjectsImpl();
                            if (cats.ContentConstraintObjects.Count > 0)
                            {
                                IEnumerator<IContentConstraintObject> enumer = cats.ContentConstraintObjects.GetEnumerator();
                                while (enumer.MoveNext())
                                {
                                    delObjs.AddContentConstraintObject(enumer.Current);
                                }
                                _logger.Log("Deleting content constraints", Infrastructure.STLogging.Interface.LogLevelEnum.Info);

                                try
                                {
                                    if (delObjs.HasContentConstraintBeans)
                                        Sdmx21Connector.DeleteArtefact(delObjs);
                                }
                                catch (Exception ex)
                                {
                                    _logger.Log($"Error while removing DDBDataflow's content constraints: {ex.StackTrace}", Infrastructure.STLogging.Interface.LogLevelEnum.Error);
                                }
                            }

                            //deleting Mapping Set
                            var temp = MaApiConnector.GetEntity("mappingset", null);
                            if (temp != null)
                            {
                                MappingSet[] list = JsonConvert.DeserializeObject<MappingSet[]>(temp);
                                string msId = list.Where(m => m.parentId == $"urn:sdmx:org.sdmx.infomodel.datastructure.Dataflow={df.AgencyId}:{df.Id}({df.Version})").Select(x => x.entityId).SingleOrDefault();
                                if (msId != null)
                                    MaApiConnector.DeleteEntity("mappingset", int.Parse(msId));
                            }

                            delDf.AddDataflow(df);
                        }
                    }
                }
                try
                {
                    if (delDf.HasDataflows)
                        Sdmx21Connector.DeleteArtefact(delDf);
                }
                catch (Exception ex)
                {
                    _logger.Log($"Error while removing DDBDataflow Annotation: {ex.StackTrace}", Infrastructure.STLogging.Interface.LogLevelEnum.Error);
                }
            }

            //cleaning DSD: removing AssociatedCube Annotation and deleting DSD with CustomDSD annotation
            ISdmxObjects updDsd = new SdmxObjectsImpl();
            ISdmxObjects delDsd = new SdmxObjectsImpl();

            ISdmxObjects dsds = Sdmx21Connector.GetArtefacts(SdmxStructureEnumType.Dsd, null, null, null);

            if (dsds.HasDataStructures)
            {
                foreach (IDataStructureObject dsd in dsds.DataStructures)
                {
                    IDataStructureMutableObject dsdMut = dsd.MutableInstance;

                    for (int i = 0; i < dsdMut.Annotations.Count; i++)
                    {
                        var ann = dsdMut.Annotations[i];
                        if (ann.Type == _nodeConfig.Annotations.CustomDSD && ann.Title == DDBConnectionString)
                        {
                            delDsd.AddDataStructure(dsd);
                        }
                        else if (ann.Type == _nodeConfig.Annotations.AssociatedCube && ann.Title == DDBConnectionString)
                        {
                            dsdMut.Annotations.Remove(ann);
                            updDsd.AddDataStructure(dsdMut.ImmutableInstance);
                            //modifying counter for checking next anntoation (since the current has been removed)
                            i--;
                        }
                    }
                }
                try
                {
                    if (updDsd.HasDataStructures)
                        Sdmx21Connector.UpdateArtefacts(updDsd);
                }
                catch (Exception ex)
                {
                    _logger.Log($"Error while removing AssociatedCube Annotation: {ex.StackTrace}", Infrastructure.STLogging.Interface.LogLevelEnum.Error);
                }
                try
                {
                    if (delDsd.HasDataStructures)
                        Sdmx21Connector.DeleteArtefact(delDsd);
                }
                catch (Exception ex)
                {
                    _logger.Log($"Error while removing CustomDSD Annotation: {ex.StackTrace}", Infrastructure.STLogging.Interface.LogLevelEnum.Error);
                }
            }

            //removing CHANGED annotation
            ISdmxObjects updCl = new SdmxObjectsImpl();
            ISdmxObjects cls = Sdmx21Connector.GetArtefacts(SdmxStructureEnumType.CodeList, null, null, null);

            if (cls.HasCodelists)
            {
                foreach (ICodelistObject cl in cls.Codelists)
                {
                    ICodelistMutableObject clMut = cl.MutableInstance;

                    foreach (var ann in clMut.Annotations)
                    {
                        if (ann.Type == _nodeConfig.Annotations.Changed && ann.Title == DDBConnectionString)
                        {
                            clMut.Annotations.Remove(ann);
                            updCl.AddCodelist(clMut.ImmutableInstance);
                            break;
                        }
                    }
                }
                try
                {
                    if (updCl.HasCodelists)
                        Sdmx21Connector.UpdateArtefacts(updCl, false, true, false);
                }
                catch (Exception ex)
                {
                    _logger.Log($"Error while removing CHANGED Annotation: {ex.StackTrace}", Infrastructure.STLogging.Interface.LogLevelEnum.Error);
                }
            }

            return true;
        }

        public DsdReport GenerateReportDSD(ArtefactCompare sourceDsd, ArtefactCompare targetDsd, bool includeCodelist, bool callCompare)
        {
            IDataStructureObject srcDsd = null;
            IDataStructureObject trgDsd = null;
            ISdmxObjects sourceObj = null;
            ISdmxObjects targetObj = null;

            var dsdReport = new DsdReport();

            if (sourceDsd.StreamType == StreamType.Xml)
            {
                dsdReport.SourceFile = Utils.Encrypt(sourceDsd.FilePath, "ITEMCOMPARE");
                sourceObj = Sdmx21Connector.GetSdmxObjectsFromFileXML(sourceDsd.FilePath);
                srcDsd = sourceObj.DataStructures.FirstOrDefault();
            }
            else
            {
                var sourceDsdObj = Sdmx21Connector.GetArtefacts(SdmxStructureEnumType.Dsd, sourceDsd.ID, sourceDsd.Agency, sourceDsd.Version);
                srcDsd = sourceDsdObj.DataStructures.FirstOrDefault();
                if (srcDsd != null)
                {
                    sourceObj = Sdmx21Connector.GetArtefacts(SdmxStructureEnumType.Dsd, sourceDsd.ID, sourceDsd.Agency, sourceDsd.Version, StructureReferenceDetailEnumType.Children, "Stub");
                }
            }

            if (targetDsd.StreamType == StreamType.Xml)
            {
                dsdReport.TargetFile = Utils.Encrypt(targetDsd.FilePath, "ITEMCOMPARE");
                targetObj = Sdmx21Connector.GetSdmxObjectsFromFileXML(targetDsd.FilePath);
                trgDsd = targetObj.DataStructures.FirstOrDefault();
            }
            else
            {
                var targetDsdObj = Sdmx21Connector.GetArtefacts(SdmxStructureEnumType.Dsd, targetDsd.ID, targetDsd.Agency, targetDsd.Version);
                trgDsd = targetDsdObj.DataStructures.FirstOrDefault();
                if (trgDsd != null)
                {
                    targetObj = Sdmx21Connector.GetArtefacts(SdmxStructureEnumType.Dsd, targetDsd.ID, targetDsd.Agency, targetDsd.Version, StructureReferenceDetailEnumType.Children, "Stub");
                }
            }

            if (srcDsd == null)
            {
                throw Utils.getCustomException("GENERATEREPORTDSD_SOURCENOTFOUND",
                   @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + $" - not found", Infrastructure.STLogging.Interface.LogLevelEnum.Error);
            }
            if (trgDsd == null)
            {
                throw Utils.getCustomException("GENERATEREPORTDSD_TARGETNOTFOUND",
                   @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + $" - not found", Infrastructure.STLogging.Interface.LogLevelEnum.Error);
            }
            if (sourceObj.DataStructures.Count > 1)
            {
                throw Utils.getCustomException("COMPAREITEMS_SOURCETOOMANY",
                       @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + $" - Source have too many dsd", Infrastructure.STLogging.Interface.LogLevelEnum.Error);
            }
            if (targetObj.DataStructures.Count > 1)
            {
                throw Utils.getCustomException("COMPAREITEMS_TARGETTOOMANY",
                       @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + $" - Target have too many dsd", Infrastructure.STLogging.Interface.LogLevelEnum.Error);
            }

            dsdReport.SourceDsd = $"{sourceObj.DataStructures.First().Id}+{sourceObj.DataStructures.First().AgencyId}+{sourceObj.DataStructures.First().Version}";
            dsdReport.TargetDsd = $"{targetObj.DataStructures.First().Id}+{targetObj.DataStructures.First().AgencyId}+{targetObj.DataStructures.First().Version}";


            var codelistNames = new Dictionary<string, Dictionary<string, string>>();
            foreach (var codeList in sourceObj.Codelists.Union(targetObj.Codelists))
            {
                var key = $"{codeList.Id}+{codeList.AgencyId}+{codeList.Version}";
                if (!codelistNames.ContainsKey(key))
                {
                    codelistNames.Add(key, new Dictionary<string, string>());
                }
                foreach (var iName in codeList.Names)
                {
                    if (!codelistNames[key].ContainsKey(iName.Locale))
                    {
                        codelistNames[key].Add(iName.Locale, iName.Value);
                    }
                }
            }

            //Popolate All Source
            foreach (var item in srcDsd.DimensionList?.Dimensions)
            {
                var addItem = new DsdReport.IdentityKey
                {
                    Key = item.Id,
                    Mandatory = false
                };
                if (item.Representation != null && item.Representation.Representation != null)
                {
                    addItem.ReferenceIdentity = new DsdReport.ReferenceIdentity
                    {
                        ID = item.Representation.Representation.MaintainableId,
                        Version = item.Representation.Representation.Version,
                        AgencyId = item.Representation.Representation.AgencyId,
                    };
                    var key = $"{addItem.ReferenceIdentity.ID}+{addItem.ReferenceIdentity.AgencyId}+{addItem.ReferenceIdentity.Version}";
                    if (codelistNames.ContainsKey(key))
                    {
                        addItem.ReferenceIdentity.Names = codelistNames[key];
                    }
                }
                dsdReport.SourceAllDimensions.Add(addItem);
            }
            foreach (var item in srcDsd.Attributes)
            {
                var addItem = new DsdReport.IdentityKey
                {
                    Key = item.Id,
                    Mandatory = !item.AssignmentStatus.Equals("Conditional", StringComparison.InvariantCultureIgnoreCase),
                    AttachmentLevel = item.AttachmentLevel.ToString()
                };
                if (item.Representation != null && item.Representation.Representation != null)
                {
                    addItem.ReferenceIdentity = new DsdReport.ReferenceIdentity
                    {
                        ID = item.Representation.Representation.MaintainableId,
                        Version = item.Representation.Representation.Version,
                        AgencyId = item.Representation.Representation.AgencyId
                    };
                    var key = $"{addItem.ReferenceIdentity.ID}+{addItem.ReferenceIdentity.AgencyId}+{addItem.ReferenceIdentity.Version}";
                    if (codelistNames.ContainsKey(key))
                    {
                        addItem.ReferenceIdentity.Names = codelistNames[key];
                    }
                }
                dsdReport.SourceAllAttributes.Add(addItem);
            }
            foreach (var srcComp in srcDsd.MeasureList?.Composites)
            {
                var srcConvert = srcComp as Org.Sdmxsource.Sdmx.SdmxObjects.Model.Objects.DataStructure.PrimaryMeasureCore;
                if (srcConvert != null)
                {
                    DsdReport.ReferenceIdentity artId = null;
                    if (srcConvert.Representation != null && srcConvert.Representation.Representation != null)
                    {
                        artId = new DsdReport.ReferenceIdentity
                        {
                            ID = srcConvert.Representation.Representation.MaintainableId,
                            Version = srcConvert.Representation.Representation.Version,
                            AgencyId = srcConvert.Representation.Representation.AgencyId,
                        };
                        var key = $"{artId.ID}+{artId.AgencyId}+{artId.Version}";
                        if (codelistNames.ContainsKey(key))
                        {
                            artId.Names = codelistNames[key];
                        }
                    }
                    dsdReport.SourceAllMeasures.Add(new DsdReport.IdentityKey { Key = srcConvert.Id, Mandatory = false, ReferenceIdentity = artId });
                }
            }
            foreach (var itemGroup in srcDsd.Groups)
            {
                var items = new List<string>();
                foreach (var item in itemGroup.DimensionRefs)
                {
                    items.Add(item);
                }
                dsdReport.SourceAllGroups.Add(new DsdReport.IdentityKey { Key = itemGroup.Id, Mandatory = false, ItemsGroup = items });
            }

            //Dimensions
            findDifferenceDimensions(codelistNames, sourceObj.ConceptSchemes.Union(targetObj.ConceptSchemes), srcDsd.DimensionList?.Dimensions, trgDsd.DimensionList?.Dimensions, dsdReport.SourceDimensions, dsdReport.DifferenceDimensions, dsdReport.DifferenceConceptSchemeDimensions);
            findDifferenceDimensions(codelistNames, sourceObj.ConceptSchemes.Union(targetObj.ConceptSchemes), trgDsd.DimensionList?.Dimensions, srcDsd.DimensionList?.Dimensions, dsdReport.TargetDimensions, null, null);//Null because the difference is the same of the first call
            //Attributes
            findDifferenceAttributes(codelistNames, sourceObj.ConceptSchemes.Union(targetObj.ConceptSchemes), srcDsd.Attributes, trgDsd.Attributes, dsdReport.SourceAttributes, dsdReport.DifferenceAttributes, dsdReport.DifferenceConceptSchemeAttributes);
            findDifferenceAttributes(codelistNames, sourceObj.ConceptSchemes.Union(targetObj.ConceptSchemes), trgDsd.Attributes, srcDsd.Attributes, dsdReport.TargetAttributes, null, null);//Null because the difference is the same of the first call
            //Measures
            findDifferenceMeasures(codelistNames, sourceObj.ConceptSchemes.Union(targetObj.ConceptSchemes), srcDsd.MeasureList?.Composites, trgDsd.MeasureList?.Composites, dsdReport.SourceMeasures, dsdReport.DifferenceMeasures, dsdReport.DifferenceConceptSchemeMeasures);
            findDifferenceMeasures(codelistNames, sourceObj.ConceptSchemes.Union(targetObj.ConceptSchemes), trgDsd.MeasureList?.Composites, srcDsd.MeasureList?.Composites, dsdReport.TargetMeasures, null, null);//Null because the difference is the same of the first call
            //Group
            findDifferenceGroups(srcDsd.Groups, trgDsd.Groups, dsdReport.SourceGroups, dsdReport.DifferenceGroups);
            findDifferenceGroups(trgDsd.Groups, srcDsd.Groups, dsdReport.TargetGroups, null);//Null because the difference is the same of the first call


            //Check Codelist Difference
            if (includeCodelist)
            {
                foreach (var item in dsdReport.DifferenceDimensions.Union(dsdReport.DifferenceAttributes).Union(dsdReport.DifferenceMeasures))
                {
                    if (item.Source == null || item.Target == null)
                    {
                        continue;
                    }
                    item.CodelistCompare = CompareItems(new ArtefactCompare { ID = item.Source.ID, Agency = item.Source.AgencyId, Version = item.Source.Version, EnumType = SdmxStructureEnumType.CodeList, StreamType = sourceDsd.StreamType, FilePath = sourceDsd.FilePath },
                                                            new ArtefactCompare { ID = item.Target.ID, Agency = item.Target.AgencyId, Version = item.Target.Version, EnumType = SdmxStructureEnumType.CodeList, StreamType = targetDsd.StreamType, FilePath = targetDsd.FilePath });
                }
            }

            if (callCompare)
            {
                dsdReport.Compare = CompareDSD(dsdReport);
            }

            return dsdReport;
        }

        public DsdReport.ItemCompare CompareItems(ArtefactCompare source, ArtefactCompare target)
        {
            if (source.EnumType != target.EnumType)
            {
                throw Utils.getCustomException("COMPAREITEMS_DIFFERENT_TYPE",
                       @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + $" - Can't compare different SdmxStructureEnumType {source.EnumType} {target.EnumType}", Infrastructure.STLogging.Interface.LogLevelEnum.Error);
            }

            ISdmxObjects sourceObj = null;
            ISdmxObjects targetObj = null;

            if (source.StreamType == StreamType.Database)
            {
                sourceObj = Sdmx21Connector.GetArtefacts(source.EnumType, source.ID, source.Agency, source.Version);
            }
            else if (source.StreamType == StreamType.Xml)
            {
                sourceObj = Sdmx21Connector.GetSdmxObjectsFromFileXML(source.FilePath);
            }
            else if (source.StreamType == StreamType.Csv)
            {
                sourceObj = popolateArtefactFromCsv(source);
            }

            if (target.StreamType == StreamType.Database)
            {
                targetObj = Sdmx21Connector.GetArtefacts(target.EnumType, target.ID, target.Agency, target.Version);
            }
            else if (target.StreamType == StreamType.Xml)
            {
                targetObj = Sdmx21Connector.GetSdmxObjectsFromFileXML(target.FilePath);
            }
            else if (target.StreamType == StreamType.Csv)
            {
                targetObj = popolateArtefactFromCsv(target);
            }

            if (sourceObj == null || sourceObj.GetAllMaintainables().Count <= 0 ||
                (source.EnumType == SdmxStructureEnumType.CodeList && sourceObj.Codelists.Count <= 0) ||
                (source.EnumType == SdmxStructureEnumType.ConceptScheme && sourceObj.ConceptSchemes.Count <= 0) ||
                (source.EnumType == SdmxStructureEnumType.CategoryScheme && sourceObj.CategorySchemes.Count <= 0)
                )
            {
                throw Utils.getCustomException("GENERATEREPORTDSD_SOURCENOTFOUND",
                       @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + $" - {source.EnumType} {source.ID}+{source.Agency}+{source.Version} not found", Infrastructure.STLogging.Interface.LogLevelEnum.Error);
            }
            if (targetObj == null || targetObj.GetAllMaintainables().Count <= 0 ||
                (source.EnumType == SdmxStructureEnumType.CodeList && targetObj.Codelists.Count <= 0) ||
                (source.EnumType == SdmxStructureEnumType.ConceptScheme && targetObj.ConceptSchemes.Count <= 0) ||
                (source.EnumType == SdmxStructureEnumType.CategoryScheme && targetObj.CategorySchemes.Count <= 0)
                )
            {
                throw Utils.getCustomException("GENERATEREPORTDSD_TARGETNOTFOUND",
                       @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + $" - {target.EnumType} {target.ID}+{target.Agency}+{target.Version} not found", Infrastructure.STLogging.Interface.LogLevelEnum.Error);
            }

            //if (sourceObj.GetAllMaintainables().Count > 1)
            //{
            //    throw Utils.getCustomException("COMPAREITEMS_SOURCETOOMANY",
            //           @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + $" - Source have too many artefacts", Infrastructure.STLogging.Interface.LogLevelEnum.Error);
            //}
            //if (targetObj.GetAllMaintainables().Count > 1)
            //{
            //    throw Utils.getCustomException("COMPAREITEMS_TARGETTOOMANY",
            //           @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + $" - Target have too many artefacts", Infrastructure.STLogging.Interface.LogLevelEnum.Error);
            //}

            if (source.EnumType == SdmxStructureEnumType.CodeList)
            {
                ICodelistMutableObject sourceCodeList = null;
                foreach (ICodelistObject item in sourceObj.Codelists)
                {
                    if (string.IsNullOrWhiteSpace(source.ID) ||
                            (item.Id.Equals(source.ID, StringComparison.InvariantCultureIgnoreCase) &&
                            item.AgencyId.Equals(source.Agency, StringComparison.InvariantCultureIgnoreCase) &&
                            item.Version.Equals(source.Version, StringComparison.InvariantCultureIgnoreCase)))
                    {
                        sourceCodeList = item.MutableInstance;
                        break;
                    }
                }
                if (sourceCodeList == null)
                {
                    throw Utils.getCustomException("GENERATEREPORTDSD_SOURCENOTFOUND",
                       @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + $" - {source.EnumType} {source.ID}+{source.Agency}+{source.Version} not found", Infrastructure.STLogging.Interface.LogLevelEnum.Error);
                }
                ICodelistMutableObject targetCodeList = null;
                foreach (ICodelistObject item in targetObj.Codelists)
                {
                    if (string.IsNullOrWhiteSpace(target.ID) ||
                            (item.Id.Equals(target.ID, StringComparison.InvariantCultureIgnoreCase) &&
                            item.AgencyId.Equals(target.Agency, StringComparison.InvariantCultureIgnoreCase) &&
                            item.Version.Equals(target.Version, StringComparison.InvariantCultureIgnoreCase)))
                    {
                        targetCodeList = item.MutableInstance;
                        break;
                    }
                }
                if (targetCodeList == null)
                {
                    throw Utils.getCustomException("GENERATEREPORTDSD_TARGETNOTFOUND",
                       @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + $" - {target.EnumType} {target.ID}+{target.Agency}+{target.Version} not found", Infrastructure.STLogging.Interface.LogLevelEnum.Error);
                }

                return compareCodeList(sourceCodeList, targetCodeList);
            }
            else if (source.EnumType == SdmxStructureEnumType.ConceptScheme)
            {
                IConceptSchemeMutableObject sourceConcept = null;
                foreach (IConceptSchemeObject item in sourceObj.ConceptSchemes)
                {
                    if (string.IsNullOrWhiteSpace(source.ID) ||
                            (item.Id.Equals(source.ID, StringComparison.InvariantCultureIgnoreCase) &&
                            item.AgencyId.Equals(source.Agency, StringComparison.InvariantCultureIgnoreCase) &&
                            item.Version.Equals(source.Version, StringComparison.InvariantCultureIgnoreCase)))
                    {
                        sourceConcept = item.MutableInstance;
                        break;
                    }
                }
                if (sourceConcept == null)
                {
                    throw Utils.getCustomException("GENERATEREPORTDSD_SOURCENOTFOUND",
                       @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + $" - {source.EnumType} {source.ID}+{source.Agency}+{source.Version} not found", Infrastructure.STLogging.Interface.LogLevelEnum.Error);
                }
                IConceptSchemeMutableObject targetConcept = null;
                foreach (IConceptSchemeObject item in targetObj.ConceptSchemes)
                {
                    if (string.IsNullOrWhiteSpace(target.ID) ||
                            (item.Id.Equals(target.ID, StringComparison.InvariantCultureIgnoreCase) &&
                            item.AgencyId.Equals(target.Agency, StringComparison.InvariantCultureIgnoreCase) &&
                            item.Version.Equals(target.Version, StringComparison.InvariantCultureIgnoreCase)))
                    {
                        targetConcept = item.MutableInstance;
                        break;
                    }
                }
                if (targetConcept == null)
                {
                    throw Utils.getCustomException("GENERATEREPORTDSD_TARGETNOTFOUND",
                       @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + $" - {target.EnumType} {target.ID}+{target.Agency}+{target.Version} not found", Infrastructure.STLogging.Interface.LogLevelEnum.Error);
                }

                return compareConceptScheme(sourceConcept, targetConcept);
            }
            else if (source.EnumType == SdmxStructureEnumType.CategoryScheme)
            {
                ICategorySchemeMutableObject sourceConcept = null;
                foreach (ICategorySchemeObject item in sourceObj.CategorySchemes)
                {
                    if (string.IsNullOrWhiteSpace(source.ID) ||
                            (item.Id.Equals(source.ID, StringComparison.InvariantCultureIgnoreCase) &&
                            item.AgencyId.Equals(source.Agency, StringComparison.InvariantCultureIgnoreCase) &&
                            item.Version.Equals(source.Version, StringComparison.InvariantCultureIgnoreCase)))
                    {
                        sourceConcept = item.MutableInstance;
                        break;
                    }
                }
                if (sourceConcept == null)
                {
                    throw Utils.getCustomException("GENERATEREPORTDSD_SOURCENOTFOUND",
                       @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + $" - {source.EnumType} {source.ID}+{source.Agency}+{source.Version} not found", Infrastructure.STLogging.Interface.LogLevelEnum.Error);
                }
                ICategorySchemeMutableObject targetConcept = null;
                foreach (ICategorySchemeObject item in targetObj.CategorySchemes)
                {
                    if (string.IsNullOrWhiteSpace(target.ID) ||
                            (item.Id.Equals(target.ID, StringComparison.InvariantCultureIgnoreCase) &&
                            item.AgencyId.Equals(target.Agency, StringComparison.InvariantCultureIgnoreCase) &&
                            item.Version.Equals(target.Version, StringComparison.InvariantCultureIgnoreCase)))
                    {
                        targetConcept = item.MutableInstance;
                        break;
                    }
                }
                if (targetConcept == null)
                {
                    throw Utils.getCustomException("GENERATEREPORTDSD_TARGETNOTFOUND",
                       @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + $" - {target.EnumType} {target.ID}+{target.Agency}+{target.Version} not found", Infrastructure.STLogging.Interface.LogLevelEnum.Error);
                }

                return compareCategoryScheme(sourceConcept, targetConcept);
            }
            return null;
        }

        private DsdReport.ItemCompare compareCodeList(ICodelistMutableObject source, ICodelistMutableObject target)
        {
            var result = popolateNameReport(source, target);

            var maxCode = 1;
            var nDifference = 0;
            foreach (var itemCode in source.Items)
            {
                if (maxCode > 1000)
                {
                    break;
                }
                var haveCode = target.RemoveItem(itemCode.Id);
                if (!haveCode && maxCode <= 1000)
                {
                    maxCode++;
                    var item = new DsdReport.ItemCompare.Item();
                    item.Id = itemCode.Id;
                    foreach (var iName in itemCode.Names)
                    {
                        item.Names.Add(iName.Locale, iName.Value);
                    }
                    result.SourceItem.Add(item);
                    nDifference++;
                }
            }
            foreach (var itemCode in target.Items)
            {
                if (maxCode <= 1000)
                {
                    maxCode++;
                    var item = new DsdReport.ItemCompare.Item();
                    item.Id = itemCode.Id;
                    foreach (var iName in itemCode.Names)
                    {
                        item.Names.Add(iName.Locale, iName.Value);
                    }
                    result.TargetItem.Add(item);
                }
                nDifference++;
            }
            result.TotalDifference = nDifference;
            return result;
        }

        private DsdReport.ItemCompare compareConceptScheme(IConceptSchemeMutableObject source, IConceptSchemeMutableObject target)
        {
            var result = popolateNameReport(source, target);

            var maxCode = 1;
            var nDifference = 0;
            foreach (var itemCode in source.Items)
            {
                if (maxCode > 1000)
                {
                    break;
                }
                var haveCode = target.RemoveItem(itemCode.Id);
                if (!haveCode)
                {
                    maxCode++;
                    var item = new DsdReport.ItemCompare.Item();
                    item.Id = itemCode.Id;
                    foreach (var iName in itemCode.Names)
                    {
                        item.Names.Add(iName.Locale, iName.Value);
                    }
                    result.SourceItem.Add(item);
                    nDifference++;
                }
            }
            foreach (var itemCode in target.Items)
            {
                if (maxCode > 1000)
                {
                    break;
                }
                maxCode++;
                var item = new DsdReport.ItemCompare.Item();
                item.Id = itemCode.Id;
                foreach (var iName in itemCode.Names)
                {
                    item.Names.Add(iName.Locale, iName.Value);
                }
                result.TargetItem.Add(item);
            }
            result.TotalDifference = nDifference;
            return result;
        }

        private DsdReport.ItemCompare compareCategoryScheme(ICategorySchemeMutableObject source, ICategorySchemeMutableObject target)
        {
            var result = popolateNameReport(source, target);

            var maxCode = 1;
            var nDifference = 0;
            foreach (var itemCode in source.Items)
            {
                if (maxCode > 1000)
                {
                    break;
                }
                var haveCode = target.RemoveItem(itemCode.Id);
                if (!haveCode)
                {
                    maxCode++;
                    var item = new DsdReport.ItemCompare.Item();
                    item.Id = itemCode.Id;
                    foreach (var iName in itemCode.Names)
                    {
                        item.Names.Add(iName.Locale, iName.Value);
                    }
                    result.SourceItem.Add(item);
                    nDifference++;
                }
            }
            foreach (var itemCode in target.Items)
            {
                if (maxCode > 1000)
                {
                    break;
                }
                maxCode++;
                var item = new DsdReport.ItemCompare.Item();
                item.Id = itemCode.Id;
                foreach (var iName in itemCode.Names)
                {
                    item.Names.Add(iName.Locale, iName.Value);
                }
                result.TargetItem.Add(item);
            }
            result.TotalDifference = nDifference;
            return result;
        }

        /// <summary>
        /// Read xml file and return an reppresentation of json
        /// </summary>
        /// <param name="file">File upload on server</param>
        /// <returns>SdmxObject</returns>
        public ISdmxObjects PreviewArtefact(IFormFile file, SdmxStructureEnumType structureType)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            var importedItemDTO = new ImportedItemXmlDTO();
            var filePath = UploadFileOnNodeApi(file, new List<string>() { ".xml" }, _configuration["UPLOAD_IMPORT_STRUCTURE"]);

            var sdmxObjects = Sdmx21Connector.GetSdmxObjectsFromFileXML(filePath);

            if (sdmxObjects.GetAllMaintainables().Count > 1)
            {
                throw Utils.getCustomException("COMPAREITEMS_SOURCETOOMANY",
                       @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + $" - too many artefacts", Infrastructure.STLogging.Interface.LogLevelEnum.Error);
            }
            if (structureType == SdmxStructureEnumType.CategoryScheme && sdmxObjects.CategorySchemes.Count <= 0)
            {
                throw Utils.getCustomException("NOTFOUNDTARTEFACT",
                   @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + $" - CategorySchemes not found", Infrastructure.STLogging.Interface.LogLevelEnum.Error);
            }
            else if (structureType == SdmxStructureEnumType.ConceptScheme && sdmxObjects.ConceptSchemes.Count <= 0)
            {
                throw Utils.getCustomException("NOTFOUNDTARTEFACT",
                   @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + $" - ConceptScheme not found", Infrastructure.STLogging.Interface.LogLevelEnum.Error);
            }
            else if (structureType == SdmxStructureEnumType.CodeList && sdmxObjects.Codelists.Count <= 0)
            {
                throw Utils.getCustomException("NOTFOUNDTARTEFACT",
                   @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + $" - CodeList not found", Infrastructure.STLogging.Interface.LogLevelEnum.Error);
            }

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);
            return sdmxObjects;
        }

        /// <summary>
        /// Read xml file and return an reppresentation of json
        /// </summary>
        /// <param name="conflictItem">Contains the list of item conflict in merge (if null return null)</param>
        /// <returns>SdmxObject</returns>
        public ISdmxObjects MergeArtefact(ArtefactCompare source, ArtefactCompare target, ArtefactIdentity artefactIdentity, List<string> conflictItem)
        {
            if (source.EnumType != target.EnumType)
            {
                throw Utils.getCustomException("COMPAREITEMS_DIFFERENT_TYPE",
                       @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + $" - Can't compare different SdmxStructureEnumType {source.EnumType} {target.EnumType}", Infrastructure.STLogging.Interface.LogLevelEnum.Error);
            }

            ISdmxObjects sourceObj = null;
            ISdmxObjects targetObj = null;

            if (source.StreamType == StreamType.Database)
            {
                sourceObj = Sdmx21Connector.GetArtefacts(source.EnumType, source.ID, source.Agency, source.Version);
            }
            else if (source.StreamType == StreamType.Xml)
            {
                sourceObj = Sdmx21Connector.GetSdmxObjectsFromFileXML(source.FilePath);
            }
            else if (source.StreamType == StreamType.Csv)
            {
                sourceObj = popolateArtefactFromCsv(source);
            }

            if (target.StreamType == StreamType.Database)
            {
                targetObj = Sdmx21Connector.GetArtefacts(target.EnumType, target.ID, target.Agency, target.Version);
            }
            else if (target.StreamType == StreamType.Xml)
            {
                targetObj = Sdmx21Connector.GetSdmxObjectsFromFileXML(target.FilePath);
            }
            else if (target.StreamType == StreamType.Csv)
            {
                targetObj = popolateArtefactFromCsv(target);
            }

            if (sourceObj == null || sourceObj.GetAllMaintainables().Count <= 0 ||
                (source.EnumType == SdmxStructureEnumType.CodeList && sourceObj.Codelists.Count <= 0) ||
                (source.EnumType == SdmxStructureEnumType.ConceptScheme && sourceObj.ConceptSchemes.Count <= 0) ||
                (source.EnumType == SdmxStructureEnumType.CategoryScheme && sourceObj.CategorySchemes.Count <= 0)
                )
            {
                throw Utils.getCustomException("GENERATEREPORTDSD_SOURCENOTFOUND",
                       @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + $" - {source.EnumType} {source.ID}+{source.Agency}+{source.Version} not found", Infrastructure.STLogging.Interface.LogLevelEnum.Error);
            }
            if (targetObj == null || targetObj.GetAllMaintainables().Count <= 0 ||
                (source.EnumType == SdmxStructureEnumType.CodeList && targetObj.Codelists.Count <= 0) ||
                (source.EnumType == SdmxStructureEnumType.ConceptScheme && targetObj.ConceptSchemes.Count <= 0) ||
                (source.EnumType == SdmxStructureEnumType.CategoryScheme && targetObj.CategorySchemes.Count <= 0)
                )
            {
                throw Utils.getCustomException("GENERATEREPORTDSD_TARGETNOTFOUND",
                       @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + $" - {target.EnumType} {target.ID}+{target.Agency}+{target.Version} not found", Infrastructure.STLogging.Interface.LogLevelEnum.Error);
            }

            if (sourceObj.GetAllMaintainables().Count > 1)
            {
                throw Utils.getCustomException("COMPAREITEMS_SOURCETOOMANY",
                       @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + $" - Source have too many artefacts", Infrastructure.STLogging.Interface.LogLevelEnum.Error);
            }
            if (targetObj.GetAllMaintainables().Count > 1)
            {
                throw Utils.getCustomException("COMPAREITEMS_TARGETTOOMANY",
                       @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + $" - Target have too many artefacts", Infrastructure.STLogging.Interface.LogLevelEnum.Error);
            }


            if (source.EnumType == SdmxStructureEnumType.CodeList)
            {
                var codeList = new CodelistMutableCore(sourceObj.Codelists.First());
                codeList.Id = artefactIdentity.ID;
                codeList.AgencyId = artefactIdentity.Agency;
                codeList.Version = artefactIdentity.Version;
                codeList.FinalStructure = TertiaryBool.ParseBoolean(false);

                return new SdmxObjectsImpl(mergeCodeList(codeList, targetObj.Codelists.First().MutableInstance, conflictItem).ImmutableInstance);
            }
            else if (source.EnumType == SdmxStructureEnumType.ConceptScheme)
            {
                var conceptScheme = new ConceptSchemeMutableCore(sourceObj.ConceptSchemes.First());
                conceptScheme.Id = artefactIdentity.ID;
                conceptScheme.AgencyId = artefactIdentity.Agency;
                conceptScheme.Version = artefactIdentity.Version;
                conceptScheme.FinalStructure = TertiaryBool.ParseBoolean(false);

                return new SdmxObjectsImpl(mergeConceptScheme(conceptScheme, targetObj.ConceptSchemes.First().MutableInstance, conflictItem).ImmutableInstance);
            }
            else if (source.EnumType == SdmxStructureEnumType.CategoryScheme)
            {
                var categoryScheme = new CategorySchemeMutableCore(sourceObj.CategorySchemes.First());
                categoryScheme.Id = artefactIdentity.ID;
                categoryScheme.AgencyId = artefactIdentity.Agency;
                categoryScheme.Version = artefactIdentity.Version;
                categoryScheme.FinalStructure = TertiaryBool.ParseBoolean(false);

                return new SdmxObjectsImpl(mergeCategoryScheme(categoryScheme, targetObj.CategorySchemes.First().MutableInstance, conflictItem).ImmutableInstance);
            }
            return null;
        }

        private ICodelistMutableObject mergeCodeList(ICodelistMutableObject source, ICodelistMutableObject target, List<string> conflictItem)
        {
            if (conflictItem != null)
            {
                conflictItem.RemoveAll(i => true);
            }
            foreach (ICodeMutableObject itemTarget in target.Items)
            {
                var findItem = false;
                foreach (ICodeMutableObject itemSource in source.Items)
                {
                    if (itemSource.Id.Equals(itemTarget.Id, StringComparison.InvariantCultureIgnoreCase))
                    {
                        var findName = false;
                        foreach (var trgNm in itemTarget.Names)
                        {
                            foreach (var srcNm in itemSource.Names)
                            {
                                if (srcNm.Locale != null && srcNm.Locale.Equals(trgNm.Locale, StringComparison.InvariantCultureIgnoreCase))
                                {
                                    findName = true;
                                    break;
                                }
                            }

                            if (!findName)
                            {
                                itemSource.AddName(trgNm.Locale, trgNm.Value);
                            }
                        }

                        var findDesc = false;
                        foreach (var trgDesc in itemTarget.Descriptions)
                        {
                            foreach (var srcDesc in itemSource.Descriptions)
                            {
                                if (srcDesc.Locale != null && srcDesc.Locale.Equals(trgDesc.Locale, StringComparison.InvariantCultureIgnoreCase))
                                {
                                    findDesc = true;
                                    break;
                                }
                            }

                            if (!findDesc)
                            {
                                itemSource.AddDescription(trgDesc.Locale, trgDesc.Value);
                            }
                        }

                        var findAnn = false;
                        foreach (var trgAnn in itemTarget.Annotations)
                        {
                            foreach (var srcAnn in itemSource.Annotations)
                            {
                                if (srcAnn.Id != null && trgAnn.Id != null && srcAnn.Id.Equals(trgAnn.Id, StringComparison.InvariantCultureIgnoreCase))
                                {
                                    var findText = false;
                                    foreach (var trgText in trgAnn.Text)
                                    {
                                        foreach (var srcText in srcAnn.Text)
                                        {
                                            if (srcText.Locale != null && srcText.Locale.Equals(trgText.Locale, StringComparison.InvariantCultureIgnoreCase))
                                            {
                                                findText = true;
                                                break;
                                            }
                                        }

                                        if (!findText)
                                        {
                                            srcAnn.AddText(trgText);
                                        }
                                    }

                                    findAnn = true;
                                    break;
                                }
                            }

                            if (!findAnn)
                            {
                                itemSource.AddAnnotation(trgAnn);
                            }
                        }

                        findItem = true;
                        break;
                    }
                }

                if (!findItem)
                {
                    source.AddItem(itemTarget);
                }
                else
                {
                    if (conflictItem != null)
                    {
                        conflictItem.Add(itemTarget.Id);
                    }
                }
            }

            return source;
        }

        private IConceptSchemeMutableObject mergeConceptScheme(IConceptSchemeMutableObject source, IConceptSchemeMutableObject target, List<string> conflictItem)
        {
            if (conflictItem != null)
            {
                conflictItem.RemoveAll(i => true);
            }
            foreach (var itemTarget in target.Items)
            {
                var findItem = false;
                foreach (var itemSource in source.Items)
                {
                    if (itemSource.Id.Equals(itemTarget.Id, StringComparison.InvariantCultureIgnoreCase))
                    {
                        var findName = false;
                        foreach (var trgNm in itemTarget.Names)
                        {
                            foreach (var srcNm in itemSource.Names)
                            {
                                if (srcNm.Locale != null && srcNm.Locale.Equals(trgNm.Locale, StringComparison.InvariantCultureIgnoreCase))
                                {
                                    findName = true;
                                    break;
                                }
                            }

                            if (!findName)
                            {
                                itemSource.AddName(trgNm.Locale, trgNm.Value);
                            }
                        }

                        var findDesc = false;
                        foreach (var trgDesc in itemTarget.Descriptions)
                        {
                            foreach (var srcDesc in itemSource.Descriptions)
                            {
                                if (srcDesc.Locale != null && srcDesc.Locale.Equals(trgDesc.Locale, StringComparison.InvariantCultureIgnoreCase))
                                {
                                    findDesc = true;
                                    break;
                                }
                            }

                            if (!findDesc)
                            {
                                itemSource.AddDescription(trgDesc.Locale, trgDesc.Value);
                            }
                        }

                        var findAnn = false;
                        foreach (var trgAnn in itemTarget.Annotations)
                        {
                            foreach (var srcAnn in itemSource.Annotations)
                            {
                                if (srcAnn.Id != null && srcAnn.Id.Equals(trgAnn.Id, StringComparison.InvariantCultureIgnoreCase))
                                {

                                    var findText = false;
                                    foreach (var trgText in trgAnn.Text)
                                    {
                                        foreach (var srcText in srcAnn.Text)
                                        {
                                            if (srcText.Locale.Equals(trgText.Locale, StringComparison.InvariantCultureIgnoreCase))
                                            {
                                                findText = true;
                                                break;
                                            }
                                        }

                                        if (!findText)
                                        {
                                            srcAnn.AddText(trgText);
                                        }
                                    }

                                    findAnn = true;
                                    break;
                                }
                            }

                            if (!findAnn)
                            {
                                itemSource.AddAnnotation(trgAnn);
                            }
                        }

                        findItem = true;
                        break;
                    }
                }

                if (!findItem)
                {
                    source.AddItem(itemTarget);
                }
                else
                {
                    if (conflictItem != null)
                    {
                        conflictItem.Add(itemTarget.Id);
                    }
                }
            }

            return source;
        }

        private ICategorySchemeMutableObject mergeCategoryScheme(ICategorySchemeMutableObject source, ICategorySchemeMutableObject target, List<string> conflictItem)
        {
            if (conflictItem != null)
            {
                conflictItem.RemoveAll(i => true);
            }

            var targetItems = new List<ICategoryMutableObject>();
            foreach (var item in target.Items)
            {
                targetItems.AddRange(FlattenTreeCategoryScheme(item));
            }
            var sourceItems = new List<ICategoryMutableObject>();
            foreach (var item in source.Items)
            {
                sourceItems.AddRange(FlattenTreeCategoryScheme(item));
            }

            foreach (var itemTarget in targetItems)
            {
                var findItem = false;
                foreach (var itemSource in sourceItems)
                {
                    if (itemSource.Id.Equals(itemTarget.Id, StringComparison.InvariantCultureIgnoreCase))
                    {
                        var findName = false;
                        foreach (var trgNm in itemTarget.Names)
                        {
                            foreach (var srcNm in itemSource.Names)
                            {
                                if (srcNm.Locale.Equals(trgNm.Locale, StringComparison.InvariantCultureIgnoreCase))
                                {
                                    findName = true;
                                    break;
                                }
                            }

                            if (!findName)
                            {
                                itemSource.AddName(trgNm.Locale, trgNm.Value);
                            }
                        }

                        var findDesc = false;
                        foreach (var trgDesc in itemTarget.Descriptions)
                        {
                            foreach (var srcDesc in itemSource.Descriptions)
                            {
                                if (srcDesc.Locale != null && srcDesc.Locale.Equals(trgDesc.Locale, StringComparison.InvariantCultureIgnoreCase))
                                {
                                    findDesc = true;
                                    break;
                                }
                            }

                            if (!findDesc)
                            {
                                itemSource.AddDescription(trgDesc.Locale, trgDesc.Value);
                            }
                        }

                        var findAnn = false;
                        foreach (var trgAnn in itemTarget.Annotations)
                        {
                            foreach (var srcAnn in itemSource.Annotations)
                            {
                                if (srcAnn.Id != null && srcAnn.Id.Equals(trgAnn.Id, StringComparison.InvariantCultureIgnoreCase))
                                {

                                    var findText = false;
                                    foreach (var trgText in trgAnn.Text)
                                    {
                                        foreach (var srcText in srcAnn.Text)
                                        {
                                            if (srcText.Locale != null && srcText.Locale.Equals(trgText.Locale, StringComparison.InvariantCultureIgnoreCase))
                                            {
                                                findText = true;
                                                break;
                                            }
                                        }

                                        if (!findText)
                                        {
                                            srcAnn.AddText(trgText);
                                        }
                                    }

                                    findAnn = true;
                                    break;
                                }
                            }

                            if (!findAnn)
                            {
                                itemSource.AddAnnotation(trgAnn);
                            }
                        }

                        findItem = true;
                        break;
                    }
                }

                if (!findItem)
                {
                    source.AddItem(itemTarget);
                }
                else
                {
                    if (conflictItem != null)
                    {
                        conflictItem.Add(itemTarget.Id);
                    }
                }
            }

            return source;
        }

        public static List<ICategoryMutableObject> FlattenTreeCategoryScheme(ICategoryMutableObject root)
        {

            var flattened = new List<ICategoryMutableObject> { root };

            var children = root.Items;

            if (children != null)
            {
                foreach (var child in children)
                {
                    flattened.AddRange(FlattenTreeCategoryScheme(child));
                }
            }

            return flattened;
        }

        private DsdReport.ItemCompare popolateNameReport(IMaintainableMutableObject source, IMaintainableMutableObject target)
        {
            var result = new DsdReport.ItemCompare();
            result.SourceArtefact.ID = source.Id;
            result.SourceArtefact.AgencyId = source.AgencyId;
            result.SourceArtefact.Version = source.Version;
            foreach (var iName in source.Names)
            {
                result.SourceArtefact.Names.Add(iName.Locale, iName.Value);
            }
            result.TargetArtefact.ID = target.Id;
            result.TargetArtefact.AgencyId = target.AgencyId;
            result.TargetArtefact.Version = target.Version;
            foreach (var iName in target.Names)
            {
                result.TargetArtefact.Names.Add(iName.Locale, iName.Value);
            }

            return result;
        }

        private ISdmxObjects popolateArtefactFromCsv(ArtefactCompare artefactCompare)
        {
            readCsvItem(artefactCompare.FilePath, artefactCompare.ImportedItemCsv, -1);

            ISdmxObjects sdmxObjects = new SdmxObjectsImpl();

            if (artefactCompare.EnumType == SdmxStructureEnumType.CodeList)
            {
                var codeList = new CodelistMutableCore();
                codeList.Id = artefactCompare.ImportedItemCsv.Identity.ID ?? "IDCompare";
                codeList.AgencyId = artefactCompare.ImportedItemCsv.Identity.Agency ?? "AgencyCompare";
                codeList.Version = artefactCompare.ImportedItemCsv.Identity.Version ?? "1.0";
                codeList.AddName(artefactCompare.ImportedItemCsv.Lang ?? "en", "CompareItem");

                var i = 0;
                foreach (var item in artefactCompare.ImportedItemCsv.ImportedItemCsv)
                {
                    i++;
                    if (artefactCompare.ImportedItemCsv.FirstRowHeader && i == 1)
                    {
                        continue;
                    }
                    var iCode = new CodeMutableCore
                    {
                        Id = item.Id
                    };
                    iCode.AddName(artefactCompare.ImportedItemCsv.Lang ?? "en", item.Name);
                    codeList.AddItem(iCode);
                }
                sdmxObjects.AddCodelist(codeList.ImmutableInstance);
            }
            else if (artefactCompare.EnumType == SdmxStructureEnumType.ConceptScheme)
            {
                var conceptScheme = new ConceptSchemeMutableCore();
                conceptScheme.Id = artefactCompare.ImportedItemCsv.Identity.ID ?? "IDCompare";
                conceptScheme.AgencyId = artefactCompare.ImportedItemCsv.Identity.Agency ?? "AgencyCompare";
                conceptScheme.Version = artefactCompare.ImportedItemCsv.Identity.Version ?? "1.0";
                conceptScheme.AddName(artefactCompare.ImportedItemCsv.Lang ?? "en", "CompareItem");

                var i = 0;
                foreach (var item in artefactCompare.ImportedItemCsv.ImportedItemCsv)
                {
                    i++;
                    if (artefactCompare.ImportedItemCsv.FirstRowHeader && i == 1)
                    {
                        continue;
                    }
                    var iCode = new ConceptMutableCore
                    {
                        Id = item.Id
                    };
                    iCode.AddName(artefactCompare.ImportedItemCsv.Lang ?? "en", item.Name);
                    conceptScheme.AddItem(iCode);
                }
                sdmxObjects.AddConceptScheme(conceptScheme.ImmutableInstance);
            }
            else if (artefactCompare.EnumType == SdmxStructureEnumType.CategoryScheme)
            {
                var categoryScheme = new CategorySchemeMutableCore();
                categoryScheme.Id = artefactCompare.ID ?? "IDCompare";
                categoryScheme.AgencyId = artefactCompare.Agency ?? "AgencyCompare";
                categoryScheme.Version = artefactCompare.Version ?? "1.0";
                categoryScheme.AddName(artefactCompare.ImportedItemCsv.Lang ?? "en", "CompareItem");

                var i = 0;
                foreach (var item in artefactCompare.ImportedItemCsv.ImportedItemCsv)
                {
                    i++;
                    if (artefactCompare.ImportedItemCsv.FirstRowHeader && i == 1)
                    {
                        continue;
                    }
                    var iCode = new CategoryMutableCore
                    {
                        Id = item.Id
                    };
                    iCode.AddName(artefactCompare.ImportedItemCsv.Lang ?? "en", item.Name);
                    categoryScheme.AddItem(iCode);
                }
                sdmxObjects.AddCategoryScheme(categoryScheme.ImmutableInstance);
            }

            return sdmxObjects;
        }

        public Stream GenerateFileReportDSD(ArtefactCompare sourceDsd, ArtefactCompare targetDsd, string lang)
        {
            var dsdReport = GenerateReportDSD(sourceDsd, targetDsd, true, false);

            var ms = new MemoryStream();
            var info = new UTF8Encoding(true).GetBytes($"DSD: {sourceDsd.ID}+{sourceDsd.Agency}+{sourceDsd.Version} - {targetDsd.ID}+{targetDsd.Agency}+{targetDsd.Version}");
            ms.Write(info, 0, info.Length);
            var newline = Encoding.ASCII.GetBytes(Environment.NewLine);
            commonGenerateFileReport(ms, dsdReport.SourceAllDimensions, dsdReport.TargetDimensions, dsdReport.SourceDimensions, dsdReport.DifferenceDimensions, dsdReport.DifferenceConceptSchemeDimensions, "Dimension", lang);
            commonGenerateFileReport(ms, dsdReport.SourceAllAttributes, dsdReport.TargetAttributes, dsdReport.SourceAttributes, dsdReport.DifferenceAttributes, dsdReport.DifferenceConceptSchemeAttributes, "Attribute", lang);
            commonGenerateFileReport(ms, dsdReport.SourceAllMeasures, dsdReport.TargetMeasures, dsdReport.SourceMeasures, dsdReport.DifferenceMeasures, dsdReport.DifferenceConceptSchemeMeasures, "Measure", lang);
            groupGenerateFileReport(ms, dsdReport.SourceAllGroups, dsdReport.TargetGroups, dsdReport.SourceGroups, dsdReport.DifferenceGroups, lang);
            ms.Position = 0;

            return ms;
        }

        public Stream GenerateFileCompareItems(DsdReport.ItemCompare itemCompare, string lang)
        {
            var ms = new MemoryStream();
            var info = new UTF8Encoding(true).GetBytes($"Artefacts: {itemCompare.SourceArtefact.ID}+{itemCompare.SourceArtefact.AgencyId}+{itemCompare.SourceArtefact.Version} - {itemCompare.TargetArtefact.ID}+{itemCompare.TargetArtefact.AgencyId}+{itemCompare.TargetArtefact.Version}");
            ms.Write(info, 0, info.Length);
            var newline = Encoding.ASCII.GetBytes(Environment.NewLine);

            if (itemCompare.TargetItem != null && itemCompare.TargetItem.Count > 0)
            {
                ms.Write(newline, 0, newline.Length);
                info = new UTF8Encoding(true).GetBytes($"\tMissing item in Source: " + Environment.NewLine);
                ms.Write(info, 0, info.Length);
                foreach (var item in itemCompare.TargetItem)
                {
                    info = new UTF8Encoding(true).GetBytes($"\t\t[{item.Id}]: {getLocalizedName(item.Names, lang)} " + Environment.NewLine);
                    ms.Write(info, 0, info.Length);
                }
            }
            if (itemCompare.SourceItem.Count > 0)
            {
                ms.Write(newline, 0, newline.Length);
                info = new UTF8Encoding(true).GetBytes($"\tMissing item in Target: " + Environment.NewLine);
                ms.Write(info, 0, info.Length);
                foreach (var item in itemCompare.SourceItem)
                {
                    info = new UTF8Encoding(true).GetBytes($"\t\t[{item.Id}]: {getLocalizedName(item.Names, lang)} " + Environment.NewLine);
                    ms.Write(info, 0, info.Length);
                }
            }

            if ((itemCompare.SourceItem == null || itemCompare.SourceItem.Count <= 0) && (itemCompare.TargetItem == null || itemCompare.TargetItem.Count <= 0))
            {
                ms.Write(newline, 0, newline.Length);
                info = new UTF8Encoding(true).GetBytes($"\tNo Differences " + Environment.NewLine);
                ms.Write(info, 0, info.Length);
            }

            ms.Position = 0;

            return ms;
        }

        public List<DsdWithDataflow> GetDSDWithDataflow()
        {
            var listDsd = DmApiConnector.GetDSDWithDataflow();
            foreach (var item in listDsd)
            {
                var objectResult = Sdmx21Connector.GetArtefacts(SdmxStructureEnumType.Dsd, item.ID, item.Agency, item.Version, StructureReferenceDetailEnumType.None, "Stub");
                var dsdData = objectResult.DataStructures.FirstOrDefault();
                if (dsdData == null)
                {
                    continue;
                }
                foreach (var name in dsdData.Names)
                {
                    item.Names.Add(name.Locale, name.Value);
                }
                item.IsFinal = dsdData.IsFinal.IsTrue;
            }
            return listDsd;
        }

        public List<DsdWithDataflow> GetAllUpgradableDSD(ArtefactIdentity dsd)
        {
            var allDSD = Sdmx21Connector.GetArtefacts(SdmxStructureEnumType.Dsd, null, null, null, StructureReferenceDetailEnumType.None, "Stub");

            var baseVersion = new Version(dsd.Version);

            var avaiableDsd = new List<DsdWithDataflow>();
            foreach (var item in allDSD.DataStructures)
            {
                if (item.IsFinal.IsTrue && item.Id.Equals(dsd.ID) && item.AgencyId.Equals(dsd.Agency) && baseVersion.CompareTo(new Version(item.Version)) < 0)
                {
                    var addItem = new DsdWithDataflow { Agency = item.AgencyId, ID = item.Id, Version = item.Version, EnumType = SdmxStructureEnumType.Dsd };
                    foreach (var name in item.Names)
                    {
                        addItem.Names.Add(name.Locale, name.Value);
                    }
                    addItem.IsFinal = true;
                    avaiableDsd.Add(addItem);
                }
            }

            return avaiableDsd;
        }

        public DsdUpgradeReport UpgradeDSD(DsdReport dsdReport)
        {
            string DDBConnectionString = GetEncodedConnectionString();

            var dsdUpgradeReport = new DsdUpgradeReport();

            dsdUpgradeReport.CubeSuccessfullyUpdated = false;

            //Source DSD
            var arraySourceDsd = dsdReport.SourceDsd.Split('+');
            if (arraySourceDsd.Length < 3)
            {
                throw Utils.getCustomException("UPGRADEDSD_WRONGSOURCEDSD",
                   @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - source DSD format error", Infrastructure.STLogging.Interface.LogLevelEnum.Error);

            }
            var objSourceDsd = Sdmx21Connector.GetArtefacts(SdmxStructureEnumType.Dsd, arraySourceDsd[0], arraySourceDsd[1], arraySourceDsd[2]);
            if (!objSourceDsd.HasDataStructures)
            {
                throw Utils.getCustomException("UPGRADEDSD_NOTFOUNDTARGETDSD",
                   @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - source DSD not found", Infrastructure.STLogging.Interface.LogLevelEnum.Error);
            }

            //Target DSD
            var arrayTargetDsd = dsdReport.TargetDsd.Split('+');
            if (arrayTargetDsd.Length < 3)
            {
                throw Utils.getCustomException("UPGRADEDSD_WRONGTARGETDSD",
                   @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - source DSD format error", Infrastructure.STLogging.Interface.LogLevelEnum.Error);

            }
            var objTargetDsd = Sdmx21Connector.GetArtefacts(SdmxStructureEnumType.Dsd, arrayTargetDsd[0], arrayTargetDsd[1], arrayTargetDsd[2]);
            if (!objTargetDsd.HasDataStructures)
            {
                throw Utils.getCustomException("UPGRADEDSD_NOTFOUNDTARGETDSD",
                   @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - source DSD not found", Infrastructure.STLogging.Interface.LogLevelEnum.Error);
            }
            if (!objTargetDsd.DataStructures.First().IsFinal.IsTrue)
            {
                throw Utils.getCustomException("UPGRADEDSD_NONFINALTARGETDSD",
                   @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - DSD must be Final", Infrastructure.STLogging.Interface.LogLevelEnum.Error);
            }


            popolateCodeFromCodeList(dsdReport);

            dsdReport.HashReport = "DSDCOMPARE";
            var md5Check = Utils.EncodeMD5String(JsonConvert.SerializeObject(dsdReport));
            dsdReport.HashReport = md5Check;
            var resultCompare = DmApiConnector.CompareDSD(dsdReport);
            if (!Convert.ToBoolean(resultCompare))
            {
                return dsdUpgradeReport;
            }

            //Get all dataflow for change DSD (delete and recrete)
            var cubes = JsonConvert.DeserializeObject<List<Cube>>(DmApiConnector.GetAvailableCubesNoFilter());
            //var strResult = DmApiConnector.GetDataFlowsFromDSD(new ArtefactIdentity { ID = arraySourceDsd[0], Agency = arraySourceDsd[1], Version = arraySourceDsd[2] });
            //var dataFlowsId = JsonConvert.DeserializeObject<List<int>>(strResult);

            //Get df from DDB
            var allDataFlow = new List<DDBDataflowWithCols>();
            foreach (var cube in cubes)
            {
                if (cube.DSDCode.Equals(dsdReport.SourceDsd))
                {
                    allDataFlow.AddRange(JsonConvert.DeserializeObject<List<DDBDataflowWithCols>>(GetDDBDataflowsNoFilter(cube.IDCube)));
                }
            }
            //Get df from MSDB
            var dataFlowsMutable = new List<IDataflowMutableObject>();
            foreach (var item in allDataFlow)
            {
                var objDataFlow = Sdmx21Connector.GetArtefacts(SdmxStructureEnumType.Dataflow, item.ID, item.Agency, item.Version);
                if (objDataFlow.HasDataflows)
                {
                    dsdUpgradeReport.NotChanged.Add(new ArtefactIdentity { ID = item.ID, Agency = item.Agency, Version = item.Version });
                    dataFlowsMutable.Add(objDataFlow.Dataflows.First().MutableInstance);
                }
            }


            //Delete dataflow from DDB and MSDB
            var deletedDf = new List<int>();
            try
            {
                foreach (var df in allDataFlow)
                {
                    bool deleted = false;
                    DeleteDDBDataflow(df.IDDataflow, ref deleted);
                    deletedDf.Add(df.IDDataflow);
                    var artId = new ArtefactIdentity { ID = df.ID, Agency = df.Agency, Version = df.Version };
                    dsdUpgradeReport.Deleted.Add(artId);
                    var removeIndex = dsdUpgradeReport.NotChanged.FindIndex(item => item.ID.Equals(artId.ID) && item.Agency.Equals(artId.Agency) && item.Version.Equals(artId.Version));
                    if (removeIndex >= 0)
                    {
                        dsdUpgradeReport.NotChanged.RemoveAt(removeIndex);
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.Log($"Catch error in UpgradeDSD on Delete DataFlow {ex.Message} {ex.StackTrace}", Infrastructure.STLogging.Interface.LogLevelEnum.Error);
                //Only way for transaction operation (recreate all deleted DF in case of any error)
                RollBackDataFlows(allDataFlow, deletedDf, objSourceDsd, dsdUpgradeReport);
                return dsdUpgradeReport;
            }

            //Upgrade Cube
            try
            {
                dsdUpgradeReport.CubeSuccessfullyUpdated = Convert.ToBoolean(DmApiConnector.UpgradeCube(dsdReport));
            }
            catch (Exception)
            {
                dsdUpgradeReport.CubeSuccessfullyUpdated = false;
            }
            if (!dsdUpgradeReport.CubeSuccessfullyUpdated)
            {
                _logger.Log($"Catch error in DmApiConnector.UpgradeCube", Infrastructure.STLogging.Interface.LogLevelEnum.Error);
                //Only way for transaction operation (recreate all deleted DF in case of any error)
                RollBackDataFlows(allDataFlow, deletedDf, objSourceDsd, dsdUpgradeReport);
                return dsdUpgradeReport;
            }


            //Change DSD reference by Dataflow and ReCreate
            var targetDsd = objTargetDsd.DataStructures.First();
            foreach (DDBDataflowWithCols item in allDataFlow)
            {
                var artId = new ArtefactIdentity { ID = item.ID, Agency = item.Agency, Version = item.Version };
                try
                {
                    var dfMutable = dataFlowsMutable.First(df => df.Id == artId.ID && df.AgencyId == artId.Agency && df.Version == artId.Version);
                    //Replace Source DSD with Target DSD
                    dfMutable.DataStructureRef = targetDsd.AsReference;
                    int ddbId = int.Parse(CreateDDBDataflow(item, dfMutable.ImmutableInstance, null, null));

                    //recreating transcoding and content constraint putting df in prodcution if needed
                    IAnnotationMutableObject oldAnn = dfMutable.Annotations.Where(x => x.Type == "NonProductionDataflow").SingleOrDefault();
                    if (oldAnn == null || item.HasContentConstraints || item.HasTranscoding)
                    {
                        CreateMappingSetForDataflow(ddbId, null);

                        if (item.HasContentConstraints || item.HasTranscoding)
                            CreateTranscodingsForDataflow(ddbId);

                        if (item.HasContentConstraints)
                            CreateContentConstraintsForDataflow(ddbId);

                        if (oldAnn == null)
                            SetDataflowProductionFlag(ddbId, false);
                    }

                    //updating report for the method
                    if (ddbId > 0)
                    {
                        dsdUpgradeReport.Upgrade.Add(artId);
                    }
                    else
                    {
                        dsdUpgradeReport.Fail.Add(artId);
                    }
                }
                catch (Exception ex)
                {
                    _logger.Log($"Catch error in Create Upgrade DF. Error: {ex.Message} Stack: {ex.StackTrace}", Infrastructure.STLogging.Interface.LogLevelEnum.Error);
                    dsdUpgradeReport.Fail.Add(artId);
                }
            }

            var associatedCube = false;
            var customDSD = false;
            var dsdSource = objSourceDsd.DataStructures.First();
            var dsdSourceMutable = dsdSource.MutableInstance;
            dsdSourceMutable.Annotations.Clear();

            var associatedCubeAnnotationList = new List<AnnotationMutableCore>();
            foreach (var ann in dsdSource.Annotations)
            {
                if (ann.Type == _nodeConfig.Annotations.AssociatedCube)
                {
                    associatedCube = true;
                    var annotation = new AnnotationMutableCore
                    {
                        Type = _nodeConfig.Annotations.AssociatedCube,
                        Id = ann.Id,
                        Title = DDBConnectionString
                    };
                    associatedCubeAnnotationList.Add(annotation);
                }
                else if (ann.Type == _nodeConfig.Annotations.CustomDSD)
                {
                    customDSD = true;
                }
                else
                {
                    var annotation = new AnnotationMutableCore
                    {
                        Id = ann.Id,
                        Type = ann.Type,
                        Title = ann.Title
                    };
                    foreach (var item in ann.Text)
                    {
                        annotation.AddText(item.Locale, item.Value);
                    }
                    dsdSourceMutable.Annotations.Add(annotation);
                }
            }
            if (associatedCube || customDSD)
            {
                var obj = new SdmxObjectsImpl();
                obj.AddDataStructure(dsdSourceMutable.ImmutableInstance);
                Sdmx21Connector.UpdateArtefacts(obj, false, false, false);
            }


            var dsdTarget = objTargetDsd.DataStructures.First();
            var dsdTargetMutable = dsdTarget.MutableInstance;
            if (associatedCube)
            {
                foreach (AnnotationMutableCore annotation in associatedCubeAnnotationList)
                    dsdTargetMutable.AddAnnotation(annotation);
            }
            if (customDSD)
            {
                var annotation = new AnnotationMutableCore
                {
                    Type = _nodeConfig.Annotations.CustomDSD,
                    Id = _nodeConfig.Annotations.CustomDSD,
                    Title = DDBConnectionString
                };
                dsdTargetMutable.AddAnnotation(annotation);
            }
            if (associatedCube || customDSD)
            {
                var obj = new SdmxObjectsImpl();
                obj.AddDataStructure(dsdTargetMutable.ImmutableInstance);
                Sdmx21Connector.UpdateArtefacts(obj, false, false, false);
            }

            return dsdUpgradeReport;
        }

        public DuplicateArtefactResult DuplicateArtefact(DuplicateArtefactIdentity artefactIdentity)
        {
            var duplicateArtefactResult = new DuplicateArtefactResult();
            var sdmxObject = Sdmx21Connector.GetArtefacts(artefactIdentity.EnumType, artefactIdentity.ID, artefactIdentity.Agency, artefactIdentity.Version, artefactIdentity.CopyReferencedArtefact ? StructureReferenceDetailEnumType.Children : StructureReferenceDetailEnumType.None);

            var checkResult = Sdmx21Connector.CheckDsdReference(sdmxObject.DataStructures, sdmxObject);
            if (checkResult.Count > 0)
            {
                throw Utils.getCustomException("DSD_WITH_NON_FINAL_ARTEFACTS",
                           @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - Cannot create dsd with non final artefacts", Infrastructure.STLogging.Interface.LogLevelEnum.Error);
            }


            if (artefactIdentity.EnumType == SdmxStructureEnumType.ContentConstraint)
            {
                var sdmxObjectParent = Sdmx21Connector.GetArtefacts(artefactIdentity.EnumType, artefactIdentity.ID, artefactIdentity.Agency, artefactIdentity.Version, StructureReferenceDetailEnumType.Parents);
                foreach (var item in sdmxObjectParent.GetAllMaintainables())
                {
                    SdmxUtils.AddItemSdmxObject(item, sdmxObject);
                }
            }

            var targetNodeConfiguration = new ConfigManager(_configuration, _memoryCache).GetConfiguration(artefactIdentity.NodeId);

            targetNodeConfiguration.General.Username = artefactIdentity.Username;
            var base64EncodedBytes = Convert.FromBase64String(artefactIdentity.Password);
            targetNodeConfiguration.General.Password = Encoding.UTF8.GetString(base64EncodedBytes);


            var httpClientHandler = ConfigureProxy(targetNodeConfiguration.Proxy);
            var appConfig = new ConfigManager(_configuration, _memoryCache).GetAppConfig();

            var targetSdmx21Connector = new Sdmx21Connector(targetNodeConfiguration, httpClientHandler, _memoryCache, appConfig, _contextAccessor, false);

            var sdmxTargetObject = targetSdmx21Connector.GetArtefacts(artefactIdentity.EnumType, artefactIdentity.TargetID, artefactIdentity.TargetAgency, artefactIdentity.TargetVersion, StructureReferenceDetailEnumType.None, "Stub");

            var targetObj = sdmxTargetObject.GetAllMaintainables().FirstOrDefault();
            if (targetObj != null && targetObj.IsFinal.IsTrue)
            {
                throw Utils.getCustomException("FINAL_ARTEFACTS_EXIST",
                           @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - Cannot create artefacts, already exist and final.", Infrastructure.STLogging.Interface.LogLevelEnum.Error);
            }

            IMaintainableMutableObject primaryObjectDuplicate = null;
            if (artefactIdentity.CopyReferencedArtefact || artefactIdentity.EnumType == SdmxStructureEnumType.CodeList)
            {
                foreach (var item in sdmxObject.Codelists)
                {
                    if (item.Id.Equals(artefactIdentity.ID) && item.AgencyId.Equals(artefactIdentity.Agency) && item.Version.Equals(artefactIdentity.Version))
                    {
                        primaryObjectDuplicate = item.MutableInstance;
                        continue;
                    }
                    var mutableObject = item.MutableInstance;
                    mutableObject.FinalStructure = TertiaryBool.ParseBoolean(true);
                    targetSdmx21Connector.GetArtefacts(mutableObject.StructureType, mutableObject.Id, mutableObject.AgencyId, mutableObject.Version, StructureReferenceDetailEnumType.None, "Stub");
                    if (targetObj != null && targetObj.IsFinal.IsTrue)
                    {
                        duplicateArtefactResult.ItemsMessage.Add(new ImportedFileResultBase.ItemResult { MaintainableObject = item.Urn.ToString(), Status = "Skip", Result = "Final artefact" });
                        continue;
                    }
                    removeWorkingAnnotation(mutableObject);
                    targetSdmx21Connector.ExecuteRemoteDuplicate(new SdmxObjectsImpl(mutableObject.ImmutableInstance), duplicateArtefactResult);
                }
            }
            if (artefactIdentity.CopyReferencedArtefact || artefactIdentity.EnumType == SdmxStructureEnumType.ConceptScheme)
            {
                foreach (var item in sdmxObject.ConceptSchemes)
                {
                    if (item.Id.Equals(artefactIdentity.ID) && item.AgencyId.Equals(artefactIdentity.Agency) && item.Version.Equals(artefactIdentity.Version))
                    {
                        primaryObjectDuplicate = item.MutableInstance;
                        continue;
                    }
                    var mutableObject = item.MutableInstance;
                    mutableObject.FinalStructure = TertiaryBool.ParseBoolean(true);
                    targetSdmx21Connector.GetArtefacts(mutableObject.StructureType, mutableObject.Id, mutableObject.AgencyId, mutableObject.Version, StructureReferenceDetailEnumType.None, "Stub");
                    if (targetObj != null && targetObj.IsFinal.IsTrue)
                    {
                        duplicateArtefactResult.ItemsMessage.Add(new ImportedFileResultBase.ItemResult { MaintainableObject = item.Urn.ToString(), Status = "Skip", Result = "Final artefact" });
                        continue;
                    }

                    removeWorkingAnnotation(mutableObject);
                    targetSdmx21Connector.ExecuteRemoteDuplicate(new SdmxObjectsImpl(mutableObject.ImmutableInstance), duplicateArtefactResult);
                }
            }
            if (artefactIdentity.CopyReferencedArtefact || artefactIdentity.EnumType == SdmxStructureEnumType.CategoryScheme)
            {
                foreach (var item in sdmxObject.CategorySchemes)
                {
                    if (item.Id.Equals(artefactIdentity.ID) && item.AgencyId.Equals(artefactIdentity.Agency) && item.Version.Equals(artefactIdentity.Version))
                    {
                        primaryObjectDuplicate = item.MutableInstance;
                        continue;
                    }
                    var mutableObject = item.MutableInstance;
                    mutableObject.FinalStructure = TertiaryBool.ParseBoolean(true);
                    targetSdmx21Connector.GetArtefacts(mutableObject.StructureType, mutableObject.Id, mutableObject.AgencyId, mutableObject.Version, StructureReferenceDetailEnumType.None, "Stub");
                    if (targetObj != null && targetObj.IsFinal.IsTrue)
                    {
                        duplicateArtefactResult.ItemsMessage.Add(new ImportedFileResultBase.ItemResult { MaintainableObject = item.Urn.ToString(), Status = "Skip", Result = "Final artefact" });
                        continue;
                    }

                    removeWorkingAnnotation(mutableObject);
                    targetSdmx21Connector.ExecuteRemoteDuplicate(new SdmxObjectsImpl(mutableObject.ImmutableInstance), duplicateArtefactResult);
                }
            }
            if (artefactIdentity.CopyReferencedArtefact || artefactIdentity.EnumType == SdmxStructureEnumType.Dsd)
            {
                foreach (var item in sdmxObject.DataStructures)
                {
                    if (item.Id.Equals(artefactIdentity.ID) && item.AgencyId.Equals(artefactIdentity.Agency) && item.Version.Equals(artefactIdentity.Version))
                    {
                        primaryObjectDuplicate = item.MutableInstance;
                        continue;
                    }
                    var mutableObject = item.MutableInstance;
                    mutableObject.FinalStructure = TertiaryBool.ParseBoolean(true);
                    targetSdmx21Connector.GetArtefacts(mutableObject.StructureType, mutableObject.Id, mutableObject.AgencyId, mutableObject.Version, StructureReferenceDetailEnumType.None, "Stub");
                    if (targetObj != null && targetObj.IsFinal.IsTrue)
                    {
                        duplicateArtefactResult.ItemsMessage.Add(new ImportedFileResultBase.ItemResult { MaintainableObject = item.Urn.ToString(), Status = "Skip", Result = "Final artefact" });
                        continue;
                    }

                    removeWorkingAnnotation(mutableObject);
                    targetSdmx21Connector.ExecuteRemoteDuplicate(new SdmxObjectsImpl(mutableObject.ImmutableInstance), duplicateArtefactResult);
                }
            }
            if (artefactIdentity.CopyReferencedArtefact || artefactIdentity.EnumType == SdmxStructureEnumType.AgencyScheme)
            {
                foreach (var item in sdmxObject.AgenciesSchemes)
                {
                    if (item.Id.Equals(artefactIdentity.ID) && item.AgencyId.Equals(artefactIdentity.Agency) && item.Version.Equals(artefactIdentity.Version))
                    {
                        primaryObjectDuplicate = item.MutableInstance;
                        continue;
                    }
                    var mutableObject = item.MutableInstance;
                    targetSdmx21Connector.GetArtefacts(mutableObject.StructureType, mutableObject.Id, mutableObject.AgencyId, mutableObject.Version, StructureReferenceDetailEnumType.None, "Stub");
                    if (targetObj != null && targetObj.IsFinal.IsTrue)
                    {
                        duplicateArtefactResult.ItemsMessage.Add(new ImportedFileResultBase.ItemResult { MaintainableObject = item.Urn.ToString(), Status = "Skip", Result = "Final artefact" });
                        continue;
                    }

                    removeWorkingAnnotation(mutableObject);
                    targetSdmx21Connector.ExecuteRemoteDuplicate(new SdmxObjectsImpl(mutableObject.ImmutableInstance), duplicateArtefactResult);
                }
            }
            if (artefactIdentity.CopyReferencedArtefact || artefactIdentity.EnumType == SdmxStructureEnumType.DataProviderScheme)
            {
                foreach (var item in sdmxObject.DataProviderSchemes)
                {
                    if (item.Id.Equals(artefactIdentity.ID) && item.AgencyId.Equals(artefactIdentity.Agency) && item.Version.Equals(artefactIdentity.Version))
                    {
                        primaryObjectDuplicate = item.MutableInstance;
                        continue;
                    }
                    var mutableObject = item.MutableInstance;
                    targetSdmx21Connector.GetArtefacts(mutableObject.StructureType, mutableObject.Id, mutableObject.AgencyId, mutableObject.Version, StructureReferenceDetailEnumType.None, "Stub");
                    if (targetObj != null && targetObj.IsFinal.IsTrue)
                    {
                        duplicateArtefactResult.ItemsMessage.Add(new ImportedFileResultBase.ItemResult { MaintainableObject = item.Urn.ToString(), Status = "Skip", Result = "Final artefact" });
                        continue;
                    }

                    removeWorkingAnnotation(mutableObject);
                    targetSdmx21Connector.ExecuteRemoteDuplicate(new SdmxObjectsImpl(mutableObject.ImmutableInstance), duplicateArtefactResult);
                }
            }
            if (artefactIdentity.CopyReferencedArtefact || artefactIdentity.EnumType == SdmxStructureEnumType.DataConsumerScheme)
            {
                foreach (var item in sdmxObject.DataConsumerSchemes)
                {
                    if (item.Id.Equals(artefactIdentity.ID) && item.AgencyId.Equals(artefactIdentity.Agency) && item.Version.Equals(artefactIdentity.Version))
                    {
                        primaryObjectDuplicate = item.MutableInstance;
                        continue;
                    }
                    var mutableObject = item.MutableInstance;
                    targetSdmx21Connector.GetArtefacts(mutableObject.StructureType, mutableObject.Id, mutableObject.AgencyId, mutableObject.Version, StructureReferenceDetailEnumType.None, "Stub");
                    if (targetObj != null && targetObj.IsFinal.IsTrue)
                    {
                        duplicateArtefactResult.ItemsMessage.Add(new ImportedFileResultBase.ItemResult { MaintainableObject = item.Urn.ToString(), Status = "Skip", Result = "Final artefact" });
                        continue;
                    }

                    removeWorkingAnnotation(mutableObject);
                    targetSdmx21Connector.ExecuteRemoteDuplicate(new SdmxObjectsImpl(mutableObject.ImmutableInstance), duplicateArtefactResult);
                }
            }
            //if (artefactIdentity.CopyReferencedArtefact || artefactIdentity.EnumType == SdmxStructureEnumType.OrganisationUnitScheme)
            //{
            //    foreach (var item in sdmxObject.OrganisationUnitSchemes)
            //    {
            //        if (item.Id.Equals(artefactIdentity.ID) && item.AgencyId.Equals(artefactIdentity.Agency) && item.Version.Equals(artefactIdentity.Version))
            //        {
            //            primaryObjectDuplicate = item.MutableInstance;
            //            continue;
            //        }
            //        var mutableObject = item.MutableInstance;
            //        targetSdmx21Connector.GetArtefacts(mutableObject.StructureType, mutableObject.Id, mutableObject.AgencyId, mutableObject.Version, StructureReferenceDetailEnumType.None, "Stub");
            //        if (targetObj != null && targetObj.IsFinal.IsTrue)
            //        {
            //            duplicateArtefactResult.ItemsMessage.Add(new ImportedFileResultBase.ItemResult { MaintainableObject = item.Urn.ToString(), Status = "Skip", Result = "Final artefact" });
            //            continue;
            //        }

            //        removeWorkingAnnotation(mutableObject);
            //        targetSdmx21Connector.ExecuteRemoteDuplicate(new SdmxObjectsImpl(mutableObject.ImmutableInstance), duplicateArtefactResult);
            //    }
            //}
            if (artefactIdentity.CopyReferencedArtefact || artefactIdentity.EnumType == SdmxStructureEnumType.StructureSet)
            {
                foreach (var item in sdmxObject.StructureSets)
                {
                    if (item.Id.Equals(artefactIdentity.ID) && item.AgencyId.Equals(artefactIdentity.Agency) && item.Version.Equals(artefactIdentity.Version))
                    {
                        primaryObjectDuplicate = item.MutableInstance;
                        continue;
                    }
                    var mutableObject = item.MutableInstance;
                    mutableObject.FinalStructure = TertiaryBool.ParseBoolean(true);
                    targetSdmx21Connector.GetArtefacts(mutableObject.StructureType, mutableObject.Id, mutableObject.AgencyId, mutableObject.Version, StructureReferenceDetailEnumType.None, "Stub");
                    if (targetObj != null && targetObj.IsFinal.IsTrue)
                    {
                        duplicateArtefactResult.ItemsMessage.Add(new ImportedFileResultBase.ItemResult { MaintainableObject = item.Urn.ToString(), Status = "Skip", Result = "Final artefact" });
                        continue;
                    }

                    removeWorkingAnnotation(mutableObject);
                    targetSdmx21Connector.ExecuteRemoteDuplicate(new SdmxObjectsImpl(mutableObject.ImmutableInstance), duplicateArtefactResult);
                }
            }
            if (artefactIdentity.CopyReferencedArtefact || artefactIdentity.EnumType == SdmxStructureEnumType.ContentConstraint)
            {
                foreach (var item in sdmxObject.ContentConstraintObjects)
                {
                    if (item.Id.Equals(artefactIdentity.ID) && item.AgencyId.Equals(artefactIdentity.Agency) && item.Version.Equals(artefactIdentity.Version))
                    {
                        primaryObjectDuplicate = item.MutableInstance;
                        continue;
                    }
                    var mutableObject = item.MutableInstance;
                    mutableObject.FinalStructure = TertiaryBool.ParseBoolean(true);
                    targetSdmx21Connector.GetArtefacts(mutableObject.StructureType, mutableObject.Id, mutableObject.AgencyId, mutableObject.Version, StructureReferenceDetailEnumType.None, "Stub");
                    if (targetObj != null && targetObj.IsFinal.IsTrue)
                    {
                        duplicateArtefactResult.ItemsMessage.Add(new ImportedFileResultBase.ItemResult { MaintainableObject = item.Urn.ToString(), Status = "Skip", Result = "Final artefact" });
                        continue;
                    }

                    removeWorkingAnnotation(mutableObject);
                    targetSdmx21Connector.ExecuteRemoteDuplicate(new SdmxObjectsImpl(mutableObject.ImmutableInstance), duplicateArtefactResult);
                }
            }
            if (artefactIdentity.CopyReferencedArtefact || artefactIdentity.EnumType == SdmxStructureEnumType.HierarchicalCodelist)
            {
                foreach (var item in sdmxObject.HierarchicalCodelists)
                {
                    if (item.Id.Equals(artefactIdentity.ID) && item.AgencyId.Equals(artefactIdentity.Agency) && item.Version.Equals(artefactIdentity.Version))
                    {
                        primaryObjectDuplicate = item.MutableInstance;
                        continue;
                    }
                    var mutableObject = item.MutableInstance;
                    mutableObject.FinalStructure = TertiaryBool.ParseBoolean(true);
                    targetSdmx21Connector.GetArtefacts(mutableObject.StructureType, mutableObject.Id, mutableObject.AgencyId, mutableObject.Version, StructureReferenceDetailEnumType.None, "Stub");
                    if (targetObj != null && targetObj.IsFinal.IsTrue)
                    {
                        duplicateArtefactResult.ItemsMessage.Add(new ImportedFileResultBase.ItemResult { MaintainableObject = item.Urn.ToString(), Status = "Skip", Result = "Final artefact" });
                        continue;
                    }

                    removeWorkingAnnotation(mutableObject);
                    targetSdmx21Connector.ExecuteRemoteDuplicate(new SdmxObjectsImpl(mutableObject.ImmutableInstance), duplicateArtefactResult);
                }
            }
            if (artefactIdentity.CopyReferencedArtefact || artefactIdentity.EnumType == SdmxStructureEnumType.Dataflow)
            {
                foreach (var item in sdmxObject.Dataflows)
                {
                    if (item.Id.Equals(artefactIdentity.ID) && item.AgencyId.Equals(artefactIdentity.Agency) && item.Version.Equals(artefactIdentity.Version))
                    {
                        primaryObjectDuplicate = item.MutableInstance;
                        continue;
                    }
                    var mutableObject = item.MutableInstance;
                    mutableObject.FinalStructure = TertiaryBool.ParseBoolean(true);
                    targetSdmx21Connector.GetArtefacts(mutableObject.StructureType, mutableObject.Id, mutableObject.AgencyId, mutableObject.Version, StructureReferenceDetailEnumType.None, "Stub");
                    if (targetObj != null && targetObj.IsFinal.IsTrue)
                    {
                        duplicateArtefactResult.ItemsMessage.Add(new ImportedFileResultBase.ItemResult { MaintainableObject = item.Urn.ToString(), Status = "Skip", Result = "Final artefact" });
                        continue;
                    }

                    removeWorkingAnnotation(mutableObject);
                    targetSdmx21Connector.ExecuteRemoteDuplicate(new SdmxObjectsImpl(mutableObject.ImmutableInstance), duplicateArtefactResult);

                    DmApiConnector.AssignDataflowFirstOwnership($"{artefactIdentity.TargetID}+{artefactIdentity.TargetAgency }+{artefactIdentity.TargetVersion}", Utils.GetUsername(_contextAccessor.HttpContext.User.Identity));
                }
            }
            if (artefactIdentity.CopyReferencedArtefact || artefactIdentity.EnumType == SdmxStructureEnumType.Msd)
            {
                foreach (var item in sdmxObject.MetadataStructures)
                {
                    if (item.Id.Equals(artefactIdentity.ID) && item.AgencyId.Equals(artefactIdentity.Agency) && item.Version.Equals(artefactIdentity.Version))
                    {
                        primaryObjectDuplicate = item.MutableInstance;
                        continue;
                    }
                    var mutableObject = item.MutableInstance;
                    mutableObject.FinalStructure = TertiaryBool.ParseBoolean(true);
                    targetSdmx21Connector.GetArtefacts(mutableObject.StructureType, mutableObject.Id, mutableObject.AgencyId, mutableObject.Version, StructureReferenceDetailEnumType.None, "Stub");
                    if (targetObj != null && targetObj.IsFinal.IsTrue)
                    {
                        duplicateArtefactResult.ItemsMessage.Add(new ImportedFileResultBase.ItemResult { MaintainableObject = item.Urn.ToString(), Status = "Skip", Result = "Final artefact" });
                        continue;
                    }

                    removeWorkingAnnotation(mutableObject);
                    targetSdmx21Connector.ExecuteRemoteDuplicate(new SdmxObjectsImpl(mutableObject.ImmutableInstance), duplicateArtefactResult);
                }
            }
            if (artefactIdentity.CopyReferencedArtefact || artefactIdentity.EnumType == SdmxStructureEnumType.MetadataFlow)
            {
                foreach (var item in sdmxObject.Metadataflows)
                {
                    if (item.Id.Equals(artefactIdentity.ID) && item.AgencyId.Equals(artefactIdentity.Agency) && item.Version.Equals(artefactIdentity.Version))
                    {
                        primaryObjectDuplicate = item.MutableInstance;
                        continue;
                    }
                    var mutableObject = item.MutableInstance;
                    mutableObject.FinalStructure = TertiaryBool.ParseBoolean(true);
                    targetSdmx21Connector.GetArtefacts(mutableObject.StructureType, mutableObject.Id, mutableObject.AgencyId, mutableObject.Version, StructureReferenceDetailEnumType.None, "Stub");
                    if (targetObj != null && targetObj.IsFinal.IsTrue)
                    {
                        duplicateArtefactResult.ItemsMessage.Add(new ImportedFileResultBase.ItemResult { MaintainableObject = item.Urn.ToString(), Status = "Skip", Result = "Final artefact" });
                        continue;
                    }

                    removeWorkingAnnotation(mutableObject);
                    targetSdmx21Connector.ExecuteRemoteDuplicate(new SdmxObjectsImpl(mutableObject.ImmutableInstance), duplicateArtefactResult);

                    DmApiConnector.AssignMetadataFlowFirstOwnership($"{artefactIdentity.TargetID}+{artefactIdentity.TargetAgency }+{artefactIdentity.TargetVersion}", Utils.GetUsername(_contextAccessor.HttpContext.User.Identity));
                }
            }


            removeWorkingAnnotation(primaryObjectDuplicate);
            primaryObjectDuplicate.Id = artefactIdentity.TargetID;
            primaryObjectDuplicate.AgencyId = artefactIdentity.TargetAgency;
            primaryObjectDuplicate.Version = artefactIdentity.TargetVersion;
            targetSdmx21Connector.ExecuteRemoteDuplicate(new SdmxObjectsImpl(primaryObjectDuplicate.ImmutableInstance), duplicateArtefactResult);

            duplicateArtefactResult.ItemsMessage = duplicateArtefactResult.ItemsMessage.Where(i => !i.Status.Contains("warning", StringComparison.InvariantCultureIgnoreCase)).ToList();

            return duplicateArtefactResult;
        }

        private void removeWorkingAnnotation(IMaintainableMutableObject maintainable)
        {
            var deleteCodelistItem = new List<IAnnotationMutableObject>();
            foreach (var iAnn in maintainable.Annotations)
            {
                if (iAnn.Type != null && (iAnn.Type.ToLowerInvariant().Equals(_nodeConfig.Annotations.AssociatedCube.ToLowerInvariant())
                                            || iAnn.Type.ToLowerInvariant().Equals(_nodeConfig.Annotations.CustomDSD.ToLowerInvariant())
                                            || iAnn.Type.ToLowerInvariant().Equals(_nodeConfig.Annotations.DDBDataflow.ToLowerInvariant())
                                            || iAnn.Type.ToLowerInvariant().Equals(_nodeConfig.Annotations.HaveMetadata.ToLowerInvariant())
                                            || iAnn.Type.ToLowerInvariant().Equals(_nodeConfig.Annotations.Metadataset.ToLowerInvariant())
                                            || iAnn.Type.ToLowerInvariant().Equals(_nodeConfig.Annotations.Changed.ToLowerInvariant())))
                {
                    deleteCodelistItem.Add(iAnn);
                }
            }
            foreach (var annotation in deleteCodelistItem)
            {
                maintainable.Annotations.Remove(annotation);
            }
        }

        private void CalltargetSdmx(IMaintainableObject maintainableObject)
        {

        }

        public bool CloneCodelist(string id, string agencyID, string version, string newId, string newAgencyID, string newVersion)
        {
            var sdmxObject = Sdmx21Connector.GetArtefacts(SdmxStructureEnumType.CodeList, id, agencyID, version);

            var codeList = sdmxObject.Codelists.First().MutableInstance;
            codeList.Id = newId;
            codeList.AgencyId = newAgencyID;
            codeList.Version = newVersion;
            codeList.FinalStructure = TertiaryBool.ParseBoolean(false);

            var deleteCodelistItem = new List<IAnnotationMutableObject>();
            foreach (var iAnn in codeList.Annotations)
            {
                if (iAnn.Type != null && (iAnn.Type.ToLowerInvariant().Equals(_nodeConfig.Annotations.AssociatedCube.ToLowerInvariant())
                                            || iAnn.Type.ToLowerInvariant().Equals(_nodeConfig.Annotations.CustomDSD.ToLowerInvariant())
                                            || iAnn.Type.ToLowerInvariant().Equals(_nodeConfig.Annotations.DDBDataflow.ToLowerInvariant())
                                            || iAnn.Type.ToLowerInvariant().Equals(_nodeConfig.Annotations.HaveMetadata.ToLowerInvariant())
                                            || iAnn.Type.ToLowerInvariant().Equals(_nodeConfig.Annotations.Metadataset.ToLowerInvariant())
                                            || iAnn.Type.ToLowerInvariant().Equals(_nodeConfig.Annotations.Changed.ToLowerInvariant())))
                {
                    deleteCodelistItem.Add(iAnn);
                }
            }
            foreach (var annotation in deleteCodelistItem)
            {
                codeList.Annotations.Remove(annotation);
            }

            //foreach (var item in codeList.Items)
            //{
            //    var deleteItem = new List<IAnnotationMutableObject>();
            //    foreach (var iAnn in item.Annotations)
            //    {
            //        if (iAnn.Type != null && iAnn.Type.Equals(_nodeConfig.Order.CodelistsOrderAnnotation))
            //        {
            //            deleteItem.Add(iAnn);
            //        }
            //    }
            //    foreach (var annotation in deleteItem)
            //    {
            //        item.Annotations.Remove(annotation);
            //    }
            //}

            var sdmxObjectNew = new SdmxObjectsImpl();
            sdmxObjectNew.AddCodelist(codeList.ImmutableInstance);
            return Sdmx21Connector.CreateArtefacts(sdmxObjectNew);
        }

        public void RemoveTempTable()
        {
            DmApiConnector.RemoveTempTable();
        }

        private void RollBackDataFlows(List<DDBDataflowWithCols> allDataFlow, List<int> deletedDf, ISdmxObjects sdmxObjects, DsdUpgradeReport dsdUpgradeReport)
        {
            foreach (var id in deletedDf)
            {
                var ddbDf = allDataFlow.First(item => item.IDDataflow == id);
                var sdmxDf = sdmxObjects.Dataflows.First(item => item.Id.Equals(ddbDf.ID) && item.AgencyId.Equals(ddbDf.Agency) && item.Version.Equals(ddbDf.Version));

                try
                {
                    CreateDDBDataflow(ddbDf, sdmxDf, null, null);
                    dsdUpgradeReport.ReCreated.Add(new ArtefactIdentity { ID = ddbDf.ID, Agency = ddbDf.Agency, Version = ddbDf.Version });
                }
                catch (Exception)
                {
                    _logger.Log($"Catch error in ReCreate DF", Infrastructure.STLogging.Interface.LogLevelEnum.Error);
                    dsdUpgradeReport.Fail.Add(new ArtefactIdentity { ID = ddbDf.ID, Agency = ddbDf.Agency, Version = ddbDf.Version });
                }
            }
        }

        private void popolateCodeFromCodeList(DsdReport dsdReport)
        {
            var artefactIdentity = new List<ArtefactIdentity>();

            //Get all CodeList Difference used in DSDReport
            foreach (var item in dsdReport.DifferenceAttributes)
            {
                if (item.Target != null)
                {
                    artefactIdentity.Add(new ArtefactIdentity { Agency = item.Target.AgencyId, ID = item.Target.ID, Version = item.Target.Version, EnumType = SdmxStructureEnumType.CodeList });
                }
            }
            foreach (var item in dsdReport.DifferenceDimensions)
            {
                if (item.Target != null)
                {
                    artefactIdentity.Add(new ArtefactIdentity { Agency = item.Target.AgencyId, ID = item.Target.ID, Version = item.Target.Version, EnumType = SdmxStructureEnumType.CodeList });
                }
            }

            var itemsCodeListToSync = new Dictionary<string, List<string>>();

            //Take all items CodeList inside of MSDB
            foreach (var codeList in artefactIdentity)
            {
                var tmpObj = Sdmx21Connector.GetArtefacts(SdmxStructureEnumType.CodeList, codeList.ID, codeList.Agency, codeList.Version);
                if (tmpObj == null)
                {
                    continue;
                }
                var msdbCodeList = tmpObj.Codelists.FirstOrDefault();
                if (msdbCodeList == null)
                {
                    continue;
                }

                var key = $"{msdbCodeList.Id}+{msdbCodeList.AgencyId}+{msdbCodeList.Version}";
                if (!itemsCodeListToSync.ContainsKey(key))
                {
                    itemsCodeListToSync.Add(key, new List<string>());
                    foreach (var msdbItem in msdbCodeList.Items)
                    {
                        itemsCodeListToSync[key].Add(msdbItem.Id.ToUpperInvariant());
                    }
                }
            }

            //Insert in DSDReport the Codes for each CodeList
            foreach (var item in dsdReport.DifferenceAttributes)
            {
                if (item.Target != null)
                {
                    var key = $"{item.Target.ID}+{item.Target.AgencyId}+{item.Target.Version}";
                    if (itemsCodeListToSync.ContainsKey(key))
                    {
                        item.Code = itemsCodeListToSync[key];
                    }
                }
            }
            foreach (var item in dsdReport.DifferenceDimensions)
            {
                if (item.Target != null)
                {
                    var key = $"{item.Target.ID}+{item.Target.AgencyId}+{item.Target.Version}";
                    if (itemsCodeListToSync.ContainsKey(key))
                    {
                        item.Code = itemsCodeListToSync[key];
                    }
                }
            }
        }

        public bool CompareDSD(ArtefactCompare sourceDsd, ArtefactCompare targetDsd)
        {
            var dsdReport = GenerateReportDSD(sourceDsd, targetDsd, true, true);
            return commonCompareDSD(dsdReport);
        }

        public bool CompareDSD(DsdReport dsdReport)
        {
            return commonCompareDSD(dsdReport);
        }

        public List<string> GetFieldForCube(int idCube)
        {
            var str = DmApiConnector.GetFieldForCube(idCube);
            return JsonConvert.DeserializeObject<List<string>>(str);
        }

        public string GetSeriesForCube(int idCube, DDBDataflow ddbDataflow)
        {
            return DmApiConnector.GetSeriesForCube(idCube, ddbDataflow);
        }

        public void DeleteSeriesForCube(int idCube, List<int> sId)
        {
            DmApiConnector.DeleteSeriesForCube(idCube, sId);
        }

        private bool commonCompareDSD(DsdReport dsdReport)
        {
            dsdReport.HashReport = "DSDCOMPARE";
            var md5Check = Utils.EncodeMD5String(JsonConvert.SerializeObject(dsdReport));
            dsdReport.HashReport = md5Check;
            var result = DmApiConnector.CompareDSD(dsdReport);
            return Convert.ToBoolean(result);
        }

        private void commonGenerateFileReport(MemoryStream ms, List<DsdReport.IdentityKey> sourceAll, List<DsdReport.IdentityKey> target, List<DsdReport.IdentityKey> source, List<DsdReport.Difference> difference, List<DsdReport.Difference> differenceConceptScheme, string type, string lang)
        {
            Byte[] info;
            var newline = Encoding.ASCII.GetBytes(Environment.NewLine);
            ms.Write(newline, 0, newline.Length);
            ms.Write(newline, 0, newline.Length);

            var line = Encoding.ASCII.GetBytes("--------------------------------------------------------");
            ms.Write(line, 0, line.Length);

            if (sourceAll != null && sourceAll.Count > 0)
            {
                ms.Write(newline, 0, newline.Length);
                ms.Write(newline, 0, newline.Length);
                info = new UTF8Encoding(true).GetBytes($"{type}s in Source: ");
                ms.Write(info, 0, info.Length);
                ms.Write(newline, 0, newline.Length);
                foreach (var itemSource in sourceAll)
                {
                    var mandatory = type.Equals("Attribute") && itemSource.Mandatory ? " [M]" : "";
                    info = new UTF8Encoding(true).GetBytes($"\t{itemSource.Key}{mandatory}: ");
                    ms.Write(info, 0, info.Length);
                    var sourceAttr = itemSource.ReferenceIdentity != null ? $"{itemSource.ReferenceIdentity.ID}+{itemSource.ReferenceIdentity.AgencyId}+{itemSource.ReferenceIdentity.Version}{getLocalizedName(itemSource.ReferenceIdentity.Names, lang)}" : $" No Codelist";
                    info = new UTF8Encoding(true).GetBytes(sourceAttr);
                    ms.Write(info, 0, info.Length);
                    ms.Write(newline, 0, newline.Length);
                }
            }

            //Missing Source
            if (target != null)
            {
                ms.Write(newline, 0, newline.Length);
                info = new UTF8Encoding(true).GetBytes($"\t{type}s missing in source: ");
                ms.Write(info, 0, info.Length);
                if (target.Count > 0)
                {
                    foreach (var itemTarget in target)
                    {
                        ms.Write(newline, 0, newline.Length);
                        var mandatory = type.Equals("Attribute") && itemTarget.Mandatory ? " [M]" : "";
                        info = new UTF8Encoding(true).GetBytes($"\t\t{itemTarget.Key}{mandatory}: ");
                        ms.Write(info, 0, info.Length);
                        var sourceAttr = itemTarget.ReferenceIdentity != null ? $"{itemTarget.ReferenceIdentity.ID}+{itemTarget.ReferenceIdentity.AgencyId}+{itemTarget.ReferenceIdentity.Version}" : $" No Codelist";
                        info = new UTF8Encoding(true).GetBytes(sourceAttr);
                        ms.Write(info, 0, info.Length);
                    }
                }
                else
                {
                    ms.Write(newline, 0, newline.Length);
                    info = new UTF8Encoding(true).GetBytes($"\t\t- No Difference ");
                    ms.Write(info, 0, info.Length);
                }
                ms.Write(newline, 0, newline.Length);
                ms.Write(newline, 0, newline.Length);
            }

            //Missing Target
            if (source != null)
            {
                info = new UTF8Encoding(true).GetBytes($"\t{type}s missing in target: ");
                ms.Write(info, 0, info.Length);
                if (source.Count > 0)
                {
                    foreach (var itemSource in source)
                    {
                        ms.Write(newline, 0, newline.Length);
                        var mandatory = type.Equals("Attribute") && itemSource.Mandatory ? " [M]" : "";
                        info = new UTF8Encoding(true).GetBytes($"\t\t{itemSource.Key}{mandatory}: ");
                        ms.Write(info, 0, info.Length);
                        var sourceAttr = itemSource.ReferenceIdentity != null ? $"{itemSource.ReferenceIdentity.ID}+{itemSource.ReferenceIdentity.AgencyId}+{itemSource.ReferenceIdentity.Version}" : $" No Codelist";
                        info = new UTF8Encoding(true).GetBytes(sourceAttr);
                        ms.Write(info, 0, info.Length);
                    }
                }
                else
                {
                    ms.Write(newline, 0, newline.Length);
                    info = new UTF8Encoding(true).GetBytes($"\t\t- No Difference ");
                    ms.Write(info, 0, info.Length);
                }
                ms.Write(newline, 0, newline.Length);
                ms.Write(newline, 0, newline.Length);
            }

            //Difference Codelist
            if (difference != null)
            {
                info = new UTF8Encoding(true).GetBytes($"\tDifference Codelist {type}:");
                ms.Write(info, 0, info.Length);
                if (difference.Count > 0)
                {
                    foreach (var itemDifference in difference)
                    {
                        ms.Write(newline, 0, newline.Length);

                        info = new UTF8Encoding(true).GetBytes($"\t\t{itemDifference.Key}: ");
                        ms.Write(info, 0, info.Length);

                        var sourceAttr = itemDifference.Source != null ? $"{itemDifference.Source.ID}+{itemDifference.Source.AgencyId}+{itemDifference.Source.Version}{getLocalizedName(itemDifference.Source.Names, lang)}" : $" No Codelist";
                        info = new UTF8Encoding(true).GetBytes(sourceAttr);
                        ms.Write(info, 0, info.Length);

                        var targetAttr = itemDifference.Target != null ? $" - {itemDifference?.Target.ID}+{itemDifference?.Target.AgencyId}+{itemDifference?.Target.Version}{getLocalizedName(itemDifference.Target.Names, lang)}" : " - No Codelist";
                        info = new UTF8Encoding(true).GetBytes(targetAttr);
                        ms.Write(info, 0, info.Length);

                        if (itemDifference.CodelistCompare != null && itemDifference.CodelistCompare.TargetItem.Count > 0)
                        {
                            ms.Write(newline, 0, newline.Length);
                            info = new UTF8Encoding(true).GetBytes($"\t\t\t\tMissing item in Source: " + Environment.NewLine);
                            ms.Write(info, 0, info.Length);
                            foreach (var item in itemDifference.CodelistCompare.TargetItem)
                            {
                                info = new UTF8Encoding(true).GetBytes($"\t\t\t\t\t[{item.Id}]: {getLocalizedName(item.Names, lang)} " + Environment.NewLine);
                                ms.Write(info, 0, info.Length);
                            }
                        }
                        if (itemDifference.CodelistCompare != null && itemDifference.CodelistCompare.SourceItem.Count > 0)
                        {
                            ms.Write(newline, 0, newline.Length);
                            info = new UTF8Encoding(true).GetBytes($"\t\t\t\tMissing item in Target: " + Environment.NewLine);
                            ms.Write(info, 0, info.Length);
                            foreach (var item in itemDifference.CodelistCompare.SourceItem)
                            {
                                info = new UTF8Encoding(true).GetBytes($"\t\t\t\t\t[{item.Id}]: {getLocalizedName(item.Names, lang)} " + Environment.NewLine);
                                ms.Write(info, 0, info.Length);
                            }
                        }
                        ms.Write(newline, 0, newline.Length);
                    }
                }
                else
                {
                    ms.Write(newline, 0, newline.Length);
                    info = new UTF8Encoding(true).GetBytes($"\t\t- No Difference ");
                    ms.Write(info, 0, info.Length);
                }
                ms.Write(newline, 0, newline.Length);
                ms.Write(newline, 0, newline.Length);
            }

            //Difference ConceptScheme
            if (differenceConceptScheme != null)
            {
                info = new UTF8Encoding(true).GetBytes($"\tDifference Concept {type}:");
                ms.Write(info, 0, info.Length);
                if (differenceConceptScheme.Count > 0)
                {
                    foreach (var itemDiffConcept in differenceConceptScheme)
                    {
                        ms.Write(newline, 0, newline.Length);
                        info = new UTF8Encoding(true).GetBytes($"\t\t{itemDiffConcept.Key}: ");
                        ms.Write(info, 0, info.Length);

                        var sourceAttr = itemDiffConcept.Source != null ? $"{itemDiffConcept.Source.ID}+{itemDiffConcept.Source.AgencyId}+{itemDiffConcept.Source.Version}" : $" No Concept";
                        info = new UTF8Encoding(true).GetBytes(sourceAttr);
                        ms.Write(info, 0, info.Length);

                        var targetAttr = itemDiffConcept.Target != null ? $" - {itemDiffConcept?.Target.ID}+{itemDiffConcept?.Target.AgencyId}+{itemDiffConcept?.Target.Version}" : " - No Concept";
                        info = new UTF8Encoding(true).GetBytes(targetAttr);
                        ms.Write(info, 0, info.Length);
                    }
                }
                else
                {
                    ms.Write(newline, 0, newline.Length);
                    info = new UTF8Encoding(true).GetBytes($"\t\t- No Difference ");
                    ms.Write(info, 0, info.Length);
                }
            }

            ms.Write(newline, 0, newline.Length);
        }

        private void groupGenerateFileReport(MemoryStream ms, List<DsdReport.IdentityKey> sourceAll, List<DsdReport.IdentityKey> target, List<DsdReport.IdentityKey> source, List<DsdReport.Difference> difference, string lang)
        {
            var type = "Group";
            Byte[] info;
            var newline = Encoding.ASCII.GetBytes(Environment.NewLine);
            ms.Write(newline, 0, newline.Length);
            ms.Write(newline, 0, newline.Length);

            var line = Encoding.ASCII.GetBytes("--------------------------------------------------------");
            ms.Write(line, 0, line.Length);

            if (sourceAll != null && sourceAll.Count > 0)
            {
                ms.Write(newline, 0, newline.Length);
                ms.Write(newline, 0, newline.Length);
                info = new UTF8Encoding(true).GetBytes($"{type}s in Source: ");
                ms.Write(info, 0, info.Length);
                ms.Write(newline, 0, newline.Length);
                foreach (var itemSource in sourceAll)
                {
                    var mandatory = type.Equals("Attribute") && itemSource.Mandatory ? " [M]" : "";
                    info = new UTF8Encoding(true).GetBytes($"\t{itemSource.Key}{mandatory}: ");
                    ms.Write(info, 0, info.Length);
                    ms.Write(newline, 0, newline.Length);
                    foreach (var itemGrp in itemSource.ItemsGroup)
                    {
                        info = new UTF8Encoding(true).GetBytes($"\t\t{itemGrp}");
                        ms.Write(info, 0, info.Length);
                        ms.Write(newline, 0, newline.Length);
                    }
                }
            }

            //Missing Source
            if (target != null)
            {
                ms.Write(newline, 0, newline.Length);
                info = new UTF8Encoding(true).GetBytes($"\t{type}s missing in source: ");
                ms.Write(info, 0, info.Length);
                if (target.Count > 0)
                {
                    foreach (var itemTarget in target)
                    {
                        ms.Write(newline, 0, newline.Length);
                        var mandatory = type.Equals("Attribute") && itemTarget.Mandatory ? " [M]" : "";
                        info = new UTF8Encoding(true).GetBytes($"\t\t{itemTarget.Key}{mandatory}: ");
                        ms.Write(info, 0, info.Length);
                        ms.Write(newline, 0, newline.Length);
                        foreach (var itemGrp in itemTarget.ItemsGroup)
                        {
                            info = new UTF8Encoding(true).GetBytes($"\t\t\t{itemGrp}");
                            ms.Write(info, 0, info.Length);
                            ms.Write(newline, 0, newline.Length);
                        }
                    }
                }
                else
                {
                    ms.Write(newline, 0, newline.Length);
                    info = new UTF8Encoding(true).GetBytes($"\t\t- No Difference ");
                    ms.Write(info, 0, info.Length);
                }
                ms.Write(newline, 0, newline.Length);
                ms.Write(newline, 0, newline.Length);
            }

            //Missing Target
            if (source != null)
            {
                info = new UTF8Encoding(true).GetBytes($"\t{type}s missing in target: ");
                ms.Write(info, 0, info.Length);
                if (source.Count > 0)
                {
                    foreach (var itemSource in source)
                    {
                        ms.Write(newline, 0, newline.Length);
                        var mandatory = type.Equals("Attribute") && itemSource.Mandatory ? " [M]" : "";
                        info = new UTF8Encoding(true).GetBytes($"\t\t{itemSource.Key}{mandatory}: ");
                        ms.Write(info, 0, info.Length);
                        ms.Write(newline, 0, newline.Length);
                        foreach (var itemGrp in itemSource.ItemsGroup)
                        {
                            info = new UTF8Encoding(true).GetBytes($"\t\t\t{itemGrp}");
                            ms.Write(info, 0, info.Length);
                            ms.Write(newline, 0, newline.Length);
                        }
                    }
                }
                else
                {
                    ms.Write(newline, 0, newline.Length);
                    info = new UTF8Encoding(true).GetBytes($"\t\t- No Difference ");
                    ms.Write(info, 0, info.Length);
                }
                ms.Write(newline, 0, newline.Length);
                ms.Write(newline, 0, newline.Length);
            }

            //Difference Item Group
            if (difference != null)
            {
                info = new UTF8Encoding(true).GetBytes($"\tDifference Item {type}:");
                ms.Write(info, 0, info.Length);
                if (difference.Count > 0)
                {
                    foreach (var itemDifference in difference)
                    {
                        ms.Write(newline, 0, newline.Length);

                        info = new UTF8Encoding(true).GetBytes($"\t\t{itemDifference.Key}: ");
                        ms.Write(info, 0, info.Length);

                        if (itemDifference.ItemsTargetGroup != null && itemDifference.ItemsTargetGroup.Count > 0)
                        {
                            ms.Write(newline, 0, newline.Length);
                            info = new UTF8Encoding(true).GetBytes($"\t\t\t\tMissing item in Source: " + Environment.NewLine);
                            ms.Write(info, 0, info.Length);
                            foreach (var item in itemDifference.ItemsTargetGroup)
                            {
                                info = new UTF8Encoding(true).GetBytes($"\t\t\t\t\t[{item}] " + Environment.NewLine);
                                ms.Write(info, 0, info.Length);
                            }
                        }
                        if (itemDifference.ItemsSourceGroup != null && itemDifference.ItemsSourceGroup.Count > 0)
                        {
                            ms.Write(newline, 0, newline.Length);
                            info = new UTF8Encoding(true).GetBytes($"\t\t\t\tMissing item in Target: " + Environment.NewLine);
                            ms.Write(info, 0, info.Length);
                            foreach (var item in itemDifference.ItemsSourceGroup)
                            {
                                info = new UTF8Encoding(true).GetBytes($"\t\t\t\t\t[{item}] " + Environment.NewLine);
                                ms.Write(info, 0, info.Length);
                            }
                            ms.Write(newline, 0, newline.Length);
                        }
                    }
                }
                else
                {
                    ms.Write(newline, 0, newline.Length);
                    info = new UTF8Encoding(true).GetBytes($"\t\t- No Difference ");
                    ms.Write(info, 0, info.Length);
                }
                ms.Write(newline, 0, newline.Length);
                ms.Write(newline, 0, newline.Length);
            }

            ms.Write(newline, 0, newline.Length);
        }


        private string getLocalizedName(Dictionary<string, string> names, string lang)
        {
            if (names != null)
            {
                if (names.ContainsKey(lang))
                {
                    return $" ({names[lang]})";
                }
                else if (names.Count > 0)
                {
                    return $" ({names.First().Value})";
                }
            }
            return "";
        }

        private void findDifferenceDimensions(Dictionary<string, Dictionary<string, string>> codelistNames, IEnumerable<Org.Sdmxsource.Sdmx.Api.Model.Objects.ConceptScheme.IConceptSchemeObject> conceptSchemes, IList<IDimension> sourceDimensions, IList<IDimension> targetDimensions, List<DsdReport.IdentityKey> notFoundDimensions, List<DsdReport.Difference> differenceDimensions, List<DsdReport.Difference> differenceConceptSchemeDimensions)
        {
            foreach (var sourceDimension in sourceDimensions)
            {
                IDimension targetDim = null;
                foreach (var targetDimension in targetDimensions)
                {
                    if (sourceDimension.Id.Equals(targetDimension.Id, StringComparison.InvariantCultureIgnoreCase))
                    {
                        targetDim = targetDimension;
                        break;
                    }
                }

                if (targetDim == null)
                {
                    DsdReport.ReferenceIdentity artId = null;
                    if (sourceDimension.Representation != null && sourceDimension.Representation.Representation != null)
                    {
                        artId = new DsdReport.ReferenceIdentity
                        {
                            ID = sourceDimension.Representation.Representation.MaintainableId,
                            Version = sourceDimension.Representation.Representation.Version,
                            AgencyId = sourceDimension.Representation.Representation.AgencyId,
                        };
                        var key = $"{artId.ID}+{artId.AgencyId}+{artId.Version}";
                        if (codelistNames.ContainsKey(key))
                        {
                            artId.Names = codelistNames[key];
                        }
                    }
                    notFoundDimensions.Add(new DsdReport.IdentityKey { Key = sourceDimension.Id, Mandatory = false, ReferenceIdentity = artId });
                }
                else
                {
                    if (differenceDimensions == null)
                    {
                        continue;
                    }

                    //CODELIST
                    DsdReport.ReferenceIdentity diffSource = null;
                    if (sourceDimension.Representation != null && sourceDimension.Representation.Representation != null)
                    {
                        diffSource = new DsdReport.ReferenceIdentity
                        {
                            ID = sourceDimension.Representation.Representation.MaintainableId,
                            Version = sourceDimension.Representation.Representation.Version,
                            AgencyId = sourceDimension.Representation.Representation.AgencyId,
                        };
                        var key = $"{diffSource.ID}+{diffSource.AgencyId}+{diffSource.Version}";
                        if (codelistNames.ContainsKey(key))
                        {
                            diffSource.Names = codelistNames[key];
                        }
                    }
                    DsdReport.ReferenceIdentity diffTarget = null;
                    if (targetDim.Representation != null && targetDim.Representation.Representation != null)
                    {
                        diffTarget = new DsdReport.ReferenceIdentity
                        {
                            ID = targetDim.Representation.Representation.MaintainableId,
                            Version = targetDim.Representation.Representation.Version,
                            AgencyId = targetDim.Representation.Representation.AgencyId,
                        };
                        var key = $"{diffTarget.ID}+{diffTarget.AgencyId}+{diffTarget.Version}";
                        if (codelistNames.ContainsKey(key))
                        {
                            diffTarget.Names = codelistNames[key];
                        }
                    }

                    if (
                            (diffSource != null && diffTarget == null) ||
                            (diffSource == null && diffTarget != null) ||
                            ( //Case of same keyid but different id agency or version
                                diffSource != null && diffTarget != null &&
                                (!diffSource.ID.Equals(diffTarget.ID, StringComparison.InvariantCultureIgnoreCase) ||
                                    !diffSource.AgencyId.Equals(diffTarget.AgencyId, StringComparison.InvariantCultureIgnoreCase) ||
                                    !diffSource.Version.Equals(diffTarget.Version, StringComparison.InvariantCultureIgnoreCase))
                            )
                        )
                    {//In this case there some difference beetwen source and target
                        differenceDimensions.Add(new DsdReport.Difference
                        {
                            Key = sourceDimension.Id,
                            Source = diffSource,
                            Target = diffTarget,
                            Mandatory = false
                        });
                    }

                    //CONCEPTSCHEME
                    DsdReport.ReferenceIdentity diffSourceConcept = null;
                    if (sourceDimension.ConceptRef != null)
                    {
                        diffSourceConcept = new DsdReport.ReferenceIdentity
                        {
                            ID = sourceDimension.ConceptRef.MaintainableId,
                            Version = sourceDimension.ConceptRef.Version,
                            AgencyId = sourceDimension.ConceptRef.AgencyId,
                            ConceptId = sourceDimension.ConceptRef.FullId
                        };
                        foreach (var itemConcept in conceptSchemes)
                        {
                            if (itemConcept.Id.Equals(diffSourceConcept.ID) && itemConcept.AgencyId.Equals(diffSourceConcept.AgencyId) && itemConcept.Version.Equals(diffSourceConcept.Version))
                            {
                                foreach (var itemKey in itemConcept.Items)
                                {
                                    if (itemKey.Id.Equals(diffSourceConcept.ConceptId))
                                    {
                                        foreach (var itemName in itemKey.Names)
                                        {
                                            diffSourceConcept.Names.Add(itemName.Locale, itemName.Value);
                                        }
                                        break;
                                    }
                                }
                                break;
                            }
                        }
                    }
                    DsdReport.ReferenceIdentity diffTargetConcept = null;
                    if (targetDim.ConceptRef != null)
                    {
                        diffTargetConcept = new DsdReport.ReferenceIdentity
                        {
                            ID = targetDim.ConceptRef.MaintainableId,
                            Version = targetDim.ConceptRef.Version,
                            AgencyId = targetDim.ConceptRef.AgencyId,
                            ConceptId = targetDim.ConceptRef.FullId
                        };
                        var key = $"{diffTargetConcept.ID}+{diffTargetConcept.AgencyId}+{diffTargetConcept.Version}";
                        foreach (var itemConcept in conceptSchemes)
                        {
                            if (itemConcept.Id.Equals(diffTargetConcept.ID) && itemConcept.AgencyId.Equals(diffTargetConcept.AgencyId) && itemConcept.Version.Equals(diffTargetConcept.Version))
                            {
                                foreach (var itemKey in itemConcept.Items)
                                {
                                    if (itemKey.Id.Equals(diffTargetConcept.ConceptId))
                                    {
                                        foreach (var itemName in itemKey.Names)
                                        {
                                            diffTargetConcept.Names.Add(itemName.Locale, itemName.Value);
                                        }
                                        break;
                                    }
                                }
                                break;
                            }
                        }
                    }

                    if (
                            (diffSourceConcept != null && diffTargetConcept == null) ||
                            (diffSourceConcept == null && diffTargetConcept != null) ||
                            ( //Case of same keyid but different id agency or version
                                diffSourceConcept != null && diffTargetConcept != null &&
                                (!diffSourceConcept.ID.Equals(diffTargetConcept.ID, StringComparison.InvariantCultureIgnoreCase) ||
                                    !diffSourceConcept.AgencyId.Equals(diffTargetConcept.AgencyId, StringComparison.InvariantCultureIgnoreCase) ||
                                    !diffSourceConcept.Version.Equals(diffTargetConcept.Version, StringComparison.InvariantCultureIgnoreCase) ||
                                    !diffSourceConcept.ConceptId.Equals(diffTargetConcept.ConceptId, StringComparison.InvariantCultureIgnoreCase))
                            )
                        )
                    {//In this case there some difference beetwen source and target
                        differenceConceptSchemeDimensions.Add(new DsdReport.Difference
                        {
                            Key = sourceDimension.Id,
                            Source = diffSourceConcept,
                            Target = diffTargetConcept,
                            Mandatory = false
                        });
                    }
                }
            }
        }

        private void findDifferenceAttributes(Dictionary<string, Dictionary<string, string>> codelistNames, IEnumerable<Org.Sdmxsource.Sdmx.Api.Model.Objects.ConceptScheme.IConceptSchemeObject> conceptSchemes, IList<IAttributeObject> sourceAttributes, IList<IAttributeObject> targetAttributes, List<DsdReport.IdentityKey> notFoundAttributes, List<DsdReport.Difference> differenceAttributes, List<DsdReport.Difference> differenceConceptSchemeAttributes)
        {
            var ignoreDifferenceGroup = true;
            foreach (var sourceAttribute in sourceAttributes)
            {

                IAttributeObject targetAttr = null;
                foreach (var targetAttribute in targetAttributes)
                {
                    if (sourceAttribute.Id.Equals(targetAttribute.Id, StringComparison.InvariantCultureIgnoreCase))
                    {
                        targetAttr = targetAttribute;
                        break;
                    }
                }

                if (targetAttr == null)
                {
                    DsdReport.ReferenceIdentity artId = null;
                    if (sourceAttribute.Representation != null && sourceAttribute.Representation.Representation != null)
                    {
                        artId = new DsdReport.ReferenceIdentity
                        {
                            ID = sourceAttribute.Representation.Representation.MaintainableId,
                            Version = sourceAttribute.Representation.Representation.Version,
                            AgencyId = sourceAttribute.Representation.Representation.AgencyId
                        };
                        var key = $"{artId.ID}+{artId.AgencyId}+{artId.Version}";
                        if (codelistNames.ContainsKey(key))
                        {
                            artId.Names = codelistNames[key];
                        }
                    }

                    List<string> itemsGroup = null;
                    if (sourceAttribute.AttachmentLevel == AttributeAttachmentLevel.Group)
                    {
                        itemsGroup = new List<string> { sourceAttribute.AttachmentGroup };
                    }
                    else if (sourceAttribute.AttachmentLevel == AttributeAttachmentLevel.DimensionGroup)
                    {
                        itemsGroup = new List<string>();
                        foreach (var item in sourceAttribute.DimensionReferences)
                        {
                            itemsGroup.Add(item);
                        }
                    }

                    notFoundAttributes.Add(new DsdReport.IdentityKey { Key = sourceAttribute.Id, ItemsGroup = itemsGroup, Mandatory = sourceAttribute != null && !sourceAttribute.AssignmentStatus.Equals("Conditional", StringComparison.InvariantCultureIgnoreCase), ReferenceIdentity = artId, AttachmentLevel = sourceAttribute.AttachmentLevel.ToString() });
                }
                else
                {
                    if (differenceAttributes == null)
                    {
                        continue;
                    }

                    //ITEMS GROUP
                    var itemsSourceGroup = new List<string>();
                    if (sourceAttribute.AttachmentLevel == AttributeAttachmentLevel.Group)
                    {
                        itemsSourceGroup.Add(sourceAttribute.AttachmentGroup);
                    }
                    else if (sourceAttribute.AttachmentLevel == AttributeAttachmentLevel.DimensionGroup)
                    {
                        itemsSourceGroup = new List<string>();
                        foreach (var item in sourceAttribute.DimensionReferences)
                        {
                            itemsSourceGroup.Add(item);
                        }
                    }
                    var itemsTargetGroup = new List<string>();
                    if (targetAttr.AttachmentLevel == AttributeAttachmentLevel.Group)
                    {
                        itemsTargetGroup.Add(targetAttr.AttachmentGroup);
                    }
                    else if (targetAttr.AttachmentLevel == AttributeAttachmentLevel.DimensionGroup)
                    {
                        itemsTargetGroup = new List<string>();
                        foreach (var item in targetAttr.DimensionReferences)
                        {
                            itemsTargetGroup.Add(item);
                        }
                    }

                    var diffItemsSourceGroup = itemsSourceGroup.Except(itemsTargetGroup).ToList();
                    var diffItemsTargetGroup = itemsTargetGroup.Except(itemsSourceGroup).ToList();

                    //CODELIST
                    DsdReport.ReferenceIdentity diffSource = null;
                    if (sourceAttribute.Representation != null && sourceAttribute.Representation.Representation != null)
                    {
                        diffSource = new DsdReport.ReferenceIdentity
                        {
                            ID = sourceAttribute.Representation.Representation.MaintainableId,
                            Version = sourceAttribute.Representation.Representation.Version,
                            AgencyId = sourceAttribute.Representation.Representation.AgencyId
                        };
                        var key = $"{diffSource.ID}+{diffSource.AgencyId}+{diffSource.Version}";
                        if (codelistNames.ContainsKey(key))
                        {
                            diffSource.Names = codelistNames[key];
                        }
                    }
                    DsdReport.ReferenceIdentity diffTarget = null;
                    if (targetAttr.Representation != null && targetAttr.Representation.Representation != null)
                    {
                        diffTarget = new DsdReport.ReferenceIdentity
                        {
                            ID = targetAttr.Representation.Representation.MaintainableId,
                            Version = targetAttr.Representation.Representation.Version,
                            AgencyId = targetAttr.Representation.Representation.AgencyId
                        };
                        var key = $"{diffTarget.ID}+{diffTarget.AgencyId}+{diffTarget.Version}";
                        if (codelistNames.ContainsKey(key))
                        {
                            diffTarget.Names = codelistNames[key];
                        }
                    }

                    if (
                            (diffSource != null && diffTarget == null) ||
                            (diffSource == null && diffTarget != null) ||
                            (!ignoreDifferenceGroup && diffItemsSourceGroup.Count > 0) ||
                            (!ignoreDifferenceGroup && diffItemsTargetGroup.Count > 0) ||
                            (!ignoreDifferenceGroup && sourceAttribute.AttachmentLevel != targetAttr.AttachmentLevel) ||
                            ( //Case of same keyid but different id agency or version
                                diffSource != null && diffTarget != null &&
                                (!diffSource.ID.Equals(diffTarget.ID, StringComparison.InvariantCultureIgnoreCase) ||
                                    !diffSource.AgencyId.Equals(diffTarget.AgencyId, StringComparison.InvariantCultureIgnoreCase) ||
                                    !diffSource.Version.Equals(diffTarget.Version, StringComparison.InvariantCultureIgnoreCase))
                            )
                        )
                    {//In this case there some difference beetwen source and target
                        differenceAttributes.Add(new DsdReport.Difference
                        {
                            Key = sourceAttribute.Id,
                            Mandatory = sourceAttribute != null && !sourceAttribute.AssignmentStatus.Equals("Conditional", StringComparison.InvariantCultureIgnoreCase),
                            Source = diffSource,
                            Target = diffTarget,
                            ItemsSourceGroup = diffItemsSourceGroup,
                            ItemsTargetGroup = diffItemsTargetGroup,
                            AttachmentLevelSourceGroup = sourceAttribute.AttachmentLevel.ToString(),
                            AttachmentLevelTargetGroup = targetAttr.AttachmentLevel.ToString()
                        });
                    }

                    //CONCEPTSCHEME
                    DsdReport.ReferenceIdentity diffSourceConcept = null;
                    if (sourceAttribute.ConceptRef != null)
                    {
                        diffSourceConcept = new DsdReport.ReferenceIdentity
                        {
                            ID = sourceAttribute.ConceptRef.MaintainableId,
                            Version = sourceAttribute.ConceptRef.Version,
                            AgencyId = sourceAttribute.ConceptRef.AgencyId,
                            ConceptId = sourceAttribute.ConceptRef.FullId
                        };
                        var key = $"{diffSourceConcept.ID}+{diffSourceConcept.AgencyId}+{diffSourceConcept.Version}";
                        foreach (var itemConcept in conceptSchemes)
                        {
                            if (itemConcept.Id.Equals(diffSourceConcept.ID) && itemConcept.AgencyId.Equals(diffSourceConcept.AgencyId) && itemConcept.Version.Equals(diffSourceConcept.Version))
                            {
                                foreach (var itemKey in itemConcept.Items)
                                {
                                    if (itemKey.Id.Equals(diffSourceConcept.ConceptId))
                                    {
                                        foreach (var itemName in itemKey.Names)
                                        {
                                            diffSourceConcept.Names.Add(itemName.Locale, itemName.Value);
                                        }
                                        break;
                                    }
                                }
                                break;
                            }
                        }
                    }
                    DsdReport.ReferenceIdentity diffTargetConcept = null;
                    if (targetAttr.ConceptRef != null)
                    {
                        diffTargetConcept = new DsdReport.ReferenceIdentity
                        {
                            ID = targetAttr.ConceptRef.MaintainableId,
                            Version = targetAttr.ConceptRef.Version,
                            AgencyId = targetAttr.ConceptRef.AgencyId,
                            ConceptId = targetAttr.ConceptRef.FullId
                        };
                        foreach (var itemConcept in conceptSchemes)
                        {
                            if (itemConcept.Id.Equals(diffTargetConcept.ID) && itemConcept.AgencyId.Equals(diffTargetConcept.AgencyId) && itemConcept.Version.Equals(diffTargetConcept.Version))
                            {
                                foreach (var itemKey in itemConcept.Items)
                                {
                                    if (itemKey.Id.Equals(diffTargetConcept.ConceptId))
                                    {
                                        foreach (var itemName in itemKey.Names)
                                        {
                                            diffTargetConcept.Names.Add(itemName.Locale, itemName.Value);
                                        }
                                        break;
                                    }
                                }
                                break;
                            }
                        }
                    }

                    if (
                            (diffSourceConcept != null && diffTargetConcept == null) ||
                            (diffSourceConcept == null && diffTargetConcept != null) ||
                            ( //Case of same keyid but different id agency or version
                                diffSourceConcept != null && diffTargetConcept != null &&
                                (!diffSourceConcept.ID.Equals(diffTargetConcept.ID, StringComparison.InvariantCultureIgnoreCase) ||
                                    !diffSourceConcept.AgencyId.Equals(diffTargetConcept.AgencyId, StringComparison.InvariantCultureIgnoreCase) ||
                                    !diffSourceConcept.Version.Equals(diffTargetConcept.Version, StringComparison.InvariantCultureIgnoreCase) ||
                                    !diffSourceConcept.ConceptId.Equals(diffTargetConcept.ConceptId, StringComparison.InvariantCultureIgnoreCase))
                            )
                        )
                    {//In this case there some difference beetwen source and target
                        differenceConceptSchemeAttributes.Add(new DsdReport.Difference
                        {
                            Key = sourceAttribute.Id,
                            Source = diffSourceConcept,
                            Target = diffTargetConcept,
                            Mandatory = sourceAttribute != null && !sourceAttribute.AssignmentStatus.Equals("Conditional", StringComparison.InvariantCultureIgnoreCase),
                        });
                    }
                }
            }
        }

        private void findDifferenceMeasures(Dictionary<string, Dictionary<string, string>> codelistNames, IEnumerable<Org.Sdmxsource.Sdmx.Api.Model.Objects.ConceptScheme.IConceptSchemeObject> conceptSchemes, ISet<ISdmxObject> sourceComposites, ISet<ISdmxObject> targetComposites, List<DsdReport.IdentityKey> notFoundMeasures, List<DsdReport.Difference> differenceFoundMeasures, List<DsdReport.Difference> differenceFoundConceptSchemeMeasures)
        {
            foreach (var srcComp in sourceComposites)
            {
                var srcConvert = srcComp as Org.Sdmxsource.Sdmx.SdmxObjects.Model.Objects.DataStructure.PrimaryMeasureCore;
                if (srcConvert != null)
                {
                    Org.Sdmxsource.Sdmx.SdmxObjects.Model.Objects.DataStructure.PrimaryMeasureCore trgConvert = null;
                    var find = false;
                    foreach (var trgComp in targetComposites)
                    {
                        trgConvert = trgComp as Org.Sdmxsource.Sdmx.SdmxObjects.Model.Objects.DataStructure.PrimaryMeasureCore;
                        if (trgConvert != null && srcConvert.Id.Equals(trgConvert.Id, StringComparison.InvariantCultureIgnoreCase))
                        {
                            find = true;
                            break;
                        }
                    }

                    if (!find)
                    {
                        notFoundMeasures.Add(new DsdReport.IdentityKey { Key = srcConvert.Id, Mandatory = false });
                    }
                    else
                    {
                        if (differenceFoundMeasures == null)
                        {
                            continue;
                        }

                        //CODELIST
                        DsdReport.ReferenceIdentity diffSource = null;
                        if (srcConvert.Representation != null && srcConvert.Representation.Representation != null)
                        {
                            diffSource = new DsdReport.ReferenceIdentity
                            {
                                ID = srcConvert.Representation.Representation.MaintainableId,
                                Version = srcConvert.Representation.Representation.Version,
                                AgencyId = srcConvert.Representation.Representation.AgencyId
                            };
                            var key = $"{diffSource.ID}+{diffSource.AgencyId}+{diffSource.Version}";
                            if (codelistNames.ContainsKey(key))
                            {
                                diffSource.Names = codelistNames[key];
                            }
                        }
                        DsdReport.ReferenceIdentity diffTarget = null;
                        if (trgConvert.Representation != null && trgConvert.Representation.Representation != null)
                        {
                            diffTarget = new DsdReport.ReferenceIdentity
                            {
                                ID = trgConvert.Representation.Representation.MaintainableId,
                                Version = trgConvert.Representation.Representation.Version,
                                AgencyId = trgConvert.Representation.Representation.AgencyId
                            };
                            var key = $"{diffTarget.ID}+{diffTarget.AgencyId}+{diffTarget.Version}";
                            if (codelistNames.ContainsKey(key))
                            {
                                diffTarget.Names = codelistNames[key];
                            }
                        }

                        if (
                                (diffSource != null && diffTarget == null) ||
                                (diffSource == null && diffTarget != null) ||
                                ( //Case of same keyid but different id agency or version
                                    diffSource != null && diffTarget != null &&
                                    (!diffSource.ID.Equals(diffTarget.ID, StringComparison.InvariantCultureIgnoreCase) ||
                                        !diffSource.AgencyId.Equals(diffTarget.AgencyId, StringComparison.InvariantCultureIgnoreCase) ||
                                        !diffSource.Version.Equals(diffTarget.Version, StringComparison.InvariantCultureIgnoreCase))
                                )
                            )
                        {//In this case there some difference beetwen source and target
                            differenceFoundMeasures.Add(new DsdReport.Difference
                            {
                                Key = srcConvert.Id,
                                Mandatory = false,
                                Source = diffSource,
                                Target = diffTarget
                            });
                        }

                        //CONCEPTSCHEME
                        DsdReport.ReferenceIdentity diffSourceConcept = null;
                        if (srcConvert.ConceptRef != null)
                        {
                            diffSourceConcept = new DsdReport.ReferenceIdentity
                            {
                                ID = srcConvert.ConceptRef.MaintainableId,
                                Version = srcConvert.ConceptRef.Version,
                                AgencyId = srcConvert.ConceptRef.AgencyId,
                                ConceptId = srcConvert.ConceptRef.FullId
                            };
                            var key = $"{diffSourceConcept.ID}+{diffSourceConcept.AgencyId}+{diffSourceConcept.Version}";
                            foreach (var itemConcept in conceptSchemes)
                            {
                                if (itemConcept.Id.Equals(diffSourceConcept.ID) && itemConcept.AgencyId.Equals(diffSourceConcept.AgencyId) && itemConcept.Version.Equals(diffSourceConcept.Version))
                                {
                                    foreach (var itemKey in itemConcept.Items)
                                    {
                                        if (itemKey.Id.Equals(diffSourceConcept.ConceptId))
                                        {
                                            foreach (var itemName in itemKey.Names)
                                            {
                                                diffSourceConcept.Names.Add(itemName.Locale, itemName.Value);
                                            }
                                            break;
                                        }
                                    }
                                    break;
                                }
                            }
                        }
                        DsdReport.ReferenceIdentity diffTargetConcept = null;
                        if (trgConvert.ConceptRef != null)
                        {
                            diffTargetConcept = new DsdReport.ReferenceIdentity
                            {
                                ID = trgConvert.ConceptRef.MaintainableId,
                                Version = trgConvert.ConceptRef.Version,
                                AgencyId = trgConvert.ConceptRef.AgencyId,
                                ConceptId = trgConvert.ConceptRef.FullId
                            };
                            foreach (var itemConcept in conceptSchemes)
                            {
                                if (itemConcept.Id.Equals(diffTargetConcept.ID) && itemConcept.AgencyId.Equals(diffTargetConcept.AgencyId) && itemConcept.Version.Equals(diffTargetConcept.Version))
                                {
                                    foreach (var itemKey in itemConcept.Items)
                                    {
                                        if (itemKey.Id.Equals(diffTargetConcept.ConceptId))
                                        {
                                            foreach (var itemName in itemKey.Names)
                                            {
                                                diffTargetConcept.Names.Add(itemName.Locale, itemName.Value);
                                            }
                                            break;
                                        }
                                    }
                                    break;
                                }
                            }
                        }

                        if (
                                (diffSourceConcept != null && diffTargetConcept == null) ||
                                (diffSourceConcept == null && diffTargetConcept != null) ||
                                ( //Case of same keyid but different id agency or version
                                    diffSourceConcept != null && diffTargetConcept != null &&
                                    (!diffSourceConcept.ID.Equals(diffTargetConcept.ID, StringComparison.InvariantCultureIgnoreCase) ||
                                        !diffSourceConcept.AgencyId.Equals(diffTargetConcept.AgencyId, StringComparison.InvariantCultureIgnoreCase) ||
                                        !diffSourceConcept.Version.Equals(diffTargetConcept.Version, StringComparison.InvariantCultureIgnoreCase) ||
                                        !diffSourceConcept.ConceptId.Equals(diffTargetConcept.ConceptId, StringComparison.InvariantCultureIgnoreCase))
                                )
                            )
                        {//In this case there some difference beetwen source and target
                            differenceFoundConceptSchemeMeasures.Add(new DsdReport.Difference
                            {
                                Key = srcConvert.Id,
                                Source = diffSourceConcept,
                                Target = diffTargetConcept,
                                Mandatory = false
                            });
                        }
                    }
                }
            }
        }

        private void findDifferenceGroups(IList<IGroup> sourceGroups, IList<IGroup> targetGroups, List<DsdReport.IdentityKey> notFoundGroups, List<DsdReport.Difference> differenceGroups)
        {
            foreach (var sourceGrp in sourceGroups)
            {
                IGroup targetGrp = null;
                foreach (var itemTargetGrp in targetGroups)
                {
                    if (sourceGrp.Id.Equals(itemTargetGrp.Id, StringComparison.InvariantCultureIgnoreCase))
                    {
                        targetGrp = itemTargetGrp;
                        break;
                    }
                }

                if (targetGrp == null)
                {
                    var itemsGroup = new List<string>();
                    if (sourceGroups != null)
                    {
                        foreach (var item in sourceGroups)
                        {
                            itemsGroup.Add(item.Id);
                        }
                    }

                    notFoundGroups.Add(new DsdReport.IdentityKey
                    {
                        Key = sourceGrp.Id,
                        ItemsGroup = itemsGroup,
                        Mandatory = false
                    });
                }
                else
                {
                    if (differenceGroups == null)
                    {
                        continue;
                    }

                    //ITEMS GROUP
                    var itemsSourceGroup = new List<string>();
                    if (sourceGrp.DimensionRefs != null)
                    {
                        foreach (var item in sourceGrp.DimensionRefs)
                        {
                            itemsSourceGroup.Add(item);
                        }
                    }

                    var itemsTargetGroup = new List<string>();
                    if (targetGrp.DimensionRefs != null)
                    {
                        foreach (var item in targetGrp.DimensionRefs)
                        {
                            itemsTargetGroup.Add(item);
                        }
                    }

                    var diffItemsSourceGroup = itemsSourceGroup.Except(itemsTargetGroup).ToList();
                    var diffItemsTargetGroup = itemsTargetGroup.Except(itemsSourceGroup).ToList();

                    //CODELIST
                    if ((diffItemsSourceGroup.Count > 0) || (diffItemsTargetGroup.Count > 0))
                    {//In this case there some difference beetwen source and target
                        differenceGroups.Add(new DsdReport.Difference
                        {
                            Key = sourceGrp.Id,
                            ItemsSourceGroup = diffItemsSourceGroup,
                            ItemsTargetGroup = diffItemsTargetGroup,
                            Mandatory = false
                        });
                    }
                }
            }
        }


        #endregion

        public bool SetAnnotation(SdmxStructureEnumType structureType, string id, string agencyID, string version, string annotationType)
        {
            var objectSdmx = Sdmx21Connector.GetArtefacts(structureType, id, agencyID, version);
            if (objectSdmx.GetAllMaintainables().Count <= 0)
            {
                return false;
            }

            var maintableItems = objectSdmx.GetAllMaintainables().First();
            SdmxUtils.RemoveItemSdmxObject(maintableItems, objectSdmx);

            var maintableItemsMutable = maintableItems.MutableInstance;
            var itemDf = maintableItemsMutable.Annotations.FirstOrDefault(a => !string.IsNullOrWhiteSpace(a.Type) && a.Type.Equals(annotationType, StringComparison.InvariantCultureIgnoreCase));
            if (itemDf == null)
            {
                var annotation = new AnnotationMutableCore
                {
                    Type = annotationType,
                    Title = annotationType,
                    Id = annotationType
                };
                maintableItemsMutable.AddAnnotation(annotation);
                SdmxUtils.AddItemSdmxObject(maintableItemsMutable.ImmutableInstance, objectSdmx);
                return Sdmx21Connector.UpdateArtefacts(objectSdmx, false, false, false);
            }

            return true;
        }

        public bool RemoveAnnotation(SdmxStructureEnumType structureType, string id, string agencyID, string version, string annotationType)
        {
            var objectSdmx = Sdmx21Connector.GetArtefacts(structureType, id, agencyID, version);
            if (objectSdmx.GetAllMaintainables().Count <= 0)
            {
                return false;
            }

            var maintableItems = objectSdmx.GetAllMaintainables().First();
            SdmxUtils.RemoveItemSdmxObject(maintableItems, objectSdmx);

            var maintableItemsMutable = maintableItems.MutableInstance;
            var i = 0;
            var findPosition = -1;
            foreach (var item in maintableItemsMutable.Annotations)
            {
                if (!string.IsNullOrWhiteSpace(item.Type) && item.Type.Equals(annotationType, StringComparison.InvariantCultureIgnoreCase))
                {
                    findPosition = i;
                }
                i++;
            }


            if (findPosition == -1)
            {
                return true;
            }

            var annotation = new AnnotationMutableCore
            {
                Type = annotationType,
                Id = annotationType
            };
            maintableItemsMutable.Annotations.RemoveAt(findPosition);
            SdmxUtils.AddItemSdmxObject(maintableItemsMutable.ImmutableInstance, objectSdmx);
            return Sdmx21Connector.UpdateArtefacts(objectSdmx, false, false, false);
        }

        public string GetMetadataflow(string id, string agencyID, string version, StructureReferenceDetailEnumType refDetail)
        {
            try
            {
                var res = Sdmx21Connector.GetArtefacts(SdmxStructureEnumType.MetadataFlow, id, agencyID, version, refDetail);
                var mutable = res.MutableObjects;
                var catSchema = Sdmx21Connector.GetArtefacts(SdmxStructureEnumType.CategoryScheme, null, null, null, StructureReferenceDetailEnumType.Parents);
                var allCatSchema = new List<string>();
                if (catSchema != null)
                {
                    foreach (var item in catSchema.Categorisations)
                    {
                        if (item.StructureReference != null && item.StructureReference.MaintainableStructureEnumType.EnumType == SdmxStructureEnumType.MetadataFlow && item.StructureReference.MaintainableId.Equals(id) && item.StructureReference.AgencyId.Equals(agencyID) && item.StructureReference.Version.Equals(version))
                        {
                            if (item.CategoryReference != null)
                            {
                                var catSchemaItem = $"{item.CategoryReference.MaintainableId}+{item.CategoryReference.AgencyId}+{item.CategoryReference.Version}";
                                if (!allCatSchema.Contains(catSchemaItem))
                                {
                                    allCatSchema.Add(catSchemaItem);
                                }
                            }
                            mutable.AddCategorisation(item.MutableInstance);
                        }
                    }
                    foreach (var item in catSchema.CategorySchemes)
                    {
                        if (item.StructureType == SdmxStructureEnumType.CategoryScheme)
                        {
                            foreach (var itemCatSchema in allCatSchema)
                            {
                                var splitName = itemCatSchema.Split("+");
                                if (splitName[0].Equals(item.Id) && splitName[1].Equals(item.AgencyId) && splitName[2].Equals(item.Version))
                                {
                                    mutable.AddCategoryScheme(item.MutableInstance);
                                }
                            }
                        }
                    }
                }
                return GetSdmxJsonFromSdmxObjects(mutable.ImmutableObjects);
            }
            catch (Exception ex)
            {
                throw Utility.Utils.getCustomException("GetMetadataflow",
                   @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - " + ex.Message, Infrastructure.STLogging.Interface.LogLevelEnum.Error);
            }
        }

        public bool UpdateCategorisationsMetadataflow(string id, string agencyID, string version, string msdbCat)
        {
            var objectSdmx = Sdmx21Connector.GetArtefacts(SdmxStructureEnumType.MetadataFlow, id, agencyID, version);

            if (objectSdmx == null || objectSdmx.Metadataflows.FirstOrDefault() == null)
            {
                throw Utility.Utils.getCustomException("METADATAFLOW_NOTFOUND",
                       @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + $" - Ma API not found dataflow {id}", Infrastructure.STLogging.Interface.LogLevelEnum.Error);
            }

            try
            {
                if (msdbCat != null && msdbCat != "null")
                {
                    ISdmxObjects catObjs = GetSdmxObjectsFromSdmxJson(msdbCat);
                    if (catObjs.Categorisations.Count < 1)
                    {
                        foreach (var item in objectSdmx.Categorisations)
                        {
                            DeleteArtefact(SdmxStructureEnumType.Categorisation, item.Id, item.AgencyId, item.Version);
                        }
                    }
                    Sdmx21Connector.CreateArtefacts(catObjs);
                }
                else
                {
                    foreach (var item in objectSdmx.Categorisations)
                    {
                        DeleteArtefact(SdmxStructureEnumType.Categorisation, item.Id, item.AgencyId, item.Version);
                    }
                }
            }
            catch (Exception ex)
            {
                throw Utility.Utils.getCustomException("UpdateCategorisationsMetadataflow",
                   @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - " + ex.Message, Infrastructure.STLogging.Interface.LogLevelEnum.Error);
            }

            return true;
        }

        public bool UpdateCategorisationsMetadataSet(List<RMDataProvider.Model.AnnotationType> annotation)
        {
            var allCategory = new List<string>();
            var metadataflowId = "";
            var metadataflowAgency = "";
            var metadataflowVersion = "";
            foreach (var iAnnotation in annotation)
            {
                if (iAnnotation.id.Equals(MetadataSetType.ANNOTATION_KEY_METADATASET_FLOW_ID, StringComparison.InvariantCultureIgnoreCase) && iAnnotation.AnnotationText.Count > 0)
                {
                    metadataflowId = iAnnotation.AnnotationText.First().TypedValue;
                }
                if (iAnnotation.id.Equals(MetadataSetType.ANNOTATION_KEY_METADATASET_FLOW_AGENCY_ID, StringComparison.InvariantCultureIgnoreCase) && iAnnotation.AnnotationText.Count > 0)
                {
                    metadataflowAgency = iAnnotation.AnnotationText.First().TypedValue;
                }
                if (iAnnotation.id.Equals(MetadataSetType.ANNOTATION_KEY_METADATASET_FLOW_VERSION_ID, StringComparison.InvariantCultureIgnoreCase) && iAnnotation.AnnotationText.Count > 0)
                {
                    metadataflowVersion = iAnnotation.AnnotationText.First().TypedValue;
                }
                if (iAnnotation.id.StartsWith("categorisation_[") && iAnnotation.AnnotationText.Count > 0)
                {
                    var idAnnotation = iAnnotation.id.Replace("categorisation_[", "").Replace("]", "");
                    var texts = iAnnotation.AnnotationText.First().TypedValue.Split('+');
                    allCategory.Add($"{texts[0]}+{texts[1]}+{texts[2]}");
                }
            }

            var objectSdmx = Sdmx21Connector.GetArtefacts(SdmxStructureEnumType.Categorisation, null, null, null);
            var oldCategory = new Dictionary<string, bool>();
            foreach (var iCategorisation in objectSdmx.Categorisations)
            {
                if (iCategorisation.CrossReferences != null)
                {
                    foreach (var item in iCategorisation.CrossReferences)
                    {
                        if (item.MaintainableStructureEnumType.EnumType == SdmxStructureEnumType.MetadataFlow)
                        {
                            if (item.MaintainableId.Equals(metadataflowId, StringComparison.InvariantCultureIgnoreCase)
                                && item.AgencyId.Equals(metadataflowAgency, StringComparison.InvariantCultureIgnoreCase)
                                && item.Version.Equals(metadataflowVersion, StringComparison.InvariantCultureIgnoreCase))
                            {
                                oldCategory.Add($"{iCategorisation.Id}+{iCategorisation.AgencyId}+{iCategorisation.Version}", false);
                            }
                        }
                    }
                }
            }

            var itemRemove = new List<string>();
            foreach (var item in oldCategory)
            {
                if (!allCategory.Contains(item.Key))
                {
                    itemRemove.Add(item.Key);
                }
            }


            try
            {
                foreach (var item in itemRemove)
                {
                    var txts = item.Split('+');
                    DeleteArtefact(SdmxStructureEnumType.Categorisation, txts[0], txts[1], txts[2]);

                }
            }
            catch (Exception ex)
            {
                throw Utility.Utils.getCustomException("UpdateCategorisationsMetadataSet",
                   @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - " + ex.Message, Infrastructure.STLogging.Interface.LogLevelEnum.Error);
            }

            return true;
        }

        /// <summary>
        /// Updates a DDBDataflow: it controls DDBDataflow and SDMX dataflow are not inconsistent and DDB dataflow is not in production.
        /// If not, it deletes and then creates again the DDB Dataflow.
        /// </summary>
        /// <param name="ddbDF">Dataflow to be updated in DDB.</param>
        /// <param name="msdbDF">SDMX-JSON containing dataflow to be re-created in MSDB.</param>
        /// <param name="msdbCat">SDMX-JSON containing categorisations to be re-created in MSDB.</param>
        /// <param name="msdbDF">HeaderTemplate to be re-created in MSDB.</param>
        /// <returns></returns>
        public string UpdateDDBDataflow(DDBDataflowWithCols ddbDF, string msdbDF, string msdbCat, HeaderTemplate header)
        {
            bool deleted = false;

            // objects for the current version of the dataflow: used for error management
            DDBDataflowWithCols oldDDBDf = null;
            IDataflowMutableObject oldDf = null;
            ISdmxObjects allObjs = null;
            HeaderTemplate oldHeader = null;

            try
            {
                //get current objects for error management
                oldDDBDf = JsonConvert.DeserializeObject<DDBDataflowWithCols>(GetDDBDataflow(ddbDF.IDDataflow));
                oldHeader = JsonConvert.DeserializeObject<HeaderTemplate>(GetDfHeader(ddbDF.ID, ddbDF.Agency, ddbDF.Version));

                allObjs = Sdmx21Connector.GetArtefacts(SdmxStructureEnumType.Dataflow, ddbDF.ID, ddbDF.Agency, ddbDF.Version, StructureReferenceDetailEnumType.Parents);

                //getting the only dataflow
                IEnumerator<IDataflowObject> enumer = allObjs.Dataflows.GetEnumerator();
                enumer.MoveNext();
                oldDf = enumer.Current.MutableInstance;
                IAnnotationMutableObject oldAnn = oldDf.Annotations.Where(x => x.Type == "NonProductionDataflow").SingleOrDefault();

                //a dataflow can be updated only if it is NOT in production
                if (oldAnn == null || oldAnn.Text[0].Value == "false")
                {
                    throw new Exception();
                }

                ISdmxObjects obj = GetSdmxObjectsFromSdmxJson(msdbDF);

                if (obj.Dataflows.Count != 1)
                {
                    throw new Exception();
                }

                //getting the only dataflow
                IEnumerator<IDataflowObject> enumer2 = obj.Dataflows.GetEnumerator();
                enumer2.MoveNext();
                IDataflowObject df = enumer2.Current;

                //controlling coherence between the two structures
                if (!(df.Id == ddbDF.ID && df.AgencyId == ddbDF.Agency && df.Version == ddbDF.Version))
                {
                    throw new Exception();
                }
            }
            catch (Exception ex)
            {
                throw Utility.Utils.getCustomException("DF_UPDATE_ERROR",
                   @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - " + ex.Message, Infrastructure.STLogging.Interface.LogLevelEnum.Error);
            }

            //delete and recreate dataflow
            try
            {
                _logger.Log("Deleting the old dataflow (both on MSDB and DDB)", Infrastructure.STLogging.Interface.LogLevelEnum.Info);
                DeleteDDBDataflow(ddbDF.IDDataflow, ref deleted);

                _logger.Log("Recreating the old dataflow (both on MSDB and DDB)", Infrastructure.STLogging.Interface.LogLevelEnum.Info);
                string res = CreateDDBDataflow(ddbDF, msdbDF, msdbCat, header);
                return res;
            }
            catch (Exception ex)
            {
                if (deleted)
                {
                    int dfId = int.Parse(CreateDDBDataflow(oldDDBDf, oldDf.ImmutableInstance, allObjs, oldHeader));
                    _logger.Log("Rollback: recreating old dataflow (both on MSDB and DDB)", Infrastructure.STLogging.Interface.LogLevelEnum.Info);

                    //adding to Exception new Dataflow Id
                    try
                    {
                        var tmpObj = JObject.Parse(ex.Message);
                        tmpObj["dfNewId"] = dfId;
                        throw new ApplicationException(JsonConvert.SerializeObject(tmpObj));
                    }
                    catch (Exception ex2)
                    {
                        _logger.Log(ex2.Message, Infrastructure.STLogging.Interface.LogLevelEnum.Error);
                        throw ex;
                    }
                }
                else
                    throw ex;
            }
        }

        #region Metodi di Utilità

        /// <summary>
        /// Metodo di utilità che restiuisce l'SDMX-JSON generato a partire da un insieme di SdmxObjects
        /// </summary>
        /// <param name="sdmxObjects"></param>
        /// <returns>Stringa contenente l'SDMX-JSON generato.</returns>
        public string GetSdmxJsonFromSdmxObjects(ISdmxObjects sdmxObjects)
        {
            JObject result = null;
            Org.Sdmxsource.Util.HeaderScope.WriteUrn = true;
            foreach (var language in appConfig.DataManagement.DataLanguages)
            {
                SdmxStructureJsonFormat format = new SdmxStructureJsonFormat(
                    new PreferedLanguageTranslator(new List<CultureInfo>(), new List<CultureInfo>(), new CultureInfo(language.Code)),
                    StructureOutputFormatEnumType.JsonV10
                );
                MemoryStream stream = new MemoryStream();
                StructureWriterEngineJsonV1 swe = new StructureWriterEngineJsonV1(stream, format);
                swe.WriteStructures(sdmxObjects);

                var strJson = Encoding.UTF8.GetString(stream.ToArray());
                strJson = strJson.Substring(strJson.IndexOf("{"));

                if (result == null)
                {
                    result = JObject.Parse(strJson);
                }
                else
                {
                    result.Merge(JsonConvert.DeserializeObject(strJson), new JsonMergeSettings
                    {
                        MergeArrayHandling = MergeArrayHandling.Merge
                    });
                }
            }

            if (sdmxObjects.HasMetadataStructures)
            {
                result.Merge(JsonConvert.DeserializeObject(SerializeMetadatastructure(sdmxObjects.MetadataStructures)), new JsonMergeSettings
                {
                    MergeArrayHandling = MergeArrayHandling.Merge
                });
            }
            if (sdmxObjects.HasMetadataflows)
            {
                result.Merge(JsonConvert.DeserializeObject(SerializeMetadataflow(sdmxObjects.Metadataflows)), new JsonMergeSettings
                {
                    MergeArrayHandling = MergeArrayHandling.Merge
                });
            }
            if (sdmxObjects.HasDataProviderSchemes)
            {
                result.Merge(JsonConvert.DeserializeObject(ArtefactDataModel.BL.Utility.ConvertToJson(sdmxObjects.DataProviderSchemes)), new JsonMergeSettings
                {
                    MergeArrayHandling = MergeArrayHandling.Merge
                });
            }
            if (sdmxObjects.HasDataConsumerSchemes)
            {
                result.Merge(JsonConvert.DeserializeObject(ArtefactDataModel.BL.Utility.ConvertToJson(sdmxObjects.DataConsumerSchemes)), new JsonMergeSettings
                {
                    MergeArrayHandling = MergeArrayHandling.Merge
                });
            }
            if (sdmxObjects.HasOrganisationUnitSchemes)
            {
                result.Merge(JsonConvert.DeserializeObject(ArtefactDataModel.BL.Utility.ConvertToJson(sdmxObjects.OrganisationUnitSchemes)), new JsonMergeSettings
                {
                    MergeArrayHandling = MergeArrayHandling.Merge
                });
            }
            if (sdmxObjects.HasHierarchicalCodelists)
            {
                result.Merge(JsonConvert.DeserializeObject(ArtefactDataModel.BL.Utility.ConvertToJson(sdmxObjects.HierarchicalCodelists)), new JsonMergeSettings
                {
                    MergeArrayHandling = MergeArrayHandling.Merge
                });
            }

            return result.ToString();
        }

        private string SerializeMetadatastructure(ISet<IMetadataStructureDefinitionObject> metadataStructures)
        {
            var allMetadataStructure = new List<MetadataStructureDTO>();
            foreach (var item in metadataStructures)
            {
                var itemParse = new MetadataStructureDTO();
                itemParse.Id = item.Id;
                itemParse.AgencyID = item.AgencyId;
                itemParse.Version = item.Version;
                itemParse.IsFinal = item.IsFinal.IsTrue;
                itemParse.Urn = item.Urn.ToString();
                itemParse.IsExternalReference = item.IsExternalReference.IsTrue;
                itemParse.Links.Add(new MetadataStructureDTO.Link
                {
                    rel = "self",
                    urn = item.Urn.ToString(),
                    type = item.StructureType.StructureType.ToLowerInvariant()
                });

                itemParse.Annotations = createAnnotationMetadataStructureDTO(item.Annotations);

                foreach (var name in item.Names)
                {
                    itemParse.Names.Add(name.Locale, name.Value);
                }
                foreach (var desc in item.Descriptions)
                {
                    itemParse.Descriptions.Add(desc.Locale, desc.Value);
                }
                foreach (var target in item.MetadataTargets)
                {
                    var itemTarget = new MetadataStructureDTO.MetadataTarget();
                    itemTarget.Id = target.Id;
                    itemTarget.Type = ArtefactDataModel.BL.Utility.GetArtefactTypeString(target.StructureType.EnumType);

                    foreach (var identTarget in target.IdentifiableTarget)
                    {
                        var itemIdentifi = new MetadataStructureDTO.Identifiabletarget();
                        itemIdentifi.Id = identTarget.Id;
                        itemIdentifi.ObjectType = identTarget.ReferencedStructureType.ToEnumType().ToString();
                        if (identTarget.ConceptRef != null)
                        {
                            itemIdentifi.LocalRepresentation.Enumeration = identTarget.ConceptRef.TargetUrn.ToString();
                        }
                        else if (identTarget?.Representation?.Representation?.TargetUrn != null)
                        {

                            itemIdentifi.LocalRepresentation.Enumeration = identTarget?.Representation?.Representation?.TargetUrn.ToString();
                        }

                        if (identTarget?.Representation?.TextFormat?.TextType?.EnumType != null)
                        {
                            itemIdentifi.LocalRepresentation.TextFormat.TextType = identTarget.Representation.TextFormat.TextType.EnumType.ToString();
                        }
                        itemIdentifi.Annotations = createAnnotationMetadataStructureDTO(identTarget.Annotations);
                        itemTarget.IdentifiableTarget.Add(itemIdentifi);
                    }
                    itemTarget.Annotations = createAnnotationMetadataStructureDTO(target.Annotations);
                    itemParse.MetadataStructureComponents.MetadataTargetList.MetadataTargets.Add(itemTarget);
                }
                foreach (var report in item.ReportStructures)
                {
                    var itemReport = new MetadataStructureDTO.Reportstructure();
                    itemReport.Id = report.Id;
                    foreach (var itemRef in report.TargetMetadatas)
                    {
                        itemReport.MetadataTargetId.Add(itemRef);
                    }
                    foreach (var attrMetadata in report.MetadataAttributes)
                    {
                        var itemMetadatata = new MetadataStructureDTO.MetadataAttribute();
                        itemMetadatata.Id = attrMetadata.Id;
                        itemMetadatata.MaxOccurs = attrMetadata.MaxOccurs.HasValue ? attrMetadata.MaxOccurs.Value.ToString() : "unbounded";
                        itemMetadatata.MinOccurs = attrMetadata.MinOccurs.HasValue ? attrMetadata.MinOccurs.Value.ToString() : "unbounded";
                        itemMetadatata.IsPresentational = attrMetadata.Presentational.IsTrue;
                        if (attrMetadata.ConceptRef != null)
                        {
                            itemMetadatata.ConceptIdentity = attrMetadata.ConceptRef.TargetUrn.ToString();
                        }
                        if (attrMetadata?.Representation?.TextFormat?.TextType?.EnumType != null)
                        {
                            itemMetadatata.LocalRepresentation.TextFormat.TextType = attrMetadata.Representation.TextFormat.TextType.EnumType.ToString();
                        }
                        if (attrMetadata?.Representation?.Representation?.TargetUrn != null)
                        {
                            itemMetadatata.LocalRepresentation.Enumeration = attrMetadata?.Representation?.Representation?.TargetUrn.ToString();
                        }
                        popolateMetadataAttribute(itemMetadatata, attrMetadata.MetadataAttributes);
                        itemMetadatata.Annotations = createAnnotationMetadataStructureDTO(attrMetadata.Annotations);
                        itemReport.MetadataAttributeList.MetadataAttributes.Add(itemMetadatata);
                    }
                    itemReport.Annotations = createAnnotationMetadataStructureDTO(report.Annotations);

                    itemParse.MetadataStructureComponents.ReportStructureList.ReportStructures.Add(itemReport);
                }

                allMetadataStructure.Add(itemParse);
            }

            var serialize = JsonConvert.SerializeObject(allMetadataStructure, new JsonSerializerSettings { ContractResolver = new CamelCasePropertyNamesContractResolver() });
            return "{\"data\": { \"msds\":" + serialize + "} }";
        }

        private List<MetadataStructureDTO.Annotation> createAnnotationMetadataStructureDTO(IList<IAnnotation> annotations)
        {
            var listAnnotation = new List<MetadataStructureDTO.Annotation>();
            foreach (var itemAnnotation in annotations)
            {
                var itemAdd = new MetadataStructureDTO.Annotation();
                itemAdd.Title = itemAnnotation.Title;
                itemAdd.Type = itemAnnotation.Type;
                itemAdd.Id = itemAnnotation.Id;
                foreach (var itemText in itemAnnotation.Text)
                {
                    itemAdd.Texts.Add(itemText.Locale, itemText.Value);
                }
                listAnnotation.Add(itemAdd);
            }

            return listAnnotation;
        }

        private void popolateMetadataAttribute(MetadataStructureDTO.MetadataAttribute metadatata, IList<IMetadataAttributeObject> listAttrMetadata)
        {
            if (listAttrMetadata == null)
            {
                return;
            }
            foreach (var attrMetadata in listAttrMetadata)
            {
                var itemMetadatata = new MetadataStructureDTO.MetadataAttribute();
                itemMetadatata.Id = attrMetadata.Id;
                itemMetadatata.MaxOccurs = attrMetadata.MaxOccurs.HasValue ? attrMetadata.MaxOccurs.Value.ToString() : "unbounded";
                itemMetadatata.MinOccurs = attrMetadata.MinOccurs.HasValue ? attrMetadata.MinOccurs.Value.ToString() : "unbounded";
                itemMetadatata.IsPresentational = attrMetadata.Presentational.IsTrue;
                if (attrMetadata.ConceptRef != null)
                {
                    itemMetadatata.ConceptIdentity = attrMetadata.ConceptRef.TargetUrn.ToString();
                }
                if (attrMetadata?.Representation?.TextFormat?.TextType?.EnumType != null)
                {
                    itemMetadatata.LocalRepresentation.TextFormat.TextType = attrMetadata.Representation.TextFormat.TextType.EnumType.ToString();
                }
                if (attrMetadata?.Representation?.Representation?.TargetUrn != null)
                {
                    itemMetadatata.LocalRepresentation.Enumeration = attrMetadata?.Representation?.Representation?.TargetUrn.ToString();
                }
                itemMetadatata.Annotations = createAnnotationMetadataStructureDTO(attrMetadata.Annotations);
                popolateMetadataAttribute(itemMetadatata, attrMetadata.MetadataAttributes);
                metadatata.MetadataAttributes.Add(itemMetadatata);
            }
        }

        private string SerializeMetadataflow(ISet<IMetadataFlow> metadataflows)
        {
            var allMetadataFlow = new List<MetadataFlowDTO>();
            foreach (var item in metadataflows)
            {
                var metadataFlow = new MetadataFlowDTO();
                metadataFlow.Id = item.Id;
                metadataFlow.AgencyID = item.AgencyId;
                metadataFlow.Version = item.Version;
                metadataFlow.IsFinal = item.IsFinal.IsTrue;
                metadataFlow.Urn = item.Urn.ToString();
                metadataFlow.Links.Add(new MetadataFlowDTO.Link
                {
                    rel = "self",
                    urn = item.Urn.ToString(),
                    type = item.StructureType.StructureType.ToLowerInvariant()
                });

                if (item.StartDate != null)
                {
                    metadataFlow.ValidFrom = item.StartDate.Date;
                }
                else
                {
                    metadataFlow.ValidFrom = null;
                }
                if (item.EndDate != null)
                {
                    metadataFlow.ValidTo = item.EndDate.Date;
                }
                else
                {
                    metadataFlow.ValidTo = null;
                }


                foreach (var name in item.Names)
                {
                    metadataFlow.Names.Add(name.Locale, name.Value);
                }
                foreach (var description in item.Descriptions)
                {
                    metadataFlow.Descriptions.Add(description.Locale, description.Value);
                }

                if (item.MetadataStructureRef != null)
                {
                    metadataFlow.Structure = item.MetadataStructureRef.TargetUrn.ToString();
                }

                metadataFlow.Annotations = createAnnotationMetadataStructureDTO(item.Annotations);

                allMetadataFlow.Add(metadataFlow);
            }

            var serialize = JsonConvert.SerializeObject(allMetadataFlow, new JsonSerializerSettings { ContractResolver = new CamelCasePropertyNamesContractResolver() });
            return "{\"data\": { \"metadataflows\":" + serialize + "} }";
        }

        /// <summary>
        /// Metodo di utilità che restiuisce l'SDMXML generato a partire da un insieme di SdmxObjects
        /// </summary>
        /// <param name="sdmxObjects"></param>
        /// <returns>Stringa contenente l'SDMXML generato.</returns>
        public string GetSdmxMlFromSdmxObjects(ISdmxObjects sdmxObjects)
        {
            MemoryStream xmlOutStream = new MemoryStream();
            StructureWriterEngineV21 xmlWriterEngine = new StructureWriterEngineV21(xmlOutStream);
            xmlWriterEngine.WriteStructures(sdmxObjects);

            return Encoding.Default.GetString(xmlOutStream.ToArray());
        }

        /// <summary>
        /// Metodo di utilità che parsa un SDMX-JSON e restituisce un insieme di SdmxObjects in esso contenuti
        /// </summary>
        /// <param name="json"></param>
        /// <returns>l'insieme di SdmxObjects contenuti nel file json</returns>
        public ISdmxObjects GetSdmxObjectsFromSdmxJson(string json)
        {
            SdmxStructureJsonFormat format = new SdmxStructureJsonFormat(
               new PreferedLanguageTranslator(new List<CultureInfo>(), new List<CultureInfo>(), new CultureInfo("en")),
               StructureOutputFormatEnumType.JsonV10
            );

            Encoding encoding = Encoding.UTF8;
            MemoryReadableLocation mrl = new MemoryReadableLocation(encoding.GetBytes(json));

            IStructureParsingManager pm = new StructureParsingJsonManager(format);
            IStructureWorkspace sw = pm.ParseStructures(mrl);

            ISdmxObjects bean = sw.GetStructureObjects(false);

            JObject objGeneric = JObject.Parse(json);
            if (objGeneric["data"] != null && objGeneric["data"]["dataStructures"] != null)
            {
                ParseDSD(bean, objGeneric["data"]["dataStructures"]);
            }
            if (objGeneric["data"] != null && objGeneric["data"]["metadataflows"] != null)
            {
                ParseMetadataflow(bean, objGeneric["data"]["metadataflows"]);
            }
            if (objGeneric["data"] != null && objGeneric["data"]["msds"] != null)
            {
                ParseMetadatastructure(bean, objGeneric["data"]["msds"]);
            }
            if (objGeneric["data"] != null && objGeneric["data"]["contentConstraints"] != null)
            {
                ParseContentConstraints(bean, objGeneric["data"]["contentConstraints"]);
            }
            if (objGeneric["data"] != null && objGeneric["data"]["dataConsumerSchemes"] != null)
            {
                ArtefactDataModel.BL.Utility.ParseDataConsumerSchemes(bean, objGeneric["data"]["dataConsumerSchemes"]);
            }
            if (objGeneric["data"] != null && objGeneric["data"]["dataProviderSchemes"] != null)
            {
                ArtefactDataModel.BL.Utility.ParseDataProviderScheme(bean, objGeneric["data"]["dataProviderSchemes"]);
            }
            if (objGeneric["data"] != null && objGeneric["data"]["organisationUnitSchemes"] != null)
            {
                ArtefactDataModel.BL.Utility.ParseOrganisationUnitSchemes(bean, objGeneric["data"]["organisationUnitSchemes"]);
            }

            return bean;
        }

        private void ParseDSD(ISdmxObjects bean, JToken dataStructures)
        {
            foreach (var item in dataStructures)
            {
                var dsd = JsonConvert.DeserializeObject<DataStructureDTO>(item.ToString());
                IDataStructureMutableObject dataStructureMutableCore = new DataStructureMutableCore();
                foreach (var name in dsd.names)
                {
                    dataStructureMutableCore.AddName(name.Key, name.Value);
                }
                if (dsd.description != null)
                {
                    foreach (var desc in dsd.descriptions)
                    {
                        dataStructureMutableCore.AddName(desc.Key, desc.Value);
                    }
                }
                dataStructureMutableCore.Id = dsd.id;
                dataStructureMutableCore.AgencyId = dsd.agencyID;
                dataStructureMutableCore.Version = dsd.version;
                if (dsd.validFrom > DateTime.MinValue)
                {
                    dataStructureMutableCore.StartDate = dsd.validFrom;
                }
                if (dsd.validTo > DateTime.MinValue)
                {
                    dataStructureMutableCore.EndDate = dsd.validTo;
                }

                dataStructureMutableCore.FinalStructure = TertiaryBool.ParseBoolean(dsd.isFinal);

                if (dsd.annotations != null)
                {
                    foreach (var itemAnn in dsd.annotations)
                    {
                        var annItemCore = new AnnotationMutableCore();
                        if (!string.IsNullOrWhiteSpace(itemAnn.Id))
                        {
                            annItemCore.Id = itemAnn.Id;
                        }
                        if (!string.IsNullOrWhiteSpace(itemAnn.Title))
                        {
                            annItemCore.Title = itemAnn.Title;
                        }
                        if (!string.IsNullOrWhiteSpace(itemAnn.Type))
                        {
                            annItemCore.Type = itemAnn.Type;
                        }
                        if (itemAnn.Texts != null)
                        {
                            foreach (var itemTxt in itemAnn.Texts)
                            {
                                annItemCore.AddText(new TextTypeWrapperMutableCore { Locale = itemTxt.Key, Value = itemTxt.Value });
                            }
                        }
                        dataStructureMutableCore.AddAnnotation(annItemCore);
                    }
                }

                if (dsd.dataStructureComponents != null)
                {
                    if (dsd.dataStructureComponents.attributeList != null)
                    {
                        foreach (var itemAttr in dsd.dataStructureComponents.attributeList.attributes)
                        {
                            IAttributeMutableObject attr = new AttributeMutableCore();
                            attr.Id = itemAttr.id;
                            attr.AssignmentStatus = itemAttr.assignmentStatus;
                            if (itemAttr.conceptRoles != null)
                            {
                                foreach (var itemRole in itemAttr.conceptRoles)
                                {
                                    attr.AddConceptRole(SetConceptRole(itemRole));
                                }
                            }
                            attr.ConceptRef = SetConceptRef(itemAttr.conceptIdentity);
                            attr.Representation = SetRappresentation(itemAttr.localRepresentation, true);
                            if (itemAttr.attributeRelationship != null)
                            {
                                if (!string.IsNullOrWhiteSpace(itemAttr.attributeRelationship.primaryMeasure))
                                {
                                    attr.PrimaryMeasureReference = itemAttr.attributeRelationship.primaryMeasure;
                                    attr.AttachmentLevel = AttributeAttachmentLevel.Observation;
                                }
                                else if (itemAttr.attributeRelationship.attachmentGroups != null && itemAttr.attributeRelationship.attachmentGroups.Length > 0)
                                {
                                    attr.AttachmentGroup = itemAttr.attributeRelationship.attachmentGroups[0];
                                    attr.AttachmentLevel = AttributeAttachmentLevel.Group;
                                }
                                else if (itemAttr.attributeRelationship.dimensions != null)
                                {
                                    attr.AttachmentLevel = AttributeAttachmentLevel.DimensionGroup;
                                    foreach (var itemStr in itemAttr.attributeRelationship.dimensions)
                                    {
                                        attr.DimensionReferences.Add(itemStr);
                                    }
                                }
                                else
                                {
                                    attr.AttachmentLevel = AttributeAttachmentLevel.DataSet;
                                }
                            }
                            if (itemAttr.annotations != null)
                            {
                                foreach (var itemAnn in itemAttr.annotations)
                                {
                                    var annItemCore = new AnnotationMutableCore();
                                    if (!string.IsNullOrWhiteSpace(itemAnn.Id))
                                    {
                                        annItemCore.Id = itemAnn.Id;
                                    }
                                    if (!string.IsNullOrWhiteSpace(itemAnn.Title))
                                    {
                                        annItemCore.Title = itemAnn.Title;
                                    }
                                    if (!string.IsNullOrWhiteSpace(itemAnn.Type))
                                    {
                                        annItemCore.Type = itemAnn.Type;
                                    }
                                    if (itemAnn.Texts != null)
                                    {
                                        foreach (var itemTxt in itemAnn.Texts)
                                        {
                                            annItemCore.AddText(new TextTypeWrapperMutableCore { Locale = itemTxt.Key, Value = itemTxt.Value });
                                        }
                                    }
                                    attr.AddAnnotation(annItemCore);
                                }
                            }
                            dataStructureMutableCore.AddAttribute(attr);
                        }
                    }

                    if (dsd.dataStructureComponents.dimensionList != null)
                    {
                        var allDim = new Dictionary<int, IDimensionMutableObject>();

                        if (dsd.dataStructureComponents.dimensionList.dimensions != null)
                        {
                            foreach (var itemDim in dsd.dataStructureComponents.dimensionList.dimensions)
                            {
                                IDimensionMutableObject dim = new DimensionMutableCore();
                                dim.Id = itemDim.id;
                                if (itemDim.conceptRoles != null)
                                {
                                    foreach (var itemRole in itemDim.conceptRoles)
                                    {
                                        dim.ConceptRole.Add(SetConceptRole(itemRole));
                                    }
                                }
                                dim.ConceptRef = SetConceptRef(itemDim.conceptIdentity);
                                dim.Representation = SetRappresentation(itemDim.localRepresentation, true);
                                if (dim.Id.Equals("FREQ", StringComparison.InvariantCultureIgnoreCase))
                                {
                                    dim.FrequencyDimension = true;
                                }
                                if (itemDim.annotations != null)
                                {
                                    foreach (var itemAnn in itemDim.annotations)
                                    {
                                        var annItemCore = new AnnotationMutableCore();
                                        annItemCore.Id = itemAnn.Id;
                                        annItemCore.Title = itemAnn.Title;
                                        annItemCore.Type = itemAnn.Type;
                                        if (itemAnn.Texts != null)
                                        {
                                            foreach (var itemTxt in itemAnn.Texts)
                                            {
                                                annItemCore.AddText(new TextTypeWrapperMutableCore { Locale = itemTxt.Key, Value = itemTxt.Value });
                                            }
                                        }
                                        dim.AddAnnotation(annItemCore);
                                    }
                                }
                                var i = itemDim.position;
                                while (allDim.ContainsKey(i))
                                {
                                    i++;
                                }
                                allDim.Add(i, dim);
                            }
                        }
                        if (dsd.dataStructureComponents.dimensionList.measureDimensions != null)
                        {
                            foreach (var itemDim in dsd.dataStructureComponents.dimensionList.measureDimensions)
                            {
                                IDimensionMutableObject dim = new DimensionMutableCore();
                                dim.Id = itemDim.id;
                                dim.MeasureDimension = true;
                                if (itemDim.conceptRoles != null)
                                {
                                    foreach (var itemRole in itemDim.conceptRoles)
                                    {
                                        dim.ConceptRole.Add(SetConceptRole(itemRole));
                                    }
                                }
                                dim.ConceptRef = SetConceptRef(itemDim.conceptIdentity);
                                dim.Representation = SetRappresentation(itemDim.localRepresentation, false);
                                if (itemDim.annotations != null)
                                {
                                    foreach (var itemAnn in itemDim.annotations)
                                    {
                                        var annItemCore = new AnnotationMutableCore();
                                        if (!string.IsNullOrWhiteSpace(itemAnn.Id))
                                        {
                                            annItemCore.Id = itemAnn.Id;
                                        }
                                        if (!string.IsNullOrWhiteSpace(itemAnn.Title))
                                        {
                                            annItemCore.Title = itemAnn.Title;
                                        }
                                        if (!string.IsNullOrWhiteSpace(itemAnn.Type))
                                        {
                                            annItemCore.Type = itemAnn.Type;
                                        }
                                        if (itemAnn.Texts != null)
                                        {
                                            foreach (var itemTxt in itemAnn.Texts)
                                            {
                                                annItemCore.AddText(new TextTypeWrapperMutableCore { Locale = itemTxt.Key, Value = itemTxt.Value });
                                            }
                                        }
                                        dim.AddAnnotation(annItemCore);
                                    }
                                }
                                var i = itemDim.position;
                                while (allDim.ContainsKey(i))
                                {
                                    i++;
                                }
                                allDim.Add(i, dim);
                            }
                        }
                        if (dsd.dataStructureComponents.dimensionList.timeDimensions != null)
                        {
                            foreach (var itemDim in dsd.dataStructureComponents.dimensionList.timeDimensions)
                            {
                                IDimensionMutableObject dim = new DimensionMutableCore();
                                dim.Id = itemDim.id;
                                dim.TimeDimension = true;
                                if (itemDim.conceptRoles != null)
                                {
                                    foreach (var itemRole in itemDim.conceptRoles)
                                    {
                                        dim.ConceptRole.Add(SetConceptRole(itemRole));
                                    }
                                }
                                dim.ConceptRef = SetConceptRef(itemDim.conceptIdentity);
                                dim.Representation = SetRappresentation(itemDim.localRepresentation, true);
                                if (itemDim.annotations != null)
                                {
                                    foreach (var itemAnn in itemDim.annotations)
                                    {
                                        var annItemCore = new AnnotationMutableCore();
                                        if (!string.IsNullOrWhiteSpace(itemAnn.Id))
                                        {
                                            annItemCore.Id = itemAnn.Id;
                                        }
                                        if (!string.IsNullOrWhiteSpace(itemAnn.Title))
                                        {
                                            annItemCore.Title = itemAnn.Title;
                                        }
                                        if (!string.IsNullOrWhiteSpace(itemAnn.Type))
                                        {
                                            annItemCore.Type = itemAnn.Type;
                                        }
                                        if (itemAnn.Texts != null)
                                        {
                                            foreach (var itemTxt in itemAnn.Texts)
                                            {
                                                annItemCore.AddText(new TextTypeWrapperMutableCore { Locale = itemTxt.Key, Value = itemTxt.Value });
                                            }
                                        }
                                        dim.AddAnnotation(annItemCore);
                                    }
                                }
                                var i = itemDim.position;
                                while (allDim.ContainsKey(i))
                                {
                                    i++;
                                }
                                allDim.Add(i, dim);
                            }
                        }
                        var list = allDim.Keys.ToList();
                        list.Sort();
                        foreach (var key in list)
                        {
                            dataStructureMutableCore.AddDimension(allDim[key]);
                        }
                    }

                    if (dsd.dataStructureComponents.measureList != null && dsd.dataStructureComponents.measureList.primaryMeasure != null)
                    {
                        dataStructureMutableCore.PrimaryMeasure = new PrimaryMeasureMutableCore();
                        dataStructureMutableCore.PrimaryMeasure.ConceptRef = SetConceptRef(dsd.dataStructureComponents.measureList.primaryMeasure.conceptIdentity);
                        dataStructureMutableCore.PrimaryMeasure.Representation = SetRappresentation(dsd.dataStructureComponents.measureList.primaryMeasure.localRepresentation, true);
                        if (dsd.dataStructureComponents.measureList.primaryMeasure.annotations != null)
                        {
                            foreach (var itemAnn in dsd.dataStructureComponents.measureList.primaryMeasure.annotations)
                            {
                                var annItemCore = new AnnotationMutableCore();
                                if (!string.IsNullOrWhiteSpace(itemAnn.Id))
                                {
                                    annItemCore.Id = itemAnn.Id;
                                }
                                if (!string.IsNullOrWhiteSpace(itemAnn.Title))
                                {
                                    annItemCore.Title = itemAnn.Title;
                                }
                                if (!string.IsNullOrWhiteSpace(itemAnn.Type))
                                {
                                    annItemCore.Type = itemAnn.Type;
                                }
                                if (itemAnn.Texts != null)
                                {
                                    foreach (var itemTxt in itemAnn.Texts)
                                    {
                                        annItemCore.AddText(new TextTypeWrapperMutableCore { Locale = itemTxt.Key, Value = itemTxt.Value });
                                    }
                                }
                                dataStructureMutableCore.PrimaryMeasure.AddAnnotation(annItemCore);
                            }
                        }
                    }

                    if (dsd.dataStructureComponents.groups != null)
                    {
                        foreach (var itemGrp in dsd.dataStructureComponents.groups)
                        {
                            IGroupMutableObject group = new GroupMutableCore();
                            group.Id = itemGrp.id;
                            foreach (var itemGrpDim in itemGrp.groupDimensions)
                            {
                                group.DimensionRef.Add(itemGrpDim);
                            }
                            dataStructureMutableCore.AddGroup(group);
                        }
                    }

                }
                bean.AddDataStructure(dataStructureMutableCore.ImmutableInstance);
            }
        }
        private StructureReferenceImpl SetConceptRef(string conceptIdentity)
        {
            if (string.IsNullOrWhiteSpace(conceptIdentity))
            {
                return null;
            }
            var conceptIdentitySplit = conceptIdentity.Split('=');
            var conceptAgencyId = "";
            var conceptId = "";
            var conceptVersion = "";
            string conceptType = null;
            if (conceptIdentitySplit.Length > 1)
            {
                conceptIdentitySplit[1] = conceptIdentitySplit[1].Replace('(', '+').Replace(')', '+').Replace(':', '+');
                var tmpSplit = conceptIdentitySplit[1].Split('+');
                conceptAgencyId = tmpSplit[0];
                conceptId = tmpSplit[1];
                conceptVersion = tmpSplit[2];
                if (tmpSplit.Length > 3)
                {
                    conceptType = tmpSplit[3].Replace(".", "");
                }
                return new StructureReferenceImpl
                (
                    conceptAgencyId,
                    conceptId,
                    conceptVersion,
                    SdmxStructureEnumType.Concept,
                    conceptType
                );
            }
            return null;
        }
        private StructureReferenceImpl SetConceptRole(string conceptRole)
        {
            if (string.IsNullOrWhiteSpace(conceptRole))
            {
                return null;
            }
            var conceptIdentitySplit = conceptRole.Split('=');
            var conceptAgencyId = "";
            var conceptId = "";
            var conceptVersion = "";
            string conceptType = null;
            if (conceptIdentitySplit.Length > 1)
            {
                conceptIdentitySplit[1] = conceptIdentitySplit[1].Replace('(', '+').Replace(')', '+').Replace(':', '+');
                var tmpSplit = conceptIdentitySplit[1].Split('+');
                conceptAgencyId = tmpSplit[0];
                conceptId = tmpSplit[1];
                conceptVersion = tmpSplit[2];
                if (tmpSplit.Length > 3)
                {
                    conceptType = tmpSplit[3].Replace(".", "");
                }
                return new StructureReferenceImpl
                (
                    conceptAgencyId,
                    conceptId,
                    conceptVersion,
                    SdmxStructureEnumType.Concept,
                    conceptType
                );
            }
            return null;
        }

        private RepresentationMutableCore SetRappresentation(DataStructureDTO.Localrepresentation representation, bool codeList)
        {
            if (representation != null && !string.IsNullOrWhiteSpace(representation.enumeration))
            {
                var rapIdentitySplit = representation.enumeration.Split('=');
                var rapAgencyId = "";
                var rapId = "";
                var rapVersion = "";
                if (rapIdentitySplit.Length > 1)
                {
                    rapIdentitySplit[1] = rapIdentitySplit[1].Replace('(', '+').Replace(')', '+').Replace(':', '+');
                    var tmpSplit = rapIdentitySplit[1].Split('+');
                    rapAgencyId = tmpSplit[0];
                    rapId = tmpSplit[1];
                    rapVersion = tmpSplit[2];
                    return new RepresentationMutableCore
                    {
                        Representation =
                        new StructureReferenceImpl
                        (
                            rapAgencyId,
                            rapId,
                            rapVersion,
                            codeList ? SdmxStructureEnumType.CodeList : SdmxStructureEnumType.ConceptScheme,
                            null
                        )
                    };
                }
            }
            return null;
        }

        private void ParseMetadataflow(ISdmxObjects bean, JToken metadataflows)
        {
            foreach (var item in metadataflows)
            {
                var sourceMetadataflow = JsonConvert.DeserializeObject<MetadataflowDTO>(item.ToString());

                var metadataflow = new Org.Sdmx.Resources.SdmxMl.Schemas.V21.Structure.MetadataflowType();
                if (metadataflow.Annotations == null)
                {
                    metadataflow.Annotations = new Org.Sdmx.Resources.SdmxMl.Schemas.V21.Common.Annotations();
                }
                if (metadataflow.Annotations.Annotation == null)
                {
                    metadataflow.Annotations.Annotation = new List<Org.Sdmx.Resources.SdmxMl.Schemas.V21.Common.AnnotationType>();
                }
                foreach (var name in sourceMetadataflow.names)
                {
                    metadataflow.Name.Add(new Org.Sdmx.Resources.SdmxMl.Schemas.V21.Common.Name { lang = name.Key, TypedValue = name.Value });
                }
                if (sourceMetadataflow.descriptions != null)
                {
                    foreach (var desc in sourceMetadataflow.descriptions)
                    {
                        metadataflow.Description.Add(new Org.Sdmx.Resources.SdmxMl.Schemas.V21.Common.Description { lang = desc.Key, TypedValue = desc.Value });
                    }
                }
                metadataflow.id = sourceMetadataflow.id;
                metadataflow.agencyID = sourceMetadataflow.agencyID;
                metadataflow.version = sourceMetadataflow.version;
                if (sourceMetadataflow.validFrom > DateTime.MinValue)
                {
                    metadataflow.validFrom = sourceMetadataflow.validFrom;
                }
                if (sourceMetadataflow.validTo > DateTime.MinValue)
                {
                    metadataflow.validTo = sourceMetadataflow.validTo;
                }

                metadataflow.isFinal = sourceMetadataflow.isFinal;
                if (!string.IsNullOrWhiteSpace(sourceMetadataflow.structure))
                {
                    var subStr = sourceMetadataflow.structure.Substring(sourceMetadataflow.structure.LastIndexOf('=') + 1);

                    var splitOne = subStr.Split(":");

                    int index = splitOne[1].IndexOf(")");
                    if (index > 0)
                    {
                        splitOne[1] = splitOne[1].Substring(0, index);
                    }
                    var splitTwo = splitOne[1].Split("(");

                    var refType = new MetadataStructureRefType();
                    var metadataStructureReferenceType = new MetadataStructureReferenceType();
                    metadataflow.SetStructure(metadataStructureReferenceType);
                    metadataStructureReferenceType.SetTypedRef(refType);
                    refType.id = splitTwo[0];
                    refType.agencyID = splitOne[0];
                    refType.version = splitTwo[1];
                    refType.package = "metadatastructure";
                    refType.@class = "MetadataStructure";
                }

                if (sourceMetadataflow.annotations != null)
                {
                    foreach (var itemAnn in sourceMetadataflow.annotations)
                    {
                        var annItemCore = new Org.Sdmx.Resources.SdmxMl.Schemas.V21.Common.AnnotationType();
                        if (!string.IsNullOrWhiteSpace(itemAnn.id))
                        {
                            annItemCore.id = itemAnn.id;
                        }
                        if (!string.IsNullOrWhiteSpace(itemAnn.title))
                        {
                            annItemCore.AnnotationTitle = itemAnn.title;
                        }
                        if (!string.IsNullOrWhiteSpace(itemAnn.type))
                        {
                            annItemCore.AnnotationType1 = itemAnn.type;
                        }
                        if (itemAnn.texts != null)
                        {
                            foreach (var itemTxt in itemAnn.texts)
                            {
                                var itemText = new Org.Sdmx.Resources.SdmxMl.Schemas.V21.Common.TextType();
                                itemText.lang = itemTxt.Key;
                                itemText.TypedValue = itemTxt.Value;
                                annItemCore.AnnotationText.Add(itemText); ;
                            }
                        }
                        metadataflow.Annotations.Annotation.Add(annItemCore);
                    }
                }

                bean.AddMetadataFlow(new MetadataflowObjectCore(metadataflow));
            }
        }

        private void ParseMetadatastructure(ISdmxObjects bean, JToken metadatastructure)
        {
            foreach (var item in metadatastructure)
            {
                var sourceMetadatastructure = JsonConvert.DeserializeObject<MetadataStructureDTO>(item.ToString());

                var metadatastructureMutable = new MetadataStructureDefinitionMutableCore();

                foreach (var name in sourceMetadatastructure.Names)
                {
                    metadatastructureMutable.AddName(name.Key, name.Value);
                }
                if (sourceMetadatastructure.Description != null)
                {
                    foreach (var desc in sourceMetadatastructure.Descriptions)
                    {
                        metadatastructureMutable.AddDescription(desc.Key, desc.Value);
                    }
                }
                metadatastructureMutable.Id = sourceMetadatastructure.Id;
                metadatastructureMutable.AgencyId = sourceMetadatastructure.AgencyID;
                metadatastructureMutable.Version = sourceMetadatastructure.Version;
                if (sourceMetadatastructure.ValidFrom > DateTime.MinValue)
                {
                    metadatastructureMutable.StartDate = sourceMetadatastructure.ValidFrom;
                }
                if (sourceMetadatastructure.ValidTo > DateTime.MinValue)
                {
                    metadatastructureMutable.EndDate = sourceMetadatastructure.ValidTo;
                }

                foreach (var itemAnnotation in sourceMetadatastructure.Annotations)
                {
                    IAnnotationMutableObject mutableAnnotation = new AnnotationMutableCore
                    {
                        Type = itemAnnotation.Type,
                        Id = itemAnnotation.Id,
                        Title = itemAnnotation.Title
                    };
                    foreach (var itemText in itemAnnotation.Texts)
                    {
                        var textType = new TextTypeWrapperMutableCore { Locale = itemText.Key, Value = itemText.Value };
                        mutableAnnotation.AddText(textType);
                    }
                    metadatastructureMutable.AddAnnotation(mutableAnnotation);
                }

                metadatastructureMutable.FinalStructure = TertiaryBool.ParseBoolean(sourceMetadatastructure.IsFinal);

                foreach (var itemTarget in sourceMetadatastructure?.MetadataStructureComponents?.MetadataTargetList?.MetadataTargets)
                {
                    var metadatataTargetMutable = new MetadataTargetMutableCore
                    {
                        Id = itemTarget.Id,
                        StructureType = SdmxStructureType.GetFromEnum(ArtefactDataModel.BL.Utility.GetArtefactTypeEnum(itemTarget.Type))
                    };
                    foreach (var itemIdentifiableTarget in itemTarget.IdentifiableTarget)
                    {
                        var itemIdentifiableTargetMutable = new IdentifiableTargetMutableCore
                        {
                            Id = itemIdentifiableTarget.Id,
                            ConceptRef = SetConceptRef(itemIdentifiableTarget.LocalRepresentation.Enumeration)
                        };
                        foreach (var itemAnnotation in itemIdentifiableTarget.Annotations)
                        {
                            IAnnotationMutableObject mutableAnnotation = new AnnotationMutableCore
                            {
                                Type = itemAnnotation.Type,
                                Id = itemAnnotation.Id,
                                Title = itemAnnotation.Title
                            };
                            foreach (var itemText in itemAnnotation.Texts)
                            {
                                var textType = new TextTypeWrapperMutableCore { Locale = itemText.Key, Value = itemText.Value };
                                mutableAnnotation.AddText(textType);
                            }
                            itemIdentifiableTargetMutable.AddAnnotation(mutableAnnotation);
                        }
                        metadatataTargetMutable.IdentifiableTarget.Add(itemIdentifiableTargetMutable);
                    }
                    foreach (var itemAnnotation in itemTarget.Annotations)
                    {
                        IAnnotationMutableObject mutableAnnotation = new AnnotationMutableCore
                        {
                            Type = itemAnnotation.Type,
                            Id = itemAnnotation.Id,
                            Title = itemAnnotation.Title
                        };
                        foreach (var itemText in itemAnnotation.Texts)
                        {
                            var textType = new TextTypeWrapperMutableCore { Locale = itemText.Key, Value = itemText.Value };
                            mutableAnnotation.AddText(textType);
                        }
                        metadatataTargetMutable.AddAnnotation(mutableAnnotation);
                    }
                    metadatastructureMutable.MetadataTargets.Add(metadatataTargetMutable);
                }

                foreach (var itemStructure in sourceMetadatastructure?.MetadataStructureComponents?.ReportStructureList?.ReportStructures)
                {
                    var reportStructureMutable = new ReportStructureMutableCore();
                    reportStructureMutable.Id = itemStructure.Id;
                    foreach (var itemAnnotation in itemStructure.Annotations)
                    {
                        IAnnotationMutableObject mutableAnnotation = new AnnotationMutableCore
                        {
                            Type = itemAnnotation.Type,
                            Id = itemAnnotation.Id,
                            Title = itemAnnotation.Title
                        };
                        foreach (var itemText in itemAnnotation.Texts)
                        {
                            var textType = new TextTypeWrapperMutableCore { Locale = itemText.Key, Value = itemText.Value };
                            mutableAnnotation.AddText(textType);
                        }
                        reportStructureMutable.AddAnnotation(mutableAnnotation);
                    }
                    foreach (var itemRef in itemStructure.MetadataTargetId)
                    {
                        reportStructureMutable.TargetMetadatas.Add(itemRef);
                    }
                    foreach (var itemAttribute in itemStructure.MetadataAttributeList?.MetadataAttributes)
                    {
                        reportStructureMutable.MetadataAttributes.Add(createMetadataAttribute(itemAttribute));
                    }
                    foreach (var itemAnnotation in itemStructure.Annotations)
                    {
                        IAnnotationMutableObject mutableAnnotation = new AnnotationMutableCore
                        {
                            Type = itemAnnotation.Type,
                            Id = itemAnnotation.Id,
                            Title = itemAnnotation.Title
                        };
                        foreach (var itemText in itemAnnotation.Texts)
                        {
                            var textType = new TextTypeWrapperMutableCore { Locale = itemText.Key, Value = itemText.Value };
                            mutableAnnotation.AddText(textType);
                        }
                        reportStructureMutable.AddAnnotation(mutableAnnotation);
                    }
                    metadatastructureMutable.ReportStructures.Add(reportStructureMutable);
                }

                bean.AddMetadataStructure(metadatastructureMutable.ImmutableInstance);
            }
        }

        private void ParseContentConstraints(ISdmxObjects bean, JToken contentConstraints)
        {
            foreach (var item in contentConstraints)
            {
                var sourceContentConstraint = JsonConvert.DeserializeObject<ContentConstraintsDTO>(item.ToString());

                IContentConstraintMutableObject contentConstr = new ContentConstraintMutableCore();

                foreach (var name in sourceContentConstraint.Names)
                {
                    contentConstr.AddName(name.Key, name.Value);
                }
                foreach (var name in sourceContentConstraint.Descriptions)
                {
                    contentConstr.AddDescription(name.Key, name.Value);
                }

                contentConstr.Id = sourceContentConstraint.Id;
                contentConstr.AgencyId = sourceContentConstraint.AgencyID;
                contentConstr.Version = sourceContentConstraint.Version;

                contentConstr.ExternalReference = TertiaryBool.ParseBoolean(sourceContentConstraint.ExternalReference);

                if (sourceContentConstraint.ValidFrom > DateTime.MinValue)
                {
                    contentConstr.StartDate = sourceContentConstraint.ValidFrom;
                }
                if (sourceContentConstraint.ValidTo > DateTime.MinValue)
                {
                    contentConstr.EndDate = sourceContentConstraint.ValidTo;
                }

                contentConstr.FinalStructure = TertiaryBool.ParseBoolean(sourceContentConstraint.IsFinal);

                foreach (var itemAnnotation in sourceContentConstraint.Annotations)
                {
                    IAnnotationMutableObject mutableAnnotation = new AnnotationMutableCore
                    {
                        Type = itemAnnotation.Type,
                        Id = itemAnnotation.Id,
                        Title = itemAnnotation.Title
                    };
                    foreach (var itemText in itemAnnotation.Texts)
                    {
                        var textType = new TextTypeWrapperMutableCore { Locale = itemText.Key, Value = itemText.Value };
                        mutableAnnotation.AddText(textType);
                    }
                    contentConstr.AddAnnotation(mutableAnnotation);
                }

                contentConstr.IsDefiningActualDataPresent = sourceContentConstraint.Equals("Actual");
                contentConstr.IncludedCubeRegion = new CubeRegionMutableCore();
                contentConstr.ExcludedCubeRegion = new CubeRegionMutableCore();
                foreach (var itemcube in sourceContentConstraint.CubeRegions)
                {
                    foreach (var itemcubeKey in itemcube.KeyValues)
                    {
                        //var cubeRegion = new CubeRegionMutableCore();
                        var itemKeyValue = new KeyValuesMutableImpl();
                        itemKeyValue.Id = itemcubeKey.Id;
                        foreach (var itemAdd in itemcubeKey.Values)
                        {
                            itemKeyValue.KeyValues.Add(itemAdd);
                        }
                        //cubeRegion.AddKeyValue(itemKeyValue);

                        if (itemcube.IsIncluded)
                        {
                            contentConstr.IncludedCubeRegion.AddKeyValue(itemKeyValue);
                        }
                        else
                        {
                            contentConstr.ExcludedCubeRegion.AddKeyValue(itemKeyValue);
                        }
                    }
                }

                contentConstr.ConstraintAttachment = new ContentConstraintAttachmentMutableCore();

                if (sourceContentConstraint.ConstraintAttachment != null
                    && sourceContentConstraint.ConstraintAttachment.DataStructures != null)
                {
                    foreach (var itemDsd in sourceContentConstraint.ConstraintAttachment.DataStructures)
                    {
                        var substr = itemDsd.Split('=')[1];
                        var artId = substr.Split(':')[1].Split('(')[0];
                        var artAgencyId = substr.Split(':')[0];
                        var artVersion = substr.Split('(')[1].Split(')')[0];
                        contentConstr.ConstraintAttachment.AddStructureReference(new StructureReferenceImpl(artAgencyId, artId, artVersion, SdmxStructureEnumType.Dsd));
                    }
                }
                if (sourceContentConstraint.ConstraintAttachment != null
                    && sourceContentConstraint.ConstraintAttachment.Dataflows != null)
                {
                    foreach (var itemDsd in sourceContentConstraint.ConstraintAttachment.Dataflows)
                    {
                        var substr = itemDsd.Split('=')[1];
                        var artId = substr.Split(':')[1].Split('(')[0];
                        var artAgencyId = substr.Split(':')[0];
                        var artVersion = substr.Split('(')[1].Split(')')[0];
                        contentConstr.ConstraintAttachment.AddStructureReference(new StructureReferenceImpl(artAgencyId, artId, artVersion, SdmxStructureEnumType.Dataflow));
                    }
                }

                bean.AddContentConstraintObject(contentConstr.ImmutableInstance);
            }
        }


        /// <summary>
        /// Metodo di utilità che parsa un SDMX-XML e restituisce un insieme di SdmxObjects in esso contenuti
        /// </summary>
        /// <param name="sdmxML">json</param>
        /// <returns>l'insieme di SdmxObjects contenuti nel file json</returns>
        public ISdmxObjects GetSdmxObjectsFromSdmxML(string sdmxML)
        {
            Encoding encoding = Encoding.UTF8;
            MemoryReadableLocation mrl = new MemoryReadableLocation(encoding.GetBytes(sdmxML));

            IStructureParsingManager pm = new StructureParsingManager();
            IStructureWorkspace sw = pm.ParseStructures(mrl);

            ISdmxObjects bean = sw.GetStructureObjects(false);

            return bean;
        }

        /// <summary>
        /// Get codes of mandatory attributes and dimensions of the cube associated to the dataflow columns.
        /// </summary>
        /// <param name="cube">Cube associated to the dataflow.</param>
        /// <param name="df">The DDB Dataflow.</param>
        /// <returns></returns>
        private List<string> GetDfMandCodes(CubeWithDetails cube, DDBDataflowWithCols df)
        {
            List<string> dfCodes = cube.Dimensions.Where(d => df.DataflowColumns.Contains(d.ColName)).Select(x => x.Code).ToList();
            dfCodes.AddRange(cube.Attributes.Where(a => !a.IsTid && a.IsMandatory && df.DataflowColumns.Contains(a.ColName)).Select(x => x.Code).ToList());
            return dfCodes;
        }

        /// <summary>
        /// Gets a new SDMXObjects with the dataflow to be created and a custom DSD (with annotation CustomDSD) 
        /// to be created if the DDB dataflow has fewer mandatory columns than the original DSD
        /// </summary>
        /// <param name="df">The DDB Dataflow.</param>
        /// <param name="msdbDf">The MSDB Dataflow.</param>
        /// /// <returns>The ISdmxObjects to be created: the df and, eventually, the dsd</returns>
        private ISdmxObjects GetDfWithNewDsd(ref DDBDataflowWithCols df, IDataflowObject msdbDf)
        {
            bool isModif = false;

            //ricavo la dsd associata al dataflow
            CubeWithDetails cube = JsonConvert.DeserializeObject<CubeWithDetails>(DmApiConnector.GetCube(df.IDCube));
            IDataStructureMutableObject dsd = dfProd.GetDsdFromCube(cube);

            //getting codes of mandatory attributes and dimensions of the dataflow
            List<string> dfCodes = GetDfMandCodes(cube, df);

            if (dsd.Attributes != null)
            {
                List<IAttributeMutableObject> mandAtts = dsd.Attributes.Where(a => a.AssignmentStatus == "Mandatory").ToList();

                //removing not selected components from the dsd
                for (int i = mandAtts.Count - 1; i >= 0; i--)
                {
                    if (!dfCodes.Contains(mandAtts[i].Id))
                    {
                        dsd.Attributes.Remove(mandAtts[i]);
                        isModif = true;
                    }
                }
            }

            for (int i = dsd.Dimensions.Count - 1; i >= 0; i--)
            {
                if (!dfCodes.Contains(dsd.Dimensions[i].Id))
                {
                    dsd.Dimensions.RemoveAt(i);
                    isModif = true;
                }
            }

            ISdmxObjects newObjs = new SdmxObjectsImpl();

            //if the DDB dataflow has fewer mandatory columns than the original DSD the new DSD is added
            if (isModif)
            {
                int rnd = new System.Random().Next(0, 999999);
                dsd.Id = dsd.Id + rnd;
                dsd.AgencyId = msdbDf.AgencyId;

                //add annotation 'CustomDSD'
                AnnotationMutableCore ann = new AnnotationMutableCore();
                ann.Type = _nodeConfig.Annotations.CustomDSD;
                ann.Id = _nodeConfig.Annotations.CustomDSD;
                ann.Title = GetEncodedConnectionString();
                dsd.AddAnnotation(ann);

                IDataStructureObject dsdImm = dsd.ImmutableInstance;
                newObjs.AddDataStructure(dsdImm);

                //modifico il riferimento del df alla DSD
                IDataflowMutableObject msDf = msdbDf.MutableInstance;
                msDf.DataStructureRef = dsdImm.AsReference;
                newObjs.AddDataflow(msDf.ImmutableInstance);

                return newObjs;
            }

            //altrimenti creo solo il df come è stato passato
            newObjs.AddDataflow(msdbDf);
            return newObjs;
        }

        /// <summary>
        /// Gets a new SDMXObjects with the dataflow to be deleted and its custom DSD if exists 
        /// </summary>
        /// <param name="df">The DDB Dataflow</param>
        /// <param name="msdbDf">The MSDB Dataflow.</param>
        /// /// <returns>The ISdmxObjects to be deleted: the df and, eventually, the dsd</returns>
        private ISdmxObjects GetDfWithCustomDsd(DDBDataflowWithCols df, IDataflowObject msdbDf)
        {
            //ricavo la dsd associata al dataflow nel MSDB
            ISdmxObjects dsdObj = Sdmx21Connector.GetArtefacts(SdmxStructureEnumType.Dsd,
                msdbDf.DataStructureRef.MaintainableId,
                msdbDf.DataStructureRef.AgencyId,
                msdbDf.DataStructureRef.Version);

            IEnumerator<IDataStructureObject> enum2 = dsdObj.DataStructures.GetEnumerator();
            enum2.MoveNext();
            IDataStructureMutableObject dsd = enum2.Current.MutableInstance;

            ISdmxObjects newObjs = new SdmxObjectsImpl();
            newObjs.AddDataflow(msdbDf);

            //se la dsd ha un annotation CustomDSD la aggiungo tra gli oggetti da eliminare
            foreach (IAnnotationMutableObject ann in dsd.Annotations)
            {
                if (ann.Type == _nodeConfig.Annotations.CustomDSD)
                {
                    IDataStructureObject dsdImm = dsd.ImmutableInstance;
                    newObjs.AddDataStructure(dsdImm);
                    break;
                }
            }
            return newObjs;
        }

        /// <summary>
        /// Add AssociatedCube annotation to Dsd.
        /// </summary>
        /// <param name="c">JSON serialization of the cube.</param>
        private void AddAssdociatedCubeAnnotationToDsd(string c)
        {
            CubeWithDetails cubeDet = JsonConvert.DeserializeObject<CubeWithDetails>(c);
            IDataStructureMutableObject dsd = dfProd.GetDsdFromCube(cubeDet);

            ISdmxObjects newObjs = new SdmxObjectsImpl();

            AnnotationMutableCore ann = new AnnotationMutableCore();
            ann.Type = _nodeConfig.Annotations.AssociatedCube;
            ann.Title = GetEncodedConnectionString();
            ann.Id = GetAssociatedCubeAnnotationId(cubeDet);
            dsd.AddAnnotation(ann);

            IDataStructureObject dsdImm = dsd.ImmutableInstance;
            newObjs.AddDataStructure(dsdImm);

            Sdmx21Connector.UpdateArtefacts(newObjs, false, false);
        }

        /// <summary>
        /// Deletes AssociatedCube annotation from the DSD associated to the cube.
        /// </summary>
        /// <param name="c"></param>
        private void DeleteAssociatedCubeAnnotationFromDsd(string c)
        {
            CubeWithDetails cubeDet = JsonConvert.DeserializeObject<CubeWithDetails>(c);
            IDataStructureMutableObject dsd = dfProd.GetDsdFromCube(cubeDet);

            //Cube with no associated dsd
            if (dsd == null)
                return;

            ISdmxObjects newObjs = new SdmxObjectsImpl();
            string annId = GetAssociatedCubeAnnotationId(cubeDet);

            List<IAnnotationMutableObject> annList = dsd.Annotations.Where(x => x.Type == _nodeConfig.Annotations.AssociatedCube && x.Id == annId).ToList();

            if (annList != null && annList.Count > 0)
            {
                foreach (IAnnotationMutableObject ann in annList)
                {
                    dsd.Annotations.Remove(ann);
                }

                IDataStructureObject dsdImm = dsd.ImmutableInstance;
                newObjs.AddDataStructure(dsdImm);
                Sdmx21Connector.UpdateArtefacts(newObjs, false, false);

            }
        }

        /// <summary>
        /// Returns annotation id for the dsd of the cube
        /// </summary>
        /// <param name="c">The cube</param>
        /// <returns></returns>
        private string GetAssociatedCubeAnnotationId(CubeWithDetails c)
        {
            string tmp = JsonConvert.DeserializeObject<string>(DmApiConnector.GetConnectionString());
            string conn_string = Utility.Utils.Decrypt(tmp, _configuration["ENCRYPTION_PASSW"]);
            return c.Code + "_" + Utility.Utils.EncodeMD5String(conn_string).Substring(0, 10);
        }

        /// <summary>
        /// Returns the encoded string for the connection string
        /// </summary>
        /// <returns></returns>
        private string GetEncodedConnectionString()
        {
            string tmp = JsonConvert.DeserializeObject<string>(DmApiConnector.GetConnectionString());
            string conn_string = Utility.Utils.Decrypt(tmp, _configuration["ENCRYPTION_PASSW"]);
            return Utility.Utils.EncodeMD5String(conn_string);
        }



        #endregion Metodi di Utilità

        #region User

        /// <summary>
        /// Call DMApi to generate a Token for authenticated with all credential (Rules, Functionality, Agency, Cube...)
        /// </summary>
        /// <param name="username"></param>
        /// <param name="password"></param>
        /// <returns>Credential of user or 401 UnAuthorized</returns>
        public User LoginUser(string username, string password)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);
            if (DmApiConnector.IsConfigurated)
            {
                var result = DmApiConnector.LoginUser(username, password);

                if (result != null && result.IsAuthenticated)
                {
                    _nodeConfig.General.Username = username;
                    _nodeConfig.General.Password = password;
                }

                if (result != null && _logger.IsDebugEnabled)
                {
                    _logger.Log($"BusinessLogic LoginUser result: {JsonConvert.SerializeObject(result)}", Infrastructure.STLogging.Interface.LogLevelEnum.Debug);
                }
                else if (result == null && _logger.IsDebugEnabled)
                {
                    _logger.Log($"BusinessLogic LoginUser result: null", Infrastructure.STLogging.Interface.LogLevelEnum.Debug);
                }

                LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);
                return result;
            }
            else
            {
                throw Utility.Utils.getCustomException("NODE_DmApi_NOT_FOUND",
                       @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - Node not found.", Infrastructure.STLogging.Interface.LogLevelEnum.Error);
            }
        }

        /// <summary>
        /// Call DMApi to generate a user in AuthDB
        /// </summary>
        /// <param name="user"></param>
        /// <returns>Credential of new user or 403 Forbidden</returns>
        public User CreateUser(User user)
        {
            var userResult = DmApiConnector.CreateUser(JsonConvert.SerializeObject(user));
            return JsonConvert.DeserializeObject<User>(userResult);
        }

        /// <summary>
        /// Call DMApi to edit a user in AuthDB
        /// </summary>
        /// <param name="user"></param>
        /// <returns>Credential of edited user or 403 Forbidden</returns>
        public User UpdateUser(User user)
        {
            var userResult = DmApiConnector.UpdateUser(JsonConvert.SerializeObject(user));
            return JsonConvert.DeserializeObject<User>(userResult);
        }

        /// <summary>
        /// Call DMApi to delete a user in AuthDB
        /// </summary>
        /// <param name="user"></param>
        /// <returns>true if user exist and deleted or false</returns>
        public bool DeleteUser(User user)
        {
            var userResult = DmApiConnector.DeleteUser(JsonConvert.SerializeObject(user));
            var result = JsonConvert.DeserializeObject<bool>(userResult);
            if (result)
            {
                if (_memoryCache != null)
                { //remove all Proxy HttpClient from Cache
                    _memoryCache.Remove(ProxyHttpClient.CalculateCacheKeyForEndpoint($"{_nodeConfig.General.ID}_{user.Username}", EndPointType.SDMX));
                    _memoryCache.Remove(ProxyHttpClient.CalculateCacheKeyForEndpoint($"{_nodeConfig.General.ID}_{user.Username}", EndPointType.MA));
                    _memoryCache.Remove(ProxyHttpClient.CalculateCacheKeyForEndpoint($"{_nodeConfig.General.ID}_{user.Username}", EndPointType.DM));
                }
            }

            return result;
        }

        public string GetCategoryHierarchy()
        {
            return DmApiConnector.GetCategoryHierarchy();
        }

        public string GetFunctionalityHierarchy()
        {
            return DmApiConnector.GetFunctionalityHierarchy();
        }

        public string GetCubeHierarchy()
        {
            return DmApiConnector.GetCubeHierarchy();
        }

        public UserDataDTO AssignsAll(UserDataDTO userData)
        {
            var result = DmApiConnector.AssignsAll(userData);
            return JsonConvert.DeserializeObject<UserDataDTO>(result);
        }

        public bool AssignCubeOwnership(string cubeCode, string username)
        {
            return DmApiConnector.AssignCubeOwnership(cubeCode, username);
        }

        public bool RecoveryPassword(IUserData user)
        {
            return DmApiConnector.RecoveryPassword(user);
        }

        public bool ChangePassword(string username, string password)
        {
            var result = DmApiConnector.ChangePassword(username, password);
            if (result)
            {
                commonChangePassword(username, password);

                if (_memoryCache != null)
                { //remove all Proxy HttpClient from Cache
                    _memoryCache.Remove(ProxyHttpClient.CalculateCacheKeyForEndpoint($"{_nodeConfig.General.ID}_{username}", EndPointType.SDMX));
                    _memoryCache.Remove(ProxyHttpClient.CalculateCacheKeyForEndpoint($"{_nodeConfig.General.ID}_{username}", EndPointType.MA));
                    _memoryCache.Remove(ProxyHttpClient.CalculateCacheKeyForEndpoint($"{_nodeConfig.General.ID}_{username}", EndPointType.DM));
                }
            }

            return result;
        }

        public bool ChangeMyPassword(string username, string password)
        {
            var result = DmApiConnector.ChangeMyPassword(username, password);
            if (result)
            {
                commonChangePassword(username, password);

                if (_memoryCache != null)
                { //remove all Proxy HttpClient from Cache
                    _memoryCache.Remove(ProxyHttpClient.CalculateCacheKeyForEndpoint($"{_nodeConfig.General.ID}_{username}", EndPointType.SDMX));
                    _memoryCache.Remove(ProxyHttpClient.CalculateCacheKeyForEndpoint($"{_nodeConfig.General.ID}_{username}", EndPointType.MA));
                    _memoryCache.Remove(ProxyHttpClient.CalculateCacheKeyForEndpoint($"{_nodeConfig.General.ID}_{username}", EndPointType.DM));
                }
            }

            return result;
        }

        private void commonChangePassword(string username, string password)
        {
            var identity = _contextAccessor.HttpContext.User.Identity;
            if (identity is System.Security.Claims.ClaimsIdentity)
            {
                var clamims = ((System.Security.Claims.ClaimsIdentity)identity).Claims;
                if (clamims != null)
                {
                    var usernameClaim = clamims.FirstOrDefault(c => c.Type == User.ClaimUsername);
                    var sessionGuidClaim = clamims.FirstOrDefault(c => c.Type == "guidSession");

                    if (sessionGuidClaim != null && usernameClaim != null && usernameClaim.Value.Equals(username, StringComparison.InvariantCultureIgnoreCase))
                    {
                        _contextAccessor.HttpContext.Session.Set(Utils.EncodeMD5String(sessionGuidClaim.Value), Encoding.ASCII.GetBytes(Utils.Encrypt(password, _configuration["ENCRYPTION_PASSW"])));
                    }
                }
            }
        }

        #endregion

        /// <summary>
        /// Try to connect to all Endpoint configurated in Node
        /// </summary>
        /// <returns></returns>
        public bool PingEndPoint()
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);
            //Sdmx21Connector
            try
            {
                _logger.Log($"BusinessLogic PingEndPoint Sdmx21", Infrastructure.STLogging.Interface.LogLevelEnum.Debug);
                var resultPing = Sdmx21Connector.PingEndPoint();
                if (!resultPing)
                {
                    throw Utility.Utils.getCustomException("NODE_Sdmx21_CONNECTION_ERROR",
                           @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - Connection Error.", Infrastructure.STLogging.Interface.LogLevelEnum.Error);
                }
            }
            catch (Exception ex)
            {
                throw Utility.Utils.getCustomException("NODE_Sdmx21_CONNECTION_ERROR",
                           $"Metodo  {System.Reflection.MethodBase.GetCurrentMethod().Name} - {ex.Message}", Infrastructure.STLogging.Interface.LogLevelEnum.Error);
            }
            //DmApiConnector
            try
            {
                _logger.Log($"BusinessLogic PingEndPoint DmApi", Infrastructure.STLogging.Interface.LogLevelEnum.Debug);
                var resultPing = DmApiConnector.PingEndPoint();
                if (!resultPing)
                {
                    throw Utility.Utils.getCustomException("NODE_DmApi_CONNECTION_ERROR",
                           @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - Connection Error.", Infrastructure.STLogging.Interface.LogLevelEnum.Error);
                }
            }
            catch (Exception ex)
            {
                throw Utility.Utils.getCustomException("NODE_DmApi_CONNECTION_ERROR",
                           $"Metodo  {System.Reflection.MethodBase.GetCurrentMethod().Name} - {ex.Message}", Infrastructure.STLogging.Interface.LogLevelEnum.Error);
            }
            //MaApiConnector
            try
            {
                _logger.Log($"BusinessLogic PingEndPoint MaApi", Infrastructure.STLogging.Interface.LogLevelEnum.Debug);
                var resultPing = MaApiConnector.PingEndPoint("");
                if (!resultPing)
                {
                    throw Utility.Utils.getCustomException("NODE_MaApi_CONNECTION_ERROR",
                           @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - Connection Error.", Infrastructure.STLogging.Interface.LogLevelEnum.Error);
                }
            }
            catch (Exception ex)
            {
                throw Utility.Utils.getCustomException("NODE_MaApi_CONNECTION_ERROR",
                           $"Metodo  {System.Reflection.MethodBase.GetCurrentMethod().Name} - {ex.Message}", Infrastructure.STLogging.Interface.LogLevelEnum.Error);
            }

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);
            return true;
        }

        public bool CheckEndPointNSI()
        {
            return Sdmx21Connector.PingEndPoint();
        }
        public bool CheckEndPointMA()
        {
            var pingArtefact = SdmxStructureEnumType.Null;
            if (!string.IsNullOrWhiteSpace(_nodeConfig.Endpoint.PingArtefact))
            {
                pingArtefact = ArtefactDataModel.BL.Utility.GetArtefactTypeEnum(_nodeConfig.Endpoint.PingArtefact);
            }
            if (pingArtefact == SdmxStructureEnumType.Null)
            {
                pingArtefact = SdmxStructureEnumType.CategoryScheme;
            }
            return MaApiConnector.PingEndPoint(pingArtefact.ToString());
        }
        public bool CheckEndPointDM()
        {
            return DmApiConnector.CheckEndPoint();
        }

        #region Import XML File

        /// <summary>
        /// Check all uploaded SdmxObjects in a file and return a list of objects that can be imported or not
        /// </summary>
        /// <param name="file">File upload on server</param>
        /// <returns>List of SdmxObject</returns>
        public ImportedItemXmlDTO CheckImportedFileXmlSdmxObjects(IFormFile file)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            var importedItemDTO = new ImportedItemXmlDTO();
            var filePath = UploadFileOnNodeApi(file, new List<string>() { ".xml" }, _configuration["UPLOAD_IMPORT_STRUCTURE"]);
            importedItemDTO.HashImport = Utils.Encrypt(filePath, _configuration["ENCRYPTION_KEY"]);
            importedItemDTO.ImportedItem = Sdmx21Connector.CheckImportedFileXmlSdmxObjects(filePath, appConfig.DataManagement.DataLanguages, false);

            if (_logger.IsDebugEnabled)
            {
                _logger.Log($"BusinessLogic CheckImportedFileXmlSdmxObjects result: {JsonConvert.SerializeObject(importedItemDTO)}", Infrastructure.STLogging.Interface.LogLevelEnum.Debug);
            }

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);
            return importedItemDTO;
        }

        /// <summary>
        /// Imports the list of all the passed items and that are present in the uploaded file
        /// </summary>
        /// <param name="importedItem">List of item to import</param>
        /// <returns>Status of items imported</returns>
        public ImportedItemXmlResult ImportFileXmlSdmxObjects(ImportedItemXmlDTO importedItem)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            ImportedItemXmlResult result = null;

            var filePath = Utils.Decrypt(importedItem.HashImport, _configuration["ENCRYPTION_KEY"]);
            try
            {
                result = Sdmx21Connector.ExecuteImportXml(importedItem.ImportedItem, filePath, appConfig.DataManagement.DataLanguages, false);

                foreach (var item in result.ImportedItem)
                {
                    var enumType = ArtefactDataModel.BL.Utility.GetArtefactTypeEnum(item.Type);
                    if (enumType == SdmxStructureEnumType.MetadataFlow || enumType == SdmxStructureEnumType.Dataflow)
                    {
                        SynchronizeAuthDB();
                        break;
                    }
                }

                foreach (var item in result.ImportedItem)
                {
                    if (ArtefactDataModel.BL.Utility.GetArtefactTypeEnum(item.Type) == SdmxStructureEnumType.MetadataFlow)
                    {
                        DmApiConnector.AssignMetadataFlowFirstOwnership($"{item.ID}+{item.Agency}+{item.Version}", Utils.GetUsername(_contextAccessor.HttpContext.User.Identity));
                    }
                    else if (ArtefactDataModel.BL.Utility.GetArtefactTypeEnum(item.Type) == SdmxStructureEnumType.Dataflow)
                    {
                        DmApiConnector.AssignDataflowFirstOwnership($"{item.ID}+{item.Agency}+{item.Version}", Utils.GetUsername(_contextAccessor.HttpContext.User.Identity));
                    }
                }

            }
            catch (Exception)
            {
                throw;
            }
            finally
            {
                if (File.Exists(filePath))
                {
                    File.Delete(filePath);
                }
            }

            if (_logger.IsDebugEnabled)
            {
                _logger.Log($"BusinessLogic ImportFileXmlSdmxObjects result: {JsonConvert.SerializeObject(result)}", Infrastructure.STLogging.Interface.LogLevelEnum.Debug);
            }

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);
            return result;
        }

        #endregion

        #region Import CSV File

        /// <summary>
        /// Check imported file csv
        /// </summary>
        /// <param name="file">File upload on server</param>
        /// <returns>Top 5 element to be imported</returns>
        public ImportedItemCsvDTO CheckImportedFileCsvItem(IFormFile file, ImportedItemCsvDTO importedItemCsvDTO)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            var filePath = UploadFileOnNodeApi(file, new List<string>() { ".csv" }, _configuration["UPLOAD_IMPORT_STRUCTURE"]);
            importedItemCsvDTO.HashImport = Utils.Encrypt(filePath, _configuration["ENCRYPTION_KEY"]);
            _logger.Log($"BusinessLogic CheckImportedFileCsvItem readCsvItem ", Infrastructure.STLogging.Interface.LogLevelEnum.Debug);
            _contextAccessor.HttpContext.Session.Set("PreviewCSVFile", Encoding.ASCII.GetBytes(filePath));
            _contextAccessor.HttpContext.Session.Set("PreviewCSVSetting", Encoding.ASCII.GetBytes(JsonConvert.SerializeObject(importedItemCsvDTO)));
            _contextAccessor.HttpContext.Session.Remove("PreviewCSVFileRemote");
            readCsvItem(filePath, importedItemCsvDTO, 10);

            if (_logger.IsDebugEnabled)
            {
                _logger.Log($"BusinessLogic CheckImportedFileCsvItem result: {JsonConvert.SerializeObject(importedItemCsvDTO)}", Infrastructure.STLogging.Interface.LogLevelEnum.Debug);
            }

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);
            return importedItemCsvDTO;
        }

        public string PreviewImportedFileCsvItem(OptionsTable optionsTable, string guidSession)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            _contextAccessor.HttpContext.Session.TryGetValue("PreviewCSVFile", out byte[] filePathByte);
            var filePath = Encoding.ASCII.GetString(filePathByte);
            _contextAccessor.HttpContext.Session.TryGetValue("reviewCSVFileRemote", out byte[] uploadedByte);
            var uploaded = Encoding.ASCII.GetString(uploadedByte);
            if (string.IsNullOrWhiteSpace(filePath))
            {
                return null;
            }
            var remoteUpload = false;
            if (string.IsNullOrWhiteSpace(uploaded))
            {
                remoteUpload = true;
            }

            _contextAccessor.HttpContext.Session.TryGetValue("PreviewCSVSetting", out byte[] importedItemCsvDTOByte);
            var importedItemCsvDTO = JsonConvert.DeserializeObject<ImportedItemCsvDTO>(Encoding.ASCII.GetString(importedItemCsvDTOByte));

            var result = DmApiConnector.PreviewImportedFileCsvItem(optionsTable, importedItemCsvDTO, filePath, guidSession, remoteUpload, _contextAccessor);

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);
            return result;
        }

        /// <summary>
        /// Imports the list of all the passed items and that are present in the uploaded file
        /// </summary>
        /// <param name="importedItemCsvDTO">List of item to import</param>
        /// <returns>Status of items imported</returns>
        public ImportedItemCsvResult ImportFileCsvItem(ImportedItemCsvDTO importedItemCsvDTO)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);
            importedItemCsvDTO.ImportedItemCsv.Clear();

            ImportedItemCsvResult result;

            var filePath = Utils.Decrypt(importedItemCsvDTO.HashImport, _configuration["ENCRYPTION_KEY"]);

            _logger.Log($"BusinessLogic ImportFileCsvItem readCsvItem ", Infrastructure.STLogging.Interface.LogLevelEnum.Debug);
            readCsvItem(filePath, importedItemCsvDTO, -1);

            ISdmxObjects sdmxObjects = null;
            if (importedItemCsvDTO.Type != null && importedItemCsvDTO.Type.Equals("CodeList", StringComparison.InvariantCultureIgnoreCase))
            {
                sdmxObjects = importCodelistItem(importedItemCsvDTO);
            }
            else if (importedItemCsvDTO.Type != null && importedItemCsvDTO.Type.Equals("CategoryScheme", StringComparison.InvariantCultureIgnoreCase))
            {
                sdmxObjects = importCategorySchemeItem(importedItemCsvDTO);
            }
            else if (importedItemCsvDTO.Type != null && importedItemCsvDTO.Type.Equals("ConceptScheme", StringComparison.InvariantCultureIgnoreCase))
            {
                sdmxObjects = importConceptSchemeItem(importedItemCsvDTO);
            }
            else if (importedItemCsvDTO.Type != null && importedItemCsvDTO.Type.Equals("AgencyScheme", StringComparison.InvariantCultureIgnoreCase))
            {
                sdmxObjects = importAgencySchemeItem(importedItemCsvDTO);
            }

            result = Sdmx21Connector.ExecuteImportCsv(sdmxObjects);

            if (_logger.IsDebugEnabled)
            {
                _logger.Log($"BusinessLogic ImportFileCsvItem result: {JsonConvert.SerializeObject(result)}", Infrastructure.STLogging.Interface.LogLevelEnum.Debug);
            }

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);
            return result;
        }

        /// <summary>
        /// Popolate item from csv
        /// </summary>
        /// <param name="top">Max element to popolate from csv</param>
        /// <returns></returns>
        private void readCsvItem(string filePath, ImportedItemCsvDTO importedItemCsvDTO, int top)
        {
            var indexId = importedItemCsvDTO.FirstRowHeader ? -1 : importedItemCsvDTO.Columns.Id;
            var indexName = importedItemCsvDTO.FirstRowHeader ? -1 : importedItemCsvDTO.Columns.Name;
            var indexDescription = importedItemCsvDTO.FirstRowHeader ? -1 : importedItemCsvDTO.Columns.Description;
            var indexParent = importedItemCsvDTO.FirstRowHeader ? -1 : importedItemCsvDTO.Columns.Parent;
            var indexOrder = importedItemCsvDTO.FirstRowHeader ? -1 : importedItemCsvDTO.Columns.Order;
            var indexFullName = importedItemCsvDTO.FirstRowHeader ? -1 : importedItemCsvDTO.Columns.FullName;
            var indexIsDefault = importedItemCsvDTO.FirstRowHeader ? -1 : importedItemCsvDTO.Columns.IsDefault;

            using (StreamReader reader = new StreamReader(File.OpenRead(filePath), Utils.GetFileEncoding(filePath)))
            {
                int i = 0;

                char.TryParse(importedItemCsvDTO.TextDelimiter, out char delimiter);
                char separator = string.IsNullOrEmpty(importedItemCsvDTO.TextSeparator) ? ';' : importedItemCsvDTO.TextSeparator.Trim().ElementAt(0);

                while (reader.Peek() >= 0)
                {
                    i++;

                    string csvLine = reader.ReadLine();
                    string[] csvFields;
                    if (!delimiter.Equals(default(char)))
                    {
                        csvFields = Utils.CsvParser(csvLine, delimiter, separator);
                    }
                    else
                    {
                        csvFields = csvLine.Split(separator);
                    }

                    var fieldCount = csvFields.Count();
                    if (fieldCount < 2)
                    {
                        if (i == 1)
                        {
                            throw Utils.getCustomException("IMPORTCSVITEM_FILE_READERROR",
                           @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - Unable to read file uploaded.", Infrastructure.STLogging.Interface.LogLevelEnum.Error);
                        }

                        if (i > 1)
                        {
                            throw Utils.getCustomException("IMPORTCSVITEM_FILE_DATAERROR",
                           @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - Incorrect Text Delimiter or Separator, Line " + i, Infrastructure.STLogging.Interface.LogLevelEnum.Error);
                        }
                    }

                    var importedItemCsv = new ImportedItemCsv();

                    if (importedItemCsvDTO.FirstRowHeader && i == 1)
                    {
                        importedItemCsv.IsHeader = true;
                        for (var indexScan = 0; indexScan < fieldCount; indexScan++)
                        {
                            switch (csvFields[indexScan].ToUpperInvariant())
                            {
                                case "ID":
                                    indexId = indexScan;
                                    break;
                                case "NAME":
                                    indexName = indexScan;
                                    break;

                                //optional columns
                                case "DESCRIPTION":
                                    if (importedItemCsvDTO.Columns.Description != -1)
                                    {
                                        indexDescription = indexScan;
                                    }
                                    break;
                                case "PARENTCODE":
                                    if (importedItemCsvDTO.Columns.Parent != -1)
                                    {
                                        indexParent = indexScan;
                                    }
                                    break;
                                case "ORDER":
                                    if (importedItemCsvDTO.Columns.Order != -1)
                                    {
                                        indexOrder = indexScan;
                                    }
                                    break;
                                case "FULLNAME":
                                    if (importedItemCsvDTO.Columns.FullName != -1)
                                    {
                                        indexFullName = indexScan;
                                    }
                                    break;
                                case "ISDEFAULT":
                                    if (importedItemCsvDTO.Columns.IsDefault != -1)
                                    {
                                        indexIsDefault = indexScan;
                                    }
                                    break;
                            }
                        }
                    }


                    if (i == 1 && importedItemCsvDTO.FirstRowHeader && (indexId == -1 || fieldCount < indexId || csvFields[indexId].Trim().Equals("\"\"") || csvFields[indexId].Trim().Equals(string.Empty)))
                    {//Case with Header in file and first row
                        throw Utils.getCustomException("IMPORTCSVITEM_FILE_HEADER_IDERROR",
                           @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - Missing Header Id, Line " + i, Infrastructure.STLogging.Interface.LogLevelEnum.Error);
                    }
                    else if (indexId == -1 || fieldCount < indexId || csvFields[indexId].Trim().Equals("\"\"") || csvFields[indexId].Trim().Equals(string.Empty))
                    {
                        //Case without Header in file or second or more row
                        throw Utils.getCustomException("IMPORTCSVITEM_FILE_IDERROR",
                           @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - Missing Id, Line " + i, Infrastructure.STLogging.Interface.LogLevelEnum.Error);
                    }

                    if (i == 1 && importedItemCsvDTO.FirstRowHeader && (indexName == -1 || fieldCount < indexName || csvFields[indexName].Trim().Equals("\"\"") || csvFields[indexName].Trim().Equals(string.Empty)))
                    {
                        //Case with Header in file and first row
                        throw Utils.getCustomException("IMPORTCSVITEM_FILE_HEADER_NAMEERROR",
                           @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - Missing Header Name, Line " + i, Infrastructure.STLogging.Interface.LogLevelEnum.Error);
                    }
                    else if (indexName == -1 || fieldCount < indexName || csvFields[indexName].Trim().Equals("\"\"") || csvFields[indexName].Trim().Equals(string.Empty))
                    {
                        //Case without Header in file or second or more row
                        throw Utils.getCustomException("IMPORTCSVITEM_FILE_NAMEERROR",
                           @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - Missing Name, Line " + i, Infrastructure.STLogging.Interface.LogLevelEnum.Error);
                    }


                    importedItemCsv.Id = csvFields[indexId].ToUpperInvariant();
                    importedItemCsv.Name = csvFields[indexName];
                    if (indexDescription != -1 && fieldCount > indexDescription)
                    {
                        importedItemCsv.Description = string.IsNullOrEmpty(csvFields[indexDescription]) ? "" : csvFields[indexDescription];
                    }
                    if (indexParent != -1 && fieldCount > indexParent)
                    {
                        importedItemCsv.Parent = string.IsNullOrEmpty(csvFields[indexParent]) ? "" : csvFields[indexParent].ToUpperInvariant();
                    }
                    if (indexOrder != -1 && fieldCount > indexOrder)
                    {
                        importedItemCsv.Order = string.IsNullOrEmpty(csvFields[indexOrder]) ? "" : csvFields[indexOrder];
                    }
                    if (indexFullName != -1 && fieldCount > indexFullName)
                    {
                        importedItemCsv.FullName = string.IsNullOrEmpty(csvFields[indexFullName]) ? "" : csvFields[indexFullName];
                    }
                    if (indexIsDefault != -1 && fieldCount > indexIsDefault)
                    {
                        importedItemCsv.IsDefault = string.IsNullOrEmpty(csvFields[indexIsDefault]) ? "" : csvFields[indexIsDefault];
                    }

                    if (top == -1 //unlimited
                        ||
                        (importedItemCsvDTO.FirstRowHeader && i <= top + 1) //include header and limit by top
                        ||
                        (!importedItemCsvDTO.FirstRowHeader && i <= top) //limit by top
                        )
                    {
                        importedItemCsvDTO.ImportedItemCsv.Add(importedItemCsv);
                    }

                }
            }
        }

        private ISdmxObjects importCodelistItem(ImportedItemCsvDTO importedItemCsvDTO)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            var sdmxObject = Sdmx21Connector.GetArtefacts(SdmxStructureEnumType.CodeList, importedItemCsvDTO.Identity.ID, importedItemCsvDTO.Identity.Agency, importedItemCsvDTO.Identity.Version);
            if (sdmxObject == null || sdmxObject.Codelists.Count <= 0)
            {
                return null;
            }

            var sdmxObjectResult = new SdmxObjectsImpl();
            var codelistResult = sdmxObject.Codelists.First().MutableInstance;

            var changed = codelistResult.Annotations.FirstOrDefault(annotation => annotation.Type != null && annotation.Type.Equals(_nodeConfig.Annotations.Changed, StringComparison.InvariantCultureIgnoreCase));
            if (changed == null)
            {
                IAnnotationMutableObject annotation = new AnnotationMutableCore()
                {
                    Type = _nodeConfig.Annotations.Changed,
                    Id = _nodeConfig.Annotations.Changed,
                    Title = GetEncodedConnectionString()
                };
                codelistResult.AddAnnotation(annotation);
            }

            var itemToAdd = new List<ICodeMutableObject>();

            foreach (var item in importedItemCsvDTO.ImportedItemCsv)
            {
                if (item.IsHeader)
                {
                    continue;
                }

                ICodeMutableObject codeResult;
                var culture = new CultureInfo(importedItemCsvDTO.Lang);
                codeResult = codelistResult.Items.FirstOrDefault(x => x.Id == item.Id);
                if (codeResult != null)
                {
                    // If Item already exists
                    codeResult.ParentCode = item.Parent;
                    codeResult.AddName(culture.TwoLetterISOLanguageName, item.Name);
                    codeResult.AddDescription(culture.TwoLetterISOLanguageName, item.Description);

                    setAnnotationImportCsv(codeResult, culture.TwoLetterISOLanguageName, item.FullName, item.IsDefault);
                    editOrderAnnotation(codeResult, culture.TwoLetterISOLanguageName, item.Order, _nodeConfig.Annotations.CodelistsOrder);
                }
                else
                {
                    // If Item doesn't exist
                    codeResult = new CodeMutableCore()
                    {
                        Id = item.Id,
                        ParentCode = item.Parent
                    };

                    codeResult.AddName(culture.TwoLetterISOLanguageName, item.Name);
                    codeResult.AddDescription(culture.TwoLetterISOLanguageName, item.Description);

                    newOrderAnnotation(codeResult, culture.TwoLetterISOLanguageName, item.Order, _nodeConfig.Annotations.CodelistsOrder);
                    setAnnotationImportCsv(codeResult, culture.TwoLetterISOLanguageName, item.FullName, item.IsDefault);
                    itemToAdd.Add(codeResult);
                }
            }

            foreach (var item in itemToAdd)
            {
                codelistResult.AddItem(item);
            }

            sdmxObjectResult.AddCodelist(codelistResult.ImmutableInstance);

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);
            return sdmxObjectResult;
        }

        private ISdmxObjects importConceptSchemeItem(ImportedItemCsvDTO importedItemCsvDTO)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            var sdmxObject = Sdmx21Connector.GetArtefacts(SdmxStructureEnumType.ConceptScheme, importedItemCsvDTO.Identity.ID, importedItemCsvDTO.Identity.Agency, importedItemCsvDTO.Identity.Version);
            if (sdmxObject == null || sdmxObject.ConceptSchemes.Count == 0)
            {
                return null;
            }

            var sdmxObjectResult = new SdmxObjectsImpl();
            var conceptSchemeResult = sdmxObject.ConceptSchemes.First().MutableInstance;

            foreach (var item in importedItemCsvDTO.ImportedItemCsv)
            {
                if (item.IsHeader)
                {
                    continue;
                }

                IConceptMutableObject conceptResult;
                var culture = new CultureInfo(importedItemCsvDTO.Lang);

                if (conceptSchemeResult.Items.ToList().Exists(x => x.Id == item.Id))
                {
                    // If Item already exists
                    conceptResult = conceptSchemeResult.Items.FirstOrDefault(x => x.Id == item.Id);

                    conceptResult.ParentConcept = item.Parent.ToUpperInvariant();
                    conceptResult.AddName(culture.TwoLetterISOLanguageName, item.Name);
                    conceptResult.AddDescription(culture.TwoLetterISOLanguageName, item.Description);

                    setAnnotationImportCsv(conceptResult, culture.TwoLetterISOLanguageName, item.FullName, item.IsDefault);
                    editOrderAnnotation(conceptResult, culture.TwoLetterISOLanguageName, item.Order, _nodeConfig.Annotations.ConceptSchemesOrder);
                }
                else
                {
                    // If Item doesn't exist
                    conceptResult = new ConceptMutableCore()
                    {
                        Id = item.Id,
                        ParentConcept = item.Parent.ToUpperInvariant()
                    };

                    conceptResult.AddName(culture.TwoLetterISOLanguageName, item.Name);
                    conceptResult.AddDescription(culture.TwoLetterISOLanguageName, item.Description);

                    newOrderAnnotation(conceptResult, culture.TwoLetterISOLanguageName, item.Order, _nodeConfig.Annotations.ConceptSchemesOrder);
                    setAnnotationImportCsv(conceptResult, culture.TwoLetterISOLanguageName, item.FullName, item.IsDefault);
                    conceptSchemeResult.AddItem(conceptResult);
                }
            }

            sdmxObjectResult.AddConceptScheme(conceptSchemeResult.ImmutableInstance);

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);
            return sdmxObjectResult;
        }

        private ISdmxObjects importCategorySchemeItem(ImportedItemCsvDTO importedItemCsvDTO)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            var sdmxObject = Sdmx21Connector.GetArtefacts(SdmxStructureEnumType.CategoryScheme, importedItemCsvDTO.Identity.ID, importedItemCsvDTO.Identity.Agency, importedItemCsvDTO.Identity.Version);
            if (sdmxObject == null || sdmxObject.CategorySchemes.Count <= 0)
            {
                return null;
            }

            var sdmxObjectResult = new SdmxObjectsImpl();
            var categorySchemeResult = sdmxObject.CategorySchemes.First().MutableInstance;

            var allNewCategoryWithParent = new Dictionary<string, string>(); //Child -> Parent
            var allNewCategory = new Dictionary<string, ICategoryMutableObject>();
            foreach (var item in importedItemCsvDTO.ImportedItemCsv)
            {
                if (item.IsHeader)
                {
                    continue;
                }

                ICategoryMutableObject categoryItemImport;
                var culture = new CultureInfo(importedItemCsvDTO.Lang);

                var findCategory = findCategorySchemeItem(categorySchemeResult.Items, item.Id);

                if (findCategory != null)
                {
                    // If Item already exists change only Name, Description and Annotation
                    categoryItemImport = findCategory;

                    categoryItemImport.AddName(culture.TwoLetterISOLanguageName, item.Name);
                    categoryItemImport.AddDescription(culture.TwoLetterISOLanguageName, item.Description);

                    setAnnotationImportCsv(categoryItemImport, culture.TwoLetterISOLanguageName, item.FullName, item.IsDefault);
                    editOrderAnnotation(categoryItemImport, culture.TwoLetterISOLanguageName, item.Order, _nodeConfig.Annotations.CategorySchemesOrder);
                }
                else
                {
                    // If Item doesn't exist create all
                    categoryItemImport = new CategoryMutableCore()
                    {
                        Id = item.Id
                    };

                    categoryItemImport.AddName(culture.TwoLetterISOLanguageName, item.Name);
                    categoryItemImport.AddDescription(culture.TwoLetterISOLanguageName, item.Description);

                    newOrderAnnotation(categoryItemImport, culture.TwoLetterISOLanguageName, item.Order, _nodeConfig.Annotations.CategorySchemesOrder);
                    setAnnotationImportCsv(categoryItemImport, culture.TwoLetterISOLanguageName, item.FullName, item.IsDefault);
                    if (string.IsNullOrWhiteSpace(item.Parent))
                    {
                        categorySchemeResult.AddItem(categoryItemImport);
                    }
                    else if (!string.IsNullOrWhiteSpace(item.Parent) && !allNewCategoryWithParent.ContainsKey(categoryItemImport.Id))
                    {
                        allNewCategoryWithParent.Add(categoryItemImport.Id, item.Parent.ToUpperInvariant());
                    }
                    allNewCategory.Add(categoryItemImport.Id, categoryItemImport);
                }
            }

            foreach (var catChild in allNewCategoryWithParent)
            { //Key=Child //Value=Parent
                var findItem = false;
                foreach (var itemNewCat in allNewCategory)
                { //Search parent in new category item and add to list
                    if (itemNewCat.Key.Equals(catChild.Value))
                    {
                        itemNewCat.Value.AddItem(allNewCategory[catChild.Key]);
                        findItem = true;
                        continue;
                    }
                }
                if (findItem)
                {
                    continue;
                }

                //If parent is old item, search in categorySchemeResult
                var itemCat = findCategorySchemeItem(categorySchemeResult.Items, catChild.Value);
                //check if child isn't in List and Add
                if (itemCat != null && !itemCat.Items.Any(item => item.Id.Equals(catChild.Key)))
                {
                    itemCat.AddItem(allNewCategory[catChild.Key]);
                }
            }

            sdmxObjectResult.AddCategoryScheme(categorySchemeResult.ImmutableInstance);

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);
            return sdmxObjectResult;
        }

        private ISdmxObjects importAgencySchemeItem(ImportedItemCsvDTO importedItemCsvDTO)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            var sdmxObject = Sdmx21Connector.GetArtefacts(SdmxStructureEnumType.AgencyScheme, importedItemCsvDTO.Identity.ID, importedItemCsvDTO.Identity.Agency, importedItemCsvDTO.Identity.Version);
            if (sdmxObject == null || sdmxObject.AgenciesSchemes.Count <= 0)
            {
                return null;
            }

            var sdmxObjectResult = new SdmxObjectsImpl();
            var codelistResult = sdmxObject.AgenciesSchemes.First().MutableInstance;

            var itemToAdd = new List<IAgencyMutableObject>();

            foreach (var item in importedItemCsvDTO.ImportedItemCsv)
            {
                if (item.IsHeader)
                {
                    continue;
                }

                IAgencyMutableObject codeResult;
                var culture = new CultureInfo(importedItemCsvDTO.Lang);
                codeResult = codelistResult.Items.FirstOrDefault(x => x.Id == item.Id);
                if (codeResult != null)
                {
                    // If Item already exists
                    codeResult.AddName(culture.TwoLetterISOLanguageName, item.Name);
                    codeResult.AddDescription(culture.TwoLetterISOLanguageName, item.Description);

                    setAnnotationImportCsv(codeResult, culture.TwoLetterISOLanguageName, item.FullName, item.IsDefault);
                    editOrderAnnotation(codeResult, culture.TwoLetterISOLanguageName, item.Order, _nodeConfig.Annotations.CodelistsOrder);
                }
                else
                {
                    // If Item doesn't exist
                    codeResult = new AgencyMutableCore()
                    {
                        Id = item.Id,
                    };

                    codeResult.AddName(culture.TwoLetterISOLanguageName, item.Name);
                    codeResult.AddDescription(culture.TwoLetterISOLanguageName, item.Description);

                    newOrderAnnotation(codeResult, culture.TwoLetterISOLanguageName, item.Order, _nodeConfig.Annotations.CodelistsOrder);
                    setAnnotationImportCsv(codeResult, culture.TwoLetterISOLanguageName, item.FullName, item.IsDefault);
                    itemToAdd.Add(codeResult);
                }
            }

            foreach (var item in itemToAdd)
            {
                codelistResult.AddItem(item);
            }

            sdmxObjectResult.AddAgencyScheme(codelistResult.ImmutableInstance);

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);
            return sdmxObjectResult;
        }

        private void setAnnotationImportCsv(IAnnotableMutableObject codeResult, string lang, string fullName, string isDefault)
        {
            var findAnnotationText = false;
            IAnnotationMutableObject mutableAnnotation = null;

            if (!string.IsNullOrWhiteSpace(fullName))
            {
                foreach (var annotation in codeResult.Annotations)
                {
                    if (annotation.Type != null && annotation.Type.Equals("FULL_NAME", StringComparison.InvariantCultureIgnoreCase))
                    {
                        mutableAnnotation = annotation;
                        foreach (var text in annotation.Text)
                        {
                            if (text.Locale.Equals(lang, StringComparison.InvariantCultureIgnoreCase))
                            {
                                findAnnotationText = true;
                                text.Value = fullName;
                                break;
                            }
                        }
                        break;
                    }
                }

                if (mutableAnnotation != null && !findAnnotationText)
                {
                    var textType = new TextTypeWrapperMutableCore { Locale = lang, Value = fullName };
                    mutableAnnotation.AddText(textType);
                }
                else if (mutableAnnotation == null)
                {
                    mutableAnnotation = new AnnotationMutableCore
                    {
                        Type = "FULL_NAME",
                        Id = "FULL_NAME"
                    };
                    var textType = new TextTypeWrapperMutableCore { Locale = lang, Value = fullName };
                    mutableAnnotation.AddText(textType);
                    codeResult.AddAnnotation(mutableAnnotation);
                }
            }
            else
            {
                foreach (var annotation in codeResult.Annotations)
                {
                    if (annotation.Type != null && annotation.Type.Equals("FULL_NAME", StringComparison.InvariantCultureIgnoreCase))
                    {
                        foreach (var text in annotation.Text)
                        {
                            if (text.Locale.Equals(lang, StringComparison.InvariantCultureIgnoreCase))
                            {
                                text.Value = "";
                                break;
                            }
                        }
                        break;
                    }
                }
            }

            var findAnnotation = false;
            var positionAnnotation = -1;
            foreach (var annotation in codeResult.Annotations)
            {
                positionAnnotation++;
                if (annotation.Type != null && annotation.Type.Equals("DEFAULT", StringComparison.InvariantCultureIgnoreCase))
                {
                    findAnnotation = true;
                    break;
                }
            }
            if (!string.IsNullOrWhiteSpace(isDefault) && (isDefault.Equals("True", StringComparison.InvariantCultureIgnoreCase) || isDefault.Equals("1", StringComparison.InvariantCultureIgnoreCase)))
            {
                if (!findAnnotation)
                {
                    mutableAnnotation = new AnnotationMutableCore
                    {
                        Type = "DEFAULT",
                        Id = "DEFAULT"
                    };
                    codeResult.AddAnnotation(mutableAnnotation);
                }
            }
            else if (findAnnotation)
            {
                codeResult.Annotations.RemoveAt(positionAnnotation);
            }

        }


        private ICategoryMutableObject findCategorySchemeItem(IList<ICategoryMutableObject> items, string itemId)
        {
            ICategoryMutableObject find = null;
            foreach (var item in items)
            {
                if (item.Id.Equals(itemId))
                {
                    find = item;
                }
                else
                {
                    find = findCategorySchemeItem(item.Items, itemId);
                }
                if (find != null)
                {
                    break;
                }
            }
            return find;
        }

        private ICategoryMutableObject findCategorySchemeParentItem(IList<ICategoryMutableObject> items, string itemId)
        {
            ICategoryMutableObject find = null;
            foreach (var item in items)
            {
                foreach (var childItem in item.Items)
                {
                    if (childItem.Id.Equals(itemId))
                    {
                        find = item;
                    }
                    if (find != null)
                    {
                        break;
                    }
                }
                if (find != null)
                {
                    break;
                }
                find = findCategorySchemeItem(item.Items, itemId);
            }
            return find;
        }

        private void newOrderAnnotation(IAnnotableMutableObject codeResult, string locate, string order, string orderAnnotation)
        {
            if (string.IsNullOrWhiteSpace(order))
            {
                return;
            }

            var annotation = new AnnotationMutableCore
            {
                Type = orderAnnotation,
                Id = orderAnnotation,
                Title = orderAnnotation
            };
            var textType = new TextTypeWrapperMutableCore { Locale = locate, Value = order };
            annotation.AddText(textType);
            codeResult.AddAnnotation(annotation);
        }

        private void editOrderAnnotation(IAnnotableMutableObject codeResult, string locate, string order, string orderAnnotation)
        {
            if (string.IsNullOrWhiteSpace(order))
            {
                return;
            }

            var findAnnotation = false;
            IAnnotationMutableObject mutableAnnotation = null;
            foreach (var annotation in codeResult.Annotations)
            {
                if (annotation.Type != null && annotation.Type.Equals(orderAnnotation, StringComparison.InvariantCultureIgnoreCase))
                {
                    mutableAnnotation = annotation;
                    foreach (var text in annotation.Text)
                    {
                        if (text.Locale.Equals(locate, StringComparison.InvariantCultureIgnoreCase))
                        {
                            findAnnotation = true;
                            text.Value = order;
                            break;
                        }
                    }
                    break;
                }
            }
            if (!findAnnotation)
            {
                if (mutableAnnotation != null)
                {
                    var textType = new TextTypeWrapperMutableCore { Locale = locate, Value = order };
                    mutableAnnotation.AddText(textType);
                }
                else
                {
                    mutableAnnotation = new AnnotationMutableCore
                    {
                        Type = orderAnnotation,
                        Id = orderAnnotation,
                        Title = orderAnnotation
                    };
                    var textType = new TextTypeWrapperMutableCore { Locale = locate, Value = order };
                    mutableAnnotation.AddText(textType);
                    codeResult.AddAnnotation(mutableAnnotation);
                }
            }
        }

        #endregion region

        private MetadataAttributeMutableCore createMetadataAttribute(MetadataStructureDTO.MetadataAttribute itemAttribute)
        {
            var metadataAttribute = new MetadataAttributeMutableCore
            {
                Id = itemAttribute.Id,
                ConceptRef = SetConceptRef(itemAttribute.ConceptIdentity),
                Representation = new RepresentationMutableCore()
            };
            if (!string.IsNullOrWhiteSpace(itemAttribute.MaxOccurs) && !itemAttribute.MaxOccurs.Equals("unbounded"))
            {
                metadataAttribute.MaxOccurs = Convert.ToInt32(itemAttribute.MaxOccurs);
            }
            else
            {
                metadataAttribute.MaxOccurs = null;
            }
            if (!string.IsNullOrWhiteSpace(itemAttribute.MinOccurs) && !itemAttribute.MinOccurs.Equals("unbounded"))
            {
                metadataAttribute.MinOccurs = Convert.ToInt32(itemAttribute.MinOccurs);
            }
            else
            {
                metadataAttribute.MinOccurs = null;
            }

            metadataAttribute.Presentational = TertiaryBool.ParseBoolean(itemAttribute.IsPresentational);

            var textFormatMutable = new TextFormatMutableCore
            {
                TextType = Org.Sdmxsource.Sdmx.Api.Constants.TextType.GetFromEnum(TextEnumType.String)
            };
            metadataAttribute.Representation.TextFormat = textFormatMutable;

            if (itemAttribute.MetadataAttributes != null)
            {
                foreach (var item in itemAttribute.MetadataAttributes)
                {
                    metadataAttribute.MetadataAttributes.Add(createMetadataAttribute(item));
                }
            }

            foreach (var itemAnnotation in itemAttribute.Annotations)
            {
                IAnnotationMutableObject mutableAnnotation = new AnnotationMutableCore
                {
                    Type = itemAnnotation.Type,
                    Id = itemAnnotation.Id,
                    Title = itemAnnotation.Title
                };
                foreach (var itemText in itemAnnotation.Texts)
                {
                    var textType = new TextTypeWrapperMutableCore { Locale = itemText.Key, Value = itemText.Value };
                    mutableAnnotation.AddText(textType);
                }
                metadataAttribute.AddAnnotation(mutableAnnotation);
            }

            return metadataAttribute;
        }

        /*
        public void notifyToCacheUpdateArtefact(SdmxStructureEnumType structureType, string id, string agency, string version)
        {
            try
            {
                if (structureType.Equals(SdmxStructureEnumType.Msd))
                {
                    _rmCacheManager.deleteMSD(id, agency, version);
                }
                else if (structureType.Equals(SdmxStructureEnumType.ConceptScheme))
                {
                    _rmCacheManager.deleteConceptScheme(id, agency, version);
                }
                else
                {
                    List<ArtefactReference> arts = ArtefactParentsReference(structureType, id, agency, version);
                    if (arts != null)
                    {
                        foreach (ArtefactReference artRef in arts)
                        {
                            if (artRef.ArtefactType.Equals(SdmxStructureEnumType.Msd.ToString()))
                            {
                                _rmCacheManager.deleteMSD(artRef.ID, artRef.Agency, artRef.Version);
                            }
                            else if (artRef.ArtefactType.Equals(SdmxStructureEnumType.ConceptScheme.ToString()))
                            {
                                _rmCacheManager.deleteConceptScheme(id, agency, version);
                            }
                        }
                    }
                }
            }
            catch (Exception e)
            {
                STLoggerFactory.Logger.Log("Error to read config data", e, Infrastructure.STLogging.Interface.LogLevelEnum.Warn);
                STLoggerFactory.Logger.Log(e.Message, Infrastructure.STLogging.Interface.LogLevelEnum.Warn, e.StackTrace);
            }
        }
        */

        #region Node Configuration

        /// <summary>
        /// Check if AuthDb is inizialited and configurated
        /// </summary>
        /// <returns></returns>
        public bool IsAuthDBConfigurated()
        {
            return MaApiConnector.IsAuthDbInizialize() && DmApiConnector.IsAuthDBConfigurated();
        }

        public List<string> GetListMaSid()
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);
            var connectionList = new List<string>();

            var jsonList = MaApiConnector.GetListMaSid();
            var jsonVal = JArray.Parse(jsonList);

            foreach (var item in jsonVal)
            {
                var name = (string)item["name"];

                if (!name.Equals("authdb", StringComparison.InvariantCultureIgnoreCase) && !connectionList.Contains(name))
                {
                    connectionList.Add(name);
                }
            }

            if (_logger.IsDebugEnabled)
            {
                _logger.Log($"BusinessLogic GetListMaSid result: {JsonConvert.SerializeObject(connectionList)}", Infrastructure.STLogging.Interface.LogLevelEnum.Debug);
            }

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);
            return connectionList;
        }

        public List<string> GetListAvaiableMaSid()
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);
            var connectionList = new List<string>();

            var dmSid = DmApiConnector.GetMaSid();

            var jsonList = MaApiConnector.GetListMaSid();
            var jsonVal = JArray.Parse(jsonList);

            foreach (var item in jsonVal)
            {
                var name = (string)item["name"];

                if (!name.Equals("authdb", StringComparison.InvariantCultureIgnoreCase) && !connectionList.Contains(name) &&
                    (string.IsNullOrWhiteSpace(dmSid) || name.Equals(dmSid)))
                {
                    connectionList.Add(name);
                }
            }

            if (_logger.IsDebugEnabled)
            {
                _logger.Log($"BusinessLogic GetListAvaiableMaSid result: {JsonConvert.SerializeObject(connectionList)}", Infrastructure.STLogging.Interface.LogLevelEnum.Debug);
            }

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);
            return connectionList;
        }


        public DbConnectionStringBuilder GetMAConnectionString(string maSid)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);
            var jsonConenction = MaApiConnector.GetMAConnectionString(maSid);
            var jsonVal = JObject.Parse(jsonConenction);

            var connectionType = (string)jsonVal["type"];
            var properties = (JObject)jsonVal["properties"];
            var server = "";
            var port = "";
            var attachDbFilename = "";
            var database = "";
            var integratedSecurity = "";
            var persistSecurityInfo = "";
            if (properties["Server"] != null)
            {
                server = (string)((JObject)properties["Server"])["value"];
            }
            else if (properties["Data Source"] != null)
            {
                server = (string)((JObject)properties["Data Source"])["value"];
            }

            if (properties["Port"] != null)
            {
                port = (string)((JObject)properties["Port"])["value"];
            }
            if (properties["AttachDbFilename"] != null)
            {
                attachDbFilename = (string)((JObject)properties["AttachDbFilename"])["value"];
            }
            if (properties["Database"] != null)
            {
                database = (string)((JObject)properties["Database"])["value"];
            }
            if (properties["Integrated Security"] != null)
            {
                integratedSecurity = (string)((JObject)properties["Integrated Security"])["value"];
            }
            if (properties["Persist Security Info"] != null)
            {
                persistSecurityInfo = (string)((JObject)properties["Persist Security Info"])["value"];
            }

            var userID = (string)((JObject)properties["User ID"])["value"];
            var password = (string)((JObject)properties["Password"])["value"];
            var connBuilder = new DbConnectionStringBuilder
            {
                { "Data Source", server },
                { "Initial Catalog", database },
                { "User Id", userID },
                { "Password", password }
            };

            if (connectionType.Equals("SqlServer", StringComparison.InvariantCultureIgnoreCase))
            {
                connBuilder.Add("Integrated Security", integratedSecurity);
                connBuilder.Add("Persist Security Info", persistSecurityInfo);
                if (port.Equals("0"))
                {
                    port = "1433";
                }
                connBuilder.Add("Data Source", $"{connBuilder["Data Source"]},{port}");
            }

            _logger.Log($"BusinessLogic GetMAConnectionString result: {connBuilder.ConnectionString}", Infrastructure.STLogging.Interface.LogLevelEnum.Debug);

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);
            return connBuilder;
        }

        public ResultInizializeCheckAuthDb CheckAuthDB(string maSid, bool onlyCheck)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            _logger.Log($"BusinessLogic CheckAuthDB checkConfigurationBasic", Infrastructure.STLogging.Interface.LogLevelEnum.Debug);
            var resultCheckAuthDb = checkConfigurationBasic();
            if (resultCheckAuthDb.Invalid)
            {
                return resultCheckAuthDb;
            }

            _logger.Log($"BusinessLogic CheckAuthDB IsAuthDbInizialize", Infrastructure.STLogging.Interface.LogLevelEnum.Debug);
            if (MaApiConnector.IsConfigurated && !MaApiConnector.IsAuthDbInizialize())
            {
                _logger.Log($"BusinessLogic CheckAuthDB MaApiConnector not IsAuthDbInizialize", Infrastructure.STLogging.Interface.LogLevelEnum.Info);
                resultCheckAuthDb.Invalid = true;
                resultCheckAuthDb.ErrorMessage.Add("MAAPI_NOTINIZIALIZED");
                return resultCheckAuthDb;
            }

            _logger.Log($"BusinessLogic CheckAuthDB IsAuthDBConfigurated", Infrastructure.STLogging.Interface.LogLevelEnum.Debug);
            if (!DmApiConnector.IsAuthDBConfigurated())
            {
                _logger.Log($"BusinessLogic CheckAuthDB DmApiConnector not IsAuthDBConfigurated", Infrastructure.STLogging.Interface.LogLevelEnum.Info);
                resultCheckAuthDb.Invalid = true;
                resultCheckAuthDb.ErrorMessage.Add("DMAPI_NOTCONFIGURATED");
                return resultCheckAuthDb;
            }


            //First Step
            if (MaApiConnector.IsConfigurated)
            {
                var result = checkConfigurationNSIandMA(true);
                if (!result)
                {
                    _logger.Log($"BusinessLogic CheckAuthDB return invalid NSIAPI_MAAPI_DIFFERENT_DB", Infrastructure.STLogging.Interface.LogLevelEnum.Info);
                    resultCheckAuthDb.Invalid = true;
                    resultCheckAuthDb.ErrorMessage.Add("NSIAPI_MAAPI_DIFFERENT_DB");
                    return resultCheckAuthDb;
                }
            }

            //Second Step Check (MA Sid have the same connection string of MSDB on AuthDb)
            //Third Step Check (DDB_CONN and RMDB_CONN equa than .XML configuration)
            DbConnectionStringBuilder msSidConn = null;
            if (MaApiConnector.IsConfigurated)
            {
                _logger.Log($"BusinessLogic CheckAuthDB get Sid from MAAPI", Infrastructure.STLogging.Interface.LogLevelEnum.Debug);
                msSidConn = GetMAConnectionString(maSid);
            }
            _logger.Log($"BusinessLogic CheckAuthDB call DMApi for CheckConfigure", Infrastructure.STLogging.Interface.LogLevelEnum.Debug);
            resultCheckAuthDb = DmApiConnector.CheckAuthDB(maSid, msSidConn != null ? Utils.Encrypt(msSidConn.ConnectionString, _configuration["ENCRYPTION_PASSW"]) : null);

            if (_logger.IsDebugEnabled)
            {
                _logger.Log($"BusinessLogic CheckAuthDB return {JsonConvert.SerializeObject(resultCheckAuthDb)}", Infrastructure.STLogging.Interface.LogLevelEnum.Debug);
            }

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);
            return resultCheckAuthDb;
        }

        public ResultInizializeCheckAuthDb InizializeAuthDb(string maSid, bool withFilterAgency)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            //First Step
            var resultCheckAuthDb = checkConfigurationBasic();
            if (resultCheckAuthDb.Invalid || (!MaApiConnector.IsConfigurated && !DmApiConnector.IsConfigurated))
            { //Invalid get Error or only SDMX WS configurated return true without any other check (because is readonly)
                return resultCheckAuthDb;
            }

            DbConnectionStringBuilder msdbConn = null;
            var resultConfigAuthDb = new ResultInizializeCheckAuthDb();
            if (MaApiConnector.IsConfigurated)
            {
                var isInizialized = MaApiConnector.IsAuthDbInizialize();
                _logger.Log($"BusinessLogic InizializeAuthDb isInizialized: {isInizialized}", Infrastructure.STLogging.Interface.LogLevelEnum.Debug);
                if (!isInizialized)
                {
                    MaApiConnector.InizializeAuthDb();
                }

                //Second Step Check (MA Sid have the same connection string of MSDB on AuthDb)
                var result = checkConfigurationNSIandMA(withFilterAgency);
                if (!result)
                {
                    _logger.Log($"BusinessLogic InizializeAuthDb return invalid NSIAPI_MAAPI_DIFFERENT_DB", Infrastructure.STLogging.Interface.LogLevelEnum.Info);
                    resultCheckAuthDb.Invalid = true;
                    resultCheckAuthDb.ErrorMessage.Add("NSIAPI_MAAPI_DIFFERENT_DB");
                    return resultCheckAuthDb;
                }

                //Third Step
                _logger.Log($"BusinessLogic InizializeAuthDb get Sid from MAAPI", Infrastructure.STLogging.Interface.LogLevelEnum.Debug);
                msdbConn = GetMAConnectionString(maSid);

                //Inizialize configure and check the connection string and maSid on AuthDb
                resultConfigAuthDb = DmApiConnector.InizializeAuthDb(msdbConn != null ? Utils.Encrypt(msdbConn.ConnectionString, _configuration["ENCRYPTION_PASSW"]) : null, maSid);
                _logger.Log($"BusinessLogic InizializeAuthDb result: {resultConfigAuthDb}", Infrastructure.STLogging.Interface.LogLevelEnum.Debug);
            }
            else
            {
                resultConfigAuthDb = DmApiConnector.CheckAuthDB("TEST_ONLY_IF_AUTHDB_IS_INIZIALIZE", null);
            }

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);
            return resultConfigAuthDb;
        }

        private ResultInizializeCheckAuthDb checkConfigurationBasic()
        {
            var resultCheckAuthDb = new ResultInizializeCheckAuthDb();

            if (MaApiConnector.IsConfigurated && !DmApiConnector.IsConfigurated)
            {
                _logger.Log($"BusinessLogic CheckAuthDB DMAPI_NOTCONFIGURATED", Infrastructure.STLogging.Interface.LogLevelEnum.Info);
                resultCheckAuthDb.Invalid = true;
                resultCheckAuthDb.ErrorMessage.Add("DMAPI_NOTCONFIGURATED");
                return resultCheckAuthDb;
            }
            //if (!MaApiConnector.IsConfigurated && DmApiConnector.IsConfigurated)
            //{
            //    _logger.Log($"BusinessLogic CheckAuthDB MAAPI_NOTCONFIGURATED", Infrastructure.STLogging.Interface.LogLevelEnum.Info);
            //    resultCheckAuthDb.Invalid = true;
            //    resultCheckAuthDb.ErrorMessage.Add("MAAPI_NOTCONFIGURATED");
            //    return resultCheckAuthDb;
            //}
            if (!MaApiConnector.IsConfigurated && !DmApiConnector.IsConfigurated)
            {
                _logger.Log($"BusinessLogic CheckAuthDB return true", Infrastructure.STLogging.Interface.LogLevelEnum.Info);
                resultCheckAuthDb.Invalid = false;
                return resultCheckAuthDb;
            }

            return resultCheckAuthDb;
        }

        /// <summary>
        /// Check if SDMX and MA WS are configurated with the same DB
        /// </summary>
        /// <returns></returns>
        private bool checkConfigurationNSIandMA(bool withFilter)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name, Infrastructure.STLogging.Interface.LogLevelEnum.Debug);

            ISdmxObjects newSdmxObjects = new SdmxObjectsImpl();

            var agency = "TESTAG";
            if (withFilter)
            {
                if (_contextAccessor.HttpContext.User.Identity.IsAuthenticated)
                {
                    var allAgency = UserUtils.GetAgencies(_contextAccessor.HttpContext.User.Identity);
                    if (allAgency != null && allAgency.Count > 0)
                    {
                        agency = allAgency[0];
                    }
                }
            }
            var codeListId = "a" + Guid.NewGuid().ToString("N");
            var agencyId = agency;
            var version = "1.0";

            ICodelistMutableObject mutable = new CodelistMutableCore
            {
                Id = codeListId,
                AgencyId = agencyId,
                Version = version
            };
            mutable.AddName("en", "Test codelist");

            ICodelistObject codelist = mutable.ImmutableInstance;
            newSdmxObjects.AddCodelist(codelist);

            //First Step Check (SDMX & MA WS mapped in same MSDB)
            var result = false;
            _logger.Log($"BusinessLogic CheckAuthDB try to create Codelist", Infrastructure.STLogging.Interface.LogLevelEnum.Debug);
            try
            {
                if (withFilter && !agency.Equals("TESTAG"))
                {
                    Sdmx21Connector.CreateArtefacts(newSdmxObjects);
                }
                else
                {
                    Sdmx21Connector.CreateArtefactsWithoutFilter(newSdmxObjects);
                }

                _logger.Log($"BusinessLogic CheckAuthDB check if Codelist exists", Infrastructure.STLogging.Interface.LogLevelEnum.Debug);
                result = MaApiConnector.CheckExistsArtefact("codelist", codeListId, agencyId, version);
            }
            catch (Exception)
            {
                try
                {
                    Sdmx21Connector.DeleteArtefactWithoutFilter(newSdmxObjects);
                }
                catch (Exception)
                {

                }
                throw;
            }

            _logger.Log($"BusinessLogic CheckAuthDB delete Codelist", Infrastructure.STLogging.Interface.LogLevelEnum.Debug);
            if (withFilter && !agency.Equals("TESTAG"))
            {
                Sdmx21Connector.DeleteArtefact(newSdmxObjects);
            }
            else
            {
                Sdmx21Connector.DeleteArtefactWithoutFilter(newSdmxObjects);
            }

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name, Infrastructure.STLogging.Interface.LogLevelEnum.Debug);
            return result;
        }

        #endregion

        #region SqlLite

        public void SaveDataSqlLiteForMerge(string mergeId, string mergeAgencyId, string mergeVersion, ArtefactRegistry saveArtefact, string lang, string token)
        {
            if (!isDbInizializzate(token, mergeId, mergeAgencyId, mergeVersion, lang))
            {
                throw Utils.getCustomException("SQLLITE_NODATA_TOSAVE",
                           $"Metodo  {System.Reflection.MethodBase.GetCurrentMethod().Name} - There aren't any data for this codelist", Infrastructure.STLogging.Interface.LogLevelEnum.Error);
            }

            var searchInput = new NoSqlSearchParameters
            {
                Id = mergeId,
                AgencyId = mergeAgencyId,
                Version = mergeVersion,
                Lang = lang,
                Token = token,
                PageNum = -1,
                PageSize = -1,
                SortDesc = false,
                SearchType = SearchType.Save
            };

            commonSaveDataSqlLite(saveArtefact, searchInput, null, null, null);
        }

        public void SaveDataSqlLite(string id, string agencyId, string version, string lang, string token, NoSQLCodeList codeList, string currentLangSave)
        {
            if (!isDbInizializzate(token, id, agencyId, version, lang))
            {
                throw Utility.Utils.getCustomException("SQLLITE_NODATA_TOSAVE",
                           $"Metodo  {System.Reflection.MethodBase.GetCurrentMethod().Name} - There aren't any data for this codelist", Infrastructure.STLogging.Interface.LogLevelEnum.Error);
            }

            var sdmxObjectResult = Sdmx21Connector.GetArtefacts(SdmxStructureEnumType.CodeList, id, agencyId, version, StructureReferenceDetailEnumType.None, "Stub");
            var previousCodelist = sdmxObjectResult.Codelists.FirstOrDefault();

            var searchInput = new NoSqlSearchParameters
            {
                Id = id,
                AgencyId = agencyId,
                Version = version,
                Lang = lang,
                Token = token,
                PageNum = -1,
                PageSize = -1,
                SortDesc = false,
                SearchType = SearchType.Save
            };

            commonSaveDataSqlLite(null, searchInput, codeList, previousCodelist, currentLangSave);

            var connString = createConnectionString(token, id, agencyId, version);
            using (var conn = new SQLiteConnection(connString))
            {
                conn.Open();

                var changeIsFinal = "";
                if (codeList != null && codeList.IsFinal != null && codeList.IsFinal.HasValue && codeList.IsFinal.Value &&
                (previousCodelist == null || (previousCodelist.IsFinal == null || !previousCodelist.IsFinal.IsTrue)))
                {
                    changeIsFinal = ", IsFinal=1";
                }

                var sqlite_cmd = conn.CreateCommand();
                sqlite_cmd.CommandText = "UPDATE CodeListItem SET Changed=0 WHERE Changed=1";
                sqlite_cmd.ExecuteNonQuery();
                sqlite_cmd = conn.CreateCommand();
                sqlite_cmd.CommandText = "UPDATE CodeList SET Changed=0" + changeIsFinal;
                sqlite_cmd.ExecuteNonQuery();
            }
            //_logger.Log($"SaveDataMongoDB SET Changed=0 {stopwatch.ElapsedMilliseconds}ms", Infrastructure.STLogging.Interface.LogLevelEnum.Debug);

            try
            {
                var sdmxObject = new SdmxObjectsImpl();
                var codelist = new CodelistMutableCore();
                codelist.Id = id;
                codelist.AgencyId = agencyId;
                codelist.Version = version;
                sdmxObject.AddCodelist(codelist.ImmutableInstance);
                Task.Run(() => updateArtefactCacheAsync(sdmxObject));
            }
            catch (Exception ex)
            {
                STLoggerFactory.Logger.Log("Error to updateCacheAsync", ex, Infrastructure.STLogging.Interface.LogLevelEnum.Warn);
            }
        }

        //
        public void CopyOrderSqlLite(string id, string agencyId, string version, string sourceLang, List<string> targetLangs, string token)
        {
            sourceLang = sourceLang.ToLowerInvariant();
            if (!isDbInizializzate(token, id, agencyId, version, sourceLang))
            {
                PopolateNoSql(id, agencyId, version, sourceLang, token);
            }

            if (targetLangs == null || targetLangs.Count <= 0)
            {
                targetLangs = new ConfigManager(_configuration).GetAppConfig().UserInterface.Languages.Select(i => i.Code.ToLowerInvariant()).ToList();
            }

            var connString = createConnectionString(token, id, agencyId, version);
            using (var conn = new SQLiteConnection(connString))
            {
                conn.Open();

                var allItemCommand = new SQLiteCommand("SELECT ItemCode, [Order] FROM CodeListItem ORDER BY TreePosition", conn);
                var itemReader = allItemCommand.ExecuteReader();

                var allItemOrder = new Dictionary<string, Dictionary<string, int>>();
                while (itemReader.Read())
                {
                    var annotationOrder = JsonConvert.DeserializeObject<Dictionary<string, int>>((string)itemReader["Order"]);
                    allItemOrder.Add((string)itemReader["ItemCode"], annotationOrder);
                }
                itemReader.Close();

                using (var transaction = conn.BeginTransaction())
                {
                    var updateCodelistSQL = new SQLiteCommand("UPDATE CodeList SET Changed=@Changed, IsOrder=@IsOrder, HaveOrder=@HaveOrder, ChangeOrder=@ChangeOrder WHERE CodeListId=@CodeListId AND CodeListAgencyId=@CodeListAgencyId AND CodeListVersion=@CodeListVersion", conn);
                    updateCodelistSQL.Transaction = transaction;
                    updateCodelistSQL.Parameters.Add(new SQLiteParameter("@Changed", DbType.Boolean) { Value = true });
                    updateCodelistSQL.Parameters.Add(new SQLiteParameter("@IsOrder", DbType.Boolean) { Value = true });
                    updateCodelistSQL.Parameters.Add(new SQLiteParameter("@HaveOrder", DbType.Boolean) { Value = true });
                    updateCodelistSQL.Parameters.Add(new SQLiteParameter("@ChangeOrder", DbType.Boolean) { Value = true });
                    updateCodelistSQL.Parameters.Add(new SQLiteParameter("@CodeListId", DbType.String) { Value = id });
                    updateCodelistSQL.Parameters.Add(new SQLiteParameter("@CodeListAgencyId", DbType.String) { Value = agencyId });
                    updateCodelistSQL.Parameters.Add(new SQLiteParameter("@CodeListVersion", DbType.String) { Value = version });
                    updateCodelistSQL.ExecuteNonQuery();

                    //Insert Item
                    var updateItemSQL = new SQLiteCommand("UPDATE CodeListItem SET [Changed]=@Changed, [Order]=@Order WHERE ItemCode=@ItemCode", conn);
                    updateItemSQL.Transaction = transaction;
                    updateItemSQL.Prepare();

                    var postionAnnotationOrder = 0;
                    foreach (var annOrder in allItemOrder)
                    {
                        postionAnnotationOrder++;
                        foreach (var itemLang in targetLangs)
                        {
                            if (annOrder.Value.ContainsKey(itemLang))
                            {
                                annOrder.Value[itemLang] = postionAnnotationOrder;
                            }
                            else
                            {
                                annOrder.Value.Add(itemLang, postionAnnotationOrder);
                            }
                        }

                        updateItemSQL.Parameters.Add(new SQLiteParameter("@Changed", DbType.Boolean) { Value = true });
                        updateItemSQL.Parameters.Add(new SQLiteParameter("@Order", DbType.String) { Value = JsonConvert.SerializeObject(annOrder.Value) });
                        updateItemSQL.Parameters.Add(new SQLiteParameter("@ItemCode", DbType.String) { Value = annOrder.Key });
                        updateItemSQL.ExecuteNonQuery();
                        updateItemSQL.Reset();
                    }
                    updateItemSQL.Dispose();

                    transaction.Commit();
                }
            }

            var sdmxObjectResult = Sdmx21Connector.GetArtefacts(SdmxStructureEnumType.CodeList, id, agencyId, version, StructureReferenceDetailEnumType.None, "Stub");
            var previousCodelist = sdmxObjectResult.Codelists.FirstOrDefault();

            var searchInput = new NoSqlSearchParameters
            {
                Id = id,
                AgencyId = agencyId,
                Version = version,
                Lang = sourceLang,
                Token = token,
                PageNum = -1,
                PageSize = -1,
                SortDesc = false,
                SearchType = SearchType.Save
            };
            commonSaveDataSqlLite(null, searchInput, null, previousCodelist, null);
        }

        private void commonSaveDataSqlLite(ArtefactRegistry saveArtefact, NoSqlSearchParameters searchInput, NoSQLCodeList codeList, ICodelistObject previousCodelist, string currentLangSave)
        {
            Stopwatch stopwatch = null;
            stopwatch = Stopwatch.StartNew();

            var noSqlSaveInput = new NoSqlSaveInput { PreviousIsFinal = previousCodelist != null && previousCodelist.IsFinal != null && previousCodelist.IsFinal.IsTrue };
            ISdmxObjects sdmxObjectSQLite = GetCodelistFromSQLite(searchInput, codeList, noSqlSaveInput, saveArtefact, currentLangSave).Results;
            _logger.Log($"SaveDataMongoDB GetCodelistFromSQLite {stopwatch.ElapsedMilliseconds}ms", Infrastructure.STLogging.Interface.LogLevelEnum.Debug);
            stopwatch.Restart();

            Sdmx21Connector.UpdateArtefacts(sdmxObjectSQLite, false, true, true, GetEncodedConnectionString());
            _logger.Log($"SaveDataMongoDB UpdateArtefacts {stopwatch.ElapsedMilliseconds}ms", Infrastructure.STLogging.Interface.LogLevelEnum.Debug);
            stopwatch.Restart();
        }

        /// <summary>
        /// Create a NoSql D
        /// <param name="sdmxObject">if null call NSI for get artefact</param>
        /// </summary>
        /// <returns></returns>
        public void PopolateNoSql(string id, string agencyId, string version, string lang, string token, ISdmxObjects sdmxObject = null, List<string> conflictItem = null)
        {
            Stopwatch stopwatch = null;
            stopwatch = Stopwatch.StartNew();

            if (sdmxObject == null)
            {
                sdmxObject = Sdmx21Connector.GetArtefacts(SdmxStructureEnumType.CodeList, id, agencyId, version);
            }

            _logger.Log($"popolateSqlLite GetArtefacts FULL {stopwatch.ElapsedMilliseconds}ms", Infrastructure.STLogging.Interface.LogLevelEnum.Debug);
            stopwatch.Restart();

            if (sdmxObject.Codelists.Count <= 0)
            {
                return;
            }

            var objCodeList = sdmxObject.Codelists.First();

            if (!Directory.Exists($"NoSql\\{token}"))
            {
                Directory.CreateDirectory($"NoSql\\{token}");
            }

            string connString = createConnectionString(token, id, agencyId, version);
            using (var conn = new SQLiteConnection(connString))
            {
                conn.Open();

                inizialiteTableNoSql(conn, false);

                var codeList = new NoSQLCodeList
                {
                    Id = objCodeList.Id,
                    AgencyID = objCodeList.AgencyId,
                    Version = objCodeList.Version,
                    ValidUntil = DateTime.Now.AddHours(8),
                    IsFinal = objCodeList.IsFinal != null && objCodeList.IsFinal.IsTrue
                };

                if (objCodeList.StartDate != null)
                {
                    codeList.ValidFrom = objCodeList.StartDate.Date;
                }
                if (objCodeList.EndDate != null)
                {
                    codeList.ValidTo = objCodeList.EndDate.Date;
                }

                var haveAnnotationOrder = false;
                var countLang = 0;
                var strLang = new List<string>();
                foreach (var nameLang in objCodeList.Names)
                {
                    countLang++;
                    strLang.Add(nameLang.Locale);
                    codeList.Names.Add(nameLang.Locale, nameLang.Value);
                    if (nameLang.Locale.Equals(lang))
                    {
                        codeList.Name = nameLang.Value;
                    }
                }
                foreach (var descLang in objCodeList.Descriptions)
                {
                    codeList.Descriptions.Add(descLang.Locale, descLang.Value);
                    if (descLang.Locale.Equals(lang))
                    {
                        codeList.Description = descLang.Value;
                    }
                }
                foreach (var ann in objCodeList.Annotations)
                {
                    var itemAnnProp = new NoSQLCodeListItemAnnotationProperty
                    {
                        Id = ann.Id,
                        Title = ann.Title,
                        Type = ann.Type
                    };
                    foreach (var iText in ann.Text)
                    {
                        itemAnnProp.Texts.TryAdd(iText.Locale, iText.Value);
                    }
                    codeList.Annotations.Add(itemAnnProp);
                }


                var codelistIsOrder = true;
                var allItem = new List<NoSQLCodeListItem>();
                foreach (var item in objCodeList.Items)
                {
                    //Items
                    var itemAdd = new NoSQLCodeListItem
                    {
                        ItemCode = item.Id,
                        Parent = item.ParentCode ?? ""
                    };
                    foreach (var nameLang in item.Names)
                    {
                        itemAdd.Names.Add(nameLang.Locale, nameLang.Value);
                        if (nameLang.Locale.Equals(lang))
                        {
                            itemAdd.Name = nameLang.Value;
                        }
                    }
                    foreach (var descLang in item.Descriptions)
                    {
                        itemAdd.Descs.Add(descLang.Locale, descLang.Value);
                        if (descLang.Locale.Equals(lang))
                        {
                            itemAdd.Desc = descLang.Value;
                        }
                    }
                    //Annotations
                    var isOrder = false;
                    var orderJustProcessed = false;
                    foreach (var ann in item.Annotations)
                    {
                        if (ann.Type != null && ann.Type.Equals(_nodeConfig.Annotations.CodelistsOrder, StringComparison.InvariantCultureIgnoreCase) && !orderJustProcessed)
                        {
                            orderJustProcessed = true;
                            haveAnnotationOrder = true;
                            foreach (var iText in ann.Text)
                            {
                                var valueConvert = int.MaxValue;
                                int.TryParse(iText.Value, out valueConvert);
                                itemAdd.Order.TryAdd(iText.Locale, valueConvert);
                                if (iText.Locale.Equals(lang))
                                {
                                    isOrder = true;
                                    itemAdd.TreePosition = valueConvert;
                                }
                            }
                        }
                        else
                        {
                            orderJustProcessed = true;
                            var itemAnnProp = new NoSQLCodeListItemAnnotationProperty
                            {
                                Id = ann.Id,
                                Title = ann.Title,
                                Type = ann.Type
                            };
                            foreach (var iText in ann.Text)
                            {
                                itemAnnProp.Texts.TryAdd(iText.Locale, iText.Value);
                            }
                            itemAdd.Annotations.Add(itemAnnProp);
                        }
                    }
                    if (!isOrder)
                    {
                        codelistIsOrder = false;
                        itemAdd.TreePosition = Int32.MaxValue;
                    }

                    allItem.Add(itemAdd);
                }

                codeList.ItemsCount = allItem.Count;

                _logger.Log($"popolateSqlLite Create Items End {stopwatch.ElapsedMilliseconds}ms", Infrastructure.STLogging.Interface.LogLevelEnum.Debug);
                stopwatch.Restart();

                var nodes = BuildTreeAndGetRoots(allItem, lang);

                using (var transaction = conn.BeginTransaction())
                {
                    //Insert CodeList
                    var insertCodelistSQL = new SQLiteCommand("INSERT INTO CodeList([CodeListId],[CodeListAgencyId],[CodeListVersion],[Name],[Names],[Description],[Descriptions],[Changed],[Annotations],[IsOrder],[Uri],[StartDate],[EndDate],[IsFinal],[Languages],[CountLanguages],[CurrentLang],[HaveOrder],[ChangeOrder]) VALUES (@CodeListId,@CodeListAgencyId,@CodeListVersion,@Name,@Names,@Desc,@Descs,@Changed,@Annotations,@IsOrder,@Uri,@StartDate,@EndDate,@IsFinal,@Languages,@CountLanguages,@CurrentLang,@HaveOrder,@ChangeOrder)", conn);
                    insertCodelistSQL.Transaction = transaction;
                    insertCodelistSQL.Parameters.Add(new SQLiteParameter("@CodeListId", DbType.String) { Value = codeList.Id ?? "" });
                    insertCodelistSQL.Parameters.Add(new SQLiteParameter("@CodeListAgencyId", DbType.String) { Value = codeList.AgencyID ?? "" });
                    insertCodelistSQL.Parameters.Add(new SQLiteParameter("@CodeListVersion", DbType.String) { Value = codeList.Version ?? "" });
                    insertCodelistSQL.Parameters.Add(new SQLiteParameter("@Name", DbType.String) { Value = codeList.Name ?? "" });
                    insertCodelistSQL.Parameters.Add(new SQLiteParameter("@Names", DbType.String) { Value = JsonConvert.SerializeObject(codeList.Names) });
                    insertCodelistSQL.Parameters.Add(new SQLiteParameter("@Desc", DbType.String) { Value = codeList.Description ?? "" });
                    insertCodelistSQL.Parameters.Add(new SQLiteParameter("@Descs", DbType.String) { Value = JsonConvert.SerializeObject(codeList.Descriptions) });
                    insertCodelistSQL.Parameters.Add(new SQLiteParameter("@Changed", DbType.Boolean) { Value = true });
                    insertCodelistSQL.Parameters.Add(new SQLiteParameter("@Annotations", DbType.String) { Value = JsonConvert.SerializeObject(codeList.Annotations) });
                    insertCodelistSQL.Parameters.Add(new SQLiteParameter("@IsOrder", DbType.Boolean) { Value = codelistIsOrder });
                    insertCodelistSQL.Parameters.Add(new SQLiteParameter("@Uri", DbType.String) { Value = codeList.Uri ?? "" });
                    insertCodelistSQL.Parameters.Add(new SQLiteParameter("@StartDate", DbType.DateTime) { Value = codeList.ValidFrom });
                    insertCodelistSQL.Parameters.Add(new SQLiteParameter("@EndDate", DbType.DateTime) { Value = codeList.ValidTo });
                    insertCodelistSQL.Parameters.Add(new SQLiteParameter("@IsFinal", DbType.Boolean) { Value = codeList.IsFinal });
                    insertCodelistSQL.Parameters.Add(new SQLiteParameter("@CountLanguages", DbType.Int32) { Value = countLang });
                    insertCodelistSQL.Parameters.Add(new SQLiteParameter("@Languages", DbType.String) { Value = JsonConvert.SerializeObject(strLang) });
                    insertCodelistSQL.Parameters.Add(new SQLiteParameter("@CurrentLang", DbType.String) { Value = lang });
                    insertCodelistSQL.Parameters.Add(new SQLiteParameter("@HaveOrder", DbType.Boolean) { Value = haveAnnotationOrder });
                    insertCodelistSQL.Parameters.Add(new SQLiteParameter("@ChangeOrder", DbType.Boolean) { Value = false });
                    insertCodelistSQL.ExecuteNonQuery();

                    var lastId = (int)conn.LastInsertRowId;
                    if (nodes.Count > 0)
                    {
                        //Insert Item
                        var insertSQL = new SQLiteCommand("INSERT INTO CodeListItem ([ItemCode],[Parent],[Name],[Names],[Description],[Descriptions],[TreePosition],[Changed],[Annotations],[Order],[MergeItemConflict]) VALUES (@ItemCode,@Parent,@Name,@Names,@Desc,@Descs,@TreePosition,@Changed,@Annotations,@Order,@MergeItemConflict)", conn);
                        insertCodelistSQL.Transaction = transaction;
                        insertSQL.Prepare();

                        var treePosition = 0;
                        PopolateItemNode(nodes, conn, insertSQL, transaction, ref treePosition, lang, conflictItem);
                    }

                    insertCodelistSQL = new SQLiteCommand("SELECT Count(Id) FROM CodeListItem", conn);
                    insertCodelistSQL.Transaction = transaction;
                    var countItems = (long)insertCodelistSQL.ExecuteScalar();

                    insertCodelistSQL = new SQLiteCommand("UPDATE CodeList SET [CountItems]=@CountItems WHERE [Id]=@Id", conn);
                    insertCodelistSQL.Parameters.Add(new SQLiteParameter("@CountItems", DbType.Int32) { Value = countItems });
                    insertCodelistSQL.Parameters.Add(new SQLiteParameter("@Id", DbType.Int32) { Value = lastId });
                    insertCodelistSQL.ExecuteNonQuery();

                    transaction.Commit();
                }
            }
            try
            {
                var dirs = new DirectoryInfo("NoSql").GetDirectories();
                foreach (var dir in dirs)
                {
                    if (dir.CreationTime < DateTime.Now.AddDays(-1))
                    {
                        try
                        {
                            dir.Delete(true);
                        }
                        catch (Exception) { }

                    }
                }
            }
            catch (Exception)
            {

            }


            _logger.Log($"popolateSqlLite Write End {stopwatch.ElapsedMilliseconds}ms", Infrastructure.STLogging.Interface.LogLevelEnum.Debug);
            stopwatch.Restart();
        }

        private void inizialiteTableNoSql(SQLiteConnection conn, bool inizializePreviewTable)
        {
            var isPreview = inizializePreviewTable ? "Preview" : "";
            var columnForPreview = inizializePreviewTable ? ",[IsSelected]   SMALLINT DEFAULT 0, [OriginalParent]   NVARCHAR DEFAULT ''" : "";
            var sqlite_cmd = conn.CreateCommand();
            sqlite_cmd.CommandText = $"DROP TABLE IF EXISTS {isPreview}CodeList";
            sqlite_cmd.ExecuteNonQuery();

            sqlite_cmd.CommandText = $@"CREATE TABLE IF NOT EXISTS
    [{isPreview}CodeList](
    [Id]     INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    [CodeListId]   NVARCHAR NULL,
    [CodeListAgencyId]   NVARCHAR NULL,
    [CodeListVersion]   NVARCHAR NULL,
    [CountItems]   INTEGER  DEFAULT 0,
    [CountLanguages]   INTEGER NULL,
    [CurrentLang]   NVARCHAR NULL,
    [Languages]   NVARCHAR NULL,
    [Name]   NVARCHAR NULL,
    [Names]   NVARCHAR NULL,
    [Description]   NVARCHAR NULL,
    [Descriptions]   NVARCHAR NULL,
    [Changed]   SMALLINT DEFAULT 0,
    [Annotations]   NVARCHAR NULL,
    [IsOrder]   SMALLINT DEFAULT 0,
    [Uri]   TEXT NULL,
    [StartDate]   TEXT NULL,
    [EndDate]   TEXT NULL,
    [IsFinal]   SMALLINT DEFAULT 0,
    [HaveOrder]   SMALLINT DEFAULT 0,
    [ChangeOrder]   SMALLINT DEFAULT 0)";
            sqlite_cmd.ExecuteNonQuery();

            sqlite_cmd.CommandText = $"DROP TABLE IF EXISTS {isPreview}CodeListItem";
            sqlite_cmd.ExecuteNonQuery();

            sqlite_cmd.CommandText = $@"CREATE TABLE IF NOT EXISTS
    [{isPreview}CodeListItem](
    [Id]     INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    [ItemCode]   NVARCHAR NULL,
    [Parent]   NVARCHAR NULL,
    [Name]   NVARCHAR NULL,
    [Names]   NVARCHAR NULL,
    [Description]   NVARCHAR NULL,
    [Descriptions]   NVARCHAR NULL,
    [ChildrenCount]   INTEGER  DEFAULT 0,
    [SubTreeCount]   INTEGER  DEFAULT 0,
    [TreePosition]   INTEGER  DEFAULT 0,
    [Changed]   SMALLINT DEFAULT 0,
    [NoMove]   SMALLINT DEFAULT 0,
    [Annotations]   NVARCHAR NULL,
    [Order]   NVARCHAR NULL,
    [WorkingIsSelected]   SMALLINT DEFAULT 0,
    [CheckColumn]   SMALLINT DEFAULT 0,
    [MergeItemConflict]   SMALLINT DEFAULT 0{columnForPreview})";
            sqlite_cmd.ExecuteNonQuery();

            sqlite_cmd.CommandText = $"DROP TABLE IF EXISTS SelectItem";
            sqlite_cmd.ExecuteNonQuery();

            sqlite_cmd.CommandText = $@"CREATE TABLE IF NOT EXISTS
    [SelectItem](
    [ItemCode]     NVARCHAR NOT NULL PRIMARY KEY)";
            sqlite_cmd.ExecuteNonQuery();

            sqlite_cmd.CommandText = $@"DROP INDEX IF EXISTS {isPreview}CodeListItemTreePosition";
            sqlite_cmd.ExecuteNonQuery();
            sqlite_cmd.CommandText = $@"CREATE INDEX {isPreview}CodeListItemTreePosition ON {isPreview}CodeListItem(TreePosition);";
            sqlite_cmd.ExecuteNonQuery();
            sqlite_cmd.CommandText = $@"DROP INDEX IF EXISTS {isPreview}CodeListItemParent";
            sqlite_cmd.ExecuteNonQuery();
            sqlite_cmd.CommandText = $@"CREATE INDEX {isPreview}CodeListItemParent ON {isPreview}CodeListItem(Parent);";
            sqlite_cmd.ExecuteNonQuery();
            sqlite_cmd.CommandText = $@"DROP INDEX IF EXISTS {isPreview}CodeListItemItemCode";
            sqlite_cmd.ExecuteNonQuery();
            sqlite_cmd.CommandText = $@"CREATE INDEX {isPreview}CodeListItemItemCode ON {isPreview}CodeListItem(ItemCode);";
            sqlite_cmd.ExecuteNonQuery();
        }

        public ArtefactSearch SearchItemSQLite(NoSqlSearchParameters noSqlSearchInput)
        {
            var resultSearch = GetCodelistFromSQLite(noSqlSearchInput, null, null, null, null);

            Stopwatch stopwatch = null;
            stopwatch = Stopwatch.StartNew();
            resultSearch.JsonResult = GetSdmxJsonFromSdmxObjects(resultSearch.Results);
            resultSearch.Results = null;
            _logger.Log($"SearchItemSqlLite SdmxObjectsImpl Parse To Json {stopwatch.ElapsedMilliseconds}ms", Infrastructure.STLogging.Interface.LogLevelEnum.Debug);
            stopwatch.Restart();

            return resultSearch;
        }

        public ArtefactSearch SearchPreviewItemSQLite(NoSqlSearchParameters noSqlSearchInput, bool forPreviewTable, bool emptyResultsItem = true)
        {
            var resultSearch = GetCodelistPreviewFromSQLite(noSqlSearchInput, null, null, forPreviewTable);

            Stopwatch stopwatch = null;
            stopwatch = Stopwatch.StartNew();
            resultSearch.JsonResult = JsonConvert.SerializeObject(resultSearch.Items, new JsonSerializerSettings { ContractResolver = new CamelCasePropertyNamesContractResolver() });
            if (emptyResultsItem)
            {
                resultSearch.Results = null;
                resultSearch.Items = null;
            }
            _logger.Log($"SearchItemSqlLite SdmxObjectsImpl Parse To Json {stopwatch.ElapsedMilliseconds}ms", Infrastructure.STLogging.Interface.LogLevelEnum.Debug);
            stopwatch.Restart();

            return resultSearch;
        }

        public long SelectedCountItemSQLite(string id, string agencyId, string version, string lang, string token, bool forPreviewTable)
        {
            var previewTable = forPreviewTable ? "Preview" : "";

            if (!forPreviewTable && !isDbInizializzate(token, id, agencyId, version, ""))
            {
                return 0;
            }
            else if (forPreviewTable && !isDbPreviewTableInizializzate(token, id, agencyId, version, lang))
            {
                return 0;
            }

            string connString = createConnectionString(token, id, agencyId, version);
            using (var conn = new SQLiteConnection(connString))
            {
                conn.Open();

                var sqlCom = $"SELECT COUNT(*) FROM {previewTable}CodeListItem WHERE WorkingIsSelected=1";
                var scdCommand = new SQLiteCommand(sqlCom, conn);
                return (long)scdCommand.ExecuteScalar();
            }
        }

        public long CountItemSQLite(string id, string agencyId, string version, string token)
        {
            if (!File.Exists($"NoSql\\{token}\\datafile{id}{agencyId}{version}.sqlite"))
            {
                PopolateNoSql(id, agencyId, version, "en", token);
            }

            string connString = createConnectionString(token, id, agencyId, version);
            using (var conn = new SQLiteConnection(connString))
            {
                conn.Open();

                var sqlCom = "SELECT CountItems FROM CodeList";
                var scdCommand = new SQLiteCommand(sqlCom, conn);
                return (long)scdCommand.ExecuteScalar();
            }
        }

        public void InsertItemSQLite(string id, string agencyId, string version, string lang, string token, NoSQLCodeListItem item)
        {
            if (!isDbInizializzate(token, id, agencyId, version, lang))
            {
                PopolateNoSql(id, agencyId, version, lang, token);
            }

            var connString = createConnectionString(token, id, agencyId, version);
            using (var conn = new SQLiteConnection(connString))
            {
                conn.Open();

                var needAnnotation = false;
                var maxChildrenTreePosition = 0L;
                var maxAllTreePosition = 0L;
                var treePosition = 0L;

                string sqlConHaveItem = "SELECT COUNT(*) FROM CodeListItem WHERE ItemCode=@ItemCode";
                var haveItemCode = new SQLiteCommand(sqlConHaveItem, conn);
                haveItemCode.Parameters.AddWithValue("@ItemCode", item.ItemCode);
                var isDuplicate = (long)haveItemCode.ExecuteScalar();
                if (isDuplicate > 0)
                {
                    throw Utils.getCustomException("ITEM_DUPLICATE",
                           @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + $" - try to insert a node duplicate.", Infrastructure.STLogging.Interface.LogLevelEnum.Error);
                }

                //Take max for same Parent
                string sqlComMax = "SELECT Max(TreePosition) AS Tree FROM CodeListItem WHERE Parent=@Parent";
                var scdCommandMax = new SQLiteCommand(sqlComMax, conn);
                scdCommandMax.Parameters.AddWithValue("@Parent", item.Parent ?? "");
                var objMax = scdCommandMax.ExecuteScalar();
                if (objMax != null && objMax != DBNull.Value)
                {
                    maxChildrenTreePosition = (long)objMax;
                }
                //Take max all
                sqlComMax = "SELECT Max(TreePosition) AS Tree FROM CodeListItem";
                scdCommandMax = new SQLiteCommand(sqlComMax, conn);
                objMax = scdCommandMax.ExecuteScalar();
                if (objMax != null && objMax != DBNull.Value)
                {
                    maxAllTreePosition = (long)objMax;
                }
                //Take treePosition
                sqlComMax = "SELECT TreePosition FROM CodeListItem WHERE ItemCode=@Parent";
                scdCommandMax = new SQLiteCommand(sqlComMax, conn);
                scdCommandMax.Parameters.AddWithValue("@Parent", item.Parent ?? "");
                objMax = scdCommandMax.ExecuteScalar();
                if (objMax != null && objMax != DBNull.Value)
                {
                    if (maxChildrenTreePosition != 0)
                    {
                        treePosition = maxChildrenTreePosition + 1;
                    }
                    else
                    {
                        treePosition = (long)objMax + 1;
                    }
                }
                else
                {
                    treePosition = maxAllTreePosition + 1;
                }

                if (item.TreePosition > 0)
                { //Insert in specific position
                    //Take the first TreePosition on tree after the value  TreePosition of the new Item
                    var sqlCom = "SELECT Min(TreePosition) AS Tree FROM CodeListItem WHERE Parent=@Parent AND TreePosition>=@Position";
                    var scdCommand = new SQLiteCommand(sqlCom, conn);
                    scdCommand.Parameters.AddWithValue("@Parent", item.Parent ?? "");
                    scdCommand.Parameters.AddWithValue("@Position", item.TreePosition);
                    var posResult = scdCommand.ExecuteScalar();

                    if (posResult != null && posResult != DBNull.Value)
                    {
                        treePosition = (long)posResult;
                    }
                    else
                    {
                        //Take the last TreePosition on tree 
                        sqlCom = "SELECT Max(TreePosition) AS Tree FROM CodeListItem WHERE Parent=@Parent";
                        scdCommand = new SQLiteCommand(sqlCom, conn);
                        scdCommand.Parameters.AddWithValue("@Parent", item.Parent ?? "");
                        posResult = scdCommand.ExecuteScalar();
                        if (posResult != null && posResult != DBNull.Value)
                        {
                            treePosition = (long)posResult + 1;
                        }
                        else
                        { //Take the Parent TreePosition on tree 
                            sqlCom = "SELECT Max(TreePosition) AS Tree FROM CodeListItem";
                            if (!string.IsNullOrWhiteSpace(item.Parent))
                            {
                                sqlCom += " WHERE ItemCode = @Parent";
                            }
                            scdCommand = new SQLiteCommand(sqlCom, conn);
                            if (!string.IsNullOrWhiteSpace(item.Parent))
                            {
                                scdCommand.Parameters.AddWithValue("@Parent", item.Parent ?? "");
                            }
                            posResult = scdCommand.ExecuteScalar();
                            if (posResult != null && posResult != DBNull.Value)
                            {
                                treePosition = (long)posResult + 1;
                            }
                            else
                            {
                                treePosition = 1L;
                            }
                        }
                    }
                }

                if (treePosition <= maxAllTreePosition)
                {
                    needAnnotation = true;
                }

                using (var transaction = conn.BeginTransaction())
                {
                    var updateSQL = new SQLiteCommand("UPDATE CodeListItem SET TreePosition=TreePosition+1, Changed=1 WHERE TreePosition>=@TreePosition", conn);
                    updateSQL.Parameters.Add(new SQLiteParameter("@TreePosition", DbType.Int32) { Value = treePosition });
                    updateSQL.ExecuteNonQuery();

                    var insertSQL = new SQLiteCommand("INSERT INTO CodeListItem ([ItemCode],[Parent],[Name],[Names],[Description],[Descriptions],[TreePosition],[Changed],[Annotations],[Order]) VALUES (@ItemCode,@Parent,@Name,@Names,@Desc,@Descs,@TreePosition,@Changed,@Annotations,@Order)", conn);
                    insertSQL.Parameters.Add(new SQLiteParameter("@ItemCode", DbType.String) { Value = item.ItemCode ?? "" });
                    insertSQL.Parameters.Add(new SQLiteParameter("@Parent", DbType.String) { Value = item.Parent ?? "" });
                    insertSQL.Parameters.Add(new SQLiteParameter("@Name", DbType.String) { Value = item.Name ?? "" });
                    insertSQL.Parameters.Add(new SQLiteParameter("@Names", DbType.String) { Value = item.Names != null ? JsonConvert.SerializeObject(item.Names) : "{}" });
                    insertSQL.Parameters.Add(new SQLiteParameter("@Desc", DbType.String) { Value = item.Desc ?? "" });
                    insertSQL.Parameters.Add(new SQLiteParameter("@Descs", DbType.String) { Value = item.Descs != null ? JsonConvert.SerializeObject(item.Descs) : "{}" });
                    insertSQL.Parameters.Add(new SQLiteParameter("@TreePosition", DbType.Int32) { Value = treePosition });
                    insertSQL.Parameters.Add(new SQLiteParameter("@Changed", DbType.Boolean) { Value = true });
                    insertSQL.Parameters.Add(new SQLiteParameter("@Annotations", DbType.String) { Value = item.Annotations != null ? JsonConvert.SerializeObject(item.Annotations) : "{}" });
                    insertSQL.Parameters.Add(new SQLiteParameter("@Order", DbType.String) { Value = "{}" });

                    try
                    {
                        insertSQL.ExecuteNonQuery();
                    }
                    catch (Exception ex)
                    {
                        throw new Exception(ex.Message);
                    }

                    if (needAnnotation)
                    { //Only Finalneed annotation for change position
                        var annotationSQL = new SQLiteCommand("SELECT IsFinal FROM CodeList", conn);
                        var isFinal = (Int16)annotationSQL.ExecuteScalar();

                        if (isFinal > 0)
                        {
                            annotationSQL = new SQLiteCommand("UPDATE CodeList SET ChangeOrder=1", conn);
                            annotationSQL.ExecuteNonQuery();
                        }
                    }

                    //Add +1 to the SubTreeCount
                    insertSQL = new SQLiteCommand(@"WITH RECURSIVE paths(ItemCode, Parent, TreePosition, SubTreeCount) AS (
    SELECT ItemCode, Parent, TreePosition, SubTreeCount FROM CodeListItem WHERE CodeListItem.ItemCode=@ItemCode
    UNION
    SELECT CodeListItem.ItemCode, CodeListItem.Parent, CodeListItem.TreePosition, CodeListItem.SubTreeCount
    FROM CodeListItem JOIN paths WHERE CodeListItem.ItemCode = paths.parent
)
UPDATE CodeListItem SET SubTreeCount=SubTreeCount+1 WHERE ItemCode IN (SELECT ItemCode FROM paths WHERE ItemCode<>@ItemCode)", conn);
                    insertSQL.Parameters.Add(new SQLiteParameter("@ItemCode", DbType.String) { Value = item.ItemCode });
                    insertSQL.ExecuteNonQuery();

                    transaction.Commit();
                }
            }

            if (item.AutoSave)
            {
                SaveDataSqlLite(id, agencyId, version, lang, token, null, null);
            }
        }

        public void UpdateItemSQLite(string id, string agencyId, string version, string lang, string token, NoSQLCodeListItem item)
        {
            if (!isDbInizializzate(token, id, agencyId, version, lang))
            {
                PopolateNoSql(id, agencyId, version, lang, token);
            }

            var connString = createConnectionString(token, id, agencyId, version);
            using (var conn = new SQLiteConnection(connString))
            {
                conn.Open();

                string sqlCom = "SELECT TreePosition, Parent FROM CodeListItem WHERE ItemCode=@ItemCode";
                var scdCommand = new SQLiteCommand(sqlCom, conn);
                scdCommand.Parameters.Add(new SQLiteParameter("@ItemCode", DbType.String) { Value = item.ItemCode });
                var reader = scdCommand.ExecuteReader();

                var treePosition = -1L;
                var parent = "";
                while (reader.Read())
                {
                    treePosition = (long)reader["TreePosition"];
                    parent = (string)reader["Parent"];
                }
                reader.Close();

                if (treePosition != item.TreePosition || !parent.Equals(item.Parent ?? ""))
                { //Call Move
                    var before = "";
                    var after = "";
                    if (treePosition > item.TreePosition)
                    {
                        sqlCom = "SELECT ItemCode FROM CodeListItem WHERE TreePosition IN (SELECT Min(TreePosition) FROM CodeListItem WHERE Parent=@Parent AND TreePosition>=@Position)";
                        scdCommand = new SQLiteCommand(sqlCom, conn);
                        scdCommand.Parameters.Add(new SQLiteParameter("@Parent", DbType.String) { Value = item.Parent ?? "" });
                        scdCommand.Parameters.Add(new SQLiteParameter("@Position", DbType.Int32) { Value = item.TreePosition });
                        var result = scdCommand.ExecuteScalar();

                        if (result != null)
                        {
                            before = (string)result;
                        }
                    }
                    else
                    {
                        sqlCom = "SELECT ItemCode FROM CodeListItem WHERE TreePosition IN (SELECT Max(TreePosition) FROM CodeListItem WHERE Parent=@Parent AND TreePosition<=@Position)";
                        scdCommand = new SQLiteCommand(sqlCom, conn);
                        scdCommand.Parameters.Add(new SQLiteParameter("@Parent", DbType.String) { Value = item.Parent ?? "" });
                        scdCommand.Parameters.Add(new SQLiteParameter("@Position", DbType.Int32) { Value = item.TreePosition });
                        var result = scdCommand.ExecuteScalar();

                        if (result != null)
                        {
                            after = (string)result;
                        }
                    }

                    var tmp = item.AutoSave; //Prevent double save
                    item.AutoSave = false;
                    MoveItemSQLite(id, agencyId, version, lang, token, new NoSQLMoveCodeListItem { ItemCode = item.ItemCode, Parent = item.Parent, MoveBefore = before, MoveAfter = after });
                    item.AutoSave = tmp;
                }

                var updateSQL = new SQLiteCommand($@"UPDATE CodeListItem SET [Name]=@Name,[Names]=@Names,[Description]=@Desc,[Descriptions]=@Descs,[Changed]=@Changed,[Annotations]=@Annotations,[Order]=@Order WHERE [ItemCode]=@ItemCode", conn);
                updateSQL.Parameters.Add(new SQLiteParameter("@ItemCode", DbType.String) { Value = item.ItemCode ?? "" });
                updateSQL.Parameters.Add(new SQLiteParameter("@Name", DbType.String) { Value = item.Name ?? "" });
                updateSQL.Parameters.Add(new SQLiteParameter("@Names", DbType.String) { Value = item.Names != null ? JsonConvert.SerializeObject(item.Names) : "{}" });
                updateSQL.Parameters.Add(new SQLiteParameter("@Desc", DbType.String) { Value = item.Desc ?? "" });
                updateSQL.Parameters.Add(new SQLiteParameter("@Descs", DbType.String) { Value = item.Descs != null ? JsonConvert.SerializeObject(item.Descs) : "{}" });
                updateSQL.Parameters.Add(new SQLiteParameter("@Changed", DbType.Boolean) { Value = true });
                updateSQL.Parameters.Add(new SQLiteParameter("@Annotations", DbType.String) { Value = item.Annotations != null ? JsonConvert.SerializeObject(item.Annotations) : "{}" });
                updateSQL.Parameters.Add(new SQLiteParameter("@Order", DbType.String) { Value = item.Order != null ? JsonConvert.SerializeObject(item.Order) : "{}" });

                try
                {
                    updateSQL.ExecuteNonQuery();
                }
                catch (Exception ex)
                {
                    throw new Exception(ex.Message);
                }
            }

            if (item.AutoSave)
            {
                SaveDataSqlLite(id, agencyId, version, lang, token, null, null);
            }
        }

        public void DeleteItemSQLite(string id, string agencyId, string version, string lang, string token, string itemCode, bool autoSave)
        {
            if (!isDbInizializzate(token, id, agencyId, version, ""))
            {
                PopolateNoSql(id, agencyId, version, lang, token);
            }

            var connString = createConnectionString(token, id, agencyId, version);
            using (var conn = new SQLiteConnection(connString))
            {
                conn.Open();

                var deleteSQL = new SQLiteCommand("SELECT IsFinal FROM CodeList", conn);
                var isFinal = (Int16)deleteSQL.ExecuteScalar();
                if (isFinal > 0)
                {
                    throw Utils.getCustomException("OPERATION_NOT_PERMITTED",
                           @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + $" - You can't remove an item from final codelist", Infrastructure.STLogging.Interface.LogLevelEnum.Error);
                }

                deleteSQL = new SQLiteCommand("SELECT SubTreeCount FROM CodeListItem WHERE [ItemCode]=@ItemCode", conn);
                deleteSQL.Parameters.Add(new SQLiteParameter("@ItemCode", DbType.String) { Value = itemCode });
                var countChildren = deleteSQL.ExecuteScalar();

                if (countChildren != null && countChildren != DBNull.Value && (long)countChildren > 0)
                {
                    throw Utils.getCustomException("CANT_DELETE_ITEM_WITH_CHILDREN",
                           @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + $" - try to delete node with {countChildren} children.", Infrastructure.STLogging.Interface.LogLevelEnum.Error);
                }


                try
                {
                    deleteSQL = new SQLiteCommand("UPDATE CodeList SET CountItems=CountItems-1", conn);
                    deleteSQL.ExecuteNonQuery();

                    deleteSQL = new SQLiteCommand(@"WITH RECURSIVE paths(ItemCode, Parent, TreePosition, SubTreeCount) AS (
    SELECT ItemCode, Parent, TreePosition, SubTreeCount FROM CodeListItem WHERE CodeListItem.ItemCode = @ItemCode
    UNION
    SELECT CodeListItem.ItemCode, CodeListItem.Parent, CodeListItem.TreePosition, CodeListItem.SubTreeCount
    FROM CodeListItem JOIN paths WHERE CodeListItem.ItemCode = paths.parent
)
UPDATE CodeListItem SET SubTreeCount = SubTreeCount - 1 WHERE ItemCode IN (SELECT ItemCode FROM paths)", conn);
                    deleteSQL.Parameters.Add(new SQLiteParameter("@ItemCode", DbType.String) { Value = itemCode });
                    deleteSQL.ExecuteNonQuery();

                    deleteSQL = new SQLiteCommand("DELETE FROM CodeListItem WHERE [ItemCode]=@ItemCode", conn);
                    deleteSQL.Parameters.Add(new SQLiteParameter("@ItemCode", DbType.String) { Value = itemCode });
                    deleteSQL.ExecuteNonQuery();
                }
                catch (Exception ex)
                {
                    throw new Exception(ex.Message);
                }
            }

            if (autoSave)
            {
                SaveDataSqlLite(id, agencyId, version, lang, token, null, null);
            }
        }

        public void MoveItemSQLite(string id, string agencyId, string version, string lang, string token, NoSQLMoveCodeListItem item)
        {
            if (!isDbInizializzate(token, id, agencyId, version, lang))
            {
                PopolateNoSql(id, agencyId, version, lang, token);
            }
            item.Parent = item.Parent ?? "";

            var connString = createConnectionString(token, id, agencyId, version);
            using (var conn = new SQLiteConnection(connString))
            {
                conn.Open();

                var sqlCom = "SELECT TreePosition, Parent FROM CodeListItem WHERE ItemCode=@ItemCode";
                var scdCommand = new SQLiteCommand(sqlCom, conn);
                scdCommand.Parameters.AddWithValue("@ItemCode", item.ItemCode);
                var reader = scdCommand.ExecuteReader();
                var currentTreePosition = -1L;
                var currentParent = "";
                while (reader.Read())
                {
                    currentTreePosition = (long)reader["TreePosition"];
                    currentParent = (string)reader["Parent"];
                }
                reader.Close();

                var moveToTreePosition = -1L;
                if (!string.IsNullOrWhiteSpace(item.MoveBefore) || !string.IsNullOrWhiteSpace(item.MoveAfter))
                {
                    sqlCom = "SELECT TreePosition, SubTreeCount FROM CodeListItem WHERE ItemCode=@ItemCode";
                    scdCommand = new SQLiteCommand(sqlCom, conn);
                    scdCommand.Parameters.AddWithValue("@ItemCode", !string.IsNullOrWhiteSpace(item.MoveBefore) ? item.MoveBefore : item.MoveAfter);
                    var readerPosition = scdCommand.ExecuteReader();
                    var subCount = -1L;
                    while (readerPosition.Read())
                    {
                        moveToTreePosition = (long)readerPosition["TreePosition"];
                        subCount = (long)readerPosition["SubTreeCount"];
                    }
                    readerPosition.Close();
                    if (moveToTreePosition > -1 && !string.IsNullOrWhiteSpace(item.MoveAfter))
                    {
                        moveToTreePosition = moveToTreePosition + subCount + 1;
                    }
                }
                else
                {
                    sqlCom = "SELECT Max(TreePosition) AS TreePosition, SubTreeCount FROM CodeListItem WHERE Parent=@Parent";
                    scdCommand = new SQLiteCommand(sqlCom, conn);
                    scdCommand.Parameters.AddWithValue("@Parent", item.Parent ?? "");
                    var readerPos = scdCommand.ExecuteReader();
                    var haveData = false;
                    while (readerPos.Read())
                    {
                        if (readerPos["TreePosition"] != null && readerPos["TreePosition"] != DBNull.Value)
                        {
                            haveData = true;
                            moveToTreePosition = (long)readerPos["TreePosition"] + (long)readerPos["SubTreeCount"];
                        }
                    }
                    readerPos.Close();
                    if (!haveData)
                    {
                        sqlCom = "SELECT TreePosition, SubTreeCount FROM CodeListItem WHERE ItemCode=@Parent";
                        scdCommand = new SQLiteCommand(sqlCom, conn);
                        scdCommand.Parameters.AddWithValue("@Parent", item.Parent ?? "");
                        readerPos = scdCommand.ExecuteReader();
                        while (readerPos.Read())
                        {
                            moveToTreePosition = (long)readerPos["TreePosition"] + (long)readerPos["SubTreeCount"];
                        }
                        readerPos.Close();
                    }
                }

                using (var transaction = conn.BeginTransaction())
                {
                    sqlCom = "SELECT SubTreeCount FROM CodeListItem WHERE ItemCode=@ItemCode";
                    scdCommand = new SQLiteCommand(sqlCom, conn);
                    scdCommand.Parameters.AddWithValue("@ItemCode", item.ItemCode);
                    var itemToMove = (long)scdCommand.ExecuteScalar() + 1;

                    if (!currentParent.Equals(item.Parent))
                    {
                        if (string.IsNullOrWhiteSpace(item.MoveBefore) && string.IsNullOrWhiteSpace(item.MoveAfter))
                        {
                            moveToTreePosition++; //Insert in last position the new item in subTree
                        }
                        //take all the old fathers to remove SubTreeCount + 1
                        scdCommand = new SQLiteCommand(@"WITH RECURSIVE paths(ItemCode, Parent, TreePosition, SubTreeCount) AS (
    SELECT ItemCode, Parent, TreePosition, SubTreeCount FROM CodeListItem WHERE CodeListItem.ItemCode=@ItemCode
    UNION
    SELECT CodeListItem.ItemCode, CodeListItem.Parent, CodeListItem.TreePosition, CodeListItem.SubTreeCount
    FROM CodeListItem JOIN paths WHERE CodeListItem.ItemCode = paths.parent
)
UPDATE CodeListItem SET SubTreeCount=SubTreeCount-@CountItem WHERE ItemCode IN (SELECT ItemCode FROM paths WHERE ItemCode<>@ItemCode)", conn);
                        scdCommand.Parameters.AddWithValue("@ItemCode", item.ItemCode);
                        scdCommand.Parameters.AddWithValue("@CountItem", itemToMove);
                        scdCommand.ExecuteNonQuery();
                        //take all new fathers to add the SubTreeCount + 1
                        scdCommand = new SQLiteCommand(@"WITH RECURSIVE paths(ItemCode, Parent, TreePosition, SubTreeCount) AS (
    SELECT ItemCode, Parent, TreePosition, SubTreeCount FROM CodeListItem WHERE CodeListItem.ItemCode=@ItemCode
    UNION
    SELECT CodeListItem.ItemCode, CodeListItem.Parent, CodeListItem.TreePosition, CodeListItem.SubTreeCount
    FROM CodeListItem JOIN paths WHERE CodeListItem.ItemCode = paths.parent
)
UPDATE CodeListItem SET SubTreeCount=SubTreeCount+@CountItem WHERE ItemCode IN (SELECT ItemCode FROM paths)", conn);
                        scdCommand.Parameters.AddWithValue("@ItemCode", item.Parent ?? "");
                        scdCommand.Parameters.AddWithValue("@CountItem", itemToMove);
                        scdCommand.ExecuteNonQuery();
                    }

                    if (currentTreePosition < moveToTreePosition)
                    {
                        //Change position of node 
                        var updateSQL = new SQLiteCommand("UPDATE CodeListItem SET TreePosition=TreePosition-@ItemToMove, Changed=1, NoMove=1 WHERE TreePosition>=@StartMoveTreePosition AND TreePosition<@EndMoveTreePosition", conn);
                        updateSQL.Parameters.Add(new SQLiteParameter("@ItemToMove", DbType.Int32) { Value = itemToMove });
                        updateSQL.Parameters.Add(new SQLiteParameter("@StartMoveTreePosition", DbType.Int32) { Value = currentTreePosition + itemToMove });
                        updateSQL.Parameters.Add(new SQLiteParameter("@EndMoveTreePosition", DbType.Int32) { Value = moveToTreePosition });
                        updateSQL.ExecuteNonQuery();

                        //Move Item
                        updateSQL = new SQLiteCommand("UPDATE CodeListItem SET TreePosition=TreePosition+@ItemToMove, Changed=1 WHERE TreePosition>=@CurrentTreePosition AND TreePosition<@SubTreePosition AND NoMove=0", conn);
                        updateSQL.Parameters.Add(new SQLiteParameter("@ItemToMove", DbType.Int32) { Value = moveToTreePosition - currentTreePosition - itemToMove });
                        updateSQL.Parameters.Add(new SQLiteParameter("@CurrentTreePosition", DbType.Int32) { Value = currentTreePosition });
                        updateSQL.Parameters.Add(new SQLiteParameter("@SubTreePosition", DbType.Int32) { Value = currentTreePosition + itemToMove });
                        updateSQL.ExecuteNonQuery();

                        updateSQL = new SQLiteCommand("UPDATE CodeListItem SET NoMove=0 WHERE NoMove=1", conn);
                        updateSQL.ExecuteNonQuery();
                    }
                    else if (currentTreePosition > moveToTreePosition)
                    {
                        var updateSQL = new SQLiteCommand("UPDATE CodeListItem SET TreePosition=TreePosition+@ItemToMove, Changed=1, NoMove=1 WHERE TreePosition>=@CurrentTreePosition AND TreePosition<@SubTreePosition", conn);
                        updateSQL.Parameters.Add(new SQLiteParameter("@ItemToMove", DbType.Int32) { Value = moveToTreePosition - currentTreePosition });
                        updateSQL.Parameters.Add(new SQLiteParameter("@CurrentTreePosition", DbType.Int32) { Value = currentTreePosition });
                        updateSQL.Parameters.Add(new SQLiteParameter("@SubTreePosition", DbType.Int32) { Value = currentTreePosition + itemToMove });
                        updateSQL.ExecuteNonQuery();

                        updateSQL = new SQLiteCommand("UPDATE CodeListItem SET TreePosition=TreePosition+@ItemToMove, Changed=1 WHERE TreePosition>=@StartMoveTreePosition AND TreePosition<@EndMoveTreePosition AND NoMove=0", conn);
                        updateSQL.Parameters.Add(new SQLiteParameter("@ItemToMove", DbType.Int32) { Value = itemToMove });
                        updateSQL.Parameters.Add(new SQLiteParameter("@StartMoveTreePosition", DbType.Int32) { Value = moveToTreePosition });
                        updateSQL.Parameters.Add(new SQLiteParameter("@EndMoveTreePosition", DbType.Int32) { Value = currentTreePosition });
                        updateSQL.ExecuteNonQuery();

                        updateSQL = new SQLiteCommand("UPDATE CodeListItem SET NoMove=0 WHERE NoMove=1", conn);
                        updateSQL.ExecuteNonQuery();
                    }

                    var curParentChange = "";
                    if (!currentParent.Equals(item.Parent))
                    {
                        curParentChange = ", Changed=1";
                    }
                    var updateParentSQL = new SQLiteCommand($"UPDATE CodeListItem SET Parent=@Parent{curParentChange} WHERE ItemCode=@ItemCode", conn);
                    updateParentSQL.Parameters.Add(new SQLiteParameter("@Parent", DbType.String) { Value = item.Parent ?? "" });
                    updateParentSQL.Parameters.Add(new SQLiteParameter("@ItemCode", DbType.String) { Value = item.ItemCode });
                    updateParentSQL.ExecuteNonQuery();



                    var annotationSQL = new SQLiteCommand("SELECT IsFinal FROM CodeList", conn);
                    var isFinal = (Int16)annotationSQL.ExecuteScalar();

                    if (isFinal > 0)
                    {
                        annotationSQL = new SQLiteCommand("UPDATE CodeList SET ChangeOrder=1", conn);
                        annotationSQL.ExecuteNonQuery();
                    }

                    transaction.Commit();
                }
            }

            if (item.AutoSave)
            {
                SaveDataSqlLite(id, agencyId, version, lang, token, null, null);
            }
        }

        private int PopolateItemNode(List<Node> nodes, SQLiteConnection conn, SQLiteCommand insertSQL, SQLiteTransaction transaction, ref int treePosition, string lang, List<string> conflictItem)
        {
            foreach (var item in nodes.OrderBy(n => n.AssociatedObject.TreePosition))
            {
                treePosition++;
                item.AssociatedObject.TreePosition = treePosition;
                insertSQL.Parameters.Add(new SQLiteParameter("@ItemCode", DbType.String) { Value = item.AssociatedObject.ItemCode ?? "" });
                insertSQL.Parameters.Add(new SQLiteParameter("@Parent", DbType.String) { Value = item.AssociatedObject.Parent ?? "" });
                insertSQL.Parameters.Add(new SQLiteParameter("@Name", DbType.String) { Value = item.AssociatedObject.Name ?? "" });
                insertSQL.Parameters.Add(new SQLiteParameter("@Names", DbType.String) { Value = item.AssociatedObject.Names != null ? JsonConvert.SerializeObject(item.AssociatedObject.Names) : "{}" });
                insertSQL.Parameters.Add(new SQLiteParameter("@Desc", DbType.String) { Value = item.AssociatedObject.Desc ?? "" });
                insertSQL.Parameters.Add(new SQLiteParameter("@Descs", DbType.String) { Value = item.AssociatedObject.Descs != null ? JsonConvert.SerializeObject(item.AssociatedObject.Descs) : "{}" });
                insertSQL.Parameters.Add(new SQLiteParameter("@TreePosition", DbType.Int32) { Value = treePosition });
                insertSQL.Parameters.Add(new SQLiteParameter("@Changed", DbType.Boolean) { Value = false });
                insertSQL.Parameters.Add(new SQLiteParameter("@Annotations", DbType.String) { Value = item.AssociatedObject.Annotations != null ? JsonConvert.SerializeObject(item.AssociatedObject.Annotations) : "{}" });
                if (item.AssociatedObject.Order.ContainsKey(lang))
                {
                    item.AssociatedObject.Order[lang] = treePosition;
                }
                insertSQL.Parameters.Add(new SQLiteParameter("@Order", DbType.String) { Value = item.AssociatedObject.Order != null ? JsonConvert.SerializeObject(item.AssociatedObject.Order) : "{}" });
                insertSQL.Parameters.Add(new SQLiteParameter("@MergeItemConflict", DbType.Boolean) { Value = conflictItem != null && conflictItem.Contains(item.AssociatedObject.ItemCode) });
                var idInsert = -1L;
                try
                {
                    insertSQL.ExecuteNonQuery();
                    idInsert = (int)conn.LastInsertRowId;
                    insertSQL.Reset();
                }
                catch (Exception ex)
                {
                    throw new Exception(ex.Message);
                }
                item.Descendants = item.Children.Sum(x => 1 + x.Descendants);
                item.Descendants += PopolateItemNode(item.Children, conn, insertSQL, transaction, ref treePosition, lang, conflictItem);
                var updateCountSQL = new SQLiteCommand("UPDATE CodeListItem SET SubTreeCount=@SubTreeCount, ChildrenCount=@ChildrenCount WHERE Id=@Id", conn);
                updateCountSQL.Transaction = transaction;
                updateCountSQL.Parameters.Add(new SQLiteParameter("@Id", DbType.Int32) { Value = idInsert });
                updateCountSQL.Parameters.Add(new SQLiteParameter("@SubTreeCount", DbType.Int32) { Value = item.Descendants });
                updateCountSQL.Parameters.Add(new SQLiteParameter("@ChildrenCount", DbType.Int32) { Value = item.Children.Count });
                updateCountSQL.ExecuteNonQuery();
            }
            return nodes.Sum(x => x.Descendants);
        }

        private List<Node> BuildTreeAndGetRoots(List<NoSQLCodeListItem> codeListItems, string lang)
        {
            var lookup = new Dictionary<string, Node>();
            codeListItems.ForEach(x => lookup.Add(x.ItemCode, new Node { AssociatedObject = x }));
            foreach (var item in lookup.Values)
            {
                Node proposedParent;
                if (lookup.TryGetValue(item.AssociatedObject.Parent, out proposedParent))
                {
                    item.Parent = proposedParent;
                    proposedParent.Children.Add(item);
                }
            }
            return lookup.Values.Where(x => x.Parent == null).ToList();
        }

        private ArtefactSearch GetCodelistPreviewFromSQLite(NoSqlSearchParameters searchInput, NoSQLCodeList codeList, NoSqlSaveInput noSqlSaveInput, bool forPreviewTable)
        {
            var previewTable = forPreviewTable ? "Preview" : "";

            Stopwatch stopwatch = null;
            stopwatch = Stopwatch.StartNew();

            var result = new ArtefactSearch();
            var count = 0L;

            if (searchInput.RebuildDb || !isDbInizializzate(searchInput.Token, searchInput.Id, searchInput.AgencyId, searchInput.Version, searchInput.Lang))
            {
                PopolateNoSql(searchInput.Id, searchInput.AgencyId, searchInput.Version, searchInput.Lang, searchInput.Token);
            }
            if (!isDbPreviewTableInizializzate(searchInput.Token, searchInput.Id, searchInput.AgencyId, searchInput.Version, searchInput.Lang))
            {
                InizializePreviewCodelist(searchInput.Id, searchInput.AgencyId, searchInput.Version, searchInput.Lang, searchInput.Token);
            }

            var newCodeList = new CodelistMutableCore();

            var connString = createConnectionString(searchInput.Token, searchInput.Id, searchInput.AgencyId, searchInput.Version);
            using (var conn = new SQLiteConnection(connString))
            {
                conn.Open();

                setCodelistDetail(codeList, conn, newCodeList, null);

                //START Order Column
                var listSortColumn = new List<string> { "id", "name", "parent", "order" };
                if (string.IsNullOrWhiteSpace(searchInput.SortColumn) || !listSortColumn.Contains(searchInput.SortColumn))
                {
                    searchInput.SortColumn = "clItem.TreePosition";
                }
                else
                {
                    switch (searchInput.SortColumn)
                    {
                        case "id":
                            searchInput.SortColumn = "clItem.ItemCode";
                            break;
                        case "name":
                            searchInput.SortColumn = "clItem.Name";
                            break;
                        case "parent":
                            searchInput.SortColumn = "clItem.Parent";
                            break;
                        case "order":
                            searchInput.SortColumn = "clItem.TreePosition";
                            break;
                    }
                }
                //END Order Column

                var selectable = forPreviewTable ? "" : ", ci.IsSelected AS IsInPreview ";
                var innerJoin = forPreviewTable ? "" : "INNER JOIN PreviewCodeListItem ci ON ci.ItemCode=clItem.ItemCode ";
                var sqlSearch = $"SELECT clItem.*{selectable} FROM {previewTable}CodeListItem clItem {innerJoin} WHERE 1=1";
                var sqlCount = $"SELECT COUNT(*) FROM {previewTable}CodeListItem clItem WHERE 1=1";

                SQLiteDataReader readerItems = null;
                if (searchInput.SearchType == SearchType.Get)
                {
                    var positionStart = 10000000L;
                    var positionEnd = -1L;
                    if (searchInput.SearchType == SearchType.ParentsAvailable)
                    {
                        var commandSql = new SQLiteCommand($"SELECT TreePosition, SubTreeCount FROM {previewTable}CodeListItem WHERE [ItemCode]=@ItemCode", conn);
                        commandSql.Parameters.Add(new SQLiteParameter("@ItemCode", DbType.String) { Value = searchInput.ItemForParent });
                        var readerPosition = commandSql.ExecuteReader();
                        while (readerPosition.Read())
                        {
                            positionStart = (long)readerPosition["TreePosition"];
                            positionEnd = positionStart + (long)readerPosition["SubTreeCount"];
                        }
                        readerPosition.Close();
                    }

                    var scdCommand = new SQLiteCommand(conn);
                    var scdCountCommand = new SQLiteCommand(conn);

                    if (forPreviewTable)
                    {
                        sqlSearch += " AND clItem.IsSelected=1";
                        sqlCount += " AND clItem.IsSelected=1";
                    }
                    if (!string.IsNullOrWhiteSpace(searchInput.AllSearch))
                    {
                        var strAdd = " AND (clItem.ItemCode LIKE @AllSearch OR clItem.Name LIKE @AllSearch OR clItem.Parent LIKE @AllSearch)";
                        sqlSearch += strAdd;
                        sqlCount += strAdd;
                        scdCommand.Parameters.AddWithValue("@AllSearch", "%" + searchInput.AllSearch + "%");
                        scdCountCommand.Parameters.AddWithValue("@AllSearch", "%" + searchInput.AllSearch + "%");
                    }
                    if (!string.IsNullOrWhiteSpace(searchInput.CodeSearch))
                    {
                        var strAdd = " AND clItem.ItemCode LIKE @ItemCode";
                        sqlSearch += strAdd;
                        sqlCount += strAdd;
                        scdCommand.Parameters.AddWithValue("@ItemCode", "%" + searchInput.CodeSearch + "%");
                        scdCountCommand.Parameters.AddWithValue("@ItemCode", "%" + searchInput.CodeSearch + "%");
                    }
                    if (!string.IsNullOrWhiteSpace(searchInput.NameSearch))
                    {
                        var strAdd = " AND clItem.Name LIKE @Name";
                        sqlSearch += strAdd;
                        sqlCount += strAdd;
                        scdCommand.Parameters.AddWithValue("@Name", "%" + searchInput.NameSearch + "%");
                        scdCountCommand.Parameters.AddWithValue("@Name", "%" + searchInput.NameSearch + "%");
                    }
                    if (!string.IsNullOrWhiteSpace(searchInput.ParentSearch))
                    {
                        var strAdd = " AND clItem.Parent LIKE @Parent";
                        sqlSearch += strAdd;
                        sqlCount += strAdd;
                        scdCommand.Parameters.AddWithValue("@Parent", "%" + searchInput.ParentSearch + "%");
                        scdCountCommand.Parameters.AddWithValue("@Parent", "%" + searchInput.ParentSearch + "%");
                    }
                    if (searchInput.SearchType == SearchType.ParentsAvailable)
                    {
                        var strAdd = " AND (clItem.TreePosition<@PositionStart OR clItem.TreePosition>@PositionEnd)";
                        sqlSearch += strAdd;
                        sqlCount += strAdd;
                        scdCountCommand.Parameters.AddWithValue("@PositionStart", positionStart);
                        scdCountCommand.Parameters.AddWithValue("@PositionEnd", positionEnd);
                        scdCommand.Parameters.AddWithValue("@PositionStart", positionStart);
                        scdCommand.Parameters.AddWithValue("@PositionEnd", positionEnd);
                    }
                    sqlSearch += $" ORDER BY {searchInput.SortColumn}" + (searchInput.SortDesc ? " DESC" : " ASC");
                    if (searchInput.PageNum > -1)
                    {
                        sqlSearch += $" LIMIT {searchInput.PageSize * (searchInput.PageNum - 1)},{searchInput.PageSize}";
                    }

                    scdCommand.CommandText = sqlSearch;
                    scdCountCommand.CommandText = sqlCount;

                    count = (long)scdCountCommand.ExecuteScalar();
                    result.Count = count;
                    readerItems = scdCommand.ExecuteReader();

                    result.Items = createPreviewItemCode(readerItems, searchInput.Lang, forPreviewTable);
                }
                else if (forPreviewTable && searchInput.SearchType == SearchType.Save)
                {
                    sqlSearch = $"SELECT * FROM {previewTable}CodeListItem WHERE IsSelected=1 ORDER BY TreePosition";
                    var scdCommand = new SQLiteCommand(sqlSearch, conn);
                    readerItems = scdCommand.ExecuteReader();

                    createItemCode(newCodeList, readerItems, searchInput, noSqlSaveInput, null);

                    readerItems.Close();
                }

            }
            _logger.Log($"GetSingleItemMongoDB SdmxObjectsImpl Created {stopwatch.ElapsedMilliseconds}ms", Infrastructure.STLogging.Interface.LogLevelEnum.Debug);
            stopwatch.Restart();

            if (forPreviewTable && searchInput.SearchType == SearchType.Save)
            {
                var sdmxObject = new SdmxObjectsImpl();
                sdmxObject.AddCodelist(newCodeList.ImmutableInstance);
                result.Results = sdmxObject;
            }

            return result;
        }

        /// <summary>
        /// Get codelist data from NOSQL DB
        /// </summary>
        /// <param name="searchParameters">Specific filter on Items</param>
        /// <param name="codeList">Used for overwrite popolate codelist data, null for skip</param>
        /// <returns></returns>
        private ArtefactSearch GetCodelistFromSQLite(NoSqlSearchParameters searchParameters, NoSQLCodeList codeList, NoSqlSaveInput noSqlSaveInput, ArtefactRegistry overwriteArtefact, string currentLangSave)
        {
            _logger.Log("Start GetCodelistFromSQLite", Infrastructure.STLogging.Interface.LogLevelEnum.Debug);
            Stopwatch stopwatch = null;
            stopwatch = Stopwatch.StartNew();

            var result = new ArtefactSearch();
            var count = 0L;

            if (searchParameters.RebuildDb || !isDbInizializzate(searchParameters.Token, searchParameters.Id, searchParameters.AgencyId, searchParameters.Version, searchParameters.Lang))
            {
                _logger.Log("PopolateNoSql GetCodelistFromSQLite", Infrastructure.STLogging.Interface.LogLevelEnum.Debug);
                PopolateNoSql(searchParameters.Id, searchParameters.AgencyId, searchParameters.Version, searchParameters.Lang, searchParameters.Token);
            }

            var newCodeList = new CodelistMutableCore();

            var connString = createConnectionString(searchParameters.Token, searchParameters.Id, searchParameters.AgencyId, searchParameters.Version);
            using (var conn = new SQLiteConnection(connString))
            {
                conn.Open();
                _logger.Log("PopolateNoSql Open Db", Infrastructure.STLogging.Interface.LogLevelEnum.Debug);
                if (noSqlSaveInput != null)
                {
                    var annotationSQL = new SQLiteCommand($"SELECT HaveOrder, ChangeOrder, IsOrder FROM CodeList", conn);
                    var saveReader = annotationSQL.ExecuteReader();
                    while (saveReader.Read())
                    {
                        noSqlSaveInput.IsOrder = Convert.ToBoolean(saveReader["IsOrder"]);
                        noSqlSaveInput.HaveAnyAnnotationOrder = Convert.ToBoolean(saveReader["HaveOrder"]);
                        noSqlSaveInput.ChangeAnnotationOrder = Convert.ToBoolean(saveReader["ChangeOrder"]);
                    }
                }

                setCodelistDetail(codeList, conn, newCodeList, overwriteArtefact);

                //START Order Column
                var listSortColumn = new List<string> { "id", "name", "parent", "order" };
                if (string.IsNullOrWhiteSpace(searchParameters.SortColumn) || !listSortColumn.Contains(searchParameters.SortColumn))
                {
                    _logger.Log("PopolateNoSql order TreePosition", Infrastructure.STLogging.Interface.LogLevelEnum.Debug);
                    searchParameters.SortColumn = "TreePosition";
                }
                else
                {
                    _logger.Log("PopolateNoSql order switch " + searchParameters.SortColumn, Infrastructure.STLogging.Interface.LogLevelEnum.Debug);
                    switch (searchParameters.SortColumn)
                    {
                        case "id":
                            searchParameters.SortColumn = "ItemCode";
                            break;
                        case "name":
                            searchParameters.SortColumn = "Name";
                            break;
                        case "parent":
                            searchParameters.SortColumn = "Parent";
                            break;
                        case "order":
                            searchParameters.SortColumn = "TreePosition";
                            break;
                    }
                }
                //END Order Column


                var sqlSearch = $"SELECT * FROM CodeListItem WHERE 1=1";
                var sqlCount = $"SELECT COUNT(*) FROM CodeListItem WHERE 1=1";

                SQLiteDataReader readerItems = null;
                if (searchParameters.SearchType == SearchType.Get || searchParameters.SearchType == SearchType.ParentsAvailable)
                {
                    _logger.Log("PopolateNoSql search type " + searchParameters.SearchType, Infrastructure.STLogging.Interface.LogLevelEnum.Debug);
                    var positionStart = 10000000L;
                    var positionEnd = -1L;
                    if (searchParameters.SearchType == SearchType.ParentsAvailable)
                    {
                        var commandSql = new SQLiteCommand($"SELECT TreePosition, SubTreeCount FROM CodeListItem WHERE [ItemCode]=@ItemCode", conn);
                        commandSql.Parameters.Add(new SQLiteParameter("@ItemCode", DbType.String) { Value = searchParameters.ItemForParent });
                        var readerPosition = commandSql.ExecuteReader();
                        while (readerPosition.Read())
                        {
                            positionStart = (long)readerPosition["TreePosition"];
                            positionEnd = positionStart + (long)readerPosition["SubTreeCount"];
                        }
                        readerPosition.Close();
                    }

                    var scdCommand = new SQLiteCommand(conn);
                    var scdCountCommand = new SQLiteCommand(conn);

                    if (!string.IsNullOrWhiteSpace(searchParameters.AllSearch))
                    {
                        var strAdd = " AND (ItemCode LIKE @AllSearch OR Name LIKE @AllSearch OR Parent LIKE @AllSearch)";
                        sqlSearch += strAdd;
                        sqlCount += strAdd;
                        scdCommand.Parameters.AddWithValue("@AllSearch", "%" + searchParameters.AllSearch + "%");
                        scdCountCommand.Parameters.AddWithValue("@AllSearch", "%" + searchParameters.AllSearch + "%");
                    }
                    if (!string.IsNullOrWhiteSpace(searchParameters.CodeSearch))
                    {
                        var strAdd = " AND ItemCode LIKE @ItemCode";
                        sqlSearch += strAdd;
                        sqlCount += strAdd;
                        scdCommand.Parameters.AddWithValue("@ItemCode", "%" + searchParameters.CodeSearch + "%");
                        scdCountCommand.Parameters.AddWithValue("@ItemCode", "%" + searchParameters.CodeSearch + "%");
                    }
                    if (!string.IsNullOrWhiteSpace(searchParameters.NameSearch))
                    {
                        var strAdd = " AND Name LIKE @Name";
                        sqlSearch += strAdd;
                        sqlCount += strAdd;
                        scdCommand.Parameters.AddWithValue("@Name", "%" + searchParameters.NameSearch + "%");
                        scdCountCommand.Parameters.AddWithValue("@Name", "%" + searchParameters.NameSearch + "%");
                    }
                    if (!string.IsNullOrWhiteSpace(searchParameters.ParentSearch))
                    {
                        var strAdd = " AND Parent LIKE @Parent";
                        sqlSearch += strAdd;
                        sqlCount += strAdd;
                        scdCommand.Parameters.AddWithValue("@Parent", "%" + searchParameters.ParentSearch + "%");
                        scdCountCommand.Parameters.AddWithValue("@Parent", "%" + searchParameters.ParentSearch + "%");
                    }
                    if (searchParameters.SearchType == SearchType.ParentsAvailable)
                    {
                        var strAdd = " AND (TreePosition<@PositionStart OR TreePosition>@PositionEnd)";
                        sqlSearch += strAdd;
                        sqlCount += strAdd;
                        scdCountCommand.Parameters.AddWithValue("@PositionStart", positionStart);
                        scdCountCommand.Parameters.AddWithValue("@PositionEnd", positionEnd);
                        scdCommand.Parameters.AddWithValue("@PositionStart", positionStart);
                        scdCommand.Parameters.AddWithValue("@PositionEnd", positionEnd);
                    }
                    sqlSearch += $" ORDER BY {searchParameters.SortColumn}" + (searchParameters.SortDesc ? " DESC" : " ASC");
                    if (searchParameters.PageNum > -1)
                    {
                        sqlSearch += $" LIMIT {searchParameters.PageSize * (searchParameters.PageNum - 1)},{searchParameters.PageSize}";
                    }

                    scdCommand.CommandText = sqlSearch;
                    scdCountCommand.CommandText = sqlCount;

                    count = (long)scdCountCommand.ExecuteScalar();
                    result.Count = count;
                    readerItems = scdCommand.ExecuteReader();
                }
                else if (searchParameters.SearchType == SearchType.Save)
                {
                    _logger.Log("PopolateNoSql search type " + searchParameters.SearchType, Infrastructure.STLogging.Interface.LogLevelEnum.Debug);

                    if (noSqlSaveInput.ChangeAnnotationOrder && noSqlSaveInput.PreviousIsFinal && !noSqlSaveInput.IsOrder)
                    { //In case of change order and codelist is just final without annotationorder, we must set annotation for all Items
                        sqlSearch = "SELECT ItemCode, Parent, Names, Descriptions, TreePosition, Annotations, [Order] FROM CodeListItem ORDER BY TreePosition";
                        var scdCommand = new SQLiteCommand(sqlSearch, conn);
                        readerItems = scdCommand.ExecuteReader();
                    }
                    else
                    {
                        sqlSearch = newCodeList.FinalStructure.IsTrue && noSqlSaveInput.PreviousIsFinal ? $@"WITH RECURSIVE paths(ItemCode, Parent, Names, Descriptions, TreePosition, Annotations, [Order]) AS (
    SELECT ItemCode, Parent, Names, Descriptions, TreePosition, Annotations, [Order] FROM CodeListItem
    UNION
    SELECT CodeListItem.ItemCode, CodeListItem.Parent, CodeListItem.Names, CodeListItem.Descriptions, CodeListItem.TreePosition, CodeListItem.Annotations, CodeListItem.[Order]
    FROM CodeListItem JOIN paths WHERE CodeListItem.ItemCode = paths.parent
)
SELECT ItemCode, Parent, Names, Descriptions, TreePosition, Annotations, [Order] FROM paths ORDER BY TreePosition" : $"SELECT * FROM CodeListItem ORDER BY TreePosition";
                        var scdCommand = new SQLiteCommand(sqlSearch, conn);
                        readerItems = scdCommand.ExecuteReader();
                    }
                }


                if (searchParameters.SearchType == SearchType.Get && searchParameters.Output_ConflictItem != null)
                {
                    searchParameters.Output_ConflictItem.RemoveAll(item => true);
                }
                createItemCode(newCodeList, readerItems, searchParameters, noSqlSaveInput, currentLangSave);
                readerItems.Close();

                if (searchParameters.SearchType == SearchType.Get && searchParameters.Output_ConflictItem != null)
                {
                    var scdCommandConflict = new SQLiteCommand(conn);
                    scdCommandConflict.CommandText = "SELECT COUNT(*) FROM CodeListItem WHERE MergeItemConflict=1";
                    searchParameters.Output_HaveConflictItem = (long)scdCommandConflict.ExecuteScalar() > 0;
                }

            }
            _logger.Log($"GetSingleItemMongoDB SdmxObjectsImpl Created {stopwatch.ElapsedMilliseconds}ms", Infrastructure.STLogging.Interface.LogLevelEnum.Debug);
            stopwatch.Restart();
            _logger.Log("PopolateNoSql pre ImmutableInstance", Infrastructure.STLogging.Interface.LogLevelEnum.Debug);
            var sdmxObject = new SdmxObjectsImpl();
            sdmxObject.AddCodelist(newCodeList.ImmutableInstance);
            result.Results = sdmxObject;

            return result;
        }

        private void createItemCode(CodelistMutableCore newCodeList, SQLiteDataReader reader, NoSqlSearchParameters searchParameters, NoSqlSaveInput noSqlSaveInput, string currentLangSave)
        {
            _logger.Log("createItemCode start", Infrastructure.STLogging.Interface.LogLevelEnum.Debug);
            var allParent = new Dictionary<string, bool>();

            while (reader.Read())
            {
                ICodeMutableObject codeResult = new CodeMutableCore()
                {
                    Id = (string)reader["ItemCode"],
                    ParentCode = string.IsNullOrWhiteSpace((string)reader["Parent"]) ? null : (string)reader["Parent"]
                };
                _logger.Log($"createItemCode codeResult {codeResult.Id}", Infrastructure.STLogging.Interface.LogLevelEnum.Debug);
                if (!string.IsNullOrWhiteSpace(codeResult.ParentCode))
                {
                    if (!allParent.ContainsKey(codeResult.ParentCode))
                    {
                        allParent.Add(codeResult.ParentCode, false);
                    }
                }
                if (allParent.ContainsKey(codeResult.Id))
                {
                    allParent[codeResult.Id] = true;
                }

                _logger.Log($"createItemCode Names", Infrastructure.STLogging.Interface.LogLevelEnum.Debug);
                foreach (var iName in JsonConvert.DeserializeObject<Dictionary<string, string>>((string)reader["Names"]))
                {
                    codeResult.AddName(iName.Key, iName.Value);
                }
                _logger.Log($"createItemCode Descriptions", Infrastructure.STLogging.Interface.LogLevelEnum.Debug);
                foreach (var iDesc in JsonConvert.DeserializeObject<Dictionary<string, string>>((string)reader["Descriptions"]))
                {
                    codeResult.AddDescription(iDesc.Key, iDesc.Value);
                }

                if (searchParameters.SearchType != SearchType.Save || (searchParameters.SearchType == SearchType.Save && newCodeList.FinalStructure.IsTrue && noSqlSaveInput != null && noSqlSaveInput.PreviousIsFinal && (noSqlSaveInput.ChangeAnnotationOrder || noSqlSaveInput.HaveAnyAnnotationOrder)))
                { //Create annotation WHEN:
                    //Get
                    //ParentsAvailable
                    //Save when Previus is Final and (Order Was Changed or HaveAnnotation)
                    _logger.Log($"createItemCode searchType" + searchParameters.SearchType, Infrastructure.STLogging.Interface.LogLevelEnum.Debug);
                    IAnnotationMutableObject annotationOrder = new AnnotationMutableCore()
                    {
                        Type = _nodeConfig.Annotations.CodelistsOrder,
                        Id = _nodeConfig.Annotations.CodelistsOrder,
                        Title = _nodeConfig.Annotations.CodelistsOrder
                    };
                    _logger.Log($"createItemCode Order", Infrastructure.STLogging.Interface.LogLevelEnum.Debug);
                    foreach (var iAnn in JsonConvert.DeserializeObject<Dictionary<string, int>>((string)reader["Order"]))
                    {
                        if (iAnn.Key.Equals(searchParameters.Lang, StringComparison.InvariantCultureIgnoreCase) ||
                            iAnn.Key.Equals(currentLangSave))
                        {
                            continue;
                        }
                        var textType = new TextTypeWrapperMutableCore { Locale = iAnn.Key, Value = iAnn.Value.ToString() };
                        annotationOrder.AddText(textType);
                    }
                    _logger.Log($"createItemCode TreePosition", Infrastructure.STLogging.Interface.LogLevelEnum.Debug);
                    if (!string.IsNullOrWhiteSpace(searchParameters.Lang) && annotationOrder.Text.FirstOrDefault(i => i.Locale.Equals(searchParameters.Lang)) == null)
                    {
                        var textTypeOrder = new TextTypeWrapperMutableCore { Locale = searchParameters.Lang, Value = reader["TreePosition"].ToString() };
                        annotationOrder.AddText(textTypeOrder);
                    }
                    else if (!string.IsNullOrWhiteSpace(currentLangSave) && annotationOrder.Text.FirstOrDefault(i => i.Locale.Equals(currentLangSave)) == null)
                    {
                        var textTypeOrder = new TextTypeWrapperMutableCore { Locale = currentLangSave, Value = reader["TreePosition"].ToString() };
                        annotationOrder.AddText(textTypeOrder);
                    }
                    if (annotationOrder.Text.Count > 0)
                    {
                        codeResult.AddAnnotation(annotationOrder);
                    }
                }

                _logger.Log($"createItemCode Annotations", Infrastructure.STLogging.Interface.LogLevelEnum.Debug);
                foreach (var iAnn in JsonConvert.DeserializeObject<List<NoSQLCodeListItemAnnotationProperty>>((string)reader["Annotations"]))
                {
                    if (iAnn.Type != null && iAnn.Type.Equals(_nodeConfig.Annotations.CodelistsOrder, StringComparison.InvariantCultureIgnoreCase))
                    {
                        continue;
                    }
                    IAnnotationMutableObject annotation = new AnnotationMutableCore()
                    {
                        Type = iAnn.Type,
                        Title = iAnn.Title,
                        Id = iAnn.Id
                    };
                    foreach (var iTxt in iAnn.Texts)
                    {
                        var textType = new TextTypeWrapperMutableCore { Locale = iTxt.Key, Value = iTxt.Value };
                        annotation.AddText(textType);
                    }
                    codeResult.AddAnnotation(annotation);
                }

                if (searchParameters.SearchType == SearchType.Get && searchParameters.Output_ConflictItem != null)
                {
                    if ((Int16)reader["MergeItemConflict"] == 1)
                    {
                        searchParameters.Output_ConflictItem.Add(codeResult.Id);
                    }
                }

                newCodeList.AddItem(codeResult);
            }
            _logger.Log("createItemCode end while", Infrastructure.STLogging.Interface.LogLevelEnum.Debug);
            if (searchParameters.SearchType == SearchType.Get || searchParameters.SearchType == SearchType.ParentsAvailable)
            { //Get could not have all items, add missing parent
                foreach (var parent in allParent)
                {
                    if (parent.Value)
                    {
                        continue;
                    }
                    if (newCodeList.Items.Any(x => x.Id.Equals(parent.Key)))
                    {
                        continue;
                    }

                    ICodeMutableObject codeResult = new CodeMutableCore()
                    {
                        Id = parent.Key,
                        ParentCode = ""
                    };
                    codeResult.AddName("it", "INVISIBLE");
                    IAnnotationMutableObject annotation = new AnnotationMutableCore()
                    {
                        Type = "INVISIBLE",
                        Title = "INVISIBLE",
                        Id = "INVISIBLE"
                    };
                    codeResult.AddAnnotation(annotation);
                    newCodeList.AddItem(codeResult);
                }
            }
            _logger.Log("createItemCode end", Infrastructure.STLogging.Interface.LogLevelEnum.Debug);
        }

        private List<ArtefactSearch.Item> createPreviewItemCode(SQLiteDataReader reader, string lang, bool forPreviewTable)
        {
            var items = new List<ArtefactSearch.Item>();

            while (reader.Read())
            {
                var item = new ArtefactSearch.Item
                {
                    Code = (string)reader["ItemCode"],
                    Parent = (string)reader["Parent"],
                    IsSelected = (Int16)reader["WorkingIsSelected"] == 1,
                    IsSelectable = forPreviewTable ? true : (Int16)reader["IsInPreview"] != 1
                };

                var tmpName = "";
                foreach (var iName in JsonConvert.DeserializeObject<Dictionary<string, string>>((string)reader["Names"]))
                {
                    if (iName.Key.Equals(lang, StringComparison.InvariantCultureIgnoreCase))
                    {
                        item.Name = iName.Value;
                        break;
                    }
                    else if (iName.Key.Equals("en", StringComparison.InvariantCultureIgnoreCase))
                    {
                        tmpName = iName.Value;
                    }
                    else if (string.IsNullOrWhiteSpace(tmpName))
                    {
                        tmpName = iName.Value;
                    }
                }
                if (string.IsNullOrWhiteSpace(item.Name))
                {
                    item.Name = tmpName;
                }

                items.Add(item);
            }

            return items;
        }

        private void setCodelistDetail(NoSQLCodeList codeList, SQLiteConnection conn, CodelistMutableCore newCodeList, ArtefactRegistry overwriteArtefactId)
        {
            _logger.Log("setCodelistDetail start", Infrastructure.STLogging.Interface.LogLevelEnum.Debug);
            if (codeList != null)
            {
                newCodeList.Id = codeList.Id;
                newCodeList.AgencyId = codeList.AgencyID;
                newCodeList.Version = codeList.Version;
                if (codeList.Names != null)
                {
                    foreach (var iName in codeList.Names)
                    {
                        newCodeList.AddName(iName.Key ?? "en", iName.Value ?? "");
                    }
                }
                if (codeList.Descriptions != null)
                {
                    foreach (var iDesc in codeList.Descriptions)
                    {
                        newCodeList.AddDescription(iDesc.Key ?? "en", iDesc.Value ?? "");
                    }
                }
                if (codeList.ValidFrom != DateTime.MinValue)
                {
                    newCodeList.StartDate = codeList.ValidFrom;
                }
                if (codeList.ValidTo != DateTime.MinValue)
                {
                    newCodeList.EndDate = codeList.ValidTo;
                }

                newCodeList.Uri = string.IsNullOrWhiteSpace(codeList.Uri) ? null : new Uri(codeList.Uri);
                newCodeList.FinalStructure = TertiaryBool.ParseBoolean(codeList.IsFinal);
                if (newCodeList.Annotations != null)
                {
                    foreach (var item in codeList.Annotations)
                    {
                        IAnnotationMutableObject annotation = new AnnotationMutableCore()
                        {
                            Type = item.Type,
                            Title = item.Title,
                            Id = item.Id
                        };
                        foreach (var iTxt in item.Texts)
                        {
                            var textType = new TextTypeWrapperMutableCore { Locale = iTxt.Key, Value = iTxt.Value };
                            annotation.AddText(textType);
                        }
                        newCodeList.AddAnnotation(annotation);
                    }
                }
            }
            else
            {
                var sqlData = "SELECT * FROM CodeList";
                var scdCommand = new SQLiteCommand(sqlData, conn);
                var reader = scdCommand.ExecuteReader();

                while (reader.Read())
                {
                    newCodeList.Id = (string)reader["CodeListId"];
                    newCodeList.AgencyId = (string)reader["CodeListAgencyId"];
                    newCodeList.Version = (string)reader["CodeListVersion"];
                    try
                    {
                        var tmpDate = Convert.ToDateTime(reader["EndDate"]);
                        if (tmpDate != null && tmpDate.Year > 0001)
                        {
                            newCodeList.EndDate = tmpDate;
                        }
                    }
                    catch (Exception)
                    {

                    }
                    try
                    {
                        var tmpDate = Convert.ToDateTime(reader["StartDate"]);
                        if (tmpDate != null && tmpDate.Year > 1900)
                        {
                            newCodeList.StartDate = tmpDate;
                        }
                    }
                    catch (Exception)
                    {

                    }
                    newCodeList.Uri = string.IsNullOrWhiteSpace((string)reader["Uri"]) ? null : new Uri((string)reader["Uri"]);
                    newCodeList.FinalStructure = TertiaryBool.ParseBoolean(Convert.ToBoolean(reader["IsFinal"]));
                    if (overwriteArtefactId == null)
                    {
                        foreach (var item in JsonConvert.DeserializeObject<Dictionary<string, string>>((string)reader["Names"]))
                        {
                            newCodeList.AddName(item.Key, item.Value);
                        }
                    }
                    foreach (var item in JsonConvert.DeserializeObject<Dictionary<string, string>>((string)reader["Descriptions"]))
                    {
                        newCodeList.AddDescription(item.Key, item.Value);
                    }
                    foreach (var item in JsonConvert.DeserializeObject<List<NoSQLCodeListItemAnnotationProperty>>((string)reader["Annotations"]))
                    {
                        IAnnotationMutableObject annotation = new AnnotationMutableCore()
                        {
                            Type = item.Type,
                            Title = item.Title,
                            Id = item.Id
                        };
                        foreach (var iTxt in item.Texts)
                        {
                            var textType = new TextTypeWrapperMutableCore { Locale = iTxt.Key, Value = iTxt.Value };
                            annotation.AddText(textType);
                        }
                        newCodeList.AddAnnotation(annotation);
                    }
                }
                reader.Close();
            }

            if (overwriteArtefactId != null)
            {
                newCodeList.Id = overwriteArtefactId.ID;
                newCodeList.AgencyId = overwriteArtefactId.Agency;
                newCodeList.Version = overwriteArtefactId.Version;
                foreach (var item in overwriteArtefactId.Names)
                {
                    newCodeList.AddName(item.Key, item.Value);
                }
            }

            _logger.Log("setCodelistDetail end", Infrastructure.STLogging.Interface.LogLevelEnum.Debug);
        }

        private bool isDbInizializzate(string token, string id, string agencyId, string version, string lang)
        {
            var result = File.Exists($"NoSql\\{token}\\datafile{id}{agencyId}{version}.sqlite");
            if (result)
            {
                var connString = createConnectionString(token, id, agencyId, version);
                using (var conn = new SQLiteConnection(connString))
                {
                    conn.Open();

                    var sqlCom = "SELECT CurrentLang FROM CodeList";
                    var scdCommand = new SQLiteCommand(sqlCom, conn);
                    var currentLang = scdCommand.ExecuteScalar();
                    result = currentLang != null && (string.IsNullOrWhiteSpace(lang) || ((string)currentLang).Equals(lang, StringComparison.InvariantCultureIgnoreCase));
                }
            }

            return result;
        }

        private bool isDbPreviewTableInizializzate(string token, string id, string agencyId, string version, string lang)
        {
            var result = File.Exists($"NoSql\\{token}\\datafile{id}{agencyId}{version}.sqlite");
            if (result)
            {
                var connString = createConnectionString(token, id, agencyId, version);
                using (var conn = new SQLiteConnection(connString))
                {
                    conn.Open();

                    var sqlCom = "SELECT 1 FROM sqlite_master WHERE type='table' AND name='PreviewCodeList'";
                    var scdCommand = new SQLiteCommand(sqlCom, conn);
                    var currentId = scdCommand.ExecuteScalar();
                    result = currentId != null && currentId != DBNull.Value && (long)currentId > 0;
                }
            }

            return result;
        }

        private string createConnectionString(string token, string id, string agencyId, string version)
        {
            return $"Data Source = NoSql\\{token}\\datafile{id}{agencyId}{version}.sqlite;";
        }

        public void InizializePreviewCodelist(string id, string agencyId, string version, string lang, string token)
        {
            if (!Directory.Exists($"NoSql\\{token}"))
            {
                Directory.CreateDirectory($"NoSql\\{token}");
            }

            string connString = createConnectionString(token, id, agencyId, version);

            if (!isDbInizializzate(token, id, agencyId, version, lang))
            {
                PopolateNoSql(id, agencyId, version, lang, token);
            }

            using (var conn = new SQLiteConnection(connString))
            {
                conn.Open();

                inizialiteTableNoSql(conn, true);

                var sqlCom = "INSERT INTO PreviewCodeList SELECT * FROM CodeList";
                var scdCommand = new SQLiteCommand(sqlCom, conn);
                scdCommand.ExecuteNonQuery();

                sqlCom = "INSERT INTO PreviewCodeListItem SELECT *, 0 AS IsSelected, Parent AS Original FROM CodeListItem";
                scdCommand = new SQLiteCommand(sqlCom, conn);
                scdCommand.ExecuteNonQuery();
            }
        }

        public void SetWorkingSelectedItem(bool isPreviewTable, List<string> itemCode, bool isSelected, string id, string agencyId, string version, string lang, string token)
        {
            var previewTable = isPreviewTable ? "Preview" : "";

            if (!isPreviewTable && !isDbInizializzate(token, id, agencyId, version, ""))
            {
                PopolateNoSql(id, agencyId, version, lang, token);
            }
            else if (isPreviewTable && !isDbPreviewTableInizializzate(token, id, agencyId, version, lang))
            {
                InizializePreviewCodelist(id, agencyId, version, lang, token);
            }

            string connString = createConnectionString(token, id, agencyId, version);

            using (var conn = new SQLiteConnection(connString))
            {
                conn.Open();


                var scdCommand = new SQLiteCommand(conn);
                scdCommand.CommandText = "DELETE FROM SelectItem";
                scdCommand.ExecuteNonQuery();

                //Insert Item

                using (var tran = conn.BeginTransaction())
                {
                    var insertSQL = new SQLiteCommand("INSERT INTO SelectItem ([ItemCode]) VALUES (@ItemCode)", conn);
                    insertSQL.Transaction = tran;
                    insertSQL.Prepare();

                    foreach (var item in itemCode)
                    {
                        insertSQL.Parameters.AddWithValue("@ItemCode", item);
                        insertSQL.ExecuteNonQuery();
                        insertSQL.Reset();
                    }

                    scdCommand = new SQLiteCommand(conn);
                    scdCommand.CommandText = $"UPDATE {previewTable}CodeListItem SET WorkingIsSelected=@WorkingIsSelected WHERE ItemCode IN (SELECT ItemCode FROM SelectItem)";
                    scdCommand.Parameters.AddWithValue("@WorkingIsSelected", isSelected);
                    scdCommand.ExecuteNonQuery();

                    tran.Commit();
                }
            }
        }

        public bool CreateNewCodelistFromPreview(string id, string agencyId, string version, string lang, string token, NoSQLCodeList newCodeList)
        {
            if (!isDbPreviewTableInizializzate(token, id, agencyId, version, ""))
            {
                InizializePreviewCodelist(id, agencyId, version, "", token);
            }

            var noSqlSearchInput = new NoSqlSearchParameters
            {
                Id = id,
                AgencyId = agencyId,
                Version = version,
                Lang = lang,
                Token = token,
                PageNum = -1,
                PageSize = -1,
                SortDesc = false,
                SearchType = SearchType.Save
            };
            var noSqlSaveInput = new NoSqlSaveInput { PreviousIsFinal = false };
            ISdmxObjects sdmxObjectSQLite = GetCodelistPreviewFromSQLite(noSqlSearchInput, newCodeList, noSqlSaveInput, true).Results;

            var result = Sdmx21Connector.CreateArtefacts(sdmxObjectSQLite);

            if (result)
            {
                string connString = createConnectionString(token, id, agencyId, version);
                using (var conn = new SQLiteConnection(connString))
                {
                    conn.Open();
                    var scdCommand = new SQLiteCommand("DROP TABLE PreviewCodeListItem", conn);
                    scdCommand = new SQLiteCommand("DROP TABLE PreviewCodeList", conn);
                    scdCommand = new SQLiteCommand("UPDATE CodeListItem SET WorkingIsSelected=0", conn);
                }
            }

            return result;
        }

        public void StoreWorkingIsSelected(bool isPreviewTable, string id, string agencyId, string version, string lang, string token, bool selectParent, bool selectChildren, bool selectDescending, bool flatTree)
        {
            if (!isPreviewTable && !isDbInizializzate(token, id, agencyId, version, lang))
            {
                return;
            }
            else if (isPreviewTable && !isDbPreviewTableInizializzate(token, id, agencyId, version, lang))
            {
                return;
            }

            string connString = createConnectionString(token, id, agencyId, version);

            using (var conn = new SQLiteConnection(connString))
            {
                conn.Open();

                if (isPreviewTable) //Remove Item from PreviewTable
                {
                    var transaction = conn.BeginTransaction();
                    //Before to add item in Preview, we need to set WorkingIsSelected=1 for related Item in base of storeItems
                    if (false && !flatTree && selectDescending)
                    {
                        var scdCommandDescending = new SQLiteCommand(conn);
                        scdCommandDescending.Transaction = transaction;
                        scdCommandDescending.CommandText = $@"UPDATE PreviewCodeListItem
                                                        SET WorkingIsSelected=1
                                                        WHERE ItemCode IN (
                                                            WITH RECURSIVE paths(ItemCode, Parent) AS (
		                                                            SELECT ItemCode, Parent FROM PreviewCodeListItem WHERE WorkingIsSelected=1
		                                                            UNION
		                                                            SELECT cli.ItemCode, cli.Parent
			                                                        FROM PreviewCodeListItem cli JOIN paths WHERE cli.Parent = paths.ItemCode
	                                                            )
	                                                            SELECT ItemCode FROM paths)";
                        scdCommandDescending.ExecuteNonQuery();
                    }
                    else if (false && !flatTree && selectChildren)
                    {
                        var scdCommandChildren = new SQLiteCommand(conn);
                        scdCommandChildren.Transaction = transaction;
                        scdCommandChildren.CommandText = $@"UPDATE PreviewCodeListItem
                                                        SET WorkingIsSelected=1
                                                        WHERE ItemCode IN (
                                                            SELECT cliChild.ItemCode 
                                                            FROM PreviewCodeListItem cliPar
                                                            INNER JOIN PreviewCodeListItem cliChild
                                                            ON cliChild.Parent=cliPar.ItemCode
                                                            WHERE cliPar.WorkingIsSelected=1)";
                        scdCommandChildren.ExecuteNonQuery();
                    }
                    if (false && !flatTree && selectParent)
                    {
                        var scdCommandParent = new SQLiteCommand(conn);
                        scdCommandParent.Transaction = transaction;
                        scdCommandParent.CommandText = $@"UPDATE PreviewCodeListItem
                                                        SET WorkingIsSelected=1
                                                        WHERE ItemCode IN (
                                                            WITH RECURSIVE paths(ItemCode, Parent) AS (
		                                                            SELECT ItemCode, Parent FROM PreviewCodeListItem WHERE WorkingIsSelected=1
		                                                            UNION
		                                                            SELECT cli.ItemCode, cli.Parent
			                                                        FROM PreviewCodeListItem cli JOIN paths WHERE cli.ItemCode = paths.parent
	                                                            )
	                                                            SELECT ItemCode FROM paths)";
                        scdCommandParent.ExecuteNonQuery();
                    }

                    var scdCommand = new SQLiteCommand("SELECT ItemCode, SubTreeCount FROM PreviewCodeListItem WHERE WorkingIsSelected=1 AND SubTreeCount>0", conn);
                    scdCommand.Transaction = transaction;
                    var reader = scdCommand.ExecuteReader();
                    var checkItemCode = new Dictionary<string, long>();
                    while (reader.Read())
                    {
                        checkItemCode.Add((string)reader["ItemCode"], (long)reader["SubTreeCount"]);
                    }
                    foreach (var item in checkItemCode)
                    {
                        if (item.Value == 0)
                        { //Item without children don't need to check
                            continue;
                        }
                        scdCommand = new SQLiteCommand(@"WITH RECURSIVE paths(ItemCode, Parent) AS (
		                                                    SELECT ItemCode, Parent FROM PreviewCodeListItem WHERE ItemCode IN (@ItemCode)
		                                                    UNION
		                                                    SELECT cli.ItemCode, cli.Parent
		                                                    FROM PreviewCodeListItem cli JOIN paths WHERE cli.Parent = paths.ItemCode AND cli.IsSelected=1
	                                                    )
	                                                    SELECT COUNT(*)-1 AS ResultCount FROM paths", conn);
                        scdCommand.Parameters.AddWithValue("@ItemCode", item.Key);
                        scdCommand.Transaction = transaction;
                        var childrenSelected = (long)scdCommand.ExecuteScalar();


                        scdCommand = new SQLiteCommand(@"WITH RECURSIVE paths(ItemCode, Parent) AS (
		                                                    SELECT ItemCode, Parent FROM PreviewCodeListItem WHERE ItemCode IN (@ItemCode)
		                                                    UNION
		                                                    SELECT cli.ItemCode, cli.Parent
		                                                    FROM PreviewCodeListItem cli JOIN paths WHERE cli.Parent = paths.ItemCode AND cli.WorkingIsSelected=1
	                                                    )
	                                                    SELECT COUNT(*)-1 AS ResultCount FROM paths", conn);
                        scdCommand.Parameters.AddWithValue("@ItemCode", item.Key);
                        scdCommand.Transaction = transaction;
                        var childrenRemove = (long)scdCommand.ExecuteScalar();

                        if (childrenSelected > childrenRemove)
                        {
                            transaction.Rollback();
                            throw Utility.Utils.getCustomException("DERIVED_CODELIST_REMOVE_ITEM",
                   @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - " + item.Key + " have children ", Infrastructure.STLogging.Interface.LogLevelEnum.Warn);
                        }
                    }
                    transaction.Commit();

                    //When an item was removed from preview, Parent rsestore to original Parent beacause in case of FlatTree we have removed
                    scdCommand = new SQLiteCommand($"UPDATE PreviewCodeListItem SET IsSelected=0, Parent=OriginalParent WHERE WorkingIsSelected=1", conn);
                    scdCommand.ExecuteNonQuery();
                    scdCommand = new SQLiteCommand("UPDATE PreviewCodeListItem SET WorkingIsSelected=0", conn);
                    scdCommand.ExecuteNonQuery();
                }
                else //Add Item in PreviewTable
                {
                    //Before to add item in Preview, we need to set WorkingIsSelected=1 for related Item in base of storeItems
                    if (!flatTree && selectDescending)
                    {
                        var scdCommandDescending = new SQLiteCommand(conn);
                        scdCommandDescending.CommandText = $@"UPDATE CodeListItem
                                                        SET WorkingIsSelected=1
                                                        WHERE ItemCode IN (
                                                            WITH RECURSIVE paths(ItemCode, Parent) AS (
		                                                            SELECT ItemCode, Parent FROM CodeListItem WHERE WorkingIsSelected=1
		                                                            UNION
		                                                            SELECT cli.ItemCode, cli.Parent
			                                                        FROM CodeListItem cli JOIN paths WHERE cli.Parent = paths.ItemCode
	                                                            )
	                                                            SELECT ItemCode FROM paths)";
                        scdCommandDescending.ExecuteNonQuery();
                    }
                    else if (!flatTree && selectChildren)
                    {
                        var scdCommandChildren = new SQLiteCommand(conn);
                        scdCommandChildren.CommandText = $@"UPDATE CodeListItem
                                                        SET WorkingIsSelected=1
                                                        WHERE ItemCode IN (
                                                            SELECT cliChild.ItemCode 
                                                            FROM CodeListItem cliPar
                                                            INNER JOIN CodeListItem cliChild
                                                            ON cliChild.Parent=cliPar.ItemCode
                                                            WHERE cliPar.WorkingIsSelected=1)";
                        scdCommandChildren.ExecuteNonQuery();
                    }
                    if (!flatTree && selectParent)
                    {
                        var scdCommandParent = new SQLiteCommand(conn);
                        scdCommandParent.CommandText = $@"UPDATE CodeListItem
                                                        SET WorkingIsSelected=1
                                                        WHERE ItemCode IN (
                                                            WITH RECURSIVE paths(ItemCode, Parent) AS (
		                                                            SELECT ItemCode, Parent FROM CodeListItem WHERE WorkingIsSelected=1
		                                                            UNION
		                                                            SELECT cli.ItemCode, cli.Parent
			                                                        FROM CodeListItem cli JOIN paths WHERE cli.ItemCode = paths.parent
	                                                            )
	                                                            SELECT ItemCode FROM paths)";
                        scdCommandParent.ExecuteNonQuery();
                    }


                    var flatTreeUpd = ", Parent=OriginalParent";
                    if (flatTree)
                    {
                        flatTreeUpd = ", Parent=''";
                    }
                    var scdCommand = new SQLiteCommand(conn);
                    scdCommand.CommandText = $@"UPDATE PreviewCodeListItem
                                                SET IsSelected=1{flatTreeUpd}
                                                WHERE ItemCode IN (
	                                                SELECT ItemCode
	                                                FROM CodeListItem
	                                                WHERE WorkingIsSelected=1
                                                )";
                    scdCommand.ExecuteNonQuery();

                    if (!flatTree && !selectParent)
                    {
                        var scdCommandParent = new SQLiteCommand(conn);
                        scdCommandParent.CommandText = $@"UPDATE PreviewCodeListItem
                                                            SET Parent=''
                                                            WHERE ItemCode IN (
	                                                            SELECT selectedItems.ItemCode
	                                                            FROM CodeListItem selectedItems
	                                                            LEFT JOIN CodeListItem allItems
	                                                            ON selectedItems.Parent=allItems.ItemCode AND allItems.WorkingIsSelected=1
	                                                            WHERE selectedItems.WorkingIsSelected=1 AND allItems.Id IS NULL
                                                            )
                                                            ";
                        scdCommandParent.ExecuteNonQuery();
                    }

                    scdCommand = new SQLiteCommand(conn);
                    scdCommand.CommandText = @"UPDATE CodeListItem
                                               SET WorkingIsSelected=0";
                    scdCommand.ExecuteNonQuery();
                }
            }
        }

        public void SetAllWorkingSelectedItem(bool isPreviewTable, bool isSelected, string id, string agencyId, string version, string lang, string token, ArtefactSearch artefactSearch)
        {
            var previewTable = isPreviewTable ? "Preview" : "";

            if (!isPreviewTable && !isDbInizializzate(token, id, agencyId, version, ""))
            {
                PopolateNoSql(id, agencyId, version, lang, token);
            }
            else if (isPreviewTable && !isDbPreviewTableInizializzate(token, id, agencyId, version, lang))
            {
                InizializePreviewCodelist(id, agencyId, version, lang, token);
            }

            string connString = createConnectionString(token, id, agencyId, version);

            using (var conn = new SQLiteConnection(connString))
            {
                conn.Open();

                if (artefactSearch == null)
                {
                    var scdCommand = new SQLiteCommand(conn);
                    scdCommand.CommandText = $"UPDATE {previewTable}CodeListItem SET WorkingIsSelected=@WorkingIsSelected";
                    scdCommand.Parameters.AddWithValue("@WorkingIsSelected", isSelected);
                    scdCommand.ExecuteNonQuery();
                }
                else if (artefactSearch.Count > 0)
                {
                    var scdCommand = new SQLiteCommand(conn);
                    scdCommand.CommandText = "DELETE FROM SelectItem";
                    scdCommand.ExecuteNonQuery();

                    //Insert Item

                    using (var tran = conn.BeginTransaction())
                    {
                        var insertSQL = new SQLiteCommand("INSERT INTO SelectItem ([ItemCode]) VALUES (@ItemCode)", conn);
                        insertSQL.Transaction = tran;
                        insertSQL.Prepare();

                        foreach (var item in artefactSearch.Items)
                        {
                            insertSQL.Parameters.AddWithValue("@ItemCode", item.Code);
                            insertSQL.ExecuteNonQuery();
                            insertSQL.Reset();
                        }

                        scdCommand = new SQLiteCommand(conn);
                        scdCommand.Transaction = tran;
                        scdCommand.CommandText = $"UPDATE {previewTable}CodeListItem SET WorkingIsSelected=@WorkingIsSelected WHERE ItemCode IN (SELECT ItemCode FROM SelectItem)";
                        scdCommand.Parameters.AddWithValue("@WorkingIsSelected", isSelected);
                        scdCommand.ExecuteNonQuery();

                        tran.Commit();
                    }
                }
            }
        }

        public void PreviewEmpty(string id, string agencyId, string version, string token)
        {
            if (!isDbInizializzate(token, id, agencyId, version, ""))
            {
                return;
            }

            string connString = createConnectionString(token, id, agencyId, version);

            using (var conn = new SQLiteConnection(connString))
            {
                conn.Open();

                var scdCommand = new SQLiteCommand("UPDATE CodeListItem SET WorkingIsSelected=0", conn);
                scdCommand.ExecuteNonQuery();
                if (isDbPreviewTableInizializzate(token, id, agencyId, version, ""))
                {
                    var scdTmpCommand = new SQLiteCommand("UPDATE PreviewCodeListItem SET WorkingIsSelected=0, IsSelected=0, Parent=OriginalParent", conn);
                    scdTmpCommand.ExecuteNonQuery();
                }
            }
        }

        public bool PreviewIsValid(string id, string agencyId, string version, string lang, string token)
        {
            if (!isDbPreviewTableInizializzate(token, id, agencyId, version, lang))
            {
                return true;
            }
            string connString = createConnectionString(token, id, agencyId, version);

            using (var conn = new SQLiteConnection(connString))
            {
                conn.Open();

                var scdCommand = new SQLiteCommand(@"UPDATE PreviewCodeListItem
                                                    SET CheckColumn=0", conn);
                scdCommand.ExecuteNonQuery();

                scdCommand = new SQLiteCommand(@"UPDATE PreviewCodeListItem
                                                    SET CheckColumn=1
                                                    WHERE ItemCode IN (
	                                                    WITH RECURSIVE paths(ItemCode, Parent) AS (
		                                                    SELECT ItemCode, Parent FROM PreviewCodeListItem WHERE IsSelected=1
		                                                    UNION
		                                                    SELECT cli.ItemCode, cli.Parent
		                                                    FROM PreviewCodeListItem cli JOIN paths WHERE cli.ItemCode = paths.Parent
	                                                    )
	                                                    SELECT ItemCode FROM paths													
                                                    )", conn);
                scdCommand.ExecuteNonQuery();

                scdCommand = new SQLiteCommand(@"SELECT COUNT(*)
                                                FROM PreviewCodeListItem
                                                WHERE IsSelected=0 AND CheckColumn=1", conn);
                return (long)scdCommand.ExecuteScalar() <= 0;
            }
        }

        #endregion

    }


    public enum ConnectorInizialize
    {
        Sdmx21Connector = 0,
        DmApiConnector = 1,
        MaApiConnector = 2
    };
}
