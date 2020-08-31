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
  getMsdUrl,
  getMultipleDownloadArtefactUrl,
  getUpdateMsdUrl
} from "../../../constants/urls";
import {ARTEFACT_TYPE_MSD, getArtefactDownloadFileSaveNameAndType} from "../../../constants/download";
import {getSdmxJsonStructureFromArtefact, getStringFromArtefactTriplet} from "../../../utils/sdmxJson";
import {AUTO_ANNOTATION_CUSTOM_IS_PRESENTATIONAL_KEY} from "../../../utils/annotations";

export const MSDS_LIST_MSDS_READ = 'MSDS_LIST_MSDS_READ';

export const MSDS_MSD_DETAIL_SHOW = 'MSDS_MSD_DETAIL_SHOW';
export const MSDS_MSD_DETAIL_READ = 'MSDS_MSD_DETAIL_READ';
export const MSDS_MSD_DETAIL_CHANGE = 'MSDS_MSD_DETAIL_CHANGE';
export const MSDS_MSD_DETAIL_HIDE = 'MSDS_MSD_DETAIL_HIDE';
export const MSDS_MSD_DETAIL_SUBMIT = 'MSDS_MSD_DETAIL_SUBMIT';
export const MSDS_AGENCIES_READ = 'MSDS_AGENCIES_READ';

export const MSDS_MSD_DELETE = 'MSDS_MSD_DELETE';
export const MSDS_SELECTED_MSDS_DELETE = 'MSDS_SELECTED_MSDS_DELETE';

export const MSDS_MSD_DOWNLOAD_SHOW = 'MSDS_MSD_DOWNLOAD_SHOW';
export const MSDS_MSD_DOWNLOAD_HIDE = 'MSDS_MSD_DOWNLOAD_HIDE';
export const MSDS_MSD_DOWNLOAD_CHANGE = 'MSDS_MSD_DOWNLOAD_CHANGE';
export const MSDS_MSD_DOWNLOAD = 'MSDS_MSD_DOWNLOAD';

export const MSDS_MSD_PARENTS_AND_CHILDREN_READ = 'MSDS_MSD_PARENTS_AND_CHILDREN_READ';
export const MSDS_MSD_PARENTS_AND_CHILDREN_HIDE = 'MSDS_MSD_PARENTS_AND_CHILDREN_HIDE';

export const readMsdsListMsds = () => getRequest(
  MSDS_LIST_MSDS_READ,
  getMsdUrl()
);

export const showMsdsMsdDetail = artefactTriplet => ({
  type: MSDS_MSD_DETAIL_SHOW,
  artefactTriplet
});

export const readMsdsMsdDetail = artefactTriplet => getRequest(
  MSDS_MSD_DETAIL_READ,
  getMsdUrl(artefactTriplet)
);

export const changeMsdsMsdDetail = fields => ({
  type: MSDS_MSD_DETAIL_CHANGE,
  fields
});

export const hideMsdsMsdDetail = () => ({
  type: MSDS_MSD_DETAIL_HIDE
});

export const submitMsdsMsdDetail = (msd, annotationsConfig) => {

  const customIsPresentationalAnnotType = (annotationsConfig[AUTO_ANNOTATION_CUSTOM_IS_PRESENTATIONAL_KEY] || "").toLowerCase();

  if (msd.customIsPresentational) {
    if (!msd.autoAnnotations.find(({type}) => (type || "").toLowerCase() !== customIsPresentationalAnnotType)) {
      msd.autoAnnotations.push({
        type: annotationsConfig[AUTO_ANNOTATION_CUSTOM_IS_PRESENTATIONAL_KEY],
        id: annotationsConfig[AUTO_ANNOTATION_CUSTOM_IS_PRESENTATIONAL_KEY],
        title: annotationsConfig[AUTO_ANNOTATION_CUSTOM_IS_PRESENTATIONAL_KEY]
      })
    }

  } else {
    msd.autoAnnotations = (msd.autoAnnotations || []).filter(({type}) => (type || "").toLowerCase() !== customIsPresentationalAnnotType)
  }

  return putRequest(
    MSDS_MSD_DETAIL_SUBMIT,
    getUpdateMsdUrl(),
    {
      ...getSdmxJsonStructureFromArtefact(msd),
      agencyID: undefined,
      agency: msd.agencyID
    },
    t => ({
      success: t('scenes.metaManager.msds.messages.update.success')
    })
  )
};

export const readMsdsAgencies = () => getRequest(
  MSDS_AGENCIES_READ,
  getAgencyNamesUrl()
);

export const deleteMsdsMsd = artefactTriplet => {
  return deleteRequest(
    MSDS_MSD_DELETE,
    getDeleteArtefactUrl("Msd", artefactTriplet),
    t => ({
      success: t('scenes.metaManager.commons.messages.delete.success')
    })
  )
};

export const deleteMsdsSelectedMsds = artefactTriplets => allRequest(
  MSDS_SELECTED_MSDS_DELETE,
  artefactTriplets.map(() => REQUEST_METHOD_DELETE),
  artefactTriplets.map(triplet => getDeleteArtefactUrl("Msd", triplet)),
  null,
  t => ({
    success: t('scenes.metaManager.commons.messages.multiDelete.success')
  }),
  artefactTriplets.map(getStringFromArtefactTriplet)
);

export const showMsdsMsdDownload = (artefactTriplets, lang) => ({
  type: MSDS_MSD_DOWNLOAD_SHOW,
  artefactTriplets,
  lang
});

export const hideMsdsMsdDownload = () => ({
  type: MSDS_MSD_DOWNLOAD_HIDE
});

export const changeMsdsMsdDownload = fields => ({
  type: MSDS_MSD_DOWNLOAD_CHANGE,
  fields
});

export const downloadMsdsMsd = (artefactTriplets, downloadMsdParams, lang) => {

  return (artefactTriplets && artefactTriplets.length > 1)
    ? {
      ...postRequest(
        MSDS_MSD_DOWNLOAD,
        getMultipleDownloadArtefactUrl(
          ARTEFACT_TYPE_MSD,
          downloadMsdParams.format,
          downloadMsdParams.references,
          downloadMsdParams.compression,
          lang
        ),
        artefactTriplets.map(({id, agencyID, version}) => ({id, agency: agencyID, version})),
        undefined,
        undefined,
        true
      ),
      fileSave: getArtefactDownloadFileSaveNameAndType(
        artefactTriplets,
        ARTEFACT_TYPE_MSD,
        downloadMsdParams.format,
        downloadMsdParams.compression
      )
    }
    : {
      ...getRequest(
        MSDS_MSD_DOWNLOAD,
        getDownloadArtefactUrl(
          ARTEFACT_TYPE_MSD,
          artefactTriplets[0],
          downloadMsdParams.format,
          downloadMsdParams.references,
          downloadMsdParams.compression,
          lang
        ),
        undefined,
        true
      ),
      fileSave: getArtefactDownloadFileSaveNameAndType(
        artefactTriplets,
        ARTEFACT_TYPE_MSD,
        downloadMsdParams.format,
        downloadMsdParams.compression
      )
    }
};

export const readMsdsMsdParentsAndChildren = (artefactType, artefactTriplet) => getRequest(
  MSDS_MSD_PARENTS_AND_CHILDREN_READ,
  getArtefactReferenceUrl(artefactType, artefactTriplet)
);

export const hideMsdsMsdParentsAndChildren = () => ({
  type: MSDS_MSD_PARENTS_AND_CHILDREN_HIDE
});