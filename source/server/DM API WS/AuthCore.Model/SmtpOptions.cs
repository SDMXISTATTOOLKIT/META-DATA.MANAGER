using System;
using System.Collections.Generic;
using System.Text;

namespace AuthCore.Model
{
    public class SmtpOptions
    {
        public string Host { get; set; }
        public int Port { get; set; }
        public string Username { get; set; }
        public string Password { get; set; }
        public bool UseSSL { get; set; }
        public string FromAddress { get; set; }
        public string FromAlias { get; set; }
        public string TemplateMail { get; set; }
    }
}
