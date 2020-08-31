import {REQUEST_ERROR, REQUEST_SUCCESS} from "../../../middlewares/api/actions";
import {
  CONCEPT_SCHEMES_CONCEPT_SCHEME_DELETE,
  CONCEPT_SCHEMES_CONCEPT_SCHEME_PARENTS_AND_CHILDREN_HIDE,
  CONCEPT_SCHEMES_CONCEPT_SCHEME_PARENTS_AND_CHILDREN_READ,
  CONCEPT_SCHEMES_DETAIL_ANNOTATIONS_HIDE,
  CONCEPT_SCHEMES_DETAIL_ANNOTATIONS_SHOW,
  CONCEPT_SCHEMES_LIST_CONCEPT_SCHEMES_READ,
  CONCEPT_SCHEMES_SELECTED_CONCEPT_SCHEMES_DELETE
} from "./actions";
import {getArtefactFromSdmxJsonStructure, getSdmxStructuresFromSdmxJson,} from "../../../utils/sdmxJson";
import {reuseInReducer, reuseReducer} from "../../../utils/reduxReuse";
import {
  CONCEPT_SCHEME_DETAIL_CLONE_SUBMIT,
  CONCEPT_SCHEME_DETAIL_CREATE_SUBMIT,
  CONCEPT_SCHEME_DETAIL_DERIVED_ITEM_SCHEME_CREATE_SUBMIT,
  CONCEPT_SCHEME_DETAIL_UPDATE_SUBMIT
} from "../../../redux-components/redux-concept-scheme-detail-modal/actions";
import conceptSchemeDetailModalReducer from "../../../redux-components/redux-concept-scheme-detail-modal/reducer";
import {getCurrentNodeConfig} from "../../../middlewares/current-node-config/middleware";

export const MM_CONCEPT_SCHEMES_PREFIX = "MM_CONCEPT_SCHEMES_PREFIX_";

const conceptSchemesReducer = (
  state = {
    conceptSchemes: null,
    conceptSchemeAnnotations: null,
    conceptSchemeAnnotationTriplet: null,
    parentsAndChildren: null
  },
  action
) => {
  switch (action.type) {
    case CONCEPT_SCHEMES_DETAIL_ANNOTATIONS_SHOW:
      return {
        ...state,
        conceptSchemeAnnotations: action.annotations,
        conceptSchemeAnnotationTriplet: action.triplet
      };
    case CONCEPT_SCHEMES_DETAIL_ANNOTATIONS_HIDE:
      return {
        ...state,
        conceptSchemeAnnotations: null,
        conceptSchemeAnnotationTriplet: null
      };
    case CONCEPT_SCHEMES_CONCEPT_SCHEME_PARENTS_AND_CHILDREN_HIDE:
      return {
        ...state,
        parentsAndChildren: null
      };
    case REQUEST_SUCCESS:
      switch (action.label) {
        case CONCEPT_SCHEMES_LIST_CONCEPT_SCHEMES_READ:
          return {
            ...state,
            conceptSchemes:
              (getSdmxStructuresFromSdmxJson(action.response) || [])
                .map(artefact => getArtefactFromSdmxJsonStructure(artefact, getCurrentNodeConfig(action).annotations))
          };
        case CONCEPT_SCHEMES_CONCEPT_SCHEME_DELETE:
          return {
            ...state,
            conceptSchemes: null
          };
        case CONCEPT_SCHEMES_SELECTED_CONCEPT_SCHEMES_DELETE:
          return {
            ...state,
            conceptSchemes: null
          };
        case CONCEPT_SCHEMES_CONCEPT_SCHEME_PARENTS_AND_CHILDREN_READ:
          return {
            ...state,
            parentsAndChildren: action.response
          };
        case MM_CONCEPT_SCHEMES_PREFIX + CONCEPT_SCHEME_DETAIL_CREATE_SUBMIT:
        case MM_CONCEPT_SCHEMES_PREFIX + CONCEPT_SCHEME_DETAIL_UPDATE_SUBMIT:
        case MM_CONCEPT_SCHEMES_PREFIX + CONCEPT_SCHEME_DETAIL_CLONE_SUBMIT:
        case MM_CONCEPT_SCHEMES_PREFIX + CONCEPT_SCHEME_DETAIL_DERIVED_ITEM_SCHEME_CREATE_SUBMIT:
          return {
            ...state,
            conceptSchemes: null
          };
        default:
          return state;
      }
    case REQUEST_ERROR:
      switch (action.label) {
        case CONCEPT_SCHEMES_SELECTED_CONCEPT_SCHEMES_DELETE:
          return {
            ...state,
            conceptSchemes: null
          };
        default:
          return state;
      }
    default:
      return state;
  }
};

export default reuseInReducer(conceptSchemesReducer, {
  conceptSchemeDetail: reuseReducer(conceptSchemeDetailModalReducer, MM_CONCEPT_SCHEMES_PREFIX)
});