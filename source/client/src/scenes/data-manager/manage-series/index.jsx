import React, {Fragment, useState} from 'react';
import Selector from "../../../components/selector";
import {compose} from "redux";
import {translate} from "react-i18next";
import {connect} from "react-redux";
import {
  addManageSeriesFilterFormBlock,
  addManageSeriesFilterFormCondition,
  changeManageSeriesFilter,
  changeManageSeriesFilterModalFilterMode,
  changeManageSeriesFilterModalTreeFilter,
  changeManageSeriesFilterModalTreeFilterColumnMode,
  changeManageSeriesFilterModalTreeFilterColumnValues,
  deleteManageSeriesFilterFormBlock,
  deleteManageSeriesFilterFormCondition,
  deleteManageSeriesSeries,
  hideManageSeriesCubes,
  hideManageSeriesFilterModal,
  hideManageSeriesFilterRowsModal,
  readManageSeriesCube,
  readManageSeriesCubes,
  readManageSeriesFilterFormColumnValues,
  readManageSeriesFilterModalTreeFilterColumnCodelistCount,
  readManageSeriesFilterModalTreeFilterColumnCodelistTree,
  readManageSeriesFilterModalTreeFilterColumnFilteredValues,
  readManageSeriesFilterRows,
  readManageSeriesSeries,
  resetManageSeriesFilterModalFilter,
  setManageSeriesCube,
  setSelectedSeries,
  showManageSeriesCubes,
  showManageSeriesFilterModal,
  showManageSeriesFilterRowsModal,
  showManageSeriesSeries,
  submitManageSeriesFilterModal,
  unsetManageSeriesCube
} from "./actions";
import {getLocalizedStr} from "../../../middlewares/i18n/utils";
import {Button, Card, Col, Input, Modal, Radio, Row} from "antd";
import {
  GUTTER_MD,
  GUTTER_SM,
  MARGIN_MD,
  MODAL_WIDTH_LG,
  MODAL_WIDTH_MD,
  SPAN_HALF
} from "../../../styles/constants";
import Call from "../../../hocs/call";
import EnhancedTree from "../../../components/enhanced-tree";
import {getNode, getNodes, UNCATEGORIZED_CATEGORY_CODE} from "../../../utils/tree";
import {DCS_ORDERED_TREE_ROOT} from "../../../utils/treeBuilders";
import EnhancedModal from "../../../components/enhanced-modal";
import InfiniteScrollDataTable from "../../../components/infinite-scroll-data-table";
import "./style.css";
import {
  QUERY_FORM_FILTER_MODE_PLAIN,
  QUERY_FORM_FILTER_MODE_TREE
} from "../../../components/query-form";
import {getFilterStrFromObj, getFilterStrFromViewerObj} from "../../../utils/filter";
import _ from "lodash";
import {getTreeFilterStrFromObj} from "../../../components/tree-filter/utils";
import TreeFilter from "../../../components/tree-filter";
import FilterForm from "../../../components/filter-form";
import QueryPreview from "../../../components/query-form/Preview";

const mapStateToProps = state => ({
  appLanguage: state.app.language,
  dataLanguages: state.config.dataManagement.dataLanguages,
  cubes: state.scenes.dataManager.manageSeries.cubes,
  cubeId: state.scenes.dataManager.manageSeries.cubeId,
  cube: state.scenes.dataManager.manageSeries.cube,
  series: state.scenes.dataManager.manageSeries.series,
  selectedSeries: state.scenes.dataManager.manageSeries.selectedSeries,
  isCubesVisible: state.scenes.dataManager.manageSeries.isCubesVisible,
  isFilterModalVisible: state.scenes.dataManager.manageSeries.isFilterModalVisible,
  isFilterQueryModalVisible: state.scenes.dataManager.manageSeries.isFilterQueryModalVisible,
  filter: state.scenes.dataManager.manageSeries.filter,
  treeFilter: state.scenes.dataManager.manageSeries.treeFilter,
  filterTemp: state.scenes.dataManager.manageSeries.filterTemp,
  treeFilterTemp: state.scenes.dataManager.manageSeries.treeFilterTemp,
  filterMode: state.scenes.dataManager.manageSeries.filterMode,
  isFilterPreviewModalVisible: state.scenes.dataManager.manageSeries.isFilterPreviewModalVisible,
  isFilterRowsModalVisible: state.scenes.dataManager.manageSeries.isFilterRowsModalVisible,
  filterRows: state.scenes.dataManager.manageSeries.filterRows,
  isSeriesVisible: state.scenes.dataManager.manageSeries.isSeriesVisible
});

const mapDispatchToProps = dispatch => ({
  onCubesShow: () => dispatch(showManageSeriesCubes()),
  onCubesHide: () => dispatch(hideManageSeriesCubes()),
  onCubeSet: cubeId => dispatch(setManageSeriesCube(cubeId)),
  onCubeUnset: () => dispatch(unsetManageSeriesCube()),
  onSelectedSeriesChange: selectedSeries => dispatch(setSelectedSeries(selectedSeries)),
  fetchCubes: () => dispatch(readManageSeriesCubes()),
  fetchCube: cubeId => dispatch(readManageSeriesCube(cubeId)),
  fetchSeries: (idCube, filterStr, cols, sortCols, sortByDesc, pageNum, pageSize) =>
    dispatch(readManageSeriesSeries(idCube, filterStr, cols, sortCols, sortByDesc, pageNum, pageSize)),
  onDeleteSeries: (cubeId, seriesIds) => dispatch(deleteManageSeriesSeries(cubeId, seriesIds)),
  onFilterModalHide: () => dispatch(hideManageSeriesFilterModal()),
  onFilterModeChange: filterMode => dispatch(changeManageSeriesFilterModalFilterMode(filterMode)),
  onFilterReset: () => dispatch(resetManageSeriesFilterModalFilter()),
  onRowsModalShow: () => dispatch(showManageSeriesFilterRowsModal()),
  onRowsModalHide: () => dispatch(hideManageSeriesFilterRowsModal()),
  onFilterChange: fields => dispatch(changeManageSeriesFilter(fields)),
  onBlockAdd: () => dispatch(addManageSeriesFilterFormBlock()),
  onBlockDelete: blockIndex => dispatch(deleteManageSeriesFilterFormBlock(blockIndex)),
  onConditionAdd: blockIndex => dispatch(addManageSeriesFilterFormCondition(blockIndex)),
  onConditionDelete: (blockIndex, conditionIndex) => dispatch(deleteManageSeriesFilterFormCondition(blockIndex, conditionIndex)),
  fetchColumnCodelistCount: ({codelistTriplet, language}) => dispatch(readManageSeriesFilterModalTreeFilterColumnCodelistCount(codelistTriplet, language)),
  fetchColumnCodelistTree: ({codelistTriplet, language}) => dispatch(readManageSeriesFilterModalTreeFilterColumnCodelistTree(codelistTriplet, language)),
  fetchColumnFilteredValues: (cubeId, colNames, filter) => dispatch(readManageSeriesFilterModalTreeFilterColumnFilteredValues(cubeId, colNames, filter)),
  onTreeFilterChange: treeFilter => dispatch(changeManageSeriesFilterModalTreeFilter(treeFilter)),
  onColumnModeChange: (colName, mode) => dispatch(changeManageSeriesFilterModalTreeFilterColumnMode(colName, mode)),
  onColumnValuesChange: (colName, values) => dispatch(changeManageSeriesFilterModalTreeFilterColumnValues(colName, values)),
  fetchColumnValues: (tableName, columnName, columnCodelistCode) =>
    dispatch(readManageSeriesFilterFormColumnValues(tableName, columnName, columnCodelistCode)),
  onFilterModalSubmit: filter => dispatch(submitManageSeriesFilterModal(filter)),
  onFilterModalShow: () => dispatch(showManageSeriesFilterModal()),
  fetchRows: (cubeId, cubeColumns, filterStr, pageNum, pageSize, sortCols, sortByDesc) =>
    dispatch(readManageSeriesFilterRows(cubeId, cubeColumns, filterStr, pageNum, pageSize, sortCols, sortByDesc)),
  onSeriesShow: () => dispatch(showManageSeriesSeries())
});

const ManageSeries = ({
                        t,
                        appLanguage,
                        dataLanguages,
                        onCubesShow,
                        onCubesHide,
                        onCubeUnset,
                        onCubeSet,
                        cubes,
                        cubeId,
                        cube,
                        series,
                        selectedSeries,
                        onSelectedSeriesChange,
                        onDeleteSeries,
                        isCubesVisible,
                        fetchCubes,
                        fetchCube,
                        fetchSeries,
                        isFilterModalVisible,
                        onFilterModalShow,
                        onFilterModalHide,
                        filterMode,
                        filterTemp,
                        filter,
                        treeFilter,
                        treeFilterTemp,
                        onFilterModeChange,
                        onFilterReset,
                        onRowsModalShow,
                        onRowsModalHide,
                        onFilterChange,
                        onBlockAdd,
                        onBlockDelete,
                        onConditionAdd,
                        onConditionDelete,
                        fetchColumnCodelistCount,
                        fetchColumnCodelistTree,
                        fetchColumnFilteredValues,
                        onTreeFilterChange,
                        onColumnModeChange,
                        onColumnValuesChange,
                        fetchColumnValues,
                        onFilterModalSubmit,
                        filterRows,
                        isFilterRowsModalVisible,
                        fetchRows,
                        onSeriesShow,
                        isSeriesVisible
                      }) => {

  const [isFilterQueryModalVisible, setIsFilterQueryModalVisible] = useState(false);

  const filterStr =
    filterMode === QUERY_FORM_FILTER_MODE_PLAIN
      ?
      getFilterStrFromObj(
        filter,
        cube !== null && cube.columns !== null
          ? _.flatten(Object.keys(cube.columns)
            .map(key => cube.columns[key]))
          : null)
      :
      getTreeFilterStrFromObj(
        treeFilter,
        cube !== null && cube.columns !== null
          ? _.flatten(Object.keys(cube.columns)
            .map(key => cube.columns[key])).map(({name}) => name)
          : null
      );

  const filterTempStr =
    filterMode === QUERY_FORM_FILTER_MODE_PLAIN
      ?
      getFilterStrFromObj(
        filterTemp,
        cube !== null && cube.columns !== null
          ? _.flatten(Object.keys(cube.columns)
            .map(key => cube.columns[key]))
          : null)
      :
      getTreeFilterStrFromObj(
        treeFilterTemp,
        cube !== null && cube.columns !== null
          ? _.flatten(Object.keys(cube.columns)
            .map(key => cube.columns[key])).map(({name}) => name)
          : null
      );

  const columns =
    cube !== null
      ? (
        _.flatten(Object.keys(cube.columns).map(key => cube.columns[key]))
          .map(col => ({
            ...col,
            values:
              col.values
                ? col.values.map(value => ({
                  value: (value !== null && value.id)
                    ? value.id
                    : value,
                  label: (value !== null && value.id)
                    ? `${value.id} (${getLocalizedStr(value.name, appLanguage, dataLanguages)})`
                    : value,
                }))
                : col.values,
            fetchValues:
              col.values !== undefined
                ? () => fetchColumnValues(`Dataset_${cube.IDCube}_ViewCurrentData`, col.ColName, col.CodelistCode)
                : null
          }))
      )
      : null;

  return (
    <Fragment>
      <Card style={{marginBottom: MARGIN_MD}}>
        <Row gutter={GUTTER_MD} type="flex" justify="center">
          <Col style={{width: 480}}>
            <Selector
              selectTitle={t('scenes.dataManager.manageSeries.cubeSelector.selectIcon.title')}
              resetTitle={t('scenes.dataManager.manageSeries.cubeSelector.resetIcon.title')}
              onSelect={onCubesShow}
              onReset={onCubeUnset}
              onDetail={null}
              onChange={onCubeSet}
              value={
                cube !== null
                  ? `[${cube.Code}] ${getLocalizedStr(cube.labels, appLanguage, appLanguage, dataLanguages)}`
                  : null
              }
            />
            <EnhancedModal
              visible={isCubesVisible}
              title={t('scenes.dataManager.manageSeries.cubeSelector.modal.title')}
              footer={<Button onClick={onCubesHide}>{t('commons.buttons.close.title')}</Button>}
              onCancel={onCubesHide}
              withDataLanguageSelector
              width={MODAL_WIDTH_MD}
            >
              <Call cb={fetchCubes} disabled={cubes !== null}>
                <div className="query__cube-columns-form__tree">
                  <EnhancedTree
                    tree={cubes}
                    idKey="Code"
                    childrenKey="children"
                    nameKey="labels"
                    catIdKey="CatCode"
                    catNameKey="labels"
                    unselectableKeys={getNodes(cubes, 'children', node => node.children)
                      .map(node => node.CatCode)}
                    hiddenIdKeys={[DCS_ORDERED_TREE_ROOT.CatCode, UNCATEGORIZED_CATEGORY_CODE]}
                    getFilter={
                      searchText =>
                        ({Code, CatCode, labels}) => {
                          const search = searchText.toLowerCase();
                          return (Code && Code.toLowerCase()
                              .indexOf(search) >= 0) ||
                            (CatCode && CatCode.toLowerCase()
                              .indexOf(search) >= 0) ||
                            getLocalizedStr(labels, appLanguage, appLanguage, dataLanguages)
                              .toLowerCase()
                              .indexOf(search) >= 0;
                        }
                    }
                    onSelect={
                      selectedArr => {
                        const node = getNode(
                          cubes,
                          'children',
                          node => node.children
                            ? node.CatCode === selectedArr[0]
                            : node.Code === selectedArr[0]
                        );
                        if (node !== null && node.children === undefined) {
                          onCubeSet(node.IDCube);
                        } else {
                          onCubeUnset();
                        }
                      }
                    }
                    treeActions={[
                      {
                        title: t('scenes.dataManager.manageSeries.cubesTree.refreshIcon.title'),
                        icon: 'sync',
                        onClick: fetchCubes
                      }
                    ]}
                    icon="cube"
                    isCustomIcon
                    getIconColor={() => "#37a0f4"}
                    searchBarSpan={SPAN_HALF}
                  />
                </div>
              </Call>
            </EnhancedModal>
          </Col>
          <Col>
            <Button type="primary" disabled={cube === null} onClick={onFilterModalShow}>
              {t('scenes.dataManager.manageSeries.showFiltersButton.title')}
            </Button>
            <EnhancedModal
              visible={isFilterModalVisible}
              onCancel={onFilterModalHide}
              footer={
                <div>
                  <Button onClick={onFilterModalHide}>{t('commons.buttons.cancel.title')}</Button>
                  <Button
                    type="primary"
                    onClick={() => onFilterModalSubmit(filterMode === QUERY_FORM_FILTER_MODE_PLAIN
                      ? filterTemp
                      : treeFilterTemp
                    )}
                  >
                    {t('commons.buttons.confirm.title')}
                  </Button>
                </div>
              }
              width={MODAL_WIDTH_LG}
              title={t('scenes.dataManager.dataflowBuilder.wizard.query.whereConditions.filterModal.title')}
            >
              <EnhancedModal
                visible={isFilterQueryModalVisible}
                onCancel={() => setIsFilterQueryModalVisible(false)}
                footer={<Button
                  onClick={() => setIsFilterQueryModalVisible(false)}>{t('commons.buttons.close.title')}</Button>}
                width={MODAL_WIDTH_LG}
                title={t('scenes.dataManager.dataflowBuilder.wizard.query.whereConditions.filterQueryModal.title')}
              >
                <div style={{fontFamily: 'monospace'}}>
                  <Input.TextArea
                    disabled
                    value={filterTempStr}
                    style={{
                      overflow: 'auto',
                      resize: 'none',
                      height: 560
                    }}
                  />
                </div>
              </EnhancedModal>
              <Row type="flex" justify="space-between" style={{marginBottom: MARGIN_MD}}>
                <Col>
                  <Radio.Group
                    value={filterMode}
                    onChange={({target}) => {
                      if (
                        (target.value === QUERY_FORM_FILTER_MODE_PLAIN && Object.keys(treeFilterTemp).length > 0) ||
                        (target.value === QUERY_FORM_FILTER_MODE_TREE && filterTempStr.length > 0)
                      ) {
                        Modal.confirm({
                          title: t('scenes.dataManager.dataflowBuilder.wizard.query.whereConditions.confirms.filterModeChange.title'),
                          content: t('scenes.dataManager.dataflowBuilder.wizard.query.whereConditions.confirms.filterModeChange.content'),
                          onOk() {
                            onFilterModeChange(target.value);
                          },
                          cancelText: t('commons.buttons.cancel.title')
                        })
                      } else {
                        onFilterModeChange(target.value)
                      }
                    }}
                  >
                    <Radio.Button value={QUERY_FORM_FILTER_MODE_PLAIN}>
                      {t('scenes.dataManager.dataflowBuilder.wizard.query.whereConditions.buttons.filterModeRadio.plain.title')}
                    </Radio.Button>
                    <Radio.Button value={QUERY_FORM_FILTER_MODE_TREE}>
                      {t('scenes.dataManager.dataflowBuilder.wizard.query.whereConditions.buttons.filterModeRadio.tree.title')}
                    </Radio.Button>
                  </Radio.Group>
                </Col>
                <Col>
                  <Row type="flex" gutter={GUTTER_SM}>
                    <Col>
                      <Button icon="code" onClick={() => setIsFilterQueryModalVisible(true)}>
                        {t('scenes.dataManager.dataflowBuilder.wizard.query.whereConditions.buttons.showQuery.title')}
                      </Button>
                    </Col>
                    <Col>
                      <Button icon="delete" onClick={onFilterReset}>
                        {t('scenes.dataManager.dataflowBuilder.wizard.query.whereConditions.buttons.resetFilter.title')}
                      </Button>
                    </Col>
                    <Col>
                      <Button onClick={onRowsModalShow} disabled={cube === null} icon="eye">
                        {t('scenes.dataManager.dataflowBuilder.wizard.query.whereConditions.buttons.preview.title')}
                      </Button>
                      <QueryPreview
                        filterStr={isFilterModalVisible ? filterTempStr : filterStr}
                        rows={filterRows}
                        cube={cube}
                        isRowsModalVisible={isFilterRowsModalVisible}
                        onRowsModalHide={onRowsModalHide}
                        fetchRows={fetchRows}
                      />
                    </Col>
                  </Row>
                </Col>
              </Row>
              {
                filterMode === QUERY_FORM_FILTER_MODE_PLAIN && (
                  <Card bodyStyle={{height: 396, overflow: "auto"}}>
                    <FilterForm
                      filter={filterTemp}
                      columns={columns}
                      onChange={onFilterChange}
                      onBlockAdd={onBlockAdd}
                      onBlockDelete={onBlockDelete}
                      onBlockConditionAdd={onConditionAdd}
                      onBlockConditionDelete={onConditionDelete}
                    />
                  </Card>
                )}
              {filterMode === QUERY_FORM_FILTER_MODE_TREE && (
                <div className="query__tree-filter">
                  <TreeFilter
                    columns={columns}
                    fetchColumnCodelistCount={fetchColumnCodelistCount}
                    fetchColumnCodelistTree={fetchColumnCodelistTree}
                    fetchColumnFilteredValues={({colNames, filterStr}) =>
                      fetchColumnFilteredValues(cubeId, colNames, filterStr)}
                    onChange={onTreeFilterChange}
                    treeFilter={treeFilterTemp}
                    onColumnModeChange={onColumnModeChange}
                    onColumnValuesChange={onColumnValuesChange}
                  />
                </div>
              )}
            </EnhancedModal>
          </Col>
          <Col>
            <Button type="primary" disabled={cube === null || series !== null}
                    onClick={onSeriesShow}>
              {t('scenes.dataManager.manageSeries.showSeriesButton.title')}
            </Button>
          </Col>
        </Row>
      </Card>
      <Call cb={fetchCube} cbParam={cubeId} disabled={cubeId === null}>
        <Row gutter={GUTTER_MD} type="flex" justify="end" style={{marginBottom: MARGIN_MD}}>
          <Col>
            <Button
              type="primary"
              disabled={selectedSeries.length < 1}
              onClick={() => Modal.confirm({
                title: t('scenes.dataManager.manageSeries.modals.confirms.deleteSeries.title'),
                onOk() {
                  onDeleteSeries(cubeId, selectedSeries)
                },
                cancelText: t('commons.buttons.cancel.title')
              })}
              title={selectedSeries.length < 1 ? t('scenes.dataManager.manageSeries.deleteSeriesButton.disabledTooltip') : undefined}
            >
              {t('scenes.dataManager.manageSeries.deleteSeriesButton.title')}
            </Button>
          </Col>
        </Row>
        {cube && isSeriesVisible && (
          <div className="manage-series__table">
            <InfiniteScrollDataTable
              data={series && series.Data}
              cols={series && series.Columns}
              rowTotal={series && series.Count}
              onChange={
                ({pageNum, pageSize, searchText, filters, sortCol, sortByDesc}) => fetchSeries(
                  cube.IDCube,
                  getFilterStrFromViewerObj(
                    (cube.Dimensions || [])
                      .filter(({IsTimeSeriesDim}) => !IsTimeSeriesDim)
                      .map(({ColName}) => ColName),
                    searchText,
                    filters,
                    filterStr
                  ),
                  (cube.Dimensions || [])
                    .filter(({IsTimeSeriesDim}) => !IsTimeSeriesDim)
                    .map(({ColName}) => ColName),
                  sortCol ? [sortCol] : [],
                  sortByDesc,
                  pageNum,
                  pageSize
                )
              }
              rowSelection={{
                selectedRowKeys: selectedSeries,
                onSelect: (sid, selected) =>
                  selected
                    ? onSelectedSeriesChange([...selectedSeries, sid])
                    : onSelectedSeriesChange(selectedSeries.filter(el => el !== sid))
              }}
              getRowKey={({SID}) => SID}
            />
          </div>
        )}
      </Call>
    </Fragment>
  );
};

export default compose(
  translate(),
  connect(mapStateToProps, mapDispatchToProps)
)(ManageSeries);
