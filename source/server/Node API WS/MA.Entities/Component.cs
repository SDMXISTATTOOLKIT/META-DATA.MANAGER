using System;
using System.Collections.Generic;
using System.Text;

namespace MA.Entities
{
    public class Component
    {
        public string id { get; set; }
        public string entityId { get; set; }

        public Component(string id, string entityId)
        {
            this.id = id;
            this.entityId = entityId;
        }
    }
}
