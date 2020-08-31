using System;
using System.Collections.Generic;
using System.Globalization;
using System.Text;
using System.Text.RegularExpressions;

namespace PolicyModuleCore.Model
{
    public abstract class BaseEndpointType
    {
        /// <summary>
        /// To string
        /// </summary>
        private readonly string _toString;

        /// <summary>
        /// Initializes a new instance of the <see cref="BaseEndpointType"/> class.
        /// </summary>
        /// <param name="pathExpression">The path expression.</param>
        /// <param name="allowAnonymous">if set to <c>true</c> [allow anonymous].</param>
        /// <param name="andSet">The and set.</param>
        /// <param name="orSet">The or set.</param>
        protected BaseEndpointType(string pathExpression, bool allowAnonymous, IEnumerable<string> andSet, IEnumerable<string> orSet)
        {
            if (pathExpression == null)
                throw new ArgumentNullException(nameof(pathExpression));
            if (andSet == null)
                throw new ArgumentNullException(nameof(andSet));
            if (orSet == null)
                throw new ArgumentNullException(nameof(orSet));

            this.PathExpression = new Regex(pathExpression, RegexOptions.Compiled | RegexOptions.CultureInvariant | RegexOptions.Singleline);
            this.AllowAnonymous = allowAnonymous;
            this.AndSet = new HashSet<string>(andSet, StringComparer.Ordinal);
            this.OrSet = new HashSet<string>(orSet, StringComparer.Ordinal);

            _toString = string.Format(CultureInfo.InvariantCulture, "PathExpression: {0}, AllowAnonymous: {1}, And rules: [{2}], Or rules: [{3}]", pathExpression, allowAnonymous, string.Join("|", andSet), string.Join("|", orSet));
        }

        /// <summary>
        /// Gets the path expression.
        /// </summary>
        /// <value>
        /// The path expression.
        /// </value>
        public Regex PathExpression { get; }

        /// <summary>
        /// Gets a value indicating whether [allow anonymous].
        /// </summary>
        /// <value>
        ///   <c>true</c> if [allow anonymous]; otherwise, <c>false</c>.
        /// </value>
        public bool AllowAnonymous { get; }

        /// <summary>
        /// Gets the and set.
        /// </summary>
        /// <value>
        /// The and set.
        /// </value>
        public ISet<string> AndSet { get; }

        /// <summary>
        /// Gets the or set.
        /// </summary>
        /// <value>
        /// The or set.
        /// </value>
        public ISet<string> OrSet { get; }

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
