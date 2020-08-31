import {
  USER_MANAGEMENT_SUBMIT,
  USER_MANAGEMENT_SYNCHRONIZE,
  USER_MANAGEMENT_USER_CHANGE,
  USER_MANAGEMENT_USER_CREATE,
  USER_MANAGEMENT_USER_DELETE,
  USER_MANAGEMENT_USER_EDIT,
  USER_MANAGEMENT_USER_HIDE,
  USER_MANAGEMENT_USER_READ,
  USER_MANAGEMENT_USERS_READ
} from "./actions";
import _ from "lodash";
import {REQUEST_SUCCESS} from "../../../middlewares/api/actions";

const userManagementReducer = (
  state = {
    users: null,
    user: null,
    isSynchronized: false,
    editPassword: false,
    isLoginValid: true
  },
  action
) => {
  switch (action.type) {
    case USER_MANAGEMENT_USER_EDIT:
      return {
        ...state,
        user: {
          username: action.username,
          email: action.email,
          password: null,
          confirmPassword: null
        }
      };
    case USER_MANAGEMENT_USER_HIDE:
      return {
        ...state,
        user: null,
        editPassword: false
      };
    case USER_MANAGEMENT_USER_CHANGE:
      return {
        ...state,
        user: action.fields.editPassword === undefined
          ? _.merge(_.cloneDeep(state.user), action.fields)
          : state.user,
        editPassword: action.fields.editPassword !== undefined
          ? action.fields.editPassword
          : state.editPassword
      };
    case REQUEST_SUCCESS:
      switch (action.label) {
        case USER_MANAGEMENT_SYNCHRONIZE:
          return {
            ...state,
            isSynchronized: true
          };
        case USER_MANAGEMENT_USER_READ:
          return {
            ...state,
            user: {
              username: action.response.username,
              email: action.response.email,
              password: null,
              confirmPassword: null
            }
          };
        case USER_MANAGEMENT_USER_CREATE:
        case USER_MANAGEMENT_USER_DELETE:
          return {
            ...state,
            users: null
          };
        case USER_MANAGEMENT_SUBMIT:
          return {
            ...state,
            users: null,
            user: null,
            editPassword: false,
            isLoginValid: action.isLoginValid
          };
        case USER_MANAGEMENT_USERS_READ:
          return {
            ...state,
            users: action.response
          };
        default:
          return state;
      }
    default:
      return state;
  }
};

export default userManagementReducer;
