using API.Security;
using AuthCore.Model;
using AuthCore.Utils;
using BusinessLogic;
using DataModel;
using Infrastructure.STLogging.Factory;
using Infrastructure.STLogging.Interface;
using Infrastructure.Utils;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Newtonsoft.Json;
using System;
using System.Net.Http;
using System.Net.Mail;
using System.Threading.Tasks;

namespace API
{
    /// <summary>
    /// Security API
    /// </summary>
    [ApiController]
    [Route("/api")]
    [EnableCors("CustomPolicy")]
    public class SecurityController : ControllerBase
    {
        readonly IMemoryCache _memoryCache;
        readonly IHttpContextAccessor _contextAccessor;
        readonly IConfiguration _configuration;
        readonly ISTLogger _logger;

        /// <summary>
        /// Constructor
        /// </summary>
        public SecurityController(IMemoryCache memoryCache, IHttpContextAccessor contextAccessor, IConfiguration configuration)
        {
            _memoryCache = memoryCache;
            _contextAccessor = contextAccessor;
            _configuration = configuration;
            _logger = STLoggerFactory.Logger;
        }

        /// <summary>
        /// Authenticates user on NodeApi
        /// </summary>
        /// <param name="userParam">contains username and password</param>
        /// <returns>Token and user info</returns>
        [AllowAnonymous]
        [HttpPost("Security/Authenticate")]
        public IActionResult Authenticate([FromBody]User userParam)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            if (!HttpContext.Request.Headers.ContainsKey("nodeId"))
            {
                return Ok(new UserDataDTO { IsAuthenticated = false });
            }
            userParam.NodeId = HttpContext.Request.Headers["nodeId"];

            var nodeConfig = CreateConfigManager().GetConfiguration();
            var unAuthenticateBusinessLogic = CreateBusinessLogic(nodeConfig);

            //Decode
            try
            {
                userParam.Password = System.Text.Encoding.UTF8.GetString(Convert.FromBase64String(userParam.Password));
            }
            catch
            {
                userParam.Password = "";
            }
            //Encode
            //password=Convert.ToBase64String(Encoding.UTF8.GetBytes(password));

            var userService = new UserService(_contextAccessor, _configuration, _memoryCache);
            var user = userService.Authenticate(unAuthenticateBusinessLogic.LoginUser, userParam);

            if (user == null)
            {
                _logger.Log($"Controller Authenticate end Unauthorized", LogLevelEnum.Info);
                return Unauthorized();
            }

            var authenticateBusinessLogicBusinessLogic = CreateBusinessLogic(nodeConfig);
            var result = authenticateBusinessLogicBusinessLogic.CheckAuthDB(nodeConfig.Endpoint.MASid, true);
            if (result.Invalid)
            {
                foreach (var errorCode in result.ErrorMessage)
                {
                    throw Utility.Utils.getCustomException(errorCode,
                           $"Metodo  {System.Reflection.MethodBase.GetCurrentMethod().Name} - {result.ErrorMessage}", Infrastructure.STLogging.Interface.LogLevelEnum.Error);
                }
                throw Utility.Utils.getCustomException("CHECKAUTHDB_UNKNOW_ERROR",
                           $"Metodo  {System.Reflection.MethodBase.GetCurrentMethod().Name} - Unknow Error", Infrastructure.STLogging.Interface.LogLevelEnum.Error);
            }
            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);
            return Ok(user);
        }

        /// <summary>
        /// Authenticates user user on NodeApi
        /// </summary>
        /// <param name="userParam">contains username and password</param>
        /// <returns>Return 200 OK or 401 Unauthorized</returns>
        [AllowAnonymous]
        [HttpPost("Security/LoginSuperUser")]
        public IActionResult LoginSuperUser([FromBody]User userParam)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            var userService = new UserService(_contextAccessor, _configuration, _memoryCache);
            var result = userService.LoginSuperUser(userParam);

            if (!result)
            {
                return Unauthorized(new { message = "Username or password is incorrect" });
            }
            
            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);
            return Ok();
        }

        /// <summary>
        /// Checks if current logged user is a super user
        /// </summary>
        /// <returns>Return 200 OK or 401 Unauthorized</returns>
        [AllowAnonymous]
        [HttpPost("Security/CheckSuperUser")]
        public IActionResult CheckSuperUser()
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            var userService = new UserService(_contextAccessor, _configuration, _memoryCache);
            var result = userService.CheckSuperUser();

            if (!result)
            {
                return Unauthorized();
            }

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);
            return Ok();
        }

        /// <summary>
        /// Logouts current super user (this logout have no effects on node user)
        /// </summary>
        [AllowAnonymous]
        [HttpPost("Security/LogoutSuperUser")]
        public IActionResult LogoutSuperUser()
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            var userService = new UserService(_contextAccessor, _configuration, _memoryCache);
            userService.LogoutSuperUser();

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);
            return Ok();
        }

        /// <summary>
        /// Logouts current user (this logout have no effects on super user)
        /// </summary>
        [Authorize]
        [HttpPost("Security/Logout")]
        public IActionResult Logout()
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            var userService = new UserService(_contextAccessor, _configuration, _memoryCache);
            userService.Logout();

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);
            return Ok();
        }

        /// <summary>
        /// Send mail with new password
        /// </summary>
        [HttpPost("Security/RecoveryPassword")]
        public IActionResult RecoveryPassword([FromBody] User userData)
        {
            var nodeConfig = CreateConfigManager().GetConfiguration();
            var businessLogic = CreateBusinessLogic(nodeConfig);

            businessLogic.RecoveryPassword(userData);

            return Ok();
        }

        /// <summary>
        /// Changes password for specific user
        /// </summary>
        [Authorize]
        [HttpPost("Security/ChangePassword")]
        public IActionResult ChangePassword([FromBody] User userData)
        {
            var nodeConfig = CreateConfigManager().GetConfiguration();
            var businessLogic = CreateBusinessLogic(nodeConfig);

            businessLogic.ChangePassword(userData.Username, userData.Password);

            return Ok();
        }

        private ConfigManager CreateConfigManager()
        {
            return new ConfigManager(_configuration, _memoryCache, _contextAccessor);
        }

        private BusinessLogic.Controller.BusinessLogic CreateBusinessLogic(NodeConfig nodeConfig)
        {
            return new BusinessLogic.Controller.BusinessLogic(nodeConfig, _configuration, _memoryCache, _contextAccessor);
        }


    }
}
