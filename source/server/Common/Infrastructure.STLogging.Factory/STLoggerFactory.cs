using Configuration;
using Infrastructure.STLogging.Interface;
using System;
using System.IO;

namespace Infrastructure.STLogging.Factory
{
    public class STLoggerFactory
    {
        private static ISTLogger mLogger = null;

        private static object mLoggerLock = new object();

        /// <summary>
        /// Restituisce il logger.
        /// </summary>
        public static ISTLogger Logger
        {
            get
            {
                lock (mLoggerLock)
                {
                    if (mLogger == null)
                    {
                        string logConfigRelPath = "logconfig.xml";
                        object loggerConfigKey = ConfigurationManager.AppSettings["LOGGER_CONFIG_PATH"];
                        if (loggerConfigKey != null)
                        {
                            logConfigRelPath = loggerConfigKey.ToString();
                        }
                        mLogger = new Infrastructure.STLogging.Log4Net.Log4NetLogger();
                        mLogger.Initialize(Path.Combine(System.IO.Directory.GetCurrentDirectory(), logConfigRelPath));
                    }
                }

                return mLogger;
            }

        }

    }

}
