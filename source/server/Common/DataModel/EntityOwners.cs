using System;
using System.Collections.Generic;
using System.Text;

namespace DataModel
{
    public class EntityOwners
    {
        public string Type { get; set; }
        public string Id { get; set; }
        public List<Owner> Owners { get; set; }

        public EntityOwners()
        {
            Owners = new List<Owner>();
        }

        public class Owner
        {
            public string Username { get; set; }
            public string Email { get; set; }
        }
    }
}
