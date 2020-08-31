import {allRequest, getRequest, postRequest, REQUEST_METHOD_GET} from "../../../middlewares/api/actions";
import {
  getAgencyNamesUrl,
  getAllAgenciesUrl,
  getAllCubeUrl,
  getAllFunctionalitiesUrl,
  getAllRulesUrl,
  getDcsUrl,
  getReadPermissionsUrl,
  getSubmitPermissionsUrl,
  getSynchronizeAuthDBUrl,
  getUsers
} from "../../../constants/urls";

export const SET_PERMISSIONS_USERS_READ = 'SET_PERMISSIONS_USERS_READ';
export const SET_PERMISSIONS_PERMISSIONS_READ = 'SET_PERMISSIONS_PERMISSIONS_READ';
export const SET_PERMISSIONS_USER_EDIT = 'SET_PERMISSIONS_USER_EDIT';
export const SET_PERMISSIONS_USER_HIDE = 'SET_PERMISSIONS_USER_HIDE';
export const SET_PERMISSIONS_TAB_CHANGE = 'SET_PERMISSIONS_TAB_CHANGE';
export const SET_PERMISSIONS_FUNCTIONALITIES_READ = 'SET_PERMISSIONS_FUNCTIONALITIES_READ';
export const SET_PERMISSIONS_FUNCTIONALITIES_CHANGE = 'SET_PERMISSIONS_FUNCTIONALITIES_CHANGE';
export const SET_PERMISSIONS_RULES_READ = 'SET_PERMISSIONS_RULES_READ';
export const SET_PERMISSIONS_RULES_CHANGE = 'SET_PERMISSIONS_RULES_CHANGE';
export const SET_PERMISSIONS_AGENCIES_READ = 'SET_PERMISSIONS_AGENCIES_READ';
export const SET_PERMISSIONS_AGENCIES_CHANGE = 'SET_PERMISSIONS_AGENCIES_CHANGE';
export const SET_PERMISSIONS_CATEGORISED_CUBES_READ = 'SET_PERMISSIONS_CATEGORISED_CUBES_READ';
export const SET_PERMISSIONS_CATEGORISED_CUBES_CHANGE = 'SET_PERMISSIONS_CATEGORISED_CUBES_CHANGE';
export const SET_PERMISSIONS_PERMISSIONS_SUBMIT = 'SET_PERMISSIONS_PERMISSIONS_SUBMIT';
export const SET_PERMISSIONS_SYNCHRONIZE = 'SET_PERMISSIONS_SYNCHRONIZE';

export const readSetPermissionsUsers = () => getRequest(
  SET_PERMISSIONS_USERS_READ,
  getUsers()
);

export const readSetPermissionsPermissions = username => getRequest(
  SET_PERMISSIONS_PERMISSIONS_READ,
  getReadPermissionsUrl(username)
);

export const editSetPermissionsUser = (username, email) => ({
  type: SET_PERMISSIONS_USER_EDIT,
  username,
  email
});

export const hideSetPermissionsUser = () => ({
  type: SET_PERMISSIONS_USER_HIDE
});

export const changeSetPermissionsTab = tab => ({
  type: SET_PERMISSIONS_TAB_CHANGE,
  tab
});

export const readSetPermissionsFunctionalities = menu => ({
  ...getRequest(
    SET_PERMISSIONS_FUNCTIONALITIES_READ,
    getAllFunctionalitiesUrl()
  ),
  menu
});

export const readSetPermissionsRules = () => getRequest(
  SET_PERMISSIONS_RULES_READ,
  getAllRulesUrl()
);

export const readSetPermissionsAgencies = () => allRequest(
  SET_PERMISSIONS_AGENCIES_READ,
  [REQUEST_METHOD_GET, REQUEST_METHOD_GET],
  [getAllAgenciesUrl(), getAgencyNamesUrl()]
);

export const readSetPermissionsCategorisedCubes = () => allRequest(
  SET_PERMISSIONS_CATEGORISED_CUBES_READ,
  [REQUEST_METHOD_GET, REQUEST_METHOD_GET],
  [getAllCubeUrl(), getDcsUrl()],
);

export const changeSetPermissionsFunctionalitiesPermissions = functionalitiesPermissions => ({
  type: SET_PERMISSIONS_FUNCTIONALITIES_CHANGE,
  functionalitiesPermissions
});

export const changeSetPermissionsRulesPermissions = rulesPermissions => ({
  type: SET_PERMISSIONS_RULES_CHANGE,
  rulesPermissions
});

export const changeSetPermissionsAgenciesPermissions = agenciesPermissions => ({
  type: SET_PERMISSIONS_AGENCIES_CHANGE,
  agenciesPermissions
});

export const changeSetPermissionsCategorisedCubesPermissions = categorisedCubesPermissions => ({
  type: SET_PERMISSIONS_CATEGORISED_CUBES_CHANGE,
  categorisedCubesPermissions
});

export const submitSetPermissionsPermissions = (username, permissions, token) => postRequest(
  SET_PERMISSIONS_PERMISSIONS_SUBMIT,
  getSubmitPermissionsUrl(),
  {
    ...permissions,
    username,
    token
  },
  t => ({
    success: t('scenes.manageUsers.setPermissions.messages.permissionsSubmit.success')
  })
);

export const synchronizeSetPermissions = () => postRequest(
  SET_PERMISSIONS_SYNCHRONIZE,
  getSynchronizeAuthDBUrl()
);
