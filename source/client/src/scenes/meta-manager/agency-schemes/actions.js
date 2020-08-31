import {
  allRequest,
  deleteRequest,
  getRequest,
  postRequest,
  putRequest,
  REQUEST_METHOD_DELETE
} from "../../../middlewares/api/actions";
import {
  getAddAgencyToConfigUrl,
  getAgencyNamesUrl,
  getAgencySchemeUrl,
  getCheckImportedFileCsvItemUrl,
  getCreateArtefactsUrl,
  getCsvTablePreviewUrl,
  getDeleteArtefactUrl,
  getDownloadArtefactUrl,
  getExportArtefactUrl,
  getImportFileCsvItemUrl,
  getMultipleDownloadArtefactUrl,
  getUpdateArtefactsUrl,
  getUploadFileOnServerUrl
} from "../../../constants/urls";
import {
  getSdmxJsonFromSdmxJsonStructures,
  getSdmxJsonStructureFromArtefact,
  getSdmxJsonStructureFromItem,
  getStringFromArtefactTriplet,
  SDMX_JSON_AGENCY_SCHEME_LIST_KEY,
} from "../../../utils/sdmxJson";
import _ from "lodash";
import {getMappedTree, getNode} from "../../../utils/tree";
import {itemsOrderCompare, updateItemOrder} from "../../../utils/artefacts";
import {normalizeItemsOrder} from "../../../utils/normalizers";
import {Modal} from 'antd';
import {
  ARTEFACT_TYPE_AGENCY_SCHEME,
  DOWNLOAD_FORMAT_TYPE_CSV,
  getArtefactDownloadFileSaveNameAndType
} from "../../../constants/download";
import {removeOrderAnnotation} from "../../../utils/annotations";
import {SUPER_USER_LOGIN_FORM_SHOW} from "../../../middlewares/authentication/actions";
import {DATA_INDEX_ORIGINAL_ROW} from "../../../components/infinite-scroll-table/contants";

export const AGENCY_SCHEMES_LIST_AGENCY_SCHEMES_READ = 'AGENCY_SCHEMES_LIST_AGENCY_SCHEMES_READ';
export const AGENCY_SCHEMES_AGENCY_SCHEME_CREATE = 'AGENCY_SCHEMES_AGENCY_SCHEME_CREATE';
export const AGENCY_SCHEMES_AGENCY_SCHEME_EDIT = 'AGENCY_SCHEMES_AGENCY_SCHEME_EDIT';
export const AGENCY_SCHEMES_AGENCY_SCHEME_DELETE = 'AGENCY_SCHEMES_AGENCY_SCHEME_DELETE';
export const AGENCY_SCHEMES_DETAIL_AGENCY_SCHEME_READ = 'AGENCY_SCHEMES_DETAIL_AGENCY_SCHEME_READ';
export const AGENCY_SCHEMES_DETAIL_AGENCY_SCHEME_CHANGE = 'AGENCY_SCHEMES_DETAIL_AGENCY_SCHEME_CHANGE';
export const AGENCY_SCHEMES_DETAIL_AGENCY_SCHEME_CREATE_SUBMIT = 'AGENCY_SCHEMES_DETAIL_AGENCY_SCHEME_CREATE_SUBMIT';
export const AGENCY_SCHEMES_DETAIL_AGENCY_SCHEME_UPDATE_SUBMIT = 'AGENCY_SCHEMES_DETAIL_AGENCY_SCHEME_UPDATE_SUBMIT';
export const AGENCY_SCHEMES_DETAIL_AGENCIES_READ = 'AGENCY_SCHEMES_DETAIL_AGENCIES_READ';
export const AGENCY_SCHEMES_DETAIL_ITEMS_VIEW_MODE_CHANGE = 'AGENCY_SCHEMES_DETAIL_ITEMS_VIEW_MODE_CHANGE';
export const AGENCY_SCHEMES_DETAIL_ITEMS_ITEM_CREATE = 'AGENCY_SCHEMES_DETAIL_ITEMS_ITEM_CREATE';
export const AGENCY_SCHEMES_DETAIL_ITEMS_ITEM_DETAIL_EDIT = 'AGENCY_SCHEMES_DETAIL_ITEMS_ITEM_DETAIL_EDIT';
export const AGENCY_SCHEMES_DETAIL_ITEMS_ITEM_DETAIL_CHANGE = 'AGENCY_SCHEMES_DETAIL_ITEMS_ITEM_DETAIL_CHANGE';
export const AGENCY_SCHEMES_DETAIL_ITEMS_ITEM_DETAIL_HIDE = 'AGENCY_SCHEMES_DETAIL_ITEMS_ITEM_DETAIL_HIDE';
export const AGENCY_SCHEMES_DETAIL_ITEMS_ITEM_SELECT = 'AGENCY_SCHEMES_DETAIL_ITEMS_ITEM_SELECT';
export const AGENCY_SCHEMES_DETAIL_ITEMS_IMPORT_FORM_SHOW = 'AGENCY_SCHEMES_DETAIL_ITEMS_IMPORT_FORM_SHOW';
export const AGENCY_SCHEMES_DETAIL_ITEMS_IMPORT_FORM_HIDE = 'AGENCY_SCHEMES_DETAIL_ITEMS_IMPORT_FORM_HIDE';
export const AGENCY_SCHEMES_DETAIL_ITEMS_IMPORT_FORM_ALL_CSV_ROWS_SHOW = 'AGENCY_SCHEMES_DETAIL_ITEMS_IMPORT_FORM_ALL_CSV_ROWS_SHOW';
export const AGENCY_SCHEMES_DETAIL_ITEMS_IMPORT_FORM_ALL_CSV_ROWS_HIDE = 'AGENCY_SCHEMES_DETAIL_ITEMS_IMPORT_FORM_ALL_CSV_ROWS_HIDE';
export const AGENCY_SCHEMES_DETAIL_ITEMS_IMPORT_FORM_CSV_UPLOAD = 'AGENCY_SCHEMES_DETAIL_ITEMS_IMPORT_FORM_CSV_UPLOAD';
export const AGENCY_SCHEMES_DETAIL_ITEMS_IMPORT_FORM_ALL_CSV_ROWS_READ = 'AGENCY_SCHEMES_DETAIL_ITEMS_IMPORT_FORM_ALL_CSV_ROWS_READ';
export const AGENCY_SCHEMES_DETAIL_ITEMS_IMPORT_FORM_CHANGE = 'AGENCY_SCHEMES_DETAIL_ITEMS_IMPORT_FORM_CHANGE';
export const AGENCY_SCHEMES_DETAIL_ITEMS_IMPORT_FORM_FILE_UPLOAD = 'AGENCY_SCHEMES_DETAIL_ITEMS_IMPORT_FORM_FILE_UPLOAD';
export const AGENCY_SCHEMES_DETAIL_ITEMS_IMPORT_FORM_FILE_IMPORT = 'AGENCY_SCHEMES_DETAIL_ITEMS_IMPORT_FORM_FILE_IMPORT';
export const AGENCY_SCHEMES_DETAIL_HIDE = 'AGENCY_SCHEMES_DETAIL_HIDE';
export const AGENCY_SCHEMES_DETAIL_ITEMS_ITEM_ANNOTATIONS_SHOW = 'AGENCY_SCHEMES_DETAIL_ITEMS_ITEM_ANNOTATIONS_SHOW';
export const AGENCY_SCHEMES_DETAIL_ITEMS_ITEM_ANNOTATIONS_HIDE = 'AGENCY_SCHEMES_DETAIL_ITEMS_ITEM_ANNOTATIONS_HIDE';
export const AGENCY_SCHEMES_DETAIL_ITEMS_ITEM_LAYOUT_ANNOTATIONS_SHOW = 'AGENCY_SCHEMES_DETAIL_ITEMS_ITEM_LAYOUT_ANNOTATIONS_SHOW';
export const AGENCY_SCHEMES_DETAIL_ITEMS_ITEM_LAYOUT_ANNOTATIONS_HIDE = 'AGENCY_SCHEMES_DETAIL_ITEMS_ITEM_LAYOUT_ANNOTATIONS_HIDE';
export const AGENCY_SCHEMES_DETAIL_ANNOTATIONS_SHOW = 'AGENCY_SCHEMES_DETAIL_ANNOTATIONS_SHOW';
export const AGENCY_SCHEMES_DETAIL_ANNOTATIONS_HIDE = 'AGENCY_SCHEMES_DETAIL_ANNOTATIONS_HIDE';
export const AGENCY_SCHEMES_SELECTED_AGENCY_SCHEMES_DELETE = 'AGENCY_SCHEMES_SELECTED_AGENCY_SCHEMES_DELETE';
export const AGENCY_SCHEMES_DETAIL_AGENCY_SCHEME_LANGUAGE_CHANGE = 'AGENCY_SCHEMES_DETAIL_AGENCY_SCHEME_LANGUAGE_CHANGE';
export const AGENCY_SCHEMES_DETAIL_ITEMS_ITEM_DUPLICATE_ITEM_ERROR_SHOW = 'AGENCY_SCHEMES_DETAIL_ITEMS_ITEM_DUPLICATE_ITEM_ERROR_SHOW';
export const AGENCY_SCHEMES_DETAIL_ITEMS_ITEM_DUPLICATE_ITEM_ERROR_HIDE = 'AGENCY_SCHEMES_DETAIL_ITEMS_ITEM_DUPLICATE_ITEM_ERROR_HIDE';
export const AGENCY_SCHEMES_DETAIL_ITEMS_ITEM_CUT = 'AGENCY_SCHEMES_DETAIL_ITEMS_ITEM_CUT';
export const AGENCY_SCHEMES_AGENCY_SCHEME_DOWNLOAD_SHOW = 'AGENCY_SCHEMES_AGENCY_SCHEME_DOWNLOAD_SHOW';
export const AGENCY_SCHEMES_AGENCY_SCHEME_DOWNLOAD_HIDE = 'AGENCY_SCHEMES_AGENCY_SCHEME_DOWNLOAD_HIDE';
export const AGENCY_SCHEMES_AGENCY_SCHEME_DOWNLOAD_CHANGE = 'AGENCY_SCHEMES_AGENCY_SCHEME_DOWNLOAD_CHANGE';
export const AGENCY_SCHEMES_AGENCY_SCHEME_DOWNLOAD = 'AGENCY_SCHEMES_AGENCY_SCHEME_DOWNLOAD';
export const AGENCY_SCHEMES_AGENCY_SCHEME_CLONE_SHOW = 'AGENCY_SCHEMES_AGENCY_SCHEME_CLONE_SHOW';
export const AGENCY_SCHEMES_AGENCY_SCHEME_CLONE_HIDE = 'AGENCY_SCHEMES_AGENCY_SCHEME_CLONE_HIDE';
export const AGENCY_SCHEMES_AGENCY_SCHEME_CLONE_CHANGE = 'AGENCY_SCHEMES_AGENCY_SCHEME_CLONE_CHANGE';
export const AGENCY_SCHEMES_AGENCY_SCHEME_CLONE_SUBMIT = 'AGENCY_SCHEMES_AGENCY_SCHEME_CLONE_SUBMIT';
export const AGENCY_SCHEMES_AGENCY_SCHEME_EXPORT_SHOW = 'AGENCY_SCHEMES_AGENCY_SCHEME_EXPORT_SHOW';
export const AGENCY_SCHEMES_AGENCY_SCHEME_EXPORT_HIDE = 'AGENCY_SCHEMES_AGENCY_SCHEME_EXPORT_HIDE';
export const AGENCY_SCHEMES_AGENCY_SCHEME_EXPORT_CHANGE = 'AGENCY_SCHEMES_AGENCY_SCHEME_EXPORT_CHANGE';
export const AGENCY_SCHEMES_AGENCY_SCHEME_EXPORT_SUBMIT = 'AGENCY_SCHEMES_AGENCY_SCHEME_EXPORT_SUBMIT';
export const AGENCY_SCHEMES_AGENCY_SCHEME_EXPORT_REPORT_HIDE = 'AGENCY_SCHEMES_AGENCY_SCHEME_EXPORT_REPORT_HIDE';
export const AGENCY_SCHEMES_DETAIL_ITEMS_ITEM_ADD_TO_CONFIG = 'AGENCY_SCHEMES_DETAIL_ITEMS_ITEM_ADD_TO_CONFIG';

export const readAgencySchemesListAgencySchemes = () => getRequest(
  AGENCY_SCHEMES_LIST_AGENCY_SCHEMES_READ,
  getAgencySchemeUrl()
);

export const createAgencySchemesAgencyScheme = defaultItemsViewMode => ({
  type: AGENCY_SCHEMES_AGENCY_SCHEME_CREATE,
  defaultItemsViewMode
});

export const editAgencySchemesAgencyScheme = (agencySchemeTriplet, defaultItemsViewMode) => ({
  type: AGENCY_SCHEMES_AGENCY_SCHEME_EDIT,
  agencySchemeTriplet,
  defaultItemsViewMode
});

export const deleteAgencySchemesAgencyScheme = agencySchemeTriplet => deleteRequest(
  AGENCY_SCHEMES_AGENCY_SCHEME_DELETE,
  getDeleteArtefactUrl("AgencyScheme", agencySchemeTriplet),
  t => ({
    success: t('scenes.metaManager.commons.messages.delete.success')
  })
);

export const readAgencySchemesDetailAgencyScheme = (agencySchemeTriplet, itemsOrderAnnotationType, lang) => ({
  ...getRequest(
    AGENCY_SCHEMES_DETAIL_AGENCY_SCHEME_READ,
    getAgencySchemeUrl(agencySchemeTriplet)
  ),
  itemsOrderAnnotationType,
  lang
});

export const changeAgencySchemesDetailAgencyScheme = fields => ({
  type: AGENCY_SCHEMES_DETAIL_AGENCY_SCHEME_CHANGE,
  fields
});

export const submitAgencySchemesDetailAgencySchemeCreate = (agencyScheme, agencySchemeTriplet) => {
  return ({
    ...postRequest(
      AGENCY_SCHEMES_DETAIL_AGENCY_SCHEME_CREATE_SUBMIT,
      getCreateArtefactsUrl(),
      getSdmxJsonFromSdmxJsonStructures(
        [getSdmxJsonStructureFromArtefact(agencyScheme)],
        SDMX_JSON_AGENCY_SCHEME_LIST_KEY
      ),
      t => ({
        success: t('scenes.metaManager.agencySchemes.messages.create.success')
      })
    ),
    agencySchemeTriplet
  })
};

export const submitAgencySchemesDetailAgencySchemeUpdate = (agencyScheme, itemsTree, itemsOrderAnnotationType) => {

  const ret = [];
  const root = [{
    isRoot: true,
    agencies: itemsTree
  }];

  if (itemsTree) {
    getMappedTree(root, "agencies", node => {

      if (!node.isRoot) {
        const retNode = getSdmxJsonStructureFromItem(node);
        retNode.parent = undefined;
        retNode.annotations = agencyScheme.isFinal
          ? retNode.annotations
          : removeOrderAnnotation(retNode.annotations, itemsOrderAnnotationType);

        ret.push(retNode);
      }

      return node
    });
    agencyScheme = {
      ...agencyScheme,
      agencies: ret
    };
  }

  return ({
    ...putRequest(
      AGENCY_SCHEMES_DETAIL_AGENCY_SCHEME_UPDATE_SUBMIT,
      getUpdateArtefactsUrl(),
      getSdmxJsonFromSdmxJsonStructures(
        [getSdmxJsonStructureFromArtefact(agencyScheme)],
        SDMX_JSON_AGENCY_SCHEME_LIST_KEY
      ),
      t => ({
        success: t('scenes.metaManager.agencySchemes.messages.update.success')
      })
    ),
    itemsTree
  });
};

export const readAgencySchemesDetailAgencies = allowedAgencies => ({
  ...getRequest(
    AGENCY_SCHEMES_DETAIL_AGENCIES_READ,
    getAgencyNamesUrl()
  ),
  allowedAgencies
});

export const changeAgencySchemesDetailItemsViewMode = viewMode => ({
  type: AGENCY_SCHEMES_DETAIL_ITEMS_VIEW_MODE_CHANGE,
  viewMode
});

export const createAgencySchemesDetailsItemsItem = (parentId, order, lang, itemsOrderAnnotationType) => ({
  type: AGENCY_SCHEMES_DETAIL_ITEMS_ITEM_CREATE,
  parentId,
  order,
  lang,
  itemsOrderAnnotationType
});

export const editAgencySchemesDetailItemsItemDetail = item => ({
  type: AGENCY_SCHEMES_DETAIL_ITEMS_ITEM_DETAIL_EDIT,
  item
});

export const changeAgencySchemesDetailItemsItemDetail = (fields, lang, itemsOrderAnnotationType) => ({
  type: AGENCY_SCHEMES_DETAIL_ITEMS_ITEM_DETAIL_CHANGE,
  fields,
  lang,
  itemsOrderAnnotationType
});

export const submitAgencySchemesDetailItemsItem =
  (agencyScheme, itemsTree, item, itemsOrderAnnotationType, isItemEditMode, lang, isNormalizeNeeded, cutItem, t) => {

    if (cutItem) {
      const parentNode = getNode(itemsTree, "agencies", node => node.id === cutItem.parent);
      if (parentNode) {
        parentNode.agencies.push(cutItem);
        parentNode.agencies.sort((a, b) => itemsOrderCompare(a, b, lang));
      } else {
        itemsTree.push(cutItem);
        itemsTree.sort((a, b) => itemsOrderCompare(a, b, lang));
      }
      Modal.info({title: t("commons.artefact.messages.nodeRestored.title")});
    }

    if (isItemEditMode || !getNode(itemsTree, "agencies", node => node.id === item.id)) {
      const root = [{
        isRoot: true,
        agencies: itemsTree
      }];

      itemsTree = getMappedTree(root, "agencies", node => {
        if (node.id === item.parent || (node.id === undefined && item.parent === null)) {
          if (isItemEditMode) {
            if (!_.find(node.agencies, child => child.id === item.id)) {
              node.agencies.push(item);
            }
            node.agencies = node.agencies.map(child => {
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
            node.agencies.push(item);
          }
          node.agencies.sort((a, b) => itemsOrderCompare(a, b, lang));
        } else {
          node.agencies = node.agencies.filter(c => c.id !== item.id);
        }
        return node
      })[0].agencies;

      // if (isNormalizeNeeded) // uncomment for performance improvement
      normalizeItemsOrder(itemsTree, "agencies", lang, itemsOrderAnnotationType);

      return submitAgencySchemesDetailAgencySchemeUpdate(agencyScheme, itemsTree, itemsOrderAnnotationType)

    } else {
      return ({
        type: AGENCY_SCHEMES_DETAIL_ITEMS_ITEM_DUPLICATE_ITEM_ERROR_SHOW
      })
    }
  };

export const hideAgencySchemesDetailItemsItemDetail = () => ({
  type: AGENCY_SCHEMES_DETAIL_ITEMS_ITEM_DETAIL_HIDE,
});

export const deleteAgencySchemesDetailsItemsItem = (agencyScheme, itemsTree, item, cutItem, lang, t, itemsOrderAnnotationType) => {

  if (cutItem) {
    const parentNode = getNode(itemsTree, "agencies", node => node.id === cutItem.parent);
    if (parentNode) {
      parentNode.agencies.push(cutItem);
      parentNode.agencies.sort((a, b) => itemsOrderCompare(a, b, lang));
    } else {
      itemsTree.push(cutItem);
      itemsTree.sort((a, b) => itemsOrderCompare(a, b, lang));
    }
    Modal.info({title: t("commons.artefact.messages.nodeRestored.title")});
  }

  const root = [{
    isRoot: true,
    agencies: itemsTree
  }];

  itemsTree = item.parent
    ? getMappedTree(root, "agencies", node => {
      if (node.id === item.parent) {
        node.agencies = node.agencies.filter(child => child.id !== item.id);
      }
      return node
    })[0].agencies
    : itemsTree.filter(node => node.id !== item.id);

  return submitAgencySchemesDetailAgencySchemeUpdate(agencyScheme, itemsTree, itemsOrderAnnotationType);
};

export const selectAgencySchemesDetailsItemsItem = id => ({
  type: AGENCY_SCHEMES_DETAIL_ITEMS_ITEM_SELECT,
  id
});

export const showAgencySchemesDetailItemsImportForm = () => ({
  type: AGENCY_SCHEMES_DETAIL_ITEMS_IMPORT_FORM_SHOW
});

export const hideAgencySchemesDetailItemsImportForm = () => ({
  type: AGENCY_SCHEMES_DETAIL_ITEMS_IMPORT_FORM_HIDE
});

export const changeAgencySchemesDetailItemsImportForm = fields => ({
  type: AGENCY_SCHEMES_DETAIL_ITEMS_IMPORT_FORM_CHANGE,
  fields
});

export const uploadAgencySchemesDetailItemsImportFormFile = (agencyScheme, itemsImportForm) => {

  let formData = new FormData();
  formData.append('file', itemsImportForm.file);
  formData.append('CustomData', JSON.stringify({
    type: 'agencyScheme',
    identity: {
      ID: agencyScheme.id,
      Agency: agencyScheme.agencyID,
      Version: agencyScheme.version
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
          : -1,
      }),
    textSeparator: itemsImportForm.separator,
    textDelimiter: itemsImportForm.delimiter,
  }));

  return postRequest(
    AGENCY_SCHEMES_DETAIL_ITEMS_IMPORT_FORM_FILE_UPLOAD,
    getCheckImportedFileCsvItemUrl(),
    formData,
    t => ({
      success: t('commons.artefact.messages.itemsImport.fileUpload.success')
    })
  );
};

export const importAgencySchemesDetailItemsImportFormFile = (agencyScheme, itemsImportForm) => postRequest(
  AGENCY_SCHEMES_DETAIL_ITEMS_IMPORT_FORM_FILE_IMPORT,
  getImportFileCsvItemUrl(),
  {
    hashImport: itemsImportForm.hash,
    type: 'agencyScheme',
    identity: {
      ID: agencyScheme.id,
      Agency: agencyScheme.agencyID,
      Version: agencyScheme.version
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
          : -1,
      }),
    textSeparator: itemsImportForm.separator,
    textDelimiter: itemsImportForm.delimiter,
  },
  t => ({
    success: t('commons.artefact.messages.itemsImport.fileImport.success')
  })
);

export const hideAgencySchemesDetail = () => ({
  type: AGENCY_SCHEMES_DETAIL_HIDE
});

export const showAgencySchemesDetailItemsItemAnnotations = annotations => ({
  type: AGENCY_SCHEMES_DETAIL_ITEMS_ITEM_ANNOTATIONS_SHOW,
  annotations
});

export const hideAgencySchemesDetailItemsItemAnnotations = () => ({
  type: AGENCY_SCHEMES_DETAIL_ITEMS_ITEM_ANNOTATIONS_HIDE
});

export const showAgencySchemesDetailItemsItemLayoutAnnotations = annotations => ({
  type: AGENCY_SCHEMES_DETAIL_ITEMS_ITEM_LAYOUT_ANNOTATIONS_SHOW,
  annotations
});

export const hideAgencySchemesDetailItemsItemLayoutAnnotations = () => ({
  type: AGENCY_SCHEMES_DETAIL_ITEMS_ITEM_LAYOUT_ANNOTATIONS_HIDE
});

export const showAgencySchemesDetailAnnotations = (annotations, triplet) => ({
  type: AGENCY_SCHEMES_DETAIL_ANNOTATIONS_SHOW,
  annotations,
  triplet
});

export const hideAgencySchemesDetailAnnotations = () => ({
  type: AGENCY_SCHEMES_DETAIL_ANNOTATIONS_HIDE
});

export const deleteAgencySchemesSelectedAgencySchemes = agencySchemeTriplets => allRequest(
  AGENCY_SCHEMES_SELECTED_AGENCY_SCHEMES_DELETE,
  agencySchemeTriplets.map(() => REQUEST_METHOD_DELETE),
  agencySchemeTriplets.map(triplet => getDeleteArtefactUrl("AgencyScheme", triplet)),
  null,
  t => ({
    success: t('scenes.metaManager.commons.messages.multiDelete.success')
  }),
  agencySchemeTriplets.map(getStringFromArtefactTriplet),
  true
);

export const dropAgencySchemesDetailItemsItems =
  (item, newParent, newOrder, agencyScheme, itemsTree, itemsOrderAnnotationType, lang, cutItem, t) => {

    if (cutItem) {
      const parentNode = getNode(itemsTree, "agencies", node => node.id === cutItem.parent);
      if (parentNode) {
        parentNode.agencies.push(cutItem);
        parentNode.agencies.sort((a, b) => itemsOrderCompare(a, b, lang));
      } else {
        itemsTree.push(cutItem);
        itemsTree.sort((a, b) => itemsOrderCompare(a, b, lang));
      }
      Modal.info({title: t("commons.artefact.messages.nodeRestored.title")});
    }

    const root = [{
      isRoot: true,
      agencies: itemsTree
    }];

    itemsTree = getMappedTree(root, "agencies", node => {
      if ((node.id === newParent || (node.id === null && newParent === undefined) || (node.id === undefined && newParent === null)) &&
        !_.find(node.agencies, child => child.id === item.id)) {
        node.agencies.push({...item, parent: node.id});
      }
      node.agencies.forEach(child => {
        if (child.id === item.id) {
          if (!(node.id === newParent || (node.id === null && newParent === undefined) || (node.id === undefined && newParent === null))) {
            node.agencies = node.agencies.filter(c => c.id !== child.id);
          } else {
            updateItemOrder(child, newOrder, itemsOrderAnnotationType, lang);
            node.agencies.sort((a, b) => itemsOrderCompare(a, b, lang));
          }
        }
      });
      return node;
    })[0].agencies;

    normalizeItemsOrder(itemsTree, "agencies", lang, itemsOrderAnnotationType);

    return submitAgencySchemesDetailAgencySchemeUpdate(agencyScheme, itemsTree, itemsOrderAnnotationType)
  };

export const changeAgencySchemesDetailAgencySchemeLanguage = (lang, itemsOrderAnnotationType) => ({
  type: AGENCY_SCHEMES_DETAIL_AGENCY_SCHEME_LANGUAGE_CHANGE,
  lang,
  itemsOrderAnnotationType
});

export const hideAgencySchemeDetailItemsItemDuplicateItemError = () => ({
  type: AGENCY_SCHEMES_DETAIL_ITEMS_ITEM_DUPLICATE_ITEM_ERROR_HIDE
});

export const cutAgencySchemesDetailItemsItem = item => ({
  type: AGENCY_SCHEMES_DETAIL_ITEMS_ITEM_CUT,
  item
});

export const pasteAgencySchemesDetailItemsItem = (cutItem, newParent, pasteAfter, agencyScheme, itemsTree, lang, itemsOrderAnnotationType) => {
  if (pasteAfter) {
    const parentNode = getNode(itemsTree, "agencies", node => node.id === pasteAfter.parent);
    if (parentNode) {
      parentNode.agencies.push({
        ...cutItem,
        parent: parentNode.id,
        order: {
          ...cutItem.order,
          [lang]: String(Number(pasteAfter.order[lang]) + 0.1)
        }
      });
      parentNode.agencies.sort((a, b) => itemsOrderCompare(a, b, lang));
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
    const parentNode = getNode(itemsTree, "agencies", node => node.id === newParent.id);
    parentNode.agencies.push({...cutItem, parent: parentNode.id});
    parentNode.agencies.sort((a, b) => itemsOrderCompare(a, b, lang));
  }

  return submitAgencySchemesDetailAgencySchemeUpdate(agencyScheme, itemsTree.splice(0), itemsOrderAnnotationType)
};

export const showAgencySchemesAgencySchemeDownload = (artefactTriplets, lang) => ({
  type: AGENCY_SCHEMES_AGENCY_SCHEME_DOWNLOAD_SHOW,
  artefactTriplets,
  lang
});

export const hideAgencySchemesAgencySchemeDownload = () => ({
  type: AGENCY_SCHEMES_AGENCY_SCHEME_DOWNLOAD_HIDE
});

export const changeAgencySchemesAgencySchemeDownload = fields => ({
  type: AGENCY_SCHEMES_AGENCY_SCHEME_DOWNLOAD_CHANGE,
  fields
});

export const downloadAgencySchemesAgencyScheme = (artefactTriplets, downloadAgencySchemeParams, lang) => {

  return (artefactTriplets && artefactTriplets.length > 1)
    ? {
      ...postRequest(
        AGENCY_SCHEMES_AGENCY_SCHEME_DOWNLOAD,
        getMultipleDownloadArtefactUrl(
          ARTEFACT_TYPE_AGENCY_SCHEME,
          downloadAgencySchemeParams.format,
          false,
          downloadAgencySchemeParams.compression,
          lang
        ),
        artefactTriplets.map(({id, agencyID, version}) => ({id, agency: agencyID, version})),
        undefined,
        undefined,
        true
      ),
      fileSave: getArtefactDownloadFileSaveNameAndType(
        artefactTriplets,
        ARTEFACT_TYPE_AGENCY_SCHEME,
        downloadAgencySchemeParams.format,
        downloadAgencySchemeParams.compression
      )
    }
    : {
      ...getRequest(
        AGENCY_SCHEMES_AGENCY_SCHEME_DOWNLOAD,
        getDownloadArtefactUrl(
          ARTEFACT_TYPE_AGENCY_SCHEME,
          artefactTriplets[0],
          downloadAgencySchemeParams.format,
          false,
          downloadAgencySchemeParams.compression,
          downloadAgencySchemeParams.format === DOWNLOAD_FORMAT_TYPE_CSV
            ? downloadAgencySchemeParams.csvLanguage
            : lang,
          downloadAgencySchemeParams.format === DOWNLOAD_FORMAT_TYPE_CSV
            ? downloadAgencySchemeParams.csvSeparator
            : null,
          downloadAgencySchemeParams.format === DOWNLOAD_FORMAT_TYPE_CSV
            ? downloadAgencySchemeParams.csvDelimiter
            : null
        ),
        undefined,
        true
      ),
      fileSave: getArtefactDownloadFileSaveNameAndType(
        artefactTriplets,
        ARTEFACT_TYPE_AGENCY_SCHEME,
        downloadAgencySchemeParams.format,
        downloadAgencySchemeParams.compression,
        downloadAgencySchemeParams.csvLanguage
      )
    }
};

export const showAgencySchemesAgencySchemeClone = srcTriplet => ({
  type: AGENCY_SCHEMES_AGENCY_SCHEME_CLONE_SHOW,
  srcTriplet
});

export const hideAgencySchemesAgencySchemeClone = () => ({
  type: AGENCY_SCHEMES_AGENCY_SCHEME_CLONE_HIDE
});

export const changeAgencySchemesAgencySchemeClone = fields => ({
  type: AGENCY_SCHEMES_AGENCY_SCHEME_CLONE_CHANGE,
  fields
});

export const submitAgencySchemesAgencySchemeClone = (cloneDestTriplet, srcAgencyScheme, srcAgencySchemeItemsTree) => {


  let agencies = undefined;
  if (srcAgencySchemeItemsTree) {
    agencies = srcAgencySchemeItemsTree.map(node => {
      node.parent = undefined;
      return getSdmxJsonStructureFromItem(node);
    });
  }

  return postRequest(
    AGENCY_SCHEMES_AGENCY_SCHEME_CLONE_SUBMIT,
    getCreateArtefactsUrl(),
    getSdmxJsonFromSdmxJsonStructures(
      [
        getSdmxJsonStructureFromArtefact({
          ...srcAgencyScheme,
          ...cloneDestTriplet,
          agencies,
          isFinal: false,
          autoAnnotations: null
        })
      ],
      SDMX_JSON_AGENCY_SCHEME_LIST_KEY
    ),
    t => ({
      success: t('commons.artefact.messages.clone.success')
    })
  );
};

export const showAgencySchemesAgencySchemeExport = sourceTriplet => ({
  type: AGENCY_SCHEMES_AGENCY_SCHEME_EXPORT_SHOW,
  sourceTriplet
});

export const hideAgencySchemesAgencySchemeExport = () => ({
  type: AGENCY_SCHEMES_AGENCY_SCHEME_EXPORT_HIDE
});

export const changeAgencySchemesAgencySchemeExport = fields => ({
  type: AGENCY_SCHEMES_AGENCY_SCHEME_EXPORT_CHANGE,
  fields
});

export const submitAgencySchemesAgencySchemeExport = (sourceTriplet, destination) => postRequest(
  AGENCY_SCHEMES_AGENCY_SCHEME_EXPORT_SUBMIT,
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
    EnumType: "AgencyScheme",
    CopyReferencedArtefact: false
  }
);

export const hideAgencySchemesAgencySchemeExportReport = () => ({
  type: AGENCY_SCHEMES_AGENCY_SCHEME_EXPORT_REPORT_HIDE
});

export const showAgencySchemesDetailItemsImportFormAllCsvRows = () => ({
  type: AGENCY_SCHEMES_DETAIL_ITEMS_IMPORT_FORM_ALL_CSV_ROWS_SHOW
});

export const hideAgencySchemesDetailItemsImportFormAllCsvRows = () => ({
  type: AGENCY_SCHEMES_DETAIL_ITEMS_IMPORT_FORM_ALL_CSV_ROWS_HIDE
});

export const uploadAgencySchemesDetailItemsImportFormCsv = file => {

  let fileFormData = new FormData();
  fileFormData.append('file', file);

  return postRequest(
    AGENCY_SCHEMES_DETAIL_ITEMS_IMPORT_FORM_CSV_UPLOAD,
    getUploadFileOnServerUrl(),
    fileFormData
  );
};

export const readAgencySchemesDetailItemsImportFormAllCsvRows = (pageNum, pageSize, filterTable, sortCols, sortByDesc, separator, delimiter, hasHeader, filePath) =>
  postRequest(
    AGENCY_SCHEMES_DETAIL_ITEMS_IMPORT_FORM_ALL_CSV_ROWS_READ,
    getCsvTablePreviewUrl(separator, delimiter, hasHeader, filePath, null, null),
    {
      PageNum: pageNum,
      PageSize: pageSize,
      FilterTable: filterTable,
      SortCols: sortCols,
      SortByDesc: sortByDesc,
    }
  );

export const addAgencyToConfig = (superUserUsername, endpointId, agency) => {

  const addAgencyToConfigAction = postRequest(
    AGENCY_SCHEMES_DETAIL_ITEMS_ITEM_ADD_TO_CONFIG,
    getAddAgencyToConfigUrl(endpointId),
    {
      Id: agency.id,
      Name: agency[DATA_INDEX_ORIGINAL_ROW].name
    },
    t => ({
      success: t('scenes.metaManager.agencySchemes.messages.addAgencyToConfig.success')
    })
  );

  if (superUserUsername) {
    return addAgencyToConfigAction;
  } else {
    return ({
      type: SUPER_USER_LOGIN_FORM_SHOW,
      onSuccessAction: addAgencyToConfigAction
    });
  }
};