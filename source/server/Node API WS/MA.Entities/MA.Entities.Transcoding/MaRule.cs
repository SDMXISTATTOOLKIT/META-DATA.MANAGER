using System;
using System.Collections.Generic;
using System.Text;

namespace MA.Entities
{
    public class MaRule
    {
        public Component code { get; set; }
        public List<ComponentWithParent> localCodes { get; set; }
        public string parentId { get; set; }

        public MaRule(Component c, List<ComponentWithParent> l, string parentId = null)
        {
            this.code = c;
            this.localCodes = l;
            this.parentId = parentId;
        }
    }
}
