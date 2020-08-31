using System;
using System.Collections.Generic;
using System.Text;

namespace AuthCore.Model
{
    public class CubeHierarchy
    {
        public int Id { get; set; }
        public string Category { get; set; }
        public List<CubeHierarchy> Children { get; set; }
        public List<CubeDto> Cube { get; set; }

        public CubeHierarchy()
        {
            Children = new List<CubeHierarchy>();
            Cube = new List<CubeDto>();
        }
    }

    public class CubeDto
    {
        public int Id { get; set; }
        public string Code { get; set; }
    }
}
