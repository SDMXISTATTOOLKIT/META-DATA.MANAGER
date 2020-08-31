using System;
using System.Collections.Generic;
using System.Text;

namespace NSI.Entities
{
    abstract public class ImportedFileResultBase
    {
        public bool HaveError { get; set; }
        public List<ItemResult> ItemsMessage { get; set; }

        public class ItemResult
        {
            public string Status { get; set; }
            public string MaintainableObject { get; set; }
            public bool IsFinal { get; set; }
            public string Result { get; set; }
            public string CustomMessage { get; set; }
            public ItemResult()
            {
                Status = "";
                MaintainableObject = "";
                Result = "";
            }
        }
    }
}
