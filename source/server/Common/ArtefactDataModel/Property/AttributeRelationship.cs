using System;
using System.Collections.Generic;
using System.Text;

namespace ArtefactDataModel.Property
{
    public class AttributeRelationship
    {
        public List<string> AttachmentGroups { get; set; }
        public List<string> Dimensions { get; set; }
        public string Group { get; set; }
        public None None { get; set; }
        public string PrimaryMeasure { get; set; }
    }
}
