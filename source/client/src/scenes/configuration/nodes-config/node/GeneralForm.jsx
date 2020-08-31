import React from 'react';
import {translate} from 'react-i18next';
import {Checkbox, Col, Form, Input, Row, Select} from "antd";
import {compose} from "redux";
import _ from "lodash";
import {GUTTER_MD} from "../../../../styles/constants";

export const NODES_CONFIG_NODE_GENERAL_ITEMS_VIEW_MODE_TABLE = 'Table';
export const NODES_CONFIG_NODE_GENERAL_ITEMS_VIEW_MODE_TREE = 'Tree';

const mapPropsToFields = ({General}) => ({
  ID: Form.createFormField({value: General && General.ID ? General.ID : ""}),
  Name: Form.createFormField({value: General && General.Name ? General.Name : ""}),
  DefaultItemsViewMode: Form.createFormField({value: General ? General.DefaultItemsViewMode : null}),
  Invisible: Form.createFormField({value: General ? General.Invisible : null})
});

const onFieldsChange = (props, fields) => props.onChange(_.mapValues(fields, ({value}) => value));

const GeneralForm = ({
                       t,
                       form,
                       disableID
                     }) =>
  <Form>
    <Form.Item
      className="form-item-required"
      label={t('data.nodesConfig.general.id.label')}
      style={{marginBottom: 0}}
    >
      {form.getFieldDecorator('ID', {normalize: _.toUpper})(<Input disabled={disableID}/>)}
    </Form.Item>
    <Form.Item
      className="form-item-required"
      label={t('data.nodesConfig.general.name.label')}
      style={{marginBottom: 0}}
    >
      {form.getFieldDecorator('Name')(<Input/>)}
    </Form.Item>
    <Form.Item
      className="form-item-required"
      label={t('data.nodesConfig.general.defaultItemsViewMode.label')}
      style={{marginBottom: 0}}
    >
      {form.getFieldDecorator('DefaultItemsViewMode')(
        <Select
          showSearch
          filterOption={(inputValue, {props}) =>
            props.title.toLowerCase().includes(inputValue.toLowerCase())
          }
        >
          <Select.Option
            value={NODES_CONFIG_NODE_GENERAL_ITEMS_VIEW_MODE_TABLE}
            title={t('data.nodesConfig.general.defaultItemsViewMode.options.table.label')}
          >
            {t('data.nodesConfig.general.defaultItemsViewMode.options.table.label')}
          </Select.Option>
          <Select.Option
            value={NODES_CONFIG_NODE_GENERAL_ITEMS_VIEW_MODE_TREE}
            title={t('data.nodesConfig.general.defaultItemsViewMode.options.tree.label')}
          >
            {t('data.nodesConfig.general.defaultItemsViewMode.options.tree.label')}
          </Select.Option>
        </Select>
      )}
    </Form.Item>
    <Row type="flex" justify="start" align="middle" gutter={GUTTER_MD} style={{marginBottom: 0}}>
      <Col style={{color: 'rgba(0, 0, 0, 0.85)'}}>
        {t("data.nodesConfig.general.invisible.label") + ' :'}
      </Col>
      <Col>
        <Form.Item>
          {form.getFieldDecorator("Invisible", {valuePropName: 'checked'})(
            <Checkbox/>
          )}
        </Form.Item>
      </Col>
    </Row>
  </Form>;

export default compose(
  translate(),
  Form.create({mapPropsToFields, onFieldsChange})
)(GeneralForm);
