import {
  METADATA_SET_CATEGORIZED_METADATA_SETS_READ,
  METADATA_SET_CATEGORY_SELECT,
  METADATA_SET_CONCEPT_SCHEMES_READ,
  METADATA_SET_METADATA_SET_CATEGORISE,
  METADATA_SET_METADATA_SET_CHANGE,
  METADATA_SET_METADATA_SET_CLONE_CHANGE,
  METADATA_SET_METADATA_SET_CLONE_HIDE,
  METADATA_SET_METADATA_SET_CLONE_SHOW,
  METADATA_SET_METADATA_SET_CLONE_SUBMIT,
  METADATA_SET_METADATA_SET_CREATE,
  METADATA_SET_METADATA_SET_DELETE,
  METADATA_SET_METADATA_SET_HTML_PAGE_HIDE,
  METADATA_SET_METADATA_SET_HTML_PAGE_SHOW,
  METADATA_SET_METADATA_SET_READ,
  METADATA_SET_METADATA_SET_SELECT,
  METADATA_SET_METADATA_SET_SUBMIT,
  METADATA_SET_METADATAFLOW_SET,
  METADATA_SET_METADATAFLOW_UNSET,
  METADATA_SET_METADATAFLOWS_HIDE,
  METADATA_SET_METADATAFLOWS_READ,
  METADATA_SET_METADATAFLOWS_SHOW,
  METADATA_SET_REPORT_ATTRIBUTE_ATTACHMENT_UPLOAD,
  METADATA_SET_REPORT_ATTRIBUTE_CHANGE,
  METADATA_SET_REPORT_ATTRIBUTE_CODE_SET,
  METADATA_SET_REPORT_ATTRIBUTE_CODE_UNSET,
  METADATA_SET_REPORT_ATTRIBUTE_CODES_HIDE,
  METADATA_SET_REPORT_ATTRIBUTE_CODES_READ,
  METADATA_SET_REPORT_ATTRIBUTE_CODES_SHOW,
  METADATA_SET_REPORT_ATTRIBUTE_CREATE,
  METADATA_SET_REPORT_ATTRIBUTE_DELETE,
  METADATA_SET_REPORT_ATTRIBUTE_SELECT,
  METADATA_SET_REPORT_CREATE,
  METADATA_SET_REPORT_DELETE,
  METADATA_SET_REPORT_HIDE,
  METADATA_SET_REPORT_HTML_PAGE_HIDE,
  METADATA_SET_REPORT_HTML_PAGE_SHOW,
  METADATA_SET_REPORT_ID_CHANGE,
  METADATA_SET_REPORT_SHOW,
  METADATA_SET_REPORT_STEP_SET,
  METADATA_SET_REPORT_SUBMIT,
  METADATA_SET_REPORT_TARGET_ARTEFACT_SET,
  METADATA_SET_REPORT_TARGET_ARTEFACT_UNSET,
  METADATA_SET_REPORT_TARGET_ARTEFACTS_HIDE,
  METADATA_SET_REPORT_TARGET_ARTEFACTS_READ,
  METADATA_SET_REPORT_TARGET_ARTEFACTS_SHOW,
  METADATA_SET_REPORT_TARGET_SELECT,
  METADATA_SET_UPDATE_REPORT_STATE_SUBMIT
} from "./actions";
import {REQUEST_ERROR, REQUEST_SUCCESS} from '../../../middlewares/api/actions';
import {
  CATEGORY_SCHEME_ORDER_ANNOTATION_KEY,
  getArtefactFromSdmxJsonStructure,
  getArtefactTripletFromUrn,
  getItemFromSdmxJsonStructure,
  getItemSchemeFromSdmxJsonFactory,
  getSdmxStructuresFromSdmxJson,
  getStringFromArtefactTriplet,
  getUrnFromArtefact,
  getUrnFromArtefactTriplet,
  SDMX_JSON_CATEGORY_SCHEME_LIST_KEY,
  SDMX_JSON_CODELIST_ITEMS_KEY,
  SDMX_JSON_CONCEPT_SCHEME_ITEMS_KEY
} from "../../../utils/sdmxJson";
import {getCategorisedObjectsTree, getFilteredTree, getMappedTree, getNode} from "../../../utils/tree";
import _ from "lodash";
import uuidv4 from 'uuid';
import {
  addAttachmentAnnotation,
  EMPTY_REPORT_ATTRIBUTE_KEY,
  getAttachmentAnnotationFromAnnotations,
  getCategorisationsFromAnnotations,
  getMetadataflowTripletFromAnnotations,
  getMsdTree,
  getNextAttributeIndexAvailable,
  getReportStructureFromSdmxJsonReport,
  removeAttachmentAnnotation,
  REPORT_STATE_NAME_ANNOTATION_ID
} from "../../../utils/referenceMetadata";
import {getCurrentNodeConfig} from "../../../middlewares/current-node-config/middleware";
import {AUTO_ANNOTATION_FILE_PATH_KEY} from "../../../utils/annotations";
import {getOrderedChildren} from "../../../utils/artefacts";
import {
  ARTEFACT_TYPES,
  customIsReferenceMetadataAutoAnnotation,
  REPORT_DETAILS_WIZARD_STEP_FIRST,
  REPORT_DETAILS_WIZARD_STEP_SECOND
} from "../commons/constants";
import {getCurrentUserPermissions} from "../../../middlewares/current-user-permissions/middleware";

const metadataSetReducer = (
  state = {
    categorySchemes: null,
    categoryId: null,
    categoryUrn: null,
    metadataSets: null,
    metadataSetTree: null,
    metadataSetId: null,
    metadataSetCategory: null,
    msdTriplet: null,
    metadataSet: null,
    metadataflows: null,
    isMetadataflowsVisible: false,
    msd: null,
    msdTree: null,
    report: null,
    isReportVisible: false,
    reportStructure: null,
    selectedAttribute: null,
    step: null,
    isCodesVisible: false,
    codes: null,
    id: null,
    target: null,
    identifiableTargets: null,
    selectedIdentifiableTarget: null,
    artefacts: null,
    isFetchMetadataSetDisabled: true,
    reportHtmlPageUrl: null,
    conceptSchemeTriplets: null,
    conceptSchemes: null,
    isCloneVisible: false,
    cloneId: null,
    metadataSetHtmlPageUrl: null,
    reportAnnotations: null
  },
  action
) => {
  switch (action.type) {
    case METADATA_SET_CATEGORY_SELECT:
      return {
        ...state,
        categoryId: action.categoryId,
        categoryUrn: action.categoryUrn,
        metadataSet: null,
        conceptSchemeTriplets: null
      };
    case METADATA_SET_METADATA_SET_SELECT:
      return {
        ...state,
        metadataSetId: action.metadataSet ? action.metadataSet.id : null,
        metadataSetCategory: action.metadataSet ? action.metadataSet.categoryUrn : null,
        msdTriplet: action.msdTriplet,
        metadataSet: action.metadataSetId !== state.metadataSetId ? null : state.metadataSet,
        isFetchMetadataSetDisabled: false
      };
    case METADATA_SET_METADATA_SET_CREATE:
      return {
        ...state,
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
    case METADATA_SET_METADATA_SET_CHANGE: {
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
    case METADATA_SET_METADATAFLOWS_SHOW:
      return {
        ...state,
        isMetadataflowsVisible: true
      };
    case METADATA_SET_METADATAFLOWS_HIDE:
      return {
        ...state,
        isMetadataflowsVisible: false,
        metadataflows: null
      };
    case METADATA_SET_METADATAFLOW_SET:
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
    case METADATA_SET_METADATAFLOW_UNSET:
      return {
        ...state,
        metadataSet: {
          ...state.metadataSet,
          metadataflowTriplet: null,
          structureRef: null
        }
      };
    case METADATA_SET_REPORT_CREATE: {
      return {
        ...state,
        isReportVisible: true,
        step: REPORT_DETAILS_WIZARD_STEP_FIRST
      };
    }
    case METADATA_SET_REPORT_SHOW: {
      const msdTree = _.cloneDeep(state.msdTree);
      let identifiableTargets = msdTree
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
    case METADATA_SET_REPORT_HIDE:
      return {
        ...state,
        report: null,
        isReportVisible: false,
        reportStructure: null,
        selectedAttribute: null,
        step: null,
        id: null,
        target: null,
        identifiableTargets: null,
        reportAnnotations: null
      };
    case METADATA_SET_REPORT_HTML_PAGE_SHOW:
      return {
        ...state,
        reportHtmlPageUrl: action.htmlPageUrl
      };
    case METADATA_SET_REPORT_HTML_PAGE_HIDE:
      return {
        ...state,
        reportHtmlPageUrl: null
      };
    case METADATA_SET_REPORT_STEP_SET: {
      let reportStructure = (action.step === REPORT_DETAILS_WIZARD_STEP_SECOND && state.reportStructure === null)
        ? getReportStructureFromSdmxJsonReport(state.msdTree, state.target, state.report, action.t, getCurrentNodeConfig(action).annotations, getCurrentUserPermissions(action))
        : state.reportStructure;

      return {
        ...state,
        step: action.step,
        reportStructure: reportStructure,
        selectedAttribute: null
      };
    }
    case METADATA_SET_REPORT_ATTRIBUTE_SELECT: {
      const reportStructure = _.cloneDeep(state.reportStructure);
      const selectedAttribute = action.selectedAttributeKey
        ? getNode(reportStructure, "metadataAttributes", node => node.nodeKey === action.selectedAttributeKey)
        : null;

      return {
        ...state,
        selectedAttribute: selectedAttribute
      };
    }
    case METADATA_SET_REPORT_ATTRIBUTE_CHANGE: {
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
    case METADATA_SET_REPORT_ATTRIBUTE_CREATE: {
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
    case METADATA_SET_REPORT_ATTRIBUTE_DELETE:
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
    case METADATA_SET_REPORT_ATTRIBUTE_CODES_SHOW:
      return {
        ...state,
        isCodesVisible: true
      };
    case METADATA_SET_REPORT_ATTRIBUTE_CODES_HIDE:
      return {
        ...state,
        isCodesVisible: false,
        codes: null
      };
    case METADATA_SET_REPORT_ATTRIBUTE_CODE_SET: {
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
    case METADATA_SET_REPORT_ATTRIBUTE_CODE_UNSET: {
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
    case METADATA_SET_REPORT_ID_CHANGE: {
      const newVal = action.id;
      const oldVal = state.id;

      return {
        ...state,
        id: newVal
          ? _.toUpper(/^[a-zA-Z0-9_]*$/.test(newVal) ? newVal : oldVal)
          : newVal,
      }
    }
    case METADATA_SET_REPORT_TARGET_SELECT: {
      const msdTree = _.cloneDeep(state.msdTree);

      return {
        ...state,
        target: action.target,
        identifiableTargets: msdTree.find(msd => msd.target === action.target).identifiableTargets,
        reportStructure: null,
        selectedAttribute: null
      }
    }
    case METADATA_SET_REPORT_TARGET_ARTEFACTS_SHOW:
      return {
        ...state,
        selectedIdentifiableTarget: action.identifiableTarget
      };
    case METADATA_SET_REPORT_TARGET_ARTEFACTS_HIDE:
      return {
        ...state,
        selectedIdentifiableTarget: null,
        artefacts: null
      };
    case METADATA_SET_REPORT_TARGET_ARTEFACT_SET: {
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
        artefacts: null
      };
    }
    case METADATA_SET_REPORT_TARGET_ARTEFACT_UNSET: {
      const identifiableTargets = _.cloneDeep(state.identifiableTargets);
      identifiableTargets.find(value => value.id === action.identifiableTarget.id).value = null;

      return {
        ...state,
        identifiableTargets: identifiableTargets
      };
    }
    case METADATA_SET_METADATA_SET_CLONE_SHOW:
      return {
        ...state,
        isCloneVisible: true
      };
    case METADATA_SET_METADATA_SET_CLONE_HIDE:
      return {
        ...state,
        isCloneVisible: false,
        cloneId: null
      };
    case METADATA_SET_METADATA_SET_CLONE_CHANGE:
      return {
        ...state,
        cloneId: action.fields.cloneId
      };
    case METADATA_SET_METADATA_SET_HTML_PAGE_SHOW:
      return {
        ...state,
        metadataSetHtmlPageUrl: action.htmlPageUrl
      };
    case METADATA_SET_METADATA_SET_HTML_PAGE_HIDE:
      return {
        ...state,
        metadataSetHtmlPageUrl: null
      };
    case REQUEST_SUCCESS:
      switch (action.label) {
        case METADATA_SET_CATEGORIZED_METADATA_SETS_READ: {

          // gets metadataset list from server response
          let metadataSets = (getSdmxStructuresFromSdmxJson(action.response[1]) || [])
            .filter(({structureRef}) => structureRef !== getCurrentNodeConfig(action).dcatapit.msd)
            .map(ms => getArtefactFromSdmxJsonStructure(ms, null, customIsReferenceMetadataAutoAnnotation));
          metadataSets = metadataSets.map(metadataSet => ({
            ...metadataSet,
            type: "metadataSet",
            categorisations: getCategorisationsFromAnnotations(metadataSet),
            metadataflowTriplet: getMetadataflowTripletFromAnnotations(metadataSet)
          }));

          // gets ordered categoryScheme tree from server response
          const categorySchemes =
            (getSdmxStructuresFromSdmxJson(action.response[0], SDMX_JSON_CATEGORY_SCHEME_LIST_KEY) || [])
              .map(artefact => {
                let categoryScheme = {
                  ...getArtefactFromSdmxJsonStructure(artefact, getCurrentNodeConfig(action).annotations),
                  categories: (artefact.categories || []),
                  type: "categoryScheme",
                  urn: getUrnFromArtefact(artefact)
                };
                categoryScheme.categories = getMappedTree(
                  categoryScheme.categories,
                  "categories",
                  category => ({
                    ...getItemFromSdmxJsonStructure(category, getCurrentNodeConfig(action).annotations, CATEGORY_SCHEME_ORDER_ANNOTATION_KEY),
                    type: "category",
                    urn: getUrnFromArtefact(category)
                  })
                );

                return getMappedTree(
                  [categoryScheme],
                  "categories",
                  node => {
                    node.categories = getOrderedChildren(
                      node.categories,
                      node.id,
                      action.lang,
                      getCurrentNodeConfig(action).annotations[CATEGORY_SCHEME_ORDER_ANNOTATION_KEY]
                    );
                    return node
                  }
                )[0];
              });

          // utility to test if a metadataSet belongs to a specific category
          const checkIfMetadataSetBelongsToCategory = (metadataSet, category) => {
            if (category) {
              return category.type === "category"
                ? metadataSet.categorisations.find(categorisation => categorisation.target === category.urn)
                : false;
            } else {
              return metadataSet.categorisations.length > 0;
            }
          };

          // building category tree with metadataSet
          let metadataSetTree = getCategorisedObjectsTree(
            metadataSets,
            categorySchemes,
            'categories',
            (a, b) => a.id - b.id,
            checkIfMetadataSetBelongsToCategory,
            'id',
            'name',
            false
          );

          // iterates on tree adding "categoryUrn" and "parent" to all node in the tree
          metadataSetTree = metadataSetTree.map(metadataSet => {
            metadataSet.categories = getMappedTree(metadataSet.categories, "categories", node => {
              if (node.urn && node.categories) {
                node.categories = node.categories.map(child => ({...child, categoryUrn: node.urn, parent: node.id}));
              }
              return node
            });
            return metadataSet
          });

          // iterates on tree adding unique key to all node in the tree
          metadataSetTree = getMappedTree(metadataSetTree, "categories", node => ({
            ...node,
            nodeKey: node.type !== "metadataSet"
              ? `${node.urn}+${node.id}`
              : `cat_${node.categoryUrn}+${node.id}`
          }));

          return {
            ...state,
            metadataSets: metadataSets,
            categorySchemes: categorySchemes,
            metadataSetTree: metadataSetTree
          };
        }
        case METADATA_SET_METADATA_SET_READ: {

          const userPermissions = getCurrentUserPermissions(action);
          const customNoneIsAutoAnnotation = userPermissions && userPermissions.rules.includes("CanManageWorkingAnnotation")
            ? () => false
            : undefined;

          const metadataSet = getArtefactFromSdmxJsonStructure(
            getSdmxStructuresFromSdmxJson(action.response[0])[0],
            null,
            customNoneIsAutoAnnotation || customIsReferenceMetadataAutoAnnotation
          );

          const metadataSetNode = getNode(state.metadataSetTree, "categories", node =>
            node.type === "metadataSet" && node.id === state.metadataSetId && (!node.categoryUrn || node.categoryUrn === state.metadataSetCategory));

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

          let reportAnnotations = null;
          if (state.isReportVisible) {
            const report = (metadataSet.reports || []).find(({id}) => id === state.id);
            reportAnnotations = report
              ? report.annotations
              : null;
          }

          return {
            ...state,
            metadataSet: {
              ...metadataSet,
              metadataflowTriplet: getMetadataflowTripletFromAnnotations(metadataSet),
              reports: (metadataSet.reports || []).map(report => ({
                ...report,
                isPublished: (report.annotations.find(({id}) => (id || "").toLowerCase() === REPORT_STATE_NAME_ANNOTATION_ID.toLowerCase()) || {}).text
              })),
              categoryUrn: metadataSetNode.categoryUrn,
              type: metadataSetNode.type
            },
            msd: msd,
            isFetchMetadataSetDisabled: true,
            conceptSchemeTriplets: conceptSchemeTriplets,
            reportAnnotations: reportAnnotations
          };
        }
        case METADATA_SET_METADATAFLOWS_READ:
          let metadataflows = (getSdmxStructuresFromSdmxJson(action.response) || [])
            .map(artefact => getArtefactFromSdmxJsonStructure(artefact))
            .filter(({id, agencyID, version}) =>
              action.ownedMetadataflows.includes(getStringFromArtefactTriplet({id, agencyID, version})))
            .filter(({structure}) =>
              structure !== getCurrentNodeConfig(action).dcatapit.msd);

          return {
            ...state,
            metadataflows: metadataflows
          };
        case METADATA_SET_METADATA_SET_SUBMIT:
          return {
            ...state,
            categorySchemes: null,
            categoryId: null,
            categoryUrn: null,
            metadataSets: null,
            metadataSetTree: null,
            metadataSet: null,
            conceptSchemeTriplets: null,
            isFetchMetadataSetDisabled: false,
            metadataSetId: action.metadataSetId,
            metadataSetCategory: action.metadataSetCategory,
            msdTriplet: action.msdTriplet
          };
        case METADATA_SET_METADATA_SET_CATEGORISE:
          return {
            ...state,
            categorySchemes: null,
            categoryId: null,
            categoryUrn: null,
            metadataSets: null,
            metadataSetTree: null,
            metadataSet: null,
            conceptSchemeTriplets: null,
            isFetchMetadataSetDisabled: !!action.metadataSetId,
            metadataSetId: action.metadataSetId,
            metadataSetCategory: action.metadataSetCategory,
            msdTriplet: action.msdTriplet
          };
        case METADATA_SET_METADATA_SET_DELETE:
          return {
            ...state,
            categorySchemes: null,
            categoryId: null,
            categoryUrn: null,
            metadataSets: null,
            metadataSetTree: null,
            metadataSetId: state.metadataSetId === action.metadataSetId ? null : state.metadataSetId,
            metadataSetCategory: state.metadataSetId === action.metadataSetId ? null : state.metadataSetCategory,
            msdTriplet: state.metadataSetId === action.metadataSetId ? null : state.msdTriplet,
            metadataSet: null,
            conceptSchemeTriplets: null,
            isFetchMetadataSetDisabled: state.metadataSetId === action.metadataSetId
          };
        case METADATA_SET_REPORT_ATTRIBUTE_CODES_READ:
          return {
            ...state,
            codes: getItemSchemeFromSdmxJsonFactory(SDMX_JSON_CODELIST_ITEMS_KEY)(
              getSdmxStructuresFromSdmxJson(action.response)[0]).codes
          };
        case METADATA_SET_REPORT_TARGET_ARTEFACTS_READ:
          return {
            ...state,
            artefacts: (getSdmxStructuresFromSdmxJson(action.response) || [])
              .map(artefact => getArtefactFromSdmxJsonStructure(artefact))
          };
        case METADATA_SET_REPORT_SUBMIT: {
          return {
            ...state,
            isFetchMetadataSetDisabled: false
          }
        }
        case METADATA_SET_REPORT_DELETE:
          return {
            ...state,
            isFetchMetadataSetDisabled: false
          };
        case METADATA_SET_UPDATE_REPORT_STATE_SUBMIT:
          return {
            ...state,
            isFetchMetadataSetDisabled: false
          };
        case METADATA_SET_CONCEPT_SCHEMES_READ:
          const conceptSchemes = action.response.map(res =>
            getItemSchemeFromSdmxJsonFactory(SDMX_JSON_CONCEPT_SCHEME_ITEMS_KEY)(getSdmxStructuresFromSdmxJson(res)[0])
          );

          return {
            ...state,
            msdTree: getMsdTree(state.msd, conceptSchemes, action.appLang, action.dataLangs, getCurrentNodeConfig(action).annotations, getCurrentUserPermissions(action)),
            conceptSchemes: conceptSchemes
          };
        case METADATA_SET_METADATA_SET_CLONE_SUBMIT:
          return {
            ...state,
            categorySchemes: null,
            categoryId: null,
            categoryUrn: null,
            metadataSets: null,
            metadataSetTree: null,
            metadataSet: null,
            conceptSchemeTriplets: null,
            isCloneVisible: false,
            cloneId: null,
            isFetchMetadataSetDisabled: false
          };
        case METADATA_SET_REPORT_ATTRIBUTE_ATTACHMENT_UPLOAD: {
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
        case METADATA_SET_METADATA_SET_CATEGORISE:
          return metadataSetReducer(undefined, {});
        default:
          return state;
      }
    default:
      return state;
  }
};

export default metadataSetReducer;
