using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace API.DTO
{
    public class CookieOptionsConfig
    {
        public bool? HttpOnly { get; set; }
        public string Path { get; set; }
        public string SameSite { get; set; }
    }
}
