import {
  BUILDER_CUBE_TREE_CATEGORISED_CUBES_READ,
  BUILDER_CUBE_TREE_CATEGORISED_CUBES_UPDATE,
  BUILDER_CUBE_TREE_CUBE_DELETE
} from './actions';
import {getCubesTree} from '../../../../utils/treeBuilders';
import {REQUEST_ERROR, REQUEST_START, REQUEST_SUCCESS} from '../../../../middlewares/api/actions';
import {BUILDER_CUBE_FORM_SUBMIT} from '../cube-form/actions';
import {DEFAULT_CATEGORY_SCHEME_SELECTOR_SUBMIT} from '../../../../middlewares/default-category-scheme-selector/actions';

const builderCubeTreeReducer = (
  state = {
    categorisedCubes: null,
  },
  action
) => {
  switch (action.type) {
    case REQUEST_START:
      switch (action.label) {
        case BUILDER_CUBE_TREE_CATEGORISED_CUBES_READ:
          return {
            ...state,
            categorisedCubes: null
          };
        default:
          return state;
      }
    case REQUEST_ERROR:
      switch (action.label) {
        case BUILDER_CUBE_TREE_CATEGORISED_CUBES_READ:
        case BUILDER_CUBE_TREE_CATEGORISED_CUBES_UPDATE:
          return {
            ...state,
            categorisedCubes: []
          };
        default:
          return state;
      }
    case REQUEST_SUCCESS: {
      switch (action.label) {
        case BUILDER_CUBE_TREE_CATEGORISED_CUBES_READ:
        case BUILDER_CUBE_TREE_CATEGORISED_CUBES_UPDATE:

          let allCubes = action.response[0];
          const dcs = action.response[1];

          return {
            ...state,
            categorisedCubes: getCubesTree(allCubes, dcs)
          };
        case BUILDER_CUBE_FORM_SUBMIT:
          return {
            ...state,
            categorisedCubes: null
          };
        case BUILDER_CUBE_TREE_CUBE_DELETE:
          return {
            ...state,
            categorisedCubes: null
          };
        case DEFAULT_CATEGORY_SCHEME_SELECTOR_SUBMIT:
          return {
            ...state,
            categorisedCubes: null
          };
        default:
          return state;

      }
    }
    default:
      return state;
  }
};

export default builderCubeTreeReducer;
