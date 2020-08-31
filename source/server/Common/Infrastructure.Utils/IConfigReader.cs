using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Utility
{
    public interface IConfigReader
    {
        
        string GetConfigStrVal(string key);
       
        int GetConfigIntVal(string key);


        bool GetConfigBoolVal(string key);
        
    }
}
