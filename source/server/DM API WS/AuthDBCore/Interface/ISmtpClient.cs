using System.Threading.Tasks;

namespace AuthCore.Interface
{
    public interface ISmtpClient
    {
        void SendMailNewPassword(string to, string username, string password, string lan);
    }
}
