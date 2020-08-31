import {getRequest, postRequest} from "../../../middlewares/api/actions";
import {
  getAgencyNamesUrl,
  getCategorySchemeUrl,
  getCodelistUrl,
  getConceptSchemeUrl,
  getCreateArtefactsUrl,
  getCsvTablePreviewUrl,
  getMergeArtefactsUrl,
  getMergeCodelistsUrl,
  getMergedCodelistPageUrl,
  getPaginatedCodelistUrl,
  getSaveMergedCodelistUrl,
  getUploadFileOnServerUrl,
  getXmlArtefactPreviewUrl,
  getXmlCodelistPreviewUrl
} from "../../../constants/urls";
import {
  getSdmxJsonFromSdmxJsonStructures,
  SDMX_JSON_CATEGORY_SCHEME_LIST_KEY,
  SDMX_JSON_CONCEPT_SCHEME_LIST_KEY
} from "../../../utils/sdmxJson";

export const MERGE_ITEM_SCHEMES_FORMAT_TYPE_MSDB = "msdb";
export const MERGE_ITEM_SCHEMES_FORMAT_TYPE_CSV = "csv";
export const MERGE_ITEM_SCHEMES_FORMAT_TYPE_SDMX = "sdmx";

export const MERGE_ITEM_SCHEMES_ARTEFACT_TYPE_CODELIST = "Codelist";
export const MERGE_ITEM_SCHEMES_ARTEFACT_TYPE_CATEGORY_SCHEME = "CategoryScheme";
export const MERGE_ITEM_SCHEMES_ARTEFACT_TYPE_CONCEPT_SCHEME = "ConceptScheme";

export const MERGE_ITEM_SCHEMES_ARTEFACT_TYPE_CHANGE = 'MERGE_ITEM_SCHEMES_ARTEFACT_TYPE_CHANGE';
export const MERGE_ITEM_SCHEMES_FORMAT_CHANGE = 'MERGE_ITEM_SCHEMES_FORMAT_CHANGE';
export const MERGE_ITEM_SCHEMES_CSV_PROPS_CHANGE = 'MERGE_ITEM_SCHEMES_CSV_PROPS_CHANGE';

export const MERGE_ITEM_SCHEMES_FILE_SET = 'MERGE_ITEM_SCHEMES_FILE_SET';

export const MERGE_ITEM_SCHEMES_ARTEFACTS_SHOW = 'MERGE_ITEM_SCHEMES_ARTEFACTS_SHOW';
export const MERGE_ITEM_SCHEMES_ARTEFACTS_HIDE = 'MERGE_ITEM_SCHEMES_ARTEFACTS_HIDE';
export const MERGE_ITEM_SCHEMES_ARTEFACTS_READ = 'MERGE_ITEM_SCHEMES_ARTEFACTS_READ';
export const MERGE_ITEM_SCHEMES_ARTEFACT_SET = 'MERGE_ITEM_SCHEMES_ARTEFACT_SET';
export const MERGE_ITEM_SCHEMES_ARTEFACT_UNSET = 'MERGE_ITEM_SCHEMES_ARTEFACT_UNSET';

export const MERGE_ITEM_SCHEMES_MERGE_PREVIEW_READ = 'MERGE_ITEM_SCHEMES_MERGE_PREVIEW_READ';
export const MERGE_ITEM_SCHEMES_MERGE_PREVIEW_HIDE = 'MERGE_ITEM_SCHEMES_MERGE_PREVIEW_HIDE';

export const MERGE_ITEM_SCHEMES_CODELIST_MERGE_PREVIEW_LANG_CHANGE = 'MERGE_ITEM_SCHEMES_CODELIST_MERGE_PREVIEW_LANG_CHANGE';
export const MERGE_ITEM_SCHEMES_CODELIST_MERGE_PREVIEW_PARAMS_UPDATE = 'MERGE_ITEM_SCHEMES_CODELIST_MERGE_PREVIEW_PARAMS_UPDATE';
export const MERGE_ITEM_SCHEMES_CODELIST_PAGE_READ = 'MERGE_ITEM_SCHEMES_CODELIST_PAGE_READ';

export const MERGE_ITEM_SCHEMES_MERGE_SHOW = 'MERGE_ITEM_SCHEMES_MERGE_SHOW';
export const MERGE_ITEM_SCHEMES_MERGE_HIDE = 'MERGE_ITEM_SCHEMES_MERGE_HIDE';
export const MERGE_ITEM_SCHEMES_MERGE_CHANGE = 'MERGE_ITEM_SCHEMES_MERGE_CHANGE';
export const MERGE_ITEM_SCHEMES_MERGE_SUBMIT = 'MERGE_ITEM_SCHEMES_MERGE_SUBMIT';

export const MERGE_ITEM_SCHEMES_XML_PREVIEW_SHOW = 'MERGE_ITEM_SCHEMES_XML_PREVIEW_SHOW';
export const MERGE_ITEM_SCHEMES_XML_PREVIEW_READ = 'MERGE_ITEM_SCHEMES_XML_PREVIEW_READ';
export const MERGE_ITEM_SCHEMES_XML_PREVIEW_PAGE_READ = 'MERGE_ITEM_SCHEMES_XML_PREVIEW_PAGE_READ';
export const MERGE_ITEM_SCHEMES_XML_PREVIEW_PARAMS_UPDATE = 'MERGE_ITEM_SCHEMES_XML_PREVIEW_PARAMS_UPDATE';
export const MERGE_ITEM_SCHEMES_XML_PREVIEW_LANG_CHANGE = 'MERGE_ITEM_SCHEMES_XML_PREVIEW_LANG_CHANGE';

export const MERGE_ITEM_SCHEMES_CSV_PREVIEW_SHOW = 'MERGE_ITEM_SCHEMES_CSV_PREVIEW_SHOW';
export const MERGE_ITEM_SCHEMES_CSV_FILE_UPLOAD = 'MERGE_ITEM_SCHEMES_CSV_FILE_UPLOAD';
export const MERGE_ITEM_SCHEMES_CSV_PAGE_READ = 'MERGE_ITEM_SCHEMES_CSV_PAGE_READ';

export const MERGE_ITEM_SCHEMES_PREVIEW_HIDE = 'MERGE_ITEM_SCHEMES_PREVIEW_HIDE';


export const changeMergeItemSchemesArtefactType = artefactType => ({
  type: MERGE_ITEM_SCHEMES_ARTEFACT_TYPE_CHANGE,
  artefactType
});

export const changeMergeItemSchemesFormat = (isSource, format, lang) => ({
  type: MERGE_ITEM_SCHEMES_FORMAT_CHANGE,
  isSource,
  format,
  lang
});

export const changeMergeItemSchemesCsvProps = (isSource, fields) => ({
  type: MERGE_ITEM_SCHEMES_CSV_PROPS_CHANGE,
  isSource,
  fields
});

export const setMergeItemSchemesFile = (isSource, file) => ({
  type: MERGE_ITEM_SCHEMES_FILE_SET,
  isSource,
  file
});

export const showMergeItemSchemesArtefacts = isSource => ({
  type: MERGE_ITEM_SCHEMES_ARTEFACTS_SHOW,
  isSource
});

export const hideMergeItemSchemesArtefacts = () => ({
  type: MERGE_ITEM_SCHEMES_ARTEFACTS_HIDE
});

export const readMergeItemSchemesArtefacts = artefactType => getRequest(
  MERGE_ITEM_SCHEMES_ARTEFACTS_READ,
  artefactType === MERGE_ITEM_SCHEMES_ARTEFACT_TYPE_CODELIST
    ? getCodelistUrl()
    : (artefactType === MERGE_ITEM_SCHEMES_ARTEFACT_TYPE_CATEGORY_SCHEME
      ? getCategorySchemeUrl()
      : getConceptSchemeUrl()
    )
);

export const setMergeItemSchemesArtefact = artefactTriplet => ({
  type: MERGE_ITEM_SCHEMES_ARTEFACT_SET,
  artefactTriplet
});

export const unsetMergeItemSchemesArtefact = isSource => ({
  type: MERGE_ITEM_SCHEMES_ARTEFACT_UNSET,
  isSource
});

export const readMergeItemSchemesMergePreview =
  (artefactType, source, sourceFormat, sourceCsvProps, target, targetFormat, targetCsvProps, lang) => {

    let fileFormData = new FormData();
    if (sourceFormat !== MERGE_ITEM_SCHEMES_FORMAT_TYPE_MSDB) {
      fileFormData.append('files', source);
    }
    if (targetFormat !== MERGE_ITEM_SCHEMES_FORMAT_TYPE_MSDB) {
      fileFormData.append('files', target);
    }
    if (sourceFormat === MERGE_ITEM_SCHEMES_FORMAT_TYPE_CSV) {
      fileFormData.append('customDataFirst', JSON.stringify(sourceCsvProps));
    }
    if (targetFormat === MERGE_ITEM_SCHEMES_FORMAT_TYPE_CSV) {
      fileFormData.append('customDataSecond', JSON.stringify(targetCsvProps));
    }

    if (artefactType === MERGE_ITEM_SCHEMES_ARTEFACT_TYPE_CODELIST) {
      const searchInput = {
        id: "IdUseOnlyForMerge-aea11369-686d-4997-bff1-98853f3c4882",
        agencyID: "MERGE",
        version: "1.0",
        lang: lang,
        pageNum: 1,
        pageSize: 0,
        rebuildDb: true
      };
      fileFormData.append('searchInput', JSON.stringify(searchInput));
      return postRequest(
        MERGE_ITEM_SCHEMES_MERGE_PREVIEW_READ,
        getMergeCodelistsUrl(
          sourceFormat === MERGE_ITEM_SCHEMES_FORMAT_TYPE_MSDB ? source : null,
          targetFormat === MERGE_ITEM_SCHEMES_FORMAT_TYPE_MSDB ? target : null
        ),
        fileFormData
      )

    } else {
      return postRequest(
        MERGE_ITEM_SCHEMES_MERGE_PREVIEW_READ,
        getMergeArtefactsUrl(
          artefactType,
          sourceFormat === MERGE_ITEM_SCHEMES_FORMAT_TYPE_MSDB ? source : null,
          targetFormat === MERGE_ITEM_SCHEMES_FORMAT_TYPE_MSDB ? target : null
        ),
        fileFormData
      )
    }
  };

export const hideMergeItemSchemesMergePreview = () => ({
  type: MERGE_ITEM_SCHEMES_MERGE_PREVIEW_HIDE
});

export const changeMergeItemSchemesCodelistMergePreviewLang = lang => ({
  type: MERGE_ITEM_SCHEMES_CODELIST_MERGE_PREVIEW_LANG_CHANGE,
  lang
});

export const updateMergeItemSchemesCodelistMergePreviewParams = params => ({
  type: MERGE_ITEM_SCHEMES_CODELIST_MERGE_PREVIEW_PARAMS_UPDATE,
  params
});

export const readMergeItemSchemesCodelistPage =
  (triplet, lang, pageNum, pageSize, searchText, filters, sortCol, sortByDesc, rebuildDb) => ({
    ...postRequest(
      MERGE_ITEM_SCHEMES_CODELIST_PAGE_READ,
      getMergedCodelistPageUrl(),
      {
        id: triplet && triplet.id ? triplet.id : undefined,
        agencyID: triplet && triplet.agencyID ? triplet.agencyID : undefined,
        version: triplet && triplet.version ? triplet.version : undefined,
        lang: lang ? lang : undefined,
        pageNum: pageNum ? pageNum : undefined,
        pageSize: pageSize ? pageSize : undefined,
        allSearch: searchText ? searchText : undefined,
        codeSearch: filters && filters.id ? filters.id : undefined,
        nameSearch: filters && filters.name ? filters.name : undefined,
        parentSearch: filters && filters.parent ? filters.parent : undefined,
        sortColumn: sortCol ? sortCol : undefined,
        sortDesc: sortByDesc ? sortByDesc : undefined,
        rebuildDb
      }
    )
  });

export const showMergeItemSchemesMerge = allowedAgencies => ({
  ...getRequest(
    MERGE_ITEM_SCHEMES_MERGE_SHOW,
    getAgencyNamesUrl()
  ),
  allowedAgencies
});

export const hideMergeItemSchemesMerge = () => ({
  type: MERGE_ITEM_SCHEMES_MERGE_HIDE
});

export const changeMergeItemSchemesMerge = fields => ({
  type: MERGE_ITEM_SCHEMES_MERGE_CHANGE,
  fields
});

export const submitMergeItemSchemesMerge = (artefactType, mergedItemScheme, mergedItemsFromServer, lang) => {

  if (artefactType === MERGE_ITEM_SCHEMES_ARTEFACT_TYPE_CODELIST) {
    return postRequest(
      MERGE_ITEM_SCHEMES_MERGE_SUBMIT,
      getSaveMergedCodelistUrl(lang),
      {
        ID: mergedItemScheme.id,
        Agency: mergedItemScheme.agencyID,
        Version: mergedItemScheme.version,
        Names: mergedItemScheme.name
      },
      t => ({
        success: t('scenes.utilities.mergeItemSchemes.messages.create.success')
      })
    )

  } else if (artefactType === MERGE_ITEM_SCHEMES_ARTEFACT_TYPE_CATEGORY_SCHEME) {
    return postRequest(
      MERGE_ITEM_SCHEMES_MERGE_SUBMIT,
      getCreateArtefactsUrl(),
      getSdmxJsonFromSdmxJsonStructures(
        [{
          ...mergedItemScheme,
          isFinal: false,
          categories: mergedItemsFromServer
        }],
        SDMX_JSON_CATEGORY_SCHEME_LIST_KEY
      ),
      t => ({
        success: t('scenes.utilities.mergeItemSchemes.messages.create.success')
      })
    )

  } else if (artefactType === MERGE_ITEM_SCHEMES_ARTEFACT_TYPE_CONCEPT_SCHEME) {
    return postRequest(
      MERGE_ITEM_SCHEMES_MERGE_SUBMIT,
      getCreateArtefactsUrl(),
      getSdmxJsonFromSdmxJsonStructures(
        [{
          ...mergedItemScheme,
          isFinal: false,
          concepts: mergedItemsFromServer
        }],
        SDMX_JSON_CONCEPT_SCHEME_LIST_KEY
      ),
      t => ({
        success: t('scenes.utilities.mergeItemSchemes.messages.create.success')
      })
    )
  }
};

export const showMergeItemSchemesXmlPreview = isSource => ({
  type: MERGE_ITEM_SCHEMES_XML_PREVIEW_SHOW,
  isSource
});

export const readMergeItemSchemesXmlPreview = (artefactType, file, lang) => {
  let fileFormData = new FormData();
  fileFormData.append('file', file);

  return postRequest(
    MERGE_ITEM_SCHEMES_XML_PREVIEW_READ,
    artefactType === MERGE_ITEM_SCHEMES_ARTEFACT_TYPE_CODELIST
      ? getXmlCodelistPreviewUrl(lang)
      : getXmlArtefactPreviewUrl(artefactType),
    fileFormData
  )
};

export const updateMergeItemSchemesXmlPreviewParams = params => ({
  type: MERGE_ITEM_SCHEMES_XML_PREVIEW_PARAMS_UPDATE,
  params
});

export const changeMergeItemSchemesXmlPreviewLang = lang => ({
  type: MERGE_ITEM_SCHEMES_XML_PREVIEW_LANG_CHANGE,
  lang
});

export const readMergeItemSchemesXmlPreviewPage =
  (triplet, lang, pageNum, pageSize, searchText, filters, sortCol, sortByDesc, rebuildDb) => ({
    ...postRequest(
      MERGE_ITEM_SCHEMES_XML_PREVIEW_PAGE_READ,
      getPaginatedCodelistUrl(),
      {
        id: triplet && triplet.id ? triplet.id : undefined,
        agencyID: triplet && triplet.agencyID ? triplet.agencyID : undefined,
        version: triplet && triplet.version ? triplet.version : undefined,
        lang: lang ? lang : undefined,
        pageNum: pageNum ? pageNum : undefined,
        pageSize: pageSize ? pageSize : undefined,
        allSearch: searchText ? searchText : undefined,
        codeSearch: filters && filters.id ? filters.id : undefined,
        nameSearch: filters && filters.name ? filters.name : undefined,
        parentSearch: filters && filters.parent ? filters.parent : undefined,
        sortColumn: sortCol ? sortCol : undefined,
        sortDesc: sortByDesc ? sortByDesc : undefined,
        rebuildDb
      }
    )
  });

export const showMergeItemSchemesCsvPreview = isSource => ({
  type: MERGE_ITEM_SCHEMES_CSV_PREVIEW_SHOW,
  isSource
});

export const uploadMergeItemSchemesCsvFile = file => {
  let fileFormData = new FormData();
  fileFormData.append('file', file);

  return postRequest(
    MERGE_ITEM_SCHEMES_CSV_FILE_UPLOAD,
    getUploadFileOnServerUrl(),
    fileFormData
  );
};

export const readMergeItemSchemesCsvPage =
  (pageNum, pageSize, filterTable, sortCols, sortByDesc, separator, delimiter, hasHeader, filePath) => postRequest(
    MERGE_ITEM_SCHEMES_CSV_PAGE_READ,
    getCsvTablePreviewUrl(separator, delimiter, hasHeader, filePath, null, null),
    {
      PageNum: pageNum,
      PageSize: pageSize,
      FilterTable: filterTable,
      SortCols: sortCols,
      SortByDesc: sortByDesc,
    }
  );

export const hideMergeItemSchemesPreview = () => ({
  type: MERGE_ITEM_SCHEMES_PREVIEW_HIDE
});