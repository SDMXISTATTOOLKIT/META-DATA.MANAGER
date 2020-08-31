using System;
using System.Collections.Generic;
using System.Text;

namespace DataModel
{
    public class NodeConfigDTO
    {
        public string EndPointUrl { get; set; }
        public bool Enabled { get; set; }
        public string Address { get; set; }
        public int Port { get; set; }
        public string Username { get; set; }
        public string Password { get; set; }
        public bool UseSystemProxy { get; set; }
        public string NSIEndpointType { get; set; }
        public string NSIReadOnlyUsername { get; set; }
        public string NSIReadOnlyPassword { get; set; }
        public string PingArtefact { get; set; }
        public bool BypassCache { get; set; }
    }
}
