using System;
using System.Collections.Generic;
using System.Text;

namespace NSI.Entities
{
    public class ArtefactRegistry : ArtefactIdentity
    {
        public Dictionary<string, string> Names { get; set; }
        public Dictionary<string, string> Descriptions { get; set; }

        public ArtefactRegistry()
        {
            Names = new Dictionary<string, string>();
            Descriptions = new Dictionary<string, string>();
        }
    }
}
