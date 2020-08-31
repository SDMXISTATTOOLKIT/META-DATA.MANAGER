using System;
using System.Collections.Generic;
using System.Text;

namespace NSI.Entities
{
    public class MSDRegistry : ArtefactRegistry
    {
        public List<Annotation> Annotations { get; set; }
        public string Uri { get; set; }
        public string ValidFrom { get; set; }
        public string ValidTo { get; set; }

        public class Annotation
        {
            public string Id { get; set; }
            public string Title { get; set; }
            public string Type { get; set; }
            public string Text { get; set; }
            public Dictionary<string, string> Texts { get; set; }
        }
    }
}
