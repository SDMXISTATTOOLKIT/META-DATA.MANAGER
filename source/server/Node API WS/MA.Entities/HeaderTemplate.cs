using System;
using System.Collections.Generic;
using System.Text;

namespace MA.Entities
{
    public class HeaderTemplate : MAEntity
    {
        public string dataSetAgencyId { get; set; }
        public string source { get; set; }
        public bool test { get; set; }
        public string parentId { get; set; }
        public ContactReference sender { get; set; }
        public List<ContactReference> receiver { get; set; }

        public HeaderTemplate(int entityId, string name, string dataSetAgencyId, string source, bool test, string parentId
            , ContactReference sender, List<ContactReference> receiver) : base(entityId.ToString(), name)
        {
            this.name = name;
            this.dataSetAgencyId = dataSetAgencyId;
            this.source = source;
            this.test = test;
            this.parentId = parentId;
            this.sender = sender;
            this.receiver = receiver;
        }

    }
}
