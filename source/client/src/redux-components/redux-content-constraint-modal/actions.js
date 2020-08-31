import {allRequest, getRequest, postRequest, putRequest, REQUEST_METHOD_GET} from "../../middlewares/api/actions";
import {
  getAgencyNamesUrl,
  getContentConstraintUrl,
  getCreateArtefactsUrl,
  getCubeUrl,
  getDataflowColumnPreviewUrl,
  getDataflowUrl,
  getDdbDataflowUrl,
  getDownloadArtefactUrl,
  getDsdUrl,
  getExportArtefactUrl,
  getMultipleDownloadArtefactUrl,
  getPaginatedCodelistUrl,
  getUpdateArtefactsUrl
} from "../../constants/urls";
import {
  getSdmxJsonFromSdmxJsonStructures,
  getSdmxJsonStructureFromContentConstraint,
  SDMX_JSON_CONTENT_CONSTRAINT_LIST_KEY
} from "../../utils/sdmxJson";
import {CONTENT_CONSTRAINTS_ARTEFACT_TYPE_DATAFLOW} from "./FilterTab";
import {ARTEFACT_TYPE_CONTENT_CONSTRAINT, getArtefactDownloadFileSaveNameAndType} from "../../constants/download";
import {getFilterObjFromStr, getServerQueryObj} from "../../utils/filter";

export const CONTENT_CONSTRAINT_DETAIL_READ = 'CONTENT_CONSTRAINT_DETAIL_READ';
export const CONTENT_CONSTRAINT_DETAIL_CREATE = 'CONTENT_CONSTRAINT_DETAIL_CREATE';
export const CONTENT_CONSTRAINT_DETAIL_EDIT = 'CONTENT_CONSTRAINT_DETAIL_EDIT';
export const CONTENT_CONSTRAINT_DETAIL_SHOW = 'CONTENT_CONSTRAINT_DETAIL_SHOW';
export const CONTENT_CONSTRAINT_DETAIL_CHANGE = 'CONTENT_CONSTRAINT_DETAIL_CHANGE';
export const CONTENT_CONSTRAINT_DETAIL_HIDE = 'CONTENT_CONSTRAINT_DETAIL_HIDE';
export const CONTENT_CONSTRAINT_DETAIL_CREATE_SUBMIT = 'CONTENT_CONSTRAINT_DETAIL_CREATE_SUBMIT';
export const CONTENT_CONSTRAINT_DETAIL_UPDATE_SUBMIT = 'CONTENT_CONSTRAINT_DETAIL_UPDATE_SUBMIT';

export const CONTENT_CONSTRAINT_DETAIL_AGENCIES_READ = 'CONTENT_CONSTRAINT_DETAIL_AGENCIES_READ';

export const CONTENT_CONSTRAINT_DETAIL_ARTEFACT_TYPE_SELECT = 'CONTENT_CONSTRAINT_DETAIL_ARTEFACT_TYPE_SELECT';

export const CONTENT_CONSTRAINT_DETAIL_ARTEFACTS_SHOW = 'CONTENT_CONSTRAINT_DETAIL_ARTEFACTS_SHOW';
export const CONTENT_CONSTRAINT_DETAIL_ARTEFACTS_HIDE = 'CONTENT_CONSTRAINT_DETAIL_ARTEFACTS_HIDE';
export const CONTENT_CONSTRAINT_DETAIL_ARTEFACTS_READ = 'CONTENT_CONSTRAINT_DETAIL_ARTEFACTS_READ';
export const CONTENT_CONSTRAINT_DETAIL_ARTEFACT_SET = 'CONTENT_CONSTRAINT_DETAIL_ARTEFACT_SET';
export const CONTENT_CONSTRAINT_DETAIL_ARTEFACT_UNSET = 'CONTENT_CONSTRAINT_DETAIL_ARTEFACT_UNSET';
export const CONTENT_CONSTRAINT_DETAIL_ARTEFACT_READ = 'CONTENT_CONSTRAINT_DETAIL_ARTEFACT_READ';

export const CONTENT_CONSTRAINT_DETAIL_RELEASE_CALENDAR_CHANGE = 'CONTENT_CONSTRAINT_DETAIL_RELEASE_CALENDAR_CHANGE';

export const CONTENT_CONSTRAINT_DETAIL_DOWNLOAD_SHOW = 'CONTENT_CONSTRAINT_DETAIL_DOWNLOAD_SHOW';
export const CONTENT_CONSTRAINT_DETAIL_DOWNLOAD_HIDE = 'CONTENT_CONSTRAINT_DETAIL_DOWNLOAD_HIDE';
export const CONTENT_CONSTRAINT_DETAIL_DOWNLOAD_CHANGE = 'CONTENT_CONSTRAINT_DETAIL_DOWNLOAD_CHANGE';
export const CONTENT_CONSTRAINT_DETAIL_DOWNLOAD_SUBMIT = 'CONTENT_CONSTRAINT_DETAIL_DOWNLOAD_SUBMIT';

export const CONTENT_CONSTRAINT_DETAIL_CLONE_SHOW = 'CONTENT_CONSTRAINT_DETAIL_CLONE_SHOW';
export const CONTENT_CONSTRAINT_DETAIL_CLONE_HIDE = 'CONTENT_CONSTRAINT_DETAIL_CLONE_HIDE';
export const CONTENT_CONSTRAINT_DETAIL_CLONE_CHANGE = 'CONTENT_CONSTRAINT_DETAIL_CLONE_CHANGE';
export const CONTENT_CONSTRAINT_DETAIL_CLONE_SUBMIT = 'CONTENT_CONSTRAINT_DETAIL_CLONE_SUBMIT';

export const CONTENT_CONSTRAINT_DETAIL_EXPORT_SHOW = 'CONTENT_CONSTRAINT_DETAIL_EXPORT_SHOW';
export const CONTENT_CONSTRAINT_DETAIL_EXPORT_HIDE = 'CONTENT_CONSTRAINT_DETAIL_EXPORT_HIDE';
export const CONTENT_CONSTRAINT_DETAIL_EXPORT_CHANGE = 'CONTENT_CONSTRAINT_DETAIL_EXPORT_CHANGE';
export const CONTENT_CONSTRAINT_DETAIL_EXPORT_SUBMIT = 'CONTENT_CONSTRAINT_DETAIL_EXPORT_SUBMIT';

export const CONTENT_CONSTRAINT_DETAIL_EXPORT_REPORT_HIDE = 'CONTENT_CONSTRAINT_DETAIL_EXPORT_REPORT_HIDE';

export const createContentConstraintDetail = () => ({
  type: CONTENT_CONSTRAINT_DETAIL_CREATE
});

export const editContentConstraintDetail = contentConstraintTriplet => ({
  type: CONTENT_CONSTRAINT_DETAIL_EDIT,
  contentConstraintTriplet
});

export const showContentConstraintDetail = contentConstraintTriplet => ({
  type: CONTENT_CONSTRAINT_DETAIL_SHOW,
  contentConstraintTriplet
});

export const readContentConstraintDetail = contentConstraintTriplet => getRequest(
  CONTENT_CONSTRAINT_DETAIL_READ,
  getContentConstraintUrl(contentConstraintTriplet)
);

export const changeContentConstraintDetail = fields => ({
  type: CONTENT_CONSTRAINT_DETAIL_CHANGE,
  fields
});

export const submitContentConstraintDetailCreate =
  (contentConstraint, attachmentType, attachmentUrn, filter) =>
    postRequest(
      CONTENT_CONSTRAINT_DETAIL_CREATE_SUBMIT,
      getCreateArtefactsUrl(),
      getSdmxJsonFromSdmxJsonStructures(
        [
          getSdmxJsonStructureFromContentConstraint(
            contentConstraint,
            attachmentType,
            attachmentUrn,
            filter
          )
        ],
        SDMX_JSON_CONTENT_CONSTRAINT_LIST_KEY
      ),
      t => ({
        success: t('scenes.metaManager.contentConstraints.messages.create.success')
      })
    );

export const submitContentConstraintDetailUpdate =
  (contentConstraint, attachmentType, attachmentUrn, filter, timePeriod, keepModalOpen) => ({
    ...putRequest(
      CONTENT_CONSTRAINT_DETAIL_UPDATE_SUBMIT,
      getUpdateArtefactsUrl(),
      getSdmxJsonFromSdmxJsonStructures(
        [getSdmxJsonStructureFromContentConstraint(
          contentConstraint,
          attachmentType,
          attachmentUrn,
          filter,
          timePeriod
        )],
        SDMX_JSON_CONTENT_CONSTRAINT_LIST_KEY
      ),
      t => ({
        success: t('scenes.metaManager.contentConstraints.messages.update.success')
      })
    ),
    keepModalOpen
  });

export const readContentConstraintDetailAgencies = allowedAgencies => ({
  ...getRequest(
    CONTENT_CONSTRAINT_DETAIL_AGENCIES_READ,
    getAgencyNamesUrl()
  ),
  allowedAgencies
});

export const hideContentConstraintDetail = () => ({
  type: CONTENT_CONSTRAINT_DETAIL_HIDE
});

export const selectContentConstraintDetailArtefactType = artefactType => ({
  type: CONTENT_CONSTRAINT_DETAIL_ARTEFACT_TYPE_SELECT,
  artefactType
});


export const showContentConstraintDetailArtefacts = () => ({
  type: CONTENT_CONSTRAINT_DETAIL_ARTEFACTS_SHOW
});

export const hideContentConstraintDetailArtefacts = () => ({
  type: CONTENT_CONSTRAINT_DETAIL_ARTEFACTS_HIDE
});

export const readContentConstraintDetailArtefacts = artefactType => getRequest(
  CONTENT_CONSTRAINT_DETAIL_ARTEFACTS_READ,
  artefactType === "dataflow"
    ? getDataflowUrl()
    : getDsdUrl()
);

export const setContentConstraintDetailArtefact = artefactTriplet => ({
  type: CONTENT_CONSTRAINT_DETAIL_ARTEFACT_SET,
  artefactTriplet
});

export const unsetContentConstraintDetailArtefact = () => ({
  type: CONTENT_CONSTRAINT_DETAIL_ARTEFACT_UNSET
});

export const readContentConstraintDetailArtefact = (artefactType, artefactTriplet, haveDMWS, isUserLogged) => ({
  ...allRequest(
    CONTENT_CONSTRAINT_DETAIL_ARTEFACT_READ,
    artefactType === CONTENT_CONSTRAINTS_ARTEFACT_TYPE_DATAFLOW
      ? [REQUEST_METHOD_GET].concat((haveDMWS && isUserLogged) ? REQUEST_METHOD_GET : [])
      : [REQUEST_METHOD_GET],
    artefactType === CONTENT_CONSTRAINTS_ARTEFACT_TYPE_DATAFLOW
      ? [getDataflowUrl(artefactTriplet)].concat((haveDMWS && isUserLogged) ? getDdbDataflowUrl() : [])
      : [getDsdUrl(artefactTriplet)]
  ),
  artefactType,
  haveDMWS,
  isUserLogged
});

export const CONTENT_CONSTRAINT_DETAIL_FILTER_RESET = 'CONTENT_CONSTRAINT_DETAIL_FILTER_RESET';

export const resetContentConstraintDetailFilter = () => ({
  type: CONTENT_CONSTRAINT_DETAIL_FILTER_RESET
});

export const CONTENT_CONSTRAINT_DETAIL_FILTER_COLUMN_CODELIST_COUNT_READ = 'CONTENT_CONSTRAINT_DETAIL_FILTER_COLUMN_CODELIST_COUNT_READ';

export const readContentConstraintDetailFilterColumnCodelistCount = (codelistTriplet, language) => ({
  ...postRequest(
    CONTENT_CONSTRAINT_DETAIL_FILTER_COLUMN_CODELIST_COUNT_READ,
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

export const CONTENT_CONSTRAINT_DETAIL_FILTER_COLUMN_CODELIST_TREE_READ = 'CONTENT_CONSTRAINT_DETAIL_FILTER_COLUMN_CODELIST_TREE_READ';

export const readContentConstraintDetailFilterColumnCodelistTree = (codelistTriplet, language) => ({
  ...postRequest(
    CONTENT_CONSTRAINT_DETAIL_FILTER_COLUMN_CODELIST_TREE_READ,
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

export const CONTENT_CONSTRAINT_DETAIL_FILTER_MODAL_SHOW = 'CONTENT_CONSTRAINT_DETAIL_FILTER_MODAL_SHOW';

export const showContentConstraintDetailFilterModal = () => ({
  type: CONTENT_CONSTRAINT_DETAIL_FILTER_MODAL_SHOW
});

export const CONTENT_CONSTRAINT_DETAIL_FILTER_MODAL_HIDE = 'CONTENT_CONSTRAINT_DETAIL_FILTER_MODAL_HIDE';

export const hideContentConstraintDetailFilterModal = () => ({
  type: CONTENT_CONSTRAINT_DETAIL_FILTER_MODAL_HIDE
});

export const CONTENT_CONSTRAINT_DETAIL_FILTER_QUERY_SHOW = 'CONTENT_CONSTRAINT_DETAIL_FILTER_QUERY_SHOW';

export const showContentConstraintDetailFilterQuery = () => ({
  type: CONTENT_CONSTRAINT_DETAIL_FILTER_QUERY_SHOW
});

export const CONTENT_CONSTRAINT_DETAIL_FILTER_QUERY_HIDE = 'CONTENT_CONSTRAINT_DETAIL_FILTER_QUERY_HIDE';

export const hideContentConstraintDetailFilterQuery = () => ({
  type: CONTENT_CONSTRAINT_DETAIL_FILTER_QUERY_HIDE
});

export const CONTENT_CONSTRAINT_DETAIL_FILTER_CHANGE = 'CONTENT_CONSTRAINT_DETAIL_FILTER_CHANGE';

export const changeContentConstraintDetailFilter = filter => ({
  type: CONTENT_CONSTRAINT_DETAIL_FILTER_CHANGE
});

export const CONTENT_CONSTRAINT_DETAIL_FILTER_COLUMN_FILTERED_VALUES_READ = 'CONTENT_CONSTRAINT_DETAIL_FILTER_COLUMN_FILTERED_VALUES_READ';

export const readContentConstraintDetailFilterColumnFilteredValues = (cubeId, colNames, filter) => ({
  ...postRequest(
    CONTENT_CONSTRAINT_DETAIL_FILTER_COLUMN_FILTERED_VALUES_READ,
    getDataflowColumnPreviewUrl(
      colNames[colNames.length - 1],
      1,
      -1
    ),
    {
      idCube: cubeId,
      dataflowColumns: colNames,
      filter: getServerQueryObj(undefined, getFilterObjFromStr("")).Filter
    }
  ),
  colName: colNames[colNames.length - 1]
});

export const CONTENT_CONSTRAINT_DETAIL_FILTER_DSD_READ = 'CONTENT_CONSTRAINT_DETAIL_FILTER_DSD_READ';

export const readContentConstraintDetailFilterDsd = dsdTriplet => getRequest(
  CONTENT_CONSTRAINT_DETAIL_FILTER_DSD_READ,
  getDsdUrl(dsdTriplet)
);

export const CONTENT_CONSTRAINT_DETAIL_FILTER_CUBE_READ = 'CONTENT_CONSTRAINT_DETAIL_FILTER_CUBE_READ';

export const readContentConstraintDetailFilterCube = cubeId => getRequest(
  CONTENT_CONSTRAINT_DETAIL_FILTER_CUBE_READ,
  getCubeUrl(cubeId)
);

export const CONTENT_CONSTRAINT_DETAIL_FILTER_COLUMN_MODE_CHANGE = 'CONTENT_CONSTRAINT_DETAIL_FILTER_COLUMN_MODE_CHANGE';

export const changeContentConstraintDetailFilterColumnMode = (colName, mode) => ({
  type: CONTENT_CONSTRAINT_DETAIL_FILTER_COLUMN_MODE_CHANGE,
  colName,
  mode
});

export const CONTENT_CONSTRAINT_DETAIL_FILTER_COLUMN_VALUES_CHANGE = 'CONTENT_CONSTRAINT_DETAIL_FILTER_COLUMN_VALUES_CHANGE';

export const changeContentConstraintDetailFilterColumnValues = (colName, values) => ({
  type: CONTENT_CONSTRAINT_DETAIL_FILTER_COLUMN_VALUES_CHANGE,
  colName,
  values
});

export const changeContentConstraintDetailReleaseCalendar = fields => ({
  type: CONTENT_CONSTRAINT_DETAIL_RELEASE_CALENDAR_CHANGE,
  fields
});

export const showContentConstraintDetailDownload = (artefactTriplet, lang) => ({
  type: CONTENT_CONSTRAINT_DETAIL_DOWNLOAD_SHOW,
  artefactTriplet,
  lang
});

export const hideContentConstraintDetailDownload = () => ({
  type: CONTENT_CONSTRAINT_DETAIL_DOWNLOAD_HIDE
});

export const changeContentConstraintDetailDownload = fields => ({
  type: CONTENT_CONSTRAINT_DETAIL_DOWNLOAD_CHANGE,
  fields
});

export const submitContentConstraintDetailDownload = (artefactTriplets, downloadContentConstraintParams, lang) => {

  return (artefactTriplets && artefactTriplets.length > 1)
    ? {
      ...postRequest(
        CONTENT_CONSTRAINT_DETAIL_DOWNLOAD_SUBMIT,
        getMultipleDownloadArtefactUrl(
          ARTEFACT_TYPE_CONTENT_CONSTRAINT,
          downloadContentConstraintParams.format,
          downloadContentConstraintParams.references,
          downloadContentConstraintParams.compression,
          lang
        ),
        artefactTriplets.map(({id, agencyID, version}) => ({id, agency: agencyID, version})),
        undefined,
        undefined,
        true
      ),
      fileSave: getArtefactDownloadFileSaveNameAndType(
        artefactTriplets,
        ARTEFACT_TYPE_CONTENT_CONSTRAINT,
        downloadContentConstraintParams.format,
        downloadContentConstraintParams.compression
      )
    }
    : {
      ...getRequest(
        CONTENT_CONSTRAINT_DETAIL_DOWNLOAD_SUBMIT,
        getDownloadArtefactUrl(
          ARTEFACT_TYPE_CONTENT_CONSTRAINT,
          artefactTriplets[0],
          downloadContentConstraintParams.format,
          downloadContentConstraintParams.references,
          downloadContentConstraintParams.compression,
          lang
        ),
        undefined,
        true
      ),
      fileSave: getArtefactDownloadFileSaveNameAndType(
        artefactTriplets,
        ARTEFACT_TYPE_CONTENT_CONSTRAINT,
        downloadContentConstraintParams.format,
        downloadContentConstraintParams.compression
      )
    }
};

export const showContentConstraintDetailClone = srcTriplet => ({
  type: CONTENT_CONSTRAINT_DETAIL_CLONE_SHOW,
  srcTriplet
});

export const hideContentConstraintDetailClone = () => ({
  type: CONTENT_CONSTRAINT_DETAIL_CLONE_HIDE
});

export const changeContentConstraintDetailClone = fields => ({
  type: CONTENT_CONSTRAINT_DETAIL_CLONE_CHANGE,
  fields
});

export const submitContentConstraintDetailClone =
  (cloneDestTriplet, srcContentConstraint, srcContentConstraintAttachmentType, srcContentConstraintAttachmentUrn, srcContentConstraintFilter) =>
    postRequest(
      CONTENT_CONSTRAINT_DETAIL_CLONE_SUBMIT,
      getCreateArtefactsUrl(),
      getSdmxJsonFromSdmxJsonStructures(
        [
          getSdmxJsonStructureFromContentConstraint(
            {
              ...srcContentConstraint,
              ...cloneDestTriplet,
              isFinal: false,
              autoAnnotations: null
            },
            srcContentConstraintAttachmentType,
            srcContentConstraintAttachmentUrn,
            srcContentConstraintFilter
          )],
        SDMX_JSON_CONTENT_CONSTRAINT_LIST_KEY
      ),
      t => ({
        success: t('commons.artefact.messages.clone.success')
      })
    );

export const showContentConstraintDetailExport =
  (sourceTriplet, sourceAttachmentType, sourceAttachmentUrn, sourceFilter) => ({
    type: CONTENT_CONSTRAINT_DETAIL_EXPORT_SHOW,
    sourceTriplet,
    sourceAttachmentType,
    sourceAttachmentUrn,
    sourceFilter
  });

export const hideContentConstraintDetailExport = () => ({
  type: CONTENT_CONSTRAINT_DETAIL_EXPORT_HIDE
});

export const changeContentConstraintDetailExport = fields => ({
  type: CONTENT_CONSTRAINT_DETAIL_EXPORT_CHANGE,
  fields
});

export const submitContentConstraintDetailExport = (sourceTriplet, destination) => postRequest(
  CONTENT_CONSTRAINT_DETAIL_EXPORT_SUBMIT,
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
    EnumType: "ContentConstraint",
    CopyReferencedArtefact: false
  }
);

export const hideContentConstraintDetailExportReport = () => ({
  type: CONTENT_CONSTRAINT_DETAIL_EXPORT_REPORT_HIDE
});
