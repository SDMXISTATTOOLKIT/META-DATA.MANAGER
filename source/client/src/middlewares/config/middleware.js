import {CONFIG_INIT, CONFIG_READ, readConfig} from '../../reducers/config/actions';
import {REQUEST_SUCCESS} from '../api/actions';
import {APP_CONFIG_CONFIG_SUBMIT} from '../../scenes/configuration/app-config/actions';
import {
  NODES_CONFIG_NODE_AGENCY_ASSIGNED_TO_ANY_USER_CHECK,
  NODES_CONFIG_NODE_CONFIG_SUBMIT,
  NODES_CONFIG_NODE_REMOVE,
  NODES_CONFIG_NODE_SORT
} from '../../scenes/configuration/nodes-config/actions';
import {pingNode} from '../../page/header/endpoint-dropdown/actions';
import {Modal} from "antd";

const configMiddlewareFactory = i18next => ({dispatch, getState}) => next => action => {

  const t = i18next.t.bind(i18next);

  if (action.type === CONFIG_INIT ||
    (
      action.type === REQUEST_SUCCESS &&
      (
        action.label === APP_CONFIG_CONFIG_SUBMIT ||
        action.label === NODES_CONFIG_NODE_CONFIG_SUBMIT ||
        action.label === NODES_CONFIG_NODE_SORT ||
        action.label === NODES_CONFIG_NODE_REMOVE
      )
    )
  ) {
    dispatch(readConfig(undefined, action.label === NODES_CONFIG_NODE_SORT || action.label === NODES_CONFIG_NODE_REMOVE));
  }

  if (action.type === REQUEST_SUCCESS && action.label === NODES_CONFIG_NODE_AGENCY_ASSIGNED_TO_ANY_USER_CHECK) {
    if (action.response === false) {
      action.onSuccess();
    } else {
      Modal.error({
        title: t('scenes.configuration.nodesConfig.agencies.agencies.agencyAssignedToAnyUserModal.title'),
        content: t('scenes.configuration.nodesConfig.agencies.agencies.agencyAssignedToAnyUserModal.content'),
      });
    }
  }

  let result = next(action);

  if (!action.doNotPing && action.type === REQUEST_SUCCESS && action.label === CONFIG_READ && getState().app.endpointId !== null) {
    dispatch(pingNode());
  }

  return result;
};

export default configMiddlewareFactory;
