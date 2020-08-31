import _ from "lodash";
import moment from "moment";
import uuidv4 from "uuid";
import {Modal} from "antd";
import {getFilteredTree, getMappedTree, getMappedTreeDeptFirst, getNode} from "./tree";
import {getAutoAnnotations, getFilteredAnnotations} from "./artefacts";
import {getArtefactTripletFromUrn, getStringFromArtefactTriplet} from "./sdmxJson";
import {getLocalizedStr} from "../middlewares/i18n/utils";
import {
  AUTO_ANNOTATION_CUSTOM_IS_PRESENTATIONAL_KEY,
  AUTO_ANNOTATION_FILE_PATH_KEY,
  AUTO_ANNOTATION_IS_MULTILINGUAL_KEY,
  AUTO_ANNOTATION_RESTRICTED_FOR_PUBLICATION_KEY
} from "./annotations";

export const REPORT_ID_ANNOTATION_ID = "ReportId";
export const METADATA_SET_ID_ANNOTATION_ID = "MetadataSetId";

export const REPORT_STATE_ID_ANNOTATION_ID = "ReportStateId";
export const REPORT_STATE_NAME_ANNOTATION_ID = "ReportStateName";

export const REPORT_STATE_NOT_PUBLISHED = "NOT_PUBLISHED";
export const REPORT_STATE_PUBLISHED = "PUBLISHED";
export const REPORT_STATE_DRAFT = "DRAFT";

export const REPORT_STATE_DRAFT_ID = "4";
export const REPORT_STATE_NOT_PUBLISHED_ID = "2";

export const CATALOG_TARGET_ID = "CATALOG_TARGET_ID";
export const DATAFLOW_TARGET_ID = "DATAFLOW_TARGET_ID";
export const CATALOG_IDENTIFIER = "CATALOG_IDENTIFIER";
export const DATASET_IDENTIFIER = "DATASET_IDENTIFIER";

const FOLDER_KEY = "FOLDER___";
export const EMPTY_REPORT_ATTRIBUTE_KEY = "EMPTY_REPORT_ATTRIBUTE___";

export const ATTRIBUTE_TEXT_TYPE_BOOLEAN = "boolean";

export const ATTRIBUTE_TEXT_TYPE_STRING = "string";

export const ATTRIBUTE_TEXT_TYPE_XHTML = "xhtml";

export const ATTRIBUTE_TEXT_TYPE_DATETIME = "datetime";

export const ATTRIBUTE_TEXT_TYPE_GREGORIANDAY = "gregorianday";

export const ATTRIBUTE_TEXT_TYPE_TIME = "time";

export const ATTRIBUTE_TEXT_TYPE_ALPHANUMERIC = "alphanumeric";

export const ATTRIBUTE_TEXT_TYPE_ALPHA = "alpha";

export const ATTRIBUTE_TEXT_TYPES_INTEGER = [
  "numeric",
  "integer",
  "biginteger",
  "long",
  "short",
  "count"
];

export const ATTRIBUTE_TEXT_TYPES_DECIMAL = [
  "decimal",
  "float",
  "double",
  "inclusivevaluerange",
  "exclusivevaluerange",
  "incremental"
];

export const ATTRIBUTE_TEXT_TYPE_GREGORIANYEAR = "gregorianyear";
export const ATTRIBUTE_TEXT_TYPE_GREGORIANYEARMONTH = "gregorianyearmonth";
export const ATTRIBUTE_TEXT_TYPE_DAY = "day";
export const ATTRIBUTE_TEXT_TYPE_MONTH = "month";
export const ATTRIBUTE_TEXT_TYPE_YEAR = "year"; // SDMX v2.0
export const ATTRIBUTE_TEXT_TYPE_MONTHDAY = "monthday";
export const ATTRIBUTE_TEXT_TYPE_YEARMONTH = "yearmonth"; // SDMX v2.0
export const ATTRIBUTE_TEXT_TYPE_DATE = "date"; // SDMX v2.0

export const ATTRIBUTE_TEXT_TYPE_FORMAT_DATETIME = "YYYY-MM-DD HH:mm:ss";
export const ATTRIBUTE_TEXT_TYPE_FORMAT_DATE = "YYYY-MM-DD";
export const ATTRIBUTE_TEXT_TYPE_FORMAT_TIME = "HH:mm:ss";

const AUTO_ANNOTATIONS = [
  "repattributeid"
];

/** structures utilities **/

// visit report structure and call map for all node
function getMappedReportTree(tree, map) {
  tree = _.cloneDeep(tree);
  tree = tree.map(root => map(root));
  tree = tree.map(subTree => {
    if (subTree.attributeSet.reportedAttributes) {
      subTree.attributeSet.reportedAttributes = getMappedReportTree(subTree.attributeSet.reportedAttributes, map);
    }
    return subTree;
  });
  return tree;
}

// visit report structure and return, if present, the matching node
export function getReportNode(tree, test) {

  if (!(tree !== null && tree.length)) return null;

  const foundNodes = tree.filter(test);

  if (foundNodes.length) {
    return foundNodes[0];
  } else {
    const foundNodesInChild =
      tree
        .filter(node => node.attributeSet.reportedAttributes)
        .map(node => getReportNode(node.attributeSet.reportedAttributes, test))
        .filter(result => result !== null);

    if (foundNodesInChild.length) {
      return foundNodesInChild[0];
    } else {
      return null;
    }
  }
}

// check if an attribute has "texts" field or not
export const isEmptyAttribute = attr => {
  if (!attr.isFolder && !attr.isPresentational) {
    if (getAttributeType(attr).toLowerCase() === ATTRIBUTE_TEXT_TYPE_BOOLEAN) {
      return false;
    } else if (
      attr.texts === null ||
      attr.texts === undefined ||
      ((typeof attr.texts === 'string' || attr.texts instanceof String) && attr.texts.length === 0) ||
      ((typeof attr.texts === 'object' || attr.texts instanceof Object) && _(attr.texts).pickBy(val => val && val.length > 0).keys().value().length < 1)
    ) {
      return true;
    }
  }
  return false;
};

// gets a tree structure from msd
export const getMsdTree = (msd, conceptSchemes, appLang, dataLangs, annotationsConfig, permissions) => {

  const customIsPresentational = getCustomIsPresentationalFromAnnotations(msd, annotationsConfig);

  // iterates on msd structure and initialize utility fields
  let msdTree = msd.metadataStructureComponents.reportStructureList.reportStructures.map(
    reportStructure => ({
      target: reportStructure.metadataTargetId[0],
      metadataAttributes: getMappedTree(
        reportStructure.metadataAttributeList.metadataAttributes,
        "metadataAttributes",
        node => {
          const isMultiLangAnnot = node.annotations && node.annotations.find(annot =>
            (annot.type || "").toLowerCase() === (annotationsConfig[AUTO_ANNOTATION_IS_MULTILINGUAL_KEY] || "").toLowerCase());
          const isMultiLang = isMultiLangAnnot && isMultiLangAnnot.title === "True";

          const attributeType = getAttributeType(node).toLowerCase();

          return {
            ...node,
            texts: null,
            metadataAttributes: (node.metadataAttributes || []).map(child => ({
              ...child,
              parent: node.id
            })),
            annotations: [],
            autoAnnotations: [],
            isMultiLang: node.id === "DCAT_AP_IT_DATASET_IDENTIFIER"
              ? false
              : (attributeType === ATTRIBUTE_TEXT_TYPE_STRING || attributeType === ATTRIBUTE_TEXT_TYPE_XHTML)
                ? true
                : !!isMultiLang,
            attachment: null,
            attachmentName: null,
            attachmentUploaded: false,
            isPublic: true,
            isPresentational: !customIsPresentational
              ? node.isPresentational
              : (node.isPresentational || (node.metadataAttributes || []).length > 0)
          }
        }
      ),
      identifiableTargets: msd.metadataStructureComponents.metadataTargetList.metadataTargets
        .find(target => target.id === reportStructure.metadataTargetId[0])
        .identifiableTarget
        .map(identifiableTarget => _.pick(identifiableTarget, "id", "objectType"))
    })
  );

  // iterates on msd tree and add folder nodes to handle attribute cardinality
  const getFolderFromNode = node => ({
    ...node,
    id: FOLDER_KEY + node.id,
    isFolder: true,
    metadataAttributes: [{...node, metadataAttributes: []}]
  });
  msdTree = msdTree.map(el => {
    let tempTree = [];
    getMappedTree(
      [el],
      "metadataAttributes",
      node => {
        node.metadataAttributes.forEach(child => {
          const parentNode = getNode(tempTree, "metadataAttributes", ({id}) => id === child.parent);

          if (child.minOccurs !== '1' || child.maxOccurs !== '1') {
            (parentNode ? parentNode.metadataAttributes : tempTree).push(getFolderFromNode(child))
          } else {
            (parentNode ? parentNode.metadataAttributes : tempTree).push({...child, metadataAttributes: []})
          }
        });
        return node
      }
    );

    return ({
      ...el,
      metadataAttributes: tempTree
    })
  });

  // iterates on msd tree and add all the required attributes + an empty one as child of the corresponding folder
  msdTree = msdTree.map(el => ({
    ...el,
    metadataAttributes: getMappedTree(
      el.metadataAttributes,
      "metadataAttributes",
      node => {
        if (node.isFolder) {
          node.id = node.id.substring(FOLDER_KEY.length);

          const metadataAttributes = [];
          for (let i = 1; i <= node.minOccurs; i++) {
            metadataAttributes.push({
              ...node.metadataAttributes[0],
              id: `${i}. ${node.id}`
            })
          }
          metadataAttributes.push({
            ...node.metadataAttributes[0],
            id: (EMPTY_REPORT_ATTRIBUTE_KEY + node.id)
          });
          node.metadataAttributes = metadataAttributes;
        }
        return node
      }
    )
  }));

  // iterates on msd tree and add to all node the corresponding name taken from associated conceptScheme
  msdTree = msdTree.map(el => ({
    ...el,
    metadataAttributes: getMappedTree(
      el.metadataAttributes,
      "metadataAttributes",
      node => {
        const nodeStr = getStringFromArtefactTriplet(getArtefactTripletFromUrn(node.conceptIdentity));
        const nodeConceptScheme = conceptSchemes.find(conceptScheme => getStringFromArtefactTriplet(conceptScheme) === nodeStr);
        if (nodeConceptScheme) {
          const concept = nodeConceptScheme.concepts.find(concept => concept.id === node.conceptIdentity.split(".").pop());
          if (concept) {
            const prefix = node.id.match(/\d+. /g);
            return {
              ...node,
              name: (prefix ? prefix : '') + getLocalizedStr(concept.name, appLang, dataLangs)
            }
          }
        }
        return {
          ...node,
          name: node.id
        }
      })
  }));

  return msdTree
};

// gets report structure from SDMXJson report
export const getReportStructureFromSdmxJsonReport = (msdTree, target, report, t, annotationsConfig, permissions) => {

  // gets text from attribute
  const getTexts = (node, attribute) => {
    if (attribute.texts === null || attribute.texts === undefined) {
      return null
    }

    const attributeType = getAttributeType(node).toLowerCase();

    if (node.localRepresentation.enumeration) {
      return attribute.texts

    } else if (attributeType === ATTRIBUTE_TEXT_TYPE_DATETIME) {
      return moment(attribute.texts["und"], ATTRIBUTE_TEXT_TYPE_FORMAT_DATETIME)

    } else if (attributeType === ATTRIBUTE_TEXT_TYPE_GREGORIANDAY) {
      return moment(attribute.texts["und"], ATTRIBUTE_TEXT_TYPE_FORMAT_DATE)

    } else if (attributeType === ATTRIBUTE_TEXT_TYPE_TIME) {
      return moment(attribute.texts["und"], ATTRIBUTE_TEXT_TYPE_FORMAT_TIME)

    } else if (attributeType === ATTRIBUTE_TEXT_TYPE_BOOLEAN) {
      return (attribute.texts["und"] || "").toLowerCase() === "true"

    } else if (node.isMultiLang) {
      if (attributeType === ATTRIBUTE_TEXT_TYPE_XHTML || attributeType === ATTRIBUTE_TEXT_TYPE_STRING) {
        return _.forOwn(attribute.texts, (val, key) => attribute.texts[key] = decodeURIComponent(val));
      } else {
        return attribute.texts
      }

    } else {
      if (attributeType === ATTRIBUTE_TEXT_TYPE_XHTML || attributeType === ATTRIBUTE_TEXT_TYPE_STRING) {
        return decodeURIComponent(attribute.texts["und"])
      } else {
        return attribute.texts["und"]
      }
    }
  };

  const tree = _.cloneDeep(msdTree);

  // gets the corresponding report structures and add an unique key
  let reportStructure = [];
  reportStructure = tree.find(el => el.target === target).metadataAttributes;
  reportStructure = getMappedTree(reportStructure, "metadataAttributes", node => ({...node, nodeKey: uuidv4()}));

  // if report is defined this need to be initialized
  if (report) {
    reportStructure = getReportStructuresWithPath(reportStructure);
    // remove all empty node added by getMsdTree. this is required to avoid to add empty nodes in the next steps
    reportStructure = getFilteredTree(reportStructure, "metadataAttributes", node =>
      (!node.id || !node.id.match(/\d+\. \w+/g)));

    // iterates on report adding to all nodes "isFolder" taken from the corresponding node in reportStructures
    const reportRoot = [{
      isRoot: true,
      attributeSet: {
        reportedAttributes: report.attributeSet.reportedAttributes
      }
    }];
    report = getMappedReportTree(reportRoot, attr => {
      if (attr.isRoot) {
        return attr
      }
      const node = getNode(reportStructure, "metadataAttributes", node =>
        node.id === attr.id.replace(/\d+. /g, ""));
      return {
        ...attr,
        isFolder: node.isFolder
      }
    });

    // iterates on report adding to all attribute the prefix "N. "
    report = getMappedReportTree(report, attr => {
      let counts = {};
      (attr.attributeSet.reportedAttributes || []).forEach(function (attr) {
        if (attr.isFolder) {
          counts[attr.id] = 1;
        }
      });
      attr.attributeSet.reportedAttributes = (attr.attributeSet.reportedAttributes || []).map(attr => {
        if (!counts[attr.id]) {
          return attr;
        } else {
          const newAttr = {
            ...attr,
            id: counts[attr.id] + '. ' + attr.id
          };
          counts[attr.id] = counts[attr.id] + 1;
          return newAttr
        }
      });
      return attr;
    })[0].attributeSet.reportedAttributes;

    // iterates on report adding to all attribute the path from root
    report = report.map(attr => ({...attr, path: ''}));
    report = getMappedReportTree(report, attr => ({
      ...attr,
      attributeSet: {
        reportedAttributes: (attr.attributeSet.reportedAttributes || []).map(child => ({
          ...child,
          path: attr.path.length > 0
            ? attr.path + '+' + attr.id
            : attr.id
        }))
      }
    }));

    // iterates on report to create or initialize the corresponding node in reportStructures
    getMappedReportTree(report, attr => {
      const node = getNode(reportStructure, "metadataAttributes", node => {
        return (node.id === attr.id.replace(/\d+. /g, "") && node.path === attr.path);
      });

      if (node !== null) {
        const attachmentAnnot = getAttachmentAnnotationFromAnnotations(attr, annotationsConfig);

        const customNoneIsAutoAnnotation = permissions && permissions.rules.includes("CanManageWorkingAnnotation")
          ? () => false
          : undefined;

        if (!node.isFolder && !node.isPresentational) {
          node.texts = getTexts(node, attr);
          node.annotations = _.uniqBy(
            node.annotations
              .concat(getFilteredAnnotations(attr.annotations, annotationsConfig, (customNoneIsAutoAnnotation || isReferenceMetadataAutoAnnotation)))
              .map(annot => ({...annot, text: annot.texts, texts: undefined})),
            "type"
          );
          node.autoAnnotations = _.uniqBy(
            node.autoAnnotations
              .concat(getAutoAnnotations(attr.annotations, annotationsConfig, (customNoneIsAutoAnnotation || isReferenceMetadataAutoAnnotation))),
            "type"
          );
          node.path = attr.path;
          node.nodeKey = uuidv4();
          node.attachment = null;
          node.attachmentName = attachmentAnnot ? attachmentAnnot.title : null;
          node.attachmentUploaded = attachmentAnnot !== null && attachmentAnnot !== undefined;
          node.isPublic = getIsPublicFromAnnotations(attr.annotations, annotationsConfig[AUTO_ANNOTATION_RESTRICTED_FOR_PUBLICATION_KEY]);

        } else if (node.isFolder && (attr.texts || (
          attr.attributeSet && attr.attributeSet.reportedAttributes && attr.attributeSet.reportedAttributes.length > 0
        ))) {
          let newChild = node.metadataAttributes.find(child =>
            child.id === (EMPTY_REPORT_ATTRIBUTE_KEY + attr.id.replace(/\d+. /g, "")));
          node.metadataAttributes.push({
            ...newChild,
            isFolder: null,
            id: `${node.metadataAttributes.length}. ${node.id}`,
            name: `${node.metadataAttributes.length}. ${node.name}`,
            nodeKey: uuidv4(),
            texts: getTexts(newChild, attr),
            annotations: newChild.annotations
              .concat(getFilteredAnnotations(attr.annotations, annotationsConfig, (customNoneIsAutoAnnotation || isReferenceMetadataAutoAnnotation)))
              .map(annot => ({...annot, text: annot.texts, texts: undefined})),
            autoAnnotations: getAutoAnnotations(attr.annotations, annotationsConfig, (customNoneIsAutoAnnotation || isReferenceMetadataAutoAnnotation)),
            path: attr.path,
            attachment: null,
            attachmentName: attachmentAnnot ? attachmentAnnot.title : null,
            attachmentUploaded: attachmentAnnot !== null && attachmentAnnot !== undefined,
            isPublic: getIsPublicFromAnnotations(attr.annotations, annotationsConfig[AUTO_ANNOTATION_RESTRICTED_FOR_PUBLICATION_KEY])
          });
          node.metadataAttributes = getReportStructuresWithPath(node.metadataAttributes)
        }
      } else {
        Modal.warning({
          title: t("components.reportStructureTree.modals.warning.attributeNotPresent.title"),
          content: t("components.reportStructureTree.modals.warning.attributeNotPresent.content", {attributeId: attr.id})
        })
      }

      return attr
    });
  }

  return getFilteredTree(reportStructure, "metadataAttributes", node =>
    (!node.id || !node.id.includes(EMPTY_REPORT_ATTRIBUTE_KEY)));
};

// gets SDMXJson report from report structure
export const getSdmxJsonReportFromReportStructure = (reportStructure, report, annotationsConfig) => {

  // gets text from attribute
  const getTexts = attr => {
    if (attr.texts === null || attr.texts === undefined || attr.isPresentational || attr.isFolder) {
      return null
    }

    const attributeType = getAttributeType(attr).toLowerCase();

    if (attr.localRepresentation.enumeration !== null) {
      return _.pickBy(attr.texts, val => (val || "").length > 0);

    } else if (attributeType === ATTRIBUTE_TEXT_TYPE_DATETIME) {
      return {
        und: moment(attr.texts).format(ATTRIBUTE_TEXT_TYPE_FORMAT_DATETIME)
      }

    } else if (attributeType === ATTRIBUTE_TEXT_TYPE_GREGORIANDAY) {
      return {
        und: moment(attr.texts).format(ATTRIBUTE_TEXT_TYPE_FORMAT_DATE)
      }

    } else if (attributeType === ATTRIBUTE_TEXT_TYPE_TIME) {
      return {
        und: moment(attr.texts).format(ATTRIBUTE_TEXT_TYPE_FORMAT_TIME)
      }

    } else if (attributeType === ATTRIBUTE_TEXT_TYPE_BOOLEAN) {
      return {
        und: attr.texts
      }

    } else if (attr.isMultiLang) {
      if (attributeType === ATTRIBUTE_TEXT_TYPE_XHTML || attributeType === ATTRIBUTE_TEXT_TYPE_STRING) {
        const texts = _.pickBy(attr.texts, val => (val || "").length > 0);
        return _.forOwn(texts, (val, key) => texts[key] = encodeURIComponent(val));
      } else {
        return _.pickBy(attr.texts, val => (val || "").length > 0);
      }

    } else {
      if (attributeType === ATTRIBUTE_TEXT_TYPE_XHTML || attributeType === ATTRIBUTE_TEXT_TYPE_STRING) {
        return {
          und: encodeURIComponent(attr.texts)
        }
      } else {
        return {
          und: attr.texts
        }
      }
    }
  };

  // iterates on reportStructure to create or initialize the corresponding node in report
  reportStructure = getReportStructuresWithPath(reportStructure);
  getMappedTreeDeptFirst(reportStructure, "metadataAttributes", node => {
    if (!node.isFolder) {

      let annotations = (node.annotations || []).map(annot => ({
        ...annot,
        text: undefined,
        texts: annot.text
      }));
      let autoAnnotations = (node.autoAnnotations || []);

      // handling of restricted for publication annotation
      if (annotationsConfig) {
        const isNotPublicAnnotation = (annotations.concat(autoAnnotations)).find(({type}) =>
          (type || "").toLowerCase() === annotationsConfig[AUTO_ANNOTATION_RESTRICTED_FOR_PUBLICATION_KEY].toLowerCase());
        if (node.isPublic) {
          if (isNotPublicAnnotation) {
            annotations = annotations.filter(({type}) =>
              (type || "").toLowerCase() !== annotationsConfig[AUTO_ANNOTATION_RESTRICTED_FOR_PUBLICATION_KEY].toLowerCase())
            autoAnnotations = autoAnnotations.filter(({type}) =>
              (type || "").toLowerCase() !== annotationsConfig[AUTO_ANNOTATION_RESTRICTED_FOR_PUBLICATION_KEY].toLowerCase())
          }
        } else {
          if (!isNotPublicAnnotation) {
            annotations.push({
              id: annotationsConfig[AUTO_ANNOTATION_RESTRICTED_FOR_PUBLICATION_KEY],
              type: annotationsConfig[AUTO_ANNOTATION_RESTRICTED_FOR_PUBLICATION_KEY],
              title: annotationsConfig[AUTO_ANNOTATION_RESTRICTED_FOR_PUBLICATION_KEY]
            })
          }
        }
      }

      const tempNode = {
        id: node.id,
        texts: getTexts(node),
        annotations: annotations.concat(autoAnnotations).length > 0
          ? annotations.concat(autoAnnotations)
          : null,
        attributeSet: {
          reportedAttributes: []
        },
        path: node.path
      };

      if (!node.parent) {
        report.attributeSet.reportedAttributes.push(tempNode);

      } else {
        const reportNode = getReportNode(report.attributeSet.reportedAttributes, attr =>
          node.path === `${attr.path.length > 0 ? (attr.path + '+') : ''}${attr.id}`
        );
        reportNode.attributeSet.reportedAttributes.push(tempNode);
      }
    }

    return node
  });

  // iterates on report to remove all unnecessary fields
  report.attributeSet.reportedAttributes = getMappedReportTree(report.attributeSet.reportedAttributes, attr => ({
    id: attr.id.replace(/\d+. /g, ""),
    texts: attr.texts,
    annotations: attr.annotations,
    attributeSet: attr.attributeSet
  }));

  return report;
};

// iterates on reportStructures adding to all nodes the path to root node
const getReportStructuresWithPath = reportStructure => {

  let reportStructureWithPath = _.cloneDeep(reportStructure);

  reportStructureWithPath = reportStructureWithPath.map(node => ({...node, path: node.path ? node.path : ''}));
  reportStructureWithPath = getMappedTree(reportStructureWithPath, "metadataAttributes", node => ({
    ...node,
    metadataAttributes: node.metadataAttributes.map(child => {
      const childPath = !node.isFolder ? node.id : '';
      return ({
        ...child,
        path: (node.path.length > 0 && childPath.length > 0)
          ? node.path + '+' + childPath
          : node.path + childPath
      })
    })
  }));
  return reportStructureWithPath
};

/** annotations utilities **/

// check if an annotation is an autoAnnotation or a user one
const isReferenceMetadataAutoAnnotation = (annotation, annotationsConfig) => {
  const autoAnnotations = AUTO_ANNOTATIONS
    .concat(annotationsConfig[AUTO_ANNOTATION_FILE_PATH_KEY].toLowerCase())
    .concat(annotationsConfig[AUTO_ANNOTATION_RESTRICTED_FOR_PUBLICATION_KEY].toLowerCase())
    .concat(annotationsConfig[AUTO_ANNOTATION_IS_MULTILINGUAL_KEY].toLowerCase());

  return (
    (annotation.id && autoAnnotations.includes(annotation.id.toLowerCase())) ||
    (annotation.type && autoAnnotations.includes(annotation.type.toLowerCase()))
  )
};

// gets metadataflow triplet from annotations
export const getMetadataflowTripletFromAnnotations = metadataSet => {
  const annotations = (metadataSet && metadataSet.annotations) ? metadataSet.annotations : [];
  const autoAnnotations = (metadataSet && metadataSet.autoAnnotations) ? metadataSet.autoAnnotations : [];

  return ({
    id: ((annotations.concat(autoAnnotations).find(annot => annot.id === "MetadataflowId") || {}).text || {})["en"],
    agencyID: ((annotations.concat(autoAnnotations).find(annot => annot.id === "MetadataflowAgency") || {}).text || {})["en"],
    version: ((annotations.concat(autoAnnotations).find(annot => annot.id === "MetadataflowVersion") || {}).text || {})["en"]
  });
};

// gets db unique id annotation from annotations
export const getDbIdAnnotationFromAnnotations = (artefact, annotationId) => {
  const annotations = (artefact && artefact.annotations) ? artefact.annotations : [];
  const autoAnnotations = (artefact && artefact.autoAnnotations) ? artefact.autoAnnotations : [];

  return annotations.concat(autoAnnotations).find(annot => (annot.id || "").toLowerCase() === annotationId.toLowerCase());
};

// gets attachment annotation from annotations
export const getAttachmentAnnotationFromAnnotations = (attribute, annotationsConfig) => {
  const annotations = (attribute && attribute.annotations) ? attribute.annotations : [];
  const autoAnnotations = (attribute && attribute.autoAnnotations) ? attribute.autoAnnotations : [];

  return annotations.concat(autoAnnotations).find(annot => (annot.type || "").toLowerCase() === (annotationsConfig[AUTO_ANNOTATION_FILE_PATH_KEY] || "").toLowerCase());
};

// check if an attribute is public or not from annotations
const getIsPublicFromAnnotations = (annotations, annotType) =>
  !(annotations || []).find(annot => (annot.type || "").toLowerCase() === annotType.toLowerCase());

const setReportStateAnnotations = (annotations, statusId, statusName) => {
  const stateIdAnnotation = (annotations || []).find(annot => (annot.id || "").toLowerCase() === REPORT_STATE_ID_ANNOTATION_ID.toLowerCase());
  const stateNameAnnotation = (annotations || []).find(annot => (annot.id || "").toLowerCase() === REPORT_STATE_NAME_ANNOTATION_ID.toLowerCase());

  if (stateIdAnnotation) {
    stateIdAnnotation.texts = {en: statusId};
    stateIdAnnotation.text = statusId;
  } else {
    annotations.push({
      id: REPORT_STATE_ID_ANNOTATION_ID,
      texts: {en: statusId},
      text: statusId
    })
  }

  if (stateNameAnnotation) {
    stateNameAnnotation.texts = {en: statusName};
    stateNameAnnotation.text = statusName;
  } else {
    annotations.push({
      id: REPORT_STATE_NAME_ANNOTATION_ID,
      texts: {en: statusName},
      text: statusName
    })
  }
};

export const updateReportStateAnnotations = (annotations, isDraft) => {

  if (isDraft) {
    setReportStateAnnotations(annotations, REPORT_STATE_DRAFT_ID, REPORT_STATE_DRAFT)
  } else {
    setReportStateAnnotations(annotations, REPORT_STATE_NOT_PUBLISHED_ID, REPORT_STATE_NOT_PUBLISHED)
  }

  return annotations
};

// checks if an attribute with children should be treated as presentational
export const getCustomIsPresentationalFromAnnotations = (msd, annotationsConfig) => {
  const annotations = (msd && msd.annotations) ? msd.annotations : [];
  const autoAnnotations = (msd && msd.autoAnnotations) ? msd.autoAnnotations : [];

  return !!(annotations.concat(autoAnnotations)).find(({type}) => (type || "").toLowerCase() === (annotationsConfig[AUTO_ANNOTATION_CUSTOM_IS_PRESENTATIONAL_KEY] || "").toLowerCase());
};

export const removeAttachmentAnnotation = (attribute, annotationsConfig) => {
  attribute.annotations = (attribute.annotations || []).filter(annot =>
    (annot.type || "").toLowerCase() !== (annotationsConfig[AUTO_ANNOTATION_FILE_PATH_KEY] || "").toLowerCase()
  );
  attribute.autoAnnotations = (attribute.autoAnnotations || []).filter(annot =>
    (annot.type || "").toLowerCase() !== (annotationsConfig[AUTO_ANNOTATION_FILE_PATH_KEY] || "").toLowerCase()
  );
};

export const addAttachmentAnnotation = (attribute, permissions, annotation) => {
  if (permissions && permissions.rules.includes("CanManageWorkingAnnotation")) {
    attribute.annotations.push(annotation);
  } else {
    attribute.autoAnnotations.push(annotation);
  }
};

// utility to get categorisation list from annotations
export const getCategorisationsFromAnnotations = artefact => {
  const annotations = (artefact.annotations || []).concat(artefact.autoAnnotations || []);

  return annotations.length > 0
    ? annotations
      .filter(annot => String(annot.id).substring(0, 14) === "categorisation")
      .map(({text}) => text["en"])
      .map(categorisationStr => {
          const categorisation = categorisationStr.split('+');
          return {
            id: categorisation[0],
            agencyID: categorisation[1],
            version: categorisation[2],
            source: categorisation[3],
            target: categorisation[4],
          }
        }
      )
    : null
};

/** utilities **/

// gets attribute type from attribute node
export const getAttributeType = attribute => (((attribute.localRepresentation || {}).textFormat || {}).textType || "");

// gets the link to the metadata set html preview page
export const getMetadataSetHtmlPageUrl = (nodeId, metadataSetId, lang) => {
  const currUrl = window.location;
  const baseUrl = currUrl.protocol + "//" + currUrl.host + currUrl.pathname;
  return `${baseUrl}${baseUrl.slice(-1) === '/' ? '' : '/'}static/referenceMetadata/MetadatasetTemplate.html` +
    `?nodeId=${nodeId}&metadataSetId=${metadataSetId}&lang=${lang}`
};

// gets the link to the DCAT-AP_IT metadata set html preview page
export const getDcatMetadataSetHtmlPageUrl = (nodeId, metadataSetId, lang) => {
  const currUrl = window.location;
  const baseUrl = currUrl.protocol + "//" + currUrl.host + currUrl.pathname;
  return `${baseUrl}${baseUrl.slice(-1) === '/' ? '' : '/'}static/referenceMetadata/DCAT-APTemplate.html` +
    `?nodeId=${nodeId}&metadataSetId=${metadataSetId}&lang=${lang}`
};

// gets the link to the DCAT-AP_IT metadata set html category page
export const getDcatMetadataSetCategoryHtmlPageUrl = (nodeId, metadataSetId, lang) => {
  const currUrl = window.location;
  const baseUrl = currUrl.protocol + "//" + currUrl.host + currUrl.pathname;
  return `${baseUrl}${baseUrl.slice(-1) === '/' ? '' : '/'}static/referenceMetadata/CategoryTemplate.html` +
    `?nodeId=${nodeId}&metadataSetId=${metadataSetId}&lang=${lang}`
};

// gets the link to the report html preview page
export const getReportHtmlPageUrl = (nodeId, metadataSetId, reportId, lang) => {
  const currUrl = window.location;
  const baseUrl = currUrl.protocol + "//" + currUrl.host + currUrl.pathname;
  return `${baseUrl}${baseUrl.slice(-1) === '/' ? '' : '/'}static/referenceMetadata/GenericMetadataTemplate.html` +
    `?nodeId=${nodeId}&metadataSetId=${metadataSetId}&reportId=${reportId}&lang=${lang}`
};

// gets the link to the Metadata Api "getMetadatada"
export const getMetadataApiReportUrl = (metadataApiBaseUrl, metadataSetId, reportId) => {
  return `${metadataApiBaseUrl}${metadataApiBaseUrl.slice(-1) === '/' ? '' : '/'}api/getMetadata?metadataSetId=${metadataSetId}&reportId=${reportId}`;
};

// gets the link to the MetadataApi "package_show"
export const getMetadataApiDcatReportUrl = (metadataApiBaseUrl, metadataSetId, reportId, lang) => {
  return `${metadataApiBaseUrl}${metadataApiBaseUrl.slice(-1) === '/' ? '' : '/'}${lang}/${metadataSetId}/api/3/action/package_show?id=${reportId}`;
};

// gets the link to the MetadataApi "package_search"
export const getMetadataApiDcatMetadataSetUrl = (metadataApiBaseUrl, metadataSetId, lang) => {
  return `${metadataApiBaseUrl}${metadataApiBaseUrl.slice(-1) === '/' ? '' : '/'}${lang}/${metadataSetId}/api/3/action/package_search`;
};

// gets the next available index for a folder node child
export const getNextAttributeIndexAvailable = array => {
  for (let i = 1; i <= array.length; i++) {
    if (!array.find(el => i === Number(el.id.substring(0, String(i).length)))) {
      return i
    }
  }
  return array.length + 1
};

const getRegexExp = attributeType => {

  const type = (attributeType || "").toLowerCase();

  if (type === ATTRIBUTE_TEXT_TYPE_ALPHA) {
    return /^[a-z ]*$/gim;
  } else if (type === ATTRIBUTE_TEXT_TYPE_ALPHANUMERIC) {
    return /^[a-z0-9 ]*$/gim;
  } else if (ATTRIBUTE_TEXT_TYPES_INTEGER.includes(type)) {
    return /^[0-9]*$/gim;
  } else if (ATTRIBUTE_TEXT_TYPES_DECIMAL.includes(type)) {
    return /^([+-])?([0-9]+(([.,])[0-9]+)?|([.,])[0-9]+)$/gim;
  } else if (type === ATTRIBUTE_TEXT_TYPE_DAY) {
    return /^(0[1-9]|[12][0-9]|3[01])$/gim;
  } else if (type === ATTRIBUTE_TEXT_TYPE_MONTH) {
    return /^(0[1-9]|1[0-2])$/gim;
  } else if (type === ATTRIBUTE_TEXT_TYPE_YEAR || type === ATTRIBUTE_TEXT_TYPE_GREGORIANYEAR) {
    return /^[0-9]{4}$/gim;
  } else if (type === ATTRIBUTE_TEXT_TYPE_MONTHDAY) {
    return /^(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/gim;
  } else if (type === ATTRIBUTE_TEXT_TYPE_YEARMONTH || type === ATTRIBUTE_TEXT_TYPE_GREGORIANYEARMONTH) {
    return /^([0-9]{4})-(0[1-9]|1[0-2])$/gim;
  } else if (type === ATTRIBUTE_TEXT_TYPE_DATE) {
    return /^([0-9]{4})-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/gim;
  } else {
    return /^.*$/gim;
  }
};

export const isAttributeValueValid = attribute => {

  if (!attribute || !attribute.texts) {
    return true;
  }

  const attributeType = getAttributeType(attribute);
  const values = [];

  if (!attribute.isMultiLang) {
    values.push(attribute.texts);
  } else {
    for (let key in attribute.texts) {
      if (attribute.texts.hasOwnProperty(key)) {
        values.push(attribute.texts[key]);
      }
    }
  }

  return !values.find(val => !getRegexExp(attributeType).test(val));
};