import {postRequest} from "../../../middlewares/api/actions";
import {getLoginUrl, getLogoutUrl, getRecoverPasswordUrl} from "../../../constants/urls";

export const USER_DROPDOWN_USER_LOGIN = 'USER_DROPDOWN_USER_LOGIN';
export const USER_DROPDOWN_USER_LOGOUT = 'USER_DROPDOWN_USER_LOGOUT';
export const USER_DROPDOWN_USER_PASSWORD_RECOVER = 'USER_DROPDOWN_USER_PASSWORD_RECOVER';

export const loginUserDropdownUser = (username, password) =>
  postRequest(
    USER_DROPDOWN_USER_LOGIN,
    getLoginUrl(),
    {
      Username: username,
      Password: btoa(password || "")
    }
  );

export const logoutUserDropdownUser = () =>
  postRequest(
    USER_DROPDOWN_USER_LOGOUT,
    getLogoutUrl()
  );

export const recoverUserDropdownUserPassword = (username, email) =>
  postRequest(
    USER_DROPDOWN_USER_PASSWORD_RECOVER,
    getRecoverPasswordUrl(),
    {
      username,
      email
    },
    t => ({
      success: t('page.header.userDropdown.recoverPassword.messages.success')
    })
  );
