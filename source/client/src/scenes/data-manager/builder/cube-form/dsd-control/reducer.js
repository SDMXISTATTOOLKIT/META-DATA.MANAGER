import {
  BUILDER_CUBE_FORM_DSD_CONTROL_DSD_SET,
  BUILDER_CUBE_FORM_DSD_CONTROL_DSDS_HIDE,
  BUILDER_CUBE_FORM_DSD_CONTROL_DSDS_READ,
  BUILDER_CUBE_FORM_DSD_CONTROL_DSDS_SHOW
} from './actions';
import {REQUEST_ERROR, REQUEST_START, REQUEST_SUCCESS} from '../../../../../middlewares/api/actions';
import {getArtefactFromSdmxJsonStructure, getSdmxStructuresFromSdmxJson} from '../../../../../utils/sdmxJson';
import {reuseInReducer, reuseReducer} from "../../../../../utils/reduxReuse";
import dsdDetailModalReducer from "../../../../../redux-components/redux-dsd-detail-modal/reducer";
import {getCurrentNodeConfig} from "../../../../../middlewares/current-node-config/middleware";

export const DM_BUILDER_CUBE_FORM_DSD_CONTROL_PREFIX = "DM_BUILDER_CUBE_FORM_DSD_CONTROL_PREFIX_";

const builderCubeFormDsdControlReducer = (
  state = {
    dsds: null,
    isDsdsVisible: null,
  },
  action
) => {
  switch (action.type) {
    case BUILDER_CUBE_FORM_DSD_CONTROL_DSDS_SHOW:
      return {
        ...state,
        isDsdsVisible: true
      };
    case BUILDER_CUBE_FORM_DSD_CONTROL_DSDS_HIDE:
      return {
        ...state,
        isDsdsVisible: false
      };
    case BUILDER_CUBE_FORM_DSD_CONTROL_DSD_SET:
      return {
        ...state,
        isDsdsVisible: false
      };
    case REQUEST_START: {
      switch (action.label) {
        case BUILDER_CUBE_FORM_DSD_CONTROL_DSDS_READ:
          return {
            ...state,
            dsds: null
          };
        default:
          return state;
      }
    }
    case REQUEST_ERROR: {
      switch (action.label) {
        case BUILDER_CUBE_FORM_DSD_CONTROL_DSDS_READ: {
          return {
            ...state,
            isDsdsVisible: false
          }
        }
        default:
          return state;
      }
    }
    case REQUEST_SUCCESS: {
      switch (action.label) {
        case BUILDER_CUBE_FORM_DSD_CONTROL_DSDS_READ:
          return {
            ...state,
            dsds: (getSdmxStructuresFromSdmxJson(action.response) || []).map(artefact =>
              getArtefactFromSdmxJsonStructure(artefact, getCurrentNodeConfig(action).annotations))
          };
        default:
          return state;
      }
    }
    default:
      return state;
  }
};

export default reuseInReducer(builderCubeFormDsdControlReducer, {
  cubeFormDsdControlDsd: reuseReducer(dsdDetailModalReducer, DM_BUILDER_CUBE_FORM_DSD_CONTROL_PREFIX)
});