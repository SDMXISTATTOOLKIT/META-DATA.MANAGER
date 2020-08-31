using System;
using System.Collections.Generic;
using System.Text;

namespace MA.Entities
{
    public class ComponentWithParent : Component
    {
        public string parentId { get; set; }
        public ComponentWithParent(string id, string entityId, string parId) : base(id, entityId)
        {
            this.parentId = parId;
        }
    }
}
