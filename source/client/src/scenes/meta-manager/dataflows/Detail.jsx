import React, {Fragment} from 'react';
import {GUTTER_SM, MODAL_WIDTH_LG, MODAL_WIDTH_XL} from "../../../styles/constants";
import EnhancedModal from '../../../components/enhanced-modal';
import {compose} from "redux";
import {connect} from "react-redux";
import {translate} from 'react-i18next';
import {
  changeDataflowsDetailDataflow,
  hideDataflowsDetail,
  hideDataflowsDetailDsds,
  hideDataflowsDetailLayoutAnnotationsForm,
  readDataflowsDetailAgencies,
  readDataflowsDetailDataflow,
  readDataflowsDetailDsdForLayoutAnnotations,
  readDataflowsDetailDsds,
  readDataflowsDetailLayoutAnnotationsItemsPage,
  resetDataflowsDetailLayoutAnnotationsForm,
  resetDataflowsDetailLayoutAnnotationsItemsPage,
  setDataflowsDetailDsd,
  showDataflowsDataflowClone,
  showDataflowsDataflowDownload,
  showDataflowsDataflowExport,
  showDataflowsDetailDsds,
  showDataflowsDetailLayoutAnnotationsForm,
  submitDataflowsDetailDataflowCreate,
  submitDataflowsDetailDataflowUpdate,
  submitDataflowsDetailLayoutAnnotationsForm,
  unsetDataflowsDetailDsd
} from "./actions";
import {Alert, Button, Col, Modal, Row, Tabs} from "antd";
import ArtefactForm, {
  ARTEFACT_FORM_MODE_CREATE,
  ARTEFACT_FORM_MODE_EDIT,
  ARTEFACT_FORM_MODE_READ
} from '../../../components/artefact-form';
import Call from "../../../hocs/call";
import Selector from "../../../components/selector";
import {isArtefactValid} from "../../../utils/artefactValidators";
import {getArtefactTripletFromString} from "../../../utils/sdmxJson";
import ReduxdsdDetailModal from "../../../redux-components/redux-dsd-detail-modal";
import {MM_DATAFLOWS_DSD_DETAIL_PREFIX, MM_DATAFLOWS_SELECTED_DSD_DETAIL_PREFIX} from "./reducer";
import {reuseAction} from "../../../utils/reduxReuse";
import {showDsdDetail} from "../../../redux-components/redux-dsd-detail-modal/actions";
import ArtefactList from "../../../components/artefact-list";
import {DataLanguageConsumer} from "../../../contexts/DataLanguage";

const mapStateToProps = state => ({
  nodes: state.config.nodes,
  nodeId: state.app.endpointId,
  appLanguage: state.app.language,
  isVisible: state.scenes.metaManager.dataflows.isDetailVisible,
  dataflowTriplet: state.scenes.metaManager.dataflows.dataflowTriplet,
  isDataflowValid: state.scenes.metaManager.dataflows.isDataflowValid,
  isAgenciesValid: state.scenes.metaManager.dataflows.isAgenciesValid,
  isDataflowGeneralTabDirty: state.scenes.metaManager.dataflows.isDataflowGeneralTabDirty,
  dataflow: state.scenes.metaManager.dataflows.dataflow,
  agencies: state.scenes.metaManager.dataflows.agencies,
  dsds: state.scenes.metaManager.dataflows.dsds,
  isDsdsListVisible: state.scenes.metaManager.dataflows.isDsdsListVisible,
  dsdDetail: state.scenes.metaManager.dataflows.dsdDetail,
  selectedDsdDetail: state.scenes.metaManager.dataflows.selectedDsdDetail,
  selectedDsdTriplet: state.scenes.metaManager.dataflows.selectedDsdTriplet,
  permissions: state.app.user.permissions,
  dsdForLayoutAnnotations: state.scenes.metaManager.dataflows.dsdForLayoutAnnotations,
  isLayoutAnnotationsFormVisible: state.scenes.metaManager.dataflows.isLayoutAnnotationsFormVisible,
  itemsPageForLayoutAnnotations: state.scenes.metaManager.dataflows.itemsPageForLayoutAnnotations,
});

const mapDispatchToProps = dispatch => ({
  onDetailHide: () => dispatch(hideDataflowsDetail()),
  onDetailChange: fields => dispatch(changeDataflowsDetailDataflow(fields)),
  onDetailCreate: dataflow => dispatch(submitDataflowsDetailDataflowCreate(dataflow)),
  onDetailUpdate: (dataflow, keepModalOpen) => dispatch(submitDataflowsDetailDataflowUpdate(dataflow, keepModalOpen)),
  fetchDataflow: dataflowTriplet => dispatch(readDataflowsDetailDataflow(dataflowTriplet)),
  fetchAgencies: allowedAgencies => dispatch(readDataflowsDetailAgencies(allowedAgencies)),
  onDsdsShow: () => dispatch(showDataflowsDetailDsds()),
  onDsdsHide: () => dispatch(hideDataflowsDetailDsds()),
  fetchDsds: () => dispatch(readDataflowsDetailDsds()),
  onDsdDetailShow: dsdTriplet => dispatch(reuseAction(showDsdDetail(dsdTriplet), MM_DATAFLOWS_DSD_DETAIL_PREFIX)),
  onSelectedDsdDetailShow: dsdTriplet => dispatch(reuseAction(showDsdDetail(dsdTriplet), MM_DATAFLOWS_SELECTED_DSD_DETAIL_PREFIX)),
  onDsdSet: dsdTriplet => dispatch(setDataflowsDetailDsd(dsdTriplet)),
  onDsdUnset: () => dispatch(unsetDataflowsDetailDsd()),
  onDownloadShow: (dataflowTriplets, lang) => dispatch(showDataflowsDataflowDownload(dataflowTriplets, lang)),
  onCloneShow: artefactTriplet => dispatch(showDataflowsDataflowClone(artefactTriplet)),
  onExportShow: sourceTriplet => dispatch(showDataflowsDataflowExport(sourceTriplet)),
  fetchDsdForLayoutAnnotations: dsdTriplet => dispatch(readDataflowsDetailDsdForLayoutAnnotations(dsdTriplet)),
  onLayoutAnnotationsFormShow: () => dispatch(showDataflowsDetailLayoutAnnotationsForm()),
  onLayoutAnnotationsFormHide: () => dispatch(hideDataflowsDetailLayoutAnnotationsForm()),
  onLayoutAnnotationsFormSubmit: annotations => dispatch(submitDataflowsDetailLayoutAnnotationsForm(annotations)),
  onLayoutAnnotationsFormReset: () => dispatch(resetDataflowsDetailLayoutAnnotationsForm()),
  fetchItemsPageForLayoutAnnotations: ({
                                         codelistTriplet,
                                         language,
                                         pageNum,
                                         pageSize,
                                         searchText,
                                         filters,
                                         sortCol,
                                         sortByDesc
                                       }) => dispatch(readDataflowsDetailLayoutAnnotationsItemsPage({
    codelistTriplet,
    language,
    pageNum,
    pageSize,
    searchText,
    filters,
    sortCol,
    sortByDesc
  })),
  resetItemsPageForLayoutAnnotations: () => dispatch(resetDataflowsDetailLayoutAnnotationsItemsPage())
});

const selector = (t, onSelectedDsdDetailShow, selectedDsdTriplet, onDsdsShow, onDsdUnset, disabled) =>
  <Selector
    disabled={disabled}
    detailTitle={t('commons.artefact.tabs.general.dsd.selector.detail.title')}
    selectTitle={t('commons.artefact.tabs.general.dsd.selector.select.title')}
    resetTitle={t('commons.artefact.tabs.general.dsd.selector.reset.title')}
    onDetail={() => onSelectedDsdDetailShow(selectedDsdTriplet)}
    onSelect={onDsdsShow}
    onReset={onDsdUnset}
  />;

const DataflowsDetail = ({
                           t,
                           appLanguage,
                           isVisible,
                           dataflowTriplet,
                           isDataflowValid,
                           isAgenciesValid,
                           isDataflowGeneralTabDirty,
                           dataflow,
                           agencies,
                           onDetailHide,
                           onDetailChange,
                           onDetailCreate,
                           onDetailUpdate,
                           fetchDataflow,
                           fetchAgencies,
                           dsds,
                           isDsdsListVisible,
                           dsdDetail,
                           selectedDsdTriplet,
                           selectedDsdDetail,
                           onDsdsShow,
                           onDsdsHide,
                           fetchDsds,
                           onDsdDetailShow,
                           onSelectedDsdDetailShow,
                           onDsdSet,
                           onDsdUnset,
                           permissions,
                           onDownloadShow,
                           onCloneShow,
                           onExportShow,
                           fetchDsdForLayoutAnnotations,
                           dsdForLayoutAnnotations,
                           isLayoutAnnotationsFormVisible,
                           onLayoutAnnotationsFormShow,
                           onLayoutAnnotationsFormHide,
                           onLayoutAnnotationsFormSubmit,
                           onLayoutAnnotationsFormReset,
                           itemsPageForLayoutAnnotations,
                           fetchItemsPageForLayoutAnnotations,
                           resetItemsPageForLayoutAnnotations
                         }) => {

  const isSubmitDisabled = !isArtefactValid(dataflow);

  const userHasPermissionsToEdit = (
    permissions && dataflowTriplet &&
    permissions.agencies.filter(agency => agency === dataflowTriplet.agencyID).length > 0
  );

  return (
    <Call
      cb={fetchDataflow}
      cbParam={dataflowTriplet}
      disabled={isDataflowValid}
    >
      <Call
        cb={fetchAgencies}
        cbParam={permissions ? permissions.agencies : undefined}
        disabled={isAgenciesValid}
      >
        <Call
          cb={fetchDsdForLayoutAnnotations}
          cbParam={dataflow && dataflow.dsd ? getArtefactTripletFromString(dataflow.dsd) : null}
          disabled={!dataflow || !dataflow.dsd}
        >
          <EnhancedModal
            visible={isVisible}
            width={MODAL_WIDTH_XL}
            title={
              dataflowTriplet !== null
                ? (
                  userHasPermissionsToEdit
                    ? t('scenes.metaManager.dataflows.detail.title.editMode.title', {triplet: dataflowTriplet})
                    : t('scenes.metaManager.dataflows.detail.title.viewMode.title', {triplet: dataflowTriplet})
                )
                : t('scenes.metaManager.dataflows.detail.title.createMode.title')
            }
            onCancel={onDetailHide}
            footer={
              <div>
                <Button onClick={onDetailHide}>{t('commons.buttons.close.title')}</Button>
                {dataflowTriplet === null || userHasPermissionsToEdit
                  ? (
                    <Button
                      disabled={isSubmitDisabled}
                      type="primary"
                      onClick={
                        dataflowTriplet !== null
                          ? () => onDetailUpdate(dataflow)
                          : () => onDetailCreate(dataflow)
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
                return dataflowTriplet
                  ? (
                    <Fragment>
                      {permissions && !userHasPermissionsToEdit && (
                        <Alert
                          type="warning"
                          showIcon
                          message={t('commons.artefact.alerts.hasNotAgencyPermission')}
                        />
                      )}
                      <Row type="flex" gutter={GUTTER_SM} justify={"end"}>
                        <Col>
                          <Button
                            type="primary"
                            shape="circle"
                            icon="download"
                            size="small"
                            title={t('commons.artefact.buttons.download.title')}
                            onClick={() => onDownloadShow([dataflowTriplet], lang)}
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
                              onClick={() => onCloneShow(dataflowTriplet)}
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
                            onClick={() => onExportShow(dataflowTriplet)}
                          />
                        </Col>
                      </Row>
                      <Tabs
                        defaultActiveKey="general"
                        onTabClick={
                          key => {
                            if (key === "categorisations") {
                              Modal.error({title: t('errors.notImplemented')});
                            }
                            if (isDataflowGeneralTabDirty) {
                              onDetailUpdate(dataflow, true)
                            }
                          }
                        }
                      >
                        <Tabs.TabPane
                          key="general"
                          tab={t('commons.artefact.tabs.general.title')}
                        >
                          {dataflow && (
                            <ArtefactForm
                              artefact={dataflow}
                              mode={userHasPermissionsToEdit ? ARTEFACT_FORM_MODE_EDIT : ARTEFACT_FORM_MODE_READ}
                              agencies={agencies}
                              onChange={onDetailChange}
                              DSDInput={selector(t, onSelectedDsdDetailShow, selectedDsdTriplet, onDsdsShow, onDsdUnset, true)}
                              dsdDimensions={dsdForLayoutAnnotations && dsdForLayoutAnnotations.dimensions}
                              dsdAttributes={dsdForLayoutAnnotations && dsdForLayoutAnnotations.attributes}
                              isDataflow
                              isLayoutAnnotationsFormVisible={isLayoutAnnotationsFormVisible}
                              dataflow={dataflow}
                              dsdForLayoutAnnotations={dsdForLayoutAnnotations}
                              onLayoutAnnotationsFormShow={onLayoutAnnotationsFormShow}
                              onLayoutAnnotationsFormHide={onLayoutAnnotationsFormHide}
                              onLayoutAnnotationsFormSubmit={onLayoutAnnotationsFormSubmit}
                              onLayoutAnnotationsFormReset={onLayoutAnnotationsFormReset}
                              fetchDsdForLayoutAnnotations={fetchDsdForLayoutAnnotations}
                              itemsPageForLayoutAnnotations={itemsPageForLayoutAnnotations}
                              fetchItemsPageForLayoutAnnotations={fetchItemsPageForLayoutAnnotations}
                              resetItemsPageForLayoutAnnotations={resetItemsPageForLayoutAnnotations}
                            />
                          )}
                        </Tabs.TabPane>
                        <Tabs.TabPane
                          key="categorisations"
                          disabled={isSubmitDisabled}
                          tab={t('commons.artefact.tabs.categorisations.title')}
                        >
                        </Tabs.TabPane>
                      </Tabs>
                    </Fragment>
                  )
                  : (
                    <ArtefactForm
                      artefact={dataflow}
                      mode={ARTEFACT_FORM_MODE_CREATE}
                      agencies={agencies}
                      onChange={onDetailChange}
                      DSDInput={selector(t, onSelectedDsdDetailShow, selectedDsdTriplet, onDsdsShow, onDsdUnset, false)}
                      dsdDimensions={dsdForLayoutAnnotations && dsdForLayoutAnnotations.dimensions}
                      dsdAttributes={dsdForLayoutAnnotations && dsdForLayoutAnnotations.attributes}
                      isDataflow
                      isLayoutAnnotationsFormVisible={isLayoutAnnotationsFormVisible}
                      dataflow={dataflow}
                      dsdForLayoutAnnotations={dsdForLayoutAnnotations}
                      onLayoutAnnotationsFormShow={onLayoutAnnotationsFormShow}
                      onLayoutAnnotationsFormHide={onLayoutAnnotationsFormHide}
                      onLayoutAnnotationsFormSubmit={onLayoutAnnotationsFormSubmit}
                      onLayoutAnnotationsFormReset={onLayoutAnnotationsFormReset}
                      fetchDsdForLayoutAnnotations={fetchDsdForLayoutAnnotations}
                      itemsPageForLayoutAnnotations={itemsPageForLayoutAnnotations}
                      fetchItemsPageForLayoutAnnotations={fetchItemsPageForLayoutAnnotations}
                      resetItemsPageForLayoutAnnotations={resetItemsPageForLayoutAnnotations}
                    />
                  )
              }}
            </DataLanguageConsumer>
          </EnhancedModal>
          <EnhancedModal
            visible={isDsdsListVisible}
            onCancel={onDsdsHide}
            title={t('commons.artefact.tabs.general.dsd.modals.dsdList.title')}
            width={MODAL_WIDTH_LG}
            footer={<Button onClick={onDsdsHide}>{t('commons.buttons.close.title')}</Button>}
          >
            <Call cb={fetchDsds}>
              <ArtefactList
                artefacts={dsds}
                onDetailShow={onDsdDetailShow}
                onRowClick={onDsdSet}
                getIsDisabledRow={({isFinal}) => !isFinal}
              />
            </Call>
          </EnhancedModal>
          <ReduxdsdDetailModal
            instancePrefix={MM_DATAFLOWS_DSD_DETAIL_PREFIX}
            instanceState={dsdDetail}
          />
          <ReduxdsdDetailModal
            instancePrefix={MM_DATAFLOWS_SELECTED_DSD_DETAIL_PREFIX}
            instanceState={selectedDsdDetail}
          />
        </Call>
      </Call>
    </Call>
  );
};

export default compose(
  translate(),
  connect(mapStateToProps, mapDispatchToProps),
)(DataflowsDetail);
