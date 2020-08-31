using System;
using System.Collections.Generic;
using System.Text;

namespace DDB.Entities
{
    public enum AttachmentLevel
    {
        Series = 0,
        Observation = 1,
        Group = 2,
        Dataset = 3
    }

    public class Attribute
    {
        public int IDAtt { get; set; }
        public string Code { get; set; }
        public string CodelistCode { get; set; }
        public string MemberTable{ get; set; }
        public string ColName { get; set; }
        public bool IsMandatory { get; set; }
        public bool IsTid { get; set; }
        public AttachmentLevel AttachmentLevel { get; set; }
        public List<string> refDim { get; set; }
        public List<string> codes{ get; set; }

        public Attribute(int IDAtt, string Code, string CodelistCode, string MemberTable, string ColName, bool IsMandatory,  bool IsTid
            , AttachmentLevel AttachmentLevel, List<string> dims, List<string> codes)
        {
            this.IDAtt = IDAtt;
            this.Code = Code;
            this.CodelistCode = CodelistCode;
            this.MemberTable = MemberTable;
            this.ColName = ColName;
            this.IsMandatory = IsMandatory;
            this.IsTid = IsTid;
            this.AttachmentLevel = AttachmentLevel;
            this.refDim = dims;
            this.codes = codes;
        }
    }
}
