using System;
using System.Collections.Generic;
using System.Text;

namespace DDB.Entities
{
    public class MappingWithComponents : Mapping
    {
        public List<ComponentMapping> Components;

        public MappingWithComponents(int IDMapping, int IDCube, string Name, string Description, string Tid, string CSVDelimiter,
            string CSVSeparator, bool HasHeader, bool HasSpecialTimePeriod, List<ComponentMapping> comps) 
            : base(IDMapping, IDCube, Name, Description, Tid, CSVDelimiter, CSVSeparator, HasHeader, HasSpecialTimePeriod)
        {
            this.Components = comps;
        }
    }
}
