using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Text;

namespace MA.Entities
{
    public class ContactReference
    {
        public string id { get; set; }
        public Dictionary<string, string> name { get; set; }
        [JsonProperty(NullValueHandling = NullValueHandling.Ignore)]
        public List<Contact> contacts { get; set; }

        [JsonConstructor]
        public ContactReference(string id, Dictionary<string, string> nameDic, List<Contact> contacts)
        {
            this.id = id;
            this.name = nameDic;
            this.contacts = contacts;
        }


        /*public ContactReference(string id, string name, List<Contact> contacts, string language)
        {
            this.id = id;

            this.name = new Dictionary<string, string>();
            this.name.Add(language, name);

            this.contacts = contacts;
        }*/
    }
}
