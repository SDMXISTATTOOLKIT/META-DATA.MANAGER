using API.DTO;
using AuthCore.Utils;
using BusinessLogic;
using DataModel;
using DDB.Entities;
using Infrastructure.STLogging.Factory;
using Infrastructure.STLogging.Interface;
using Infrastructure.Utils;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.StaticFiles;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json;
using NSI.Entities;
using Org.Sdmxsource.Sdmx.Api.Constants;
using System;
using System.Collections.Generic;
using System.IO;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using Utility;

namespace CrudApi.Controllers
{
    /// <summary>
    /// Node API
    /// </summary>
    [Route("/")]
    [EnableCors("CustomPolicy")]
    [ApiController]
    public class NodeController : ControllerBase
    {
        BusinessLogic.Controller.BusinessLogic _businessLogic;
        readonly IHttpContextAccessor _contextAccessor;
        readonly NodeConfig _nodeConfiguration;
        readonly IConfiguration _configuration;
        readonly ISTLogger _logger;

        /// <summary>
        /// Constructor
        /// </summary>
        public NodeController(IMemoryCache memoryCache, IHttpContextAccessor contextAccessor, IConfiguration configuration)
        {
            _contextAccessor = contextAccessor;
            _nodeConfiguration = new ConfigManager(configuration, memoryCache, _contextAccessor).GetConfiguration();
            _businessLogic = new BusinessLogic.Controller.BusinessLogic(_nodeConfiguration, configuration, memoryCache, _contextAccessor);
            _configuration = configuration;
            _logger = STLoggerFactory.Logger;
        }

        #region READ

        /// <summary>
        /// Gets a Agency Scheme (if all params are null returns all)
        /// </summary>
        /// <param name="id">Artefact id.</param>
        /// <param name="agencyID">Artefact agency.</param>
        /// <param name="version">Artefact version.</param>
        /// <param name="refDetail">reference detail.</param>
        /// <returns>CategoryScheme</returns>
        [HttpGet("agencyScheme/{refDetail?}")]
        [HttpGet("agencyScheme/{id}/{agencyID}/{version}/{refDetail?}")]
        public ActionResult<string> GetAgencyScheme(string id, string agencyID, string version, StructureReferenceDetailEnumType refDetail = StructureReferenceDetailEnumType.None)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            string res;

            if (id != null && agencyID != null && version != null)
            {
                res = _businessLogic.GetSdmxStructure(SdmxStructureEnumType.AgencyScheme, id, agencyID, version, refDetail);
            }
            else
            {
                res = _businessLogic.GetSdmxStructure(SdmxStructureEnumType.AgencyScheme, null, null, null, refDetail);
            }

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            return res;
        }

        /// <summary>
        /// Gets a Category Scheme (if all params are null returns all)
        /// </summary>
        /// <param name="id">Artefact id.</param>
        /// <param name="agencyID">Artefact agency.</param>
        /// <param name="version">Artefact version.</param>
        /// <param name="refDetail">reference detail.</param>
        /// <returns>CategoryScheme</returns>
        [HttpGet("categoryScheme/{refDetail?}")]
        [HttpGet("categoryScheme/{id}/{agencyID}/{version}/{refDetail?}")]
        public ActionResult<string> GetCategoryScheme(string id, string agencyID, string version, StructureReferenceDetailEnumType refDetail = StructureReferenceDetailEnumType.None)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            string res;

            if (id != null && agencyID != null && version != null)
            {
                res = _businessLogic.GetSdmxStructure(SdmxStructureEnumType.CategoryScheme, id, agencyID, version, refDetail);
            }
            else
            {
                res = _businessLogic.GetSdmxStructure(SdmxStructureEnumType.CategoryScheme, null, null, null, refDetail);
            }

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            return res;
        }

        /// <summary>
        /// Gets a Concept Scheme (if all params are null returns all)
        /// </summary>
        /// <param name="id">Artefact id.</param>
        /// <param name="agencyID">Artefact agency.</param>
        /// <param name="version">Artefact version.</param>
        /// <returns>ConceptScheme</returns>
        [HttpGet("conceptScheme/{id?}/{agencyID?}/{version?}")]
        public ActionResult<string> GetConceptScheme(string id, string agencyID, string version)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            string res;

            if (id != null && agencyID != null && version != null)
            {
                res = _businessLogic.GetSdmxStructure(SdmxStructureEnumType.ConceptScheme, id, agencyID, version);
            }
            else
            {
                res = _businessLogic.GetSdmxStructure(SdmxStructureEnumType.ConceptScheme, null, null, null);
            }

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            return res;
        }

        /// <summary>
        /// Gets a Codelist (if all params are null returns all)
        /// </summary>
        /// <param name="id">Artefact id.</param>
        /// <param name="agencyID">Artefact agency.</param>
        /// <param name="version">Artefact version.</param>
        /// <param name="numPage">number of page, 1 if null</param>
        /// <param name="pageSize">page size, unlimited if null or -1</param>
        /// <returns>Codelist</returns>
        [HttpGet("codelist/{id?}/{agencyID?}/{version?}/{numPage?}/{pageSize?}")]
        public ActionResult<string> GetCodelist(string id, string agencyID, string version, int? numPage, int? pageSize)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            string res;

            int valueNumPage = numPage.HasValue ? numPage.Value : 1;
            int valuePageSize = pageSize.HasValue ? pageSize.Value : -1;

            if (id != null && agencyID != null && version != null)
            {
                res = _businessLogic.GetSdmxStructure(SdmxStructureEnumType.CodeList, id, agencyID, version, valueNumPage, valuePageSize);
            }
            else
            {
                res = _businessLogic.GetSdmxStructure(SdmxStructureEnumType.CodeList, null, null, null, valueNumPage, valuePageSize);
            }

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            return res;
        }

        /// <summary>
        /// Gets a Dataflow (if all params are null returns all)
        /// </summary>
        /// <param name="id">Artefact id.</param>
        /// <param name="agencyID">Artefact agency.</param>
        /// <param name="version">Artefact version.</param>
        /// <returns>Dataflow</returns>
        [HttpGet("dataflow/{id?}/{agencyID?}/{version?}")]
        public ActionResult<string> GetDataflow(string id, string agencyID, string version)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            string res;

            if (id != null && agencyID != null && version != null)
            {
                res = _businessLogic.GetSdmxStructure(SdmxStructureEnumType.Dataflow, id, agencyID, version);
            }
            else
            {
                res = _businessLogic.GetSdmxStructure(SdmxStructureEnumType.Dataflow, null, null, null);
            }

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            return res;
        }

        /// <summary>
        /// Gets a ContentConstraint (if all params are null returns all)
        /// </summary>
        /// <param name="id">Artefact id.</param>
        /// <param name="agencyID">Artefact agency.</param>
        /// <param name="version">Artefact version.</param>
        /// <returns>ContentConstraint</returns>
        [HttpGet("GetContentConstraint/{id?}/{agencyID?}/{version?}")]
        public ActionResult<string> GetContentConstraint(string id, string agencyID, string version)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            string res;

            if (id != null && agencyID != null && version != null)
            {
                res = _businessLogic.GetSdmxStructure(SdmxStructureEnumType.ContentConstraint, id, agencyID, version);
            }
            else
            {
                res = _businessLogic.GetSdmxStructure(SdmxStructureEnumType.ContentConstraint, null, null, null);
            }

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            return res;
        }

        /// <summary>
        /// Gets a Data Provider Scheme (if all params are null returns all)
        /// </summary>
        /// <param name="id">Artefact id.</param>
        /// <param name="agencyID">Artefact agency.</param>
        /// <param name="version">Artefact version.</param>
        /// <returns></returns>
        [HttpGet("GetDataProviderScheme/{id?}/{agencyID?}/{version?}")]
        public ActionResult<string> GetDataProviderScheme(string id, string agencyID, string version)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            string res;

            if (id != null && agencyID != null && version != null)
            {
                res = _businessLogic.GetSdmxStructure(SdmxStructureEnumType.DataProviderScheme, id, agencyID, version);
            }
            else
            {
                res = _businessLogic.GetSdmxStructure(SdmxStructureEnumType.DataProviderScheme, null, null, null);
            }

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            return res;
        }

        /// <summary>
        /// Gets a Hierarchical Codelist (if all params are null returns all)
        /// </summary>
        /// <param name="id">Artefact id.</param>
        /// <param name="agencyID">Artefact agency.</param>
        /// <param name="version">Artefact version.</param>
        /// <returns></returns>
        [HttpGet("GetHierarchicalCodelist/{id?}/{agencyID?}/{version?}")]
        public ActionResult<string> GetHierarchicalCodelist(string id, string agencyID, string version)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            string res;

            if (id != null && agencyID != null && version != null)
            {
                res = _businessLogic.GetSdmxStructure(SdmxStructureEnumType.HierarchicalCodelist, id, agencyID, version);
            }
            else
            {
                res = _businessLogic.GetSdmxStructure(SdmxStructureEnumType.HierarchicalCodelist, null, null, null);
            }

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            return res;
        }

        /// <summary>
        /// Gets a Data Consumer Scheme (if all params are null returns all)
        /// </summary>
        /// <param name="id">Artefact id.</param>
        /// <param name="agencyID">Artefact agency.</param>
        /// <param name="version">Artefact version.</param>
        /// <returns></returns>
        [HttpGet("GetDataConsumerScheme/{id?}/{agencyID?}/{version?}")]
        public ActionResult<string> GetDataConsumerScheme(string id, string agencyID, string version)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            string res;

            if (id != null && agencyID != null && version != null)
            {
                res = _businessLogic.GetSdmxStructure(SdmxStructureEnumType.DataConsumerScheme, id, agencyID, version);
            }
            else
            {
                res = _businessLogic.GetSdmxStructure(SdmxStructureEnumType.DataConsumerScheme, null, null, null);
            }

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            return res;
        }

        /// <summary>
        /// Gets a Dsd (if all params are null returns all)
        /// </summary>
        /// <param name="id">Artefact id.</param>
        /// <param name="agencyID">Artefact agency.</param>
        /// <param name="version">Artefact version.</param>
        /// <param name="filterCustom">true in case of custom filter</param>
        /// <returns>Dsd</returns>
        [HttpGet("dsd/{id?}/{agencyID?}/{version?}")]
        [HttpGet("dsd/{filterCustom?}")]
        public ActionResult<string> GetDsd(string id, string agencyID, string version, bool filterCustom = false)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            string res;

            if (id != null && agencyID != null && version != null)
            {
                res = _businessLogic.GetSdmxStructure(SdmxStructureEnumType.Dsd, id, agencyID, version);
            }
            else
            {
                if (!filterCustom)
                    res = _businessLogic.GetSdmxStructure(SdmxStructureEnumType.Dsd, null, null, null);
                else
                    res = _businessLogic.GetDsdNoCustom();
            }

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            return res;
        }

        /// <summary>
        /// Gets all Dsd used in DDB
        /// </summary>
        /// <returns>Dsd</returns>
        [HttpGet("dsdUsedInDdb")]
        public ActionResult<List<ArtefactIdentity>> GetDsdUsedInDdb()
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            var result = _businessLogic.GetDsdUsedInDdb();

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            return result;
        }

        /// <summary>
        /// Gets a Categorisation (if all params are null returns all)
        /// </summary>
        /// <param name="id">Artefact id.</param>
        /// <param name="agencyID">Artefact agency.</param>
        /// <param name="version">Artefact version.</param>
        /// <param name="refDetail">reference detail.</param>
        /// <returns>Categorisation</returns>
        [HttpGet("categorisation/{refDetail?}")]
        [HttpGet("categorisation/{id}/{agencyID}/{version}/{refDetail?}")]
        public ActionResult<string> GetCategorisation(string id, string agencyID, string version, StructureReferenceDetailEnumType refDetail = StructureReferenceDetailEnumType.None)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            string res;

            if (id != null && agencyID != null && version != null)
            {
                res = _businessLogic.GetSdmxStructure(SdmxStructureEnumType.Categorisation, id, agencyID, version, refDetail);
            }
            else
            {
                res = _businessLogic.GetSdmxStructure(SdmxStructureEnumType.Categorisation, null, null, null, refDetail);
            }

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            return res;
        }


        /// <summary>
        /// Gets a Cube (if id is null retruns all)
        /// </summary>
        /// <param name="id">Id.</param>
        /// <returns>Cube</returns>
        [HttpGet("cube/{id?}")]
        public ActionResult<string> GetCube(int? id)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            string res = _businessLogic.GetCube(id);

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            return res;
        }

        /// <summary>
        /// Gets the list of available cubes without filtering on permissions
        /// </summary>
        /// <returns>The list of available cubes.</returns>
        [HttpGet("cubesNoFilter")]
        public ActionResult<string> GetAvailableCubesNoFilter()
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            string res = _businessLogic.GetAvailableCubesNoFilter();

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            return res;
        }

        /// <summary>
        /// Gets the Dcs
        /// </summary>
        /// <returns>Dcs</returns>
        [HttpGet("dcs")]
        public ActionResult<string> GetDCS()
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            string res = _businessLogic.GetDCS();

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            return res;
        }

        /// <summary>
        /// Gets a FileMapping (if id is null retruns all)
        /// </summary>
        /// <returns>FileMapping</returns>
        [HttpGet("fileMapping/{id?}")]
        public ActionResult<string> GetFileMapping(int? id)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            string res = _businessLogic.GetFileMapping(id);

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            return res;
        }

        /// <summary>
        /// Gets a Dataflow (if id is null retruns all)
        /// </summary>
        /// <param name="id">Id.</param>
        /// <returns>Dataflow</returns>
        [HttpGet("ddbDataflow/{id?}")]
        public ActionResult<string> GetDDBDataflow(int? id)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            string res = _businessLogic.GetDDBDataflow(id);

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            return res;
        }

        /// <summary>
        /// Gets MA Entity of a given type (if id is null retruns all)
        /// </summary>
        /// <param name="type">Entity type.</param>
        /// <param name="id">id.</param>
        /// <returns>Entity</returns>
        [HttpGet("entity/{type}/{id?}")]
        public ActionResult<string> GetMAEntity(string type, int? id)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            string res = _businessLogic.GetMAEntity(type, id);

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            return res;
        }

        /// <summary>
        /// Returns the header for the given dataflow
        /// </summary>
        /// <param name="id">The id of the dataflow.</param>
        /// <param name="agency">The agency of the dataflow.</param>
        /// <param name="version">The version of the dataflow.</param>
        /// <returns></returns>
        [HttpGet("getDfHeader/{id}/{agency}/{version}")]
        public ActionResult<string> GetDfHeader(string id, string agency, string version)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            string res = _businessLogic.GetDfHeader(id, agency, version);

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            return res;
        }

        /// <summary>
        /// Download DataFlow in production
        /// </summary>
        /// <param name="ddbDataflow">The dataflow..</param>
        /// <param name="format">format (genericdata, genericdata20, jsondata, structurespecificdata, csv, rdf, compactdata20, edidata, crosssectionaldata, customcsv)</param>
        /// <param name="observation">observation</param>
        /// <param name="zipped">return zipped file</param>
        /// <param name="separator">set separator for csv</param>
        /// <param name="delimiter">set delimiter for csv</param>
        /// <returns>Dataflow</returns>
        [HttpPost("downloadDataflow/{format}/{zipped?}/{separator?}/{delimiter?}")]
        public async Task<IActionResult> DownloadDDBDataflow([FromBody] DDBDataflow ddbDataflow, string format, string separator = ";", string delimiter = "", bool zipped = false, string observation = "")
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            _logger.Log($"Controller start DownloadDDBDataflow: id:{ddbDataflow.IDDataflow}\tformat:{format}\tseparator:{separator}\tdelimiter:{delimiter}\tzipped:{zipped}\tobservation:{observation}", Infrastructure.STLogging.Interface.LogLevelEnum.Debug);
            var dfDownload = await _businessLogic.DownloadDDBDataflow(ddbDataflow, format, separator, delimiter, zipped, observation);
            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            _logger.Log("END Controller DownloadDDBDataflow begin response", Infrastructure.STLogging.Interface.LogLevelEnum.Debug);
            return File(System.IO.File.OpenRead(dfDownload.FilePath), dfDownload.Format, $"downloadDF{ddbDataflow.IDDataflow}.{dfDownload.Ext}");
        }

        /// <summary>
        /// Gets a Category Scheme (if all params are null returns all)
        /// </summary>
        /// <param name="type">Artefact type.</param>
        /// <param name="id">Artefact id.</param>
        /// <param name="agencyID">Artefact agency.</param>
        /// <param name="version">Artefact version.</param>
        /// <param name="format">format (structure, structure20, csv, rtf, rdf, jsondata)</param>
        /// <param name="includeReference">include reference (used in dsd and dataflow)</param>
        /// <param name="lang">set language for csv (en, it, es)</param>
        /// <param name="separator">set separator for csv</param>
        /// <param name="delimiter">set delimiter for csv</param>
        /// <param name="zipped">Return a zipped file</param>
        /// <returns></returns>
        [HttpGet("downloadMetadati/{type}/{id}/{agencyID}/{version}/{format}/{includeReference}/{zipped}/{lang}/{separator?}/{delimiter?}")]
        public IActionResult DownloadMetadati(string type, string id, string agencyID, string version, string format, bool includeReference, bool zipped, string lang, string separator = ";", string delimiter = "")
        {
            return downloadMetadati(type, id, agencyID, version, format, includeReference, lang, separator, delimiter, zipped);
        }
        /// <summary>
        /// Gets a Category Scheme (if all params are null returns all)
        /// </summary>
        /// <param name="artefacts">List of artefact</param>
        /// <param name="type">Artefact type.</param>
        /// <param name="format">format (structure, structure20, csv, rtf, rdf, jsondata)</param>
        /// <param name="includeReference">include reference (used in dsd and dataflow)</param>
        /// <param name="lang">set language for csv (en, it, es)</param>
        /// <param name="separator">set separator for csv</param>
        /// <param name="delimiter">set delimiter for csv</param>
        /// <param name="zipped">Return a zipped file</param>
        /// <returns></returns>
        [HttpPost("downloadMetadati/{type}/{format}/{includeReference}/{zipped}/{lang}/{separator?}/{delimiter?}")]
        public IActionResult DownloadMetadatiMulti([FromBody] List<ArtefactIdentity> artefacts, string type, string format, bool includeReference, bool zipped, string lang, string separator = ";", string delimiter = "")
        {
            return downloadMetadati(type, artefacts, format, includeReference, lang, separator, delimiter, zipped);
        }

        private IActionResult downloadMetadati(string type, string id, string agencyID, string version, string format, bool includeReference, string lang, string separator, string delimiter, bool zipped)
        {
            var artefacts = new List<ArtefactIdentity>();
            artefacts.Add(new ArtefactIdentity { Agency = agencyID, ID = id, Version = version });
            return downloadMetadati(type, artefacts, format, includeReference, lang, separator, delimiter, zipped);
        }

        private IActionResult downloadMetadati(string type, List<ArtefactIdentity> artefacts, string format, bool includeReference, string lang, string separator, string delimiter, bool zipped)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            //_logger.Log($"downloadMetadati type:{type} id:{id} agencyID:{agencyID} version:{version} format:{format} includeReference:{includeReference} lang:{lang} separator:{separator} delimiter:{delimiter}", LogLevelEnum.Debug);

            Stream stream = null;
            try
            {
                var dfDownload = _businessLogic.DownloadMetadati(format, type, artefacts, includeReference, lang, separator, delimiter, zipped, _nodeConfiguration.Annotations);
                stream = dfDownload.Stream;
                LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);
                return File(stream, zipped ? "application/zip" : dfDownload.Format, $"download.{dfDownload.Ext}");
            }
            catch (Exception)
            {
                if (stream != null)
                {
                    stream.Dispose();
                }
                throw;
            }
        }
        
        /// <summary>
        /// Gets a Msd (if all params are null returns all)
        /// </summary>
        /// <param name="id">Artefact id.</param>
        /// <param name="agencyID">Artefact agency.</param>
        /// <param name="version">Artefact version.</param>
        /// <returns>Msd</returns>
        [HttpGet("msd/{id?}/{agencyID?}/{version?}")]
        public ActionResult<string> GetMetadataStructure(string id, string agencyID, string version)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            string res;

            if (id != null && agencyID != null && version != null)
            {
                res = _businessLogic.GetSdmxStructure(SdmxStructureEnumType.Msd, id, agencyID, version);
            }
            else
            {
                res = _businessLogic.GetSdmxStructure(SdmxStructureEnumType.Msd, null, null, null);
            }

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            return res;
        }

        /// <summary>
        /// Gets a Metadataflow (if all params are null returns all)
        /// </summary>
        /// <param name="id">Artefact id.</param>
        /// <param name="agencyID">Artefact agency.</param>
        /// <param name="version">Artefact version.</param>
        /// <param name="refDetail">reference detail.</param>
        /// <returns>Metadataflow</returns>
        [HttpGet("metadataflow/{refDetail?}")]
        [HttpGet("metadataflow/{id}/{agencyID}/{version}/{refDetail?}")]
        public ActionResult<string> GetMetadataflow(string id, string agencyID, string version, StructureReferenceDetailEnumType refDetail = StructureReferenceDetailEnumType.None)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            string res;

            if (id != null && agencyID != null && version != null)
            {
                res = _businessLogic.GetMetadataflow(id, agencyID, version, refDetail);
            }
            else
            {
                res = _businessLogic.GetSdmxStructure(SdmxStructureEnumType.MetadataFlow, null, null, null, refDetail);
            }

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            return res;
        }

        /// <summary>
        /// Set the categorisations of Metadataflow
        /// </summary>
        /// <param name="df">DF data input, require only:
        /// SDMX-JSON containing categorisations to be link in MSDB.</param>
        /// <param name="id">Artefact id.</param>
        /// <param name="agencyID">Artefact agency.</param>
        /// <param name="version">Artefact version.</param>
        /// <returns>Metadataflow</returns>
        [HttpPut("metadataflow/categorisations/{id}/{agencyID}/{version}")]
        public ActionResult<bool> UpdateCategorisationsMetadataflow([FromBody] DFParam df, string id, string agencyID, string version)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            _businessLogic.UpdateCategorisationsMetadataflow(id, agencyID, version, JsonConvert.SerializeObject(df.msdbCat));

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            return true;
        }

        /// <summary>
        /// GEt all reference of artefact
        /// </summary>
        /// <param name="artefactType">Artefact type.</param>
        /// <param name="id">Artefact id.</param>
        /// <param name="agencyID">Artefact agency.</param>
        /// <param name="version">Artefact version.</param>
        /// <returns>Metadataflow</returns>
        [HttpGet("ArtefactReference/{artefactType}/{id}/{agencyID}/{version}")]
        public ActionResult<List<ArtefactReference>> GetArtefactReference(string artefactType, string id, string agencyID, string version)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);
            
            var result = _businessLogic.ArtefactParentsReference(ArtefactDataModel.BL.Utility.GetArtefactTypeEnum(artefactType), id, agencyID, version);
            result.AddRange(_businessLogic.ArtefactChildrenReference(ArtefactDataModel.BL.Utility.GetArtefactTypeEnum(artefactType), id, agencyID, version));
            
            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            return result;
        }

        /// <summary>
        /// Get all reference content constraint of artefact
        /// </summary>
        /// <param name="artefactType">Artefact type.</param>
        /// <param name="id">Artefact id.</param>
        /// <param name="agencyID">Artefact agency.</param>
        /// <param name="version">Artefact version.</param>
        /// <returns>Metadataflow</returns>
        [HttpGet("ArtefactContentConstraint/{artefactType}/{id}/{agencyID}/{version}")]
        public ActionResult<List<ArtefactReference>> GetArtefactContentConstraint(string artefactType, string id, string agencyID, string version)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            var result = _businessLogic.ArtefactParentsReference(ArtefactDataModel.BL.Utility.GetArtefactTypeEnum(artefactType), id, agencyID, version);

            var allContraint = new List<ArtefactReference>();
            foreach (var item in result)
            {
                if (item.EnumType == SdmxStructureEnumType.ContentConstraint)
                {
                    allContraint.Add(item);
                }
            }

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            return allContraint;
        }

        #endregion READ

        #region CREATE

        /// <summary>
        /// Update the main property of MSD
        /// </summary>
        /// <returns></returns>
        [HttpPut("msd")]
        [Authorize]
        public ActionResult<string> UpdateMSD([FromBody] MSDRegistry msdRegistry)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            string res = _businessLogic.UpdateMSD(msdRegistry);

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            return res;
        }

        /// <summary>
        /// Update the main property of MSD
        /// </summary>
        /// <returns></returns>
        [HttpPut("UpdateHierarchicalCodelist")]
        [Authorize]
        public ActionResult<string> UpdateHierarchicalCodelist([FromBody] HierarchicalCodelistRegistry hierarchicalCodelistRegistry)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            string res = _businessLogic.UpdateHierarchicalCodelist(hierarchicalCodelistRegistry);

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            return res;
        }

        /// <summary>
        /// Creates a cube querying SDMX WS and adding corrispondent codes for each attribute or dimension.
        /// Adds annotation of type AssociatedCube to the corrispondent DSD.
        /// </summary>
        /// <returns></returns>
        [HttpPost("cube")]
        [Authorize]
        public ActionResult<string> CreateCube()
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            string res = _businessLogic.CreateCube(new StreamReader(Request.Body).ReadToEnd());

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            return res;
        }

        /// <summary>
        /// Creates a file mapping
        /// </summary>
        /// <returns></returns>
        [HttpPost("fileMapping")]
        [Authorize]
        public ActionResult<string> CreateFileMapping()
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            string res = _businessLogic.CreateFileMapping(new StreamReader(Request.Body).ReadToEnd());

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            return res;
        }

        /// <summary>
        /// Creates a DDBDataflow: it controls DDBDataflow and SDMX dataflow are not inconsistent and then creates corrispondent artefact in MSDB e DDB.
        /// Optionally creates dataflow's categorisations and header.
        /// If the dataflow has fewer columns than the original cube a new DSD is also created.
        /// </summary>
        /// <param name="df">Object with:
        /// ddbDF: Dataflow to be created in DDB.
        /// msdbDF: SDMX-JSON containing dataflow to be created in MSDB.
        /// msdbCat: SDMX-JSON containing categorisations to be created in MSDB.
        /// msdbDF: HeaderTemplate to be created in MSDB.</param>
        /// <returns></returns>
        [HttpPost("createDDBDataflow")]
        [Authorize]
        public ActionResult<string> CreateDDBDataflow([FromBody] DFParam df)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            string res = _businessLogic.CreateDDBDataflow(df.ddbDF, JsonConvert.SerializeObject(df.msdbDF), JsonConvert.SerializeObject(df.msdbCat), df.header);

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            return res;
        }

        /// <summary>
        /// Creates Artefacts
        /// </summary>
        /// <returns></returns>
        [HttpPost("createArtefacts")]
        [Authorize]
        public ActionResult<string> CreateArtefacts()
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            //string res = _businessLogic.CreateArtefactsTest(true, true);
            string res = _businessLogic.CreateArtefacts(new StreamReader(Request.Body).ReadToEnd());

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            return res;
        }

        /// <summary>
        /// Updates Artefacts
        /// </summary>
        /// <returns></returns>
        [HttpPut("updateArtefacts")]
        [Authorize]
        public ActionResult<string> UpdateArtefacts()
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            string res = _businessLogic.UpdateArtefacts(new StreamReader(Request.Body).ReadToEnd());

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            return res;
        }

        #region Dataflow Production

        /// <summary>
        /// Generates a connection (if needed), a dataset and a mapping set for a dataflow
        /// </summary>
        /// <param name="dfId">The id of the DDB Dataflow to set in production</param>
        /// <param name="defaultValue">Default value for the measure.</param>
        /// <returns></returns>
        [HttpGet("CreateMappingSetForDataflow/{dfId}/{defaultValue?}")]
        [Authorize]
        public ActionResult<string> CreateMappingSetForDataflow(int dfId, string defaultValue = null)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            string res = _businessLogic.CreateMappingSetForDataflow(dfId, defaultValue);

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            return res;
        }

        /// <summary>
        /// Generates transcodings for a dataflow.
        /// </summary>
        /// <param name="dfId">The DDB Dataflow id.</param>
        /// <returns></returns>
        [HttpGet("CreateTranscodingsForDataflow/{dfId}")]
        [Authorize]
        public ActionResult<string> CreateTranscodingsForDataflow(int dfId)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            string res = _businessLogic.CreateTranscodingsForDataflow(dfId);

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            return res;
        }

        /// <summary>
        /// Generates transcodings from a content constraint for a dataflow.
        /// </summary>
        /// <param name="dfId">The DDB Dataflow id.</param>
        /// <param name="agCc">The agency of the content constraint.</param>
        /// <param name="idCc">The id of the content constraint.</param>
        /// <param name="versCc">The version of the content constraint.</param>
        /// <returns></returns>
        [HttpGet("CreateTranscodingsFromCCForDataflow/{dfId}/{agCc}/{idCc}/{versCc}")]
        [Authorize]
        public ActionResult<string> CreateTranscodingsFromCCForDataflow(int dfId, string agCc, string idCc, string versCc)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            string res = _businessLogic.CreateTranscodingsFromCCForDataflow(dfId, agCc, idCc, versCc);

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            return res;
        }

        /// <summary>
        /// Generates content constraints for a dataflow.
        /// </summary>
        /// <param name="dfId">The DDB Dataflow id.</param>
        /// <returns></returns>
        [HttpGet("CreateContentConstraintsForDataflow/{dfId}")]
        [Authorize]
        public ActionResult<string> CreateContentConstraintsForDataflow(int dfId)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            string res = _businessLogic.CreateContentConstraintsForDataflow(dfId);

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            return res;
        }

        /// <summary>
        /// Sets or removes a DDB Dataflow in/from Production setting production flag to true/false
        /// </summary>
        /// <param name="dfId">The DDB Dataflow id</param>
        /// <param name="value">The value (true or false) of NonProductionDataflow annotation.</param>
        [HttpGet("SetDataflowProductionFlag/{dfId}/{value}")]
        [Authorize]
        public ActionResult<string> SetDataflowProductionFlag(int dfId, bool value)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            string res = _businessLogic.SetDataflowProductionFlag(dfId, value);

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            return res;
        }

        /// <summary>
        /// Returns the MappingSet Id for a DDB dataflow
        /// </summary>
        /// <param name="dfId">The DDB Dataflow id</param>
        [HttpGet("GetMappingSetIdForDDBDataflow/{dfId}")]
        [Authorize]
        public ActionResult<string> GetMappingSetIdForDDBDataflow(int dfId)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            string res = _businessLogic.GetMappingSetIdForDDBDataflow(dfId);

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            return res;
        }

        /// <summary>
        /// Removes the MappingSet for a DDB Dataflow setting production flag to false and deleting its content constraints transcodings (if exist), 
        /// its dataset and its connection (if it is not used by other dataflows)
        /// </summary>
        /// <param name="dfId">The dataflow to remove from production</param>
        [HttpDelete("RemoveMappingSetForDataflow/{dfId}")]
        [Authorize]
        public ActionResult<string> RemoveMappingSetForDataflow(int dfId)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            string res = _businessLogic.RemoveMappingSetForDataflow(dfId);

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            return res;
        }

        /// <summary>
        /// Removes transcodings for a dataflow.
        /// </summary>
        /// <param name="dfId">The DDB Dataflow id.</param>
        /// <returns></returns>
        [HttpDelete("RemoveTranscodingsForDataflow/{dfId}")]
        [Authorize]
        public ActionResult<string> RemoveTranscodingsForDataflow(int dfId)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            string res = _businessLogic.RemoveTranscodingsForDataflow(dfId);

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            return res;
        }

        /// <summary>
        /// Removes content constraints for a dataflow.
        /// </summary>
        /// <param name="dfId">The DDB Dataflow id.</param>
        /// <returns></returns>
        [HttpDelete("RemoveContentConstraintsForDataflow/{dfId}")]
        [Authorize]
        public ActionResult<string> RemoveContentConstraintsForDataflow(int dfId)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            string res = _businessLogic.RemoveContentConstraintsForDataflow(dfId);

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            return res;
        }

        #endregion Dataflow Production

        /// <summary>
        /// Creates a Header Template
        /// </summary>
        /// <returns></returns>
        [HttpPost("createHeaderTemplate")]
        [Authorize]
        public ActionResult<string> CreateHeaderTemplate()
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            string res = _businessLogic.CreateHeaderTemplate(new StreamReader(Request.Body).ReadToEnd());

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            return res;
        }

        /// <summary>
        /// Insert category in the Default Category Scheme.
        /// </summary>
        /// <param name="category">The Category to be inserted.</param>
        /// <returns>The category id in case of success, otherwise an exception is thrown.</returns>
        [HttpPost("InsertDCS")]
        public JsonResult InsertDCS([FromBody] Category category)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            var res = _businessLogic.InsertDCS(category);

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            return new JsonResult(res);
        }

        /// <summary>
        /// Update category in the Default Category Scheme.
        /// </summary>
        /// <param name="category">The Category to be updated.</param>
        /// <returns></returns>
        [HttpPut("UpdateDCS")]
        public HttpResponseMessage UpdateDCS([FromBody] Category category)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            _businessLogic.UpdateDCS(category);

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            return new HttpResponseMessage(HttpStatusCode.OK);
        }

        /// <summary>
        /// Delete category from the Default Category Scheme.
        /// </summary>
        /// <param name="catCode">The Category Code to be deleted.</param>
        /// <returns>True in case of success, false if try to delete category with children or assign to cube.</returns>
        [HttpDelete("DeleteDCS/{catCode}")]
        public JsonResult DeleteDCS(string catCode)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            var result = _businessLogic.DeleteDCS(catCode);

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            return new JsonResult(result);
        }

        #endregion

        #region DELETE

        /// <summary>
        /// Deletes the specified cube and the AssociatedCube annotation from its DSD
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        [HttpDelete("cube/{id}")]
        [Authorize]
        public ActionResult<string> DeleteCube(int id)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            string res = _businessLogic.DeleteCube(id);

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            return res;
        }

        /// <summary>
        /// Removes file mapping
        /// </summary>
        /// <param name="id">file mapping id.</param>
        /// <returns></returns>
        [HttpDelete("fileMapping/{id}")]
        [Authorize]
        public ActionResult<string> DeleteFileMapping(int id)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            string res = _businessLogic.DeleteFileMapping(id);

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            return res;
        }

        /// <summary>
        /// Deletes a DDB Dataflow: corrispondent dataflow in MSDB is also deleted.
        /// </summary>
        /// <param name="id">The id of the DDBDataflow.</param>
        /// <returns></returns>
        [HttpDelete("ddbDataflow/{id}")]
        [Authorize]
        public ActionResult<string> DeleteDDBDataflow(int id)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            bool deleted = false;
            string res = _businessLogic.DeleteDDBDataflow(id, ref deleted);

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            return res;
        }

        /// <summary>
        /// Deletes an SDMX artefact from the MSDB. 
        /// If the artefact is a DSD, the method deletes it only if it has no AssociatedCube annotations.
        /// </summary>
        /// <param name="artType">The type of the artefact to delete.</param>
        /// <param name="id">The id of the artefact to delete.</param>
        /// <param name="agencyID">The agency of the artefact to delete.</param>
        /// <param name="version">The version of the artefact to delete.</param>
        /// <returns></returns>
        [HttpDelete("artefact/{artType}/{id}/{agencyId}/{version}")]
        [Authorize]
        public ActionResult<string> DeleteArtefact(SdmxStructureEnumType artType, string id, string agencyID, string version)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            string res = _businessLogic.DeleteArtefact(artType, id, agencyID, version);

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            return res;
        }

        /// <summary>
        /// Deletes a MA entity
        /// </summary>
        /// <param name="type">The type of the entity to delete.</param>
        /// <param name="id">The id of the entity to delete.</param>
        /// <returns></returns>
        [HttpDelete("entity/{type}/{id}")]
        [Authorize]
        public ActionResult<string> DeleteMAEntity(string type, int id)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            string res = _businessLogic.DeleteMAEntity(type, id);

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            return res;
        }

        #endregion

        #region UTILITY

        /// <summary>
        /// Uploads a file on the file-system.
        /// </summary>
        /// <param name="file">The file to be uploaded.</param>
        /// <param name="cubeId">The id of the cube to whom the file refers.</param>
        /// <returns>The path of the uploaded file in case of success, otherwise an exception is thrown.</returns>
        [HttpPost("uploadFileOnServer/{cubeId?}")]
        [DisableRequestSizeLimit, RequestFormLimits(MultipartBodyLengthLimit = int.MaxValue, ValueLengthLimit = int.MaxValue)]
        [Authorize]
        public ActionResult<string> UploadFileOnServer(int? cubeId, IFormFile file)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            string res = _businessLogic.UploadFileOnServer(cubeId, file);

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            return res;
        }

        /// <summary>
        /// Uploads a metadata file on the dmapi file-system.
        /// </summary>
        /// <param name="file">The file to be uploaded.</param>
        /// <returns>The filename of the uploaded file in case of success, otherwise an exception is thrown.</returns>
        [HttpPost("UploadReferenceMetadataFileOnServer")]
        [DisableRequestSizeLimit, RequestFormLimits(MultipartBodyLengthLimit = int.MaxValue, ValueLengthLimit = int.MaxValue)]
        public ActionResult<string> UploadReferenceMetadataFileOnServer(IFormFile file)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            string res = _businessLogic.UploadReferenceMetadataFileOnServer(file);

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            return res;
        }

        /// <summary>
        /// Download a metadata file from the dmapi file-system.
        /// </summary>
        /// <param name="filename">The file to be download.</param>
        /// <returns>Download the file in case of success, otherwise an exception is thrown.</returns>
        [HttpGet("ReferenceMetadataFileOnServer")]
        public IActionResult ReferenceMetadataFileOnServer(string filename)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            filename = Path.GetFileName(filename);

            Stream stream = null;
            try
            {
                stream = _businessLogic.ReferenceMetadataFileOnServer(filename);
                //Set the File Content Type.
                var provider = new FileExtensionContentTypeProvider();
                string contentType;
                if (!provider.TryGetContentType(filename, out contentType))
                {
                    contentType = "application/octet-stream";
                }
                LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);
                return File(stream, contentType, filename);
            }
            catch (Exception)
            {
                if (stream != null)
                {
                    stream.Dispose();
                }
                throw;
            }
        }


        /// <summary>
        /// Returns the header of a CSV file. If the file is not a CSV file or is empty an exception is thrown. 
        /// If the file has no header, an array of string "Col 1, …, Col N" is returned.
        /// </summary>
        /// <param name="separator">CSV separator used in the file.</param>
        /// <param name="delimiter">CSV delimiter used in the file.</param>
        /// <param name="hasHeader">Whether the CSV file has a header or not.</param>
        /// <param name="filePath">Path of the CSV file.</param>
        /// <returns>A list with the name of the columns to be shown in Mapping.</returns>
        [HttpGet("getCSVHeader/{separator}/{hasHeader}/{delimiter?}")]
        public ActionResult<string> GetCSVHeader(char separator, bool hasHeader, string filePath, char? delimiter)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            string res = _businessLogic.GetCSVHeader(separator, delimiter, hasHeader, filePath);

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            return res;
        }

        /// <summary>
        /// Returns a paginated preview of a table in the DDB.
        /// </summary>
        /// <param name="optionsTable">Contains option for paging, filter, sort</param>
        /// <param name="separator">CSV separator used in the file.</param>
        /// <param name="delimiter">CSV delimiter used in the file.</param>
        /// <param name="hasHeader">Whether the CSV file has a header or not.</param>
        /// <param name="filePath">Path of the CSV file.</param>
        /// <param name="tid">Table Identifier.</param>
        /// <param name="idMappingSpecialTimePeriod">(Optional) Id of the mapping with time period in .STAT format.</param>
        [HttpPost("getCSVTablePreview/{separator}/{hasHeader}/{delimiter?}")]
        public ActionResult<string> GetCSVTablePreview([FromBody] OptionsTable optionsTable, char separator, bool hasHeader, string filePath, string tid, char? delimiter, int idMappingSpecialTimePeriod = 0)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            var guidSession = UserUtils.GetGuidSession(HttpContext.User.Identity);

            string res = _businessLogic.GetCSVTablePreview(optionsTable, separator, delimiter, hasHeader, filePath, tid, idMappingSpecialTimePeriod, guidSession);

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            return res;
        }

        /// <summary>
        /// Returns a paginated column preview of a table in the DDB.
        /// </summary>
        /// <param name="optionsTable">Contains option for paging, filter, sort</param>
        /// <param name="separator">CSV separator used in the file.</param>
        /// <param name="hasHeader">Whether the CSV file has a header or not.</param>
        /// <param name="filePath">Path of the CSV file.</param>
        /// <param name="delimiter">CSV delimiter used in the file.</param>
        /// <param name="idMappingSpecialTimePeriod">(Optional) Id of the mapping with time period in .STAT format.</param>
        [HttpPost("getCSVTableColumnPreview/{separator}/{hasHeader}/{delimiter?}")]
        public ActionResult<string> GetCSVTableColumnPreview([FromBody]OptionsTable optionsTable, char separator, bool hasHeader, string filePath, char? delimiter, int idMappingSpecialTimePeriod = 0)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            var guidSession = UserUtils.GetGuidSession(HttpContext.User.Identity);

            string res = _businessLogic.GetCSVTableColumnPreview(optionsTable, separator, delimiter, hasHeader, filePath, idMappingSpecialTimePeriod, guidSession);

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            return res;
        }

        /// <summary>
        /// Imports data in a cube from a CSV file.
        /// </summary>
        /// <param name="separator">CSV separator used in the file.</param>
        /// <param name="delimiter">CSV delimiter used in the file.</param>
        /// <param name="hasHeader">Whether the CSV file has a header or not.</param>
        /// <param name="importType">Import Type (Series, Data or SeriesAndData).</param>
        /// <param name="cubeId">Id of the cube where data are imported.</param>
        /// <param name="mappingId">Id of the mapping to whom the table refers. It is 0 if you are trying to import an SDMX file and so mapping does not exist.</param>
        /// <param name="filePath">Path of the file from whom the temp table has been generated.</param>
        /// <param name="tid">Table Identifier.</param>
        /// <param name="refreshProdDf">Whether regenerating content constraints and transcodings for dataflows built on the specific cube.</param>
        /// <param name="idMappingSpecialTimePeriod">(Optional) Id of the mapping with time period in .STAT format.</param>
        /// <param name="embargo">Whether the data have to be embargoed or not.</param>
        /// <param name="ignoreCuncurrentUpload">Ignore cuncurrency upload protection</param>
        /// <param name="checkFiltAttributes">Whether to check the coherence of attributes on FiltS table or not</param>
        [HttpGet("importCSVData/{separator}/{hasHeader}/{importType}/{cubeId}/{mappingId}/{delimiter?}")]
        [Authorize]
        public ActionResult<string> ImportCSVData(char separator, bool hasHeader, string importType, int cubeId, int mappingId, string filePath, string tid, char? delimiter, bool refreshProdDf = false, int idMappingSpecialTimePeriod = 0, bool embargo = false, bool ignoreCuncurrentUpload = false, bool checkFiltAttributes = false)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            var guidSession = UserUtils.GetGuidSession(HttpContext.User.Identity);

            string res = _businessLogic.ImportCSVData(separator, delimiter, hasHeader, importType, cubeId, mappingId, filePath, tid, refreshProdDf, idMappingSpecialTimePeriod, embargo, ignoreCuncurrentUpload, checkFiltAttributes, guidSession);

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            return res;
        }

        /// <summary>
        /// Disembargoes a cube.
        /// </summary>
        /// <param name="idCube">The cube to be disembargoed.</param>
        /// <returns></returns>
        [HttpPost("DisembargoCube/{idCube}")]
        public ActionResult<string> DisembargoCube(int idCube)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            var result = _businessLogic.DisembargoCube(idCube);

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            return result;
        }

        /// <summary>
        /// Delete all data contained in a cube.
        /// </summary>
        /// <param name="idCube">Id of the cube to be emptied.</param>
        /// <returns>True in case of success, otherwise an exception is thrown.</returns>
        [HttpPost("EmptyCube/{idCube}")]
        public ActionResult<string> EmptyCube(int idCube)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            var result = _businessLogic.EmptyCube(idCube);

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            return result;
        }

        /// <summary>
        /// Returns a paginated table preview.
        /// </summary>
        /// <param name="tableName">name</param>
        /// <param name="optionsTable">Contains option for paging, filter, sort</param>
        [HttpPost("getTablePreview/{tableName}")]
        public ActionResult<string> GetTablePreview(string tableName, [FromBody] OptionsTable optionsTable)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            string res = _businessLogic.GetTablePreview(tableName, optionsTable);

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            return res;
        }

        /// <summary>
        /// Returns a paginated table preview for a column.
        /// </summary>
        /// <param name="tableName">name</param>
        /// <param name="optionsTable">Contains option for paging, filter, sort, columns</param>
        [HttpPost("getTableColumnPreview/{tableName}")]
        public ActionResult<string> GetTableColumnPreview(string tableName, [FromBody] OptionsTable optionsTable)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            string res = _businessLogic.GetTableColumnPreview(tableName, optionsTable);

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            return res;
        }

        /// <summary>
        /// Returns a paginated sdmx table preview.
        /// </summary>
        /// <param name="dsdId">dsd id</param>
        /// <param name="dsdAgencyId">did agency</param>
        /// <param name="dsdVersion">dsd version</param>
        /// <param name="optionsTable">Contains option for paging, filter, sort</param>
        /// <param name="filePath">Path of the CSV file.</param>
        [HttpPost("getSDMXMLTablePreview/{dsdId}/{dsdAgencyId}/{dsdVersion}")]
        public ActionResult<string> GetSDMXMLTablePreview(string dsdId, string dsdAgencyId, string dsdVersion, [FromBody] OptionsTable optionsTable, string filePath)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            string res = _businessLogic.GetSDMXMLTablePreview(dsdId, dsdAgencyId, dsdVersion, optionsTable, filePath);

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            return res;
        }

        /// <summary>
        /// Imports data from a SDMXML file.
        /// </summary>
        /// <param name="importType">import type</param>
        /// <param name="cubeId">cube id</param>
        /// <param name="dsdId">dsd id</param>
        /// <param name="dsdAgencyId">did agency</param>
        /// <param name="dsdVersion">dsd version</param>
        /// <param name="filePath">Path of the CSV file.</param>
        /// <param name="tid">Table Identifier.</param>
        /// <param name="refreshProdDf">Whether regenerating content constraints and transcodings for dataflows built on the specific cube.</param>
        /// <param name="embargo">Whether the data have to be embargoed or not.</param>
        /// <param name="ignoreCuncurrentUpload">Ignore cuncurrency upload protection</param>
        /// <param name="checkFiltAttributes">Whether to check the coherence of attributes on FiltS table or not</param>
        [HttpGet("importSDMXMLData/{importType}/{cubeId}/{dsdId}/{dsdAgencyId}/{dsdVersion}")]
        [Authorize]
        public ActionResult<string> ImportSDMXMLData(string importType, string cubeId, string dsdId, string dsdAgencyId, string dsdVersion, string filePath, string tid, bool refreshProdDf = false, bool embargo = false, bool ignoreCuncurrentUpload = false, bool checkFiltAttributes = false)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            string res = _businessLogic.ImportSDMXMLData(importType, cubeId, dsdId, dsdAgencyId, dsdVersion, filePath, tid, refreshProdDf, embargo, ignoreCuncurrentUpload, checkFiltAttributes);

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            return res;
        }

        /// <summary>
        /// Returns a paginated Dataflow column preview.
        /// </summary>
        /// <param name="df">dataflow</param>
        /// <param name="colName">column name</param>
        /// <param name="pageNum">page number</param>
        /// <param name="pageSize">page size</param>
        [HttpPost("getDataflowColumnPreview/{colName}/{pageNum}/{pageSize}")]
        [Authorize]
        public ActionResult<string> GetDataflowColumnPreview([FromBody] DDBDataflowWithCols df, string colName, int pageNum, int pageSize)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            string res = _businessLogic.GetDataflowColumnPreview(df, colName, pageNum, pageSize);

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            return res;
        }

        /// <summary>
        /// Imports the Default Category Scheme from the MSDB.
        /// </summary>
        /// <param name="id">id</param>
        /// <param name="agencyId">agency</param>
        /// <param name="version">version</param>
        [HttpGet("importDCS/{id}/{agencyId}/{version}")]
        [Authorize]
        public ActionResult<string> ImportDCS(string id, string agencyId, string version)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            string res = _businessLogic.ImportDCS(id, agencyId, version);

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            return res;
        }

        /// <summary>
        /// Gets a data preview fior a DDB dataflow
        /// </summary>
        /// <param name="ddbDataflow">List of columns of the dataset to be show</param>
        /// <param name="partialIgnoreCheckFilter">whether to check filter coerence for dataflow columns with a unique value or not</param>
        [HttpPost("getDDBDataflowPreview/{partialIgnoreCheckFilter?}")]
        public ActionResult<string> GetDDBDataflowPreview([FromBody] DDBDataflow ddbDataflow, bool partialIgnoreCheckFilter = false)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            string res = _businessLogic.GetDDBDataflowPreview(ddbDataflow, partialIgnoreCheckFilter);

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            return res;
        }

        /// <summary>
        /// Downloads a DDB dataflow in CSV format (zipped or not)
        /// </summary>
        /// <param name="ddbDataflow">The dataflow.</param>
        /// <param name="zip">true for getting zipped data.</param>
        /// <param name="separator">CSV separator used in the file.</param>
        /// <param name="delimiter">CSV delimiter used in the file.</param>
        [HttpPost("GetDDBDataflowCsv/{zip?}")]
        public async Task<IActionResult> GetDDBDataflowCsv([FromBody] DDBDataflow ddbDataflow, bool? zip, char? separator, char? delimiter)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            _logger.Log($"Controller start GetDDBDataflowCsv: idCube:{ddbDataflow.IDCube}\tzip:{zip}\tseparator:{separator}\tdelimiter:{delimiter}", Infrastructure.STLogging.Interface.LogLevelEnum.Debug);
            var downloadFilePath = await _businessLogic.DownloadDDBDataflowCsv(ddbDataflow, true, zip.HasValue && zip.Value, separator.HasValue ? separator.Value : ',', delimiter);
            _logger.Log($"Controller end GetDDBDataflowCsv", Infrastructure.STLogging.Interface.LogLevelEnum.Debug);

            var isZipped = (zip.HasValue && zip.Value) || (downloadFilePath.EndsWith(".zip", StringComparison.InvariantCultureIgnoreCase));

            return File(System.IO.File.OpenRead(downloadFilePath), isZipped ? "application/zip" : "text/csv", isZipped ? $"Cube_{ddbDataflow.IDCube}.zip" : $"Cube_{ddbDataflow.IDCube}.csv");
        }

        /// <summary>
        /// Checks if all artefacts are present in the XML file.
        /// </summary>
        /// <param name="file">File containing data in XML SDMX format</param>
        /// <returns>Status of all artefact inside of file (if can be imported or not)</returns>
        [HttpPost("CheckImportedFileXmlSdmxObjects")]
        [Authorize]
        [DisableRequestSizeLimit, RequestFormLimits(MultipartBodyLengthLimit = int.MaxValue, ValueLengthLimit = int.MaxValue)]
        public ActionResult<ImportedItemXmlDTO> CheckImportedFileXmlSdmxObjects(IFormFile file)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            var res = _businessLogic.CheckImportedFileXmlSdmxObjects(file);

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            return res;
        }

        /// <summary>
        /// Imports all the given artefacts
        /// </summary>
        /// <param name="importedItemDTO">Selection of the artefacts present into to XML file to be imported</param>
        /// <returns>Status of all artefact imported</returns>
        [HttpPost("ImportFileXmlSdmxObjects")]
        [Authorize]
        public ActionResult<ImportedItemXmlResult> ImportFileXmlSdmxObjects([FromBody] ImportedItemXmlDTO importedItemDTO)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            var res = _businessLogic.ImportFileXmlSdmxObjects(importedItemDTO);

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            return res;
        }

        /// <summary>
        /// Checks all items and structures present in the CSV file.
        /// </summary>
        /// <param name="file">File containing data in CSV format</param>
        /// <returns>List of top 5 items to be imported</returns>
        [HttpPost("CheckImportedFileCsvItem")]
        [DisableRequestSizeLimit, RequestFormLimits(MultipartBodyLengthLimit = int.MaxValue, ValueLengthLimit = int.MaxValue)]
        [Authorize]
        public ActionResult<ImportedItemCsvDTO> CheckImportedFileCsvItem(IFormFile file)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            var customData = ControllerContext.HttpContext.Request.Form["CustomData"][0];
            var res = _businessLogic.CheckImportedFileCsvItem(file,
                                                            JsonConvert.DeserializeObject<ImportedItemCsvDTO>(customData));

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            return res;
        }

        /// <summary>
        /// Returns a paged preview of a table in the DDB.
        /// </summary>
        /// <param name="optionsTable">Contains option for paging, filter, sort</param>
        /// <returns></returns>
        [HttpPost("Utils/getTableCSVPreview")]
        public ActionResult<string> GetTableCSVPreview([FromBody] OptionsTable optionsTable)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            var guidSession = UserUtils.GetGuidSession(HttpContext.User.Identity);

            var res = _businessLogic.PreviewImportedFileCsvItem(optionsTable, guidSession);

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            return res;
        }

        /// <summary>
        /// Imports all items in the CSV file into the itemscheme
        /// </summary>
        /// <param name="importedItemCsvDTO">Contain separator, delimiter, artefact identity and order of column in file</param>
        /// <returns>Status of artefact imported</returns>
        [HttpPost("ImportFileCsvItem")]
        [Authorize]
        public ActionResult<ImportedItemCsvResult> ImportFileCsvItem([FromBody] ImportedItemCsvDTO importedItemCsvDTO)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            var res = _businessLogic.ImportFileCsvItem(importedItemCsvDTO);

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            return res;
        }

        /// <summary>
        /// Syncs AuthDB with all data from MSDb and DDB (agency, category...)
        /// </summary>
        [HttpPost("SynchronizeAuthDB")]
        [Authorize]
        public IActionResult SynchronizeAuthDB()
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            _businessLogic.SynchronizeAuthDB();

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            return Ok();
        }

        /// <summary>
        /// Syncs AuthDB with all data from MSDb and DDB (agency, category...)
        /// </summary>
        [HttpGet("AgencyName")]
        public Dictionary<string, Dictionary<string, string>> AgencyName()
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            var result = _businessLogic.AgencyName();

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            return result;
        }


        /// <summary>
        /// Checks if all codelists in the given DSD in DDB are syncronized with the ones in MSDB
        /// </summary>
        /// <param name="artefactIdentity">DSD identity or all DSD in case of empty list</param>
        /// <returns>List of all items for each codelist to be sync</returns>
        [HttpPost("CheckCodelistToBeSynchronized")]
        public CheckCodeListResult CheckCodelistToBeSynchronizedFromDsd([FromBody] List<ArtefactIdentity> artefactIdentity)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            var result = _businessLogic.CheckCodelistToBeSynchronizedFromDsd(artefactIdentity);

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            return result;
        }

        /// <summary>
        /// Get all codelists in DDB are syncronized with the ones in MSDB
        /// </summary>
        /// <returns>List of all items for each codelist to be sync</returns>
        [HttpGet("GetAllCodelistToBeSynchronized")]
        public List<CodeLisSyncDTO> GetAllCodelistToBeSynchronized()
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            var result = _businessLogic.GetAllCodelistToBeSynchronized();

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            return result;
        }

        /// <summary>
        /// Sync all codelists in DDB with the ones in MSDB
        /// </summary>
        [HttpPost("SyncCodeList")]
        [Authorize]
        public void SyncCodeList([FromBody] List<ArtefactIdentity> artefactIdentity)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            _businessLogic.SyncCodeList(artefactIdentity);

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);
        }

        /// <summary>
        /// Resets the DDB to its original state (after initialization).
        /// <returns>True in case of success, otherwise an exception is thrown.</returns>
        /// </summary>
        [HttpPost("DDBReset")]
        [Authorize]
        public ActionResult<bool> DDBReset()
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            bool res = _businessLogic.DDBReset();

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            return res;
        }


        /// <summary>
        ///  Get all dsd with dataflow associated
        /// </summary>
        /// <returns></returns>
        [HttpGet("GetDSDWithDataflow")]
        [Authorize]
        public ActionResult<List<DsdWithDataflow>> GetDSDWithDataflow()
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            var result = _businessLogic.GetDSDWithDataflow();

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            return result;
        }

        /// <summary>
        /// Generate report with the difference beetween two DSD
        /// </summary>
        /// <param name="sourceDsdId">The id of the original dsd</param>
        /// <param name="sourceDsdAgencyId">The agencyid of the original dsd</param>
        /// <param name="sourceDsdVersion">The version of the original dsd</param>
        /// <param name="targetDsdId">The id of the new dsd</param>
        /// <param name="targetDsdAgencyId">The agencyid of the new dsd</param>
        /// <param name="targetDsdVersion">The version of the new dsd</param>
        /// <param name="callCompare">Call compare function for check if DSD is upgradable</param>
        /// <returns></returns>
        [HttpGet("GenerateReportDSD/{sourceDsdId}/{sourceDsdAgencyId}/{sourceDsdVersion}/{targetDsdId}/{targetDsdAgencyId}/{targetDsdVersion}/{callCompare}")]
        [Authorize]
        public ActionResult<DsdReport> GenerateReportDSD(string sourceDsdId, string sourceDsdAgencyId, string sourceDsdVersion, string targetDsdId, string targetDsdAgencyId, string targetDsdVersion, bool callCompare)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            var result = _businessLogic.GenerateReportDSD(new ArtefactCompare { ID = sourceDsdId, Agency = sourceDsdAgencyId, Version = sourceDsdVersion, EnumType = SdmxStructureEnumType.Dsd, StreamType = StreamType.Database }, new ArtefactCompare { ID = targetDsdId, Agency = targetDsdAgencyId, Version = targetDsdVersion, EnumType = SdmxStructureEnumType.Dsd, StreamType = StreamType.Database }, callCompare, callCompare);

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            return result;
        }

        /// <summary>
        /// Generate report with the difference beetween two DSD
        /// </summary>
        /// <param name="callCompare">Call compare function for check if DSD is upgradable</param>
        /// <param name="files">Optional files xml for compare</param>
        /// <returns></returns>
        [HttpPost("CompareDSD/{callCompare}")]
        [Authorize]
        public ActionResult<DsdReport> CompareDSD(List<IFormFile> files, bool callCompare)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            if (!ControllerContext.HttpContext.Request.Form.ContainsKey("CustomData"))
            {
                throw new InvalidDataException();
            }
            var customData = ControllerContext.HttpContext.Request.Form["CustomData"][0];
            var artefactCompare = JsonConvert.DeserializeObject<DSDArtefactCompareDTO>(customData);

            artefactCompare.SourceArtefact.EnumType = SdmxStructureEnumType.Dsd;
            artefactCompare.TargetArtefact.EnumType = SdmxStructureEnumType.Dsd;

            
            var i = 0;
            foreach (var formFile in files)
            {
                i++;
                if ((i == 1 && artefactCompare.SourceArtefact.StreamType == StreamType.Xml) || (i == 1 && files.Count == 2))
                { //If first is XML, set first file in first artefact
                  //If have 2 file, set first file in first artefact
                    artefactCompare.SourceArtefact.FilePath = _businessLogic.UploadFileOnNodeApi(formFile, new List<string>() { ".xml" }, _configuration["UPLOAD_IMPORT_STRUCTURE"]);
                    using (var file = new FileStream(artefactCompare.SourceArtefact.FilePath, FileMode.Create))
                    {
                        formFile.CopyTo(file);
                    }
                }
                else if (i == 2 || (files.Count == 1 && artefactCompare.SourceArtefact.StreamType != StreamType.Xml))
                { //If 1 file and first Artefact is Database, set the file in second artefat
                  //If have 2 file, set second file in second artefat
                    artefactCompare.TargetArtefact.FilePath = _businessLogic.UploadFileOnNodeApi(formFile, new List<string>() { ".xml" }, _configuration["UPLOAD_IMPORT_STRUCTURE"]);
                    using (var file = new FileStream(artefactCompare.TargetArtefact.FilePath, FileMode.Create))
                    {
                        formFile.CopyTo(file);
                    }
                }
            }

            var result = _businessLogic.GenerateReportDSD(artefactCompare.SourceArtefact, artefactCompare.TargetArtefact, callCompare, callCompare);

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            return result;
        }
        
        /// <summary>
        /// Generate report with the difference beetween two DSD read from database
        /// </summary>
        /// <param name="sourceId">The id of the original dsd</param>
        /// <param name="sourceAgencyId">The agencyid of the original dsd</param>
        /// <param name="sourceVersion">The version of the original dsd</param>
        /// <param name="targetId">The id of the new dsd</param>
        /// <param name="targetAgencyId">The agencyid of the new dsd</param>
        /// <param name="targetVersion">The version of the new dsd</param>
        /// <returns></returns>
        [HttpGet("CompareCodelist/{sourceId}/{sourceAgencyId}/{sourceVersion}/{targetId}/{targetAgencyId}/{targetVersion}")]
        [Authorize]
        public ActionResult<DsdReport.ItemCompare> CompareCodelist(string sourceId, string sourceAgencyId, string sourceVersion, string targetId, string targetAgencyId, string targetVersion)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            var result = _businessLogic.CompareItems(new ArtefactCompare { ID = sourceId, Agency = sourceAgencyId, Version = sourceVersion, EnumType = SdmxStructureEnumType.CodeList, StreamType = StreamType.Database }, 
                                                    new ArtefactCompare { ID = targetId, Agency = targetAgencyId, Version = targetVersion, EnumType = SdmxStructureEnumType.CodeList, StreamType = StreamType.Database });

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            return result;
        }

        /// <summary>
        /// Generate report with the difference beetween two DSD read from xml (or database)
        /// </summary>
        /// <param name="sourceId">The id of the original dsd</param>
        /// <param name="sourceAgencyId">The agencyid of the original dsd</param>
        /// <param name="sourceVersion">The version of the original dsd</param>
        /// <param name="targetId">The id of the new dsd</param>
        /// <param name="targetAgencyId">The agencyid of the new dsd</param>
        /// <param name="targetVersion">The version of the new dsd</param>
        /// <param name="sourceFile">The source xml file in crypted value, "NULL" for read from database</param>
        /// <param name="targetFile">The target xml file in crypted value, "NULL" for read from database</param>
        /// <returns></returns>
        [HttpGet("CompareCodelistMix/{sourceId}/{sourceAgencyId}/{sourceVersion}/{targetId}/{targetAgencyId}/{targetVersion}")]
        [Authorize]
        public ActionResult<DsdReport.ItemCompare> CompareCodelist(string sourceId, string sourceAgencyId, string sourceVersion, string targetId, string targetAgencyId, string targetVersion, string sourceFile, string targetFile)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            var sourceType = StreamType.Xml;
            if (sourceFile.Equals("NULL", StringComparison.InvariantCultureIgnoreCase))
            {
                sourceType = StreamType.Database;
            }
            var targetType = StreamType.Xml;
            if (targetFile.Equals("NULL", StringComparison.InvariantCultureIgnoreCase))
            {
                targetType = StreamType.Database;
            }

            var result = _businessLogic.CompareItems(new ArtefactCompare { ID = sourceId, Agency = sourceAgencyId, Version = sourceVersion, EnumType = SdmxStructureEnumType.CodeList, StreamType = sourceType, FilePath = sourceType == StreamType.Xml ? Utils.Decrypt(sourceFile, "ITEMCOMPARE") : "" },
                                                    new ArtefactCompare { ID = targetId, Agency = targetAgencyId, Version = targetVersion, EnumType = SdmxStructureEnumType.CodeList, StreamType = targetType, FilePath = targetType == StreamType.Xml ? Utils.Decrypt(targetFile, "ITEMCOMPARE") : "" });

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            return result;
        }

        /// <summary>
        /// Generate report with the difference beetween two DSD
        /// </summary>
        /// <returns></returns>
        [HttpPost("CompareItem/{type}")]
        [DisableRequestSizeLimit, RequestFormLimits(MultipartBodyLengthLimit = int.MaxValue, ValueLengthLimit = int.MaxValue)]
        [Authorize]
        public ActionResult<DsdReport.ItemCompare> CompareItems(List<IFormFile> files, string type, string first, string second)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            var result = commonCompareItems(files, type, first, second);

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            return result;
        }

        /// <summary>
        /// Save marged codelists from nosql db to NSI
        /// </summary>
        /// <returns></returns>
        [HttpPost("SaveMergeCodelist/{lang}")]
        [Authorize]
        public ActionResult<bool> SaveMergeCodelist([FromBody] ArtefactRegistry artefact, string lang)
        {
            var token = _contextAccessor.HttpContext.Session.GetString("NoSqlToken");
            if (string.IsNullOrWhiteSpace(token))
            {
                token = Guid.NewGuid().ToString();
                _contextAccessor.HttpContext.Session.SetString("NoSqlToken", token);
            }

            var artefactMerge = new ArtefactIdentity { ID = "IdUseOnlyForMerge-aea11369-686d-4997-bff1-98853f3c4882", Agency = "MERGE", Version = "1.0", IsFinal = false, EnumType = SdmxStructureEnumType.CodeList };
            _businessLogic.SaveDataSqlLiteForMerge(artefactMerge.ID, artefactMerge.Agency, artefactMerge.Version, artefact, lang, token);

            return true;
        }

        /// <summary>
        /// Merge two codelist and return a new paginated
        /// </summary>
        /// <returns></returns>
        [HttpPost("MergeCodelist/{type}")]
        [DisableRequestSizeLimit, RequestFormLimits(MultipartBodyLengthLimit = int.MaxValue, ValueLengthLimit = int.MaxValue)]
        [Authorize]
        public ActionResult<MergeResult> MergeCodelist(List<IFormFile> files, string type, string first, string second)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            var artefactMerge = new ArtefactIdentity { ID = "IdUseOnlyForMerge-aea11369-686d-4997-bff1-98853f3c4882", Agency = "MERGE", Version = "1.0", IsFinal = false, EnumType = SdmxStructureEnumType.CodeList };

            var conflictItem = new List<string>(); //List of itemcode present in first and second artefact
            Org.Sdmxsource.Sdmx.Api.Model.Objects.ISdmxObjects resultMerge = commonMerge(files, type, first, second, artefactMerge, conflictItem);

            var token = _contextAccessor.HttpContext.Session.GetString("NoSqlToken");
            if (string.IsNullOrWhiteSpace(token))
            {
                token = Guid.NewGuid().ToString();
                _contextAccessor.HttpContext.Session.SetString("NoSqlToken", token);
            }
            var searchInput = new NoSqlSearchParameters();
            if (ControllerContext.HttpContext.Request.Form != null && ControllerContext.HttpContext.Request.Form.ContainsKey("SearchInput"))
            {
                var custData = ControllerContext.HttpContext.Request.Form["SearchInput"];
                if (custData.Count > 0)
                {
                    searchInput = JsonConvert.DeserializeObject<NoSqlSearchParameters>(custData[0]);
                    searchInput.Id = artefactMerge.ID;
                    searchInput.AgencyId = artefactMerge.Agency;
                    searchInput.Version = artefactMerge.Version;
                }
            }

            _businessLogic.PopolateNoSql(artefactMerge.ID, artefactMerge.Agency, artefactMerge.Version, searchInput.Lang, token, resultMerge, conflictItem);
            
            var forTmpTable = false;
            searchInput.Output_ConflictItem = new List<string>();
            searchInput.SearchType = SearchType.Get;
            searchInput.Token = token;
            var res = _businessLogic.SearchPreviewItemSQLite(searchInput, forTmpTable);
            Response.Headers.Add("X-Total-Count", res.Count.ToString());
            var selectedCount = _businessLogic.SelectedCountItemSQLite(searchInput.Id, searchInput.AgencyId, searchInput.Version, searchInput.Lang, token, forTmpTable);
            Response.Headers.Add("X-Selected-Count", selectedCount.ToString());

            var result = new MergeResult { JsonSdmx = res.JsonResult, ItemConflicts = searchInput.Output_ConflictItem, HaveConflicts = searchInput.Output_HaveConflictItem };

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            return result;
        }

        /// <summary>
        /// Merge two artefact and return a new
        /// </summary>
        /// <returns></returns>
        [HttpPost("MergeArtefact/{type}")]
        [DisableRequestSizeLimit, RequestFormLimits(MultipartBodyLengthLimit = int.MaxValue, ValueLengthLimit = int.MaxValue)]
        [Authorize]
        public ActionResult<MergeResult> MergeArtefact(List<IFormFile> files, string type, string first, string second)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            var artefactMerge = new ArtefactIdentity { ID = "IdUseOnlyForMerge-aea11369-686d-4997-bff1-98853f3c4882", Agency = "MERGE", Version = "1.0", IsFinal = false, EnumType = SdmxStructureEnumType.CodeList };

            var conflictItem = new List<string>(); //List of itemcode present in first and second artefact
            Org.Sdmxsource.Sdmx.Api.Model.Objects.ISdmxObjects resultMerge = commonMerge(files, type, first, second, artefactMerge, conflictItem);
            var resultJson = _businessLogic.GetSdmxJsonFromSdmxObjects(resultMerge);

            var result = new MergeResult { JsonSdmx = resultJson, ItemConflicts = conflictItem, HaveConflicts = conflictItem != null && conflictItem.Count > 0 };

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            return result;
        }

        /// <summary>
        /// Read xml file and return an reppresentation of json
        /// </summary>
        /// <returns></returns>
        [HttpPost("PreviewCodelist/{lang}")]
        [DisableRequestSizeLimit, RequestFormLimits(MultipartBodyLengthLimit = int.MaxValue, ValueLengthLimit = int.MaxValue)]
        [Authorize]
        public ActionResult<string> PreviewCodelist(IFormFile file, string lang)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            var artefactPreview = new ArtefactIdentity { ID = "IdUseOnlyForPreview-aea11369-686d-4997-bff1-98853f3c4882", Agency = "MERGE", Version = "1.0", IsFinal = false, EnumType = SdmxStructureEnumType.CodeList };

            var token = _contextAccessor.HttpContext.Session.GetString("NoSqlToken");
            if (string.IsNullOrWhiteSpace(token))
            {
                token = Guid.NewGuid().ToString();
                _contextAccessor.HttpContext.Session.SetString("NoSqlToken", token);
            }
            
            var sdmxObjects = _businessLogic.PreviewArtefact(file, SdmxStructureEnumType.CodeList);

            var searchInput = new NoSqlSearchParameters();
            searchInput.Lang = lang;
            _businessLogic.PopolateNoSql(artefactPreview.ID, artefactPreview.Agency, artefactPreview.Version, searchInput.Lang, token, sdmxObjects);
            
            var forTmpTable = false;
            searchInput.SearchType = SearchType.Get;
            searchInput.Token = token;
            var res = _businessLogic.SearchPreviewItemSQLite(searchInput, forTmpTable);
            Response.Headers.Add("X-Total-Count", res.Count.ToString());
            var selectedCount = _businessLogic.SelectedCountItemSQLite(searchInput.Id, searchInput.AgencyId, searchInput.Version, searchInput.Lang, token, forTmpTable);
            Response.Headers.Add("X-Selected-Count", selectedCount.ToString());

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            return res.JsonResult;
        }

        /// <summary>
        /// Read xml file and return an reppresentation of json
        /// </summary>
        /// <returns></returns>
        [HttpPost("PreviewArtefact/{type}")]
        [DisableRequestSizeLimit, RequestFormLimits(MultipartBodyLengthLimit = int.MaxValue, ValueLengthLimit = int.MaxValue)]
        [Authorize]
        public ActionResult<string> PreviewArtefact(IFormFile file, string type)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            var structureType = ArtefactDataModel.BL.Utility.GetArtefactTypeEnum(type);
            var sdmxObjects = _businessLogic.PreviewArtefact(file, structureType);
            var result = _businessLogic.GetSdmxJsonFromSdmxObjects(sdmxObjects);

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            return result;
        }

        private Org.Sdmxsource.Sdmx.Api.Model.Objects.ISdmxObjects commonMerge(List<IFormFile> files, string type, string first, string second, ArtefactIdentity artefactMerge, List<string> conflictItem)
        {
            Org.Sdmxsource.Sdmx.Api.Model.Objects.ISdmxObjects resultMerge = null;

            var structureType = ArtefactDataModel.BL.Utility.GetArtefactTypeEnum(type);
            var firstArtefact = new ArtefactCompare() { EnumType = structureType, FilePath = Path.GetTempFileName(), StreamType = StreamType.Database };
            var secondArtefact = new ArtefactCompare() { EnumType = structureType, FilePath = Path.GetTempFileName(), StreamType = StreamType.Database };

            if (!string.IsNullOrWhiteSpace(first))
            {
                var artefact = first.Split('+');
                if (artefact.Length > 2)
                {
                    firstArtefact.ID = artefact[0];
                    firstArtefact.Agency = artefact[1];
                    firstArtefact.Version = artefact[2];
                }
            }

            if (!string.IsNullOrWhiteSpace(second))
            {
                var artefact = second.Split('+');
                if (artefact.Length > 2)
                {
                    secondArtefact.ID = artefact[0];
                    secondArtefact.Agency = artefact[1];
                    secondArtefact.Version = artefact[2];
                }
            }

            if (string.IsNullOrWhiteSpace(ControllerContext.HttpContext.Request.ContentType))
            {
                ControllerContext.HttpContext.Request.ContentType = "multipart/form-data";
            }
            if (ControllerContext.HttpContext.Request.Form != null && ControllerContext.HttpContext.Request.Form.ContainsKey("CustomDataFirst"))
            {
                var custData = ControllerContext.HttpContext.Request.Form["CustomDataFirst"];
                if (custData.Count > 0)
                {
                    firstArtefact.ImportedItemCsv = JsonConvert.DeserializeObject<ImportedItemCsvDTO>(custData[0]);
                }
            }
            if (ControllerContext.HttpContext.Request.Form != null && ControllerContext.HttpContext.Request.Form.ContainsKey("CustomDataSecond"))
            {
                var custData = ControllerContext.HttpContext.Request.Form["CustomDataSecond"];
                if (custData.Count > 0)
                {
                    secondArtefact.ImportedItemCsv = JsonConvert.DeserializeObject<ImportedItemCsvDTO>(custData[0]);
                }
            }
            
            try
            {
                var i = 0;
                foreach (var formFile in files)
                {
                    i++;
                    if ((i == 1 && string.IsNullOrWhiteSpace(first)) || (i == 1 && files.Count == 2))
                    { //If first is null, set first file in first artefact
                        //If have 2 file, set first file in first artefact
                        using (var file = new FileStream(firstArtefact.FilePath, FileMode.Create))
                        {
                            formFile.CopyTo(file);
                        }
                        firstArtefact.StreamType = formFile.FileName.ToLowerInvariant().EndsWith("xml") ? StreamType.Xml : StreamType.Csv;
                    }
                    else if (i == 2 || (files.Count == 1 && !string.IsNullOrWhiteSpace(first)))
                    { //If Set 1 file and first Artefact in querystring != null, set the file in second artefat
                        //If have 2 file, set second file in second artefat
                        using (var file = new FileStream(secondArtefact.FilePath, FileMode.Create))
                        {
                            formFile.CopyTo(file);
                        }
                        secondArtefact.StreamType = formFile.FileName.ToLowerInvariant().EndsWith("xml") ? StreamType.Xml : StreamType.Csv;
                    }
                }
                
                resultMerge = _businessLogic.MergeArtefact(firstArtefact, secondArtefact, artefactMerge, conflictItem);
            }
            finally
            {
                if (!string.IsNullOrWhiteSpace(firstArtefact.FilePath) && System.IO.File.Exists(firstArtefact.FilePath))
                {
                    System.IO.File.Delete(firstArtefact.FilePath);
                }
                if (!string.IsNullOrWhiteSpace(secondArtefact.FilePath) && System.IO.File.Exists(secondArtefact.FilePath))
                {
                    System.IO.File.Delete(secondArtefact.FilePath);
                }
            }

            return resultMerge;
        }

        /// <summary>
        /// Generate report with the difference beetween two DSD
        /// </summary>
        /// <returns></returns>
        [HttpPost("CompareItemForFile/{type}/{lang}")]
        [DisableRequestSizeLimit, RequestFormLimits(MultipartBodyLengthLimit = int.MaxValue, ValueLengthLimit = int.MaxValue)]
        [Authorize]
        public IActionResult CompareItemForFile(List<IFormFile> files, string type, string lang, string first, string second)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            var resultCompare = commonCompareItems(files, type, first, second);

            var stream = _businessLogic.GenerateFileCompareItems(resultCompare, lang);

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            return File(stream, "text/plain", $"CompareItems_{resultCompare.SourceArtefact.ID}+{resultCompare.SourceArtefact.AgencyId}+{resultCompare.SourceArtefact.Version}_{resultCompare.TargetArtefact.ID}+{resultCompare.TargetArtefact.AgencyId}+{resultCompare.TargetArtefact.Version}.txt");
        }

        private DsdReport.ItemCompare commonCompareItems(List<IFormFile> files, string type, string first, string second)
        {
            DsdReport.ItemCompare result = null;

            var structureType = ArtefactDataModel.BL.Utility.GetArtefactTypeEnum(type);
            var firstArtefact = new ArtefactCompare() { EnumType = structureType, FilePath = Path.GetTempFileName(), StreamType = StreamType.Database };
            var secondArtefact = new ArtefactCompare() { EnumType = structureType, FilePath = Path.GetTempFileName(), StreamType = StreamType.Database };

            if (!string.IsNullOrWhiteSpace(first))
            {
                var artefact = first.Split('+');
                if (artefact.Length > 2)
                {
                    firstArtefact.ID = artefact[0];
                    firstArtefact.Agency = artefact[1];
                    firstArtefact.Version = artefact[2];
                }
            }

            if (!string.IsNullOrWhiteSpace(second))
            {
                var artefact = second.Split('+');
                if (artefact.Length > 2)
                {
                    secondArtefact.ID = artefact[0];
                    secondArtefact.Agency = artefact[1];
                    secondArtefact.Version = artefact[2];
                }
            }

            if (string.IsNullOrWhiteSpace(ControllerContext.HttpContext.Request.ContentType))
            {
                ControllerContext.HttpContext.Request.ContentType = "multipart/form-data";
            }
            if (ControllerContext.HttpContext.Request.Form != null && ControllerContext.HttpContext.Request.Form.ContainsKey("CustomDataFirst"))
            {
                var custData = ControllerContext.HttpContext.Request.Form["CustomDataFirst"];
                if (custData.Count > 0)
                {
                    firstArtefact.ImportedItemCsv = JsonConvert.DeserializeObject<ImportedItemCsvDTO>(custData[0]);
                }
            }
            if (ControllerContext.HttpContext.Request.Form != null && ControllerContext.HttpContext.Request.Form.ContainsKey("CustomDataSecond"))
            {
                var custData = ControllerContext.HttpContext.Request.Form["CustomDataSecond"];
                if (custData.Count > 0)
                {
                    secondArtefact.ImportedItemCsv = JsonConvert.DeserializeObject<ImportedItemCsvDTO>(custData[0]);
                }
            }

            try
            {
                var i = 0;
                foreach (var formFile in files)
                {
                    i++;
                    if ((i == 1 && string.IsNullOrWhiteSpace(first)) || (i == 1 && files.Count == 2))
                    { //If first is null, set first file in first artefact
                        //If have 2 file, set first file in first artefact
                        using (var file = new FileStream(firstArtefact.FilePath, FileMode.Create))
                        {
                            formFile.CopyTo(file);
                        }
                        firstArtefact.StreamType = formFile.FileName.ToLowerInvariant().EndsWith("xml") ? StreamType.Xml : StreamType.Csv;
                    }
                    else if (i == 2 || (files.Count == 1 && !string.IsNullOrWhiteSpace(first)))
                    { //If Set 1 file and first Artefact in querystring != null, set the file in second artefat
                        //If have 2 file, set second file in second artefat
                        using (var file = new FileStream(secondArtefact.FilePath, FileMode.Create))
                        {
                            formFile.CopyTo(file);
                        }
                        secondArtefact.StreamType = formFile.FileName.ToLowerInvariant().EndsWith("xml") ? StreamType.Xml : StreamType.Csv;
                    }
                }

                result = _businessLogic.CompareItems(firstArtefact, secondArtefact);
            }
            finally
            {
                if (!string.IsNullOrWhiteSpace(firstArtefact.FilePath) && System.IO.File.Exists(firstArtefact.FilePath))
                {
                    System.IO.File.Delete(firstArtefact.FilePath);
                }
                if (!string.IsNullOrWhiteSpace(secondArtefact.FilePath) && System.IO.File.Exists(secondArtefact.FilePath))
                {
                    System.IO.File.Delete(secondArtefact.FilePath);
                }
            }
            return result;
        }



        /// <summary>
        /// Generate report with the difference beetween two DSD
        /// </summary>
        /// <param name="sourceDsdId">The id of the original dsd</param>
        /// <param name="sourceDsdAgencyId">The agencyid of the original dsd</param>
        /// <param name="sourceDsdVersion">The version of the original dsd</param>
        /// <param name="targetDsdId">The id of the new dsd</param>
        /// <param name="targetDsdAgencyId">The agencyid of the new dsd</param>
        /// <param name="targetDsdVersion">The version of the new dsd</param>
        /// <param name="lang">language</param>
        /// <returns></returns>
        [HttpGet("GenerateFileReportDSD/{sourceDsdId}/{sourceDsdAgencyId}/{sourceDsdVersion}/{targetDsdId}/{targetDsdAgencyId}/{targetDsdVersion}/{lang}")]
        [Authorize]
        public IActionResult GenerateFileReportDSD(string sourceDsdId, string sourceDsdAgencyId, string sourceDsdVersion, string targetDsdId, string targetDsdAgencyId, string targetDsdVersion, string lang)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);
            
            Stream stream = null;
            try
            {
                stream = _businessLogic.GenerateFileReportDSD(new ArtefactCompare { ID = sourceDsdId, Agency = sourceDsdAgencyId, Version = sourceDsdVersion, EnumType = SdmxStructureEnumType.Dsd, StreamType = StreamType.Database }, new ArtefactCompare { ID = targetDsdId, Agency = targetDsdAgencyId, Version = targetDsdVersion, EnumType = SdmxStructureEnumType.Dsd, StreamType = StreamType.Database }, lang);
                LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);
                return File(stream, "text/plain", $"Compare_{sourceDsdId}+{sourceDsdAgencyId}+{sourceDsdVersion}_{targetDsdId}+{targetDsdAgencyId}+{targetDsdVersion}.txt");
            }
            catch (Exception)
            {
                if (stream != null)
                {
                    stream.Dispose();
                }
                throw;
            }
            
        }

        /// <summary>
        /// Generate report with the difference beetween two DSD
        /// </summary>
        /// <param name="files">Optional files xml for compare</param>
        /// <param name="lang">language</param>
        /// <returns></returns>
        [HttpPost("GenerateFileReportDSD/{lang}")]
        [Authorize]
        public IActionResult GenerateFileReportDSD(List<IFormFile> files, string lang)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            if (!ControllerContext.HttpContext.Request.Form.ContainsKey("CustomData"))
            {
                throw new InvalidDataException();
            }
            var customData = ControllerContext.HttpContext.Request.Form["CustomData"][0];
            var artefactCompare = JsonConvert.DeserializeObject<DSDArtefactCompareDTO>(customData);

            artefactCompare.SourceArtefact.EnumType = SdmxStructureEnumType.Dsd;
            artefactCompare.TargetArtefact.EnumType = SdmxStructureEnumType.Dsd;


            var i = 0;
            foreach (var formFile in files)
            {
                i++;
                if ((i == 1 && artefactCompare.SourceArtefact.StreamType == StreamType.Xml) || (i == 1 && files.Count == 2))
                { //If first is XML, set first file in first artefact
                  //If have 2 file, set first file in first artefact
                    artefactCompare.SourceArtefact.FilePath = _businessLogic.UploadFileOnNodeApi(formFile, new List<string>() { ".xml" }, _configuration["UPLOAD_IMPORT_STRUCTURE"]);
                    using (var file = new FileStream(artefactCompare.SourceArtefact.FilePath, FileMode.Create))
                    {
                        formFile.CopyTo(file);
                    }
                }
                else if (i == 2 || (files.Count == 1 && artefactCompare.SourceArtefact.StreamType != StreamType.Xml))
                { //If 1 file and first Artefact is Database, set the file in second artefat
                  //If have 2 file, set second file in second artefat
                    artefactCompare.TargetArtefact.FilePath = _businessLogic.UploadFileOnNodeApi(formFile, new List<string>() { ".xml" }, _configuration["UPLOAD_IMPORT_STRUCTURE"]);
                    using (var file = new FileStream(artefactCompare.TargetArtefact.FilePath, FileMode.Create))
                    {
                        formFile.CopyTo(file);
                    }
                }
            }

            Stream stream = null;
            try
            {
                stream = _businessLogic.GenerateFileReportDSD(artefactCompare.SourceArtefact, artefactCompare.TargetArtefact, lang);
                LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);
                return File(stream, "text/plain", $"Compare_{artefactCompare.SourceArtefact.ID}+{artefactCompare.SourceArtefact.Agency}+{artefactCompare.SourceArtefact.Version}_{artefactCompare.TargetArtefact.ID}+{artefactCompare.TargetArtefact.Agency}+{artefactCompare.TargetArtefact.Version}.txt");
            }
            catch (Exception)
            {
                if (stream != null)
                {
                    stream.Dispose();
                }
                throw;
            }

        }


        /// <summary>
        /// Check if the DSD can be replace to the new dsd 
        /// </summary>
        /// <param name="sourceDsdId">The id of the original dsd</param>
        /// <param name="sourceDsdAgencyId">The agencyid of the original dsd</param>
        /// <param name="sourceDsdVersion">The version of the original dsd</param>
        /// <param name="targetDsdId">The id of the new dsd</param>
        /// <param name="targetDsdAgencyId">The agencyid of the new dsd</param>
        /// <param name="targetDsdVersion">The version of the new dsd</param>
        /// <returns></returns>
        [HttpGet("CompareDSD/{sourceDsdId}/{sourceDsdAgencyId}/{sourceDsdVersion}/{targetDsdId}/{targetDsdAgencyId}/{targetDsdVersion}")]
        [Authorize]
        public ActionResult<bool> CompareDSD(string sourceDsdId, string sourceDsdAgencyId, string sourceDsdVersion, string targetDsdId, string targetDsdAgencyId, string targetDsdVersion)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            var result = _businessLogic.CompareDSD(new ArtefactCompare { ID = sourceDsdId, Agency = sourceDsdAgencyId, Version = sourceDsdVersion, EnumType = SdmxStructureEnumType.Dsd, StreamType = StreamType.Database }, new ArtefactCompare { ID = targetDsdId, Agency = targetDsdAgencyId, Version = targetDsdVersion, EnumType = SdmxStructureEnumType.Dsd, StreamType = StreamType.Database });

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            return result;
        }
        
        /// <summary>
        /// Check if the DSD can be replace to the new dsd 
        /// </summary>
        /// <param name="dsdReport">The dsd report</param>
        /// <returns></returns>
        [HttpPost("CompareDSD")]
        [Authorize]
        public ActionResult<bool> CompareReportDSD([FromBody]DsdReport dsdReport)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            var result = _businessLogic.CompareDSD(dsdReport);

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            return result;
        }

        /// <summary>
        /// Check if the DSD can be replace to the new dsd 
        /// </summary>
        /// <param name="dsdId">The id of the original dsd</param>
        /// <param name="dsdAgencyId">The agencyid of the original dsd</param>
        /// <param name="dsdVersion">The version of the original dsd</param>
        /// <returns></returns>
        [HttpGet("GetAllUpgradableDSD/{dsdId}/{dsdAgencyId}/{dsdVersion}")]
        [Authorize]
        public ActionResult<List<DsdWithDataflow>> UpgradableDSD(string dsdId, string dsdAgencyId, string dsdVersion)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            var result = _businessLogic.GetAllUpgradableDSD(new ArtefactIdentity { Agency = dsdAgencyId, ID = dsdId, Version = dsdVersion, EnumType = SdmxStructureEnumType.Dsd });

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            return result;
        }

        /// <summary>
        /// Upgrade source DSD with target DSD
        /// </summary>
        /// <param name="dsdReport">DSD report</param>
        /// <returns></returns>
        [HttpPost("UpgradeDSD")]
        [Authorize]
        public ActionResult<DsdUpgradeReport> UpgradeDSD([FromBody]DsdReport dsdReport)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            var result = _businessLogic.UpgradeDSD(dsdReport);

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            return result;
        }

        /// <summary>
        /// Duplicate artefact from Node to Another
        /// </summary>
        /// <param name="artefactIdentity">Artefact to duplicate</param>
        /// <returns></returns>
        [HttpPost("DuplicateArtefact")]
        public ActionResult<DuplicateArtefactResult> DuplicateArtefact([FromBody]DuplicateArtefactIdentity artefactIdentity)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            var result = _businessLogic.DuplicateArtefact(artefactIdentity);

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            return result;
        }

        /// <summary>
        /// Clone Codelist
        /// </summary>
        /// <param name="id">Artefact id.</param>
        /// <param name="agencyID">Artefact agency.</param>
        /// <param name="version">Artefact version.</param>
        /// <param name="itemCode">Artefact item code</param>
        /// <param name="newId">Id of artefact cloned</param>
        /// <param name="newAgencyID">AgencyId of artefact cloned</param>
        /// <param name="newVersion">Version of artefact cloned</param>
        /// <returns>Codelist</returns>
        [HttpPost("Codelist/Clone/{id}/{agencyID}/{version}/{newId}/{newAgencyID}/{newVersion}")]
        [Authorize]
        public ActionResult<bool> CloneCodelist(string id, string agencyID, string version, string itemCode, string newId, string newAgencyID, string newVersion)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            var result = _businessLogic.CloneCodelist(id, agencyID, version, newId, newAgencyID, newVersion);

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            return result;
        }

        /// <summary>
        /// Remove all Tmp Table from SQL DB
        /// </summary>
        [HttpPost("Utils/RemoveTempTable")]
        [Authorize]
        public void RemoveTempTable()
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            _businessLogic.RemoveTempTable();

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);
        }

        #endregion

        /// <summary>
        /// Updates a DDBDataflow: it controls DDBDataflow and SDMX dataflow are not inconsistent and DDB dataflow is not in production.
        /// If not, it deletes and then creates again the DDB Dataflow.
        /// </summary>
        /// <param df="ddbDF">DDB data input, Conatins:
        /// Dataflow to be updated in DDB.
        /// SDMX-JSON containing dataflow to be re-created in MSDB.
        /// SDMX-JSON containing categorisations to be re-created in MSDB.
        /// HeaderTemplate to be re-created in MSDB.</param>
        /// <returns></returns>
        [HttpPost("updateDDBDataflow")]
        [Authorize]
        public ActionResult<string> UpdateDDBDataflow([FromBody] DFParam df)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            string res = _businessLogic.UpdateDDBDataflow(df.ddbDF, JsonConvert.SerializeObject(df.msdbDF), JsonConvert.SerializeObject(df.msdbCat), df.header);

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            return res;
        }

        /// <summary>
        /// Gets all columns of cube 
        /// </summary>
        /// <param name="idCube">The cube id.</param>
        /// <returns>Column of Cube</returns>
        [HttpGet("FieldForCube/{idCube}")]
        public ActionResult<List<string>> GetFieldForCube(int idCube)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            var results = _businessLogic.GetFieldForCube(idCube);

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            return results;
        }

        /// <summary>
        /// Gets all columns of cube 
        /// </summary>
        /// <param name="idCube">The cube id.</param>
        /// <param name="optionsTable">The filter</param>
        /// <returns>All series of cube</returns>
        [HttpPost("SeriesForCube/{idCube}")]
        public ActionResult<string> GetSeriesForCube(int idCube, [FromBody] DDBDataflow ddbDataflow)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            var results = _businessLogic.GetSeriesForCube(idCube, ddbDataflow);

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            return results;
        }

        /// <summary>
        /// Delete series
        /// </summary>
        /// <param name="idCube">The cube id.</param>
        /// <param name="sId">List of series Id</param>
        [HttpPut("RemoveSeriesForCube/{idCube}")]
        public void DeleteSeries(int idCube, [FromBody] List<int> sId)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);
            try
            {
                _businessLogic.DeleteSeriesForCube(idCube, sId);
            }
            catch (Exception ex)
            {
                throw Utility.Utils.getCustomException("RemoveSeriesForCube",
                   @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - " + ex.Message, Infrastructure.STLogging.Interface.LogLevelEnum.Error);
            }
            

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);
        }

        #region NoSQL

        /// <summary>
        /// Gets a Codelist (if all params are null returns all)
        /// </summary>
        /// <param name="id">Artefact id.</param>
        /// <param name="agencyID">Artefact agency.</param>
        /// <param name="version">Artefact version.</param>
        /// <param name="language">Artefact language.</param>
        /// <returns>Codelist</returns>
        [HttpPost("NOSQL/codelist/{id}/{agencyID}/{version}/{language}/{numPage?}/{pageSize?}")]
        public ActionResult<string> InizializeCodelist(string id, string agencyID, string version, string language)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            var token = _contextAccessor.HttpContext.Session.GetString("NoSqlToken");
            if (string.IsNullOrWhiteSpace(token))
            {
                token = Guid.NewGuid().ToString();
                _contextAccessor.HttpContext.Session.SetString("NoSqlToken", token);
            }

            var res = "";
            _businessLogic.PopolateNoSql(id, agencyID, version, language, token);

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            return res;
        }
        
        /// <summary>
        /// Save codelist change on NSI
        /// </summary>
        /// <param name="codeList">Codelist data.</param>
        /// <param name="id">Artefact id.</param>
        /// <param name="agencyID">Artefact agency.</param>
        /// <param name="version">Artefact version.</param>
        /// <param name="lang">Artefact language.</param>
        /// <returns>Codelist</returns>
        [HttpPost("NOSQL/save/{id}/{agencyID}/{version}/{lang}")]
        [Authorize]
        public ActionResult<bool> SaveCodelist([FromBody] NoSQLCodeList codeList, string id, string agencyID, string version, string lang)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            var token = _contextAccessor.HttpContext.Session.GetString("NoSqlToken");
            if (string.IsNullOrWhiteSpace(token))
            {
                token = Guid.NewGuid().ToString();
                _contextAccessor.HttpContext.Session.SetString("NoSqlToken", token);
            }

            var currentLangSave = lang;
            lang = ""; //In this way we check only the presence of data (no check for specific language)
            _businessLogic.SaveDataSqlLite(id, agencyID, version, lang, token, codeList, currentLangSave);

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            return true;
        }
        
        /// <summary>
        /// Gets a Codelist (if all params are null returns all)
        /// </summary>
        /// <param name="searchInput">Object With
        /// id=Artefact id.
        /// agencyID=Artefact agency.
        /// version=Artefact version.
        /// language=Artefact language.
        /// codeSearch=Text to find.
        /// nameSearch=Text to find.
        /// parentSearch=Text to find.
        /// allSearch=Text to find in code or name or parent.
        /// numPage=number of page, 1 if null
        /// pageSize=page size, unlimited if null or -1
        /// columnOrder=Text to find.
        /// sortDesc=Text to find.</param>
        /// <returns>Codelist</returns>
        [HttpPost("NOSQL/codelist")]
        public ActionResult<string> SearchCodelist([FromBody] NoSqlSearchParameters searchInput)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            searchInput.Output_ConflictItem = null;
            ArtefactSearch artefactSearch = commonSerachCodelistNoSql(searchInput);

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            return artefactSearch.JsonResult;
        }

        /// <summary>
        /// Gets a Codelist for the preview merge (if all params are null returns all)
        /// </summary>
        /// <param name="searchInput">Object With
        /// id=Artefact id.
        /// agencyID=Artefact agency.
        /// version=Artefact version.
        /// language=Artefact language.
        /// codeSearch=Text to find.
        /// nameSearch=Text to find.
        /// parentSearch=Text to find.
        /// allSearch=Text to find in code or name or parent.
        /// numPage=number of page, 1 if null
        /// pageSize=page size, unlimited if null or -1
        /// columnOrder=Text to find.
        /// sortDesc=Text to find.</param>
        /// <returns>Codelist</returns>
        [HttpPost("NOSQL/searchmerge/codelist")]
        public ActionResult<MergeResult> SearchMergeCodelist([FromBody] NoSqlSearchParameters searchInput)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            searchInput.Output_ConflictItem = new List<string>();
            ArtefactSearch artefactSearch = commonSerachCodelistNoSql(searchInput);

            var mergeResult = new MergeResult { JsonSdmx = artefactSearch.JsonResult, ItemConflicts = searchInput.Output_ConflictItem, HaveConflicts = searchInput.Output_HaveConflictItem };

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);
            
            return mergeResult;
        }

        private ArtefactSearch commonSerachCodelistNoSql(NoSqlSearchParameters searchInput)
        {
            var token = _contextAccessor.HttpContext.Session.GetString("NoSqlToken");
            if (string.IsNullOrWhiteSpace(token))
            {
                token = Guid.NewGuid().ToString();
                _contextAccessor.HttpContext.Session.SetString("NoSqlToken", token);
            }

            searchInput.SearchType = SearchType.Get;
            searchInput.Token = token;
            ArtefactSearch res = _businessLogic.SearchItemSQLite(searchInput);

            Response.Headers.Add("X-Total-Count", res.Count.ToString());

            return res;
        }

        /// <summary>
        /// Gets a Codelist (if all params are null returns all)
        /// </summary>
        /// <param name="searchInput">Object With
        /// id=Artefact id.
        /// agencyID=Artefact agency.
        /// version=Artefact version.
        /// language=Artefact language.
        /// codeSearch=Text to find.
        /// nameSearch=Text to find.
        /// parentSearch=Text to find.
        /// allSearch=Text to find in code or name or parent.
        /// itemCode=item code for parents
        /// numPage=number of page, 1 if null
        /// pageSize=page size, unlimited if null or -1
        /// columnOrder=Text to find.
        /// sortDesc=Text to find.</param>
        /// <returns>Codelist</returns>
        [HttpPost("NOSQL/ParentsAvailable")]
        public ActionResult<string> ParentsAvailable([FromBody] NoSqlSearchParameters searchInput)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            var token = _contextAccessor.HttpContext.Session.GetString("NoSqlToken");
            if (string.IsNullOrWhiteSpace(token))
            {
                token = Guid.NewGuid().ToString();
                _contextAccessor.HttpContext.Session.SetString("NoSqlToken", token);
            }

            searchInput.SearchType = SearchType.ParentsAvailable;
            searchInput.Token = token;
            var res = _businessLogic.SearchItemSQLite(searchInput);
            Response.Headers.Add("X-Total-Count", res.Count.ToString());

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            return res.JsonResult;
        }

        /// <summary>
        /// Gets a Codelist (if all params are null returns all)
        /// </summary>
        /// <param name="id">Artefact id.</param>
        /// <param name="agencyID">Artefact agency.</param>
        /// <param name="version">Artefact version.</param>
        /// <returns>Codelist</returns>
        [HttpGet("NOSQL/countcodelist/{id}/{agencyID}/{version}")]
        public ActionResult<long> CountCodelist(string id, string agencyID, string version)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            var token = _contextAccessor.HttpContext.Session.GetString("NoSqlToken");
            if (string.IsNullOrWhiteSpace(token))
            {
                token = Guid.NewGuid().ToString();
                _contextAccessor.HttpContext.Session.SetString("NoSqlToken", token);
            }

            var res = _businessLogic.CountItemSQLite(id, agencyID, version, token);

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            return res;
        }

        /// <summary>
        /// Gets a Codelist (if all params are null returns all)
        /// </summary>
        /// <param name="id">Artefact id.</param>
        /// <param name="agencyID">Artefact agency.</param>
        /// <param name="version">Artefact version.</param>
        /// <param name="lang">Artefact language.</param>
        /// <param name="item">Artefact item.</param>
        /// <returns>Codelist</returns>
        [HttpPost("NOSQL/insert/{id}/{agencyID}/{version}/{lang}")]
        [Authorize]
        public ActionResult<bool> InsertItemCodelist([FromBody] NoSQLCodeListItem item, string id, string agencyID, string version, string lang)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            var token = _contextAccessor.HttpContext.Session.GetString("NoSqlToken");
            if (string.IsNullOrWhiteSpace(token))
            {
                token = Guid.NewGuid().ToString();
                _contextAccessor.HttpContext.Session.SetString("NoSqlToken", token);
            }

            _businessLogic.InsertItemSQLite(id, agencyID, version, lang, token, item);

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            return true;
        }

        /// <summary>
        /// Gets a Codelist (if all params are null returns all)
        /// </summary>
        /// <param name="id">Artefact id.</param>
        /// <param name="agencyID">Artefact agency.</param>
        /// <param name="version">Artefact version.</param>
        /// <param name="lang">Artefact language.</param>
        /// <param name="item">Artefact item.</param>
        /// <returns>Codelist</returns>
        [HttpPost("NOSQL/move/{id}/{agencyID}/{version}/{lang}")]
        [Authorize]
        public ActionResult<bool> MoveItemCodelist([FromBody] NoSQLMoveCodeListItem item, string id, string agencyID, string version, string lang)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            var token = _contextAccessor.HttpContext.Session.GetString("NoSqlToken");
            if (string.IsNullOrWhiteSpace(token))
            {
                token = Guid.NewGuid().ToString();
                _contextAccessor.HttpContext.Session.SetString("NoSqlToken", token);
            }

            _businessLogic.MoveItemSQLite(id, agencyID, version, lang, token, item);

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            return true;
        }

        /// <summary>
        /// Gets a Codelist (if all params are null returns all)
        /// </summary>
        /// <param name="id">Artefact id.</param>
        /// <param name="agencyID">Artefact agency.</param>
        /// <param name="version">Artefact version.</param>
        /// <param name="lang">Artefact language.</param>
        /// <param name="item">Item</param>
        /// <returns>Codelist</returns>
        [HttpPut("NOSQL/update/{id}/{agencyID}/{version}/{lang}")]
        [Authorize]
        public ActionResult<bool> UpdateItemCodelist([FromBody] NoSQLCodeListItem item, string id, string agencyID, string version, string lang)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            var token = _contextAccessor.HttpContext.Session.GetString("NoSqlToken");
            if (string.IsNullOrWhiteSpace(token))
            {
                token = Guid.NewGuid().ToString();
                _contextAccessor.HttpContext.Session.SetString("NoSqlToken", token);
            }

            _businessLogic.UpdateItemSQLite(id, agencyID, version, lang, token, item);

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            return true;
        }

        /// <summary>
        /// Gets a Codelist (if all params are null returns all)
        /// </summary>
        /// <param name="id">Artefact id.</param>
        /// <param name="agencyID">Artefact agency.</param>
        /// <param name="version">Artefact version.</param>
        /// <param name="itemCode">Artefact item code</param>
        /// <param name="lang">Language</param>
        /// <param name="autoSave">Autosave</param>
        /// <returns>Codelist</returns>
        [HttpDelete("NOSQL/codelist/{id}/{agencyID}/{version}/{itemCode}/{lang}/{autoSave}")]
        [Authorize]
        public ActionResult<bool> DeleteItemCodelist(string id, string agencyID, string version, string itemCode, string lang, bool autoSave = false)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            var token = _contextAccessor.HttpContext.Session.GetString("NoSqlToken");
            if (string.IsNullOrWhiteSpace(token))
            {
                token = Guid.NewGuid().ToString();
                _contextAccessor.HttpContext.Session.SetString("NoSqlToken", token);
            }

            _businessLogic.DeleteItemSQLite(id, agencyID, version, lang, token, itemCode, autoSave);

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            return true;
        }
        

        /// <summary>
        /// Gets a TMP Codelist (if all params are null returns all)
        /// </summary>
        /// <param name="searchInput">Object With
        /// id=Artefact id.
        /// agencyID=Artefact agency.
        /// version=Artefact version.
        /// language=Artefact language.
        /// codeSearch=Text to find.
        /// nameSearch=Text to find.
        /// parentSearch=Text to find.
        /// allSearch=Text to find in code or name or parent.
        /// numPage=number of page, 1 if null
        /// pageSize=page size, unlimited if null or -1
        /// columnOrder=Text to find.
        /// sortDesc=Text to find.</param>
        /// <param name="forTmpTable">Search item in preview table or codelist table</param>
        /// <returns>Codelist</returns>
        [HttpPost("NOSQL/Preview/codelist/{forTmpTable}")]
        public ActionResult<string> SearchPreviewCodelist([FromBody] NoSqlSearchParameters searchInput, bool forTmpTable)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            var token = _contextAccessor.HttpContext.Session.GetString("NoSqlToken");
            if (string.IsNullOrWhiteSpace(token))
            {
                token = Guid.NewGuid().ToString();
                _contextAccessor.HttpContext.Session.SetString("NoSqlToken", token);
            }

            searchInput.SearchType = SearchType.Get;
            searchInput.Token = token;
            var res = _businessLogic.SearchPreviewItemSQLite(searchInput, forTmpTable);
            Response.Headers.Add("X-Total-Count", res.Count.ToString());
            var selectedCount = _businessLogic.SelectedCountItemSQLite(searchInput.Id, searchInput.AgencyId, searchInput.Version, searchInput.Lang, token, forTmpTable);
            Response.Headers.Add("X-Selected-Count", selectedCount.ToString());

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            return res.JsonResult;
        }

        /// <summary>
        /// Set item selected in TMP Codelist 
        /// </summary>
        /// <param name="ItemCode">List of Item Code</param>
        /// <param name="isSelected">set selected to true o false</param>
        /// <param name="id">Artefact id.</param>
        /// <param name="agencyID">Artefact agency.</param>
        /// <param name="version">Artefact version.</param>
        /// <param name="lang">Artefact language.</param>
        /// <returns>Codelist</returns>
        [HttpPost("NOSQL/Preview/SelectedItem/{isSelected}/{id}/{agencyID}/{version}/{lang}")]
        public ActionResult<bool> PreviewSelectedItem([FromBody] List<string> ItemCode, bool isSelected, string id, string agencyID, string version, string lang)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            var token = _contextAccessor.HttpContext.Session.GetString("NoSqlToken");
            if (string.IsNullOrWhiteSpace(token))
            {
                token = Guid.NewGuid().ToString();
                _contextAccessor.HttpContext.Session.SetString("NoSqlToken", token);
            }

            _businessLogic.SetWorkingSelectedItem(true, ItemCode, isSelected, id, agencyID, version, lang, token);

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            return true;
        }

        /// <summary>
        /// Set item selected in TMP Codelist 
        /// </summary>
        /// <param name="ItemCode">List of Item Code</param>
        /// <param name="isSelected">set selected to true o false</param>
        /// <param name="id">Artefact id.</param>
        /// <param name="agencyID">Artefact agency.</param>
        /// <param name="version">Artefact version.</param>
        /// <param name="lang">Artefact language.</param>
        /// <returns>Codelist</returns>
        [HttpPost("NOSQL/SelectedItem/{isSelected}/{id}/{agencyID}/{version}/{lang}")]
        public ActionResult<bool> SelectedItem([FromBody] List<string> ItemCode, bool isSelected, string id, string agencyID, string version, string lang)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            var token = _contextAccessor.HttpContext.Session.GetString("NoSqlToken");
            if (string.IsNullOrWhiteSpace(token))
            {
                token = Guid.NewGuid().ToString();
                _contextAccessor.HttpContext.Session.SetString("NoSqlToken", token);
            }

            _businessLogic.SetWorkingSelectedItem(false, ItemCode, isSelected, id, agencyID, version, lang, token);

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            return true;
        }

        /// <summary>
        /// Store the selected item in TMP Codelist 
        /// </summary>
        /// <param name="isTmpTable">Use tmp table.</param>
        /// <param name="id">Artefact id.</param>
        /// <param name="agencyID">Artefact agency.</param>
        /// <param name="version">Artefact version.</param>
        /// <param name="lang">Artefact language.</param>
        /// <param name="selectParent">include parent of selected items</param>
        /// <param name="selectChildren">include children of selected items</param>
        /// <param name="selectDescending">include descending of selected items</param>
        /// <param name="flatTree">remove the parent of selected item</param>
        /// <returns>Codelist</returns>
        [HttpPost("NOSQL/Preview/StoreSelectedItem/{isTmpTable}/{id}/{agencyID}/{version}/{lang}/{selectParent}/{selectChildren}/{selectDescending}/{flatTree}")]
        public ActionResult<bool> StoreWorkingIsSelected(bool isTmpTable, string id, string agencyID, string version, string lang, bool selectParent, bool selectChildren, bool selectDescending, bool flatTree)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            var token = _contextAccessor.HttpContext.Session.GetString("NoSqlToken");
            if (string.IsNullOrWhiteSpace(token))
            {
                token = Guid.NewGuid().ToString();
                _contextAccessor.HttpContext.Session.SetString("NoSqlToken", token);
            }

            _businessLogic.StoreWorkingIsSelected(isTmpTable, id, agencyID, version, lang, token, selectParent, selectChildren, selectDescending, flatTree);

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            return true;
        }

        /// <summary>
        /// Save codelist change on NSI
        /// </summary>
        /// <param name="newCodeList">New codelist data.</param>
        /// <param name="id">Artefact id.</param>
        /// <param name="agencyID">Artefact agency.</param>
        /// <param name="version">Artefact version.</param>
        /// <param name="lang">Artefact language.</param>
        /// <returns>Codelist</returns>
        [HttpPost("NOSQL/save/Preview/{id}/{agencyID}/{version}/{lang}")]
        [Authorize]
        public ActionResult<bool> SavePreviewCodelist([FromBody] NoSQLCodeList newCodeList, string id, string agencyID, string version, string lang)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            var token = _contextAccessor.HttpContext.Session.GetString("NoSqlToken");
            if (string.IsNullOrWhiteSpace(token))
            {
                token = Guid.NewGuid().ToString();
                _contextAccessor.HttpContext.Session.SetString("NoSqlToken", token);
            }

            _businessLogic.CreateNewCodelistFromPreview(id, agencyID, version, lang, token, newCodeList);

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            return true;
        }
        
        /// <summary>
        /// Create a TMP Codelist (copy the CodeList in a TMP table)
        /// </summary>
        /// <param name="id">Artefact id.</param>
        /// <param name="agencyID">Artefact agency.</param>
        /// <param name="version">Artefact version.</param>
        /// <param name="language">Artefact language.</param>
        /// <returns>Codelist</returns>
        [HttpPost("NOSQL/Preview/codelist/{id}/{agencyID}/{version}/{language}")]
        public ActionResult<bool> PreviewInizializeCodelist(string id, string agencyID, string version, string language)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            var token = _contextAccessor.HttpContext.Session.GetString("NoSqlToken");
            if (string.IsNullOrWhiteSpace(token))
            {
                token = Guid.NewGuid().ToString();
                _contextAccessor.HttpContext.Session.SetString("NoSqlToken", token);
            }

            _businessLogic.InizializePreviewCodelist(id, agencyID, version, language, token);

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            return true;
        }

        /// <summary>
        /// Set item selected in TMP Codelist 
        /// </summary>
        /// <param name="searchInput">Object With
        /// id=Artefact id.
        /// agencyID=Artefact agency.
        /// version=Artefact version.
        /// language=Artefact language.
        /// codeSearch=Text to find.
        /// nameSearch=Text to find.
        /// parentSearch=Text to find.
        /// allSearch=Text to find in code or name or parent.
        /// numPage=number of page, 1 if null
        /// pageSize=page size, unlimited if null or -1
        /// columnOrder=Text to find.
        /// sortDesc=Text to find.</param>
        /// <param name="forTmpTable">Search item in preview table or codelist table</param>
        /// <param name="isSelected">set selected to true o false</param>
        /// <param name="id">Artefact id.</param>
        /// <param name="agencyID">Artefact agency.</param>
        /// <param name="version">Artefact version.</param>
        /// <param name="lang">Artefact language.</param>
        /// <returns>Codelist</returns>
        [HttpPost("NOSQL/SelectAllItem/{forTmpTable}/{isSelected}/{id}/{agencyID}/{version}/{lang}")]
        public ActionResult<bool> SelectAllItem([FromBody] NoSqlSearchParameters searchInput, bool forTmpTable, bool isSelected, string id, string agencyID, string version, string lang)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            var token = _contextAccessor.HttpContext.Session.GetString("NoSqlToken");
            if (string.IsNullOrWhiteSpace(token))
            {
                token = Guid.NewGuid().ToString();
                _contextAccessor.HttpContext.Session.SetString("NoSqlToken", token);
            }

            searchInput.SearchType = SearchType.Get;
            searchInput.Token = token;
            var searchPreview = _businessLogic.SearchPreviewItemSQLite(searchInput, forTmpTable, false);
            _businessLogic.SetAllWorkingSelectedItem(forTmpTable, isSelected, id, agencyID, version, lang, token, searchPreview);

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            return true;
        }


        /// <summary>
        /// Drop TMP Codelist, and reset WorkingSelected
        /// </summary>
        /// <param name="id">Artefact id.</param>
        /// <param name="agencyID">Artefact agency.</param>
        /// <param name="version">Artefact version.</param>
        /// <returns>Codelist</returns>
        [HttpDelete("NOSQL/PreviewEmpty/{id}/{agencyID}/{version}")]
        public ActionResult<bool> PreviewEmpty(string id, string agencyID, string version)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            var token = _contextAccessor.HttpContext.Session.GetString("NoSqlToken");
            if (string.IsNullOrWhiteSpace(token))
            {
                token = Guid.NewGuid().ToString();
                _contextAccessor.HttpContext.Session.SetString("NoSqlToken", token);
            }

            _businessLogic.PreviewEmpty(id, agencyID, version, token);

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            return true;
        }

        /// <summary>
        /// Check if preview is valid
        /// </summary>
        /// <param name="id">Artefact id.</param>
        /// <param name="agencyID">Artefact agency.</param>
        /// <param name="version">Artefact version.</param>
        /// <param name="lang">Artefact language.</param>
        /// <returns>Codelist</returns>
        [HttpGet("NOSQL/PreviewIsValid/{id}/{agencyID}/{version}/{lang}")]
        public ActionResult<bool> PreviewIsValid(string id, string agencyID, string version, string lang)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            var token = _contextAccessor.HttpContext.Session.GetString("NoSqlToken");
            if (string.IsNullOrWhiteSpace(token))
            {
                token = Guid.NewGuid().ToString();
                _contextAccessor.HttpContext.Session.SetString("NoSqlToken", token);
            }

            var result = _businessLogic.PreviewIsValid(id, agencyID, version, lang, token);

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            return result;
        }

        /// <summary>
        /// Copy annotation order from lang to other langs of codelist
        /// </summary>
        /// <param name="id">Artefact id.</param>
        /// <param name="agencyID">Artefact agency.</param>
        /// <param name="version">Artefact version.</param>
        /// <param name="sourceLang">Copy from language.</param>
        /// <param name="targetLangs">Past to languages.</param>
        /// <returns></returns>
        [HttpPost("NOSQL/copyorder/{id}/{agencyID}/{version}/{sourceLang}")]
        [Authorize]
        public ActionResult<bool> CopyOrder([FromBody] List<string> targetLangs, string id, string agencyID, string version, string sourceLang)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            var token = _contextAccessor.HttpContext.Session.GetString("NoSqlToken");
            if (string.IsNullOrWhiteSpace(token))
            {
                token = Guid.NewGuid().ToString();
                _contextAccessor.HttpContext.Session.SetString("NoSqlToken", token);
            }
            
            _businessLogic.CopyOrderSqlLite(id, agencyID, version, sourceLang, targetLangs, token);

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            return true;
        }

        #endregion

    }
}
