import React from "react";
import {translate} from 'react-i18next';
import Call from "../../../hocs/call";
import {connect} from "react-redux";
import {compose} from "redux";
import ArtefactList from "../../../components/artefact-list";
import {
  changeMsdsMsdDownload,
  deleteMsdsMsd,
  deleteMsdsSelectedMsds,
  downloadMsdsMsd,
  hideMsdsMsdDownload,
  hideMsdsMsdParentsAndChildren,
  readMsdsListMsds,
  readMsdsMsdParentsAndChildren,
  showMsdsMsdDetail,
  showMsdsMsdDownload
} from "./actions";
import {Button} from "antd";
import {
  ARTEFACT_TYPE_MSD,
  ARTEFACT_TYPE_MULTIPLE,
  DOWNLOAD_FORMAT_TYPE_CSV,
  getArtefactDownloadOptions
} from "../../../constants/download";
import {MODAL_WIDTH_SM} from "../../../styles/constants";
import ArtefactDownloadForm from "../../../components/artefact-download-form";
import EnhancedModal from "../../../components/enhanced-modal";

const mapStateToProps = state => ({
  msds: state.scenes.metaManager.msds.msds,
  downloadMsdParams: state.scenes.metaManager.msds.downloadMsdParams,
  downloadMsdTriplets: state.scenes.metaManager.msds.downloadMsdTriplets,
  downloadMsdLang: state.scenes.metaManager.msds.downloadMsdLang,
  parentsAndChildren: state.scenes.metaManager.msds.parentsAndChildren
});

const mapDispatchToProps = dispatch => ({
  fetchMsds: () => dispatch(readMsdsListMsds()),
  onMsdShow: msdTriplet => dispatch(showMsdsMsdDetail(msdTriplet)),
  onDelete: msdTriplet => dispatch(deleteMsdsMsd(msdTriplet)),
  onSelectedMsdsDelete: msdTriplets => dispatch(deleteMsdsSelectedMsds(msdTriplets)),
  onDownloadShow: (msdTriplets, lang) => dispatch(showMsdsMsdDownload(msdTriplets, lang)),
  onDownloadHide: () => dispatch(hideMsdsMsdDownload()),
  onDownloadChange: fields => dispatch(changeMsdsMsdDownload(fields)),
  onDownload: (msdTriplets, downloadMsdParams, lang) =>
    dispatch(downloadMsdsMsd(msdTriplets, downloadMsdParams, lang)),
  fetchParentsAndChildren: (artefactType, artefactTriplet) =>
    dispatch(readMsdsMsdParentsAndChildren(artefactType, artefactTriplet)),
  onParentsAndChildrenHide: () => dispatch(hideMsdsMsdParentsAndChildren())
});

const MsdsList = ({
                    t,
                    msds,
                    downloadMsdParams,
                    downloadMsdTriplets,
                    downloadMsdLang,
                    fetchMsds,
                    onMsdShow,
                    onDelete,
                    onSelectedMsdsDelete,
                    onDownloadShow,
                    onDownloadHide,
                    onDownloadChange,
                    onDownload,
                    parentsAndChildren,
                    fetchParentsAndChildren,
                    onParentsAndChildrenHide
                  }) =>
  <Call cb={fetchMsds} disabled={msds !== null}>
    <ArtefactList
      artefacts={msds}
      onDetailShow={onMsdShow}
      onDownloadShow={onDownloadShow}
      onDelete={onDelete}
      onSelectedItemDelete={onSelectedMsdsDelete}
      parentsAndChildren={parentsAndChildren}
      fetchParentsAndChildren={triplet => fetchParentsAndChildren("metadatastructure", triplet)}
      onParentsAndChildrenHide={onParentsAndChildrenHide}
      showImportButton
    />
    <EnhancedModal
      visible={downloadMsdTriplets !== null && downloadMsdTriplets !== undefined}
      onCancel={onDownloadHide}
      footer={
        <div>
          <Button onClick={onDownloadHide}>
            {t('commons.buttons.close.title')}
          </Button>
          <Button
            onClick={
              () => onDownload(downloadMsdTriplets, downloadMsdParams, downloadMsdLang)
            }
            type="primary"
            disabled={
              (downloadMsdParams && downloadMsdParams.format === null) ||
              (downloadMsdParams && downloadMsdParams.format === DOWNLOAD_FORMAT_TYPE_CSV &&
                (
                  downloadMsdParams.csvSeparator === null ||
                  downloadMsdParams.csvSeparator.length !== 1 ||
                  downloadMsdParams.csvLanguage === null
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
        downloadArtefactForm={downloadMsdParams}
        onChange={onDownloadChange}
        options={getArtefactDownloadOptions(
          t,
          (downloadMsdTriplets && downloadMsdTriplets.length > 1)
            ? ARTEFACT_TYPE_MULTIPLE
            : ARTEFACT_TYPE_MSD
        )}
        hasReferences
      />
    </EnhancedModal>
  </Call>;

export default compose(
  translate(),
  connect(mapStateToProps, mapDispatchToProps)
)(MsdsList);
