import {
  allRequest,
  deleteRequest,
  getRequest,
  postRequest,
  REQUEST_METHOD_GET,
  REQUEST_METHOD_POST,
} from '../../../middlewares/api/actions';
import {
  getCodelistUrl,
  getCubeOwnersUrl,
  getCubeUrl,
  getDataflowColumnPreviewUrl,
  getDataflowCsvUrl,
  getDataflowPreviewUrl,
  getDisembargoCubeUrl,
  getEmptyCubeUrl,
  getPaginatedCodelistUrl,
  getSetOwnersUrl,
  getTableColumnPreviewUrl,
  getTablePreviewUrl,
  getUsers
} from '../../../constants/urls';
import {getArtefactTripletFromString} from "../../../utils/sdmxJson";
import moment from 'moment';
import {getFilterObjFromStr, getServerQueryObj} from "../../../utils/filter";

export const CUBE_LIST_CUBES_READ = 'CUBE_LIST_CUBES_READ';
export const CUBE_LIST_CURRENT_DATA_VIEW_READ = 'CUBE_LIST_CURRENT_DATA_VIEW_READ';
export const CUBE_LIST_CURRENT_DATA_VIEW_SHOW = 'CUBE_LIST_CURRENT_DATA_VIEW_SHOW';
export const CUBE_LIST_CURRENT_DATA_VIEW_HIDE = 'CUBE_LIST_CURRENT_DATA_VIEW_HIDE';
export const CUBE_LIST_CUBE_DOWNLOAD_SHOW = 'CUBE_LIST_CUBE_DOWNLOAD_SHOW';
export const CUBE_LIST_CUBE_DOWNLOAD_HIDE = 'CUBE_LIST_CUBE_DOWNLOAD_HIDE';
export const CUBE_LIST_CUBE_DOWNLOAD_CUBE_READ = 'CUBE_LIST_CUBE_DOWNLOAD_CUBE_READ';
export const CUBE_LIST_CUBE_DOWNLOAD_WHERE_CONDITIONS_FORM_CHANGE = 'CUBE_LIST_CUBE_DOWNLOAD_WHERE_CONDITIONS_FORM_CHANGE';
export const CUBE_LIST_CUBE_DOWNLOAD_WHERE_CONDITIONS_FORM_BLOCK_ADD = 'CUBE_LIST_CUBE_DOWNLOAD_WHERE_CONDITIONS_FORM_BLOCK_ADD';
export const CUBE_LIST_CUBE_DOWNLOAD_WHERE_CONDITIONS_FORM_BLOCK_DELETE = 'CUBE_LIST_CUBE_DOWNLOAD_WHERE_CONDITIONS_FORM_BLOCK_DELETE';
export const CUBE_LIST_CUBE_DOWNLOAD_WHERE_CONDITIONS_FORM_CONDITION_ADD = 'CUBE_LIST_CUBE_DOWNLOAD_WHERE_CONDITIONS_FORM_CONDITION_ADD';
export const CUBE_LIST_CUBE_DOWNLOAD_WHERE_CONDITIONS_FORM_CONDITION_DELETE = 'CUBE_LIST_CUBE_DOWNLOAD_WHERE_CONDITIONS_FORM_CONDITION_DELETE';
export const CUBE_LIST_CUBE_DOWNLOAD_WHERE_CONDITIONS_FORM_COLUMN_VALUES_READ = 'CUBE_LIST_CUBE_DOWNLOAD_WHERE_CONDITIONS_FORM_COLUMN_VALUES_READ';
export const CUBE_LIST_CUBE_DOWNLOAD_PREVIEW_ROWS_MODAL_SHOW = 'CUBE_LIST_CUBE_DOWNLOAD_PREVIEW_ROWS_MODAL_SHOW';
export const CUBE_LIST_CUBE_DOWNLOAD_PREVIEW_ROWS_MODAL_HIDE = 'CUBE_LIST_CUBE_DOWNLOAD_PREVIEW_ROWS_MODAL_HIDE';
export const CUBE_LIST_CUBE_DOWNLOAD_PREVIEW_ROWS_READ = 'CUBE_LIST_CUBE_DOWNLOAD_PREVIEW_ROWS_READ';
export const CUBE_LIST_CUBE_DOWNLOAD_CSV_READ = 'CUBE_LIST_CUBE_DOWNLOAD_CSV_READ';
export const CUBE_LIST_CUBE_DOWNLOAD_CUBE_COLUMNS_CHECK = 'CUBE_LIST_CUBE_DOWNLOAD_CUBE_COLUMNS_CHECK';
export const CUBE_LIST_CUBE_DOWNLOAD_CUBE_COLUMNS_CHANGE = 'CUBE_LIST_CUBE_DOWNLOAD_CUBE_COLUMNS_CHANGE';
export const CUBE_LIST_CUBE_EMBARGO_REMOVE = 'CUBE_LIST_CUBE_EMBARGO_REMOVE';
export const CUBE_LIST_CUBE_OWNERSHIP_USERS_READ = 'CUBE_LIST_CUBE_OWNERSHIP_USERS_READ';
export const CUBE_LIST_CUBE_OWNERSHIP_OWNERS_READ = 'CUBE_LIST_CUBE_OWNERSHIP_OWNERS_READ';
export const CUBE_LIST_CUBE_OWNERSHIP_SHOW = 'CUBE_LIST_CUBE_OWNERSHIP_SHOW';
export const CUBE_LIST_CUBE_OWNERSHIP_HIDE = 'CUBE_LIST_CUBE_OWNERSHIP_HIDE';
export const CUBE_LIST_CUBE_OWNERSHIP_OWNERS_CHANGE = 'CUBE_LIST_CUBE_OWNERSHIP_OWNERS_CHANGE';
export const CUBE_LIST_CUBE_OWNERSHIP_OWNERS_SUBMIT = 'CUBE_LIST_CUBE_OWNERSHIP_OWNERS_SUBMIT';
export const CUBE_LIST_CUBE_EMPTY_CUBE_SUBMIT = 'CUBE_LIST_CUBE_EMPTY_CUBE_SUBMIT';
export const CUBE_LIST_CUBE_DELETE_SUBMIT = 'CUBE_LIST_CUBE_DELETE_SUBMIT';
export const CUBE_LIST_CUBE_DOWNLOAD_FILTER_MODAL_SHOW = 'CUBE_LIST_CUBE_DOWNLOAD_FILTER_MODAL_SHOW';
export const CUBE_LIST_CUBE_DOWNLOAD_FILTER_MODAL_SUBMIT = 'CUBE_LIST_CUBE_DOWNLOAD_FILTER_MODAL_SUBMIT';
export const CUBE_LIST_CUBE_DOWNLOAD_FILTER_MODAL_FILTER_RESET = 'CUBE_LIST_CUBE_DOWNLOAD_FILTER_MODAL_FILTER_RESET';
export const CUBE_LIST_CUBE_DOWNLOAD_FILTER_MODAL_FILTER_MODE_CHANGE = 'CUBE_LIST_CUBE_DOWNLOAD_FILTER_MODAL_FILTER_MODE_CHANGE';
export const CUBE_LIST_CUBE_DOWNLOAD_FILTER_MODAL_TREE_FILTER_CHANGE = 'CUBE_LIST_CUBE_DOWNLOAD_FILTER_MODAL_TREE_FILTER_CHANGE';
export const CUBE_LIST_CUBE_DOWNLOAD_FILTER_MODAL_TREE_FILTER_COLUMN_MODE_CHANGE = 'CUBE_LIST_CUBE_DOWNLOAD_FILTER_MODAL_TREE_FILTER_COLUMN_MODE_CHANGE';
export const CUBE_LIST_CUBE_DOWNLOAD_FILTER_MODAL_TREE_FILTER_COLUMN_VALUES_CHANGE = 'CUBE_LIST_CUBE_DOWNLOAD_FILTER_MODAL_TREE_FILTER_COLUMN_VALUES_CHANGE';
export const CUBE_LIST_CUBE_DOWNLOAD_FILTER_MODAL_HIDE = 'CUBE_LIST_CUBE_DOWNLOAD_FILTER_MODAL_HIDE';
export const CUBE_LIST_CUBE_DOWNLOAD_FILTER_MODAL_FILTER_CHANGE = 'CUBE_LIST_CUBE_DOWNLOAD_FILTER_MODAL_FILTER_CHANGE';
export const CUBE_LIST_CUBE_DOWNLOAD_FILTER_MODAL_TREE_FILTER_COLUMN_CODELIST_COUNT_READ = 'CUBE_LIST_CUBE_DOWNLOAD_FILTER_MODAL_TREE_FILTER_COLUMN_CODELIST_COUNT_READ';
export const CUBE_LIST_CUBE_DOWNLOAD_FILTER_MODAL_TREE_FILTER_COLUMN_CODELIST_TREE_READ = 'CUBE_LIST_CUBE_DOWNLOAD_FILTER_MODAL_TREE_FILTER_COLUMN_CODELIST_TREE_READ';
export const CUBE_LIST_CUBE_DOWNLOAD_FILTER_MODAL_TREE_FILTER_COLUMN_FILTERED_VALUES_READ = 'CUBE_LIST_CUBE_DOWNLOAD_FILTER_MODAL_TREE_FILTER_COLUMN_FILTERED_VALUES_READ';

export const readCubeListCubes = () => getRequest(
  CUBE_LIST_CUBES_READ,
  getCubeUrl()
);

export const showCubeListCurrentDataView = cubeId => ({
  type: CUBE_LIST_CURRENT_DATA_VIEW_SHOW,
  cubeId
});

export const hideCubeListCurrentDataView = () => ({
  type: CUBE_LIST_CURRENT_DATA_VIEW_HIDE
});

export const readCubeListCurrentDataView = (cubeId, pageNum, pageSize, filterTable, sortCols, sortByDesc) =>
  postRequest(
    CUBE_LIST_CURRENT_DATA_VIEW_READ,
    getTablePreviewUrl(`Dataset_${cubeId}_ViewCurrentData`),
    {
      PageNum: pageNum,
      PageSize: pageSize,
      FilterTable: filterTable,
      SortCols: sortCols,
      SortByDesc: sortByDesc
    }
  );

export const showCubeListCubeDownload = cubeId => ({
  type: CUBE_LIST_CUBE_DOWNLOAD_SHOW,
  cubeId
});

export const hideCubeListCubeDownload = () => ({
  type: CUBE_LIST_CUBE_DOWNLOAD_HIDE
});

export const readCubeListCubeDownloadCube = cubeId => getRequest(
  CUBE_LIST_CUBE_DOWNLOAD_CUBE_READ,
  getCubeUrl(cubeId)
);

export const changeCubeListCubeDownloadWhereConditionsForm = fields => ({
  type: CUBE_LIST_CUBE_DOWNLOAD_WHERE_CONDITIONS_FORM_CHANGE,
  fields
});

export const addCubeListCubeDownloadWhereConditionsFormBlock = () => ({
  type: CUBE_LIST_CUBE_DOWNLOAD_WHERE_CONDITIONS_FORM_BLOCK_ADD
});

export const deleteCubeListCubeDownloadWhereConditionsFormBlock = blockIndex => ({
  type: CUBE_LIST_CUBE_DOWNLOAD_WHERE_CONDITIONS_FORM_BLOCK_DELETE,
  blockIndex
});

export const addCubeListCubeDownloadWhereConditionsFormCondition = blockIndex => ({
  type: CUBE_LIST_CUBE_DOWNLOAD_WHERE_CONDITIONS_FORM_CONDITION_ADD,
  blockIndex
});

export const deleteCubeListCubeDownloadWhereConditionsFormCondition =
  (blockIndex, conditionIndex) => ({
    type: CUBE_LIST_CUBE_DOWNLOAD_WHERE_CONDITIONS_FORM_CONDITION_DELETE,
    blockIndex,
    conditionIndex
  });

export const readCubeListCubeDownloadWhereConditionsFormColumnValue = (tableName, columnName, columnCodelistCode) => ({
  ...(
    columnCodelistCode
      ? allRequest(
      CUBE_LIST_CUBE_DOWNLOAD_WHERE_CONDITIONS_FORM_COLUMN_VALUES_READ,
      [REQUEST_METHOD_POST, REQUEST_METHOD_GET],
      [getTableColumnPreviewUrl(tableName), getCodelistUrl(getArtefactTripletFromString(columnCodelistCode))],
      [{
        SelCols: [columnName],
        PageSize: 1000,
        PageNum: 1
      }])
      : postRequest(
      CUBE_LIST_CUBE_DOWNLOAD_WHERE_CONDITIONS_FORM_COLUMN_VALUES_READ,
      getTableColumnPreviewUrl(tableName), {
        SelCols: [columnName],
        PageSize: 1000,
        PageNum: 1
      })
  ),
  columnName,
  columnCodelistCode
});

export const showCubeListCubeDownloadPreviewRowsModal = () => ({
  type: CUBE_LIST_CUBE_DOWNLOAD_PREVIEW_ROWS_MODAL_SHOW
});

export const hideCubeListCubeDownloadPreviewRowsModal = () => ({
  type: CUBE_LIST_CUBE_DOWNLOAD_PREVIEW_ROWS_MODAL_HIDE
});

export const readCubeListCubeDownloadPreviewRows = (cubeId, cubeColumns, filter, pageNum, pageSize, sortCols, sortByDesc) =>
  postRequest(
    CUBE_LIST_CUBE_DOWNLOAD_PREVIEW_ROWS_READ,
    getDataflowPreviewUrl(true),
    getServerQueryObj(cubeColumns, getFilterObjFromStr(filter), pageNum, pageSize, sortCols, sortByDesc, cubeId)
  );

export const readCubeListCubeDownloadCsv = (cubeId, cubeColumns, filter, separator, delimiter, compression) => {
  const currDate = moment().format('YYYY-MM-DD_HH-mm-ss');
  const fileSave = {
    name: `cube_${cubeId}_${currDate}.${compression ? 'zip' : 'csv'}`,
    type: "text/plain;charset=utf-8"
  };
  return ({
    ...postRequest(
      CUBE_LIST_CUBE_DOWNLOAD_CSV_READ,
      getDataflowCsvUrl(separator, delimiter, !!compression),
      getServerQueryObj(cubeColumns, getFilterObjFromStr(filter), undefined, undefined, undefined, undefined, cubeId),
      undefined,
      undefined,
      true
    ),
    fileSave
  })
};

export const checkCubeListCubeDownloadCubeColumns = cols => ({
  type: CUBE_LIST_CUBE_DOWNLOAD_CUBE_COLUMNS_CHECK,
  cols
});

export const changeCubeListCubeDownloadCubeColumns = cols => ({
  type: CUBE_LIST_CUBE_DOWNLOAD_CUBE_COLUMNS_CHANGE,
  cols
});

export const removeCubeListCubeEmbargo = cubeId => postRequest(
  CUBE_LIST_CUBE_EMBARGO_REMOVE,
  getDisembargoCubeUrl(cubeId),
  t => ({
    success: t('scenes.dataManager.cubeList.messages.removeEmbargo.success')
  })
);

export const showCubeListCubeOwnership = cubeId => ({
  type: CUBE_LIST_CUBE_OWNERSHIP_SHOW,
  cubeId
});

export const hideCubeListCubeOwnership = () => ({
  type: CUBE_LIST_CUBE_OWNERSHIP_HIDE
});


export const readCubeListCubeOwnershipUsersRead = () => getRequest(
  CUBE_LIST_CUBE_OWNERSHIP_USERS_READ,
  getUsers()
);

export const readCubeListCubeOwnershipOwnersRead = code => getRequest(
  CUBE_LIST_CUBE_OWNERSHIP_OWNERS_READ,
  getCubeOwnersUrl(code)
);

export const changeCubeListCubeOwnershipOwners = owners => ({
  type: CUBE_LIST_CUBE_OWNERSHIP_OWNERS_CHANGE,
  owners
});

export const submitCubeListCubeOwnership = (code, owners) => postRequest(
  CUBE_LIST_CUBE_OWNERSHIP_OWNERS_SUBMIT,
  getSetOwnersUrl(),
  {
    type: "Cube",
    id: code,
    owners: owners.map(username => ({username}))
  },
  t => ({
    success: t('scenes.dataManager.cubeList.messages.ownership.success')
  })
);

export const submitCubeListEmptyCube = cubeId => postRequest(
  CUBE_LIST_CUBE_EMPTY_CUBE_SUBMIT,
  getEmptyCubeUrl(cubeId),
  null,
  t => ({
    success: t('scenes.dataManager.cubeList.messages.emptyCube.success')
  })
);

export const submitCubeListDeleteCube = cubeId =>
  deleteRequest(
    CUBE_LIST_CUBE_DELETE_SUBMIT,
    getCubeUrl(cubeId),
    t => ({
      success: t('scenes.dataManager.cubeList.messages.delete.success')
    })
  );

export const showCubeListCubeDownloadFilterModal = () => ({
  type: CUBE_LIST_CUBE_DOWNLOAD_FILTER_MODAL_SHOW
});

export const hideCubeListCubeDownloadFilterModal = () => ({
  type: CUBE_LIST_CUBE_DOWNLOAD_FILTER_MODAL_HIDE
});

export const submitCubeListCubeDownloadFilterModal = filter => ({
  type: CUBE_LIST_CUBE_DOWNLOAD_FILTER_MODAL_SUBMIT,
  filter
});

export const changeCubeListCubeDownloadFilterModalTreeFilterColumnMode = (colName, mode) => ({
  type: CUBE_LIST_CUBE_DOWNLOAD_FILTER_MODAL_TREE_FILTER_COLUMN_MODE_CHANGE,
  colName,
  mode
});

export const changeCubeListCubeDownloadFilterModalFilterMode = filterMode => ({
  type: CUBE_LIST_CUBE_DOWNLOAD_FILTER_MODAL_FILTER_MODE_CHANGE,
  filterMode
});

export const resetCubeListCubeDownloadFilterModalFilter = () => ({
  type: CUBE_LIST_CUBE_DOWNLOAD_FILTER_MODAL_FILTER_RESET
});

export const changeCubeListCubeDownloadFilter = fields => ({
  type: CUBE_LIST_CUBE_DOWNLOAD_FILTER_MODAL_FILTER_CHANGE,
  fields
});

export const changeCubeListCubeDownloadFilterModalTreeFilter = treeFilter => ({
  type: CUBE_LIST_CUBE_DOWNLOAD_FILTER_MODAL_TREE_FILTER_CHANGE,
  treeFilter
});

export const readCubeListCubeDownloadFilterModalTreeFilterColumnCodelistCount = (codelistTriplet, language) => ({
  ...postRequest(
    CUBE_LIST_CUBE_DOWNLOAD_FILTER_MODAL_TREE_FILTER_COLUMN_CODELIST_COUNT_READ,
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

export const readCubeListCubeDownloadFilterModalTreeFilterColumnCodelistTree = (codelistTriplet, language) => ({
  ...postRequest(
    CUBE_LIST_CUBE_DOWNLOAD_FILTER_MODAL_TREE_FILTER_COLUMN_CODELIST_TREE_READ,
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

export const readCubeListCubeDownloadFilterModalTreeFilterColumnFilteredValues = (cubeId, colNames, filter) => ({
  ...postRequest(
    CUBE_LIST_CUBE_DOWNLOAD_FILTER_MODAL_TREE_FILTER_COLUMN_FILTERED_VALUES_READ,
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

export const changeCubeListCubeDownloadFilterModalTreeFilterColumnValues = (colName, values) => ({
  type: CUBE_LIST_CUBE_DOWNLOAD_FILTER_MODAL_TREE_FILTER_COLUMN_VALUES_CHANGE,
  colName,
  values
});
