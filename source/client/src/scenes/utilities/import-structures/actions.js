import {postRequest} from "../../../middlewares/api/actions";
import {getCheckImportedFileXmlSdmxObjectsUrl, getImportFileXmlSdmxObjectsUrl} from "../../../constants/urls";

export const IMPORT_STRUCTURES_FORM_CHANGE = 'IMPORT_STRUCTURES_FORM_CHANGE';
export const IMPORT_STRUCTURES_FILE_UPLOAD = 'IMPORT_STRUCTURES_FILE_UPLOAD';
export const IMPORT_STRUCTURES_SUBMIT = 'IMPORT_STRUCTURES_SUBMIT';
export const IMPORT_STRUCTURES_REPORT_HIDE = 'IMPORT_STRUCTURES_REPORT_HIDE';
export const IMPORT_STRUCTURES_RESET = 'IMPORT_STRUCTURES_RESET';

export const IMPORT_STRUCTURES_ITEM_SELECT = 'IMPORT_STRUCTURES_ITEM_SELECT';
export const IMPORT_STRUCTURES_ALL_ITEMS_SELECT = 'IMPORT_STRUCTURES_ALL_ITEMS_SELECT';

export const changeImportStructuresForm = fields => ({
  type: IMPORT_STRUCTURES_FORM_CHANGE,
  fields
});

export const uploadImportStructuresFile = file => {
  let fileFormData = new FormData();
  fileFormData.append('file', file);
  return postRequest(
    IMPORT_STRUCTURES_FILE_UPLOAD,
    getCheckImportedFileXmlSdmxObjectsUrl(),
    fileFormData,
    t => ({
      success: t('scenes.utilities.importStructures.messages.fileUpload.success')
    })
  );
};

export const submitImportStructures = (structures, hash) => postRequest(
  IMPORT_STRUCTURES_SUBMIT,
  getImportFileXmlSdmxObjectsUrl(),
  {
    importedItem: structures,
    hashImport: hash
  }
);

export const hideImportStructuresReport = () => ({
  type: IMPORT_STRUCTURES_REPORT_HIDE
});

export const resetImportStructures = () => ({
  type: IMPORT_STRUCTURES_RESET
});

export const selectImportStructuresItem = (item, selected) => ({
  type: IMPORT_STRUCTURES_ITEM_SELECT,
  item,
  selected
});

export const selectImportStructuresAllItems = items => ({
  type: IMPORT_STRUCTURES_ALL_ITEMS_SELECT,
  items
});
