import React from 'react';
import {Card, Col, Row} from 'antd';
import {GUTTER_MD, PADDING_MD, SPAN_ONE_THIRD, SPAN_TWO_THIRDS} from '../../styles/constants';
import {translate} from 'react-i18next';
import QueryColumnsForm from './ColumnsForm';
import './style.css';
import {DataLanguageConsumer} from "../../contexts/DataLanguage";
import QueryFormFilter from "../query-form-filter";
import {connect} from "react-redux";
import {compose} from "redux";

const cardStyle = {
  type: 'inner',
  headStyle: {
    paddingLeft: PADDING_MD,
    paddingRight: PADDING_MD
  },
  size: "small",
  bodyStyle: {
    paddingLeft: PADDING_MD,
    paddingRight: PADDING_MD,
    height: 480,
    overflow: 'auto'
  }
};

export const QUERY_FORM_FILTER_MODE_PLAIN = 'QUERY_FORM_FILTER_MODE_PLAIN';
export const QUERY_FORM_FILTER_MODE_TREE = 'QUERY_FORM_FILTER_MODE_TREE';

const mapStateToProps = state => ({
  appLanguage: state.app.language,
  dataLanguages: state.config.dataManagement.dataLanguages
});

class QueryForm extends React.Component {

  render() {

    const {
      t,
      appLanguage,
      dataLanguages,
      categorisedCubes,
      ddbDataflowId,
      ddbDataflow,
      isCubeTreeVisible,
      cubeId,
      cube,
      cubeFirstRow,
      isRowsModalVisible,
      filter,
      filterTemp,
      treeFilter,
      treeFilterTemp,
      filterMode,
      rows,
      fetchDdbDataflow,
      fetchCube,
      fetchCategorisedCubes,
      fetchCubeFirstRow,
      fetchColumnValues,
      fetchColumnCodelistCount,
      fetchColumnCodelistTree,
      fetchColumnFilteredValues,
      onCubeTreeShow,
      onCubeTreeHide,
      onCubeSet,
      onCubeUnset,
      onColumnsChange,
      onBlockAdd,
      onBlockDelete,
      onConditionAdd,
      onConditionDelete,
      onFilterChange,
      fetchRows,
      onRowsModalShow,
      onRowsModalHide,
      onFilterReset,
      onFilterModeChange,
      onFilterModalShow,
      onFilterModalHide,
      onFilterModalSubmit,
      disabled,
      isFilterModalVisible,
      onTreeFilterChange,
      onColumnModeChange,
      onColumnValuesChange,
      dsd
    } = this.props;

    let uncheckableDims = [];
    if (dsd && dsd.dataStructureComponents && dsd.dataStructureComponents.groups) {
      dsd.dataStructureComponents.groups.forEach(({groupDimensions}) =>
        uncheckableDims = uncheckableDims.concat(groupDimensions)
      );
    }

    return (
      <DataLanguageConsumer>
        {dataLanguage => {
          return (
            <Row gutter={GUTTER_MD}>
              <Col span={SPAN_ONE_THIRD}>
                <Card
                  title={t('scenes.dataManager.dataflowBuilder.wizard.query.columnsForm.title')}
                  {...cardStyle}
                >
                  <QueryColumnsForm
                    appLanguage={appLanguage}
                    dataLanguages={dataLanguages}
                    dataLanguage={dataLanguage}
                    categorisedCubes={categorisedCubes}
                    ddbDataflowId={ddbDataflowId}
                    ddbDataflow={ddbDataflow}
                    cubeId={cubeId}
                    cube={cube}
                    cubeFirstRow={cubeFirstRow}
                    isCubeTreeVisible={isCubeTreeVisible}
                    onCubeTreeShow={onCubeTreeShow}
                    onCubeTreeHide={onCubeTreeHide}
                    onCubeSet={onCubeSet}
                    onCubeUnset={onCubeUnset}
                    fetchDdbDataflow={fetchDdbDataflow}
                    fetchCube={fetchCube}
                    fetchCubeFirstRow={fetchCubeFirstRow}
                    fetchCategorisedCubes={fetchCategorisedCubes}
                    onColumnsChange={onColumnsChange}
                    disabled={disabled}
                    uncheckableDims={uncheckableDims}
                  />
                </Card>
              </Col>
              <Col span={SPAN_TWO_THIRDS}>
                <Card
                  title={t('scenes.dataManager.dataflowBuilder.wizard.query.whereConditions.title')}
                  {...cardStyle}
                >
                  <QueryFormFilter
                    onFilterModalShow={onFilterModalShow}
                    cube={cube}
                    filter={filter}
                    treeFilter={treeFilter}
                    isFilterModalVisible={isFilterModalVisible}
                    onFilterModalHide={onFilterModalHide}
                    onFilterModalSubmit={onFilterModalSubmit}
                    filterMode={filterMode}
                    filterTemp={filterTemp}
                    treeFilterTemp={treeFilterTemp}
                    disabled={disabled}
                    onFilterModeChange={onFilterModeChange}
                    onFilterReset={onFilterReset}
                    onRowsModalShow={onRowsModalShow}
                    dataLanguage={dataLanguage}
                    onFilterChange={onFilterChange}
                    onBlockAdd={onBlockAdd}
                    fetchColumnValues={fetchColumnValues}
                    onBlockDelete={onBlockDelete}
                    onConditionAdd={onConditionAdd}
                    onConditionDelete={onConditionDelete}
                    fetchColumnCodelistCount={fetchColumnCodelistCount}
                    fetchColumnCodelistTree={fetchColumnCodelistTree}
                    fetchColumnFilteredValues={fetchColumnFilteredValues}
                    cubeId={cubeId}
                    onTreeFilterChange={onTreeFilterChange}
                    onColumnModeChange={onColumnModeChange}
                    cubeFirstRow={cubeFirstRow}
                    onColumnValuesChange={onColumnValuesChange}
                    rows={rows}
                    isRowsModalVisible={isRowsModalVisible}
                    onRowsModalHide={onRowsModalHide}
                    fetchRows={fetchRows}
                  />
                </Card>
              </Col>
            </Row>
          );
        }}
      </DataLanguageConsumer>
    );
  }
}

export default compose(translate(), connect(mapStateToProps))(QueryForm);
