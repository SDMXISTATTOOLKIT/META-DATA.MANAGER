using Org.Sdmxsource.Sdmx.Api.Model.Objects;
using System;
using System.Collections.Generic;
using System.Text;

namespace NSI.Entities
{
    public class ArtefactSearch
    {
        public ISdmxObjects Results { get; set; }
        public List<Item> Items { get; set; }
        public long Count { get; set; }
        public string JsonResult { get; set; }

        public ArtefactSearch()
        {
            Items = new List<Item>();
        }

        public class Item
        {
            public string Code { get; set; }
            public string Name { get; set; }
            public string Parent { get; set; }
            public bool IsSelected { get; set; }
            public bool IsSelectable { get; set; }
        }
    }
}
