import {postRequest} from "../api/actions";
import {getSuperUserLoginUrl, getSuperUserLogoutUrl} from "../../constants/urls";

export const SUPER_USER_LOGIN_FORM_SUBMIT = 'SUPER_USER_LOGIN_FORM_SUBMIT';
export const SUPER_USER_LOGIN_FORM_SHOW = 'SUPER_USER_LOGIN_FORM_SHOW';
export const SUPER_USER_LOGOUT = 'SUPER_USER_LOGOUT';

export const showSuperUserLoginForm = () => ({
  type: SUPER_USER_LOGIN_FORM_SHOW
});

export const submitSuperUserLoginForm = (username, password, onSuccessAction) => ({
  ...postRequest(
    SUPER_USER_LOGIN_FORM_SUBMIT,
    getSuperUserLoginUrl(),
    {
      Username: username,
      Password: btoa(password)
    }
  ),
  username,
  onSuccessAction
});

export const logoutSuperUser = () => postRequest(
  SUPER_USER_LOGOUT,
  getSuperUserLogoutUrl()
);
