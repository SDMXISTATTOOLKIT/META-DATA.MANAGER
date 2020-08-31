import {REQUEST_ERROR, REQUEST_SUCCESS} from '../../../../../middlewares/api/actions';
import {
  DATAFLOW_BUILDER_WIZARD_QUERY_PREVIEW_ROWS_MODAL_HIDE,
  DATAFLOW_BUILDER_WIZARD_QUERY_PREVIEW_ROWS_MODAL_SHOW,
  DATAFLOW_BUILER_WIZARD_QUERY_PREVIEW_ROWS_READ
} from "./actions";

const dataflowBuilderWizardQueryPreviewReducer = (
  state = {
    isRowsModalVisible: false,
    rows: null
  },
  action
) => {
  switch (action.type) {
    case DATAFLOW_BUILDER_WIZARD_QUERY_PREVIEW_ROWS_MODAL_SHOW:
      return {
        ...state,
        isRowsModalVisible: true
      };
    case DATAFLOW_BUILDER_WIZARD_QUERY_PREVIEW_ROWS_MODAL_HIDE:
      return {
        ...state,
        rows: null,
        isRowsModalVisible: false
      };
    case REQUEST_ERROR:
      switch (action.label) {
        case DATAFLOW_BUILER_WIZARD_QUERY_PREVIEW_ROWS_READ:
          return {
            ...state,
            isRowsModalVisible: false,
            rows: null
          };
        default:
          return state;
      }
    case REQUEST_SUCCESS:
      switch (action.label) {
        case DATAFLOW_BUILER_WIZARD_QUERY_PREVIEW_ROWS_READ:
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

export default dataflowBuilderWizardQueryPreviewReducer;
