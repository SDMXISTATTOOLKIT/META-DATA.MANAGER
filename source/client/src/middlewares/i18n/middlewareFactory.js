import {APP_LANGUAGE_SET, setAppLanguage} from '../../reducers/app/actions';
import {CONFIG_READ} from '../../reducers/config/actions';
import {REQUEST_SUCCESS} from '../api/actions';
import moment from "moment";
import 'moment/locale/it'
import 'moment/locale/en-gb'

const middlewareFactory = i18n => ({dispatch}) => next => action => {

  if (action.type === APP_LANGUAGE_SET && action.payload.language) {
    moment.locale('en-gb');
    if (action.payload.language === 'it') {
      moment.locale('it');
    }
  }

  const result = next(action);

  switch (action.type) {
    case APP_LANGUAGE_SET:
      i18n.changeLanguage(action.payload.language);
      break;
    case REQUEST_SUCCESS:
      switch (action.label) {
        case CONFIG_READ:
          dispatch(setAppLanguage(action.response.userInterface.defaultLanguage));
          break;
        default:
          break;
      }
      break;
    default:
      break;
  }
  return result;
};

export default middlewareFactory;
