using System;
using System.Collections.Generic;
using System.Text;

namespace HooverUnlimited.DotNetRtfWriter
{
    /// <summary>
    ///     Summary description for RtfParagraph
    /// </summary>
    public class RtfParagraph : RtfBlock
    {
        private Align _align;
        protected bool _allowControlWord;
        protected bool _allowFootnote;
        private string _blockHead;
        private string _blockTail;
        private readonly List<RtfCharFormat> _charFormats;
        private readonly List<RtfFieldControlWord> _controlWords;
        private RtfCharFormat _defaultCharFormat;
        private readonly List<RtfFootnote> _footnotes;
        private readonly Margins _margins;
        private bool _startNewPage;

        public RtfParagraph()
            : this(false, false)
        {
        }

        public RtfParagraph(bool allowFootnote, bool allowControlWord)
        {
            Text = new StringBuilder();
            LineSpacing = -1;
            _margins = new Margins();
            _align = Align.Left; //Changed default to .Left as .None was spreading text accross page.
            _charFormats = new List<RtfCharFormat>();
            _allowFootnote = allowFootnote;
            _allowControlWord = allowControlWord;
            _footnotes = new List<RtfFootnote>();
            _controlWords = new List<RtfFieldControlWord>();
            _blockHead = @"{\pard";
            _blockTail = @"\par}";
            _startNewPage = false;
            FirstLineIndent = 0;
            _defaultCharFormat = null;
        }

        public StringBuilder Text { get; private set; }

        public float LineSpacing { get; set; }

        public float FirstLineIndent { get; set; }

        public override RtfCharFormat DefaultCharFormat
        {
            get
            {
                if (_defaultCharFormat == null) _defaultCharFormat = new RtfCharFormat(-1, -1, Text.Length);
                return _defaultCharFormat;
            }
        }

        public override bool StartNewPage
        {
            get { return _startNewPage; }
            set { _startNewPage = value; }
        }

        public override Align Alignment
        {
            get { return _align; }
            set { _align = value; }
        }

        public override Margins Margins => _margins;

        internal override string BlockHead
        {
            set { _blockHead = value; }
        }

        internal override string BlockTail
        {
            set { _blockTail = value; }
        }

        public void SetText(string text)
        {
            Text = new StringBuilder(text);
        }

        /// <summary>
        ///     Add a character formatting to a range in this paragraph.
        ///     To specify the whole paragraph as the range, set begin = end = -1.
        ///     Format that is added latter will override the former, if their
        ///     range overlays each other.
        /// </summary>
        /// <param name="begin">Beginning of the range</param>
        /// <param name="end">End of the range</param>
        public RtfCharFormat AddCharFormat(int begin, int end)
        {
            var fmt = new RtfCharFormat(begin, end, Text.Length);
            _charFormats.Add(fmt);
            return fmt;
        }

        public RtfCharFormat AddCharFormat()
        {
            return AddCharFormat(-1, -1);
        }

        public RtfFootnote AddFootnote(int position)
        {
            if (!_allowFootnote) throw new Exception("Footnote is not allowed.");
            var fnt = new RtfFootnote(position, Text.Length);
            _footnotes.Add(fnt);
            return fnt;
        }

        public void AddControlWord(int position, RtfFieldControlWord.FieldType type)
        {
            if (!_allowControlWord) throw new Exception("ControlWord is not allowed.");
            var w = new RtfFieldControlWord(position, type);
            for (var i = 0; i < _controlWords.Count; i++)
                if (_controlWords[i].Position == w.Position)
                {
                    _controlWords[i] = w;
                    return;
                }
            _controlWords.Add(w);
        }

        protected LinkedList<Token> BuildTokenList()
        {
            int count;
            Token token;
            var tokList = new LinkedList<Token>();
            LinkedListNode<Token> node;
            var dranges = new List<DisjointRange>();

            #region Build head[] and tail[] from char format range for later use.

            // --------------------------------------------------
            // Transform possibly overlapped character format ranges into
            // disjoint ranges.
            // --------------------------------------------------
            for (var i = 0; i < _charFormats.Count; i++)
            {
                var fmt = _charFormats[i];
                DisjointRange range = null;
                if (fmt.Begin == -1 && fmt.End == -1)
                    range = new DisjointRange
                    {
                        head = 0,
                        tail = Text.Length - 1,
                        format = fmt
                    };
                else if (fmt.Begin <= fmt.End)
                    range = new DisjointRange
                    {
                        head = fmt.Begin,
                        tail = fmt.End,
                        format = fmt
                    };
                else continue;
                if (range.tail >= Text.Length)
                {
                    range.tail = Text.Length - 1;
                    if (range.head > range.tail) continue;
                }
                // make the ranges disjoint from each other.
                var delList = new List<DisjointRange>();
                var addList = new List<DisjointRange>();
                var addAnchorList = new List<DisjointRange>();
                for (var j = 0; j < dranges.Count; j++)
                {
                    var r = dranges[j];
                    if (range.head <= r.head && range.tail >= r.tail)
                    {
                        // former range is totally covered by the later
                        //       |--------| r
                        //   |-----------------| range
                        delList.Add(r);
                    }
                    else if (range.head <= r.head && range.tail >= r.head && range.tail < r.tail)
                    {
                        // former range is partially covered
                        //          |------------------| r
                        //     |-----------------| range
                        r.head = range.tail + 1;
                    }
                    else if (range.head > r.head && range.head <= r.tail && range.tail >= r.tail)
                    {
                        // former range is partially covered
                        //     |------------------| r
                        //          |-----------------| range
                        r.tail = range.head - 1;
                    }
                    else if (range.head > r.head && range.tail < r.tail)
                    {
                        // later range is totally covered by the former
                        //   |----------------------| r
                        //        |---------| range
                        var newRange = new DisjointRange
                        {
                            head = range.tail + 1,
                            tail = r.tail,
                            format = r.format
                        };
                        r.tail = range.head - 1;
                        addList.Add(newRange);
                        addAnchorList.Add(r);
                    }
                }
                dranges.Add(range);
                for (var j = 0; j < delList.Count; j++) dranges.Remove(delList[j]);
                for (var j = 0; j < addList.Count; j++)
                {
                    var index = dranges.IndexOf(addAnchorList[j]);
                    if (index < 0) continue;
                    dranges.Insert(index, addList[j]);
                }
            }

            #endregion

            token = new Token
            {
                text = Text.ToString(),
                isControl = false
            };
            tokList.AddLast(token);

            #region Build token list from head[] and tail[].

            // --------------------------------------------------
            // Build token list from head[] and tail[].
            // --------------------------------------------------
            for (var i = 0; i < dranges.Count; i++)
            {
                var r = dranges[i];
                count = 0;
                // process head[i]
                if (r.head == 0)
                {
                    var newTok = new Token
                    {
                        isControl = true,
                        text = r.format.RenderHead()
                    };
                    tokList.AddFirst(newTok);
                }
                else
                {
                    node = tokList.First;
                    while (node != null)
                    {
                        var tok = node.Value;

                        if (!tok.isControl)
                        {
                            count += tok.text.Length;
                            if (count == r.head)
                            {
                                var newTok = new Token
                                {
                                    isControl = true,
                                    text = r.format.RenderHead()
                                };
                                while (node.Next != null && node.Next.Value.isControl) node = node.Next;
                                tokList.AddAfter(node, newTok);
                                break;
                            }
                            if (count > r.head)
                            {
                                LinkedListNode<Token> newNode;
                                var newTok1 = new Token
                                {
                                    isControl = false,
                                    text = tok.text.Substring(0, tok.text.Length - (count - r.head))
                                };
                                newNode = tokList.AddAfter(node, newTok1);
                                var newTok2 = new Token
                                {
                                    isControl = true,
                                    text = r.format.RenderHead()
                                };
                                newNode = tokList.AddAfter(newNode, newTok2);
                                var newTok3 = new Token
                                {
                                    isControl = false,
                                    text = tok.text.Substring(tok.text.Length - (count - r.head))
                                };
                                newNode = tokList.AddAfter(newNode, newTok3);
                                tokList.Remove(node);
                                break;
                            }
                        }
                        node = node.Next;
                    }
                }
                // process tail[i]
                count = 0;
                node = tokList.First;
                while (node != null)
                {
                    var tok = node.Value;

                    if (!tok.isControl)
                    {
                        count += tok.text.Length;
                        if (count - 1 == r.tail)
                        {
                            var newTok = new Token
                            {
                                isControl = true,
                                text = r.format.RenderTail()
                            };
                            tokList.AddAfter(node, newTok);
                            break;
                        }
                        if (count - 1 > r.tail)
                        {
                            LinkedListNode<Token> newNode;
                            var newTok1 = new Token
                            {
                                isControl = false,
                                text = tok.text.Substring(0, tok.text.Length - (count - r.tail) + 1)
                            };
                            newNode = tokList.AddAfter(node, newTok1);
                            var newTok2 = new Token
                            {
                                isControl = true,
                                text = r.format.RenderTail()
                            };
                            newNode = tokList.AddAfter(newNode, newTok2);
                            var newTok3 = new Token
                            {
                                isControl = false,
                                text = tok.text.Substring(tok.text.Length - (count - r.tail) + 1)
                            };
                            newNode = tokList.AddAfter(newNode, newTok3);
                            tokList.Remove(node);
                            break;
                        }
                    }
                    node = node.Next;
                }
            } // end for each char format

            #endregion

            #region Insert footnote into token list.

            // --------------------------------------------------
            // Insert footnote into token list.
            // --------------------------------------------------
            for (var i = 0; i < _footnotes.Count; i++)
            {
                var pos = _footnotes[i].Position;
                if (pos >= Text.Length) continue;

                count = 0;
                node = tokList.First;
                while (node != null)
                {
                    var tok = node.Value;

                    if (!tok.isControl)
                    {
                        count += tok.text.Length;
                        if (count - 1 == pos)
                        {
                            var newTok = new Token
                            {
                                isControl = true,
                                text = _footnotes[i].Render()
                            };
                            tokList.AddAfter(node, newTok);
                            break;
                        }
                        if (count - 1 > pos)
                        {
                            LinkedListNode<Token> newNode;
                            var newTok1 = new Token
                            {
                                isControl = false,
                                text = tok.text.Substring(0, tok.text.Length - (count - pos) + 1)
                            };
                            newNode = tokList.AddAfter(node, newTok1);
                            var newTok2 = new Token
                            {
                                isControl = true,
                                text = _footnotes[i].Render()
                            };
                            newNode = tokList.AddAfter(newNode, newTok2);
                            var newTok3 = new Token
                            {
                                isControl = false,
                                text = tok.text.Substring(tok.text.Length - (count - pos) + 1)
                            };
                            newNode = tokList.AddAfter(newNode, newTok3);
                            tokList.Remove(node);
                            break;
                        }
                    }
                    node = node.Next;
                }
            }

            #endregion

            #region Insert control words into token list.

            // --------------------------------------------------
            // Insert control words into token list.
            // --------------------------------------------------
            for (var i = 0; i < _controlWords.Count; i++)
            {
                var pos = _controlWords[i].Position;
                if (pos >= Text.Length) continue;

                count = 0;
                node = tokList.First;
                while (node != null)
                {
                    var tok = node.Value;

                    if (!tok.isControl)
                    {
                        count += tok.text.Length;
                        if (count - 1 == pos)
                        {
                            var newTok = new Token
                            {
                                isControl = true,
                                text = _controlWords[i].Render()
                            };
                            tokList.AddAfter(node, newTok);
                            break;
                        }
                        if (count - 1 > pos)
                        {
                            LinkedListNode<Token> newNode;
                            var newTok1 = new Token
                            {
                                isControl = false,
                                text = tok.text.Substring(0, tok.text.Length - (count - pos) + 1)
                            };
                            newNode = tokList.AddAfter(node, newTok1);
                            var newTok2 = new Token
                            {
                                isControl = true,
                                text = _controlWords[i].Render()
                            };
                            newNode = tokList.AddAfter(newNode, newTok2);
                            var newTok3 = new Token
                            {
                                isControl = false,
                                text = tok.text.Substring(tok.text.Length - (count - pos) + 1)
                            };
                            newNode = tokList.AddAfter(newNode, newTok3);
                            tokList.Remove(node);
                            break;
                        }
                    }
                    node = node.Next;
                }
            }

            #endregion

            return tokList;
        }

        protected string ExtractTokenList(LinkedList<Token> tokList)
        {
            LinkedListNode<Token> node;
            var result = new StringBuilder();

            node = tokList.First;
            while (node != null)
            {
                if (node.Value.isControl) result.Append(node.Value.text);
                else result.Append(RtfUtility.UnicodeEncode(node.Value.text));
                node = node.Next;
            }
            return result.ToString();
        }

        public override string Render()
        {
            var tokList = BuildTokenList();
            var result = new StringBuilder(_blockHead);

            if (_startNewPage) result.Append(@"\pagebb");

            if (LineSpacing >= 0) result.Append(@"\sl-" + RtfUtility.Pt2Twip(LineSpacing) + @"\slmult0");
            if (_margins[Direction.Top] > 0) result.Append(@"\sb" + RtfUtility.Pt2Twip(_margins[Direction.Top]));
            if (_margins[Direction.Bottom] > 0) result.Append(@"\sa" + RtfUtility.Pt2Twip(_margins[Direction.Bottom]));
            if (_margins[Direction.Left] > 0) result.Append(@"\li" + RtfUtility.Pt2Twip(_margins[Direction.Left]));
            if (_margins[Direction.Right] > 0) result.Append(@"\ri" + RtfUtility.Pt2Twip(_margins[Direction.Right]));
            //if (_firstLineIndent != 0) {
            result.Append(@"\fi" + RtfUtility.Pt2Twip(FirstLineIndent));
            //}
            result.Append(AlignmentCode());
            result.AppendLine();

            // insert default char format intto the 1st position of _charFormats
            if (_defaultCharFormat != null) result.AppendLine(_defaultCharFormat.RenderHead());
            result.AppendLine(ExtractTokenList(tokList));
            if (_defaultCharFormat != null) result.Append(_defaultCharFormat.RenderTail());

            result.AppendLine(_blockTail);
            return result.ToString();
        }

        protected struct Token
        {
            public string text;
            public bool isControl;
        }

        private class DisjointRange
        {
            public RtfCharFormat format;
            public int head;
            public int tail;

            public DisjointRange()
            {
                head = -1;
                tail = -1;
                format = null;
            }
        }
    }
}