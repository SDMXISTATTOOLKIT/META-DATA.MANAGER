using DataModel;
using EndpointConnectors.Connectors;
using Infrastructure.STLogging.Factory;
using Infrastructure.STLogging.Interface;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json;
using Org.Sdmxsource.Sdmx.Api.Constants;
using Org.Sdmxsource.Sdmx.Api.Model.Mutable.Base;
using Org.Sdmxsource.Sdmx.Api.Model.Mutable.CategoryScheme;
using Org.Sdmxsource.Sdmx.Api.Model.Mutable.Codelist;
using Org.Sdmxsource.Sdmx.Api.Model.Mutable.DataStructure;
using Org.Sdmxsource.Sdmx.Api.Model.Mutable.Mapping;
using Org.Sdmxsource.Sdmx.Api.Model.Mutable.Registry;
using Org.Sdmxsource.Sdmx.Api.Model.Objects;
using Org.Sdmxsource.Sdmx.Api.Model.Objects.Base;
using Org.Sdmxsource.Sdmx.Api.Model.Objects.CategoryScheme;
using Org.Sdmxsource.Sdmx.Api.Model.Objects.Mapping;
using Org.Sdmxsource.Sdmx.Api.Model.Objects.Reference;
using Org.Sdmxsource.Sdmx.Api.Model.Objects.Registry;
using Org.Sdmxsource.Sdmx.SdmxObjects.Model.Mutable.Base;
using Org.Sdmxsource.Sdmx.SdmxObjects.Model.Mutable.CategoryScheme;
using Org.Sdmxsource.Sdmx.SdmxObjects.Model.Mutable.Codelist;
using Org.Sdmxsource.Sdmx.SdmxObjects.Model.Mutable.Mapping;
using Org.Sdmxsource.Sdmx.SdmxObjects.Model.Mutable.MetadataStructure;
using Org.Sdmxsource.Sdmx.SdmxObjects.Model.Mutable.Registry;
using Org.Sdmxsource.Sdmx.Util.Objects.Container;
using Org.Sdmxsource.Sdmx.Util.Objects.Reference;

using System;
using System.Collections.Generic;

namespace BusinessLogic.Controller
{
    public class TestArtefacts
    {
        private Sdmx21Connector Sdmx21Connector;

        private readonly AppConfig appConfig;
        readonly IConfiguration _configuration;
        readonly ISTLogger _logger;
        readonly NodeConfig _nodeConfig;
        readonly IHttpContextAccessor _contextAccessor;
        readonly IMemoryCache _memoryCache;

        public TestArtefacts(NodeConfig nodeConfiguration, IConfiguration configuration, IMemoryCache memoryCache, IHttpContextAccessor contextAccessor, Sdmx21Connector conn)
        {
            _configuration = configuration;
            _nodeConfig = nodeConfiguration;
            _contextAccessor = contextAccessor;
            _memoryCache = memoryCache;
            Sdmx21Connector = conn;

            appConfig = new ConfigManager(configuration, _memoryCache).GetAppConfig();

            _logger = STLoggerFactory.Logger;
        }

        /// <summary>
        /// Tests creation, update and delete of different types of artefacts.
        /// </summary>
        /// <param name="isFullSet">Whether the artefacts have to be created with all their optional parameters or not.</param>
        /// <param name="isFinal">Whether the artefacts have to be created as final or not.</param>
        public string TestCrudArtefacts(bool isFullSet, bool isFinal)
        {
            ISdmxObjects objs = new SdmxObjectsImpl();

            //test delete HCL (must be already present)
            //ISdmxObjects objsHCL = Sdmx21Connector.GetArtefacts(SdmxStructureEnumType.HierarchicalCodelist, null, null, null);
            //Sdmx21Connector.DeleteArtefact(objsHCL);


            #region test artefact creation

            CreateDataProviderScheme(ref objs, isFullSet);
            CreateDataConsumerScheme(ref objs, isFullSet);
            CreateOrganisationUnitScheme(ref objs, isFullSet, isFinal);
            CreateProvisionAgreement(ref objs, isFullSet, isFinal);
            //CreateRegistration(ref objs, isFullSet, isFinal);
            CreateStructureSet(ref objs, isFullSet, isFinal);
            CreateCategorisation(ref objs, isFullSet, isFinal);

            #endregion test artefact creation

            var result = Sdmx21Connector.CreateArtefacts(objs);
            ISdmxObjects newObjs = UpdateArtefactsName(objs);
            result = Sdmx21Connector.DeleteArtefact(newObjs);

            return JsonConvert.SerializeObject(result);
        }

        /// <summary>
        /// Updates the SDMX objects passed as parameter adding a name in english.
        /// </summary>
        /// <param name="objs">The SDMX objects to be updated.</param>
        /// <returns>The updated objects.</returns>
        private ISdmxObjects UpdateArtefactsName(ISdmxObjects objs)
        {
            ISdmxObjects newObjs = new SdmxObjectsImpl();
            ISdmxObjects singleObj = new SdmxObjectsImpl();

            IEnumerator<IProvisionAgreementObject> paEnum = objs.GetProvisionAgreements("IMF").GetEnumerator();
            paEnum.MoveNext();
            IProvisionAgreementMutableObject pa = paEnum.Current.MutableInstance;
            pa.AddName("en", "English Test Name");
            newObjs.AddProvisionAgreement(pa.ImmutableInstance);
            singleObj.AddProvisionAgreement(pa.ImmutableInstance);
            Sdmx21Connector.UpdateArtefacts(singleObj);
            singleObj = new SdmxObjectsImpl();


            IDataProviderSchemeMutableObject dp = objs.GetDataProviderScheme("IMF").MutableInstance;
            dp.AddName("en", "English Test Name");
            newObjs.AddDataProviderScheme(dp.ImmutableInstance);
            singleObj.AddDataProviderScheme(dp.ImmutableInstance);
            Sdmx21Connector.UpdateArtefacts(singleObj);
            singleObj = new SdmxObjectsImpl();

            IDataConsumerSchemeMutableObject dc = objs.GetDataConsumerScheme("IMF").MutableInstance;
            dc.AddName("en", "English Test Name");
            newObjs.AddDataConsumerScheme(dc.ImmutableInstance);
            singleObj.AddDataConsumerScheme(dc.ImmutableInstance);
            Sdmx21Connector.UpdateArtefacts(singleObj);
            singleObj = new SdmxObjectsImpl();

            IEnumerator<IOrganisationUnitSchemeObject> ousEnum = objs.GetOrganisationUnitSchemes("IMF").GetEnumerator();
            ousEnum.MoveNext();
            IOrganisationUnitSchemeMutableObject ous = ousEnum.Current.MutableInstance;
            ous.AddName("en", "English Test Name");
            newObjs.AddOrganisationUnitScheme(ous.ImmutableInstance);
            singleObj.AddOrganisationUnitScheme(ous.ImmutableInstance);
            Sdmx21Connector.UpdateArtefacts(singleObj);
            singleObj = new SdmxObjectsImpl();

            IEnumerator<IStructureSetObject> ssEnum = objs.GetStructureSets("IMF").GetEnumerator();
            ssEnum.MoveNext();
            IStructureSetMutableObject ss = ssEnum.Current.MutableInstance;
            ss.AddName("en", "English Test Name");
            newObjs.AddStructureSet(ss.ImmutableInstance);
            singleObj.AddStructureSet(ss.ImmutableInstance);
            Sdmx21Connector.UpdateArtefacts(singleObj);
            singleObj = new SdmxObjectsImpl();

            IEnumerator<ICategorisationObject> catsEnum = objs.GetCategorisations("IMF").GetEnumerator();
            catsEnum.MoveNext();
            ICategorisationMutableObject cats = catsEnum.Current.MutableInstance;
            cats.AddName("en", "English Test Name");
            newObjs.AddCategorisation(cats.ImmutableInstance);
            singleObj.AddCategorisation(cats.ImmutableInstance);
            Sdmx21Connector.UpdateArtefacts(singleObj);

            return newObjs;
        }

        /// <summary>
        /// Creates a test data provider scheme and adds it to the list of SDMX objects to be created.
        /// </summary>
        /// <param name="objs">The SDMX objects to be created.</param>
        /// <param name="isFullSet">Whether the artefact has to be created with all its optional parameters or not.</param>
        /// <param name="isFinal">Whether the artefact has to be created as final or not.</param>
        private void CreateDataProviderScheme(ref ISdmxObjects objs, bool isFullSet)
        {
            IDataProviderSchemeMutableObject dps = new DataProviderSchemeMutableCore();
            dps.Id = "DATA_PROVIDERS";
            dps.AgencyId = "IMF";
            dps.Version = "1.0";
            dps.AddName("it", "Test Data Provider Scheme");

            if (isFullSet)
            {
                dps.Uri = new System.Uri("http://dataprovideruri.it");
                dps.StartDate = new DateTime(2017, 1, 1);
                dps.EndDate = new DateTime(2020, 12, 31);
                dps.AddDescription("it", "Data Provider Scheme Description");
                dps.AddAnnotation("Annotation Title", "ANNOTATION_TYPE", null);
            }

            IDataProviderMutableObject dp = new DataProviderMutableCore();
            dp.Id = "TEST_PROVIDER";
            dp.AddName("it", "Provider di test");
            dps.AddItem(dp);

            objs.AddDataProviderScheme(dps.ImmutableInstance);
        }

        /// <summary>
        /// Creates a test data consumer scheme and adds it to the list of SDMX objects to be created.
        /// </summary>
        /// <param name="objs">The SDMX objects to be created.</param>
        /// <param name="isFullSet">Whether the artefact has to be created with all its optional parameters or not.</param>
        /// <param name="isFinal">Whether the artefact has to be created as final or not.</param>
        private void CreateDataConsumerScheme(ref ISdmxObjects objs, bool isFullSet)
        {
            IDataConsumerSchemeMutableObject dcs = new DataConsumerSchemeMutableCore();
            dcs.Id = "DATA_CONSUMERS";
            dcs.AgencyId = "IMF";
            dcs.Version = "1.0";
            dcs.AddName("it", "Test Data Consumer Scheme");

            if (isFullSet)
            {
                dcs.Uri = new System.Uri("http://dataconsumeruri.it");
                dcs.StartDate = new DateTime(2017, 1, 1);
                dcs.EndDate = new DateTime(2020, 12, 31);
                dcs.AddDescription("it", "Data Consumer Scheme Description");
                dcs.AddAnnotation("Annotation Title", "ANNOTATION_TYPE", null);
            }

            IDataConsumerMutableObject dc = new DataConsumerMutableCore();
            dc.Id = "TEST_CONSUMER";
            dc.AddName("it", "Consumer di test");
            dcs.AddItem(dc);

            objs.AddDataConsumerScheme(dcs.ImmutableInstance);
        }

        /// <summary>
        /// Creates a test organisation scheme and adds it to the list of SDMX objects to be created.
        /// </summary>
        /// <param name="objs">The SDMX objects to be created.</param>
        /// <param name="isFullSet">Whether the artefact has to be created with all its optional parameters or not.</param>
        /// <param name="isFinal">Whether the artefact has to be created as final or not.</param>
        private void CreateOrganisationUnitScheme(ref ISdmxObjects objs, bool isFullSet, bool isFinal)
        {
            IOrganisationUnitSchemeMutableObject ous = new OrganisationUnitSchemeMutableCore();
            ous.Id = "ORG_UNIT";
            ous.AgencyId = "IMF";
            ous.Version = "1.0";
            ous.AddName("it", "Test Organization Unit Scheme");
            ous.FinalStructure = TertiaryBool.ParseBoolean(isFinal);

            if (isFullSet)
            {
                ous.Uri = new System.Uri("http://organizationurischemeuri.it");
                ous.StartDate = new DateTime(2017, 1, 1);
                ous.EndDate = new DateTime(2020, 12, 31);
                ous.AddDescription("it", "Organization Unit Scheme Description");
                ous.AddAnnotation("Annotation Title", "ANNOTATION_TYPE", null);
            }

            IOrganisationUnitMutableObject ou = new OrganisationUnitMutableCore();
            ou.Id = "TEST_ORGANISATION_UNIT";
            ou.AddName("it", "Organization Unit di test");
            ous.AddItem(ou);

            objs.AddOrganisationUnitScheme(ous.ImmutableInstance);
        }

        /// <summary>
        /// Creates a test provision agreement and adds it to the list of SDMX objects to be created.
        /// </summary>
        /// <param name="objs">The SDMX objects to be created.</param>
        /// <param name="isFullSet">Whether the artefact has to be created with all its optional parameters or not.</param>
        /// <param name="isFinal">Whether the artefact has to be created as final or not.</param>
        private void CreateProvisionAgreement(ref ISdmxObjects objs, bool isFullSet, bool isFinal)
        {
            IDataflowMutableObject df = new DataflowMutableCore();
            df.Id = "TEMP_DATAFLOW";
            df.AgencyId = "IMF";
            df.Version = "1.0";
            df.AddName("it", "Test Dataflow");
            IStructureReference dsdRef = new StructureReferenceImpl("TN1", "DSD_JUS", "1.1", SdmxStructureEnumType.Dsd);
            df.DataStructureRef = dsdRef;

            IProvisionAgreementMutableObject pa = new ProvisionAgreementMutableCore();
            pa.Id = "ID_PROVISION_AGREEMENT";
            pa.AgencyId = "IMF";
            pa.Version = "1.0";
            pa.AddName("it", "Test Provision Agreement");
            pa.FinalStructure = TertiaryBool.ParseBoolean(isFinal);

            if (isFullSet)
            {
                pa.Uri = new System.Uri("http://provisionagreementuri.it");
                pa.StartDate = new DateTime(2017, 1, 1);
                pa.EndDate = new DateTime(2020, 12, 31);
                pa.AddDescription("it", "Provision Agreement Description");
                pa.AddAnnotation("Annotation Title", "ANNOTATION_TYPE", null);
            }

            IStructureReference dpRef = new StructureReferenceImpl("FAO", "DATA_PROVIDERS", "1.0", SdmxStructureEnumType.DataProvider, "A");
            IStructureReference suRef = new StructureReferenceImpl("IMF", "TEMP_DATAFLOW", "1.0", SdmxStructureEnumType.Dataflow);

            pa.DataproviderRef = dpRef;
            pa.StructureUsage = suRef;

            objs.AddDataflow(df.ImmutableInstance);
            objs.AddProvisionAgreement(pa.ImmutableInstance);
        }

        /// <summary>
        /// Creates a test registration and adds it to the list of SDMX objects to be created.
        /// </summary>
        /// <param name="objs">The SDMX objects to be created.</param>
        /// <param name="isFullSet">Whether the artefact has to be created with all its optional parameters or not.</param>
        /// <param name="isFinal">Whether the artefact has to be created as final or not.</param>
        private void CreateRegistration(ref ISdmxObjects objs, bool isFullSet, bool isFinal)
        {
            IDataSourceMutableObject ds = new DataSourceMutableCore();
            ds.DataUrl = new System.Uri("http://dataurl.it");
            ds.WebServiceDatasource = false;
            ds.RESTDatasource = true;
            ds.SimpleDatasource = false;
            if (isFullSet)
            {
                ds.WADLUrl = new System.Uri("http://wadlurl.it");
                ds.WSDLUrl = new System.Uri("http://wsdlurl.it");
            }

            IRegistrationMutableObject reg = new RegistrationMutableCore();
            reg.Id = "ID_REGISTRATION";
            reg.AgencyId = "IMF";
            reg.Version = "1.0";
            reg.AddName("it", "Test Registration");
            reg.FinalStructure = TertiaryBool.ParseBoolean(isFinal);

            if (isFullSet)
            {
                //TO CHECK: dove memorizza questi se non è un artefatto??? vengono ignorati??
                reg.Uri = new System.Uri("http://registrationuri.it");
                reg.StartDate = new DateTime(2017, 1, 1);
                reg.EndDate = new DateTime(2020, 12, 31);
                reg.AddDescription("it", "Registration Description");
                reg.AddAnnotation("Annotation Title", "ANNOTATION_TYPE", null);

                reg.IndexAttributes = TertiaryBool.ParseBoolean(true);
                reg.IndexDataset = TertiaryBool.ParseBoolean(true);
                reg.IndexReportingPeriod = TertiaryBool.ParseBoolean(true);
                reg.IndexTimeseries = TertiaryBool.ParseBoolean(true);
                reg.ValidFrom = new DateTime(2017, 1, 1);
                reg.ValidTo = new DateTime(2020, 12, 31);
                reg.LastUpdated = DateTime.Now;
            }

            IStructureReference paRef = new StructureReferenceImpl("IMF", "ID_PROVISION_AGREEMENT", "1.0", SdmxStructureEnumType.ProvisionAgreement);

            reg.ProvisionAgreementRef = paRef;
            reg.DataSource = ds;

            objs.AddRegistration(reg.ImmutableInstance);
        }

        /// <summary>
        /// Creates a test structure set and adds it to the list of SDMX objects to be created.
        /// </summary>
        /// <param name="objs">The SDMX objects to be created.</param>
        /// <param name="isFullSet">Whether the artefact has to be created with all its optional parameters or not.</param>
        /// <param name="isFinal">Whether the artefact has to be created as final or not.</param>
        private void CreateStructureSet(ref ISdmxObjects objs, bool isFullSet, bool isFinal)
        {
            IStructureSetMutableObject ss = new StructureSetMutableCore();
            ss.Id = "ID_STRUCTURE_SET";
            ss.AgencyId = "IMF";
            ss.Version = "1.0";
            ss.AddName("it", "Test Structure Set");
            ss.FinalStructure = TertiaryBool.ParseBoolean(isFinal);

            if (isFullSet)
            {
                ss.Uri = new System.Uri("http://structureseturi.it");
                ss.StartDate = new DateTime(2017, 1, 1);
                ss.EndDate = new DateTime(2020, 12, 31);
                ss.AddDescription("it", "Structure Set Description");
                ss.AddAnnotation("Annotation Title", "ANNOTATION_TYPE", null);
            }

            ICodelistMapMutableObject clMap = new CodelistMapMutableCore();
            clMap.Id = "ID_CL_MAP";
            clMap.AddName("it", "Test Codelist Mapping");
            IStructureReference clRefSrc = new StructureReferenceImpl("IMF", "CL_ACCOUNT_ENTRY", "1.2", SdmxStructureEnumType.CodeList);
            IStructureReference clRefTrg = new StructureReferenceImpl("IMF", "CL_ACCOUNT_ENTRY", "1.2", SdmxStructureEnumType.CodeList);
            clMap.SourceRef = clRefSrc;
            clMap.TargetRef = clRefTrg;
            if (isFullSet)
            {
                clMap.AddDescription("it", "Codelist Map Description");
                clMap.AddAnnotation("Annotation Title", "ANNOTATION_TYPE", null);
            }

            IStructureMapMutableObject strMap = new StructureMapMutableCore();
            strMap.Id = "ID_STR_MAP";
            strMap.AddName("it", "Test Structure Mapping");
            IStructureReference strRefSrc = new StructureReferenceImpl("TN1", "DSD_JUS", "1.1", SdmxStructureEnumType.Dsd);
            IStructureReference strRefTrg = new StructureReferenceImpl("TN1", "DSD_JUS", "1.1", SdmxStructureEnumType.Dsd);
            if (isFullSet)
            {
                strMap.AddDescription("it", "Structure Map Description");
                strMap.AddAnnotation("Annotation Title", "ANNOTATION_TYPE", null);
            }

            IItemMapMutableObject m1 = new ItemMapMutableCore();
            m1.SourceId = "A";
            m1.TargetId = "A";
            clMap.AddItem(m1);

            IComponentMapMutableObject m2 = new ComponentMapMutableCore();
            m2.MapConceptRef = "FREQ";
            m2.MapTargetConceptRef = "FREQ";

            strMap.AddComponent(m2);

            strMap.SourceRef = strRefSrc;
            strMap.TargetRef = strRefTrg;

            ss.AddCodelistMap(clMap);
            ss.AddStructureMap(strMap);

            objs.AddStructureSet(ss.ImmutableInstance);
        }

        /// <summary>
        /// Creates a test categorisation and adds it to the list of SDMX objects to be created.
        /// </summary>
        /// <param name="objs">The SDMX objects to be created.</param>
        /// <param name="isFullSet">Whether the artefact has to be created with all its optional parameters or not.</param>
        /// <param name="isFinal">Whether the artefact has to be created as final or not.</param>
        private void CreateCategorisation(ref ISdmxObjects objs, bool isFullSet, bool isFinal)
        {
            ICodelistMutableObject cl = new CodelistMutableCore();
            cl.Id = "CL_TEMP";
            cl.AgencyId = "IMF";
            cl.Version = "1.0";
            cl.AddName("it", "Temp Codelist");

            ICategorisationMutableObject cat = new CategorisationMutableCore();
            cat.Id = "ID_CATEGORISATION_TEST";
            cat.AgencyId = "IMF";
            cat.Version = "1.0";
            cat.AddName("it", "Test Categorisation");
            cat.FinalStructure = TertiaryBool.ParseBoolean(isFinal);

            if (isFullSet)
            {
                cat.Uri = new System.Uri("http://categorisationuri.it");
                cat.StartDate = new DateTime(2017, 1, 1);
                cat.EndDate = new DateTime(2020, 12, 31);
                cat.AddDescription("it", "Categorisation Description");
                cat.AddAnnotation("Annotation Title", "ANNOTATION_TYPE", null);
            }

            IStructureReference catRef = new StructureReferenceImpl("ESTAT", "ESTAT_DATAFLOWS_SCHEME", "1.0", SdmxStructureEnumType.Category, "STS", "STSSERV", "TEST_MATTEO");
            IStructureReference strRef = new StructureReferenceImpl("IMF", "CL_TEMP", "1.0", SdmxStructureEnumType.CodeList);

            cat.CategoryReference = catRef;
            cat.StructureReference = strRef;

            objs.AddCodelist(cl.ImmutableInstance);
            objs.AddCategorisation(cat.ImmutableInstance);
        }
    }
}
