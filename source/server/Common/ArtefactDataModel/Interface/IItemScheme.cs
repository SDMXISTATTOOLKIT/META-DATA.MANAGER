using ArtefactDataModel.Property;
using System;
using System.Collections.Generic;
using System.Text;

namespace ArtefactDataModel.Interface
{
    public interface IItemScheme
    {
        string Id { get; set; }
        string Name { get; set; }
        Dictionary<string, string> Names { get; set; }
        string Description { get; set; }
        Dictionary<string, string> Descriptions { get; set; }
        List<Annotation> Annotations { get; set; }
        List<Link> Links { get; set; }
        List<Contact> Contacts { get; set; }
    }
}
