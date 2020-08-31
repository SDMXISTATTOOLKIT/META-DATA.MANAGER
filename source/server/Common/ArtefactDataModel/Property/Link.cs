using System;
using System.Collections.Generic;
using System.Text;

namespace ArtefactDataModel.Property
{
    public class Link
    {
        public string href { get; set; }
        public string rel { get; set; }
        public string urn { get; set; }
        public string uri { get; set; }
        public string title { get; set; }
        public Dictionary<string, string> titles { get; set; }
        public string type { get; set; }
        public string hreflang { get; set; }
    }
}
