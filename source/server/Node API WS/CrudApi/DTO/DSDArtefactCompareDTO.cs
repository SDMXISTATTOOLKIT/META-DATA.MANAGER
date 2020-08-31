using NSI.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace API.DTO
{
    /// <summary>
    /// DTO for comapring DSDs
    /// </summary>
    public class DSDArtefactCompareDTO
    {
        /// <summary>
        /// Source DSD
        /// </summary>
        public ArtefactCompare SourceArtefact { get; set; }

        /// <summary>
        /// Target DSD
        /// </summary>
        public ArtefactCompare TargetArtefact { get; set; }
    }
}
