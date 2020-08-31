using System;
using System.Collections.Generic;
using System.Text;

namespace HooverUnlimited.DotNetRtfWriter
{
    public class ResourcesLanguage
    {
        static private string _lang = "en";
        static public void SetLanguage(string lang)
        {
            _lang = lang.ToLowerInvariant();
        }

        static public string DataStructure
        {
            get
            {
                switch (_lang)
                {
                    case "it":
                        return "Struttura Dati";
                    default:
                        return "Data Structure";
                }
            }
        }
        static public string NameDescription
        {
            get
            {
                switch (_lang)
                {
                    case "it":
                        return "Nome e Descrizione";
                    default:
                        return "Name and description";
                }
            }
        }
        static public string Id
        {
            get
            {
                switch (_lang)
                {
                    case "it":
                        return "ID";
                    default:
                        return "ID";
                }
            }
        }
        static public string Agency
        {
            get
            {
                switch (_lang)
                {
                    case "it":
                        return "Agenzia";
                    default:
                        return "Agency";
                }
            }
        }
        static public string Version
        {
            get
            {
                switch (_lang)
                {
                    case "it":
                        return "Versione";
                    default:
                        return "Version";
                }
            }
        }
        static public string Dimension
        {
            get
            {
                switch (_lang)
                {
                    case "it":
                        return "Dimensione";
                    default:
                        return "Dimension";
                }
            }
        }
        static public string Nav_Conceptschemes
        {
            get
            {
                switch (_lang)
                {
                    case "it":
                        return "Concetti";
                    default:
                        return "Concept Schemes";
                }
            }
        }
        static public string Representation
        {
            get
            {
                switch (_lang)
                {
                    case "it":
                        return "Rappresentazione";
                    default:
                        return "Representation";
                }
            }
        }
        static public string DimensionType
        {
            get
            {
                switch (_lang)
                {
                    case "it":
                        return "Tipo dimensione";
                    default:
                        return "Dimension type";
                }
            }
        }
        static public string Name
        {
            get
            {
                switch (_lang)
                {
                    case "it":
                        return "Nome";
                    default:
                        return "Name";
                }
            }
        }
        static public string SchemeConcepts
        {
            get
            {
                switch (_lang)
                {
                    case "it":
                        return "Schema concetti";
                    default:
                        return "Concepts scheme";
                }
            }
        }
        static public string Codelist
        {
            get
            {
                switch (_lang)
                {
                    case "it":
                        return "Lista Codici";
                    default:
                        return "Codelist";
                }
            }
        }
        static public string TextFormat
        {
            get
            {
                switch (_lang)
                {
                    case "it":
                        return "Formato testo";
                    default:
                        return "Text format";
                }
            }
        }
        static public string Measures
        {
            get
            {
                switch (_lang)
                {
                    case "it":
                        return "Misure";
                    default:
                        return "Measures";
                }
            }
        }
        static public string Type
        {
            get
            {
                switch (_lang)
                {
                    case "it":
                        return "Tipo";
                    default:
                        return "Type";
                }
            }
        }
        static public string Concepts
        {
            get
            {
                switch (_lang)
                {
                    case "it":
                        return "Concetti";
                    default:
                        return "Concepts";
                }
            }
        }
        static public string MeasureDimension
        {
            get
            {
                switch (_lang)
                {
                    case "it":
                        return "Misura dimensione";
                    default:
                        return "Measure dimension";
                }
            }
        }
        static public string Ab_Code
        {
            get
            {
                switch (_lang)
                {
                    case "it":
                        return "Codice";
                    default:
                        return "Code";
                }
            }
        }
        static public string Dsd_attr
        {
            get
            {
                switch (_lang)
                {
                    case "it":
                        return "Attributi";
                    default:
                        return "Attributes";
                }
            }
        }
        static public string AttLevel
        {
            get
            {
                switch (_lang)
                {
                    case "it":
                        return "Tipo Allegato";
                    default:
                        return "Attachment Level";
                }
            }
        }
        static public string AttributeType
        {
            get
            {
                switch (_lang)
                {
                    case "it":
                        return "Tipo attributo";
                    default:
                        return "Attribute type";
                }
            }
        }
        static public string AssStatus
        {
            get
            {
                switch (_lang)
                {
                    case "it":
                        return "Stato di Assegnazione";
                    default:
                        return "Assignment Status";
                }
            }
        }
        static public string Parent
        {
            get
            {
                switch (_lang)
                {
                    case "it":
                        return "Padre";
                    default:
                        return "Parent";
                }
            }
        }

        static public string Codes
        {
            get
            {
                switch (_lang)
                {
                    case "it":
                        return "Codici";
                    default:
                        return "Codes";
                }
            }
        }
        
    }
}
