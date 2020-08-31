using System;
using System.Collections.Generic;
using System.Text;

namespace HooverUnlimited.DotNetRtfWriter
{
    /// <summary>
    ///     Summary description for RtfCharFormat
    /// </summary>
    public class RtfCharFormat
    {
        private static readonly IDictionary<FontStyleFlag, string> _fontStyleMap = new Dictionary<FontStyleFlag, string>
        {
            {FontStyleFlag.Bold, "b"},
            {FontStyleFlag.Italic, "i"},
            {FontStyleFlag.Scaps, "scaps"},
            {FontStyleFlag.Strike, "strike"},
            {FontStyleFlag.Sub, "sub"},
            {FontStyleFlag.Super, "super"},
            {FontStyleFlag.Underline, "ul"}
        };


        internal RtfCharFormat(int begin, int end, int textLength)
        {
            // Note:
            // In the condition that ``_begin == _end == -1'',
            // the character formatting is applied to the whole paragraph.
            Begin = -1;
            End = -1;
            Font = null; // do not specify font (use default one)
            AnsiFont = null; // do not specify font (use default one)
            FontSize = -1; // do not specify font size (use default one)
            FontStyle = new FontStyle();
            BgColor = null;
            FgColor = null;
            TwoInOneStyle = TwoInOneStyle.NotEnabled;
            Bookmark = "";
            SetRange(begin, end, textLength);
        }

        internal int Begin { get; private set; }

        internal int End { get; private set; }

        public string Bookmark { get; set; }

        public string LocalHyperlink { get; set; }

        public string LocalHyperlinkTip { get; set; }

        public FontDescriptor Font { get; set; }

        public FontDescriptor AnsiFont { get; set; }

        public float FontSize { get; set; }

        public FontStyle FontStyle { get; private set; }

        public ColorDescriptor FgColor { get; set; }

        public ColorDescriptor BgColor { get; set; }

        public TwoInOneStyle TwoInOneStyle { get; set; }

        internal void CopyFrom(RtfCharFormat src)
        {
            if (src == null) return;
            Begin = src.Begin;
            End = src.End;
            if (Font == null && src.Font != null) Font = new FontDescriptor(src.Font.Value);
            if (AnsiFont == null && src.AnsiFont != null) AnsiFont = new FontDescriptor(src.AnsiFont.Value);
            if (FontSize < 0 && src.FontSize >= 0) FontSize = src.FontSize;
            if (FontStyle.IsEmpty && !src.FontStyle.IsEmpty) FontStyle = new FontStyle(src.FontStyle);
            if (BgColor == null && src.BgColor != null) BgColor = new ColorDescriptor(src.BgColor.Value);
            if (FgColor == null && src.FgColor != null) FgColor = new ColorDescriptor(src.FgColor.Value);
        }

        private void SetRange(int begin, int end, int textLength)
        {
            if (begin > end) throw new Exception("Invalid range: (" + begin + ", " + end + ")");
            if (begin < 0 || end < 0)
                if (begin != -1 || end != -1) throw new Exception("Invalid range: (" + begin + ", " + end + ")");
            if (end >= textLength) throw new Exception("Range ending out of range: " + end);
            Begin = begin;
            End = end;
        }

        internal string RenderHead()
        {
            var result = new StringBuilder("{");

            if (!string.IsNullOrEmpty(LocalHyperlink))
            {
                result.Append(@"{\field{\*\fldinst HYPERLINK \\l ");
                result.Append("\"" + LocalHyperlink + "\"");
                if (!string.IsNullOrEmpty(LocalHyperlinkTip)) result.Append(" \\\\o \"" + LocalHyperlinkTip + "\"");
                result.Append(@"}{\fldrslt{");
            }


            if (Font != null || AnsiFont != null)
                if (Font == null) result.Append(@"\f" + AnsiFont.Value);
                else if (AnsiFont == null) result.Append(@"\f" + Font.Value);
                else
                    result.Append(@"\loch\af" + AnsiFont.Value + @"\hich\af" + AnsiFont.Value
                                  + @"\dbch\af" + Font.Value);
            if (FontSize > 0) result.Append(@"\fs" + RtfUtility.Pt2HalfPt(FontSize));
            if (FgColor != null) result.Append(@"\cf" + FgColor.Value);
            if (BgColor != null) result.Append(@"\chshdng0\chcbpat" + BgColor.Value + @"\cb" + BgColor.Value);

            foreach (var fontStyle in _fontStyleMap)
                if (FontStyle.ContainsStyleAdd(fontStyle.Key)) result.Append(@"\" + fontStyle.Value);
                else if (FontStyle.ContainsStyleRemove(fontStyle.Key)) result.Append(@"\" + fontStyle.Value + "0");
            if (TwoInOneStyle != TwoInOneStyle.NotEnabled)
            {
                result.Append(@"\twoinone");
                switch (TwoInOneStyle)
                {
                    case TwoInOneStyle.None:
                        result.Append("0");
                        break;
                    case TwoInOneStyle.Parentheses:
                        result.Append("1");
                        break;
                    case TwoInOneStyle.SquareBrackets:
                        result.Append("2");
                        break;
                    case TwoInOneStyle.AngledBrackets:
                        result.Append("3");
                        break;
                    case TwoInOneStyle.Braces:
                        result.Append("4");
                        break;
                }
            }

            if (result.ToString().Contains(@"\")) result.Append(" ");

            if (!string.IsNullOrEmpty(Bookmark)) result.Append(@"{\*\bkmkstart " + Bookmark + "}");

            return result.ToString();
        }

        internal string RenderTail()
        {
            var result = new StringBuilder("");

            if (!string.IsNullOrEmpty(Bookmark)) result.Append(@"{\*\bkmkend " + Bookmark + "}");

            if (!string.IsNullOrEmpty(LocalHyperlink)) result.Append(@"}}}");

            result.Append("}");
            return result.ToString();
        }
    }
}