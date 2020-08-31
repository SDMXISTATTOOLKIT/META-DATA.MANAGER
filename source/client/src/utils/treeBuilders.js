import {getCategoriesOrderedTree, getCategorisedObjectsTree, getNodes} from './tree';
import {getUrnFromArtefact, isArtefactChildOfArtefact} from './sdmxJson';
import _ from "lodash";

export const DCS_ORDERED_TREE_ROOT = {
  CatCode: 'DCS',
  labels: {
    en: 'Default Category Scheme', /* TODO: translatable */
    it: 'Category Scheme di Lavoro'
  }
};

export function getCubesTree(cubesJson, dcsJson) {
  return getCategorisedObjectsTree(
    cubesJson,
    [{
      ...DCS_ORDERED_TREE_ROOT,
      children:
        getCategoriesOrderedTree(
          dcsJson,
          'children',
          (cat, anch) => anch ? (cat.ParCode === anch.CatCode) : (cat.ParCode !== null),
          (a, b) => (a.Code || -1) - (b.Code || -1) || a.CatCode - b.CatCode
        )
    }],
    'children',
    (a, b) => a.Code - b.Code,
    (obj, cat) => cat ? (obj.IDCat === cat.IDCat) : (obj.IDCat !== null),
    'CatCode',
    'labels',
    true
  );
}

export function getCategorySchemesTree(categorySchemesSdmxStructures, nodeOrderAnnotationType) {

  categorySchemesSdmxStructures = _.cloneDeep(categorySchemesSdmxStructures);

  const getCategoryOrder = category => {
    if (category.annotations) {
      const orderAnnotations =
        category.annotations
          .filter(annot => annot.type === nodeOrderAnnotationType);
      return orderAnnotations.length > 0 ? orderAnnotations[0].text.en : null;
    } else {
      return null;
    }
  };

  return getCategoriesOrderedTree(
    getNodes(
      categorySchemesSdmxStructures,
      'categories',
      () => true),
    'categories',
    (category, parent) => {

      if (parent) {

        return isArtefactChildOfArtefact(category, parent);

      } else {

        const categoryUrn = getUrnFromArtefact(category);

        return categoryUrn.lastIndexOf(")") !== categoryUrn.length - 1;
      }

    },
    (a, b) => {
      const aOrder = getCategoryOrder(a), bOrder = getCategoryOrder(b);
      if (aOrder && bOrder && aOrder !== bOrder) {
        return aOrder.localeCompare(bOrder)
      } else if (aOrder && !bOrder) {
        return -1
      } else if (!aOrder && bOrder) {
        return 1
      } else {
        return a.id.localeCompare(b.id)
      }
    }
  );
}
