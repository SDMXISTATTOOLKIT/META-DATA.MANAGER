import {getArtefactFromSdmxJsonStructure, getSdmxStructuresFromSdmxJson} from "../../../utils/sdmxJson";
import {
  DSDS_DSD_PARENTS_AND_CHILDREN_HIDE,
  DSDS_DSD_PARENTS_AND_CHILDREN_READ,
  DSDS_LIST_DSD_ANNOTATIONS_HIDE,
  DSDS_LIST_DSD_ANNOTATIONS_SHOW,
  DSDS_LIST_DSD_DELETE,
  DSDS_LIST_DSD_LAYOUT_ANNOTATIONS_HIDE,
  DSDS_LIST_DSD_LAYOUT_ANNOTATIONS_SHOW,
  DSDS_LIST_DSDS_READ,
  DSDS_LIST_SELECTED_DSDS_DELETE
} from "./actions";
import {REQUEST_ERROR, REQUEST_SUCCESS} from "../../../middlewares/api/actions";
import {reuseInReducer, reuseReducer} from "../../../utils/reduxReuse";
import dsdDetailModalReducer from "../../../redux-components/redux-dsd-detail-modal/reducer";
import {
  DSD_DETAIL_CLONE_SUBMIT,
  DSD_DETAIL_CREATE_SUBMIT,
  DSD_DETAIL_UPDATE_SUBMIT
} from "../../../redux-components/redux-dsd-detail-modal/actions";
import {getCurrentNodeConfig} from "../../../middlewares/current-node-config/middleware";

export const MM_DSDS_PREFIX = "MM_DSDS_PREFIX_";

const dsdsReducer = (
  state = {
    dsds: null,
    dsdAnnotations: null,
    dsdLayoutAnnotations: null,
    dsdAnnotationTriplet: null,
    parentsAndChildren: null
  },
  action
) => {
  switch (action.type) {
    case DSDS_LIST_DSD_ANNOTATIONS_SHOW:
      return {
        ...state,
        dsdAnnotations: action.annotations,
        dsdAnnotationTriplet: action.triplet
      };
    case DSDS_LIST_DSD_ANNOTATIONS_HIDE:
      return {
        ...state,
        dsdAnnotations: null,
        dsdAnnotationTriplet: null
      };
    case DSDS_LIST_DSD_LAYOUT_ANNOTATIONS_SHOW:
      return {
        ...state,
        dsdLayoutAnnotations: action.annotations,
        dsdAnnotationTriplet: action.triplet
      };
    case DSDS_LIST_DSD_LAYOUT_ANNOTATIONS_HIDE:
      return {
        ...state,
        dsdLayoutAnnotations: null,
        dsdAnnotationTriplet: null
      };
    case DSDS_DSD_PARENTS_AND_CHILDREN_HIDE:
      return {
        ...state,
        parentsAndChildren: null
      };
    case REQUEST_SUCCESS:
      switch (action.label) {
        case DSDS_LIST_DSDS_READ:
          return {
            ...state,
            dsds: getSdmxStructuresFromSdmxJson(action.response).map(artefact =>
              getArtefactFromSdmxJsonStructure(artefact, getCurrentNodeConfig(action).annotations))
          };
        case DSDS_LIST_DSD_DELETE:
          return {
            ...state,
            dsds: null
          };
        case DSDS_LIST_SELECTED_DSDS_DELETE:
          return {
            ...state,
            dsds: null
          };
        case DSDS_DSD_PARENTS_AND_CHILDREN_READ:
          return {
            ...state,
            parentsAndChildren: action.response
          };
        case MM_DSDS_PREFIX + DSD_DETAIL_CREATE_SUBMIT:
        case MM_DSDS_PREFIX + DSD_DETAIL_UPDATE_SUBMIT:
        case MM_DSDS_PREFIX + DSD_DETAIL_CLONE_SUBMIT:
          return {
            ...state,
            dsds: null
          };
        default:
          return state;
      }
    case REQUEST_ERROR:
      switch (action.label) {
        case DSDS_LIST_SELECTED_DSDS_DELETE:
          return {
            ...state,
            dsds: null
          };
        default:
          return state;
      }
    default:
      return state;
  }
};

export default reuseInReducer(dsdsReducer, {
  dsdDetail: reuseReducer(dsdDetailModalReducer, MM_DSDS_PREFIX)
});