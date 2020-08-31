using System.Collections.Generic;

namespace DataModel
{
    public class ClientConfig
    {
        public List<NodeConfigurationDto> Nodes { get; set; }
        public AppConfig.Userinterface UserInterface { get; set; }
        public AppConfig.Datamanagement DataManagement { get; set; }
    }
}
