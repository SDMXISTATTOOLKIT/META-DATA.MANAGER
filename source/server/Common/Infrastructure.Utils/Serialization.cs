using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Runtime.Serialization.Formatters.Binary;
using System.Runtime.Serialization;
using System.IO;

namespace Utility
{
    /// <summary>
    /// Classi helper di serializzaizone
    /// </summary>
    public class Serialization
    {
        public static byte[] BinSerialize(object obj)
        {
            MemoryStream ms = new MemoryStream();
            IFormatter formatter = new BinaryFormatter();

            formatter.Serialize(ms, obj);

            return ms.ToArray();
        }


        public static object BinDeserialize(byte[] arr)
        {
            MemoryStream ms = new MemoryStream(arr);
            IFormatter formatter = new BinaryFormatter();

            return formatter.Deserialize(ms);
        }

    }
}
