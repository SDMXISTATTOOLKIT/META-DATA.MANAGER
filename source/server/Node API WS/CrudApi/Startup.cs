using API;
using API.DTO;
using AuthCore.Model;
using Configuration;
using DataModel;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.ResponseCompression;
using Microsoft.AspNetCore.Server.Kestrel.Core;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using Newtonsoft.Json.Serialization;
using System;
using System.Collections.Generic;
using System.IO.Compression;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Mail;
using System.Text;
using System.Threading.Tasks;
using Utility;

namespace CrudApi
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
            services.AddScoped<FileResultFilter>();
            services.AddMvc(options =>
            {
                options.Filters.AddService<FileResultFilter>();
            })
            .AddNewtonsoftJson()
            .AddXmlSerializerFormatters();


            confgiureSession(services);

            services.AddMemoryCache();

            services.AddHttpContextAccessor();

            services.AddCors(o => o.AddPolicy("CustomPolicy", builder =>
            {
                builder.SetIsOriginAllowed(i => true)
                        .AllowAnyMethod()
                        .AllowAnyHeader()
                        .AllowCredentials()
                        .WithExposedHeaders("Token-Expired")
                        .WithExposedHeaders("X-Total-Count")
                        .WithExposedHeaders("X-Selected-Count");
            }));

            services.Configure<CacheConfig>(Configuration.GetSection("Cache"));


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


            services.Configure<KestrelServerOptions>(options =>
            {
                options.AllowSynchronousIO = true;
            });

            // If using IIS:
            services.Configure<IISServerOptions>(options =>
            {
                options.AllowSynchronousIO = true;
            });


            // configure jwt authentication
            var key = Encoding.ASCII.GetBytes(ConfigurationManager.AppSettings["ENCRYPTION_KEY"]);
            services.AddAuthentication(x =>
            {
                x.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                x.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            })
            .AddJwtBearer(x =>
            {
                x.SaveToken = true;
                x.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(key),
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidIssuer = "IssuerNode",
                    ValidAudience = "AudienceNode",
                    ValidateLifetime = true,
                    ClockSkew = TimeSpan.Zero
                };
                x.Events = new JwtBearerEvents
                {
                    OnAuthenticationFailed = context =>
                    {
                        if (context.Exception.GetType() == typeof(SecurityTokenExpiredException))
                        {
                            context.Response.Headers.Add("Token-Expired", "true");
                        }
                        return Task.CompletedTask;
                    },
                    OnTokenValidated = (validationContext) =>
                    {
                        if (ConfigurationManager.AppSettings["TOKEN_TIMESTAMP_CHECK"] != null && Convert.ToBoolean(ConfigurationManager.AppSettings["TOKEN_TIMESTAMP_CHECK"]))
                        {
                            var timeStamp = validationContext.Principal.Claims.FirstOrDefault(claim => claim.Type.Equals("timestamp"));
                            var userClaim = validationContext.Principal.Claims.FirstOrDefault(claim => claim.Type.Equals(User.ClaimUsername));
                            var cacheManager = validationContext.HttpContext.RequestServices.GetRequiredService<IMemoryCache>();

                            if (timeStamp != null && userClaim != null && cacheManager != null)
                            {
                                var validTimeStamp = cacheManager.Get<long>($"timestamp{userClaim.Value}");

                                if (Convert.ToInt64(timeStamp.Value) < validTimeStamp)
                                {
                                    validationContext.Response.Headers.Add("Token-Expired", "true");
                                    validationContext.Fail("Security Stamp not valid");
                                    return Task.CompletedTask;
                                }

                            }
                        }
                        validationContext.Success();
                        return Task.CompletedTask;
                    }
                };
            });

            if (Convert.ToBoolean(ConfigurationManager.AppSettings["SWAGGER"]))
            {
                services.AddSwaggerGen(c => c.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo { Title = "My API", Version = "v1" }));
            }
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            app.UseMiddleware(typeof(ErrorHandlingMiddleware));

            app.UseResponseCompression();

            app.UseSession();

            app.UseRouting();

            app.UseCors("CustomPolicy");

            app.UseAuthentication();
            app.UseAuthorization();

            if (Convert.ToBoolean(ConfigurationManager.AppSettings["SWAGGER"]))
            {
                app.UseSwagger();
                app.UseSwaggerUI(c =>
                {
                    c.SwaggerEndpoint("v1/swagger.json", "My API V1");
                });
            }

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllers();
            });
        }

        private void confgiureSession(IServiceCollection services)
        {
            var cookieOptionsConfig = Configuration.GetSection("CookieOptions").Get<CookieOptionsConfig>();

            var cookieHttpOnly = cookieOptionsConfig?.HttpOnly;
            if (!cookieHttpOnly.HasValue)
            {
                cookieHttpOnly = true;
            }

            var cookieSameSiteString = cookieOptionsConfig?.SameSite;
            var cookieSameSite = SameSiteMode.Lax;
            if (cookieSameSiteString != null)
            {
                switch (cookieSameSiteString.ToUpperInvariant())
                {
                    case "LAX":
                        cookieSameSite = SameSiteMode.Lax;
                        break;
                    case "NONE":
                        cookieSameSite = SameSiteMode.None;
                        break;
                    case "STRICT":
                        cookieSameSite = SameSiteMode.Strict;
                        break;
                    case "UNSPECIFIED":
                        cookieSameSite = SameSiteMode.Unspecified;
                        break;
                }
            }

            double expiresSession = 60;
            double.TryParse(ConfigurationManager.AppSettings["EXPIRES_SESSION"], out expiresSession);
            services.AddSession(options =>
            {
                options.IdleTimeout = TimeSpan.FromMinutes(expiresSession);
                options.Cookie.HttpOnly = cookieHttpOnly.Value;
                options.Cookie.SameSite = cookieSameSite;
                options.Cookie.Path = !string.IsNullOrWhiteSpace(cookieOptionsConfig?.Path) ? cookieOptionsConfig?.Path : "/";
            });

        }

    }
#pragma warning restore CS1591 // Missing XML comment for publicly visible type or member
}
