using System;
using System.Collections.Generic;
using System.Text;

namespace RMDataProvider.Model
{
    [Serializable]
    public abstract class RefBaseType 
    {
        public RefBaseType() { }

        public string agencyID { get; set; }
        public string maintainableParentID { get; set; }
        public string maintainableParentVersion { get; set; }
        public string containerID { get; set; }
        public string id { get; set; }
        public string version { get; set; }
        public bool? local { get; set; }
        public string @class { get; set; }
        public string package { get; set; }
    }
}
