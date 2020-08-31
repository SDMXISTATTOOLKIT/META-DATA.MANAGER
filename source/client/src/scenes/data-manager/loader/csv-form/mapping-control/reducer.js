import {
  REQUEST_ERROR,
  REQUEST_START,
  REQUEST_SUCCESS
} from '../../../../../middlewares/api/actions';
import {
  LOADER_CSV_FORM_MAPPING_CONTROL_DETAIL_MAPPING_CUBE_READ,
  LOADER_CSV_FORM_MAPPING_CONTROL_DETAIL_MAPPING_HIDE,
  LOADER_CSV_FORM_MAPPING_CONTROL_DETAIL_MAPPING_READ,
  LOADER_CSV_FORM_MAPPING_CONTROL_DETAIL_MAPPING_SHOW,
  LOADER_CSV_FORM_MAPPING_CONTROL_MAPPING_SET,
  LOADER_CSV_FORM_MAPPING_CONTROL_MAPPINGS_HIDE,
  LOADER_CSV_FORM_MAPPING_CONTROL_MAPPINGS_READ,
  LOADER_CSV_FORM_MAPPING_CONTROL_MAPPINGS_SHOW,
  LOADER_CSV_FORM_MAPPING_CONTROL_SELECTED_MAPPING_CUBE_READ,
  LOADER_CSV_FORM_MAPPING_CONTROL_SELECTED_MAPPING_HIDE,
  LOADER_CSV_FORM_MAPPING_CONTROL_SELECTED_MAPPING_SHOW
} from './actions';

const loaderCsvFormMappingControlReducer = (
  state = {
    isSelectedMappingVisible: false,
    isMappingsVisible: false,
    mappings: null,
    detailMappingId: null,
    detailMapping: null,
    detailMappingCube: null
  },
  action
) => {
  switch (action.type) {
    case LOADER_CSV_FORM_MAPPING_CONTROL_MAPPING_SET:
      return {
        ...state,
        isMappingsVisible: false
      };
    case LOADER_CSV_FORM_MAPPING_CONTROL_MAPPINGS_SHOW:
      return {
        ...state,
        isMappingsVisible: true
      };
    case LOADER_CSV_FORM_MAPPING_CONTROL_DETAIL_MAPPING_SHOW:
      return {
        ...state,
        detailMappingId: action.mappingId
      };
    case LOADER_CSV_FORM_MAPPING_CONTROL_SELECTED_MAPPING_SHOW:
      return {
        ...state,
        isSelectedMappingVisible: true
      };
    case LOADER_CSV_FORM_MAPPING_CONTROL_MAPPINGS_HIDE:
      return {
        ...state,
        isMappingsVisible: false,
        mappings: null,
      };
    case LOADER_CSV_FORM_MAPPING_CONTROL_DETAIL_MAPPING_HIDE:
      return {
        ...state,
        detailMappingId: null,
        detailMapping: null,
        detailMappingCube: null
      };
    case LOADER_CSV_FORM_MAPPING_CONTROL_SELECTED_MAPPING_HIDE:
      return {
        ...state,
        isSelectedMappingVisible: false
      };
    case REQUEST_START: {
      switch (action.label) {
        case LOADER_CSV_FORM_MAPPING_CONTROL_MAPPINGS_READ:
          return {
            ...state,
            mappings: null
          };
        case LOADER_CSV_FORM_MAPPING_CONTROL_DETAIL_MAPPING_READ:
          return {
            ...state,
            detailMapping: null
          };
        case LOADER_CSV_FORM_MAPPING_CONTROL_DETAIL_MAPPING_CUBE_READ:
          return {
            ...state,
            detailMappingCube: null
          };
        default:
          return state;
      }
    }
    case REQUEST_ERROR: {
      switch (action.label) {
        case LOADER_CSV_FORM_MAPPING_CONTROL_MAPPINGS_READ:
          return {
            ...state,
            isMappingsVisible: false
          };
        case LOADER_CSV_FORM_MAPPING_CONTROL_DETAIL_MAPPING_READ:
          return {
            ...state,
            detailMappingId: null
          };
        case LOADER_CSV_FORM_MAPPING_CONTROL_SELECTED_MAPPING_CUBE_READ:
          return {
            ...state,
            isSelectedMappingVisible: false
          };
        default:
          return state;
      }
    }
    case REQUEST_SUCCESS: {
      switch (action.label) {
        case LOADER_CSV_FORM_MAPPING_CONTROL_MAPPINGS_READ:
          return {
            ...state,
            mappings: action.response
          };
        case LOADER_CSV_FORM_MAPPING_CONTROL_DETAIL_MAPPING_READ:
          return {
            ...state,
            detailMapping: action.response
          };
        case LOADER_CSV_FORM_MAPPING_CONTROL_DETAIL_MAPPING_CUBE_READ:
          return {
            ...state,
            detailMappingCube: action.response
          };
        default:
          return state;
      }
    }
    default:
      return state;
  }
};

export default loaderCsvFormMappingControlReducer;
