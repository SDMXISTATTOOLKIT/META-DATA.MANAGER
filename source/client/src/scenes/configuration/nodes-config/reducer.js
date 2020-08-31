import {REQUEST_ERROR, REQUEST_START, REQUEST_SUCCESS} from '../../../middlewares/api/actions';
import _ from 'lodash';
import {
  NODES_CONFIG_CONFIG_CHANGE,
  NODES_CONFIG_CONFIG_READ,
  NODES_CONFIG_MSD_SET,
  NODES_CONFIG_MSD_UNSET,
  NODES_CONFIG_MSDS_HIDE,
  NODES_CONFIG_MSDS_READ,
  NODES_CONFIG_MSDS_SHOW,
  NODES_CONFIG_NEW_NODE_REMOVE,
  NODES_CONFIG_NODE_ADD,
  NODES_CONFIG_NODE_CHECK_ENDPOINT_DM,
  NODES_CONFIG_NODE_CHECK_ENDPOINT_MA,
  NODES_CONFIG_NODE_CHECK_ENDPOINT_MD,
  NODES_CONFIG_NODE_CHECK_ENDPOINT_NSI,
  NODES_CONFIG_NODE_COLLAPSED_CHANGE,
  NODES_CONFIG_NODE_REMOVE,
  NODES_CONFIG_NODE_SORT
} from "./actions";
import {NODES_CONFIG_NODE_GENERAL_ITEMS_VIEW_MODE_TABLE} from "./node/GeneralForm";
import {
  NODES_CONFIG_NODE_ENDPOINT_NSI_ENDPOINT_TYPE_SOAP,
  NODES_CONFIG_NODE_ENDPOINT_PING_ARTEFACT_CONCEPT_SCHEME
} from "./node/EndpointForm";
import {getArtefactFromSdmxJsonStructure, getSdmxStructuresFromSdmxJson} from "../../../utils/sdmxJson";
import {getCurrentNodeConfig} from "../../../middlewares/current-node-config/middleware";

const getDictionaryFromLangs = (langs, str) =>
  langs.map(({code}) => code).reduce((ac, a) => ({...ac, [a]: str}), {});

const nodesConfigReducer = (
  state = {
    config: null,
    configBeforeSort: null,
    isMsdsVisible: false,
    msds: null,
    nodeIndex: null
  },
  action
  ) => {
    switch (action.type) {
      case NODES_CONFIG_NODE_ADD:
        return {
          ...state,
          config: [
            ...state.config,
            {
              isNewNode: true,
              isCollapsed: false,
              isNSIPingOk: null,
              isMAPingOk: null,
              isDMPingOk: null,
              isMDPingOk: null,
              General: {
                DefaultItemsViewMode: NODES_CONFIG_NODE_GENERAL_ITEMS_VIEW_MODE_TABLE,
                Invisible: false
              },
              Agencies: [
                {
                  Id: "OECD",
                  Name: getDictionaryFromLangs(action.dataLangs, "Organisation for Economic Co-operation and Development")
                },
                {Id: "ESTAT", Name: getDictionaryFromLangs(action.dataLangs, "Eurostat")},
                {Id: "ECB", Name: getDictionaryFromLangs(action.dataLangs, "European Central Bank")},
                {Id: "WB", Name: getDictionaryFromLangs(action.dataLangs, "World Bank")},
                {Id: "BIS", Name: getDictionaryFromLangs(action.dataLangs, "Bank for International Settlements")},
                {Id: "IMF", Name: getDictionaryFromLangs(action.dataLangs, "International Monetary Fund")},
                {Id: "UNSD", Name: getDictionaryFromLangs(action.dataLangs, "United Nation Statistical Division")},
                {Id: "UNICEF", Name: getDictionaryFromLangs(action.dataLangs, "United Nations Children's Fund")},
                {Id: "ILO", Name: getDictionaryFromLangs(action.dataLangs, "International Labour Organization")},
                {Id: "FAO", Name: getDictionaryFromLangs(action.dataLangs, "Food and Agriculture Organisation")},
                {
                  Id: "IAEG-SDGs",
                  Name: getDictionaryFromLangs(action.dataLangs, "Inter-Agency and Expert Group on SDGs")
                },
                {Id: "IT1", Name: getDictionaryFromLangs(action.dataLangs, "Istat")},
                {Id: "BE2", Name: getDictionaryFromLangs(action.dataLangs, "National Bank of Belgium")},
                {Id: "TN1", Name: getDictionaryFromLangs(action.dataLangs, "INS Tunisia")},
                {Id: "AU1", Name: getDictionaryFromLangs(action.dataLangs, "Australian Bureau of Statistics")},
                {
                  Id: "AE1",
                  Name: getDictionaryFromLangs(action.dataLangs, "Federal Competitiveness and Statistics Authority of United Arab Emirates")
                },
                {
                  Id: "LU1",
                  Name: getDictionaryFromLangs(action.dataLangs, "STATEC - National Institute of Statistics and Economic Studies of the Grand Duchy of Luxembourg")
                },
                {Id: "SPC", Name: getDictionaryFromLangs(action.dataLangs, "Pacific Community (SPC)")},
                {Id: "ITH1", Name: getDictionaryFromLangs(action.dataLangs, "Provincial Statistics Institute (ASTAT)")},
                {Id: "INE1", Name: getDictionaryFromLangs(action.dataLangs, "National Institute of Statistics (Chile)")},
                {Id: "SE1", Name: getDictionaryFromLangs(action.dataLangs, "Statistics Estonia")},
                {Id: "UKDS", Name: getDictionaryFromLangs(action.dataLangs, "UK Data Service")},
                {Id: "NZ1", Name: getDictionaryFromLangs(action.dataLangs, "Stats NZ")}
              ],
              Endpoint: {
                PingArtefact: NODES_CONFIG_NODE_ENDPOINT_PING_ARTEFACT_CONCEPT_SCHEME,
                NSIEndpointType: NODES_CONFIG_NODE_ENDPOINT_NSI_ENDPOINT_TYPE_SOAP
              },
              AnnotationTabs: {
                IsTextCollapsed: true,
                Tabs: []
              },
              Annotations: {
                ConceptSchemesOrder: "ORDER",
                CategorySchemesOrder: "ORDER",
                CodelistsOrder: "ORDER",
                CategorisationsOrder: "ORDER",
                LayoutRow: "LAYOUT_ROW",
                LayoutColumn: "LAYOUT_COLUMN",
                LayoutFilter: "LAYOUT_FILTER",
                LayoutRowSection: "LAYOUT_ROW_SECTION",
                NotDisplayed: "NOT_DISPLAYED",
                LayoutDataflowKeywords: 'KEYWORDS',
                LayoutCriteriaSelection: "CRITERIA_SELECTION",
                LayoutAttachedDataFiles: 'ATTACHED_DATA_FILES',
                LayoutDefaultPresentation: 'DEFAULT_VIEW',
                LayoutDecimalSeparator: 'LAYOUT_DECIMAL_SEPARATOR',
                LayoutNumberOfDecimals: 'LAYOUT_NUMBER_OF_DECIMALS',
                LayoutReferenceMetadata: 'METADATA_URL',
                LayoutEmptyCellPlaceholder: 'LAYOUT_EMPTY_CELL_PLACEHOLDER',
                LayoutDataflowNotes: 'DATAFLOW_NOTES',
                LayoutTerritorialDimensionIds: 'GEO_ID',
                LayoutDataflowSource: "DATAFLOW_SOURCE",
                FullName: "FULL_NAME",
                Default: "DEFAULT",
                DDBDataflow: "DDBDataflow",
                CustomDSD: "CustomDSD",
                AssociatedCube: "AssociatedCube",
                Changed: "CHANGED",
                Metadataset: "AssociatedMetadataSet",
                HaveMetadata: "HAVE_METADATA",
                RestrictedForPublication: "RESTRICTED_FOR_PUBLICATION",
                AttachedFilePath: "ATTACHED_FILE_PATH",
                DCAT_IsMultilingual: "SDMX21_IsMultilingual",
                CustomIsPresentational: "CUSTOM_IS_PRESENTATIONAL"
              },
              Search: {
                ExcludeCodelists: [
                  "CL_UPDATE_STATUS",
                  "SDMX_M_PERIODS",
                  "SDMX_Q_PERIODS",
                  "SDMX_S_PERIODS",
                  "SDMX_H_PERIODS"
                ],
                ExcludeConceptSchemes: [
                  "COMPONENT_ROLES"
                ]
              },
              Proxy: {
                Enabled: false
              },
              DcatApIt: {
                MSD: null
              }
            }
          ]
        };
      case NODES_CONFIG_NEW_NODE_REMOVE: {

        let config = _.cloneDeep(state.config);

        config.splice(action.nodeIndex, 1);

        return {
          ...state,
          config
        };
      }
      case NODES_CONFIG_CONFIG_CHANGE:
        return {
          ...state,
          config: action.config.map(node => ({
            ...node,
            isNSIPingOk: null,
            isMAPingOk: null,
            isDMPingOk: null,
            isMDPingOk: null
          }))
        };
      case NODES_CONFIG_NODE_COLLAPSED_CHANGE: {

        const config = _.cloneDeep(state.config);

        return {
          ...state,
          config: config.map((node, index) => ({
            ...node,
            isCollapsed:
              action.nodeIndex === index
                ? action.collapsed
                : node.isCollapsed
          }))
        };
      }
      case NODES_CONFIG_MSDS_SHOW:
        return {
          ...state,
          isMsdsVisible: true,
          nodeIndex: action.nodeIndex
        };
      case NODES_CONFIG_MSDS_HIDE:
        return {
          ...state,
          isMsdsVisible: false,
          msds: null,
          nodeIndex: null
        };
      case NODES_CONFIG_MSD_SET:
        return {
          ...state,
          isMsdsVisible: false,
          msds: null,
          nodeIndex: null,
          config: state.config.map((node, index) => {
            if (index === state.nodeIndex) {
              node.DcatApIt.MSD = action.msd;
            }
            return node
          })
        };
      case NODES_CONFIG_MSD_UNSET:
        return {
          ...state,
          config: state.config.map((node, index) => {
            if (index === action.nodeIndex) {
              node.DcatApIt.MSD = null;
            }
            return node
          })
        };
      case NODES_CONFIG_NODE_CHECK_ENDPOINT_MD:
        const config = _.cloneDeep(state.config);

        return {
          ...state,
          config: config.map((node, index) => ({
            ...node,
            isMDPingOk:
              action.nodeIndex === index
                ? action.requestSuccess
                : node.isMDPingOk
          }))
        };
      case REQUEST_START:
        switch (action.label) {
          case NODES_CONFIG_NODE_SORT: {
            return {
              ...state,
              config: action.orderedNodes,
              configBeforeSort: state.config,
            };
          }
          default:
            return state;
        }
      case REQUEST_ERROR:
        switch (action.label) {
          case NODES_CONFIG_NODE_SORT: {
            return {
              ...state,
              config: state.configBeforeSort,
              configBeforeSort: null
            };
          }
          default:
            return state;
        }
      case REQUEST_SUCCESS:
        switch (action.label) {
          case NODES_CONFIG_CONFIG_READ:
            return {
              ...state,
              config: action.response.map(node => ({
                ...node,
                isCollapsed: true,
                isNSIPingOk: null,
                isMAPingOk: null,
                isDMPingOk: null,
                isMDPingOk: null
              })),
              configBeforeSort: null
            };
          case NODES_CONFIG_NODE_REMOVE: {
            let config = _.cloneDeep(state.config);
            config.splice(action.nodeIndex, 1);
            return {
              ...state,
              config
            };
          }
          case NODES_CONFIG_NODE_CHECK_ENDPOINT_NSI: {
            const config = _.cloneDeep(state.config);

            return {
              ...state,
              config: config.map((node, index) => ({
                ...node,
                isNSIPingOk:
                  action.nodeIndex === index
                    ? action.response
                    : node.isNSIPingOk
              }))
            };
          }
          case NODES_CONFIG_NODE_CHECK_ENDPOINT_MA: {
            const config = _.cloneDeep(state.config);

            return {
              ...state,
              config: config.map((node, index) => ({
                ...node,
                isMAPingOk:
                  action.nodeIndex === index
                    ? action.response
                    : node.isMAPingOk
              }))
            };
          }
          case NODES_CONFIG_NODE_CHECK_ENDPOINT_DM: {
            const config = _.cloneDeep(state.config);

            return {
              ...state,
              config: config.map((node, index) => ({
                ...node,
                isDMPingOk:
                  action.nodeIndex === index
                    ? action.response
                    : node.isDMPingOk
              }))
            };
          }
          case NODES_CONFIG_MSDS_READ:
            return {
              ...state,
              msds: (getSdmxStructuresFromSdmxJson(action.response) || []).map(msd =>
                getArtefactFromSdmxJsonStructure(msd, getCurrentNodeConfig(action).annotations))
            };
          default:
            return state;
        }
      default:
        return state;
    }
  }
;

export default nodesConfigReducer;
