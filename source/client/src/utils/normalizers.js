import _ from "lodash";
import {updateItemOrder} from "./artefacts";

export function normalizeId(newVal, oldVal) {
  return newVal
    ? _.toUpper(/^[a-zA-Z0-9_-]*$/.test(newVal) ? newVal : oldVal)
    : newVal;
}

export function normalizeOrder(newVal, oldVal) {
  const incorrectValues = _.pickBy(newVal, val => !/^[0-9]*$/.test(val));

  return _.isEmpty(incorrectValues)
    ? newVal
    : oldVal
}

// export function normalizeVersion(newVal, oldVal) {
//
//   const regexp = /^[1-9]([0-9]*)$/; // matches a number not starting with 0
//
//   if (!newVal || newVal.length === 0) {
//     return newVal;
//   } else {
//     const arr = newVal.split(".");
//
//     return (
//       arr.length < 4 &&
//       (
//         arr.filter(number => number === "" || number === "0" || regexp.test(number))
//           .length === arr.length
//       )
//         ? newVal
//         : oldVal
//     );
//   }
// }

const normalize = (newVal, oldVal, regexExp) => {

  if (typeof newVal === 'object' && newVal !== null) {
    for (let key in newVal) {
      if (newVal.hasOwnProperty(key)) {
        if (!regexExp.test(newVal[key])) {
          return oldVal;
        }
      }
    }
    return newVal
  }

  return regexExp.test(newVal)
    ? newVal
    : oldVal
};

export const normalizeInt = (newVal, oldVal) => normalize(newVal, oldVal, /^[0-9]*$/);

export const normalizeDecimal = (newVal, oldVal) => normalize(newVal, oldVal, /^([0-9]*|[0-9]+[.,]?[0-9]*)$/);

export const normalizeDate = (newVal, oldVal) => normalize(newVal, oldVal, /^([0-9]*|[0-9]+[-]?)*$/);

export const normalizeAlphaString = (newVal, oldVal) => normalize(newVal, oldVal, /^[a-zA-Z]*$/);

export const normalizeAlphaNumericString = (newVal, oldVal) => normalize(newVal, oldVal, /^[a-zA-Z0-9]*$/);

export const normalizeItemsOrder = (itemsTree, childrenKey, appLanguage, itemsOrderAnnotationType) => {
  const root = {
    isRoot: true,
    [childrenKey]: itemsTree
  };

  let count = 1;

  const func = node => {
    if (!node.isRoot) {
      updateItemOrder(node, String(count), itemsOrderAnnotationType, appLanguage);
      count++;
    }
  };

  const visitDfs = (node, func) => {
    if (func) {
      func(node);
    }
    _.each(node[childrenKey], child => visitDfs(child, func));
  };

  visitDfs(root, func);

  return count - 1;
};


export const getNormalizedColumnName = colName =>
  colName.substring(0, 3) === "ID_"
    ? colName.substring(3, colName.length)
    : colName;
