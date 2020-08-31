using System;
using System.Collections.Generic;
using System.Text;

namespace ArtefactDataModel.Property
{
    public class AttributeList
    {
        public string Id { get; set; }
        public List<Annotation> Annotations { get; set; }
        public List<Link> Links { get; set; }
        public List<Attribute> Attributes { get; set; }
        public List<ReportingYearStartDays> ReportingYearStartDays { get; set; }
    }
}
