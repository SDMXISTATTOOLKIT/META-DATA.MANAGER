using System;
using System.Collections.Generic;
using System.IO;
using System.Text;

namespace HooverUnlimited.DotNetRtfWriter
{
    /// <summary>
    ///     A container for an array of content blocks. For example, a footnote
    ///     is a RtfBlockList because it may contains a paragraph and an image.
    /// </summary>
    public class RtfBlockList : RtfRenderable
    {
        private readonly bool _allowControlWord;
        private readonly bool _allowFootnote;
        private readonly bool _allowImage;

        private readonly bool _allowParagraph;
        private readonly bool _allowTable;

        /// <summary>
        ///     Storage for array of content blocks.
        /// </summary>
        protected List<RtfBlock> _blocks;

        /// <summary>
        ///     Default character formats within this container.
        /// </summary>
        protected RtfCharFormat _defaultCharFormat;

        /// <summary>
        ///     Internal use only.
        ///     Default constructor that allows containing all types of content blocks.
        /// </summary>
        internal RtfBlockList()
            : this(true, true, true, true, true)
        {
        }

        /// <summary>
        ///     Internal use only.
        ///     Constructor specifying allowed content blocks to be contained.
        /// </summary>
        /// <param name="allowParagraph">Whether an RtfParagraph is allowed.</param>
        /// <param name="allowTable">Whether RtfTable is allowed.</param>
        internal RtfBlockList(bool allowParagraph, bool allowTable)
            : this(allowParagraph, true, true, true, allowTable)
        {
        }

        /// <summary>
        ///     Internal use only.
        ///     Constructor specifying allowed content blocks to be contained.
        /// </summary>
        /// <param name="allowParagraph">Whether an RtfParagraph is allowed.</param>
        /// <param name="allowFootnote">Whether an RtfFootnote is allowed in contained RtfParagraph.</param>
        /// <param name="allowControlWord">
        ///     Whether an field control word is allowed in contained
        ///     RtfParagraph.
        /// </param>
        /// <param name="allowImage">Whether RtfImage is allowed.</param>
        /// <param name="allowTable">Whether RtfTable is allowed.</param>
        internal RtfBlockList(bool allowParagraph, bool allowFootnote, bool allowControlWord,
            bool allowImage, bool allowTable)
        {
            _blocks = new List<RtfBlock>();
            _allowParagraph = allowParagraph;
            _allowFootnote = allowFootnote;
            _allowControlWord = allowControlWord;
            _allowImage = allowImage;
            _allowTable = allowTable;
            _defaultCharFormat = null;
        }

        /// <summary>
        ///     Get default character formats within this container.
        /// </summary>
        public RtfCharFormat DefaultCharFormat
        {
            get
            {
                if (_defaultCharFormat == null) _defaultCharFormat = new RtfCharFormat(-1, -1, 1);
                return _defaultCharFormat;
            }
        }

        private void AddBlock(RtfBlock block)
        {
            if (block != null) _blocks.Add(block);
        }

        /// <summary>
        ///     Add a paragraph to this container.
        /// </summary>
        /// <returns>Paragraph being added.</returns>
        public RtfParagraph AddParagraph()
        {
            if (!_allowParagraph) throw new Exception("Paragraph is not allowed.");
            var block = new RtfParagraph(_allowFootnote, _allowControlWord);
            AddBlock(block);
            return block;
        }

        /// <summary>
        ///     Add a section to this container
        /// </summary>
        public RtfSection AddSection(SectionStartEnd type, RtfDocument doc)
        {
            var block = new RtfSection(type, doc);
            AddBlock(block);
            return block;
        }
        
        /// <summary>
        ///     Add a table to this container.
        /// </summary>
        /// <param name="rowCount">Number of rows in the table.</param>
        /// <param name="colCount">Number of columns in the table.</param>
        /// <param name="horizontalWidth">Horizontabl width (in points) of the table.</param>
        /// <param name="fontSize">The size of font used in this table. This is used to calculate margins.</param>
        /// <returns>Table begin added.</returns>
        public RtfTable AddTable(int rowCount, int colCount, float horizontalWidth, float fontSize)
        {
            if (!_allowTable) throw new Exception("Table is not allowed.");
            var block = new RtfTable(rowCount, colCount, horizontalWidth, fontSize);
            AddBlock(block);
            return block;
        }

        /// <summary>
        ///     Internal use only.
        ///     Transfer all content blocks to another RtfBlockList object.
        /// </summary>
        /// <param name="target">Target RtfBlockList object to transfer to.</param>
        internal void TransferBlocksTo(RtfBlockList target)
        {
            for (var i = 0; i < _blocks.Count; i++) target.AddBlock(_blocks[i]);
            _blocks.Clear();
        }

        /// <summary>
        ///     Internal use only.
        ///     Emit RTF code.
        /// </summary>
        /// <returns>Resulting RTF code for this object.</returns>
        public override string Render()
        {
            var result = new StringBuilder();

            result.AppendLine();
            for (var i = 0; i < _blocks.Count; i++)
            {
                if (_defaultCharFormat != null && _blocks[i].DefaultCharFormat != null)
                    _blocks[i].DefaultCharFormat.CopyFrom(_defaultCharFormat);
                result.AppendLine(_blocks[i].Render());
            }
            return result.ToString();
        }
    }
}