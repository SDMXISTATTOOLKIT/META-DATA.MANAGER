using AuthCore.Model;
using System;
using System.IO;
using System.Runtime.Serialization.Json;
using System.Text;
using System.Xml.Serialization;

namespace RMUtil
{
    public class RMUtility
    {
        public static string UND_LANGUAGE = "und";
        public static string EN_LANGUAGE = "en";
        public static string IT_LANGUAGE = "it";

        public static string BuildMetadataflowURN(string id, string agency, string version)
        {
            return "urn:sdmx:org.sdmx.infomodel.metadatastructure.Metadataflow="+agency+":"+id+"("+version+")";
        }

        public static string concatFilePaths(string filePath1, string filePath2)
        {
            string path1 = "";
            if (filePath1!=null)
            {
                path1 = filePath1.Trim();
            }
            string path2 = "";
            if (filePath2 != null)
            {
                path2 = filePath2.Trim();
            }
            if (path1.EndsWith("/"))
            {
                if (path2.StartsWith("/"))
                {
                    path2 = path2.Substring(1);
                }
            }
            else
            {
                if (!path2.StartsWith("/"))
                {
                    path1 = path1 + "/";
                }
            }
            return path1 + path2;
        }

        /// <summary>
        /// Analyzes a URN and retrieves id, agency and version. 
        /// </summary>
        /// <param name="URN">URN</param>
        /// <param name="id">Id</param>
        /// <param name="agency">Agency</param>
        /// <param name="version">Version</param>
        public static void ParseURN(string URN, out string id, out string agency, out string version)
        {
            id = URN.Substring(URN.LastIndexOf(":") + 1, URN.LastIndexOf("(") - URN.LastIndexOf(":") - 1);
            agency = URN.Substring(URN.LastIndexOf("=") + 1, URN.LastIndexOf(":") - URN.LastIndexOf("=") - 1);
            version = URN.Substring(URN.LastIndexOf("(") + 1, URN.LastIndexOf(")") - URN.LastIndexOf("(") - 1);
        }

        /// <summary>
        /// Build URN for a dataflow by parameters. 
        /// </summary>
        /// <param name="id">Id</param>
        /// <param name="agency">Agency</param>
        /// <param name="version">Version</param>
        /// <returns>Dataflow URN</returns>
        public static string buildDataflowURN(string id, string agency, string version)
        {
            return "urn:sdmx:org.sdmx.infomodel.datastructure.Dataflow=" + agency + ":" + id + "(" + version + ")";
        }

        public static string checkTargetType(string targetId)
        {
            string targetType = "";
            if (targetId.IndexOf("CATALOG") != -1)
            {
                targetType = "MetadataFlow";
            }
            else if (targetId.IndexOf("DATAFLOW") != -1)
            {
                targetType = "Dataflow";
            }
            return targetType;
        }

        public static Stream GenerateStreamFromString(string s)
        {
            var stream = new MemoryStream();
            var writer = new StreamWriter(stream);
            writer.Write(s);
            writer.Flush();
            stream.Position = 0;
            return stream;
        }

        public static object loadXMLData(string xmlfilepath, Type objClass)
        {
            object result = null;

            if (xmlfilepath == null)
            {
                throw new Exception("File not specified");
            }
            if (!File.Exists(xmlfilepath))
            {
                throw new Exception("File not founded");
            }

            XmlSerializer serializer = new XmlSerializer(objClass);
            FileStream fs = new FileStream(xmlfilepath, FileMode.Open);

            result = serializer.Deserialize(fs);

            fs.Close();

            return result;
        }

        public static string Serialize<T>(T obj)
        {
            DataContractJsonSerializer serializer = new DataContractJsonSerializer(obj.GetType());
            MemoryStream ms = new MemoryStream();
            serializer.WriteObject(ms, obj);
            string retVal = Encoding.UTF8.GetString(ms.ToArray());
            return retVal;
        }

        public static T Deserialize<T>(string json)
        {
            T obj = Activator.CreateInstance<T>();
            MemoryStream ms = new MemoryStream(Encoding.Unicode.GetBytes(json));
            DataContractJsonSerializer serializer = new DataContractJsonSerializer(obj.GetType());
            obj = (T)serializer.ReadObject(ms);
            ms.Close();
            return obj;
        }

        public static string[] SplitKeyValueJsonProperty(string jsonProperty)
        {
            string[] result = new string[2];
            string curr = jsonProperty.Trim();
            curr = curr.Replace("\r\n", "");
            curr = curr.Replace("\\", "");
            curr = curr.Replace("\"", "");
            if (curr.StartsWith("{"))
            {
                curr = curr.Substring(1);
            }
            if (curr.EndsWith("}"))
            {
                curr = curr.Substring(0, curr.Length - 1);
            }
            int div = curr.IndexOf(":");
            if (div > 0)
            {
                result[0] = curr.Substring(0, div).Trim();
                result[1] = curr.Substring(div + 1).Trim();
            }
            else
            {
                result[0] = "";
                result[1] = "";
            }
            return result;
        }
    }
}
