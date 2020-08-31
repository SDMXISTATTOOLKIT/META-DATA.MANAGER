import {allRequest, deleteRequest, getRequest, REQUEST_METHOD_DELETE} from '../../../../middlewares/api/actions';
import {getCubeUrl, getFileMappingUrl} from '../../../../constants/urls';

export const FILE_MAPPING_LIST_FILE_MAPPINGS_READ = 'FILE_MAPPING_LIST_FILE_MAPPINGS_READ';
export const FILE_MAPPING_LIST_FILE_MAPPING_SHOW = 'FILE_MAPPING_LIST_FILE_MAPPING_SHOW';
export const FILE_MAPPING_LIST_FILE_MAPPING_HIDE = 'FILE_MAPPING_LIST_FILE_MAPPING_HIDE';
export const FILE_MAPPING_LIST_FILE_MAPPING_READ = 'FILE_MAPPING_LIST_FILE_MAPPING_READ';
export const FILE_MAPPING_LIST_FILE_MAPPING_DELETE = 'FILE_MAPPING_LIST_FILE_MAPPING_DELETE';
export const FILE_MAPPING_LIST_FILE_MAPPING_CUBE_READ = 'FILE_MAPPING_LIST_FILE_MAPPING_CUBE_READ';
export const FILE_MAPPING_LIST_FILE_MAPPING_DELETE_ALL = 'FILE_MAPPING_LIST_FILE_MAPPING_DELETE_ALL';

export const readFileMappingListFileMappings = () =>
  getRequest(
    FILE_MAPPING_LIST_FILE_MAPPINGS_READ,
    getFileMappingUrl(),
  );

export const showFileMappingListFileMapping = fileMappingId => ({
  type: FILE_MAPPING_LIST_FILE_MAPPING_SHOW,
  fileMappingId
});

export const hideFileMappingListFileMapping = () => ({
  type: FILE_MAPPING_LIST_FILE_MAPPING_HIDE
});

export const readFileMappingListFileMapping = fileMappingId =>
  getRequest(
    FILE_MAPPING_LIST_FILE_MAPPING_READ,
    getFileMappingUrl(fileMappingId)
  );

export const readFileMappingListFileMappingCube = cubeId =>
  getRequest(
    FILE_MAPPING_LIST_FILE_MAPPING_CUBE_READ,
    getCubeUrl(cubeId)
  );

export const deleteFileMappingListFileMapping = fileMappingId =>
  deleteRequest(
    FILE_MAPPING_LIST_FILE_MAPPING_DELETE,
    getFileMappingUrl(fileMappingId),
    t => ({
      success: t('scenes.dataManager.fileMapping.list.messages.fileMappingDelete.success')
    })
  );

export const deleteFileMappingListFileMappingAll = fileMappingIds =>
  allRequest(
    FILE_MAPPING_LIST_FILE_MAPPING_DELETE_ALL,
    fileMappingIds.map(() => REQUEST_METHOD_DELETE),
    fileMappingIds.map(id => getFileMappingUrl(id)),
    null,
    t => ({
      success: t('scenes.dataManager.fileMapping.list.messages.fileMappingDeleteAll.success')
    })
  );
