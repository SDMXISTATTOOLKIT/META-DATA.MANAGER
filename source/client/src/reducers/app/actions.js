import {getRequest} from "../../middlewares/api/actions";
import {getReadPermissionsUrl} from "../../constants/urls";

export const APP_SIDEBAR_COLLAPSE = 'APP_SIDEBAR_COLLAPSE';
export const APP_SIDEBAR_UNCOLLAPSE = 'APP_SIDEBAR_UNCOLLAPSE';
export const APP_LANGUAGE_SET = 'APP_LANGUAGE_SET';
export const APP_ENDPOINT_SET = 'APP_ENDPOINT_SET';
export const APP_USER_DROPDOWN_VISIBLE_CHANGE = 'APP_USER_DROPDOWN_VISIBLE_CHANGE';
export const APP_USER_CLEAR = 'APP_USER_CLEAR';
export const APP_USER_PERMISSIONS_READ = 'APP_USER_PERMISSIONS_READ';

export const collapseAppSidebar = () => ({
  type: APP_SIDEBAR_COLLAPSE
});

export const expandAppSidebar = () => ({
  type: APP_SIDEBAR_UNCOLLAPSE
});

export const setAppLanguage = language => ({
  type: APP_LANGUAGE_SET,
  payload: {language}
});

export const setAppEndpoint = endpointId => ({
  type: APP_ENDPOINT_SET,
  endpointId
});

export const changeAppUserDropdownVisible = visible => ({
  type: APP_USER_DROPDOWN_VISIBLE_CHANGE,
  visible
});

export const clearAppUser = () => ({
  type: APP_USER_CLEAR
});

export const readAppUserPermissions = () => getRequest(
  APP_USER_PERMISSIONS_READ,
  getReadPermissionsUrl()
);
