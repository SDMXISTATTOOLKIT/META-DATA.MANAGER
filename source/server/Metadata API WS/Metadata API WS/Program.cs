using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace Metadata_API_WS
{
    /// <summary>
    /// Program
    /// </summary>
    public class Program
    {
        /// <summary>
        /// Main method
        /// </summary>
        /// <param name="args">arguments</param>
        public static void Main(string[] args)
        {
            CreateHostBuilder(args).Build().Run();
        }

        /// <summary>
        /// Creates the web host builder
        /// </summary>
        /// <param name="args">arguments</param>
        /// <returns></returns>
        public static IHostBuilder CreateHostBuilder(string[] args) =>
                    Host.CreateDefaultBuilder(args)
                        .ConfigureWebHostDefaults(webBuilder =>
                        {
                            webBuilder.UseStartup<Startup>();
                        });
    }
}
