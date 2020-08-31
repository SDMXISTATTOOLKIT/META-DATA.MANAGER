using System;
using System.Collections.Generic;
using System.Text;

namespace MA.Entities
{
    public class Period : Year
    {
        public List<MaRule> rules { get; set; }

        public Period(List<MaRule> rules, MAEntity col, int start, int length) : base(col, start, length)
        {
            this.rules = rules;
        }
    }
}
