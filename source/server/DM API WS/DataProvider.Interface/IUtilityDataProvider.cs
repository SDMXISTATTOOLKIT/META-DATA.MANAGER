using DataModel;
using DDB.Entities;
using NSI.Entities;
using System;
using System.Collections.Generic;
using System.Data;
using System.Text;

namespace DataProvider
{
    public interface IUtilityDataProvider
    {
        /// <summary>
        /// Resets the DDB to its original state (after initialization).
        /// <returns>True in case of success, otherwise an exception is thrown.</returns>
        /// </summary>
        bool DDBReset();

        /// <summary>
        /// Return the list of codelist with items for each dsd
        /// </summary>
        /// <param name="dsdCheck">dsd to be check</param>
        /// <returns></returns>
        Dictionary<string, List<string>> GetItemsCodelistFromDsd(List<string> dsdCheck);

        /// <summary>
        /// Returns the items of each codelist 
        /// </summary>
        /// <param name="codeListCheck">dsd to be check</param>
        /// <returns></returns>
        Dictionary<string, List<string>> GetItemsFromCodelist(List<ArtefactIdentity> codeListCheck);
        
        /// <summary>
        /// Syncs codelist from MSDB to DDB. Insert all Items from MSDB to DDB (only insert operation, not remove the code not present in MSDB)
        /// </summary>
        /// <param name="itemsCodeListToSync">Codelist to sync</param>
        /// <returns></returns>
        void SyncCodeList(Dictionary<string, List<string>> itemsCodeListToSync);

        /// <summary>
        /// Gets a DSD report and compare the structure 
        /// </summary>
        /// <param name="dsdReport">Report with structure of DSD to compare.</param>
        /// <returns>true if the strcuture is compatible</returns>
        bool CompareDSD(DsdReport dsdReport);

        /// <summary>
        /// Upgrade source DSD with target DSD
        /// </summary>
        /// <param name="dsdReport">DSD report</param>
        /// <returns></returns>
        bool UpgradeCube(DsdReport dsdReport);

        /// <summary>
        /// Gets all dataflow id used by specific DSD
        /// </summary>
        /// <param name="artefactIdentity">The dsd id.</param>
        /// <returns>Id of dataflow</returns>
        List<int> GetDataFlowsFromDSD(ArtefactIdentity artefactIdentity);
        
        /// <summary>
        /// Gets all columns of cube 
        /// </summary>
        /// <param name="idCube">The cube id.</param>
        /// <returns>Column of Cube</returns>
        List<string> GetFieldForCube(int idCube);

        /// <summary>
        /// Gets all columns of cube 
        /// </summary>
        /// <param name="idCube">The cube id.</param>
        /// <param name="optionsTable">The filter</param>
        /// <returns>All series of cube</returns>
        DataResults GetSeriesForCube(int idCube, DDBDataflow ddbDataflow);

        /// <summary>
        /// Deletes series
        /// </summary>
        /// <param name="idCube">The cube id.</param>
        /// <param name="sId">List of series Id</param>
        void DeleteSeries(int idCube, List<int> sId);

        /// <summary>
        /// Gets all dsds with dataflow associated
        /// </summary>
        /// <returns>All series of cube</returns>
        List<DsdWithDataflow> GetDSDWithDataflow();
        
        /// <summary>
        /// Removes temp tables 
        /// </summary>
        /// <param name="table">The name of the table to be removed</param>
        void RemoveOldTempTable(string table);
    }
}
