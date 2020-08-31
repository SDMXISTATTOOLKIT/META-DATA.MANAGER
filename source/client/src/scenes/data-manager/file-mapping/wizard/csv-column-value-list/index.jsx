import {MODAL_WIDTH_SM} from '../../../../../styles/constants';
import React from 'react';
import {compose} from 'redux';
import {connect} from 'react-redux';
import {translate} from 'react-i18next';
import {getFileMappingWizardCsvColumnValueListColValues, hideFileMappingWizardColumnValueList} from './actions';
import EnhancedModal from '../../../../../components/enhanced-modal';
import {Button} from "antd";
import {getFilterObjFromViewerObj} from "../../../../../utils/filter";
import InfiniteScrollDataTable from "../../../../../components/infinite-scroll-data-table";

const mapStateToProps = state => ({
  colName: state.scenes.dataManager.fileMapping.components.wizard.components.csvColumnValueList.colName,
  colValues: state.scenes.dataManager.fileMapping.components.wizard.components.csvColumnValueList.colValues,
  csvForm: state.scenes.dataManager.fileMapping.components.wizard.shared.csvForm,
  csvServerPath: state.scenes.dataManager.fileMapping.components.wizard.shared.csvServerPath,
  csvHeader: state.scenes.dataManager.fileMapping.components.wizard.shared.csvHeader,
});

const mapDispatchToProps = dispatch => ({
  onHide: () => dispatch(hideFileMappingWizardColumnValueList()),
  fetchColValues: (colName, pageNum, pageSize, filterTable, sortCols, sortByDesc, separator, delimiter, hasHeader, filePath) =>
    dispatch(getFileMappingWizardCsvColumnValueListColValues(colName, pageNum, pageSize, filterTable, sortCols, sortByDesc, separator, delimiter, hasHeader, filePath))
});

const FileMappingWizardCsvColumnValueList = ({
                                               t,
                                               colName,
                                               colValues,
                                               csvForm,
                                               csvServerPath,
                                               csvHeader,
                                               onHide,
                                               fetchColValues
                                             }) =>
  <EnhancedModal
    visible={colName !== null}
    onCancel={onHide}
    title={t('scenes.dataManager.fileMapping.wizard.colValueList.title')}
    width={MODAL_WIDTH_SM}
    footer={<Button onClick={onHide}>{t('commons.buttons.close.title')}</Button>}
  >
    {csvForm !== null && csvHeader !== null && csvServerPath !== null && (
      <InfiniteScrollDataTable
        data={colValues && colValues.Data}
        rowTotal={colValues && colValues.Count}
        cols={colValues && colValues.Columns}
        onChange={
          ({pageNum, pageSize, searchText, filters, sortCol, sortByDesc}) => fetchColValues(
            colName,
            pageNum,
            pageSize,
            getFilterObjFromViewerObj(
              colValues && colValues.Columns,
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
)(FileMappingWizardCsvColumnValueList);
