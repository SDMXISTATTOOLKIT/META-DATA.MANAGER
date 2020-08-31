using AuthCore;
using AuthCore.Interface;
using AuthCore.Model;
using AuthCore.Utils;
using DataModel;
using Infrastructure.STLogging.Factory;
using Infrastructure.STLogging.Interface;
using Infrastructure.Utils;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;

namespace DM_API_WS.Controllers
{
    /// <summary>
    /// User API
    /// </summary>
    [Route("api/DMApi")]
    [ApiController]
    public class UserController : ControllerBase
    {
        readonly IUserData _userData;
        readonly IWebHostEnvironment _env;
        readonly IOptionsMonitor<AuthAppOptions> _authAppConfig;
        readonly ISTLogger _logger;

        /// <summary>
        /// Constructor
        /// </summary>
        public UserController(IUserData userData, IWebHostEnvironment env, IOptionsMonitor<AuthAppOptions> authAppConfig)
        {
            _userData = userData;
            _env = env;
            _authAppConfig = authAppConfig;
            _logger = STLoggerFactory.Logger;
        }

        /// <summary>
        /// Accepts a request with credential and returns the user info of the user currently logged
        /// </summary>
        [HttpPost("User/LoginUser")]
        public JsonResult LoginUser()
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);
            var result = new JsonResult(_userData);
            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);
            return result;
        }

        /// <summary>
        /// Creates a user on AuthDb
        /// </summary>
        /// <param name="user">user data</param>
        /// <returns></returns>
        [HttpPost("UserConfig/CreateUser")]
        public JsonResult CreateUser([FromBody]User user)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);
            user.Password = System.Text.Encoding.UTF8.GetString(Convert.FromBase64String(user.Password));
            user.DefaultStoreID = "MappingStoreServer";
            new AuthManager(_authAppConfig).CreateUser(user);
            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);
            return new JsonResult(user);
        }

        /// <summary>
        /// Delete a user on AuthDb
        /// </summary>
        /// <param name="user">usardate with username to delete</param>
        /// <returns></returns>
        [HttpDelete("UserConfig/DeleteUser")]
        public bool DeleteUser([FromBody] User user)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);
            var result = new AuthManager(_authAppConfig).DeleteUser(user);
            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);
            return result;
        }

        /// <summary>
        /// Edit only user data and password (if not empty) on AuthDB
        /// </summary>
        /// <param name="user">user data</param>
        /// <returns></returns>
        [HttpPut("UserConfig/UpdateUser")]
        public JsonResult UpdateUser([FromBody]User user)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);
            if (user.Password != null)
            {
                user.Password = System.Text.Encoding.UTF8.GetString(Convert.FromBase64String(user.Password));
            }
            new AuthManager(_authAppConfig).UpdateUser(user);
            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);
            return new JsonResult(user);
        }

        /// <summary>
        /// Assigns an agency to a user on AuthDb
        /// </summary>
        /// <param name="user">user</param>
        /// <returns></returns>
        [HttpPost("UserConfig/AssignsAgency")]
        public JsonResult AssignsAgency([FromBody]User user)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);
            var result = new AuthManager(_authAppConfig).AssignsAgency(user);
            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);
            return new JsonResult(result.Agencies);
        }

        /// <summary>
        /// Assigns a category to a user on AuthDb
        /// </summary>
        /// <param name="user"></param>
        /// <returns></returns>
        [HttpPost("UserConfig/AssignsCategory")]
        public JsonResult AssignsCategory([FromBody]User user)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);
            var result = new AuthManager(_authAppConfig).AssignsCategory(user);
            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);
            return new JsonResult(result.Category);
        }

        /// <summary>
        /// Assigns a functionality to a user on AuthDb
        /// </summary>
        /// <param name="user"></param>
        /// <returns></returns>
        [HttpPost("UserConfig/AssignsFunctionality")]
        public JsonResult AssignsFunctionality([FromBody]User user)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);
            var result = new AuthManager(_authAppConfig).AssignsFunctionality(user);
            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);
            return new JsonResult(result.Category);
        }

        /// <summary>
        /// Assigns a dataflow to a user on AuthDb
        /// </summary>
        /// <param name="user"></param>
        /// <returns></returns>
        [HttpPost("UserConfig/AssignsDataflow")]
        public JsonResult AssignsDataflow([FromBody]User user)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);
            var result = new AuthManager(_authAppConfig).AssignsDataflow(user);
            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);
            return new JsonResult(new User { Dataflow = result.Dataflow, DataflowOwner = result.DataflowOwner });
        }

        /// <summary>
        /// Assigns a metadataflow to a user on AuthDb
        /// </summary>
        /// <param name="user"></param>
        /// <returns></returns>
        [HttpPost("UserConfig/AssignsMetadataFlow")]
        public JsonResult AssignsMetadataset([FromBody]User user)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);
            var result = new AuthManager(_authAppConfig).AssignsMetadataFlow(user);
            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);
            return new JsonResult(new User { MetadataFlow = result.MetadataFlow, MetadataFlowOwner = result.MetadataFlowOwner });
        }

        /// <summary>
        /// Assigns a cube to an user on AuthDb
        /// </summary>
        /// <param name="user"></param>
        /// <returns></returns>
        [HttpPost("UserConfig/AssignsCube")]
        public JsonResult AssignsCube([FromBody]User user)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);
            var result = new AuthManager(_authAppConfig).AssignsCube(user);
            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);
            return new JsonResult(new User { Cube = result.Cube, CubeOwner = result.CubeOwner });
        }

        /// <summary>
        /// Assigns a cube ownership to an user on AuthDb
        /// </summary>
        /// <param name="cubeCode">cube code</param>
        /// <param name="username">username</param>
        /// <returns></returns>
        [HttpPost("User/AssignCubeOwnership/{cubeCode}/{username}")]
        public bool AssignCubeOwnership(string cubeCode, string username)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);
            var result = false;

            if (_userData.CubeOwner.Contains(cubeCode))
            {
                result = new AuthManager(_authAppConfig).AssignCubeOwnership(cubeCode, username);
            }
            else
            {
                HttpContext.Response.StatusCode = 403; //Forbidden
            }

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);
            return result;
        }

        /// <summary>
        /// Assign Dataflow ownership on AuthDB only if there is not already an owner
        /// </summary>
        /// <param name="dataflow">dataflow code</param>
        /// <returns></returns>
        [HttpPost("User/AssignDataflowFirstOwnership")]
        public bool AssignDataflowFirstOwnership(string dataflow)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);
            var result = false;

            var authManager = new AuthManager(_authAppConfig);
            if (!authManager.HaveDataflowOwnership(dataflow))
            {
                result = authManager.AssignDataflowOwnership(dataflow, _userData.Username);
            }
            else
            {
                HttpContext.Response.StatusCode = 403; //Forbidden
            }

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);
            return result;
        }

        /// <summary>
        /// Assigns a dataflow ownership to an user on AuthDb
        /// </summary>
        /// <param name="dataflow">dataflow code</param>
        /// <param name="username">username</param>
        /// <returns></returns>
        [HttpPost("UserConfig/AssignDataflowOwnership/{username}")]
        public bool AssignDataflowOwnership(string username, string dataflow)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);
            var result = false;

            if (_userData.DataflowOwner.Contains(dataflow))
            {
                result = new AuthManager(_authAppConfig).AssignDataflowOwnership(dataflow, username);
            }
            else
            {
                HttpContext.Response.StatusCode = 403; //Forbidden
            }

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);
            return result;
        }

        /// <summary>
        /// Assign MetadataFlow ownership on AuthDB only if there is not already an owner
        /// </summary>
        /// <param name="metadataFlow">MetadataFlow code</param>
        /// <returns></returns>
        [HttpPost("User/AssignMetadataFlowFirstOwnership")]
        public bool AssignMetadataFlowFirstOwnership(string metadataFlow)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);
            var result = false;

            var authManager = new AuthManager(_authAppConfig);
            if (!authManager.HaveMetadataFlowOwnership(metadataFlow))
            {
                result = authManager.AssignMetadataFlowOwnership(metadataFlow, _userData.Username);
            }
            else
            {
                HttpContext.Response.StatusCode = 403; //Forbidden
            }

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);
            return result;
        }

        /// <summary>
        /// Assigns a metadataFlow ownership to an user on AuthDb
        /// </summary>
        /// <param name="metadataFlow">MetadataFlow code</param>
        /// <param name="username">username</param>
        /// <returns></returns>
        [HttpPost("UserConfig/AssignMetadataFlowOwnership/{username}")]
        public bool AssignMetadataFlowOwnership(string username, string metadataFlow)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);
            var result = false;

            if (_userData.MetadataFlowOwner.Contains(metadataFlow))
            {
                result = new AuthManager(_authAppConfig).AssignMetadataFlowOwnership(metadataFlow, username);
            }
            else
            {
                HttpContext.Response.StatusCode = 403; //Forbidden
            }

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);
            return result;
        }

        /// <summary>
        /// Assigns all data to an user on AuthDb
        /// </summary>
        /// <param name="user"></param>
        /// <returns></returns>
        [HttpPost("UserConfig/AssignsAll")]
        public JsonResult AssignsAll([FromBody]User user)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);
            var result = new AuthManager(_authAppConfig).AssignsAll(user);
            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);
            return new JsonResult(new User { Cube = result.Cube, CubeOwner = result.CubeOwner });
        }

        /// <summary>
        /// Gets category hierarchy
        /// </summary>
        /// <returns></returns>
        [HttpGet("UserConfig/GetCategoryHierarchy")]
        public List<CategoryHierarchy> GetCategoryHierarchy()
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);
            var result = new AuthManager(_authAppConfig).GetCategoryHierarchy();
            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);
            return result;
        }

        /// <summary>
        /// Gets cube hierarchy
        /// </summary>
        /// <returns></returns>
        [HttpGet("UserConfig/GetCubeHierarchy")]
        public List<CubeHierarchy> GetCubeHierarchy()
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);
            var result = new AuthManager(_authAppConfig).GetCubeHierarchy();
            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);
            return result;
        }

        /// <summary>
        /// Gets functionalityHierarchy
        /// </summary>
        /// <returns></returns>
        [HttpGet("UserConfig/GetFunctionalityHierarchy")]
        public List<FunctionalityHierarchy> GetFunctionalityHierarchy()
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);
            var result = new AuthManager(_authAppConfig).GetFunctionalityHierarchy();
            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);
            return result;
        }

        /// <summary>
        /// Gets all categories for the current user
        /// </summary>
        /// <returns></returns>
        [HttpGet("User/GetMyCategory")]
        public List<string> GetMyCategory()
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);
            var result = new AuthManager(_authAppConfig).GetCategory(_userData);
            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);
            return result;
        }

        /// <summary>
        /// Gets categories for the given user
        /// </summary>
        /// <returns></returns>
        [HttpGet("User/GetCategory/{username}")]
        public List<string> GetCategory(string username)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);
            var result = new AuthManager(_authAppConfig).GetCategory(username);
            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);
            return result;
        }

        /// <summary>
        /// Gets cubes for the current user
        /// </summary>
        /// <returns></returns>
        [HttpGet("User/GetMyCube")]
        public Dictionary<string, bool> GetMyCube()
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);
            var result = new AuthManager(_authAppConfig).GetCube(_userData);
            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);
            return result;
        }

        /// <summary>
        /// Gets cubes for the given user
        /// </summary>
        /// <returns></returns>
        [HttpGet("UserConfig/GetCube/{username}")]
        public Dictionary<string, bool> GetCube(string username)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);
            var result = new AuthManager(_authAppConfig).GetCube(username);
            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);
            return result;
        }

        /// <summary>
        /// Gets functionalities for the current user
        /// </summary>
        /// <returns></returns>
        [HttpGet("User/GetMyFunctionality")]
        public List<string> GetMyFunctionality()
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);
            var result = new AuthManager(_authAppConfig).GetFunctionality(_userData);
            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);
            return result;
        }

        /// <summary>
        /// Gets functionalities for the given user
        /// </summary>
        /// <returns></returns>
        [HttpGet("UserConfig/GetFunctionality/{username}")]
        public List<string> GetFunctionality(string username)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);
            var result = new AuthManager(_authAppConfig).GetFunctionality(username);
            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);
            return result;
        }

        /// <summary>
        /// Gets agencies for the current user
        /// </summary>
        /// <returns></returns>
        [HttpGet("User/GetMyAgency")]
        public List<string> GetMyAgency()
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);
            var result = new AuthManager(_authAppConfig).GetAgency(_userData);
            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);
            return result;
        }

        /// <summary>
        /// Gets agencies for the given user
        /// </summary>
        /// <returns></returns>
        [HttpGet("UserConfig/GetAgency/{username}")]
        public List<string> GetAgency(string username)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);
            var result = new AuthManager(_authAppConfig).GetAgency(username);
            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);
            return result;
        }

        /// <summary>
        /// Gets all agencies
        /// </summary>
        /// <returns></returns>
        [HttpGet("UserConfig/GetAllAgency")]
        public List<string> GetAllAgency()
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);
            var result = new AuthManager(_authAppConfig).GetAllAgency();
            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);
            return result;
        }

        /// <summary>
        /// Gets all dataflow
        /// </summary>
        /// <returns></returns>
        [HttpGet("UserConfig/GetAllDataflow")]
        public List<string> GetAllDataflow()
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);
            var result = new AuthManager(_authAppConfig).GetAllDataflow();
            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);
            return result;
        }

        /// <summary>
        /// Gets all metadataflow
        /// </summary>
        /// <returns></returns>
        [HttpGet("UserConfig/GetAllMetadataFlow")]
        public List<string> GetAllMetadataset()
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);
            var result = new AuthManager(_authAppConfig).GetAllMetadataFlow();
            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);
            return result;
        }

        /// <summary>
        /// Gets all rule
        /// </summary>
        /// <returns></returns>
        [HttpGet("UserConfig/GetAllRules")]
        public List<string> GetAllRules()
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);
            var result = new AuthManager(_authAppConfig).GetAllRules();
            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);
            return result;
        }


        /// <summary>
        /// Checks if username and email are in AuthDB and sends an mail with the new password
        /// </summary>
        /// <returns></returns>
        [HttpPost("User/RecoveryPassword")]
        public bool RecoveryPassword([FromServices] ISmtpClient smtpClient, User userData)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            var result = new AuthManager(_authAppConfig).RecoveryPassword(smtpClient, userData);

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);
            return result;
        }

        /// <summary>
        /// Changes password for specific user
        /// </summary>
        /// <returns></returns>
        [HttpPost("UserConfig/ChangePassword")]
        public bool ChangePassword([FromBody] User userData)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            var result = new AuthManager(_authAppConfig).ChangePassword(userData, userData.Password);

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);
            return result;
        }

        /// <summary>
        /// Changes password for the logged user
        /// </summary>
        /// <returns></returns>
        [HttpPost("User/ChangeMyPassword")]
        public bool ChangeMyPassword([FromBody] User userData)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            if (!_userData.Username.Equals(userData.Username, StringComparison.InvariantCultureIgnoreCase))
            {
                return false;
            }

            var result = new AuthManager(_authAppConfig).ChangePassword(userData, userData.Password);

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);
            return result;
        }

        /// <summary>
        /// Gets all user data
        /// </summary>
        /// <returns></returns>
        [HttpGet("User/GetMyData")]
        public JsonResult GetMyData()
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);
            var userData = new User();
            if (_userData.IsAuthenticated)
            {
                userData.Agencies = _userData.Agencies;
                userData.Category = _userData.Category;
                userData.Functionality = _userData.Functionality;
                userData.Rules = _userData.Rules;
                userData.Cube = _userData.Cube;
                userData.CubeOwner = _userData.CubeOwner;
                userData.Username = _userData.Username;
                userData.Dataflow = _userData.Dataflow;
                userData.DataflowOwner = _userData.DataflowOwner;
                userData.MetadataFlow = _userData.MetadataFlow;
                userData.MetadataFlowOwner = _userData.MetadataFlowOwner;
            }
            var result = new JsonResult(userData);
            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);
            return result;
        }

        /// <summary>
        /// Gets all data for a specific user
        /// </summary>
        /// <returns></returns>
        [HttpGet("UserConfig/GetData/{username}")]
        public UserDataDTO GetData(string username)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);
            var checkUser = new User { Username = username };
            var resultData = new AuthManager(_authAppConfig).GetUserData(checkUser);
            var userData = new UserDataDTO();
            if (resultData && checkUser != null)
            {
                userData.Agencies = checkUser.Agencies;
                userData.Category = checkUser.Category;
                userData.Functionality = checkUser.Functionality;
                userData.Rules = checkUser.Rules;
                userData.Cube = checkUser.Cube;
                userData.CubeOwner = checkUser.CubeOwner;
                userData.Username = checkUser.Username;
                userData.Dataflow = checkUser.Dataflow;
                userData.DataflowOwner = checkUser.DataflowOwner;
                userData.MetadataFlow = checkUser.MetadataFlow;
                userData.MetadataFlowOwner = checkUser.MetadataFlowOwner;
                userData.Email = checkUser.Email;
                userData.Username = checkUser.Username;
            }
            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);
            return userData;
        }

        /// <summary>
        /// Gets all data for a specific user
        /// </summary>
        /// <returns></returns>
        [HttpGet("User/GetOwners/{entity}")]
        public EntityOwners GetOwners(string entity, string id)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);
            

            var forbidden = false;
            if (!_userData.IsAuthenticated)
            {
                forbidden = true;
            }
            else if (entity.Equals("DATAFLOW", StringComparison.InvariantCultureIgnoreCase) &&
                    !Utility.Utils.HaveOwnershipDataflow(_userData, id))
            {
                forbidden = true;
            }
            else if (entity.Equals("METADATAFLOW", StringComparison.InvariantCultureIgnoreCase) &&
                    !Utility.Utils.HaveOwnershipMetadataFlow(_userData, id))
            {
                forbidden = true;
            }
            else if (entity.Equals("CUBE", StringComparison.InvariantCultureIgnoreCase) &&
                    !Utility.Utils.HaveOwnershipCube(_userData, id))
            {
                forbidden = true;
            }

            if (forbidden)
            {
                HttpContext.Response.StatusCode = 403; //Forbidden
                return null;
            }

            var entityOwners = new EntityOwners();
            var resultData = new AuthManager(_authAppConfig).GetOwners(entity, id);
            entityOwners.Type = entity;
            entityOwners.Id = id;
            foreach (var item in resultData)
            {
                entityOwners.Owners.Add(new EntityOwners.Owner { Username = item.Key, Email = item.Value });
            }
            

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);
            return entityOwners;
        }

        /// <summary>
        /// Gets all data for a specific user
        /// </summary>
        /// <returns></returns>
        [HttpPost("User/SetOwners")]
        public bool SetOwners([FromBody] EntityOwners entityOwners)
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            var forbidden = false;
            if (!_userData.IsAuthenticated)
            {
                forbidden = true;
            }
            else if (entityOwners.Type.Equals("DATAFLOW", StringComparison.InvariantCultureIgnoreCase) && 
                    !Utility.Utils.HaveOwnershipDataflow(_userData, entityOwners.Id))
            {
                forbidden = true;
            }
            else if (entityOwners.Type.Equals("METADATAFLOW", StringComparison.InvariantCultureIgnoreCase) &&
                    !Utility.Utils.HaveOwnershipMetadataFlow(_userData, entityOwners.Id))
            {
                forbidden = true;
            }
            else if (entityOwners.Type.Equals("CUBE", StringComparison.InvariantCultureIgnoreCase) &&
                    !Utility.Utils.HaveOwnershipCube(_userData, entityOwners.Id))
            {
                forbidden = true;
            }

            if (forbidden)
            {
                HttpContext.Response.StatusCode = 403; //Forbidden
                return false; ;
            }

            var listUsername = new List<string>();
            foreach (var item in entityOwners.Owners)
            {
                listUsername.Add(item.Username);
            }
            if (!listUsername.Contains(_userData.Username))
            {
                listUsername.Add(_userData.Username);
            }
            new AuthManager(_authAppConfig).SetOwners(entityOwners.Type, entityOwners.Id, listUsername);

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);
            return true;
        }
        

        /// <summary>
        /// Gets all users in the AuthDB
        /// </summary>
        /// <returns></returns>
        [HttpGet("UserConfig/GetUsers")]
        public List<UsersDTO> GetUsers()
        {
            LoggerUtils.logMethodStarts(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

            var resultData = new AuthManager(_authAppConfig).GetUsers(null);

            LoggerUtils.logMethodEndsSuccess(_logger, System.Reflection.MethodBase.GetCurrentMethod().Name);
            return resultData;
        }
    }
}
