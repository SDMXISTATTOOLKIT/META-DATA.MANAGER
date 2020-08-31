import _ from "lodash";

export const UNCATEGORIZED_CATEGORY_CODE = 'UNCATEGORIZED';

export function getCategoriesOrderedTree(categories, childrenKey, testIsChildOf, compare) {

  categories = _.cloneDeep(categories);

  const recursivelyPushOrderedChildCategories = category => {
    if (category !== null) {
      category[childrenKey] = [];
      category[childrenKey].push(
        ...categories
          .filter(cat => testIsChildOf(cat, category))
          .sort(compare)
      );
      category[childrenKey].map(recursivelyPushOrderedChildCategories);
    }
    return category;
  };

  return [
    ...categories
      .filter(cat => !testIsChildOf(cat))
      .sort(compare)
  ].map(recursivelyPushOrderedChildCategories);
}

export function getCategoriesCustomOrderedTree(categories, childrenKey, testIsChildOf, getOrderedChildrens) {

  categories = _.cloneDeep(categories);

  const recursivelyPushOrderedChildCategories = category => {
    if (category !== null) {
      category[childrenKey] = [];
      category[childrenKey].push(
        ...getOrderedChildrens(
          categories.filter(cat => testIsChildOf(cat, category))
        )
      );
      category[childrenKey].map(recursivelyPushOrderedChildCategories);
    }
    return category;
  };

  return getOrderedChildrens(categories.filter(cat => !testIsChildOf(cat)))
    .map(recursivelyPushOrderedChildCategories);
}

export function getCategorisedObjectsTree(
  objects, categoryTree, categoryTreeChildrenKey,
  objectsCompare, testObjectCategory,
  categoryCodeKey, categoryNameKey, discardUncategorised) {

  objects = _.cloneDeep(objects);
  categoryTree = _.cloneDeep(categoryTree);

  const recursivelyPushOrderedChildArtefacts = category => {
    if (category) {
      if (category[categoryTreeChildrenKey]) {
        // first this (to avoid recursion on objects)
        category[categoryTreeChildrenKey].map(recursivelyPushOrderedChildArtefacts);
      } else {
        category[categoryTreeChildrenKey] = [];
      }

      category[categoryTreeChildrenKey].push(
        ...objects
          .filter(object => testObjectCategory(object, category))
          .sort(objectsCompare)
      );
    }
    return category;
  };

  const res = categoryTree.map(recursivelyPushOrderedChildArtefacts);

  let uncategorisedObjects =
    objects
      .filter(object => !testObjectCategory(object))
      .sort(objectsCompare);

  if (uncategorisedObjects.length && discardUncategorised !== true) {
    res.push({
      [categoryCodeKey]: UNCATEGORIZED_CATEGORY_CODE,
      [categoryNameKey]: {
        en: 'Uncategorized',
        it: 'Senza categoria'
      },
      [categoryTreeChildrenKey]: uncategorisedObjects
    });
  }

  return res;
}

export function getNode(tree, childrenKey, test) {

  if (!(tree !== null && tree.length)) return null;

  const foundNodes = tree.filter(test);

  if (foundNodes.length) {
    return foundNodes[0];
  } else {
    const foundNodesInChild =
      tree
        .filter(node => node[childrenKey])
        .map(node => getNode(node[childrenKey], childrenKey, test))
        .filter(result => result !== null);

    if (foundNodesInChild.length) {
      return foundNodesInChild[0];
    } else {
      return null;
    }
  }
}

export function getNodes(tree, childrenKey, test) {

  const res = [];

  const recursive = subTree =>
    subTree
      ? (
        subTree.map(node => {
          if (test && test(node)) {
            res.push(_.cloneDeep(node));
          }
          if (node[childrenKey] && node[childrenKey].length) {
            recursive(node[childrenKey]);
          }
          return null;
        })
      )
      : [];

  recursive(tree);

  return res;
}

export function countNodes(tree, childrenKey, test) {

  let res = 0;

  const recursive = subTree =>
    subTree
      ? (
        subTree.map(node => {
          if (test && test(node)) {
            res++;
          }
          if (node[childrenKey] && node[childrenKey].length) {
            recursive(node[childrenKey]);
          }
          return null;
        })
      )
      : [];

  recursive(tree);

  return res;
}

export function getFilteredTree(tree, childrenKey, test) {

  tree = _.cloneDeep(tree);

  tree = tree.filter(test);

  tree = tree.map(subTree => {
    if (subTree[childrenKey]) {
      subTree[childrenKey] = getFilteredTree(subTree[childrenKey], childrenKey, test);
    }
    return subTree;
  });

  return tree;
}

export function getFilteredTreeWithPaths(tree, childrenKey, test) {

  tree = _.cloneDeep(tree);

  tree = tree.map(subTree => {
    if (subTree[childrenKey]) {
      subTree[childrenKey] = getFilteredTreeWithPaths(subTree[childrenKey], childrenKey, test);
    }
    return subTree;
  });

  tree = tree.filter(node => (node[childrenKey] && node[childrenKey].length) || test(node));

  return tree;
}

export function getMappedTree(tree, childrenKey, map) {

  tree = _.cloneDeep(tree);

  tree = tree.map(root => map(root));

  tree = tree.map(subTree => {
    if (subTree[childrenKey]) {
      subTree[childrenKey] = getMappedTree(subTree[childrenKey], childrenKey, map);
    }
    return subTree;
  });

  return tree;
}

export function getMappedTreeDeptFirst(tree, childrenKey, map) {

  tree = _.cloneDeep(tree);

  tree = tree.map(node => {
    const visitedNode = map(node);
    if (visitedNode[childrenKey]) {
      visitedNode[childrenKey] = getMappedTreeDeptFirst(visitedNode[childrenKey], childrenKey, map);
    }

    return visitedNode
  });

  return tree;
}

export function getDeadEndNodes(categoryTree, categoryTreeChildrenKey) {

  categoryTree = _.cloneDeep(categoryTree);

  let res = [];

  const recursivelyMarkNoChildrenCategory = category => {
    if (category) {
      if (category[categoryTreeChildrenKey]) {
        category[categoryTreeChildrenKey].map(recursivelyMarkNoChildrenCategory);
        if (category[categoryTreeChildrenKey].length === 0 || childChecker(category)) {
          category.isDeadEnd = true;
          res.push(category);
        }
      }
    }
    return category;
  };

  const childChecker = category => {
    let result = true;
    category[categoryTreeChildrenKey].forEach(child => {
      if (!(child[categoryTreeChildrenKey] && child.isDeadEnd)) {
        result = false;
      }
    });
    return result;
  };

  if (categoryTree) {
    categoryTree.map(recursivelyMarkNoChildrenCategory);
  }
  return res;
}

export function testAnchestor(node, anchestor, tree, childrenKey) {

  if (node.parent === undefined || node.parent === null) {
    return false;
  } else if (node.id === anchestor.id || node.parent === anchestor.id) {
    return true
  } else {
    return testAnchestor(getNode(tree, childrenKey, n => n.id === node.parent), anchestor, tree, childrenKey);
  }
}

export function getTreeFromArray(arr, childrenKey) {
  const mappedArr = {};
  const tree = [];

  // first map the nodes of the array to an object -> create a hash table.
  arr.forEach(el => {
    el[childrenKey] = [];
    mappedArr[el.id] = el;
  });

  arr.forEach(el => {
    if (el.parent) {
      // if the element is not at the root level, add it to its parent array of children.
      mappedArr[el.parent][childrenKey].push(el);
    } else {
      // if the element is at the root level, add it to first level elements array.
      tree.push(el);
    }
  });

  return tree;
}

export function getMaxTreeDepth(tree, childrenKey) {

  const recursive = node =>
    node
      ? 1 + Math.max(...(node[childrenKey] || []).map(recursive), 0)
      : 0;

  return tree
    ? Math.max(...tree.map(recursive), 0)
    : 0;
}

export function getNodesAtDepth(tree, childrenKey, depth) {

  const res = [];

  const recursive = (subTree, currDepth) =>
    subTree
      ? (
        subTree.map(node => {
          if (depth === currDepth) {
            res.push(_.cloneDeep(node));
          }
          if (node[childrenKey] && node[childrenKey].length) {
            recursive(node[childrenKey], currDepth + 1);
          }
          return null;
        })
      )
      : [];

  recursive(tree, 1);

  return res;
}
