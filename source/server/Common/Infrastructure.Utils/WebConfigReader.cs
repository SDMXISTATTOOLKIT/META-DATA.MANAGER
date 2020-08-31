using System;
using System.Collections.Generic;
using System.Collections.Specialized;
using System.Linq;
using System.Text;
using Configuration;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Configuration.Xml;

namespace Utility
{
    public class WebConfigReader: IConfigReader
    {
        /// <summary>
        /// Here we should set the current app settings 
        /// </summary>
        //public static NameValueCollection AppSettings = XmlCon;
        public static XmlConfigurationProvider confProvider = new XmlConfigurationProvider(new XmlConfigurationSource());

        public  string GetConfigStrVal(string key)
        {
            try
            {
                return ConfigurationManager.AppSettings[key];
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
                return bool.Parse(GetConfigStrVal(key));
            }
            catch
            {
                return false;
            }

        }

    }
}
