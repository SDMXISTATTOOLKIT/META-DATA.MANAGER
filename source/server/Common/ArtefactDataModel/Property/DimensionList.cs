using System;
using System.Collections.Generic;
using System.Text;

namespace ArtefactDataModel.Property
{
    public class DimensionList
    {
        public string Id { get; set; }
        public List<Annotation> Annotations { get; set; }
        public List<Link> Links { get; set; }
        public List<Dimension> Dimensions { get; set; }
        public List<MeasureDimensions> MeasureDimensions { get; set; }
        public List<TimeDimensions> TimeDimensions { get; set; }
    }
}
