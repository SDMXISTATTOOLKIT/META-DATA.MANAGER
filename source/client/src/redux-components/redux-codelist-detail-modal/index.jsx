import React, {Fragment} from 'react';
import {GUTTER_SM, MODAL_WIDTH_MD, MODAL_WIDTH_SM, MODAL_WIDTH_XL} from "../../styles/constants";
import EnhancedModal from '../../components/enhanced-modal';
import {compose} from "redux";
import {connect} from "react-redux";
import {translate} from 'react-i18next';
import {
  changeCodelistDetail,
  changeCodelistDetailClone,
  changeCodelistDetailCodelistLanguage,
  changeCodelistDetailDownload,
  changeCodelistDetailExport,
  changeCodelistDetailItemsAutoSave,
  changeCodelistDetailTab,
  focusCodelistDetailDerivedTab,
  hideCodelistDetail,
  hideCodelistDetailClone,
  hideCodelistDetailDownload,
  hideCodelistDetailExport,
  hideCodelistDetailExportReport,
  readCodelistDetail,
  readCodelistDetailAgencies,
  restoreCodelistDetailDerivedCodelistDb,
  showCodelistDetailClone,
  showCodelistDetailDownload,
  showCodelistDetailExport,
  submitCodelistDetailClone,
  submitCodelistDetailCreate,
  submitCodelistDetailDownload,
  submitCodelistDetailExport,
  submitCodelistDetailUpdate,
  unfocusCodelistDetailDerivedTab
} from "./actions";
import {Alert, Button, Col, Modal, Row, Switch, Tabs} from "antd";
import ArtefactForm, {
  ARTEFACT_FORM_MODE_CREATE,
  ARTEFACT_FORM_MODE_EDIT,
  ARTEFACT_FORM_MODE_READ
} from '../../components/artefact-form';
import Call from "../../hocs/call";
import CodelistDetailItems from "./Items";
import {DataLanguageConsumer} from "../../contexts/DataLanguage";
import ArtefactCloneForm from "../../components/artefact-clone-form";
import {isArtefactValid, isVersionValidWithHelp} from "../../utils/artefactValidators";
import ArtefactExportReport from "../../components/artefact-export-report";
import ArtefactExportForm from "../../components/artefact-export-form";
import {reuseAction} from "../../utils/reduxReuse";
import DerivedCodelist from "./DerivedCodelist";
import {
  ARTEFACT_TYPE_CODELIST,
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
  codelistTriplet: instanceState.codelistTriplet,
  isEditDisabled: instanceState.isEditDisabled,
  isCodelistValid: instanceState.isCodelistValid,
  isAgenciesValid: instanceState.isAgenciesValid,
  isCodelistGeneralTabDirty: instanceState.isCodelistGeneralTabDirty,
  codelist: instanceState.codelist,
  agencies: instanceState.agencies,
  allAgencies: instanceState.allAgencies,
  focusItemsTab: instanceState.focusItemsTab,
  cloneDestTriplet: instanceState.cloneDestTriplet,
  downloadCodelistTriplets: instanceState.downloadCodelistTriplets,
  downloadCodelistLang: instanceState.downloadCodelistLang,
  downloadCodelistParams: instanceState.downloadCodelistParams,
  codelistExportSourceTriplet: instanceState.codelistExportSourceTriplet,
  codelistExportDestination: instanceState.codelistExportDestination,
  codelistExportReport: instanceState.codelistExportReport,
  unsavedChange: instanceState.unsavedChange,
  autoSave: instanceState.autoSave,
  currentTab: instanceState.currentTab,
  itemsTree: instanceState.itemsTree,
  isRestoreDbDisabled: instanceState.isRestoreDbDisabled,
  isDerivedTabFocused: instanceState.isDerivedTabFocused
});

const mapDispatchToProps = (dispatch, {instancePrefix}) => ({
  onDetailHide: () => dispatch(reuseAction(hideCodelistDetail(), instancePrefix)),
  onDetailChange: fields => dispatch(reuseAction(changeCodelistDetail(fields), instancePrefix)),
  onDetailCreate: (codelist, codelistTriplet) => dispatch(reuseAction(submitCodelistDetailCreate(codelist, codelistTriplet), instancePrefix)),
  onDetailUpdate: (codelist, lang, closeDetail) => dispatch(reuseAction(submitCodelistDetailUpdate(codelist, lang, closeDetail), instancePrefix)),
  fetchCodelist: ({codelistTriplet, lang, itemsOrderAnnotationType}) => dispatch(reuseAction(readCodelistDetail(codelistTriplet, lang, itemsOrderAnnotationType), instancePrefix)),
  fetchAgencies: allowedAgencies => dispatch(reuseAction(readCodelistDetailAgencies(allowedAgencies), instancePrefix)),
  onLanguageChange: (lang, itemsOrderAnnotationType) => dispatch(reuseAction(changeCodelistDetailCodelistLanguage(lang, itemsOrderAnnotationType), instancePrefix)),
  onDownloadShow: (artefactTriplets, lang) => dispatch(reuseAction(showCodelistDetailDownload(artefactTriplets, lang), instancePrefix)),
  onDownloadHide: () => dispatch(reuseAction(hideCodelistDetailDownload(), instancePrefix)),
  onDownloadChange: fields => dispatch(reuseAction(changeCodelistDetailDownload(fields), instancePrefix)),
  onDownloadSubmit: (artefactTriplets, downloadCodelistParams, lang) =>
    dispatch(reuseAction(submitCodelistDetailDownload(artefactTriplets, downloadCodelistParams, lang), instancePrefix)),
  onCloneShow: artefactTriplet => dispatch(reuseAction(showCodelistDetailClone(artefactTriplet), instancePrefix)),
  onCloneHide: () => dispatch(reuseAction(hideCodelistDetailClone(), instancePrefix)),
  onCloneChange: fields => dispatch(reuseAction(changeCodelistDetailClone(fields), instancePrefix)),
  onCloneSubmit: (srcTriplet, destTriplet) => dispatch(reuseAction(submitCodelistDetailClone(srcTriplet, destTriplet), instancePrefix)),
  onExportShow: sourceTriplet => dispatch(reuseAction(showCodelistDetailExport(sourceTriplet), instancePrefix)),
  onExportHide: () => dispatch(reuseAction(hideCodelistDetailExport(), instancePrefix)),
  onExportChange: fields => dispatch(reuseAction(changeCodelistDetailExport(fields), instancePrefix)),
  onExportSubmit: (sourceTriplet, destination) => dispatch(reuseAction(submitCodelistDetailExport(sourceTriplet, destination), instancePrefix)),
  onExportReportHide: () => dispatch(reuseAction(hideCodelistDetailExportReport(), instancePrefix)),
  onAutoSaveChange: () => dispatch(reuseAction(changeCodelistDetailItemsAutoSave(), instancePrefix)),
  onTabChange: newTab => dispatch(reuseAction(changeCodelistDetailTab(newTab), instancePrefix)),
  onDbRestore: codelistTriplet => dispatch(reuseAction(restoreCodelistDetailDerivedCodelistDb(codelistTriplet), instancePrefix)),
  onDerivedTabFocus: () => dispatch(reuseAction(focusCodelistDetailDerivedTab(), instancePrefix)),
  onDerivedTabUnfocus: () => dispatch(reuseAction(unfocusCodelistDetailDerivedTab(), instancePrefix))
});

const ReduxCodelistDetailModal = ({
                                    t,
                                    nodes,
                                    nodeId,
                                    permissions,
                                    appLanguage,
                                    dataLanguages,
                                    instanceState,
                                    instancePrefix,
                                    isVisible,
                                    codelistTriplet,
                                    isEditDisabled,
                                    isCodelistValid,
                                    isAgenciesValid,
                                    isCodelistGeneralTabDirty,
                                    codelist,
                                    agencies,
                                    allAgencies,
                                    cloneDestTriplet,
                                    onDetailHide,
                                    onDetailChange,
                                    onDetailCreate,
                                    onDetailUpdate,
                                    fetchCodelist,
                                    fetchAgencies,
                                    onLanguageChange,
                                    focusItemsTab,
                                    downloadCodelistTriplets,
                                    downloadCodelistLang,
                                    downloadCodelistParams,
                                    onDownloadShow,
                                    onDownloadChange,
                                    onDownloadHide,
                                    onDownloadSubmit,
                                    onCloneShow,
                                    onCloneHide,
                                    onCloneChange,
                                    onCloneSubmit,
                                    unsavedChange,
                                    codelistExportSourceTriplet,
                                    codelistExportDestination,
                                    codelistExportReport,
                                    onExportShow,
                                    onExportHide,
                                    onExportChange,
                                    onExportSubmit,
                                    onExportReportHide,
                                    autoSave,
                                    onAutoSaveChange,
                                    currentTab,
                                    onTabChange,
                                    itemsTree,
                                    isRestoreDbDisabled,
                                    onDbRestore,
                                    onDerivedTabFocus,
                                    onDerivedTabUnfocus,
                                    isDerivedTabFocused,
                                    forceIsFinalDisabled
                                  }) => {

  const itemsOrderAnnotationType = nodes.find(node => node.general.id === nodeId).annotations.codelistsOrder;

  const isSubmitDisabled = !isArtefactValid(codelist);

  const userHasPermissionsToEdit = (
    permissions && codelistTriplet &&
    permissions.agencies.filter(agency => agency === codelistTriplet.agencyID).length > 0
  );

  return (
    <DataLanguageConsumer>
      {dataLanguage => {
        const lang = dataLanguage || appLanguage;
        return (
          <Fragment>
            <Call
              cb={fetchCodelist}
              cbParam={{codelistTriplet, lang, itemsOrderAnnotationType}}
              disabled={isCodelistValid || (currentTab && currentTab !== "general") || !codelistTriplet}
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
                    codelistTriplet !== null
                      ? ((userHasPermissionsToEdit && !isEditDisabled)
                        ? t('reduxComponents.codelistDetail.title.editMode.title', {triplet: codelistTriplet})
                        : t('reduxComponents.codelistDetail.title.viewMode.title', {triplet: codelistTriplet})
                      )
                      : t('reduxComponents.codelistDetail.title.createMode.title')
                  }
                  onCancel={
                    () => {
                      if (unsavedChange) {
                        Modal.confirm({
                          title: t('commons.artefact.modals.unsavedChange.discard.title'),
                          onOk() {
                            codelistTriplet && onDbRestore(codelistTriplet);
                            onDetailHide();
                          },
                          cancelText: t('commons.buttons.cancel.title')
                        })
                      } else {
                        codelistTriplet && onDbRestore(codelistTriplet);
                        onDetailHide();
                      }
                    }
                  }
                  footer={
                    <DataLanguageConsumer>
                      {dataLanguage => {
                        const lang = dataLanguage || appLanguage;
                        return (
                          <Row type="flex" justify="end" align="middle" gutter={GUTTER_SM}>
                            {currentTab === "items" && userHasPermissionsToEdit && !isEditDisabled && (
                              <Col>
                                <Row type="flex" justify="end" align="middle" gutter={GUTTER_SM}>
                                  <Col>
                                    {t("components.itemList.label.autoSave")}
                                  </Col>
                                  <Col>
                                    <Switch
                                      checked={autoSave}
                                      onChange={onAutoSaveChange}
                                    />
                                  </Col>
                                </Row>
                              </Col>
                            )}
                            <Col>
                              <Row type="flex" justify="end" align="middle" gutter={GUTTER_SM}>
                                <Col>
                                  <Button
                                    onClick={
                                      () => {
                                        if (unsavedChange) {
                                          Modal.confirm({
                                            title: t('commons.artefact.modals.unsavedChange.discard.title'),
                                            onOk() {
                                              codelistTriplet && onDbRestore(codelistTriplet);
                                              onDetailHide();
                                            },
                                            cancelText: t('commons.buttons.cancel.title')
                                          })
                                        } else {
                                          codelistTriplet && onDbRestore(codelistTriplet);
                                          onDetailHide();
                                        }
                                      }
                                    }
                                  >
                                    {t('commons.buttons.close.title')}
                                  </Button>
                                </Col>
                                <Col>
                                  {(codelistTriplet === null || userHasPermissionsToEdit) && !isEditDisabled && !isDerivedTabFocused && (
                                    <Button
                                      disabled={isSubmitDisabled}
                                      type="primary"
                                      onClick={
                                        codelistTriplet !== null
                                          ? () => {
                                            onDetailUpdate(codelist, lang, true);
                                            codelistTriplet && onDbRestore(codelistTriplet);
                                          }
                                          : () => onDetailCreate(codelist, {
                                            id: codelist.id,
                                            agencyID: codelist.agencyID,
                                            version: codelist.version
                                          })
                                      }
                                    >
                                      {t("commons.buttons.save.title")}
                                    </Button>
                                  )}
                                </Col>
                              </Row>
                            </Col>
                          </Row>
                        )
                      }}
                    </DataLanguageConsumer>
                  }
                  withDataLanguageSelector
                  onDataLanguageSelectorChange={
                    (lang, changeLang) => {
                      if (unsavedChange) {
                        Modal.confirm({
                          title: t('commons.artefact.modals.unsavedChange.discard.title'),
                          onOk() {
                            onLanguageChange(lang, itemsOrderAnnotationType);
                            changeLang();
                          },
                          cancelText: t('commons.buttons.cancel.title')
                        })
                      } else {
                        onLanguageChange(lang, itemsOrderAnnotationType);
                        changeLang();
                      }
                    }
                  }
                >
                  <DataLanguageConsumer>
                    {dataLanguage => {
                      const lang = dataLanguage || appLanguage;
                      return codelistTriplet
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
                                <Col>
                                  {onDownloadShow && (
                                    <Button
                                      type="primary"
                                      shape="circle"
                                      icon="download"
                                      size="small"
                                      title={t('commons.artefact.buttons.download.title')}
                                      onClick={
                                        () => {
                                          if (unsavedChange) {
                                            Modal.confirm({
                                              title: t('commons.artefact.modals.unsavedChange.different.title'),
                                              onOk() {
                                                onDownloadShow([codelistTriplet], lang);
                                              },
                                              cancelText: t('commons.buttons.cancel.title')
                                            })
                                          } else {
                                            onDownloadShow([codelistTriplet], lang);
                                          }
                                        }
                                      }
                                    />
                                  )}
                                </Col>
                                {permissions && (
                                  <Col>
                                    <Button
                                      type="primary"
                                      shape="circle"
                                      icon="copy"
                                      size="small"
                                      title={t('commons.artefact.buttons.clone.title')}
                                      onClick={
                                        () => {
                                          if (unsavedChange) {
                                            Modal.confirm({
                                              title: t('commons.artefact.modals.unsavedChange.different.title'),
                                              onOk() {
                                                onCloneShow(codelistTriplet);
                                              },
                                              cancelText: t('commons.buttons.cancel.title')
                                            })
                                          } else {
                                            onCloneShow(codelistTriplet);
                                          }
                                        }
                                      }
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
                                    onClick={
                                      () => {
                                        if (unsavedChange) {
                                          Modal.confirm({
                                            title: t('commons.artefact.modals.unsavedChange.different.title'),
                                            onOk() {
                                              onExportShow(codelistTriplet);
                                            },
                                            cancelText: t('commons.buttons.cancel.title')
                                          })
                                        } else {
                                          onExportShow(codelistTriplet);
                                        }
                                      }
                                    }
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
                                  if (isCodelistGeneralTabDirty) {
                                    onDetailUpdate(codelist, lang, false)
                                  }
                                  onTabChange(key)
                                }
                              }
                            >
                              <Tabs.TabPane
                                key="general"
                                tab={t('commons.artefact.tabs.general.title')}
                              >
                                <ArtefactForm
                                  artefact={codelist}
                                  mode={(userHasPermissionsToEdit && !isEditDisabled)
                                    ? ARTEFACT_FORM_MODE_EDIT
                                    : ARTEFACT_FORM_MODE_READ}
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
                                <CodelistDetailItems
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
                                  tab={t('reduxComponents.codelistDetail.tabs.derived.title')}
                                  disabled={isSubmitDisabled}
                                >
                                  <DerivedCodelist
                                    instanceState={instanceState}
                                    instancePrefix={instancePrefix}
                                    itemTree={itemsTree}
                                    agencies={agencies}
                                  />
                                </Tabs.TabPane>
                              )}
                            </Tabs>
                          </Fragment>
                        )
                        : (
                          <ArtefactForm
                            artefact={codelist}
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
              visible={downloadCodelistTriplets !== null && downloadCodelistTriplets !== undefined}
              onCancel={onDownloadHide}
              footer={
                <div>
                  <Button onClick={onDownloadHide}>
                    {t('commons.buttons.close.title')}
                  </Button>
                  <Button
                    onClick={
                      () => onDownloadSubmit(downloadCodelistTriplets, downloadCodelistParams, downloadCodelistLang)
                    }
                    type="primary"
                    disabled={
                      (downloadCodelistParams && downloadCodelistParams.format === null) ||
                      (downloadCodelistParams && downloadCodelistParams.format === DOWNLOAD_FORMAT_TYPE_CSV &&
                        (
                          downloadCodelistParams.csvSeparator === null ||
                          downloadCodelistParams.csvSeparator.length !== 1 ||
                          downloadCodelistParams.csvLanguage === null
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
                downloadArtefactForm={downloadCodelistParams}
                onChange={onDownloadChange}
                options={getArtefactDownloadOptions(
                  t,
                  (downloadCodelistTriplets && downloadCodelistTriplets.length > 1)
                    ? ARTEFACT_TYPE_MULTIPLE
                    : ARTEFACT_TYPE_CODELIST
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
                    onClick={() => onCloneSubmit(codelistTriplet, cloneDestTriplet)}
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
                srcArtefact={codelist}
                destTriplet={cloneDestTriplet}
                onChange={onCloneChange}
              />
            </EnhancedModal>
            <EnhancedModal
              visible={codelistExportSourceTriplet !== null}
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
                        codelistExportDestination &&
                        codelistExportDestination.endpoint &&
                        codelistExportDestination.username &&
                        codelistExportDestination.id &&
                        codelistExportDestination.agencyID &&
                        codelistExportDestination.version &&
                        isVersionValidWithHelp(f => f, codelistExportDestination.version).valid
                      )
                    }
                    onClick={() => onExportSubmit(codelistExportSourceTriplet, codelistExportDestination)}
                  >
                    {t('commons.artefact.modals.export.buttons.submit.title')}
                  </Button>
                </div>
              }
            >
              <ArtefactExportForm
                type='codelist'
                agencies={allAgencies}
                sourceTriplet={codelistExportSourceTriplet}
                destination={codelistExportDestination}
                onChange={onExportChange}
              />
            </EnhancedModal>
            <EnhancedModal
              visible={codelistExportReport !== null}
              title={t('commons.artefact.modals.exportReport.title')}
              width={MODAL_WIDTH_MD}
              onCancel={onExportReportHide}
              footer={<Button onClick={onExportReportHide}>{t('commons.buttons.close.title')}</Button>}
            >
              <ArtefactExportReport
                report={codelistExportReport}
              />
            </EnhancedModal>
            <Call
              cb={onDbRestore}
              cbParam={codelistTriplet}
              disabled={!codelistTriplet || isRestoreDbDisabled || isEditDisabled}
            >
              <span/>
            </Call>
          </Fragment>
        )
      }}
    </DataLanguageConsumer>
  )
};

export default compose(
  translate(),
  connect(mapStateToProps, mapDispatchToProps)
)(ReduxCodelistDetailModal);
