import React from 'react';
import {translate} from 'react-i18next';
import InfiniteScrollTable from "../infinite-scroll-table";

const InfiniteScrollDataTable = ({
                                   data,
                                   cols,
                                   height,
                                   hiddenCols,
                                   rowTotal,
                                   onChange,
                                   rowSelection,
                                   getRowKey
                                 }) =>
  <InfiniteScrollTable
    data={data}
    height={height}
    rowCount={rowTotal}
    getRowKey={getRowKey || JSON.stringify}
    columns={
      cols
        ? cols
          .filter(col => !hiddenCols || hiddenCols.filter(hiddenCol => hiddenCol === col).length === 0)
          .map(col => ({
            title: col,
            dataIndex: col,
            minWidthToContent: true
          }))
        : null
    }
    onChange={onChange}
    isPaginated
    autoSearch={false}
    rowSelection={rowSelection}
  />;

export default translate()(InfiniteScrollDataTable);
