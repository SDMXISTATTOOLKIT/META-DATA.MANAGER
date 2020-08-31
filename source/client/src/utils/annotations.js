import _ from "lodash";
import {isDictionaryValid} from "./artefactValidators";

export const AUTO_ANNOTATION_DDBDATAFLOW_KEY = "ddbDataflow";
export const AUTO_ANNOTATION_RESTRICTED_FOR_PUBLICATION_KEY = "restrictedForPublication";
export const AUTO_ANNOTATION_FILE_PATH_KEY = "attachedFilePath";
export const AUTO_ANNOTATION_IS_MULTILINGUAL_KEY = "dcaT_IsMultilingual";
export const AUTO_ANNOTATION_HAVE_METADATA_KEY = "haveMetadata";
export const AUTO_ANNOTATION_CUSTOM_IS_PRESENTATIONAL_KEY = "customIsPresentational";

const LAYOUT_ANNOTATION_DEFAULT_KEY = "default";
const LAYOUT_ANNOTATION_DEFAULT_TABLE_LAYOUT_ROW_KEY = "layoutRow";
const LAYOUT_ANNOTATION_DEFAULT_TABLE_LAYOUT_COLUMN_KEY = "layoutColumn";
const LAYOUT_ANNOTATION_DEFAULT_TABLE_LAYOUT_ROW_SECTION_KEY = "layoutRowSection";
const LAYOUT_ANNOTATION_DEFAULT_TABLE_LAYOUT_FILTER = "layoutFilter";
const LAYOUT_ANNOTATION_NOT_DISPLAYED_KEY = "notDisplayed";
const LAYOUT_ANNOTATION_FULL_NAME_KEY = "fullName";
const LAYOUT_ANNOTATION_DATAFLOW_KEYWORDS_KEY = 'layoutDataflowKeywords';
const LAYOUT_ANNOTATION_CRITERIA_SELECTION_KEY = 'layoutCriteriaSelection';
const LAYOUT_ANNOTATION_ATTACHED_DATA_FILES_KEY = 'layoutAttachedDataFiles';
const LAYOUT_ANNOTATION_DEFAULT_PRESENTATION_KEY = 'layoutDefaultPresentation';
const LAYOUT_ANNOTATION_DECIMAL_SEPARATOR_KEY = 'layoutDecimalSeparator';
const LAYOUT_ANNOTATION_NUMBER_OF_DECIMALS_KEY = 'layoutNumberOfDecimals';
const LAYOUT_ANNOTATION_REFERENCE_METADATA_KEY = 'layoutReferenceMetadata';
const LAYOUT_ANNOTATION_EMPTY_CELL_PLACEHOLDER_KEY = 'layoutEmptyCellPlaceholder';
const LAYOUT_ANNOTATION_DATAFLOW_NOTES_KEY = 'layoutDataflowNotes';
const LAYOUT_ANNOTATION_TERRITORIAL_DIMENSION_IDS_KEY = 'layoutTerritorialDimensionIds';
const LAYOUT_ANNOTATION_DATAFLOW_SOURCE_KEY = 'layoutDataflowSource';

export const LAYOUT_ANNOTATION_DEFAULT_TABLE_LAYOUT_MODE_DATABROWSER = 'LAYOUT_ANNOTATION_DEFAULT_TABLE_LAYOUT_MODE_DATABROWSER';
export const LAYOUT_ANNOTATION_DEFAULT_TABLE_LAYOUT_MODE_DATAEXPLORER = 'LAYOUT_ANNOTATION_DEFAULT_TABLE_LAYOUT_MODE_DATAEXPLORER';

const LAYOUT_ANNOTATION_KEYS = [
  LAYOUT_ANNOTATION_DEFAULT_KEY,
  LAYOUT_ANNOTATION_DEFAULT_TABLE_LAYOUT_ROW_KEY,
  LAYOUT_ANNOTATION_DEFAULT_TABLE_LAYOUT_COLUMN_KEY,
  LAYOUT_ANNOTATION_DEFAULT_TABLE_LAYOUT_ROW_SECTION_KEY,
  LAYOUT_ANNOTATION_DEFAULT_TABLE_LAYOUT_FILTER,
  LAYOUT_ANNOTATION_NOT_DISPLAYED_KEY,
  LAYOUT_ANNOTATION_FULL_NAME_KEY,
  LAYOUT_ANNOTATION_DATAFLOW_KEYWORDS_KEY,
  LAYOUT_ANNOTATION_CRITERIA_SELECTION_KEY,
  LAYOUT_ANNOTATION_ATTACHED_DATA_FILES_KEY,
  LAYOUT_ANNOTATION_DEFAULT_PRESENTATION_KEY,
  LAYOUT_ANNOTATION_DECIMAL_SEPARATOR_KEY,
  LAYOUT_ANNOTATION_NUMBER_OF_DECIMALS_KEY,
  LAYOUT_ANNOTATION_REFERENCE_METADATA_KEY,
  LAYOUT_ANNOTATION_EMPTY_CELL_PLACEHOLDER_KEY,
  LAYOUT_ANNOTATION_DATAFLOW_NOTES_KEY,
  LAYOUT_ANNOTATION_TERRITORIAL_DIMENSION_IDS_KEY,
  LAYOUT_ANNOTATION_DATAFLOW_SOURCE_KEY
];

const isStrCaseInsensitiveEquals = (str1, str2) => (str1 || "").toLowerCase() === (str2 || "").toLowerCase();

export function getGenericAnnotations(allAnnotations, customAnnotationsConfig, annotationsConfig) {

  allAnnotations = allAnnotations || [];
  customAnnotationsConfig = customAnnotationsConfig || [];

  const customAnnotationTypes = [];
  customAnnotationsConfig.forEach(({annotations}) =>
    annotations.forEach(({name}) => customAnnotationTypes.push(name.toLowerCase()))
  );

  const layoutAnnotationTypes = _.flatMap(_.pick(annotationsConfig, LAYOUT_ANNOTATION_KEYS))
    .map(annot => annot.toLowerCase());

  return allAnnotations.filter(({type}) =>
    !customAnnotationTypes.includes((type || "").toLowerCase()) && !layoutAnnotationTypes.includes((type || "").toLowerCase()));
}

export function getCustomAnnotationsTabsMap(allAnnotations, customAnnotationsConfig) {

  allAnnotations = allAnnotations || [];
  customAnnotationsConfig = customAnnotationsConfig || [];

  let res = {};

  customAnnotationsConfig.forEach(({name: tabName, label, annotations}) => {
    res[tabName] = {
      label,
      annotations: {}
    };
    annotations.forEach(({name: type}) =>
      res[tabName].annotations[type] = (allAnnotations.find(annot => isStrCaseInsensitiveEquals(annot.type, type)) || {}).text || null
    );
  });

  return res;
}

export function getCustomAnnotationsFromTabsMap(tabsMap) {

  let res = [];

  Object.keys(tabsMap).forEach(key =>
    Object.keys(tabsMap[key].annotations)
      .forEach(type => {
        if (tabsMap[key].annotations[type] &&
          _(tabsMap[key].annotations[type])
            .pickBy(val => val.length > 0)
            .keys()
            .value().length > 0
        ) {
          res.push({
            type,
            text: tabsMap[key].annotations[type]
          });
        }
      })
  );

  return res;
}

export function countCustomAnnotations(allAnnotations, customAnnotationsConfig, includeNotVisible) {

  allAnnotations = allAnnotations || [];
  customAnnotationsConfig = customAnnotationsConfig || [];

  const customAnnotationTypes = [];
  customAnnotationsConfig.forEach(({annotations, isVisible}) => {
    if (isVisible || includeNotVisible) {
      annotations.forEach(({name, isVisible}) => {
        if (isVisible || includeNotVisible) {
          customAnnotationTypes.push(name.toLowerCase())
        }
      });
    }
  });

  return allAnnotations.filter(({type}) => customAnnotationTypes.includes((type || "").toLowerCase())).length;
}

export function getLayoutAnnotations(allAnnotations, annotationsConfig) {

  allAnnotations = allAnnotations || [];

  const layoutAnnotationTypes = _.flatMap(_.pick(annotationsConfig, LAYOUT_ANNOTATION_KEYS))
    .map(annot => annot.toLowerCase());

  return allAnnotations.filter(({type}) => layoutAnnotationTypes.includes((type || "").toLowerCase()));
}

export function countLayoutAnnotations(allAnnotations, annotationsConfig) {

  allAnnotations = allAnnotations || [];

  const layoutAnnotationTypes = _.flatMap(_.pick(annotationsConfig, LAYOUT_ANNOTATION_KEYS))
    .map(annot => annot.toLowerCase());

  return allAnnotations.filter(({type}) => layoutAnnotationTypes.includes((type || "").toLowerCase())).length;
}

export function getLayoutAnnotationDefaultForCodelist(allAnnotations, annotationsConfig) {

  allAnnotations = allAnnotations || [];

  const defaultAnnotationType = annotationsConfig[LAYOUT_ANNOTATION_DEFAULT_KEY];

  return !!allAnnotations.find(({type}) => isStrCaseInsensitiveEquals(type, defaultAnnotationType));
}

export function setLayoutAnnotationDefaultForCodelist(allAnnotations, annotationsConfig, isDefault) {

  allAnnotations = allAnnotations || [];

  const defaultAnnotationType = annotationsConfig[LAYOUT_ANNOTATION_DEFAULT_KEY];
  const otherAnnotations = allAnnotations.filter(({type}) => !isStrCaseInsensitiveEquals(type, defaultAnnotationType));

  return isDefault
    ? ([
      ...otherAnnotations,
      {
        type: defaultAnnotationType,
        id: defaultAnnotationType,
        title: defaultAnnotationType
      }
    ])
    : otherAnnotations;
}

export function getLayoutAnnotationDefault(allAnnotations, annotationsConfig) {
  allAnnotations = allAnnotations || [];

  const notDisplayedAnnotationType = annotationsConfig[LAYOUT_ANNOTATION_DEFAULT_KEY];
  const splitRes = ((allAnnotations.find(({type}) => isStrCaseInsensitiveEquals(type, notDisplayedAnnotationType)) || {}).title || "").split(",");

  const normalizedSplitRes = splitRes.filter(val => val.length > 0).map(val => val.split("=")).filter(arr => arr[0].length > 0);

  const res = {};

  normalizedSplitRes.forEach(split => {
    res[split[0]] =
      split[1]
        ? split[1].split("+").filter(val => val.length > 0)
        : [];
  });

  return res;
}

export function setLayoutAnnotationDefault(allAnnotations, annotationsConfig, defaultObj) {

  allAnnotations = allAnnotations || [];

  const notDisplayAnnotationType = annotationsConfig[LAYOUT_ANNOTATION_DEFAULT_KEY];
  const otherAnnotations = allAnnotations.filter(({type}) => !isStrCaseInsensitiveEquals(type, notDisplayAnnotationType));

  return Object.keys(defaultObj).length > 0
    ? ([
      ...otherAnnotations,
      {
        type: notDisplayAnnotationType,
        id: notDisplayAnnotationType,
        title: Object.keys(defaultObj).map(id =>
          id + (
            defaultObj[id].length > 0
              ? ("=" + defaultObj[id].join("+"))
              : ""
          )).join(",")
      }
    ])
    : otherAnnotations;
}

export function getLayoutAnnotationFullname(allAnnotations, annotationsConfig) {
  allAnnotations = allAnnotations || [];

  const fullNameAnnotationType = annotationsConfig[LAYOUT_ANNOTATION_FULL_NAME_KEY];
  return (allAnnotations.find(({type}) => isStrCaseInsensitiveEquals(type, fullNameAnnotationType)) || {}).text || null;
}

export function setLayoutAnnotationFullName(allAnnotations, annotationsConfig, fullName) {

  allAnnotations = allAnnotations || [];

  const fullNameAnnotationType = annotationsConfig[LAYOUT_ANNOTATION_FULL_NAME_KEY];
  const otherAnnotations = allAnnotations.filter(({type}) => !isStrCaseInsensitiveEquals(type, fullNameAnnotationType));

  return _(fullName).pickBy(val => val.length > 0).keys().value().length > 0
    ? ([
      ...otherAnnotations,
      {
        type: fullNameAnnotationType,
        id: fullNameAnnotationType,
        title: fullNameAnnotationType,
        text: fullName
      }
    ])
    : otherAnnotations;
}

export function getLayoutAnnotationNotDisplayed(allAnnotations, annotationsConfig) {
  allAnnotations = allAnnotations || [];

  const notDisplayedAnnotationType = annotationsConfig[LAYOUT_ANNOTATION_NOT_DISPLAYED_KEY];
  const splitRes = ((allAnnotations.find(({type}) => isStrCaseInsensitiveEquals(type, notDisplayedAnnotationType)) || {}).title || "").split(",");

  const normalizedSplitRes = splitRes.filter(val => val.length > 0).map(val => val.split("=")).filter(arr => arr[0].length > 0);

  const res = {};

  normalizedSplitRes.forEach(split => {
    res[split[0]] =
      split[1]
        ? split[1].split("+").filter(val => val.length > 0)
        : [];
  });

  return res;
}

export function setLayoutAnnotationNotDisplayed(allAnnotations, annotationsConfig, notDisplayed) {

  allAnnotations = allAnnotations || [];

  const notDisplayAnnotationType = annotationsConfig[LAYOUT_ANNOTATION_NOT_DISPLAYED_KEY];
  const otherAnnotations = allAnnotations.filter(({type}) => !isStrCaseInsensitiveEquals(type, notDisplayAnnotationType));

  return Object.keys(notDisplayed).length > 0
    ? ([
      ...otherAnnotations,
      {
        type: notDisplayAnnotationType,
        id: notDisplayAnnotationType,
        title: Object.keys(notDisplayed).map(id =>
          id + (
            notDisplayed[id].length > 0
              ? ("=" + notDisplayed[id].join("+"))
              : ""
          )).join(",")
      }
    ])
    : otherAnnotations;
}

export function getLayoutAnnotationDefaultTableLayout(allAnnotations, annotationsConfig) {
  allAnnotations = allAnnotations || [];

  const layoutRowAnnotationType = annotationsConfig[LAYOUT_ANNOTATION_DEFAULT_TABLE_LAYOUT_ROW_KEY];
  const layoutColumnAnnotationType = annotationsConfig[LAYOUT_ANNOTATION_DEFAULT_TABLE_LAYOUT_COLUMN_KEY];
  const layoutFilterAnnotationType = annotationsConfig[LAYOUT_ANNOTATION_DEFAULT_TABLE_LAYOUT_FILTER];
  const layoutRowSectionAnnotationType = annotationsConfig[LAYOUT_ANNOTATION_DEFAULT_TABLE_LAYOUT_ROW_SECTION_KEY];

  const rowSplitRes = ((allAnnotations.find(({type}) => isStrCaseInsensitiveEquals(type, layoutRowAnnotationType)) || {}).title || "").split(",");
  const columnSplitRes = ((allAnnotations.find(({type}) => isStrCaseInsensitiveEquals(type, layoutColumnAnnotationType)) || {}).title || "").split(",");
  const filterSpitRes = ((allAnnotations.find(({type}) => isStrCaseInsensitiveEquals(type, layoutFilterAnnotationType)) || {}).title || "").split(",");
  const rowSectionSplitRes = ((allAnnotations.find(({type}) => isStrCaseInsensitiveEquals(type, layoutRowSectionAnnotationType)) || {}).title || "").split(",");

  return (rowSplitRes[0] !== "" || columnSplitRes[0] !== "" || filterSpitRes[0] !== "" || rowSectionSplitRes[0] !== "")
    ? ({
      row: rowSplitRes[0] === "" ? [] : rowSplitRes,
      column: columnSplitRes[0] === "" ? [] : columnSplitRes,
      filter: filterSpitRes[0] === "" ? [] : filterSpitRes,
      rowSection: rowSectionSplitRes[0] === "" ? [] : rowSectionSplitRes,
    })
    : null;
}

export function setLayoutAnnotationDefaultTableLayout(allAnnotations, annotationsConfig, layout) {

  allAnnotations = allAnnotations || [];
  const layoutRowAnnotationType = annotationsConfig[LAYOUT_ANNOTATION_DEFAULT_TABLE_LAYOUT_ROW_KEY];
  const layoutColumnAnnotationType = annotationsConfig[LAYOUT_ANNOTATION_DEFAULT_TABLE_LAYOUT_COLUMN_KEY];
  const layoutFilterAnnotationType = annotationsConfig[LAYOUT_ANNOTATION_DEFAULT_TABLE_LAYOUT_FILTER];
  const layoutRowSectionAnnotationType = annotationsConfig[LAYOUT_ANNOTATION_DEFAULT_TABLE_LAYOUT_ROW_SECTION_KEY];
  const otherAnnotations = allAnnotations.filter(({type}) =>
    !isStrCaseInsensitiveEquals(type, layoutRowAnnotationType) &&
    !isStrCaseInsensitiveEquals(type, layoutColumnAnnotationType) &&
    !isStrCaseInsensitiveEquals(type, layoutRowSectionAnnotationType) &&
    !isStrCaseInsensitiveEquals(type, layoutFilterAnnotationType)
  );

  return otherAnnotations
    .concat(
      layout && layout.row.length > 0
        ? ([{
          type: layoutRowAnnotationType,
          id: layoutRowAnnotationType,
          title: layout.row.join(",")
        }])
        : []
    )
    .concat(
      layout && layout.column.length > 0
        ? ([{
          type: layoutColumnAnnotationType,
          id: layoutColumnAnnotationType,
          title: layout.column.join(",")
        }])
        : []
    )
    .concat(
      layout && layout.filter.length > 0
        ? ([{
          type: layoutFilterAnnotationType,
          id: layoutFilterAnnotationType,
          title: layout.filter.join(",")
        }])
        : []
    )
    .concat(
      layout && layout.rowSection.length > 0
        ? ([{
          type: layoutRowSectionAnnotationType,
          id: layoutRowSectionAnnotationType,
          title: layout.rowSection.join(",")
        }])
        : []
    );
}

export const getLayoutAnnotationDataflowKeywords = (allAnnotations, annotationsConfig) => {

  const annotationType = annotationsConfig[LAYOUT_ANNOTATION_DATAFLOW_KEYWORDS_KEY];
  const annotationText = (allAnnotations.find(({type}) => isStrCaseInsensitiveEquals(type, annotationType)) || {}).text || null;

  if (annotationText !== null) {

    // {en: "k1+k2", it: "k3+k4"}

    return _(annotationText)
      .pickBy(val => val !== undefined && val !== null && val.length > 0)
      .mapValues(val => val.split("+"))
      .value() || [];

  } else {
    return [];
  }
};

export const setLayoutAnnotationDataflowKeywords = (allAnnotations, annotationsConfig, dataflowKeywords) => {

  allAnnotations = allAnnotations || [];

  const annotationType = annotationsConfig[LAYOUT_ANNOTATION_DATAFLOW_KEYWORDS_KEY];

  const otherAnnotations = allAnnotations.filter(({type}) =>
    !isStrCaseInsensitiveEquals(type, annotationType)
  );

  let annotation = null;

  if (isDictionaryValid(dataflowKeywords)) {

    annotation = ({
      id: annotationType,
      type: annotationType,
      title: annotationType,
      text: ""
    });

    // {en: "k1+k2", it: "k3+k4"}

    annotation.text = _(dataflowKeywords)
      .pickBy(val => val !== undefined && val !== null && val.length > 0)
      .mapValues(val => val.join("+"))
      .value();
  }

  return annotation !== null ? otherAnnotations.concat(annotation) : otherAnnotations;
}

export const getLayoutAnnotationAttachedDataFiles = (allAnnotations, annotationsConfig) => {

  const annotationType = annotationsConfig[LAYOUT_ANNOTATION_ATTACHED_DATA_FILES_KEY];
  const annotationText = (allAnnotations.find(({type}) => isStrCaseInsensitiveEquals(type, annotationType)) || {}).text || null;

  if (annotationText !== null) {

    return _(annotationText)
      .mapValues(val =>
        val.split("||").map(elem => ({
          url: decodeURI(elem.split("|")[0]),
          format: decodeURI(elem.split("|")[1])
        })))
      .value();
  } else {
    return null;
  }
};

export const setLayoutAnnotationAttachedDataFiles = (allAnnotations, annotationsConfig, attachedDataFiles) => {

  allAnnotations = allAnnotations || [];

  const annotationType = annotationsConfig[LAYOUT_ANNOTATION_ATTACHED_DATA_FILES_KEY];

  const otherAnnotations = allAnnotations.filter(({type}) =>
    !isStrCaseInsensitiveEquals(type, annotationType)
  );

  let annotation = null;

  const normalizedAttachedDataFiles = _(attachedDataFiles).pickBy(val => val !== undefined && val !== null && val.length > 0).value();

  if (_(normalizedAttachedDataFiles).keys().value().length > 0) {

    annotation = ({
      id: annotationType,
      type: annotationType,
      text: _(normalizedAttachedDataFiles).mapValues(val => val.map(({url, format}) => encodeURI(url) + "|" + encodeURI(format)).join("||")).value()
    });
  }

  return annotation !== null ? otherAnnotations.concat(annotation) : otherAnnotations;
}

export const getLayoutAnnotationCriteriaSelection = (allAnnotations, annotationsConfig) => {

  const annotationType = annotationsConfig[LAYOUT_ANNOTATION_CRITERIA_SELECTION_KEY];
  const annotationText = (allAnnotations.find(({type}) => isStrCaseInsensitiveEquals(type, annotationType)) || {}).title || null;


  return annotationText || null;
};

export const setLayoutAnnotationCriteriaSelection = (allAnnotations, annotationsConfig, criteriaSelection) => {

  allAnnotations = allAnnotations || [];

  const annotationType = annotationsConfig[LAYOUT_ANNOTATION_CRITERIA_SELECTION_KEY];

  const otherAnnotations = allAnnotations.filter(({type}) =>
    !isStrCaseInsensitiveEquals(type, annotationType)
  );

  let annotation = null;

  if (criteriaSelection && criteriaSelection.length > 0) {

    annotation = ({
      id: annotationType,
      type: annotationType,
      title: criteriaSelection
    });
  }

  return annotation !== null ? otherAnnotations.concat(annotation) : otherAnnotations;
}

export const getLayoutAnnotationDecimalSeparator = (allAnnotations, annotationsConfig) => {

  const annotationType = annotationsConfig[LAYOUT_ANNOTATION_DECIMAL_SEPARATOR_KEY];
  const annotationText = (allAnnotations.find(({type}) => isStrCaseInsensitiveEquals(type, annotationType)) || {}).title || null;


  return annotationText || null;
};

export const setLayoutAnnotationDecimalSeparator = (allAnnotations, annotationsConfig, decimalSeparator) => {

  allAnnotations = allAnnotations || [];

  const annotationType = annotationsConfig[LAYOUT_ANNOTATION_DECIMAL_SEPARATOR_KEY];

  const otherAnnotations = allAnnotations.filter(({type}) =>
    !isStrCaseInsensitiveEquals(type, annotationType)
  );

  let annotation = null;

  if (decimalSeparator && decimalSeparator.length > 0) {

    annotation = ({
      id: annotationType,
      type: annotationType,
      title: decimalSeparator
    });
  }

  return annotation !== null ? otherAnnotations.concat(annotation) : otherAnnotations;
}

export const getLayoutAnnotationNumberOfDecimals = (allAnnotations, annotationsConfig) => {

  const annotationType = annotationsConfig[LAYOUT_ANNOTATION_NUMBER_OF_DECIMALS_KEY];
  const annotationText = (allAnnotations.find(({type}) => isStrCaseInsensitiveEquals(type, annotationType)) || {}).title || null;


  return annotationText || null;
};

export const setLayoutAnnotationNumberOfDecimals = (allAnnotations, annotationsConfig, numberOfDecimals) => {

  allAnnotations = allAnnotations || [];

  const annotationType = annotationsConfig[LAYOUT_ANNOTATION_NUMBER_OF_DECIMALS_KEY];

  const otherAnnotations = allAnnotations.filter(({type}) =>
    !isStrCaseInsensitiveEquals(type, annotationType)
  );

  let annotation = null;

  if (numberOfDecimals && numberOfDecimals.length > 0) {

    annotation = ({
      id: annotationType,
      type: annotationType,
      title: numberOfDecimals
    });
  }

  return annotation !== null ? otherAnnotations.concat(annotation) : otherAnnotations;
}

export const getLayoutAnnotationReferenceMetadata = (allAnnotations, annotationsConfig) => {

  const annotationType = annotationsConfig[LAYOUT_ANNOTATION_REFERENCE_METADATA_KEY];
  const annotationText = (allAnnotations.find(({type}) => isStrCaseInsensitiveEquals(type, annotationType)) || {}).text || null;


  return annotationText || null;
};

export const setLayoutAnnotationReferenceMetadata = (allAnnotations, annotationsConfig, referenceMetadata) => {

  allAnnotations = allAnnotations || [];

  const annotationType = annotationsConfig[LAYOUT_ANNOTATION_REFERENCE_METADATA_KEY];

  const otherAnnotations = allAnnotations.filter(({type}) =>
    !isStrCaseInsensitiveEquals(type, annotationType)
  );

  let annotation = null;

  if (referenceMetadata && _(referenceMetadata).pickBy(val => val.length > 0).keys().value().length > 0) {

    annotation = ({
      id: annotationType,
      type: annotationType,
      title: annotationType,
      text: referenceMetadata
    });
  }

  return annotation !== null ? otherAnnotations.concat(annotation) : otherAnnotations;
}

export const getLayoutAnnotationEmptyCellPlaceholder = (allAnnotations, annotationsConfig) => {

  const annotationType = annotationsConfig[LAYOUT_ANNOTATION_EMPTY_CELL_PLACEHOLDER_KEY];
  const annotationText = (allAnnotations.find(({type}) => isStrCaseInsensitiveEquals(type, annotationType)) || {}).title || null;


  return annotationText || null;
};

export const setLayoutAnnotationEmptyCellPlaceholder = (allAnnotations, annotationsConfig, emptyCellPlaceholder) => {

  allAnnotations = allAnnotations || [];

  const annotationType = annotationsConfig[LAYOUT_ANNOTATION_EMPTY_CELL_PLACEHOLDER_KEY];

  const otherAnnotations = allAnnotations.filter(({type}) =>
    !isStrCaseInsensitiveEquals(type, annotationType)
  );

  let annotation = null;

  if (emptyCellPlaceholder && emptyCellPlaceholder.length > 0) {

    annotation = ({
      id: annotationType,
      type: annotationType,
      title: emptyCellPlaceholder
    });
  }

  return annotation !== null ? otherAnnotations.concat(annotation) : otherAnnotations;
}

export const getLayoutAnnotationDataflowNotes = (allAnnotations, annotationsConfig) => {

  const annotationType = annotationsConfig[LAYOUT_ANNOTATION_DATAFLOW_NOTES_KEY];
  const annotationText = (allAnnotations.find(({type}) => isStrCaseInsensitiveEquals(type, annotationType)) || {}).text || null;


  return annotationText || null;
};

export const setLayoutAnnotationDataflowNotes = (allAnnotations, annotationsConfig, dataflowNotes) => {

  allAnnotations = allAnnotations || [];

  const annotationType = annotationsConfig[LAYOUT_ANNOTATION_DATAFLOW_NOTES_KEY];

  const otherAnnotations = allAnnotations.filter(({type}) =>
    !isStrCaseInsensitiveEquals(type, annotationType)
  );

  let annotation = null;

  if (dataflowNotes && _(dataflowNotes).pickBy(val => val.length > 0).keys().value().length > 0) {

    annotation = ({
      id: annotationType,
      type: annotationType,
      title: annotationType,
      text: dataflowNotes
    });
  }

  return annotation !== null ? otherAnnotations.concat(annotation) : otherAnnotations;
}

export const getLayoutAnnotationDataflowSource = (allAnnotations, annotationsConfig) => {

  const annotationType = annotationsConfig[LAYOUT_ANNOTATION_DATAFLOW_SOURCE_KEY];
  const annotationText = (allAnnotations.find(({type}) => isStrCaseInsensitiveEquals(type, annotationType)) || {}).text || null;

  return annotationText || null;
};

export const setLayoutAnnotationDataflowSource = (allAnnotations, annotationsConfig, dataflowSource) => {

  allAnnotations = allAnnotations || [];

  const annotationType = annotationsConfig[LAYOUT_ANNOTATION_DATAFLOW_SOURCE_KEY];

  const otherAnnotations = allAnnotations.filter(({type}) =>
    !isStrCaseInsensitiveEquals(type, annotationType)
  );

  let annotation = null;

  if (dataflowSource &&  _(dataflowSource).pickBy(val => val.length > 0).keys().value().length > 0) {

    annotation = ({
      id: annotationType,
      type: annotationType,
      title: annotationType,
      text: dataflowSource
    });
  }

  return annotation !== null ? otherAnnotations.concat(annotation) : otherAnnotations;
}

export const getLayoutAnnotationTerritorialDimensionIds = (allAnnotations, annotationsConfig) => {

  const annotationType = annotationsConfig[LAYOUT_ANNOTATION_TERRITORIAL_DIMENSION_IDS_KEY];
  const annotationText = (allAnnotations.find(({type}) => isStrCaseInsensitiveEquals(type, annotationType)) || {}).title || null;

  if (annotationText !== null) {

    return annotationText.split("+") || [];

  } else {
    return [];
  }
};

export const setLayoutAnnotationTerritorialDimensionIds = (allAnnotations, annotationsConfig, territorialDimensionIds) => {

  allAnnotations = allAnnotations || [];

  const annotationType = annotationsConfig[LAYOUT_ANNOTATION_TERRITORIAL_DIMENSION_IDS_KEY];

  const otherAnnotations = allAnnotations.filter(({type}) =>
    !isStrCaseInsensitiveEquals(type, annotationType)
  );

  let annotation = null;

  if (territorialDimensionIds.length > 0) {

    annotation = ({
      id: annotationType,
      type: annotationType,
      title: territorialDimensionIds.join("+")
    });
  }

  return annotation !== null ? otherAnnotations.concat(annotation) : otherAnnotations;
}

export const getLayoutAnnotationDefaultPresentation = (allAnnotations, annotationsConfig) => {

  const annotationType = annotationsConfig[LAYOUT_ANNOTATION_DEFAULT_PRESENTATION_KEY];
  const annotationText = (allAnnotations.find(({type}) => isStrCaseInsensitiveEquals(type, annotationType)) || {}).title || null;


  return annotationText || null;
};

export const setLayoutAnnotationDefaultPresentation = (allAnnotations, annotationsConfig, defaultPresentation) => {

  allAnnotations = allAnnotations || [];

  const annotationType = annotationsConfig[LAYOUT_ANNOTATION_DEFAULT_PRESENTATION_KEY];

  const otherAnnotations = allAnnotations.filter(({type}) =>
    !isStrCaseInsensitiveEquals(type, annotationType)
  );

  let annotation = null;

  if (defaultPresentation && defaultPresentation.length > 0) {

    annotation = ({
      id: annotationType,
      type: annotationType,
      title: defaultPresentation
    });
  }

  return annotation !== null ? otherAnnotations.concat(annotation) : otherAnnotations;
}

export const removeOrderAnnotation = (allAnnotations, itemsOrderAnnotationType) => {
  const annotations = (allAnnotations || []).filter(({type}) => type !== itemsOrderAnnotationType);

  return (annotations && annotations.length > 0)
    ? annotations
    : undefined
};
