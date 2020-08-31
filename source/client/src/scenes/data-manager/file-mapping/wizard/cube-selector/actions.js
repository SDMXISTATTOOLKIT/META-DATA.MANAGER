import { allRequest, REQUEST_METHOD_GET } from '../../../../../middlewares/api/actions';
import { getCubeUrl, getDcsUrl } from '../../../../../constants/urls';

export const FILE_MAPPING_WIZARD_CUBE_SELECTOR_CATEGORISED_CUBES_READ = 'FILE_MAPPING_WIZARD_CUBE_SELECTOR_CATEGORISED_CUBES_READ';
export const FILE_MAPPING_WIZARD_CUBE_SELECTOR_CUBE_SET = 'FILE_MAPPING_WIZARD_CUBE_SELECTOR_CUBE_SET';
export const FILE_MAPPING_WIZARD_CUBE_SELECTOR_CUBE_UNSET = 'FILE_MAPPING_WIZARD_CUBE_SELECTOR_CUBE_UNSET';

export const readFileMappingWizardCubeSelectorCategorisedCubes = () =>
  allRequest(
    FILE_MAPPING_WIZARD_CUBE_SELECTOR_CATEGORISED_CUBES_READ,
    [REQUEST_METHOD_GET, REQUEST_METHOD_GET],
    [getCubeUrl(), getDcsUrl()]
  );

export const setFileMappingWizardCubeSelectorCube = (cubeId, cubeCode) => ({
  type: FILE_MAPPING_WIZARD_CUBE_SELECTOR_CUBE_SET,
  cubeId,
  cubeCode
});

export const unsetFileMappingWizardCubeSelectorCube = () => ({
  type: FILE_MAPPING_WIZARD_CUBE_SELECTOR_CUBE_UNSET
});
