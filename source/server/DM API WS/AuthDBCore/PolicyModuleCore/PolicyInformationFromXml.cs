using AuthCore.PolicyModuleCore.Model;
using System;
using System.Collections.Generic;
using System.IO;
using System.Text;
using System.Xml;
using System.Xml.Schema;

namespace AuthCore.PolicyModuleCore
{
    public class PolicyInformationFromXml
    {
        public Rules Parse(Stream xmlFile, string schemaPath)
        {
            var restRules = new List<RestResource>();
            var soapRules = new List<SoapEndpoint>();
            var xmlReaderSettings = new XmlReaderSettings() { IgnoreComments = true, IgnoreProcessingInstructions = true, IgnoreWhitespace = true };

            if (!string.IsNullOrWhiteSpace(schemaPath))
            {
                xmlReaderSettings.Schemas = GetSchema(schemaPath);
                xmlReaderSettings.ValidationType = ValidationType.Schema;
            }

            using (var reader = XmlReader.Create(xmlFile, xmlReaderSettings))
            {
                MutableEndpoint mutableEndpoint = new MutableEndpoint();
                string text = null;
                while (reader.Read())
                {
                    var nodeType = reader.NodeType;
                    switch (nodeType)
                    {
                        case XmlNodeType.Element:
                            {
                                var localName = reader.LocalName;
                                ParseStartElement(localName, mutableEndpoint, reader);
                            }
                            break;
                        case XmlNodeType.Text:
                            text = reader.Value;
                            break;
                        case XmlNodeType.CDATA:
                            text = reader.Value;
                            break;
                        case XmlNodeType.EndElement:
                            {
                                var localName = reader.LocalName;
                                switch (localName)
                                {
                                    case "script":
                                        mutableEndpoint.Expression = text;
                                        text = null;
                                        break;
                                    case "rest":
                                        {
                                            var restResource = mutableEndpoint.CreateRestResource();
                                            restRules.Add(restResource);
                                        }
                                        break;
                                    case "soap":
                                        {
                                            var soap = mutableEndpoint.CreateSoapEndpoint();
                                            soapRules.Add(soap);
                                        }
                                        break;
                                }
                            }

                            break;
                    }
                }
            }

            return new Rules(restRules, soapRules);
        }

        private XmlSchemaSet GetSchema(string path)
        {
            var xmlSchema = new XmlSchemaSet();
            using (XmlReader reader = XmlReader.Create(path))
            {
                xmlSchema.Add("http://ec.europa.eu/eurostat/sri/authorisation/1.0", reader);
            }

            return xmlSchema;
        }

        private static void ParseStartElement(string localName, MutableEndpoint mutableEndpoint, XmlReader reader)
        {
            switch (localName)
            {
                case "rest":
                    {
                        CommonInit(mutableEndpoint, reader);
                        mutableEndpoint.Method = reader.GetAttribute("method");
                    }
                    break;
                case "soap":
                    {
                        CommonInit(mutableEndpoint, reader);
                    }
                    break;
                case "and":
                    mutableEndpoint.AggregateType = AggregateType.and;
                    break;
                case "or":
                    mutableEndpoint.AggregateType = AggregateType.or;
                    break;
                case "andGroup":
                    mutableEndpoint.AggregateType = AggregateType.andGroup;
                    break;
                case "orGroup":
                    mutableEndpoint.AggregateType = AggregateType.orGroup;
                    break;
                case "permission":
                    mutableEndpoint.Add("permission", reader.GetAttribute("id"));
                    break;
                case "functionality":
                    mutableEndpoint.Add("functionality", reader.GetAttribute("id"));
                    break;
                case "declare":
                    {
                        var prefix = reader.GetAttribute("prefix");
                        var ns = reader.GetAttribute("namespace");
                        if (!string.IsNullOrWhiteSpace(prefix) && !string.IsNullOrWhiteSpace(ns))
                        {
                            mutableEndpoint.NamespaceResolver.AddNamespace(prefix, ns);
                        }
                    }
                    break;
            }
        }

        private static void CommonInit(MutableEndpoint mutableEndpoint, XmlReader reader)
        {
            mutableEndpoint.Init();
            mutableEndpoint.SetAllowAnonymous(reader.GetAttribute("allowAnonymous"));
            mutableEndpoint.Path = reader.GetAttribute("path");
            var priority = reader.GetAttribute("priority") != null ? Convert.ToInt32(reader.GetAttribute("priority")) : Int32.MaxValue;
            if (priority == 0)
            {
                priority = Int32.MaxValue;
            }
            mutableEndpoint.Priority = priority;
        }
    }
}
