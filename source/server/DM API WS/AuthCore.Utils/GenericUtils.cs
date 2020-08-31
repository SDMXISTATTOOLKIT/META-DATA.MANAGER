using System;
using System.Collections.Generic;
using System.Text;

namespace AuthCore.Utils
{
    public class GenericUtils
    {
        static public Exception GetCustomException(string code, string logMsg, LogLevelEnum logLevel)
        {
            Exception ex = new Exception(code);
            ex.Data["logMsg"] = logMsg;
            ex.Data["logLevel"] = logLevel;

            return ex;
        }

        public enum LogLevelEnum
        {
            /// <summary>
            /// Log molto dettagliato, che può includere parecchie informazioni come ad es. lo stack trace.
            /// </summary>
            Trace,
            /// <summary>
            /// Log contenente informazioni a scopo di debug.
            /// </summary>
            Debug,
            /// <summary>
            /// Log contenente messaggi informativi.
            /// </summary>
            Info,
            /// <summary>
            /// Log contenente messaggi di warning.
            /// </summary>
            Warn,
            /// <summary>
            /// Log contenente messaggi di errore.
            /// </summary>
            Error,
            /// <summary>
            /// Log di errori molto gravi.
            /// </summary>
            Fatal
        }
    }
}
