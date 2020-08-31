using Infrastructure.STLogging.Interface;
using System;
using System.Collections.Generic;
using System.Text;

namespace Infrastructure.Utils
{
    public static class LoggerUtils
    {
        /// <summary>
        /// Logs a message when the execution of a method starts
        /// </summary>
        /// <param name="methodName">The name of the method.</param>
        public static void logMethodStarts(ISTLogger logger, string methodName)
        {
            logger.Log("Starting execution of method " + methodName, Infrastructure.STLogging.Interface.LogLevelEnum.Info);
        }

        /// <summary>
        /// Logs a message when the execution of a method starts
        /// </summary>
        /// <param name="methodName">The name of the method.</param>
        /// <param name="LogLevelEnum">The level of log.</param>
        public static void logMethodStarts(ISTLogger logger, string methodName, LogLevelEnum logLevelEnum)
        {
            logger.Log("Starting execution of method " + methodName, logLevelEnum);
        }

        /// <summary>
        /// Logs a message when the execution of a method ends.
        /// </summary>
        /// <param name="methodName">The name of the method.</param>
        public static void logMethodEndsSuccess(ISTLogger logger, string methodName)
        {
            logger.Log("Execution of method " + methodName + " successfully completed.", Infrastructure.STLogging.Interface.LogLevelEnum.Info);
        }

        /// <summary>
        /// Logs a message when the execution of a method ends.
        /// </summary>
        /// <param name="methodName">The name of the method.</param>
        /// <param name="LogLevelEnum">The level of log.</param>
        public static void logMethodEndsSuccess(ISTLogger logger, string methodName, LogLevelEnum logLevelEnum)
        {
            logger.Log("Execution of method " + methodName + " successfully completed.", logLevelEnum);
        }
    }
}
