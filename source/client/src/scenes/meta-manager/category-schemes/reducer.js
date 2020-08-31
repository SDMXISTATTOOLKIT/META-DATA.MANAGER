import {REQUEST_ERROR, REQUEST_SUCCESS} from "../../../middlewares/api/actions";
import {
  CATEGORY_SCHEMES_CATEGORY_SCHEME_DELETE,
  CATEGORY_SCHEMES_CATEGORY_SCHEME_PARENTS_AND_CHILDREN_HIDE,
  CATEGORY_SCHEMES_CATEGORY_SCHEME_PARENTS_AND_CHILDREN_READ,
  CATEGORY_SCHEMES_DETAIL_ANNOTATIONS_HIDE,
  CATEGORY_SCHEMES_DETAIL_ANNOTATIONS_SHOW,
  CATEGORY_SCHEMES_LIST_CATEGORY_SCHEMES_READ,
  CATEGORY_SCHEMES_SELECTED_CATEGORY_SCHEMES_DELETE
} from "./actions";
import {getArtefactFromSdmxJsonStructure, getSdmxStructuresFromSdmxJson,} from "../../../utils/sdmxJson";
import {
  CATEGORY_SCHEME_DETAIL_CLONE_SUBMIT,
  CATEGORY_SCHEME_DETAIL_CREATE_SUBMIT,
  CATEGORY_SCHEME_DETAIL_DERIVED_ITEM_SCHEME_CREATE_SUBMIT,
  CATEGORY_SCHEME_DETAIL_UPDATE_SUBMIT
} from "../../../redux-components/redux-category-scheme-detail-modal/actions";
import {reuseInReducer, reuseReducer} from "../../../utils/reduxReuse";
import categorySchemeDetailModalReducer from "../../../redux-components/redux-category-scheme-detail-modal/reducer";
import {getCurrentNodeConfig} from "../../../middlewares/current-node-config/middleware";

export const MM_CATEGORY_SCHEMES_PREFIX = "MM_CATEGORY_SCHEMES_PREFIX_";

const categorySchemesReducer = (
  state = {
    categorySchemes: null,
    categorySchemeAnnotations: null,
    categorySchemeAnnotationTriplet: null,
    parentsAndChildren: null
  },
  action
) => {
  switch (action.type) {
    case CATEGORY_SCHEMES_DETAIL_ANNOTATIONS_SHOW:
      return {
        ...state,
        categorySchemeAnnotations: action.annotations,
        categorySchemeAnnotationTriplet: action.triplet
      };
    case CATEGORY_SCHEMES_DETAIL_ANNOTATIONS_HIDE:
      return {
        ...state,
        categorySchemeAnnotations: null,
        categorySchemeAnnotationTriplet: null
      };
    case CATEGORY_SCHEMES_CATEGORY_SCHEME_PARENTS_AND_CHILDREN_HIDE:
      return {
        ...state,
        parentsAndChildren: null
      };
    case REQUEST_SUCCESS:
      switch (action.label) {
        case CATEGORY_SCHEMES_LIST_CATEGORY_SCHEMES_READ:
          return {
            ...state,
            categorySchemes:
              (getSdmxStructuresFromSdmxJson(action.response) || [])
                .map(artefact => getArtefactFromSdmxJsonStructure(artefact, getCurrentNodeConfig(action).annotations))
          };
        case CATEGORY_SCHEMES_CATEGORY_SCHEME_DELETE:
          return {
            ...state,
            categorySchemes: null
          };
        case CATEGORY_SCHEMES_SELECTED_CATEGORY_SCHEMES_DELETE:
          return {
            ...state,
            categorySchemes: null
          };
        case CATEGORY_SCHEMES_CATEGORY_SCHEME_PARENTS_AND_CHILDREN_READ:
          return {
            ...state,
            parentsAndChildren: action.response
          };
        case MM_CATEGORY_SCHEMES_PREFIX + CATEGORY_SCHEME_DETAIL_CREATE_SUBMIT:
        case MM_CATEGORY_SCHEMES_PREFIX + CATEGORY_SCHEME_DETAIL_UPDATE_SUBMIT:
        case MM_CATEGORY_SCHEMES_PREFIX + CATEGORY_SCHEME_DETAIL_CLONE_SUBMIT:
        case MM_CATEGORY_SCHEMES_PREFIX + CATEGORY_SCHEME_DETAIL_DERIVED_ITEM_SCHEME_CREATE_SUBMIT:
          return {
            ...state,
            categorySchemes: null
          };
        default:
          return state;
      }
    case REQUEST_ERROR:
      switch (action.label) {
        case CATEGORY_SCHEMES_SELECTED_CATEGORY_SCHEMES_DELETE:
          return {
            ...state,
            categorySchemes: null
          };
        default:
          return state;
      }
    default:
      return state;
  }
};

export default reuseInReducer(categorySchemesReducer, {
  categorySchemeDetail: reuseReducer(categorySchemeDetailModalReducer, MM_CATEGORY_SCHEMES_PREFIX)
});