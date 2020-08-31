using System;
using System.Collections.Generic;
using System.Text;

namespace AuthCore.Model
{
    public class UserDataDTO
    {
        public List<string> Agencies { get; set; }
        public List<string> Category { get; set; }
        public List<string> Cube { get; set; }
        public List<string> CubeOwner { get; set; }
        public List<string> Functionality { get; set; }
        public List<string> Rules { get; set; }
        public List<string> Dataflow { get; set; }
        public List<string> MetadataFlow { get; set; }
        public List<string> DataflowOwner { get; set; }
        public List<string> MetadataFlowOwner { get; set; }
        public string Username { get; set; }
        public string Email { get; set; }
        public string Token { get; set; }
        public bool IsAuthenticated { get; set; }
    }
}
