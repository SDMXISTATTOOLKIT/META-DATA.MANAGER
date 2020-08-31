using Newtonsoft.Json;
using System;
using System.Collections.Generic;

namespace DataModel
{
    public class AppConfig
    {
        public Userinterface UserInterface { get; set; }
        public List<Agency> Agencies { get; set; }
        public Datamanagement DataManagement { get; set; }
        public Defaultheadersubmitstructure DefaultHeaderSubmitStructure { get; set; }
        public List<Superusercredential> SuperUserCredentials { get; set; }
        public EndpointSettings EndpointSetting { get; set; }

        public AppConfig()
        {
            EndpointSetting = new EndpointSettings
            {
                DmTimeOut = 120,
                MaTimeOut = 120,
                NsiTimeOut = 120
            };
        }

        public class Userinterface
        {
            public Userinterface()
            {
                MaxNodeForExpandAll = 100;
            }
            public int DefaultTableRows { get; set; }
            public int MaxTableRows { get; set; }
            public bool DefaultSidebarCollapsed { get; set; }
            public string DefaultLanguage { get; set; }
            public List<LanguageData> Languages { get; set; }
            public List<string> AnonymousPages { get; set; }
            public int MinTreeNodesForPagination { get; set; }
            public int TreePageSize { get; set; }
            public int MaxTreeNodes { get; set; }
            public int MaxTreeNodesForPagination { get; set; }
            public int MaxNodeForExpandAll { get; set; }
        }

        public class Datamanagement
        {
            public string CubeCodePrefix { get; set; }
            public List<LanguageData> DataLanguages { get; set; }
            public int MaxDescriptionLength { get; set; }
        }

        public class Defaultheadersubmitstructure
        {
            public string ID { get; set; }
            public bool test { get; set; }
            public DateTime prepared { get; set; }
            public string sender { get; set; }
            public string receiver { get; set; }
        }

        public class Superusercredential
        {
            public string username { get; set; }
            public string password { get; set; }
            public string confirmPassword { get; set; }
        }

        public class LanguageData
        {
            public string Code { get; set; }
            public string Flag { get; set; }
        }

        public class EndpointSettings
        {
            public int NsiTimeOut { get; set; }
            public int DmTimeOut { get; set; }
            public int MaTimeOut { get; set; }
        }
    }
}
