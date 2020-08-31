using Configuration;
using Infrastructure.STLogging.Interface;
using log4net;
using System;
using System.Diagnostics;
using System.IO;
using System.Reflection;

namespace Infrastructure.STLogging.Log4Net
{
    public class Log4NetLogger : ISTLogger
    {
        private ILog mLogger;

        public void Initialize(string configFilePath)
        {
            string loggerName = "STLogger";

            object loggerNameKey = ConfigurationManager.AppSettings["LOGGER_NAME"];
            if (loggerNameKey != null)
            {
                loggerName = loggerNameKey.ToString();
            }

            var repository = log4net.LogManager.GetRepository(Assembly.GetEntryAssembly());
            mLogger = LogManager.GetLogger(MethodBase.GetCurrentMethod().DeclaringType);

            System.Collections.ICollection coll = log4net.Config.XmlConfigurator.ConfigureAndWatch(repository, new System.IO.FileInfo(configFilePath));
        }

        public void Log(string msg, LogLevelEnum logLevel)
        {
            Log(msg, logLevel, null);
        }

        public void Log(string sessionID, string msg, LogLevelEnum logLevel)
        {
            Log(sessionID, msg, null, logLevel);
        }

        public void Log(string msg, LogLevelEnum logLevel, string details)
        {
            Log(null, msg, logLevel, details);
        }

        public void Log(string sessionID, string msg, LogLevelEnum logLevel, string details)
        {
            Log(sessionID, msg, null, logLevel, details);
        }

        public void Log(string msg, Exception ex, LogLevelEnum logLevel)
        {
            Log(null, msg, ex, logLevel);
        }

        public void Log(string sessionID, string message, Exception ex, LogLevelEnum logLevel)
        {
            Log(sessionID, message, ex, logLevel, null);
        }

        public void Log(string sessionID, string message, Exception ex, LogLevelEnum logLevel, string details)
        {
            if (logLevel == LogLevelEnum.Fatal && !IsFatalEnabled)
            {
                return;
            }
            else if (logLevel == LogLevelEnum.Error && !IsErrorEnabled)
            {
                return;
            }
            else if (logLevel == LogLevelEnum.Warn && !IsWarnEnabled)
            {
                return;
            }
            else if (logLevel == LogLevelEnum.Info && !IsInfoEnabled)
            {
                return;
            }
            else if (logLevel == LogLevelEnum.Debug && !IsDebugEnabled)
            {
                return;
            }

            Put("cod_log_type", "'" + logLevel.ToString() + "'");

            string dateFormat = "yyyy-MM-dd HH:mm:ss.fff";
            Put("log_date", "'" + DateTime.Now.ToString(dateFormat) + "'");

            String msg = message == null ? "" : message;
            if (msg.Length > 250)
                msg = msg.Substring(0, 250);

            msg = msg.Replace("'", "''");

            Put("log", "'" + msg + "'");

            string det = "";

            while (ex != null)
            {
                if (det != "")
                {
                    det += "\r\n";
                }

                det += ex.Message + "\r\n" + ex.StackTrace + "\r\n";

                ex = ex.InnerException;
            }

            if (details != null)
            {
                det = details + "\r\n" + det;
            }

            det = det.Replace("'", "''");

            Put("details", "'" + det + "'");

            if (sessionID != null)
            {
                Put("session_id", "'" + sessionID + "'");
            }

            Put("application", "'" + mLogger.Logger.Name + " - " + AppDomain.CurrentDomain.FriendlyName + "'");

            Put("call_site", "'" + GetCallSite() + "'");
            // Put("user_id", userId == null ? "null" : "'" + userId + "'");

            switch (logLevel)
            {
                case LogLevelEnum.Fatal:
                    mLogger.Fatal(message, ex);
                    break;
                case LogLevelEnum.Error:
                    mLogger.Error(message, ex);
                    break;
                case LogLevelEnum.Warn:
                    mLogger.Warn(message, ex);
                    break;
                case LogLevelEnum.Info:
                    mLogger.Info(message, ex);
                    break;
                case LogLevelEnum.Debug:
                    mLogger.Debug(message, ex);
                    break;
                default:
                    break;
            }

            Clear();
        }

        /// <summary>
        /// Inserisce nella mappa del thread una coppia chiave - valore. In genere usiamo questo metodo per inserire righe
        /// nel db. Il metodo va chiamato prima di chiamare uno dei metodi log.
        /// </summary>
        /// <param name="key">La chiave</param>
        /// <param name="value">L'oggetto associato alla chiave</param>
        private void Put(string key, string value)
        {
            MDC.Set(key, value);
        }

        /// <summary>
        /// Svuota la mappa del thread.
        /// </summary>
        private void Clear()
        {
            MDC.Clear();
        }

        /// <summary>
        /// Restituisce il primo metodo chiamante, nella catena dello stack, esterno alla classe STNLogger.
        /// </summary>
        /// <returns></returns>
        private string GetCallSite()
        {
            string callsite = "";

            StackTrace st = new StackTrace();

            for (int i = 0; i < st.FrameCount; i++)
            {
                StackFrame sf = st.GetFrame(i);

                MethodBase mb = sf.GetMethod();

                if (mb.DeclaringType.Name != "Log4NetLogger")
                {
                    callsite = mb.DeclaringType.Name + "." + mb.Name;

                    break;
                }
            }

            return callsite;
        }

        
        public bool IsDebugEnabled
        {
            get
            {
                return mLogger.IsDebugEnabled;
            }
        }
        public bool IsInfoEnabled
        {
            get
            {
                return mLogger.IsInfoEnabled;
            }
        }
        public bool IsWarnEnabled
        {
            get
            {
                return mLogger.IsWarnEnabled;
            }
        }
        public bool IsErrorEnabled
        {
            get
            {
                return mLogger.IsErrorEnabled;
            }
        }
        public bool IsFatalEnabled
        {
            get
            {
                return mLogger.IsFatalEnabled;
            }
        }

    }

}
