using System;
using System.Collections.Generic;
using System.Text;

namespace ArtefactDataModel.Property
{
    public class IdentifiableObjectTarget
    {
        public string Id { get; set; }
        public List<Annotation> Annotations { get; set; }
        public List<Link> Links { get; set; }
        public string ObjectType { get; set; }
        public LocalRepresentation LocalRepresentation { get; set; }
    }
}
