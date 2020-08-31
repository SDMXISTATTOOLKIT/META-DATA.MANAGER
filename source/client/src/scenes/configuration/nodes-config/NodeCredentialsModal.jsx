import React from 'react';
import {Button, Col, Form, Input, Row} from 'antd';
import {GUTTER_MD, MARGIN_LG, MARGIN_MD, SPAN_ONE_THIRD, SPAN_TWO_THIRDS} from "../../../styles/constants";

const formItemLayout = {
  labelCol: {span: SPAN_ONE_THIRD},
  wrapperCol: {span: SPAN_TWO_THIRDS}
};

const NodeCredentialsModal = ({t, form, modal, onSubmit}) =>
  <Form>
    <Row style={{marginBottom: MARGIN_MD, marginTop: MARGIN_MD}}>
      <Col>
        <Form.Item label={t('data.user.username.label')} {...formItemLayout} className="form-item-required">
          {form.getFieldDecorator('username')(<Input autoComplete="username"/>)}
        </Form.Item>
      </Col>
    </Row>
    <Row style={{marginBottom: MARGIN_LG}}>
      <Col>
        <Form.Item label={t('data.user.password.label')} {...formItemLayout} className="form-item-required">
          {form.getFieldDecorator('password')(<Input type="password" autoComplete="current-password"/>)}
        </Form.Item>
      </Col>
    </Row>
    <Row type="flex" justify="end" gutter={GUTTER_MD}>
      <Col>
        <Button onClick={() => {
          modal.destroy()
        }}>
          {t('scenes.configuration.nodesConfig.nodeCredentialsModal.cancel.title')}
        </Button>
      </Col>
      <Col>
        <Button
          type="primary"
          icon="save"
          disabled={
            !form.getFieldValue('username') || form.getFieldValue('username').length < 1
          }
          onClick={
            () => {
              modal.destroy();
              onSubmit(form.getFieldValue('username'), form.getFieldValue('password'))
            }
          }
          htmlType="submit"
        >
          {t('scenes.configuration.nodesConfig.nodeCredentialsModal.submit.title')}
        </Button>
      </Col>
    </Row>
  </Form>;

export default Form.create()(NodeCredentialsModal);
