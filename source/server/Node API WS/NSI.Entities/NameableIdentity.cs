using System;
using System.Collections.Generic;
using System.Text;

namespace NSI.Entities
{
    public class NameableIdentity : ArtefactIdentity
    {
        public Dictionary<string, string> Name { get; set; }

        public NameableIdentity(Dictionary<string, string> name, string id, string agency, string version)
            : base(id, agency, version)
        {
            this.Name = name;
        }
        public NameableIdentity(Dictionary<string, string> name, string id, string agency, string version, bool isFinal)
            : base(id, agency, version, isFinal)
        {
            this.Name = name;
        }
    }
}
