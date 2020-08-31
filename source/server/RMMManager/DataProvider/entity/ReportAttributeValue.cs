using System;
using System.Collections.Generic;
using System.Text;

namespace DataProvider.entity
{
    class ReportAttributeValue
    {
        private string value;
        private string language;
        public string Value
        {
            get
            {
                return value;
            }
            set
            {
                this.value = value;
            }
        }

        public string Language
        {
            get
            {
                return language;
            }
            set
            {
                language = value;
            }
        }
    }
}
