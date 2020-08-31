import {REQUEST_ERROR, REQUEST_START, REQUEST_SUCCESS} from '../../../../../middlewares/api/actions';
import {getCubesTree} from '../../../../../utils/treeBuilders';
import {
  DATAFLOW_BUILDER_WIZARD_QUERY_CUBE_COLUMNS_FORM_CATEGORISED_CUBES_READ,
  DATAFLOW_BUILDER_WIZARD_QUERY_CUBE_COLUMNS_FORM_CUBE_FIRST_ROW_READ,
  DATAFLOW_BUILDER_WIZARD_QUERY_CUBE_COLUMNS_FORM_CUBE_TREE_HIDE,
  DATAFLOW_BUILDER_WIZARD_QUERY_CUBE_COLUMNS_FORM_CUBE_TREE_SHOW
} from "./actions";

const dataflowBuilderWizardQueryColumnsFormReducer = (
  state = {
    isCubeTreeVisible: false,
    categorisedCubes: null
  },
  action
) => {
  switch (action.type) {
    case DATAFLOW_BUILDER_WIZARD_QUERY_CUBE_COLUMNS_FORM_CUBE_TREE_SHOW:
      return {
        ...state,
        isCubeTreeVisible: true
      };
    case DATAFLOW_BUILDER_WIZARD_QUERY_CUBE_COLUMNS_FORM_CUBE_TREE_HIDE:
      return {
        ...state,
        isCubeTreeVisible: false
      };
    case REQUEST_START:
      switch (action.label) {
        case DATAFLOW_BUILDER_WIZARD_QUERY_CUBE_COLUMNS_FORM_CATEGORISED_CUBES_READ:
          return {
            ...state,
            categorisedCubes: null
          };
        default:
          return state;
      }
    case REQUEST_ERROR:
      switch (action.label) {
        case DATAFLOW_BUILDER_WIZARD_QUERY_CUBE_COLUMNS_FORM_CATEGORISED_CUBES_READ:
          return {
            ...state,
            isCubeTreeVisible: false
          };
        default:
          return state;
      }
    case REQUEST_SUCCESS:
      switch (action.label) {
        case DATAFLOW_BUILDER_WIZARD_QUERY_CUBE_COLUMNS_FORM_CATEGORISED_CUBES_READ:
          return {
            ...state,
            categorisedCubes: getCubesTree(action.response[0], action.response[1])
          };
        case DATAFLOW_BUILDER_WIZARD_QUERY_CUBE_COLUMNS_FORM_CUBE_FIRST_ROW_READ:
          return {
            ...state,
            isCubeTreeVisible:
              state.isCubeTreeVisible
                ? action.response.Data[0] === null || action.response.Data[0] === undefined
                : false
          };
        default:
          return state;
      }
    default:
      return state;
  }
};

export default dataflowBuilderWizardQueryColumnsFormReducer;
