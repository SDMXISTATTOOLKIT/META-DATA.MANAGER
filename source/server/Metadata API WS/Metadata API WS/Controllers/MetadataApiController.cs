using System;
using Configuration;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using RMDataProvider.Model;
using RMManager.RMDataProvider;
using System.Net.Http;
using Newtonsoft.Json.Linq;
using Infrastructure.STLogging.Factory;
using Infrastructure.STLogging.Interface;
using System.Text;
using Metadata_API_WS.connector;
using RMUtil;
using Microsoft.Extensions.Options;
using DataModel;

namespace Metadata_API_WS.Controllers
{
    /// <summary>
    /// Controller for the Metadata Api
    /// </summary>
    [ApiController]
    [EnableCors("CustomPolicy")]
    public class MetadataApiController : ControllerBase
    {
        NodeApiConnector _nodeApiConnector = null;
        RMCacheManager _rmCacheManager = null;
        RMDataProvider.Model.SdmxJsonUtil sdmxJsonUtil = new RMDataProvider.Model.SdmxJsonUtil();
        readonly IOptionsSnapshot<CacheConfig> _cacheConfig;

        /// <summary>
        /// Constructor
        /// </summary>
        public MetadataApiController(IOptionsSnapshot<CacheConfig> cacheConfig)
        {
            _cacheConfig = cacheConfig;
            try
            {
                string CacheDir = _cacheConfig.Value.Dir;
                bool CacheEnable = _cacheConfig.Value.Enable;
                this._rmCacheManager = new RMCacheManager(CacheDir, CacheEnable);
            }
            catch(Exception e)
            {
                STLoggerFactory.Logger.Log("Error to read config data", e, LogLevelEnum.Warn);
            }

            _nodeApiConnector = new NodeApiConnector(ConfigurationManager.AppSettings);
        }

        /// <summary>
        /// Pings the endpoint
        /// </summary>
        /// <returns></returns>
        [HttpGet("Ping")]
        public ActionResult<bool> PingEndPoint()
        {
            try {
                IRMDataProvider rmProvider = new RMManager.RMDataProvider.RMDataProvider();
                rmProvider.CountMetadataSet();
                return true;
            }
            catch (Exception ex)
            {
                STLoggerFactory.Logger.Log("EndPoint Error", ex, LogLevelEnum.Error);
                return false;
            }
        }

        /// <summary>
        /// Delete referenced metadata from cache.
        /// </summary>
        /// <param name="metadataSetId">metadataSetId.</param>
        /// <param name="reportId">reportId.</param>
        /// <returns>True</returns>
        [HttpDelete("cleanRMMetadataInCache")]
        public ActionResult<string> cleanRMMetadataInCache(string metadataSetId, string reportId)
        {
            try
            {
                this._rmCacheManager.deleteRMMetadata(metadataSetId, reportId);
            }
            catch (Exception e)
            {
                STLoggerFactory.Logger.Log("Error to delete data from cache", e, LogLevelEnum.Warn);
                STLoggerFactory.Logger.Log(e.Message, LogLevelEnum.Warn, e.StackTrace);
            }
            return new ActionResult<string>("true");
        }

        /// <summary>
        /// Delete artefacts from cache.
        /// </summary>
        /// <param name="id">Artefact id.</param>
        /// <param name="agencyID">Artefact agency.</param>
        /// <param name="version">Artefact version.</param>
        /// <returns>True</returns>
        [HttpDelete("cleanArtefactInCache/{id?}/{agencyID?}/{version?}")]
        public ActionResult<string> cleanArtefactInCache(string id, string agencyID, string version)
        {
            try
            {
                this._rmCacheManager.deleteConceptScheme(id, agencyID, version);
            }
            catch (Exception e)
            {
                STLoggerFactory.Logger.Log("Error to delete data from cache", e, LogLevelEnum.Warn);
                STLoggerFactory.Logger.Log(e.Message, LogLevelEnum.Warn, e.StackTrace);
            }

            try
            {
                this._rmCacheManager.deleteMSD(id, agencyID, version);
            }
            catch (Exception e)
            {
                STLoggerFactory.Logger.Log("Error to delete data from cache", e, LogLevelEnum.Warn);
                STLoggerFactory.Logger.Log(e.Message, LogLevelEnum.Warn, e.StackTrace);
            }
            return new ActionResult<string>("true");
        }

        /// <summary>
        /// Gets a Msd (if all params are null returns all)
        /// </summary>
        /// <param name="id">Artefact id.</param>
        /// <param name="agencyID">Artefact agency.</param>
        /// <param name="version">Artefact version.</param>
        /// <param name="nodeId">Node Id.</param>
        /// <returns>Msd</returns>
        [HttpGet("msd/{id?}/{agencyID?}/{version?}")]
        public ActionResult<string> GetMetadataStructure(string id, string agencyID, string version, string nodeId = null)
        {
            try
            {
                string msgCache = this._rmCacheManager.readMSD(id, agencyID, version);
                if (msgCache != null)
                {
                    return new ActionResult<string>(msgCache);
                }
            }
            catch (Exception e)
            {
                STLoggerFactory.Logger.Log("Error to read data from cache", e, LogLevelEnum.Warn);
                STLoggerFactory.Logger.Log(e.Message, LogLevelEnum.Warn, e.StackTrace);
            }

            string nodeIdToUse = retrieveNodeId(nodeId);

            string result = _nodeApiConnector.GetMetadataStructure(id, agencyID, version, nodeIdToUse);

            try
            {
                this._rmCacheManager.storeMSD(result, id, agencyID, version);
            }
            catch (Exception e)
            {
                STLoggerFactory.Logger.Log("Error to save data in cache", e, LogLevelEnum.Warn);
                STLoggerFactory.Logger.Log(e.Message, LogLevelEnum.Warn, e.StackTrace);
            }

            return new ActionResult<string>(result);
        }

        /// <summary>
        /// Gets a Concept Scheme (if all params are null returns all)
        /// </summary>
        /// <param name="id">Artefact id.</param>
        /// <param name="agencyID">Artefact agency.</param>
        /// <param name="version">Artefact version.</param>
        /// <param name="nodeId">Node Id.</param>
        /// <returns>ConceptScheme</returns>
        [HttpGet("conceptScheme/{id?}/{agencyID?}/{version?}")]
        public ActionResult<string> GetConceptScheme(string id, string agencyID, string version, string nodeId = null)
        {
            try
            {
                string msgCache = this._rmCacheManager.readConceptScheme(id, agencyID, version);
                if (msgCache != null)
                {
                    return new ActionResult<string>(msgCache);
                }
            }
            catch (Exception e)
            {
                STLoggerFactory.Logger.Log("Error to read data from cache", e, LogLevelEnum.Warn);
                STLoggerFactory.Logger.Log(e.Message, LogLevelEnum.Warn, e.StackTrace);
            }

            string nodeIdToUse = retrieveNodeId(nodeId);

            string result = _nodeApiConnector.GetConceptScheme(id, agencyID, version, nodeIdToUse);

            try
            {
                this._rmCacheManager.storeConceptScheme(result, id, agencyID, version);
            }
            catch (Exception e)
            {
                STLoggerFactory.Logger.Log("Error to save data in cache", e, LogLevelEnum.Warn);
                STLoggerFactory.Logger.Log(e.Message, LogLevelEnum.Warn, e.StackTrace);
            }

            return new ActionResult<string>(result);
        }

        /// <summary>
        /// Download a metadata file from the dmapi file-system.
        /// </summary>
        /// <param name="filename">The file to be download.</param>
        /// <param name="nodeId">Node Id.</param>
        /// <returns>Download the file in case of success, otherwise an exception is thrown.</returns>
        [HttpGet("ReferenceMetadataFileOnServer")]
        public HttpResponseMessage ReferenceMetadataFileOnServer(string filename, string nodeId = null)
        {
            string nodeIdToUse = retrieveNodeId(nodeId);
            HttpResponseMessage response = _nodeApiConnector.ReferenceMetadataFileOnServer(filename, nodeIdToUse);
            return response;
        }

        /// <summary>
        /// Gets Node Api configurations
        /// </summary>
        /// <param name="nodeId">Node Id.</param>
        /// <returns>Node Api configurations</returns>
        [HttpGet("nodeApiConfig")]
        public ActionResult<string> GetNodeApiConfig(string nodeId = null)
        {
            string nodeIdToUse = retrieveNodeId(nodeId);
            string result = _nodeApiConnector.GetNodeApiConfig(nodeIdToUse);
            return new ActionResult<string>(result);
        }

        /// <summary>
        /// Searches a specific MetadataSet by Id.
        /// </summary>
        /// <param name="idMetadataSet">MetadataSet id</param>
        /// <param name="excludeReport">True for not retrieve report data</param>
        /// <param name="withAttributes">False for not retrieve attribute data</param>
        /// <param name="nodeId">Node Id.</param>
        /// <returns>MetadataSet found like sdmx-json message</returns>
        [HttpGet("getJsonMetadataset/{idMetadataSet}")]
        [Produces("text/plain")]
        public ActionResult<string> GetJsonMetadataSet(string idMetadataSet, bool? excludeReport, bool? withAttributes, string nodeId = null)
        {
            string nodeIdToUse = retrieveNodeId(nodeId);
            string result = _nodeApiConnector.GetJsonMetadataSet(idMetadataSet, excludeReport, withAttributes, nodeIdToUse);
            return new ActionResult<string>(result);
        }

        /// <summary>
        /// Searches for the package
        /// </summary>
        /// <param name="lang">Language[it,en]</param>
        /// <param name="metadataSetId">DCAT_AP-IT MetadataSet Id</param>
        /// <param name="q">Theme filter</param>
        /// <param name="sort">Sort criteria</param>
        /// <param name="start">Start row</param>
        /// <param name="rows">Total rows</param>
        /// <returns></returns>
        [HttpGet("{lang}/{metadataSetId}/api/3/action/package_search")]
        public ActionResult<string> PackageSearch(string lang, string metadataSetId, string q, string sort, int start, int rows)
        {
            try
            {
                string msgCache = this._rmCacheManager.readPackageSearch(lang, metadataSetId, q, sort, start, rows);
                if (msgCache != null)
                {
                    return new ActionResult<string>(msgCache);
                }
            }
            catch (Exception e)
            {
                STLoggerFactory.Logger.Log("Error to read data from cache", e, LogLevelEnum.Warn);
                STLoggerFactory.Logger.Log(e.Message, LogLevelEnum.Warn, e.StackTrace);
            }

            string theme = null;
            if (q != null)
            {
                theme = q.Trim();
                if(!theme.StartsWith("groups:\"") || !theme.EndsWith("\""))
                {
                    throw new Exception("Value theme parameter non valid: format expected: groups:\"<theme>\"");
                }
                theme = theme.Substring(8, theme.Length-9);
                if(theme.IndexOf("Regioni e citt") != -1)
                {
                    theme = "Regioni e citt";
                }
            }
            string templatePath = "resources/rmDataFlowResponseSearchCKANV3.json";
            string template = System.IO.File.ReadAllText(@templatePath);

            IRMDataProvider rmProvider = new RMManager.RMDataProvider.RMDataProvider();
            string sdmxJsonMsg = rmProvider.searchReportCKAN(theme, sort, start, rows, lang, template, getRequestUri(), metadataSetId, null);

            try
            {
                this._rmCacheManager.storePackageSearch(sdmxJsonMsg, lang, metadataSetId, q, sort, start, rows);
            }
            catch (Exception e)
            {
                STLoggerFactory.Logger.Log("Error to save data in cache", e, LogLevelEnum.Warn);
                STLoggerFactory.Logger.Log(e.Message, LogLevelEnum.Warn, e.StackTrace);
            }

            return sdmxJsonMsg;
        }

        /// <summary>
        /// Shows the package
        /// </summary>
        /// <param name="lang">Language [it,en]</param>
        /// <param name="metadataSetId">DCAT_AP-IT MetadataSet Id</param>
        /// <param name="id">Dataset Id</param>
        /// <returns></returns>
        [HttpGet("{lang}/{metadataSetId}/api/3/action/package_show")]
        public ActionResult<string> PackageShow(string lang, string metadataSetId, string id)
        {
            try
            {
                string msgCache = this._rmCacheManager.readPackageShow(lang, metadataSetId, id);
                if (msgCache != null)
                {
                    return new ActionResult<string>(msgCache);
                }
            }
            catch (Exception e)
            {
                STLoggerFactory.Logger.Log("Error to read data from cache", e, LogLevelEnum.Warn);
                STLoggerFactory.Logger.Log(e.Message, LogLevelEnum.Warn, e.StackTrace);
            }

            string templatePath = "resources/rmDataFlowResponseCKANV3.json";
            string template = System.IO.File.ReadAllText(@templatePath);

            IRMDataProvider rmProvider = new RMManager.RMDataProvider.RMDataProvider();

            string sdmxJsonMsg = rmProvider.getReportCKAN(id, lang, template, getRequestUri(), metadataSetId);
            try
            {
                this._rmCacheManager.storePackageShow(sdmxJsonMsg, lang, metadataSetId, id);
            }
            catch (Exception e)
            {
                STLoggerFactory.Logger.Log("Error to save data in cache", e, LogLevelEnum.Warn);
                STLoggerFactory.Logger.Log(e.Message, LogLevelEnum.Warn, e.StackTrace);
            }

            return sdmxJsonMsg;
        }

        /// <summary>
        /// Gets Group list like standard CKAN.
        /// </summary>
        /// <param name="lang">Language [it,en]</param>
        /// <param name="metadataSetId">DCAT_AP-IT MetadataSet Id</param>
        /// <returns></returns>
        [HttpGet("{lang}/{metadataSetId}/api/3/action/group_list")]
        public ActionResult<string> GroupList(string lang, string metadataSetId)
        {
            //if (DcatApItMetadataFlow == null || DcatApItMetadataFlow.Trim().Length == 0)
            //{
            //    throw new Exception("Urn metadataflow DCAT-AP_IT not configured!");
            //}
            IRMDataProvider rmProvider = new RMManager.RMDataProvider.RMDataProvider();
            return rmProvider.GetGroupListCKAN(lang, getRequestUri(), metadataSetId);
        }

        /// <summary>
        /// Gets metadata
        /// </summary>
        /// <param name="metadataSetId"></param>
        /// <param name="reportId"></param>
        /// <param name="exported"></param>
        /// <param name="nodeId"></param>
        /// <param name="noAttrPublicationAnnotation"></param>
        /// <returns></returns>
        [HttpGet("api/getMetadata")]
        public ActionResult<string> GetMetadata(string metadataSetId, string reportId, bool exported = true, string nodeId = null, string noAttrPublicationAnnotation = null)
        {
            if (metadataSetId == null && reportId != null)
            {
                throw new Exception("Parameter metadataSetId is required if reportId is used!");
            }

            string nodeIdToUse = retrieveNodeId(nodeId); 

            string restrictedForPublicationAnnotationToUse = null;
            if(noAttrPublicationAnnotation != null && noAttrPublicationAnnotation.Trim().Length > 0)
            {
                restrictedForPublicationAnnotationToUse = noAttrPublicationAnnotation.Trim();
            }else
            {
                string nodeConfigPath = ConfigurationManager.AppSettings["NodeConfig"];
                string RestrictedForPublicationAnnotation = retrieveRestrictedForPublicationAnnotation(nodeConfigPath, nodeIdToUse);

                restrictedForPublicationAnnotationToUse = RestrictedForPublicationAnnotation.Trim();
            }

            try { 
                string msgCache = this._rmCacheManager.readRMMetadata(metadataSetId, reportId);
                if (msgCache != null)
                {
                    return new ActionResult<string>(msgCache);
                }
            }
            catch (Exception e)
            {
                STLoggerFactory.Logger.Log("Error to read data from cache", e, LogLevelEnum.Warn);
                STLoggerFactory.Logger.Log(e.Message, LogLevelEnum.Warn, e.StackTrace);
            }

            IRMDataProvider rmProvider = new RMManager.RMDataProvider.RMDataProvider();
            List<MetadataSetType> metadatasets = null;

            if (reportId!=null && reportId.Length>0)
            {
                ReportType report = rmProvider.GetReport(metadataSetId, reportId, false, restrictedForPublicationAnnotationToUse);
                if (report == null || (exported && !report.getAnnotationValue(ReportType.ANNOTATION_KEY_REPORT_STATE_NAME).Equals(ReportType.REPORT_STATE_PUBLISHED_VALUE))) 
                {
                    throw new Exception("Report not found");
                }
                string mdsId = report.getAnnotationValue(ReportType.ANNOTATION_KEY_METADATASET_ID);
                MetadataSetType msd = rmProvider.GetMetadataset(mdsId, true, false, true);
                if (msd!=null && !msd.setID.Equals(metadataSetId))
                {
                    throw new Exception("Report "+reportId+ " is not associated with MetadataSet " + metadataSetId);
                }
                msd.Report = new List<ReportType>();
                msd.Report.Add(report);
                metadatasets = new List<MetadataSetType>(1);
                metadatasets.Add(msd);
            }
            else
            {
                if (metadataSetId!=null && metadataSetId.Length>0)
                {
                    metadatasets = new List<MetadataSetType>(1);
                    MetadataSetType msd = rmProvider.GetMetadataset(metadataSetId, true, false);
                    if (msd == null)
                    {
                        throw new Exception("MetadataSet not found");
                    }
                    int metadataSetKeyId = Convert.ToInt32(msd.getAnnotationValue(MetadataSetType.ANNOTATION_KEY_METADATASET_ID));
                    int reportState = 0;
                    if (exported)
                    {
                        reportState = ReportType.REPORT_STATE_PUBLISHED_ID;
                    }
                    msd.Report = (List<ReportType>)rmProvider.SearchReportByParams(metadataSetKeyId, null, null, true, reportState, restrictedForPublicationAnnotationToUse);
                    metadatasets.Add(msd);
                }
                else
                {
                    metadatasets = rmProvider.GetMetadataSetList(false, ReportType.REPORT_STATE_PUBLISHED_ID);
                }
            }

            foreach (MetadataSetType m in metadatasets)
            {
                rmProvider.cleanAnnotations(m);
            }

            string sdmxJsonMsg = sdmxJsonUtil.buildSdmxJsonMessage(metadatasets);
            try { 
                this._rmCacheManager.storeRMMetadata(sdmxJsonMsg, metadataSetId, reportId);
            }
            catch (Exception e)
            {
                STLoggerFactory.Logger.Log("Error to save data in cache", e, LogLevelEnum.Warn);
                STLoggerFactory.Logger.Log(e.Message, LogLevelEnum.Warn, e.StackTrace);
            }
            return new ActionResult<string>(sdmxJsonMsg);
        }

        private string retrieveNodeId(string clientNodeId)
        {
            string nodeIdToUse = null;
            if (clientNodeId != null && clientNodeId.Trim().Length > 0)
            {
                nodeIdToUse = clientNodeId.Trim();
            }
            else
            {
                STLoggerFactory.Logger.Log("Parameter nodeId not specified!", LogLevelEnum.Info);
                string nodeIdConf = ConfigurationManager.AppSettings["NodeId"];
                if (nodeIdConf == null || nodeIdConf.Trim().Length == 0)
                {
                    STLoggerFactory.Logger.Log("NodeId not configured", LogLevelEnum.Warn);
                    throw new Exception("Request nodeId parameter not found!");
                }
                else
                {
                    nodeIdToUse = nodeIdConf.Trim();
                }
            }
            return nodeIdToUse;
        }

        private string retrieveRestrictedForPublicationAnnotation(string nodeConfigPath, string nodeId)
        {
            if (!System.IO.File.Exists(nodeConfigPath))
            {
                STLoggerFactory.Logger.Log("NodeConfig file not found", LogLevelEnum.Warn);
            }
            else
            {
                string nodeConfigContent = System.IO.File.ReadAllText(nodeConfigPath);
                JObject s = JObject.Parse(@"{config:" + nodeConfigContent + "}");
                JToken o = s.SelectToken("config");
                foreach (JToken t in o.Children())
                {
                    JToken to = t.SelectToken("General.ID");
                    string key = to.ToString();
                    if (key.Equals(nodeId))
                    {
                        JToken RestrictedForPublicationT = t.SelectToken("Annotations.RestrictedForPublication");
                        return RestrictedForPublicationT.ToString();
                    }
                }
            }
            return null;
        }

        private string getRequestUri()
        {
            return this.Request.Scheme + "://" + this.Request.Host + this.Request.Path + this.Request.QueryString;
        }

    }
}
