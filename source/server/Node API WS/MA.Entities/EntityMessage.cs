using System;
using System.Collections.Generic;
using System.Text;

namespace MA.Entities
{
    public class EntityMessage
    {
        public Entities entities { get; set; }

        public EntityMessage(Entities ent)
        {
            entities = ent;
        }
    }
}
