using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Text;

namespace NSI.Entities
{
    public class MetadataFlowDTO
    {
        public string Id { get; set; }
        public string Version { get; set; }
        public string AgencyID { get; set; }
        public bool IsFinal { get; set; }
        public bool IsExternalReference { get; set; }
        [JsonProperty(NullValueHandling = NullValueHandling.Ignore)]
        public DateTime? ValidFrom { get; set; }
        [JsonProperty(NullValueHandling = NullValueHandling.Ignore)]
        public DateTime? ValidTo { get; set; }
        public string Name { get; set; }
        public Dictionary<string, string> Names { get; set; }
        public string Description { get; set; }
        public Dictionary<string, string> Descriptions { get; set; }
        public List<MetadataStructureDTO.Annotation> Annotations { get; set; }
        public string Urn { get; set; }
        public string Structure { get; set; }
        public List<Link> Links { get; set; }

        public MetadataFlowDTO()
        {
            Names = new Dictionary<string, string>();
            Descriptions = new Dictionary<string, string>();
            Annotations = new List<MetadataStructureDTO.Annotation>();
            Links = new List<Link>();
        }

        public class Link
        {
            public string rel { get; set; }
            public string urn { get; set; }
            public string type { get; set; }
        }
    }
}
