import React, {Fragment} from 'react';
import {GUTTER_SM, MODAL_WIDTH_MD, MODAL_WIDTH_SM, MODAL_WIDTH_XL} from "../../styles/constants";
import EnhancedModal from '../../components/enhanced-modal';
import {compose} from "redux";
import {connect} from "react-redux";
import {translate} from 'react-i18next';
import {
  changeConceptSchemeDetail,
  changeConceptSchemeDetailClone,
  changeConceptSchemeDetailConceptSchemeLanguage,
  changeConceptSchemeDetailDownload,
  changeConceptSchemeDetailExport,
  focusConceptSchemeDetailDerivedTab,
  hideConceptSchemeDetail,
  hideConceptSchemeDetailClone,
  hideConceptSchemeDetailDownload,
  hideConceptSchemeDetailExport,
  hideConceptSchemeDetailExportReport,
  readConceptSchemeDetail,
  readConceptSchemeDetailAgencies,
  showConceptSchemeDetailClone,
  showConceptSchemeDetailDownload,
  showConceptSchemeDetailExport,
  submitConceptSchemeDetailClone,
  submitConceptSchemeDetailCreate,
  submitConceptSchemeDetailDerivedItemSchemeCreate,
  submitConceptSchemeDetailDownload,
  submitConceptSchemeDetailExport,
  submitConceptSchemeDetailUpdate,
  unfocusConceptSchemeDetailDerivedTab
} from "./actions";
import {Alert, Button, Col, Modal, Row, Tabs} from "antd";
import ArtefactForm, {
  ARTEFACT_FORM_MODE_CREATE,
  ARTEFACT_FORM_MODE_EDIT,
  ARTEFACT_FORM_MODE_READ
} from '../../components/artefact-form';
import Call from "../../hocs/call";
import ConceptSchemesDetailItems from "./Items";
import {DataLanguageConsumer} from "../../contexts/DataLanguage";
import ArtefactCloneForm from "../../components/artefact-clone-form";
import {isArtefactValid, isVersionValidWithHelp} from "../../utils/artefactValidators";
import ArtefactExportForm from "../../components/artefact-export-form";
import ArtefactExportReport from "../../components/artefact-export-report";
import {reuseAction} from "../../utils/reduxReuse";
import {REDUX_CONCEPT_SCHEMES_DETAIL_DERIVED_IS_PREFIX} from "./reducer";
import ReduxDerivedItemScheme from "../redux-derived-item-scheme";
import {resetDerivedItemSchemeState} from "../redux-derived-item-scheme/actions";
import {
  ARTEFACT_TYPE_CONCEPT_SCHEME,
  ARTEFACT_TYPE_MULTIPLE,
  DOWNLOAD_FORMAT_TYPE_CSV,
  getArtefactDownloadOptions
} from "../../constants/download";
import ArtefactDownloadForm from "../../components/artefact-download-form";

const mapStateToProps = (state, {instanceState}) => ({
  nodes: state.config.nodes,
  nodeId: state.app.endpointId,
  permissions: state.app.user.permissions,
  appLanguage: state.app.language,
  dataLanguages: state.config.dataManagement.dataLanguages,
  isVisible: instanceState.isVisible,
  forceIsFinalDisabled: instanceState.forceIsFinalDisabled,
  isEditDisabled: instanceState.isEditDisabled,
  conceptSchemeTriplet: instanceState.conceptSchemeTriplet,
  isConceptSchemeValid: instanceState.isConceptSchemeValid,
  isAgenciesValid: instanceState.isAgenciesValid,
  isConceptSchemeGeneralTabDirty: instanceState.isConceptSchemeGeneralTabDirty,
  conceptScheme: instanceState.conceptScheme,
  agencies: instanceState.agencies,
  allAgencies: instanceState.allAgencies,
  itemsTree: instanceState.itemsTree,
  focusItemsTab: instanceState.focusItemsTab,
  downloadConceptSchemeTriplets: instanceState.downloadConceptSchemeTriplets,
  downloadConceptSchemeLang: instanceState.downloadConceptSchemeLang,
  downloadConceptSchemeParams: instanceState.downloadConceptSchemeParams,
  cloneDestTriplet: instanceState.cloneDestTriplet,
  conceptSchemeExportSourceTriplet: instanceState.conceptSchemeExportSourceTriplet,
  conceptSchemeExportDestination: instanceState.conceptSchemeExportDestination,
  conceptSchemeExportReport: instanceState.conceptSchemeExportReport,
  derivedConceptScheme: instanceState.derivedConceptScheme,
  isDerivedTabFocused: instanceState.isDerivedTabFocused
});

const mapDispatchToProps = (dispatch, {instancePrefix}) => ({
  onDetailHide: () => dispatch(reuseAction(hideConceptSchemeDetail(), instancePrefix)),
  onDetailChange: fields => dispatch(reuseAction(changeConceptSchemeDetail(fields), instancePrefix)),
  onDetailCreate: (conceptScheme, conceptSchemeTriplet) =>
    dispatch(reuseAction(submitConceptSchemeDetailCreate(conceptScheme, conceptSchemeTriplet), instancePrefix)),
  onDetailUpdate: (conceptScheme, itemsTree, itemsOrderAnnotationType) =>
    dispatch(reuseAction(submitConceptSchemeDetailUpdate(conceptScheme, itemsTree, itemsOrderAnnotationType), instancePrefix)),
  fetchConceptScheme: ({conceptSchemeTriplet, itemsOrderAnnotationType, lang}) =>
    dispatch(reuseAction(readConceptSchemeDetail(conceptSchemeTriplet, itemsOrderAnnotationType, lang), instancePrefix)),
  fetchAgencies: allowedAgencies => dispatch(reuseAction(readConceptSchemeDetailAgencies(allowedAgencies), instancePrefix)),
  onLanguageChange: (lang, itemsOrderAnnotationType) =>
    dispatch(reuseAction(changeConceptSchemeDetailConceptSchemeLanguage(lang, itemsOrderAnnotationType), instancePrefix)),
  onDownloadShow: (artefactTriplets, lang) => dispatch(reuseAction(showConceptSchemeDetailDownload(artefactTriplets, lang), instancePrefix)),
  onDownloadHide: () => dispatch(reuseAction(hideConceptSchemeDetailDownload(), instancePrefix)),
  onDownloadChange: fields => dispatch(reuseAction(changeConceptSchemeDetailDownload(fields), instancePrefix)),
  onDownloadSubmit: (artefactTriplets, downloadConceptSchemeParams, lang) =>
    dispatch(reuseAction(submitConceptSchemeDetailDownload(artefactTriplets, downloadConceptSchemeParams, lang), instancePrefix)),
  onCloneShow: artefactTriplet => dispatch(reuseAction(showConceptSchemeDetailClone(artefactTriplet), instancePrefix)),
  onCloneHide: () => dispatch(reuseAction(hideConceptSchemeDetailClone(), instancePrefix)),
  onCloneChange: fields => dispatch(reuseAction(changeConceptSchemeDetailClone(fields), instancePrefix)),
  onCloneSubmit: (cloneDestTriplet, srcConceptScheme, srcConceptSchemeItemsTree) =>
    dispatch(reuseAction(submitConceptSchemeDetailClone(cloneDestTriplet, srcConceptScheme, srcConceptSchemeItemsTree), instancePrefix)),
  onExportShow: sourceTriplet => dispatch(reuseAction(showConceptSchemeDetailExport(sourceTriplet), instancePrefix)),
  onExportHide: () => dispatch(reuseAction(hideConceptSchemeDetailExport(), instancePrefix)),
  onExportChange: fields => dispatch(reuseAction(changeConceptSchemeDetailExport(fields), instancePrefix)),
  onExportSubmit: (sourceTriplet, destination) => dispatch(reuseAction(submitConceptSchemeDetailExport(sourceTriplet, destination), instancePrefix)),
  onExportReportHide: () => dispatch(reuseAction(hideConceptSchemeDetailExportReport(), instancePrefix)),
  onDerivedItemSchemeCreateSubmit: (derivedConceptScheme, derivedItems) =>
    dispatch(reuseAction(submitConceptSchemeDetailDerivedItemSchemeCreate(derivedConceptScheme, derivedItems), instancePrefix)),
  onDerivedItemSchemeStateReset: () => dispatch(reuseAction(resetDerivedItemSchemeState(), instancePrefix + REDUX_CONCEPT_SCHEMES_DETAIL_DERIVED_IS_PREFIX)),
  onDerivedTabFocus: () => dispatch(reuseAction(focusConceptSchemeDetailDerivedTab(), instancePrefix)),
  onDerivedTabUnfocus: () => dispatch(reuseAction(unfocusConceptSchemeDetailDerivedTab(), instancePrefix))
});

const ReduxConceptSchemeDetailModal = ({
                                         t,
                                         nodes,
                                         nodeId,
                                         permissions,
                                         appLanguage,
                                         dataLanguages,
                                         instanceState,
                                         instancePrefix,
                                         isVisible,
                                         isEditDisabled,
                                         conceptSchemeTriplet,
                                         isConceptSchemeValid,
                                         isAgenciesValid,
                                         isConceptSchemeGeneralTabDirty,
                                         conceptScheme,
                                         agencies,
                                         allAgencies,
                                         cloneDestTriplet,
                                         onDetailHide,
                                         onDetailChange,
                                         onDetailCreate,
                                         onDetailUpdate,
                                         fetchConceptScheme,
                                         fetchAgencies,
                                         itemsTree,
                                         onLanguageChange,
                                         focusItemsTab,
                                         downloadConceptSchemeTriplets,
                                         downloadConceptSchemeLang,
                                         downloadConceptSchemeParams,
                                         onDownloadShow,
                                         onDownloadHide,
                                         onDownloadChange,
                                         onDownloadSubmit,
                                         onCloneShow,
                                         onCloneHide,
                                         onCloneChange,
                                         onCloneSubmit,
                                         conceptSchemeExportSourceTriplet,
                                         conceptSchemeExportDestination,
                                         conceptSchemeExportReport,
                                         onExportShow,
                                         onExportHide,
                                         onExportChange,
                                         onExportSubmit,
                                         onExportReportHide,
                                         derivedConceptScheme,
                                         onDerivedItemSchemeCreateSubmit,
                                         onDerivedItemSchemeStateReset,
                                         onDerivedTabFocus,
                                         onDerivedTabUnfocus,
                                         isDerivedTabFocused,
                                         forceIsFinalDisabled
                                       }) => {

  const itemsOrderAnnotationType = nodes.find(node => node.general.id === nodeId).annotations.conceptSchemesOrder;

  const isSubmitDisabled = !isArtefactValid(conceptScheme);

  const userHasPermissionsToEdit = (
    permissions && conceptSchemeTriplet &&
    permissions.agencies.filter(agency => agency === conceptSchemeTriplet.agencyID).length > 0
  );

  return (
    <DataLanguageConsumer>
      {dataLanguage => {
        const lang = dataLanguage || appLanguage;
        return (
          <Fragment>
            <Call
              cb={fetchConceptScheme}
              cbParam={{conceptSchemeTriplet, itemsOrderAnnotationType, lang}}
              disabled={isConceptSchemeValid}
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
                    conceptSchemeTriplet !== null
                      ? ((userHasPermissionsToEdit && !isEditDisabled)
                        ? t('reduxComponents.conceptSchemeDetail.title.editMode.title', {triplet: conceptSchemeTriplet})
                        : t('reduxComponents.conceptSchemeDetail.title.viewMode.title', {triplet: conceptSchemeTriplet})
                      )
                      : t('reduxComponents.conceptSchemeDetail.title.createMode.title')
                  }
                  onCancel={() => {
                    onDetailHide();
                    onDerivedItemSchemeStateReset();
                  }}
                  footer={
                    <div>
                      <Button
                        onClick={() => {
                          onDetailHide();
                          onDerivedItemSchemeStateReset();
                        }}
                      >
                        {t('commons.buttons.close.title')}
                      </Button>
                      {((conceptSchemeTriplet === null || userHasPermissionsToEdit) && !isEditDisabled && !isDerivedTabFocused)
                        ? (
                          <Button
                            disabled={isSubmitDisabled}
                            type="primary"
                            onClick={conceptSchemeTriplet !== null
                              ? () => {
                                onDetailUpdate(conceptScheme, itemsTree, itemsOrderAnnotationType);
                                onDerivedItemSchemeStateReset();
                              }
                              : () =>
                                onDetailCreate(conceptScheme, {
                                  id: conceptScheme.id,
                                  agencyID: conceptScheme.agencyID,
                                  version: conceptScheme.version
                                })
                            }
                          >
                            {t("commons.buttons.save.title")}
                          </Button>
                        )
                        : null}
                    </div>
                  }
                  withDataLanguageSelector
                  onDataLanguageSelectorChange={
                    (lang, changeLang) => {
                      onLanguageChange(lang, itemsOrderAnnotationType);
                      changeLang();
                    }
                  }
                >
                  <DataLanguageConsumer>
                    {dataLanguage => {
                      const lang = dataLanguage || appLanguage;
                      return conceptSchemeTriplet
                        ? (
                          <Fragment>
                            {permissions && !userHasPermissionsToEdit && !isEditDisabled && (
                              <Alert
                                type="warning"
                                showIcon
                                message={t('commons.artefact.alerts.hasNotAgencyPermission')}
                              />
                            )}
                            {!isEditDisabled && (
                              <Row type="flex" gutter={GUTTER_SM} justify={"end"}>
                                {onDownloadShow && (
                                  <Col>
                                    <Button
                                      type="primary"
                                      shape="circle"
                                      icon="download"
                                      size="small"
                                      title={t('commons.artefact.buttons.download.title')}
                                      onClick={() => onDownloadShow([conceptSchemeTriplet], lang)}
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
                                      onClick={() => onCloneShow(conceptSchemeTriplet)}
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
                                    onClick={() => onExportShow(conceptSchemeTriplet)}
                                  />
                                </Col>
                              </Row>
                            )}
                            <Tabs
                              defaultActiveKey={focusItemsTab
                                ? "items"
                                : "general"
                              }
                              onTabClick={
                                key => {
                                  if (key === "derived") {
                                    onDerivedTabFocus();
                                  } else if (isDerivedTabFocused) {
                                    onDerivedTabUnfocus();
                                  }
                                  if (key === "categorisations") {
                                    Modal.error({title: t('errors.notImplemented')});
                                  }
                                  if (isConceptSchemeGeneralTabDirty) {
                                    onDetailUpdate(conceptScheme, itemsTree, itemsOrderAnnotationType)
                                  }
                                }
                              }
                            >
                              <Tabs.TabPane
                                key="general"
                                tab={t('commons.artefact.tabs.general.title')}
                              >
                                <ArtefactForm
                                  artefact={conceptScheme}
                                  mode={(userHasPermissionsToEdit && !isEditDisabled)
                                    ? ARTEFACT_FORM_MODE_EDIT
                                    : ARTEFACT_FORM_MODE_READ
                                  }
                                  agencies={agencies}
                                  onChange={onDetailChange}
                                  artefactOrderType={itemsOrderAnnotationType}
                                  isFinalDisabled={forceIsFinalDisabled}
                                />
                              </Tabs.TabPane>
                              <Tabs.TabPane
                                key="items"
                                tab={t('commons.artefact.tabs.items.title')}
                                disabled={isSubmitDisabled}
                              >
                                <ConceptSchemesDetailItems
                                  instanceState={instanceState}
                                  instancePrefix={instancePrefix}
                                  isEditDisabled={isEditDisabled}
                                />
                              </Tabs.TabPane>
                              <Tabs.TabPane
                                key="categorisations"
                                tab={t('commons.artefact.tabs.categorisations.title')}
                                disabled={isSubmitDisabled}
                              >
                              </Tabs.TabPane>
                              {permissions && !isEditDisabled && (
                                <Tabs.TabPane
                                  key="derived"
                                  tab={t('reduxComponents.conceptSchemeDetail.tabs.derived.title')}
                                  disabled={isSubmitDisabled}
                                >
                                  <ReduxDerivedItemScheme
                                    instanceState={derivedConceptScheme}
                                    instancePrefix={instancePrefix + REDUX_CONCEPT_SCHEMES_DETAIL_DERIVED_IS_PREFIX}
                                    itemTree={itemsTree}
                                    childrenKey={"concepts"}
                                    agencies={agencies}
                                    onCreateSubmit={onDerivedItemSchemeCreateSubmit}
                                  />
                                </Tabs.TabPane>
                              )}
                            </Tabs>
                          </Fragment>
                        )
                        : (
                          <ArtefactForm
                            artefact={conceptScheme}
                            mode={ARTEFACT_FORM_MODE_CREATE}
                            agencies={agencies}
                            onChange={onDetailChange}
                            artefactOrderType={itemsOrderAnnotationType}
                          />
                        )
                    }}
                  </DataLanguageConsumer>
                </EnhancedModal>
              </Call>
            </Call>
            <EnhancedModal
              visible={downloadConceptSchemeTriplets !== null && downloadConceptSchemeTriplets !== undefined}
              onCancel={onDownloadHide}
              footer={
                <div>
                  <Button onClick={onDownloadHide}>
                    {t('commons.buttons.close.title')}
                  </Button>
                  <Button
                    onClick={
                      () => onDownloadSubmit(downloadConceptSchemeTriplets, downloadConceptSchemeParams, downloadConceptSchemeLang)
                    }
                    type="primary"
                    disabled={
                      (downloadConceptSchemeParams && downloadConceptSchemeParams.format === null) ||
                      (downloadConceptSchemeParams && downloadConceptSchemeParams.format === DOWNLOAD_FORMAT_TYPE_CSV &&
                        (
                          downloadConceptSchemeParams.csvSeparator === null ||
                          downloadConceptSchemeParams.csvSeparator.length !== 1 ||
                          downloadConceptSchemeParams.csvLanguage === null
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
                downloadArtefactForm={downloadConceptSchemeParams}
                onChange={onDownloadChange}
                options={getArtefactDownloadOptions(
                  t,
                  (downloadConceptSchemeTriplets && downloadConceptSchemeTriplets.length > 1)
                    ? ARTEFACT_TYPE_MULTIPLE
                    : ARTEFACT_TYPE_CONCEPT_SCHEME
                )}
                langs={dataLanguages}
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
                    onClick={() => onCloneSubmit(cloneDestTriplet, conceptScheme, itemsTree)}
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
                srcArtefact={conceptScheme}
                destTriplet={cloneDestTriplet}
                onChange={onCloneChange}
              />
            </EnhancedModal>
            <EnhancedModal
              visible={conceptSchemeExportSourceTriplet !== null}
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
                        conceptSchemeExportDestination &&
                        conceptSchemeExportDestination.endpoint &&
                        conceptSchemeExportDestination.username &&
                        conceptSchemeExportDestination.id &&
                        conceptSchemeExportDestination.agencyID &&
                        conceptSchemeExportDestination.version &&
                        isVersionValidWithHelp(f => f, conceptSchemeExportDestination.version).valid
                      )
                    }
                    onClick={() => onExportSubmit(conceptSchemeExportSourceTriplet, conceptSchemeExportDestination)}
                  >
                    {t('commons.artefact.modals.export.buttons.submit.title')}
                  </Button>
                </div>
              }
            >
              <ArtefactExportForm
                type='conceptscheme'
                agencies={allAgencies}
                sourceTriplet={conceptSchemeExportSourceTriplet}
                destination={conceptSchemeExportDestination}
                onChange={onExportChange}
              />
            </EnhancedModal>
            <EnhancedModal
              visible={conceptSchemeExportReport !== null}
              title={t('commons.artefact.modals.exportReport.title')}
              width={MODAL_WIDTH_MD}
              onCancel={onExportReportHide}
              footer={<Button onClick={onExportReportHide}>{t('commons.buttons.close.title')}</Button>}
            >
              <ArtefactExportReport
                report={conceptSchemeExportReport}
              />
            </EnhancedModal>
          </Fragment>
        )
      }}
    </DataLanguageConsumer>
  )
};

export default compose(
  translate(),
  connect(mapStateToProps, mapDispatchToProps),
)(ReduxConceptSchemeDetailModal);
