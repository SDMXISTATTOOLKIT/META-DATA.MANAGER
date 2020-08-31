import {REQUEST_ERROR, REQUEST_START, REQUEST_SUCCESS} from "../../../middlewares/api/actions";
import {
  getArtefactFromSdmxJsonStructure,
  getSdmxStructuresFromSdmxJson,
  SDMX_JSON_MSD_LIST_KEY
} from "../../../utils/sdmxJson";
import {
  MSDS_AGENCIES_READ,
  MSDS_LIST_MSDS_READ,
  MSDS_MSD_DELETE,
  MSDS_MSD_DETAIL_CHANGE,
  MSDS_MSD_DETAIL_HIDE,
  MSDS_MSD_DETAIL_READ,
  MSDS_MSD_DETAIL_SHOW,
  MSDS_MSD_DETAIL_SUBMIT,
  MSDS_MSD_DOWNLOAD,
  MSDS_MSD_DOWNLOAD_CHANGE,
  MSDS_MSD_DOWNLOAD_HIDE,
  MSDS_MSD_DOWNLOAD_SHOW,
  MSDS_MSD_PARENTS_AND_CHILDREN_HIDE,
  MSDS_MSD_PARENTS_AND_CHILDREN_READ,
  MSDS_SELECTED_MSDS_DELETE
} from "./actions";
import _ from "lodash";
import {getCurrentNodeConfig} from "../../../middlewares/current-node-config/middleware";
import {getCustomIsPresentationalFromAnnotations} from "../../../utils/referenceMetadata";
import {getCurrentUserPermissions} from "../../../middlewares/current-user-permissions/middleware";

const msdsReducer = (
  state = {
    msds: null,
    isVisible: false,
    msdTriplet: null,
    msd: null,
    agencies: null,
    downloadMsdTriplets: null,
    downloadMsdLang: null,
    downloadMsdParams: null,
    parentsAndChildren: null
  },
  action
) => {
  switch (action.type) {
    case MSDS_MSD_DETAIL_SHOW:
      return {
        ...state,
        isVisible: true,
        msdTriplet: action.artefactTriplet
      };
    case MSDS_MSD_DETAIL_CHANGE:
      const msd = _.cloneDeep(state.msd);

      const customizer = (_, src, key) => {
        if (key === "annotations")
          return src;
        else {
          return undefined
        }
      };

      return {
        ...state,
        msd: _.mergeWith(msd, action.fields, customizer)
      };
    case MSDS_MSD_DETAIL_HIDE:
      return {
        ...state,
        isVisible: false,
        msd: null,
        msdTriplet: null,
        agencies: null
      };
    case MSDS_MSD_DOWNLOAD_SHOW:
      return {
        ...state,
        downloadMsdTriplets: action.artefactTriplets,
        downloadMsdLang: action.lang,
        downloadMsdParams: {
          format: null,
          references: false,
          compression: false,
          csvSeparator: ";",
          csvDelimiter: null,
          csvLanguage: null
        },
      };
    case MSDS_MSD_DOWNLOAD_HIDE:
      return {
        ...state,
        downloadMsdTriplets: null,
        downloadMsdLang: null,
        downloadMsdParams: null
      };
    case MSDS_MSD_DOWNLOAD_CHANGE:
      const downloadMsdParams = _.cloneDeep(state.downloadMsdParams);
      return {
        ...state,
        downloadMsdParams: _.merge(downloadMsdParams, action.fields)
      };
    case MSDS_MSD_PARENTS_AND_CHILDREN_HIDE:
      return {
        ...state,
        parentsAndChildren: null
      };
    case REQUEST_START:
      switch (action.label) {
        case MSDS_LIST_MSDS_READ:
          return {
            ...state,
            msds: null
          };
        default:
          return state;
      }
    case REQUEST_SUCCESS:
      switch (action.label) {
        case MSDS_LIST_MSDS_READ:
          return {
            ...state,
            msds: getSdmxStructuresFromSdmxJson(action.response).map(artefact =>
              getArtefactFromSdmxJsonStructure(artefact, getCurrentNodeConfig(action).annotations))
          };
        case MSDS_AGENCIES_READ:
          return {
            ...state,
            agencies: action.response
          };
        case MSDS_MSD_DETAIL_READ:

          const userPermissions = getCurrentUserPermissions(action);
          const customNoneIsAutoAnnotation = userPermissions && userPermissions.rules.includes("CanManageWorkingAnnotation")
            ? () => false
            : undefined;

          const msd = getArtefactFromSdmxJsonStructure(
            getSdmxStructuresFromSdmxJson(action.response, SDMX_JSON_MSD_LIST_KEY)[0],
            getCurrentNodeConfig(action).annotations,
            customNoneIsAutoAnnotation
          );

          return {
            ...state,
            msd: {
              ...msd,
              customIsPresentational: getCustomIsPresentationalFromAnnotations(msd, getCurrentNodeConfig(action).annotations)
            }
          };
        case MSDS_MSD_DETAIL_SUBMIT:
          return {
            ...state,
            msd: null,
            msds: null
          };
        case MSDS_MSD_DELETE:
          return {
            ...state,
            msds: null
          };
        case MSDS_SELECTED_MSDS_DELETE:
          return {
            ...state,
            msds: null
          };
        case MSDS_MSD_DOWNLOAD:
          return {
            ...state,
            downloadMsdTriplets: null,
            downloadMsdLang: null,
            downloadMsdParams: null
          };
        case MSDS_MSD_PARENTS_AND_CHILDREN_READ:
          return {
            ...state,
            parentsAndChildren: action.response
          };
        default:
          return state;
      }
    case REQUEST_ERROR:
      switch (action.label) {
        case MSDS_SELECTED_MSDS_DELETE:
          return {
            ...state,
            msds: null
          };
        default:
          return state;
      }
    default:
      return state;
  }
};

export default msdsReducer;
