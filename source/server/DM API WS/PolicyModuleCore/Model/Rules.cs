using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace PolicyModuleCore.Model
{
    public class Rules
    {
        public Rules(IEnumerable<RestResource> restResources, IEnumerable<SoapEndpoint> soapEndpoints)
        {
            this.RestResources = restResources.ToArray();
            this.SoapEndpoints = soapEndpoints.ToArray();
        }

        /// <summary>
        /// Gets the rest resources.
        /// </summary>
        /// <value>
        /// The rest resources.
        /// </value>
        public IReadOnlyList<RestResource> RestResources { get; }

        /// <summary>
        /// Gets the SOAP endpoints.
        /// </summary>
        /// <value>
        /// The SOAP endpoints.
        /// </value>
        public IReadOnlyList<SoapEndpoint> SoapEndpoints { get; }
    }
}
