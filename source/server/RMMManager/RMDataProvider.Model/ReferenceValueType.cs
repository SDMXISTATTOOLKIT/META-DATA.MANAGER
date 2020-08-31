using System;
using System.Collections.Generic;
using System.Text;
using System.Xml.Serialization;

namespace RMDataProvider.Model
{
    [Serializable]
    public class ReferenceValueType 
    {
        public ReferenceValueType() { }

        public ObjectReferenceType ObjectReference { get; set; }
       // public DataKeyType DataKey { get; set; }
        //public SetReferenceType DataSetReference { get; set; }
        //public AttachmentConstraintReferenceType ConstraintContentReference { get; set; }
        public object ReportPeriod { get; set; }

        [XmlAttribute]
        public string id { get; set; }
    }
}
