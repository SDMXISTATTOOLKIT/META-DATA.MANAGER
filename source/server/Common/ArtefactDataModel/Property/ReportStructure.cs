using System;
using System.Collections.Generic;
using System.Text;

namespace ArtefactDataModel.Property
{
    public class ReportStructure
    {
        public string MetadataAttribute { get; set; }
        public string MetadataTarget { get; set; }
        public string Id { get; set; }
        public List<Annotation> Annotations { get; set; }
        public List<Link> Links { get; set; }
        public List<MetadataAttribute> MetadataAttributes { get; set; }
        public List<string> MetadataTargets { get; set; }
    }
}
