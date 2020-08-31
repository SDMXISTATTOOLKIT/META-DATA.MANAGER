using System;
using System.Collections.Generic;
using System.Text;

namespace MA.Entities
{
    public class GenericMapping : MAEntity
    {
        public char type { get; set; }
        public string parentId { get; set; }
        public List<DatasetColumn> dataset_column { get; set; }
        public Component component { get; set; }
        public string defaultValue { get; set; }
        public object transcoding { get; set; }

        public GenericMapping(string parentId, string colName, string compCode, string defValue) : base()
        {
            this.type = 'A';
            this.parentId = parentId;
            this.dataset_column = new List<DatasetColumn>();
            this.dataset_column.Add(new DatasetColumn(colName));
            this.component = new Component(compCode, null);
            this.defaultValue = defValue;
        }
    }
}
