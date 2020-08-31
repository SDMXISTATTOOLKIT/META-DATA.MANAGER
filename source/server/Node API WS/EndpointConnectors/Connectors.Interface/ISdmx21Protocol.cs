using Connector.Classes;
using DataModel;
using NSI.Entities;
using Org.Sdmxsource.Sdmx.Api.Constants;
using Org.Sdmxsource.Sdmx.Api.Model.Objects;
using System;
using System.Collections.Generic;
using System.IO;
using System.Net.Http;
using System.Text;
using System.Xml;

namespace Connector.Connectors.Interface
{
    interface ISdmx21Protocol
    {
        /// <summary>
        /// Configures an http Client.
        /// </summary>
        /// <param name="httpClient">The client to be configured.</param>
        /// <param name="nodeConfiguration">The node cofiguration to whom the node must connect.</param>
        void ConfigureHttpClient(HttpClient httpClient, NodeConfig nodeConfiguration);

        /// <summary>
        /// Gets an artefact from the MSDB.
        /// </summary>
        /// <param name="artefact">Artefact type.</param>
        /// <param name="id">Artefact id.</param>
        /// <param name="agencyID">Artefact agency.</param>
        /// <param name="version">Artefact version.</param>
        /// <param name="refDetail">Reference detail: eg. None, Children, Parents (default = None).</param>
        /// <returns></returns>
        HttpRequestMessage GetArtefacts(SdmxStructureEnumType artefact, string id, string agencyID, string version, StructureReferenceDetailEnumType refDetail, string returnDetail = null);

        /// <summary>
        /// Creates new artefacts in the MSDB from the ISdmxObjectes given. (or update if exist)
        /// </summary>
        /// <param name="objs">SdmxObject containing the SDMX artefacts to be created.</param>
        /// <returns></returns>
        HttpRequestMessageWithIdentity CreateArtefacts(ISdmxObjects objs, bool withIdentity);

        /// <summary>
        /// Updates artefacts in the MSDB from the ISdmxObjectes given. (or create if not exist)
        /// </summary>
        /// <param name="objs">SdmxObject containing the SDMX artefacts to be updated.</param>
        /// <returns></returns>
        List<HttpRequestMessageWithIdentity> UpdateArtefacts(ISdmxObjects objs, bool withIdentity);

        /// <summary>
        /// Deletes artefacts from the MSDB.
        /// </summary>
        /// <param name="objs">SdmxObject containing the SDMX artefacts to be deleted.</param>
        /// <returns></returns>
        List<HttpRequestMessageWithIdentity> DeleteArtefact(ISdmxObjects objs, bool withIdentity);


        /// <summary>
        /// Take all response message of import
        /// </summary>
        /// <param name=""></param>
        /// <returns>Resturn a result off all item try to imported</returns>
        void GetNsiImportFileResponse(XmlDocument response, ImportedFileResultBase importedItemResult, List<ArtefactIdentity> artefactIdentity);


        /// <summary>
        /// Parses SDMX WS's response to see if any exception message exists.
        /// If so, tries to parse them and throws an exception.
        /// </summary>
        /// <param name="response">XmlDocument contenente la risposta del WS</param>
        void ParseNsiErrorMessages(XmlDocument response);

        void ConfigureNameSpace(HttpClient httpClient);
    }
}
