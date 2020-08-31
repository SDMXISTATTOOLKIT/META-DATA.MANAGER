import {getRequest, postRequest} from '../../../../middlewares/api/actions';
import {getCsvHeaderUrl, getCubeUrl, getFileMappingUrl} from '../../../../constants/urls';

export const FILE_MAPPING_WIZARD_SHOW = 'FILE_MAPPING_WIZARD_SHOW';
export const FILE_MAPPING_WIZARD_HIDE = 'FILE_MAPPING_WIZARD_HIDE';
export const FILE_MAPPING_WIZARD_CSV_HEADER_GET = 'FILE_MAPPING_WIZARD_CSV_HEADER_GET';
export const FILE_MAPPING_WIZARD_CUBE_READ = 'FILE_MAPPING_WIZARD_CUBE_READ';
export const FILE_MAPPING_WIZARD_COLUMN_SELECT = 'FILE_MAPPING_WIZARD_COLUMN_SELECT';
export const FILE_MAPPING_WIZARD_FILE_MAPPING_CREATE = 'FILE_MAPPING_WIZARD_FILE_MAPPING_CREATE';
export const FILE_MAPPING_WIZARD_STEP_SET = 'FILE_MAPPING_WIZARD_STEP_SET';
export const FILE_MAPPING_WIZARD_FORM_CHANGE = 'FILE_MAPPING_WIZARD_FORM_CHANGE';
export const FILE_MAPPING_WIZARD_CUBE_COMPONENTS_SHOW = 'FILE_MAPPING_WIZARD_CUBE_COMPONENTS_SHOW';
export const FILE_MAPPING_WIZARD_CUBE_COMPONENTS_HIDE = 'FILE_MAPPING_WIZARD_CUBE_COMPONENTS_HIDE';
export const FILE_MAPPING_WIZARD_COMPONENTS_SHOW = 'FILE_MAPPING_WIZARD_COMPONENTS_SHOW';
export const FILE_MAPPING_WIZARD_COMPONENTS_HIDE = 'FILE_MAPPING_WIZARD_COMPONENTS_HIDE';

export const showFileMappingWizard = () => ({
  type: FILE_MAPPING_WIZARD_SHOW
});

export const hideFileMappingWizard = () => ({
  type: FILE_MAPPING_WIZARD_HIDE
});

export const changeFileMappingWizardForm = fields => ({
  type: FILE_MAPPING_WIZARD_FORM_CHANGE,
  fields
});

export const getFileMappingWizardCsvHeader = (csvSeparator, csvDelimiter, csvHasHeader, csvServerPath, csvHasDotStatFormat) => ({
  ...getRequest(
    FILE_MAPPING_WIZARD_CSV_HEADER_GET,
    getCsvHeaderUrl(csvSeparator, csvDelimiter, csvHasHeader, csvServerPath)
  ),
  csvHasDotStatFormat
});

export const readFileMappingWizardCube = cubeId => getRequest(
  FILE_MAPPING_WIZARD_CUBE_READ,
  getCubeUrl(cubeId)
);

export const selectFileMappingWizardColumn = columnName => ({
  type: FILE_MAPPING_WIZARD_COLUMN_SELECT,
  columnName
});

export const createFileMappingWizardFileMapping = (name, description, tid, cubeId, components, csvForm) => postRequest(
  FILE_MAPPING_WIZARD_FILE_MAPPING_CREATE,
  getFileMappingUrl(),
  {
    Name: name,
    Description: description !== null && description.length > 0 ? description : null,
    Tid: tid !== null && tid.length > 0 ? tid : null,
    IDCube: cubeId,
    Components: components.map(comp => ({
      ColumnName: comp.columnName,
      CubeComponentCode: comp.cubeComponentCode,
      CubeComponentType: comp.cubeComponentType
    })),
    CSVDelimiter: csvForm.delimiter,
    CSVSeparator: csvForm.separator,
    HasHeader: csvForm.hasHeader,
    HasSpecialTimePeriod: csvForm.hasDotStatFormat
  },
  t => ({
    start: t('scenes.dataManager.fileMapping.wizard.messages.fileMappingCreate.start'),
    success: t('scenes.dataManager.fileMapping.wizard.messages.fileMappingCreate.success')
  })
);

export const setFileMappingWizardStep = step => ({
  type: FILE_MAPPING_WIZARD_STEP_SET,
  step
});

export const showFileMappingWizardCubeComponents = () => ({
  type: FILE_MAPPING_WIZARD_CUBE_COMPONENTS_SHOW
});

export const hideFileMappingWizardCubeComponents = () => ({
  type: FILE_MAPPING_WIZARD_CUBE_COMPONENTS_HIDE
});

export const showFileMappingWizardComponents = () => ({
  type: FILE_MAPPING_WIZARD_COMPONENTS_SHOW
});

export const hideFileMappingWizardComponents = () => ({
  type: FILE_MAPPING_WIZARD_COMPONENTS_HIDE
});
