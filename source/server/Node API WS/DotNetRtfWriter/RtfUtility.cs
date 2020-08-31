using System;
using System.Text;

namespace HooverUnlimited.DotNetRtfWriter
{
    /// <summary>
    ///     Summary description for RtfUtility
    /// </summary>
    public static class RtfUtility
    {
        public static float Mm2Points(float mm)
        {
            return mm * (float) 2.836;
        }

        public static int Mm2Twips(float mm)
        {
            var inches = mm * 0.0393700787;
            return Convert.ToInt32(inches * 1440);
        }

        public static int Pt2Twip(float pt)
        {
            return !float.IsNaN(pt) ? Convert.ToInt32(pt * 20) : 0;
        }

        public static int Pt2HalfPt(float pt)
        {
            return Convert.ToInt32(pt * 2);
        }

        private static int[] PaperDimensions(PaperSize paperSize)
        {
            switch (paperSize)
            {
                case PaperSize.A4:
                    return new[] {11906, 16838};
                case PaperSize.Letter:
                    return new[] {15840, 12240};
                case PaperSize.A3:
                    return new[] {16838, 23811};
                default:
                    throw new Exception("Unknow paper size.");
            }
        }

        public static int PaperWidthInTwip(PaperSize paperSize, PaperOrientation orientation)
        {
            var d = PaperDimensions(paperSize);
            if (orientation == PaperOrientation.Portrait)
                if (d[0] < d[1]) return d[0];
                else return d[1];
// landscape
            if (d[0] < d[1]) return d[1];
            return d[0];
        }

        public static int PaperHeightInTwip(PaperSize paperSize, PaperOrientation orientation)
        {
            var d = PaperDimensions(paperSize);
            if (orientation == PaperOrientation.Portrait)
                if (d[0] < d[1]) return d[1];
                else return d[0];
// landscape
            if (d[0] < d[1]) return d[0];
            return d[1];
        }

        public static float PaperWidthInPt(PaperSize paperSize, PaperOrientation orientation)
        {
            return PaperWidthInTwip(paperSize, orientation) / 20.0F;
        }

        public static float PaperHeightInPt(PaperSize paperSize, PaperOrientation orientation)
        {
            return PaperHeightInTwip(paperSize, orientation) / 20.0F;
        }

        public static string UnicodeEncode(string str)
        {
            var result = new StringBuilder();

            for (var i = 0; i < str.Length; i++)
            {
                int unicode = str[i];
                switch (str[i])
                {
                    case '\n':
                        result.AppendLine(@"\line");
                        break;
                    case '\r':
                        // ignore '\r'
                        break;
                    case '\t':
                        result.Append(@"\tab ");
                        break;
                    default:
                        if (unicode <= 0xff)
                        {
                            if (unicode == 0x5c || unicode == 0x7b || unicode == 0x7d)
                                result.Append(@"\'" + $"{unicode:x2}");
                            else if (0x00 <= unicode && unicode < 0x20) result.Append(@"\'" + $"{unicode:x2}");
                            else if (0x20 <= unicode && unicode < 0x80) result.Append(str[i]);
                            else result.Append(@"\'" + $"{unicode:x2}");
                        }
                        else if (0xff < unicode && unicode <= 0x8000)
                        {
                            result.Append(@"\uc1\u" + unicode + "*");
                        }
                        else if (0x8000 < unicode && unicode <= 0xffff)
                        {
                            result.Append(@"\uc1\u" + (unicode - 0x10000) + "*");
                        }
                        else
                        {
                            result.Append(@"\uc1\u9633*");
                        }
                        break;
                }
            }
            return result.ToString();
        }

        /// <summary>
        ///     big5 encoding (preserve this function for failure restoration)
        /// </summary>
        /// <param name="str">string to be encoded</param>
        /// <returns>encoded string</returns>
        public static string Big5Encode(string str)
        {
            var result = "";
            var big5 = Encoding.GetEncoding(950);
            var ascii = Encoding.ASCII;
            var buf = big5.GetBytes(str);

            for (var i = 0; i < buf.Length; i++)
            {
                var c = buf[i];
                if (0x00 <= c && c < 0x20 || 0x80 <= c && c <= 0xff
                    || c == 0x5c || c == 0x7b || c == 0x7d) result += $@"\'{c:x2}";
                else result += ascii.GetChars(new[] {c})[0];
            }
            return result;
        }
    }
}