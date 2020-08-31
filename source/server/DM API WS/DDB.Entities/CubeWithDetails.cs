using System;
using System.Collections.Generic;

namespace DDB.Entities
{
    public class CubeWithDetails : Cube
    {
        public List<Measure> Measures { get; set; }
        public List<Attribute> Attributes { get; set; }
        public List<Dimension> Dimensions { get; set; }

        public CubeWithDetails(int IDCube, string Code, int? IDCat, string DSDCode, List<Attribute> atts, List<Dimension> dims, List<Measure> meas
            , Dictionary<string, string> labels, bool embargo, DateTime lastUpdate) : base(IDCube, Code, IDCat, DSDCode, labels, embargo, lastUpdate)
        {
            this.Measures = meas;
            this.Attributes = atts;
            this.Dimensions = dims;
        }
    }
}
