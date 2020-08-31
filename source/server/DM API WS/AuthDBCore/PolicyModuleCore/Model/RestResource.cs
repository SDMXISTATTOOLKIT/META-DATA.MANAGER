using System;
using System.Collections.Generic;
using System.Text;

namespace AuthCore.PolicyModuleCore.Model
{
    public class RestResource : BaseEndpointType
    {
        public RestResource(string pathExpression, bool allowAnonymous, int priority, Dictionary<string, List<string>> andSet, Dictionary<string, List<string>> orSet, Dictionary<string, List<string>> andGroupSet, Dictionary<string, List<string>> orGroupSet, string method)
            : base(pathExpression, allowAnonymous, priority, andSet, orSet, andGroupSet, orGroupSet)
        {
            this.Method = method;
        }

        public string Method { get; }

        public override string ToString()
        {
            return base.ToString() + "Method: " + Method;
        }
    }
}
