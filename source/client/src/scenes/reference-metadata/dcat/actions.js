import {
  allRequest,
  deleteRequest,
  getRequest,
  postRequest,
  putRequest,
  REQUEST_METHOD_GET
} from "../../../middlewares/api/actions";
import {
  getCodelistUrl,
  getConceptSchemeUrl,
  getDataflowUrl,
  getDeleteMetadataSetUrl,
  getDeleteReportUrl,
  getDownloadRMFileOnServerUrl,
  getMetadataflowUrl,
  getMetadataSetsUrl,
  getMetadataSetUrl,
  getMsdUrl,
  getUpdateArtefactsUrl,
  getUpdateStateReportUrl,
  getUploadRMFileOnServerUrl,
  getUpsertJsonReportUrl,
  getUpsertMetadataSetUrl
} from "../../../constants/urls";
import {
  getSdmxJsonFromSdmxJsonStructures,
  getSdmxJsonStructureFromArtefact,
  SDMX_JSON_DATAFLOW_LIST_KEY,
  SDMX_JSON_METADATA_SET_LIST_KEY
} from "../../../utils/sdmxJson";
import {
  getDbIdAnnotationFromAnnotations,
  getMetadataApiReportUrl,
  getSdmxJsonReportFromReportStructure,
  METADATA_SET_ID_ANNOTATION_ID,
  updateReportStateAnnotations
} from "../../../utils/referenceMetadata";
import {ARTEFACT_TYPES, getWorkingAnnotations} from "../commons/constants";

export const DCAT_METADATA_SETS_READ = "DCAT_METADATA_SETS_READ";

export const DCAT_METADATA_SET_SHOW = "DCAT_METADATA_SET_SHOW";
export const DCAT_METADATA_SET_HIDE = "DCAT_METADATA_SET_HIDE";
export const DCAT_METADATA_SET_READ = "DCAT_METADATA_SET_READ";
export const DCAT_METADATA_SET_CREATE = "DCAT_METADATA_SET_CREATE";
export const DCAT_METADATA_SET_CHANGE = "DCAT_METADATA_SET_CHANGE";
export const DCAT_METADATA_SET_SUBMIT = "DCAT_METADATA_SET_SUBMIT";
export const DCAT_METADATA_SET_DELETE = "DCAT_METADATA_SET_DELETE";

export const DCAT_METADATA_SET_REPORTS_SHOW = "DCAT_METADATA_SET_REPORTS_SHOW";
export const DCAT_METADATA_SET_REPORTS_HIDE = "DCAT_METADATA_SET_REPORTS_HIDE";
export const DCAT_METADATA_SET_REPORTS_READ = "DCAT_METADATA_SET_REPORTS_READ";

export const DCAT_METADATAFLOWS_SHOW = "DCAT_METADATAFLOWS_SHOW";
export const DCAT_METADATAFLOWS_HIDE = "DCAT_METADATAFLOWS_HIDE";
export const DCAT_METADATAFLOWS_READ = "DCAT_METADATAFLOWS_READ";
export const DCAT_METADATAFLOW_SET = "DCAT_METADATAFLOW_SET";
export const DCAT_METADATAFLOW_UNSET = "DCAT_METADATAFLOW_UNSET";

export const DCAT_REPORT_CREATE = "DCAT_REPORT_CREATE";
export const DCAT_REPORT_DELETE = "DCAT_REPORT_DELETE";
export const DCAT_REPORT_SHOW = "DCAT_REPORT_SHOW";
export const DCAT_REPORT_HIDE = "DCAT_REPORT_HIDE";
export const DCAT_REPORT_SUBMIT = "DCAT_REPORT_SUBMIT";

export const DCAT_REPORT_STEP_SET = "DCAT_REPORT_STEP_SET";

export const DCAT_REPORT_ATTRIBUTE_SELECT = "DCAT_REPORT_ATTRIBUTE_SELECT";
export const DCAT_REPORT_ATTRIBUTE_CHANGE = "DCAT_REPORT_ATTRIBUTE_CHANGE";
export const DCAT_REPORT_ATTRIBUTE_CREATE = "DCAT_REPORT_ATTRIBUTE_CREATE";
export const DCAT_REPORT_ATTRIBUTE_DELETE = "DCAT_REPORT_ATTRIBUTE_DELETE";

export const DCAT_UPDATE_REPORT_STATE_SUBMIT = "DCAT_UPDATE_REPORT_STATE_SUBMIT";

export const DCAT_REPORT_HTML_PAGE_SHOW = 'DCAT_REPORT_HTML_PAGE_SHOW';
export const DCAT_REPORT_HTML_PAGE_HIDE = 'DCAT_REPORT_HTML_PAGE_HIDE';

export const DCAT_REPORT_ATTRIBUTE_CODES_SHOW = "DCAT_REPORT_ATTRIBUTE_CODES_SHOW";
export const DCAT_REPORT_ATTRIBUTE_CODES_HIDE = "DCAT_REPORT_ATTRIBUTE_CODES_HIDE";
export const DCAT_REPORT_ATTRIBUTE_CODES_READ = "DCAT_REPORT_ATTRIBUTE_CODES_READ";
export const DCAT_REPORT_ATTRIBUTE_CODE_SET = "DCAT_REPORT_ATTRIBUTE_CODE_SET";
export const DCAT_REPORT_ATTRIBUTE_CODE_UNSET = "DCAT_REPORT_ATTRIBUTE_CODE_UNSET";

export const DCAT_REPORT_ATTRIBUTE_ATTACHMENT_UPLOAD = "DCAT_REPORT_ATTRIBUTE_ATTACHMENT_UPLOAD";
export const DCAT_REPORT_ATTRIBUTE_ATTACHMENT_DOWNLOAD = "DCAT_REPORT_ATTRIBUTE_ATTACHMENT_DOWNLOAD";

export const DCAT_REPORT_ID_CHANGE = "DCAT_REPORT_ID_CHANGE";

export const DCAT_REPORT_TARGET_SELECT = "DCAT_REPORT_TARGET_SELECT";

export const DCAT_REPORT_TARGET_ARTEFACTS_SHOW = "DCAT_REPORT_TARGET_ARTEFACTS_SHOW";
export const DCAT_REPORT_TARGET_ARTEFACTS_HIDE = "DCAT_REPORT_TARGET_ARTEFACTS_HIDE";
export const DCAT_REPORT_TARGET_ARTEFACTS_READ = "DCAT_REPORT_TARGET_ARTEFACTS_READ";
export const DCAT_REPORT_TARGET_ARTEFACT_SET = "DCAT_REPORT_TARGET_ARTEFACT_SET";
export const DCAT_REPORT_TARGET_ARTEFACT_UNSET = "DCAT_REPORT_TARGET_ARTEFACT_UNSET";

export const DCAT_DATAFLOW_READ = "DCAT_DATAFLOW_READ";
export const DCAT_DATAFLOW_CHANGE = "DCAT_DATAFLOW_CHANGE";
export const DCAT_DATAFLOW_SUBMIT = "DCAT_DATAFLOW_SUBMIT";
export const DCAT_DATAFLOW_HIDE = "DCAT_DATAFLOW_HIDE";

export const DCAT_CONCEPT_SCHEMES_READ = "DCAT_CONCEPT_SCHEMES_READ";

export const DCAT_REPORT_DOWNLOAD = "DCAT_REPORT_DOWNLOAD";

export const DCAT_METADATA_SET_HTML_PAGE_SHOW = "DCAT_METADATA_SET_HTML_PAGE_SHOW";
export const DCAT_METADATA_SET_HTML_PAGE_HIDE = "DCAT_METADATA_SET_HTML_PAGE_HIDE";

export const readDcatMetadataSets = (msdTriplet, ownedMetadataflows) => ({
  ...allRequest(
    DCAT_METADATA_SETS_READ,
    [REQUEST_METHOD_GET, REQUEST_METHOD_GET],
    [getMetadataSetsUrl(), getMsdUrl(msdTriplet)]
  ),
  ownedMetadataflows
});

export const showDcatMetadataSet = metadataSetId => ({
  type: DCAT_METADATA_SET_SHOW,
  metadataSetId
});

export const hideDcatMetadataSet = () => ({
  type: DCAT_METADATA_SET_HIDE
});

export const readDcatMetadataSet = metadataSetId => getRequest(
  DCAT_METADATA_SET_READ,
  getMetadataSetUrl(metadataSetId, false)
);

export const createDcatMetadataSet = () => ({
  type: DCAT_METADATA_SET_CREATE,
});

export const changeDcatMetadataSet = fields => ({
  type: DCAT_METADATA_SET_CHANGE,
  fields
});

export const submitDcatMetadataSet = metadataSet => {

  let autoAnnotations = getWorkingAnnotations(metadataSet);
  const idAnnotation = getDbIdAnnotationFromAnnotations(metadataSet, METADATA_SET_ID_ANNOTATION_ID);
  if (idAnnotation) {
    autoAnnotations.push(idAnnotation)
  }

  return postRequest(
    DCAT_METADATA_SET_SUBMIT,
    getUpsertMetadataSetUrl(),
    getSdmxJsonFromSdmxJsonStructures(
      [getSdmxJsonStructureFromArtefact({
        ...metadataSet,
        reports: metadataSet.reports || [],
        autoAnnotations: autoAnnotations
      })],
      SDMX_JSON_METADATA_SET_LIST_KEY
    ),
    t => ({
      success: idAnnotation
        ? t('scenes.referenceMetadata.metadataSet.messages.metadataSet.update.success')
        : t('scenes.referenceMetadata.metadataSet.messages.metadataSet.create.success')
    })
  )
};

export const deleteDcatMetadataSet = metadataSetId => deleteRequest(
  DCAT_METADATA_SET_DELETE,
  getDeleteMetadataSetUrl(metadataSetId),
  t => ({
    success: t('scenes.referenceMetadata.metadataSet.messages.metadataSet.delete.success')
  })
);

export const showDcatMetadataSetReports = metadataSetId => ({
  type: DCAT_METADATA_SET_REPORTS_SHOW,
  metadataSetId
});

export const hideDcatMetadataSetReports = () => ({
  type: DCAT_METADATA_SET_REPORTS_HIDE
});

export const readDcatMetadataSetReports = (metadataSetId, ownedDataflows, ownedMetadataflows) => ({
  ...getRequest(
    DCAT_METADATA_SET_REPORTS_READ,
    getMetadataSetUrl(metadataSetId, true)
  ),
  ownedDataflows,
  ownedMetadataflows
});

export const showDcatMetadataflows = () => ({
  type: DCAT_METADATAFLOWS_SHOW
});

export const hideDcatMetadataflows = () => ({
  type: DCAT_METADATAFLOWS_HIDE
});

export const readDcatMetadataflows = (ownedMetadataflows, msdUrn) => ({
  ...getRequest(
    DCAT_METADATAFLOWS_READ,
    getMetadataflowUrl()
  ),
  ownedMetadataflows,
  msdUrn
});

export const setDcatMetadataflow = (triplet, msdUrn) => ({
  type: DCAT_METADATAFLOW_SET,
  triplet,
  msdUrn
});

export const unsetDcatMetadataflow = () => ({
  type: DCAT_METADATAFLOW_UNSET
});

export const createDcatReport = () => ({
  type: DCAT_REPORT_CREATE
});

export const deleteDcatReport = reportId => deleteRequest(
  DCAT_REPORT_DELETE,
  getDeleteReportUrl(reportId),
  t => ({
    success: t('scenes.referenceMetadata.dcat.messages.report.delete.success')
  })
);

export const showDcatReport = report => ({
  type: DCAT_REPORT_SHOW,
  report
});

export const hideDcatReport = () => ({
  type: DCAT_REPORT_HIDE
});

export const submitDcatReport = (metadataSet, report, reportAnnotations, reportStructure, id, target, identifiableTargets, annotationsConfig, isDraft) => {

  let annotations = report
    ? report.annotations
    : reportAnnotations
      ? reportAnnotations
      : [];
  annotations = updateReportStateAnnotations(annotations, isDraft);

  let reportRoot = {
    id: id,
    target: {
      id: target,
      referenceValues: identifiableTargets.map(value => ({
        id: value.id,
        object: value.value
      }))
    },
    annotations: annotations.length > 0 ? annotations : undefined,
    attributeSet: {
      reportedAttributes: []
    }
  };

  return postRequest(
    DCAT_REPORT_SUBMIT,
    getUpsertJsonReportUrl(metadataSet.id),
    getSdmxJsonFromSdmxJsonStructures(
      [getSdmxJsonStructureFromArtefact({
        ...metadataSet,
        reports: [getSdmxJsonReportFromReportStructure(reportStructure, reportRoot, annotationsConfig)]
      })],
      SDMX_JSON_METADATA_SET_LIST_KEY
    ),
    t => ({
      success: (report || reportAnnotations)
        ? t('scenes.referenceMetadata.dcat.messages.report.update.success')
        : t('scenes.referenceMetadata.dcat.messages.report.create.success')
    })
  );
};

export const submitDcatUpdateReportState = (metadataSetId, reportId, newState) => {
  let formData = new FormData();
  formData.append('newState', newState);

  return postRequest(
    DCAT_UPDATE_REPORT_STATE_SUBMIT,
    getUpdateStateReportUrl(metadataSetId, reportId),
    formData,
    t => ({
      success: t('scenes.referenceMetadata.dcat.messages.report.stateUpdate.success')
    })
  )
};

export const showDcatReportHtmlPage = htmlPageUrl => ({
  type: DCAT_REPORT_HTML_PAGE_SHOW,
  htmlPageUrl
});

export const hideDcatReportHtmlPage = () => ({
  type: DCAT_REPORT_HTML_PAGE_HIDE
});

export const setDcatReportStep = (step, t, mawsUrl) => ({
  type: DCAT_REPORT_STEP_SET,
  step,
  t,
  mawsUrl
});

export const selectDcatReportAttribute = selectedAttributeKey => ({
  type: DCAT_REPORT_ATTRIBUTE_SELECT,
  selectedAttributeKey
});

export const changeDcatReportAttribute = fields => ({
  type: DCAT_REPORT_ATTRIBUTE_CHANGE,
  fields
});

export const createDcatReportAttribute = () => ({
  type: DCAT_REPORT_ATTRIBUTE_CREATE
});

export const deleteDcatReportAttribute = () => ({
  type: DCAT_REPORT_ATTRIBUTE_DELETE
});

export const showDcatReportAttributeCodes = () => ({
  type: DCAT_REPORT_ATTRIBUTE_CODES_SHOW
});

export const hideDcatReportAttributeCodes = () => ({
  type: DCAT_REPORT_ATTRIBUTE_CODES_HIDE
});

export const readDcatReportAttributeCodes = triplet => getRequest(
  DCAT_REPORT_ATTRIBUTE_CODES_READ,
  getCodelistUrl(triplet)
);

export const setDcatReportAttributeCode = codeId => ({
  type: DCAT_REPORT_ATTRIBUTE_CODE_SET,
  codeId
});

export const changeDcatReportId = id => ({
  type: DCAT_REPORT_ID_CHANGE,
  id
});

export const selectDcatReportTarget = target => ({
  type: DCAT_REPORT_TARGET_SELECT,
  target
});

export const unsetDcatReportAttributeCode = () => ({
  type: DCAT_REPORT_ATTRIBUTE_CODE_UNSET
});

export const uploadDcatReportAttributeAttachment = file => {
  let fileFormData = new FormData();
  fileFormData.append('file', file);

  return postRequest(
    DCAT_REPORT_ATTRIBUTE_ATTACHMENT_UPLOAD,
    getUploadRMFileOnServerUrl(),
    fileFormData,
    t => ({
      success: t("scenes.referenceMetadata.commons.messages.attachmentUpload.success")
    })
  )
};

export const downloadDcatReportAttributeAttachment = fileName => ({
  ...getRequest(
    DCAT_REPORT_ATTRIBUTE_ATTACHMENT_DOWNLOAD,
    getDownloadRMFileOnServerUrl(fileName),
    undefined,
    true
  ),
  fileSave: {
    name: fileName
  }
});

export const showDcatReportTargetArtefacts = identifiableTarget => ({
  type: DCAT_REPORT_TARGET_ARTEFACTS_SHOW,
  identifiableTarget
});

export const hideDcatReportTargetArtefacts = () => ({
  type: DCAT_REPORT_TARGET_ARTEFACTS_HIDE
});

export const readDcatReportTargetArtefacts = (identifiableTarget, ownedDataflows) => ({
  ...getRequest(
    DCAT_REPORT_TARGET_ARTEFACTS_READ,
    ARTEFACT_TYPES.find(({type}) => type === identifiableTarget.objectType.toLowerCase()).url
  ),
  ownedDataflows
});

export const setDcatReportTargetArtefact = (value, identifiableTargetId) => ({
  type: DCAT_REPORT_TARGET_ARTEFACT_SET,
  value,
  identifiableTargetId
});

export const unsetDcatReportTargetArtefact = identifiableTarget => ({
  type: DCAT_REPORT_TARGET_ARTEFACT_UNSET,
  identifiableTarget
});

export const readDcatDataflow = dataflowTriplet => getRequest(
  DCAT_DATAFLOW_READ,
  getDataflowUrl(dataflowTriplet)
);

export const changeDcatDataflow = fields => ({
  type: DCAT_DATAFLOW_CHANGE,
  fields
});

export const submitDcatDataflow = dataflow => ({
  ...putRequest(
    DCAT_DATAFLOW_SUBMIT,
    getUpdateArtefactsUrl(),
    getSdmxJsonFromSdmxJsonStructures(
      [getSdmxJsonStructureFromArtefact(dataflow)],
      SDMX_JSON_DATAFLOW_LIST_KEY
    ),
    t => ({
      success: t('scenes.referenceMetadata.dcat.messages.dataflow.update.success')
    })
  ),
  dataflow
});

export const hideDcatDataflow = () => ({
  type: DCAT_DATAFLOW_HIDE
});

export const readDcatConceptSchemes = (conceptSchemeTriplets, appLang, dataLangs) => ({
  ...allRequest(
    DCAT_CONCEPT_SCHEMES_READ,
    conceptSchemeTriplets.map(_ => REQUEST_METHOD_GET),
    conceptSchemeTriplets.map(triplet => getConceptSchemeUrl(triplet)),
  ),
  appLang,
  dataLangs,
});

export const downloadDcatReport = (metadataSetId, reportId, fileName, metadataApiBaseUrl) => ({
  ...getRequest(
    DCAT_REPORT_DOWNLOAD,
    getMetadataApiReportUrl(metadataApiBaseUrl, metadataSetId, reportId)
  ),
  fileSave: {
    name: fileName,
    stringifyResponse: true
  }
});

export const showDcatMetadataSetHtmlPage = htmlPageUrl => ({
  type: DCAT_METADATA_SET_HTML_PAGE_SHOW,
  htmlPageUrl
});

export const hideDcatMetadataSetHtmlPage = () => ({
  type: DCAT_METADATA_SET_HTML_PAGE_HIDE
});