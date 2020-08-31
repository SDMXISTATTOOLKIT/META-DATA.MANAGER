using System;
using System.Collections.Generic;
using System.Text;

namespace PolicyModuleCore.Model
{
    public class RestResource : BaseEndpointType
    {
        public RestResource(string pathExpression, bool allowAnonymous, IEnumerable<string> andSet, IEnumerable<string> orSet, string method)
            : base(pathExpression, allowAnonymous, andSet, orSet)
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
