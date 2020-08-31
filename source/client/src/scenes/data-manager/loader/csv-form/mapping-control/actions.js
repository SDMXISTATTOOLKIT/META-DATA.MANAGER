import { getRequest } from '../../../../../middlewares/api/actions';
import { getCubeUrl, getFileMappingUrl } from '../../../../../constants/urls';

export const LOADER_CSV_FORM_MAPPING_CONTROL_MAPPING_SET = 'LOADER_CSV_FORM_MAPPING_CONTROL_MAPPING_SET';
export const LOADER_CSV_FORM_MAPPING_CONTROL_MAPPING_UNSET = 'LOADER_CSV_FORM_MAPPING_CONTROL_MAPPING_UNSET';
export const LOADER_CSV_FORM_MAPPING_CONTROL_MAPPINGS_SHOW = 'LOADER_CSV_FORM_MAPPING_CONTROL_MAPPINGS_SHOW';
export const LOADER_CSV_FORM_MAPPING_CONTROL_DETAIL_MAPPING_SHOW = 'LOADER_CSV_FORM_MAPPING_CONTROL_DETAIL_MAPPING_SHOW';
export const LOADER_CSV_FORM_MAPPING_CONTROL_SELECTED_MAPPING_SHOW = 'LOADER_CSV_FORM_MAPPING_CONTROL_SELECTED_MAPPING_SHOW';
export const LOADER_CSV_FORM_MAPPING_CONTROL_MAPPINGS_HIDE = 'LOADER_CSV_FORM_MAPPING_CONTROL_MAPPINGS_HIDE';
export const LOADER_CSV_FORM_MAPPING_CONTROL_DETAIL_MAPPING_HIDE = 'LOADER_CSV_FORM_MAPPING_CONTROL_DETAIL_MAPPING_HIDE';
export const LOADER_CSV_FORM_MAPPING_CONTROL_SELECTED_MAPPING_HIDE = 'LOADER_CSV_FORM_MAPPING_CONTROL_SELECTED_MAPPING_HIDE';
export const LOADER_CSV_FORM_MAPPING_CONTROL_MAPPINGS_READ = 'LOADER_CSV_FORM_MAPPING_CONTROL_MAPPINGS_READ';
export const LOADER_CSV_FORM_MAPPING_CONTROL_DETAIL_MAPPING_READ = 'LOADER_CSV_FORM_MAPPING_CONTROL_DETAIL_MAPPING_READ';
export const LOADER_CSV_FORM_MAPPING_CONTROL_DETAIL_MAPPING_CUBE_READ = 'LOADER_CSV_FORM_MAPPING_CONTROL_DETAIL_MAPPING_CUBE_READ';
export const LOADER_CSV_FORM_MAPPING_CONTROL_SELECTED_MAPPING_READ = 'LOADER_CSV_FORM_MAPPING_CONTROL_SELECTED_MAPPING_READ';
export const LOADER_CSV_FORM_MAPPING_CONTROL_SELECTED_MAPPING_CUBE_READ = 'LOADER_CSV_FORM_MAPPING_CONTROL_SELECTED_MAPPING_CUBE_READ';

export const setLoaderCsvFormMappingControlMapping = mappingId => ({
  type: LOADER_CSV_FORM_MAPPING_CONTROL_MAPPING_SET,
  mappingId
});

export const unsetLoaderCsvFormMappingControlMapping = () => ({
  type: LOADER_CSV_FORM_MAPPING_CONTROL_MAPPING_UNSET
});

export const showLoaderCsvFormMappingControlMappings = () => ({
  type: LOADER_CSV_FORM_MAPPING_CONTROL_MAPPINGS_SHOW
});

export const showLoaderCsvFormMappingControlDetailMapping = mappingId => ({
  type: LOADER_CSV_FORM_MAPPING_CONTROL_DETAIL_MAPPING_SHOW,
  mappingId
});

export const showLoaderCsvFormMappingControlSelectedMapping = () => ({
  type: LOADER_CSV_FORM_MAPPING_CONTROL_SELECTED_MAPPING_SHOW,
});

export const hideLoaderCsvFormMappingControlMappings = () => ({
  type: LOADER_CSV_FORM_MAPPING_CONTROL_MAPPINGS_HIDE
});

export const hideLoaderCsvFormMappingControlDetailMapping = () => ({
  type: LOADER_CSV_FORM_MAPPING_CONTROL_DETAIL_MAPPING_HIDE
});


export const hideLoaderCsvFormMappingControlSelectedMapping = () => ({
  type: LOADER_CSV_FORM_MAPPING_CONTROL_SELECTED_MAPPING_HIDE
});

export const readLoaderCsvFormMappingControlMappings = () => getRequest(
  LOADER_CSV_FORM_MAPPING_CONTROL_MAPPINGS_READ,
  getFileMappingUrl()
);

export const readLoaderCsvFormMappingControlDetailMapping = mappingId => getRequest(
  LOADER_CSV_FORM_MAPPING_CONTROL_DETAIL_MAPPING_READ,
  getFileMappingUrl(mappingId)
);

export const readLoaderCsvFormMappingControlDetailMappingCube = cubeId => getRequest(
  LOADER_CSV_FORM_MAPPING_CONTROL_DETAIL_MAPPING_CUBE_READ,
  getCubeUrl(cubeId)
);

export const readLoaderCsvFormMappingControlSelectedMapping = mappingId => getRequest(
  LOADER_CSV_FORM_MAPPING_CONTROL_SELECTED_MAPPING_READ,
  getFileMappingUrl(mappingId)
);

export const readLoaderCsvFormMappingControlSelectedMappingCube = cubeId => getRequest(
  LOADER_CSV_FORM_MAPPING_CONTROL_SELECTED_MAPPING_CUBE_READ,
  getCubeUrl(cubeId)
);
