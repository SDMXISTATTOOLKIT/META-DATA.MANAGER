using System;
using System.Collections.Generic;
using System.Text;

namespace NSI.Entities
{
    public class ImportedItemCsvResult : ImportedFileResultBase
    {
        public List<ImportedItemCsv> ImportedItem { get; set; }

        public ImportedItemCsvResult()
        {
            HaveError = false;
            ItemsMessage = new List<ItemResult>();
            ImportedItem = new List<ImportedItemCsv>();
        }
    }
}
