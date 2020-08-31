using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Caching.Memory;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace API.Security
{
#pragma warning disable CS1591 // Missing XML comment for publicly visible type or member
    public enum NodeAuthorizeName { AnonymousNodeAuthorize, DmApiNodeAuthorize, SuperUser }

    public class NodeAuthorizeRequirement : IAuthorizationRequirement
    {
        public NodeAuthorizeName AuthorizeName { get; set; }

        public NodeAuthorizeRequirement(NodeAuthorizeName nodeAuthorizeName)
        {
            AuthorizeName = nodeAuthorizeName;
        }
        
    }
#pragma warning restore CS1591 // Missing XML comment for publicly visible type or member
}
