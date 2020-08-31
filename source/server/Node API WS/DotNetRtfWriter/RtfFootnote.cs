using System;
using System.Text;

namespace HooverUnlimited.DotNetRtfWriter
{
    /// <summary>
    ///     Summary description for RtfFootnote
    /// </summary>
    public class RtfFootnote : RtfBlockList
    {
        internal RtfFootnote(int position, int textLength)
            : base(true, false, false, true, false)
        {
            if (position < 0 || position >= textLength)
                throw new Exception("Invalid footnote position: " + position
                                    + " (text length=" + textLength + ")");
            Position = position;
        }

        internal int Position { get; }

        public override string Render()
        {
            var result = new StringBuilder();

            result.AppendLine(@"{\super\chftn}");
            result.AppendLine(@"{\footnote\plain\chftn");
            _blocks[_blocks.Count - 1].BlockTail = "}";
            result.Append(base.Render());
            result.AppendLine("}");
            return result.ToString();
        }
    }
}