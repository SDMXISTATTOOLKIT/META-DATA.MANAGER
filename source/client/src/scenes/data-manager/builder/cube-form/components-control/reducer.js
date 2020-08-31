import {
  BUILDER_CUBE_FORM_COMPONENTS_CONTROL_ATTRIBUTE_HIDE,
  BUILDER_CUBE_FORM_COMPONENTS_CONTROL_ATTRIBUTE_SHOW,
  BUILDER_CUBE_FORM_COMPONENTS_CONTROL_DIMENSION_HIDE,
  BUILDER_CUBE_FORM_COMPONENTS_CONTROL_DIMENSION_SHOW,
  BUILDER_CUBE_FORM_COMPONENTS_CONTROL_MEASURE_HIDE,
  BUILDER_CUBE_FORM_COMPONENTS_CONTROL_MEASURE_SHOW
} from './actions';
import {reuseInReducer, reuseReducer} from "../../../../../utils/reduxReuse";
import codelistDetailModalReducer from "../../../../../redux-components/redux-codelist-detail-modal/reducer";

export const DM_BUILDER_CUBE_FORM_COMPONENT_CONTROL_CODELIST_DETAIL_PREFIX = "DM_BUILDER_CUBE_FORM_COMPONENT_CONTROL_CODELIST_DETAIL_PREFIX_";

const builderCubeFormComponentsControlReducer = (
  state = {
    attributeId: null,
    dimensionId: null,
    isMeasureVisible: false,
  },
  action
) => {
  switch (action.type) {
    case BUILDER_CUBE_FORM_COMPONENTS_CONTROL_ATTRIBUTE_SHOW:
      return {
        ...state,
        attributeId: action.attributeId
      };
    case BUILDER_CUBE_FORM_COMPONENTS_CONTROL_ATTRIBUTE_HIDE:
      return {
        ...state,
        attributeId: null
      };
    case BUILDER_CUBE_FORM_COMPONENTS_CONTROL_DIMENSION_SHOW:
      return {
        ...state,
        dimensionId: action.dimensionId
      };
    case BUILDER_CUBE_FORM_COMPONENTS_CONTROL_DIMENSION_HIDE:
      return {
        ...state,
        dimensionId: null
      };
    case BUILDER_CUBE_FORM_COMPONENTS_CONTROL_MEASURE_SHOW:
      return {
        ...state,
        isMeasureVisible: true
      };
    case BUILDER_CUBE_FORM_COMPONENTS_CONTROL_MEASURE_HIDE:
      return {
        ...state,
        isMeasureVisible: false
      };
    default:
      return state;
  }
};

export default reuseInReducer(builderCubeFormComponentsControlReducer, {
  codelistDetail: reuseReducer(codelistDetailModalReducer, DM_BUILDER_CUBE_FORM_COMPONENT_CONTROL_CODELIST_DETAIL_PREFIX)
});