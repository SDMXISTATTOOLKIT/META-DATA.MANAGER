export const FILE_MAPPING_WIZARD_COMPONENT_MAPPER_COMPONENT_SELECT = 'FILE_MAPPING_WIZARD_COMPONENT_MAPPER_COMPONENT_SELECT';
export const FILE_MAPPING_WIZARD_COMPONENT_MAPPER_COMPONENT_ADD = 'FILE_MAPPING_WIZARD_COMPONENT_MAPPER_COMPONENT_ADD';
export const FILE_MAPPING_WIZARD_COMPONENT_MAPPER_COMPONENT_ADD_ALL = 'FILE_MAPPING_WIZARD_COMPONENT_MAPPER_COMPONENT_ADD_ALL';
export const FILE_MAPPING_WIZARD_COMPONENT_MAPPER_COMPONENT_REMOVE = 'FILE_MAPPING_WIZARD_COMPONENT_MAPPER_COMPONENT_REMOVE';
export const FILE_MAPPING_WIZARD_COMPONENT_MAPPER_COMPONENT_REMOVE_ALL = 'FILE_MAPPING_WIZARD_COMPONENT_MAPPER_COMPONENT_REMOVE_ALL';

export const addFileMappingWizardComponentMapperComponent = (columnName, cubeComponentCode) => ({
  type: FILE_MAPPING_WIZARD_COMPONENT_MAPPER_COMPONENT_ADD,
  columnName,
  cubeComponentCode
});
export const removeFileMappingWizardComponentMapperComponent = (columnName, cubeComponentCode) => ({
  type: FILE_MAPPING_WIZARD_COMPONENT_MAPPER_COMPONENT_REMOVE,
  columnName,
  cubeComponentCode
});
export const removeAllFileMappingWizardComponentMapperComponent = () => ({
  type: FILE_MAPPING_WIZARD_COMPONENT_MAPPER_COMPONENT_REMOVE_ALL
});
export const addAllFileMappingWizardComponentMapperComponent = () => ({
  type: FILE_MAPPING_WIZARD_COMPONENT_MAPPER_COMPONENT_ADD_ALL
});

export const selectFileMappingWizardComponentMapperComponent = (columnName, cubeComponentCode) => ({
  type: FILE_MAPPING_WIZARD_COMPONENT_MAPPER_COMPONENT_SELECT,
  columnName,
  cubeComponentCode
});
