import {combineReducers} from 'redux';
import {dataflowBuilderWizardReducer} from './wizard/reducer';
import {
  DATAFLOW_BUILDER_LIST_DATAFLOW_CONTENT_CONSTRAINT_SET,
  DATAFLOW_BUILDER_LIST_DATAFLOW_CONTENT_CONSTRAINT_UNSET,
  DATAFLOW_BUILDER_LIST_DATAFLOW_DELETE,
  DATAFLOW_BUILDER_LIST_DATAFLOW_EDIT,
  DATAFLOW_BUILDER_LIST_DATAFLOW_MAPPING_SET_SET,
  DATAFLOW_BUILDER_LIST_DATAFLOW_MAPPING_SET_UNSET,
  DATAFLOW_BUILDER_LIST_DATAFLOW_PRODUCTION_FLAG_SET,
  DATAFLOW_BUILDER_LIST_DATAFLOW_TRANSCODING_FROM_CC_SET,
  DATAFLOW_BUILDER_LIST_DATAFLOW_TRANSCODING_SET,
  DATAFLOW_BUILDER_LIST_DATAFLOW_TRANSCODING_UNSET,
  DATAFLOW_BUILDER_LIST_DATAFLOWS_READ
} from './list/actions';
import {
  DATAFLOW_BUILDER_WIZARD_DATAFLOW_READ,
  DATAFLOW_BUILDER_WIZARD_DSD_FOR_LAYOUT_ANNOTATIONS_READ,
  DATAFLOW_BUILDER_WIZARD_HIDE,
  DATAFLOW_BUILDER_WIZARD_SHOW,
  DATAFLOW_BUILDER_WIZARD_STEP_SET,
  DATAFLOW_BUILDER_WIZARD_SUBMIT
} from './wizard/actions';
import {REQUEST_ERROR, REQUEST_SUCCESS} from '../../../middlewares/api/actions';
import {
  DATAFLOW_BUILDER_WIZARD_DATAFLOW_FORM_AGENCIES_READ,
  DATAFLOW_BUILDER_WIZARD_DATAFLOW_FORM_DATAFLOW_CHANGE,
} from './wizard/dataflow-form/actions';
import _ from 'lodash';
import {
  CODELIST_ORDER_ANNOTATION_KEY,
  FILTER_MODE_IN,
  getArtefactFromSdmxJsonStructure,
  getArtefactTripletFromString,
  getArtefactTripletFromUrn,
  getDsdFromSdmxJsonStructure,
  getItemSchemeFromSdmxJsonFactory,
  getSdmxStructuresFromSdmxJson,
  getStringFromArtefactTriplet,
  getUrnFromArtefactTriplet,
  SDMX_JSON_CATEGORISATION_LIST_KEY,
  SDMX_JSON_CODELIST_ITEMS_KEY,
  SDMX_JSON_DATAFLOW_LIST_KEY,
  SDMX_JSON_DSD_URN_NAMESPACE
} from '../../../utils/sdmxJson';
import dataflowBuilderTreeReducer from './tree/reducer';
import {
  DATAFLOW_BUILDER_WIZARD_CATEGORY_TREE_CATEGORISATIONS_READ,
  DATAFLOW_BUILDER_WIZARD_CATEGORY_TREE_SELECTION_CHANGE
} from './wizard/category-tree/actions';
import {
  DATAFLOW_BUILDER_WIZARD_HEADER_FORM_CHANGE,
  DATAFLOW_BUILDER_WIZARD_HEADER_FORM_HEADER_READ,
  DATAFLOW_BUILDER_WIZARD_HEADER_FORM_HIDE,
  DATAFLOW_BUILDER_WIZARD_HEADER_FORM_SHOW
} from './wizard/header-form/actions';
import dataflowBuilderListReducer from './list/reducer';
import {
  DATAFLOW_BUILDER_WIZARD_QUERY_CUBE_COLUMNS_FORM_CHANGE,
  DATAFLOW_BUILDER_WIZARD_QUERY_CUBE_COLUMNS_FORM_CUBE_FIRST_ROW_READ,
  DATAFLOW_BUILDER_WIZARD_QUERY_CUBE_COLUMNS_FORM_CUBE_READ,
  DATAFLOW_BUILDER_WIZARD_QUERY_CUBE_COLUMNS_FORM_CUBE_SET,
  DATAFLOW_BUILDER_WIZARD_QUERY_CUBE_COLUMNS_FORM_CUBE_UNSET,
  DATAFLOW_BUILDER_WIZARD_QUERY_CUBE_COLUMNS_FORM_DDB_DATAFLOW_READ,
  DATAFLOW_BUILDER_WIZARD_QUERY_FILTER_FORM_BLOCK_ADD,
  DATAFLOW_BUILDER_WIZARD_QUERY_FILTER_FORM_BLOCK_DELETE,
  DATAFLOW_BUILDER_WIZARD_QUERY_FILTER_FORM_CHANGE,
  DATAFLOW_BUILDER_WIZARD_QUERY_FILTER_FORM_CODELIST_READ,
  DATAFLOW_BUILDER_WIZARD_QUERY_FILTER_FORM_COLUMN_VALUES_READ,
  DATAFLOW_BUILDER_WIZARD_QUERY_FILTER_FORM_CONDITION_ADD,
  DATAFLOW_BUILDER_WIZARD_QUERY_FILTER_FORM_CONDITION_DELETE,
  DATAFLOW_BUILDER_WIZARD_QUERY_FILTER_MODAL_HIDE,
  DATAFLOW_BUILDER_WIZARD_QUERY_FILTER_MODAL_SHOW,
  DATAFLOW_BUILDER_WIZARD_QUERY_FILTER_MODAL_SUBMIT,
  DATAFLOW_BUILDER_WIZARD_QUERY_FILTER_MODE_CHANGE,
  DATAFLOW_BUILDER_WIZARD_QUERY_FILTER_RESET,
  DATAFLOW_BUILDER_WIZARD_QUERY_TREE_FILTER_CHANGE,
  DATAFLOW_BUILDER_WIZARD_QUERY_TREE_FILTER_COLUMN_CODELIST_COUNT_READ,
  DATAFLOW_BUILDER_WIZARD_QUERY_TREE_FILTER_COLUMN_CODELIST_TREE_READ,
  DATAFLOW_BUILDER_WIZARD_QUERY_TREE_FILTER_COLUMN_FILTERED_VALUES_READ,
  DATAFLOW_BUILDER_WIZARD_QUERY_TREE_FILTER_COLUMN_MODE_CHANGE,
  DATAFLOW_BUILDER_WIZARD_QUERY_TREE_FILTER_COLUMN_VALUES_CHANGE
} from "./wizard/query/actions";
import {getFilteredTreeWithPaths, getMaxTreeDepth, getTreeFromArray} from "../../../utils/tree";
import {
  QUERY_FORM_FILTER_MODE_PLAIN,
  QUERY_FORM_FILTER_MODE_TREE
} from "../../../components/query-form";
import {getTreeFilterObjFromStr} from "../../../components/tree-filter/utils";
import {getCurrentNodeConfig} from "../../../middlewares/current-node-config/middleware";
import {
  AUTO_ANNOTATION_HAVE_METADATA_KEY,
  getCustomAnnotationsFromTabsMap,
  getCustomAnnotationsTabsMap,
  getGenericAnnotations
} from "../../../utils/annotations";
import {
  DATAFLOW_BUILDER_WIZARD_LAYOUT_ANNOTATIONS_FORM_RESET,
  DATAFLOW_BUILDER_WIZARD_LAYOUT_ANNOTATIONS_FORM_SUBMIT
} from "./wizard/layout-annotations/actions";
import {getFilterObjFromStr, getFilterStrFromServerQueryObj} from "../../../utils/filter";
import {getCurrentUserPermissions} from "../../../middlewares/current-user-permissions/middleware";

export const DATAFLOW_BUILDER_WIZARD_STEP_DATAFLOW = 0;
export const DATAFLOW_BUILDER_WIZARD_STEP_QUERY = 1;
export const DATAFLOW_BUILDER_WIZARD_STEP_CATEGORISATION = 2;
export const DATAFLOW_BUILDER_WIZARD_STEP_HEADER = 3;
export const DATAFLOW_BUILDER_WIZARD_STEP_LAYOUT_ANNOTATIONS = 4;

const dataflowBuilderReducer = combineReducers({
  components: combineReducers({
    wizard: dataflowBuilderWizardReducer,
    tree: dataflowBuilderTreeReducer,
    list: dataflowBuilderListReducer
  }),
  shared: (
    state = {
      isWizardVisible: false,
      wizardStep: null,
      dataflows: null,
      ddbDataflowId: null,
      dataflowTriplet: null,
      ddbDataflow: null,
      dataflow: null,
      dataflowOriginalAnnotations: null,
      cubeId: null,
      cube: null,
      cubeFirstRow: null,
      filter: null,
      filterTemp: null,
      treeFilter: {},
      treeFilterTemp: {},
      filterMode: QUERY_FORM_FILTER_MODE_PLAIN,
      isFilterModalVisible: false,
      categoriesUrns: null,
      header: null,
      hasHeader: false,
      agencies: null,
      ddbDataflowLabels: null,
      dsdForLayoutAnnotations: null
    },
    action
  ) => {
    switch (action.type) {
      case DATAFLOW_BUILDER_WIZARD_SHOW:
        return {
          ...state,
          isWizardVisible: true,
          wizardStep: DATAFLOW_BUILDER_WIZARD_STEP_DATAFLOW,
          dataflow: {
            id: null,
            agencyID: null,
            version: null,
            isFinal: true,
            uri: null,
            urn: null,
            validTo: null,
            validFrom: null,
            name: null,
            description: null,
            header: null,
            hasHeader: false,
          },
          ddbDataflowId: null,
          dataflowTriplet: null,
          ddbDataflow: null,
          cubeId: null,
          cube: null,
          cubeFirstRow: null,
          filter: null,
          treeFilter: {},
          filterMode: QUERY_FORM_FILTER_MODE_PLAIN,
          isFilterModalVisible: false,
          categoriesUrns: null,
          header: null,
          hasHeader: false,
          agencies: null,
          ddbDataflowLabels: null
        };
      case DATAFLOW_BUILDER_WIZARD_HIDE:
        return {
          ...state,
          isWizardVisible: false,
          wizardStep: null,
          dataflowTriplet: null,
          dataflow: null,
          ddbDataflowId: null,
          ddbDataflow: null,
          cubeId: null,
          cube: null,
          cubeFirstRow: null,
          filter: null,
          treeFilter: {},
          filterMode: QUERY_FORM_FILTER_MODE_PLAIN,
          isFilterModalVisible: false,
          categoriesUrns: null,
          header: null,
          hasHeader: false,
          dataflows: null,
          agencies: null,
          ddbDataflowLabels: null,
          dsdForLayoutAnnotations: null
        };
      case DATAFLOW_BUILDER_WIZARD_QUERY_FILTER_MODAL_SHOW:
        return {
          ...state,
          isFilterModalVisible: true,
          filterTemp: state.filter,
          treeFilterTemp: (state.treeFilter || {})
        };
      case DATAFLOW_BUILDER_WIZARD_QUERY_FILTER_MODAL_HIDE:
        return {
          ...state,
          isFilterModalVisible: false,
          filterTemp: null,
          treeFilterTemp: {}
        };
      case DATAFLOW_BUILDER_WIZARD_QUERY_FILTER_MODAL_SUBMIT:
        return {
          ...state,
          isFilterModalVisible: false,
          filter: state.filterMode === QUERY_FORM_FILTER_MODE_PLAIN ? action.filter : state.filter,
          filterTemp: null,
          treeFilter: state.filterMode === QUERY_FORM_FILTER_MODE_TREE ? action.filter : state.treeFilter,
          treeFilterTemp: {}
        };
      case DATAFLOW_BUILDER_WIZARD_STEP_SET:
        return {
          ...state,
          wizardStep: action.step
        };
      case DATAFLOW_BUILDER_LIST_DATAFLOW_EDIT:

        const filterStr = getFilterStrFromServerQueryObj(action.filter);

        return {
          ...state,
          isWizardVisible: true,
          wizardStep: DATAFLOW_BUILDER_WIZARD_STEP_DATAFLOW,
          dataflowTriplet: action.dataflowTriplet,
          ddbDataflowId: action.ddbDataflowId,
          cubeId: action.cubeId,
          filterMode:
            filterStr.includes(" IN ") ? QUERY_FORM_FILTER_MODE_TREE : QUERY_FORM_FILTER_MODE_PLAIN,
          filter:
            filterStr.includes(" IN ")
              ? null
              : getFilterObjFromStr(filterStr),
          treeFilter:
            filterStr.includes(" IN ")
              ? getTreeFilterObjFromStr(filterStr)
              : null,
          ddbDataflowLabels: _.find(state.dataflows, dataflow => dataflow.IDDataflow === action.ddbDataflowId).labels
        };
      case DATAFLOW_BUILDER_WIZARD_DATAFLOW_FORM_DATAFLOW_CHANGE:
        const dataflow = _.cloneDeep(state.dataflow);

        const customizer = (_, src, key) => {
          if (key === "annotations")
            return src;
          else {
            return undefined
          }
        };

        const newDataflow = _.mergeWith(dataflow, action.fields, customizer)

        return {
          ...state,
          dataflow: newDataflow,
          dataflowOriginalAnnotations: newDataflow.annotations
        };
      case DATAFLOW_BUILDER_WIZARD_QUERY_CUBE_COLUMNS_FORM_CUBE_SET:
        return {
          ...state,
          cubeId: action.cubeId,
          cube: null,
        };
      case DATAFLOW_BUILDER_WIZARD_QUERY_CUBE_COLUMNS_FORM_CUBE_UNSET:

        const nodeConfig =  getCurrentNodeConfig(action);
        const annotationTabsConfig = nodeConfig.annotationTabs.tabs;
        const annotationsConfig = nodeConfig.annotations;

        return {
          ...state,
          cubeId: null,
          cube: null,
          cubeFirstRow: null,
          filter: null,
          treeFilter: {},
          filterMode: QUERY_FORM_FILTER_MODE_PLAIN,
          dataflow: {
            ...state.dataflow,
            structure: undefined,
            annotations: [
              ..._.cloneDeep(getGenericAnnotations(state.dataflow ? state.dataflow.annotations : [], annotationTabsConfig, annotationsConfig)),
              ..._.cloneDeep(getCustomAnnotationsFromTabsMap(getCustomAnnotationsTabsMap(state.dataflow ? state.dataflow.annotations : [], annotationTabsConfig)))
            ]
          }
        };
      case DATAFLOW_BUILDER_WIZARD_QUERY_CUBE_COLUMNS_FORM_CHANGE: {
        if (action.fields.cubeColumns !== undefined) {
          const columns = _.cloneDeep(state.cube.columns);
          return {
            ...state,
            cube: {
              ...state.cube,
              columns: _.merge(columns, action.fields.cubeColumns.value)
            }
          };
        } else {
          return state;
        }
      }
      case DATAFLOW_BUILDER_WIZARD_QUERY_FILTER_FORM_BLOCK_ADD: {
        const block = {
          column: null,
          logicalOperator: 'OR',
          conditions: null
        };
        return {
          ...state,
          filterTemp:
            state.filterTemp !== null
              ? (
                [
                  ...state.filterTemp,
                  block
                ]
              )
              : [block]
        };
      }
      case DATAFLOW_BUILDER_WIZARD_QUERY_FILTER_FORM_BLOCK_DELETE: {
        const filterTemp = _.cloneDeep(state.filterTemp);
        filterTemp.splice(action.blockIndex, 1);
        return {
          ...state,
          filterTemp: filterTemp
        };
      }
      case DATAFLOW_BUILDER_WIZARD_QUERY_FILTER_RESET:
        return {
          ...state,
          filterTemp: [],
          treeFilterTemp: {}
        };
      case DATAFLOW_BUILDER_WIZARD_QUERY_FILTER_MODE_CHANGE:
        return {
          ...state,
          filterMode: action.filterMode,
          filterTemp: [],
          treeFilterTemp: {}
        };
      case DATAFLOW_BUILDER_WIZARD_QUERY_FILTER_FORM_CONDITION_ADD: {
        const filterTemp = _.cloneDeep(state.filterTemp);
        const condition = {
          comparisonOperator: null,
          value: null
        };
        if (filterTemp[action.blockIndex].conditions !== null) {
          filterTemp[action.blockIndex].conditions.push(condition);
        } else {
          filterTemp[action.blockIndex].conditions = [condition];
        }
        return {
          ...state,
          filterTemp: filterTemp
        };
      }
      case DATAFLOW_BUILDER_WIZARD_QUERY_FILTER_FORM_CONDITION_DELETE: {
        const filterTemp = _.cloneDeep(state.filterTemp);
        filterTemp[action.blockIndex].conditions.splice(action.conditionIndex, 1);
        return {
          ...state,
          filterTemp: filterTemp
        };
      }
      case DATAFLOW_BUILDER_WIZARD_QUERY_FILTER_FORM_CHANGE: {
        const filterTemp = _.cloneDeep(state.filterTemp);
        if (action.fields.filter.filter(block => block.column !== undefined).length > 0) {
          action.fields.filter = action.fields.filter.map(block => ({
            ...block,
            conditions: null
          }));
        }
        return {
          ...state,
          filterTemp: _.merge(filterTemp, action.fields.filter)
        };
      }
      case DATAFLOW_BUILDER_WIZARD_CATEGORY_TREE_SELECTION_CHANGE:
        return {
          ...state,
          categoriesUrns: action.selection
        };
      case DATAFLOW_BUILDER_WIZARD_HEADER_FORM_CHANGE: {
        return {
          ...state,
          header: _.merge(_.cloneDeep(state.header), action.fields)
        };
      }
      case DATAFLOW_BUILDER_WIZARD_HEADER_FORM_HIDE:
        return {
          ...state,
          hasHeader: false
        };
      case DATAFLOW_BUILDER_WIZARD_HEADER_FORM_SHOW:
        return {
          ...state,
          hasHeader: true
        };
      case DATAFLOW_BUILDER_WIZARD_QUERY_TREE_FILTER_CHANGE:
        return {
          ...state,
          treeFilterTemp: action.treeFilter
        };
      case DATAFLOW_BUILDER_WIZARD_QUERY_TREE_FILTER_COLUMN_MODE_CHANGE: {

        let cube = _.cloneDeep(state.cube);
        const treeFilterTemp = _.cloneDeep(state.treeFilterTemp);

        treeFilterTemp[action.colName] = {
          mode: action.mode,
          values: treeFilterTemp[action.colName] && treeFilterTemp[action.colName].values
            ? treeFilterTemp[action.colName].values
            : []
        };

        const colNames =
          _.flatten(Object.keys(state.cube.columns).map(key => state.cube.columns[key]))
            .map(({name}) => name);

        const colIndex = colNames.indexOf(action.colName);

        const subsequentColNames = colNames.splice(colIndex + 1);

        // delete filters for subsequent cols
        subsequentColNames.forEach(name => {
          delete treeFilterTemp[name];
        });

        // delete filteredCodelistTree for subsequent cols
        cube.columns = _.mapValues(cube.columns, colArr =>
          colArr.map(col =>
            subsequentColNames.includes(col.name)
              ? ({
                ...col,
                filteredCodelistTree: null
              })
              : col
          ));

        return {
          ...state,
          cube,
          treeFilterTemp: treeFilterTemp
        };
      }
      case DATAFLOW_BUILDER_WIZARD_QUERY_TREE_FILTER_COLUMN_VALUES_CHANGE: {

        const treeFilterTemp = _.cloneDeep(state.treeFilterTemp);

        treeFilterTemp[action.colName] = {
          mode: treeFilterTemp[action.colName] && treeFilterTemp[action.colName].mode
            ? treeFilterTemp[action.colName].mode
            : FILTER_MODE_IN,
          values: action.values
        };

        const colNames =
          _.flatten(Object.keys(state.cube.columns).map(key => state.cube.columns[key]))
            .map(({name}) => name);

        const colIndex = colNames.indexOf(action.colName);

        const subsequentColNames = colNames.splice(colIndex + 1);

        // delete filters for subsequent cols
        subsequentColNames.forEach(name => {
          delete treeFilterTemp[name];
        });

        return {
          ...state,
          cube: {
            ...state.cube,
            columns: _.mapValues(state.cube.columns, colArr => // delete filteredCodelistTree for subsequent cols
              colArr.map(col => {
                if (subsequentColNames.includes(col.name)) {
                  return ({
                    ...col,
                    filteredCodelistTree: null
                  });
                } else {
                  return col;
                }
              }))
          },
          treeFilterTemp: treeFilterTemp
        };
      }
      case DATAFLOW_BUILDER_WIZARD_LAYOUT_ANNOTATIONS_FORM_SUBMIT:
        return {
          ...state,
          dataflow: {
            ...state.dataflow,
            annotations: action.annotations
          }
        };
      case DATAFLOW_BUILDER_WIZARD_LAYOUT_ANNOTATIONS_FORM_RESET:
        return {
          ...state,
          dataflow: {
            ...state.dataflow,
            annotations: state.dataflowOriginalAnnotations
          }
        };
      case REQUEST_ERROR:
        switch (action.label) {
          case DATAFLOW_BUILDER_LIST_DATAFLOWS_READ:
            return {
              ...state,
              dataflows: []
            };
          case DATAFLOW_BUILDER_WIZARD_DATAFLOW_READ:
          case DATAFLOW_BUILDER_WIZARD_QUERY_CUBE_COLUMNS_FORM_DDB_DATAFLOW_READ:
          case DATAFLOW_BUILDER_WIZARD_QUERY_CUBE_COLUMNS_FORM_CUBE_READ:
          case DATAFLOW_BUILDER_WIZARD_QUERY_FILTER_FORM_CODELIST_READ:
          case DATAFLOW_BUILDER_WIZARD_QUERY_FILTER_FORM_COLUMN_VALUES_READ:
          case DATAFLOW_BUILDER_WIZARD_CATEGORY_TREE_CATEGORISATIONS_READ:
            return {
              ...state,
              isWizardVisible: false
            };
          case DATAFLOW_BUILDER_WIZARD_SUBMIT:
            if (action.error && action.error.dfNewId) {
              return {
                ...state,
                ddbDataflow: {
                  ...state.ddbDataflow,
                  IDDataflow: action.error.dfNewId
                }
              };
            } else {
              return state;
            }
          default:
            return state;
        }
      case REQUEST_SUCCESS:
        switch (action.label) {
          case DATAFLOW_BUILDER_LIST_DATAFLOW_MAPPING_SET_SET:
          case DATAFLOW_BUILDER_LIST_DATAFLOW_MAPPING_SET_UNSET:
          case DATAFLOW_BUILDER_LIST_DATAFLOW_TRANSCODING_SET:
          case DATAFLOW_BUILDER_LIST_DATAFLOW_TRANSCODING_FROM_CC_SET:
          case DATAFLOW_BUILDER_LIST_DATAFLOW_TRANSCODING_UNSET:
          case DATAFLOW_BUILDER_LIST_DATAFLOW_CONTENT_CONSTRAINT_SET:
          case DATAFLOW_BUILDER_LIST_DATAFLOW_CONTENT_CONSTRAINT_UNSET:
          case DATAFLOW_BUILDER_LIST_DATAFLOW_PRODUCTION_FLAG_SET:
            return {
              ...state,
              dataflows: null
            };
          case DATAFLOW_BUILDER_WIZARD_QUERY_TREE_FILTER_COLUMN_FILTERED_VALUES_READ: {

            const filteredValues = action.response.map(obj => obj[action.colName]);

            let cube = _.cloneDeep(state.cube);
            cube.columns = _.mapValues(cube.columns, colArr =>
              colArr.map(col => {
                if (col.name === action.colName) {

                  const filteredCodelistTree =
                    col.CodelistCode !== null
                      ? getFilteredTreeWithPaths(
                      col.codelistTree || [],
                      "codes",
                      ({id}) => filteredValues.includes(id)
                      )
                      : null;

                  return ({
                    ...col,
                    filteredCodelistTree,
                    filteredValues,
                    filteredCodelistTreeMaxDepth:
                      col.CodelistCode !== null
                        ? getMaxTreeDepth(filteredCodelistTree, "codes")
                        : null
                  });
                } else
                  return col;
              }));

            return {
              ...state,
              cube
            };
          }
          case DATAFLOW_BUILDER_WIZARD_QUERY_TREE_FILTER_COLUMN_CODELIST_COUNT_READ: {

            let cube = _.cloneDeep(state.cube);
            cube.columns = _.mapValues(cube.columns, colArr =>
              colArr.map(col =>
                col.CodelistCode === getStringFromArtefactTriplet(action.codelistTriplet)
                  ? ({
                    ...col,
                    codelistCount: Number(action.header["x-total-count"])
                  })
                  : col
              ));

            return {
              ...state,
              cube
            };
          }
          case DATAFLOW_BUILDER_WIZARD_QUERY_TREE_FILTER_COLUMN_CODELIST_TREE_READ: {

            const codelist = getItemSchemeFromSdmxJsonFactory(
              SDMX_JSON_CODELIST_ITEMS_KEY,
              getCurrentNodeConfig(action).annotations,
              CODELIST_ORDER_ANNOTATION_KEY
            )(getSdmxStructuresFromSdmxJson(action.response)[0]);

            let itemsTree = getTreeFromArray((codelist.codes || []), "codes");

            let cube = _.cloneDeep(state.cube);
            cube.columns = _.mapValues(cube.columns, colArr =>
              colArr.map(col =>
                col.CodelistCode === getStringFromArtefactTriplet(action.codelistTriplet)
                  ? ({
                    ...col,
                    codelistTree: itemsTree
                  })
                  : col
              ));

            return {
              ...state,
              cube
            };
          }
          case DATAFLOW_BUILDER_WIZARD_DSD_FOR_LAYOUT_ANNOTATIONS_READ:
            return {
              ...state,
              dsdForLayoutAnnotations: getDsdFromSdmxJsonStructure(
                getSdmxStructuresFromSdmxJson(action.response)[0],
                getCurrentNodeConfig(action).annotations
              )
            };
          case DATAFLOW_BUILDER_LIST_DATAFLOWS_READ:

            const msdbDataflows =
              (getSdmxStructuresFromSdmxJson(action.response[1], SDMX_JSON_DATAFLOW_LIST_KEY) || [])
                .map(artefact => getArtefactFromSdmxJsonStructure(artefact, getCurrentNodeConfig(action).annotations));

            return {
              ...state,
              dataflows: (action.response[0] || [])
                .filter(ddbDataflow =>
                  msdbDataflows.filter(({id, agencyID, version}) =>
                    ddbDataflow.ID === id &&
                    ddbDataflow.Agency === agencyID &&
                    ddbDataflow.Version === version).length)
                .map(ddbDataflow => {

                  const dataflow = msdbDataflows
                    .filter(({id, agencyID, version}) =>
                      ddbDataflow.ID === id &&
                      ddbDataflow.Agency === agencyID &&
                      ddbDataflow.Version === version)[0];

                  const dataflowNonProductionDataflowAnnotationArr =
                    [...(dataflow.annotations || []), ...(dataflow.autoAnnotations || [])]
                      .filter(({type}) => type === 'NonProductionDataflow');

                  return {
                    ...ddbDataflow,
                    isProduction: dataflowNonProductionDataflowAnnotationArr.length === 0,
                    cubeID:
                    (action.response[2] || [])
                      .filter(cube => cube.IDCube === ddbDataflow.IDCube)[0].Code,
                    dsdTriplet: getArtefactTripletFromUrn(dataflow.structure),
                    annotations: dataflow.annotations,
                    haveMetadata: (dataflow.autoAnnotations || []).find(({type}) =>
                      (type || "").toLowerCase() === (getCurrentNodeConfig(action).annotations[AUTO_ANNOTATION_HAVE_METADATA_KEY] || "").toLowerCase()
                    )
                  };
                })
            };
          case DATAFLOW_BUILDER_WIZARD_QUERY_CUBE_COLUMNS_FORM_DDB_DATAFLOW_READ:
            return {
              ...state,
              ddbDataflow: action.response
            };
          case DATAFLOW_BUILDER_WIZARD_DATAFLOW_READ:

            const userPermissions = getCurrentUserPermissions(action);
            const customNoneIsAutoAnnotation = userPermissions && userPermissions.rules.includes("CanManageWorkingAnnotation")
              ? () => false
              : undefined;

            const dataflow = {
              ...getArtefactFromSdmxJsonStructure(
                getSdmxStructuresFromSdmxJson(action.response)[0],
                getCurrentNodeConfig(action).annotations,
                customNoneIsAutoAnnotation
              ),
              name: state.ddbDataflowLabels
            };

            const annotationTabsConfig = getCurrentNodeConfig(action).annotationTabs.tabs;
            const annotationsConfig = getCurrentNodeConfig(action).annotations;

            return {
              ...state,
              dataflow,
              dataflowOriginalAnnotations: [
                ...getGenericAnnotations(dataflow.annotations, annotationTabsConfig, annotationsConfig),
                ...getCustomAnnotationsFromTabsMap(getCustomAnnotationsTabsMap(dataflow.annotations, annotationTabsConfig))
              ]
            };
          case DATAFLOW_BUILDER_WIZARD_QUERY_CUBE_COLUMNS_FORM_CUBE_READ:
            const cube = action.response;
            return {
              ...state,
              dataflow: {
                ...state.dataflow,
                structure: getUrnFromArtefactTriplet(getArtefactTripletFromString(cube.DSDCode), SDMX_JSON_DSD_URN_NAMESPACE)
              },
              cube: {
                ...cube,
                columns: {
                  dimensions:
                    cube.Dimensions
                      .filter(dim => !dim.IsTimeSeriesDim)
                      .map(dim => ({
                        ...dim,
                        name: dim.ColName,
                        checked:
                          state.ddbDataflow !== null && state.ddbDataflow.IDCube === cube.IDCube
                            ? (state.ddbDataflow.DataflowColumns
                                .filter(col => col === dim.ColName)
                                .length > 0
                            )
                            : true,
                        disabled: false,
                        isNumeric: false,
                        values: null,
                        codelistCount: null,
                        codelistTree: null,
                        filteredCodelistTree: null
                      })),
                  timeDimensions:
                    cube.Dimensions
                      .filter(dim => dim.IsTimeSeriesDim)
                      .map(dim => ({
                        ...dim,
                        name: dim.ColName,
                        checked:
                          state.ddbDataflow !== null && state.ddbDataflow.IDCube === cube.IDCube
                            ? (state.ddbDataflow.DataflowColumns
                                .filter(col => col === dim.ColName)
                                .length > 0
                            )
                            : true,
                        disabled: true,
                        isNumeric: false,
                        values: null,
                        codelistCount: null,
                        codelistTree: null,
                        filteredCodelistTree: null
                      })),
                  tidAttributes:
                    cube.Attributes
                      .filter(attr => attr.IsTid)
                      .map(attr => ({
                        ...attr,
                        name: attr.ColName,
                        checked: false,
                        disabled: true,
                        isNumeric: false,
                        values: null,
                        codelistCount: null,
                        codelistTree: null,
                        filteredCodelistTree: null
                      })),
                  attributes: cube.Attributes
                    .filter(attr => !attr.IsTid)
                    .map(attr => ({
                      ...attr,
                      name: attr.ColName,
                      checked:
                        state.ddbDataflow !== null && state.ddbDataflow.IDCube === cube.IDCube
                          ? (state.ddbDataflow.DataflowColumns
                              .filter(col => col === attr.ColName)
                              .length > 0
                          )
                          : true,
                      disabled: false,
                      isNumeric: false,
                      values: null,
                      codelistCount: null,
                      codelistTree: null,
                      filteredCodelistTree: null
                    })),
                  measures: cube.Measures.map(meas => ({
                    ...meas,
                    name: meas.ColName,
                    checked: true,
                    disabled: true,
                    isNumeric: true
                  }))
                }
              }
            };
          case DATAFLOW_BUILDER_WIZARD_QUERY_CUBE_COLUMNS_FORM_CUBE_FIRST_ROW_READ:
            return {
              ...state,
              cubeFirstRow: action.response.Data[0]
            };
          case DATAFLOW_BUILDER_WIZARD_QUERY_FILTER_FORM_COLUMN_VALUES_READ: {

            const columnValues = (action.columnCodelistCode ? action.response[0] : action.response)
              .map(val => val[action.columnName]);

            const codes = action.columnCodelistCode
              ? getItemSchemeFromSdmxJsonFactory(
                SDMX_JSON_CODELIST_ITEMS_KEY,
                getCurrentNodeConfig(action).annotations
              )(getSdmxStructuresFromSdmxJson(action.response[1])[0]).codes
              : null;

            let cube = _.cloneDeep(state.cube);
            cube.columns = _.mapValues(cube.columns, colArr =>
              colArr.map(col =>
                col.ColName === action.columnName
                  ? ({
                    ...col,
                    values: codes
                      ? codes.filter(({id}) => columnValues.filter(val => val === id).length)
                      : columnValues
                  })
                  : col
              ));
            return {
              ...state,
              cube
            };
          }
          case DATAFLOW_BUILDER_WIZARD_CATEGORY_TREE_CATEGORISATIONS_READ: {
            if (state.dataflowTriplet !== null) {

              const categorisations =
                (getSdmxStructuresFromSdmxJson(action.response, SDMX_JSON_CATEGORISATION_LIST_KEY) || [])
                  .map(artefact => getArtefactFromSdmxJsonStructure(artefact, getCurrentNodeConfig(action).annotations));

              return {
                ...state,
                categoriesUrns:
                  categorisations
                    .filter(({source}) =>
                      getArtefactTripletFromUrn(source).id === state.dataflowTriplet.id)
                    .map(({target}) => target)
              };
            }
            return state;
          }
          case DATAFLOW_BUILDER_WIZARD_HEADER_FORM_HEADER_READ:

            const getHeaderContact = obj => ({
              organisationId: (obj && obj.id) || null,
              organisationName: (obj && obj.name && obj.name.en) || null,
              contactName:
                (
                  obj && obj.contacts && obj.contacts.length &&
                  obj.contacts[0].name && obj.contacts[0].name.en
                ) || null,
              contactDepartment:
                (
                  obj && obj.contacts && obj.contacts.length &&
                  obj.contacts[0].department && obj.contacts[0].department.en
                ) || null,
              contactRole:
                (
                  obj && obj.contacts && obj.contacts.length &&
                  obj.contacts[0].role && obj.contacts[0].role.en
                ) || null,
              contactEmail:
                (
                  obj && obj.contacts && obj.contacts.length &&
                  obj.contacts[0].email && obj.contacts[0].email &&
                  obj.contacts[0].email.length && obj.contacts[0].email[0]
                ) || null
            });

            return {
              ...state,
              hasHeader: action.response !== null,
              header: ({
                test: false,
                name: null,
                dataSetAgencyId: null,
                source: null,
                ...action.response || {},
                sender:
                  getHeaderContact((action.response && action.response.sender) || null),
                receiver:
                  getHeaderContact(
                    (
                      action.response && action.response.receiver &&
                      action.response.receiver.length && action.response.receiver[0]
                    ) || null
                  )
              })
            };
          case  DATAFLOW_BUILDER_WIZARD_SUBMIT:
            return {
              ...state,
              isWizardVisible: false,
              wizardStep: null,
              dataflows: null,
              ddbDataflowId: null,
              dataflowTriplet: null,
              ddbDataflow: null,
              dataflow: null,
              cubeId: null,
              cube: null,
              cubeFirstRow: null,
              filter: null,
              treeFilter: {},
              filterMode: QUERY_FORM_FILTER_MODE_PLAIN,
              categoriesUrns: null,
              header: null,
              hasHeader: false,
              agencies: null,
              ddbDataflowLabels: null
            };
          case DATAFLOW_BUILDER_LIST_DATAFLOW_DELETE:
            return {
              ...state,
              dataflows: null
            };
          case DATAFLOW_BUILDER_WIZARD_DATAFLOW_FORM_AGENCIES_READ:
            return {
              ...state,
              agencies: _.pickBy(action.response, (_, agencyID) => !action.allowedAgencies || action.allowedAgencies.includes(agencyID))
            };
          default:
            return state;
        }
      default:
        return state;
    }
  }
});

export default dataflowBuilderReducer;
