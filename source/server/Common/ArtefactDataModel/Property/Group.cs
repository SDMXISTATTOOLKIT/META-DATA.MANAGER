using System;
using System.Collections.Generic;
using System.Text;

namespace ArtefactDataModel.Property
{
    public class Group
    {
        public string Id { get; set; }
        public List<Annotation> annotations { get; set; }
        public List<Link> Links { get; set; }
        public string AttachmentConstraint { get; set; }
        public List<string> GroupDimensions { get; set; }
    }
}
