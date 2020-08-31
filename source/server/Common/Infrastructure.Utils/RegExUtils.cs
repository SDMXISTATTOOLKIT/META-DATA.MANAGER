using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace Utility
{
    public class RegExUtils
    {
        static Dictionary<string, Regex> RegExDict = new Dictionary<string, Regex>();
        static int MaxCacheSize = 1000;
        static bool MaxCacheSizeReached = false;


        /// <summary>
        /// Creates and return a Regular Expresion 8with IgnoreCase option). 
        /// A cache of compiled expresions is mantained for fast processing. Highly mutating expressions should not be cached
        /// </summary>
        /// <param name="expr"></param>
        /// <param name="cache"></param>
        /// <returns></returns>
        public static Regex GetRegEx(string expr, bool cache)
        {
            RegexOptions otherOptions = RegexOptions.IgnoreCase;

            if (cache)
            {
                lock (RegExDict)
                {
                    if (RegExDict.ContainsKey(expr))
                        return RegExDict[expr];
                                        
                    Regex ex = new Regex(expr, RegexOptions.Compiled | otherOptions);

                    if(RegExDict.Count < MaxCacheSize)
                        RegExDict.Add(expr, ex);
                    else if(!MaxCacheSizeReached)
                    {
                        Utils.Logger.Log(LogLevelEnum.Info, "Max RegEx cache size reached.");
                        MaxCacheSizeReached = true;
                    }

                    return ex;
                }
            }
            else
                return new Regex(expr, otherOptions);
        }


        /// <summary>
        /// gets the first match (groups) instance in a soruce text.
        /// </summary>
        /// <param name="srcText"></param>
        /// <param name="exprArr"></param>
        /// <returns></returns>
        public static string[] GetFirstMatch(string srcText, string expr, bool cache = false)
        {
            if (srcText == null) return null;

            Regex rex = GetRegEx(expr, cache);

            Match m = rex.Match(srcText);

            if (m.Success)
                return m.Groups.Cast<Group>().Select(g => g.Value).ToArray();
            else
                return null;
        }

        /// <summary>
        /// gets all matches (groups) instances in a soruce text.
        /// </summary>
        /// <param name="srcText"></param>
        /// <param name="exprArr"></param>
        /// <returns></returns>
        public static string[][] GetMatches(string srcText, string expr, bool cache = false)
        {
            if (srcText == null) return null;

            Regex rex = GetRegEx(expr, cache);

            return rex.Matches(srcText).Cast<Match>().Select(m => m.Groups.Cast<Group>().Select(g => g.Value).ToArray()).ToArray();
        }


        /// <summary>
        /// For each expression gets the first match (groups) instance in a soruce text.
        /// Is each expression is applied after the last match
        /// we get a null in the array when a macth fails
        /// </summary>
        /// <param name="srcText"></param>
        /// <param name="exprArr"></param>
        /// <returns></returns>
        public static string[][] GetMatchSeries(string srcText, string[]  exprArr, bool cache = false)
        {
            if (srcText == null) return null;

            List<string[]> lstRes = new List<string[]>();

            int pos = 0;

            foreach(string exprStr in exprArr)
            {
                Regex rex = GetRegEx(exprStr, cache);

                Match m = rex.Match(srcText, pos);

                if (m.Success)
                {
                    lstRes.Add(m.Groups.Cast<Group>().Select(g => g.Value).ToArray());
                    pos = m.Index + m.Length;
                }
                else
                    lstRes.Add(null);
            }

            //if we have at least one match
            if (lstRes.Where(m => m != null).Count() > 0)
                return lstRes.ToArray();
            else
                return null;
        }


        /// <summary>
        /// For each expression gets All match (groups) instance in a soruce text.
        /// Is each expression is applied after the last match
        /// we get a null in the array when a macth fails
        /// </summary>
        /// <param name="srcText"></param>
        /// <param name="exprArr"></param>
        /// <returns></returns>
        public static string[][][] GetAllMatchSeries(string srcText, string[] exprArr, bool cache = false)
        {
            if (srcText == null) return null;

            List<string[][]> lstResTot = new List<string[][]>();
            
            int pos = 0;
            Match m = null;

            while (m == null || m.Success)
            {
                List<string[]> lstRes = new List<string[]>();

                foreach (string exprStr in exprArr)
                {
                    Regex rex = GetRegEx(exprStr, cache);

                    m = rex.Match(srcText, pos);

                    if (m.Success)
                    {
                        lstRes.Add(m.Groups.Cast<Group>().Select(g => g.Value).ToArray());
                        pos = m.Index + m.Length;
                    }
                    else
                        lstRes.Add(null);
                }

                //if we have at least one match
                if( lstRes.Where(mm => mm != null).Count()>0)
                    lstResTot.Add(lstRes.ToArray());
            }

            return lstResTot.ToArray();
        }

        /// <summary>
        /// Returns a fragment of text  until a stop word (a number of times)
        /// </summary>
        public static string GetMatchFragment(string srcText, string stratExpr, string stopWord, int times, bool cache = false)
        {
            if (stratExpr != null)
            {
                Regex rex1 = GetRegEx(stratExpr, cache);

                int pos1=0, len1=0;
                int pos2 = 0, len2 = 0;
                int cnt = 0;

                Match m1 = rex1.Match(srcText);

                if (m1.Success)
                {
                    pos1 = m1.Index;
                    len1 = m1.Length;
                    pos2 = pos1+len1;
                    len2 = stopWord.Length;

                    while (cnt < times && (pos2 = srcText.IndexOf(stopWord, pos2 + len2)) > 0 )
                        cnt++;

                    if (pos2 > 0)
                        return srcText.Substring(pos1 + len1, pos2 - (pos1 + len1));
                }
            }

            return null;
        }

        /// <summary>
        /// Replaces the matches with a given string (optionaly a max num of times).
        /// </summary>
        /// <param name="srcText"></param>
        /// <param name="regExpr"></param>
        /// <param name="replace"></param>
        /// <param name="times"></param>
        /// <param name="cache"></param>
        /// <returns></returns>
        public static string Replace(string srcText, string regExpr, string replace, int times = -1, bool cache = false)
        {
            string res = null;

            if (regExpr != null && srcText!=null)
            {
                Regex rex = GetRegEx(regExpr, cache);

                if(times > 0)
                    res = rex.Replace(srcText, replace, times);
                else
                    res = rex.Replace(srcText, replace);
            }

            return res;
        }

        /// <summary>
        /// Returns a fragment of text between the given expresions (excluding the matching texts)
        /// </summary>
        /// <param name="srcText">If null or not matchig and !strict is considered the begining of the string</param>
        /// <param name="exprArr">If null or not matchig and !strict is considered the end of the string</param>
        /// <returns></returns>
        public static string GetMatchFragment(string srcText, string stratExpr, string endExpr, bool cache = false)
        {
            int p1, p2;

            return GetMatchFragment(srcText, stratExpr, endExpr, true, out p1, out p2, cache);
        }

        /// <summary>
        /// Returns a fragment of text between the given expresions (excluding the matching texts)
        /// </summary>
        /// <param name="srcText">If null or not matchig and !strict is considered the begining of the string</param>
        /// <param name="exprArr">If null or not matchig and !strict is considered the end of the string</param>
        /// <returns></returns>
        public static string GetMatchFragment(string srcText, string stratExpr, string endExpr, bool strict, out int p1, out int p2, bool cache = false)
        {
            p1 = 0;
            p2 = 0;
            
            if (srcText == null) return null;

            int pos1 = 0, pos2 = srcText.Length;
            int len1 = 0, len2 = 0;

            if (stratExpr != null && stratExpr != "")
            {
                Regex rex1 = GetRegEx(stratExpr, cache);
                Match m1 = rex1.Match(srcText);
                if (m1.Success)
                {
                    pos1 = m1.Index;
                    len1 = m1.Length;
                }
                else if (strict)
                    return null;
            }

            if (endExpr != null && endExpr != "")
            {
                Regex rex2 = GetRegEx(endExpr, cache);
                Match m2 = rex2.Match(srcText, pos1+len1);
                if (m2.Success)
                {
                    pos2 = m2.Index;
                    len2 = m2.Length;
                }
                else if (strict)
                    return null;
            }

            p1 = pos1 + len1;
            p2 = pos2;

            return srcText.Substring(pos1+len1, pos2 - (pos1+len1));
        }

        /// <summary>
        /// Returns all fragments of text between the given expresions
        /// </summary>
        /// <param name="srcText"></param>
        /// <param name="stratExpr"></param>
        /// <param name="endExpr"></param>
        /// <param name="strict"></param>
        /// <returns></returns>
        public static string[] GetAllMatchFragments(string srcText, string stratExpr, string endExpr, bool strict = true)
        {
            int p1, p2;
            string res = "";
            List<string> lstRes = new List<string>();

            while (res != null && srcText!="")
            {
                res = GetMatchFragment(srcText, stratExpr, endExpr, strict, out p1, out p2);
                if( res != null)
                {
                    lstRes.Add(res);
                    srcText = srcText.Substring(p2);
                }
            }

            return lstRes.ToArray();
        }

        
        /// <summary>
        /// Gets an URL from a given template URL and a serie of regular expressions
        /// For each expression gets the first match (groups) instance in a soruce text to substitute in the template URL
        /// Is each expression is applied after the last match
        /// The template has the place holders for matching groups:  {e0g0}, {e0g1},  {e0g2} ,..., {eXgY}
        /// </summary>
        /// <returns></returns>
        public static string GetUrlByTemplate(string templateUrl, string srcText, string[] exprArr, bool cache = false)
        {
            string[][] matchGroups = GetMatchSeries(srcText, exprArr);

            Regex rex = GetRegEx(@"\{e(\d+)g(\d+)\}", cache);
            
            var res = rex.Matches(templateUrl).Cast<Match>().Select(m => new { TAG = m.Groups[0].Value, VALUE = matchGroups[int.Parse(m.Groups[1].Value)][int.Parse(m.Groups[2].Value)]}).ToArray();

            foreach (var r in res)
                templateUrl = templateUrl.Replace(r.TAG, r.VALUE);

            return templateUrl;
        }

        /// <summary>
        /// Gets an URL from a given template URL and a serie of regular expressions
        /// For each expression gets the first match (groups) instance in a soruce text to substitute in the template URL
        /// Is each expression is applied after the last match
        /// The template has the place holders for matching groups:  {g0}, {g1},  {g2} ,..., {gY}
        /// </summary>
        /// <returns></returns>
        public static string GetUrlByTemplate(string templateUrl, string srcText, string exprArr, bool cache = false)
        {
            string[][] matchGroups = GetMatchSeries(srcText, new string[] { exprArr });

            Regex rex = GetRegEx(@"\({g\(d+)\})", cache);

            var res = rex.Matches(templateUrl).Cast<Match>().Select(m => new { TAG = m.Groups[0].Value, VALUE = matchGroups[0][int.Parse(m.Groups[1].Value)] }).ToArray();

            foreach (var r in res)
                templateUrl = templateUrl.Replace(r.TAG, r.VALUE);

            return templateUrl;
        }


        /// <summary>
        /// Substituye todos los caracteres en src con los respectivos en dest
        /// </summary>
        /// <param name="txt"></param>
        /// <param name="src"></param>
        /// <param name="dest"></param>
        /// <returns></returns>
        public static string ReplaceAny(string txt, string src, string dest)
        {
            char[] srcArr = src.ToCharArray();
            char[] destArr = dest.ToCharArray();

            for (int k = 0; k < srcArr.Length; k++)
            {
                if (destArr.Length > k)
                    txt = txt.Replace(srcArr[k], destArr[k]);
                else
                    txt = txt.Replace(srcArr[k].ToString(), "");
            }

            return txt;
        }

    }
}
