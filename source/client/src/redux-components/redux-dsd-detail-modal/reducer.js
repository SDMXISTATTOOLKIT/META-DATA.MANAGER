import {
  DSD_DIMENSION_ID_FREQUENCY,
  DSD_DIMENSION_ID_TIME,
  DSD_DIMENSION_TYPE_FREQUENCY,
  DSD_DIMENSION_TYPE_NORMAL,
  DSD_DIMENSION_TYPE_TIME,
  getArtefactFromSdmxJsonStructure,
  getDsdFromSdmxJsonStructure,
  getItemFromSdmxJsonStructure,
  getQuartupletFromItemString,
  getSdmxStructuresFromSdmxJson,
  getStringFromItemUrn
} from "../../utils/sdmxJson";
import {
  DSD_DETAIL_AGENCIES_READ,
  DSD_DETAIL_ATTRIBUTE_CHANGE,
  DSD_DETAIL_ATTRIBUTE_CREATE,
  DSD_DETAIL_ATTRIBUTE_DELETE,
  DSD_DETAIL_ATTRIBUTE_EDIT,
  DSD_DETAIL_ATTRIBUTE_HIDE,
  DSD_DETAIL_ATTRIBUTE_SUBMIT,
  DSD_DETAIL_CHANGE,
  DSD_DETAIL_CLONE_CHANGE,
  DSD_DETAIL_CLONE_HIDE,
  DSD_DETAIL_CLONE_SHOW,
  DSD_DETAIL_CLONE_SUBMIT,
  DSD_DETAIL_CODELISTS_FOR_SELECTOR_HIDE,
  DSD_DETAIL_CODELISTS_FOR_SELECTOR_SET,
  DSD_DETAIL_CODELISTS_FOR_SELECTOR_SHOW,
  DSD_DETAIL_CODELISTS_READ,
  DSD_DETAIL_CONCEPT_SCHEME_FOR_SELECTOR_HIDE,
  DSD_DETAIL_CONCEPT_SCHEME_FOR_SELECTOR_READ,
  DSD_DETAIL_CONCEPT_SCHEME_FOR_SELECTOR_SET,
  DSD_DETAIL_CONCEPT_SCHEME_FOR_SELECTOR_SHOW,
  DSD_DETAIL_CONCEPT_SCHEMES_FOR_SELECTOR_HIDE,
  DSD_DETAIL_CONCEPT_SCHEMES_FOR_SELECTOR_SHOW,
  DSD_DETAIL_CONCEPT_SCHEMES_READ,
  DSD_DETAIL_CREATE,
  DSD_DETAIL_CREATE_SUBMIT,
  DSD_DETAIL_DIMENSION_CHANGE,
  DSD_DETAIL_DIMENSION_CREATE,
  DSD_DETAIL_DIMENSION_DELETE,
  DSD_DETAIL_DIMENSION_EDIT,
  DSD_DETAIL_DIMENSION_HIDE,
  DSD_DETAIL_DIMENSION_SUBMIT,
  DSD_DETAIL_DOWNLOAD_CHANGE,
  DSD_DETAIL_DOWNLOAD_HIDE,
  DSD_DETAIL_DOWNLOAD_SHOW,
  DSD_DETAIL_DOWNLOAD_SUBMIT,
  DSD_DETAIL_EDIT,
  DSD_DETAIL_EXPORT_CHANGE,
  DSD_DETAIL_EXPORT_HIDE,
  DSD_DETAIL_EXPORT_REPORT_HIDE,
  DSD_DETAIL_EXPORT_SHOW,
  DSD_DETAIL_EXPORT_SUBMIT,
  DSD_DETAIL_GROUP_CHANGE,
  DSD_DETAIL_GROUP_CREATE,
  DSD_DETAIL_GROUP_DELETE,
  DSD_DETAIL_GROUP_EDIT,
  DSD_DETAIL_GROUP_HIDE,
  DSD_DETAIL_GROUP_SUBMIT,
  DSD_DETAIL_HIDE,
  DSD_DETAIL_MEASURE_DIMENSION_CONCEPT_SCHEMES_FOR_SELECTOR_HIDE,
  DSD_DETAIL_MEASURE_DIMENSION_CONCEPT_SCHEMES_FOR_SELECTOR_SET,
  DSD_DETAIL_MEASURE_DIMENSION_CONCEPT_SCHEMES_FOR_SELECTOR_SHOW,
  DSD_DETAIL_PRIMARY_MEASURE_CHANGE,
  DSD_DETAIL_READ,
  DSD_DETAIL_SHOW,
  DSD_DETAIL_UPDATE_SUBMIT
} from "./actions";
import {REQUEST_ERROR, REQUEST_START, REQUEST_SUCCESS} from "../../middlewares/api/actions";
import _ from "lodash";
import {getNodes} from "../../utils/tree";
import {normalizeDsdComponentsOrder} from "../../utils/artefacts";
import {reuseInReducer, reuseReducer} from "../../utils/reduxReuse";
import codelistDetailModalReducer from "../redux-codelist-detail-modal/reducer";
import conceptSchemeDetailModalReducer from "../redux-concept-scheme-detail-modal/reducer";
import {getCurrentNodeConfig} from "../../middlewares/current-node-config/middleware";
import {getCurrentUserPermissions} from "../../middlewares/current-user-permissions/middleware";

export const DSD_DETAIL_CODELIST_DETAIL_PREFIX = "DSD_DETAIL_CODELIST_DETAIL_PREFIX_";
export const DSD_DETAIL_CONCEPT_SCHEME_DETAIL_PREFIX = "DSD_DETAIL_CONCEPT_SCHEME_DETAIL_PREFIX";

export const DSD_PRIMARY_MEASURE_ID = "OBS_VALUE";

const dsdDetailModalReducer = (
  state = {
    dsdTriplet: null,
    dsd: null,
    isVisible: false,
    isAgenciesValid: true,
    isEditDisabled: false,

    codelists: null,
    conceptSchemes: null,
    agencies: null,
    allAgencies: null,

    dimension: null,
    group: null,
    attribute: null,
    isCreatingComponent: false,

    isConceptSchemesForSelectorVisible: false,
    conceptSchemeForSelectorTriplet: null,
    conceptSchemeForSelector: null,

    isCodelistsForSelectorVisible: false,

    downloadDsdTriplets: null,
    downloadDsdLang: null,
    downloadDsdParams: null,

    cloneDestTriplet: null,

    isMeasureDimensionConceptSchemesForSelectorVisible: false,

    dsdExportSourceTriplet: null,
    dsdExportDestination: null,
    dsdExportReport: null
  },
  action
) => {
  switch (action.type) {
    case DSD_DETAIL_EDIT:
      return {
        ...state,
        isVisible: true,
        dsdTriplet: action.dsdTriplet,
        isEditDisabled: false,
        isAgenciesValid: false
      };
    case DSD_DETAIL_SHOW:
      return {
        ...state,
        isVisible: true,
        dsdTriplet: action.dsdTriplet,
        isEditDisabled: true,
        isAgenciesValid: false
      };
    case DSD_DETAIL_MEASURE_DIMENSION_CONCEPT_SCHEMES_FOR_SELECTOR_SHOW:
      return {
        ...state,
        isMeasureDimensionConceptSchemesForSelectorVisible: true
      };
    case DSD_DETAIL_MEASURE_DIMENSION_CONCEPT_SCHEMES_FOR_SELECTOR_HIDE:
      return {
        ...state,
        isMeasureDimensionConceptSchemesForSelectorVisible: false
      };
    case DSD_DETAIL_MEASURE_DIMENSION_CONCEPT_SCHEMES_FOR_SELECTOR_SET:
      return {
        ...state,
        isMeasureDimensionConceptSchemesForSelectorVisible: false,
        dimension: {
          ...state.dimension,
          representation: action.conceptSchemeUrn
        }
      };
    case DSD_DETAIL_CREATE:
      return {
        ...state,
        isVisible: true,
        dsd: {
          id: null,
          agencyID: null,
          version: null,
          isFinal: false,
          remoteIsFinal: false,
          uri: null,
          urn: null,
          validTo: null,
          validFrom: null,
          name: null,
          description: null,
          primaryMeasure: {
            id: DSD_PRIMARY_MEASURE_ID,
            concept: null,
            representation: null,
            annotations: null
          },
          dimensions: null,
          groups: null,
          attributes: null,
          annotations: null
        },
        isAgenciesValid: false
      };
    case DSD_DETAIL_DOWNLOAD_SHOW:
      return {
        ...state,
        downloadDsdTriplets: action.artefactTriplets,
        downloadDsdLang: action.lang,
        downloadDsdParams: {
          format: null,
          references: false,
          compression: false,
          csvSeparator: ";",
          csvDelimiter: null,
          csvLanguage: null
        },
      };
    case DSD_DETAIL_DOWNLOAD_HIDE:
      return {
        ...state,
        downloadDsdTriplets: null,
        downloadDsdLang: null,
        downloadDsdParams: null
      };
    case DSD_DETAIL_DOWNLOAD_CHANGE:
      const downloadDsdParams = _.cloneDeep(state.downloadDsdParams);
      return {
        ...state,
        downloadDsdParams: _.merge(downloadDsdParams, action.fields)
      };
    case DSD_DETAIL_CLONE_SHOW: {
      const srcVersionArr = action.srcTriplet.version.split(".");
      const destVersionArr = srcVersionArr.map((num, index) =>
        index === srcVersionArr.length - 1
          ? Number(num) + 1
          : num
      );

      return {
        ...state,
        cloneDestTriplet: {
          ...action.srcTriplet,
          version: destVersionArr.join(".")
        },
        dsdTriplet: state.dsdTriplet ? state.dsdTriplet : action.srcTriplet,
        isAgenciesValid: !!state.allAgencies
      };
    }
    case DSD_DETAIL_CLONE_HIDE: {
      return {
        ...state,
        cloneDestTriplet: null,
        dsd: state.isVisible ? state.dsd : null,
        dsdTriplet: state.isVisible ? state.dsdTriplet : null,
        agencies: state.isVisible ? state.agencies : null,
        allAgencies: state.isVisible ? state.allAgencies : null
      };
    }
    case DSD_DETAIL_CLONE_CHANGE:

      const cloneDestTriplet = _.cloneDeep(state.cloneDestTriplet);

      return {
        ...state,
        cloneDestTriplet: _.merge(cloneDestTriplet, action.fields)
      };
    case DSD_DETAIL_CHANGE: {

      const dsd = _.cloneDeep(state.dsd);

      const customizer = (_, src, key) => {
        if (key === "annotations")
          return src;
        else {
          return undefined
        }
      };

      return {
        ...state,
        dsd: _.mergeWith(dsd, action.fields, customizer)
      };
    }
    case DSD_DETAIL_HIDE:
      return {
        ...state,
        isVisible: false,
        dsdTriplet: null,
        dsd: null,
        agencies: null,
        allAgencies: null,
        codelists: null,
        conceptSchemes: null,
      };
    case DSD_DETAIL_DIMENSION_CREATE:
      return {
        ...state,
        isCreatingComponent: true,
        dimension: {
          type: DSD_DIMENSION_TYPE_NORMAL,
          id: null,
          order: null,
          concept: null,
          representation: null,
          annotations: null
        }
      };
    case DSD_DETAIL_DIMENSION_EDIT:
      return {
        ...state,
        dimension: state.dsd.dimensions.find(({id}) => id === action.id)
      };
    case DSD_DETAIL_DIMENSION_HIDE:
      return {
        ...state,
        isCreatingComponent: false,
        dimension: null
      };
    case DSD_DETAIL_DIMENSION_DELETE:
      return {
        ...state,
        dsd: {
          ...state.dsd,
          dimensions:
            normalizeDsdComponentsOrder([...state.dsd.dimensions.filter(({id}) => id !== action.id)])
        }
      };
    case DSD_DETAIL_ATTRIBUTE_DELETE:
      return {
        ...state,
        dsd: {
          ...state.dsd,
          attributes:
            normalizeDsdComponentsOrder([...state.dsd.attributes.filter(({id}) => id !== action.id)])
        }
      };
    case DSD_DETAIL_GROUP_DELETE:
      return {
        ...state,
        dsd: {
          ...state.dsd,
          groups: [...state.dsd.groups.filter(({id}) => id !== action.id)]
        }
      };
    case DSD_DETAIL_DIMENSION_SUBMIT:

      const dimensions = state.isCreatingComponent
        ? [...(state.dsd.dimensions || []), state.dimension]
        : state.dsd.dimensions.map(comp => comp.id === state.dimension.id ? state.dimension : comp);

      return {
        ...state,
        isCreatingComponent: false,
        dimension: null,
        dsd: {
          ...state.dsd,
          dimensions: normalizeDsdComponentsOrder(dimensions, state.dimension.id)
        }
      };
    case DSD_DETAIL_GROUP_CREATE:
      return {
        ...state,
        isCreatingComponent: true,
        group: {
          id: null,
          groupDimensions: null,
          annotations: null
        }
      };
    case DSD_DETAIL_GROUP_SUBMIT:
      return {
        ...state,
        isCreatingComponent: false,
        group: null,
        dsd: {
          ...state.dsd,
          groups: state.isCreatingComponent
            ? [...(state.dsd.groups || []), state.group]
            : state.dsd.groups.map(comp => comp.id === state.group.id ? state.group : comp)
        }
      };
    case DSD_DETAIL_GROUP_EDIT:
      return {
        ...state,
        group: state.dsd.groups.find(({id}) => id === action.id)
      };
    case DSD_DETAIL_GROUP_HIDE:
      return {
        ...state,
        isCreatingComponent: false,
        group: null
      };
    case DSD_DETAIL_ATTRIBUTE_CREATE:
      return {
        ...state,
        isCreatingComponent: true,
        attribute: {
          id: null,
          order: null,
          concept: null,
          representation: null,
          assignmentStatus: null,
          attachmentLevel: null,
          annotations: null
        }
      };
    case DSD_DETAIL_ATTRIBUTE_SUBMIT:

      const attributes = state.isCreatingComponent
        ? [...(state.dsd.attributes || []), state.attribute]
        : state.dsd.attributes.map(comp => comp.id === state.attribute.id ? state.attribute : comp);

      return {
        ...state,
        isCreatingComponent: false,
        attribute: null,
        dsd: {
          ...state.dsd,
          attributes: normalizeDsdComponentsOrder(attributes, state.attribute.id)
        }
      };
    case DSD_DETAIL_ATTRIBUTE_EDIT:
      return {
        ...state,
        attribute: state.dsd.attributes.find(({id}) => id === action.id)
      };
    case DSD_DETAIL_ATTRIBUTE_HIDE:
      return {
        ...state,
        isCreatingComponent: false,
        attribute: null
      };
    case DSD_DETAIL_DIMENSION_CHANGE: {

      const dimension = _.cloneDeep(state.dimension);

      const customizer = (_, src, key) => {
        if (key === "annotations")
          return src;
        else {
          return undefined
        }
      };

      _.mergeWith(dimension, action.fields, customizer);

      if (action.fields.type) {

        dimension.concept = null;
        dimension.codelist = null;
        dimension.conceptScheme = null;
        dimension.representation = null;

        if (
          state.dimension.type === DSD_DIMENSION_TYPE_FREQUENCY ||
          state.dimension.type === DSD_DIMENSION_TYPE_TIME
        ) {
          dimension.id = null;
        }
      }

      if (action.fields.type === DSD_DIMENSION_TYPE_FREQUENCY) {
        dimension.id = DSD_DIMENSION_ID_FREQUENCY;
      } else if (action.fields.type === DSD_DIMENSION_TYPE_TIME) {
        dimension.id = DSD_DIMENSION_ID_TIME;
      }

      return {
        ...state,
        dimension
      };
    }
    case DSD_DETAIL_PRIMARY_MEASURE_CHANGE: {

      const primaryMeasure = _.cloneDeep(state.dsd.primaryMeasure);

      const customizer = (_, src, key) => {
        if (key === "annotations")
          return src;
        else {
          return undefined
        }
      };
      _.mergeWith(primaryMeasure, action.fields, customizer);

      return {
        ...state,
        dsd: {
          ...state.dsd,
          primaryMeasure
        }
      };
    }
    case DSD_DETAIL_GROUP_CHANGE: {

      const group = _.cloneDeep(state.group);

      const customizer = (_, src, key) => {
        if (key === "annotations" || key === "groupDimensions")
          return src;
        else {
          return undefined
        }
      };
      _.mergeWith(group, action.fields, customizer);

      return {
        ...state,
        group
      };
    }
    case DSD_DETAIL_ATTRIBUTE_CHANGE: {

      const attribute = _.cloneDeep(state.attribute);

      const customizer = (_, src, key) => {
        if (key === "annotations" || key === "groupDimensions" || key === "attachedDimensions")
          return src;
        else {
          return undefined
        }
      };
      _.mergeWith(attribute, action.fields, customizer);

      if (action.fields.attachmentLevel) {
        attribute.attachedDimensions = null;
        attribute.attachmentGroup = null;
      }

      return {
        ...state,
        attribute
      };
    }
    case DSD_DETAIL_CODELISTS_FOR_SELECTOR_SHOW:
      return {
        ...state,
        isCodelistsForSelectorVisible: true
      };
    case DSD_DETAIL_CODELISTS_FOR_SELECTOR_HIDE:
      return {
        ...state,
        isCodelistsForSelectorVisible: false
      };
    case DSD_DETAIL_CODELISTS_FOR_SELECTOR_SET:

      if (state.dimension) {
        return {
          ...state,
          isCodelistsForSelectorVisible: false,
          dimension: {
            ...state.dimension,
            representation: action.codelistUrn
          }
        };
      } else if (state.attribute) {
        return {
          ...state,
          isCodelistsForSelectorVisible: false,
          attribute: {
            ...state.attribute,
            representation: action.codelistUrn
          }
        };
      } else {
        return {
          ...state,
          isCodelistsForSelectorVisible: false,
          dsd: {
            ...state.dsd,
            primaryMeasure: {
              ...state.dsd.primaryMeasure,
              representation: action.codelistUrn
            }
          }
        };
      }
    case DSD_DETAIL_CONCEPT_SCHEME_FOR_SELECTOR_SET:

      if (state.dimension) {
        return {
          ...state,
          conceptSchemeForSelectorTriplet: null,
          conceptSchemeForSelector: null,
          dimension: {
            ...state.dimension,
            concept: action.conceptUrn,
            id: state.dimension.id || getQuartupletFromItemString(getStringFromItemUrn(action.conceptUrn)).itemId
          }
        };
      } else if (state.attribute) {
        return {
          ...state,
          conceptSchemeForSelectorTriplet: null,
          conceptSchemeForSelector: null,
          attribute: {
            ...state.attribute,
            concept: action.conceptUrn,
            id: state.attribute.id || getQuartupletFromItemString(getStringFromItemUrn(action.conceptUrn)).itemId
          }
        };
      } else {
        return {
          ...state,
          conceptSchemeForSelectorTriplet: null,
          conceptSchemeForSelector: null,
          dsd: {
            ...state.dsd,
            primaryMeasure: {
              ...state.dsd.primaryMeasure,
              concept: action.conceptUrn
            }
          }
        };
      }
    case DSD_DETAIL_CONCEPT_SCHEMES_FOR_SELECTOR_SHOW:
      return {
        ...state,
        isConceptSchemesForSelectorVisible: true
      };
    case DSD_DETAIL_CONCEPT_SCHEMES_FOR_SELECTOR_HIDE:
      return {
        ...state,
        isConceptSchemesForSelectorVisible: false
      };
    case DSD_DETAIL_CONCEPT_SCHEME_FOR_SELECTOR_SHOW:
      return {
        ...state,
        isConceptSchemesForSelectorVisible: false,
        conceptSchemeForSelectorTriplet: action.conceptSchemeTriplet
      };
    case DSD_DETAIL_CONCEPT_SCHEME_FOR_SELECTOR_HIDE:
      return {
        ...state,
        isConceptSchemesForSelectorVisible: true,
        conceptSchemeForSelectorTriplet: null,
        conceptSchemeForSelector: null
      };
    case DSD_DETAIL_EXPORT_SHOW:
      return {
        ...state,
        dsdExportSourceTriplet: action.sourceTriplet,
        dsdExportDestination: {
          endpoint: null,
          username: null,
          password: null,
          id: action.sourceTriplet.id,
          agencyID: action.sourceTriplet.agencyID,
          version: action.sourceTriplet.version,
          withReferences: true
        },
        isAgenciesValid: !!state.allAgencies
      };
    case DSD_DETAIL_EXPORT_HIDE:
      return {
        ...state,
        dsdExportSourceTriplet: null,
        dsdExportDestination: null,
        agencies: state.isVisible ? state.agencies : null,
        allAgencies: state.isVisible ? state.allAgencies : null
      };
    case DSD_DETAIL_EXPORT_CHANGE:

      const dsdExportDestination = _.cloneDeep(state.dsdExportDestination);
      _.merge(dsdExportDestination, action.fields);

      return {
        ...state,
        dsdExportDestination
      };
    case DSD_DETAIL_EXPORT_REPORT_HIDE:
      return {
        ...state,
        dsdExportReport: null
      };
    case REQUEST_START:
      switch (action.label) {
        default:
          return state;
      }
    case REQUEST_SUCCESS:
      switch (action.label) {
        case DSD_DETAIL_READ: {

          const userPermissions = getCurrentUserPermissions(action);
          const customNoneIsAutoAnnotation = userPermissions && userPermissions.rules.includes("CanManageWorkingAnnotation")
            ? () => false
            : undefined;

          const dsd = getDsdFromSdmxJsonStructure(
            getSdmxStructuresFromSdmxJson(action.response)[0],
            getCurrentNodeConfig(action).annotations,
            customNoneIsAutoAnnotation
          );

          return {
            ...state,
            dsd: {
              ...dsd,
              remoteIsFinal: dsd.isFinal
            }
          };
        }
        case DSD_DETAIL_AGENCIES_READ:
          return {
            ...state,
            agencies: _.pickBy(action.response, (_, agencyID) => !action.allowedAgencies || action.allowedAgencies.includes(agencyID)),
            allAgencies: action.response,
            isAgenciesValid: true
          };
        case DSD_DETAIL_CONCEPT_SCHEME_FOR_SELECTOR_READ: {

          const conceptScheme = getArtefactFromSdmxJsonStructure(
            getSdmxStructuresFromSdmxJson(action.response)[0],
            getCurrentNodeConfig(action).annotations
          );

          conceptScheme.concepts = conceptScheme.concepts && getNodes(conceptScheme.concepts, "concepts", () => true);

          conceptScheme.concepts = conceptScheme.concepts && conceptScheme.concepts.map(concept => ({
            ...getItemFromSdmxJsonStructure(concept),
            order:
              (
                _.find(concept.autoAnnotations, annotation => annotation.type === action.itemOrderAnnotationType) &&
                _.find(concept.autoAnnotations, annotation => annotation.type === action.itemOrderAnnotationType).text
              ) || null
          }));

          return {
            ...state,
            conceptSchemeForSelector: conceptScheme
          };
        }
        case DSD_DETAIL_CREATE_SUBMIT:
          return {
            ...state,
            dsd: null,
            dsdTriplet: {
              id: state.dsd.id,
              agencyID: state.dsd.agencyID,
              version: state.dsd.version
            }
          };
        case DSD_DETAIL_UPDATE_SUBMIT:
          return {
            ...state,
            dsd: null,
          };
        case DSD_DETAIL_DOWNLOAD_SUBMIT:
          return {
            ...state,
            downloadDsdTriplets: null,
            downloadDsdLang: null,
            downloadDsdParams: null
          };
        case DSD_DETAIL_CLONE_SUBMIT:
          return {
            ...state,
            cloneDestTriplet: null,
            dsd: state.isVisible ? state.dsd : null,
            dsdTriplet: state.isVisible ? state.dsdTriplet : null,
            agencies: state.isVisible ? state.agencies : null,
            allAgencies: state.isVisible ? state.allAgencies : null
          };
        case DSD_DETAIL_CODELISTS_READ:
          return {
            ...state,
            codelists:
              (getSdmxStructuresFromSdmxJson(action.response) || [])
                .map(artefact => getArtefactFromSdmxJsonStructure(artefact, getCurrentNodeConfig(action).annotations))
          };
        case DSD_DETAIL_CONCEPT_SCHEMES_READ:
          return {
            ...state,
            conceptSchemes:
              (getSdmxStructuresFromSdmxJson(action.response) || [])
                .map(artefact => getArtefactFromSdmxJsonStructure(artefact, getCurrentNodeConfig(action).annotations))
          };
        case DSD_DETAIL_EXPORT_SUBMIT:
          return {
            ...state,
            dsdExportSourceTriplet: null,
            dsdExportDestination: null,
            dsdExportReport: action.response.itemsMessage,
            agencies: state.isVisible ? state.agencies : null,
            allAgencies: state.isVisible ? state.allAgencies : null
          };
        default:
          return state;
      }
    case REQUEST_ERROR:
      switch (action.label) {
        case DSD_DETAIL_READ:
          return {
            ...state,
            isVisible: false
          };
        default:
          return state;
      }
    default:
      return state;
  }
};

export default reuseInReducer(dsdDetailModalReducer, {
  codelistDetail: reuseReducer(codelistDetailModalReducer, DSD_DETAIL_CODELIST_DETAIL_PREFIX),
  conceptSchemeDetail: reuseReducer(conceptSchemeDetailModalReducer, DSD_DETAIL_CONCEPT_SCHEME_DETAIL_PREFIX)
});