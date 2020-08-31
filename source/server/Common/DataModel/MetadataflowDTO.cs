using System;
using System.Collections.Generic;
using System.Text;

namespace DataModel
{
    public class MetadataflowDTO
    {
        public string id { get; set; }
        public string urn { get; set; }
        public Link[] links { get; set; }
        public string version { get; set; }
        public string agencyID { get; set; }
        public DateTime validFrom { get; set; }
        public DateTime validTo { get; set; }
        public string name { get; set; }
        public Dictionary<string, string> names { get; set; }
        public string description { get; set; }
        public Dictionary<string, string> descriptions { get; set; }
        public Annotation[] annotations { get; set; }
        public bool isFinal { get; set; }
        public string structure { get; set; }

        public class Link
        {
            public string rel { get; set; }
            public string urn { get; set; }
            public string type { get; set; }
        }

        public class Annotation
        {
            public string id { get; set; }
            public string title { get; set; }
            public string type { get; set; }
            public string text { get; set; }
            public Dictionary<string, string> texts { get; set; }
        }
    }
}
