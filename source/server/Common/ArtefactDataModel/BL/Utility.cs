using ArtefactDataModel.Interface;
using ArtefactDataModel.Property;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using Newtonsoft.Json.Serialization;
using Org.Sdmxsource.Sdmx.Api.Constants;
using Org.Sdmxsource.Sdmx.Api.Model.Mutable.Base;
using Org.Sdmxsource.Sdmx.Api.Model.Mutable.DataStructure;
using Org.Sdmxsource.Sdmx.Api.Model.Mutable.Registry;
using Org.Sdmxsource.Sdmx.Api.Model.Objects;
using Org.Sdmxsource.Sdmx.Api.Model.Objects.Base;
using Org.Sdmxsource.Sdmx.Api.Model.Objects.Codelist;
using Org.Sdmxsource.Sdmx.Api.Model.Objects.MetadataStructure;
using Org.Sdmxsource.Sdmx.SdmxObjects.Model.Mutable.Base;
using Org.Sdmxsource.Sdmx.SdmxObjects.Model.Mutable.DataStructure;
using Org.Sdmxsource.Sdmx.SdmxObjects.Model.Mutable.MetadataStructure;
using Org.Sdmxsource.Sdmx.SdmxObjects.Model.Mutable.Registry;
using Org.Sdmxsource.Sdmx.SdmxObjects.Model.Objects.MetadataStructure;
using Org.Sdmxsource.Sdmx.Util.Objects.Reference;
using System;
using System.Collections.Generic;
using System.Linq;

namespace ArtefactDataModel.BL
{
    public class Utility
    {
        #region ToJson

        static public string ConvertToJson(ISet<IDataProviderScheme> dataProviderSchemes)
        {
            var allDataProviderScheme = new List<DataProviderScheme>();
            foreach (var item in dataProviderSchemes)
            {
                var newDataProviderScheme = new DataProviderScheme();
                newDataProviderScheme.Id = item.Id;
                newDataProviderScheme.AgencyID = item.AgencyId;
                newDataProviderScheme.Version = item.Version;
                newDataProviderScheme.IsFinal = item.IsFinal != null && item.IsFinal.IsTrue;
                newDataProviderScheme.IsPartial = item.Partial;
                newDataProviderScheme.IsExternalReference = item.IsExternalReference != null && item.IsExternalReference.IsTrue;
                newDataProviderScheme.Links.Add(new Link
                {
                    rel = "self",
                    urn = item.Urn.ToString(),
                    type = item.StructureType.StructureType.ToLowerInvariant()
                });

                if (item.StartDate != null)
                {
                    newDataProviderScheme.ValidFrom = item.StartDate.Date;
                }
                else
                {
                    newDataProviderScheme.ValidFrom = null;
                }
                if (item.EndDate != null)
                {
                    newDataProviderScheme.ValidTo = item.EndDate.Date;
                }
                else
                {
                    newDataProviderScheme.ValidTo = null;
                }

                foreach (var name in item.Names)
                {
                    newDataProviderScheme.Names.Add(name.Locale, name.Value);
                }
                foreach (var description in item.Descriptions)
                {
                    newDataProviderScheme.Descriptions.Add(description.Locale, description.Value);
                }

                newDataProviderScheme.DataProviders = createProvidersForSerialize(item.Items);

                newDataProviderScheme.Annotations = createAnnotationForSerialize(item.Annotations);

                allDataProviderScheme.Add(newDataProviderScheme);
            }

            var serialize = JsonConvert.SerializeObject(allDataProviderScheme, new JsonSerializerSettings { ContractResolver = new CamelCasePropertyNamesContractResolver() });
            return "{\"data\": { \"dataProviderSchemes\":" + serialize + "} }";
        }

        static public string ConvertToJson(ISet<IDataConsumerScheme> dataConsumerSchemes)
        {
            var allDataProviderScheme = new List<DataConsumerScheme>();
            foreach (var item in dataConsumerSchemes)
            {
                var newDataConsumerScheme = new DataConsumerScheme();
                newDataConsumerScheme.Id = item.Id;
                newDataConsumerScheme.AgencyID = item.AgencyId;
                newDataConsumerScheme.Version = item.Version;
                newDataConsumerScheme.IsFinal = item.IsFinal != null && item.IsFinal.IsTrue;
                newDataConsumerScheme.IsPartial = item.Partial;
                newDataConsumerScheme.IsExternalReference = item.IsExternalReference != null && item.IsExternalReference.IsTrue;
                newDataConsumerScheme.Links.Add(new Link
                {
                    rel = "self",
                    urn = item.Urn.ToString(),
                    type = item.StructureType.StructureType.ToLowerInvariant()
                });

                if (item.StartDate != null)
                {
                    newDataConsumerScheme.ValidFrom = item.StartDate.Date;
                }
                else
                {
                    newDataConsumerScheme.ValidFrom = null;
                }
                if (item.EndDate != null)
                {
                    newDataConsumerScheme.ValidTo = item.EndDate.Date;
                }
                else
                {
                    newDataConsumerScheme.ValidTo = null;
                }

                foreach (var name in item.Names)
                {
                    newDataConsumerScheme.Names.Add(name.Locale, name.Value);
                }
                foreach (var description in item.Descriptions)
                {
                    newDataConsumerScheme.Descriptions.Add(description.Locale, description.Value);
                }

                newDataConsumerScheme.DataConsumers = createConsumersForSerialize(item.Items);

                newDataConsumerScheme.Annotations = createAnnotationForSerialize(item.Annotations);

                allDataProviderScheme.Add(newDataConsumerScheme);
            }

            var serialize = JsonConvert.SerializeObject(allDataProviderScheme, new JsonSerializerSettings { ContractResolver = new CamelCasePropertyNamesContractResolver() });
            return "{\"data\": { \"dataConsumerSchemes\":" + serialize + "} }";
        }

        static public string ConvertToJson(ISet<IMetadataFlow> metadataFlows)
        {
            var allMetadataflow = new List<Metadataflow>();
            foreach (var item in metadataFlows)
            {
                var newMetadataflow = new Metadataflow();
                newMetadataflow.Id = item.Id;
                newMetadataflow.AgencyID = item.AgencyId;
                newMetadataflow.Version = item.Version;
                newMetadataflow.IsFinal = item.IsFinal != null && item.IsFinal.IsTrue;
                newMetadataflow.IsExternalReference = item.IsExternalReference != null && item.IsExternalReference.IsTrue;
                newMetadataflow.Links.Add(new Link
                {
                    rel = "self",
                    urn = item.Urn.ToString(),
                    type = item.StructureType.StructureType.ToLowerInvariant()
                });

                if (item.StartDate != null)
                {
                    newMetadataflow.ValidFrom = item.StartDate.Date;
                }
                else
                {
                    newMetadataflow.ValidFrom = null;
                }
                if (item.EndDate != null)
                {
                    newMetadataflow.ValidTo = item.EndDate.Date;
                }
                else
                {
                    newMetadataflow.ValidTo = null;
                }

                foreach (var name in item.Names)
                {
                    newMetadataflow.Names.Add(name.Locale, name.Value);
                }
                foreach (var description in item.Descriptions)
                {
                    newMetadataflow.Descriptions.Add(description.Locale, description.Value);
                }

                if (item.StructureUrl != null)
                {
                    newMetadataflow.Structure = item.StructureUrl.ToString();
                }

                newMetadataflow.Annotations = createAnnotationForSerialize(item.Annotations);

                allMetadataflow.Add(newMetadataflow);
            }


            var serialize = JsonConvert.SerializeObject(allMetadataflow, new JsonSerializerSettings { ContractResolver = new CamelCasePropertyNamesContractResolver() });
            return "{\"data\": { \"metadataflows\":" + serialize + "} }";
        }

        static public string ConvertToJson(ISet<IMetadataStructureDefinitionObject> metadataStructureDefinitionObjects)
        {
            var allMetadataflow = new List<MetadataStructure>();
            foreach (var item in metadataStructureDefinitionObjects)
            {
                var newMetadataflow = new MetadataStructure();
                newMetadataflow.Id = item.Id;
                newMetadataflow.AgencyID = item.AgencyId;
                newMetadataflow.Version = item.Version;
                newMetadataflow.IsFinal = item.IsFinal != null && item.IsFinal.IsTrue;
                newMetadataflow.IsExternalReference = item.IsExternalReference != null && item.IsExternalReference.IsTrue;
                newMetadataflow.Links.Add(new Link
                {
                    rel = "self",
                    urn = item.Urn.ToString(),
                    type = item.StructureType.StructureType.ToLowerInvariant()
                });

                if (item.StartDate != null)
                {
                    newMetadataflow.ValidFrom = item.StartDate.Date;
                }
                else
                {
                    newMetadataflow.ValidFrom = null;
                }
                if (item.EndDate != null)
                {
                    newMetadataflow.ValidTo = item.EndDate.Date;
                }
                else
                {
                    newMetadataflow.ValidTo = null;
                }

                foreach (var name in item.Names)
                {
                    newMetadataflow.Names.Add(name.Locale, name.Value);
                }
                foreach (var description in item.Descriptions)
                {
                    newMetadataflow.Descriptions.Add(description.Locale, description.Value);
                }

                newMetadataflow.MetadataStructureComponents = new MetadataStructureComponents();
                if (item != null && item.MetadataTargets != null)
                {
                    newMetadataflow.MetadataStructureComponents.MetadataTargets = createMetadataTargetsForSerialize(item.MetadataTargets);
                }
                if (item != null && item.ReportStructures != null)
                {
                    newMetadataflow.MetadataStructureComponents.ReportStructures = createMetadataTargetsForSerialize(item.ReportStructures);
                }

                newMetadataflow.Annotations = createAnnotationForSerialize(item.Annotations);

                allMetadataflow.Add(newMetadataflow);
            }


            var serialize = JsonConvert.SerializeObject(allMetadataflow, new JsonSerializerSettings { ContractResolver = new CamelCasePropertyNamesContractResolver() });
            return "{\"data\": { \"metadataflows\":" + serialize + "} }";
        }

        static public string ConvertToJson(ISet<IOrganisationUnitSchemeObject> organisationUnitSchemeObjects)
        {
            var allOrganisationUnitScheme = new List<OrganisationUnitScheme>();
            foreach (var item in organisationUnitSchemeObjects)
            {
                var newOrganisationUnitScheme = new OrganisationUnitScheme();
                newOrganisationUnitScheme.Id = item.Id;
                newOrganisationUnitScheme.AgencyID = item.AgencyId;
                newOrganisationUnitScheme.Version = item.Version;
                newOrganisationUnitScheme.IsPartial = item.Partial;
                newOrganisationUnitScheme.IsFinal = item.IsFinal != null && item.IsFinal.IsTrue;
                newOrganisationUnitScheme.IsExternalReference = item.IsExternalReference != null && item.IsExternalReference.IsTrue;
                newOrganisationUnitScheme.Links = new List<Link>();
                newOrganisationUnitScheme.Links.Add(new Link
                {
                    rel = "self",
                    urn = item.Urn.ToString(),
                    type = item.StructureType.StructureType.ToLowerInvariant()
                });

                if (item.StartDate != null)
                {
                    newOrganisationUnitScheme.ValidFrom = item.StartDate.Date;
                }
                else
                {
                    newOrganisationUnitScheme.ValidFrom = null;
                }
                if (item.EndDate != null)
                {
                    newOrganisationUnitScheme.ValidTo = item.EndDate.Date;
                }
                else
                {
                    newOrganisationUnitScheme.ValidTo = null;
                }

                newOrganisationUnitScheme.Names = new Dictionary<string, string>();
                foreach (var name in item.Names)
                {
                    newOrganisationUnitScheme.Names.Add(name.Locale, name.Value);
                }
                newOrganisationUnitScheme.Descriptions = new Dictionary<string, string>();
                foreach (var description in item.Descriptions)
                {
                    newOrganisationUnitScheme.Descriptions.Add(description.Locale, description.Value);
                }

                newOrganisationUnitScheme.OrganisationUnits = createOrganisationUnitSchemeObjects(item);

                newOrganisationUnitScheme.Annotations = createAnnotationForSerialize(item.Annotations);

                allOrganisationUnitScheme.Add(newOrganisationUnitScheme);
            }

            var serialize = JsonConvert.SerializeObject(allOrganisationUnitScheme, new JsonSerializerSettings { ContractResolver = new CamelCasePropertyNamesContractResolver() });
            return "{\"data\": { \"organisationUnitSchemes\":" + serialize + "} }";
        }

        static public string ConvertToJson(ISet<IHierarchicalCodelistObject> hierarchicalCodelistObject)
        {
            var allOrganisationUnitScheme = new List<HierarchicalCodelist>();
            foreach (var item in hierarchicalCodelistObject)
            {
                var newHierarchicalCodelist = new HierarchicalCodelist();
                newHierarchicalCodelist.Id = item.Id;
                newHierarchicalCodelist.AgencyID = item.AgencyId;
                newHierarchicalCodelist.Version = item.Version;
                newHierarchicalCodelist.IsFinal = item.IsFinal != null && item.IsFinal.IsTrue;
                newHierarchicalCodelist.IsExternalReference = item.IsExternalReference != null && item.IsExternalReference.IsTrue;
                newHierarchicalCodelist.Links = new List<Link>();
                newHierarchicalCodelist.Links.Add(new Link
                {
                    rel = "self",
                    urn = item.Urn.ToString(),
                    type = item.StructureType.StructureType.ToLowerInvariant()
                });

                if (item.StartDate != null)
                {
                    newHierarchicalCodelist.ValidFrom = item.StartDate.Date;
                }
                else
                {
                    newHierarchicalCodelist.ValidFrom = null;
                }
                if (item.EndDate != null)
                {
                    newHierarchicalCodelist.ValidTo = item.EndDate.Date;
                }
                else
                {
                    newHierarchicalCodelist.ValidTo = null;
                }

                newHierarchicalCodelist.Names = new Dictionary<string, string>();
                foreach (var name in item.Names)
                {
                    newHierarchicalCodelist.Names.Add(name.Locale, name.Value);
                }
                newHierarchicalCodelist.Descriptions = new Dictionary<string, string>();
                foreach (var description in item.Descriptions)
                {
                    newHierarchicalCodelist.Descriptions.Add(description.Locale, description.Value);
                }

                newHierarchicalCodelist.Annotations = createAnnotationForSerialize(item.Annotations);

                allOrganisationUnitScheme.Add(newHierarchicalCodelist);
            }

            var serialize = JsonConvert.SerializeObject(allOrganisationUnitScheme, new JsonSerializerSettings { ContractResolver = new CamelCasePropertyNamesContractResolver() });
            return "{\"data\": { \"hierarchicalCodelist\":" + serialize + "} }";
        }

        #region private

        static private List<OrganisationUnit> createOrganisationUnitSchemeObjects(IOrganisationUnitSchemeObject organisationUnitSchemeObject)
        {
            var allOrganisationUnit = new List<OrganisationUnit>();
            foreach (var item in organisationUnitSchemeObject.Items)
            {
                var newOrganisationUnit = new OrganisationUnit();
                newOrganisationUnit.Id = item.Id;
                newOrganisationUnit.Links = new List<Link>();
                newOrganisationUnit.Links.Add(new Link
                {
                    rel = "self",
                    urn = item.Urn.ToString(),
                    type = item.StructureType.StructureType.ToLowerInvariant()
                });

                newOrganisationUnit.Names = new Dictionary<string, string>();
                foreach (var name in item.Names)
                {
                    newOrganisationUnit.Names.Add(name.Locale, name.Value);
                }
                newOrganisationUnit.Descriptions = new Dictionary<string, string>();
                foreach (var description in item.Descriptions)
                {
                    newOrganisationUnit.Descriptions.Add(description.Locale, description.Value);
                }

                newOrganisationUnit.Parent = $"urn:sdmx:org.sdmx.infomodel.organisationunitscheme.OrganisationUnit={organisationUnitSchemeObject.AgencyId}:{organisationUnitSchemeObject.Id}({organisationUnitSchemeObject.Version}).{item.Id}";

                newOrganisationUnit.Contacts = createContactsForSerialize(item.Contacts);

                newOrganisationUnit.Annotations = createAnnotationForSerialize(item.Annotations);

                allOrganisationUnit.Add(newOrganisationUnit);
            }

            return allOrganisationUnit;
        }

        static private List<Annotation> createAnnotationForSerialize(IList<Org.Sdmxsource.Sdmx.Api.Model.Objects.Base.IAnnotation> annotations)
        {
            var listAnnotation = new List<Annotation>();
            foreach (var itemAnnotation in annotations)
            {
                var itemAdd = new Annotation
                {
                    Title = itemAnnotation.Title,
                    Type = itemAnnotation.Type,
                    Id = itemAnnotation.Id
                };
                foreach (var itemText in itemAnnotation.Text)
                {
                    itemAdd.Texts.Add(itemText.Locale, itemText.Value);
                }
                listAnnotation.Add(itemAdd);
            }

            return listAnnotation;
        }

        static private List<DataProvider> createProvidersForSerialize(IList<IDataProvider> dataProviders)
        {
            var allItem = new List<DataProvider>();
            foreach (var itemProvider in dataProviders)
            {
                var newDataProvider = new DataProvider();
                newDataProvider.Id = itemProvider.Id;
                newDataProvider.Name = itemProvider.Name;
                newDataProvider.Description = itemProvider.Description;
                foreach (var name in itemProvider.Names)
                {
                    newDataProvider.Names.Add(name.Locale, name.Value);
                }
                foreach (var description in itemProvider.Descriptions)
                {
                    newDataProvider.Descriptions.Add(description.Locale, description.Value);
                }
                newDataProvider.Links.Add(new Link
                {
                    rel = "self",
                    urn = itemProvider.Urn.ToString(),
                    type = itemProvider.StructureType.StructureType.ToLowerInvariant()
                });

                newDataProvider.Annotations = createAnnotationForSerialize(itemProvider.Annotations);
                newDataProvider.Contacts = createContactsForSerialize(itemProvider.Contacts);

                allItem.Add(newDataProvider);
            }

            return allItem;
        }

        static private List<DataConsumer> createConsumersForSerialize(IList<IDataConsumer> dataConsumers)
        {
            var allItem = new List<DataConsumer>();
            foreach (var itemDataConsumer in dataConsumers)
            {
                var newDataConsumer = new DataConsumer();
                newDataConsumer.Id = itemDataConsumer.Id;
                newDataConsumer.Name = itemDataConsumer.Name;
                newDataConsumer.Description = itemDataConsumer.Description;
                foreach (var name in itemDataConsumer.Names)
                {
                    newDataConsumer.Names.Add(name.Locale, name.Value);
                }
                foreach (var description in itemDataConsumer.Descriptions)
                {
                    newDataConsumer.Descriptions.Add(description.Locale, description.Value);
                }
                newDataConsumer.Links.Add(new Link
                {
                    rel = "self",
                    urn = itemDataConsumer.Urn.ToString(),
                    type = itemDataConsumer.StructureType.StructureType.ToLowerInvariant()
                });

                newDataConsumer.Annotations = createAnnotationForSerialize(itemDataConsumer.Annotations);
                newDataConsumer.Contacts = createContactsForSerialize(itemDataConsumer.Contacts);

                allItem.Add(newDataConsumer);
            }

            return allItem;
        }

        static private List<Contact> createContactsForSerialize(IList<IContact> contacts)
        {
            var listContact = new List<Contact>();
            foreach (var itemContact in contacts)
            {
                var newContact = new Contact();
                newContact.Id = itemContact.Id;
                if (itemContact.Name != null && itemContact.Name.Count > 0)
                {
                    newContact.Name = itemContact.Name[0].Value;
                    foreach (var name in itemContact.Name)
                    {
                        newContact.Names.Add(name.Locale, name.Value);
                    }
                }
                if (itemContact.Departments != null && itemContact.Departments.Count > 0)
                {
                    newContact.Department = itemContact.Departments[0].Value;
                    foreach (var department in itemContact.Departments)
                    {
                        newContact.Departments.Add(department.Locale, department.Value);
                    }
                }
                if (itemContact.Email != null)
                {
                    newContact.Emails.AddRange(itemContact.Email);
                }
                if (itemContact.Fax != null)
                {
                    newContact.Faxes.AddRange(itemContact.Fax);
                }
                if (itemContact.Role != null && itemContact.Role.Count > 0)
                {
                    newContact.Role = itemContact.Role[0].Value;
                    foreach (var role in itemContact.Role)
                    {
                        newContact.Roles.Add(role.Locale, role.Value);
                    }
                }
                if (itemContact.Telephone != null)
                {
                    newContact.Telephones.AddRange(itemContact.Telephone);
                }
                if (itemContact.Uri != null)
                {
                    newContact.Uris.AddRange(itemContact.Uri);
                }
                if (itemContact.X400 != null)
                {
                    newContact.X400s.AddRange(itemContact.X400);
                }
            }

            return listContact;
        }

        static private List<MetadataTarget> createMetadataTargetsForSerialize(IList<IMetadataTarget> metadataTargets)
        {
            var allTarget = new List<MetadataTarget>();

            foreach (var itemMetadataTarget in metadataTargets)
            {
                var newMetadataTarget = new MetadataTarget();
                newMetadataTarget.Id = itemMetadataTarget.Id;
                if (itemMetadataTarget.StructureType != null)
                {
                    newMetadataTarget.Type = itemMetadataTarget.StructureType.StructureType;
                }
                newMetadataTarget.Links.Add(new Link
                {
                    rel = "self",
                    urn = itemMetadataTarget.Urn.ToString(),
                    type = itemMetadataTarget.StructureType.StructureType.ToLowerInvariant()
                });
                newMetadataTarget.Annotations = createAnnotationForSerialize(itemMetadataTarget.Annotations);
                newMetadataTarget.ConstraintContentTargets = createConstraintContentTargetsForSerialize(itemMetadataTarget.ConstraintContentTarget);
                newMetadataTarget.DataSetTargets = createDataSetTargetsForSerialize(itemMetadataTarget.DataSetTarget);
                newMetadataTarget.IdentifiableObjectTargets = createIdentifiableTargetsForSerialize(itemMetadataTarget.IdentifiableTarget);
                newMetadataTarget.KeyDescriptorValuesTargets = createKeyDescriptorValuesTargetsForSerialize(itemMetadataTarget.KeyDescriptorValuesTarget);
                newMetadataTarget.ReportPeriodTargets = createReportPeriodTargetsForSerialize(itemMetadataTarget.ReportPeriodTarget);

                allTarget.Add(newMetadataTarget);
            }

            return allTarget;
        }

        static private List<ConstraintContentTarget> createConstraintContentTargetsForSerialize(IConstraintContentTarget itemConstraintContentTarget)
        {
            var allTarget = new List<ConstraintContentTarget>();

            var newMetadataTarget = new ConstraintContentTarget();
            newMetadataTarget.Id = itemConstraintContentTarget.Id;
            newMetadataTarget.Links.Add(new Link
            {
                rel = "self",
                urn = itemConstraintContentTarget.Urn.ToString(),
                type = itemConstraintContentTarget.StructureType.StructureType.ToLowerInvariant()
            });
            newMetadataTarget.Annotations = createAnnotationForSerialize(itemConstraintContentTarget.Annotations);
            //TODO IMPLEMENTARE newMetadataTarget.LocalRepresentation
            allTarget.Add(newMetadataTarget);
            return allTarget;
        }

        static private List<DataSetTarget> createDataSetTargetsForSerialize(IDataSetTarget itemDataSetTarget)
        {
            var allTarget = new List<DataSetTarget>();

            var newMetadataTarget = new DataSetTarget();
            newMetadataTarget.Id = itemDataSetTarget.Id;
            newMetadataTarget.Links.Add(new Link
            {
                rel = "self",
                urn = itemDataSetTarget.Urn.ToString(),
                type = itemDataSetTarget.StructureType.StructureType.ToLowerInvariant()
            });
            newMetadataTarget.Annotations = createAnnotationForSerialize(itemDataSetTarget.Annotations);
            //TODO IMPLEMENTARE newMetadataTarget.LocalRepresentation
            allTarget.Add(newMetadataTarget);
            return allTarget;
        }

        static private List<IdentifiableObjectTarget> createIdentifiableTargetsForSerialize(IList<IIdentifiableTarget> identifiableTargets)
        {
            var allTarget = new List<IdentifiableObjectTarget>();

            foreach (var item in identifiableTargets)
            {
                var newIdentifiableObjectTarget = new IdentifiableObjectTarget();
                newIdentifiableObjectTarget.Id = item.Id;
                newIdentifiableObjectTarget.Links.Add(new Link
                {
                    rel = "self",
                    urn = item.Urn.ToString(),
                    type = item.StructureType.StructureType.ToLowerInvariant()
                });
                newIdentifiableObjectTarget.Annotations = createAnnotationForSerialize(item.Annotations);
                //TODO IMPLEMENTARE newIdentifiableObjectTarget.ObjectType
                //TODO IMPLEMENTARE newMetadataTarget.LocalRepresentation
                allTarget.Add(newIdentifiableObjectTarget);
            }

            return allTarget;
        }

        static private List<KeyDescriptorValuesTarget> createKeyDescriptorValuesTargetsForSerialize(IKeyDescriptorValuesTarget keyDescriptorValuesTarget)
        {
            var allTarget = new List<KeyDescriptorValuesTarget>();

            var newIdentifiableObjectTarget = new KeyDescriptorValuesTarget();
            newIdentifiableObjectTarget.Id = keyDescriptorValuesTarget.Id;
            newIdentifiableObjectTarget.Links.Add(new Link
            {
                rel = "self",
                urn = keyDescriptorValuesTarget.Urn.ToString(),
                type = keyDescriptorValuesTarget.StructureType.StructureType.ToLowerInvariant()
            });
            newIdentifiableObjectTarget.Annotations = createAnnotationForSerialize(keyDescriptorValuesTarget.Annotations);
            //TODO IMPLEMENTARE newMetadataTarget.LocalRepresentation
            allTarget.Add(newIdentifiableObjectTarget);

            return allTarget;
        }

        static private List<ReportPeriodTarget> createReportPeriodTargetsForSerialize(IReportPeriodTarget reportPeriodTarget)
        {
            var allTarget = new List<ReportPeriodTarget>();

            var newIdentifiableObjectTarget = new ReportPeriodTarget();
            newIdentifiableObjectTarget.Id = reportPeriodTarget.Id;
            newIdentifiableObjectTarget.Links.Add(new Link
            {
                rel = "self",
                urn = reportPeriodTarget.Urn.ToString(),
                type = reportPeriodTarget.StructureType.StructureType.ToLowerInvariant()
            });
            newIdentifiableObjectTarget.Annotations = createAnnotationForSerialize(reportPeriodTarget.Annotations);
            //TODO IMPLEMENTARE newMetadataTarget.LocalRepresentation
            allTarget.Add(newIdentifiableObjectTarget);

            return allTarget;
        }

        static private List<ReportStructure> createMetadataTargetsForSerialize(IList<IReportStructure> reportStructures)
        {
            var allTarget = new List<ReportStructure>();

            foreach (var iReportStructure in reportStructures)
            {
                var newReportStructure = new ReportStructure();
                newReportStructure.Id = iReportStructure.Id;
                newReportStructure.Links.Add(new Link
                {
                    rel = "self",
                    urn = iReportStructure.Urn.ToString(),
                    type = iReportStructure.StructureType.StructureType.ToLowerInvariant()
                });
                newReportStructure.Annotations = createAnnotationForSerialize(iReportStructure.Annotations);
                newReportStructure.MetadataAttributes = createMetadataTargetsForSerialize(iReportStructure.MetadataAttributes);
                //TODO IMPLEMENTARE newReportStructure.MetadataTargets
                //TODO IMPLEMENTARE newMetadataTarget.LocalRepresentation

                allTarget.Add(newReportStructure);
            }

            return allTarget;
        }

        static private List<MetadataAttribute> createMetadataTargetsForSerialize(IList<IMetadataAttributeObject> metadataAttributeObject)
        {
            var allTarget = new List<MetadataAttribute>();

            foreach (var iMetaAttr in metadataAttributeObject)
            {
                var newReportStructure = new MetadataAttribute();
                newReportStructure.Id = iMetaAttr.Id;
                newReportStructure.Links.Add(new Link
                {
                    rel = "self",
                    urn = iMetaAttr.Urn.ToString(),
                    type = iMetaAttr.StructureType.StructureType.ToLowerInvariant()
                });
                newReportStructure.Annotations = createAnnotationForSerialize(iMetaAttr.Annotations);
                newReportStructure.IsPresentational = iMetaAttr.Presentational != null && iMetaAttr.Presentational.IsTrue;
                if (iMetaAttr.MaxOccurs.HasValue)
                {
                    newReportStructure.MaxOccurs = iMetaAttr.MaxOccurs.Value.ToString();
                }
                else
                {
                    newReportStructure.MaxOccurs = "unbounded";
                }
                if (iMetaAttr.MinOccurs.HasValue)
                {
                    newReportStructure.MinOccurs = iMetaAttr.MinOccurs.Value;
                }
                //TODO IMPLEMENTARE newReportStructure.ConceptIdentity
                //TODO IMPLEMENTARE newMetadataTarget.LocalRepresentation
                allTarget.Add(newReportStructure);
            }

            return allTarget;
        }

        #endregion

        #endregion

        #region ToObject

        static public void ParseDSD(ISdmxObjects bean, string json)
        {
            JObject objGeneric = JObject.Parse(json);
            if (objGeneric["data"] == null || objGeneric["data"]["dataStructures"] == null)
            {
                return;
            }
            JToken dataStructures = objGeneric["data"]["dataStructures"];
            ParseDSD(bean, dataStructures);
        }

        static public void ParseDSD(ISdmxObjects bean, JToken dataStructures)
        {
            if (dataStructures == null)
            {
                return;
            }

            foreach (var item in dataStructures)
            {
                var dsd = JsonConvert.DeserializeObject<DataStructure>(item.ToString());

                IDataStructureMutableObject dataStructureMutableCore = new DataStructureMutableCore();
                foreach (var name in dsd.Names)
                {
                    dataStructureMutableCore.AddName(name.Key, name.Value);
                }
                if (dsd.Description != null)
                {
                    foreach (var desc in dsd.Descriptions)
                    {
                        dataStructureMutableCore.AddName(desc.Key, desc.Value);
                    }
                }
                dataStructureMutableCore.Id = dsd.Id;
                dataStructureMutableCore.AgencyId = dsd.AgencyID;
                dataStructureMutableCore.Version = dsd.Version;
                if (dsd.ValidFrom > DateTime.MinValue)
                {
                    dataStructureMutableCore.StartDate = dsd.ValidFrom;
                }
                if (dsd.ValidTo > DateTime.MinValue)
                {
                    dataStructureMutableCore.EndDate = dsd.ValidTo;
                }

                dataStructureMutableCore.FinalStructure = TertiaryBool.ParseBoolean(dsd.IsFinal);

                if (dsd.Annotations != null)
                {
                    foreach (var itemAnnotation in dsd.Annotations)
                    {
                        dataStructureMutableCore.AddAnnotation(createSdmxAnnotation(itemAnnotation));
                    }
                }

                if (dsd.DataStructureComponents != null)
                {
                    if (dsd.DataStructureComponents.AttributeList != null)
                    {
                        foreach (var itemAttr in dsd.DataStructureComponents.AttributeList.Attributes)
                        {
                            dataStructureMutableCore.AddAttribute(createSdmxAttribure(itemAttr));
                        }
                    }

                    if (dsd.DataStructureComponents.DimensionList != null)
                    {
                        setSdmxDimension(dataStructureMutableCore, dsd);
                    }

                    if (dsd.DataStructureComponents.MeasureList != null && dsd.DataStructureComponents.MeasureList.PrimaryMeasure != null)
                    {
                        dataStructureMutableCore.PrimaryMeasure = new PrimaryMeasureMutableCore();
                        dataStructureMutableCore.PrimaryMeasure.ConceptRef = SetSdmxConceptRef(dsd.DataStructureComponents.MeasureList.PrimaryMeasure.ConceptIdentity);
                        dataStructureMutableCore.PrimaryMeasure.Representation = SetSdmxRappresentation(dsd.DataStructureComponents.MeasureList.PrimaryMeasure.LocalRepresentation, true);
                        if (dsd.DataStructureComponents.MeasureList.PrimaryMeasure.Annotations != null)
                        {
                            foreach (var itemAnn in dsd.DataStructureComponents.MeasureList.PrimaryMeasure.Annotations)
                            {
                                dataStructureMutableCore.PrimaryMeasure.AddAnnotation(createSdmxAnnotation(itemAnn));
                            }
                        }
                    }

                    if (dsd.DataStructureComponents.Groups != null)
                    {
                        foreach (var itemGrp in dsd.DataStructureComponents.Groups)
                        {
                            IGroupMutableObject group = new GroupMutableCore();
                            group.Id = itemGrp.Id;
                            foreach (var itemGrpDim in itemGrp.GroupDimensions)
                            {
                                group.DimensionRef.Add(itemGrpDim);
                            }
                            dataStructureMutableCore.AddGroup(group);
                        }
                    }

                }
                bean.AddDataStructure(dataStructureMutableCore.ImmutableInstance);
            }
        }

        static public void ParseMetadataflow(ISdmxObjects bean, string json)
        {
            JObject objGeneric = JObject.Parse(json);
            if (objGeneric["data"] == null || objGeneric["data"]["metadataflows"] == null)
            {
                return;
            }
            JToken metadataflows = objGeneric["data"]["metadataflows"];
            ParseMetadataflow(bean, metadataflows);
        }

        static public void ParseMetadataflow(ISdmxObjects bean, JToken metadataflows)
        {
            if (metadataflows == null)
            {
                return;
            }

            foreach (var item in metadataflows)
            {
                var sourceMetadataflow = JsonConvert.DeserializeObject<Metadataflow>(item.ToString());

                var metadataflow = new Org.Sdmx.Resources.SdmxMl.Schemas.V21.Structure.MetadataflowType();
                if (metadataflow.Annotations == null)
                {
                    metadataflow.Annotations = new Org.Sdmx.Resources.SdmxMl.Schemas.V21.Common.Annotations();
                }
                if (metadataflow.Annotations.Annotation == null)
                {
                    metadataflow.Annotations.Annotation = new List<Org.Sdmx.Resources.SdmxMl.Schemas.V21.Common.AnnotationType>();
                }
                foreach (var name in sourceMetadataflow.Names)
                {
                    metadataflow.Name.Add(new Org.Sdmx.Resources.SdmxMl.Schemas.V21.Common.Name { lang = name.Key, TypedValue = name.Value });
                }
                if (sourceMetadataflow.Descriptions != null)
                {
                    foreach (var desc in sourceMetadataflow.Descriptions)
                    {
                        metadataflow.Description.Add(new Org.Sdmx.Resources.SdmxMl.Schemas.V21.Common.Description { lang = desc.Key, TypedValue = desc.Value });
                    }
                }
                metadataflow.id = sourceMetadataflow.Id;
                metadataflow.agencyID = sourceMetadataflow.AgencyID;
                metadataflow.version = sourceMetadataflow.Version;
                if (sourceMetadataflow.ValidFrom > DateTime.MinValue)
                {
                    metadataflow.validFrom = sourceMetadataflow.ValidFrom;
                }
                if (sourceMetadataflow.ValidTo > DateTime.MinValue)
                {
                    metadataflow.validTo = sourceMetadataflow.ValidTo;
                }

                metadataflow.isFinal = sourceMetadataflow.IsFinal;
                if (!string.IsNullOrWhiteSpace(sourceMetadataflow.Structure))
                {
                    var subStr = sourceMetadataflow.Structure.Substring(sourceMetadataflow.Structure.LastIndexOf('=') + 1);

                    var splitOne = subStr.Split(":");

                    int index = splitOne[1].IndexOf(")");
                    if (index > 0)
                    {
                        splitOne[1] = splitOne[1].Substring(0, index);
                    }
                    var splitTwo = splitOne[1].Split("(");

                    var refType = new Org.Sdmx.Resources.SdmxMl.Schemas.V21.Common.MetadataStructureRefType();
                    var metadataStructureReferenceType = new Org.Sdmx.Resources.SdmxMl.Schemas.V21.Common.MetadataStructureReferenceType();
                    metadataflow.SetStructure(metadataStructureReferenceType);
                    metadataStructureReferenceType.SetTypedRef(refType);
                    refType.id = splitTwo[0];
                    refType.agencyID = splitOne[0];
                    refType.version = splitTwo[1];
                    refType.package = "metadatastructure";
                    refType.@class = "MetadataStructure";
                }

                if (sourceMetadataflow.Annotations != null)
                {
                    foreach (var itemAnn in sourceMetadataflow.Annotations)
                    {
                        var annItemCore = new Org.Sdmx.Resources.SdmxMl.Schemas.V21.Common.AnnotationType();
                        if (!string.IsNullOrWhiteSpace(itemAnn.Id))
                        {
                            annItemCore.id = itemAnn.Id;
                        }
                        if (!string.IsNullOrWhiteSpace(itemAnn.Title))
                        {
                            annItemCore.AnnotationTitle = itemAnn.Title;
                        }
                        if (!string.IsNullOrWhiteSpace(itemAnn.Type))
                        {
                            annItemCore.AnnotationType1 = itemAnn.Type;
                        }
                        if (itemAnn.Texts != null)
                        {
                            foreach (var itemTxt in itemAnn.Texts)
                            {
                                var itemText = new Org.Sdmx.Resources.SdmxMl.Schemas.V21.Common.TextType();
                                itemText.lang = itemTxt.Key;
                                itemText.TypedValue = itemTxt.Value;
                                annItemCore.AnnotationText.Add(itemText); ;
                            }
                        }
                        metadataflow.Annotations.Annotation.Add(annItemCore);
                    }
                }

                bean.AddMetadataFlow(new MetadataflowObjectCore(metadataflow));
            }
        }

        static public void ParseContentConstraints(ISdmxObjects bean, string json)
        {
            JObject objGeneric = JObject.Parse(json);
            if (objGeneric["data"] == null || objGeneric["data"]["contentConstraints"] == null)
            {
                return;
            }
            JToken contentConstraints = objGeneric["data"]["contentConstraints"];
            ParseContentConstraints(bean, contentConstraints);
        }

        static public void ParseContentConstraints(ISdmxObjects bean, JToken contentConstraints)
        {
            if (contentConstraints == null)
            {
                return;
            }

            foreach (var item in contentConstraints)
            {
                var sourceContentConstraint = JsonConvert.DeserializeObject<ContentConstraint>(item.ToString());

                IContentConstraintMutableObject contentConstr = new ContentConstraintMutableCore();

                foreach (var name in sourceContentConstraint.Names)
                {
                    contentConstr.AddName(name.Key, name.Value);
                }
                foreach (var name in sourceContentConstraint.Descriptions)
                {
                    contentConstr.AddDescription(name.Key, name.Value);
                }

                contentConstr.Id = sourceContentConstraint.Id;
                contentConstr.AgencyId = sourceContentConstraint.AgencyID;
                contentConstr.Version = sourceContentConstraint.Version;

                contentConstr.ExternalReference = TertiaryBool.ParseBoolean(sourceContentConstraint.IsExternalReference);

                if (sourceContentConstraint.ValidFrom > DateTime.MinValue)
                {
                    contentConstr.StartDate = sourceContentConstraint.ValidFrom;
                }
                if (sourceContentConstraint.ValidTo > DateTime.MinValue)
                {
                    contentConstr.EndDate = sourceContentConstraint.ValidTo;
                }

                contentConstr.FinalStructure = TertiaryBool.ParseBoolean(sourceContentConstraint.IsFinal);

                foreach (var itemAnnotation in sourceContentConstraint.Annotations)
                {
                    contentConstr.AddAnnotation(createSdmxAnnotation(itemAnnotation));
                }

                contentConstr.IsDefiningActualDataPresent = sourceContentConstraint.Equals("Actual");
                contentConstr.IncludedCubeRegion = new CubeRegionMutableCore();
                contentConstr.ExcludedCubeRegion = new CubeRegionMutableCore();
                foreach (var itemcube in sourceContentConstraint.CubeRegions)
                {
                    foreach (var itemcubeKey in itemcube.KeyValues)
                    {
                        //var cubeRegion = new CubeRegionMutableCore();
                        var itemKeyValue = new KeyValuesMutableImpl();
                        itemKeyValue.Id = itemcubeKey.Id;
                        foreach (var itemAdd in itemcubeKey.Values)
                        {
                            itemKeyValue.KeyValues.Add(itemAdd);
                        }
                        //cubeRegion.AddKeyValue(itemKeyValue);

                        if (itemcube.IsIncluded)
                        {
                            contentConstr.IncludedCubeRegion.AddKeyValue(itemKeyValue);
                        }
                        else
                        {
                            contentConstr.ExcludedCubeRegion.AddKeyValue(itemKeyValue);
                        }
                    }
                }

                bean.AddContentConstraintObject(contentConstr.ImmutableInstance);
            }
        }

        static public void ParseMetadataStructure(ISdmxObjects bean, string json)
        {
            JObject objGeneric = JObject.Parse(json);
            if (objGeneric["data"] == null || objGeneric["data"]["msds"] == null)
            {
                return;
            }
            JToken metadataStructure = objGeneric["data"]["msds"];
            ParseMetadataStructure(bean, metadataStructure);
        }

        static public void ParseMetadataStructure(ISdmxObjects bean, JToken metadataStructure)
        {
            if (metadataStructure == null)
            {
                return;
            }

            foreach (var item in metadataStructure)
            {
                var sourceMetadatastructure = JsonConvert.DeserializeObject<MetadataStructure>(item.ToString());

                var metadatastructureMutable = new MetadataStructureDefinitionMutableCore();

                foreach (var name in sourceMetadatastructure.Names)
                {
                    metadatastructureMutable.AddName(name.Key, name.Value);
                }
                if (sourceMetadatastructure.Description != null)
                {
                    foreach (var desc in sourceMetadatastructure.Descriptions)
                    {
                        metadatastructureMutable.AddDescription(desc.Key, desc.Value);
                    }
                }
                metadatastructureMutable.Id = sourceMetadatastructure.Id;
                metadatastructureMutable.AgencyId = sourceMetadatastructure.AgencyID;
                metadatastructureMutable.Version = sourceMetadatastructure.Version;
                if (sourceMetadatastructure.ValidFrom > DateTime.MinValue)
                {
                    metadatastructureMutable.StartDate = sourceMetadatastructure.ValidFrom;
                }
                if (sourceMetadatastructure.ValidTo > DateTime.MinValue)
                {
                    metadatastructureMutable.EndDate = sourceMetadatastructure.ValidTo;
                }

                foreach (var itemAnnotation in sourceMetadatastructure.Annotations)
                {
                    metadatastructureMutable.AddAnnotation(createSdmxAnnotation(itemAnnotation));
                }

                metadatastructureMutable.FinalStructure = TertiaryBool.ParseBoolean(sourceMetadatastructure.IsFinal);

                foreach (var itemTarget in sourceMetadatastructure?.MetadataStructureComponents?.MetadataTargets)
                {
                    var metadatataTargetMutable = new MetadataTargetMutableCore
                    {
                        Id = itemTarget.Id,
                        StructureType = SdmxStructureType.GetFromEnum(GetArtefactTypeEnum(itemTarget.Type))
                    };
                    foreach (var itemIdentifiableTarget in itemTarget.IdentifiableObjectTargets)
                    {
                        var itemIdentifiableTargetMutable = new IdentifiableTargetMutableCore
                        {
                            Id = itemIdentifiableTarget.Id,
                            ConceptRef = SetSdmxConceptRef(itemIdentifiableTarget.LocalRepresentation.Enumeration)
                        };
                        foreach (var itemAnnotation in itemIdentifiableTarget.Annotations)
                        {
                            itemIdentifiableTargetMutable.AddAnnotation(createSdmxAnnotation(itemAnnotation));
                        }
                        metadatataTargetMutable.IdentifiableTarget.Add(itemIdentifiableTargetMutable);
                    }
                    foreach (var itemAnnotation in itemTarget.Annotations)
                    {
                        metadatataTargetMutable.AddAnnotation(createSdmxAnnotation(itemAnnotation));
                    }
                    metadatastructureMutable.MetadataTargets.Add(metadatataTargetMutable);
                }

                foreach (var itemStructure in sourceMetadatastructure?.MetadataStructureComponents?.ReportStructures)
                {
                    var reportStructureMutable = new ReportStructureMutableCore();
                    reportStructureMutable.Id = itemStructure.Id;
                    foreach (var itemAnnotation in itemStructure.Annotations)
                    {
                        reportStructureMutable.AddAnnotation(createSdmxAnnotation(itemAnnotation));
                    }
                    foreach (var itemRef in itemStructure.MetadataTargets)
                    {
                        reportStructureMutable.TargetMetadatas.Add(itemRef);
                    }
                    foreach (var itemAttribute in itemStructure?.MetadataAttributes)
                    {
                        reportStructureMutable.MetadataAttributes.Add(createSdmxMetadataAttribute(itemAttribute));
                    }
                    metadatastructureMutable.ReportStructures.Add(reportStructureMutable);
                }

                bean.AddMetadataStructure(metadatastructureMutable.ImmutableInstance);
            }
        }

        static public void ParseDataProviderScheme(ISdmxObjects bean, string json)
        {
            JObject objGeneric = JObject.Parse(json);
            if (objGeneric["data"] == null || objGeneric["data"]["dataProviderSchemes"] == null)
            {
                return;
            }
            JToken dataProviderScheme = objGeneric["data"]["dataProviderSchemes"];
            ParseMetadataStructure(bean, dataProviderScheme);
        }

        static public void ParseDataProviderScheme(ISdmxObjects bean, JToken dataProviderScheme)
        {
            if (dataProviderScheme == null)
            {
                return;
            }

            foreach (var item in dataProviderScheme)
            {
                var sourceDataProviderScheme = JsonConvert.DeserializeObject<DataProviderScheme>(item.ToString());

                IDataProviderSchemeMutableObject dataProvSchema = new DataProviderSchemeMutableCore();

                foreach (var name in sourceDataProviderScheme.Names)
                {
                    dataProvSchema.AddName(name.Key, name.Value);
                }
                foreach (var name in sourceDataProviderScheme.Descriptions)
                {
                    dataProvSchema.AddDescription(name.Key, name.Value);
                }

                dataProvSchema.Id = sourceDataProviderScheme.Id;
                dataProvSchema.AgencyId = sourceDataProviderScheme.AgencyID;
                dataProvSchema.Version = sourceDataProviderScheme.Version;

                dataProvSchema.ExternalReference = TertiaryBool.ParseBoolean(sourceDataProviderScheme.IsExternalReference);

                if (sourceDataProviderScheme.ValidFrom > DateTime.MinValue)
                {
                    dataProvSchema.StartDate = sourceDataProviderScheme.ValidFrom;
                }
                if (sourceDataProviderScheme.ValidTo > DateTime.MinValue)
                {
                    dataProvSchema.EndDate = sourceDataProviderScheme.ValidTo;
                }

                dataProvSchema.FinalStructure = TertiaryBool.ParseBoolean(sourceDataProviderScheme.IsFinal);

                if (sourceDataProviderScheme.Annotations != null)
                {
                    foreach (var itemAnnotation in sourceDataProviderScheme.Annotations)
                    {
                        dataProvSchema.AddAnnotation(createSdmxAnnotation(itemAnnotation));
                    }
                }

                if (sourceDataProviderScheme.DataProviders != null)
                {
                    foreach (var itemDataProv in sourceDataProviderScheme.DataProviders)
                    {
                        dataProvSchema.AddItem(createSdmxDataProvider(itemDataProv));
                    }
                }
            }
        }

        static public void ParseDataConsumerSchemes(ISdmxObjects bean, string json)
        {
            JObject objGeneric = JObject.Parse(json);
            if (objGeneric["data"] == null || objGeneric["data"]["dataConsumerSchemes"] == null)
            {
                return;
            }
            JToken dataConsumerSchemes = objGeneric["data"]["dataConsumerSchemes"];
            ParseDataConsumerSchemes(bean, dataConsumerSchemes);
        }

        static public void ParseDataConsumerSchemes(ISdmxObjects bean, JToken dataConsumerSchemes)
        {
            if (dataConsumerSchemes == null)
            {
                return;
            }

            foreach (var item in dataConsumerSchemes)
            {
                var sourceContentConstraint = JsonConvert.DeserializeObject<DataConsumerScheme>(item.ToString());

                IDataProviderSchemeMutableObject dataProvSchema = new DataProviderSchemeMutableCore();

                foreach (var name in sourceContentConstraint.Names)
                {
                    dataProvSchema.AddName(name.Key, name.Value);
                }
                foreach (var name in sourceContentConstraint.Descriptions)
                {
                    dataProvSchema.AddDescription(name.Key, name.Value);
                }

                dataProvSchema.Id = sourceContentConstraint.Id;
                dataProvSchema.AgencyId = sourceContentConstraint.AgencyID;
                dataProvSchema.Version = sourceContentConstraint.Version;

                dataProvSchema.ExternalReference = TertiaryBool.ParseBoolean(sourceContentConstraint.IsExternalReference);

                if (sourceContentConstraint.ValidFrom > DateTime.MinValue)
                {
                    dataProvSchema.StartDate = sourceContentConstraint.ValidFrom;
                }
                if (sourceContentConstraint.ValidTo > DateTime.MinValue)
                {
                    dataProvSchema.EndDate = sourceContentConstraint.ValidTo;
                }

                dataProvSchema.FinalStructure = TertiaryBool.ParseBoolean(sourceContentConstraint.IsFinal);

                if (sourceContentConstraint.Annotations != null)
                {
                    foreach (var itemAnnotation in sourceContentConstraint.Annotations)
                    {
                        dataProvSchema.AddAnnotation(createSdmxAnnotation(itemAnnotation));
                    }
                }

                if (sourceContentConstraint.DataConsumers != null)
                {
                    foreach (var itemDataCons in sourceContentConstraint.DataConsumers)
                    {
                        dataProvSchema.AddItem(createSdmxDataConsumer(itemDataCons));
                    }
                }
            }
        }

        static public void ParseOrganisationUnitSchemes(ISdmxObjects bean, string json)
        {
            JObject objGeneric = JObject.Parse(json);
            if (objGeneric["data"] == null || objGeneric["data"]["organisationUnitSchemes"] == null)
            {
                return;
            }
            JToken organisationUnitSchemes = objGeneric["data"]["organisationUnitSchemes"];
            ParseOrganisationUnitSchemes(bean, organisationUnitSchemes);
        }

        static public void ParseOrganisationUnitSchemes(ISdmxObjects bean, JToken organisationUnitSchemes)
        {
            if (organisationUnitSchemes == null)
            {
                return;
            }

            foreach (var item in organisationUnitSchemes)
            {
                var organisationUnitScheme = JsonConvert.DeserializeObject<OrganisationUnitScheme>(item.ToString());

                IDataProviderSchemeMutableObject newOrgUnitSchema = new DataProviderSchemeMutableCore();

                foreach (var name in organisationUnitScheme.Names)
                {
                    newOrgUnitSchema.AddName(name.Key, name.Value);
                }
                foreach (var name in organisationUnitScheme.Descriptions)
                {
                    newOrgUnitSchema.AddDescription(name.Key, name.Value);
                }

                newOrgUnitSchema.Id = organisationUnitScheme.Id;
                newOrgUnitSchema.AgencyId = organisationUnitScheme.AgencyID;
                newOrgUnitSchema.Version = organisationUnitScheme.Version;

                newOrgUnitSchema.ExternalReference = TertiaryBool.ParseBoolean(organisationUnitScheme.IsExternalReference);

                if (organisationUnitScheme.ValidFrom > DateTime.MinValue)
                {
                    newOrgUnitSchema.StartDate = organisationUnitScheme.ValidFrom;
                }
                if (organisationUnitScheme.ValidTo > DateTime.MinValue)
                {
                    newOrgUnitSchema.EndDate = organisationUnitScheme.ValidTo;
                }

                newOrgUnitSchema.FinalStructure = TertiaryBool.ParseBoolean(organisationUnitScheme.IsFinal);

                if (organisationUnitScheme.Annotations != null)
                {
                    foreach (var itemAnnotation in organisationUnitScheme.Annotations)
                    {
                        newOrgUnitSchema.AddAnnotation(createSdmxAnnotation(itemAnnotation));
                    }
                }

                if (organisationUnitScheme.OrganisationUnits != null)
                {
                    foreach (var itemOrganisationUnits in organisationUnitScheme.OrganisationUnits)
                    {

                        newOrgUnitSchema.Items.Add(createSdmxOrganisationUnit(itemOrganisationUnits));
                    }
                }
            }
        }

        #region private 

        static private StructureReferenceImpl SetSdmxConceptRef(string conceptIdentity)
        {
            if (string.IsNullOrWhiteSpace(conceptIdentity))
            {
                return null;
            }
            var conceptIdentitySplit = conceptIdentity.Split('=');
            var conceptAgencyId = "";
            var conceptId = "";
            var conceptVersion = "";
            string conceptType = null;
            if (conceptIdentitySplit.Length > 1)
            {
                conceptIdentitySplit[1] = conceptIdentitySplit[1].Replace('(', '+').Replace(')', '+').Replace(':', '+');
                var tmpSplit = conceptIdentitySplit[1].Split('+');
                conceptAgencyId = tmpSplit[0];
                conceptId = tmpSplit[1];
                conceptVersion = tmpSplit[2];
                if (tmpSplit.Length > 3)
                {
                    conceptType = tmpSplit[3].Replace(".", "");
                }
                return new StructureReferenceImpl
                (
                    conceptAgencyId,
                    conceptId,
                    conceptVersion,
                    SdmxStructureEnumType.Concept,
                    conceptType
                );
            }
            return null;
        }
        static private RepresentationMutableCore SetSdmxRappresentation(LocalRepresentation representation, bool codeList)
        {
            if (representation != null && !string.IsNullOrWhiteSpace(representation.Enumeration))
            {
                var rapIdentitySplit = representation.Enumeration.Split('=');
                var rapAgencyId = "";
                var rapId = "";
                var rapVersion = "";
                if (rapIdentitySplit.Length > 1)
                {
                    rapIdentitySplit[1] = rapIdentitySplit[1].Replace('(', '+').Replace(')', '+').Replace(':', '+');
                    var tmpSplit = rapIdentitySplit[1].Split('+');
                    rapAgencyId = tmpSplit[0];
                    rapId = tmpSplit[1];
                    rapVersion = tmpSplit[2];
                    return new RepresentationMutableCore
                    {
                        Representation =
                        new StructureReferenceImpl
                        (
                            rapAgencyId,
                            rapId,
                            rapVersion,
                            codeList ? SdmxStructureEnumType.CodeList : SdmxStructureEnumType.ConceptScheme,
                            null
                        )
                    };
                }
            }
            return null;
        }
        static private MetadataAttributeMutableCore createSdmxMetadataAttribute(MetadataAttribute itemAttribute)
        {
            var metadataAttribute = new MetadataAttributeMutableCore
            {
                Id = itemAttribute.Id,
                ConceptRef = SetSdmxConceptRef(itemAttribute.ConceptIdentity),
                Representation = new RepresentationMutableCore()
            };
            if (!string.IsNullOrWhiteSpace(itemAttribute.MaxOccurs) && !itemAttribute.MaxOccurs.Equals("unbounded"))
            {
                metadataAttribute.MaxOccurs = Convert.ToInt32(itemAttribute.MaxOccurs);
            }
            else
            {
                metadataAttribute.MaxOccurs = null;
            }
            metadataAttribute.MinOccurs = itemAttribute.MinOccurs;

            metadataAttribute.Presentational = TertiaryBool.ParseBoolean(itemAttribute.IsPresentational);

            var textFormatMutable = new TextFormatMutableCore
            {
                TextType = TextType.GetFromEnum(TextEnumType.String)
            };
            metadataAttribute.Representation.TextFormat = textFormatMutable;

            if (itemAttribute.MetadataAttributes != null)
            {
                foreach (var item in itemAttribute.MetadataAttributes)
                {
                    metadataAttribute.MetadataAttributes.Add(createSdmxMetadataAttribute(item));
                }
            }
            if (itemAttribute.Annotations != null)
            {
                foreach (var itemAnnotation in itemAttribute.Annotations)
                {
                    metadataAttribute.AddAnnotation(createSdmxAnnotation(itemAnnotation));
                }
            }

            return metadataAttribute;
        }
        static private IContactMutableObject createSdmxContact(Contact itemContact)
        {
            IContactMutableObject contact = new ContactMutableObjectCore();
            contact.Id = itemContact.Id;
            if (itemContact.Names != null)
            {
                foreach (var name in itemContact.Names)
                {
                    contact.AddName(new TextTypeWrapperMutableCore { Locale = name.Key, Value = name.Value });
                }
            }
            if (itemContact.Departments != null)
            {
                foreach (var dep in itemContact.Departments)
                {
                    contact.AddDepartment(new TextTypeWrapperMutableCore { Locale = dep.Key, Value = dep.Value });
                }
            }
            if (itemContact.Roles != null)
            {
                foreach (var rol in itemContact.Roles)
                {
                    contact.AddRole(new TextTypeWrapperMutableCore { Locale = rol.Key, Value = rol.Value });
                }
            }
            if (itemContact.Emails != null)
            {
                foreach (var itemAdd in itemContact.Emails)
                {
                    contact.AddEmail(itemAdd);
                }
            }
            if (itemContact.Faxes != null)
            {
                foreach (var itemAdd in itemContact.Faxes)
                {
                    contact.AddFax(itemAdd);
                }
            }
            if (itemContact.Telephones != null)
            {
                foreach (var itemAdd in itemContact.Telephones)
                {
                    contact.AddTelephone(itemAdd);
                }
            }
            if (itemContact.Uris != null)
            {
                foreach (var itemAdd in itemContact.Uris)
                {
                    contact.AddUri(itemAdd);
                }
            }
            if (itemContact.X400s != null)
            {
                foreach (var itemAdd in itemContact.X400s)
                {
                    contact.AddX400(itemAdd);
                }
            }

            return contact;
        }
        static private IAnnotationMutableObject createSdmxAnnotation(Annotation itemAnnotation)
        {
            IAnnotationMutableObject mutableAnnotation = new AnnotationMutableCore
            {
                Type = itemAnnotation.Type,
                Id = itemAnnotation.Id,
                Title = itemAnnotation.Title
            };
            foreach (var itemText in itemAnnotation.Texts)
            {
                var textType = new TextTypeWrapperMutableCore { Locale = itemText.Key, Value = itemText.Value };
                mutableAnnotation.AddText(textType);
            }

            return mutableAnnotation;
        }

        static private IDataProviderMutableObject createSdmxDataConsumer(DataConsumer itemDataConsumer)
        {
            return commonCreateSdmxDataProvider(itemDataConsumer);
        }

        static private IDataProviderMutableObject createSdmxDataProvider(DataProvider itemDataProv)
        {
            return commonCreateSdmxDataProvider(itemDataProv);
        }

        static private IDataProviderMutableObject commonCreateSdmxDataProvider(IItemScheme itemDataProv)
        {
            IDataProviderMutableObject dataProv = new DataProviderMutableCore();
            dataProv.Id = itemDataProv.Id;
            if (itemDataProv.Names != null)
            {
                foreach (var name in itemDataProv.Names)
                {
                    dataProv.AddName(name.Key, name.Value);
                }
            }
            if (itemDataProv.Descriptions != null)
            {
                foreach (var name in itemDataProv.Descriptions)
                {
                    dataProv.AddDescription(name.Key, name.Value);
                }
            }
            if (itemDataProv.Annotations != null)
            {
                foreach (var itemAnnotation in itemDataProv.Annotations)
                {
                    dataProv.AddAnnotation(createSdmxAnnotation(itemAnnotation));
                }
            }
            if (itemDataProv.Contacts != null)
            {
                foreach (var itemContact in itemDataProv.Contacts)
                {
                    dataProv.AddContact(createSdmxContact(itemContact));
                }
            }

            return dataProv;
        }
        static private IAttributeMutableObject createSdmxAttribure(Property.Attribute itemAttr)
        {
            IAttributeMutableObject attr = new AttributeMutableCore();
            attr.Id = itemAttr.Id;
            attr.AssignmentStatus = itemAttr.AssignmentStatus;
            attr.ConceptRef = SetSdmxConceptRef(itemAttr.ConceptIdentity);
            attr.Representation = SetSdmxRappresentation(itemAttr.LocalRepresentation, true);
            if (itemAttr.AttributeRelationship != null)
            {
                if (!string.IsNullOrWhiteSpace(itemAttr.AttributeRelationship.PrimaryMeasure))
                {
                    attr.PrimaryMeasureReference = itemAttr.AttributeRelationship.PrimaryMeasure;
                    attr.AttachmentLevel = AttributeAttachmentLevel.Observation;
                }
                else if (itemAttr.AttributeRelationship.AttachmentGroups != null && itemAttr.AttributeRelationship.AttachmentGroups.Count > 0)
                {
                    attr.AttachmentGroup = itemAttr.AttributeRelationship.AttachmentGroups[0];
                    attr.AttachmentLevel = AttributeAttachmentLevel.Group;
                }
                else if (itemAttr.AttributeRelationship.Dimensions != null)
                {
                    attr.AttachmentLevel = AttributeAttachmentLevel.DimensionGroup;
                    foreach (var itemStr in itemAttr.AttributeRelationship.Dimensions)
                    {
                        attr.DimensionReferences.Add(itemStr);
                    }
                }
                else
                {
                    attr.AttachmentLevel = AttributeAttachmentLevel.DataSet;
                }
            }
            if (itemAttr.Annotations != null)
            {
                foreach (var itemAnn in itemAttr.Annotations)
                {
                    attr.AddAnnotation(createSdmxAnnotation(itemAnn));
                }
            }

            return attr;
        }

        static private IDataProviderMutableObject createSdmxOrganisationUnit(OrganisationUnit itemOrganisationUnit)
        {
            return commonCreateSdmxDataProvider(itemOrganisationUnit);
        }

        static private void setSdmxDimension(IDataStructureMutableObject dataStructureMutableCore, DataStructure dsd)
        {
            var allDim = new Dictionary<int, IDimensionMutableObject>();

            foreach (var itemDim in dsd.DataStructureComponents.DimensionList.Dimensions)
            {
                IDimensionMutableObject dim = new DimensionMutableCore();
                dim.Id = itemDim.Id;

                dim.ConceptRef = SetSdmxConceptRef(itemDim.ConceptIdentity);
                dim.Representation = SetSdmxRappresentation(itemDim.LocalRepresentation, true);
                if (dim.Id.Equals("FREQ", StringComparison.InvariantCultureIgnoreCase))
                {
                    dim.FrequencyDimension = true;
                }
                if (itemDim.Annotations != null)
                {
                    foreach (var itemAnn in itemDim.Annotations)
                    {
                        var annItemCore = new AnnotationMutableCore();
                        annItemCore.Id = itemAnn.Id;
                        annItemCore.Title = itemAnn.Title;
                        annItemCore.Type = itemAnn.Type;
                        if (itemAnn.Texts != null)
                        {
                            foreach (var itemTxt in itemAnn.Texts)
                            {
                                annItemCore.AddText(new TextTypeWrapperMutableCore { Locale = itemTxt.Key, Value = itemTxt.Value });
                            }
                        }
                        dim.AddAnnotation(annItemCore);
                    }
                }
                var i = itemDim.Position;
                while (allDim.ContainsKey(i))
                {
                    i++;
                }
                allDim.Add(i, dim);
            }
            foreach (var itemDim in dsd.DataStructureComponents.DimensionList.MeasureDimensions)
            {
                IDimensionMutableObject dim = new DimensionMutableCore();
                dim.Id = itemDim.Id;
                dim.MeasureDimension = true;
                dim.ConceptRef = SetSdmxConceptRef(itemDim.ConceptIdentity);
                dim.Representation = SetSdmxRappresentation(itemDim.LocalRepresentation, false);
                if (itemDim.Annotations != null)
                {
                    foreach (var itemAnn in itemDim.Annotations)
                    {
                        dim.AddAnnotation(createSdmxAnnotation(itemAnn));
                    }
                }
                var i = itemDim.Position;
                while (allDim.ContainsKey(i))
                {
                    i++;
                }
                allDim.Add(i, dim);
            }
            foreach (var itemDim in dsd.DataStructureComponents.DimensionList.TimeDimensions)
            {
                IDimensionMutableObject dim = new DimensionMutableCore();
                dim.Id = itemDim.Id;
                dim.TimeDimension = true;
                dim.ConceptRef = SetSdmxConceptRef(itemDim.ConceptIdentity);
                dim.Representation = SetSdmxRappresentation(itemDim.LocalRepresentation, true);
                if (itemDim.Annotations != null)
                {
                    foreach (var itemAnn in itemDim.Annotations)
                    {
                        dim.AddAnnotation(createSdmxAnnotation(itemAnn));
                    }
                }
                var i = itemDim.Position;
                while (allDim.ContainsKey(i))
                {
                    i++;
                }
                allDim.Add(i, dim);
            }

            var list = allDim.Keys.ToList();
            list.Sort();
            foreach (var key in list)
            {
                dataStructureMutableCore.AddDimension(allDim[key]);
            }
        }

        #endregion

        #endregion

        static public string GetArtefactTypeString(SdmxStructureEnumType artefactType)
        {
            switch (artefactType)
            {
                case SdmxStructureEnumType.CodeList:
                    return "codelist";
                case SdmxStructureEnumType.CategoryScheme:
                    return "categoryscheme";
                case SdmxStructureEnumType.ConceptScheme:
                    return "conceptscheme";
                case SdmxStructureEnumType.Dataflow:
                    return "dataflow";
                case SdmxStructureEnumType.Dsd:
                    return "datastructure";
                case SdmxStructureEnumType.Categorisation:
                    return "categorisation";

                case SdmxStructureEnumType.Agency:
                    return "agencyscheme";

                case SdmxStructureEnumType.AgencyScheme:
                    return "agencyscheme";
                case SdmxStructureEnumType.DataProviderScheme:
                    return "dataproviderscheme";
                case SdmxStructureEnumType.DataConsumerScheme:
                    return "dataconsumerscheme";
                case SdmxStructureEnumType.OrganisationUnitScheme:
                    return "organisationunitscheme";
                case SdmxStructureEnumType.StructureSet:
                    return "structureset";
                case SdmxStructureEnumType.ContentConstraint:
                    return "contentconstraint";
                case SdmxStructureEnumType.HierarchicalCodelist:
                    return "hierarchicalcodelist";
                case SdmxStructureEnumType.Msd:
                    return "metadatastructure";

                default:
                    return artefactType.ToString().ToLowerInvariant();
            }
        }

        static public SdmxStructureEnumType GetArtefactTypeEnum(string artefactType)
        {
            switch (artefactType.ToLowerInvariant())
            {
                case "codelist":
                    return SdmxStructureEnumType.CodeList;
                case "categoryscheme":
                    return SdmxStructureEnumType.CategoryScheme;
                case "conceptscheme":
                    return SdmxStructureEnumType.ConceptScheme;
                case "dataflow":
                    return SdmxStructureEnumType.Dataflow;
                case "datastructure":
                    return SdmxStructureEnumType.Dsd;
                case "categorisation":
                    return SdmxStructureEnumType.Categorisation;

                case "agencyscheme":
                    return SdmxStructureEnumType.AgencyScheme;
                case "dataproviderscheme":
                    return SdmxStructureEnumType.DataProviderScheme;
                case "dataconsumerscheme":
                    return SdmxStructureEnumType.DataConsumerScheme;
                case "organisationunitscheme":
                    return SdmxStructureEnumType.OrganisationUnitScheme;
                case "structureset":
                    return SdmxStructureEnumType.StructureSet;
                case "contentconstraint":
                    return SdmxStructureEnumType.ContentConstraint;
                case "hierarchicalcodelist":
                    return SdmxStructureEnumType.HierarchicalCodelist;
                case "metadatastructure":
                    return SdmxStructureEnumType.Msd;
                case "metadataflow":
                    return SdmxStructureEnumType.MetadataFlow;
                case "provisionagreement":
                    return SdmxStructureEnumType.ProvisionAgreement;

                default:
                    Enum.TryParse(artefactType, out SdmxStructureEnumType structureEnum);
                    return structureEnum;
            }
        }

    }
}
