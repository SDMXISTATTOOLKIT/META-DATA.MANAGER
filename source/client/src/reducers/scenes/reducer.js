import {combineReducers} from 'redux';
import builderReducer from '../../scenes/data-manager/builder/reducer';
import fileMappingReducer from '../../scenes/data-manager/file-mapping/reducer';
import loaderReducer from '../../scenes/data-manager/loader/reducer';
import cubeListReducer from '../../scenes/data-manager/cube-list/reducer';
import {PAGE_NAVIGATE} from '../../page/actions';
import dataflowBuilderReducer from '../../scenes/data-manager/dataflow-builder/reducer';
import appConfigReducer from '../../scenes/configuration/app-config/reducer';
import nodesConfigReducer from '../../scenes/configuration/nodes-config/reducer';
import importStructuresReducer from "../../scenes/utilities/import-structures/reducer";
import {ENDPOINT_DROPDOWN_NODE_PING} from "../../page/header/endpoint-dropdown/actions";
import {REQUEST_SUCCESS} from "../../middlewares/api/actions";
import dcatReducer from "../../scenes/reference-metadata/dcat/reducer";
import codelistsReducer from "../../scenes/meta-manager/codelists/reducer";
import categorySchemesReducer from "../../scenes/meta-manager/category-schemes/reducer";
import conceptSchemesReducer from "../../scenes/meta-manager/concept-schemes/reducer";
import dataflowsReducer from "../../scenes/meta-manager/dataflows/reducer";
import setPermissionsReducer from "../../scenes/manage-users/set-permissions/reducer";
import syncCodelisReducer from "../../scenes/data-manager/sync-codelists/reducer";
import categorySchemesAndDataflowsReducer from "../../scenes/meta-manager/category-schemes-and-dataflows/reducer";
import dsdsReducer from "../../scenes/meta-manager/dsds/reducer";
import msdsReducer from "../../scenes/meta-manager/msds/reducer";
import metadataflowsReducer from "../../scenes/meta-manager/metadataflows/reducer";
import userManagementReducer from "../../scenes/manage-users/user-menagment/reducer";
import upgradeDsdReducer from "../../scenes/data-manager/upgrade-dsd/reducer";
import agencySchemesReducer from "../../scenes/meta-manager/agency-schemes/reducer";
import compareDsdsReducer from "../../scenes/utilities/compare-dsds/reducer";
import compareItemSchemesReducer from "../../scenes/utilities/compare-item-schemes/reducer";
import contentConstraintsReducer from "../../scenes/meta-manager/content-constraint/reducer";
import {USER_DROPDOWN_USER_LOGIN, USER_DROPDOWN_USER_LOGOUT} from "../../page/header/user-dropdown/actions";
import metadataSetReducer from "../../scenes/reference-metadata/metadata-set/reducer";
import mergeItemSchemesReducer from "../../scenes/utilities/merge-item-schemes/reducer";
import hierarchicalCodelistsReducer from "../../scenes/meta-manager/hierarchical-codelists/reducer";
import manageSeriesReducer from "../../scenes/data-manager/manage-series/reducer";

const scenesReducer = (state, action) => {

  if (action.type === PAGE_NAVIGATE ||
    (action.type === REQUEST_SUCCESS && action.label === ENDPOINT_DROPDOWN_NODE_PING && action.response === true) ||
    (action.type === REQUEST_SUCCESS && action.label === USER_DROPDOWN_USER_LOGIN) ||
    (action.type === REQUEST_SUCCESS && action.label === USER_DROPDOWN_USER_LOGOUT)
  ) {
    state = undefined;
  }

  return combineReducers({
    metaManager: combineReducers({
      codelists: codelistsReducer,
      categorySchemes: categorySchemesReducer,
      conceptSchemes: conceptSchemesReducer,
      dataflows: dataflowsReducer,
      categorySchemesAndDataflows: categorySchemesAndDataflowsReducer,
      dsds: dsdsReducer,
      msds: msdsReducer,
      metadataflows: metadataflowsReducer,
      agencySchemes: agencySchemesReducer,
      contentConstraints: contentConstraintsReducer,
      hierarchicalCodelists: hierarchicalCodelistsReducer,
    }),
    dataManager: combineReducers({
      builder: builderReducer,
      fileMapping: fileMappingReducer,
      loader: loaderReducer,
      cubeList: cubeListReducer,
      dataflowBuilder: dataflowBuilderReducer,
      syncCodelist: syncCodelisReducer,
      upgradeDsd: upgradeDsdReducer,
      manageSeries: manageSeriesReducer
    }),
    utilities: combineReducers({
      importStructures: importStructuresReducer,
      compareDsds: compareDsdsReducer,
      compareItemSchemes: compareItemSchemesReducer,
      mergeItemSchemes: mergeItemSchemesReducer
    }),
    referenceMetadata: combineReducers({
      dcat: dcatReducer,
      metadataSet: metadataSetReducer,
    }),
    manageUsers: combineReducers({
      setPermissions: setPermissionsReducer,
      userManagement: userManagementReducer
    }),
    configuration: combineReducers({
      appConfig: appConfigReducer,
      nodesConfig: nodesConfigReducer
    })
  })(state, action);
};

export default scenesReducer;
