using System;
using System.Collections.Generic;
using System.Text;

namespace NSI.Entities
{
    public class ArtefactReference : ArtefactIdentity
    {
        public string ReferenceType { get; set; }
        public string ArtefactType { get; set; }
        public Dictionary<string, string> Names { get; set; }

        public ArtefactReference()
        {
            Names = new Dictionary<string, string>();
        }
    }
}
