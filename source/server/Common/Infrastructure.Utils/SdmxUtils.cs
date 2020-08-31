using AuthCore.Model;
using DataModel;
using Infrastructure.STLogging.Factory;
using NSI.Entities;
using Org.Sdmxsource.Sdmx.Api.Constants;
using Org.Sdmxsource.Sdmx.Api.Manager.Parse;
using Org.Sdmxsource.Sdmx.Api.Model;
using Org.Sdmxsource.Sdmx.Api.Model.Mutable.Base;
using Org.Sdmxsource.Sdmx.Api.Model.Mutable.CategoryScheme;
using Org.Sdmxsource.Sdmx.Api.Model.Mutable.Codelist;
using Org.Sdmxsource.Sdmx.Api.Model.Mutable.ConceptScheme;
using Org.Sdmxsource.Sdmx.Api.Model.Objects;
using Org.Sdmxsource.Sdmx.Api.Model.Objects.Base;
using Org.Sdmxsource.Sdmx.Api.Model.Objects.CategoryScheme;
using Org.Sdmxsource.Sdmx.Api.Model.Objects.Codelist;
using Org.Sdmxsource.Sdmx.Api.Model.Objects.ConceptScheme;
using Org.Sdmxsource.Sdmx.Api.Model.Objects.DataStructure;
using Org.Sdmxsource.Sdmx.Api.Model.Objects.Mapping;
using Org.Sdmxsource.Sdmx.Api.Model.Objects.MetadataStructure;
using Org.Sdmxsource.Sdmx.Api.Model.Objects.Registry;
using Org.Sdmxsource.Sdmx.SdmxObjects.Model;
using Org.Sdmxsource.Sdmx.Structureparser.Manager.Parsing;
using Org.Sdmxsource.Sdmx.Util.Objects.Container;
using Org.Sdmxsource.Translator;
using Org.Sdmxsource.Util.Io;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Text;

namespace Utility
{
    public class SdmxUtils
    {
        /// <summary>
        /// Parsa un codice nella forma id+agency+version restituendo la parte richiesta.
        /// </summary>
        /// <param name="code">Il codice da parsare.</param>
        /// <param name="part">La parte del codice voluta.</param>
        public static string getCodePartFromTriplet(string code, string part)
        {

            checkCodeFormat(code);
            string[] parts = code.Split(new char[] { '+' });

            switch (part)
            {
                case "Id":
                    return parts[0];
                case "Agency":
                    return parts[1];
                case "Version":
                    return parts[2];
                default:
                    STLoggerFactory.Logger.Log(@"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - Parsing code error: unknown code part."
                        , Infrastructure.STLogging.Interface.LogLevelEnum.Error);
                    throw new ArgumentException("Unknown code part");
            }
        }

        /// <summary>
        /// Controlla il formato di un codice di un'entità SDMX.
        /// </summary>
        /// <param name="code">Codice da verificare.</param>
        /// <returns>True se il formato è corretto, altrimenti solleva un'eccezione.</returns>
        public static bool checkCodeFormat(string code)
        {
            string[] parts = code.Split(new char[] { '+' });
            if (parts.Length != 3)
            {
                STLoggerFactory.Logger.Log(@"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - Parsing code error: uncorret code format."
                        , Infrastructure.STLogging.Interface.LogLevelEnum.Error);
                throw new FormatException("Uncorret code format");
            }
            return true;
        }

        /// <summary>
        /// Verifica la correttezza del formato del file passato come parametro.
        /// </summary>
        /// <param name="file">Il file da verificare.</param>
        /// <param name="onlyCsv">Indica se il file può essere solo CSV.</param>
        public static void checkFileFormat(string file, bool onlyCsv)
        {
            // check file type (only .csv)
            string[] chunks = file.Split('.');
            string fileExt = chunks[chunks.Length - 1];

            if (onlyCsv && fileExt.ToLower() != "csv")
            {
                STLoggerFactory.Logger.Log(@"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - Only CSV files are supported for uploading."
                    , Infrastructure.STLogging.Interface.LogLevelEnum.Warn);
                throw new Exception();
            }

            //file vuoto
            if (file == null || file.Length == 0)
            {
                STLoggerFactory.Logger.Log(@"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - CSV file is empty or does not exist."
                , Infrastructure.STLogging.Interface.LogLevelEnum.Warn);
                throw new Exception();
            }
        }

        /// <summary>
        /// Converte un xml contenente dsd in un array di IDataStructureObject
        /// </summary>
        /// <param name="dsd">la dsd in xml</param>
        /// <param name="agencyId">l'agencyId della dsd</param>
        /// <returns></returns>
        public static IDataStructureObject[] getDataStructureFromXml(string dsd, string agencyId)
        {
            // leggo in xml
            MemoryStream xmlOutStream = new MemoryStream();
            ISdmxObjects bean = new StructureParsingManager().ParseStructures(
                new MemoryReadableLocation(Encoding.ASCII.GetBytes(dsd))).GetStructureObjects(true);

            ISet<IDataStructureObject> objects = bean.GetDataStructures(agencyId);

            IDataStructureObject[] arr = new IDataStructureObject[objects.Count];
            objects.CopyTo(arr, 0);

            return arr;
        }

        /// <summary>
        /// Converte un xml contenente sdmxobject
        /// </summary>
        /// <param name="dsd">la dsd in xml</param>
        /// <param name="agencyId">l'agencyId della dsd</param>
        /// <returns></returns>
        public static ISdmxObjects getSdmxObjectFromXml(string xml)
        {
            // leggo in xml
            MemoryStream xmlOutStream = new MemoryStream();
            ISdmxObjects bean = new StructureParsingManager().ParseStructures(
                new MemoryReadableLocation(Encoding.ASCII.GetBytes(xml))).GetStructureObjects(true);

            return bean;
        }

        /// <summary>
        /// Converte un json contenente categoryScheme in un array di ICategorySchemeObject
        /// </summary>
        /// <param name="catSch">il categoryScheme in json</param>
        /// <param name="agencyId">l'agencyId del CategoryScheme</param>
        /// <returns></returns>
        public static ICategorySchemeObject[] getCategorySchemeFromJson(string catSch, string agencyId)
        {
            SdmxStructureJsonFormat format = new SdmxStructureJsonFormat(
               new PreferedLanguageTranslator(new List<CultureInfo>(), new List<CultureInfo>(), new CultureInfo("en")),
               StructureOutputFormatEnumType.JsonV10
            );

            Encoding encoding = Encoding.UTF8;
            MemoryReadableLocation mrl = new MemoryReadableLocation(encoding.GetBytes(catSch));

            IStructureParsingManager pm = new StructureParsingJsonManager(format);
            IStructureWorkspace sw = pm.ParseStructures(mrl);

            ISdmxObjects bean = sw.GetStructureObjects(false);

            ISet<ICategorySchemeObject> objects = bean.GetCategorySchemes(agencyId);

            ICategorySchemeObject[] arr = new ICategorySchemeObject[objects.Count];
            objects.CopyTo(arr, 0);

            return arr;
        }
        
        /// <summary>
        /// Popolate targetSdmxObjects with artifactType, if it's in sourceSdmxObjects
        /// </summary>
        /// <param name=""></param>
        /// <returns></returns>
        public static void PopolateSdmxObject(ArtefactIdentity artifactType, ISdmxObjects sourceSdmxObjects, ISdmxObjects targetSdmxObjects)
        {
            switch (artifactType.EnumType)
            {
                case SdmxStructureEnumType.CodeList:
                    ICodelistObject tmpCodeList = sourceSdmxObjects.Codelists.First(codelist => codelist.Id.Equals(artifactType.ID) && codelist.AgencyId.Equals(artifactType.Agency) && codelist.Version.Equals(artifactType.Version));
                    targetSdmxObjects.AddCodelist(tmpCodeList);
                    break;
                case SdmxStructureEnumType.ConceptScheme:
                    IConceptSchemeObject tmpConceptScheme = sourceSdmxObjects.ConceptSchemes.First(conceptScheme => conceptScheme.Id.Equals(artifactType.ID) && conceptScheme.AgencyId.Equals(artifactType.Agency) && conceptScheme.Version.Equals(artifactType.Version));
                    targetSdmxObjects.AddConceptScheme(tmpConceptScheme);
                    break;
                case SdmxStructureEnumType.CategoryScheme:
                    ICategorySchemeObject tmpCategoryScheme = sourceSdmxObjects.CategorySchemes.First(categoryScheme => categoryScheme.Id.Equals(artifactType.ID) && categoryScheme.AgencyId.Equals(artifactType.Agency) && categoryScheme.Version.Equals(artifactType.Version));
                    targetSdmxObjects.AddCategoryScheme(tmpCategoryScheme);
                    break;
                case SdmxStructureEnumType.Dsd:
                    IDataStructureObject tmpDataStructure = sourceSdmxObjects.DataStructures.First(dataStructure => dataStructure.Id.Equals(artifactType.ID) && dataStructure.AgencyId.Equals(artifactType.Agency) && dataStructure.Version.Equals(artifactType.Version));
                    targetSdmxObjects.AddDataStructure(tmpDataStructure);
                    break;
                case SdmxStructureEnumType.AgencyScheme:
                    IAgencyScheme tmpAgencyScheme = sourceSdmxObjects.AgenciesSchemes.First(agencyScheme => agencyScheme.Id.Equals(artifactType.ID) && agencyScheme.AgencyId.Equals(artifactType.Agency) && agencyScheme.Version.Equals(artifactType.Version));
                    targetSdmxObjects.AddAgencyScheme(tmpAgencyScheme);
                    break;
                case SdmxStructureEnumType.DataProviderScheme:
                    IDataProviderScheme tmpDataProviderScheme = sourceSdmxObjects.DataProviderSchemes.First(dataProviderScheme => dataProviderScheme.Id.Equals(artifactType.ID) && dataProviderScheme.AgencyId.Equals(artifactType.Agency) && dataProviderScheme.Version.Equals(artifactType.Version));
                    targetSdmxObjects.AddDataProviderScheme(tmpDataProviderScheme);
                    break;
                case SdmxStructureEnumType.DataConsumerScheme:
                    IDataConsumerScheme tmpDataConsumerScheme = sourceSdmxObjects.DataConsumerSchemes.First(dataConsumerScheme => dataConsumerScheme.Id.Equals(artifactType.ID) && dataConsumerScheme.AgencyId.Equals(artifactType.Agency) && dataConsumerScheme.Version.Equals(artifactType.Version));
                    targetSdmxObjects.AddDataConsumerScheme(tmpDataConsumerScheme);
                    break;
                case SdmxStructureEnumType.OrganisationUnitScheme:
                    IOrganisationUnitSchemeObject tmpOrganizationUnitScheme = sourceSdmxObjects.OrganisationUnitSchemes.First(organizationUnitScheme => organizationUnitScheme.Id.Equals(artifactType.ID) && organizationUnitScheme.AgencyId.Equals(artifactType.Agency) && organizationUnitScheme.Version.Equals(artifactType.Version));
                    targetSdmxObjects.AddOrganisationUnitScheme(tmpOrganizationUnitScheme);
                    break;
                case SdmxStructureEnumType.StructureSet:
                    IStructureSetObject tmpStructureSet = sourceSdmxObjects.StructureSets.First(structureSet => structureSet.Id.Equals(artifactType.ID) && structureSet.AgencyId.Equals(artifactType.Agency) && structureSet.Version.Equals(artifactType.Version));
                    targetSdmxObjects.AddStructureSet(tmpStructureSet);
                    break;
                case SdmxStructureEnumType.ContentConstraint:
                    IContentConstraintObject tmpContentConstraint = sourceSdmxObjects.ContentConstraintObjects.First(contentConstraint => contentConstraint.Id.Equals(artifactType.ID) && contentConstraint.AgencyId.Equals(artifactType.Agency) && contentConstraint.Version.Equals(artifactType.Version));
                    targetSdmxObjects.AddContentConstraintObject(tmpContentConstraint);
                    break;
                case SdmxStructureEnumType.HierarchicalCodelist:
                    IHierarchicalCodelistObject tmpHierarchicalCodelist = sourceSdmxObjects.HierarchicalCodelists.First(hierarchicalCodelist => hierarchicalCodelist.Id.Equals(artifactType.ID) && hierarchicalCodelist.AgencyId.Equals(artifactType.Agency) && hierarchicalCodelist.Version.Equals(artifactType.Version));
                    targetSdmxObjects.AddHierarchicalCodelist(tmpHierarchicalCodelist);
                    break;
                case SdmxStructureEnumType.Categorisation:
                    ICategorisationObject tmpCategorisation = sourceSdmxObjects.Categorisations.First(cat => cat.Id.Equals(artifactType.ID) && cat.AgencyId.Equals(artifactType.Agency) && cat.Version.Equals(artifactType.Version));
                    targetSdmxObjects.AddCategorisation(tmpCategorisation);
                    break;
                case SdmxStructureEnumType.Dataflow:
                    IDataflowObject tmpDataflow = sourceSdmxObjects.Dataflows.First(df => df.Id.Equals(artifactType.ID) && df.AgencyId.Equals(artifactType.Agency) && df.Version.Equals(artifactType.Version));
                    targetSdmxObjects.AddDataflow(tmpDataflow);
                    break;
                case SdmxStructureEnumType.Msd:
                    IMetadataStructureDefinitionObject tmpMsd = sourceSdmxObjects.MetadataStructures.First(df => df.Id.Equals(artifactType.ID) && df.AgencyId.Equals(artifactType.Agency) && df.Version.Equals(artifactType.Version));
                    targetSdmxObjects.AddMetadataStructure(tmpMsd);
                    break;
                case SdmxStructureEnumType.MetadataFlow:
                    IMetadataFlow tmpMetaDataflow = sourceSdmxObjects.Metadataflows.First(df => df.Id.Equals(artifactType.ID) && df.AgencyId.Equals(artifactType.Agency) && df.Version.Equals(artifactType.Version));
                    targetSdmxObjects.AddMetadataFlow(tmpMetaDataflow);
                    break;
                case SdmxStructureEnumType.ProvisionAgreement:
                    IProvisionAgreementObject tmpProvAgreement = sourceSdmxObjects.ProvisionAgreements.First(df => df.Id.Equals(artifactType.ID) && df.AgencyId.Equals(artifactType.Agency) && df.Version.Equals(artifactType.Version));
                    targetSdmxObjects.AddProvisionAgreement(tmpProvAgreement);
                    break;
            }
        }

        /// <summary>
        /// Add IMaintainableObject from sdmxObjects
        /// </summary>
        /// <param name=""></param>
        /// <returns></returns>
        public static void AddItemSdmxObject(IMaintainableObject itemObj, ISdmxObjects sdmxObjects)
        {
            switch (itemObj.StructureType.EnumType)
            {
                case SdmxStructureEnumType.CodeList:
                    if (sdmxObjects.Codelists.FirstOrDefault(item => item.Id.Equals(itemObj.Id) && item.AgencyId.Equals(itemObj.AgencyId) && item.Version.Equals(itemObj.Version)) == null)
                    {
                        sdmxObjects.AddCodelist((ICodelistObject)itemObj);
                    }
                    break;
                case SdmxStructureEnumType.Dataflow:
                    if (sdmxObjects.Codelists.FirstOrDefault(item => item.Id.Equals(itemObj.Id) && item.AgencyId.Equals(itemObj.AgencyId) && item.Version.Equals(itemObj.Version)) == null)
                    {
                        sdmxObjects.AddDataflow((IDataflowObject)itemObj);
                    }
                    break;
                case SdmxStructureEnumType.ConceptScheme:
                    if (sdmxObjects.Codelists.FirstOrDefault(item => item.Id.Equals(itemObj.Id) && item.AgencyId.Equals(itemObj.AgencyId) && item.Version.Equals(itemObj.Version)) == null)
                    {
                        sdmxObjects.AddConceptScheme((IConceptSchemeObject)itemObj);
                    }
                    break;
                case SdmxStructureEnumType.CategoryScheme:
                    if (sdmxObjects.Codelists.FirstOrDefault(item => item.Id.Equals(itemObj.Id) && item.AgencyId.Equals(itemObj.AgencyId) && item.Version.Equals(itemObj.Version)) == null)
                    {
                        sdmxObjects.AddCategoryScheme((ICategorySchemeObject)itemObj);
                    }
                    break;
                case SdmxStructureEnumType.Dsd:
                    if (sdmxObjects.Codelists.FirstOrDefault(item => item.Id.Equals(itemObj.Id) && item.AgencyId.Equals(itemObj.AgencyId) && item.Version.Equals(itemObj.Version)) == null)
                    {
                        sdmxObjects.AddDataStructure((IDataStructureObject)itemObj);
                    }
                    break;
                case SdmxStructureEnumType.AgencyScheme:
                    if (sdmxObjects.Codelists.FirstOrDefault(item => item.Id.Equals(itemObj.Id) && item.AgencyId.Equals(itemObj.AgencyId) && item.Version.Equals(itemObj.Version)) == null)
                    {
                        sdmxObjects.AddAgencyScheme((IAgencyScheme)itemObj);
                    }
                    break;
                case SdmxStructureEnumType.DataProviderScheme:
                    if (sdmxObjects.Codelists.FirstOrDefault(item => item.Id.Equals(itemObj.Id) && item.AgencyId.Equals(itemObj.AgencyId) && item.Version.Equals(itemObj.Version)) == null)
                        sdmxObjects.AddDataProviderScheme((IDataProviderScheme)itemObj);
                    break;
                case SdmxStructureEnumType.DataConsumerScheme:
                    if (sdmxObjects.Codelists.FirstOrDefault(item => item.Id.Equals(itemObj.Id) && item.AgencyId.Equals(itemObj.AgencyId) && item.Version.Equals(itemObj.Version)) == null)
                    {
                        sdmxObjects.AddDataConsumerScheme((IDataConsumerScheme)itemObj);
                    }
                    break;
                case SdmxStructureEnumType.OrganisationUnitScheme:
                    if (sdmxObjects.Codelists.FirstOrDefault(item => item.Id.Equals(itemObj.Id) && item.AgencyId.Equals(itemObj.AgencyId) && item.Version.Equals(itemObj.Version)) == null)
                    {
                        sdmxObjects.AddOrganisationUnitScheme((IOrganisationUnitSchemeObject)itemObj);
                    }
                    break;
                case SdmxStructureEnumType.ContentConstraint:
                    if (sdmxObjects.Codelists.FirstOrDefault(item => item.Id.Equals(itemObj.Id) && item.AgencyId.Equals(itemObj.AgencyId) && item.Version.Equals(itemObj.Version)) == null)
                    {
                        sdmxObjects.AddContentConstraintObject((IContentConstraintObject)itemObj);
                    }
                    break;
                case SdmxStructureEnumType.StructureSet:
                    if (sdmxObjects.Codelists.FirstOrDefault(item => item.Id.Equals(itemObj.Id) && item.AgencyId.Equals(itemObj.AgencyId) && item.Version.Equals(itemObj.Version)) == null)
                    {
                        sdmxObjects.AddStructureSet((IStructureSetObject)itemObj);
                    }
                    break;
                case SdmxStructureEnumType.HierarchicalCodelist:
                    if (sdmxObjects.Codelists.FirstOrDefault(item => item.Id.Equals(itemObj.Id) && item.AgencyId.Equals(itemObj.AgencyId) && item.Version.Equals(itemObj.Version)) == null)
                    {
                        sdmxObjects.AddHierarchicalCodelist((IHierarchicalCodelistObject)itemObj);
                    }
                    break;
                case SdmxStructureEnumType.Categorisation:
                    if (sdmxObjects.Codelists.FirstOrDefault(item => item.Id.Equals(itemObj.Id) && item.AgencyId.Equals(itemObj.AgencyId) && item.Version.Equals(itemObj.Version)) == null)
                    {
                        sdmxObjects.AddCategorisation((ICategorisationObject)itemObj);
                    }
                    break;
                case SdmxStructureEnumType.MetadataFlow:
                    if (sdmxObjects.Metadataflows.FirstOrDefault(item => item.Id.Equals(itemObj.Id) && item.AgencyId.Equals(itemObj.AgencyId) && item.Version.Equals(itemObj.Version)) == null)
                    {
                        sdmxObjects.AddMetadataFlow((IMetadataFlow)itemObj);
                    }
                    break;
                case SdmxStructureEnumType.Msd:
                    if (sdmxObjects.MetadataStructures.FirstOrDefault(item => item.Id.Equals(itemObj.Id) && item.AgencyId.Equals(itemObj.AgencyId) && item.Version.Equals(itemObj.Version)) == null)
                    {
                        sdmxObjects.AddMetadataStructure((IMetadataStructureDefinitionObject)itemObj);
                    }
                    break;
            }
        }

        /// <summary>
        /// Remove IMaintainableObject from sdmxObjects
        /// </summary>
        /// <param name=""></param>
        /// <returns></returns>
        public static void RemoveItemSdmxObject(IMaintainableObject itemObj, ISdmxObjects sdmxObjects)
        {
            switch (itemObj.StructureType.EnumType)
            {
                case SdmxStructureEnumType.CodeList:
                    sdmxObjects.RemoveCodelist((ICodelistObject)itemObj);
                    break;
                case SdmxStructureEnumType.Dataflow:
                    sdmxObjects.RemoveDataflow((IDataflowObject)itemObj);
                    break;
                case SdmxStructureEnumType.ConceptScheme:
                    sdmxObjects.RemoveConceptScheme((IConceptSchemeObject)itemObj);
                    break;
                case SdmxStructureEnumType.CategoryScheme:
                    sdmxObjects.RemoveCategoryScheme((ICategorySchemeObject)itemObj);
                    break;
                case SdmxStructureEnumType.Dsd:
                    sdmxObjects.RemoveDataStructure((IDataStructureObject)itemObj);
                    break;
                case SdmxStructureEnumType.AgencyScheme:
                    sdmxObjects.RemoveAgencyScheme((IAgencyScheme)itemObj);
                    break;
                case SdmxStructureEnumType.DataProviderScheme:
                    sdmxObjects.RemoveDataProviderScheme((IDataProviderScheme)itemObj);
                    break;
                case SdmxStructureEnumType.DataConsumerScheme:
                    sdmxObjects.RemoveDataConsumerScheme((IDataConsumerScheme)itemObj);
                    break;
                case SdmxStructureEnumType.OrganisationUnitScheme:
                    sdmxObjects.RemoveOrganisationUnitScheme((IOrganisationUnitSchemeObject)itemObj);
                    break;
                case SdmxStructureEnumType.ContentConstraint:
                    sdmxObjects.RemoveContentConstraintObject((IContentConstraintObject)itemObj);
                    break;
                case SdmxStructureEnumType.StructureSet:
                    sdmxObjects.RemoveStructureSet((IStructureSetObject)itemObj);
                    break;
                case SdmxStructureEnumType.HierarchicalCodelist:
                    sdmxObjects.RemoveHierarchicalCodelist((IHierarchicalCodelistObject)itemObj);
                    break;
                case SdmxStructureEnumType.Categorisation:
                    sdmxObjects.RemoveCategorisation((ICategorisationObject)itemObj);
                    break;
                case SdmxStructureEnumType.MetadataFlow:
                    sdmxObjects.RemoveMetadataFlow((IMetadataFlow)itemObj);
                    break;
                case SdmxStructureEnumType.Msd:
                    sdmxObjects.RemoveMetadataStructure((IMetadataStructureDefinitionObject)itemObj);
                    break;
            }
        }

        /// <summary>
        /// Take and ISdmxObjects and return only items in page
        /// </summary>
        /// <param name=""></param>
        /// <returns>paginated items</returns>
        static public void PaginatedCodeList(ISdmxObjects sdmxObject, int numPage, int pageSize)
        {
            if (pageSize == -1 || sdmxObject.Codelists.Count <= 0 || sdmxObject.Codelists.First().Items.Count <= pageSize)
            {
                return;
            }

            var iStart = (numPage - 1) * pageSize + 1;
            var iEnd = numPage * pageSize;

            var codelistResult = sdmxObject.Codelists.First().MutableInstance;
            var allCode = new List<ICodeMutableObject>();
            for (var i = iStart; i >= iStart && i <= iEnd; i++)
            {
                allCode.Add(codelistResult.Items[i]);
            }
            codelistResult.Items.Clear();
            foreach (var item in allCode)
            {
                codelistResult.AddItem(item);
            }
            sdmxObject.Codelists.Clear();
            sdmxObject.AddCodelist(codelistResult.ImmutableInstance);
        }

        /// <summary>
        /// Take ISdmxObjects and return a new List of SdmxObjects paginated for CodeList, CategoryScheme and ConceptScheme
        /// </summary>
        /// <param name="sdmxObject">Object to be paginated</param>
        /// <param name="pageSize">Max number of items for sdmxObject</param>
        /// <returns>paginated items</returns>
        static public List<ISdmxObjects> SdmxObjectsPaginated(ISdmxObjects sdmxObject, int pageSize)
        {
            var counter = 0;
            counter += sdmxObject.Codelists.Select(codeList => codeList.Items.Count).Sum();
            counter += sdmxObject.ConceptSchemes.Select(conceptScheme => conceptScheme.Items.Count).Sum();
            counter += sdmxObject.CategorySchemes.Select(categoryScheme => categoryScheme.Items.Count).Sum();

            if (counter > pageSize)
            {
                var paginatedCodeList = SdmxObjectsPaginatedCodeList(sdmxObject.Codelists, pageSize);
                var paginatedConceptScheme = SdmxObjectsPaginatedConceptScheme(sdmxObject.ConceptSchemes, pageSize);
                var paginatedCategoryScheme = SdmxObjectsPaginatedCategoryScheme(sdmxObject.CategorySchemes, pageSize);
                
                var result = new List<ISdmxObjects>();
                result.AddRange(paginatedCodeList);
                result.AddRange(paginatedConceptScheme);
                result.AddRange(paginatedCategoryScheme);

                //Aggiungo gli altri elementi presenti nel sdmxObject originale (dopo aver totlo quelli che sono stati paginati)
                var newSdmxObject = new SdmxObjectsImpl(sdmxObject);
                newSdmxObject.Codelists.Clear();
                newSdmxObject.ConceptSchemes.Clear();
                newSdmxObject.CategorySchemes.Clear();
                result.Add(new SdmxObjectsImpl(newSdmxObject));

                return result;
            }
            else
            {
                //Se non c'è bisogno di paginazione, ritorno un nuovo oggetto ISdmxObjects, identico a quello originale
                return new List<ISdmxObjects> { new SdmxObjectsImpl(sdmxObject) };
            }
        }



        /// <summary>
        /// Take ISdmxObjects and return a new List of SdmxObjects paginated by CodeList
        /// </summary>
        /// <param name=""></param>
        /// <returns>paginated items</returns>
        static public List<ISdmxObjects> SdmxObjectsPaginatedCodeList(ISet<ICodelistObject> codeLists, int pageSize)
        {
            var allSdmxObjects = new List<ISdmxObjects>();
            var codeListItems = 0;

            ISdmxObjects newSdmxObject = new SdmxObjectsImpl();

            foreach (var codeList in codeLists)
            {
                newSdmxObject.AddCodelist(codeList);
                codeListItems += codeList.Items.Count;
            }

            if (codeListItems <= pageSize)
            { //Gli items sono minori della size, quindi basta un elemento
                allSdmxObjects.Add(newSdmxObject);
                return allSdmxObjects;
            }


            //Inseriamo le codelist che rientrano nella paginazione e che quindi potranno avere i loro .Items in un unica CodeList all'interno del ISdmxObjects
            var codeListForSplit = new List<ICodelistObject>();
            //Inseriamo che codelist che non rientrano nella paginazione e che dovranno essere paginate per .Items e che quindi saranno divisi in più ISdmxObjects
            var codeListTooBig = new List<ICodelistObject>();

            //Scorro tutte le codelist e mantengo nella newSdmxObject tutte quelle che entrano nella paginazione
            codeListItems = 0;
            foreach (var codeList in codeLists)
            {
                var currentItems = codeList.Items.Count;

                if (currentItems > pageSize)
                { //Codelist troppo grandi per la pagina massima
                    codeListTooBig.Add(codeList);
                    newSdmxObject.RemoveCodelist(codeList);
                }
                else if (codeListItems + currentItems > pageSize)
                { //Code list che non entrato nello spazio risponibile rimasto
                    codeListForSplit.Add(codeList);
                    newSdmxObject.RemoveCodelist(codeList);
                }
                else
                {
                    codeListItems += currentItems;
                }
            }

            if (codeListTooBig.Count + codeListForSplit.Count > 0)
            {
                allSdmxObjects.AddRange(createSdmxObjectsPaginatedCodeList(codeListTooBig, codeListForSplit, pageSize));
            }

            if (newSdmxObject.Codelists.Count > 0)
            {
                allSdmxObjects.Add(newSdmxObject);
            }

            return allSdmxObjects;
        }

        static private List<ISdmxObjects> createSdmxObjectsPaginatedCodeList(List<ICodelistObject> codeListTooBig, List<ICodelistObject> codeListForSplit, int pageSize)
        {
            var allSdmxObjects = new List<ISdmxObjects>();

            ISdmxObjects newSdmxObject = null;
            var codeListItems = 0;
            foreach (var item in codeListForSplit)
            {
                var currentItems = item.Items.Count;

                if (codeListItems + currentItems <= pageSize)
                {
                    if (newSdmxObject == null)
                    {
                        newSdmxObject = new SdmxObjectsImpl();
                        allSdmxObjects.Add(newSdmxObject);
                    }
                    newSdmxObject.AddCodelist(item);
                    codeListItems += currentItems;
                }
                else
                {
                    newSdmxObject = new SdmxObjectsImpl();
                    allSdmxObjects.Add(newSdmxObject);

                    newSdmxObject.AddCodelist(item);
                    codeListItems = currentItems;
                }
            }


            foreach (var codelistToPaginated in codeListTooBig)
            {
                var itemsCount = codelistToPaginated.Items.Count;

                var pages = new Dictionary<int, int>();

                var pageNumber = 0;
                var startPage = 0;
                var endPage = 0;
                while (itemsCount > endPage)
                {
                    pageNumber++;
                    startPage = (pageNumber - 1) * pageSize + 1;
                    endPage = pageNumber * pageSize;
                    pages.Add(startPage, endPage);
                }

                foreach (var itemPage in pages)
                {
                    var mutable = codelistToPaginated.MutableInstance;
                    var allCode = new List<ICodeMutableObject>();
                    for (var i = itemPage.Key; i >= itemPage.Key && i <= itemPage.Value && i < itemsCount; i++)
                    {
                        allCode.Add(mutable.Items[i]);
                    }
                    mutable.Items.Clear();
                    foreach (var item in allCode)
                    {
                        mutable.Items.Add(item);
                    }
                    allSdmxObjects.Add(new SdmxObjectsImpl(mutable.ImmutableInstance));
                }
            }


            return allSdmxObjects;
        }

        /// <summary>
        /// Take ISdmxObjects and return a new List of SdmxObjects paginated by ConceptScheme
        /// </summary>
        /// <param name=""></param>
        /// <returns>paginated items</returns>
        static public List<ISdmxObjects> SdmxObjectsPaginatedConceptScheme(ISet<IConceptSchemeObject> conceptSchemes, int pageSize)
        {
            var allSdmxObjects = new List<ISdmxObjects>();
            var conceptSchemeItems = 0;

            ISdmxObjects newSdmxObject = new SdmxObjectsImpl();

            foreach (var conceptScheme in conceptSchemes)
            {
                newSdmxObject.AddConceptScheme(conceptScheme);
                conceptSchemeItems += conceptScheme.Items.Count;
            }

            if (conceptSchemeItems <= pageSize)
            { //Gli items sono minori della size, quindi basta un elemento
                allSdmxObjects.Add(newSdmxObject);
                return allSdmxObjects;
            }


            //Inseriamo le CategoryScheme che rientrano nella paginazione e che quindi potranno avere i loro .Items in un unica CategoryScheme all'interno del ISdmxObjects
            var conceptSchemaListForSplit = new List<IConceptSchemeObject>();
            //Inseriamo che CategoryScheme che non rientrano nella paginazione e che dovranno essere paginate per .Items e che quindi saranno divisi in più ISdmxObjects
            var conceptSchemaListTooBig = new List<IConceptSchemeObject>();

            //Scorro tutte le codelist e mantengo nella newSdmxObject tutte quelle che entrano nella paginazione
            conceptSchemeItems = 0;
            foreach (var conceptScheme in conceptSchemes)
            {
                var currentItems = conceptScheme.Items.Count;

                if (currentItems > pageSize)
                { //CatSchema troppo grandi per la pagina massima
                    conceptSchemaListTooBig.Add(conceptScheme);
                    newSdmxObject.RemoveConceptScheme(conceptScheme);
                }
                else if (conceptSchemeItems + currentItems > pageSize)
                { //CatSchema che non entrato nello spazio risponibile rimasto
                    conceptSchemaListForSplit.Add(conceptScheme);
                    newSdmxObject.RemoveConceptScheme(conceptScheme);
                }
                else
                {
                    conceptSchemeItems += currentItems;
                }
            }

            if (conceptSchemaListTooBig.Count + conceptSchemaListForSplit.Count > 0)
            {
                allSdmxObjects.AddRange(createSdmxObjectsPaginatedConceptScheme(conceptSchemaListTooBig, conceptSchemaListForSplit, pageSize));
            }

            if (newSdmxObject.ConceptSchemes.Count > 0)
            {
                allSdmxObjects.Add(newSdmxObject);
            }

            return allSdmxObjects;
        }

        static private List<ISdmxObjects> createSdmxObjectsPaginatedConceptScheme(List<IConceptSchemeObject> conceptSchemaListTooBig, List<IConceptSchemeObject> conceptSchemaListForSplit, int pageSize)
        {
            var allSdmxObjects = new List<ISdmxObjects>();

            ISdmxObjects newSdmxObject = null;
            var conceptSchemaListItems = 0;
            foreach (var item in conceptSchemaListForSplit)
            {
                var currentItems = item.Items.Count;

                if (conceptSchemaListItems + currentItems <= pageSize)
                {
                    if (newSdmxObject == null)
                    {
                        newSdmxObject = new SdmxObjectsImpl();
                        allSdmxObjects.Add(newSdmxObject);
                    }
                    newSdmxObject.AddConceptScheme(item);
                    conceptSchemaListItems += currentItems;
                }
                else
                {
                    newSdmxObject = new SdmxObjectsImpl();
                    allSdmxObjects.Add(newSdmxObject);

                    newSdmxObject.AddConceptScheme(item);
                    conceptSchemaListItems = currentItems;
                }
            }


            foreach (var conceptSchemalistToPaginated in conceptSchemaListTooBig)
            {
                var itemsCount = conceptSchemalistToPaginated.Items.Count;

                var pages = new Dictionary<int, int>();

                var pageNumber = 0;
                var startPage = 0;
                var endPage = 0;
                while (itemsCount > endPage)
                {
                    pageNumber++;
                    startPage = (pageNumber - 1) * pageSize + 1;
                    endPage = pageNumber * pageSize;
                    pages.Add(startPage, endPage);
                }

                foreach (var itemPage in pages)
                {
                    var mutable = conceptSchemalistToPaginated.MutableInstance;
                    var allConceptSchema = new List<IConceptMutableObject>();
                    for (var i = itemPage.Key; i >= itemPage.Key && i <= itemPage.Value && i < itemsCount; i++)
                    {
                        allConceptSchema.Add(mutable.Items[i]);
                    }
                    mutable.Items.Clear();
                    foreach (var item in allConceptSchema)
                    {
                        mutable.Items.Add(item);
                    }
                    allSdmxObjects.Add(new SdmxObjectsImpl(mutable.ImmutableInstance));
                }
            }


            return allSdmxObjects;
        }


        /// <summary>
        /// Take ISdmxObjects and return a new List of SdmxObjects paginated by CategoryScheme
        /// </summary>
        /// <param name=""></param>
        /// <returns>paginated items</returns>
        static public List<ISdmxObjects> SdmxObjectsPaginatedCategoryScheme(ISet<ICategorySchemeObject> categorySchemes, int pageSize)
        {
            var allSdmxObjects = new List<ISdmxObjects>();
            var categorySchemeItems = 0;

            ISdmxObjects newSdmxObject = new SdmxObjectsImpl();

            foreach (var catScheme in categorySchemes)
            {
                newSdmxObject.AddCategoryScheme(catScheme);
                categorySchemeItems += catScheme.Items.Count;
            }

            if (categorySchemeItems <= pageSize)
            { //Gli items sono minori della size, quindi basta un elemento
                allSdmxObjects.Add(newSdmxObject);
                return allSdmxObjects;
            }




            //Inseriamo le CategoryScheme che rientrano nella paginazione e che quindi potranno avere i loro .Items in un unica CategoryScheme all'interno del ISdmxObjects
            var catSchemaListForSplit = new List<ICategorySchemeObject>();
            //Inseriamo che CategoryScheme che non rientrano nella paginazione e che dovranno essere paginate per .Items e che quindi saranno divisi in più ISdmxObjects
            var catSchemaListTooBig = new List<ICategorySchemeObject>();

            //Scorro tutte le codelist e mantengo nella newSdmxObject tutte quelle che entrano nella paginazione
            categorySchemeItems = 0;
            foreach (var catScheme in categorySchemes)
            {
                var currentItems = catScheme.Items.Count;

                if (currentItems > pageSize)
                { //CatSchema troppo grandi per la pagina massima
                    catSchemaListTooBig.Add(catScheme);
                    newSdmxObject.RemoveCategoryScheme(catScheme);
                }
                else if (categorySchemeItems + currentItems > pageSize)
                { //CatSchema che non entrato nello spazio risponibile rimasto
                    catSchemaListForSplit.Add(catScheme);
                    newSdmxObject.RemoveCategoryScheme(catScheme);
                }
                else
                {
                    categorySchemeItems += currentItems;
                }
            }

            if (catSchemaListTooBig.Count + catSchemaListForSplit.Count > 0)
            {
                allSdmxObjects.AddRange(createSdmxObjectsPaginatedCategorySchema(catSchemaListTooBig, catSchemaListForSplit, pageSize));
            }

            if (newSdmxObject.CategorySchemes.Count > 0)
            {
                allSdmxObjects.Add(newSdmxObject);
            }

            return allSdmxObjects;
        }

        static private List<ISdmxObjects> createSdmxObjectsPaginatedCategorySchema(List<ICategorySchemeObject> catSchemaListTooBig, List<ICategorySchemeObject> catSchemaListForSplit, int pageSize)
        {
            var allSdmxObjects = new List<ISdmxObjects>();

            ISdmxObjects newSdmxObject = null;
            var catSchemaListItems = 0;
            foreach (var item in catSchemaListForSplit)
            {
                var currentItems = item.Items.Count;

                if (catSchemaListItems + currentItems <= pageSize)
                {
                    if (newSdmxObject == null)
                    {
                        newSdmxObject = new SdmxObjectsImpl();
                        allSdmxObjects.Add(newSdmxObject);
                    }
                    newSdmxObject.AddCategoryScheme(item);
                    catSchemaListItems += currentItems;
                }
                else
                {
                    newSdmxObject = new SdmxObjectsImpl();
                    allSdmxObjects.Add(newSdmxObject);

                    newSdmxObject.AddCategoryScheme(item);
                    catSchemaListItems = currentItems;
                }
            }


            foreach (var catSchemalistToPaginated in catSchemaListTooBig)
            {
                var itemsCount = catSchemalistToPaginated.Items.Count;

                var pages = new Dictionary<int, int>();

                var pageNumber = 0;
                var startPage = 0;
                var endPage = 0;
                while (itemsCount > endPage)
                {
                    pageNumber++;
                    startPage = (pageNumber - 1) * pageSize + 1;
                    endPage = pageNumber * pageSize;
                    pages.Add(startPage, endPage);
                }

                foreach (var itemPage in pages)
                {
                    var mutable = catSchemalistToPaginated.MutableInstance;
                    var allCatSchema = new List<ICategoryMutableObject>();
                    for (var i = itemPage.Key; i >= itemPage.Key && i <= itemPage.Value && i < itemsCount; i++)
                    {
                        allCatSchema.Add(mutable.Items[i]);
                    }
                    mutable.Items.Clear();
                    foreach (var item in allCatSchema)
                    {
                        mutable.Items.Add(item);
                    }
                    allSdmxObjects.Add(new SdmxObjectsImpl(mutable.ImmutableInstance));
                }
            }


            return allSdmxObjects;
        }


        public class AnnotationCompare : IComparer<IItemMutableObject>
        {
            string _orderAnnotation = "ORDER";
            string _lang = "en";

            public AnnotationCompare(SdmxStructureEnumType artifact, NodeConfig.nAnnotations nAnnotations, string lang)
            {
                _lang = lang;
                switch (artifact)
                {
                    case SdmxStructureEnumType.CodeList:
                        _orderAnnotation = string.IsNullOrEmpty(nAnnotations.CodelistsOrder) ? "ORDER" : nAnnotations.CodelistsOrder;
                        break;
                    case SdmxStructureEnumType.ConceptScheme:
                        _orderAnnotation = string.IsNullOrEmpty(nAnnotations.ConceptSchemesOrder) ? "ORDER" : nAnnotations.ConceptSchemesOrder;
                        break;
                    case SdmxStructureEnumType.CategoryScheme:
                        _orderAnnotation = string.IsNullOrEmpty(nAnnotations.CategorySchemesOrder) ? "ORDER" : nAnnotations.CategorySchemesOrder;
                        break;
                    default:
                        _orderAnnotation = "ORDER";
                        break;
                }
            }

            public int Compare(IItemMutableObject x, IItemMutableObject y)
            {

                var first = x.Annotations.FirstOrDefault(a => a.Type == _orderAnnotation);
                var second = y.Annotations.FirstOrDefault(a => a.Type == _orderAnnotation);
                if (first == null && second != null)
                {
                    return 1;
                }
                else if (first != null && second == null)
                {
                    return -1;
                }
                else if (first == null && second == null)
                {
                    return 0;
                }
                var firstValue = Int32.MaxValue;
                var secondValue = Int32.MaxValue;
                if (first.Text != null)
                {
                    foreach (var itemValue in first.Text)
                    {
                        if (itemValue.Locale.Equals(_lang, StringComparison.InvariantCultureIgnoreCase))
                        {
                            try
                            {
                                firstValue = Int32.Parse(itemValue.Value);
                                break;
                            }
                            catch (Exception) { }
                        }
                    }
                }
                if (second.Text != null)
                {
                    foreach (var itemValue in second.Text)
                    {
                        if (itemValue.Locale.Equals(_lang, StringComparison.InvariantCultureIgnoreCase))
                        {
                            try
                            {
                                secondValue = Int32.Parse(itemValue.Value);
                                break;
                            }
                            catch (Exception) { }
                        }
                    }
                }
                return firstValue - secondValue;
            }
        }

    }
}
