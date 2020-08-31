using System.Text;

namespace HooverUnlimited.DotNetRtfWriter
{
    /// <summary>
    ///     Summary description for RtfTableCell
    /// </summary>
    public class RtfTableCell : RtfBlockList
    {
        internal RtfTableCell(float width, int rowIndex, int colIndex, RtfTable parentTable)
            : base(true, false)
        {
            Width = width;
            Alignment = Align.None;
            AlignmentVertical = AlignVertical.Top;
            Borders = new Borders();
            MergeInfo = null;
            RowIndex = rowIndex;
            ColIndex = colIndex;
            BackgroundColor = null;
            ParentTable = parentTable;
        }

        internal bool IsBeginOfColSpan => MergeInfo?.ColIndex == 0;

        internal bool IsBeginOfRowSpan => MergeInfo?.RowIndex == 0;

        public bool IsMerged => MergeInfo != null;

        internal CellMergeInfo MergeInfo { get; set; }

        public float Width { get; set; }

        public Borders Borders { get; }

        public RtfTable ParentTable { get; }

        public ColorDescriptor BackgroundColor { get; set; }

        public Align Alignment { get; set; }

        public AlignVertical AlignmentVertical { get; set; }

        public int RowIndex { get; }

        public int ColIndex { get; }

        public float OuterLeftBorderClearance { get; set; }

        public void SetBorderColor(ColorDescriptor color)
        {
            Borders[Direction.Top].Color = color;
            Borders[Direction.Bottom].Color = color;
            Borders[Direction.Left].Color = color;
            Borders[Direction.Right].Color = color;
        }

        public override string Render()
        {
            var result = new StringBuilder();
            var align = "";

            switch (Alignment)
            {
                case Align.Left:
                    align = @"\ql";
                    break;
                case Align.Right:
                    align = @"\qr";
                    break;
                case Align.Center:
                    align = @"\qc";
                    break;
                case Align.FullyJustify:
                    align = @"\qj";
                    break;
                case Align.Distributed:
                    align = @"\qd";
                    break;
            }


            if (_blocks.Count <= 0) result.AppendLine(@"\pard\intbl");
            else
                for (var i = 0; i < _blocks.Count; i++)
                {
                    var block = _blocks[i];
                    if (_defaultCharFormat != null && block.DefaultCharFormat != null)
                        block.DefaultCharFormat.CopyFrom(_defaultCharFormat);
                    if (block.Margins[Direction.Top] < 0) block.Margins[Direction.Top] = 0;
                    if (block.Margins[Direction.Right] < 0) block.Margins[Direction.Right] = 0;
                    if (block.Margins[Direction.Bottom] < 0) block.Margins[Direction.Bottom] = 0;
                    if (block.Margins[Direction.Left] < 0) block.Margins[Direction.Left] = 0;
                    if (i == 0) block.BlockHead = @"\pard\intbl" + align;
                    else block.BlockHead = @"\par" + align;
                    block.BlockTail = "";
                    result.AppendLine(block.Render());
                }

            result.AppendLine(@"\cell");
            return result.ToString();
        }
    }
}