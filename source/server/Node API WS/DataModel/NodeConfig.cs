using Configuration;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Text;

namespace DataModel
{
    public class NodeConfig
    {
        public nGeneral General { get; set; }
        public List<string> Agencies { get; set; }
        public nEndpoint Endpoint { get; set; }
        public List<nAnnotationtab> AnnotationTabs { get; set; }
        public nProxy Proxy { get; set; }
        public nSearch Search { get; set; }
        public nOrder Order { get; set; }

        public class nGeneral
        {
            public string ID { get; set; }
            public string Name { get; set; }
            public string AnonymousUserViewMode { get; set; }
            [JsonIgnore]
            public string Username { get; set; }
            [JsonIgnore]
            public string Password { get; set; }
        }

        public class nEndpoint
        {
            public string NSIEndpoint { get; set; }
            public string NSIEndpointType { get; set; }
            public string MAEndpoint { get; set; }
            public string DMEndpoint { get; set; }
            public string LDAPEndpoint { get; set; }
            public string ActiveDirectoryEndpoint { get; set; }
            public string DataExplorerBaseURL { get; set; }

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
            private string _maSid;
            [JsonIgnore]
            public string MASid
            {
                get
                {
                    if (_maSid == null)
                    {
                        _maSid = ConfigurationManager.AppSettings["MA_SID"];
                    }
                    return _maSid;
                }
            }

            [JsonIgnore]
            public string Namespace { get; set; }
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

        public class nOrder
        {
            public string ConceptSchemesOrderAnnotation { get; set; }
            public string CategorySchemesOrderAnnotation { get; set; }
            public string CodelistsOrderAnnotation { get; set; }
        }

        public class nAnnotationtab
        {
            public string Name { get; set; }
            public List<nAnnotation> Annotations { get; set; }
        }

        public class nAnnotation
        {
            public string Name { get; set; }
            public bool IsVisible { get; set; }
        }
    }
    
}
