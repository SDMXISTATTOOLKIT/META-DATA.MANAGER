import {REQUEST_ERROR, REQUEST_SUCCESS} from "../../../middlewares/api/actions";
import {
  MERGE_ITEM_SCHEMES_ARTEFACT_SET,
  MERGE_ITEM_SCHEMES_ARTEFACT_TYPE_CATEGORY_SCHEME,
  MERGE_ITEM_SCHEMES_ARTEFACT_TYPE_CHANGE,
  MERGE_ITEM_SCHEMES_ARTEFACT_TYPE_CODELIST,
  MERGE_ITEM_SCHEMES_ARTEFACT_TYPE_CONCEPT_SCHEME,
  MERGE_ITEM_SCHEMES_ARTEFACT_UNSET,
  MERGE_ITEM_SCHEMES_ARTEFACTS_HIDE,
  MERGE_ITEM_SCHEMES_ARTEFACTS_READ,
  MERGE_ITEM_SCHEMES_ARTEFACTS_SHOW,
  MERGE_ITEM_SCHEMES_CODELIST_MERGE_PREVIEW_LANG_CHANGE,
  MERGE_ITEM_SCHEMES_CODELIST_MERGE_PREVIEW_PARAMS_UPDATE,
  MERGE_ITEM_SCHEMES_CODELIST_PAGE_READ,
  MERGE_ITEM_SCHEMES_CSV_FILE_UPLOAD,
  MERGE_ITEM_SCHEMES_CSV_PAGE_READ,
  MERGE_ITEM_SCHEMES_CSV_PREVIEW_SHOW,
  MERGE_ITEM_SCHEMES_CSV_PROPS_CHANGE,
  MERGE_ITEM_SCHEMES_FILE_SET,
  MERGE_ITEM_SCHEMES_FORMAT_CHANGE,
  MERGE_ITEM_SCHEMES_FORMAT_TYPE_CSV,
  MERGE_ITEM_SCHEMES_FORMAT_TYPE_MSDB,
  MERGE_ITEM_SCHEMES_MERGE_CHANGE,
  MERGE_ITEM_SCHEMES_MERGE_HIDE,
  MERGE_ITEM_SCHEMES_MERGE_PREVIEW_HIDE,
  MERGE_ITEM_SCHEMES_MERGE_PREVIEW_READ,
  MERGE_ITEM_SCHEMES_MERGE_SHOW,
  MERGE_ITEM_SCHEMES_MERGE_SUBMIT,
  MERGE_ITEM_SCHEMES_PREVIEW_HIDE,
  MERGE_ITEM_SCHEMES_XML_PREVIEW_LANG_CHANGE,
  MERGE_ITEM_SCHEMES_XML_PREVIEW_PAGE_READ,
  MERGE_ITEM_SCHEMES_XML_PREVIEW_PARAMS_UPDATE,
  MERGE_ITEM_SCHEMES_XML_PREVIEW_READ,
  MERGE_ITEM_SCHEMES_XML_PREVIEW_SHOW
} from "./actions";
import {
  CATEGORY_SCHEME_ORDER_ANNOTATION_KEY,
  CODELIST_ORDER_ANNOTATION_KEY,
  getArtefactFromSdmxJsonStructure,
  getItemFromSdmxJsonStructure,
  getItemSchemeFromSdmxJsonFactory,
  getSdmxStructuresFromSdmxJson,
  SDMX_JSON_CODELIST_ITEMS_KEY,
  SDMX_JSON_CONCEPT_SCHEME_ITEMS_KEY
} from "../../../utils/sdmxJson";
import _ from "lodash";
import {reuseInReducer, reuseReducer} from "../../../utils/reduxReuse";
import codelistDetailModalReducer from "../../../redux-components/redux-codelist-detail-modal/reducer";
import conceptSchemeDetailModalReducer from "../../../redux-components/redux-concept-scheme-detail-modal/reducer";
import categorySchemeDetailModalReducer from "../../../redux-components/redux-category-scheme-detail-modal/reducer";
import {getCurrentNodeConfig} from "../../../middlewares/current-node-config/middleware";
import {getMappedTree, getNodes} from "../../../utils/tree";
import {getOrderedChildren} from "../../../utils/artefacts";

export const UTILITIES_MERGE_ITEM_SCHEMES_CODELIST_DETAIL_PREFIX = "UTILITIES_MERGE_ITEM_SCHEMES_CODELIST_DETAIL_PREFIX_";
export const UTILITIES_MERGE_ITEM_SCHEMES_CONCEPT_SCHEME_DETAIL_PREFIX = "UTILITIES_MERGE_ITEM_SCHEMES_CONCEPT_SCHEME_DETAIL_PREFIX_";
export const UTILITIES_MERGE_ITEM_SCHEMES_CATEGORY_SCHEME_DETAIL_PREFIX = "UTILITIES_MERGE_ITEM_SCHEMES_CATEGORY_SCHEME_DETAIL_PREFIX_";

const mergeItemSchemesReducer = (
  state = {
    artefactType: MERGE_ITEM_SCHEMES_ARTEFACT_TYPE_CODELIST,
    sourceFormat: MERGE_ITEM_SCHEMES_FORMAT_TYPE_MSDB,
    targetFormat: MERGE_ITEM_SCHEMES_FORMAT_TYPE_MSDB,
    source: null,
    target: null,
    isSource: null,
    isArtefactsVisible: false,
    artefacts: null,
    sourceCsvProps: null,
    targetCsvProps: null,
    mergedItems: null,
    mergedItemsFromServer: null,
    mergeCodelistTriplet: {
      id: "IdUseOnlyForMerge-aea11369-686d-4997-bff1-98853f3c4882",
      agencyID: "MERGE",
      version: "1.0",
    },
    mergeCodelistItemCount: null,
    mergeCodelistFetchParams: null,
    isMergeVisible: false,
    mergedItemScheme: null,
    agencies: null,
    isCsvPreviewVisible: false,
    isXmlPreviewVisible: false,
    isSourcePreview: null,
    previewItems: null,
    previewItemCount: null,
    previewCodelistTriplet: {
      id: "IdUseOnlyForPreview-aea11369-686d-4997-bff1-98853f3c4882",
      agencyID: "MERGE",
      version: "1.0",
    },
    previewItemParams: null,
    csvFilePath: null,
    allCsvRows: null,
    mergedWithConflict: false
  },
  action
) => {
  switch (action.type) {
    case MERGE_ITEM_SCHEMES_ARTEFACT_TYPE_CHANGE:
      return {
        ...state,
        artefactType: action.artefactType,
        sourceFormat: MERGE_ITEM_SCHEMES_FORMAT_TYPE_MSDB,
        targetFormat: MERGE_ITEM_SCHEMES_FORMAT_TYPE_MSDB,
        source: null,
        target: null
      };
    case MERGE_ITEM_SCHEMES_FORMAT_CHANGE:
      return {
        ...state,
        sourceFormat: action.isSource ? action.format : state.sourceFormat,
        targetFormat: !action.isSource ? action.format : state.targetFormat,
        source: action.isSource ? null : state.source,
        target: !action.isSource ? null : state.target,
        sourceCsvProps: action.isSource
          ? (state.sourceFormat !== MERGE_ITEM_SCHEMES_FORMAT_TYPE_CSV && action.format === MERGE_ITEM_SCHEMES_FORMAT_TYPE_CSV)
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
          ? (state.targetFormat !== MERGE_ITEM_SCHEMES_FORMAT_TYPE_CSV && action.format === MERGE_ITEM_SCHEMES_FORMAT_TYPE_CSV)
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
    case MERGE_ITEM_SCHEMES_CSV_PROPS_CHANGE:
      const sourceCsvProps = _.cloneDeep(state.sourceCsvProps);
      const targetCsvProps = _.cloneDeep(state.targetCsvProps);

      return {
        ...state,
        sourceCsvProps: action.isSource ? _.merge(sourceCsvProps, action.fields) : state.sourceCsvProps,
        targetCsvProps: !action.isSource ? _.merge(targetCsvProps, action.fields) : state.targetCsvProps,
      };
    case MERGE_ITEM_SCHEMES_FILE_SET:
      return {
        ...state,
        source: action.isSource ? action.file : state.source,
        target: !action.isSource ? action.file : state.target
      };
    case MERGE_ITEM_SCHEMES_ARTEFACTS_SHOW:
      return {
        ...state,
        isArtefactsVisible: true,
        isSource: action.isSource
      };
    case MERGE_ITEM_SCHEMES_ARTEFACTS_HIDE:
      return {
        ...state,
        isArtefactsVisible: false,
        artefacts: null,
        isSource: null
      };
    case MERGE_ITEM_SCHEMES_ARTEFACT_SET:
      return {
        ...state,
        isArtefactsVisible: false,
        artefacts: null,
        isSource: null,
        source: state.isSource ? action.artefactTriplet : state.source,
        target: !state.isSource ? action.artefactTriplet : state.target
      };
    case MERGE_ITEM_SCHEMES_ARTEFACT_UNSET:
      return {
        ...state,
        source: action.isSource ? null : state.source,
        target: !action.isSource ? null : state.target
      };
    case MERGE_ITEM_SCHEMES_MERGE_PREVIEW_HIDE:
      return {
        ...state,
        mergedItems: null,
        mergedItemsFromServer: null,
        mergeCodelistItemCount: null,
        mergeCodelistFetchParams: null,
        mergeConflict: false
      };
    case MERGE_ITEM_SCHEMES_CODELIST_MERGE_PREVIEW_PARAMS_UPDATE:
      return {
        ...state,
        mergeCodelistFetchParams: {
          ...action.params,
          timeStamp: (new Date()).getTime()
        }
      };
    case MERGE_ITEM_SCHEMES_CODELIST_MERGE_PREVIEW_LANG_CHANGE:
      return {
        ...state,
        mergeCodelistFetchParams: {
          ...state.mergeCodelistFetchParams,
          pageNum: 1,
          lang: action.lang
        },
        mergedItems: []
      };
    case MERGE_ITEM_SCHEMES_MERGE_HIDE:
      return {
        ...state,
        isMergeVisible: false,
        mergedItemScheme: null,
        agencies: null
      };
    case MERGE_ITEM_SCHEMES_MERGE_CHANGE:
      const mergedItemScheme = _.cloneDeep(state.mergedItemScheme);

      return {
        ...state,
        mergedItemScheme: _.merge(mergedItemScheme, action.fields)
      };
    case MERGE_ITEM_SCHEMES_CSV_PREVIEW_SHOW:
      return {
        ...state,
        isCsvPreviewVisible: true,
        isSourcePreview: action.isSource
      };
    case MERGE_ITEM_SCHEMES_XML_PREVIEW_SHOW:
      return {
        ...state,
        isXmlPreviewVisible: true,
        isSourcePreview: action.isSource
      };
    case MERGE_ITEM_SCHEMES_XML_PREVIEW_PARAMS_UPDATE:
      return {
        ...state,
        previewItemParams: {
          ...action.params,
          timeStamp: (new Date()).getTime()
        }
      };
    case MERGE_ITEM_SCHEMES_XML_PREVIEW_LANG_CHANGE:
      return {
        ...state,
        previewItemParams: {
          ...state.previewItemParams,
          pageNum: 1,
          lang: action.lang
        },
        previewItems: []
      };
    case MERGE_ITEM_SCHEMES_PREVIEW_HIDE:
      return {
        ...state,
        isCsvPreviewVisible: false,
        isXmlPreviewVisible: false,
        isSourcePreview: null,
        previewItems: null,
        previewItemCount: null,
        previewItemParams: null,
        csvFilePath: null,
        allCsvRows: null
      };
    case REQUEST_SUCCESS:
      switch (action.label) {
        case MERGE_ITEM_SCHEMES_ARTEFACTS_READ:
          return {
            ...state,
            artefacts: (getSdmxStructuresFromSdmxJson(action.response) || [])
              .map(artefact => getArtefactFromSdmxJsonStructure(artefact, getCurrentNodeConfig(action).annotations))
          };
        case MERGE_ITEM_SCHEMES_MERGE_PREVIEW_READ:
          let mergedItemScheme = null;
          let mergedItems = [];
          let mergedItemsFromServer = null;

          if (state.artefactType === MERGE_ITEM_SCHEMES_ARTEFACT_TYPE_CODELIST) {
            mergedItems = JSON.parse(action.response.jsonSdmx);

          } else if (state.artefactType === MERGE_ITEM_SCHEMES_ARTEFACT_TYPE_CATEGORY_SCHEME) {
            mergedItemScheme = getSdmxStructuresFromSdmxJson(JSON.parse(action.response.jsonSdmx))[0];
            const categoryScheme = getArtefactFromSdmxJsonStructure(
              mergedItemScheme,
              getCurrentNodeConfig(action).annotations
            );
            let itemsTree = categoryScheme.categories
              ? getMappedTree(
                categoryScheme.categories,
                "categories",
                node => getItemFromSdmxJsonStructure(node, getCurrentNodeConfig(action).annotations, CATEGORY_SCHEME_ORDER_ANNOTATION_KEY)
              )
              : [];
            itemsTree = getMappedTree(
              [{
                isRoot: true,
                categories: itemsTree
              }],
              "categories",
              node => {
                node.categories = getOrderedChildren(node.categories, node.id, action.lang, action.itemsOrderAnnotationType);
                return node
              }
            )[0].categories;
            mergedItems = getNodes(itemsTree, "categories", () => true);
            mergedItemsFromServer = mergedItemScheme.categories;

          } else if (state.artefactType === MERGE_ITEM_SCHEMES_ARTEFACT_TYPE_CONCEPT_SCHEME) {
            mergedItemScheme = getSdmxStructuresFromSdmxJson(JSON.parse(action.response.jsonSdmx))[0];
            const conceptScheme = getItemSchemeFromSdmxJsonFactory(
              SDMX_JSON_CONCEPT_SCHEME_ITEMS_KEY,
              getCurrentNodeConfig(action).annotations
            )(mergedItemScheme);
            mergedItems = conceptScheme.concepts;
            mergedItemsFromServer = mergedItemScheme.concepts;
          }

          return {
            ...state,
            mergedItemScheme: {
              ...mergedItemScheme,
              id: null,
              agencyID: null,
              version: null,
              name: null,
              codes: null,
              concepts: null,
              categories: null
            },
            mergedItems: mergedItems.map(item => ({
              ...item,
              mergeConflict: action.response.itemConflicts.includes(item.id)
            })),
            mergedItemsFromServer: mergedItemsFromServer,
            mergeConflict: action.response.haveConflicts
          };
        case MERGE_ITEM_SCHEMES_CODELIST_PAGE_READ: {
          const codelist = getItemSchemeFromSdmxJsonFactory(
            SDMX_JSON_CODELIST_ITEMS_KEY,
            getCurrentNodeConfig(action).annotations,
            CODELIST_ORDER_ANNOTATION_KEY
          )(getSdmxStructuresFromSdmxJson(JSON.parse(action.response.jsonSdmx))[0]);

          const isInvisibleItem = item => {
            return item.annotations && (
              item.annotations.find(annot =>
                annot.id === "INVISIBLE" &&
                annot.title === "INVISIBLE" &&
                annot.type === "INVISIBLE"
              ) !== undefined
            );
          };

          return {
            ...state,
            mergedItems: (codelist.codes || [])
              .filter(item => !isInvisibleItem(item))
              .map(item => ({
                ...item,
                mergeConflict: action.response.itemConflicts.includes(item.id)
              }))
            ,
            mergeCodelistItemCount: Number(action.header["x-total-count"]),
            mergeConflict: action.response.haveConflicts
          };
        }
        case MERGE_ITEM_SCHEMES_MERGE_SHOW:
          return {
            ...state,
            isMergeVisible: true,
            agencies: _.pickBy(action.response, (_, agencyID) => !action.allowedAgencies || action.allowedAgencies.includes(agencyID))
          };
        case MERGE_ITEM_SCHEMES_MERGE_SUBMIT:
          return {
            ...state,
            isMergeVisible: false,
            mergedItemScheme: null,
            mergedItems: null,
            mergedItemsFromServer: null,
            mergeCodelistItemCount: null,
            agencies: null,
            sourceFormat: MERGE_ITEM_SCHEMES_FORMAT_TYPE_MSDB,
            targetFormat: MERGE_ITEM_SCHEMES_FORMAT_TYPE_MSDB,
            source: null,
            target: null,
            sourceCsvProps: null,
            targetCsvProps: null
          };
        case MERGE_ITEM_SCHEMES_XML_PREVIEW_READ:
          let previewItems = null;
          let previewItemCount = null;

          if (state.artefactType === MERGE_ITEM_SCHEMES_ARTEFACT_TYPE_CODELIST) {
            previewItems = action.response;
            previewItemCount = Number(action.header["x-total-count"]);

          } else if (state.artefactType === MERGE_ITEM_SCHEMES_ARTEFACT_TYPE_CATEGORY_SCHEME) {
            const categoryScheme = getArtefactFromSdmxJsonStructure(
              getSdmxStructuresFromSdmxJson(action.response)[0],
              getCurrentNodeConfig(action).annotations
            );
            let itemsTree = categoryScheme.categories
              ? getMappedTree(
                categoryScheme.categories,
                "categories",
                node => getItemFromSdmxJsonStructure(node, getCurrentNodeConfig(action).annotations, CATEGORY_SCHEME_ORDER_ANNOTATION_KEY)
              )
              : [];
            itemsTree = getMappedTree(
              [{
                isRoot: true,
                categories: itemsTree
              }],
              "categories",
              node => {
                node.categories = getOrderedChildren(node.categories, node.id, action.lang, action.itemsOrderAnnotationType);
                return node
              }
            )[0].categories;
            previewItems = getNodes(itemsTree, "categories", () => true);

          } else if (state.artefactType === MERGE_ITEM_SCHEMES_ARTEFACT_TYPE_CONCEPT_SCHEME) {
            const conceptScheme = getItemSchemeFromSdmxJsonFactory(
              SDMX_JSON_CONCEPT_SCHEME_ITEMS_KEY,
              getCurrentNodeConfig(action).annotations
            )(getSdmxStructuresFromSdmxJson(action.response)[0]);
            previewItems = conceptScheme.concepts;
          }
          return {
            ...state,
            previewItems: previewItems,
            previewItemCount: previewItemCount
          };
        case MERGE_ITEM_SCHEMES_XML_PREVIEW_PAGE_READ: {
          const codelist = getItemSchemeFromSdmxJsonFactory(
            SDMX_JSON_CODELIST_ITEMS_KEY,
            getCurrentNodeConfig(action).annotations,
            CODELIST_ORDER_ANNOTATION_KEY
          )(getSdmxStructuresFromSdmxJson(action.response)[0]);

          const isInvisibleItem = item => {
            return item.annotations && (
              item.annotations.find(annot =>
                annot.id === "INVISIBLE" &&
                annot.title === "INVISIBLE" &&
                annot.type === "INVISIBLE"
              ) !== undefined
            );
          };

          return {
            ...state,
            previewItems: (codelist.codes || []).filter(item => !isInvisibleItem(item)),
            previewItemCount: Number(action.header["x-total-count"])
          };
        }
        case MERGE_ITEM_SCHEMES_CSV_FILE_UPLOAD:
          return {
            ...state,
            csvFilePath: action.response
          };
        case MERGE_ITEM_SCHEMES_CSV_PAGE_READ:
          return {
            ...state,
            allCsvRows: action.response
          };
        default:
          return state;
      }
    case REQUEST_ERROR:
      switch (action.label) {
        case MERGE_ITEM_SCHEMES_XML_PREVIEW_READ:
          return {
            ...state,
            isXmlPreviewVisible: false
          };
        case MERGE_ITEM_SCHEMES_CSV_FILE_UPLOAD:
          return {
            ...state,
            isCsvPreviewVisible: false
          };
        case MERGE_ITEM_SCHEMES_CSV_PAGE_READ:
          return {
            ...state,
            isCsvPreviewVisible: false,
            csvFilePath: null
          };
        default:
          return state;
      }
    default:
      return state;
  }
};

export default reuseInReducer(mergeItemSchemesReducer, {
  codelistDetail: reuseReducer(codelistDetailModalReducer, UTILITIES_MERGE_ITEM_SCHEMES_CODELIST_DETAIL_PREFIX),
  conceptSchemeDetail: reuseReducer(conceptSchemeDetailModalReducer, UTILITIES_MERGE_ITEM_SCHEMES_CONCEPT_SCHEME_DETAIL_PREFIX),
  categorySchemeDetail: reuseReducer(categorySchemeDetailModalReducer, UTILITIES_MERGE_ITEM_SCHEMES_CATEGORY_SCHEME_DETAIL_PREFIX)
});