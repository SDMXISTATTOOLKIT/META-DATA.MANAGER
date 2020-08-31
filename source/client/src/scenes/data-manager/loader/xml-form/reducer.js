import loaderXmlFormRowListReducer from './row-list/reducer';
import {combineReducers} from 'redux';
import {REQUEST_ERROR, REQUEST_START, REQUEST_SUCCESS} from '../../../../middlewares/api/actions';
import _ from 'lodash';
import {
  LOADER_XML_FORM_CATEGORISED_CUBES_READ,
  LOADER_XML_FORM_CHANGE,
  LOADER_XML_FORM_CUBE_READ,
  LOADER_XML_FORM_CUBE_SET,
  LOADER_XML_FORM_CUBE_TREE_HIDE,
  LOADER_XML_FORM_CUBE_TREE_SHOW,
  LOADER_XML_FORM_CUBE_UNSET,
  LOADER_XML_FORM_FILE_UPLOAD,
  LOADER_XML_FORM_IGNORE_CONCURRENT_UPLOAD_CONFIRM_HIDE,
  LOADER_XML_FORM_SHOW,
  LOADER_XML_FORM_SUBMIT
} from './actions';
import {getCubesTree} from '../../../../utils/treeBuilders';
import {DEFAULT_CATEGORY_SCHEME_SELECTOR_SUBMIT} from '../../../../middlewares/default-category-scheme-selector/actions';

const loaderXmlFormReducer = combineReducers({
  components: combineReducers({
    rowList: loaderXmlFormRowListReducer
  }),
  shared: (
    state = {
      cube: null,
      filePath: null
    },
    action
  ) => {
    switch (action.type) {
      case LOADER_XML_FORM_SHOW:
        return {
          ...state,
          filePath: null
        };
      case LOADER_XML_FORM_CUBE_UNSET:
        return {
          ...state,
          cube: null,
          filePath: null
        };
      case LOADER_XML_FORM_CHANGE:
        const { file } = _.mapValues(action.fields, field => field.value);
        return {
          ...state,
          filePath: file !== undefined ? null : state.filePath
        };
      case REQUEST_START:
        switch (action.label) {
          case LOADER_XML_FORM_FILE_UPLOAD:
            return {
              ...state,
              filePath: null
            };
          default:
            return state;
        }
      case REQUEST_SUCCESS:
        switch (action.label) {
          case LOADER_XML_FORM_FILE_UPLOAD:
            return {
              ...state,
              filePath: action.response
            };
          case LOADER_XML_FORM_SUBMIT:
            return {
              ...state,
              filePath: null
            };
          case LOADER_XML_FORM_CUBE_READ:
            return {
              ...state,
              cube: action.response
            };
          default:
            return state;
        }
      default:
        return state;
    }
  },
  local: (
    state = {
      cubeId: null,
      tid: null,
      importType: 'SeriesAndData',
      file: null,
      categorisedCubes: null,
      isCubeTreeVisible: false,
      embargo: {
        enabled: false,
        autoReleaseEnabled: false,
        autoReleaseDate: null,
        autoReleaseTime: null,
      },
      refreshProdDf: false,
      checkFiltAttributes: false,
      isIgnoreConcurrentUploadConfirmVisible: false
    },
    action
  ) => {
    switch (action.type) {
      case LOADER_XML_FORM_SHOW:
        return {
          ...state,
          cubeId: null,
          tid: null,
          importType: 'SeriesAndData',
          file: null,
          categorisedCubes: null,
          isCubeTreeVisible: false,
          embargo: {
            enabled: false,
            autoReleaseEnabled: false,
            autoReleaseDate: null,
            autoReleaseTime: null,
          },
          refreshProdDf: false,
          checkFiltAttributes: false
        };
      case LOADER_XML_FORM_CUBE_TREE_SHOW:
        return {
          ...state,
          isCubeTreeVisible: true,
        };
      case LOADER_XML_FORM_CUBE_TREE_HIDE:
        return {
          ...state,
          isCubeTreeVisible: false,
          categorisedCubes: null,
        };
      case LOADER_XML_FORM_CHANGE:
        const {
          tid,
          importType,
          file,
          embargo,
          refreshProdDf,
          checkFiltAttributes
        } = _.mapValues(action.fields, field => field.value);
        return {
          ...state,
          tid: tid !== undefined ? tid : state.tid,
          importType: importType !== undefined ? importType : state.importType,
          file: file !== undefined ? file : state.file,
          embargo: embargo !== undefined ? embargo : state.embargo,
          refreshProdDf: refreshProdDf !== undefined ? refreshProdDf : state.refreshProdDf,
          checkFiltAttributes: checkFiltAttributes !== undefined ? checkFiltAttributes : state.checkFiltAttributes
        };
      case LOADER_XML_FORM_CUBE_SET:
        return {
          ...state,
          cubeId: action.cubeId,
          isCubeTreeVisible: false,
          categorisedCubes: null,
        };
      case LOADER_XML_FORM_IGNORE_CONCURRENT_UPLOAD_CONFIRM_HIDE:
        return {
          ...state,
          isIgnoreConcurrentUploadConfirmVisible: false
        };
      case LOADER_XML_FORM_CUBE_UNSET:
        return {
          ...state,
          cubeId: null,
          tid: null,
          file: null,
          embargo: {
            enabled: false,
            autoReleaseEnabled: false,
            autoReleaseDate: null,
            autoReleaseTime: null,
          },
          refreshProdDf: false,
          checkFiltAttributes: false
        };
      case REQUEST_START: {
        switch (action.label) {
          case LOADER_XML_FORM_CATEGORISED_CUBES_READ:
            return {
              ...state,
              categorisedCubes: null
            };
          default:
            return state;
        }
      }
      case REQUEST_ERROR: {
        switch (action.label) {
          case LOADER_XML_FORM_CATEGORISED_CUBES_READ:
            return {
              ...state,
              isCubeTreeVisible: false,
              categorisedCubes: []
            };
          case LOADER_XML_FORM_SUBMIT:
            if (action.error && action.error.errorCode === "LOADING_CONCURRENT_UPLOAD_SAME_CUBE") {
              return {
                ...state,
                isIgnoreConcurrentUploadConfirmVisible: true
              }
            } else {
              return state;
            }
          default:
            return state;
        }
      }
      case REQUEST_SUCCESS: {
        switch (action.label) {
          case LOADER_XML_FORM_SUBMIT:
            return {
              ...state,
              cubeId: null,
              importType: 'SeriesAndData',
              file: null,
              categorisedCubes: null,
              isCubeTreeVisible: false,
              refreshProdDf: false,
              checkFiltAttributes: false
            };
          case LOADER_XML_FORM_CATEGORISED_CUBES_READ:
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
      }
      default:
        return state;
    }
  }
});

export default loaderXmlFormReducer;
