import {REQUEST_ERROR, REQUEST_START, REQUEST_SUCCESS} from "../../middlewares/api/actions";
import {
  CATEGORY_SCHEME_DETAIL_AGENCIES_READ,
  CATEGORY_SCHEME_DETAIL_CHANGE,
  CATEGORY_SCHEME_DETAIL_CLONE_CHANGE,
  CATEGORY_SCHEME_DETAIL_CLONE_HIDE,
  CATEGORY_SCHEME_DETAIL_CLONE_SHOW,
  CATEGORY_SCHEME_DETAIL_CLONE_SUBMIT,
  CATEGORY_SCHEME_DETAIL_CREATE,
  CATEGORY_SCHEME_DETAIL_CREATE_SUBMIT,
  CATEGORY_SCHEME_DETAIL_DERIVED_TAB_FOCUS,
  CATEGORY_SCHEME_DETAIL_DERIVED_TAB_UNFOCUS,
  CATEGORY_SCHEME_DETAIL_DOWNLOAD_CHANGE,
  CATEGORY_SCHEME_DETAIL_DOWNLOAD_HIDE,
  CATEGORY_SCHEME_DETAIL_DOWNLOAD_SHOW,
  CATEGORY_SCHEME_DETAIL_DOWNLOAD_SUBMIT,
  CATEGORY_SCHEME_DETAIL_EDIT,
  CATEGORY_SCHEME_DETAIL_EXPORT_CHANGE,
  CATEGORY_SCHEME_DETAIL_EXPORT_HIDE,
  CATEGORY_SCHEME_DETAIL_EXPORT_REPORT_HIDE,
  CATEGORY_SCHEME_DETAIL_EXPORT_SHOW,
  CATEGORY_SCHEME_DETAIL_EXPORT_SUBMIT,
  CATEGORY_SCHEME_DETAIL_HIDE,
  CATEGORY_SCHEME_DETAIL_ITEMS_IMPORT_FORM_ALL_CSV_ROWS_HIDE,
  CATEGORY_SCHEME_DETAIL_ITEMS_IMPORT_FORM_ALL_CSV_ROWS_READ,
  CATEGORY_SCHEME_DETAIL_ITEMS_IMPORT_FORM_ALL_CSV_ROWS_SHOW,
  CATEGORY_SCHEME_DETAIL_ITEMS_IMPORT_FORM_CHANGE,
  CATEGORY_SCHEME_DETAIL_ITEMS_IMPORT_FORM_CSV_UPLOAD,
  CATEGORY_SCHEME_DETAIL_ITEMS_IMPORT_FORM_FILE_IMPORT,
  CATEGORY_SCHEME_DETAIL_ITEMS_IMPORT_FORM_FILE_UPLOAD,
  CATEGORY_SCHEME_DETAIL_ITEMS_IMPORT_FORM_HIDE,
  CATEGORY_SCHEME_DETAIL_ITEMS_IMPORT_FORM_SHOW,
  CATEGORY_SCHEME_DETAIL_ITEMS_ITEM_ANNOTATIONS_HIDE,
  CATEGORY_SCHEME_DETAIL_ITEMS_ITEM_ANNOTATIONS_SHOW,
  CATEGORY_SCHEME_DETAIL_ITEMS_ITEM_CHANGE,
  CATEGORY_SCHEME_DETAIL_ITEMS_ITEM_CREATE,
  CATEGORY_SCHEME_DETAIL_ITEMS_ITEM_CUT,
  CATEGORY_SCHEME_DETAIL_ITEMS_ITEM_DUPLICATE_ITEM_ERROR_HIDE,
  CATEGORY_SCHEME_DETAIL_ITEMS_ITEM_DUPLICATE_ITEM_ERROR_SHOW,
  CATEGORY_SCHEME_DETAIL_ITEMS_ITEM_EDIT,
  CATEGORY_SCHEME_DETAIL_ITEMS_ITEM_HIDE,
  CATEGORY_SCHEME_DETAIL_ITEMS_ITEM_LAYOUT_ANNOTATIONS_HIDE,
  CATEGORY_SCHEME_DETAIL_ITEMS_ITEM_LAYOUT_ANNOTATIONS_SHOW,
  CATEGORY_SCHEME_DETAIL_ITEMS_ITEM_PARENT_LIST_HIDE,
  CATEGORY_SCHEME_DETAIL_ITEMS_ITEM_PARENT_LIST_SET,
  CATEGORY_SCHEME_DETAIL_ITEMS_ITEM_PARENT_LIST_SHOW,
  CATEGORY_SCHEME_DETAIL_ITEMS_ITEM_PARENT_LIST_UNSET,
  CATEGORY_SCHEME_DETAIL_ITEMS_ITEM_SELECT,
  CATEGORY_SCHEME_DETAIL_ITEMS_VIEW_MODE_CHANGE,
  CATEGORY_SCHEME_DETAIL_LANGUAGE_CHANGE,
  CATEGORY_SCHEME_DETAIL_READ,
  CATEGORY_SCHEME_DETAIL_SHOW,
  CATEGORY_SCHEME_DETAIL_UPDATE_SUBMIT,
} from "./actions";
import {
  CATEGORY_SCHEME_ORDER_ANNOTATION_KEY,
  getArtefactFromSdmxJsonStructure,
  getItemFromSdmxJsonStructure,
  getSdmxStructuresFromSdmxJson,
} from "../../utils/sdmxJson";
import _ from 'lodash';
import {getMappedTree, getNode} from "../../utils/tree";
import {getOrderedChildren} from "../../utils/artefacts";
import {normalizeItemsOrder} from "../../utils/normalizers";
import {NODES_CONFIG_NODE_GENERAL_ITEMS_VIEW_MODE_TABLE} from "../../scenes/configuration/nodes-config/node/GeneralForm";
import {reuseInReducer, reuseReducer} from "../../utils/reduxReuse";
import derivedItemSchemeReducer from "../redux-derived-item-scheme/reducer";
import {getCurrentNodeConfig} from "../../middlewares/current-node-config/middleware";
import {getCurrentUserPermissions} from "../../middlewares/current-user-permissions/middleware";

export const REDUX_CATEGORY_SCHEMES_DETAIL_DERIVED_IS_PREFIX = "REDUX_CATEGORY_SCHEMES_DETAIL_DERIVED_IS_PREFIX_";

const categorySchemeDetailModalReducer = (
  state = {
    categorySchemeTriplet: null,
    isVisible: false,
    isEditDisabled: false,
    isCategorySchemeValid: true,
    isAgenciesValid: true,
    isCategorySchemeGeneralTabDirty: false,
    categoryScheme: null,
    forceIsFinalDisabled: false,
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
    categorySchemeAnnotations: null,
    categorySchemeLayoutAnnotations: null,
    isItemsParentListVisible: false,
    itemsTree: null,
    maxOrder: null,
    isNormalizeNeeded: false,
    isDuplicateItemErrorVisible: false,
    focusItemsTab: false,
    cutItem: null,
    downloadCategorySchemeParams: null,
    downloadCategorySchemeTriplets: null,
    downloadCategorySchemeLang: null,
    cloneDestTriplet: null,
    categorySchemeExportSourceTriplet: null,
    categorySchemeExportDestination: null,
    categorySchemeExportReport: null,
    isDerivedTabFocused: false
  },
  action
) => {
  switch (action.type) {
    case CATEGORY_SCHEME_DETAIL_CREATE:
      return {
        ...state,
        categoryScheme: {
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
          categories: null
        },
        isVisible: true,
        itemsViewMode: action.defaultItemsViewMode || NODES_CONFIG_NODE_GENERAL_ITEMS_VIEW_MODE_TABLE,
        isAgenciesValid: false,
        isDerivedTabFocused: false
      };
    case CATEGORY_SCHEME_DETAIL_EDIT:
      return {
        ...state,
        isVisible: true,
        categorySchemeTriplet: action.categorySchemeTriplet,
        isCategorySchemeValid: false,
        isAgenciesValid: false,
        isCategorySchemeGeneralTabDirty: false,
        focusItemsTab: false,
        itemsViewMode: action.defaultItemsViewMode || NODES_CONFIG_NODE_GENERAL_ITEMS_VIEW_MODE_TABLE,
        isEditDisabled: false,
        isDerivedTabFocused: false
      };
    case CATEGORY_SCHEME_DETAIL_SHOW:
      return {
        ...state,
        forceIsFinalDisabled: false,
        isVisible: true,
        categorySchemeTriplet: action.categorySchemeTriplet,
        isCategorySchemeValid: false,
        isAgenciesValid: false,
        isCategorySchemeGeneralTabDirty: false,
        focusItemsTab: false,
        itemsViewMode: action.defaultItemsViewMode || NODES_CONFIG_NODE_GENERAL_ITEMS_VIEW_MODE_TABLE,
        isEditDisabled: true,
        isDerivedTabFocused: false
      };
    case CATEGORY_SCHEME_DETAIL_HIDE:
      return {
        ...state,
        forceIsFinalDisabled: false,
        isVisible: false,
        categorySchemeTriplet: null,
        categoryScheme: null,
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
    case CATEGORY_SCHEME_DETAIL_CHANGE: {
      const categoryScheme = _.cloneDeep(state.categoryScheme);
      const customizer = (_, src, key) => {
        if (key === "annotations")
          return src;
        else {
          return undefined
        }
      };

      return {
        ...state,
        categoryScheme: _.mergeWith(categoryScheme, action.fields, customizer),
        isCategorySchemeGeneralTabDirty: true
      };
    }
    case CATEGORY_SCHEME_DETAIL_ITEMS_VIEW_MODE_CHANGE:
      return {
        ...state,
        itemsViewMode: action.viewMode,
        selectedItem: null
      };
    case CATEGORY_SCHEME_DETAIL_ITEMS_ITEM_CREATE: {
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
          categories: []
        },
        isItemEditMode: false,
        maxOrder: maxOrder,
        isNormalizeNeeded: isNormalizeNeeded
      }
    }
    case CATEGORY_SCHEME_DETAIL_ITEMS_ITEM_EDIT:
      let node = null;
      if (action.item) {
        node = getNode(state.itemsTree, "categories", node => node.id === action.item.id)
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
          categories: node ? node.categories : []
        },
        isItemEditMode: true
      };
    case CATEGORY_SCHEME_DETAIL_ITEMS_ITEM_CHANGE: {
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
    case CATEGORY_SCHEME_DETAIL_ITEMS_ITEM_HIDE:
      return {
        ...state,
        item: null,
        isItemEditMode: false,
        isDuplicateItemErrorVisible: false,
        maxOrder: state.maxOrder - 1
      };
    case CATEGORY_SCHEME_DETAIL_ITEMS_ITEM_SELECT: {
      const selectedItem = getNode(state.itemsTree, "categories", node => node.id === action.id);

      return {
        ...state,
        selectedItem: action.id
          ? selectedItem
          : null
      };
    }
    case CATEGORY_SCHEME_DETAIL_ITEMS_IMPORT_FORM_SHOW:
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
    case CATEGORY_SCHEME_DETAIL_ITEMS_IMPORT_FORM_HIDE:
      return {
        ...state,
        isItemsImportFormVisible: false,
        itemsImportForm: null
      };
    case CATEGORY_SCHEME_DETAIL_ITEMS_IMPORT_FORM_ALL_CSV_ROWS_SHOW:
      return {
        ...state,
        itemsImportForm: {
          ...state.itemsImportForm,
          isAllCsvRowsVisible: true
        }
      };
    case CATEGORY_SCHEME_DETAIL_ITEMS_IMPORT_FORM_ALL_CSV_ROWS_HIDE:
      return {
        ...state,
        itemsImportForm: {
          ...state.itemsImportForm,
          isAllCsvRowsVisible: false
        }
      };
    case CATEGORY_SCHEME_DETAIL_ITEMS_IMPORT_FORM_CHANGE:
      return {
        ...state,
        itemsImportForm: {
          ..._.merge(state.itemsImportForm, action.fields),
          hash: action.fields.language ? state.itemsImportForm.hash : null,
          csvRows: action.fields.language ? state.itemsImportForm.csvRows : null,
          filePath: action.fields.language ? state.itemsImportForm.filePath : null,
          allCsvRows: action.fields.language ? state.itemsImportForm.allCsvRows : null,
        }
      };
    case CATEGORY_SCHEME_DETAIL_ITEMS_ITEM_ANNOTATIONS_SHOW:
      return {
        ...state,
        itemAnnotations: action.annotations,
        itemAnnotationId: action.itemId
      };
    case CATEGORY_SCHEME_DETAIL_ITEMS_ITEM_ANNOTATIONS_HIDE:
      return {
        ...state,
        itemAnnotations: null,
        itemAnnotationId: null
      };
    case CATEGORY_SCHEME_DETAIL_ITEMS_ITEM_LAYOUT_ANNOTATIONS_SHOW:
      return {
        ...state,
        itemLayoutAnnotations: action.annotations,
        itemAnnotationId: action.itemId
      };
    case CATEGORY_SCHEME_DETAIL_ITEMS_ITEM_LAYOUT_ANNOTATIONS_HIDE:
      return {
        ...state,
        itemLayoutAnnotations: null,
        itemAnnotationId: null
      };
    case CATEGORY_SCHEME_DETAIL_ITEMS_ITEM_PARENT_LIST_SHOW:
      return {
        ...state,
        isItemsParentListVisible: true
      };
    case CATEGORY_SCHEME_DETAIL_ITEMS_ITEM_PARENT_LIST_HIDE:
      return {
        ...state,
        isItemsParentListVisible: false
      };
    case CATEGORY_SCHEME_DETAIL_ITEMS_ITEM_PARENT_LIST_SET:
      return {
        ...state,
        item: {
          ...state.item,
          parent: action.item.id
        },
        isItemsParentListVisible: false
      };
    case CATEGORY_SCHEME_DETAIL_ITEMS_ITEM_PARENT_LIST_UNSET:
      return {
        ...state,
        item: {
          ...state.item,
          parent: null
        }
      };
    case CATEGORY_SCHEME_DETAIL_LANGUAGE_CHANGE: {
      const root = [{
        isRoot: true,
        categories: state.itemsTree
      }];

      const itemsTree = getMappedTree(
        root,
        "categories",
        node => {
          node.categories = getOrderedChildren(node.categories, node.id, action.lang, action.itemsOrderAnnotationType);
          return node
        }
      )[0].categories;

      const count = normalizeItemsOrder(itemsTree, "categories", action.lang, action.itemsOrderAnnotationType);

      return {
        ...state,
        itemsTree: itemsTree,
        maxOrder: count
      };
    }
    case CATEGORY_SCHEME_DETAIL_ITEMS_ITEM_DUPLICATE_ITEM_ERROR_SHOW:
      return {
        ...state,
        isDuplicateItemErrorVisible: true
      };
    case CATEGORY_SCHEME_DETAIL_ITEMS_ITEM_DUPLICATE_ITEM_ERROR_HIDE:
      return {
        ...state,
        isDuplicateItemErrorVisible: false
      };
    case CATEGORY_SCHEME_DETAIL_ITEMS_ITEM_CUT:
      const parentNode = getNode(state.itemsTree, "categories", node => node.id === action.item.parent);
      parentNode
        ? parentNode.categories = parentNode.categories.filter(child => child.id !== action.item.id)
        : state.itemsTree = state.itemsTree.filter(child => child.id !== action.item.id);

      return {
        ...state,
        cutItem: action.item,
        itemsTree: state.itemsTree.splice(0)
      };
    case CATEGORY_SCHEME_DETAIL_DOWNLOAD_SHOW:
      return {
        ...state,
        downloadCategorySchemeTriplets: action.artefactTriplets,
        downloadCategorySchemeLang: action.lang,
        downloadCategorySchemeParams: {
          format: null,
          references: false,
          compression: false,
          csvSeparator: ";",
          csvDelimiter: null,
          csvLanguage: null
        }
      };
    case CATEGORY_SCHEME_DETAIL_DOWNLOAD_HIDE:
      return {
        ...state,
        downloadCategorySchemeTriplets: null,
        downloadCategorySchemeLang: null,
        downloadCategorySchemeParams: null
      };
    case CATEGORY_SCHEME_DETAIL_DOWNLOAD_CHANGE:
      const downloadCategorySchemeParams = _.cloneDeep(state.downloadCategorySchemeParams);
      return {
        ...state,
        downloadCategorySchemeParams: _.merge(downloadCategorySchemeParams, action.fields)
      };
    case CATEGORY_SCHEME_DETAIL_CLONE_SHOW:
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
        categorySchemeTriplet: state.categorySchemeTriplet ? state.categorySchemeTriplet : action.srcTriplet,
        isCategorySchemeValid: !!state.categoryScheme,
        isAgenciesValid: !!state.allAgencies
      };
    case CATEGORY_SCHEME_DETAIL_CLONE_HIDE:
      return {
        ...state,
        cloneDestTriplet: null,
        categoryScheme: state.isVisible ? state.categoryScheme : null,
        categorySchemeTriplet: state.isVisible ? state.categorySchemeTriplet : null,
        itemsTree: state.isVisible ? state.itemsTree : null,
        maxOrder: state.isVisible ? state.maxOrder : null,
        agencies: state.isVisible ? state.agencies : null,
        allAgencies: state.isVisible ? state.allAgencies : null
      };
    case CATEGORY_SCHEME_DETAIL_CLONE_CHANGE:

      const cloneDestTriplet = _.cloneDeep(state.cloneDestTriplet);

      return {
        ...state,
        cloneDestTriplet: _.merge(cloneDestTriplet, action.fields)
      };
    case CATEGORY_SCHEME_DETAIL_EXPORT_SHOW:
      return {
        ...state,
        categorySchemeExportSourceTriplet: action.sourceTriplet,
        categorySchemeExportDestination: {
          endpoint: null,
          username: null,
          password: null,
          id: action.sourceTriplet.id,
          agencyID: action.sourceTriplet.agencyID,
          version: action.sourceTriplet.version
        },
        isAgenciesValid: !!state.allAgencies
      };
    case CATEGORY_SCHEME_DETAIL_EXPORT_HIDE:
      return {
        ...state,
        categorySchemeExportSourceTriplet: null,
        categorySchemeExportDestination: null,
        agencies: state.isVisible ? state.agencies : null,
        allAgencies: state.isVisible ? state.allAgencies : null
      };
    case CATEGORY_SCHEME_DETAIL_EXPORT_CHANGE:

      const categorySchemeExportDestination = _.cloneDeep(state.categorySchemeExportDestination);
      _.merge(categorySchemeExportDestination, action.fields);

      return {
        ...state,
        categorySchemeExportDestination
      };
    case CATEGORY_SCHEME_DETAIL_EXPORT_REPORT_HIDE:
      return {
        ...state,
        categorySchemeExportReport: null
      };
    case CATEGORY_SCHEME_DETAIL_DERIVED_TAB_FOCUS:
      return {
        ...state,
        isDerivedTabFocused: true
      };
    case CATEGORY_SCHEME_DETAIL_DERIVED_TAB_UNFOCUS:
      return {
        ...state,
        isDerivedTabFocused: false
      };
    case REQUEST_START:
      switch (action.label) {
        case CATEGORY_SCHEME_DETAIL_UPDATE_SUBMIT:
          return {
            ...state,
            isCategorySchemeGeneralTabDirty: false
          };
        default:
          return state;
      }
    case REQUEST_SUCCESS:
      switch (action.label) {
        case CATEGORY_SCHEME_DETAIL_READ: {

          const userPermissions = getCurrentUserPermissions(action);
          const customNoneIsAutoAnnotation = userPermissions && userPermissions.rules.includes("CanManageWorkingAnnotation")
            ? () => false
            : undefined;

          const categoryScheme = getArtefactFromSdmxJsonStructure(
            getSdmxStructuresFromSdmxJson(action.response)[0],
            getCurrentNodeConfig(action).annotations,
            customNoneIsAutoAnnotation
          );

          let itemsTree = categoryScheme.categories
            ? getMappedTree(
              categoryScheme.categories,
              "categories",
              node => getItemFromSdmxJsonStructure(node, getCurrentNodeConfig(action).annotations, CATEGORY_SCHEME_ORDER_ANNOTATION_KEY, customNoneIsAutoAnnotation)
            )
            : [];

          const root = [{
            isRoot: true,
            categories: itemsTree
          }];

          itemsTree = getMappedTree(
            root,
            "categories",
            node => {
              node.categories = getOrderedChildren(node.categories, node.id, action.lang, action.itemsOrderAnnotationType);
              return node
            }
          )[0].categories;

          const count = normalizeItemsOrder(itemsTree, "categories", action.lang, action.itemsOrderAnnotationType);

          return {
            ...state,
            categoryScheme: categoryScheme,
            isCategorySchemeValid: true,
            itemsTree: itemsTree,
            maxOrder: count
          };
        }
        case CATEGORY_SCHEME_DETAIL_AGENCIES_READ:
          return {
            ...state,
            agencies: _.pickBy(action.response, (_, agencyID) => !action.allowedAgencies || action.allowedAgencies.includes(agencyID)),
            allAgencies: action.response,
            isAgenciesValid: true
          };
        case CATEGORY_SCHEME_DETAIL_CREATE_SUBMIT:
          return {
            ...state,
            categoryScheme: null,
            isVisible: true,
            itemsTree: null,
            maxOrder: null,
            categorySchemeTriplet: action.categorySchemeTriplet,
            isCategorySchemeValid: false,
            isCategorySchemeGeneralTabDirty: false,
            focusItemsTab: true,
            forceIsFinalDisabled: state.categoryScheme.isFinal
          };
        case CATEGORY_SCHEME_DETAIL_UPDATE_SUBMIT:
          return {
            ...state,
            item: null,
            selectedItem: null,
            itemsTree: action.itemsTree,
            isNormalizeNeeded: false,
            cutItem: null,
            agencies: null,
            allAgencies: null,
            forceIsFinalDisabled: state.categoryScheme.isFinal
          };
        case CATEGORY_SCHEME_DETAIL_ITEMS_IMPORT_FORM_FILE_UPLOAD:
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
        case CATEGORY_SCHEME_DETAIL_ITEMS_IMPORT_FORM_FILE_IMPORT:
          return {
            ...state,
            itemsImportForm: null,
            isItemsImportFormVisible: false,
            isCategorySchemeValid: false
          };
        case CATEGORY_SCHEME_DETAIL_DOWNLOAD_SUBMIT:
          return {
            ...state,
            downloadCategorySchemeTriplets: null,
            downloadCategorySchemeLang: null,
            downloadCategorySchemeParams: null
          };
        case CATEGORY_SCHEME_DETAIL_CLONE_SUBMIT:
          return {
            ...state,
            cloneDestTriplet: null,
            categoryScheme: state.isVisible ? state.categoryScheme : null,
            categorySchemeTriplet: state.isVisible ? state.categorySchemeTriplet : null,
            itemsTree: state.isVisible ? state.itemsTree : null,
            maxOrder: state.isVisible ? state.maxOrder : null,
            agencies: state.isVisible ? state.agencies : null,
            allAgencies: state.isVisible ? state.allAgencies : null
          };
        case CATEGORY_SCHEME_DETAIL_EXPORT_SUBMIT:
          return {
            ...state,
            categorySchemeExportSourceTriplet: null,
            categorySchemeExportDestination: null,
            categorySchemeExportReport: action.response.itemsMessage,
            agencies: state.isVisible ? state.agencies : null,
            allAgencies: state.isVisible ? state.allAgencies : null
          };
        case CATEGORY_SCHEME_DETAIL_ITEMS_IMPORT_FORM_CSV_UPLOAD:
          return {
            ...state,
            itemsImportForm: {
              ...state.itemsImportForm,
              filePath: action.response
            }
          };
        case CATEGORY_SCHEME_DETAIL_ITEMS_IMPORT_FORM_ALL_CSV_ROWS_READ:
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
        case CATEGORY_SCHEME_DETAIL_READ:
          return {
            ...state,
            isVisible: false,
            isCategorySchemeValid: true
          };
        default:
          return state;
      }
    default:
      return state;
  }
};

export default reuseInReducer(categorySchemeDetailModalReducer, {
  derivedCategoryScheme: reuseReducer(derivedItemSchemeReducer, REDUX_CATEGORY_SCHEMES_DETAIL_DERIVED_IS_PREFIX)
});