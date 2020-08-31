using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DM_API_WS.Wizard.Model
{
    /// <summary>
    /// Class for changing user's password.
    /// </summary>
    public class ChangePasswordData
    {
        /// <summary>
        /// User's Username
        /// </summary>
        public string Username { get; set; }
        /// <summary>
        /// User's password
        /// </summary>
        public string Password { get; set; }
        /// <summary>
        /// New password for the user
        /// </summary>
        public string NewPassword { get; set; }
        /// <summary>
        /// New password confirmation for the user. of the user
        /// </summary>
        public string ConfirmPassword { get; set; }
    }

    /// <summary>
    /// States for Change Passord Operation
    /// </summary>
    public enum ChangePasswordResult
    {
        /// <summary>
        /// Database not initialized
        /// </summary>
        DbNotInizialied = 0,
        
        /// <summary>
        /// Login not valid
        /// </summary>
        InvalidLogin,
        
        /// <summary>
        /// Password not valid
        /// </summary>
        InvalidPassoword,
        
        /// <summary>
        /// Confirmation password not valid
        /// </summary>
        InvalidConfirmPassword,
        
        /// <summary>
        /// Success
        /// </summary>
        Ok
    }
}
