using System;
using System.Collections.Generic;
using System.Text;

namespace ArtefactDataModel.Property
{
    public class CubeRegion
    {
        public bool IsIncluded { get; set; }
        public List<KeyValue> KeyValues { get; set; }
    }
}
