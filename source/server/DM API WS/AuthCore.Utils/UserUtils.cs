using AuthCore.Model;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Security.Principal;

namespace AuthCore.Utils
{
    public class UserUtils
    {
        public static string GetUsername(IIdentity identity)
        {
            if (identity as ClaimsIdentity == null)
            {
                return null;
            }

            var userClaim = ((ClaimsIdentity)identity).Claims
                .FirstOrDefault(c => c.Type == User.ClaimUsername);
            if (userClaim == null)
            {
                return null;
            }

            return userClaim.Value;
        }

        public static string GetGuidSession(IIdentity identity)
        {
            if (identity as ClaimsIdentity == null)
            {
                return null;
            }

            var userClaim = ((ClaimsIdentity)identity).Claims
                .FirstOrDefault(c => c.Type == "guidSession");
            if (userClaim == null)
            {
                return null;
            }

            return userClaim.Value;
        }

        public static List<string> GetAgencies(IIdentity identity)
        {
            if (identity as ClaimsIdentity == null)
            {
                return new List<string>();
            }

            return ((ClaimsIdentity)identity).Claims
                .Where(c => c.Type == User.ClaimAgency)
                .Select(c => c.Value).ToList();
        }

        public static Dictionary<string, bool> GetDataflow(IIdentity identity)
        {
            if (identity as ClaimsIdentity == null)
            {
                return new Dictionary<string, bool>();
            }

            var result = new Dictionary<string, bool>();
            foreach (var item in ((ClaimsIdentity)identity).Claims
                .Where(c => c.Type == User.ClaimDataflow)
                .Select(c => c.Value).ToList())
            {
                result.Add(item, false);
            }
            foreach (var item in ((ClaimsIdentity)identity).Claims
                .Where(c => c.Type == User.ClaimDataflowOwner)
                .Select(c => c.Value).ToList())
            {
                result.Add(item, true);
            }

            return result;
        }

        public static Dictionary<string, bool> GetMetadataFlow(IIdentity identity)
        {
            if (identity as ClaimsIdentity == null)
            {
                return new Dictionary<string, bool>();
            }

            var result = new Dictionary<string, bool>();
            foreach (var item in ((ClaimsIdentity)identity).Claims
                .Where(c => c.Type == User.ClaimMetadataFlow)
                .Select(c => c.Value).ToList())
            {
                result.Add(item, false);
            }
            foreach (var item in ((ClaimsIdentity)identity).Claims
                .Where(c => c.Type == User.ClaimMetadataFlowOwner)
                .Select(c => c.Value).ToList())
            {
                result.Add(item, true);
            }

            return result;
        }

        public static List<string> GetCube(IIdentity identity)
        {
            if (identity as ClaimsIdentity == null)
            {
                return new List<string>();
            }

            return ((ClaimsIdentity)identity).Claims
                .Where(c => c.Type == User.ClaimCube)
                .Select(c => c.Value).ToList();
        }

        public static List<string> GetCubeOwner(IIdentity identity)
        {
            if (identity as ClaimsIdentity == null)
            {
                return new List<string>();
            }

            return ((ClaimsIdentity)identity).Claims
                .Where(c => c.Type == User.ClaimCubeOwner)
                .Select(c => c.Value).ToList();
        }

        public static List<string> GetFunctionality(IIdentity identity)
        {
            if (identity as ClaimsIdentity == null)
            {
                return new List<string>();
            }

            return ((ClaimsIdentity)identity).Claims
                .Where(c => c.Type == User.ClaimFunctionality)
                .Select(c => c.Value).ToList();
        }

        public static List<string> GetRules(IIdentity identity)
        {
            if (identity as ClaimsIdentity == null)
            {
                return new List<string>();
            }

            return ((ClaimsIdentity)identity).Claims
                .Where(c => c.Type == User.ClaimRule)
                .Select(c => c.Value).ToList();
        }

        public static List<string> GetCategory(IIdentity identity)
        {
            if (identity as ClaimsIdentity == null)
            {
                return new List<string>();
            }

            return ((ClaimsIdentity)identity).Claims
                .Where(c => c.Type == User.ClaimCategory)
                .Select(c => c.Value).ToList();
        }

        public static string GetUserEmail(IIdentity identity)
        {
            if (identity as ClaimsIdentity == null)
            {
                return null;
            }

            var userClaim = ((ClaimsIdentity)identity).Claims
                .FirstOrDefault(c => c.Type == User.ClaimEmail);
            if (userClaim == null)
            {
                return null;
            }

            return userClaim.Value;
        }

        public static bool HaveAgency(IIdentity identity, string agency)
        {
            var agencies = GetAgencies(identity);
            return agencies.Contains(agency);
        }

        static public bool HaveCube(IIdentity identity, string codeCube)
        {
            var cubes = GetCube(identity);
            cubes.AddRange(GetCubeOwner(identity));
            return cubes.Contains(codeCube);
        }

        static public bool HaveFunctionality(IIdentity identity, string functionality)
        {
            var functionalities = GetFunctionality(identity);
            return functionalities.Contains(functionality);
        }

        static public bool HaveCategory(IIdentity identity, string category)
        {
            var categories = GetCategory(identity);
            return categories.Contains(category);
        }
    }
}
