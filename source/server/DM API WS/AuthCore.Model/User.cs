using System.Collections.Generic;

namespace AuthCore.Model
{
    public class User : IUserData
    {
        public long Id { get; set; }
        public string NodeId { get; set; }
        public string Username { get; set; }
        public string Password { get; set; }
        public string Salt { get; set; }
        public string Algorithm { get; set; }
        public string MA_SID { get; set; }
        public string DefaultStoreID { get; set; }

        public string Email { get; set; }
        public string Language { get; set; }

        public bool IsAuthenticated { get; set; }
        public bool IsAdmin { get; set; }
        public string Token { get; set; }

        public string FirstName { get; set; }
        public string LastName { get; set; }
        public List<string> Rules { get; set; }
        public List<string> Functionality { get; set; }
        public List<string> Agencies { get; set; }
        public List<string> Category { get; set; }
        public List<string> Cube { get; set; }
        public List<string> CubeOwner { get; set; }
        public List<string> Dataflow { get; set; }
        public List<string> MetadataFlow { get; set; }
        public List<string> DataflowOwner { get; set; }
        public List<string> MetadataFlowOwner { get; set; }

        public static readonly string ClaimFunctionality = "functionality";
        public static readonly string ClaimAgency = "agencies";
        public static readonly string ClaimRule = "rule";
        public static readonly string ClaimCategory = "category";
        public static readonly string ClaimCube = "cube";
        public static readonly string ClaimCubeOwner = "cubeowner";
        public static readonly string ClaimDataflow = "dataflow";
        public static readonly string ClaimMetadataFlow = "metadataflow";
        public static readonly string ClaimDataflowOwner = "dataflowowner";
        public static readonly string ClaimMetadataFlowOwner = "metadataflowowner";
        public static readonly string ClaimUsername = "username";
        public static readonly string ClaimEmail= "emailUser";

        public User()
        {
            Rules = new List<string>();
            Functionality = new List<string>();
            Agencies = new List<string>();
            Category = new List<string>();
            Cube = new List<string>();
            CubeOwner = new List<string>();
            Dataflow = new List<string>();
            MetadataFlow = new List<string>();
            DataflowOwner = new List<string>();
            MetadataFlowOwner = new List<string>();
        }

    }
}
