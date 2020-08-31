using System;
using System.Collections.Generic;
using System.Globalization;
using System.Text;
using System.Text.RegularExpressions;

namespace AuthCore.PolicyModuleCore.Model
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
        protected BaseEndpointType(string pathExpression, bool allowAnonymous, int priority, Dictionary<string, List<string>> andSet, Dictionary<string, List<string>> orSet, Dictionary<string, List<string>> andGroupSet, Dictionary<string, List<string>> orGroupSet)
        {
            if (pathExpression == null)
            {
                throw new ArgumentNullException(nameof(pathExpression));
            }
            this.PathExpression = new Regex(pathExpression, RegexOptions.Compiled | RegexOptions.CultureInvariant | RegexOptions.Singleline | RegexOptions.IgnoreCase);
            this.AllowAnonymous = allowAnonymous;

            Priority = priority;

            AndSet = new Dictionary<string, HashSet<string>>();
            if (andSet != null)
            {
                foreach (var item in andSet)
                {
                    if (AndSet.ContainsKey(item.Key))
                    {
                        continue;
                    }
                    AndSet.Add(item.Key, new HashSet<string>(item.Value, StringComparer.Ordinal));
                }
            }

            if (orSet != null)
            {
                OrSet = new Dictionary<string, HashSet<string>>();
                foreach (var item in orSet)
                {
                    if (OrSet.ContainsKey(item.Key))
                    {
                        continue;
                    }
                    OrSet.Add(item.Key, new HashSet<string>(item.Value, StringComparer.Ordinal));
                }
            }

            if (andGroupSet != null)
            {
                AndGroupSet = new Dictionary<string, HashSet<string>>();
                foreach (var item in andGroupSet)
                {
                    if (AndGroupSet.ContainsKey(item.Key))
                    {
                        continue;
                    }
                    AndGroupSet.Add(item.Key, new HashSet<string>(item.Value, StringComparer.Ordinal));
                }
            }

            if (orGroupSet != null)
            {
                OrGroupSet = new Dictionary<string, HashSet<string>>();
                foreach (var item in orGroupSet)
                {
                    if (OrGroupSet.ContainsKey(item.Key))
                    {
                        continue;
                    }
                    OrGroupSet.Add(item.Key, new HashSet<string>(item.Value, StringComparer.Ordinal));
                }
            }


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
        public Dictionary<string, HashSet<string>> AndSet { get; }

        /// <summary>
        /// Gets the or set.
        /// </summary>
        /// <value>
        /// The or set.
        /// </value>
        public Dictionary<string, HashSet<string>> OrSet { get; }

        /// <summary>
        /// Gets the and set.
        /// </summary>
        /// <value>
        /// The and set.
        /// </value>
        public Dictionary<string, HashSet<string>> AndGroupSet { get; }

        /// <summary>
        /// Gets the or set.
        /// </summary>
        /// <value>
        /// The or set.
        /// </value>
        public Dictionary<string, HashSet<string>> OrGroupSet { get; }

        /// <summary>
        /// Gets a value indicating [Priority].
        /// </summary>
        public int Priority { get; }

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
