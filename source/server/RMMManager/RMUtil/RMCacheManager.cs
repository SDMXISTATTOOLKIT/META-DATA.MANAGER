//using Infrastructure.STLogging.Factory;
//using Infrastructure.STLogging.Interface;
using System;
using System.Collections.Generic;
using System.IO;
using System.Text;

namespace RMUtil
{
    public class RMCacheManager
    {
        const string ReferenceMetadataDirName = "rm";
        const string StructureMetadataDirName = "sm";
        string CacheDir = null;
        string ReferenceMetadataDir = null;
        string StructureMetadataDir = null;

        private bool enabled;

        public RMCacheManager(string CacheDir, bool enable = true)
        {
            this.enabled = enable;
            this.CacheDir = CacheDir;
            if (!System.IO.Directory.Exists(CacheDir))
            {
                //STLoggerFactory.Logger.Log("Cache directory not found", LogLevelEnum.Warn);
                //CacheDir = null;
                System.IO.Directory.CreateDirectory(CacheDir);
            }
            else
            {
                ReferenceMetadataDir = RMUtil.RMUtility.concatFilePaths(CacheDir, ReferenceMetadataDirName);
                if (!System.IO.Directory.Exists(ReferenceMetadataDir))
                {
                    //STLoggerFactory.Logger.Log("ReferenceMetadata cache directory not found", LogLevelEnum.Warn);
                    //ReferenceMetadataDir = null;
                    System.IO.Directory.CreateDirectory(ReferenceMetadataDir);
                }
                StructureMetadataDir = RMUtil.RMUtility.concatFilePaths(CacheDir, StructureMetadataDirName); 
                if (!System.IO.Directory.Exists(StructureMetadataDir))
                {
                    //STLoggerFactory.Logger.Log("StructureMetadata cache directory not found", LogLevelEnum.Warn);
                    //StructureMetadataDir = null;
                    System.IO.Directory.CreateDirectory(StructureMetadataDir);
                }
            }
        }

        public string readPackageSearch(string lang, string metadataSetId, string q, string sort, int start, int rows)
        {
            if (!enabled)
            {
                return null;
            }
            string fileName = getPackageSearchFileName(lang, metadataSetId, q, sort, start, rows);
            string fileToRead = ReferenceMetadataDir + "/" + fileName;
            return readFile(fileToRead);
        }

        public bool storePackageSearch(string msg, string lang, string metadataSetId, string q, string sort, int start, int rows)
        {
            if (!enabled)
            {
                return false;
            }
            string fileName = getPackageSearchFileName(lang, metadataSetId, q, sort, start, rows);
            string fileToStore = ReferenceMetadataDir + "/" + fileName;
            return createFile(msg, fileToStore);
        }

        public bool deletePackageSearch(string lang, string metadataSetId, string q, string sort, int start, int rows)
        {
            if (!enabled)
            {
                return false;
            }
            string fileName = getPackageSearchFileName(lang, metadataSetId, q, sort, start, rows);
            string fileToRemove = ReferenceMetadataDir + "/" + fileName;
            return deleteFile(fileToRemove);
        }

        public string readPackageShow(string lang, string metadataSetId, string id)
        {
            if (!enabled)
            {
                return null;
            }
            string fileName = getPackageShowFileName(lang, metadataSetId, id);
            string fileToRead = ReferenceMetadataDir + "/" + fileName;
            return readFile(fileToRead);
        }

        public bool storePackageShow(string msg, string lang, string metadataSetId, string id)
        {
            if (!enabled)
            {
                return false;
            }
            string fileName = getPackageShowFileName(lang, metadataSetId, id);
            string fileToStore = ReferenceMetadataDir + "/" + fileName;
            return createFile(msg, fileToStore);
        }

        public bool deletePackageShow(string lang, string metadataSetId, string id)
        {
            if (!enabled)
            {
                return false;
            }
            string fileName = getPackageShowFileName(lang, metadataSetId, id);
            string fileToRemove = ReferenceMetadataDir + "/" + fileName;
            return deleteFile(fileToRemove);
        }

        public string readConceptScheme(string id, string agency, string version)
        {
            if (!enabled)
            {
                return null;
            }
            string fileName = getConceptSchemeFileName(id, agency, version);
            string fileToRead = StructureMetadataDir + "/" + fileName;
            return readFile(fileToRead);
        }

        public bool storeConceptScheme(string msg, string id, string agency, string version)
        {
            if (!enabled)
            {
                return false;
            }
            string fileName = getConceptSchemeFileName(id, agency, version);
            string fileToStore = StructureMetadataDir + "/" + fileName;
            return createFile(msg, fileToStore);
        }

        public bool deleteConceptScheme(string id, string agency, string version)
        {
            if (!enabled)
            {
                return false;
            }
            string fileName = getConceptSchemeFileName(id, agency, version);
            string fileToRemove = StructureMetadataDir + "/" + fileName;
            return deleteFile(fileToRemove);
        }

        public string readMSD(string id, string agency, string version)
        {
            if (!enabled)
            {
                return null;
            }
            string fileName = getMSDFileName(id, agency, version);
            string fileToRead = StructureMetadataDir + "/" + fileName;
            return readFile(fileToRead);
        }

        public bool storeMSD(string msg, string id, string agency, string version)
        {
            if (!enabled)
            {
                return false;
            }
            string fileName = getMSDFileName(id, agency, version);
            string fileToStore = StructureMetadataDir + "/" + fileName;
            return createFile(msg, fileToStore);
        }

        public bool deleteMSD(string id, string agency, string version)
        {
            if (!enabled)
            {
                return false;
            }
            string fileName = getMSDFileName(id, agency, version);
            string fileToRemove = StructureMetadataDir + "/" + fileName;
            return deleteFile(fileToRemove);
        }

        public string readRMMetadata(string metadataSetId, string reportId) {
            if (!enabled)
            {
                return null;
            }
            string fileName = getRMMetadataFileName(metadataSetId, reportId);
            string fileToRead = ReferenceMetadataDir + "/" + fileName;
            return readFile(fileToRead);
        }

        public bool storeRMMetadata(string msg, string metadataSetId, string reportId)
        {
            if (!enabled)
            {
                return false;
            }
            string fileName = getRMMetadataFileName(metadataSetId, reportId);
            string fileToStore = ReferenceMetadataDir + "/" + fileName;
            return createFile(msg, fileToStore);
        }

        public bool deleteRMMetadata(string metadataSetId, string reportId)
        {
            if (!enabled)
            {
                return false;
            }
            string fileNameAll = getRMMetadataFileName(null, null);
            string fileToRemoveAll = ReferenceMetadataDir + "/" + fileNameAll;
            if (System.IO.File.Exists(fileToRemoveAll)) {
                deleteFile(fileToRemoveAll);
            }

            if (metadataSetId != null)
            {
                string[] rmFiles = System.IO.Directory.GetFiles(ReferenceMetadataDir, "Metadataset-" + metadataSetId + "*");
                foreach (string rmFile in rmFiles)
                {
                    System.IO.File.Delete(rmFile);
                }

                string[] packageSearchFiles = System.IO.Directory.GetFiles(ReferenceMetadataDir, "PackageSearch-"+ metadataSetId+"*");
                foreach (string packageSearchFile in packageSearchFiles)
                {
                    System.IO.File.Delete(packageSearchFile);
                }

                string[] packageShowFiles = System.IO.Directory.GetFiles(ReferenceMetadataDir, "PackageShow-" + metadataSetId + "*");
                foreach (string packageShowFile in packageShowFiles)
                {
                    System.IO.File.Delete(packageShowFile);
                }
            }
            return true;
        }

        private string readFile(string filePath)
        {
            //STLoggerFactory.Logger.Log("Reading from cache file '" + filePath + "'", LogLevelEnum.Debug);
            //return System.IO.File.ReadAllText(filePath);
            string content;
            using (var s = new FileStream(filePath, FileMode.Open, FileAccess.Read, FileShare.Delete))
            using (var tr = new StreamReader(s))
            {
                content = tr.ReadToEnd();
            }
            return content;
        }

        private bool deleteFile(string filePath)
        {
            //STLoggerFactory.Logger.Log("Deleting cache file '" + filePath + "'", LogLevelEnum.Debug);
            System.IO.File.Delete(filePath);
            return true;
        }

        private bool createFile(string text, string filePath)
        {
            //var logWriter = new System.IO.StreamWriter(fileToStore);
            //logWriter.Write(msg);
            //logWriter.Dispose();

            using (FileStream file = new FileStream(filePath, FileMode.Create, FileAccess.Write, FileShare.Delete))
            using (StreamWriter writer = new StreamWriter(file, Encoding.Unicode))
            {
                writer.Write(text);
            }
            return true;
        }

        private string getPackageSearchFileName(string lang, string metadataSetId, string q, string sort, int start, int rows)
        {
            string qParam = null;
            if (q != null)
            {
                if (q.StartsWith("groups:\""))
                {
                    qParam = q.Substring(8, q.Length - 9);
                    qParam = qParam.Replace(' ', '_');
                }
            }
            string fileName = "PackageSearch-" + metadataSetId + "-" + lang + "-" + qParam + "-"+sort+"-"+start+"-"+rows;
            return fileName + ".json";
        }

        private string getPackageShowFileName(string lang, string metadataSetId, string id)
        {
            string fileName = "PackageShow-" + metadataSetId + "-" + lang + "-" + id;
            return fileName + ".json";
        }

        private string getConceptSchemeFileName(string id, string agency, string version)
        {
            string fileName = "ConceptScheme-"+id+"-"+agency+"-"+version;
            return fileName + ".json";
        }

        private string getMSDFileName(string id, string agency, string version)
        {
            string fileName = "MSD";
            if (id != null)
            {
                fileName += "-" + id;
            }
            if (agency != null)
            {
                fileName += "-" + agency;
            }
            if (version != null)
            {
                fileName += "-" + version;
            }

            if (fileName.Equals("MSD"))
            {
                fileName = "MSD-all";
            }

            return fileName+".json";
        }

        private string getRMMetadataFileName(string metadataSetId, string reportId)
        {
            if (metadataSetId == null && reportId != null)
            {
                throw new Exception("Parameter metadataSetId is required if reportId is used!");
            }
            string fileName = null;
            if (reportId != null)
            {
                fileName = "Metadataset-" + metadataSetId + "-Report-" + reportId;
            }
            else if (metadataSetId != null)
            {
                fileName = "metadataset-" + metadataSetId;
            }
            else
            {
                fileName = "metadataset-all";
            }
            if (fileName != null)
            {
                fileName += ".json";
            }
            return fileName;
        }

    }
}
