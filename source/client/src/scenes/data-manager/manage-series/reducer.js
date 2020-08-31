import {REQUEST_ERROR, REQUEST_START, REQUEST_SUCCESS} from "../../../middlewares/api/actions";
import {
  MANAGE_SERIES_CUBE_READ,
  MANAGE_SERIES_CUBE_SET,
  MANAGE_SERIES_CUBE_UNSET,
  MANAGE_SERIES_CUBES_HIDE,
  MANAGE_SERIES_CUBES_READ,
  MANAGE_SERIES_CUBES_SHOW,
  MANAGE_SERIES_FILTER_FORM_BLOCK_ADD,
  MANAGE_SERIES_FILTER_FORM_BLOCK_DELETE,
  MANAGE_SERIES_FILTER_FORM_COLUMN_VALUES_READ,
  MANAGE_SERIES_FILTER_FORM_CONDITION_ADD,
  MANAGE_SERIES_FILTER_FORM_CONDITION_DELETE,
  MANAGE_SERIES_FILTER_MODAL_FILTER_CHANGE,
  MANAGE_SERIES_FILTER_MODAL_FILTER_MODE_CHANGE,
  MANAGE_SERIES_FILTER_MODAL_FILTER_RESET,
  MANAGE_SERIES_FILTER_MODAL_HIDE,
  MANAGE_SERIES_FILTER_MODAL_SHOW,
  MANAGE_SERIES_FILTER_MODAL_SUBMIT,
  MANAGE_SERIES_FILTER_MODAL_TREE_FILTER_CHANGE,
  MANAGE_SERIES_FILTER_MODAL_TREE_FILTER_COLUMN_CODELIST_COUNT_READ,
  MANAGE_SERIES_FILTER_MODAL_TREE_FILTER_COLUMN_CODELIST_TREE_READ,
  MANAGE_SERIES_FILTER_MODAL_TREE_FILTER_COLUMN_FILTERED_VALUES_READ,
  MANAGE_SERIES_FILTER_MODAL_TREE_FILTER_COLUMN_MODE_CHANGE,
  MANAGE_SERIES_FILTER_MODAL_TREE_FILTER_COLUMN_VALUES_CHANGE,
  MANAGE_SERIES_FILTER_ROWS_MODAL_HIDE,
  MANAGE_SERIES_FILTER_ROWS_MODAL_SHOW,
  MANAGE_SERIES_FILTER_ROWS_READ,
  MANAGE_SERIES_SELECTED_SERIES_SET,
  MANAGE_SERIES_SERIES_DELETE,
  MANAGE_SERIES_SERIES_READ, MANAGE_SERIES_SERIES_SHOW
} from "./actions";
import {getCubesTree} from "../../../utils/treeBuilders";
import _ from "lodash";
import {
  QUERY_FORM_FILTER_MODE_PLAIN,
  QUERY_FORM_FILTER_MODE_TREE
} from "../../../components/query-form";
import {
  CODELIST_ORDER_ANNOTATION_KEY,
  FILTER_MODE_IN,
  getItemSchemeFromSdmxJsonFactory,
  getSdmxStructuresFromSdmxJson,
  getStringFromArtefactTriplet,
  SDMX_JSON_CODELIST_ITEMS_KEY
} from "../../../utils/sdmxJson";
import {getCurrentNodeConfig} from "../../../middlewares/current-node-config/middleware";
import {getFilteredTreeWithPaths, getMaxTreeDepth, getTreeFromArray} from "../../../utils/tree";

const manageSeriesReducer = (
  state = {
    isCubesVisible: null,
    cubes: null,
    cubeId: null,
    cube: null,
    series: null,
    selectedSeries: [],
    isFilterModalVisible: false,
    filter: null,
    treeFilter: null,
    filterTemp: null,
    treeFilterTemp: null,
    filterMode: QUERY_FORM_FILTER_MODE_PLAIN,
    filterRows: null,
    isFilterRowsModalVisible: false,
    isSeriesVisible: false
  },
  action
) => {
  switch (action.type) {
    case MANAGE_SERIES_CUBES_SHOW:
      return {
        ...state,
        isCubesVisible: true
      };
    case MANAGE_SERIES_CUBES_HIDE:
      return {
        ...state,
        isCubesVisible: false,
        cubes: null
      }
    case MANAGE_SERIES_CUBE_SET:
      return {
        ...state,
        isCubesVisible: false,
        cubeId: action.cubeId,
        isSeriesVisible: false
      }
    case MANAGE_SERIES_CUBE_UNSET:
      return {
        ...state,
        cubeId: null,
        cube: null,
        series: null,
        selectedSeries: [],
        isSeriesVisible: false
      };
    case MANAGE_SERIES_SERIES_SHOW:
      return {
        ...state,
        series: null,
        isSeriesVisible: true
      };
    case MANAGE_SERIES_SELECTED_SERIES_SET:
      return {
        ...state,
        selectedSeries: action.selectedSeries
      };
    case MANAGE_SERIES_FILTER_FORM_BLOCK_ADD: {
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
    case MANAGE_SERIES_FILTER_FORM_BLOCK_DELETE: {
      const filterTemp = _.cloneDeep(state.filterTemp);
      filterTemp.splice(action.blockIndex, 1);
      return {
        ...state,
        filterTemp
      };
    }
    case MANAGE_SERIES_FILTER_FORM_CONDITION_ADD: {
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
    case MANAGE_SERIES_FILTER_FORM_CONDITION_DELETE: {
      const filterTemp = _.cloneDeep(state.filterTemp);
      filterTemp[action.blockIndex].conditions.splice(action.conditionIndex, 1);
      return {
        ...state,
        filterTemp
      };
    }
    case MANAGE_SERIES_FILTER_MODAL_SHOW:
      return {
        ...state,
        isFilterModalVisible: true,
        filterTemp: state.filter,
        treeFilterTemp: (state.treeFilter || {})
      };
    case MANAGE_SERIES_FILTER_MODAL_HIDE:
      return {
        ...state,
        isFilterModalVisible: false,
      };
    case MANAGE_SERIES_FILTER_MODAL_SUBMIT:
      return {
        ...state,
        isFilterModalVisible: false,
        filter: state.filterMode === QUERY_FORM_FILTER_MODE_PLAIN ? action.filter : state.filter,
        filterTemp: null,
        treeFilter: state.filterMode === QUERY_FORM_FILTER_MODE_TREE ? action.filter : state.treeFilter,
        treeFilterTemp: {},
        series: null,
        selectedSeries: [],
        isSeriesVisible: false
      };
    case MANAGE_SERIES_FILTER_MODAL_FILTER_RESET:
      return {
        ...state,
        filterTemp: [],
        treeFilterTemp: {},
      };
    case MANAGE_SERIES_FILTER_MODAL_FILTER_MODE_CHANGE:
      return {
        ...state,
        filterMode: action.filterMode,
        filterTemp: [],
        treeFilterTemp: {}
      };
    case MANAGE_SERIES_FILTER_MODAL_FILTER_CHANGE: {
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
    case MANAGE_SERIES_FILTER_MODAL_TREE_FILTER_CHANGE:
      return {
        ...state,
        treeFilterTemp: action.treeFilter
      };
    case MANAGE_SERIES_FILTER_MODAL_TREE_FILTER_COLUMN_MODE_CHANGE: {

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
    case MANAGE_SERIES_FILTER_MODAL_TREE_FILTER_COLUMN_VALUES_CHANGE: {

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
    case MANAGE_SERIES_FILTER_ROWS_MODAL_SHOW:
      return {
        ...state,
        isFilterRowsModalVisible: true
      };
    case MANAGE_SERIES_FILTER_ROWS_MODAL_HIDE:
      return {
        ...state,
        filterRows: null,
        isFilterRowsModalVisible: false
      };
    case REQUEST_START:
      switch (action.label) {
        case MANAGE_SERIES_CUBES_READ:
          return {
            ...state,
            cubes: null
          };
        case MANAGE_SERIES_CUBE_READ:
          return {
            ...state,
            cube: null
          };
        case MANAGE_SERIES_SERIES_READ:
          return {
            ...state,
            series: null
          };
        default:
          return state;
      }
    case REQUEST_ERROR:
      switch (action.label) {
        case MANAGE_SERIES_FILTER_ROWS_READ:
          return {
            ...state,
            filterRows: null,
            isFilterRowsModalVisible: false
          };
        default:
          return state;
      }
    case REQUEST_SUCCESS:
      switch (action.label) {
        case MANAGE_SERIES_CUBES_READ:
          return {
            ...state,
            cubes: getCubesTree(action.response[0], action.response[1])
          }
        case MANAGE_SERIES_CUBE_READ:
          const cube = action.response;
          return {
            ...state,
            cube: {
              ...cube,
              columns: {
                dimensions:
                  cube.Dimensions
                    .filter(dim => !dim.IsTimeSeriesDim)
                    .map(dim => ({
                      ...dim,
                      name: dim.ColName,
                      disabled: false,
                      isNumeric: false,
                      values: null,
                      codelistCount: null,
                      codelistTree: null,
                      filteredCodelistTree: null,
                      checked: true
                    }))
              }
            }
          };
        case MANAGE_SERIES_SERIES_READ:
          return {
            ...state,
            series: action.response
          };
        case MANAGE_SERIES_SERIES_DELETE:
          return {
            ...state,
            series: null,
            selectedSeries: [],
            isSeriesVisible: false
          }
        case MANAGE_SERIES_FILTER_ROWS_READ:
          return {
            ...state,
            filterRows: action.response
          };
        case MANAGE_SERIES_FILTER_FORM_COLUMN_VALUES_READ: {

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
        case MANAGE_SERIES_FILTER_MODAL_TREE_FILTER_COLUMN_CODELIST_COUNT_READ: {

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
        case MANAGE_SERIES_FILTER_MODAL_TREE_FILTER_COLUMN_CODELIST_TREE_READ: {

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
        case MANAGE_SERIES_FILTER_MODAL_TREE_FILTER_COLUMN_FILTERED_VALUES_READ: {

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

export default manageSeriesReducer;
