import React from "react";
import {connect} from 'react-redux';
import {compose} from 'redux';
import {translate} from 'react-i18next';
import {Button, Card, Col, Input, Row} from "antd";
import {
  GUTTER_MD,
  MARGIN_MD,
  MODAL_WIDTH_XL,
  PADDING_MD,
  SPAN_ONE_THIRD,
  SPAN_TWO_THIRDS
} from "../../../../styles/constants";
import {getLocalizedStr} from "../../../../middlewares/i18n/utils";
import {
  addDataflowBuilderListDataflowDownloadFilterFormBlock,
  addDataflowBuilderListDataflowDownloadFilterFormCondition,
  changeDataflowBuilderListDataflowDownloadColumns,
  changeDataflowBuilderListDataflowDownloadFilter,
  changeDataflowBuilderListDataflowDownloadFilterModalFilterMode,
  changeDataflowBuilderListDataflowDownloadFilterModalTreeFilter,
  changeDataflowBuilderListDataflowDownloadFilterModalTreeFilterColumnMode,
  changeDataflowBuilderListDataflowDownloadFilterModalTreeFilterColumnValues,
  checkDataflowBuilderListDataflowDownloadColumns,
  deleteDataflowBuilderListDataflowDownloadFilterFormBlock,
  deleteDataflowBuilderListDataflowDownloadFilterFormCondition,
  hideDataflowBuilderListDataflowDownloadFilterModal,
  hideDataflowBuilderListDataflowDownloadFilterRowsModal,
  hideDataflowBuilderListDataflowDownloadQuery,
  readDataflowBuilderListDataflowDownloadFilterFormColumnValue,
  readDataflowBuilderListDataflowDownloadFilterModalTreeFilterColumnCodelistCount,
  readDataflowBuilderListDataflowDownloadFilterModalTreeFilterColumnCodelistTree,
  readDataflowBuilderListDataflowDownloadFilterModalTreeFilterColumnFilteredValues,
  readDataflowBuilderListDataflowDownloadFilterRows,
  resetDataflowBuilderListDataflowDownloadFilterModalFilter,
  setDataflowBuilderListDataflowDownloadQuery,
  showDataflowBuilderListDataflowDownloadFilterModal,
  showDataflowBuilderListDataflowDownloadFilterRowsModal,
  showDataflowBuilderListDataflowDownloadPreview,
  submitDataflowBuilderListDataflowDownloadFilterModal,
  unsetDataflowBuilderListDataflowDownloadQuery
} from "./actions";
import _ from "lodash";
import EnhancedModal from "../../../../components/enhanced-modal";
import DraggableCheckList from "../../../../components/draggable-check-list";
import "./style.css"
import {DataLanguageConsumer} from "../../../../contexts/DataLanguage";
import QueryFormFilter from "../../../../components/query-form-filter";
import {QUERY_FORM_FILTER_MODE_TREE} from "../../../../components/query-form";

const mapStateToProps = state => ({
  appLanguage: state.app.language,
  dataLanguages: state.config.dataManagement.dataLanguages,
  dlIsDataflowQueryVisible: state.scenes.dataManager.dataflowBuilder.components.list.dlIsDataflowQueryVisible,
  dlDataflowId: state.scenes.dataManager.dataflowBuilder.components.list.dlDataflowId,
  dlDataflow: state.scenes.dataManager.dataflowBuilder.components.list.dlDataflow,
  cube: state.scenes.dataManager.dataflowBuilder.components.list.cube,
  cubeId: state.scenes.dataManager.dataflowBuilder.components.list.cubeId,
  dlCols: state.scenes.dataManager.dataflowBuilder.components.list.dlCols,
  dlCheckedCols: state.scenes.dataManager.dataflowBuilder.components.list.dlCheckedCols,
  isFilterModalVisible: state.scenes.dataManager.dataflowBuilder.components.list.isCubeDownloadFilterModalVisible,
  filter: state.scenes.dataManager.dataflowBuilder.components.list.filter,
  filterTemp: state.scenes.dataManager.dataflowBuilder.components.list.filterTemp,
  treeFilter: state.scenes.dataManager.dataflowBuilder.components.list.treeFilter,
  treeFilterTemp: state.scenes.dataManager.dataflowBuilder.components.list.treeFilterTemp,
  filterMode: state.scenes.dataManager.dataflowBuilder.components.list.filterMode,
  filterRows: state.scenes.dataManager.dataflowBuilder.components.list.filterRows,
  isRowsModalVisible: state.scenes.dataManager.dataflowBuilder.components.list.isRowsModalVisible,

});

const mapDispatchToProps = dispatch => ({
  onDownloadQueryHide: () => dispatch(hideDataflowBuilderListDataflowDownloadQuery()),
  onDownloadQuerySet: (cols, filter) => dispatch(setDataflowBuilderListDataflowDownloadQuery(cols, filter)),
  onDownloadQueryUnset: () => dispatch(unsetDataflowBuilderListDataflowDownloadQuery()),
  onBlockAdd: () => dispatch(addDataflowBuilderListDataflowDownloadFilterFormBlock()),
  onBlockDelete: blockIndex => dispatch(deleteDataflowBuilderListDataflowDownloadFilterFormBlock(blockIndex)),
  onConditionAdd: blockIndex => dispatch(addDataflowBuilderListDataflowDownloadFilterFormCondition(blockIndex)),
  onConditionDelete: (blockIndex, conditionIndex) =>
    dispatch(deleteDataflowBuilderListDataflowDownloadFilterFormCondition(blockIndex, conditionIndex)),
  fetchColumnValues: (tableName, columnName, columnCodelistCode) =>
    dispatch(readDataflowBuilderListDataflowDownloadFilterFormColumnValue(tableName, columnName, columnCodelistCode)),
  onPreviewShow: () => dispatch(showDataflowBuilderListDataflowDownloadPreview()),
  onColumnsCheck: cols => dispatch(checkDataflowBuilderListDataflowDownloadColumns(cols)),
  onColumnsChange: cols => dispatch(changeDataflowBuilderListDataflowDownloadColumns(cols)),
  onFilterModalShow: () => dispatch(showDataflowBuilderListDataflowDownloadFilterModal()),
  onFilterModalHide: () => dispatch(hideDataflowBuilderListDataflowDownloadFilterModal()),
  onFilterModalSubmit: filter => dispatch(submitDataflowBuilderListDataflowDownloadFilterModal(filter)),
  onColumnModeChange: (colName, mode) => dispatch(changeDataflowBuilderListDataflowDownloadFilterModalTreeFilterColumnMode(colName, mode)),
  onFilterModeChange: filterMode => dispatch(changeDataflowBuilderListDataflowDownloadFilterModalFilterMode(filterMode)),
  onFilterReset: () => dispatch(resetDataflowBuilderListDataflowDownloadFilterModalFilter()),
  onFilterChange: fields => dispatch(changeDataflowBuilderListDataflowDownloadFilter(fields)),
  onTreeFilterChange: treeFilter => dispatch(changeDataflowBuilderListDataflowDownloadFilterModalTreeFilter(treeFilter)),
  fetchColumnCodelistCount: ({codelistTriplet, language}) => dispatch(readDataflowBuilderListDataflowDownloadFilterModalTreeFilterColumnCodelistCount(codelistTriplet, language)),
  fetchColumnCodelistTree: ({codelistTriplet, language, itemsOrderAnnotationType}) => dispatch(readDataflowBuilderListDataflowDownloadFilterModalTreeFilterColumnCodelistTree(codelistTriplet, language, itemsOrderAnnotationType)),
  fetchColumnFilteredValues: (cubeId, colNames, filter) => dispatch(readDataflowBuilderListDataflowDownloadFilterModalTreeFilterColumnFilteredValues(cubeId, colNames, filter)),
  onColumnValuesChange: (colName, values) => dispatch(changeDataflowBuilderListDataflowDownloadFilterModalTreeFilterColumnValues(colName, values)),
  onRowsModalShow: () => dispatch(showDataflowBuilderListDataflowDownloadFilterRowsModal()),
  onRowsModalHide: () => dispatch(hideDataflowBuilderListDataflowDownloadFilterRowsModal()),
  fetchRows: (cubeId, cubeColumns, filterStr, pageNum, pageSize, sortCols, sortByDesc) =>
    dispatch(readDataflowBuilderListDataflowDownloadFilterRows(cubeId, cubeColumns, filterStr, pageNum, pageSize, sortCols, sortByDesc)),
});

const cardStyle = {
  type: 'inner',
  headStyle: {
    paddingLeft: PADDING_MD,
    paddingRight: PADDING_MD
  },
  bodyStyle: {
    paddingLeft: PADDING_MD,
    paddingRight: PADDING_MD,
    height: 480,
    overflow: 'auto'
  }
};

const onDrop = (ev, cols) => {
  const array = _.cloneDeep(cols);
  const pos = ev.node.props.pos.split('-');
  const dropPos = ev.dropPosition - Number(pos[pos.length - 1]);

  const from = array.indexOf(ev.dragNode.props.eventKey);
  let to = array.indexOf(ev.node.props.eventKey);
  to = from < to
    ? dropPos < 0 // moving forward into the array
      ? to - 1 // dropPos = -1 => drag on top node gap
      : to // dropPos = 1 => drag on bottom node gap
    : dropPos < 0 // moving backwards into the array
      ? to // dropPos = -1 => drag on top node gap
      : to + 1; // dropPos = 1 => drag on bottom node gap
  if (to === -1) {
    to = 0
  }
  if (to === array.length + 1) {
    to = array.length
  }

  array.splice(to, 0, array.splice(from, 1)[0]);

  return array
};

const DataflowDownloadQueryForm = ({
                                     t,
                                     appLanguage,
                                     dataLanguages,
                                     dlIsDataflowQueryVisible,
                                     dlDataflowId,
                                     dlDataflow,
                                     cube,
                                     cubeId,
                                     isFilterModalVisible,
                                     onFilterModalShow,
                                     onFilterModalHide,
                                     filter,
                                     filterTemp,
                                     treeFilter,
                                     treeFilterTemp,
                                     onFilterModalSubmit,
                                     onColumnModeChange,
                                     onFilterModeChange,
                                     filterMode,
                                     onFilterReset,
                                     onFilterChange,
                                     onTreeFilterChange,
                                     onColumnValuesChange,
                                     fetchColumnCodelistCount,
                                     fetchColumnCodelistTree,
                                     fetchColumnFilteredValues,
                                     dlCols,
                                     dlCheckedCols,
                                     onDownloadQueryHide,
                                     onDownloadQuerySet,
                                     onDownloadQueryUnset,
                                     onBlockAdd,
                                     onBlockDelete,
                                     onConditionAdd,
                                     onConditionDelete,
                                     fetchColumnValues,
                                     onColumnsCheck,
                                     onColumnsChange,
                                     filterRows,
                                     isRowsModalVisible,
                                     onRowsModalShow,
                                     onRowsModalHide,
                                     fetchRows
                                   }) => {

    const findIcon = label => {
      if (cube && cube.columns && cube.columns.dimensions &&
        !_.isEmpty(cube.columns.dimensions.filter(col => label === col.ColName))) {
        return "bar-chart";
      } else if (cube && cube.columns && cube.columns.timeDimensions &&
        !_.isEmpty(cube.columns.timeDimensions.filter(col => label === col.ColName))) {
        return "clock-circle";
      } else if (cube && cube.columns && cube.columns.tidAttributes &&
        !_.isEmpty(cube.columns.tidAttributes.filter(col => label === col.ColName))) {
        return "flag";
      } else if (cube && cube.columns && cube.columns.attributes &&
        !_.isEmpty(cube.columns.attributes.filter(col => label === col.ColName))) {
        return "profile";
      } else if (cube && cube.columns && cube.columns.measures &&
        !_.isEmpty(cube.columns.measures.filter(col => label === col.ColName))) {
        return "line-chart";
      } else {
        return "";
      }
    };

    return (
      <EnhancedModal
        visible={dlIsDataflowQueryVisible}
        width={MODAL_WIDTH_XL}
        title={t('scenes.dataManager.dataflowBuilder.dataflowDownload.modals.query.title')}
        onCancel={onDownloadQueryHide}
        footer={
          <div>
            <Button onClick={onDownloadQueryHide}>
              {t('commons.buttons.close.title')}
            </Button>
            <Button onClick={onDownloadQueryUnset}>
              {t('commons.buttons.unset.title')}
            </Button>
            <Button
              type="primary"
              onClick={() => onDownloadQuerySet(dlCheckedCols, filterMode === QUERY_FORM_FILTER_MODE_TREE ? treeFilter : filter)}
              disabled={dlCheckedCols && dlCheckedCols.length === 0}
            >
              {t('commons.buttons.set.title')}
            </Button>
          </div>
        }
        withDataLanguageSelector
      >
        <DataLanguageConsumer>
          {dataLanguage => {
            const lang = dataLanguage || appLanguage;
            return (
              <Row gutter={GUTTER_MD}>
                <Col span={SPAN_ONE_THIRD}>
                  <Card
                    title={t('scenes.dataManager.dataflowBuilder.dataflowDownload.modals.query.cards.columns.title')}
                    {...cardStyle}
                  >
                    <Input
                      disabled
                      value={
                        dlDataflow !== null
                          ? `[${dlDataflow.ID}] ${getLocalizedStr(dlDataflow.labels, lang, dataLanguages)}`
                          : null
                      }
                    />
                    <Card
                      type="inner"
                      bodyStyle={{height: 391, overflow: "auto"}}
                      style={{marginTop: MARGIN_MD}}
                    >
                      {
                        dlCols && dlCheckedCols &&
                        <div className="draggable-check-list-drag-over">
                          <DraggableCheckList
                            items={dlCols}
                            getItemLabel={item => item}
                            getItemIcon={item => findIcon(item)}
                            getItemKey={item => item}
                            checkedKeys={dlCheckedCols}
                            onCheck={onColumnsCheck}
                            onDrop={ev => onColumnsChange(onDrop(ev, dlCols))}
                          />
                        </div>
                      }
                    </Card>
                  </Card>
                </Col>
                <Col span={SPAN_TWO_THIRDS}>
                  <Card
                    title={t('scenes.dataManager.dataflowBuilder.dataflowDownload.modals.query.cards.filter.title')}
                    {...cardStyle}
                  >
                    <QueryFormFilter
                      customFetchColumnValuesStr={`Dataset_DF${dlDataflowId}_ViewCurrentData`}
                      isFilterModalVisible={isFilterModalVisible}
                      onFilterModalShow={onFilterModalShow}
                      onFilterModalHide={onFilterModalHide}
                      cubeId={cubeId}
                      cube={cube}
                      filter={filter}
                      filterTemp={filterTemp}
                      treeFilter={treeFilter}
                      treeFilterTemp={treeFilterTemp}
                      dataLanguage={dataLanguage}
                      fetchColumnValues={fetchColumnValues}
                      onBlockAdd={onBlockAdd}
                      onBlockDelete={onBlockDelete}
                      onConditionAdd={onConditionAdd}
                      onConditionDelete={onConditionDelete}
                      onFilterModalSubmit={onFilterModalSubmit}
                      onColumnModeChange={onColumnModeChange}
                      onFilterModeChange={onFilterModeChange}
                      filterMode={filterMode}
                      onFilterReset={onFilterReset}
                      onFilterChange={onFilterChange}
                      onTreeFilterChange={onTreeFilterChange}
                      fetchColumnCodelistCount={fetchColumnCodelistCount}
                      fetchColumnCodelistTree={fetchColumnCodelistTree}
                      fetchColumnFilteredValues={fetchColumnFilteredValues}
                      onColumnValuesChange={onColumnValuesChange}
                      cubeFirstRow={true}
                      rows={filterRows}
                      isRowsModalVisible={isRowsModalVisible}
                      onRowsModalShow={onRowsModalShow}
                      onRowsModalHide={onRowsModalHide}
                      fetchRows={fetchRows}
                    />
                  </Card>
                </Col>
              </Row>
            )
          }}
        </DataLanguageConsumer>
      </EnhancedModal>
    )
  }
;

export default compose(
  translate(),
  connect(mapStateToProps, mapDispatchToProps)
)(DataflowDownloadQueryForm);
