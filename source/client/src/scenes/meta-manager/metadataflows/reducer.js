import {REQUEST_ERROR, REQUEST_START, REQUEST_SUCCESS} from "../../../middlewares/api/actions";
import {
  METADATAFLOWS_DETAIL_AGENCIES_READ,
  METADATAFLOWS_DETAIL_ANNOTATIONS_HIDE,
  METADATAFLOWS_DETAIL_ANNOTATIONS_SHOW,
  METADATAFLOWS_DETAIL_HIDE,
  METADATAFLOWS_DETAIL_METADATAFLOW_CHANGE,
  METADATAFLOWS_DETAIL_METADATAFLOW_CREATE_SUBMIT,
  METADATAFLOWS_DETAIL_METADATAFLOW_READ,
  METADATAFLOWS_DETAIL_METADATAFLOW_UPDATE_SUBMIT,
  METADATAFLOWS_DETAIL_MSD_SET,
  METADATAFLOWS_DETAIL_MSD_UNSET,
  METADATAFLOWS_DETAIL_MSDS_HIDE,
  METADATAFLOWS_DETAIL_MSDS_READ,
  METADATAFLOWS_DETAIL_MSDS_SHOW,
  METADATAFLOWS_LIST_METADATAFLOWS_READ,
  METADATAFLOWS_METADATAFLOW_CLONE_CHANGE,
  METADATAFLOWS_METADATAFLOW_CLONE_HIDE,
  METADATAFLOWS_METADATAFLOW_CLONE_SHOW,
  METADATAFLOWS_METADATAFLOW_CLONE_SUBMIT,
  METADATAFLOWS_METADATAFLOW_CREATE,
  METADATAFLOWS_METADATAFLOW_DELETE,
  METADATAFLOWS_METADATAFLOW_DOWNLOAD,
  METADATAFLOWS_METADATAFLOW_DOWNLOAD_CHANGE,
  METADATAFLOWS_METADATAFLOW_DOWNLOAD_HIDE,
  METADATAFLOWS_METADATAFLOW_DOWNLOAD_SHOW,
  METADATAFLOWS_METADATAFLOW_EDIT,
  METADATAFLOWS_METADATAFLOW_EXPORT_CHANGE,
  METADATAFLOWS_METADATAFLOW_EXPORT_HIDE,
  METADATAFLOWS_METADATAFLOW_EXPORT_REPORT_HIDE,
  METADATAFLOWS_METADATAFLOW_EXPORT_SHOW,
  METADATAFLOWS_METADATAFLOW_EXPORT_SUBMIT,
  METADATAFLOWS_METADATAFLOW_OWNERSHIP_HIDE,
  METADATAFLOWS_METADATAFLOW_OWNERSHIP_OWNERS_CHANGE,
  METADATAFLOWS_METADATAFLOW_OWNERSHIP_OWNERS_READ,
  METADATAFLOWS_METADATAFLOW_OWNERSHIP_OWNERS_SUBMIT,
  METADATAFLOWS_METADATAFLOW_OWNERSHIP_SHOW,
  METADATAFLOWS_METADATAFLOW_OWNERSHIP_USERS_READ,
  METADATAFLOWS_METADATAFLOW_PARENTS_AND_CHILDREN_HIDE,
  METADATAFLOWS_METADATAFLOW_PARENTS_AND_CHILDREN_READ,
  METADATAFLOWS_SELECTED_METADATAFLOWS_DELETE
} from "./actions";
import {
  getArtefactFromSdmxJsonStructure,
  getArtefactTripletFromString,
  getArtefactTripletFromUrn,
  getSdmxStructuresFromSdmxJson,
  getStringFromArtefactTriplet,
  getUrnFromArtefactTriplet,
  SDMX_JSON_METADATAFLOW_LIST_KEY,
  SDMX_JSON_MSD_URN_NAMESPACE
} from "../../../utils/sdmxJson";
import _ from 'lodash';
import {getCurrentNodeConfig} from "../../../middlewares/current-node-config/middleware";
import {getCurrentUserPermissions} from "../../../middlewares/current-user-permissions/middleware";

const metadataflowsReducer = (
  state = {
    isDetailVisible: false,
    metadataflowTriplet: null,
    metadataflows: null,
    isMetadataflowValid: true,
    isAgenciesValid: true,
    isMetadataflowGeneralTabDirty: false,
    metadataflow: null,
    agencies: null,
    msds: null,
    isMsdsListVisible: false,
    isMsdDetailVisible: false,
    downloadMetadataflowParams: null,
    downloadMetadataflowTriplets: null,
    downloadMetadataflowLang: null,
    cloneDestTriplet: null,
    metadataflowAnnotations: null,
    metadataflowAnnotationTriplet: null,
    metadataflowExportSourceTriplet: null,
    metadataflowExportDestination: null,
    metadataflowExportReport: null,
    metadataflowOwnershipMetadataflowTripletStr: null,
    metadataflowOwnershipOwners: null,
    metadataflowOwnershipUsers: null,
    parentsAndChildren: null
  },
  action
) => {
  switch (action.type) {
    case METADATAFLOWS_METADATAFLOW_CREATE:
      return {
        ...state,
        metadataflow: {
          id: null,
          agencyID: null,
          version: null,
          isFinal: false,
          uri: null,
          urn: null,
          validTo: null,
          validFrom: null,
          name: null,
          description: null,
          msd: null,
          structure: null
        },
        isDetailVisible: true,
        isAgenciesValid: false
      };
    case METADATAFLOWS_METADATAFLOW_OWNERSHIP_SHOW: {
      return {
        ...state,
        metadataflowOwnershipMetadataflowTripletStr: action.metadataflowTripletStr
      };
    }
    case METADATAFLOWS_METADATAFLOW_OWNERSHIP_HIDE:
      return {
        ...state,
        metadataflowOwnershipMetadataflowTripletStr: null,
        metadataflowOwnershipOwners: null,
        metadataflowOwnershipUsers: null
      };
    case METADATAFLOWS_METADATAFLOW_OWNERSHIP_OWNERS_CHANGE:
      return {
        ...state,
        metadataflowOwnershipOwners: action.owners
      };
    case METADATAFLOWS_METADATAFLOW_EXPORT_REPORT_HIDE:
      return {
        ...state,
        metadataflowExportReport: null
      };
    case METADATAFLOWS_METADATAFLOW_EDIT:
      return {
        ...state,
        isDetailVisible: true,
        metadataflowTriplet: action.metadataflowTriplet,
        isMetadataflowValid: false,
        isAgenciesValid: false,
        isMetadataflowGeneralTabDirty: false
      };
    case METADATAFLOWS_DETAIL_HIDE:
      return {
        ...state,
        isDetailVisible: false,
        metadataflowTriplet: null,
        metadataflow: null,
        msds: null,
        isMsdsListVisible: false,
        isMsdDetailVisible: false,
        agencies: null,
        allAgencies: null
      };
    case METADATAFLOWS_DETAIL_METADATAFLOW_CHANGE: {
      const metadataflow = _.cloneDeep(state.metadataflow);
      const customizer = (_, src, key) => {
        if (key === "annotations")
          return src;
        else {
          return undefined
        }
      };

      return {
        ...state,
        metadataflow: _.mergeWith(metadataflow, action.fields, customizer),
        isMetadataflowGeneralTabDirty: true
      };
    }
    case METADATAFLOWS_DETAIL_MSDS_SHOW:
      return {
        ...state,
        isMsdsListVisible: true
      };
    case METADATAFLOWS_DETAIL_MSDS_HIDE:
      return {
        ...state,
        isMsdsListVisible: false,
        msds: null
      };
    case METADATAFLOWS_DETAIL_MSD_SET:
      return {
        ...state,
        isMsdsListVisible: false,
        msds: null,
        metadataflow: {
          ...state.metadataflow,
          msd: getStringFromArtefactTriplet(action.msdTriplet),
          structure: getUrnFromArtefactTriplet(action.msdTriplet, SDMX_JSON_MSD_URN_NAMESPACE)
        }
      };
    case METADATAFLOWS_DETAIL_MSD_UNSET:
      return {
        ...state,
        metadataflow: {
          ...state.metadataflow,
          msd: null,
          structure: null
        }
      };
    case METADATAFLOWS_DETAIL_ANNOTATIONS_SHOW:
      return {
        ...state,
        metadataflowAnnotations: action.annotations,
        metadataflowAnnotationTriplet: action.triplet
      };
    case METADATAFLOWS_DETAIL_ANNOTATIONS_HIDE:
      return {
        ...state,
        metadataflowAnnotations: null,
        metadataflowAnnotationTriplet: null
      };
    case METADATAFLOWS_METADATAFLOW_DOWNLOAD_SHOW:
      return {
        ...state,
        downloadMetadataflowTriplets: action.artefactTriplets,
        downloadMetadataflowLang: action.lang,
        downloadMetadataflowParams: {
          format: null,
          references: false,
          compression: false,
          csvSeparator: ";",
          csvDelimiter: null,
          csvLanguage: null
        },
      };
    case METADATAFLOWS_METADATAFLOW_DOWNLOAD_HIDE:
      return {
        ...state,
        downloadMetadataflowTriplets: null,
        downloadMetadataflowLang: null,
        downloadMetadataflowParams: null
      };
    case METADATAFLOWS_METADATAFLOW_DOWNLOAD_CHANGE:
      const downloadMetadataflowParams = _.cloneDeep(state.downloadMetadataflowParams);
      return {
        ...state,
        downloadMetadataflowParams: _.merge(downloadMetadataflowParams, action.fields)
      };
    case METADATAFLOWS_METADATAFLOW_CLONE_SHOW:
      const srcVersionArr = action.srcTriplet.version.split(".");
      const destVersionArr = srcVersionArr.map((num, index) =>
        index === srcVersionArr.length - 1
          ? Number(num) + 1
          : num
      );

      return {
        ...state,
        cloneDestTriplet: {
          ...action.srcTriplet,
          version: destVersionArr.join(".")
        },
        metadataflowTriplet: state.metadataflowTriplet ? state.metadataflowTriplet : action.srcTriplet,
        isMetadataflowValid: !!state.metadataflow,
        isAgenciesValid: !!state.allAgencies
      };
    case METADATAFLOWS_METADATAFLOW_CLONE_HIDE:
      return {
        ...state,
        cloneDestTriplet: null,
        metadataflow: state.isDetailVisible ? state.metadataflow : null,
        metadataflowTriplet: state.isDetailVisible ? state.metadataflowTriplet : null,
        agencies: state.isDetailVisible ? state.agencies : null,
        allAgencies: state.isDetailVisible ? state.allAgencies : null
      };
    case METADATAFLOWS_METADATAFLOW_CLONE_CHANGE:

      const cloneDestTriplet = _.cloneDeep(state.cloneDestTriplet);

      return {
        ...state,
        cloneDestTriplet: _.merge(cloneDestTriplet, action.fields)
      };
    case METADATAFLOWS_METADATAFLOW_EXPORT_SHOW:
      return {
        ...state,
        metadataflowExportSourceTriplet: action.sourceTriplet,
        metadataflowExportDestination: {
          endpoint: null,
          username: null,
          password: null,
          id: action.sourceTriplet.id,
          agencyID: action.sourceTriplet.agencyID,
          version: action.sourceTriplet.version
        },
        isAgenciesValid: !!state.allAgencies
      };
    case METADATAFLOWS_METADATAFLOW_EXPORT_HIDE:
      return {
        ...state,
        metadataflowExportSourceTriplet: null,
        metadataflowExportDestination: null,
        agencies: state.isVisible ? state.agencies : null,
        allAgencies: state.isVisible ? state.allAgencies : null
      };
    case METADATAFLOWS_METADATAFLOW_EXPORT_CHANGE:

      const metadataflowExportDestination = _.cloneDeep(state.metadataflowExportDestination);
      _.merge(metadataflowExportDestination, action.fields);

      return {
        ...state,
        metadataflowExportDestination
      };
    case METADATAFLOWS_METADATAFLOW_PARENTS_AND_CHILDREN_HIDE:
      return {
        ...state,
        parentsAndChildren: null
      };
    case REQUEST_START:
      switch (action.label) {
        case METADATAFLOWS_DETAIL_METADATAFLOW_UPDATE_SUBMIT:
          return {
            ...state,
            isMetadataflowGeneralTabDirty: false,
            agencies: null,
            allAgencies: null
          };
        case METADATAFLOWS_DETAIL_MSDS_READ:
          return {
            ...state,
            msds: null
          };
        default:
          return state;
      }
    case REQUEST_SUCCESS:
      switch (action.label) {
        case METADATAFLOWS_METADATAFLOW_OWNERSHIP_OWNERS_READ:
          return {
            ...state,
            metadataflowOwnershipOwners: action.response.owners.map(({username}) => username)
          };
        case METADATAFLOWS_METADATAFLOW_OWNERSHIP_USERS_READ:
          return {
            ...state,
            metadataflowOwnershipUsers: action.response
          };
        case METADATAFLOWS_METADATAFLOW_OWNERSHIP_OWNERS_SUBMIT:
          return {
            ...state,
            metadataflowOwnershipMetadataflowTripletStr: null,
            metadataflowOwnershipOwners: null,
            metadataflowOwnershipUsers: null
          };
        case METADATAFLOWS_LIST_METADATAFLOWS_READ:
          return {
            ...state,
            metadataflows:
              (getSdmxStructuresFromSdmxJson(action.response) || [])
                .map(artefact => getArtefactFromSdmxJsonStructure(artefact, getCurrentNodeConfig(action).annotations))
          };
        case METADATAFLOWS_DETAIL_METADATAFLOW_READ:

          const userPermissions = getCurrentUserPermissions(action);
          const customNoneIsAutoAnnotation = userPermissions && userPermissions.rules.includes("CanManageWorkingAnnotation")
            ? () => false
            : undefined;

          const metadataflow = getArtefactFromSdmxJsonStructure(
            getSdmxStructuresFromSdmxJson(action.response, SDMX_JSON_METADATAFLOW_LIST_KEY)[0],
            getCurrentNodeConfig(action).annotations,
            customNoneIsAutoAnnotation
          );

          return {
            ...state,
            metadataflow: {
              ...metadataflow,
              msd: metadataflow.structure
                ? getStringFromArtefactTriplet(getArtefactTripletFromUrn(metadataflow.structure))
                : null
            },
            isMetadataflowValid: true
          };
        case METADATAFLOWS_DETAIL_AGENCIES_READ:
          return {
            ...state,
            agencies: _.pickBy(action.response, (_, agencyID) => !action.allowedAgencies || action.allowedAgencies.includes(agencyID)),
            allAgencies: action.response,
            isAgenciesValid: true
          };
        case METADATAFLOWS_METADATAFLOW_DELETE:
          return {
            ...state,
            metadataflowTriplet: null,
            metadataflow: null,
            metadataflows: null,
            isDetailVisible: false,
            agencies: null,
            allAgencies: null,
            msds: null,
            isMsdsListVisible: false,
            isMsdDetailVisible: false
          };
        case METADATAFLOWS_DETAIL_METADATAFLOW_CREATE_SUBMIT:
          return {
            ...state,
            metadataflowTriplet: getArtefactTripletFromString(getStringFromArtefactTriplet(state.metadataflow)),
            metadataflow: null,
            isMetadataflowValid: false,
            metadataflows: null,
            msds: null,
            isMsdsListVisible: false,
            isMsdDetailVisible: false
          };
        case METADATAFLOWS_DETAIL_METADATAFLOW_UPDATE_SUBMIT:
          return {
            ...state,
            metadataflows: null,
            isMetadataflowValid: false,
            msds: null,
            isMsdsListVisible: false,
            isMsdDetailVisible: false
          };
        case METADATAFLOWS_DETAIL_MSDS_READ:
          return {
            ...state,
            msds: (getSdmxStructuresFromSdmxJson(action.response) || []).map(artefact =>
              getArtefactFromSdmxJsonStructure(artefact, getCurrentNodeConfig(action).annotations))
          };
        case METADATAFLOWS_SELECTED_METADATAFLOWS_DELETE:
          return {
            ...state,
            metadataflow: null,
            metadataflows: null
          };
        case METADATAFLOWS_METADATAFLOW_DOWNLOAD:
          return {
            ...state,
            downloadMetadataflowTriplets: null,
            downloadMetadataflowLang: null,
            downloadMetadataflowParams: null
          };
        case METADATAFLOWS_METADATAFLOW_CLONE_SUBMIT:
          return {
            ...state,
            metadataflows: null,
            cloneDestTriplet: null,
            metadataflow: state.isDetailVisible ? state.metadataflow : null,
            metadataflowTriplet: state.isDetailVisible ? state.metadataflowTriplet : null,
            agencies: state.isDetailVisible ? state.agencies : null,
            allAgencies: state.isDetailVisible ? state.allAgencies : null
          };
        case METADATAFLOWS_METADATAFLOW_EXPORT_SUBMIT:
          return {
            ...state,
            metadataflowExportSourceTriplet: null,
            metadataflowExportDestination: null,
            metadataflowExportReport: action.response.itemsMessage,
            agencies: state.isVisible ? state.agencies : null,
            allAgencies: state.isVisible ? state.allAgencies : null
          };
        case METADATAFLOWS_METADATAFLOW_PARENTS_AND_CHILDREN_READ:
          return {
            ...state,
            parentsAndChildren: action.response
          };
        default:
          return state;
      }
    case REQUEST_ERROR:
      switch (action.label) {
        case METADATAFLOWS_DETAIL_METADATAFLOW_READ:
          return {
            ...state,
            isDetailVisible: false,
            isMetadataflowValid: true
          };
        case METADATAFLOWS_SELECTED_METADATAFLOWS_DELETE:
          return {
            ...state,
            metadataflows: null
          };
        default:
          return state;
      }
    default:
      return state;
  }
};

export default metadataflowsReducer;
