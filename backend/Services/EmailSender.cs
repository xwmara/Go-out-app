using System.Net;
using System.Net.Mail;
using System.Text;

namespace Go_OutAppBackend.Services
{
    public static class EmailSender
    {
        public static async Task<bool> TrySendAsync(
            IConfiguration configuration,
            string toEmail,
            string subject,
            string htmlBody,
            string? attachmentFileName = null,
            byte[]? attachmentBytes = null,
            string attachmentContentType = "application/octet-stream")
        {
            if (string.IsNullOrWhiteSpace(toEmail))
            {
                return false;
            }

            var host = configuration["Smtp:Host"];
            var port = configuration.GetValue<int?>("Smtp:Port") ?? 587;
            var username = configuration["Smtp:Username"];
            var password = configuration["Smtp:Password"];
            var fromName = configuration["Smtp:FromName"] ?? "Go-Out";

            if (string.IsNullOrWhiteSpace(host)
                || string.IsNullOrWhiteSpace(username)
                || string.IsNullOrWhiteSpace(password)
                || username == "adresa-ta@gmail.com"
                || password == "app-password-ul-de-la-google")
            {
                return false;
            }

            try
            {
                using var message = new MailMessage
                {
                    From = new MailAddress(username, fromName),
                    Subject = subject,
                    Body = htmlBody,
                    IsBodyHtml = true
                };
                message.To.Add(toEmail);

                MemoryStream? attachmentStream = null;
                if (!string.IsNullOrEmpty(attachmentFileName) && attachmentBytes != null)
                {
                    attachmentStream = new MemoryStream(attachmentBytes);
                    message.Attachments.Add(new Attachment(attachmentStream, attachmentFileName, attachmentContentType));
                }

                using var client = new SmtpClient(host, port)
                {
                    Credentials = new NetworkCredential(username, password),
                    EnableSsl = true,
                    Timeout = 10000
                };

                await client.SendMailAsync(message);
                attachmentStream?.Dispose();
                return true;
            }
            catch
            {
                return false;
            }
        }
    }
}
