import {REQUEST_ERROR, REQUEST_START, REQUEST_SUCCESS} from '../../../middlewares/api/actions';
import {
  UPGRADE_DSD_CODELIST_COMPARE_REPORT_HIDE,
  UPGRADE_DSD_CODELIST_COMPARE_REPORT_READ,
  UPGRADE_DSD_DATAFLOWS_HIDE,
  UPGRADE_DSD_DATAFLOWS_SHOW,
  UPGRADE_DSD_DSD_UPGRADE,
  UPGRADE_DSD_DSD_UPGRADE_HIDE,
  UPGRADE_DSD_DSD_UPGRADE_SHOW,
  UPGRADE_DSD_DSDS_COMPARE,
  UPGRADE_DSD_DSDS_COMPARE_HIDE,
  UPGRADE_DSD_DSDS_READ,
  UPGRADE_DSD_IMPORT_DSD_DSDS_COMPARE_SUBMIT,
  UPGRADE_DSD_IMPORT_DSD_FILE_SET,
  UPGRADE_DSD_IMPORT_DSD_FILE_SUBMIT,
  UPGRADE_DSD_IMPORT_DSD_FILE_UPLOAD,
  UPGRADE_DSD_IMPORT_DSD_HIDE,
  UPGRADE_DSD_IMPORT_DSD_IMPORT_START,
  UPGRADE_DSD_IMPORT_DSD_REPORT_HIDE,
  UPGRADE_DSD_IMPORT_DSD_SHOW,
  UPGRADE_DSD_UPGRADED_DSDS_HIDE,
  UPGRADE_DSD_UPGRADED_DSDS_READ,
  UPGRADE_DSD_UPGRADED_DSDS_SHOW
} from "./actions";
import {reuseInReducer, reuseReducer} from "../../../utils/reduxReuse";
import dsdDetailModalReducer from "../../../redux-components/redux-dsd-detail-modal/reducer";
import codelistDetailModalReducer from "../../../redux-components/redux-codelist-detail-modal/reducer";

export const DM_UPGRADE_DSD_DSD_DETAIL_PREFIX = "DM_UPGRADE_DSD_DSD_DETAIL_PREFIX_";
export const DM_UPGRADE_DSD_CODELIST_DETAIL_PREFIX = "DM_UPGRADE_DSD_CODELIST_DETAIL_PREFIX_";

const upgradeDsdReducer = (
  state = {
    dsds: null,
    dataflows: null,
    isUpgradedDsdsVisible: false,
    upgradedDsds: null,
    sourceDsdTriplet: null,
    targetDsdTriplet: null,
    isCompareReportVisible: false,
    compareReport: null,
    isUpgradeVisible: false,
    upgradeReport: null,
    codelistCompareReport: null,
    isImportDsdVisible: false,
    dsdFile: null,
    isImportEnabled: false,
    importDsdHash: null,
    importDsdItems: null,
    importDsdReport: null,
  },
  action
) => {
  switch (action.type) {
    case UPGRADE_DSD_UPGRADED_DSDS_SHOW:
      return {
        ...state,
        sourceDsdTriplet: action.dsdTriplet,
      };
    case UPGRADE_DSD_DATAFLOWS_SHOW:
      return {
        ...state,
        dataflows: action.dataflows
      };
    case UPGRADE_DSD_DATAFLOWS_HIDE:
      return {
        ...state,
        dataflows: null
      };
    case UPGRADE_DSD_UPGRADED_DSDS_HIDE:
      return {
        ...state,
        isUpgradedDsdsVisible: false,
        sourceDsdTriplet: null,
        upgradedDsds: null,
        dsds: null,
        targetDsdTriplet: null,
        isCompareReportVisible: false,
        compareReport: null,
        isUpgradeVisible: false,
        upgradeReport: null
      };
    case UPGRADE_DSD_DSDS_COMPARE_HIDE:
      return {
        ...state,
        isCompareReportVisible: false,
        compareReport: null,
        isUpgradeVisible: false
      };
    case UPGRADE_DSD_DSD_UPGRADE_SHOW:
      return {
        ...state,
        isUpgradeVisible: true,
        targetDsdTriplet: action.dsdTriplet
      };
    case UPGRADE_DSD_DSD_UPGRADE_HIDE:
      return {
        ...state,
        isUpgradedDsdsVisible: !action.success,
        sourceDsdTriplet: action.success ? null : state.sourceDsdTriplet,
        targetDsdTriplet: null,
        upgradedDsds: null,
        dsds: action.success ? null : state.dsds,
        compareReport: null,
        isUpgradeVisible: false,
        upgradeReport: null
      };
    case UPGRADE_DSD_CODELIST_COMPARE_REPORT_HIDE:
      return {
        ...state,
        codelistCompareReport: null,
        targetDsdTriplet: null
      };
    case UPGRADE_DSD_IMPORT_DSD_SHOW:
      return {
        ...state,
        isImportDsdVisible: true
      };
    case UPGRADE_DSD_IMPORT_DSD_HIDE:
      return {
        ...state,
        compareReport: null,
        isImportDsdVisible: false,
        dsdFile: null
      };
    case UPGRADE_DSD_IMPORT_DSD_FILE_SET:
      return {
        ...state,
        dsdFile: action.file
      };
    case UPGRADE_DSD_IMPORT_DSD_IMPORT_START:
      return {
        ...state,
        compareReport: null,
        isImportEnabled: true,
        isImportDsdVisible: false,
      };
    case UPGRADE_DSD_IMPORT_DSD_REPORT_HIDE:
      return {
        ...state,
        compareReport: null,
        isImportEnabled: false,
        importDsdHash: null,
        importDsdItems: null,
        importDsdReport: null,
        dsdFile: null
      };
    case REQUEST_START:
      switch (action.label) {
        default:
          return state;
      }
    case REQUEST_SUCCESS:
      switch (action.label) {
        case UPGRADE_DSD_DSDS_READ:
          return {
            ...state,
            dsds: action.response
          };
        case UPGRADE_DSD_UPGRADED_DSDS_READ:
          return {
            ...state,
            isUpgradedDsdsVisible: true,
            upgradedDsds: action.response
          };
        case UPGRADE_DSD_DSDS_COMPARE:
          return {
            ...state,
            isCompareReportVisible: action.showModal,
            compareReport: action.response,
            targetDsdTriplet: action.targetDsdTriplet
          };
        case UPGRADE_DSD_DSD_UPGRADE:
          return {
            ...state,
            upgradeReport: action.response,
            isCompareReportVisible: false,
            upgradedDsds: null
          };
        case UPGRADE_DSD_CODELIST_COMPARE_REPORT_READ:
          return {
            ...state,
            codelistCompareReport: action.response
          };
        case UPGRADE_DSD_IMPORT_DSD_DSDS_COMPARE_SUBMIT:
          return {
            ...state,
            isCompareReportVisible: action.showModal,
            compareReport: action.response,
          };
        case UPGRADE_DSD_IMPORT_DSD_FILE_UPLOAD:
          return {
            ...state,
            importDsdHash: action.response.hashImport,
            importDsdItems: action.response.importedItem
          };
        case UPGRADE_DSD_IMPORT_DSD_FILE_SUBMIT:
          return {
            ...state,
            dsdFile: null,
            importDsdHash: null,
            importDsdReport: action.response.itemsMessage,
            isImportDsdVisible: false,
            upgradedDsds: null
          };
        default:
          return state;
      }
    case REQUEST_ERROR:
      switch (action.label) {
        case UPGRADE_DSD_DSDS_COMPARE:
          return {
            ...state,
            targetDsdTriplet: null
          };
        case UPGRADE_DSD_DSD_UPGRADE:
          return {
            ...state,
            upgradedDsds: null,
            targetDsdTriplet: null,
            compareReport: null,
            isUpgradeVisible: false,
            upgradeReport: null
          };
        case UPGRADE_DSD_IMPORT_DSD_DSDS_COMPARE_SUBMIT:
          return {
            ...state,
            isImportEnabled: false
          };
        case UPGRADE_DSD_IMPORT_DSD_FILE_UPLOAD:
          return {
            ...state,
            isImportEnabled: false,
            compareReport: null,
            dsdFile: null
          };
        case UPGRADE_DSD_IMPORT_DSD_FILE_SUBMIT:
          return {
            ...state,
            isImportEnabled: false,
            importDsdHash: null,
            importDsdItems: null,
            compareReport: null,
            dsdFile: null
          };
        default:
          return state;
      }
    default:
      return state;
  }
};

export default reuseInReducer(upgradeDsdReducer, {
  dsdDetail: reuseReducer(dsdDetailModalReducer, DM_UPGRADE_DSD_DSD_DETAIL_PREFIX),
  codelistDetail: reuseReducer(codelistDetailModalReducer, DM_UPGRADE_DSD_CODELIST_DETAIL_PREFIX),
});