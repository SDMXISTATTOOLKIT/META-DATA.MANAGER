using System;

namespace Utility
{

    public enum LogLevelEnum: int
    {
        None = 0,
        Info = 1,
        Debug = 2,
        All = 3
    }

    /// <summary>
    /// Standard Interface for Logging
    /// </summary>
    public interface ILogger
    {
        void ClearLogs();
        string GetLogs();

        void Log(string str);

        void Log(LogLevelEnum level, string str);

        void Log(Exception ex);

        LogLevelEnum LogLevel { get; set; }
    }
}