using System;
using System.Collections.Generic;
using System.Text;

namespace ArtefactDataModel.Property
{
    public class ReportingYearStartDays
    {
        public string Id { get; set; }
        public List<Annotation> Annotations { get; set; }
        public List<Link> Links { get; set; }
        public string AssignmentStatus { get; set; }
        public AttributeRelationship AttributeRelationship { get; set; }
        public string ConceptIdentity { get; set; }
        public LocalRepresentation LocalRepresentation { get; set; }
    }
}
