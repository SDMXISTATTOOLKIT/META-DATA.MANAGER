using System;
using System.Collections.Generic;
using System.Text;
using System.Xml.Serialization;

namespace RMDataProvider.Model
{
    [Serializable]
    public class TextType
    {
        public TextType() { }

        public TextType(string val, string language) {
            this.TypedValue = val;
            this.lang = language;
        }

        [XmlText(typeof(string))]
        public string TypedValue { get; set; }

        [XmlAttributeAttribute(Namespace = "http://www.w3.org/XML/1998/namespace")]
        public string lang { get; set; }
    }
}
