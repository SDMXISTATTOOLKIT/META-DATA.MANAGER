using System;
using System.Collections.Generic;
using System.Text;

namespace MA.Entities
{
    public class MappingSet : MAEntity
    {
        public string parentId { get; set; }
        public string description { get; set; }
        public Dataset dataset { get; set; }

        public MappingSet(string name, string description, Dataset ds, string dfId, string dfAgency, string dfVersion) : base(name)
        {
            this.parentId = $"urn:sdmx:org.sdmx.infomodel.datastructure.Dataflow={dfAgency}:{dfId}({dfVersion})";
            this.description = description;
            this.dataset = ds;
        }
    }
}
