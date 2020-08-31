import {postRequest} from '../../../../../middlewares/api/actions';
import {getCsvTablePreviewUrl} from '../../../../../constants/urls';

export const FILE_MAPPING_WIZARD_CSV_ROW_LIST_CSV_ROWS_GET = 'FILE_MAPPING_WIZARD_CSV_ROW_LIST_CSV_ROWS_GET';
export const FILE_MAPPING_WIZARD_CSV_ROW_LIST_SHOW = 'FILE_MAPPING_WIZARD_CSV_ROW_LIST_SHOW';
export const FILE_MAPPING_WIZARD_CSV_ROW_LIST_HIDE = 'FILE_MAPPING_WIZARD_CSV_ROW_LIST_HIDE';

export const getFileMappingWizardCsvRowListCsvRows = (pageNum, pageSize, filterTable, sortCols, sortByDesc, separator, delimiter, hasHeader, filePath) => postRequest(
  FILE_MAPPING_WIZARD_CSV_ROW_LIST_CSV_ROWS_GET,
  getCsvTablePreviewUrl(separator, delimiter, hasHeader, filePath, null, null),
  {
    PageNum: pageNum,
    PageSize: pageSize,
    FilterTable: filterTable,
    SortCols: sortCols,
    SortByDesc: sortByDesc
  }
);

export const showFileMappingWizardCsvRowList = () => ({
  type: FILE_MAPPING_WIZARD_CSV_ROW_LIST_SHOW
});

export const hideFileMappingWizardCsvRowList = () => ({
  type: FILE_MAPPING_WIZARD_CSV_ROW_LIST_HIDE
});
