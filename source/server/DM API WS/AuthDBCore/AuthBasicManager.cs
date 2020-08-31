using AuthCore.Interface;
using AuthCore.Model;
using AuthCore.Utils;
using Infrastructure.STLogging.Interface;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Text;
using System.Text.RegularExpressions;

namespace AuthCore
{
    public class AuthBasicManager : IAuthManager
    {
        /// <summary>
        /// Regular expression that parses the HTTP Basic Authentication header
        /// </summary>
        private static readonly Regex _basic = new Regex("^\\s*Basic\\s+(?<b64>[a-zA-Z0-9\\+/]+={0,2})\\s*$");

        /// <summary>
        /// The Basic authentication separator
        /// </summary>
        static readonly char[] _basicSep = new[] { ':' };

        readonly AuthAppOptions _config;
        readonly IDBConnector _connector;
        readonly IUserData _userData;
        readonly ISTLogger _logger;

        public AuthBasicManager(AuthAppOptions config, IUserData userData, ISTLogger logger)
        {
            _config = config;
            _userData = userData;
            _logger = logger;

            _connector = new BaseDBConnector(_config, _logger);
        }
        
        public bool CheckLogin(HttpContext httpContext)
        {
            httpContext.Request.Headers.TryGetValue("Authorization", out Microsoft.Extensions.Primitives.StringValues authorizationToken);

            var loginUsername = "";
            var loginPassword = "";
            if (!string.IsNullOrEmpty(authorizationToken))
            {
                Match match = _basic.Match(authorizationToken);
                if (match.Success)
                {
                    _logger.Log($"AuthBasicManager is basic auth", LogLevelEnum.Debug);
                    authorizationToken = match.Result("${b64}");
                    if (!string.IsNullOrEmpty(authorizationToken))
                    {
                        byte[] decoded = Convert.FromBase64String(authorizationToken);

                        string s = Encoding.UTF8.GetString(decoded);
                        string[] creds = s.Split(_basicSep, 2);
                        if (creds.Length == 2)
                        {
                            loginUsername = creds[0];
                            loginPassword = creds[1];
                        }
                    }
                }
                else
                {
                    _logger.Log($"AuthBasicManager NOT a basic auth", LogLevelEnum.Debug);
                }
            }

            return commonCheckLogin(loginUsername, loginPassword);
        }
        
        public bool CheckLogin(string loginUsername, string loginPassword)
        {
            return commonCheckLogin(loginUsername, loginPassword);
        }

        private bool commonCheckLogin(string loginUsername, string loginPassword)
        {
            if (String.IsNullOrWhiteSpace(loginUsername))
            {
                _logger.Log($"AuthBasicManager empty login", LogLevelEnum.Debug);
                return false;
            }

            _userData.Username = loginUsername;
            if (!_connector.GetUserAccount(_userData))
            {
                _logger.Log($"AuthBasicManager GetUserAccount return false", LogLevelEnum.Debug);
                return false;
            }
            else if (string.IsNullOrWhiteSpace(_userData.Username))
            {
                _logger.Log($"AuthBasicManager GetUserAccount return an empty username", LogLevelEnum.Debug);
                _userData.IsAuthenticated = false;
                _userData.Password = null;
                return false;
            }
            if (!string.IsNullOrWhiteSpace(_userData.Username) && string.IsNullOrEmpty(_userData.Password) && string.IsNullOrEmpty(loginPassword))
            {
                _logger.Log($"AuthBasicManager IsAuthenticated", LogLevelEnum.Debug);
                _userData.IsAuthenticated = true;
                _userData.Password = null;
                return true;
            }

            var encPassword = EncryptUtils.EncrypPassword(loginPassword, _userData.Salt, _userData.Algorithm ?? _config.AlgorithmDefault);

            _userData.IsAuthenticated = string.Equals(encPassword, _userData.Password);
            _userData.Password = null;
            _userData.Algorithm = null;
            _userData.Salt = null;
            _logger.Log($"AuthBasicManager IsAuthenticated", LogLevelEnum.Debug);
            return _userData.IsAuthenticated;
        }

        public bool AnonymousRequest(HttpContext httpContext)
        {
            var result= !httpContext.Request.Headers.ContainsKey("Authorization");
            _logger.Log($"AuthBasicManager AnonymousRequest {result}", LogLevelEnum.Debug);
            return result;
        }
        
        public bool GetUserData()
        {
            if (_userData == null || string.IsNullOrWhiteSpace(_userData.Username))
            {
                _logger.Log($"AuthBasicManager GetUserData have an _userData null or _userData.Username empty", LogLevelEnum.Debug);
                return false;
            }
            return _connector.GetUserData(_userData);
        }
    }
}
