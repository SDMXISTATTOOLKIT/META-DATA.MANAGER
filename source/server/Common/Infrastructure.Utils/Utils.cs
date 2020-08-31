using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Configuration;
using System.IO;
using System.Diagnostics;
using System.Security.Cryptography;
using System.Text.RegularExpressions;
using System.Drawing;
using System.IO.Compression;
using System.Threading.Tasks;
using UtfUnknown;
using AuthCore.Model;
using System.Security.Claims;
using System.Security.Principal;

namespace Utility
{
    /// <summary>
    /// General Utilities 
    /// </summary>
    public static class Utils
    {

        public static ILogger Logger = new SimpleLogger();

        public static IConfigReader ConfigReader = new AppSettingsConfigReader();

        static MD5 mMD5Prov = null;
        static Random mRnd = new Random();

        // This constant is used to determine the keysize of the encryption algorithm in bits.
        // We divide this by 8 within the code below to get the equivalent number of bytes.
        private const int Keysize = 128;

        // This constant determines the number of iterations for the password bytes generation function.
        private const int DerivationIterations = 1000;


        public static string GetConfigStrVal(string key)
        {
            return ConfigReader.GetConfigStrVal(key);
        }


        public static int GetConfigIntVal(string key)
        {
            return ConfigReader.GetConfigIntVal(key);
        }


        public static bool GetConfigBoolVal(string key)
        {
            return ConfigReader.GetConfigBoolVal(key);
        }


        public static void ShellExecDocument(string path)
        {
            ProcessStartInfo pInf = new ProcessStartInfo(path);

            pInf.UseShellExecute = true;

            try
            {
                using (Process exeProcess = Process.Start(pInf))
                {

                }
            }
            catch (Exception ex)
            {
                Logger.Log("ShellExecDocument Error - " + ex.Message);
            }
        }

        public static string GetBasePath()
        {
            return AppDomain.CurrentDomain.BaseDirectory;
        }



        /// <summary>
        /// Retorna una cadena de bytes en hex
        /// </summary>
        /// <param name="str"></param>
        /// <returns></returns>
        public static string EncodeMD5String(string str)
        {
            Byte[] originalBytes;
            Byte[] encodedBytes;
            MD5 md5;

            md5 = new MD5CryptoServiceProvider();

            originalBytes = System.Text.Encoding.GetEncoding("UTF-8").GetBytes(str); //ASCIIEncoding.Default.GetBytes(str);
            encodedBytes = md5.ComputeHash(originalBytes);

            return encodedBytes.Select(b => b.ToString("X2")).Aggregate((s1, s2) => s1 + s2);
        }

        public static Guid GetGuidFromString(string txt)
        {
            Byte[] originalBytes;
            Byte[] encodedBytes;

            if (mMD5Prov == null)
                mMD5Prov = new MD5CryptoServiceProvider();

            originalBytes = System.Text.Encoding.GetEncoding("UTF-8").GetBytes(txt); //ASCIIEncoding.Default.GetBytes(str);
            encodedBytes = mMD5Prov.ComputeHash(originalBytes);

            return new Guid(encodedBytes.Take(16).ToArray());
        }



        /// <summary>
        /// Conviente un datetime en UTM en timestamp unix (segundos desde 1/1/1970 00:00:00)
        /// </summary>
        /// <param name="value"></param>
        /// <returns></returns>
        public static long ConvertToTimestamp(DateTime value)
        {
            //create Timespan by subtracting the value provided from
            //the Unix Epoch
            TimeSpan span = (value.ToUniversalTime() - new DateTime(1970, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc));

            //return the total seconds (which is a UNIX timestamp)
            return (long)span.TotalSeconds;
        }



        /// <summary>
        /// Borra de manera silente todos los file de una carpeta
        /// </summary>
        /// <param name="path"></param>
        public static void ClearDirectory(string path)
        {
            foreach (string file in Directory.GetFiles(path))
            {
                try
                {
                    File.Delete(file);
                }
                catch { }
            }
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


        public static List<string> GetAllInstances(string pagesText, Regex regex)
        {
            List<string> lst = new List<string>();

            for (Match m = regex.Match(pagesText); m.Success; m = m.NextMatch())
            {
                if (m.Groups.Count > 1)
                    lst.Add(m.Groups[1].Value);
                else
                    lst.Add(m.Groups[0].Value);
            }

            return lst;
        }

        public static string CustEncrypt(string str)
        {

            string ori = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
            string sust = "txyzbcdeafghijklnopuwqvmrsTXYZBCDEAFGHIJKLNOPUWQVMRS6589047213";

            return SustChars(str, ori, sust);

        }

        public static string CustDecrypt(string str)
        {

            string ori = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
            string sust = "txyzbcdeafghijklnopuwqvmrsTXYZBCDEAFGHIJKLNOPUWQVMRS6589047213";

            return SustChars(str, sust, ori);
        }


        private static string SustChars(string str, string ori, string sust)
        {
            string res = "";

            Dictionary<char, char> sustDict = new Dictionary<char, char>();
            for (int k = 0; k < ori.Length; k++)
                sustDict[ori[k]] = sust[k];

            foreach (char c in str)
            {
                if (sustDict.ContainsKey(c))
                    res += sustDict[c];
                else
                    res += c;
            }

            return res;
        }

        public static Random Rnd
        {
            get { return mRnd; }
        }

        public static bool isCustomException(Exception ex)
        {
            if (ex!=null && ex.Data["logMsg"] != null)
            {
                return true;
            }
            return false;
        }

        public static Exception getCustomException(string code, string logMsg, Infrastructure.STLogging.Interface.LogLevelEnum logLevel)
        {
            Exception ex = new Exception(code);
            ex.Data["logMsg"] = logMsg;
            ex.Data["logLevel"] = logLevel;

            return ex;
        }

        public static string Encrypt(string plainText, string passPhrase)
        {
            // Salt and IV is randomly generated each time, but is preprended to encrypted cipher text
            // so that the same Salt and IV values can be used when decrypting.  
            var saltStringBytes = Generate128BitsOfRandomEntropy();
            var ivStringBytes = Generate128BitsOfRandomEntropy();
            var plainTextBytes = Encoding.UTF8.GetBytes(plainText);
            using (var password = new Rfc2898DeriveBytes(passPhrase, saltStringBytes, DerivationIterations))
            {
                var keyBytes = password.GetBytes(Keysize / 8);
                using (var symmetricKey = new RijndaelManaged())
                {
                    symmetricKey.BlockSize = 128;
                    symmetricKey.Mode = CipherMode.CBC;
                    symmetricKey.Padding = PaddingMode.PKCS7;
                    using (var encryptor = symmetricKey.CreateEncryptor(keyBytes, ivStringBytes))
                    {
                        using (var memoryStream = new MemoryStream())
                        {
                            using (var cryptoStream = new CryptoStream(memoryStream, encryptor, CryptoStreamMode.Write))
                            {
                                cryptoStream.Write(plainTextBytes, 0, plainTextBytes.Length);
                                cryptoStream.FlushFinalBlock();
                                // Create the final bytes as a concatenation of the random salt bytes, the random iv bytes and the cipher bytes.
                                var cipherTextBytes = saltStringBytes;
                                cipherTextBytes = cipherTextBytes.Concat(ivStringBytes).ToArray();
                                cipherTextBytes = cipherTextBytes.Concat(memoryStream.ToArray()).ToArray();
                                memoryStream.Close();
                                cryptoStream.Close();
                                return Convert.ToBase64String(cipherTextBytes);
                            }
                        }
                    }
                }
            }
        }

        public static string Decrypt(string cipherText, string passPhrase)
        {
            // Get the complete stream of bytes that represent:
            // [32 bytes of Salt] + [16 bytes of IV] + [n bytes of CipherText]
            var cipherTextBytesWithSaltAndIv = Convert.FromBase64String(cipherText);
            // Get the saltbytes by extracting the first 16 bytes from the supplied cipherText bytes.
            var saltStringBytes = cipherTextBytesWithSaltAndIv.Take(Keysize / 8).ToArray();
            // Get the IV bytes by extracting the next 16 bytes from the supplied cipherText bytes.
            var ivStringBytes = cipherTextBytesWithSaltAndIv.Skip(Keysize / 8).Take(Keysize / 8).ToArray();
            // Get the actual cipher text bytes by removing the first 64 bytes from the cipherText string.
            var cipherTextBytes = cipherTextBytesWithSaltAndIv.Skip((Keysize / 8) * 2).Take(cipherTextBytesWithSaltAndIv.Length - ((Keysize / 8) * 2)).ToArray();

            using (var password = new Rfc2898DeriveBytes(passPhrase, saltStringBytes, DerivationIterations))
            {
                var keyBytes = password.GetBytes(Keysize / 8);
                using (var symmetricKey = new RijndaelManaged())
                {
                    symmetricKey.BlockSize = 128;
                    symmetricKey.Mode = CipherMode.CBC;
                    symmetricKey.Padding = PaddingMode.PKCS7;
                    using (var decryptor = symmetricKey.CreateDecryptor(keyBytes, ivStringBytes))
                    {
                        using (var memoryStream = new MemoryStream(cipherTextBytes))
                        {
                            using (var cryptoStream = new CryptoStream(memoryStream, decryptor, CryptoStreamMode.Read))
                            {
                                var plainTextBytes = new byte[cipherTextBytes.Length];
                                var decryptedByteCount = cryptoStream.Read(plainTextBytes, 0, plainTextBytes.Length);
                                memoryStream.Close();
                                cryptoStream.Close();
                                return Encoding.UTF8.GetString(plainTextBytes, 0, decryptedByteCount);
                            }
                        }
                    }
                }
            }
        }

        /// <summary>
        /// Detects the type of Encoding
        /// </summary>
        /// <param name="srcFile"></param>
        /// <returns></returns>
        public static Encoding GetFileEncoding(string srcFile)
        {
            DetectionResult result = CharsetDetector.DetectFromFile(srcFile);
            var strEncodeName = result.Detected.EncodingName;
            if ((result.Detected.Encoding == null || result.Detected.Encoding.WebName.Contains("ISO-8859-", StringComparison.InvariantCultureIgnoreCase)) && result.Details != null && result.Details.Count > 1)
            {
                if (result.Detected != null && result.Detected.EncodingName != null && result.Detected.EncodingName.Contains("ISO-8859-", StringComparison.InvariantCultureIgnoreCase))
                {
                    var encodeName = result.Details.FirstOrDefault(i => i.EncodingName.Contains("WINDOWS-", StringComparison.InvariantCultureIgnoreCase));
                    if (encodeName != null)
                    {
                        strEncodeName = encodeName.EncodingName;
                    }
                }
            }
            return result.Detected.Encoding ?? CodePagesEncodingProvider.Instance.GetEncoding(strEncodeName) ?? Encoding.Default;
        }

        private static byte[] Generate128BitsOfRandomEntropy()
        {
            var randomBytes = new byte[16]; // 16 Bytes will give us 128 bits.
            using (var rngCsp = new RNGCryptoServiceProvider())
            {
                // Fill the array with cryptographically secure random bytes.
                rngCsp.GetBytes(randomBytes);
            }
            return randomBytes;
        }

        public static async Task<MemoryStream> ZipInMemory(MemoryStream memoryStream, string fileNameToZip, CompressionLevel compressionLevel = CompressionLevel.Fastest)
        {
            var ms = new MemoryStream();
            using (var archive = new ZipArchive(ms, ZipArchiveMode.Create, true))
            {
                const int bufferSize = 1024 * 1024 * 5;
                var buffer = new byte[bufferSize];
                int bytesRead = 0;
                var zipArchiveEntry = archive.CreateEntry(fileNameToZip, compressionLevel);
                using (var zipStream = zipArchiveEntry.Open())
                {
                    do
                    {
                        var rst = await memoryStream.ReadAsync(buffer, bytesRead, bufferSize);
                        bytesRead += rst;
                        if (buffer.Length == 0)
                        {
                            break;
                        }
                        await zipStream.WriteAsync(buffer, 0, rst);
                        await zipStream.FlushAsync();
                    } while (bytesRead < memoryStream.Length);
                }
            }
            ms.Position = 0;
            return ms;
        }

        public static async Task<MemoryStream> UnZipInMemory(MemoryStream memoryStream, string fileNameToUnZip, CompressionLevel compressionLevel = CompressionLevel.Fastest)
        {
            var ms = new MemoryStream();
            try
            {
                using (var archive = new ZipArchive(memoryStream, ZipArchiveMode.Read, true))
                {
                    const int bufferSize = 1024 * 1024 * 5;
                    var buffer = new byte[bufferSize];
                    int bytesRead = 0;
                    var zipArchiveEntry = archive.GetEntry(fileNameToUnZip);
                    using (var zipStream = zipArchiveEntry.Open())
                    {
                        do
                        {
                            var rst = await zipStream.ReadAsync(buffer);
                            bytesRead += rst;
                            if (buffer.Length == 0)
                            {
                                break;
                            }
                            await ms.WriteAsync(buffer, 0, rst);
                            await ms.FlushAsync();
                        } while (bytesRead < zipArchiveEntry.Length);
                    }
                    memoryStream.Dispose();
                }
                ms.Position = 0;
                return ms;
            }
            catch (Exception)
            {
                ms.Dispose();
                throw;
            }
        }

        static public string[] CsvParser(string csvText, char textDelimiter, char columnSeparator)
        {
            var tokens = new List<string>();

            var last = -1;
            var current = 0;
            var inText = false;

            while (current < csvText.Length)
            {
                if (csvText[current] == textDelimiter)
                {
                    inText = !inText;
                }
                else if (csvText[current] == columnSeparator)
                {
                    if (!inText)
                    {
                        tokens.Add(csvText.Substring(last + 1, (current - last)).Trim(' ', columnSeparator).Replace(textDelimiter.ToString(), ""));
                        last = current;
                    }
                }
                current++;
            }

            if (last != csvText.Length - 1)
            {
                tokens.Add(csvText.Substring(last + 1).Trim().Replace(textDelimiter.ToString(), ""));
            }

            return tokens.ToArray();
        }

        public static bool HaveOwnershipMetadataFlow(IUserData userData, string checkMetadataFlow)
        {
            return userData.MetadataFlowOwner.Contains(checkMetadataFlow);
        }

        public static bool HaveOwnershipCube(IUserData userData, string checkCube)
        {
            return userData.CubeOwner.Contains(checkCube);
        }

        public static bool HaveOwnershipMetadataFlow(IIdentity identity, string checkMetadataset)
        {
            var claimsIdentity = identity as ClaimsIdentity;
            if (claimsIdentity == null)
            {
                return false;
            }
            var userMetadataset = claimsIdentity.Claims
                .Where(c => c.Type == User.ClaimMetadataFlowOwner)
                .Select(c => c.Value).ToList();

            return userMetadataset.Contains(checkMetadataset);
        }

        public static bool HaveOwnershipDataflow(IUserData userData, string checkDataflow)
        {
            return userData.DataflowOwner.Contains(checkDataflow);
        }
        public static bool HaveOwnershipDataflow(IIdentity identity, string checkDataflow)
        {
            var claimsIdentity = identity as ClaimsIdentity;
            if (claimsIdentity == null)
            {
                return false;
            }
            var userDataflow = claimsIdentity.Claims
                .Where(c => c.Type == User.ClaimDataflowOwner)
                .Select(c => c.Value).ToList();

            return userDataflow.Contains(checkDataflow);
        }

        public static string GetUsername(IIdentity identity)
        {
            var claimsIdentity = identity as ClaimsIdentity;
            if (claimsIdentity == null)
            {
                return null;
            }
            return claimsIdentity.Claims
                .Where(c => c.Type == User.ClaimUsername)
                .Select(c => c.Value).FirstOrDefault();
        }

        //var userAgencies = ((ClaimsIdentity)_contextAccessor.HttpContext.User.Identity).Claims
        //        .Where(c => c.Type == User.ClaimAgency)
        //        .Select(c => c.Value).ToList();

    }
}

