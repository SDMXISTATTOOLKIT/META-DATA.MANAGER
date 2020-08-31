using System;
using System.Collections.Generic;
using System.IO;
using System.Configuration;
using System.Linq;
using System.Threading.Tasks;
using DataFactory;
using System.Xml.Serialization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using RMDataProvider.Model;
using RMManager.RMDataProvider;
using System.Xml;
using RMManager.RMDataProvider.Util;
using RMUtil;
using DM_API_WS.DTO;
using System.Text;
using Newtonsoft.Json;
using AuthCore.Model;
using AuthCore;
using Microsoft.Extensions.Options;
using System.Diagnostics;
using Infrastructure.STLogging.Interface;
using Infrastructure.STLogging.Factory;
using DataModel;

namespace DM_API_WS.Controllers
{
    /// <summary>
    /// RM API
    /// </summary>
    [Route("api/DMApi/RM")]
    [Produces("application/xml")]
    [ApiController]
    public class RMController : ControllerBase
    {
        readonly IUserData _userData;
        readonly IOptionsSnapshot <AuthAppOptions> _authAppConfig;
        readonly IOptionsSnapshot<CacheConfig> _cacheConfig;
        readonly ISTLogger _logger;

        /// <summary>
        /// The constructor.
        /// </summary>
        /// <param name="userData">User's data.</param>
        /// <param name="authAppConfig">Authentication configuration.</param>
        public RMController(IUserData userData, IOptionsSnapshot<AuthAppOptions> authAppConfig, IOptionsSnapshot<CacheConfig> cacheConfig)
        {
            _userData = userData;
            _authAppConfig = authAppConfig;
            _cacheConfig = cacheConfig;
            _logger = STLoggerFactory.Logger;
        }

        /// <summary>
        /// Searches MetadataSet id by Dataflow URN.
        /// </summary>
        /// <param name="dataflowURN">DataFlow URN</param>
        /// <returns>MetadataSet id found</returns>
        [HttpGet("SearchMetadataSetIdByDataflowURN/{dataflowURN}")]
        public List<int> SearchMetadataSetIdByDataflowURN(string dataflowURN)
        {
            IRMDataProvider rmProvider = new RMManager.RMDataProvider.RMDataProvider();
            return rmProvider.SearchMetadataSetIdByDataflowURN(dataflowURN);
        }

        /// <summary>
        /// Searches all Reports with parameters.
        /// </summary>
        /// <param name="dataflowURN">MetadataFlow URN</param>
        /// <param name="identifierValue">Target Identifier value</param>
        /// <param name="targetType">Target Identifier type, values [Metadataflow,Dataflow]</param>
        /// <returns>List of Reports found</returns>
        [HttpGet("SearchReportByDataflow/{dataflowURN}/{identifierValue}/{targetType}")]
        public List<ReportType> SearchReportByDataflow(string dataflowURN, string identifierValue, string targetType)
        {
            IRMDataProvider rmProvider = new RMManager.RMDataProvider.RMDataProvider();
            IList<int> reportIdFound = rmProvider.SearchReportId(dataflowURN, identifierValue, targetType);
            List<ReportType> reportList = new List<ReportType>();
            foreach (int reportId in reportIdFound)
            {
                reportList.Add(rmProvider.GetReport(null, ""+reportId, true));
            }
            return reportList;
        }

        /// <summary>
        /// Searches all Reports with parameters.
        /// </summary>
        /// <param name="idMetadataSet">MetadataSet id</param>
        /// <param name="identifierValue">Target Identifier value</param>
        /// <param name="targetType">Target Identifier type, values [Metadataflow,Dataflow]</param>
        /// <returns>List of Reports id found</returns>
        [HttpGet("SearchReportIds/{idMetadataSet}/{identifierValue}/{targetType}")]
        public List<int> SearchReportIds(int idMetadataSet, string identifierValue, string targetType)
        {
            IRMDataProvider rmProvider = new RMManager.RMDataProvider.RMDataProvider();
            List<int> reportIdFound = (List<int>)rmProvider.SearchReportId(idMetadataSet, identifierValue, targetType);
            return reportIdFound;
        }

        // GET: api/RM/getReport/1/target_id/IT1/1.0/MetadataFlow
        /// <summary>
        /// Searches all Reports with parameters.
        /// </summary>
        /// <param name="idMetadataSet">MetadataSet id</param>
        /// <param name="identifierValue">Target Identifier value</param>
        /// <param name="targetType">Target Identifier type, values [Metadataflow,Dataflow]</param>
        /// <returns>List of Reports found</returns>
        [HttpGet("SearchReport/{idMetadataSet}/{identifierValue}/{targetType}")]
        public List<ReportType> SearchReport(int idMetadataSet, string identifierValue, string targetType)
        {
            IRMDataProvider rmProvider = new RMManager.RMDataProvider.RMDataProvider();
            IList<int> reportIdFound = rmProvider.SearchReportId(idMetadataSet, identifierValue, targetType);
            List<ReportType> reportList = new List<ReportType>();
            foreach (int reportId in reportIdFound)
            {
                reportList.Add(rmProvider.GetReport(null, ""+reportId, true));
            }
            return reportList;
        }

        /// <summary>
        /// Searches all Reports with parameters.
        /// </summary>
        /// <param name="idMetadataSet">MetadataSet id</param>
        /// <param name="targetType">Target Identifier type, values [Metadataflow,Dataflow]</param>
        /// <param name="identifierValue">Target Identifier</param>
        /// <returns>List of Reports found</returns>
        [HttpGet("SearchReportByParams")]
        public List<ReportType> SearchReportByParams(int idMetadataSet, string targetType, string identifierValue)
        {
            IRMDataProvider rmProvider = new RMManager.RMDataProvider.RMDataProvider();
            List<ReportType> reports = (List<ReportType>)rmProvider.SearchReportByParams(idMetadataSet, targetType, identifierValue, false);
            return reports;
        }

        /// <summary>
        /// Searches a Report by id
        /// </summary>
        /// <param name="reportId">Report id</param>
        /// <returns>Report found</returns>
        [HttpGet("GetReport/{reportId}")]
        public ReportType GetReport(int reportId)
        {
            IRMDataProvider rmProvider = new RMManager.RMDataProvider.RMDataProvider();
            ReportType report = rmProvider.GetReport(null, ""+reportId, true);
            return report;
        }

        /// <summary>
        /// Deletes a report and all related data.
        /// </summary>
        /// <param name="reportId">Report id</param>
        /// <param name="msd">urn msd</param>
        /// <returns>True if the operation was successful, false otherwise</returns>
        [HttpDelete("DeleteReport/{reportId}/{msd?}")]
        public JsonResult DeleteReport(int reportId, string msd=null)
        {
            IRMDataProvider rmProvider = new RMManager.RMDataProvider.RMDataProvider();

            int metadatasetId = rmProvider.GetMetadatasetIdFromReportId(reportId);
            var metadataSet = rmProvider.GetMetadataset(""+metadatasetId, false, true, true);
            string reportRefId = null;
            foreach (ReportType report in metadataSet.Report)
            {
                int reportKeyId = Convert.ToInt32(report.getAnnotationValue(ReportType.ANNOTATION_KEY_REPORT_ID));
                if (reportKeyId==reportId)
                {
                    reportRefId = report.id;
                    break;
                }
            }
            if (!checkPermission(metadataSet, reportRefId, msd))
            {
                HttpContext.Response.StatusCode = 403; //Forbidden
                return new JsonResult("");
            }

            return new JsonResult(rmProvider.DeleteReport(reportId));
        }

        /// <summary>
        /// Updates the Report with input data and MSD file specified.
        /// </summary>
        /// <param name="metadataFlowId">MetadataFlow id</param>
        /// <param name="rmParams">Report input data</param>
        /// <param name="msd">urn msd</param>
        /// <returns>Report updated</returns>
        [HttpPut("UpdateReport/{MetadataFlowId}/{msd?}")]
        public ReportType UpdateReport([FromBody] RMParam rmParams, int metadataFlowId, string msd=null)
        {
            IRMDataProvider rmProvider = new RMManager.RMDataProvider.RMDataProvider(rmParams.DCAT_IsMultilingual, rmParams.CustomIsPresentational);
            MetadataSetType metadataSet = RMUtility.Deserialize<MetadataSetType>(rmParams.metadata);

            if (!checkPermission(metadataSet, null, msd))
            {
                HttpContext.Response.StatusCode = 403; //Forbidden
                return null;
            }

            XmlDocument xDomMSD = new XmlDocument();
            xDomMSD.InnerXml = rmParams.msd;

            return rmProvider.UpdateReport(metadataFlowId, metadataSet.Report[0], xDomMSD);
        }

        /// <summary>
        /// Updates the Report stated.
        /// </summary>
        /// <param name="metadataSetId">MetadataSet id</param>
        /// <param name="reportId">Report id</param>
        /// <param name="rmParams">Input data</param>
        /// <param name="msd">msd</param>
        /// <returns>True if Report updated, false otherwise</returns>
        [HttpPut("UpdateReportState/{metadataSetId}/{reportId}/{msd?}")]
        [Produces("application/json")]
        public JsonResult UpdateReportState([FromBody] RMParam rmParams, string metadataSetId, string reportId, string msd=null)
        {
            IRMDataProvider rmProvider = new RMManager.RMDataProvider.RMDataProvider();
            MetadataSetType metadataSet = rmProvider.GetMetadataset(metadataSetId, false, false, false);
            if (!checkPermission(metadataSet, reportId, msd))
            {
                HttpContext.Response.StatusCode = 403; //Forbidden
                return new JsonResult("");
            }
            int metadataSetKeyId = Convert.ToInt32(metadataSet.getAnnotationValue(MetadataSetType.ANNOTATION_KEY_METADATASET_ID));
            int reportKeyId = 0;
            string reportState = null;
            foreach (ReportType report in metadataSet.Report)
            {
                if (reportId == null || report.id.Equals(reportId)){
                    reportKeyId = Convert.ToInt32(report.getAnnotationValue(ReportType.ANNOTATION_KEY_REPORT_ID));
                    reportState = report.getAnnotationValue(ReportType.ANNOTATION_KEY_REPORT_STATE_NAME);
                    break;
                }
            }

            if (reportState != null && reportState.Equals(ReportType.REPORT_STATE_DRAFT_VALUE) && rmParams.reportState.Equals(ReportType.REPORT_STATE_PUBLISHED_VALUE))
            {
                return new JsonResult("Report in "+ ReportType.REPORT_STATE_DRAFT_VALUE + " status, publication not possible!");
            }

            return new JsonResult(rmProvider.UpdateReportState(metadataSetKeyId, reportKeyId, rmParams.reportState));
        }

        /// <summary>
        /// Creates a new Report with input data and MSD file specified.
        /// </summary>
        /// <param name="metadataSetId">MetadataSet id</param>
        /// <param name="rmParams">Report input data</param>
        /// <param name="msd">urn msd</param>
        /// <returns>Id of Report created</returns>
        [HttpPost("CreateReport/{metadataSetId}/{msd?}")]
        public JsonResult CreateReport([FromBody] RMParam rmParams, int metadataSetId, string msd=null)
        {
            IRMDataProvider rmProvider = new RMManager.RMDataProvider.RMDataProvider(rmParams.DCAT_IsMultilingual, rmParams.CustomIsPresentational);
            MetadataSetType metadataSet = RMUtility.Deserialize<MetadataSetType>(rmParams.metadata);

            if (!checkPermission(metadataSet, null, msd))
            {
                HttpContext.Response.StatusCode = 403; //Forbidden
                return new JsonResult("");
            }

            ReportType report = metadataSet.Report[0];

            XmlDocument xDomMSD = new XmlDocument();
            xDomMSD.InnerXml = rmParams.msd;

            return new JsonResult(rmProvider.CreateReport(metadataSetId, report, xDomMSD));
        }

        /// <summary>
        /// Searches all the ReportedAttributes of a Report.
        /// </summary>
        /// <param name="reportId">Report id</param>
        /// <returns>Return an AttributeSet object with attribuites found</returns>
        [HttpGet("GetReportedAttribute/{reportId}")]
        public AttributeSetType GetReportedAttribute(int reportId)
        {
            IRMDataProvider rmProvider = new RMManager.RMDataProvider.RMDataProvider();
            AttributeSetType allAttributed = rmProvider.GetReportedAttributeSet(reportId);
            return allAttributed;
        }

        /// <summary>
        /// Deletes a MetadataSet and all related data.
        /// </summary>
        /// <param name="metadataSetId">MetadataSet id</param>
        /// <returns>True if the operation was successful, false otherwise</returns>
        [HttpDelete("DeleteMetadataSet/{metadataSetId}")]
        public JsonResult DeleteMetadataSet(string metadataSetId)
        {
            IRMDataProvider rmProvider = new RMManager.RMDataProvider.RMDataProvider();

            var metadataSet = rmProvider.GetMetadataset(metadataSetId, true, false, true);
            int metadataSetKeyId = Convert.ToInt32(metadataSet.getAnnotationValue(MetadataSetType.ANNOTATION_KEY_METADATASET_ID));
            string metadataFlowId = metadataSet.getAnnotationValue(MetadataSetType.ANNOTATION_KEY_METADATASET_FLOW_ID);
            string metadataFlowAgencyId = metadataSet.getAnnotationValue(MetadataSetType.ANNOTATION_KEY_METADATASET_FLOW_AGENCY_ID);
            string metadataFlowVersion = metadataSet.getAnnotationValue(MetadataSetType.ANNOTATION_KEY_METADATASET_FLOW_VERSION_ID);

            if (!Utility.Utils.HaveOwnershipMetadataFlow(_userData, $"{metadataFlowId}+{metadataFlowAgencyId}+{metadataFlowVersion}"))
            {
                HttpContext.Response.StatusCode = 403; //Forbidden
                return new JsonResult("");
            }

            return new JsonResult(rmProvider.DeleteMetadataSet(metadataSetKeyId));
        }

        /// <summary>
        /// Creates a new MetadataSet with input data and MSD file specified.
        /// </summary>
        /// <param name="rmParams">MetadataSet input data</param>
        /// <returns>Id of MetadataSet created</returns>
        [HttpPost("CreateMetadataSet")]
        public JsonResult CreateMetadataSet([FromBody] RMParam rmParams)
        {
            IRMDataProvider rmProvider = new RMManager.RMDataProvider.RMDataProvider(rmParams.DCAT_IsMultilingual, rmParams.CustomIsPresentational);

            //Stream s = RMUtility.GenerateStreamFromString(rmParams.metadata);
            //XmlSerializer serializer = new XmlSerializer(typeof(MetadataSetType));
            //MetadataSetType metadataSet = (MetadataSetType)serializer.Deserialize(s);
            MetadataSetType metadataSet = RMUtility.Deserialize<MetadataSetType>(rmParams.metadata);

            XmlDocument xDomMSD = new XmlDocument();
            xDomMSD.InnerXml = rmParams.msd;

            string metadataFlowId = metadataSet.getAnnotationValue(MetadataSetType.ANNOTATION_KEY_METADATASET_FLOW_ID);
            string metadataFlowAgencyId = metadataSet.getAnnotationValue(MetadataSetType.ANNOTATION_KEY_METADATASET_FLOW_AGENCY_ID);
            string metadataFlowVersion = metadataSet.getAnnotationValue(MetadataSetType.ANNOTATION_KEY_METADATASET_FLOW_VERSION_ID);

            if (!Utility.Utils.HaveOwnershipMetadataFlow(_userData, $"{metadataFlowId}+{metadataFlowAgencyId}+{metadataFlowVersion}"))
            {
                HttpContext.Response.StatusCode = 403; //Forbidden
                return new JsonResult("");
            }

            var result = rmProvider.CreateMetadataSet(metadataSet, xDomMSD);

            //var resultCheckAuthDb = new AuthManager(_authAppConfig).AddMetadataset(_userData.Username, result.ToString(), true);

            return new JsonResult(result);
        }

        /// <summary>
        /// Updates the MetadataSet with input data and MSD file specified.
        /// </summary>
        /// <param name="rmParams">MetadataSet input data.</param>
        /// <returns>MetadataSet updated</returns>
        [Produces("application/xml")]
        [HttpPut("UpdateMetadataSet")]
        public MetadataSetType UpdateMetadataSet([FromBody] RMParam rmParams)
        {
            //Stream s = RMUtility.GenerateStreamFromString(rmParams.metadata);
            //XmlSerializer serializer = new XmlSerializer(typeof(MetadataSetType));
            //MetadataSetType metadataSet = (MetadataSetType) serializer.Deserialize(s);
            MetadataSetType metadataSet = RMUtility.Deserialize<MetadataSetType>(rmParams.metadata);

            string metadataFlowId = metadataSet.getAnnotationValue(MetadataSetType.ANNOTATION_KEY_METADATASET_FLOW_ID);
            string metadataFlowAgencyId = metadataSet.getAnnotationValue(MetadataSetType.ANNOTATION_KEY_METADATASET_FLOW_AGENCY_ID);
            string metadataFlowVersion = metadataSet.getAnnotationValue(MetadataSetType.ANNOTATION_KEY_METADATASET_FLOW_VERSION_ID);

            //TODO è corretto prendere setID
            if (!Utility.Utils.HaveOwnershipMetadataFlow(_userData, $"{metadataFlowId}+{metadataFlowAgencyId}+{metadataFlowVersion}"))
            {
                HttpContext.Response.StatusCode = 403; //Forbidden
                return null;
            }

            IRMDataProvider rmProvider = new RMManager.RMDataProvider.RMDataProvider(rmParams.DCAT_IsMultilingual, rmParams.CustomIsPresentational);

            XmlDocument xDomMSD = new XmlDocument();
            xDomMSD.InnerXml = rmParams.msd;

            return rmProvider.UpdateMetadataSet(metadataSet, xDomMSD);
        }

        //GET api/RM/GetMetadataSet/1
        /// <summary>
        /// Searches a MetadataSet by id.
        /// </summary>
        /// <param name="metadataSetId">MetadataSet id</param>
        /// <param name="excludeReport">True for not retrieve report data</param>
        /// <param name="withAttributes">False for not retrieve attribute data</param>
        /// <param name="dbId">True for use Id column, otherwise ReferenceId column</param>
        /// <returns>MetadataSet found</returns>
        [Produces("application/xml")]
        [HttpGet("GetMetadataSet/{metadataSetId}")]
        public MetadataSetType GetMetadataSet(string metadataSetId, bool excludeReport = false, bool withAttributes = true, bool dbId = false)
        {
            IRMDataProvider rmProvider = new RMManager.RMDataProvider.RMDataProvider();
            MetadataSetType mdataSet = rmProvider.GetMetadataset(metadataSetId, excludeReport, withAttributes, dbId);

            return mdataSet;
        }

        //GET api/RM/GetMetadataSetList
        /// <summary>
        /// Searches all stored MetadataSets.
        /// </summary>
        /// <returns>List of MetadataSet found</returns>
        [HttpGet("GetMetadataSetList")]
        public List<MetadataSetType> GetMetadataSetList()
        {
            IRMDataProvider rmProvider = new RMManager.RMDataProvider.RMDataProvider();
            List<MetadataSetType> mdataSetList = rmProvider.GetMetadataSetList(true);
            return mdataSetList;
        }

        /// <summary>
        /// Returns a simple Metadataset including no Reports
        /// </summary>
        /// <param name="metadataSetId"></param>
        /// <returns></returns>
        [HttpGet("GetSimpleMetadataSet/{metadataSetId}")]
        public MetadataSetType GetSimpleMetadataSet(string metadataSetId)
        {
            IRMDataProvider rmProvider = new RMManager.RMDataProvider.RMDataProvider();
            MetadataSetType mdataSet = rmProvider.GetSimpleMetadataset(metadataSetId);
            return mdataSet;
        }

        private bool checkPermission(MetadataSetType metadataSet, string reportId, string msd)
        {
            var isDcat = false;
            var dataflowId = "";
            var dataflowAgencyId = "";
            var dataflowVersion = "";

            if (metadataSet.structureRef != null && metadataSet.structureRef.Equals(msd, StringComparison.InvariantCulture))
            {
                isDcat = true;
                foreach (var report in metadataSet.Report)
                {
                    if (reportId == null || report.id.Equals(reportId))
                    {
                        if (report.Target.id.Equals("DATAFLOW_TARGET_ID", StringComparison.InvariantCultureIgnoreCase))
                        {
                            foreach (var trg in report.Target.ReferenceValue)
                            {
                                if (trg.id.Equals("DATASET_IDENTIFIER", StringComparison.InvariantCultureIgnoreCase))
                                {
                                    if (trg.ObjectReference.Ref != null)
                                    {
                                        dataflowId = trg.ObjectReference.Ref.id;
                                        dataflowAgencyId = trg.ObjectReference.Ref.agencyID;
                                        dataflowVersion = trg.ObjectReference.Ref.version;
                                    }
                                    else
                                    {
                                        var urn = trg.ObjectReference.URN[0].UriValue;
                                        var substr = urn.Split('=')[1];
                                        dataflowId = substr.Split(':')[1].Split('(')[0];
                                        dataflowAgencyId = substr.Split(':')[0];
                                        dataflowVersion = substr.Split('(')[1].Split(')')[0];
                                    }

                                    break;
                                }
                            }
                            break;
                        }
                    }
                }
            }

            if (!isDcat || dataflowId == "" || dataflowAgencyId == "" || dataflowVersion == "")
            {
                string metadataFlowId = metadataSet.getAnnotationValue(MetadataSetType.ANNOTATION_KEY_METADATASET_FLOW_ID);
                string metadataFlowAgencyId = metadataSet.getAnnotationValue(MetadataSetType.ANNOTATION_KEY_METADATASET_FLOW_AGENCY_ID);
                string metadataFlowVersion = metadataSet.getAnnotationValue(MetadataSetType.ANNOTATION_KEY_METADATASET_FLOW_VERSION_ID);

                if (!Utility.Utils.HaveOwnershipMetadataFlow(_userData, $"{metadataFlowId}+{metadataFlowAgencyId}+{metadataFlowVersion}"))
                {
                    return false;
                }
            }
            else
            {
                if (!Utility.Utils.HaveOwnershipDataflow(_userData, $"{dataflowId}+{dataflowAgencyId}+{dataflowVersion}"))
                {
                    return false;
                }
            }

            return true;
        }
    }
}
