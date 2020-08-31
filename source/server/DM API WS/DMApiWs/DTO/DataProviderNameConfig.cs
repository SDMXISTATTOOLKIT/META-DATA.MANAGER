using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DMApiWs.DTO
{
    public class DataProviderNameConfig
    {
        public DEFAULT_DATA Default_Data { get; set; }
        public RM_DATA RM_Data { get; set; }

        public class DEFAULT_DATA
        {
            public string DATA_STORE_TYPE { get; set; }
            public string CONN_STR { get; set; }
            public string SCHEMA { get; set; }
        }

        public class RM_DATA
        {
            public string DATA_STORE_TYPE { get; set; }
            public string CONN_STR { get; set; }
            public string SCHEMA { get; set; }
        }
    }
}
