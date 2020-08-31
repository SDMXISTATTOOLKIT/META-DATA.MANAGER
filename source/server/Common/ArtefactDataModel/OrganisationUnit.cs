using ArtefactDataModel.Interface;
using ArtefactDataModel.Property;
using System.Collections.Generic;

namespace ArtefactDataModel
{
    public class OrganisationUnit : IName, IAnnotation, IItemScheme
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public Dictionary<string, string> Names { get; set; }
        public string Description { get; set; }
        public Dictionary<string, string> Descriptions { get; set; }
        public List<Annotation> Annotations { get; set; }
        public List<Link> Links { get; set; }
        public List<Contact> Contacts { get; set; }
        public string Parent { get; set; }
    }
}
