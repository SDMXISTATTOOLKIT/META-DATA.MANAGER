import {combineReducers} from 'redux';
import dataflowBuilderWizardQueryColumnsFormReducer from './columnsFormReducer';
import dataflowBuilderWizardQueryPreviewReducer from './previewReducer';

const dataflowBuilderWizardQueryReducer = combineReducers({
  components: combineReducers({
    columnsForm: dataflowBuilderWizardQueryColumnsFormReducer,
    preview: dataflowBuilderWizardQueryPreviewReducer
  })
});

export default dataflowBuilderWizardQueryReducer;
