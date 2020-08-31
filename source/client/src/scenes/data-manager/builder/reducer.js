import {combineReducers} from 'redux';
import builderDsdListReducer from './dsd-list/reducer';
import builderCubeTreeReducer from './cube-tree/reducer';
import builderCubeFormReducer from './cube-form/reducer';
import {
  BUILDER_CUBE_TREE_CATEGORISED_CUBES_READ,
  BUILDER_CUBE_TREE_CUBE_CATEGORY_SELECT,
  BUILDER_CUBE_TREE_CUBE_DELETE,
  BUILDER_CUBE_TREE_CUBE_SELECT
} from './cube-tree/actions';
import {REQUEST_ERROR, REQUEST_START, REQUEST_SUCCESS} from '../../../middlewares/api/actions';
import {BUILDER_CUBE_FORM_CUBE_READ, BUILDER_CUBE_FORM_SUBMIT} from './cube-form/actions';

const builderReducer = combineReducers({
  components: combineReducers({
    dsdList: builderDsdListReducer,
    cubeTree: builderCubeTreeReducer,
    cubeForm: builderCubeFormReducer
  }),
  shared: (
    state = {
      cubeId: null,
      cubeCategoryId: null,
      cubeCategoryCode: null
    },
    action
  ) => {
    switch (action.type) {
      case BUILDER_CUBE_TREE_CUBE_SELECT: {
        return {
          ...state,
          cubeId: action.cubeId
        }
      }
      case BUILDER_CUBE_TREE_CUBE_CATEGORY_SELECT: {
        return {
          ...state,
          cubeCategoryId: action.cubeCategoryId,
          cubeCategoryCode: action.cubeCategoryCode
        }
      }
      case REQUEST_START:
        switch (action.label) {
          case BUILDER_CUBE_TREE_CATEGORISED_CUBES_READ:
            return {
              ...state,
              cubeCategoryId: null,
              cubeCategoryCode: null,
            };
          default:
            return state;
        }
      case REQUEST_ERROR:
        switch (action.label) {
          case BUILDER_CUBE_FORM_CUBE_READ:
            return {
              ...state,
              cubeId: null
            };
          default:
            return state;
        }
      case REQUEST_SUCCESS: {
        switch (action.label) {
          case BUILDER_CUBE_FORM_SUBMIT: {
            return {
              ...state,
              cubeId: action.response,
              cubeCategoryId: null,
              cubeCategoryCode: null
            }
          }
          case BUILDER_CUBE_TREE_CUBE_DELETE:
            return {
              ...state,
              cubeId: null
            };
          default:
            return state;
        }
      }
      default:
        return state;
    }
  }
});

export default builderReducer;
