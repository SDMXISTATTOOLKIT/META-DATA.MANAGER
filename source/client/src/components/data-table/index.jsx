import {
  filterableOnContainedStringInsensitive,
  lexicographicallySortable,
  withTextFilterCol
} from '../enhanced-table/colDecorators';
import React from 'react';
import {translate} from 'react-i18next';
import uuidv4 from "uuid";
import _ from "lodash";
import EnhancedTable from '../enhanced-table';

class DataTable extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      pageNum: -1,
      pageSize: -1,
      filters: {},
      sortByDesc: false,
      sortCol: null
    };

    this.handleOnChange = this.handleOnChange.bind(this);
  }

  handleOnChange(obj) {
    if (obj) {
      const newState = _.cloneDeep(this.state);
      _.mergeWith(newState, obj, (val, src, key) => {
          if (key === "filters")
            return src ? _.cloneDeep(src) : null;
          else
            return undefined
        }
      );
      if (!_.isEqual(this.state, newState)) {
        this.setState(newState);
        if (this.props.onChange) {
          this.props.onChange(({
            ...newState,
            filters: newState.filters
              ? _.mapValues(newState.filters, arr => arr[0])
              : undefined,
            sortCol: newState.sortCol ? newState.sortCol : null,
            sortByDesc: newState.sortByDesc || false
          }));
        }
      }
    }
  }

  render() {
    const {
      t,
      data,
      cols,
      hiddenCols,
      rowTotal
    } = this.props;

    return (
      <EnhancedTable
        data={data}
        total={rowTotal}
        getRowKey={() => uuidv4()}
        columns={
          cols
            ? cols
              .filter(col => !hiddenCols || hiddenCols.filter(hiddenCol => hiddenCol === col).length === 0)
              .map(col =>
                col !== '_OBS_VALUE'
                  ? (
                    lexicographicallySortable(
                      filterableOnContainedStringInsensitive(
                        withTextFilterCol({
                          title: col,
                          dataIndex: col,
                        }, t)))
                  )
                  : (
                    lexicographicallySortable({
                      title: col,
                      dataIndex: col,
                    })
                  )
              )
            : []
        }
        onChange={this.handleOnChange}
      />
    );
  }
}

export default translate()(DataTable);
