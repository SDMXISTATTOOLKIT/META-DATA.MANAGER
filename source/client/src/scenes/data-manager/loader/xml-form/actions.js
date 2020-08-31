import {allRequest, getRequest, postRequest, REQUEST_METHOD_GET} from '../../../../middlewares/api/actions';
import {getCubeUrl, getDcsUrl, getImportSdmxMlUrl, getUploadFileOnServerUrl} from '../../../../constants/urls';

export const LOADER_XML_FORM_SHOW = 'LOADER_XML_FORM_SHOW';
export const LOADER_XML_FORM_CHANGE = 'LOADER_XML_FORM_CHANGE';
export const LOADER_XML_FORM_CUBE_TREE_SHOW = 'LOADER_XML_FORM_CUBE_TREE_SHOW';
export const LOADER_XML_FORM_CUBE_TREE_HIDE = 'LOADER_XML_FORM_CUBE_TREE_HIDE';
export const LOADER_XML_FORM_CUBE_SET = 'LOADER_XML_FORM_CUBE_SET';
export const LOADER_XML_FORM_CUBE_UNSET = 'LOADER_XML_FORM_CUBE_UNSET';
export const LOADER_XML_FORM_CUBE_READ = 'LOADER_XML_FORM_CUBE_READ';
export const LOADER_XML_FORM_CATEGORISED_CUBES_READ = 'LOADER_XML_FORM_CATEGORISED_CUBES_READ';
export const LOADER_XML_FORM_FILE_UPLOAD = 'LOADER_XML_FORM_FILE_UPLOAD';
export const LOADER_XML_FORM_SUBMIT = 'LOADER_XML_FORM_SUBMIT';
export const LOADER_XML_FORM_IGNORE_CONCURRENT_UPLOAD_CONFIRM_HIDE = 'LOADER_XML_FORM_IGNORE_CONCURRENT_UPLOAD_CONFIRM_HIDE';

export const changeLoaderXmlForm = fields => ({
  type: LOADER_XML_FORM_CHANGE,
  fields
});

export const showLoaderXmlFormCubeTree = () => ({
  type: LOADER_XML_FORM_CUBE_TREE_SHOW
});

export const hideLoaderXmlFormCubeTree = () => ({
  type: LOADER_XML_FORM_CUBE_TREE_HIDE
});

export const setLoaderXmlFormCube = cubeId => ({
  type: LOADER_XML_FORM_CUBE_SET,
  cubeId
});

export const unsetLoaderXmlFormCube = () => ({
  type: LOADER_XML_FORM_CUBE_UNSET
});

export const readLoaderXmlFormCube = cubeId => getRequest(
  LOADER_XML_FORM_CUBE_READ,
  getCubeUrl(cubeId)
);

export const readLoaderXmlFormCategorisedCubes = () =>
  allRequest(
    LOADER_XML_FORM_CATEGORISED_CUBES_READ,
    [REQUEST_METHOD_GET, REQUEST_METHOD_GET],
    [getCubeUrl(), getDcsUrl()]
  );

export const uploadLoaderXmlFormFile = (file, cubeId) => {
  let fileFormData = new FormData();
  fileFormData.append('file', file);
  return postRequest(
    LOADER_XML_FORM_FILE_UPLOAD,
    getUploadFileOnServerUrl(cubeId),
    fileFormData,
    t => ({
      start: t('scenes.dataManager.loader.xmlForm.messages.fileUpload.start'),
      success: t('scenes.dataManager.loader.xmlForm.messages.fileUpload.success')
    })
  );
};

export const submitLoaderXmlForm = (importType, cubeId, dsdId, dsdAgencyId, dsdVersion, filePath, tid, cubeCode, embargo, refreshProdDf, checkFiltAttributes, ignoreConcurrentUpload) => ({
  ...getRequest(
    LOADER_XML_FORM_SUBMIT,
    getImportSdmxMlUrl(importType, cubeId, dsdId, dsdAgencyId, dsdVersion, filePath, tid, embargo, refreshProdDf, checkFiltAttributes, ignoreConcurrentUpload)
  ),
  reportFileNameId: cubeCode
});

export const showLoaderXmlForm = () => ({
  type: LOADER_XML_FORM_SHOW
});

export const onHideLoaderXmlFormIgnoreConcurrentUploadConfirm = () => ({
  type: LOADER_XML_FORM_IGNORE_CONCURRENT_UPLOAD_CONFIRM_HIDE
});