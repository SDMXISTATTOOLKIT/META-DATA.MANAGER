using System;
using System.Collections.Generic;
using System.Text;
using System.Xml.XPath;

namespace AuthCore.PolicyModuleCore.Model
{
    public class SoapEndpoint : BaseEndpointType
    {
        /// <summary>
        /// To string
        /// </summary>
        private readonly string _toString;

        /// <summary>
        /// Initializes a new instance of the <see cref="SoapEndpoint"/> class.
        /// </summary>
        /// <param name="pathExpression">The path expression.</param>
        /// <param name="allowAnonymous">if set to <c>true</c> [allow anonymous].</param>
        /// <param name="andSet">The and set.</param>
        /// <param name="orSet">The or set.</param>
        /// <param name="xPathType">Type of the x path.</param>
        /// <exception cref="ArgumentNullException">xPathType</exception>
        public SoapEndpoint(string pathExpression, bool allowAnonymous, int priority, Dictionary<string, List<string>> andSet, Dictionary<string, List<string>> orSet, Dictionary<string, List<string>> andGroupSet, Dictionary<string, List<string>> orGroupSet, XPathType xPathType)
            : base(pathExpression, allowAnonymous, priority, andSet, orSet, andGroupSet, orGroupSet)
        {
            if (xPathType == null)
            {
                throw new ArgumentNullException(nameof(xPathType));
            }

            Expression = xPathType.Expression;
            _toString = ", XPath Type:" + xPathType;
        }

        /// <summary>
        /// Gets the expression.
        /// </summary>
        /// <value>The expression.</value>
        public XPathExpression Expression { get; }

        /// <summary>
        /// Returns a <see cref="System.String" /> that represents this instance.
        /// </summary>
        /// <returns>A <see cref="System.String" /> that represents this instance.</returns>
        public override string ToString()
        {
            return base.ToString() + _toString;
        }
    }
}
