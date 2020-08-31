using System;
using System.Text;

namespace HooverUnlimited.DotNetRtfWriter
{
    public class RtfSection : RtfBlock
    {
        private Align _align;
        private RtfSectionFooter _sectionFooter;

        internal RtfSection(SectionStartEnd startEnd, RtfDocument doc)
        {
            ParentDocument = doc;
            _align = Align.None;
            PageOrientation = PaperOrientation.Portrait;
            StartEnd = startEnd;
            FooterPositionFromPageBottom = 720;
            _sectionFooter = null;
            Margins = new Margins();
        }

        public override bool StartNewPage { get; set; }

        public override Align Alignment
        {
            get { return _align; }
            set { _align = value; }
        }

        public SectionStartEnd StartEnd { get; }
        public PaperOrientation PageOrientation { get; set; }
        public RtfSectionFooter SectionFooter => _sectionFooter ?? (_sectionFooter = new RtfSectionFooter(this));
        private int FooterPositionFromPageBottom { get; }

        /// <summary>
        ///     Pagewidth in twips
        /// </summary>
        public int PageWidth { get; set; }

        /// <summary>
        ///     Page height in twips
        /// </summary>
        public int PageHeight { get; set; }

        private RtfDocument ParentDocument { get; }

        public override Margins Margins { get; }

        public override RtfCharFormat DefaultCharFormat
        {
            get { throw new Exception("BlockHead is not supported for sections."); }
        }

        internal override string BlockHead
        {
            set { throw new Exception("BlockHead is not supported for sections."); }
        }

        internal override string BlockTail
        {
            set { throw new Exception("BlockHead is not supported for sections."); }
        }

        public override string Render()
        {
            var result = new StringBuilder();
            if (StartEnd == SectionStartEnd.Start)
            {
                result.AppendLine(string.Format(@"{{\sectd\ltrsect\footery{0}\sectdefaultcl\sftnbj{1} ",
                    FooterPositionFromPageBottom, AlignmentCode()));
                if (PageOrientation == PaperOrientation.Landscape)
                    result.Append(@"\lndscpsxn ");
                result.Append(string.Format(@"\pgwsxn{0}\pghsxn{1} ", PageWidth, PageHeight));
                if (!ParentDocument.Margins.Equals((object) Margins))
                    result.Append(string.Format(@"\marglsxn{0}\margrsxn{1}\margtsxn{2}\margbsxn{3} ",
                        Margins[Direction.Left], Margins[Direction.Right], Margins[Direction.Top],
                        Margins[Direction.Bottom]));
                if (SectionFooter != null)
                    result.AppendLine(SectionFooter.Render());
            }
            else
            {
                result.AppendLine(@"\sect }");
            }
            return result.ToString();
        }
    }
}