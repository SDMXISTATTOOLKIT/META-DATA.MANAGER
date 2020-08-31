import React, {Fragment} from 'react';
import {GUTTER_SM, MODAL_WIDTH_LG, MODAL_WIDTH_MD, MODAL_WIDTH_SM, MODAL_WIDTH_XL} from "../../styles/constants";
import EnhancedModal from '../../components/enhanced-modal';
import {compose} from "redux";
import {connect} from "react-redux";
import {translate} from 'react-i18next';
import {
  changeContentConstraintDetail,
  changeContentConstraintDetailClone,
  changeContentConstraintDetailDownload,
  changeContentConstraintDetailExport,
  changeContentConstraintDetailFilter,
  changeContentConstraintDetailFilterColumnMode,
  changeContentConstraintDetailFilterColumnValues,
  changeContentConstraintDetailReleaseCalendar,
  hideContentConstraintDetail,
  hideContentConstraintDetailArtefacts,
  hideContentConstraintDetailClone,
  hideContentConstraintDetailDownload,
  hideContentConstraintDetailExport,
  hideContentConstraintDetailExportReport,
  hideContentConstraintDetailFilterModal,
  hideContentConstraintDetailFilterQuery,
  readContentConstraintDetail,
  readContentConstraintDetailAgencies,
  readContentConstraintDetailArtefact,
  readContentConstraintDetailArtefacts,
  readContentConstraintDetailFilterColumnCodelistCount,
  readContentConstraintDetailFilterColumnCodelistTree,
  readContentConstraintDetailFilterColumnFilteredValues,
  readContentConstraintDetailFilterCube,
  readContentConstraintDetailFilterDsd,
  resetContentConstraintDetailFilter,
  selectContentConstraintDetailArtefactType,
  setContentConstraintDetailArtefact,
  showContentConstraintDetailArtefacts,
  showContentConstraintDetailClone,
  showContentConstraintDetailDownload,
  showContentConstraintDetailExport,
  showContentConstraintDetailFilterModal,
  showContentConstraintDetailFilterQuery,
  submitContentConstraintDetailClone,
  submitContentConstraintDetailCreate,
  submitContentConstraintDetailDownload,
  submitContentConstraintDetailExport,
  submitContentConstraintDetailUpdate,
  unsetContentConstraintDetailArtefact
} from "./actions";
import {Alert, Button, Col, Row, Tabs} from "antd";
import ArtefactForm, {
  ARTEFACT_FORM_MODE_CREATE,
  ARTEFACT_FORM_MODE_EDIT,
  ARTEFACT_FORM_MODE_READ
} from '../../components/artefact-form';
import Call from "../../hocs/call";
import ArtefactCloneForm from '../../components/artefact-clone-form';
import {isArtefactValid, isVersionValidWithHelp} from "../../utils/artefactValidators";
import ArtefactList from "../../components/artefact-list";
import ContentConstraintFilterTab from "./FilterTab";
import ContentConstraintReleaseCalendarTab from "./ReleaseCalendarTab";
import {
  getArtefactTripletFromString,
  getUrnFromArtefactTriplet,
  SDMX_JSON_DATAFLOW_URN_NAMESPACE,
  SDMX_JSON_DSD_URN_NAMESPACE
} from "../../utils/sdmxJson";
import {
  ARTEFACT_TYPE_CONTENT_CONSTRAINT,
  ARTEFACT_TYPE_DSD,
  DOWNLOAD_FORMAT_TYPE_CSV,
  getArtefactDownloadOptions
} from "../../constants/download";
import {reuseAction} from "../../utils/reduxReuse";
import ArtefactExportForm from "../../components/artefact-export-form";
import ArtefactExportReport from "../../components/artefact-export-report";
import {DataLanguageConsumer} from "../../contexts/DataLanguage";
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
  contentConstraintTriplet: instanceState.contentConstraintTriplet,
  isContentConstraintValid: instanceState.isContentConstraintValid,
  isAgenciesValid: instanceState.isAgenciesValid,
  isContentConstraintGeneralTabDirty: instanceState.isContentConstraintGeneralTabDirty,
  contentConstraint: instanceState.contentConstraint,
  agencies: instanceState.agencies,
  allAgencies: instanceState.allAgencies,
  downloadContentConstraintTriplet: instanceState.downloadContentConstraintTriplet,
  downloadContentConstraintLang: instanceState.downloadContentConstraintLang,
  downloadContentConstraintParams: instanceState.downloadContentConstraintParams,
  cloneDestTriplet: instanceState.cloneDestTriplet,
  focusItemsTab: instanceState.focusItemsTab,
  artefactType: instanceState.artefactType,
  isArtefactsVisible: instanceState.isArtefactsVisible,
  artefacts: instanceState.artefacts,
  artefactTriplet: instanceState.artefactTriplet,
  artefact: instanceState.artefact,
  filterDsdTriplet: instanceState.filterDsdTriplet,
  filterCubeId: instanceState.filterCubeId,
  filterColumns: instanceState.filterColumns,
  filter: instanceState.filter,
  timePeriod: instanceState.timePeriod,
  isFilterModalVisible: instanceState.isFilterModalVisible,
  isFilterQueryVisible: instanceState.isFilterQueryVisible,
  releaseCalendar: instanceState.releaseCalendar,
  contentConstraintExportSourceTriplet: instanceState.contentConstraintExportSourceTriplet,
  contentConstraintExportDestination: instanceState.contentConstraintExportDestination,
  contentConstraintExportReport: instanceState.contentConstraintExportReport
});

const mapDispatchToProps = (dispatch, {instancePrefix}) => ({
  onDetailHide: () => dispatch(reuseAction(hideContentConstraintDetail(), instancePrefix)),
  onDetailChange: fields => dispatch(reuseAction(changeContentConstraintDetail(fields), instancePrefix)),
  onDetailCreate: (contentConstraint, attachmentType, attachmentUrn, filter) =>
    dispatch(reuseAction(submitContentConstraintDetailCreate(contentConstraint, attachmentType, attachmentUrn, filter), instancePrefix)),
  onDetailUpdate: (contentConstraint, attachmentType, attachmentUrn, filter, timePeriod, keepModalOpen) =>
    dispatch(reuseAction(submitContentConstraintDetailUpdate(contentConstraint, attachmentType, attachmentUrn, filter, timePeriod, keepModalOpen), instancePrefix)),
  fetchContentConstraint: contentConstraintTriplet =>
    dispatch(reuseAction(readContentConstraintDetail(contentConstraintTriplet), instancePrefix)),
  fetchAgencies: allowedAgencies => dispatch(reuseAction(readContentConstraintDetailAgencies(allowedAgencies), instancePrefix)),
  onDownloadShow: (artefactTriplets, lang) => dispatch(reuseAction(showContentConstraintDetailDownload(artefactTriplets, lang), instancePrefix)),
  onDownloadHide: () => dispatch(reuseAction(hideContentConstraintDetailDownload(), instancePrefix)),
  onDownloadChange: fields => dispatch(reuseAction(changeContentConstraintDetailDownload(fields), instancePrefix)),
  onDownloadSubmit: (artefactTriplet, downloadContentConstraintParams, lang) =>
    dispatch(reuseAction(submitContentConstraintDetailDownload(artefactTriplet, downloadContentConstraintParams, lang), instancePrefix)),
  onCloneShow: artefactTriplet => dispatch(reuseAction(showContentConstraintDetailClone(artefactTriplet), instancePrefix)),
  onCloneHide: () => dispatch(reuseAction(hideContentConstraintDetailClone(), instancePrefix)),
  onCloneChange: fields => dispatch(reuseAction(changeContentConstraintDetailClone(fields), instancePrefix)),
  onCloneSubmit: (cloneDestTriplet, srcContentConstraint, srcContentConstraintType, srcContentConstraintUrn, srcContentConstraintFilter) =>
    dispatch(reuseAction(submitContentConstraintDetailClone(cloneDestTriplet, srcContentConstraint, srcContentConstraintType, srcContentConstraintUrn, srcContentConstraintFilter), instancePrefix)),
  onExportShow: (sourceTriplet, sourceAttachmentType, sourceAttachmentUrn, sourceFilter) =>
    dispatch(reuseAction(showContentConstraintDetailExport(sourceTriplet, sourceAttachmentType, sourceAttachmentUrn, sourceFilter), instancePrefix)),
  onArtefactTypeSelect: artefactType => dispatch(reuseAction(selectContentConstraintDetailArtefactType(artefactType), instancePrefix)),
  onArtefactsShow: () => dispatch(reuseAction(showContentConstraintDetailArtefacts(), instancePrefix)),
  onArtefactsHide: () => dispatch(reuseAction(hideContentConstraintDetailArtefacts(), instancePrefix)),
  fetchArtefacts: artefactType => dispatch(reuseAction(readContentConstraintDetailArtefacts(artefactType), instancePrefix)),
  onArtefactSet: artefactTriplet => dispatch(reuseAction(setContentConstraintDetailArtefact(artefactTriplet), instancePrefix)),
  onArtefactUnset: () => dispatch(reuseAction(unsetContentConstraintDetailArtefact(), instancePrefix)),
  onReleaseCalendarChange: fields => dispatch(reuseAction(changeContentConstraintDetailReleaseCalendar(fields), instancePrefix)),
  onFilterReset: () => dispatch(reuseAction(resetContentConstraintDetailFilter(), instancePrefix)),
  onFilterModalShow: () => dispatch(reuseAction(showContentConstraintDetailFilterModal(), instancePrefix)),
  onFilterModalHide: () => dispatch(reuseAction(hideContentConstraintDetailFilterModal(), instancePrefix)),
  onFilterQueryShow: () => dispatch(reuseAction(showContentConstraintDetailFilterQuery(), instancePrefix)),
  onFilterQueryHide: () => dispatch(reuseAction(hideContentConstraintDetailFilterQuery(), instancePrefix)),
  onFilterChange: filter => dispatch(reuseAction(changeContentConstraintDetailFilter(filter), instancePrefix)),
  onFilterColumnModeChange: (colName, mode) => dispatch(reuseAction(changeContentConstraintDetailFilterColumnMode(colName, mode), instancePrefix)),
  onFilterColumnValuesChange: (colName, values) => dispatch(reuseAction(changeContentConstraintDetailFilterColumnValues(colName, values), instancePrefix)),
  fetchArtefact: ({artefactType, artefactTriplet, haveDMWS, isUserLogged}) =>
    dispatch(reuseAction(readContentConstraintDetailArtefact(artefactType, artefactTriplet, haveDMWS, isUserLogged), instancePrefix)),
  fetchFilterDsd: dsdTriplet => dispatch(reuseAction(readContentConstraintDetailFilterDsd(dsdTriplet), instancePrefix)),
  fetchFilterCube: cubeId => dispatch(reuseAction(readContentConstraintDetailFilterCube(cubeId), instancePrefix)),
  fetchFilterColumnCodelistCount: ({codelistTriplet, language}) =>
    dispatch(reuseAction(readContentConstraintDetailFilterColumnCodelistCount(codelistTriplet, language), instancePrefix)),
  fetchFilterColumnFilteredValues: (cubeId, colNames, filter) =>
    dispatch(reuseAction(readContentConstraintDetailFilterColumnFilteredValues(cubeId, colNames, filter), instancePrefix)),
  fetchFilterColumnCodelistTree: ({codelistTriplet, language, itemsOrderAnnotationType}) =>
    dispatch(reuseAction(readContentConstraintDetailFilterColumnCodelistTree(codelistTriplet, language, itemsOrderAnnotationType), instancePrefix)),
  onExportHide: () => dispatch(reuseAction(hideContentConstraintDetailExport(), instancePrefix)),
  onExportChange: fields => dispatch(reuseAction(changeContentConstraintDetailExport(fields), instancePrefix)),
  onExportSubmit: (sourceTriplet, destination) => dispatch(reuseAction(submitContentConstraintDetailExport(sourceTriplet, destination), instancePrefix)),
  onExportReportHide: () => dispatch(reuseAction(hideContentConstraintDetailExportReport(), instancePrefix))
});

const ReduxContentConstraintDetailModal = ({
                                             t,
                                             nodes,
                                             nodeId,
                                             appLanguage,
                                             dataLanguages,
                                             isVisible,
                                             isEditDisabled,
                                             contentConstraintTriplet,
                                             isContentConstraintValid,
                                             isAgenciesValid,
                                             isContentConstraintGeneralTabDirty,
                                             contentConstraint,
                                             agencies,
                                             allAgencies,
                                             onDetailHide,
                                             onDetailChange,
                                             onDetailCreate,
                                             onDetailUpdate,
                                             fetchContentConstraint,
                                             fetchAgencies,
                                             permissions,
                                             cloneDestTriplet,
                                             focusItemsTab,
                                             artefactType,
                                             isArtefactsVisible,
                                             artefacts,
                                             artefactTriplet,
                                             artefact,
                                             filterDsdTriplet,
                                             filterCubeId,
                                             filterColumns,
                                             filter,
                                             timePeriod,
                                             onFilterColumnModeChange,
                                             onFilterColumnValuesChange,
                                             onFilterChange,
                                             onFilterReset,
                                             fetchFilterDsd,
                                             fetchFilterCube,
                                             fetchFilterColumnCodelistCount,
                                             fetchFilterColumnCodelistTree,
                                             fetchFilterColumnFilteredValues,
                                             releaseCalendar,
                                             downloadContentConstraintTriplet,
                                             downloadContentConstraintLang,
                                             downloadContentConstraintParams,
                                             onDownloadShow,
                                             onDownloadHide,
                                             onDownloadChange,
                                             onDownloadSubmit,
                                             onCloneShow,
                                             onCloneHide,
                                             onCloneChange,
                                             onCloneSubmit,
                                             onExportShow,
                                             onArtefactTypeSelect,
                                             onArtefactsShow,
                                             onArtefactsHide,
                                             fetchArtefacts,
                                             onArtefactSet,
                                             onArtefactUnset,
                                             onReleaseCalendarChange,
                                             fetchArtefact,
                                             onFilterQueryShow,
                                             onFilterQueryHide,
                                             onFilterModalShow,
                                             onFilterModalHide,
                                             isFilterModalVisible,
                                             isFilterQueryVisible,
                                             contentConstraintExportSourceTriplet,
                                             contentConstraintExportDestination,
                                             contentConstraintExportReport,
                                             onExportHide,
                                             onExportChange,
                                             onExportSubmit,
                                             onExportReportHide,
                                             forceIsFinalDisabled
                                           }) => {
  
  const isSubmitDisabled = !isArtefactValid(contentConstraint) ||
    artefactType === null ||
    artefactTriplet === null;

  const userHasPermissionsToEdit = (
    permissions && contentConstraintTriplet &&
    permissions.agencies.filter(agency => agency === contentConstraintTriplet.agencyID).length > 0
  );

  return (
    <Fragment>
      <Call
        cb={fetchContentConstraint}
        cbParam={contentConstraintTriplet}
        disabled={isContentConstraintValid}
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
              contentConstraintTriplet !== null
                ? ((userHasPermissionsToEdit && !isEditDisabled)
                  ? t('scenes.metaManager.contentConstraints.detail.title.editMode.title', {triplet: contentConstraintTriplet})
                  : t('scenes.metaManager.contentConstraints.detail.title.viewMode.title', {triplet: contentConstraintTriplet})
                )
                : t('scenes.metaManager.contentConstraints.detail.title.createMode.title')
            }
            onCancel={onDetailHide}
            footer={
              <div>
                <Button onClick={onDetailHide}>{t('commons.buttons.close.title')}</Button>
                {((contentConstraintTriplet === null || userHasPermissionsToEdit) || !isEditDisabled)
                  ? (
                    <Button
                      disabled={isSubmitDisabled}
                      type="primary"
                      onClick={
                        contentConstraintTriplet !== null
                          ? () =>
                            onDetailUpdate(
                              contentConstraint,
                              artefactType,
                              getUrnFromArtefactTriplet(
                                getArtefactTripletFromString(artefactTriplet),
                                artefactType === ARTEFACT_TYPE_DSD
                                  ? SDMX_JSON_DSD_URN_NAMESPACE
                                  : SDMX_JSON_DATAFLOW_URN_NAMESPACE
                              ),
                              filter,
                              timePeriod
                            )
                          : () =>
                            onDetailCreate(
                              contentConstraint,
                              artefactType,
                              getUrnFromArtefactTriplet(
                                getArtefactTripletFromString(artefactTriplet),
                                artefactType === ARTEFACT_TYPE_DSD
                                  ? SDMX_JSON_DSD_URN_NAMESPACE
                                  : SDMX_JSON_DATAFLOW_URN_NAMESPACE
                              ),
                              filter
                            )
                      }
                    >
                      {t("commons.buttons.save.title")}
                    </Button>
                  )
                  : null}
              </div>
            }
            withDataLanguageSelector
          >
            <DataLanguageConsumer>
              {dataLanguage => {
                const lang = dataLanguage || appLanguage;
                return (
                  <Fragment>
                    {contentConstraintTriplet && permissions && !userHasPermissionsToEdit && !isEditDisabled && (
                      <Alert
                        type="warning"
                        showIcon
                        message={t('commons.artefact.alerts.hasNotAgencyPermission')}
                      />
                    )}
                    {contentConstraintTriplet && !isEditDisabled && (
                      <Row type="flex" gutter={GUTTER_SM} justify={"end"}>
                        <Col>
                          <Button
                            type="primary"
                            shape="circle"
                            icon="download"
                            size="small"
                            title={t('commons.artefact.buttons.download.title')}
                            onClick={() => onDownloadShow([contentConstraintTriplet], lang)}
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
                              onClick={() => onCloneShow(contentConstraintTriplet)}
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
                              () => onExportShow(
                                contentConstraintTriplet,
                                artefactType,
                                getUrnFromArtefactTriplet(
                                  getArtefactTripletFromString(artefactTriplet),
                                  artefactType === ARTEFACT_TYPE_DSD
                                    ? SDMX_JSON_DSD_URN_NAMESPACE
                                    : SDMX_JSON_DATAFLOW_URN_NAMESPACE
                                ),
                                filter
                              )
                            }
                          />
                        </Col>
                      </Row>
                    )}
                    <Tabs
                      defaultActiveKey={
                        focusItemsTab
                          ? "constraintItems"
                          : "general"
                      }
                    >
                      <Tabs.TabPane
                        key="general"
                        tab={t('commons.artefact.tabs.general.title')}
                      >
                        {contentConstraint && (
                          <ArtefactForm
                            artefact={contentConstraint}
                            mode={contentConstraintTriplet
                              ? ((userHasPermissionsToEdit && !isEditDisabled)
                                ? ARTEFACT_FORM_MODE_EDIT
                                : ARTEFACT_FORM_MODE_READ)
                              : ARTEFACT_FORM_MODE_CREATE
                            }
                            agencies={agencies}
                            onChange={onDetailChange}
                            isFinalDisabled={forceIsFinalDisabled}
                          />
                        )}
                      </Tabs.TabPane>
                      <Tabs.TabPane
                        key="constraintItems"
                        tab={t('scenes.metaManager.commons.detail.tabs.constraintItems.title')}
                      >
                        <ContentConstraintFilterTab
                          disabled={
                            isEditDisabled ||
                            (contentConstraintTriplet !== null && !userHasPermissionsToEdit) ||
                            (contentConstraintTriplet !== null && contentConstraint !== null && contentConstraint.isFinal)
                          }
                          artefactType={artefactType}
                          artefactTriplet={artefactTriplet}
                          artefact={artefact}
                          filterColumns={filterColumns}
                          onArtefactTypeSelect={onArtefactTypeSelect}
                          onArtefactsShow={onArtefactsShow}
                          onArtefactUnset={onArtefactUnset}
                          fetchArtefact={fetchArtefact}
                          fetchFilterDsd={fetchFilterDsd}
                          fetchFilterCube={fetchFilterCube}
                          onFilterReset={onFilterReset}
                          fetchFilterColumnCodelistCount={fetchFilterColumnCodelistCount}
                          fetchFilterColumnCodelistTree={fetchFilterColumnCodelistTree}
                          fetchFilterColumnFilteredValues={fetchFilterColumnFilteredValues}
                          onFilterChange={onFilterChange}
                          filter={filter}
                          filterDsdTriplet={filterDsdTriplet}
                          filterCubeId={filterCubeId}
                          onFilterColumnModeChange={onFilterColumnModeChange}
                          onFilterColumnValuesChange={onFilterColumnValuesChange}
                          isFilterModalVisible={isFilterModalVisible}
                          onFilterModalShow={onFilterModalShow}
                          onFilterModalHide={onFilterModalHide}
                          onFilterQueryShow={onFilterQueryShow}
                          onFilterQueryHide={onFilterQueryHide}
                          isFilterQueryVisible={isFilterQueryVisible}
                        />
                      </Tabs.TabPane>
                      <Tabs.TabPane
                        key="releaseCalendar"
                        tab={t('scenes.metaManager.commons.detail.tabs.releaseCalendar.title')}
                      >
                        <Alert
                          type="warning"
                          showIcon
                          message={t('errors.notSupportedBySdmxSource')}
                        />
                        <ContentConstraintReleaseCalendarTab
                          disabled={
                            isEditDisabled ||
                            (contentConstraintTriplet !== null && !userHasPermissionsToEdit) ||
                            (contentConstraintTriplet !== null && contentConstraint !== null && contentConstraint.isFinal)
                          }
                          releaseCalendar={releaseCalendar}
                          onReleaseCalendarChange={onReleaseCalendarChange}
                        />
                      </Tabs.TabPane>
                    </Tabs>
                  </Fragment>
                )
              }}
            </DataLanguageConsumer>
          </EnhancedModal>
        </Call>
      </Call>
      <EnhancedModal
        visible={isArtefactsVisible}
        onCancel={onArtefactsHide}
        title={t('scenes.metaManager.commons.detail.modals.artefactList.title')}
        width={MODAL_WIDTH_LG}
        footer={<Button onClick={onArtefactsHide}>{t('commons.buttons.close.title')}</Button>}
      >
        <Call cb={fetchArtefacts} cbParam={artefactType} disabled={isArtefactsVisible === false}>
          <ArtefactList
            artefacts={artefacts}
            getIsDisabledRow={({isFinal}) => !isFinal}
            onRowClick={({id, agencyID, version}) => onArtefactSet({id, agencyID, version})}
          />
        </Call>
      </EnhancedModal>
      <EnhancedModal
        visible={downloadContentConstraintTriplet !== null && downloadContentConstraintTriplet !== undefined}
        onCancel={onDownloadHide}
        footer={
          <div>
            <Button onClick={onDownloadHide}>
              {t('commons.buttons.close.title')}
            </Button>
            <Button
              onClick={
                () => onDownloadSubmit(downloadContentConstraintTriplet, downloadContentConstraintParams, downloadContentConstraintLang)
              }
              type="primary"
              disabled={
                (downloadContentConstraintParams && downloadContentConstraintParams.format === null) ||
                (downloadContentConstraintParams && downloadContentConstraintParams.format === DOWNLOAD_FORMAT_TYPE_CSV &&
                  (
                    downloadContentConstraintParams.csvSeparator === null ||
                    downloadContentConstraintParams.csvSeparator.length !== 1 ||
                    downloadContentConstraintParams.csvLanguage === null
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
          downloadArtefactForm={downloadContentConstraintParams}
          onChange={onDownloadChange}
          options={getArtefactDownloadOptions(t, ARTEFACT_TYPE_CONTENT_CONSTRAINT)}
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
              onClick={
                () => onCloneSubmit(
                  cloneDestTriplet,
                  contentConstraint,
                  artefactType,
                  getUrnFromArtefactTriplet(
                    getArtefactTripletFromString(artefactTriplet),
                    artefactType === ARTEFACT_TYPE_DSD
                      ? SDMX_JSON_DSD_URN_NAMESPACE
                      : SDMX_JSON_DATAFLOW_URN_NAMESPACE
                  ),
                  filter
                )
              }
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
          srcArtefact={contentConstraint}
          destTriplet={cloneDestTriplet}
          onChange={onCloneChange}
        />
      </EnhancedModal>
      <EnhancedModal
        visible={contentConstraintExportSourceTriplet !== null}
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
                  contentConstraintExportDestination &&
                  contentConstraintExportDestination.endpoint &&
                  contentConstraintExportDestination.username &&
                  contentConstraintExportDestination.id &&
                  contentConstraintExportDestination.agencyID &&
                  contentConstraintExportDestination.version &&
                  isVersionValidWithHelp(f => f, contentConstraintExportDestination.version).valid
                )
              }
              onClick={
                () => onExportSubmit(contentConstraintExportSourceTriplet, contentConstraintExportDestination)
              }
            >
              {t('commons.artefact.modals.export.buttons.submit.title')}
            </Button>
          </div>
        }
      >
        <ArtefactExportForm
          type='contentconstraint'
          agencies={allAgencies}
          sourceTriplet={contentConstraintExportSourceTriplet}
          destination={contentConstraintExportDestination}
          onChange={onExportChange}
        />
      </EnhancedModal>
      <EnhancedModal
        visible={contentConstraintExportReport !== null}
        title={t('commons.artefact.modals.exportReport.title')}
        width={MODAL_WIDTH_MD}
        onCancel={onExportReportHide}
        footer={<Button onClick={onExportReportHide}>{t('commons.buttons.close.title')}</Button>}
      >
        <ArtefactExportReport
          report={contentConstraintExportReport}
        />
      </EnhancedModal>
    </Fragment>
  );
};

export default compose(
  translate(),
  connect(mapStateToProps, mapDispatchToProps)
)(ReduxContentConstraintDetailModal);
