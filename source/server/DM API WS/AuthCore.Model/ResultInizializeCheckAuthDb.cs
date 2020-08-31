using System;
using System.Collections.Generic;
using System.Text;

namespace AuthCore.Model
{
    public class ResultInizializeCheckAuthDb
    {
        public bool Invalid { get; set; }
        public List<string> ErrorMessage { get; set; }

        public ResultInizializeCheckAuthDb()
        {
            Invalid = false;
            ErrorMessage = new List<string>();
        }
    }
}
