import {
  allRequest,
  getRequest,
  postRequest,
  putRequest,
  REQUEST_METHOD_GET,
  REQUEST_METHOD_POST
} from "../../../middlewares/api/actions";
import {
  getCodelistUrl,
  getCubeUrl,
  getDataflowColumnPreviewUrl,
  getDataflowPreviewUrl,
  getDcsUrl,
  getDeleteSeriesForCubeUrl,
  getPaginatedCodelistUrl,
  getSeriesForCubeUrl,
  getTableColumnPreviewUrl
} from "../../../constants/urls";
import {getFilterObjFromStr, getServerQueryObj} from "../../../utils/filter";
import {getArtefactTripletFromString} from "../../../utils/sdmxJson";

export const MANAGE_SERIES_CUBES_SHOW = 'MANAGE_SERIES_CUBES_SHOW';
export const MANAGE_SERIES_CUBES_HIDE = 'MANAGE_SERIES_CUBES_HIDE';
export const MANAGE_SERIES_CUBE_SET = 'MANAGE_SERIES_CUBE_SET';
export const MANAGE_SERIES_CUBE_UNSET = 'MANAGE_SERIES_CUBE_UNSET';
export const MANAGE_SERIES_SELECTED_SERIES_SET = 'MANAGE_SERIES_SELECTED_SERIES_SET';
export const MANAGE_SERIES_CUBES_READ = 'MANAGE_SERIES_CUBES_READ';
export const MANAGE_SERIES_CUBE_READ = 'MANAGE_SERIES_CUBE_READ';
export const MANAGE_SERIES_SERIES_READ = 'MANAGE_SERIES_SERIES_READ';
export const MANAGE_SERIES_SERIES_DELETE = 'MANAGE_SERIES_SERIES_DELETE';
export const MANAGE_SERIES_FILTER_MODAL_SHOW = 'MANAGE_SERIES_FILTER_MODAL_SHOW';
export const MANAGE_SERIES_FILTER_MODAL_SUBMIT = 'MANAGE_SERIES_FILTER_MODAL_SUBMIT';
export const MANAGE_SERIES_FILTER_MODAL_FILTER_RESET = 'MANAGE_SERIES_FILTER_MODAL_FILTER_RESET';
export const MANAGE_SERIES_FILTER_MODAL_FILTER_MODE_CHANGE = 'MANAGE_SERIES_FILTER_MODAL_FILTER_MODE_CHANGE';
export const MANAGE_SERIES_FILTER_MODAL_TREE_FILTER_CHANGE = 'MANAGE_SERIES_FILTER_MODAL_TREE_FILTER_CHANGE';
export const MANAGE_SERIES_FILTER_MODAL_TREE_FILTER_COLUMN_MODE_CHANGE = 'MANAGE_SERIES_FILTER_MODAL_TREE_FILTER_COLUMN_MODE_CHANGE';
export const MANAGE_SERIES_FILTER_MODAL_TREE_FILTER_COLUMN_VALUES_CHANGE = 'MANAGE_SERIES_FILTER_MODAL_TREE_FILTER_COLUMN_VALUES_CHANGE';
export const MANAGE_SERIES_FILTER_MODAL_HIDE = 'MANAGE_SERIES_FILTER_MODAL_HIDE';
export const MANAGE_SERIES_FILTER_MODAL_FILTER_CHANGE = 'MANAGE_SERIES_FILTER_MODAL_FILTER_CHANGE';
export const MANAGE_SERIES_FILTER_MODAL_TREE_FILTER_COLUMN_CODELIST_COUNT_READ = 'MANAGE_SERIES_FILTER_MODAL_TREE_FILTER_COLUMN_CODELIST_COUNT_READ';
export const MANAGE_SERIES_FILTER_MODAL_TREE_FILTER_COLUMN_CODELIST_TREE_READ = 'MANAGE_SERIES_FILTER_MODAL_TREE_FILTER_COLUMN_CODELIST_TREE_READ';
export const MANAGE_SERIES_FILTER_MODAL_TREE_FILTER_COLUMN_FILTERED_VALUES_READ = 'MANAGE_SERIES_FILTER_MODAL_TREE_FILTER_COLUMN_FILTERED_VALUES_READ';
export const MANAGE_SERIES_FILTER_ROWS_MODAL_SHOW = 'MANAGE_SERIES_FILTER_ROWS_MODAL_SHOW';
export const MANAGE_SERIES_FILTER_ROWS_MODAL_HIDE = 'MANAGE_SERIES_FILTER_ROWS_MODAL_HIDE';
export const MANAGE_SERIES_FILTER_ROWS_READ = 'MANAGE_SERIES_FILTER_ROWS_READ';
export const MANAGE_SERIES_FILTER_FORM_BLOCK_ADD = 'MANAGE_SERIES_FILTER_FORM_BLOCK_ADD';
export const MANAGE_SERIES_FILTER_FORM_BLOCK_DELETE = 'MANAGE_SERIES_FILTER_FORM_BLOCK_DELETE';
export const MANAGE_SERIES_FILTER_FORM_CONDITION_ADD = 'MANAGE_SERIES_FILTER_FORM_CONDITION_ADD';
export const MANAGE_SERIES_FILTER_FORM_CONDITION_DELETE = 'MANAGE_SERIES_FILTER_FORM_CONDITION_DELETE';
export const MANAGE_SERIES_FILTER_FORM_COLUMN_VALUES_READ = 'MANAGE_SERIES_FILTER_FORM_COLUMN_VALUES_READ';
export const MANAGE_SERIES_SERIES_SHOW = 'MANAGE_SERIES_SERIES_SHOW';

export const showManageSeriesCubes = () => ({
  type: MANAGE_SERIES_CUBES_SHOW
});

export const setManageSeriesCube = cubeId => ({
  type: MANAGE_SERIES_CUBE_SET,
  cubeId
});

export const hideManageSeriesCubes = () => ({
  type: MANAGE_SERIES_CUBES_HIDE
});

export const unsetManageSeriesCube = () => ({
  type: MANAGE_SERIES_CUBE_UNSET
});

export const setSelectedSeries = selectedSeries => ({
  type: MANAGE_SERIES_SELECTED_SERIES_SET,
  selectedSeries
});

export const readManageSeriesCubes = () => allRequest(
  MANAGE_SERIES_CUBES_READ,
  [REQUEST_METHOD_GET, REQUEST_METHOD_GET],
  [getCubeUrl(), getDcsUrl()]
);

export const readManageSeriesCube = cubeId => getRequest(
  MANAGE_SERIES_CUBE_READ,
  getCubeUrl(cubeId)
);

export const readManageSeriesSeries = (idCube, filterStr, cols, sortCols, sortByDesc, pageNum, pageSize) => postRequest(
  MANAGE_SERIES_SERIES_READ,
  getSeriesForCubeUrl(idCube),
  getServerQueryObj(cols, getFilterObjFromStr(filterStr), pageNum, pageSize, sortCols, sortByDesc, idCube)
);

export const deleteManageSeriesSeries = (idCube, seriesIds) => putRequest(
  MANAGE_SERIES_SERIES_DELETE,
  getDeleteSeriesForCubeUrl(idCube),
  seriesIds,
  t => ({
    success: t('scenes.dataManager.manageSeries.messages.delete.success')
  })
);

export const showManageSeriesFilterModal = () => ({
  type: MANAGE_SERIES_FILTER_MODAL_SHOW
});

export const hideManageSeriesFilterModal = () => ({
  type: MANAGE_SERIES_FILTER_MODAL_HIDE
});

export const submitManageSeriesFilterModal = filter => ({
  type: MANAGE_SERIES_FILTER_MODAL_SUBMIT,
  filter
});

export const changeManageSeriesFilterModalTreeFilterColumnMode = (colName, mode) => ({
  type: MANAGE_SERIES_FILTER_MODAL_TREE_FILTER_COLUMN_MODE_CHANGE,
  colName,
  mode
});

export const changeManageSeriesFilterModalFilterMode = filterMode => ({
  type: MANAGE_SERIES_FILTER_MODAL_FILTER_MODE_CHANGE,
  filterMode
});

export const resetManageSeriesFilterModalFilter = () => ({
  type: MANAGE_SERIES_FILTER_MODAL_FILTER_RESET
});

export const changeManageSeriesFilter = fields => ({
  type: MANAGE_SERIES_FILTER_MODAL_FILTER_CHANGE,
  fields
});

export const changeManageSeriesFilterModalTreeFilter = treeFilter => ({
  type: MANAGE_SERIES_FILTER_MODAL_TREE_FILTER_CHANGE,
  treeFilter
});

export const showManageSeriesSeries = () => ({
  type: MANAGE_SERIES_SERIES_SHOW
});

export const readManageSeriesFilterModalTreeFilterColumnCodelistCount = (codelistTriplet, language) => ({
  ...postRequest(
    MANAGE_SERIES_FILTER_MODAL_TREE_FILTER_COLUMN_CODELIST_COUNT_READ,
    getPaginatedCodelistUrl(),
    {
      id: codelistTriplet.id,
      agencyId: codelistTriplet.agencyID,
      version: codelistTriplet.version,
      pageNum: 1,
      pageSize: 1,
      lang: language,
      rebuildDb: false
    }
  ),
  codelistTriplet
});

export const readManageSeriesFilterModalTreeFilterColumnCodelistTree = (codelistTriplet, language) => ({
  ...postRequest(
    MANAGE_SERIES_FILTER_MODAL_TREE_FILTER_COLUMN_CODELIST_TREE_READ,
    getPaginatedCodelistUrl(),
    {
      id: codelistTriplet.id,
      agencyId: codelistTriplet.agencyID,
      version: codelistTriplet.version,
      pageNum: 1,
      pageSize: -1,
      lang: language,
      rebuildDb: false
    }
  ),
  codelistTriplet
});

export const readManageSeriesFilterModalTreeFilterColumnFilteredValues = (cubeId, colNames, filter) => ({
  ...postRequest(
    MANAGE_SERIES_FILTER_MODAL_TREE_FILTER_COLUMN_FILTERED_VALUES_READ,
    getDataflowColumnPreviewUrl(
      colNames[colNames.length - 1],
      1,
      -1
    ),
    {
      idCube: cubeId,
      dataflowColumns: colNames,
      filter: getServerQueryObj(undefined, getFilterObjFromStr(filter)).Filter
    }
  ),
  colName: colNames[colNames.length - 1]
});

export const changeManageSeriesFilterModalTreeFilterColumnValues = (colName, values) => ({
  type: MANAGE_SERIES_FILTER_MODAL_TREE_FILTER_COLUMN_VALUES_CHANGE,
  colName,
  values
});

export const showManageSeriesFilterRowsModal = () => ({
  type: MANAGE_SERIES_FILTER_ROWS_MODAL_SHOW
});

export const hideManageSeriesFilterRowsModal = () => ({
  type: MANAGE_SERIES_FILTER_ROWS_MODAL_HIDE
});

export const readManageSeriesFilterRows = (cubeId, cubeColumns, filter, pageNum, pageSize, sortCols, sortByDesc) => postRequest(
  MANAGE_SERIES_FILTER_ROWS_READ,
  getDataflowPreviewUrl(true),
  getServerQueryObj(cubeColumns, getFilterObjFromStr(filter), pageNum, pageSize, sortCols, sortByDesc, cubeId)
);

export const addManageSeriesFilterFormBlock = () => ({
  type: MANAGE_SERIES_FILTER_FORM_BLOCK_ADD
});

export const deleteManageSeriesFilterFormBlock = blockIndex => ({
  type: MANAGE_SERIES_FILTER_FORM_BLOCK_DELETE,
  blockIndex
});

export const addManageSeriesFilterFormCondition = blockIndex => ({
  type: MANAGE_SERIES_FILTER_FORM_CONDITION_ADD,
  blockIndex
});

export const deleteManageSeriesFilterFormCondition = (blockIndex, conditionIndex) => ({
  type: MANAGE_SERIES_FILTER_FORM_CONDITION_DELETE,
  blockIndex,
  conditionIndex
});

export const readManageSeriesFilterFormColumnValues =
  (tableName, columnName, columnCodelistCode) => ({
    ...(
      columnCodelistCode
        ? allRequest(
        MANAGE_SERIES_FILTER_FORM_COLUMN_VALUES_READ,
        [REQUEST_METHOD_POST, REQUEST_METHOD_GET],
        [getTableColumnPreviewUrl(tableName), getCodelistUrl(getArtefactTripletFromString(columnCodelistCode))],
        [{
          SelCols: [columnName],
          PageSize: 1000,
          PageNum: 1
        }])
        : postRequest(
        MANAGE_SERIES_FILTER_FORM_COLUMN_VALUES_READ,
        getTableColumnPreviewUrl(tableName), {
          SelCols: [columnName],
          PageSize: 1000,
          PageNum: 1
        })
    ),
    columnName,
    columnCodelistCode
  });