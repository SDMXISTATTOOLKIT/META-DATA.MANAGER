using Microsoft.Extensions.Configuration.Xml;
using System;
using System.Collections.Generic;
using Configuration;
using System.Linq;
using System.Text;

namespace Utility
{
    public class AppSettingsConfigReader: IConfigReader
    {

        public  string GetConfigStrVal(string key)
        {
            try
            {
                var res = ConfigurationManager.AppSettings[key];

                if (res != null)
                    return res.ToString();
                else
                    return "";

            }
            catch
            {
                return "";
            }
        }


        public  int GetConfigIntVal(string key)
        {

            try
            {
                return int.Parse(GetConfigStrVal(key));
            }
            catch
            {
                return 0;
            }
        }


        public  bool GetConfigBoolVal(string key)
        {

            try
            {
                var res = GetConfigStrVal(key);
                if (res != "")
                    return bool.Parse(res);
                else
                    return false;
            }
            catch
            {
                return false;
            }

        }

    }
}
