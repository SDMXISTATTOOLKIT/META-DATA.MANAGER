import React, {Fragment} from 'react';
import Call from "../../hocs/call";
import EnhancedModal from "../../components/enhanced-modal";
import {GUTTER_SM, MODAL_WIDTH_MD, MODAL_WIDTH_SM, MODAL_WIDTH_XL} from "../../styles/constants";
import {Alert, Button, Col, Modal, Row} from "antd";
import {compose} from "redux";
import {connect} from "react-redux";
import {translate} from 'react-i18next';
import {
  changeDsdDetail,
  changeDsdDetailClone,
  changeDsdDetailDownload,
  changeDsdDetailDsdExport,
  changeDsdDetailPrimaryMeasure,
  createDsdDetailAttribute,
  createDsdDetailDimension,
  createDsdDetailGroup,
  deleteDsdDetailAttribute,
  deleteDsdDetailDimension,
  deleteDsdDetailGroup,
  editDsdDetailAttribute,
  editDsdDetailDimension,
  editDsdDetailGroup,
  hideDsdDetail,
  hideDsdDetailClone,
  hideDsdDetailDownload,
  hideDsdDetailDsdExport,
  hideDsdDetailDsdExportReport,
  readDsdDetail,
  readDsdDetailAgencies,
  readDsdDetailCodelists,
  readDsdDetailConceptSchemes,
  showDsdDetailClone,
  showDsdDetailCodelistsForSelector,
  showDsdDetailConceptSchemesForSelector,
  showDsdDetailDownload,
  showDsdDetailDsdExport,
  submitDsdDetailClone,
  submitDsdDetailCreate,
  submitDsdDetailDownload,
  submitDsdDetailDsdExport,
  submitDsdDetailUpdate
} from "./actions";
import DsdDetail from "./dsd-detail";
import {
  ARTEFACT_FORM_MODE_CREATE,
  ARTEFACT_FORM_MODE_EDIT,
  ARTEFACT_FORM_MODE_READ
} from "../../components/artefact-form";
import ArtefactCloneForm from "../../components/artefact-clone-form";
import DsdsCodelistSelector from "./artefact-selectors/CodelistSelector";
import DsdsConceptSchemeSelector from "./artefact-selectors/ConceptSchemeSelector";
import DsdsConceptSelector from "./artefact-selectors/ConceptSelector";
import DsdsDimensionDetail from "./component-details/DimensionDetail";
import DsdsGroupDetail from "./component-details/GroupDetail";
import DsdsAttributeDetail from "./component-details/AttributeDetail";
import {DSD_DIMENSION_TYPE_NORMAL} from "../../utils/sdmxJson";
import {isArtefactValid, isVersionValidWithHelp} from "../../utils/artefactValidators";
import {reuseAction} from "../../utils/reduxReuse";
import ArtefactExportReport from "../../components/artefact-export-report";
import ArtefactExportForm from "../../components/artefact-export-form";
import {DSD_DETAIL_CODELIST_DETAIL_PREFIX, DSD_DETAIL_CONCEPT_SCHEME_DETAIL_PREFIX} from "./reducer";
import ReduxCodelistDetailModal from "../redux-codelist-detail-modal";
import {showCodelistDetail} from "../redux-codelist-detail-modal/actions";
import {showConceptSchemeDetail} from "../redux-concept-scheme-detail-modal/actions";
import ReduxConceptSchemeDetailModal from "../redux-concept-scheme-detail-modal";
import {DataLanguageConsumer} from "../../contexts/DataLanguage";
import ArtefactDownloadForm from "../../components/artefact-download-form";
import {ARTEFACT_TYPE_DSD, ARTEFACT_TYPE_MULTIPLE, getArtefactDownloadOptions} from "../../constants/download";

const mapStateToProps = (state, {instanceState}) => ({
  nodeId: state.app.endpointId,
  nodes: state.config.nodes,
  permissions: state.app.user.permissions,
  appLanguage: state.app.language,
  dataLanguages: state.config.dataManagement.dataLanguages,
  isVisible: instanceState.isVisible,
  isAgenciesValid: instanceState.isAgenciesValid,
  dsd: instanceState.dsd,
  dsdTriplet: instanceState.dsdTriplet,
  isEditDisabled: instanceState.isEditDisabled,
  agencies: instanceState.agencies,
  allAgencies: instanceState.allAgencies,
  cloneDestTriplet: instanceState.cloneDestTriplet,
  downloadDsdTriplets: instanceState.downloadDsdTriplets,
  downloadDsdLang: instanceState.downloadDsdLang,
  downloadDsdParams: instanceState.downloadDsdParams,
  dsdExportSourceTriplet: instanceState.dsdExportSourceTriplet,
  dsdExportDestination: instanceState.dsdExportDestination,
  dsdExportReport: instanceState.dsdExportReport,
  codelistDetail: instanceState.codelistDetail,
  conceptSchemeDetail: instanceState.conceptSchemeDetail
});

const mapDispatchToProps = (dispatch, {instancePrefix}) => ({
  onHide: () => dispatch(reuseAction(hideDsdDetail(), instancePrefix)),
  onDimensionCreate: () => dispatch(reuseAction(createDsdDetailDimension(), instancePrefix)),
  onDimensionDetail: id => dispatch(reuseAction(editDsdDetailDimension(id), instancePrefix)),
  onDimensionDelete: id => dispatch(reuseAction(deleteDsdDetailDimension(id), instancePrefix)),
  onGroupCreate: () => dispatch(reuseAction(createDsdDetailGroup(), instancePrefix)),
  onGroupDetail: id => dispatch(reuseAction(editDsdDetailGroup(id), instancePrefix)),
  onGroupDelete: id => dispatch(reuseAction(deleteDsdDetailGroup(id), instancePrefix)),
  onAttributeCreate: () => dispatch(reuseAction(createDsdDetailAttribute(), instancePrefix)),
  onAttributeDetail: id => dispatch(reuseAction(editDsdDetailAttribute(id), instancePrefix)),
  onAttributeDelete: id => dispatch(reuseAction(deleteDsdDetailAttribute(id), instancePrefix)),
  onConceptSchemeDetailShow: (conceptSchemeTriplet, defaultItemsViewMode) =>
    dispatch(reuseAction(showConceptSchemeDetail(conceptSchemeTriplet, defaultItemsViewMode), instancePrefix + DSD_DETAIL_CONCEPT_SCHEME_DETAIL_PREFIX)),
  onCodelistDetailShow: (codelistTriplet, defaultItemsViewMode) =>
    dispatch(reuseAction(showCodelistDetail(codelistTriplet, defaultItemsViewMode), instancePrefix + DSD_DETAIL_CODELIST_DETAIL_PREFIX)),
  onDownloadShow: (dsdTriplets, lang) => dispatch(reuseAction(showDsdDetailDownload(dsdTriplets, lang), instancePrefix)),
  onDownloadHide: () => dispatch(reuseAction(hideDsdDetailDownload(), instancePrefix)),
  onDownloadChange: fields => dispatch(reuseAction(changeDsdDetailDownload(fields), instancePrefix)),
  onDownloadSubmit: (artefactTriplets, downloadDsdParams, lang) =>
    dispatch(reuseAction(submitDsdDetailDownload(artefactTriplets, downloadDsdParams, lang), instancePrefix)),
  onCloneShow: artefactTriplet => dispatch(reuseAction(showDsdDetailClone(artefactTriplet), instancePrefix)),
  onCloneHide: () => dispatch(reuseAction(hideDsdDetailClone(), instancePrefix)),
  onCloneSubmit: (cloneDestTriplet, srcDsd) => dispatch(reuseAction(submitDsdDetailClone(cloneDestTriplet, srcDsd), instancePrefix)),
  onCloneChange: fields => dispatch(reuseAction(changeDsdDetailClone(fields), instancePrefix)),
  onConceptSchemesForSelectorShow: () => dispatch(reuseAction(showDsdDetailConceptSchemesForSelector(), instancePrefix)),
  onCodelistsForSelectorShow: () => dispatch(reuseAction(showDsdDetailCodelistsForSelector(), instancePrefix)),
  onPrimaryMeasureChange: fields => dispatch(reuseAction(changeDsdDetailPrimaryMeasure(fields), instancePrefix)),
  onChange: fields => dispatch(reuseAction(changeDsdDetail(fields), instancePrefix)),
  onSubmitCreate: dsd => dispatch(reuseAction(submitDsdDetailCreate(dsd), instancePrefix)),
  onSubmitUpdate: dsd => dispatch(reuseAction(submitDsdDetailUpdate(dsd), instancePrefix)),
  fetchAgencies: allowedAgencies => dispatch(reuseAction(readDsdDetailAgencies(allowedAgencies), instancePrefix)),
  fetchDsd: dsdTriplet => dispatch(reuseAction(readDsdDetail(dsdTriplet), instancePrefix)),
  fetchCodelists: () => dispatch(reuseAction(readDsdDetailCodelists(), instancePrefix)),
  fetchConceptSchemes: () => dispatch(reuseAction(readDsdDetailConceptSchemes(), instancePrefix)),
  onExportShow: sourceTriplet => dispatch(reuseAction(showDsdDetailDsdExport(sourceTriplet), instancePrefix)),
  onExportHide: () => dispatch(reuseAction(hideDsdDetailDsdExport(), instancePrefix)),
  onExportChange: fields => dispatch(reuseAction(changeDsdDetailDsdExport(fields), instancePrefix)),
  onExportSubmit: (sourceTriplet, destination) => dispatch(reuseAction(submitDsdDetailDsdExport(sourceTriplet, destination), instancePrefix)),
  onExportReportHide: () => dispatch(reuseAction(hideDsdDetailDsdExportReport(), instancePrefix))
});

const ReduxDsdDetailModal = ({
                               t,
                               nodeId,
                               nodes,
                               permissions,
                               appLanguage,
                               dataLanguages,
                               instanceState,
                               instancePrefix,
                               isVisible,
                               isAgenciesValid,
                               dsd,
                               dsdTriplet,
                               isEditDisabled,
                               agencies,
                               allAgencies,
                               codelistDetail,
                               conceptSchemeDetail,
                               onHide,
                               onChange,
                               onPrimaryMeasureChange,
                               onDimensionDetail,
                               onDimensionCreate,
                               onDimensionDelete,
                               onGroupDetail,
                               onGroupCreate,
                               onGroupDelete,
                               onAttributeDetail,
                               onAttributeCreate,
                               onAttributeDelete,
                               onSubmitCreate,
                               onSubmitUpdate,
                               onCodelistDetailShow,
                               onConceptSchemeDetailShow,
                               fetchDsd,
                               fetchCodelists,
                               fetchConceptSchemes,
                               fetchAgencies,
                               onCodelistsForSelectorShow,
                               onConceptSchemesForSelectorShow,
                               downloadDsdTriplets,
                               downloadDsdLang,
                               downloadDsdParams,
                               onDownloadShow,
                               onDownloadHide,
                               onDownloadChange,
                               onDownloadSubmit,
                               cloneDestTriplet,
                               onCloneShow,
                               onCloneHide,
                               onCloneSubmit,
                               onCloneChange,
                               dsdExportSourceTriplet,
                               dsdExportDestination,
                               dsdExportReport,
                               onExportShow,
                               onExportHide,
                               onExportChange,
                               onExportSubmit,
                               onExportReportHide
                             }) => {

  const getRelatedComponentId = id =>
    [
      ...(dsd.groups || []),
      ...(dsd.attributes || [])
    ].find(({groupDimensions, attachedDimensions, attachmentGroup}) =>
      (groupDimensions || attachedDimensions || (attachmentGroup ? [attachmentGroup] : null) || [])
        .find(compId => compId === id)
    );

  const isSubmitDisabled = !isArtefactValid(dsd);

  const userHasPermissionsToEdit = (
    permissions && dsdTriplet &&
    permissions.agencies.filter(agency => agency === dsdTriplet.agencyID).length > 0
  );

  const defaultItemsViewMode = nodes.find(node => node.general.id === nodeId).general.defaultItemsViewMode;

  return (
    <Fragment>
      <Call cb={fetchCodelists} disabled={!isVisible}>
        <Call cb={fetchConceptSchemes} disabled={!isVisible}>
          <DataLanguageConsumer>
            {dataLanguage => {
              const lang = dataLanguage || appLanguage;
              return (
                <Call
                  cb={fetchDsd}
                  cbParam={dsdTriplet}
                  disabled={dsdTriplet === null || dsd !== null}
                >
                  <Call
                    cb={fetchAgencies}
                    cbParam={permissions ? permissions.agencies : undefined}
                    disabled={isAgenciesValid}
                  >
                    <EnhancedModal
                      visible={isVisible}
                      width={MODAL_WIDTH_XL}
                      title={
                        dsdTriplet !== null
                          ? ((userHasPermissionsToEdit && !isEditDisabled)
                            ? t('reduxComponents.dsdDetail.title.editMode.title', {triplet: dsdTriplet})
                            : t('reduxComponents.dsdDetail.title.viewMode.title', {triplet: dsdTriplet})
                          )
                          : t('reduxComponents.dsdDetail.title.createMode.title')
                      }
                      onCancel={onHide}
                      footer={
                        <div>
                          <Button onClick={onHide}>{t('commons.buttons.close.title')}</Button>
                          {(dsdTriplet === null || userHasPermissionsToEdit) && !isEditDisabled && (
                            <Button
                              disabled={isSubmitDisabled}
                              type="primary"
                              onClick={
                                () => {
                                  if (dsd && dsd.primaryMeasure.id && dsd.primaryMeasure.concept &&
                                    dsd.dimensions && dsd.dimensions.length &&
                                    dsd.dimensions.find(({type}) => type === DSD_DIMENSION_TYPE_NORMAL)) {

                                    return dsdTriplet ? onSubmitUpdate(dsd) : onSubmitCreate(dsd)

                                  } else {

                                    return (
                                      Modal.warning({
                                        title: t('reduxComponents.dsdDetail.modals.warnings.submitIncomplete.title'),
                                        content: t('reduxComponents.dsdDetail.modals.warnings.submitIncomplete.content'),
                                      })
                                    );
                                  }
                                }
                              }
                            >
                              {t('commons.buttons.save.title')}
                            </Button>
                          )}
                        </div>
                      }
                      withDataLanguageSelector
                    >
                      {dsdTriplet && permissions && !userHasPermissionsToEdit && !isEditDisabled && (
                        <Alert
                          type="warning"
                          showIcon
                          message={t('commons.artefact.alerts.hasNotAgencyPermission')}
                        />
                      )}
                      {dsdTriplet && !isEditDisabled && (
                        <Row type="flex" gutter={GUTTER_SM} justify={"end"}>
                          {onDownloadShow && (
                            <Col>
                              <Button
                                type="primary"
                                shape="circle"
                                icon="download"
                                size="small"
                                title={t('commons.artefact.buttons.download.title')}
                                onClick={() => onDownloadShow([dsdTriplet], lang)}
                              />
                            </Col>
                          )}
                          {permissions && (
                            <Col>
                              <Button
                                type="primary"
                                shape="circle"
                                icon="copy"
                                size="small"
                                title={t('commons.artefact.buttons.clone.title')}
                                onClick={() => onCloneShow(dsdTriplet)}
                              />
                            </Col>
                          )}
                          <Col>
                            <Button
                              type="primary"
                              shape="circle"
                              icon="export"
                              size="small"
                              title={t('commons.artefact.buttons.export.title')}
                              onClick={() => onExportShow(dsdTriplet)}
                            />
                          </Col>
                        </Row>
                      )}
                      <DsdDetail
                        dsd={dsd}
                        mode={
                          dsdTriplet === null
                            ? ARTEFACT_FORM_MODE_CREATE
                            : (
                              (userHasPermissionsToEdit && !isEditDisabled)
                                ? ARTEFACT_FORM_MODE_EDIT
                                : ARTEFACT_FORM_MODE_READ
                            )
                        }
                        isComponentsDisabled={dsd && dsd.remoteIsFinal}
                        agencies={agencies}
                        onGeneralChange={onChange}
                        onPrimaryMeasureChange={onPrimaryMeasureChange}
                        onDimensionDetail={({id}) => onDimensionDetail(id)}
                        onDimensionCreate={onDimensionCreate}
                        onDimensionDelete={
                          ({id}) => Modal.confirm({
                            title: t('reduxComponents.dsdDetail.component.deleteConfirmModal.title'),
                            onOk() {
                              const relatedComponent = getRelatedComponentId(id);
                              relatedComponent
                                ? Modal.warning({
                                  title: t('reduxComponents.dsdDetail.component.deleteWarningModal.title'),
                                  content: t('reduxComponents.dsdDetail.component.deleteWarningModal.content', {
                                    component: relatedComponent.id
                                  })
                                })
                                : onDimensionDelete(id)
                            },
                            cancelText: t('commons.buttons.cancel.title')
                          })
                        }
                        onGroupDetail={({id}) => onGroupDetail(id)}
                        onGroupCreate={onGroupCreate}
                        onGroupDelete={
                          ({id}) => Modal.confirm({
                            title: t('reduxComponents.dsdDetail.component.deleteConfirmModal.title'),
                            onOk() {
                              const relatedComponent = getRelatedComponentId(id);
                              relatedComponent
                                ? Modal.warning({
                                  title: t('reduxComponents.dsdDetail.component.deleteWarningModal.title'),
                                  content: t('reduxComponents.dsdDetail.component.deleteWarningModal.content', {
                                    component: relatedComponent.id
                                  })
                                })
                                : onGroupDelete(id)
                            },
                            cancelText: t('commons.buttons.cancel.title')
                          })
                        }
                        onAttributeDetail={({id}) => onAttributeDetail(id)}
                        onAttributeCreate={onAttributeCreate}
                        onAttributeDelete={
                          ({id}) => Modal.confirm({
                            title: t('reduxComponents.dsdDetail.component.deleteConfirmModal.title'),
                            onOk() {
                              onAttributeDelete(id);
                            },
                            cancelText: t('commons.buttons.cancel.title')
                          })
                        }
                        onCodelistDetail={codelistTriplet => onCodelistDetailShow(codelistTriplet, defaultItemsViewMode)}
                        onConceptDetail={codelistTriplet => onConceptSchemeDetailShow(codelistTriplet, defaultItemsViewMode)}
                        onConceptSchemeDetail={conceptSchemeTriplet => onConceptSchemeDetailShow(conceptSchemeTriplet, defaultItemsViewMode)}
                        onPrimaryMeasureCodelistSelect={onCodelistsForSelectorShow}
                        onPrimaryMeasureConceptSelect={onConceptSchemesForSelectorShow}
                      />
                      <DsdsDimensionDetail
                        userHasPermissionsToEdit={userHasPermissionsToEdit && !isEditDisabled}
                        instanceState={instanceState}
                        instancePrefix={instancePrefix}
                      />
                      <DsdsGroupDetail
                        userHasPermissionsToEdit={userHasPermissionsToEdit && !isEditDisabled}
                        instanceState={instanceState}
                        instancePrefix={instancePrefix}
                      />
                      <DsdsAttributeDetail
                        userHasPermissionsToEdit={userHasPermissionsToEdit && !isEditDisabled}
                        instanceState={instanceState}
                        instancePrefix={instancePrefix}
                      />
                      <ReduxCodelistDetailModal
                        instancePrefix={instancePrefix + DSD_DETAIL_CODELIST_DETAIL_PREFIX}
                        instanceState={codelistDetail}
                      />
                      <ReduxConceptSchemeDetailModal
                        instancePrefix={instancePrefix + DSD_DETAIL_CONCEPT_SCHEME_DETAIL_PREFIX}
                        instanceState={conceptSchemeDetail}
                      />
                      <DsdsConceptSelector instanceState={instanceState} instancePrefix={instancePrefix}/>
                      <DsdsCodelistSelector instanceState={instanceState} instancePrefix={instancePrefix}/>
                      <DsdsConceptSchemeSelector instanceState={instanceState} instancePrefix={instancePrefix}/>
                    </EnhancedModal>
                  </Call>
                </Call>
              )
            }}
          </DataLanguageConsumer>
        </Call>
      </Call>
      <EnhancedModal
        visible={downloadDsdTriplets !== null && downloadDsdTriplets !== undefined}
        onCancel={onDownloadHide}
        footer={
          <div>
            <Button onClick={onDownloadHide}>
              {t('commons.buttons.close.title')}
            </Button>
            <Button
              onClick={
                () => onDownloadSubmit(downloadDsdTriplets, downloadDsdParams, downloadDsdLang)
              }
              type="primary"
              disabled={downloadDsdParams && downloadDsdParams.format === null}
            >
              {t('commons.buttons.download.title')}
            </Button>
          </div>
        }
        width={MODAL_WIDTH_SM}
        title={t('scenes.metaManager.commons.modals.download.title')}
      >
        <ArtefactDownloadForm
          downloadArtefactForm={downloadDsdParams}
          onChange={onDownloadChange}
          options={getArtefactDownloadOptions(
            t,
            (downloadDsdTriplets && downloadDsdTriplets.length > 1)
              ? ARTEFACT_TYPE_MULTIPLE
              : ARTEFACT_TYPE_DSD
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
              onClick={() => onCloneSubmit(cloneDestTriplet, dsd)}
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
          srcArtefact={dsd}
          destTriplet={cloneDestTriplet}
          onChange={onCloneChange}
        />
      </EnhancedModal>
      <EnhancedModal
        visible={dsdExportSourceTriplet !== null}
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
                  dsdExportDestination &&
                  dsdExportDestination.endpoint &&
                  dsdExportDestination.username &&
                  dsdExportDestination.id &&
                  dsdExportDestination.agencyID &&
                  dsdExportDestination.version &&
                  isVersionValidWithHelp(f => f, dsdExportDestination.version).valid
                )
              }
              onClick={() => onExportSubmit(dsdExportSourceTriplet, dsdExportDestination)}
            >
              {t('commons.artefact.modals.export.buttons.submit.title')}
            </Button>
          </div>
        }
      >
        <ArtefactExportForm
          type='datastructure'
          agencies={allAgencies}
          sourceTriplet={dsdExportSourceTriplet}
          destination={dsdExportDestination}
          onChange={onExportChange}
          withReferences
        />
      </EnhancedModal>
      <EnhancedModal
        visible={dsdExportReport !== null}
        title={t('commons.artefact.modals.exportReport.title')}
        width={MODAL_WIDTH_MD}
        onCancel={onExportReportHide}
        footer={<Button onClick={onExportReportHide}>{t('commons.buttons.close.title')}</Button>}
      >
        <ArtefactExportReport
          report={dsdExportReport}
        />
      </EnhancedModal>
    </Fragment>
  );
};

export default compose(
  translate(),
  connect(mapStateToProps, mapDispatchToProps)
)(ReduxDsdDetailModal);
