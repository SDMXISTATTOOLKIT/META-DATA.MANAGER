using DDB.Entities;
using Infrastructure.Utils;
using Microsoft.Extensions.Caching.Memory;
using Org.Sdmxsource.Sdmx.Api.Model.Objects;
using Org.Sdmxsource.Sdmx.Api.Model.Objects.DataStructure;
using System;
using System.Collections.Generic;
using System.Data;
using System.Text;

namespace DataProvider
{
    public enum ImportTypeEnum
    {
        Series = 0,
        Data = 1,
        SeriesAndData = 2
    }

    public interface ILoaderDataProvider
    {
        /// <summary>
        /// Uploads an SDMX data file in a temp table without any control (integrity checka, foreign key constraints, etc.)
        /// </summary>
        /// <param name="filePath">Path of the SDMX file to be uploaded.</param>
        /// <param name="dsd">DSD referenced by the cube.</param>
        /// <param name="tid">Tid inserted client-side (null if not specified).</param>
        /// <returns>The name of the temp table created.</returns>
        string preloadSDMXML(string filePath, ISdmxObjects sdmxObjects, string tid, IMemoryCache memoryCache, string guidSession);

        /// <summary>
        /// Imports data in a cube (with Series, Data or SeriesAndData Import Type)
        /// </summary>
        /// <param name="importType">Import Type (Series, Data or SeriesAndData).</param>
        /// <param name="tempTableName">Temp table from whom the import process must start.</param>
        /// <param name="idMapping">Id of the mapping to whom the table refers. 
        /// It is 0 if you are trying to import an SDMX file and so mapping does not exist.</param>
        /// <param name="idCube">Id of the cube where data are imported. (Used for SDMX-ML file uploads)</param>
        /// <param name="filePath">Path of the file from whom the temp table has been generated.</param>
        /// <param name="loadTime">Time elapsed for loading csv in temp table.</param>
        /// <param name="embargo">Whether the data have to be embargoed or not.</param>
        /// <param name="ignoreCuncurrentUpload">Ignore cuncurrency upload protection</param>
        /// <param name="checkFiltAttributes">Whether to check the coherence of attributes on FiltS table or not</param>
        /// <returns>A report of the import.</returns>
        SdmxReport importData(ImportTypeEnum importType, string tempTableName, int idMapping, int idCube, string filePath, long loadTime, bool embargo, bool ignoreCuncurrentUpload, bool checkFiltAttributes);

        /// <summary>
        /// Imports an "Attribute file" in a cube.
        /// </summary>
        /// <param name="idMapping">Id of the mapping to whom the Attribute File refers.</param>
        /// <param name="filePath">Path of the CSV file to be uploaded.</param>
        /// <returns>True in case of success, otherwise an exception is thrown.</returns>
        bool importAttributeFile(int idMapping, string filePath);

        /// <summary>
        /// Disembargoes a cube.
        /// </summary>
        /// <param name="idCube">Id of the cube to be disembargoed.</param>
        /// <returns>True in case of success, otherwise an exception is thrown.</returns>
        bool disembargoCube(int idCube);

        /// <summary>
        /// Delete all data contained in a cube.
        /// </summary>
        /// <param name="idCube">Id of the cube to be emptied.</param>
        /// <returns>True in case of success, otherwise an exception is thrown.</returns>
        bool emptyCube(int idCube);


        void StartUploadCube(int cubeId, DateTime startOperation);
        UploadOps StatusUploadCube(int cubeId);
        void EndUploadCube(int cubeId, DateTime startOperation);

        string getDataflowFromXmlImport(string filePath);

    }
}
