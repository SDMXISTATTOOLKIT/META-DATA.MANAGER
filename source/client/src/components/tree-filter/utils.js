import {FILTER_MODE_IN, FILTER_MODE_NOT_IN} from "../../utils/sdmxJson";

export const TREE_NODE_KEY_PREFIX = 'TREE_NODE_KEY_';

export const getTreeFilterStrFromObj = (filterObj, colNames) => {
  return filterObj && Object.keys(filterObj).length > 0 && colNames !== null
    ? (
      colNames
        .filter(name => filterObj[name] !== undefined && filterObj[name].values.length > 0)
        .map(name =>
          `(${name} ${filterObj[name].mode === FILTER_MODE_NOT_IN ? "NOT IN" : "IN"} ` +
          `(${filterObj[name].values
            .filter(val => !val.startsWith(TREE_NODE_KEY_PREFIX))
            .map(val => `'${val}'`)
            .join(",")}))`
        )
        .join(" AND ")
    )
    : '';
};

export const getTreeFilterObjFromStr = filterStr => {

  let res = {};

  if (filterStr !== null && filterStr.length > 0) {
    const pairs =
      filterStr
        .split(') AND (')
        .map((block, index, arr) => {
          let res = block;
          if (index === 0) {
            res = res.substr(1);
          }
          if (index === arr.length - 1) {
            res = res.substr(0, res.length - 1);
          }
          return res;
        })
        .map(block =>
          block.includes(" NOT IN ")
            ? ({
              colName: block.split(" NOT IN")[0],
              mode: FILTER_MODE_NOT_IN,
              values: block.split(" NOT IN ")[1].substr(1, block.split(" NOT IN ")[1].length - 2).split(",").map(val => val.substr(1, val.length - 2))
            })
            : ({
              colName: block.split(" IN ")[0],
              mode: FILTER_MODE_IN,
              values: block.split(" IN ")[1].substr(1, block.split(" IN ")[1].length - 2).split(",").map(val => val.substr(1, val.length - 2))
            })
        );
    pairs.forEach(({colName, mode, values}) => res[colName] = ({mode, values}));
  }

  return res;
};