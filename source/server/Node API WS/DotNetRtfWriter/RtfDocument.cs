using System.Collections.Generic;
using System.Drawing;
using System.IO;
using System.Text;

namespace HooverUnlimited.DotNetRtfWriter
{
    /// <summary>
    ///     Summary description for RtfDocument
    /// </summary>
    public class RtfDocument : RtfBlockList
    {
        private readonly List<RtfColor> _colorTable;
        private readonly List<string> _fontTable;
        private RtfHeaderFooter _footer;
        private RtfHeaderFooter _header;
        private readonly Lcid _lcid;
        private readonly PaperOrientation _orientation;
        private readonly PaperSize _paper;

        public RtfDocument(PaperSize paper, PaperOrientation orientation, Lcid lcid)
        {
            _paper = paper;
            _orientation = orientation;
            Margins = new Margins();
            if (_orientation == PaperOrientation.Portrait)
            {
                Margins[Direction.Top] = DefaultValue.MarginSmall;
                Margins[Direction.Right] = DefaultValue.MarginLarge;
                Margins[Direction.Bottom] = DefaultValue.MarginSmall;
                Margins[Direction.Left] = DefaultValue.MarginLarge;
            }
            else
            {
                // landscape
                Margins[Direction.Top] = DefaultValue.MarginLarge;
                Margins[Direction.Right] = DefaultValue.MarginSmall;
                Margins[Direction.Bottom] = DefaultValue.MarginLarge;
                Margins[Direction.Left] = DefaultValue.MarginSmall;
            }
            _lcid = lcid;
            _fontTable = new List<string>
            {
                DefaultValue.Font // default font
            };
            _colorTable = new List<RtfColor>
            {
                new RtfColor() // default color
            };
            _header = null;
            _footer = null;
        }

        public Margins Margins { get; set; }

        public RtfHeaderFooter Header
        {
            get
            {
                if (_header == null) _header = new RtfHeaderFooter(HeaderFooterType.Header);
                return _header;
            }
        }

        public RtfHeaderFooter Footer
        {
            get
            {
                if (_footer == null) _footer = new RtfHeaderFooter(HeaderFooterType.Footer);
                return _footer;
            }
        }

        public ColorDescriptor DefaultColor => new ColorDescriptor(0);

        public FontDescriptor DefaultFont => new FontDescriptor(0);

        public void SetDefaultFont(string fontName)
        {
            _fontTable[0] = fontName;
        }

        public FontDescriptor CreateFont(string fontName)
        {
            if (_fontTable.Contains(fontName)) return new FontDescriptor(_fontTable.IndexOf(fontName));
            _fontTable.Add(fontName);
            return new FontDescriptor(_fontTable.IndexOf(fontName));
        }

        public ColorDescriptor CreateColor(RtfColor color)
        {
            if (_colorTable.Contains(color)) return new ColorDescriptor(_colorTable.IndexOf(color));
            _colorTable.Add(color);
            return new ColorDescriptor(_colorTable.IndexOf(color));
        }

        public ColorDescriptor CreateColor(Color color)
        {
            var rtfColor = new RtfColor(color.R, color.G, color.B);
            return CreateColor(rtfColor);
        }

        public RtfTable AddTable(int rowCount, int colCount, float fontSize)
        {
            var horizontalWidth = RtfUtility.PaperWidthInPt(_paper, _orientation)
                                    - Margins[Direction.Left] - Margins[Direction.Right]; 
            return AddTable(rowCount, colCount, horizontalWidth, fontSize);
        }

        public override string Render()
        {
            var rtf = new StringBuilder();

            // ---------------------------------------------------
            // Prologue
            // ---------------------------------------------------
            rtf.AppendLine(@"{\rtf1\ansi\deff0");
            rtf.AppendLine();

            // ---------------------------------------------------
            // Insert font table
            // ---------------------------------------------------
            rtf.AppendLine(@"{\fonttbl");
            for (var i = 0; i < _fontTable.Count; i++)
                rtf.AppendLine(@"{\f" + i + " " + RtfUtility.UnicodeEncode(_fontTable[i]) + ";}");
            rtf.AppendLine("}");
            rtf.AppendLine();

            // ---------------------------------------------------
            // Insert color table
            // ---------------------------------------------------
            rtf.AppendLine(@"{\colortbl");
            rtf.AppendLine(";");
            for (var i = 1; i < _colorTable.Count; i++)
            {
                var c = _colorTable[i];
                rtf.AppendLine(@"\red" + c.Red + @"\green" + c.Green + @"\blue" + c.Blue + ";");
            }
            rtf.AppendLine("}");
            rtf.AppendLine();

            // ---------------------------------------------------
            // Preliminary
            // ---------------------------------------------------
            rtf.AppendLine(@"\deflang" + (int) _lcid + @"\plain\fs"
                           + RtfUtility.Pt2HalfPt(DefaultValue.FontSize) + @"\widowctrl\hyphauto\ftnbj");
            // page size
            rtf.AppendLine(@"\paperw" + RtfUtility.PaperWidthInTwip(_paper, _orientation)
                           + @"\paperh" + RtfUtility.PaperHeightInTwip(_paper, _orientation));
            // page margin
            rtf.AppendLine(@"\margt" + RtfUtility.Pt2Twip(Margins[Direction.Top]));
            rtf.AppendLine(@"\margr" + RtfUtility.Pt2Twip(Margins[Direction.Right]));
            rtf.AppendLine(@"\margb" + RtfUtility.Pt2Twip(Margins[Direction.Bottom]));
            rtf.AppendLine(@"\margl" + RtfUtility.Pt2Twip(Margins[Direction.Left]));
            // orientation
            if (_orientation == PaperOrientation.Landscape) rtf.AppendLine(@"\landscape");
            // header/footer
            if (_header != null) rtf.Append(_header.Render());
            if (_footer != null) rtf.Append(_footer.Render());
            rtf.AppendLine();

            // ---------------------------------------------------
            // Document body
            // ---------------------------------------------------
            rtf.Append(base.Render());

            // ---------------------------------------------------
            // Ending
            // ---------------------------------------------------
            rtf.AppendLine("}");

            return rtf.ToString();
        }

        public void Save(string fname)
        {
            var w = new StreamWriter(fname);
            w.Write(Render());
            w.Close();
        }
    }
}