using NSI.Entities;
using System;
using System.Collections.Generic;
using System.Text;

namespace NSI.Entities
{
    public class ImportedItemXmlDTO
    {
        public List<ImportedItemXml> ImportedItem { get; set; }
        public string HashImport { get; set; }
    }
}
