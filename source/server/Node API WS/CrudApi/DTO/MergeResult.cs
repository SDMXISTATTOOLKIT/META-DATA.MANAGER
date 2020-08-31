using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace API.DTO
{   
    /// <summary>
    /// DTO for managing the result of a merge operation
    /// </summary>
    public class MergeResult
    {
        /// <summary>
        /// Sdmx Json
        /// </summary>
        public string JsonSdmx { get; set; }

        /// <summary>
        /// Items with conflicts
        /// </summary>
        public List<string> ItemConflicts { get; set; }

        /// <summary>
        /// Whether there is at least one conflict
        /// </summary>
        public bool HaveConflicts { get; set; }
    }
}
