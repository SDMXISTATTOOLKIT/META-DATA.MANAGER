using System;
using System.Collections.Generic;
using System.Text;

namespace ArtefactDataModel.Property
{
    public class TextFormat
    {
        public int Decimals { get; set; }
        public string EndTime { get; set; }
        public float EndValue { get; set; }
        public float Interval { get; set; }
        public bool IsSequence { get; set; }
        public int MaxLength { get; set; }
        public float MaxValue { get; set; }
        public int MinLength { get; set; }
        public float MinValue { get; set; }
        public string Pattern { get; set; }
        public string StartTime { get; set; }
        public float StartValue { get; set; }
        public string TextType { get; set; }
        public string TimeInterval { get; set; }
    }
}
