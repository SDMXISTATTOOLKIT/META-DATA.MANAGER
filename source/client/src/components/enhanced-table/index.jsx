import React, {Fragment} from 'react';
import {Button, Col, Row, Select, Table} from 'antd';
import './style.css';
import {getLocalizedStr} from '../../middlewares/i18n/utils';
import {GUTTER_MD, GUTTER_SM, MARGIN_MD, SPAN_ONE_QUARTER, SPAN_THREE_QUARTERS} from '../../styles/constants';
import {connect} from 'react-redux';
import {compose} from 'redux';
import SearchInput from '../search-input';
import {translate} from 'react-i18next';
import uuidv4 from 'uuid';
import {DataLanguageConsumer} from "../../contexts/DataLanguage";
import {getScrollBarWidth} from '../../utils/style';
import {addSpinnerAction, completeSpinnerAction} from "../../middlewares/spinner/actions";
import {showEnhancedTableSpinner} from "./actions";

const $ = window.jQuery;

class EnhancedTable extends React.Component {

  constructor(props) {
    super(props);

    this.withMultilangStrLocalized = this.withMultilangStrLocalized.bind(this);
    this.isRowPassingSearchText = this.isRowPassingSearchText.bind(this);
    this.getPagination = this.getPagination.bind(this);
    this.getRows = this.getRows.bind(this);
    this.getLocale = this.getLocale.bind(this);
    this.getColumns = this.getColumns.bind(this);
    this.getRowSelection = this.getRowSelection.bind(this);
    this.getActionRender = this.getActionRender.bind(this);
    this.getFixedActionRender = this.getFixedActionRender.bind(this);
    this.alignColumns = this.alignColumns.bind(this);
    this.handleOnChange = this.handleOnChange.bind(this);
    this.handleSearchTextChange = this.handleSearchTextChange.bind(this);

    this.state = {
      selectedRowKeys: [],
      searchText: '',
      pageSize: null,
      pageNum: 1,
      sort: null,
      uuidClassName: uuidv4(),
      mutationObserver: new MutationObserver(this.alignColumns),
      scrollBarWidth: getScrollBarWidth(),
      alignColumnsTimeout: null
    };
  }

  static getDerivedStateFromProps(nextProps, state) {
    if (state.pageSize === null && nextProps.defaultTableRows !== null) {
      return {
        ...state,
        pageSize: nextProps.defaultTableRows
      };
    } else {
      return null;
    }
  }

  getRows(preferredLanguage) {
    const data = this.props.data;

    if (!data) return [];

    return data
      .map(this.withMultilangStrLocalized(preferredLanguage))
      .filter(this.isRowPassingSearchText);
  }

  withMultilangStrLocalized(preferredLanguage) {
    return row => {
      const {
        multilangStrDataIndexes,
        dataLanguages
      } = this.props;

      const res = {...row}; // copy only first level, nested objects are not cloned

      Object.keys(row)
        .map(dataIndex =>
          res[dataIndex] = (multilangStrDataIndexes && multilangStrDataIndexes.indexOf(dataIndex) >= 0)
            ? getLocalizedStr(row[dataIndex], preferredLanguage, dataLanguages)
            : res[dataIndex]
        );
      return res;
    };
  }


  isRowPassingSearchText(row) {
    const {searchText} = this.state;
    return this.props.columns
      .filter(col =>
        col !== null &&
        typeof (row[col.dataIndex]) !== 'boolean')
      .filter(({dataIndex}) =>
        String(row[dataIndex])
          .toLowerCase()
          .indexOf(searchText.toLowerCase()) >= 0)
      .length > 0;
  }

  getPagination(preferredLanguage) {
    const {t, showAllRows, defaultTableRows, maxTableRows, onChange, total, showSpinner, hideSpinner} = this.props;
    const {pageSize, pageNum} = this.state;
    const rowNum = total || this.getRows(preferredLanguage).length;

    const defaultRowsPerPage = Math.min(defaultTableRows, maxTableRows);

    if (showAllRows) {
      return {
        current: pageNum,
        pageSize: rowNum,
        hideOnSinglePage: true,
        total
      };
    } else {
      return {
        current: pageNum,
        total,
        defaultPageSize: Math.min(defaultTableRows, maxTableRows),
        showSizeChanger: false,
        locale: {
          items_per_page: t('components.tableViewer.pager.itemsPerPage'),
          prev_page:
            t('components.tableViewer.pager.prevPage'),
          next_page:
            t('components.tableViewer.pager.nextPage')
        },
        pageSize,
        showTotal: (total, range) => {

          return (
            <Fragment>
              <Select
                style={{
                  width: 120,
                  left: 0,
                  position: 'absolute'
                }}
                size="small"
                className="table__page-size-selector"
                onSelect={value => {
                  showSpinner();
                  window.setTimeout(
                    () => {
                      hideSpinner();
                      this.setState({
                        pageSize: value,
                        pageNum: 1  // reset page when pageSize changed
                      });
                      if (onChange) {
                        onChange({
                          pageSize: value,
                          pageNum: 1
                        });
                      }
                    },
                    0
                  );
                }}
                defaultValue={Math.min(rowNum, defaultTableRows, maxTableRows)}
                value={pageSize}
              >
                {[defaultRowsPerPage]
                  .concat(defaultRowsPerPage * 2 < maxTableRows ? [defaultRowsPerPage * 2] : [])
                  .concat(defaultRowsPerPage * 3 < maxTableRows ? [defaultRowsPerPage * 3] : [])
                  .concat(rowNum > maxTableRows && maxTableRows > defaultRowsPerPage ? [maxTableRows] : [])
                  .filter(pageSize => pageSize < rowNum)
                  .map(pageSize =>
                    <Select.Option key={pageSize} value={pageSize}>
                      {pageSize} {t('components.tableViewer.pager.itemsPerPage')}
                    </Select.Option>)}
                {rowNum <= maxTableRows && (
                  <Select.Option key={0} value={rowNum}>
                    {t('components.tableViewer.pager.itemsPerPageAll')}
                  </Select.Option>
                )}
              </Select>
              {pageSize !== rowNum
                ? t('components.tableViewer.pager.range', {
                  from: range[0],
                  to: range[1],
                  total
                })
                : t('components.tableViewer.pager.rangeAll', {rowNum})
              }
            </Fragment>
          );
        }
      };
    }
  };

  getLocale() {
    return {
      filterConfirm: this.props.t('components.tableViewer.filter.confirm'),
      filterReset: this.props.t('components.tableViewer.filter.reset')
    };
  }

  getColumns() {

    const {
      t,
      columns,
      actions,
      altActions,
      fixedActions,
      getIsDisabledRow,
      getIsAltRow,
      onChange
    } = this.props;

    const renderForCol = (text, record, col) =>
      <div
        title={text}
        style={{
          color: getIsDisabledRow && getIsDisabledRow(record) ? 'rgba(0, 0, 0, 0.25)' : null,
          cursor: col.getOnClick && col.getOnClick(record) ? 'pointer' : null
        }}
        onClick={col.getOnClick ? col.getOnClick(record) : null}
      >
        {
          (text && text.length > 40)
            ? (text.substr(0, 40) + '...')
            : text
        }
      </div>;

    const renderForActionsCol = record =>
      <div
        className="table__row__actions"
        style={{
          whiteSpace: 'nowrap',
          textAlign: 'right'
        }}
      >
        {(getIsAltRow && getIsAltRow(record) ? altActions : actions)
          .map((action, index) => {
            if (typeof (action) === 'function') action = action(record);
            return action !== null
              ? this.getActionRender(index, action, record)
              : null
          })}
      </div>;

    const renderForFixedActionsCol = record =>
      <Row
        type="flex"
        className="table__row__fixed-actions"
        style={{
          whiteSpace: 'nowrap',
        }}
        gutter={GUTTER_SM}
      >
        {fixedActions
          .map((action, index) => {
            if (typeof (action) === 'function') action = action(record);
            return action !== null
              ? <Col key={index}>{this.getFixedActionRender(index, action, record)}</Col>
              : null
          })}
      </Row>;

    let res = [
      ...columns
        .filter(col => col !== null)
        .map(col => ({
          ...col,
          render: col.render || ((text, record) => renderForCol(text, record, col)),
          title: <div className="table table-column-title">{col.title}</div>,
          sortOrder: this.state.sort && this.state.sort.columnKey === col.dataIndex && this.state.sort.order,
          onFilter: onChange ? undefined : col.onFilter,
          sorter: onChange ? a => a : col.sorter,
          t
        }))
    ];
    if (fixedActions)
      res = [
        ...res,
        {
          className: 'table__col__fixed-actions',
          render: renderForFixedActionsCol
        }
      ];
    if (actions)
      res = [
        ...res,
        {
          className: 'table__col__actions',
          render: renderForActionsCol
        }
      ];

    return res;
  }

  getActionRender(index, action, record) {

    const {
      getRowKey,
      data
    } = this.props;

    const {
      selectedRowKeys
    } = this.state;

    return (
      action
        ? (
          <Button
            key={index}
            type="primary"
            shape={action.hasRectangularButton ? undefined : "circle"}
            icon={action.icon}
            title={action.title}
            disabled={action.disabled}
            onClick={
              action.onClick
                ? (
                  (e) => {
                    e.stopPropagation();
                    action.onClick(
                      record !== undefined
                        ? record
                        : data.filter(row =>
                        selectedRowKeys.filter(selectedRowKey => getRowKey(row) === selectedRowKey).length > 0
                        ),
                      record !== undefined
                        ? () => this.setState({selectedRowKeys: selectedRowKeys.filter(key => key !== getRowKey(record))})
                        : () => this.setState({selectedRowKeys: []})
                    );
                  }
                )
                : null
            }
            size={record !== undefined ? "small" : "default"}
            className={action.className}
          >
            {action.hasRectangularButton ? action.title : (action.iconText || null)}
          </Button>
        )
        : null
    );
  }

  getFixedActionRender(index, action, record) {

    const {
      getRowKey,
      data
    } = this.props;

    return (
      <Button
        {...action}
        key={index}
        type="primary"
        shape="circle"
        size="small"
        onClick={
          action.onClick
            ? (
              (e) => {
                e.stopPropagation();
                action.onClick(
                  record !== undefined
                    ? record
                    : (() => {
                      const selectedKeys = this.state.selectedRowKeys;
                      this.setState({selectedRowKeys: []});
                      return data.filter(row =>
                        selectedKeys.filter(selectedRowKey => getRowKey(row) === selectedRowKey).length > 0);
                    })()
                );
              }
            )
            : null
        }
      />
    );
  }

  getRowSelection() {

    const {tableActions, getIsDisabledRow} = this.props;
    const {selectedRowKeys} = this.state;

    if (!tableActions || tableActions.filter(act => act !== null).length === 0) return null;

    return {
      selectedRowKeys,
      onChange: selectedRowKeys => this.setState({selectedRowKeys}),
      getCheckboxProps: record => ({
        disabled: (getIsDisabledRow && getIsDisabledRow(record))
      })
    };
  }

  alignColumns() {

    const doAlignColumns = () => {

      const headerCells = $(`.table-${this.state.uuidClassName} th`);
      const firstRowCells = $(`.table-${this.state.uuidClassName} tr:first-child td`);

      if (headerCells.length && firstRowCells.length) {

        const colWidths = [];

        $(headerCells).each((index, headerCell) => {
          $(headerCell).removeClass("table__cell__aligned");
          $(`.table-${this.state.uuidClassName} td:nth-child(${index + 1})`).removeClass("table__cell__aligned")
        });

        $(headerCells).each((index, headerCell) => {
          colWidths.push(Math.max(
            $(headerCell).find('.table-column-title').outerWidth() + 54 || 0,
            $(firstRowCells[index]).outerWidth()
          ));
        });

        $(headerCells).each((index, headerCell) => {
          $(headerCell)
            .addClass("table__cell__aligned")
            .outerWidth(colWidths[index])
            .outerHeight(40);
          $(`.table-${this.state.uuidClassName} td:nth-child(${index + 1})`)
            .addClass("table__cell__aligned")
            .outerWidth(colWidths[index])
            .outerHeight(40);
        });

        $(`.table-${this.state.uuidClassName} .ant-table-header`).css('margin-right', this.state.scrollBarWidth);
      }
    };

    if (this.state.alignColumnsTimeout !== null) {
      window.clearTimeout(this.state.alignColumnsTimeout);
    }

    doAlignColumns();
    window.setTimeout(doAlignColumns, 100);
  }

  componentDidMount() {
    $(window).on("resize", e =>
      e.target === window
        ? this.alignColumns()
        : null
    );
    this.state.mutationObserver.observe(
      $(`.table-${this.state.uuidClassName} .ant-table-tbody`)[0],
      {
        childList: true,
        subtree: true
      });
    this.alignColumns();

    if (this.props.onChange) {

      const pagination = this.getPagination(this.props.appLanguage);

      this.props.onChange({
        pageSize: pagination.pageSize,
        pageNum: 1
      });
    }
  }

  componentDidUpdate() {
    this.alignColumns();
  }

  componentWillUnmount() {
    $(window).off("resize", this.alignColumns);
    this.state.mutationObserver.disconnect();
  }

  handleOnChange({current}, filters, sort) {
    this.props.showSpinner();
    window.setTimeout(
      () => {
        this.props.hideSpinner();
        if (this.state.pageNum === current) { // changes only in filters and sort
          current = 1; // reset the page number
        }
        this.setState({pageNum: current, sort});
        if (this.props.onChange) {
          this.props.onChange({
            pageNum: current,
            filters,
            sortCol: sort && sort.columnKey ? sort.columnKey : null,
            sortByDesc: sort ? sort.order === "descend" : false
          });
        }
      },
      0
    );
  }

  handleSearchTextChange(searchText) {
    this.props.showSpinner();
    window.setTimeout(
      () => {
        this.props.hideSpinner();
        if (this.props.onChange) {
          this.setState({pageNum: 1});
          this.props.onChange({searchText, pageNum: 1});
        } else {
          this.setState({searchText, pageNum: 1});
        }
      },
      0
    );

  }

  render() {

    const {
      t,
      getRowKey,
      tableActions,
      onRowClick,
      rowSelection,
      getIsDisabledRow,
      showHeader,
      appLanguage,
      leftActions,
      rightActions
    } = this.props;

    const {
      selectedRowKeys,
      uuidClassName,
    } = this.state;

    return (
      <div className={selectedRowKeys.length ? 'table--has-selected-rows' : 'table'}>
        <Row type="flex" gutter={GUTTER_MD} style={{marginBottom: MARGIN_MD}}>
          <Col span={SPAN_ONE_QUARTER}>
            <SearchInput
              placeholder={t('components.tableViewer.search.placeholder')}
              onSearch={this.handleSearchTextChange}
            />
          </Col>
          <Col span={SPAN_THREE_QUARTERS}>
            <Row type="flex" justify="space-between" align="middle" gutter={GUTTER_MD}>
              <Col>
                {leftActions ? leftActions : null}
              </Col>
              <Col>
                <Row type="flex" justify="end" align="middle" gutter={GUTTER_MD}>
                  {tableActions && (
                    <Col className="table__header__table-actions__container">
                      <Row type="flex" justify="end" align="middle" gutter={GUTTER_SM}>
                        <Col>
                          {t('components.tableViewer.selectedRowsInfo', {size: selectedRowKeys.length})}
                        </Col>
                        {!rowSelection && tableActions && (
                          <Col className="table__header__table-actions">
                            {tableActions.map((action, idx) => this.getActionRender(idx, action))}
                          </Col>
                        )}
                      </Row>
                    </Col>
                  )}
                  {rightActions && (
                    <Col>
                      {rightActions}
                    </Col>
                  )}
                </Row>
              </Col>
            </Row>
          </Col>
        </Row>
        <DataLanguageConsumer>
          {dataLanguage =>
            <Table
              className={`table table-${uuidClassName}`}
              rowKey={getRowKey}
              dataSource={this.getRows(dataLanguage || appLanguage)}
              columns={this.getColumns()}
              onRow={
                record => (
                  {
                    onClick:
                      () =>
                        onRowClick && (getIsDisabledRow === undefined || !getIsDisabledRow(record))
                          ? onRowClick(record)
                          : null
                  })
              }
              rowClassName={
                record =>
                  (!(getIsDisabledRow && getIsDisabledRow(record)) && onRowClick)
                    ? 'table__row__clickable'
                    : null
              }
              size="middle"
              rowSelection={rowSelection || this.getRowSelection()}
              pagination={this.getPagination(dataLanguage || appLanguage)}
              locale={this.getLocale()}
              showHeader={showHeader}
              scroll={{y: 340, x: true}}
              onChange={this.handleOnChange}
            />
          }
        </DataLanguageConsumer>
      </div>
    );
  }
}

export default compose(
  translate(),
  connect(
    state => ({
      appLanguage: state.app.language,
      dataLanguages: state.config.dataManagement.dataLanguages,
      defaultTableRows: state.config.userInterface.defaultTableRows,
      maxTableRows: state.config.userInterface.maxTableRows
    }),
    dispatch => ({
      showSpinner: uuid => dispatch(addSpinnerAction(showEnhancedTableSpinner(), uuid)),
      hideSpinner: uuid => dispatch(completeSpinnerAction(showEnhancedTableSpinner(), uuid))
    })
  )
)(EnhancedTable);
