using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using System;
using System.IO;

namespace DM_API_WS
{
#pragma warning disable CS1591 // Missing XML comment for publicly visible type or member
    public class FileResultFilter : IResultFilter
    {

        void IResultFilter.OnResultExecuted(ResultExecutedContext context)
        {
            try
            {
                //if (context != null && context.HttpContext != null && 
                //    context.HttpContext.Request.Path != null && context.HttpContext.Request.Path.HasValue && 
                //    context.HttpContext.Request.Path.Value.StartsWith("/api/DMApi/DFBuilder/downloadDDBDataflowInCsv", StringComparison.InvariantCultureIgnoreCase))
                //{
                if (context.Result is FileStreamResult)
                {
                    var fileStreamResult = (FileStreamResult)context.Result;
                    if (fileStreamResult != null && fileStreamResult.FileStream is FileStream)
                    {
                        var fileStream = (FileStream)fileStreamResult.FileStream;
                        if (fileStream.Name.Contains("\\TmpData\\", StringComparison.InvariantCultureIgnoreCase) && File.Exists(fileStream.Name))
                        {
                            File.Delete(fileStream.Name);
                        }
                    }
                }
                //}
            }
            catch (Exception)
            {

            }
        }

        void IResultFilter.OnResultExecuting(ResultExecutingContext context)
        {
        }
    }
#pragma warning restore CS1591 // Missing XML comment for publicly visible type or member
}
