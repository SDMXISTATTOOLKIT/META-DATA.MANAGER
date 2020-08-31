using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Text;

namespace MA.Entities
{
    public class Transcoding : MAEntity
    {
        public string parentId { get; set; }
        public Dictionary<char, YearTranscoding> timeTranscoding;

        public Transcoding(string parentId)
        {
            this.parentId = parentId;
        }

        [JsonConstructor]
        public Transcoding(string parentId, Dictionary<char, YearTranscoding> timeTranscoding)
        {
            this.parentId = parentId;
            this.timeTranscoding = timeTranscoding;
        }
    }
}
