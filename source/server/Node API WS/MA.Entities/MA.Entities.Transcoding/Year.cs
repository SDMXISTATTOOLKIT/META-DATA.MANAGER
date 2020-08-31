using System;
using System.Collections.Generic;
using System.Text;

namespace MA.Entities
{
    public class Year
    {
        public MAEntity column { get; set; }
        public int start { get; set; }
        public int length { get; set; }

        public Year(MAEntity col, int start, int length)
        {
            this.column = col;
            this.start = start;
            this.length = length;
        }
    }
}
