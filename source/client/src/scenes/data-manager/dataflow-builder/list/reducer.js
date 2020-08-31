import {REQUEST_ERROR, REQUEST_START, REQUEST_SUCCESS} from '../../../../middlewares/api/actions';
import {
  DATAFLOW_BUILDER_LIST_DATAFLOW_ANNOTATIONS_HIDE,
  DATAFLOW_BUILDER_LIST_DATAFLOW_ANNOTATIONS_SHOW,
  DATAFLOW_BUILDER_LIST_DATAFLOW_CONTENT_CONSTRAINT_SET,
  DATAFLOW_BUILDER_LIST_DATAFLOW_CONTENT_CONSTRAINT_UNSET,
  DATAFLOW_BUILDER_LIST_DATAFLOW_DOWNLOAD,
  DATAFLOW_BUILDER_LIST_DATAFLOW_DOWNLOAD_CHANGE,
  DATAFLOW_BUILDER_LIST_DATAFLOW_DOWNLOAD_COLUMNS_CHANGE,
  DATAFLOW_BUILDER_LIST_DATAFLOW_DOWNLOAD_COLUMNS_CHECK,
  DATAFLOW_BUILDER_LIST_DATAFLOW_DOWNLOAD_CUBE_AND_DDBDATAFLOW_READ,
  DATAFLOW_BUILDER_LIST_DATAFLOW_DOWNLOAD_DSD_READ,
  DATAFLOW_BUILDER_LIST_DATAFLOW_DOWNLOAD_FILTER_FORM_BLOCK_ADD,
  DATAFLOW_BUILDER_LIST_DATAFLOW_DOWNLOAD_FILTER_FORM_BLOCK_DELETE,
  DATAFLOW_BUILDER_LIST_DATAFLOW_DOWNLOAD_FILTER_FORM_COLUMN_VALUES_READ,
  DATAFLOW_BUILDER_LIST_DATAFLOW_DOWNLOAD_FILTER_FORM_CONDITION_ADD,
  DATAFLOW_BUILDER_LIST_DATAFLOW_DOWNLOAD_FILTER_FORM_CONDITION_DELETE,
  DATAFLOW_BUILDER_LIST_DATAFLOW_DOWNLOAD_FILTER_MODAL_FILTER_CHANGE,
  DATAFLOW_BUILDER_LIST_DATAFLOW_DOWNLOAD_FILTER_MODAL_FILTER_MODE_CHANGE,
  DATAFLOW_BUILDER_LIST_DATAFLOW_DOWNLOAD_FILTER_MODAL_FILTER_RESET,
  DATAFLOW_BUILDER_LIST_DATAFLOW_DOWNLOAD_FILTER_MODAL_HIDE,
  DATAFLOW_BUILDER_LIST_DATAFLOW_DOWNLOAD_FILTER_MODAL_SHOW,
  DATAFLOW_BUILDER_LIST_DATAFLOW_DOWNLOAD_FILTER_MODAL_SUBMIT,
  DATAFLOW_BUILDER_LIST_DATAFLOW_DOWNLOAD_FILTER_MODAL_TREE_FILTER_CHANGE,
  DATAFLOW_BUILDER_LIST_DATAFLOW_DOWNLOAD_FILTER_MODAL_TREE_FILTER_COLUMN_CODELIST_COUNT_READ,
  DATAFLOW_BUILDER_LIST_DATAFLOW_DOWNLOAD_FILTER_MODAL_TREE_FILTER_COLUMN_CODELIST_TREE_READ,
  DATAFLOW_BUILDER_LIST_DATAFLOW_DOWNLOAD_FILTER_MODAL_TREE_FILTER_COLUMN_FILTERED_VALUES_READ,
  DATAFLOW_BUILDER_LIST_DATAFLOW_DOWNLOAD_FILTER_MODAL_TREE_FILTER_COLUMN_MODE_CHANGE,
  DATAFLOW_BUILDER_LIST_DATAFLOW_DOWNLOAD_FILTER_MODAL_TREE_FILTER_COLUMN_VALUES_CHANGE,
  DATAFLOW_BUILDER_LIST_DATAFLOW_DOWNLOAD_FILTER_ROWS_MODAL_HIDE,
  DATAFLOW_BUILDER_LIST_DATAFLOW_DOWNLOAD_FILTER_ROWS_MODAL_SHOW,
  DATAFLOW_BUILDER_LIST_DATAFLOW_DOWNLOAD_FILTER_ROWS_READ,
  DATAFLOW_BUILDER_LIST_DATAFLOW_DOWNLOAD_HIDE,
  DATAFLOW_BUILDER_LIST_DATAFLOW_DOWNLOAD_PREVIEW_HIDE,
  DATAFLOW_BUILDER_LIST_DATAFLOW_DOWNLOAD_PREVIEW_READ,
  DATAFLOW_BUILDER_LIST_DATAFLOW_DOWNLOAD_PREVIEW_SHOW,
  DATAFLOW_BUILDER_LIST_DATAFLOW_DOWNLOAD_QUERY_HIDE,
  DATAFLOW_BUILDER_LIST_DATAFLOW_DOWNLOAD_QUERY_SET,
  DATAFLOW_BUILDER_LIST_DATAFLOW_DOWNLOAD_QUERY_SHOW,
  DATAFLOW_BUILDER_LIST_DATAFLOW_DOWNLOAD_QUERY_UNSET,
  DATAFLOW_BUILDER_LIST_DATAFLOW_DOWNLOAD_SHOW,
  DATAFLOW_BUILDER_LIST_DATAFLOW_MAPPING_SET_SET,
  DATAFLOW_BUILDER_LIST_DATAFLOW_MAPPING_SET_UNSET,
  DATAFLOW_BUILDER_LIST_DATAFLOW_LAYOUT_ANNOTATIONS_HIDE,
  DATAFLOW_BUILDER_LIST_DATAFLOW_LAYOUT_ANNOTATIONS_SHOW,
  DATAFLOW_BUILDER_LIST_DATAFLOW_PREVIEW_HIDE,
  DATAFLOW_BUILDER_LIST_DATAFLOW_PREVIEW_READ,
  DATAFLOW_BUILDER_LIST_DATAFLOW_PREVIEW_SHOW,
  DATAFLOW_BUILDER_LIST_DATAFLOW_PRODUCTION_FLAG_SET,
  DATAFLOW_BUILDER_LIST_DATAFLOW_PRODUCTION_MODAL_DATAFLOW_MAPPING_SET_ID_READ,
  DATAFLOW_BUILDER_LIST_DATAFLOW_PRODUCTION_MODAL_HIDE,
  DATAFLOW_BUILDER_LIST_DATAFLOW_PRODUCTION_MODAL_SHOW,
  DATAFLOW_BUILDER_LIST_DATAFLOW_READ,
  DATAFLOW_BUILDER_LIST_DATAFLOW_TRANSCODING_FROM_CC_CONTENT_CONSTRAINT_SET,
  DATAFLOW_BUILDER_LIST_DATAFLOW_TRANSCODING_FROM_CC_CONTENT_CONSTRAINT_UNSET,
  DATAFLOW_BUILDER_LIST_DATAFLOW_TRANSCODING_FROM_CC_LIST_HIDE,
  DATAFLOW_BUILDER_LIST_DATAFLOW_TRANSCODING_FROM_CC_LIST_READ,
  DATAFLOW_BUILDER_LIST_DATAFLOW_TRANSCODING_FROM_CC_LIST_SHOW,
  DATAFLOW_BUILDER_LIST_DATAFLOW_TRANSCODING_FROM_CC_SET,
  DATAFLOW_BUILDER_LIST_DATAFLOW_TRANSCODING_MODE_CHANGE,
  DATAFLOW_BUILDER_LIST_DATAFLOW_TRANSCODING_SET,
  DATAFLOW_BUILDER_LIST_DATAFLOW_TRANSCODING_UNSET,
} from './actions';
import _ from "lodash";
import {
  CODELIST_ORDER_ANNOTATION_KEY,
  FILTER_MODE_IN,
  getArtefactFromSdmxJsonStructure,
  getDsdFromSdmxJsonStructure,
  getItemSchemeFromSdmxJsonFactory,
  getSdmxStructuresFromSdmxJson,
  getStringFromArtefactTriplet,
  SDMX_JSON_CODELIST_ITEMS_KEY
} from "../../../../utils/sdmxJson";
import {getCurrentNodeConfig} from "../../../../middlewares/current-node-config/middleware";
import {QUERY_FORM_FILTER_MODE_PLAIN, QUERY_FORM_FILTER_MODE_TREE} from "../../../../components/query-form";
import {getFilteredTreeWithPaths, getMaxTreeDepth, getTreeFromArray} from "../../../../utils/tree";
import {getTreeFilterStrFromObj} from "../../../../components/tree-filter/utils";
import {getFilterStrFromObj} from "../../../../utils/filter";

export const DATAFLOW_BUILDER_LIST_DATAFLOW_PRODUCTION_MODAL_MODE_AUTO = 'DATAFLOW_BUILDER_LIST_DATAFLOW_PRODUCTION_MODAL_MODE_AUTO';
export const DATAFLOW_BUILDER_LIST_DATAFLOW_PRODUCTION_MODAL_MODE_CC = 'DATAFLOW_BUILDER_LIST_DATAFLOW_PRODUCTION_MODAL_MODE_CC';

const dataflowBuilderListReducer = (
  state = {
    dataflowId: null,
    dataflow: null,
    dataflowPreview: null,
    dataflowProductionModalMappingSetId: undefined,
    dataflowProductionModalDDBDataflowId: null,
    dataflowProductionModalDataflowTriplet: null,
    dataflowProductionModalTranscodingMode: DATAFLOW_BUILDER_LIST_DATAFLOW_PRODUCTION_MODAL_MODE_AUTO,
    dataflowProductionModalTranscodingContentConstraintTriplet: null,
    isDataflowProductionModalTranscodingContentConstraintListVisible: null,
    dataflowProductionModalTranscodingContentConstraints: null,
    dlDataflowId: null,
    dlDataflow: null,
    dlDataflowParams: null,
    dlDsdTriplet: null,
    dlDsdDimensions: null,
    dlDataflowTriplet: null,
    dlIsDataflowQueryVisible: false,
    cubeId: null,
    cube: null,
    dlRows: null,
    dlCols: null,
    dlCheckedCols: null,
    filter: null,
    filterTemp: null,
    treeFilter: {},
    treeFilterTemp: {},
    filterMode: QUERY_FORM_FILTER_MODE_PLAIN,
    isFilterModalVisible: false,
    dlIsPreviewVisible: false,
    dataflowAnnotations: null,
    dataflowLayoutAnnotations: null,
    filterRows: null
  },
  action
) => {
  switch (action.type) {
    case DATAFLOW_BUILDER_LIST_DATAFLOW_PREVIEW_SHOW:
      return {
        ...state,
        dataflowId: action.dataflowId
      };
    case DATAFLOW_BUILDER_LIST_DATAFLOW_TRANSCODING_MODE_CHANGE:
      return {
        ...state,
        dataflowProductionModalTranscodingMode: action.mode,
        dataflowProductionModalTranscodingContentConstraintTriplet: null
      };
    case DATAFLOW_BUILDER_LIST_DATAFLOW_TRANSCODING_FROM_CC_LIST_SHOW:
      return {
        ...state,
        isDataflowProductionModalTranscodingContentConstraintListVisible: true
      };
    case DATAFLOW_BUILDER_LIST_DATAFLOW_TRANSCODING_FROM_CC_LIST_HIDE:
      return {
        ...state,
        isDataflowProductionModalTranscodingContentConstraintListVisible: false
      };
    case DATAFLOW_BUILDER_LIST_DATAFLOW_TRANSCODING_FROM_CC_CONTENT_CONSTRAINT_SET:
      return {
        ...state,
        dataflowProductionModalTranscodingContentConstraintTriplet: action.contentConstraintTriplet,
        isDataflowProductionModalTranscodingContentConstraintListVisible: false
      };
    case DATAFLOW_BUILDER_LIST_DATAFLOW_TRANSCODING_FROM_CC_CONTENT_CONSTRAINT_UNSET:
      return {
        ...state,
        dataflowProductionModalTranscodingContentConstraintTriplet: null
      };
    case DATAFLOW_BUILDER_LIST_DATAFLOW_PREVIEW_HIDE:
      return {
        ...state,
        dataflowId: null,
        dataflow: null,
        dataflowPreview: null
      };
    case DATAFLOW_BUILDER_LIST_DATAFLOW_PRODUCTION_MODAL_SHOW:
      return {
        ...state,
        dataflowProductionModalDDBDataflowId: action.ddbDataflowId,
        dataflowProductionModalDataflowTriplet: action.dataflowTriplet
      };
    case DATAFLOW_BUILDER_LIST_DATAFLOW_PRODUCTION_MODAL_HIDE:
      return {
        ...state,
        dataflowProductionModalDDBDataflowId: null,
        dataflowProductionModalDataflowTriplet: null,
        dataflowProductionModalTranscodingMode: DATAFLOW_BUILDER_LIST_DATAFLOW_PRODUCTION_MODAL_MODE_AUTO,
        dataflowProductionModalTranscodingContentConstraintTriplet: null,
        isDataflowProductionModalTranscodingContentConstraintListVisible: null,
        dataflowProductionModalTranscodingContentConstraints: null
      };
    case DATAFLOW_BUILDER_LIST_DATAFLOW_DOWNLOAD_SHOW:
      return {
        ...state,
        dlDataflowId: action.ddbDataflowId,
        cubeId: action.cubeId,
        dlDataflowParams: {
          format: null,
          compression: false,
          csvLanguage: null,
          csvSeparator: ";",
          csvDelimiter: null,
          selCols: null,
          filter: null,
          dimension: null
        },
        dlDataflowTriplet: action.dataflowTriplet,
        dlDsdTriplet: action.dsdTriplet,
        filter: null,
        filterTemp: null,
        treeFilter: {},
        treeFilterTemp: {},
        filterMode: QUERY_FORM_FILTER_MODE_PLAIN
      };
    case DATAFLOW_BUILDER_LIST_DATAFLOW_DOWNLOAD_HIDE:
      return {
        ...state,
        dlDataflowId: null,
        dlDataflow: null,
        dlDataflowParams: null,
        dlDsdTriplet: null,
        dlDsdDimensions: null,
        dlDataflowTriplet: null,
        dlIsDataflowQueryVisible: false,
        dlIsPreviewVisible: null,
        cube: null,
        cubeId: null,
        dlFilter: null,
        dlRows: null,
        dlCols: null,
        dlCheckedCols: null,
        filterTemp: null,
        treeFilter: {},
        treeFilterTemp: {},
        filterMode: QUERY_FORM_FILTER_MODE_PLAIN
      };
    case DATAFLOW_BUILDER_LIST_DATAFLOW_DOWNLOAD_CHANGE:
      const dataflowDownloadParams = _.cloneDeep(state.dlDataflowParams);
      return {
        ...state,
        dlDataflowParams: _.merge(dataflowDownloadParams, action.fields)
      };
    case DATAFLOW_BUILDER_LIST_DATAFLOW_DOWNLOAD_QUERY_SET:
      return {
        ...state,
        dlIsDataflowQueryVisible: false,
        dlDataflowParams: {
          ...state.dlDataflowParams,
          selCols: action.selCols,
          filter: state.filterMode === QUERY_FORM_FILTER_MODE_PLAIN
            ? getFilterStrFromObj(
              action.filter,
              state.cube !== null && state.cube.columns !== null
                ? action.selCols.map(col => ({name: col}))
                : null)
            : getTreeFilterStrFromObj(
              action.filter,
              state.cube !== null && state.cube.columns !== null
                ? action.selCols
                : null)
        }
      };
    case DATAFLOW_BUILDER_LIST_DATAFLOW_DOWNLOAD_QUERY_UNSET:
      return {
        ...state,
        dlIsDataflowQueryVisible: false,
        dlFilter: null,
        dlRows: null,
        dlCols: null,
        dlCheckedCols: null,
        dlDataflowParams: {
          ...state.dlDataflowParams,
          selCols: null,
          filter: null
        },
        filter: null,
        filterTemp: null,
        treeFilter: {},
        treeFilterTemp: {},
        filterMode: QUERY_FORM_FILTER_MODE_PLAIN
      };
    case DATAFLOW_BUILDER_LIST_DATAFLOW_DOWNLOAD_QUERY_SHOW:
      return {
        ...state,
        dlIsDataflowQueryVisible: true
      };
    case DATAFLOW_BUILDER_LIST_DATAFLOW_DOWNLOAD_QUERY_HIDE:
      return {
        ...state,
        dlIsDataflowQueryVisible: false,
        dlCheckedCols: state.dlDataflowParams.selCols ? state.dlDataflowParams.selCols : null,
        dlFilter: state.dlDataflowParams.filter ? state.dlDataflowParams.filter : null
      };
    case DATAFLOW_BUILDER_LIST_DATAFLOW_DOWNLOAD_FILTER_FORM_BLOCK_ADD: {
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
    case DATAFLOW_BUILDER_LIST_DATAFLOW_DOWNLOAD_FILTER_FORM_BLOCK_DELETE: {
      const filterTemp = _.cloneDeep(state.filterTemp);
      filterTemp.splice(action.blockIndex, 1);
      return {
        ...state,
        filterTemp
      };
    }
    case DATAFLOW_BUILDER_LIST_DATAFLOW_DOWNLOAD_FILTER_FORM_CONDITION_ADD: {
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
        filterTemp
      };
    }
    case DATAFLOW_BUILDER_LIST_DATAFLOW_DOWNLOAD_FILTER_FORM_CONDITION_DELETE: {
      const filterTemp = _.cloneDeep(state.filterTemp);
      filterTemp[action.blockIndex].conditions.splice(action.conditionIndex, 1);
      return {
        ...state,
        filterTemp
      };
    }
    case DATAFLOW_BUILDER_LIST_DATAFLOW_DOWNLOAD_PREVIEW_SHOW:
      return {
        ...state,
        dlIsPreviewVisible: true
      };
    case DATAFLOW_BUILDER_LIST_DATAFLOW_DOWNLOAD_PREVIEW_HIDE:
      return {
        ...state,
        dlIsPreviewVisible: false,
        dlRows: null
      };
    case DATAFLOW_BUILDER_LIST_DATAFLOW_DOWNLOAD_COLUMNS_CHECK:
      return {
        ...state,
        dlCheckedCols: action.cols
      };
    case DATAFLOW_BUILDER_LIST_DATAFLOW_DOWNLOAD_COLUMNS_CHANGE:
      return {
        ...state,
        dlCols: action.cols
      };
    case DATAFLOW_BUILDER_LIST_DATAFLOW_ANNOTATIONS_SHOW:
      return {
        ...state,
        dataflowAnnotations: action.annotations
      };
    case DATAFLOW_BUILDER_LIST_DATAFLOW_ANNOTATIONS_HIDE:
      return {
        ...state,
        dataflowAnnotations: null
      };
    case DATAFLOW_BUILDER_LIST_DATAFLOW_LAYOUT_ANNOTATIONS_SHOW:
      return {
        ...state,
        dataflowLayoutAnnotations: action.annotations
      };
    case DATAFLOW_BUILDER_LIST_DATAFLOW_LAYOUT_ANNOTATIONS_HIDE:
      return {
        ...state,
        dataflowLayoutAnnotations: null
      };
    case DATAFLOW_BUILDER_LIST_DATAFLOW_DOWNLOAD_FILTER_MODAL_SHOW:
      return {
        ...state,
        isCubeDownloadFilterModalVisible: true,
        filterTemp: state.filter,
        treeFilterTemp: (state.treeFilter || {})
      };
    case DATAFLOW_BUILDER_LIST_DATAFLOW_DOWNLOAD_FILTER_MODAL_HIDE:
      return {
        ...state,
        isCubeDownloadFilterModalVisible: false,
      };
    case DATAFLOW_BUILDER_LIST_DATAFLOW_DOWNLOAD_FILTER_MODAL_SUBMIT:
      return {
        ...state,
        isCubeDownloadFilterModalVisible: false,
        filter: state.filterMode === QUERY_FORM_FILTER_MODE_PLAIN ? action.filter : state.filter,
        filterTemp: null,
        treeFilter: state.filterMode === QUERY_FORM_FILTER_MODE_TREE ? action.filter : state.treeFilter,
        treeFilterTemp: {},
      };
    case DATAFLOW_BUILDER_LIST_DATAFLOW_DOWNLOAD_FILTER_MODAL_FILTER_RESET:
      return {
        ...state,
        filterTemp: [],
        treeFilterTemp: {},
      };
    case DATAFLOW_BUILDER_LIST_DATAFLOW_DOWNLOAD_FILTER_MODAL_FILTER_MODE_CHANGE:
      return {
        ...state,
        filterMode: action.filterMode,
        filterTemp: [],
        treeFilterTemp: {}
      };
    case DATAFLOW_BUILDER_LIST_DATAFLOW_DOWNLOAD_FILTER_MODAL_FILTER_CHANGE: {
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
    case DATAFLOW_BUILDER_LIST_DATAFLOW_DOWNLOAD_FILTER_MODAL_TREE_FILTER_CHANGE:
      return {
        ...state,
        treeFilterTemp: action.treeFilter
      };
    case DATAFLOW_BUILDER_LIST_DATAFLOW_DOWNLOAD_FILTER_MODAL_TREE_FILTER_COLUMN_MODE_CHANGE: {

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
    case DATAFLOW_BUILDER_LIST_DATAFLOW_DOWNLOAD_FILTER_MODAL_TREE_FILTER_COLUMN_VALUES_CHANGE: {

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
    case DATAFLOW_BUILDER_LIST_DATAFLOW_DOWNLOAD_FILTER_ROWS_MODAL_SHOW:
      return {
        ...state,
        isRowsModalVisible: true
      };
    case DATAFLOW_BUILDER_LIST_DATAFLOW_DOWNLOAD_FILTER_ROWS_MODAL_HIDE:
      return {
        ...state,
        filterRows: null,
        isRowsModalVisible: false
      };
    case REQUEST_START:
      switch (action.label) {
        case DATAFLOW_BUILDER_LIST_DATAFLOW_DOWNLOAD_CUBE_AND_DDBDATAFLOW_READ:
          return {
            ...state,
            cube: null
          };
        default:
          return state;
      }
    case REQUEST_ERROR:
      switch (action.label) {
        case DATAFLOW_BUILDER_LIST_DATAFLOW_MAPPING_SET_UNSET:
          if (action.error && action.error.dfNewId) {
            return {
              ...state,
              dataflowProductionModalDDBDataflowId: action.error.dfNewId
            };
          } else {
            return state;
          }
        case DATAFLOW_BUILDER_LIST_DATAFLOW_DOWNLOAD_PREVIEW_READ:
          return {
            ...state,
            dlRows: null,
            dlIsPreviewVisible: false
          };
        case DATAFLOW_BUILDER_LIST_DATAFLOW_DOWNLOAD_FILTER_ROWS_READ:
          return {
            filterRows: null,
            isRowsModalVisible: false
          };
        default:
          return state;
      }
    case REQUEST_SUCCESS:
      switch (action.label) {
        case DATAFLOW_BUILDER_LIST_DATAFLOW_DOWNLOAD_FILTER_ROWS_READ:
          return {
            ...state,
            filterRows: action.response
          };
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
            dataflowProductionModalMappingSetId: undefined,
            dataflowProductionModalTranscodingContentConstraintTriplet: null
          };
        case DATAFLOW_BUILDER_LIST_DATAFLOW_READ:
          return {
            ...state,
            dataflow: action.response
          };
        case DATAFLOW_BUILDER_LIST_DATAFLOW_PREVIEW_READ:
          return {
            ...state,
            dataflowPreview: action.response
          };
        case DATAFLOW_BUILDER_LIST_DATAFLOW_PRODUCTION_MODAL_DATAFLOW_MAPPING_SET_ID_READ:
          return {
            ...state,
            dataflowProductionModalMappingSetId: action.response
          };
        case DATAFLOW_BUILDER_LIST_DATAFLOW_DOWNLOAD: {
          return {
            ...state,
            dlDataflowId: null,
            dlDataflow: null,
            dlDataflowParams: null,
            dlDsdTriplet: null,
            dlDsdDimensions: null,
            dlDataflowTriplet: null,
            dlIsDataflowQueryVisible: false,
            dlIsPreviewVisible: null,
            cube: null,
            cubeId: null,
            filter: null,
            treeFilter: null,
            treeFilterTemp: {},
            filterMode: QUERY_FORM_FILTER_MODE_PLAIN,
            dlRows: null,
            dlCols: null,
            dlCheckedCols: null
          };
        }
        case DATAFLOW_BUILDER_LIST_DATAFLOW_DOWNLOAD_CUBE_AND_DDBDATAFLOW_READ: {
          const cube = action.response[0];
          const columns = {
            dimensions:
              cube.Dimensions
                .filter(dim => !dim.IsTimeSeriesDim)
                .map(dim => ({
                  ...dim,
                  name: dim.ColName,
                  checked: true,
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
                  checked: true,
                  disabled: false,
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
                  checked: true,
                  disabled: false,
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
                checked: true,
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
              disabled: false,
              isNumeric: true
            }))
          };
          const columnsArr = _.flatten(Object.keys(columns).map(key => columns[key]))
            .filter(col => action.response[1].DataflowColumns.includes(col.name))
            .map(col => col.name);

          return {
            ...state,
            cube: {
              ...cube,
              columns: columns
            },
            dlDataflow: action.response[1],
            dlCols: columnsArr,
            dlCheckedCols: state.dlDataflowParams.selCols ? state.dlDataflowParams.selCols : columnsArr,
            dlIsDataflowQueryVisible: true
          };
        }
        case DATAFLOW_BUILDER_LIST_DATAFLOW_DOWNLOAD_FILTER_FORM_COLUMN_VALUES_READ: {
          const columnValues = (action.columnCodelistCode ? action.response[0] : action.response)
            .map(val => val[action.columnName]);

          const codes = action.columnCodelistCode
            ? getItemSchemeFromSdmxJsonFactory(
              SDMX_JSON_CODELIST_ITEMS_KEY,
              getCurrentNodeConfig(action).annotations
            )((getSdmxStructuresFromSdmxJson(action.response[1])[0])).codes
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
            cube: cube
          };
        }
        case DATAFLOW_BUILDER_LIST_DATAFLOW_DOWNLOAD_PREVIEW_READ:
          return {
            ...state,
            dlRows: action.response,
            dlIsPreviewVisible: true
          };
        case DATAFLOW_BUILDER_LIST_DATAFLOW_DOWNLOAD_DSD_READ:
          return {
            ...state,
            dlDsdDimensions: getDsdFromSdmxJsonStructure(
              getSdmxStructuresFromSdmxJson(action.response)[0],
              getCurrentNodeConfig(action).annotations
            ).dimensions.map(({id}) => id)
          };
        case DATAFLOW_BUILDER_LIST_DATAFLOW_TRANSCODING_FROM_CC_LIST_READ:
          return {
            ...state,
            dataflowProductionModalTranscodingContentConstraints:
              action.response
                .map(art => getArtefactFromSdmxJsonStructure(art, getCurrentNodeConfig(action).annotations))
                .map(cc => ({
                  ...cc,
                  agencyID: cc.agency
                }))
          };
        case DATAFLOW_BUILDER_LIST_DATAFLOW_DOWNLOAD_FILTER_MODAL_TREE_FILTER_COLUMN_CODELIST_COUNT_READ: {

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
        case DATAFLOW_BUILDER_LIST_DATAFLOW_DOWNLOAD_FILTER_MODAL_TREE_FILTER_COLUMN_CODELIST_TREE_READ: {

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
        case DATAFLOW_BUILDER_LIST_DATAFLOW_DOWNLOAD_FILTER_MODAL_TREE_FILTER_COLUMN_FILTERED_VALUES_READ: {

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
        default:
          return state;
      }
    default:
      return state;
  }
};

export default dataflowBuilderListReducer;
