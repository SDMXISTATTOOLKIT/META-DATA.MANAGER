import {postRequest} from '../../../../../middlewares/api/actions';
import {getCsvTablePreviewUrl} from '../../../../../constants/urls';

export const LOADER_CSV_FORM_ROW_LIST_SHOW = 'LOADER_CSV_FORM_ROW_LIST_SHOW';
export const LOADER_CSV_FORM_ROW_LIST_HIDE = 'LOADER_CSV_FORM_ROW_LIST_HIDE';
export const LOADER_CSV_FORM_ROW_LIST_CSV_ROWS_GET = 'LOADER_CSV_FORM_ROW_LIST_CSV_ROWS_GET';

export const showLoaderCsvFormRowList = () => ({
  type: LOADER_CSV_FORM_ROW_LIST_SHOW
});

export const hideLoaderCsvFormRowList = () => ({
  type: LOADER_CSV_FORM_ROW_LIST_HIDE
});

export const getLoaderCsvFormRowListCsvRows = (pageNum, pageSize, filterTable, sortCols, sortByDesc, separator, delimiter, hasHeader, tid, filePath, idMappingSpecialTimePeriod) =>
  postRequest(
    LOADER_CSV_FORM_ROW_LIST_CSV_ROWS_GET,
    getCsvTablePreviewUrl(separator, delimiter, hasHeader, filePath, tid, idMappingSpecialTimePeriod),
    {
      PageNum: pageNum,
      PageSize: pageSize,
      FilterTable: filterTable,
      SortCols: sortCols,
      SortByDesc: sortByDesc,
    }
  );
