import React, {Fragment} from "react";
import {Button, Card, Col, Input, Modal, Radio, Row} from "antd";
import {GUTTER_SM, MARGIN_MD, MODAL_WIDTH_LG} from "../../styles/constants";
import EnhancedModal from "../enhanced-modal";
import FilterForm from "../filter-form";
import TreeFilter from "../tree-filter";
import QueryPreview from "../query-form/Preview";
import ZoomableTextarea from "../zoomable-textarea";
import {QUERY_FORM_FILTER_MODE_PLAIN, QUERY_FORM_FILTER_MODE_TREE} from "../query-form";
import {translate} from 'react-i18next';
import _ from "lodash";
import {getTreeFilterStrFromObj} from "../tree-filter/utils";
import {getLocalizedStr} from "../../middlewares/i18n/utils";
import {connect} from "react-redux";
import {compose} from "redux";
import {getFilterStrFromObj} from "../../utils/filter";

const mapStateToProps = state => ({
  appLanguage: state.app.language,
  dataLanguages: state.config.dataManagement.dataLanguages
});

class QueryFormFilter extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      isFilterQueryModalVisible: false
    };
    this.onFilterQueryModalShow = this.onFilterQueryModalShow.bind(this);
    this.onFilterQueryModalHide = this.onFilterQueryModalHide.bind(this);
  }

  onFilterQueryModalShow() {
    this.setState({
      isFilterQueryModalVisible: true
    });
  }

  onFilterQueryModalHide() {
    this.setState({
      isFilterQueryModalVisible: false
    });
  }

  render() {

    const {
      onFilterModalShow,
      cube,
      t,
      isFilterModalVisible,
      onFilterModalHide,
      onFilterModalSubmit,
      filterMode,
      filter,
      filterTemp,
      treeFilter,
      treeFilterTemp,
      disabled,
      onFilterModeChange,
      onFilterReset,
      onRowsModalShow,
      onFilterChange,
      onBlockAdd,
      onBlockDelete,
      cubeFirstRow,
      onConditionAdd,
      onConditionDelete,
      dataLanguage,
      dataLanguages,
      appLanguage,
      fetchColumnCodelistCount,
      fetchColumnCodelistTree,
      fetchColumnFilteredValues,
      cubeId,
      onTreeFilterChange,
      onColumnModeChange,
      onColumnValuesChange,
      rows,
      isRowsModalVisible,
      onRowsModalHide,
      fetchRows,
      fetchColumnValues,
      customFetchColumnValuesStr
    } = this.props;

    const {
      isFilterQueryModalVisible
    } = this.state;


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
      cube !== null && cubeFirstRow !== null && cubeFirstRow !== undefined
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
                      ? `${value.id} (${getLocalizedStr(value.name, dataLanguage || appLanguage, dataLanguages)})`
                      : value,
                  }))
                  : col.values,
              fetchValues:
                col.values !== undefined
                  ? () => fetchColumnValues(customFetchColumnValuesStr || `Dataset_${cube.IDCube}_ViewCurrentData`, col.ColName, col.CodelistCode)
                  : null
            }))
        )
        : null;

    return (
      <Fragment>
        <Row type="flex" justify="space-between" style={{marginTop: 5}}>
          <Row type="flex" gutter={GUTTER_SM}>
            <Col>
              <Button type="primary" onClick={onFilterModalShow} disabled={cube === null}>
                {t('scenes.dataManager.dataflowBuilder.wizard.query.whereConditions.buttons.editFilter.title')}
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
                  onCancel={this.onFilterQueryModalHide}
                  footer={<Button
                    onClick={this.onFilterQueryModalHide}>{t('commons.buttons.close.title')}</Button>}
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
                      disabled={disabled}
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
                        <Button icon="code" onClick={this.onFilterQueryModalShow}>
                          {t('scenes.dataManager.dataflowBuilder.wizard.query.whereConditions.buttons.showQuery.title')}
                        </Button>
                      </Col>
                      <Col>
                        <Button icon="delete" onClick={onFilterReset} disabled={disabled}>
                          {t('scenes.dataManager.dataflowBuilder.wizard.query.whereConditions.buttons.resetFilter.title')}
                        </Button>
                      </Col>
                      <Col>
                        <Button onClick={onRowsModalShow} disabled={cube === null} icon="eye">
                          {t('scenes.dataManager.dataflowBuilder.wizard.query.whereConditions.buttons.preview.title')}
                        </Button>
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
                        disabled={disabled}
                      />
                    </Card>
                  )}
                {filterMode === QUERY_FORM_FILTER_MODE_TREE && (
                  <div className="query__tree-filter">
                    <TreeFilter
                      disabled={disabled}
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
          </Row>
          <Col>
            <Button onClick={onRowsModalShow} disabled={cube === null} icon="eye">
              {t('scenes.dataManager.dataflowBuilder.wizard.query.whereConditions.buttons.preview.title')}
            </Button>
            <QueryPreview
              filterStr={isFilterModalVisible ? filterTempStr : filterStr}
              rows={rows}
              cube={cube}
              isRowsModalVisible={isRowsModalVisible}
              onRowsModalHide={onRowsModalHide}
              fetchRows={fetchRows}
            />
          </Col>
        </Row>
        <div style={{fontFamily: 'monospace', marginTop: MARGIN_MD, height: 395}}>
          <ZoomableTextarea
            disabled
            value={filterStr}
            style={{
              overflow: 'auto',
              resize: 'none'
            }}
          />
        </div>
      </Fragment>
    )
  };
}

export default compose(
  translate(),
  connect(mapStateToProps)
)(QueryFormFilter);