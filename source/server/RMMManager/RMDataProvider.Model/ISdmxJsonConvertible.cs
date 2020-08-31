using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Text;

namespace RMDataProvider.Model
{
    interface ISdmxJsonConvertible
    {
        void WriteToSdmxJson(JsonWriter writer);

        string ToSdmxJson();

        void FromSdmxJson(string sdmxJson);
    }
}
