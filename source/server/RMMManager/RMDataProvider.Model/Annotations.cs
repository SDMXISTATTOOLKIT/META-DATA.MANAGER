using System;
using System.Collections.Generic;
using System.Text;
using System.Xml.Serialization;

namespace RMDataProvider.Model
{
    [Serializable]
    public class Annotations
    {

        private AnnotationsType ContentField;

        public Annotations()
        {
            this.ContentField = new AnnotationsType();
        }

        
        public Annotations(AnnotationsType t) {
            this.ContentField = t;
        }

        [XmlElement("")]
        public List<AnnotationType> Annotation {
            get
            {
                return this.ContentField.Annotation;
            }
            set
            {
                this.ContentField.Annotation = value;
            }
        }

    }
}
