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
    public class AttributeSetType : SdmxJsonConvertible
    {
        public AttributeSetType() { ReportedAttribute = new List<ReportedAttributeType>(); }

        [XmlElement("")]
        public List<ReportedAttributeType> ReportedAttribute { get; set; }

        public override void FromSdmxJson(string sdmxJson)
        {
            JObject o = JObject.Parse(sdmxJson);

            JToken reportedAttributesToken = o.SelectToken("reportedAttributes");
            if (reportedAttributesToken != null)
            {
                this.ReportedAttribute = new List<ReportedAttributeType>();
                foreach (JToken currRepAttrToken in reportedAttributesToken)
                {
                    ReportedAttributeType r = new ReportedAttributeType();
                    r.FromSdmxJson(currRepAttrToken.ToString().Trim());
                    this.ReportedAttribute.Add(r);
                }
            }
        }

        public ReportedAttributeType getAttributeById(string id)
        {
            foreach(ReportedAttributeType ra in ReportedAttribute)
            {
                if (id == ra.id)
                {
                    return ra;
                }
            }
            return null;
        }

        public override void WriteToSdmxJson(JsonWriter writer)
        {
            writer.WriteStartObject();
            writer.WritePropertyName("reportedAttributes");
            writer.WriteStartArray();
            foreach (ReportedAttributeType ra in this.ReportedAttribute)
            {
                ra.WriteToSdmxJson(writer);
            }
            writer.WriteEndArray();
            writer.WriteEndObject();
        }
    }
}
