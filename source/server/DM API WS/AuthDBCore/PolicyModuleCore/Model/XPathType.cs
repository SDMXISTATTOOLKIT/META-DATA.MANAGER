using System;
using System.Collections.Generic;
using System.Text;
using System.Xml;
using System.Xml.XPath;

namespace AuthCore.PolicyModuleCore.Model
{
    public class XPathType
    {
        /// <summary>
        /// The expression
        /// </summary>
        private readonly XPathExpression _expression;

        private readonly string _toString;

        /// <summary>
        /// Initializes a new instance of the <see cref="XPathType"/> class.
        /// </summary>
        /// <param name="xmlNamespaceResolver">The XML namespace resolver.</param>
        /// <param name="expression">The expression.</param>
        public XPathType(IXmlNamespaceResolver xmlNamespaceResolver, string expression)
        {
            if (expression == null)
            {
                throw new System.ArgumentNullException(nameof(expression));
            }

            _toString = expression;

            try
            {
                this._expression = XPathExpression.Compile(expression.Trim(), xmlNamespaceResolver);
            }
            catch (XPathException)
            {
                this._expression = XPathExpression.Compile("false()");
                _toString = "false() and old " + expression;
            }
        }

        /// <summary>
        /// Gets the expression.
        /// </summary>
        /// <value>
        /// The expression.
        /// </value>
        public XPathExpression Expression => this._expression;

        /// <summary>
        /// Returns a <see cref="System.String" /> that represents this instance.
        /// </summary>
        /// <returns>A <see cref="System.String" /> that represents this instance.</returns>
        public override string ToString()
        {
            return _toString;
        }
    }
}
