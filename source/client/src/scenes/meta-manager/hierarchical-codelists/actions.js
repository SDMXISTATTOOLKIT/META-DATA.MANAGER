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
  getDeleteArtefactUrl,
  getDownloadArtefactUrl,
  getHierarchicalCodelistUrl,
  getMultipleDownloadArtefactUrl,
  getUpdateHierarchicalCodelistUrl,
} from "../../../constants/urls";
import {ARTEFACT_TYPE_HIERARCHICAL_CODELIST, getArtefactDownloadFileSaveNameAndType} from "../../../constants/download";
import {getSdmxJsonStructureFromArtefact, getStringFromArtefactTriplet} from "../../../utils/sdmxJson";
import {AUTO_ANNOTATION_CUSTOM_IS_PRESENTATIONAL_KEY} from "../../../utils/annotations";

export const HIERARCHICAL_CODELISTS_LIST_HIERARCHICAL_CODELISTS_READ = 'HIERARCHICAL_CODELISTS_LIST_HIERARCHICAL_CODELISTS_READ';

export const HIERARCHICAL_CODELISTS_HIERARCHICAL_CODELIST_DETAIL_SHOW = 'HIERARCHICAL_CODELISTS_HIERARCHICAL_CODELIST_DETAIL_SHOW';
export const HIERARCHICAL_CODELISTS_HIERARCHICAL_CODELIST_DETAIL_READ = 'HIERARCHICAL_CODELISTS_HIERARCHICAL_CODELIST_DETAIL_READ';
export const HIERARCHICAL_CODELISTS_HIERARCHICAL_CODELIST_DETAIL_CHANGE = 'HIERARCHICAL_CODELISTS_HIERARCHICAL_CODELIST_DETAIL_CHANGE';
export const HIERARCHICAL_CODELISTS_HIERARCHICAL_CODELIST_DETAIL_HIDE = 'HIERARCHICAL_CODELISTS_HIERARCHICAL_CODELIST_DETAIL_HIDE';
export const HIERARCHICAL_CODELISTS_HIERARCHICAL_CODELIST_DETAIL_SUBMIT = 'HIERARCHICAL_CODELISTS_HIERARCHICAL_CODELIST_DETAIL_SUBMIT';
export const HIERARCHICAL_CODELISTS_AGENCIES_READ = 'HIERARCHICAL_CODELISTS_AGENCIES_READ';

export const HIERARCHICAL_CODELISTS_HIERARCHICAL_CODELIST_DELETE = 'HIERARCHICAL_CODELISTS_HIERARCHICAL_CODELIST_DELETE';
export const HIERARCHICAL_CODELISTS_SELECTED_HIERARCHICAL_CODELISTS_DELETE = 'HIERARCHICAL_CODELISTS_SELECTED_HIERARCHICAL_CODELISTS_DELETE';

export const HIERARCHICAL_CODELISTS_HIERARCHICAL_CODELIST_DOWNLOAD_SHOW = 'HIERARCHICAL_CODELISTS_HIERARCHICAL_CODELIST_DOWNLOAD_SHOW';
export const HIERARCHICAL_CODELISTS_HIERARCHICAL_CODELIST_DOWNLOAD_HIDE = 'HIERARCHICAL_CODELISTS_HIERARCHICAL_CODELIST_DOWNLOAD_HIDE';
export const HIERARCHICAL_CODELISTS_HIERARCHICAL_CODELIST_DOWNLOAD_CHANGE = 'HIERARCHICAL_CODELISTS_HIERARCHICAL_CODELIST_DOWNLOAD_CHANGE';
export const HIERARCHICAL_CODELISTS_HIERARCHICAL_CODELIST_DOWNLOAD = 'HIERARCHICAL_CODELISTS_HIERARCHICAL_CODELIST_DOWNLOAD';

export const HIERARCHICAL_CODELISTS_HIERARCHICAL_CODELIST_PARENTS_AND_CHILDREN_READ = 'HIERARCHICAL_CODELISTS_HIERARCHICAL_CODELIST_PARENTS_AND_CHILDREN_READ';
export const HIERARCHICAL_CODELISTS_HIERARCHICAL_CODELIST_PARENTS_AND_CHILDREN_HIDE = 'HIERARCHICAL_CODELISTS_HIERARCHICAL_CODELIST_PARENTS_AND_CHILDREN_HIDE';

export const readHierarchicalCodelistsListHierarchicalCodelists = () => getRequest(
  HIERARCHICAL_CODELISTS_LIST_HIERARCHICAL_CODELISTS_READ,
  getHierarchicalCodelistUrl()
);

export const showHierarchicalCodelistsHierarchicalCodelistDetail = artefactTriplet => ({
  type: HIERARCHICAL_CODELISTS_HIERARCHICAL_CODELIST_DETAIL_SHOW,
  artefactTriplet
});

export const readHierarchicalCodelistsHierarchicalCodelistDetail = artefactTriplet => getRequest(
  HIERARCHICAL_CODELISTS_HIERARCHICAL_CODELIST_DETAIL_READ,
  getHierarchicalCodelistUrl(artefactTriplet)
);

export const changeHierarchicalCodelistsHierarchicalCodelistDetail = fields => ({
  type: HIERARCHICAL_CODELISTS_HIERARCHICAL_CODELIST_DETAIL_CHANGE,
  fields
});

export const hideHierarchicalCodelistsHierarchicalCodelistDetail = () => ({
  type: HIERARCHICAL_CODELISTS_HIERARCHICAL_CODELIST_DETAIL_HIDE
});

export const submitHierarchicalCodelistsHierarchicalCodelistDetail = (hierarchicalCodelist, annotationsConfig) => {

  const customIsPresentationalAnnotType = (annotationsConfig[AUTO_ANNOTATION_CUSTOM_IS_PRESENTATIONAL_KEY] || "").toLowerCase();

  if (hierarchicalCodelist.customIsPresentational) {
    if (!hierarchicalCodelist.autoAnnotations.find(({type}) => (type || "").toLowerCase() !== customIsPresentationalAnnotType)) {
      hierarchicalCodelist.autoAnnotations.push({
        type: annotationsConfig[AUTO_ANNOTATION_CUSTOM_IS_PRESENTATIONAL_KEY],
        id: annotationsConfig[AUTO_ANNOTATION_CUSTOM_IS_PRESENTATIONAL_KEY],
        title: annotationsConfig[AUTO_ANNOTATION_CUSTOM_IS_PRESENTATIONAL_KEY]
      })
    }

  } else {
    hierarchicalCodelist.autoAnnotations = (hierarchicalCodelist.autoAnnotations || []).filter(({type}) => (type || "").toLowerCase() !== customIsPresentationalAnnotType)
  }

  return putRequest(
    HIERARCHICAL_CODELISTS_HIERARCHICAL_CODELIST_DETAIL_SUBMIT,
    getUpdateHierarchicalCodelistUrl(),
    {
      ...getSdmxJsonStructureFromArtefact(hierarchicalCodelist),
      agencyID: undefined,
      agency: hierarchicalCodelist.agencyID
    },
    t => ({
      success: t('scenes.metaManager.hierarchicalCodelists.messages.update.success')
    })
  );
};

export const readHierarchicalCodelistsAgencies = () => getRequest(
  HIERARCHICAL_CODELISTS_AGENCIES_READ,
  getAgencyNamesUrl()
);

export const deleteHierarchicalCodelistsHierarchicalCodelist = artefactTriplet => {
  return deleteRequest(
    HIERARCHICAL_CODELISTS_HIERARCHICAL_CODELIST_DELETE,
    getDeleteArtefactUrl("HierarchicalCodelist", artefactTriplet),
    t => ({
      success: t('scenes.metaManager.commons.messages.delete.success')
    })
  )
};

export const deleteHierarchicalCodelistsSelectedHierarchicalCodelists = artefactTriplets => allRequest(
  HIERARCHICAL_CODELISTS_SELECTED_HIERARCHICAL_CODELISTS_DELETE,
  artefactTriplets.map(() => REQUEST_METHOD_DELETE),
  artefactTriplets.map(triplet => getDeleteArtefactUrl("HierarchicalCodelist", triplet)),
  null,
  t => ({
    success: t('scenes.metaManager.commons.messages.multiDelete.success')
  }),
  artefactTriplets.map(getStringFromArtefactTriplet)
);

export const showHierarchicalCodelistsHierarchicalCodelistDownload = (artefactTriplets, lang) => ({
  type: HIERARCHICAL_CODELISTS_HIERARCHICAL_CODELIST_DOWNLOAD_SHOW,
  artefactTriplets,
  lang
});

export const hideHierarchicalCodelistsHierarchicalCodelistDownload = () => ({
  type: HIERARCHICAL_CODELISTS_HIERARCHICAL_CODELIST_DOWNLOAD_HIDE
});

export const changeHierarchicalCodelistsHierarchicalCodelistDownload = fields => ({
  type: HIERARCHICAL_CODELISTS_HIERARCHICAL_CODELIST_DOWNLOAD_CHANGE,
  fields
});

export const downloadHierarchicalCodelistsHierarchicalCodelist = (artefactTriplets, downloadHierarchicalCodelistParams, lang) => {

  return (artefactTriplets && artefactTriplets.length > 1)
    ? {
      ...postRequest(
        HIERARCHICAL_CODELISTS_HIERARCHICAL_CODELIST_DOWNLOAD,
        getMultipleDownloadArtefactUrl(
          ARTEFACT_TYPE_HIERARCHICAL_CODELIST,
          downloadHierarchicalCodelistParams.format,
          downloadHierarchicalCodelistParams.references,
          downloadHierarchicalCodelistParams.compression,
          lang
        ),
        artefactTriplets.map(({id, agencyID, version}) => ({id, agency: agencyID, version})),
        undefined,
        undefined,
        true
      ),
      fileSave: getArtefactDownloadFileSaveNameAndType(
        artefactTriplets,
        ARTEFACT_TYPE_HIERARCHICAL_CODELIST,
        downloadHierarchicalCodelistParams.format,
        downloadHierarchicalCodelistParams.compression
      )
    }
    : {
      ...getRequest(
        HIERARCHICAL_CODELISTS_HIERARCHICAL_CODELIST_DOWNLOAD,
        getDownloadArtefactUrl(
          ARTEFACT_TYPE_HIERARCHICAL_CODELIST,
          artefactTriplets[0],
          downloadHierarchicalCodelistParams.format,
          downloadHierarchicalCodelistParams.references,
          downloadHierarchicalCodelistParams.compression,
          lang
        ),
        undefined,
        true
      ),
      fileSave: getArtefactDownloadFileSaveNameAndType(
        artefactTriplets,
        ARTEFACT_TYPE_HIERARCHICAL_CODELIST,
        downloadHierarchicalCodelistParams.format,
        downloadHierarchicalCodelistParams.compression
      )
    }
};

export const readHierarchicalCodelistsHierarchicalCodelistParentsAndChildren = (artefactType, artefactTriplet) => getRequest(
  HIERARCHICAL_CODELISTS_HIERARCHICAL_CODELIST_PARENTS_AND_CHILDREN_READ,
  getArtefactReferenceUrl(artefactType, artefactTriplet)
);

export const hideHierarchicalCodelistsHierarchicalCodelistParentsAndChildren = () => ({
  type: HIERARCHICAL_CODELISTS_HIERARCHICAL_CODELIST_PARENTS_AND_CHILDREN_HIDE
});