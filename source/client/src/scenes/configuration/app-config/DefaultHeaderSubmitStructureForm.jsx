import React from 'react';
import {compose} from 'redux';
import {connect} from "react-redux";
import {translate} from 'react-i18next';
import {Checkbox, Col, Form, Input, Row} from 'antd';
import _ from "lodash";
import {changeAppConfigDefaultHeaderSubmitStructureForm} from "./actions";
import {GUTTER_MD} from "../../../styles/constants";

const mapStateToProps = state => ({
  DefaultHeaderSubmitStructure: state.scenes.configuration.appConfig.config.DefaultHeaderSubmitStructure
});

const mapDispatchToProps = dispatch => ({
  onChange: fields => dispatch(changeAppConfigDefaultHeaderSubmitStructureForm(fields))
});

const mapPropsToFields = ({DefaultHeaderSubmitStructure}) => ({
  ID: Form.createFormField({value: DefaultHeaderSubmitStructure !== null ? DefaultHeaderSubmitStructure.ID : null}),
  test: Form.createFormField({value: DefaultHeaderSubmitStructure !== null ? DefaultHeaderSubmitStructure.test : null}),
  prepared: Form.createFormField({value: DefaultHeaderSubmitStructure !== null ? DefaultHeaderSubmitStructure.prepared : null}),
  sender: Form.createFormField({value: DefaultHeaderSubmitStructure !== null ? DefaultHeaderSubmitStructure.sender : null}),
  receiver: Form.createFormField({value: DefaultHeaderSubmitStructure !== null ? DefaultHeaderSubmitStructure.receiver : null}),
});

const onFieldsChange = (props, fields) => props.onChange(_.mapValues(fields, ({value}) => value));

const DefaultHeaderSubmitStructureForm = ({
                                            t,
                                            form
                                          }) =>
  <Form>
    <Form.Item
      label={t("data.appConfig.defaultHeaderSubmitStructureForm.id.label")}
      className="form-item-required"
      style={{marginBottom: 0}}
    >
      {form.getFieldDecorator("ID")(
        <Input
          title={form.getFieldValue("ID")}
        />
      )}
    </Form.Item>
    <Row type="flex" justify="start" align="middle" gutter={GUTTER_MD} style={{marginBottom: 0}}>
      <Col style={{color: 'rgba(0, 0, 0, 0.85)'}}>
        {t("data.appConfig.defaultHeaderSubmitStructureForm.test.label") + ' :'}
      </Col>
      <Col>
        <Form.Item>
          {form.getFieldDecorator("test", {valuePropName: 'checked'})(
            <Checkbox/>
          )}
        </Form.Item>
      </Col>
    </Row>
    <Form.Item
      label={t("data.appConfig.defaultHeaderSubmitStructureForm.prepared.label")}
      className="form-item-required"
      style={{marginBottom: 0}}
    >
      {form.getFieldDecorator("prepared")(
        <Input
          title={form.getFieldValue("prepared")}
        />
      )}
    </Form.Item>
    <Form.Item
      label={t("data.appConfig.defaultHeaderSubmitStructureForm.sender.label")}
      className="form-item-required"
      style={{marginBottom: 0}}
    >
      {form.getFieldDecorator("sender")(
        <Input
          title={form.getFieldValue("sender")}
        />
      )}
    </Form.Item>
    <Form.Item
      label={t("data.appConfig.defaultHeaderSubmitStructureForm.receiver.label")}
      className="form-item-required"
      style={{marginBottom: 0}}
    >
      {form.getFieldDecorator("receiver")(
        <Input
          title={form.getFieldValue("receiver")}
        />
      )}
    </Form.Item>
  </Form>;

export default compose(
  translate(),
  connect(mapStateToProps, mapDispatchToProps),
  Form.create({mapPropsToFields, onFieldsChange})
)(DefaultHeaderSubmitStructureForm);
