using System;
using System.Collections.Generic;
using System.Text;

namespace MA.Entities
{
    public class MAEntity
    {
        public string name { get; set; }
        public string entityId { get; set; }

        public MAEntity()
        { }

        public MAEntity(int id)
        {
            this.entityId = id.ToString();
        }
        public MAEntity(string name)
        {
            this.name = name;
        }

        public MAEntity(string id, string name)
        {
            this.entityId = id;
            this.name = name;
        }
    }
}
