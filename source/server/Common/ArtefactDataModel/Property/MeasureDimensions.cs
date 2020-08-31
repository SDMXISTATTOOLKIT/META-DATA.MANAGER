using System;
using System.Collections.Generic;
using System.Text;

namespace ArtefactDataModel.Property
{
    public class MeasureDimensions
    {
        public string Id { get; set; }
        public List<Annotation> Annotations { get; set; }
        public List<Link> Links { get; set; }
        public int Position { get; set; }
        public string Type { get; set; }
        public string ConceptIdentity { get; set; }
        public List<string> ConceptRoles { get; set; }
        public LocalRepresentation LocalRepresentation { get; set; }
    }
}
