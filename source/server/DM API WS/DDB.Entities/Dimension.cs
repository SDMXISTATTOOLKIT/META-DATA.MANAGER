using System;
using System.Collections.Generic;
using System.Text;

namespace DDB.Entities
{
    public class Dimension
    {
        public int IDDim { get; set; }
        public string Code { get; set; }
        public string CodelistCode { get; set; }
        public string MemberTable{ get; set; }
        public string ColName { get; set; }
        public bool IsTimeSeriesDim { get; set; }
        public List<string> codes { get; set; }

        public Dimension(int IDDim, string Code, string CodelistCode, string MemberTable, string ColName, bool IsTimeSeriesDim, List<string> codes)
        {
            this.IDDim = IDDim;
            this.Code = Code;
            this.CodelistCode = CodelistCode;
            this.MemberTable = MemberTable;
            this.ColName = ColName;
            this.IsTimeSeriesDim = IsTimeSeriesDim;
            this.codes = codes;
        }
    }
}
