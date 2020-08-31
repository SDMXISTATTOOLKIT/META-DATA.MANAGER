import {deleteRequest, getRequest, postRequest, putRequest} from "../../../middlewares/api/actions";
import {
  getCreateUserUrl,
  getDeleteUserUrl,
  getReadPermissionsUrl,
  getSynchronizeAuthDBUrl,
  getUpdateUserUrl,
  getUsers
} from "../../../constants/urls";

export const USER_MANAGEMENT_USERS_READ = 'USER_MANAGEMENT_USERS_READ';
export const USER_MANAGEMENT_USER_READ = 'USER_MANAGEMENT_USER_READ';
export const USER_MANAGEMENT_USER_EDIT = 'USER_MANAGEMENT_USER_EDIT';
export const USER_MANAGEMENT_USER_HIDE = 'USER_MANAGEMENT_USER_HIDE';
export const USER_MANAGEMENT_USER_CHANGE = 'USER_MANAGEMENT_USER_CHANGE';
export const USER_MANAGEMENT_USER_CREATE = 'USER_MANAGEMENT_USER_CREATE';
export const USER_MANAGEMENT_SUBMIT = 'USER_MANAGEMENT_SUBMIT';
export const USER_MANAGEMENT_SYNCHRONIZE = 'USER_MANAGEMENT_SYNCHRONIZE';
export const USER_MANAGEMENT_USER_DELETE = 'USER_MANAGEMENT_USER_DELETE';

export const readUserManagementUsers = () => getRequest(
  USER_MANAGEMENT_USERS_READ,
  getUsers()
);

export const readUserManagementUser = () => getRequest(
  USER_MANAGEMENT_USER_READ,
  getReadPermissionsUrl()
);

export const editUserManagementUser = (username, email) => ({
  type: USER_MANAGEMENT_USER_EDIT,
  username,
  email
});

export const hideUserManagementUser = () => ({
  type: USER_MANAGEMENT_USER_HIDE
});

export const changeUserManagementUser = fields => ({
  type: USER_MANAGEMENT_USER_CHANGE,
  fields
});

export const createUserManagementUser = (username, password, email) => postRequest(
  USER_MANAGEMENT_USER_CREATE,
  getCreateUserUrl(),
  {
    username: username,
    password: btoa(password || ""),
    email: email
  },
  t => ({
    success: t('scenes.manageUsers.userManagement.messages.createUserSubmit.success')
  })
);

export const synchronizeUserManagement = () => postRequest(
  USER_MANAGEMENT_SYNCHRONIZE,
  getSynchronizeAuthDBUrl()
);

export const submitUserManagement = (user, token, editPassword, isLoginValid) => ({
  ...putRequest(
    USER_MANAGEMENT_SUBMIT,
    getUpdateUserUrl(),
    {
      username: user.username,
      token,
      password: editPassword ? btoa(user.password || "") : null,
      email: user.email
    },
    t => ({
      success: isLoginValid
        ? t('scenes.manageUsers.userManagement.messages.editUserSubmit.success')
        : t('scenes.manageUsers.userManagement.messages.editCurrentUserSubmit.success')
    })
  ),
  isLoginValid
});

export const deleteUserManagementUser = username => deleteRequest(
  USER_MANAGEMENT_USER_DELETE,
  getDeleteUserUrl(username),
  t => ({
    success: t('scenes.manageUsers.userManagement.messages.deleteUser.success')
  })
);
