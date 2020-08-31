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
    public class ReportedAttributeType : AnnotableType, ISdmxJsonConvertible
    {
        public const string ANNOTATION_KEY_REPORT_ATTRIBUTE_ID = "RepAttributeId";

        public ReportedAttributeType() {
            this.Text = new List<Text>();
        }

        public ReportedAttributeType(string id) {
            this.id = id;
            this.Text = new List<Text>();
        }

        public ReportedAttributeType(string id, string val, string language = null) {
            this.id = id;
            this.Text = new List<Text>();
            Text t  = new Text(val, language);
            this.Text.Add(t);
        }

        public ReportedAttributeType(string id, string[] values, string[] languages)
        {
            this.id = id;
            this.Text = new List<Text>();

            if (values.Length == languages.Length)
            {
                for (int i = 0; i < values.Length; i++)
                {
                    Text t = new Text(values[i], languages[i]);
                    this.Text.Add(t);
                }
            }           
        }

        public ReportedAttributeType(string id, string[] values)
        {
            this.id = id;
            this.Text = new List<Text>();

            for (int i = 0; i < values.Length; i++)
            {
                Text t = new Text(values[i],null);
                this.Text.Add(t);
            }
        }

        [XmlElement("")]
        public List<Text> Text { get; set; }

        [XmlElement("")]
        public List<StructuredText> StructuredText { get; set; }
        public AttributeSetType AttributeSet { get; set; }

        [XmlAttribute]
        public string id { get; set; }
        public string value { get; set; }

        public void AddText(string val, string language = null)
        {

            foreach (Text t in Text)
            {
                //one term for each language
                if (language == t.lang)
                {
                    return;
                }
            }

            this.Text.Add(new Text(val,language));
        }


        public void AddAttribute(ReportedAttributeType attr)
        {

            if (AttributeSet == null)
            {
                AttributeSet = new AttributeSetType();
            }
            //add new attribute
            AttributeSet.ReportedAttribute.Add(attr);
        }

        public void AddTranslatedAttribute(string id, string[] values, string[] languages)
        {
            if (values.Length != languages.Length)
            {
                return;
            }

            if (AttributeSet == null)
            {
                AttributeSet = new AttributeSetType();
            }

            //add new attribute
            AttributeSet.ReportedAttribute.Add(new ReportedAttributeType(id, values, languages));
        }


        public void AddAttributeTranslation(string id, string value, string language)
        {
            if (AttributeSet == null)
            {
                AttributeSet = new AttributeSetType();
            }

            ReportedAttributeType existingAttribute = AttributeSet.getAttributeById(id);

            if (existingAttribute == null)
            {
                AttributeSet.ReportedAttribute.Add(new ReportedAttributeType(id, value, language));
            }
            else
            {
                existingAttribute.AddText(value, language);
            }
        }


        public void AddAttribute(string id,string val, string language = null)
        {

            if (AttributeSet == null)
            {
                AttributeSet = new AttributeSetType();
            }

            AttributeSet.ReportedAttribute.Add(new ReportedAttributeType(id, val, language));
        }

        public void WriteToSdmxJson(JsonWriter writer)
        {
            writer.WriteStartObject();
            if (this.id != null && this.id.Trim().Length > 0)
            {
                writer.WritePropertyName("id");
                writer.WriteValue(this.id.Trim());
            }

            //string repAttrId = this.getAnnotationValue(ReportedAttributeType.ANNOTATION_KEY_REPORT_ATTRIBUTE_ID);
            //if (repAttrId != null && repAttrId.Trim().Length>0)
            //{
            //    writer.WritePropertyName(ReportedAttributeType.ANNOTATION_KEY_REPORT_ATTRIBUTE_ID);
            //    writer.WriteValue(repAttrId.Trim());
            //}

            if (this.Text != null && this.Text.Count > 0)
            {
                writer.WritePropertyName("texts");
                writer.WriteStartObject();
                foreach (Text t in this.Text)
                {
                    writer.WritePropertyName(t.lang);
                    writer.WriteValue(t.TypedValue);
                }
                writer.WriteEndObject();
            }

            if (this.AttributeSet != null && this.AttributeSet.ReportedAttribute != null && this.AttributeSet.ReportedAttribute.Count > 0)
            {
                writer.WritePropertyName("attributeSet");
                this.AttributeSet.WriteToSdmxJson(writer);
            }
            else
            {
                writer.WritePropertyName("attributeSet");
                writer.WriteStartObject();
                writer.WritePropertyName("reportedAttributes");
                writer.WriteValue((string)null);
                writer.WriteEndObject();
            }

            writeAnnotations(writer);

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
            JToken reportedAttributesIdToken = o.SelectToken("id");
            if (reportedAttributesIdToken != null)
            {
                this.id = reportedAttributesIdToken.ToString().Trim();
            }
            //JToken repAttributeIdToken = o.SelectToken("RepAttributeId");
            //if (repAttributeIdToken != null)
            //{
            //    this.addAnnotationValue(ReportedAttributeType.ANNOTATION_KEY_REPORT_ATTRIBUTE_ID, repAttributeIdToken.ToString().Trim(), RMUtil.RMUtility.UND_LANGUAGE);
            //}
            JToken valueToken = o.SelectToken("texts");
            if (valueToken != null)
            {
                this.Text = new List<Text>();
                foreach (JToken vToken in valueToken)
                {
                    string[] valueStr = RMUtil.RMUtility.SplitKeyValueJsonProperty(vToken.ToString());
                    this.Text.Add(new Text(valueStr[1].Trim(), valueStr[0].Trim()));
                }
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
