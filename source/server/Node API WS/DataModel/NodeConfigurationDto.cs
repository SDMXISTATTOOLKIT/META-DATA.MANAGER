

namespace DataModel
{
    public class NodeConfigurationDto
    {
        public NodeConfigurationDto()
        {
            General = new NodeConfig.nGeneral();
            Endpoint = new nEndpointDto();
            Order = new NodeConfig.nOrder();
        }

        public NodeConfig.nGeneral General { get; set; }
        public nEndpointDto Endpoint { get; set; }
        public NodeConfig.nOrder Order { get; set; }

        public class nEndpointDto
        {
            public nEndpointDto()
            {
                DataExplorerBaseURL = "";
            }

            public string DataExplorerBaseURL { get; set; }
        }

    }

    
}
