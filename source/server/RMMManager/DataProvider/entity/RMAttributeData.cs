using System;
using System.Collections.Generic;
using System.Text;

namespace DataProvider.entity
{
    class RMAttributeData : ReportAttributeValue
    {
        private int id;
        private string name;
        private string type;
        private int typeId;
        private int parentId;

        public int Id
        {
            get
            {
                return id;
            }
            set
            {
                id = value;
            }
        }
        public string Name
        {
            get
            {
                return name;
            }
            set
            {
                name = value;
            }
        }

        public string Type
        {
            get
            {
                return type;
            }
            set
            {
                type = value;
            }
        }

        public int TypeId
        {
            get
            {
                return typeId;
            }
            set
            {
                typeId = value;
            }
        }

        public int ParentId
        {
            get
            {
                return parentId;
            }
            set
            {
                parentId = value;
            }
        }
    }
}
