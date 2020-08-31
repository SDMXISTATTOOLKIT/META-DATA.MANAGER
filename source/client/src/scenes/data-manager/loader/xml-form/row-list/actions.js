import {postRequest} from '../../../../../middlewares/api/actions';
import {getSdmxMlTablePreviewUrl} from '../../../../../constants/urls';

export const LOADER_XML_ROW_LIST_HIDE = 'LOADER_XML_ROW_LIST_HIDE';
export const LOADER_XML_ROW_LIST_SHOW = 'LOADER_XML_ROW_LIST_SHOW';
export const LOADER_XML_ROW_LIST_ROWS_READ = 'LOADER_XML_ROW_LIST_ROWS_READ';

export const hideLoaderXmlRowList = () => ({
  type: LOADER_XML_ROW_LIST_HIDE
});

export const showLoaderXmlRowList = () => ({
  type: LOADER_XML_ROW_LIST_SHOW
});

export const getLoaderXmlFormRowListRows = (dsdId, dsdAgencyId, dsdVersion, pageNum, pageSize, filterTable, sortCols, sortByDesc, filePath) => postRequest(
  LOADER_XML_ROW_LIST_ROWS_READ,
  getSdmxMlTablePreviewUrl(dsdId, dsdAgencyId, dsdVersion, filePath),
  {
    PageNum: pageNum,
    PageSize: pageSize,
    FilterTable: filterTable,
    SortCols: sortCols,
    SortByDesc: sortByDesc
  }
);
