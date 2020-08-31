using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.IO;
using System.Text;
using System.Xml.Serialization;

namespace RMDataProvider.Model
{
    [XmlRoot]
    [Serializable]
    public class MetadataSetType : AnnotableType, ISdmxJsonConvertible
    {
        public const string ANNOTATION_KEY_METADATASET_ID = "MetadataSetId";
        public const string ANNOTATION_KEY_METADATASET_FLOW_ID = "MetadataflowId";
        public const string ANNOTATION_KEY_METADATASET_FLOW_AGENCY_ID = "MetadataflowAgency";
        public const string ANNOTATION_KEY_METADATASET_FLOW_VERSION_ID = "MetadataflowVersion";
        public const string ANNOTATION_KEY_METADATASET_MSD_ID = "MSDId";
        public const string ANNOTATION_KEY_METADATASET_MSD_AGENCY_ID = "MSDAgency";
        public const string ANNOTATION_KEY_METADATASET_MSD_VERSION_ID = "MSDVersion";

        public const string ANNOTATION_KEY_METADATASET_ASSOCIATED_ID = "AssociatedMetadataSet";
        public const string ANNOTATION_KEY_METADATASET_TO_CLONE_ID = "MetadataSetToClone";

        public MetadataSetType() { }

        public void WriteToSdmxJson(JsonWriter writer)
        {
            //writer.Formatting = Formatting.Indented;
            writer.WriteStartObject();
            writeMetadataSetData(writer, this);
            writeAnnotations(writer);

            writer.WritePropertyName("reports");
            writeReports(writer, this);
           
            writer.WriteEndObject();
        }

        public string ToSdmxJson()
        {
            StringBuilder sb = new StringBuilder();
            StringWriter sw = new StringWriter(sb);

            using (JsonWriter writer = new JsonTextWriter(sw))
            {
                WriteToSdmxJson(writer);
            }

            return sb.ToString();
        }

        private void writeMetadataSetData(JsonWriter writer, MetadataSetType t)
        {
            if (t.structureRef!=null && t.structureRef.Trim().Length>0)
            {
                writer.WritePropertyName("structureRef");
                writer.WriteValue(t.structureRef.Trim());
                //throw new Exception("StructureRef is mandatory but non found in MetadataSet data");
            }

            if (t.setID != null && t.setID.Trim().Length > 0)
            {
                writer.WritePropertyName("id");
                writer.WriteValue(t.setID.Trim());
            }
            else
            {
                string mdtId = t.getAnnotationValue(MetadataSetType.ANNOTATION_KEY_METADATASET_ID);
                if (mdtId != null)
                {
                    writer.WritePropertyName("id");
                    writer.WriteValue(mdtId);
                }
            }
            if (t.action != null)
            {
                writer.WritePropertyName("action");
                writer.WriteValue(t.action);
            }
            if (t.reportingBeginDate.HasValue) {
                writer.WritePropertyName("reportingBegin");
                writer.WriteValue(t.reportingBeginDate.Value.ToString("yyyy-MM-ddThh:mm:ss"));
            }
            if (t.reportingEndDate.HasValue)
            {
                writer.WritePropertyName("reportingEnd");
                writer.WriteValue(t.reportingEndDate.Value.ToString("yyyy-MM-ddThh:mm:ss"));
            }
            if (t.validFromDate.HasValue)
            {
                writer.WritePropertyName("validFrom");
                writer.WriteValue(t.validFromDate.Value.ToString("yyyy-MM-ddThh:mm:ss"));
            }
            if (t.validToDate.HasValue)
            {
                writer.WritePropertyName("validTo");
                writer.WriteValue(t.validToDate.Value.ToString("yyyy-MM-ddThh:mm:ss"));
            }
            if (t.publicationYear.HasValue)
            {
                writer.WritePropertyName("publicationYear");
                writer.WriteValue(t.publicationYear.Value);
            }
            if (t.publicationPeriod!=null)
            {
                writer.WritePropertyName("publicationPeriod");
                writer.WriteValue(t.publicationPeriod);
            }

            if(t.Name!=null && t.Name.Count>0)
            {
                writer.WritePropertyName("names");
                writer.WriteStartObject();
                foreach (Name n in t.Name)
                {
                    writer.WritePropertyName(n.lang);
                    writer.WriteValue(n.TypedValue);
                }
                writer.WriteEndObject();
            }
        }

        private void writeReports(JsonWriter writer, MetadataSetType t)
        {
            if (t.Report != null)
            {
                writer.WriteStartArray();
                foreach (ReportType r in t.Report)
                {
                    r.WriteToSdmxJson(writer);
                }
                writer.WriteEndArray();
            }
        }

        public void FromSdmxJson(string sdmxJson)
        {
            JObject o = JObject.Parse(sdmxJson);

            JToken structureRefToken = o.SelectToken("structureRef");
            if (structureRefToken != null)
            {
                this.structureRef = structureRefToken.ToString().Trim();
                string msdId = null;
                string msdAgency = null;
                string msdVersion = null;
                RMUtil.RMUtility.ParseURN(this.structureRef, out msdId, out msdAgency, out msdVersion);
                this.addAnnotationValue(MetadataSetType.ANNOTATION_KEY_METADATASET_MSD_ID, msdId, RMUtil.RMUtility.EN_LANGUAGE);
                this.addAnnotationValue(MetadataSetType.ANNOTATION_KEY_METADATASET_MSD_AGENCY_ID, msdAgency, RMUtil.RMUtility.EN_LANGUAGE);
                this.addAnnotationValue(MetadataSetType.ANNOTATION_KEY_METADATASET_MSD_VERSION_ID, msdVersion, RMUtil.RMUtility.EN_LANGUAGE);
            }

            JToken idToken = o.SelectToken("id");
            if (idToken != null)
            {
                string id = idToken.ToString();
                this.setID = id;
            }

            JToken reportingBeginToken = o.SelectToken("reportingBegin");
            if (reportingBeginToken != null)
            {
                string reportingBegin = reportingBeginToken.ToString();
                this.reportingBeginDate = DateTime.Parse(reportingBegin);
            }

            JToken reportingEndToken = o.SelectToken("reportingEnd");
            if (reportingEndToken != null)
            {
                string reportingEnd = reportingEndToken.ToString();
                this.reportingEndDate = DateTime.Parse(reportingEnd);
            }

            JToken validFromToken = o.SelectToken("validFrom");
            if (validFromToken != null)
            {
                string validFrom = validFromToken.ToString();
                this.validFromDate = DateTime.Parse(validFrom);
            }

            JToken validToToken = o.SelectToken("validTo");
            if (validToToken != null)
            {
                string validTo = validToToken.ToString();
                this.validToDate = DateTime.Parse(validTo);
            }

            JToken publicationYearToken = o.SelectToken("publicationYear");
            if (publicationYearToken != null)
            {
                string publicationYear = publicationYearToken.ToString();
                this.publicationYear = Convert.ToInt16(publicationYear);
            }

            JToken publicationPeriodToken = o.SelectToken("publicationPeriod");
            if (publicationPeriodToken != null)
            {
                string publicationPeriod = publicationPeriodToken.ToString();
                this.publicationPeriod = publicationPeriod;
            }

            JToken mdtName = o.SelectToken("names");
            if (mdtName != null)
            {
                List<Name> names = new List<Name>();
                foreach (JToken currName in mdtName)
                {
                    string[] currNameStr = RMUtil.RMUtility.SplitKeyValueJsonProperty(currName.ToString());
                    Name n = new Name(new TextType(currNameStr[1].Trim(), currNameStr[0].Trim()));
                    n.lang = currNameStr[0].Trim();
                    names.Add(n);
                }
                this.Name = names;
            }

            readAnnotations(o);

            JToken reportsToken = o.SelectToken("reports");
            if (reportsToken != null)
            {
                List<ReportType> reportList = new List<ReportType>();
                foreach (JToken currRepToken in reportsToken)
                {
                    ReportType currRep = new ReportType();
                    currRep.FromSdmxJson(currRepToken.ToString().Trim());
                    reportList.Add(currRep);
                }
                this.Report = reportList;
            }

        }

        [XmlElement("")]
        public List<Name> Name { get; set; }
        public DataProviderReferenceType DataProvider { get; set; }

        [XmlElement("")]
        public List<ReportType> Report { get; set; }
        public string structureRef { get; set; }
        public string setID { get; set; }
        public string action { get; set; }

        [XmlIgnore]
        public DateTime? reportingBeginDate { get; set; }
        [XmlAttribute("reportingBeginDate")]
        public string reportingBeginDateVal
        {
            get { return this.reportingBeginDate.HasValue ? this.reportingBeginDate.Value.ToString("yyyy-MM-ddTHH:mm:ss") : null; }
            set { this.reportingBeginDate = DateTime.Parse(value); }
        }

        [XmlIgnore]
        public DateTime? reportingEndDate { get; set; }
        [XmlAttribute("reportingEndDate")]
        public string reportingEndDateVal
        {
            get { return this.reportingEndDate.HasValue ? this.reportingEndDate.Value.ToString("yyyy-MM-ddTHH:mm:ss") : null; }
            set { this.reportingEndDate = DateTime.Parse(value); }
        }

        [XmlIgnore]
        public DateTime? validFromDate { get; set; }
        [XmlAttribute("validFromDate")]
        public string validFromDateVal
        {
            get { return this.validFromDate.HasValue ? this.validFromDate.Value.ToString("yyyy-MM-ddTHH:mm:ss") : null; }
            set { this.validFromDate = DateTime.Parse(value); }
        }

        [XmlIgnore]
        public DateTime? validToDate { get; set; }
        [XmlAttribute("validToDate")]
        public string validToDateVal
        {
            get { return this.validToDate.HasValue ? this.validToDate.Value.ToString("yyyy-MM-ddTHH:mm:ss") : null; }
            set { this.validToDate = DateTime.Parse(value); }
        }

        [XmlIgnore]
        public short? publicationYear { get; set; }
        [XmlAttribute("publicationYear")]
        public string publicationYearVal
        {
            get { return this.publicationYear.HasValue ? ("" + this.publicationYear.Value) : null; }
            set { this.publicationYear =  Convert.ToInt16(value); }
        }

        [XmlAttribute("publicationPeriod")]
        public string publicationPeriod { get; set; }

    }
}
