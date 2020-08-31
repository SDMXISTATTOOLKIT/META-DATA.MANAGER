using System;
using System.Collections;
using System.Text;

namespace HooverUnlimited.DotNetRtfWriter
{
    /// <summary>
    ///     Summary description for RtfHeaderFooter
    /// </summary>
    public class RtfHeaderFooter : RtfBlockList
    {
        private Hashtable _magicWords;
        private readonly HeaderFooterType _type;

        internal RtfHeaderFooter(HeaderFooterType type)
            : base(true, false, true, true, false)
        {
            _magicWords = new Hashtable();
            _type = type;
        }

        public override string Render()
        {
            var result = new StringBuilder();

            if (_type == HeaderFooterType.Header) result.AppendLine(@"{\header");
            else if (_type == HeaderFooterType.Footer) result.AppendLine(@"{\footer");
            else throw new Exception("Invalid HeaderFooterType");
            result.AppendLine();
            for (var i = 0; i < _blocks.Count; i++)
            {
                if (_defaultCharFormat != null
                    && _blocks[i].DefaultCharFormat != null) _blocks[i].DefaultCharFormat.CopyFrom(_defaultCharFormat);
                result.AppendLine(_blocks[i].Render());
            }
            result.AppendLine("}");
            return result.ToString();
        }
    }
}