const JSONSTAT_TABLE_PREVIEW_PLACEHOLDER = "xxx";
const JSONSTAT_TABLE_SECTION_DIMENSIONS_SEPARATOR = '<svg height="6px" width="6px" fill="#00295a"><path d="M 0 0 H 6 V 6 H 0 Z"/></svg>';

export const getHtmlTableString = (rows, cols, sections) => {

  /** HTML generating **/

  let table = `<table>`;

  /** table head **/

  table += '<thead>';
  cols.forEach((col, idx) => {
    table += `<tr data-row-key="h-${idx}">`;
    table += `<th class="c ch" colspan="${rows.length}">${col}</th>`;
    for (let c = 0; c < 3; c++) {
      table += `<th class="c csh">${JSONSTAT_TABLE_PREVIEW_PLACEHOLDER}</th>`;
    }
    table += '</tr>';
  });
  if (rows.length > 0) {
    table += `<tr data-row-key="hh">`;
    rows.forEach(row => table += `<th class="c ch">${row}</th>`);
    table += `<th class="c csh" colspan="${cols.length > 0 ? 3 : 1}"/>`;
    table += '</tr>';
  }
  table += '</thead>';

  /** table body **/

  table += '<tbody id="body">';
  if (sections && sections.length > 0) {
    table += `<tr data-row-key="s-0" class="rs">`;
    let sectionLabel = "";
    sections.forEach((section, idx) => {
      sectionLabel += `<div style="display: inline-block;">${section}: ${JSONSTAT_TABLE_PREVIEW_PLACEHOLDER}</div>`;
      sectionLabel += idx < (sections.length - 1) ? `<div style="display: inline-block; margin: 0 8px">${JSONSTAT_TABLE_SECTION_DIMENSIONS_SEPARATOR}</div>` : '';
    });
    table += `<th class="c cs" colspan="${(rows.length || 1) + (cols.length > 0 ? 3 : 1)}">${sectionLabel}</th>`;
    table += '</tr>';
  }
  for (let r = 0; r < (rows.length > 0 ? 3 : 1); r++) {
    table += `<tr data-row-key="r-${r}">`;
    if (rows.length > 0) {
      for (let rr = 0; rr < rows.length; rr++) {
        table += `<th class="c csh">${JSONSTAT_TABLE_PREVIEW_PLACEHOLDER}</th>`;
      }
    } else {
      table += `<th class="c csh">&nbsp;</th>`
    }
    for (let c = 0; c < (cols.length > 0 ? 3 : 1); c++) {
      table += `<td class="c"/>`;
    }
    table += '</tr>';
  }
  table += '</tbody>';

  table += '</table>';

  return table;
};