import React, {Fragment} from 'react';
import {Button, Col, Form, Row, Select} from 'antd';
import {compose} from "redux";
import {connect} from "react-redux";
import {translate} from 'react-i18next';
import Selector from "../../components/selector";
import {GUTTER_MD, GUTTER_SM, MARGIN_SM, SPAN_HALF, SPAN_ONE_THIRD, SPAN_TWO_THIRDS} from "../../styles/constants";
import TreeFilter from "../../components/tree-filter";
import Call from "../../hocs/call";
import {getArtefactTripletFromString} from "../../utils/sdmxJson";
import "./style.css";

export const CONTENT_CONSTRAINTS_ARTEFACT_TYPE_DATAFLOW = "dataflow";
export const CONTENT_CONSTRAINTS_ARTEFACT_TYPE_DATAFLOW_LABEL = "Dataflow";
export const CONTENT_CONSTRAINTS_ARTEFACT_TYPE_DSD = "dsd";
export const CONTENT_CONSTRAINTS_ARTEFACT_TYPE_DSD_LABEL = "Data Structure Definition";

const mapStateToProps = state => ({
  nodes: state.config.nodes,
  nodeId: state.app.endpointId,
  username: state.app.user.username
});

const formItemLayout = {
  labelCol: {span: SPAN_ONE_THIRD},
  wrapperCol: {span: SPAN_TWO_THIRDS}
};

const FilterTab = ({
                     t,
                     nodes,
                     nodeId,
                     username,
                     artefactType,
                     artefactTriplet,
                     onArtefactTypeSelect,
                     onArtefactsShow,
                     onArtefactUnset,
                     filterDsdTriplet,
                     filterCubeId,
                     onFilterReset,
                     filterColumns,
                     onFilterChange,
                     isFilterQueryVisible,
                     onFilterQueryShow,
                     onFilterQueryHide,
                     filter,
                     onFilterColumnModeChange,
                     onFilterColumnValuesChange,
                     fetchArtefact,
                     fetchFilterDsd,
                     fetchFilterCube,
                     fetchFilterColumnCodelistCount,
                     fetchFilterColumnCodelistTree,
                     fetchFilterColumnFilteredValues,
                     disabled
                   }) => {
  const haveDMWS = nodes.find(node => node.general.id === nodeId).endpoint.haveDMWS;
  const isUserLogged = username !== null && username !== undefined;
  return (
    <Fragment>
      <Row gutter={GUTTER_MD}>
        <Col span={SPAN_HALF}>
          <Form.Item
            label={t('scenes.metaManager.commons.detail.tabs.constraintItems.select.title')}
            className="form-item-required"
            {...formItemLayout}
          >
            <Select
              disabled={disabled}
              showSearch
              filterOption={(inputValue, {props}) =>
                props.title.toLowerCase().includes(inputValue.toLowerCase())
              }
              defaultValue={artefactType}
              onSelect={onArtefactTypeSelect}
              style={{width: "100%"}}
            >
              <Select.Option
                value={CONTENT_CONSTRAINTS_ARTEFACT_TYPE_DATAFLOW}
                title={CONTENT_CONSTRAINTS_ARTEFACT_TYPE_DATAFLOW_LABEL}
              >
                {CONTENT_CONSTRAINTS_ARTEFACT_TYPE_DATAFLOW_LABEL}
              </Select.Option>
              <Select.Option
                value={CONTENT_CONSTRAINTS_ARTEFACT_TYPE_DSD}
                title={CONTENT_CONSTRAINTS_ARTEFACT_TYPE_DSD_LABEL}
              >
                {CONTENT_CONSTRAINTS_ARTEFACT_TYPE_DSD_LABEL}
              </Select.Option>
            </Select>
          </Form.Item>
        </Col>
        <Col span={SPAN_HALF}>
          <Form.Item
            label={t('scenes.metaManager.commons.detail.tabs.constraintItems.selector.title')}
            className="form-item-required"
            {...formItemLayout}
          >
            <Selector
              value={artefactTriplet}
              selectTitle={t('scenes.metaManager.commons.detail.tabs.constraintItems.selector.select.title')}
              resetTitle={t('scenes.metaManager.commons.detail.tabs.constraintItems.selector.reset.title')}
              onSelect={onArtefactsShow}
              onReset={onArtefactUnset}
              disabled={disabled}
            />
          </Form.Item>
        </Col>
      </Row>
      <Call
        cb={fetchArtefact}
        cbParam={{
          artefactType,
          artefactTriplet: artefactTriplet ? getArtefactTripletFromString(artefactTriplet) : null,
          haveDMWS,
          isUserLogged
        }}
        disabled={artefactTriplet === null}
      >
        <Call cb={fetchFilterDsd} cbParam={filterDsdTriplet} disabled={filterDsdTriplet === null}>
          <Call cb={fetchFilterCube} cbParam={filterCubeId} disabled={filterCubeId === null}>
            <div className={"content-constraint-filter-tab__tree-filter"}>
              <TreeFilter
                hideInclusionRadio
                disabled={disabled}
                columns={filterColumns || []}
                fetchColumnCodelistCount={fetchFilterColumnCodelistCount}
                fetchColumnCodelistTree={fetchFilterColumnCodelistTree}
                fetchColumnFilteredValues={
                  filterCubeId
                    ? ({colNames, filterStr}) => fetchFilterColumnFilteredValues(filterCubeId, colNames, filterStr)
                    : null
                }
                onChange={onFilterChange}
                treeFilter={filter}
                onColumnModeChange={onFilterColumnModeChange}
                onColumnValuesChange={onFilterColumnValuesChange}
                isCC
              />
            </div>
            <Row type="flex" justify="end" gutter={GUTTER_SM} style={{marginTop: MARGIN_SM}}>
              <Col>
                <Button icon="delete" onClick={onFilterReset} disabled={disabled}>
                  {t('components.contentConstraintFilterTab.buttons.resetFilters.title')}
                </Button>
              </Col>
            </Row>
          </Call>
        </Call>
      </Call>
    </Fragment>
  );
};

export default compose(
  connect(mapStateToProps),
  translate()
)(FilterTab);
