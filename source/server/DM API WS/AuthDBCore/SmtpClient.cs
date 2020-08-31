using AuthCore.Interface;
using AuthCore.Model;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Options;
using System.Net;
using System.Net.Mail;

namespace AuthCore
{
    public class SmtpClient : ISmtpClient
    {
        readonly IOptionsMonitor<SmtpOptions> _smtpOptions;
        readonly IHostingEnvironment _env;

        public SmtpClient(IOptionsMonitor<SmtpOptions> smtpOptions, IHostingEnvironment env)
        {
            _smtpOptions = smtpOptions;
            _env = env;
        }
        
        public void SendMailNewPassword(string to, string username, string password, string lang)
        {
            if (string.IsNullOrWhiteSpace(lang))
            {
                lang = "en";
            }
            var config = _smtpOptions.CurrentValue;

            //Implementazione di invio email qui, usando i parametri ottenuti dalla configurazione
            var fileTemplate = $"{_env.ContentRootPath}{config.TemplateMail}\\EmailRecoveryPassword.{lang}.html";
            if (!System.IO.File.Exists(fileTemplate))
            {
                lang = "en";
            }
            var textMail = System.IO.File.ReadAllText(fileTemplate);
            //textMail = textMail.Replace("{username}", username).Replace("{password}", password);

            //take all text inside of <title></title>
            int pTitleFrom = textMail.IndexOf("<title>") + "<title>".Length;
            int pTitleTo = textMail.LastIndexOf("</title>");
            var title = textMail.Substring(pTitleFrom, pTitleTo - pTitleFrom).Trim();
            //take all text inside of <body></body>
            int pBodyFrom = textMail.IndexOf("<body>") + "<body>".Length;
            int pBodyTo = textMail.LastIndexOf("</body>");
            var body = textMail.Substring(pBodyFrom, pBodyTo - pBodyFrom).Trim().Replace("{username}", username).Replace("{password}", password);

            using (var message = new MailMessage())
            {
                message.To.Add(new MailAddress(to, username));
                message.From = new MailAddress(config.FromAddress, config.FromAlias);
                message.Subject = title;
                message.Body = body;
                message.IsBodyHtml = true;

                using (var client = new System.Net.Mail.SmtpClient(config.Host))
                {
                    client.Port = config.Port;
                    client.Credentials = new NetworkCredential(config.Username, config.Password);
                    client.EnableSsl = config.UseSSL;
                    client.Send(message);
                }
            }
        }

    }
}
