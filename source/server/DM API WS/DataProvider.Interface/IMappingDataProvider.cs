using DDB.Entities;
using Microsoft.Extensions.Caching.Memory;
using System;
using System.Collections.Generic;
using System.Text;

namespace DataProvider
{
    public interface IMappingDataProvider
    {
        /// <summary>
        ///  Uploads a CSV data file in a temp table without any control (integrity checka, foreign key constraints, etc.)
        /// </summary>
        /// <param name="CSVSeparator">CSV separator used in the file.</param>
        /// <param name="CSVDelimiter">CSV delimiter used in the file.</param>
        /// <param name="hasHeader">Whether the CSV file has a header or not.</param>
        /// <param name="filePath">Path of the CSV file to be uploaded.</param>
        /// <param name="tid">Tid inserted client-side (null if not specified).</param>
        /// <param name="idMappingSpecialTimePeriod">(Optional) Id of the mapping with time period in .STAT format.</param>
        /// <returns>The name of the temp table created.</returns>
        string preloadCSV(char CSVSeparator, char CSVDelimiter, bool hasHeader, string filePath, string tid, IMemoryCache memoryCache, string guidSession, int idMappingSpecialTimePeriod);


        /// <summary>
        /// Returns the header of a CSV file. If the file is not a CSV file or is empty an exception is thrown. 
        /// If the file has no header, an array of string "Col 1, …, Col N" is returned.
        /// </summary>
        /// <param name="CSVSeparator">CSV separator used in the file.</param>
        /// <param name="CSVDelimiter">CSV delimiter used in the file.</param>
        /// <param name="hasHeader">Whether the CSV file has a header or not.</param>
        /// <param name="filePath">Path of the CSV file.</param>
        /// <returns>A list with the name of the columns to be shown in Mapping.</returns>
        string[] getCSVHeader(char CSVSeparator, char CSVDelimiter, bool hasHeader, string filePath);

        /// <summary>
        /// Creates a new mapping with its components.
        /// </summary>
        /// <param name="mapp">The mapping to be created.</param>
        /// <returns>The mapping id in case of success, otherwise an exception is thrown.</returns>
        int createDDBMapping(MappingWithComponents mapp);

        /// <summary>
        /// Returns a list of mappings WITHOUT their components.
        /// </summary>
        List<Mapping> getDDBMappings();

        /// <summary>
        /// Returns the requested mapping with its components.
        /// </summary>
        /// <param name="idMapping">The mapping id.</param>
        /// <returns></returns>
        MappingWithComponents getDDBMapping(int idMapping);

        /// <summary>
        /// Deletes a mapping together with its components.
        /// </summary>
        /// <param name="idMapping">The id of the mapping to be deleted.</param>
        /// <returns></returns>
        bool deleteDDBMapping(int idMapping);
    }
}
