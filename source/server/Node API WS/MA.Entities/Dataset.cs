using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Text;

namespace MA.Entities
{
    public class Dataset : MAEntity
    {
        public string query { get; set; }
        public string parentId { get; set; }

        [JsonConstructor]
        public Dataset(string name, string query, string parentId) : base(name)
        {
            this.query = query;
            this.parentId = parentId;
        }

        public Dataset(int entityId) : base(entityId)
        { }
    }
}
