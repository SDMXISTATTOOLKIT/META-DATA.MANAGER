import {REQUEST_SUCCESS} from "../../../middlewares/api/actions";
import {
  COMPARE_DSDS_CODELIST_COMPARE_REPORT_HIDE,
  COMPARE_DSDS_CODELIST_COMPARE_REPORT_READ,
  COMPARE_DSDS_DSD_FILE_SET,
  COMPARE_DSDS_DSD_SOURCE_CHANGE,
  COMPARE_DSDS_REPORT_READ,
  COMPARE_DSDS_SRC_DSDS_HIDE,
  COMPARE_DSDS_SRC_DSDS_READ,
  COMPARE_DSDS_SRC_DSDS_SHOW,
  COMPARE_DSDS_SRC_TRIPLET_RESET,
  COMPARE_DSDS_SRC_TRIPLET_SET,
  COMPARE_DSDS_TARGET_DSDS_HIDE,
  COMPARE_DSDS_TARGET_DSDS_READ,
  COMPARE_DSDS_TARGET_DSDS_SHOW,
  COMPARE_DSDS_TARGET_TRIPLET_RESET,
  COMPARE_DSDS_TARGET_TRIPLET_SET
} from "./actions";
import {getArtefactFromSdmxJsonStructure, getSdmxStructuresFromSdmxJson} from "../../../utils/sdmxJson";
import {reuseInReducer, reuseReducer} from "../../../utils/reduxReuse";
import dsdDetailModalReducer from "../../../redux-components/redux-dsd-detail-modal/reducer";
import codelistDetailModalReducer from "../../../redux-components/redux-codelist-detail-modal/reducer";
import {getCurrentNodeConfig} from "../../../middlewares/current-node-config/middleware";

export const DM_COMPARE_DSDS_DSD_DETAIL_PREFIX = "DM_COMPARE_DSDS_DSD_DETAIL_PREFIX_";
export const DM_COMPARE_DSDS_CODELIST_DETAIL_PREFIX = "DM_COMPARE_DSDS_CODELIST_DETAIL_PREFIX_";

export const DM_COMPARE_DSDS_SOURCE_MSDB = "msdb";
export const DM_COMPARE_DSDS_SOURCE_XML = "xml";

const compareDsdsReducer = (
  state = {
    isSrcDsdsVisible: false,
    isTargetDsdsVisible: false,
    srcDsds: null,
    targetDsds: null,
    srcTriplet: null,
    targetTriplet: null,
    report: null,
    codelistCompareReport: null,
    srcSource: DM_COMPARE_DSDS_SOURCE_MSDB,
    targetSource: DM_COMPARE_DSDS_SOURCE_MSDB,
    srcFile: null,
    targetFile: null
  },
  action
) => {
  switch (action.type) {
    case COMPARE_DSDS_SRC_DSDS_SHOW:
      return {
        ...state,
        isSrcDsdsVisible: true
      };
    case COMPARE_DSDS_TARGET_DSDS_SHOW:
      return {
        ...state,
        isTargetDsdsVisible: true
      };
    case COMPARE_DSDS_SRC_DSDS_HIDE:
      return {
        ...state,
        isSrcDsdsVisible: false
      };
    case COMPARE_DSDS_TARGET_DSDS_HIDE:
      return {
        ...state,
        isTargetDsdsVisible: false
      };
    case COMPARE_DSDS_SRC_TRIPLET_SET:
      return {
        ...state,
        srcTriplet: action.srcTriplet,
        srcDsds: null,
        isSrcDsdsVisible: false
      };
    case COMPARE_DSDS_SRC_TRIPLET_RESET:
      return {
        ...state,
        srcTriplet: null,
        report: null
      };
    case COMPARE_DSDS_TARGET_TRIPLET_SET:
      return {
        ...state,
        targetTriplet: action.targetTriplet,
        targetDsds: null,
        isTargetDsdsVisible: false
      };
    case COMPARE_DSDS_TARGET_TRIPLET_RESET:
      return {
        ...state,
        targetTriplet: null,
        report: null
      };
    case COMPARE_DSDS_CODELIST_COMPARE_REPORT_HIDE:
      return {
        ...state,
        codelistCompareReport: null
      };
    case COMPARE_DSDS_DSD_SOURCE_CHANGE:
      return {
        ...state,
        srcSource: action.isSrc ? action.source : state.srcSource,
        targetSource: !action.isSrc ? action.source : state.targetSource,
        srcTriplet: action.isSrc ? null : state.srcTriplet,
        targetTriplet: !action.isSrc ? null : state.targetTriplet,
        srcFile: action.isSrc ? null : state.srcFile,
        targetFile: !action.isSrc ? null : state.targetFile,
        report: null
      };
    case COMPARE_DSDS_DSD_FILE_SET:
      return {
        ...state,
        srcFile: action.isSrc ? action.file : state.srcFile,
        targetFile: !action.isSrc ? action.file : state.targetFile,
        report: action.file === null ? null : state.report
      };
    case REQUEST_SUCCESS:
      switch (action.label) {
        case COMPARE_DSDS_SRC_DSDS_READ:
          return {
            ...state,
            srcDsds: getSdmxStructuresFromSdmxJson(action.response).map(art =>
              getArtefactFromSdmxJsonStructure(art, getCurrentNodeConfig(action).annotations))
          };
        case COMPARE_DSDS_TARGET_DSDS_READ:
          return {
            ...state,
            targetDsds: getSdmxStructuresFromSdmxJson(action.response).map(art =>
              getArtefactFromSdmxJsonStructure(art, getCurrentNodeConfig(action).annotations))
          };
        case COMPARE_DSDS_REPORT_READ:
          return {
            ...state,
            report: action.response
          };
        case COMPARE_DSDS_CODELIST_COMPARE_REPORT_READ:
          return {
            ...state,
            codelistCompareReport: action.response
          };
        default:
          return state;
      }
    default:
      return state;
  }
};

export default reuseInReducer(compareDsdsReducer, {
  dsdDetail: reuseReducer(dsdDetailModalReducer, DM_COMPARE_DSDS_DSD_DETAIL_PREFIX),
  codelistDetail: reuseReducer(codelistDetailModalReducer, DM_COMPARE_DSDS_CODELIST_DETAIL_PREFIX)
});