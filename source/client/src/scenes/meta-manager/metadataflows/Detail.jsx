import React, {Fragment} from 'react';
import {GUTTER_SM, MODAL_WIDTH_LG, MODAL_WIDTH_XL} from "../../../styles/constants";
import EnhancedModal from '../../../components/enhanced-modal';
import {compose} from "redux";
import {connect} from "react-redux";
import {translate} from 'react-i18next';
import {
  changeMetadataflowsDetailMetadataflow,
  hideMetadataflowsDetail,
  hideMetadataflowsDetailMsds,
  readMetadataflowsDetailAgencies,
  readMetadataflowsDetailMetadataflow,
  readMetadataflowsDetailMsds,
  setMetadataflowsDetailMsd,
  showMetadataflowsDetailMsds,
  showMetadataflowsMetadataflowClone,
  showMetadataflowsMetadataflowDownload,
  showMetadataflowsMetadataflowExport,
  submitMetadataflowsDetailMetadataflowCreate,
  submitMetadataflowsDetailMetadataflowUpdate,
  unsetMetadataflowsDetailMsd
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
import ArtefactList from "../../../components/artefact-list";
import {DataLanguageConsumer} from "../../../contexts/DataLanguage";

const mapStateToProps = state => ({
  nodes: state.config.nodes,
  nodeId: state.app.endpointId,
  appLanguage: state.app.language,
  isVisible: state.scenes.metaManager.metadataflows.isDetailVisible,
  metadataflowTriplet: state.scenes.metaManager.metadataflows.metadataflowTriplet,
  isMetadataflowValid: state.scenes.metaManager.metadataflows.isMetadataflowValid,
  isAgenciesValid: state.scenes.metaManager.metadataflows.isAgenciesValid,
  isMetadataflowGeneralTabDirty: state.scenes.metaManager.metadataflows.isMetadataflowGeneralTabDirty,
  metadataflow: state.scenes.metaManager.metadataflows.metadataflow,
  agencies: state.scenes.metaManager.metadataflows.agencies,
  msds: state.scenes.metaManager.metadataflows.msds,
  isMsdsListVisible: state.scenes.metaManager.metadataflows.isMsdsListVisible,
  permissions: state.app.user.permissions
});

const mapDispatchToProps = dispatch => ({
  onDetailHide: () => dispatch(hideMetadataflowsDetail()),
  onDetailChange: fields => dispatch(changeMetadataflowsDetailMetadataflow(fields)),
  onDetailCreate: metadataflow => dispatch(submitMetadataflowsDetailMetadataflowCreate(metadataflow)),
  onDetailUpdate: (metadataflow, keepModalOpen) => dispatch(submitMetadataflowsDetailMetadataflowUpdate(metadataflow, keepModalOpen)),
  fetchMetadataflow: metadataflowTriplet => dispatch(readMetadataflowsDetailMetadataflow(metadataflowTriplet)),
  fetchAgencies: allowedAgencies => dispatch(readMetadataflowsDetailAgencies(allowedAgencies)),
  onMsdsShow: () => dispatch(showMetadataflowsDetailMsds()),
  onMsdsHide: () => dispatch(hideMetadataflowsDetailMsds()),
  fetchMsds: () => dispatch(readMetadataflowsDetailMsds()),
  onMsdSet: msdTriplet => dispatch(setMetadataflowsDetailMsd(msdTriplet)),
  onMsdUnset: () => dispatch(unsetMetadataflowsDetailMsd()),
  onDownloadShow: (metadataflowTriplets, lang) =>
    dispatch(showMetadataflowsMetadataflowDownload(metadataflowTriplets, lang)),
  onCloneShow: artefactTriplet => dispatch(showMetadataflowsMetadataflowClone(artefactTriplet)),
  onExportShow: sourceTriplet => dispatch(showMetadataflowsMetadataflowExport(sourceTriplet))
});

const selector = (t, onMsdsShow, onMsdUnset, disabled) =>
  <Selector
    disabled={disabled}
    selectTitle={t('commons.artefact.tabs.general.msd.selector.select.title')}
    resetTitle={t('commons.artefact.tabs.general.msd.selector.reset.title')}
    onSelect={onMsdsShow}
    onReset={onMsdUnset}
  />;

const MetadataflowsDetail = ({
                               t,
                               nodes,
                               nodeId,
                               appLanguage,
                               isVisible,
                               metadataflowTriplet,
                               isMetadataflowValid,
                               isAgenciesValid,
                               isMetadataflowGeneralTabDirty,
                               metadataflow,
                               agencies,
                               onDetailHide,
                               onDetailChange,
                               onDetailCreate,
                               onDetailUpdate,
                               fetchMetadataflow,
                               fetchAgencies,
                               msds,
                               isMsdsListVisible,
                               onMsdsShow,
                               onMsdsHide,
                               fetchMsds,
                               onMsdSet,
                               onMsdUnset,
                               permissions,
                               onDownloadShow,
                               onCloneShow,
                               onExportShow
                             }) => {

  const isSubmitDisabled = !isArtefactValid(metadataflow);

  const userHasPermissionsToEdit = (
    permissions && metadataflowTriplet &&
    permissions.agencies.filter(agency => agency === metadataflowTriplet.agencyID).length > 0
  );

  return (
    <Call
      cb={fetchMetadataflow}
      cbParam={metadataflowTriplet}
      disabled={isMetadataflowValid}
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
            metadataflowTriplet !== null
              ? (
                userHasPermissionsToEdit
                  ? t('scenes.metaManager.metadataflows.detail.title.editMode.title', {triplet: metadataflowTriplet})
                  : t('scenes.metaManager.metadataflows.detail.title.viewMode.title', {triplet: metadataflowTriplet})
              )
              : t('scenes.metaManager.metadataflows.detail.title.createMode.title')
          }
          onCancel={onDetailHide}
          footer={
            <div>
              <Button onClick={onDetailHide}>{t('commons.buttons.close.title')}</Button>
              {metadataflowTriplet === null || userHasPermissionsToEdit
                ? (
                  <Button
                    disabled={isSubmitDisabled}
                    type="primary"
                    onClick={() => metadataflowTriplet !== null
                      ? onDetailUpdate(metadataflow)
                      : onDetailCreate(metadataflow)
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
              return metadataflowTriplet
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
                          onClick={() => onDownloadShow([metadataflowTriplet], lang)}
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
                            onClick={() => onCloneShow(metadataflowTriplet)}
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
                          onClick={() => onExportShow(metadataflowTriplet)}
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
                          if (isMetadataflowGeneralTabDirty) {
                            onDetailUpdate(metadataflow, true)
                          }
                        }
                      }
                    >
                      <Tabs.TabPane
                        key="general"
                        tab={t('commons.artefact.tabs.general.title')}
                      >
                        {metadataflow && (
                          <ArtefactForm
                            artefact={metadataflow}
                            mode={userHasPermissionsToEdit ? ARTEFACT_FORM_MODE_EDIT : ARTEFACT_FORM_MODE_READ}
                            agencies={agencies}
                            onChange={onDetailChange}
                            MSDInput={selector(t, onMsdsShow, onMsdUnset, true)}
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
                    artefact={metadataflow}
                    mode={ARTEFACT_FORM_MODE_CREATE}
                    agencies={agencies}
                    onChange={onDetailChange}
                    MSDInput={selector(t, onMsdsShow, onMsdUnset, false)}
                  />
                )
            }}
          </DataLanguageConsumer>
        </EnhancedModal>
        <EnhancedModal
          visible={isMsdsListVisible}
          onCancel={onMsdsHide}
          title={t('commons.artefact.tabs.general.msd.modals.msdList.title')}
          width={MODAL_WIDTH_LG}
          footer={<Button onClick={onMsdsHide}>{t('commons.buttons.close.title')}</Button>}
        >
          <Call cb={fetchMsds}>
            <ArtefactList
              artefacts={msds}
              onRowClick={({id, agencyID, version}) => onMsdSet({id, agencyID, version})}
              getIsDisabledRow={({isFinal}) => !isFinal}
            />
          </Call>
        </EnhancedModal>
      </Call>
    </Call>
  );
};

export default compose(
  translate(),
  connect(mapStateToProps, mapDispatchToProps),
)(MetadataflowsDetail);
