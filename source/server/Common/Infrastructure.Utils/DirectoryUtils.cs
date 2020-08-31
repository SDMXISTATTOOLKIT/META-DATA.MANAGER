using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.IO;
using Microsoft.Extensions.Configuration.Xml;
using Configuration;

namespace Utility
{
    /// <summary>
    /// Classe di utilità per la gestione e creazione di path temporanei.
    /// </summary>
    public class DirectoryUtils
    {
        /// <summary>
        /// Restituisce il path base temporaneo.
        /// </summary>
        public static string BaseTempPath
        {
            get
            {
                string tempPath = ConfigurationManager.AppSettings["TEMP_PATH"];

                if (tempPath != null && tempPath != "")
                {
                    return tempPath;
                }
                else
                {
                    return Path.GetTempPath();
                }
            }
        }

        /// <summary>
        /// Crea un path temporaneo unico.
        /// </summary>
        /// <returns>Percorso del path creato.</returns>
        public static string CreateTempPath()
        {
            string tempPath = BaseTempPath;

            string path = tempPath + Guid.NewGuid().GetHashCode().ToString("X") + @"\";

            if (!Directory.Exists(path))
            {
                Directory.CreateDirectory(path);
            }

            return path;
        }

        /// <summary>
        /// Indica se l'indirizzo rappresenta un'immagine.
        /// </summary>
        /// <param name="tipo"></param>
        /// <returns></returns>
        public static bool IsImage(string url)
        {
            if (url != "")
            {
                url = url.ToLower();

                string[] urlArr = url.Split('.');

                if (urlArr.Length > 0)
                {
                    string tipo = urlArr[urlArr.Length - 1];

                    return (tipo == "jpeg" || tipo == "jpg" || tipo == "png" || tipo == "gif" || tipo == "bmp");
                }

            }

            return false;
        }

        /// <summary>
        /// Cerca il path relativo relPath a partire dal path di base basePath risalendolo a ritroso finché non lo trova o finché non c'è più niente da cercare.
        /// </summary>
        /// <param name="basePath"></param>
        /// <param name="relPath"></param>
        /// <returns></returns>
        public static string FindPath(string basePath, string relPath)
        {
            do
            {
                string path = Path.Combine(basePath, relPath);

                if (Directory.Exists(path))
                {
                    return path;
                }

                int pos = basePath.LastIndexOf(@"\");

                if (pos > 0)
                    basePath = basePath.Substring(0, pos);
                else
                    basePath = "";

            }
            while (basePath != "");

            return "";
        }

        public static string FindFile(string basePath, string fileName)
        {
            do
            {
                string path = Path.Combine(basePath, fileName);

                if (File.Exists(path))
                {
                    return path;
                }

                int pos = basePath.LastIndexOf(@"\");

                if (pos > 0)
                    basePath = basePath.Substring(0, pos);
                else
                    basePath = "";

            }
            while (basePath != "");

            return "";
        }


    }

}
