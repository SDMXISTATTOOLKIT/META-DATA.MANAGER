import {REQUEST_ERROR, REQUEST_START, REQUEST_SUCCESS} from "../../../middlewares/api/actions";
import {
  DATAFLOWS_DATAFLOW_CLONE_CHANGE,
  DATAFLOWS_DATAFLOW_CLONE_HIDE,
  DATAFLOWS_DATAFLOW_CLONE_SHOW,
  DATAFLOWS_DATAFLOW_CLONE_SUBMIT,
  DATAFLOWS_DATAFLOW_CONTENT_CONSTRAINTS_HIDE,
  DATAFLOWS_DATAFLOW_CONTENT_CONSTRAINTS_READ,
  DATAFLOWS_DATAFLOW_CONTENT_CONSTRAINTS_SHOW,
  DATAFLOWS_DATAFLOW_CREATE,
  DATAFLOWS_DATAFLOW_DELETE,
  DATAFLOWS_DATAFLOW_DOWNLOAD_CHANGE,
  DATAFLOWS_DATAFLOW_DOWNLOAD_HIDE,
  DATAFLOWS_DATAFLOW_DOWNLOAD_SHOW,
  DATAFLOWS_DATAFLOW_DOWNLOAD_SUBMIT,
  DATAFLOWS_DATAFLOW_EDIT,
  DATAFLOWS_DATAFLOW_EXPORT_CHANGE,
  DATAFLOWS_DATAFLOW_EXPORT_HIDE,
  DATAFLOWS_DATAFLOW_EXPORT_REPORT_HIDE,
  DATAFLOWS_DATAFLOW_EXPORT_SHOW,
  DATAFLOWS_DATAFLOW_EXPORT_SUBMIT,
  DATAFLOWS_DATAFLOW_OWNERSHIP_HIDE,
  DATAFLOWS_DATAFLOW_OWNERSHIP_OWNERS_CHANGE,
  DATAFLOWS_DATAFLOW_OWNERSHIP_OWNERS_READ,
  DATAFLOWS_DATAFLOW_OWNERSHIP_OWNERS_SUBMIT,
  DATAFLOWS_DATAFLOW_OWNERSHIP_SHOW,
  DATAFLOWS_DATAFLOW_OWNERSHIP_USERS_READ,
  DATAFLOWS_DATAFLOW_PARENTS_AND_CHILDREN_HIDE,
  DATAFLOWS_DATAFLOW_PARENTS_AND_CHILDREN_READ,
  DATAFLOWS_DETAIL_AGENCIES_READ,
  DATAFLOWS_DETAIL_ANNOTATIONS_HIDE,
  DATAFLOWS_DETAIL_ANNOTATIONS_SHOW,
  DATAFLOWS_DETAIL_DATAFLOW_CHANGE,
  DATAFLOWS_DETAIL_DATAFLOW_CREATE_SUBMIT,
  DATAFLOWS_DETAIL_DATAFLOW_READ,
  DATAFLOWS_DETAIL_DATAFLOW_UPDATE_SUBMIT,
  DATAFLOWS_DETAIL_DSD_FOR_LAYOUT_ANNOTATIONS_READ,
  DATAFLOWS_DETAIL_DSD_SET,
  DATAFLOWS_DETAIL_DSD_UNSET,
  DATAFLOWS_DETAIL_DSDS_HIDE,
  DATAFLOWS_DETAIL_DSDS_READ,
  DATAFLOWS_DETAIL_DSDS_SHOW,
  DATAFLOWS_DETAIL_HIDE,
  DATAFLOWS_DETAIL_LAYOUT_ANNOTATIONS_FORM_HIDE,
  DATAFLOWS_DETAIL_LAYOUT_ANNOTATIONS_FORM_RESET,
  DATAFLOWS_DETAIL_LAYOUT_ANNOTATIONS_FORM_SHOW,
  DATAFLOWS_DETAIL_LAYOUT_ANNOTATIONS_FORM_SUBMIT,
  DATAFLOWS_DETAIL_LAYOUT_ANNOTATIONS_HIDE,
  DATAFLOWS_DETAIL_LAYOUT_ANNOTATIONS_ITEMS_PAGE_READ,
  DATAFLOWS_DETAIL_LAYOUT_ANNOTATIONS_ITEMS_PAGE_RESET,
  DATAFLOWS_DETAIL_LAYOUT_ANNOTATIONS_SHOW,
  DATAFLOWS_LIST_DATAFLOWS_READ,
  DATAFLOWS_SELECTED_DATAFLOWS_DELETE
} from "./actions";
import {
  CODELIST_ORDER_ANNOTATION_KEY,
  getArtefactFromSdmxJsonStructure,
  getArtefactTripletFromUrn,
  getDsdFromSdmxJsonStructure,
  getItemSchemeFromSdmxJsonFactory,
  getSdmxStructuresFromSdmxJson,
  getStringFromArtefactTriplet,
  getUrnFromArtefactTriplet,
  SDMX_JSON_CODELIST_ITEMS_KEY,
  SDMX_JSON_DSD_URN_NAMESPACE
} from "../../../utils/sdmxJson";
import _ from 'lodash';
import {reuseInReducer, reuseReducer} from "../../../utils/reduxReuse";
import dsdDetailModalReducer from "../../../redux-components/redux-dsd-detail-modal/reducer";
import {getCurrentNodeConfig} from "../../../middlewares/current-node-config/middleware";
import contentConstraintDetailModalReducer from "../../../redux-components/redux-content-constraint-modal/reducer";
import {
  getCustomAnnotationsFromTabsMap,
  getCustomAnnotationsTabsMap,
  getGenericAnnotations
} from "../../../utils/annotations";
import {getCurrentUserPermissions} from "../../../middlewares/current-user-permissions/middleware";

export const MM_DATAFLOWS_DSD_DETAIL_PREFIX = "MM_DATAFLOWS_DSD_DETAIL_PREFIX_";
export const MM_DATAFLOWS_SELECTED_DSD_DETAIL_PREFIX = "MM_DATAFLOWS_SELECTED_DSD_DETAIL_PREFIX_";
export const MM_DATAFLOWS_CC_DETAIL_PREFIX = "MM_DATAFLOWS_CC_DETAIL_PREFIX";

const dataflowsReducer = (
  state = {
    isDetailVisible: false,
    dataflowTriplet: null,
    dataflows: null,
    isDataflowValid: true,
    isAgenciesValid: true,
    isDataflowGeneralTabDirty: false,
    dataflow: null,
    dsdForLayoutAnnotations: null,
    agencies: null,
    dsds: null,
    isDsdsListVisible: false,
    dsdDetail: null,
    selectedDsdTriplet: null,
    isDsdDetailVisible: false,
    downloadDataflowParams: null,
    downloadDataflowTriplets: null,
    downloadDataflowLang: null,
    cloneDestTriplet: null,
    dataflowAnnotations: null,
    dataflowLayoutAnnotations: null,
    dataflowAnnotationTriplet: null,
    dataflowExportSourceTriplet: null,
    dataflowExportDestination: null,
    dataflowExportReport: null,
    dataflowOwnershipDataflowTripletStr: null,
    dataflowOwnershipOwners: null,
    dataflowOwnershipUsers: null,
    parentsAndChildren: null,
    dataflowCCsDataflowTriplet: null,
    dataflowCCsContentConstraints: null,
    contentConstraintDetail: null,
    isLayoutAnnotationsFormVisible: false,
    dataflowOriginalAnnotations: null,
    itemsPageForLayoutAnnotations: null
  },
  action
) => {
  switch (action.type) {
    case DATAFLOWS_DETAIL_LAYOUT_ANNOTATIONS_FORM_SHOW:
      return {
        ...state,
        isLayoutAnnotationsFormVisible: true
      };
    case DATAFLOWS_DETAIL_LAYOUT_ANNOTATIONS_FORM_HIDE:
      return {
        ...state,
        isLayoutAnnotationsFormVisible: false
      };
    case DATAFLOWS_DETAIL_LAYOUT_ANNOTATIONS_FORM_SUBMIT:
      return {
        ...state,
        isLayoutAnnotationsFormVisible: false,
        dataflow: {
          ...state.dataflow,
          annotations: action.annotations
        }
      };
    case DATAFLOWS_DETAIL_LAYOUT_ANNOTATIONS_FORM_RESET:
      return {
        ...state,
        dataflow: {
          ...state.dataflow,
          annotations: state.dataflowOriginalAnnotations
        }
      };
    case DATAFLOWS_DETAIL_LAYOUT_ANNOTATIONS_ITEMS_PAGE_RESET:
      return {
        ...state,
        itemsPageForLayoutAnnotations: null
      };
    case DATAFLOWS_DATAFLOW_CREATE:
      return {
        ...state,
        dataflow: {
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
          dsd: null,
          structure: null,
          annotations: null
        },
        dataflowOriginalAnnotations: undefined,
        isDetailVisible: true,
        isAgenciesValid: false
      };
    case DATAFLOWS_DATAFLOW_CONTENT_CONSTRAINTS_SHOW:
      return {
        ...state,
        dataflowCCsDataflowTriplet: action.dataflowTriplet
      };
    case DATAFLOWS_DATAFLOW_CONTENT_CONSTRAINTS_HIDE:
      return {
        ...state,
        dataflowCCsDataflowTriplet: null,
        dataflowCCsContentConstraints: null
      };
    case DATAFLOWS_DATAFLOW_EXPORT_REPORT_HIDE:
      return {
        ...state,
        dataflowExportReport: null
      };
    case DATAFLOWS_DATAFLOW_OWNERSHIP_SHOW: {
      return {
        ...state,
        dataflowOwnershipDataflowTripletStr: action.dataflowTripletStr
      };
    }
    case DATAFLOWS_DATAFLOW_OWNERSHIP_HIDE:
      return {
        ...state,
        dataflowOwnershipDataflowTripletStr: null,
        dataflowOwnershipOwners: null,
        dataflowOwnershipUsers: null
      };
    case DATAFLOWS_DATAFLOW_OWNERSHIP_OWNERS_CHANGE:
      return {
        ...state,
        dataflowOwnershipOwners: action.owners
      };
    case DATAFLOWS_DATAFLOW_EDIT:
      return {
        ...state,
        isDetailVisible: true,
        dataflowTriplet: action.dataflowTriplet,
        isDataflowValid: false,
        isAgenciesValid: false,
        isDataflowGeneralTabDirty: false
      };
    case DATAFLOWS_DETAIL_HIDE:
      return {
        ...state,
        isDetailVisible: false,
        dataflowTriplet: null,
        dataflow: null,
        dsds: null,
        dsdForLayoutAnnotations: null,
        isDsdsListVisible: false,
        dsdDetail: null,
        selectedDsdTriplet: null,
        isDsdDetailVisible: false,
        agencies: null,
        allAgencies: null
      };
    case DATAFLOWS_DETAIL_DATAFLOW_CHANGE: {
      const dataflow = _.cloneDeep(state.dataflow);
      const customizer = (_, src, key) => {
        if (key === "annotations")
          return src;
        else {
          return undefined
        }
      };

      const newDataflow = _.mergeWith(dataflow, action.fields, customizer);

      return {
        ...state,
        dataflow: newDataflow,
        isDataflowGeneralTabDirty: true,
        dataflowOriginalAnnotations: newDataflow.annotations
      };
    }
    case DATAFLOWS_DETAIL_DSDS_SHOW:
      return {
        ...state,
        isDsdsListVisible: true
      };
    case DATAFLOWS_DETAIL_DSDS_HIDE:
      return {
        ...state,
        isDsdsListVisible: false,
        dsds: null
      };
    case DATAFLOWS_DETAIL_DSD_SET:
      return {
        ...state,
        isDsdsListVisible: false,
        dsds: null,
        dataflow: {
          ...state.dataflow,
          dsd: getStringFromArtefactTriplet(action.dsdTriplet),
          structure: getUrnFromArtefactTriplet(action.dsdTriplet, SDMX_JSON_DSD_URN_NAMESPACE)
        },
        selectedDsdTriplet: action.dsdTriplet,
        dsdDetail: null
      };
    case DATAFLOWS_DETAIL_DSD_UNSET:
      return {
        ...state,
        dataflow: {
          ...state.dataflow,
          dsd: null,
          structure: null,
        },
        dsdDetail: null,
        dsdForLayoutAnnotations: null
      };
    case DATAFLOWS_DETAIL_ANNOTATIONS_SHOW:
      return {
        ...state,
        dataflowAnnotations: action.annotations,
        dataflowAnnotationTriplet: action.triplet
      };
    case DATAFLOWS_DETAIL_ANNOTATIONS_HIDE:
      return {
        ...state,
        dataflowAnnotations: null,
        dataflowAnnotationTriplet: null
      };
    case DATAFLOWS_DETAIL_LAYOUT_ANNOTATIONS_SHOW:
      return {
        ...state,
        dataflowLayoutAnnotations: action.annotations,
        dataflowAnnotationTriplet: action.triplet
      };
    case DATAFLOWS_DETAIL_LAYOUT_ANNOTATIONS_HIDE:
      return {
        ...state,
        dataflowLayoutAnnotations: null,
        dataflowAnnotationTriplet: null
      };
    case DATAFLOWS_DATAFLOW_DOWNLOAD_SHOW:
      return {
        ...state,
        downloadDataflowTriplets: action.artefactTriplets,
        downloadDataflowLang: action.lang,
        downloadDataflowParams: {
          format: null,
          references: false,
          compression: false,
          csvSeparator: ";",
          csvDelimiter: null,
          csvLanguage: null
        },
      };
    case DATAFLOWS_DATAFLOW_DOWNLOAD_HIDE:
      return {
        ...state,
        downloadDataflowTriplets: null,
        downloadDataflowLang: null,
        downloadDataflowParams: null
      };
    case DATAFLOWS_DATAFLOW_DOWNLOAD_CHANGE:
      const downloadDataflowParams = _.cloneDeep(state.downloadDataflowParams);
      return {
        ...state,
        downloadDataflowParams: _.merge(downloadDataflowParams, action.fields)
      };
    case DATAFLOWS_DATAFLOW_CLONE_SHOW:
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
        dataflowTriplet: state.dataflowTriplet ? state.dataflowTriplet : action.srcTriplet,
        isDataflowValid: !!state.dataflow,
        isAgenciesValid: !!state.allAgencies
      };
    case DATAFLOWS_DATAFLOW_CLONE_HIDE:
      return {
        ...state,
        cloneDestTriplet: null,
        dataflow: state.isDetailVisible ? state.dataflow : null,
        selectedDsdTriplet: state.selectedDsdTriplet ? state.dataflow : null,
        agencies: state.isDetailVisible ? state.agencies : null,
        allAgencies: state.isDetailVisible ? state.allAgencies : null
      };
    case DATAFLOWS_DATAFLOW_CLONE_CHANGE:

      const cloneDestTriplet = _.cloneDeep(state.cloneDestTriplet);

      return {
        ...state,
        cloneDestTriplet: _.merge(cloneDestTriplet, action.fields)
      };
    case DATAFLOWS_DATAFLOW_EXPORT_SHOW:
      return {
        ...state,
        dataflowExportSourceTriplet: action.sourceTriplet,
        dataflowExportDestination: {
          endpoint: null,
          username: null,
          password: null,
          id: action.sourceTriplet.id,
          agencyID: action.sourceTriplet.agencyID,
          version: action.sourceTriplet.version
        },
        isAgenciesValid: !!state.allAgencies
      };
    case DATAFLOWS_DATAFLOW_EXPORT_HIDE:
      return {
        ...state,
        dataflowExportSourceTriplet: null,
        dataflowExportDestination: null,
        agencies: state.isDetailVisible ? state.agencies : null,
        allAgencies: state.isDetailVisible ? state.allAgencies : null
      };
    case DATAFLOWS_DATAFLOW_EXPORT_CHANGE:

      const dataflowExportDestination = _.cloneDeep(state.dataflowExportDestination);
      _.merge(dataflowExportDestination, action.fields);

      return {
        ...state,
        dataflowExportDestination
      };
    case DATAFLOWS_DATAFLOW_PARENTS_AND_CHILDREN_HIDE:
      return {
        ...state,
        parentsAndChildren: null
      };
    case REQUEST_START:
      switch (action.label) {
        case DATAFLOWS_DETAIL_DATAFLOW_UPDATE_SUBMIT:
          return {
            ...state,
            isDataflowGeneralTabDirty: false,
            agencies: null,
            allAgencies: null
          };
        case DATAFLOWS_DETAIL_DSDS_READ:
          return {
            ...state,
            dsds: null
          };
        default:
          return state;
      }
    case REQUEST_SUCCESS:
      switch (action.label) {
        case DATAFLOWS_DETAIL_LAYOUT_ANNOTATIONS_ITEMS_PAGE_READ:
          return {
            ...state,
            itemsPageForLayoutAnnotations: getItemSchemeFromSdmxJsonFactory(
              SDMX_JSON_CODELIST_ITEMS_KEY,
              getCurrentNodeConfig(action).annotations,
              CODELIST_ORDER_ANNOTATION_KEY
            )(getSdmxStructuresFromSdmxJson(action.response)[0]).codes || []
          };
        case DATAFLOWS_DATAFLOW_OWNERSHIP_OWNERS_READ:
          return {
            ...state,
            dataflowOwnershipOwners: action.response.owners.map(({username}) => username)
          };
        case DATAFLOWS_DATAFLOW_OWNERSHIP_USERS_READ:
          return {
            ...state,
            dataflowOwnershipUsers: action.response
          };
        case DATAFLOWS_DATAFLOW_OWNERSHIP_OWNERS_SUBMIT:
          return {
            ...state,
            dataflowOwnershipDataflowTripletStr: null,
            dataflowOwnershipOwners: null,
            dataflowOwnershipUsers: null
          };
        case DATAFLOWS_LIST_DATAFLOWS_READ:
          return {
            ...state,
            dataflows:
              (getSdmxStructuresFromSdmxJson(action.response) || [])
                .map(artefact => getArtefactFromSdmxJsonStructure(artefact, getCurrentNodeConfig(action).annotations))
          };
        case DATAFLOWS_DETAIL_DATAFLOW_READ:

          const userPermissions = getCurrentUserPermissions(action);
          const customNoneIsAutoAnnotation = userPermissions && userPermissions.rules.includes("CanManageWorkingAnnotation")
            ? () => false
            : undefined;

          const dataflow = getArtefactFromSdmxJsonStructure(getSdmxStructuresFromSdmxJson(action.response)[0], getCurrentNodeConfig(action).annotations, customNoneIsAutoAnnotation);

          const annotationTabsConfig = getCurrentNodeConfig(action).annotationTabs.tabs;
          const annotationsConfig = getCurrentNodeConfig(action).annotations;

          return {
            ...state,
            dataflow: {
              ...dataflow,
              dsd: getStringFromArtefactTriplet(getArtefactTripletFromUrn(dataflow.structure))
            },
            selectedDsdTriplet: getArtefactTripletFromUrn(dataflow.structure),
            isDataflowValid: true,
            dataflowOriginalAnnotations: [
              ...getGenericAnnotations(dataflow.annotations, annotationTabsConfig, annotationsConfig),
              ...getCustomAnnotationsFromTabsMap(getCustomAnnotationsTabsMap(dataflow.annotations, annotationTabsConfig))
            ]
          };
        case DATAFLOWS_DETAIL_AGENCIES_READ:
          return {
            ...state,
            agencies: _.pickBy(action.response, (_, agencyID) => !action.allowedAgencies || action.allowedAgencies.includes(agencyID)),
            allAgencies: action.response,
            isAgenciesValid: true
          };
        case DATAFLOWS_DETAIL_DATAFLOW_CREATE_SUBMIT:
        case DATAFLOWS_DATAFLOW_DELETE:
          return {
            ...state,
            dataflow: null,
            dataflows: null,
            isDetailVisible: false,
            agencies: null,
            allAgencies: null
          };
        case DATAFLOWS_DETAIL_DATAFLOW_UPDATE_SUBMIT:
          return {
            ...state,
            dataflow: null,
            dataflows: null,
            isDataflowValid: false,
            item: null
          };
        case DATAFLOWS_DETAIL_DSDS_READ:
          return {
            ...state,
            dsds: (getSdmxStructuresFromSdmxJson(action.response) || [])
              .map(artefact => getArtefactFromSdmxJsonStructure(artefact, getCurrentNodeConfig(action).annotations))
          };
        case DATAFLOWS_SELECTED_DATAFLOWS_DELETE:
          return {
            ...state,
            dataflow: null,
            dataflows: null,
          };
        case DATAFLOWS_DATAFLOW_DOWNLOAD_SUBMIT:
          return {
            ...state,
            downloadDataflowTriplets: null,
            downloadDataflowLang: null,
            downloadDataflowParams: null
          };
        case DATAFLOWS_DATAFLOW_CLONE_SUBMIT:
          return {
            ...state,
            dataflows: null,
            cloneDestTriplet: null,
            dataflow: state.isDetailVisible ? state.dataflow : null,
            selectedDsdTriplet: state.selectedDsdTriplet ? state.dataflow : null,
            agencies: state.isDetailVisible ? state.agencies : null,
            allAgencies: state.isDetailVisible ? state.allAgencies : null
          };
        case DATAFLOWS_DATAFLOW_EXPORT_SUBMIT:
          return {
            ...state,
            dataflowExportSourceTriplet: null,
            dataflowExportDestination: null,
            dataflowExportReport: action.response.itemsMessage,
            agencies: state.isDetailVisible ? state.agencies : null,
            allAgencies: state.isDetailVisible ? state.allAgencies : null
          };
        case DATAFLOWS_DETAIL_DSD_FOR_LAYOUT_ANNOTATIONS_READ:
          return {
            ...state,
            dsdForLayoutAnnotations: getDsdFromSdmxJsonStructure(
              getSdmxStructuresFromSdmxJson(action.response)[0],
              getCurrentNodeConfig(action).annotations
            )
          };
        case DATAFLOWS_DATAFLOW_PARENTS_AND_CHILDREN_READ:
          return {
            ...state,
            parentsAndChildren: action.response
          };
        case DATAFLOWS_DATAFLOW_CONTENT_CONSTRAINTS_READ:
          return {
            ...state,
            dataflowCCsContentConstraints:
              action.response
                .map(art => getArtefactFromSdmxJsonStructure(art, getCurrentNodeConfig(action).annotations))
                .map(cc => ({
                  ...cc,
                  agencyID: cc.agency
                }))
          };
        default:
          return state;
      }
    case REQUEST_ERROR:
      switch (action.label) {
        case DATAFLOWS_DETAIL_DATAFLOW_READ:
          return {
            ...state,
            isDetailVisible: false,
            isDataflowValid: true
          };
        case DATAFLOWS_SELECTED_DATAFLOWS_DELETE:
          return {
            ...state,
            dataflows: null
          };
        default:
          return state;
      }
    default:
      return state;
  }
};

export default reuseInReducer(dataflowsReducer, {
  dsdDetail: reuseReducer(dsdDetailModalReducer, MM_DATAFLOWS_DSD_DETAIL_PREFIX),
  selectedDsdDetail: reuseReducer(dsdDetailModalReducer, MM_DATAFLOWS_SELECTED_DSD_DETAIL_PREFIX),
  contentConstraintDetail: reuseReducer(contentConstraintDetailModalReducer, MM_DATAFLOWS_CC_DETAIL_PREFIX)
});