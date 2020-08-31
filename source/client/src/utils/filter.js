import _ from "lodash";

export function getFilterObjFromViewerObj(colNames, searchText, filters) {
  const res = [];

  if (colNames && colNames.length > 0) {
    if (filters) {
      Object.keys(filters).forEach(colName => {
          if (filters[colName]) {
            res.push({
              colName,
              oper: "LIKE",
              val: filters[colName],
              isAnd: true
            })
          }
        }
      );
    }
    if (searchText && searchText.length > 0) {
      colNames.forEach(colName =>
        res.push({
          colName,
          oper: "LIKE",
          val: searchText,
          isAnd: false
        })
      );
    }
  }
  return res;
}

export function getFilterStrFromViewerObj(colNames, searchText, filters, prevFilter) {

  let filtersStr = "";
  let searchTextStr = "";

  if (colNames && colNames.length > 0) {

    if (filters) {

      const filtersArr = Object.keys(filters).filter(colName => filters[colName]);

      filtersArr.forEach((colName, index) => {
        if (index === 0) {
          filtersStr += "(";
        } else {
          filtersStr += ' AND ';
        }
        filtersStr += `${colName} LIKE '%${filters[colName]}%'`;
        if (index === filtersArr.length - 1) {
          filtersStr += ")";
        }
      });
    }

    if (searchText && searchText.length > 0) {

      colNames.forEach((colName, index) => {
        if (index === 0) {
          searchTextStr += "(";
        } else {
          searchTextStr += ' OR ';
        }
        searchTextStr += `${colName} LIKE '%${searchText}%'`;
        if (index === colNames.length - 1) {
          searchTextStr += ")";
        }
      });
    }
  }

  return [prevFilter, filtersStr, searchTextStr]
    .filter(str => str.length > 0)
    .join(" AND ");
}


export const getFilterObjFromStr = filterStr => {


  const res = [];


  if (filterStr !== null && filterStr.length > 0) {
    filterStr
      .split(') AND (') // ottengo i blocchi
      .map((block, index, arr) => {
        if (arr.length === 1) {
          return block.substr(1, block.length - 2)
        } else if (index === 0) {
          return block.substr("1");
        } else if (index === arr.length - 1) {
          return block.substr(0, block.length - 1);
        } else return block;
      })
      .map(block => block // rimuovo parentesi IN e NOT IN
        .replace('(', '')
        .replace(')', ''))
      .map(block =>
        block.indexOf(" IN ") >= 0
          ? block
          : _.chunk(block.split(" "), 4)
      )// gruppi: <colonna> <op_confronto> <valore> [<op_logico>]
      .forEach(block => {
        if (block.indexOf(" IN ") >= 0) {
          res.push({
            column: block.split(" ")[0],
            conditions: [{
              comparisonOperator: block.indexOf(" NOT IN ") >= 0 ? "NOT IN" : "IN",
              value: block.split(" IN ")[1].split(",").map(val => val.replace("'", "").replace("'", ""))
            }],
            logicalOperator: "AND"
          });
        } else {

          const firstCol = block[0][0];

          let i = 1;
          let equalCols = true;
          while (block[i] && equalCols) {
            if (block[i][0] !== firstCol) {
              equalCols = false;
            } else {
              i++;
            }
          }

          i = 0;
          let isOr = true;
          while (block[i] && isOr) {
            if (block[i][3] === 'AND') {
              isOr = false;
            } else {
              i++;
            }
          }

          if (equalCols) {
            res.push({
              column: block[0][0],
              conditions: // ottengo op. confronto e valore da ogni gruppo
                block.map(([, comparisonOperator, value]) => ({
                  comparisonOperator,
                  value: value.replace("'", "").replace("'", "")
                })),
              logicalOperator: block[0].length === 4 ? block[0][3] : 'AND' // op. logico
            });
          } else {
            block.forEach(b =>
              res.push({
                column: b[0],
                conditions: [{
                  comparisonOperator: b[1],
                  value: b[2].replace("'", "").replace("'", "")
                }],
                isOr,
                logicalOperator: b.length === 4 ? b[3] : 'AND' // op. logico
              }));
          }
        }
      });
  }

  return res;
}


export function getServerQueryObj(selCols, filterObj, pageNum, pageSize, sortCols, sortByDesc, idCube, idDataflow) {

  const res = {
    Filter: {
      FiltersGroupAnd: {},
      FiltersGroupOr: {}
    },
    SqlData: {
      SelCols: selCols,
      SortCols: sortCols,
      SortByDesc: sortByDesc,
      NumPage: pageNum,
      PageSize: pageSize
    },
    iDDataflow: idDataflow,
    iDCube: idCube
  };

  let index = 0;

  if (filterObj) {
    filterObj.filter(({isOr}) => !isOr).forEach(({column, conditions, logicalOperator}) => {
      res.Filter.FiltersGroupAnd[index++] =
        conditions.filter(({isOr}) => !isOr).map(({comparisonOperator, value}) => ({
          ColumnName: column,
          Operator: comparisonOperator,
          FilterValues: Array.isArray(value) ? value : [value],
          WhereAndOr: logicalOperator,
          ColumnType: "string"
        }));
    });
    filterObj.filter(({isOr}) => isOr).forEach(({column, conditions}) => {
      if (!res.Filter.FiltersGroupAnd[index]) {
        res.Filter.FiltersGroupAnd[index] = [];
      }
      res.Filter.FiltersGroupAnd[index].push(
        ...conditions.filter(({isOr}) => !isOr).map(({comparisonOperator, value}) => ({
          ColumnName: column,
          Operator: comparisonOperator,
          FilterValues: Array.isArray(value) ? value : [value],
          WhereAndOr: "OR",
          ColumnType: "string"
        }))
      )
    });
  }

  return res;
}

export function getFilterStrFromServerQueryObj(obj) {

  let res = "";

  if (obj.FiltersGroupAnd) {
    Object.keys(obj.FiltersGroupAnd).forEach((key, index) => {

      if (index > 0) {
        res += " AND ";
      }

      obj.FiltersGroupAnd[key].forEach(({ColumnName, Operator, FilterValues, WhereAndOr}, index) => {

        if (index === 0) {
          res += "(";
        }

        res += index > 0 && WhereAndOr !== null ? ` ${WhereAndOr === 'AND' ? 'AND' : 'OR'} ` : '';
        res += ColumnName + ' ';
        res += Operator + ' ';
        res += Operator.includes("IN")
          ? '(' + FilterValues.map(v => `'${v}'`).join(',') + ')'
          : `'${FilterValues[0]}'`;

        if (index === obj.FiltersGroupAnd[key].length - 1) {
          res += ")";
        }
      })
    });
  }

  return res;
}

export const getFilterStrFromObj = (filterObj, columns) =>
  filterObj !== null && columns !== null
    ? (
      filterObj
        .filter(({conditions}) =>
          conditions !== null &&
          conditions.filter(({value}) => value !== null && String(value).length > 0).length > 0)
        .map(({column, conditions, logicalOperator}) =>
          '(' +
          conditions
            .filter(({value}) => value !== null && String(value).length > 0)
            .map(({comparisonOperator, value}) =>
              column + ' ' +
              comparisonOperator + ' ' +
              (columns.filter(({name}) => name === column)[0].isNumeric ? value : `'${value}'`)
            )
            .map((condition, index) => index > 0 ? ` ${logicalOperator} ${condition}` : condition)
            .join('') +
          ')'
        )
        .map((block, index) => index > 0 ? ` AND ${block}` : block)
        .join('')
    )
    : '';