using System;
using System.Collections.Generic;
using System.Text;

namespace ArtefactDataModel.Property
{
    public class ConstraintAttachment
    {
        public List<string> DataStructures { get; set; }
        public List<string> Dataflows { get; set; }
        public List<string> MetadataStructures { get; set; }
        public List<string> Metadataflows { get; set; }
        public List<string> ProvisionAgreements { get; set; }
        public List<SetReferenceType> DataSets { get; set; }
        public List<SetReferenceType> MetadataSets { get; set; }
    }
}
