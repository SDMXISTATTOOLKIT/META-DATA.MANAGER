using System;
using System.Collections.Generic;
using System.Text;

namespace DataModel
{
    public class OptionsTable
    {
        public List<FilterTable> FilterTable { get; set; }
        public List<string> SelCols { get; set; }
        public List<string> SortCols { get; set; }
        public bool SortByDesc { get; set; }
        public int PageNum { get; set; }
        public int PageSize { get; set; }

        public OptionsTable()
        {
            FilterTable = new List<FilterTable>();
            SortCols = new List<string>();
        }
    }
}
