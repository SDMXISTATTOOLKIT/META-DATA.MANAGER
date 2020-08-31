using AuthCore;
using AuthCore.Interface;
using AuthCore.Model;
using AuthCore.Utils;
using DataFactory;
using DataModel;
using DataProvider;
using DDB.Entities;
using DM_API_WS.DTO;
using Infrastructure.STLogging.Factory;
using Infrastructure.STLogging.Interface;
using Infrastructure.Utils;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.StaticFiles;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.FileProviders;
using Microsoft.Extensions.Options;
using Newtonsoft.Json.Linq;
using NSI.Entities;
using Org.Sdmxsource.Sdmx.Api.Model.Objects.CategoryScheme;
using Org.Sdmxsource.Sdmx.Api.Model.Objects.DataStructure;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Data.Common;
using System.IO;
using System.IO.Compression;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Security.Principal;
using System.Threading.Tasks;

namespace DM_API_WS.Controllers
{
    /// <summary>
    /// DM API
    /// </summary>
    [Route("api/DMApi")]
    [ApiController]
    public class DMApiController : ControllerBase
    {
        readonly IWebHostEnvironment _env;
        readonly IOptionsMonitor<AuthAppOptions> _authAppConfig;
        readonly IConfiguration _configuration;
        readonly ISTLogger _logger;
        readonly IUserData _userData;
        readonly IMemoryCache _memoryCache;

        /// <summary>
        /// Constructor
        /// </summary>
        public DMApiController(IWebHostEnvironment env, IOptionsMonitor<AuthAppOptions> authAppConfig, IConfiguration configuration, IUserData userData, IMemoryCache memoryCache)
        {
            _env = env;
            _authAppConfig = authAppConfig;
            _configuration = configuration;
            _logger = STLoggerFactory.Logger;
            _userData = userData;
            _memoryCache = memoryCache;
        }

        /// <summary>
        /// Returns 200 if the server is UP
        /// </summary>
        /// <returns></returns>
        [HttpGet("Ping")]
        public HttpResponseMessage Ping()
        {
            return new HttpResponseMessage(HttpStatusCode.OK);
        }


        #region Metodi Builder

        /// <summary>
        /// Returns the list of cubes in the DDB that are visible for the current user.
        /// </summary>
        /// <returns></returns>
        [HttpGet("Builder/getAvailableCubes")]
        public JsonResult GetAvailableCubes()
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            List<Cube> cc = Factory.BuilderDataProv.getAvailableCubes();
            List<Cube> res = filterCubesByUser(cc, HttpContext.User.Identity);

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            return new JsonResult(res);
        }

        /// <summary>
        /// Returns the list of cubes in the DDB.
        /// </summary>
        /// <returns></returns>
        [HttpGet("Builder/getAvailableCubesNoFilter")]
        public JsonResult GetAvailableCubesNoFilter()
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            List<Cube> res = Factory.BuilderDataProv.getAvailableCubes();

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            return new JsonResult(res);
        }

        /// <summary>
        /// Returns the requested cube with Attributes, Dimensions and Measures.
        /// </summary>
        /// <param name="cubeId">The cube id.</param>
        /// <returns>The requested cube or 403 if the current user cannot view the cube.</returns>
        [HttpGet("Builder/getCube/{cubeId}")]
        public JsonResult GetCube(int cubeId)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            var cube = Factory.BuilderDataProv.getCube(cubeId);
            if (!UserUtils.HaveCube(HttpContext.User.Identity, cube.Code))
            {
                HttpContext.Response.StatusCode = 403; //Forbidden
                return new JsonResult("");
            }

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            return new JsonResult(cube);
        }

        /// <summary>
        /// Creates a cube in the DDB with Attributes, Dimensions and Measures.
        /// </summary>
        /// <param name="cube">The cube to be created.</param>
        /// <returns>The cube id in case of success, 403 if the cube is categorized in a category the user cannot edit in.</returns>
        [HttpPost("Builder/createCube")]
        public JsonResult CreateCube(CubeWithDetails cube)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            List<Category> cats = Factory.BuilderDataProv.getDCS();

            if (!UserUtils.HaveCategory(HttpContext.User.Identity, cats.Where(x => x.IDCat == cube.IDCat).Select(y => y.CatCode).Single()))
            {
                HttpContext.Response.StatusCode = 403; //Forbidden
                return new JsonResult("");
            }
            int res = Factory.BuilderDataProv.createCube(cube);

            var authManager = new AuthManager(_authAppConfig);

            authManager.SynchronizeAuthDB(true, false, null, false, null, false, null); //Sync Only Cube & Cat
            authManager.AddCube(_userData.Username, cube.Code, true);

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            return new JsonResult(res);
        }

        /// <summary>
        /// Deletes a cube together with its associated information.
        /// </summary>
        /// <param name="cubeId">The id of the cube to be deleted.</param>
        /// <returns>True in case of success, 403 if the current user cannot view the cube</returns>
        [HttpDelete("Builder/deleteCube")]
        public JsonResult DeleteCube(int cubeId)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            var authManager = new AuthManager(_authAppConfig);

            var cubeCode = authManager.GetCubeCodeFromId(cubeId);
            if (!UserUtils.HaveCube(HttpContext.User.Identity, cubeCode))
            {
                HttpContext.Response.StatusCode = 403; //Forbidden
                return new JsonResult("");
            }
            bool res = Factory.BuilderDataProv.deleteCube(cubeId);

            authManager.SynchronizeAuthDB(true, false, null, false, null, false, null); //Sync Only Cube & Cat

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            return new JsonResult(res);
        }

        /// <summary>
        /// Imports the Default Category Scheme from the MSDB.
        /// </summary>
        /// <param name="catSch">The CategoryScheme in JSON format</param>
        /// <param name="agencyId">The CategoryScheme AgencyId</param>
        /// <param name="orderAnnType">Annotation type for handling the order of the items</param>
        [HttpPost("Builder/importDCSFromMSDB")]
        public JsonResult ImportDCSFromMSDB([FromBody] string catSch, string agencyId, string orderAnnType)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            ICategorySchemeObject[] arr = Utility.SdmxUtils.getCategorySchemeFromJson(catSch, agencyId);
            bool res = Factory.BuilderDataProv.importDCSFromMSDB(arr[0], orderAnnType);

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            return new JsonResult(res);
        }

        /// <summary>
        /// Returns the list of categories in the Default Category Scheme.
        /// </summary>
        [HttpGet("Builder/getDCS")]
        public JsonResult GetDCS()
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            List<Category> res = Factory.BuilderDataProv.getDCS();

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            return new JsonResult(res);
        }

        /// <summary>
        /// Insert category in the Default Category Scheme.
        /// </summary>
        /// <param name="category">The Category to be inserted.</param>
        /// <returns>The category id in case of success, otherwise an exception is thrown.</returns>
        [HttpPost("Builder/InsertDCS")]
        public JsonResult InsertDCS([FromBody] Category category)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            var res = Factory.BuilderDataProv.InsertDCS(category);

            if (res > 0)
            {
                new AuthManager(_authAppConfig).SynchronizeAuthDB(true, false, null, false, null, false, null); //Sync Only Cube & Cat
            }

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            return new JsonResult(res);
        }

        /// <summary>
        /// Update category in the Default Category Scheme.
        /// </summary>
        /// <param name="category">The Category to be updated.</param>
        /// <returns></returns>
        [HttpPut("Builder/UpdateDCS")]
        public HttpResponseMessage UpdateDCS([FromBody] Category category)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            Factory.BuilderDataProv.UpdateDCS(category);

            new AuthManager(_authAppConfig).SynchronizeAuthDB(true, false, null, false, null, false, null); //Sync Only Cube & Cat

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            return new HttpResponseMessage(HttpStatusCode.OK);
        }

        /// <summary>
        /// Delete category from the Default Category Scheme.
        /// </summary>
        /// <param name="catCode">The Category Code to be deleted.</param>
        /// <returns>True in case of success, false if try to delete category with children or assign to cube.</returns>
        [HttpDelete("Builder/DeleteDCS/{catCode}")]
        public JsonResult DeleteDCS(string catCode)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            var result = Factory.BuilderDataProv.DeleteDCS(catCode);

            if (result)
            {
                new AuthManager(_authAppConfig).SynchronizeAuthDB(true, false, null, false, null, false, null); //Sync Only Cube & Cat
            }

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            return new JsonResult(result);
        }

        #endregion Metodi Builder

        #region Metodi Mapping

        /// <summary>
        /// Returns the list of mappings the current user can view WITHOUT their components.
        /// </summary>
        [HttpGet("Mapping/getDDBMappings")]
        public JsonResult GetDDBMappings()
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            List<Mapping> res = Factory.MappingDataProv.getDDBMappings()
                                .Where(m => UserUtils.HaveCube(HttpContext.User.Identity, new AuthManager(_authAppConfig).GetCubeCodeFromId(m.IDCube))).ToList();

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            return new JsonResult(res);
        }

        /// <summary>
        /// Returns the requested mapping with its components.
        /// </summary>
        /// <param name="idMapping">The mapping id.</param>
        /// <returns>The requested mapping or 403 if the current user cannot view the mapping.</returns>
        [HttpGet("Mapping/getDDBMapping/{idMapping}")]
        public JsonResult GetDDBMapping(int idMapping)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            MappingWithComponents res = Factory.MappingDataProv.getDDBMapping(idMapping);

            if (!UserUtils.HaveCube(HttpContext.User.Identity, new AuthManager(_authAppConfig).GetCubeCodeFromId(res.IDCube)))
            {
                HttpContext.Response.StatusCode = 403; //Forbidden
                return new JsonResult("");
            }

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            return new JsonResult(res);
        }

        /// <summary>
        /// Creates a new mapping with its components.
        /// </summary>
        /// <param name="mapp">The mapping to be created.</param>
        /// <returns>The mapping id or 403 if the current user cannot create the mapping</returns>
        [HttpPost("Mapping/createDDBMapping")]
        public JsonResult CreateDDBMapping(MappingWithComponents mapp)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            if (!UserUtils.HaveCube(HttpContext.User.Identity, new AuthManager(_authAppConfig).GetCubeCodeFromId(mapp.IDCube)))
            {
                HttpContext.Response.StatusCode = 403; //Forbidden
                return new JsonResult("");
            }

            int res = Factory.MappingDataProv.createDDBMapping(mapp);

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            return new JsonResult(res);
        }

        /// <summary>
        /// Deletes a mapping together with its components.
        /// </summary>
        /// <param name="idMapping">The id of the mapping to be deleted.</param>
        /// <returns></returns>
        [HttpDelete("Mapping/deleteDDBMapping")]
        public JsonResult DeleteDDBMapping(int idMapping)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            GetDDBMapping(idMapping); //throws 403 if Forbidden

            bool res = Factory.MappingDataProv.deleteDDBMapping(idMapping);

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            return new JsonResult(res);
        }

        /// <summary>
        /// Returns the header of a CSV file. If the file is not a CSV file or is empty an exception is thrown. 
        /// If the file has no header, an array of string "Col 1, …, Col N" is returned.
        /// </summary>
        /// <param name="CSVSeparator">CSV separator used in the file.</param>
        /// <param name="CSVDelimiter">CSV delimiter used in the file.</param>
        /// <param name="hasHeader">Whether the CSV file has a header or not.</param>
        /// <param name="filePath">Path of the CSV file.</param>
        /// <returns>A list with the name of the columns to be shown in Mapping.</returns>
        [HttpGet("Mapping/getCSVHeader/{CSVSeparator}/{hasHeader}/{CSVDelimiter?}")]
        public JsonResult GetCSVHeader(char CSVSeparator, bool hasHeader, string filePath, char? CSVDelimiter)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            string[] res = Factory.MappingDataProv.getCSVHeader(CSVSeparator, CSVDelimiter.HasValue ? CSVDelimiter.Value : char.MinValue, hasHeader, filePath);

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            return new JsonResult(res);
        }

        #endregion Metodi Mapping

        #region Metodi Loader

        /// <summary>
        /// Imports data in a cube (with Series, Data or SeriesAndData Import Type)
        /// </summary>
        /// <param name="importType">Import Type (Series, Data or SeriesAndData).</param>
        /// <param name="CSVSeparator">CSV separator used in the file.</param>
        /// <param name="CSVDelimiter">CSV delimiter used in the file.</param>
        /// <param name="hasHeader">Whether the CSV file has a header or not.</param>
        /// <param name="tid">Table Identifier</param>
        /// <param name="idMapping">Id of the mapping to whom the table refers. It is 0 if you are trying to import an SDMX file and so mapping does not exist.</param>
        /// <param name="idCube">Id of the cube where data are imported.</param>
        /// <param name="filePath">Path of the file from whom the temp table has been generated.</param>
        /// <param name="idMappingSpecialTimePeriod">(Optional) Id of the mapping with time period in .STAT format.</param>
        /// <param name="embargo">Whether the data have to be embargoed or not.</param>
        /// <param name="ignoreCuncurrentUpload">Ignore cuncurrency upload protection</param>
        /// <param name="checkFiltAttributes">Whether to check the coherence of attributes on FiltS table or not</param>
        /// <returns></returns>
        [HttpGet("Loader/importCSVData/{CSVSeparator}/{hasHeader}/{importType}/{idCube}/{idMapping}/{CSVDelimiter?}")]
        public JsonResult ImportCSVData(char CSVSeparator, bool hasHeader, string tid, ImportTypeEnum importType, int idCube, int idMapping, string filePath, char? CSVDelimiter, int idMappingSpecialTimePeriod = 0, bool embargo = false, bool ignoreCuncurrentUpload = false, bool checkFiltAttributes = false)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name + $"\ttid:{tid}\timportType:{importType}\tidCube{idCube}\tfilePath:{filePath}\tignoreCuncurrentUpload:{ignoreCuncurrentUpload}\tcheckFiltAttributes:{checkFiltAttributes}");

            if (!UserUtils.HaveCube(HttpContext.User.Identity, new AuthManager(_authAppConfig).GetCubeCodeFromId(idCube)))
            {
                HttpContext.Response.StatusCode = 403; //Forbidden
                return new JsonResult("");
            }

            ILoaderDataProvider loaderData = Factory.LoaderDataProv;
            JsonResult jres = null;
            var startOperation = DateTime.Now;
            Microsoft.Extensions.Primitives.StringValues stringValues = "";
            HttpContext.Request.Headers.TryGetValue("guidSession", out stringValues);
            var guidSession = stringValues.FirstOrDefault();
            try
            {
                var cubeCuncurrent = loaderData.StatusUploadCube(idCube);
                if (_logger.IsDebugEnabled && cubeCuncurrent != null)
                {
                    _logger.Log($"IDCube:{cubeCuncurrent.IDCube}\tcubeCuncurrent:{cubeCuncurrent.UploadDate}", LogLevelEnum.Debug);
                }
                if (!ignoreCuncurrentUpload && cubeCuncurrent != null)
                {
                    throw Utility.Utils.getCustomException("LOADING_CONCURRENT_UPLOAD_SAME_CUBE",
                                            @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + $" - There is a cuncurrency upload file for cube {idCube}.", LogLevelEnum.Error);
                }
                loaderData.StartUploadCube(idCube, startOperation);

                var watch = System.Diagnostics.Stopwatch.StartNew();
                string tempTableName = preloadCSV(CSVSeparator, CSVDelimiter.HasValue ? CSVDelimiter.Value : char.MinValue, hasHeader, filePath, tid, _memoryCache, guidSession, idMappingSpecialTimePeriod);
                watch.Stop();
                long elapsedMs = watch.ElapsedMilliseconds / 1000;

                jres = new JsonResult(loaderData.importData(importType, tempTableName, idMapping, idCube, filePath, elapsedMs, embargo, ignoreCuncurrentUpload, checkFiltAttributes));


            }
            catch (Exception)
            {
                throw;
            }
            finally
            {
                loaderData.EndUploadCube(idCube, startOperation);
                //Rimuovo la tabella temporanea, che è stata cancellata, dalla sessione
                removeTempTableFromSession(filePath, guidSession);
            }

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            return jres;
        }

        /// <summary>
        /// Returns a paged preview of a table in the DDB.
        /// </summary>
        /// <param name="optionsTable">Contains option for paging, filter, sort</param>
        /// <param name="CSVSeparator">CSV separator used in the file.</param>
        /// <param name="CSVDelimiter">CSV delimiter used in the file.</param>
        /// <param name="hasHeader">Whether the CSV file has a header or not.</param>
        /// <param name="filePath">Path of the file from whom the temp table has been generated.</param>
        /// <returns></returns>
        [HttpPost("Utils/getTableCSVPreview/{CSVSeparator}/{hasHeader}/{CSVDelimiter?}")]
        public JsonResult GetTableCSVPreview([FromBody] OptionsTable optionsTable, char CSVSeparator, bool hasHeader, string filePath, char? CSVDelimiter)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            Microsoft.Extensions.Primitives.StringValues stringValues = "";
            HttpContext.Request.Headers.TryGetValue("guidSession", out stringValues);
            var guidSession = stringValues.FirstOrDefault();

            string tempTableName = null;
            _memoryCache.TryGetValue($"{guidSession}_{filePath}", out tempTableName);

            if (string.IsNullOrWhiteSpace(tempTableName))
            {
                tempTableName = preloadCSV(CSVSeparator, CSVDelimiter.HasValue ? CSVDelimiter.Value : char.MinValue, hasHeader, filePath, null, _memoryCache, guidSession);
            }
            var res = Factory.UtilsDataProv.getTablePreview(tempTableName, optionsTable);

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            return new JsonResult(res);
        }

        /// <summary>
        /// Imports data in a cube (with Series, Data or SeriesAndData Import Type)
        /// </summary>
        /// <param name="tid">Temp table from whom the import process must start.</param>
        /// <param name="importType">Import Type (Series, Data or SeriesAndData).</param>
        /// <param name="idCube">Id of the cube where data are imported.</param>
        /// <param name="dsd">dsd to whom the data refer</param>
        /// <param name="agencyId">id of the agency</param>
        /// <param name="filePath">Path of the file from whom the temp table has been generated.</param>
        /// <param name="embargo">Whether the data have to be embargoed or not.</param>
        /// <param name="ignoreCuncurrentUpload">Ignore cuncurrency upload protection</param>
        /// <param name="checkFiltAttributes">Whether to check the coherence of attributes on FiltS table or not</param>
        [HttpPost("Loader/importSDMXMLData")]
        public JsonResult ImportSDMXMLData(string tid, ImportTypeEnum importType, int idCube, [FromBody] DSDParam dsd, string agencyId, string filePath, bool embargo, bool ignoreCuncurrentUpload = false, bool checkFiltAttributes = false)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name + $"\ttid:{tid}\timportType:{importType}\tidCube{idCube}\tfilePath:{filePath}\tignoreCuncurrentUpload:{ignoreCuncurrentUpload}");

            if (!UserUtils.HaveCube(HttpContext.User.Identity, new AuthManager(_authAppConfig).GetCubeCodeFromId(idCube)))
            {
                HttpContext.Response.StatusCode = 403; //Forbidden
                return new JsonResult("");
            }

            ILoaderDataProvider loaderData = Factory.LoaderDataProv;
            JsonResult jres = null;
            var startOperation = DateTime.Now;
            Microsoft.Extensions.Primitives.StringValues stringValues = "";
            HttpContext.Request.Headers.TryGetValue("guidSession", out stringValues);
            var guidSession = stringValues.FirstOrDefault();
            try
            {
                var cubeCuncurrent = loaderData.StatusUploadCube(idCube);
                if (_logger.IsDebugEnabled && cubeCuncurrent != null)
                {
                    _logger.Log($"IDCube:{cubeCuncurrent.IDCube}\tcubeCuncurrent:{cubeCuncurrent.UploadDate}", LogLevelEnum.Debug);
                }
                if (!ignoreCuncurrentUpload && cubeCuncurrent != null)
                {
                    throw Utility.Utils.getCustomException("LOADING_CONCURRENT_UPLOAD_SAME_CUBE",
                                            @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + $" - There is a cuncurrency upload file for cube {idCube}.", LogLevelEnum.Error);
                }
                loaderData.StartUploadCube(idCube, startOperation);


                var watch = System.Diagnostics.Stopwatch.StartNew();
                IDataStructureObject[] arr = Utility.SdmxUtils.getDataStructureFromXml(dsd.dsd, agencyId);
                string tempTableName = preloadSDMXML(filePath, arr[0], tid, guidSession);
                watch.Stop();
                long elapsedMs = watch.ElapsedMilliseconds / 1000;

                jres = new JsonResult(loaderData.importData(importType, tempTableName, 0, idCube, filePath, elapsedMs, embargo, ignoreCuncurrentUpload, checkFiltAttributes));
            }
            catch (Exception)
            {
                throw;
            }
            finally
            {
                loaderData.EndUploadCube(idCube, startOperation);
                //Rimuovo la tabella temporanea, che è stata cancellata, dalla sessione
                removeTempTableFromSession(filePath, guidSession);
            }


            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            return jres;
        }

        /// <summary>
        /// Disembargoes a cube.
        /// </summary>
        /// <param name="idCube">Id of the cube to be disembargoed.</param>
        /// <returns>True in case of success, otherwise an exception is thrown.</returns>
        [HttpPost("Loader/disembargoCube")]
        public JsonResult disembargoCube(int idCube)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            bool res = Factory.LoaderDataProv.disembargoCube(idCube);

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            return new JsonResult(res);
        }

        /// <summary>
        /// Delete all data contained in a cube.
        /// </summary>
        /// <param name="idCube">Id of the cube to be emptied.</param>
        /// <returns>True in case of success, otherwise an exception is thrown.</returns>
        [HttpPost("Loader/emptyCube")]
        public JsonResult emptyCube(int idCube)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            bool res = Factory.LoaderDataProv.emptyCube(idCube);

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            return new JsonResult(res);
        }

        #endregion Metodi Loader

        #region Metodi Utils

        // POST api/DMApi/Utils/uploadFileOnServer
        /// <summary>
        /// Uploads a file on the file-system.
        /// </summary>
        /// <param name="cubeId">The id of the cube to whom the file refers.</param>
        /// <param name="file">The file to be uploaded.</param>
        /// <returns>The path of the uploaded file in case of success, otherwise an exception is thrown.</returns>
        [HttpPost("Utils/uploadFileOnServer")]
        [DisableRequestSizeLimit, RequestFormLimits(MultipartBodyLengthLimit = int.MaxValue, ValueLengthLimit = int.MaxValue)]
        public JsonResult UploadFileOnServer(int cubeId, IFormFile file)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            string path = Factory.UtilsDataProv.uploadFileOnServer(file, cubeId);

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            return new JsonResult(path);
        }

        // POST api/DMApi/Utils/uploadFileOnServer
        /// <summary>
        /// Uploads a file on the file-system.
        /// </summary>
        /// <param name="file">The file to be uploaded.</param>
        /// <returns>The path of the uploaded file in case of success, otherwise an exception is thrown.</returns>
        [HttpPost("Utils/uploadReferenceMetadataFileOnServer")]
        [DisableRequestSizeLimit, RequestFormLimits(MultipartBodyLengthLimit = int.MaxValue, ValueLengthLimit = int.MaxValue)]
        public JsonResult uploadReferenceMetadataFileOnServer(IFormFile file)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            string path = Factory.UtilsDataProv.uploadReferenceMetadataFileOnServer(file);

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            return new JsonResult(path);
        }

        /// <summary>
        /// Loads the metadata file in memory.
        /// </summary>
        /// <param name="filename">The name of the file.</param>
        /// <returns></returns>
        [HttpGet("Utils/ReferenceMetadataFileOnServer")]
        public async Task<IActionResult> ReferenceMetadataFileOnServer(string filename)
        {
            //Set the File Content Type.

            filename = Path.GetFileName(filename);

            if (string.IsNullOrWhiteSpace(filename))
            {
                return NotFound("File not found");
            }

            var provider = new FileExtensionContentTypeProvider();
            string contentType;
            if (!provider.TryGetContentType(filename, out contentType))
            {
                contentType = "application/octet-stream";
            }

            var memory = new MemoryStream();

            var filePath = Factory.UtilsDataProv.referenceMetadataFileOnServer(filename);
            if (!System.IO.File.Exists(filePath))
            {
                return NotFound("File not found");
            }
            using (var stream = new FileStream(filePath, FileMode.Open))
            {
                await stream.CopyToAsync(memory);
            }
            memory.Position = 0;

            return File(memory, contentType, filename);
        }

        // POST api/DMApi/Utils/getTablePreview/CatCube
        /// <summary>
        /// Returns a paged preview of a table in the DDB.
        /// </summary>
        /// <param name="tableName">The table name.</param>
        /// <param name="optionsTable">Contains option for paging, filter, sort</param>
        /// <returns></returns>
        [HttpPost("Utils/getTablePreview/{tableName}")]
        public JsonResult GetTablePreview(string tableName, [FromBody] OptionsTable optionsTable)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            var res = Factory.UtilsDataProv.getTablePreview(tableName, optionsTable);

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            return new JsonResult(res);
        }

        // POST api/DMApi/Utils/getTableColumnPreview/CatCube
        /// <summary>
        /// Returns a paged preview of a column of a table in the DDB.
        /// </summary>
        /// <param name="tableName">The table name.</param>
        /// <param name="optionsTable">The column name, Page number (used for paging), Page size (used for paging).</param>
        /// <returns></returns>
        [HttpPost("Utils/getTableColumnPreview/{tableName}")]
        public JsonResult GetTableColumnPreview(string tableName, [FromBody] OptionsTable optionsTable)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            var res = Factory.UtilsDataProv.getTableColumnPreview(tableName, optionsTable);

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            return new JsonResult(res.Data);
        }

        // POST api/DMApi/Utils/getCSVTablePreview/;/true?filePath=xyz
        /// <summary>
        /// Returns a paged preview of a table in the DDB.
        /// </summary>
        /// <param name="CSVSeparator">CSV separator used in the file.</param>
        /// <param name="CSVDelimiter">CSV delimiter used in the file.</param>
        /// <param name="hasHeader">Whether the CSV file has a header or not.</param>
        /// <param name="tid"></param>
        /// <param name="filePath">Path of the CSV file.</param>
        /// <param name="optionsTable">Contains option for paging, filter, sort</param>
        /// <param name="idMappingSpecialTimePeriod">(Optional) Id of the mapping with time period in .STAT format.</param>
        /// <returns></returns>
        [HttpPost("Utils/getCSVTablePreview/{CSVSeparator}/{hasHeader}/{CSVDelimiter?}")]
        public JsonResult GetCSVTablePreview(char CSVSeparator, bool hasHeader, string tid, string filePath, char? CSVDelimiter, [FromBody] OptionsTable optionsTable, int idMappingSpecialTimePeriod = 0)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            Microsoft.Extensions.Primitives.StringValues stringValues = "";
            HttpContext.Request.Headers.TryGetValue("guidSession", out stringValues);
            var guidSession = stringValues.FirstOrDefault();

            string tableName = preloadCSV(CSVSeparator, CSVDelimiter.HasValue ? CSVDelimiter.Value : char.MinValue, hasHeader, filePath, tid, _memoryCache, guidSession, idMappingSpecialTimePeriod);
            var res = Factory.UtilsDataProv.getTablePreview(tableName, optionsTable);

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            return new JsonResult(res);
        }

        // GET api/DMApi/Utils/getConnectionString
        /// <summary>
        /// Returns a string with the encrypted connection string for the current DDB.
        /// </summary>
        /// <returns></returns>
        [HttpGet("Utils/getConnectionString")]
        public JsonResult GetConnectionString()
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            string res = Factory.UtilsDataProv.getConnectionString();

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            return new JsonResult(res);
        }

        /// <summary>
        /// Insert a list of string in a single-column table
        /// </summary>
        /// <param name="tableName">The name of the table.</param>
        /// <param name="values">The list of values to be inserted.</param>
        /// <returns></returns>
        [HttpPost("Utils/createTempTableForUniqueValues/{tableName}")]
        public void createTempTableForUniqueValues(string tableName, List<string> values)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            Factory.UtilsDataProv.createTempTableForUniqueValues(tableName, values);

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);
        }

        // POST api/DMApi/getSDMXMLTablePreview
        /// <summary>
        /// Returns a paged preview of a table in the DDB.
        /// </summary>
        /// <param name="dsd">dataflow data</param>
        /// <param name="agencyId">agency id</param>
        /// <param name="filePath">filePath</param>
        [HttpPost("Utils/getSDMXMLTablePreview")]
        public JsonResult GetSDMXMLTablePreview([FromBody] DSDParam dsd, string agencyId, string filePath)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            Microsoft.Extensions.Primitives.StringValues stringValues = "";
            HttpContext.Request.Headers.TryGetValue("guidSession", out stringValues);
            var guidSession = stringValues.FirstOrDefault();

            IDataStructureObject[] arr = Utility.SdmxUtils.getDataStructureFromXml(dsd.dsd, agencyId);
            string tableName = preloadSDMXML(filePath, arr[0], null, guidSession);
            var res = Factory.UtilsDataProv.getTablePreview(tableName, dsd.optionsTable);

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            return new JsonResult(res);
        }

        // GET api/DMApi/Utils/getCSVTableColumnPreview/;/true?filePath=xyz
        /// <summary>
        /// Returns a paged preview of a column of a table in the DDB.
        /// </summary>
        /// <param name="optionsTable">The column name, Page number (used for paging), Page size (used for paging).</param>
        /// <param name="CSVSeparator">csv separator</param>
        /// <param name="CSVDelimiter">csv separator</param>
        /// <param name="hasHeader">true if has header</param>
        /// <param name="filePath">filePath</param>
        /// <param name="idMappingSpecialTimePeriod">(Optional) Id of the mapping with time period in .STAT format.</param>
        /// <returns></returns>
        [HttpPost("Utils/getCSVTableColumnPreview/{CSVSeparator}/{hasHeader}/{CSVDelimiter?}")]
        public JsonResult GetCSVTableColumnPreview([FromBody]OptionsTable optionsTable, char CSVSeparator, char? CSVDelimiter, bool hasHeader, string filePath, int idMappingSpecialTimePeriod = 0)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            Microsoft.Extensions.Primitives.StringValues stringValues = "";
            HttpContext.Request.Headers.TryGetValue("guidSession", out stringValues);
            var guidSession = stringValues.FirstOrDefault();
            string tableName = preloadCSV(CSVSeparator, CSVDelimiter.HasValue ? CSVDelimiter.Value : char.MinValue, hasHeader, filePath, null, _memoryCache, guidSession, idMappingSpecialTimePeriod);
            var res = Factory.UtilsDataProv.getTableColumnPreview(tableName, optionsTable);

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            return new JsonResult(res);
        }

        #endregion Metodi Utils

        #region Metodi DFBuilder

        // GET api/DMApi/DFBuilder/getDDBDataflows
        /// <summary>
        /// Returns the list of dataflows in the DDB that the current user can view.
        /// </summary>
        /// <returns>The list of dataflows in the DDB.</returns>
        [HttpGet("DFBuilder/getDDBDataflows")]
        public JsonResult GetDDBDataflows()
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            List<DDBDataflow> cc = Factory.DataflowBuilderDataProv.getDDBDataflows()
                            .Where(df => UserUtils.HaveCube(HttpContext.User.Identity, new AuthManager(_authAppConfig).GetCubeCodeFromId(df.IDCube))).ToList();

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            return new JsonResult(cc);
        }

        // GET api/DMApi/DFBuilder/getDDBDataflows
        /// <summary>
        /// Returns the list of dataflows in the DDB.
        /// </summary>
        /// <returns>The list of dataflows in the DDB.</returns>
        [HttpGet("DFBuilder/GetDDBDataflowsNoFilter")]
        public JsonResult GetDDBDataflowsNoFilter()
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            var result = Factory.DataflowBuilderDataProv.getDDBDataflows();

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            return new JsonResult(result);
        }

        // GET api/DMApi/DFBuilder/getDDBDataflow/3
        /// <summary>
        /// Returns the requested DDB Dataflow filtered if user can't view.
        /// </summary>
        /// <param name="dfId">The DDB Dataflow id.</param>
        /// <returns></returns>
        [HttpGet("DFBuilder/getDDBDataflow/{dfId}")]
        public JsonResult GetDDBDataflow(int dfId)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            DDBDataflowWithCols res = Factory.DataflowBuilderDataProv.getDDBDataflow(dfId);

            if (!UserUtils.HaveCube(HttpContext.User.Identity, new AuthManager(_authAppConfig).GetCubeCodeFromId(res.IDCube)))
            {
                HttpContext.Response.StatusCode = 403; //Forbidden
                return new JsonResult("");
            }

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            return new JsonResult(res);
        }

        // GET api/DMApi/DFBuilder/getDDBDataflow/3
        /// <summary>
        /// Returns the requested DDB Dataflow.
        /// </summary>
        /// <param name="dfId">The DDB Dataflow id.</param>
        /// <returns></returns>
        [HttpGet("DFBuilder/GetDDBDataflowNoFilter/{dfId}")]
        public JsonResult GetDDBDataflowNoFilter(int dfId)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            DDBDataflowWithCols res = Factory.DataflowBuilderDataProv.getDDBDataflow(dfId);

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            return new JsonResult(res);
        }

        /// <summary>
        /// Returns the requested DDB Dataflows.
        /// </summary>
        /// <param name="cubeId">The DDB Cube id.</param>
        /// <returns></returns>
        [HttpGet("DFBuilder/GetDDBDataflowsNoFilter/{cubeId}")]
        public JsonResult GetDDBDataflowsNoFilter(int cubeId)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            var res = Factory.DataflowBuilderDataProv.getDDBDataflowsNoFilter(cubeId);

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            return new JsonResult(res);
        }

        // GET api/DMApi/DFBuilder/setHasTranscodingFlag/1/true
        /// <summary>
        /// Sets dataflow's transcoding flag to the given value.
        /// </summary>
        /// <param name="dfId">The DDB Dataflow id.</param>
        /// <param name="value">The value to be set for the flag (true or false).</param>
        /// <returns>True in case of success, otherwise an exception is thrown.</returns>
        [HttpGet("DFBuilder/setHasTranscodingFlag/{dfId}/{value}")]
        public JsonResult SetHasTranscodingFlag(int dfId, bool value)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            DDBDataflowWithCols df = Factory.DataflowBuilderDataProv.getDDBDataflow(dfId);

            if (!UserUtils.HaveCube(HttpContext.User.Identity, new AuthManager(_authAppConfig).GetCubeCodeFromId(df.IDCube)))
            {
                HttpContext.Response.StatusCode = 403; //Forbidden
                return new JsonResult("");
            }

            bool res = Factory.DataflowBuilderDataProv.setHasTranscodingFlag(dfId, value);

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            return new JsonResult(res);
        }

        // GET api/DMApi/DFBuilder/setHasContentConstraintsFlag/1/true
        /// <summary>
        /// Sets dataflow's HasContentConstraints flag to the given value.
        /// </summary>
        /// <param name="dfId">The DDB Dataflow id.</param>
        /// <param name="value">The value to be set for the flag (true or false).</param>
        /// <returns>True in case of success, otherwise an exception is thrown.</returns>
        [HttpGet("DFBuilder/setHasContentConstraintsFlag/{dfId}/{value}")]
        public JsonResult SetHasContentConstraintsFlag(int dfId, bool value)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            DDBDataflowWithCols df = Factory.DataflowBuilderDataProv.getDDBDataflow(dfId);

            if (!UserUtils.HaveCube(HttpContext.User.Identity, new AuthManager(_authAppConfig).GetCubeCodeFromId(df.IDCube)))
            {
                HttpContext.Response.StatusCode = 403; //Forbidden
                return new JsonResult("");
            }

            bool res = Factory.DataflowBuilderDataProv.setHasContentConstraintsFlag(dfId, value);

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            return new JsonResult(res);
        }

        // POST api/DMApi/DFBuilder/createDDBDataflow
        /// <summary>
        /// Creates a new dataflow in the DDB.
        /// </summary>
        /// <param name="df">The dataflow to be created.</param>
        /// <returns>The dataflow id in case of success, otherwise an exception is thrown.</returns>
        [HttpPost("DFBuilder/createDDBDataflow")]
        public JsonResult CreateDDBDataflow(DDBDataflowWithCols df)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            if (!UserUtils.HaveCube(HttpContext.User.Identity, new AuthManager(_authAppConfig).GetCubeCodeFromId(df.IDCube)))
            {
                HttpContext.Response.StatusCode = 403; //Forbidden
                return new JsonResult("");
            }

            int res = Factory.DataflowBuilderDataProv.createDDBDataflow(df);

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            return new JsonResult(res);
        }

        // DELETE api/DMApi/DFBuilder/deleteDDBDataflow
        /// <summary>
        /// Deletes the DDB Dataflow with the given id.
        /// </summary>
        /// <param name="dfId">The id of the dataflow to be deleted.</param>
        /// <returns>True in case of success, otherwise an exception is thrown.</returns>
        [HttpDelete("DFBuilder/deleteDDBDataflow")]
        public JsonResult DeleteDDBDataflow(int dfId)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            DDBDataflowWithCols df = Factory.DataflowBuilderDataProv.getDDBDataflow(dfId);

            if (!UserUtils.HaveCube(HttpContext.User.Identity, new AuthManager(_authAppConfig).GetCubeCodeFromId(df.IDCube)))
            {
                HttpContext.Response.StatusCode = 403; //Forbidden
                return new JsonResult("");
            }

            bool res = Factory.DataflowBuilderDataProv.deleteDDBDataflow(dfId);

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            return new JsonResult(res);
        }

        // POST api/DMApi/DFBuilder/getDDBDataflowPreview
        /// <summary>
        /// Returns a dataflow's data preview according with the given parameters.
        /// </summary>
        /// <param name="ddbDataflow">The dataflow.</param>
        /// <param name="partialIgnoreCheckFilter">Whether to check filter coerence for dataflow columns with a unique value or not.</param>
        /// <returns>A DataTable containing the requested data.</returns>
        [HttpPost("DFBuilder/getDDBDataflowPreview")]
        public JsonResult GetDDBDataflowPreview([FromBody] DDBDataflow ddbDataflow, bool partialIgnoreCheckFilter)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            if (!UserUtils.HaveCube(HttpContext.User.Identity, new AuthManager(_authAppConfig).GetCubeCodeFromId(ddbDataflow.IDCube)))
            {
                HttpContext.Response.StatusCode = 403; //Forbidden
                return new JsonResult("");
            }

            var selCols = new List<string>();
            var sortCols = new List<string>();
            if (ddbDataflow?.SqlData?.SelCols != null)
            {
                foreach (string item in ddbDataflow.SqlData.SelCols)
                {
                    selCols.Add(item);
                }
            }
            if (ddbDataflow?.SqlData?.SortCols != null)
            {
                foreach (string item in ddbDataflow.SqlData.SortCols)
                {
                    sortCols.Add(item);
                }
            }
            var sortByDesc = ddbDataflow?.SqlData != null ? ddbDataflow.SqlData.SortByDesc : false;

            var res = Factory.DataflowBuilderDataProv.getDDBDataflowPreview(ddbDataflow, partialIgnoreCheckFilter);

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            return new JsonResult(res);
        }


        /// <summary>
        /// Gets a dataflow in CSV format according with the given parameters.
        /// </summary>
        /// <param name="ddbDataflow">The dataflow.</param>
        /// <param name="partialIgnoreCheckFilter">Whether to check filter coerence for dataflow columns with a unique value or not.</param>
        /// <param name="CSVSeparator">CSV separator used in the file.</param>
        /// <param name="CSVDelimiter">CSV delimiter used in the file.</param>
        /// <returns>Return a MemoryStream with csv file zipped</returns>
        [HttpPost("DFBuilder/downloadDDBDataflowInCsv/{CSVSeparator}/{CSVDelimiter?}/{partialIgnoreCheckFilter?}")]
        public async Task<IActionResult> DownloadDDBDataflowInCsv([FromBody] DDBDataflow ddbDataflow, char CSVSeparator, char? CSVDelimiter, bool partialIgnoreCheckFilter = true)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            if (!UserUtils.HaveCube(HttpContext.User.Identity, new AuthManager(_authAppConfig).GetCubeCodeFromId(ddbDataflow.IDCube)))
            {
                HttpContext.Response.StatusCode = 403; //Forbidden
                return new JsonResult("");
            }

            var filePath = await Factory.DataflowBuilderDataProv.downloadDDBDataflowInCsvAsync(ddbDataflow, partialIgnoreCheckFilter, CSVSeparator, CSVDelimiter.HasValue ? CSVDelimiter.Value : char.MinValue);

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            _logger.Log("start create stream in controller", LogLevelEnum.Debug);
            IFileProvider provider = new PhysicalFileProvider(Path.Combine(_env.ContentRootPath, Path.GetDirectoryName(filePath)));
            IFileInfo fileInfo = provider.GetFileInfo(Path.GetFileName(filePath));
            var readStream = fileInfo.CreateReadStream();
            _logger.Log("end create stream in controller", LogLevelEnum.Debug);

            return File(readStream, "text/csv", Path.GetFileName(filePath));
        }

        // POST api/DMApi/Utils/getDataflowColumnPreview
        /// <summary>
        /// Returns a preview of a dataflow's column according with the given parameters.
        /// </summary>
        /// <param name="df">The dataflow.</param>
        /// <param name="colName">The name of the column to be returned.</param>
        /// <param name="numPage">Page number (used for paging).</param>
        /// <param name="pageSize">Page size (used for paging).</param>
        /// <param name="partialIgnoreCheckFilter">Whether to check or not filters.</param>
        /// <returns>A DataTable containing the requested data.</returns>
        [HttpPost("DFBuilder/getDataflowColumnPreview")]
        public JsonResult GetDataflowColumnPreview([FromBody] DDBDataflowWithCols df, string colName, int numPage, int pageSize, bool partialIgnoreCheckFilter)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            if (!UserUtils.HaveCube(HttpContext.User.Identity, new AuthManager(_authAppConfig).GetCubeCodeFromId(df.IDCube)))
            {
                HttpContext.Response.StatusCode = 403; //Forbidden
                return new JsonResult("");
            }

            DataTable res = Factory.DataflowBuilderDataProv.getDataflowColumnPreview(df, colName, numPage, pageSize, partialIgnoreCheckFilter);

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            return new JsonResult(res);
        }

        #endregion Metodi DFBuilder

        #region Metodi Utility

        /// <summary>
        /// Returns the list of codelist with items for each dsd
        /// </summary>
        /// <param name="dsdCheck">dsd to be check</param>
        /// <returns></returns>
        [HttpPost("Utility/GetItemsCodelistFromDsd")]
        public JsonResult GetItemsCodelist([FromBody]List<string> dsdCheck)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            var res = Factory.UtilityDataProv.GetItemsCodelistFromDsd(dsdCheck);

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            return new JsonResult(res);
        }

        /// <summary>
        /// Returns the items of each codelist 
        /// </summary>
        /// <param name="codeListCheck">dsd to be check</param>
        /// <returns></returns>
        [HttpPost("Utility/GetItemsFromCodeList")]
        public JsonResult GetItemsCodelist([FromBody]List<ArtefactIdentity> codeListCheck)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            var res = Factory.UtilityDataProv.GetItemsFromCodelist(codeListCheck);

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            return new JsonResult(res);
        }

        /// <summary>
        /// Syncs codelist from MSDB to DDB. Insert all Items from MSDB into DDB (only insert operation, do not remove codes not present in MSDB)
        /// </summary>
        /// <param name="itemsCodeListToSync">Codelist to sync</param>
        /// <returns></returns>
        [HttpPost("Utility/SyncCodeList")]
        public HttpResponseMessage SyncCodeList(Dictionary<string, List<string>> itemsCodeListToSync)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            Factory.UtilityDataProv.SyncCodeList(itemsCodeListToSync);

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            return new HttpResponseMessage(HttpStatusCode.OK);
        }

        /// <summary>
        /// Resets the DDB to its original state (after initialization).
        /// <returns>True in case of success, otherwise an exception is thrown.</returns>
        /// </summary>
        [HttpPost("Utility/DDBReset")]
        public JsonResult DDBReset(int cubeId)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            var res = Factory.UtilityDataProv.DDBReset();

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            return new JsonResult(res);
        }

        /// <summary>
        /// Returns the items of each codelist 
        /// </summary>
        /// <param name="dsdReport">dsd to be check</param>
        /// <returns></returns>
        [HttpPost("Utility/CompareDSD")]
        public JsonResult CompareDSD([FromBody]DsdReport dsdReport)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            var res = Factory.UtilityDataProv.CompareDSD(dsdReport);

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            return new JsonResult(res);
        }

        /// <summary>
        /// Upgrade cube from source DSD to target DSD
        /// </summary>
        /// <param name="dsdReport">DSD report</param>
        /// <returns></returns>
        [HttpPost("Utility/UpgradeCube")]
        public JsonResult UpgradeCube([FromBody]DsdReport dsdReport)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            var res = Factory.UtilityDataProv.UpgradeCube(dsdReport);

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            return new JsonResult(res);
        }

        /// <summary>
        /// Gets all dataflow id used by specific DSD
        /// </summary>
        /// <param name="dsdId">The dsd id.</param>
        /// <param name="dsdAgencyId">The dsd agency id.</param>
        /// <param name="dsdVersion">The dsd version.</param>
        /// <returns>Id of dataflow</returns>
        [HttpGet("Utility/GetDataFlowsFromDSD/{dsdId}/{dsdAgencyId}/{dsdVersion}")]
        public JsonResult GetDataFlowsFromDSD(string dsdId, string dsdAgencyId, string dsdVersion)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            var dataflows = Factory.UtilityDataProv.GetDataFlowsFromDSD(new ArtefactIdentity { ID = dsdId, Agency = dsdAgencyId, Version = dsdVersion });

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            return new JsonResult(dataflows);
        }


        /// <summary>
        /// Gets all columns of cube 
        /// </summary>
        /// <param name="idCube">The cube id.</param>
        /// <returns>Column of Cube</returns>
        [HttpGet("Utility/FieldForCube/{idCube}")]
        public List<string> GetFieldForCube(int idCube)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            var results = Factory.UtilityDataProv.GetFieldForCube(idCube);

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            return results;
        }

        /// <summary>
        /// Gets all columns of cube 
        /// </summary>
        /// <param name="idCube">The cube id.</param>
        /// <param name="optionsTable">The filter</param>
        /// <returns>All series of cube</returns>
        [HttpPost("Utility/SeriesForCube/{idCube}")]
        public DataTable GetSeriesForCube(int idCube, [FromBody] OptionsTable optionsTable)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            var results = Factory.UtilityDataProv.GetSeriesForCube(idCube, optionsTable);

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            return results;
        }

        /// <summary>
        /// Delete series
        /// </summary>
        /// <param name="idCube">The cube id.</param>
        /// <param name="sId">List of series Id</param>
        [HttpPut("Utility/RemoveSeriesForCube/{idCube}")]
        public void DeleteSeries(int idCube, [FromBody] List<int> sId)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            Factory.UtilityDataProv.DeleteSeries(idCube, sId);

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);
        }

        /// <summary>
        /// Delete series
        /// </summary>
        [HttpGet("Utility/CheckEndPoint")]
        public bool CheckEndPoint()
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            Factory.BuilderDataProv.getAvailableCubes();

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            return true;
        }

        /// <summary>
        ///  Get all dsd with dataflow associated
        /// </summary>
        [HttpGet("Utility/GetDSDWithDataflow")]
        public List<DsdWithDataflow> GetDSDWithDataflow()
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            var results = Factory.UtilityDataProv.GetDSDWithDataflow();

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            return results;
        }



        #endregion

        #region Metodi privati

        /// <summary>
        /// Esegue il caricamento in una tabella temporanea di un file CSV già presente sul server SOLO se la tabella temporanea non esiste già.
        /// Mantiene in sessione la corrispondenza tra path del file e tabella temporanea creata.
        /// </summary>
        /// <param name="CSVSeparator">Seaparatore del file CSV</param>
        /// <param name="CSVDelimiter">Delimiter del file CSV</param>
        /// <param name="hasHeader">Indica se il file CSV ha un'intestazione o meno</param>
        /// <param name="filePath">path del file</param>
        /// <param name="tid">Eventuale tid definito lato client da aggiungere al file</param>      
        /// <param name="memoryCache">Memory Cache</param>      
        /// <param name="guidSession">Guid session from NodeAPI</param>      
        /// <param name="idMappingSpecialTimePeriod">(Optional) Id of the mapping with time period in .STAT format.</param>
        /// <returns></returns>
        private string preloadCSV(char CSVSeparator, char CSVDelimiter, bool hasHeader, string filePath, string tid, IMemoryCache memoryCache, string guidSession, int idMappingSpecialTimePeriod = 0)
        {
            string tempTableName;
            string tidStr = tid ?? "NULL";

            if (memoryCache.Get($"{guidSession}_{filePath}") != null && (string)memoryCache.Get($"{guidSession}_{filePath}Tid") == tidStr)
            {
                tempTableName = (string)memoryCache.Get($"{guidSession}_{filePath}");
            }
            else
            {
                tempTableName = Factory.MappingDataProv.preloadCSV(CSVSeparator, CSVDelimiter, hasHeader, filePath, tid, _memoryCache, guidSession, idMappingSpecialTimePeriod);

                //setto la corrispondenza tra filePath e tabella temporanea + tid nella sessione
                setTempTableInSession(filePath, tempTableName, tidStr, guidSession);
            }

            return tempTableName;
        }

        /// <summary>
        /// Esegue il caricamento in una tabella temporanea di un file SDMXML già presente sul server SOLO se la tabella temporanea non esiste già.
        /// Mantiene in sessione la corrispondenza tra path del file e tabella temporanea creata.
        /// </summary>
        /// <param name="filePath">Path al file SDMX da caricare.</param>
        /// <param name="dsd">DSD referenziata dal cubo.</param>
        /// <param name="tid">Eventuale tid specificato da interfaccia.</param>
        /// <param name="guidSession">Guid session from NodeAPI</param>
        /// <returns></returns>
        private string preloadSDMXML(string filePath, IDataStructureObject dsd, string tid, string guidSession)
        {
            string tempTableName;
            string tidStr = tid ?? "NULL";

            if (_memoryCache.Get($"{guidSession}_{filePath}") != null && (string)_memoryCache.Get($"{guidSession}_{filePath}Tid") == tidStr)
            {
                tempTableName = (string)_memoryCache.Get($"{guidSession}_{filePath}");
                if (_memoryCache != null)
                {
                    try
                    {
                        _memoryCache.Get(tempTableName); //use for refresh sliding expiration
                    }
                    catch (Exception) { }
                }
            }
            else
            {
                tempTableName = Factory.LoaderDataProv.preloadSDMXML(filePath, dsd, tid, _memoryCache, guidSession);

                //setto la corrispondenza tra filePath e tabella temporanea + tid nella sessione
                setTempTableInSession(filePath, tempTableName, tidStr, guidSession);
            }

            return tempTableName;
        }

        /// <summary>
        /// Rimuovo la tabella temporanea, che è stata cancellata, dalla sessione
        /// </summary>
        /// <param name="filePath">il path del file a partire da cui è stata costruita la tabella temporanea</param>
        /// <param name="guidSession">Session guid from NodeAPI</param>
        private void removeTempTableFromSession(string filePath, string guidSession)
        {
            var tempTableName = (string)_memoryCache.Get($"{guidSession}_{filePath}");
            if (_memoryCache != null)
            {
                try
                {
                    _memoryCache.Remove($"{guidSession}_CurrentTempTableName");
                    _memoryCache.Remove($"{guidSession}_CurrentTempTableFilePath");
                    _memoryCache.Remove($"{guidSession}_{tempTableName}");
                    _memoryCache.Remove($"{guidSession}_{tempTableName}Tid");
                }
                catch (Exception) { }
            }
        }

        /// <summary>
        /// setto la corrispondenza tra filePath e tabella temporanea + tid nella sessione
        /// </summary>
        /// <param name="filePath">il path del file a partire da cui è stata costruita la tabella temporanea</param>
        /// <param name="tempTableName">tabella temporanea in cui è stato caricato il file</param>
        /// <param name="tidStr">valore del tid corrispondente alla tabella caricata</param>
        /// <param name="guidSession">Session guid from NodeAPI</param>
        private void setTempTableInSession(string filePath, string tempTableName, string tidStr, string guidSession)
        {
            string sessionTempTableName = (string)_memoryCache.Get($"{guidSession}_CurrentTempTableName");
            var sessionTempTableFilePath = (string)_memoryCache.Get($"{guidSession}_CurrentTempTableFilePath");

            if (_memoryCache != null && !string.IsNullOrWhiteSpace(sessionTempTableName))
            {
                try
                {
                    _memoryCache.Remove($"{guidSession}_CurrentTempTableName");
                    _memoryCache.Remove($"{guidSession}_CurrentTempTableFilePath");
                    _memoryCache.Remove($"{guidSession}_{sessionTempTableFilePath}");
                    _memoryCache.Remove($"{guidSession}_{sessionTempTableFilePath}Tid");
                    _memoryCache.Remove(sessionTempTableName);
                }
                catch (Exception) { }
            }
            _memoryCache.Set($"{guidSession}_CurrentTempTableName", tempTableName);
            _memoryCache.Set($"{guidSession}_CurrentTempTableFilePath", filePath);
            _memoryCache.Set($"{guidSession}_{filePath}", tempTableName);
            _memoryCache.Set($"{guidSession}_{filePath}" + "Tid", tidStr);
        }

        /// <summary>
        /// Filters a list of cubes returning only those visible to the logged user.
        /// </summary>
        /// <param name="cubes">List of cubes</param>
        /// <param name="identity">The current user</param>
        static private List<Cube> filterCubesByUser(List<Cube> cubes, IIdentity identity)
        {
            var avaiablesCube = new List<Cube>();
            foreach (var item in cubes)
            {
                if (UserUtils.HaveCube(identity, item.Code))
                {
                    avaiablesCube.Add(item);
                }
            }
            return avaiablesCube;
        }

        #endregion Metodi privati

        #region Node Configuration

        /// <summary>
        /// Syncs AUTHDB with all data 
        /// <param name="dataSync">
        /// agency: List of default agency in case of AuthDb haven't got any agency
        /// dataflow: Dataflow to sync on AuthDb
        /// </param>
        /// </summary>
        [HttpPost("Utils/SynchronizeAuthDB")]
        public HttpResponseMessage SynchronizeAuthDB([FromBody] JObject dataSync)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            var allAgency = new List<string>();
            var allDataflow = new List<string>();
            var allMetadataFlow = new List<string>();
            if (dataSync["agency"] != null)
            {
                foreach (string item in dataSync["agency"])
                {
                    allAgency.Add(item);
                }
            }
            if (dataSync["dataflow"] != null)
            {
                foreach (string item in dataSync["dataflow"])
                {
                    allDataflow.Add(item);
                }
            }
            if (dataSync["metadataFlow"] != null)
            {
                foreach (string item in dataSync["metadataFlow"])
                {
                    allMetadataFlow.Add(item);
                }
            }

            new AuthManager(_authAppConfig).SynchronizeAuthDB(allAgency, allDataflow, allMetadataFlow);
            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);
            return new HttpResponseMessage(HttpStatusCode.OK);
        }


        /// <summary>
        /// Checks if AuthDb have the connection string inizializated (do not check if they are correct)
        /// </summary>
        /// <returns></returns>
        [HttpGet("Utils/AuthDBConfigurated")]
        public bool AuthDBConfigurated()
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);
            var result = new AuthManager(_authAppConfig).IsAuthDBConfigurated();
            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);
            return result;
        }

        /// <summary>
        /// Inizializes MaSid, ConnectionString of MSDB, DDB and RMDB. This operation is made only if AuthDb has been never initialized before.
        /// </summary>
        /// <returns>Status of the AuthDb. If the AuthDb has been already configurated with different parameters, it generates an error code</returns>
        [HttpPost("Utils/InizializeAuthDb")]
        public ResultInizializeCheckAuthDb InizializeAuthDb([FromBody] JObject configureData)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            var maSidName = (string)configureData["maSid"];
            string maSidConnection = configureData["maSidConn"] != null && !string.IsNullOrWhiteSpace((string)configureData["maSidConn"]) ? Utility.Utils.Decrypt((string)configureData["maSidConn"], _configuration["DMApiSettings:ENCRYPTION_PASSW"]) : null;
            var ddbXml = Utility.Utils.Decrypt(Factory.UtilsDataProv.getConnectionString(), _configuration["DMApiSettings:ENCRYPTION_PASSW"]);
            var rmXml = Utility.Utils.Decrypt(Factory.UtilsDataProv.getConnectionRMDBString(), _configuration["DMApiSettings:ENCRYPTION_PASSW"]);


            _logger.Log($"BaseDBConnector InizializeAuthDb init", LogLevelEnum.Debug);
            var resultInizializeCheckAuthDb = new AuthManager(_authAppConfig).InizializeAuthDb(maSidConnection, ddbXml, rmXml, maSidName);

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);
            return resultInizializeCheckAuthDb;
        }

        // GET: api/DMApi/Utils/CheckAuthDB
        /// <summary>
        /// Checks if the XML Config and AuthDB Connection string have the same value
        /// </summary>
        /// <returns>Returns an object containing the status config and a list of error messages</returns>
        [HttpPost("Utils/CheckAuthDB")]
        public ResultInizializeCheckAuthDb CheckAuthDB([FromBody] JObject checkData)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            var maSid = (string)checkData["maSid"];
            string maSidConnection = checkData["maSidConn"] != null && !string.IsNullOrWhiteSpace((string)checkData["maSidConn"]) ? Utility.Utils.Decrypt((string)checkData["maSidConn"], _configuration["DMApiSettings:ENCRYPTION_PASSW"]) : null;

            var ddbXml = Factory.UtilsDataProv.getConnectionString();
            if (ddbXml != null)
            {
                ddbXml = Utility.Utils.Decrypt(ddbXml, _configuration["DMApiSettings:ENCRYPTION_PASSW"]);
            }
            var rmXml = Factory.UtilsDataProv.getConnectionRMDBString();
            if (rmXml != null)
            {
                rmXml = Utility.Utils.Decrypt(rmXml, _configuration["DMApiSettings:ENCRYPTION_PASSW"]);
            }

            var resultCheckAuthDb = new AuthManager(_authAppConfig).CheckAuthDB(maSidConnection, ddbXml, rmXml, maSid);

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);
            return resultCheckAuthDb;
        }

        // GET: api/DMApi/Utils/GetMaSid
        /// <summary>
        /// Returns the maSid configurated on Authdb
        /// </summary>
        /// <returns></returns>
        [HttpGet("Utils/GetMaSid")]
        public string GetMaSid()
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);
            var result = new AuthManager(_authAppConfig).GetMaSid();
            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);
            return result;
        }


        #endregion

        /// <summary>
        /// Remove all Tmp Table from SQL DB
        /// </summary>
        [HttpPost("Utils/RemoveTempTable")]
        public void RemoveTempTable()
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            Factory.UtilsDataProv.RemoveTempTableAndViews();

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);
        }

    }
}
