import {REQUEST_ERROR} from '../api/actions';
import {showDefaultCategorySchemeSelector} from './actions';

const defaultCategorySchemeSelectorMiddleware = ({dispatch}) => next => action => {

  const result = next(action);

  if (action.type === REQUEST_ERROR && action.error !== null &&
    action.error.errorCode === 'DEF_CAT_SCHEME_EMPTY') {


    dispatch(showDefaultCategorySchemeSelector());
  }

  return result;
};

export default defaultCategorySchemeSelectorMiddleware;
