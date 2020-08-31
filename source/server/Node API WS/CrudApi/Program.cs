﻿using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Infrastructure.STLogging.Factory;
using Microsoft.AspNetCore;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace CrudApi
{
#pragma warning disable CS1591 // Missing XML comment for publicly visible type or member
    public class Program
    {
        public static void Main(string[] args)
        {
            STLoggerFactory.Logger.Log("Inizializzazione del servizio", Infrastructure.STLogging.Interface.LogLevelEnum.Debug);
            CreateHostBuilder(args).Build().Run();
        }

        public static IHostBuilder CreateHostBuilder(string[] args) =>
                    Host.CreateDefaultBuilder(args)
                        .ConfigureWebHostDefaults(webBuilder =>
                        {
                            webBuilder.UseStartup<Startup>();
                            webBuilder.UseUrls("https://localhost:50000/");
                        });
    }
#pragma warning restore CS1591 // Missing XML comment for publicly visible type or member
}