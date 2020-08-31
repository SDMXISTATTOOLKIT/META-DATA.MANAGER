using System;
using System.Collections.Generic;
using System.IO;
using System.Text;
using Newtonsoft.Json;

namespace RMDataProvider.Model
{
    [Serializable]
    public abstract class SdmxJsonConvertible : ISdmxJsonConvertible
    {
        public abstract void FromSdmxJson(string sdmxJson);

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

        public abstract void WriteToSdmxJson(JsonWriter writer);
    }
}
