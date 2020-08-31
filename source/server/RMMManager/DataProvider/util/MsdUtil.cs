using System;
using System.Collections.Generic;
using System.Text;
using System.Xml;

namespace RMManager.RMDataProvider.Util
{
    class MsdUtil
    {

        public static bool checkParentReportAttribute(XmlNode ReportAttributeNode)
        {
            foreach (XmlNode lrNode in ReportAttributeNode.ChildNodes)
            {
                if (lrNode.LocalName.Equals("AttributeSet"))
                {
                    return true;
                }
            }
            return false;
        }

        public static bool checkIsPresentational(XmlDocument xDomMSD, string attrId, string isPresentationalAnnotation)
        {
        //isPresentational: !customIsPresentational? node.isPresentational : (node.isPresentational || (node.metadataAttributes || []).length > 0)
            bool isCustomPresentational = false;
            bool isPresentational = false;
            bool hasChildNodes = false;
            XmlNode metadataAttributeNode = xDomMSD.SelectSingleNode("//*[local-name()='MetadataAttribute'][@id='" + attrId + "']");
            XmlAttribute isPresentationalAttr = metadataAttributeNode.Attributes["isPresentational"];
            if (isPresentationalAttr != null)
            {
                isPresentational = Convert.ToBoolean(isPresentationalAttr.Value);
            }
            foreach (XmlNode node in metadataAttributeNode.ChildNodes)
            {
                if(node.LocalName.Equals("Annotations") && node.InnerText.IndexOf(isPresentationalAnnotation) != -1)
                {
                    isCustomPresentational = true;
                }
                if (node.LocalName.Equals("MetadataAttribute"))
                {
                    hasChildNodes = true;
                }
            }

            if (!isCustomPresentational)
            {
                return isPresentational;
            }
        
            return (isPresentational || hasChildNodes);
            //return false;
        }

        public static int getMetadataAttributeType(XmlDocument xDomMSD, string attributeName)
        {
            //*[local-name()='MetadataAttribute']
            int resultType = RMDataProvider.VALUE_FORMAT_STRING_ID;
            //MetadataAttribute[id='" + attributeName + "']

            XmlNode metadataAttributeNode = xDomMSD.SelectSingleNode("//*[local-name()='MetadataAttribute'][@id='" + attributeName + "']");
            
            XmlAttribute metadataAttributeType = null;
            foreach (XmlNode lrNode in metadataAttributeNode.ChildNodes)
            {
                if (lrNode.LocalName.Equals("LocalRepresentation"))
                {
                    foreach (XmlNode tfNode in lrNode.ChildNodes)
                    {
                        if (tfNode.LocalName.Equals("TextFormat"))
                        {
                            metadataAttributeType = tfNode.Attributes["textType"];
                        }
                        else if (tfNode.LocalName.Equals("Enumeration"))
                        {
                            return RMDataProvider.VALUE_FORMAT_STRING_ID;
                        }
                    }
                }
            }
            //XmlNode localNode = metadataAttributeNode.SelectSingleNode("//[local-name()='LocalRepresentation']");
            //XmlNode textTypeNode = metadataAttributeNode.SelectSingleNode("/LocalRepresentation/TextFormat");
            //XmlAttribute metadataAttribute = metadataAttributeNode.Attributes["textType"];

            if (metadataAttributeType != null)
            {
                if (metadataAttributeType.Value.Equals("DateTime"))
                {
                    resultType = RMDataProvider.VALUE_FORMAT_DATETIME_ID;
                }
                else if (metadataAttributeType.Value.Equals("URI"))
                {
                    resultType = RMDataProvider.VALUE_FORMAT_URI_ID;
                }
                else if (metadataAttributeType.Value.Equals("Numeric"))
                {
                    resultType = RMDataProvider.VALUE_FORMAT_NUMERIC_ID;
                }
            }
            //else
            //{
            //    throw new Exception("Attribute textType not found for node " + attributeName);
            //}
            return resultType;
        }

    }
}
