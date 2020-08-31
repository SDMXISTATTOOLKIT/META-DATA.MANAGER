import React, {Fragment} from 'react';
import {GUTTER_SM, MODAL_WIDTH_XL} from "../../../styles/constants";
import EnhancedModal from '../../../components/enhanced-modal';
import {compose} from "redux";
import {connect} from "react-redux";
import {translate} from 'react-i18next';
import {
  changeAgencySchemesDetailAgencyScheme,
  changeAgencySchemesDetailAgencySchemeLanguage,
  hideAgencySchemesDetail,
  readAgencySchemesDetailAgencies,
  readAgencySchemesDetailAgencyScheme,
  showAgencySchemesAgencySchemeClone,
  showAgencySchemesAgencySchemeDownload,
  showAgencySchemesAgencySchemeExport,
  submitAgencySchemesDetailAgencySchemeCreate,
  submitAgencySchemesDetailAgencySchemeUpdate
} from "./actions";
import {Alert, Button, Col, Modal, Row, Tabs} from "antd";
import ArtefactForm, {
  ARTEFACT_FORM_MODE_CREATE,
  ARTEFACT_FORM_MODE_EDIT,
  ARTEFACT_FORM_MODE_READ
} from '../../../components/artefact-form';
import Call from "../../../hocs/call";
import AgencySchemesDetailItems from "./Items";
import {DataLanguageConsumer} from "../../../contexts/DataLanguage";
import {isArtefactValid} from "../../../utils/artefactValidators";

const mapStateToProps = state => ({
  nodes: state.config.nodes,
  nodeId: state.app.endpointId,
  permissions: state.app.user.permissions,
  appLanguage: state.app.language,
  isVisible: state.scenes.metaManager.agencySchemes.isDetailVisible,
  agencySchemeTriplet: state.scenes.metaManager.agencySchemes.agencySchemeTriplet,
  isAgencySchemeValid: state.scenes.metaManager.agencySchemes.isAgencySchemeValid,
  isAgenciesValid: state.scenes.metaManager.agencySchemes.isAgenciesValid,
  isAgencySchemeGeneralTabDirty: state.scenes.metaManager.agencySchemes.isAgencySchemeGeneralTabDirty,
  agencyScheme: state.scenes.metaManager.agencySchemes.agencyScheme,
  agencies: state.scenes.metaManager.agencySchemes.agencies,
  allAgencies: state.scenes.metaManager.agencySchemes.allAgencies,
  itemsTree: state.scenes.metaManager.agencySchemes.itemsTree,
  focusItemsTab: state.scenes.metaManager.agencySchemes.focusItemsTab
});

const mapDispatchToProps = dispatch => ({
  onAgencySchemeDetailHide: () => dispatch(hideAgencySchemesDetail()),
  onAgencySchemeDetailChange: fields => dispatch(changeAgencySchemesDetailAgencyScheme(fields)),
  onAgencySchemeDetailCreate: (agencyScheme, agencySchemeTriplet) =>
    dispatch(submitAgencySchemesDetailAgencySchemeCreate(agencyScheme, agencySchemeTriplet)),
  onAgencySchemeDetailUpdate: (agencyScheme, itemsTree, itemsOrderAnnotationType) =>
    dispatch(submitAgencySchemesDetailAgencySchemeUpdate(agencyScheme, itemsTree, itemsOrderAnnotationType)),
  fetchAgencyScheme: ({agencySchemeTriplet, itemsOrderAnnotationType, lang}) =>
    dispatch(readAgencySchemesDetailAgencyScheme(agencySchemeTriplet, itemsOrderAnnotationType, lang)),
  fetchAgencies: allowedAgencies => dispatch(readAgencySchemesDetailAgencies(allowedAgencies)),
  onLanguageChange: (lang, itemsOrderAnnotationType) =>
    dispatch(changeAgencySchemesDetailAgencySchemeLanguage(lang, itemsOrderAnnotationType)),
  onAgencySchemeDownloadShow: (agencySchemeTriplets, lang) =>
    dispatch(showAgencySchemesAgencySchemeDownload(agencySchemeTriplets, lang)),
  onAgencySchemeCloneShow: agencySchemeTriplet => dispatch(showAgencySchemesAgencySchemeClone(agencySchemeTriplet)),
  onAgencySchemeExportShow: agencySchemeTriplet => dispatch(showAgencySchemesAgencySchemeExport(agencySchemeTriplet)),
});

const AgencySchemesDetail = ({
                               t,
                               nodes,
                               nodeId,
                               permissions,
                               appLanguage,
                               isVisible,
                               agencySchemeTriplet,
                               isAgencySchemeValid,
                               isAgenciesValid,
                               isAgencySchemeGeneralTabDirty,
                               agencyScheme,
                               agencies,
                               onAgencySchemeDetailHide,
                               onAgencySchemeDetailChange,
                               onAgencySchemeDetailCreate,
                               onAgencySchemeDetailUpdate,
                               fetchAgencyScheme,
                               fetchAgencies,
                               itemsTree,
                               onLanguageChange,
                               focusItemsTab,
                               onAgencySchemeDownloadShow,
                               onAgencySchemeCloneShow,
                               onAgencySchemeExportShow
                             }) => {

  const itemsOrderAnnotationType = nodes.find(node => node.general.id === nodeId).annotations.codelistsOrder;

  const isSubmitDisabled = !isArtefactValid(agencyScheme);

  const userHasPermissionsToEdit = (
    permissions && agencySchemeTriplet &&
    permissions.agencies.filter(agency => agency === agencySchemeTriplet.agencyID).length > 0
  );

  const onArtefactFormChange = (agencySchemeFields) => {
    if (agencySchemeFields.isFinal) {
      Modal.error({title: t('scenes.metaManager.agencySchemes.detail.alerts.illegalFinal.title')});
      onAgencySchemeDetailChange(agencyScheme);
    } else {
      onAgencySchemeDetailChange(agencySchemeFields);
    }
  };

  return (
    <DataLanguageConsumer>
      {dataLanguage => {
        const lang = dataLanguage || appLanguage;
        return (
          <Call
            cb={fetchAgencyScheme}
            cbParam={{agencySchemeTriplet, itemsOrderAnnotationType, lang}}
            disabled={isAgencySchemeValid}
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
                  agencySchemeTriplet !== null
                    ? (
                      userHasPermissionsToEdit
                        ? t('scenes.metaManager.agencySchemes.detail.title.editMode.title', {triplet: agencySchemeTriplet})
                        : t('scenes.metaManager.agencySchemes.detail.title.viewMode.title', {triplet: agencySchemeTriplet})
                    )
                    : t('scenes.metaManager.agencySchemes.detail.title.createMode.title')
                }
                onCancel={onAgencySchemeDetailHide}
                footer={
                  <div>
                    <Button onClick={onAgencySchemeDetailHide}>{t('commons.buttons.close.title')}</Button>
                    {agencySchemeTriplet === null || userHasPermissionsToEdit
                      ? (
                        <Button
                          disabled={isSubmitDisabled}
                          type="primary"
                          onClick={
                            agencySchemeTriplet !== null
                              ? () => onAgencySchemeDetailUpdate(agencyScheme, itemsTree, itemsOrderAnnotationType)
                              : () => onAgencySchemeDetailCreate(agencyScheme, {
                                id: agencyScheme.id,
                                agencyID: agencyScheme.agencyID,
                                version: agencyScheme.version
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
                    return agencySchemeTriplet
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
                                onClick={() => onAgencySchemeDownloadShow([agencySchemeTriplet], lang)}
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
                                  onClick={() => onAgencySchemeCloneShow(agencySchemeTriplet)}
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
                                onClick={() => onAgencySchemeExportShow(agencySchemeTriplet)}
                              />
                            </Col>
                          </Row>
                          <Tabs
                            defaultActiveKey={focusItemsTab
                              ? "items"
                              : "general"
                            }
                            onTabClick={
                              key => {
                                if (key === "categorisations") {
                                  Modal.error({title: t('errors.notImplemented')});
                                }
                                if (isAgencySchemeGeneralTabDirty) {
                                  onAgencySchemeDetailUpdate(agencyScheme, itemsTree, itemsOrderAnnotationType)
                                }
                              }
                            }
                          >
                            <Tabs.TabPane
                              key="general"
                              tab={t('commons.artefact.tabs.general.title')}
                            >
                              <ArtefactForm
                                artefact={agencyScheme}
                                mode={userHasPermissionsToEdit ? ARTEFACT_FORM_MODE_EDIT : ARTEFACT_FORM_MODE_READ}
                                agencies={agencies}
                                onChange={onArtefactFormChange}
                                isIdDisabled
                                isVersionDisabled
                              />
                            </Tabs.TabPane>
                            <Tabs.TabPane
                              key="items"
                              tab={t('commons.artefact.tabs.items.title')}
                              disabled={isSubmitDisabled}
                            >
                              <AgencySchemesDetailItems/>
                            </Tabs.TabPane>
                            <Tabs.TabPane
                              key="categorisations"
                              tab={t('commons.artefact.tabs.categorisations.title')}
                              disabled={isSubmitDisabled}
                            >
                            </Tabs.TabPane>
                          </Tabs>
                        </Fragment>
                      )
                      : (
                        <ArtefactForm
                          artefact={agencyScheme}
                          mode={ARTEFACT_FORM_MODE_CREATE}
                          agencies={agencies}
                          onChange={onArtefactFormChange}
                          isIdDisabled
                          isVersionDisabled
                        />
                      )
                  }}
                </DataLanguageConsumer>
              </EnhancedModal>
            </Call>
          </Call>
        )
      }}
    </DataLanguageConsumer>
  )
};

export default compose(
  translate(),
  connect(mapStateToProps, mapDispatchToProps),
)(AgencySchemesDetail);
