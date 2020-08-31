using Configuration;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Text;

namespace DataModel
{
    public class NodeConfig
    {
        public NodeConfig()
        {
            Annotations = new nAnnotations();
        }

        public nGeneral General { get; set; }
        public List<Agency> Agencies { get; set; }
        public nEndpoint Endpoint { get; set; }
        public Annotationtab AnnotationTabs { get; set; }
        public nProxy Proxy { get; set; }
        public nSearch Search { get; set; }
        public nAnnotations Annotations { get; set; }
        public Dcatapit DcatApIt { get; set; }

        public class nGeneral
        {
            public string ID { get; set; }
            public string Name { get; set; }
            public string DefaultItemsViewMode { get; set; }
            [JsonIgnore]
            public string Username { get; set; }
            [JsonIgnore]
            public string Password { get; set; }
            public string Order { get; set; }
            public bool Invisible { get; set; }
        }

        public class nEndpoint
        {
            public string NSIEndpoint { get; set; }
            public bool SupportAllCompleteStubs { get; set; }
            public string InitialWSDL { get; set; }
            public string NSIEndpointType { get; set; }
            public string MAEndpoint { get; set; }
            public string DMEndpoint { get; set; }
            public string LDAPEndpoint { get; set; }
            public string ActiveDirectoryEndpoint { get; set; }
            public string DataExplorerBaseURL { get; set; }
            public string MetadataBaseURL { get; set; }
            public string PingArtefact { get; set; }
            public string NSIReadOnlyUsername { get; set; }
            public string NSIReadOnlyPassword { get; set; }

            [JsonIgnore]
            private string _prefix;
            [JsonIgnore]
            public string Prefix
            {
                get
                {
                    if (_prefix == null)
                    {
                        _prefix = ConfigurationManager.AppSettings["Prefix"];
                    }
                    return _prefix;
                }
            }

            [JsonIgnore]
            //WARNING: to remove !!!
            public string MASid = "MappingStoreServer";// { get; set; }
                                                       //public string MASid { get; set; }


            public string Namespace { get; set; }

            public bool BypassCache { get; set; }

            public nEndpoint()
            {
                Namespace = "http://www.sdmx.org/resources/sdmxml/schemas/v2_1/webservices";
                PingArtefact = "ConceptScheme";
                MASid = "MappingStoreServer";
            }
        }

        public class nProxy
        {
            public bool Enabled { get; set; }
            public string Address { get; set; }
            public int Port { get; set; }
            public string Username { get; set; }
            public string Password { get; set; }
            public bool UseSystemProxy { get; set; }
        }

        public class nSearch
        {
            public List<string> ExcludeCodelists { get; set; }
            public List<string> ExcludeConceptSchemes { get; set; }
        }

        public class nAnnotations
        {
            public string HaveMetadata { get; set; }
            public string DDBDataflow { get; set; }
            public string Metadataset { get; set; }
            public string AssociatedCube { get; set; }
            public string CustomDSD { get; set; }
            public string Changed { get; set; }
            public string LayoutRow { get; set; }
            public string LayoutColumn { get; set; }
            public string LayoutRowSection { get; set; }
            public string LayoutFilter { get; set; }
            public string NotDisplayed { get; set; }
            public string FullName { get; set; }
            public string Default { get; set; }
            public string ConceptSchemesOrder { get; set; }
            public string CategorySchemesOrder { get; set; }
            public string CodelistsOrder { get; set; }
            public string CategorisationsOrder { get; set; }
            public string AttachedFilePath { get; set; }
            public string RestrictedForPublication { get; set; }
            public string DCAT_IsMultilingual { get; set; }
            public string CustomIsPresentational { get; set; }
            public string LayoutDataflowKeywords { get; set; }
            public string LayoutCriteriaSelection { get; set; }
            public string LayoutAttachedDataFiles { get; set; }
            public string LayoutDefaultPresentation { get; set; }
            public string LayoutDecimalSeparator { get; set; }
            public string LayoutNumberOfDecimals { get; set; }
            public string LayoutReferenceMetadata { get; set; }
            public string LayoutEmptyCellPlaceholder { get; set; }
            public string LayoutDataflowNotes { get; set; }
            public string LayoutMaxTableCells { get; set; }
            public string LayoutTerritorialDimensionIds { get; set; }
            public string LayoutDataflowSource { get; set; }

            public nAnnotations()
            {
                HaveMetadata = "HAVE_METADATA";
                DDBDataflow = "DDBDataflow";
                Metadataset = "AssociatedMetadataSet";
                AssociatedCube = "AssociatedCube";
                CustomDSD = "CustomDSD";
                Changed = "CHANGED";
                LayoutRow = "LAYOUT_ROW";
                LayoutColumn = "LAYOUT_COLUMN";
                LayoutRowSection = "LAYOUT_ROW_SECTION";
                LayoutFilter = "LAYOUT_FILTER";
                NotDisplayed = "NOT_DISPLAYED";
                FullName = "FULL_NAME";
                Default = "DEFAULT";
                ConceptSchemesOrder = "ORDER";
                CategorySchemesOrder = "ORDER";
                CodelistsOrder = "ORDER";
                CategorisationsOrder = "ORDER";
                AttachedFilePath = "ATTACHED_FILE_PATH";
                RestrictedForPublication = "RESTRICTED_FOR_PUBLICATION";
                DCAT_IsMultilingual = "SDMX21_IsMultilingual";
                CustomIsPresentational = "CUSTOM_IS_PRESENTATIONAL";
                LayoutDataflowKeywords = "LAYOUT_DATAFLOW_KEYWORDS";
                LayoutCriteriaSelection = "LAYOUT_CRITERIA_SELECTION";
                LayoutAttachedDataFiles = "LAYOUT_ATTACHED_DATA_FILES";
                LayoutDefaultPresentation = "LAYOUT_DEFAULT_PRESENTATION";
                LayoutDecimalSeparator = "LAYOUT_DECIMAL_SEPARATOR";
                LayoutNumberOfDecimals = "LAYOUT_NUMBER_OF_DECIMALS";
                LayoutReferenceMetadata = "LAYOUT_REFERENCE_METADATA";
                LayoutEmptyCellPlaceholder = "LAYOUT_EMPTY_CELL_PLACEHOLDER";
                LayoutDataflowNotes = "LAYOUT_DATAFLOW_NOTES";
                LayoutMaxTableCells = "LAYOUT_MAX_TABLE_CELLS";
                LayoutTerritorialDimensionIds = "LAYOUT_TERRITORIAL_DIMENSION_IDS";
                LayoutDataflowSource = "LAYOUT_DATAFLOW_SOURCE";
            }

        }

        public class Annotationtab
        {
            public List<nAnnotationtab> Tabs { get; set; }
            public bool IsTextCollapsed { get; set; }
        }

        public class nAnnotationtab
        {
            public string Name { get; set; }
            public Dictionary<string, string> Label { get; set; }
            public List<nAnnotation> Annotations { get; set; }
            public bool IsVisible { get; set; }
        }

        public class nAnnotation
        {
            public string Name { get; set; }
            public bool IsVisible { get; set; }
            public Dictionary<string, string> Label { get; set; }
        }

        public class Dcatapit
        {
            public string MSD { get; set; }
        }

        public class Contactpoint
        {
            public string ContactPointName { get; set; }
            public string ContactPointMail { get; set; }
            public string ContactPointPhone { get; set; }
            public string ContactPointSite { get; set; }
        }
    }
}
