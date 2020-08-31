using System;
using System.Collections.Generic;
using System.Text;

namespace DDB.Entities
{
    public class Measure
    {
        public int IDMeas { get; set; }
        public string Code { get; set; }
        public string ColName{ get; set; }
        public bool IsAlphanumeric { get; set; }

        public Measure(int IDMeas, string Code, string ColName, bool IsAlphanumeric)
        {
            this.IDMeas = IDMeas;
            this.Code = Code;
            this.ColName = ColName;
            this.IsAlphanumeric = IsAlphanumeric;
        }
    }
}
