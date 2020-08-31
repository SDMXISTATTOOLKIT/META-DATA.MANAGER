using System;
using System.Drawing;

namespace HooverUnlimited.DotNetRtfWriter
{
    /// <summary>
    ///     Horizontal alignment.
    /// </summary>
    public enum Align
    {
        None = 0,
        Left,
        Right,
        Center,
        FullyJustify,
        Distributed
    }

    /// <summary>
    ///     Vertical alignment.
    /// </summary>
    public enum AlignVertical
    {
        Top = 1,
        Middle,
        Bottom
    }

    /// <summary>
    ///     Top, bottom, left, and right.
    /// </summary>
    public enum Direction
    {
        Top = 0,
        Right,
        Bottom,
        Left
    }

    /// <summary>
    ///     Types of paper sizes.
    /// </summary>
    public enum PaperSize
    {
        Letter = 1,
        A4,
        A3
    }

    /// <summary>
    ///     Types of paper orientaion.
    /// </summary>
    public enum PaperOrientation
    {
        Portrait = 1,
        Landscape
    }

    /// <summary>
    ///     Types of locality.
    /// </summary>
    public enum Lcid
    {
        TraditionalChinese = 1028,
        English = 1033,
        French = 1036,
        German = 1031,
        Italian = 1040,
        Japanese = 1041,
        Korean = 1042,
        SimplifiedChinese = 2052,
        Spanish = 3082
    }

    /// <summary>
    ///     Types of font styles.
    /// </summary>
    public enum FontStyleFlag
    {
        Bold = 0x01,
        Italic = 0x02,
        Underline = 0x04,
        Super = 0x08,
        Sub = 0x10,
        Scaps = 0x20,
        Strike = 0x40
    }

    /// <summary>
    ///     Types of image files.
    /// </summary>
    public enum ImageFileType
    {
        Jpg = 1,
        Gif,
        Png
    }

    /// <summary>
    ///     Types of border styles.
    /// </summary>
    public enum BorderStyle
    {
        None = 0,
        Single,
        Dotted,
        Dashed,
        Double
    }

    /// <summary>
    ///     Types of two-in-one style quoting symbols.
    ///     (For Far East character formatting.)
    /// </summary>
    public enum TwoInOneStyle
    {
        NotEnabled = 0,
        None,
        Parentheses,
        SquareBrackets,
        AngledBrackets,
        Braces
    }

    /// <summary>
    ///     Internal use only.
    ///     Specify whether a RtfHeaderFooter object is header or footer.
    /// </summary>
    internal enum HeaderFooterType
    {
        Header = 1,
        Footer
    }

    /// <summary>
    ///     Specify whether an RtfSection is of type Start or End
    /// </summary>
    public enum SectionStartEnd
    {
        Start,
        End
    }

    /// <summary>
    ///     Container for a set of font styles. It is helpful when more than
    ///     one of the font styles (e.g., both bold and italic) are associated with
    ///     some characters.
    /// </summary>
    public class FontStyle
    {
        private uint styleAdd, styleRemove;

        /// <summary>
        ///     Internal use only.
        ///     Constructor that initializes as containing none of the styles.
        /// </summary>
        internal FontStyle()
        {
            styleAdd = styleRemove = 0;
        }

        /// <summary>
        ///     Internal use only.
        ///     Copy constructor.
        /// </summary>
        /// <param name="src"></param>
        internal FontStyle(FontStyle src)
        {
            styleAdd = src.styleAdd;
            styleRemove = src.styleRemove;
        }

        /// <summary>
        ///     Indicate whether the set is empty.
        /// </summary>
        public bool IsEmpty => styleAdd == 0 && styleRemove == 0;

        /// <summary>
        ///     Add a font style to the set. Adding a font style
        ///     that is already in the set has no effect.
        /// </summary>
        /// <param name="sty">Font style to be added.</param>
        public void AddStyle(FontStyleFlag sty)
        {
            styleAdd |= (uint) sty;
            styleRemove &= ~(uint) sty;
        }

        /// <summary>
        ///     Remove a font style from the set. Removing a font style
        ///     that is already not in the set has no effect.
        /// </summary>
        /// <param name="sty">Font style to be removed.</param>
        public void RemoveStyle(FontStyleFlag sty)
        {
            styleAdd &= ~(uint) sty;
            styleRemove |= (uint) sty;
        }

        /// <summary>
        ///     Test whether a font style is in the set.
        /// </summary>
        /// <param name="sty">Font style to be tested.</param>
        /// <returns>True if the font style is in the set; false otherwise.</returns>
        public bool ContainsStyleAdd(FontStyleFlag sty)
        {
            if ((styleAdd & (uint) sty) > 0) return true;
            return false;
        }

        public bool ContainsStyleRemove(FontStyleFlag sty)
        {
            if ((styleRemove & (uint) sty) > 0) return true;
            return false;
        }
    }

    /// <summary>
    ///     A descriptor for a font. Fonts are assigned as descriptors,
    ///     not names (e.g., Times New Roman).
    /// </summary>
    public class FontDescriptor
    {
        /// <summary>
        ///     Internal use only.
        ///     Constructor.
        /// </summary>
        /// <param name="descr">Internal representative integer of the font.</param>
        internal FontDescriptor(int descr)
        {
            Value = descr;
        }

        /// <summary>
        ///     Internal use only.
        ///     Get internal representative integer of the font.
        /// </summary>
        internal int Value { get; }
    }

    /// <summary>
    ///     A descriptor for a color. Colors are assigned as descriptors,
    ///     not names (e.g., #ff0000, or RED).
    /// </summary>
    public class ColorDescriptor
    {
        /// <summary>
        ///     Internal use only.
        ///     Constructor.
        /// </summary>
        /// <param name="descr">Internal representative integer for the color.</param>
        internal ColorDescriptor(int descr)
        {
            Value = descr;
        }

        /// <summary>
        ///     Internal use only.
        ///     Get internal representative integer for the color.
        /// </summary>
        internal int Value { get; }
    }

    /// <summary>
    ///     Margin settings for a content block, containing four margin values.
    /// </summary>
    public class Margins
    {
        private readonly float[] margins;

        /// <summary>
        ///     Internal use only.
        ///     Constructor that initializes all four margins as -1.
        /// </summary>
        internal Margins()
        {
            margins = new float[4];
        }

        /// <summary>
        ///     Internal use only.
        ///     Constructor that gives initial values for all four margins.
        /// </summary>
        /// <param name="t">Top margin size in points.</param>
        /// <param name="r">Right margin size in points.</param>
        /// <param name="b">Bottom margin size in points.</param>
        /// <param name="l">Left margin size in points.</param>
        internal Margins(float t, float r, float b, float l)
            : this()
        {
            margins[(int) Direction.Top] = t;
            margins[(int) Direction.Right] = r;
            margins[(int) Direction.Bottom] = b;
            margins[(int) Direction.Left] = l;
        }

        /// <summary>
        ///     Indexer that allows getting and setting of one of the four margin values.
        /// </summary>
        /// <param name="d">
        ///     The direction at which the margin locates. One of top,
        ///     right, bottom, left.
        /// </param>
        /// <returns>Margin size in points.</returns>
        public float this[Direction d]
        {
            get
            {
                var i = (int) d;
                if (i >= 0 && i < margins.Length) return margins[i];
                throw new Exception("Not a valid direction.");
            }
            set
            {
                var i = (int) d;
                if (i >= 0 && i < margins.Length) margins[i] = value;
                else throw new Exception("Not a valid direction.");
            }
        }

        public bool Equals(Margins margins)
        {
            return margins.margins[(int) Direction.Bottom] == this.margins[(int) Direction.Bottom] &&
                   margins.margins[(int) Direction.Left] == this.margins[(int) Direction.Left] &&
                   margins.margins[(int) Direction.Right] == this.margins[(int) Direction.Right] &&
                   margins.margins[(int) Direction.Top] == this.margins[(int) Direction.Top];
        }
    }

    /// <summary>
    ///     Border attributes for table cells.
    /// </summary>
    public class Border
    {
        /// <summary>
        ///     Internal use only.
        ///     Default constructor that sets border style to None.
        /// </summary>
        internal Border()
        {
            Style = BorderStyle.None;
            Width = 0.5F;
            Color = new ColorDescriptor(0);
        }

        /// <summary>
        ///     Get or set the border style.
        /// </summary>
        public BorderStyle Style { get; set; }

        /// <summary>
        ///     Get or set the width of the border line.
        /// </summary>
        public float Width { get; set; }

        /// <summary>
        ///     Get or set the border color.
        /// </summary>
        public ColorDescriptor Color { get; set; }

        /// <summary>
        ///     Indirect use only.
        ///     See if two borders are equal.
        /// </summary>
        /// <param name="obj">Border object to be compared with.</param>
        /// <returns>True if the two borders are equal; false otherwise.</returns>
        public override bool Equals(object obj)
        {
            if (obj == null) return false;
            var bdr = (Border) obj;
            return Style == bdr.Style && Width == bdr.Width;
        }

        /// <summary>
        ///     Indirect use only.
        ///     Differentiate borders.is it 
        /// </summary>
        /// <returns>A hash code representing different sets of border attributes.</returns>
        public override int GetHashCode()
        {
            return Width.GetHashCode() * 1000 + (int) Style;
        }
    }

    /// <summary>
    ///     Border settings for a table cell, containing four sets of border attributes.
    /// </summary>
    public class Borders
    {
        private readonly Border[] _borders;

        /// <summary>
        ///     Internal use only.
        ///     Default constructor that sets all border style to None.
        /// </summary>
        internal Borders()
        {
            _borders = new Border[4];
            for (var i = 0; i < _borders.Length; i++) _borders[i] = new Border();
        }

        /// <summary>
        ///     Indexer that gets border attributes for borders in any of the four
        ///     direction.
        /// </summary>
        /// <param name="d">
        ///     The direction at which the border locates. One of top
        ///     right, bottom, left.
        /// </param>
        /// <returns>The border attributes.</returns>
        public Border this[Direction d]
        {
            get
            {
                var i = (int) d;
                if (i >= 0 && i < _borders.Length) return _borders[i];
                throw new Exception("Not a valid direction.");
            }
        }
    }

    /// <summary>
    ///     Colors to be applied in the document. Note that objects of this class
    ///     cannot be assigned to document directly. Instead, they work through
    ///     ColorDescriptor objects.
    /// </summary>
    public class RtfColor
    {
        private readonly int _color;

        /// <summary>
        ///     Default constructor that initialized as black color.
        /// </summary>
        public RtfColor()
        {
            _color = 0;
        }

        /// <summary>
        ///     Constructor that initializes using RGB values.
        /// </summary>
        /// <param name="red">Red component of the color.</param>
        /// <param name="green">Green component of the color.</param>
        /// <param name="blue">Blue component of the color.</param>
        public RtfColor(byte red, byte green, byte blue)
        {
            _color = (red << 16) + (green << 8) + blue;
        }

        /// <summary>
        ///     Constructor that initializes using a string representation of
        ///     a hexadecimal value.
        /// </summary>
        /// <param name="hex">
        ///     String representation of a hexadecimal value, such
        ///     as "FF0000" or "00AB12".
        /// </param>
        public RtfColor(string hex)
        {
            if (hex == null || hex.Length != 6) throw new Exception("String parameter hex should be of length 6.");
            hex = hex.ToUpper();
            for (var i = 0; i < hex.Length; i++)
                if (!char.IsDigit(hex[i]) && (hex[i] < 'A' || hex[i] > 'F'))
                    throw new Exception("Characters of parameter hex should be in [0-9,A-F,a-f]");
            var red = Convert.ToByte(hex.Substring(0, 2), 16);
            var green = Convert.ToByte(hex.Substring(2, 2), 16);
            var blue = Convert.ToByte(hex.Substring(4, 2), 16);
            _color = (red << 16) + (green << 8) + blue;
        }

        /// <summary>
        ///     Constructor that initializes using System Drawing color
        /// </summary>
        /// <param name="color">System Drawing Color</param>
        public RtfColor(Color color)
        {
            _color = (color.R << 16) + (color.G << 8) + color.B;
        }

        /// <summary>
        ///     Get or set the red component of the color.
        /// </summary>
        internal string Red => ((_color >> 16) % 256).ToString();

        /// <summary>
        ///     Get or set the green component of the color.
        /// </summary>
        internal string Green => ((_color >> 8) % 256).ToString();

        /// <summary>
        ///     Get or set the blue component of the color.
        /// </summary>
        internal string Blue => (_color % 256).ToString();

        /// <summary>
        ///     Indirect use only.
        ///     See if two colors are the same.
        /// </summary>
        /// <param name="obj">Color object to be compared with.</param>
        /// <returns>True if two colors are identical; false otherwise.</returns>
        public override bool Equals(object obj)
        {
            var b = (RtfColor) obj;
            return b._color == _color;
        }

        /// <summary>
        ///     Indirect use only.
        ///     Differentiate colors.
        /// </summary>
        /// <returns>A hash code used to differentiate colors.</returns>
        public override int GetHashCode()
        {
            return _color;
        }
    }

    /// <summary>
    ///     Internal use only.
    ///     A collection of cell merging information associated with each table cell being merged.
    /// </summary>
    internal class CellMergeInfo
    {
        /// <summary>
        ///     Internal use only.
        ///     Constructor.
        /// </summary>
        /// <param name="representative">
        ///     Representative cell for the cell.
        ///     (Usually the one located at top left corner of the group of merged cell.)
        /// </param>
        /// <param name="rowSpan">Number of rows that this group of merged cells spans.</param>
        /// <param name="colSpan">Number of columns that this group of merged cells spans.</param>
        /// <param name="rowIndex">
        ///     The relative row index of the cell within this group
        ///     of merged cells.
        /// </param>
        /// <param name="colIndex">
        ///     The relative column index of the cell within this group
        ///     of merged cells.
        /// </param>
        internal CellMergeInfo(RtfTableCell representative, int rowSpan, int colSpan,
            int rowIndex, int colIndex)
        {
            Representative = representative;
            RowSpan = rowSpan;
            ColSpan = colSpan;
            RowIndex = rowIndex;
            ColIndex = colIndex;
        }

        /// <summary>
        ///     Get the number of rows that this group of merged cells spans.
        /// </summary>
        internal int RowSpan { get; }

        /// <summary>
        ///     Get the number of columns that this group of merged cells spans.
        /// </summary>
        internal int ColSpan { get; }

        /// <summary>
        ///     Get the relative row index of the cell within this group of merged cells.
        /// </summary>
        internal int RowIndex { get; }

        /// <summary>
        ///     Get the relative column index of the cell within this group of merged cells.
        /// </summary>
        internal int ColIndex { get; }

        /// <summary>
        ///     Get the representative cell of the cell.
        /// </summary>
        internal RtfTableCell Representative { get; }
    }

    /// <summary>
    ///     Internal use only.
    ///     Constant values for default document settings.
    /// </summary>
    internal static class DefaultValue
    {
        public static int FontSize = 12;
        public static string Font = "Times New Roman";
        public static float MarginLarge = 50; // used for long edges of A4 (was 90)
        public static float MarginSmall = 50; // used for short edges of A4 (was 72)
    }
}