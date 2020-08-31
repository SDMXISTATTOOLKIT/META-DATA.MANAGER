using System;
using System.Collections.Generic;
using System.Text;

namespace MA.Entities
{
    public class ErrorMessage
    {
        public string status { get; set; }
        public string[] errorMessage { get; set; }
        public string exceptionMessage { get; set; }
    }
}
