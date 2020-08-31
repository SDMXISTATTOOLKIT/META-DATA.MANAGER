using System;
using System.Collections.Generic;
using System.Text;

namespace DataModel
{
    public class ClientConfig
    {
        public List<NodeConfigurationDto> Nodes { get; set; }
        public AppConfig.Userinterface UserInterface { get; set; }
        public AppConfig.Datamanagement DataManagement { get; set; }
    }
}
