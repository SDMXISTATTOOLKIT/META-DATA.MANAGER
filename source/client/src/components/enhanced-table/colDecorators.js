import React from 'react';
import _ from 'lodash';
import {Input} from 'antd';
import {PADDING_SM} from "../../styles/constants";


/* Makes an Antd.Column lexicographically sortable. */
export const lexicographicallySortable = col => ({
  ...col,
  sorter: (a, b) => String(a[col.dataIndex])
    .localeCompare(String(b[col.dataIndex]))
});

/* Makes an Antd.Column filterable by exact match string (e.g. use for "id" col) */
export const filterableOnExactString = col => ({
  ...col,
  onFilter: (value, record) => String(record[col.dataIndex]) === String(value)
});

/* Makes an Antd.Column filterable by contained string, with lowercase equality (e.g. use for "name" col).  */
export const filterableOnContainedStringInsensitive = col => ({
  ...col,
  onFilter: (value, record) =>
    String(record[col.dataIndex])
      .toLowerCase()
      .indexOf(String(value.toLowerCase())) >= 0
});

/* Puts in the header of an Antd.Column an input for applying a free text filter (e.g. use for "id" col). */
export const withTextFilterCol = (col, t = f => f) => ({
  ...col,
  filterDropdown: ({setSelectedKeys, selectedKeys, confirm, clearFilters}) =>
    <div className="ant-table-filter-dropdown">
      <div style={{padding: PADDING_SM}}>
        <Input value={selectedKeys[0]}
               placeholder={t('components.tableViewer.filter.placeholder')}
               onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
               onPressEnter={() => confirm()}
        />
      </div>
      <div className="ant-table-filter-dropdown-btns">
        <a className="ant-table-filter-dropdown-link"
           onClick={() => confirm()}>{t('components.tableViewer.filter.confirm')}</a>
        <a onClick={() => clearFilters()}
           style={{float: 'right', paddingLeft: PADDING_SM}}
        >
          {t('components.tableViewer.filter.reset')}
        </a>
      </div>
    </div>
});

/* Puts in the header of an Antd.Column the checkboxes for applying a filter on a certain value, like in excel. */
export const withValuesFilterCol = (col, data) => ({
  ...col,
  filters: _(data)
    .map(row => row[col.dataIndex])
    .uniq()
    .sortBy()
    .map(val => ({text: val, value: val}))
    .value(),
});
