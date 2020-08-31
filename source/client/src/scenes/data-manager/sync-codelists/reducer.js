import {
  SYNC_CODELISTS_CODELISTS_TO_SYNC_CHANGE,
  SYNC_CODELISTS_CODELISTS_TO_SYNC_READ,
  SYNC_CODELISTS_SYNC_CODELISTS_SUBMIT
} from "./actions";
import {REQUEST_START, REQUEST_SUCCESS} from '../../../middlewares/api/actions';

const syncCodelisReducer = (
  state = {
    codelists: null,
    selectedCodelists: null
  },
  action
) => {
  switch (action.type) {
    case SYNC_CODELISTS_CODELISTS_TO_SYNC_CHANGE:
      return {
        ...state,
        selectedCodelists: action.selectedCodelists
      };
    case REQUEST_START:
      switch (action.label) {
        case SYNC_CODELISTS_CODELISTS_TO_SYNC_READ:
          return {
            ...state,
            codelists: null
          };
        default:
          return state;
      }
    case REQUEST_SUCCESS:
      switch (action.label) {
        case SYNC_CODELISTS_CODELISTS_TO_SYNC_READ:
          return {
            ...state,
            codelists: action.response,
            selectedCodelists: action.response.map(codelist => `${codelist.id}+${codelist.agency}+${codelist.version}`)
          };
        case SYNC_CODELISTS_SYNC_CODELISTS_SUBMIT:
          return {
            ...state,
            codelists: null
          };
        default:
          return state;
      }
    default:
      return state;
  }
};

export default syncCodelisReducer;
