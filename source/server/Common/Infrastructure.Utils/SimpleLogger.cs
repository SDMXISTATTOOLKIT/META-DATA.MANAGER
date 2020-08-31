using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.IO;
using System.Configuration;

namespace Utility
{

    /// <summary>
    /// Predefined Logger (Console + File). Log file in [BaseDirectory]/Logs/
    /// 
    /// AppSettings Key:  CLIENT_UID - optinal
    /// 
    /// </summary>
    public class SimpleLogger : ILogger
    {
        StringBuilder mStrBldr = new StringBuilder();
        private LogLevelEnum mLoglevel;

        public LogLevelEnum LogLevel
        {
            get { return mLoglevel; }
            set
            {
                mLoglevel = value;
                Log("LogLevel changed to " + ( (int)mLoglevel) + " ("+ mLoglevel.ToString()+")");
            }
        }
        

        public void Log(LogLevelEnum level, string str)
        {
            if (LogLevel >= level)
                Log(str);
        }

        public void Log(string str)
        {
            lock (mStrBldr)
            {
                str = DateTime.Now.ToString() + "\t" + str;

                Console.WriteLine(str);

                mStrBldr.AppendLine(str);
            }
        }

        public  void Log(Exception ex)
        {

            Log(ex.GetType().Name + " - " + ex.Message);
            Log("\tStack Trace" + ex.StackTrace);

            if (ex.InnerException != null)
            {
                Log("------Inner Exception");
                Log(ex.InnerException);
            }
        }

        public  string GetLogs()
        {
            lock (mStrBldr)
            {
                string res =  mStrBldr.ToString();

                SaveLogs(res);

                mStrBldr.Clear();
                return res;
            }
        }

         void SaveLogs(string logs)
        {
            string basePath = AppDomain.CurrentDomain.BaseDirectory + "Logs/";

            try
            {
                if (!Directory.Exists(basePath))
                    Directory.CreateDirectory(basePath);

                string fname = "Log" + DateTime.Now.ToString("yyyy-MM-dd") + ".txt";

                if (!File.Exists(basePath + fname))
                {
                    File.AppendAllText(basePath + fname, "************************************************************************************\r\n");
                    string uid =  Utils.GetConfigStrVal("CLIENT_UID");
                    File.AppendAllText(basePath + fname, AppDomain.CurrentDomain.FriendlyName + " - client-uid: " + uid + "\r\n");
                    File.AppendAllText(basePath + fname, "************************************************************************************\r\n\r\n");
                }


                File.AppendAllText(basePath + fname, logs);
            }
            catch { }
        }

        public  void ClearLogs()
        {
            lock (mStrBldr)
            {
                mStrBldr.Clear();
            }
        }

    }
}
