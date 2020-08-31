using System;
using System.Collections.Generic;
using System.Text;

namespace NSI.Entities
{
    public class ImportedItemCsv
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public string Parent { get; set; }
        public bool IsHeader { get; set; }
        public string Order { get; set; }
        public string FullName { get; set; }
        public string IsDefault { get; set; }

        public ImportedItemCsv()
        {
            IsHeader = false;
            Parent = string.Empty;
            Description = string.Empty;
        }
    }
}
