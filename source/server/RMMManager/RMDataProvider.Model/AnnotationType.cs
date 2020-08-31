using System;
using System.Collections.Generic;
using System.Text;
using System.Xml.Serialization;

namespace RMDataProvider.Model
{
    [Serializable]
    public class AnnotationType
    {

        public AnnotationType() { AnnotationText = new List<TextType>(); }

        public AnnotationType(string id,string val, string language) {
            this.id = id;
            AnnotationText = new List<TextType>();
            this.AnnotationText.Add(new TextType(val, language));
        }

        public string AnnotationTitle { get; set; }
        public string AnnotationType1 { get; set; }
        public XmlUri AnnotationURL { get; set; }

        [XmlElement("")]
        public List<TextType> AnnotationText { get; set; }



        [XmlAttribute("id")]
        public string id { get; set; }
    }
}
