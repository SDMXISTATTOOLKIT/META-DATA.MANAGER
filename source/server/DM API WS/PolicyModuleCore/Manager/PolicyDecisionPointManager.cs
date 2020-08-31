using Microsoft.AspNetCore.Http;
using PolicyModuleCore.Constant;
using PolicyModuleCore.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.IO;
using System.Net.Http;
using System.Security.Principal;
using System.Text;
using System.Xml.XPath;

namespace PolicyModuleCore.Manager
{
    public class PolicyDecisionPointManager
    {
        /// <summary>
        /// The rules
        /// </summary>
        private readonly Rules _rules;

        /// <summary>
        /// Initializes a new instance of the <see cref="PolicyDecisionPointManager"/> class.
        /// </summary>
        /// <param name="rules">The rules.</param>
        public PolicyDecisionPointManager(Rules rules)
        {
            this._rules = rules;
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
            foreach (var rulesRestResource in this._rules.RestResources)
            {
                if (method.Equals(rulesRestResource.Method) && rulesRestResource.PathExpression.IsMatch(path))
                {
                    return Authorize(user, rulesRestResource);
                }
            }
            

            // Check SOAP (supports only POST)
            if (method.Equals(HttpMethod.Post.Method))
            {
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
            else if (method.Equals(HttpMethod.Get.Method))
            {
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
        /// <param name="rulesRestResource">The rules rest resource.</param>
        /// <returns><c>true</c> if XXXX, <c>false</c> otherwise.</returns>
        private static AccessResponseType Authorize(IPrincipal user, BaseEndpointType rulesResource)
        {
            if (user == null)
            {
                return AllowAnonymousUser(rulesResource);
            }
            else
            {
                // handle windows anonymous user
                //WindowsIdentity identity = user.Identity as WindowsIdentity;
                //if (identity != null && identity.IsAnonymous)
                //{
                //    return AllowAnonymousUser(rulesRestResource);
                //}
                //Change from ASP to ASPCore
                if (!user.Identity.IsAuthenticated)
                {
                    return AllowAnonymousUser(rulesResource);
                }

                var andSet = rulesResource.AndSet;
                if (andSet.Count > 0)
                {
                    if (andSet.Count == 1 && andSet.Contains("Any", StringComparer.OrdinalIgnoreCase))
                    {
                        return AccessResponseType.Success;
                    }

                    return andSet.All(user.IsInRole) ? AccessResponseType.Success : AccessResponseType.InsufficientPermissions;
                }

                var orSet = rulesResource.OrSet;
                if (orSet.Count > 0)
                {
                    if (orSet.Count == 1 && orSet.Contains("Any", StringComparer.OrdinalIgnoreCase))
                    {
                        return AccessResponseType.Success;
                    }

                    return orSet.Any(user.IsInRole) ? AccessResponseType.Success : AccessResponseType.InsufficientPermissions;
                }

                return AccessResponseType.InsufficientPermissions;
            }
        }


        /// <summary>
        /// Check if an anonymous user is allowed by the specified <paramref name="rulesRestResource"/>.
        /// </summary>
        /// <param name="rulesRestResource">The rules rest resource.</param>
        /// <returns><c>true</c> if anonymous users are allowed, <c>false</c> otherwise.</returns>
        private static AccessResponseType AllowAnonymousUser(BaseEndpointType rulesRestResource)
        {
            if (rulesRestResource.AllowAnonymous)
            {
                return AccessResponseType.Success;
            }
            else
            {
                return AccessResponseType.AnonymousUserDenied;
            }
        }
    }
}
