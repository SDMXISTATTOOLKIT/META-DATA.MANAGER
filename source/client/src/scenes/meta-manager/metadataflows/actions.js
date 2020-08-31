import {
  allRequest,
  deleteRequest,
  getRequest,
  postRequest,
  putRequest,
  REQUEST_METHOD_DELETE
} from "../../../middlewares/api/actions";
import {
  getAgencyNamesUrl,
  getArtefactReferenceUrl,
  getCreateArtefactsUrl,
  getDeleteArtefactUrl,
  getDownloadArtefactUrl,
  getExportArtefactUrl,
  getMetadataflowOwnersUrl,
  getMetadataflowUrl,
  getMsdUrl,
  getMultipleDownloadArtefactUrl,
  getSetOwnersUrl,
  getUpdateArtefactsUrl,
  getUsers
} from "../../../constants/urls";
import {
  getSdmxJsonFromSdmxJsonStructures,
  getSdmxJsonStructureFromArtefact,
  getStringFromArtefactTriplet,
  SDMX_JSON_METADATAFLOW_LIST_KEY
} from "../../../utils/sdmxJson";
import {ARTEFACT_TYPE_METADATAFLOW, getArtefactDownloadFileSaveNameAndType} from "../../../constants/download";

export const METADATAFLOWS_LIST_METADATAFLOWS_READ = 'METADATAFLOWS_LIST_METADATAFLOWS_READ';
export const METADATAFLOWS_METADATAFLOW_CREATE = 'METADATAFLOWS_METADATAFLOW_CREATE';
export const METADATAFLOWS_METADATAFLOW_EDIT = 'METADATAFLOWS_METADATAFLOW_EDIT';
export const METADATAFLOWS_METADATAFLOW_DELETE = 'METADATAFLOWS_METADATAFLOW_DELETE';
export const METADATAFLOWS_DETAIL_METADATAFLOW_READ = 'METADATAFLOWS_DETAIL_METADATAFLOW_READ';
export const METADATAFLOWS_DETAIL_METADATAFLOW_CHANGE = 'METADATAFLOWS_DETAIL_METADATAFLOW_CHANGE';
export const METADATAFLOWS_DETAIL_METADATAFLOW_CREATE_SUBMIT = 'METADATAFLOWS_DETAIL_METADATAFLOW_CREATE_SUBMIT';
export const METADATAFLOWS_DETAIL_METADATAFLOW_UPDATE_SUBMIT = 'METADATAFLOWS_DETAIL_METADATAFLOW_UPDATE_SUBMIT';
export const METADATAFLOWS_DETAIL_AGENCIES_READ = 'METADATAFLOWS_DETAIL_AGENCIES_READ';
export const METADATAFLOWS_DETAIL_MSDS_SHOW = 'METADATAFLOWS_DETAIL_MSDS_SHOW';
export const METADATAFLOWS_DETAIL_MSDS_HIDE = 'METADATAFLOWS_DETAIL_MSDS_HIDE';
export const METADATAFLOWS_DETAIL_MSDS_READ = 'METADATAFLOWS_DETAIL_MSDS_READ';
export const METADATAFLOWS_DETAIL_MSD_SET = 'METADATAFLOWS_DETAIL_MSD_SET';
export const METADATAFLOWS_DETAIL_MSD_UNSET = 'METADATAFLOWS_DETAIL_MSD_UNSET';
export const METADATAFLOWS_DETAIL_HIDE = 'METADATAFLOWS_DETAIL_HIDE';
export const METADATAFLOWS_DETAIL_ANNOTATIONS_SHOW = 'METADATAFLOWS_DETAIL_ANNOTATIONS_SHOW';
export const METADATAFLOWS_DETAIL_ANNOTATIONS_HIDE = 'METADATAFLOWS_DETAIL_ANNOTATIONS_HIDE';
export const METADATAFLOWS_SELECTED_METADATAFLOWS_DELETE = 'METADATAFLOWS_SELECTED_METADATAFLOWS_DELETE';

export const METADATAFLOWS_METADATAFLOW_DOWNLOAD_SHOW = 'METADATAFLOWS_METADATAFLOW_DOWNLOAD_SHOW';
export const METADATAFLOWS_METADATAFLOW_DOWNLOAD_HIDE = 'METADATAFLOWS_METADATAFLOW_DOWNLOAD_HIDE';
export const METADATAFLOWS_METADATAFLOW_DOWNLOAD_CHANGE = 'METADATAFLOWS_METADATAFLOW_DOWNLOAD_CHANGE';
export const METADATAFLOWS_METADATAFLOW_DOWNLOAD = 'METADATAFLOWS_METADATAFLOW_DOWNLOAD';

export const METADATAFLOWS_METADATAFLOW_CLONE_SHOW = 'METADATAFLOWS_METADATAFLOW_CLONE_SHOW';
export const METADATAFLOWS_METADATAFLOW_CLONE_HIDE = 'METADATAFLOWS_METADATAFLOW_CLONE_HIDE';
export const METADATAFLOWS_METADATAFLOW_CLONE_CHANGE = 'METADATAFLOWS_METADATAFLOW_CLONE_CHANGE';
export const METADATAFLOWS_METADATAFLOW_CLONE_SUBMIT = 'METADATAFLOWS_METADATAFLOW_CLONE_SUBMIT';

export const METADATAFLOWS_METADATAFLOW_EXPORT_SHOW = 'METADATAFLOWS_METADATAFLOW_EXPORT_SHOW';
export const METADATAFLOWS_METADATAFLOW_EXPORT_HIDE = 'METADATAFLOWS_METADATAFLOW_EXPORT_HIDE';
export const METADATAFLOWS_METADATAFLOW_EXPORT_CHANGE = 'METADATAFLOWS_METADATAFLOW_EXPORT_CHANGE';
export const METADATAFLOWS_METADATAFLOW_EXPORT_SUBMIT = 'METADATAFLOWS_METADATAFLOW_EXPORT_SUBMIT';
export const METADATAFLOWS_METADATAFLOW_EXPORT_REPORT_HIDE = 'METADATAFLOWS_METADATAFLOW_EXPORT_REPORT_HIDE';

export const METADATAFLOWS_METADATAFLOW_OWNERSHIP_USERS_READ = 'METADATAFLOWS_METADATAFLOW_OWNERSHIP_USERS_READ';
export const METADATAFLOWS_METADATAFLOW_OWNERSHIP_OWNERS_READ = 'METADATAFLOWS_METADATAFLOW_OWNERSHIP_OWNERS_READ';
export const METADATAFLOWS_METADATAFLOW_OWNERSHIP_SHOW = 'METADATAFLOWS_METADATAFLOW_OWNERSHIP_SHOW';
export const METADATAFLOWS_METADATAFLOW_OWNERSHIP_HIDE = 'METADATAFLOWS_METADATAFLOW_OWNERSHIP_HIDE';
export const METADATAFLOWS_METADATAFLOW_OWNERSHIP_OWNERS_CHANGE = 'METADATAFLOWS_METADATAFLOW_OWNERSHIP_OWNERS_CHANGE';
export const METADATAFLOWS_METADATAFLOW_OWNERSHIP_OWNERS_SUBMIT = 'METADATAFLOWS_METADATAFLOW_OWNERSHIP_OWNERS_SUBMIT';

export const METADATAFLOWS_METADATAFLOW_PARENTS_AND_CHILDREN_READ = 'METADATAFLOWS_METADATAFLOW_PARENTS_AND_CHILDREN_READ';
export const METADATAFLOWS_METADATAFLOW_PARENTS_AND_CHILDREN_HIDE = 'METADATAFLOWS_METADATAFLOW_PARENTS_AND_CHILDREN_HIDE';

export const readMetadataflowsListMetadataflows = () => getRequest(
  METADATAFLOWS_LIST_METADATAFLOWS_READ,
  getMetadataflowUrl()
);

export const createMetadataflowsMetadataflow = () => ({
  type: METADATAFLOWS_METADATAFLOW_CREATE
});

export const editMetadataflowsMetadataflow = metadataflowTriplet => ({
  type: METADATAFLOWS_METADATAFLOW_EDIT,
  metadataflowTriplet
});

export const deleteMetadataflowsMetadataflow = metadataflowTriplet => deleteRequest(
  METADATAFLOWS_METADATAFLOW_DELETE,
  getDeleteArtefactUrl("Metadataflow", metadataflowTriplet),
  t => ({
    success: t('scenes.metaManager.commons.messages.delete.success')
  })
);

export const readMetadataflowsDetailMetadataflow = metadataflowTriplet => getRequest(
  METADATAFLOWS_DETAIL_METADATAFLOW_READ,
  getMetadataflowUrl(metadataflowTriplet)
);

export const changeMetadataflowsDetailMetadataflow = fields => ({
  type: METADATAFLOWS_DETAIL_METADATAFLOW_CHANGE,
  fields
});

export const submitMetadataflowsDetailMetadataflowCreate = metadataflow => postRequest(
  METADATAFLOWS_DETAIL_METADATAFLOW_CREATE_SUBMIT,
  getCreateArtefactsUrl(),
  getSdmxJsonFromSdmxJsonStructures(
    [getSdmxJsonStructureFromArtefact(metadataflow)],
    SDMX_JSON_METADATAFLOW_LIST_KEY
  ),
  t => ({
    success: t('scenes.metaManager.metadataflows.messages.create.success')
  })
);

export const submitMetadataflowsDetailMetadataflowUpdate = (metadataflow, keepModalOpen) => {

  return ({
    ...putRequest(
      METADATAFLOWS_DETAIL_METADATAFLOW_UPDATE_SUBMIT,
      getUpdateArtefactsUrl(),
      getSdmxJsonFromSdmxJsonStructures(
        [getSdmxJsonStructureFromArtefact(metadataflow)],
        SDMX_JSON_METADATAFLOW_LIST_KEY
      ),
      t => ({
        success: t('scenes.metaManager.metadataflows.messages.update.success')
      })
    ),
    keepModalOpen
  })
};

export const readMetadataflowsDetailAgencies = allowedAgencies => ({
  ...getRequest(
    METADATAFLOWS_DETAIL_AGENCIES_READ,
    getAgencyNamesUrl()
  ),
  allowedAgencies
});

export const showMetadataflowsDetailMsds = () => ({
  type: METADATAFLOWS_DETAIL_MSDS_SHOW
});

export const hideMetadataflowsDetailMsds = () => ({
  type: METADATAFLOWS_DETAIL_MSDS_HIDE
});

export const readMetadataflowsDetailMsds = () => getRequest(
  METADATAFLOWS_DETAIL_MSDS_READ,
  getMsdUrl()
);

export const setMetadataflowsDetailMsd = msdTriplet => ({
  type: METADATAFLOWS_DETAIL_MSD_SET,
  msdTriplet: msdTriplet
});

export const unsetMetadataflowsDetailMsd = () => ({
  type: METADATAFLOWS_DETAIL_MSD_UNSET
});

export const hideMetadataflowsDetail = () => ({
  type: METADATAFLOWS_DETAIL_HIDE
});

export const showMetadataflowsDetailAnnotations = (annotations, triplet) => ({
  type: METADATAFLOWS_DETAIL_ANNOTATIONS_SHOW,
  annotations,
  triplet
});

export const hideMetadataflowsDetailAnnotations = () => ({
  type: METADATAFLOWS_DETAIL_ANNOTATIONS_HIDE
});

export const deleteMetadataflowsSelectedMetadataflows = metadataflowTriplets => allRequest(
  METADATAFLOWS_SELECTED_METADATAFLOWS_DELETE,
  metadataflowTriplets.map(() => REQUEST_METHOD_DELETE),
  metadataflowTriplets.map(triplet => getDeleteArtefactUrl("Metadataflow", triplet)),
  null,
  t => ({
    success: t('scenes.metaManager.commons.messages.multiDelete.success')
  }),
  metadataflowTriplets.map(getStringFromArtefactTriplet)
);

export const showMetadataflowsMetadataflowDownload = (artefactTriplets, lang) => ({
  type: METADATAFLOWS_METADATAFLOW_DOWNLOAD_SHOW,
  artefactTriplets,
  lang
});

export const hideMetadataflowsMetadataflowDownload = () => ({
  type: METADATAFLOWS_METADATAFLOW_DOWNLOAD_HIDE
});

export const changeMetadataflowsMetadataflowDownload = fields => ({
  type: METADATAFLOWS_METADATAFLOW_DOWNLOAD_CHANGE,
  fields
});

export const downloadMetadataflowsMetadataflow = (artefactTriplets, downloadMetadataflowParams, lang) => {

  return (artefactTriplets && artefactTriplets.length > 1)
    ? {
      ...postRequest(
        METADATAFLOWS_METADATAFLOW_DOWNLOAD,
        getMultipleDownloadArtefactUrl(
          ARTEFACT_TYPE_METADATAFLOW,
          downloadMetadataflowParams.format,
          downloadMetadataflowParams.references,
          downloadMetadataflowParams.compression,
          lang
        ),
        artefactTriplets.map(({id, agencyID, version}) => ({id, agency: agencyID, version})),
        undefined,
        undefined,
        true
      ),
      fileSave: getArtefactDownloadFileSaveNameAndType(
        artefactTriplets,
        ARTEFACT_TYPE_METADATAFLOW,
        downloadMetadataflowParams.format,
        downloadMetadataflowParams.compression
      )
    }
    : {
      ...getRequest(
        METADATAFLOWS_METADATAFLOW_DOWNLOAD,
        getDownloadArtefactUrl(
          ARTEFACT_TYPE_METADATAFLOW,
          artefactTriplets[0],
          downloadMetadataflowParams.format,
          downloadMetadataflowParams.references,
          downloadMetadataflowParams.compression,
          lang
        ),
        undefined,
        true
      ),
      fileSave: getArtefactDownloadFileSaveNameAndType(
        artefactTriplets,
        ARTEFACT_TYPE_METADATAFLOW,
        downloadMetadataflowParams.format,
        downloadMetadataflowParams.compression
      )
    }
};

export const showMetadataflowsMetadataflowClone = srcTriplet => ({
  type: METADATAFLOWS_METADATAFLOW_CLONE_SHOW,
  srcTriplet
});

export const hideMetadataflowsMetadataflowClone = () => ({
  type: METADATAFLOWS_METADATAFLOW_CLONE_HIDE
});

export const changeMetadataflowsMetadataflowClone = fields => ({
  type: METADATAFLOWS_METADATAFLOW_CLONE_CHANGE,
  fields
});

export const submitMetadataflowsMetadataflowClone = (cloneDestTriplet, srcMetadataflow) => postRequest(
  METADATAFLOWS_METADATAFLOW_CLONE_SUBMIT,
  getCreateArtefactsUrl(),
  getSdmxJsonFromSdmxJsonStructures(
    [
      getSdmxJsonStructureFromArtefact({
        ...srcMetadataflow,
        ...cloneDestTriplet,
        isFinal: false,
        autoAnnotations: null
      })
    ],
    SDMX_JSON_METADATAFLOW_LIST_KEY
  ),
  t => ({
    success: t('commons.artefact.messages.clone.success')
  })
);

export const showMetadataflowsMetadataflowExport = sourceTriplet => ({
  type: METADATAFLOWS_METADATAFLOW_EXPORT_SHOW,
  sourceTriplet
});

export const hideMetadataflowsMetadataflowExport = () => ({
  type: METADATAFLOWS_METADATAFLOW_EXPORT_HIDE
});

export const changeMetadataflowsMetadataflowExport = fields => ({
  type: METADATAFLOWS_METADATAFLOW_EXPORT_CHANGE,
  fields
});

export const submitMetadataflowsMetadataflowExport = (sourceTriplet, destination) => postRequest(
  METADATAFLOWS_METADATAFLOW_EXPORT_SUBMIT,
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
    password: btoa(destination.password || ""),
    EnumType: "Metadataflow",
    CopyReferencedArtefact: false
  }
);

export const hideMetadataflowsMetadataflowExportReport = () => ({
  type: METADATAFLOWS_METADATAFLOW_EXPORT_REPORT_HIDE
});

export const showMetadataflowsMetadataflowOwnership = metadataflowTripletStr => ({
  type: METADATAFLOWS_METADATAFLOW_OWNERSHIP_SHOW,
  metadataflowTripletStr
});

export const hideMetadataflowsMetadataflowOwnership = () => ({
  type: METADATAFLOWS_METADATAFLOW_OWNERSHIP_HIDE
});

export const readMetadataflowsMetadataflowOwnershipUsersRead = () => getRequest(
  METADATAFLOWS_METADATAFLOW_OWNERSHIP_USERS_READ,
  getUsers()
);

export const readMetadataflowsMetadataflowOwnershipOwnersRead = metadataflowTripletStr => getRequest(
  METADATAFLOWS_METADATAFLOW_OWNERSHIP_OWNERS_READ,
  getMetadataflowOwnersUrl(metadataflowTripletStr)
);

export const changeMetadataflowsMetadataflowOwnershipOwners = owners => ({
  type: METADATAFLOWS_METADATAFLOW_OWNERSHIP_OWNERS_CHANGE,
  owners
});

export const submitMetadataflowsMetadataflowOwnership = (metadataflowTripletStr, owners) => postRequest(
  METADATAFLOWS_METADATAFLOW_OWNERSHIP_OWNERS_SUBMIT,
  getSetOwnersUrl(),
  {
    type: "MetadataFlow",
    id: metadataflowTripletStr,
    owners: owners.map(username => ({username}))
  },
  t => ({
    success: t('scenes.metaManager.metadataflows.messages.ownership.success')
  })
);

export const readMetadataflowsMetadataflowParentsAndChildren = (artefactType, artefactTriplet) => getRequest(
  METADATAFLOWS_METADATAFLOW_PARENTS_AND_CHILDREN_READ,
  getArtefactReferenceUrl(artefactType, artefactTriplet)
);

export const hideMetadataflowsMetadataflowParentsAndChildren = () => ({
  type: METADATAFLOWS_METADATAFLOW_PARENTS_AND_CHILDREN_HIDE
});