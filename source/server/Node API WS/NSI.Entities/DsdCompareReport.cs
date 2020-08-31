using System;
using System.Collections.Generic;
using System.Text;

namespace NSI.Entities
{
    public class DsdReport
    {
        public string SourceDsd { get; set; }
        public string TargetDsd { get; set; }
        /// <summary>
        /// All Dimensions that are present in the source
        /// </summary>
        public List<IdentityKey> SourceAllDimensions { get; set; }
        /// <summary>
        /// All Attributes that are present in the source
        /// </summary>
        public List<IdentityKey> SourceAllAttributes { get; set; }
        /// <summary>
        /// All Measures that are present in the source
        /// </summary>
        public List<IdentityKey> SourceAllMeasures { get; set; }
        /// <summary>
        /// All Groups that are present in the source
        /// </summary>
        public List<IdentityKey> SourceAllGroups { get; set; }
        /// <summary>
        /// Dimensions that are present in the source but not in the target
        /// </summary>
        public List<IdentityKey> SourceDimensions { get; set; }
        /// <summary>
        /// Dimensions that are present in the target but not in the source
        /// </summary>
        public List<IdentityKey> TargetDimensions { get; set; }
        /// <summary>
        /// Dimensions that are present in target and source, but with some difference
        /// </summary>
        public List<Difference> DifferenceDimensions { get; set; }
        /// <summary>
        /// Dimensions that are present in target and source, but with some difference ConceptScheme
        /// </summary>
        public List<Difference> DifferenceConceptSchemeDimensions { get; set; }
        /// <summary>
        /// Attributes that are present in the source but not in the target
        /// </summary>
        public List<IdentityKey> SourceAttributes { get; set; }
        /// <summary>
        /// Attributes that are present in the target but not in the source
        /// </summary>
        public List<IdentityKey> TargetAttributes { get; set; }
        /// <summary>
        /// Attributes that are present in target and source, but with some difference
        /// </summary>
        public List<Difference> DifferenceAttributes { get; set; }
        /// <summary>
        /// Attributes that are present in target and source, but with some difference ConceptScheme
        /// </summary>
        public List<Difference> DifferenceConceptSchemeAttributes { get; set; }
        /// <summary>
        /// Groups that are present in the target but not in the source
        /// </summary>
        public List<IdentityKey> SourceGroups { get; set; }
        /// <summary>
        /// Groups that are present in the target but not in the source
        /// </summary>
        public List<IdentityKey> TargetGroups { get; set; }
        /// <summary>
        /// Groups that are present in target and source, but with some difference
        /// </summary>
        public List<Difference> DifferenceGroups { get; set; }
        /// <summary>
        /// Measures that are present in the target but not in the source
        /// </summary>
        public List<IdentityKey> SourceMeasures { get; set; }
        /// <summary>
        /// Measures that are present in the target but not in the source
        /// </summary>
        public List<IdentityKey> TargetMeasures { get; set; }
        /// <summary>
        /// Measures that are present in target and source, but with some difference
        /// </summary>
        public List<Difference> DifferenceMeasures { get; set; }
        /// <summary>
        /// Measures that are present in target and source, but with some difference ConceptScheme
        /// </summary>
        public List<Difference> DifferenceConceptSchemeMeasures { get; set; }
        /// <summary>
        /// True if the DSD source can be update to DSD target
        /// </summary>
        public bool Compare { get; set; }
        /// <summary>
        /// Hash Report
        /// </summary>
        public string HashReport { get; set; }
        /// <summary>
        /// Crypt sorce filename
        /// </summary>
        public string SourceFile { get; set; }
        /// <summary>
        /// Crypt target filename
        /// </summary>
        public string TargetFile { get; set; }

        public DsdReport()
        {
            SourceAllAttributes = new List<IdentityKey>();
            SourceAllDimensions = new List<IdentityKey>();
            SourceAllMeasures = new List<IdentityKey>();
            SourceAllGroups = new List<IdentityKey>();
            SourceDimensions = new List<IdentityKey>();
            TargetDimensions = new List<IdentityKey>();
            DifferenceDimensions = new List<Difference>();
            DifferenceConceptSchemeDimensions = new List<Difference>();
            SourceAttributes = new List<IdentityKey>();
            TargetAttributes = new List<IdentityKey>();
            DifferenceAttributes = new List<Difference>();
            DifferenceConceptSchemeAttributes = new List<Difference>();
            SourceMeasures = new List<IdentityKey>();
            TargetMeasures = new List<IdentityKey>();
            DifferenceMeasures = new List<Difference>();
            DifferenceConceptSchemeMeasures = new List<Difference>();
            SourceGroups = new List<IdentityKey>();
            TargetGroups = new List<IdentityKey>();
            DifferenceGroups = new List<Difference>();
        }

        public class Difference
        {
            public string Key { get; set; }
            public bool Mandatory { get; set; }
            public ReferenceIdentity Source { get; set; }
            public ReferenceIdentity Target { get; set; }
            /// <summary>
            /// Used in upgrade DSD for sync codelist items
            /// </summary>
            public List<string> Code { get; set; }

            public ItemCompare CodelistCompare { get; set; }

            public List<string> ItemsSourceGroup { get; set; }
            public List<string> ItemsTargetGroup { get; set; }

            public string AttachmentLevelSourceGroup { get; set; }
            public string AttachmentLevelTargetGroup { get; set; }

            public Difference()
            {
                Mandatory = true;
                Code = new List<string>();
                ItemsSourceGroup = new List<string>();
                ItemsTargetGroup = new List<string>();
            }
        }
        
        public class IdentityKey
        {
            public string Key { get; set; }
            public bool Mandatory { get; set; }
            public ReferenceIdentity ReferenceIdentity { get; set; }
            public List<string> ItemsGroup { get; set; }
            public string AttachmentLevel { get; set; }

            public IdentityKey()
            {
                Mandatory = false;
            }
        }

        public class ReferenceIdentity
        {
            public string ID { get; set; }
            public string AgencyId { get; set; }
            public string Version { get; set; }
            public string ConceptId { get; set; }
            public Dictionary<string, string> Names { get; set; }

            public ReferenceIdentity()
            {
                Names = new Dictionary<string, string>();
            }
        }

        public class ItemCompare
        {
            /// <summary>
            /// Number of all difference (used in case of >1000 difference beewteen Target and Source)
            /// </summary>
            public int TotalDifference { get; set; }
            public ReferenceIdentity SourceArtefact { get; set; }
            public ReferenceIdentity TargetArtefact { get; set; }
            /// <summary>
            /// Items that are present in the source but not in the target (report max 1000 beewteen Target and Soruce)
            /// </summary>
            public List<Item> SourceItem { get; set; }
            /// <summary>
            /// Items that are present in the target but not in the source (report max 1000 beewteen Target and Soruce)
            /// </summary>
            public List<Item> TargetItem { get; set; }

            public ItemCompare()
            {
                SourceArtefact = new ReferenceIdentity();
                TargetArtefact = new ReferenceIdentity();
                SourceItem = new List<Item>();
                TargetItem = new List<Item>();
            }

            public class Item
            {
                public string Id { get; set; }
                public Dictionary<string, string> Names { get; set; }

                public Item()
                {
                    Names = new Dictionary<string, string>();
                }
            }
        }

    }

    public class DsdWithDataflow : ArtefactIdentity
    {
        public List<DataflowReport> Dataflows { get; set; }
        public Dictionary<string, string> Names { get; set; }

        public DsdWithDataflow()
        {
            Dataflows = new List<DataflowReport>();
            Names = new Dictionary<string, string>();
        }
    }

    public class DataflowReport : ArtefactIdentity
    {
        public Dictionary<string, string> Names { get; set; }

        public DataflowReport()
        {
            Names = new Dictionary<string, string>();
        }
    }

    
}
