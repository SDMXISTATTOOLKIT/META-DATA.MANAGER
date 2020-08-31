using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Configuration;

namespace Utility
{
    public class EmailUtils
    {
        /// <summary>
        /// 
        /// </summary>
        public static string EMAIL_SMTP_HOST_SERVER
        {
            get
            {
                return ConfigurationManager.AppSettings["EMAIL_SMTP_HOST_SERVER"];
            }
        }

        /// <summary>
        /// 
        /// </summary>
        public static string EMAIL_DEFAULT_SENDER
        {
            get
            {
                return ConfigurationManager.AppSettings["EMAIL_DEFAULT_SENDER"];
            }
        }


        /// <summary>
        /// Invia un'email.
        /// </summary>
        /// <param name="subject"></param>
        /// <param name="toAddress"></param>
        /// <param name="body"></param>
        public static void SendEmail(string subject, string toAddress, string body, string sender = null)
        {
            SendEmail(subject, new string[] { toAddress }, body, sender);
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="subject"></param>
        /// <param name="toAddresses"></param>
        /// <param name="body"></param>
        /// <param name="sender"></param>
        public static void SendEmail(string subject, string[] toAddresses, string body, string sender = null, string[] attachments = null)
        {
            if (toAddresses != null && toAddresses.Length > 0)
            {
                if (sender == null)
                {
                    sender = EMAIL_DEFAULT_SENDER;
                }

                System.Net.Mail.MailMessage message = new System.Net.Mail.MailMessage();
                message.IsBodyHtml = true;

                foreach (string address in toAddresses)
                {
                    message.To.Add(address);
                }

                message.Subject = subject;
                message.From = new System.Net.Mail.MailAddress(sender);
                message.Body = body;
                if (attachments != null)
                {
                    foreach (string fn in attachments)
                    {
                        message.Attachments.Add(new System.Net.Mail.Attachment(fn));
                    }
                }
                System.Net.Mail.SmtpClient smtp = new System.Net.Mail.SmtpClient(EMAIL_SMTP_HOST_SERVER);
                smtp.Send(message);
            }
        }

    }

}
