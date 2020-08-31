import {REQUEST_ERROR, REQUEST_START, REQUEST_SUCCESS} from "../../middlewares/api/actions";
import {
  CONTENT_CONSTRAINT_DETAIL_AGENCIES_READ,
  CONTENT_CONSTRAINT_DETAIL_ARTEFACT_READ,
  CONTENT_CONSTRAINT_DETAIL_ARTEFACT_SET,
  CONTENT_CONSTRAINT_DETAIL_ARTEFACT_TYPE_SELECT,
  CONTENT_CONSTRAINT_DETAIL_ARTEFACT_UNSET,
  CONTENT_CONSTRAINT_DETAIL_ARTEFACTS_HIDE,
  CONTENT_CONSTRAINT_DETAIL_ARTEFACTS_READ,
  CONTENT_CONSTRAINT_DETAIL_ARTEFACTS_SHOW,
  CONTENT_CONSTRAINT_DETAIL_CHANGE,
  CONTENT_CONSTRAINT_DETAIL_CLONE_CHANGE,
  CONTENT_CONSTRAINT_DETAIL_CLONE_HIDE,
  CONTENT_CONSTRAINT_DETAIL_CLONE_SHOW,
  CONTENT_CONSTRAINT_DETAIL_CLONE_SUBMIT,
  CONTENT_CONSTRAINT_DETAIL_CREATE,
  CONTENT_CONSTRAINT_DETAIL_CREATE_SUBMIT,
  CONTENT_CONSTRAINT_DETAIL_DOWNLOAD_CHANGE,
  CONTENT_CONSTRAINT_DETAIL_DOWNLOAD_HIDE,
  CONTENT_CONSTRAINT_DETAIL_DOWNLOAD_SHOW,
  CONTENT_CONSTRAINT_DETAIL_DOWNLOAD_SUBMIT,
  CONTENT_CONSTRAINT_DETAIL_EDIT,
  CONTENT_CONSTRAINT_DETAIL_EXPORT_CHANGE,
  CONTENT_CONSTRAINT_DETAIL_EXPORT_HIDE,
  CONTENT_CONSTRAINT_DETAIL_EXPORT_REPORT_HIDE,
  CONTENT_CONSTRAINT_DETAIL_EXPORT_SHOW,
  CONTENT_CONSTRAINT_DETAIL_EXPORT_SUBMIT,
  CONTENT_CONSTRAINT_DETAIL_FILTER_COLUMN_CODELIST_COUNT_READ,
  CONTENT_CONSTRAINT_DETAIL_FILTER_COLUMN_CODELIST_TREE_READ,
  CONTENT_CONSTRAINT_DETAIL_FILTER_COLUMN_FILTERED_VALUES_READ,
  CONTENT_CONSTRAINT_DETAIL_FILTER_COLUMN_MODE_CHANGE,
  CONTENT_CONSTRAINT_DETAIL_FILTER_COLUMN_VALUES_CHANGE,
  CONTENT_CONSTRAINT_DETAIL_FILTER_CUBE_READ,
  CONTENT_CONSTRAINT_DETAIL_FILTER_DSD_READ,
  CONTENT_CONSTRAINT_DETAIL_FILTER_MODAL_HIDE,
  CONTENT_CONSTRAINT_DETAIL_FILTER_MODAL_SHOW,
  CONTENT_CONSTRAINT_DETAIL_FILTER_QUERY_HIDE,
  CONTENT_CONSTRAINT_DETAIL_FILTER_QUERY_SHOW,
  CONTENT_CONSTRAINT_DETAIL_FILTER_RESET,
  CONTENT_CONSTRAINT_DETAIL_HIDE,
  CONTENT_CONSTRAINT_DETAIL_READ,
  CONTENT_CONSTRAINT_DETAIL_RELEASE_CALENDAR_CHANGE,
  CONTENT_CONSTRAINT_DETAIL_SHOW,
  CONTENT_CONSTRAINT_DETAIL_UPDATE_SUBMIT
} from "./actions";
import {
  CODELIST_ORDER_ANNOTATION_KEY,
  DSD_DIMENSION_TYPE_TIME,
  FILTER_MODE_IN,
  getArtefactFromSdmxJsonStructure,
  getArtefactTripletFromUrn,
  getContentConstraintFromSdmxJsonStructure,
  getDsdFromSdmxJsonStructure,
  getItemSchemeFromSdmxJsonFactory,
  getSdmxStructuresFromSdmxJson,
  getStringFromArtefactTriplet,
  SDMX_JSON_CODELIST_ITEMS_KEY
} from "../../utils/sdmxJson";
import _ from 'lodash';
import {CONTENT_CONSTRAINTS_ARTEFACT_TYPE_DATAFLOW, CONTENT_CONSTRAINTS_ARTEFACT_TYPE_DSD} from "./FilterTab";
import {getFilteredTreeWithPaths, getMaxTreeDepth, getNodes, getTreeFromArray} from "../../utils/tree";
import {getCurrentNodeConfig} from "../../middlewares/current-node-config/middleware";
import {AUTO_ANNOTATION_DDBDATAFLOW_KEY} from "../../utils/annotations";
import {getNormalizedColumnName} from "../../utils/normalizers";

const contentConstraintDetailModalReducer = (
  state = {
    contentConstraintTriplet: null,
    forceIsFinalDisabled: false,
    isVisible: false,
    isEditDisabled: false,
    isContentConstraintValid: true,
    isAgenciesValid: true,
    isContentConstraintGeneralTabDirty: false,
    contentConstraint: null,
    agencies: null,
    downloadContentConstraintTriplet: null,
    downloadContentConstraintLang: null,
    downloadContentConstraintParams: null,
    cloneDestTriplet: null,
    contentConstraintAnnotations: null,
    contentConstraintExportSourceTriplet: null,
    contentConstraintExportDestination: null,
    contentConstraintExportReport: null,
    artefactType: null,
    isArtefactsVisible: false,
    artefacts: null,
    artefactTriplet: null,
    artefact: null,
    filterDsdTriplet: null,
    filterCubeId: null,
    filterColumns: null,
    filter: {},
    isFilterModalVisible: false,
    isFilterQueryVisible: false,
    releaseCalendar: {
      periodicity: {
        value: null,
        measureUnit: null
      },
      offset: {
        value: null,
        measureUnit: null
      },
      tolerance: {
        value: null,
        measureUnit: null
      }
    },
    timePeriod: null
  },
  action
) => {
  switch (action.type) {
    case CONTENT_CONSTRAINT_DETAIL_CREATE:
      return {
        ...state,
        contentConstraint: {
          id: null,
          agencyID: null,
          version: null,
          isFinal: false,
          uri: null,
          urn: null,
          validTo: null,
          validFrom: null,
          name: null,
          description: null,
          structure: null
        },
        isVisible: true,
        isEditDisabled: false,
        isAgenciesValid: false
      };
    case CONTENT_CONSTRAINT_DETAIL_EDIT:
      return {
        ...state,
        isVisible: true,
        contentConstraintTriplet: action.contentConstraintTriplet,
        isContentConstraintValid: false,
        isAgenciesValid: false,
        isContentConstraintGeneralTabDirty: false,
        isEditDisabled: false
      };
    case CONTENT_CONSTRAINT_DETAIL_SHOW:
      return {
        ...state,
        forceIsFinalDisabled: false,
        isVisible: true,
        contentConstraintTriplet: action.contentConstraintTriplet,
        isContentConstraintValid: false,
        isAgenciesValid: false,
        isContentConstraintGeneralTabDirty: false,
        isEditDisabled: true
      };
    case CONTENT_CONSTRAINT_DETAIL_HIDE:
      return {
        ...state,
        forceIsFinalDisabled: false,
        isVisible: false,
        contentConstraintTriplet: null,
        contentConstraint: null,
        agencies: null,
        allAgencies: null,
        artefactType: null,
        isArtefactsVisible: false,
        artefacts: null,
        artefactTriplet: null,
        artefact: null,
        filterDsdTriplet: null,
        filterCubeId: null,
        filterColumns: null,
        filter: {},
        releaseCalendar: {
          periodicity: {
            value: null,
            measureUnit: null
          },
          offset: {
            value: null,
            measureUnit: null
          },
          tolerance: {
            value: null,
            measureUnit: null
          }
        },
        isEditDisabled: true,
        timePeriod: null
      };
    case CONTENT_CONSTRAINT_DETAIL_CHANGE: {
      const contentConstraint = _.cloneDeep(state.contentConstraint);
      const customizer = (_, src, key) => {
        if (key === "annotations")
          return src;
        else {
          return undefined
        }
      };

      return {
        ...state,
        contentConstraint: _.mergeWith(contentConstraint, action.fields, customizer),
        isContentConstraintGeneralTabDirty: true
      };
    }
    case CONTENT_CONSTRAINT_DETAIL_DOWNLOAD_SHOW:
      return {
        ...state,
        downloadContentConstraintTriplet: action.artefactTriplet,
        downloadContentConstraintLang: action.lang,
        downloadContentConstraintParams: {
          format: null,
          references: false,
          compression: false,
          csvSeparator: ";",
          csvDelimiter: null,
          csvLanguage: null
        },
      };
    case CONTENT_CONSTRAINT_DETAIL_DOWNLOAD_HIDE:
      return {
        ...state,
        downloadContentConstraintTriplet: null,
        downloadContentConstraintLang: null,
        downloadContentConstraintParams: null
      };
    case CONTENT_CONSTRAINT_DETAIL_DOWNLOAD_CHANGE:
      const downloadContentConstraintParams = _.cloneDeep(state.downloadContentConstraintParams);
      return {
        ...state,
        downloadContentConstraintParams: _.merge(downloadContentConstraintParams, action.fields)
      };
    case CONTENT_CONSTRAINT_DETAIL_CLONE_SHOW:

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
        contentConstraintTriplet: state.contentConstraintTriplet ? state.contentConstraintTriplet : action.srcTriplet,
        isContentConstraintValid: !!state.contentConstraint,
        isAgenciesValid: !!state.allAgencies
      };
    case CONTENT_CONSTRAINT_DETAIL_CLONE_HIDE:
      return {
        ...state,
        cloneDestTriplet: null,
        contentConstraint: state.isVisible ? state.contentConstraint : null,
        contentConstraintTriplet: state.isVisible ? state.contentConstraintTriplet : null,
        artefactType: state.isVisible ? state.artefactType : null,
        artefactTriplet: state.isVisible ? state.artefactTriplet : null,
        filter: state.isVisible ? state.filter : null,
        timePeriod: state.isVisible ? state.timePeriod : null,
        agencies: state.isVisible ? state.agencies : null,
        allAgencies: state.isVisible ? state.allAgencies : null
      };
    case CONTENT_CONSTRAINT_DETAIL_CLONE_CHANGE:

      const cloneDestTriplet = _.cloneDeep(state.cloneDestTriplet);

      return {
        ...state,
        cloneDestTriplet: _.merge(cloneDestTriplet, action.fields)
      };
    case CONTENT_CONSTRAINT_DETAIL_EXPORT_SHOW:
      return {
        ...state,
        contentConstraintExportSourceTriplet: action.sourceTriplet,
        contentConstraintExportDestination: {
          endpoint: null,
          username: null,
          password: null,
          id: action.sourceTriplet.id,
          agencyID: action.sourceTriplet.agencyID,
          version: action.sourceTriplet.version
        },
        contentConstraintTriplet: state.contentConstraintTriplet ? state.contentConstraintTriplet : action.sourceTriplet,
        isContentConstraintValid: !!state.contentConstraint,
        isAgenciesValid: !!state.allAgencies
      };
    case CONTENT_CONSTRAINT_DETAIL_EXPORT_HIDE:
      return {
        ...state,
        contentConstraintExportSourceTriplet: null,
        contentConstraintExportDestination: null,
        contentConstraint: state.isVisible ? state.contentConstraint : null,
        contentConstraintTriplet: state.isVisible ? state.contentConstraintTriplet : null,
        artefactType: state.isVisible ? state.artefactType : null,
        artefactTriplet: state.isVisible ? state.artefactTriplet : null,
        filter: state.isVisible ? state.filter : null,
        timePeriod: state.isVisible ? state.timePeriod : null,
        agencies: state.isVisible ? state.agencies : null,
        allAgencies: state.isVisible ? state.allAgencies : null
      };
    case CONTENT_CONSTRAINT_DETAIL_EXPORT_CHANGE:

      const contentConstraintExportDestination = _.cloneDeep(state.contentConstraintExportDestination);
      _.merge(contentConstraintExportDestination, action.fields);

      return {
        ...state,
        contentConstraintExportDestination
      };
    case CONTENT_CONSTRAINT_DETAIL_ARTEFACT_TYPE_SELECT:
      return {
        ...state,
        artefactType: action.artefactType,
        artefactTriplet: action.artefactType !== state.artefactType ? null : state.artefactTriplet,
        artefact: action.artefactType !== state.artefactType ? null : state.artefact,
        filterDsdTriplet: action.artefactType !== state.artefactType ? null : state.filterDsdTriplet,
        filterCubeId: action.artefactType !== state.artefactType ? null : state.filterCubeId,
        filterColumns: action.artefactType !== state.artefactType ? null : state.filterColumns,
        filter: action.artefactType !== state.artefactType ? {} : state.filter,
        timePeriod: action.artefactType !== state.artefactType ? null : state.timePeriod
      };
    case CONTENT_CONSTRAINT_DETAIL_ARTEFACTS_SHOW:
      return {
        ...state,
        isArtefactsVisible: true
      };
    case CONTENT_CONSTRAINT_DETAIL_ARTEFACTS_HIDE:
      return {
        ...state,
        isArtefactsVisible: false,
        artefacts: null
      };
    case CONTENT_CONSTRAINT_DETAIL_ARTEFACT_SET:
      return {
        ...state,
        isArtefactsVisible: false,
        artefactTriplet: getStringFromArtefactTriplet(action.artefactTriplet),
        artefacts: null
      };
    case CONTENT_CONSTRAINT_DETAIL_ARTEFACT_UNSET:
      return {
        ...state,
        artefactTriplet: null,
        artefact: null,
        filterDsdTriplet: null,
        filterCubeId: null,
        filterColumns: null,
        filter: {},
        timePeriod: null
      };
    case CONTENT_CONSTRAINT_DETAIL_RELEASE_CALENDAR_CHANGE:
      const releaseCalendar = _.cloneDeep(state.releaseCalendar);

      return {
        ...state,
        releaseCalendar: _.merge(releaseCalendar, action.fields)
      };
    case CONTENT_CONSTRAINT_DETAIL_FILTER_COLUMN_MODE_CHANGE: {

      const filter = _.cloneDeep(state.filter);

      const columnName = getNormalizedColumnName(action.colName);
      filter[columnName] = {
        mode: action.mode,
        values: filter[columnName] && filter[columnName].values
          ? filter[columnName].values
          : []
      };

      const colNames = state.filterColumns.map(({name}) => name);

      const colIndex = colNames.indexOf(action.colName);

      const subsequentColNames = colNames.splice(colIndex + 1);

      // delete filters for subsequent cols
      subsequentColNames.forEach(name => {
        delete filter[getNormalizedColumnName(name)];
      });

      return {
        ...state,
        filterColumns: // delete filteredCodelistTree for subsequent cols
          state.filterColumns.map(col =>
            subsequentColNames.includes(col.name)
              ? ({
                ...col,
                filteredCodelistTree: state.filterCubeId ? null : col.filteredCodelistTree
              })
              : col
          ),
        filter
      };
    }
    case CONTENT_CONSTRAINT_DETAIL_FILTER_COLUMN_VALUES_CHANGE: {

      const filter = _.cloneDeep(state.filter);

      const columnName = getNormalizedColumnName(action.colName);
      filter[columnName] = {
        mode: filter[columnName] && filter[columnName].mode
          ? filter[columnName].mode
          : FILTER_MODE_IN,
        values: action.values
      };

      const colNames = state.filterColumns.map(({name}) => name);

      const colIndex = colNames.indexOf(action.colName);

      const subsequentColNames = colNames.splice(colIndex + 1);

      // delete filters for subsequent cols
      subsequentColNames.forEach(name => {
        delete filter[getNormalizedColumnName(name)];
      });

      return {
        ...state,
        filter,
        filterColumns: // delete filteredCodelistTree for subsequent cols
          state.filterColumns.map(col => {
            if (subsequentColNames.includes(col.name)) {
              return ({
                ...col,
                filteredCodelistTree: state.filterCubeId ? null : col.filteredCodelistTree
              });
            } else {
              return col;
            }
          })
      };
    }
    case CONTENT_CONSTRAINT_DETAIL_FILTER_MODAL_SHOW:
      return {
        ...state,
        isFilterModalVisible: true
      };
    case CONTENT_CONSTRAINT_DETAIL_FILTER_MODAL_HIDE:
      return {
        ...state,
        isFilterModalVisible: false
      };
    case CONTENT_CONSTRAINT_DETAIL_FILTER_QUERY_SHOW:
      return {
        ...state,
        isFilterQueryVisible: true
      };
    case CONTENT_CONSTRAINT_DETAIL_FILTER_QUERY_HIDE:
      return {
        ...state,
        isFilterQueryVisible: false
      };
    case CONTENT_CONSTRAINT_DETAIL_FILTER_RESET:
      return {
        ...state,
        filter: {},
        timePeriod: null
      };
    case CONTENT_CONSTRAINT_DETAIL_EXPORT_REPORT_HIDE:
      return {
        ...state,
        contentConstraintExportReport: null
      };
    case REQUEST_START:
      switch (action.label) {
        case CONTENT_CONSTRAINT_DETAIL_UPDATE_SUBMIT:
          return {
            ...state,
            isContentConstraintGeneralTabDirty: false,
            agencies: null,
            allAgencies: null
          };
        default:
          return state;
      }
    case REQUEST_SUCCESS:
      switch (action.label) {
        case CONTENT_CONSTRAINT_DETAIL_READ:

          const {
            contentConstraint,
            attachmentType,
            attachmentUrn,
            filter,
            timePeriod
          } = getContentConstraintFromSdmxJsonStructure(
            getSdmxStructuresFromSdmxJson(action.response)[0],
            getCurrentNodeConfig(action).annotations
          );

          return {
            ...state,
            contentConstraint,
            artefactType:
              attachmentType.toLowerCase() === "datastructure"
                ? CONTENT_CONSTRAINTS_ARTEFACT_TYPE_DSD
                : CONTENT_CONSTRAINTS_ARTEFACT_TYPE_DATAFLOW,
            artefactTriplet: getStringFromArtefactTriplet(getArtefactTripletFromUrn(attachmentUrn)),
            isContentConstraintValid: true,
            filter: filter,
            timePeriod: timePeriod
          };
        case CONTENT_CONSTRAINT_DETAIL_AGENCIES_READ:
          return {
            ...state,
            agencies: _.pickBy(action.response, (_, agencyID) => !action.allowedAgencies || action.allowedAgencies.includes(agencyID)),
            allAgencies: action.response,
            isAgenciesValid: true
          };
        case CONTENT_CONSTRAINT_DETAIL_CREATE_SUBMIT:
          return {
            ...state,
            forceIsFinalDisabled: state.contentConstraint.isFinal,
          };
        case CONTENT_CONSTRAINT_DETAIL_UPDATE_SUBMIT:
          return {
            ...state,
            forceIsFinalDisabled: state.contentConstraint.isFinal,
          };
        case CONTENT_CONSTRAINT_DETAIL_DOWNLOAD_SUBMIT:
          return {
            ...state,
            downloadContentConstraintTriplet: null,
            downloadContentConstraintLang: null,
            downloadContentConstraintParams: null
          };
        case CONTENT_CONSTRAINT_DETAIL_CLONE_SUBMIT:
          return {
            ...state,
            cloneDestTriplet: null,
            contentConstraint: state.isVisible ? state.contentConstraint : null,
            contentConstraintTriplet: state.isVisible ? state.contentConstraintTriplet : null,
            artefactType: null,
            artefactTriplet: null,
            filter: null,
            timePeriod: null,
            agencies: state.isVisible ? state.agencies : null,
            allAgencies: state.isVisible ? state.allAgencies : null
          };
        case CONTENT_CONSTRAINT_DETAIL_EXPORT_SUBMIT:
          return {
            ...state,
            contentConstraintExportSourceTriplet: null,
            contentConstraintExportSourceAttachmentType: null,
            contentConstraintExportSourceAttachmentUrn: null,
            contentConstraintExportSourceFilter: null,
            contentConstraintExportDestination: null,
            contentConstraintExportReport: action.response.itemsMessage,
            contentConstraint: state.isVisible ? state.contentConstraint : null,
            contentConstraintTriplet: state.isVisible ? state.contentConstraintTriplet : null,
            artefactType: state.isVisible ? state.artefactType : null,
            artefactTriplet: state.isVisible ? state.artefactTriplet : null,
            filter: state.isVisible ? state.filter : null,
            timePeriod: state.isVisible ? state.timePeriod : null,
            agencies: state.isVisible ? state.agencies : null,
            allAgencies: state.isVisible ? state.allAgencies : null
          };
        case CONTENT_CONSTRAINT_DETAIL_ARTEFACTS_READ:
          return {
            ...state,
            artefacts: (getSdmxStructuresFromSdmxJson(action.response) || [])
              .map(artefact => getArtefactFromSdmxJsonStructure(artefact, getCurrentNodeConfig(action).annotations))
          };
        case CONTENT_CONSTRAINT_DETAIL_ARTEFACT_READ:

          const artefact = action.artefactType === CONTENT_CONSTRAINTS_ARTEFACT_TYPE_DSD
            ? getDsdFromSdmxJsonStructure(
              getSdmxStructuresFromSdmxJson(action.response[0])[0],
              getCurrentNodeConfig(action).annotations
            )
            : getArtefactFromSdmxJsonStructure(
              getSdmxStructuresFromSdmxJson(action.response[0])[0],
              getCurrentNodeConfig(action).annotations
            );

          const isDDBDataflow =
            action.artefactType === CONTENT_CONSTRAINTS_ARTEFACT_TYPE_DATAFLOW &&
            (artefact.autoAnnotations || []).find(({type}) =>
              type.toLowerCase() === getCurrentNodeConfig(action).annotations[AUTO_ANNOTATION_DDBDATAFLOW_KEY].toLowerCase()) &&
            action.haveDMWS &&
            action.isUserLogged &&
            action.response[1].find(ddbDf =>
              getStringFromArtefactTriplet({
                agencyID: ddbDf.Agency,
                version: ddbDf.Version,
                id: ddbDf.ID
              }) === getStringFromArtefactTriplet(artefact)
            ) !== undefined;

          return {
            ...state,
            artefact,
            filterColumns:
              action.artefactType === CONTENT_CONSTRAINTS_ARTEFACT_TYPE_DSD
                ? (artefact.dimensions || []).concat(artefact.attributes || [])
                  .filter(comp => comp.representation !== null)
                  .map(comp => ({
                    name: comp.id,
                    CodelistCode: getStringFromArtefactTriplet(getArtefactTripletFromUrn(comp.representation)),
                    codelistCount: null,
                    codelistTree: null,
                    filteredCodelistTree: null,
                    filteredCodelistTreeMaxDepth: null,
                    filteredValues: null
                  }))
                : null,
            filterDsdTriplet:
              action.artefactType === CONTENT_CONSTRAINTS_ARTEFACT_TYPE_DATAFLOW && !isDDBDataflow
                ? getArtefactTripletFromUrn(artefact.structure)
                : null,
            filterCubeId:
              action.artefactType === CONTENT_CONSTRAINTS_ARTEFACT_TYPE_DATAFLOW && action.haveDMWS && isDDBDataflow
                ? (
                  action.response[1].find(ddbDf =>
                    getStringFromArtefactTriplet({
                      agencyID: ddbDf.Agency,
                      version: ddbDf.Version,
                      id: ddbDf.ID
                    }) === getStringFromArtefactTriplet(artefact)
                  ).IDCube
                )
                : null
          };
        case CONTENT_CONSTRAINT_DETAIL_FILTER_DSD_READ:
          const dsd = getDsdFromSdmxJsonStructure(
            getSdmxStructuresFromSdmxJson(action.response)[0],
            getCurrentNodeConfig(action).annotations
          );
          return {
            ...state,
            filterColumns:
              dsd.dimensions.concat(dsd.attributes || [])
                .filter(comp => comp.type !== DSD_DIMENSION_TYPE_TIME)
                .map(comp => ({
                  name: comp.id,
                  CodelistCode: comp.representation
                    ? getStringFromArtefactTriplet(getArtefactTripletFromUrn(comp.representation))
                    : null,
                  codelistCount: null,
                  codelistTree: null,
                  filteredCodelistTree: null,
                  filteredCodelistTreeMaxDepth: null,
                  filteredValues: null
                }))
          };
        case CONTENT_CONSTRAINT_DETAIL_FILTER_CUBE_READ:
          return {
            ...state,
            filterColumns:
              action.response.Dimensions.concat(action.response.Attributes)
                .filter(comp => !comp.IsTimeSeriesDim)
                .map(comp => ({
                  name: comp.ColName,
                  CodelistCode: comp.CodelistCode,
                  codelistCount: null,
                  codelistTree: null,
                  filteredCodelistTree: null,
                  filteredCodelistTreeMaxDepth: null,
                  filteredValues: null
                }))
          };
        case CONTENT_CONSTRAINT_DETAIL_FILTER_COLUMN_FILTERED_VALUES_READ: {

          const filteredValues = action.response.map(obj => obj[action.colName]);

          let filterColumns = state.filterColumns.map(col => {
            if (col.name === action.colName) {

              const filteredCodelistTree =
                col.CodelistCode !== null
                  ? getFilteredTreeWithPaths(
                  col.codelistTree || [],
                  "codes",
                  ({id}) => filteredValues.includes(id)
                  )
                  : null;

              return ({
                ...col,
                filteredCodelistTree,
                filteredValues,
                filteredCodelistTreeMaxDepth:
                  col.CodelistCode !== null
                    ? getMaxTreeDepth(filteredCodelistTree, "codes")
                    : null
              });
            } else
              return col;
          });

          return {
            ...state,
            filterColumns
          };
        }
        case CONTENT_CONSTRAINT_DETAIL_FILTER_COLUMN_CODELIST_COUNT_READ: {

          let filterColumns = state.filterColumns.map(col =>
            col.CodelistCode === getStringFromArtefactTriplet(action.codelistTriplet)
              ? ({
                ...col,
                codelistCount: Number(action.header["x-total-count"])
              })
              : col
          );

          return {
            ...state,
            filterColumns
          };
        }
        case CONTENT_CONSTRAINT_DETAIL_FILTER_COLUMN_CODELIST_TREE_READ: {

          const codelist = getItemSchemeFromSdmxJsonFactory(
            SDMX_JSON_CODELIST_ITEMS_KEY,
            getCurrentNodeConfig(action).annotations,
            CODELIST_ORDER_ANNOTATION_KEY
          )(getSdmxStructuresFromSdmxJson(action.response)[0]);

          let itemsTree = getTreeFromArray((codelist.codes || []), "codes");

          let filterColumns = state.filterColumns.map(col =>
            col.CodelistCode === getStringFromArtefactTriplet(action.codelistTriplet)
              ? ({
                ...col,
                codelistTree: itemsTree,
                filteredCodelistTree:
                  state.filterCubeId
                    ? col.filteredCodelistTree
                    : itemsTree,
                filteredValues:
                  state.filterCubeId
                    ? col.filteredValues
                    : getNodes(itemsTree, "codes", () => true).map(({id}) => id),
                filteredCodelistTreeMaxDepth:
                  state.filterCubeId
                    ? col.filteredCodelistTreeMaxDepth
                    : getMaxTreeDepth(itemsTree, "codes")
              })
              : col
          );

          return {
            ...state,
            filterColumns
          };
        }
        default:
          return state;
      }
    case REQUEST_ERROR:
      switch (action.label) {
        case CONTENT_CONSTRAINT_DETAIL_READ:
          return {
            ...state,
            isVisible: false,
            isContentConstraintValid: true
          };
        default:
          return state;
      }
    default:
      return state;
  }
};

export default contentConstraintDetailModalReducer;
