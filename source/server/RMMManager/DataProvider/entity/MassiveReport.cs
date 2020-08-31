using System;
using System.Collections.Generic;
using System.Text;
using static RMDataProvider.RMDB;

namespace RMDataProvider.entity
{
    public class MassiveReport
    {
        public MetadataAttributeDataTable MetadataAttributeDataTable { get; set; }
        public TranslatableItemsDataTable TranslatableItemsDataTable { get; set; }
        public TranslatableItemValuesDataTable TranslatableItemValuesDataTable { get; set; }
        public AnnotationTypeDataTable AnnotationTypeDataTable { get; set; }
        public AnnotationsGroupDataTable AnnotationsGroupDataTable { get; set; }
        public AnnotationDataTable AnnotationDataTable { get; set; }

        public int LastMetadataAttributeId { get; set; }
        public int LastTranslatableItemsId { get; set; }
        public int LastAnnotationsGroupId { get; set; }
        public int LastAnnotationsId { get; set; }
        public int LastAnnotationTypeId { get; set; }

        public MassiveReport()
        {
            MetadataAttributeDataTable = new MetadataAttributeDataTable();
            TranslatableItemsDataTable = new TranslatableItemsDataTable();
            TranslatableItemValuesDataTable = new TranslatableItemValuesDataTable();
            AnnotationTypeDataTable = new AnnotationTypeDataTable();
            AnnotationsGroupDataTable = new AnnotationsGroupDataTable();
            AnnotationDataTable = new AnnotationDataTable();
        }

    }
}
