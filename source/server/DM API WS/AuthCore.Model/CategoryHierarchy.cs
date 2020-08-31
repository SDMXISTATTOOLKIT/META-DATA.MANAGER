using System;
using System.Collections.Generic;
using System.Text;

namespace AuthCore.Model
{
    public class CategoryHierarchy
    {
        public int Id { get; set; }
        public string Agency { get; set; }
        public List<CategoryHierarchy> Children { get; set; }

        public CategoryHierarchy()
        {
            Children = new List<CategoryHierarchy>();
        }
    }
}
