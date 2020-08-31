import {REQUEST_ERROR, REQUEST_SUCCESS} from "../../../middlewares/api/actions";
import {
  CODELISTS_CODELIST_DELETE,
  CODELISTS_CODELIST_PARENTS_AND_CHILDREN_HIDE,
  CODELISTS_CODELIST_PARENTS_AND_CHILDREN_READ,
  CODELISTS_DETAIL_ANNOTATIONS_HIDE,
  CODELISTS_DETAIL_ANNOTATIONS_SHOW,
  CODELISTS_LIST_CODELISTS_READ,
  CODELISTS_SELECTED_CODELISTS_DELETE
} from "./actions";
import {getArtefactFromSdmxJsonStructure, getSdmxStructuresFromSdmxJson} from "../../../utils/sdmxJson";
import {reuseInReducer, reuseReducer} from "../../../utils/reduxReuse";
import codelistDetailModalReducer from "../../../redux-components/redux-codelist-detail-modal/reducer";
import {
  CODELIST_DETAIL_CLONE_SUBMIT,
  CODELIST_DETAIL_CREATE_SUBMIT,
  CODELIST_DETAIL_DERIVED_CODELIST_CREATE_SUBMIT,
  CODELIST_DETAIL_UPDATE_SUBMIT
} from "../../../redux-components/redux-codelist-detail-modal/actions";
import {getCurrentNodeConfig} from "../../../middlewares/current-node-config/middleware";

export const MM_CODELISTS_PREFIX = "MM_CODELISTS_PREFIX_";

const codelistsReducer = (
  state = {
    codelists: null,
    codelistAnnotations: null,
    codelistAnnotationTriplet: null,
    parentsAndChildren: null
  },
  action
) => {
  switch (action.type) {
    case CODELISTS_DETAIL_ANNOTATIONS_SHOW:
      return {
        ...state,
        codelistAnnotations: action.annotations,
        codelistAnnotationTriplet: action.triplet
      };
    case CODELISTS_DETAIL_ANNOTATIONS_HIDE:
      return {
        ...state,
        codelistAnnotations: null,
        codelistAnnotationTriplet: null
      };
    case CODELISTS_CODELIST_PARENTS_AND_CHILDREN_HIDE:
      return {
        ...state,
        parentsAndChildren: null
      };
    case REQUEST_SUCCESS:
      switch (action.label) {
        case CODELISTS_LIST_CODELISTS_READ:
          return {
            ...state,
            codelists:
              (getSdmxStructuresFromSdmxJson(action.response) || [])
                .map(artefact => getArtefactFromSdmxJsonStructure(artefact, getCurrentNodeConfig(action).annotations))
          };
        case CODELISTS_CODELIST_DELETE:
          return {
            ...state,
            codelists: null
          };
        case CODELISTS_SELECTED_CODELISTS_DELETE:
          return {
            ...state,
            codelists: null
          };
        case CODELISTS_CODELIST_PARENTS_AND_CHILDREN_READ:
          return {
            ...state,
            parentsAndChildren: action.response
          };
        case MM_CODELISTS_PREFIX + CODELIST_DETAIL_CREATE_SUBMIT:
        case MM_CODELISTS_PREFIX + CODELIST_DETAIL_UPDATE_SUBMIT:
        case MM_CODELISTS_PREFIX + CODELIST_DETAIL_CLONE_SUBMIT:
        case MM_CODELISTS_PREFIX + CODELIST_DETAIL_DERIVED_CODELIST_CREATE_SUBMIT:
          return {
            ...state,
            codelists: null
          };
        default:
          return state;
      }
    case REQUEST_ERROR:
      switch (action.label) {
        case CODELISTS_SELECTED_CODELISTS_DELETE:
          return {
            ...state,
            codelists: null
          };
        default:
          return state;
      }
    default:
      return state;
  }
};

export default reuseInReducer(codelistsReducer, {
  codelistDetail: reuseReducer(codelistDetailModalReducer, MM_CODELISTS_PREFIX)
});