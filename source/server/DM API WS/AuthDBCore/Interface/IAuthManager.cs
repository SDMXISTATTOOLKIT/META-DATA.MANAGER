using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Text;

namespace AuthCore.Interface
{
    public interface IAuthManager
    {
        /// <summary>
        /// Check if the credential of Auth Basic are correct
        /// </summary>
        /// <param name="">/param>
        /// <returns></returns>
        bool CheckLogin(HttpContext httpContext);

        /// <summary>
        /// Check if the credential are correct
        /// </summary>
        /// <param name="">/param>
        /// <returns></returns>
        bool CheckLogin(string loginUsername, string loginPassword);

        /// <summary>
        /// Set all user data from the current user authenticated
        /// </summary>
        /// <param name="">/param>
        /// <returns></returns>
        bool GetUserData();

        /// <summary>
        /// Check if the request is anonymous
        /// </summary>
        /// <param name="">/param>
        /// <returns></returns>
        bool AnonymousRequest(HttpContext httpContext); 
    }
}
