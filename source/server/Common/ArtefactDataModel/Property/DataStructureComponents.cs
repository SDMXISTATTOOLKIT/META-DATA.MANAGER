using System;
using System.Collections.Generic;
using System.Text;

namespace ArtefactDataModel.Property
{
    public class DataStructureComponents
    {
        public AttributeList AttributeList { get; set; }
        public DimensionList DimensionList { get; set; }
        public List<Group> Groups { get; set; }
        public MeasureList MeasureList { get; set; }
    }
}
