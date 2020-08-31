import {REQUEST_SUCCESS} from '../../../middlewares/api/actions';
import {
  APP_CONFIG_AGENCIES_CHANGE,
  APP_CONFIG_CONFIG_READ,
  APP_CONFIG_CONFIG_SUBMIT,
  APP_CONFIG_DATA_MANAGEMENT_CHANGE,
  APP_CONFIG_DEFAULT_HEADER_SUBMIT_STRUCTURE_CHANGE,
  APP_CONFIG_ENDPOINT_SETTINGS_CHANGE,
  APP_CONFIG_SUPERUSER_CREDENTIALS_CHANGE,
  APP_CONFIG_USER_INTERFACE_FORM_CHANGE
} from "./actions";
import _ from "lodash";

const appConfigReducer = (
  state = {
    config: {
      UserInterface: {
        MaxTreeNodes: null,
        MaxTreeNodesForPagination: null,
        MinTreeNodesForPagination: null,
        MaxNodeForExpandAll: null,
        TreePageSize: null,
        DefaultSidebarCollapsed: null,
        Languages: null,
        DefaultLanguage: null,
        AnonymousPages: null
      },
      Agencies: null,
      DataManagement: {
        CubeCodePrefix: null,
        DataLanguages: [],
        MaxDescriptionLength: null
      },
      DefaultHeaderSubmitStructure: {
        ID: null,
        test: null,
        prepared: null,
        sender: null,
        receiver: null
      },
      SuperUserCredentials: null,
      EndpointSetting: {
        NsiTimeOut: null,
        DmTimeOut: null,
        MaTimeOut: null
      }
    },
    isFetchConfigDisabled: false
  },
  action
) => {
  switch (action.type) {
    case APP_CONFIG_USER_INTERFACE_FORM_CHANGE: {
      const userInterface = _.cloneDeep(state.config.UserInterface);
      const customizer = (_, src, key) => {
        if (key === "Languages" || key === "AnonymousPages")
          return src;
        else {
          return undefined
        }
      };
      return {
        ...state,
        config: {
          ...state.config,
          UserInterface: _.mergeWith(userInterface, action.fields, customizer)
        }
      };
    }
    case APP_CONFIG_AGENCIES_CHANGE: {
      return {
        ...state,
        config: {
          ...state.config,
          Agencies: action.fields
        }
      };
    }
    case APP_CONFIG_DATA_MANAGEMENT_CHANGE: {
      const dataManagement = _.cloneDeep(state.config.DataManagement);
      const customizer = (_, src, key) => {
        if (key === "DataLanguages")
          return src;
        else {
          return undefined
        }
      };
      return {
        ...state,
        config: {
          ...state.config,
          DataManagement: _.mergeWith(dataManagement, action.fields, customizer)
        }
      };
    }
    case APP_CONFIG_DEFAULT_HEADER_SUBMIT_STRUCTURE_CHANGE: {
      const defaultHeaderSubmitStructure = _.cloneDeep(state.config.DefaultHeaderSubmitStructure);
      return {
        ...state,
        config: {
          ...state.config,
          DefaultHeaderSubmitStructure: _.merge(defaultHeaderSubmitStructure, action.fields)
        }
      };
    }
    case APP_CONFIG_SUPERUSER_CREDENTIALS_CHANGE: {
      return {
        ...state,
        config: {
          ...state.config,
          SuperUserCredentials: action.fields
        }
      };
    }
    case APP_CONFIG_ENDPOINT_SETTINGS_CHANGE: {
      const endpointSettings = _.cloneDeep(state.config.EndpointSetting);
      return {
        ...state,
        config: {
          ...state.config,
          EndpointSetting: _.merge(endpointSettings, action.fields)
        }
      };
    }
    case REQUEST_SUCCESS:
      switch (action.label) {
        case APP_CONFIG_CONFIG_READ:
          return {
            ...state,
            config: {
              ...state.config,
              ...action.response,
              SuperUserCredentials:
                action.response.SuperUserCredentials
                  .map(el => ({
                    ...el,
                    password: "",
                    confirmPassword: ""
                  }))
            },
            isFetchConfigDisabled: true
          };
        case APP_CONFIG_CONFIG_SUBMIT:
          return {
            ...state,
            isFetchConfigDisabled: false
          };
        default:
          return state;
      }
    default:
      return state;
  }
};

export default appConfigReducer;
