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
  getDataflowContentConstraintUrl,
  getDataflowOwnersUrl,
  getDataflowUrl,
  getDeleteArtefactUrl,
  getDownloadArtefactUrl,
  getDsdUrl,
  getExportArtefactUrl,
  getMultipleDownloadArtefactUrl,
  getPaginatedCodelistUrl,
  getSetOwnersUrl,
  getUpdateArtefactsUrl,
  getUsers
} from "../../../constants/urls";
import {
  getSdmxJsonFromSdmxJsonStructures,
  getSdmxJsonStructureFromArtefact,
  getStringFromArtefactTriplet,
  SDMX_JSON_DATAFLOW_LIST_KEY
} from "../../../utils/sdmxJson";
import {ARTEFACT_TYPE_DATAFLOW, getArtefactDownloadFileSaveNameAndType} from "../../../constants/download";

export const DATAFLOWS_LIST_DATAFLOWS_READ = 'DATAFLOWS_LIST_DATAFLOWS_READ';
export const DATAFLOWS_DATAFLOW_CREATE = 'DATAFLOWS_DATAFLOW_CREATE';
export const DATAFLOWS_DATAFLOW_EDIT = 'DATAFLOWS_DATAFLOW_EDIT';
export const DATAFLOWS_DATAFLOW_DELETE = 'DATAFLOWS_DATAFLOW_DELETE';
export const DATAFLOWS_DETAIL_DATAFLOW_READ = 'DATAFLOWS_DETAIL_DATAFLOW_READ';
export const DATAFLOWS_DETAIL_DATAFLOW_CHANGE = 'DATAFLOWS_DETAIL_DATAFLOW_CHANGE';
export const DATAFLOWS_DETAIL_DATAFLOW_CREATE_SUBMIT = 'DATAFLOWS_DETAIL_DATAFLOW_CREATE_SUBMIT';
export const DATAFLOWS_DETAIL_DATAFLOW_UPDATE_SUBMIT = 'DATAFLOWS_DETAIL_DATAFLOW_UPDATE_SUBMIT';
export const DATAFLOWS_DETAIL_AGENCIES_READ = 'DATAFLOWS_DETAIL_AGENCIES_READ';
export const DATAFLOWS_DETAIL_DSDS_SHOW = 'DATAFLOWS_DETAIL_DSDS_SHOW';
export const DATAFLOWS_DETAIL_DSDS_HIDE = 'DATAFLOWS_DETAIL_DSDS_HIDE';
export const DATAFLOWS_DETAIL_DSDS_READ = 'DATAFLOWS_DETAIL_DSDS_READ';
export const DATAFLOWS_DETAIL_DSD_SET = 'DATAFLOWS_DETAIL_DSD_SET';
export const DATAFLOWS_DETAIL_DSD_UNSET = 'DATAFLOWS_DETAIL_DSD_UNSET';
export const DATAFLOWS_DETAIL_HIDE = 'DATAFLOWS_DETAIL_HIDE';
export const DATAFLOWS_DETAIL_ANNOTATIONS_SHOW = 'DATAFLOWS_DETAIL_ANNOTATIONS_SHOW';
export const DATAFLOWS_DETAIL_ANNOTATIONS_HIDE = 'DATAFLOWS_DETAIL_ANNOTATIONS_HIDE';
export const DATAFLOWS_DETAIL_LAYOUT_ANNOTATIONS_SHOW = 'DATAFLOWS_DETAIL_LAYOUT_ANNOTATIONS_SHOW';
export const DATAFLOWS_DETAIL_LAYOUT_ANNOTATIONS_HIDE = 'DATAFLOWS_DETAIL_LAYOUT_ANNOTATIONS_HIDE';
export const DATAFLOWS_SELECTED_DATAFLOWS_DELETE = 'DATAFLOWS_SELECTED_DATAFLOWS_DELETE';
export const DATAFLOWS_DATAFLOW_DOWNLOAD_SHOW = 'DATAFLOWS_DATAFLOW_DOWNLOAD_SHOW';
export const DATAFLOWS_DATAFLOW_DOWNLOAD_HIDE = 'DATAFLOWS_DATAFLOW_DOWNLOAD_HIDE';
export const DATAFLOWS_DATAFLOW_DOWNLOAD_CHANGE = 'DATAFLOWS_DATAFLOW_DOWNLOAD_CHANGE';
export const DATAFLOWS_DATAFLOW_DOWNLOAD_SUBMIT = 'DATAFLOWS_DATAFLOW_DOWNLOAD_SUBMIT';
export const DATAFLOWS_DATAFLOW_CLONE_SHOW = 'DATAFLOWS_DATAFLOW_CLONE_SHOW';
export const DATAFLOWS_DATAFLOW_CLONE_HIDE = 'DATAFLOWS_DATAFLOW_CLONE_HIDE';
export const DATAFLOWS_DATAFLOW_CLONE_CHANGE = 'DATAFLOWS_DATAFLOW_CLONE_CHANGE';
export const DATAFLOWS_DATAFLOW_CLONE_SUBMIT = 'DATAFLOWS_DATAFLOW_CLONE_SUBMIT';

export const DATAFLOWS_DATAFLOW_EXPORT_SHOW = 'DATAFLOWS_DATAFLOW_EXPORT_SHOW';
export const DATAFLOWS_DATAFLOW_EXPORT_HIDE = 'DATAFLOWS_DATAFLOW_EXPORT_HIDE';
export const DATAFLOWS_DATAFLOW_EXPORT_CHANGE = 'DATAFLOWS_DATAFLOW_EXPORT_CHANGE';
export const DATAFLOWS_DATAFLOW_EXPORT_SUBMIT = 'DATAFLOWS_DATAFLOW_EXPORT_SUBMIT';

export const DATAFLOWS_DATAFLOW_EXPORT_REPORT_HIDE = 'DATAFLOWS_DATAFLOW_EXPORT_REPORT_HIDE';

export const DATAFLOWS_DETAIL_DSD_FOR_LAYOUT_ANNOTATIONS_READ = 'DATAFLOWS_DETAIL_DSD_FOR_LAYOUT_ANNOTATIONS_READ';

export const DATAFLOWS_DATAFLOW_OWNERSHIP_USERS_READ = 'DATAFLOWS_DATAFLOW_OWNERSHIP_USERS_READ';
export const DATAFLOWS_DATAFLOW_OWNERSHIP_OWNERS_READ = 'DATAFLOWS_DATAFLOW_OWNERSHIP_OWNERS_READ';
export const DATAFLOWS_DATAFLOW_OWNERSHIP_SHOW = 'DATAFLOWS_DATAFLOW_OWNERSHIP_SHOW';
export const DATAFLOWS_DATAFLOW_OWNERSHIP_HIDE = 'DATAFLOWS_DATAFLOW_OWNERSHIP_HIDE';
export const DATAFLOWS_DATAFLOW_OWNERSHIP_OWNERS_CHANGE = 'DATAFLOWS_DATAFLOW_OWNERSHIP_OWNERS_CHANGE';
export const DATAFLOWS_DATAFLOW_OWNERSHIP_OWNERS_SUBMIT = 'DATAFLOWS_DATAFLOW_OWNERSHIP_OWNERS_SUBMIT';

export const DATAFLOWS_DATAFLOW_PARENTS_AND_CHILDREN_READ = 'DATAFLOWS_DATAFLOW_PARENTS_AND_CHILDREN_READ';
export const DATAFLOWS_DATAFLOW_PARENTS_AND_CHILDREN_HIDE = 'DATAFLOWS_DATAFLOW_PARENTS_AND_CHILDREN_HIDE';

export const DATAFLOWS_DATAFLOW_CONTENT_CONSTRAINTS_SHOW = 'DATAFLOWS_DATAFLOW_CONTENT_CONSTRAINTS_SHOW';
export const DATAFLOWS_DATAFLOW_CONTENT_CONSTRAINTS_READ = 'DATAFLOWS_DATAFLOW_CONTENT_CONSTRAINTS_READ';
export const DATAFLOWS_DATAFLOW_CONTENT_CONSTRAINTS_HIDE = 'DATAFLOWS_DATAFLOW_CONTENT_CONSTRAINTS_HIDE';

export const DATAFLOWS_DETAIL_LAYOUT_ANNOTATIONS_FORM_SHOW = 'DATAFLOWS_DETAIL_LAYOUT_ANNOTATIONS_FORM_SHOW';
export const DATAFLOWS_DETAIL_LAYOUT_ANNOTATIONS_FORM_HIDE = 'DATAFLOWS_DETAIL_LAYOUT_ANNOTATIONS_FORM_HIDE';
export const DATAFLOWS_DETAIL_LAYOUT_ANNOTATIONS_FORM_SUBMIT = 'DATAFLOWS_DETAIL_LAYOUT_ANNOTATIONS_FORM_SUBMIT';
export const DATAFLOWS_DETAIL_LAYOUT_ANNOTATIONS_FORM_RESET = 'DATAFLOWS_DETAIL_LAYOUT_ANNOTATIONS_FORM_RESET';
export const DATAFLOWS_DETAIL_LAYOUT_ANNOTATIONS_ITEMS_PAGE_READ = 'DATAFLOWS_DETAIL_LAYOUT_ANNOTATIONS_ITEMS_PAGE_READ';
export const DATAFLOWS_DETAIL_LAYOUT_ANNOTATIONS_ITEMS_PAGE_RESET = 'DATAFLOWS_DETAIL_LAYOUT_ANNOTATIONS_ITEMS_PAGE_RESET';

export const readDataflowsListDataflows = () => getRequest(
  DATAFLOWS_LIST_DATAFLOWS_READ,
  getDataflowUrl()
);

export const createDataflowsDataflow = () => ({
  type: DATAFLOWS_DATAFLOW_CREATE
});

export const editDataflowsDataflow = dataflowTriplet => ({
  type: DATAFLOWS_DATAFLOW_EDIT,
  dataflowTriplet
});

export const deleteDataflowsDataflow = dataflowTriplet => deleteRequest(
  DATAFLOWS_DATAFLOW_DELETE,
  getDeleteArtefactUrl("Dataflow", dataflowTriplet),
  t => ({
    success: t('scenes.metaManager.commons.messages.delete.success')
  })
);

export const readDataflowsDetailDataflow = dataflowTriplet => getRequest(
  DATAFLOWS_DETAIL_DATAFLOW_READ,
  getDataflowUrl(dataflowTriplet)
);

export const changeDataflowsDetailDataflow = fields => ({
  type: DATAFLOWS_DETAIL_DATAFLOW_CHANGE,
  fields
});

export const submitDataflowsDetailDataflowCreate = dataflow => postRequest(
  DATAFLOWS_DETAIL_DATAFLOW_CREATE_SUBMIT,
  getCreateArtefactsUrl(),
  getSdmxJsonFromSdmxJsonStructures(
    [getSdmxJsonStructureFromArtefact(dataflow)],
    SDMX_JSON_DATAFLOW_LIST_KEY
  ),
  t => ({
    success: t('scenes.metaManager.dataflows.messages.create.success')
  })
);

export const submitDataflowsDetailDataflowUpdate = (dataflow, keepModalOpen) => {

  return ({
    ...putRequest(
      DATAFLOWS_DETAIL_DATAFLOW_UPDATE_SUBMIT,
      getUpdateArtefactsUrl(),
      getSdmxJsonFromSdmxJsonStructures(
        [getSdmxJsonStructureFromArtefact(dataflow)],
        SDMX_JSON_DATAFLOW_LIST_KEY
      ),
      t => ({
        success: t('scenes.metaManager.dataflows.messages.update.success')
      })
    ),
    keepModalOpen
  })
};

export const readDataflowsDetailAgencies = allowedAgencies => ({
  ...getRequest(
    DATAFLOWS_DETAIL_AGENCIES_READ,
    getAgencyNamesUrl()
  ),
  allowedAgencies
});

export const showDataflowsDetailDsds = () => ({
  type: DATAFLOWS_DETAIL_DSDS_SHOW
});

export const hideDataflowsDetailDsds = () => ({
  type: DATAFLOWS_DETAIL_DSDS_HIDE
});

export const readDataflowsDetailDsds = () => getRequest(
  DATAFLOWS_DETAIL_DSDS_READ,
  getDsdUrl(null, true)
);

export const setDataflowsDetailDsd = dsdTriplet => ({
  type: DATAFLOWS_DETAIL_DSD_SET,
  dsdTriplet
});

export const unsetDataflowsDetailDsd = () => ({
  type: DATAFLOWS_DETAIL_DSD_UNSET
});

export const hideDataflowsDetail = () => ({
  type: DATAFLOWS_DETAIL_HIDE
});

export const showDataflowsDetailAnnotations = (annotations, triplet) => ({
  type: DATAFLOWS_DETAIL_ANNOTATIONS_SHOW,
  annotations,
  triplet
});

export const hideDataflowsDetailAnnotations = () => ({
  type: DATAFLOWS_DETAIL_ANNOTATIONS_HIDE
});

export const showDataflowsDetailLayoutAnnotations = (annotations, triplet) => ({
  type: DATAFLOWS_DETAIL_LAYOUT_ANNOTATIONS_SHOW,
  annotations,
  triplet
});

export const hideDataflowsDetailLayoutAnnotations = () => ({
  type: DATAFLOWS_DETAIL_LAYOUT_ANNOTATIONS_HIDE
});

export const deleteDataflowsSelectedDataflows = dataflowTriplets => allRequest(
  DATAFLOWS_SELECTED_DATAFLOWS_DELETE,
  dataflowTriplets.map(() => REQUEST_METHOD_DELETE),
  dataflowTriplets.map(triplet => getDeleteArtefactUrl("Dataflow", triplet)),
  null,
  t => ({
    success: t('scenes.metaManager.commons.messages.multiDelete.success')
  }),
  dataflowTriplets.map(getStringFromArtefactTriplet)
);

export const showDataflowsDataflowDownload = (artefactTriplets, lang) => ({
  type: DATAFLOWS_DATAFLOW_DOWNLOAD_SHOW,
  artefactTriplets,
  lang
});

export const hideDataflowsDataflowDownload = () => ({
  type: DATAFLOWS_DATAFLOW_DOWNLOAD_HIDE
});

export const changeDataflowsDataflowDownload = fields => ({
  type: DATAFLOWS_DATAFLOW_DOWNLOAD_CHANGE,
  fields
});

export const submitDataflowsDataflowDownload = (artefactTriplets, downloadDataflowParams, lang) => {

  return (artefactTriplets && artefactTriplets.length > 1)
    ? {
      ...postRequest(
        DATAFLOWS_DATAFLOW_DOWNLOAD_SUBMIT,
        getMultipleDownloadArtefactUrl(
          ARTEFACT_TYPE_DATAFLOW,
          downloadDataflowParams.format,
          downloadDataflowParams.references,
          downloadDataflowParams.compression,
          lang
        ),
        artefactTriplets.map(({id, agencyID, version}) => ({id, agency: agencyID, version})),
        undefined,
        undefined,
        true
      ),
      fileSave: getArtefactDownloadFileSaveNameAndType(
        artefactTriplets,
        ARTEFACT_TYPE_DATAFLOW,
        downloadDataflowParams.format,
        downloadDataflowParams.compression
      )
    }
    : {
      ...getRequest(
        DATAFLOWS_DATAFLOW_DOWNLOAD_SUBMIT,
        getDownloadArtefactUrl(
          ARTEFACT_TYPE_DATAFLOW,
          artefactTriplets[0],
          downloadDataflowParams.format,
          downloadDataflowParams.references,
          downloadDataflowParams.compression,
          lang
        ),
        undefined,
        true
      ),
      fileSave: getArtefactDownloadFileSaveNameAndType(
        artefactTriplets,
        ARTEFACT_TYPE_DATAFLOW,
        downloadDataflowParams.format,
        downloadDataflowParams.compression
      )
    }
};

export const showDataflowsDataflowClone = srcTriplet => ({
  type: DATAFLOWS_DATAFLOW_CLONE_SHOW,
  srcTriplet
});

export const hideDataflowsDataflowClone = () => ({
  type: DATAFLOWS_DATAFLOW_CLONE_HIDE
});

export const changeDataflowsDataflowClone = fields => ({
  type: DATAFLOWS_DATAFLOW_CLONE_CHANGE,
  fields
});

export const submitDataflowsDataflowClone = (cloneDestTriplet, srcDataflow) => postRequest(
  DATAFLOWS_DATAFLOW_CLONE_SUBMIT,
  getCreateArtefactsUrl(),
  getSdmxJsonFromSdmxJsonStructures(
    [
      getSdmxJsonStructureFromArtefact({
        ...srcDataflow,
        ...cloneDestTriplet,
        isFinal: false,
        autoAnnotations: srcDataflow.autoAnnotations
          ? [...(srcDataflow.annotations || []), ...(srcDataflow.autoAnnotations || [])].find(annot => annot === "NonProductionDataflow")
          : null
      })
    ],
    SDMX_JSON_DATAFLOW_LIST_KEY
  ),
  t => ({
    success: t('commons.artefact.messages.clone.success')
  })
);

export const showDataflowsDataflowExport = sourceTriplet => ({
  type: DATAFLOWS_DATAFLOW_EXPORT_SHOW,
  sourceTriplet
});

export const hideDataflowsDataflowExport = () => ({
  type: DATAFLOWS_DATAFLOW_EXPORT_HIDE
});

export const changeDataflowsDataflowExport = fields => ({
  type: DATAFLOWS_DATAFLOW_EXPORT_CHANGE,
  fields
});

export const submitDataflowsDataflowExport = (sourceTriplet, destination) => postRequest(
  DATAFLOWS_DATAFLOW_EXPORT_SUBMIT,
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
    EnumType: "Dataflow",
    CopyReferencedArtefact: false
  }
);

export const hideDataflowsDataflowExportReport = () => ({
  type: DATAFLOWS_DATAFLOW_EXPORT_REPORT_HIDE
});

export const readDataflowsDetailDsdForLayoutAnnotations = dsdTriplet => getRequest(
  DATAFLOWS_DETAIL_DSD_FOR_LAYOUT_ANNOTATIONS_READ,
  getDsdUrl(dsdTriplet, true)
);

export const showDataflowsDataflowOwnership = dataflowTripletStr => ({
  type: DATAFLOWS_DATAFLOW_OWNERSHIP_SHOW,
  dataflowTripletStr
});

export const hideDataflowsDataflowOwnership = () => ({
  type: DATAFLOWS_DATAFLOW_OWNERSHIP_HIDE
});


export const readDataflowsDataflowOwnershipUsersRead = () => getRequest(
  DATAFLOWS_DATAFLOW_OWNERSHIP_USERS_READ,
  getUsers()
);

export const readDataflowsDataflowOwnershipOwnersRead = dataflowTripletStr => getRequest(
  DATAFLOWS_DATAFLOW_OWNERSHIP_OWNERS_READ,
  getDataflowOwnersUrl(dataflowTripletStr)
);

export const changeDataflowsDataflowOwnershipOwners = owners => ({
  type: DATAFLOWS_DATAFLOW_OWNERSHIP_OWNERS_CHANGE,
  owners
});

export const submitDataflowsDataflowOwnership = (dataflowTripletStr, owners) => postRequest(
  DATAFLOWS_DATAFLOW_OWNERSHIP_OWNERS_SUBMIT,
  getSetOwnersUrl(),
  {
    type: "Dataflow",
    id: dataflowTripletStr,
    owners: owners.map(username => ({username}))
  },
  t => ({
    success: t('scenes.metaManager.dataflows.messages.ownership.success')
  })
);

export const readDataflowsDataflowParentsAndChildren = (artefactType, artefactTriplet) => getRequest(
  DATAFLOWS_DATAFLOW_PARENTS_AND_CHILDREN_READ,
  getArtefactReferenceUrl(artefactType, artefactTriplet)
);

export const hideDataflowsDataflowParentsAndChildren = () => ({
  type: DATAFLOWS_DATAFLOW_PARENTS_AND_CHILDREN_HIDE
});

export const showDataflowsDataflowContentConstraints = dataflowTriplet => ({
  type: DATAFLOWS_DATAFLOW_CONTENT_CONSTRAINTS_SHOW,
  dataflowTriplet
});

export const hideDataflowsDataflowContentConstraints = () => ({
  type: DATAFLOWS_DATAFLOW_CONTENT_CONSTRAINTS_HIDE
});

export const readDataflowsDataflowContentConstraints = dataflowTriplet => getRequest(
  DATAFLOWS_DATAFLOW_CONTENT_CONSTRAINTS_READ,
  getDataflowContentConstraintUrl(dataflowTriplet)
);

export const showDataflowsDetailLayoutAnnotationsForm = () => ({
  type: DATAFLOWS_DETAIL_LAYOUT_ANNOTATIONS_FORM_SHOW
});

export const hideDataflowsDetailLayoutAnnotationsForm = () => ({
  type: DATAFLOWS_DETAIL_LAYOUT_ANNOTATIONS_FORM_HIDE
});

export const submitDataflowsDetailLayoutAnnotationsForm = annotations => ({
  type: DATAFLOWS_DETAIL_LAYOUT_ANNOTATIONS_FORM_SUBMIT,
  annotations
});

export const resetDataflowsDetailLayoutAnnotationsForm = () => ({
  type: DATAFLOWS_DETAIL_LAYOUT_ANNOTATIONS_FORM_RESET
});

export const readDataflowsDetailLayoutAnnotationsItemsPage = ({
                                                                codelistTriplet,
                                                                language,
                                                                pageNum,
                                                                pageSize,
                                                                searchText,
                                                                filters,
                                                                sortCol,
                                                                sortByDesc
                                                              }) => postRequest(
  DATAFLOWS_DETAIL_LAYOUT_ANNOTATIONS_ITEMS_PAGE_READ,
  getPaginatedCodelistUrl(),
  ({
    Id: codelistTriplet.id,
    AgencyId: codelistTriplet.agencyID,
    Version: codelistTriplet.version,
    Lang: language,
    PageNum: pageNum,
    PageSize: pageSize,
    AllSearch: searchText,
    CodeSearch: filters.id ? filters.id : undefined,
    NameSearch: filters.name ? filters.name : undefined,
    ParentSearch: filters.parent ? filters.parent : undefined,
    SortColumn: sortCol ? sortCol : undefined,
    SortDesc: sortByDesc ? sortByDesc : undefined,
    rebuildDb: false
  })
)

export const resetDataflowsDetailLayoutAnnotationsItemsPage = () => ({
  type: DATAFLOWS_DETAIL_LAYOUT_ANNOTATIONS_ITEMS_PAGE_RESET
});