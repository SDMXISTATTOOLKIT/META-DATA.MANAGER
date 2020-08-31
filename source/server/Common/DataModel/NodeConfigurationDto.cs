using System;
using System.Collections.Generic;
using System.Text;

namespace DataModel
{
    public class NodeConfigurationDto
    {
        public NodeConfigurationDto()
        {
            General = new NodeConfig.nGeneral();
            Endpoint = new nEndpointDto();
            Dcatapit = new NodeConfig.Dcatapit();
            Annotations = new NodeConfig.nAnnotations();
        }

        public NodeConfig.nGeneral General { get; set; }
        public nEndpointDto Endpoint { get; set; }
        public NodeConfig.nAnnotations Annotations { get; set; }
        public NodeConfig.Dcatapit Dcatapit { get; set; }
        public NodeConfig.Annotationtab AnnotationTabs { get; set; }

        public class nEndpointDto
        {
            public nEndpointDto()
            {
                DataExplorerBaseURL = "";
                MAEndpoint = "";
                MetadataBaseURL = "";
            }

            public string DataExplorerBaseURL { get; set; }
            public string MAEndpoint { get; set; }
            public string MetadataBaseURL { get; set; }
            public bool HaveDMWS { get; set; }
        }

    }
}
