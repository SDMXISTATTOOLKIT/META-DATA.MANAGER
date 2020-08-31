using BusinessLogic;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Security.Claims;
using System.Threading.Tasks;

namespace API.Security
{
#pragma warning disable CS1591 // Missing XML comment for publicly visible type or member
    public class NodeAuthorizeHandler : AuthorizationHandler<NodeAuthorizeRequirement>
    {
        readonly IMemoryCache _memoryCache;
        readonly IConfiguration _configuration;
        readonly IHttpClientFactory _httpClientFactory;

        public NodeAuthorizeHandler(IMemoryCache memoryCache, IConfiguration configuration, IHttpClientFactory httpClientFactory)
        {
            _memoryCache = memoryCache;
            _configuration = configuration;
            _httpClientFactory = httpClientFactory;
        }

        protected override Task HandleRequirementAsync(AuthorizationHandlerContext context,
                                                       NodeAuthorizeRequirement requirement)
        {
            if (!context.User.Identity.IsAuthenticated)
            {
                return Task.CompletedTask;
            }

            var auth = false;
            var nodeId = context.User.Claims.FirstOrDefault(item => item.Type.Equals("nodeId", StringComparison.InvariantCultureIgnoreCase));

            if ((nodeId == null || String.IsNullOrWhiteSpace(nodeId.Value)) && requirement.AuthorizeName != NodeAuthorizeName.AnonymousNodeAuthorize)
            {
                return Task.CompletedTask;
            }

            var allConfis = new ConfigManager(_configuration, _memoryCache).GetAllConfigurations();
            switch (requirement.AuthorizeName)
            {
                case NodeAuthorizeName.AnonymousNodeAuthorize:
                    auth = AnonymousNodeAuthorize();
                    break;
                case NodeAuthorizeName.DmApiNodeAuthorize:
                    auth = DmApiNodeAuthorize();
                    break;
            }
            

            if (auth)
            {
                context.Succeed(requirement);
            }

            return Task.CompletedTask;
        }

        private bool AnonymousNodeAuthorize()
        {
            return true;
        }

        private bool DmApiNodeAuthorize()
        {
            return true;
        }
    }
#pragma warning restore CS1591 // Missing XML comment for publicly visible type or member
}
