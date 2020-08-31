using Connector.Connectors.Interface;
using DataModel;
using Infrastructure.STLogging.Factory;
using Infrastructure.STLogging.Interface;
using Microsoft.Extensions.Caching.Memory;
using System;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;

namespace Connector.Connectors
{
    public class ProxyHttpClient : IRequestSender
    {
        readonly IMemoryCache _cache;
        readonly ISTLogger _logger;

        public ProxyHttpClient(IMemoryCache cache)
        {
            _logger = STLoggerFactory.Logger;
            _cache = cache;
        }

        public HttpClient Create(HttpClientHandler httpClientHandler, NodeConfig nodeConfig, EndPointType endPointType)
        {
            return GetOrCreateHttpClient(httpClientHandler, nodeConfig, endPointType, 120);
        }
        public HttpClient Create(HttpClientHandler httpClientHandler, NodeConfig nodeConfig, EndPointType endPointType, int timeOut)
        {
            return GetOrCreateHttpClient(httpClientHandler, nodeConfig, endPointType, timeOut);
        }

        private HttpClient GetOrCreateHttpClient(HttpClientHandler httpClientHandler, NodeConfig nodeConfig, EndPointType endPointType, int timeOut)
        {
            var keyCache = $"{nodeConfig.General.ID}_{nodeConfig.General.Username}";
            var cacheKey = CalculateCacheKeyForEndpoint(keyCache, endPointType);

            var cachedHttpClient = _cache.GetOrCreate<HttpClient>(cacheKey, entry => {

                string cachedUser = "";
                _cache.TryGetValue("CachedUser", out cachedUser);
                if (!string.IsNullOrWhiteSpace(cachedUser))
                {
                    if (!cachedUser.Split(";").ToList().Contains(nodeConfig.General.Username))
                    {
                        cachedUser += $";{nodeConfig.General.Username}";
                    }
                }
                else 
                {
                    cachedUser = nodeConfig.General.Username;
                }
                if (cachedUser != null)
                {
                    _cache.Set("CachedUser", cachedUser);
                }
                    

                //Subscribe remove event from cache for dispose
                entry.PostEvictionCallbacks.Add(GetPostEvictionCallbackRegistration());

                //Create HttpClient Cache Instance
                if (httpClientHandler == null)
                {
                    new HttpClientHandler
                    {
                        UseDefaultCredentials = true,
                        Proxy = WebRequest.DefaultWebProxy,
                        AutomaticDecompression = DecompressionMethods.GZip | DecompressionMethods.Deflate
                    };
                }
                var client = new HttpClient(httpClientHandler, disposeHandler: true)
                {
                    Timeout = TimeSpan.FromMinutes(timeOut)
                };
                if (!string.IsNullOrWhiteSpace(nodeConfig.General.Username))
                {
                    client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Basic", Convert.ToBase64String(Encoding.ASCII.GetBytes($"{nodeConfig.General.Username}:{nodeConfig.General.Password}")));
                }
                else if (!string.IsNullOrWhiteSpace(nodeConfig.Endpoint.NSIReadOnlyUsername))
                {
                    client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Basic", Convert.ToBase64String(Encoding.ASCII.GetBytes($"{nodeConfig.Endpoint.NSIReadOnlyUsername}:{nodeConfig.Endpoint.NSIReadOnlyPassword}")));
                }

                _logger.Log($"Created a new instance of HttpClient for endpoint '{nodeConfig.General.ID}' {endPointType.ToString()}", LogLevelEnum.Debug);
                return client;
            });
            return cachedHttpClient;
        }

        private PostEvictionCallbackRegistration GetPostEvictionCallbackRegistration()
        {
            return new PostEvictionCallbackRegistration
            {
                EvictionCallback = DisposeValue
            };
        }

        private void DisposeValue(object key, object value, EvictionReason reason, object state)
        {
            _logger.Log($"Disposed {value?.GetType().Name} for key '{key}' after eviction for reason: '{reason}'", LogLevelEnum.Debug);
            (value as IDisposable)?.Dispose();
        }

        static public string CalculateCacheKeyForEndpoint(string nodeId, EndPointType endPointType)
        {
            return $"endpoint-{nodeId}-{endPointType.ToString()}";
        }
    }
}
