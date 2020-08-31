using System;
using System.Collections.Generic;
using System.Text;

namespace ArtefactDataModel.Property
{
    public class MetadataTarget
    {
        public string Id { get; set; }
        public string Type { get; set; }
        public List<Annotation> Annotations { get; set; }
        public List<Link> Links { get; set; }
        public List<ConstraintContentTarget> ConstraintContentTargets { get; set; }
        public List<DataSetTarget> DataSetTargets { get; set; }
        public List<IdentifiableObjectTarget> IdentifiableObjectTargets { get; set; }
        public List<KeyDescriptorValuesTarget> KeyDescriptorValuesTargets { get; set; }
        public List<ReportPeriodTarget> ReportPeriodTargets { get; set; }
    }
}
