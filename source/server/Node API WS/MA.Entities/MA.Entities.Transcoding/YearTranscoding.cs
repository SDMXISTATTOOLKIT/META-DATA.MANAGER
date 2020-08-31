using System;
using System.Collections.Generic;
using System.Text;

namespace MA.Entities
{
    public class YearTranscoding
    {
        public Year year { get; set; }
        public bool isDateTime { get; set; }

        public YearTranscoding(Year year, bool isDateTime)
        {
            this.year = year;
            this.isDateTime = isDateTime;
        }
    }
}
