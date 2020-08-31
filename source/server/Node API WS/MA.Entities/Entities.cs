using System;
using System.Collections.Generic;
using System.Text;

namespace MA.Entities
{
    public class Entities
    {
        public Dictionary<int, DDBConnection> ddbconnections { get; set; }
        public Dictionary<int, Dataset> datasets { get; set; }
        public Dictionary<int, DatasetColumn> datasetColumn { get; set; }
        public Dictionary<int, MappingSet> mappingsets { get; set; }
        public Dictionary<int, GenericMapping> genericmappings { get; set; }
        public Dictionary<int, Transcoding> transcodings { get; set; }
        public List<MaRule> transcodingRules { get; set; }
        public Dictionary<int, HeaderTemplate> headerTemplates { get; set; }

        public Entities()
        { }

        public void AddDdbConnection(int idx, DDBConnection conn)
        {
            if (ddbconnections == null)
                ddbconnections = new Dictionary<int, DDBConnection>();

            ddbconnections.Add(idx, conn);
        }

        public void AddDataset(int idx, Dataset ds)
        {
            if (datasets == null)
                datasets = new Dictionary<int, Dataset>();

            datasets.Add(idx, ds);
        }

        public void AddDatasetColumn(int idx, DatasetColumn dc)
        {
            if (datasetColumn == null)
                datasetColumn = new Dictionary<int, DatasetColumn>();

            datasetColumn.Add(idx, dc);
        }

        public void AddMappingSet(int idx, MappingSet ms)
        {
            if (mappingsets == null)
                mappingsets = new Dictionary<int, MappingSet>();

            mappingsets.Add(idx, ms);
        }

        public void AddMapping(int idx, GenericMapping m)
        {
            if (genericmappings == null)
                genericmappings = new Dictionary<int, GenericMapping>();

            genericmappings.Add(idx, m);
        }

        public void AddTranscoding(int idx, Transcoding t)
        {
            if (transcodings == null)
                transcodings = new Dictionary<int, Transcoding>();

            transcodings.Add(idx, t);
        }

        public void AddTranscodingRules(List<MaRule> tr)
        {
            if (transcodingRules == null)
                transcodingRules = new List<MaRule>();

            transcodingRules.AddRange(tr);
        }

        public void AddHeaderTemplate(int idx, HeaderTemplate ht)
        {
            if (headerTemplates == null)
                headerTemplates = new Dictionary<int, HeaderTemplate>();

            headerTemplates.Add(idx, ht);
        }
    }
}
