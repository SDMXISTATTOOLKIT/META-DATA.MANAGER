import {MODAL_WIDTH_LG} from '../../../../../styles/constants';
import React from 'react';
import {compose} from 'redux';
import {connect} from 'react-redux';
import {translate} from 'react-i18next';
import {getFileMappingWizardCsvRowListCsvRows, hideFileMappingWizardCsvRowList} from './actions';
import EnhancedModal from '../../../../../components/enhanced-modal';
import {Button} from "antd";
import {getFilterObjFromViewerObj} from "../../../../../utils/filter";
import InfiniteScrollDataTable from "../../../../../components/infinite-scroll-data-table";

const mapStateToProps = state => ({
  isVisible: state.scenes.dataManager.fileMapping.components.wizard.components.csvRowList.isVisible,
  csvRows: state.scenes.dataManager.fileMapping.components.wizard.components.csvRowList.csvRows,
  csvForm: state.scenes.dataManager.fileMapping.components.wizard.shared.csvForm,
  csvServerPath: state.scenes.dataManager.fileMapping.components.wizard.shared.csvServerPath,
  csvHeader: state.scenes.dataManager.fileMapping.components.wizard.shared.csvHeader,
});

const mapDispatchToProps = dispatch => ({
  onHide: () => dispatch(hideFileMappingWizardCsvRowList()),
  fetchCsvRows: (pageNum, pageSize, filterTable, sortCols, sortByDesc, separator, delimiter, hasHeader, filePath) =>
    dispatch(getFileMappingWizardCsvRowListCsvRows(pageNum, pageSize, filterTable, sortCols, sortByDesc, separator, delimiter, hasHeader, filePath))
});

const FileMappingWizardCsvRowList = ({
                                       t,
                                       isVisible,
                                       csvRows,
                                       csvForm,
                                       csvServerPath,
                                       csvHeader,
                                       onHide,
                                       fetchCsvRows
                                     }) =>
  <EnhancedModal
    visible={isVisible}
    onCancel={onHide}
    title={t('scenes.dataManager.fileMapping.wizard.csvRowList.title')}
    width={MODAL_WIDTH_LG}
    footer={<Button onClick={onHide}>{t('commons.buttons.close.title')}</Button>}
  >
    {csvForm !== null && csvHeader !== null && csvServerPath !== null && (
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
              csvRows && csvRows.Columns.filter(colName => colName !== 'NumRow'),
              searchText,
              filters
            ),
            sortCol ? [sortCol] : null,
            sortByDesc,
            csvForm.separator,
            csvForm.delimiter,
            csvForm.hasHeader,
            csvServerPath
          )
        }
      />
    )}
  </EnhancedModal>;

export default compose(
  translate(),
  connect(mapStateToProps, mapDispatchToProps)
)(FileMappingWizardCsvRowList);
