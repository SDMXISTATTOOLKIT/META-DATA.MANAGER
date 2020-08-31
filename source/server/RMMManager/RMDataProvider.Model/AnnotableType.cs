using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Text;
using System.Xml.Serialization;

namespace RMDataProvider.Model
{
    [Serializable]
    public abstract class AnnotableType
    {
        public AnnotableType() { }

        public void addAnnotation(AnnotationType annotation, bool overrideId = true)
        {
            if (annotation == null)
            {
                throw new Exception("Annotation data not specified!");
            }
            //if(annotation.id== null && annotation.id.Trim().Length == 0)
            //{
            //    throw new Exception("Annotation id is mandatory!");
            //}

            if (this.Annotations == null)
            {
                this.Annotations = new Annotations();
            }
            if (this.Annotations.Annotation == null)
            {
                this.Annotations.Annotation = new List<AnnotationType>();
            }

            int index = -1;
            if (overrideId && annotation.id != null)
            {
                for (int i = 0; i < this.Annotations.Annotation.Count; i++)
                {
                    AnnotationType currAnn = this.Annotations.Annotation[i];
                    if (currAnn.id!=null && currAnn.id.Equals(annotation.id))
                    {
                        index = i;
                        break;
                    }
                }
            }

            if (index > -1)
            {
                this.Annotations.Annotation.RemoveAt(index);
                this.Annotations.Annotation.Insert(index, annotation);
            }
            else
            {
                this.Annotations.Annotation.Add(annotation);
            }
        }

        public void addAnnotationValue(string annotationKey, string annotationValue, string annotationLanguage)
        {
            AnnotationType ann = new AnnotationType(annotationKey, annotationValue, annotationLanguage);
            this.addAnnotation(ann);
        }

        public AnnotationType getAnnotation(string annotationKey)
        {
            if (this.Annotations == null || this.Annotations.Annotation == null)
            {
                return null;
            }
            foreach (AnnotationType currAnn in this.Annotations.Annotation)
            {
                if (currAnn.id != null && currAnn.id.Equals(annotationKey))
                {
                    return currAnn;
                }
            }
            return null;
        }

        public string getAnnotationValue(string annotationKey)
        {
            if(this.Annotations==null || this.Annotations.Annotation == null)
            {
                return null;
            }
            foreach (AnnotationType currAnn in this.Annotations.Annotation)
            {
                if (currAnn.id!=null && currAnn.id.Equals(annotationKey))
                {
                    string value = currAnn.AnnotationText[0].TypedValue;
                    if (value != null)
                    {
                        value = value.Trim();
                    }
                    return value;
                }
            }
            return null;
        }

        protected void writeAnnotations(JsonWriter writer)
        {
            if (this.Annotations != null && this.Annotations.Annotation != null && this.Annotations.Annotation.Count > 0)
            {
                writer.WritePropertyName("annotations");
                writer.WriteStartArray();
                for (int i = 0; i < this.Annotations.Annotation.Count; i++)
                {
                    AnnotationType ann = this.Annotations.Annotation[i];
                    writer.WriteStartObject();
                    if (ann.id != null && ann.id.Trim().Length > 0) {
                        writer.WritePropertyName("id");
                        writer.WriteValue(ann.id.Trim());
                    }
                    if (ann.AnnotationTitle != null && ann.AnnotationTitle.Trim().Length > 0)
                    {
                        writer.WritePropertyName("title");
                        writer.WriteValue(ann.AnnotationTitle.Trim());
                    }
                    if (ann.AnnotationType1 != null && ann.AnnotationType1.Trim().Length > 0)
                    {
                        writer.WritePropertyName("type");
                        writer.WriteValue(ann.AnnotationType1.Trim());
                    }
                    string text = null;
                    string textEN = null;
                    if (ann.AnnotationText != null)
                    {
                        writer.WritePropertyName("texts");
                        writer.WriteStartObject();
                        foreach (TextType annT in ann.AnnotationText)
                        {
                            if (annT.TypedValue != null)
                            {
                                string currLang = annT.lang;
                                if (currLang == null)
                                {
                                    currLang = RMUtil.RMUtility.UND_LANGUAGE;
                                }
                                writer.WritePropertyName(currLang);
                                writer.WriteValue(annT.TypedValue.Trim());
                            
                                if (text == null)
                                {
                                    text = annT.TypedValue;
                                }
                                if (currLang.Equals(RMUtil.RMUtility.EN_LANGUAGE) || textEN == null)
                                {
                                    textEN = annT.TypedValue;
                                }
                            }
                        }
                        writer.WriteEndObject();
                    }
 
                    if (text != null)
                    {
                        writer.WritePropertyName("text");
                        writer.WriteValue(text.Trim());
                    }
                    writer.WriteEndObject();
                }
                writer.WriteEndArray();
            }
        }

        protected void readAnnotations(JObject sdmxJsonObj)
        {
            JToken annotationToken = sdmxJsonObj.SelectToken("annotations");
            if (annotationToken != null)
            {
                foreach (JToken currAnnToken in annotationToken)
                {
                    AnnotationType ann = new AnnotationType();
                    JToken annotationIdT = currAnnToken.SelectToken("id");
                    if (annotationIdT != null)
                    {
                        ann.id = annotationIdT.ToString().Trim();
                    }
                    JToken annotationKeyT = currAnnToken.SelectToken("title");
                    if (annotationKeyT != null)
                    {
                        ann.AnnotationTitle = annotationKeyT.ToString().Trim();
                    }
                    JToken annotationTypeT = currAnnToken.SelectToken("type");
                    if (annotationTypeT != null)
                    {
                        ann.AnnotationType1 = annotationTypeT.ToString().Trim();
                    }
                    JToken currAnnTextT = currAnnToken.SelectToken("texts");
                    if (currAnnTextT != null)
                    {
                        string[] tValues = currAnnTextT.ToString().Split(",");
                        ann.AnnotationText = new List<TextType>();
                        foreach (string currLangT in tValues)
                        {
                            string[] currAnnTextStr = RMUtil.RMUtility.SplitKeyValueJsonProperty(currLangT);
                            ann.AnnotationText.Add(new TextType(currAnnTextStr[1].Trim(), currAnnTextStr[0].Trim()));
                        }
                    }
                    JToken urlT = currAnnToken.SelectToken("url");
                    if (urlT != null)
                    {
                        ann.AnnotationURL = new XmlUri(annotationTypeT.ToString().Trim());
                    }
                    this.addAnnotation(ann, false);
                }
            }
        }

        public Annotations Annotations { get; set; }
    }
}
