using System;
using System.Collections.Generic;
using System.Text;

namespace AuthCore.PolicyModuleCore.Constant
{
    /// <summary>
    /// Enum AccessResponseType
    /// </summary>
    public enum AccessResponseType
    {
        /// <summary>
        /// The rule not found in the xml
        /// </summary>
        RuleNotFound,

        /// <summary>
        /// Access granted
        /// </summary>
        Success,

        /// <summary>
        /// The anonymous user denied
        /// </summary>
        AnonymousUserDenied,

        /// <summary>
        /// User has insufficient permissions
        /// </summary>
        InsufficientPermissions
    }
}
