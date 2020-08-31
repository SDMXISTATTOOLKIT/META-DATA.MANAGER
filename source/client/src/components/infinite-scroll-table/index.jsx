import React, {Fragment} from 'react';
import "./style.css";
import {getScrollBarWidth, getTextHeight, getTextWidth} from "../../utils/style";
import uuidv4 from 'uuid';
import SortButtons, {SORT_DIRECTION_ASC, SORT_DIRECTION_DESC} from './sort-buttons';
import FilterButton from './filter-button';
import {Button, Checkbox, Col, Icon, Row} from "antd";
import {getLocalizedStr} from "../../middlewares/i18n/utils";
import _ from "lodash";
import {VariableSizeList} from "react-window";
import {
  ACTION_WIDTH,
  ACTIONS_GUTTER,
  CELL_PADDING,
  CHECKBOX_WIDTH,
  COL_WIDTH_SAFE,
  DATA_INDEX_ACTIONS_OBJS,
  DATA_INDEX_CHECKED,
  DATA_INDEX_FIXED_ACTIONS_OBJS,
  DATA_INDEX_HEIGHT,
  DATA_INDEX_ORIGINAL_ROW,
  DATA_INDEX_ORIGINAL_TRANSLATED_ROW,
  DATA_INDEX_RENDERED,
  DEFAULT_PAGE_NUM,
  DEFAULT_PAGE_SIZE,
  DEFAULT_TABLE_HEIGHT,
  FILTER_BUTTON_WIDTH,
  HEADER_CELL_CONTROLS_GUTTER,
  HEADER_CELL_GUTTER,
  MAX_PAGE_SIZE,
  PAGINATION_TIMEOUT,
  RESIZE_TIMEOUT,
  ROW_HEIGHT,
  SORT_BUTTON_WIDTH,
  TABLE_PLACEHOLDER_BGCOLOR,
  TABLE_TOTAL_BORDER,
  VIEW_INDEXES_UPDATE_TIMEOUT
} from "./contants";
import {getIndexesFromPaginationParams, getPaginationParamsFromIndexes} from "./utils";
import PreHeader from "./pre-header";
import Footer from "./footer";
import {compose} from "redux";
import {withSize} from "react-sizeme";
import {connect} from "react-redux";
import {translate} from 'react-i18next';
import CustomEmpty from "../custom-empty";
import {withDataLanguage} from "../../contexts/DataLanguage";
import {SPAN_ONE_QUARTER} from "../../styles/constants";

const $ = window.jQuery;

export const numberStringSorter = (a, b) => Number(a) - Number(b);

class InfiniteScrollTable extends React.Component {

  constructor(props) {

    super(props);

    this.onSearchTextChange = this.onSearchTextChange.bind(this);
    this.onFiltersChange = this.onFiltersChange.bind(this);
    this.onSortChange = this.onSortChange.bind(this);
    this.getSelectedRowKeys = this.getSelectedRowKeys.bind(this);
    this.onRowSelectionChange = this.onRowSelectionChange.bind(this);
    this.getCols = this.getCols.bind(this);
    this.getNormalizedTableActions = this.getNormalizedTableActions.bind(this);
    this.renderActions = this.renderActions.bind(this);
    this.renderGridRow = this.renderGridRow.bind(this);
    this.renderFixedActions = this.renderFixedActions.bind(this);
    this.renderHeaderCells = this.renderHeaderCells.bind(this);
    this.renderCheckboxTitle = this.renderCheckboxTitle.bind(this);
    this.renderCheckbox = this.renderCheckbox.bind(this);
    this.getPopulatedRows = this.getPopulatedRows.bind(this);
    this.getColWidths = this.getColWidths.bind(this);
    this.calculateRowHeight = this.calculateRowHeight.bind(this);
    this.getQueriedRows = this.getQueriedRows.bind(this);
    this.getRenderedRows = this.getRenderedRows.bind(this);
    this.onRenderedRowsChange = this.onRenderedRowsChange.bind(this);

    this.state = {
      uuid: uuidv4(),

      gridKeyForRefresh: uuidv4(),
      scrollTop: 0,
      scrollLeft: 0,

      gridScrollbarWidth: getScrollBarWidth(),

      searchText: "",
      sortCol: null,
      sortByDesc: false,
      filters: {},

      selectedRowKeys:
        props.rowSelection && props.rowSelection.selectedRowKeys
          ? props.rowSelection.selectedRowKeys
          : [],

      cols: null,

      populatedRows: null,

      colWidths: null,

      renderedRows: null,

      queriedRows: null,

      isResizing: false,
      resizeTimeout: null,

      pageSize: null,
      pageNum: null,
      pageRequestTimeout: null,

      isPaginating: props.isPaginated,
      pageRequestParams: null,

      viewStartIdx: null,
      viewEndIdx: null,
      viewIndexesUpdateTimeout: null,

      doNotCallOnChangeOnNextRenderedRowsChange: false
    };

    if (props.isPaginated) {
      this.state.pageRequestParams = {
        pageSize: DEFAULT_PAGE_SIZE,
        pageNum: DEFAULT_PAGE_NUM,
        filters: this.state.filters,
        searchText: this.state.searchText,
        sortCol: this.state.sortCol,
        sortByDesc: this.state.sortByDesc
      };
    }

    if (props.onChange && props.isPaginated) {
      props.onChange(this.state.pageRequestParams);
    }

    this.listRef = React.createRef();
  }

  static isValuePassingSearchText(value, searchText) {
    return String(value).toLowerCase().includes(searchText.toLowerCase())
  }

  static defaultSorter = (a, b, isDesc) => {

    const normalize = val => typeof (val) === "string" ? val.toLowerCase() : Number(val);
    const _a = normalize(a);
    const _b = normalize(b);

    return (isDesc ? (_b < _a) : (_a < _b)) ? -1 : 1
  };

  static isArrayPropertyChangedLazy(prevProp, prop) {
    return (
      (prevProp !== prop) ||
      ((prevProp === null || prevProp === undefined) && prop !== null && prop !== undefined) ||
      (prevProp && prop && prevProp.length !== prop.length)
    );
  }

  /* === Hooks === */

  getPopulatedRows(rows) {

    const {
      multilangStrDataIndexes,
      appLanguage,
      dataLanguage,
      dataLanguages,
      actions,
      fixedActions,
      altActions,
      getIsAltRow
    } = this.props;

    const getActionsObjs = (actions, row) =>
      (actions || [])
        .filter(action => action !== null)
        .map(action => typeof (action) === "function" ? action(row) : action)
        .filter(action => action !== null)
        .map(action => ({...action, row}));

    return rows !== null
      ? rows.map(row => {

        const populatedRow = {...row};

        populatedRow[DATA_INDEX_ORIGINAL_ROW] = {...populatedRow};

        if (multilangStrDataIndexes) {
          for (let dataIndex of multilangStrDataIndexes) {
            populatedRow[dataIndex] = getLocalizedStr(populatedRow[dataIndex], dataLanguage || appLanguage, dataLanguages);
          }
        }

        populatedRow[DATA_INDEX_ORIGINAL_TRANSLATED_ROW] = {...populatedRow};

        populatedRow[DATA_INDEX_FIXED_ACTIONS_OBJS] =
          fixedActions
            ? getActionsObjs(fixedActions, populatedRow[DATA_INDEX_ORIGINAL_TRANSLATED_ROW])
            : null;

        populatedRow[DATA_INDEX_ACTIONS_OBJS] =
          (actions || altActions)
            ? getActionsObjs(
            (getIsAltRow && getIsAltRow(populatedRow[DATA_INDEX_ORIGINAL_TRANSLATED_ROW])) ? altActions : actions,
            populatedRow[DATA_INDEX_ORIGINAL_TRANSLATED_ROW]
            )
            : null;

        return populatedRow;

      })
      : null;
  }

  getColWidths(rows, cols) {

    const {
      size
    } = this.props;

    const {
      gridScrollbarWidth
    } = this.state;

    if (cols === null) {
      return null;
    }

    const getTextWidthEl = $('<span>').css({visibility: 'hidden', position: 'absolute'}).appendTo('body').get(0);

    let colWidths = cols.map(col => {

      let colWidth = 0;

      const colTitleWidth =
        getTextWidth(col.title, getTextWidthEl) +
        ((!col.noFilter || !col.noSort) ? HEADER_CELL_GUTTER : 0) +
        (col.noFilter ? 0 : FILTER_BUTTON_WIDTH) +
        (col.noSort ? 0 : SORT_BUTTON_WIDTH) +
        ((!col.noFilter && !col.noSort) ? HEADER_CELL_CONTROLS_GUTTER : 0) +
        CELL_PADDING * 2 + COL_WIDTH_SAFE;

      if (col.width) {

        colWidth = Math.max(colTitleWidth, col.width);

      } else if ((col.widthToContent || col.minWidthToContent) && rows.length > 0) {

        colWidth = Math.max(
          colTitleWidth,
          ...rows.map(row =>
            getTextWidth(
              col.renderText
                ? col.renderText(row[DATA_INDEX_ORIGINAL_ROW][col.dataIndex])
                : row[col.dataIndex],
              getTextWidthEl
            ) +
            (CELL_PADDING * 2) +
            COL_WIDTH_SAFE
          )
        );

      } else if (col.minWidth) {

        colWidth = Math.max(colTitleWidth, col.minWidth);

      } else {

        colWidth = colTitleWidth;

      }

      return colWidth;
    });

    $(getTextWidthEl).remove();

    const isVariableSizeCol = col => !col.width && (rows.length > 0 ? !col.widthToContent : true);
    const variableSizeCols = cols.filter(isVariableSizeCol);

    let colWidthsSum = 0;
    colWidths.forEach(width => colWidthsSum += width);

    const availableWidth = size.width - colWidthsSum -
      ((rows !== null && this.getIsVerticalScrollbarVisible(rows.length)) ? gridScrollbarWidth : 0) -
      TABLE_TOTAL_BORDER;

    if (variableSizeCols.length > 0 && availableWidth > 0) {

      const widthToAdd = availableWidth / variableSizeCols.length;

      colWidths = colWidths.map((colWidth, colIndex) =>
        isVariableSizeCol(cols[colIndex])
          ? colWidth + widthToAdd
          : colWidth
      );
    }

    return colWidths;
  }

  calculateRowHeight(row, cols, colsWidths, textHeightEl) {
    return Math.max(
      ...cols.map((col, colIndex) => {

        $(textHeightEl).outerWidth(colsWidths[colIndex]);

        return getTextHeight(
          col.render
            ? col.render(row[col.dataIndex], row[DATA_INDEX_ORIGINAL_ROW])
            : row[col.dataIndex],
          textHeightEl
        );
      }));
  }

  getRenderedRows(rows, cols, colsWidths, selectedRowKeys) {

    const {
      rowSelection,
      tableActions,
      getRowKey
    } = this.props;


    const textHeightEl = $('<div>')
      .addClass("infinite-scroll-table__grid__cell")
      .addClass("ant-modal-body") // better include this class, it may override style in some cases
      .css({
        visibility: 'hidden',
        position: 'absolute',
        minHeight: ROW_HEIGHT
      }).appendTo('body').get(0);

    const res = rows !== null
      ? rows.map(row => {

        const resRow = {...row};

        if (rowSelection || tableActions) {
          resRow[DATA_INDEX_CHECKED] = selectedRowKeys.includes(getRowKey(row))
        }

        return ({
          ...resRow,
          [DATA_INDEX_RENDERED]: this.renderGridRow(resRow, cols, colsWidths),
          [DATA_INDEX_HEIGHT]: this.calculateRowHeight(resRow, cols, colsWidths, textHeightEl)
        });
      })
      : null;

    $(textHeightEl).remove();

    return res;
  }

  getQueriedRows(rows, cols, filters, searchText, sortCol, sortByDesc) {

    const {
      isPaginated
    } = this.props;

    if (isPaginated) {
      return rows;
    } else {
      let queriedRows = this.getFilteredGridRows(rows, cols, filters);
      queriedRows = this.getSearchTextFilteredGridRows(queriedRows, cols, searchText);
      return this.getSortedGridRows(queriedRows, cols, sortCol, sortByDesc);
    }
  }

  componentDidMount() {

    const {
      data,
      isPaginated
    } = this.props;

    const {
      filters,
      searchText,
      sortCol,
      sortByDesc
    } = this.state;

    if (data !== null) {
      const cols = this.getCols();
      const populatedRows = this.getPopulatedRows(data);
      const colWidths = this.getColWidths(populatedRows, cols);
      const renderedRows = this.getRenderedRows(populatedRows, cols, colWidths, this.getSelectedRowKeys());
      const queriedRows = this.getQueriedRows(renderedRows, cols, filters, searchText, sortCol, sortByDesc, isPaginated);

      this.setState({
        cols,
        populatedRows,
        colWidths,
        renderedRows,
        queriedRows
      });
    }
  }

  componentDidUpdate(prevProps) {

    const {
      isPaginated,
      rowSelection,
      appLanguage,
      dataLanguage,
      data
    } = this.props;

    const {
      uuid,
      filters,
      searchText,
      sortCol,
      sortByDesc,
      scrollLeft,
      scrollTop,
      resizeTimeout,
      colWidths,
      cols,
      pageSize,
      pageNum,
      pageRequestParams
    } = this.state;

    if (
      InfiniteScrollTable.isArrayPropertyChangedLazy(prevProps.data, data) ||
      prevProps.dataLanguage !== dataLanguage ||
      prevProps.appLanguage !== appLanguage
    ) {

      let newCols = null;
      let newPopulatedRows = null;
      let newColWidths = null;
      let newRenderedRows = null;
      let newQueriedRows = null;
      let newScrollTop = null;

      if (data !== null) {

        if (this.listRef.current) {
          this.listRef.current.resetAfterIndex(0, false);
        }

        newCols = this.getCols();
        newPopulatedRows = this.getPopulatedRows(this.props.data);

        newColWidths =
          colWidths !== null && cols !== null && (
            (prevProps.data === null && data === null) ||
            ((prevProps.data !== null && prevProps.data.length === 0) && (data !== null && data.length === 0))
          )
            ? colWidths
            : this.getColWidths(newPopulatedRows, newCols);
        newRenderedRows = this.getRenderedRows(newPopulatedRows, newCols, newColWidths, this.getSelectedRowKeys());
        newQueriedRows = this.getQueriedRows(
          newRenderedRows,
          newCols,
          filters,
          searchText,
          sortCol,
          sortByDesc
        );
      } else {

        const $grid = $(`.infinite-scroll-table__${uuid} .infinite-scroll-table__grid`);
        if ($grid) {
          newScrollTop = $grid.scrollTop();
        }
      }

      this.setState({
        cols: newCols,
        populatedRows: newPopulatedRows,
        colWidths: newColWidths,
        renderedRows: newRenderedRows,
        queriedRows: newQueriedRows,
        pageNum: isPaginated && pageRequestParams ? pageRequestParams.pageNum : pageNum,
        pageSize: isPaginated && pageRequestParams ? pageRequestParams.pageSize : pageSize,
        isPaginating: false,
        pageRequestParams: null,
        scrollTop: newScrollTop,
        selectedRowKeys: this.getSelectedRowKeys()
      });

    } else if (
      rowSelection &&
      InfiniteScrollTable.isArrayPropertyChangedLazy(
        prevProps.rowSelection.selectedRowKeys,
        rowSelection.selectedRowKeys
      )
    ) {

      this.setState({
        selectedRowKeys: rowSelection.selectedRowKeys,
      });
      this.updateRenderedRows(rowSelection.selectedRowKeys);

    } else if (prevProps.size && this.props.size && prevProps.size.width !== this.props.size.width) {

      if (resizeTimeout) {
        clearTimeout(resizeTimeout);
      }

      let newScrollTop = null;
      const $grid = $(`.infinite-scroll-table__${uuid} .infinite-scroll-table__grid`);
      if ($grid) {
        newScrollTop = $grid.scrollTop();
      }

      this.setState({
        isResizing: true,
        scrollTop: newScrollTop || scrollTop,
        resizeTimeout: setTimeout(
          () => {
            this.setState(state => {

              const {
                populatedRows,
                cols
              } = state;

              const colWidths = this.getColWidths(populatedRows, cols);
              const renderedRows = this.getRenderedRows(populatedRows, cols, colWidths, this.getSelectedRowKeys());
              const queriedRows = this.getQueriedRows(renderedRows, cols, filters, searchText, sortCol, sortByDesc);

              return {
                gridKeyForRefresh: uuidv4(),
                isResizing: false,
                resizeTimeout: null,
                colWidths,
                renderedRows,
                queriedRows
              };
            });
          },
          RESIZE_TIMEOUT
        )
      });
    }

    const $grid =
      $(`.infinite-scroll-table__${uuid} .infinite-scroll-table__grid:not(.infinite-scroll-table__grid--with-event-handlers)`);

    if ($grid.length) {

      const _this = this;

      $grid
        .scrollLeft(scrollLeft)
        .addClass('infinite-scroll-table__grid--with-event-handlers')
        .on('scroll', function () {
          const newScrollLeft = $(this).scrollLeft();
          if (newScrollLeft !== _this.state.scrollLeft) {
            $(`.infinite-scroll-table__${uuid} .infinite-scroll-table__header`).scrollLeft(newScrollLeft);
            _this.setState({
              scrollLeft: newScrollLeft
            });
          }
        });
    }
  }

  componentWillUnmount() {

    const {
      uuid,
      resizeTimeout,
      pageRequestTimeout,
      viewIndexesUpdateTimeout
    } = this.state;

    const $grid =
      $(`.infinite-scroll-table__${uuid} .infinite-scroll-table__grid--with-event-handlers`);

    if ($grid.length) {
      $grid.off('scroll');
    }

    if (resizeTimeout) {
      clearTimeout(resizeTimeout);
    }

    if (pageRequestTimeout) {
      clearTimeout(pageRequestTimeout);
    }

    if (viewIndexesUpdateTimeout) {
      clearTimeout(viewIndexesUpdateTimeout);
    }

  }

  shouldComponentUpdate(nextProps, nextState, nextContext) {
    if (this.state.gridKeyForRefresh === nextState.gridKeyForRefresh && this.state.scrollLeft !== nextState.scrollLeft) {
      return false;
    } else {
      return true;
    }
  }

  /* === Event handlers === */

  updateRenderedRows(selectedRowKeys) {

    const {
      populatedRows,
      cols,
      colWidths,
      filters,
      searchText,
      sortCol,
      sortByDesc
    } = this.state;

    const renderedRows = this.getRenderedRows(populatedRows, cols, colWidths, selectedRowKeys);

    this.setState({
      renderedRows,
      queriedRows: this.getQueriedRows(renderedRows, cols, filters, searchText, sortCol, sortByDesc)
    });
  }

  applyQueryChange(filters, searchText, sortCol, sortByDesc) {

    const {
      isPaginated
    } = this.props;

    const {
      renderedRows,
      cols,
      queriedRows
    } = this.state;

    this.setState({
      scrollTop: 0,
      gridKeyForRefresh: uuidv4(),
      queriedRows: isPaginated
        ? queriedRows
        : this.getQueriedRows(renderedRows, cols, filters, searchText, sortCol, sortByDesc)
    });
  }

  onFiltersChange(dataIndex, value) {

    const {
      onChange,
      isPaginated,
    } = this.props;

    const {
      searchText,
      sortCol,
      sortByDesc
    } = this.state;

    const newFilters = this.state.filters;

    if (value !== null && value.length > 0) {
      newFilters[dataIndex] = value;
    } else {
      delete newFilters[dataIndex];
    }

    const newPageRequestParams = {
      pageNum: DEFAULT_PAGE_NUM,
      pageSize: DEFAULT_PAGE_SIZE,
      searchText,
      filters: newFilters,
      sortCol,
      sortByDesc
    };

    this.setState({
      filters: newFilters,
      isPaginating: isPaginated,
      pageRequestParams: isPaginated ? newPageRequestParams : null,
      doNotCallOnChangeOnNextRenderedRowsChange: isPaginated && onChange
    });

    this.applyQueryChange(newFilters, searchText, sortCol, sortByDesc);

    if (onChange) {
      onChange(newPageRequestParams);
    }
  }

  onSearchTextChange(value) {

    const {
      onChange,
      isPaginated
    } = this.props;

    const {
      filters,
      sortCol,
      sortByDesc
    } = this.state;

    const newSearchText = value;

    const newPageRequestParams = {
      pageNum: DEFAULT_PAGE_NUM,
      pageSize: DEFAULT_PAGE_SIZE,
      searchText: newSearchText,
      filters,
      sortCol,
      sortByDesc
    };

    this.setState({
      searchText: newSearchText,
      isPaginating: isPaginated,
      pageRequestParams: isPaginated ? newPageRequestParams : null,
      doNotCallOnChangeOnNextRenderedRowsChange: isPaginated && onChange
    });
    this.applyQueryChange(filters, newSearchText, sortCol, sortByDesc);

    if (onChange) {
      onChange(newPageRequestParams);
    }
  }

  onSortChange(colDataIndex, direction) {

    const {
      onChange,
      isPaginated
    } = this.props;

    const {
      searchText,
      filters
    } = this.state;

    const newSortCol = direction ? colDataIndex : null;
    const newSortByDesc = direction === SORT_DIRECTION_DESC;

    const newPageRequestParams = {
      pageNum: DEFAULT_PAGE_NUM,
      pageSize: DEFAULT_PAGE_SIZE,
      searchText,
      filters,
      sortCol: newSortCol,
      sortByDesc: newSortByDesc
    };

    this.setState({
      sortCol: newSortCol,
      sortByDesc: newSortByDesc,
      isPaginating: isPaginated,
      pageRequestParams: isPaginated ? newPageRequestParams : null,
      doNotCallOnChangeOnNextRenderedRowsChange: isPaginated && onChange
    });

    this.applyQueryChange(filters, searchText, newSortCol, newSortByDesc);

    if (onChange) {
      onChange(newPageRequestParams);
    }
  }

  onRowSelectionChange(rowKey, selected) {

    const {
      searchText,
      sortCol,
      sortByDesc,
      filters,
    } = this.state;

    const {
      rowSelection,
      getRowKey,
      getIsDisabledRow
    } = this.props;

    if (rowSelection && (rowSelection.onSelect || rowSelection.onSelectAll)) {

      if (rowKey !== null && rowSelection.onSelect) {
        rowSelection.onSelect(rowKey, selected);
      }

      if (rowKey === null && rowSelection.onSelectAll) {
        rowSelection.onSelectAll(
          selected,
          {
            searchText,
            sortCol,
            sortByDesc,
            filters
          }
        );
      }

    } else {

      const {
        selectedRowKeys,
        queriedRows
      } = this.state;

      let newSelectedRowKeys = null;

      if (rowKey !== null) {
        newSelectedRowKeys =
          selected
            ? [...selectedRowKeys, rowKey]
            : selectedRowKeys.filter(selRowKey => selRowKey !== rowKey);
      } else {
        newSelectedRowKeys =
          selected
            ? queriedRows.map(row => row[DATA_INDEX_ORIGINAL_ROW]).filter(row => !getIsDisabledRow || !getIsDisabledRow(row)).map(row => getRowKey(row))
            : [];
      }

      if (rowSelection && rowSelection.onChange) {
        rowSelection.onChange(newSelectedRowKeys);
      }

      this.setState({
        selectedRowKeys: newSelectedRowKeys,
      });
      this.updateRenderedRows(newSelectedRowKeys);
    }
  }

  /* === Getters === */

  getCols() {

    const {
      columns,
      rowSelection
    } = this.props;

    if (columns === null) {
      return null;
    } else {

      let res = columns.filter(col => col !== null);

      if (rowSelection || this.getNormalizedTableActions().length > 0) {

        res = [
          {
            dataIndex: DATA_INDEX_CHECKED,
            render: this.renderCheckbox,
            titleRender: this.renderCheckboxTitle,
            noSearchText: true,
            noFilter: true,
            noSort: true,
            width: CHECKBOX_WIDTH,
            renderText: () => null
          },
          ...res
        ];
      }

      if (this.getNormalizedFixedActions().length > 0) {
        res = [
          ...res,
          {
            dataIndex: DATA_INDEX_FIXED_ACTIONS_OBJS,
            render: this.renderFixedActions,
            noSearchText: true,
            noFilter: true,
            noSort: true,
            disableOnRowClickForCell: true,
            renderText: () => null,
            width:
              this.getNormalizedFixedActions().length *
              (ACTION_WIDTH + ACTIONS_GUTTER) - ACTIONS_GUTTER + COL_WIDTH_SAFE + 2 * CELL_PADDING
          }
        ];
      }

      if (this.getNormalizedActions().length > 0 || this.getNormalizedAltActions().length > 0) {
        res = [
          ...res,
          {
            dataIndex: DATA_INDEX_ACTIONS_OBJS,
            render: this.renderActions,
            noSearchText: true,
            noFilter: true,
            noSort: true,
            disableOnRowClickForCell: true,
            renderText: () => null,
            width:
              Math.max(this.getNormalizedActions().length, this.getNormalizedAltActions().length) *
              (ACTION_WIDTH + ACTIONS_GUTTER) - ACTIONS_GUTTER + COL_WIDTH_SAFE + 2 * CELL_PADDING
          }
        ];
      }

      return res;
    }
  }

  getNormalizedTableActions() {

    const {
      tableActions
    } = this.props;

    return (tableActions || []).filter(action => action !== null);
  }

  getNormalizedActions() {

    const {
      actions
    } = this.props;

    return (actions || []).filter(action => action !== null);
  }

  getNormalizedAltActions() {

    const {
      altActions
    } = this.props;

    return (altActions || []).filter(action => action !== null);
  }


  getNormalizedFixedActions() {

    const {
      fixedActions
    } = this.props;

    return (fixedActions || []).filter(action => action !== null);
  }

  getSelectedRowKeys() {

    const {
      rowSelection
    } = this.props;

    const {
      selectedRowKeys
    } = this.state;

    return rowSelection && rowSelection.selectedRowKeys
      ? rowSelection.selectedRowKeys
      : selectedRowKeys;
  }

  /* === Data manipulation === */

  getFilteredGridRows(rows, cols, filters) {

    return Object.keys(filters).length > 0
      ? rows.filter(row => {

        for (let dataIndex in filters) {
          if (filters.hasOwnProperty(dataIndex)) {

            const col = cols.find(col => col.dataIndex === dataIndex);

            const testPassed =
              col.withValuesFilter
                ? filters[dataIndex].includes(row[dataIndex])
                : (
                  InfiniteScrollTable.isValuePassingSearchText(
                    col.renderText
                      ? col.renderText(row[DATA_INDEX_ORIGINAL_ROW][dataIndex])
                      : row[dataIndex],
                    filters[dataIndex]
                  )
                );

            if (!testPassed) {
              return false;
            }

          }
        }

        return true;

      })
      : rows;
  }

  getSearchTextFilteredGridRows(rows, cols, searchText) {

    return searchText !== null
      ? (
        rows !== null
          ? rows.filter(row => {
            for (let col of cols) {
              if (!col.noSearchText && typeof (row[col.dataIndex]) !== 'boolean' &&
                InfiniteScrollTable.isValuePassingSearchText(
                  col.renderText
                    ? col.renderText(row[DATA_INDEX_ORIGINAL_ROW][col.dataIndex])
                    : row[col.dataIndex],
                  searchText
                )) {
                return true;
              }
            }
            return false;
          })
          : null
      )
      : rows;
  }

  getSortedGridRows(rows, cols, sortCol, sortByDesc) {

    const column = sortCol !== null ? cols.find(col => col.dataIndex === sortCol) : null;

    return column
      ? rows.sort((a, b) => {
        const _a =
          column.renderText
            ? column.renderText(a[DATA_INDEX_ORIGINAL_ROW][column.dataIndex])
            : a[column.dataIndex];
        const _b =
          column.renderText
            ? column.renderText(b[DATA_INDEX_ORIGINAL_ROW][column.dataIndex])
            : b[column.dataIndex];
        return (
          column.sorter
            ? column.sorter(_a, _b) * (sortByDesc ? -1 : 1)
            : InfiniteScrollTable.defaultSorter(_a, _b, sortByDesc)
        );
      })
      : rows;
  }

  /* === Rendering ==== */

  renderGridRow(row, cols, colWidths) {

    const {
      onRowClick,
      getIsDisabledRow
    } = this.props;

    return (
      <div className="infinite-scroll-table__grid__row" style={{width: "100%", height: "100%"}}>
        {cols.map((col, colIndex) => {
          const cellData = row[col.dataIndex];
          const isRowClickDisabled =
            !onRowClick || col.disableOnRowClickForCell ||
            (getIsDisabledRow && getIsDisabledRow(row[DATA_INDEX_ORIGINAL_ROW]));
          let colLeftAttr = 0;
          cols
            .slice(0, colIndex)
            .map((_, index) => index)
            .forEach(index => colLeftAttr += colWidths[index]);
          return (
            <div
              key={colIndex}
              className={
                'infinite-scroll-table__grid__cell' +
                (getIsDisabledRow && getIsDisabledRow(row[DATA_INDEX_ORIGINAL_ROW])
                  ? ' infinite-scroll-table__grid__cell--disabled'
                  : '')
              }
              style={{
                position: "absolute",
                width: colWidths[colIndex],
                height: "100%",
                top: 0,
                left: colLeftAttr,
                cursor: !isRowClickDisabled ? "pointer" : null
              }}
              onClick={!isRowClickDisabled ? () => onRowClick(row[DATA_INDEX_ORIGINAL_TRANSLATED_ROW]) : null}
              title={
                col.renderText
                  ? col.renderText(cellData)
                  : cellData
              }
            >
              <div
                className="infinite-scroll-table__grid__cell__content"
                style={{overflow: col.render ? undefined : "hidden"}}
              >
                {col.render
                  ? col.render(cellData, row[DATA_INDEX_ORIGINAL_ROW])
                  : cellData
                }
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  renderHeaderCells(cols, columnWidths, rows) {

    const {
      data
    } = this.props;

    const {
      filters,
      sortCol,
      sortByDesc
    } = this.state;

    return (cols || []).map((col, index) =>
      <div
        key={index}
        className="infinite-scroll-table__header__cell"
        style={{
          width: columnWidths[index],
          height: ROW_HEIGHT
        }}
      >
        <Row type="flex" justify="space-between" gutter={HEADER_CELL_GUTTER}>
          {(col.title || col.titleRender) && (
            <Col>
              {col.titleRender ? col.titleRender(rows) : col.title}
            </Col>
          )}
          {(!col.noFilter || !col.noSort)
            ? (
              <Col>
                <Row type="flex" gutter={HEADER_CELL_CONTROLS_GUTTER}>
                  {!col.noSort && (
                    <Col>
                      <SortButtons
                        value={
                          col.dataIndex === sortCol
                            ? (sortByDesc ? SORT_DIRECTION_DESC : SORT_DIRECTION_ASC)
                            : null
                        }
                        onChange={value => this.onSortChange(col.dataIndex, value)}
                      />
                    </Col>
                  )}
                  {!col.noFilter && (
                    <Col>
                      <FilterButton
                        value={filters[col.dataIndex]}
                        onChange={value => this.onFiltersChange(col.dataIndex, value)}
                        options={
                          col.withValuesFilter
                            ? (
                              _.uniq(
                                (data || []).map(row => row[col.dataIndex])
                              ).map(option => ({
                                value: option,
                                text: col.renderText
                                  ? col.renderText(option)
                                  : option
                              })).sort((a, b) =>
                                col.sorter
                                  ? col.sorter(a.text, b.text)
                                  : InfiniteScrollTable.defaultSorter(a.text, b.text)
                              )
                            )
                            : null
                        }
                      />
                    </Col>
                  )}
                </Row>
              </Col>
            )
            : <Col>&nbsp;</Col>
          }
        </Row>
      </div>
    );
  }

  renderFixedActions(actions) {

    const {
      getRowKey
    } = this.props;

    const {
      selectedRowKeys
    } = this.state;

    return (
      <Row type="flex" gutter={ACTIONS_GUTTER}>
        {(actions || [])
          .map((action, index) =>
            <Col key={index}>
              <Button
                {...action}
                key={index}
                type="primary"
                shape="circle"
                size="small"
                onClick={
                  e => {
                    e.stopPropagation();
                    action.onClick(
                      action.row,
                      () => this.setState({
                        selectedRowKeys: selectedRowKeys.filter(key => key !== getRowKey(action.row))
                      })
                    );
                  }}
              >
                {action.iconText || null}
              </Button>
            </Col>
          )}
      </Row>
    );
  }

  renderActions(actions) {

    const {
      getRowKey
    } = this.props;

    const {
      selectedRowKeys
    } = this.state;

    return (
      <Row
        className="infinite-scroll-table__grid__cell__actions-container"
        type="flex"
        justify="end"
        gutter={ACTIONS_GUTTER}
      >
        {(actions || [])
          .map((action, index) =>
            <Col key={index}>
              <Button
                type="primary"
                shape="circle"
                size="small"
                className={`infinite-scroll-table__grid__cell__action ${action.className || ""}`}
                icon={action.icon}
                title={action.title}
                disabled={action.disabled}
                onClick={
                  e => {
                    e.stopPropagation();
                    action.onClick(
                      action.row,
                      () => this.setState({
                        selectedRowKeys: selectedRowKeys.filter(key => key !== getRowKey(action.row))
                      })
                    );
                  }}
              >
                {action.iconText || null}
              </Button>
            </Col>
          )}
      </Row>
    );
  }

  renderTableAction(action, rows) {

    const {
      getRowKey
    } = this.props;

    return (
      <Button
        type="primary"
        className={action.className}
        icon={action.icon}
        title={action.title}
        disabled={action.disabled}
        onClick={
          e => {
            e.stopPropagation();
            action.onClick(
              rows.filter(row => this.getSelectedRowKeys().includes(getRowKey(row[DATA_INDEX_ORIGINAL_ROW]))),
              () => this.onRowSelectionChange(null, false)
            )
          }}
      >
        {action.title}
      </Button>
    );
  }

  renderCheckbox(checked, row) {
    const {
      getRowKey,
      rowSelection,
      getIsDisabledRow
    } = this.props;

    const checkboxProps =
      rowSelection && rowSelection.getCheckboxProps
        ? rowSelection.getCheckboxProps(row)
        : ({
          disabled: getIsDisabledRow && getIsDisabledRow(row)
        });

    return (
      <Checkbox
        {...checkboxProps}
        checked={checked}
        onClick={e => {
          e.stopPropagation();
          this.onRowSelectionChange(getRowKey(row), !checked)
        }}
      />
    );
  }

  renderCheckboxTitle(rows) {
    const {
      getRowKey,
      getIsDisabledRow
    } = this.props;

    const selectedRowKeys = this.getSelectedRowKeys();

    const checked =
      rows !== null &&
      rows.length > 0 &&
      rows
        .filter(row => !getIsDisabledRow || !getIsDisabledRow(row[DATA_INDEX_ORIGINAL_ROW]))
        .map(row => getRowKey(row[DATA_INDEX_ORIGINAL_ROW]))
        .filter(rowKey => !selectedRowKeys.includes(rowKey))
        .length === 0;

    return (
      <Checkbox
        checked={checked}
        onChange={() => this.onRowSelectionChange(null, !checked)}
      />
    );
  }

  onRenderedRowsChange(viewStartIdx, viewEndIdx, overscanStartIdx, overscanEndIdx) {

    const {
      onChange,
      rowCount,
      isPaginated
    } = this.props;

    const {
      pageRequestTimeout,
      pageSize,
      pageNum,
      isPaginating,
      viewIndexesUpdateTimeout,
      doNotCallOnChangeOnNextRenderedRowsChange
    } = this.state;

    if (viewIndexesUpdateTimeout) {
      clearTimeout(viewIndexesUpdateTimeout);
    }

    this.setState({
      viewIndexesUpdateTimeout: setTimeout(
        () => this.setState({
          viewStartIdx,
          viewEndIdx,
          viewIndexesUpdateTimeout: null
        }),
        VIEW_INDEXES_UPDATE_TIMEOUT
      )
    });

    if (isPaginated && !doNotCallOnChangeOnNextRenderedRowsChange) {

      const currentPageIndexes = getIndexesFromPaginationParams(
        pageSize || DEFAULT_PAGE_SIZE,
        pageNum || DEFAULT_PAGE_NUM
      );

      if (
        isPaginating ||
        (overscanStartIdx < currentPageIndexes.startIdx || overscanEndIdx > currentPageIndexes.stopIdx)
      ) {

        if (pageRequestTimeout !== null) {
          clearTimeout(pageRequestTimeout);
        }

        const safePageSize = MAX_PAGE_SIZE / 2; // getPaginationParamsFromIndexes can double the size of a page
        const pageRowsThird = Math.floor(safePageSize / 3);
        const newPaginationParams =
          getPaginationParamsFromIndexes(
            Math.max(overscanStartIdx - pageRowsThird, 0),
            Math.min(overscanStartIdx + 2 * pageRowsThird - 1, rowCount - 1),
            rowCount
          );

        const newPageRequestParams = {
          pageSize: newPaginationParams.pageSize,
          pageNum: newPaginationParams.pageNum,
          filters: this.state.filters,
          searchText: this.state.searchText,
          sortCol: this.state.sortCol,
          sortByDesc: this.state.sortByDesc
        };

        this.setState({
          isPaginating: true,
          pageRequestTimeout: setTimeout(
            () => {
              onChange(newPageRequestParams);
              this.setState({
                pageRequestParams: newPageRequestParams
              })
            },
            PAGINATION_TIMEOUT
          )
        });
      }
    } else if (isPaginated) {
      this.setState({
        doNotCallOnChangeOnNextRenderedRowsChange: false
      });
    }
  }

  getIsVerticalScrollbarVisible(rowNum) {

    const {
      height = DEFAULT_TABLE_HEIGHT
    } = this.props;

    return rowNum * ROW_HEIGHT > height;
  }

  render() {

    const {
      t,
      size,
      leftActions,
      rightActions,
      showHeader = true,
      rowCount,
      isPaginated = false,
      height = DEFAULT_TABLE_HEIGHT,
      searchBarSpan = SPAN_ONE_QUARTER,
      selectedRowCount,
      autoSearch = true
    } = this.props;

    const {
      uuid,
      cols,
      gridKeyForRefresh,
      scrollTop,
      gridScrollbarWidth,
      populatedRows,
      queriedRows,
      isResizing,
      colWidths,
      pageSize,
      pageNum,
      isPaginating,
      viewStartIdx,
      viewEndIdx,
      viewIndexesUpdateTimeout,
      searchText
    } = this.state;

    const currentPageIndexes = getIndexesFromPaginationParams(
      pageSize || DEFAULT_PAGE_SIZE,
      pageNum || DEFAULT_PAGE_NUM
    );

    const colWidthsSum = _.sum(colWidths);

    return (
      <div className={`infinite-scroll-table infinite-scroll-table__${uuid}`}>
        <PreHeader
          searchText={searchText}
          autoSearch={autoSearch}
          onSearch={this.onSearchTextChange}
          selectedRowCount={selectedRowCount ? selectedRowCount : this.getSelectedRowKeys().length}
          tableActions={this.getNormalizedTableActions()}
          renderTableAction={action => this.renderTableAction(action, populatedRows)}
          leftActions={leftActions}
          rightActions={rightActions}
          searchBarSpan={searchBarSpan}
        />
        <Fragment>
          {showHeader && (
            isResizing
              ? <div className="infinite-scroll-table__header-placeholder" style={{height: ROW_HEIGHT}}/>
              : (
                <div className="infinite-scroll-table__header" style={{height: ROW_HEIGHT}}>
                  {queriedRows !== null
                    ? (
                      <Fragment>
                        <div className="infinite-scroll-table__header__cells-container">
                          {this.renderHeaderCells(cols, colWidths, queriedRows)}
                        </div>
                        <div
                          className="infinite-scroll-table__header__scrollbar-padding"
                          style={{width: gridScrollbarWidth, height: ROW_HEIGHT}}
                        >
                        </div>
                      </Fragment>
                    )
                    : (
                      <div
                        className="infinite-scroll-table__header-placeholder"
                        style={{height: ROW_HEIGHT, width: size.width}}
                      />
                    )
                  }
                </div>
              )
          )}
          {isResizing || queriedRows === null || queriedRows.length === 0
            ? (
              <div style={{height}} className="infinite-scroll-table__grid-container-placeholder">
                <CustomEmpty
                  width={(!isResizing && queriedRows !== null) ? colWidthsSum : undefined}
                  text={
                    isResizing
                      ? t('components.infiniteScroll.placeholder.resizing')
                      : (
                        queriedRows === null
                          ? t('components.infiniteScroll.placeholder.updating')
                          : undefined
                      )}
                  backgroundColor={TABLE_PLACEHOLDER_BGCOLOR}
                  image={isResizing
                    ? (
                      <Icon
                        type="loading"
                        style={{
                          marginTop: 48,
                          fontSize: 48,
                          color: "grey"
                        }}
                        spin
                      />
                    )
                    : <span/>
                  }
                />
              </div>
            )
            : (
              <div className="infinite-scroll-table__grid-container" style={{position: "relative", height}}>
                {isPaginating && (
                  <div
                    style={{
                      position: "absolute",
                      width: Math.min(colWidthsSum, size.width),
                      height,
                    }}
                  >
                    <CustomEmpty
                      text={t('components.infiniteScroll.placeholder.updating')}
                      backgroundColor={TABLE_PLACEHOLDER_BGCOLOR}
                    />
                  </div>
                )}
                <VariableSizeList
                  ref={this.listRef}
                  className="infinite-scroll-table__grid"
                  key={gridKeyForRefresh}
                  width={size.width}
                  height={height}
                  estimatedItemSize={ROW_HEIGHT}
                  itemSize={index =>
                    !isPaginated ||
                    (
                      !isPaginating &&
                      currentPageIndexes.startIdx <= index &&
                      index <= currentPageIndexes.stopIdx &&
                      (index - currentPageIndexes.startIdx < queriedRows.length)
                    )
                      ? queriedRows[isPaginated ? (index - currentPageIndexes.startIdx) : index][DATA_INDEX_HEIGHT]
                      : ROW_HEIGHT
                  }
                  itemCount={rowCount || queriedRows.length}
                  initialScrollOffset={scrollTop}
                  onItemsRendered={
                    ({visibleStartIndex, visibleStopIndex, overscanStartIndex, overscanStopIndex}) =>
                      this.onRenderedRowsChange(
                        visibleStartIndex,
                        visibleStopIndex,
                        overscanStartIndex,
                        overscanStopIndex
                      )
                  }
                >
                  {({index, style}) =>
                    <div
                      style={{...style, width: colWidthsSum}}
                      className={`infinite-scroll-table__grid__row infinite-scroll-table__grid__row--${index % 2 ? 'odd' : 'even'}`}
                    >
                      {
                        !isPaginated ||
                        (
                          !isPaginating &&
                          currentPageIndexes.startIdx <= index &&
                          index <= currentPageIndexes.stopIdx &&
                          (index - currentPageIndexes.startIdx < queriedRows.length)
                        )
                          ? (
                            queriedRows[
                              isPaginated
                                ? (index - currentPageIndexes.startIdx)
                                : index
                              ][DATA_INDEX_RENDERED]
                          )
                          : <span/>
                      }
                    </div>
                  }
                </VariableSizeList>
              </div>
            )}
          <Footer
            isHidden={queriedRows === null || queriedRows.length === 0}
            isLoading={isPaginating || viewIndexesUpdateTimeout}
            rowNumStart={viewStartIdx + 1}
            rowNumEnd={viewEndIdx + 1}
            rowCount={rowCount || (queriedRows ? queriedRows.length : null)}
          />
        </Fragment>
      </div>
    );
  }
}

export default compose(
  translate(),
  withSize(),
  withDataLanguage(),
  connect(state => ({
    appLanguage: state.app.language,
    dataLanguages: state.config.dataManagement.dataLanguages
  }))
)(InfiniteScrollTable);
