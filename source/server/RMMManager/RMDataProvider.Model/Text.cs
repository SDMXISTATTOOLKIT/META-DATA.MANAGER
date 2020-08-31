using System;
using System.Collections.Generic;
using System.Text;
using System.Xml.Serialization;

namespace RMDataProvider.Model
{
    [Serializable]
    public class Text 
    {
        private TextType ContentValue;

        public Text() {
            this.Content = new TextType();
        }

        public Text(string val, string language)
        {
            this.Content = new TextType(val, language);
        }


        [XmlIgnore]
        public TextType Content
        {
            get
            {
                return this.ContentValue;
            }
            set
            {
                this.ContentValue = value;
            }
        }

        [XmlText(typeof(string))]
        public string TypedValue
        {
            get
            {
                return this.ContentValue.TypedValue;
            }
            set
            {
                this.ContentValue.TypedValue = value;
            }
        }

        [XmlAttributeAttribute(Namespace = "http://www.w3.org/XML/1998/namespace")]
        public string lang {
            get
            {
                return this.ContentValue.lang;
            }
            set
            {
                this.ContentValue.lang = value;
            }
        }

    }
}
