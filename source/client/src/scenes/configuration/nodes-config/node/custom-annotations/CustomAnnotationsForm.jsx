import React, {Fragment} from 'react';
import {translate} from 'react-i18next';
import FormList from "../../../../../components/form-list";
import {Checkbox, Col, Form, Row} from 'antd';
import CustomAnnotationForm from "./CustomAnnotationForm";
import {compose} from "redux";
import _ from "lodash";
import {GUTTER_MD} from "../../../../../styles/constants";

const mapPropsToFields = ({AnnotationTabs}) => ({
  IsTextCollapsed: Form.createFormField({value: AnnotationTabs ? AnnotationTabs.IsTextCollapsed : null})
});

const onFieldsChange = (props, fields) =>
  props.onChange(_.mapValues(fields, ({value}) => value));

const CustomAnnotationsForm = ({
                              t,
                              form,
                              AnnotationTabs,
                              onChange
                            }) =>
  <Fragment>
    <Row type="flex" justify="start" align="middle" gutter={GUTTER_MD} style={{marginBottom: 0}}>
      <Col style={{color: 'rgba(0, 0, 0, 0.85)'}}>
        {t("data.nodesConfig.annotationTabs.isTextCollapsed.label") + ' :'}
      </Col>
      <Col>
        <Form.Item>
          {form.getFieldDecorator("IsTextCollapsed", {valuePropName: 'checked'})(
            <Checkbox/>
          )}
        </Form.Item>
      </Col>
    </Row>
    <Form.Item
      label={t('data.nodesConfig.annotationTabs.annotationTabs.label')}
    >
      <FormList
        addItemLabel={t('scenes.configuration.nodesConfig.annotationTabs.annotationTabs.addButton.title')}
        removeItemLabel={t('scenes.configuration.nodesConfig.annotationTabs.annotationTabs.removeButton.title')}
        values={AnnotationTabs.Tabs || []}
        Component={CustomAnnotationForm}
        newItem={{
          Name: null,
          Annotations: [
            {
              Name: null,
              IsVisible: true
            }
          ],
          IsVisible: true
        }}
        onChange={tabs => onChange({Tabs: tabs})}
      />
    </Form.Item>
  </Fragment>;

export default compose(
  translate(),
  Form.create({mapPropsToFields, onFieldsChange})
)(CustomAnnotationsForm);

