import React, {Fragment} from 'react';
import {Button} from "antd";
import {MODAL_WIDTH_MD, MODAL_WIDTH_SM} from "../../../styles/constants";
import DataflowsList from "./List";
import {compose} from "redux";
import {translate} from 'react-i18next';
import DataflowDetail from "./Detail";
import {
  changeDataflowsDataflowClone,
  changeDataflowsDataflowDownload,
  changeDataflowsDataflowExport,
  hideDataflowsDataflowClone,
  hideDataflowsDataflowDownload,
  hideDataflowsDataflowExport,
  hideDataflowsDataflowExportReport,
  submitDataflowsDataflowClone,
  submitDataflowsDataflowDownload,
  submitDataflowsDataflowExport
} from "./actions";
import {connect} from "react-redux";
import ArtefactDownloadForm from "../../../components/artefact-download-form";
import EnhancedModal from "../../../components/enhanced-modal";
import {
  ARTEFACT_TYPE_DATAFLOW,
  ARTEFACT_TYPE_MULTIPLE,
  DOWNLOAD_FORMAT_TYPE_CSV,
  getArtefactDownloadOptions
} from "../../../constants/download";
import ArtefactExportForm from "../../../components/artefact-export-form";
import ArtefactExportReport from "../../../components/artefact-export-report";
import {isVersionValidWithHelp} from "../../../utils/artefactValidators";
import ArtefactCloneForm from "../../../components/artefact-clone-form";

const mapStateToProps = state => ({
  dataLanguages: state.config.dataManagement.dataLanguages,
  dataflow: state.scenes.metaManager.dataflows.dataflow,
  allAgencies: state.scenes.metaManager.dataflows.allAgencies,
  downloadDataflowTriplets: state.scenes.metaManager.dataflows.downloadDataflowTriplets,
  downloadDataflowLang: state.scenes.metaManager.dataflows.downloadDataflowLang,
  downloadDataflowParams: state.scenes.metaManager.dataflows.downloadDataflowParams,
  cloneDestTriplet: state.scenes.metaManager.dataflows.cloneDestTriplet,
  dataflowExportSourceTriplet: state.scenes.metaManager.dataflows.dataflowExportSourceTriplet,
  dataflowExportDestination: state.scenes.metaManager.dataflows.dataflowExportDestination,
  dataflowExportReport: state.scenes.metaManager.dataflows.dataflowExportReport
});

const mapDispatchToProps = dispatch => ({
  onDownloadHide: () => dispatch(hideDataflowsDataflowDownload()),
  onDownloadChange: fields => dispatch(changeDataflowsDataflowDownload(fields)),
  onDownloadSubmit: (artefactTriplet, downloadDataflowParams, lang) =>
    dispatch(submitDataflowsDataflowDownload(artefactTriplet, downloadDataflowParams, lang)),
  onCloneHide: () => dispatch(hideDataflowsDataflowClone()),
  onCloneChange: fields => dispatch(changeDataflowsDataflowClone(fields)),
  onCloneSubmit: (cloneDestTriplet, srcDataflow) =>
    dispatch(submitDataflowsDataflowClone(cloneDestTriplet, srcDataflow)),
  onExportHide: () => dispatch(hideDataflowsDataflowExport()),
  onExportChange: fields => dispatch(changeDataflowsDataflowExport(fields)),
  onExportSubmit: (sourceTriplets, destination) => dispatch(submitDataflowsDataflowExport(sourceTriplets, destination)),
  onExportReportHide: () => dispatch(hideDataflowsDataflowExportReport())
});

const Dataflows = ({
                     t,
                     dataLanguages,
                     dataflow,
                     allAgencies,
                     downloadDataflowTriplets,
                     downloadDataflowLang,
                     downloadDataflowParams,
                     onDownloadHide,
                     onDownloadChange,
                     onDownloadSubmit,
                     cloneDestTriplet,
                     onCloneHide,
                     onCloneChange,
                     onCloneSubmit,
                     dataflowExportSourceTriplet,
                     dataflowExportDestination,
                     onExportHide,
                     onExportChange,
                     onExportSubmit,
                     dataflowExportReport,
                     onExportReportHide
                   }) =>
  <Fragment>
    <DataflowsList/>
    <DataflowDetail/>
    <EnhancedModal
      visible={downloadDataflowTriplets !== null && downloadDataflowTriplets !== undefined}
      onCancel={onDownloadHide}
      footer={
        <div>
          <Button onClick={onDownloadHide}>
            {t('commons.buttons.close.title')}
          </Button>
          <Button
            onClick={
              () => onDownloadSubmit(downloadDataflowTriplets, downloadDataflowParams, downloadDataflowLang)
            }
            type="primary"
            disabled={
              (downloadDataflowParams && downloadDataflowParams.format === null) ||
              (downloadDataflowParams && downloadDataflowParams.format === DOWNLOAD_FORMAT_TYPE_CSV &&
                (
                  downloadDataflowParams.csvSeparator === null ||
                  downloadDataflowParams.csvSeparator.length !== 1 ||
                  downloadDataflowParams.csvLanguage === null
                ))
            }
          >
            {t('commons.buttons.download.title')}
          </Button>
        </div>
      }
      width={MODAL_WIDTH_SM}
      title={t('scenes.metaManager.commons.modals.download.title')}
    >
      <ArtefactDownloadForm
        downloadArtefactForm={downloadDataflowParams}
        onChange={onDownloadChange}
        options={getArtefactDownloadOptions(
          t,
          (downloadDataflowTriplets && downloadDataflowTriplets.length > 1)
            ? ARTEFACT_TYPE_MULTIPLE
            : ARTEFACT_TYPE_DATAFLOW
        )}
        langs={dataLanguages}
        hasReferences
      />
    </EnhancedModal>
    <EnhancedModal
      visible={cloneDestTriplet !== null}
      width={MODAL_WIDTH_MD}
      title={t('commons.artefact.modals.clone.title')}
      onCancel={onCloneHide}
      footer={
        <div>
          <Button onClick={onCloneHide}>
            {t('commons.buttons.close.title')}
          </Button>
          <Button
            onClick={() => onCloneSubmit(cloneDestTriplet, dataflow)}
            type="primary"
            disabled={
              !cloneDestTriplet ||
              cloneDestTriplet.id === null || cloneDestTriplet.id.length === 0 ||
              cloneDestTriplet.agencyID === null || cloneDestTriplet.agencyID.length === 0 ||
              cloneDestTriplet.version === null || cloneDestTriplet.version.length === 0 ||
              !isVersionValidWithHelp(f => f, cloneDestTriplet.version).valid
            }
          >
            {t('commons.artefact.modals.clone.buttons.submit.title')}
          </Button>
        </div>
      }
    >
      <ArtefactCloneForm
        agencies={allAgencies}
        srcArtefact={dataflow}
        destTriplet={cloneDestTriplet}
        onChange={onCloneChange}
      />
    </EnhancedModal>
    <EnhancedModal
      visible={dataflowExportSourceTriplet !== null}
      title={t('commons.artefact.modals.export.title')}
      width={MODAL_WIDTH_MD}
      onCancel={onExportHide}
      footer={
        <div>
          <Button onClick={onExportHide}>{t('commons.buttons.close.title')}</Button>
          <Button
            type="primary"
            disabled={
              !(
                dataflowExportDestination &&
                dataflowExportDestination.endpoint &&
                dataflowExportDestination.username &&
                dataflowExportDestination.id &&
                dataflowExportDestination.agencyID &&
                dataflowExportDestination.version &&
                isVersionValidWithHelp(f => f, dataflowExportDestination.version).valid
              )
            }
            onClick={() => onExportSubmit(dataflowExportSourceTriplet, dataflowExportDestination)}
          >
            {t('commons.artefact.modals.export.buttons.submit.title')}
          </Button>
        </div>
      }
    >
      <ArtefactExportForm
        type='dataflow'
        agencies={allAgencies}
        sourceTriplet={dataflowExportSourceTriplet}
        destination={dataflowExportDestination}
        onChange={onExportChange}
      />
    </EnhancedModal>
    <EnhancedModal
      visible={dataflowExportReport !== null}
      title={t('commons.artefact.modals.exportReport.title')}
      width={MODAL_WIDTH_MD}
      onCancel={onExportReportHide}
      footer={<Button onClick={onExportReportHide}>{t('commons.buttons.close.title')}</Button>}
    >
      <ArtefactExportReport
        report={dataflowExportReport}
      />
    </EnhancedModal>
  </Fragment>;

export default compose(
  translate(),
  connect(mapStateToProps, mapDispatchToProps)
)(Dataflows);
