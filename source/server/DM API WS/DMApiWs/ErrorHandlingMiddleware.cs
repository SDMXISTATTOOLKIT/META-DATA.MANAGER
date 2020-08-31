using Infrastructure.STLogging.Factory;
using Microsoft.AspNetCore.Http;
using Newtonsoft.Json;
using System;
using System.Net;
using System.Threading.Tasks;

namespace DM_API_WS
{
    /// <summary>
    /// Class for errors management
    /// </summary>
    public class ErrorHandlingMiddleware
    {
        private readonly RequestDelegate next;

        /// <summary>
        /// The constructor.
        /// </summary>
        /// <param name="next">Request delegate.</param>
        public ErrorHandlingMiddleware(RequestDelegate next)
        {
            this.next = next;
        }

        /// <summary>
        /// Invoke method.
        /// </summary>
        /// <param name="context">Http context.</param>
        /// <returns></returns>
        public async Task Invoke(HttpContext context /* other dependencies */)
        {
            try
            {
                await next(context);
            }
            catch (Exception ex)
            {
                await HandleExceptionAsync(context, ex);
            }
        }

        private static Task HandleExceptionAsync(HttpContext context, Exception exception)
        {
            var code = HttpStatusCode.InternalServerError; // 500 if unexpected

            var result = JsonConvert.SerializeObject(new
            {
                errorCode = exception.Message, 
                stackTrace = "", //TODO Ritornare messagio generico
                report = exception.Data.Contains("Report") ? exception.Data["Report"] : null
            });

            //logging
            var maxInner = 5;
            var i = 0;
            var innerError = exception.InnerException;
            if (exception.Data.Contains("logMsg"))
            {
                STLoggerFactory.Logger.Log(exception.Data["logMsg"].ToString() + ": " + exception.StackTrace, (Infrastructure.STLogging.Interface.LogLevelEnum) exception.Data["logLevel"]);
                while (innerError != null && i < maxInner)
                {
                    i++;
                    STLoggerFactory.Logger.Log("Inner " + exception.Data["logMsg"].ToString() + ": " + innerError.StackTrace, (Infrastructure.STLogging.Interface.LogLevelEnum)exception.Data["logLevel"]);
                    innerError = innerError.InnerException;
                }
            }
            else
            {
                STLoggerFactory.Logger.Log("Unexpected error: " + exception.StackTrace, Infrastructure.STLogging.Interface.LogLevelEnum.Error);
                while (innerError != null && i < maxInner)
                {
                    i++;
                    STLoggerFactory.Logger.Log("Unexpected error: " + innerError.StackTrace, Infrastructure.STLogging.Interface.LogLevelEnum.Error);
                    innerError = innerError.InnerException;
                }
            }

            context.Response.ContentType = "application/json";
            context.Response.StatusCode = (int)code;
            return context.Response.WriteAsync(result);
        }
    }
}
