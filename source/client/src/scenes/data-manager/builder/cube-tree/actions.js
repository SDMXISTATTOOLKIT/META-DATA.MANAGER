import {getAllCubeUrl, getCubeUrl, getDcsUrl} from '../../../../constants/urls';
import {allRequest, deleteRequest, REQUEST_METHOD_GET} from '../../../../middlewares/api/actions';

export const BUILDER_CUBE_TREE_CATEGORISED_CUBES_READ = 'BUILDER_CUBE_TREE_CATEGORISED_CUBES_READ';
export const BUILDER_CUBE_TREE_CATEGORISED_CUBES_UPDATE = 'BUILDER_CUBE_TREE_CATEGORISED_CUBES_UPDATE';
export const BUILDER_CUBE_TREE_CUBE_SELECT = 'BUILDER_CUBE_TREE_CUBE_SELECT';
export const BUILDER_CUBE_TREE_CUBE_CATEGORY_SELECT = 'BUILDER_CUBE_TREE_CUBE_CATEGORY_SELECT';
export const BUILDER_CUBE_TREE_CUBE_CREATE = 'BUILDER_CUBE_TREE_CUBE_CREATE';
export const BUILDER_CUBE_TREE_CUBE_DELETE = 'BUILDER_CUBE_TREE_CUBE_DELETE';

export const readBuilderCubeTreeCategorisedCubes = () =>
  allRequest(
    BUILDER_CUBE_TREE_CATEGORISED_CUBES_READ,
    [REQUEST_METHOD_GET, REQUEST_METHOD_GET],
    [getAllCubeUrl(), getDcsUrl()]
  );

export const deleteBuilderCubeTreeCube = cubeId =>
  deleteRequest(
    BUILDER_CUBE_TREE_CUBE_DELETE,
    getCubeUrl(cubeId),
    t => ({
      success: t('scenes.dataManager.builder.cubeTree.messages.cubeDelete.success')
    })
  );

export const selectBuilderCubeTreeCube = cubeId => ({
  type: BUILDER_CUBE_TREE_CUBE_SELECT,
  cubeId
});
export const selectBuilderCubeTreeCubeCategory = (cubeCategoryId, cubeCategoryCode) => ({
  type: BUILDER_CUBE_TREE_CUBE_CATEGORY_SELECT,
  cubeCategoryId,
  cubeCategoryCode
});
export const createBuilderCubeTreeCube = cubeCategoryId => ({
  type: BUILDER_CUBE_TREE_CUBE_CREATE,
  cubeCategoryId,
});

export const updateBuilderCubeTreeCategorisedCubes = () =>
  allRequest(
    BUILDER_CUBE_TREE_CATEGORISED_CUBES_READ,
    [REQUEST_METHOD_GET, REQUEST_METHOD_GET, REQUEST_METHOD_GET],
    [getAllCubeUrl(), getCubeUrl(), getDcsUrl()]
  );
