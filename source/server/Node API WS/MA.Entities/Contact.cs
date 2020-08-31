using System;
using System.Collections.Generic;
using System.Text;

namespace MA.Entities
{
    public class Contact
    {
        public Dictionary<string, string> name { get; set; }
        public Dictionary<string, string> department { get; set; }
        public Dictionary<string, string> role { get; set; }
        public List<string> email { get; set; }

        public Contact(Dictionary<string, string> name, Dictionary<string, string> department, Dictionary<string, string> role, List<string> email)
        {
            this.name = name;
            this.department = department;
            this.role = role;
            this.email = email;
        }
    }
}
