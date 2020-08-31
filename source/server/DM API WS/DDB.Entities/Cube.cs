using System;
using System.Collections.Generic;

namespace DDB.Entities
{
    public class Cube
    {
        public int IDCube { get; set; }
        public string Code { get; set; }
        public int? IDCat { get; set; }
        public string DSDCode { get; set; }
        public Dictionary<string, string> labels { get; set; }
        public bool HasEmbargoedData { get; set; }
        public DateTime LastUpdate { get; set; }

        public Cube()
        {

        }

        public Cube(int IDCube, string Code, int? IDCat, string DSDCode, Dictionary<string, string> labels, bool embargo, DateTime lastUpdate)
        {
            this.IDCube = IDCube;
            this.Code = Code;
            this.IDCat = IDCat;
            this.DSDCode = DSDCode;
            this.labels = labels;
            this.HasEmbargoedData = embargo;
            this.LastUpdate = lastUpdate;
        }
    }
}
