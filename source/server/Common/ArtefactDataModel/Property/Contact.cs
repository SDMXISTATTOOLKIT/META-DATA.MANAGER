using System;
using System.Collections.Generic;
using System.Text;

namespace ArtefactDataModel.Property
{
    public class Contact
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public Dictionary<string, string> Names { get; set; }
        public string Department { get; set; }
        public Dictionary<string, string> Departments { get; set; }
        public List<string> Emails { get; set; }
        public List<string> Faxes { get; set; }
        public string Role { get; set; }
        public Dictionary<string, string> Roles { get; set; }
        public List<string> Telephones { get; set; }
        public List<string> Uris { get; set; }
        public List<string> X400s { get; set; }
    }
}
