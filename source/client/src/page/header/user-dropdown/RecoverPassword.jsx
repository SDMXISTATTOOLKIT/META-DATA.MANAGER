import React from 'react';
import {Button, Col, Form, Input, Row} from 'antd';
import {GUTTER_MD, MARGIN_LG, MARGIN_MD, SPAN_ONE_THIRD, SPAN_TWO_THIRDS} from "../../../styles/constants";

const formItemLayout = {
  labelCol: {span: SPAN_ONE_THIRD},
  wrapperCol: {span: SPAN_TWO_THIRDS}
};

const UserDropdownRecoverPassword = ({t, form, modal, onSubmit}) =>
  <Form>
    <Row style={{marginBottom: MARGIN_MD, marginTop: MARGIN_MD}}>
      <Col>
        <Form.Item className="form-item-required" label={t('data.user.username.label')} {...formItemLayout}>
          {form.getFieldDecorator('username')(<Input/>)}
        </Form.Item>
      </Col>
    </Row>
    <Row style={{marginBottom: MARGIN_LG}}>
      <Col>
        <Form.Item className="form-item-required" label={t('data.user.email.label')} {...formItemLayout}>
          {form.getFieldDecorator('email')(<Input/>)}
        </Form.Item>
      </Col>
    </Row>
    <Row type="flex" justify="end" gutter={GUTTER_MD}>
      <Col>
        <Button onClick={() => {
          modal.destroy()
        }}>
          {t('page.header.userDropdown.recoverPassword.buttons.cancel')}
        </Button>
      </Col>
      <Col>
        <Button
          type="primary"
          icon="mail"
          disabled={
            !form.getFieldValue('username') || form.getFieldValue('username').length < 1 ||
            !form.getFieldValue('email') || form.getFieldValue('email').length < 1
          }
          onClick={
            () => {
              modal.destroy();
              onSubmit(form.getFieldValue('username'), form.getFieldValue('email'));
            }
          }
          htmlType="submit"
        >
          {t('page.header.userDropdown.recoverPassword.buttons.submit')}
        </Button>
      </Col>
    </Row>
  </Form>;

export default Form.create()(UserDropdownRecoverPassword);
