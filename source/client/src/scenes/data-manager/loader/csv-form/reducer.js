import {REQUEST_ERROR, REQUEST_START, REQUEST_SUCCESS} from '../../../../middlewares/api/actions';
import {combineReducers} from 'redux';
import loaderCsvFormMappingControlReducer from './mapping-control/reducer';
import {
  LOADER_CSV_FORM_MAPPING_CONTROL_MAPPING_SET,
  LOADER_CSV_FORM_MAPPING_CONTROL_MAPPING_UNSET,
  LOADER_CSV_FORM_MAPPING_CONTROL_SELECTED_MAPPING_CUBE_READ,
  LOADER_CSV_FORM_MAPPING_CONTROL_SELECTED_MAPPING_READ
} from './mapping-control/actions';
import {
  LOADER_CSV_FORM_CHANGE,
  LOADER_CSV_FORM_FILE_UPLOAD,
  LOADER_CSV_FORM_IGNORE_CONCURRENT_UPLOAD_CONFIRM_HIDE,
  LOADER_CSV_FORM_SHOW,
  LOADER_CSV_FORM_SUBMIT
} from './actions';
import _ from 'lodash';
import loaderCsvFormRowListReducer from './row-list/reducer';
import {userMustNotInsertTid} from './utils';

const loaderCsvFormReducer = combineReducers({
  components: combineReducers({
    mappingControl: loaderCsvFormMappingControlReducer,
    rowList: loaderCsvFormRowListReducer
  }),
  shared: (
    state = {
      mappingId: null,
      mapping: null,
      mappingCube: null,
      tid: null,
      separator: null,
      delimiter: null,
      hasHeader: false,
      hasDotStatFormat: null,
      csvServerPath: null
    },
    action
  ) => {
    switch (action.type) {
      case LOADER_CSV_FORM_SHOW:
        return {
          mappingId: null,
          mapping: null,
          mappingCube: null,
          tid: null,
          separator: null,
          delimiter: null,
          hasHeader: false,
          hasDotStatFormat: null,
          csvServerPath: null
        };
      case LOADER_CSV_FORM_CHANGE:
        const {
          mappingId,
          tid,
          separator,
          delimiter,
          hasHeader,
          hasDotStatFormat,
          file
        } = _.mapValues(action.fields, field => field.value);
        return {
          ...state,
          tid: tid !== undefined ? tid : state.tid,
          separator: separator !== undefined ? separator : state.separator,
          delimiter: delimiter !== undefined ? delimiter : state.delimiter,
          hasHeader: hasHeader !== undefined ? hasHeader : state.hasHeader,
          hasDotStatFormat: hasDotStatFormat !== undefined ? hasDotStatFormat : state.hasDotStatFormat,
          csvServerPath: (mappingId !== undefined || file !== undefined || separator !== undefined || delimiter !== undefined || hasHeader !== undefined)
            ? null
            : state.csvServerPath,
        };
      case LOADER_CSV_FORM_MAPPING_CONTROL_MAPPING_SET:
        return {
          ...state,
          mappingId: action.mappingId,
          tid: null,
        };
      case LOADER_CSV_FORM_MAPPING_CONTROL_MAPPING_UNSET:
        return {
          ...state,
          mappingId: null,
          mapping: null,
          mappingCube: null,
          csvServerPath: null,
          separator: null,
          delimiter: null,
          hasDotStatFormat: null,
          hasHeader: false,
          tid: null
        };
      case REQUEST_START:
        switch (action.label) {
          case LOADER_CSV_FORM_MAPPING_CONTROL_SELECTED_MAPPING_READ:
            return {
              ...state,
              tid: null,
              mapping: null,
            };
          case LOADER_CSV_FORM_FILE_UPLOAD:
            return {
              ...state,
              csvServerPath: null
            };
          case LOADER_CSV_FORM_MAPPING_CONTROL_SELECTED_MAPPING_CUBE_READ:
            return {
              ...state,
              tid: null,
              mappingCube: null
            };
          default:
            return state;
        }
      case REQUEST_SUCCESS: {
        switch (action.label) {
          case LOADER_CSV_FORM_MAPPING_CONTROL_SELECTED_MAPPING_READ:
            return {
              ...state,
              mapping: action.response,
              separator: action.response.CSVSeparator,
              delimiter: action.response.CSVDelimiter,
              hasHeader: action.response.HasHeader,
              hasDotStatFormat: action.response.HasSpecialTimePeriod
            };
          case LOADER_CSV_FORM_MAPPING_CONTROL_SELECTED_MAPPING_CUBE_READ:
            return {
              ...state,
              tid:
                !userMustNotInsertTid(state.mapping, action.response) &&
                state.mapping.Tid !== null
                  ? state.mapping.Tid
                  : null,
              mappingCube: action.response
            };
          case LOADER_CSV_FORM_FILE_UPLOAD:
            return {
              ...state,
              csvServerPath: action.response
            };
          case LOADER_CSV_FORM_SUBMIT:
            return {
              mappingId: null,
              mapping: null,
              mappingCube: null,
              tid: null,
              separator: null,
              delimiter: null,
              hasDotStatFormat: null,
              hasHeader: false,
              csvServerPath: null
            };
          default:
            return state;
        }
      }
      default:
        return state;
    }
  },
  local: (
    state = {
      importType: "SeriesAndData",
      file: null,
      embargo: {
        enabled: false,
        autoReleaseEnabled: false,
        autoReleaseDate: null,
        autoReleaseTime: null,
        refreshProdDf: false,
        checkFiltAttributes: false
      },
      isIgnoreConcurrentUploadConfirmVisible: false
    },
    action
  ) => {
    switch (action.type) {
      case LOADER_CSV_FORM_SHOW:
        return {
          importType: "SeriesAndData",
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
      case LOADER_CSV_FORM_CHANGE:
        let {
          importType,
          file,
          embargo,
          refreshProdDf,
          checkFiltAttributes
        } = _.mapValues(action.fields, field => field.value);
        return {
          ...state,
          importType: importType !== undefined ? importType : state.importType,
          file: file !== undefined ? file : state.file,
          embargo: embargo !== undefined ? embargo : state.embargo,
          refreshProdDf: refreshProdDf !== undefined ? refreshProdDf : state.refreshProdDf,
          checkFiltAttributes: checkFiltAttributes !== undefined ? checkFiltAttributes : state.checkFiltAttributes
        };
      case LOADER_CSV_FORM_IGNORE_CONCURRENT_UPLOAD_CONFIRM_HIDE:
        return {
          ...state,
          isIgnoreConcurrentUploadConfirmVisible: false
        };
      case LOADER_CSV_FORM_MAPPING_CONTROL_MAPPING_UNSET:
        return {
          ...state,
          tid: null,
          file: null,
          embargo: {
            enabled: false,
            autoReleaseEnabled: false,
            autoReleaseDate: null,
            autoReleaseTime: null,
          },
          refreshProdDf: false,
          checkFiltAttributes: false,
        };
      case REQUEST_SUCCESS: {
        switch (action.label) {
          case LOADER_CSV_FORM_SUBMIT:
            return {
              ...state,
              importType: "SeriesAndData",
              file: null,
              isVisible: false,
              refreshProdDf: false,
              checkFiltAttributes: false,
            };
          default:
            return state;
        }
      }
      case REQUEST_ERROR: {
        switch (action.label) {
          case LOADER_CSV_FORM_SUBMIT:
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
      default:
        return state;
    }
  }
});

export default loaderCsvFormReducer;
