import { combineReducers } from 'redux';
import dataflowBuilderWizardQueryReducer from './query/reducer';
import dataflowBuilderWizardCategoryTreeReducer from './category-tree/reducer';
import dataflowBuilderWizardLayoutAnnotationsReducer from "./layout-annotations/reducer";

export const dataflowBuilderWizardReducer = combineReducers({
  components: combineReducers({
    query: dataflowBuilderWizardQueryReducer,
    categoryTree: dataflowBuilderWizardCategoryTreeReducer,
    layoutAnnotations: dataflowBuilderWizardLayoutAnnotationsReducer
  })
});

export default dataflowBuilderWizardReducer;
