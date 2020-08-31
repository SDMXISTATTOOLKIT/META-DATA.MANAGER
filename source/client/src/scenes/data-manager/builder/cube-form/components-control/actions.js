export const BUILDER_CUBE_FORM_COMPONENTS_CONTROL_ATTRIBUTE_SHOW = 'BUILDER_CUBE_FORM_COMPONENTS_CONTROL_ATTRIBUTE_SHOW';
export const BUILDER_CUBE_FORM_COMPONENTS_CONTROL_ATTRIBUTE_HIDE = 'BUILDER_CUBE_FORM_COMPONENTS_CONTROL_ATTRIBUTE_HIDE';
export const BUILDER_CUBE_FORM_COMPONENTS_CONTROL_DIMENSION_SHOW = 'BUILDER_CUBE_FORM_COMPONENTS_CONTROL_DIMENSION_SHOW';
export const BUILDER_CUBE_FORM_COMPONENTS_CONTROL_DIMENSION_HIDE = 'BUILDER_CUBE_FORM_COMPONENTS_CONTROL_DIMENSION_HIDE';
export const BUILDER_CUBE_FORM_COMPONENTS_CONTROL_MEASURE_SHOW = 'BUILDER_CUBE_FORM_COMPONENTS_CONTROL_MEASURE_SHOW';
export const BUILDER_CUBE_FORM_COMPONENTS_CONTROL_MEASURE_HIDE = 'BUILDER_CUBE_FORM_COMPONENTS_CONTROL_MEASURE_HIDE';

export const showBuilderCubeFormComponentsControlAttribute = attributeId => ({
  type: BUILDER_CUBE_FORM_COMPONENTS_CONTROL_ATTRIBUTE_SHOW,
  attributeId
});

export const hideBuilderCubeFormComponentsControlAttribute = () => ({
  type: BUILDER_CUBE_FORM_COMPONENTS_CONTROL_ATTRIBUTE_HIDE
});

export const showBuilderCubeFormComponentsControlDimension = dimensionId => ({
  type: BUILDER_CUBE_FORM_COMPONENTS_CONTROL_DIMENSION_SHOW,
  dimensionId
});

export const hideBuilderCubeFormComponentsControlDimension = () => ({
  type: BUILDER_CUBE_FORM_COMPONENTS_CONTROL_DIMENSION_HIDE
});

export const showBuilderCubeFormComponentsControlMeasure = () => ({
  type: BUILDER_CUBE_FORM_COMPONENTS_CONTROL_MEASURE_SHOW,
});

export const hideBuilderCubeFormComponentsControlMeasure = () => ({
  type: BUILDER_CUBE_FORM_COMPONENTS_CONTROL_MEASURE_HIDE
});