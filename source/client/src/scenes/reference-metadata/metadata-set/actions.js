import {allRequest, deleteRequest, getRequest, postRequest, REQUEST_METHOD_GET} from "../../../middlewares/api/actions";
import {
  getCategorySchemeUrl,
  getCodelistUrl,
  getConceptSchemeUrl,
  getDeleteMetadataSetUrl,
  getDeleteReportUrl,
  getDownloadRMFileOnServerUrl,
  getMetadataflowUrl,
  getMetadataSetsUrl,
  getMetadataSetUrl,
  getMsdUrl,
  getUpdateStateReportUrl,
  getUploadRMFileOnServerUrl,
  getUpsertJsonReportUrl,
  getUpsertMetadataSetUrl
} from "../../../constants/urls";
import {
  getArtefactTripletFromUrn,
  getSdmxJsonFromSdmxJsonStructures,
  getSdmxJsonStructureFromArtefact,
  getUrnFromArtefactTriplet,
  SDMX_JSON_METADATA_SET_LIST_KEY,
  SDMX_JSON_METADATAFLOW_URN_NAMESPACE
} from "../../../utils/sdmxJson";
import _ from "lodash";
import {
  getCategorisationsFromAnnotations,
  getDbIdAnnotationFromAnnotations,
  getMetadataApiReportUrl,
  getSdmxJsonReportFromReportStructure,
  METADATA_SET_ID_ANNOTATION_ID,
  updateReportStateAnnotations
} from "../../../utils/referenceMetadata";
import {ARTEFACT_TYPES, getWorkingAnnotations} from "../commons/constants";

export const METADATA_SET_CATEGORIZED_METADATA_SETS_READ = "METADATA_SET_CATEGORIZED_METADATA_SETS_READ";

export const METADATA_SET_CATEGORY_SELECT = "METADATA_SET_CATEGORY_SELECT";

export const METADATA_SET_METADATA_SET_SELECT = "METADATA_SET_METADATA_SET_SELECT";
export const METADATA_SET_METADATA_SET_CREATE = "METADATA_SET_METADATA_SET_CREATE";
export const METADATA_SET_METADATA_SET_READ = "METADATA_SET_METADATA_SET_READ";
export const METADATA_SET_METADATA_SET_CHANGE = "METADATA_SET_METADATA_SET_CHANGE";
export const METADATA_SET_METADATA_SET_SUBMIT = "METADATA_SET_METADATA_SET_SUBMIT";
export const METADATA_SET_METADATA_SET_CATEGORISE = "METADATA_SET_METADATA_SET_CATEGORISE";
export const METADATA_SET_METADATA_SET_DELETE = "METADATA_SET_METADATA_SET_DELETE";

export const METADATA_SET_METADATA_SET_CLONE_SHOW = "METADATA_SET_METADATA_SET_CLONE_SHOW";
export const METADATA_SET_METADATA_SET_CLONE_HIDE = "METADATA_SET_METADATA_SET_CLONE_HIDE";
export const METADATA_SET_METADATA_SET_CLONE_CHANGE = "METADATA_SET_METADATA_SET_CLONE_CHANGE";
export const METADATA_SET_METADATA_SET_CLONE_SUBMIT = "METADATA_SET_METADATA_SET_CLONE_SUBMIT";

export const METADATA_SET_METADATAFLOWS_SHOW = "METADATA_SET_METADATAFLOWS_SHOW";
export const METADATA_SET_METADATAFLOWS_HIDE = "METADATA_SET_METADATAFLOWS_HIDE";
export const METADATA_SET_METADATAFLOWS_READ = "METADATA_SET_METADATAFLOWS_READ";
export const METADATA_SET_METADATAFLOW_SET = "METADATA_SET_METADATAFLOW_SET";
export const METADATA_SET_METADATAFLOW_UNSET = "METADATA_SET_METADATAFLOW_UNSET";

export const METADATA_SET_REPORT_CREATE = "METADATA_SET_REPORT_CREATE";
export const METADATA_SET_REPORT_DELETE = "METADATA_SET_REPORT_DELETE";
export const METADATA_SET_REPORT_SHOW = "METADATA_SET_REPORT_SHOW";
export const METADATA_SET_REPORT_HIDE = "METADATA_SET_REPORT_HIDE";
export const METADATA_SET_REPORT_SUBMIT = "METADATA_SET_REPORT_SUBMIT";

export const METADATA_SET_REPORT_STEP_SET = "METADATA_SET_REPORT_STEP_SET";

export const METADATA_SET_REPORT_ATTRIBUTE_SELECT = "METADATA_SET_REPORT_ATTRIBUTE_SELECT";
export const METADATA_SET_REPORT_ATTRIBUTE_CHANGE = "METADATA_SET_REPORT_ATTRIBUTE_CHANGE";
export const METADATA_SET_REPORT_ATTRIBUTE_CREATE = "METADATA_SET_REPORT_ATTRIBUTE_CREATE";
export const METADATA_SET_REPORT_ATTRIBUTE_DELETE = "METADATA_SET_REPORT_ATTRIBUTE_DELETE";

export const METADATA_SET_UPDATE_REPORT_STATE_SUBMIT = "METADATA_SET_UPDATE_REPORT_STATE_SUBMIT";

export const METADATA_SET_REPORT_HTML_PAGE_SHOW = "METADATA_SET_REPORT_HTML_PAGE_SHOW";
export const METADATA_SET_REPORT_HTML_PAGE_HIDE = "METADATA_SET_REPORT_HTML_PAGE_HIDE";

export const METADATA_SET_REPORT_ATTRIBUTE_CODES_SHOW = "METADATA_SET_REPORT_ATTRIBUTE_CODES_SHOW";
export const METADATA_SET_REPORT_ATTRIBUTE_CODES_HIDE = "METADATA_SET_REPORT_ATTRIBUTE_CODES_HIDE";
export const METADATA_SET_REPORT_ATTRIBUTE_CODES_READ = "METADATA_SET_REPORT_ATTRIBUTE_CODES_READ";
export const METADATA_SET_REPORT_ATTRIBUTE_CODE_SET = "METADATA_SET_REPORT_ATTRIBUTE_CODE_SET";
export const METADATA_SET_REPORT_ATTRIBUTE_CODE_UNSET = "METADATA_SET_REPORT_ATTRIBUTE_CODE_UNSET";

export const METADATA_SET_REPORT_ATTRIBUTE_ATTACHMENT_UPLOAD = "METADATA_SET_REPORT_ATTRIBUTE_ATTACHMENT_UPLOAD";
export const METADATA_SET_REPORT_ATTRIBUTE_ATTACHMENT_DOWNLOAD = "METADATA_SET_REPORT_ATTRIBUTE_ATTACHMENT_DOWNLOAD";

export const METADATA_SET_REPORT_ID_CHANGE = "METADATA_SET_REPORT_ID_CHANGE";

export const METADATA_SET_REPORT_TARGET_SELECT = "METADATA_SET_REPORT_TARGET_SELECT";

export const METADATA_SET_REPORT_TARGET_ARTEFACTS_SHOW = "METADATA_SET_REPORT_TARGET_ARTEFACTS_SHOW";
export const METADATA_SET_REPORT_TARGET_ARTEFACTS_HIDE = "METADATA_SET_REPORT_TARGET_ARTEFACTS_HIDE";
export const METADATA_SET_REPORT_TARGET_ARTEFACTS_READ = "METADATA_SET_REPORT_TARGET_ARTEFACTS_READ";
export const METADATA_SET_REPORT_TARGET_ARTEFACT_SET = "METADATA_SET_REPORT_TARGET_ARTEFACT_SET";
export const METADATA_SET_REPORT_TARGET_ARTEFACT_UNSET = "METADATA_SET_REPORT_TARGET_ARTEFACT_UNSET";

export const METADATA_SET_CONCEPT_SCHEMES_READ = "METADATA_SET_CONCEPT_SCHEMES_READ";

export const METADATA_SET_REPORT_DOWNLOAD = "METADATA_SET_REPORT_DOWNLOAD";

export const METADATA_SET_METADATA_SET_HTML_PAGE_SHOW = "METADATA_SET_METADATA_SET_HTML_PAGE_SHOW";
export const METADATA_SET_METADATA_SET_HTML_PAGE_HIDE = "METADATA_SET_METADATA_SET_HTML_PAGE_HIDE";

const METADATASET_CLONE_ANNOTATION = {
  id: "MetadataSetToClone",
  type: "MetadataSetToClone"
};

export const readMetadataSetCategorizedMetadataSets = lang => ({
  ...allRequest(
    METADATA_SET_CATEGORIZED_METADATA_SETS_READ,
    [REQUEST_METHOD_GET, REQUEST_METHOD_GET],
    [getCategorySchemeUrl(null, true), getMetadataSetsUrl()]
  ),
  lang
});

export const selectMetadataSetCategory = (categoryId, categoryUrn) => ({
  type: METADATA_SET_CATEGORY_SELECT,
  categoryId,
  categoryUrn
});

export const selectMetadataSetMetadataSet = (metadataSet, msdTriplet) => ({
  type: METADATA_SET_METADATA_SET_SELECT,
  metadataSet,
  msdTriplet
});

export const createMetadataSetMetadataSet = () => ({
  type: METADATA_SET_METADATA_SET_CREATE
});

export const readMetadataSetMetadataSet = (metadataSetId, msdTriplet) => allRequest(
  METADATA_SET_METADATA_SET_READ,
  [REQUEST_METHOD_GET, REQUEST_METHOD_GET],
  [getMetadataSetUrl(metadataSetId, true), getMsdUrl(msdTriplet)]
);

export const changeMetadataSetMetadataSet = fields => ({
  type: METADATA_SET_METADATA_SET_CHANGE,
  fields
});

export const submitMetadataSetMetadataSet = (metadataSet, categoryUrn) => {

  let newCategorisation = null;
  if (categoryUrn) {
    const catId = 'CAT_' +
      metadataSet.metadataflowTriplet.id.substr(0, 40) +
      '_' +
      String(_.random(99999)).padStart(5, '0');
    newCategorisation = {
      id: catId,
      agencyID: metadataSet.metadataflowTriplet.agencyID,
      version: metadataSet.metadataflowTriplet.version,
      source: getUrnFromArtefactTriplet(metadataSet.metadataflowTriplet, SDMX_JSON_METADATAFLOW_URN_NAMESPACE),
      target: categoryUrn
    };
  }

  let autoAnnotations = getWorkingAnnotations(metadataSet);
  if (newCategorisation) {
    autoAnnotations.push({
      id: `categorisation_[${newCategorisation.id}]`,
      text: {
        en: `${newCategorisation.id}+${newCategorisation.agencyID}+${newCategorisation.version}+${newCategorisation.source}+${newCategorisation.target}`
      }
    })
  } else {
    const categorisationAnnotations = ((metadataSet.annotations || []).concat(metadataSet.autoAnnotations || []))
      .filter(annotation => annotation.id.substring(0, 14) === "categorisation");
    autoAnnotations = autoAnnotations.concat(categorisationAnnotations);
  }
  const idAnnotation = getDbIdAnnotationFromAnnotations(metadataSet, METADATA_SET_ID_ANNOTATION_ID);
  if (idAnnotation) {
    autoAnnotations.push(idAnnotation)
  }

  return ({
    ...postRequest(
      METADATA_SET_METADATA_SET_SUBMIT,
      getUpsertMetadataSetUrl(),
      getSdmxJsonFromSdmxJsonStructures(
        [getSdmxJsonStructureFromArtefact({
          ...metadataSet,
          autoAnnotations: autoAnnotations,
          reports: metadataSet.reports || []
        })],
        SDMX_JSON_METADATA_SET_LIST_KEY
      ),
      t => ({
        success: idAnnotation !== undefined
          ? t('scenes.referenceMetadata.metadataSet.messages.metadataSet.update.success')
          : t('scenes.referenceMetadata.metadataSet.messages.metadataSet.create.success')
      })
    ),
    metadataSetId: metadataSet.id,
    metadataSetCategory: categoryUrn || metadataSet.categoryUrn,
    msdTriplet: getArtefactTripletFromUrn(metadataSet.structureRef)
  })
};

export const categoriseMetadataSetMetadataSet = (metadataSet, categoryUrn) => {

  let categorisations = [];

  if (metadataSet.categoryUrn) {
    categorisations = (getCategorisationsFromAnnotations(metadataSet) || []);

    const catToEdit = categorisations.find(categorisation => categorisation.target === metadataSet.categoryUrn);

    if (categoryUrn) {
      catToEdit.target = categoryUrn
    } else {
      categorisations = categorisations.filter(cat => cat.id !== catToEdit.id);
    }

  } else {
    const categorisationId = 'CAT_' +
      metadataSet.metadataflowTriplet.id.substr(0, 40) +
      '_' +
      String(_.random(99999)).padStart(5, '0');
    categorisations = [{
      id: categorisationId,
      agencyID: metadataSet.metadataflowTriplet.agencyID,
      version: metadataSet.metadataflowTriplet.version,
      source: getUrnFromArtefactTriplet(metadataSet.metadataflowTriplet, SDMX_JSON_METADATAFLOW_URN_NAMESPACE),
      target: categoryUrn
    }];
  }

  return ({
    ...postRequest(
      METADATA_SET_METADATA_SET_CATEGORISE,
      getUpsertMetadataSetUrl(),
      getSdmxJsonFromSdmxJsonStructures(
        [getSdmxJsonStructureFromArtefact({
          ...metadataSet,
          autoAnnotations: [],
          annotations: (metadataSet.annotations || [])
            .concat(getDbIdAnnotationFromAnnotations(metadataSet, METADATA_SET_ID_ANNOTATION_ID))
            .concat(getWorkingAnnotations(metadataSet))
            .concat(
              categorisations.map(cat => ({
                id: `categorisation_[${cat.id}]`,
                text: {
                  en: `${cat.id}+${cat.agencyID}+${cat.version}+${cat.source}+${cat.target}`
                }
              }))
            ),
          reports: metadataSet.reports || []
        })],
        SDMX_JSON_METADATA_SET_LIST_KEY
      ),
      t => ({
        success: metadataSet.categoryUrn
          ? categoryUrn
            ? t('scenes.referenceMetadata.metadataSet.messages.categorisation.update.success')
            : t('scenes.referenceMetadata.metadataSet.messages.categorisation.remove.success')
          : t('scenes.referenceMetadata.metadataSet.messages.categorisation.create.success')
      })
    ),
    metadataSetId: (metadataSet.categoryUrn && !categoryUrn) ? null : metadataSet.id,
    metadataSetCategory: (metadataSet.categoryUrn && !categoryUrn) ? null : categoryUrn,
    msdTriplet: (metadataSet.categoryUrn && !categoryUrn) ? null : getArtefactTripletFromUrn(metadataSet.structureRef)
  });
};

export const deleteMetadataSetMetadataSet = metadataSetId => ({
  ...deleteRequest(
    METADATA_SET_METADATA_SET_DELETE,
    getDeleteMetadataSetUrl(metadataSetId),
    t => ({
      success: t('scenes.referenceMetadata.metadataSet.messages.metadataSet.delete.success')
    })
  ),
  metadataSetId
});

export const showMetadataSetMetadataflows = () => ({
  type: METADATA_SET_METADATAFLOWS_SHOW
});

export const hideMetadataSetMetadataflows = () => ({
  type: METADATA_SET_METADATAFLOWS_HIDE
});

export const readMetadataSetMetadataflows = ownedMetadataflows => ({
  ...getRequest(
    METADATA_SET_METADATAFLOWS_READ,
    getMetadataflowUrl()
  ),
  ownedMetadataflows
});

export const setMetadataSetMetadataflow = (triplet, msdUrn) => ({
  type: METADATA_SET_METADATAFLOW_SET,
  triplet,
  msdUrn
});

export const unsetMetadataSetMetadataflow = () => ({
  type: METADATA_SET_METADATAFLOW_UNSET
});

export const createMetadataSetReport = () => ({
  type: METADATA_SET_REPORT_CREATE
});

export const deleteMetadataSetReport = reportId => deleteRequest(
  METADATA_SET_REPORT_DELETE,
  getDeleteReportUrl(reportId),
  t => ({
    success: t('scenes.referenceMetadata.metadataSet.messages.report.delete.success')
  })
);

export const showMetadataSetReport = report => ({
  type: METADATA_SET_REPORT_SHOW,
  report
});

export const hideMetadataSetReport = () => ({
  type: METADATA_SET_REPORT_HIDE
});

export const submitMetadataSetReport = (metadataSet, report, reportAnnotations, reportStructure, id, target, identifiableTargets, annotationsConfig, isDraft) => {

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
    METADATA_SET_REPORT_SUBMIT,
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
        ? t('scenes.referenceMetadata.metadataSet.messages.report.update.success')
        : t('scenes.referenceMetadata.metadataSet.messages.report.create.success')
    })
  );
};

export const submitMetadataSetUpdateReportState = (metadataSetId, reportId, newState) => {
  let formData = new FormData();
  formData.append('newState', newState);

  return postRequest(
    METADATA_SET_UPDATE_REPORT_STATE_SUBMIT,
    getUpdateStateReportUrl(metadataSetId, reportId),
    formData,
    t => ({
      success: t('scenes.referenceMetadata.metadataSet.messages.report.stateUpdate.success')
    })
  )
};

export const showMetadataSetReportHtmlPage = htmlPageUrl => ({
  type: METADATA_SET_REPORT_HTML_PAGE_SHOW,
  htmlPageUrl
});

export const hideMetadataSetReportHtmlPage = () => ({
  type: METADATA_SET_REPORT_HTML_PAGE_HIDE
});

export const setMetadataSetReportStep = (step, t) => ({
  type: METADATA_SET_REPORT_STEP_SET,
  step,
  t
});

export const selectMetadataSetReportAttribute = selectedAttributeKey => ({
  type: METADATA_SET_REPORT_ATTRIBUTE_SELECT,
  selectedAttributeKey
});

export const changeMetadataSetReportAttribute = fields => ({
  type: METADATA_SET_REPORT_ATTRIBUTE_CHANGE,
  fields
});

export const createMetadataSetReportAttribute = () => ({
  type: METADATA_SET_REPORT_ATTRIBUTE_CREATE
});

export const deleteMetadataSetReportAttribute = () => ({
  type: METADATA_SET_REPORT_ATTRIBUTE_DELETE
});

export const showMetadataSetReportAttributeCodes = () => ({
  type: METADATA_SET_REPORT_ATTRIBUTE_CODES_SHOW
});

export const hideMetadataSetReportAttributeCodes = () => ({
  type: METADATA_SET_REPORT_ATTRIBUTE_CODES_HIDE
});

export const readMetadataSetReportAttributeCodes = triplet => getRequest(
  METADATA_SET_REPORT_ATTRIBUTE_CODES_READ,
  getCodelistUrl(triplet)
);

export const setMetadataSetReportAttributeCode = codeId => ({
  type: METADATA_SET_REPORT_ATTRIBUTE_CODE_SET,
  codeId
});

export const unsetMetadataSetReportAttributeCode = () => ({
  type: METADATA_SET_REPORT_ATTRIBUTE_CODE_UNSET
});

export const uploadMetadataSetReportAttributeAttachment = file => {
  let fileFormData = new FormData();
  fileFormData.append('file', file);

  return postRequest(
    METADATA_SET_REPORT_ATTRIBUTE_ATTACHMENT_UPLOAD,
    getUploadRMFileOnServerUrl(),
    fileFormData,
    t => ({
      success: t("scenes.referenceMetadata.commons.messages.attachmentUpload.success")
    })
  )
};

export const downloadMetadataSetReportAttributeAttachment = fileName => ({
  ...getRequest(
    METADATA_SET_REPORT_ATTRIBUTE_ATTACHMENT_DOWNLOAD,
    getDownloadRMFileOnServerUrl(fileName),
    undefined,
    true
  ),
  fileSave: {
    name: fileName
  }
});

export const changeMetadataSetReportId = id => ({
  type: METADATA_SET_REPORT_ID_CHANGE,
  id
});

export const selectMetadataSetReportTarget = target => ({
  type: METADATA_SET_REPORT_TARGET_SELECT,
  target
});

export const showMetadataSetReportTargetArtefacts = identifiableTarget => ({
  type: METADATA_SET_REPORT_TARGET_ARTEFACTS_SHOW,
  identifiableTarget
});

export const hideMetadataSetReportTargetArtefacts = () => ({
  type: METADATA_SET_REPORT_TARGET_ARTEFACTS_HIDE
});

export const readMetadataSetReportTargetArtefacts = identifiableTarget => getRequest(
  METADATA_SET_REPORT_TARGET_ARTEFACTS_READ,
  ARTEFACT_TYPES.find(({type}) => type === identifiableTarget.objectType.toLowerCase()).url
);

export const setMetadataSetReportTargetArtefact = (value, identifiableTargetId) => ({
  type: METADATA_SET_REPORT_TARGET_ARTEFACT_SET,
  value,
  identifiableTargetId
});

export const unsetMetadataSetReportTargetArtefact = identifiableTarget => ({
  type: METADATA_SET_REPORT_TARGET_ARTEFACT_UNSET,
  identifiableTarget
});

export const readMetadataSetConceptSchemes = (conceptSchemeTriplets, appLang, dataLangs) => ({
  ...allRequest(
    METADATA_SET_CONCEPT_SCHEMES_READ,
    conceptSchemeTriplets.map(_ => REQUEST_METHOD_GET),
    conceptSchemeTriplets.map(triplet => getConceptSchemeUrl(triplet)),
  ),
  appLang,
  dataLangs
});

export const showMetadataSetMetadataSetClone = () => ({
  type: METADATA_SET_METADATA_SET_CLONE_SHOW
});

export const hideMetadataSetMetadataSetClone = () => ({
  type: METADATA_SET_METADATA_SET_CLONE_HIDE
});

export const changeMetadataSetMetadataSetClone = fields => ({
  type: METADATA_SET_METADATA_SET_CLONE_CHANGE,
  fields
});

export const submitMetadataSetMetadataSetClone = (metadataSet, id) => {

  return postRequest(
    METADATA_SET_METADATA_SET_CLONE_SUBMIT,
    getUpsertMetadataSetUrl(),
    getSdmxJsonFromSdmxJsonStructures(
      [getSdmxJsonStructureFromArtefact({
        ...metadataSet,
        id: id,
        annotations: (metadataSet.annotations || [])
          .filter(({id}) => id !== METADATA_SET_ID_ANNOTATION_ID),
        autoAnnotations: (metadataSet.autoAnnotations || [])
          .filter(({id}) => id !== METADATA_SET_ID_ANNOTATION_ID)
          .concat(METADATASET_CLONE_ANNOTATION),
        reports: (metadataSet.reports || []).map(report => ({
          ...report,
          annotations: undefined
        }))
      })],
      SDMX_JSON_METADATA_SET_LIST_KEY
    ),
    t => ({
      success: t('scenes.referenceMetadata.metadataSet.messages.metadataSet.clone.success')
    })
  );
};

export const downloadMetadataSetReport = (metadataSetId, reportId, fileName, metadataApiBaseUrl) => ({
  ...getRequest(
    METADATA_SET_REPORT_DOWNLOAD,
    getMetadataApiReportUrl(metadataApiBaseUrl, metadataSetId, reportId)
  ),
  fileSave: {
    name: fileName,
    stringifyResponse: true
  }
});

export const showMetadataSetMetadataSetHtmlPage = htmlPageUrl => ({
  type: METADATA_SET_METADATA_SET_HTML_PAGE_SHOW,
  htmlPageUrl
});

export const hideMetadataSetMetadataSetHtmlPage = () => ({
  type: METADATA_SET_METADATA_SET_HTML_PAGE_HIDE
});