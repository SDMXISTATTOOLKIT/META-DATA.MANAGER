import {
  SET_PERMISSIONS_AGENCIES_CHANGE,
  SET_PERMISSIONS_AGENCIES_READ,
  SET_PERMISSIONS_CATEGORISED_CUBES_CHANGE,
  SET_PERMISSIONS_CATEGORISED_CUBES_READ,
  SET_PERMISSIONS_FUNCTIONALITIES_CHANGE,
  SET_PERMISSIONS_FUNCTIONALITIES_READ,
  SET_PERMISSIONS_PERMISSIONS_READ,
  SET_PERMISSIONS_PERMISSIONS_SUBMIT,
  SET_PERMISSIONS_RULES_CHANGE,
  SET_PERMISSIONS_RULES_READ,
  SET_PERMISSIONS_SYNCHRONIZE,
  SET_PERMISSIONS_TAB_CHANGE,
  SET_PERMISSIONS_USER_EDIT,
  SET_PERMISSIONS_USER_HIDE,
  SET_PERMISSIONS_USERS_READ
} from "./actions";
import {REQUEST_SUCCESS} from "../../../middlewares/api/actions";
import {getMappedTree, getNodes} from "../../../utils/tree";
import {getCubesTree} from "../../../utils/treeBuilders";
import _ from "lodash";

export const SET_PERMISSIONS_TAB_FUNCTIONALITIES_KEY = 'SET_PERMISSIONS_TAB_FUNCTIONALITIES_KEY';
export const SET_PERMISSIONS_TAB_RULES_KEY = 'SET_PERMISSIONS_TAB_RULES_KEY';
export const SET_PERMISSIONS_TAB_AGENCIES_KEY = 'SET_PERMISSIONS_TAB_AGENCIES_KEY';
export const SET_PERMISSIONS_TAB_CUBES_KEY = 'SET_PERMISSIONS_TAB_CUBES_KEY';

const setPermissionsReducer = (
  state = {
    users: null,
    user: null,
    currentTab: SET_PERMISSIONS_TAB_FUNCTIONALITIES_KEY,
    functionalities: null,
    rules: null,
    agencies: null,
    categories: null,
    categorisedCubes: null,
    permissions: null,
    isSynchronized: false
  },
  action
) => {
  switch (action.type) {
    case SET_PERMISSIONS_USER_EDIT:
      return {
        ...state,
        user: {
          username: action.username,
          email: action.email,
          password: null,
          confirmPassword: null
        },
        permissions: null
      };
    case SET_PERMISSIONS_USER_HIDE:
      return {
        ...state,
        currentTab: SET_PERMISSIONS_TAB_FUNCTIONALITIES_KEY,
        user: null,
        permissions: null
      };
    case SET_PERMISSIONS_TAB_CHANGE:
      return {
        ...state,
        currentTab: action.tab
      };
    case SET_PERMISSIONS_FUNCTIONALITIES_CHANGE:
      return {
        ...state,
        permissions: {
          ...state.permissions,
          functionality: action.functionalitiesPermissions, /* TODO */
        }
      };
    case SET_PERMISSIONS_AGENCIES_CHANGE:
      return {
        ...state,
        permissions: {
          ...state.permissions,
          agencies: action.agenciesPermissions,
        }
      };
    case SET_PERMISSIONS_RULES_CHANGE:
      return {
        ...state,
        permissions: {
          ...state.permissions,
          rules: action.rulesPermissions,
        }
      };
    case SET_PERMISSIONS_CATEGORISED_CUBES_CHANGE:

      const categoriesPermissions = getNodes(
        state.categorisedCubes,
        "children",
        ({CatCode}) => CatCode && (action.categorisedCubesPermissions || []).filter(str => CatCode === str).length
      ).map(({CatCode}) => CatCode);

      const cubesPermissions = getNodes(
        state.categorisedCubes,
        "children",
        ({Code}) => Code && (action.categorisedCubesPermissions || []).filter(str => Code === str).length
      ).map(({Code}) => Code);

      return {
        ...state,
        permissions: {
          ...state.permissions,
          category: categoriesPermissions,
          cube: cubesPermissions,
        }
      };
    case REQUEST_SUCCESS:
      switch (action.label) {
        case SET_PERMISSIONS_SYNCHRONIZE:
          return {
            ...state,
            isSynchronized: true
          };
        case SET_PERMISSIONS_PERMISSIONS_SUBMIT:
          return {
            ...state,
            users: null,
            user: null,
            permissions: null,
            currentTab: SET_PERMISSIONS_TAB_FUNCTIONALITIES_KEY,
          };
        case SET_PERMISSIONS_USERS_READ:
          return {
            ...state,
            users: action.response
          };
        case SET_PERMISSIONS_PERMISSIONS_READ:
          return {
            ...state,
            permissions: action.response
          };
        case SET_PERMISSIONS_FUNCTIONALITIES_READ:
          return {
            ...state,
            functionalities: getMappedTree(
              action.response,
              "Children",
              node => ({
                ...node,
                name:
                getNodes(
                  action.menu,
                  "children",
                  ({path}) => path && path.substr(path.lastIndexOf("/") + 1) === node.Functionality
                )[0].label
              })
            )
          };
        case SET_PERMISSIONS_AGENCIES_READ:
          return {
            ...state,
            agencies: _.pickBy(action.response[1], (_, agencyID) => action.response[0].includes(agencyID))
          };
        case SET_PERMISSIONS_RULES_READ:
          return {
            ...state,
            rules: action.response
          };
        case SET_PERMISSIONS_CATEGORISED_CUBES_READ:
          return {
            ...state,
            categorisedCubes: getCubesTree(action.response[0], action.response[1])[0].children
          };
        default:
          return state;
      }
    default:
      return state;
  }
};

export default setPermissionsReducer;
