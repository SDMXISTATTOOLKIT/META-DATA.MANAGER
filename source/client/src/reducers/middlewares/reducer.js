import { combineReducers } from 'redux';
import defaultCategorySchemeSelectorReducer
  from '../../middlewares/default-category-scheme-selector/reducer';
import spinnerReducer from '../../middlewares/spinner/reducer';

const middlewaresReducer = combineReducers({
  defaultCategorySchemeSelector: defaultCategorySchemeSelectorReducer,
  spinner: spinnerReducer
});

export default middlewaresReducer;
