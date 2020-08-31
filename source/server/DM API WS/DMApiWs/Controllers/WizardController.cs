using AuthCore;
using AuthCore.Interface;
using AuthCore.Model;
using DM_API_WS.Wizard;
using DM_API_WS.Wizard.Model;
using Infrastructure.STLogging.Factory;
using Infrastructure.STLogging.Interface;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using System;
using System.Linq;
using System.Net.Http;

namespace DM_API_WS.Controllers
{
    /// <summary>
    /// Wizard Page
    /// </summary>
    [Route("Wizard")]
    [ApiController]
    public class WizardController : Controller
    {
        readonly IUserData _userData;
        readonly IOptionsMonitor<AuthAppOptions> _authAppConfig;
        readonly ISTLogger _logger;

        /// <summary>
        /// The constructor.
        /// </summary>
        /// <param name="config">The configuration.</param>
        /// <param name="userData">User's data.</param>
        public WizardController(IOptionsMonitor<AuthAppOptions> config, IUserData userData)
        {
            _authAppConfig = config;
            _userData = userData;
            _logger = STLoggerFactory.Logger;
        }

        /// <summary>
        /// Start page
        /// </summary>
        [HttpGet("Home")]
        public ActionResult Home()
        {
            return View();
        }

        /// <summary>
        /// Start page
        /// </summary>
        [HttpGet("Index")]
        public ActionResult Index()
        {
            return View("Home");
        }

        /// <summary>
        /// Start page
        /// </summary>
        [HttpGet]
        public ActionResult Get()
        {
            return View("Home");
        }

        /// <summary>
        /// Start page
        /// </summary>
        [HttpGet("Start")]
        public ActionResult Start()
        {
            ControllerContext.HttpContext.Session.SetInt32("WizardAuthenticated", 0);
            ControllerContext.HttpContext.Session.Remove("UserData");
            var backToLogin = ControllerContext.HttpContext.Session.GetString("backToLogin");
            if (!string.IsNullOrWhiteSpace(backToLogin))
            {
                ViewBag.ErrorLogin = backToLogin;
                ControllerContext.HttpContext.Session.Remove("backToLogin");
            }
            
            return View();
        }

        /// <summary>
        /// Performs 1st step of the wizard.
        /// </summary>
        /// <param name="configData">Configuration data.</param>
        /// <returns></returns>
        [HttpPost("Step01Login")]
        [ValidateAntiForgeryToken]
        public ActionResult Step01Login([FromForm] ConfigData configData)
        {
            if (ModelState.IsValid && !string.IsNullOrWhiteSpace(configData.Username) && !string.IsNullOrWhiteSpace(configData.MA))
            {
                ControllerContext.HttpContext.Session.Remove("backToLogin");

                var isInizialized = new AuthManager(_authAppConfig).IsAuthDbInitialized();

                if (isInizialized)
                {
                    IAuthManager _authManager = new AuthBasicManager(_authAppConfig.CurrentValue, _userData, _logger);
                    var resultLogin = _authManager.CheckLogin(configData.Username, configData.Password);
                    if (!resultLogin)
                    {
                        ControllerContext.HttpContext.Session.SetString("backToLogin", "Invalid Login");
                        ViewBag.ErrorLogin = "Invalid Login";
                        return RedirectToAction("Start");
                    }

                    var rules = new AuthManager(_authAppConfig).GetRules(configData.Username);

                    if (rules.FirstOrDefault(item => item.Equals("AdminRole", StringComparison.InvariantCultureIgnoreCase)) == null)
                    {
                        ControllerContext.HttpContext.Session.SetString("backToLogin", "Invalid Login");
                        ViewBag.ErrorLogin = "Invalid Login";
                        return RedirectToAction("Start");
                    }
                }
                configData.MA = configData.MA.TrimEnd(new[] { '/', '\\' });
                ControllerContext.HttpContext.Session.SetString("ma", configData.MA ?? "");
                ControllerContext.HttpContext.Session.SetInt32("WizardAuthenticated", isInizialized ? 1 : 2);

                var businessLogic = new BusinessLogic(ControllerContext.HttpContext.Session);
                try
                {
                    businessLogic.CheckAuthDB(ControllerContext.HttpContext.Session, _authAppConfig, configData);
                }
                catch (Exception ex)
                {
                    ViewBag.ErrorLogin = ex.Message;
                    return View();
                }
            }
            else
            {
                return RedirectToAction("Start");
            }
            return stepLanding();
        }

        /// <summary>
        /// Performs step 2 of the wizard: initializes the AuthDB
        /// </summary>
        /// <returns></returns>
        [HttpGet("Step02CheckInizializeAuthDb")]
        public ActionResult Step02CheckInizializeAuthDb()
        {
            if (ControllerContext.HttpContext.Session.GetInt32("WizardAuthenticated") != 1 && ControllerContext.HttpContext.Session.GetInt32("WizardAuthenticated") != 2)
            {
                return RedirectToAction("Start");
            }
            var businessLogic = new BusinessLogic(ControllerContext.HttpContext.Session);
            var configData = businessLogic.GetUserData();
            return View(configData);
        }

        /// <summary>
        /// Performs step 3 of the wizard: extendss the AuthDB
        /// </summary>
        /// <returns></returns>
        [HttpGet("Step03ExtAuthDb")]
        public ActionResult Step03ExtAuthDb()
        {
            if (ControllerContext.HttpContext.Session.GetInt32("WizardAuthenticated") != 1)
            {
                return RedirectToAction("Start");
            }

            var businessLogic = new BusinessLogic(ControllerContext.HttpContext.Session);
            var configData = businessLogic.GetUserData();
            ViewBag.MessageAuthDb = configData.StepMessage;

            configData = businessLogic.CheckAuthDB(ControllerContext.HttpContext.Session, _authAppConfig, configData);

            return View(configData);
        }

        /// <summary>
        /// Extends the AuthDB
        /// </summary>
        /// <returns></returns>
        [HttpPost("ExtendAuthDb")]
        public ActionResult ExtendAuthDb()
        {
            if (ControllerContext.HttpContext.Session.GetInt32("WizardAuthenticated") != 1)
            {
                return RedirectToAction("Start");
            }

            var businessLogic = new BusinessLogic(ControllerContext.HttpContext.Session);
            businessLogic.ExtendAuthDB(_authAppConfig);

            return stepLanding();
        }

        /// <summary>
        /// Performs step 4 of the wizard: lists all the MSDBs
        /// </summary>
        /// <returns></returns>
        [HttpGet("Step04ListMSDB")]
        public ActionResult Step04ListMSDB()
        {
            if (ControllerContext.HttpContext.Session.GetInt32("WizardAuthenticated") != 1)
            {
                return RedirectToAction("Start");
            }

            var businessLogic = new BusinessLogic(ControllerContext.HttpContext.Session);
            var configData = businessLogic.GetUserData();
            if (configData.StepAction.Equals("ExtendAuthDB"))
            {
                ViewBag.MessageAuthDb = configData.AuthDbExtInitialized ? "AuthDB extended complete" : "AuthDB extending error";
            }
            else
            {
                configData = businessLogic.CheckAuthDB(ControllerContext.HttpContext.Session, _authAppConfig, configData);
                ViewBag.MessageAuthDb = configData.AuthDbExtInitialized ? "AuthDB is extended" : "AuthDB not extended";
            }
            configData = businessLogic.GetMappingStores(ControllerContext.HttpContext.Session);

            ViewBag.MappingStores = businessLogic.ToSelectList(configData.MappingStores);

            return View(configData);
        }

        /// <summary>
        /// Performs step 5 of the wizard: checks DDB, RMDB and MSDB
        /// </summary>
        /// <returns></returns>
        [HttpGet("Step05CheckAll")]
        public ActionResult Step05CheckAll()
        {
            if (ControllerContext.HttpContext.Session.GetInt32("WizardAuthenticated") != 1)
            {
                return RedirectToAction("Start");
            }

            var businessLogic = new BusinessLogic(ControllerContext.HttpContext.Session);
            var configData = businessLogic.CheckDDB();
            configData = businessLogic.CheckRMDB();
            configData = businessLogic.CheckMappingStore();
            ViewBag.MessageAuthDb = configData.AuthDbExtInitialized ? "AuthDB is extended" : "AuthDB not extended";

            return View(configData);
        }

        /// <summary>
        /// Returns whether the AuthDB is initialized or not.
        /// </summary>
        /// <returns></returns>
        [HttpPost("InizializeAuthDb")]
        public ActionResult InizializeAuthDb()
        {
            if (ControllerContext.HttpContext.Session.GetInt32("WizardAuthenticated") != 1 && ControllerContext.HttpContext.Session.GetInt32("WizardAuthenticated") != 2)
            {
                return RedirectToAction("Start");
            }

            var businessLogic = new BusinessLogic(ControllerContext.HttpContext.Session);
            businessLogic.InizializeAuthDb();

            if (ControllerContext.HttpContext.Session.GetInt32("WizardAuthenticated") == 2)
            {
                var businessLogin = new BusinessLogic(ControllerContext.HttpContext.Session);
                var configLoginData = businessLogin.GetUserData();
                IAuthManager _authManager = new AuthBasicManager(_authAppConfig.CurrentValue, _userData, _logger);
                var resultLogin = _authManager.CheckLogin(configLoginData.Username, configLoginData.Password);
                if (!resultLogin)
                {
                    ControllerContext.HttpContext.Session.SetString("backToLogin", "Invalid Login");
                    ViewBag.ErrorLogin = "Invalid Login";
                    return RedirectToAction("Start");
                }
                ControllerContext.HttpContext.Session.SetInt32("WizardAuthenticated", 1);
            }

            return stepLanding();
        }

        /// <summary>
        /// Initializes the MSDB.
        /// </summary>
        /// <returns></returns>
        [HttpPost("InizializeMSDB")]
        public ActionResult InizializeMSDB()
        {
            if (ControllerContext.HttpContext.Session.GetInt32("WizardAuthenticated") != 1)
            {
                return RedirectToAction("Start");
            }

            var businessLogic = new BusinessLogic(ControllerContext.HttpContext.Session);
            businessLogic.InizializeMappingStore();

            return RedirectToAction("Step05CheckAll");
        }

        /// <summary>
        /// Sets the Mapping Store.
        /// </summary>
        /// <param name="MappingStores"></param>
        /// <returns></returns>
        [HttpPost("SetMappingStore")]
        public ActionResult SetMappingStore([FromForm] string MappingStores)
        {
            if (ControllerContext.HttpContext.Session.GetInt32("WizardAuthenticated") != 1)
            {
                return RedirectToAction("Start");
            }

            var businessLogic = new BusinessLogic(ControllerContext.HttpContext.Session);
            businessLogic.SetMappingStore(MappingStores);

            return RedirectToAction("Step05CheckAll");
        }

        /// <summary>
        /// Initializes the DDB.
        /// </summary>
        /// <param name="MappingStores"></param>
        /// <returns></returns>
        [HttpPost("InizializeDDB")]
        public ActionResult InizializeDDB([FromForm] string MappingStores)
        {
            if (ControllerContext.HttpContext.Session.GetInt32("WizardAuthenticated") != 1)
            {
                return RedirectToAction("Start");
            }

            var businessLogic = new BusinessLogic(ControllerContext.HttpContext.Session);
            businessLogic.InizializeDDB();

            return RedirectToAction("Step05CheckAll");
        }

        /// <summary>
        /// Initializes the RMDB.
        /// </summary>
        /// <param name="MappingStores"></param>
        /// <returns></returns>
        [HttpPost("InizializeRMDB")]
        public ActionResult InizializeRMDB([FromForm] string MappingStores)
        {
            if (ControllerContext.HttpContext.Session.GetInt32("WizardAuthenticated") != 1)
            {
                return RedirectToAction("Start");
            }

            var businessLogic = new BusinessLogic(ControllerContext.HttpContext.Session);
            var configData = businessLogic.InizializeRMDB();
            ViewBag.MessageAuthDb = configData.AuthDbExtInitialized ? "AuthDB is extended" : "AuthDB not extended";

            return RedirectToAction("Step05CheckAll");
        }

        /// <summary>
        /// Utility
        /// </summary>
        [HttpGet("Utility")]
        public ActionResult Utility()
        {
            return View();
        }

        /// <summary>
        /// Check MetaData
        /// </summary>
        [HttpGet("CheckMetaData")]
        public ActionResult CheckMetaData()
        {
            return View();
        }

        /// <summary>
        /// Check MetaData
        /// </summary>
        [HttpPost("CheckMetaData")]
        public ActionResult CheckMetaData([FromForm] ConfigData configData)
        {
            var result = new BusinessLogic(null).GetMetadataAPIStatus(configData);
            ViewBag.MetadataAPIStatus = result.StatusCode;
            ViewBag.MetadataAPIStatusMessage = result.StatusMessage;
            return View();
        }

        /// <summary>
        /// Check EndPoint
        /// </summary>
        [HttpGet("CheckEndPoint")]
        public ActionResult CheckEndPoint()
        {
            return View();
        }

        /// <summary>
        /// Check EndPoint
        /// </summary>
        [HttpPost("CheckEndPoint")]
        public ActionResult CheckEndPoint([FromForm] ConfigData configData)
        {
            var result = new BusinessLogic(null).GetEndPointAPIStatus(configData);
            ViewBag.EndPointStatus = result.StatusCode;
            ViewBag.EndPointStatusMessage = result.StatusMessage;
            return View();
        }

        /// <summary>
        /// Check MetaData
        /// </summary>
        [HttpGet("ChangePassword")]
        public ActionResult ChangePassword()
        {
            return View();
        }

        /// <summary>
        /// Check MetaData
        /// </summary>
        [HttpPost("ChangePassword")]
        public ActionResult ChangePassword([FromForm] ChangePasswordData passwordData)
        {
            var result = new BusinessLogic(null).ChangePassword(passwordData, _authAppConfig, _userData);
            if (result == ChangePasswordResult.DbNotInizialied)
            {
                ViewBag.Status = "Before change password you need to inizialize the database";
            }
            else if (result == ChangePasswordResult.InvalidLogin)
            {
                ViewBag.Status = "Login Invalid";
            }
            else if (result == ChangePasswordResult.InvalidPassoword)
            {
                ViewBag.Status = "Password not compliant";
            }
            else if (result == ChangePasswordResult.InvalidConfirmPassword)
            {
                ViewBag.Status = "The password confirm must match new password";
            }
            else if (result == ChangePasswordResult.Ok)
            {
                ViewBag.Status = "Password changed";
            }
            return View();
        }

        private RedirectToActionResult stepLanding()
        {
            var businessLogic = new BusinessLogic(ControllerContext.HttpContext.Session);
            var configData = businessLogic.GetUserData();

            if (!configData.AuthDbBaseInitialized)
            {
                return RedirectToAction("Step02CheckInizializeAuthDb");
            }
            else if (configData.AuthDbBaseInitialized && !configData.AuthDbExtInitialized)
            {
                return RedirectToAction("Step03ExtAuthDb");
            }
            else if (configData.AuthDbBaseInitialized && configData.AuthDbExtInitialized && string.IsNullOrWhiteSpace(configData.SelectedMappingStore))
            {
                return RedirectToAction("Step04ListMSDB");
            }
            else
            {
                return RedirectToAction("Step05CheckAll");
            }
        }

    }
}