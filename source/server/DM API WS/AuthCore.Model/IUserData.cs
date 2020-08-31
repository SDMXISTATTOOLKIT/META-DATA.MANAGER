using System;
using System.Collections.Generic;
using System.Text;

namespace AuthCore.Model
{
    /// <summary>
    /// Contains data for Authorization and Other Generic (Role, Name, Surname and other data)
    /// </summary>
    public interface IUserData
    {
        long Id { get; set; }
        string Username { get; set; }
        string Password { get; set; }
        string Salt { get; set; }
        string Algorithm { get; set; }
        string DefaultStoreID { get; set; }
        string MA_SID { get; set; }
        bool IsAuthenticated { get; set; }

        string Email { get; set; }
        string Language { get; set; }

        string FirstName { get; set; }
        string LastName { get; set; }
        List<string> Rules { get; set; }
        List<string> Functionality { get; set; }
        List<string> Agencies { get; set; }
        List<string> Category { get; set; }
        List<string> Cube { get; set; }
        List<string> CubeOwner { get; set; }
        List<string> Dataflow { get; set; }
        List<string> MetadataFlow { get; set; }
        List<string> DataflowOwner { get; set; }
        List<string> MetadataFlowOwner { get; set; }
    }
}
