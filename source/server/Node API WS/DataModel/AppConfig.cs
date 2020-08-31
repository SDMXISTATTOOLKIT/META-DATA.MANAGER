using System;
using System.Collections.Generic;
using System.Text;

namespace DataModel
{
    public class AppConfig
    {
        public Userinterface UserInterface { get; set; }
        public List<string> Agencies { get; set; }
        public Datamanagement DataManagement { get; set; }
        public Defaultheadersubmitstructure DefaultHeaderSubmitStructure { get; set; }
        public List<Superusercredential> SuperUserCredentials { get; set; }

        public class Userinterface
        {
            public int DefaultTableRows { get; set; }
            public bool DefaultSidebarCollapsed { get; set; }
            public string DefaultLanguage { get; set; }
            public List<string> Languages { get; set; }
            public List<string> AnonymousPages { get; set; }
        }

        public class Datamanagement
        {
            public string CubeCodePrefix { get; set; }
            public List<string> DataLanguages { get; set; }
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
        }
    }
}
