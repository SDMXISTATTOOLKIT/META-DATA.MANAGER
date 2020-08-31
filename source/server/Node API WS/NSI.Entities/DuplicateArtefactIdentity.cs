using System;
using System.Collections.Generic;
using System.Text;

namespace NSI.Entities
{
    public class DuplicateArtefactIdentity : ArtefactIdentity
    {
        public string TargetID { get; set; }
        public string TargetAgency { get; set; }
        public string TargetVersion { get; set; }

        public bool CopyReferencedArtefact { get; set; }

        public string NodeId { get; set; }
        public string Username { get; set; }
        public string Password { get; set; }
    }
}
