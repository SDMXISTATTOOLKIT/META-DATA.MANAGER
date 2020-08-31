import { postRequest } from '../../../../../middlewares/api/actions';
import { getUploadFileOnServerUrl } from '../../../../../constants/urls';

export const FILE_MAPPING_WIZARD_CSV_FORM_CHANGE = 'FILE_MAPPING_WIZARD_CSV_FORM_CHANGE';
export const FILE_MAPPING_WIZARD_CSV_FORM_SUBMIT = 'FILE_MAPPING_WIZARD_CSV_FORM_SUBMIT';

export const changeFileMappingWizardCsvForm = fields => ({
  type: FILE_MAPPING_WIZARD_CSV_FORM_CHANGE,
  fields
});

export const submitFileMappingWizardCsvForm = file => {

  let fileFormData = new FormData();
  fileFormData.append('file', file);

  return postRequest(
    FILE_MAPPING_WIZARD_CSV_FORM_SUBMIT,
    getUploadFileOnServerUrl(),
    fileFormData,
    t => ({
      start: t('scenes.dataManager.fileMapping.wizard.csvForm.messages.submit.start'),
      success: t("scenes.dataManager.fileMapping.wizard.csvForm.messages.submit.success")
    })
  );
};
