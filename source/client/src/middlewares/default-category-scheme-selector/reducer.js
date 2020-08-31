import {REQUEST_ERROR, REQUEST_START, REQUEST_SUCCESS} from '../api/actions';
import {
  DEFAULT_CATEGORY_SCHEME_SELECTOR_CATEGORY_SCHEMES_READ,
  DEFAULT_CATEGORY_SCHEME_SELECTOR_HIDE,
  DEFAULT_CATEGORY_SCHEME_SELECTOR_SHOW,
  DEFAULT_CATEGORY_SCHEME_SELECTOR_SUBMIT
} from './actions';
import {getArtefactFromSdmxJsonStructure, getSdmxStructuresFromSdmxJson} from '../../utils/sdmxJson';
import {reuseInReducer, reuseReducer} from "../../utils/reduxReuse";
import categorySchemeDetailModalReducer from "../../redux-components/redux-category-scheme-detail-modal/reducer";
import {getCurrentNodeConfig} from "../current-node-config/middleware";

export const DEFAULT_CATEGORY_SCHEME_SELECTOR_PREFIX = "DEFAULT_CATEGORY_SCHEME_SELECTOR_PREFIX_";

const defaultCategorySchemeSelectorReducer = (
  state = {
    categorySchemes: null,
    isVisible: false
  },
  action
) => {
  switch (action.type) {
    case DEFAULT_CATEGORY_SCHEME_SELECTOR_SHOW:
      return {
        ...state,
        isVisible: true
      };
    case DEFAULT_CATEGORY_SCHEME_SELECTOR_HIDE:
      return {
        ...state,
        isVisible: false
      };
    case REQUEST_START:
      switch (action.label) {
        case DEFAULT_CATEGORY_SCHEME_SELECTOR_CATEGORY_SCHEMES_READ:
          return {
            ...state,
            categorySchemes: null
          };
        default:
          return state;
      }
    case REQUEST_ERROR:
      switch (action.label) {
        case DEFAULT_CATEGORY_SCHEME_SELECTOR_CATEGORY_SCHEMES_READ:
          return {
            ...state,
            isVisible: false
          };
        default:
          return state;
      }
    case REQUEST_SUCCESS: {
      switch (action.label) {
        case DEFAULT_CATEGORY_SCHEME_SELECTOR_CATEGORY_SCHEMES_READ:
          const categorySchemes =
            getSdmxStructuresFromSdmxJson(action.response) || [];
          return {
            ...state,
            categorySchemes: categorySchemes.map(artefact =>
              getArtefactFromSdmxJsonStructure(artefact, getCurrentNodeConfig(action)))
          };
        case DEFAULT_CATEGORY_SCHEME_SELECTOR_SUBMIT:
          return {
            ...state,
            categorySchemes: null,
            isVisible: false
          };
        default:
          return state;
      }
    }
    default:
      return state;
  }
};

export default reuseInReducer(defaultCategorySchemeSelectorReducer, {
  categorySchemeDetail: reuseReducer(categorySchemeDetailModalReducer, DEFAULT_CATEGORY_SCHEME_SELECTOR_PREFIX)
});