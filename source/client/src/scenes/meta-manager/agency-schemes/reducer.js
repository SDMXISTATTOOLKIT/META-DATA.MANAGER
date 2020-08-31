import {REQUEST_ERROR, REQUEST_START, REQUEST_SUCCESS} from "../../../middlewares/api/actions";
import {
  AGENCY_SCHEMES_AGENCY_SCHEME_CLONE_CHANGE,
  AGENCY_SCHEMES_AGENCY_SCHEME_CLONE_HIDE,
  AGENCY_SCHEMES_AGENCY_SCHEME_CLONE_SHOW,
  AGENCY_SCHEMES_AGENCY_SCHEME_CLONE_SUBMIT,
  AGENCY_SCHEMES_AGENCY_SCHEME_CREATE,
  AGENCY_SCHEMES_AGENCY_SCHEME_DELETE,
  AGENCY_SCHEMES_AGENCY_SCHEME_DOWNLOAD,
  AGENCY_SCHEMES_AGENCY_SCHEME_DOWNLOAD_CHANGE,
  AGENCY_SCHEMES_AGENCY_SCHEME_DOWNLOAD_HIDE,
  AGENCY_SCHEMES_AGENCY_SCHEME_DOWNLOAD_SHOW,
  AGENCY_SCHEMES_AGENCY_SCHEME_EDIT,
  AGENCY_SCHEMES_AGENCY_SCHEME_EXPORT_CHANGE,
  AGENCY_SCHEMES_AGENCY_SCHEME_EXPORT_HIDE,
  AGENCY_SCHEMES_AGENCY_SCHEME_EXPORT_REPORT_HIDE,
  AGENCY_SCHEMES_AGENCY_SCHEME_EXPORT_SHOW,
  AGENCY_SCHEMES_AGENCY_SCHEME_EXPORT_SUBMIT,
  AGENCY_SCHEMES_DETAIL_AGENCIES_READ,
  AGENCY_SCHEMES_DETAIL_AGENCY_SCHEME_CHANGE,
  AGENCY_SCHEMES_DETAIL_AGENCY_SCHEME_CREATE_SUBMIT,
  AGENCY_SCHEMES_DETAIL_AGENCY_SCHEME_LANGUAGE_CHANGE,
  AGENCY_SCHEMES_DETAIL_AGENCY_SCHEME_READ,
  AGENCY_SCHEMES_DETAIL_AGENCY_SCHEME_UPDATE_SUBMIT,
  AGENCY_SCHEMES_DETAIL_ANNOTATIONS_HIDE,
  AGENCY_SCHEMES_DETAIL_ANNOTATIONS_SHOW,
  AGENCY_SCHEMES_DETAIL_HIDE,
  AGENCY_SCHEMES_DETAIL_ITEMS_IMPORT_FORM_ALL_CSV_ROWS_HIDE,
  AGENCY_SCHEMES_DETAIL_ITEMS_IMPORT_FORM_ALL_CSV_ROWS_READ,
  AGENCY_SCHEMES_DETAIL_ITEMS_IMPORT_FORM_ALL_CSV_ROWS_SHOW,
  AGENCY_SCHEMES_DETAIL_ITEMS_IMPORT_FORM_CHANGE,
  AGENCY_SCHEMES_DETAIL_ITEMS_IMPORT_FORM_CSV_UPLOAD,
  AGENCY_SCHEMES_DETAIL_ITEMS_IMPORT_FORM_FILE_IMPORT,
  AGENCY_SCHEMES_DETAIL_ITEMS_IMPORT_FORM_FILE_UPLOAD,
  AGENCY_SCHEMES_DETAIL_ITEMS_IMPORT_FORM_HIDE,
  AGENCY_SCHEMES_DETAIL_ITEMS_IMPORT_FORM_SHOW,
  AGENCY_SCHEMES_DETAIL_ITEMS_ITEM_ANNOTATIONS_HIDE,
  AGENCY_SCHEMES_DETAIL_ITEMS_ITEM_ANNOTATIONS_SHOW,
  AGENCY_SCHEMES_DETAIL_ITEMS_ITEM_CREATE,
  AGENCY_SCHEMES_DETAIL_ITEMS_ITEM_CUT,
  AGENCY_SCHEMES_DETAIL_ITEMS_ITEM_DETAIL_CHANGE,
  AGENCY_SCHEMES_DETAIL_ITEMS_ITEM_DETAIL_EDIT,
  AGENCY_SCHEMES_DETAIL_ITEMS_ITEM_DETAIL_HIDE,
  AGENCY_SCHEMES_DETAIL_ITEMS_ITEM_DUPLICATE_ITEM_ERROR_HIDE,
  AGENCY_SCHEMES_DETAIL_ITEMS_ITEM_DUPLICATE_ITEM_ERROR_SHOW,
  AGENCY_SCHEMES_DETAIL_ITEMS_ITEM_LAYOUT_ANNOTATIONS_HIDE,
  AGENCY_SCHEMES_DETAIL_ITEMS_ITEM_LAYOUT_ANNOTATIONS_SHOW,
  AGENCY_SCHEMES_DETAIL_ITEMS_ITEM_SELECT,
  AGENCY_SCHEMES_DETAIL_ITEMS_VIEW_MODE_CHANGE,
  AGENCY_SCHEMES_LIST_AGENCY_SCHEMES_READ,
  AGENCY_SCHEMES_SELECTED_AGENCY_SCHEMES_DELETE
} from "./actions";
import {
  getArtefactFromSdmxJsonStructure,
  getItemSchemeFromSdmxJsonFactory,
  getSdmxStructuresFromSdmxJson,
  SDMX_JSON_AGENCY_SCHEME_ITEMS_KEY,
} from "../../../utils/sdmxJson";
import _ from 'lodash';
import {getMappedTree, getNode, getTreeFromArray} from "../../../utils/tree";
import {getOrderedChildren} from "../../../utils/artefacts";
import {normalizeItemsOrder} from "../../../utils/normalizers";
import {getCurrentNodeConfig} from "../../../middlewares/current-node-config/middleware";
import {getCurrentUserPermissions} from "../../../middlewares/current-user-permissions/middleware";

const AGENCY_SCHEME_ID = "AGENCIES";
const AGENCY_SCHEME_VERSION = "1.0";

const agencySchemesReducer = (
  state = {
    isDetailVisible: false,
    agencySchemeTriplet: null,
    agencySchemes: null,
    isAgencySchemeValid: true,
    isAgenciesValid: true,
    isAgencySchemeGeneralTabDirty: false,
    agencyScheme: null,
    item: null,
    selectedItem: null,
    isItemEditMode: false,
    agencies: null,
    allAgencies: null,
    itemsViewMode: null,
    isItemsImportFormVisible: false,
    itemsImportForm: null,
    itemAnnotations: null,
    itemLayoutAnnotations: null,
    agencySchemeAnnotations: null,
    agencySchemeAnnotationTriplet: null,
    itemsTree: null,
    maxOrder: null,
    isNormalizeNeeded: false,
    isDuplicateItemErrorVisible: false,
    focusItemsTab: false,
    cutItem: null,
    downloadAgencySchemeParams: null,
    downloadAgencySchemeTriplets: null,
    downloadAgencySchemeLang: null,
    cloneDestTriplet: null,
    agencySchemeExportSourceTriplet: null,
    agencySchemeExportDestination: null,
    agencySchemeExportReport: null
  },
  action
) => {
  switch (action.type) {
    case AGENCY_SCHEMES_AGENCY_SCHEME_CREATE:
      return {
        ...state,
        agencyScheme: {
          id: AGENCY_SCHEME_ID,
          agencyID: null,
          version: AGENCY_SCHEME_VERSION,
          isFinal: false,
          uri: null,
          urn: null,
          validTo: null,
          validFrom: null,
          name: null,
          description: null,
          agencies: null
        },
        isDetailVisible: true,
        itemsViewMode: action.defaultItemsViewMode,
        isAgenciesValid: false
      };
    case AGENCY_SCHEMES_AGENCY_SCHEME_EDIT:
      return {
        ...state,
        isDetailVisible: true,
        agencySchemeTriplet: action.agencySchemeTriplet,
        isAgencySchemeValid: false,
        isAgenciesValid: false,
        isAgencySchemeGeneralTabDirty: false,
        focusItemsTab: false,
        itemsViewMode: action.defaultItemsViewMode
      };
    case AGENCY_SCHEMES_DETAIL_HIDE:
      return {
        ...state,
        isDetailVisible: false,
        agencySchemeTriplet: null,
        agencyScheme: null,
        item: null,
        selectedItem: null,
        itemsViewMode: null,
        itemsTree: null,
        maxOrder: null,
        focusItemsTab: false,
        cutItem: null,
        agencies: null,
        allAgencies: null
      };
    case AGENCY_SCHEMES_DETAIL_AGENCY_SCHEME_CHANGE: {
      const agencyScheme = _.cloneDeep(state.agencyScheme);
      const customizer = (_, src, key) => {
        if (key === "annotations")
          return src;
        else {
          return undefined
        }
      };

      return {
        ...state,
        agencyScheme: _.mergeWith(agencyScheme, action.fields, customizer),
        isAgencySchemeGeneralTabDirty: true
      };
    }
    case AGENCY_SCHEMES_DETAIL_ITEMS_VIEW_MODE_CHANGE:
      return {
        ...state,
        itemsViewMode: action.viewMode,
        selectedItem: null
      };
    case AGENCY_SCHEMES_DETAIL_ITEMS_ITEM_CREATE: {
      const maxOrder = state.maxOrder + 1;
      const isNormalizeNeeded = Number(action.order) !== maxOrder;

      return {
        ...state,
        item: {
          id: null,
          parent: action.parentId ? action.parentId : null,
          order: {
            [action.lang]: action.order
          },
          name: null,
          annotations: null,
          autoAnnotations: [{type: action.itemsOrderAnnotationType, text: {[action.lang]: action.order}}],
          description: null,
          agencies: []
        },
        isItemEditMode: false,
        maxOrder: maxOrder,
        isNormalizeNeeded: isNormalizeNeeded
      }
    }
    case AGENCY_SCHEMES_DETAIL_ITEMS_ITEM_DETAIL_EDIT:
      let node = null;
      if (action.item) {
        node = getNode(state.itemsTree, "agencies", node => node.id === action.item.id)
      }

      return {
        ...state,
        item: {
          id: action.item ? action.item.id : null,
          parent: action.item ? action.item.parent : null,
          order: node ? node.order : null,
          name: node ? node.name : null,
          annotations: action.item ? action.item.annotations : null,
          autoAnnotations: action.item ? action.item.autoAnnotations : null,
          description: node ? node.description : null,
          agencies: node ? node.agencies : []
        },
        isItemEditMode: true
      };
    case AGENCY_SCHEMES_DETAIL_ITEMS_ITEM_DETAIL_CHANGE: {
      let item = _.cloneDeep(state.item);

      let isNormalizeNeeded = state.isNormalizeNeeded;
      if (action.fields.order) {
        item.autoAnnotations.find(annotation => annotation.type === action.itemsOrderAnnotationType).text =
          action.fields.order;
        isNormalizeNeeded = state.item.order[action.lang] !== action.fields.order[action.lang];

      }

      const customizer = (_, src, key) => {
        if (key === "annotations")
          return src;
        else {
          return undefined
        }
      };

      return {
        ...state,
        item: _.mergeWith(item, action.fields, customizer),
        isNormalizeNeeded: isNormalizeNeeded
      };
    }
    case AGENCY_SCHEMES_DETAIL_ITEMS_ITEM_DETAIL_HIDE:
      return {
        ...state,
        item: null,
        isItemEditMode: false,
        isDuplicateItemErrorVisible: false,
        maxOrder: state.maxOrder - 1
      };
    case AGENCY_SCHEMES_DETAIL_ITEMS_ITEM_SELECT: {
      const selectedItem = getNode(state.itemsTree, "agencies", node => node.id === action.id);

      return {
        ...state,
        selectedItem: action.id
          ? selectedItem
          : null
      };
    }
    case AGENCY_SCHEMES_DETAIL_ITEMS_IMPORT_FORM_SHOW:
      return {
        ...state,
        isItemsImportFormVisible: true,
        itemsImportForm: {
          file: null,
          language: null,
          separator: ";",
          delimiter: null,
          hasHeader: true,
          hasDescriptionCol: true,
          hasParentCol: true,
          hasOrderCol: true,
          hasLayoutAnnotationFullNameCol: false,
          hasLayoutAnnotationIsDefaultCol: false,
          csvRows: null,
          filePath: null,
          allCsvRows: null,
          isAllCsvRowsVisible: false
        }
      };
    case AGENCY_SCHEMES_DETAIL_ITEMS_IMPORT_FORM_ALL_CSV_ROWS_SHOW:
      return {
        ...state,
        itemsImportForm: {
          ...state.itemsImportForm,
          isAllCsvRowsVisible: true
        }
      };
    case AGENCY_SCHEMES_DETAIL_ITEMS_IMPORT_FORM_ALL_CSV_ROWS_HIDE:
      return {
        ...state,
        itemsImportForm: {
          ...state.itemsImportForm,
          isAllCsvRowsVisible: false
        }
      };
    case AGENCY_SCHEMES_DETAIL_ITEMS_IMPORT_FORM_HIDE:
      return {
        ...state,
        isItemsImportFormVisible: false,
        itemsImportForm: null
      };
    case AGENCY_SCHEMES_DETAIL_ITEMS_IMPORT_FORM_CHANGE:
      return {
        ...state,
        itemsImportForm: {
          ..._.merge(state.itemsImportForm, action.fields),
          hash: action.fields.language ? state.itemsImportForm.hash : null,
          csvRows: action.fields.language ? state.itemsImportForm.csvRows : null,
          filePath: action.fields.language ? state.itemsImportForm.filePath : null,
          allCsvRows: action.fields.language ? state.itemsImportForm.allCsvRows : null
        }
      };
    case AGENCY_SCHEMES_DETAIL_ITEMS_ITEM_ANNOTATIONS_SHOW:
      return {
        ...state,
        itemAnnotations: action.annotations
      };
    case AGENCY_SCHEMES_DETAIL_ITEMS_ITEM_ANNOTATIONS_HIDE:
      return {
        ...state,
        itemAnnotations: null
      };
    case AGENCY_SCHEMES_DETAIL_ITEMS_ITEM_LAYOUT_ANNOTATIONS_SHOW:
      return {
        ...state,
        itemLayoutAnnotations: action.annotations
      };
    case AGENCY_SCHEMES_DETAIL_ITEMS_ITEM_LAYOUT_ANNOTATIONS_HIDE:
      return {
        ...state,
        itemLayoutAnnotations: null
      };
    case AGENCY_SCHEMES_DETAIL_ANNOTATIONS_SHOW:
      return {
        ...state,
        agencySchemeAnnotations: action.annotations,
        agencySchemeAnnotationTriplet: action.triplet
      };
    case AGENCY_SCHEMES_DETAIL_ANNOTATIONS_HIDE:
      return {
        ...state,
        agencySchemeAnnotations: null,
        agencySchemeAnnotationTriplet: null
      };
    case AGENCY_SCHEMES_DETAIL_AGENCY_SCHEME_LANGUAGE_CHANGE: {
      const root = [{
        isRoot: true,
        agencies: state.itemsTree
      }];

      const itemsTree = getMappedTree(
        root,
        "agencies",
        node => {
          node.agencies = getOrderedChildren(node.agencies, node.id, action.lang, action.itemsOrderAnnotationType);
          return node
        }
      )[0].agencies;

      const count = normalizeItemsOrder(itemsTree, "agencies", action.lang, action.itemsOrderAnnotationType);

      return {
        ...state,
        itemsTree: itemsTree,
        maxOrder: count
      };
    }
    case AGENCY_SCHEMES_DETAIL_ITEMS_ITEM_DUPLICATE_ITEM_ERROR_SHOW:
      return {
        ...state,
        isDuplicateItemErrorVisible: true
      };
    case AGENCY_SCHEMES_DETAIL_ITEMS_ITEM_DUPLICATE_ITEM_ERROR_HIDE:
      return {
        ...state,
        isDuplicateItemErrorVisible: false
      };
    case AGENCY_SCHEMES_DETAIL_ITEMS_ITEM_CUT:
      const parentNode = getNode(state.itemsTree, "agencies", node => node.id === action.item.parent);
      parentNode
        ? parentNode.agencies = parentNode.agencies.filter(child => child.id !== action.item.id)
        : state.itemsTree = state.itemsTree.filter(child => child.id !== action.item.id);

      return {
        ...state,
        cutItem: action.item,
        itemsTree: state.itemsTree.splice(0)
      };
    case AGENCY_SCHEMES_AGENCY_SCHEME_DOWNLOAD_SHOW:
      return {
        ...state,
        downloadAgencySchemeTriplets: action.artefactTriplets,
        downloadAgencySchemeLang: action.lang,
        downloadAgencySchemeParams: {
          format: null,
          references: false,
          compression: false,
          csvSeparator: ";",
          csvDelimiter: null,
          csvLanguage: null
        },
      };
    case AGENCY_SCHEMES_AGENCY_SCHEME_DOWNLOAD_HIDE:
      return {
        ...state,
        downloadAgencySchemeTriplets: null,
        downloadAgencySchemeLang: null,
        downloadAgencySchemeParams: null
      };
    case AGENCY_SCHEMES_AGENCY_SCHEME_DOWNLOAD_CHANGE:
      const downloadAgencySchemeParams = _.cloneDeep(state.downloadAgencySchemeParams);
      return {
        ...state,
        downloadAgencySchemeParams: _.merge(downloadAgencySchemeParams, action.fields)
      };
    case AGENCY_SCHEMES_AGENCY_SCHEME_CLONE_SHOW:
      return {
        ...state,
        cloneDestTriplet: {
          ...action.srcTriplet,
          agencyID: null
        },
        agencySchemeTriplet: state.agencySchemeTriplet ? state.agencySchemeTriplet : action.srcTriplet,
        isAgencySchemeValid: !!state.agencyScheme,
        isAgenciesValid: !!state.allAgencies
      };
    case AGENCY_SCHEMES_AGENCY_SCHEME_CLONE_HIDE:
      return {
        ...state,
        cloneDestTriplet: null,
        agencyScheme: state.isDetailVisible ? state.agencyScheme : null,
        agencySchemeTriplet: state.isDetailVisible ? state.agencySchemeTriplet : null,
        itemsTree: state.isDetailVisible ? state.itemsTree : null,
        maxOrder: state.isDetailVisible ? state.maxOrder : null,
        agencies: state.isDetailVisible ? state.agencies : null,
        allAgencies: state.isDetailVisible ? state.allAgencies : null
      };
    case AGENCY_SCHEMES_AGENCY_SCHEME_CLONE_CHANGE:

      const cloneDestTriplet = _.cloneDeep(state.cloneDestTriplet);

      return {
        ...state,
        cloneDestTriplet: _.merge(cloneDestTriplet, action.fields)
      };
    case AGENCY_SCHEMES_AGENCY_SCHEME_EXPORT_SHOW:
      return {
        ...state,
        agencySchemeExportSourceTriplet: action.sourceTriplet,
        agencySchemeExportDestination: {
          endpoint: null,
          username: null,
          password: null,
          id: action.sourceTriplet.id,
          agencyID: action.sourceTriplet.agencyID,
          version: action.sourceTriplet.version
        },
        isAgenciesValid: !!state.allAgencies
      };
    case AGENCY_SCHEMES_AGENCY_SCHEME_EXPORT_HIDE:
      return {
        ...state,
        agencySchemeExportSourceTriplet: null,
        agencySchemeExportDestination: null,
        agencies: state.isDetailVisible ? state.agencies : null,
        allAgencies: state.isDetailVisible ? state.allAgencies : null
      };
    case AGENCY_SCHEMES_AGENCY_SCHEME_EXPORT_CHANGE:

      const agencySchemeExportDestination = _.cloneDeep(state.agencySchemeExportDestination);
      _.merge(agencySchemeExportDestination, action.fields);

      return {
        ...state,
        agencySchemeExportDestination
      };
    case AGENCY_SCHEMES_AGENCY_SCHEME_EXPORT_REPORT_HIDE:
      return {
        ...state,
        agencySchemeExportReport: null
      };
    case REQUEST_START:
      switch (action.label) {
        case AGENCY_SCHEMES_DETAIL_AGENCY_SCHEME_UPDATE_SUBMIT:
          return {
            ...state,
            isAgencySchemeGeneralTabDirty: false
          };
        default:
          return state;
      }
    case REQUEST_SUCCESS:
      switch (action.label) {
        case AGENCY_SCHEMES_LIST_AGENCY_SCHEMES_READ:
          return {
            ...state,
            agencySchemes:
              (getSdmxStructuresFromSdmxJson(action.response) || [])
                .map(artefact => getArtefactFromSdmxJsonStructure(artefact, getCurrentNodeConfig(action).annotations))
          };
        case AGENCY_SCHEMES_DETAIL_AGENCY_SCHEME_READ:

          const userPermissions = getCurrentUserPermissions(action);
          const customNoneIsAutoAnnotation = userPermissions && userPermissions.rules.includes("CanManageWorkingAnnotation")
            ? () => false
            : undefined;

          const agencyScheme = getItemSchemeFromSdmxJsonFactory(
            SDMX_JSON_AGENCY_SCHEME_ITEMS_KEY,
            getCurrentNodeConfig(action).annotations,
            undefined,
            customNoneIsAutoAnnotation
          )(getSdmxStructuresFromSdmxJson(action.response)[0]);

          let itemsTree = getTreeFromArray((agencyScheme.agencies || []), "agencies");

          const root = [{
            isRoot: true,
            agencies: itemsTree
          }];

          itemsTree = getMappedTree(
            root,
            "agencies",
            node => {
              node.agencies = getOrderedChildren(node.agencies, node.id, action.lang, action.itemsOrderAnnotationType);
              return node
            }
          )[0].agencies;

          const count = normalizeItemsOrder(itemsTree, "agencies", action.lang, action.itemsOrderAnnotationType);

          return {
            ...state,
            agencyScheme,
            isAgencySchemeValid: true,
            itemsTree: itemsTree,
            maxOrder: count
          };
        case AGENCY_SCHEMES_DETAIL_AGENCIES_READ:
          return {
            ...state,
            agencies: _.pickBy(action.response, (_, agencyID) => !action.allowedAgencies || action.allowedAgencies.includes(agencyID)),
            allAgencies: action.response,
            isAgenciesValid: true
          };
        case AGENCY_SCHEMES_DETAIL_AGENCY_SCHEME_CREATE_SUBMIT:
          return {
            ...state,
            agencyScheme: null,
            agencySchemes: null,
            isDetailVisible: true,
            itemsTree: null,
            maxOrder: null,
            agencySchemeTriplet: action.agencySchemeTriplet,
            isAgencySchemeValid: false,
            isAgencySchemeGeneralTabDirty: false,
            focusItemsTab: true
          };
        case AGENCY_SCHEMES_AGENCY_SCHEME_DELETE:
          return {
            ...state,
            agencyScheme: null,
            agencySchemes: null,
            isDetailVisible: false,
            itemsTree: null,
            maxOrder: null
          };
        case AGENCY_SCHEMES_DETAIL_AGENCY_SCHEME_UPDATE_SUBMIT:
          return {
            ...state,
            agencySchemes: null,
            item: null,
            selectedItem: null,
            itemsTree: action.itemsTree,
            isNormalizeNeeded: false,
            cutItem: null,
            agencies: null,
            allAgencies: null,
          };
        case AGENCY_SCHEMES_DETAIL_ITEMS_IMPORT_FORM_FILE_UPLOAD:
          return {
            ...state,
            itemsImportForm: {
              ...state.itemsImportForm,
              csvRows: action.response.importedItemCsv,
              hash: action.response.hashImport,
              allCsvRows: null,
              filePath: null
            }
          };
        case AGENCY_SCHEMES_DETAIL_ITEMS_IMPORT_FORM_FILE_IMPORT:
          return {
            ...state,
            itemsImportForm: null,
            isItemsImportFormVisible: false,
            isAgencySchemeValid: false
          };
        case AGENCY_SCHEMES_SELECTED_AGENCY_SCHEMES_DELETE:
          return {
            ...state,
            agencyScheme: null,
            agencySchemes: null
          };
        case AGENCY_SCHEMES_AGENCY_SCHEME_DOWNLOAD:
          return {
            ...state,
            downloadAgencySchemeTriplets: null,
            downloadAgencySchemeLang: null,
            downloadAgencySchemeParams: null
          };
        case AGENCY_SCHEMES_AGENCY_SCHEME_CLONE_SUBMIT:
          return {
            ...state,
            agencySchemes: null,
            cloneDestTriplet: null,
            agencyScheme: state.isDetailVisible ? state.agencyScheme : null,
            agencySchemeTriplet: state.isDetailVisible ? state.agencySchemeTriplet : null,
            itemsTree: state.isDetailVisible ? state.itemsTree : null,
            maxOrder: state.isDetailVisible ? state.maxOrder : null,
            agencies: state.isDetailVisible ? state.agencies : null,
            allAgencies: state.isDetailVisible ? state.allAgencies : null
          };
        case AGENCY_SCHEMES_AGENCY_SCHEME_EXPORT_SUBMIT:
          return {
            ...state,
            agencySchemeExportSourceTriplet: null,
            agencySchemeExportDestination: null,
            agencySchemeExportReport: action.response.itemsMessage,
            agencies: state.isDetailVisible ? state.agencies : null,
            allAgencies: state.isDetailVisible ? state.allAgencies : null
          };
        case AGENCY_SCHEMES_DETAIL_ITEMS_IMPORT_FORM_CSV_UPLOAD:
          return {
            ...state,
            itemsImportForm: {
              ...state.itemsImportForm,
              filePath: action.response
            }
          };
        case AGENCY_SCHEMES_DETAIL_ITEMS_IMPORT_FORM_ALL_CSV_ROWS_READ:
          return {
            ...state,
            itemsImportForm: {
              ...state.itemsImportForm,
              allCsvRows: action.response
            }
          };
        default:
          return state;
      }
    case REQUEST_ERROR:
      switch (action.label) {
        case AGENCY_SCHEMES_DETAIL_AGENCY_SCHEME_READ:
          return {
            ...state,
            isDetailVisible: false,
            isAgencySchemeValid: true
          };
        case AGENCY_SCHEMES_DETAIL_AGENCY_SCHEME_UPDATE_SUBMIT:
          return {
            ...state,
            agencyScheme: null,
            isAgencySchemeValid: false,
          };
        case AGENCY_SCHEMES_SELECTED_AGENCY_SCHEMES_DELETE:
          return {
            ...state,
            agencySchemes: null
          };
        default:
          return state;
      }
    default:
      return state;
  }
};

export default agencySchemesReducer;
