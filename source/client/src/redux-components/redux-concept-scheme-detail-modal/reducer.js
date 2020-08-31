import {REQUEST_ERROR, REQUEST_SUCCESS} from "../../middlewares/api/actions";
import {
  CONCEPT_SCHEME_DETAIL_AGENCIES_READ,
  CONCEPT_SCHEME_DETAIL_CHANGE,
  CONCEPT_SCHEME_DETAIL_CLONE_CHANGE,
  CONCEPT_SCHEME_DETAIL_CLONE_HIDE,
  CONCEPT_SCHEME_DETAIL_CLONE_SHOW,
  CONCEPT_SCHEME_DETAIL_CLONE_SUBMIT,
  CONCEPT_SCHEME_DETAIL_CREATE,
  CONCEPT_SCHEME_DETAIL_CREATE_SUBMIT,
  CONCEPT_SCHEME_DETAIL_DERIVED_TAB_FOCUS,
  CONCEPT_SCHEME_DETAIL_DERIVED_TAB_UNFOCUS,
  CONCEPT_SCHEME_DETAIL_DOWNLOAD_CHANGE,
  CONCEPT_SCHEME_DETAIL_DOWNLOAD_HIDE,
  CONCEPT_SCHEME_DETAIL_DOWNLOAD_SHOW,
  CONCEPT_SCHEME_DETAIL_DOWNLOAD_SUBMIT,
  CONCEPT_SCHEME_DETAIL_EDIT,
  CONCEPT_SCHEME_DETAIL_EXPORT_CHANGE,
  CONCEPT_SCHEME_DETAIL_EXPORT_HIDE,
  CONCEPT_SCHEME_DETAIL_EXPORT_REPORT_HIDE,
  CONCEPT_SCHEME_DETAIL_EXPORT_SHOW,
  CONCEPT_SCHEME_DETAIL_EXPORT_SUBMIT,
  CONCEPT_SCHEME_DETAIL_HIDE,
  CONCEPT_SCHEME_DETAIL_ITEMS_IMPORT_FORM_ALL_CSV_ROWS_HIDE,
  CONCEPT_SCHEME_DETAIL_ITEMS_IMPORT_FORM_ALL_CSV_ROWS_READ,
  CONCEPT_SCHEME_DETAIL_ITEMS_IMPORT_FORM_ALL_CSV_ROWS_SHOW,
  CONCEPT_SCHEME_DETAIL_ITEMS_IMPORT_FORM_CHANGE,
  CONCEPT_SCHEME_DETAIL_ITEMS_IMPORT_FORM_CSV_UPLOAD,
  CONCEPT_SCHEME_DETAIL_ITEMS_IMPORT_FORM_FILE_IMPORT,
  CONCEPT_SCHEME_DETAIL_ITEMS_IMPORT_FORM_FILE_UPLOAD,
  CONCEPT_SCHEME_DETAIL_ITEMS_IMPORT_FORM_HIDE,
  CONCEPT_SCHEME_DETAIL_ITEMS_IMPORT_FORM_SHOW,
  CONCEPT_SCHEME_DETAIL_ITEMS_ITEM_ANNOTATIONS_HIDE,
  CONCEPT_SCHEME_DETAIL_ITEMS_ITEM_ANNOTATIONS_SHOW,
  CONCEPT_SCHEME_DETAIL_ITEMS_ITEM_CHANGE,
  CONCEPT_SCHEME_DETAIL_ITEMS_ITEM_CREATE,
  CONCEPT_SCHEME_DETAIL_ITEMS_ITEM_CUT,
  CONCEPT_SCHEME_DETAIL_ITEMS_ITEM_DUPLICATE_ITEM_ERROR_HIDE,
  CONCEPT_SCHEME_DETAIL_ITEMS_ITEM_DUPLICATE_ITEM_ERROR_SHOW,
  CONCEPT_SCHEME_DETAIL_ITEMS_ITEM_EDIT,
  CONCEPT_SCHEME_DETAIL_ITEMS_ITEM_HIDE,
  CONCEPT_SCHEME_DETAIL_ITEMS_ITEM_LAYOUT_ANNOTATIONS_HIDE,
  CONCEPT_SCHEME_DETAIL_ITEMS_ITEM_LAYOUT_ANNOTATIONS_SHOW,
  CONCEPT_SCHEME_DETAIL_ITEMS_ITEM_PARENT_LIST_HIDE,
  CONCEPT_SCHEME_DETAIL_ITEMS_ITEM_PARENT_LIST_SET,
  CONCEPT_SCHEME_DETAIL_ITEMS_ITEM_PARENT_LIST_SHOW,
  CONCEPT_SCHEME_DETAIL_ITEMS_ITEM_PARENT_LIST_UNSET,
  CONCEPT_SCHEME_DETAIL_ITEMS_ITEM_SELECT,
  CONCEPT_SCHEME_DETAIL_ITEMS_VIEW_MODE_CHANGE,
  CONCEPT_SCHEME_DETAIL_LANGUAGE_CHANGE,
  CONCEPT_SCHEME_DETAIL_READ,
  CONCEPT_SCHEME_DETAIL_SHOW,
  CONCEPT_SCHEME_DETAIL_UPDATE_SUBMIT
} from "./actions";
import {
  CONCEPT_SCHEME_ORDER_ANNOTATION_KEY,
  getItemSchemeFromSdmxJsonFactory,
  getSdmxStructuresFromSdmxJson,
  SDMX_JSON_CONCEPT_SCHEME_ITEMS_KEY,
} from "../../utils/sdmxJson";
import _ from 'lodash';
import {getMappedTree, getNode, getTreeFromArray} from "../../utils/tree";
import {getOrderedChildren} from "../../utils/artefacts";
import {normalizeItemsOrder} from "../../utils/normalizers";
import {NODES_CONFIG_NODE_GENERAL_ITEMS_VIEW_MODE_TABLE} from "../../scenes/configuration/nodes-config/node/GeneralForm";
import {reuseInReducer, reuseReducer} from "../../utils/reduxReuse";
import derivedItemSchemeReducer from "../redux-derived-item-scheme/reducer";
import {getCurrentNodeConfig} from "../../middlewares/current-node-config/middleware";
import {getCurrentUserPermissions} from "../../middlewares/current-user-permissions/middleware";

export const REDUX_CONCEPT_SCHEMES_DETAIL_DERIVED_IS_PREFIX = "REDUX_CONCEPT_SCHEMES_DETAIL_DERIVED_IS_PREFIX_";

const conceptSchemeDetailModalReducer = (
  state = {
    conceptSchemeTriplet: null,
    forceIsFinalDisabled: false,
    isVisible: false,
    isEditDisabled: false,
    isConceptSchemeValid: true,
    isAgenciesValid: true,
    isConceptSchemeGeneralTabDirty: false,
    conceptScheme: null,
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
    itemAnnotationId: null,
    conceptSchemeAnnotations: null,
    conceptSchemeLayoutAnnotations: null,
    isItemsParentListVisible: false,
    itemsTree: null,
    maxOrder: null,
    isNormalizeNeeded: false,
    isDuplicateItemErrorVisible: false,
    focusItemsTab: false,
    cutItem: null,
    downloadConceptSchemeTriplets: null,
    downloadConceptSchemeLang: null,
    downloadConceptSchemeParams: null,
    cloneDestTriplet: null,
    conceptSchemeExportSourceTriplet: null,
    conceptSchemeExportDestination: null,
    conceptSchemeExportReport: null,
    parentsAndChildren: null,
    isDerivedTabFocused: false
  },
  action
) => {
  switch (action.type) {
    case CONCEPT_SCHEME_DETAIL_CREATE:
      return {
        ...state,
        conceptScheme: {
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
          concepts: null
        },
        isVisible: true,
        itemsViewMode: action.defaultItemsViewMode || NODES_CONFIG_NODE_GENERAL_ITEMS_VIEW_MODE_TABLE,
        isAgenciesValid: false,
        isDerivedTabFocused: false
      };
    case CONCEPT_SCHEME_DETAIL_EDIT:
      return {
        ...state,
        isVisible: true,
        conceptSchemeTriplet: action.conceptSchemeTriplet,
        isConceptSchemeValid: false,
        isAgenciesValid: false,
        isConceptSchemeGeneralTabDirty: false,
        focusItemsTab: false,
        itemsViewMode: action.defaultItemsViewMode || NODES_CONFIG_NODE_GENERAL_ITEMS_VIEW_MODE_TABLE,
        isEditDisabled: false,
        isDerivedTabFocused: false
      };
    case CONCEPT_SCHEME_DETAIL_SHOW:
      return {
        ...state,
        isVisible: true,
        forceIsFinalDisabled: false,
        conceptSchemeTriplet: action.conceptSchemeTriplet,
        isConceptSchemeValid: false,
        isAgenciesValid: false,
        isConceptSchemeGeneralTabDirty: false,
        focusItemsTab: false,
        itemsViewMode: action.defaultItemsViewMode || NODES_CONFIG_NODE_GENERAL_ITEMS_VIEW_MODE_TABLE,
        isEditDisabled: true,
        isDerivedTabFocused: false
      };
    case CONCEPT_SCHEME_DETAIL_HIDE:
      return {
        ...state,
        forceIsFinalDisabled: false,
        isVisible: false,
        conceptSchemeTriplet: null,
        conceptScheme: null,
        item: null,
        selectedItem: null,
        itemsViewMode: null,
        itemsTree: null,
        maxOrder: null,
        focusItemsTab: false,
        cutItem: null,
        agencies: null,
        allAgencies: null,
        isDerivedTabFocused: false
      };
    case CONCEPT_SCHEME_DETAIL_CHANGE: {
      const conceptScheme = _.cloneDeep(state.conceptScheme);
      const customizer = (_, src, key) => {
        if (key === "annotations")
          return src;
        else {
          return undefined
        }
      };

      return {
        ...state,
        conceptScheme: _.mergeWith(conceptScheme, action.fields, customizer),
        isConceptSchemeGeneralTabDirty: true
      };
    }
    case CONCEPT_SCHEME_DETAIL_ITEMS_VIEW_MODE_CHANGE:
      return {
        ...state,
        itemsViewMode: action.viewMode,
        selectedItem: null
      };
    case CONCEPT_SCHEME_DETAIL_ITEMS_ITEM_CREATE: {
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
          concepts: []
        },
        isItemEditMode: false,
        maxOrder: maxOrder,
        isNormalizeNeeded: isNormalizeNeeded
      }
    }
    case CONCEPT_SCHEME_DETAIL_ITEMS_ITEM_EDIT:
      let node = null;
      if (action.item) {
        node = getNode(state.itemsTree, "concepts", node => node.id === action.item.id)
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
          concepts: node ? node.concepts : []
        },
        isItemEditMode: true
      };
    case CONCEPT_SCHEME_DETAIL_ITEMS_ITEM_CHANGE: {
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
    case CONCEPT_SCHEME_DETAIL_ITEMS_ITEM_HIDE:
      return {
        ...state,
        item: null,
        isItemEditMode: false,
        isDuplicateItemErrorVisible: false,
        maxOrder: state.maxOrder - 1
      };
    case CONCEPT_SCHEME_DETAIL_ITEMS_ITEM_SELECT: {
      const selectedItem = getNode(state.itemsTree, "concepts", node => node.id === action.id);

      return {
        ...state,
        selectedItem: action.id
          ? selectedItem
          : null
      };
    }
    case CONCEPT_SCHEME_DETAIL_ITEMS_IMPORT_FORM_SHOW:
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
    case CONCEPT_SCHEME_DETAIL_ITEMS_IMPORT_FORM_HIDE:
      return {
        ...state,
        isItemsImportFormVisible: false,
        itemsImportForm: null
      };
    case CONCEPT_SCHEME_DETAIL_ITEMS_IMPORT_FORM_ALL_CSV_ROWS_SHOW:
      return {
        ...state,
        itemsImportForm: {
          ...state.itemsImportForm,
          isAllCsvRowsVisible: true
        }
      };
    case CONCEPT_SCHEME_DETAIL_ITEMS_IMPORT_FORM_ALL_CSV_ROWS_HIDE:
      return {
        ...state,
        itemsImportForm: {
          ...state.itemsImportForm,
          isAllCsvRowsVisible: false
        }
      };
    case CONCEPT_SCHEME_DETAIL_ITEMS_IMPORT_FORM_CHANGE:
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
    case CONCEPT_SCHEME_DETAIL_ITEMS_ITEM_ANNOTATIONS_SHOW:
      return {
        ...state,
        itemAnnotations: action.annotations,
        itemAnnotationId: action.itemId
      };
    case CONCEPT_SCHEME_DETAIL_ITEMS_ITEM_ANNOTATIONS_HIDE:
      return {
        ...state,
        itemAnnotations: null,
        itemAnnotationId: null
      };
    case CONCEPT_SCHEME_DETAIL_ITEMS_ITEM_LAYOUT_ANNOTATIONS_SHOW:
      return {
        ...state,
        itemLayoutAnnotations: action.annotations,
        itemAnnotationId: action.itemId
      };
    case CONCEPT_SCHEME_DETAIL_ITEMS_ITEM_LAYOUT_ANNOTATIONS_HIDE:
      return {
        ...state,
        itemLayoutAnnotations: null,
        itemAnnotationId: null
      };
    case CONCEPT_SCHEME_DETAIL_ITEMS_ITEM_PARENT_LIST_SHOW:
      return {
        ...state,
        isItemsParentListVisible: true
      };
    case CONCEPT_SCHEME_DETAIL_ITEMS_ITEM_PARENT_LIST_HIDE:
      return {
        ...state,
        isItemsParentListVisible: false
      };
    case CONCEPT_SCHEME_DETAIL_ITEMS_ITEM_PARENT_LIST_SET:
      return {
        ...state,
        item: {
          ...state.item,
          parent: action.item.id
        },
        isItemsParentListVisible: false
      };
    case CONCEPT_SCHEME_DETAIL_ITEMS_ITEM_PARENT_LIST_UNSET:
      return {
        ...state,
        item: {
          ...state.item,
          parent: null
        }
      };
    case CONCEPT_SCHEME_DETAIL_LANGUAGE_CHANGE: {
      const root = [{
        isRoot: true,
        concepts: state.itemsTree
      }];

      const itemsTree = getMappedTree(
        root,
        "concepts",
        node => {
          node.concepts = getOrderedChildren(node.concepts, node.id, action.lang, action.itemsOrderAnnotationType);
          return node
        }
      )[0].concepts;

      const count = normalizeItemsOrder(itemsTree, "concepts", action.lang, action.itemsOrderAnnotationType);

      return {
        ...state,
        itemsTree: itemsTree,
        maxOrder: count
      };
    }
    case CONCEPT_SCHEME_DETAIL_ITEMS_ITEM_DUPLICATE_ITEM_ERROR_SHOW:
      return {
        ...state,
        isDuplicateItemErrorVisible: true
      };
    case CONCEPT_SCHEME_DETAIL_ITEMS_ITEM_DUPLICATE_ITEM_ERROR_HIDE:
      return {
        ...state,
        isDuplicateItemErrorVisible: false
      };
    case CONCEPT_SCHEME_DETAIL_ITEMS_ITEM_CUT:
      const parentNode = getNode(state.itemsTree, "concepts", node => node.id === action.item.parent);
      parentNode
        ? parentNode.concepts = parentNode.concepts.filter(child => child.id !== action.item.id)
        : state.itemsTree = state.itemsTree.filter(child => child.id !== action.item.id);

      return {
        ...state,
        cutItem: action.item,
        itemsTree: state.itemsTree.splice(0)
      };
    case CONCEPT_SCHEME_DETAIL_DOWNLOAD_SHOW:
      return {
        ...state,
        downloadConceptSchemeTriplets: action.artefactTriplets,
        downloadConceptSchemeLang: action.lang,
        downloadConceptSchemeParams: {
          format: null,
          references: false,
          compression: false,
          csvSeparator: ";",
          csvDelimiter: null,
          csvLanguage: null
        },
      };
    case CONCEPT_SCHEME_DETAIL_DOWNLOAD_HIDE:
      return {
        ...state,
        downloadConceptSchemeTriplets: null,
        downloadConceptSchemeLang: null,
        downloadConceptSchemeParams: null
      };
    case CONCEPT_SCHEME_DETAIL_DOWNLOAD_CHANGE:
      const downloadConceptSchemeParams = _.cloneDeep(state.downloadConceptSchemeParams);
      return {
        ...state,
        downloadConceptSchemeParams: _.merge(downloadConceptSchemeParams, action.fields)
      };
    case CONCEPT_SCHEME_DETAIL_CLONE_SHOW:
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
        conceptSchemeTriplet: state.conceptSchemeTriplet ? state.conceptSchemeTriplet : action.srcTriplet,
        isConceptSchemeValid: !!state.conceptScheme,
        isAgenciesValid: !!state.allAgencies
      };
    case CONCEPT_SCHEME_DETAIL_CLONE_HIDE:
      return {
        ...state,
        cloneDestTriplet: null,
        conceptScheme: state.isVisible ? state.conceptScheme : null,
        conceptSchemeTriplet: state.isVisible ? state.conceptSchemeTriplet : null,
        itemsTree: state.isVisible ? state.itemsTree : null,
        maxOrder: state.isVisible ? state.maxOrder : null,
        agencies: state.isVisible ? state.agencies : null,
        allAgencies: state.isVisible ? state.allAgencies : null
      };
    case CONCEPT_SCHEME_DETAIL_CLONE_CHANGE:

      const cloneDestTriplet = _.cloneDeep(state.cloneDestTriplet);

      return {
        ...state,
        cloneDestTriplet: _.merge(cloneDestTriplet, action.fields)
      };
    case CONCEPT_SCHEME_DETAIL_EXPORT_SHOW:
      return {
        ...state,
        conceptSchemeExportSourceTriplet: action.sourceTriplet,
        conceptSchemeExportDestination: {
          endpoint: null,
          username: null,
          password: null,
          id: action.sourceTriplet.id,
          agencyID: action.sourceTriplet.agencyID,
          version: action.sourceTriplet.version
        },
        isAgenciesValid: !!state.allAgencies
      };
    case CONCEPT_SCHEME_DETAIL_EXPORT_HIDE:
      return {
        ...state,
        conceptSchemeExportSourceTriplet: null,
        conceptSchemeExportDestination: null,
        agencies: state.isVisible ? state.agencies : null,
        allAgencies: state.isVisible ? state.allAgencies : null
      };
    case CONCEPT_SCHEME_DETAIL_EXPORT_CHANGE:

      const conceptSchemeExportDestination = _.cloneDeep(state.conceptSchemeExportDestination);
      _.merge(conceptSchemeExportDestination, action.fields);

      return {
        ...state,
        conceptSchemeExportDestination
      };
    case CONCEPT_SCHEME_DETAIL_EXPORT_REPORT_HIDE:
      return {
        ...state,
        conceptSchemeExportReport: null
      };
    case CONCEPT_SCHEME_DETAIL_DERIVED_TAB_FOCUS:
      return {
        ...state,
        isDerivedTabFocused: true
      };
    case CONCEPT_SCHEME_DETAIL_DERIVED_TAB_UNFOCUS:
      return {
        ...state,
        isDerivedTabFocused: false
      };
    case REQUEST_SUCCESS:
      switch (action.label) {
        case CONCEPT_SCHEME_DETAIL_READ:

          const userPermissions = getCurrentUserPermissions(action);
          const customNoneIsAutoAnnotation = userPermissions && userPermissions.rules.includes("CanManageWorkingAnnotation")
            ? () => false
            : undefined;

          const conceptScheme = getItemSchemeFromSdmxJsonFactory(
            SDMX_JSON_CONCEPT_SCHEME_ITEMS_KEY,
            getCurrentNodeConfig(action).annotations,
            CONCEPT_SCHEME_ORDER_ANNOTATION_KEY,
            customNoneIsAutoAnnotation
          )(getSdmxStructuresFromSdmxJson(action.response)[0]);

          let itemsTree = getTreeFromArray((conceptScheme.concepts || []), "concepts");

          const root = [{
            isRoot: true,
            concepts: itemsTree
          }];

          itemsTree = getMappedTree(
            root,
            "concepts",
            node => {
              node.concepts = getOrderedChildren(node.concepts, node.id, action.lang, action.itemsOrderAnnotationType);
              return node
            }
          )[0].concepts;

          const count = normalizeItemsOrder(itemsTree, "concepts", action.lang, action.itemsOrderAnnotationType);

          return {
            ...state,
            conceptScheme,
            isConceptSchemeValid: true,
            itemsTree: itemsTree,
            maxOrder: count
          };
        case CONCEPT_SCHEME_DETAIL_AGENCIES_READ:
          return {
            ...state,
            agencies: _.pickBy(action.response, (_, agencyID) => !action.allowedAgencies || action.allowedAgencies.includes(agencyID)),
            allAgencies: action.response,
            isAgenciesValid: true
          };
        case CONCEPT_SCHEME_DETAIL_CREATE_SUBMIT:
          return {
            ...state,
            conceptScheme: null,
            isVisible: true,
            itemsTree: null,
            maxOrder: null,
            conceptSchemeTriplet: action.conceptSchemeTriplet,
            isConceptSchemeValid: false,
            isConceptSchemeGeneralTabDirty: false,
            focusItemsTab: true,
            forceIsFinalDisabled: state.conceptScheme.isFinal
          };
        case CONCEPT_SCHEME_DETAIL_UPDATE_SUBMIT:
          return {
            ...state,
            item: null,
            selectedItem: null,
            itemsTree: action.itemsTree,
            isNormalizeNeeded: false,
            cutItem: null,
            agencies: null,
            allAgencies: null,
            forceIsFinalDisabled: state.conceptScheme.isFinal
          };
        case CONCEPT_SCHEME_DETAIL_ITEMS_IMPORT_FORM_FILE_UPLOAD:
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
        case CONCEPT_SCHEME_DETAIL_ITEMS_IMPORT_FORM_FILE_IMPORT:
          return {
            ...state,
            itemsImportForm: null,
            isItemsImportFormVisible: false,
            isConceptSchemeValid: false
          };
        case CONCEPT_SCHEME_DETAIL_DOWNLOAD_SUBMIT:
          return {
            ...state,
            downloadConceptSchemeTriplets: null,
            downloadConceptSchemeLang: null,
            downloadConceptSchemeParams: null
          };
        case CONCEPT_SCHEME_DETAIL_CLONE_SUBMIT:
          return {
            ...state,
            cloneDestTriplet: null,
            conceptScheme: state.isVisible ? state.conceptScheme : null,
            conceptSchemeTriplet: state.isVisible ? state.conceptSchemeTriplet : null,
            itemsTree: state.isVisible ? state.itemsTree : null,
            maxOrder: state.isVisible ? state.maxOrder : null,
            agencies: state.isVisible ? state.agencies : null,
            allAgencies: state.isVisible ? state.allAgencies : null
          };
        case CONCEPT_SCHEME_DETAIL_EXPORT_SUBMIT:
          return {
            ...state,
            conceptSchemeExportSourceTriplet: null,
            conceptSchemeExportDestination: null,
            conceptSchemeExportReport: action.response.itemsMessage,
            agencies: state.isVisible ? state.agencies : null,
            allAgencies: state.isVisible ? state.allAgencies : null
          };
        case CONCEPT_SCHEME_DETAIL_ITEMS_IMPORT_FORM_CSV_UPLOAD:
          return {
            ...state,
            itemsImportForm: {
              ...state.itemsImportForm,
              filePath: action.response
            }
          };
        case CONCEPT_SCHEME_DETAIL_ITEMS_IMPORT_FORM_ALL_CSV_ROWS_READ:
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
        case CONCEPT_SCHEME_DETAIL_READ:
          return {
            ...state,
            isVisible: false,
            isConceptSchemeValid: true
          };
        default:
          return state;
      }
    default:
      return state;
  }
};

export default reuseInReducer(conceptSchemeDetailModalReducer, {
  derivedConceptScheme: reuseReducer(derivedItemSchemeReducer, REDUX_CONCEPT_SCHEMES_DETAIL_DERIVED_IS_PREFIX)
});