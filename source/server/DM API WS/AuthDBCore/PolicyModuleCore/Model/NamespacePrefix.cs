using System;
using System.Collections.Generic;
using System.Text;

namespace AuthCore.PolicyModuleCore.Model
{
    /// <summary>
    /// Model class for holding the XML prefix and namespace pairs
    /// </summary>
    public class NamespacePrefix
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="NamespacePrefix"/> class.
        /// </summary>
        /// <param name="prefix">The prefix.</param>
        /// <param name="ns">The ns.</param>
        public NamespacePrefix(string prefix, Uri ns)
        {
            this.Prefix = prefix;
            this.Namespace = ns;
        }

        /// <summary>
        /// Gets the prefix.
        /// </summary>
        /// <value>
        /// The prefix.
        /// </value>
        public string Prefix { get; }

        /// <summary>
        /// Gets the namespace.
        /// </summary>
        /// <value>
        /// The namespace.
        /// </value>
        public Uri Namespace { get; }
    }
}
