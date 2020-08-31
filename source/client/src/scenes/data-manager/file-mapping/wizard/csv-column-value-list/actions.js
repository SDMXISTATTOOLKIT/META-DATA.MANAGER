import {postRequest} from '../../../../../middlewares/api/actions';
import {getCsvTableColumnPreviewUrl} from '../../../../../constants/urls';

export const FILE_MAPPING_WIZARD_COLUMN_VALUE_LIST_COL_VALUES_GET = 'FILE_MAPPING_WIZARD_COLUMN_VALUE_LIST_COL_VALUES_GET';
export const FILE_MAPPING_WIZARD_COLUMN_VALUE_LIST_SHOW = 'FILE_MAPPING_WIZARD_COLUMN_VALUE_LIST_SHOW';
export const FILE_MAPPING_WIZARD_COLUMN_VALUE_LIST_HIDE = 'FILE_MAPPING_WIZARD_COLUMN_VALUE_LIST_HIDE';

export const getFileMappingWizardCsvColumnValueListColValues = (colName, pageNum, pageSize, filterTable, sortCols, sortByDesc, separator, delimiter, hasHeader, filePath) =>
  postRequest(
    FILE_MAPPING_WIZARD_COLUMN_VALUE_LIST_COL_VALUES_GET,
    getCsvTableColumnPreviewUrl(separator, delimiter, hasHeader, filePath),
    {
      SelCols: [colName],
      PageNum: pageNum,
      PageSize: pageSize,
      FilterTable: filterTable,
      SortCols: sortCols,
      SortByDesc: sortByDesc
    }
  );

export const showFileMappingWizardColumnValueList = colName => ({
  type: FILE_MAPPING_WIZARD_COLUMN_VALUE_LIST_SHOW,
  colName
});

export const hideFileMappingWizardColumnValueList = () => ({
  type: FILE_MAPPING_WIZARD_COLUMN_VALUE_LIST_HIDE
});
