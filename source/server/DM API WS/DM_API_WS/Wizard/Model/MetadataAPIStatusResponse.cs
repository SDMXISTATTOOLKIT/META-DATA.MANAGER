using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DM_API_WS.Wizard.Model
{
    /// <summary>
    /// Response of the EndPoint API
    /// </summary>
    public class EndPointAPIStatusResponse
    {
        /// <summary>
        /// Status Code
        /// </summary>
        public string StatusCode { get; set; }
        /// <summary>
        /// Status Message
        /// </summary>
        public string StatusMessage { get; set; }
    }
}
