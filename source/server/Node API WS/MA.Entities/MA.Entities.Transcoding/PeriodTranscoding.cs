using System;
using System.Collections.Generic;
using System.Text;

namespace MA.Entities
{
    public class PeriodTranscoding : YearTranscoding
    {
        public Period period { get; set; }

        public PeriodTranscoding(Year year, bool isDateTime, Period period) : base(year, isDateTime)
        {
            this.period = period;
        }
    }
}
