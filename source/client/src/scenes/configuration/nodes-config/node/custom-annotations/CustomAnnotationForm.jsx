import {Checkbox, Col, Form, Input, Row} from "antd";
import React, {Fragment} from 'react';
import {compose} from "redux";
import {translate} from 'react-i18next';
import _ from "lodash";
import FormList from "../../../../../components/form-list";
import AnnotationForm from "./AnnotationForm";
import {GUTTER_MD} from "../../../../../styles/constants";
import MultilanguageInput from "../../../../../components/multilanguage-input";

const mapPropsToFields = ({value: AnnotationTab}) => ({
  Name: Form.createFormField({value: AnnotationTab ? AnnotationTab.Name : null}),
  Label: Form.createFormField({value: AnnotationTab ? AnnotationTab.Label : null}),
  IsVisible: Form.createFormField({value: AnnotationTab ? AnnotationTab.IsVisible : null})
});

const onFieldsChange = (props, fields) =>
  props.onChange(_.mapValues(fields, ({value}) => value));

const CustomAnnotationForm = ({
                             t,
                             form,
                             value: AnnotationTab,
                             onChange
                           }) =>
  <Fragment>
    <Form>
      <Form.Item
        className="form-item-required"
        label={t('data.nodesConfig.annotationTabs.annotationTabs.annotationTab.name.label')}
      >
        {form.getFieldDecorator('Name')(<Input/>)}
      </Form.Item>
      <Form.Item
        label={t('data.nodesConfig.annotationTabs.annotationTabs.annotationTab.label.label')}
      >
        {form.getFieldDecorator('Label')(<MultilanguageInput/>)}
      </Form.Item>
      <Row type="flex" justify="start" align="middle" gutter={GUTTER_MD} style={{marginBottom: 0}}>
        <Col style={{color: 'rgba(0, 0, 0, 0.85)'}}>
          {t("data.nodesConfig.annotationTabs.annotationTabs.annotationTab.isVisible.label") + ' :'}
        </Col>
        <Col>
          <Form.Item>
            {form.getFieldDecorator("IsVisible", {valuePropName: 'checked'})(
              <Checkbox/>
            )}
          </Form.Item>
        </Col>
      </Row>
    </Form>
    <Form.Item
      className="form-item-required"
      label={t('data.nodesConfig.annotationTabs.annotationTabs.annotationTab.annotations.label')}
    >
      <FormList
        compact
        values={AnnotationTab.Annotations || []}
        minItems={1}
        Component={AnnotationForm}
        newItem={{
          Name: null,
          IsVisible: true
        }}
        addItemLabel={t('scenes.configuration.nodesConfig.annotationTabs.annotationTabs.annotationTab.annotations.addButton.title')}
        removeItemLabel={t('scenes.configuration.nodesConfig.annotationTabs.annotationTabs.annotationTab.annotations.removeButton.title')}
        onChange={arr => onChange({Annotations: arr})}
      />
    </Form.Item>
  </Fragment>;

export default compose(
  translate(),
  Form.create({mapPropsToFields, onFieldsChange})
)(CustomAnnotationForm);
