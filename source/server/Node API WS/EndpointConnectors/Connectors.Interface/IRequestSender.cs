using DataModel;
using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;

namespace Connector.Connectors.Interface
{
    public interface IRequestSender
    {
        HttpClient Create(HttpClientHandler httpClientHandler, NodeConfig nodeConfig, EndPointType endPointType, int timeOut = 2);
    }
}
