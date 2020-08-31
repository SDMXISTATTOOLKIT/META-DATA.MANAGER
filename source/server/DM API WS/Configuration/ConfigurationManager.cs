using Microsoft.Extensions.Configuration;
using System;
using System.IO;

namespace Configuration
{
    public static class ConfigurationManager
    {
        public static IConfiguration AppSettings { get; }
        static ConfigurationManager()
        {
            AppSettings = new ConfigurationBuilder()
                    .SetBasePath(Directory.GetCurrentDirectory())
                    .AddJsonFile("appsettings.json")
                    .Build();
        }
    }
}
