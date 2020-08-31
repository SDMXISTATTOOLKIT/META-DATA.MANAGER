using System;
using System.Collections.Generic;
using System.IO.Compression;
using System.Linq;
using System.Threading.Tasks;
using AuthCore;
using AuthCore.Interface;
using AuthCore.Model;
using DataModel;
using DM_API_WS;
using DMApiWs.DTO;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.ResponseCompression;
using Microsoft.AspNetCore.Server.Kestrel.Core;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Newtonsoft.Json.Converters;
using Newtonsoft.Json.Serialization;

namespace DMApiWs
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }


        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddSession(options =>
            {
                options.IdleTimeout = TimeSpan.FromMinutes(3660);//You can set Time   
            });

            services.AddMemoryCache();

            services.AddTransient<FileResultFilter>();

            services.AddControllersWithViews(options =>
            {
                options.Filters.AddService<FileResultFilter>();
            })
            .AddNewtonsoftJson(options =>
            {
                // Use the default property (Pascal) casing
                options.SerializerSettings.ContractResolver = new DefaultContractResolver();

                // Configure a custom converter
                options.SerializerSettings.Converters.Add(new StringEnumConverter());
            })
            .AddXmlSerializerFormatters();

            services.Configure<GzipCompressionProviderOptions>(options =>
            {
                options.Level = CompressionLevel.Fastest;
            });
            services.AddResponseCompression(options =>
            {
                IEnumerable<string> MimeTypes = new[]
                 {
                     "application/zip",
                 };
                options.EnableForHttps = true;
                options.ExcludedMimeTypes = MimeTypes;
                options.Providers.Add<GzipCompressionProvider>();
            });

            //START USED FOR AuthCore
            services.AddScoped<IUserData, User>();
            services.Configure<AuthAppOptions>(Configuration.GetSection("AuthCore"));
            services.AddTransient<ISmtpClient, SmtpClient>();
            services.Configure<SmtpOptions>(Configuration.GetSection("AuthCore:Smtp"));
            services.Configure<CacheConfig>(Configuration.GetSection("Cache"));
            services.Configure<DataProviderNameConfig>(Configuration.GetSection("DATA_PROVIDER_NAME"));
            //END USED FOR AuthCore

            services.AddHttpContextAccessor();

            services.Configure<KestrelServerOptions>(options =>
            {
                options.AllowSynchronousIO = true;
            });

            // If using IIS:
            services.Configure<IISServerOptions>(options =>
            {
                options.AllowSynchronousIO = true;
            });

            if (Convert.ToBoolean(Configuration.GetSection("SWAGGER").Value))
            {
                services.AddSwaggerGen(c => c.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo { Title = "My API", Version = "v1" }));
            }
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            //gestione degli errori
            app.UseMiddleware(typeof(ErrorHandlingMiddleware));

            app.UseResponseCompression();

            //START USED FOR AuthCore
            app.UseWhen(context => context.Request.Path.StartsWithSegments("/api/DMApi"), appBuilder =>
            {
                appBuilder.UseMiddleware(typeof(AuthMiddleware));
            });
            //END USED FOR AuthCore

            app.UseSession();
            app.UseRouting();
            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllers();
            });

            if (Convert.ToBoolean(Configuration.GetSection("SWAGGER").Value))
            {
                app.UseSwagger();
                app.UseSwaggerUI(c =>
                {
                    c.SwaggerEndpoint($"v1/swagger.json", "DM API V1");
                });
            }
        }
    }
}
