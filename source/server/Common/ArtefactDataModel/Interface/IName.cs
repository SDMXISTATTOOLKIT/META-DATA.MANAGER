using System;
using System.Collections.Generic;
using System.Text;

namespace ArtefactDataModel.Interface
{
    public interface IName
    {
        string Name { get; set; }
        Dictionary<string, string> Names { get; set; }
        string Description { get; set; }
        Dictionary<string, string> Descriptions { get; set; }
    }
}
