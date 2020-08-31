using System;
using System.Collections.Generic;
using System.Text;

namespace AuthCore.Model
{
    public class FunctionalityHierarchy
    {
        public int Id { get; set; }
        public string Functionality { get; set; }
        public List<FunctionalityHierarchy> Children { get; set; }

        public FunctionalityHierarchy()
        {
            Children = new List<FunctionalityHierarchy>();
        }
    }
}
