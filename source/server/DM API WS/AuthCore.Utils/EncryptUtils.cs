using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Security.Cryptography;
using System.Text;

namespace AuthCore.Utils
{
    public class EncryptUtils
    {
        static public byte[] ConvertFromHex(string hex)
        {
            return (from x in Enumerable.Range(0, hex.Length / 2)
                    select Convert.ToByte(hex.Substring(x * 2, 2), 16)).ToArray();
        }

        static public string ConvertToHex(byte[] bytes)
        {
            IEnumerable<string> values = from b in bytes
                                         select b.ToString("X2", CultureInfo.InvariantCulture);
            return string.Join(string.Empty, values);
        }

        static public byte[] Build(string plainText, byte[] salt, string algorithm)
        {
            byte[] plainText2 = ConvertToBytes(plainText);
            return Build(plainText2, salt, algorithm);
        }

        static public byte[] Build(byte[] plainText, byte[] salt, string algorithm)
        {
            if (plainText == null)
            {
                throw new ArgumentNullException("plainText");
            }
            if (salt == null)
            {
                throw new ArgumentNullException("salt");
            }
            if (algorithm == null)
            {
                throw new ArgumentNullException("algorithm");
            }
            using (var hashAlgorithm = HashAlgorithm.Create(algorithm))
            {
                if (hashAlgorithm == null)
                {
                    throw new ArgumentException($"Invalid algorithm: '{algorithm}'", algorithm);
                }
                int num = plainText.Length;
                byte[] array = new byte[num + salt.Length];
                for (int i = 0; i < num; i++)
                {
                    array[i] = plainText[i];
                }
                for (int j = 0; j < salt.Length; j++)
                {
                    array[j + num] = salt[j];
                }
                return hashAlgorithm.ComputeHash(array);
            }
        }

        static public byte[] ConvertToBytes(string value)
        {
            return Encoding.UTF8.GetBytes(value);
        }

        

        static public string EncrypPassword(string password, string salt, string algorithm)
        {
            byte[] byteSalt = !string.IsNullOrEmpty(salt) ? ConvertFromHex(salt) : new byte[0];
            algorithm = !string.IsNullOrEmpty(salt) || !string.IsNullOrEmpty(algorithm) ? algorithm : "MD5";
            byte[] array2 = Build(password, byteSalt, algorithm);

            return ConvertToHex(array2);
        }

        
    }
}
