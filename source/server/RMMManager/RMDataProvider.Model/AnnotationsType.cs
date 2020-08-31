using System;
using System.Collections.Generic;
using System.Text;

namespace RMDataProvider.Model
{
    [Serializable]
    public class AnnotationsType
    {
        private List<AnnotationType> AnnotationList;

        public AnnotationsType() {
            this.AnnotationList = new List<AnnotationType>();
        }

        public List<AnnotationType> Annotation {
            get { return AnnotationList; }
            set { AnnotationList = value; }
        }
    }
}
