import {REQUEST_ERROR, REQUEST_SUCCESS} from '../../../../../middlewares/api/actions';
import {
  FILE_MAPPING_WIZARD_COLUMN_VALUE_LIST_COL_VALUES_GET,
  FILE_MAPPING_WIZARD_COLUMN_VALUE_LIST_HIDE,
  FILE_MAPPING_WIZARD_COLUMN_VALUE_LIST_SHOW
} from './actions';

const fileMappingWizardCsvColValueListReducer = (
  state = {
    colName: null,
    colValues: null
  },
  action
) => {
  switch (action.type) {
    case FILE_MAPPING_WIZARD_COLUMN_VALUE_LIST_SHOW:
      return {
        ...state,
        colName: action.colName
      };
    case FILE_MAPPING_WIZARD_COLUMN_VALUE_LIST_HIDE:
      return {
        ...state,
        colName: null,
        colValues: null,
      };
    case REQUEST_ERROR:
      switch (action.label) {
        case FILE_MAPPING_WIZARD_COLUMN_VALUE_LIST_COL_VALUES_GET:
          return {
            ...state,
            colName: null,
            colValues: null,
          };
        default:
          return state;
      }
    case REQUEST_SUCCESS:
      switch (action.label) {
        case FILE_MAPPING_WIZARD_COLUMN_VALUE_LIST_COL_VALUES_GET:
          return {
            ...state,
            colValues: action.response
          };
        default:
          return state;
      }
    default:
      return state;
  }
};

export default fileMappingWizardCsvColValueListReducer;
