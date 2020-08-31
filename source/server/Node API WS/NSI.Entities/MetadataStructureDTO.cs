using System;
using System.Collections.Generic;
using System.Text;

namespace NSI.Entities
{
    public class MetadataStructureDTO
    {
        public string Id { get; set; }
        public string Version { get; set; }
        public string AgencyID { get; set; }
        public bool IsFinal { get; set; }
        public bool IsExternalReference { get; set; }
        public DateTime ValidFrom { get; set; }
        public DateTime ValidTo { get; set; }
        public string Name { get; set; }
        public Dictionary<string, string> Names { get; set; }
        public string Description { get; set; }
        public Dictionary<string, string> Descriptions { get; set; }
        public List<Annotation> Annotations { get; set; }
        public List<Link> Links { get; set; }

        public ClassMetadataStructureComponents MetadataStructureComponents { get; set; }
        public string Urn { get; set; }

        public MetadataStructureDTO()
        {
            Names = new Dictionary<string, string>();
            Descriptions = new Dictionary<string, string>();
            MetadataStructureComponents = new ClassMetadataStructureComponents();
            Annotations = new List<Annotation>();
            Links = new List<Link>();
        }
        
        public class Link
        {
            public string rel { get; set; }
            public string urn { get; set; }
            public string type { get; set; }
        }

        public class ClassMetadataStructureComponents
        {
            public MetadataTargetList MetadataTargetList { get; set; }
            public ReportStructureList ReportStructureList { get; set; }

            public ClassMetadataStructureComponents()
            {
                MetadataTargetList = new MetadataTargetList();
                ReportStructureList = new ReportStructureList();
            }
        }

        public class MetadataTargetList
        {
            public List<MetadataTarget> MetadataTargets { get; set; }

            public MetadataTargetList()
            {
                MetadataTargets = new List<MetadataTarget>();
            }
        }

        public class MetadataTarget
        {
            public string Id { get; set; }
            public string Type { get; set; }
            public List<Identifiabletarget> IdentifiableTarget { get; set; }
            public List<Annotation> Annotations { get; set; }

            public MetadataTarget()
            {
                IdentifiableTarget = new List<Identifiabletarget>();
                Annotations = new List<Annotation>();
            }
        }

        public class Identifiabletarget
        {
            public string Id { get; set; }
            public LocalRepresentation LocalRepresentation { get; set; }
            public List<Annotation> Annotations { get; set; }
            public string ObjectType { get; set; }

            public Identifiabletarget()
            {
                LocalRepresentation = new LocalRepresentation();
                Annotations = new List<Annotation>();
            }
        }

        public class LocalRepresentation
        {
            public string Enumeration { get; set; }
            public TextFormat TextFormat { get; set; }

            public LocalRepresentation()
            {
                TextFormat = new TextFormat();
            }
        }

        public class TextFormat
        {
            public string TextType { get; set; }
        }

        public class ReportStructureList
        {
            public List<Reportstructure> ReportStructures { get; set; }

            public ReportStructureList()
            {
                ReportStructures = new List<Reportstructure>();
            }
        }

        public class Reportstructure
        {
            public string Id { get; set; }
            public List<string> MetadataTargetId { get; set; }
            public MetadataAttributelist MetadataAttributeList { get; set; }
            public List<Annotation> Annotations { get; set; }

            public Reportstructure()
            {
                MetadataTargetId = new List<string>();
                MetadataAttributeList = new MetadataAttributelist();
                Annotations = new List<Annotation>();
            }
        }

        public class MetadataAttributelist
        {
            public List<MetadataAttribute> MetadataAttributes { get; set; }

            public MetadataAttributelist()
            {
                MetadataAttributes = new List<MetadataAttribute>();
            }
        }

        public class MetadataAttribute
        {
            public string Id { get; set; }
            public string MinOccurs { get; set; }
            public string MaxOccurs { get; set; }
            public string ConceptIdentity { get; set; }
            public bool IsPresentational { get; set; }
            public List<MetadataAttribute> MetadataAttributes { get; set; }
            public LocalRepresentation LocalRepresentation { get; set; }
            public List<Annotation> Annotations { get; set; }

            public MetadataAttribute()
            {
                MetadataAttributes = new List<MetadataAttribute>();
                LocalRepresentation = new LocalRepresentation();
                Annotations = new List<Annotation>();
            }
        }
        public class Annotation
        {
            public string Id { get; set; }
            public string Type { get; set; }
            public string Title { get; set; }
            public string Text { get; set; }
            public Dictionary<string, string> Texts { get; set; }

            public Annotation()
            {
                Texts = new Dictionary<string, string>();
            }
        }

    }
}
