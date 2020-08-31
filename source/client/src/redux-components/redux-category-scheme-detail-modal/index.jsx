import React, {Fragment} from 'react';
import {GUTTER_SM, MODAL_WIDTH_MD, MODAL_WIDTH_SM, MODAL_WIDTH_XL} from "../../styles/constants";
import EnhancedModal from '../../components/enhanced-modal';
import {compose} from "redux";
import {connect} from "react-redux";
import {translate} from 'react-i18next';
import {
  changeCategorySchemeCategorySchemeClone,
  changeCategorySchemeDetail,
  changeCategorySchemeDetailDownload,
  changeCategorySchemeDetailExport,
  changeCategorySchemeDetailLanguage,
  focusCategorySchemeDetailDerivedTab,
  hideCategorySchemeCategorySchemeClone,
  hideCategorySchemeDetail,
  hideCategorySchemeDetailDownload,
  hideCategorySchemeDetailExport,
  hideCategorySchemeDetailExportReport,
  readCategorySchemeDetail,
  readCategorySchemeDetailAgencies,
  showCategorySchemeCategorySchemeClone,
  showCategorySchemeCategorySchemeExport,
  showCategorySchemeDetailDownload,
  submitCategorySchemeCategorySchemeClone,
  submitCategorySchemeDetailCreate,
  submitCategorySchemeDetailDerivedItemSchemeCreate,
  submitCategorySchemeDetailDownload,
  submitCategorySchemeDetailExport,
  submitCategorySchemeDetailUpdate,
  unfocusCategorySchemeDetailDerivedTab
} from "./actions";
import {Alert, Button, Col, Modal, Row, Tabs} from "antd";
import ArtefactForm, {
  ARTEFACT_FORM_MODE_CREATE,
  ARTEFACT_FORM_MODE_EDIT,
  ARTEFACT_FORM_MODE_READ
} from '../../components/artefact-form';
import Call from "../../hocs/call";
import CategorySchemesDetailItems from "./Items";
import {DataLanguageConsumer} from "../../contexts/DataLanguage";
import ArtefactCloneForm from "../../components/artefact-clone-form";
import {isArtefactValid, isVersionValidWithHelp} from "../../utils/artefactValidators";
import {reuseAction} from "../../utils/reduxReuse";
import ArtefactExportForm from "../../components/artefact-export-form";
import ArtefactExportReport from "../../components/artefact-export-report";
import {REDUX_CATEGORY_SCHEMES_DETAIL_DERIVED_IS_PREFIX} from "./reducer";
import ReduxDerivedItemScheme from "../../redux-components/redux-derived-item-scheme";
import {resetDerivedItemSchemeState} from "../redux-derived-item-scheme/actions";
import {
  ARTEFACT_TYPE_CATEGORY_SCHEME,
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
  categorySchemeTriplet: instanceState.categorySchemeTriplet,
  isCategorySchemeValid: instanceState.isCategorySchemeValid,
  isAgenciesValid: instanceState.isAgenciesValid,
  isCategorySchemeGeneralTabDirty: instanceState.isCategorySchemeGeneralTabDirty,
  categoryScheme: instanceState.categoryScheme,
  agencies: instanceState.agencies,
  allAgencies: instanceState.allAgencies,
  itemsTree: instanceState.itemsTree,
  focusItemsTab: instanceState.focusItemsTab,
  downloadCategorySchemeTriplets: instanceState.downloadCategorySchemeTriplets,
  downloadCategorySchemeParams: instanceState.downloadCategorySchemeParams,
  downloadCategorySchemeLang: instanceState.downloadCategorySchemeLang,
  cloneDestTriplet: instanceState.cloneDestTriplet,
  categorySchemeExportSourceTriplet: instanceState.categorySchemeExportSourceTriplet,
  categorySchemeExportDestination: instanceState.categorySchemeExportDestination,
  categorySchemeExportReport: instanceState.categorySchemeExportReport,
  derivedCategoryScheme: instanceState.derivedCategoryScheme,
  isDerivedTabFocused: instanceState.isDerivedTabFocused
});

const mapDispatchToProps = (dispatch, {instancePrefix}) => ({
  onDetailHide: () => dispatch(reuseAction(hideCategorySchemeDetail(), instancePrefix)),
  onDetailChange: fields => dispatch(reuseAction(changeCategorySchemeDetail(fields), instancePrefix)),
  onDetailCreate: (categoryScheme, categorySchemeTriplet) =>
    dispatch(reuseAction(submitCategorySchemeDetailCreate(categoryScheme, categorySchemeTriplet), instancePrefix)),
  onDetailUpdate: (categoryScheme, itemsTree, itemsOrderAnnotationType) =>
    dispatch(reuseAction(submitCategorySchemeDetailUpdate(categoryScheme, itemsTree, itemsOrderAnnotationType), instancePrefix)),
  fetchCategoryScheme: ({categorySchemeTriplet, itemsOrderAnnotationType, lang}) =>
    dispatch(reuseAction(readCategorySchemeDetail(categorySchemeTriplet, itemsOrderAnnotationType, lang), instancePrefix)),
  fetchAgencies: allowedAgencies => dispatch(reuseAction(readCategorySchemeDetailAgencies(allowedAgencies), instancePrefix)),
  onLanguageChange: (lang, itemsOrderAnnotationType) =>
    dispatch(reuseAction(changeCategorySchemeDetailLanguage(lang, itemsOrderAnnotationType), instancePrefix)),
  onDownloadShow: (artefactTriplets, lang) => dispatch(reuseAction(showCategorySchemeDetailDownload(artefactTriplets, lang), instancePrefix)),
  onDownloadHide: () => dispatch(reuseAction(hideCategorySchemeDetailDownload(), instancePrefix)),
  onDownloadChange: fields => dispatch(reuseAction(changeCategorySchemeDetailDownload(fields), instancePrefix)),
  onDownload: (artefactTriplets, downloadCategorySchemeParams, lang) =>
    dispatch(reuseAction(submitCategorySchemeDetailDownload(artefactTriplets, downloadCategorySchemeParams, lang), instancePrefix)),
  onCloneShow: srcTriplet => dispatch(reuseAction(showCategorySchemeCategorySchemeClone(srcTriplet), instancePrefix)),
  onCloneHide: () => dispatch(reuseAction(hideCategorySchemeCategorySchemeClone(), instancePrefix)),
  onCloneChange: fields => dispatch(reuseAction(changeCategorySchemeCategorySchemeClone(fields), instancePrefix)),
  onCloneSubmit: (cloneDestTriplet, srcCategoryScheme, srcCategorySchemeItemsTree) =>
    dispatch(reuseAction(submitCategorySchemeCategorySchemeClone(cloneDestTriplet, srcCategoryScheme, srcCategorySchemeItemsTree), instancePrefix)),
  onExportShow: sourceTriplet => dispatch(reuseAction(showCategorySchemeCategorySchemeExport(sourceTriplet), instancePrefix)),
  onExportHide: () => dispatch(reuseAction(hideCategorySchemeDetailExport(), instancePrefix)),
  onExportChange: fields => dispatch(reuseAction(changeCategorySchemeDetailExport(fields), instancePrefix)),
  onExportSubmit: (sourceTriplet, destination) => dispatch(reuseAction(submitCategorySchemeDetailExport(sourceTriplet, destination), instancePrefix)),
  onExportReportHide: () => dispatch(reuseAction(hideCategorySchemeDetailExportReport(), instancePrefix)),
  onDerivedItemSchemeCreateSubmit: (derivedCategoryScheme, derivedItems) =>
    dispatch(reuseAction(submitCategorySchemeDetailDerivedItemSchemeCreate(derivedCategoryScheme, derivedItems), instancePrefix)),
  onDerivedItemSchemeStateReset: () => dispatch(reuseAction(resetDerivedItemSchemeState(), instancePrefix + REDUX_CATEGORY_SCHEMES_DETAIL_DERIVED_IS_PREFIX)),
  onDerivedTabFocus: () => dispatch(reuseAction(focusCategorySchemeDetailDerivedTab(), instancePrefix)),
  onDerivedTabUnfocus: () => dispatch(reuseAction(unfocusCategorySchemeDetailDerivedTab(), instancePrefix))
});

const ReduxCategorySchemeDetailModal = ({
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
                                          categorySchemeTriplet,
                                          isCategorySchemeValid,
                                          isAgenciesValid,
                                          isCategorySchemeGeneralTabDirty,
                                          categoryScheme,
                                          agencies,
                                          allAgencies,
                                          cloneDestTriplet,
                                          onDetailHide,
                                          onDetailChange,
                                          onDetailCreate,
                                          onDetailUpdate,
                                          fetchCategoryScheme,
                                          fetchAgencies,
                                          itemsTree,
                                          onLanguageChange,
                                          focusItemsTab,
                                          downloadCategorySchemeTriplets,
                                          downloadCategorySchemeLang,
                                          downloadCategorySchemeParams,
                                          onDownloadShow,
                                          onDownloadHide,
                                          onDownloadChange,
                                          onDownload,
                                          onCloneShow,
                                          onCloneHide,
                                          onCloneChange,
                                          onCloneSubmit,
                                          categorySchemeExportSourceTriplet,
                                          categorySchemeExportDestination,
                                          categorySchemeExportReport,
                                          onExportShow,
                                          onExportHide,
                                          onExportChange,
                                          onExportSubmit,
                                          onExportReportHide,
                                          derivedCategoryScheme,
                                          onDerivedItemSchemeCreateSubmit,
                                          onDerivedItemSchemeStateReset,
                                          onDerivedTabFocus,
                                          onDerivedTabUnfocus,
                                          isDerivedTabFocused,
                                          forceIsFinalDisabled
                                        }) => {

  const itemsOrderAnnotationType = nodes.find(node => node.general.id === nodeId).annotations.categorySchemesOrder;

  const isSubmitDisabled = !isArtefactValid(categoryScheme);

  const hasUserPermissionsToEdit = (
    permissions && categorySchemeTriplet &&
    permissions.agencies.filter(agency => agency === categorySchemeTriplet.agencyID).length > 0
  );

  return (
    <DataLanguageConsumer>
      {dataLanguage => {
        const lang = dataLanguage || appLanguage;
        return (
          <Fragment>
            <Call
              cb={fetchCategoryScheme}
              cbParam={{categorySchemeTriplet, itemsOrderAnnotationType, lang}}
              disabled={isCategorySchemeValid}
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
                    categorySchemeTriplet !== null
                      ? ((hasUserPermissionsToEdit && !isEditDisabled)
                        ? t('reduxComponents.categorySchemeDetail.title.editMode.title', {triplet: categorySchemeTriplet})
                        : t('reduxComponents.categorySchemeDetail.title.viewMode.title', {triplet: categorySchemeTriplet})
                      )
                      : t('reduxComponents.categorySchemeDetail.title.createMode.title')
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
                      {((categorySchemeTriplet === null || hasUserPermissionsToEdit) && !isEditDisabled && !isDerivedTabFocused)
                        ? (
                          <Button
                            disabled={isSubmitDisabled}
                            type="primary"
                            onClick={categorySchemeTriplet !== null
                              ? () => {
                                onDetailUpdate(categoryScheme, itemsTree, itemsOrderAnnotationType);
                                onDerivedItemSchemeStateReset();
                              }
                              : () =>
                                onDetailCreate(categoryScheme, {
                                  id: categoryScheme.id,
                                  agencyID: categoryScheme.agencyID,
                                  version: categoryScheme.version
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
                      return categorySchemeTriplet
                        ? (
                          <Fragment>
                            {permissions && !hasUserPermissionsToEdit && !isEditDisabled && (
                              <Alert
                                type="warning"
                                showIcon
                                message={t('commons.artefact.alerts.hasNotAgencyPermission')}
                              />
                            )}
                            {
                              !isEditDisabled && (
                                <Row type="flex" gutter={GUTTER_SM} justify={"end"}>
                                  <Col>
                                    <Button
                                      type="primary"
                                      shape="circle"
                                      icon="download"
                                      size="small"
                                      title={t('commons.artefact.buttons.download.title')}
                                      onClick={() => onDownloadShow([categorySchemeTriplet], lang)}
                                    />
                                  </Col>
                                  {permissions && (
                                    <Col>
                                      <Button
                                        type="primary"
                                        shape="circle"
                                        icon="copy"
                                        size="small"
                                        title={t('commons.artefact.buttons.clone.title')}
                                        onClick={() => onCloneShow(categorySchemeTriplet)}
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
                                      onClick={() => onExportShow(categorySchemeTriplet)}
                                    />
                                  </Col>
                                </Row>
                              )
                            }
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
                                  if (isCategorySchemeGeneralTabDirty) {
                                    onDetailUpdate(categoryScheme, itemsTree, itemsOrderAnnotationType)
                                  }
                                }
                              }
                            >
                              <Tabs.TabPane
                                key="general"
                                tab={t('commons.artefact.tabs.general.title')}
                              >
                                <ArtefactForm
                                  artefact={categoryScheme}
                                  mode={(hasUserPermissionsToEdit && !isEditDisabled)
                                    ? ARTEFACT_FORM_MODE_EDIT
                                    : ARTEFACT_FORM_MODE_READ
                                  }
                                  agencies={agencies}
                                  onChange={onDetailChange}
                                  isFinalDisabled={forceIsFinalDisabled}
                                />
                              </Tabs.TabPane>
                              <Tabs.TabPane
                                key="items"
                                tab={t('commons.artefact.tabs.items.title')}
                                disabled={isSubmitDisabled}
                              >
                                <CategorySchemesDetailItems
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
                                  tab={t('reduxComponents.categorySchemeDetail.tabs.derived.title')}
                                  disabled={isSubmitDisabled}
                                >
                                  <ReduxDerivedItemScheme
                                    instanceState={derivedCategoryScheme}
                                    instancePrefix={instancePrefix + REDUX_CATEGORY_SCHEMES_DETAIL_DERIVED_IS_PREFIX}
                                    itemTree={itemsTree}
                                    childrenKey={"categories"}
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
                            artefact={categoryScheme}
                            mode={ARTEFACT_FORM_MODE_CREATE}
                            agencies={agencies}
                            onChange={onDetailChange}
                          />
                        )
                    }}
                  </DataLanguageConsumer>
                </EnhancedModal>
              </Call>
            </Call>
            <EnhancedModal
              visible={downloadCategorySchemeTriplets !== null && downloadCategorySchemeTriplets !== undefined}
              onCancel={onDownloadHide}
              footer={
                <div>
                  <Button onClick={onDownloadHide}>
                    {t('commons.buttons.close.title')}
                  </Button>
                  <Button
                    onClick={
                      () => onDownload(downloadCategorySchemeTriplets, downloadCategorySchemeParams, downloadCategorySchemeLang)
                    }
                    type="primary"
                    disabled={
                      (downloadCategorySchemeParams && downloadCategorySchemeParams.format === null) ||
                      (downloadCategorySchemeParams && downloadCategorySchemeParams.format === DOWNLOAD_FORMAT_TYPE_CSV &&
                        (
                          downloadCategorySchemeParams.csvSeparator === null ||
                          downloadCategorySchemeParams.csvSeparator.length !== 1 ||
                          downloadCategorySchemeParams.csvLanguage === null
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
                downloadArtefactForm={downloadCategorySchemeParams}
                onChange={onDownloadChange}
                options={getArtefactDownloadOptions(
                  t,
                  (downloadCategorySchemeTriplets && downloadCategorySchemeTriplets.length > 1)
                    ? ARTEFACT_TYPE_MULTIPLE
                    : ARTEFACT_TYPE_CATEGORY_SCHEME
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
                    onClick={() => onCloneSubmit(cloneDestTriplet, categoryScheme, itemsTree)}
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
                srcArtefact={categoryScheme}
                destTriplet={cloneDestTriplet}
                onChange={onCloneChange}
              />
            </EnhancedModal>
            <EnhancedModal
              visible={categorySchemeExportSourceTriplet !== null}
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
                        categorySchemeExportDestination &&
                        categorySchemeExportDestination.endpoint &&
                        categorySchemeExportDestination.username &&
                        categorySchemeExportDestination.id &&
                        categorySchemeExportDestination.agencyID &&
                        categorySchemeExportDestination.version &&
                        isVersionValidWithHelp(f => f, categorySchemeExportDestination.version).valid
                      )
                    }
                    onClick={() => onExportSubmit(categorySchemeExportSourceTriplet, categorySchemeExportDestination)}
                  >
                    {t('commons.artefact.modals.export.buttons.submit.title')}
                  </Button>
                </div>
              }
            >
              <ArtefactExportForm
                type='categoryscheme'
                agencies={allAgencies}
                sourceTriplet={categorySchemeExportSourceTriplet}
                destination={categorySchemeExportDestination}
                onChange={onExportChange}
              />
            </EnhancedModal>
            <EnhancedModal
              visible={categorySchemeExportReport !== null}
              title={t('commons.artefact.modals.exportReport.title')}
              width={MODAL_WIDTH_MD}
              onCancel={onExportReportHide}
              footer={<Button onClick={onExportReportHide}>{t('commons.buttons.close.title')}</Button>}
            >
              <ArtefactExportReport
                report={categorySchemeExportReport}
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
)(ReduxCategorySchemeDetailModal);
