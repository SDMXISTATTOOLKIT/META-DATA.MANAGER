import {CONFIG_READ} from "../../reducers/config/actions";
import {REQUEST_SUCCESS} from "../api/actions";
import {APP_CONFIG_CONFIG_SUBMIT} from "../../scenes/configuration/app-config/actions";
import {NODES_CONFIG_NODE_CONFIG_SUBMIT} from "../../scenes/configuration/nodes-config/actions";

export const PERSISTENCE_LOCAL_STORAGE_KEY = "app";
export const PERSISTENCE_ACTION_KEY = "persistentAppState";

const persistenceMiddleware = ({getState}) => next => action => {

  const {
    type,
    label
  } = action;

  if (type === REQUEST_SUCCESS && label === CONFIG_READ) {
    action[PERSISTENCE_ACTION_KEY] = JSON.parse(localStorage.getItem(PERSISTENCE_LOCAL_STORAGE_KEY));
  } else if (
    type === REQUEST_SUCCESS && (label === APP_CONFIG_CONFIG_SUBMIT || label === NODES_CONFIG_NODE_CONFIG_SUBMIT)
  ) {
    localStorage.removeItem(PERSISTENCE_LOCAL_STORAGE_KEY);
  }

  const result = next(action);

  const appState = getState().app;

  if (appState.endpointId !== null) {

    localStorage.setItem(
      PERSISTENCE_LOCAL_STORAGE_KEY,
      JSON.stringify({
        endpointId: appState.endpointId,
        language: appState.language,
        isSidebarCollapsed: appState.isSidebarCollapsed,
        user: {
          username: appState.user.username,
          token: appState.user.token
        }
      })
    );
  }

  return result;
};

export default persistenceMiddleware;
