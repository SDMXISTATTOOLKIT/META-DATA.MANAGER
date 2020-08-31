import {
  allRequest,
  deleteRequest,
  getRequest,
  postRequest,
  REQUEST_METHOD_GET,
  REQUEST_METHOD_POST
} from '../../../../middlewares/api/actions';
import {
  getCodelistUrl,
  getCreateDataflowContentConstraintUrl,
  getCreateDataflowMappingSetUrl,
  getCreateDataflowTranscodingFromCCUrl,
  getCreateDataflowTranscodingUrl,
  getCubeUrl,
  getDataflowColumnPreviewUrl,
  getDataflowContentConstraintUrl,
  getDataflowPreviewUrl,
  getDataflowUrl,
  getDdbDataflowUrl,
  getDownloadDdbdataflowUrl,
  getDsdUrl,
  getMappingSetIdUrl,
  getPaginatedCodelistUrl,
  getRemoveDataflowContentConstraintUrl,
  getRemoveDataflowMappingSetUrl,
  getRemoveDataflowTranscodingUrl,
  getSetDataflowProductionFlagUrl,
  getTableColumnPreviewUrl
} from '../../../../constants/urls';
import {
  ARTEFACT_TYPE_DDBDATAFLOW,
  DOWNLOAD_FORMAT_TYPE_CSV_CUSTOM,
  DOWNLOAD_FORMAT_TYPE_SDMXCSV,
  DOWNLOAD_FORMAT_TYPE_STRUCTURE_SPECIFIC,
  getArtefactDownloadFileSaveNameAndType
} from "../../../../constants/download";
import {getArtefactTripletFromString} from "../../../../utils/sdmxJson";
import {getFilterObjFromStr, getServerQueryObj} from "../../../../utils/filter";

export const DATAFLOW_BUILDER_LIST_DATAFLOWS_READ = 'DATAFLOW_BUILDER_LIST_DATAFLOWS_READ';
export const DATAFLOW_BUILDER_LIST_DATAFLOW_EDIT = 'DATAFLOW_BUILDER_LIST_DATAFLOW_EDIT';
export const DATAFLOW_BUILDER_LIST_DATAFLOW_DELETE = 'DATAFLOW_BUILDER_LIST_DATAFLOW_DELETE';
export const DATAFLOW_BUILDER_LIST_DATAFLOW_PREVIEW_SHOW = 'DATAFLOW_BUILDER_LIST_DATAFLOW_PREVIEW_SHOW';
export const DATAFLOW_BUILDER_LIST_DATAFLOW_PREVIEW_HIDE = 'DATAFLOW_BUILDER_LIST_DATAFLOW_PREVIEW_HIDE';
export const DATAFLOW_BUILDER_LIST_DATAFLOW_READ = 'DATAFLOW_BUILDER_LIST_DATAFLOW_READ';
export const DATAFLOW_BUILDER_LIST_DATAFLOW_PREVIEW_READ = 'DATAFLOW_BUILDER_LIST_DATAFLOW_PREVIEW_READ';
export const DATAFLOW_BUILDER_LIST_DATAFLOW_MAPPING_SET_SET = 'DATAFLOW_BUILDER_LIST_DATAFLOW_MAPPING_SET_SET';
export const DATAFLOW_BUILDER_LIST_DATAFLOW_MAPPING_SET_UNSET = 'DATAFLOW_BUILDER_LIST_DATAFLOW_MAPPING_SET_UNSET';
export const DATAFLOW_BUILDER_LIST_DATAFLOW_TRANSCODING_MODE_CHANGE = 'DATAFLOW_BUILDER_LIST_DATAFLOW_TRANSCODING_MODE_CHANGE';
export const DATAFLOW_BUILDER_LIST_DATAFLOW_TRANSCODING_FROM_CC_LIST_SHOW = 'DATAFLOW_BUILDER_LIST_DATAFLOW_TRANSCODING_FROM_CC_LIST_SHOW';
export const DATAFLOW_BUILDER_LIST_DATAFLOW_TRANSCODING_FROM_CC_LIST_HIDE = 'DATAFLOW_BUILDER_LIST_DATAFLOW_TRANSCODING_FROM_CC_LIST_HIDE';
export const DATAFLOW_BUILDER_LIST_DATAFLOW_TRANSCODING_FROM_CC_LIST_READ = 'DATAFLOW_BUILDER_LIST_DATAFLOW_TRANSCODING_FROM_CC_LIST_READ';
export const DATAFLOW_BUILDER_LIST_DATAFLOW_TRANSCODING_FROM_CC_CONTENT_CONSTRAINT_SET = 'DATAFLOW_BUILDER_LIST_DATAFLOW_TRANSCODING_FROM_CC_CONTENT_CONSTRAINT_SET';
export const DATAFLOW_BUILDER_LIST_DATAFLOW_TRANSCODING_FROM_CC_CONTENT_CONSTRAINT_UNSET = 'DATAFLOW_BUILDER_LIST_DATAFLOW_TRANSCODING_FROM_CC_CONTENT_CONSTRAINT_UNSET';
export const DATAFLOW_BUILDER_LIST_DATAFLOW_TRANSCODING_SET = 'DATAFLOW_BUILDER_LIST_DATAFLOW_TRANSCODING_SET';
export const DATAFLOW_BUILDER_LIST_DATAFLOW_TRANSCODING_FROM_CC_SET = 'DATAFLOW_BUILDER_LIST_DATAFLOW_TRANSCODING_FROM_CC_SET';
export const DATAFLOW_BUILDER_LIST_DATAFLOW_TRANSCODING_UNSET = 'DATAFLOW_BUILDER_LIST_DATAFLOW_TRANSCODING_UNSET';
export const DATAFLOW_BUILDER_LIST_DATAFLOW_CONTENT_CONSTRAINT_SET = 'DATAFLOW_BUILDER_LIST_DATAFLOW_CONTENT_CONSTRAINT_SET';
export const DATAFLOW_BUILDER_LIST_DATAFLOW_CONTENT_CONSTRAINT_UNSET = 'DATAFLOW_BUILDER_LIST_DATAFLOW_CONTENT_CONSTRAINT_UNSET';
export const DATAFLOW_BUILDER_LIST_DATAFLOW_PRODUCTION_FLAG_SET = 'DATAFLOW_BUILDER_LIST_DATAFLOW_PRODUCTION_FLAG_SET';
export const DATAFLOW_BUILDER_LIST_DATAFLOW_PRODUCTION_MODAL_DATAFLOW_MAPPING_SET_ID_READ = 'DATAFLOW_BUILDER_LIST_DATAFLOW_PRODUCTION_MODAL_DATAFLOW_MAPPING_SET_ID_READ';
export const DATAFLOW_BUILDER_LIST_DATAFLOW_PRODUCTION_MODAL_SHOW = 'DATAFLOW_BUILDER_LIST_DATAFLOW_PRODUCTION_MODAL_SHOW';
export const DATAFLOW_BUILDER_LIST_DATAFLOW_PRODUCTION_MODAL_HIDE = 'DATAFLOW_BUILDER_LIST_DATAFLOW_PRODUCTION_MODAL_HIDE';
export const DATAFLOW_BUILDER_LIST_DATAFLOW_DOWNLOAD_SHOW = 'DATAFLOW_BUILDER_LIST_DATAFLOW_DOWNLOAD_SHOW';
export const DATAFLOW_BUILDER_LIST_DATAFLOW_DOWNLOAD_HIDE = 'DATAFLOW_BUILDER_LIST_DATAFLOW_DOWNLOAD_HIDE';
export const DATAFLOW_BUILDER_LIST_DATAFLOW_DOWNLOAD_CHANGE = 'DATAFLOW_BUILDER_LIST_DATAFLOW_DOWNLOAD_CHANGE';
export const DATAFLOW_BUILDER_LIST_DATAFLOW_DOWNLOAD = 'DATAFLOW_BUILDER_LIST_DATAFLOW_DOWNLOAD';
export const DATAFLOW_BUILDER_LIST_DATAFLOW_DOWNLOAD_QUERY_SHOW = 'DATAFLOW_BUILDER_LIST_DATAFLOW_DOWNLOAD_QUERY_SHOW';
export const DATAFLOW_BUILDER_LIST_DATAFLOW_DOWNLOAD_QUERY_HIDE = 'DATAFLOW_BUILDER_LIST_DATAFLOW_DOWNLOAD_QUERY_HIDE';
export const DATAFLOW_BUILDER_LIST_DATAFLOW_DOWNLOAD_QUERY_SET = 'DATAFLOW_BUILDER_LIST_DATAFLOW_DOWNLOAD_QUERY_SET';
export const DATAFLOW_BUILDER_LIST_DATAFLOW_DOWNLOAD_QUERY_UNSET = 'DATAFLOW_BUILDER_LIST_DATAFLOW_DOWNLOAD_QUERY_UNSET';
export const DATAFLOW_BUILDER_LIST_DATAFLOW_DOWNLOAD_CUBE_AND_DDBDATAFLOW_READ = 'DATAFLOW_BUILDER_LIST_DATAFLOW_DOWNLOAD_CUBE_AND_DDBDATAFLOW_READ';
export const DATAFLOW_BUILDER_LIST_DATAFLOW_DOWNLOAD_FILTER_FORM_CHANGE = 'DATAFLOW_BUILDER_LIST_DATAFLOW_DOWNLOAD_FILTER_FORM_CHANGE';
export const DATAFLOW_BUILDER_LIST_DATAFLOW_DOWNLOAD_FILTER_FORM_BLOCK_ADD = 'DATAFLOW_BUILDER_LIST_DATAFLOW_DOWNLOAD_FILTER_FORM_BLOCK_ADD';
export const DATAFLOW_BUILDER_LIST_DATAFLOW_DOWNLOAD_FILTER_FORM_BLOCK_DELETE = 'DATAFLOW_BUILDER_LIST_DATAFLOW_DOWNLOAD_FILTER_FORM_BLOCK_DELETE';
export const DATAFLOW_BUILDER_LIST_DATAFLOW_DOWNLOAD_FILTER_FORM_CONDITION_ADD = 'DATAFLOW_BUILDER_LIST_DATAFLOW_DOWNLOAD_FILTER_FORM_CONDITION_ADD';
export const DATAFLOW_BUILDER_LIST_DATAFLOW_DOWNLOAD_FILTER_FORM_CONDITION_DELETE = 'DATAFLOW_BUILDER_LIST_DATAFLOW_DOWNLOAD_FILTER_FORM_CONDITION_DELETE';
export const DATAFLOW_BUILDER_LIST_DATAFLOW_DOWNLOAD_FILTER_FORM_COLUMN_VALUES_READ = 'DATAFLOW_BUILDER_LIST_DATAFLOW_DOWNLOAD_FILTER_FORM_COLUMN_VALUES_READ';
export const DATAFLOW_BUILDER_LIST_DATAFLOW_DOWNLOAD_PREVIEW_READ = 'DATAFLOW_BUILDER_LIST_DATAFLOW_DOWNLOAD_PREVIEW_READ';
export const DATAFLOW_BUILDER_LIST_DATAFLOW_DOWNLOAD_PREVIEW_SHOW = 'DATAFLOW_BUILDER_LIST_DATAFLOW_DOWNLOAD_PREVIEW_SHOW';
export const DATAFLOW_BUILDER_LIST_DATAFLOW_DOWNLOAD_PREVIEW_HIDE = 'DATAFLOW_BUILDER_LIST_DATAFLOW_DOWNLOAD_PREVIEW_HIDE';
export const DATAFLOW_BUILDER_LIST_DATAFLOW_DOWNLOAD_COLUMNS_CHECK = 'DATAFLOW_BUILDER_LIST_DATAFLOW_DOWNLOAD_COLUMNS_CHECK';
export const DATAFLOW_BUILDER_LIST_DATAFLOW_DOWNLOAD_COLUMNS_CHANGE = 'DATAFLOW_BUILDER_LIST_DATAFLOW_DOWNLOAD_COLUMNS_CHANGE';
export const DATAFLOW_BUILDER_LIST_DATAFLOW_DOWNLOAD_DSD_READ = 'DATAFLOW_BUILDER_LIST_DATAFLOW_DOWNLOAD_DSD_READ';
export const DATAFLOW_BUILDER_LIST_DATAFLOW_ANNOTATIONS_SHOW = 'DATAFLOW_BUILDER_LIST_DATAFLOW_ANNOTATIONS_SHOW';
export const DATAFLOW_BUILDER_LIST_DATAFLOW_ANNOTATIONS_HIDE = 'DATAFLOW_BUILDER_LIST_DATAFLOW_ANNOTATIONS_HIDE';
export const DATAFLOW_BUILDER_LIST_DATAFLOW_LAYOUT_ANNOTATIONS_SHOW = 'DATAFLOW_BUILDER_LIST_DATAFLOW_LAYOUT_ANNOTATIONS_SHOW';
export const DATAFLOW_BUILDER_LIST_DATAFLOW_LAYOUT_ANNOTATIONS_HIDE = 'DATAFLOW_BUILDER_LIST_DATAFLOW_LAYOUT_ANNOTATIONS_HIDE';
export const DATAFLOW_BUILDER_LIST_DATAFLOW_DOWNLOAD_FILTER_MODAL_SHOW = 'DATAFLOW_BUILDER_LIST_DATAFLOW_DOWNLOAD_FILTER_MODAL_SHOW';
export const DATAFLOW_BUILDER_LIST_DATAFLOW_DOWNLOAD_FILTER_MODAL_SUBMIT = 'DATAFLOW_BUILDER_LIST_DATAFLOW_DOWNLOAD_FILTER_MODAL_SUBMIT';
export const DATAFLOW_BUILDER_LIST_DATAFLOW_DOWNLOAD_FILTER_MODAL_FILTER_RESET = 'DATAFLOW_BUILDER_LIST_DATAFLOW_DOWNLOAD_FILTER_MODAL_FILTER_RESET';
export const DATAFLOW_BUILDER_LIST_DATAFLOW_DOWNLOAD_FILTER_MODAL_FILTER_MODE_CHANGE = 'DATAFLOW_BUILDER_LIST_DATAFLOW_DOWNLOAD_FILTER_MODAL_FILTER_MODE_CHANGE';
export const DATAFLOW_BUILDER_LIST_DATAFLOW_DOWNLOAD_FILTER_MODAL_TREE_FILTER_CHANGE = 'DATAFLOW_BUILDER_LIST_DATAFLOW_DOWNLOAD_FILTER_MODAL_TREE_FILTER_CHANGE';
export const DATAFLOW_BUILDER_LIST_DATAFLOW_DOWNLOAD_FILTER_MODAL_TREE_FILTER_COLUMN_MODE_CHANGE = 'DATAFLOW_BUILDER_LIST_DATAFLOW_DOWNLOAD_FILTER_MODAL_TREE_FILTER_COLUMN_MODE_CHANGE';
export const DATAFLOW_BUILDER_LIST_DATAFLOW_DOWNLOAD_FILTER_MODAL_TREE_FILTER_COLUMN_VALUES_CHANGE = 'DATAFLOW_BUILDER_LIST_DATAFLOW_DOWNLOAD_FILTER_MODAL_TREE_FILTER_COLUMN_VALUES_CHANGE';
export const DATAFLOW_BUILDER_LIST_DATAFLOW_DOWNLOAD_FILTER_MODAL_HIDE = 'DATAFLOW_BUILDER_LIST_DATAFLOW_DOWNLOAD_FILTER_MODAL_HIDE';
export const DATAFLOW_BUILDER_LIST_DATAFLOW_DOWNLOAD_FILTER_MODAL_FILTER_CHANGE = 'DATAFLOW_BUILDER_LIST_DATAFLOW_DOWNLOAD_FILTER_MODAL_FILTER_CHANGE';
export const DATAFLOW_BUILDER_LIST_DATAFLOW_DOWNLOAD_FILTER_MODAL_TREE_FILTER_COLUMN_CODELIST_COUNT_READ = 'DATAFLOW_BUILDER_LIST_DATAFLOW_DOWNLOAD_FILTER_MODAL_TREE_FILTER_COLUMN_CODELIST_COUNT_READ';
export const DATAFLOW_BUILDER_LIST_DATAFLOW_DOWNLOAD_FILTER_MODAL_TREE_FILTER_COLUMN_CODELIST_TREE_READ = 'DATAFLOW_BUILDER_LIST_DATAFLOW_DOWNLOAD_FILTER_MODAL_TREE_FILTER_COLUMN_CODELIST_TREE_READ';
export const DATAFLOW_BUILDER_LIST_DATAFLOW_DOWNLOAD_FILTER_MODAL_TREE_FILTER_COLUMN_FILTERED_VALUES_READ = 'DATAFLOW_BUILDER_LIST_DATAFLOW_DOWNLOAD_FILTER_MODAL_TREE_FILTER_COLUMN_FILTERED_VALUES_READ';
export const DATAFLOW_BUILDER_LIST_DATAFLOW_DOWNLOAD_FILTER_ROWS_MODAL_SHOW = 'DATAFLOW_BUILDER_LIST_DATAFLOW_DOWNLOAD_FILTER_ROWS_MODAL_SHOW';
export const DATAFLOW_BUILDER_LIST_DATAFLOW_DOWNLOAD_FILTER_ROWS_MODAL_HIDE = 'DATAFLOW_BUILDER_LIST_DATAFLOW_DOWNLOAD_FILTER_ROWS_MODAL_HIDE';
export const DATAFLOW_BUILDER_LIST_DATAFLOW_DOWNLOAD_FILTER_ROWS_READ = 'DATAFLOW_BUILDER_LIST_DATAFLOW_DOWNLOAD_FILTER_ROWS_READ';

export const readDataflowBuilderListDataflows = () => allRequest(
  DATAFLOW_BUILDER_LIST_DATAFLOWS_READ,
  [REQUEST_METHOD_GET, REQUEST_METHOD_GET, REQUEST_METHOD_GET],
  [getDdbDataflowUrl(), getDataflowUrl(), getCubeUrl()],
);

export const editDataflowBuilderListDataflow = (ddbDataflowId, dataflowTriplet, cubeId, filter) =>
  ({
    type: DATAFLOW_BUILDER_LIST_DATAFLOW_EDIT,
    ddbDataflowId,
    dataflowTriplet,
    cubeId,
    filter
  });

export const deleteDataflowBuilderListDataflow = ddbDataflowId =>
  deleteRequest(
    DATAFLOW_BUILDER_LIST_DATAFLOW_DELETE,
    getDdbDataflowUrl(ddbDataflowId),
    t => ({
      success: t('scenes.dataManager.dataflowBuilder.dataflowTable.messages.delete.success')
    })
  );

export const showDataflowBuilderListDataflowPreview = dataflowId => ({
  type: DATAFLOW_BUILDER_LIST_DATAFLOW_PREVIEW_SHOW,
  dataflowId
});

export const hideDataflowBuilderListDataflowPreview = () => ({
  type: DATAFLOW_BUILDER_LIST_DATAFLOW_PREVIEW_HIDE
});

export const readDataflowBuilderListDataflow = ddbDataflowId =>
  getRequest(
    DATAFLOW_BUILDER_LIST_DATAFLOW_READ,
    getDdbDataflowUrl(ddbDataflowId)
  );

export const readDataflowBuilderListDataflowPreview =
  (cubeId, cubeColumns, filter, pageNum, pageSize, sortCols, sortByDesc) =>
    postRequest(
      DATAFLOW_BUILDER_LIST_DATAFLOW_PREVIEW_READ,
      getDataflowPreviewUrl(),
      getServerQueryObj(cubeColumns, getFilterObjFromStr(filter), pageNum, pageSize, sortCols, sortByDesc, cubeId)
    );

export const setDataflowBuilderListDataflowMappingSet = (ddbDataflowId, defaultValue) => getRequest(
  DATAFLOW_BUILDER_LIST_DATAFLOW_MAPPING_SET_SET,
  getCreateDataflowMappingSetUrl(ddbDataflowId, defaultValue),
  t => ({
    success: t('scenes.dataManager.dataflowBuilder.list.actions.productionModal.messages.createMappingSet.success')
  })
);

export const unsetDataflowBuilderListDataflowMappingSet = ddbDataflowId => deleteRequest(
  DATAFLOW_BUILDER_LIST_DATAFLOW_MAPPING_SET_UNSET,
  getRemoveDataflowMappingSetUrl(ddbDataflowId),
  t => ({
    success: t('scenes.dataManager.dataflowBuilder.list.actions.productionModal.messages.deleteMappingSet.success')
  })
);

export const changeDataflowBuilderListDataflowTranscodingMode = mode => ({
  type: DATAFLOW_BUILDER_LIST_DATAFLOW_TRANSCODING_MODE_CHANGE,
  mode
});

export const setDataflowBuilderListDataflowTranscoding = ddbDataflowId => getRequest(
  DATAFLOW_BUILDER_LIST_DATAFLOW_TRANSCODING_SET,
  getCreateDataflowTranscodingUrl(ddbDataflowId),
  t => ({
    success: t('scenes.dataManager.dataflowBuilder.list.actions.productionModal.messages.createTranscoding.success')
  })
);

export const showDataflowBuilderListDataflowTranscodingFromCCList = () => ({
  type: DATAFLOW_BUILDER_LIST_DATAFLOW_TRANSCODING_FROM_CC_LIST_SHOW
});

export const hideDataflowBuilderListDataflowTranscodingFromCCList = () => ({
  type: DATAFLOW_BUILDER_LIST_DATAFLOW_TRANSCODING_FROM_CC_LIST_HIDE
});

export const readDataflowBuilderListDataflowTranscodingFromCCList = dataflowTriplet => getRequest(
  DATAFLOW_BUILDER_LIST_DATAFLOW_TRANSCODING_FROM_CC_LIST_READ,
  getDataflowContentConstraintUrl(dataflowTriplet)
);

export const setDataflowBuilderListDataflowTranscodingFromCCContentConstraint = contentConstraintTriplet => ({
  type: DATAFLOW_BUILDER_LIST_DATAFLOW_TRANSCODING_FROM_CC_CONTENT_CONSTRAINT_SET,
  contentConstraintTriplet
});

export const unsetDataflowBuilderListDataflowTranscodingFromCCContentConstraint = () => ({
  type: DATAFLOW_BUILDER_LIST_DATAFLOW_TRANSCODING_FROM_CC_CONTENT_CONSTRAINT_UNSET
});

export const setDataflowBuilderListDataflowTranscodingFromCC = (ddbDataflowId, contentConstraintTriplet) => getRequest(
  DATAFLOW_BUILDER_LIST_DATAFLOW_TRANSCODING_FROM_CC_SET,
  getCreateDataflowTranscodingFromCCUrl(ddbDataflowId, contentConstraintTriplet),
  t => ({
    success: t('scenes.dataManager.dataflowBuilder.list.actions.productionModal.messages.createTranscoding.success')
  })
);

export const unsetDataflowBuilderListDataflowTranscoding = ddbDataflowId => deleteRequest(
  DATAFLOW_BUILDER_LIST_DATAFLOW_TRANSCODING_UNSET,
  getRemoveDataflowTranscodingUrl(ddbDataflowId),
  t => ({
    success: t('scenes.dataManager.dataflowBuilder.list.actions.productionModal.messages.deleteTranscoding.success')
  })
);

export const setDataflowBuilderListDataflowContentConstraint = ddbDataflowId => getRequest(
  DATAFLOW_BUILDER_LIST_DATAFLOW_CONTENT_CONSTRAINT_SET,
  getCreateDataflowContentConstraintUrl(ddbDataflowId),
  t => ({
    success: t('scenes.dataManager.dataflowBuilder.list.actions.productionModal.messages.createContentConstraints.success')
  })
);

export const unsetDataflowBuilderListDataflowContentConstraint = ddbDataflowId => deleteRequest(
  DATAFLOW_BUILDER_LIST_DATAFLOW_CONTENT_CONSTRAINT_UNSET,
  getRemoveDataflowContentConstraintUrl(ddbDataflowId),
  t => ({
    success: t('scenes.dataManager.dataflowBuilder.list.actions.productionModal.messages.deleteContentConstraints.success')
  })
);

export const setDataflowBuilderListDataflowProductionFlag = (ddbDataflowId, notProductionFlag) => getRequest(
  DATAFLOW_BUILDER_LIST_DATAFLOW_PRODUCTION_FLAG_SET,
  getSetDataflowProductionFlagUrl(ddbDataflowId, notProductionFlag),
  t => ({
    success: notProductionFlag
      ? t('scenes.dataManager.dataflowBuilder.list.actions.productionModal.messages.removePublish.success')
      : t('scenes.dataManager.dataflowBuilder.list.actions.productionModal.messages.publish.success')
  })
);

export const readDataflowBuilderListonDataflowMappingSetId = ddbDataflowId => ({
  ...getRequest(
    DATAFLOW_BUILDER_LIST_DATAFLOW_PRODUCTION_MODAL_DATAFLOW_MAPPING_SET_ID_READ,
    getMappingSetIdUrl(ddbDataflowId)
  ),
  ddbDataflowId
});

export const showDataflowBuilderListDataflowProductionModal = (ddbDataflowId, dataflowTriplet) => ({
  type: DATAFLOW_BUILDER_LIST_DATAFLOW_PRODUCTION_MODAL_SHOW,
  ddbDataflowId,
  dataflowTriplet
});

export const hideDataflowBuilderListDataflowProductionModal = () => ({
  type: DATAFLOW_BUILDER_LIST_DATAFLOW_PRODUCTION_MODAL_HIDE,
});

export const showDataflowBuilderListDataflowDownload = (ddbDataflowId, cubeId, dataflowTriplet, dsdTriplet) => ({
  type: DATAFLOW_BUILDER_LIST_DATAFLOW_DOWNLOAD_SHOW,
  ddbDataflowId,
  cubeId,
  dataflowTriplet,
  dsdTriplet
});

export const hideDataflowBuilderListDataflowDownload = () => ({
  type: DATAFLOW_BUILDER_LIST_DATAFLOW_DOWNLOAD_HIDE
});

export const changeDataflowBuilderListDataflowDownload = fields => ({
  type: DATAFLOW_BUILDER_LIST_DATAFLOW_DOWNLOAD_CHANGE,
  fields
});

export const downloadDataflowBuilderListDataflow = (ddbdataflowId, dataflowtriplet, dataflowDownloadParams, sortedCols, cubeId) => {
  let sortedSelCols;
  if (dataflowDownloadParams.format === DOWNLOAD_FORMAT_TYPE_CSV_CUSTOM && dataflowDownloadParams.selCols && sortedCols) {
    sortedSelCols = sortedCols.filter(col => dataflowDownloadParams.selCols.includes(col));
  }

  return {
    ...postRequest(
      DATAFLOW_BUILDER_LIST_DATAFLOW_DOWNLOAD,
      getDownloadDdbdataflowUrl(
        dataflowDownloadParams.format === DOWNLOAD_FORMAT_TYPE_SDMXCSV ? 'csv' : dataflowDownloadParams.format,
        dataflowDownloadParams.compression,
        dataflowDownloadParams.format === DOWNLOAD_FORMAT_TYPE_CSV_CUSTOM
          ? dataflowDownloadParams.csvSeparator
          : null,
        dataflowDownloadParams.format === DOWNLOAD_FORMAT_TYPE_CSV_CUSTOM
          ? dataflowDownloadParams.csvDelimiter
          : null,
        dataflowDownloadParams.format === DOWNLOAD_FORMAT_TYPE_STRUCTURE_SPECIFIC
          ? dataflowDownloadParams.dimension
          : null
      ),
      getServerQueryObj(
        (dataflowDownloadParams.format === DOWNLOAD_FORMAT_TYPE_CSV_CUSTOM && sortedSelCols)
          ? sortedSelCols
          : null,
        dataflowDownloadParams.format === DOWNLOAD_FORMAT_TYPE_CSV_CUSTOM
          ? getFilterObjFromStr(dataflowDownloadParams.filter)
          : null,
        undefined,
        undefined,
        undefined,
        undefined,
        cubeId,
        ddbdataflowId
      ),
      undefined,
      undefined,
      true
    ),
    fileSave: getArtefactDownloadFileSaveNameAndType(
      [dataflowtriplet],
      ARTEFACT_TYPE_DDBDATAFLOW,
      dataflowDownloadParams.format,
      dataflowDownloadParams.compression
    )
  }
};

export const showDataflowBuilderListDataflowDownloadQuery = () => ({
  type: DATAFLOW_BUILDER_LIST_DATAFLOW_DOWNLOAD_QUERY_SHOW
});

export const hideDataflowBuilderListDataflowDownloadQuery = () => ({
  type: DATAFLOW_BUILDER_LIST_DATAFLOW_DOWNLOAD_QUERY_HIDE
});

export const setDataflowBuilderListDataflowDownloadQuery = (selCols, filter) => ({
  type: DATAFLOW_BUILDER_LIST_DATAFLOW_DOWNLOAD_QUERY_SET,
  selCols,
  filter
});

export const unsetDataflowBuilderListDataflowDownloadQuery = () => ({
  type: DATAFLOW_BUILDER_LIST_DATAFLOW_DOWNLOAD_QUERY_UNSET
});

export const readDataflowBuilderListDataflowDownloadCubeAndDdBDataflow = (cubeId, ddbdataflowId) => allRequest(
  DATAFLOW_BUILDER_LIST_DATAFLOW_DOWNLOAD_CUBE_AND_DDBDATAFLOW_READ,
  [REQUEST_METHOD_GET, REQUEST_METHOD_GET],
  [getCubeUrl(cubeId), getDdbDataflowUrl(ddbdataflowId)]
);

export const changeDataflowBuilderListDataflowDownloadFilterForm = fields => ({
  type: DATAFLOW_BUILDER_LIST_DATAFLOW_DOWNLOAD_FILTER_FORM_CHANGE,
  fields
});

export const addDataflowBuilderListDataflowDownloadFilterFormBlock = () => ({
  type: DATAFLOW_BUILDER_LIST_DATAFLOW_DOWNLOAD_FILTER_FORM_BLOCK_ADD
});

export const deleteDataflowBuilderListDataflowDownloadFilterFormBlock = blockIndex => ({
  type: DATAFLOW_BUILDER_LIST_DATAFLOW_DOWNLOAD_FILTER_FORM_BLOCK_DELETE,
  blockIndex
});

export const addDataflowBuilderListDataflowDownloadFilterFormCondition = blockIndex => ({
  type: DATAFLOW_BUILDER_LIST_DATAFLOW_DOWNLOAD_FILTER_FORM_CONDITION_ADD,
  blockIndex
});

export const deleteDataflowBuilderListDataflowDownloadFilterFormCondition = (blockIndex, conditionIndex) => ({
  type: DATAFLOW_BUILDER_LIST_DATAFLOW_DOWNLOAD_FILTER_FORM_CONDITION_DELETE,
  blockIndex,
  conditionIndex
});

export const readDataflowBuilderListDataflowDownloadFilterFormColumnValue =
  (tableName, columnName, columnCodelistCode) => ({
    ...(
      columnCodelistCode
        ? allRequest(
        DATAFLOW_BUILDER_LIST_DATAFLOW_DOWNLOAD_FILTER_FORM_COLUMN_VALUES_READ,
        [REQUEST_METHOD_POST, REQUEST_METHOD_GET],
        [getTableColumnPreviewUrl(tableName), getCodelistUrl(getArtefactTripletFromString(columnCodelistCode))],
        [{
          SelCols: [columnName],
          PageSize: 1000,
          PageNum: 1
        }])
        : postRequest(
        DATAFLOW_BUILDER_LIST_DATAFLOW_DOWNLOAD_FILTER_FORM_COLUMN_VALUES_READ,
        getTableColumnPreviewUrl(tableName), {
          SelCols: [columnName],
          PageSize: 1000,
          PageNum: 1
        })
    ),
    columnName,
    columnCodelistCode
  });

export const readDataflowBuilderListDataflowDownloadPreview =
  (cubeId, cubeColumns, filter, pageNum, pageSize, sortCols, sortByDesc, dataflowId) =>
    postRequest(
      DATAFLOW_BUILDER_LIST_DATAFLOW_DOWNLOAD_PREVIEW_READ,
      getDataflowPreviewUrl(true),
      getServerQueryObj(cubeColumns, getFilterObjFromStr(filter), pageNum, pageSize, sortCols, sortByDesc, cubeId, dataflowId)
    );

export const showDataflowBuilderListDataflowDownloadPreview = () => ({
  type: DATAFLOW_BUILDER_LIST_DATAFLOW_DOWNLOAD_PREVIEW_SHOW
});

export const hideDataflowBuilderListDataflowDownloadPreview = () => ({
  type: DATAFLOW_BUILDER_LIST_DATAFLOW_DOWNLOAD_PREVIEW_HIDE
});

export const checkDataflowBuilderListDataflowDownloadColumns = cols => ({
  type: DATAFLOW_BUILDER_LIST_DATAFLOW_DOWNLOAD_COLUMNS_CHECK,
  cols
});

export const changeDataflowBuilderListDataflowDownloadColumns = cols => ({
  type: DATAFLOW_BUILDER_LIST_DATAFLOW_DOWNLOAD_COLUMNS_CHANGE,
  cols
});

export const readDataflowBuilderListDataflowDsdDataflow = triplet => getRequest(
  DATAFLOW_BUILDER_LIST_DATAFLOW_DOWNLOAD_DSD_READ,
  getDsdUrl(triplet)
);

export const showDataflowBuilderListDataflowAnnotations = annotations => ({
  type: DATAFLOW_BUILDER_LIST_DATAFLOW_ANNOTATIONS_SHOW,
  annotations
});

export const hideDataflowBuilderListDataflowAnnotations = () => ({
  type: DATAFLOW_BUILDER_LIST_DATAFLOW_ANNOTATIONS_HIDE
});

export const showDataflowBuilderListDataflowLayoutAnnotations = annotations => ({
  type: DATAFLOW_BUILDER_LIST_DATAFLOW_LAYOUT_ANNOTATIONS_SHOW,
  annotations
});

export const hideDataflowBuilderListDataflowLayoutAnnotations = () => ({
  type: DATAFLOW_BUILDER_LIST_DATAFLOW_LAYOUT_ANNOTATIONS_HIDE
});

export const showDataflowBuilderListDataflowDownloadFilterModal = () => ({
  type: DATAFLOW_BUILDER_LIST_DATAFLOW_DOWNLOAD_FILTER_MODAL_SHOW
});

export const hideDataflowBuilderListDataflowDownloadFilterModal = () => ({
  type: DATAFLOW_BUILDER_LIST_DATAFLOW_DOWNLOAD_FILTER_MODAL_HIDE
});

export const submitDataflowBuilderListDataflowDownloadFilterModal = filter => ({
  type: DATAFLOW_BUILDER_LIST_DATAFLOW_DOWNLOAD_FILTER_MODAL_SUBMIT,
  filter
});

export const changeDataflowBuilderListDataflowDownloadFilterModalTreeFilterColumnMode = (colName, mode) => ({
  type: DATAFLOW_BUILDER_LIST_DATAFLOW_DOWNLOAD_FILTER_MODAL_TREE_FILTER_COLUMN_MODE_CHANGE,
  colName,
  mode
});

export const changeDataflowBuilderListDataflowDownloadFilterModalFilterMode = filterMode => ({
  type: DATAFLOW_BUILDER_LIST_DATAFLOW_DOWNLOAD_FILTER_MODAL_FILTER_MODE_CHANGE,
  filterMode
});

export const resetDataflowBuilderListDataflowDownloadFilterModalFilter = () => ({
  type: DATAFLOW_BUILDER_LIST_DATAFLOW_DOWNLOAD_FILTER_MODAL_FILTER_RESET
});

export const changeDataflowBuilderListDataflowDownloadFilter = fields => ({
  type: DATAFLOW_BUILDER_LIST_DATAFLOW_DOWNLOAD_FILTER_MODAL_FILTER_CHANGE,
  fields
});

export const changeDataflowBuilderListDataflowDownloadFilterModalTreeFilter = treeFilter => ({
  type: DATAFLOW_BUILDER_LIST_DATAFLOW_DOWNLOAD_FILTER_MODAL_TREE_FILTER_CHANGE,
  treeFilter
});

export const readDataflowBuilderListDataflowDownloadFilterModalTreeFilterColumnCodelistCount = (codelistTriplet, language) => ({
  ...postRequest(
    DATAFLOW_BUILDER_LIST_DATAFLOW_DOWNLOAD_FILTER_MODAL_TREE_FILTER_COLUMN_CODELIST_COUNT_READ,
    getPaginatedCodelistUrl(),
    {
      id: codelistTriplet.id,
      agencyId: codelistTriplet.agencyID,
      version: codelistTriplet.version,
      pageNum: 1,
      pageSize: 1,
      lang: language,
      rebuildDb: false
    }
  ),
  codelistTriplet
});

export const readDataflowBuilderListDataflowDownloadFilterModalTreeFilterColumnCodelistTree = (codelistTriplet, language) => ({
  ...postRequest(
    DATAFLOW_BUILDER_LIST_DATAFLOW_DOWNLOAD_FILTER_MODAL_TREE_FILTER_COLUMN_CODELIST_TREE_READ,
    getPaginatedCodelistUrl(),
    {
      id: codelistTriplet.id,
      agencyId: codelistTriplet.agencyID,
      version: codelistTriplet.version,
      pageNum: 1,
      pageSize: -1,
      lang: language,
      rebuildDb: false
    }
  ),
  codelistTriplet
});

export const readDataflowBuilderListDataflowDownloadFilterModalTreeFilterColumnFilteredValues = (cubeId, colNames, filter) => ({
  ...postRequest(
    DATAFLOW_BUILDER_LIST_DATAFLOW_DOWNLOAD_FILTER_MODAL_TREE_FILTER_COLUMN_FILTERED_VALUES_READ,
    getDataflowColumnPreviewUrl(
      colNames[colNames.length - 1],
      1,
      -1
    ),
    {
      idCube: cubeId,
      dataflowColumns: colNames,
      filter: getServerQueryObj(undefined, getFilterObjFromStr(filter)).Filter
    }
  ),
  colName: colNames[colNames.length - 1]
});

export const changeDataflowBuilderListDataflowDownloadFilterModalTreeFilterColumnValues = (colName, values) => ({
  type: DATAFLOW_BUILDER_LIST_DATAFLOW_DOWNLOAD_FILTER_MODAL_TREE_FILTER_COLUMN_VALUES_CHANGE,
  colName,
  values
});

export const showDataflowBuilderListDataflowDownloadFilterRowsModal = () => ({
  type: DATAFLOW_BUILDER_LIST_DATAFLOW_DOWNLOAD_FILTER_ROWS_MODAL_SHOW
});

export const hideDataflowBuilderListDataflowDownloadFilterRowsModal = () => ({
  type: DATAFLOW_BUILDER_LIST_DATAFLOW_DOWNLOAD_FILTER_ROWS_MODAL_HIDE
});

export const readDataflowBuilderListDataflowDownloadFilterRows = (cubeId, cubeColumns, filter, pageNum, pageSize, sortCols, sortByDesc) =>
  postRequest(
    DATAFLOW_BUILDER_LIST_DATAFLOW_DOWNLOAD_FILTER_ROWS_READ,
    getDataflowPreviewUrl(true),
    getServerQueryObj(cubeColumns, getFilterObjFromStr(filter), pageNum, pageSize, sortCols, sortByDesc, cubeId)
  );
