using DDB.Entities;
using MA.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace API.DTO
{
    /// <summary>
    /// Dataflow parameter input
    /// </summary>
    public class DFParam
    {
        /// <summary>
        /// DDB dataflow
        /// </summary>
        public DDBDataflowWithCols ddbDF { get; set; }
        
        /// <summary>
        /// MSDB Dataflow
        /// </summary>
        public object msdbDF { get; set; }
        
        /// <summary>
        /// Categorisations (optional)
        /// </summary>
        public object msdbCat { get; set; }
        
        /// <summary>
        /// Header (optional)
        /// </summary>
        public HeaderTemplate header { get; set; }
    }
}
