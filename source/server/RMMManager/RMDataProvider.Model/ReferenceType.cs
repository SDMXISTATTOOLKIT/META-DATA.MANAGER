using System;
using System.Collections.Generic;
using System.Text;

namespace RMDataProvider.Model
{
    [Serializable]
    public abstract class ReferenceType 
    {
        public ReferenceType() { }

        public RefBaseType Ref { get; set; }
        public List<XmlUri> URN { get; set; }
    }
}
