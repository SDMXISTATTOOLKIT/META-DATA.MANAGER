using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace API
{
    /// <summary>
    /// FileResultFilter
    /// </summary>
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
                        if (fileStream.Name.StartsWith(Path.GetTempPath(), StringComparison.InvariantCultureIgnoreCase) && File.Exists(fileStream.Name))
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
}
