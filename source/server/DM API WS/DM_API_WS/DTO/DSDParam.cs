using DataModel;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DM_API_WS.DTO
{
    /// <summary>
    /// Dataflow parameter input
    /// </summary>
    public class DSDParam
    {
        /// <summary>
        /// Dataflow 
        /// </summary>
        public string dsd { get; set; }

        /// <summary>
        /// CSV separator 
        /// </summary>
        public string separator { get; set; }

        /// <summary>
        /// OptionsTable for filter, select, sort, order data
        /// </summary>
        public OptionsTable optionsTable { get; set; }
    }
}
