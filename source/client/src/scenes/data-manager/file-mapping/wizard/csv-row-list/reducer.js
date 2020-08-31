import {REQUEST_ERROR, REQUEST_SUCCESS} from '../../../../../middlewares/api/actions';
import {
  FILE_MAPPING_WIZARD_CSV_ROW_LIST_CSV_ROWS_GET,
  FILE_MAPPING_WIZARD_CSV_ROW_LIST_HIDE,
  FILE_MAPPING_WIZARD_CSV_ROW_LIST_SHOW
} from './actions';

const fileMappingWizardCsvRowListReducer = (
  state = {
    isVisible: false,
    csvRows: null
  },
  action
) => {
  switch (action.type) {
    case FILE_MAPPING_WIZARD_CSV_ROW_LIST_SHOW:
      return {
        ...state,
        isVisible: true
      };
    case FILE_MAPPING_WIZARD_CSV_ROW_LIST_HIDE:
      return {
        ...state,
        isVisible: false,
        csvRows: null,
      };
    case REQUEST_ERROR:
      switch (action.label) {
        case FILE_MAPPING_WIZARD_CSV_ROW_LIST_CSV_ROWS_GET:
          return {
            ...state,
            isVisible: false,
            csvRows: null
          };
        default:
          return state;
      }
    case REQUEST_SUCCESS:
      switch (action.label) {
        case FILE_MAPPING_WIZARD_CSV_ROW_LIST_CSV_ROWS_GET:
          return {
            ...state,
            csvRows: action.response
          };
        default:
          return state;
      }
    default:
      return state;
  }
};

export default fileMappingWizardCsvRowListReducer;
