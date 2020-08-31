import React from "react";
import {connect} from 'react-redux';
import {compose} from 'redux';
import {translate} from 'react-i18next';
import {Button, Card, Col, Input, Modal, Row} from "antd";
import {
  GUTTER_MD,
  MARGIN_MD,
  MODAL_WIDTH_XL,
  PADDING_MD,
  SPAN_ONE_THIRD,
  SPAN_TWO_THIRDS
} from "../../../styles/constants";
import Call from "../../../hocs/call";
import {getLocalizedStr} from "../../../middlewares/i18n/utils";
import {
  addCubeListCubeDownloadWhereConditionsFormBlock,
  addCubeListCubeDownloadWhereConditionsFormCondition,
  changeCubeListCubeDownloadCubeColumns,
  changeCubeListCubeDownloadFilter,
  changeCubeListCubeDownloadFilterModalFilterMode,
  changeCubeListCubeDownloadFilterModalTreeFilter,
  changeCubeListCubeDownloadFilterModalTreeFilterColumnMode,
  changeCubeListCubeDownloadFilterModalTreeFilterColumnValues,
  checkCubeListCubeDownloadCubeColumns,
  deleteCubeListCubeDownloadWhereConditionsFormBlock,
  deleteCubeListCubeDownloadWhereConditionsFormCondition,
  hideCubeListCubeDownload,
  hideCubeListCubeDownloadFilterModal,
  hideCubeListCubeDownloadPreviewRowsModal,
  readCubeListCubeDownloadCsv,
  readCubeListCubeDownloadCube,
  readCubeListCubeDownloadFilterModalTreeFilterColumnCodelistCount,
  readCubeListCubeDownloadFilterModalTreeFilterColumnCodelistTree,
  readCubeListCubeDownloadFilterModalTreeFilterColumnFilteredValues,
  readCubeListCubeDownloadPreviewRows,
  readCubeListCubeDownloadWhereConditionsFormColumnValue,
  resetCubeListCubeDownloadFilterModalFilter,
  showCubeListCubeDownloadFilterModal,
  showCubeListCubeDownloadPreviewRowsModal,
  submitCubeListCubeDownloadFilterModal
} from "./actions";
import _ from "lodash";
import EnhancedModal from "../../../components/enhanced-modal";
import DraggableCheckList from "../../../components/draggable-check-list";
import "./style.css"
import {DataLanguageConsumer} from "../../../contexts/DataLanguage";
import CubeDownloadCSVForm from "./CubeDownloadCSVForm";
import QueryFormFilter from "../../../components/query-form-filter";
import {QUERY_FORM_FILTER_MODE_PLAIN} from "../../../components/query-form";
import {getTreeFilterStrFromObj} from "../../../components/tree-filter/utils";
import {getFilterStrFromObj} from "../../../utils/filter";

const mapStateToProps = state => ({
  appLanguage: state.app.language,
  dataLanguages: state.config.dataManagement.dataLanguages,
  cubeId: state.scenes.dataManager.cubeList.cubeDownloadId,
  cube: state.scenes.dataManager.cubeList.cube,
  filter: state.scenes.dataManager.cubeList.filter,
  isCubeDownloadVisible: state.scenes.dataManager.cubeList.isCubeDownloadVisible,
  isRowsModalVisible: state.scenes.dataManager.cubeList.isRowsModalVisible,
  rows: state.scenes.dataManager.cubeList.rows,
  cols: state.scenes.dataManager.cubeList.cols,
  checkedCols: state.scenes.dataManager.cubeList.checkedCols,
  isFilterModalVisible: state.scenes.dataManager.cubeList.isCubeDownloadFilterModalVisible,
  filterTemp: state.scenes.dataManager.cubeList.filterTemp,
  treeFilter: state.scenes.dataManager.cubeList.treeFilter,
  treeFilterTemp: state.scenes.dataManager.cubeList.treeFilterTemp,
  filterMode: state.scenes.dataManager.cubeList.filterMode
});

const mapDispatchToProps = dispatch => ({
  fetchCube: cubeId => dispatch(readCubeListCubeDownloadCube(cubeId)),
  onCubeDownloadHide: () => dispatch(hideCubeListCubeDownload()),
  onBlockAdd: () => dispatch(addCubeListCubeDownloadWhereConditionsFormBlock()),
  onBlockDelete: blockIndex =>
    dispatch(deleteCubeListCubeDownloadWhereConditionsFormBlock(blockIndex)),
  onConditionAdd: blockIndex =>
    dispatch(addCubeListCubeDownloadWhereConditionsFormCondition(blockIndex)),
  onConditionDelete: (blockIndex, conditionIndex) =>
    dispatch(deleteCubeListCubeDownloadWhereConditionsFormCondition(blockIndex, conditionIndex)),
  fetchColumnValues: (tableName, columnName, columnCodelistCode) =>
    dispatch(readCubeListCubeDownloadWhereConditionsFormColumnValue(tableName, columnName, columnCodelistCode)),
  onRowsModalShow: () => dispatch(showCubeListCubeDownloadPreviewRowsModal()),
  onRowsModalHide: () => dispatch(hideCubeListCubeDownloadPreviewRowsModal()),
  fetchRows: (cubeId, cubeColumns, filterStr, pageNum, pageSize, sortCols, sortByDesc) =>
    dispatch(readCubeListCubeDownloadPreviewRows(cubeId, cubeColumns, filterStr, pageNum, pageSize, sortCols, sortByDesc)),
  fetchCsv: (cubeId, cubeColumns, filterStr, separator, delimiter, compression) =>
    dispatch(readCubeListCubeDownloadCsv(cubeId, cubeColumns, filterStr, separator, delimiter, compression)),
  onCubeColumnsCheck: cols => dispatch(checkCubeListCubeDownloadCubeColumns(cols)),
  onCubeColumnsChange: cols => dispatch(changeCubeListCubeDownloadCubeColumns(cols)),
  onFilterModalShow: () => dispatch(showCubeListCubeDownloadFilterModal()),
  onFilterModalHide: () => dispatch(hideCubeListCubeDownloadFilterModal()),
  onFilterModalSubmit: filter => dispatch(submitCubeListCubeDownloadFilterModal(filter)),
  onColumnModeChange: (colName, mode) => dispatch(changeCubeListCubeDownloadFilterModalTreeFilterColumnMode(colName, mode)),
  onFilterModeChange: filterMode => dispatch(changeCubeListCubeDownloadFilterModalFilterMode(filterMode)),
  onFilterReset: () => dispatch(resetCubeListCubeDownloadFilterModalFilter()),
  onFilterChange: fields => dispatch(changeCubeListCubeDownloadFilter(fields)),
  onTreeFilterChange: treeFilter => dispatch(changeCubeListCubeDownloadFilterModalTreeFilter(treeFilter)),
  fetchColumnCodelistCount: ({codelistTriplet, language}) => dispatch(readCubeListCubeDownloadFilterModalTreeFilterColumnCodelistCount(codelistTriplet, language)),
  fetchColumnCodelistTree: ({codelistTriplet, language, itemsOrderAnnotationType}) => dispatch(readCubeListCubeDownloadFilterModalTreeFilterColumnCodelistTree(codelistTriplet, language, itemsOrderAnnotationType)),
  fetchColumnFilteredValues: (cubeId, colNames, filter) => dispatch(readCubeListCubeDownloadFilterModalTreeFilterColumnFilteredValues(cubeId, colNames, filter)),
  onColumnValuesChange: (colName, values) => dispatch(changeCubeListCubeDownloadFilterModalTreeFilterColumnValues(colName, values))
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

const getOrderCheckedCols = (cols, checkedCols) => {
  const ret = [];

  cols && checkedCols &&
  cols.map(col => _.findIndex(checkedCols, checkedCol => checkedCol === col) !== -1 ? ret.push(col) : null);

  return ret
};

const CubeDownload = ({
                        t,
                        appLanguage,
                        dataLanguages,
                        cubeId,
                        cube,
                        filter,
                        isCubeDownloadVisible,
                        isFilterModalVisible,
                        onFilterModalShow,
                        onFilterModalHide,
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
                        isRowsModalVisible,
                        onCubeDownloadHide,
                        rows,
                        cols,
                        checkedCols,
                        fetchCube,
                        onBlockAdd,
                        onBlockDelete,
                        onConditionAdd,
                        onConditionDelete,
                        fetchColumnValues,
                        onRowsModalShow,
                        onRowsModalHide,
                        fetchRows,
                        fetchCsv,
                        onCubeColumnsCheck,
                        onCubeColumnsChange
                      }) => {

  const filterStr = filterMode === QUERY_FORM_FILTER_MODE_PLAIN
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
    <Call
      cb={fetchCube}
      cbParam={cubeId}
      disabled={cubeId === null}
    >
      <EnhancedModal
        visible={cubeId !== null && isCubeDownloadVisible}
        width={MODAL_WIDTH_XL}
        title={t('scenes.dataManager.cubeList.modals.cubeDownload.title')}
        onCancel={onCubeDownloadHide}
        footer={
          <div>
            <Button onClick={onCubeDownloadHide}>{t('commons.buttons.close.title')}</Button>
            <Button
              type="primary"
              disabled={checkedCols && checkedCols.length === 0}
              onClick={() => {
                let modal = Modal.info();
                modal.update({
                  title: t("scenes.dataManager.cubeList.modals.cubeDownload.csvForm.title"),
                  content:
                    <CubeDownloadCSVForm
                      t={t}
                      modal={modal}
                      onDownload={
                        (separator, delimiter, compression) =>
                          fetchCsv(cubeId, getOrderCheckedCols(cols, checkedCols), filterStr, separator, delimiter, compression)
                      }
                    />,
                  okButtonProps: {style: {display: 'none'}},
                  cancelButtonProps: {style: {display: 'none'}},
                  icon: 'download'
                })
              }}
            >
              {t('scenes.dataManager.cubeList.modals.cubeDownload.buttons.download.title')}
            </Button>
          </div>
        }
        withDataLanguageSelector
      >
        <DataLanguageConsumer>
          {dataLanguage =>
            <Row gutter={GUTTER_MD}>
              <Col span={SPAN_ONE_THIRD}>
                <Card
                  title={t('scenes.dataManager.cubeList.modals.cubeDownload.cards.columns.title')}
                  {...cardStyle}
                >
                  <Input
                    disabled
                    value={
                      cube !== null
                        ? `[${cube.Code}] ${getLocalizedStr(cube.labels, dataLanguage || appLanguage, dataLanguages)}`
                        : null
                    }
                  />
                  <Card
                    type="inner"
                    bodyStyle={{height: 391, overflow: "auto"}}
                    style={{marginTop: MARGIN_MD}}
                  >
                    {
                      cols && checkedCols &&
                      <div className="draggable-check-list-drag-over">
                        <DraggableCheckList
                          items={cols}
                          getItemLabel={item => item}
                          getItemIcon={item => findIcon(item)}
                          getItemKey={item => item}
                          checkedKeys={checkedCols}
                          onCheck={onCubeColumnsCheck}
                          onDrop={ev => onCubeColumnsChange(onDrop(ev, cols))}
                        />
                      </div>
                    }
                  </Card>
                </Card>
              </Col>
              <Col span={SPAN_TWO_THIRDS}>
                <Card
                  title={t('scenes.dataManager.cubeList.modals.cubeDownload.cards.whereConditions.title')}
                  {...cardStyle}
                >
                  <QueryFormFilter
                    isFilterModalVisible={isFilterModalVisible}
                    onFilterModalShow={onFilterModalShow}
                    onFilterModalHide={onFilterModalHide}
                    cube={cube}
                    filter={filter}
                    filterTemp={filterTemp}
                    treeFilter={treeFilter}
                    treeFilterTemp={treeFilterTemp}
                    dataLanguage={dataLanguage}
                    fetchColumnValues={fetchColumnValues}
                    onBlockAdd={onBlockAdd} l
                    onBlockDelete={onBlockDelete}
                    onConditionAdd={onConditionAdd}
                    onConditionDelete={onConditionDelete}
                    rows={rows}
                    isRowsModalVisible={isRowsModalVisible}
                    onRowsModalHide={onRowsModalHide}
                    fetchRows={fetchRows}
                    cubeId={cubeId}
                    onRowsModalShow={onRowsModalShow}
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
                  />
                </Card>
              </Col>
            </Row>
          }
        </DataLanguageConsumer>
      </EnhancedModal>
    </Call>
  )
};

export default compose(
  translate(),
  connect(mapStateToProps, mapDispatchToProps)
)(CubeDownload);
