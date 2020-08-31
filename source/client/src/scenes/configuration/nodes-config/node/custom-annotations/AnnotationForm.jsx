import {Checkbox, Form, Input} from "antd";
import React from 'react';
import {compose} from "redux";
import {translate} from 'react-i18next';
import _ from "lodash";
import MultilanguageInput from "../../../../../components/multilanguage-input";

const mapPropsToFields = ({value: Annotation}) => ({
  Name: Form.createFormField({value: Annotation ? Annotation.Name : null}),
  Label: Form.createFormField({value: Annotation ? Annotation.Label : null}),
  IsVisible: Form.createFormField({value: Annotation ? Annotation.IsVisible : false})
});

const onFieldsChange = (props, fields) =>
  props.onChange(_.mapValues(fields, ({value}) => value));

const AnnotationForm = ({
                          t,
                          form,
                        }) =>
  <Form layout={"inline"}>
    <Form.Item
      className="form-item-required"
      label={t('data.nodesConfig.annotationTabs.annotationTabs.annotationTab.annotations.annotation.name.label')}
    >
      {form.getFieldDecorator('Name')(<Input/>)}
    </Form.Item>
    <Form.Item
      label={t('data.nodesConfig.annotationTabs.annotationTabs.annotationTab.annotations.annotation.label.label')}
    >
      {form.getFieldDecorator('Label')(<MultilanguageInput/>)}
    </Form.Item>
    <Form.Item
      label={t('data.nodesConfig.annotationTabs.annotationTabs.annotationTab.annotations.annotation.isVisible.label')}
    >
      {form.getFieldDecorator('IsVisible', {valuePropName: 'checked'})(<Checkbox/>)}
    </Form.Item>
  </Form>;

export default compose(
  translate(),
  Form.create({mapPropsToFields, onFieldsChange})
)(AnnotationForm);
