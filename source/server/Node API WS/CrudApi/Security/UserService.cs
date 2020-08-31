using AuthCore.Model;
using BusinessLogic;
using DataModel;
using Infrastructure.STLogging.Factory;
using Infrastructure.STLogging.Interface;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Net.Http;
using System.Security.Claims;
using System.Text;
using Utility;

namespace API.Security
{
#pragma warning disable CS1591 // Missing XML comment for publicly visible type or member

    public delegate User Authenticate(string username, string password);

    public class UserService : IUserService
    {
        readonly IHttpContextAccessor _contextAccessor;
        readonly IConfiguration _configuration;
        readonly IMemoryCache _memoryCache;
        readonly ISTLogger _logger;

        public UserService(IHttpContextAccessor contextAccessor, IConfiguration configuration, IMemoryCache memoryCache)
        {
            _contextAccessor = contextAccessor;
            _configuration = configuration;
            _memoryCache = memoryCache;
            _logger = STLoggerFactory.Logger;
        }

        public UserService(IHttpContextAccessor contextAccessor)
        {
            _contextAccessor = contextAccessor;
            _logger = STLoggerFactory.Logger;
        }

        public UserDataDTO Authenticate(Authenticate authenticate, User userParam)
        {
            _logger.Log($"UserService Authenticate start", Infrastructure.STLogging.Interface.LogLevelEnum.Info);

            var user = authenticate(userParam.Username, userParam.Password);

            // return IsAuthenticated false if user not found or password wrong
            if (user == null || !user.IsAuthenticated)
            {
                _logger.Log($"UserService Authenticate end with null", Infrastructure.STLogging.Interface.LogLevelEnum.Info);
                return null;
            }


            // authentication successful so generate jwt token
            _logger.Log($"UserService Authenticate authentication successful, generate jwt token", Infrastructure.STLogging.Interface.LogLevelEnum.Debug);
            var tokenGuidStr = Guid.NewGuid().ToString();
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(_configuration["ENCRYPTION_KEY"]);
            double expiresToken = 60;
            double.TryParse(_configuration["EXPIRES_TOKEN"], out expiresToken);

            var claims = GetUserClaims(user);
            claims.Add(new Claim(User.ClaimUsername, userParam.Username));
            claims.Add(new Claim("nodeId", userParam.NodeId));
            claims.Add(new Claim("guidSession", tokenGuidStr));
            claims.Add(new Claim("admin", "false"));
            claims.Add(new Claim("timestamp", DateTime.Now.Ticks.ToString()));
            
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Issuer = "IssuerNode",
                Audience = "AudienceNode",
                Expires = DateTime.Now.AddMinutes(expiresToken),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            user.Password = Utils.Encrypt(userParam.Password, _configuration["ENCRYPTION_PASSW"]);
            _logger.Log($"UserService Authenticate authentication set session", Infrastructure.STLogging.Interface.LogLevelEnum.Debug);
            //_contextAccessor.HttpContext.Session.SetString(Utils.EncodeMD5String(tokenGuidStr), JsonConvert.SerializeObject(user, Formatting.None, new JsonSerializerSettings { NullValueHandling = NullValueHandling.Ignore }));
            _contextAccessor.HttpContext.Session.SetString(Utils.EncodeMD5String(tokenGuidStr), user.Password);
            _contextAccessor.HttpContext.User = new System.Security.Principal.GenericPrincipal(new ClaimsIdentity(claims, "basic"), new string[] { });

            _logger.Log($"UserService Authenticate authentication create token", Infrastructure.STLogging.Interface.LogLevelEnum.Debug);
            var token = tokenHandler.CreateToken(tokenDescriptor);
            _logger.Log($"UserService Authenticate end success", Infrastructure.STLogging.Interface.LogLevelEnum.Info);
            return new UserDataDTO
            {
                Token = tokenHandler.WriteToken(token),
                Username = user.Username,
                Email = user.Email,
                Agencies = user.Agencies,
                Category = user.Category,
                Cube = user.Cube,
                CubeOwner = user.CubeOwner,
                Functionality = user.Functionality,
                Rules = user.Rules,
                Dataflow = user.Dataflow,
                DataflowOwner = user.DataflowOwner,
                MetadataFlow = user.MetadataFlow,
                MetadataFlowOwner = user.MetadataFlowOwner,
                IsAuthenticated = true
            };
        }

        public bool LoginSuperUser(User userParam)
        {
            _logger.Log($"UserService LoginSuperUser start", Infrastructure.STLogging.Interface.LogLevelEnum.Info);
            var appConfig = new ConfigManager(_configuration, _memoryCache).GetAppConfig();

            var userAdmin = appConfig.SuperUserCredentials.FirstOrDefault(user => user.username.Equals(userParam.Username, StringComparison.InvariantCultureIgnoreCase));
            
            userParam.Password = Encoding.UTF8.GetString(Convert.FromBase64String(userParam.Password));

            if (userAdmin == null || !userParam.Password.Equals(Utils.Decrypt(userAdmin.password, _configuration["ENCRYPTION_PASSW"])))
            {
                _logger.Log($"UserService LoginSuperUser end false", Infrastructure.STLogging.Interface.LogLevelEnum.Info);
                return false;
            }
            _logger.Log($"UserService LoginSuperUser set session", Infrastructure.STLogging.Interface.LogLevelEnum.Debug);
            _contextAccessor.HttpContext.Session.SetInt32("IsSuperUser", 1);
            _logger.Log($"UserService LoginSuperUser end true", Infrastructure.STLogging.Interface.LogLevelEnum.Info);
            return true;
        }

        public bool CheckSuperUser()
        {
            var result = _contextAccessor.HttpContext.Session.GetInt32("IsSuperUser");

            if (!result.HasValue || result.Value != 1)
            {
                return false;
            }

            return true;
        }

        public void LogoutSuperUser()
        {
            _contextAccessor.HttpContext.Session.Remove("IsSuperUser");
        }

        /// <summary>
        /// Create and assign a Claim from the UserData
        /// </summary>
        /// <param name="user"></param>
        /// <returns>List of all claim</returns>
        private List<Claim> GetUserClaims(User user)
        {
            _logger.Log($"UserService Authenticate start GetUserClaims", Infrastructure.STLogging.Interface.LogLevelEnum.Debug);

            var claims = new List<Claim>();

            claims.Add(new Claim("MA_SID", user.MA_SID));
            claims.Add(new Claim(User.ClaimEmail, user.Email ?? ""));

            if (user.Functionality != null)
            {
                foreach (var functionality in user.Functionality)
                {
                    claims.Add(new Claim(User.ClaimFunctionality, functionality));
                    _logger.Log($"ClaimFunctionality {functionality}", Infrastructure.STLogging.Interface.LogLevelEnum.Debug);
                }
            }
            if (user.Agencies != null)
            {
                foreach (var agency in user.Agencies)
                {
                    claims.Add(new Claim(User.ClaimAgency, agency));
                    _logger.Log($"ClaimAgency {agency}", Infrastructure.STLogging.Interface.LogLevelEnum.Debug);
                }
            }
            if (user.Rules != null)
            {
                foreach (var rules in user.Rules)
                {
                    claims.Add(new Claim(User.ClaimRule, rules));
                    _logger.Log($"ClaimRule {rules}", Infrastructure.STLogging.Interface.LogLevelEnum.Debug);
                }
            }
            if (user.Category != null)
            {
                foreach (var category in user.Category)
                {
                    claims.Add(new Claim(User.ClaimCategory, category));
                    _logger.Log($"ClaimCategory {category}", Infrastructure.STLogging.Interface.LogLevelEnum.Debug);
                }
            }
            if (user.Cube != null)
            {
                foreach (var cube in user.Cube)
                {
                    claims.Add(new Claim(User.ClaimCube, cube));
                    _logger.Log($"ClaimCube {cube}", Infrastructure.STLogging.Interface.LogLevelEnum.Debug);
                }
            }
            if (user.CubeOwner != null)
            {
                foreach (var cube in user.CubeOwner)
                {
                    claims.Add(new Claim(User.ClaimCubeOwner, cube));
                    _logger.Log($"ClaimCubeOwner {cube}", Infrastructure.STLogging.Interface.LogLevelEnum.Debug);
                }
            }
            if (user.Dataflow != null)
            {
                foreach (var dataFlow in user.Dataflow)
                {
                    claims.Add(new Claim(User.ClaimDataflow, dataFlow));
                    _logger.Log($"ClaimDataflow {dataFlow}", Infrastructure.STLogging.Interface.LogLevelEnum.Debug);
                }
            }
            if (user.DataflowOwner != null)
            {
                foreach (var dataFlow in user.DataflowOwner)
                {
                    claims.Add(new Claim(User.ClaimDataflowOwner, dataFlow));
                    _logger.Log($"ClaimDataflowOwner {dataFlow}", Infrastructure.STLogging.Interface.LogLevelEnum.Debug);
                }
            }
            if (user.MetadataFlow != null)
            {
                foreach (var metadataflow in user.MetadataFlow)
                {
                    claims.Add(new Claim(User.ClaimMetadataFlow, metadataflow));
                    _logger.Log($"MetadataFlow {metadataflow}", Infrastructure.STLogging.Interface.LogLevelEnum.Debug);
                }
            }
            if (user.MetadataFlowOwner != null)
            {
                foreach (var metadataflow in user.MetadataFlowOwner)
                {
                    claims.Add(new Claim(User.ClaimMetadataFlowOwner, metadataflow));
                    _logger.Log($"MetadataFlowOwner {metadataflow}", Infrastructure.STLogging.Interface.LogLevelEnum.Debug);
                }
            }
            _logger.Log($"UserService Authenticate end GetUserClaims", Infrastructure.STLogging.Interface.LogLevelEnum.Debug);
            return claims;
        }

        public void Logout()
        {
            var isUserUser = CheckSuperUser();
            _contextAccessor.HttpContext.Session.Clear();
            if (isUserUser)
            {
                _contextAccessor.HttpContext.Session.SetInt32("IsSuperUser", 1);
            }
        }
    }
#pragma warning restore CS1591 // Missing XML comment for publicly visible type or member
}
