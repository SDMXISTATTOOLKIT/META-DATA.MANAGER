using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Text;

namespace MA.Entities
{
    public class DatasetColumn : MAEntity
    {
        public string parentId { get; set; }

        public DatasetColumn(string name) : base(name)
        {
        }

        [JsonConstructor]
        public DatasetColumn(string name, string parentId) : base(name)
        {
            this.parentId = parentId;
        }
    }
}
