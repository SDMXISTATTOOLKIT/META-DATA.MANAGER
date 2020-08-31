import {
  APP_ENDPOINT_SET,
  APP_LANGUAGE_SET,
  APP_SIDEBAR_COLLAPSE,
  APP_SIDEBAR_UNCOLLAPSE,
  APP_USER_CLEAR,
  APP_USER_DROPDOWN_VISIBLE_CHANGE,
  APP_USER_PERMISSIONS_READ
} from './actions';
import {ENDPOINT_DROPDOWN_NODE_PING} from '../../page/header/endpoint-dropdown/actions';
import {REQUEST_START, REQUEST_SUCCESS} from '../../middlewares/api/actions';
import {CONFIG_READ} from '../config/actions';
import {USER_DROPDOWN_USER_LOGIN, USER_DROPDOWN_USER_LOGOUT} from "../../page/header/user-dropdown/actions";
import {PERSISTENCE_ACTION_KEY} from "../../middlewares/persistence/middleware";
import {SUPER_USER_LOGIN_FORM_SUBMIT, SUPER_USER_LOGOUT} from "../../middlewares/authentication/actions";

const appReducer = (
  state = {
    isSidebarCollapsed: null,
    language: null,
    endpointId: null,
    isEndpointAvailable: null,
    user: {
      username: null,
      email: null,
      token: null,
      permissions: null
    },
    superUser: {
      username: null,
    }
  },
  action
) => {
  switch (action.type) {
    case APP_LANGUAGE_SET:
      return {
        ...state,
        language: action.payload.language
      };
    case APP_ENDPOINT_SET:
      return {
        ...state,
        endpointId: action.endpointId,
        isEndpointAvailable: false
      };
    case APP_SIDEBAR_COLLAPSE: {
      return {
        ...state,
        isSidebarCollapsed: true
      };
    }
    case APP_SIDEBAR_UNCOLLAPSE: {
      return {
        ...state,
        isSidebarCollapsed: false
      };
    }
    // case APP_USER_UNSET:
    //   return {
    //     ...state,
    //     user: {
    //       ...state.user,
    //       username: null,
    //       isDropdownVisible: false
    //     }
    //   };
    case APP_USER_DROPDOWN_VISIBLE_CHANGE:
      return {
        ...state,
        user: {
          ...state.user,
          isDropdownVisible: action.visible
        }
      };
    case APP_USER_CLEAR:
      return {
        ...state,
        user: {
          ...state.user,
          username: null,
          email: null,
          token: null,
          permissions: null
        }
      };
    case REQUEST_START:
      switch (action.label) {
        case ENDPOINT_DROPDOWN_NODE_PING: {
          return {
            ...state,
            isEndpointAvailable: false
          };
        }
        case USER_DROPDOWN_USER_LOGIN:
        case USER_DROPDOWN_USER_LOGOUT:
          return {
            ...state,
            user: {
              ...state.user,
              isDropdownVisible: false
            }
          };
        default:
          return state;
      }
    case REQUEST_SUCCESS:
      switch (action.label) {
        case SUPER_USER_LOGIN_FORM_SUBMIT:
          return {
            ...state,
            superUser: {
              username: action.username
            }
          };
        case SUPER_USER_LOGOUT:
          return {
            ...state,
            superUser: {
              username: null
            }
          };
        case ENDPOINT_DROPDOWN_NODE_PING:
          return {
            ...state,
            isEndpointAvailable: action.response
          };
        case APP_USER_PERMISSIONS_READ:
          return {
            ...state,
            user: {
              ...state.user,
              email: action.response.email,
              permissions: {
                functionality: action.response.functionality,
                agencies: action.response.agencies,
                categories: action.response.category,
                cubeOwner: action.response.cubeOwner,
                cube: action.response.cube,
                rules: action.response.rules,
                dataflowOwner: action.response.dataflowOwner,
                metadataflowOwner: action.response.metadataFlowOwner
              }
            }
          };
        case CONFIG_READ:
          const config = action.response;
          const persistentAppState = action[PERSISTENCE_ACTION_KEY];
          return {
            ...state,
            isSidebarCollapsed:
              persistentAppState
                ? persistentAppState.isSidebarCollapsed
                : config.userInterface.defaultSidebarCollapsed,
            language:
              persistentAppState
                ? persistentAppState.language
                : config.userInterface.defaultLanguage,
            endpointId:
              persistentAppState &&
              config.nodes.filter(node => node.general.id === persistentAppState.endpointId).length
                ? persistentAppState.endpointId
                : config.nodes.length > 0 ? config.nodes[0].general.id : null,
            user:
              persistentAppState
                ? {
                  ...persistentAppState.user,
                  permissions: null
                }
                : state.user
          };
        case USER_DROPDOWN_USER_LOGIN:
          return {
            ...state,
            user: {
              ...state.user,
              username: action.data.Username,
              email: null,
              token: action.response.token,
              permissions: null
            }
          };
        case USER_DROPDOWN_USER_LOGOUT:
          return {
            ...state,
            user: {
              ...state.user,
              username: null,
              email: null,
              token: null,
              permissions: null
            }
          };
        default:
          return state;
      }
    default:
      return state;
  }
};

export default appReducer;
