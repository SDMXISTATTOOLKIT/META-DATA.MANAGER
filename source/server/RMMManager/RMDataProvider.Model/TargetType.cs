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
    public class TargetType : SdmxJsonConvertible
    {
        public TargetType() { }

        [XmlElement("")]
        public List<ReferenceValueType> ReferenceValue { get; set; }

        [XmlAttribute]
        public string id { get; set; }

        public override void FromSdmxJson(string sdmxJson)
        {
            JObject o = JObject.Parse(sdmxJson);

            JToken targetIdToken = o.SelectToken("id");
            if (targetIdToken != null)
            {
                this.id = targetIdToken.ToString().Trim();
            }

            JToken refValueToken = o.SelectToken("referenceValues");
            if (refValueToken != null)
            {
                List<ReferenceValueType> refValueList = new List<ReferenceValueType>();
                foreach (JToken currRefValueToken in refValueToken)
                {
                    ReferenceValueType currRefValue = new ReferenceValueType();
                    JToken refValueIdToken = currRefValueToken.SelectToken("id");
                    if (refValueIdToken != null) { 
                        currRefValue.id = refValueIdToken.ToString().Trim();
                    }
                    JToken refValueObjToken = currRefValueToken.SelectToken("object");
                    if (refValueObjToken != null)
                    {
                        currRefValue.ObjectReference = new ObjectReferenceType();
                        List<XmlUri> uriList = new List<XmlUri>();
                        uriList.Add(new XmlUri(refValueObjToken.ToString().Trim()));
                        currRefValue.ObjectReference.URN = uriList;
                    }
                    refValueList.Add(currRefValue);
                }
                this.ReferenceValue = refValueList;
            }
        }

        public override void WriteToSdmxJson(JsonWriter writer)
        {
            writer.WriteStartObject();
            writer.WritePropertyName("id");
            writer.WriteValue(this.id);
            writer.WritePropertyName("referenceValues");
            writer.WriteStartArray();
            foreach (ReferenceValueType rvt in this.ReferenceValue)
            {
                writer.WriteStartObject();
                writer.WritePropertyName("id");
                writer.WriteValue(rvt.id);
                writer.WritePropertyName("object");
                writer.WriteValue(rvt.ObjectReference.URN[0].UriValue);
                writer.WriteEndObject();
            }
            writer.WriteEndArray();
            writer.WriteEndObject();
        }
    }
}
