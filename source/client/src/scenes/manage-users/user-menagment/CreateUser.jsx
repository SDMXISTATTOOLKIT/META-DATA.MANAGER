import React from 'react';
import {Button, Col, Form, Input, Row} from 'antd';
import {GUTTER_MD, MARGIN_LG, MARGIN_MD, SPAN_ONE_THIRD, SPAN_TWO_THIRDS} from "../../../styles/constants";

const formItemLayout = {
  labelCol: {span: SPAN_ONE_THIRD},
  wrapperCol: {span: SPAN_TWO_THIRDS}
};

const UserManagementCreateUser = ({
                                    t,
                                    form,
                                    modal,
                                    onSubmit
                                  }) =>
  <Form>
    <Row style={{marginBottom: MARGIN_MD, marginTop: MARGIN_MD}}>
      <Col>
        <Form.Item
          className="form-item-required"
          label={t('data.user.username.label')}
          {...formItemLayout}
        >
          {form.getFieldDecorator('username')(<Input autoComplete="suppress"/>)}
        </Form.Item>
      </Col>
    </Row>
    <Row style={{marginBottom: MARGIN_LG}}>
      <Col>
        <Form.Item
          className="form-item-required"
          label={t('data.user.password.label')}
          hasFeedback
          validateStatus={(
            form.getFieldValue('confirmPassword') &&
            form.getFieldValue('confirmPassword').length > 0 &&
            form.getFieldValue('password') !== form.getFieldValue('confirmPassword')
          )
            ? "warning"
            : null
          }
          help={(
            form.getFieldValue('confirmPassword') &&
            form.getFieldValue('confirmPassword').length > 0 &&
            form.getFieldValue('password') !== form.getFieldValue('confirmPassword')
          )
            ? t("commons.helps.passwordsNotEqual.label")
            : null
          }
          {...formItemLayout}
        >
          {form.getFieldDecorator('password')(<Input type="password" autoComplete="suppress"/>)}
        </Form.Item>
      </Col>
    </Row>
    <Row style={{marginBottom: MARGIN_LG}}>
      <Col>
        <Form.Item
          className="form-item-required"
          label={t('data.user.confirmPassword.label')}
          {...formItemLayout}
        >
          {form.getFieldDecorator('confirmPassword')(<Input type="password" autoComplete="suppress"/>)}
        </Form.Item>
      </Col>
    </Row>
    <Row style={{marginBottom: MARGIN_LG}}>
      <Col>
        <Form.Item
          className="form-item-required"
          label={t('data.user.email.label')}
          {...formItemLayout}
        >
          {form.getFieldDecorator('email')(<Input autoComplete="suppress"/>)}
        </Form.Item>
      </Col>
    </Row>
    <Row type="flex" justify="end" gutter={GUTTER_MD}>
      <Col>
        <Button onClick={() => {
          modal.destroy()
        }}>
          {t('commons.buttons.cancel.title')}
        </Button>
      </Col>
      <Col>
        <Button
          type="primary"
          icon="save"
          disabled={
            !form.getFieldValue('username') || form.getFieldValue('username').length < 1 ||
            form.getFieldValue('password') !== form.getFieldValue('confirmPassword') ||
            !form.getFieldValue('email') || form.getFieldValue('email').length < 1
          }
          onClick={
            () => {
              modal.destroy();
              onSubmit(form.getFieldValue('username'), form.getFieldValue('password'), form.getFieldValue('email'));
            }
          }
        >
          {t('commons.buttons.save.title')}
        </Button>
      </Col>
    </Row>
  </Form>;

export default Form.create()(UserManagementCreateUser);
