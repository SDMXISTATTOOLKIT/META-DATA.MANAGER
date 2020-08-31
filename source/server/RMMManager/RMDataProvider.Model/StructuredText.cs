using System;
using System.Collections.Generic;
using System.Text;

namespace RMDataProvider.Model
{
    [Serializable]
    public class StructuredText
    {
        public StructuredText() { }

        public XHTMLType Content { get; set; }
        public string lang { get; set; }
    }
}
