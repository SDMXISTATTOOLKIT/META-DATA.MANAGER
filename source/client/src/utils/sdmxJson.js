import _ from 'lodash';
import moment from 'moment';
import {getAutoAnnotations, getFilteredAnnotations, getItemOrder} from "./artefacts";

export const SDMX_JSON_DSD_URN_NAMESPACE = 'org.sdmx.infomodel.datastructure.DataStructure';
export const SDMX_JSON_DATAFLOW_URN_NAMESPACE = 'org.sdmx.infomodel.datastructure.Dataflow';
export const SDMX_JSON_MSD_URN_NAMESPACE = 'org.sdmx.infomodel.metadatastructure.MetadataStructure';
export const SDMX_JSON_METADATAFLOW_URN_NAMESPACE = 'org.sdmx.infomodel.metadatastructure.Metadataflow';
export const SDMX_JSON_CODELIST_URN_NAMESPACE = 'org.sdmx.infomodel.datastructure.Codelist';
export const SDMX_JSON_CATEGORY_SCHEME_URN_NAMESPACE = 'org.sdmx.infomodel.datastructure.CategoryScheme';
export const SDMX_JSON_CONCEPT_SCEHME_URN_NAMESPACE = 'org.sdmx.infomodel.datastructure.ConceptScheme';

export const SDMX_JSON_DATAFLOW_LIST_KEY = 'dataflows';
export const SDMX_JSON_AGENCY_SCHEME_LIST_KEY = 'agencySchemes';
export const SDMX_JSON_CATEGORY_SCHEME_LIST_KEY = 'categorySchemes';
export const SDMX_JSON_CONCEPT_SCHEME_LIST_KEY = 'conceptSchemes';
export const SDMX_JSON_CATEGORISATION_LIST_KEY = 'categorisations';
export const SDMX_JSON_CODELIST_LIST_KEY = 'codelists';
export const SDMX_JSON_DSD_LIST_KEY = 'dataStructures';
export const SDMX_JSON_CONTENT_CONSTRAINT_LIST_KEY = 'contentConstraints';
export const SDMX_JSON_METADATAFLOW_LIST_KEY = 'metadataflows';
export const SDMX_JSON_MSD_LIST_KEY = 'msds';
export const SDMX_JSON_HIERARCHICAL_CODELIST_LIST_KEY = 'hierarchicalCodelist';
export const SDMX_JSON_METADATA_SET_LIST_KEY = 'metadataSets';

export const SDMX_JSON_CODELIST_ITEMS_KEY = 'codes';
export const SDMX_JSON_CONCEPT_SCHEME_ITEMS_KEY = 'concepts';
export const SDMX_JSON_AGENCY_SCHEME_ITEMS_KEY = 'agencies';

export const FILTER_MODE_IN = 'FILTER_MODE_IN';
export const FILTER_MODE_NOT_IN = 'FILTER_MODE_NOT_IN';

export const CODELIST_ORDER_ANNOTATION_KEY = "codelistsOrder";
export const CONCEPT_SCHEME_ORDER_ANNOTATION_KEY = "conceptSchemesOrder";
export const CATEGORY_SCHEME_ORDER_ANNOTATION_KEY = "categorySchemesOrder";

/* READ */

export const getSdmxStructuresFromSdmxJson = (json, sdmxJsonStructuresType) =>
  json.data[sdmxJsonStructuresType || Object.keys(json.data)[0]] || [];

export const getItemFromSdmxJsonStructure = (item, annotationsConfig, orderAnnotationKey, customIsAutoAnnotation) => ({
  ...item,
  names: undefined, // fix after sdmx-source update 1.17
  name: item.names, // fix after sdmx-source update 1.17
  descriptions: undefined, // fix after sdmx-source update 1.17
  description: item.descriptions, // fix after sdmx-source update 1.17
  annotations: (item.annotations && annotationsConfig)
    ? getFilteredAnnotations(item.annotations, annotationsConfig, customIsAutoAnnotation).map(annot => ({
      ...annot,
      text: annot.texts, // fix after sdmx-source update 1.17
      texts: undefined // fix after sdmx-source update 1.17
    }))
    : undefined,
  autoAnnotations: (item.annotations && annotationsConfig)
    ? getAutoAnnotations(item.annotations, annotationsConfig, customIsAutoAnnotation).map(annot => ({
      ...annot,
      text: annot.texts, // fix after sdmx-source update 1.17
      texts: undefined // fix after sdmx-source update 1.17
    }))
    : undefined,
  order: (item.annotations && annotationsConfig && orderAnnotationKey)
    ? getItemOrder(item, annotationsConfig[orderAnnotationKey])
    : undefined
});


export const DSD_DIMENSION_TYPE_NORMAL = 'Dimension';
export const DSD_DIMENSION_TYPE_FREQUENCY = 'Frequency Dimension';
export const DSD_DIMENSION_TYPE_TIME = 'Time Dimension';
export const DSD_DIMENSION_TYPE_MEASURE = 'Measure Dimension';

export const DSD_DIMENSION_ID_FREQUENCY = "FREQ";
export const DSD_DIMENSION_ID_TIME = "TIME_PERIOD";

export const DSD_ATTRIBUTE_ATTACHMENT_LEVEL_OBSERVATION = 'Observation';
export const DSD_ATTRIBUTE_ATTACHMENT_LEVEL_GROUP = 'Group';
export const DSD_ATTRIBUTE_ATTACHMENT_LEVEL_SERIES = 'Series';
export const DSD_ATTRIBUTE_ATTACHMENT_LEVEL_DATASET = 'Dataset';

export const getDsdComponentFromSdmxJsonStructure = comp => {
  let attachmentLevel = null;
  let attachmentGroup = null;
  if (comp.attributeRelationship && comp.attributeRelationship.hasOwnProperty('dimensions')) {
    attachmentLevel = 'Series';
  } else if (comp.attributeRelationship && comp.attributeRelationship.hasOwnProperty('primaryMeasure')) {
    attachmentLevel = 'Observation';
  } else if (comp.attributeRelationship && comp.attributeRelationship.hasOwnProperty('attachmentGroups')) {
    attachmentLevel = 'Group';
    attachmentGroup =
      comp.attributeRelationship.attachmentGroups && comp.attributeRelationship.attachmentGroups.length
        ? comp.attributeRelationship.attachmentGroups[0]
        : null;
  } else if (_.isEmpty(comp.attributeRelationship)) {
    attachmentLevel = 'Dataset';
  }
  return ({
    ...comp,
    attachmentLevel,
    attachmentGroup,
    annotations: comp.annotations ?
      comp.annotations.map(annot => ({
        ...annot,
        text: annot.texts, // fix after sdmx-source update 1.17
        texts: undefined // fix after sdmx-source update 1.17
      }))
      : undefined,
    concept: comp.conceptIdentity,
    representation: (comp.localRepresentation || {}).enumeration || null,
    attachedDimensions: (comp.attributeRelationship || {}).dimensions || null
  });
};


export const getSdmxJsonStructureFromDsd = dsd => ({
  ...getSdmxJsonStructureFromArtefact(dsd),
  dataStructureComponents: {
    measureList: {
      id: "MeasureDescriptor",
      primaryMeasure: {
        ...getSdmxJsonStructureFromDsdComponent(dsd.primaryMeasure),
      },
    },
    dimensionList: {
      id: "DimensionDescriptor",
      dimensions:
        dsd.dimensions
          .filter(({type}) => type === DSD_DIMENSION_TYPE_NORMAL || type === DSD_DIMENSION_TYPE_FREQUENCY)
          .map(dim => ({
            ...getSdmxJsonStructureFromDsdComponent(dim),
            type: "Dimension"
          }))
        || undefined,
      measureDimensions:
        dsd.dimensions
          .filter(({type}) => type === DSD_DIMENSION_TYPE_MEASURE)
          .map(dim => ({
            ...getSdmxJsonStructureFromDsdComponent(dim),
            type: "MeasureDimension"
          }))
        || undefined,
      timeDimensions:
        dsd.dimensions
          .filter(({type}) => type === DSD_DIMENSION_TYPE_TIME)
          .map(dim => ({
            ...getSdmxJsonStructureFromDsdComponent(dim),
            type: "TimeDimension",
            localRepresentation: {
              textFormat: {
                textType: "ObservationalTimePeriod",
                isSequence: false,
                isMultiLingual: false
              }
            }
          }))
        || undefined,
    },
    groups: dsd.groups ? dsd.groups.map(getSdmxJsonStructureFromDsdComponent) : undefined,
    attributeList:
      dsd.attributes
        ? {
          id: "AttributeDescriptor",
          attributes:
            dsd.attributes
              .sort((a, b) => a.order - b.order)
              .map(attr => ({
                ...getSdmxJsonStructureFromDsdComponent(attr),
                position: undefined,
                attributeRelationship:
                  attr.attachmentLevel === DSD_ATTRIBUTE_ATTACHMENT_LEVEL_SERIES
                    ? {dimensions: attr.attachedDimensions}
                    : attr.attachmentLevel === DSD_ATTRIBUTE_ATTACHMENT_LEVEL_GROUP ?
                    {attachmentGroups: [attr.attachmentGroup]}
                    : attr.attachmentLevel === DSD_ATTRIBUTE_ATTACHMENT_LEVEL_DATASET ?
                      {}
                      :
                      {
                        ...attr.attributeRelationship,
                        primaryMeasure: "OBS_VALUE"
                      }
              }))
        }
        : undefined
  }
});

export const getDsdFromSdmxJsonStructure = (dsd, annotationsConfig, customIsAutoAnnotation) => ({
  ...getArtefactFromSdmxJsonStructure(dsd, annotationsConfig, customIsAutoAnnotation),
  primaryMeasure: getDsdComponentFromSdmxJsonStructure(dsd.dataStructureComponents.measureList.primaryMeasure),
  dimensions: [
    ...dsd.dataStructureComponents.dimensionList.dimensions.map(dim => ({
      ...dim,
      type:
        dim.id === DSD_DIMENSION_ID_FREQUENCY
          ? DSD_DIMENSION_TYPE_FREQUENCY
          : DSD_DIMENSION_TYPE_NORMAL
    })),
    ...(dsd.dataStructureComponents.dimensionList.measureDimensions || []).map(dim => ({
      ...dim,
      type: DSD_DIMENSION_TYPE_MEASURE
    })),
    ...(dsd.dataStructureComponents.dimensionList.timeDimensions || []).map(dim => ({
      ...dim,
      type: DSD_DIMENSION_TYPE_TIME
    }))
  ]
    .map(getDsdComponentFromSdmxJsonStructure)
    .map(dim => ({
      ...dim,
      order: dim.position + 1
    })),
  groups: dsd.dataStructureComponents.groups
    ? dsd.dataStructureComponents.groups.map(getDsdComponentFromSdmxJsonStructure)
    : null,
  attributes:
    (dsd.dataStructureComponents.attributeList || {}).attributes
      ? dsd.dataStructureComponents.attributeList.attributes
        .map(getDsdComponentFromSdmxJsonStructure)
        .map((attr, index) => ({
          ...attr,
          order: index + 1
        }))
      : null,
  dataStructureComponents: {
    ...dsd.dataStructureComponents,
    attributeList:
      dsd.dataStructureComponents.attributeList
        ? {
          ...dsd.dataStructureComponents.attributeList,
          attributes: dsd.dataStructureComponents.attributeList.attributes.map(getDsdComponentFromSdmxJsonStructure)
        }
        : undefined
  }
});

export const getContentConstraintFromSdmxJsonStructure = (contentConstraint, annotationsConfig) => {

  const filter = {};
  let timePeriod = null;

  if (contentConstraint.cubeRegions) {
    contentConstraint.cubeRegions.forEach(({isIncluded, keyValues}) =>
      keyValues.forEach(keyValue => {
        if (keyValue.id === "TIME_PERIOD") {
          timePeriod = {
            isIncluded: true,
            keyValues: [_.cloneDeep(keyValue)]
          };
        } else {
          if (filter[keyValue.id] === undefined) {
            filter[keyValue.id] = {
              mode: isIncluded ? FILTER_MODE_IN : FILTER_MODE_NOT_IN,
              values: []
            };
          }
          filter[keyValue.id].values.push(...(keyValue.values || []));
        }
      })
    );
  }

  return {
    contentConstraint: getArtefactFromSdmxJsonStructure(contentConstraint, annotationsConfig),
    attachmentType:
      getTypeFromUrn(
        (contentConstraint.constraintAttachment.dataStructures || contentConstraint.constraintAttachment.dataflows)[0]
      ),
    attachmentUrn:
      (contentConstraint.constraintAttachment.dataStructures || contentConstraint.constraintAttachment.dataflows)[0],
    filter: filter,
    timePeriod: timePeriod
  };
};

const getTypeFromUrn = urn => urn.split("=")[0].split(".").splice(-1)[0];

export const getSdmxJsonStructureFromDsdComponent = comp => {

  const annotations = (comp.annotations && comp.annotations.length > 0)
    ? comp.annotations
      .filter(annot => !_.isEmpty(annot))
      .map(annot => ({
        id: annot.id ? annot.id : undefined,
        title: annot.title ? annot.title : undefined,
        type: annot.type ? annot.type : undefined,
        texts: annot.text ? _.pickBy(annot.text, val => val.length > 0) : undefined // fix after sdmx-source update 1.17
      }))
    : [];

  return ({
    id: comp.id,
    position: comp.order ? comp.order - 1 : undefined,
    conceptIdentity: comp.concept,
    localRepresentation: comp.representation ? {enumeration: comp.representation} : undefined,
    attributeRelationship:
      comp.attachedDimensions
        ? {dimensions: comp.attachedDimensions}
        : (
          comp.attachmentGroup
            ? {attachmentGroups: [comp.attachmentGroup]}
            : undefined
        ),
    groupDimensions: comp.groupDimensions || undefined,
    assignmentStatus: comp.assignmentStatus || undefined,
    annotations: (annotations && annotations.length > 0) ? annotations : undefined
  })
};

export const getItemSchemeFromSdmxJsonFactory = (itemsKey, annotationsConfig, orderAnnotationKey, customIsAutoAnnotation) => itemScheme => {

  let res = getArtefactFromSdmxJsonStructure(itemScheme, annotationsConfig, customIsAutoAnnotation);
  if (itemsKey && res[itemsKey]) {
    res[itemsKey] = itemScheme[itemsKey].map(item => getItemFromSdmxJsonStructure(item, annotationsConfig, orderAnnotationKey, customIsAutoAnnotation));
  }
  return res;
};

export const getArtefactFromSdmxJsonStructure = (artefact, annotationsConfig, customIsAutoAnnotation) => ({
  ...artefact,
  names: undefined, // fix after sdmx-source update 1.17
  name: artefact.names, // fix after sdmx-source update 1.17
  descriptions: undefined, // fix after sdmx-source update 1.17
  description: artefact.descriptions, // fix after sdmx-source update 1.17
  isFinal: artefact.isFinal || false,
  validFrom: (artefact.validFrom && moment(artefact.validFrom).unix() > 0)
    ? moment(artefact.validFrom)
    : undefined,
  validTo: (artefact.validTo && moment(artefact.validTo).unix() > 0)
    ? moment(artefact.validTo)
    : undefined,
  reportingBegin: (artefact.reportingBegin && moment(artefact.reportingBegin).unix() > 0)
    ? moment(artefact.reportingBegin)
    : undefined,
  reportingEnd: (artefact.reportingEnd && moment(artefact.reportingEnd).unix() > 0)
    ? moment(artefact.reportingEnd)
    : undefined,
  annotations: artefact.annotations
    ? getFilteredAnnotations(artefact.annotations, annotationsConfig, customIsAutoAnnotation).map(annot => ({
      ...annot,
      text: annot.texts, // fix after sdmx-source update 1.17
      texts: undefined // fix after sdmx-source update 1.17
    }))
    : undefined,
  autoAnnotations: artefact.annotations
    ? getAutoAnnotations(artefact.annotations, annotationsConfig, customIsAutoAnnotation).map(annot => ({
      ...annot,
      text: annot.texts, // fix after sdmx-source update 1.17
      texts: undefined // fix after sdmx-source update 1.17
    }))
    : undefined
});

/* WRITE */

export const getSdmxJsonFromSdmxJsonStructures = (structures, sdmxJsonStructuresType) => ({
  meta: {},
  data: {
    [sdmxJsonStructuresType]: structures
  }
});

export const getSdmxJsonStructureFromContentConstraint = (contentConstraint, attachmentType, attachmentUrn, filter, timePeriod) => {

  let cubeRegions = [];

  if (filter !== null) {
    Object.keys(filter)
      .filter(id => filter[id].values.length > 0)
      .forEach(id =>
        cubeRegions.push({
          isIncluded: filter[id].mode === FILTER_MODE_IN,
          keyValues: [{id, values: filter[id].values}]
        }))
  }
  if (timePeriod !== null && timePeriod !== undefined) {
    cubeRegions.push(timePeriod)
  }

  return {
    ...getSdmxJsonStructureFromArtefact(contentConstraint),
    type: "Actual",
    constraintAttachment: {
      [attachmentType === "dsd" ? "dataStructures" : "dataflows"]:
        [attachmentUrn]
    },
    cubeRegions: cubeRegions.length > 0 ? cubeRegions : undefined
  }
};

export const getSdmxJsonStructureFromArtefact = artefact => {
  let annotations = (artefact.annotations && artefact.annotations.length > 0)
    ? artefact.annotations
      .filter(annot => !_.isEmpty(annot))
      .map(annot => ({
          id: annot.id ? annot.id : undefined,
          title: annot.title ? annot.title : undefined,
          type: annot.type ? annot.type : undefined,
          texts: annot.text ? _.pickBy(annot.text, val => val && val.length > 0) : undefined // fix after sdmx-source update 1.17
        })
      )
    : [];
  const autoAnnotations = (artefact.autoAnnotations && artefact.autoAnnotations.length > 0)
    ? artefact.autoAnnotations
      .filter(annot => !_.isEmpty(annot))
      .map(annot => ({
          id: annot.id ? annot.id : undefined,
          title: annot.title ? annot.title : undefined,
          type: annot.type ? annot.type : undefined,
          texts: annot.text ? _.pickBy(annot.text, val => val && val.length > 0) : undefined // fix after sdmx-source update 1.17
        })
      )
    : [];
  annotations = annotations.concat(autoAnnotations);

  const description = _.pickBy(artefact.description, val => val && val.length > 0);

  return ({
    id: artefact.id,
    version: artefact.version,
    agencyID: artefact.agencyID,
    isFinal: artefact.isFinal || undefined,
    uri: artefact.uri && artefact.uri.length > 0 ? artefact.uri : undefined,
    validFrom: artefact.validFrom ? artefact.validFrom : undefined,
    validTo: artefact.validTo ? artefact.validTo : undefined,
    reportingBegin: artefact.reportingBegin ? artefact.reportingBegin : undefined,
    reportingEnd: artefact.reportingEnd ? artefact.reportingEnd : undefined,
    publicationYear: artefact.publicationYear ? artefact.publicationYear : undefined,
    publicationPeriod: artefact.publicationPeriod ? artefact.publicationPeriod : undefined,
    names: _.pickBy(artefact.name, val => val.length > 0), // fix after sdmx-source update 1.17
    descriptions: !_.isEmpty(description) ? description : undefined, // fix after sdmx-source update 1.17
    annotations: (annotations && annotations.length > 0) ? annotations : undefined,
    structure: artefact.structure ? artefact.structure : undefined,
    structureRef: artefact.structureRef ? artefact.structureRef : undefined,
    source: artefact.source ? artefact.source : undefined,
    target: artefact.target ? artefact.target : undefined,
    codes: (artefact.codes && artefact.codes.length > 0) ? artefact.codes : undefined,
    categories: (artefact.categories && artefact.categories.length > 0) ? artefact.categories : undefined,
    concepts: (artefact.concepts && artefact.concepts.length > 0) ? artefact.concepts : undefined,
    agencies: (artefact.agencies && artefact.agencies.length > 0) ? artefact.agencies : undefined,
    reports: artefact.reports ? artefact.reports : undefined
  })
};

export const getSdmxJsonStructureFromItem = (item, orderAnnotationType) => {

  if (orderAnnotationType && item.order !== undefined) {
    if (item.order !== null && !_.isEmpty(_.pickBy(item.order, val => val.length > 0))) {
      if (item.autoAnnotations) {
        if (_.find(item.autoAnnotations, annotation => annotation.type === orderAnnotationType)) {
          const correctValues = _.pickBy(item.order, val => val.length > 0);
          _.find(item.autoAnnotations, annotation => annotation.type === orderAnnotationType).texts =
            !_.isEmpty(correctValues)
              ? correctValues
              : undefined;
        } else {
          const correctValues = _.pickBy(item.order, val => val.length > 0);
          item.autoAnnotations.push({
            type: orderAnnotationType,
            text: !_.isEmpty(correctValues)
              ? correctValues
              : undefined
          })
        }
      } else {
        const correctValues = _.pickBy(item.order, val => val.length > 0);
        item.autoAnnotations = [{
          type: orderAnnotationType,
          text: !_.isEmpty(correctValues)
            ? correctValues
            : undefined
        }]
      }
    } else {
      if (item.autoAnnotations) {
        if (_.find(item.autoAnnotations, annotation => annotation.type === orderAnnotationType)) {
          item.autoAnnotations = item.autoAnnotations.filter(annot => annot.type !== orderAnnotationType);
        }
      }
    }
  }

  let annotations = (item.annotations && item.annotations.length > 0)
    ? item.annotations
      .filter(annot => !_.isEmpty(annot))
      .map(annot => {
        const correctValue = _.pickBy(annot.text, val => val.length > 0);
        return ({
          id: annot.id ? annot.id : undefined,
          title: annot.title ? annot.title : undefined,
          type: annot.type ? annot.type : undefined,
          texts: (annot.text && !_.isEmpty(correctValue)) ? correctValue : undefined // fix after sdmx-source update 1.17
        })
      })
    : null;
  const autoAnnotations = (item.autoAnnotations && item.autoAnnotations.length > 0)
    ? item.autoAnnotations
      .filter(annot => !_.isEmpty(annot))
      .map(annot => {
        const correctValue = _.pickBy(annot.text, val => val.length > 0);
        return ({
          id: annot.id ? annot.id : undefined,
          title: annot.title ? annot.title : undefined,
          type: annot.type ? annot.type : undefined,
          texts: (annot.text && !_.isEmpty(correctValue)) ? correctValue : undefined // fix after sdmx-source update 1.17
        })
      })
    : null;
  annotations = (annotations || []).concat(autoAnnotations || []);

  const description = _.pickBy(item.description, val => val.length > 0);

  return {
    id: item.id,
    names: _.pickBy(item.name, val => val.length > 0), // fix after sdmx-source update 1.17
    parent: item.parent || undefined,
    categories: item.categories
      ? item.categories.map(item => getSdmxJsonStructureFromItem(item, orderAnnotationType))
      : undefined,
    annotations: (annotations && annotations.length > 0) ? annotations : undefined,
    descriptions: !_.isEmpty(description) ? description : undefined, // fix after sdmx-source update 1.17
  }
};

/* URN & STRINGS */

export function getCategoryIdFromUrn(urn) {
  return urn.split('=')[1].split('.').length > 2
    ? urn.substr(urn.lastIndexOf('.') + 1)
    : getArtefactTripletFromUrn(urn).id;
}

export const getArtefactTripletFromString = str => {
  const split = str.split('+');
  return ({
    id: split[0],
    agencyID: split[1],
    version: split[2]
  });
};

export const getArtefactTripletFromUrn = str => {
  const substr = str.split('=')[1];
  return ({
    id: substr.split(':')[1].split('(')[0],
    agencyID: substr.split(':')[0],
    version: substr.split('(')[1].split(')')[0],
  });
};

export const getUrnFromArtefactTriplet = ({id, agencyID, version}, structureTypeUrnNamespace) =>
  `urn:sdmx:${structureTypeUrnNamespace}=${agencyID}:${id}(${version})`;

export const getStringFromArtefactTriplet = ({id, agencyID, version}) => `${id}+${agencyID}+${version}`;

export function getUrnFromArtefact(artefact) {
  return artefact.urn || artefact.links.filter(link => link.rel === 'self')[0].urn;
}

export function getStringFromItemUrn(urn) {
  return `(${getStringFromArtefactTriplet(getArtefactTripletFromUrn(urn))}) ` + urn.split(".").pop();
}

/* OTHER */

export function isArtefactChildOfArtefact(child, parent) {
  const childUrn = getUrnFromArtefact(child);

  if (childUrn.lastIndexOf(")") === childUrn.length - 1) {
    return false; // è un category scheme
  } else {
    const parentUrn = getUrnFromArtefact(parent);

    const str = childUrn.substr(childUrn.indexOf("="));

    return str.substr(0, str.lastIndexOf(".")) === parentUrn.substr(parentUrn.indexOf("="));
  }
}

export function getTypeFromArtefact(artefact) {
  return artefact.links.filter(link => link.rel === 'self')[0].type
}

export function getQuartupletFromItemString(str) {
  return ({
    id: str.split('(')[1].split('+')[0],
    agencyID: str.split('(')[1].split('+')[1],
    version: str.split('(')[1].split('+')[2].split(")")[0],
    itemId: str.split(')')[1].split(' ')[1],
  });
}
