using System.Collections.Generic;

namespace DataModel
{
    public class UserDataDTO
    {
        public List<string> Agencies { get; set; }
        public List<string> Category { get; set; }
        public List<string> Cube { get; set; }
        public List<string> CubeOwner { get; set; }
        public List<string> Functionality { get; set; }
        public string Username { get; set; }
        public string Token { get; set; }
        public bool IsAuthenticated { get; set; }
    }
}
