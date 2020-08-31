using Infrastructure.STLogging.Factory;
using Microsoft.AspNetCore.Http;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Security.Authentication;
using System.Threading.Tasks;

namespace CrudApi
{
#pragma warning disable CS1591 // Missing XML comment for publicly visible type or member
    public class ErrorHandlingMiddleware
    {
        private readonly RequestDelegate next;

        public ErrorHandlingMiddleware(RequestDelegate next)
        {
            this.next = next;
        }

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

            context.Response.ContentType = "application/json";
            
            //caso eccezione 500 sollevata da DM API (già impacchettate)
            if (exception is ApplicationException)
            {
                context.Response.StatusCode = 500;
                var tmpObj = JObject.Parse(exception.Message);
                STLoggerFactory.Logger.Log("Error in DM API: " + tmpObj["errorCode"] + " - " + tmpObj["stackTrace"], Infrastructure.STLogging.Interface.LogLevelEnum.Error);
                var maxInner = 5;
                var i = 0;
                var innerError = exception.InnerException;
                while (innerError != null && i<maxInner)
                {
                    i++;
                    STLoggerFactory.Logger.Log("Inner Error in DM API: " + tmpObj["errorCode"] + " - " + tmpObj["stackTrace"], Infrastructure.STLogging.Interface.LogLevelEnum.Error);
                    innerError = innerError.InnerException;
                }
                return context.Response.WriteAsync(exception.Message);
            }
            //eccezione di altro tipo (da impacchettare)
            else
            {
                context.Response.StatusCode = 500;
                string result;

                //caso di riposta 401 dal DMAPi
                if (exception is AuthenticationException)
                {
                    context.Response.StatusCode = 401;
                    result = JsonConvert.SerializeObject(new
                    {
                        errorCode = exception.Message
                    });
                }
                //caso di riposta 403 dal DMAPi
                else if (exception is UnauthorizedAccessException)
                {
                    context.Response.StatusCode = 403;
                    result = JsonConvert.SerializeObject(new
                    {
                        errorCode = exception.Message
                    });
                }
                else
                {
                    result = JsonConvert.SerializeObject(new
                    {
                        errorCode = exception.Message,
                        stackTrace = "" //TODO Ritornare messagio generico
                    });
                }

                //logging
                var maxInner = 5;
                var i = 0;
                var innerError = exception.InnerException;
                if (exception.Data.Contains("logMsg"))
                {
                    STLoggerFactory.Logger.Log(exception.Data["logMsg"].ToString() + ": " + exception.StackTrace, (Infrastructure.STLogging.Interface.LogLevelEnum)exception.Data["logLevel"]);
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

                return context.Response.WriteAsync(result);
            }


        }
    }
#pragma warning restore CS1591 // Missing XML comment for publicly visible type or member
}
