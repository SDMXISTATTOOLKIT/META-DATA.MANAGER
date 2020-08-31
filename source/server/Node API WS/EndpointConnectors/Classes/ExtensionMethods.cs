using Org.Sdmxsource.Sdmx.Api.Model.Mutable.Base;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Xml;
using System.Xml.Linq;

namespace EndpointConnectors
{
    public static class ExtensionMethods
    {
        public static bool Contains(this string source, string toCheck, StringComparison comp)
        {
            return source.IndexOf(toCheck, comp) >= 0;
        }

        public static bool IsNumeric(this string n)
        {
            int o;
            return int.TryParse(n, out o);
        }

        public static IList<IAnnotationMutableObject> DecodeAnnotations(this IList<IAnnotationMutableObject> Annotations)
        {
            foreach (var Annotation in Annotations)
            {
                foreach (var Text in Annotation.Text)
                {
                    Text.Value = Text.Value.Replace("&NewLine;", "<br />");
                    // arriva anche un \n che potrei convertire senza bisogno del &NewLine;
                }
            }

            return Annotations;
        }

        public static XmlDocument ToXmlDocument(this XDocument xDocument)
        {
            var xmlDocument = new XmlDocument();
            using (var xmlReader = xDocument.CreateReader())
            {
                xmlDocument.Load(xmlReader);
            }
            return xmlDocument;
        }

        public static XDocument ToXDocument(this XmlDocument xmlDocument)
        {
            using (var nodeReader = new XmlNodeReader(xmlDocument))
            {
                nodeReader.MoveToContent();
                return XDocument.Load(nodeReader);
            }
        }

        public static void RemoveIfExists(this XElement xElement)
        {
            if (xElement != null) xElement.Remove();
        }

        public static void RemoveIfExists(this IEnumerable<XElement> xElements)
        {
            if (xElements != null) xElements.Remove();
        }

        public static string FixMVCPath(this string Path)
        {
            string MVCFix = Path.
                Replace("\\Mask\\", "\\").
                Replace("\\ConScheme\\", "\\").
                Replace("\\Artefact\\", "\\").
                Replace("\\Auth\\", "\\").
                Replace("\\Config\\", "\\").
                Replace("\\Download\\", "\\").
                Replace("\\Error\\", "\\").
                Replace("\\Import\\", "\\").
                Replace("\\CRUDM\\", "\\").
                Replace("\\CatScheme\\", "\\").
                Replace("\\Home\\", "\\");

            return MVCFix;
        }
    }
}