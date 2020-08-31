using System;
using System.Collections.Generic;
using System.Text;

namespace ArtefactDataModel.Property
{
    public class Annotation
    {
        public string Id { get; set; }
        public string Title { get; set; }
        public string Type { get; set; }
        public string Text { get; set; }
        public Dictionary<string, string> Texts { get; set; }
    }
}
