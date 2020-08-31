using System;
using System.Collections.Generic;
using System.Text;

namespace ArtefactDataModel.Property
{
    public class EnumerationFormat
    {
        public string EndTime { get; set; }
        public int EndValue { get; set; }
        public int Interval { get; set; }
        public bool IsSequence { get; set; }
        public int MaxLength { get; set; }
        public int MaxValue { get; set; }
        public int MinLength { get; set; }
        public int MinValue { get; set; }
        public string Pattern { get; set; }
        public string StartTime { get; set; }
        public int StartValue { get; set; }
        public string TextType { get; set; }
        public string TimeInterval { get; set; }
    }
}
