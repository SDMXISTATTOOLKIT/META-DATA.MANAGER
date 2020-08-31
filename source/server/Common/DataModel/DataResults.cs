using System;
using System.Collections.Generic;
using System.Data;
using System.Text;

namespace DataModel
{
    public class DataResults
    {
        public DataTable Data { get; set; }
        public int Count { get; set; }
        public int CountEmbargo { get; set; }
        public List<string> Columns { get; set; }
    }
}
