import {
  logoutUserDropdownUser,
  USER_DROPDOWN_USER_LOGIN,
  USER_DROPDOWN_USER_LOGOUT
} from "../../page/header/user-dropdown/actions";
import {APP_ENDPOINT_SET, APP_USER_CLEAR, readAppUserPermissions} from "../../reducers/app/actions";
import {Col, Icon, message, Modal, Row} from 'antd';
import {REQUEST_ERROR, REQUEST_SUCCESS} from "../api/actions";
import {SET_PERMISSIONS_PERMISSIONS_SUBMIT} from "../../scenes/manage-users/set-permissions/actions";
import {CONFIG_READ} from "../../reducers/config/actions";
import React from 'react';
import SuperUserLoginForm from "./SuperUserLoginForm";
import {
  logoutSuperUser,
  submitSuperUserLoginForm,
  SUPER_USER_LOGIN_FORM_SHOW,
  SUPER_USER_LOGIN_FORM_SUBMIT
} from "./actions";
import {ENDPOINT_DROPDOWN_NODE_PING, pingNode} from "../../page/header/endpoint-dropdown/actions";
import {
  METADATAFLOWS_DETAIL_METADATAFLOW_CREATE_SUBMIT,
  METADATAFLOWS_METADATAFLOW_CLONE_SUBMIT
} from "../../scenes/meta-manager/metadataflows/actions";
import {
  DATAFLOWS_DATAFLOW_CLONE_SUBMIT,
  DATAFLOWS_DETAIL_DATAFLOW_CREATE_SUBMIT
} from "../../scenes/meta-manager/dataflows/actions";
import {BUILDER_CUBE_FORM_SUBMIT} from "../../scenes/data-manager/builder/cube-form/actions";
import {
  NODES_CONFIG_CONFIG_READ,
  NODES_CONFIG_MSDS_READ,
  NODES_CONFIG_NODE_CHECK_ENDPOINT_DM,
  NODES_CONFIG_NODE_CHECK_ENDPOINT_MA,
  NODES_CONFIG_NODE_CHECK_ENDPOINT_NSI,
  NODES_CONFIG_NODE_CONFIG_SUBMIT,
  NODES_CONFIG_NODE_REMOVE,
  NODES_CONFIG_NODE_SORT
} from "../../scenes/configuration/nodes-config/actions";
import {APP_CONFIG_CONFIG_READ, APP_CONFIG_CONFIG_SUBMIT} from "../../scenes/configuration/app-config/actions";
import {isClassificationsServer} from "../../page/utils";

const authenticationMiddlewareFactory = i18next => ({getState, dispatch}) => next => action => {

  const t = i18next.t.bind(i18next);

  const result = next(action);

  const {
    type,
    label
  } = action;

  if (
    getState().app.user.username && (
      type === APP_ENDPOINT_SET ||
      (label === ENDPOINT_DROPDOWN_NODE_PING && type === REQUEST_ERROR)
    )
  ) {
    dispatch(logoutUserDropdownUser());
  }

  if (type === APP_USER_CLEAR) {
    message.warn(t('middlewares.authentication.messages.clear'));
  }

  if (getState().app.user.username && type === REQUEST_SUCCESS &&
    (
      label === CONFIG_READ ||
      label === USER_DROPDOWN_USER_LOGIN ||
      label === SET_PERMISSIONS_PERMISSIONS_SUBMIT ||
      label === METADATAFLOWS_DETAIL_METADATAFLOW_CREATE_SUBMIT ||
      label === METADATAFLOWS_METADATAFLOW_CLONE_SUBMIT ||
      label === DATAFLOWS_DETAIL_DATAFLOW_CREATE_SUBMIT ||
      label === DATAFLOWS_DATAFLOW_CLONE_SUBMIT ||
      label === BUILDER_CUBE_FORM_SUBMIT
    )
  ) {
    dispatch(readAppUserPermissions())
  }

  if (type === SUPER_USER_LOGIN_FORM_SHOW) {
    Modal.destroyAll();
    let modal = Modal.info();
    modal.update({
      icon: 'lock',
      title: (
        <Row type="flex" justify="space-between">
          <Col>
            {t('middlewares.authentication.superUserLoginModal.title')}
          </Col>
          <Col>
            <Icon
              type="close"
              onClick={() => {
                modal.destroy();
                window.open('./#', '_self')
              }}
              style={{cursor: 'pointer'}}
            />
          </Col>
        </Row>
      ),
      content:
        <SuperUserLoginForm
          t={t}
          modal={modal}
          onSubmit={(username, password) => dispatch(submitSuperUserLoginForm(username, password, action.onSuccessAction))}
        />,
      okButtonProps: {style: {display: 'none'}},
      keyboard: false
    });
  }

  if (type === REQUEST_SUCCESS && label === SUPER_USER_LOGIN_FORM_SUBMIT) {
    Modal.destroyAll();
    if (action.onSuccessAction || window.superUserModalOnSuccessAction) {
      dispatch(action.onSuccessAction || window.superUserModalOnSuccessAction);
      window.superUserModalOnSuccessAction = undefined;
    }
  }

  if (type === REQUEST_ERROR && label === SUPER_USER_LOGIN_FORM_SUBMIT && action.onSuccessAction) {
    window.superUserModalOnSuccessAction = action.onSuccessAction;
  }

  if (type === REQUEST_ERROR && (
      label === APP_CONFIG_CONFIG_READ ||
      label === APP_CONFIG_CONFIG_SUBMIT ||
      label === NODES_CONFIG_CONFIG_READ ||
      label === NODES_CONFIG_NODE_CONFIG_SUBMIT ||
      label === NODES_CONFIG_NODE_REMOVE ||
      label === NODES_CONFIG_NODE_SORT ||
      label === NODES_CONFIG_NODE_CHECK_ENDPOINT_NSI ||
      label === NODES_CONFIG_NODE_CHECK_ENDPOINT_MA ||
      label === NODES_CONFIG_NODE_CHECK_ENDPOINT_DM ||
      label === NODES_CONFIG_MSDS_READ
    ) &&
    action.error && action.error.errorCode === "UNAUTHORIZED"
  ) {
    dispatch(logoutSuperUser());
  }

  if (
    type === REQUEST_SUCCESS &&
    label === USER_DROPDOWN_USER_LOGIN &&
    isClassificationsServer(action.response.username, action.response, getState().config.userInterface.anonymousPages, t)
  ) {
    window.open(`./#/meta-manager/${action.response.functionality[0]}`, '_self')
  }

  if (type === REQUEST_SUCCESS && label === USER_DROPDOWN_USER_LOGIN && getState().app.isEndpointAvailable === false) {
    dispatch(pingNode());
  }

  if (type === REQUEST_SUCCESS && label === USER_DROPDOWN_USER_LOGOUT && getState().app.isEndpointAvailable === false) {
    dispatch(pingNode());
  }

  if (type === APP_ENDPOINT_SET && (getState().app.user === null || getState().app.user.username === null)) {
    dispatch(pingNode());
  }

  return result;
};

export default authenticationMiddlewareFactory;
