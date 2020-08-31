using DataModel;
using HooverUnlimited.DotNetRtfWriter;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using Org.Sdmxsource.Sdmx.Api.Constants;
using Org.Sdmxsource.Sdmx.Api.Model.Format;
using Org.Sdmxsource.Sdmx.Api.Model.Mutable.Base;
using Org.Sdmxsource.Sdmx.Api.Model.Mutable.CategoryScheme;
using Org.Sdmxsource.Sdmx.Api.Model.Mutable.Codelist;
using Org.Sdmxsource.Sdmx.Api.Model.Mutable.ConceptScheme;
using Org.Sdmxsource.Sdmx.Api.Model.Mutable.DataStructure;
using Org.Sdmxsource.Sdmx.Api.Model.Mutable.Mapping;
using Org.Sdmxsource.Sdmx.Api.Model.Mutable.MetadataStructure;
using Org.Sdmxsource.Sdmx.Api.Model.Mutable.Registry;
using Org.Sdmxsource.Sdmx.Api.Model.Objects;
using Org.Sdmxsource.Sdmx.Api.Model.Objects.Base;
using Org.Sdmxsource.Sdmx.Api.Model.Objects.CategoryScheme;
using Org.Sdmxsource.Sdmx.Api.Model.Objects.Codelist;
using Org.Sdmxsource.Sdmx.Api.Model.Objects.ConceptScheme;
using Org.Sdmxsource.Sdmx.Api.Model.Objects.DataStructure;
using Org.Sdmxsource.Sdmx.Api.Model.Objects.Reference;
using Org.Sdmxsource.Sdmx.SdmxObjects.Model;
using Org.Sdmxsource.Sdmx.SdmxObjects.Model.Mutable.Base;
using Org.Sdmxsource.Sdmx.Structureparser.Manager;
using Org.Sdmxsource.Sdmx.Util.Objects.Container;
using RDFPlugin.Engine;
using System;
using System.Collections.Generic;
using System.Data;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Text;

namespace BusinessLogic
{
    public class DownloadMetadata
    {
        

        static public ISdmxObjects GetOrderArtefacts(ISdmxObjects sdmxObject, string exportType, string separator, string delimiter, NodeConfig.nAnnotations nAnnotations, string lang)
        {
            bool annotations = true;
            var orderSdmxObject = new SdmxObjectsImpl();
            foreach (var mainTableItem in sdmxObject.GetAllMaintainables())
            {
                switch (mainTableItem.StructureType.EnumType)
                {
                    case SdmxStructureEnumType.CodeList:
                        ICodelistMutableObject Codelist = mainTableItem.MutableInstance as ICodelistMutableObject;

                        removeWorkingAnnotation(Codelist, nAnnotations);

                        List<ICodeMutableObject> ListItem = new List<ICodeMutableObject>();

                        foreach (ICodeMutableObject myCode in Codelist.Items)
                        {
                            ListItem.Add(myCode);
                        }

                        //Check if exist Annotations for make orders
                        foreach (ICodeMutableObject myCode in ListItem)
                        {
                            //If one ore more Annotation not exist we can't order
                            if (myCode.Annotations.Count == 0)
                            {
                                annotations = false;
                                break;
                            }
                        }

                        //All annottion must be number
                        var annotationCompare = new Utility.SdmxUtils.AnnotationCompare(mainTableItem.StructureType.EnumType, nAnnotations, lang);
                        if (annotations == true)
                        {
                            ListItem.Sort(annotationCompare);
                        }

                        for (int i = 0; i <= ListItem.Count - 1; i++)
                        {
                            Codelist.Items[i] = ListItem[i];
                        }

                        orderSdmxObject.AddCodelist(Codelist.ImmutableInstance);

                        break;

                    case SdmxStructureEnumType.ConceptScheme:
                        IConceptSchemeMutableObject ConceptScheme = mainTableItem.MutableInstance as IConceptSchemeMutableObject;

                        removeWorkingAnnotation(ConceptScheme, nAnnotations);

                        List<IConceptMutableObject> ListItemConcept = new List<IConceptMutableObject>();

                        foreach (IConceptMutableObject myCode in ConceptScheme.Items)
                        {
                            ListItemConcept.Add(myCode);
                        }

                        //Check if exist Annotations for make orders
                        foreach (IConceptMutableObject myCode in ConceptScheme.Items)
                        {
                            //If one ore more Annotation not exist we can't order
                            if (myCode.Annotations.Count == 0)
                            {
                                annotations = false;
                                break;
                            }
                        }

                        //All annottion must be number
                        var annotationCompareConcept = new Utility.SdmxUtils.AnnotationCompare(mainTableItem.StructureType.EnumType, nAnnotations, lang);
                        if (annotations == true)
                        {
                            ListItemConcept.Sort(annotationCompareConcept);
                        }

                        for (int i = 0; i <= ListItemConcept.Count - 1; i++)
                        {
                            ConceptScheme.Items[i] = ListItemConcept[i];
                        }

                        orderSdmxObject.AddConceptScheme(ConceptScheme.ImmutableInstance);

                        break;

                    case SdmxStructureEnumType.Dataflow:
                        var mainMutable = mainTableItem.MutableInstance as IDataflowMutableObject;

                        removeWorkingAnnotation(mainMutable, nAnnotations);
                        orderSdmxObject.AddDataflow(mainMutable.ImmutableInstance);

                        break;

                    case SdmxStructureEnumType.CategoryScheme:
                        ICategorySchemeMutableObject CategoryScheme = mainTableItem.MutableInstance as ICategorySchemeMutableObject;

                        removeWorkingAnnotation(CategoryScheme, nAnnotations);

                        List<ICategoryMutableObject> ListItemCategory = new List<ICategoryMutableObject>();

                        foreach (ICategoryMutableObject myCode in CategoryScheme.Items)
                        {
                            ListItemCategory.Add(myCode);
                        }

                        //Check if exist Annotations for make orders
                        foreach (ICategoryMutableObject myCode in CategoryScheme.Items)
                        {
                            //If one ore more Annotation not exist we can't order
                            if (myCode.Annotations.Count == 0)
                            {
                                annotations = false;
                                break;
                            }
                        }

                        //All annottion must be number
                        var annotationCompareCategory = new Utility.SdmxUtils.AnnotationCompare(mainTableItem.StructureType.EnumType, nAnnotations, lang);
                        if (annotations == true)
                        {
                            ListItemCategory.Sort(annotationCompareCategory);
                        }

                        var annotationCategoryScheme = new Utility.SdmxUtils.AnnotationCompare(mainTableItem.StructureType.EnumType, nAnnotations, lang);
                        for (int i = 0; i <= ListItemCategory.Count - 1; i++)
                        {
                            if (annotations == true)
                            {
                                //System.Collections.ArrayList.Adapter((System.Collections.IList)(ListItemCategory[i].Items)).Sort(new ComparisonComparer<ICategoryMutableObject>((x, y) => Int32.Parse((x.Annotations.FirstOrDefault(a => a.Type != null && a.Type == OrderAnnotation)?.Text[0].Value) ?? Int32.MaxValue.ToString()) - Int32.Parse((y.Annotations.FirstOrDefault(a => a.Type != null && a.Type == OrderAnnotation)?.Text[0].Value) ?? Int32.MaxValue.ToString())));

                            }
                            CategoryScheme.Items[i] = ListItemCategory[i];
                        }

                        orderSdmxObject.AddCategoryScheme(CategoryScheme.ImmutableInstance);

                        break;

                    case SdmxStructureEnumType.Dsd:
                        var dsdObject = mainTableItem.MutableInstance as IDataStructureMutableObject;

                        removeWorkingAnnotation(dsdObject, nAnnotations);
                        orderSdmxObject.AddDataStructure(dsdObject.ImmutableInstance);
                        break;

                    case SdmxStructureEnumType.AgencyScheme:
                        var agencyScheme = mainTableItem.MutableInstance as IAgencySchemeMutableObject;

                        removeWorkingAnnotation(agencyScheme, nAnnotations);

                        orderSdmxObject.AddAgencyScheme(agencyScheme.ImmutableInstance);

                        break;

                    case SdmxStructureEnumType.ContentConstraint:
                        var contentConstraint = mainTableItem.MutableInstance as IContentConstraintMutableObject;

                        removeWorkingAnnotation(contentConstraint, nAnnotations);

                        var listItemConstraint = new List<IConstraintMutableObject>();
                        orderSdmxObject.AddContentConstraintObject(contentConstraint.ImmutableInstance);

                        break;

                    case SdmxStructureEnumType.HierarchicalCodelist:
                        
                        var hierarchical = mainTableItem.MutableInstance as IHierarchicalCodelistMutableObject;
                        removeWorkingAnnotation(hierarchical, nAnnotations);
                        
                        orderSdmxObject.AddHierarchicalCodelist(hierarchical.ImmutableInstance);
                        break;

                    case SdmxStructureEnumType.Categorisation:
                        var categorisation = mainTableItem.MutableInstance as ICategorisationMutableObject;
                        removeWorkingAnnotation(categorisation, nAnnotations);
                        orderSdmxObject.AddCategorisation(categorisation.ImmutableInstance);
                        break;

                    case SdmxStructureEnumType.DataProviderScheme:
                        var dataProvider = mainTableItem.MutableInstance as IDataProviderSchemeMutableObject;
                        removeWorkingAnnotation(dataProvider, nAnnotations);

                        var listItemDP = new List<IDataProviderMutableObject>();
                        foreach (var myCode in dataProvider.Items)
                        {
                            listItemDP.Add(myCode);
                        }

                        foreach (var myCode in dataProvider.Items)
                        {
                            if (myCode.Annotations.Count == 0)
                            {
                                annotations = false;
                                break;
                            }
                        }

                        var annotationDataProviderScheme = new Utility.SdmxUtils.AnnotationCompare(mainTableItem.StructureType.EnumType, nAnnotations, lang);
                        if (annotations == true)
                        {
                            listItemDP.Sort(annotationDataProviderScheme);
                        }

                        for (int i = 0; i <= listItemDP.Count - 1; i++)
                        {
                            dataProvider.Items[i] = listItemDP[i];
                        }
                        
                        orderSdmxObject.AddDataProviderScheme(dataProvider.ImmutableInstance);

                        break;

                    case SdmxStructureEnumType.DataConsumerScheme:
                        var dataConsumer = mainTableItem.MutableInstance as IDataConsumerSchemeMutableObject;
                        removeWorkingAnnotation(dataConsumer, nAnnotations);

                        var listItemDC = new List<IDataConsumerMutableObject>();
                        foreach (var myCode in dataConsumer.Items)
                        {
                            listItemDC.Add(myCode);
                        }

                        foreach (var myCode in dataConsumer.Items)
                        {
                            if (myCode.Annotations.Count == 0)
                            {
                                annotations = false;
                                break;
                            }
                        }

                        var annotationDataConsumerScheme = new Utility.SdmxUtils.AnnotationCompare(mainTableItem.StructureType.EnumType, nAnnotations, lang);
                        if (annotations == true)
                        {
                            listItemDC.Sort(annotationDataConsumerScheme);
                        }

                        for (int i = 0; i <= listItemDC.Count - 1; i++)
                        {
                            dataConsumer.Items[i] = listItemDC[i];
                        }

                        orderSdmxObject.AddDataConsumerScheme(dataConsumer.ImmutableInstance);

                        break;

                    case SdmxStructureEnumType.OrganisationUnitScheme:
                        var organizationUnit = mainTableItem.MutableInstance as IOrganisationUnitSchemeMutableObject;
                        removeWorkingAnnotation(organizationUnit, nAnnotations);

                        var listItemOU = new List<IOrganisationUnitMutableObject>();
                        foreach (var myCode in organizationUnit.Items)
                        {
                            listItemOU.Add(myCode);
                        }

                        foreach (var myCode in organizationUnit.Items)
                        {
                            if (myCode.Annotations.Count == 0)
                            {
                                annotations = false;
                                break;
                            }
                        }

                        var annotationCompareOrganisation = new Utility.SdmxUtils.AnnotationCompare(mainTableItem.StructureType.EnumType, nAnnotations, lang);
                        if (annotations == true)
                        {
                            listItemOU.Sort(annotationCompareOrganisation);
                        }

                        for (int i = 0; i <= listItemOU.Count - 1; i++)
                        {
                            organizationUnit.Items[i] = listItemOU[i];
                        }

                        orderSdmxObject.AddOrganisationUnitScheme(organizationUnit.ImmutableInstance);

                        break;

                    case SdmxStructureEnumType.StructureSet:
                        var structureSet = mainTableItem.MutableInstance as IStructureSetMutableObject;
                        removeWorkingAnnotation(structureSet, nAnnotations);

                        orderSdmxObject.AddStructureSet(structureSet.ImmutableInstance);

                        break;

                    case SdmxStructureEnumType.ProvisionAgreement:
                        orderSdmxObject.AddProvisionAgreement((mainTableItem.MutableInstance as IProvisionAgreementMutableObject).ImmutableInstance);
                        break;
                    case SdmxStructureEnumType.Registration:
                        orderSdmxObject.AddRegistration((mainTableItem.MutableInstance as IRegistrationMutableObject).ImmutableInstance);
                        break;
                    case SdmxStructureEnumType.Msd:
                        orderSdmxObject.AddMetadataStructure((mainTableItem.MutableInstance as IMetadataStructureDefinitionMutableObject).ImmutableInstance);
                        break;
                    case SdmxStructureEnumType.MetadataFlow:
                        orderSdmxObject.AddMetadataFlow((mainTableItem.MutableInstance as IMetadataFlowMutableObject).ImmutableInstance);
                        break;
                    default:
                        break;
                }
            }
            return orderSdmxObject;
        }



        static public Stream ConvertArtefacts(SdmxStructureEnumType structureEnumType, ISdmxObjects sdmxObject, string exportType, string separator, string delimiter, string lang, NodeConfig.nAnnotations nAnnotations)
        {
            switch (exportType.ToUpperInvariant())
            {
                case "STRUCTURE20":
                    return GenerateSDMXFile(sdmxObject, StructureOutputFormatEnumType.SdmxV2StructureDocument);
                case "STRUCTURE":
                    return GenerateSDMXFile(sdmxObject, StructureOutputFormatEnumType.SdmxV21StructureDocument);
                case "RDF":
                    return GenerateRDFFile(sdmxObject);
                case "CSV":
                    var dt = new DataTable();
                    AddExportColumns(dt, structureEnumType);
                    PopolateDataTable(dt, structureEnumType, sdmxObject, lang, nAnnotations);

                    string _separator = separator.Trim() == "" ? ";" : separator.Trim();

                    return GenerateCSVFile(
                        dt,
                        _separator,
                        delimiter
                    );

                default:
                    return null;
            }
        }

        public static MemoryStream GenerateRTFFile(ISdmxObjects sdmxObjects, CultureInfo language, bool includeReference)
        {
            if (!sdmxObjects.HasDataStructures)
            {
                return null;
            }

            IDataStructureObject dsd = sdmxObjects.DataStructures.First();
            IConceptSchemeObject cs;
            var lang = language.TwoLetterISOLanguageName;
            ResourcesLanguage.SetLanguage(lang);

            var doc = new RtfDocument(PaperSize.A4, PaperOrientation.Landscape, Lcid.English);

            // Create fonts and colors for later use
            var times = doc.CreateFont("Times New Roman");
            var courier = doc.CreateFont("Courier New");
            var gray = doc.CreateColor(new RtfColor("BABABA"));
            var darkGray = doc.CreateColor(new RtfColor("AAAAAA"));

            int tableWidth = 750;

            #region /////////////////////////////////////// DSD TABLE HEADER //////////////////////////////

            RtfCharFormat cf;
            RtfParagraph parAppo;

            RtfTable DSDTable = doc.AddTable(4, 4, tableWidth, 12);
            DSDTable.Margins[Direction.Bottom] = 20;
            DSDTable.SetInnerBorder(BorderStyle.Single, 1f);
            DSDTable.SetOuterBorder(BorderStyle.Single, 1f);

            DSDTable.Merge(0, 0, 1, 4);

            addParagraph(DSDTable, 0, 0, ResourcesLanguage.DataStructure, darkGray, FontStyleFlag.Bold);
            addParagraph(DSDTable, 1, 0, ResourcesLanguage.NameDescription, gray, FontStyleFlag.Bold);
            addParagraph(DSDTable, 1, 1, ResourcesLanguage.Id, gray, FontStyleFlag.Bold);
            addParagraph(DSDTable, 1, 2, ResourcesLanguage.Agency, gray, FontStyleFlag.Bold);
            addParagraph(DSDTable, 1, 3, ResourcesLanguage.Version, gray, FontStyleFlag.Bold);

            #endregion

            #region ////////// DSD TABLE DATA //////////

            // Row 1 Name
            parAppo = DSDTable.Cell(2, 0).AddParagraph();
            parAppo.SetText(DownloadMetadata.GetNameableName(dsd, lang));

            parAppo = DSDTable.Cell(2, 1).AddParagraph();
            parAppo.SetText(dsd.Id);

            parAppo = DSDTable.Cell(2, 2).AddParagraph();
            parAppo.SetText(dsd.AgencyId);

            parAppo = DSDTable.Cell(2, 3).AddParagraph();
            parAppo.SetText(dsd.Version);

            // Row 2 Description
            parAppo = DSDTable.Cell(3, 0).AddParagraph();
            if (DownloadMetadata.GetNameableDescription(dsd, lang) != string.Empty)
            {
                parAppo.SetText(DownloadMetadata.GetNameableDescription(dsd, lang));
            }

            #endregion

            doc.AddParagraph();

            #region /////////////////////////////////////// DSD TABLE DIMENSIONS //////////////////////////////

            RtfTable DSDDim = doc.AddTable(dsd.DimensionList.Dimensions.Count() + 4, 10, tableWidth, 12);
            DSDDim.Margins[Direction.Bottom] = 20;
            DSDDim.SetInnerBorder(BorderStyle.Single, 1f);
            DSDDim.SetOuterBorder(BorderStyle.Single, 1f);

            DSDDim.Merge(0, 0, 1, 10);
            addParagraph(DSDDim, 0, 0, ResourcesLanguage.Dimension, darkGray, FontStyleFlag.Bold);

            DSDDim.Merge(1, 0, 1, 5);
            addParagraph(DSDDim, 1, 0, ResourcesLanguage.Nav_Conceptschemes, gray, FontStyleFlag.Bold);

            DSDDim.Merge(1, 5, 1, 4);
            addParagraph(DSDDim, 1, 5, ResourcesLanguage.Representation, gray, FontStyleFlag.Bold);

            DSDDim.Merge(1, 9, 3, 1);
            addParagraph(DSDDim, 1, 9, ResourcesLanguage.DimensionType, gray, FontStyleFlag.Bold);

            DSDDim.Merge(2, 0, 2, 1);
            addParagraph(DSDDim, 2, 0, ResourcesLanguage.Id, gray, FontStyleFlag.Bold);

            DSDDim.Merge(2, 1, 2, 1);
            addParagraph(DSDDim, 2, 1, ResourcesLanguage.Name, gray, FontStyleFlag.Bold);

            DSDDim.Merge(2, 2, 1, 3);
            addParagraph(DSDDim, 2, 2, ResourcesLanguage.SchemeConcepts, gray, FontStyleFlag.Bold);

            DSDDim.Merge(2, 5, 1, 3);
            addParagraph(DSDDim, 2, 5, ResourcesLanguage.Codelist, gray, FontStyleFlag.Bold);

            DSDDim.Merge(2, 8, 2, 1);
            addParagraph(DSDDim, 2, 8, ResourcesLanguage.TextFormat, gray, FontStyleFlag.Bold);

            DSDDim.Merge(3, 2, 1, 1);
            addParagraph(DSDDim, 3, 2, ResourcesLanguage.Id, gray, FontStyleFlag.Bold);

            DSDDim.Merge(3, 3, 1, 1);
            addParagraph(DSDDim, 3, 3, ResourcesLanguage.Version, gray, FontStyleFlag.Bold);

            DSDDim.Merge(3, 4, 1, 1);
            addParagraph(DSDDim, 3, 4, ResourcesLanguage.Agency, gray, FontStyleFlag.Bold);

            DSDDim.Merge(3, 5, 1, 1);
            addParagraph(DSDDim, 3, 5, ResourcesLanguage.Id, gray, FontStyleFlag.Bold);

            DSDDim.Merge(3, 6, 1, 1);
            addParagraph(DSDDim, 3, 6, ResourcesLanguage.Version, gray, FontStyleFlag.Bold);

            DSDDim.Merge(3, 7, 1, 1);
            addParagraph(DSDDim, 3, 7, ResourcesLanguage.Agency, gray, FontStyleFlag.Bold);

            #endregion

            #region /////////////////////////// DSD DIMENSION DATA

            int rowDimCount = 3;

            foreach (var dimension in dsd.DimensionList.Dimensions)
            {
                string TextFormat = String.Empty;

                ++rowDimCount;

                if (!dimension.HasCodedRepresentation())
                {
                    TextFormat = "String";
                }
                else if (dimension.Representation.TextFormat != null)
                {
                    TextFormat = dimension.Representation.TextFormat.TextType.EnumType.ToString();
                }

                cs = sdmxObjects.ConceptSchemes.Where(ci => ci.Id == dimension.ConceptRef.MaintainableId
                                                    && ci.AgencyId == dimension.ConceptRef.AgencyId
                                                    && ci.Version == dimension.ConceptRef.Version).FirstOrDefault();

                if (cs != null)
                {
                    parAppo = DSDDim.Cell(rowDimCount, 0).AddParagraph();
                    parAppo.SetText(dimension.ConceptRef.FullId);

                    parAppo = DSDDim.Cell(rowDimCount, 1).AddParagraph();
                    parAppo.SetText(DownloadMetadata.GetNameableName(cs, lang));

                    parAppo = DSDDim.Cell(rowDimCount, 2).AddParagraph();
                    parAppo.SetText(cs.Id);

                    parAppo = DSDDim.Cell(rowDimCount, 3).AddParagraph();
                    parAppo.SetText(cs.Version);

                    parAppo = DSDDim.Cell(rowDimCount, 4).AddParagraph();
                    parAppo.SetText(cs.AgencyId);
                }

                if (dimension.HasCodedRepresentation())
                {
                    parAppo = DSDDim.Cell(rowDimCount, 5).AddParagraph();
                    parAppo.SetText(dimension.Representation.Representation.MaintainableId);

                    parAppo = DSDDim.Cell(rowDimCount, 6).AddParagraph();
                    parAppo.SetText(dimension.Representation.Representation.Version);

                    parAppo = DSDDim.Cell(rowDimCount, 7).AddParagraph();
                    parAppo.SetText(dimension.Representation.Representation.AgencyId);

                }
                else
                {
                    parAppo = DSDDim.Cell(rowDimCount, 5).AddParagraph();
                    parAppo.SetText("");

                    parAppo = DSDDim.Cell(rowDimCount, 6).AddParagraph();
                    parAppo.SetText("");

                    parAppo = DSDDim.Cell(rowDimCount, 7).AddParagraph();
                    parAppo.SetText("");
                }

                parAppo = DSDDim.Cell(rowDimCount, 8).AddParagraph();
                parAppo.SetText(TextFormat);

                parAppo = DSDDim.Cell(rowDimCount, 9).AddParagraph();

                if (dimension.TimeDimension)
                {
                    parAppo.SetText("TimeDimension");
                }
                else if (dimension.FrequencyDimension)
                {
                    parAppo.SetText("FrequencyDimension");
                }
                else if (dimension.MeasureDimension)
                {
                    parAppo.SetText("MeasureDimension");
                }
                else
                {
                    parAppo.SetText("Dimension");
                }

            }

            #endregion

            doc.AddParagraph();

            #region /////////////////////////////////////// DSD TABLE MEASURES //////////////////////////////

            RtfTable DSDMeasure = doc.AddTable(5, 12, tableWidth, 12);
            DSDMeasure.Margins[Direction.Bottom] = 20;
            DSDMeasure.SetInnerBorder(BorderStyle.Single, 1f);
            DSDMeasure.SetOuterBorder(BorderStyle.Single, 1f);

            DSDMeasure.Merge(0, 0, 1, 12);
            addParagraph(DSDMeasure, 0, 0, ResourcesLanguage.Measures, darkGray, FontStyleFlag.Bold);

            DSDMeasure.Merge(1, 0, 3, 1);
            addParagraph(DSDMeasure, 1, 0, ResourcesLanguage.Type, gray, FontStyleFlag.Bold);

            DSDMeasure.Merge(1, 1, 1, 5);
            addParagraph(DSDMeasure, 1, 1, ResourcesLanguage.Concepts, gray, FontStyleFlag.Bold);

            DSDMeasure.Merge(1, 6, 1, 4);
            addParagraph(DSDMeasure, 1, 6, ResourcesLanguage.Representation, gray, FontStyleFlag.Bold);

            DSDMeasure.Merge(1, 10, 3, 1);
            addParagraph(DSDMeasure, 1, 10, ResourcesLanguage.MeasureDimension, gray, FontStyleFlag.Bold);

            DSDMeasure.Merge(1, 11, 3, 1);
            addParagraph(DSDMeasure, 1, 11, ResourcesLanguage.Ab_Code, gray, FontStyleFlag.Bold);

            DSDMeasure.Merge(2, 1, 2, 1);
            addParagraph(DSDMeasure, 2, 1, ResourcesLanguage.Id, gray, FontStyleFlag.Bold);

            DSDMeasure.Merge(2, 2, 2, 1);
            addParagraph(DSDMeasure, 2, 2, ResourcesLanguage.Name, gray, FontStyleFlag.Bold);

            DSDMeasure.Merge(2, 3, 1, 3);
            addParagraph(DSDMeasure, 2, 3, ResourcesLanguage.SchemeConcepts, gray, FontStyleFlag.Bold);

            DSDMeasure.Merge(2, 6, 1, 3);
            addParagraph(DSDMeasure, 2, 6, ResourcesLanguage.Codelist, gray, FontStyleFlag.Bold);

            DSDMeasure.Merge(2, 9, 2, 1);
            addParagraph(DSDMeasure, 2, 9, ResourcesLanguage.TextFormat, gray, FontStyleFlag.Bold);

            DSDMeasure.Merge(3, 3, 1, 1);
            addParagraph(DSDMeasure, 3, 3, ResourcesLanguage.Id, gray, FontStyleFlag.Bold);

            DSDMeasure.Merge(3, 4, 1, 1);
            addParagraph(DSDMeasure, 3, 4, ResourcesLanguage.Version, gray, FontStyleFlag.Bold);

            DSDMeasure.Merge(3, 5, 1, 1);
            addParagraph(DSDMeasure, 3, 5, ResourcesLanguage.Agency, gray, FontStyleFlag.Bold);

            DSDMeasure.Merge(3, 6, 1, 1);
            addParagraph(DSDMeasure, 3, 6, ResourcesLanguage.Id, gray, FontStyleFlag.Bold);

            DSDMeasure.Merge(3, 7, 1, 1);
            addParagraph(DSDMeasure, 3, 7, ResourcesLanguage.Version, gray, FontStyleFlag.Bold);

            DSDMeasure.Merge(3, 8, 1, 1);
            addParagraph(DSDMeasure, 3, 8, ResourcesLanguage.Agency, gray, FontStyleFlag.Bold);

            #endregion

            #region /////////////////////////// DSD MEASURE DATA

            if (dsd.PrimaryMeasure != null)
            {
                int rowMeasureCount = 3;

                ICrossReference conceptRef = dsd.PrimaryMeasure.ConceptRef;

                cs = sdmxObjects.ConceptSchemes.Where(ci => ci.Id == conceptRef.MaintainableId
                                                    && ci.AgencyId == conceptRef.AgencyId
                                                    && ci.Version == conceptRef.Version).FirstOrDefault();

                string clID = "", clVer = "", clAgency = "";

                if (dsd.PrimaryMeasure.Representation != null && dsd.PrimaryMeasure.Representation.Representation != null)
                {
                    ICrossReference cl = dsd.PrimaryMeasure.Representation.Representation;
                    clID = cl.MaintainableId;
                    clAgency = cl.AgencyId;
                    clVer = cl.Version;
                }

                ++rowMeasureCount;

                parAppo = DSDMeasure.Cell(rowMeasureCount, 0).AddParagraph();
                parAppo.SetText("Primary");

                parAppo = DSDMeasure.Cell(rowMeasureCount, 1).AddParagraph();
                parAppo.SetText(conceptRef.FullId);

                if (cs != null)
                {
                    parAppo = DSDMeasure.Cell(rowMeasureCount, 2).AddParagraph();
                    parAppo.SetText(GetNameableName(cs, lang));

                    parAppo = DSDMeasure.Cell(rowMeasureCount, 3).AddParagraph();
                    parAppo.SetText(cs.Id);

                    parAppo = DSDMeasure.Cell(rowMeasureCount, 4).AddParagraph();
                    parAppo.SetText(cs.Version);

                    parAppo = DSDMeasure.Cell(rowMeasureCount, 5).AddParagraph();
                    parAppo.SetText(cs.AgencyId);
                }

                parAppo = DSDMeasure.Cell(rowMeasureCount, 6).AddParagraph();
                parAppo.SetText(clID);

                parAppo = DSDMeasure.Cell(rowMeasureCount, 7).AddParagraph();
                parAppo.SetText(clVer);

                parAppo = DSDMeasure.Cell(rowMeasureCount, 8).AddParagraph();
                parAppo.SetText(clAgency);

                parAppo = DSDMeasure.Cell(rowMeasureCount, 9).AddParagraph();
                parAppo.SetText("");

                parAppo = DSDMeasure.Cell(rowMeasureCount, 10).AddParagraph();
                parAppo.SetText("");

                parAppo = DSDMeasure.Cell(rowMeasureCount, 11).AddParagraph();
                parAppo.SetText("");
            }

            #endregion

            doc.AddParagraph();

            #region /////////////////////////////////////// DSD TABLE ATTRIBUTES //////////////////////////////

            RtfTable DSDAttr = doc.AddTable(dsd.Attributes.Count() + 4, 12, tableWidth, 12);
            DSDAttr.Margins[Direction.Bottom] = 20;
            DSDAttr.SetInnerBorder(BorderStyle.Single, 1f);
            DSDAttr.SetOuterBorder(BorderStyle.Single, 1f);

            DSDAttr.Merge(0, 0, 1, 12);
            addParagraph(DSDAttr, 0, 0, ResourcesLanguage.Dsd_attr, darkGray, FontStyleFlag.Bold);

            DSDAttr.Merge(1, 0, 3, 1);
            addParagraph(DSDAttr, 1, 0, ResourcesLanguage.AttLevel, gray, FontStyleFlag.Bold);

            DSDAttr.Merge(1, 1, 1, 5);
            addParagraph(DSDAttr, 1, 1, ResourcesLanguage.Nav_Conceptschemes, gray, FontStyleFlag.Bold);

            DSDAttr.Merge(1, 6, 1, 4);
            addParagraph(DSDAttr, 1, 6, ResourcesLanguage.Representation, gray, FontStyleFlag.Bold);

            DSDAttr.Merge(1, 10, 3, 1);
            addParagraph(DSDAttr, 1, 10, ResourcesLanguage.AttributeType, gray, FontStyleFlag.Bold);

            DSDAttr.Merge(1, 11, 3, 1);
            addParagraph(DSDAttr, 1, 11, ResourcesLanguage.AssStatus, gray, FontStyleFlag.Bold);

            DSDAttr.Merge(2, 1, 2, 1);
            addParagraph(DSDAttr, 2, 1, ResourcesLanguage.Id, gray, FontStyleFlag.Bold);

            DSDAttr.Merge(2, 2, 2, 1);
            addParagraph(DSDAttr, 2, 2, ResourcesLanguage.Name, gray, FontStyleFlag.Bold);

            DSDAttr.Merge(2, 3, 1, 3);
            addParagraph(DSDAttr, 2, 3, ResourcesLanguage.SchemeConcepts, gray, FontStyleFlag.Bold);

            DSDAttr.Merge(2, 6, 1, 3);
            addParagraph(DSDAttr, 2, 6, ResourcesLanguage.Codelist, gray, FontStyleFlag.Bold);

            DSDAttr.Merge(2, 9, 2, 1);
            addParagraph(DSDAttr, 2, 9, ResourcesLanguage.TextFormat, gray, FontStyleFlag.Bold);

            DSDAttr.Merge(3, 3, 1, 1);
            addParagraph(DSDAttr, 3, 3, ResourcesLanguage.Id, gray, FontStyleFlag.Bold);

            DSDAttr.Merge(3, 4, 1, 1);
            addParagraph(DSDAttr, 3, 4, ResourcesLanguage.Version, gray, FontStyleFlag.Bold);

            DSDAttr.Merge(3, 5, 1, 1);
            addParagraph(DSDAttr, 3, 5, ResourcesLanguage.Agency, gray, FontStyleFlag.Bold);

            DSDAttr.Merge(3, 6, 1, 1);
            addParagraph(DSDAttr, 3, 6, ResourcesLanguage.Id, gray, FontStyleFlag.Bold);

            DSDAttr.Merge(3, 7, 1, 1);
            addParagraph(DSDAttr, 3, 7, ResourcesLanguage.Version, gray, FontStyleFlag.Bold);

            DSDAttr.Merge(3, 8, 1, 1);
            addParagraph(DSDAttr, 3, 8, ResourcesLanguage.Agency, gray, FontStyleFlag.Bold);

            #endregion

            #region /////////////////////////// DSD ATTRIBUTES DATA

            if (dsd.AttributeList != null)
            {
                int rowMAttrCount = 3;

                foreach (IAttributeObject attribute in dsd.AttributeList.Attributes)
                {
                    string TextFormat = String.Empty;
                    string CodeList = String.Empty;
                    string clID = "", clVer = "", clAgency = "";

                    ++rowMAttrCount;

                    if (attribute.Representation != null && attribute.Representation.Representation != null)
                    {
                        ICrossReference cl = attribute.Representation.Representation;
                        clID = cl.MaintainableId;
                        clAgency = cl.AgencyId;
                        clVer = cl.Version;
                        if (attribute.Representation.TextFormat != null)
                        {
                            TextFormat = attribute.Representation.TextFormat.TextType.EnumType.ToString();
                        }
                    }

                    cs = sdmxObjects.ConceptSchemes.Where(ci => ci.Id == attribute.ConceptRef.MaintainableId
                                    && ci.AgencyId == attribute.ConceptRef.AgencyId
                                    && ci.Version == attribute.ConceptRef.Version).FirstOrDefault();

                    parAppo = DSDAttr.Cell(rowMAttrCount, 0).AddParagraph();
                    parAppo.SetText(attribute.AttachmentLevel.ToString());

                    parAppo = DSDAttr.Cell(rowMAttrCount, 1).AddParagraph();
                    parAppo.SetText(attribute.ConceptRef.FullId);

                    if (cs != null)
                    {
                        parAppo = DSDAttr.Cell(rowMAttrCount, 2).AddParagraph();
                        parAppo.SetText(DownloadMetadata.GetNameableName(cs, lang));

                        parAppo = DSDAttr.Cell(rowMAttrCount, 3).AddParagraph();
                        parAppo.SetText(cs.Id);

                        parAppo = DSDAttr.Cell(rowMAttrCount, 4).AddParagraph();
                        parAppo.SetText(cs.Version);

                        parAppo = DSDAttr.Cell(rowMAttrCount, 5).AddParagraph();
                        parAppo.SetText(cs.AgencyId);
                    }

                    parAppo = DSDAttr.Cell(rowMAttrCount, 6).AddParagraph();
                    parAppo.SetText(clID);

                    parAppo = DSDAttr.Cell(rowMAttrCount, 7).AddParagraph();
                    parAppo.SetText(clVer);

                    parAppo = DSDAttr.Cell(rowMAttrCount, 8).AddParagraph();
                    parAppo.SetText(clAgency);

                    parAppo = DSDAttr.Cell(rowMAttrCount, 9).AddParagraph();
                    parAppo.SetText(TextFormat);

                    parAppo = DSDAttr.Cell(rowMAttrCount, 10).AddParagraph();
                    parAppo.SetText("");

                    parAppo = DSDAttr.Cell(rowMAttrCount, 11).AddParagraph();
                    parAppo.SetText(attribute.AssignmentStatus);
                }
            }

            #endregion

            doc.AddParagraph();
            if (!includeReference) {
                return new MemoryStream(Encoding.ASCII.GetBytes(doc.Render()));
            }

            #region ////////////////////// CODELISTS /////////////////////

            if (sdmxObjects.HasCodelists)
            {
                RtfTable csTable;

                foreach (ICodelistObject cl in sdmxObjects.Codelists)
                {
                    doc.AddParagraph();

                    csTable = doc.AddTable(cl.Items.Count() + 5, 3, tableWidth, 12);

                    csTable.Margins[Direction.Bottom] = 20;
                    csTable.SetInnerBorder(BorderStyle.Single, 1f);
                    csTable.SetOuterBorder(BorderStyle.Single, 1f);

                    csTable.Merge(0, 0, 1, 3);
                    addParagraph(csTable, 0, 0, ResourcesLanguage.Codelist, darkGray, FontStyleFlag.Bold);
                    addParagraph(csTable, 1, 0, ResourcesLanguage.Id, gray, FontStyleFlag.Bold);
                    addParagraph(csTable, 1, 1, ResourcesLanguage.Agency, gray, FontStyleFlag.Bold);
                    addParagraph(csTable, 1, 2, ResourcesLanguage.Agency, gray, FontStyleFlag.Bold);

                    parAppo = csTable.Cell(2, 0).AddParagraph();
                    parAppo.SetText(cl.Id);

                    parAppo = csTable.Cell(2, 1).AddParagraph();
                    parAppo.SetText(cl.AgencyId);

                    parAppo = csTable.Cell(2, 2).AddParagraph();
                    parAppo.SetText(cl.Version);

                    csTable.Merge(3, 0, 1, 3);
                    parAppo = csTable.Cell(3, 0).AddParagraph();
                    csTable.Cell(3, 0).BackgroundColor = darkGray;
                    parAppo.SetText(ResourcesLanguage.Codes);
                    parAppo.Alignment = Align.Center;
                    cf = parAppo.AddCharFormat();
                    cf.FontStyle.AddStyle(FontStyleFlag.Bold);

                    addParagraph(csTable, 4, 0, ResourcesLanguage.Id, gray, FontStyleFlag.Bold);
                    addParagraph(csTable, 4, 1, ResourcesLanguage.Name, gray, FontStyleFlag.Bold);
                    addParagraph(csTable, 4, 2, ResourcesLanguage.Parent, gray, FontStyleFlag.Bold);

                    int rowCodeCount = 5;

                    foreach (ICode code in cl.Items)
                    {
                        parAppo = csTable.Cell(rowCodeCount, 0).AddParagraph();
                        parAppo.SetText(code.Id);

                        parAppo = csTable.Cell(rowCodeCount, 1).AddParagraph();
                        parAppo.SetText(DownloadMetadata.GetNameableName(code, lang));

                        parAppo = csTable.Cell(rowCodeCount, 2).AddParagraph();
                        parAppo.SetText(code.ParentCode);
                        rowCodeCount++;
                    }
                }
            }

            #endregion

            doc.AddParagraph();

            #region ////////////////////// CONCEPT SCHEMES /////////////////////

            if (sdmxObjects.HasConceptSchemes)
            {
                RtfTable csTable;

                foreach (IConceptSchemeObject csc in sdmxObjects.ConceptSchemes)
                {
                    doc.AddParagraph();

                    csTable = doc.AddTable(csc.Items.Count() + 5, 3, tableWidth, 12);

                    csTable.Margins[Direction.Bottom] = 20;
                    csTable.SetInnerBorder(BorderStyle.Single, 1f);
                    csTable.SetOuterBorder(BorderStyle.Single, 1f);

                    csTable.Merge(0, 0, 1, 3);
                    addParagraph(csTable, 0, 0, ResourcesLanguage.SchemeConcepts, darkGray, FontStyleFlag.Bold);

                    parAppo = csTable.Cell(1, 0).AddParagraph();
                    addParagraph(csTable, 1, 0, ResourcesLanguage.Id, gray, FontStyleFlag.Bold);

                    parAppo = csTable.Cell(1, 1).AddParagraph();
                    addParagraph(csTable, 1, 1, ResourcesLanguage.Agency, gray, FontStyleFlag.Bold);

                    parAppo = csTable.Cell(1, 2).AddParagraph();
                    addParagraph(csTable, 1, 2, ResourcesLanguage.Version, gray, FontStyleFlag.Bold);

                    parAppo = csTable.Cell(2, 0).AddParagraph();
                    parAppo.SetText(csc.Id);

                    parAppo = csTable.Cell(2, 1).AddParagraph();
                    parAppo.SetText(csc.AgencyId);

                    parAppo = csTable.Cell(2, 2).AddParagraph();
                    parAppo.SetText(csc.Version);

                    csTable.Merge(3, 0, 1, 3);
                    addParagraph(csTable, 3, 0, ResourcesLanguage.Nav_Conceptschemes, gray, FontStyleFlag.Bold);
                    addParagraph(csTable, 4, 0, ResourcesLanguage.Id, gray, FontStyleFlag.Bold);
                    addParagraph(csTable, 4, 1, ResourcesLanguage.Name, gray, FontStyleFlag.Bold);
                    addParagraph(csTable, 4, 2, ResourcesLanguage.Parent, gray, FontStyleFlag.Bold);

                    int rowCodeCount = 4;

                    foreach (IConceptObject code in csc.Items)
                    {
                        ++rowCodeCount;

                        parAppo = csTable.Cell(rowCodeCount, 0).AddParagraph();
                        parAppo.SetText(code.Id);

                        parAppo = csTable.Cell(rowCodeCount, 1).AddParagraph();
                        parAppo.SetText(DownloadMetadata.GetNameableName(code, lang));

                        parAppo = csTable.Cell(rowCodeCount, 2).AddParagraph();
                        parAppo.SetText(code.ParentConcept);
                    }
                }
            }

            #endregion

            return new MemoryStream(Encoding.ASCII.GetBytes(doc.Render()));
        }

        private static MemoryStream GenerateSDMXFile(ISdmxObjects sdmxObjects, StructureOutputFormatEnumType version)
        {
            StructureWriterManager swm = new StructureWriterManager();

            StructureOutputFormat soFormat = StructureOutputFormat.GetFromEnum(version);
            IStructureFormat outputFormat = new SdmxStructureFormat(soFormat);

            var memoryStream = new MemoryStream();

            swm.WriteStructures(sdmxObjects, outputFormat, memoryStream);

            byte[] bytesInStream = memoryStream.ToArray();

            memoryStream.Close();

            return new MemoryStream(bytesInStream);

        }

        private static MemoryStream GenerateRDFFile(ISdmxObjects sdmxObjects)
        {
            MemoryStream stream = new MemoryStream();
            RDFStructureWriterEngine swe = new RDFStructureWriterEngine(stream, Encoding.UTF8);
            swe.WriteStructures(sdmxObjects);

            byte[] bytesInStream = stream.ToArray();

            stream.Close();

            return new MemoryStream(bytesInStream);
        }

        private static MemoryStream GenerateCSVFile(DataTable dt, string separator, string delimiter)
        {
            byte[] bytesInStream = null;

            using (MemoryStream tempStream = new MemoryStream())
            {
                using (StreamWriter writer = new StreamWriter(tempStream))
                {
                    WriteDataTable(dt, writer, true, separator, delimiter);
                }

                bytesInStream = tempStream.ToArray();
            }

            return new MemoryStream(bytesInStream);
        }

        private static void WriteDataTable(DataTable sourceTable, TextWriter writer, bool includeHeaders, string separator, string textDelimiter)
        {
            if (includeHeaders)
            {
                List<string> headerValues = new List<string>();
                foreach (DataColumn column in sourceTable.Columns)
                {
                    if (column.ColumnName.StartsWith("ID"))
                    {
                        headerValues.Add("Id" + column.ColumnName.Substring(2));
                    }
                    else
                    {
                        headerValues.Add(column.ColumnName);
                    }
                }
                headerValues = headerValues.Select(o => textDelimiter + o.ToString() + textDelimiter).ToList();
                writer.WriteLine(String.Join(separator, headerValues.ToArray()));
            }

            string[] items = null;
            foreach (DataRow row in sourceTable.Rows)
            {
                items = row.ItemArray.Select(o => o.ToString()).ToArray();
                if (textDelimiter != string.Empty)
                {
                    items = row.ItemArray.Select(o => textDelimiter + o.ToString() + textDelimiter).ToArray();
                }

                writer.WriteLine(String.Join(separator, items));
            }
            writer.Flush();
        }

        private static void AddExportColumns(DataTable dt, SdmxStructureEnumType structureEnumType)
        {
            switch (structureEnumType)
            {
                case SdmxStructureEnumType.CodeList:
                case SdmxStructureEnumType.ConceptScheme:
                case SdmxStructureEnumType.CategoryScheme:
                    dt.Columns.Add("ID");
                    dt.Columns.Add("Name");
                    dt.Columns.Add("Description");
                    dt.Columns.Add("ParentCode");
                    dt.Columns.Add("Order");
                    dt.Columns.Add("FullName");
                    dt.Columns.Add("IsDefault");
                    break;
                case SdmxStructureEnumType.OrganisationUnitScheme:
                    dt.Columns.Add("ID");
                    dt.Columns.Add("Name");
                    dt.Columns.Add("Description");
                    dt.Columns.Add("ParentCode");
                    break;

                case SdmxStructureEnumType.AgencyScheme:
                case SdmxStructureEnumType.DataProviderScheme:
                case SdmxStructureEnumType.DataConsumerScheme:
                    dt.Columns.Add("ID");
                    dt.Columns.Add("Name");
                    dt.Columns.Add("Description");
                    break;
            }
        }

        private static void PopolateDataTable(DataTable dt, SdmxStructureEnumType structureEnumType, ISdmxObjects SdmxObject, string lang, NodeConfig.nAnnotations nAnnotations)
        {
            var annotationOrder = "";
            if (structureEnumType == SdmxStructureEnumType.CodeList)
            {
                annotationOrder = nAnnotations.CodelistsOrder;
            }
            else if (structureEnumType == SdmxStructureEnumType.ConceptScheme)
            {
                annotationOrder = nAnnotations.ConceptSchemesOrder;
            }
            else if (structureEnumType == SdmxStructureEnumType.CategoryScheme)
            {
                annotationOrder = nAnnotations.CategorySchemesOrder;
            }

            switch (structureEnumType)
            {
                case SdmxStructureEnumType.CodeList:

                    foreach (ICodelistObject codelist in SdmxObject.Codelists)
                    {
                        foreach (ICode code in codelist.Items)
                        {
                            var fullName = "";
                            var isDefault = "";
                            var orderValue = "";
                            if (code.Annotations != null)
                            {
                                foreach (var itemAnn in code.Annotations)
                                {
                                    if (itemAnn.Type != null && itemAnn.Type.Equals("DEFAULT", StringComparison.InvariantCultureIgnoreCase))
                                    {
                                        foreach (var itemValue in itemAnn.Text)
                                        {
                                            if (itemValue.Locale.Equals(lang, StringComparison.InvariantCultureIgnoreCase))
                                            {
                                                isDefault = itemValue.Value;
                                                break;
                                            }
                                        }
                                    }
                                    if (itemAnn.Type != null && itemAnn.Type.Equals("FULL_NAME", StringComparison.InvariantCultureIgnoreCase))
                                    {
                                        foreach (var itemValue in itemAnn.Text)
                                        {
                                            if (itemValue.Locale.Equals(lang, StringComparison.InvariantCultureIgnoreCase))
                                            {
                                                fullName = itemValue.Value;
                                                break;
                                            }
                                        }
                                    }
                                    if (!string.IsNullOrWhiteSpace(annotationOrder) && itemAnn.Type != null && itemAnn.Type.Equals(annotationOrder, StringComparison.InvariantCultureIgnoreCase))
                                    {
                                        foreach (var itemValue in itemAnn.Text)
                                        {
                                            if (itemValue.Locale.Equals(lang, StringComparison.InvariantCultureIgnoreCase))
                                            {
                                                orderValue = itemValue.Value;
                                                break;
                                            }
                                        }
                                    }
                                }
                            }
                            dt.Rows.Add(code.Id, GetNameableName(code, lang), GetNameableDescription(code, lang), code.ParentCode, orderValue, fullName, isDefault);
                        }
                        break;
                    }
                    break;

                case SdmxStructureEnumType.ConceptScheme:

                    foreach (IConceptSchemeObject cs in SdmxObject.ConceptSchemes)
                    {
                        foreach (IConceptObject concept in cs.Items)
                        {
                            var fullName = "";
                            var isDefault = "";
                            var orderValue = "";
                            if (concept.Annotations != null)
                            {
                                foreach (var itemAnn in concept.Annotations)
                                {
                                    if (itemAnn.Type != null && itemAnn.Type.Equals("DEFAULT", StringComparison.InvariantCultureIgnoreCase))
                                    {
                                        foreach (var itemValue in itemAnn.Text)
                                        {
                                            if (itemValue.Locale.Equals(lang, StringComparison.InvariantCultureIgnoreCase))
                                            {
                                                isDefault = itemValue.Value;
                                                break;
                                            }
                                        }
                                    }
                                    if (itemAnn.Type != null && itemAnn.Type.Equals("FULL_NAME", StringComparison.InvariantCultureIgnoreCase))
                                    {
                                        foreach (var itemValue in itemAnn.Text)
                                        {
                                            if (itemValue.Locale.Equals(lang, StringComparison.InvariantCultureIgnoreCase))
                                            {
                                                fullName = itemValue.Value;
                                                break;
                                            }
                                        }
                                    }
                                    if (!string.IsNullOrWhiteSpace(annotationOrder) && itemAnn.Type != null && itemAnn.Type.Equals(annotationOrder, StringComparison.InvariantCultureIgnoreCase))
                                    {
                                        foreach (var itemValue in itemAnn.Text)
                                        {
                                            if (itemValue.Locale.Equals(lang, StringComparison.InvariantCultureIgnoreCase))
                                            {
                                                orderValue = itemValue.Value;
                                                break;
                                            }
                                        }
                                    }
                                }
                            }
                            dt.Rows.Add(concept.Id, GetNameableName(concept, lang), GetNameableDescription(concept, lang), concept.ParentConcept, orderValue, fullName, isDefault);
                        }
                        break;
                    }
                    break;

                case SdmxStructureEnumType.CategoryScheme:

                    foreach (ICategorySchemeObject cs in SdmxObject.CategorySchemes)
                    {
                        foreach (ICategoryObject concept in cs.Items)
                        {
                            string completeSequence = concept.Parent.ToString().Split('=')[1].Split(')')[1];
                            if (!completeSequence.Equals(string.Empty))
                            {
                                completeSequence = completeSequence.Remove(0, 1);
                            }
                            var fullName = "";
                            var isDefault = "";
                            var orderValue = "";
                            if (concept.Annotations != null)
                            {
                                foreach (var itemAnn in concept.Annotations)
                                {
                                    if (itemAnn.Type != null && itemAnn.Type.Equals("DEFAULT", StringComparison.InvariantCultureIgnoreCase))
                                    {
                                        foreach (var itemValue in itemAnn.Text)
                                        {
                                            if (itemValue.Locale.Equals(lang, StringComparison.InvariantCultureIgnoreCase))
                                            {
                                                isDefault = itemValue.Value;
                                                break;
                                            }
                                        }
                                    }
                                    if (itemAnn.Type != null && itemAnn.Type.Equals("FULL_NAME", StringComparison.InvariantCultureIgnoreCase))
                                    {
                                        foreach (var itemValue in itemAnn.Text)
                                        {
                                            if (itemValue.Locale.Equals(lang, StringComparison.InvariantCultureIgnoreCase))
                                            {
                                                fullName = itemValue.Value;
                                                break;
                                            }
                                        }
                                    }
                                    if (!string.IsNullOrWhiteSpace(annotationOrder) && itemAnn.Type != null && itemAnn.Type.Equals(annotationOrder, StringComparison.InvariantCultureIgnoreCase))
                                    {
                                        foreach (var itemValue in itemAnn.Text)
                                        {
                                            if (itemValue.Locale.Equals(lang, StringComparison.InvariantCultureIgnoreCase))
                                            {
                                                orderValue = itemValue.Value;
                                                break;
                                            }
                                        }
                                    }
                                }
                            }
                            dt.Rows.Add(concept.Id, GetNameableName(concept, lang), GetNameableDescription(concept, lang), completeSequence, orderValue, fullName, isDefault);
                            if (concept.Items.Count != 0)
                            {
                                foreach (ICategoryObject subCode in concept.Items)
                                {
                                    RecursiveOnItems(subCode, ref dt, lang);
                                }
                            }
                        }
                        break;
                    }
                    break;

                case SdmxStructureEnumType.AgencyScheme:

                    foreach (IAgencyScheme agencyScheme in SdmxObject.AgenciesSchemes)
                    {
                        foreach (IAgency agency in agencyScheme.Items)
                        {
                            dt.Rows.Add(agency.Id, GetNameableName(agency, lang), GetNameableDescription(agency, lang));
                        }
                        break;
                    }
                    break;

                case SdmxStructureEnumType.DataProviderScheme:

                    foreach (IDataProviderScheme dataProviderScheme in SdmxObject.DataProviderSchemes)
                    {
                        foreach (var dataProvider in dataProviderScheme.Items)
                        {
                            dt.Rows.Add(dataProvider.Id, GetNameableName(dataProvider, lang), GetNameableDescription(dataProvider, lang));
                        }
                        break;
                    }
                    break;

                case SdmxStructureEnumType.DataConsumerScheme:

                    foreach (var dataConsumerScheme in SdmxObject.DataConsumerSchemes)
                    {
                        foreach (var dataConsumer in dataConsumerScheme.Items)
                        {
                            dt.Rows.Add(dataConsumer.Id, GetNameableName(dataConsumer, lang), GetNameableDescription(dataConsumer, lang));
                        }
                        break;
                    }
                    break;

                case SdmxStructureEnumType.OrganisationUnitScheme:

                    foreach (var organizationUnitScheme in SdmxObject.OrganisationUnitSchemes)
                    {
                        foreach (var oragnizationUnit in organizationUnitScheme.Items)
                        {
                            string completeSequence = oragnizationUnit.Parent.ToString().Split('=')[1].Split(')')[1];
                            if (!completeSequence.Equals(string.Empty))
                            {
                                completeSequence = completeSequence.Remove(0, 1);
                            }
                            dt.Rows.Add(oragnizationUnit.Id, GetNameableName(oragnizationUnit, lang), GetNameableDescription(oragnizationUnit, lang));
                        }
                        break;
                    }
                    break;
            }
        }

        private static string GetNameableName(INameableObject nameableObject, string lang)
        {
            string localizedName = "";

            if (nameableObject.Names == null)
            {
                return "";
            }

            foreach (ITextTypeWrapper name in nameableObject.Names)
            {
                if (name.Locale.Equals(lang))
                {
                    localizedName = name.Value;
                }
            }

            return localizedName;
        }

        private static string GetNameableDescription(INameableObject nameableObject, string lang)
        {
            string localizedName = "";

            if (nameableObject.Names == null)
            {
                return "";
            }

            foreach (ITextTypeWrapper description in nameableObject.Descriptions)
            {
                if (description.Locale == lang)
                {
                    localizedName = description.Value;
                }
            }

            return localizedName;
        }

        private static string GetLocalizedText(IList<ITextTypeWrapperMutableObject> lText, string lang)
        {
            string localizedName = "";

            if (lText == null)
            {
                return "";
            }

            foreach (ITextTypeWrapperMutableObject text in lText)
            {
                if (text.Locale == lang)
                {
                    localizedName = text.Value;
                }
            }

            return localizedName;
        }

        private List<IAnnotationMutableObject> DeserializeNomenclatureAnnotations(JObject JAnnotations)
        {
            var annotations = new List<IAnnotationMutableObject>();

            foreach (var JAnnotation in JAnnotations)
            {
                IAnnotationMutableObject annotation = new AnnotationMutableCore
                {
                    Id = JAnnotation.Key.ToUpper(),
                    Type = JAnnotation.Key.ToUpper(),
                    Title = JAnnotation.Key
                };

                foreach (dynamic AnnotationText in JAnnotation.Value)
                {
                    ITextTypeWrapperMutableObject TextObj = new TextTypeWrapperMutableCore
                    {
                        Value = AnnotationText.value,
                        Locale = AnnotationText.lang
                    };

                    annotation.Text.Add(TextObj);
                }

                annotations.Add(annotation);
            }

            return annotations;
        }

        private List<IAnnotationMutableObject> DeserializeGenericAnnotations(string JAnnotations)
        {
            var annotations = new List<IAnnotationMutableObject>();
            var preAnnotations = JsonConvert.DeserializeObject<List<AnnotationModel>>(JAnnotations);

            foreach (var preAnnotation in preAnnotations)
            {
                var Texts = new List<ITextTypeWrapperMutableObject>();

                foreach (var Text in preAnnotation.Text)
                {
                    var culture = new CultureInfo(Text.Locale);

                    var newText = new TextTypeWrapperMutableCore()
                    {
                        Locale = culture.TwoLetterISOLanguageName,
                        Value = Text.Value
                    };

                    Texts.Add(newText);
                }

                if (preAnnotation.Type == null || !preAnnotation.Type.Equals("NonProductionDataflow", StringComparison.InvariantCultureIgnoreCase))
                {
                    var annotation = BuildAnnotation(preAnnotation.Id, preAnnotation.Title, preAnnotation.Type, Texts);
                    annotations.Add(annotation);
                }
            }

            return annotations;
        }

        private IAnnotationMutableObject BuildAnnotation(string id, string title, string type, List<ITextTypeWrapperMutableObject> texts)
        {
            IAnnotationMutableObject annotation = new AnnotationMutableCore()
            {
                Id = id,
                Title = title,
                Type = type
            };

            foreach (var text in texts)
            {
                annotation.AddText(text);
            }

            return annotation;
        }

        private IAnnotationMutableObject BuildAnnotation(string id, string title, string type, string text)
        {
            IAnnotationMutableObject annotation = new AnnotationMutableCore()
            {
                Id = id,
                Title = title,
                Type = type
            };

            ITextTypeWrapperMutableObject textType = new TextTypeWrapperMutableCore()
            {
                Locale = "en",
                Value = text
            };

            annotation.AddText(textType);

            return annotation;
        }

        private List<IAnnotationMutableObject> CheckAnnotationDuplicates(List<IAnnotationMutableObject> annotations)
        {
            List<IAnnotationMutableObject> duples =
                annotations.
                    Where
                    (x =>
                        annotations.
                        Except
                        (
                            new List<IAnnotationMutableObject> { x }
                        ).
                        Any(y => y.Id == x.Id)
                    ).
                    ToList();

            return duples;
        }

        static private void removeWorkingAnnotation(IMaintainableMutableObject maintainable, NodeConfig.nAnnotations annotations)
        {
            var deleteCodelistItem = new List<IAnnotationMutableObject>();
            foreach (var iAnn in maintainable.Annotations)
            {
                if (iAnn.Type != null && (iAnn.Type.ToLowerInvariant().Equals(annotations.AssociatedCube.ToLowerInvariant())
                                            || iAnn.Type.ToLowerInvariant().Equals(annotations.CustomDSD.ToLowerInvariant())
                                            || iAnn.Type.ToLowerInvariant().Equals(annotations.DDBDataflow.ToLowerInvariant())
                                            || iAnn.Type.ToLowerInvariant().Equals(annotations.Metadataset.ToLowerInvariant())
                                            || iAnn.Type.ToLowerInvariant().Equals(annotations.Changed.ToLowerInvariant())))
                {
                    deleteCodelistItem.Add(iAnn);
                }
            }
            foreach (var annotation in deleteCodelistItem)
            {
                maintainable.Annotations.Remove(annotation);
            }
        }

        

        private static void RecursiveOnItems(ICategoryObject code, ref DataTable dt, string lang)
        {
            string completeSequence = code.Parent.ToString().Split('=')[1].Split(')')[1].Split('.').Last();

            dt.Rows.Add(code.Id, GetNameableName(code, lang), GetNameableDescription(code, lang), completeSequence);
            if (code.Items.Count != 0)
            {
                foreach (ICategoryObject subCode in code.Items)
                {
                    RecursiveOnItems(subCode, ref dt, lang);
                }
            }
        }


        private class AnnotationModel
        {
            public string Id { get; set; }
            public string Title { get; set; }
            public string Type { get; set; }
            public List<TextWrapperModel> Text { get; set; }
        }

        private class TextWrapperModel
        {
            public string Locale { get; set; }
            public string Value { get; set; }
        }

        private static void addParagraph(RtfTable table, int row, int col, string text, ColorDescriptor bgColor, FontStyleFlag fontStyle, Align align = Align.Center)
        {
            var cell = table.Cell(row, col);
            cell.AlignmentVertical = AlignVertical.Middle;
            var parAppo = cell.AddParagraph();
            parAppo.SetText(text);
            parAppo.Alignment = Align.Center;
            table.Cell(row, col).BackgroundColor = bgColor;
            var cf = parAppo.AddCharFormat();
            cf.FontStyle.AddStyle(FontStyleFlag.Bold);
        }

        private static string SetOrderAnnotation(SdmxStructureEnumType artifact, NodeConfig.nAnnotations nAnnotations)
        {
            switch (artifact)
            {
                case SdmxStructureEnumType.CodeList:
                    return string.IsNullOrEmpty(nAnnotations.CodelistsOrder) ? "ORDER" : nAnnotations.CodelistsOrder;
                case SdmxStructureEnumType.ConceptScheme:
                    return string.IsNullOrEmpty(nAnnotations.ConceptSchemesOrder) ? "ORDER" : nAnnotations.ConceptSchemesOrder;
                case SdmxStructureEnumType.CategoryScheme:
                    return string.IsNullOrEmpty(nAnnotations.CategorySchemesOrder) ? "ORDER" : nAnnotations.CategorySchemesOrder;
                default:
                    return "ORDER";
            }
        }
    }
}
