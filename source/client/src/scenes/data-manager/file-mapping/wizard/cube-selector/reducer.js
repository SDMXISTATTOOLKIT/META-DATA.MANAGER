import {
  REQUEST_ERROR,
  REQUEST_START,
  REQUEST_SUCCESS
} from '../../../../../middlewares/api/actions';
import { FILE_MAPPING_WIZARD_CUBE_SELECTOR_CATEGORISED_CUBES_READ } from './actions';
import { getCubesTree } from '../../../../../utils/treeBuilders';
import { DEFAULT_CATEGORY_SCHEME_SELECTOR_SUBMIT } from '../../../../../middlewares/default-category-scheme-selector/actions';

const fileMappingWizardCubeSelectorReducer = (
  state = {
    categorisedCubes: null,
  },
  action
) => {
  switch (action.type) {
    case REQUEST_START:
      switch (action.label) {
        case FILE_MAPPING_WIZARD_CUBE_SELECTOR_CATEGORISED_CUBES_READ:
          return {
            ...state,
            categorisedCubes: null
          };
        default:
          return state;
      }
    case REQUEST_ERROR:
      switch (action.label) {
        case FILE_MAPPING_WIZARD_CUBE_SELECTOR_CATEGORISED_CUBES_READ:
          return {
            ...state,
            categorisedCubes: []
          };
        default:
          return state;
      }
    case REQUEST_SUCCESS:
      switch (action.label) {
        case FILE_MAPPING_WIZARD_CUBE_SELECTOR_CATEGORISED_CUBES_READ:
          return {
            ...state,
            categorisedCubes: getCubesTree(action.response[0], action.response[1])
          };
        case DEFAULT_CATEGORY_SCHEME_SELECTOR_SUBMIT:
          return {
            ...state,
            categorisedCubes: null
          };
        default:
          return state;
      }
    default:
      return state;
  }
};

export default fileMappingWizardCubeSelectorReducer;
