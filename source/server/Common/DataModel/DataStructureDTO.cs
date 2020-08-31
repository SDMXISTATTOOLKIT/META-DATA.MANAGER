using ArtefactDataModel.Property;
using System;
using System.Collections.Generic;
using System.Text;

namespace DataModel
{

    public class DataStructureDTO
    {
        public string id { get; set; }
        public string urn { get; set; }
        public Link[] links { get; set; }
        public string version { get; set; }
        public string agencyID { get; set; }
        public DateTime validFrom { get; set; }
        public DateTime validTo { get; set; }
        public string name { get; set; }
        public Dictionary<string, string> names { get; set; }
        public string description { get; set; }
        public Dictionary<string, string> descriptions { get; set; }
        public Datastructurecomponents dataStructureComponents { get; set; }
        public Annotation[] annotations { get; set; }
        public bool isFinal { get; set; }


        public class Datastructurecomponents
        {
            public Attributelist attributeList { get; set; }
            public Dimensionlist dimensionList { get; set; }
            public Measurelist measureList { get; set; }
            public Group[] groups { get; set; }
        }

        public class Attributelist
        {
            public string id { get; set; }
            public string urn { get; set; }
            public Link[] links { get; set; }
            public Attribute[] attributes { get; set; }
        }

        public class Link
        {
            public string rel { get; set; }
            public string urn { get; set; }
            public string type { get; set; }
        }

        public class Attribute
        {
            public string id { get; set; }
            public string urn { get; set; }
            public Link[] links { get; set; }
            public string conceptIdentity { get; set; }
            public List<string> conceptRoles { get; set; }
            public Localrepresentation localRepresentation { get; set; }
            public string assignmentStatus { get; set; }
            public Attributerelationship attributeRelationship { get; set; }
            public Annotation[] annotations { get; set; }
        }

        public class Localrepresentation
        {
            public string enumeration { get; set; }
            public Textformat textFormat { get; set; }
        }

        public class Attributerelationship
        {
            public string[] attachmentGroups { get; set; }
            public string[] dimensions { get; set; }
            public string primaryMeasure { get; set; }
        }

        public class Dimensionlist
        {
            public string id { get; set; }
            public string urn { get; set; }
            public Link[] links { get; set; }
            public Dimension[] dimensions { get; set; }
            public Measuredimension[] measureDimensions { get; set; }
            public Timedimension[] timeDimensions { get; set; }
        }

        public class Dimension
        {
            public string id { get; set; }
            public string urn { get; set; }
            public Link[] links { get; set; }
            public int position { get; set; }
            public string type { get; set; }
            public string conceptIdentity { get; set; }
            public List<string> conceptRoles { get; set; }
            public Localrepresentation localRepresentation { get; set; }
            public Annotation[] annotations { get; set; }
        }

        

        public class Measuredimension
        {
            public string id { get; set; }
            public string urn { get; set; }
            public Link[] links { get; set; }
            public int position { get; set; }
            public string type { get; set; }
            public string conceptIdentity { get; set; }
            public List<string> conceptRoles { get; set; }
            public Localrepresentation localRepresentation { get; set; }
            public Annotation[] annotations { get; set; }
        }

        public class Timedimension
        {
            public string id { get; set; }
            public string urn { get; set; }
            public Link[] links { get; set; }
            public int position { get; set; }
            public string type { get; set; }
            public string conceptIdentity { get; set; }
            public List<string> conceptRoles { get; set; }
            public Localrepresentation localRepresentation { get; set; }
            public Annotation[] annotations { get; set; }
        }

        public class Textformat
        {
            public string textType { get; set; }
            public bool isSequence { get; set; }
            public bool isMultiLingual { get; set; }
        }


        public class Measurelist
        {
            public string id { get; set; }
            public string urn { get; set; }
            public Link[] links { get; set; }
            public Primarymeasure primaryMeasure { get; set; }
        }

        public class Primarymeasure
        {
            public string id { get; set; }
            public string urn { get; set; }
            public Link[] links { get; set; }
            public string conceptIdentity { get; set; }
            public List<string> conceptRoles { get; set; }
            public Localrepresentation localRepresentation { get; set; }
            public Annotation[] annotations { get; set; }
        }

        public class Group
        {
            public string id { get; set; }
            public string urn { get; set; }
            public Link[] links { get; set; }
            public string[] groupDimensions { get; set; }
        }

    }
}
