using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Utility
{
    public static class ExtensionMethods
    {
        public static string Capitalize(this string str, string separators = " .")
        {
            return CapitalizeSep(str, separators);
        }

        private static string CapitalizeSep(string str, string separators)
        {
            if(separators==null)
            {
                if (str.Length > 1)
                    return str.Substring(0, 1).ToUpper() + str.Substring(1).ToLower();
                else
                    return str;
            }
            else if (separators.Length == 1)
            {
                return str.Split(separators[0])
                            .Select(s => CapitalizeSep(s, null) )
                            .Aggregate((s1, s2) => s1 + separators[0] + s2);
            }
            else
            {
                return str.Split(separators[0])
                            .Select(s => CapitalizeSep(s, separators.Substring(1) ))
                            .Aggregate((s1, s2) => s1 + separators[0] + s2);
            }
        }

        public static string Unscape(this string str)
        {
            if (str != null)
                return str.Replace("&amp;", "&").Replace("&nbsp;", " ").Replace("&quot;", "\"").Replace("&ndash;", "-").Replace("&mdash;", "—").Replace("&hellip;", "...").Replace("&#47;", "/").Replace("&#39;","'").Replace("&#039;", "'").Replace("&ograve;", "ò").Replace("&ugrave;", "ù").Replace("&igrave;", "ì").Replace("&egrave;", "è").Replace("&agrave;", "à").Replace("&eacute;", "é");
            else
                return null;
        }

        public static string UnscapeJson(this string str)
        {
            if (str != null)
            {
                str = str.Replace(@"\""", @"""");
                str = str.Replace(@"\\", @"\");

                var codes = RegExUtils.GetMatches(str, @"\\u([0-9A-F]{4})");
                if(codes != null)
                {
                    foreach(var code in codes)
                    {
                        int ci = int.Parse(code[1], System.Globalization.NumberStyles.HexNumber);
                        char c = System.Convert.ToChar(ci);
                        str = str.Replace(code[0], c.ToString());
                    }
                }

                return str;

            }
            else
                return null;
        }


        public static string Clean(this string str)
        {
            if (str != null)
                return str.Trim().Replace("\r", "").Replace("\n", " ");
            else
                return null;
        }

        public static string Truncate(this string str, int len)
        {
            if (str != null)
                return (len > str.Length) ? str : str.Substring(0, len - 3) + "...";
            else
                return null;
        }

        public static string TruncateHash(this string str, int len)
        {
            if (str != null)
            {
                string hash = Utils.EncodeMD5String(str);
                return (len > str.Length) ? str: str.Substring(0, len - 5) + "-" + hash.Substring(0,4);
            }
            else
                return null;
        }


        public static string Convert(this string srcString, Encoding srcEncoding, Encoding destEncoding)
        {
            // Convert the string into a byte array.
            byte[] unicodeBytes = srcEncoding.GetBytes(srcString);

            // Perform the conversion from one encoding to the other.
            byte[] destBytes = Encoding.Convert(srcEncoding, destEncoding, unicodeBytes);

            // Convert the new byte[] into a char[] and then into a string.
            char[] destChars = new char[destEncoding.GetCharCount(destBytes, 0, destBytes.Length)];

            destEncoding.GetChars(destBytes, 0, destBytes.Length, destChars, 0);

            return new string(destChars);
        }
    }
}
