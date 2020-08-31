using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.Text;
using System.Text.Encodings.Web;
using System.Threading.Tasks;

namespace Security
{
    public class NodeAuthenticationHandler : AuthenticationHandler<NodeAuthenticationSchemeOptions>
    {
        private readonly IOptionsMonitor<NodeAuthenticationSchemeOptions> options;
        public NodeAuthenticationHandler(IOptionsMonitor<NodeAuthenticationSchemeOptions> options, UrlEncoder encoder, ISystemClock clock)
        : base(options, null, encoder, clock)
        {
            this.options = options;
        }

        protected override async Task<AuthenticateResult> HandleAuthenticateAsync()
        {
            var credentials = Request.Headers["Authorization"];
            if (credentials.Count != 1 || !credentials.ToString().StartsWith("MyScheme "))
            {
                //Questo handler non può gestire l'autenticazione perché il client
                //non ha fornito uno scheme adeguato nell'intestazione Authorization
                return AuthenticateResult.NoResult();
            }

            //I metodi IsValid, CreateClaimsPricipal e CreateProperties non vengono mostrati
            //perché devono essere implementati secondo la propria logica personalizzata
            if (IsValid(credentials))
            {
                var authenticationTicket = new AuthenticationTicket(
                  principal: CreateClaimsPrincipal(),
                  properties: CreateAuthenticationProperties(),
                  authenticationScheme: "MyScheme"
                );
                //L'autenticazione ha avuto successo
                return AuthenticateResult.Success(authenticationTicket);
            }
            else
            {
                //L'autenticazione è fallita
                return AuthenticateResult.Fail("Your credentials are invalid");
            }
        }
    }
}
