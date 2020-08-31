import {REQUEST_ERROR, REQUEST_START, REQUEST_SUCCESS} from '../../../../middlewares/api/actions';
import {
  FILE_MAPPING_WIZARD_COLUMN_SELECT,
  FILE_MAPPING_WIZARD_COMPONENTS_HIDE,
  FILE_MAPPING_WIZARD_COMPONENTS_SHOW,
  FILE_MAPPING_WIZARD_CSV_HEADER_GET,
  FILE_MAPPING_WIZARD_CUBE_COMPONENTS_HIDE,
  FILE_MAPPING_WIZARD_CUBE_COMPONENTS_SHOW,
  FILE_MAPPING_WIZARD_CUBE_READ,
  FILE_MAPPING_WIZARD_FILE_MAPPING_CREATE,
  FILE_MAPPING_WIZARD_FORM_CHANGE,
  FILE_MAPPING_WIZARD_HIDE,
  FILE_MAPPING_WIZARD_SHOW,
  FILE_MAPPING_WIZARD_STEP_SET
} from './actions';
import {combineReducers} from 'redux';
import fileMappingWizardCubeSelectorReducer from './cube-selector/reducer';
import {
  FILE_MAPPING_WIZARD_CUBE_SELECTOR_CATEGORISED_CUBES_READ,
  FILE_MAPPING_WIZARD_CUBE_SELECTOR_CUBE_SET,
  FILE_MAPPING_WIZARD_CUBE_SELECTOR_CUBE_UNSET
} from './cube-selector/actions';
import {FILE_MAPPING_WIZARD_CSV_FORM_CHANGE, FILE_MAPPING_WIZARD_CSV_FORM_SUBMIT,} from './csv-form/actions';
import _ from 'lodash';
import fileMappingWizardCsvRowListReducer from './csv-row-list/reducer';
import fileMappingWizardCsvColValueListReducer from './csv-column-value-list/reducer';
import fileMappingWizardCubeComponentListReducer from './cube-component-list/reducer';
import {
  FILE_MAPPING_WIZARD_COMPONENT_MAPPER_COMPONENT_ADD,
  FILE_MAPPING_WIZARD_COMPONENT_MAPPER_COMPONENT_ADD_ALL,
  FILE_MAPPING_WIZARD_COMPONENT_MAPPER_COMPONENT_REMOVE,
  FILE_MAPPING_WIZARD_COMPONENT_MAPPER_COMPONENT_REMOVE_ALL,
  FILE_MAPPING_WIZARD_COMPONENT_MAPPER_COMPONENT_SELECT
} from './component-mapper/actions';
import {FILE_MAPPING_WIZARD_CUBE_COMPONENT_LIST_COMPONENT_SELECT} from './cube-component-list/actions';

export const FILE_MAPPING_WIZARD_STEP_CUBE_SELECTION = 0;
export const FILE_MAPPING_WIZARD_STEP_CSV_UPLOAD = 1;
export const FILE_MAPPING_WIZARD_STEP_COMPONENT_MAPPING = 2;
export const FILE_MAPPING_WIZARD_STEP_NAME = 3;

export const DOT_STAT_COLUMN_NAME = "_FREQ_";

const fileMappingWizardReducer = combineReducers({
  components: combineReducers({
    cubeSelector: fileMappingWizardCubeSelectorReducer,
    csvRowList: fileMappingWizardCsvRowListReducer,
    csvColumnValueList: fileMappingWizardCsvColValueListReducer,
    cubeComponentList: fileMappingWizardCubeComponentListReducer
  }),
  shared: (
    state = {
      csvForm: {
        file: null,
        separator: ';',
        delimiter: null,
        hasHeader: true,
        hasDotStatFormat: false
      },
      cubeId: null,
      cube: null,
      csvServerPath: null,
      csvHeader: null,
      components: [],
      selectedColumnName: null,
      selectedCubeComponentCode: null,
      selectedComponent: null,
    },
    action
  ) => {
    switch (action.type) {
      case FILE_MAPPING_WIZARD_CSV_FORM_CHANGE:
        return {
          ...state,
          csvForm: {
            ...state.csvForm,
            ..._.mapValues(action.fields, field => field.value)
          },
          csvServerPath: null,
          csvHeader: null,
          components: [],
          selectedColumnName: null,
          selectedComponent: null,
        };
      case FILE_MAPPING_WIZARD_CUBE_SELECTOR_CUBE_SET:
        return {
          ...state,
          cubeId: action.cubeId,
          cube: null,
          components: [],
          selectedCubeComponentCode: null,
          selectedComponent: null,

        };
      case FILE_MAPPING_WIZARD_CUBE_SELECTOR_CUBE_UNSET:
        return {
          ...state,
          cubeId: null,
          cube: null,
          components: [],
          selectedColumnName: null,
          selectedCubeComponentCode: null,
          selectedComponent: null,
        };
      case FILE_MAPPING_WIZARD_COLUMN_SELECT:
        return {
          ...state,
          selectedColumnName: action.columnName,
          selectedComponent: null,
        };
      case FILE_MAPPING_WIZARD_CUBE_COMPONENT_LIST_COMPONENT_SELECT:
        return {
          ...state,
          selectedCubeComponentCode: action.cubeComponentCode,
          selectedComponent: null
        };
      case FILE_MAPPING_WIZARD_COMPONENT_MAPPER_COMPONENT_ADD:
        return {
          ...state,
          selectedComponent: {
            columnName: action.columnName,
            cubeComponentCode: action.cubeComponentCode
          },
          selectedColumnName: null,
          selectedCubeComponentCode: null,
          components: [
            {
              columnName: action.columnName,
              cubeComponentCode: action.cubeComponentCode,
              cubeComponentType:
              [
                ...state.cube.components.dimensions,
                ...state.cube.components.timeDimensions,
                ...state.cube.components.attributes,
                ...state.cube.components.measures
              ].filter(comp => comp.Code === action.cubeComponentCode)[0].cubeComponentType
            },
            ...state.components,
          ],
        };
      case FILE_MAPPING_WIZARD_COMPONENT_MAPPER_COMPONENT_ADD_ALL:
        return {
          ...state,
          components: [
            ...state.csvHeader
              .filter(columnNameToBeMapped =>
                state.components
                  .map(mappedComponents => mappedComponents.columnName)
                  .indexOf(columnNameToBeMapped) < 0)
              .map(columnNameToBeMapped => {
                const relatedCubeComponentCodeArr =
                  [
                    ...state.cube.components.dimensions,
                    ...state.cube.components.timeDimensions,
                    ...state.cube.components.attributes,
                    ...state.cube.components.measures
                  ]
                    .filter(cubeComp =>
                      cubeComp.Code === columnNameToBeMapped &&
                      state.components
                        .map(mappedComp => mappedComp.cubeComponentCode)
                        .indexOf(cubeComp.Code) < 0);
                return relatedCubeComponentCodeArr.length > 0
                  ? {
                    columnName: columnNameToBeMapped,
                    cubeComponentCode: relatedCubeComponentCodeArr[0].Code,
                    cubeComponentType: relatedCubeComponentCodeArr[0].cubeComponentType
                  }
                  : null;
              })
              .filter(comp => comp !== null),
            ...state.components
          ],
          selectedColumnName: null,
          selectedCubeComponentCode: null,
          selectedComponent: null
        };
      case FILE_MAPPING_WIZARD_COMPONENT_MAPPER_COMPONENT_REMOVE:
        return {
          ...state,
          components:
            state.components
              .filter(({columnName, cubeComponentCode}) =>
                columnName !== action.columnName || cubeComponentCode !== action.cubeComponentCode)
              .map(comp => ({...comp}))
        };
      case FILE_MAPPING_WIZARD_COMPONENT_MAPPER_COMPONENT_REMOVE_ALL:
        return {
          ...state,
          components: [],
          selectedComponent: null
        };
      case FILE_MAPPING_WIZARD_HIDE:
        return {
          csvForm: {
            file: null,
            separator: ';',
            delimiter: null,
            hasHeader: true,
            hasDotStatFormat: false
          },
          cubeId: null,
          cube: null,
          csvServerPath: null,
          csvHeader: null,
          components: [],
          selectedColumnName: null,
          selectedCubeComponentCode: null,
          selectedComponent: null,
        };
      case FILE_MAPPING_WIZARD_COMPONENT_MAPPER_COMPONENT_SELECT:
        return {
          ...state,
          selectedColumnName: null,
          selectedCubeComponentCode: null,
          selectedComponent: {
            columnName: action.columnName,
            cubeComponentCode: action.cubeComponentCode
          }
        };
      case REQUEST_START:
        switch (action.label) {
          case FILE_MAPPING_WIZARD_CUBE_SELECTOR_CATEGORISED_CUBES_READ:
            return {
              ...state,
              cubeId: null
            };
          case FILE_MAPPING_WIZARD_CUBE_READ:
            return {
              ...state,
              cube: null
            };
          case FILE_MAPPING_WIZARD_CSV_FORM_SUBMIT:
            return {
              ...state,
              csvServerPath: null,
            };
          case FILE_MAPPING_WIZARD_CSV_HEADER_GET:
            return {
              ...state,
              csvHeader: null
            };
          default:
            return state;
        }
      case REQUEST_ERROR:
        switch (action.label) {
          default:
            return state;
        }
      case REQUEST_SUCCESS:
        switch (action.label) {
          case FILE_MAPPING_WIZARD_CSV_FORM_SUBMIT:
            return {
              ...state,
              csvServerPath: action.response,
              components: [],
              selectedColumnName: null,
              selectedCubeComponentCode: null,
              selectedComponent: null,
            };
          case FILE_MAPPING_WIZARD_CSV_HEADER_GET:
            return {
              ...state,
              csvHeader:
                action.response.concat(
                  action.csvHasDotStatFormat
                    ? [DOT_STAT_COLUMN_NAME]
                    : []
                )
            };
          case FILE_MAPPING_WIZARD_CUBE_READ:
            return {
              ...state,
              cube: {
                ...action.response,
                components: {
                  dimensions:
                    action.response.Dimensions
                      .filter(dim => !dim.IsTimeSeriesDim)
                      .map(dim => ({
                        ...dim,
                        cubeComponentType: 'Dimension'
                      })),
                  timeDimensions:
                    action.response.Dimensions
                      .filter(dim => dim.IsTimeSeriesDim)
                      .map(dim => ({
                        ...dim,
                        cubeComponentType: 'TimeDimension'
                      })),
                  tidAttributes:
                    action.response.Attributes
                      .filter(attr => attr.IsTid)
                      .map(attr => ({
                        ...attr,
                        cubeComponentType: 'Attribute'
                      })),
                  attributes:
                    action.response.Attributes
                      .filter(attr => !attr.IsTid)
                      .map(attr => ({
                        ...attr,
                        cubeComponentType: 'Attribute'
                      })),
                  measures:
                    action.response.Measures
                      .map(meas => ({
                        ...meas,
                        cubeComponentType: 'Measure'
                      }))
                }
              }
            };
          case FILE_MAPPING_WIZARD_FILE_MAPPING_CREATE:
            return {
              csvForm: {
                file: null,
                separator: ';',
                delimiter: null,
                hasHeader: true,
                hasDotStatFormat: false
              },
              cubeId: null,
              cube: null,
              csvServerPath: null,
              csvHeader: null,
              components: [],
              selectedColumnName: null,
              selectedCubeComponentCode: null,
              selectedComponent: null,
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
      isVisible: false,
      isCubeComponentsVisible: false,
      isComponentsVisible: false,
      step: FILE_MAPPING_WIZARD_STEP_CUBE_SELECTION,
      name: null,
      tid: null,
      description: null
    },
    action
  ) => {
    switch (action.type) {
      case FILE_MAPPING_WIZARD_COMPONENTS_SHOW:
        return {
          ...state,
          isComponentsVisible: true
        };
      case FILE_MAPPING_WIZARD_COMPONENTS_HIDE:
        return {
          ...state,
          isComponentsVisible: false
        };
      case FILE_MAPPING_WIZARD_CUBE_SELECTOR_CUBE_SET:
        return {
          ...state,
          name: `MAPP_${new Date().getMilliseconds()}_${action.cubeCode.toUpperCase()}`,
        };
      case FILE_MAPPING_WIZARD_CUBE_SELECTOR_CUBE_UNSET:
        return {
          ...state,
          name: null
        };
      case FILE_MAPPING_WIZARD_STEP_SET:
        return {
          ...state,
          step: action.step
        };
      case FILE_MAPPING_WIZARD_CUBE_COMPONENTS_SHOW:
        return {
          ...state,
          isCubeComponentsVisible: true
        };
      case FILE_MAPPING_WIZARD_CUBE_COMPONENTS_HIDE:
        return {
          ...state,
          isCubeComponentsVisible: false
        };
      case FILE_MAPPING_WIZARD_FORM_CHANGE:
        const {
          name,
          tid,
          description
        } = action.fields;
        return {
          ...state,
          name: name !== undefined ? name : state.name,
          tid: tid !== undefined ? tid : state.tid,
          description: description !== undefined ? description : state.description
        };
      case FILE_MAPPING_WIZARD_FILE_MAPPING_CREATE:
        return {
          ...state,
          step: FILE_MAPPING_WIZARD_STEP_CUBE_SELECTION
        };
      case FILE_MAPPING_WIZARD_SHOW:
        return {
          ...state,
          isVisible: true
        };
      case FILE_MAPPING_WIZARD_HIDE:
        return {
          ...state,
          isVisible: false,
          isCubeComponentsVisible: false,
          step: FILE_MAPPING_WIZARD_STEP_CUBE_SELECTION,
          name: null,
          description: null,
          tid: null,
          isComponentsVisible: false,
        };
      case REQUEST_START:
        switch (action.label) {
          default:
            return state;
        }
      case REQUEST_ERROR:
        switch (action.label) {
          default:
            return state;
        }
      case REQUEST_SUCCESS:
        switch (action.label) {
          case FILE_MAPPING_WIZARD_FILE_MAPPING_CREATE:
            return {
              ...state,
              isVisible: false,
              isCubeComponentsVisibile: false,
              isComponentsVisible: false,
              step: FILE_MAPPING_WIZARD_STEP_CUBE_SELECTION,
              name: null,
              description: null,
              tid: null
            };
          default:
            return state;
        }
      default:
        return state;
    }
  }
});

export default fileMappingWizardReducer;
