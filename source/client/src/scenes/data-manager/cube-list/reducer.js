import {REQUEST_ERROR, REQUEST_START, REQUEST_SUCCESS} from '../../../middlewares/api/actions';
import {
  CUBE_LIST_CUBE_DELETE_SUBMIT,
  CUBE_LIST_CUBE_DOWNLOAD_CSV_READ,
  CUBE_LIST_CUBE_DOWNLOAD_CUBE_COLUMNS_CHANGE,
  CUBE_LIST_CUBE_DOWNLOAD_CUBE_COLUMNS_CHECK,
  CUBE_LIST_CUBE_DOWNLOAD_CUBE_READ,
  CUBE_LIST_CUBE_DOWNLOAD_FILTER_MODAL_FILTER_CHANGE,
  CUBE_LIST_CUBE_DOWNLOAD_FILTER_MODAL_FILTER_MODE_CHANGE,
  CUBE_LIST_CUBE_DOWNLOAD_FILTER_MODAL_FILTER_RESET,
  CUBE_LIST_CUBE_DOWNLOAD_FILTER_MODAL_HIDE,
  CUBE_LIST_CUBE_DOWNLOAD_FILTER_MODAL_SHOW,
  CUBE_LIST_CUBE_DOWNLOAD_FILTER_MODAL_SUBMIT,
  CUBE_LIST_CUBE_DOWNLOAD_FILTER_MODAL_TREE_FILTER_CHANGE,
  CUBE_LIST_CUBE_DOWNLOAD_FILTER_MODAL_TREE_FILTER_COLUMN_CODELIST_COUNT_READ,
  CUBE_LIST_CUBE_DOWNLOAD_FILTER_MODAL_TREE_FILTER_COLUMN_CODELIST_TREE_READ,
  CUBE_LIST_CUBE_DOWNLOAD_FILTER_MODAL_TREE_FILTER_COLUMN_FILTERED_VALUES_READ,
  CUBE_LIST_CUBE_DOWNLOAD_FILTER_MODAL_TREE_FILTER_COLUMN_MODE_CHANGE,
  CUBE_LIST_CUBE_DOWNLOAD_FILTER_MODAL_TREE_FILTER_COLUMN_VALUES_CHANGE,
  CUBE_LIST_CUBE_DOWNLOAD_HIDE,
  CUBE_LIST_CUBE_DOWNLOAD_PREVIEW_ROWS_MODAL_HIDE,
  CUBE_LIST_CUBE_DOWNLOAD_PREVIEW_ROWS_MODAL_SHOW,
  CUBE_LIST_CUBE_DOWNLOAD_PREVIEW_ROWS_READ,
  CUBE_LIST_CUBE_DOWNLOAD_SHOW,
  CUBE_LIST_CUBE_DOWNLOAD_WHERE_CONDITIONS_FORM_BLOCK_ADD,
  CUBE_LIST_CUBE_DOWNLOAD_WHERE_CONDITIONS_FORM_BLOCK_DELETE,
  CUBE_LIST_CUBE_DOWNLOAD_WHERE_CONDITIONS_FORM_CHANGE,
  CUBE_LIST_CUBE_DOWNLOAD_WHERE_CONDITIONS_FORM_COLUMN_VALUES_READ,
  CUBE_LIST_CUBE_DOWNLOAD_WHERE_CONDITIONS_FORM_CONDITION_ADD,
  CUBE_LIST_CUBE_DOWNLOAD_WHERE_CONDITIONS_FORM_CONDITION_DELETE,
  CUBE_LIST_CUBE_EMBARGO_REMOVE,
  CUBE_LIST_CUBE_EMPTY_CUBE_SUBMIT,
  CUBE_LIST_CUBE_OWNERSHIP_HIDE,
  CUBE_LIST_CUBE_OWNERSHIP_OWNERS_CHANGE,
  CUBE_LIST_CUBE_OWNERSHIP_OWNERS_READ,
  CUBE_LIST_CUBE_OWNERSHIP_OWNERS_SUBMIT,
  CUBE_LIST_CUBE_OWNERSHIP_SHOW,
  CUBE_LIST_CUBE_OWNERSHIP_USERS_READ,
  CUBE_LIST_CUBES_READ,
  CUBE_LIST_CURRENT_DATA_VIEW_HIDE,
  CUBE_LIST_CURRENT_DATA_VIEW_READ,
  CUBE_LIST_CURRENT_DATA_VIEW_SHOW
} from './actions';
import _ from "lodash";
import {
  CODELIST_ORDER_ANNOTATION_KEY,
  FILTER_MODE_IN,
  getItemSchemeFromSdmxJsonFactory,
  getSdmxStructuresFromSdmxJson,
  getStringFromArtefactTriplet,
  SDMX_JSON_CODELIST_ITEMS_KEY
} from "../../../utils/sdmxJson";
import {getCurrentNodeConfig} from "../../../middlewares/current-node-config/middleware";
import {QUERY_FORM_FILTER_MODE_PLAIN, QUERY_FORM_FILTER_MODE_TREE} from "../../../components/query-form";
import {getFilteredTreeWithPaths, getMaxTreeDepth, getTreeFromArray} from "../../../utils/tree";

const cubeListReducer = (
  state = {
    cubes: null,
    cube: null,
    cubeId: null,
    cubeDownloadId: null,
    currentDataView: null,
    isCubeDetailVisible: false,
    isCubeDownloadVisible: false,
    filter: null,
    filterTemp: null,
    treeFilter: {},
    treeFilterTemp: {},
    filterMode: QUERY_FORM_FILTER_MODE_PLAIN,
    isRowsModalVisible: null,
    rows: null,
    cols: null,
    checkedCols: null,
    cubeOwnershipCubeId: null,
    cubeOwnershipOwners: null,
    cubeOwnershipUsers: null,
    isCubeDownloadFilterModalVisible: false,
  },
  action
) => {
  switch (action.type) {
    case CUBE_LIST_CURRENT_DATA_VIEW_SHOW:
      return {
        ...state,
        cubeId: action.cubeId,
        isCubeDetailVisible: true
      };
    case CUBE_LIST_CURRENT_DATA_VIEW_HIDE:
      return {
        ...state,
        cubeId: null,
        cube: null,
        currentDataView: null,
        isCubeDetailVisible: false
      };
    case CUBE_LIST_CUBE_OWNERSHIP_SHOW:
      return {
        ...state,
        cubeOwnershipCubeId: action.cubeId
      };
    case CUBE_LIST_CUBE_OWNERSHIP_HIDE:
      return {
        ...state,
        cubeOwnershipCubeId: null,
        cubeOwnershipOwners: null,
        cubeOwnershipUsers: null
      };
    case CUBE_LIST_CUBE_DOWNLOAD_SHOW:
      return {
        ...state,
        cubeDownloadId: action.cubeId,
        isCubeDownloadVisible: true,
        filter: null,
        filterTemp: null,
        treeFilter: {},
        treeFilterTemp: {},
        filterMode: QUERY_FORM_FILTER_MODE_PLAIN,
      };
    case CUBE_LIST_CUBE_DOWNLOAD_HIDE:
      return {
        ...state,
        cube: null,
        cubeId: null,
        cubeDownloadId: null,
        currentDataView: null,
        isCubeDetailVisible: false,
        isCubeDownloadVisible: false,
        filter: null,
        filterTemp: null,
        treeFilter: {},
        treeFilterTemp: {},
        filterMode: QUERY_FORM_FILTER_MODE_PLAIN,
        isRowsModalVisible: null,
        rows: null,
        cols: null,
        checkedCols: null
      };
    case CUBE_LIST_CUBE_DOWNLOAD_WHERE_CONDITIONS_FORM_CHANGE: {
      if (action.fields.cubeColumns !== undefined) {
        const columns = _.cloneDeep(state.cube.columns);
        return {
          ...state,
          cube: {
            ...state.cube,
            columns: _.merge(columns, action.fields.cubeColumns.value)
          }
        };
      } else if (action.fields.filter !== undefined) {
        const filter = _.cloneDeep(state.filter);
        if (action.fields.filter.filter(block => block.column !== undefined).length > 0) {
          action.fields.filter = action.fields.filter.map(block => ({
            ...block,
            conditions: null
          }));
        }
        return {
          ...state,
          filter: _.merge(filter, action.fields.filter)
        };
      } else {
        return state
      }
    }
    case CUBE_LIST_CUBE_DOWNLOAD_WHERE_CONDITIONS_FORM_BLOCK_ADD: {
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
    case CUBE_LIST_CUBE_DOWNLOAD_WHERE_CONDITIONS_FORM_BLOCK_DELETE: {
      const filterTemp = _.cloneDeep(state.filterTemp);
      filterTemp.splice(action.blockIndex, 1);
      return {
        ...state,
        filterTemp
      };
    }
    case CUBE_LIST_CUBE_DOWNLOAD_WHERE_CONDITIONS_FORM_CONDITION_ADD: {
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
    case CUBE_LIST_CUBE_DOWNLOAD_WHERE_CONDITIONS_FORM_CONDITION_DELETE: {
      const filterTemp = _.cloneDeep(state.filterTemp);
      filterTemp[action.blockIndex].conditions.splice(action.conditionIndex, 1);
      return {
        ...state,
        filterTemp
      };
    }
    case CUBE_LIST_CUBE_DOWNLOAD_PREVIEW_ROWS_MODAL_SHOW:
      return {
        ...state,
        isRowsModalVisible: true
      };
    case CUBE_LIST_CUBE_DOWNLOAD_PREVIEW_ROWS_MODAL_HIDE:
      return {
        ...state,
        rows: null,
        isRowsModalVisible: false
      };
    case CUBE_LIST_CUBE_DOWNLOAD_CUBE_COLUMNS_CHECK:
      return {
        ...state,
        checkedCols: action.cols
      };
    case CUBE_LIST_CUBE_DOWNLOAD_CUBE_COLUMNS_CHANGE:
      return {
        ...state,
        cols: action.cols
      };
    case CUBE_LIST_CUBE_OWNERSHIP_OWNERS_CHANGE:
      return {
        ...state,
        cubeOwnershipOwners: action.owners
      };
    case CUBE_LIST_CUBE_DOWNLOAD_FILTER_MODAL_SHOW:
      return {
        ...state,
        isCubeDownloadFilterModalVisible: true,
        filterTemp: state.filter,
        treeFilterTemp: (state.treeFilter || {})
      };
    case CUBE_LIST_CUBE_DOWNLOAD_FILTER_MODAL_HIDE:
      return {
        ...state,
        isCubeDownloadFilterModalVisible: false,
      };
    case CUBE_LIST_CUBE_DOWNLOAD_FILTER_MODAL_SUBMIT:
      return {
        ...state,
        isCubeDownloadFilterModalVisible: false,
        filter: state.filterMode === QUERY_FORM_FILTER_MODE_PLAIN ? action.filter : state.filter,
        filterTemp: null,
        treeFilter: state.filterMode === QUERY_FORM_FILTER_MODE_TREE ? action.filter : state.treeFilter,
        treeFilterTemp: {},
      };
    case CUBE_LIST_CUBE_DOWNLOAD_FILTER_MODAL_FILTER_RESET:
      return {
        ...state,
        filterTemp: [],
        treeFilterTemp: {},
      };
    case CUBE_LIST_CUBE_DOWNLOAD_FILTER_MODAL_FILTER_MODE_CHANGE:
      return {
        ...state,
        filterMode: action.filterMode,
        filterTemp: [],
        treeFilterTemp: {}
      };
    case CUBE_LIST_CUBE_DOWNLOAD_FILTER_MODAL_FILTER_CHANGE: {
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
    case CUBE_LIST_CUBE_DOWNLOAD_FILTER_MODAL_TREE_FILTER_CHANGE:
      return {
        ...state,
        treeFilterTemp: action.treeFilter
      };
    case CUBE_LIST_CUBE_DOWNLOAD_FILTER_MODAL_TREE_FILTER_COLUMN_MODE_CHANGE: {

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
    case CUBE_LIST_CUBE_DOWNLOAD_FILTER_MODAL_TREE_FILTER_COLUMN_VALUES_CHANGE: {

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
    case REQUEST_START:
      switch (action.label) {
        case CUBE_LIST_CUBES_READ:
          return {
            ...state,
            cubes: null
          };
        case CUBE_LIST_CUBE_DOWNLOAD_CUBE_READ:
          return {
            ...state,
            cube: null
          };
        default:
          return state;
      }
    case REQUEST_ERROR:
      switch (action.label) {
        case CUBE_LIST_CUBE_DOWNLOAD_PREVIEW_ROWS_READ:
          return {
            ...state,
            rows: null,
            isRowsModalVisible: false
          };
        case CUBE_LIST_CURRENT_DATA_VIEW_READ:
          return {
            ...state,
            cubeId: null,
            cube: null,
            currentDataView: null,
            isCubeDetailVisible: false
          };
        default:
          return state;
      }
    case REQUEST_SUCCESS:
      switch (action.label) {
        case CUBE_LIST_CUBES_READ:
          return {
            ...state,
            cubes: action.response
          };
        case CUBE_LIST_CUBE_OWNERSHIP_OWNERS_READ:
          return {
            ...state,
            cubeOwnershipOwners: action.response.owners.map(({username}) => username)
          };
        case CUBE_LIST_CUBE_OWNERSHIP_USERS_READ:
          return {
            ...state,
            cubeOwnershipUsers: action.response
          };
        case CUBE_LIST_CUBE_OWNERSHIP_OWNERS_SUBMIT:
          return {
            ...state,
            cubeOwnershipCubeId: null,
            cubeOwnershipOwners: null,
            cubeOwnershipUsers: null
          };
        case CUBE_LIST_CUBE_EMBARGO_REMOVE:
          return {
            ...state,
            cubes: null
          };
        case CUBE_LIST_CURRENT_DATA_VIEW_READ:
          return {
            ...state,
            currentDataView: action.response
          };
        case CUBE_LIST_CUBE_DOWNLOAD_CUBE_READ:
          const cube = action.response;
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
          const columnsStr = _.flatten(Object.keys(columns).map(key => columns[key]))
            .filter(col => col.checked)
            .map(col => col.name);

          return {
            ...state,
            cube: {
              ...cube,
              columns: columns
            },
            cols: columnsStr,
            checkedCols: columnsStr
          };
        case CUBE_LIST_CUBE_DOWNLOAD_WHERE_CONDITIONS_FORM_COLUMN_VALUES_READ: {
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
            cube
          };
        }
        case CUBE_LIST_CUBE_DOWNLOAD_PREVIEW_ROWS_READ:
          return {
            ...state,
            rows: action.response
          };
        case CUBE_LIST_CUBE_DOWNLOAD_CSV_READ:
          return {
            ...state,
            cube: null,
            cubeId: null,
            cubeDownloadId: null,
            currentDataView: null,
            isCubeDetailVisible: false,
            isCubeDownloadVisible: false,
            filter: null,
            treeFilter: {},
            treeFilterTemp: {},
            isRowsModalVisible: null,
            rows: null,
            cols: null,
            checkedCols: null,
            filterMode: QUERY_FORM_FILTER_MODE_PLAIN
          };
        case CUBE_LIST_CUBE_EMPTY_CUBE_SUBMIT:
          return {
            ...state,
            cubes: null
          };
        case CUBE_LIST_CUBE_DELETE_SUBMIT:
          return {
            ...state,
            cubes: null
          };
        case CUBE_LIST_CUBE_DOWNLOAD_FILTER_MODAL_TREE_FILTER_COLUMN_CODELIST_COUNT_READ: {

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
        case CUBE_LIST_CUBE_DOWNLOAD_FILTER_MODAL_TREE_FILTER_COLUMN_CODELIST_TREE_READ: {

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
        case CUBE_LIST_CUBE_DOWNLOAD_FILTER_MODAL_TREE_FILTER_COLUMN_FILTERED_VALUES_READ: {

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
export default cubeListReducer;
