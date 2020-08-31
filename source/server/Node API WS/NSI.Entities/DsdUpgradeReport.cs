using System;
using System.Collections.Generic;
using System.Text;

namespace NSI.Entities
{
    public class DsdUpgradeReport
    {
        public List<ArtefactIdentity> Upgrade { get; set; }
        public List<ArtefactIdentity> Fail { get; set; }
        public List<ArtefactIdentity> Deleted { get; set; }
        public List<ArtefactIdentity> ReCreated { get; set; }
        public List<ArtefactIdentity> NotChanged { get; set; }
        public bool CubeSuccessfullyUpdated { get; set; }

        public DsdUpgradeReport()
        {
            Upgrade = new List<ArtefactIdentity>();
            Fail = new List<ArtefactIdentity>();
            Deleted = new List<ArtefactIdentity>();
            NotChanged = new List<ArtefactIdentity>();
            ReCreated = new List<ArtefactIdentity>();
        }
    }
}
