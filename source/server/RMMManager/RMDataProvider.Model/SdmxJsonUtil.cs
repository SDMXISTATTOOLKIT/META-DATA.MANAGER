using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.IO;
using System.Text;

namespace RMDataProvider.Model
{
    public class SdmxJsonUtil
    {
        public string buildSdmxJsonMessage(List<MetadataSetType> mdstList)
        {
            StringBuilder sb = new StringBuilder();
            StringWriter sw = new StringWriter(sb);

            using (JsonWriter writer = new JsonTextWriter(sw))
            {
                //writer.Formatting = Formatting.Indented;
                writer.WriteStartObject();
                writer.WritePropertyName("meta");
                writer.WriteStartObject();
                writeMetaData(writer);
                writer.WriteEndObject();

                writer.WritePropertyName("data");
                writer.WriteStartObject();
                //writer.WritePropertyName("structure");
                //writeDataStructure(writer, this);
                writer.WritePropertyName("metadataSets");
                writer.WriteStartArray();
                foreach (MetadataSetType mdst in mdstList)
                {
                    mdst.WriteToSdmxJson(writer);
                    //string json = mdst.ToSdmxJson();
                    //json = json.Replace("\\", "");
                    //writer.WriteValue(json);
                }
                writer.WriteEndArray();
                writer.WriteEndObject();

                writer.WritePropertyName("errors");
                writeErrors(writer);

                writer.WriteEndObject();
            }

            return sb.ToString();
        }

        public void writeMetaData(JsonWriter writer)
        {
            writer.WritePropertyName("schema");
            writer.WriteValue("https://raw.githubusercontent.com/sdmx-twg/sdmx-json/develop/metadata-message/tools/schemas/1.0/sdmx-json-metadata-schema.json");
            writer.WritePropertyName("id");
            writer.WriteValue(DateTimeOffset.Now.ToUnixTimeMilliseconds());
            writer.WritePropertyName("prepared");
            writer.WriteValue(DateTime.Now.ToString());
            //writer.WritePropertyName("names");
            //string nameM = null;
            //List<string> langs = new List<string>();
            //writer.WriteStartArray();
            //foreach (Name name in metadataSetType.Name)
            //{
            //    if (nameM == null)
            //    {
            //        nameM = name.TypedValue;
            //    }
            //    langs.Add(name.lang);
            //    writer.WriteValue(name.TypedValue);
            //}
            //writer.WriteEndArray();
            //if (nameM != null)
            //{
            //    writer.WritePropertyName("name");
            //    writer.WriteValue(nameM);
            //}
            //if (langs.Count > 0)
            //{
            //    writer.WritePropertyName("contentLanguages");
            //    writer.WriteStartArray();
            //    foreach (string lang in langs)
            //    {
            //        writer.WriteValue(lang);
            //    }
            //    writer.WriteEndArray();
            //}
            writer.WritePropertyName("sender");
            writer.WriteStartObject();
            writer.WriteEndObject();
            writer.WritePropertyName("receivers");
            writer.WriteStartArray();
            writer.WriteEndArray();
            writer.WritePropertyName("links");
            writer.WriteStartArray();
            writer.WriteEndArray();
        }

        public void writeErrors(JsonWriter writer)
        {
            writer.WriteStartObject();
            writer.WriteEndObject();
        }

    }
}
