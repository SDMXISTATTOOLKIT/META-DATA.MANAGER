import {getRequest, postRequest} from "../../../middlewares/api/actions";
import {
  getCategorySchemeUrl,
  getCodelistUrl,
  getCompareItemsForFileUrl,
  getCompareItemsUrl,
  getConceptSchemeUrl
} from "../../../constants/urls";
import {
  COMPARE_ITEM_SCHEMES_ARTEFACT_TYPE_CATEGORY_SCHEME,
  COMPARE_ITEM_SCHEMES_ARTEFACT_TYPE_CODELIST,
  COMPARE_ITEM_SCHEMES_FORMAT_TYPE_CSV,
  COMPARE_ITEM_SCHEMES_FORMAT_TYPE_MSDB
} from "./reducer";
import moment from "moment";

export const COMPARE_ITEM_SCHEMES_ARTEFACT_TYPE_CHANGE = 'COMPARE_ITEM_SCHEMES_ARTEFACT_TYPE_CHANGE';
export const COMPARE_ITEM_SCHEMES_FORMAT_CHANGE = 'COMPARE_ITEM_SCHEMES_FORMAT_CHANGE';
export const COMPARE_ITEM_SCHEMES_CSV_PROPS_CHANGE = 'COMPARE_ITEM_SCHEMES_CSV_PROPS_CHANGE';

export const COMPARE_ITEM_SCHEMES_FILE_SET = 'COMPARE_ITEM_SCHEMES_FILE_SET';

export const COMPARE_ITEM_SCHEMES_ARTEFACTS_SHOW = 'COMPARE_ITEM_SCHEMES_ARTEFACTS_SHOW';
export const COMPARE_ITEM_SCHEMES_ARTEFACTS_HIDE = 'COMPARE_ITEM_SCHEMES_ARTEFACTS_HIDE';
export const COMPARE_ITEM_SCHEMES_ARTEFACTS_READ = 'COMPARE_ITEM_SCHEMES_ARTEFACTS_READ';
export const COMPARE_ITEM_SCHEMES_ARTEFACT_SET = 'COMPARE_ITEM_SCHEMES_ARTEFACT_SET';
export const COMPARE_ITEM_SCHEMES_ARTEFACT_UNSET = 'COMPARE_ITEM_SCHEMES_ARTEFACT_UNSET';

export const COMPARE_ITEM_SCHEMES_COMPARE_READ = 'COMPARE_ITEM_SCHEMES_COMPARE_READ';
export const COMPARE_ITEM_SCHEMES_COMPARE_HIDE = 'COMPARE_ITEM_SCHEMES_COMPARE_HIDE';
export const COMPARE_ITEM_SCHEMES_COMPARE_DOWNLOAD = 'COMPARE_ITEM_SCHEMES_COMPARE_DOWNLOAD';

export const changeCompareItemSchemesArtefactType = artefactType => ({
  type: COMPARE_ITEM_SCHEMES_ARTEFACT_TYPE_CHANGE,
  artefactType
});

export const changeCompareItemSchemesFormat = (isSource, format, lang) => ({
  type: COMPARE_ITEM_SCHEMES_FORMAT_CHANGE,
  isSource,
  format,
  lang
});

export const changeCompareItemSchemesCsvProps = (isSource, fields) => ({
  type: COMPARE_ITEM_SCHEMES_CSV_PROPS_CHANGE,
  isSource,
  fields
});

export const setCompareItemSchemesFile = (isSource, file) => ({
  type: COMPARE_ITEM_SCHEMES_FILE_SET,
  isSource,
  file
});

export const showCompareItemSchemesArtefacts = isSource => ({
  type: COMPARE_ITEM_SCHEMES_ARTEFACTS_SHOW,
  isSource
});

export const hideCompareItemSchemesArtefacts = () => ({
  type: COMPARE_ITEM_SCHEMES_ARTEFACTS_HIDE
});

export const readCompareItemSchemesArtefacts = artefactType => getRequest(
  COMPARE_ITEM_SCHEMES_ARTEFACTS_READ,
  artefactType === COMPARE_ITEM_SCHEMES_ARTEFACT_TYPE_CODELIST
    ? getCodelistUrl()
    : (artefactType === COMPARE_ITEM_SCHEMES_ARTEFACT_TYPE_CATEGORY_SCHEME
      ? getCategorySchemeUrl()
      : getConceptSchemeUrl()
    )
);

export const setCompareItemSchemesArtefact = artefactTriplet => ({
  type: COMPARE_ITEM_SCHEMES_ARTEFACT_SET,
  artefactTriplet
});

export const unsetCompareItemSchemesArtefact = isSource => ({
  type: COMPARE_ITEM_SCHEMES_ARTEFACT_UNSET,
  isSource
});

export const readCompareItemSchemesCompare = (artefactType, source, sourceFormat, sourceCsvProps, target, targetFormat, targetCsvProps) => {

  let fileFormData = new FormData();
  if (sourceFormat !== COMPARE_ITEM_SCHEMES_FORMAT_TYPE_MSDB) {
    fileFormData.append('files', source);
  }
  if (targetFormat !== COMPARE_ITEM_SCHEMES_FORMAT_TYPE_MSDB) {
    fileFormData.append('files', target);
  }
  if (sourceFormat === COMPARE_ITEM_SCHEMES_FORMAT_TYPE_CSV) {
    fileFormData.append('customDataFirst', JSON.stringify(sourceCsvProps));
  }
  if (targetFormat === COMPARE_ITEM_SCHEMES_FORMAT_TYPE_CSV) {
    fileFormData.append('customDataSecond', JSON.stringify(targetCsvProps));
  }

  return postRequest(
    COMPARE_ITEM_SCHEMES_COMPARE_READ,
    getCompareItemsUrl(
      artefactType,
      sourceFormat === COMPARE_ITEM_SCHEMES_FORMAT_TYPE_MSDB ? source : null,
      targetFormat === COMPARE_ITEM_SCHEMES_FORMAT_TYPE_MSDB ? target : null
    ),
    fileFormData
  )
};

export const hideCompareItemSchemesCompare = () => ({
  type: COMPARE_ITEM_SCHEMES_COMPARE_HIDE
});

export const downloadCompareItemSchemesCompare = (artefactType, lang, source, sourceFormat, sourceCsvProps, target, targetFormat, targetCsvProps) => {

  let fileFormData = new FormData();
  if (sourceFormat !== COMPARE_ITEM_SCHEMES_FORMAT_TYPE_MSDB) {
    fileFormData.append('files', source);
  }
  if (targetFormat !== COMPARE_ITEM_SCHEMES_FORMAT_TYPE_MSDB) {
    fileFormData.append('files', target);
  }
  if (sourceFormat === COMPARE_ITEM_SCHEMES_FORMAT_TYPE_CSV) {
    fileFormData.append('customDataFirst', JSON.stringify(sourceCsvProps));
  }
  if (targetFormat === COMPARE_ITEM_SCHEMES_FORMAT_TYPE_CSV) {
    fileFormData.append('customDataSecond', JSON.stringify(targetCsvProps));
  }

  const currDate = moment().format('YYYY-MM-DD_HH-mm-ss');

  const fileSave = {
    name: `CompareItemSchemes_${currDate}.txt`,
    type: "text/plain;charset=utf-8"
  };

  return {
    ...postRequest(
      COMPARE_ITEM_SCHEMES_COMPARE_DOWNLOAD,
      getCompareItemsForFileUrl(
        artefactType,
        lang,
        sourceFormat === COMPARE_ITEM_SCHEMES_FORMAT_TYPE_MSDB ? source : null,
        targetFormat === COMPARE_ITEM_SCHEMES_FORMAT_TYPE_MSDB ? target : null
      ),
      fileFormData
    ),
    fileSave
  }
};