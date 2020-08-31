import _ from "lodash";

const CURRENT_NODE_CONFIG_KEY = 'CURRENT_NODE_CONFIG_KEY';

export const getCurrentNodeConfig = action => action[CURRENT_NODE_CONFIG_KEY];

const currentNodeConfigMiddleware = ({getState}) => next => action => {

  const state = getState();

  let decoratedAction = action;

  if (state.app.endpointId !== null && state.config.nodes !== null && state.config.nodes.length > 0) {
    decoratedAction = {
      ...action,
      [CURRENT_NODE_CONFIG_KEY]: _.cloneDeep(state.config.nodes.find(node => node.general.id === state.app.endpointId))
    };
  }

  return next(decoratedAction);

};

export default currentNodeConfigMiddleware;
