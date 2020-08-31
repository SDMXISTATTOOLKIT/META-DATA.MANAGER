using ArtefactDataModel.Interface;
using ArtefactDataModel.Property;
using System;
using System.Collections.Generic;

namespace ArtefactDataModel
{
    public class MetadataStructure : IBase, IName, IAnnotation
    {
        public string Id { get; set; }
        public string Version { get; set; }
        public string AgencyID { get; set; }
        public List<Link> Links { get; set; }
        public string Name { get; set; }
        public Dictionary<string, string> Names { get; set; }
        public string Description { get; set; }
        public Dictionary<string, string> Descriptions { get; set; }
        public List<Annotation> Annotations { get; set; }
        public bool IsExternalReference { get; set; }
        public bool IsFinal { get; set; }
        public DateTime? ValidFrom { get; set; }
        public DateTime? ValidTo { get; set; }
        public MetadataStructureComponents MetadataStructureComponents { get; set; }
    }
}
