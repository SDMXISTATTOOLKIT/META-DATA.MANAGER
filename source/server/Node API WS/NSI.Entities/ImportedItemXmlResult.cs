using System;
using System.Collections.Generic;
using System.Text;

namespace NSI.Entities
{
    public class ImportedItemXmlResult : ImportedFileResultBase
    {
        public List<ImportedItemXml> ImportedItem { get; set; }

        public ImportedItemXmlResult()
        {
            HaveError = false;
            ItemsMessage = new List<ItemResult>();
            ImportedItem = new List<ImportedItemXml>();
        }
    }
}
