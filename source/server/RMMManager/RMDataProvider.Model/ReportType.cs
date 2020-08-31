using System;
using System.Collections.Generic;
using System.IO;
using System.Text;
using System.Xml.Serialization;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace RMDataProvider.Model
{
    [Serializable]
    public class ReportType : AnnotableType, ISdmxJsonConvertible
    {
        public const string ANNOTATION_KEY_METADATASET_ID = "MetadataSetId";
        public const string ANNOTATION_KEY_REPORT_ID = "ReportId";
        //public const string ANNOTATION_KEY_REP_ATTRIBUTE_ID = "RepAttributeId";
        public const string ANNOTATION_KEY_REPORT_TYPE = "ReportType";
        public const string ANNOTATION_KEY_REPORT_STATE_ID = "ReportStateId";
        public const string ANNOTATION_KEY_REPORT_STATE_NAME = "ReportStateName";
        public const string ANNOTATION_KEY_REPORT_TARGET_TYPE_LIST = "TargetTypeList";
        public const string ANNOTATION_KEY_REPORT_PRESENTATIONAL_ATTR_LIST = "AttributePresentational";
        public const string ANNOTATION_KEY_REPORT_CODELIST_ATTR_LIST = "AttributeCodelist";
        public const string ANNOTATION_KEY_DATAFLOW_OWNER = "DataflowOwner";

        public const int TARGET_METADATAFLOW_ID = 1;
        public const string TARGET_METADATAFLOW_VALUE = "Metadataflow";
        public const int TARGET_DATAFLOW_ID = 2;
        public const string TARGET_DATAFLOW_VALUE = "Dataflow";
        
        public const int REPORT_STATE_NOT_PUBLISHABLE_ID = 1;
        public const string REPORT_STATE_NOT_PUBLISHABLE_VALUE = "NOT_PUBLISHABLE";
        public const int REPORT_STATE_NOT_PUBLISHED_ID = 2;
        public const string REPORT_STATE_NOT_PUBLISHED_VALUE = "NOT_PUBLISHED";
        public const int REPORT_STATE_PUBLISHED_ID = 3;
        public const string REPORT_STATE_PUBLISHED_VALUE = "PUBLISHED";
        public const int REPORT_STATE_DRAFT_ID = 4;
        public const string REPORT_STATE_DRAFT_VALUE = "DRAFT";

        public ReportType() { }

        public TargetType Target { get; set; }

        public AttributeSetType AttributeSet { get; set; }

        [XmlAttribute]
        public string id { get; set; }

        public void WriteToSdmxJson(JsonWriter writer)
        {
            writer.WriteStartObject();

            writer.WritePropertyName("id");
            writer.WriteValue(this.id);
            writer.WritePropertyName("target");
            this.Target.WriteToSdmxJson(writer);

            this.writeAnnotations(writer);

            if (this.AttributeSet != null && this.AttributeSet.ReportedAttribute != null)
            {
                writer.WritePropertyName("attributeSet");
                this.AttributeSet.WriteToSdmxJson(writer);
            }

            writer.WriteEndObject();
        }

        public string ToSdmxJson()
        {
            StringBuilder sb = new StringBuilder();
            StringWriter sw = new StringWriter(sb);

            using (JsonWriter writer = new JsonTextWriter(sw))
            {
                WriteToSdmxJson(writer);
            }
            return sb.ToString();
        }

        public void FromSdmxJson(string sdmxJson)
        {
            JObject o = JObject.Parse(sdmxJson);

            JToken repIdToken = o.SelectToken("id");
            if (repIdToken != null)
            {
                this.id = repIdToken.ToString().Trim();
            }

            JToken targetToken = o.SelectToken("target");
            if (targetToken != null)
            {
                this.Target = new TargetType();
                this.Target.FromSdmxJson(targetToken.ToString().Trim());
            }

            JToken attributeSetToken = o.SelectToken("attributeSet");
            if (attributeSetToken != null)
            {
                this.AttributeSet = new AttributeSetType();
                this.AttributeSet.FromSdmxJson(attributeSetToken.ToString().Trim());
            }

            readAnnotations(o);
        }
    }
}
