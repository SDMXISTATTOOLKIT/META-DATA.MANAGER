using System;
using System.Collections.Generic;
using System.Text;

namespace NSI.Entities
{
    public class ImportedItemCsvDTO
    {
        public ArtefactIdentity Identity { get; set; }
        public string TextSeparator { get; set; }
        public string TextDelimiter { get; set; }
        public string Lang { get; set; }
        public string Type { get; set; }
        public bool FirstRowHeader { get; set; }
        public string HashImport { get; set; }

        public List<ImportedItemCsv> ImportedItemCsv { get; set; }

        public OrderColumns Columns { get; set; }

        public ImportedItemCsvDTO()
        {
            ImportedItemCsv = new List<ImportedItemCsv>();
            Columns = new OrderColumns();
        }

        public class OrderColumns
        {
            public int Id { get; set; }
            public int Name { get; set; }
            public int Description { get; set; }
            public int Parent { get; set; }
            public int Order { get; set; }
            public int FullName { get; set; }
            public int IsDefault { get; set; }

            public OrderColumns()
            {
                Id = 0;
                Name = 1;
                Description = 2;
                Parent = 3;
                Order = 4;
                FullName = 5;
                IsDefault = 6;
            }

        }

    }
}
