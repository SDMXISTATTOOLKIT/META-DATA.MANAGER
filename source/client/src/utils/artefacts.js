import _ from "lodash";

const AUTO_ANNOTATION_KEYS = [
  "categorySchemesOrder",
  "conceptSchemesOrder",
  "codelistsOrder",
  "associatedCube",
  "changed",
  "customDSD",
  "ddbDataflow",
  "haveMetadata",
  "metadataset",
  "customIsPresentational"
];
const AUTO_ANNOTATION_NONPRODUCTIONDATAFLOW_TYPE = "nonproductiondataflow";

export const updateItemOrder = (item, order, itemsOrderAnnotationType, lang) => {

  item.order
    ? item.order[lang] = order
    : item.order = {
      [lang]: order
    };

  if (itemsOrderAnnotationType) {
    if (item.autoAnnotations) {
      if (_.find(item.autoAnnotations, annotation => annotation.type === itemsOrderAnnotationType)) {
        _.find(item.autoAnnotations, annotation => annotation.type === itemsOrderAnnotationType).text[lang] = order;
      } else {
        item.autoAnnotations.push({
          type: itemsOrderAnnotationType,
          text: {[lang]: order}
        });
      }
    } else {
      item.autoAnnotations = [{
        type: itemsOrderAnnotationType,
        text: {[lang]: order}
      }]
    }
  }
};

export const itemsOrderCompare = (a, b, lang) => {
  if (Number(a.order[lang]) > Number(b.order[lang])) {
    return 1;
  }
  if (Number(a.order[lang]) < Number(b.order[lang])) {
    return -1;
  }
  return 0;
};

export const isAutoAnnotation = (annotation, annotationsConfig) => {
  const autoAnnotationTypes = (_.flatMap(_.pick(annotationsConfig, AUTO_ANNOTATION_KEYS)))
    .concat(AUTO_ANNOTATION_NONPRODUCTIONDATAFLOW_TYPE)
    .map(annot => annot.toLowerCase());

  return annotation.type && autoAnnotationTypes.includes(annotation.type.toLowerCase())
};

export const getFilteredAnnotations = (annotations, annotationsConfig, customIsAutoAnnotation) => {

  return (annotations && annotations.length > 0)
    ? annotations.filter(annotation => customIsAutoAnnotation
      ? !customIsAutoAnnotation(annotation, annotationsConfig)
      : !isAutoAnnotation(annotation, annotationsConfig)
    )
    : []
};

export const getAutoAnnotations = (annotations, annotationsConfig, customIsAutoAnnotation) => {

  return (annotations && annotations.length > 0)
    ? annotations.filter(annotation => customIsAutoAnnotation
      ? customIsAutoAnnotation(annotation, annotationsConfig)
      : isAutoAnnotation(annotation, annotationsConfig)
    )
    : []
};

export const normalizeDsdComponentsOrder = (components, componentId) =>
  components
    ? components
      .map(comp => ({
        ...comp,
        order: comp.order ? Number(comp.order) : null
      }))
      .sort((a, b) => {
        if (a.order === b.order) {
          if (a.id === componentId) {
            return -1
          } else if (b.id === componentId)
            return 1;
          else {
            return a.id - b.id;
          }
        } else if (a.order !== null && b.order === null) {
          return -1;
        } else if (a.order === null && b.order !== null) {
          return 1;
        } else {
          return a.order - b.order;
        }
      })
      .map((comp, idx) => ({
        ...comp,
        order: idx + 1
      }))
    : null;

export const existsComponentWithId = (dsd, id) =>
  Boolean([
    dsd.primaryMeasure,
    ...(dsd.dimensions || []),
    ...(dsd.groups || []),
    ...(dsd.attributes || [])
  ].find(component => component.id === id));

export const getItemOrder = (item, orderAnnotationType) =>
  (item.annotations.find(annot => annot.type && annot.type === orderAnnotationType) || []).texts;

export const getSQLItemFromItem = (item, lang, autoSave, itemsOrderAnnotationType) => {

  let annotations = (item.annotations && item.annotations.length > 0)
    ? item.annotations
      .filter(annot => !_.isEmpty(annot) && annot.type !== itemsOrderAnnotationType)
      .map(annot => ({
        id: annot.id ? annot.id : undefined,
        title: annot.title ? annot.title : undefined,
        type: annot.type ? annot.type : undefined,
        texts: annot.text ? _.pickBy(annot.text, val => val.length > 0) : undefined // fix after sdmx-source update 1.17
      }))
    : [];
  const autoAnnotations = (item.autoAnnotations && item.autoAnnotations.length > 0)
    ? item.autoAnnotations
      .filter(annot => !_.isEmpty(annot) && annot.type !== itemsOrderAnnotationType)
      .map(annot => ({
        id: annot.id ? annot.id : undefined,
        title: annot.title ? annot.title : undefined,
        type: annot.type ? annot.type : undefined,
        texts: annot.text ? _.pickBy(annot.text, val => val.length > 0) : undefined // fix after sdmx-source update 1.17
      }))
    : [];
  annotations = annotations.concat(autoAnnotations);

  const name = _.pickBy(item.name, val => val.length > 0);
  const description = _.pickBy(item.description, val => val.length > 0);
  const order = _.pickBy(item.order, val => val.length > 0);

  return ({
    itemCode: item.id,
    parent: item.parent ? item.parent : undefined,
    name: (name && name[lang]) ? name[lang] : undefined,
    names: name,
    desc: (description && description[lang]) ? description[lang] : undefined,
    descs: !_.isEmpty(description) ? description : undefined,
    treePosition: (order && order[lang]) ? order[lang] : undefined,
    order: !_.isEmpty(order) ? order : undefined,
    annotations: annotations.length > 0 ? annotations : undefined,
    autoSave: autoSave
  })
};

export const getOrderedChildren = (categories, parentId, lang, itemsOrderAnnotationType) => {
  const orderedChilds = [];
  const childs = [];

  categories && categories.forEach(child => {
    if (child.autoAnnotations && itemsOrderAnnotationType) {
      const orderAnnotations =
        child.autoAnnotations.find(annotation => annotation.type === itemsOrderAnnotationType);
      (
        orderAnnotations &&
        orderAnnotations.text &&
        orderAnnotations.text[lang] &&
        !isNaN(orderAnnotations.text[lang])
      )
        ? orderedChilds.push({
          ...child,
          order: orderAnnotations.text,
          parent: parentId
        })
        : childs.push({
          ...child,
          parent: parentId
        })
    } else {
      childs.push({
        ...child,
        parent: parentId
      })
    }
  });

  orderedChilds.sort((a, b) => itemsOrderCompare(a, b, lang));
  return orderedChilds.concat(childs)
};
