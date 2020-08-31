import {REQUEST_ERROR, REQUEST_START, REQUEST_SUCCESS} from '../../../../../middlewares/api/actions';
import {LOADER_XML_ROW_LIST_HIDE, LOADER_XML_ROW_LIST_ROWS_READ, LOADER_XML_ROW_LIST_SHOW} from './actions';

const loaderXmlFormRowListReducer = (
  state = {
    isVisible: false,
    rows: null
  },
  action
) => {
  switch (action.type) {
    case LOADER_XML_ROW_LIST_SHOW:
      return {
        ...state,
        isVisible: true
      };
    case LOADER_XML_ROW_LIST_HIDE:
      return {
        ...state,
        isVisible: false
      };
    case REQUEST_START:
      switch (action.label) {
        default:
          return state;
      }
    case REQUEST_ERROR:
      switch (action.label) {
        case LOADER_XML_ROW_LIST_ROWS_READ:
          return {
            ...state,
            isVisible: false,
            rows: null
          };
        default:
          return state;
      }
    case REQUEST_SUCCESS:
      switch (action.label) {
        case LOADER_XML_ROW_LIST_ROWS_READ:
          return {
            ...state,
            rows: action.response
          };
        default:
          return state;
      }
    default:
      return state;
  }
};

export default loaderXmlFormRowListReducer;
