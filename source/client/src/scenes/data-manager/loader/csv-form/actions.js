import {getRequest, postRequest} from '../../../../middlewares/api/actions';
import {getImportCsvUrl, getUploadFileOnServerUrl} from '../../../../constants/urls';

export const LOADER_CSV_FORM_SHOW = 'LOADER_CSV_FORM_SHOW';
export const LOADER_CSV_FORM_CHANGE = 'LOADER_CSV_FORM_CHANGE';
export const LOADER_CSV_FORM_FILE_UPLOAD = 'LOADER_CSV_FORM_FILE_UPLOAD';
export const LOADER_CSV_FORM_SUBMIT = 'LOADER_CSV_FORM_SUBMIT';
export const LOADER_CSV_FORM_IGNORE_CONCURRENT_UPLOAD_CONFIRM_HIDE = 'LOADER_CSV_FORM_IGNORE_CONCURRENT_UPLOAD_CONFIRM_HIDE';

export const changeLoaderCsvForm = fields => ({
  type: LOADER_CSV_FORM_CHANGE,
  fields
});

export const uploadLoaderCsvFormFile = (file, mappingCubeId) => {
  let fileFormData = new FormData();
  fileFormData.append('file', file);

  return postRequest(
    LOADER_CSV_FORM_FILE_UPLOAD,
    getUploadFileOnServerUrl(mappingCubeId),
    fileFormData,
    t => ({
      start: t('scenes.dataManager.loader.csvForm.messages.fileUpload.start'),
      success: t('scenes.dataManager.loader.csvForm.messages.fileUpload.success')
    })
  );
};

export const submitLoaderCsvForm = (separator, delimiter, hasHeader, importType, cubeId, mappingId, filePath, tid, cubeCode, idMappingSpecialTimePeriod, embargo, refreshProdDf, checkFiltAttributes, ignoreConcurrentUpload) => ({
  ...getRequest(
    'LOADER_CSV_FORM_SUBMIT',
    getImportCsvUrl(separator, delimiter, hasHeader, importType, cubeId, mappingId, filePath, tid, idMappingSpecialTimePeriod, embargo, refreshProdDf, checkFiltAttributes, ignoreConcurrentUpload),
    t => ({
      start: t('scenes.dataManager.loader.csvForm.messages.submit.start'),
      success: t('scenes.dataManager.loader.csvForm.messages.submit.success')
    })
  ),
  reportFileNameId: cubeCode
});

export const showLoaderCsvForm = () => ({
  type: LOADER_CSV_FORM_SHOW
});

export const onHideLoaderCsvFormIgnoreConcurrentUploadConfirm = () => ({
  type: LOADER_CSV_FORM_IGNORE_CONCURRENT_UPLOAD_CONFIRM_HIDE
});