import {REQUEST_ERROR, REQUEST_START, REQUEST_SUCCESS} from '../../../../middlewares/api/actions';
import {
  BUILDER_CUBE_FORM_CHANGE,
  BUILDER_CUBE_FORM_CUBE_READ,
  BUILDER_CUBE_FORM_DSD_READ,
  BUILDER_CUBE_FORM_SUBMIT
} from './actions';
import {
  BUILDER_CUBE_TREE_CATEGORISED_CUBES_READ,
  BUILDER_CUBE_TREE_CUBE_CREATE,
  BUILDER_CUBE_TREE_CUBE_DELETE,
  BUILDER_CUBE_TREE_CUBE_SELECT
} from '../cube-tree/actions';
import {combineReducers} from 'redux';
import builderCubeFormDsdControlReducer from './dsd-control/reducer';
import builderCubeFormComponentsControlReducer from './components-control/reducer';
import _ from 'lodash';
import {BUILDER_CUBE_FORM_DSD_CONTROL_DSD_SET, BUILDER_CUBE_FORM_DSD_CONTROL_DSD_UNSET} from './dsd-control/actions';
import {
  getDsdFromSdmxJsonStructure,
  getSdmxStructuresFromSdmxJson,
  getStringFromArtefactTriplet
} from '../../../../utils/sdmxJson';
import {reuseInReducer, reuseReducer} from "../../../../utils/reduxReuse";
import dsdDetailModalReducer from "../../../../redux-components/redux-dsd-detail-modal/reducer";
import {getCurrentNodeConfig} from "../../../../middlewares/current-node-config/middleware";

export const DM_BUILDER_CUBE_FORM_PREFIX = "DM_BUILDER_CUBE_FORM_PREFIX_";

const builderCubeFormReducer = combineReducers({
  components: combineReducers({
    dsdControl: builderCubeFormDsdControlReducer,
    componentsControl: builderCubeFormComponentsControlReducer
  }),
  shared: reuseInReducer(
    (
      state = {
        cube: null,
        dsd: null,
      },
      action
    ) => {
      switch (action.type) {
        case BUILDER_CUBE_TREE_CUBE_CREATE:
          return {
            ...state,
            cube: {
              Code: null,
              IDCat: action.cubeCategoryId,
              labels: null,
              DSDCode: null,
              observedValueCanBeAlphanumeric: false,
              cubeComponents: null
            }
          };
        case BUILDER_CUBE_FORM_DSD_CONTROL_DSD_SET:
          return {
            ...state,
            cube: {
              ...state.cube,
              DSDCode: getStringFromArtefactTriplet(action.dsdTriplet)
            }
          };
        case BUILDER_CUBE_FORM_DSD_CONTROL_DSD_UNSET:
          return {
            ...state,
            cube: {
              ...state.cube,
              DSDCode: null,
              cubeComponents: null
            }
          };

        case BUILDER_CUBE_TREE_CUBE_SELECT:
          if (state.cube === null || action.cubeId !== state.cube.IDCube) {
            return {
              ...state,
              cube: null,
              dsd: null,
            };
          } else {
            return state;
          }
        case BUILDER_CUBE_FORM_CHANGE:
          return {
            ...state,
            cube: {
              ...state.cube,
              ...action.fields
            }
          };
        case REQUEST_START:
          switch (action.label) {
            case BUILDER_CUBE_FORM_CUBE_READ:
              return {
                ...state,
                cube: null
              };
            case BUILDER_CUBE_FORM_DSD_READ:
              return {
                ...state,
                dsd: null,
              };
            default:
              return state;
            case BUILDER_CUBE_TREE_CATEGORISED_CUBES_READ:
              return {
                ...state,
                cube: null
              };
          }
        case REQUEST_ERROR:
          switch (action.label) {
            case BUILDER_CUBE_FORM_DSD_READ:
              return {
                ...state,
                cube: {
                  ...state.cube,
                  DSDCode: null
                }
              };
            default:
              return state;
          }
        case REQUEST_SUCCESS: {
          switch (action.label) {
            case BUILDER_CUBE_FORM_CUBE_READ:
              return {
                ...state,
                cube: {
                  ...action.response,
                  observedValueCanBeAlphanumeric: action.response.Measures[0].IsAlphanumeric,
                  cubeComponents: null
                }
              };
            case BUILDER_CUBE_FORM_DSD_READ:
              if (state.cube !== null) {
                const dsd = getDsdFromSdmxJsonStructure(
                  getSdmxStructuresFromSdmxJson(action.response)[0],
                  getCurrentNodeConfig(action).annotations
                );
                if (dsd.dataStructureComponents.dimensionList.timeDimensions === undefined) {
                  dsd.dataStructureComponents.dimensionList.timeDimensions = [];
                }
                const getCubeComponents = (cube, dsd) => ({
                  dimensions:
                    [
                      ...dsd.dataStructureComponents.dimensionList.dimensions
                        .filter(dsdAttr =>
                          cube === null || cube.Dimensions.filter(cubeAttr => cubeAttr.Code === dsdAttr.id).length > 0)
                        .map(dim => ({
                          ...dim,
                          Code: dim.id
                        })),
                      ...(dsd.dataStructureComponents.dimensionList.measureDimensions || [])
                        .filter(dsdAttr =>
                          cube === null || cube.Dimensions.filter(cubeAttr => cubeAttr.Code === dsdAttr.id).length > 0)
                        .map(dim => ({
                          ...dim,
                          Code: dim.id
                        })),
                    ],
                  timeDimensions:
                    dsd.dataStructureComponents.dimensionList.timeDimensions
                      .filter(dsdAttr =>
                        cube === null ||
                        cube.Dimensions.filter(cubeAttr => cubeAttr.Code === dsdAttr.id).length > 0)
                      .map(dim => ({
                        ...dim,
                        Code: dim.id
                      })),
                  tidAttributes: cube === null ? [{Code: 'TID'}] : cube.Attributes.filter(attr => attr.IsTid),
                  attributes:
                    dsd.dataStructureComponents.attributeList
                      ? dsd.dataStructureComponents.attributeList.attributes
                        .filter(dsdAttr =>
                          cube === null || cube.Attributes.filter(cubeAttr => cubeAttr.Code === dsdAttr.id).length > 0)
                        .map(attr => ({
                          ...attr,
                          Code: attr.id,
                          otherGroupDimensions:
                            attr.attributeRelationship && attr.attributeRelationship.attachmentGroups &&
                            attr.attributeRelationship.attachmentGroups[0] && dsd.dataStructureComponents.groups &&
                            dsd.dataStructureComponents.groups.find(({id}) => id === attr.attributeRelationship.attachmentGroups[0])
                              ? dsd.dataStructureComponents.groups
                                .find(({id}) => id === attr.attributeRelationship.attachmentGroups[0]).groupDimensions.filter(id => id !== attr.id)
                              : null
                        }))
                      : [],
                  measures:
                    [dsd.dataStructureComponents.measureList.primaryMeasure]
                      .map(meas => ({
                        ...meas,
                        Code: meas.id
                      })),
                });
                return {
                  ...state,
                  dsd,
                  cube: {
                    ...state.cube,
                    cubeComponents:
                      _(getCubeComponents(state.cube.IDCube !== undefined ? state.cube : null, dsd))
                        .mapValues(compArr =>
                          compArr.map(comp =>
                            ({
                              ...comp,
                              checked: (!comp.Code || comp.Code !== 'TID') &&
                                (comp.assignmentStatus === undefined || comp.assignmentStatus === 'Mandatory'),
                              disabled: (!comp.Code || comp.Code !== 'TID') &&
                                (comp.assignmentStatus === undefined || comp.assignmentStatus === 'Mandatory')
                            })))
                        .value()
                  }
                };
              } else {
                return state;
              }
            case BUILDER_CUBE_FORM_SUBMIT:
            case BUILDER_CUBE_TREE_CUBE_DELETE:
              return {
                ...state,
                cube: null,
                dsd: null
              };
            default:
              return state;
          }
        }
        default:
          return state;
      }
    }, {
      cubeFormDsd: reuseReducer(dsdDetailModalReducer, DM_BUILDER_CUBE_FORM_PREFIX)
    })
});

export default builderCubeFormReducer;
