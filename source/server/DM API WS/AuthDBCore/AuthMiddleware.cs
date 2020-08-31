using AuthCore.Interface;
using AuthCore.Model;
using AuthCore.PolicyModuleCore.Constant;
using AuthCore.PolicyModuleCore.Manager;
using Infrastructure.STLogging.Factory;
using Infrastructure.STLogging.Interface;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Options;
using System.Collections.Generic;
using System.Security.Claims;
using System.Security.Principal;
using System.Threading.Tasks;

namespace AuthCore
{
    public class AuthMiddleware
    {
        readonly RequestDelegate _next;
        readonly IOptionsMonitor<AuthAppOptions> _config;
        readonly PolicyDecisionPointManager _policyDecision;
        readonly ISTLogger _logger;

        public AuthMiddleware(RequestDelegate next, IOptionsMonitor<AuthAppOptions> config, IHostingEnvironment env)
        {
            _logger = STLoggerFactory.Logger;
            _next = next;
            _config = config;
            _policyDecision = new PolicyDecisionPointManager(env, _logger);
        }

        public async Task Invoke(HttpContext httpContext, IUserData _userData)
        {
            _logger.Log("AuthMiddleware Invoke", LogLevelEnum.Debug);

            if (_logger.IsDebugEnabled)
            {
                _logger.Log($"AuthMiddleware processing request: {httpContext.Request.Path}", LogLevelEnum.Debug);
            }

            IAuthManager _authManager = new AuthBasicManager(_config.CurrentValue, _userData, _logger);

            var anonymous = _authManager.AnonymousRequest(httpContext);
            if (!anonymous)
            {
                if (!_authManager.CheckLogin(httpContext))
                {
                    _logger.Log("AuthMiddleware CheckLogin UnAuthorized", LogLevelEnum.Info);
                    httpContext.Response.StatusCode = 401; //UnAuthorized
                    await httpContext.Response.WriteAsync("Login Invalid");
                    return;
                }

                if (!_authManager.GetUserData())
                {
                    _logger.Log("AuthMiddleware GetUserData UnAuthorized", LogLevelEnum.Info);
                    httpContext.Response.StatusCode = 401; //UnAuthorized
                    await httpContext.Response.WriteAsync("Login Invalid");
                    return;
                }

                CreateAuthenticatedUser(httpContext, _userData);
            }

            //Start Check Rules
            _logger.Log($"AuthMiddleware start to valutate CanAccess", LogLevelEnum.Debug);
            var accessResponseType = _policyDecision.CanAccess(httpContext);
            _logger.Log($"AuthMiddleware end to valutate CanAccess", LogLevelEnum.Debug);

            if (accessResponseType == AccessResponseType.AnonymousUserDenied)
            {
                if (!anonymous)
                {
                    _logger.Log("AuthMiddleware UnAuthorized", LogLevelEnum.Info);
                    httpContext.Response.StatusCode = 401; //UnAuthorized
                    await httpContext.Response.WriteAsync("The requested resource requires user authentication.");
                    return;
                }
                else
                {
                    _logger.Log("AuthMiddleware Forbidden", LogLevelEnum.Info);
                    httpContext.Response.StatusCode = 403; //Forbidden
                    await httpContext.Response.WriteAsync("The requested resource requires user authentication.");
                    return;
                }
            }
            else if (accessResponseType == AccessResponseType.InsufficientPermissions)
            {
                _logger.Log("AuthMiddleware InsufficientPermissions", LogLevelEnum.Info);
                httpContext.Response.StatusCode = 403; //Forbidden
                await httpContext.Response.WriteAsync("403 Forbidden");
                return;
            }
            else if (accessResponseType == AccessResponseType.RuleNotFound)
            {
                _logger.Log("AuthMiddleware RuleNotFound", LogLevelEnum.Info);
                httpContext.Response.StatusCode = 404; //Not found
                await httpContext.Response.WriteAsync("404 Not found");
                return;
            }
            //END Check Rules


            _logger.Log("AuthMiddleware InvokeNext", LogLevelEnum.Debug);
            await _next.Invoke(httpContext);
        }

        /// <summary>
        /// Create authenticated user and assign a Claim from the UserData
        /// </summary>
        /// <param name="">/param>
        /// <returns>List of all claim</returns>
        private void CreateAuthenticatedUser(HttpContext httpContext, IUserData userData)
        {
            _logger.Log("AuthMiddleware CreateAuthenticatedUser", LogLevelEnum.Debug);

            //Create Authenticated User
            var claims = new List<Claim>();

            var claimUser = new Claim(User.ClaimUsername, userData.Username);
            claims.Add(new Claim(User.ClaimEmail, userData.Email ?? ""));

            if (userData.Functionality != null)
            {
                foreach (var functionality in userData.Functionality)
                {
                    claims.Add(new Claim(User.ClaimFunctionality, functionality));
                }
            }
            if (userData.Agencies != null)
            {
                foreach (var agency in userData.Agencies)
                {
                    claims.Add(new Claim(User.ClaimAgency, agency));
                }
            }
            if (userData.Rules != null)
            {
                foreach (var rules in userData.Rules)
                {
                    claims.Add(new Claim(User.ClaimRule, rules));
                }
            }
            if (userData.Category != null)
            {
                foreach (var cat in userData.Category)
                {
                    claims.Add(new Claim(User.ClaimCategory, cat));
                }
            }
            if (userData.Cube != null)
            {
                foreach (var cube in userData.Cube)
                {
                    claims.Add(new Claim(User.ClaimCube, cube));
                }
            }
            if (userData.CubeOwner != null)
            {
                foreach (var cube in userData.CubeOwner)
                {
                    claims.Add(new Claim(User.ClaimCubeOwner, cube));
                }
            }
            if (userData.Dataflow != null)
            {
                foreach (var dataflow in userData.Dataflow)
                {
                    claims.Add(new Claim(User.ClaimDataflow, dataflow));
                }
            }
            if (userData.DataflowOwner != null)
            {
                foreach (var dataflow in userData.DataflowOwner)
                {
                    claims.Add(new Claim(User.ClaimDataflowOwner, dataflow));
                }
            }
            if (userData.MetadataFlow != null)
            {
                foreach (var metadataFlow in userData.MetadataFlow)
                {
                    claims.Add(new Claim(User.ClaimMetadataFlow, metadataFlow));
                }
            }
            if (userData.MetadataFlowOwner != null)
            {
                foreach (var metadataflow in userData.MetadataFlowOwner)
                {
                    claims.Add(new Claim(User.ClaimMetadataFlowOwner, metadataflow));
                }
            }

            _logger.Log("AuthMiddleware generate new GenericPrincipal", LogLevelEnum.Debug);
            httpContext.User = new GenericPrincipal(new ClaimsIdentity(claims, "basic"), userData.Rules.ToArray());
        }

    }



}

