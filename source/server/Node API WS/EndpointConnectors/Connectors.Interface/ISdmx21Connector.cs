using System;
using System.Collections.Generic;
using System.IO;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Xml;
using Microsoft.AspNetCore.Http;
using NSI.Entities;
using Org.Sdmxsource.Sdmx.Api.Constants;
using Org.Sdmxsource.Sdmx.Api.Manager.Parse;
using Org.Sdmxsource.Sdmx.Api.Model;
using Org.Sdmxsource.Sdmx.Api.Model.Objects;
using Org.Sdmxsource.Sdmx.Structureparser.Manager.Parsing;
using Org.Sdmxsource.Util.Io;
using DataModel;

namespace EndpointConnectors.Connectors
{
    public interface ISdmx21Connector
    {
        /// <summary>
        /// Gets an artefact from the MSDB.
        /// </summary>
        /// <param name="artefact">Artefact type.</param>
        /// <param name="id">Artefact id.</param>
        /// <param name="agencyID">Artefact agency.</param>
        /// <param name="version">Artefact version.</param>
        /// <param name="refDetail">Reference detail: eg. None, Children, Parents (default = None).</param>
        /// <returns></returns>
        ISdmxObjects GetArtefacts(SdmxStructureEnumType artefact, string id, string agencyID, string version, StructureReferenceDetailEnumType refDetail = StructureReferenceDetailEnumType.None, string returnDetail = "");

        /// <summary>
        /// Creates new artefacts in the MSDB from the ISdmxObjectes given. (or update if exist)
        /// </summary>
        /// <param name="objs">SdmxObject containing the SDMX artefacts to be created.</param>
        /// <param name="withIdentity">store the identity objext of create</param>
        /// <returns></returns>
        bool CreateArtefacts(ISdmxObjects objs, bool withIdentity);

        /// <summary>
        /// Creates new artefacts in the MSDB from the ISdmxObjectes given. (or update if exist) (no filter artefact by agency of current user logged)
        /// </summary>
        /// <param name="objs">SdmxObject containing the SDMX artefacts to be created.</param>
        /// <param name="withIdentity">store the identity objext of create</param>
        /// <returns></returns>
        bool CreateArtefactsWithoutFilter(ISdmxObjects objs, bool withIdentity);

        /// <summary>
        /// Updates artefacts in the MSDB from the ISdmxObjectes given. (or create if not exist)
        /// </summary>
        /// <param name="objs">SdmxObject containing the SDMX artefacts to be updated.</param>
        /// <param name="withIdentity">wheter to store the identity object of update or not</param>
        /// <param name="filterByAgency">wheter to filter artefacts to update by agency or not</param>
        /// <param name="settAnnotationChanged">mark all final codelist with annotation CHANGED</param>
        /// <param name="DDBConnectionString">encoded connection string to be set as title of CHANGED annotation</param>
        /// <returns></returns>
        bool UpdateArtefacts(ISdmxObjects objs, bool withIdentity, bool filterByAgency, bool settAnnotationChanged, string DDBConnectionString);

        /// <summary>
        /// Deletes artefacts from the MSDB.
        /// </summary>
        /// <param name="objs">SdmxObject containing the SDMX artefacts to be deleted.</param>
        /// <param name="withIdentity">store the identity objext of delete</param>
        /// <returns></returns>
        bool DeleteArtefact(ISdmxObjects objs, bool withIdentity);

        /// <summary>
        /// Deletes artefacts from the MSDB. (no filter artefact by agency of current user logged)
        /// </summary>
        /// <param name="objs">SdmxObject containing the SDMX artefacts to be deleted.</param>
        /// <param name="withIdentity">store the identity objext of delete</param>
        /// <returns></returns>
        bool DeleteArtefactWithoutFilter(ISdmxObjects objs, bool withIdentity);

        /// <summary>
        /// Check if endpoint is up
        /// </summary>
        /// <returns></returns>
        bool PingEndPoint();

        /// <summary>
        /// Check validity of file xml and data
        /// </summary>
        /// <param name="filePath">File uploaded</param>
        /// <param name="languages"></param>
        /// <returns>All status of item to be imported</returns>
        List<ImportedItemXml> CheckImportedFileXmlSdmxObjects(string filePath, List<AppConfig.LanguageData> languages, bool filterAgency);

        /// <summary>
        /// Import data 
        /// </summary>
        /// <param name="importedItem">List of item to be imported</param>
        /// <returns>All status of item imported</returns>
        ImportedItemXmlResult ExecuteImportXml(List<ImportedItemXml> importedItem, string filePath, List<AppConfig.LanguageData> languages, bool filterAgency);

        /// <summary>
        /// Import data csv
        /// </summary>
        /// <param name="sdmxObjects">Object to update</param>
        /// <returns>Status of item</returns>
        ImportedItemCsvResult ExecuteImportCsv(ISdmxObjects sdmxObjects);

        void ConfigureNameSpace();
    }
}
