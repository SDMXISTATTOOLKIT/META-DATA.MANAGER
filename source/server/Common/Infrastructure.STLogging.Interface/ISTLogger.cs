using System;

namespace Infrastructure.STLogging.Interface
{
    /// <summary>
    /// Rappresenta il livello di dettaglio di un log.
    /// </summary>
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

    /// <summary>
    /// Interfaccia per implementare funzionalità di log.
    /// </summary>
    public interface ISTLogger
    {
        /// <summary>
        /// Inizializza il logger con un file di configurazione.
        /// </summary>
        /// <param name="configFilePath">Path completo del file di configurazione del logger.</param>
        void Initialize(string configFilePath);

        void Log(string msg, LogLevelEnum logLevel);

        void Log(string sessionID, string msg, LogLevelEnum logLevel);

        void Log(string msg, LogLevelEnum logLevel, string details);

        void Log(string sessionID, string msg, LogLevelEnum logLevel, string details);

        void Log(string msg, Exception ex, LogLevelEnum logLevel);

        void Log(string sessionID, string msg, Exception ex, LogLevelEnum logLevel);

        void Log(string sessionID, string msg, Exception ex, LogLevelEnum logLevel, string details);

        bool IsDebugEnabled { get; }
        bool IsInfoEnabled { get; }
        bool IsWarnEnabled { get; }
        bool IsErrorEnabled { get; }
        bool IsFatalEnabled { get; }
    }

}
