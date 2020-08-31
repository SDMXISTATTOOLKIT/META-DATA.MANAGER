import {MODAL_WIDTH_LG} from '../../../../../styles/constants';
import React from 'react';
import {compose} from 'redux';
import {connect} from 'react-redux';
import {translate} from 'react-i18next';
import {getLoaderXmlFormRowListRows, hideLoaderXmlRowList} from './actions';
import {getArtefactTripletFromString} from '../../../../../utils/sdmxJson';
import EnhancedModal from '../../../../../components/enhanced-modal';
import {Button} from "antd";
import {getFilterObjFromViewerObj} from "../../../../../utils/filter";
import InfiniteScrollDataTable from "../../../../../components/infinite-scroll-data-table";

const mapStateToProps = state => ({
  isVisible: state.scenes.dataManager.loader.components.xmlForm.components.rowList.isVisible,
  cube: state.scenes.dataManager.loader.components.xmlForm.shared.cube,
  filePath: state.scenes.dataManager.loader.components.xmlForm.shared.filePath,
  rows: state.scenes.dataManager.loader.components.xmlForm.components.rowList.rows
});

const mapDispatchToProps = dispatch => ({
  onHide: () => dispatch(hideLoaderXmlRowList()),
  fetchRows: (dsdId, dsdAgencyId, dsdVersion, pageNum, pageSize, filterTable, sortCols, sortByDesc, filePath) =>
    dispatch(getLoaderXmlFormRowListRows(dsdId, dsdAgencyId, dsdVersion, pageNum, pageSize, filterTable, sortCols, sortByDesc, filePath))
});

const LoaderCsvFormRowList = ({
                                t,
                                isVisible,
                                filePath,
                                cube,
                                rows,
                                onHide,
                                fetchRows
                              }) =>
  <EnhancedModal
    visible={isVisible}
    onCancel={onHide}
    title={t('scenes.dataManager.loader.xmlForm.rowList.title')}
    width={MODAL_WIDTH_LG}
    footer={<Button onClick={onHide}>{t('commons.buttons.close.title')}</Button>}
  >
    {cube !== null && (
      <InfiniteScrollDataTable
        data={rows && rows.Data}
        rowTotal={rows && rows.Count}
        cols={rows && rows.Columns}
        hiddenCols={['NumRow']}
        onChange={
          ({pageNum, pageSize, searchText, filters, sortCol, sortByDesc}) => fetchRows(
            getArtefactTripletFromString(cube.DSDCode).id,
            getArtefactTripletFromString(cube.DSDCode).agencyID,
            getArtefactTripletFromString(cube.DSDCode).version,
            pageNum,
            pageSize,
            getFilterObjFromViewerObj(
              rows &&
              rows.Columns.filter(colName => colName !== 'NumRow'),
              searchText,
              filters
            ),
            sortCol ? [sortCol] : null,
            sortByDesc,
            filePath
          )
        }
      />
    )}
  </EnhancedModal>;

export default compose(
  translate(),
  connect(mapStateToProps, mapDispatchToProps)
)(LoaderCsvFormRowList);
