using System;
using System.Collections.Generic;
using System.Text;

namespace HooverUnlimited.DotNetRtfWriter
{
    /// <summary>
    ///     Summary description for RtfTable
    /// </summary>
    public class RtfTable : RtfBlock
    {
        private readonly float _fontSize;
        private Align _alignment;
        private readonly RtfTableCell[][] _cells;
        private readonly float _defaultCellWidth;
        private RtfCharFormat _defaultCharFormat;
        private readonly Margins _margins;
        private readonly List<RtfTableCell> _representativeList;
        private readonly float[] _rowHeight;
        private readonly bool[] _rowKeepInSamePage;
        private bool _startNewPage;

        public RtfTable(int rowCount, int colCount, float horizontalWidth, float fontSize)
        {
            _fontSize = fontSize;
            _alignment = Align.None;
            _margins = new Margins();
            RowCount = rowCount;
            ColCount = colCount;
            _representativeList = new List<RtfTableCell>();
            _startNewPage = false;
            TitleRowCount = 0;
            CellPadding = new Margins[RowCount];
            if (RowCount < 1 || ColCount < 1) throw new Exception("The number of rows or columns is less than 1.");

            HeaderBackgroundColor = null;
            RowBackgroundColor = null;
            RowAltBackgroundColor = null;

            // Set cell default width according to paper width
            _defaultCellWidth = horizontalWidth / colCount;
            _cells = new RtfTableCell[RowCount][];
            _rowHeight = new float[RowCount];
            _rowKeepInSamePage = new bool[RowCount];
            for (var i = 0; i < RowCount; i++)
            {
                _cells[i] = new RtfTableCell[ColCount];
                _rowHeight[i] = 0F;
                _rowKeepInSamePage[i] = false;
                CellPadding[i] = new Margins();
                for (var j = 0; j < ColCount; j++) _cells[i][j] = new RtfTableCell(_defaultCellWidth, i, j, this);
            }
        }

        public ColorDescriptor HeaderBackgroundColor { get; set; }
        public ColorDescriptor RowBackgroundColor { get; set; }
        public ColorDescriptor RowAltBackgroundColor { get; set; }

        public override Align Alignment
        {
            get { return _alignment; }
            set { _alignment = value; }
        }

        public override Margins Margins => _margins;

        public override RtfCharFormat DefaultCharFormat
        {
            get
            {
                if (_defaultCharFormat == null) _defaultCharFormat = new RtfCharFormat(-1, -1, 1);
                return _defaultCharFormat;
            }
        }

        public override bool StartNewPage
        {
            get { return _startNewPage; }
            set { _startNewPage = value; }
        }

        public int RowCount { get; }

        public int ColCount { get; }

        /// <summary>
        ///     Title row will be displayed in every page on which the table appears.
        /// </summary>
        public int TitleRowCount { get; set; }

        public Margins[] CellPadding { get; }

        internal override string BlockHead
        {
            set { throw new Exception("BlockHead is not supported for tables."); }
        }

        internal override string BlockTail
        {
            set { throw new Exception("BlockHead is not supported for tables."); }
        }

        public RtfTableCell Cell(int row, int col)
        {
            if (_cells[row][col].IsMerged) return _cells[row][col].MergeInfo.Representative;
            return _cells[row][col];
        }

        public void SetColWidth(int col, float width)
        {
            if (col < 0 || col >= ColCount) throw new Exception("Column index out of range");
            for (var i = 0; i < RowCount; i++)
                if (_cells[i][col].IsMerged)
                    throw new Exception("Column width cannot be set "
                                        + "because some cell in this column has been merged.");
            for (var i = 0; i < RowCount; i++) _cells[i][col].Width = width;
        }

        public void SetRowHeight(int row, float height)
        {
            if (row < 0 || row >= RowCount) throw new Exception("Row index out of range");
            for (var i = 0; i < ColCount; i++)
                if (_cells[row][i].IsMerged
                    && _cells[row][i].MergeInfo.Representative.MergeInfo.RowSpan > 1)
                    throw new Exception("Row height cannot be set "
                                        + "because some cell in this row has been merged.");
            _rowHeight[row] = height;
        }

        public void SetRowKeepInSamePage(int row, bool allow)
        {
            if (row < 0 || row >= RowCount) throw new Exception("Row index out of range");
            _rowKeepInSamePage[row] = allow;
        }

        public RtfTableCell Merge(int topRow, int leftCol, int rowSpan, int colSpan)
        {
            if (topRow < 0 || topRow >= RowCount) throw new Exception("Row index out of range");
            if (leftCol < 0 || leftCol >= ColCount) throw new Exception("Column index out of range");
            if (rowSpan < 1 || topRow + rowSpan - 1 >= RowCount) throw new Exception("Row span out of range.");
            if (colSpan < 1 || leftCol + colSpan - 1 >= ColCount) throw new Exception("Column span out of range.");
            if (colSpan == 1 && rowSpan == 1) return Cell(topRow, leftCol);
            // Check if the cell has been merged before.
            for (var i = 0; i < rowSpan; i++)
            for (var j = 0; j < colSpan; j++)
                if (_cells[topRow + i][leftCol + j].IsMerged)
                    throw new Exception("Cannot merge cells because some of the cells has been merged.");

            float width = 0;
            for (var i = 0; i < rowSpan; i++)
            for (var j = 0; j < colSpan; j++)
            {
                // Sum up the column widths in the first row.
                if (i == 0) width += _cells[topRow][leftCol + j].Width;
                // Set merge info for each cell.
                // Note: The representatives of all cells are set to the (topRow, leftCol) cell.
                _cells[topRow + i][leftCol + j].MergeInfo
                    = new CellMergeInfo(_cells[topRow][leftCol], rowSpan, colSpan, i, j);
                if (i != 0 || j != 0)
                    _cells[topRow + i][leftCol + j].TransferBlocksTo(
                        _cells[topRow + i][leftCol + j].MergeInfo.Representative);
            }
            // Set cell width in the representative cell.
            _cells[topRow][leftCol].Width = width;
            _representativeList.Add(_cells[topRow][leftCol]);
            return _cells[topRow][leftCol];
        }

        private void ValidateAllMergedCellBorders()
        {
            for (var i = 0; i < _representativeList.Count; i++) ValidateMergedCellBorders(_representativeList[i]);
        }

        private void ValidateMergedCellBorders(RtfTableCell representative)
        {
            if (!representative.IsMerged) throw new Exception("Invalid representative (cell is not merged).");
            ValidateMergedCellBorder(representative, Direction.Top);
            ValidateMergedCellBorder(representative, Direction.Right);
            ValidateMergedCellBorder(representative, Direction.Bottom);
            ValidateMergedCellBorder(representative, Direction.Left);
        }

        private void ValidateMergedCellBorder(RtfTableCell representative, Direction dir)
        {
            if (!representative.IsMerged) throw new Exception("Invalid representative (cell is not merged).");
            var stat = new Dictionary<Border, int>();
            Border majorityBorder;
            int majorityCount;
            var limit = dir == Direction.Top || dir == Direction.Bottom
                ? representative.MergeInfo.ColSpan
                : representative.MergeInfo.RowSpan;

            for (var i = 0; i < limit; i++)
            {
                int r, c;
                Border bdr;
                if (dir == Direction.Top || dir == Direction.Bottom)
                {
                    if (dir == Direction.Top) r = 0;
                    else r = representative.MergeInfo.RowSpan - 1;
                    c = i;
                }
                else
                {
                    // dir == right || left
                    if (dir == Direction.Right) c = representative.MergeInfo.ColSpan - 1;
                    else c = 0;
                    r = i;
                }
                bdr = _cells[representative.RowIndex + r][representative.ColIndex + c].Borders[dir];
                if (stat.ContainsKey(bdr)) stat[bdr] = stat[bdr] + 1;
                else stat[bdr] = 1;
            }
            majorityCount = -1;
            majorityBorder = representative.Borders[dir];
            foreach (var de in stat)
                if (de.Value > majorityCount)
                {
                    majorityCount = de.Value;
                    majorityBorder.Style = de.Key.Style;
                    majorityBorder.Width = de.Key.Width;
                    majorityBorder.Color = de.Key.Color;
                }
        }

        /// <summary>
        ///     Set ALL inner borders (color will be set to default)
        /// </summary>
        /// <param name="style"></param>
        /// <param name="width"></param>
        public void SetInnerBorder(BorderStyle style, float width)
        {
            SetInnerBorder(style, width, new ColorDescriptor(0));
        }

        /// <summary>
        ///     Sets ALL inner borders as specified
        /// </summary>
        /// <param name="style"></param>
        /// <param name="width"></param>
        /// <param name="color"></param>
        public void SetInnerBorder(BorderStyle style, float width, ColorDescriptor color)
        {
            for (var i = 0; i < RowCount; i++)
            for (var j = 0; j < ColCount; j++)
            {
                if (i == 0)
                {
                    // The first row
                    _cells[i][j].Borders[Direction.Bottom].Style = style;
                    _cells[i][j].Borders[Direction.Bottom].Width = width;
                    _cells[i][j].Borders[Direction.Bottom].Color = color;
                }
                else if (i == RowCount - 1)
                {
                    // The last row
                    _cells[i][j].Borders[Direction.Top].Style = style;
                    _cells[i][j].Borders[Direction.Top].Width = width;
                    _cells[i][j].Borders[Direction.Top].Color = color;
                }
                else
                {
                    _cells[i][j].Borders[Direction.Top].Style = style;
                    _cells[i][j].Borders[Direction.Top].Width = width;
                    _cells[i][j].Borders[Direction.Top].Color = color;
                    _cells[i][j].Borders[Direction.Bottom].Style = style;
                    _cells[i][j].Borders[Direction.Bottom].Color = color;
                    _cells[i][j].Borders[Direction.Bottom].Width = width;
                }
                if (j == 0)
                {
                    // The first column
                    _cells[i][j].Borders[Direction.Right].Style = style;
                    _cells[i][j].Borders[Direction.Right].Width = width;
                    _cells[i][j].Borders[Direction.Right].Color = color;
                }
                else if (j == ColCount - 1)
                {
                    // The last column
                    _cells[i][j].Borders[Direction.Left].Style = style;
                    _cells[i][j].Borders[Direction.Left].Width = width;
                    _cells[i][j].Borders[Direction.Left].Color = color;
                }
                else
                {
                    _cells[i][j].Borders[Direction.Right].Style = style;
                    _cells[i][j].Borders[Direction.Right].Width = width;
                    _cells[i][j].Borders[Direction.Right].Color = color;
                    _cells[i][j].Borders[Direction.Left].Style = style;
                    _cells[i][j].Borders[Direction.Left].Width = width;
                    _cells[i][j].Borders[Direction.Left].Color = color;
                }
            }
        }

        /// <summary>
        ///     Set ALL outer borders (color will be set to default)
        /// </summary>
        /// <param name="style"></param>
        /// <param name="width"></param>
        public void SetOuterBorder(BorderStyle style, float width)
        {
            SetOuterBorder(style, width, new ColorDescriptor(0));
        }

        /// <summary>
        ///     Sets ALL outer borders as specified
        /// </summary>
        /// <param name="style"></param>
        /// <param name="width"></param>
        /// <param name="color"></param>
        public void SetOuterBorder(BorderStyle style, float width, ColorDescriptor color)
        {
            for (var i = 0; i < ColCount; i++)
            {
                _cells[0][i].Borders[Direction.Top].Style = style;
                _cells[0][i].Borders[Direction.Top].Width = width;
                _cells[0][i].Borders[Direction.Top].Color = color;
                _cells[RowCount - 1][i].Borders[Direction.Bottom].Style = style;
                _cells[RowCount - 1][i].Borders[Direction.Bottom].Width = width;
                _cells[RowCount - 1][i].Borders[Direction.Bottom].Color = color;
            }
            for (var i = 0; i < RowCount; i++)
            {
                _cells[i][0].Borders[Direction.Left].Style = style;
                _cells[i][0].Borders[Direction.Left].Width = width;
                _cells[i][0].Borders[Direction.Left].Color = color;
                _cells[i][ColCount - 1].Borders[Direction.Right].Style = style;
                _cells[i][ColCount - 1].Borders[Direction.Right].Width = width;
                _cells[i][ColCount - 1].Borders[Direction.Right].Color = color;
            }
        }

        public void SetHeaderBorderColors(ColorDescriptor colorOuter, ColorDescriptor colorInner)
        {
            for (var j = 0; j < ColCount; j++)
            {
                _cells[0][j].Borders[Direction.Top].Color = colorOuter;
                _cells[0][j].Borders[Direction.Bottom].Color = colorInner;
                if (j == 0)
                {
                    // The first column
                    _cells[0][j].Borders[Direction.Right].Color = colorInner;
                    _cells[0][j].Borders[Direction.Left].Color = colorOuter;
                }
                else if (j == ColCount - 1)
                {
                    // The last column
                    _cells[0][j].Borders[Direction.Right].Color = colorOuter;
                    _cells[0][j].Borders[Direction.Left].Color = colorInner;
                }
                else
                {
                    _cells[0][j].Borders[Direction.Right].Color = colorInner;
                    _cells[0][j].Borders[Direction.Left].Color = colorInner;
                }
            }
        }

        public override string Render()
        {
            var result = new StringBuilder();

            // validate borders for each cell.
            // (borders may be changed because of cell merging)
            ValidateAllMergedCellBorders();
            // set default char format for each cell.
            if (_defaultCharFormat != null)
                for (var i = 0; i < RowCount; i++)
                for (var j = 0; j < ColCount; j++)
                {
                    if (_cells[i][j].IsMerged
                        && _cells[i][j].MergeInfo.Representative != _cells[i][j]) continue;
                    if (_cells[i][j].DefaultCharFormat != null)
                        _cells[i][j].DefaultCharFormat.CopyFrom(_defaultCharFormat);
                }

            var topMargin = _margins[Direction.Top] - _fontSize;

            if (_startNewPage || topMargin > 0)
            {
                result.Append(@"{\pard");
                if (_startNewPage) result.Append(@"\pagebb");
                if (_margins[Direction.Top] >= 0) result.Append(@"\sl-" + RtfUtility.Pt2Twip(topMargin));
                else result.Append(@"\sl-1");
                result.AppendLine(@"\slmult0\par}");
            }

            int colAcc;

            for (var i = 0; i < RowCount; i++)
            {
                colAcc = 0;
                result.Append(@"{\trowd\trgaph" +
                              string.Format(@"\trpaddl{0}\trpaddt{1}\trpaddr{2}\trpaddb{3}",
                                  RtfUtility.Pt2Twip(CellPadding[i][Direction.Left]),
                                  RtfUtility.Pt2Twip(CellPadding[i][Direction.Top]),
                                  RtfUtility.Pt2Twip(CellPadding[i][Direction.Right]),
                                  RtfUtility.Pt2Twip(CellPadding[i][Direction.Bottom])));
                switch (_alignment)
                {
                    case Align.Left:
                        result.Append(@"\trql");
                        break;
                    case Align.Right:
                        result.Append(@"\trqr");
                        break;
                    case Align.Center:
                        result.Append(@"\trqc");
                        break;
                    case Align.FullyJustify:
                        result.Append(@"\trqj");
                        break;
                }
                result.AppendLine();
                if (_margins[Direction.Left] >= 0)
                {
                    result.AppendLine(@"\trleft" + RtfUtility.Pt2Twip(_margins[Direction.Left]));
                    colAcc = RtfUtility.Pt2Twip(_margins[Direction.Left]);
                }
                if (_rowHeight[i] > 0) result.Append(@"\trrh" + RtfUtility.Pt2Twip(_rowHeight[i]));
                if (_rowKeepInSamePage[i]) result.Append(@"\trkeep");
                if (i < TitleRowCount) result.Append(@"\trhdr");
                result.AppendLine();

                for (var j = 0; j < ColCount; j++)
                {
                    if (_cells[i][j].IsMerged && !_cells[i][j].IsBeginOfColSpan) continue;
                    var nextCellLeftBorderClearance = j < ColCount - 1 ? Cell(i, j + 1).OuterLeftBorderClearance : 0;
                    colAcc += RtfUtility.Pt2Twip(Cell(i, j).Width);
                    var colRightPos = colAcc;
                    if (nextCellLeftBorderClearance < 0)
                    {
                        colRightPos += RtfUtility.Pt2Twip(nextCellLeftBorderClearance);
                        colRightPos = colRightPos == 0 ? 1 : colRightPos;
                    }

                    // Borders
                    for (var d = Direction.Top; d <= Direction.Left; d++)
                    {
                        var bdr = Cell(i, j).Borders[d];
                        if (bdr.Style != BorderStyle.None)
                        {
                            result.Append(@"\clbrdr");
                            switch (d)
                            {
                                case Direction.Top:
                                    result.Append("t");
                                    break;
                                case Direction.Right:
                                    result.Append("r");
                                    break;
                                case Direction.Bottom:
                                    result.Append("b");
                                    break;
                                case Direction.Left:
                                    result.Append("l");
                                    break;
                            }
                            result.Append(@"\brdrw" + RtfUtility.Pt2Twip(bdr.Width));
                            result.Append(@"\brdr");
                            switch (bdr.Style)
                            {
                                case BorderStyle.Single:
                                    result.Append("s");
                                    break;
                                case BorderStyle.Dotted:
                                    result.Append("dot");
                                    break;
                                case BorderStyle.Dashed:
                                    result.Append("dash");
                                    break;
                                case BorderStyle.Double:
                                    result.Append("db");
                                    break;
                                default:
                                    throw new Exception("Unkown border style");
                            }
                            result.Append(@"\brdrcf" + bdr.Color.Value);
                        }
                    }

                    // Cell background color
                    if (Cell(i, j).BackgroundColor != null)
                        result.Append($@"\clcbpat{Cell(i, j).BackgroundColor.Value}"); // cell.BackGroundColor overrides others
                    else if (i == 0 && HeaderBackgroundColor != null)
                        result.Append($@"\clcbpat{HeaderBackgroundColor.Value}"); // header
                    else if (RowBackgroundColor != null && (RowAltBackgroundColor == null || i % 2 == 0))
                        result.Append($@"\clcbpat{RowBackgroundColor.Value}"); // row colour
                    else if (RowBackgroundColor != null && RowAltBackgroundColor != null && i % 2 != 0)
                        result.Append($@"\clcbpat{RowAltBackgroundColor.Value}"); // alt row colour

                    if (_cells[i][j].IsMerged && _cells[i][j].MergeInfo.RowSpan > 1)
                        result.Append(_cells[i][j].IsBeginOfRowSpan ? @"\clvmgf" : @"\clvmrg");
                    switch (_cells[i][j].AlignmentVertical)
                    {
                        case AlignVertical.Top:
                            result.Append(@"\clvertalt");
                            break;
                        case AlignVertical.Middle:
                            result.Append(@"\clvertalc");
                            break;
                        case AlignVertical.Bottom:
                            result.Append(@"\clvertalb");
                            break;
                    }
                    result.AppendLine(@"\cellx" + colRightPos);
                }

                for (var j = 0; j < ColCount; j++)
                    if (!_cells[i][j].IsMerged || _cells[i][j].IsBeginOfColSpan) result.Append(_cells[i][j].Render());

                result.AppendLine(@"\row}");
            }

            if (_margins[Direction.Bottom] >= 0)
                result.Append(@"\sl-" + RtfUtility.Pt2Twip(_margins[Direction.Bottom]) + @"\slmult");

            return result.ToString();
        }
    }
}