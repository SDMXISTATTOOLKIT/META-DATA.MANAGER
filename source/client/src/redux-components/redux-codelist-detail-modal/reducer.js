import {REQUEST_ERROR, REQUEST_START, REQUEST_SUCCESS} from "../../middlewares/api/actions";
import {
  CODELIST_DETAIL_AGENCIES_READ,
  CODELIST_DETAIL_CHANGE,
  CODELIST_DETAIL_CLONE_CHANGE,
  CODELIST_DETAIL_CLONE_HIDE,
  CODELIST_DETAIL_CLONE_SHOW,
  CODELIST_DETAIL_CLONE_SUBMIT,
  CODELIST_DETAIL_CREATE,
  CODELIST_DETAIL_CREATE_SUBMIT,
  CODELIST_DETAIL_DERIVED_CODELIST_ALL_ITEMS_SELECT,
  CODELIST_DETAIL_DERIVED_CODELIST_CHECKBOX_CHANGE,
  CODELIST_DETAIL_DERIVED_CODELIST_CREATE_CHANGE,
  CODELIST_DETAIL_DERIVED_CODELIST_CREATE_HIDE,
  CODELIST_DETAIL_DERIVED_CODELIST_CREATE_SHOW,
  CODELIST_DETAIL_DERIVED_CODELIST_CREATE_SUBMIT,
  CODELIST_DETAIL_DERIVED_CODELIST_DB_RESTORE,
  CODELIST_DETAIL_DERIVED_CODELIST_SELECTED_ITEMS_STORE,
  CODELIST_DETAIL_DERIVED_CODELIST_SOURCE_ITEM_PAGE_PARAMS_UPDATE,
  CODELIST_DETAIL_DERIVED_CODELIST_SOURCE_ITEM_PAGE_READ,
  CODELIST_DETAIL_DERIVED_CODELIST_SOURCE_ITEM_SELECT,
  CODELIST_DETAIL_DERIVED_CODELIST_TARGET_ITEM_PAGE_PARAMS_UPDATE,
  CODELIST_DETAIL_DERIVED_CODELIST_TARGET_ITEM_PAGE_READ,
  CODELIST_DETAIL_DERIVED_CODELIST_TARGET_ITEM_SELECT,
  CODELIST_DETAIL_DERIVED_TAB_FOCUS,
  CODELIST_DETAIL_DERIVED_TAB_UNFOCUS,
  CODELIST_DETAIL_DOWNLOAD_CHANGE,
  CODELIST_DETAIL_DOWNLOAD_HIDE,
  CODELIST_DETAIL_DOWNLOAD_SHOW,
  CODELIST_DETAIL_DOWNLOAD_SUBMIT,
  CODELIST_DETAIL_EDIT,
  CODELIST_DETAIL_EXPORT_CHANGE,
  CODELIST_DETAIL_EXPORT_HIDE,
  CODELIST_DETAIL_EXPORT_REPORT_HIDE,
  CODELIST_DETAIL_EXPORT_SHOW,
  CODELIST_DETAIL_EXPORT_SUBMIT,
  CODELIST_DETAIL_HIDE,
  CODELIST_DETAIL_ITEM_PAGE_PARAMS_UPDATE,
  CODELIST_DETAIL_ITEM_PAGE_READ,
  CODELIST_DETAIL_ITEM_TREE_READ,
  CODELIST_DETAIL_ITEMS_AUTOSAVE_CHANGE,
  CODELIST_DETAIL_ITEMS_DEFAULT_ORDER_SET,
  CODELIST_DETAIL_ITEMS_FILE_SYSTEM_TREE_HIDE,
  CODELIST_DETAIL_ITEMS_FILE_SYSTEM_TREE_ITEM_SELECT,
  CODELIST_DETAIL_ITEMS_FILE_SYSTEM_TREE_SHOW,
  CODELIST_DETAIL_ITEMS_IMPORT_FORM_ALL_CSV_ROWS_HIDE,
  CODELIST_DETAIL_ITEMS_IMPORT_FORM_ALL_CSV_ROWS_READ,
  CODELIST_DETAIL_ITEMS_IMPORT_FORM_ALL_CSV_ROWS_SHOW,
  CODELIST_DETAIL_ITEMS_IMPORT_FORM_CHANGE,
  CODELIST_DETAIL_ITEMS_IMPORT_FORM_CSV_UPLOAD,
  CODELIST_DETAIL_ITEMS_IMPORT_FORM_FILE_IMPORT,
  CODELIST_DETAIL_ITEMS_IMPORT_FORM_FILE_UPLOAD,
  CODELIST_DETAIL_ITEMS_IMPORT_FORM_HIDE,
  CODELIST_DETAIL_ITEMS_IMPORT_FORM_SHOW,
  CODELIST_DETAIL_ITEMS_ITEM_ANNOTATIONS_HIDE,
  CODELIST_DETAIL_ITEMS_ITEM_ANNOTATIONS_SHOW,
  CODELIST_DETAIL_ITEMS_ITEM_CHANGE,
  CODELIST_DETAIL_ITEMS_ITEM_CREATE,
  CODELIST_DETAIL_ITEMS_ITEM_CUT,
  CODELIST_DETAIL_ITEMS_ITEM_DELETE,
  CODELIST_DETAIL_ITEMS_ITEM_DROP,
  CODELIST_DETAIL_ITEMS_ITEM_HIDE,
  CODELIST_DETAIL_ITEMS_ITEM_LAYOUT_ANNOTATIONS_HIDE,
  CODELIST_DETAIL_ITEMS_ITEM_LAYOUT_ANNOTATIONS_SHOW,
  CODELIST_DETAIL_ITEMS_ITEM_PARENT_LIST_HIDE,
  CODELIST_DETAIL_ITEMS_ITEM_PARENT_LIST_PAGE_READ,
  CODELIST_DETAIL_ITEMS_ITEM_PARENT_LIST_SET,
  CODELIST_DETAIL_ITEMS_ITEM_PARENT_LIST_SHOW,
  CODELIST_DETAIL_ITEMS_ITEM_PARENT_LIST_UNSET,
  CODELIST_DETAIL_ITEMS_ITEM_PASTE,
  CODELIST_DETAIL_ITEMS_ITEM_SELECT,
  CODELIST_DETAIL_ITEMS_ITEM_SHOW,
  CODELIST_DETAIL_ITEMS_ITEM_SUBMIT,
  CODELIST_DETAIL_ITEMS_VIEW_MODE_CHANGE,
  CODELIST_DETAIL_LANGUAGE_CHANGE,
  CODELIST_DETAIL_READ,
  CODELIST_DETAIL_SHOW,
  CODELIST_DETAIL_TAB_CHANGE,
  CODELIST_DETAIL_UPDATE_SUBMIT
} from "./actions";
import {
  CODELIST_ORDER_ANNOTATION_KEY,
  getItemSchemeFromSdmxJsonFactory,
  getSdmxStructuresFromSdmxJson,
  SDMX_JSON_CODELIST_ITEMS_KEY
} from "../../utils/sdmxJson";
import _ from 'lodash';
import {getNode, getTreeFromArray} from "../../utils/tree";
import {NODES_CONFIG_NODE_GENERAL_ITEMS_VIEW_MODE_TABLE} from "../../scenes/configuration/nodes-config/node/GeneralForm"
import {getCurrentNodeConfig} from "../../middlewares/current-node-config/middleware";
import {getCurrentUserPermissions} from "../../middlewares/current-user-permissions/middleware";

const codelistDetailModalReducer = (
  state = {
    codelistTriplet: null,
    isVisible: false,
    isEditDisabled: false,
    isCodelistValid: true,
    isAgenciesValid: true,
    isCodelistGeneralTabDirty: false,
    forceIsFinalDisabled: false,
    codelist: null,
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
    isItemsParentListVisible: false,
    itemsTree: null,
    maxOrder: null,
    focusItemsTab: false,
    cutItem: null,
    cloneDestTriplet: null,
    downloadCodelistTriplets: null,
    downloadCodelistLang: null,
    downloadCodelistParams: null,
    itemPage: null,
    fetchPageParams: null,
    itemCount: null,
    parentPage: null,
    autoSave: true,
    isFileSystemTreeVisible: false,
    fileSystemSelectedItem: null,
    unsavedChange: false,
    rebuildDb: false,
    codelistExportSourceTriplet: null,
    codelistExportDestination: null,
    codelistExportReport: null,
    currentTab: null,
    importCheckbox: {
      preserveHierarchy: true,
      importParents: true,
      importChildren: false,
      importDescendants: false
    },
    derivedCodelist: null,
    dCSourceFetchPageParams: null,
    dCSourceItemPage: null,
    dCSourceItemCount: null,
    dCSourceSelectedItemCount: null,
    dCTargetFetchPageParams: null,
    dCTargetItemPage: null,
    dCTargetItemCount: null,
    dCTargetSelectedItemCount: null,
    isCreateVisible: false,
    isRestoreDbDisabled: true,
    restoreDbWithRefresh: false,
    isDerivedTabFocused: false
  },
  action
) => {
  switch (action.type) {
    case CODELIST_DETAIL_CREATE:
      return {
        ...state,
        codelist: {
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
          codes: null
        },
        isVisible: true,
        itemsViewMode: action.defaultItemsViewMode || NODES_CONFIG_NODE_GENERAL_ITEMS_VIEW_MODE_TABLE,
        currentTab: "general",
        isAgenciesValid: false,
        isDerivedTabFocused: false
      };
    case CODELIST_DETAIL_EDIT:
      return {
        ...state,
        isVisible: true,
        codelistTriplet: action.codelistTriplet,
        isCodelistValid: false,
        isAgenciesValid: false,
        isCodelistGeneralTabDirty: false,
        focusItemsTab: false,
        itemsViewMode: action.defaultItemsViewMode || NODES_CONFIG_NODE_GENERAL_ITEMS_VIEW_MODE_TABLE,
        isEditDisabled: false,
        currentTab: "general",
        isDerivedTabFocused: false
      };
    case CODELIST_DETAIL_SHOW:
      return {
        ...state,
        forceIsFinalDisabled: false,
        isVisible: true,
        codelistTriplet: action.codelistTriplet,
        isCodelistValid: false,
        isAgenciesValid: false,
        isCodelistGeneralTabDirty: false,
        focusItemsTab: false,
        itemsViewMode: action.defaultItemsViewMode || NODES_CONFIG_NODE_GENERAL_ITEMS_VIEW_MODE_TABLE,
        isEditDisabled: true,
        currentTab: "general",
        isDerivedTabFocused: false
      };
    case CODELIST_DETAIL_HIDE:
      return {
        ...state,
        isVisible: false,
        codelistTriplet: null,
        forceIsFinalDisabled: false,
        codelist: null,
        item: null,
        selectedItem: null,
        itemsViewMode: null,
        itemsTree: null,
        maxOrder: null,
        focusItemsTab: false,
        cutItem: null,
        itemPage: null,
        fetchPageParams: null,
        autoSave: true,
        unsavedChange: false,
        agencies: null,
        allAgencies: null,
        currentTab: null,
        importCheckbox: {
          preserveHierarchy: true,
          importParents: true,
          importChildren: false,
          importDescendants: false
        },
        derivedCodelist: null,
        dCSourceFetchPageParams: null,
        dCSourceItemPage: null,
        dCSourceItemCount: null,
        dCSourceSelectedItemCount: null,
        dCTargetFetchPageParams: null,
        dCTargetItemPage: null,
        dCTargetItemCount: null,
        dCTargetSelectedItemCount: null,
        isDerivedTabFocused: false
      };
    case CODELIST_DETAIL_CHANGE: {
      const codelist = _.cloneDeep(state.codelist);
      const customizer = (_, src, key) => {
        if (key === "annotations")
          return src;
        else {
          return undefined
        }
      };

      return {
        ...state,
        codelist: _.mergeWith(codelist, action.fields, customizer),
        isCodelistGeneralTabDirty: true
      };
    }
    case CODELIST_DETAIL_ITEMS_VIEW_MODE_CHANGE:
      return {
        ...state,
        itemsViewMode: action.viewMode,
        selectedItem: null,
        itemPage: null,
        fetchPageParams: null,
        cutItem: null
      };
    case CODELIST_DETAIL_ITEMS_ITEM_CREATE: {
      return {
        ...state,
        item: {
          id: null,
          parent: action.parentId,
          order: action.order ? _.mapValues(action.order, val => String(Number(val) + 1)) : null,
          name: null,
          annotations: null,
          autoAnnotations: null,
          description: null,
          codes: []
        },
        isItemEditMode: false
      }
    }
    case CODELIST_DETAIL_ITEMS_ITEM_SHOW: {
      const item = state.itemPage
        ? state.itemPage.find(item => item.id === action.item.id)
        : getNode(state.itemsTree, "codes", node => node.id === action.item.id);

      return {
        ...state,
        item: item,
        isItemEditMode: true
      };
    }
    case CODELIST_DETAIL_ITEMS_ITEM_CHANGE: {
      let item = _.cloneDeep(state.item);
      const customizer = (_, src, key) => {
        if (key === "annotations")
          return src;
        else {
          return undefined
        }
      };

      return {
        ...state,
        item: _.mergeWith(item, action.fields, customizer)
      };
    }
    case CODELIST_DETAIL_ITEMS_ITEM_HIDE:
      return {
        ...state,
        item: null,
        isItemEditMode: false
      };
    case CODELIST_DETAIL_ITEMS_ITEM_SELECT: {
      const selectedItem = getNode(state.itemsTree, "codes", node => node.id === action.id);

      return {
        ...state,
        selectedItem: action.id
          ? selectedItem
          : null
      };
    }
    case CODELIST_DETAIL_ITEMS_IMPORT_FORM_SHOW:
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
    case CODELIST_DETAIL_ITEMS_IMPORT_FORM_HIDE:
      return {
        ...state,
        isItemsImportFormVisible: false,
        itemsImportForm: null
      };
    case CODELIST_DETAIL_ITEMS_IMPORT_FORM_ALL_CSV_ROWS_SHOW:
      return {
        ...state,
        itemsImportForm: {
          ...state.itemsImportForm,
          isAllCsvRowsVisible: true
        }
      };
    case CODELIST_DETAIL_ITEMS_IMPORT_FORM_ALL_CSV_ROWS_HIDE:
      return {
        ...state,
        itemsImportForm: {
          ...state.itemsImportForm,
          isAllCsvRowsVisible: false
        }
      };
    case CODELIST_DETAIL_ITEMS_IMPORT_FORM_CHANGE:
      return {
        ...state,
        itemsImportForm: {
          ..._.merge(state.itemsImportForm, action.fields),
          csvRows: action.fields.language ? state.itemsImportForm.csvRows : null,
          hash: action.fields.language ? state.itemsImportForm.hash : null,
          filePath: action.fields.language ? state.itemsImportForm.filePath : null,
          allCsvRows: action.fields.language ? state.itemsImportForm.allCsvRows : null,
        }
      };
    case CODELIST_DETAIL_ITEMS_ITEM_ANNOTATIONS_SHOW:
      return {
        ...state,
        itemAnnotations: action.annotations,
        itemAnnotationId: action.itemId
      };
    case CODELIST_DETAIL_ITEMS_ITEM_ANNOTATIONS_HIDE:
      return {
        ...state,
        itemAnnotations: null,
        itemAnnotationId: null
      };
    case CODELIST_DETAIL_ITEMS_ITEM_LAYOUT_ANNOTATIONS_SHOW:
      return {
        ...state,
        itemLayoutAnnotations: action.annotations,
        itemAnnotationId: action.itemId
      };
    case CODELIST_DETAIL_ITEMS_ITEM_LAYOUT_ANNOTATIONS_HIDE:
      return {
        ...state,
        itemLayoutAnnotations: null,
        itemAnnotationId: null
      };
    case CODELIST_DETAIL_ITEMS_ITEM_PARENT_LIST_SHOW:
      return {
        ...state,
        isItemsParentListVisible: true
      };
    case CODELIST_DETAIL_ITEMS_ITEM_PARENT_LIST_HIDE:
      return {
        ...state,
        isItemsParentListVisible: false,
        parentPage: null
      };
    case CODELIST_DETAIL_ITEMS_ITEM_PARENT_LIST_SET:
      return {
        ...state,
        item: {
          ...state.item,
          parent: action.item.id
        },
        isItemsParentListVisible: false,
        parentPage: null
      };
    case CODELIST_DETAIL_ITEMS_ITEM_PARENT_LIST_UNSET:
      return {
        ...state,
        item: {
          ...state.item,
          parent: null
        },
        parentPage: null
      };
    case CODELIST_DETAIL_LANGUAGE_CHANGE: {
      return {
        ...state,
        fetchPageParams: {
          ...state.fetchPageParams,
          pageNum: 1,
          lang: action.lang
        },
        dCSourceFetchPageParams: {
          ...state.dCSourceFetchPageParams,
          pageNum: 1,
          lang: action.lang
        },
        dCTargetFetchPageParams: {
          ...state.dCTargetFetchPageParams,
          pageNum: 1,
          lang: action.lang
        },
        itemPage: null,
        itemsTree: null,
        unsavedChange: false
      };
    }
    case CODELIST_DETAIL_ITEMS_ITEM_CUT:
      const parentNode = getNode(state.itemsTree, "codes", node => node.id === action.item.parent);
      parentNode
        ? parentNode.codes = parentNode.codes.filter(child => child.id !== action.item.id)
        : state.itemsTree = state.itemsTree.filter(child => child.id !== action.item.id);

      return {
        ...state,
        cutItem: action.item,
        itemsTree: state.itemsTree.splice(0)
      };
    case CODELIST_DETAIL_DOWNLOAD_SHOW:
      return {
        ...state,
        downloadCodelistTriplets: action.artefactTriplets,
        downloadCodelistLang: action.lang,
        downloadCodelistParams: {
          format: null,
          references: false,
          compression: false,
          csvSeparator: ";",
          csvDelimiter: null,
          csvLanguage: null
        },
      };
    case CODELIST_DETAIL_DOWNLOAD_HIDE:
      return {
        ...state,
        downloadCodelistTriplets: null,
        downloadCodelistLang: null,
        downloadCodelistParams: null
      };
    case CODELIST_DETAIL_DOWNLOAD_CHANGE:
      const downloadCodelistParams = _.cloneDeep(state.downloadCodelistParams);
      return {
        ...state,
        downloadCodelistParams: _.merge(downloadCodelistParams, action.fields)
      };
    case CODELIST_DETAIL_CLONE_SHOW:
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
        codelistTriplet: state.codelistTriplet ? state.codelistTriplet : action.srcTriplet,
        isCodelistValid: !!state.codelist,
        isAgenciesValid: !!state.allAgencies
      };
    case CODELIST_DETAIL_CLONE_HIDE:
      return {
        ...state,
        cloneDestTriplet: null,
        codelist: state.isVisible ? state.codelist : null,
        codelistTriplet: state.isVisible ? state.codelistTriplet : null,
        itemCount: state.isVisible ? state.itemCount : null,
        agencies: state.isVisible ? state.agencies : null,
        allAgencies: state.isVisible ? state.allAgencies : null
      };
    case CODELIST_DETAIL_ITEM_PAGE_PARAMS_UPDATE:
      return {
        ...state,
        fetchPageParams: {
          ...action.params,
          timeStamp: (new Date()).getTime()
        }
      };
    case CODELIST_DETAIL_CLONE_CHANGE:
      const cloneDestTriplet = _.cloneDeep(state.cloneDestTriplet);

      return {
        ...state,
        cloneDestTriplet: _.merge(cloneDestTriplet, action.fields)
      };
    case CODELIST_DETAIL_ITEMS_AUTOSAVE_CHANGE:
      return {
        ...state,
        autoSave: !state.autoSave
      };
    case CODELIST_DETAIL_ITEMS_FILE_SYSTEM_TREE_SHOW:
      return {
        ...state,
        isFileSystemTreeVisible: true
      };
    case CODELIST_DETAIL_ITEMS_FILE_SYSTEM_TREE_HIDE:
      return {
        ...state,
        isFileSystemTreeVisible: false,
        fileSystemSelectedItem: null,
      };
    case CODELIST_DETAIL_ITEMS_FILE_SYSTEM_TREE_ITEM_SELECT:
      return {
        ...state,
        fileSystemSelectedItem: getNode(state.itemsTree, "codes", item => item.id === action.selectedItem)
      };
    case CODELIST_DETAIL_EXPORT_SHOW:
      return {
        ...state,
        codelistExportSourceTriplet: action.sourceTriplet,
        codelistExportDestination: {
          endpoint: null,
          username: null,
          password: null,
          id: action.sourceTriplet.id,
          agencyID: action.sourceTriplet.agencyID,
          version: action.sourceTriplet.version
        },
        isAgenciesValid: !!state.allAgencies
      };
    case CODELIST_DETAIL_EXPORT_HIDE:
      return {
        ...state,
        codelistExportSourceTriplet: null,
        codelistExportDestination: null,
        agencies: state.isVisible ? state.agencies : null,
        allAgencies: state.isVisible ? state.allAgencies : null
      };
    case CODELIST_DETAIL_EXPORT_CHANGE:
      const codelistExportDestination = _.cloneDeep(state.codelistExportDestination);
      _.merge(codelistExportDestination, action.fields);

      return {
        ...state,
        codelistExportDestination
      };
    case CODELIST_DETAIL_EXPORT_REPORT_HIDE:
      return {
        ...state,
        codelistExportReport: null
      };
    case CODELIST_DETAIL_TAB_CHANGE:
      return {
        ...state,
        currentTab: action.newTab
      };
    case CODELIST_DETAIL_DERIVED_CODELIST_SOURCE_ITEM_PAGE_PARAMS_UPDATE:
      return {
        ...state,
        dCSourceFetchPageParams: {
          ...action.params,
          timeStamp: (new Date()).getTime()
        }
      };
    case CODELIST_DETAIL_DERIVED_CODELIST_TARGET_ITEM_PAGE_PARAMS_UPDATE:
      return {
        ...state,
        dCTargetFetchPageParams: {
          ...action.params,
          timeStamp: (new Date()).getTime()
        }
      };
    case CODELIST_DETAIL_DERIVED_CODELIST_CHECKBOX_CHANGE:
      return {
        ...state,
        importCheckbox: _.merge(state.importCheckbox, action.checkbox)
      };
    case CODELIST_DETAIL_DERIVED_CODELIST_CREATE_HIDE:
      return {
        ...state,
        isCreateVisible: false,
        derivedCodelist: null
      };
    case CODELIST_DETAIL_DERIVED_CODELIST_CREATE_CHANGE:
      const derivedCodelist = _.cloneDeep(state.derivedCodelist);

      return {
        ...state,
        derivedCodelist: _.merge(derivedCodelist, action.fields)
      };
    case CODELIST_DETAIL_DERIVED_TAB_FOCUS:
      return {
        ...state,
        isDerivedTabFocused: true
      };
    case CODELIST_DETAIL_DERIVED_TAB_UNFOCUS:
      return {
        ...state,
        isDerivedTabFocused: false
      };
    case REQUEST_START:
      switch (action.label) {
        case CODELIST_DETAIL_UPDATE_SUBMIT:
          return {
            ...state,
            isCodelistGeneralTabDirty: false
          };
        default:
          return state;
      }
    case REQUEST_SUCCESS:
      switch (action.label) {
        case CODELIST_DETAIL_READ: {

          const userPermissions = getCurrentUserPermissions(action);
          const customNoneIsAutoAnnotation = userPermissions && userPermissions.rules.includes("CanManageWorkingAnnotation")
            ? () => false
            : undefined;

          const codelist = getItemSchemeFromSdmxJsonFactory(
            SDMX_JSON_CODELIST_ITEMS_KEY,
            getCurrentNodeConfig(action).annotations,
            CODELIST_ORDER_ANNOTATION_KEY,
            customNoneIsAutoAnnotation
          )(getSdmxStructuresFromSdmxJson(action.response)[0]);

          return {
            ...state,
            codelist: codelist,
            isCodelistValid: true,
            itemCount: Number(action.header["x-total-count"]),
            isRestoreDbDisabled: false
          };
        }
        case CODELIST_DETAIL_ITEM_PAGE_READ: {

          const userPermissions = getCurrentUserPermissions(action);
          const customNoneIsAutoAnnotation = userPermissions && userPermissions.rules.includes("CanManageWorkingAnnotation")
            ? () => false
            : undefined;

          const codelist = getItemSchemeFromSdmxJsonFactory(
            SDMX_JSON_CODELIST_ITEMS_KEY,
            getCurrentNodeConfig(action).annotations,
            CODELIST_ORDER_ANNOTATION_KEY,
            customNoneIsAutoAnnotation
          )(getSdmxStructuresFromSdmxJson(action.response)[0]);

          const isInvisibleItem = item => {
            return item.annotations && (
              item.annotations.find(annot =>
                annot.id === "INVISIBLE" &&
                annot.title === "INVISIBLE" &&
                annot.type === "INVISIBLE"
              ) !== undefined
            );
          };

          return {
            ...state,
            codelist: state.codelist === null ? codelist : state.codelist,
            isCodelistValid: true,
            itemPage: (codelist.codes || []).filter(item => !isInvisibleItem(item)),
            itemCount: Number(action.header["x-total-count"]),
            rebuildDb: false
          };
        }
        case CODELIST_DETAIL_ITEM_TREE_READ: {

          const userPermissions = getCurrentUserPermissions(action);
          const customNoneIsAutoAnnotation = userPermissions && userPermissions.rules.includes("CanManageWorkingAnnotation")
            ? () => false
            : undefined;

          const codelist = getItemSchemeFromSdmxJsonFactory(
            SDMX_JSON_CODELIST_ITEMS_KEY,
            getCurrentNodeConfig(action).annotations,
            CODELIST_ORDER_ANNOTATION_KEY,
            customNoneIsAutoAnnotation
          )(getSdmxStructuresFromSdmxJson(action.response)[0]);

          let itemsTree = getTreeFromArray((codelist.codes || []), "codes");

          return {
            ...state,
            itemsTree: itemsTree,
            rebuildDb: false
          };
        }
        case CODELIST_DETAIL_AGENCIES_READ:
          return {
            ...state,
            agencies: _.pickBy(action.response, (_, agencyID) => !action.allowedAgencies || action.allowedAgencies.includes(agencyID)),
            allAgencies: action.response,
            isAgenciesValid: true
          };
        case CODELIST_DETAIL_CREATE_SUBMIT:
          return {
            ...state,
            codelist: null,
            isVisible: true,
            itemsTree: null,
            maxOrder: null,
            codelistTriplet: action.codelistTriplet,
            isCodelistValid: false,
            isCodelistGeneralTabDirty: false,
            focusItemsTab: true,
            itemPage: null,
            fetchPageParams: null,
            currentTab: "items",
            importCheckbox: {
              preserveHierarchy: true,
              importParents: true,
              importChildren: false,
              importDescendants: false
            },
            derivedCodelist: null,
            dCSourceFetchPageParams: null,
            dCSourceItemPage: null,
            dCSourceItemCount: null,
            dCSourceSelectedItemCount: null,
            dCTargetFetchPageParams: null,
            dCTargetItemPage: null,
            dCTargetItemCount: null,
            dCTargetSelectedItemCount: null,
            forceIsFinalDisabled: state.codelist.isFinal
          };
        case CODELIST_DETAIL_UPDATE_SUBMIT:
          return {
            ...state,
            unsavedChange: false,
            importCheckbox: {
              preserveHierarchy: true,
              importParents: true,
              importChildren: false,
              importDescendants: false
            },
            derivedCodelist: null,
            dCSourceFetchPageParams: null,
            dCSourceItemPage: null,
            dCSourceItemCount: null,
            dCSourceSelectedItemCount: null,
            dCTargetFetchPageParams: null,
            dCTargetItemPage: null,
            dCTargetItemCount: null,
            dCTargetSelectedItemCount: null,
            forceIsFinalDisabled: state.codelist.isFinal
          };
        case CODELIST_DETAIL_ITEMS_IMPORT_FORM_FILE_UPLOAD:
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
        case CODELIST_DETAIL_ITEMS_IMPORT_FORM_FILE_IMPORT:
          return {
            ...state,
            itemsImportForm: null,
            isItemsImportFormVisible: false,
            itemsTree: null,
            rebuildDb: true,
            unsavedChange: false,
            derivedCodelist: null,
            dCSourceFetchPageParams: null,
            dCSourceItemPage: null,
            dCSourceItemCount: null,
            dCSourceSelectedItemCount: null,
            dCTargetFetchPageParams: null,
            dCTargetItemPage: null,
            dCTargetItemCount: null,
            dCTargetSelectedItemCount: null,
            isRestoreDbDisabled: false
          };
        case CODELIST_DETAIL_DOWNLOAD_SUBMIT:
          return {
            ...state,
            downloadCodelistTriplets: null,
            downloadCodelistLang: null,
            downloadCodelistParams: null
          };
        case CODELIST_DETAIL_CLONE_SUBMIT:
          return {
            ...state,
            cloneDestTriplet: null,
            codelist: state.isVisible ? state.codelist : null,
            codelistTriplet: state.isVisible ? state.codelistTriplet : null,
            itemCount: state.isVisible ? state.itemCount : null,
            agencies: state.isVisible ? state.agencies : null,
            allAgencies: state.isVisible ? state.allAgencies : null
          };
        case CODELIST_DETAIL_ITEMS_ITEM_SUBMIT:
          return {
            ...state,
            item: null,
            fetchPageParams: {
              ...state.fetchPageParams,
              timeStamp: (new Date()).getTime()
            },
            itemsTree: null,
            unsavedChange: action.unsavedChange,
            dCSourceFetchPageParams: {
              ...state.dCSourceFetchPageParams,
              pageNum: 1,
              timeStamp: (new Date()).getTime()
            },
            dCSourceItemPage: null,
            dCSourceItemCount: null,
            dCSourceSelectedItemCount: null,
            dCTargetFetchPageParams: {
              ...state.dCTargetFetchPageParams,
              pageNum: 1,
              timeStamp: (new Date()).getTime()
            },
            dCTargetItemPage: null,
            dCTargetItemCount: null,
            dCTargetSelectedItemCount: null,
            isRestoreDbDisabled: false
          };
        case CODELIST_DETAIL_ITEMS_ITEM_DELETE:
          return {
            ...state,
            fetchPageParams: {
              ...state.fetchPageParams,
              timeStamp: (new Date()).getTime()
            },
            itemsTree: null,
            unsavedChange: action.unsavedChange,
            dCSourceFetchPageParams: {
              ...state.dCSourceFetchPageParams,
              pageNum: 1,
              timeStamp: (new Date()).getTime()
            },
            dCSourceItemPage: null,
            dCSourceItemCount: null,
            dCSourceSelectedItemCount: null,
            dCTargetFetchPageParams: {
              ...state.dCTargetFetchPageParams,
              pageNum: 1,
              timeStamp: (new Date()).getTime()
            },
            dCTargetItemPage: null,
            dCTargetItemCount: null,
            dCTargetSelectedItemCount: null,
            isRestoreDbDisabled: false
          };
        case CODELIST_DETAIL_ITEMS_ITEM_PARENT_LIST_PAGE_READ: {

          const userPermissions = getCurrentUserPermissions(action);
          const customNoneIsAutoAnnotation = userPermissions && userPermissions.rules.includes("CanManageWorkingAnnotation")
            ? () => false
            : undefined;

          const codelist = getItemSchemeFromSdmxJsonFactory(
            SDMX_JSON_CODELIST_ITEMS_KEY,
            getCurrentNodeConfig(action).annotations,
            CODELIST_ORDER_ANNOTATION_KEY,
            customNoneIsAutoAnnotation
          )(getSdmxStructuresFromSdmxJson(action.response)[0]);

          const isInvisibleItem = item => {
            return item.annotations && (
              item.annotations.find(annot =>
                annot.id === "INVISIBLE" &&
                annot.title === "INVISIBLE" &&
                annot.type === "INVISIBLE"
              ) !== undefined
            );
          };

          return {
            ...state,
            parentPage: (codelist.codes || []).filter(item => !isInvisibleItem(item)),
            itemCount: Number(action.header["x-total-count"])
          };
        }
        case CODELIST_DETAIL_ITEMS_ITEM_DROP:
          return {
            ...state,
            itemsTree: null,
            cutItem: null,
            unsavedChange: action.unsavedChange,
            dCSourceFetchPageParams: {
              ...state.dCSourceFetchPageParams,
              pageNum: 1,
              timeStamp: (new Date()).getTime()
            },
            dCSourceItemPage: null,
            dCSourceItemCount: null,
            dCSourceSelectedItemCount: null,
            dCTargetFetchPageParams: {
              ...state.dCTargetFetchPageParams,
              pageNum: 1,
              timeStamp: (new Date()).getTime()
            },
            dCTargetItemPage: null,
            dCTargetItemCount: null,
            dCTargetSelectedItemCount: null,
            isRestoreDbDisabled: false
          };
        case CODELIST_DETAIL_ITEMS_ITEM_PASTE:
          return {
            ...state,
            itemsTree: null,
            cutItem: null,
            unsavedChange: action.unsavedChange,
            dCSourceFetchPageParams: {
              ...state.dCSourceFetchPageParams,
              pageNum: 1,
              timeStamp: (new Date()).getTime()
            },
            dCSourceItemPage: null,
            dCSourceItemCount: null,
            dCSourceSelectedItemCount: null,
            dCTargetFetchPageParams: {
              ...state.dCTargetFetchPageParams,
              pageNum: 1,
              timeStamp: (new Date()).getTime()
            },
            dCTargetItemPage: null,
            dCTargetItemCount: null,
            dCTargetSelectedItemCount: null,
            isRestoreDbDisabled: false
          };
        case CODELIST_DETAIL_EXPORT_SUBMIT:
          return {
            ...state,
            codelistExportSourceTriplet: null,
            codelistExportDestination: null,
            codelistExportReport: action.response.itemsMessage,
            agencies: state.isVisible ? state.agencies : null,
            allAgencies: state.isVisible ? state.allAgencies : null
          };
        case CODELIST_DETAIL_ITEMS_IMPORT_FORM_CSV_UPLOAD:
          return {
            ...state,
            itemsImportForm: {
              ...state.itemsImportForm,
              filePath: action.response
            }
          };
        case CODELIST_DETAIL_ITEMS_IMPORT_FORM_ALL_CSV_ROWS_READ:
          return {
            ...state,
            itemsImportForm: {
              ...state.itemsImportForm,
              allCsvRows: action.response
            }
          };
        case CODELIST_DETAIL_DERIVED_CODELIST_SOURCE_ITEM_PAGE_READ: {
          return {
            ...state,
            dCSourceItemPage: action.response,
            dCSourceItemCount: Number(action.header["x-total-count"]),
            dCSourceSelectedItemCount: action.header["x-selected-count"]
              ? Number(action.header["x-selected-count"])
              : 0
          };
        }
        case CODELIST_DETAIL_DERIVED_CODELIST_TARGET_ITEM_PAGE_READ: {
          return {
            ...state,
            dCTargetItemPage: action.response,
            dCTargetItemCount: Number(action.header["x-total-count"]),
            dCTargetSelectedItemCount: action.header["x-selected-count"]
              ? Number(action.header["x-selected-count"])
              : 0
          };
        }
        case CODELIST_DETAIL_DERIVED_CODELIST_SOURCE_ITEM_SELECT: {
          return {
            ...state,
            dCSourceFetchPageParams: {
              ...state.dCSourceFetchPageParams,
              timeStamp: (new Date()).getTime()
            }
          };
        }
        case CODELIST_DETAIL_DERIVED_CODELIST_TARGET_ITEM_SELECT: {
          return {
            ...state,
            dCTargetFetchPageParams: {
              ...state.dCTargetFetchPageParams,
              timeStamp: (new Date()).getTime()
            }
          };
        }
        case CODELIST_DETAIL_DERIVED_CODELIST_ALL_ITEMS_SELECT: {
          return {
            ...state,
            dCSourceFetchPageParams: !action.isTarget
              ? {
                ...state.dCSourceFetchPageParams,
                timeStamp: (new Date()).getTime()
              }
              : state.dCSourceFetchPageParams,
            dCTargetFetchPageParams: action.isTarget
              ? {
                ...state.dCTargetFetchPageParams,
                timeStamp: (new Date()).getTime()
              }
              : state.dCTargetFetchPageParams
          };
        }
        case CODELIST_DETAIL_DERIVED_CODELIST_SELECTED_ITEMS_STORE: {
          return {
            ...state,
            dCSourceFetchPageParams: {
              ...state.dCSourceFetchPageParams,
              timeStamp: (new Date()).getTime()
            },
            dCTargetFetchPageParams: {
              ...state.dCTargetFetchPageParams,
              timeStamp: (new Date()).getTime()
            }
          };
        }
        case CODELIST_DETAIL_DERIVED_CODELIST_CREATE_SHOW: {
          return {
            ...state,
            isCreateVisible: true,
            derivedCodelist: action.response
              ? {
                id: null,
                agencyID: null,
                version: null,
                name: null
              }
              : null
          };
        }
        case CODELIST_DETAIL_DERIVED_CODELIST_CREATE_SUBMIT: {
          return {
            ...state,
            derivedCodelist: null,
            dCSourceItemPage: null,
            dCSourceItemCount: null,
            dCSourceSelectedItemCount: null,
            dCTargetItemPage: null,
            dCTargetItemCount: null,
            dCTargetSelectedItemCount: null,
            isCreateVisible: false,
            isRestoreDbDisabled: false,
            restoreDbWithRefresh: true
          };
        }
        case CODELIST_DETAIL_DERIVED_CODELIST_DB_RESTORE: {
          return {
            ...state,
            isRestoreDbDisabled: true,
            restoreDbWithRefresh: false,
            dCTargetFetchPageParams: (action.fetchTarget || state.restoreDbWithRefresh)
              ? {
                ...state.dCTargetFetchPageParams,
                timeStamp: (new Date()).getTime()
              }
              : state.dCTargetFetchPageParams,
            dCSourceFetchPageParams: (action.fetchTarget || state.restoreDbWithRefresh)
              ? {
                ...state.dCSourceFetchPageParams,
                timeStamp: (new Date()).getTime()
              }
              : state.dCSourceFetchPageParams
          };
        }
        case CODELIST_DETAIL_ITEMS_DEFAULT_ORDER_SET:
          return {
            ...state,
            unsavedChange: false
          };
        default:
          return state;
      }
    case REQUEST_ERROR:
      switch (action.label) {
        case CODELIST_DETAIL_READ:
          return {
            ...state,
            isVisible: false,
            isCodelistValid: true
          };
        case CODELIST_DETAIL_ITEMS_ITEM_DROP:
          return {
            ...state,
            itemsTree: null,
            cutItem: null
          };
        case CODELIST_DETAIL_ITEMS_ITEM_PASTE:
          return {
            ...state,
            itemsTree: null,
            cutItem: null
          };
        default:
          return state;
      }
    default:
      return state;
  }
};

export default codelistDetailModalReducer;
