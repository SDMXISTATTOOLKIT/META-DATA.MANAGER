using System;
using System.Collections.Generic;
using System.Text;
using System.Xml.Serialization;

namespace RMDataProvider.Model
{
    [Serializable]
    public class Name 
    {
        private TextType ContentValue;
        public Name() {
            this.Content = new TextType();
        }

        public Name(TextType t) {
            this.ContentValue = t;
        }

        [XmlIgnore]
        public TextType Content {
            get {
                return this.ContentValue;
            }
            set {
                this.ContentValue = value;
            }
        }

        [XmlText(typeof(string))]
        public string TypedValue {
            get {
                return this.ContentValue.TypedValue;
            }
            set
            {
                this.ContentValue.TypedValue = value;
            }
        }

        [XmlAttributeAttribute(Namespace = "http://www.w3.org/XML/1998/namespace")]
        public string lang { get; set; }
 
    }
}
