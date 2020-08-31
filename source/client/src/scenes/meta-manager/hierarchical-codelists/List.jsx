import React from "react";
import {translate} from 'react-i18next';
import Call from "../../../hocs/call";
import {connect} from "react-redux";
import {compose} from "redux";
import ArtefactList from "../../../components/artefact-list";
import {
  changeHierarchicalCodelistsHierarchicalCodelistDownload,
  deleteHierarchicalCodelistsHierarchicalCodelist,
  deleteHierarchicalCodelistsSelectedHierarchicalCodelists,
  downloadHierarchicalCodelistsHierarchicalCodelist,
  hideHierarchicalCodelistsHierarchicalCodelistDownload,
  hideHierarchicalCodelistsHierarchicalCodelistParentsAndChildren,
  readHierarchicalCodelistsListHierarchicalCodelists,
  readHierarchicalCodelistsHierarchicalCodelistParentsAndChildren,
  showHierarchicalCodelistsHierarchicalCodelistDetail,
  showHierarchicalCodelistsHierarchicalCodelistDownload
} from "./actions";
import {Button} from "antd";
import {
  ARTEFACT_TYPE_HIERARCHICAL_CODELIST,
  ARTEFACT_TYPE_MULTIPLE,
  DOWNLOAD_FORMAT_TYPE_CSV,
  getArtefactDownloadOptions
} from "../../../constants/download";
import {MODAL_WIDTH_SM} from "../../../styles/constants";
import ArtefactDownloadForm from "../../../components/artefact-download-form";
import EnhancedModal from "../../../components/enhanced-modal";

const mapStateToProps = state => ({
  hierarchicalCodelists: state.scenes.metaManager.hierarchicalCodelists.hierarchicalCodelists,
  downloadHierarchicalCodelistParams: state.scenes.metaManager.hierarchicalCodelists.downloadHierarchicalCodelistParams,
  downloadHierarchicalCodelistTriplets: state.scenes.metaManager.hierarchicalCodelists.downloadHierarchicalCodelistTriplets,
  downloadHierarchicalCodelistLang: state.scenes.metaManager.hierarchicalCodelists.downloadHierarchicalCodelistLang,
  parentsAndChildren: state.scenes.metaManager.hierarchicalCodelists.parentsAndChildren
});

const mapDispatchToProps = dispatch => ({
  fetchHierarchicalCodelists: () => dispatch(readHierarchicalCodelistsListHierarchicalCodelists()),
  onHierarchicalCodelistShow: hierarchicalCodelistTriplet => dispatch(showHierarchicalCodelistsHierarchicalCodelistDetail(hierarchicalCodelistTriplet)),
  onDelete: hierarchicalCodelistTriplet => dispatch(deleteHierarchicalCodelistsHierarchicalCodelist(hierarchicalCodelistTriplet)),
  onSelectedHierarchicalCodelistsDelete: hierarchicalCodelistTriplets => dispatch(deleteHierarchicalCodelistsSelectedHierarchicalCodelists(hierarchicalCodelistTriplets)),
  onDownloadShow: (hierarchicalCodelistTriplets, lang) => dispatch(showHierarchicalCodelistsHierarchicalCodelistDownload(hierarchicalCodelistTriplets, lang)),
  onDownloadHide: () => dispatch(hideHierarchicalCodelistsHierarchicalCodelistDownload()),
  onDownloadChange: fields => dispatch(changeHierarchicalCodelistsHierarchicalCodelistDownload(fields)),
  onDownload: (hierarchicalCodelistTriplets, downloadHierarchicalCodelistParams, lang) =>
    dispatch(downloadHierarchicalCodelistsHierarchicalCodelist(hierarchicalCodelistTriplets, downloadHierarchicalCodelistParams, lang)),
  fetchParentsAndChildren: (artefactType, artefactTriplet) =>
    dispatch(readHierarchicalCodelistsHierarchicalCodelistParentsAndChildren(artefactType, artefactTriplet)),
  onParentsAndChildrenHide: () => dispatch(hideHierarchicalCodelistsHierarchicalCodelistParentsAndChildren())
});

const HierarchicalCodelistsList = ({
                    t,
                    hierarchicalCodelists,
                    downloadHierarchicalCodelistParams,
                    downloadHierarchicalCodelistTriplets,
                    downloadHierarchicalCodelistLang,
                    fetchHierarchicalCodelists,
                    onHierarchicalCodelistShow,
                    onDelete,
                    onSelectedHierarchicalCodelistsDelete,
                    onDownloadShow,
                    onDownloadHide,
                    onDownloadChange,
                    onDownload,
                    parentsAndChildren,
                    fetchParentsAndChildren,
                    onParentsAndChildrenHide
                  }) =>
  <Call cb={fetchHierarchicalCodelists} disabled={hierarchicalCodelists !== null}>
    <ArtefactList
      artefacts={hierarchicalCodelists}
      onDetailShow={onHierarchicalCodelistShow}
      onDownloadShow={onDownloadShow}
      onDelete={onDelete}
      onSelectedItemDelete={onSelectedHierarchicalCodelistsDelete}
      parentsAndChildren={parentsAndChildren}
      fetchParentsAndChildren={triplet => fetchParentsAndChildren("hierarchicalCodelist", triplet)}
      onParentsAndChildrenHide={onParentsAndChildrenHide}
      showImportButton
    />
    <EnhancedModal
      visible={downloadHierarchicalCodelistTriplets !== null && downloadHierarchicalCodelistTriplets !== undefined}
      onCancel={onDownloadHide}
      footer={
        <div>
          <Button onClick={onDownloadHide}>
            {t('commons.buttons.close.title')}
          </Button>
          <Button
            onClick={
              () => onDownload(downloadHierarchicalCodelistTriplets, downloadHierarchicalCodelistParams, downloadHierarchicalCodelistLang)
            }
            type="primary"
            disabled={
              (downloadHierarchicalCodelistParams && downloadHierarchicalCodelistParams.format === null) ||
              (downloadHierarchicalCodelistParams && downloadHierarchicalCodelistParams.format === DOWNLOAD_FORMAT_TYPE_CSV &&
                (
                  downloadHierarchicalCodelistParams.csvSeparator === null ||
                  downloadHierarchicalCodelistParams.csvSeparator.length !== 1 ||
                  downloadHierarchicalCodelistParams.csvLanguage === null
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
        downloadArtefactForm={downloadHierarchicalCodelistParams}
        onChange={onDownloadChange}
        options={getArtefactDownloadOptions(
          t,
          (downloadHierarchicalCodelistTriplets && downloadHierarchicalCodelistTriplets.length > 1)
            ? ARTEFACT_TYPE_MULTIPLE
            : ARTEFACT_TYPE_HIERARCHICAL_CODELIST
        )}
        hasReferences
      />
    </EnhancedModal>
  </Call>;

export default compose(
  translate(),
  connect(mapStateToProps, mapDispatchToProps)
)(HierarchicalCodelistsList);
