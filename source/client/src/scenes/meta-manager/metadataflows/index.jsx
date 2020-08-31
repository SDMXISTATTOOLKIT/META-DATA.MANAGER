import React, {Fragment} from 'react';
import {Button} from "antd";
import {MODAL_WIDTH_MD, MODAL_WIDTH_SM} from "../../../styles/constants";
import MetadataflowsList from "./List";
import {compose} from "redux";
import {translate} from 'react-i18next';
import MetadataflowDetail from "./Detail";
import {
  changeMetadataflowsMetadataflowClone,
  changeMetadataflowsMetadataflowDownload,
  changeMetadataflowsMetadataflowExport,
  downloadMetadataflowsMetadataflow,
  hideMetadataflowsMetadataflowClone,
  hideMetadataflowsMetadataflowDownload,
  hideMetadataflowsMetadataflowExport,
  hideMetadataflowsMetadataflowExportReport,
  submitMetadataflowsMetadataflowClone,
  submitMetadataflowsMetadataflowExport
} from "./actions";
import {connect} from "react-redux";
import ArtefactDownloadForm from "../../../components/artefact-download-form";
import EnhancedModal from "../../../components/enhanced-modal";
import {
  ARTEFACT_TYPE_METADATAFLOW,
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
  metadataflow: state.scenes.metaManager.metadataflows.metadataflow,
  allAgencies: state.scenes.metaManager.metadataflows.allAgencies,
  downloadMetadataflowTriplets: state.scenes.metaManager.metadataflows.downloadMetadataflowTriplets,
  downloadMetadataflowLang: state.scenes.metaManager.metadataflows.downloadMetadataflowLang,
  downloadMetadataflowParams: state.scenes.metaManager.metadataflows.downloadMetadataflowParams,
  cloneDestTriplet: state.scenes.metaManager.metadataflows.cloneDestTriplet,
  metadataflowExportSourceTriplet: state.scenes.metaManager.metadataflows.metadataflowExportSourceTriplet,
  metadataflowExportDestination: state.scenes.metaManager.metadataflows.metadataflowExportDestination,
  metadataflowExportReport: state.scenes.metaManager.metadataflows.metadataflowExportReport
});

const mapDispatchToProps = dispatch => ({
  onDownloadHide: () => dispatch(hideMetadataflowsMetadataflowDownload()),
  onDownloadChange: fields => dispatch(changeMetadataflowsMetadataflowDownload(fields)),
  onDownload: (artefactTriplets, downloadMetadataflowParams, lang) =>
    dispatch(downloadMetadataflowsMetadataflow(artefactTriplets, downloadMetadataflowParams, lang)),
  onCloneHide: () => dispatch(hideMetadataflowsMetadataflowClone()),
  onCloneChange: fields => dispatch(changeMetadataflowsMetadataflowClone(fields)),
  onCloneSubmit: (cloneDestTriplet, srcMetadataflow) =>
    dispatch(submitMetadataflowsMetadataflowClone(cloneDestTriplet, srcMetadataflow)),
  onExportHide: () => dispatch(hideMetadataflowsMetadataflowExport()),
  onExportChange: fields => dispatch(changeMetadataflowsMetadataflowExport(fields)),
  onExportSubmit: (sourceTriplet, destination) => dispatch(submitMetadataflowsMetadataflowExport(sourceTriplet, destination)),
  onExportReportHide: () => dispatch(hideMetadataflowsMetadataflowExportReport())
});

const Metadataflows = ({
                         t,
                         dataLanguages,
                         metadataflow,
                         allAgencies,
                         downloadMetadataflowTriplets,
                         downloadMetadataflowLang,
                         downloadMetadataflowParams,
                         onDownloadHide,
                         onDownloadChange,
                         onDownload,
                         cloneDestTriplet,
                         onCloneHide,
                         onCloneChange,
                         onCloneSubmit,
                         metadataflowExportSourceTriplet,
                         metadataflowExportDestination,
                         onExportHide,
                         onExportChange,
                         onExportSubmit,
                         metadataflowExportReport,
                         onExportReportHide
                       }) =>
  <Fragment>
    <MetadataflowsList/>
    <MetadataflowDetail/>
    <EnhancedModal
      visible={downloadMetadataflowTriplets !== null && downloadMetadataflowTriplets !== undefined}
      onCancel={onDownloadHide}
      footer={
        <div>
          <Button onClick={onDownloadHide}>
            {t('commons.buttons.close.title')}
          </Button>
          <Button
            onClick={
              () => onDownload(downloadMetadataflowTriplets, downloadMetadataflowParams, downloadMetadataflowLang)
            }
            type="primary"
            disabled={
              (downloadMetadataflowParams && downloadMetadataflowParams.format === null) ||
              (downloadMetadataflowParams && downloadMetadataflowParams.format === DOWNLOAD_FORMAT_TYPE_CSV &&
                (
                  downloadMetadataflowParams.csvSeparator === null ||
                  downloadMetadataflowParams.csvSeparator.length !== 1 ||
                  downloadMetadataflowParams.csvLanguage === null
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
        downloadArtefactForm={downloadMetadataflowParams}
        onChange={onDownloadChange}
        options={getArtefactDownloadOptions(
          t,
          (downloadMetadataflowTriplets && downloadMetadataflowTriplets.length > 1)
            ? ARTEFACT_TYPE_MULTIPLE
            : ARTEFACT_TYPE_METADATAFLOW
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
            onClick={() => onCloneSubmit(cloneDestTriplet, metadataflow)}
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
        srcArtefact={metadataflow}
        destTriplet={cloneDestTriplet}
        onChange={onCloneChange}
      />
    </EnhancedModal>
    <EnhancedModal
      visible={metadataflowExportSourceTriplet !== null}
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
                metadataflowExportDestination &&
                metadataflowExportDestination.endpoint &&
                metadataflowExportDestination.username &&
                metadataflowExportDestination.id &&
                metadataflowExportDestination.agencyID &&
                metadataflowExportDestination.version &&
                isVersionValidWithHelp(f => f, metadataflowExportDestination.version).valid
              )
            }
            onClick={() => onExportSubmit(metadataflowExportSourceTriplet, metadataflowExportDestination)}
          >
            {t('commons.artefact.modals.export.buttons.submit.title')}
          </Button>
        </div>
      }
    >
      <ArtefactExportForm
        type='metadataflow'
        agencies={allAgencies}
        sourceTriplet={metadataflowExportSourceTriplet}
        destination={metadataflowExportDestination}
        onChange={onExportChange}
      />
    </EnhancedModal>
    <EnhancedModal
      visible={metadataflowExportReport !== null}
      title={t('commons.artefact.modals.exportReport.title')}
      width={MODAL_WIDTH_MD}
      onCancel={onExportReportHide}
      footer={<Button onClick={onExportReportHide}>{t('commons.buttons.close.title')}</Button>}
    >
      <ArtefactExportReport
        report={metadataflowExportReport}
      />
    </EnhancedModal>
  </Fragment>;

export default compose(
  translate(),
  connect(mapStateToProps, mapDispatchToProps)
)(Metadataflows);
