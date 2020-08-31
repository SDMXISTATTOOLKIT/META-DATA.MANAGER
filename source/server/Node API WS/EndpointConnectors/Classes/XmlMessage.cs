using DataModel;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json;
using Org.Sdmxsource.Sdmx.Api.Constants;
using Org.Sdmxsource.Sdmx.Api.Model.Format;
using Org.Sdmxsource.Sdmx.Api.Model.Objects;
using Org.Sdmxsource.Sdmx.SdmxObjects.Model;
using Org.Sdmxsource.Sdmx.Structureparser.Manager;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.IO;
using System.Linq;
using System.Web;
using System.Xml;
using System.Xml.Linq;

namespace EndpointConnectors
{
    public class XmlMessage
    {
        public static readonly XNamespace reg = "http://www.sdmx.org/resources/sdmxml/schemas/v2_1/webservices/registry";
        public static readonly XNamespace mes = "http://www.sdmx.org/resources/sdmxml/schemas/v2_1/message";
        public static readonly XNamespace str = "http://www.sdmx.org/resources/sdmxml/schemas/v2_1/structure";
        public static readonly XNamespace com = "http://www.sdmx.org/resources/sdmxml/schemas/v2_1/common";

        private readonly AppConfig.Defaultheadersubmitstructure _defaultheadersubmitstructure;

        private const string namespaceQuery = "http://www.sdmx.org/resources/sdmxml/schemas/v2_1/query";
        private const string soapSchema = "http://schemas.xmlsoap.org/soap/envelope/";

        public XmlMessage(AppConfig.Defaultheadersubmitstructure defaultheadersubmitstructure)
        {
            _defaultheadersubmitstructure = defaultheadersubmitstructure;
        }

        /// <summary>
        /// Get SubmitStructure Xml Message.
        /// </summary>
        /// <param name="type">SOAP or REST</param>
        /// <param name="sdmxObj">SdmxObjects to be placed in the message.</param>
        /// <param name="action">Type of action: Replace or Delete.</param>
        /// <returns></returns>
        public XmlDocument GetSubmitStructureXmlMessage(string type, ISdmxObjects sdmxObj, string action)
        {
            XDocument XTemplate = GetSubmitStructureXmlTemplate(type, action);
            XElement XStructure = GetXmlStructure(sdmxObj);

            // Insert Structure in Template
            if (type.Equals("SOAP", StringComparison.InvariantCultureIgnoreCase))
            {
                XTemplate.
                Descendants(mes + "SubmitStructureRequest").
                FirstOrDefault().
                Elements(mes + "SubmitStructureRequest").
                FirstOrDefault().
                Add(XStructure);
            }
            else
            {
                XTemplate.Element(mes + "Structure").Add(XStructure);
            }

            return XTemplate.ToXmlDocument();
        }

        /// <summary>
        /// Get SubmitStructure template.
        /// </summary>
        /// <param name="type">SOAP or REST</param>
        /// <param name="action"></param>
        /// <returns></returns>
        private XDocument GetSubmitStructureXmlTemplate(string type, string action)
        {
            XmlDocument xDocTemplate = new XmlDocument();

            // Caricamento Template
            string filePath =  type.Equals("SOAP", StringComparison.InvariantCultureIgnoreCase) ? $"SdmxQueryTemplate\\SubmitStructure.xml" : "SdmxQueryTemplate\\SubmitStructureREST.xml";
            xDocTemplate.Load(filePath);

            XDocument XTemplate = xDocTemplate.ToXDocument();

            // Configurazione Header
            string ss_id = _defaultheadersubmitstructure.ID;
            string ss_test = _defaultheadersubmitstructure.test.ToString().ToLower();
            string ss_prepared = DateTime.UtcNow.ToString("s") + "Z";
            string ss_sender = _defaultheadersubmitstructure.sender;
            string ss_receiver = _defaultheadersubmitstructure.receiver;

            // Inserimento Struttura nel Template

            XTemplate.Descendants(mes + "Header").Elements(mes + "ID").FirstOrDefault().Value = ss_id;
            XTemplate.Descendants(mes + "Header").Elements(mes + "Test").FirstOrDefault().Value = ss_test;
            XTemplate.Descendants(mes + "Header").Elements(mes + "Prepared").FirstOrDefault().Value = ss_prepared;
            XTemplate.Descendants(mes + "Header").Elements(mes + "Sender").FirstOrDefault().Attribute("id").Value = ss_sender;
            XTemplate.Descendants(mes + "Header").Elements(mes + "Receiver").FirstOrDefault().Attribute("id").Value = ss_receiver;

            if (type.Equals("SOAP", StringComparison.InvariantCultureIgnoreCase))
            {
                XTemplate.
                                Descendants(mes + "SubmitStructureRequest").
                                FirstOrDefault().
                                Elements(mes + "SubmitStructureRequest").
                                FirstOrDefault().
                                Attribute("action").
                                Value = action;
            }

            return XTemplate;
        }

        /// <summary>
        /// Adds Envelope to SdmxQuery
        /// </summary>
        /// <param name="query">XmlDocument containing query to be enveloped.</param>
        /// <param name="operation">Operation to be performed through the query.</param>
        /// <returns></returns>
        public static XmlDocument AddEnvelopeToSdmxQuery(XmlDocument query, string operation, string prefix, string nameSpace)
        {
            if (operation.Equals("SubmitStructure", StringComparison.InvariantCultureIgnoreCase))
            {
                return query;
            }

            string xmlTemplate = $@"<soap:Envelope xmlns:soap=""{soapSchema}"" xmlns:{prefix}=""{nameSpace}"">
                                  <soap:Header/>
                                   <soap:Body>
                                      <web:{operation}>
                                        {query.InnerXml}
                                      </web:{operation}>
                                  </soap:Body>
                                 </soap:Envelope>";
            XmlDocument result = new XmlDocument();
            result.LoadXml(xmlTemplate);
            return result;
        }

        /// <summary>
        /// Get XmlQueryMessage for getting SDMX artefacts.
        /// </summary>
        /// <param name="artefact">Artefact type.</param>
        /// <param name="id">Artefact id.</param>
        /// <param name="agencyID">Artefact agency.</param>
        /// <param name="version">Artefact version.</param>
        /// <param name="operation">Operation to be performed through the query.</param>
        /// <param name="refDetail">Reference detail: eg. None, Children, Parents (default = None).</param>
        /// <returns></returns>
        public static XmlDocument GetRequestQueryMessageXml(SdmxStructureEnumType artefactType, string id, string agencyID, string version, string operation, string prefix, string nameSpace, string returnDetail, StructureReferenceDetailEnumType refDetail = StructureReferenceDetailEnumType.None)
        {
            var originalReturnDetail = returnDetail;
            XmlDocument xDom = new XmlDocument();

            // Carico il template
            xDom.Load(getTemplate(artefactType));

            //setto id, agency e version o rimuovo il filtro
            SetKey(ref xDom, id, agencyID, version);

            //setto il livello di dettaglio
            //WARNING!!!!!!!!!!  Artefacts with cross references cannot be queried with Stub parameter
            if (refDetail != StructureReferenceDetailEnumType.None)
            {
                returnDetail = "Full";
            }
            else
            {
                returnDetail = artefactType == SdmxStructureEnumType.CodeList || artefactType == SdmxStructureEnumType.Dsd ||
                    artefactType == SdmxStructureEnumType.ConceptScheme || artefactType == SdmxStructureEnumType.CategoryScheme || artefactType == SdmxStructureEnumType.AgencyScheme ? "CompleteStub" : "Stub";
            }
            
            bool isSingleArtefactRequest = id != null && agencyID != null && version != null;
            returnDetail = isSingleArtefactRequest || artefactType == SdmxStructureEnumType.Dataflow || artefactType == SdmxStructureEnumType.Categorisation || artefactType == SdmxStructureEnumType.Agency || artefactType == SdmxStructureEnumType.MetadataFlow ? "Full" : returnDetail;
            
            if (!String.IsNullOrWhiteSpace(originalReturnDetail))
            {
                returnDetail = originalReturnDetail;
            }
            SetReturnDetail(ref xDom, returnDetail);

            //setto il reference detail
            SetReferenceDetail(ref xDom, refDetail == StructureReferenceDetailEnumType.Null ? StructureReferenceDetailEnumType.None : refDetail);

            return AddEnvelopeToSdmxQuery(xDom, operation, prefix, nameSpace);
        }

        /// <summary>
        /// Get XmlTemplate for the artefact type given.
        /// </summary>
        /// <param name="artefactType"></param>
        /// <returns></returns>
        private static string getTemplate(SdmxStructureEnumType artefactType)
        {
            string fileName = ".\\SdmxQueryTemplate\\" + artefactType.ToString() + ".xml";
            return fileName;
        }

        /// <summary>
        /// Set id, agency and version for the query or replace the corrispondent xml node.
        /// </summary>
        /// <param name="xDom">XML document containing the query.</param>
        /// <param name="id">Artefact id.</param>
        /// <param name="agency">Artefact agency.</param>
        /// <param name="version">Artefact version.</param>
        private static void SetKey(ref XmlDocument xDom, string id, string agency, string version)
        {
            XmlNamespaceManager xManag = GetNamespaceManager(xDom);

            XmlNode xNodeID = xDom.SelectSingleNode("//query:ID", xManag);
            XmlNode xNodeAgency = xDom.SelectSingleNode("//query:AgencyID", xManag);
            XmlNode xNodeVersion = xDom.SelectSingleNode("//query:Version", xManag);

            if (id != null)
                xNodeID.InnerText = id;
            else
                xNodeID.ParentNode.RemoveChild(xNodeID);

            if (agency != null)
                xNodeAgency.InnerText = agency;
            else
                xNodeAgency.ParentNode.RemoveChild(xNodeAgency);

            if (version != null)
                xNodeVersion.InnerText = version;
            else
                xNodeVersion.ParentNode.RemoveChild(xNodeVersion);

        }

        /// <summary>
        /// Set the reference detail for the query.
        /// </summary>
        /// <param name="xDom">XML document containing the query.</param>
        /// <param name="refDetail">Reference deatil. Eg. None, Children, Parent, etc.</param>
        private static void SetReferenceDetail(ref XmlDocument xDom, StructureReferenceDetailEnumType refDetail)
        {
            XmlNamespaceManager xManag = GetNamespaceManager(xDom);

            XmlNode xNodeID = xDom.SelectSingleNode("//query:References", xManag);
            XmlElement refDet = xDom.CreateElement("query", refDetail.ToString(), xManag.LookupNamespace("query"));


            xNodeID.AppendChild(refDet);
        }

        /// <summary>
        /// Get NameSpaceManager for the document.
        /// </summary>
        /// <returns></returns>
        private static XmlNamespaceManager GetNamespaceManager(XmlDocument xDom)
        {
            XmlNamespaceManager xManag = new XmlNamespaceManager(xDom.NameTable);
            xManag.AddNamespace("query", namespaceQuery);

            return xManag;
        }

        /// <summary>
        /// Set the return detail for the query, i.e. Full or Stub.
        /// </summary>
        /// <param name="xDom">XML document containing the query.</param>
        /// <param name="value">Return deatil (Full or Stub).</param>
        private static void SetReturnDetail(ref XmlDocument xDom, string value)
        {
            XmlNode xNodeID = xDom.SelectSingleNode("//query:ReturnDetails", GetNamespaceManager(xDom));
            xNodeID.Attributes["detail"].Value = value;
        }

        /// <summary>
        /// Get XML structure from SDMX Objects.
        /// </summary>
        /// <param name="sdmxObj"></param>
        /// <returns></returns>
        private XElement GetXmlStructure(ISdmxObjects sdmxObj)
        {
            XmlDocument xDocStructure = new XmlDocument();

            // Conversione in SDMX 2.1

            xDocStructure = GetXMLDocFromSdmxObjects(sdmxObj, StructureOutputFormatEnumType.SdmxV21StructureDocument);

            XElement XStructure = xDocStructure.ToXDocument().Descendants(mes + "Structures").FirstOrDefault();

            return XStructure;
        }

        /// <summary>
        /// Get XMLDocument from SDMX Objects and a specific version.
        /// </summary>
        /// <param name="sdmxObjects"></param>
        /// <param name="version"></param>
        /// <returns></returns>
        private XmlDocument GetXMLDocFromSdmxObjects(ISdmxObjects sdmxObjects, StructureOutputFormatEnumType version)
        {
            StructureWriterManager swm = new StructureWriterManager();

            StructureOutputFormat soFormat = StructureOutputFormat.GetFromEnum(version);
            IStructureFormat outputFormat = new SdmxStructureFormat(soFormat);

            MemoryStream memoryStream = new MemoryStream();

            swm.WriteStructures(sdmxObjects, outputFormat, memoryStream);

            XmlTextReader read = new XmlTextReader(memoryStream);

            memoryStream.Flush();
            memoryStream.Position = 0;

            XmlDocument xDoc = new XmlDocument();
            xDoc.Load(memoryStream);

            return xDoc;
        }

        static public XmlDocument FixLocale(XmlDocument XmlDoc, string oldValue, string newValue)
        {
            string Find = String.Format(@"lang=""{0}""", oldValue);
            string Repl = String.Format(@"lang=""{0}""", newValue);

            XmlDoc.InnerXml = XmlDoc.InnerXml.Replace(Find, Repl);

            return XmlDoc;
        }

        static public XmlDocument FixDataType(XmlDocument XmlDoc)
        {
            XDocument XDoc = ToXDocument(XmlDoc);

            var EnumFormats = XDoc.Descendants(XmlMessage.str + "EnumerationFormat");

            if (EnumFormats.Count() > 0)
            {
                foreach (var EnumFormat in EnumFormats)
                {
                    if (EnumFormat.HasAttributes)
                    {
                        var pattern = EnumFormat.Attribute("pattern");
                        var textType = EnumFormat.Attribute("textType");

                        if (pattern != null && textType != null)
                            textType.Value = "String";
                    }
                }
            }

            return ToXmlDocument(XDoc);
        }

        static private XmlDocument ToXmlDocument(XDocument xDocument)
        {
            var xmlDocument = new XmlDocument();
            using (var xmlReader = xDocument.CreateReader())
            {
                xmlDocument.Load(xmlReader);
            }
            return xmlDocument;
        }

        static private XDocument ToXDocument(XmlDocument xmlDocument)
        {
            using (var nodeReader = new XmlNodeReader(xmlDocument))
            {
                nodeReader.MoveToContent();
                return XDocument.Load(nodeReader);
            }
        }
    }
}
