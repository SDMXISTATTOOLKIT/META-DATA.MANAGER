import {deleteRequest, getRequest, postRequest, putRequest} from "../../middlewares/api/actions";
import {
  getAgencyNamesUrl,
  getAvailableParentUrl,
  getCheckImportedFileCsvItemUrl,
  getCloneCodelistUrl,
  getCreateArtefactsUrl,
  getCsvTablePreviewUrl,
  getDeleteItemUrl,
  getDerivedCodelistCreateUrl,
  getDerivedCodelistIsSourceItemValidUrl,
  getDerivedCodelistRestoreDbUrl,
  getDerivedCodelistSelectAllItemsUrl,
  getDerivedCodelistSelectSourceItemUrl,
  getDerivedCodelistSelectTargetItemUrl,
  getDerivedCodelistStoreSelectedItemsUrl,
  getDownloadArtefactUrl,
  getExportArtefactUrl,
  getImportFileCsvItemUrl,
  getInsertItemUrl,
  getMoveItemUrl,
  getMultipleDownloadArtefactUrl,
  getPaginatedCodelistUrl,
  getPaginatedDerivedCodelistUrl,
  getSetDefaultOrderUrl,
  getUpdateCodelistUrl,
  getUpdateItemUrl,
  getUploadFileOnServerUrl
} from "../../constants/urls";
import {
  getArtefactTripletFromUrn,
  getSdmxJsonFromSdmxJsonStructures,
  getSdmxJsonStructureFromArtefact,
  getUrnFromArtefact,
  SDMX_JSON_CODELIST_LIST_KEY
} from "../../utils/sdmxJson";
import {getNode} from "../../utils/tree";
import {getSQLItemFromItem, itemsOrderCompare} from "../../utils/artefacts";
import {Modal} from 'antd';
import {
  ARTEFACT_TYPE_CODELIST,
  DOWNLOAD_FORMAT_TYPE_CSV,
  getArtefactDownloadFileSaveNameAndType
} from "../../constants/download";
import _ from "lodash";

export const CODELIST_DETAIL_READ = 'CODELIST_DETAIL_READ';
export const CODELIST_DETAIL_CREATE = 'CODELIST_DETAIL_CREATE';
export const CODELIST_DETAIL_EDIT = 'CODELIST_DETAIL_EDIT';
export const CODELIST_DETAIL_SHOW = 'CODELIST_DETAIL_SHOW';
export const CODELIST_DETAIL_CHANGE = 'CODELIST_DETAIL_CHANGE';
export const CODELIST_DETAIL_HIDE = 'CODELIST_DETAIL_HIDE';
export const CODELIST_DETAIL_CREATE_SUBMIT = 'CODELIST_DETAIL_CREATE_SUBMIT';
export const CODELIST_DETAIL_UPDATE_SUBMIT = 'CODELIST_DETAIL_UPDATE_SUBMIT';

export const CODELIST_DETAIL_TAB_CHANGE = 'CODELIST_DETAIL_TAB_CHANGE';

export const CODELIST_DETAIL_AGENCIES_READ = 'CODELIST_DETAIL_AGENCIES_READ';

export const CODELIST_DETAIL_ITEM_PAGE_PARAMS_UPDATE = 'CODELIST_DETAIL_ITEM_PAGE_PARAMS_UPDATE';
export const CODELIST_DETAIL_ITEM_PAGE_READ = 'CODELIST_DETAIL_ITEM_PAGE_READ';
export const CODELIST_DETAIL_ITEM_TREE_READ = 'CODELIST_DETAIL_ITEM_TREE_READ';

export const CODELIST_DETAIL_ITEMS_AUTOSAVE_CHANGE = 'CODELIST_DETAIL_ITEMS_AUTOSAVE_CHANGE';

export const CODELIST_DETAIL_ITEMS_ITEM_CREATE = 'CODELIST_DETAIL_ITEMS_ITEM_CREATE';
export const CODELIST_DETAIL_ITEMS_ITEM_SHOW = 'CODELIST_DETAIL_ITEMS_ITEM_SHOW';
export const CODELIST_DETAIL_ITEMS_ITEM_CHANGE = 'CODELIST_DETAIL_ITEMS_ITEM_CHANGE';
export const CODELIST_DETAIL_ITEMS_ITEM_HIDE = 'CODELIST_DETAIL_ITEMS_ITEM_HIDE';
export const CODELIST_DETAIL_ITEMS_ITEM_SUBMIT = 'CODELIST_DETAIL_ITEMS_ITEM_SUBMIT';
export const CODELIST_DETAIL_ITEMS_ITEM_DELETE = 'CODELIST_DETAIL_ITEMS_ITEM_DELETE';
export const CODELIST_DETAIL_ITEMS_ITEM_SELECT = 'CODELIST_DETAIL_ITEMS_ITEM_SELECT';
export const CODELIST_DETAIL_ITEMS_ITEM_DROP = 'CODELIST_DETAIL_ITEMS_ITEM_DROP';
export const CODELIST_DETAIL_ITEMS_ITEM_CUT = 'CODELIST_DETAIL_ITEMS_ITEM_CUT';
export const CODELIST_DETAIL_ITEMS_ITEM_PASTE = 'CODELIST_DETAIL_ITEMS_ITEM_PASTE';

export const CODELIST_DETAIL_ITEMS_FILE_SYSTEM_TREE_SHOW = 'CODELIST_DETAIL_ITEMS_FILE_SYSTEM_TREE_SHOW';
export const CODELIST_DETAIL_ITEMS_FILE_SYSTEM_TREE_HIDE = 'CODELIST_DETAIL_ITEMS_FILE_SYSTEM_TREE_HIDE';
export const CODELIST_DETAIL_ITEMS_FILE_SYSTEM_TREE_ITEM_SELECT = 'CODELIST_DETAIL_ITEMS_FILE_SYSTEM_TREE_ITEM_SELECT';

export const CODELIST_DETAIL_ITEMS_ITEM_ANNOTATIONS_SHOW = 'CODELIST_DETAIL_ITEMS_ITEM_ANNOTATIONS_SHOW';
export const CODELIST_DETAIL_ITEMS_ITEM_ANNOTATIONS_HIDE = 'CODELIST_DETAIL_ITEMS_ITEM_ANNOTATIONS_HIDE';
export const CODELIST_DETAIL_ITEMS_ITEM_LAYOUT_ANNOTATIONS_SHOW = 'CODELIST_DETAIL_ITEMS_ITEM_LAYOUT_ANNOTATIONS_SHOW';
export const CODELIST_DETAIL_ITEMS_ITEM_LAYOUT_ANNOTATIONS_HIDE = 'CODELIST_DETAIL_ITEMS_ITEM_LAYOUT_ANNOTATIONS_HIDE';

export const CODELIST_DETAIL_ITEMS_ITEM_PARENT_LIST_SHOW = 'CODELIST_DETAIL_ITEMS_ITEM_PARENT_LIST_SHOW';
export const CODELIST_DETAIL_ITEMS_ITEM_PARENT_LIST_PAGE_READ = 'CODELIST_DETAIL_ITEMS_ITEM_PARENT_LIST_PAGE_READ';
export const CODELIST_DETAIL_ITEMS_ITEM_PARENT_LIST_HIDE = 'CODELIST_DETAIL_ITEMS_ITEM_PARENT_LIST_HIDE';
export const CODELIST_DETAIL_ITEMS_ITEM_PARENT_LIST_SET = 'CODELIST_DETAIL_ITEMS_ITEM_PARENT_LIST_SET';
export const CODELIST_DETAIL_ITEMS_ITEM_PARENT_LIST_UNSET = 'CODELIST_DETAIL_ITEMS_ITEM_PARENT_LIST_UNSET';

export const CODELIST_DETAIL_ITEMS_VIEW_MODE_CHANGE = 'CODELIST_DETAIL_ITEMS_VIEW_MODE_CHANGE';

export const CODELIST_DETAIL_DOWNLOAD_SHOW = 'CODELIST_DETAIL_DOWNLOAD_SHOW';
export const CODELIST_DETAIL_DOWNLOAD_HIDE = 'CODELIST_DETAIL_DOWNLOAD_HIDE';
export const CODELIST_DETAIL_DOWNLOAD_CHANGE = 'CODELIST_DETAIL_DOWNLOAD_CHANGE';
export const CODELIST_DETAIL_DOWNLOAD_SUBMIT = 'CODELIST_DETAIL_DOWNLOAD_SUBMIT';

export const CODELIST_DETAIL_CLONE_SHOW = 'CODELIST_DETAIL_CLONE_SHOW';
export const CODELIST_DETAIL_CLONE_HIDE = 'CODELIST_DETAIL_CLONE_HIDE';
export const CODELIST_DETAIL_CLONE_CHANGE = 'CODELIST_DETAIL_CLONE_CHANGE';
export const CODELIST_DETAIL_CLONE_SUBMIT = 'CODELIST_DETAIL_CLONE_SUBMIT';

export const CODELIST_DETAIL_ITEMS_IMPORT_FORM_SHOW = 'CODELIST_DETAIL_ITEMS_IMPORT_FORM_SHOW';
export const CODELIST_DETAIL_ITEMS_IMPORT_FORM_HIDE = 'CODELIST_DETAIL_ITEMS_IMPORT_FORM_HIDE';
export const CODELIST_DETAIL_ITEMS_IMPORT_FORM_ALL_CSV_ROWS_SHOW = 'CODELIST_DETAIL_ITEMS_IMPORT_FORM_ALL_CSV_ROWS_SHOW';
export const CODELIST_DETAIL_ITEMS_IMPORT_FORM_ALL_CSV_ROWS_HIDE = 'CODELIST_DETAIL_ITEMS_IMPORT_FORM_ALL_CSV_ROWS_HIDE';
export const CODELIST_DETAIL_ITEMS_IMPORT_FORM_CSV_UPLOAD = 'CODELIST_DETAIL_ITEMS_IMPORT_FORM_CSV_UPLOAD';
export const CODELIST_DETAIL_ITEMS_IMPORT_FORM_ALL_CSV_ROWS_READ = 'CODELIST_DETAIL_ITEMS_IMPORT_FORM_ALL_CSV_ROWS_READ';
export const CODELIST_DETAIL_ITEMS_IMPORT_FORM_CHANGE = 'CODELIST_DETAIL_ITEMS_IMPORT_FORM_CHANGE';
export const CODELIST_DETAIL_ITEMS_IMPORT_FORM_FILE_UPLOAD = 'CODELIST_DETAIL_ITEMS_IMPORT_FORM_FILE_UPLOAD';
export const CODELIST_DETAIL_ITEMS_IMPORT_FORM_FILE_IMPORT = 'CODELIST_DETAIL_ITEMS_IMPORT_FORM_FILE_IMPORT';

export const CODELIST_DETAIL_LANGUAGE_CHANGE = 'CODELIST_DETAIL_LANGUAGE_CHANGE';

export const CODELIST_DETAIL_EXPORT_SHOW = 'CODELIST_DETAIL_EXPORT_SHOW';
export const CODELIST_DETAIL_EXPORT_HIDE = 'CODELIST_DETAIL_EXPORT_HIDE';
export const CODELIST_DETAIL_EXPORT_CHANGE = 'CODELIST_DETAIL_EXPORT_CHANGE';
export const CODELIST_DETAIL_EXPORT_SUBMIT = 'CODELIST_DETAIL_EXPORT_SUBMIT';

export const CODELIST_DETAIL_EXPORT_REPORT_HIDE = 'CODELIST_DETAIL_EXPORT_REPORT_HIDE';

export const CODELIST_DETAIL_DERIVED_CODELIST_SOURCE_ITEM_PAGE_PARAMS_UPDATE = 'CODELIST_DETAIL_DERIVED_CODELIST_SOURCE_ITEM_PAGE_PARAMS_UPDATE';
export const CODELIST_DETAIL_DERIVED_CODELIST_SOURCE_ITEM_PAGE_READ = 'CODELIST_DETAIL_DERIVED_CODELIST_SOURCE_ITEM_PAGE_READ';
export const CODELIST_DETAIL_DERIVED_CODELIST_TARGET_ITEM_PAGE_PARAMS_UPDATE = 'CODELIST_DETAIL_DERIVED_CODELIST_TARGET_ITEM_PAGE_PARAMS_UPDATE';
export const CODELIST_DETAIL_DERIVED_CODELIST_TARGET_ITEM_PAGE_READ = 'CODELIST_DETAIL_DERIVED_CODELIST_TARGET_ITEM_PAGE_READ';

export const CODELIST_DETAIL_DERIVED_CODELIST_SOURCE_ITEM_SELECT = 'CODELIST_DETAIL_DERIVED_CODELIST_SOURCE_ITEM_SELECT';
export const CODELIST_DETAIL_DERIVED_CODELIST_TARGET_ITEM_SELECT = 'CODELIST_DETAIL_DERIVED_CODELIST_TARGET_ITEM_SELECT';
export const CODELIST_DETAIL_DERIVED_CODELIST_ALL_ITEMS_SELECT = 'CODELIST_DETAIL_DERIVED_CODELIST_ALL_ITEMS_SELECT';
export const CODELIST_DETAIL_DERIVED_CODELIST_SELECTED_ITEMS_STORE = 'CODELIST_DETAIL_DERIVED_CODELIST_SELECTED_ITEMS_STORE';

export const CODELIST_DETAIL_DERIVED_CODELIST_CHECKBOX_CHANGE = 'CODELIST_DETAIL_DERIVED_CODELIST_CHECKBOX_CHANGE';

export const CODELIST_DETAIL_DERIVED_CODELIST_CREATE_SHOW = 'CODELIST_DETAIL_DERIVED_CODELIST_CREATE_SHOW';
export const CODELIST_DETAIL_DERIVED_CODELIST_CREATE_CHANGE = 'CODELIST_DETAIL_DERIVED_CODELIST_CREATE_CHANGE';
export const CODELIST_DETAIL_DERIVED_CODELIST_CREATE_HIDE = 'CODELIST_DETAIL_DERIVED_CODELIST_CREATE_HIDE';
export const CODELIST_DETAIL_DERIVED_CODELIST_CREATE_SUBMIT = 'CODELIST_DETAIL_DERIVED_CODELIST_CREATE_SUBMIT';

export const CODELIST_DETAIL_DERIVED_CODELIST_DB_RESTORE = 'CODELIST_DETAIL_DERIVED_CODELIST_DB_RESTORE';

export const CODELIST_DETAIL_DERIVED_TAB_FOCUS = 'CODELIST_DETAIL_DERIVED_TAB_FOCUS';
export const CODELIST_DETAIL_DERIVED_TAB_UNFOCUS = 'CODELIST_DETAIL_DERIVED_TAB_UNFOCUS';

export const CODELIST_DETAIL_ITEMS_DEFAULT_ORDER_SET = 'CODELIST_DETAIL_ITEMS_DEFAULT_ORDER_SET';

export const readCodelistDetail = (triplet, lang, itemsOrderAnnotationType) => ({
  ...postRequest(
    CODELIST_DETAIL_READ,
    getPaginatedCodelistUrl(),
    {
      id: triplet && triplet.id ? triplet.id : undefined,
      agencyId: triplet && triplet.agencyID ? triplet.agencyID : undefined,
      version: triplet && triplet.version ? triplet.version : undefined,
      lang: lang ? lang : undefined,
      pageNum: 1,
      pageSize: 0,
      rebuildDb: true
    }
  ),
  itemsOrderAnnotationType
});

export const createCodelistDetail = defaultItemsViewMode => ({
  type: CODELIST_DETAIL_CREATE,
  defaultItemsViewMode
});

export const editCodelistDetail = (codelistTriplet, defaultItemsViewMode) => ({
  type: CODELIST_DETAIL_EDIT,
  codelistTriplet,
  defaultItemsViewMode
});

export const showCodelistDetail = (codelistTriplet, defaultItemsViewMode) => ({
  type: CODELIST_DETAIL_SHOW,
  codelistTriplet,
  defaultItemsViewMode
});

export const readCodelistDetailItemPage =
  (triplet, lang, pageNum, pageSize, itemsOrderAnnotationType, searchText, filters, sortCol, sortByDesc, rebuildDb) => ({
    ...postRequest(
      CODELIST_DETAIL_ITEM_PAGE_READ,
      getPaginatedCodelistUrl(),
      {
        id: triplet && triplet.id ? triplet.id : undefined,
        agencyId: triplet && triplet.agencyID ? triplet.agencyID : undefined,
        version: triplet && triplet.version ? triplet.version : undefined,
        lang: lang ? lang : undefined,
        pageNum: pageNum ? pageNum : undefined,
        pageSize: pageSize ? pageSize : undefined,
        allSearch: searchText ? searchText : undefined,
        codeSearch: filters && filters.id ? filters.id : undefined,
        nameSearch: filters && filters.name ? filters.name : undefined,
        parentSearch: filters && filters.parent ? filters.parent : undefined,
        sortColumn: sortCol ? sortCol : undefined,
        sortDesc: sortByDesc ? sortByDesc : undefined,
        rebuildDb
      }
    ),
    itemsOrderAnnotationType
  });

export const updateCodelistDetailItemPageParams = params => ({
  type: CODELIST_DETAIL_ITEM_PAGE_PARAMS_UPDATE,
  params
});

export const readCodelistDetailItemTree = (triplet, lang, itemsOrderAnnotationType, rebuildDb) => ({
  ...postRequest(
    CODELIST_DETAIL_ITEM_TREE_READ,
    getPaginatedCodelistUrl(),
    {
      id: triplet && triplet.id ? triplet.id : undefined,
      agencyId: triplet && triplet.agencyID ? triplet.agencyID : undefined,
      version: triplet && triplet.version ? triplet.version : undefined,
      lang: lang ? lang : undefined,
      pageNum: 1,
      pageSize: -1,
      rebuildDb
    }
  ),
  itemsOrderAnnotationType
});

export const changeCodelistDetail = fields => ({
  type: CODELIST_DETAIL_CHANGE,
  fields
});

export const submitCodelistDetailCreate = (codelist, codelistTriplet) => ({
  ...postRequest(
    CODELIST_DETAIL_CREATE_SUBMIT,
    getCreateArtefactsUrl(),
    getSdmxJsonFromSdmxJsonStructures(
      [getSdmxJsonStructureFromArtefact(codelist)],
      SDMX_JSON_CODELIST_LIST_KEY
    ),
    t => ({
      success: t('reduxComponents.codelistDetail.messages.create.success')
    })
  ),
  codelistTriplet
});

export const submitCodelistDetailUpdate = (codelist, lang, closeDetail) => ({
  ...postRequest(
    CODELIST_DETAIL_UPDATE_SUBMIT,
    getUpdateCodelistUrl(getArtefactTripletFromUrn(getUrnFromArtefact(codelist)), lang),
    getSdmxJsonStructureFromArtefact(codelist),
    t => ({
      success: t('reduxComponents.codelistDetail.messages.update.success')
    })
  ),
  closeDetail
});

export const readCodelistDetailAgencies = allowedAgencies => ({
  ...getRequest(
    CODELIST_DETAIL_AGENCIES_READ,
    getAgencyNamesUrl()
  ),
  allowedAgencies
});

export const changeCodelistDetailItemsViewMode = viewMode => ({
  type: CODELIST_DETAIL_ITEMS_VIEW_MODE_CHANGE,
  viewMode
});

export const showCodelistDetailDownload = (artefactTriplets, lang) => ({
  type: CODELIST_DETAIL_DOWNLOAD_SHOW,
  artefactTriplets,
  lang
});

export const hideCodelistDetailDownload = () => ({
  type: CODELIST_DETAIL_DOWNLOAD_HIDE
});

export const changeCodelistDetailDownload = fields => ({
  type: CODELIST_DETAIL_DOWNLOAD_CHANGE,
  fields
});

export const submitCodelistDetailDownload = (artefactTriplets, downloadCodelistParams, lang) => {

  return (artefactTriplets && artefactTriplets.length > 1)
    ? {
      ...postRequest(
        CODELIST_DETAIL_DOWNLOAD_SUBMIT,
        getMultipleDownloadArtefactUrl(
          ARTEFACT_TYPE_CODELIST,
          downloadCodelistParams.format,
          false,
          downloadCodelistParams.compression,
          lang
        ),
        artefactTriplets.map(({id, agencyID, version}) => ({id, agency: agencyID, version})),
        undefined,
        undefined,
        true
      ),
      fileSave: getArtefactDownloadFileSaveNameAndType(
        artefactTriplets,
        ARTEFACT_TYPE_CODELIST,
        downloadCodelistParams.format,
        downloadCodelistParams.compression
      )
    }
    : {
      ...getRequest(
        CODELIST_DETAIL_DOWNLOAD_SUBMIT,
        getDownloadArtefactUrl(
          ARTEFACT_TYPE_CODELIST,
          artefactTriplets[0],
          downloadCodelistParams.format,
          false,
          downloadCodelistParams.compression,
          downloadCodelistParams.format === DOWNLOAD_FORMAT_TYPE_CSV
            ? downloadCodelistParams.csvLanguage
            : lang,
          downloadCodelistParams.format === DOWNLOAD_FORMAT_TYPE_CSV
            ? downloadCodelistParams.csvSeparator
            : null,
          downloadCodelistParams.format === DOWNLOAD_FORMAT_TYPE_CSV
            ? downloadCodelistParams.csvDelimiter
            : null
        ),
        undefined,
        true
      ),
      fileSave: getArtefactDownloadFileSaveNameAndType(
        artefactTriplets,
        ARTEFACT_TYPE_CODELIST,
        downloadCodelistParams.format,
        downloadCodelistParams.compression,
        downloadCodelistParams.csvLanguage
      )
    }
};

export const createCodelistDetailItemsItem = (parentId, order, lang) => ({
  type: CODELIST_DETAIL_ITEMS_ITEM_CREATE,
  parentId,
  order,
  lang
});

export const editCodelistDetailItemsItem = item => ({
  type: CODELIST_DETAIL_ITEMS_ITEM_SHOW,
  item
});

export const changeCodelistDetailItemsItem = (fields, lang, itemsOrderAnnotationType) => ({
  type: CODELIST_DETAIL_ITEMS_ITEM_CHANGE,
  fields,
  lang,
  itemsOrderAnnotationType
});

export const submitCodelistDetailItemsItem =
  (triplet, item, lang, isItemEditMode, autoSave, itemsOrderAnnotationType, itemsTree, cutItem, t) => {

    if (cutItem) {
      const parentNode = getNode(itemsTree, "codes", node => node.id === cutItem.parent);
      if (parentNode) {
        parentNode.codes.push(cutItem);
        parentNode.codes.sort((a, b) => itemsOrderCompare(a, b, lang));
      } else {
        itemsTree.push(cutItem);
        itemsTree.sort((a, b) => itemsOrderCompare(a, b, lang));
      }
      Modal.info({title: t("commons.artefact.messages.nodeRestored.title")});
    }

    return isItemEditMode
      ? ({
        ...putRequest(
          CODELIST_DETAIL_ITEMS_ITEM_SUBMIT,
          getUpdateItemUrl(triplet, lang),
          getSQLItemFromItem(item, lang, autoSave, itemsOrderAnnotationType),
          autoSave
            ? t => ({
              success: t('reduxComponents.codelistDetail.messages.update.success')
            })
            : undefined
        ),
        unsavedChange: !autoSave
      })
      : ({
        ...postRequest(
          CODELIST_DETAIL_ITEMS_ITEM_SUBMIT,
          getInsertItemUrl(triplet, lang),
          getSQLItemFromItem(item, lang, autoSave, itemsOrderAnnotationType),
          autoSave
            ? t => ({
              success: t('reduxComponents.codelistDetail.messages.update.success')
            })
            : undefined
        ),
        unsavedChange: !autoSave
      })
  };

export const hideCodelistDetailItemsItem = () => ({
  type: CODELIST_DETAIL_ITEMS_ITEM_HIDE,
});

export const deleteCodelistDetailsItemsItem = (codelistTriplet, itemId, autoSave, itemsTree, cutItem, lang, t) => {

  if (cutItem) {
    const parentNode = getNode(itemsTree, "codes", node => node.id === cutItem.parent);
    if (parentNode) {
      parentNode.codes.push(cutItem);
      parentNode.codes.sort((a, b) => itemsOrderCompare(a, b, lang));
    } else {
      itemsTree.push(cutItem);
      itemsTree.sort((a, b) => itemsOrderCompare(a, b, lang));
    }
    Modal.info({title: t("commons.artefact.messages.nodeRestored.title")});
  }

  return ({
    ...deleteRequest(
      CODELIST_DETAIL_ITEMS_ITEM_DELETE,
      getDeleteItemUrl(codelistTriplet, itemId, lang, autoSave),
      autoSave
        ? t => ({
          success: t('reduxComponents.codelistDetail.messages.update.success')
        })
        : undefined
    ),
    unsavedChange: !autoSave
  })
};

export const selectCodelistDetailsItemsItem = id => ({
  type: CODELIST_DETAIL_ITEMS_ITEM_SELECT,
  id
});

export const showCodelistDetailItemsImportForm = () => ({
  type: CODELIST_DETAIL_ITEMS_IMPORT_FORM_SHOW
});

export const hideCodelistDetailItemsImportForm = () => ({
  type: CODELIST_DETAIL_ITEMS_IMPORT_FORM_HIDE
});

export const changeCodelistDetailItemsImportForm = fields => ({
  type: CODELIST_DETAIL_ITEMS_IMPORT_FORM_CHANGE,
  fields
});

export const uploadCodelistDetailItemsImportFormFile = (codelist, itemsImportForm) => {

  let formData = new FormData();
  formData.append('file', itemsImportForm.file);
  formData.append('CustomData', JSON.stringify({
    type: 'codelist',
    identity: {
      ID: codelist.id,
      Agency: codelist.agencyID,
      Version: codelist.version
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
    CODELIST_DETAIL_ITEMS_IMPORT_FORM_FILE_UPLOAD,
    getCheckImportedFileCsvItemUrl(),
    formData,
    t => ({
      success: t('commons.artefact.messages.itemsImport.fileUpload.success')
    })
  );
};

export const importCodelistDetailItemsImportFormFile = (codelist, itemsImportForm) => postRequest(
  CODELIST_DETAIL_ITEMS_IMPORT_FORM_FILE_IMPORT,
  getImportFileCsvItemUrl(),
  {
    hashImport: itemsImportForm.hash,
    type: 'codelist',
    identity: {
      ID: codelist.id,
      Agency: codelist.agencyID,
      Version: codelist.version
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

export const hideCodelistDetail = () => ({
  type: CODELIST_DETAIL_HIDE
});

export const showCodelistDetailItemsItemAnnotations = (annotations, itemId) => ({
  type: CODELIST_DETAIL_ITEMS_ITEM_ANNOTATIONS_SHOW,
  annotations,
  itemId
});

export const hideCodelistDetailItemsItemAnnotations = () => ({
  type: CODELIST_DETAIL_ITEMS_ITEM_ANNOTATIONS_HIDE
});

export const showCodelistDetailItemsItemLayoutAnnotations = (annotations, itemId) => ({
  type: CODELIST_DETAIL_ITEMS_ITEM_LAYOUT_ANNOTATIONS_SHOW,
  annotations,
  itemId
});

export const hideCodelistDetailItemsItemLayoutAnnotations = () => ({
  type: CODELIST_DETAIL_ITEMS_ITEM_LAYOUT_ANNOTATIONS_HIDE
});

export const showCodelistDetailItemsItemParentList = () => ({
  type: CODELIST_DETAIL_ITEMS_ITEM_PARENT_LIST_SHOW
});

export const readCodelistDetailItemsItemParentListPage =
  (triplet, itemId, lang, pageNum, pageSize, itemsOrderAnnotationType, searchText, filters, sortCol, sortByDesc) => ({
    ...postRequest(
      CODELIST_DETAIL_ITEMS_ITEM_PARENT_LIST_PAGE_READ,
      getAvailableParentUrl(),
      ({
        Id: triplet.id ? triplet.id : undefined,
        AgencyId: triplet.agencyID ? triplet.agencyID : undefined,
        Version: triplet.version ? triplet.version : undefined,
        ItemForParent: itemId ? itemId : undefined,
        Lang: lang ? lang : undefined,
        PageNum: pageNum ? pageNum : undefined,
        PageSize: pageSize ? pageSize : undefined,
        AllSearch: searchText ? searchText : undefined,
        CodeSearch: filters.id ? filters.id : undefined,
        NameSearch: filters.name ? filters.name : undefined,
        ParentSearch: filters.parent ? filters.parent : undefined,
        SortColumn: sortCol ? sortCol : undefined,
        SortDesc: sortByDesc ? sortByDesc : undefined,
      })
    ),
    itemsOrderAnnotationType
  });

export const hideCodelistDetailItemsItemParentList = () => ({
  type: CODELIST_DETAIL_ITEMS_ITEM_PARENT_LIST_HIDE
});

export const setCodelistDetailItemsItemParentList = item => ({
  type: CODELIST_DETAIL_ITEMS_ITEM_PARENT_LIST_SET,
  item
});

export const unsetCodelistDetailItemsItemParentList = () => ({
  type: CODELIST_DETAIL_ITEMS_ITEM_PARENT_LIST_UNSET
});

export const dropCodelistDetailItemsItem =
  (artefactTriplet, itemId, newParentId, moveBefore, moveAfter, lang, autoSave, itemsTree, cutItem, t) => {

    if (cutItem) {
      const parentNode = getNode(itemsTree, "codes", node => node.id === cutItem.parent);
      if (parentNode) {
        parentNode.codes.push(cutItem);
        parentNode.codes.sort((a, b) => itemsOrderCompare(a, b, lang));
      } else {
        itemsTree.push(cutItem);
        itemsTree.sort((a, b) => itemsOrderCompare(a, b, lang));
      }
      Modal.info({title: t("commons.artefact.messages.nodeRestored.title")});
    }

    return ({
      ...postRequest(
        CODELIST_DETAIL_ITEMS_ITEM_DROP,
        getMoveItemUrl(artefactTriplet, lang),
        ({
          itemCode: itemId,
          parent: newParentId,
          moveBefore: moveBefore ? moveBefore : undefined,
          moveAfter: moveAfter ? moveAfter : undefined,
          autoSave: autoSave
        }),
        autoSave
          ? t => ({
            success: t('reduxComponents.codelistDetail.messages.update.success')
          })
          : undefined
      ),
      unsavedChange: !autoSave
    })
  };

export const changeCodelistDetailCodelistLanguage = (lang, itemsOrderAnnotationType) => ({
  type: CODELIST_DETAIL_LANGUAGE_CHANGE,
  lang,
  itemsOrderAnnotationType
});

export const cutCodelistDetailItemsItem = item => ({
  type: CODELIST_DETAIL_ITEMS_ITEM_CUT,
  item
});

export const pasteCodelistDetailItemsItem = (artefactTriplet, lang, cutItemId, newParentId, pasteAfterId, autoSave) => ({
  ...postRequest(
    CODELIST_DETAIL_ITEMS_ITEM_PASTE,
    getMoveItemUrl(artefactTriplet, lang),
    ({
      itemCode: cutItemId,
      parent: newParentId ? newParentId : undefined,
      moveAfter: pasteAfterId ? pasteAfterId : undefined,
      autoSave: autoSave
    }),
    autoSave
      ? t => ({
        success: t('reduxComponents.codelistDetail.messages.update.success')
      })
      : undefined
  ),
  unsavedChange: !autoSave
});

export const showCodelistDetailClone = srcTriplet => ({
  type: CODELIST_DETAIL_CLONE_SHOW,
  srcTriplet
});

export const hideCodelistDetailClone = () => ({
  type: CODELIST_DETAIL_CLONE_HIDE
});

export const changeCodelistDetailClone = fields => ({
  type: CODELIST_DETAIL_CLONE_CHANGE,
  fields
});

export const submitCodelistDetailClone = (srcTriplet, destTriplet) => postRequest(
  CODELIST_DETAIL_CLONE_SUBMIT,
  getCloneCodelistUrl(srcTriplet, destTriplet),
  null,
  t => ({
    success: t('commons.artefact.messages.clone.success')
  })
);

export const changeCodelistDetailItemsAutoSave = () => ({
  type: CODELIST_DETAIL_ITEMS_AUTOSAVE_CHANGE
});

export const showCodelistDetailItemsFileSystemTree = () => ({
  type: CODELIST_DETAIL_ITEMS_FILE_SYSTEM_TREE_SHOW
});

export const hideCodelistDetailItemsFileSystemTree = () => ({
  type: CODELIST_DETAIL_ITEMS_FILE_SYSTEM_TREE_HIDE
});

export const selectCodelistDetailItemsFileSystemTreeItem = selectedItem => ({
  type: CODELIST_DETAIL_ITEMS_FILE_SYSTEM_TREE_ITEM_SELECT,
  selectedItem
});

export const showCodelistDetailExport = sourceTriplet => ({
  type: CODELIST_DETAIL_EXPORT_SHOW,
  sourceTriplet
});

export const hideCodelistDetailExport = () => ({
  type: CODELIST_DETAIL_EXPORT_HIDE
});

export const changeCodelistDetailExport = fields => ({
  type: CODELIST_DETAIL_EXPORT_CHANGE,
  fields
});

export const submitCodelistDetailExport = (sourceTriplet, destination) => postRequest(
  CODELIST_DETAIL_EXPORT_SUBMIT,
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
    EnumType: "CodeList",
    CopyReferencedArtefact: false
  }
);

export const hideCodelistDetailExportReport = () => ({
  type: CODELIST_DETAIL_EXPORT_REPORT_HIDE
});

export const changeCodelistDetailTab = newTab => ({
  type: CODELIST_DETAIL_TAB_CHANGE,
  newTab
});

export const showCodelistDetailItemsImportFormAllCsvRows = () => ({
  type: CODELIST_DETAIL_ITEMS_IMPORT_FORM_ALL_CSV_ROWS_SHOW
});

export const hideCodelistDetailItemsImportFormAllCsvRows = () => ({
  type: CODELIST_DETAIL_ITEMS_IMPORT_FORM_ALL_CSV_ROWS_HIDE
});

export const uploadCodelistDetailItemsImportFormCsv = file => {

  let fileFormData = new FormData();
  fileFormData.append('file', file);

  return postRequest(
    CODELIST_DETAIL_ITEMS_IMPORT_FORM_CSV_UPLOAD,
    getUploadFileOnServerUrl(),
    fileFormData
  );
};

export const readCodelistDetailItemsImportFormAllCsvRows =
  (pageNum, pageSize, filterTable, sortCols, sortByDesc, separator, delimiter, hasHeader, filePath) => postRequest(
    CODELIST_DETAIL_ITEMS_IMPORT_FORM_ALL_CSV_ROWS_READ,
    getCsvTablePreviewUrl(separator, delimiter, hasHeader, filePath, null, null),
    {
      PageNum: pageNum,
      PageSize: pageSize,
      FilterTable: filterTable,
      SortCols: sortCols,
      SortByDesc: sortByDesc,
    }
  );

export const updateCodelistDetailDerivedCodelistSourceItemPageParams = params => ({
  type: CODELIST_DETAIL_DERIVED_CODELIST_SOURCE_ITEM_PAGE_PARAMS_UPDATE,
  params
});

export const readCodelistDetailDerivedCodelistSourceItemPage =
  (triplet, lang, pageNum, pageSize, itemsOrderAnnotationType, searchText, filters, sortCol, sortByDesc) => ({
    ...postRequest(
      CODELIST_DETAIL_DERIVED_CODELIST_SOURCE_ITEM_PAGE_READ,
      getPaginatedDerivedCodelistUrl(false),
      {
        id: triplet && triplet.id ? triplet.id : undefined,
        agencyId: triplet && triplet.agencyID ? triplet.agencyID : undefined,
        version: triplet && triplet.version ? triplet.version : undefined,
        lang: lang ? lang : undefined,
        pageNum: pageNum ? pageNum : undefined,
        pageSize: pageSize ? pageSize : undefined,
        allSearch: searchText ? searchText : undefined,
        codeSearch: filters && filters.code ? filters.code : undefined,
        nameSearch: filters && filters.name ? filters.name : undefined,
        parentSearch: filters && filters.parent ? filters.parent : undefined,
        sortColumn: sortCol ? sortCol : undefined,
        sortDesc: sortByDesc ? sortByDesc : undefined
      }
    ),
    itemsOrderAnnotationType
  });

export const updateCodelistDetailDerivedCodelistTargetItemPageParams = params => ({
  type: CODELIST_DETAIL_DERIVED_CODELIST_TARGET_ITEM_PAGE_PARAMS_UPDATE,
  params
});

export const readCodelistDetailDerivedCodelistTargetItemPage =
  (triplet, lang, pageNum, pageSize, itemsOrderAnnotationType, searchText, filters, sortCol, sortByDesc) => ({
    ...postRequest(
      CODELIST_DETAIL_DERIVED_CODELIST_TARGET_ITEM_PAGE_READ,
      getPaginatedDerivedCodelistUrl(true),
      {
        id: triplet && triplet.id ? triplet.id : undefined,
        agencyId: triplet && triplet.agencyID ? triplet.agencyID : undefined,
        version: triplet && triplet.version ? triplet.version : undefined,
        lang: lang ? lang : undefined,
        pageNum: pageNum ? pageNum : undefined,
        pageSize: pageSize ? pageSize : undefined,
        allSearch: searchText ? searchText : undefined,
        codeSearch: filters && filters.code ? filters.code : undefined,
        nameSearch: filters && filters.name ? filters.name : undefined,
        parentSearch: filters && filters.parent ? filters.parent : undefined,
        sortColumn: sortCol ? sortCol : undefined,
        sortDesc: sortByDesc ? sortByDesc : undefined
      }
    ),
    itemsOrderAnnotationType
  });

export const selectCodelistDetailDerivedCodelistSourceItem = (itemId, triplet, isSelected, lang) => postRequest(
  CODELIST_DETAIL_DERIVED_CODELIST_SOURCE_ITEM_SELECT,
  getDerivedCodelistSelectSourceItemUrl(triplet, isSelected, lang),
  [itemId]
);

export const selectCodelistDetailDerivedCodelistTargetItem = (itemId, triplet, isSelected, lang) => postRequest(
  CODELIST_DETAIL_DERIVED_CODELIST_TARGET_ITEM_SELECT,
  getDerivedCodelistSelectTargetItemUrl(triplet, isSelected, lang),
  [itemId]
);

export const selectCodelistDetailDerivedCodelistAllItems = (triplet, isTarget, isSelected, filter, lang) => {

  return ({
    ...postRequest(
      CODELIST_DETAIL_DERIVED_CODELIST_ALL_ITEMS_SELECT,
      getDerivedCodelistSelectAllItemsUrl(triplet, isTarget, isSelected, lang),
      filter
        ? {
          id: triplet && triplet.id ? triplet.id : undefined,
          agencyId: triplet && triplet.agencyID ? triplet.agencyID : undefined,
          version: triplet && triplet.version ? triplet.version : undefined,
          lang: lang ? lang : undefined,
          pageNum: 1,
          pageSize: -1,
          allSearch: filter.searchText ? filter.searchText : undefined,
          codeSearch: (filter.filters && filter.filters.code) ? filter.filters.code : undefined,
          nameSearch: (filter.filters && filter.filters.name) ? filter.filters.name : undefined,
          parentSearch: (filter.filters && filter.filters.parent) ? filter.filters.parent : undefined,
          sortColumn: filter.sortCol ? filter.sortCol : undefined,
          sortDesc: filter.sortByDesc ? filter.sortByDesc : undefined
        }
        : null
    ),
    isTarget
  })
};

export const storeCodelistDetailDerivedCodelistSelectedItems = (isTarget, triplet, lang, importCheckbox) =>
  postRequest(
    CODELIST_DETAIL_DERIVED_CODELIST_SELECTED_ITEMS_STORE,
    getDerivedCodelistStoreSelectedItemsUrl(
      triplet,
      isTarget,
      lang,
      importCheckbox ? !importCheckbox.preserveHierarchy : false,
      (importCheckbox && importCheckbox.preserveHierarchy) ? importCheckbox.importParents : false,
      (importCheckbox && importCheckbox.preserveHierarchy) ? importCheckbox.importChildren : false,
      (importCheckbox && importCheckbox.preserveHierarchy) ? importCheckbox.importDescendants : false
    )
  );

export const changeCodelistDetailDerivedCodelistCheckbox = checkbox => ({
  type: CODELIST_DETAIL_DERIVED_CODELIST_CHECKBOX_CHANGE,
  checkbox
});

export const showCodelistDetailDerivedCodelistCreate = (codelistTriplet, lang) => getRequest(
  CODELIST_DETAIL_DERIVED_CODELIST_CREATE_SHOW,
  getDerivedCodelistIsSourceItemValidUrl(codelistTriplet, lang)
);

export const hideCodelistDetailDerivedCodelistCreate = () => ({
  type: CODELIST_DETAIL_DERIVED_CODELIST_CREATE_HIDE
});

export const changeCodelistDetailDerivedCodelistCreate = fields => ({
  type: CODELIST_DETAIL_DERIVED_CODELIST_CREATE_CHANGE,
  fields
});

export const submitCodelistDetailDerivedCodelistCreate = (triplet, lang, derivedCodelist) => postRequest(
  CODELIST_DETAIL_DERIVED_CODELIST_CREATE_SUBMIT,
  getDerivedCodelistCreateUrl(triplet, lang),
  {
    ...derivedCodelist,
    names: _.pickBy(derivedCodelist.name, val => val.length > 0),
    name: undefined
  }
);

export const restoreCodelistDetailDerivedCodelistDb = (triplet, fetchTarget) => ({
  ...deleteRequest(
    CODELIST_DETAIL_DERIVED_CODELIST_DB_RESTORE,
    getDerivedCodelistRestoreDbUrl(triplet)
  ),
  fetchTarget
});

export const focusCodelistDetailDerivedTab = () => ({
  type: CODELIST_DETAIL_DERIVED_TAB_FOCUS
});

export const unfocusCodelistDetailDerivedTab = () => ({
  type: CODELIST_DETAIL_DERIVED_TAB_UNFOCUS
});

export const setCodelistDetailItemsDefaultOrder = (triplet, lang) => postRequest(
  CODELIST_DETAIL_ITEMS_DEFAULT_ORDER_SET,
  getSetDefaultOrderUrl(triplet, lang),
  [],
  t => ({
    success: t('reduxComponents.codelistDetail.messages.update.success')
  })
);