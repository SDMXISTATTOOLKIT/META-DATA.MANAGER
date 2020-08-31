using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Threading.Tasks;
using DataModel;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Metadata_API_WS
{
#pragma warning disable CS1591 // Missing XML comment for publicly visible type or member
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
            services.AddControllers();

            services.AddCors(o => o.AddPolicy("CustomPolicy", builder =>
            {
                builder.SetIsOriginAllowed(i => true)
                        .AllowAnyMethod()
                        .AllowAnyHeader()
                        .AllowCredentials();
            }));

            //services.AddCors(o => o.AddPolicy("CustomPolicy", builder =>
            //{
            //    builder.SetIsOriginAllowed(i => true)
            //            .AllowAnyMethod()
            //            .AllowAnyHeader()
            //            .AllowCredentials()
            //            .AllowAnyOrigin();
            //}));

            services.Configure<CacheConfig>(Configuration.GetSection("Cache"));

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

            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }

            app.UseRouting();

            app.UseCors("CustomPolicy");

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllers();
            });


            if (Convert.ToBoolean(Configuration.GetSection("SWAGGER").Value))
            {
                app.UseSwagger();
                app.UseSwaggerUI(c =>
                {
                    c.SwaggerEndpoint("v1/swagger.json", "My API V1");
                });
            }
        }
    }
}
