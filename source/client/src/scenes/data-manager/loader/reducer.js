import { combineReducers } from 'redux';
import loaderCsvFormReducer from './csv-form/reducer';
import { LOADER_CSV_FORM_SHOW } from './csv-form/actions';
import loaderXmlFormReducer from './xml-form/reducer';
import { LOADER_XML_FORM_SHOW } from './xml-form/actions';

const loaderReducer = combineReducers({
  components: combineReducers({
    csvForm: loaderCsvFormReducer,
    xmlForm: loaderXmlFormReducer
  }),
  shared: (
    state = {
      isCsvVisible: true,
      isXmlVisible: false
    },
    action
  ) => {
    switch (action.type) {
      case LOADER_CSV_FORM_SHOW:
        return {
          ...state,
          isCsvVisible: true,
          isXmlVisible: false
        };
      case LOADER_XML_FORM_SHOW:
        return {
          ...state,
          isXmlVisible: true,
          isCsvVisible: false
        };
      default:
        return state;
    }
  }
});

export default loaderReducer;
