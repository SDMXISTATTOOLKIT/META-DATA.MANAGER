using DataProvider.entity;
using Infrastructure.STLogging.Interface;
using Org.Sdmx.Resources.SdmxMl.Schemas.V21.Common;
using Org.Sdmx.Resources.SdmxMl.Schemas.V21.MetaData.Generic;
using System;
using System.Collections.Generic;
using System.Xml;

namespace RMManager.RMDataProvider.Util
{
    class SdmxUtil
    {
        public static ReportedAttributeType addReportedAttribute(ReportedAttributeType parent, String id, String value, IList<Text> valueList, bool isPresentational)
        {
            if (parent == null)
            {
                throw new Exception("ReportedAttribute parent is null");
            }
            if (parent.AttributeSet == null)
            {
                parent.AttributeSet = new AttributeSetType();
            }
            return addReportedAttribute(parent.AttributeSet, id, value, valueList, isPresentational);
        }

        public static ReportedAttributeType addReportedAttribute(AttributeSetType atst, String id, String value, IList<Text> valueList, bool isPresentational)
        {
            ReportedAttributeType r = new ReportedAttributeType();
            r.id = id;
            r.value = value;
            if (!isPresentational)
            {
                r.Text = valueList;
            }

            if (atst != null)
            {
                if (atst.ReportedAttribute == null)
                {
                    atst.ReportedAttribute = new List<ReportedAttributeType>();
                }
                atst.ReportedAttribute.Add(r);
            }
            else
            {
                throw new Exception("AttributeSet is null");
            }
            return r;
        }

        public static List<ReportAttributeValue> retrieveRepAttributeValues(ISTLogger logger, XmlNode currRepAttribute)
        {
            if (currRepAttribute == null)
            {
                throw new Exception("ReportAttribute node not specified");
            }

            List<ReportAttributeValue> result = new List<ReportAttributeValue>();
            try
            {
                foreach (XmlNode currValue in currRepAttribute.ChildNodes)
                {
                    if (currValue.LocalName.Equals("Text"))
                    {
                        ReportAttributeValue val = new ReportAttributeValue();
                        val.Value = currValue.InnerText;
                        val.Language = currValue.Attributes["xml:lang"].Value;
                        result.Add(val);
                    }
                }
            }
            catch (Exception e)
            {
                string errorMsg = "Error to retrieve values for ReportAttribute node " + currRepAttribute;
                logger.Log(errorMsg + "- " + e.Message + ": " + e.StackTrace, LogLevelEnum.Error);
                throw new Exception(errorMsg);
            }

            return result;
        }
    }
}
