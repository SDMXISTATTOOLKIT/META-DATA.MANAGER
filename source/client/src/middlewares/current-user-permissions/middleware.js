import _ from "lodash";

const CURRENT_USER_PERMISSIONS_KEY = 'CURRENT_USER_PERMISSIONS_KEY';

export const getCurrentUserPermissions = action => action[CURRENT_USER_PERMISSIONS_KEY];

const currentUserPermissionsMiddleware = ({getState}) => next => action => {

  const state = getState();

  let decoratedAction = {
    ...action,
    [CURRENT_USER_PERMISSIONS_KEY]: state.app.user && state.app.user.permissions
      ? _.cloneDeep(state.app.user.permissions)
      : null
  };

  return next(decoratedAction);

};

export default currentUserPermissionsMiddleware;
