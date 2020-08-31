using MA.Entities;
using Microsoft.AspNetCore.Http;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.IO;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;

namespace EndpointConnectors.Connectors
{
    public interface IMaApiConnector
    {
        /// <summary>
        /// Returns a Mapping Assistant entity.
        /// </summary>
        /// <param name="type">Entity type: ddb, mappingset, dataset, column, localCode, column_description, mapping, transcoding, 
        /// transcodingRule, header_template, registry, user, userAction, templateMapping</param>
        /// <param name="id">Entity id.</param>
        /// <returns></returns>
        string GetEntity(string type, int? id);

        /// <summary>
        /// Deletes a Mapping Assistant entity.
        /// </summary>
        /// <param name="type">Entity type: ddb, mappingset, dataset, column, localCode, column_description, mapping, transcoding, 
        /// transcodingRule, header_template, registry, user, userAction, templateMapping</param>
        /// <param name="id">Entity id.</param>
        /// <returns></returns>
        string DeleteEntity(string type, int id);

        /// <summary>
        /// Creates a DDB Connection.
        /// </summary>
        /// <param name="conn">The connection to be created.</param>
        /// <returns>The WS response.</returns>
        string CreateDDBConnection(DDBConnection conn);

        /// <summary>
        /// Creates a Dataset.
        /// </summary>
        /// <param name="ds">The dataset to be created.</param>
        /// <returns>The WS response.</returns>
        string CreateDataset(Dataset ds);

        /// <summary>
        /// Creates some DatasetColumns.
        /// </summary>
        /// <param name="dc">An array containing the names of the columns to be created.</param>
        /// <param name="dsId">Id of the dataset to whom the columns belong.</param>
        /// <returns>The WS response.</returns>
        string CreateDatasetColumns(string[] dc, int dsId);

        /// <summary>
        /// Creates a MappingSet.
        /// </summary>
        /// <param name="ms">The mapping set to be created.</param>
        /// <returns>The WS response.</returns>
        string CreateMappingSet(MappingSet ms);

        /// <summary>
        /// Creates some Mappings.
        /// </summary>
        /// <param name="mapp">An array containing the mappings to be created.</param>
        /// <returns>The WS response.</returns>
        string CreateMappings(GenericMapping[] mapp);

        /// <summary>
        /// Creates some Transcodings.
        /// </summary>
        /// <param name="tr">An array containing the transcodings to be created.</param>
        /// <returns>The WS response.</returns>
        string CreateTranscodings(Transcoding[] tr);

        /// <summary>
        /// Creates some Transcoding Rules.
        /// </summary>
        /// <param name="rules">A list containing the transcoding rules to be created.</param>
        /// <returns>The WS response.</returns>
        string CreateTranscodingRules(List<MaRule> rules);

        /// <summary>
        /// Creates a Header Template.
        /// </summary>
        /// <param name="ht">The header template to be created.</param>
        /// <returns>The WS response.</returns>
        string CreateHeaderTemplate(HeaderTemplate ht);

        /// <summary>
        /// Gets all connections string avaiable for MSDB.
        /// </summary>
        /// <param name=""></param>
        /// <returns></returns>
        string GetListMaSid();

        /// <summary>
        /// Gets detail of specific maSid.
        /// </summary>
        /// <param name=""></param>
        /// <returns></returns>
        string GetMAConnectionString(string maSid);

        /// <summary>
        /// Checks if an artefact exists.
        /// </summary>
        /// <param name=""></param>
        /// <returns></returns>
        bool CheckExistsArtefact(string type, string id, string agencyId, string version);

        /// <summary>
        /// Inizializes AuthDb (creating table and popolating them with default values)
        /// </summary>
        /// <param name=""></param>
        /// <returns></returns>
        bool InizializeAuthDb();

        /// <summary>
        /// Checks if AuthDb was initialized.
        /// </summary>
        /// <param name=""></param>
        /// <returns></returns>
        bool IsAuthDbInizialize();



        Task<string> DownloadDDBDataflow(string id, string agency, string version, string format, string observation = null);
    }
}
