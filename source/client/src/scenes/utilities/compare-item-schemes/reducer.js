import {REQUEST_SUCCESS} from "../../../middlewares/api/actions";
import {
  COMPARE_ITEM_SCHEMES_ARTEFACT_SET,
  COMPARE_ITEM_SCHEMES_ARTEFACT_TYPE_CHANGE,
  COMPARE_ITEM_SCHEMES_ARTEFACT_UNSET,
  COMPARE_ITEM_SCHEMES_ARTEFACTS_HIDE,
  COMPARE_ITEM_SCHEMES_ARTEFACTS_READ,
  COMPARE_ITEM_SCHEMES_ARTEFACTS_SHOW,
  COMPARE_ITEM_SCHEMES_COMPARE_HIDE,
  COMPARE_ITEM_SCHEMES_COMPARE_READ,
  COMPARE_ITEM_SCHEMES_CSV_PROPS_CHANGE,
  COMPARE_ITEM_SCHEMES_FILE_SET,
  COMPARE_ITEM_SCHEMES_FORMAT_CHANGE
} from "./actions";
import {getArtefactFromSdmxJsonStructure, getSdmxStructuresFromSdmxJson} from "../../../utils/sdmxJson";
import _ from "lodash";
import {reuseInReducer, reuseReducer} from "../../../utils/reduxReuse";
import codelistDetailModalReducer from "../../../redux-components/redux-codelist-detail-modal/reducer";
import conceptSchemeDetailModalReducer from "../../../redux-components/redux-concept-scheme-detail-modal/reducer";
import categorySchemeDetailModalReducer from "../../../redux-components/redux-category-scheme-detail-modal/reducer";
import {getCurrentNodeConfig} from "../../../middlewares/current-node-config/middleware";

export const UTILITIES_COMPARE_ITEM_SCHEMES_CODELIST_DETAIL_PREFIX = "UTILITIES_COMPARE_ITEM_SCHEMES_CODELIST_DETAIL_PREFIX_";
export const UTILITIES_COMPARE_ITEM_SCHEMES_CONCEPT_SCHEME_DETAIL_PREFIX = "UTILITIES_COMPARE_ITEM_SCHEMES_CONCEPT_SCHEME_DETAIL_PREFIX_";
export const UTILITIES_COMPARE_ITEM_SCHEMES_CATEGORY_SCHEME_DETAIL_PREFIX = "UTILITIES_COMPARE_ITEM_SCHEMES_CATEGORY_SCHEME_DETAIL_PREFIX_";

export const COMPARE_ITEM_SCHEMES_ARTEFACT_TYPE_CODELIST = "Codelist";
export const COMPARE_ITEM_SCHEMES_ARTEFACT_TYPE_CATEGORY_SCHEME = "CategoryScheme";
export const COMPARE_ITEM_SCHEMES_ARTEFACT_TYPE_CONCEPT_SCHEME = "ConceptScheme";

export const COMPARE_ITEM_SCHEMES_FORMAT_TYPE_MSDB = "msdb";
export const COMPARE_ITEM_SCHEMES_FORMAT_TYPE_CSV = "csv";
export const COMPARE_ITEM_SCHEMES_FORMAT_TYPE_SDMX = "sdmx";

const compareItemSchemesReducer = (
  state = {
    artefactType: COMPARE_ITEM_SCHEMES_ARTEFACT_TYPE_CODELIST,
    sourceFormat: COMPARE_ITEM_SCHEMES_FORMAT_TYPE_MSDB,
    targetFormat: COMPARE_ITEM_SCHEMES_FORMAT_TYPE_MSDB,
    source: null,
    target: null,
    isSource: null,
    isArtefactsVisible: false,
    artefacts: null,
    sourceCsvProps: null,
    targetCsvProps: null,
    report: null
  },
  action
) => {
  switch (action.type) {
    case COMPARE_ITEM_SCHEMES_ARTEFACT_TYPE_CHANGE:
      return {
        ...state,
        artefactType: action.artefactType,
        sourceFormat: COMPARE_ITEM_SCHEMES_FORMAT_TYPE_MSDB,
        targetFormat: COMPARE_ITEM_SCHEMES_FORMAT_TYPE_MSDB,
        source: null,
        target: null
      };
    case COMPARE_ITEM_SCHEMES_FORMAT_CHANGE:
      return {
        ...state,
        sourceFormat: action.isSource ? action.format : state.sourceFormat,
        targetFormat: !action.isSource ? action.format : state.targetFormat,
        source: action.isSource ? null : state.source,
        target: !action.isSource ? null : state.target,
        sourceCsvProps: action.isSource
          ? (state.sourceFormat !== COMPARE_ITEM_SCHEMES_FORMAT_TYPE_CSV && action.format === COMPARE_ITEM_SCHEMES_FORMAT_TYPE_CSV)
            ? {
              identity: {
                ID: 'tempID_1',
                Agency: 'tempAgency_1',
                Version: '1.0'
              },
              textSeparator: ';',
              textDelimiter: '',
              lang: action.lang,
              type: state.artefactType,
              firstRowHeader: true
            }
            : null
          : state.sourceCsvProps,
        targetCsvProps: !action.isSource
          ? (state.targetFormat !== COMPARE_ITEM_SCHEMES_FORMAT_TYPE_CSV && action.format === COMPARE_ITEM_SCHEMES_FORMAT_TYPE_CSV)
            ? {
              identity: {
                ID: 'tempID_2',
                Agency: 'tempAgency_2',
                Version: '1.0'
              },
              textSeparator: ';',
              textDelimiter: '',
              lang: action.lang,
              type: state.artefactType,
              firstRowHeader: true
            }
            : null
          : state.targetCsvProps
      };
    case COMPARE_ITEM_SCHEMES_CSV_PROPS_CHANGE:
      const sourceCsvProps = _.cloneDeep(state.sourceCsvProps);
      const targetCsvProps = _.cloneDeep(state.targetCsvProps);

      return {
        ...state,
        sourceCsvProps: action.isSource ? _.merge(sourceCsvProps, action.fields) : state.sourceCsvProps,
        targetCsvProps: !action.isSource ? _.merge(targetCsvProps, action.fields) : state.targetCsvProps,
      };
    case COMPARE_ITEM_SCHEMES_FILE_SET:
      return {
        ...state,
        source: action.isSource ? action.file : state.source,
        target: !action.isSource ? action.file : state.target
      };
    case COMPARE_ITEM_SCHEMES_ARTEFACTS_SHOW:
      return {
        ...state,
        isArtefactsVisible: true,
        isSource: action.isSource
      };
    case COMPARE_ITEM_SCHEMES_ARTEFACTS_HIDE:
      return {
        ...state,
        isArtefactsVisible: false,
        artefacts: null,
        isSource: null
      };
    case COMPARE_ITEM_SCHEMES_ARTEFACT_SET:
      return {
        ...state,
        isArtefactsVisible: false,
        artefacts: null,
        isSource: null,
        source: state.isSource ? action.artefactTriplet : state.source,
        target: !state.isSource ? action.artefactTriplet : state.target
      };
    case COMPARE_ITEM_SCHEMES_ARTEFACT_UNSET:
      return {
        ...state,
        source: action.isSource ? null : state.source,
        target: !action.isSource ? null : state.target
      };
    case COMPARE_ITEM_SCHEMES_COMPARE_HIDE:
      return {
        ...state,
        report: null
      };
    case REQUEST_SUCCESS:
      switch (action.label) {
        case COMPARE_ITEM_SCHEMES_ARTEFACTS_READ:
          return {
            ...state,
            artefacts: (getSdmxStructuresFromSdmxJson(action.response) || [])
              .map(artefact => getArtefactFromSdmxJsonStructure(artefact, getCurrentNodeConfig(action).annotations))
          };
        case COMPARE_ITEM_SCHEMES_COMPARE_READ:
          return {
            ...state,
            report: action.response
          };
        default:
          return state;
      }
    default:
      return state;
  }
};

export default reuseInReducer(compareItemSchemesReducer, {
  codelistDetail: reuseReducer(codelistDetailModalReducer, UTILITIES_COMPARE_ITEM_SCHEMES_CODELIST_DETAIL_PREFIX),
  conceptSchemeDetail: reuseReducer(conceptSchemeDetailModalReducer, UTILITIES_COMPARE_ITEM_SCHEMES_CONCEPT_SCHEME_DETAIL_PREFIX),
  categorySchemeDetail: reuseReducer(categorySchemeDetailModalReducer, UTILITIES_COMPARE_ITEM_SCHEMES_CATEGORY_SCHEME_DETAIL_PREFIX)
});