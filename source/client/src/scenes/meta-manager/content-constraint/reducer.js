import {REQUEST_ERROR, REQUEST_SUCCESS} from "../../../middlewares/api/actions";
import {
  CONTENT_CONSTRAINTS_CONTENT_CONSTRAINT_DELETE,
  CONTENT_CONSTRAINTS_CONTENT_CONSTRAINT_PARENTS_AND_CHILDREN_HIDE,
  CONTENT_CONSTRAINTS_CONTENT_CONSTRAINT_PARENTS_AND_CHILDREN_READ,
  CONTENT_CONSTRAINTS_DETAIL_ANNOTATIONS_HIDE,
  CONTENT_CONSTRAINTS_DETAIL_ANNOTATIONS_SHOW,
  CONTENT_CONSTRAINTS_LIST_CONTENT_CONSTRAINTS_READ,
  CONTENT_CONSTRAINTS_SELECTED_CONTENT_CONSTRAINTS_DELETE
} from "./actions";
import {getArtefactFromSdmxJsonStructure, getSdmxStructuresFromSdmxJson} from "../../../utils/sdmxJson";
import {getCurrentNodeConfig} from "../../../middlewares/current-node-config/middleware";
import {reuseInReducer, reuseReducer} from "../../../utils/reduxReuse";
import contentConstraintDetailModalReducer from "../../../redux-components/redux-content-constraint-modal/reducer";
import {
  CONTENT_CONSTRAINT_DETAIL_CLONE_SUBMIT,
  CONTENT_CONSTRAINT_DETAIL_CREATE_SUBMIT,
  CONTENT_CONSTRAINT_DETAIL_UPDATE_SUBMIT
} from "../../../redux-components/redux-content-constraint-modal/actions";

export const MM_CONTENT_CONSTRAINTS_PREFIX = "MM_CONTENT_CONSTRAINTS_PREFIX";

const contentConstraintsReducer = (
  state = {
    contentConstraints: null,
    contentConstraintAnnotations: null,
    contentConstraintAnnotationTriplet: null,
    parentsAndChildren: null
  },
  action
) => {
  switch (action.type) {
    case CONTENT_CONSTRAINTS_DETAIL_ANNOTATIONS_SHOW:
      return {
        ...state,
        contentConstraintAnnotations: action.annotations,
        contentConstraintAnnotationTriplet: action.triplet
      };
    case CONTENT_CONSTRAINTS_DETAIL_ANNOTATIONS_HIDE:
      return {
        ...state,
        contentConstraintAnnotations: null,
        contentConstraintAnnotationTriplet: null
      };
    case CONTENT_CONSTRAINTS_CONTENT_CONSTRAINT_PARENTS_AND_CHILDREN_HIDE:
      return {
        ...state,
        parentsAndChildren: null
      };
    case REQUEST_SUCCESS:
      switch (action.label) {
        case CONTENT_CONSTRAINTS_LIST_CONTENT_CONSTRAINTS_READ:
          return {
            ...state,
            contentConstraints:
              (getSdmxStructuresFromSdmxJson(action.response) || [])
                .map(artefact => getArtefactFromSdmxJsonStructure(artefact, getCurrentNodeConfig(action).annotations))
          };
        case CONTENT_CONSTRAINTS_CONTENT_CONSTRAINT_DELETE:
          return {
            ...state,
            contentConstraints: null,
          };
        case CONTENT_CONSTRAINTS_SELECTED_CONTENT_CONSTRAINTS_DELETE:
          return {
            ...state,
            contentConstraints: null,
          };
        case CONTENT_CONSTRAINTS_CONTENT_CONSTRAINT_PARENTS_AND_CHILDREN_READ:
          return {
            ...state,
            parentsAndChildren: action.response
          };
        case MM_CONTENT_CONSTRAINTS_PREFIX + CONTENT_CONSTRAINT_DETAIL_CREATE_SUBMIT:
        case MM_CONTENT_CONSTRAINTS_PREFIX + CONTENT_CONSTRAINT_DETAIL_UPDATE_SUBMIT:
        case MM_CONTENT_CONSTRAINTS_PREFIX + CONTENT_CONSTRAINT_DETAIL_CLONE_SUBMIT:
          return {
            ...state,
            contentConstraints: null
          };
        default:
          return state;
      }
    case REQUEST_ERROR:
      switch (action.label) {
        case CONTENT_CONSTRAINTS_SELECTED_CONTENT_CONSTRAINTS_DELETE:
          return {
            ...state,
            contentConstraints: null
          };
        default:
          return state;
      }
    default:
      return state;
  }
};

export default reuseInReducer(contentConstraintsReducer, {
  contentConstraintDetail: reuseReducer(contentConstraintDetailModalReducer, MM_CONTENT_CONSTRAINTS_PREFIX)
});
