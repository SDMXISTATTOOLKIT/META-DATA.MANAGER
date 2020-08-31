using DataProvider;
using DataProvider.entity;
using DataStore.Interface;
using Infrastructure.STLogging.Factory;
using Infrastructure.STLogging.Interface;
using RMManager.RMDataProvider.Util;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Data;
using System.Text;
using System.Xml;
using static RMDataProvider.RMDB;
using RMDataProvider.Model;
using RMUtil;
using System.IO;
using Newtonsoft.Json;
using System.Runtime.Serialization;
using Newtonsoft.Json.Linq;
using Org.Sdmxsource.Sdmx.Api.Model.Objects;
using Infrastructure.Utils;
using RMDataProvider.entity;

namespace RMManager.RMDataProvider
{
    public class RMDataProvider : IRMDataProvider
    {

        #region CONSTANTS

        public const int METADATASET_ANNOTATION_TYPE_ID = 1;

        public const int VALUE_FORMAT_STRING_ID = 1;
        public const int VALUE_FORMAT_NUMERIC_ID = 2;
        public const int VALUE_FORMAT_DATETIME_ID = 3;
        public const int VALUE_FORMAT_URI_ID = 4;

        public const int NULL_NUMBER_FIELD_VALUE = -1;

        public const string PLACEHOLDER_DELIMITER = "§";
        public const string PLACEHOLDER_CONCAT_SYMBOL = "-";
        public const string PLACEHOLDER_INDEX_SYMBOL = "[i]";

        #endregion

        private readonly string _dcatIsMultilingual;
        private readonly string _customIsPresentational;
        
        //Data Access Layer store
        protected IDataStore store;
        protected bool inTransaction;

        public RMDataProvider()
        {
            this.store = RMDataFactory.RMFactory.DataStore;
            inTransaction = false;
        }

        public RMDataProvider(string dcatIsMultilingual, string customIsPresentational)
        {
            this.store = RMDataFactory.RMFactory.DataStore;
            inTransaction = false;
            _dcatIsMultilingual = dcatIsMultilingual;
            _customIsPresentational = customIsPresentational;
        }

        ~RMDataProvider()
        {
            if (this.store != null)
            {
                //rollback pending transactions
                RollbackTransaction();
                this.store.Dispose();
            }
        }

        protected void BeginTransaction()
        {
            if (inTransaction)
            {
                return;
            }

            try
            {
                this.store.BeginTransaction();
                inTransaction = true;
            }
            catch (Exception e)
            {
                STLoggerFactory.Logger.Log("An error occurred while opening a Database transaction.", e, LogLevelEnum.Error);
                throw e;
            }
        }

        protected void CommitTransaction()
        {
            if (!inTransaction)
            {
                return;
            }

            try
            {
                this.store.CommitTransaction();
                inTransaction = false;
            }
            catch (Exception e)
            {
                STLoggerFactory.Logger.Log("An error occurred while committing a Database transaction.", e, LogLevelEnum.Error);
                throw e;
            }
        }


        protected void RollbackTransaction()
        {
            if (!inTransaction)
            {
                return;
            }

            try
            {
                this.store.RollbackTransaction();
                inTransaction = false;
            }
            catch (Exception e)
            {
                STLoggerFactory.Logger.Log("An error occurred while rolling back a Database transaction.", e, LogLevelEnum.Error);
                throw e;
            }
        }

        public int CreateReportedAttribute(int reportId, ReportedAttributeType reportedAttribute, XmlDocument msdDocument)
        {
            int result = NULL_NUMBER_FIELD_VALUE;
            try
            {
                this.BeginTransaction();
                result = writeMetadataAttributeNode(reportId, NULL_NUMBER_FIELD_VALUE, reportedAttribute, msdDocument);
                this.CommitTransaction();
            }
            catch (Exception e)
            {
                this.RollbackTransaction();
                STLoggerFactory.Logger.Log("Error to create ReportedAttribute", e, LogLevelEnum.Error);
            }
            return result;
        }

        public int CreateMetadataSet(MetadataSetType metadataset, XmlDocument msdDocument)
        {
            int result = NULL_NUMBER_FIELD_VALUE;
            try
            {
                this.BeginTransaction();
                result = writeMetadataSet(metadataset, msdDocument);
                this.CommitTransaction();

            }
            catch (Exception e)
            {
                this.RollbackTransaction();
                STLoggerFactory.Logger.Log("Error to create MetadataSet", e, LogLevelEnum.Error);
            }
            return result;
        }

        public int CreateReport(int metadatasetId, ReportType report, XmlDocument msdDocument)
        {
            int result = NULL_NUMBER_FIELD_VALUE;
            try
            {
                this.BeginTransaction();
                result = writeReport(metadatasetId, NULL_NUMBER_FIELD_VALUE, report, msdDocument);
                this.CommitTransaction();
            }
            catch (Exception e)
            {
                this.RollbackTransaction();
                STLoggerFactory.Logger.Log("Error to create Report", e, LogLevelEnum.Error);
            }
            return result;
        }

        public bool DeleteMetadataSet(int metadatasetId)
        {
            int numReport = 0;
            DataTable maxItemIdDT = store.GetTable($@"SELECT COUNT(*) FROM Report WHERE MetadasetId=@metadataSetId",
                new STKeyValuePair[] { new STKeyValuePair("metadataSetId", metadatasetId) });
            IEnumerator itemIt = maxItemIdDT.Rows.GetEnumerator();
            if (itemIt.MoveNext())
            {
                try
                {
                    numReport = (int)((DataRow)itemIt.Current)[0];
                }
                catch (Exception)
                {
                    STLoggerFactory.Logger.Log("Table empty, next id value 1", LogLevelEnum.Debug);
                }
            }
            if (numReport > 0)
            {
                throw new Exception("Impossible to delete the MetadataSet because it contains reports");
            }
            try
            {
                int result = store.ExecuteCommand("DELETE FROM MetadataSet WHERE id=@metadataSetId",
                    new STKeyValuePair[] { new STKeyValuePair("metadataSetId", metadatasetId) });
                return result > 0;
            }
            catch (Exception e)
            {
                STLoggerFactory.Logger.Log("An error occurred while deleting Metadataset '" + metadatasetId + "'", e, LogLevelEnum.Error);
                return false;
            }
        }

        public MetadataSetType GetMetadataset(string metadataSetId, bool excludeReport = false, bool withAttributes = true, bool dbId = false)
        {
            try
            {
                STLoggerFactory.Logger.Log("Retrieving MetadataSet with identifier = " + metadataSetId, LogLevelEnum.Debug);
                MetadataSetType metadata = readMetadataSetById(metadataSetId, excludeReport, withAttributes, dbId);
                STLoggerFactory.Logger.Log("MetadataSet with identifier =" + metadataSetId + " retrieved", LogLevelEnum.Debug);
                return metadata;
            }
            catch (Exception e)
            {
                STLoggerFactory.Logger.Log("Unable to retrieve MetadataSet with identifier =" + metadataSetId, e, LogLevelEnum.Error);
            }

            return null;
        }

        public MetadataSetType GetSimpleMetadataset(string metadataSetId)
        {
            try
            {
                STLoggerFactory.Logger.Log("Retrieving Simple MetadataSet with identifier = " + metadataSetId, LogLevelEnum.Debug);
                MetadataSetType metadata = readMetadataSetById(metadataSetId);
                STLoggerFactory.Logger.Log("Simple MetadataSet with identifier =" + metadataSetId + " retrieved", LogLevelEnum.Debug);
                return metadata;
            }
            catch (Exception e)
            {
                STLoggerFactory.Logger.Log("Unable to retrieve Simple MetadataSet with identifier =" + metadataSetId, e, LogLevelEnum.Error);
            }

            return null;
        }

        public ReportType GetReport(string metadatasetId, string reportId, bool dbId = false, string restrictedForPublicationAnnotation = null)
        {
            return readReportById(metadatasetId, reportId, true, dbId, restrictedForPublicationAnnotation);
        }

        public int GetMetadatasetIdFromReportId(int reportId, int reportStateId = 0)
        {
            try
            {
                LoggerUtils.logMethodStarts(STLoggerFactory.Logger, System.Reflection.MethodBase.GetCurrentMethod().Name);
                StringBuilder sb = new StringBuilder("SELECT MetadasetId FROM Report WHERE Id=@ReportId");
                STKeyValuePair[] queryParams = null;
                if (reportStateId > 0)
                {
                    sb.Append(" AND StateId=@reportStateId");
                    queryParams = new STKeyValuePair[] { new STKeyValuePair("ReportId", reportId),
                        new STKeyValuePair("reportStateId", reportStateId) };
                }
                else
                {
                    queryParams = new STKeyValuePair[] { new STKeyValuePair("ReportId", reportId) };
                }
                string query = sb.ToString();
                var dbResult = store.ExecuteScalar(query, queryParams);
        
                var result = -1;
                if (dbResult != null && dbResult != DBNull.Value)
                {
                    result = (int)dbResult;
                }
                LoggerUtils.logMethodEndsSuccess(STLoggerFactory.Logger, System.Reflection.MethodBase.GetCurrentMethod().Name);

                return result;
            }
            catch (Exception ex)
            {
                STLoggerFactory.Logger.Log("Error to retrieve Report data - " + ex.Message + ": " + ex.StackTrace, LogLevelEnum.Error);
                throw;
            }
        }

        public List<int> SearchMetadataSetIdByDataflowURN(string urnMetadataflow)
        {
            List<int> result = new List<int>();
            string id;
            string agency;
            string version;
            RMUtility.ParseURN(urnMetadataflow, out id, out agency, out version);
            STLoggerFactory.Logger.Log("Search MetadataSet id by MetadataflowId=" + id + ", MetadataflowAgency=" + agency + ", MetadataflowVersion=" + version, LogLevelEnum.Debug);

            string selectMetadataSetByDataflow = "SELECT m.Id FROM MetadataSet m WHERE m.MetadataflowId=@id AND m.MetadataflowAgency=@agency AND m.MetadataflowVersion=@version";

            DataTable mdsIdDT = store.GetTable(selectMetadataSetByDataflow,
               new STKeyValuePair[] {
                    new STKeyValuePair("id", id),
                    new STKeyValuePair("agency", agency),
                    new STKeyValuePair("version", version) });
            IEnumerator mdsIt = mdsIdDT.Rows.GetEnumerator();
            while (mdsIt.MoveNext())
            {
                result.Add((int)((DataRow)mdsIt.Current)["Id"]);
            }
            return result;
        }

        public IList<int> SearchReportId(string urnMetadataflow, string identifierValue, string targetType)
        {

            int idMetadataSet = SearchMetadataSetIdByDataflowURN(urnMetadataflow)[0];
            return SearchReportId(idMetadataSet, identifierValue, targetType);
        }

        public IList<int> SearchReportId(int idMetadataSet, string identifierValue, string targetType)
        {
            if (identifierValue == null || identifierValue.Trim().Length <= 0)
            {
                throw new Exception("Parameter identifierValue non specified");
            }
            if (targetType == null || targetType.Trim().Length <= 0)
            {
                throw new Exception("Parameter targetType non specified");
            }

            STLoggerFactory.Logger.Log("Search report by idMetadataSet=" + idMetadataSet + ", identifierValue=" + identifierValue + ", targetType=" + targetType, LogLevelEnum.Debug);
            IList<int> result = new List<int>();

            string reportQueryTemplate = "SELECT rp.Id " +
                "FROM [Report] rp " +
                "INNER JOIN [Target] tg ON rp.TargetId = tg.id " +
                "INNER JOIN [TargetIdentifier] tgi ON tg.id = tgi.TargetId AND tgi.Value = @identifierValue " +
                "INNER JOIN [TargetIdentifierType] titp ON tgi.TargetIdentifierTypeId = titp.Id AND titp.Name = @targetType " +
                "WHERE rp.MetadasetId = @idMetadataSet;";

            DataTable mdsIdDT = store.GetTable(reportQueryTemplate,
                new STKeyValuePair[] {
                    new STKeyValuePair("identifierValue", identifierValue),
                    new STKeyValuePair("targetType", targetType),
                    new STKeyValuePair("idMetadataSet", idMetadataSet) });
            IEnumerator mdsIt = mdsIdDT.Rows.GetEnumerator();
            while (mdsIt.MoveNext())
            {
                result.Add((int)((DataRow)mdsIt.Current)["Id"]);
            }
            return result;
        }

        public AttributeSetType GetReportedAttributeSet(int reportId)
        {
            return buildAttributeSetByReportId(reportId);
        }

        public ReportedAttributeType UpdateReportedAttribute(int reportId, ReportedAttributeType attribute, XmlDocument msdDocument)
        {
            throw new NotImplementedException();
        }

        public MetadataSetType UpdateMetadataSet(MetadataSetType metadataset, XmlDocument msdDocument)
        {

            int metadataSetId = NULL_NUMBER_FIELD_VALUE;
            try
            {
                metadataSetId = Convert.ToInt32(metadataset.getAnnotationValue(MetadataSetType.ANNOTATION_KEY_METADATASET_ID));
                //foreach (AnnotationType currAnn in metadataset.Annotations.Annotation)
                //{
                //    if (currAnn.id == MetadataSetType.ANNOTATION_KEY_METADATASET_ID)
                //    {
                //        metadataSetId = Convert.ToInt32(currAnn.AnnotationText[0].TypedValue);
                //        break;
                //    }
                //}
            }
            catch (Exception e)
            {
                STLoggerFactory.Logger.Log("Error to retrieve MetadataSet id from Annotations - " + e.Message + ": " + e.StackTrace, LogLevelEnum.Error);
                throw new Exception("MetadataSet not found");
            }

            if (metadataSetId == NULL_NUMBER_FIELD_VALUE)
            {
                throw new Exception("Id not found in Annotation for MetadataSet " + metadataset.setID);
            }

            try
            {
                this.BeginTransaction();

                int metadataSetIdNew = updateMetadataSet(metadataSetId, metadataset, msdDocument);

                foreach (ReportType r in metadataset.Report)
                {
                    int reportId = NULL_NUMBER_FIELD_VALUE;
                    foreach (AnnotationType currAnn in r.Annotations.Annotation)
                    {
                        if (currAnn.id == ReportType.ANNOTATION_KEY_REPORT_ID)
                        {
                            reportId = Convert.ToInt32(currAnn.AnnotationText[0].TypedValue);
                        }
                    }
                    if (reportId == NULL_NUMBER_FIELD_VALUE)
                    {
                        throw new Exception("Id not found in Annotation for Report " + r.id);
                    }
                    if (DeleteReport(reportId))
                    {
                        int newReportId = writeReport(metadataSetId, reportId, r, msdDocument);

                        if (reportId != newReportId)
                        {
                            throw new Exception("The old Report id is different from the new one");
                        }
                    }
                    else
                    {
                        throw new Exception("Error to delete Report " + r.id);
                    }
                }

                MetadataSetType result = readMetadataSetById(""+metadataSetIdNew, false, true, true);
                this.CommitTransaction();
                STLoggerFactory.Logger.Log("Stored a new MetadataSet with id " + metadataSetIdNew, LogLevelEnum.Debug);

                return result;
            }
            catch (Exception e)
            {
                STLoggerFactory.Logger.Log("Error to update MetadataSet with id " + metadataSetId + " - " + e.Message + ": " + e.StackTrace, LogLevelEnum.Error);
                this.RollbackTransaction();
                throw new Exception("Error to update MetadataSet data");
            }
        }

        public bool UpdateReportState(int metadatasetId, int reportId, String newState)
        {
            try
            {
                const string query = "UPDATE Report SET StateId=(SELECT rs.Id FROM ReportState rs WHERE rs.StateName=@newState) " +
                    "WHERE MetadasetId=@metadataSetId AND Id=@reportId;";
                return store.ExecuteCommand(query, new STKeyValuePair[] { new STKeyValuePair("metadataSetId", metadatasetId),
                    new STKeyValuePair("reportId", reportId), new STKeyValuePair("newState", newState) }) > 0;
            }
            catch (Exception e)
            {
                STLoggerFactory.Logger.Log("Error to update Report state - " + e.Message + ": " + e.StackTrace, LogLevelEnum.Error);
                return false;
            }
        }

        public ReportType UpdateReport(int metadatasetId, ReportType report, XmlDocument msdDocumento)
        {
            int reportId = NULL_NUMBER_FIELD_VALUE;

            try
            {
                foreach (AnnotationType currAnn in report.Annotations.Annotation)
                {
                    if (currAnn.id == ReportType.ANNOTATION_KEY_REPORT_ID)
                    {
                        reportId = Convert.ToInt32(currAnn.AnnotationText[0].TypedValue);
                        break;
                    }
                }
            }
            catch (Exception e)
            {
                STLoggerFactory.Logger.Log("Error to retrieve Report id from Annotations - " + e.Message + ": " + e.StackTrace, LogLevelEnum.Error);
                throw new Exception("Report not found");
            }

            try
            {
                this.BeginTransaction();
                if (DeleteReport(reportId))
                {
                    int reportIdNew = writeReport(metadatasetId, reportId, report, msdDocumento);
                    STLoggerFactory.Logger.Log("Stored a new Report with id " + reportIdNew, LogLevelEnum.Debug);
                    ReportType result = readReportById(null, ""+reportIdNew, true, true);
                    this.CommitTransaction();
                    return result;
                }
                else
                {
                    throw new Exception("Error to update Report data");
                }
            }
            catch (Exception e)
            {
                STLoggerFactory.Logger.Log("Error to update Report with id " + reportId + " - " + e.Message + ": " + e.StackTrace, LogLevelEnum.Error);
                this.RollbackTransaction();
                throw new Exception("Error to update Report data");
            }
        }

        public bool DeleteReport(int reportId)
        {

            try
            {
                //the operation succeeds only if at least one row has been deleted
                STKeyValuePair[] parameters = new STKeyValuePair[] { new STKeyValuePair("reportId", reportId) };
                return store.ExecuteCommand("DELETE FROM Report WHERE id=@reportId", parameters) > 0;
            }
            catch (Exception e)
            {
                STLoggerFactory.Logger.Log("An error occurred while deleting Report '" + reportId + "'", e, LogLevelEnum.Error);
                return false;
            }
        }

        /// <summary>
        /// Read from DB a specific MetadataSet.
        /// </summary>
        /// <param name="store">DB Access</param>
        /// <param name="metadataSetId">MetadataSetType id</param>
        /// <param name="dbId">True for use Id column, otherwise ReferenceId column</param>
        /// <returns>MetadataSet data</returns>
        private MetadataSetType readMetadataSetById(string metadataSetId, bool excludeReport = false, bool withAttributes = true, bool dbId = false)
        {
            MetadataSetType result = new MetadataSetType();
            string idColumn = "ReferenceId";
            bool onlyLang = false;
            if (dbId)
            {
                idColumn = "Id";
            }
            try
            {
                STLoggerFactory.Logger.Log("Search in MetadataSet table with id " + metadataSetId, LogLevelEnum.Debug);

                DataTable tb = store.GetTable($@"
                    SELECT m.Id,m.NameId,m.MetadataflowId,m.MetadataflowAgency,m.MetadataflowVersion,m.ReportingBegin,m.ReportingEnd,m.ValidFrom
                        ,m.ValidTo,m.MSDId,m.MSDAgency,m.MSDVersion,m.IsFinal,m.PublicationYear,m.PublicationPeriod,m.AnnotationsId,m.ReferenceId,
                        b.Language as 'lang', b.Value as 'langValue' 
                    FROM MetadataSet m LEFT JOIN TranslatableItems a ON a.Id=m.NameId LEFT JOIN TranslatableItemValues b ON b.ValueId=a.Id 
                    WHERE m." + idColumn + "=@metadataSetId", new STKeyValuePair[] { new STKeyValuePair("metadataSetId", metadataSetId) });
                IEnumerator mdsIt = tb.Rows.GetEnumerator();
                while (mdsIt.MoveNext())
                {
                    //List<RMAttributeData> mdsNameList = readTranslatableItemValue((int)((DataRow)mdsIt.Current)[1]);
                    //if (mdsNameList != null && mdsNameList.Count > 0)
                    //{
                    //    result.Name = new List<Name>();
                    //    foreach (RMAttributeData name in mdsNameList)
                    //    {
                    //        Name n = new Name();
                    //        n.lang = name.Language;
                    //        n.TypedValue = name.Value;
                    //        result.Name.Add(n);
                    //    }
                    //}

                    if (result.setID!=null)
                    {
                        onlyLang = true;
                    }

                    DataRow dbRow = (DataRow)mdsIt.Current;
                    Helper.fillWithDbData(result, dbRow, onlyLang);

                    if (!onlyLang)
                    {
                        object annotationIdObj = dbRow["AnnotationsId"];
                        if (annotationIdObj != null && annotationIdObj != DBNull.Value)
                        {
                            AddDBAnnotations(result.Annotations.Annotation, (int)annotationIdObj);
                        }
                    }
                }
                //else
                //{
                //    throw new Exception("No data found in MetadataSet table with id " + metadataSetId);
                //}
                //simple MetadataSet (Reports are not included)
                if (excludeReport)
                {
                    return result;
                }

                int metadataSetKeyId = Convert.ToInt32(result.getAnnotationValue(MetadataSetType.ANNOTATION_KEY_METADATASET_ID));
                List<ReportType> rList = readReportByMetadataSetId(metadataSetKeyId, withAttributes);
                if (rList != null && rList.Count > 0)
                {
                    result.Report = rList;
                }
            }
            catch (Exception e)
            {
                STLoggerFactory.Logger.Log("Error to retrieve MetadataSet data - " + e.Message + ": " + e.StackTrace, LogLevelEnum.Error);
                throw e;
            }
            return result;
        }

        private void AddDBAnnotations(List<AnnotationType> ta, int AnnotationGroupId)
        {
            DataTable tb = store.GetTable($@"
                SELECT a.Id,a.AnnotationGroupId,a.AnnotationId,a.AnnotationTitle,at.Type,a.AnnotationURL,a.AnnotationTextId, 
                    b.Language as 'lang', b.Value as 'langValue' 
                FROM Annotation a LEFT JOIN AnnotationType at ON a.AnnotationTypeId=at.Id LEFT JOIN TranslatableItems ti ON ti.Id=a.AnnotationTextId LEFT JOIN TranslatableItemValues b ON b.ValueId=ti.Id
                WHERE a.AnnotationGroupId=@AnnotationGroupId", new STKeyValuePair[] { new STKeyValuePair("AnnotationGroupId", AnnotationGroupId) });
            IEnumerator it = tb.Rows.GetEnumerator();
            while (it.MoveNext())
            {
                bool onlyLang = false;
                DataRow dbRow = (DataRow)it.Current;

                AnnotationType currAnnotation = new AnnotationType();
                object AnnotationIdObj = dbRow["AnnotationId"];
                if (AnnotationIdObj != null && AnnotationIdObj != DBNull.Value)
                {
                    currAnnotation.id = AnnotationIdObj.ToString();
                }

                int pos = 0;
                foreach (AnnotationType cTa in ta)
                {
                    if (cTa.id.Equals(currAnnotation.id))
                    {
                        currAnnotation = cTa;
                        onlyLang = true;
                        break;
                    }
                    pos++;
                }

                if (!onlyLang) { 
                    object annotationTitleObj = dbRow["AnnotationTitle"];
                    if (annotationTitleObj != null && annotationTitleObj != DBNull.Value)
                    {
                        int titleId = Convert.ToInt32(annotationTitleObj.ToString());
                        List<RMAttributeData> titleIdValues = readTranslatableItemValue(titleId);
                        currAnnotation.AnnotationTitle = titleIdValues[0].Value;
                    }

                    object annotationTypeObj = dbRow["Type"];
                    if (annotationTypeObj != null && annotationTypeObj != DBNull.Value)
                    {
                        currAnnotation.AnnotationType1 = annotationTypeObj.ToString();
                    }

                    //object annotationTextIdObj = dbRow["AnnotationTextId"];
                    //if (annotationTextIdObj != null && annotationTextIdObj != DBNull.Value)
                    //{
                    //    int textId = Convert.ToInt32(annotationTextIdObj.ToString());
                    //    List<RMAttributeData> textIdValues = readTranslatableItemValue(textId);
                    //    if (textIdValues != null)
                    //    {
                    //        currAnnotation.AnnotationText = new List<TextType>();
                    //        foreach (RMAttributeData attrVal in textIdValues)
                    //        {
                    //            TextType currText = new TextType();
                    //            currText.TypedValue = attrVal.Value;
                    //            currText.lang = attrVal.Language;
                    //            currAnnotation.AnnotationText.Add(currText);
                    //        }
                    //    }
                    //}
                }

                string lang = null;
                object langObj = dbRow["lang"];
                if (langObj != null && langObj != DBNull.Value)
                {
                    lang = langObj.ToString();
                }
                string langValue = null;
                object langValueObj = dbRow["langValue"];
                if (langValueObj != null && langValueObj != DBNull.Value)
                {
                    langValue = langValueObj.ToString();
                }

                if (currAnnotation.AnnotationText == null)
                {
                    currAnnotation.AnnotationText = new List<TextType>();
                }

                TextType n = new TextType();
                n.lang = lang;
                n.TypedValue = langValue;
                currAnnotation.AnnotationText.Add(n);

                if (onlyLang)
                {
                    ta.RemoveAt(pos);
                    ta.Insert(pos, currAnnotation);
                }
                else
                {
                    ta.Add(currAnnotation);
                }
            }
        }

        /// <summary>
        /// Count MetadataSet into DB.
        /// </summary>
        /// <returns>Totale MetadataSet into DB</returns>
        public int CountMetadataSet()
        {
            int result = 0;
            try
            {
                STLoggerFactory.Logger.Log("Count MetadataSet ", LogLevelEnum.Debug);
                DataTable tb = store.GetTable($@"SELECT count(*) FROM MetadataSet");
                IEnumerator mdsIt = tb.Rows.GetEnumerator();
                if (mdsIt.MoveNext())
                {
                    result = (int)((DataRow)mdsIt.Current)[0];
                }
            }
            catch (Exception e)
            {
                STLoggerFactory.Logger.Log("Error to retrieve MetadataSet data - " + e.Message + ": " + e.StackTrace, LogLevelEnum.Error);
                throw e;
            }
            return result;
        }

        /// <summary>
        /// Read from DB a specific MetadataSet.
        /// </summary>
        /// <param name="store">DB Access</param>
        /// <param name="metadataSetId">MetadataSetType id</param>
        /// <returns>MetadataSet data</returns>
        public List<MetadataSetType> GetMetadataSetList(bool excludeReport = false, int reportStateId = 0)
        {
            List<MetadataSetType> result = new List<MetadataSetType>();
            try
            {
                STLoggerFactory.Logger.Log("Search all MetadataSet ", LogLevelEnum.Debug);
                STLoggerFactory.Logger.Log("Search MetadataSet into RMDB", LogLevelEnum.Debug);
                DataTable tb = store.GetTable($@"
                    SELECT m.Id,m.NameId,m.MetadataflowId,m.MetadataflowAgency,m.MetadataflowVersion,m.ReportingBegin,m.ReportingEnd,m.ValidFrom
                        ,m.ValidTo,m.MSDId,m.MSDAgency,m.MSDVersion,m.IsFinal,m.PublicationYear,m.PublicationPeriod,m.AnnotationsId,m.ReferenceId,
                        b.Language as 'lang', b.Value as 'langValue'
                    FROM MetadataSet m LEFT JOIN TranslatableItems a ON a.Id=m.NameId LEFT JOIN TranslatableItemValues b ON b.ValueId=a.Id");
                STLoggerFactory.Logger.Log("MetadataSet loaded", LogLevelEnum.Debug);
                IEnumerator mdsIt = tb.Rows.GetEnumerator();

                while (mdsIt.MoveNext())
                {
                    int metadataSetId = (int)((DataRow)mdsIt.Current)["Id"];
                    MetadataSetType metadataSet = new MetadataSetType();
                    bool onlyLang = false;
                    int pos = 0;
                    //List<RMAttributeData> mdsNameList = readTranslatableItemValue((int)((DataRow)mdsIt.Current)["NameId"]);
                    //if (mdsNameList != null && mdsNameList.Count > 0)
                    //{
                    //    metadataSet.Name = new List<Name>();
                    //    foreach (RMAttributeData name in mdsNameList)
                    //    {
                    //        Name n = new Name();
                    //        n.lang = name.Language;
                    //        n.TypedValue = name.Value;
                    //        metadataSet.Name.Add(n);
                    //    }
                    //}
                    foreach (MetadataSetType mInRes in result)
                    {
                        string mId = mInRes.getAnnotationValue(ReportType.ANNOTATION_KEY_METADATASET_ID);
                        if (mId.Equals(""+metadataSetId))
                        {
                            metadataSet = mInRes;
                            onlyLang = true;
                            break;
                        }
                        pos++;
                    }

                    Helper.fillWithDbData(metadataSet, (DataRow)mdsIt.Current, onlyLang);

                    if (!onlyLang)
                    {
                        object annotationIdObj = ((DataRow)mdsIt.Current)["AnnotationsId"];
                        if (annotationIdObj != null && annotationIdObj != DBNull.Value)
                        {
                            AddDBAnnotations(metadataSet.Annotations.Annotation, (int)annotationIdObj);
                        }

                        //simple MetadataSet (Reports are not included)
                        if (!excludeReport)
                        {
                            STLoggerFactory.Logger.Log("Search Report data", LogLevelEnum.Debug);
                            List<ReportType> rList = readReportByMetadataSetId(metadataSetId, false, reportStateId);
                            if (rList != null && rList.Count > 0)
                            {
                                metadataSet.Report = rList;
                            }
                            STLoggerFactory.Logger.Log("Report data loaded", LogLevelEnum.Debug);
                        }
                    }

                    if (onlyLang)
                    {
                        result.RemoveAt(pos);
                        result.Insert(pos, metadataSet);
                    }
                    else
                    {
                        result.Add(metadataSet);
                    }
                }

                STLoggerFactory.Logger.Log("MetadataSet data loaded", LogLevelEnum.Debug);
            }
            catch (Exception e)
            {
                STLoggerFactory.Logger.Log("Error to retrieve MetadataSet data - " + e.Message + ": " + e.StackTrace, LogLevelEnum.Error);
                throw e;
            }
            return result;
        }

        /// <summary>
        /// Read from DB a specific Report.
        /// </summary>
        /// <param name="reportId">Report id</param>
        /// <param name="withAttributes">True for get also metadata attributes</param>
        /// <param name="dbId">True for use Id column, otherwise ReferenceId column</param>
        /// <param name="restrictedForPublicationAnnotation">Value annotation id for filter private metadata attributes</param>
        /// <returns>Report data</returns>
        private ReportType readReportById(string metadatasetId, string reportId, bool withAttributes, bool dbId=false, string restrictedForPublicationAnnotation = null)
        {
            if(metadatasetId==null && !dbId)
            {
                throw new Exception("Parameter metadatasetId is required if dbId is false");
            }
            ReportType result = null;
            try
            {
                STLoggerFactory.Logger.Log("Search in Report table with metadatasetId:"+ metadatasetId + ", reportId:" + reportId, LogLevelEnum.Debug);
                string idColumn = "ReferenceId";
                string metfrom = " INNER JOIN MetadataSet m ON m.Id=r.MetadasetId ";
                string metcond = " AND m.ReferenceId=@metadatasetId ";
                if (dbId)
                {
                    idColumn = "Id";
                    metcond = "";
                    metfrom = "";
                }
                string query = $@"
                    SELECT r.Id, r.TargetId, t.TargetName, r.MetadasetId, r.StateId, rs.StateName, r.ReferenceId
                    FROM Report r INNER JOIN Target t ON r.TargetId=t.Id
                        INNER JOIN ReportState rs ON r.StateId=rs.Id " + metfrom +
                    "WHERE r." + idColumn + "=@reportId" + metcond;
                DataTable tb = store.GetTable(query, new STKeyValuePair[] { new STKeyValuePair("reportId", reportId),
                        new STKeyValuePair("metadatasetId", metadatasetId) });
                IEnumerator mdsIt = tb.Rows.GetEnumerator();
                if (mdsIt.MoveNext())
                {
                    DataRow rRow = (DataRow)mdsIt.Current;
                    result = Helper.BuildReportTypeFromDB(rRow);

                    int targetId = ((int)rRow["TargetId"]);
                    DataTable ttb = store.GetTable($@"
                        SELECT ti.Name as TargetIdentifierName, ti.Value as TargetIdentifierValue, ti.TargetIdentifierTypeId, tit.Name as TargetIdentifierTypeName
                        FROM TargetIdentifier ti LEFT JOIN TargetIdentifierType tit ON ti.TargetIdentifierTypeId=tit.Id 
                        WHERE ti.TargetId=@targetId", new STKeyValuePair[] { new STKeyValuePair("targetId", targetId) }
                    );
                    IEnumerator mdstIt = ttb.Rows.GetEnumerator();

                    List<ReferenceValueType> rTargetList = new List<ReferenceValueType>();
                    while (mdstIt.MoveNext())
                    {
                        DataRow rtRow = (DataRow)mdstIt.Current;
                        SetReportTypeAnnotaton(result, rtRow);
                        ReferenceValueType rvt = Helper.BuildReferenceValueTypeFromDB(rtRow);
                        rTargetList.Add(rvt);
                    }
                    result.Target.ReferenceValue = rTargetList;

                    if (withAttributes)
                    {
                        int reportKeyId = Convert.ToInt32(result.getAnnotationValue(ReportType.ANNOTATION_KEY_REPORT_ID));
                        result.AttributeSet = buildAttributeSetByReportId(reportKeyId, restrictedForPublicationAnnotation);
                    }
                }
            }
            catch (Exception e)
            {
                STLoggerFactory.Logger.Log("Error to retrieve Report data - " + e.Message + ": " + e.StackTrace, LogLevelEnum.Error);
                throw e;
            }

            return result;
        }

        private void SetReportTypeAnnotaton(ReportType result, DataRow rtRow)
        {
            object targetTypeIdObj = ((DataRow)rtRow)["TargetIdentifierTypeId"];
            if (targetTypeIdObj != null && targetTypeIdObj != DBNull.Value)
            {
                int targetTypeId = (int)targetTypeIdObj;

                AnnotationType ttrTypeId = new AnnotationType();
                ttrTypeId.id = ReportType.ANNOTATION_KEY_REPORT_TYPE;
                ttrTypeId.AnnotationText = new List<TextType>();
                TextType txtrTypeId = new TextType();
                txtrTypeId.lang = RMUtil.RMUtility.EN_LANGUAGE;

                if (targetTypeId == ReportType.TARGET_DATAFLOW_ID)
                {
                    txtrTypeId.TypedValue = ReportType.TARGET_DATAFLOW_VALUE;
                }
                else if (targetTypeId == ReportType.TARGET_METADATAFLOW_ID)
                {
                    txtrTypeId.TypedValue = ReportType.TARGET_METADATAFLOW_VALUE;
                }
                ttrTypeId.AnnotationText.Add(txtrTypeId);
                result.addAnnotation(ttrTypeId);
            } 
        }


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
        public IList<ReportType> SearchReportByParams(int metadasetId, string targetType, string identifierValue, bool withAttributes, int reportStateId = 0, string restrictedForPublicationAnnotation = null)
        {
            IList<ReportType> result = new List<ReportType>();
            try
            {
                string paramLog = "metadasetId='" + metadasetId + "', targetType='" + targetType + "'";
                string conditions = "";
                List<STKeyValuePair> param = new List<STKeyValuePair>();
                if (metadasetId > 0)
                {
                    conditions += " AND r.MetadasetId=@metadasetId";
                    param.Add(new STKeyValuePair("metadasetId", metadasetId));
                }
                if (targetType != null && targetType.Trim().Length > 0)
                {
                    conditions += " AND tit.Name=@targetType";
                    param.Add(new STKeyValuePair("targetType", targetType));
                }
                if (identifierValue != null && identifierValue.Trim().Length > 0)
                {
                    conditions += " AND ti.Value=@identifierValue";
                    param.Add(new STKeyValuePair("identifierValue", identifierValue));
                }
                if (reportStateId > 0)
                {
                    conditions += " AND r.StateId=@reportStateId";
                    param.Add(new STKeyValuePair("reportStateId", reportStateId) );
                }

                STLoggerFactory.Logger.Log("Search in Report table by " + paramLog, LogLevelEnum.Debug);
                //, r.TargetId, t.TargetName, ti.Name as TargetIdentifierName, ti.Value as TargetIdentifierValue, ti.TargetIdentifierTypeId, tit.Name as TargetIdentifierTypeName, r.MetadasetId, r.StateId, rs.StateName
                DataTable tb = store.GetTable($@"
                    SELECT DISTINCT r.Id
                    FROM Report r INNER JOIN Target t ON r.TargetId=t.Id INNER JOIN TargetIdentifier ti ON ti.TargetId=t.Id 
                        LEFT JOIN TargetIdentifierType tit ON ti.TargetIdentifierTypeId=tit.Id 
                        INNER JOIN ReportState rs ON r.StateId=rs.Id
                    WHERE 1=1" + conditions, param.ToArray());
                //" ORDER BY ti.TargetIdentifierTypeId"
                IEnumerator mdsIt = tb.Rows.GetEnumerator();
                while (mdsIt.MoveNext())
                {
                    DataRow rRow = (DataRow)mdsIt.Current;
                    int reportId = (int)rRow["Id"];
                    ReportType currReport = readReportById(null, ""+reportId, withAttributes, true, restrictedForPublicationAnnotation);
                    result.Add(currReport);
                }
            }
            catch (Exception e)
            {
                STLoggerFactory.Logger.Log("Error to retrieve Report data - " + e.Message + ": " + e.StackTrace, LogLevelEnum.Error);
                throw e;
            }

            return result;
        }


        /// <summary>
        /// Read from DB alle ReportedAttributes of a specific Report.
        /// </summary>
        /// <param name="reportId">Report id</param>
        /// <param name="restrictedForPublicationAnnotation">Value annotation id for filter private metadata attributes</param>
        /// <returns>A AttributeSetType object with attributes found</returns>
        private AttributeSetType buildAttributeSetByReportId(int reportId, string restrictedForPublicationAnnotation = null)
        {
            string joinParams = "";
            string condParams = "";
            if (restrictedForPublicationAnnotation!=null)
            {
                //joinParams = "LEFT JOIN AnnotationsGroup ag ON ma.AnnotationsId=ag.Id LEFT JOIN Annotation a ON ag.Id=a.Id ";
                //condParams = " AND a.AnnotationId<>@publicationAnn";
                condParams = " AND NOT EXISTS (SELECT * FROM AnnotationsGroup ag INNER JOIN Annotation a ON ag.Id=a.AnnotationGroupId WHERE ma.AnnotationsId=ag.Id AND a.AnnotationId=@publicationAnn)";
            }
            AttributeSetType ast = new AttributeSetType();
            STLoggerFactory.Logger.Log("Search in MetadataAttribute table with ReportId " + reportId, LogLevelEnum.Debug);
            DataTable reptb = store.GetTable($@"SELECT ma.Id,ma.AttributeName,ma.ReportId,ma.ParentAttributeId,ma.ValueId,ma.AnnotationsId,ma.IsPresentational 
                FROM MetadataAttribute ma " + joinParams + "WHERE ma.ReportId=@reportId AND ma.ParentAttributeId IS NULL" + condParams + " ORDER BY ma.Id",
                new STKeyValuePair[] { new STKeyValuePair("reportId", reportId), new STKeyValuePair("publicationAnn", restrictedForPublicationAnnotation) });

            List<ReportedAttributeType> ratList = new List<ReportedAttributeType>();

            foreach (DataRow attr in reptb.Rows)
            {
                ReportedAttributeType currReport = buildReportAttributeType(attr, restrictedForPublicationAnnotation);
                ratList.Add(currReport);
            }
            ast.ReportedAttribute = ratList;
            return ast;
        }

        /// <summary>
        /// Build a ReportedAttribute object from data of an attribute into DB.
        /// </summary>
        /// <param name="store">DB Access</param>
        /// <param name="attr">DB row  of the attribute</param>
        /// <returns>A ReportedAttributeType object with data of attribute</returns>
        private ReportedAttributeType buildReportAttributeType(DataRow attr, string restrictedForPublicationAnnotation)
        {
            ReportedAttributeType result = new ReportedAttributeType();

            int mAttrId = (int)((DataRow)attr)["Id"];

            string mAttrName = (string)((DataRow)attr)["AttributeName"];
            result.id = mAttrName;

            int reportId = (int)((DataRow)attr)["ReportId"];

            //int parentAttId = 0;
            //object parentAttIdObj = ((DataRow)attr)["ParentAttributeId"];
            //if (parentAttIdObj != null && parentAttIdObj != DBNull.Value)
            //{
            //    parentAttId = (int)parentAttIdObj;
            //}

            int valueId = 0;
            object valueIdObj = ((DataRow)attr)["ValueId"];
            if (valueIdObj != null && valueIdObj != DBNull.Value)
            {
                valueId = (int)valueIdObj;
            }

            //bool isPresentation = (bool)((DataRow)attr)["IsPresentational"];

            AnnotationsType t = new AnnotationsType();

            List<AnnotationType> ta = new List<AnnotationType>();

            AnnotationType ttId = new AnnotationType();
            ttId.id = ReportedAttributeType.ANNOTATION_KEY_REPORT_ATTRIBUTE_ID;
            ttId.AnnotationText = new List<TextType>();
            ttId.AnnotationText.Add(new TextType("" + mAttrId, RMUtil.RMUtility.EN_LANGUAGE));
            ta.Add(ttId);
            t.Annotation = ta;

            result.Annotations = new Annotations(t);

            object annotationIdObj = attr["AnnotationsId"];
            if (annotationIdObj != null && annotationIdObj != DBNull.Value)
            {
                AddDBAnnotations(result.Annotations.Annotation, (int)annotationIdObj);
            }

            if (valueId > 0)
            {
                List<RMAttributeData> valueData = readTranslatableItemValue(valueId);
                List<Text> values = new List<Text>();
                foreach (RMAttributeData currData in valueData)
                {
                    Text tValue = new Text();
                    tValue.lang = currData.Language;
                    tValue.TypedValue = currData.Value;
                    values.Add(tValue);
                }
                result.Text = values;
            }

            STLoggerFactory.Logger.Log("Search in MetadataAttribute table with ReportId " + reportId + " and ParentAttributeId " + mAttrId, LogLevelEnum.Debug);
            string condParams = "";
            if (restrictedForPublicationAnnotation != null)
            {
                condParams = " AND NOT EXISTS (SELECT * FROM AnnotationsGroup ag INNER JOIN Annotation a ON ag.Id=a.AnnotationGroupId WHERE AnnotationsId=ag.Id AND a.AnnotationId=@publicationAnn) ";
            }
            DataTable chiedReptb = store.GetTable($@"SELECT Id,AttributeName,ReportId,ParentAttributeId,ValueId,AnnotationsId,IsPresentational 
                        FROM MetadataAttribute WHERE ReportId=@reportId AND ParentAttributeId=@ParentAttributeId "+ condParams + "ORDER BY Id, CASE WHEN ValueId IS NULL THEN 1 ELSE 0 END, ValueId",
                new STKeyValuePair[] { new STKeyValuePair("reportId", reportId), new STKeyValuePair("ParentAttributeId", mAttrId), new STKeyValuePair("publicationAnn", restrictedForPublicationAnnotation) });

            List<ReportedAttributeType> ratList = new List<ReportedAttributeType>();
            foreach (DataRow childAttr in chiedReptb.Rows)
            {
                ReportedAttributeType currReport = buildReportAttributeType(childAttr, restrictedForPublicationAnnotation);
                ratList.Add(currReport);
            }
            if (ratList.Count > 0)
            {
                AttributeSetType ast = new AttributeSetType();
                ast.ReportedAttribute = ratList;
                result.AttributeSet = ast;
            }

            return result;
        }

        private List<ReportType> readReportByMetadataSetId(int metadataSetId, bool withAttributes, int reportStateId = 0)
        {
            List<ReportType> result = new List<ReportType>();

            try
            {
                STLoggerFactory.Logger.Log("Search in Report table with MetadataSetId " + metadataSetId, LogLevelEnum.Debug);
                StringBuilder sb = new StringBuilder("SELECT r.Id, r.TargetId FROM Report r WHERE r.MetadasetId = @metadataSetId");
                STKeyValuePair[] queryParams = null;
                if (reportStateId > 0)
                {
                    sb.Append(" AND StateId=@reportStateId");
                    queryParams = new STKeyValuePair[] { new STKeyValuePair("metadataSetId", metadataSetId),
                        new STKeyValuePair("reportStateId", reportStateId) };
                }
                else
                {
                    queryParams = new STKeyValuePair[] { new STKeyValuePair("metadataSetId", metadataSetId) };
                }
                string query = sb.ToString();

                DataTable tb = store.GetTable(query, queryParams);
                IEnumerator mdsIt = tb.Rows.GetEnumerator();
                while (mdsIt.MoveNext())
                {
                    DataRow rRow = (DataRow)mdsIt.Current;
                    int reportId = (int)((DataRow)mdsIt.Current)["Id"];
                    ReportType r = readReportById(null,""+reportId, withAttributes,true);
                    result.Add(r);
                }
            }
            catch (Exception e)
            {
                STLoggerFactory.Logger.Log("Error to retrieve Report data - " + e.Message + ": " + e.StackTrace, LogLevelEnum.Error);
                throw e;
            }

            return result;
        }

        private List<RMAttributeData> readTranslatableItemValue(int translatableItemId)
        {
            List<RMAttributeData> result = new List<RMAttributeData>();

            if (translatableItemId < 1)
            {
                throw new Exception("Value for translatableItemId parameter not valid");
            }

            try
            {
                STLoggerFactory.Logger.Log("Search in TranslatableItems with id " + translatableItemId, LogLevelEnum.Debug);
                STKeyValuePair parameterPair = new STKeyValuePair("id", translatableItemId);
                STKeyValuePair[] queryParemeters = new STKeyValuePair[] { parameterPair };
                DataTable tb = store.GetTable($@"
                    SELECT a.Id, b.Language, b.Value, c.id, c.Type 
                    FROM TranslatableItems a INNER JOIN TranslatableItemValues b ON b.ValueId=a.Id INNER JOIN TranslatableItemFormat c ON a.ValueTypeId=c.Id 
                    WHERE a.Id=@id;", queryParemeters);
                IEnumerator itemIt = tb.Rows.GetEnumerator();
                while (itemIt.MoveNext())
                {
                    RMAttributeData item = new RMAttributeData();
                    item.Id = (int)((DataRow)itemIt.Current)["Id"];
                    item.Language = (string)((DataRow)itemIt.Current)["Language"];
                    item.Value = (string)((DataRow)itemIt.Current)["Value"];
                    item.TypeId = (int)((DataRow)itemIt.Current)["id"];
                    item.Type = (string)((DataRow)itemIt.Current)["Type"];
                    result.Add(item);
                }
            }
            catch (Exception e)
            {
                STLoggerFactory.Logger.Log("Error to retrieve TranslatableItem data - " + e.Message + ": " + e.StackTrace, LogLevelEnum.Error);
                throw e;
            }
            return result;
        }

        /// <summary>
        /// Update a TranslatableItem value.
        /// </summary>
        /// <param name="store">DB Access</param>
        /// <param name="values">List of value to save for each language</param>
        /// <param name="itemType">Id of data type</param>
        /// <returns>Id into DB for the data stored</returns>
        private int updateTranslatableItem(int translatableItemId, IList<Text> values, int itemType)
        {
            int result = translatableItemId;
            try
            {
                STLoggerFactory.Logger.Log("Search in TranslatableItems", LogLevelEnum.Debug);
                DataTable tb = store.GetTable($@"SELECT Id, ValueTypeId FROM TranslatableItems WHERE Id=@translatableItemId;",
                    new STKeyValuePair[] { new STKeyValuePair("translatableItemId", translatableItemId) });
                TranslatableItemsDataTable trgDt = new TranslatableItemsDataTable();
                trgDt.Merge(tb);

                TranslatableItemsRow itemRow = (TranslatableItemsRow)trgDt.Rows[0];

                if (itemRow.ValueTypeId != itemType)
                {
                    itemRow.ValueTypeId = itemType;
                    store.InsertUpdateData(trgDt);
                    STLoggerFactory.Logger.Log("TranslatableItems with id " + translatableItemId + " updated", LogLevelEnum.Debug);
                }
                
                STLoggerFactory.Logger.Log("Adding new value in TranslatableItemValues", LogLevelEnum.Debug);
                TranslatableItemValuesDataTable trgDt2 = new TranslatableItemValuesDataTable();

                int deleted = store.ExecuteCommand("DELETE FROM TranslatableItemValues WHERE ValueId=@translatableItemId",
                    new STKeyValuePair[] { new STKeyValuePair("translatableItemId", translatableItemId) });
                if (result > 0)
                {
                    foreach (Text text in values)
                    {
                        TranslatableItemValuesRow valueRow = trgDt2.NewTranslatableItemValuesRow();
                        valueRow.ValueId = translatableItemId;
                        valueRow.Language = (text.lang == null || text.lang.Equals("null")) ? RMUtil.RMUtility.UND_LANGUAGE : text.lang; //default language
                        valueRow.Value = text.TypedValue;

                        trgDt2.Rows.Add(valueRow);
                        store.InsertUpdateData(trgDt2);
                    }
                }

                STLoggerFactory.Logger.Log("TranslatableItemValues with id " + translatableItemId + " updated", LogLevelEnum.Debug);
            }
            catch (Exception e)
            {
                STLoggerFactory.Logger.Log("Error to update TranslatableItems data: " + e.StackTrace, LogLevelEnum.Error);
                throw e;
            }
            return result;
        }

        /// <summary>
        /// Insert a new TranslatableItem value.
        /// </summary>
        /// <param name="store">DB Access</param>
        /// <param name="values">List of value to save for each language</param>
        /// <param name="itemType">Id of data type</param>
        /// <returns>Id into DB for the data stored</returns>
        private int writeTranslatableItem(IList<Text> values, int itemType)
        {
            int result = 0;
            try
            {
                TranslatableItemsDataTable trgDt = new TranslatableItemsDataTable();

                STLoggerFactory.Logger.Log("Adding new value in TranslatableItems", LogLevelEnum.Debug);
                int translatableItemsNewId = getNextIdValue(store, "id", "TranslatableItems");

                TranslatableItemsRow itemRow = trgDt.NewTranslatableItemsRow();
                itemRow.Id = translatableItemsNewId;
                itemRow.ValueTypeId = itemType;
                trgDt.Rows.Add(itemRow);
                store.InsertUpdateData(trgDt);
                STLoggerFactory.Logger.Log("New row added to TranslatableItems with id " + translatableItemsNewId, LogLevelEnum.Debug);

                TranslatableItemValuesDataTable trgDt2 = new TranslatableItemValuesDataTable();

                foreach (Text text in values)
                {
                    TranslatableItemValuesRow valueRow = trgDt2.NewTranslatableItemValuesRow();
                    valueRow.ValueId = translatableItemsNewId;
                    valueRow.Language = (text.lang == null || text.lang.Equals("null")) ? RMUtil.RMUtility.UND_LANGUAGE : text.lang; //default language
                    valueRow.Value = text.TypedValue;

                    trgDt2.Rows.Add(valueRow);
                    store.InsertUpdateData(trgDt2);
                }

                result = translatableItemsNewId;
                STLoggerFactory.Logger.Log("New row added to TranslatableItemValues with id " + translatableItemsNewId, LogLevelEnum.Debug);
            }
            catch (Exception e)
            {
                STLoggerFactory.Logger.Log("Error to insert TranslatableItems data: " + e.StackTrace, LogLevelEnum.Error);
                throw e;
            }
            return result;
        }

        /// <summary>
        /// Insert a new TranslatableItem value.
        /// </summary>
        /// <param name="store">DB Access</param>
        /// <param name="values">List of value to save for each language</param>
        /// <param name="itemType">Id of data type</param>
        /// <returns>Id into DB for the data stored</returns>
        private int massiveWriteTranslatableItem(MassiveReport massiveReport, IList<Text> values, int itemType)
        {
            int result = 0;
            try
            {
                STLoggerFactory.Logger.Log("Adding new value in TranslatableItems", LogLevelEnum.Debug);

                var itemRow = massiveReport.TranslatableItemsDataTable.NewTranslatableItemsRow();
                itemRow.Id = ++massiveReport.LastTranslatableItemsId;
                itemRow.ValueTypeId = itemType;
                massiveReport.TranslatableItemsDataTable.Rows.Add(itemRow);
                //store.InsertUpdateData(massiveUpdateReport.TranslatableItemsDataTable);
                STLoggerFactory.Logger.Log("New row added to TranslatableItems with id " + massiveReport.LastTranslatableItemsId, LogLevelEnum.Debug);


                foreach (Text text in values)
                {
                    var valueRow = massiveReport.TranslatableItemValuesDataTable.NewTranslatableItemValuesRow();
                    valueRow.ValueId = massiveReport.LastTranslatableItemsId;
                    valueRow.Language = (text.lang == null || text.lang.Equals("null")) ? RMUtil.RMUtility.UND_LANGUAGE : text.lang; //default language
                    valueRow.Value = text.TypedValue;

                    massiveReport.TranslatableItemValuesDataTable.Rows.Add(valueRow);
                    //store.InsertUpdateData(massiveUpdateReport.TranslatableItemValuesDataTable);
                }

                result = massiveReport.LastTranslatableItemsId;
                STLoggerFactory.Logger.Log("New row added to TranslatableItemValues with id " + massiveReport.LastTranslatableItemsId, LogLevelEnum.Debug);
            }
            catch (Exception e)
            {
                STLoggerFactory.Logger.Log("Error to insert TranslatableItems data: " + e.StackTrace, LogLevelEnum.Error);
                throw e;
            }
            return result;
        }

        /// <summary>
        /// Save into DB a MetadataSet.
        /// </summary>
        /// <param name="store">DB Access</param>
        /// <param name="mdt">MetadataSet data</param>
        /// <param name="xDomMSD">MSD file</param>
        /// <returns>L'id of the MetadataSet stored</returns>
        private int writeMetadataSet(MetadataSetType mdt, XmlDocument xDomMSD)
        {
            string msdAgency = "";
            string msdId = "";
            string msdVersion = "";

            string metadataStructureNodeName = "MetadataStructure";
            XmlNode metadataStructureNode = xDomMSD.SelectSingleNode("//*[local-name()='" + metadataStructureNodeName + "']");
            if (metadataStructureNode == null)
            {
                throw new Exception("Node " + metadataStructureNodeName + " not found in MSD file");
            }
            msdId = metadataStructureNode.Attributes["id"].Value;
            msdAgency = metadataStructureNode.Attributes["agencyID"].Value;
            msdVersion = metadataStructureNode.Attributes["version"].Value;

            string flowId = "";
            string flowAgency = "";
            string flowVersion = "";
            foreach (AnnotationType ann in mdt.Annotations.Annotation)
            {
                if (ann.id == MetadataSetType.ANNOTATION_KEY_METADATASET_FLOW_AGENCY_ID)
                {
                    flowAgency = ann.AnnotationText[0].TypedValue;
                }
                if (ann.id == MetadataSetType.ANNOTATION_KEY_METADATASET_FLOW_ID)
                {
                    flowId = ann.AnnotationText[0].TypedValue;
                }
                if (ann.id == MetadataSetType.ANNOTATION_KEY_METADATASET_FLOW_VERSION_ID)
                {
                    flowVersion = ann.AnnotationText[0].TypedValue;
                }
            }

            int result = writeMetadataSet(mdt, flowAgency, flowId, flowVersion, msdAgency, msdId, msdVersion);
            if (result == NULL_NUMBER_FIELD_VALUE)
            {
                throw new Exception("MetadataSet not created");
            }

            foreach (ReportType rt in mdt.Report)
            {
                int reportIs = writeReport(result, NULL_NUMBER_FIELD_VALUE, rt, xDomMSD);
            }

            return result;
        }

        /// <summary>
        /// Update a MetadataSet.
        /// </summary>
        /// <param name="store">DB Access</param>
        /// <param name="metadataSetId">Id MetadataSet to update</param>
        /// <param name="mdt">Data of MetadataSet to update</param>
        /// <param name="xDomMSD">MSD file</param>
        /// <returns>L'id of the MetadataSet stored</returns>
        private int updateMetadataSet(int metadataSetId, MetadataSetType mdt, XmlDocument xDomMSD)
        {
            DataTable tb = store.GetTable($@"SELECT * FROM MetadataSet WHERE Id=@metadataSetId",
                new STKeyValuePair[] { new STKeyValuePair("metadataSetId", metadataSetId) });
            MetadataSetDataTable trgDt = new MetadataSetDataTable();
            trgDt.Merge(tb);

            MetadataSetRow workRow = (MetadataSetRow)trgDt.Rows[0];
            Helper.fillWithAnnotationData(workRow, mdt);
            Helper.fillWithInputData(workRow, mdt);

            IList<Text> nameLan = new List<Text>();
            foreach (Name n in mdt.Name)
            {
                Text t = new Text();
                t.lang = n.lang;
                t.TypedValue = n.TypedValue;
                nameLan.Add(t);
            }

            int annGroupToDelete = 0;
            try
            {
                annGroupToDelete = workRow.AnnotationsId;
            }
            catch (Exception) { }
            int annotId = writeDBAnnotations(mdt);
            if (annotId > 0)
            {
                workRow.AnnotationsId = annotId;
            }

            workRow.NameId = updateTranslatableItem(workRow.NameId, nameLan, VALUE_FORMAT_STRING_ID);
            STLoggerFactory.Logger.Log("Updated TranslatableItem with id " + workRow.NameId, LogLevelEnum.Debug);

            store.InsertUpdateData(trgDt);
            STLoggerFactory.Logger.Log("MetadataSet with id " + metadataSetId + " updated", LogLevelEnum.Debug);

            try
            {
                if (annGroupToDelete > 0)
                {
                    int deleted = store.ExecuteCommand("DELETE FROM AnnotationsGroup WHERE Id=@AnnotationsId",
                                new STKeyValuePair[] { new STKeyValuePair("AnnotationsId", annGroupToDelete) });
                }
            }
            catch (Exception e)
            {
                STLoggerFactory.Logger.Log("Error to delete old AnnotationsGroup of MetadataSet", e, LogLevelEnum.Warn);

            }
            return metadataSetId;
        }

        private int writeMetadataAttributeNode(int currReportId, int attrParentId, ReportedAttributeType currRepAttribute, XmlDocument xDomMSD)
        {
            bool isPresentational = false;
            try
            {
                isPresentational = MsdUtil.checkIsPresentational(xDomMSD, currRepAttribute.id, _customIsPresentational);
            }
            catch (Exception e)
            {
                string errorMsg = "Error to retrieve isPresentational value for node " + currRepAttribute.id;
                STLoggerFactory.Logger.Log(errorMsg + " - " + e.Message + ": " + e.StackTrace, LogLevelEnum.Error);
                throw new Exception(errorMsg);
            }

            int itemId = NULL_NUMBER_FIELD_VALUE;

            if (!isPresentational)
            {
                int attrTypeId = NULL_NUMBER_FIELD_VALUE;
                try
                {
                    attrTypeId = MsdUtil.getMetadataAttributeType(xDomMSD, currRepAttribute.id);
                    itemId = writeTranslatableItem(currRepAttribute.Text, attrTypeId);
                }
                catch (Exception e)
                {
                    string errorMsg = "Error to retrieve attribute type value for node " + currRepAttribute.id;
                    STLoggerFactory.Logger.Log(errorMsg + " - " + e.Message + ": " + e.StackTrace, LogLevelEnum.Error);
                    throw new Exception(errorMsg);
                }
            }

            int annotId = writeDBAnnotations(currRepAttribute);

            int newAttrId = writeMetadataAttribute(currReportId, attrParentId, currRepAttribute.id, itemId, isPresentational, annotId);

            if (currRepAttribute.AttributeSet != null && currRepAttribute.AttributeSet.ReportedAttribute != null)
            {
                foreach (ReportedAttributeType currChildNode in currRepAttribute.AttributeSet.ReportedAttribute)
                {
                    writeMetadataAttributeNode(currReportId, newAttrId, currChildNode, xDomMSD);
                }
            }

            return newAttrId;
        }

        private int massiveWriteMetadataAttributeNode(MassiveReport massiveReport, int currReportId, int attrParentId, ReportedAttributeType currRepAttribute, XmlDocument xDomMSD)
        {
            bool isPresentational = false;
            try
            {
                isPresentational = MsdUtil.checkIsPresentational(xDomMSD, currRepAttribute.id, _customIsPresentational);
            }
            catch (Exception e)
            {
                string errorMsg = "Error to retrieve isPresentational value for node " + currRepAttribute.id;
                STLoggerFactory.Logger.Log(errorMsg + " - " + e.Message + ": " + e.StackTrace, LogLevelEnum.Error);
                throw new Exception(errorMsg);
            }

            int itemId = NULL_NUMBER_FIELD_VALUE;

            if (!isPresentational)
            {
                int attrTypeId = NULL_NUMBER_FIELD_VALUE;
                try
                {
                    attrTypeId = MsdUtil.getMetadataAttributeType(xDomMSD, currRepAttribute.id);
                    itemId = massiveWriteTranslatableItem(massiveReport, currRepAttribute.Text, attrTypeId);
                }
                catch (Exception e)
                {
                    string errorMsg = "Error to retrieve attribute type value for node " + currRepAttribute.id;
                    STLoggerFactory.Logger.Log(errorMsg + " - " + e.Message + ": " + e.StackTrace, LogLevelEnum.Error);
                    throw new Exception(errorMsg);
                }
            }

            int annotId = massiveWriteDBAnnotations(massiveReport, currRepAttribute);

            int newAttrId = massiveWriteMetadataAttribute(massiveReport, currReportId, attrParentId, currRepAttribute.id, itemId, isPresentational, annotId);

            if (currRepAttribute.AttributeSet != null && currRepAttribute.AttributeSet.ReportedAttribute != null)
            {
                foreach (ReportedAttributeType currChildNode in currRepAttribute.AttributeSet.ReportedAttribute)
                {
                    massiveWriteMetadataAttributeNode(massiveReport, currReportId, newAttrId, currChildNode, xDomMSD);
                }
            }

            return newAttrId;
        }

        private int writeMetadataAttribute(int reportId, int attrParentId, string attributeName, int translatableItemId, bool IsPresentational, int annotId)
        {
            int result = NULL_NUMBER_FIELD_VALUE;
            try
            {
                STLoggerFactory.Logger.Log("Storing " + attributeName + "MetadataAttribute", LogLevelEnum.Debug);
                MetadataAttributeDataTable trgDt = new MetadataAttributeDataTable();

                STLoggerFactory.Logger.Log("Adding new value in MetadataAttribute", LogLevelEnum.Debug);
                int metadataAttributeNewId = getNextIdValue(store, "Id", "MetadataAttribute");
                MetadataAttributeRow mdaRow = trgDt.NewMetadataAttributeRow();
                mdaRow.Id = metadataAttributeNewId;
                mdaRow.AttributeName = attributeName;
                mdaRow.ReportId = reportId;
                if (translatableItemId != NULL_NUMBER_FIELD_VALUE)
                {
                    mdaRow.ValueId = translatableItemId;
                }
                if (annotId > 0)
                {
                    mdaRow.AnnotationsId = annotId;
                }
                mdaRow.IsPresentational = IsPresentational;
                if (attrParentId != NULL_NUMBER_FIELD_VALUE)
                {
                    mdaRow.ParentAttributeId = attrParentId;
                }

                trgDt.Rows.Add(mdaRow);
                store.InsertUpdateData(trgDt);
                STLoggerFactory.Logger.Log("New row added to MetadataAttribute with id " + metadataAttributeNewId, LogLevelEnum.Debug);
                result = metadataAttributeNewId;
            }
            catch (Exception e)
            {
                STLoggerFactory.Logger.Log("Error to insert MetadataAttribute data: " + e.StackTrace, LogLevelEnum.Error);
                throw e;
            }
            return result;
        }

        private int massiveWriteMetadataAttribute(MassiveReport massiveUpdateReport, int reportId, int attrParentId, string attributeName, int translatableItemId, bool IsPresentational, int annotId)
        {
            int result = NULL_NUMBER_FIELD_VALUE;
            try
            {
                STLoggerFactory.Logger.Log("Storing " + attributeName + "MetadataAttribute", LogLevelEnum.Debug);

                STLoggerFactory.Logger.Log("Adding new value in MetadataAttribute", LogLevelEnum.Debug);

                int metadataAttributeId = ++massiveUpdateReport.LastMetadataAttributeId;
                MetadataAttributeRow mdaRow = massiveUpdateReport.MetadataAttributeDataTable.NewMetadataAttributeRow();
                mdaRow.Id = metadataAttributeId;
                mdaRow.AttributeName = attributeName;
                mdaRow.ReportId = reportId;
                if (translatableItemId != NULL_NUMBER_FIELD_VALUE)
                {
                    mdaRow.ValueId = translatableItemId;
                }
                if (annotId > 0)
                {
                    mdaRow.AnnotationsId = annotId;
                }
                mdaRow.IsPresentational = IsPresentational;
                if (attrParentId != NULL_NUMBER_FIELD_VALUE)
                {
                    mdaRow.ParentAttributeId = attrParentId;
                }

                massiveUpdateReport.MetadataAttributeDataTable.Rows.Add(mdaRow);
                //store.InsertUpdateData(massiveUpdateReport.MetadataAttributeDataTable);
                STLoggerFactory.Logger.Log("New row added to MetadataAttribute with id " + metadataAttributeId, LogLevelEnum.Debug);
                result = metadataAttributeId;
            }
            catch (Exception e)
            {
                STLoggerFactory.Logger.Log("Error to insert MetadataAttribute data: " + e.StackTrace, LogLevelEnum.Error);
                throw e;
            }
            return result;
        }

        /// <summary>
        /// Save into DB a MetadataSet.
        /// </summary>
        /// <param name="store">DB Access</param>
        /// <param name="mdt">MetadataSet data</param>
        /// <param name="flowAgency">Flow agency value</param>
        /// <param name="flowId">Flow Id value</param>
        /// <param name="flowVersion">Flow version value</param>
        /// <param name="msdAgency">MSD agency value</param>
        /// <param name="msdId">MSD id value</param>
        /// <param name="msdVersion">MSD versione value</param>
        /// <returns>Id of the MetadataSet stored</returns>
        private int writeMetadataSet(MetadataSetType mdst, string flowAgency, string flowId, string flowVersion, string msdAgency, string msdId, string msdVersion)
        {
            //the first id must be greater than 0
            int metadataSetNewId = 0;
            try
            {
                STLoggerFactory.Logger.Log("Adding new value in MetadataSet", LogLevelEnum.Debug);

                metadataSetNewId = getNextIdValue(store, "Id", "MetadataSet");
                MetadataSetDataTable trgDt = new MetadataSetDataTable();

                MetadataSetRow workRow = trgDt.NewMetadataSetRow();
                Helper.fillWithInputData(workRow, mdst);

                workRow.Id = metadataSetNewId;
                workRow.MetadataflowAgency = flowAgency;
                workRow.MetadataflowId = flowId;
                workRow.MetadataflowVersion = flowVersion;
                workRow.MSDAgency = msdAgency;
                workRow.MSDId = msdId;
                workRow.MSDVersion = msdVersion;

                int annotId = writeDBAnnotations(mdst);
                if (annotId > 0)
                {
                    workRow.AnnotationsId = annotId;
                }

                IList<Text> nameLan = new List<Text>();
                foreach (Name n in mdst.Name)
                {
                    Text t = new Text();
                    t.lang = n.lang;
                    t.TypedValue = n.TypedValue;
                    nameLan.Add(t);
                }

                workRow.NameId = writeTranslatableItem(nameLan, VALUE_FORMAT_STRING_ID);
                STLoggerFactory.Logger.Log("Generated new TranslatableItem with id " + workRow.NameId, LogLevelEnum.Debug);

                trgDt.Rows.Add(workRow);
                store.InsertUpdateData(trgDt);
                STLoggerFactory.Logger.Log("Stored a new MetadataSet with id " + metadataSetNewId, LogLevelEnum.Debug);
            }
            catch (Exception e)
            {
                STLoggerFactory.Logger.Log("Error to insert MetadataSet data - " + e.Message + ": " + e.StackTrace, LogLevelEnum.Error);
                throw e;
            }
            return metadataSetNewId;
        }

        private int getNextIdValue(IDataStore store, string idColumnName, string table)
        {
            int result = 0;
            DataTable mdsIdDT = store.GetTable($@"SELECT MAX(" + idColumnName + ") FROM " + table + ";");
            IEnumerator mdsIt = mdsIdDT.Rows.GetEnumerator();
            if (mdsIt.MoveNext())
            {
                try
                {
                    result = (int)((DataRow)mdsIt.Current)[0];
                }
                catch (Exception)
                {
                    STLoggerFactory.Logger.Log("Table " + table + " empty, next id value 1", LogLevelEnum.Debug);
                }
            }
            return ++result;
        }

        private int writeDBAnnotations(AnnotableType mdst)
        {
            int result = NULL_NUMBER_FIELD_VALUE;
            if (mdst.Annotations != null && mdst.Annotations.Annotation != null)
            {
                if (ContainsUserAnnotation(mdst.Annotations.Annotation))
                {
                    AnnotationTypeDataTable attb = new AnnotationTypeDataTable();
                    AnnotationsGroupDataTable agtb = new AnnotationsGroupDataTable();
                    AnnotationDataTable atb = new AnnotationDataTable();

                    AnnotationsGroupRow newAnnotGroupRow = agtb.NewAnnotationsGroupRow();
                    newAnnotGroupRow.Id = getNextIdValue(store, "Id", "AnnotationsGroup");
                    agtb.Rows.Add(newAnnotGroupRow);
                    store.InsertUpdateData(agtb);
                    result = newAnnotGroupRow.Id;

                    foreach (AnnotationType currAnnType in mdst.Annotations.Annotation)
                    {
                        if (isUserAnnotation(currAnnType))
                        {

                            AnnotationRow newAnnot = atb.NewAnnotationRow();
                            newAnnot.AnnotationGroupId = newAnnotGroupRow.Id;
                            //newAnnot.AnnotationsGroupRow = newAnnotGroupRow;
                            newAnnot.Id = getNextIdValue(store, "Id", "Annotation");
                            if (currAnnType.id != null)
                            {
                                newAnnot.AnnotationId = currAnnType.id.Trim();
                            }
                            if (currAnnType.AnnotationTitle != null && currAnnType.AnnotationTitle.Trim().Length > 0)
                            {
                                IList<Text> titleLan = new List<Text>();
                                titleLan.Add(new Text(currAnnType.AnnotationTitle, RMUtility.UND_LANGUAGE));
                                newAnnot.AnnotationTitle = writeTranslatableItem(titleLan, VALUE_FORMAT_STRING_ID);
                            }
                            if (currAnnType.AnnotationType1 != null && currAnnType.AnnotationType1.Trim().Length > 0)
                            {
                                AnnotationTypeRow newAnnotType = attb.NewAnnotationTypeRow();
                                newAnnotType.Id = getNextIdValue(store, "Id", "AnnotationType");
                                newAnnotType.Type = currAnnType.AnnotationType1.Trim();
                                attb.Rows.Add(newAnnotType);
                                store.InsertUpdateData(attb);
                                newAnnot.AnnotationTypeId = newAnnotType.Id;
                            }
                            if (currAnnType.AnnotationText != null && currAnnType.AnnotationText.Count > 0)
                            {
                                IList<Text> textLan = new List<Text>();
                                foreach (TextType n in currAnnType.AnnotationText)
                                {
                                    Text t = new Text();
                                    t.lang = n.lang;
                                    t.TypedValue = n.TypedValue;
                                    textLan.Add(t);
                                }
                                newAnnot.AnnotationTextId = writeTranslatableItem(textLan, VALUE_FORMAT_STRING_ID);
                            }
                            atb.Rows.Add(newAnnot);
                            store.InsertUpdateData(atb);
                        }
                    }
                }
            }
            return result;
        }

        private int massiveWriteDBAnnotations(MassiveReport massiveReport, AnnotableType mdst)
        {
            int result = NULL_NUMBER_FIELD_VALUE;
            if (mdst.Annotations != null && mdst.Annotations.Annotation != null)
            {
                if (ContainsUserAnnotation(mdst.Annotations.Annotation))
                {
                    var newAnnotGroupRow = massiveReport.AnnotationsGroupDataTable.NewAnnotationsGroupRow();
                    newAnnotGroupRow.Id = ++massiveReport.LastAnnotationsGroupId;
                    massiveReport.AnnotationsGroupDataTable.Rows.Add(newAnnotGroupRow);
                    //store.InsertUpdateData(massiveUpdateReport.AnnotationsGroupDataTable);
                    result = newAnnotGroupRow.Id;

                    foreach (AnnotationType currAnnType in mdst.Annotations.Annotation)
                    {
                        if (isUserAnnotation(currAnnType))
                        {

                            var newAnnot = massiveReport.AnnotationDataTable.NewAnnotationRow();
                            newAnnot.AnnotationGroupId = newAnnotGroupRow.Id;
                            newAnnot.Id = ++massiveReport.LastAnnotationsId;

                            string AnnotationId = "";
                            if (currAnnType.id != null && currAnnType.id.Trim().Length > 0)
                            {
                                AnnotationId = currAnnType.id.Trim();
                            }else if (currAnnType.AnnotationType1 != null && currAnnType.AnnotationType1.Trim().Length > 0)
                            {
                                AnnotationId = currAnnType.AnnotationType1.Trim();
                            }
                            newAnnot.AnnotationId = AnnotationId;

                            if (currAnnType.AnnotationTitle != null && currAnnType.AnnotationTitle.Trim().Length > 0)
                            {
                                IList<Text> titleLan = new List<Text>();
                                titleLan.Add(new Text(currAnnType.AnnotationTitle, RMUtility.UND_LANGUAGE));
                                newAnnot.AnnotationTitle = massiveWriteTranslatableItem(massiveReport, titleLan, VALUE_FORMAT_STRING_ID);
                            }
                            if (currAnnType.AnnotationType1 != null && currAnnType.AnnotationType1.Trim().Length > 0)
                            {
                                var newAnnotType = massiveReport.AnnotationTypeDataTable.NewAnnotationTypeRow();
                                newAnnotType.Id = ++massiveReport.LastAnnotationTypeId;
                                newAnnotType.Type = currAnnType.AnnotationType1.Trim();
                                massiveReport.AnnotationTypeDataTable.Rows.Add(newAnnotType);
                                //store.InsertUpdateData(massiveUpdateReport.AnnotationTypeDataTable);
                                newAnnot.AnnotationTypeId = newAnnotType.Id;
                            }
                            if (currAnnType.AnnotationText != null && currAnnType.AnnotationText.Count > 0)
                            {
                                IList<Text> textLan = new List<Text>();
                                foreach (TextType n in currAnnType.AnnotationText)
                                {
                                    if (n.TypedValue != null && n.TypedValue.Trim().Length > 0)
                                    {
                                        Text t = new Text();
                                        t.lang = n.lang;
                                        t.TypedValue = n.TypedValue;
                                        textLan.Add(t);
                                    }
                                }
                                if (textLan.Count == 0 && currAnnType.AnnotationTitle != null && currAnnType.AnnotationTitle.Trim().Length > 0)
                                {
                                    Text t = new Text();
                                    t.lang = RMUtility.UND_LANGUAGE;
                                    t.TypedValue = currAnnType.AnnotationTitle.Trim();
                                    textLan.Add(t);
                                }
                                newAnnot.AnnotationTextId = massiveWriteTranslatableItem(massiveReport, textLan, VALUE_FORMAT_STRING_ID);
                            }
                            massiveReport.AnnotationDataTable.Rows.Add(newAnnot);
                            //store.InsertUpdateData(massiveUpdateReport.AnnotationDataTable);
                        }
                    }
                }
            }
            return result;
        }

        private bool ContainsUserAnnotation(List<AnnotationType> annotationList)
        {
            foreach (AnnotationType ann in annotationList)
            {
                if (isUserAnnotation(ann))
                {
                    return true;
                }
            }
            return false;
        }

        private bool isAnnotationToExport(AnnotationType currAnnType)
        {
            bool condIsMultilingual = !string.IsNullOrWhiteSpace(_dcatIsMultilingual) && currAnnType.AnnotationType1 != null && currAnnType.AnnotationType1.Equals(_dcatIsMultilingual);
            if (currAnnType.id == null || (!currAnnType.id.StartsWith("categorisation_") &&
                        //!currAnnType.id.Equals(ReportedAttributeType.ANNOTATION_KEY_REPORT_ATTRIBUTE_ID) &&
                        !currAnnType.id.Equals(ReportType.ANNOTATION_KEY_DATAFLOW_OWNER) &&
                        !currAnnType.id.Equals(ReportType.ANNOTATION_KEY_METADATASET_ID) &&
                        !currAnnType.id.Equals(ReportType.ANNOTATION_KEY_REPORT_CODELIST_ATTR_LIST) &&
                        !currAnnType.id.Equals(ReportType.ANNOTATION_KEY_REPORT_ID) &&
                        !currAnnType.id.Equals(ReportType.ANNOTATION_KEY_REPORT_PRESENTATIONAL_ATTR_LIST) &&
                        !currAnnType.id.Equals(ReportType.ANNOTATION_KEY_REPORT_STATE_ID) &&
                        !currAnnType.id.Equals(ReportType.ANNOTATION_KEY_REPORT_STATE_NAME) &&
                        !currAnnType.id.Equals(ReportType.ANNOTATION_KEY_REPORT_TARGET_TYPE_LIST) &&
                        !currAnnType.id.Equals(ReportType.ANNOTATION_KEY_REPORT_TYPE) &&
                        //!currAnnType.id.Equals(ReportType.ANNOTATION_KEY_REP_ATTRIBUTE_ID) &&
                        !condIsMultilingual &&
                        !currAnnType.id.Equals(MetadataSetType.ANNOTATION_KEY_METADATASET_TO_CLONE_ID) &&
                        !currAnnType.id.Equals(MetadataSetType.ANNOTATION_KEY_METADATASET_ID)))
            {
                return true;
            }
            return false;
        }

        private bool isUserAnnotation(AnnotationType currAnnType)
        {
            bool condIsMultilingual = !string.IsNullOrWhiteSpace(_dcatIsMultilingual) && currAnnType.AnnotationType1 != null && currAnnType.AnnotationType1.Equals(_dcatIsMultilingual);

            if (currAnnType.id == null || (!currAnnType.id.StartsWith("categorisation_") && !condIsMultilingual &&
                        !currAnnType.id.Equals(ReportedAttributeType.ANNOTATION_KEY_REPORT_ATTRIBUTE_ID) &&
                        !currAnnType.id.Equals(MetadataSetType.ANNOTATION_KEY_METADATASET_TO_CLONE_ID) &&
                        !currAnnType.id.Equals(MetadataSetType.ANNOTATION_KEY_METADATASET_FLOW_AGENCY_ID) &&
                        !currAnnType.id.Equals(MetadataSetType.ANNOTATION_KEY_METADATASET_FLOW_ID) &&
                        !currAnnType.id.Equals(MetadataSetType.ANNOTATION_KEY_METADATASET_FLOW_VERSION_ID) &&
                        !currAnnType.id.Equals(MetadataSetType.ANNOTATION_KEY_METADATASET_ID) &&
                        !currAnnType.id.Equals(MetadataSetType.ANNOTATION_KEY_METADATASET_MSD_AGENCY_ID) &&
                        !currAnnType.id.Equals(MetadataSetType.ANNOTATION_KEY_METADATASET_MSD_ID) &&
                        !currAnnType.id.Equals(MetadataSetType.ANNOTATION_KEY_METADATASET_MSD_VERSION_ID)))
            {
                return true;
            }
            return false;
        }

        public void cleanAnnotations(ReportedAttributeType rat)
        {
            if (rat != null)
            {
                if (rat != null && rat.Annotations != null && rat.Annotations.Annotation != null)
                {
                    List<AnnotationType> newAnnotations = new List<AnnotationType>();
                    foreach (AnnotationType at in rat.Annotations.Annotation)
                    {
                        if (!at.id.Equals(ReportedAttributeType.ANNOTATION_KEY_REPORT_ATTRIBUTE_ID))
                        {
                            newAnnotations.Add(at);
                        }
                    }
                    rat.Annotations.Annotation = newAnnotations;
                    cleanAnnotations(rat.AttributeSet);
                }
            }
        }

        public void cleanAnnotations(AttributeSetType ast)
        {
            if (ast != null && ast.ReportedAttribute!=null)
            {
                foreach(ReportedAttributeType rat in ast.ReportedAttribute)
                {
                    cleanAnnotations(rat);
                }
            }
        }

        public void cleanAnnotations(MetadataSetType mdst)
        {
            if (mdst != null && mdst.Annotations != null && mdst.Annotations.Annotation != null)
            {
                List<AnnotationType> newAnnotations = new List<AnnotationType>();
                foreach (AnnotationType at in mdst.Annotations.Annotation)
                {
                    if (isAnnotationToExport(at))
                    {
                        newAnnotations.Add(at);
                    }
                }
                mdst.Annotations.Annotation = newAnnotations;
                if (mdst.Report != null)
                {
                    foreach (ReportType r in mdst.Report)
                    {
                        cleanAnnotations(r);
                    }
                }
            }
        }

        public void cleanAnnotations(ReportType r)
        {
            if (r != null && r.Annotations!= null && r.Annotations.Annotation != null)
            {
                List<AnnotationType> newAnnotations = new List<AnnotationType>();
                foreach (AnnotationType at in r.Annotations.Annotation)
                {
                    if (isAnnotationToExport(at))
                    {
                        newAnnotations.Add(at);
                    }
                }
                r.Annotations.Annotation = newAnnotations;

                cleanAnnotations(r.AttributeSet);
            }
        }

        /// <summary>
        /// Save into DB a Report.
        /// </summary>
        /// <param name="store">DB Access</param>
        /// <param name="metadataSetId">MetadataSet id</param>
        /// <param name="report">Report data</param>
        /// <param name="xDomMSD">MSD data</param>
        /// <returns>Id of the Report stored</returns>
        private int writeReport(int metadataSetId, int reportId, ReportType report, XmlDocument xDomMSD)
        {
            int targetId = writeTarget(report.Target);
            if (targetId == NULL_NUMBER_FIELD_VALUE)
            {
                throw new Exception("Error to generate Target id");
            }

            ReportDataTable trgDt = new ReportDataTable();

            STLoggerFactory.Logger.Log("Adding new value in Report", LogLevelEnum.Debug);
            int reportNewId = 0;
            if (reportId > 0)
            {
                reportNewId = reportId;
            }
            else
            {
                reportNewId = getNextIdValue(store, "Id", "Report");
            }

            string reportState = report.getAnnotationValue(ReportType.ANNOTATION_KEY_REPORT_STATE_ID);

            ReportRow reportRow = trgDt.NewReportRow();
            reportRow.Id = reportNewId;
            reportRow.TargetId = targetId;
            reportRow.MetadasetId = metadataSetId;
            if (reportState == null || reportState.Trim().Length == 0)
            {
                reportRow.StateId = ReportType.REPORT_STATE_NOT_PUBLISHED_ID;
            }
            else
            {
                reportRow.StateId = Convert.ToInt32(reportState);
            }
            reportRow.ReferenceId = report.id;

            // per il catalogo DCAT lo stato deve essere PUBLISHED
            int targetType = retrieveTargetType(report.Target.id);
            if (targetType.Equals(ReportType.TARGET_METADATAFLOW_ID))
            {
                reportRow.StateId = ReportType.REPORT_STATE_PUBLISHED_ID;
            }

            if (reportState != null)
            {
                reportRow.StateId = Convert.ToInt32(reportState);
            }
            
            trgDt.Rows.Add(reportRow);
            store.InsertUpdateData(trgDt);

            STLoggerFactory.Logger.Log("New row added to Report", LogLevelEnum.Debug);

            var massiveUpdateReport = new MassiveReport
            {
                LastMetadataAttributeId = getNextIdValue(store, "Id", "MetadataAttribute") - 1,
                LastTranslatableItemsId = getNextIdValue(store, "Id", "TranslatableItems") - 1,
                LastAnnotationsGroupId = getNextIdValue(store, "Id", "AnnotationsGroup") - 1,
                LastAnnotationsId = getNextIdValue(store, "Id", "Annotation") - 1,
                LastAnnotationTypeId = getNextIdValue(store, "Id", "AnnotationType") - 1
            };
            try
            {
                foreach (ReportedAttributeType currRepAttribute in report.AttributeSet.ReportedAttribute)
                {
                    massiveWriteMetadataAttributeNode(massiveUpdateReport, reportNewId, NULL_NUMBER_FIELD_VALUE, currRepAttribute, xDomMSD);
                }

                store.InsertUpdateData(massiveUpdateReport.TranslatableItemsDataTable);
                store.InsertUpdateData(massiveUpdateReport.TranslatableItemValuesDataTable);
                store.InsertUpdateData(massiveUpdateReport.AnnotationTypeDataTable);
                store.InsertUpdateData(massiveUpdateReport.AnnotationsGroupDataTable);
                store.InsertUpdateData(massiveUpdateReport.AnnotationDataTable);
                store.InsertUpdateData(massiveUpdateReport.MetadataAttributeDataTable);
            }
            catch (Exception e)
            {
                STLoggerFactory.Logger.Log("Error while writing metadata attribute", e, LogLevelEnum.Error);
                throw e;
            }

            return reportNewId;
        }

        private int retrieveTargetType(string value)
        {
            if (value.IndexOf("CATALOG") != -1)
            {
                return ReportType.TARGET_METADATAFLOW_ID;
            }
            else if (value.IndexOf("DATAFLOW") != -1)
            {
                return ReportType.TARGET_DATAFLOW_ID;
            }
            return NULL_NUMBER_FIELD_VALUE;
        }

        private int retrieveTargetType(ReportType report)
        {
            int result = retrieveTargetType(report.Target.id);
            if (result != NULL_NUMBER_FIELD_VALUE)
            {
                return result;
            }
            else
            {
                foreach (ReferenceValueType refV in report.Target.ReferenceValue)
                {
                    foreach (XmlUri uri in refV.ObjectReference.URN)
                    {
                        result = retrieveTargetType(uri.UriValue);
                        if (result != NULL_NUMBER_FIELD_VALUE)
                        {
                            return result;
                        }
                    }
                }
            }
            return NULL_NUMBER_FIELD_VALUE;
        }

        private int writeTarget(TargetType target)
        {
            int result = NULL_NUMBER_FIELD_VALUE;
            try
            {
                STLoggerFactory.Logger.Log("Start insert Target " + target.id, LogLevelEnum.Debug);

                int targetNewId = getNextIdValue(store, "Id", "Target");

                TargetDataTable trgDt = new TargetDataTable();

                TargetRow targetRow = trgDt.NewTargetRow();
                targetRow.Id = targetNewId;
                targetRow.TargetName = target.id.Trim();
                trgDt.Rows.Add(targetRow);
                store.InsertUpdateData(trgDt);
                STLoggerFactory.Logger.Log("New row added to Target with id " + targetNewId, LogLevelEnum.Debug);

                STLoggerFactory.Logger.Log("Adding TargetIndetifier", LogLevelEnum.Debug);
                int targetType = retrieveTargetType(target.id);
                foreach (ReferenceValueType targetIdent in target.ReferenceValue)
                {
                    string targetIdValue = "";
                    foreach (XmlUri currURI in targetIdent.ObjectReference.URN)
                    {
                        if (currURI == null)
                        {
                            targetIdValue += " #";
                        }
                        else
                        {
                            targetIdValue += currURI.UriValue + "#";
                        }
                    }
                    if (targetIdValue.EndsWith("#"))
                    {
                        targetIdValue = targetIdValue.Substring(0, targetIdValue.Length - 1).Trim();
                    }
                    writeTargetIdentifier(targetNewId, targetType, targetIdent.id, targetIdValue);
                    
                }
                result = targetNewId;
                STLoggerFactory.Logger.Log("New row added to Target", LogLevelEnum.Debug);
            }
            catch (Exception e)
            {
                STLoggerFactory.Logger.Log("Error to insert Target data: " + e.StackTrace, LogLevelEnum.Error);
                throw e;
            }
            return result;
        }

        private void writeTargetIdentifier(int targetNewId, int targetType, string targetIdName, string targetIdValue)
        {
            try
            {
                STLoggerFactory.Logger.Log("Start insert new TargetIdentifier", LogLevelEnum.Debug);
                int targetIdKey = getNextIdValue(store, "id", "TargetIdentifier");

                STLoggerFactory.Logger.Log("Adding new entry in TargetIdentifier", LogLevelEnum.Debug);

                TargetIdentifierDataTable trgDt2 = new TargetIdentifierDataTable();

                TargetIdentifierRow targetIdRow = trgDt2.NewTargetIdentifierRow();
                targetIdRow.Id = targetIdKey;
                targetIdRow.TargetId = targetNewId;
                if (targetType>0)
                {
                    targetIdRow.TargetIdentifierTypeId = targetType;
                }
                if (targetIdName!=null && targetIdName.Trim().Length>0)
                {
                    targetIdRow.Name = targetIdName.Trim();
                }
                targetIdRow.Value = targetIdValue;

                trgDt2.Rows.Add(targetIdRow);
                store.InsertUpdateData(trgDt2);
            }
            catch (Exception e)
            {
                STLoggerFactory.Logger.Log("Error to retrieve TranslatableItems data: " + e.StackTrace, LogLevelEnum.Error);
                throw e;
            }
        }

        public bool CheckInizializedRMDB()
        {
            return ((int)store.ExecuteScalar("SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = N'MetadataSet'")) > 0;
        }

        public bool InizializeRMDB()
        {
            try
            {
                if (CheckInizializedRMDB())
                {
                    return false;
                }

                store.BeginTransaction();

                string sql = File.ReadAllText(@"config\base\RMDB.sql");
                foreach (var batch in sql.Split(new string[] { "\nGO", "\ngo" }, StringSplitOptions.RemoveEmptyEntries))
                {
                    store.ExecuteCommand(batch);
                }

                sql = File.ReadAllText(@"config\base\RMDB2_PopulateLookups.sql");
                foreach (var batch in sql.Split(new string[] { "\nGO", "\ngo" }, StringSplitOptions.RemoveEmptyEntries))
                {
                    store.ExecuteCommand(batch);
                }
                store.CommitTransaction();
            }
            catch (Exception ex)
            {
                store.RollbackTransaction();
                STLoggerFactory.Logger.Log("Error to inizialize RMDB :" + ex.StackTrace, LogLevelEnum.Error);
                throw ex;
            }
            return true;
        }

        #region CKAN

        public string searchReportCKAN(string theme, string sort, int start, int rows, string language, string ckanTemplate, string wsUrl, string metadataSetId, string metadataflow=null)
        {
            List<int> reports = getDataSetReports(theme, sort, start, rows, metadataSetId, metadataflow);
            if (reports == null || reports.Count == 0)
            {
                //throw new Exception("No report found");
                STLoggerFactory.Logger.Log("No report found for sort=" + sort + ", start=" + start + ", rows=" + rows, LogLevelEnum.Info);
                //return "No report found";
            }

            Dictionary<string, string> staticValues = new Dictionary<string, string>();
            staticValues.Add("LANGUAGE", language);
            staticValues.Add("WS_URL", wsUrl);

            StringBuilder sb = new StringBuilder();
            StringWriter sw = new StringWriter(sb);
            JsonWriter writer = new JsonTextWriter(sw);
            //writer.Formatting = Formatting.Indented;

            writer.WriteStartObject();
            writer.WritePropertyName("help");
            writer.WriteValue(wsUrl);
            writer.WritePropertyName("success");
            writer.WriteValue("true");
            writer.WritePropertyName("result");
            writer.WriteStartObject();
            writer.WritePropertyName("count");
            writer.WriteValue(reports == null ? "0" : "" + reports.Count);
            writer.WritePropertyName("sort");
            writer.WriteValue(sort == null ? "" : sort);
            writer.WritePropertyName("results");
            writer.WriteStartArray();

            foreach (int currReportId in reports)
            {
                try
                {
                    string metadatasetIdKey = "METADATASET_ID";
                    string reportIdKey = "REPORT_ID";
                    if (staticValues.ContainsKey(reportIdKey))
                    {
                        staticValues.Remove(reportIdKey);
                    }
                    if (staticValues.ContainsKey(metadatasetIdKey))
                    {
                        staticValues.Remove(metadatasetIdKey);
                    }

                    int metadatasetId = this.GetMetadatasetIdFromReportId(currReportId);
                    MetadataSetType mds = this.GetMetadataset(""+ metadatasetId, false, false, true);
                    if (mds != null)
                    {
                        if (mds.setID!=null)
                        {
                            staticValues.Add(metadatasetIdKey, mds.setID);
                        }
                        if (mds.Report != null)
                        {
                            foreach(ReportType r in mds.Report)
                            {
                                string repId = r.getAnnotationValue(ReportType.ANNOTATION_KEY_REPORT_ID);
                                if (repId != null && repId.Equals(""+ currReportId))
                                {
                                    staticValues.Add(reportIdKey, r.id);
                                }
                            }
                        }
                    }

                    JsonTextReader reader = new JsonTextReader(new StringReader(ckanTemplate));
                    Dictionary<string, List<RMAttributeData>> reportValues = searchMetadataAttrValues(currReportId, language);
                    writeCKANTemplate(reader, writer, staticValues, reportValues, sb);
                }
                catch (Exception e)
                {
                    STLoggerFactory.Logger.Log("Error to add data for report " + currReportId + ": " + e.StackTrace, LogLevelEnum.Debug);
                }
            }

            writer.WriteEndArray();
            writer.WriteEndObject();
            writer.WriteEndObject();

            return sb.ToString();
        }

        private List<int> getDataSetReports(string theme, string sort, int start, int rows, string metadataSetId, string metadataflow)
        {
            List<int> result = new List<int>();

            const string datasetIdAttributeKey = "DCAT_AP_IT_DATASET_IDENTIFIER";
            const string themeAttributeKey = "DCAT_AP_IT_DATASET_THEME";

            try
            {
                string sortField = "Id";
                string sortDirection = "asc";

                if (sort != null && sort.Trim().Length > 0)
                {
                    string[] splittedOrder = sort.Split(' ');

                    sortField = splittedOrder[0];

                    if (splittedOrder.Length == 2)
                    {
                        sortDirection = splittedOrder[1];
                    }
                }

                string fromTheme = "";
                string whereTheme = "";
                List<STKeyValuePair> parameters = new List<STKeyValuePair>();

                if (theme != null && theme.Trim().Length > 0)
                {
                    fromTheme = "INNER JOIN MetadataAttribute ma2 ON r.Id = ma2.ReportId " +
                        "LEFT JOIN TranslatableItems ti ON ma2.ValueId = ti.Id " +
                        "LEFT JOIN TranslatableItemValues tiv ON ti.Id = tiv.ValueId ";
                    whereTheme = " AND ma2.AttributeName=@themeAttributeKey AND tiv.Value LIKE '%'+@theme+'%'";
                    parameters.Add(new STKeyValuePair("datasetIdAttributeKey", datasetIdAttributeKey));
                    parameters.Add(new STKeyValuePair("themeAttributeKey", themeAttributeKey));
                    parameters.Add(new STKeyValuePair("theme", theme.Trim()));
                }
                else
                {
                    parameters.Add(new STKeyValuePair("datasetIdAttributeKey", datasetIdAttributeKey));
                }

                string whereMetadataflow = "";
                if (metadataflow != null)
                {
                    string id = null;
                    string agency = null;
                    string version = null;
                    RMUtil.RMUtility.ParseURN(metadataflow, out id, out agency, out version);
                    whereMetadataflow = " AND m.MetadataflowId=@MetadataflowId AND m.MetadataflowAgency=@MetadataflowAgency AND m.MetadataflowVersion=@MetadataflowVersion";
                    parameters.Add(new STKeyValuePair("MetadataflowId", id));
                    parameters.Add(new STKeyValuePair("MetadataflowAgency", agency));
                    parameters.Add(new STKeyValuePair("MetadataflowVersion", version));
                }

                string whereMetadataSetId = "";
                if (metadataSetId != null)
                {
                    whereMetadataSetId = " AND m.ReferenceId=@MetadataSetId";
                    parameters.Add(new STKeyValuePair("MetadataSetId", metadataSetId));
                }

                STLoggerFactory.Logger.Log("Search all dataset report", LogLevelEnum.Debug);
                string query = $@"SELECT DISTINCT r.Id " +
                    "FROM MetadataSet m INNER JOIN Report r ON m.Id=r.MetadasetId INNER JOIN MetadataAttribute ma ON r.Id = ma.ReportId " + fromTheme +
                    "WHERE r.StateId=" + ReportType.REPORT_STATE_PUBLISHED_ID + " AND ma.AttributeName=@datasetIdAttributeKey" + whereTheme + whereMetadataflow + whereMetadataSetId/*+ " ORDER BY " + sortParam*/;

                if (rows > 0)
                {
                    query = store.GetPagedQuery(query, sortField, start, rows, "desc".Equals(sortDirection));
                }

                DataTable searchValueDT = store.GetTable(query, parameters.ToArray());
                IEnumerator reportIt = searchValueDT.Rows.GetEnumerator();
                while (reportIt.MoveNext())
                {
                    object reportIdObj = ((DataRow)reportIt.Current)[0];
                    if (reportIdObj != null && reportIdObj != DBNull.Value)
                    {
                        result.Add((int)reportIdObj);
                    }
                }

            }
            catch (Exception e)
            {
                STLoggerFactory.Logger.Log("Error to retrieve report id list: " + e.StackTrace, LogLevelEnum.Error);
                throw e;
            }

            return result;
        }


        /// <summary>
        /// Build a ckan report for a specific dataset.
        /// </summary>
        /// <param name="datasetId">Dataset id</param>
        /// <param name="language">Language</param>
        /// <param name="ckanTemplate">Json template</param>
        /// <param name="wsUrl">Called uri</param>
        /// <returns>Ckan report for a specific dataset.</returns>
        public string getReportCKAN(string datasetId, string language, string ckanTemplate, string wsUrl, string metadataSetId=null, string metadataflow = null)
        {
            Dictionary<string, string> staticValues = new Dictionary<string, string>();
            staticValues.Add("LANGUAGE", language);
            staticValues.Add("WS_URL", wsUrl);

            StringBuilder sb = new StringBuilder();
            StringWriter sw = new StringWriter(sb);
            JsonWriter writer = new JsonTextWriter(sw);
            //writer.Formatting = Formatting.Indented;

            int reportId = getReportIdByDatasetId(datasetId, metadataSetId, metadataflow);
            if (reportId == NULL_NUMBER_FIELD_VALUE)
            {
                STLoggerFactory.Logger.Log("Dataset with Id=" + datasetId + " data not found", LogLevelEnum.Info);
                //throw new Exception("Dataset data not found");
                //return "Dataset data not found";
                writeEmptyReport(writer, wsUrl);
            }
            else
            {
                JsonTextReader reader = new JsonTextReader(new StringReader(ckanTemplate));
                Dictionary<string, List<RMAttributeData>> reportValues = searchMetadataAttrValues(reportId, language);
                writeCKANTemplate(reader, writer, staticValues, reportValues, sb);
            }

            return sb.ToString();
        }

        public string GetGroupListCKAN(string language, string wsUrl, string metadataSetId = null, string metadataflow = null)
        {
            Dictionary<string, string> staticValues = new Dictionary<string, string>();
            staticValues.Add("LANGUAGE", language);
            staticValues.Add("WS_URL", wsUrl);

            StringBuilder sb = new StringBuilder();
            StringWriter sw = new StringWriter(sb);
            JsonWriter writer = new JsonTextWriter(sw);

            writer.WriteStartObject();
            writer.WritePropertyName("help");
            writer.WriteValue(wsUrl);
            writer.WritePropertyName("success");

            List<string> groupList = GetGroupList(language, metadataSetId, metadataflow);
            if (groupList == null || groupList.Count == 0)
            {
                STLoggerFactory.Logger.Log("No group found", LogLevelEnum.Info);
                writer.WriteValue("false");
                writer.WritePropertyName("result");
                writer.WriteStartArray();
            }
            else
            {
                writer.WriteValue("true");
                writer.WritePropertyName("result");
                writer.WriteStartArray();
                foreach (string group in groupList)
                {
                    writer.WriteValue(group);
                }
            }
            writer.WriteEndArray();
            writer.WriteEndObject();

            return sb.ToString();
        }

        /// <summary>
        /// Write an empty report.
        /// </summary>
        /// <param name="writer">JsonWriter</param>
        /// <param name="uri">Called uri</param>
        private void writeEmptyReport(JsonWriter writer, string uri)
        {
            writer.WriteStartObject();
            writer.WritePropertyName("help");
            writer.WriteValue(uri);
            writer.WritePropertyName("success");
            writer.WriteValue("false");
            writer.WritePropertyName("result");
            writer.WriteStartObject();
            writer.WriteEndObject();
            writer.WriteEndObject();
        }

        /// <summary>
        /// Write a ckan report using a json template.
        /// </summary>
        /// <param name="reader">JsonTextReader for json template</param>
        /// <param name="writer">JsonWriter</param>
        /// <param name="staticValues">Generic data</param>
        /// <param name="reportValues">Report data</param>
        private void writeCKANTemplate(JsonTextReader reader, JsonWriter writer, Dictionary<string, string> staticValues, Dictionary<string, List<RMAttributeData>> reportValues, StringBuilder sb)
        {
            Dictionary<string, string> placeholdersForArray = null;
            string currProperty = null;
            bool replaced = false;
            bool isArrayPos = false;

            try
            {
                while (reader.Read())
                {
                    switch (reader.TokenType)
                    {
                        case JsonToken.StartObject:
                            currProperty = null;
                            replaced = false;
                            writer.WriteStartObject();
                            break;
                        case JsonToken.EndObject:
                            currProperty = null;
                            writer.WriteEndObject();
                            if (placeholdersForArray != null)
                            {
                                if (!replaced)
                                {
                                    STLoggerFactory.Logger.Log("No replacement, return", LogLevelEnum.Debug);
                                }
                                else if (isArrayPos)
                                {
                                    manageArrayObject(placeholdersForArray, writer, staticValues, reportValues);
                                }
                            }
                            break;
                        case JsonToken.StartArray:
                            currProperty = null;
                            isArrayPos = false;
                            placeholdersForArray = new Dictionary<string, string>();
                            writer.WriteStartArray();
                            break;
                        case JsonToken.EndArray:
                            currProperty = null;
                            placeholdersForArray = null;
                            writer.WriteEndArray();
                            break;
                        case JsonToken.PropertyName:
                            string propertyName = reader.Value.ToString();
                            currProperty = propertyName;
                            writer.WritePropertyName(propertyName);
                            break;
                        case JsonToken.String:
                            string propValue = reader.Value.ToString();
                            string valueToWrite = replaceStringPlaceholderCKAN(propValue, 0, staticValues, reportValues);
                            if (!propValue.Equals(valueToWrite))
                            {
                                replaced = true;
                            }
                            if (placeholdersForArray != null)
                            {
                                if (propValue.IndexOf(PLACEHOLDER_INDEX_SYMBOL) != -1)
                                {
                                    isArrayPos = true;
                                }
                                if (!placeholdersForArray.ContainsKey(currProperty))
                                {
                                    placeholdersForArray.Add(currProperty, propValue);
                                }
                                //}
                                //else
                                //{
                                //    placeholdersForArray = null;
                                //}
                            }

                            if (!valueToWrite.StartsWith(PLACEHOLDER_DELIMITER))
                            {
                                writer.WriteValue(valueToWrite);
                            }
                            else
                            {
                                writer.WriteValue("");
                            }
                            break;
                    }
                }
            }
            catch (Exception e)
            {
                STLoggerFactory.Logger.Log("Error at file line " + reader.LineNumber + ": " + e.StackTrace, LogLevelEnum.Debug);
                throw e;
            }
        }

        private List<string> GetGroupList(string language, string metadataSetId = null, string metadataflow = null)
        {
            const string groupAttributeKey = "DCAT_AP_IT_DATASET_THEME";
            List<string> result = new List<string>();

            try
            {
                STLoggerFactory.Logger.Log("Get theme list", LogLevelEnum.Debug);

                List<STKeyValuePair> parameters = new List<STKeyValuePair>();
                parameters.Add(new STKeyValuePair("reportState", ReportType.REPORT_STATE_PUBLISHED_ID));
                parameters.Add(new STKeyValuePair("groupAttributeKey", groupAttributeKey));
                parameters.Add(new STKeyValuePair("language", language));

                string whereMetadataflow = "";
                if (metadataflow != null)
                {
                    string id = null;
                    string agency = null;
                    string version = null;
                    RMUtil.RMUtility.ParseURN(metadataflow, out id, out agency, out version);
                    whereMetadataflow = " AND m.MetadataflowId=@MetadataflowId AND m.MetadataflowAgency=@MetadataflowAgency AND m.MetadataflowVersion=@MetadataflowVersion";
                    parameters.Add(new STKeyValuePair("MetadataflowId", id));
                    parameters.Add(new STKeyValuePair("MetadataflowAgency", agency));
                    parameters.Add(new STKeyValuePair("MetadataflowVersion", version));
                }

                string whereMetadataSetId = "";
                if (metadataSetId != null)
                {
                    whereMetadataSetId = " AND m.ReferenceId=@MetadataSetId";
                    parameters.Add(new STKeyValuePair("MetadataSetId", metadataSetId));
                }

                DataTable searchValueDT = store.GetTable($@"SELECT DISTINCT tiv.Value
                    FROM MetadataSet m INNER JOIN Report r ON m.Id=r.MetadasetId INNER JOIN MetadataAttribute ma ON r.Id=ma.ReportId 
                    LEFT JOIN TranslatableItems ti ON ma.ValueId=ti.Id LEFT JOIN TranslatableItemValues tiv ON ti.Id=tiv.ValueId
                    WHERE r.StateId=@reportState AND ma.AttributeName=@groupAttributeKey AND tiv.Language=@language " + whereMetadataflow + whereMetadataSetId,
                    parameters.ToArray());

                IEnumerator groupIt = searchValueDT.Rows.GetEnumerator();
                while (groupIt.MoveNext())
                {
                    object groupValueObj = ((DataRow)groupIt.Current)["Value"];
                    if (groupValueObj != null && groupValueObj != DBNull.Value)
                    {
                        result.Add((string)groupValueObj);
                    }
                }

            }
            catch (Exception e)
            {
                STLoggerFactory.Logger.Log("Error to retrieve group list: " + e.StackTrace, LogLevelEnum.Error);
                throw e;
            }
            return result;
        }

        private int getReportIdByDatasetId(string datasetId, string metadataSetId, string metadataflow = null)
        {

            const string datasetIdAttributeKey = "DCAT_AP_IT_DATASET_IDENTIFIER";
            const string datasetAgentIdAttributeKey = "DCAT_AP_IT_DATASET_CREATOR_AGENT_IDENTIFIER";
            const string datasetVersionAttributeKey = "DCAT_AP_IT_DATASET_VERSIONINFO";

            int result = NULL_NUMBER_FIELD_VALUE;

            try
            {
                STLoggerFactory.Logger.Log("Search Report id by dataset id " + datasetId, LogLevelEnum.Debug);

                DataTable searchValueDT = null;
                if (datasetId.IndexOf(PLACEHOLDER_CONCAT_SYMBOL) != -1)
                {
                    string[] attributes = datasetId.Split(PLACEHOLDER_CONCAT_SYMBOL);

                    List<STKeyValuePair> parameters = new List<STKeyValuePair>();
                    parameters.Add(new STKeyValuePair("datasetId", attributes[0]));
                    parameters.Add(new STKeyValuePair("datasetIdAttributeKey", datasetIdAttributeKey));
                    parameters.Add(new STKeyValuePair("datasetAgentId", attributes[1]));
                    parameters.Add(new STKeyValuePair("datasetAgentIdAttributeKey", datasetAgentIdAttributeKey));
                    parameters.Add(new STKeyValuePair("datasetVersion", attributes[2]));
                    parameters.Add(new STKeyValuePair("datasetVersionAttributeKey", datasetVersionAttributeKey));

                    string whereMetadataflow = "";
                    if (metadataflow != null)
                    {
                        string id = null;
                        string agency = null;
                        string version = null;
                        RMUtil.RMUtility.ParseURN(metadataflow, out id, out agency, out version);
                        whereMetadataflow = " AND m.MetadataflowId=@MetadataflowId AND m.MetadataflowAgency=@MetadataflowAgency AND m.MetadataflowVersion=@MetadataflowVersion";
                        parameters.Add(new STKeyValuePair("MetadataflowId", id));
                        parameters.Add(new STKeyValuePair("MetadataflowAgency", agency));
                        parameters.Add(new STKeyValuePair("MetadataflowVersion", version));
                    }

                    string whereMetadataSetId = "";
                    if (metadataSetId != null)
                    {
                        whereMetadataSetId = " AND m.ReferenceId=@MetadataSetId";
                        parameters.Add(new STKeyValuePair("MetadataSetId", metadataSetId));
                    }

                    searchValueDT = store.GetTable($@"SELECT DISTINCT r.Id
                    FROM MetadataSet m INNER JOIN Report r ON m.Id=r.MetadasetId INNER JOIN MetadataAttribute ma ON r.Id=ma.ReportId INNER JOIN MetadataAttribute ma2 ON r.Id=ma2.ReportId 
                        INNER JOIN MetadataAttribute ma3 ON r.Id=ma3.ReportId 
                        LEFT JOIN TranslatableItems ti ON ma.ValueId=ti.Id LEFT JOIN TranslatableItemValues tiv ON ti.Id=tiv.ValueId 
                        LEFT JOIN TranslatableItems ti2 ON ma2.ValueId=ti2.Id LEFT JOIN TranslatableItemValues tiv2 ON ti2.Id=tiv2.ValueId
                        LEFT JOIN TranslatableItems ti3 ON ma3.ValueId=ti3.Id LEFT JOIN TranslatableItemValues tiv3 ON ti3.Id=tiv3.ValueId
                    WHERE r.StateId=" + ReportType.REPORT_STATE_PUBLISHED_ID + " AND tiv.Value=@datasetId AND ma.AttributeName=@datasetIdAttributeKey AND " +
                        "tiv2.Value=@datasetAgentId AND ma2.AttributeName=@datasetAgentIdAttributeKey AND " +
                        "tiv3.Value=@datasetVersion AND ma3.AttributeName=@datasetVersionAttributeKey " + whereMetadataflow + whereMetadataSetId,
                    parameters.ToArray());
                }
                else
                {
                    string queryReportId = $@"SELECT DISTINCT r.Id FROM Report r WHERE r.StateId = " + ReportType.REPORT_STATE_PUBLISHED_ID + " AND r.ReferenceId=@datasetId";
                    string queryDatasetId = $@"SELECT DISTINCT r.Id
                    FROM Report r INNER JOIN MetadataAttribute ma ON r.Id=ma.ReportId 
                    LEFT JOIN TranslatableItems ti ON ma.ValueId=ti.Id LEFT JOIN TranslatableItemValues tiv ON ti.Id=tiv.ValueId 
                    WHERE r.StateId=" + ReportType.REPORT_STATE_PUBLISHED_ID + " AND tiv.Value=@datasetId AND ma.AttributeName=@datasetIdAttributeKey;";

                    searchValueDT = store.GetTable(queryReportId,
                    new STKeyValuePair[] { new STKeyValuePair("datasetId", datasetId),
                        new STKeyValuePair("datasetIdAttributeKey", datasetIdAttributeKey) });
                }

                IEnumerator reportIt = searchValueDT.Rows.GetEnumerator();
                if (reportIt.MoveNext())
                {
                    object reportIdObj = ((DataRow)reportIt.Current)["Id"];
                    if (reportIdObj != null && reportIdObj != DBNull.Value)
                    {
                        result = (int)reportIdObj;
                    }
                }

            }
            catch (Exception e)
            {
                STLoggerFactory.Logger.Log("Error to retrieve report id: " + e.StackTrace, LogLevelEnum.Error);
                throw e;
            }
            return result;
        }

        private void manageArrayObject(Dictionary<string, string> placeholdersForArray, JsonWriter writer, Dictionary<string, string> staticValues,
            Dictionary<string, List<RMAttributeData>> reportValues)
        {
            int currentPosArray = 1;
            //bool objCreated = false;
            while (true)
            {
                // check other values to write
                bool notOtherValues = true;
                foreach(List<RMAttributeData> listVal in reportValues.Values)
                {
                    if (listVal.Count > currentPosArray)
                    {
                        notOtherValues = false;
                        break;
                    }
                }
                if (notOtherValues)
                {
                    STLoggerFactory.Logger.Log("There are no more values ​​to write", LogLevelEnum.Debug);
                    return;
                }

                writer.WriteStartObject();
                bool objCreated = true;
                Boolean modified = false;
                foreach (string key in placeholdersForArray.Keys)
                {
                    try
                    {
                        string placeholder = placeholdersForArray[key];
                        string valueToWrite = replaceStringPlaceholderCKAN(placeholder, currentPosArray, staticValues, reportValues);
                        if (valueToWrite.StartsWith(PLACEHOLDER_DELIMITER))
                        {
                            valueToWrite = "";
                        }
                        
                        //if (!objCreated)
                        //{
                        //    writer.WriteStartObject();
                        //    objCreated = true;
                        //}
                        writer.WritePropertyName(key);
                        writer.WriteValue(valueToWrite);

                        if (!placeholder.Equals(PLACEHOLDER_DELIMITER + PLACEHOLDER_INDEX_SYMBOL + PLACEHOLDER_DELIMITER) && 
                            placeholder.IndexOf(PLACEHOLDER_INDEX_SYMBOL)!=-1 && !placeholder.Equals(valueToWrite))
                        {
                            modified = true;
                        }
                    }
                    catch (RMRepAttributeIndexOutOfBound e)
                    {
                        STLoggerFactory.Logger.Log("Replacement placeholder in array completed: " + e.StackTrace, LogLevelEnum.Debug);
                        if (objCreated)
                         {
                            writer.WriteEndObject();
                            objCreated = false;
                        }
                        return;
                    }
                }
                writer.WriteEndObject();
                objCreated = false;
                //if (objCreated)
                //{
                //    writer.WriteEndObject();
                //    objCreated = false;
                //}
                if (!modified)
                {
                    STLoggerFactory.Logger.Log("No other change in array", LogLevelEnum.Info);
                    return;
                }
                currentPosArray++;
            }
        }

        private string replaceStringPlaceholderCKAN(string propValue, int currentPosArray, Dictionary<string, string> staticValues,
            Dictionary<string, List<RMAttributeData>> reportValues)
        {
            if (propValue == null || propValue.Trim().Equals(""))
            {
                return "";
            }
            if (!propValue.StartsWith(PLACEHOLDER_DELIMITER) && !propValue.EndsWith(PLACEHOLDER_DELIMITER))
            {
                return propValue;
            }
            if (propValue.Equals(PLACEHOLDER_DELIMITER + PLACEHOLDER_INDEX_SYMBOL + PLACEHOLDER_DELIMITER))
            {
                return "" + currentPosArray;
            }

            bool usePosArray = false;
            string attributeKey = propValue.Replace(PLACEHOLDER_DELIMITER, "");
            if (attributeKey.EndsWith(PLACEHOLDER_INDEX_SYMBOL))
            {
                usePosArray = true;
                attributeKey = attributeKey.Replace(PLACEHOLDER_INDEX_SYMBOL, "");
            }
            if (attributeKey.Equals("NUM_TAGS"))
            {
                attributeKey = "DCAT_AP_IT_DATASET_KEYWORD";
            }
            else if (attributeKey.Equals("NUM_RESOURCES"))
            {
                attributeKey = "DCAT_AP_IT_DATASET_DISTRIBUTION_FORMAT";
            }

            string valueToReplace = propValue;
            if (attributeKey.IndexOf(PLACEHOLDER_CONCAT_SYMBOL) != -1)
            {
                valueToReplace = replaceConcatValues(attributeKey, reportValues, staticValues);
            }
            else
            {
                List<RMAttributeData> attributeValues = null;
                string singleValue = null;

                if (reportValues.TryGetValue(attributeKey, out attributeValues))
                {
                    if (propValue.Equals(PLACEHOLDER_DELIMITER + "NUM_TAGS" + PLACEHOLDER_DELIMITER) ||
                        propValue.Equals(PLACEHOLDER_DELIMITER + "NUM_RESOURCES" + PLACEHOLDER_DELIMITER))
                    {
                        valueToReplace = "" + attributeValues.Count;
                    }
                    else
                    {
                        if (usePosArray)
                        {
                            if (attributeValues.Count <= currentPosArray)
                            {
                                throw new RMRepAttributeIndexOutOfBound();
                            }
                            valueToReplace = attributeValues[currentPosArray].Value;
                        }
                        else
                        {
                            valueToReplace = attributeValues[0].Value;
                        }
                    }
                }
                else if (staticValues.TryGetValue(attributeKey, out singleValue))
                {
                    valueToReplace = singleValue;
                }
            }
            return valueToReplace;
        }

        private string replaceConcatValues(string attributeKey, Dictionary<string, List<RMAttributeData>> reportValues, Dictionary<string, string> staticValues)
        {
            string result = "";
            string[] attributes = attributeKey.Split(PLACEHOLDER_CONCAT_SYMBOL);

            List<RMAttributeData> attributeValues = null;
            string singleValue = null;
            foreach (string attribute in attributes)
            {
                if (reportValues.TryGetValue(attribute, out attributeValues))
                {
                    result += attributeValues[0].Value;
                }
                else if (staticValues.TryGetValue(attribute, out singleValue))
                {
                    result += singleValue;
                }
                result += PLACEHOLDER_CONCAT_SYMBOL;
            }
            return result.Substring(0, result.Length - PLACEHOLDER_CONCAT_SYMBOL.Length);
        }

        #endregion

        private Dictionary<string, List<RMAttributeData>> searchMetadataAttrValues(int reportId, string language)
        {
            Dictionary<string, List<RMAttributeData>> result = new Dictionary<string, List<RMAttributeData>>();
            try
            {
                STLoggerFactory.Logger.Log("Search ReportedAttribute values for Report " + reportId, LogLevelEnum.Debug);

                DataTable searchValueDT = store.GetTable($@"SELECT ma.AttributeName, tiv.Value, tif.Type, ma.Id, ma.ParentAttributeId
                    FROM Report r INNER JOIN MetadataAttribute ma ON r.Id=ma.ReportId 
                    LEFT JOIN TranslatableItems ti ON ma.ValueId=ti.Id INNER JOIN TranslatableItemValues tiv ON ti.Id=tiv.ValueId 
                    INNER JOIN TranslatableItemFormat tif ON ti.ValueTypeId=tif.Id
                    WHERE (tiv.Language=@language OR tiv.Language=@language_und) AND r.Id=@reportId ORDER BY ma.ParentAttributeId;",
                    new STKeyValuePair[] { new STKeyValuePair("language", language), new STKeyValuePair("language_und", RMUtility.UND_LANGUAGE),
                        new STKeyValuePair("reportId", reportId) });
                IEnumerator reportIt = searchValueDT.Rows.GetEnumerator();
                while (reportIt.MoveNext())
                {
                    RMAttributeData attr = new RMAttributeData();
                    attr.Name = (string)((DataRow)reportIt.Current)["AttributeName"];
                    attr.Value = (string)((DataRow)reportIt.Current)["Value"];
                    attr.Type = (string)((DataRow)reportIt.Current)["Type"];
                    attr.Id = (int)((DataRow)reportIt.Current)["Id"];

                    object parentAttIdObj = ((DataRow)reportIt.Current)["ParentAttributeId"];
                    if (parentAttIdObj != null && parentAttIdObj != DBNull.Value)
                    {
                        attr.ParentId = (int)parentAttIdObj;
                    }

                    List<RMAttributeData> values = null;
                    if (result.ContainsKey(attr.Name))
                    {
                        values = result[attr.Name];
                    }
                    else
                    {
                        values = new List<RMAttributeData>();
                        result.Add(attr.Name, values);
                    }
                    values.Add(attr);
                }
            }
            catch (Exception e)
            {
                STLoggerFactory.Logger.Log("Error to insert in Report table: " + e.StackTrace, LogLevelEnum.Error);
                throw e;
            }
            return result;
        }

        [Serializable]
        private class RMRepAttributeIndexOutOfBound : Exception
        {
            public RMRepAttributeIndexOutOfBound()
            {
            }

            public RMRepAttributeIndexOutOfBound(string message) : base(message)
            {
            }

            public RMRepAttributeIndexOutOfBound(string message, Exception innerException) : base(message, innerException)
            {
            }

            protected RMRepAttributeIndexOutOfBound(SerializationInfo info, StreamingContext context) : base(info, context)
            {
            }
        }
    }
}
