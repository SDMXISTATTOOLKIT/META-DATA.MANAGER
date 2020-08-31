import {BUILDER_DSD_LIST_DSDS_READ, BUILDER_DSD_LIST_HIDE, BUILDER_DSD_LIST_SHOW} from './actions';
import {REQUEST_ERROR, REQUEST_START, REQUEST_SUCCESS} from '../../../../middlewares/api/actions';
import {getArtefactFromSdmxJsonStructure, getSdmxStructuresFromSdmxJson} from '../../../../utils/sdmxJson';
import {reuseInReducer, reuseReducer} from "../../../../utils/reduxReuse";
import dsdDetailModalReducer from "../../../../redux-components/redux-dsd-detail-modal/reducer";
import {getCurrentNodeConfig} from "../../../../middlewares/current-node-config/middleware";

export const DM_BUILDER_DSD_LIST_PREFIX = "DM_BUILDER_DSD_LIST_PREFIX_";

const builderDsdListReducer = (
  state = {
    dsds: null,
    isVisible: false
  },
  action
) => {
  switch (action.type) {
    case BUILDER_DSD_LIST_SHOW: {
      return {
        ...state,
        isVisible: true
      };
    }
    case BUILDER_DSD_LIST_HIDE: {
      return {
        ...state,
        isVisible: false
      };
    }
    case REQUEST_START:
      switch (action.label) {
        case BUILDER_DSD_LIST_DSDS_READ:
          return {
            ...state,
            dsds: null
          };
        default:
          return state;
      }
    case REQUEST_ERROR:
      switch (action.label) {
        case BUILDER_DSD_LIST_DSDS_READ:
          return {
            ...state,
            isVisible: false
          };
        default:
          return state;
      }
    case REQUEST_SUCCESS: {
      switch (action.label) {
        case BUILDER_DSD_LIST_DSDS_READ:
          const dsds = getSdmxStructuresFromSdmxJson(action.response) || [];
          return {
            ...state,
            dsds: dsds.map(artefact =>
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

export default reuseInReducer(builderDsdListReducer, {
  dsdListDsd: reuseReducer(dsdDetailModalReducer, DM_BUILDER_DSD_LIST_PREFIX)
});