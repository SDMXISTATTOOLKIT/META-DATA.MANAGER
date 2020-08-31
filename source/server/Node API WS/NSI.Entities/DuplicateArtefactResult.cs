using System;
using System.Collections.Generic;
using System.Text;

namespace NSI.Entities
{
    public class DuplicateArtefactResult : ImportedFileResultBase
    {
        public DuplicateArtefactResult()
        {
            HaveError = false;
            ItemsMessage = new List<ItemResult>();
        }
    }
}
