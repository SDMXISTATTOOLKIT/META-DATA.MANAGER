import React, {Fragment} from 'react';
import {compose} from 'redux';
import {translate} from 'react-i18next';
import {Card, Col, Form, Input, Row} from 'antd';
import {MARGIN_MD, SPAN_FULL, SPAN_ONE_THIRD} from '../../styles/constants';
import _ from 'lodash';
import MultilanguageInput from '../multilanguage-input';
import {normalizeId, normalizeOrder} from "../../utils/normalizers";
import AnnotationsForm from "../annotations-form";
import Selector from "../selector";
import MultilanguageZoomableTextArea from "../multilanguage-zoomable-textarea";
import {getLayoutAnnotationFullname, setLayoutAnnotationFullName} from "../../utils/annotations";

const mapPropsToFields = ({item, annotationsConfig}) => ({
  id: Form.createFormField({value: (item && item.id) ? item.id : null}),
  parent: Form.createFormField({value: (item && item.parent) ? item.parent : null}),
  order: Form.createFormField({
    value: (item && item.order)
      ? _.mapValues(item.order, order => order > 0
        ? Math.ceil(Number(order))
        : ""
      )
      : ""
  }),
  name: Form.createFormField({value: (item && item.name) ? item.name : null}),
  description: Form.createFormField({value: (item && item.description) ? item.description : null}),
  layoutAnnotationFullName: Form.createFormField({value: (item && item.annotations) ? getLayoutAnnotationFullname(item.annotations, annotationsConfig) : null})
});

const onFieldsChange = (props, fields) => {

  const newFields = _.mapValues(fields, ({value}) => value);

  if (newFields.layoutAnnotationFullName) {
    let newAnnotations = _.cloneDeep(props.item.annotations);
    newAnnotations = setLayoutAnnotationFullName(newAnnotations, props.annotationsConfig, newFields.layoutAnnotationFullName);
    props.onChange({annotations: newAnnotations});
  } else {
    props.onChange(newFields);
  }
};

const formItemLayout = {
  labelCol: {span: 9},
  wrapperCol: {span: 15}
};

const rowStyle = {
  marginBottom: MARGIN_MD,
  marginLeft: 24,
  marginRight: 24
};

export const ITEM_FORM_MODE_EDIT = 'ITEM_FORM_MODE_EDIT';
export const ITEM_FORM_MODE_EDIT_PARENT_DISABLED = 'ITEM_FORM_MODE_EDIT_PARENT_DISABLED';
export const ITEM_FORM_MODE_CREATE = 'ITEM_FORM_MODE_CREATE';
export const ITEM_FORM_MODE_CREATE_PARENT_DISABLED = 'ITEM_FORM_MODE_CREATE_PARENT_DISABLED';
export const ITEM_FORM_MODE_READ = 'ITEM_FORM_MODE_READ';

const ItemForm = ({
                    t,
                    form,
                    item,
                    mode = ITEM_FORM_MODE_CREATE,
                    onChange,
                    itemsParentListShow,
                    itemsParentListUnset
                  }) =>
  <Fragment>
    <Form>
      <Row style={rowStyle}>
        <Col
          span={SPAN_ONE_THIRD}
        >
          <Form.Item
            className="form-item-required"
            label={t("data.item.id.label")}
            {...formItemLayout}
          >
            {form.getFieldDecorator("id", {normalize: normalizeId})(
              <Input
                disabled={mode !== ITEM_FORM_MODE_CREATE && mode !== ITEM_FORM_MODE_CREATE_PARENT_DISABLED}
                title={form.getFieldValue("id")}
              />
            )}
          </Form.Item>
        </Col>
        <Col
          span={SPAN_ONE_THIRD}
        >
          <Form.Item
            label={t("data.item.parent.label")}
            {...formItemLayout}
          >
            {form.getFieldDecorator("parent", {normalize: normalizeId})(
              <Selector
                disabled={
                  mode === ITEM_FORM_MODE_CREATE_PARENT_DISABLED ||
                  mode === ITEM_FORM_MODE_EDIT_PARENT_DISABLED ||
                  mode === ITEM_FORM_MODE_READ
                }
                selectTitle={t('components.itemForm.selector.buttons.select.title')}
                resetTitle={t('components.itemForm.selector.buttons.reset.title')}
                onSelect={itemsParentListShow}
                onReset={itemsParentListUnset}
                onDetail={null}
              />
            )}
          </Form.Item>
        </Col>
        <Col span={SPAN_ONE_THIRD}>
          <Form.Item
            label={t("data.item.order.label")}
            {...formItemLayout}
          >
            {form.getFieldDecorator("order", {normalize: normalizeOrder})(
              <MultilanguageInput
                disabled={mode === ITEM_FORM_MODE_READ}
                title={form.getFieldValue("order")}
              />
            )}
          </Form.Item>
        </Col>
      </Row>
      <Card type="inner">
        <Row type="flex" style={{marginBottom: MARGIN_MD}}>
          <Col span={SPAN_FULL}>
            <Form.Item
              className={"form-item-required"}
              label={t("data.item.name.label")}
              labelCol={{span: 3}}
              wrapperCol={{span: 21}}
            >
              {form.getFieldDecorator("name")(
                <MultilanguageInput
                  disabled={mode === ITEM_FORM_MODE_READ}
                  title={form.getFieldValue("name")}/>
              )}
            </Form.Item>
          </Col>
        </Row>
        <Row type="flex" style={{marginBottom: MARGIN_MD}}>
          <Col span={SPAN_FULL}>
            <Form.Item
              label={t("data.item.description.label")}
              labelCol={{span: 3}}
              wrapperCol={{span: 21}}
            >
              {form.getFieldDecorator("description")(
                <MultilanguageZoomableTextArea
                  disabled={mode === ITEM_FORM_MODE_READ}
                  title={form.getFieldValue("description")}/>
              )}
            </Form.Item>
          </Col>
        </Row>
        <Row type="flex">
          <Col span={SPAN_FULL}>
            <Form.Item
              label={t("data.item.layoutAnnotationFullName.label")}
              labelCol={{span: 3}}
              wrapperCol={{span: 21}}
            >
              {form.getFieldDecorator("layoutAnnotationFullName")(
                <MultilanguageZoomableTextArea
                  disabled={mode === ITEM_FORM_MODE_READ}
                  title={form.getFieldValue("layoutAnnotationFullName")}/>
              )}
            </Form.Item>
          </Col>
        </Row>
      </Card>
    </Form>
    <AnnotationsForm
      annotations={item ? item.annotations : null}
      onChange={onChange}
      disabled={mode === ITEM_FORM_MODE_READ}
    />
  </Fragment>;

export default compose(
  translate(),
  Form.create({mapPropsToFields, onFieldsChange})
)(ItemForm);
