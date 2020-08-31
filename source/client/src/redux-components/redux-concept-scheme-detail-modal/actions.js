import {getRequest, postRequest, putRequest} from "../../middlewares/api/actions";
import {
  getAgencyNamesUrl,
  getCheckImportedFileCsvItemUrl,
  getConceptSchemeUrl,
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
  SDMX_JSON_CONCEPT_SCHEME_LIST_KEY,
} from "../../utils/sdmxJson";
import _ from "lodash";
import {getMappedTree, getNode, getTreeFromArray} from "../../utils/tree";
import {itemsOrderCompare, updateItemOrder} from "../../utils/artefacts";
import {normalizeItemsOrder} from "../../utils/normalizers";
import {Modal} from 'antd';
import {
  ARTEFACT_TYPE_CONCEPT_SCHEME,
  DOWNLOAD_FORMAT_TYPE_CSV,
  getArtefactDownloadFileSaveNameAndType
} from "../../constants/download";
import {removeOrderAnnotation} from "../../utils/annotations";

export const CONCEPT_SCHEME_DETAIL_READ = 'CONCEPT_SCHEME_DETAIL_READ';
export const CONCEPT_SCHEME_DETAIL_CREATE = 'CONCEPT_SCHEME_DETAIL_CREATE';
export const CONCEPT_SCHEME_DETAIL_EDIT = 'CONCEPT_SCHEME_DETAIL_EDIT';
export const CONCEPT_SCHEME_DETAIL_SHOW = 'CONCEPT_SCHEME_DETAIL_SHOW';
export const CONCEPT_SCHEME_DETAIL_CHANGE = 'CONCEPT_SCHEME_DETAIL_CHANGE';
export const CONCEPT_SCHEME_DETAIL_HIDE = 'CONCEPT_SCHEME_DETAIL_HIDE';
export const CONCEPT_SCHEME_DETAIL_CREATE_SUBMIT = 'CONCEPT_SCHEME_DETAIL_CREATE_SUBMIT';
export const CONCEPT_SCHEME_DETAIL_UPDATE_SUBMIT = 'CONCEPT_SCHEME_DETAIL_UPDATE_SUBMIT';

export const CONCEPT_SCHEME_DETAIL_AGENCIES_READ = 'CONCEPT_SCHEME_DETAIL_AGENCIES_READ';

export const CONCEPT_SCHEME_DETAIL_ITEMS_VIEW_MODE_CHANGE = 'CONCEPT_SCHEME_DETAIL_ITEMS_VIEW_MODE_CHANGE';

export const CONCEPT_SCHEME_DETAIL_ITEMS_ITEM_CREATE = 'CONCEPT_SCHEME_DETAIL_ITEMS_ITEM_CREATE';
export const CONCEPT_SCHEME_DETAIL_ITEMS_ITEM_EDIT = 'CONCEPT_SCHEME_DETAIL_ITEMS_ITEM_EDIT';
export const CONCEPT_SCHEME_DETAIL_ITEMS_ITEM_CHANGE = 'CONCEPT_SCHEME_DETAIL_ITEMS_ITEM_CHANGE';
export const CONCEPT_SCHEME_DETAIL_ITEMS_ITEM_HIDE = 'CONCEPT_SCHEME_DETAIL_ITEMS_ITEM_HIDE';
export const CONCEPT_SCHEME_DETAIL_ITEMS_ITEM_SELECT = 'CONCEPT_SCHEME_DETAIL_ITEMS_ITEM_SELECT';

export const CONCEPT_SCHEME_DETAIL_ITEMS_IMPORT_FORM_SHOW = 'CONCEPT_SCHEME_DETAIL_ITEMS_IMPORT_FORM_SHOW';
export const CONCEPT_SCHEME_DETAIL_ITEMS_IMPORT_FORM_HIDE = 'CONCEPT_SCHEME_DETAIL_ITEMS_IMPORT_FORM_HIDE';
export const CONCEPT_SCHEME_DETAIL_ITEMS_IMPORT_FORM_CHANGE = 'CONCEPT_SCHEME_DETAIL_ITEMS_IMPORT_FORM_CHANGE';
export const CONCEPT_SCHEME_DETAIL_ITEMS_IMPORT_FORM_FILE_UPLOAD = 'CONCEPT_SCHEME_DETAIL_ITEMS_IMPORT_FORM_FILE_UPLOAD';
export const CONCEPT_SCHEME_DETAIL_ITEMS_IMPORT_FORM_FILE_IMPORT = 'CONCEPT_SCHEME_DETAIL_ITEMS_IMPORT_FORM_FILE_IMPORT';
export const CONCEPT_SCHEME_DETAIL_ITEMS_IMPORT_FORM_ALL_CSV_ROWS_SHOW = 'CONCEPT_SCHEME_DETAIL_ITEMS_IMPORT_FORM_ALL_CSV_ROWS_SHOW';
export const CONCEPT_SCHEME_DETAIL_ITEMS_IMPORT_FORM_ALL_CSV_ROWS_HIDE = 'CONCEPT_SCHEME_DETAIL_ITEMS_IMPORT_FORM_ALL_CSV_ROWS_HIDE';
export const CONCEPT_SCHEME_DETAIL_ITEMS_IMPORT_FORM_CSV_UPLOAD = 'CONCEPT_SCHEME_DETAIL_ITEMS_IMPORT_FORM_CSV_UPLOAD';
export const CONCEPT_SCHEME_DETAIL_ITEMS_IMPORT_FORM_ALL_CSV_ROWS_READ = 'CONCEPT_SCHEME_DETAIL_ITEMS_IMPORT_FORM_ALL_CSV_ROWS_READ';

export const CONCEPT_SCHEME_DETAIL_ITEMS_ITEM_ANNOTATIONS_SHOW = 'CONCEPT_SCHEME_DETAIL_ITEMS_ITEM_ANNOTATIONS_SHOW';
export const CONCEPT_SCHEME_DETAIL_ITEMS_ITEM_ANNOTATIONS_HIDE = 'CONCEPT_SCHEME_DETAIL_ITEMS_ITEM_ANNOTATIONS_HIDE';
export const CONCEPT_SCHEME_DETAIL_ITEMS_ITEM_LAYOUT_ANNOTATIONS_SHOW = 'CONCEPT_SCHEME_DETAIL_ITEMS_ITEM_LAYOUT_ANNOTATIONS_SHOW';
export const CONCEPT_SCHEME_DETAIL_ITEMS_ITEM_LAYOUT_ANNOTATIONS_HIDE = 'CONCEPT_SCHEME_DETAIL_ITEMS_ITEM_LAYOUT_ANNOTATIONS_HIDE';

export const CONCEPT_SCHEME_DETAIL_ITEMS_ITEM_PARENT_LIST_SHOW = 'CONCEPT_SCHEME_DETAIL_ITEMS_ITEM_PARENT_LIST_SHOW';
export const CONCEPT_SCHEME_DETAIL_ITEMS_ITEM_PARENT_LIST_HIDE = 'CONCEPT_SCHEME_DETAIL_ITEMS_ITEM_PARENT_LIST_HIDE';
export const CONCEPT_SCHEME_DETAIL_ITEMS_ITEM_PARENT_LIST_SET = 'CONCEPT_SCHEME_DETAIL_ITEMS_ITEM_PARENT_LIST_SET';
export const CONCEPT_SCHEME_DETAIL_ITEMS_ITEM_PARENT_LIST_UNSET = 'CONCEPT_SCHEME_DETAIL_ITEMS_ITEM_PARENT_LIST_UNSET';

export const CONCEPT_SCHEME_DETAIL_LANGUAGE_CHANGE = 'CONCEPT_SCHEME_DETAIL_LANGUAGE_CHANGE';

export const CONCEPT_SCHEME_DETAIL_ITEMS_ITEM_DUPLICATE_ITEM_ERROR_SHOW = 'CONCEPT_SCHEME_DETAIL_ITEMS_ITEM_DUPLICATE_ITEM_ERROR_SHOW';
export const CONCEPT_SCHEME_DETAIL_ITEMS_ITEM_DUPLICATE_ITEM_ERROR_HIDE = 'CONCEPT_SCHEME_DETAIL_ITEMS_ITEM_DUPLICATE_ITEM_ERROR_HIDE';
export const CONCEPT_SCHEME_DETAIL_ITEMS_ITEM_CUT = 'CONCEPT_SCHEME_DETAIL_ITEMS_ITEM_CUT';

export const CONCEPT_SCHEME_DETAIL_DOWNLOAD_SHOW = 'CONCEPT_SCHEME_DETAIL_DOWNLOAD_SHOW';
export const CONCEPT_SCHEME_DETAIL_DOWNLOAD_HIDE = 'CONCEPT_SCHEME_DETAIL_DOWNLOAD_HIDE';
export const CONCEPT_SCHEME_DETAIL_DOWNLOAD_CHANGE = 'CONCEPT_SCHEME_DETAIL_DOWNLOAD_CHANGE';
export const CONCEPT_SCHEME_DETAIL_DOWNLOAD_SUBMIT = 'CONCEPT_SCHEME_DETAIL_DOWNLOAD_SUBMIT';

export const CONCEPT_SCHEME_DETAIL_CLONE_SHOW = 'CONCEPT_SCHEME_DETAIL_CLONE_SHOW';
export const CONCEPT_SCHEME_DETAIL_CLONE_HIDE = 'CONCEPT_SCHEME_DETAIL_CLONE_HIDE';
export const CONCEPT_SCHEME_DETAIL_CLONE_CHANGE = 'CONCEPT_SCHEME_DETAIL_CLONE_CHANGE';
export const CONCEPT_SCHEME_DETAIL_CLONE_SUBMIT = 'CONCEPT_SCHEME_DETAIL_CLONE_SUBMIT';

export const CONCEPT_SCHEME_DETAIL_EXPORT_SHOW = 'CONCEPT_SCHEME_DETAIL_EXPORT_SHOW';
export const CONCEPT_SCHEME_DETAIL_EXPORT_HIDE = 'CONCEPT_SCHEME_DETAIL_EXPORT_HIDE';
export const CONCEPT_SCHEME_DETAIL_EXPORT_CHANGE = 'CONCEPT_SCHEME_DETAIL_EXPORT_CHANGE';
export const CONCEPT_SCHEME_DETAIL_EXPORT_SUBMIT = 'CONCEPT_SCHEME_DETAIL_EXPORT_SUBMIT';

export const CONCEPT_SCHEME_DETAIL_EXPORT_REPORT_HIDE = 'CONCEPT_SCHEME_DETAIL_EXPORT_REPORT_HIDE';

export const CONCEPT_SCHEME_DETAIL_DERIVED_ITEM_SCHEME_CREATE_SUBMIT = 'CONCEPT_SCHEME_DETAIL_DERIVED_ITEM_SCHEME_CREATE_SUBMIT';

export const CONCEPT_SCHEME_DETAIL_DERIVED_TAB_FOCUS = 'CONCEPT_SCHEME_DETAIL_DERIVED_TAB_FOCUS';
export const CONCEPT_SCHEME_DETAIL_DERIVED_TAB_UNFOCUS = 'CONCEPT_SCHEME_DETAIL_DERIVED_TAB_UNFOCUS';

export const readConceptSchemeDetail = (conceptSchemeTriplet, itemsOrderAnnotationType, lang) => ({
  ...getRequest(
    CONCEPT_SCHEME_DETAIL_READ,
    getConceptSchemeUrl(conceptSchemeTriplet)
  ),
  itemsOrderAnnotationType,
  lang
});

export const createConceptSchemeDetail = defaultItemsViewMode => ({
  type: CONCEPT_SCHEME_DETAIL_CREATE,
  defaultItemsViewMode
});

export const editConceptSchemeDetail = (conceptSchemeTriplet, defaultItemsViewMode) => ({
  type: CONCEPT_SCHEME_DETAIL_EDIT,
  conceptSchemeTriplet,
  defaultItemsViewMode
});

export const showConceptSchemeDetail = (conceptSchemeTriplet, defaultItemsViewMode) => ({
  type: CONCEPT_SCHEME_DETAIL_SHOW,
  conceptSchemeTriplet,
  defaultItemsViewMode
});

export const changeConceptSchemeDetail = fields => ({
  type: CONCEPT_SCHEME_DETAIL_CHANGE,
  fields
});

export const submitConceptSchemeDetailCreate = (conceptScheme, conceptSchemeTriplet) => ({
  ...postRequest(
    CONCEPT_SCHEME_DETAIL_CREATE_SUBMIT,
    getCreateArtefactsUrl(),
    getSdmxJsonFromSdmxJsonStructures(
      [getSdmxJsonStructureFromArtefact(conceptScheme)],
      SDMX_JSON_CONCEPT_SCHEME_LIST_KEY
    ),
    t => ({
      success: t('reduxComponents.conceptSchemeDetail.messages.create.success')
    })
  ),
  conceptSchemeTriplet
});

export const submitConceptSchemeDetailUpdate = (conceptScheme, itemsTree, itemsOrderAnnotationType) => {

  const ret = [];
  const root = [{
    isRoot: true,
    concepts: itemsTree
  }];

  if (itemsTree) {
    getMappedTree(root, "concepts", node => {

      if (!node.isRoot) {
        const retNode = getSdmxJsonStructureFromItem(node);
        retNode.parent = undefined;
        retNode.annotations = conceptScheme.isFinal
          ? retNode.annotations
          : removeOrderAnnotation(retNode.annotations, itemsOrderAnnotationType);

        ret.push(retNode);
      }

      return node
    });
    conceptScheme = {
      ...conceptScheme,
      concepts: ret
    };
  }

  return ({
    ...putRequest(
      CONCEPT_SCHEME_DETAIL_UPDATE_SUBMIT,
      getUpdateArtefactsUrl(),
      getSdmxJsonFromSdmxJsonStructures(
        [getSdmxJsonStructureFromArtefact(conceptScheme)],
        SDMX_JSON_CONCEPT_SCHEME_LIST_KEY
      ),
      t => ({
        success: t('reduxComponents.conceptSchemeDetail.messages.update.success')
      })
    ),
    itemsTree
  });
};

export const readConceptSchemeDetailAgencies = allowedAgencies => ({
  ...getRequest(
    CONCEPT_SCHEME_DETAIL_AGENCIES_READ,
    getAgencyNamesUrl()
  ),
  allowedAgencies
});

export const changeConceptSchemeDetailItemsViewMode = viewMode => ({
  type: CONCEPT_SCHEME_DETAIL_ITEMS_VIEW_MODE_CHANGE,
  viewMode
});

export const createConceptSchemeDetailsItemsItem = (parentId, order, lang, itemsOrderAnnotationType) => ({
  type: CONCEPT_SCHEME_DETAIL_ITEMS_ITEM_CREATE,
  parentId,
  order,
  lang,
  itemsOrderAnnotationType
});

export const editConceptSchemeDetailItemsItemDetail = item => ({
  type: CONCEPT_SCHEME_DETAIL_ITEMS_ITEM_EDIT,
  item
});

export const changeConceptSchemeDetailItemsItemDetail = (fields, lang, itemsOrderAnnotationType) => ({
  type: CONCEPT_SCHEME_DETAIL_ITEMS_ITEM_CHANGE,
  fields,
  lang,
  itemsOrderAnnotationType
});

export const submitConceptSchemeDetailItemsItem =
  (conceptScheme, itemsTree, item, itemsOrderAnnotationType, isItemEditMode, lang, isNormalizeNeeded, cutItem, t) => {

    if (cutItem) {
      const parentNode = getNode(itemsTree, "concepts", node => node.id === cutItem.parent);
      if (parentNode) {
        parentNode.concepts.push(cutItem);
        parentNode.concepts.sort((a, b) => itemsOrderCompare(a, b, lang));
      } else {
        itemsTree.push(cutItem);
        itemsTree.sort((a, b) => itemsOrderCompare(a, b, lang));
      }
      Modal.info({title: t("commons.artefact.messages.nodeRestored.title")});
    }

    if (isItemEditMode || !getNode(itemsTree, "concepts", node => node.id === item.id)) {
      const root = [{
        isRoot: true,
        concepts: itemsTree
      }];

      itemsTree = getMappedTree(root, "concepts", node => {
        if (node.id === item.parent || (node.id === undefined && item.parent === null)) {
          if (isItemEditMode) {
            if (!_.find(node.concepts, child => child.id === item.id)) {
              node.concepts.push(item);
            }
            node.concepts = node.concepts.map(child => {
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
            node.concepts.push(item);
          }
          node.concepts.sort((a, b) => itemsOrderCompare(a, b, lang));
        } else {
          node.concepts = node.concepts.filter(c => c.id !== item.id);
        }
        return node
      })[0].concepts;

      // if (isNormalizeNeeded) // uncomment for performance improvement
      normalizeItemsOrder(itemsTree, "concepts", lang, itemsOrderAnnotationType);

      return submitConceptSchemeDetailUpdate(conceptScheme, itemsTree, itemsOrderAnnotationType)

    } else {
      return ({
        type: CONCEPT_SCHEME_DETAIL_ITEMS_ITEM_DUPLICATE_ITEM_ERROR_SHOW
      })
    }
  };

export const hideConceptSchemeDetailItemsItemDetail = () => ({
  type: CONCEPT_SCHEME_DETAIL_ITEMS_ITEM_HIDE,
});

export const deleteConceptSchemeDetailsItemsItem = (conceptScheme, itemsTree, item, cutItem, lang, t, itemsOrderAnnotationType) => {

  if (cutItem) {
    const parentNode = getNode(itemsTree, "concepts", node => node.id === cutItem.parent);
    if (parentNode) {
      parentNode.concepts.push(cutItem);
      parentNode.concepts.sort((a, b) => itemsOrderCompare(a, b, lang));
    } else {
      itemsTree.push(cutItem);
      itemsTree.sort((a, b) => itemsOrderCompare(a, b, lang));
    }
    Modal.info({title: t("commons.artefact.messages.nodeRestored.title")});
  }

  const root = [{
    isRoot: true,
    concepts: itemsTree
  }];

  itemsTree = item.parent
    ? getMappedTree(root, "concepts", node => {
      if (node.id === item.parent) {
        node.concepts = node.concepts.filter(child => child.id !== item.id);
      }
      return node
    })[0].concepts
    : itemsTree.filter(node => node.id !== item.id);

  return submitConceptSchemeDetailUpdate(conceptScheme, itemsTree, itemsOrderAnnotationType);
};

export const selectConceptSchemeDetailsItemsItem = id => ({
  type: CONCEPT_SCHEME_DETAIL_ITEMS_ITEM_SELECT,
  id
});

export const showConceptSchemeDetailItemsImportForm = () => ({
  type: CONCEPT_SCHEME_DETAIL_ITEMS_IMPORT_FORM_SHOW
});

export const hideConceptSchemeDetailItemsImportForm = () => ({
  type: CONCEPT_SCHEME_DETAIL_ITEMS_IMPORT_FORM_HIDE
});

export const changeConceptSchemeDetailItemsImportForm = fields => ({
  type: CONCEPT_SCHEME_DETAIL_ITEMS_IMPORT_FORM_CHANGE,
  fields
});

export const uploadConceptSchemeDetailItemsImportFormFile = (conceptScheme, itemsImportForm) => {

  let formData = new FormData();
  formData.append('file', itemsImportForm.file);
  formData.append('CustomData', JSON.stringify({
    type: 'conceptScheme',
    identity: {
      ID: conceptScheme.id,
      Agency: conceptScheme.agencyID,
      Version: conceptScheme.version
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
    CONCEPT_SCHEME_DETAIL_ITEMS_IMPORT_FORM_FILE_UPLOAD,
    getCheckImportedFileCsvItemUrl(),
    formData,
    t => ({
      success: t('commons.artefact.messages.itemsImport.fileUpload.success')
    })
  );
};

export const importConceptSchemeDetailItemsImportFormFile = (conceptScheme, itemsImportForm) => postRequest(
  CONCEPT_SCHEME_DETAIL_ITEMS_IMPORT_FORM_FILE_IMPORT,
  getImportFileCsvItemUrl(),
  {
    hashImport: itemsImportForm.hash,
    type: 'conceptScheme',
    identity: {
      ID: conceptScheme.id,
      Agency: conceptScheme.agencyID,
      Version: conceptScheme.version
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

export const hideConceptSchemeDetail = () => ({
  type: CONCEPT_SCHEME_DETAIL_HIDE
});

export const showConceptSchemeDetailItemsItemAnnotations = (annotations, itemId) => ({
  type: CONCEPT_SCHEME_DETAIL_ITEMS_ITEM_ANNOTATIONS_SHOW,
  annotations,
  itemId
});

export const hideConceptSchemeDetailItemsItemAnnotations = () => ({
  type: CONCEPT_SCHEME_DETAIL_ITEMS_ITEM_ANNOTATIONS_HIDE
});

export const showConceptSchemeDetailItemsItemLayoutAnnotations = (annotations, itemId) => ({
  type: CONCEPT_SCHEME_DETAIL_ITEMS_ITEM_LAYOUT_ANNOTATIONS_SHOW,
  annotations,
  itemId
});

export const hideConceptSchemeDetailItemsItemLayoutAnnotations = () => ({
  type: CONCEPT_SCHEME_DETAIL_ITEMS_ITEM_LAYOUT_ANNOTATIONS_HIDE
});

export const showConceptSchemeDetailItemsItemParentList = () => ({
  type: CONCEPT_SCHEME_DETAIL_ITEMS_ITEM_PARENT_LIST_SHOW
});

export const hideConceptSchemeDetailItemsItemParentList = () => ({
  type: CONCEPT_SCHEME_DETAIL_ITEMS_ITEM_PARENT_LIST_HIDE
});

export const setConceptSchemeDetailItemsItemParentList = item => ({
  type: CONCEPT_SCHEME_DETAIL_ITEMS_ITEM_PARENT_LIST_SET,
  item
});

export const unsetConceptSchemeDetailItemsItemParentList = () => ({
  type: CONCEPT_SCHEME_DETAIL_ITEMS_ITEM_PARENT_LIST_UNSET
});

export const dropConceptSchemeDetailItemsItems =
  (item, newParent, newOrder, conceptScheme, itemsTree, itemsOrderAnnotationType, lang, cutItem, t) => {

    if (cutItem) {
      const parentNode = getNode(itemsTree, "concepts", node => node.id === cutItem.parent);
      if (parentNode) {
        parentNode.concepts.push(cutItem);
        parentNode.concepts.sort((a, b) => itemsOrderCompare(a, b, lang));
      } else {
        itemsTree.push(cutItem);
        itemsTree.sort((a, b) => itemsOrderCompare(a, b, lang));
      }
      Modal.info({title: t("commons.artefact.messages.nodeRestored.title")});
    }

    const root = [{
      isRoot: true,
      concepts: itemsTree
    }];

    itemsTree = getMappedTree(root, "concepts", node => {
      if ((node.id === newParent || (node.id === null && newParent === undefined) || (node.id === undefined && newParent === null)) &&
        !_.find(node.concepts, child => child.id === item.id)) {
        node.concepts.push({...item, parent: node.id});
      }
      node.concepts.forEach(child => {
        if (child.id === item.id) {
          if (!(node.id === newParent || (node.id === null && newParent === undefined) || (node.id === undefined && newParent === null))) {
            node.concepts = node.concepts.filter(c => c.id !== child.id);
          } else {
            updateItemOrder(child, newOrder, itemsOrderAnnotationType, lang);
            node.concepts.sort((a, b) => itemsOrderCompare(a, b, lang));
          }
        }
      });
      return node;
    })[0].concepts;

    normalizeItemsOrder(itemsTree, "concepts", lang, itemsOrderAnnotationType);

    return submitConceptSchemeDetailUpdate(conceptScheme, itemsTree, itemsOrderAnnotationType)
  };

export const changeConceptSchemeDetailConceptSchemeLanguage = (lang, itemsOrderAnnotationType) => ({
  type: CONCEPT_SCHEME_DETAIL_LANGUAGE_CHANGE,
  lang,
  itemsOrderAnnotationType
});

export const hideConceptSchemeDetailItemsItemDuplicateItemError = () => ({
  type: CONCEPT_SCHEME_DETAIL_ITEMS_ITEM_DUPLICATE_ITEM_ERROR_HIDE
});

export const cutConceptSchemeDetailItemsItem = item => ({
  type: CONCEPT_SCHEME_DETAIL_ITEMS_ITEM_CUT,
  item
});

export const pasteConceptSchemeDetailItemsItem = (cutItem, newParent, pasteAfter, conceptScheme, itemsTree, lang, itemsOrderAnnotationType) => {
  if (pasteAfter) {
    const parentNode = getNode(itemsTree, "concepts", node => node.id === pasteAfter.parent);
    if (parentNode) {
      parentNode.concepts.push({
        ...cutItem,
        parent: parentNode.id,
        order: {
          ...cutItem.order,
          [lang]: String(Number(pasteAfter.order[lang]) + 0.1)
        }
      });
      parentNode.concepts.sort((a, b) => itemsOrderCompare(a, b, lang));
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
    const parentNode = getNode(itemsTree, "concepts", node => node.id === newParent.id);
    parentNode.concepts.push({...cutItem, parent: parentNode.id});
    parentNode.concepts.sort((a, b) => itemsOrderCompare(a, b, lang));
  }

  return submitConceptSchemeDetailUpdate(conceptScheme, itemsTree.splice(0), itemsOrderAnnotationType)
};

export const showConceptSchemeDetailDownload = (artefactTriplets, lang) => ({
  type: CONCEPT_SCHEME_DETAIL_DOWNLOAD_SHOW,
  artefactTriplets,
  lang
});

export const hideConceptSchemeDetailDownload = () => ({
  type: CONCEPT_SCHEME_DETAIL_DOWNLOAD_HIDE
});

export const changeConceptSchemeDetailDownload = fields => ({
  type: CONCEPT_SCHEME_DETAIL_DOWNLOAD_CHANGE,
  fields
});

export const submitConceptSchemeDetailDownload = (artefactTriplets, downloadConceptSchemeParams, lang) => {

  return (artefactTriplets && artefactTriplets.length > 1)
    ? {
      ...postRequest(
        CONCEPT_SCHEME_DETAIL_DOWNLOAD_SUBMIT,
        getMultipleDownloadArtefactUrl(
          ARTEFACT_TYPE_CONCEPT_SCHEME,
          downloadConceptSchemeParams.format,
          false,
          downloadConceptSchemeParams.compression,
          lang
        ),
        artefactTriplets.map(({id, agencyID, version}) => ({id, agency: agencyID, version})),
        undefined,
        undefined,
        true
      ),
      fileSave: getArtefactDownloadFileSaveNameAndType(
        artefactTriplets,
        ARTEFACT_TYPE_CONCEPT_SCHEME,
        downloadConceptSchemeParams.format,
        downloadConceptSchemeParams.compression
      )
    }
    : {
      ...getRequest(
        CONCEPT_SCHEME_DETAIL_DOWNLOAD_SUBMIT,
        getDownloadArtefactUrl(
          ARTEFACT_TYPE_CONCEPT_SCHEME,
          artefactTriplets[0],
          downloadConceptSchemeParams.format,
          false,
          downloadConceptSchemeParams.compression,
          downloadConceptSchemeParams.format === DOWNLOAD_FORMAT_TYPE_CSV
            ? downloadConceptSchemeParams.csvLanguage
            : lang,
          downloadConceptSchemeParams.format === DOWNLOAD_FORMAT_TYPE_CSV
            ? downloadConceptSchemeParams.csvSeparator
            : null,
          downloadConceptSchemeParams.format === DOWNLOAD_FORMAT_TYPE_CSV
            ? downloadConceptSchemeParams.csvDelimiter
            : null
        ),
        undefined,
        true
      ),
      fileSave: getArtefactDownloadFileSaveNameAndType(
        artefactTriplets,
        ARTEFACT_TYPE_CONCEPT_SCHEME,
        downloadConceptSchemeParams.format,
        downloadConceptSchemeParams.compression,
        downloadConceptSchemeParams.csvLanguage
      )
    }
};

export const showConceptSchemeDetailClone = srcTriplet => ({
  type: CONCEPT_SCHEME_DETAIL_CLONE_SHOW,
  srcTriplet
});

export const hideConceptSchemeDetailClone = () => ({
  type: CONCEPT_SCHEME_DETAIL_CLONE_HIDE
});

export const changeConceptSchemeDetailClone = fields => ({
  type: CONCEPT_SCHEME_DETAIL_CLONE_CHANGE,
  fields
});

export const submitConceptSchemeDetailClone = (cloneDestTriplet, srcConceptScheme, srcConceptSchemeItemsTree) => {


  let concepts = undefined;
  if (srcConceptSchemeItemsTree) {
    concepts = srcConceptSchemeItemsTree.map(node => {
      node.parent = undefined;
      return getSdmxJsonStructureFromItem(node);
    });
  }

  return postRequest(
    CONCEPT_SCHEME_DETAIL_CLONE_SUBMIT,
    getCreateArtefactsUrl(),
    getSdmxJsonFromSdmxJsonStructures(
      [
        getSdmxJsonStructureFromArtefact({
          ...srcConceptScheme,
          ...cloneDestTriplet,
          concepts,
          isFinal: false,
          autoAnnotations: null
        })
      ],
      SDMX_JSON_CONCEPT_SCHEME_LIST_KEY
    ),
    t => ({
      success: t('commons.artefact.messages.clone.success')
    })
  );
};

export const showConceptSchemeDetailExport = sourceTriplet => ({
  type: CONCEPT_SCHEME_DETAIL_EXPORT_SHOW,
  sourceTriplet
});

export const hideConceptSchemeDetailExport = () => ({
  type: CONCEPT_SCHEME_DETAIL_EXPORT_HIDE
});

export const changeConceptSchemeDetailExport = fields => ({
  type: CONCEPT_SCHEME_DETAIL_EXPORT_CHANGE,
  fields
});

export const submitConceptSchemeDetailExport = (sourceTriplet, destination) => postRequest(
  CONCEPT_SCHEME_DETAIL_EXPORT_SUBMIT,
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
    EnumType: "ConceptScheme",
    CopyReferencedArtefact: false
  }
);

export const hideConceptSchemeDetailExportReport = () => ({
  type: CONCEPT_SCHEME_DETAIL_EXPORT_REPORT_HIDE
});

export const showConceptSchemeDetailItemsImportFormAllCsvRows = () => ({
  type: CONCEPT_SCHEME_DETAIL_ITEMS_IMPORT_FORM_ALL_CSV_ROWS_SHOW
});

export const hideConceptSchemeDetailItemsImportFormAllCsvRows = () => ({
  type: CONCEPT_SCHEME_DETAIL_ITEMS_IMPORT_FORM_ALL_CSV_ROWS_HIDE
});

export const uploadConceptSchemeDetailItemsImportFormCsv = file => {

  let fileFormData = new FormData();
  fileFormData.append('file', file);

  return postRequest(
    CONCEPT_SCHEME_DETAIL_ITEMS_IMPORT_FORM_CSV_UPLOAD,
    getUploadFileOnServerUrl(),
    fileFormData
  );
};

export const readConceptSchemeDetailItemsImportFormAllCsvRows =
  (pageNum, pageSize, filterTable, sortCols, sortByDesc, separator, delimiter, hasHeader, filePath) => postRequest(
    CONCEPT_SCHEME_DETAIL_ITEMS_IMPORT_FORM_ALL_CSV_ROWS_READ,
    getCsvTablePreviewUrl(separator, delimiter, hasHeader, filePath, null, null),
    {
      PageNum: pageNum,
      PageSize: pageSize,
      FilterTable: filterTable,
      SortCols: sortCols,
      SortByDesc: sortByDesc,
    }
  );

export const submitConceptSchemeDetailDerivedItemSchemeCreate = (derivedConceptScheme, derivedItems) => {

  let concepts = getTreeFromArray(derivedItems, "concepts");
  concepts = concepts.map(concept => {
    return getSdmxJsonStructureFromItem(concept);
  });

  return postRequest(
    CONCEPT_SCHEME_DETAIL_DERIVED_ITEM_SCHEME_CREATE_SUBMIT,
    getCreateArtefactsUrl(),
    getSdmxJsonFromSdmxJsonStructures(
      [getSdmxJsonStructureFromArtefact({...derivedConceptScheme, concepts: concepts})],
      SDMX_JSON_CONCEPT_SCHEME_LIST_KEY
    ),
    t => ({
      success: t('reduxComponents.conceptSchemeDetail.messages.create.success')
    })
  )
};

export const focusConceptSchemeDetailDerivedTab = () => ({
  type: CONCEPT_SCHEME_DETAIL_DERIVED_TAB_FOCUS
});

export const unfocusConceptSchemeDetailDerivedTab = () => ({
  type: CONCEPT_SCHEME_DETAIL_DERIVED_TAB_UNFOCUS
});

export const setConceptSchemeDetailItemsDefaultOrder = (conceptScheme, itemsTree, currLang, dataLangs, itemsOrderAnnotationType) => {

  itemsTree = getMappedTree(itemsTree, "concepts", item => {
    const orderAnnotation = item.autoAnnotations.find(({type}) => type === itemsOrderAnnotationType);

    dataLangs.map(({code}) => code).forEach(lang => {
      if (lang !== currLang) {
        orderAnnotation.text[lang] = orderAnnotation.text[currLang]
      }
    });

    return item
  });

  return submitConceptSchemeDetailUpdate(conceptScheme, itemsTree, itemsOrderAnnotationType)
};