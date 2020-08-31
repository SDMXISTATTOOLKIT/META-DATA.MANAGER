/*
using BusinessLogic;
using DataModel;
using Infrastructure.STLogging.Factory;
using Infrastructure.STLogging.Interface;
using Infrastructure.Utils;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using Org.Sdmx.Resources.SdmxMl.Schemas.V21.Common;
using Org.Sdmx.Resources.SdmxMl.Schemas.V21.Message;
using Org.Sdmx.Resources.SdmxMl.Schemas.V21.Structure;
using Org.Sdmxsource.Sdmx.Api.Constants;
using Org.Sdmxsource.Sdmx.Api.Engine;
using Org.Sdmxsource.Sdmx.Api.Factory;
using Org.Sdmxsource.Sdmx.Api.Manager.Parse;
using Org.Sdmxsource.Sdmx.Api.Model.Format;
using Org.Sdmxsource.Sdmx.Api.Model.Metadata;
using Org.Sdmxsource.Sdmx.Api.Model.Objects;
using Org.Sdmxsource.Sdmx.Api.Model.Objects.Base;
using Org.Sdmxsource.Sdmx.Api.Model.Objects.CategoryScheme;
using Org.Sdmxsource.Sdmx.Api.Model.Objects.MetadataStructure;
using Org.Sdmxsource.Sdmx.DataParser.Engine;
using Org.Sdmxsource.Sdmx.DataParser.Factory;
using Org.Sdmxsource.Sdmx.DataParser.Manager;
using Org.Sdmxsource.Sdmx.SdmxObjects.Model;
using Org.Sdmxsource.Sdmx.SdmxObjects.Model.Metadata;
using Org.Sdmxsource.Sdmx.SdmxObjects.Model.Objects.CategoryScheme;
using Org.Sdmxsource.Sdmx.Util.Objects.Container;
using Org.Sdmxsource.Util.Io;
using RMDataProvider.Model;
using RMUtil;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using Xml.Schema.Linq;
using AnnotationType = RMDataProvider.Model.AnnotationType;
using TargetType = RMDataProvider.Model.TargetType;

namespace API
{
    /// <summary>
    /// RM API
    /// </summary>
    [Route("api/[controller]")]
    [Produces("application/xml")]
    [EnableCors("CustomPolicy")]
    public class RMController : Controller
    {
        BusinessLogic.Controller.BusinessLogic _businessLogic;
        readonly NodeConfig _nodeConfiguration;
        readonly ISTLogger _logger;
        SdmxJsonUtil sdmxJsonUtil;
        readonly IOptionsSnapshot<CacheConfig> _cacheConfig;

        /// <summary>
        /// Constructor
        /// </summary>
        public RMController(IMemoryCache memoryCache, IHttpContextAccessor contextAccessor, IConfiguration configuration, IOptionsSnapshot<CacheConfig> cacheConfig)
        {
            _nodeConfiguration = new ConfigManager(configuration, memoryCache, contextAccessor).GetConfiguration();
            _businessLogic = new BusinessLogic.Controller.BusinessLogic(_nodeConfiguration, configuration, memoryCache, contextAccessor);
            _logger = STLoggerFactory.Logger;
            sdmxJsonUtil = new SdmxJsonUtil();
            _cacheConfig = cacheConfig;
        }

        #region READ

        /// <summary>
        /// Get all MetadataSet stored.
        /// </summary>
        /// <returns>MetadataSet list</returns>
        [HttpGet("getJsonMetadatasetListOLD")]
        [Produces("text/plain")]
        public ActionResult<string> GetJsonMetadatasetList()
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);
            List<MetadataSetType> metadataSetsWithFlow = generateMetadataSetList();
            _logger.Log("Prepare sdmx-json message", LogLevelEnum.Debug);
            string sdmxJsonMsg = sdmxJsonUtil.buildSdmxJsonMessage(metadataSetsWithFlow);
            _logger.Log("Sdmx-json message created", LogLevelEnum.Debug);
            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);
            return sdmxJsonMsg;
        }

        [HttpGet("getJsonMetadatasetList")]
        [Produces("application/json")]
        public ActionResult<string> GetJsonMetadatasetListNew()
        {
            //TODO START REMOVE usato per fare test di serializzazione di dati completi
            MetadataSetType m = _businessLogic.GetMetadataSet("MDS_MDF_ESMS_MSD", false, true);
            setMetadataflowData(m);
            List<MetadataSetType> metadataSets = new List<MetadataSetType>();
            metadataSets.Add(m);

            _logger.Log("Create sdmx-json message for one metadataset", LogLevelEnum.Debug);
            var converted2 = convertMetadataSet(metadataSets);
            convertSdmxObjectToSisterObject(converted2.First(), metadataSets.FirstOrDefault());
            //TODO END REMOVE usato per fare test di serializzazione di dati completi

            List<MetadataSetType> metadataSetsWithFlow = generateMetadataSetList();
            var converted = convertMetadataSet(metadataSetsWithFlow);
            var items = converted?.SelectMany(i => i.MetadataSet.ToArray())?.ToArray();

            return serializeSdmxFormat(items);
        }

        private bool setMetadataflowData(MetadataSetType mdst, ISdmxObjects metadataflowDataList = null)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);
            string flowId = mdst.getAnnotationValue(MetadataSetType.ANNOTATION_KEY_METADATASET_FLOW_ID);
            string flowAgency = mdst.getAnnotationValue(MetadataSetType.ANNOTATION_KEY_METADATASET_FLOW_AGENCY_ID);
            string flowVersion = mdst.getAnnotationValue(MetadataSetType.ANNOTATION_KEY_METADATASET_FLOW_VERSION_ID);
            try
            {
                ISdmxObjects sdmxS = null;
                string metadataflow = null;
                if (metadataflowDataList == null)
                {
                    _logger.Log("Retrieve metadataflow (" + flowId + "," + flowAgency + "," + flowVersion + ")", LogLevelEnum.Debug);
                    string res = _businessLogic.GetMetadataflow(flowId, flowAgency, flowVersion, StructureReferenceDetailEnumType.All);
                    _logger.Log("Metadataflow received", LogLevelEnum.Debug);
                    _logger.Log("Start convert string metadataflow to sdmx object", LogLevelEnum.Debug);
                    sdmxS = _businessLogic.GetSdmxObjectsFromSdmxJson(res);
                    _logger.Log("Sdmx object of metadataflow created", LogLevelEnum.Debug);
                    metadataflow = sdmxS.Metadataflows.ElementAt(0).Urn.ToString();
                    mdst.structureRef = sdmxS.Metadataflows.ElementAt(0).MetadataStructureRef.TargetUrn.ToString();
                }
                else
                {
                    sdmxS = metadataflowDataList;
                    foreach (IMetadataFlow metFlow in sdmxS.Metadataflows)
                    {
                        if (metFlow.Id.Equals(flowId) && metFlow.AgencyId.Equals(flowAgency) && metFlow.Version.Equals(flowVersion))
                        {
                            mdst.structureRef = metFlow.MetadataStructureRef.TargetUrn.ToString();
                            metadataflow = metFlow.Urn.ToString();
                            break;
                        }
                    }
                }

                if (sdmxS != null && metadataflow != null && metadataflow.Trim().Length > 0)
                {
                    foreach (ICategorisationObject categorisation in sdmxS.Categorisations)
                    {
                        if (categorisation.StructureReference.TargetUrn.ToString().Equals(metadataflow))
                        {
                            string target = categorisation.CategoryReference.TargetUrn.ToString();
                            string source = metadataflow;
                            string id = categorisation.Id;
                            string agencyID = categorisation.AgencyId;
                            string version = categorisation.Version;
                            string catAnnVal = id + "+" + agencyID + "+" + version + "+" + source + "+" + target;
                            mdst.addAnnotationValue("categorisation_[" + id + "]", catAnnVal, RMUtil.RMUtility.EN_LANGUAGE);
                        }
                    }
                }
            }
            catch (Exception e)
            {
                _logger.Log("Error to retrieve metadataflow data for MetadataSet " + flowId + "-" + flowAgency + "-" + flowVersion, e, LogLevelEnum.Warn);
                return false;
            }
            finally
            {
                LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);
            }
            return true;
        }

        private List<MetadataSetType> extractMetadataSetFromSdmxJsonMessage(string sdmxJsonMessage)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);
            List<MetadataSetType> mdstList = new List<MetadataSetType>();
            JObject o = JObject.Parse(sdmxJsonMessage);
            JToken mdtToken = o.SelectToken("data.metadataSets");
            if (mdtToken != null)
            {
                foreach (JToken mdts in mdtToken)
                {
                    string m = mdts.ToString();

                    MetadataSetType newMdts = new MetadataSetType();
                    newMdts.FromSdmxJson(m);
                    mdstList.Add(newMdts);
                }
            }
            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);
            return mdstList;
        }

        /// <summary>
        /// Searches a specific MetadataSet by Id.
        /// </summary>
        /// <param name="idMetadataSet">MetadataSet id</param>
        /// <param name="excludeReport">True for not retrieve report data</param>
        /// <param name="withAttributes">False for not retrieve attribute data</param>
        /// <returns>MetadataSet found like sdmx-json message</returns>
        [HttpGet("getJsonMetadataset/{idMetadataSet}")]
        [Produces("text/plain")]
        public ActionResult<string> GetJsonMetadataSet(string idMetadataSet, bool? excludeReport, bool? withAttributes)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);
            MetadataSetType m = _businessLogic.GetMetadataSet(idMetadataSet, excludeReport, withAttributes);
            setMetadataflowData(m);
            List<MetadataSetType> metadataSets = new List<MetadataSetType>();
            metadataSets.Add(m);

            _logger.Log("Create sdmx-json message for one metadataset", LogLevelEnum.Debug);
            var converted = convertMetadataSet(metadataSets);
            var items = converted?.SelectMany(i => i.MetadataSet.ToArray())?.ToArray();
            _logger.Log("Message sdmx-json created", LogLevelEnum.Debug);
            return new ActionResult<string>(serializeSdmxFormat(items));
        }

        /// <summary>
        /// Searches a specific Report by id and MetadataSet id.
        /// </summary>
        /// <param name="idMetadataSet">MetadataSet id</param>
        /// <param name="idReport">Report id</param>
        /// <returns>MetadataSet with report found like sdmx-json message</returns>
        [HttpGet("getJsonReport/{idMetadataSet}/{idReport}")]
        [Produces("text/plain")]
        public ActionResult<string> GetJsonReport(string idMetadataSet, string idReport)
        {
            try
            {
                MetadataSetType m = _businessLogic.GetMetadataSet(idMetadataSet, false, false);

                List<ReportType> rList = new List<ReportType>();
                if (m.Report != null)
                {
                    foreach (ReportType r in m.Report)
                    {
                        if (r.id != null && r.id.Equals(idReport))
                        {
                            int reportKey = Convert.ToInt32(r.getAnnotationValue(ReportType.ANNOTATION_KEY_REPORT_ID));
                            ReportType report = _businessLogic.GetReport(reportKey);
                            rList.Add(report);
                        }
                    }
                }
                m.Report = rList;

                setMetadataflowData(m);
                List<MetadataSetType> metadataSets = new List<MetadataSetType>();
                metadataSets.Add(m);


                var converted = convertMetadataSet(metadataSets);
                var items = converted?.SelectMany(i => i.MetadataSet.ToArray())?.ToArray();
                _logger.Log("Message sdmx-json created", LogLevelEnum.Debug);

                return new ActionResult<string>(serializeSdmxFormat(items));
            }
            catch (Exception)
            {
                throw Utility.Utils.getCustomException("GET_REPORT_ERROR",
                @"Method " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - idMetadataSet='" + idMetadataSet + "', idReport='" + idReport + "' not found.", Infrastructure.STLogging.Interface.LogLevelEnum.Error);
            }
        }

        #endregion

        #region CREATE_UPDATE


        /// <summary>
        /// Update report state.
        /// </summary>
        /// <param name="metadatasetIdentifier">MetadataSet id</param>
        /// <param name="reportId">Report id</param>
        /// <param name="newState">Report state [NOT_PUBLISHABLE, NOT_PUBLISHED, PUBLISHED, DRAFT]</param>
        /// <returns>True if report updated, false otherwise</returns>
        [HttpPost("updateStateMetReport/{metadatasetIdentifier}/{reportId}")]
        public JsonResult UpdateStateMetReport([FromForm] string newState, string metadatasetIdentifier, string reportId)
        {
            if (metadatasetIdentifier == null || metadatasetIdentifier.Length == 0)
            {
                throw Utility.Utils.getCustomException("GET_REPORT_ERROR",
                @"Method " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - Metadataset id = '" + metadatasetIdentifier + "' not found.", Infrastructure.STLogging.Interface.LogLevelEnum.Error);
            }

            if (reportId == null || reportId.Length == 0)
            {
                throw Utility.Utils.getCustomException("GET_REPORT_ERROR",
                             @"Method " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - ReportId not specified.", Infrastructure.STLogging.Interface.LogLevelEnum.Error);
            }

            return new JsonResult(_businessLogic.UpdateReportState(metadatasetIdentifier, reportId, newState));
        }

        /// <summary>
        /// Insert or update a Report.
        /// </summary>
        /// <param name="jsonMetadataSet">MetadataSet like sdmx-json message</param>
        /// <param name="metadatasetIdentifier">MetadataSet identifier</param>
        /// <returns>MetadataSet like sdmx-json message with new or updated report</returns>
        [HttpPost("upsertJsonReport/{metadatasetIdentifier}")]
        [Produces("text/plain")]
        public ActionResult<string> UpsertJsonReport([FromBody] object jsonMetadataSet, string metadatasetIdentifier)
        {
            try
            {
                var sdmxMetadataSet = deserializeSdmxFormat(jsonMetadataSet.ToString());

                MetadataSetType metadataSet = convertSdmxObjectToSisterObject(sdmxMetadataSet);

                MetadataSetType mDataset = _businessLogic.GetSimpleMetadataSet(metadatasetIdentifier);
                int metadataSetId = Convert.ToInt32(mDataset.getAnnotationValue(MetadataSetType.ANNOTATION_KEY_METADATASET_ID));

                ReportType report = metadataSet.Report[0];

                string msdId = metadataSet.getAnnotationValue(MetadataSetType.ANNOTATION_KEY_METADATASET_MSD_ID);
                string msdAgencyId = metadataSet.getAnnotationValue(MetadataSetType.ANNOTATION_KEY_METADATASET_MSD_AGENCY_ID);
                string msdVersion = metadataSet.getAnnotationValue(MetadataSetType.ANNOTATION_KEY_METADATASET_MSD_VERSION_ID);
                ISdmxObjects sdmxObjects = _businessLogic.GetSdmxObjects(Org.Sdmxsource.Sdmx.Api.Constants.SdmxStructureEnumType.Msd, msdId, msdAgencyId, msdVersion);
                IMetadataStructureDefinitionObject msd = sdmxObjects.MetadataStructures.First();

                string msdFileContent = _businessLogic.GetSdmxMlFromSdmxObjects(sdmxObjects);

                string reportId = report.getAnnotationValue(ReportType.ANNOTATION_KEY_REPORT_ID);

                if (reportId != null && reportId.Trim().Length > 0)//update
                {
                    ReportType updatedReport = _businessLogic.UpdateReport(metadatasetIdentifier, metadataSetId, RMUtility.Serialize<MetadataSetType>(metadataSet), msdFileContent);
                    AttachInfosToReport(updatedReport, mDataset, false);
                    for (int i = 0; i < mDataset.Report.Count; i++)
                    {
                        ReportType currReport = mDataset.Report[i];
                        string currReportId = currReport.getAnnotationValue(ReportType.ANNOTATION_KEY_REPORT_ID);
                        if (currReportId == reportId)
                        {
                            mDataset.Report.RemoveAt(i);
                        }
                        mDataset.Report.Add(updatedReport);
                    }
                }
                else//create
                {
                    int createdReportId = _businessLogic.CreateReport(RMUtility.Serialize<MetadataSetType>(metadataSet), metadataSetId, msdFileContent);
                    ReportType createdReport = _businessLogic.GetReport(createdReportId);
                    AttachInfosToReport(createdReport, mDataset, false);
                    mDataset.Report.Add(createdReport);
                }

                // annotazione HAVE_METADATA
                var isMetSetDCAT = getDCATMetadataSetId(metadataSet);
                string metadatasetId = mDataset.getAnnotationValue(MetadataSetType.ANNOTATION_KEY_METADATASET_ID);
                if (metadatasetId == null || (metadatasetId = metadatasetId.Trim()).Length == 0)
                {
                    throw new Exception("Metadataset id not found!");
                }
                if (isMetSetDCAT)
                {

                    SetAnnotationDataflow(mDataset);
                }

                setMetadataflowData(mDataset);
                List<MetadataSetType> mdsList = new List<MetadataSetType>();
                mdsList.Add(mDataset);

                var converted = convertMetadataSet(mdsList);
                var items = converted?.SelectMany(i => i.MetadataSet.ToArray())?.ToArray();

                return new ActionResult<string>(serializeSdmxFormat(items));
            }
            catch (Exception ex)
            {
                if (ex.Message.Equals("FORBIDDEN"))
                {
                    throw;
                }
                throw Utility.Utils.getCustomException("UPSERT_REPORT_ERROR",
                 @"Method " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - " + ex.Message,
                 Infrastructure.STLogging.Interface.LogLevelEnum.Error);
            }
        }

        private bool getDCATMetadataSetId(MetadataSetType metadataSet)
        {
            if (metadataSet.structureRef != null && metadataSet.structureRef.Equals(_nodeConfiguration.DcatApIt.MSD, StringComparison.InvariantCultureIgnoreCase))
            {
                return true;
            }
            return false;
        }

        private void RemoveAnnotationDataflow(MetadataSetType metadataSet)
        {
            if (metadataSet != null)
            {
                if (metadataSet.Report != null)
                {
                    foreach (ReportType currRep in metadataSet.Report)
                    {
                        RemoveAnnotationDataflow(currRep);
                    }
                }
            }
        }

        private void RemoveAnnotationDataflow(ReportType report, string dataflowUri = null)
        {
            if (dataflowUri != null && dataflowUri.Trim().Length > 0)
            {
                string dataflowId = null;
                string dataflowAgency = null;
                string dataflowVersion = null;
                RMUtil.RMUtility.ParseURN(dataflowUri, out dataflowId, out dataflowAgency, out dataflowVersion);
                _businessLogic.RemoveAnnotation(SdmxStructureEnumType.Dataflow, dataflowId, dataflowAgency, dataflowVersion, _nodeConfiguration.Annotations.HaveMetadata);
            }
            else
            {
                bool error = true;
                foreach (ReferenceValueType rvt in report.Target.ReferenceValue)
                {
                    //if (rvt.id.Equals("DATASET_IDENTIFIER", StringComparison.InvariantCultureIgnoreCase))
                    try
                    {
                        foreach (XmlUri uri in rvt.ObjectReference.URN)
                        {
                            string currUri = uri.UriValue;
                            string dataflowId = null;
                            string dataflowAgency = null;
                            string dataflowVersion = null;
                            RMUtil.RMUtility.ParseURN(currUri, out dataflowId, out dataflowAgency, out dataflowVersion);
                            _businessLogic.RemoveAnnotation(SdmxStructureEnumType.Dataflow, dataflowId, dataflowAgency, dataflowVersion, _nodeConfiguration.Annotations.HaveMetadata);
                            error = false;
                        }
                    }
                    catch (Exception) { }
                }
                if (error)
                {
                    throw new Exception("Error to remove HaveMetadata Annotation");
                }
            }
        }

        private void SetAnnotationDataflow(MetadataSetType metadataSet)
        {
            if (metadataSet != null && metadataSet.Report != null)
            {
                foreach (ReportType currRep in metadataSet.Report)
                {
                    SetAnnotationDataflow(currRep);
                }
            }
        }

        private void SetAnnotationDataflow(ReportType report)
        {
            bool error = true;
            foreach (ReferenceValueType rvt in report.Target.ReferenceValue)
            {
                try
                {
                    foreach (XmlUri uri in rvt.ObjectReference.URN)
                    {
                        string currUri = uri.UriValue;
                        string dataflowId = null;
                        string dataflowAgency = null;
                        string dataflowVersion = null;
                        RMUtil.RMUtility.ParseURN(currUri, out dataflowId, out dataflowAgency, out dataflowVersion);
                        _businessLogic.SetAnnotation(SdmxStructureEnumType.Dataflow, dataflowId, dataflowAgency, dataflowVersion, _nodeConfiguration.Annotations.HaveMetadata);
                        error = false;
                    }
                }
                catch (Exception) { }
            }

            if (error)
            {
                throw new Exception("Error to set HaveMetadata Annotation");
            }
        }

        /// <summary>
        /// Insert or update a MetadataSet.
        /// </summary>
        /// <param name="jsonMetadataSet"></param>
        /// <returns>New or updated MetadataSet like sdmx-json message</returns>
        [HttpPost("upsertJsonMetadataSet")]
        [Produces("text/plain")]
        public ActionResult<string> UpsertJsonMetadataSet([FromBody] object jsonMetadataSet)
        {
            try
            {
                List<MetadataSetType> mdtsList = extractMetadataSetFromSdmxJsonMessage(jsonMetadataSet.ToString());
                if (mdtsList == null || mdtsList.Count == 0)
                {
                    throw new Exception("Error to retrieve MetadataSet from parameters");
                }
                MetadataSetType metadataSet = mdtsList[0];

                ISdmxObjects metadataflowObj = GetMetadataflowObj(metadataSet);
                MetadataflowType metadataflow = BuildMetadataflow(metadataflowObj, metadataSet);

                string metadataSetIdStr = metadataSet.getAnnotationValue(MetadataSetType.ANNOTATION_KEY_METADATASET_ID);

                string msdId = metadataSet.getAnnotationValue(MetadataSetType.ANNOTATION_KEY_METADATASET_MSD_ID);
                string msdAgencyId = metadataSet.getAnnotationValue(MetadataSetType.ANNOTATION_KEY_METADATASET_MSD_AGENCY_ID);
                string msdVersion = metadataSet.getAnnotationValue(MetadataSetType.ANNOTATION_KEY_METADATASET_MSD_VERSION_ID);
                if (msdId == null && msdAgencyId == null && msdVersion == null && metadataflow.structureURL != null && metadataflow.structureURL.AbsoluteUri.Trim().Length > 0)
                {
                    RMUtil.RMUtility.ParseURN(metadataflow.structureURL.AbsoluteUri, out msdId, out msdAgencyId, out msdVersion);
                    metadataSet.addAnnotationValue(MetadataSetType.ANNOTATION_KEY_METADATASET_MSD_ID, msdId, RMUtil.RMUtility.EN_LANGUAGE);
                    metadataSet.addAnnotationValue(MetadataSetType.ANNOTATION_KEY_METADATASET_MSD_AGENCY_ID, msdAgencyId, RMUtil.RMUtility.EN_LANGUAGE);
                    metadataSet.addAnnotationValue(MetadataSetType.ANNOTATION_KEY_METADATASET_MSD_VERSION_ID, msdVersion, RMUtil.RMUtility.EN_LANGUAGE);
                }
                ISdmxObjects sdmxObjects = _businessLogic.GetSdmxObjects(Org.Sdmxsource.Sdmx.Api.Constants.SdmxStructureEnumType.Msd, msdId, msdAgencyId, msdVersion);
                IMetadataStructureDefinitionObject msd = sdmxObjects.MetadataStructures.First();
                string msdFileContent = _businessLogic.GetSdmxMlFromSdmxObjects(sdmxObjects);

                MetadataSetType result = null;
                int metadataSetId = 0;
                if (metadataSetIdStr != null && metadataSetIdStr.Trim().Length > 0)
                {
                    metadataSetId = Convert.ToInt32(metadataSetIdStr);
                    MetadataSetType metadataSetOld = _businessLogic.GetMetadataSet(metadataSet.setID, null, null);
                    result = _businessLogic.UpdateMetadataSet(metadataSet.setID, RMUtility.Serialize<MetadataSetType>(metadataSet), msdFileContent);
                    checkMetadataflowChanges(metadataSetOld, metadataSet);
                    _businessLogic.UpdateCategorisationsMetadataSet(metadataSet.Annotations.Annotation);
                }
                else
                {
                    string newMetadataSetIdStr = _businessLogic.CreateMetadataSet(RMUtility.Serialize<MetadataSetType>(metadataSet), msdFileContent);
                    result = _businessLogic.GetMetadataSet(metadataSet.setID, null, null);
                    metadataSetId = Convert.ToInt32(result.getAnnotationValue(MetadataSetType.ANNOTATION_KEY_METADATASET_ID));
                }

                if (result.structureRef == null)
                {
                    result.structureRef = metadataSet.structureRef;
                }

                // annotazione HAVE_METADATA
                var isMetSetDCAT = getDCATMetadataSetId(metadataSet);
                string metadatasetId = result.setID;
                if (metadatasetId == null || (metadatasetId = metadatasetId.Trim()).Length == 0)
                {
                    throw new Exception("Metadataset id not found!");
                }
                if (isMetSetDCAT)
                {
                    SetAnnotationDataflow(result);
                }

                if (metadataSet.getAnnotation(MetadataSetType.ANNOTATION_KEY_METADATASET_TO_CLONE_ID) == null)
                {
                    upsertMetadataflow(metadataflowObj, metadataflow, metadataSet, metadataSetId);
                }
                setMetadataflowData(result);
                List<MetadataSetType> mdsList = new List<MetadataSetType>();
                mdsList.Add(result);

                var converted = convertMetadataSet(mdsList);
                var items = converted?.SelectMany(i => i.MetadataSet.ToArray())?.ToArray();

                return new ActionResult<string>(serializeSdmxFormat(items));
            }
            catch (Exception ex)
            {
                if (ex.Message.Equals("FORBIDDEN"))
                {
                    throw;
                }
                throw Utility.Utils.getCustomException("UPDATE_METADATASET_ERROR",
                 @"Method " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - " + ex.Message,
                 Infrastructure.STLogging.Interface.LogLevelEnum.Error);
            }
        }

        private void checkMetadataflowChanges(MetadataSetType metadataSetOld, MetadataSetType metadataSetUpdated)
        {
            string flowIdOld = metadataSetOld.getAnnotationValue(MetadataSetType.ANNOTATION_KEY_METADATASET_FLOW_ID);
            string flowAgencyIdOld = metadataSetOld.getAnnotationValue(MetadataSetType.ANNOTATION_KEY_METADATASET_FLOW_AGENCY_ID);
            string flowVersionOld = metadataSetOld.getAnnotationValue(MetadataSetType.ANNOTATION_KEY_METADATASET_FLOW_VERSION_ID);

            string flowIdUpd = metadataSetUpdated.getAnnotationValue(MetadataSetType.ANNOTATION_KEY_METADATASET_FLOW_ID);
            string flowAgencyIdUpd = metadataSetUpdated.getAnnotationValue(MetadataSetType.ANNOTATION_KEY_METADATASET_FLOW_AGENCY_ID);
            string flowVersionUpd = metadataSetUpdated.getAnnotationValue(MetadataSetType.ANNOTATION_KEY_METADATASET_FLOW_VERSION_ID);

            if (flowIdOld != null && flowAgencyIdOld != null && flowVersionOld != null && flowIdUpd != null && flowAgencyIdUpd != null && flowVersionUpd != null)
            {
                if (!flowIdOld.Trim().Equals(flowIdUpd.Trim()) || !flowAgencyIdOld.Trim().Equals(flowAgencyIdUpd.Trim()) || !flowVersionOld.Trim().Equals(flowVersionUpd.Trim()))
                {
                    string metadataflowUrn = RMUtil.RMUtility.BuildMetadataflowURN(flowIdOld, flowAgencyIdOld, flowVersionOld);

                    List<int> ids = _businessLogic.SearchMetadataSetIdByDataflowURN(metadataflowUrn);
                    if (ids == null || ids.Count == 0)
                    {
                        _businessLogic.RemoveAnnotation(SdmxStructureEnumType.MetadataFlow, flowIdOld, flowAgencyIdOld, flowVersionOld, MetadataSetType.ANNOTATION_KEY_METADATASET_ASSOCIATED_ID);
                    }
                }
            }
            else
            {
                throw new Exception("Metadataflow URN Data not specified!");
            }
        }

        private string upsertMetadataflow(ISdmxObjects metadataflowObj, MetadataflowType metadataflow, MetadataSetType metadataSet, int metadataSetId)
        {
            ISdmxObjects bean = new SdmxObjectsImpl();
            //bean.AddMetadataFlow(new MetadataflowObjectCore(metadataflow));

            bool flowAssociated = false;
            if (metadataflow.Annotations != null && metadataflow.Annotations.Annotation != null)
            {
                foreach (Org.Sdmx.Resources.SdmxMl.Schemas.V21.Common.AnnotationType currAnn in metadataflow.Annotations.Annotation)
                {
                    if (currAnn.AnnotationType1 != null && currAnn.AnnotationType1.Equals(MetadataSetType.ANNOTATION_KEY_METADATASET_ASSOCIATED_ID))
                    {
                        flowAssociated = true;
                        break;
                    }
                }
            }
            if (!flowAssociated)
            {
                string flowId = metadataSet.getAnnotationValue(MetadataSetType.ANNOTATION_KEY_METADATASET_FLOW_ID);
                string flowAgency = metadataSet.getAnnotationValue(MetadataSetType.ANNOTATION_KEY_METADATASET_FLOW_AGENCY_ID);
                string flowVersion = metadataSet.getAnnotationValue(MetadataSetType.ANNOTATION_KEY_METADATASET_FLOW_VERSION_ID);

                string metadataflowUrn = RMUtil.RMUtility.BuildMetadataflowURN(flowId, flowAgency, flowVersion);

                //List<int> ids = _businessLogic.SearchMetadataSetIdByDataflowURN(metadataflowUrn);
                //if (ids == null || ids.Count == 0 || (ids.Count == 1 && ids[0].Equals(metadataSetId)))
                //{
                _businessLogic.SetAnnotation(SdmxStructureEnumType.MetadataFlow, flowId, flowAgency, flowVersion, MetadataSetType.ANNOTATION_KEY_METADATASET_ASSOCIATED_ID);
                //}
            }

            if (metadataSet.Annotations != null && metadataSet.Annotations.Annotation != null)
            {
                foreach (AnnotationType currAnn in metadataSet.Annotations.Annotation)
                {
                    if (currAnn.id != null && currAnn.id.StartsWith("categorisation_"))
                    {
                        string currAnnVal = metadataSet.getAnnotationValue(currAnn.id);
                        if (currAnnVal != null && currAnnVal.Trim().Length > 0)
                        {
                            string[] categorisationValues = currAnnVal.Split("+");

                            CategorisationType categorisationType = new CategorisationType();
                            categorisationType.agencyID = categorisationValues[1];
                            categorisationType.id = categorisationValues[0];
                            categorisationType.version = categorisationValues[2];
                            categorisationType.Target = new CategoryReferenceType();
                            categorisationType.Target.URN = new List<Uri>();
                            categorisationType.Target.URN.Add(new Uri(categorisationValues[4]));
                            categorisationType.Source = new Org.Sdmx.Resources.SdmxMl.Schemas.V21.Common.ObjectReferenceType();
                            categorisationType.Source.URN = new List<Uri>();
                            categorisationType.Source.URN.Add(new Uri(categorisationValues[3]));
                            categorisationType.Name = new List<Org.Sdmx.Resources.SdmxMl.Schemas.V21.Common.Name>();
                            Org.Sdmx.Resources.SdmxMl.Schemas.V21.Common.TextType tt = new Org.Sdmx.Resources.SdmxMl.Schemas.V21.Common.TextType();
                            tt.lang = RMUtility.EN_LANGUAGE;
                            tt.TypedValue = categorisationType.id;
                            categorisationType.Name.Add(new Org.Sdmx.Resources.SdmxMl.Schemas.V21.Common.Name(tt));
                            bean.AddCategorisation(new CategorisationObjectCore(categorisationType));
                        }
                    }
                }
            }

            string jsonMetadataFlow = _businessLogic.GetSdmxJsonFromSdmxObjects(bean);
            if (bean != null && bean.GetAllMaintainables() != null && bean.GetAllMaintainables().Count > 0)
            {
                string metadataSetIdStr = metadataSet.getAnnotationValue(MetadataSetType.ANNOTATION_KEY_METADATASET_ID);
                if (metadataSetIdStr != null && metadataSetIdStr.Trim().Length > 0)
                {
                    _businessLogic.UpdateArtefacts(jsonMetadataFlow);
                }
                else
                {
                    _businessLogic.CreateArtefacts(jsonMetadataFlow);
                }
            }
            return jsonMetadataFlow;
        }

        private ISdmxObjects GetMetadataflowObj(MetadataSetType metadataSet)
        {
            string metadataSetName = null;
            if (metadataSet.Name != null)
            {
                metadataSetName = metadataSet.Name[0].TypedValue;
            }

            // TODO: Per il Metadataflow imposto Agency: IT1, version: 1.0, ID: id del metadataset
            string flowId = metadataSet.getAnnotationValue(MetadataSetType.ANNOTATION_KEY_METADATASET_FLOW_ID);
            string flowAgencyId = metadataSet.getAnnotationValue(MetadataSetType.ANNOTATION_KEY_METADATASET_FLOW_AGENCY_ID);
            string flowVersion = metadataSet.getAnnotationValue(MetadataSetType.ANNOTATION_KEY_METADATASET_FLOW_VERSION_ID);

            string metadataflowStr = _businessLogic.GetMetadataflow(flowId, flowAgencyId, flowVersion, StructureReferenceDetailEnumType.All);

            return _businessLogic.GetSdmxObjectsFromSdmxJson(metadataflowStr);
        }

        private MetadataflowType BuildMetadataflow(ISdmxObjects sdmxObjs, MetadataSetType metadataSet)
        {
            
             //il Metadataflow non deve essere creato ma viene specificato dal client
             
            Org.Sdmx.Resources.SdmxMl.Schemas.V21.Structure.MetadataflowType metadataflow = new Org.Sdmx.Resources.SdmxMl.Schemas.V21.Structure.MetadataflowType();

            if (sdmxObjs != null && sdmxObjs.HasMetadataflows)
            {
                foreach (IMetadataFlow currMFlow in sdmxObjs.Metadataflows)
                {
                    metadataflow.structureURL = currMFlow.MetadataStructureRef.TargetUrn;
                    break;
                }
            }
            return metadataflow;
        }

        #endregion

        #region DELETE

        /// <summary>
        /// Deletes a metadataset
        /// </summary>
        /// <param name="idMetadataSet">id</param>
        /// <returns>Operation result</returns>
        [HttpDelete("deleteGenericMetadataset/{idMetadataSet}")]
        public string deleteGenericMetadataset(string idMetadataSet)
        {
            MetadataSetType mdst = _businessLogic.GetMetadataSet(idMetadataSet, false, false);
            if (mdst.Report != null && mdst.Report.Count > 0)
            {
                throw Utility.Utils.getCustomException("DELETE_METADATASET_WITH_REPORT",
                 @"Method " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - Delete MetadataSet with Reports denied",
                 Infrastructure.STLogging.Interface.LogLevelEnum.Error);
            }
            try
            {
                string flowId = mdst.getAnnotationValue(MetadataSetType.ANNOTATION_KEY_METADATASET_FLOW_ID);
                string flowAgency = mdst.getAnnotationValue(MetadataSetType.ANNOTATION_KEY_METADATASET_FLOW_AGENCY_ID);
                string flowVersion = mdst.getAnnotationValue(MetadataSetType.ANNOTATION_KEY_METADATASET_FLOW_VERSION_ID);
                int metadataSetId = Convert.ToInt32(mdst.getAnnotationValue(MetadataSetType.ANNOTATION_KEY_METADATASET_ID));

                string result = _businessLogic.DeleteMetadataSet(metadataSetId);

                string metadataflowUrn = RMUtil.RMUtility.BuildMetadataflowURN(flowId, flowAgency, flowVersion);

                List<int> ids = _businessLogic.SearchMetadataSetIdByDataflowURN(metadataflowUrn);
                if (ids == null || ids.Count == 0)
                {
                    _businessLogic.RemoveAnnotation(SdmxStructureEnumType.MetadataFlow, flowId, flowAgency, flowVersion, MetadataSetType.ANNOTATION_KEY_METADATASET_ASSOCIATED_ID);
                }
                return result;
            }
            catch (Exception ex)
            {
                throw Utility.Utils.getCustomException("DELETE_METADATASET_ERROR",
                 @"Method " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - " + ex.Message,
                 Infrastructure.STLogging.Interface.LogLevelEnum.Error);
            }
        }

        /// <summary>
        /// Deletes a report
        /// </summary>
        /// <param name="idReport">id</param>
        /// <returns>Operation result</returns>
        [HttpDelete("deleteReport/{idReport}")]
        public string deleteReport(int idReport)
        {
            string result = "false";
            try
            {
                ReportType report = _businessLogic.GetReport(idReport);
                result = _businessLogic.DeleteReport(idReport);

                string metadatasetId = report.getAnnotationValue(ReportType.ANNOTATION_KEY_METADATASET_ID);
                if (metadatasetId == null || (metadatasetId = metadatasetId.Trim()).Length == 0)
                {
                    throw new Exception("Metadataset id not found for Report " + report.id);
                }
                MetadataSetType metadataset = _businessLogic.GetMetadataSet(metadatasetId, true, false, true);
                var isMetSetDCAT = getDCATMetadataSetId(metadataset);
                if (metadataset == null || metadataset.setID == null || metadataset.setID.Trim().Length == 0)
                {
                    throw new Exception("Metadataset reference id not found!");
                }

                if (result.Equals("true") && isMetSetDCAT)
                {
                    bool error = true;
                    foreach (var trg in report.Target.ReferenceValue)
                    {
                        //if (trg.id.Equals("DATASET_IDENTIFIER", StringComparison.InvariantCultureIgnoreCase))
                        try
                        {
                            foreach (XmlUri riUri in trg.ObjectReference.URN)
                            {
                                List<ReportType> reportDataflow = _businessLogic.SearchReportByParams(0, riUri.UriValue, null);
                                if (reportDataflow == null || reportDataflow.Count == 0)
                                {
                                    RemoveAnnotationDataflow(report, riUri.UriValue);
                                }
                                error = false;
                            }
                        }
                        catch (Exception) { }
                    }
                    if (error)
                    {
                        throw new Exception("Error to remove HaveMetadata Annotation");
                    }
                }
            }
            catch (Exception ex)
            {
                if (ex.Message.Equals("FORBIDDEN"))
                {
                    throw;
                }
                throw Utility.Utils.getCustomException("DELETE_REPORT_ERROR",
                 @"Method " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - " + ex.Message,
                 Infrastructure.STLogging.Interface.LogLevelEnum.Error);
            }
            return result;
        }

        #endregion

        #region UTILS

        /// <summary>
        /// Add codelist data to a specific Report.
        /// </summary>
        /// <param name="report">Report data</param>
        /// <param name="mdataset">MetadataSet data</param>
        /// <param name="isDefaultReport">Dataflow</param>
        /// <returns>Default report data</returns>
        protected void AttachInfosToReport(ReportType report, MetadataSetType mdataset, bool isDefaultReport)
        {
            try
            {
                string msdId = mdataset.getAnnotationValue(MetadataSetType.ANNOTATION_KEY_METADATASET_MSD_ID);
                string msdAgencyId = mdataset.getAnnotationValue(MetadataSetType.ANNOTATION_KEY_METADATASET_MSD_AGENCY_ID);
                string msdVersion = mdataset.getAnnotationValue(MetadataSetType.ANNOTATION_KEY_METADATASET_MSD_VERSION_ID);
                string reportType = report.getAnnotationValue(ReportType.ANNOTATION_KEY_REPORT_TYPE);

                ISdmxObjects sdmxObjects = _businessLogic.GetSdmxObjects(Org.Sdmxsource.Sdmx.Api.Constants.SdmxStructureEnumType.Msd, msdId, msdAgencyId, msdVersion);

                MetadataSetCodeListAnnotationBody annotationBody = new MetadataSetCodeListAnnotationBody();

                if (isDefaultReport || (reportType != null && reportType.Equals(ReportType.TARGET_DATAFLOW_VALUE)))
                {
                    foreach (IMetadataStructureDefinitionObject ms in sdmxObjects.MetadataStructures)
                    {
                        foreach (IMetadataTarget mdt in ms.MetadataTargets)
                        {
                            foreach (IIdentifiableTarget identTarget in mdt.IdentifiableTarget)
                            {
                                if (identTarget.ReferencedStructureType == Org.Sdmxsource.Sdmx.Api.Constants.SdmxStructureEnumType.Dataflow)
                                {
                                    report.Target.id = mdt.Id;
                                }
                            }
                        }
                    }
                }

                Dictionary<string, string> attrCodeLists = new Dictionary<string, string>();
                foreach (IMetadataStructureDefinitionObject ms in sdmxObjects.MetadataStructures)
                {
                    foreach (IReportStructure rs in ms.ReportStructures)
                    {
                        foreach (IMetadataAttributeObject mao in rs.MetadataAttributes)
                        {
                            retrieveEnumAttributes(mao, attrCodeLists);
                        }
                    }
                }

                //Dictionary<string, string> attrCodeReport = new Dictionary<string, string>();
                //if (report.AttributeSet != null)
                //{
                //    foreach (ReportedAttributeType rat in report.AttributeSet.ReportedAttribute)
                //    {
                //        checkCodelistType(rat, attrCodeReport, attrCodeLists);
                //    }
                //}

                Dictionary<string, JObject> codelistReport = new Dictionary<string, JObject>();
                foreach (string attrId in attrCodeLists.Keys)
                {
                    string currCodelist = attrCodeLists[attrId];
                    if (!codelistReport.ContainsKey(currCodelist))
                    {
                        string codelistData = _businessLogic.GetSdmxStructure(SdmxStructureEnumType.CodeList, currCodelist, msdAgencyId, msdVersion);
                        codelistReport.Add(currCodelist, JObject.Parse(codelistData));
                    }
                }

                annotationBody.fieldInfo = attrCodeLists;
                annotationBody.codelists = codelistReport;
                AnnotationType annotation = new AnnotationType("CodelistsMetadata", JsonConvert.SerializeObject(annotationBody, Formatting.Indented), RMUtility.IT_LANGUAGE);
                mdataset.Annotations.Annotation.Add(annotation);
            }
            catch (Exception ex)
            {
                //throw new Exception("Error to retrieve codelist data", ex);
                throw Utility.Utils.getCustomException("GET_MSD_FOR_REPORT",
                                   @"Method " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - " + ex.Message, Infrastructure.STLogging.Interface.LogLevelEnum.Error);
            }
        }

        /// <summary>
        /// Select the codelist attributes from the MSD and add them to the collection specified.
        /// </summary>
        /// <param name="mao">Attribute data of MSD</param>
        /// <param name="result">Collection of enum attribute ([ATTRIBUTE_ID, ENUMERATION_NAME])</param>
        /// <returns>Collection of enum attribute</returns>
        private static void retrieveEnumAttributes(IMetadataAttributeObject mao, Dictionary<string, string> result)
        {
            if (!mao.Presentational.IsTrue && mao.Representation != null && mao.Representation.Representation != null)
            {
                string id = mao.Representation.Representation.MaintainableId;
                Org.Sdmxsource.Sdmx.Api.Constants.SdmxStructureType type = mao.Representation.Representation.MaintainableStructureEnumType;
                if (type.ToEnumType().Equals(SdmxStructureEnumType.CodeList))
                {
                    result.Add(mao.Id, id);
                }
            }

            foreach (IMetadataAttributeObject chieldMao in mao.MetadataAttributes)
            {
                retrieveEnumAttributes(chieldMao, result);
            }
        }

        /// <summary>
        /// Analyzes attribute list of a Report ed updates the collection of codelist.
        /// </summary>
        /// <param name="rat">Attribute list of a Report</param>
        /// <param name="attrCodeReport">Collection of codelist used into Report</param>
        /// <param name="attrCodeLists">Collection of all codelist defined into MSD of Report</param>
        private static void checkCodelistType(ReportedAttributeType rat, Dictionary<string, string> attrCodeReport, Dictionary<string, string> attrCodeLists)
        {
            if (attrCodeLists.ContainsKey(rat.id))
            {
                attrCodeReport.Add(rat.id, attrCodeLists[rat.id]);
            }
            if (rat.AttributeSet != null)
            {
                foreach (ReportedAttributeType chieldRat in rat.AttributeSet.ReportedAttribute)
                {
                    checkCodelistType(chieldRat, attrCodeReport, attrCodeLists);
                }
            }
        }

        #endregion

        private List<MetadataSetType> generateMetadataSetList()
        {
            _logger.Log("Retrieve metadataset list", LogLevelEnum.Debug);
            List<MetadataSetType> metadataSets = _businessLogic.GetStoredMetadataSets();
            _logger.Log("Metadataset list loaded", LogLevelEnum.Debug);

            List<MetadataSetType> metadataSetsWithFlow = new List<MetadataSetType>();
            _logger.Log("Retrieve metadataflow list", LogLevelEnum.Debug);
            string res = _businessLogic.GetMetadataflow(null, null, null, StructureReferenceDetailEnumType.Parents);
            _logger.Log("Metadataflow list loaded", LogLevelEnum.Debug);
            _logger.Log("Start convert string metadataflow list to sdmx object", LogLevelEnum.Debug);
            ISdmxObjects sdmxS = _businessLogic.GetSdmxObjectsFromSdmxJson(res);
            _logger.Log("Sdmx object of metadataflow list created", LogLevelEnum.Debug);
            _logger.Log("Metadataflow e Categorization into Metadataset", LogLevelEnum.Debug);
            foreach (MetadataSetType mdst in metadataSets)
            {
                if (setMetadataflowData(mdst, sdmxS))
                {
                    metadataSetsWithFlow.Add(mdst);
                }
            }
            _logger.Log("Merge data into Metadataset completed", LogLevelEnum.Debug);
            return metadataSetsWithFlow;
        }

        private List<IMetadata> convertMetadataSet(List<MetadataSetType> metadataSets)
        {
            var listResults = new List<IMetadata>();
            foreach (MetadataSetType mdst in metadataSets)
            {
                GenericMetadata metadata = new GenericMetadata();
                var header = new GenericMetadataHeaderType();
                var structureType = new GenericMetadataStructureType();
                var structure = new MetadataStructureReferenceType();
                var refType = new MetadataStructureRefType();
                refType.agencyID = mdst?.Annotations?.Annotation?.FirstOrDefault(i => i.id.Equals(MetadataSetType.ANNOTATION_KEY_METADATASET_MSD_AGENCY_ID))?.AnnotationText?.FirstOrDefault().TypedValue;
                refType.id = mdst?.Annotations?.Annotation?.FirstOrDefault(i => i.id.Equals(MetadataSetType.ANNOTATION_KEY_METADATASET_MSD_ID))?.AnnotationText?.FirstOrDefault().TypedValue;
                refType.version = mdst?.Annotations?.Annotation?.FirstOrDefault(i => i.id.Equals(MetadataSetType.ANNOTATION_KEY_METADATASET_MSD_VERSION_ID))?.AnnotationText?.FirstOrDefault().TypedValue;
                structure.SetTypedRef(refType);
                structureType.Structure = structure;
                structureType.structureID = $"urn:sdmx:org.sdmx.infomodel.metadatastructure.MetadataStructure={refType.agencyID}:{refType.id}({refType.version})";
                header.Structure.Add(structureType);
                metadata.Content.Header = header;


                var newDataSet = new Org.Sdmx.Resources.SdmxMl.Schemas.V21.MetaData.Generic.MetadataSetType();
                newDataSet.action = "Replace";
                newDataSet.setID = mdst?.Annotations?.Annotation?.FirstOrDefault(i => i.id.Equals(MetadataSetType.ANNOTATION_KEY_METADATASET_FLOW_ID))?.AnnotationText?.FirstOrDefault().TypedValue; ;

                if (mdst.publicationPeriod != null)
                {
                    newDataSet.publicationPeriod = mdst.publicationPeriod;
                }
                if (mdst.publicationYear != null)
                {
                    //newDataSet.publicationYear = new DateTime(Convert.ToInt32(mdst.publicationYear), 1, 1);
                }
                if (mdst.reportingBeginDate != null)
                {
                    newDataSet.reportingBeginDate = mdst.reportingBeginDate.Value.ToString("yyyy-MM-dd");
                }
                if (mdst.reportingEndDate != null)
                {
                    newDataSet.reportingEndDate = mdst.reportingEndDate.Value.ToString("yyyy-MM-dd");
                }
                if (mdst.validFromDate != null)
                {
                    newDataSet.validFromDate = mdst.validFromDate.Value;
                }
                if (mdst.validToDate != null)
                {
                    newDataSet.validToDate = mdst.validToDate.Value;
                }

                foreach (var itemName in mdst.Name)
                {
                    newDataSet.Name.Add(new Org.Sdmx.Resources.SdmxMl.Schemas.V21.Common.Name() { lang = itemName.lang, TypedValue = itemName.TypedValue });
                }
                newDataSet.structureRef = $"urn:sdmx:org.sdmx.infomodel.metadatastructure.MetadataStructure={refType.agencyID}:{refType.id}({refType.version})";

                newDataSet.Annotations = createAnnotations(mdst.Annotations);

                newDataSet.Report = createReport(mdst.Report);

                if (newDataSet.Report == null ||
                    newDataSet.Report.Count <= 0)
                {
                    newDataSet.Report = createFakeReport();
                }

                metadata.Content.DataSet.Add(newDataSet);
                listResults.Add(new MetadataObjectCore(metadata));
            }


            return listResults;
        }

        private List<Org.Sdmx.Resources.SdmxMl.Schemas.V21.MetaData.Generic.ReportType> createFakeReport()
        {
            var results = new List<Org.Sdmx.Resources.SdmxMl.Schemas.V21.MetaData.Generic.ReportType>();

            var newReport = new Org.Sdmx.Resources.SdmxMl.Schemas.V21.MetaData.Generic.ReportType();
            newReport.id = "Fake";
            newReport.Target = new Org.Sdmx.Resources.SdmxMl.Schemas.V21.MetaData.Generic.TargetType();
            newReport.Target.id = "FakeId";
            newReport.AttributeSet = new Org.Sdmx.Resources.SdmxMl.Schemas.V21.MetaData.Generic.AttributeSetType();
            newReport.AttributeSet.ReportedAttribute = new List<Org.Sdmx.Resources.SdmxMl.Schemas.V21.MetaData.Generic.ReportedAttributeType>();
            newReport.AttributeSet.ReportedAttribute.Add(new Org.Sdmx.Resources.SdmxMl.Schemas.V21.MetaData.Generic.ReportedAttributeType
            {
                id = "FakeId",
                value = "FakeValue"
            });
            results.Add(newReport);

            return results;
        }

        private List<Org.Sdmx.Resources.SdmxMl.Schemas.V21.MetaData.Generic.ReportType> createReport(List<ReportType> reportTypes)
        {
            var results = new List<Org.Sdmx.Resources.SdmxMl.Schemas.V21.MetaData.Generic.ReportType>();
            foreach (var itemReport in reportTypes)
            {
                var newReport = new Org.Sdmx.Resources.SdmxMl.Schemas.V21.MetaData.Generic.ReportType();
                newReport.id = itemReport.id;
                newReport.Annotations = createAnnotations(itemReport.Annotations);
                newReport.Target = createTarget(itemReport.Target);
                newReport.AttributeSet = createAttributeset(itemReport.AttributeSet);
                results.Add(newReport);
            }

            return results;
        }

        private Org.Sdmx.Resources.SdmxMl.Schemas.V21.MetaData.Generic.TargetType createTarget(TargetType targetTypes)
        {
            var target = new Org.Sdmx.Resources.SdmxMl.Schemas.V21.MetaData.Generic.TargetType();
            target.id = targetTypes.id;
            if (targetTypes.ReferenceValue != null)
            {
                target.ReferenceValue = new List<Org.Sdmx.Resources.SdmxMl.Schemas.V21.MetaData.Generic.ReferenceValueType>();
                foreach (var itemRef in targetTypes.ReferenceValue)
                {
                    if (itemRef.id.Equals("DATAFLOW", StringComparison.InvariantCultureIgnoreCase))
                    {
                        var itemReferenceValueType = new Org.Sdmx.Resources.SdmxMl.Schemas.V21.MetaData.Generic.ReferenceValueType();
                        itemReferenceValueType.id = itemRef.id;
                        var itemObjectReferenceType = new Org.Sdmx.Resources.SdmxMl.Schemas.V21.Common.ObjectReferenceType();
                        itemObjectReferenceType.URN = new List<Uri>();
                        itemObjectReferenceType.URN.Add(new Uri(itemRef.ObjectReference.URN.FirstOrDefault().UriValue));
                        itemReferenceValueType.ObjectReference = itemObjectReferenceType;
                        target.ReferenceValue.Add(itemReferenceValueType);
                    }
                    else if (itemRef.id.Equals("DATA_PROVIDER", StringComparison.InvariantCultureIgnoreCase))
                    {
                        var itemReferenceValueType = new Org.Sdmx.Resources.SdmxMl.Schemas.V21.MetaData.Generic.ReferenceValueType();
                        itemReferenceValueType.id = itemRef.id;
                        var itemObjectReferenceType = new Org.Sdmx.Resources.SdmxMl.Schemas.V21.Common.ObjectReferenceType();
                        itemObjectReferenceType.URN = new List<Uri>();
                        itemObjectReferenceType.URN.Add(new Uri(itemRef.ObjectReference.URN.FirstOrDefault().UriValue));
                        itemReferenceValueType.ObjectReference = itemObjectReferenceType;
                        target.ReferenceValue.Add(itemReferenceValueType);
                    }
                    else if (itemRef.id.Equals("TIME_PERIOD", StringComparison.InvariantCultureIgnoreCase))
                    {
                        var itemReferenceValueType = new Org.Sdmx.Resources.SdmxMl.Schemas.V21.MetaData.Generic.ReferenceValueType();
                        itemReferenceValueType.id = itemRef.id;
                        var itemObjectReferenceType = new Org.Sdmx.Resources.SdmxMl.Schemas.V21.Common.ObjectReferenceType();
                        itemObjectReferenceType.URN = new List<Uri>();
                        itemObjectReferenceType.URN.Add(new Uri(itemRef.ObjectReference.URN.FirstOrDefault().UriValue));
                        itemReferenceValueType.ObjectReference = itemObjectReferenceType;
                        target.ReferenceValue.Add(itemReferenceValueType);
                    }
                }
            }

            return target;
        }

        private Org.Sdmx.Resources.SdmxMl.Schemas.V21.MetaData.Generic.AttributeSetType createAttributeset(AttributeSetType attributeSetType)
        {
            if (attributeSetType?.ReportedAttribute == null)
            {
                return null;
            }

            var attributeSet = new Org.Sdmx.Resources.SdmxMl.Schemas.V21.MetaData.Generic.AttributeSetType();

            attributeSet.ReportedAttribute = createAttributesetReported(attributeSetType.ReportedAttribute);

            return attributeSet;
        }

        private List<Org.Sdmx.Resources.SdmxMl.Schemas.V21.MetaData.Generic.ReportedAttributeType> createAttributesetReported(List<ReportedAttributeType> attributeSetTypes)
        {
            if (attributeSetTypes == null)
            {
                return null;
            }

            var resultList = new List<Org.Sdmx.Resources.SdmxMl.Schemas.V21.MetaData.Generic.ReportedAttributeType>();

            foreach (var itemAttr in attributeSetTypes)
            {
                var itemReportedAttributeType = new Org.Sdmx.Resources.SdmxMl.Schemas.V21.MetaData.Generic.ReportedAttributeType();
                itemReportedAttributeType.id = itemAttr.id;
                itemReportedAttributeType.value = itemAttr.value;
                itemReportedAttributeType.Annotations = createAnnotations(itemAttr.Annotations);
                itemReportedAttributeType.AttributeSet = createAttributeset(itemAttr.AttributeSet);

                if (itemAttr.Text != null)
                {
                    foreach (var itemText in itemAttr.Text)
                    {
                        if (itemText.Content.lang.Length != 2)
                        {
                            continue;
                        }
                        var itemTest = new Org.Sdmx.Resources.SdmxMl.Schemas.V21.Common.Text(new Org.Sdmx.Resources.SdmxMl.Schemas.V21.Common.TextType { TypedValue = itemText.Content.TypedValue, lang = itemText.Content.lang });
                        itemReportedAttributeType.Text.Add(itemTest);
                    }
                }



                //itemReportedAttributeType.StructuredText = new List<Org.Sdmx.Resources.SdmxMl.Schemas.V21.Common.StructuredText>();
                //foreach (var itemAtt in item.Text)
                //{
                //    itemReportedAttributeType.StructuredText.Add(new Org.Sdmx.Resources.SdmxMl.Schemas.V21.Common.StructuredText { 
                //    lang = itemAtt.lang,

                //    });
                //}

                resultList.Add(itemReportedAttributeType);
            }

            return resultList;
        }


        private Org.Sdmx.Resources.SdmxMl.Schemas.V21.Common.Annotations createAnnotations(RMDataProvider.Model.Annotations annotationsRm)
        {
            if (annotationsRm?.Annotation == null)
            {
                return null;
            }

            var annotations = new Org.Sdmx.Resources.SdmxMl.Schemas.V21.Common.Annotations();
            annotations.Annotation = new List<Org.Sdmx.Resources.SdmxMl.Schemas.V21.Common.AnnotationType>();
            foreach (var itemAnno in annotationsRm.Annotation)
            {
                if (itemAnno.id.Equals(MetadataSetType.ANNOTATION_KEY_METADATASET_MSD_AGENCY_ID, StringComparison.InvariantCultureIgnoreCase) ||
                    itemAnno.id.Equals(MetadataSetType.ANNOTATION_KEY_METADATASET_MSD_ID, StringComparison.InvariantCultureIgnoreCase) ||
                    itemAnno.id.Equals(MetadataSetType.ANNOTATION_KEY_METADATASET_MSD_VERSION_ID, StringComparison.InvariantCultureIgnoreCase))
                {
                    continue;
                }

                var mainItemAnnotationType = new Org.Sdmx.Resources.SdmxMl.Schemas.V21.Common.AnnotationType();
                mainItemAnnotationType.id = itemAnno.id;
                foreach (var itemText in itemAnno.AnnotationText)
                {
                    if (itemText.lang.Length != 2)
                    {
                        continue;
                    }
                    mainItemAnnotationType.AnnotationText.Add(new Org.Sdmx.Resources.SdmxMl.Schemas.V21.Common.TextType { TypedValue = itemText.TypedValue, lang = itemText.lang });
                }
                annotations.Annotation.Add(mainItemAnnotationType);
            }

            return annotations;
        }

        private string serializeSdmxFormat(IMetadataSet[] metadataSets)
        {
            var format = new SdmxJsonMetadataFormat();

            //Serializer
            var stream = new MemoryStream();
            IMetadataWriterEngine swe = new MetadataSetWriterEngineJsonV1(stream, format);

            if (metadataSets == null)
            {
                return "{}";
            }

            swe.WriteMetadataSet(null, metadataSets);

            var strJson = Encoding.UTF8.GetString(stream.ToArray());
            return strJson;
        }

        private IMetadata deserializeSdmxFormat(string strJson)
        {
            var format = new SdmxJsonMetadataFormat();

            Encoding encoding = Encoding.UTF8;
            MemoryReadableLocation mrl = new MemoryReadableLocation(encoding.GetBytes(strJson));


            var sdmxJsonMetadatasetsParserFactory = new List<IMetadataParsingFactory> { new SdmxJsonMetadatasetsParserFactory() };
            IMetadatasetsParsingManager metaParsing = new MetadatasetsParsingJsonManager(sdmxJsonMetadatasetsParserFactory);
            return metaParsing.BuildMetadataset(mrl, format);
        }

        private MetadataSetType convertSdmxObjectToSisterObject(IMetadata metadataSet, MetadataSetType metadataSetTypeOriginal = null)
        {
            var metadataSetSisterType = new MetadataSetType();

            var urn = metadataSet.Header.Structures.FirstOrDefault().Id;
            if (string.IsNullOrWhiteSpace(urn))
            {
                return null;
            }
            var substr = urn.Split('=')[1];
            var metadataFlowId = substr.Split(':')[1].Split('(')[0];
            var metadataFlowAgencyId = substr.Split(':')[0];
            var metadataFlowVersion = substr.Split('(')[1].Split(')')[0];

            metadataSetSisterType.addAnnotationValue(MetadataSetType.ANNOTATION_KEY_METADATASET_MSD_AGENCY_ID, metadataFlowAgencyId, "en");
            metadataSetSisterType.addAnnotationValue(MetadataSetType.ANNOTATION_KEY_METADATASET_MSD_ID, metadataFlowId, "en");
            metadataSetSisterType.addAnnotationValue(MetadataSetType.ANNOTATION_KEY_METADATASET_MSD_VERSION_ID, metadataFlowVersion, "en");

            var metadataSetSdmx = metadataSet.MetadataSet.FirstOrDefault();
            if (metadataSetSdmx == null)
            {
                return null;
            }

            if (metadataSetSdmx.Names != null)
            {
                metadataSetSisterType.Name = new List<RMDataProvider.Model.Name>();
                foreach (var item in metadataSetSdmx.Names)
                {
                    metadataSetSisterType.Name.Add(new RMDataProvider.Model.Name { lang = item.Locale, TypedValue = item.Value });
                }
            }

            createAnnotation(metadataSetSdmx.Annotations, metadataSetSisterType);

            metadataSetSisterType.setID = metadataSetSdmx.SetId;
            metadataSetSisterType.structureRef = metadataSetSdmx.MsdReference.TargetUrn.AbsoluteUri;
            metadataSetSisterType.reportingBeginDate = metadataSetSdmx?.ReportingBeginDate?.Date;
            metadataSetSisterType.reportingEndDate = metadataSetSdmx?.ReportingEndDate?.Date;
            metadataSetSisterType.publicationPeriod = metadataSetSdmx?.PublicationPeriod?.ToString();
            if (metadataSetSdmx?.PublicationYear?.Date != null)
            {
                metadataSetSisterType.publicationYear = (short)metadataSetSdmx.PublicationYear.Date.Year;
            }
            metadataSetSisterType.validFromDate = metadataSetSdmx?.ValidFromDate?.Date;
            metadataSetSisterType.validToDate = metadataSetSdmx?.ValidToDate?.Date;

            if (metadataSetSdmx.Reports != null)
            {
                metadataSetSisterType.Report = new List<ReportType>();
                foreach (var itemReport in metadataSetSdmx.Reports)
                {
                    var reportType = new ReportType();

                    reportType.id = itemReport.Id;

                    createAnnotation(itemReport.Annotations, reportType);

                    reportType.Target = new TargetType();
                    reportType.Target.id = itemReport.Target.Id;

                    if (itemReport.Target.ReferenceValues != null)
                    {
                        reportType.Target.ReferenceValue = new List<ReferenceValueType>();
                        foreach (var itemRef in itemReport.Target.ReferenceValues)
                        {
                            reportType.Target.ReferenceValue.Add(new ReferenceValueType
                            {
                                id = itemRef.Id,
                                ObjectReference = new RMDataProvider.Model.ObjectReferenceType
                                {
                                    Ref = null,
                                    URN = new List<XmlUri> { new XmlUri(itemRef?.IdentifiableReference?.TargetUrn?.AbsoluteUri) }
                                }
                            });
                        }
                    }

                    reportType.AttributeSet = createReportAttribute(itemReport.ReportedAttributes);

                    metadataSetSisterType.Report.Add(reportType);
                }
            }

            return metadataSetSisterType;
        }

        private AttributeSetType createReportAttribute(IList<IReportedAttributeObject> reportedAttributes)
        {
            if (reportedAttributes == null)
            {
                return null;
            }

            var attributeSet = new AttributeSetType();
            attributeSet.ReportedAttribute = new List<ReportedAttributeType>();
            foreach (var itemRepAttr in reportedAttributes)
            {
                var reportAttribute = new ReportedAttributeType();
                createAnnotation(itemRepAttr.Annotations, reportAttribute);
                reportAttribute.id = itemRepAttr.Id;

                if (itemRepAttr.MetadataText != null)
                {
                    foreach (var itemMetaText in itemRepAttr.MetadataText)
                    {
                        reportAttribute.AddText(itemMetaText.Value, itemMetaText.Locale);
                    }
                }


                attributeSet.ReportedAttribute.Add(reportAttribute);
            }

            return attributeSet;
        }

        private void createAnnotation(IList<IAnnotation> annotations, ReportedAttributeType reportAttributeSisterType)
        {
            if (annotations == null)
            {
                return;
            }

            foreach (var item in annotations)
            {
                foreach (var itemText in item.Text)
                {
                    reportAttributeSisterType.addAnnotationValue(item.Id, itemText.Value, itemText.Locale);
                }
            }
        }

        private void createAnnotation(IList<IAnnotation> annotations, MetadataSetType metadataSetSisterType)
        {
            if (annotations == null)
            {
                return;
            }

            foreach (var item in annotations)
            {
                foreach (var itemText in item.Text)
                {
                    metadataSetSisterType.addAnnotationValue(item.Id, itemText.Value, itemText.Locale);
                }
            }
        }

        private void createAnnotation(IList<IAnnotation> annotations, ReportType reportTypeSister)
        {
            if (annotations == null)
            {
                return;
            }

            foreach (var item in annotations)
            {
                foreach (var itemText in item.Text)
                {
                    reportTypeSister.addAnnotationValue(item.Id, itemText.Value, itemText.Locale);
                }
            }
        }

    }

    class MetadataSetCodeListAnnotationBody
    {
        public Dictionary<string, string> fieldInfo;
        public Dictionary<string, JObject> codelists;

        public MetadataSetCodeListAnnotationBody()
        {
            this.fieldInfo = new Dictionary<string, string>();
            this.codelists = new Dictionary<string, JObject>();
        }
    }

}
*/