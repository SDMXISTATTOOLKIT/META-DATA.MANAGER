import {REQUEST_ERROR, REQUEST_START, REQUEST_SUCCESS} from "../../../middlewares/api/actions";
import {
  getArtefactFromSdmxJsonStructure,
  getSdmxStructuresFromSdmxJson,
  SDMX_JSON_HIERARCHICAL_CODELIST_LIST_KEY
} from "../../../utils/sdmxJson";
import {
  HIERARCHICAL_CODELISTS_AGENCIES_READ,
  HIERARCHICAL_CODELISTS_HIERARCHICAL_CODELIST_DELETE,
  HIERARCHICAL_CODELISTS_HIERARCHICAL_CODELIST_DETAIL_CHANGE,
  HIERARCHICAL_CODELISTS_HIERARCHICAL_CODELIST_DETAIL_HIDE,
  HIERARCHICAL_CODELISTS_HIERARCHICAL_CODELIST_DETAIL_READ,
  HIERARCHICAL_CODELISTS_HIERARCHICAL_CODELIST_DETAIL_SHOW,
  HIERARCHICAL_CODELISTS_HIERARCHICAL_CODELIST_DETAIL_SUBMIT,
  HIERARCHICAL_CODELISTS_HIERARCHICAL_CODELIST_DOWNLOAD,
  HIERARCHICAL_CODELISTS_HIERARCHICAL_CODELIST_DOWNLOAD_CHANGE,
  HIERARCHICAL_CODELISTS_HIERARCHICAL_CODELIST_DOWNLOAD_HIDE,
  HIERARCHICAL_CODELISTS_HIERARCHICAL_CODELIST_DOWNLOAD_SHOW,
  HIERARCHICAL_CODELISTS_HIERARCHICAL_CODELIST_PARENTS_AND_CHILDREN_HIDE,
  HIERARCHICAL_CODELISTS_HIERARCHICAL_CODELIST_PARENTS_AND_CHILDREN_READ,
  HIERARCHICAL_CODELISTS_LIST_HIERARCHICAL_CODELISTS_READ,
  HIERARCHICAL_CODELISTS_SELECTED_HIERARCHICAL_CODELISTS_DELETE
} from "./actions";
import _ from "lodash";
import {getCurrentNodeConfig} from "../../../middlewares/current-node-config/middleware";
import {getCustomIsPresentationalFromAnnotations} from "../../../utils/referenceMetadata";
import {getCurrentUserPermissions} from "../../../middlewares/current-user-permissions/middleware";

const hierarchicalCodelistsReducer = (
  state = {
    hierarchicalCodelists: null,
    isVisible: false,
    hierarchicalCodelistTriplet: null,
    hierarchicalCodelist: null,
    agencies: null,
    downloadHierarchicalCodelistTriplets: null,
    downloadHierarchicalCodelistLang: null,
    downloadHierarchicalCodelistParams: null,
    parentsAndChildren: null
  },
  action
) => {
  switch (action.type) {
    case HIERARCHICAL_CODELISTS_HIERARCHICAL_CODELIST_DETAIL_SHOW:
      return {
        ...state,
        isVisible: true,
        hierarchicalCodelistTriplet: action.artefactTriplet
      };
    case HIERARCHICAL_CODELISTS_HIERARCHICAL_CODELIST_DETAIL_CHANGE:
      const hierarchicalCodelist = _.cloneDeep(state.hierarchicalCodelist);

      const customizer = (_, src, key) => {
        if (key === "annotations")
          return src;
        else {
          return undefined
        }
      };

      return {
        ...state,
        hierarchicalCodelist: _.mergeWith(hierarchicalCodelist, action.fields, customizer)
      };
    case HIERARCHICAL_CODELISTS_HIERARCHICAL_CODELIST_DETAIL_HIDE:
      return {
        ...state,
        isVisible: false,
        hierarchicalCodelist: null,
        hierarchicalCodelistTriplet: null,
        agencies: null
      };
    case HIERARCHICAL_CODELISTS_HIERARCHICAL_CODELIST_DOWNLOAD_SHOW:
      return {
        ...state,
        downloadHierarchicalCodelistTriplets: action.artefactTriplets,
        downloadHierarchicalCodelistLang: action.lang,
        downloadHierarchicalCodelistParams: {
          format: null,
          references: false,
          compression: false,
          csvSeparator: ";",
          csvDelimiter: null,
          csvLanguage: null
        },
      };
    case HIERARCHICAL_CODELISTS_HIERARCHICAL_CODELIST_DOWNLOAD_HIDE:
      return {
        ...state,
        downloadHierarchicalCodelistTriplets: null,
        downloadHierarchicalCodelistLang: null,
        downloadHierarchicalCodelistParams: null
      };
    case HIERARCHICAL_CODELISTS_HIERARCHICAL_CODELIST_DOWNLOAD_CHANGE:
      const downloadHierarchicalCodelistParams = _.cloneDeep(state.downloadHierarchicalCodelistParams);
      return {
        ...state,
        downloadHierarchicalCodelistParams: _.merge(downloadHierarchicalCodelistParams, action.fields)
      };
    case HIERARCHICAL_CODELISTS_HIERARCHICAL_CODELIST_PARENTS_AND_CHILDREN_HIDE:
      return {
        ...state,
        parentsAndChildren: null
      };
    case REQUEST_START:
      switch (action.label) {
        case HIERARCHICAL_CODELISTS_LIST_HIERARCHICAL_CODELISTS_READ:
          return {
            ...state,
            hierarchicalCodelists: null
          };
        default:
          return state;
      }
    case REQUEST_SUCCESS:
      switch (action.label) {
        case HIERARCHICAL_CODELISTS_LIST_HIERARCHICAL_CODELISTS_READ:
          return {
            ...state,
            hierarchicalCodelists: getSdmxStructuresFromSdmxJson(action.response).map(artefact =>
              getArtefactFromSdmxJsonStructure(artefact, getCurrentNodeConfig(action).annotations))
          };
        case HIERARCHICAL_CODELISTS_AGENCIES_READ:
          return {
            ...state,
            agencies: action.response
          };
        case HIERARCHICAL_CODELISTS_HIERARCHICAL_CODELIST_DETAIL_READ:

          const userPermissions = getCurrentUserPermissions(action);
          const customNoneIsAutoAnnotation = userPermissions && userPermissions.rules.includes("CanManageWorkingAnnotation")
            ? () => false
            : undefined;

          const hierarchicalCodelist = getArtefactFromSdmxJsonStructure(
            getSdmxStructuresFromSdmxJson(action.response, SDMX_JSON_HIERARCHICAL_CODELIST_LIST_KEY)[0],
            getCurrentNodeConfig(action).annotations,
            customNoneIsAutoAnnotation
          );

          return {
            ...state,
            hierarchicalCodelist: {
              ...hierarchicalCodelist,
              customIsPresentational: getCustomIsPresentationalFromAnnotations(hierarchicalCodelist, getCurrentNodeConfig(action).annotations)
            }
          };
        case HIERARCHICAL_CODELISTS_HIERARCHICAL_CODELIST_DETAIL_SUBMIT:
          return {
            ...state,
            hierarchicalCodelist: null,
            hierarchicalCodelists: null
          };
        case HIERARCHICAL_CODELISTS_HIERARCHICAL_CODELIST_DELETE:
          return {
            ...state,
            hierarchicalCodelists: null
          };
        case HIERARCHICAL_CODELISTS_SELECTED_HIERARCHICAL_CODELISTS_DELETE:
          return {
            ...state,
            hierarchicalCodelists: null
          };
        case HIERARCHICAL_CODELISTS_HIERARCHICAL_CODELIST_DOWNLOAD:
          return {
            ...state,
            downloadHierarchicalCodelistTriplets: null,
            downloadHierarchicalCodelistLang: null,
            downloadHierarchicalCodelistParams: null
          };
        case HIERARCHICAL_CODELISTS_HIERARCHICAL_CODELIST_PARENTS_AND_CHILDREN_READ:
          return {
            ...state,
            parentsAndChildren: action.response
          };
        default:
          return state;
      }
    case REQUEST_ERROR:
      switch (action.label) {
        case HIERARCHICAL_CODELISTS_SELECTED_HIERARCHICAL_CODELISTS_DELETE:
          return {
            ...state,
            hierarchicalCodelists: null
          };
        default:
          return state;
      }
    default:
      return state;
  }
};

export default hierarchicalCodelistsReducer;
