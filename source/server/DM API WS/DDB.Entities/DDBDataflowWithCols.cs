using System;
using System.Collections.Generic;
using System.Globalization;

namespace DDB.Entities
{
    public class DDBDataflowWithCols : DDBDataflow
    {
        public List<string> DataflowColumns { get; set; }
        public bool sortByDesc { get; set; }

        public DDBDataflowWithCols(int IDDataflow, int IDCube, string ID, string Agency, string Version, Filter filter, bool hasTranscoding, bool HasContentConstraints, DateTime lastUpdate, List<string> cols, Dictionary<string, string> labs)
            : base(IDDataflow, IDCube, ID, Agency, Version, filter, hasTranscoding, HasContentConstraints, lastUpdate, labs)
        {
            this.DataflowColumns = cols;
        }
    }
}
