using System;
using System.Collections.Generic;
using System.IO;
using System.Text;

namespace NSI.Entities
{
    public class DFDownload
    {
        public Stream Stream { get; set; }
        public string Format { get; set; }
        public string Ext { get; set; }
        public string FilePath { get; set; }
    }
}
