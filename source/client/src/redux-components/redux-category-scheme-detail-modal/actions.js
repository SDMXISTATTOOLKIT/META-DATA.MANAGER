import {getRequest, postRequest, putRequest} from "../../middlewares/api/actions";
import {
  getAgencyNamesUrl,
  getCategorySchemeUrl,
  getCheckImportedFileCsvItemUrl,
  getCreateArtefactsUrl,
  getCsvTablePreviewUrl,
  getDownloadArtefactUrl,
  getExportArtefactUrl,
  getImportFileCsvItemUrl,
  getMultipleDownloadArtefactUrl,
  getUpdateArtefactsUrl,
  getUploadFileOnServerUrl
} from "../../constants/urls";
import {
  getSdmxJsonFromSdmxJsonStructures,
  getSdmxJsonStructureFromArtefact,
  getSdmxJsonStructureFromItem,
  SDMX_JSON_CATEGORY_SCHEME_LIST_KEY,
} from "../../utils/sdmxJson";
import _ from "lodash";
import {getMappedTree, getNode, getTreeFromArray} from "../../utils/tree";
import {itemsOrderCompare, updateItemOrder} from "../../utils/artefacts";
import {normalizeItemsOrder} from "../../utils/normalizers";
import {Modal} from 'antd';
import {
  ARTEFACT_TYPE_CATEGORY_SCHEME,
  DOWNLOAD_FORMAT_TYPE_CSV,
  getArtefactDownloadFileSaveNameAndType
} from "../../constants/download";
import {removeOrderAnnotation} from "../../utils/annotations";

export const CATEGORY_SCHEME_DETAIL_READ = 'CATEGORY_SCHEME_DETAIL_READ';
export const CATEGORY_SCHEME_DETAIL_CREATE = 'CATEGORY_SCHEME_DETAIL_CREATE';
export const CATEGORY_SCHEME_DETAIL_EDIT = 'CATEGORY_SCHEME_DETAIL_EDIT';
export const CATEGORY_SCHEME_DETAIL_SHOW = 'CATEGORY_SCHEME_DETAIL_SHOW';
export const CATEGORY_SCHEME_DETAIL_CHANGE = 'CATEGORY_SCHEME_DETAIL_CHANGE';
export const CATEGORY_SCHEME_DETAIL_HIDE = 'CATEGORY_SCHEME_DETAIL_HIDE';
export const CATEGORY_SCHEME_DETAIL_CREATE_SUBMIT = 'CATEGORY_SCHEME_DETAIL_CREATE_SUBMIT';
export const CATEGORY_SCHEME_DETAIL_UPDATE_SUBMIT = 'CATEGORY_SCHEME_DETAIL_UPDATE_SUBMIT';

export const CATEGORY_SCHEME_DETAIL_AGENCIES_READ = 'CATEGORY_SCHEME_DETAIL_AGENCIES_READ';

export const CATEGORY_SCHEME_DETAIL_ITEMS_VIEW_MODE_CHANGE = 'CATEGORY_SCHEME_DETAIL_ITEMS_VIEW_MODE_CHANGE';

export const CATEGORY_SCHEME_DETAIL_ITEMS_ITEM_CREATE = 'CATEGORY_SCHEME_DETAIL_ITEMS_ITEM_CREATE';
export const CATEGORY_SCHEME_DETAIL_ITEMS_ITEM_EDIT = 'CATEGORY_SCHEME_DETAIL_ITEMS_ITEM_EDIT';
export const CATEGORY_SCHEME_DETAIL_ITEMS_ITEM_CHANGE = 'CATEGORY_SCHEME_DETAIL_ITEMS_ITEM_CHANGE';
export const CATEGORY_SCHEME_DETAIL_ITEMS_ITEM_HIDE = 'CATEGORY_SCHEME_DETAIL_ITEMS_ITEM_HIDE';
export const CATEGORY_SCHEME_DETAIL_ITEMS_ITEM_SELECT = 'CATEGORY_SCHEME_DETAIL_ITEMS_ITEM_SELECT';

export const CATEGORY_SCHEME_DETAIL_ITEMS_IMPORT_FORM_SHOW = 'CATEGORY_SCHEME_DETAIL_ITEMS_IMPORT_FORM_SHOW';
export const CATEGORY_SCHEME_DETAIL_ITEMS_IMPORT_FORM_HIDE = 'CATEGORY_SCHEME_DETAIL_ITEMS_IMPORT_FORM_HIDE';
export const CATEGORY_SCHEME_DETAIL_ITEMS_IMPORT_FORM_ALL_CSV_ROWS_SHOW = 'CATEGORY_SCHEME_DETAIL_ITEMS_IMPORT_FORM_ALL_CSV_ROWS_SHOW';
export const CATEGORY_SCHEME_DETAIL_ITEMS_IMPORT_FORM_ALL_CSV_ROWS_HIDE = 'CATEGORY_SCHEME_DETAIL_ITEMS_IMPORT_FORM_ALL_CSV_ROWS_HIDE';
export const CATEGORY_SCHEME_DETAIL_ITEMS_IMPORT_FORM_CSV_UPLOAD = 'CATEGORY_SCHEME_DETAIL_ITEMS_IMPORT_FORM_CSV_UPLOAD';
export const CATEGORY_SCHEME_DETAIL_ITEMS_IMPORT_FORM_ALL_CSV_ROWS_READ = 'CATEGORY_SCHEME_DETAIL_ITEMS_IMPORT_FORM_ALL_CSV_ROWS_READ';
export const CATEGORY_SCHEME_DETAIL_ITEMS_IMPORT_FORM_CHANGE = 'CATEGORY_SCHEME_DETAIL_ITEMS_IMPORT_FORM_CHANGE';
export const CATEGORY_SCHEME_DETAIL_ITEMS_IMPORT_FORM_FILE_UPLOAD = 'CATEGORY_SCHEME_DETAIL_ITEMS_IMPORT_FORM_FILE_UPLOAD';
export const CATEGORY_SCHEME_DETAIL_ITEMS_IMPORT_FORM_FILE_IMPORT = 'CATEGORY_SCHEME_DETAIL_ITEMS_IMPORT_FORM_FILE_IMPORT';

export const CATEGORY_SCHEME_DETAIL_ITEMS_ITEM_ANNOTATIONS_SHOW = 'CATEGORY_SCHEME_DETAIL_ITEMS_ITEM_ANNOTATIONS_SHOW';
export const CATEGORY_SCHEME_DETAIL_ITEMS_ITEM_ANNOTATIONS_HIDE = 'CATEGORY_SCHEME_DETAIL_ITEMS_ITEM_ANNOTATIONS_HIDE';
export const CATEGORY_SCHEME_DETAIL_ITEMS_ITEM_LAYOUT_ANNOTATIONS_SHOW = 'CATEGORY_SCHEME_DETAIL_ITEMS_ITEM_LAYOUT_ANNOTATIONS_SHOW';
export const CATEGORY_SCHEME_DETAIL_ITEMS_ITEM_LAYOUT_ANNOTATIONS_HIDE = 'CATEGORY_SCHEME_DETAIL_ITEMS_ITEM_LAYOUT_ANNOTATIONS_HIDE';

export const CATEGORY_SCHEME_DETAIL_ITEMS_ITEM_PARENT_LIST_SHOW = 'CATEGORY_SCHEME_DETAIL_ITEMS_ITEM_PARENT_LIST_SHOW';
export const CATEGORY_SCHEME_DETAIL_ITEMS_ITEM_PARENT_LIST_HIDE = 'CATEGORY_SCHEME_DETAIL_ITEMS_ITEM_PARENT_LIST_HIDE';
export const CATEGORY_SCHEME_DETAIL_ITEMS_ITEM_PARENT_LIST_SET = 'CATEGORY_SCHEME_DETAIL_ITEMS_ITEM_PARENT_LIST_SET';
export const CATEGORY_SCHEME_DETAIL_ITEMS_ITEM_PARENT_LIST_UNSET = 'CATEGORY_SCHEME_DETAIL_ITEMS_ITEM_PARENT_LIST_UNSET';

export const CATEGORY_SCHEME_DETAIL_LANGUAGE_CHANGE = 'CATEGORY_SCHEME_DETAIL_LANGUAGE_CHANGE';

export const CATEGORY_SCHEME_DETAIL_ITEMS_ITEM_DUPLICATE_ITEM_ERROR_SHOW = 'CATEGORY_SCHEME_DETAIL_ITEMS_ITEM_DUPLICATE_ITEM_ERROR_SHOW';
export const CATEGORY_SCHEME_DETAIL_ITEMS_ITEM_DUPLICATE_ITEM_ERROR_HIDE = 'CATEGORY_SCHEME_DETAIL_ITEMS_ITEM_DUPLICATE_ITEM_ERROR_HIDE';
export const CATEGORY_SCHEME_DETAIL_ITEMS_ITEM_CUT = 'CATEGORY_SCHEME_DETAIL_ITEMS_ITEM_CUT';

export const CATEGORY_SCHEME_DETAIL_DOWNLOAD_SHOW = 'CATEGORY_SCHEME_DETAIL_DOWNLOAD_SHOW';
export const CATEGORY_SCHEME_DETAIL_DOWNLOAD_HIDE = 'CATEGORY_SCHEME_DETAIL_DOWNLOAD_HIDE';
export const CATEGORY_SCHEME_DETAIL_DOWNLOAD_CHANGE = 'CATEGORY_SCHEME_DETAIL_DOWNLOAD_CHANGE';
export const CATEGORY_SCHEME_DETAIL_DOWNLOAD_SUBMIT = 'CATEGORY_SCHEME_DETAIL_DOWNLOAD_SUBMIT';

export const CATEGORY_SCHEME_DETAIL_CLONE_SHOW = 'CATEGORY_SCHEME_DETAIL_CLONE_SHOW';
export const CATEGORY_SCHEME_DETAIL_CLONE_HIDE = 'CATEGORY_SCHEME_DETAIL_CLONE_HIDE';
export const CATEGORY_SCHEME_DETAIL_CLONE_CHANGE = 'CATEGORY_SCHEME_DETAIL_CLONE_CHANGE';
export const CATEGORY_SCHEME_DETAIL_CLONE_SUBMIT = 'CATEGORY_SCHEME_DETAIL_CLONE_SUBMIT';

export const CATEGORY_SCHEME_DETAIL_EXPORT_SHOW = 'CATEGORY_SCHEME_DETAIL_EXPORT_SHOW';
export const CATEGORY_SCHEME_DETAIL_EXPORT_HIDE = 'CATEGORY_SCHEME_DETAIL_EXPORT_HIDE';
export const CATEGORY_SCHEME_DETAIL_EXPORT_CHANGE = 'CATEGORY_SCHEME_DETAIL_EXPORT_CHANGE';
export const CATEGORY_SCHEME_DETAIL_EXPORT_SUBMIT = 'CATEGORY_SCHEME_DETAIL_EXPORT_SUBMIT';

export const CATEGORY_SCHEME_DETAIL_EXPORT_REPORT_HIDE = 'CATEGORY_SCHEME_DETAIL_EXPORT_REPORT_HIDE';

export const CATEGORY_SCHEME_DETAIL_DERIVED_ITEM_SCHEME_CREATE_SUBMIT = 'CATEGORY_SCHEME_DETAIL_DERIVED_ITEM_SCHEME_CREATE_SUBMIT';

export const CATEGORY_SCHEME_DETAIL_DERIVED_TAB_FOCUS = 'CATEGORY_SCHEME_DETAIL_DERIVED_TAB_FOCUS';
export const CATEGORY_SCHEME_DETAIL_DERIVED_TAB_UNFOCUS = 'CATEGORY_SCHEME_DETAIL_DERIVED_TAB_UNFOCUS';

export const createCategorySchemeDetail = defaultItemsViewMode => ({
  type: CATEGORY_SCHEME_DETAIL_CREATE,
  defaultItemsViewMode
});

export const showCategorySchemeDetail = (categorySchemeTriplet, defaultItemsViewMode) => ({
  type: CATEGORY_SCHEME_DETAIL_SHOW,
  categorySchemeTriplet,
  defaultItemsViewMode
});

export const editCategorySchemeDetail = (categorySchemeTriplet, defaultItemsViewMode) => ({
  type: CATEGORY_SCHEME_DETAIL_EDIT,
  categorySchemeTriplet,
  defaultItemsViewMode
});

export const readCategorySchemeDetail = (categorySchemeTriplet, itemsOrderAnnotationType, lang) => ({
  ...getRequest(
    CATEGORY_SCHEME_DETAIL_READ,
    getCategorySchemeUrl(categorySchemeTriplet)
  ),
  itemsOrderAnnotationType,
  lang
});

export const changeCategorySchemeDetail = fields => ({
  type: CATEGORY_SCHEME_DETAIL_CHANGE,
  fields
});

export const hideCategorySchemeDetail = () => ({
  type: CATEGORY_SCHEME_DETAIL_HIDE
});

export const submitCategorySchemeDetailCreate = (categoryScheme, categorySchemeTriplet) => ({
  ...postRequest(
    CATEGORY_SCHEME_DETAIL_CREATE_SUBMIT,
    getCreateArtefactsUrl(),
    getSdmxJsonFromSdmxJsonStructures(
      [getSdmxJsonStructureFromArtefact(categoryScheme)],
      SDMX_JSON_CATEGORY_SCHEME_LIST_KEY
    ),
    t => ({
      success: t('reduxComponents.categorySchemeDetail.messages.create.success')
    })
  ),
  categorySchemeTriplet
});

export const submitCategorySchemeDetailUpdate = (categoryScheme, itemsTree, itemsOrderAnnotationType) => {

  let categories = undefined;
  if (itemsTree) {
    categories = itemsTree.map(node => getSdmxJsonStructureFromItem(node));
    categories = getMappedTree(categories, "categories", item => ({
      ...item,
      annotations: categoryScheme.isFinal
        ? item.annotations
        : removeOrderAnnotation(item.annotations, itemsOrderAnnotationType),
      parent: undefined
    }));

    categoryScheme = {
      ...categoryScheme,
      categories: categories
    };
  }

  return ({
    ...putRequest(
      CATEGORY_SCHEME_DETAIL_UPDATE_SUBMIT,
      getUpdateArtefactsUrl(),
      getSdmxJsonFromSdmxJsonStructures(
        [getSdmxJsonStructureFromArtefact(categoryScheme)],
        SDMX_JSON_CATEGORY_SCHEME_LIST_KEY
      ),
      t => ({
        success: t('reduxComponents.categorySchemeDetail.messages.update.success')
      })
    ),
    itemsTree
  });
};

export const readCategorySchemeDetailAgencies = allowedAgencies => ({
  ...getRequest(
    CATEGORY_SCHEME_DETAIL_AGENCIES_READ,
    getAgencyNamesUrl()
  ),
  allowedAgencies
});

export const changeCategorySchemeDetailItemsViewMode = viewMode => ({
  type: CATEGORY_SCHEME_DETAIL_ITEMS_VIEW_MODE_CHANGE,
  viewMode
});

export const createCategorySchemesDetailsItemsItem = (parentId, order, lang, itemsOrderAnnotationType) => ({
  type: CATEGORY_SCHEME_DETAIL_ITEMS_ITEM_CREATE,
  parentId,
  order,
  lang,
  itemsOrderAnnotationType
});

export const editCategorySchemesDetailItemsItem = item => ({
  type: CATEGORY_SCHEME_DETAIL_ITEMS_ITEM_EDIT,
  item
});

export const changeCategorySchemeDetailItemsItem = (fields, lang, itemsOrderAnnotationType) => ({
  type: CATEGORY_SCHEME_DETAIL_ITEMS_ITEM_CHANGE,
  fields,
  lang,
  itemsOrderAnnotationType
});

export const submitCategorySchemeDetailItemsItem =
  (categoryScheme, itemsTree, item, itemsOrderAnnotationType, isItemEditMode, lang, isNormalizeNeeded, cutItem, t) => {

    if (cutItem) {
      const parentNode = getNode(itemsTree, "categories", node => node.id === cutItem.parent);
      if (parentNode) {
        parentNode.categories.push(cutItem);
        parentNode.categories.sort((a, b) => itemsOrderCompare(a, b, lang));
      } else {
        itemsTree.push(cutItem);
        itemsTree.sort((a, b) => itemsOrderCompare(a, b, lang));
      }
      Modal.info({title: t("commons.artefact.messages.nodeRestored.title")});
    }

    if (isItemEditMode || !getNode(itemsTree, "categories", node => node.id === item.id)) {
      const root = [{
        isRoot: true,
        categories: itemsTree
      }];

      itemsTree = getMappedTree(root, "categories", node => {
        if (node.id === item.parent || (node.id === undefined && item.parent === null)) {
          if (isItemEditMode) {
            if (!_.find(node.categories, child => child.id === item.id)) {
              node.categories.push(item);
            }
            node.categories = node.categories.map(child => {
              if (child.id === item.id) {
                if (item.order && child.order[lang] !== item.order[lang]) {
                  const tempItem = _.cloneDeep(item);
                  tempItem.order[lang].length > 0
                    ? updateItemOrder(tempItem, String(Number(item.order[lang]) - 0.1), itemsOrderAnnotationType, lang)
                    : updateItemOrder(tempItem, String(Number.MAX_VALUE), itemsOrderAnnotationType, lang);
                  return tempItem
                }
                return item
              } else {
                return child
              }
            });
          } else {
            item.order[lang].length > 0
              ? updateItemOrder(item, String(Number(item.order[lang]) - 0.1), itemsOrderAnnotationType, lang)
              : updateItemOrder(item, String(Number.MAX_VALUE), itemsOrderAnnotationType, lang);
            node.categories.push(item);
          }
          node.categories.sort((a, b) => itemsOrderCompare(a, b, lang));
        } else {
          node.categories = node.categories.filter(c => c.id !== item.id);
        }
        return node
      })[0].categories;

      // if (isNormalizeNeeded) // uncomment for performance improvement
      normalizeItemsOrder(itemsTree, "categories", lang, itemsOrderAnnotationType);

      return submitCategorySchemeDetailUpdate(categoryScheme, itemsTree, itemsOrderAnnotationType)

    } else {
      return ({
        type: CATEGORY_SCHEME_DETAIL_ITEMS_ITEM_DUPLICATE_ITEM_ERROR_SHOW
      })
    }
  };

export const hideCategorySchemeDetailItemsItem = () => ({
  type: CATEGORY_SCHEME_DETAIL_ITEMS_ITEM_HIDE,
});

export const deleteCategorySchemeDetailsItemsItem = (categoryScheme, itemsTree, item, cutItem, lang, t, itemsOrderAnnotationType) => {

  if (cutItem) {
    const parentNode = getNode(itemsTree, "categories", node => node.id === cutItem.parent);
    if (parentNode) {
      parentNode.categories.push(cutItem);
      parentNode.categories.sort((a, b) => itemsOrderCompare(a, b, lang));
    } else {
      itemsTree.push(cutItem);
      itemsTree.sort((a, b) => itemsOrderCompare(a, b, lang));
    }
    Modal.info({title: t("commons.artefact.messages.nodeRestored.title")});
  }

  const root = [{
    isRoot: true,
    categories: itemsTree
  }];

  itemsTree = item.parent
    ? getMappedTree(root, "categories", node => {
      if (node.id === item.parent) {
        node.categories = node.categories.filter(child => child.id !== item.id);
      }
      return node
    })[0].categories
    : itemsTree.filter(node => node.id !== item.id);

  return submitCategorySchemeDetailUpdate(categoryScheme, itemsTree, itemsOrderAnnotationType);
};

export const selectCategorySchemeDetailsItemsItem = id => ({
  type: CATEGORY_SCHEME_DETAIL_ITEMS_ITEM_SELECT,
  id
});

export const showCategorySchemeDetailItemsImportForm = () => ({
  type: CATEGORY_SCHEME_DETAIL_ITEMS_IMPORT_FORM_SHOW
});

export const hideCategorySchemeDetailItemsImportForm = () => ({
  type: CATEGORY_SCHEME_DETAIL_ITEMS_IMPORT_FORM_HIDE
});

export const changeCategorySchemeDetailItemsImportForm = fields => ({
  type: CATEGORY_SCHEME_DETAIL_ITEMS_IMPORT_FORM_CHANGE,
  fields
});

export const uploadCategorySchemeDetailItemsImportFormFile = (categoryScheme, itemsImportForm) => {

  let formData = new FormData();
  formData.append('file', itemsImportForm.file);
  formData.append('CustomData', JSON.stringify({
    type: 'categoryScheme',
    identity: {
      ID: categoryScheme.id,
      Agency: categoryScheme.agencyID,
      Version: categoryScheme.version
    },
    lang: itemsImportForm.language,
    firstRowHeader: itemsImportForm.hasHeader,
    columns: itemsImportForm.hasHeader
      ? ({
        id: 0,
        name: 1,
        description: itemsImportForm.hasDescriptionCol ? 2 : -1,
        parent: itemsImportForm.hasParentCol ? 3 : -1,
        order: itemsImportForm.hasOrderCol ? 4 : -1,
        fullName: itemsImportForm.hasLayoutAnnotationFullNameCol ? 5 : -1,
        isDefault: itemsImportForm.hasLayoutAnnotationIsDefaultCol ? 6 : -1
      })
      : ({
        id: 0,
        name: 1,
        description: itemsImportForm.hasDescriptionCol ? 2 : -1,
        parent: itemsImportForm.hasParentCol ? (2 + itemsImportForm.hasDescriptionCol) : -1,
        order: itemsImportForm.hasOrderCol ? (2 + itemsImportForm.hasDescriptionCol + itemsImportForm.hasParentCol) : -1,
        fullName: itemsImportForm.hasLayoutAnnotationFullNameCol
          ? (2 + itemsImportForm.hasDescriptionCol + itemsImportForm.hasParentCol + itemsImportForm.hasOrderCol)
          : -1,
        isDefault: itemsImportForm.hasLayoutAnnotationIsDefaultCol
          ? (2 + itemsImportForm.hasDescriptionCol + itemsImportForm.hasParentCol + itemsImportForm.hasOrderCol + itemsImportForm.hasLayoutAnnotationFullNameCol)
          : -1
      }),
    textSeparator: itemsImportForm.separator,
    textDelimiter: itemsImportForm.delimiter,
  }));

  return postRequest(
    CATEGORY_SCHEME_DETAIL_ITEMS_IMPORT_FORM_FILE_UPLOAD,
    getCheckImportedFileCsvItemUrl(),
    formData,
    t => ({
      success: t('commons.artefact.messages.itemsImport.fileUpload.success')
    })
  );
};

export const importCategorySchemeDetailItemsImportFormFile = (categoryScheme, itemsImportForm) => postRequest(
  CATEGORY_SCHEME_DETAIL_ITEMS_IMPORT_FORM_FILE_IMPORT,
  getImportFileCsvItemUrl(),
  {
    hashImport: itemsImportForm.hash,
    type: 'categoryScheme',
    identity: {
      ID: categoryScheme.id,
      Agency: categoryScheme.agencyID,
      Version: categoryScheme.version
    },
    lang: itemsImportForm.language,
    firstRowHeader: itemsImportForm.hasHeader,
    columns: itemsImportForm.hasHeader
      ? ({
        id: 0,
        name: 1,
        description: itemsImportForm.hasDescriptionCol ? 2 : -1,
        parent: itemsImportForm.hasParentCol ? 3 : -1,
        order: itemsImportForm.hasOrderCol ? 4 : -1,
        fullName: itemsImportForm.hasLayoutAnnotationFullNameCol ? 5 : -1,
        isDefault: itemsImportForm.hasLayoutAnnotationIsDefaultCol ? 6 : -1
      })
      : ({
        id: 0,
        name: 1,
        description: itemsImportForm.hasDescriptionCol ? 2 : -1,
        parent: itemsImportForm.hasParentCol ? (2 + itemsImportForm.hasDescriptionCol) : -1,
        order: itemsImportForm.hasOrderCol ? (2 + itemsImportForm.hasDescriptionCol + itemsImportForm.hasParentCol) : -1,
        fullName: itemsImportForm.hasLayoutAnnotationFullNameCol
          ? (2 + itemsImportForm.hasDescriptionCol + itemsImportForm.hasParentCol + itemsImportForm.hasOrderCol)
          : -1,
        isDefault: itemsImportForm.hasLayoutAnnotationIsDefaultCol
          ? (2 + itemsImportForm.hasDescriptionCol + itemsImportForm.hasParentCol + itemsImportForm.hasOrderCol + itemsImportForm.hasLayoutAnnotationFullNameCol)
          : -1
      }),
    textSeparator: itemsImportForm.separator,
    textDelimiter: itemsImportForm.delimiter,
  },
  t => ({
    success: t('commons.artefact.messages.itemsImport.fileImport.success')
  })
);

export const showCategorySchemeDetailItemsItemAnnotations = (annotations, itemId) => ({
  type: CATEGORY_SCHEME_DETAIL_ITEMS_ITEM_ANNOTATIONS_SHOW,
  annotations,
  itemId
});

export const hideCategorySchemeDetailItemsItemAnnotations = () => ({
  type: CATEGORY_SCHEME_DETAIL_ITEMS_ITEM_ANNOTATIONS_HIDE
});

export const showCategorySchemeDetailItemsItemLayoutAnnotations = (annotations, itemId) => ({
  type: CATEGORY_SCHEME_DETAIL_ITEMS_ITEM_LAYOUT_ANNOTATIONS_SHOW,
  annotations,
  itemId
});

export const hideCategorySchemeDetailItemsItemLayoutAnnotations = () => ({
  type: CATEGORY_SCHEME_DETAIL_ITEMS_ITEM_LAYOUT_ANNOTATIONS_HIDE
});

export const showCategorySchemeDetailItemsItemParentList = () => ({
  type: CATEGORY_SCHEME_DETAIL_ITEMS_ITEM_PARENT_LIST_SHOW
});

export const hideCategorySchemeDetailItemsItemParentList = () => ({
  type: CATEGORY_SCHEME_DETAIL_ITEMS_ITEM_PARENT_LIST_HIDE
});

export const setCategorySchemeDetailItemsItemParentList = item => ({
  type: CATEGORY_SCHEME_DETAIL_ITEMS_ITEM_PARENT_LIST_SET,
  item
});

export const unsetCategorySchemeDetailItemsItemParentList = () => ({
  type: CATEGORY_SCHEME_DETAIL_ITEMS_ITEM_PARENT_LIST_UNSET
});

export const dropCategorySchemesDetailItemsItems =
  (item, newParent, newOrder, categoryScheme, itemsTree, itemsOrderAnnotationType, lang, cutItem, t) => {

    if (cutItem) {
      const parentNode = getNode(itemsTree, "categories", node => node.id === cutItem.parent);
      if (parentNode) {
        parentNode.categories.push(cutItem);
        parentNode.categories.sort((a, b) => itemsOrderCompare(a, b, lang));
      } else {
        itemsTree.push(cutItem);
        itemsTree.sort((a, b) => itemsOrderCompare(a, b, lang));
      }
      Modal.info({title: t("commons.artefact.messages.nodeRestored.title")});
    }

    const root = [{
      isRoot: true,
      categories: itemsTree
    }];

    itemsTree = getMappedTree(root, "categories", node => {
      if ((node.id === newParent || (node.id === null && newParent === undefined) || (node.id === undefined && newParent === null)) &&
        !_.find(node.categories, child => child.id === item.id)) {
        node.categories.push({...item, parent: node.id});
      }
      node.categories.forEach(child => {
        if (child.id === item.id) {
          if (!(node.id === newParent || (node.id === null && newParent === undefined) || (node.id === undefined && newParent === null))) {
            node.categories = node.categories.filter(c => c.id !== child.id);
          } else {
            updateItemOrder(child, newOrder, itemsOrderAnnotationType, lang);
            node.categories.sort((a, b) => itemsOrderCompare(a, b, lang));
          }
        }
      });
      return node;
    })[0].categories;

    normalizeItemsOrder(itemsTree, "categories", lang, itemsOrderAnnotationType);

    return submitCategorySchemeDetailUpdate(categoryScheme, itemsTree, itemsOrderAnnotationType)
  };

export const changeCategorySchemeDetailLanguage = (lang, itemsOrderAnnotationType) => ({
  type: CATEGORY_SCHEME_DETAIL_LANGUAGE_CHANGE,
  lang,
  itemsOrderAnnotationType
});

export const hideCategorySchemeDetailItemsItemDuplicateItemError = () => ({
  type: CATEGORY_SCHEME_DETAIL_ITEMS_ITEM_DUPLICATE_ITEM_ERROR_HIDE
});

export const cutCategorySchemeDetailItemsItem = item => ({
  type: CATEGORY_SCHEME_DETAIL_ITEMS_ITEM_CUT,
  item
});

export const pasteCategorySchemeDetailItemsItem = (cutItem, newParent, pasteAfter, categoryScheme, itemsTree, lang, itemsOrderAnnotationType) => {
  if (pasteAfter) {
    const parentNode = getNode(itemsTree, "categories", node => node.id === pasteAfter.parent);
    if (parentNode) {
      parentNode.categories.push({
        ...cutItem,
        parent: parentNode.id,
        order: {
          ...cutItem.order,
          [lang]: String(Number(pasteAfter.order[lang]) + 0.1)
        }
      });
      parentNode.categories.sort((a, b) => itemsOrderCompare(a, b, lang));
    } else {
      itemsTree.push({
        ...cutItem,
        parent: null,
        order: {
          ...cutItem.order,
          [lang]: String(Number(pasteAfter.order[lang]) + 0.1)
        }
      });
      itemsTree.sort((a, b) => itemsOrderCompare(a, b, lang));
    }
  } else {
    const parentNode = getNode(itemsTree, "categories", node => node.id === newParent.id);
    parentNode.categories.push({...cutItem, parent: parentNode.id});
    parentNode.categories.sort((a, b) => itemsOrderCompare(a, b, lang));
  }

  return submitCategorySchemeDetailUpdate(categoryScheme, itemsTree.splice(0), itemsOrderAnnotationType)
};

export const showCategorySchemeDetailDownload = (artefactTriplets, lang) => ({
  type: CATEGORY_SCHEME_DETAIL_DOWNLOAD_SHOW,
  artefactTriplets,
  lang
});

export const hideCategorySchemeDetailDownload = () => ({
  type: CATEGORY_SCHEME_DETAIL_DOWNLOAD_HIDE
});

export const changeCategorySchemeDetailDownload = fields => ({
  type: CATEGORY_SCHEME_DETAIL_DOWNLOAD_CHANGE,
  fields
});

export const submitCategorySchemeDetailDownload = (artefactTriplets, downloadCategorySchemeParams, lang) => {

  return (artefactTriplets && artefactTriplets.length > 1)
    ? {
      ...postRequest(
        CATEGORY_SCHEME_DETAIL_DOWNLOAD_SUBMIT,
        getMultipleDownloadArtefactUrl(
          ARTEFACT_TYPE_CATEGORY_SCHEME,
          downloadCategorySchemeParams.format,
          false,
          downloadCategorySchemeParams.compression,
          lang
        ),
        artefactTriplets.map(({id, agencyID, version}) => ({id, agency: agencyID, version})),
        undefined,
        undefined,
        true
      ),
      fileSave: getArtefactDownloadFileSaveNameAndType(
        artefactTriplets,
        ARTEFACT_TYPE_CATEGORY_SCHEME,
        downloadCategorySchemeParams.format,
        downloadCategorySchemeParams.compression
      )
    }
    : {
      ...getRequest(
        CATEGORY_SCHEME_DETAIL_DOWNLOAD_SUBMIT,
        getDownloadArtefactUrl(
          ARTEFACT_TYPE_CATEGORY_SCHEME,
          artefactTriplets[0],
          downloadCategorySchemeParams.format,
          false,
          downloadCategorySchemeParams.compression,
          downloadCategorySchemeParams.format === DOWNLOAD_FORMAT_TYPE_CSV
            ? downloadCategorySchemeParams.csvLanguage
            : lang,
          downloadCategorySchemeParams.format === DOWNLOAD_FORMAT_TYPE_CSV
            ? downloadCategorySchemeParams.csvSeparator
            : null,
          downloadCategorySchemeParams.format === DOWNLOAD_FORMAT_TYPE_CSV
            ? downloadCategorySchemeParams.csvDelimiter
            : null
        ),
        undefined,
        true
      ),
      fileSave: getArtefactDownloadFileSaveNameAndType(
        artefactTriplets,
        ARTEFACT_TYPE_CATEGORY_SCHEME,
        downloadCategorySchemeParams.format,
        downloadCategorySchemeParams.compression,
        downloadCategorySchemeParams.csvLanguage
      )
    }
};

export const showCategorySchemeCategorySchemeClone = srcTriplet => ({
  type: CATEGORY_SCHEME_DETAIL_CLONE_SHOW,
  srcTriplet
});

export const hideCategorySchemeCategorySchemeClone = () => ({
  type: CATEGORY_SCHEME_DETAIL_CLONE_HIDE
});

export const changeCategorySchemeCategorySchemeClone = fields => ({
  type: CATEGORY_SCHEME_DETAIL_CLONE_CHANGE,
  fields
});

export const submitCategorySchemeCategorySchemeClone = (cloneDestTriplet, srcCategoryScheme, srcCategorySchemeItemsTree) => {

  let categories = undefined;
  if (srcCategorySchemeItemsTree) {
    categories = srcCategorySchemeItemsTree.map(node => {
      return getSdmxJsonStructureFromItem(node);
    });
    categories = getMappedTree(categories, "categories", item => ({...item, parent: undefined}));
  }

  return postRequest(
    CATEGORY_SCHEME_DETAIL_CLONE_SUBMIT,
    getCreateArtefactsUrl(),
    getSdmxJsonFromSdmxJsonStructures(
      [
        getSdmxJsonStructureFromArtefact({
          ...srcCategoryScheme,
          ...cloneDestTriplet,
          categories,
          isFinal: false,
          autoAnnotations: null
        })
      ],
      SDMX_JSON_CATEGORY_SCHEME_LIST_KEY
    ),
    t => ({
      success: t('commons.artefact.messages.clone.success')
    })
  );
};

export const showCategorySchemeCategorySchemeExport = sourceTriplet => ({
  type: CATEGORY_SCHEME_DETAIL_EXPORT_SHOW,
  sourceTriplet
});

export const hideCategorySchemeDetailExport = () => ({
  type: CATEGORY_SCHEME_DETAIL_EXPORT_HIDE
});

export const changeCategorySchemeDetailExport = fields => ({
  type: CATEGORY_SCHEME_DETAIL_EXPORT_CHANGE,
  fields
});

export const submitCategorySchemeDetailExport = (sourceTriplet, destination) => postRequest(
  CATEGORY_SCHEME_DETAIL_EXPORT_SUBMIT,
  getExportArtefactUrl(),
  {
    id: sourceTriplet.id,
    agency: sourceTriplet.agencyID,
    version: sourceTriplet.version,
    targetID: destination.id,
    targetAgency: destination.agencyID,
    targetVersion: destination.version,
    nodeId: destination.endpoint,
    username: destination.username,
    password: btoa(destination.password || []),
    EnumType: "CategoryScheme",
    CopyReferencedArtefact: false
  }
);

export const hideCategorySchemeDetailExportReport = () => ({
  type: CATEGORY_SCHEME_DETAIL_EXPORT_REPORT_HIDE
});

export const showCategorySchemeDetailItemsImportFormAllCsvRows = () => ({
  type: CATEGORY_SCHEME_DETAIL_ITEMS_IMPORT_FORM_ALL_CSV_ROWS_SHOW
});

export const hideCategorySchemeDetailItemsImportFormAllCsvRows = () => ({
  type: CATEGORY_SCHEME_DETAIL_ITEMS_IMPORT_FORM_ALL_CSV_ROWS_HIDE
});

export const uploadCategorySchemeDetailItemsImportFormCsv = file => {

  let fileFormData = new FormData();
  fileFormData.append('file', file);

  return postRequest(
    CATEGORY_SCHEME_DETAIL_ITEMS_IMPORT_FORM_CSV_UPLOAD,
    getUploadFileOnServerUrl(),
    fileFormData
  );
};

export const readCategorySchemeDetailItemsImportFormAllCsvRows =
  (pageNum, pageSize, filterTable, sortCols, sortByDesc, separator, delimiter, hasHeader, filePath) => postRequest(
    CATEGORY_SCHEME_DETAIL_ITEMS_IMPORT_FORM_ALL_CSV_ROWS_READ,
    getCsvTablePreviewUrl(separator, delimiter, hasHeader, filePath, null, null),
    {
      PageNum: pageNum,
      PageSize: pageSize,
      FilterTable: filterTable,
      SortCols: sortCols,
      SortByDesc: sortByDesc,
    }
  );

export const submitCategorySchemeDetailDerivedItemSchemeCreate = (derivedCategoryScheme, derivedItems) => {

  let categories = getTreeFromArray(derivedItems, "categories");
  categories = categories.map(category => {
    return getSdmxJsonStructureFromItem(category);
  });
  categories = getMappedTree(categories, "categories", item => ({...item, parent: undefined}));

  return postRequest(
    CATEGORY_SCHEME_DETAIL_DERIVED_ITEM_SCHEME_CREATE_SUBMIT,
    getCreateArtefactsUrl(),
    getSdmxJsonFromSdmxJsonStructures(
      [getSdmxJsonStructureFromArtefact({...derivedCategoryScheme, categories: categories})],
      SDMX_JSON_CATEGORY_SCHEME_LIST_KEY
    ),
    t => ({
      success: t('reduxComponents.categorySchemeDetail.messages.create.success')
    })
  )
};

export const focusCategorySchemeDetailDerivedTab = () => ({
  type: CATEGORY_SCHEME_DETAIL_DERIVED_TAB_FOCUS
});

export const unfocusCategorySchemeDetailDerivedTab = () => ({
  type: CATEGORY_SCHEME_DETAIL_DERIVED_TAB_UNFOCUS
});

export const setCategorySchemeDetailItemsDefaultOrder = (categoryScheme, itemsTree, currLang, dataLangs, itemsOrderAnnotationType) => {

  itemsTree = getMappedTree(itemsTree, "categories", item => {
    const orderAnnotation = item.autoAnnotations.find(({type}) => type === itemsOrderAnnotationType);

    dataLangs.map(({code}) => code).forEach(lang => {
      if (lang !== currLang) {
        orderAnnotation.text[lang] = orderAnnotation.text[currLang]
      }
    });

    return item
  });

  return submitCategorySchemeDetailUpdate(categoryScheme, itemsTree, itemsOrderAnnotationType)
};