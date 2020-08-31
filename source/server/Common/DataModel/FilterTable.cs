using System;
using System.Collections.Generic;
using System.Text;

namespace DataModel
{
    public class FilterTable
    {
        public string ColName { get; set; }
        public string Oper { get; set; }
        public object Val { get; set; }
        public bool IsAnd { get; set; }

        static public readonly List<string> Operators = new List<string> { "=", "<>", ">", "<", "LIKE", "NOT LIKE" };
    }
}
