import React from 'react';
import {connect} from "react-redux";
import {compose} from "redux"
import {translate} from 'react-i18next';
import {Button, Col, Divider, Row, Tabs} from "antd";
import Call from "../../../hocs/call";
import UserInterfaceForm from "./UserInterfaceForm";
import AgenciesForm from "./AgenciesForm";
import DataManagementForm from "./DataManagementForm";
import DefaultHeaderSubmitStructureForm from "./DefaultHeaderSubmitStructureForm";
import SuperUserCredentials from "./SuperUserCredentialList";
import {readAppConfigConfig, submitAppConfigConfig} from "./actions";
import {showSuperUserLoginForm} from "../../../middlewares/authentication/actions";
import {isDictionaryValid} from "../../../utils/artefactValidators";
import EndpointSettingsForm from "./EndpointSettingsForm";

const mapStateToProps = state => ({
  config: state.scenes.configuration.appConfig.config,
  isFetchConfigDisabled: state.scenes.configuration.appConfig.isFetchConfigDisabled,
  superUserUsername: state.app.superUser.username
});

const mapDispatchToProps = dispatch => ({
  fetchConfig: () => dispatch(readAppConfigConfig()),
  submitConfig: config => dispatch(submitAppConfigConfig(config)),
  showConfigurationSuperUserLoginForm: () => dispatch(showSuperUserLoginForm()),
});

const AppConfig = ({
                     t,
                     config,
                     isFetchConfigDisabled,
                     superUserUsername,
                     fetchConfig,
                     submitConfig,
                     showConfigurationSuperUserLoginForm
                   }) =>
  <Call cb={showConfigurationSuperUserLoginForm} disabled={superUserUsername !== null}>
    {superUserUsername && (
      <Call cb={fetchConfig} disabled={isFetchConfigDisabled}>
        <Tabs
          tabPosition={"left"}
        >
          <Tabs.TabPane
            key={"userInterface"}
            tab={t('scenes.configuration.appConfig.tabs.userInterface.title')}
          >
            <UserInterfaceForm/>
          </Tabs.TabPane>
          <Tabs.TabPane
            key={"agencies"}
            tab={t('scenes.configuration.appConfig.tabs.agencies.title')}
          >
            <AgenciesForm/>
          </Tabs.TabPane>
          <Tabs.TabPane
            key={"dataManagement"}
            tab={t('scenes.configuration.appConfig.tabs.dataManagement.title')}
          >
            <DataManagementForm/>
          </Tabs.TabPane>
          <Tabs.TabPane
            key={"defaultHeaderSubmitStructure"}
            tab={t('scenes.configuration.appConfig.tabs.defaultHeaderSubmitStructure.title')}
          >
            <DefaultHeaderSubmitStructureForm/>
          </Tabs.TabPane>
          <Tabs.TabPane
            key={"superUserCredentials"}
            tab={t('scenes.configuration.appConfig.tabs.superUserCredentials.title')}
          >
            <SuperUserCredentials/>
          </Tabs.TabPane>
          <Tabs.TabPane
            key={"endpointSettings"}
            tab={t('scenes.configuration.appConfig.tabs.endpointSettings.title')}
          >
            <EndpointSettingsForm/>
          </Tabs.TabPane>
        </Tabs>
        <Divider/>
        <Row type="flex" justify="start">
          <Col>
            <Button
              type="primary"
              onClick={() => submitConfig(config)}
              disabled={
                !config ||
                !config.UserInterface || (
                  (config.UserInterface.MinTreeNodesForPagination === null || config.UserInterface.MinTreeNodesForPagination.length === 0) ||
                  (config.UserInterface.MaxNodeForExpandAll === null || config.UserInterface.MaxNodeForExpandAll.length === 0) ||
                  (config.UserInterface.TreePageSize === null || config.UserInterface.TreePageSize.length === 0) ||
                  (config.UserInterface.Languages === null || config.UserInterface.Languages.findIndex(el => (el === null || el === "")) !== -1) ||
                  (config.UserInterface.DefaultLanguage === null || config.UserInterface.DefaultLanguage.length === 0) ||
                  (config.UserInterface.AnonymousPages === null || config.UserInterface.AnonymousPages.length === 0)
                ) || (
                  config.Agencies.find(ag => !ag.Id || ag.Id.length === 0 || !isDictionaryValid(ag.Name)) !== undefined
                ) ||
                !config.DataManagement || (
                  config.DataManagement.DataLanguages === null || config.DataManagement.DataLanguages.findIndex(el => (el === null || el === "") !== -1) ||
                  config.DataManagement.MaxDescriptionLength === null || config.DataManagement.MaxDescriptionLength.length === 0
                ) ||
                !config.DefaultHeaderSubmitStructure || (
                  (config.DefaultHeaderSubmitStructure.ID === null || config.DefaultHeaderSubmitStructure.ID.length === 0) ||
                  (config.DefaultHeaderSubmitStructure.prepared === null || config.DefaultHeaderSubmitStructure.prepared.length === 0) ||
                  (config.DefaultHeaderSubmitStructure.sender === null || config.DefaultHeaderSubmitStructure.sender.length === 0) ||
                  (config.DefaultHeaderSubmitStructure.receiver === null || config.DefaultHeaderSubmitStructure.receiver.length === 0)
                ) ||
                !config.SuperUserCredentials || (
                  (config.SuperUserCredentials.findIndex(el => (el.username === null || el.username === "")) !== -1) ||
                  (config.SuperUserCredentials.findIndex(el => (el.password || "") !== (el.confirmPassword || "")) !== -1)
                ) ||
                !config.EndpointSetting || (
                  (config.EndpointSetting.NsiTimeOut === null || config.EndpointSetting.NsiTimeOut.length === 0) ||
                  (config.EndpointSetting.DmTimeOut === null || config.EndpointSetting.DmTimeOut.length === 0) ||
                  (config.EndpointSetting.MaTimeOut === null || config.EndpointSetting.MaTimeOut.length === 0)
                )
              }
            >
              {t("commons.buttons.save.title")}
            </Button>
          </Col>
        </Row>
      </Call>
    )}
  </Call>;

export default compose(
  translate(),
  connect(mapStateToProps, mapDispatchToProps)
)(AppConfig);
