import {
  allRequest,
  getRequest,
  postRequest,
  REQUEST_METHOD_GET,
  REQUEST_METHOD_POST
} from "../../../../../middlewares/api/actions";
import {
  getCodelistUrl,
  getCubeUrl,
  getDataflowColumnPreviewUrl,
  getDataflowPreviewUrl,
  getDcsUrl,
  getDdbDataflowUrl,
  getPaginatedCodelistUrl,
  getTableColumnPreviewUrl
} from "../../../../../constants/urls";
import {getArtefactTripletFromString} from "../../../../../utils/sdmxJson";
import {getFilterObjFromStr, getServerQueryObj} from "../../../../../utils/filter";

export const DATAFLOW_BUILDER_WIZARD_QUERY_CUBE_COLUMNS_FORM_CUBE_TREE_SHOW = 'DATAFLOW_BUILDER_WIZARD_QUERY_CUBE_COLUMNS_FORM_CUBE_TREE_SHOW';
export const DATAFLOW_BUILDER_WIZARD_QUERY_CUBE_COLUMNS_FORM_CUBE_TREE_HIDE = 'DATAFLOW_BUILDER_WIZARD_QUERY_CUBE_COLUMNS_FORM_CUBE_TREE_HIDE';
export const DATAFLOW_BUILDER_WIZARD_QUERY_CUBE_COLUMNS_FORM_CUBE_SET = 'DATAFLOW_BUILDER_WIZARD_QUERY_CUBE_COLUMNS_FORM_CUBE_SET';
export const DATAFLOW_BUILDER_WIZARD_QUERY_CUBE_COLUMNS_FORM_CUBE_UNSET = 'DATAFLOW_BUILDER_WIZARD_QUERY_CUBE_COLUMNS_FORM_CUBE_UNSET';
export const DATAFLOW_BUILDER_WIZARD_QUERY_CUBE_COLUMNS_FORM_CUBE_READ = 'DATAFLOW_BUILDER_WIZARD_QUERY_CUBE_COLUMNS_CUBE_READ';
export const DATAFLOW_BUILDER_WIZARD_QUERY_CUBE_COLUMNS_FORM_CUBE_FIRST_ROW_READ = 'DATAFLOW_BUILDER_WIZARD_QUERY_CUBE_COLUMNS_FORM_CUBE_FIRST_ROW_READ';
export const DATAFLOW_BUILDER_WIZARD_QUERY_CUBE_COLUMNS_FORM_DDB_DATAFLOW_READ = 'DATAFLOW_BUILDER_WIZARD_QUERY_CUBE_COLUMNS_FORM_DDB_DATAFLOW_READ';
export const DATAFLOW_BUILDER_WIZARD_QUERY_CUBE_COLUMNS_FORM_CATEGORISED_CUBES_READ = 'DATAFLOW_BUILDER_WIZARD_QUERY_CUBE_COLUMNS_FORM_CATEGORISED_CUBES_READ';
export const DATAFLOW_BUILDER_WIZARD_QUERY_CUBE_COLUMNS_FORM_CHANGE = 'DATAFLOW_BUILDER_WIZARD_QUERY_CUBE_COLUMNS_FORM_CHANGE';
export const DATAFLOW_BUILDER_WIZARD_QUERY_FILTER_FORM_CHANGE = 'DATAFLOW_BUILDER_WIZARD_QUERY_FILTER_FORM_CHANGE';
export const DATAFLOW_BUILDER_WIZARD_QUERY_FILTER_FORM_BLOCK_ADD = 'DATAFLOW_BUILDER_WIZARD_QUERY_FILTER_FORM_BLOCK_ADD';
export const DATAFLOW_BUILDER_WIZARD_QUERY_FILTER_FORM_BLOCK_DELETE = 'DATAFLOW_BUILDER_WIZARD_QUERY_FILTER_FORM_BLOCK_DELETE';
export const DATAFLOW_BUILDER_WIZARD_QUERY_FILTER_FORM_CONDITION_ADD = 'DATAFLOW_BUILDER_WIZARD_QUERY_FILTER_FORM_CONDITION_ADD';
export const DATAFLOW_BUILDER_WIZARD_QUERY_FILTER_FORM_CONDITION_DELETE = 'DATAFLOW_BUILDER_WIZARD_QUERY_FILTER_FORM_CONDITION_DELETE';
export const DATAFLOW_BUILDER_WIZARD_QUERY_FILTER_FORM_CODELIST_READ = 'DATAFLOW_BUILDER_WIZARD_QUERY_FILTER_FORM_CODELIST_READ';
export const DATAFLOW_BUILDER_WIZARD_QUERY_FILTER_FORM_COLUMN_VALUES_READ = 'DATAFLOW_BUILDER_WIZARD_QUERY_FILTER_FORM_COLUMN_VALUES_READ';
export const DATAFLOW_BUILER_WIZARD_QUERY_PREVIEW_ROWS_READ = 'DATAFLOW_BUILER_WIZARD_QUERY_PREVIEW_ROWS_READ';
export const DATAFLOW_BUILDER_WIZARD_QUERY_PREVIEW_ROWS_MODAL_SHOW = 'DATAFLOW_BUILDER_WIZARD_QUERY_PREVIEW_ROWS_MODAL_SHOW';
export const DATAFLOW_BUILDER_WIZARD_QUERY_PREVIEW_ROWS_MODAL_HIDE = 'DATAFLOW_BUILDER_WIZARD_QUERY_PREVIEW_ROWS_MODAL_HIDE';
export const DATAFLOW_BUILDER_WIZARD_QUERY_TREE_FILTER_COLUMN_CODELIST_COUNT_READ = 'DATAFLOW_BUILDER_WIZARD_QUERY_TREE_FILTER_COLUMN_CODELIST_COUNT_READ';
export const DATAFLOW_BUILDER_WIZARD_QUERY_TREE_FILTER_COLUMN_CODELIST_TREE_READ = 'DATAFLOW_BUILDER_WIZARD_QUERY_TREE_FILTER_COLUMN_CODELIST_TREE_READ';
export const DATAFLOW_BUILDER_WIZARD_QUERY_FILTER_RESET = 'DATAFLOW_BUILDER_WIZARD_QUERY_FILTER_RESET';
export const DATAFLOW_BUILDER_WIZARD_QUERY_FILTER_MODE_CHANGE = 'DATAFLOW_BUILDER_WIZARD_QUERY_FILTER_MODE_CHANGE';
export const DATAFLOW_BUILDER_WIZARD_QUERY_FILTER_MODAL_SHOW = 'DATAFLOW_BUILDER_WIZARD_QUERY_FILTER_MODAL_SHOW';
export const DATAFLOW_BUILDER_WIZARD_QUERY_FILTER_MODAL_HIDE = 'DATAFLOW_BUILDER_WIZARD_QUERY_FILTER_MODAL_HIDE';
export const DATAFLOW_BUILDER_WIZARD_QUERY_FILTER_MODAL_SUBMIT = 'DATAFLOW_BUILDER_WIZARD_QUERY_FILTER_MODAL_SUBMIT';
export const DATAFLOW_BUILDER_WIZARD_QUERY_TREE_FILTER_CHANGE = 'DATAFLOW_BUILDER_WIZARD_QUERY_TREE_FILTER_CHANGE';
export const DATAFLOW_BUILDER_WIZARD_QUERY_TREE_FILTER_COLUMN_FILTERED_VALUES_READ = 'DATAFLOW_BUILDER_WIZARD_QUERY_TREE_FILTER_COLUMN_FILTERED_VALUES_READ';
export const DATAFLOW_BUILDER_WIZARD_QUERY_TREE_FILTER_COLUMN_MODE_CHANGE = 'DATAFLOW_BUILDER_WIZARD_QUERY_TREE_FILTER_COLUMN_MODE_CHANGE';
export const DATAFLOW_BUILDER_WIZARD_QUERY_TREE_FILTER_COLUMN_VALUES_CHANGE = 'DATAFLOW_BUILDER_WIZARD_QUERY_TREE_FILTER_COLUMN_VALUES_CHANGE';

export const showDataflowBuilderWizardQueryCubeColumnsFormCubeTree = () => ({
  type: DATAFLOW_BUILDER_WIZARD_QUERY_CUBE_COLUMNS_FORM_CUBE_TREE_SHOW
});

export const hideDataflowBuilderWizardQueryCubeColumnsFormCubeTree = () => ({
  type: DATAFLOW_BUILDER_WIZARD_QUERY_CUBE_COLUMNS_FORM_CUBE_TREE_HIDE
});

export const setDataflowBuilderWizardQueryCubeColumnsFormCube = cubeId => ({
  type: DATAFLOW_BUILDER_WIZARD_QUERY_CUBE_COLUMNS_FORM_CUBE_SET,
  cubeId
});

export const unsetDataflowBuilderWizardQueryCubeColumnsFormCube = () => ({
  type: DATAFLOW_BUILDER_WIZARD_QUERY_CUBE_COLUMNS_FORM_CUBE_UNSET
});

export const readDataflowBuilderWizardQueryCubeColumnsFormCube = cubeId => getRequest(
  DATAFLOW_BUILDER_WIZARD_QUERY_CUBE_COLUMNS_FORM_CUBE_READ,
  getCubeUrl(cubeId)
);

export const readDataflowBuilderWizardQueryCubeColumnsFormCubeFirstRow = (cubeId, cubeColumns) =>
  postRequest(
    DATAFLOW_BUILDER_WIZARD_QUERY_CUBE_COLUMNS_FORM_CUBE_FIRST_ROW_READ,
    getDataflowPreviewUrl(),
    getServerQueryObj(cubeColumns, [], 1, 1, undefined, undefined, cubeId)
  );

export const readDataflowBuilderWizardQueryCubeColumnsFormCategorisedCubes = () => allRequest(
  DATAFLOW_BUILDER_WIZARD_QUERY_CUBE_COLUMNS_FORM_CATEGORISED_CUBES_READ,
  [REQUEST_METHOD_GET, REQUEST_METHOD_GET],
  [getCubeUrl(), getDcsUrl()]
);

export const changeDataflowBuilderWizardQueryCubeColumnsForm = fields => ({
  type: DATAFLOW_BUILDER_WIZARD_QUERY_CUBE_COLUMNS_FORM_CHANGE,
  fields
});

export const readDataflowBuilderWizardQueryCubeColumnsFormDdbDataflow = ddbDataflowId => getRequest(
  DATAFLOW_BUILDER_WIZARD_QUERY_CUBE_COLUMNS_FORM_DDB_DATAFLOW_READ,
  getDdbDataflowUrl(ddbDataflowId)
);

export const changeDataflowBuilderWizardFilterForm = fields => ({
  type: DATAFLOW_BUILDER_WIZARD_QUERY_FILTER_FORM_CHANGE,
  fields
});

export const addDataflowBuilderWizardQueryFilterFormBlock = () => ({
  type: DATAFLOW_BUILDER_WIZARD_QUERY_FILTER_FORM_BLOCK_ADD
});

export const deleteDataflowBuilderWizardQueryFilterFormBlock = blockIndex => ({
  type: DATAFLOW_BUILDER_WIZARD_QUERY_FILTER_FORM_BLOCK_DELETE,
  blockIndex
});

export const addDataflowBuilderWizardQueryFilterFormCondition = blockIndex => ({
  type: DATAFLOW_BUILDER_WIZARD_QUERY_FILTER_FORM_CONDITION_ADD,
  blockIndex
});

export const deleteDataflowBuilderWizardQueryFilterFormCondition =
  (blockIndex, conditionIndex) => ({
    type: DATAFLOW_BUILDER_WIZARD_QUERY_FILTER_FORM_CONDITION_DELETE,
    blockIndex,
    conditionIndex
  });

export const readDataflowBuilderWizardQueryFilterFormColumnValues = (tableName, columnName, columnCodelistCode) => ({
  ...(columnCodelistCode
    ? allRequest(
      DATAFLOW_BUILDER_WIZARD_QUERY_FILTER_FORM_COLUMN_VALUES_READ,
      [REQUEST_METHOD_POST, REQUEST_METHOD_GET],
      [getTableColumnPreviewUrl(tableName), getCodelistUrl(getArtefactTripletFromString(columnCodelistCode))],
      [
        {
          SelCols: [columnName],
          PageSize: 1000,
          PageNum: 1
        }
      ]
    )
    : postRequest(
      DATAFLOW_BUILDER_WIZARD_QUERY_FILTER_FORM_COLUMN_VALUES_READ,
      getTableColumnPreviewUrl(tableName), {
        SelCols: [columnName],
        PageSize: 1000,
        PageNum: 1
      }
    )),
  columnName,
  columnCodelistCode
});

export const readDataflowBuilderWizardQueryPreviewRows = (cubeId, cubeColumns, filter, pageNum, pageSize, sortCols, sortByDesc) =>
  postRequest(
    DATAFLOW_BUILER_WIZARD_QUERY_PREVIEW_ROWS_READ,
    getDataflowPreviewUrl(),
    getServerQueryObj(cubeColumns, getFilterObjFromStr(filter), pageNum, pageSize, sortCols, sortByDesc, cubeId)
  );

export const showDataflowBuilderWizardQueryPreviewRowsModal = () => ({
  type: DATAFLOW_BUILDER_WIZARD_QUERY_PREVIEW_ROWS_MODAL_SHOW
});

export const hideDataflowBuilderWizardQueryPreviewRowsModal = () => ({
  type: DATAFLOW_BUILDER_WIZARD_QUERY_PREVIEW_ROWS_MODAL_HIDE
});

export const readDataflowBuilderWizardQueryTreeFilterColumnCodelistCount = (codelistTriplet, language) => ({
  ...postRequest(
    DATAFLOW_BUILDER_WIZARD_QUERY_TREE_FILTER_COLUMN_CODELIST_COUNT_READ,
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

export const readDataflowBuilderWizardQueryTreeFilterColumnCodelistTree = (codelistTriplet, language) => ({
  ...postRequest(
    DATAFLOW_BUILDER_WIZARD_QUERY_TREE_FILTER_COLUMN_CODELIST_TREE_READ,
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

export const resetDataflowBuilderWizardQueryFilter = () => ({
  type: DATAFLOW_BUILDER_WIZARD_QUERY_FILTER_RESET
});

export const changeDataflowBuilderWizardQueryFilterMode = filterMode => ({
  type: DATAFLOW_BUILDER_WIZARD_QUERY_FILTER_MODE_CHANGE,
  filterMode
});

export const showDataflowBuilderWizardQueryFilterModal = () => ({
  type: DATAFLOW_BUILDER_WIZARD_QUERY_FILTER_MODAL_SHOW
});

export const hideDataflowBuilderWizardQueryFilterModal = () => ({
  type: DATAFLOW_BUILDER_WIZARD_QUERY_FILTER_MODAL_HIDE
});

export const submitDataflowBuilderWizardQueryFilterModal = filter => ({
  type: DATAFLOW_BUILDER_WIZARD_QUERY_FILTER_MODAL_SUBMIT,
  filter
});

export const changeDataflowBuilderWizardQueryTreeFilter = treeFilter => ({
  type: DATAFLOW_BUILDER_WIZARD_QUERY_TREE_FILTER_CHANGE,
  treeFilter
});

export const readDataflowBuilderWizardQueryTreeFilterColumnFilteredValues = (cubeId, colNames, filter) => ({
  ...postRequest(
    DATAFLOW_BUILDER_WIZARD_QUERY_TREE_FILTER_COLUMN_FILTERED_VALUES_READ,
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

export const changeDataflowBuilderWizardQueryTreeFilterColumnMode = (colName, mode) => ({
  type: DATAFLOW_BUILDER_WIZARD_QUERY_TREE_FILTER_COLUMN_MODE_CHANGE,
  colName,
  mode
});

export const changeDataflowBuilderWizardQueryTreeFilterColumnValues = (colName, values) => ({
  type: DATAFLOW_BUILDER_WIZARD_QUERY_TREE_FILTER_COLUMN_VALUES_CHANGE,
  colName,
  values
});
