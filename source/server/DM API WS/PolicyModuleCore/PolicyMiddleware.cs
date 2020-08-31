using Microsoft.AspNetCore.Http;
using PolicyModuleCore.Manager;
using System;
using System.IO;
using System.Xml;

namespace PolicyModuleCore
{
    public class PolicyMiddleware
    {
        private PolicyDecisionPointManager _decisionPointManager;

        private readonly RequestDelegate _next;

        public PolicyMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        private void CreatePolicyDecisionPoint()
        {
            // TODO from configuration
            var rulesPath = "/config/nsiws.xml";
            var schemaPath = "/config/rules.xsd";
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
                    var rules = policyInformation.Parse(stream, schemaPath);
                    this._decisionPointManager = new PolicyDecisionPointManager(rules);
                }
                catch (XmlException e)
                {
                    throw;
                }
            }
        }

        //switch (accessResponseType)
        //    {
        //        case AccessResponseType.Success:
        //            return;
        //        case AccessResponseType.AnonymousUserDenied:
        //            _log.DebugFormat(CultureInfo.InvariantCulture, "Anonymous access denied for path {0}", application.Request.Url);
        //            CreateAnonymousDenieddResponse(application);
        //            break;
        //        case AccessResponseType.InsufficientPermissions:
        //            _log.DebugFormat(CultureInfo.InvariantCulture, "Access denied for path {0}", application.Request.Url);
        //            CreateDeniedResponse(application);
        //            break;
        //        default:
        //            _log.DebugFormat(CultureInfo.InvariantCulture, "Rule not found for path {0}", application.Request.Url);
        //            CreateNotFound(application);
        //            break;
        //    }
}
    
}
