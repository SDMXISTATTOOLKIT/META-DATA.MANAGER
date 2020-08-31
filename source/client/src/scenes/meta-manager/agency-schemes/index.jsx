import React, {Fragment} from 'react';
import {Button} from "antd";
import {MODAL_WIDTH_MD, MODAL_WIDTH_SM} from "../../../styles/constants";
import AgencySchemesList from "./List";
import {compose} from "redux";
import {translate} from 'react-i18next';
import AgencySchemeDetail from "./Detail";
import {
  changeAgencySchemesAgencySchemeClone,
  changeAgencySchemesAgencySchemeDownload,
  changeAgencySchemesAgencySchemeExport,
  downloadAgencySchemesAgencyScheme,
  hideAgencySchemesAgencySchemeClone,
  hideAgencySchemesAgencySchemeDownload,
  hideAgencySchemesAgencySchemeExport,
  hideAgencySchemesAgencySchemeExportReport,
  submitAgencySchemesAgencySchemeClone,
  submitAgencySchemesAgencySchemeExport
} from "./actions";
import {connect} from "react-redux";
import ArtefactDownloadForm from "../../../components/artefact-download-form";
import EnhancedModal from "../../../components/enhanced-modal";
import {
  ARTEFACT_TYPE_AGENCY_SCHEME,
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
  allAgencies: state.scenes.metaManager.agencySchemes.allAgencies,
  agencyScheme: state.scenes.metaManager.agencySchemes.agencyScheme,
  itemsTree: state.scenes.metaManager.agencySchemes.itemsTree,
  downloadAgencySchemeTriplets: state.scenes.metaManager.agencySchemes.downloadAgencySchemeTriplets,
  downloadAgencySchemeLang: state.scenes.metaManager.agencySchemes.downloadAgencySchemeLang,
  downloadAgencySchemeParams: state.scenes.metaManager.agencySchemes.downloadAgencySchemeParams,
  cloneDestTriplet: state.scenes.metaManager.agencySchemes.cloneDestTriplet,
  agencySchemeExportSourceTriplet: state.scenes.metaManager.agencySchemes.agencySchemeExportSourceTriplet,
  agencySchemeExportDestination: state.scenes.metaManager.agencySchemes.agencySchemeExportDestination,
  agencySchemeExportReport: state.scenes.metaManager.agencySchemes.agencySchemeExportReport
});

const mapDispatchToProps = dispatch => ({
  onAgencySchemeDownloadHide: () => dispatch(hideAgencySchemesAgencySchemeDownload()),
  onAgencySchemeDownloadChange: fields => dispatch(changeAgencySchemesAgencySchemeDownload(fields)),
  onAgencySchemeDownload: (artefactTriplets, downloadAgencySchemeParams, lang) =>
    dispatch(downloadAgencySchemesAgencyScheme(artefactTriplets, downloadAgencySchemeParams, lang)),
  onAgencySchemeCloneHide: () => dispatch(hideAgencySchemesAgencySchemeClone()),
  onAgencySchemeCloneChange: fields => dispatch(changeAgencySchemesAgencySchemeClone(fields)),
  onAgencySchemeCloneSubmit: (cloneDestTriplet, srcAgencyScheme, srcAgencySchemeItemsTree) =>
    dispatch(submitAgencySchemesAgencySchemeClone(cloneDestTriplet, srcAgencyScheme, srcAgencySchemeItemsTree)),
  onAgencySchemeExportHide: () => dispatch(hideAgencySchemesAgencySchemeExport()),
  onAgencySchemeExportChange: fields => dispatch(changeAgencySchemesAgencySchemeExport(fields)),
  onAgencySchemeExportSubmit: (sourceTriplet, destination) => dispatch(submitAgencySchemesAgencySchemeExport(sourceTriplet, destination)),
  onAgencySchemeExportReportHide: () => dispatch(hideAgencySchemesAgencySchemeExportReport()),
});

const AgencySchemes = ({
                         t,
                         allAgencies,
                         dataLanguages,
                         agencyScheme,
                         itemsTree,
                         downloadAgencySchemeTriplets,
                         downloadAgencySchemeLang,
                         downloadAgencySchemeParams,
                         onAgencySchemeDownloadHide,
                         onAgencySchemeDownloadChange,
                         onAgencySchemeDownload,
                         cloneDestTriplet,
                         onAgencySchemeCloneHide,
                         onAgencySchemeCloneChange,
                         onAgencySchemeCloneSubmit,
                         agencySchemeExportSourceTriplet,
                         agencySchemeExportDestination,
                         onAgencySchemeExportChange,
                         onAgencySchemeExportSubmit,
                         onAgencySchemeExportHide,
                         agencySchemeExportReport,
                         onAgencySchemeExportReportHide
                       }) =>
  <Fragment>
    <AgencySchemesList/>
    <AgencySchemeDetail/>
    <EnhancedModal
      visible={downloadAgencySchemeTriplets !== null && downloadAgencySchemeTriplets !== undefined}
      onCancel={onAgencySchemeDownloadHide}
      footer={
        <div>
          <Button onClick={onAgencySchemeDownloadHide}>
            {t('commons.buttons.close.title')}
          </Button>
          <Button
            onClick={
              () => onAgencySchemeDownload(downloadAgencySchemeTriplets, downloadAgencySchemeParams, downloadAgencySchemeLang)
            }
            type="primary"
            disabled={
              (downloadAgencySchemeParams && downloadAgencySchemeParams.format === null) ||
              (downloadAgencySchemeParams && downloadAgencySchemeParams.format === DOWNLOAD_FORMAT_TYPE_CSV &&
                (
                  downloadAgencySchemeParams.csvSeparator === null ||
                  downloadAgencySchemeParams.csvSeparator.length !== 1 ||
                  downloadAgencySchemeParams.csvLanguage === null
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
        downloadArtefactForm={downloadAgencySchemeParams}
        onChange={onAgencySchemeDownloadChange}
        options={getArtefactDownloadOptions(
          t,
          (downloadAgencySchemeTriplets && downloadAgencySchemeTriplets.length > 1)
            ? ARTEFACT_TYPE_MULTIPLE
            : ARTEFACT_TYPE_AGENCY_SCHEME
        )}
        langs={dataLanguages}
      />
    </EnhancedModal>
    <EnhancedModal
      visible={cloneDestTriplet !== null}
      width={MODAL_WIDTH_MD}
      title={t('commons.artefact.modals.clone.title')}
      onCancel={onAgencySchemeCloneHide}
      footer={
        <div>
          <Button onClick={onAgencySchemeCloneHide}>
            {t('commons.buttons.close.title')}
          </Button>
          <Button
            onClick={() => onAgencySchemeCloneSubmit(cloneDestTriplet, agencyScheme, itemsTree)}
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
        srcArtefact={agencyScheme}
        destTriplet={cloneDestTriplet}
        isIdDisabled
        isVersionDisabled
        onChange={onAgencySchemeCloneChange}
      />
    </EnhancedModal>
    <EnhancedModal
      visible={agencySchemeExportSourceTriplet !== null}
      title={t('commons.artefact.modals.export.title')}
      width={MODAL_WIDTH_MD}
      onCancel={onAgencySchemeExportHide}
      footer={
        <div>
          <Button onClick={onAgencySchemeExportHide}>{t('commons.buttons.close.title')}</Button>
          <Button
            type="primary"
            disabled={
              !(
                agencySchemeExportDestination &&
                agencySchemeExportDestination.endpoint &&
                agencySchemeExportDestination.username &&
                agencySchemeExportDestination.id &&
                agencySchemeExportDestination.agencyID &&
                agencySchemeExportDestination.version &&
                isVersionValidWithHelp(f => f, agencySchemeExportDestination.version).valid
              )
            }
            onClick={() => onAgencySchemeExportSubmit(agencySchemeExportSourceTriplet, agencySchemeExportDestination)}
          >
            {t('commons.artefact.modals.export.buttons.submit.title')}
          </Button>
        </div>
      }
    >
      <ArtefactExportForm
        type='agencyscheme'
        agencies={allAgencies}
        sourceTriplet={agencySchemeExportSourceTriplet}
        destination={agencySchemeExportDestination}
        onChange={onAgencySchemeExportChange}
        isIdDisabled
        isVersionDisabled
      />
    </EnhancedModal>
    <EnhancedModal
      visible={agencySchemeExportReport !== null}
      title={t('commons.artefact.modals.exportReport.title')}
      width={MODAL_WIDTH_MD}
      onCancel={onAgencySchemeExportReportHide}
      footer={<Button onClick={onAgencySchemeExportReportHide}>{t('commons.buttons.close.title')}</Button>}
    >
      <ArtefactExportReport
        report={agencySchemeExportReport}
      />
    </EnhancedModal>
  </Fragment>;

export default compose(
  translate(),
  connect(mapStateToProps, mapDispatchToProps)
)(AgencySchemes);
