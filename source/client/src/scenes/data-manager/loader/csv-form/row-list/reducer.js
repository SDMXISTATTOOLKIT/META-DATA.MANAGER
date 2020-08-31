import {REQUEST_ERROR, REQUEST_SUCCESS} from '../../../../../middlewares/api/actions';
import {
  LOADER_CSV_FORM_ROW_LIST_CSV_ROWS_GET,
  LOADER_CSV_FORM_ROW_LIST_HIDE,
  LOADER_CSV_FORM_ROW_LIST_SHOW
} from './actions';

const loaderCsvFormRowListReducer = (
  state = {
    isVisible: false,
    csvRows: null
  },
  action
) => {
  switch (action.type) {
    case LOADER_CSV_FORM_ROW_LIST_SHOW:
      return {
        ...state,
        isVisible: true
      };
    case LOADER_CSV_FORM_ROW_LIST_HIDE:
      return {
        ...state,
        isVisible: false
      };
    case REQUEST_ERROR:
      switch (action.label) {
        case LOADER_CSV_FORM_ROW_LIST_CSV_ROWS_GET:
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
        case LOADER_CSV_FORM_ROW_LIST_CSV_ROWS_GET:
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

export default loaderCsvFormRowListReducer;
