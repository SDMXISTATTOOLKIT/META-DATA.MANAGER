using System;
using System.Collections.Generic;
using System.Xml;
using RMDataProvider.Model;

namespace RMManager.RMDataProvider
{
    public interface IRMDataProvider
    {

        #region READ METHODS

        /// <summary>
        /// Count MetadataSet into DB.
        /// </summary>
        /// <returns>Totale MetadataSet into DB</returns>
        int CountMetadataSet();

        /// <summary>
        /// Search a MetadataSet by id.
        /// </summary>
        /// <param name="metadataSetId">MetadataSet id</param>
        /// <param name="excludeReport">True for not retrieve report data</param>
        /// <param name="withAttributes">False for not retrieve attribute data</param>
        /// <param name="dbId">True for use Id column, otherwise ReferenceId column</param>
        /// <returns>MetadataSet found</returns>
        MetadataSetType GetMetadataset(string metadataSetId, bool excludeReport = false, bool withAttributes = true, bool dbId = false);

        /// <summary>
        /// Search all stored MetadataSets.
        /// </summary>
        /// <param name="excludeReport">True for not retrieve report data</param>
        /// <param name="reportStateId">Filter result for report state</param>
        /// <returns>MetadataSet list found</returns>
        List<MetadataSetType> GetMetadataSetList(bool excludeReport = false, int reportStateId = 0);

        /// <summary>
        /// Return a simple Metadataset including no Reports
        /// </summary>
        /// <param name="metadataSetId"></param>
        /// <returns></returns>
        MetadataSetType GetSimpleMetadataset(string metadataSetId);

        /// <summary>
        /// Search a Report by id
        /// </summary>
        /// <param name="metadatasetId">Metadataset id</param>
        /// <param name="reportId">Report id</param>
        /// <param name="dbId">True for use Id column, otherwise ReferenceId column</param>
        /// <param name="restrictedForPublicationAnnotation">Value annotation id for filter private metadata attributes</param>
        /// <returns>Report found</returns>
        ReportType GetReport(string metadatasetId, string reportId, bool dbId = false, string restrictedForPublicationAnnotation = null);

        /// <summary>
        /// Search all Reports with parameters.
        /// </summary>
        /// <param name="metadataflowURN">MetadataFlow URN</param>
        /// <param name="identifierValue">Target Identifier value</param>
        /// <param name="targetType">Target Identifier type, values [Metadataflow,Dataflow]</param>
        /// <returns>List of Reports found</returns>
        IList<int> SearchReportId(string metadataflowURN, string identifierValue, string targetType);

        /// <summary>
        /// Search MetadataSet id by Dataflow URN.
        /// </summary>
        /// <param name="dataflowURN">DataFlow URN</param>
        /// <returns>All MetadataSet id found</returns>
        List<int> SearchMetadataSetIdByDataflowURN(string dataflowURN);

        /// <summary>
        /// Search all Reports with parameters.
        /// </summary>
        /// <param name="idMetadataSet">MetadataSet id</param>
        /// <param name="identifierValue">Target Identifier value</param>
        /// <param name="targetType">Target Identifier type, values [Metadataflow,Dataflow]</param>
        /// <returns>List of Reports found</returns>
        IList<int> SearchReportId(int idMetadataSet, string identifierValue, string targetType);

        /// <summary>
        /// Searches all Reports with specified parameters.
        /// </summary>
        /// <param name="metadasetId">Metadaset id</param>
        /// <param name="targetType">targetType</param>
        /// <param name="identifierValue">Target identifier</param>
        /// <param name="withAttributes">True for get also metadata attributes</param>
        /// <param name="reportStateId">Report State</param>
        /// <param name="restrictedForPublicationAnnotation">Value annotation id for filter private metadata attributes</param>
        /// <returns>Reports founded</returns>
        IList<ReportType> SearchReportByParams(int metadasetId, string targetType, string identifierValue, bool withAttributes, int reportStateId = 0, string restrictedForPublicationAnnotation = null);

        /// <summary>
        /// Search all the ReportedAttributes of a Report.
        /// </summary>
        /// <param name="reportId">Report id</param>
        /// <returns>Return an AttributeSet object with attribuites found</returns>
        AttributeSetType GetReportedAttributeSet(int reportId);

        /// <summary>
        /// Get metadataset id from report id
        /// </summary>
        /// <param name="reportId">Report id</param>
        /// <param name="reportStateId">Report id</param>
        /// <returns>Return metadataset id</returns>
        int GetMetadatasetIdFromReportId(int reportId, int reportStateId = 0);

        #endregion

        #region CREATE METHODS

        /// <summary>
        /// Create a new MetadataSet with input data and MSD file specified.
        /// </summary>
        /// <param name="metadataset">MetadataSet input data</param>
        /// <param name="msdDocument">MSD file content</param>
        /// <returns>Id of MetadataSet created</returns>
        int CreateMetadataSet(MetadataSetType metadataset, XmlDocument msdDocument);

        /// <summary>
        /// Create a new Report with input data and MSD file specified.
        /// </summary>
        /// <param name="metadatasetId">MetadataSet id</param>
        /// <param name="report">Report input data</param>
        /// <param name="msdDocument">MSD file content</param>
        /// <returns>Id of Report created</returns>
        int CreateReport(int metadatasetId, ReportType report, XmlDocument msdDocument);

        /// <summary>
        /// Create a new ReportedAttribute of a Report with input data and MSD file specified.
        /// </summary>
        /// <param name="reportId">Report id</param>
        /// <param name="reportedAttribute">ReportedAttribute input data</param>
        /// <param name="msdDocument">MSD file content</param>
        /// <returns></returns>
        int CreateReportedAttribute(int reportId, ReportedAttributeType reportedAttribute, XmlDocument msdDocument);

        #endregion

        #region UPTDATE METHODS
        /// <summary>
        /// Update the MetadataSet with input data and MSD file specified.
        /// </summary>
        /// <param name="metadataset">MetadataSet input data.</param>
        /// <param name="msdDocument">MSD file content</param>
        /// <returns>MetadataSet updated</returns>
        MetadataSetType UpdateMetadataSet(MetadataSetType metadataset, XmlDocument msdDocument);

        /// <summary>
        /// Update the Report with input data and MSD file specified.
        /// </summary>
        /// <param name="metadatasetId">MetadataSet id</param>
        /// <param name="report">Report input data</param>
        /// <param name="msdDocument">MSD file content</param>
        /// <returns>Report updated</returns>
        ReportType UpdateReport(int metadatasetId, ReportType report, XmlDocument msdDocument);

        /// <summary>
        /// Update the Report state.
        /// </summary>
        /// <param name="metadatasetId">MetadataSet id</param>
        /// <param name="reportId">Report id</param>
        /// <param name="newState">New Report state</param>
        /// <returns>True if report update executed, false otherwise</returns>
        bool UpdateReportState(int metadatasetId, int reportId, String newState);

        /// <summary>
        /// Update the ReportedAttribute with input data and MSD file specified.
        /// </summary>
        /// <param name="reportId">Report id</param>
        /// <param name="attribute">ReportedAttribute input data</param>
        /// <param name="msdDocument">MSD file content</param>
        /// <returns>ReportedAttribute updated</returns>
        ReportedAttributeType UpdateReportedAttribute(int reportId, ReportedAttributeType attribute, XmlDocument msdDocument);

        #endregion

        #region DELETE METHODS

        /// <summary>
        /// Delete a MetadataSet and all related data.
        /// </summary>
        /// <param name="metadatasetId">MetadataSet id</param>
        /// <returns>True if the operation was successful, false otherwise</returns>
        Boolean DeleteMetadataSet(int metadatasetId);

        /// <summary>
        /// Delete a report and all related data.
        /// </summary>
        /// <param name="reportId">Report id</param>
        /// <returns>True if the operation was successful, false otherwise</returns>
        Boolean DeleteReport(int reportId);

        #endregion

        /// <summary>
        /// Build a CKAN report for the specific dataset.
        /// </summary>
        /// <param name="datasetId">MetadataFlow URN</param>
        /// <param name="language">Language of data returned</param>
        /// <param name="ckanTemplate">CKAN template to use</param>
        /// <param name="wsUrl">Request url</param>
        /// <param name="metadataSetId">MetadataSet Id</param>
        /// <param name="metadataflow">Metadataflow URN</param>
        /// <returns>CKAN Report for the dataset</returns>
        string getReportCKAN(string datasetId, string language, string ckanTemplate, string wsUrl, string metadataSetId = null, string metadataflow = null);

        /// <summary>
        /// Get Group list like standard CKAN.
        /// </summary>
        /// <param name="language">Language of data returned</param>
        /// <param name="wsUrl">Request url</param>
        /// <param name="metadataSetId">MetadataSet Id</param>
        /// <param name="metadataflow">Metadataflow URN</param>
        /// <returns>CKAN Group listt</returns>
        string GetGroupListCKAN(string language, string wsUrl, string metadataSetId = null, string metadataflow = null);

        /// <summary>
        /// Build a CKAN report with dataset found by parameters.
        /// </summary>
        /// <param name="theme">Theme name value</param>
        /// <param name="sort">Sort attribute</param>
        /// <param name="start">Page number</param>
        /// <param name="rows">Page size</param>
        /// <param name="language">Language of data returned</param>
        /// <param name="ckanTemplate">CKAN template to use</param>
        /// <param name="wsUrl">Request url</param>
        /// <param name="metadataSetId">MetadataSet Id</param>
        /// <param name="metadataflow">Metadataflow URN</param>
        /// <returns>CKAN Report for the dataset</returns>
        string searchReportCKAN(string theme, string sort, int start, int rows, string language, string ckanTemplate, string wsUrl, string metadataSetId=null, string metadataflow=null);

        void cleanAnnotations(MetadataSetType mdst);

        void cleanAnnotations(ReportType r);

            /// <summary>
            /// Check if RMDB is inizialized
            /// </summary>
            bool CheckInizializedRMDB();

        /// <summary>
        /// Inizialize RMDB
        /// </summary>
        bool InizializeRMDB();
    }
}
