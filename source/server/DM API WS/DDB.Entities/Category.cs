using System;
using System.Collections.Generic;
using System.Text;

namespace DDB.Entities
{
    public class Category
    {
        public int IDCat { get; set; }
        public string CatCode { get; set; }
        public string ParCode { get; set; }
        public string Ord { get; set; }
        public Dictionary<string, string> labels { get; set; }

        public Category(int IDCat, string CatCode, string ParCode, string Ord, Dictionary<string, string> labels)
        {
            this.IDCat = IDCat;
            this.CatCode = CatCode;
            this.ParCode = ParCode;
            this.Ord = Ord;
            this.labels = labels;
        }

    }
}
