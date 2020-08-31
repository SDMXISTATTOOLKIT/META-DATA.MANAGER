using AuthCore.Model;
using DataModel;
using Infrastructure.STLogging.Interface;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace API.Security
{
    /// <summary>
    /// User Interface for security operation
    /// </summary>
    public interface IUserService
    {
        /// <summary>
        /// Call DMApi to authenticate a user in NodeAPI
        /// </summary>
        /// <param name="authenticate"></param>
        /// <param name="userParam"></param>
        /// <returns>List of all claim</returns>
        UserDataDTO Authenticate(Authenticate authenticate, User userParam);

        /// <summary>
        /// Login for super user (only on NodeAPI)
        /// </summary>
        /// <param name="userParam"></param>
        /// <returns></returns>
        bool LoginSuperUser(User userParam);

        /// <summary>
        /// Check if the current request is from SuperUser (only on NodeAPI)
        /// </summary>
        /// <returns></returns>
        bool CheckSuperUser();

        /// <summary>
        /// Logout super user (only on NodeAPI)
        /// </summary>
        /// <returns></returns>
        void LogoutSuperUser();

    }
}
