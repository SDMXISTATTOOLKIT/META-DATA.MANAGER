using System;
using System.Collections.Generic;
using System.Text;

namespace DDB.Entities
{
    public class Mapping
    {
        public int IDMapping { get; set; }
        public int IDCube { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public string Tid { get; set; }
        public string CSVDelimiter { get; set; }
        public string CSVSeparator { get; set; }
        public bool HasHeader { get; set; }
        public bool HasSpecialTimePeriod { get; set; }


        public Mapping(int IDMapping, int IDCube, string Name, string Description, string Tid, string CSVDelimiter, string CSVSeparator, bool HasHeader, bool HasSpecialTimePeriod)
        {
            this.IDMapping = IDMapping;
            this.IDCube = IDCube;
            this.Name = Name;
            this.Description = Description;
            this.Tid = Tid;
            this.CSVDelimiter = CSVDelimiter;
            this.CSVSeparator = CSVSeparator;
            this.HasHeader = HasHeader;
            this.HasSpecialTimePeriod = HasSpecialTimePeriod;
        }
    }
}
