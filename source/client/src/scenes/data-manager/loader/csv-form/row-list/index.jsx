import {MODAL_WIDTH_LG} from '../../../../../styles/constants';
import React from 'react';
import {compose} from 'redux';
import {connect} from 'react-redux';
import {translate} from 'react-i18next';
import {getLoaderCsvFormRowListCsvRows, hideLoaderCsvFormRowList} from './actions';
import EnhancedModal from '../../../../../components/enhanced-modal';
import {Button} from "antd";
import {getFilterObjFromViewerObj} from "../../../../../utils/filter";
import InfiniteScrollDataTable from "../../../../../components/infinite-scroll-data-table";

const mapStateToProps = state => ({
  isVisible: state.scenes.dataManager.loader.components.csvForm.components.rowList.isVisible,
  tid: state.scenes.dataManager.loader.components.csvForm.shared.tid,
  mappingId: state.scenes.dataManager.loader.components.csvForm.shared.mappingId,
  separator: state.scenes.dataManager.loader.components.csvForm.shared.separator,
  delimiter: state.scenes.dataManager.loader.components.csvForm.shared.delimiter,
  hasHeader: state.scenes.dataManager.loader.components.csvForm.shared.hasHeader,
  hasDotStatFormat: state.scenes.dataManager.loader.components.csvForm.shared.hasDotStatFormat,
  csvServerPath: state.scenes.dataManager.loader.components.csvForm.shared.csvServerPath,
  csvRows: state.scenes.dataManager.loader.components.csvForm.components.rowList.csvRows
});

const mapDispatchToProps = dispatch => ({
  onHide: () => dispatch(hideLoaderCsvFormRowList()),
  fetchCsvRows: (pageNum, pageSize, filterTable, sortCols, sortByDesc, separator, delimiter, hasHeader, tid, filePath, idMappingSpecialTimePeriod) =>
    dispatch(getLoaderCsvFormRowListCsvRows(pageNum, pageSize, filterTable, sortCols, sortByDesc, separator, delimiter, hasHeader, tid, filePath, idMappingSpecialTimePeriod))
});

const LoaderCsvFormRowList = ({
                                t,
                                isVisible,
                                tid,
                                mappingId,
                                separator,
                                delimiter,
                                hasHeader,
                                hasDotStatFormat,
                                csvServerPath,
                                csvRows,
                                onHide,
                                fetchCsvRows
                              }) =>
  <EnhancedModal
    visible={isVisible}
    onCancel={onHide}
    title={t('scenes.dataManager.loader.csvForm.rowList.title')}
    width={MODAL_WIDTH_LG}
    footer={<Button onClick={onHide}>{t('commons.buttons.close.title')}</Button>}
  >
    {csvServerPath !== null && (
      <InfiniteScrollDataTable
        data={csvRows && csvRows.Data}
        rowTotal={csvRows && csvRows.Count}
        cols={csvRows && csvRows.Columns}
        hiddenCols={['NumRow']}
        onChange={
          ({pageNum, pageSize, searchText, filters, sortCol, sortByDesc}) => fetchCsvRows(
            pageNum,
            pageSize,
            getFilterObjFromViewerObj(
              csvRows &&
              csvRows.Columns.filter(colName => colName !== 'NumRow'),
              searchText,
              filters
            ),
            sortCol ? [sortCol] : null,
            sortByDesc,
            separator,
            !!delimiter ? delimiter : null,
            hasHeader,
            tid,
            csvServerPath,
            hasDotStatFormat ? mappingId : null
          )
        }
      />
    )}
  </EnhancedModal>;

export default compose(
  translate(),
  connect(mapStateToProps, mapDispatchToProps)
)(LoaderCsvFormRowList);
