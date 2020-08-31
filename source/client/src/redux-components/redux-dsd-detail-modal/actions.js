import {getRequest, postRequest, putRequest} from "../../middlewares/api/actions";
import {
  getAgencyNamesUrl,
  getCodelistUrl,
  getConceptSchemeUrl,
  getCreateArtefactsUrl,
  getDownloadArtefactUrl,
  getDsdUrl,
  getExportArtefactUrl,
  getMultipleDownloadArtefactUrl,
  getUpdateArtefactsUrl
} from "../../constants/urls";
import {
  getSdmxJsonFromSdmxJsonStructures,
  getSdmxJsonStructureFromDsd,
  SDMX_JSON_DSD_LIST_KEY
} from "../../utils/sdmxJson";
import {ARTEFACT_TYPE_DSD, getArtefactDownloadFileSaveNameAndType} from "../../constants/download";

export const DSD_DETAIL_READ = 'DSD_DETAIL_READ';
export const DSD_DETAIL_CREATE = 'DSD_DETAIL_CREATE';
export const DSD_DETAIL_EDIT = 'DSD_DETAIL_EDIT';
export const DSD_DETAIL_SHOW = 'DSD_DETAIL_SHOW';
export const DSD_DETAIL_CHANGE = 'DSD_DETAIL_CHANGE';
export const DSD_DETAIL_HIDE = 'DSD_DETAIL_HIDE';
export const DSD_DETAIL_UPDATE_SUBMIT = 'DSD_DETAIL_UPDATE_SUBMIT';
export const DSD_DETAIL_CREATE_SUBMIT = 'DSD_DETAIL_CREATE_SUBMIT';

export const DSD_DETAIL_AGENCIES_READ = 'DSD_DETAIL_AGENCIES_READ';

export const DSD_DETAIL_DIMENSION_EDIT = 'DSD_DETAIL_DIMENSION_EDIT';
export const DSD_DETAIL_DIMENSION_CREATE = 'DSD_DETAIL_DIMENSION_CREATE';
export const DSD_DETAIL_DIMENSION_HIDE = 'DSD_DETAIL_DIMENSION_HIDE';
export const DSD_DETAIL_DIMENSION_CHANGE = 'DSD_DETAIL_DIMENSION_CHANGE';
export const DSD_DETAIL_DIMENSION_DELETE = 'DSD_DETAIL_DIMENSION_DELETE';
export const DSD_DETAIL_DIMENSION_SUBMIT = 'DSD_DETAIL_DIMENSION_SUBMIT';

export const DSD_DETAIL_GROUP_EDIT = 'DSD_DETAIL_GROUP_EDIT';
export const DSD_DETAIL_GROUP_CREATE = 'DSD_DETAIL_GROUP_CREATE';
export const DSD_DETAIL_GROUP_HIDE = 'DSD_DETAIL_GROUP_HIDE';
export const DSD_DETAIL_GROUP_CHANGE = 'DSD_DETAIL_GROUP_CHANGE';
export const DSD_DETAIL_GROUP_DELETE = 'DSD_DETAIL_GROUP_DELETE';
export const DSD_DETAIL_GROUP_SUBMIT = 'DSD_DETAIL_GROUP_SUBMIT';

export const DSD_DETAIL_ATTRIBUTE_EDIT = 'DSD_DETAIL_ATTRIBUTE_EDIT';
export const DSD_DETAIL_ATTRIBUTE_CREATE = 'DSD_DETAIL_ATTRIBUTE_CREATE';
export const DSD_DETAIL_ATTRIBUTE_HIDE = 'DSD_DETAIL_ATTRIBUTE_HIDE';
export const DSD_DETAIL_ATTRIBUTE_CHANGE = 'DSD_DETAIL_ATTRIBUTE_CHANGE';
export const DSD_DETAIL_ATTRIBUTE_DELETE = 'DSD_DETAIL_ATTRIBUTE_DELETE';
export const DSD_DETAIL_ATTRIBUTE_SUBMIT = 'DSD_DETAIL_ATTRIBUTE_SUBMIT';

export const DSD_DETAIL_PRIMARY_MEASURE_CHANGE = 'DSD_DETAIL_PRIMARY_MEASURE_CHANGE';

export const DSD_DETAIL_CODELISTS_FOR_SELECTOR_SHOW = 'DSD_DETAIL_CODELISTS_FOR_SELECTOR_SHOW';
export const DSD_DETAIL_CODELISTS_FOR_SELECTOR_HIDE = 'DSD_DETAIL_CODELISTS_FOR_SELECTOR_HIDE';
export const DSD_DETAIL_CODELISTS_FOR_SELECTOR_SET = 'DSD_DETAIL_CODELISTS_FOR_SELECTOR_SET';

export const DSD_DETAIL_CONCEPT_SCHEMES_FOR_SELECTOR_SHOW = 'DSD_DETAIL_CONCEPT_SCHEMES_FOR_SELECTOR_SHOW';
export const DSD_DETAIL_CONCEPT_SCHEMES_FOR_SELECTOR_HIDE = 'DSD_DETAIL_CONCEPT_SCHEMES_FOR_SELECTOR_HIDE';

export const DSD_DETAIL_CONCEPT_SCHEME_FOR_SELECTOR_READ = 'DSD_DETAIL_CONCEPT_SCHEME_FOR_SELECTOR_READ';
export const DSD_DETAIL_CONCEPT_SCHEME_FOR_SELECTOR_SHOW = 'DSD_DETAIL_CONCEPT_SCHEME_FOR_SELECTOR_SHOW';
export const DSD_DETAIL_CONCEPT_SCHEME_FOR_SELECTOR_HIDE = 'DSD_DETAIL_CONCEPT_SCHEME_FOR_SELECTOR_HIDE';
export const DSD_DETAIL_CONCEPT_SCHEME_FOR_SELECTOR_SET = 'DSD_DETAIL_CONCEPT_SCHEME_FOR_SELECTOR_SET';

export const DSD_DETAIL_DOWNLOAD_SHOW = 'DSD_DETAIL_DOWNLOAD_SHOW';
export const DSD_DETAIL_DOWNLOAD_HIDE = 'DSD_DETAIL_DOWNLOAD_HIDE';
export const DSD_DETAIL_DOWNLOAD_CHANGE = 'DSD_DETAIL_DOWNLOAD_CHANGE';
export const DSD_DETAIL_DOWNLOAD_SUBMIT = 'DSD_DETAIL_DOWNLOAD_SUBMIT';

export const DSD_DETAIL_CLONE_SHOW = 'DSD_DETAIL_CLONE_SHOW';
export const DSD_DETAIL_CLONE_HIDE = 'DSD_DETAIL_CLONE_HIDE';
export const DSD_DETAIL_CLONE_CHANGE = 'DSD_DETAIL_CLONE_CHANGE';
export const DSD_DETAIL_CLONE_SUBMIT = 'DSD_DETAIL_CLONE_SUBMIT';

export const DSD_DETAIL_MEASURE_DIMENSION_CONCEPT_SCHEMES_FOR_SELECTOR_SHOW = 'DSD_DETAIL_MEASURE_DIMENSION_CONCEPT_SCHEMES_FOR_SELECTOR_SHOW';
export const DSD_DETAIL_MEASURE_DIMENSION_CONCEPT_SCHEMES_FOR_SELECTOR_HIDE = 'DSD_DETAIL_MEASURE_DIMENSION_CONCEPT_SCHEMES_FOR_SELECTOR_HIDE';
export const DSD_DETAIL_MEASURE_DIMENSION_CONCEPT_SCHEMES_FOR_SELECTOR_SET = 'DSD_DETAIL_MEASURE_DIMENSION_CONCEPT_SCHEMES_FOR_SELECTOR_SET';

export const DSD_DETAIL_CODELISTS_READ = 'DSD_DETAIL_CODELISTS_READ';
export const DSD_DETAIL_CONCEPT_SCHEMES_READ = 'DSD_DETAIL_CONCEPT_SCHEMES_READ';

export const DSD_DETAIL_EXPORT_SHOW = 'DSD_DETAIL_EXPORT_SHOW';
export const DSD_DETAIL_EXPORT_HIDE = 'DSD_DETAIL_EXPORT_HIDE';
export const DSD_DETAIL_EXPORT_CHANGE = 'DSD_DETAIL_EXPORT_CHANGE';
export const DSD_DETAIL_EXPORT_SUBMIT = 'DSD_DETAIL_EXPORT_SUBMIT';

export const DSD_DETAIL_EXPORT_REPORT_HIDE = 'DSD_DETAIL_EXPORT_REPORT_HIDE';


export const readDsdDetail = dsdTriplet => getRequest(
  DSD_DETAIL_READ,
  getDsdUrl(dsdTriplet)
);

export const createDsdDetail = () => ({
  type: DSD_DETAIL_CREATE
});

export const editDsdDetail = dsdTriplet => ({
  type: DSD_DETAIL_EDIT,
  dsdTriplet
});

export const showDsdDetail = dsdTriplet => ({
  type: DSD_DETAIL_SHOW,
  dsdTriplet
});

export const changeDsdDetail = fields => ({
  type: DSD_DETAIL_CHANGE,
  fields
});

export const hideDsdDetail = () => ({
  type: DSD_DETAIL_HIDE
});

export const submitDsdDetailCreate = dsd => postRequest(
  DSD_DETAIL_CREATE_SUBMIT,
  getCreateArtefactsUrl(),
  getSdmxJsonFromSdmxJsonStructures(
    [getSdmxJsonStructureFromDsd(dsd)],
    SDMX_JSON_DSD_LIST_KEY
  ),
  t => ({
    success: t('reduxComponents.dsdDetail.messages.create.success')
  })
);

export const submitDsdDetailUpdate = dsd => putRequest(
  DSD_DETAIL_UPDATE_SUBMIT,
  getUpdateArtefactsUrl(),
  getSdmxJsonFromSdmxJsonStructures(
    [getSdmxJsonStructureFromDsd(dsd)],
    SDMX_JSON_DSD_LIST_KEY
  ),
  t => ({
    success: t('reduxComponents.dsdDetail.messages.update.success')
  })
);

export const readDsdDetailAgencies = allowedAgencies => ({
  ...getRequest(
    DSD_DETAIL_AGENCIES_READ,
    getAgencyNamesUrl()
  ),
  allowedAgencies
});

export const changeDsdDetailPrimaryMeasure = fields => ({
  type: DSD_DETAIL_PRIMARY_MEASURE_CHANGE,
  fields
});

export const editDsdDetailDimension = id => ({
  type: DSD_DETAIL_DIMENSION_EDIT,
  id
});

export const createDsdDetailDimension = () => ({
  type: DSD_DETAIL_DIMENSION_CREATE
});

export const hideDsdDetailDimension = () => ({
  type: DSD_DETAIL_DIMENSION_HIDE
});

export const deleteDsdDetailDimension = id => ({
  type: DSD_DETAIL_DIMENSION_DELETE,
  id
});

export const submitDsdDetailDimension = () => ({
  type: DSD_DETAIL_DIMENSION_SUBMIT,
});

export const changeDsdDetailDimension = fields => ({
  type: DSD_DETAIL_DIMENSION_CHANGE,
  fields
});

export const editDsdDetailGroup = id => ({
  type: DSD_DETAIL_GROUP_EDIT,
  id
});

export const createDsdDetailGroup = () => ({
  type: DSD_DETAIL_GROUP_CREATE
});

export const deleteDsdDetailGroup = id => ({
  type: DSD_DETAIL_GROUP_DELETE,
  id
});

export const hideDsdDetailGroup = () => ({
  type: DSD_DETAIL_GROUP_HIDE
});

export const changeDsdDetailGroup = fields => ({
  type: DSD_DETAIL_GROUP_CHANGE,
  fields
});

export const submitDsdDetailGroup = () => ({
  type: DSD_DETAIL_GROUP_SUBMIT
});

export const editDsdDetailAttribute = id => ({
  type: DSD_DETAIL_ATTRIBUTE_EDIT,
  id
});

export const deleteDsdDetailAttribute = id => ({
  type: DSD_DETAIL_ATTRIBUTE_DELETE,
  id
});

export const createDsdDetailAttribute = () => ({
  type: DSD_DETAIL_ATTRIBUTE_CREATE
});

export const hideDsdDetailAttribute = () => ({
  type: DSD_DETAIL_ATTRIBUTE_HIDE
});

export const changeDsdDetailAttribute = fields => ({
  type: DSD_DETAIL_ATTRIBUTE_CHANGE,
  fields
});

export const submitDsdDetailAttribute = () => ({
  type: DSD_DETAIL_ATTRIBUTE_SUBMIT
});

export const showDsdDetailCodelistsForSelector = () => ({
  type: DSD_DETAIL_CODELISTS_FOR_SELECTOR_SHOW
});

export const hideDsdDetailCodelistsForSelector = () => ({
  type: DSD_DETAIL_CODELISTS_FOR_SELECTOR_HIDE
});

export const setDsdDetailCodelistsForSelector = codelistUrn => ({
  type: DSD_DETAIL_CODELISTS_FOR_SELECTOR_SET,
  codelistUrn
});

export const showDsdDetailConceptSchemesForSelector = () => ({
  type: DSD_DETAIL_CONCEPT_SCHEMES_FOR_SELECTOR_SHOW
});

export const hideDsdDetailConceptSchemesForSelector = () => ({
  type: DSD_DETAIL_CONCEPT_SCHEMES_FOR_SELECTOR_HIDE
});

export const readDsdDetailConceptSchemeForSelector = (conceptSchemeTriplet, itemOrderAnnotationType) => ({
  ...getRequest(
    DSD_DETAIL_CONCEPT_SCHEME_FOR_SELECTOR_READ,
    getConceptSchemeUrl(conceptSchemeTriplet),
  ),
  itemOrderAnnotationType
});

export const showDsdDetailConceptSchemeForSelector = conceptSchemeTriplet => ({
  type: DSD_DETAIL_CONCEPT_SCHEME_FOR_SELECTOR_SHOW,
  conceptSchemeTriplet
});

export const hideDsdDetailConceptSchemeForSelector = () => ({
  type: DSD_DETAIL_CONCEPT_SCHEME_FOR_SELECTOR_HIDE
});

export const setDsdDetailConceptSchemeForSelector = conceptUrn => ({
  type: DSD_DETAIL_CONCEPT_SCHEME_FOR_SELECTOR_SET,
  conceptUrn
});

export const showDsdDetailDownload = (artefactTriplets, lang) => ({
  type: DSD_DETAIL_DOWNLOAD_SHOW,
  artefactTriplets,
  lang
});

export const hideDsdDetailDownload = () => ({
  type: DSD_DETAIL_DOWNLOAD_HIDE
});

export const changeDsdDetailDownload = fields => ({
  type: DSD_DETAIL_DOWNLOAD_CHANGE,
  fields
});

export const submitDsdDetailDownload = (artefactTriplets, downloadDsdParams, lang) => {

  return (artefactTriplets && artefactTriplets.length > 1)
    ? {
      ...postRequest(
        DSD_DETAIL_DOWNLOAD_SUBMIT,
        getMultipleDownloadArtefactUrl(
          ARTEFACT_TYPE_DSD,
          downloadDsdParams.format,
          downloadDsdParams.references,
          downloadDsdParams.compression,
          lang
        ),
        artefactTriplets.map(({id, agencyID, version}) => ({id, agency: agencyID, version})),
        undefined,
        undefined,
        true
      ),
      fileSave: getArtefactDownloadFileSaveNameAndType(
        artefactTriplets,
        ARTEFACT_TYPE_DSD,
        downloadDsdParams.format,
        downloadDsdParams.compression
      )
    }
    : {
      ...getRequest(
        DSD_DETAIL_DOWNLOAD_SUBMIT,
        getDownloadArtefactUrl(
          ARTEFACT_TYPE_DSD,
          artefactTriplets[0],
          downloadDsdParams.format,
          downloadDsdParams.references,
          downloadDsdParams.compression,
          lang
        ),
        undefined,
        true
      ),
      fileSave: getArtefactDownloadFileSaveNameAndType(
        artefactTriplets,
        ARTEFACT_TYPE_DSD,
        downloadDsdParams.format,
        downloadDsdParams.compression
      )
    }
};

export const showDsdDetailClone = srcTriplet => ({
  type: DSD_DETAIL_CLONE_SHOW,
  srcTriplet
});

export const hideDsdDetailClone = () => ({
  type: DSD_DETAIL_CLONE_HIDE
});

export const changeDsdDetailClone = fields => ({
  type: DSD_DETAIL_CLONE_CHANGE,
  fields
});

export const submitDsdDetailClone = (cloneDestTriplet, dsd) => postRequest(
  DSD_DETAIL_CLONE_SUBMIT,
  getCreateArtefactsUrl(),
  getSdmxJsonFromSdmxJsonStructures(
    [
      getSdmxJsonStructureFromDsd({
        ...dsd,
        ...cloneDestTriplet,
        isFinal: false,
        autoAnnotations: null
      })],
    SDMX_JSON_DSD_LIST_KEY
  ),
  t => ({
    success: t('commons.artefact.messages.clone.success')
  })
);


export const showDsdDetailMeasureDimensionConceptSchemesForSelector = () => ({
  type: DSD_DETAIL_MEASURE_DIMENSION_CONCEPT_SCHEMES_FOR_SELECTOR_SHOW
});

export const hideDsdDetailMeasureDimensionConceptSchemesForSelector = () => ({
  type: DSD_DETAIL_MEASURE_DIMENSION_CONCEPT_SCHEMES_FOR_SELECTOR_HIDE
});

export const setDsdDetailMeasureDimensionConceptSchemesSelector = conceptSchemeUrn => ({
  type: DSD_DETAIL_MEASURE_DIMENSION_CONCEPT_SCHEMES_FOR_SELECTOR_SET,
  conceptSchemeUrn
});

export const readDsdDetailCodelists = () => getRequest(
  DSD_DETAIL_CODELISTS_READ,
  getCodelistUrl(),
);

export const readDsdDetailConceptSchemes = () => getRequest(
  DSD_DETAIL_CONCEPT_SCHEMES_READ,
  getConceptSchemeUrl(),
);

export const showDsdDetailDsdExport = sourceTriplet => ({
  type: DSD_DETAIL_EXPORT_SHOW,
  sourceTriplet
});

export const hideDsdDetailDsdExport = () => ({
  type: DSD_DETAIL_EXPORT_HIDE
});

export const changeDsdDetailDsdExport = fields => ({
  type: DSD_DETAIL_EXPORT_CHANGE,
  fields
});

export const submitDsdDetailDsdExport = (sourceTriplet, destination) => postRequest(
  DSD_DETAIL_EXPORT_SUBMIT,
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
    EnumType: "Dsd",
    CopyReferencedArtefact: destination.withReferences
  }
);

export const hideDsdDetailDsdExportReport = () => ({
  type: DSD_DETAIL_EXPORT_REPORT_HIDE
});