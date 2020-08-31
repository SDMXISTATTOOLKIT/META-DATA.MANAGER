using ArtefactDataModel.Property;
using System;
using System.Collections.Generic;
using System.Text;

namespace ArtefactDataModel.Interface
{
    public interface IBase
    {
        string Id { get; set; }
        string Version { get; set; }
        string AgencyID { get; set; }
        List<Link> Links { get; set; }
    }
}
