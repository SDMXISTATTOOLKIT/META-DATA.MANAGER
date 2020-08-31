using System;
using System.Collections.Generic;
using System.Text;
using static NSI.Entities.MSDRegistry;

namespace NSI.Entities
{
    public class HierarchicalCodelistRegistry : ArtefactRegistry
    {
        public List<Annotation> Annotations { get; set; }
        public string Uri { get; set; }
        public string ValidFrom { get; set; }
        public string ValidTo { get; set; }
    }
}
