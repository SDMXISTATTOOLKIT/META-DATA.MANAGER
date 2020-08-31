import {REQUEST_ERROR, REQUEST_SUCCESS} from '../../../middlewares/api/actions';
import {
  getArtefactFromSdmxJsonStructure,
  getArtefactTripletFromUrn,
  getItemSchemeFromSdmxJsonFactory,
  getSdmxStructuresFromSdmxJson,
  getStringFromArtefactTriplet,
  getUrnFromArtefactTriplet,
  SDMX_JSON_CODELIST_ITEMS_KEY,
  SDMX_JSON_CONCEPT_SCHEME_ITEMS_KEY,
  SDMX_JSON_METADATA_SET_LIST_KEY
} from "../../../utils/sdmxJson";
import {getFilteredTree, getMappedTree, getNode} from "../../../utils/tree";
import _ from "lodash";
import uuidv4 from 'uuid';
import {
  DCAT_CONCEPT_SCHEMES_READ,
  DCAT_DATAFLOW_CHANGE,
  DCAT_DATAFLOW_HIDE,
  DCAT_DATAFLOW_READ,
  DCAT_DATAFLOW_SUBMIT,
  DCAT_METADATA_SET_CHANGE,
  DCAT_METADATA_SET_CREATE,
  DCAT_METADATA_SET_DELETE,
  DCAT_METADATA_SET_HIDE,
  DCAT_METADATA_SET_HTML_PAGE_HIDE,
  DCAT_METADATA_SET_HTML_PAGE_SHOW,
  DCAT_METADATA_SET_READ,
  DCAT_METADATA_SET_REPORTS_HIDE,
  DCAT_METADATA_SET_REPORTS_READ,
  DCAT_METADATA_SET_REPORTS_SHOW,
  DCAT_METADATA_SET_SHOW,
  DCAT_METADATA_SET_SUBMIT,
  DCAT_METADATA_SETS_READ,
  DCAT_METADATAFLOW_SET,
  DCAT_METADATAFLOW_UNSET,
  DCAT_METADATAFLOWS_HIDE,
  DCAT_METADATAFLOWS_READ,
  DCAT_METADATAFLOWS_SHOW,
  DCAT_REPORT_ATTRIBUTE_ATTACHMENT_UPLOAD,
  DCAT_REPORT_ATTRIBUTE_CHANGE,
  DCAT_REPORT_ATTRIBUTE_CODE_SET,
  DCAT_REPORT_ATTRIBUTE_CODE_UNSET,
  DCAT_REPORT_ATTRIBUTE_CODES_HIDE,
  DCAT_REPORT_ATTRIBUTE_CODES_READ,
  DCAT_REPORT_ATTRIBUTE_CODES_SHOW,
  DCAT_REPORT_ATTRIBUTE_CREATE,
  DCAT_REPORT_ATTRIBUTE_DELETE,
  DCAT_REPORT_ATTRIBUTE_SELECT,
  DCAT_REPORT_CREATE,
  DCAT_REPORT_DELETE,
  DCAT_REPORT_HIDE,
  DCAT_REPORT_HTML_PAGE_HIDE,
  DCAT_REPORT_HTML_PAGE_SHOW,
  DCAT_REPORT_ID_CHANGE,
  DCAT_REPORT_SHOW,
  DCAT_REPORT_STEP_SET,
  DCAT_REPORT_SUBMIT,
  DCAT_REPORT_TARGET_ARTEFACT_SET,
  DCAT_REPORT_TARGET_ARTEFACT_UNSET,
  DCAT_REPORT_TARGET_ARTEFACTS_HIDE,
  DCAT_REPORT_TARGET_ARTEFACTS_READ,
  DCAT_REPORT_TARGET_ARTEFACTS_SHOW,
  DCAT_REPORT_TARGET_SELECT,
  DCAT_UPDATE_REPORT_STATE_SUBMIT
} from "./actions";
import {
  addAttachmentAnnotation,
  CATALOG_TARGET_ID,
  EMPTY_REPORT_ATTRIBUTE_KEY,
  getAttachmentAnnotationFromAnnotations,
  getMetadataflowTripletFromAnnotations,
  getMsdTree,
  getNextAttributeIndexAvailable,
  getReportStructureFromSdmxJsonReport,
  removeAttachmentAnnotation,
  REPORT_STATE_NAME_ANNOTATION_ID,
  REPORT_STATE_PUBLISHED
} from "../../../utils/referenceMetadata";
import {getCurrentNodeConfig} from "../../../middlewares/current-node-config/middleware";
import {AUTO_ANNOTATION_FILE_PATH_KEY} from "../../../utils/annotations";
import {ARTEFACT_TYPES, customIsReferenceMetadataAutoAnnotation} from "../commons/constants";
import {getCurrentUserPermissions} from "../../../middlewares/current-user-permissions/middleware";

export const REPORT_DETAILS_WIZARD_STEP_FIRST = 0;
export const REPORT_DETAILS_WIZARD_STEP_SECOND = 1;

const getCatalogueInitializedText = (node, dataflow, mawsUrl, isDefaultEmpty) => {
  switch (node.id) {
    case "DCAT_AP_IT_DATASET_IDENTIFIER": {
      node.texts = getStringFromArtefactTriplet(dataflow);
      break;
    }
    case "DCAT_AP_IT_DATASET_TITLE": {
      node.texts = dataflow.name;
      break;
    }
    case "DCAT_AP_IT_DATASET_DESCRIPTION": {
      node.texts = dataflow.description;
      break;
    }
    case "DCAT_AP_IT_DISTRIBUTION_FORMAT": {
      node.texts = {
        en: "SDMX"
      };
      break;
    }
    case "DCAT_AP_IT_DISTRIBUTION_ACCESS_URL": {
      node.texts = mawsUrl
        ? `${mawsUrl}${mawsUrl.slice(-1) === '/' ? '' : '/'}sdmx/rest/data/${dataflow.agencyID},${dataflow.id},${dataflow.version}/all`
        : node.texts;
      break;
    }
    default: {
      node.texts = isDefaultEmpty
        ? null
        : node.texts
    }
  }
  return node;
};

const dcatReducer = (
  state = {
    metadataSets: null,
    metadataSetId: null,
    msd: null,
    msdTree: null,
    conceptSchemeTriplets: null,
    conceptSchemes: null,
    isMetadataSetVisible: false,
    metadataSet: null,
    isMetadataflowsVisible: false,
    metadataflows: null,
    isReportsVisible: false,
    reports: null,
    reportHtmlPageUrl: null,
    metadataSetHtmlPageUrl: null,

    isReportVisible: false,
    step: null,
    report: null,
    reportStructure: null,
    id: null,
    target: null,
    identifiableTargets: null,
    selectedIdentifiableTarget: null,
    artefacts: null,
    targetDataflow: null,
    selectedAttribute: null,
    isCodesVisible: false,
    codes: null,
    dataflow: null,
    isReportInitialized: false,
    reportAnnotations: null
  },
  action
) => {
  switch (action.type) {
    case DCAT_METADATA_SET_SHOW:
      return {
        ...state,
        metadataSetId: action.metadataSetId,
        isMetadataSetVisible: true
      };
    case DCAT_METADATA_SET_HIDE:
      return {
        ...state,
        metadataSetId: null,
        isMetadataSetVisible: false,
        metadataSet: null
      };
    case DCAT_METADATA_SET_CREATE:
      return {
        ...state,
        isMetadataSetVisible: true,
        metadataSet: {
          id: null,
          name: null,
          metadataflowTriplet: null,
          structureRef: null,
          reportingBegin: null,
          reportingEnd: null,
          validFrom: null,
          validTo: null,
          publicationYear: null,
          publicationPeriod: null
        }
      };
    case DCAT_METADATA_SET_REPORTS_SHOW:
      return {
        ...state,
        metadataSetId: action.metadataSetId,
        isReportsVisible: true
      };
    case DCAT_METADATA_SET_REPORTS_HIDE:
      return {
        ...state,
        metadataSetId: null,
        isReportsVisible: false,
        reports: null,
        metadataSet: null
      };
    case DCAT_METADATA_SET_CHANGE: {
      const metadataSet = _.cloneDeep(state.metadataSet);
      const customizer = (_, src, key) => {
        if (key === "annotations")
          return src;
        else {
          return undefined
        }
      };

      return {
        ...state,
        metadataSet: _.mergeWith(metadataSet, action.fields, customizer)
      };
    }
    case DCAT_REPORT_CREATE: {
      return {
        ...state,
        isReportVisible: true,
        step: REPORT_DETAILS_WIZARD_STEP_FIRST
      };
    }
    case DCAT_METADATAFLOWS_SHOW:
      return {
        ...state,
        isMetadataflowsVisible: true
      };
    case DCAT_METADATAFLOWS_HIDE:
      return {
        ...state,
        isMetadataflowsVisible: false,
        metadataflows: null
      };
    case DCAT_METADATAFLOW_SET:
      return {
        ...state,
        isMetadataflowsVisible: false,
        metadataflows: null,
        metadataSet: {
          ...state.metadataSet,
          structureRef: action.msdUrn,
          metadataflowTriplet: action.triplet
        }
      };
    case DCAT_METADATAFLOW_UNSET:
      return {
        ...state,
        metadataSet: {
          ...state.metadataSet,
          metadataflowTriplet: null,
          structureRef: null
        }
      };
    case DCAT_REPORT_SHOW: {
      const identifiableTargets = state.msdTree
        .find(msd => msd.target === action.report.target.id)
        .identifiableTargets
        .map(el => {
          const referenceValue = action.report.target.referenceValues.find(({id}) => id === el.id);
          return {
            ...el,
            value: referenceValue ? referenceValue.object : null
          }
        });

      return {
        ...state,
        report: action.report,
        id: action.report.id,
        target: action.report.target.id,
        identifiableTargets: identifiableTargets,
        isReportVisible: true,
        step: REPORT_DETAILS_WIZARD_STEP_FIRST
      };
    }
    case DCAT_REPORT_HIDE:
      return {
        ...state,
        report: null,
        id: null,
        target: null,
        identifiableTargets: null,
        isReportVisible: false,
        reportStructure: null,
        selectedAttribute: null,
        step: null,
        targetDataflow: null,
        reportAnnotations: null
      };
    case DCAT_REPORT_HTML_PAGE_SHOW:
      return {
        ...state,
        reportHtmlPageUrl: action.htmlPageUrl
      };
    case DCAT_REPORT_HTML_PAGE_HIDE:
      return {
        ...state,
        reportHtmlPageUrl: null
      };
    case DCAT_REPORT_STEP_SET: {
      let reportStructure = (action.step === REPORT_DETAILS_WIZARD_STEP_SECOND && state.reportStructure === null)
        ? getReportStructureFromSdmxJsonReport(state.msdTree, state.target, state.report, action.t, getCurrentNodeConfig(action).annotations, getCurrentUserPermissions(action))
        : state.reportStructure;

      if (action.step === REPORT_DETAILS_WIZARD_STEP_SECOND && state.targetDataflow) {
        reportStructure = getMappedTree(reportStructure, "metadataAttributes", node =>
          getCatalogueInitializedText(node, state.targetDataflow, action.mawsUrl, !state.isReportInitialized));
      }

      return {
        ...state,
        step: action.step,
        reportStructure: reportStructure,
        selectedAttribute: null,
        isReportInitialized: true
      };
    }
    case DCAT_REPORT_ATTRIBUTE_SELECT: {
      const reportStructure = _.cloneDeep(state.reportStructure);
      const selectedAttribute = action.selectedAttributeKey
        ? getNode(reportStructure, "metadataAttributes", node => node.nodeKey === action.selectedAttributeKey)
        : null;

      return {
        ...state,
        selectedAttribute: selectedAttribute
      };
    }
    case DCAT_REPORT_ATTRIBUTE_CHANGE: {
      const reportStructure = _.cloneDeep(state.reportStructure);
      let selectedAttribute = getNode(reportStructure, "metadataAttributes", node =>
        node.nodeKey === state.selectedAttribute.nodeKey);

      const customizer = (_, src, key) => {
        if (key === "annotations")
          return src;
        else {
          return undefined
        }
      };

      selectedAttribute = _.mergeWith(selectedAttribute, action.fields, customizer);
      if (action.fields && action.fields.attachment === null) {
        removeAttachmentAnnotation(selectedAttribute, getCurrentNodeConfig(action).annotations)
      }

      return {
        ...state,
        reportStructure: reportStructure,
        selectedAttribute: selectedAttribute
      };
    }
    case DCAT_REPORT_ATTRIBUTE_CREATE: {
      let reportStructure = _.cloneDeep(state.reportStructure);
      const selectedFolder = getNode(reportStructure, "metadataAttributes", node =>
        node.nodeKey === state.selectedAttribute.nodeKey);

      let node = _.cloneDeep(getNode(state.msdTree, "metadataAttributes", node =>
        node.id === (EMPTY_REPORT_ATTRIBUTE_KEY + state.selectedAttribute.id)));
      node = getMappedTree([node], "metadataAttributes", node => ({...node, nodeKey: uuidv4()}))[0];

      selectedFolder.metadataAttributes.push({
        ...node,
        isFolder: null,
        id: `${getNextAttributeIndexAvailable(selectedFolder.metadataAttributes)}. ${selectedFolder.id}`,
        name: `${getNextAttributeIndexAvailable(selectedFolder.metadataAttributes)}. ${selectedFolder.name}`,
        nodeKey: uuidv4(),
        texts: null
      });

      return {
        ...state,
        reportStructure: getFilteredTree(reportStructure, "metadataAttributes", node =>
          !node.id.includes(EMPTY_REPORT_ATTRIBUTE_KEY)),
        selectedAttribute: selectedFolder
      };
    }
    case DCAT_REPORT_ATTRIBUTE_DELETE:
      let reportStructure = _.cloneDeep(state.reportStructure);
      const parentAttribute = getNode(reportStructure, "metadataAttributes", node =>
        node.metadataAttributes.find(child => child.nodeKey === state.selectedAttribute.nodeKey));
      parentAttribute.metadataAttributes = parentAttribute.metadataAttributes.filter(child =>
        child.nodeKey !== state.selectedAttribute.nodeKey);

      return {
        ...state,
        reportStructure: reportStructure,
        selectedAttribute: null
      };
    case DCAT_REPORT_ATTRIBUTE_CODES_SHOW:
      return {
        ...state,
        isCodesVisible: true
      };
    case DCAT_REPORT_ATTRIBUTE_CODES_HIDE:
      return {
        ...state,
        isCodesVisible: false,
        codes: null
      };
    case DCAT_REPORT_ATTRIBUTE_CODE_SET: {
      const reportStructure = _.cloneDeep(state.reportStructure);

      const selectedCode = state.codes.find(code => code.id === action.codeId);

      const selectedAttribute = getNode(reportStructure, "metadataAttributes", node =>
        node.nodeKey === state.selectedAttribute.nodeKey);
      selectedAttribute.texts = selectedCode.name;

      return {
        ...state,
        isCodesVisible: false,
        codes: null,
        reportStructure: reportStructure,
        selectedAttribute: selectedAttribute
      };
    }
    case DCAT_REPORT_ATTRIBUTE_CODE_UNSET: {
      const reportStructure = _.cloneDeep(state.reportStructure);
      const selectedAttribute = getNode(reportStructure, "metadataAttributes", node =>
        node.nodeKey === state.selectedAttribute.nodeKey);
      selectedAttribute.texts = null;

      return {
        ...state,
        reportStructure: reportStructure,
        selectedAttribute: selectedAttribute
      };
    }
    case DCAT_REPORT_ID_CHANGE: {
      const newVal = action.id;
      const oldVal = state.id;

      return {
        ...state,
        id: newVal
          ? _.toUpper(/^[a-zA-Z0-9_]*$/.test(newVal) ? newVal : oldVal)
          : newVal,
      }
    }
    case DCAT_REPORT_TARGET_SELECT: {
      const msdTree = _.cloneDeep(state.msdTree);

      return {
        ...state,
        target: action.target,
        identifiableTargets: msdTree.find(msd => msd.target === action.target).identifiableTargets,
        reportStructure: null,
        selectedAttribute: null
      }
    }
    case DCAT_REPORT_TARGET_ARTEFACTS_SHOW:
      return {
        ...state,
        selectedIdentifiableTarget: action.identifiableTarget
      };
    case DCAT_REPORT_TARGET_ARTEFACTS_HIDE:
      return {
        ...state,
        selectedIdentifiableTarget: null,
        artefacts: null
      };
    case DCAT_REPORT_TARGET_ARTEFACT_SET:
      const identifiableTargets = _.cloneDeep(state.identifiableTargets);

      const identifiableTargetId = action.identifiableTargetId ? action.identifiableTargetId : state.selectedIdentifiableTarget.id;
      const identifiableTarget = identifiableTargets.find(({id}) => id === identifiableTargetId);

      if (state.selectedIdentifiableTarget) {
        const urnNamespace = ARTEFACT_TYPES.find(({type}) => type === state.selectedIdentifiableTarget.objectType.toLowerCase()).urnNamespace;
        identifiableTarget.value = getUrnFromArtefactTriplet(action.value, urnNamespace);
      } else {
        identifiableTarget.value = action.value;
      }

      return {
        ...state,
        selectedIdentifiableTarget: null,
        identifiableTargets: identifiableTargets,
        artefacts: null,
        targetDataflow: state.artefacts
          ? state.artefacts.find(dataflow => getStringFromArtefactTriplet(dataflow) === getStringFromArtefactTriplet(action.value))
          : null
      };
    case DCAT_REPORT_TARGET_ARTEFACT_UNSET: {
      const identifiableTargets = _.cloneDeep(state.identifiableTargets);
      identifiableTargets.find(value => value.id === action.identifiableTarget.id).value = null;

      return {
        ...state,
        identifiableTargets: identifiableTargets
      };
    }
    case DCAT_DATAFLOW_CHANGE:
      const dataflow = _.cloneDeep(state.dataflow);
      const customizer = (_, src, key) => {
        if (key === "annotations")
          return src;
        else {
          return undefined
        }
      };

      return {
        ...state,
        dataflow: _.mergeWith(dataflow, action.fields, customizer),
      };
    case DCAT_DATAFLOW_HIDE:
      return {
        ...state,
        dataflow: null
      };
    case DCAT_METADATA_SET_HTML_PAGE_SHOW:
      return {
        ...state,
        metadataSetHtmlPageUrl: action.htmlPageUrl
      };
    case DCAT_METADATA_SET_HTML_PAGE_HIDE:
      return {
        ...state,
        metadataSetHtmlPageUrl: null
      };
    case REQUEST_SUCCESS:
      switch (action.label) {
        case DCAT_METADATA_SETS_READ: {
          let metadataSets = (getSdmxStructuresFromSdmxJson(action.response[0], SDMX_JSON_METADATA_SET_LIST_KEY) || [])
            .filter(({structureRef}) => structureRef === getCurrentNodeConfig(action).dcatapit.msd)
            .map(ms => getArtefactFromSdmxJsonStructure(ms, null, customIsReferenceMetadataAutoAnnotation));

          metadataSets = metadataSets.map(ms => {
            const mdfTriplet = getMetadataflowTripletFromAnnotations(ms);
            return {
              ...ms,
              mdfId: mdfTriplet.id,
              mdfAgency: mdfTriplet.agencyID,
              mdfVersion: mdfTriplet.version,
              hasPermission: action.ownedMetadataflows.includes(getStringFromArtefactTriplet(mdfTriplet))
            }
          });

          const msd = getArtefactFromSdmxJsonStructure(getSdmxStructuresFromSdmxJson(action.response[1])[0]);

          const conceptSchemeTriplets = [];
          msd.metadataStructureComponents.reportStructureList.reportStructures.map(tree =>
            getMappedTree(tree.metadataAttributeList.metadataAttributes, "metadataAttributes", node => {
              if (!conceptSchemeTriplets.find(triplet =>
                getStringFromArtefactTriplet(triplet) === getStringFromArtefactTriplet(getArtefactTripletFromUrn(node.conceptIdentity)))) {
                conceptSchemeTriplets.push(getArtefactTripletFromUrn(node.conceptIdentity))
              }
              return node;
            })
          );

          return {
            ...state,
            metadataSets: metadataSets,
            msd: msd,
            conceptSchemeTriplets: conceptSchemeTriplets
          };
        }
        case DCAT_CONCEPT_SCHEMES_READ:
          const conceptSchemes = action.response.map(res =>
            getItemSchemeFromSdmxJsonFactory(SDMX_JSON_CONCEPT_SCHEME_ITEMS_KEY)(getSdmxStructuresFromSdmxJson(res)[0])
          );

          const msdTree = getMsdTree(state.msd, conceptSchemes, action.appLang, action.dataLangs, getCurrentNodeConfig(action).annotations, getCurrentUserPermissions(action));

          return {
            ...state,
            msdTree: msdTree,
            conceptSchemes: conceptSchemes,
          };
        case DCAT_METADATA_SET_READ: {

          const userPermissions = getCurrentUserPermissions(action);
          const customNoneIsAutoAnnotation = userPermissions && userPermissions.rules.includes("CanManageWorkingAnnotation")
            ? () => false
            : undefined;

          const metadataSet = getArtefactFromSdmxJsonStructure(
            getSdmxStructuresFromSdmxJson(action.response)[0],
            null,
            customNoneIsAutoAnnotation || customIsReferenceMetadataAutoAnnotation
          );

          return {
            ...state,
            metadataSet: {
              ...metadataSet,
              metadataflowTriplet: getMetadataflowTripletFromAnnotations(metadataSet),
            },
          };
        }
        case DCAT_METADATA_SET_REPORTS_READ: {
          const metadataSet = getArtefactFromSdmxJsonStructure(
            getSdmxStructuresFromSdmxJson(action.response)[0],
            null,
            customIsReferenceMetadataAutoAnnotation
          );

          let reports = (metadataSet.reports || [])
            .map(report => {
              const referenceValueObject = getStringFromArtefactTriplet(getArtefactTripletFromUrn(report.target.referenceValues[0].object));
              return {
                ...report,
                isPublished: (report.annotations.find(({id}) => (id || "").toLowerCase() === REPORT_STATE_NAME_ANNOTATION_ID.toLowerCase()) || {}).text,
                hasPermission: report.target.id === CATALOG_TARGET_ID
                  ? action.ownedMetadataflows.includes(referenceValueObject)
                  : action.ownedDataflows.includes(referenceValueObject)
              }
            });
          reports = reports.filter(report => (report.isPublished === REPORT_STATE_PUBLISHED || report.hasPermission));

          let reportAnnotations = null;
          if (state.isReportVisible) {
            const report = (reports || []).find(({id}) => id === state.id);
            reportAnnotations = report
              ? report.annotations
              : null;
          }

          return {
            ...state,
            metadataSet: metadataSet,
            reports: reports,
            reportAnnotations: reportAnnotations
          };
        }
        case DCAT_METADATA_SET_SUBMIT: {
          return {
            ...state,
            metadataSet: null,
            metadataSets: null,
            metadataSetId: null,
            msd: null,
            msdTree: null,
            conceptSchemeTriplets: null,
            conceptSchemes: null,
            isMetadataSetVisible: false
          }
        }
        case DCAT_METADATA_SET_DELETE:
          return {
            ...state,
            metadataSets: null
          };
        case DCAT_METADATAFLOWS_READ:
          let metadataflows = (getSdmxStructuresFromSdmxJson(action.response) || [])
            .map(artefact => getArtefactFromSdmxJsonStructure(artefact))
            .filter(({structure}) => structure === action.msdUrn)
            .filter(({id, agencyID, version}) =>
              action.ownedMetadataflows.includes(getStringFromArtefactTriplet({id, agencyID, version})));

          return {
            ...state,
            metadataflows: metadataflows
          };
        case DCAT_REPORT_ATTRIBUTE_CODES_READ:
          return {
            ...state,
            codes: getItemSchemeFromSdmxJsonFactory(SDMX_JSON_CODELIST_ITEMS_KEY)(
              getSdmxStructuresFromSdmxJson(action.response)[0]).codes
          };
        case DCAT_REPORT_TARGET_ARTEFACTS_READ: {
          let artefacts = (getSdmxStructuresFromSdmxJson(action.response) || [])
            .map(artefact => getArtefactFromSdmxJsonStructure(artefact));

          if (state.selectedIdentifiableTarget.objectType === "Dataflow") {
            artefacts = artefacts.filter(dataflow => action.ownedDataflows.includes(getStringFromArtefactTriplet(dataflow)));
          }

          return {
            ...state,
            artefacts: artefacts
          };
        }
        case DCAT_REPORT_SUBMIT: {
          return {
            ...state,
            reports: null
          }
        }
        case DCAT_REPORT_DELETE:
          return {
            ...state,
            reports: null
          };
        case DCAT_UPDATE_REPORT_STATE_SUBMIT:
          return {
            ...state,
            reports: null
          };
        case DCAT_DATAFLOW_READ:

          const userPermissions = getCurrentUserPermissions(action);
          const customNoneIsAutoAnnotation = userPermissions && userPermissions.rules.includes("CanManageWorkingAnnotation")
            ? () => false
            : undefined;

          const dataflow = getArtefactFromSdmxJsonStructure(
            getSdmxStructuresFromSdmxJson(action.response)[0],
            getCurrentNodeConfig(action).annotations,
            customNoneIsAutoAnnotation
          );

          return {
            ...state,
            dataflow: {
              ...dataflow,
              dsd: getStringFromArtefactTriplet(getArtefactTripletFromUrn(dataflow.structure))
            }
          };
        case DCAT_DATAFLOW_SUBMIT: {
          return {
            ...state,
            targetDataflow: action.dataflow,
            dataflow: null
          };
        }
        case DCAT_REPORT_ATTRIBUTE_ATTACHMENT_UPLOAD: {
          const reportStructure = _.cloneDeep(state.reportStructure);
          let selectedAttribute = getNode(reportStructure, "metadataAttributes", node =>
            node.nodeKey === state.selectedAttribute.nodeKey);

          const attachmentAnnot = getAttachmentAnnotationFromAnnotations(selectedAttribute, getCurrentNodeConfig(action).annotations);
          if (attachmentAnnot) {
            attachmentAnnot.title = action.response
          } else {

            const attachmentAnnotation = {
              id: getCurrentNodeConfig(action).annotations[AUTO_ANNOTATION_FILE_PATH_KEY],
              type: getCurrentNodeConfig(action).annotations[AUTO_ANNOTATION_FILE_PATH_KEY],
              title: action.response
            };

            addAttachmentAnnotation(selectedAttribute, getCurrentUserPermissions(action), attachmentAnnotation);
          }
          selectedAttribute.attachmentUploaded = true;

          return {
            ...state,
            reportStructure: reportStructure,
            selectedAttribute: selectedAttribute
          };
        }
        default:
          return state;
      }
    case REQUEST_ERROR:
      switch (action.label) {
        case DCAT_REPORT_DELETE:
        case DCAT_UPDATE_REPORT_STATE_SUBMIT:
          return {
            ...state,
            conceptSchemeTriplets: null
          };
        default:
          return state;
      }
    default:
      return state;
  }
};

export default dcatReducer;
