using System;
using System.Collections.Generic;
using System.Text;

namespace NSI.Entities
{
    public class ImportedItemXml : NameableIdentity
    {
        public string Type { get; set; }
        public bool IsOk { get; set; }

        public ImportedItemXml() : base (new Dictionary<string, string>(), "", "", "")
        {

        }

        public ImportedItemXml(Dictionary<string, string> name, string iD, string agency, string version, string type, bool isOk)
            : base(name, iD, agency, version)
        {
            Type = type;
            IsOk = isOk;
        }

        public ImportedItemXml(Dictionary<string, string> name, string iD, string agency, string version, bool isFinal, string type, bool isOk)
            : base(name, iD, agency, version, isFinal)
        {
            Type = type;
            IsOk = isOk;
        }
        

    }
}
