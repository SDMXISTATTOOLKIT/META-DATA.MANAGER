import {
  PATH_AGENCY_SCHEMES,
  PATH_APP_CONFIGURATION,
  PATH_ARTEFACT_BROWSER,
  PATH_BUILDER,
  PATH_CATEGORISATIONS,
  PATH_CATEGORY_SCHEMES,
  PATH_CATEGORY_SCHEMES_AND_DATAFLOWS,
  PATH_CODELISTS,
  PATH_COMPARE_DSDS,
  PATH_COMPARE_ITEM_SCHEMES,
  PATH_CONCEPT_SCHEMES,
  PATH_CONFIGURATION,
  PATH_CONTENT_CONSTRAINTS,
  PATH_CUBE_LIST,
  PATH_DATA_CONSUMER_SCHEMES,
  PATH_DATA_MANAGER,
  PATH_DATA_PROVIDER_SCHEMES,
  PATH_DATA_STRUCTURE_DEFINITIONS,
  PATH_DATAFLOW_BUILDER,
  PATH_DATAFLOWS,
  PATH_DCAT_AP_IT,
  PATH_DDB_RESET,
  PATH_FILE_MAPPING,
  PATH_HIERARCHICAL_CODELISTS,
  PATH_IMPORT_STRUCTURES,
  PATH_LOADER,
  PATH_MANAGE_SERIES,
  PATH_MANAGE_USERS,
  PATH_MERGE_ITEM_SCHEMES,
  PATH_META_MANAGER,
  PATH_METADATA_SET,
  PATH_METADATAFLOWS,
  PATH_MSD,
  PATH_NODES_CONFIGURATION,
  PATH_ORGANIZATION_UNIT_SCHEMES,
  PATH_PROVISION_AGREEMENTS,
  PATH_REFERENCE_METADATA,
  PATH_REGISTRATIONS,
  PATH_REMOVE_TEMP_TABLES,
  PATH_SET_PERMISSIONS,
  PATH_STRUCTURE_SETS,
  PATH_SYNCRONIZE_CODELISTS,
  PATH_UPGRADE_DSD,
  PATH_USER_MANAGEMENT,
  PATH_UTILITIES
} from './paths';
import Builder from '../scenes/data-manager/builder';
import FileMapping from '../scenes/data-manager/file-mapping';
import Loader from '../scenes/data-manager/loader';
import CubeList from '../scenes/data-manager/cube-list';
import DataflowBuilder from '../scenes/data-manager/dataflow-builder';
import NodesConfig from '../scenes/configuration/nodes-config';
import AppConfig from '../scenes/configuration/app-config';
import ImportStructures from '../scenes/utilities/import-structures';
import Codelists from "../scenes/meta-manager/codelists";
import CategorySchemes from "../scenes/meta-manager/category-schemes";
import ConceptSchemes from "../scenes/meta-manager/concept-schemes";
import Dataflows from "../scenes/meta-manager/dataflows";
import SetPermissions from "../scenes/manage-users/set-permissions";
import SyncCodelists from "../scenes/data-manager/sync-codelists";
import DCAT from "../scenes/reference-metadata/dcat";
import CategorySchemesAndDataflows from '../scenes/meta-manager/category-schemes-and-dataflows';
import Dsds from '../scenes/meta-manager/dsds';
import UserManagement from "../scenes/manage-users/user-menagment";
import Msds from "../scenes/meta-manager/msds";
import AgencySchemes from "../scenes/meta-manager/agency-schemes";
import Metadataflows from "../scenes/meta-manager/metadataflows";
import UpgradeDSD from "../scenes/data-manager/upgrade-dsd";
import RemoveTempTables from "../scenes/data-manager/remove-temp-tables/RemoveTempTables";
import CompareDsds from "../scenes/utilities/compare-dsds";
import CompareItemSchemes from "../scenes/utilities/compare-item-schemes";
import ContentConstraints from "../scenes/meta-manager/content-constraint";
import MetadataSet from "../scenes/reference-metadata/metadata-set";
import DdbReset from "../scenes/data-manager/ddb-reset/DdbReset";
import MergeItemSchemes from "../scenes/utilities/merge-item-schemes";
import HierarchicalCodelists from "../scenes/meta-manager/hierarchical-codelists";
import ManageSeries from "../scenes/data-manager/manage-series";

export const userMenu = t => ([
  {
    label: t('menu.metaManager.label'),
    path: PATH_META_MANAGER,
    blackIconPath: './static/png/meta-manager.png',
    redIconPath: './static/png/meta-manager_red.png',
    children: [
      {
        label: t('menu.conceptSchemes.label'),
        path: PATH_CONCEPT_SCHEMES,
        blackIconPath: './static/png/concept-schemes.png',
        redIconPath: './static/png/concept-schemes_red.png',
        component: ConceptSchemes
      },
      {
        label: t('menu.codelists.label'),
        path: PATH_CODELISTS,
        blackIconPath: './static/png/codelists.png',
        redIconPath: './static/png/codelists_red.png',
        component: Codelists
      },
      {
        label: t('menu.dataStructureDefinitions.label'),
        path: PATH_DATA_STRUCTURE_DEFINITIONS,
        blackIconPath: './static/png/data-structure-definitions.png',
        redIconPath: './static/png/data-structure-definitions_red.png',
        component: Dsds
      },
      {
        label: t('menu.dataflows.label'),
        path: PATH_DATAFLOWS,
        blackIconPath: './static/png/dataflows.png',
        redIconPath: './static/png/dataflows_red.png',
        component: Dataflows
      },
      {
        label: t('menu.categorySchemes.label'),
        path: PATH_CATEGORY_SCHEMES,
        blackIconPath: './static/png/category-schemes.png',
        redIconPath: './static/png/category-schemes_red.png',
        component: CategorySchemes
      },
      {
        label: t('menu.categorisations.label'),
        path: PATH_CATEGORISATIONS,
        blackIconPath: './static/png/categorisations.png',
        redIconPath: './static/png/categorisations_red.png',
      },
      {
        label: t('menu.hierarchicalCodelists.label'),
        path: PATH_HIERARCHICAL_CODELISTS,
        blackIconPath: './static/png/hierarchical-codelists.png',
        redIconPath: './static/png/hierarchical-codelists_red.png',
        component: HierarchicalCodelists
      },
      {
        label: t('menu.agencySchemes.label'),
        path: PATH_AGENCY_SCHEMES,
        blackIconPath: './static/png/agency-schemes.png',
        redIconPath: './static/png/agency-schemes_red.png',
        component: AgencySchemes
      },
      {
        label: t('menu.dataProviderSchemes.label'),
        path: PATH_DATA_PROVIDER_SCHEMES,
        blackIconPath: './static/png/data-provider-schemes.png',
        redIconPath: './static/png/data-provider-schemes_red.png',
      },
      {
        label: t('menu.dataConsumerSchemes.label'),
        path: PATH_DATA_CONSUMER_SCHEMES,
        blackIconPath: './static/png/data-consumer-schemes.png',
        redIconPath: './static/png/data-consumer-schemes_red.png',
      },
      {
        label: t('menu.organizationUnitSchemes.label'),
        path: PATH_ORGANIZATION_UNIT_SCHEMES,
        blackIconPath: './static/png/organization-unit-schemes.png',
        redIconPath: './static/png/organization-unit-schemes_red.png',
      },
      {
        label: t('menu.contentConstraints.label'),
        path: PATH_CONTENT_CONSTRAINTS,
        blackIconPath: './static/png/content-constraints.png',
        redIconPath: './static/png/content-constraints_red.png',
        component: ContentConstraints
      },
      {
        label: t('menu.structureSets.label'),
        path: PATH_STRUCTURE_SETS,
        blackIconPath: './static/png/structure-sets.png',
        redIconPath: './static/png/structure-sets_red.png',
      },
      {
        label: t('menu.provisionAgreements.label'),
        path: PATH_PROVISION_AGREEMENTS,
        blackIconPath: './static/png/provision-agreements.png',
        redIconPath: './static/png/provision-agreements_red.png',
      },
      {
        label: t('menu.registrations.label'),
        path: PATH_REGISTRATIONS,
        blackIconPath: './static/png/registrations.png',
        redIconPath: './static/png/registrations_red.png',
      },
      {
        label: t('menu.categorySchemesAndDataflows.label'),
        path: PATH_CATEGORY_SCHEMES_AND_DATAFLOWS,
        component: CategorySchemesAndDataflows,
        blackIconPath: './static/png/categorisations.png',
        redIconPath: './static/png/categorisations_red.png',
      },
      {
        label: t('menu.msds.label'),
        path: PATH_MSD,
        blackIconPath: './static/png/msds.png',
        redIconPath: './static/png/msds_red.png',
        component: Msds
      },
      {
        label: t('menu.metadataflows.label'),
        path: PATH_METADATAFLOWS,
        blackIconPath: './static/png/metadataflows.png',
        redIconPath: './static/png/metadataflows_red.png',
        component: Metadataflows
      }
    ]
  },
  {
    label: t('menu.dataManager.label'),
    path: PATH_DATA_MANAGER,
    blackIconPath: './static/png/data-manager.png',
    redIconPath: './static/png/data-manager_red.png',
    children: [
      {
        label: t('menu.builder.label'),
        path: PATH_BUILDER,
        blackIconPath: './static/png/builder.png',
        redIconPath: './static/png/builder_red.png',
        component: Builder
      },
      {
        label: t('menu.fileMapping.label'),
        path: PATH_FILE_MAPPING,
        blackIconPath: './static/png/file-mapping.png',
        redIconPath: './static/png/file-mapping_red.png',
        component: FileMapping
      },
      {
        label: t('menu.loader.label'),
        path: PATH_LOADER,
        blackIconPath: './static/png/loader.png',
        redIconPath: './static/png/loader_red.png',
        component: Loader,
      },
      {
        label: t('menu.dataflowBuilder.label'),
        path: PATH_DATAFLOW_BUILDER,
        blackIconPath: './static/png/dataflow-builder.png',
        redIconPath: './static/png/dataflow-builder_red.png',
        component: DataflowBuilder
      },
      {
        label: t('menu.cubeList.label'),
        path: PATH_CUBE_LIST,
        blackIconPath: './static/png/datasets-list.png',
        redIconPath: './static/png/datasets-list_red.png',
        component: CubeList
      },
      {
        isDivider: true
      },
      {
        label: t('menu.manageSeries.label'),
        path: PATH_MANAGE_SERIES,
        blackIconPath: './static/png/manage-series.png',
        redIconPath: './static/png/manage-series_red.png',
        component: ManageSeries
      },
      {
        label: t('menu.upgradeDSD.label'),
        path: PATH_UPGRADE_DSD,
        blackIconPath: './static/png/upgrade-dsd.png',
        redIconPath: './static/png/upgrade-dsd_red.png',
        component: UpgradeDSD
      },
      {
        label: t('menu.synchronizeCodelists.label'),
        path: PATH_SYNCRONIZE_CODELISTS,
        blackIconPath: './static/png/synchronize-codelists.png',
        redIconPath: './static/png/synchronize-codelists_red.png',
        component: SyncCodelists
      },
      {
        label: t('menu.ddbReset.label'),
        path: PATH_DDB_RESET,
        blackIconPath: './static/png/ddb-reset.png',
        redIconPath: './static/png/ddb-reset_red.png',
        component: DdbReset
      },
      {
        label: t('menu.removeTempTables.label'),
        path: PATH_REMOVE_TEMP_TABLES,
        blackIconPath: './static/png/remove-temp-tables.png',
        redIconPath: './static/png/remove-temp-tables_red.png',
        component: RemoveTempTables
      },
    ]
  },
  {
    label: t('menu.utilities.label'),
    path: PATH_UTILITIES,
    blackIconPath: './static/png/utilities.png',
    redIconPath: './static/png/utilities_red.png',
    children: [
      {
        label: t('menu.importStructures.label'),
        path: PATH_IMPORT_STRUCTURES,
        blackIconPath: './static/png/import-structures.png',
        redIconPath: './static/png/import-structures_red.png',
        component: ImportStructures
      },
      {
        label: t('menu.compareDSDs.label'),
        path: PATH_COMPARE_DSDS,
        blackIconPath: './static/png/compare-dsds.png',
        redIconPath: './static/png/compare-dsds_red.png',
        component: CompareDsds
      },
      {
        label: t('menu.compareItemSchemes.label'),
        path: PATH_COMPARE_ITEM_SCHEMES,
        blackIconPath: './static/png/compare-item-schemes.png',
        redIconPath: './static/png/compare-item-schemes_red.png',
        component: CompareItemSchemes
      },
      {
        label: t('menu.mergeItemSchemes.label'),
        path: PATH_MERGE_ITEM_SCHEMES,
        blackIconPath: './static/png/merge-item-schemes.png',
        redIconPath: './static/png/merge-item-schemes_red.png',
        component: MergeItemSchemes
      },
      {
        label: t('menu.artefactBrowser.label'),
        path: PATH_ARTEFACT_BROWSER,
        blackIconPath: './static/png/artefact-browser.png',
        redIconPath: './static/png/artefact-browser_red.png',

      }
    ]
  },
  {
    label: t('menu.referenceMetadata.label'),
    path: PATH_REFERENCE_METADATA,
    blackIconPath: './static/png/reference-metadata.png',
    redIconPath: './static/png/reference-metadata_red.png',
    children: [
      {
        label: t('menu.metadataSet.label'),
        path: PATH_METADATA_SET,
        blackIconPath: './static/png/metadata-set.png',
        redIconPath: './static/png/metadata-set_red.png',
        component: MetadataSet
      },
      {
        label: t('menu.DCAT-AP_IT.label'),
        path: PATH_DCAT_AP_IT,
        blackIconPath: './static/png/dcat-ap_it.png',
        redIconPath: './static/png/dcat-ap_it_red.png',
        component: DCAT,
      }
    ]
  },
  {
    label: t('menu.manageUsers.label'),
    path: PATH_MANAGE_USERS,
    blackIconPath: './static/png/manage-users.png',
    redIconPath: './static/png/manage-users_red.png',
    children: [
      {
        label: t('menu.userManagement.label'),
        path: PATH_USER_MANAGEMENT,
        blackIconPath: './static/png/user-management.png',
        redIconPath: './static/png/user-management_red.png',
        component: UserManagement
      },
      {
        label: t('menu.setPermissions.label'),
        path: PATH_SET_PERMISSIONS,
        blackIconPath: './static/png/set-permissions.png',
        redIconPath: './static/png/set-permissions_red.png',
        component: SetPermissions
      }
    ]
  }
]);

export const superUserMenu = t => ([
  {
    label: t('menu.configuration.label'),
    blackIconPath: './static/png/configuration.png',
    redIconPath: './static/png/configuration_red.png',
    path: PATH_CONFIGURATION,
    children: [
      {
        label: t('menu.applicationConfiguration.label'),
        path: PATH_APP_CONFIGURATION,
        blackIconPath: './static/png/application-configuration.png',
        redIconPath: './static/png/application-configuration_red.png',
        component: AppConfig
      },
      {
        label: t('menu.nodesConfiguration.label'),
        path: PATH_NODES_CONFIGURATION,
        blackIconPath: './static/png/nodes-configuration.png',
        redIconPath: './static/png/nodes-configuration_red.png',
        component: NodesConfig
      }
    ]
  }
]);
