using System;
using System.Collections.Generic;
using System.Text;

namespace ArtefactDataModel.Property
{
    public class MetadataAttribute
    {
        public string Id { get; set; }
        public List<Annotation> Annotations { get; set; }
        public List<Link> Links { get; set; }
        public bool IsPresentational { get; set; }
        public string MaxOccurs { get; set; }
        public int? MinOccurs { get; set; }
        public string ConceptIdentity { get; set; }
        public LocalRepresentation LocalRepresentation { get; set; }
        public List<MetadataAttribute> MetadataAttributes { get; set; }
    }
}
