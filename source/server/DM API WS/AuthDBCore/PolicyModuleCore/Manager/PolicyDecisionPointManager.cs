using AuthCore.Model;
using AuthCore.PolicyModuleCore.Constant;
using AuthCore.PolicyModuleCore.Model;
using Infrastructure.STLogging.Interface;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Hosting;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Security.Claims;
using System.Security.Principal;
using System.Xml;
using System.Xml.XPath;

namespace AuthCore.PolicyModuleCore.Manager
{
    public class PolicyDecisionPointManager
    {
        /// <summary>
        /// The rules
        /// </summary>
        readonly Rules _rules;

        readonly ISTLogger _logger;

        /// <summary>
        /// Initializes a new instance of the <see cref="PolicyDecisionPointManager"/> class.
        /// </summary>
        /// <param name="env"></param>
        /// <param name="logger"></param>
        public PolicyDecisionPointManager(IHostingEnvironment env, ISTLogger logger)
        {
            _logger = logger;

            var rulesPath = env.ContentRootPath+"\\config\\rules.xml";
            _logger.Log($"PolicyDecisionPointManager take rules from {rulesPath}", LogLevelEnum.Debug);
            var schemaPath = env.ContentRootPath + "\\config\\rules.xsd";
            _logger.Log($"PolicyDecisionPointManager take schema from {schemaPath}", LogLevelEnum.Debug);
            if (rulesPath == null || !File.Exists(rulesPath))
            {
                throw new FileNotFoundException(rulesPath);
            }

            if (!File.Exists(schemaPath))
            {
                schemaPath = null;
            }

            PolicyInformationFromXml policyInformation = new PolicyInformationFromXml();
            using (var stream = File.OpenRead(rulesPath))
            {
                try
                {
                    _logger.Log($"PolicyDecisionPointManager start parse", LogLevelEnum.Debug);
                    _rules = policyInformation.Parse(stream, schemaPath);
                    _logger.Log($"PolicyDecisionPointManager end parse", LogLevelEnum.Debug);
                }
                catch (XmlException)
                {
                    throw;
                }
            }
        }

        /// <summary>
        /// Determines whether this instance can access the specified context.
        /// </summary>
        /// <param name="context">The context.</param>
        /// <returns><c>true</c> if this instance can access the specified context; otherwise, <c>false</c>.</returns>
        public AccessResponseType CanAccess(HttpContext context)
        {
            var fullpath = context.Request.Path;
            var appPath = string.Empty; //TODO ApplicationPath
            var appPathLen = appPath.Length;
            var path = fullpath.ToString().Substring(appPathLen);
            if (string.IsNullOrWhiteSpace(path))
            {
                path = "/";
            }
            else if (path[0] != '/')
            {
                path = "/" + path;
            }

            var method = context.Request.Method;
            var user = context.User;

            //Check Rest
            _logger.Log($"PolicyDecisionPointManager check path for rest", LogLevelEnum.Debug);
            foreach (var rulesRestResource in this._rules.RestResources)
            {
                if ((rulesRestResource.Method.Equals("ANY", StringComparison.InvariantCultureIgnoreCase) || method.Equals(rulesRestResource.Method, StringComparison.InvariantCultureIgnoreCase)) 
                    && rulesRestResource.PathExpression.IsMatch(path))
                {
                    return Authorize(user, rulesRestResource);
                }
            }


            // Check SOAP (supports only POST)
            _logger.Log($"PolicyDecisionPointManager check path for soap", LogLevelEnum.Debug);
            if (method.Equals(HttpMethod.Post.Method, StringComparison.InvariantCultureIgnoreCase))
            {
                _logger.Log($"PolicyDecisionPointManager is POST", LogLevelEnum.Debug);
                string temp = null;
                XPathDocument document = null;
                try
                {
                    foreach (var soapEndpoint in this._rules.SoapEndpoints)
                    {
                        if (soapEndpoint.PathExpression.IsMatch(path))
                        {
                            if (document == null)
                            {
                                temp = Path.GetTempFileName();
                                using (StreamWriter sw = new StreamWriter(temp))
                                {
                                    sw.Write(context.Request.Body);
                                }
                                document = new XPathDocument(temp);
                            }

                            var navigator = document.CreateNavigator();
                            var result = navigator.Evaluate(soapEndpoint.Expression);
                            if (result is bool && ((bool)result))
                            {
                                return Authorize(user, soapEndpoint);
                            }
                        }
                    }
                }
                finally
                {
                    if (temp != null && File.Exists(temp))
                    {
                        File.Delete(temp);
                    }
                }
            }
            else if (method.Equals(HttpMethod.Get.Method, StringComparison.InvariantCultureIgnoreCase))
            {
                _logger.Log($"PolicyDecisionPointManager is GET", LogLevelEnum.Debug);

                // WSDL and SOAP API access
                foreach (var soapEndpoint in this._rules.SoapEndpoints)
                {
                    if (soapEndpoint.PathExpression.IsMatch(path))
                    {
                        // we allow it
                        return AccessResponseType.Success;
                    }
                }
            }


            return AccessResponseType.RuleNotFound;
        }

        /// <summary>
        /// Authorizes the specified user.
        /// </summary>
        /// <param name="user">The user.</param>
        /// <param name="rulesResource">The rules rest resource.</param>
        /// <returns></returns>
        private AccessResponseType Authorize(IPrincipal user, BaseEndpointType rulesResource)
        {
            if (user == null)
            {
                return AllowAnonymousUser(rulesResource);
            }
            else
            {
                if (!user.Identity.IsAuthenticated)
                {
                    return AllowAnonymousUser(rulesResource);
                }

                var globalStatus = true;

                var identity = user.Identity as ClaimsIdentity;
                if (identity == null)
                {
                    _logger.Log($"PolicyDecisionPointManager Authorize have an null identity", LogLevelEnum.Debug);
                    return AccessResponseType.InsufficientPermissions;
                }

                var claimPermission = identity.Claims.Where(c => c.Type == User.ClaimRule).Select(s => s.Value.ToUpperInvariant());
                var claimFunctionality = identity.Claims.Where(c => c.Type == User.ClaimFunctionality).Select(s => s.Value.ToUpperInvariant());

                //START VALIDATE AND
                if (rulesResource.AndSet.Count > 0)
                {
                    _logger.Log($"PolicyDecisionPointManager Authorize have a policy for And", LogLevelEnum.Debug);

                    globalStatus = false;
                    var statusPermission = false;
                    var statusFunctionality = false;

                    //Permission (from rules to role)
                    var allRules = new HashSet<string>();
                    if (rulesResource.AndSet.ContainsKey("permission"))
                    {
                        allRules = rulesResource.AndSet["permission"];
                    }
                    if (allRules.Count == 1 && allRules.Contains("Any", StringComparer.InvariantCultureIgnoreCase))
                    {
                        statusPermission = true;
                    }

                    if (!statusPermission && allRules.Count > 0)
                    {
                        statusPermission = allRules.All(item => claimPermission.Contains(item.ToUpperInvariant())) ? true : false;
                    }
                    _logger.Log($"PolicyDecisionPointManager Authorize statusPermission is {statusPermission} after And Permission", LogLevelEnum.Debug);

                    if (statusPermission)
                    {
                        //Permission (from functionality to functionality)
                        if (rulesResource.AndSet.ContainsKey("functionality"))
                        {
                            allRules = rulesResource.AndSet["functionality"];
                        }
                        if (allRules.Count == 1 && allRules.Contains("Any", StringComparer.InvariantCultureIgnoreCase))
                        {
                            statusFunctionality = true;
                        }

                        if (!statusFunctionality && allRules.Count > 0)
                        {
                            statusFunctionality = allRules.All(item => claimFunctionality.Contains(item.ToUpperInvariant())) ? true : false;
                        }

                        if (statusFunctionality)
                        {
                            globalStatus = true;
                        }
                        _logger.Log($"PolicyDecisionPointManager Authorize statusPermission is {statusFunctionality} after And Functionality", LogLevelEnum.Debug);
                    }
                }
                //END VALIDATE AND
                _logger.Log($"PolicyDecisionPointManager Authorize globalStatus is {globalStatus} after And", LogLevelEnum.Debug);

                if (!globalStatus)
                {
                    return AccessResponseType.InsufficientPermissions;
                }

                //START VALIDATE OR
                if (rulesResource.OrSet.Count > 0)
                {
                    _logger.Log($"PolicyDecisionPointManager Authorize have a policy for Or", LogLevelEnum.Debug);

                    globalStatus = false;
                    var statusPermission = false;
                    var statusFunctionality = false;

                    //Permission (from rules to role)
                    var allRules = new HashSet<string>();
                    if (rulesResource.OrSet.ContainsKey("permission"))
                    {
                        allRules = rulesResource.OrSet["permission"];
                    }
                    if (allRules.Count == 1 && allRules.Contains("Any", StringComparer.InvariantCultureIgnoreCase))
                    {
                        statusPermission = true;
                        globalStatus = true;
                    }

                    if (!statusPermission && allRules.Count > 0)
                    {
                        statusPermission = allRules.Any(item => claimPermission.Contains(item.ToUpperInvariant())) ? true : false;
                        globalStatus = statusPermission;
                    }
                    _logger.Log($"PolicyDecisionPointManager Authorize statusPermission is {statusPermission} after Or Permission", LogLevelEnum.Debug);

                    if (!statusPermission)
                    {
                        //Permission (from functionality to functionality)
                        if (rulesResource.OrSet.ContainsKey("functionality"))
                        {
                            allRules = rulesResource.OrSet["functionality"];
                        }
                        if (allRules.Count == 1 && allRules.Contains("Any", StringComparer.InvariantCultureIgnoreCase))
                        {
                            statusFunctionality = true;
                        }

                        if (!statusFunctionality && allRules.Count > 0)
                        {
                            statusFunctionality = allRules.Any(item => claimFunctionality.Contains(item.ToUpperInvariant())) ? true : false;
                        }

                        if (statusFunctionality)
                        {
                            globalStatus = true;
                        }
                        _logger.Log($"PolicyDecisionPointManager Authorize statusFunctionality is {statusFunctionality} after Or Functionality", LogLevelEnum.Debug);
                    }
                }
                //END VALIDATE OR
                _logger.Log($"PolicyDecisionPointManager Authorize globalStatus is {globalStatus} after Or", LogLevelEnum.Debug);

                if (!globalStatus)
                {
                    return AccessResponseType.InsufficientPermissions;
                }

                //START VALIDATE ANDGROUP
                if (rulesResource.AndGroupSet.Count > 0)
                {
                    _logger.Log($"PolicyDecisionPointManager Authorize have a policy for AndGroup", LogLevelEnum.Debug);

                    globalStatus = false;
                    var statusPermission = false;
                    var statusFunctionality = false;

                    //Permission (from rules to role)
                    var allRules = new HashSet<string>();
                    if (rulesResource.AndGroupSet.ContainsKey("permission"))
                    {
                        allRules = rulesResource.AndGroupSet["permission"];
                    }
                    if (allRules.Count == 1 && allRules.Contains("Any", StringComparer.InvariantCultureIgnoreCase))
                    {
                        statusPermission = true;
                        globalStatus = true;
                    }

                    if (!statusPermission && allRules.Count > 0)
                    {
                        statusPermission = allRules.All(item => claimPermission.Contains(item.ToUpperInvariant())) ? true : false;
                        globalStatus = statusPermission;
                    }
                    _logger.Log($"PolicyDecisionPointManager Authorize statusPermission is {statusPermission} after AndGroup Permission", LogLevelEnum.Debug);

                    if (!statusPermission)
                    {
                        //Permission (from functionality to functionality)
                        if (rulesResource.AndGroupSet.ContainsKey("functionality"))
                        {
                            allRules = rulesResource.AndGroupSet["functionality"];
                        }
                        if (allRules.Count == 1 && allRules.Contains("Any", StringComparer.InvariantCultureIgnoreCase))
                        {
                            statusFunctionality = true;
                        }

                        if (!statusFunctionality && allRules.Count > 0)
                        {
                            statusFunctionality = allRules.All(item => claimFunctionality.Contains(item.ToUpperInvariant())) ? true : false;
                        }

                        if (statusFunctionality)
                        {
                            globalStatus = true;
                        }
                        _logger.Log($"PolicyDecisionPointManager Authorize statusFunctionality is {statusFunctionality} after AndGroup Functionality", LogLevelEnum.Debug);
                    }
                }
                //END VALIDATE ANDGROUP
                _logger.Log($"PolicyDecisionPointManager Authorize globalStatus is {globalStatus} after AndGroup", LogLevelEnum.Debug);

                if (!globalStatus)
                {
                    return AccessResponseType.InsufficientPermissions;
                }

                //START VALIDATE ORGROUP
                if (rulesResource.OrGroupSet.Count > 0)
                {
                    _logger.Log($"PolicyDecisionPointManager Authorize have a policy for OrGroup", LogLevelEnum.Debug);

                    globalStatus = false;
                    var statusPermission = false;
                    var statusFunctionality = false;

                    //Permission (from rules to role)
                    var allRules = new HashSet<string>();
                    if (rulesResource.OrGroupSet.ContainsKey("permission"))
                    {
                        allRules = rulesResource.OrGroupSet["permission"];
                    }
                    if (allRules.Count == 1 && allRules.Contains("Any", StringComparer.InvariantCultureIgnoreCase))
                    {
                        statusPermission = true;
                    }

                    if (!statusPermission && allRules.Count > 0)
                    {
                        statusPermission = allRules.Any(item => claimPermission.Contains(item.ToUpperInvariant())) ? true : false;
                    }
                    _logger.Log($"PolicyDecisionPointManager Authorize statusPermission is {statusPermission} after OrGroup Permission", LogLevelEnum.Debug);

                    if (!statusPermission)
                    {
                        //Permission (from functionality to functionality)
                        if (rulesResource.OrGroupSet.ContainsKey("functionality"))
                        {
                            allRules = rulesResource.OrGroupSet["functionality"];
                        }
                        if (allRules.Count == 1 && allRules.Contains("Any", StringComparer.InvariantCultureIgnoreCase))
                        {
                            statusFunctionality = true;
                        }

                        if (!statusFunctionality && allRules.Count > 0)
                        {
                            statusFunctionality = allRules.Any(item => claimFunctionality.Contains(item.ToUpperInvariant())) ? true : false;
                        }

                        if (statusFunctionality)
                        {
                            globalStatus = true;
                        }
                        _logger.Log($"PolicyDecisionPointManager Authorize statusFunctionality is {statusFunctionality} after OrGroup Functionality", LogLevelEnum.Debug);
                    }
                }
                //END VALIDATE ORGROUP
                _logger.Log($"PolicyDecisionPointManager Authorize globalStatus is {globalStatus} after OrGroup", LogLevelEnum.Debug);

                if (!globalStatus)
                {
                    return AccessResponseType.InsufficientPermissions;
                }

                return AccessResponseType.Success;
            }
        }


        /// <summary>
        /// Check if an anonymous user is allowed by the specified <paramref name="rulesRestResource"/>.
        /// </summary>
        /// <param name="rulesRestResource">The rules rest resource.</param>
        /// <returns><c>true</c> if anonymous users are allowed, <c>false</c> otherwise.</returns>
        private AccessResponseType AllowAnonymousUser(BaseEndpointType rulesRestResource)
        {
            if (rulesRestResource.AllowAnonymous)
            {
                _logger.Log($"PolicyDecisionPointManager AllowAnonymousUser true", LogLevelEnum.Debug);
                return AccessResponseType.Success;
            }
            else
            {
                _logger.Log($"PolicyDecisionPointManager AllowAnonymousUser false", LogLevelEnum.Debug);
                return AccessResponseType.AnonymousUserDenied;
            }
        }
    }
}
