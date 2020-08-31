import React, {Fragment} from 'react';
import {compose} from "redux";
import {connect} from "react-redux";
import {translate} from "react-i18next";
import EnhancedModal from "../../../../components/enhanced-modal";
import {Button} from "antd";
import {
  ARTEFACT_TYPE_DDBDATAFLOW,
  DOWNLOAD_FORMAT_TYPE_CSV_CUSTOM,
  DOWNLOAD_FORMAT_TYPE_STRUCTURE_SPECIFIC,
  getArtefactDownloadOptions
} from "../../../../constants/download";
import {MODAL_WIDTH_LG, MODAL_WIDTH_SM} from "../../../../styles/constants";
import ArtefactDownloadForm from "../../../../components/artefact-download-form";
import {
  changeDataflowBuilderListDataflowDownload,
  downloadDataflowBuilderListDataflow,
  hideDataflowBuilderListDataflowDownload,
  hideDataflowBuilderListDataflowDownloadPreview,
  readDataflowBuilderListDataflowDownloadCubeAndDdBDataflow,
  readDataflowBuilderListDataflowDownloadPreview,
  readDataflowBuilderListDataflowDsdDataflow,
  showDataflowBuilderListDataflowDownloadPreview,
  showDataflowBuilderListDataflowDownloadQuery
} from "./actions";
import DataflowDownloadQueryForm from "./DataflowDownloadQueryForm";
import {getFilterStrFromViewerObj} from "../../../../utils/filter";
import _ from "lodash";
import Call from "../../../../hocs/call";
import InfiniteScrollDataTable from "../../../../components/infinite-scroll-data-table";

const mapStateToProps = state => ({
  dataLanguages: state.config.dataManagement.dataLanguages,
  dlDataflowId: state.scenes.dataManager.dataflowBuilder.components.list.dlDataflowId,
  cubeId: state.scenes.dataManager.dataflowBuilder.components.list.cubeId,
  dlDataflowParams: state.scenes.dataManager.dataflowBuilder.components.list.dlDataflowParams,
  dlDataflowTriplet: state.scenes.dataManager.dataflowBuilder.components.list.dlDataflowTriplet,
  dlIsPreviewVisible: state.scenes.dataManager.dataflowBuilder.components.list.dlIsPreviewVisible,
  dlRows: state.scenes.dataManager.dataflowBuilder.components.list.dlRows,
  dlCols: state.scenes.dataManager.dataflowBuilder.components.list.dlCols,
  dlCheckedCols: state.scenes.dataManager.dataflowBuilder.components.list.dlCheckedCols,
  dlDsdTriplet: state.scenes.dataManager.dataflowBuilder.components.list.dlDsdTriplet,
  dlDsdDimensions: state.scenes.dataManager.dataflowBuilder.components.list.dlDsdDimensions
});

const mapDispatchToProps = dispatch => ({
  onDownloadHide: () => dispatch(hideDataflowBuilderListDataflowDownload()),
  onDownloadChange: fields => dispatch(changeDataflowBuilderListDataflowDownload(fields)),
  onDownload: (ddbdataflowId, dataflowtriplet, dataflowDownloadParams, dlCols, cubeId) =>
    dispatch(downloadDataflowBuilderListDataflow(ddbdataflowId, dataflowtriplet, dataflowDownloadParams, dlCols, cubeId)),
  fetchCubeAndDdbDataflow: (cubeId, dataflowId) =>
    dispatch(readDataflowBuilderListDataflowDownloadCubeAndDdBDataflow(cubeId, dataflowId)),
  onDownloadQueryShow: () => dispatch(showDataflowBuilderListDataflowDownloadQuery()),
  onPreviewShow: () => dispatch(showDataflowBuilderListDataflowDownloadPreview()),
  onPreviewHide: () => dispatch(hideDataflowBuilderListDataflowDownloadPreview()),
  fetchPreview: (cubeId, cubeColumns, filterStr, pageNum, pageSize, sortCols, sortByDesc, dataflowId) =>
    dispatch(readDataflowBuilderListDataflowDownloadPreview(cubeId, cubeColumns, filterStr, pageNum, pageSize, sortCols, sortByDesc, dataflowId)),
  fetchDownloadDsd: triplet => dispatch(readDataflowBuilderListDataflowDsdDataflow(triplet))
});

const getOrderCheckedCols = (cols, checkedCols) => {
  const ret = [];

  cols && checkedCols &&
  cols.map(col => _.findIndex(checkedCols, checkedCol => checkedCol === col) !== -1 ? ret.push(col) : null);

  return ret
};

const DataflowDownload = ({
                            t,
                            dataLanguages,
                            dlDataflowId,
                            cubeId,
                            dlDataflowParams,
                            dlDsdTriplet,
                            dlDsdDimensions,
                            dlDataflowTriplet,
                            dlIsPreviewVisible,
                            dlRows,
                            dlCols,
                            dlCheckedCols,
                            onDownloadHide,
                            onDownloadChange,
                            fetchCubeAndDdbDataflow,
                            onDownloadQueryShow,
                            onDownload,
                            onPreviewShow,
                            onPreviewHide,
                            fetchPreview,
                            fetchDownloadDsd
                          }) => {
  return (
    <Fragment>
      <EnhancedModal
        visible={dlDataflowId !== null}
        onCancel={onDownloadHide}
        footer={
          <div>
            <Button onClick={onDownloadHide}>
              {t('commons.buttons.close.title')}
            </Button>
            <Button
              onClick={() => onDownload(dlDataflowId, dlDataflowTriplet, dlDataflowParams, dlCols, cubeId)}
              type="primary"
              disabled={
                (dlDataflowParams && dlDataflowParams.format === null) ||
                (dlDataflowParams && dlDataflowParams.format === DOWNLOAD_FORMAT_TYPE_CSV_CUSTOM &&
                  (
                    dlDataflowParams.csvSeparator === null ||
                    dlDataflowParams.csvSeparator.length !== 1 ||
                    dlDataflowParams.selCols === null
                  ))
              }
            >
              {t('commons.buttons.download.title')}
            </Button>
          </div>
        }
        width={MODAL_WIDTH_SM}
        title={t('scenes.dataManager.dataflowBuilder.dataflowDownload.modals.download.title')}
      >
        <Call
          cb={fetchDownloadDsd}
          cbParam={dlDsdTriplet}
          disabled={!(dlDataflowParams && dlDataflowParams.format === DOWNLOAD_FORMAT_TYPE_STRUCTURE_SPECIFIC && dlDsdDimensions === null)}
        >
          <ArtefactDownloadForm
            downloadArtefactForm={dlDataflowParams}
            onChange={onDownloadChange}
            options={getArtefactDownloadOptions(t, ARTEFACT_TYPE_DDBDATAFLOW)}
            langs={dataLanguages}
            queryFormRead={() => fetchCubeAndDdbDataflow(cubeId, dlDataflowId)}
            queryFormShow={onDownloadQueryShow}
            queryPreviewShow={onPreviewShow}
            isQuerySet={dlDataflowParams && dlDataflowParams.selCols !== null}
            isQueryPreviewShowDisabled={dlDataflowParams && dlDataflowParams.selCols === null}
            dimensions={dlDsdDimensions}
          />
        </Call>
      </EnhancedModal>
      <DataflowDownloadQueryForm/>
      <EnhancedModal
        visible={dlIsPreviewVisible}
        onCancel={onPreviewHide}
        footer={
          <Button onClick={onPreviewHide}>
            {t('commons.buttons.close.title')}
          </Button>
        }
        width={MODAL_WIDTH_LG}
        title={t('scenes.dataManager.dataflowBuilder.dataflowDownload.modals.preview.title')}
      >
        <InfiniteScrollDataTable
          data={dlRows && dlRows.Data}
          cols={dlRows && dlRows.Columns}
          rowTotal={dlRows && dlRows.Count}
          onChange={
            ({pageNum, pageSize, searchText, filters, sortCol, sortByDesc}) => {
              fetchPreview(
                cubeId,
                getOrderCheckedCols(dlCols, dlCheckedCols),
                getFilterStrFromViewerObj(
                  dlRows && dlRows.Columns.filter(colName => colName !== '_OBS_VALUE'),
                  searchText,
                  filters,
                  dlDataflowParams.filter
                ),
                pageNum,
                pageSize,
                sortCol ? [sortCol] : null,
                sortByDesc,
                dlDataflowId
              )
            }
          }
        />
      </EnhancedModal>
    </Fragment>
  )
};

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  translate(),
)(DataflowDownload);