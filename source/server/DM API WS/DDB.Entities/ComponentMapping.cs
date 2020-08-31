using System;
using System.Collections.Generic;
using System.Text;

namespace DDB.Entities
{
    public enum CubeComponentTypeEnum
    {
        Attribute = 0,
        Dimension = 1,
        Measure = 2,
        TimeDimension = 3
    }

    public class ComponentMapping
    {
        public int IDComp { get; set; }
        public int IDMapping { get; set; }
        public string ColumnName { get; set; }
        public string CubeComponentCode { get; set; }
        public CubeComponentTypeEnum CubeComponentType { get; set; }

        public ComponentMapping(int IDComp, int IDMapping, string ColumnName, string CubeComponentCode, CubeComponentTypeEnum CubeComponentType)
        {
            this.IDComp = IDComp;
            this.IDMapping = IDMapping;
            this.ColumnName = ColumnName;
            this.CubeComponentCode = CubeComponentCode;
            this.CubeComponentType = CubeComponentType;
        }
    }
}
