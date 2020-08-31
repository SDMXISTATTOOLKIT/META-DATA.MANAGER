using System;
using System.Collections.Generic;
using System.Text;

namespace DataModel
{
    public class ContentConstraintsDTO
    {
        public string Id { get; set; }
        public string Version { get; set; }
        public string AgencyID { get; set; }
        public DateTime ValidFrom { get; set; }
        public DateTime ValidTo { get; set; }
        public string Name { get; set; }
        public Dictionary<string, string> Names { get; set; }
        public string Description { get; set; }
        public Dictionary<string, string> Descriptions { get; set; }
        public List<Annotation> Annotations { get; set; }
        public bool IsFinal { get; set; }
        public bool ExternalReference { get; set; }
        public string Type { get; set; }
        public List<CubeRegion> CubeRegions { get; set; }
        public ConstAttachment ConstraintAttachment { get; set; }


        public ContentConstraintsDTO()
        {
            CubeRegions = new List<CubeRegion>();
            Names = new Dictionary<string, string>();
            Descriptions = new Dictionary<string, string>();
            Annotations = new List<Annotation>();
            CubeRegions = new List<CubeRegion>();
        }

        public class Annotation
        {
            public string Id { get; set; }
            public string Title { get; set; }
            public string Type { get; set; }
            public string Text { get; set; }
            public Dictionary<string, string> Texts { get; set; }

            public Annotation()
            {
                Texts = new Dictionary<string, string>();
            }
        }

        public class CubeRegion
        {
            public bool IsIncluded { get; set; }
            public List<CubeRegionValues> KeyValues { get; set; }

            public CubeRegion()
            {
                KeyValues = new List<CubeRegionValues>();
            }
        }

        public class CubeRegionValues
        {
            public string Id { get; set; }
            public List<string> Values { get; set; }

            public CubeRegionValues()
            {
                Values = new List<string>();
            }
        }

        public class ConstAttachment
        {
            public List<string> DataStructures { get; set; }
            public List<string> Dataflows { get; set; }
            public List<string> MetadataStructures { get; set; }
            public List<string> Metadataflows { get; set; }
            public List<string> ProvisionAgreements { get; set; }
        }
        
    }
}
