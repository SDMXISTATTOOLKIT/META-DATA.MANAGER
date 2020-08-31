using NSI.Entities;
using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Text;

namespace Connector.Classes
{
    public class HttpRequestMessageWithIdentity : HttpRequestMessage
    {
        public List<ArtefactIdentity> Identity { get; set; }

        public HttpRequestMessageWithIdentity() : base()
        {
            Identity = new List<ArtefactIdentity>();
        }

        public HttpRequestMessageWithIdentity(HttpMethod method, string requestUri) : base(method, requestUri)
        {
            Identity = new List<ArtefactIdentity>();
        }

        public HttpRequestMessageWithIdentity(HttpMethod method, Uri requestUri) : base(method, requestUri)
        {
            Identity = new List<ArtefactIdentity>();
        }
    }
}
