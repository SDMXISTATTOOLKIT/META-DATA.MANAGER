using System;
using System.Collections.Generic;
using System.Text;
using RMDataProvider.Model;
using System.Data;
using static RMDataProvider.RMDB;
using Infrastructure.STLogging.Factory;
using Infrastructure.STLogging.Interface;
using DataProvider.entity;

namespace RMManager.RMDataProvider.Util
{
    public class Helper
    {

        /// <summary>
        /// Copy into MetadataSet row input data.
        /// </summary>
        /// <param name="workRow">Row of MetadataSet to update</param>
        /// <param name="mdt">MetadataSet input data</param>
        /// <returns>MetadataSet row with input data</returns>
        public static MetadataSetRow fillWithInputData(MetadataSetRow workRow, MetadataSetType mdt)
        {
            workRow.ReferenceId = mdt.setID;

            if (mdt.publicationPeriod != null)
            {
                workRow.PublicationPeriod = mdt.publicationPeriod.ToString();
            }
            else
            {
                workRow.SetPublicationPeriodNull();
            }

            if (mdt.publicationYear.HasValue)
            {
                workRow.PublicationYear = mdt.publicationYear.Value;
            }
            else
            {
                workRow.SetPublicationYearNull();
            }

            if (mdt.reportingBeginDate != null)
            {
                workRow.ReportingBegin = Convert.ToDateTime(mdt.reportingBeginDate);
            }
            else
            {
                workRow.SetReportingBeginNull();
            }

            if (mdt.reportingEndDate != null)
            {
                workRow.ReportingEnd = Convert.ToDateTime(mdt.reportingEndDate);
            }
            else
            {
                workRow.SetReportingEndNull();
            }


            if (mdt.validFromDate.HasValue)
            {
                workRow.ValidFrom = mdt.validFromDate.Value;
            }
            else
            {
                workRow.SetValidFromNull();
            }

            if (mdt.validToDate.HasValue)
            {
                workRow.ValidTo = mdt.validToDate.Value;
            }
            else
            {
                workRow.SetValidToNull();
            }

            workRow.IsFinal = false;
            return workRow;
        }

        /// <summary>
        /// Copy into MetadataSet row annotation data from input data.
        /// </summary>
        /// <param name="workRow">Row of MetadataSet to update</param>
        /// <param name="mdt">MetadataSet input data</param>
        /// <returns>MetadataSet row with annotation input data</returns>
        public static MetadataSetRow fillWithAnnotationData(MetadataSetRow workRow, MetadataSetType mdt)
        {
            string flowId = null;
            string flowAgency = null;
            string flowVersion = null;
            string msdId = null;
            string msdAgency = null;
            string msdVersion = null;
            try
            {
                foreach (AnnotationType currAnn in mdt.Annotations.Annotation)
                {
                    if (currAnn.id == MetadataSetType.ANNOTATION_KEY_METADATASET_FLOW_AGENCY_ID)
                    {
                        flowAgency = currAnn.AnnotationText[0].TypedValue;
                    }
                    if (currAnn.id == MetadataSetType.ANNOTATION_KEY_METADATASET_FLOW_ID)
                    {
                        flowId = currAnn.AnnotationText[0].TypedValue;
                    }
                    if (currAnn.id == MetadataSetType.ANNOTATION_KEY_METADATASET_FLOW_VERSION_ID)
                    {
                        flowVersion = currAnn.AnnotationText[0].TypedValue;
                    }
                    if (currAnn.id == MetadataSetType.ANNOTATION_KEY_METADATASET_MSD_ID)
                    {
                        msdId = currAnn.AnnotationText[0].TypedValue;
                    }
                    if (currAnn.id == MetadataSetType.ANNOTATION_KEY_METADATASET_MSD_AGENCY_ID)
                    {
                        msdAgency = currAnn.AnnotationText[0].TypedValue;
                    }
                    if (currAnn.id == MetadataSetType.ANNOTATION_KEY_METADATASET_MSD_VERSION_ID)
                    {
                        msdVersion = currAnn.AnnotationText[0].TypedValue;
                    }
                }
            }
            catch (Exception e)
            {
                STLoggerFactory.Logger.Log("Error to retrieve MetadataSet data from Annotations - " + e.Message + ": " + e.StackTrace, LogLevelEnum.Error);
                throw new Exception("MetadataSet not found");
            }

            if (flowAgency != null)
            {
                workRow.MetadataflowAgency = flowAgency;
            }
            if (flowId != null)
            {
                workRow.MetadataflowId = flowId;
            }
            if (flowVersion != null)
            {
                workRow.MetadataflowVersion = flowVersion;
            }
            if (msdAgency != null)
            {
                workRow.MSDAgency = msdAgency;
            }
            if (msdId != null)
            {
                workRow.MSDId = msdId;
            }
            if (msdVersion != null)
            {
                workRow.MSDVersion = msdVersion;
            }
            return workRow;
        }

        public static MetadataSetType fillWithDbData(MetadataSetType metadataSet, DataRow dbRow, bool onlyLang)
        {
            if (!onlyLang) {
                object idObj = dbRow["ReferenceId"];
                if (idObj != null && idObj != DBNull.Value)
                {
                    metadataSet.setID = idObj.ToString();
                }
                object publicationPeriodObj = dbRow["PublicationPeriod"];
                if (publicationPeriodObj != null && publicationPeriodObj != DBNull.Value)
                {
                    metadataSet.publicationPeriod = publicationPeriodObj.ToString();
                }
                object publicationYearObj = dbRow["PublicationYear"];
                if (publicationYearObj != null && publicationYearObj != DBNull.Value)
                {
                    metadataSet.publicationYear = Convert.ToInt16(publicationYearObj);
                }
                object reportingBeginObj = dbRow["ReportingBegin"];
                if (reportingBeginObj != null && reportingBeginObj != DBNull.Value)
                {
                    metadataSet.reportingBeginDate = (DateTime)reportingBeginObj;
                }
                object reportingEndObj = dbRow["ReportingEnd"];
                if (reportingEndObj != null && reportingEndObj != DBNull.Value)
                {
                    metadataSet.reportingEndDate = (DateTime)reportingEndObj;
                }
                object validFromObj = dbRow["ValidFrom"];
                if (validFromObj != null && validFromObj != DBNull.Value)
                {
                    metadataSet.validFromDate = (DateTime)validFromObj;
                }
                object validToObj = dbRow["ValidTo"];
                if (validToObj != null && validToObj != DBNull.Value)
                {
                    metadataSet.validToDate = (DateTime)validToObj;
                }

                //create struct reference
                if (dbRow["MSDId"] != null && dbRow["MSDId"] != DBNull.Value)
                {
                    if (dbRow["MSDAgency"] != null && dbRow["MSDAgency"] != DBNull.Value)
                    {
                        if (dbRow["MSDVersion"] != null && dbRow["MSDVersion"] != DBNull.Value)
                        {
                            var msdId = (string)dbRow["MSDId"];
                            var msdAgency = (string)dbRow["MSDAgency"];
                            var msdVersion = (string)dbRow["MSDVersion"];
                            metadataSet.structureRef = $"urn:sdmx:org.sdmx.infomodel.metadatastructure.MetadataStructure={msdAgency}:{msdId}({msdVersion})";
                        }
                    }
                }

                AnnotationsType t = new AnnotationsType();
                t.Annotation = buildMetadataSetAnnotationList(dbRow);
                metadataSet.Annotations = new Annotations(t);
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

            if (metadataSet.Name == null)
            {
                metadataSet.Name = new List<Name>();
            }

            Name n = new Name();
            n.lang = lang;
            n.TypedValue = langValue;
            metadataSet.Name.Add(n);

            return metadataSet;
        }

        public static List<AnnotationType> buildReportAnnotation(DataRow reportRow)
        {
            List<AnnotationType> ta = new List<AnnotationType>();

            AnnotationType ttId = new AnnotationType();
            ttId.id = ReportType.ANNOTATION_KEY_REPORT_ID;
            ttId.AnnotationText = new List<TextType>();
            ttId.AnnotationText.Add(new TextType(reportRow["Id"].ToString(), RMUtil.RMUtility.EN_LANGUAGE));
            ta.Add(ttId);

            AnnotationType ttMdsId = new AnnotationType();
            ttMdsId.id = ReportType.ANNOTATION_KEY_METADATASET_ID;
            ttMdsId.AnnotationText = new List<TextType>();
            ttMdsId.AnnotationText.Add(new TextType(reportRow["MetadasetId"].ToString(), RMUtil.RMUtility.EN_LANGUAGE));
            ta.Add(ttMdsId);

            AnnotationType ttStateId = new AnnotationType();
            ttStateId.id = ReportType.ANNOTATION_KEY_REPORT_STATE_ID;
            ttStateId.AnnotationText = new List<TextType>();
            ttStateId.AnnotationText.Add(new TextType(reportRow["StateId"].ToString(), RMUtil.RMUtility.EN_LANGUAGE));
            ta.Add(ttStateId);

            AnnotationType ttStateName = new AnnotationType();
            ttStateName.id = ReportType.ANNOTATION_KEY_REPORT_STATE_NAME;
            ttStateName.AnnotationText = new List<TextType>();
            ttStateName.AnnotationText.Add(new TextType(reportRow["StateName"].ToString(), RMUtil.RMUtility.EN_LANGUAGE));
            ta.Add(ttStateName);

            return ta;
        }

        public static List<AnnotationType> buildMetadataSetAnnotationList(DataRow dbRow)
        {
            List<AnnotationType> ta = new List<AnnotationType>();
            AnnotationType ttId = new AnnotationType();
            ttId.id = MetadataSetType.ANNOTATION_KEY_METADATASET_ID;
            ttId.AnnotationText = new List<TextType>();
            TextType txtId = new TextType();
            txtId.TypedValue = dbRow["Id"].ToString();
            txtId.lang = RMUtil.RMUtility.EN_LANGUAGE;
            ttId.AnnotationText.Add(txtId);
            ta.Add(ttId);

            AnnotationType ttflowId = new AnnotationType();
            ttflowId.id = MetadataSetType.ANNOTATION_KEY_METADATASET_FLOW_ID;
            ttflowId.AnnotationText = new List<TextType>();
            TextType txtflowId = new TextType();
            txtflowId.TypedValue = dbRow["MetadataflowId"].ToString();
            txtflowId.lang = RMUtil.RMUtility.EN_LANGUAGE;
            ttflowId.AnnotationText.Add(txtflowId);
            ta.Add(ttflowId);

            AnnotationType ttflowAgency = new AnnotationType();
            ttflowAgency.id = MetadataSetType.ANNOTATION_KEY_METADATASET_FLOW_AGENCY_ID;
            ttflowAgency.AnnotationText = new List<TextType>();
            TextType txtflowAgency = new TextType();
            txtflowAgency.TypedValue = dbRow["MetadataflowAgency"].ToString();
            txtflowAgency.lang = RMUtil.RMUtility.EN_LANGUAGE;
            ttflowAgency.AnnotationText.Add(txtflowAgency);
            ta.Add(ttflowAgency);

            AnnotationType ttflowVersion = new AnnotationType();
            ttflowVersion.id = MetadataSetType.ANNOTATION_KEY_METADATASET_FLOW_VERSION_ID;
            ttflowVersion.AnnotationText = new List<TextType>();
            TextType txtflowVersion = new TextType();
            txtflowVersion.TypedValue = dbRow["MetadataflowVersion"].ToString();
            txtflowVersion.lang = RMUtil.RMUtility.EN_LANGUAGE;
            ttflowVersion.AnnotationText.Add(txtflowVersion);
            ta.Add(ttflowVersion);

            AnnotationType ttMSDId = new AnnotationType();
            ttMSDId.id = MetadataSetType.ANNOTATION_KEY_METADATASET_MSD_ID;
            ttMSDId.AnnotationText = new List<TextType>();
            TextType txtMSDId = new TextType();
            txtMSDId.TypedValue = dbRow["MSDId"].ToString();
            txtMSDId.lang = RMUtil.RMUtility.EN_LANGUAGE;
            ttMSDId.AnnotationText.Add(txtMSDId);
            ta.Add(ttMSDId);

            AnnotationType ttMSDAgency = new AnnotationType();
            ttMSDAgency.id = MetadataSetType.ANNOTATION_KEY_METADATASET_MSD_AGENCY_ID;
            ttMSDAgency.AnnotationText = new List<TextType>();
            TextType txtMSDAgency = new TextType();
            txtMSDAgency.TypedValue = dbRow["MSDAgency"].ToString();
            txtMSDAgency.lang = RMUtil.RMUtility.EN_LANGUAGE;
            ttMSDAgency.AnnotationText.Add(txtMSDAgency);
            ta.Add(ttMSDAgency);

            AnnotationType ttMSDVersion = new AnnotationType();
            ttMSDVersion.id = MetadataSetType.ANNOTATION_KEY_METADATASET_MSD_VERSION_ID;
            ttMSDVersion.AnnotationText = new List<TextType>();
            TextType txtMSDVersion = new TextType();
            txtMSDVersion.TypedValue = dbRow["MSDVersion"].ToString();
            txtMSDVersion.lang = RMUtil.RMUtility.EN_LANGUAGE;
            ttMSDVersion.AnnotationText.Add(txtMSDVersion);
            ta.Add(ttMSDVersion);

            return ta;
        }

        public static ReferenceValueType BuildReferenceValueTypeFromDB(DataRow refValueRow)
        {
            ReferenceValueType rtarget = new ReferenceValueType();
            object rTargetIdObj = refValueRow["TargetIdentifierName"];
            if (rTargetIdObj != null && rTargetIdObj != DBNull.Value)
            {
                rtarget.id = rTargetIdObj.ToString().Trim();
            }

            ObjectReferenceType objRef = new ObjectReferenceType();
            object rTargetValObj = refValueRow["TargetIdentifierValue"];
            if (rTargetValObj != null && rTargetValObj != DBNull.Value)
            {
                string[] urnList = rTargetValObj.ToString().Trim().Split("#");
                if (urnList != null && urnList.Length > 0)
                {
                    List<XmlUri> newUrnList = new List<XmlUri>();
                    foreach (String urn in urnList)
                    {
                        newUrnList.Add(new XmlUri(urn.Trim()));
                    }
                    objRef.URN = newUrnList;
                }
            }
            rtarget.ObjectReference = objRef;
            return rtarget;
        }

        public static ReportType BuildReportTypeFromDB(DataRow reportRow)
        {
            ReportType result = new ReportType();

            result.id = (string)reportRow["ReferenceId"];
            AnnotationsType t = new AnnotationsType();
            t.Annotation = Helper.buildReportAnnotation(reportRow);
            result.Annotations = new Annotations(t);

            TargetType target = new TargetType();

            object targetIdObj = reportRow["TargetName"];
            if (targetIdObj != null && targetIdObj != DBNull.Value)
            {
                target.id = targetIdObj.ToString().Trim();
            }
            result.Target = target;

            return result;
        }
    }
}
