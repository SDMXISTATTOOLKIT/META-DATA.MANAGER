import { REQUEST_ERROR, REQUEST_START, REQUEST_SUCCESS } from '../../../../middlewares/api/actions';
import {
  FILE_MAPPING_LIST_FILE_MAPPING_CUBE_READ,
  FILE_MAPPING_LIST_FILE_MAPPING_DELETE,
  FILE_MAPPING_LIST_FILE_MAPPING_DELETE_ALL,
  FILE_MAPPING_LIST_FILE_MAPPING_HIDE,
  FILE_MAPPING_LIST_FILE_MAPPING_READ,
  FILE_MAPPING_LIST_FILE_MAPPING_SHOW,
  FILE_MAPPING_LIST_FILE_MAPPINGS_READ
} from './actions';
import { FILE_MAPPING_WIZARD_FILE_MAPPING_CREATE } from '../wizard/actions';

const fileMappingListReducer = (
  state = {
    fileMappings: null,
    fileMappingId: null,
    fileMapping: null,
    fileMappingCube: null
  },
  action
) => {
  switch (action.type) {
    case FILE_MAPPING_LIST_FILE_MAPPING_SHOW:
      return {
        ...state,
        fileMappingId: action.fileMappingId
      };
    case FILE_MAPPING_LIST_FILE_MAPPING_HIDE:
      return {
        ...state,
        fileMappingId: null,
        fileMapping: null,
        fileMappingCube: null
      };
    case REQUEST_START:
      switch (action.label) {
        case FILE_MAPPING_LIST_FILE_MAPPINGS_READ:
          return {
            ...state,
            fileMappings: null
          };
        case FILE_MAPPING_LIST_FILE_MAPPING_READ:
          return {
            ...state,
            fileMapping: null
          };
        case FILE_MAPPING_LIST_FILE_MAPPING_CUBE_READ:
          return {
            ...state,
            fileMappingCube: null
          };
        default:
          return state;
      }
    case REQUEST_ERROR:
      switch (action.label) {
        case FILE_MAPPING_LIST_FILE_MAPPINGS_READ:
          return {
            ...state,
            fileMappings: []
          };
        case FILE_MAPPING_LIST_FILE_MAPPING_READ:
          return {
            ...state,
            fileMappingId: null,
          };
        case FILE_MAPPING_LIST_FILE_MAPPING_CUBE_READ:
          return {
            ...state,
            fileMappingId: null,
            fileMapping: null
          };
        default:
          return state;
      }
    case REQUEST_SUCCESS:
      switch (action.label) {
        case FILE_MAPPING_LIST_FILE_MAPPINGS_READ:
          return {
            ...state,
            fileMappings: action.response
          };
        case FILE_MAPPING_LIST_FILE_MAPPING_READ:
          return {
            ...state,
            fileMapping: action.response
          };
        case FILE_MAPPING_LIST_FILE_MAPPING_CUBE_READ:
          return {
            ...state,
            fileMappingCube: action.response
          };
        case FILE_MAPPING_LIST_FILE_MAPPING_DELETE:
        case FILE_MAPPING_LIST_FILE_MAPPING_DELETE_ALL:
          return {
            ...state,
            fileMappings: null
          };
        case FILE_MAPPING_WIZARD_FILE_MAPPING_CREATE:
          return {
            ...state,
            fileMappings: null
          };
        default:
          return state;
      }
    default:
      return state;
  }
};

export default fileMappingListReducer;
