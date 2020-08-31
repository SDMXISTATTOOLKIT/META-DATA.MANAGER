using System;
using System.Collections.Generic;
using System.Text;

namespace DataModel
{
    public class CheckCodeListResult
    {
        public List<DSD> DSD { get; set; }

        public CheckCodeListResult()
        {
            DSD = new List<DSD>();
        }
    }

    public class DSD
    {
        public string ID { get; set; }
        public string Agency { get; set; }
        public string Version { get; set; }
        public Dictionary<string, List<string>> CodeList { get; set; }

        public DSD()
        {
            CodeList = new Dictionary<string, List<string>>();
        }
    }
}
