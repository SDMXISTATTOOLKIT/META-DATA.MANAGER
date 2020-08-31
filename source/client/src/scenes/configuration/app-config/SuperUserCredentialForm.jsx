import React from 'react';
import {compose} from 'redux';
import {translate} from 'react-i18next';
import {Form, Input} from 'antd';
import _ from "lodash";

const mapPropsToFields = ({value: SuperUserCredential}) => ({
  username: Form.createFormField({value: SuperUserCredential !== null ? SuperUserCredential.username : null}),
  password: Form.createFormField({value: SuperUserCredential !== null ? SuperUserCredential.password : null}),
  confirmPassword: Form.createFormField({value: SuperUserCredential !== null ? SuperUserCredential.confirmPassword : null}),
});

const onFieldsChange = (props, fields) => props.onChange(_.mapValues(fields, ({value}) => value));

const SuperUserCredentialForm = ({
                                   t,
                                   form,
                                   value: SuperUserCredential
                                 }) =>
  <Form>
    <Form.Item
      label={t("data.appConfig.superUserCredentials.superUserCredentials.username.label")}
      className="form-item-required"
      style={{marginBottom: 0}}
    >
      {form.getFieldDecorator("username")(
        <Input
          title={form.getFieldValue("username")}
          autoComplete="new-password"
        />
      )}
    </Form.Item>
    <Form.Item
      label={t("data.appConfig.superUserCredentials.superUserCredentials.password.label")}
      style={{marginBottom: 0}}
    >
      {form.getFieldDecorator("password")(
        <Input
          title={form.getFieldValue("password")}
          type={"password"}
          autoComplete="new-password"
        />
      )}
    </Form.Item>
    <Form.Item
      label={t("data.appConfig.superUserCredentials.superUserCredentials.confirmPassword.label")}
      style={{marginBottom: 0}}
      hasFeedback
      validateStatus={(
        SuperUserCredential &&
        SuperUserCredential.confirmPassword &&
        SuperUserCredential.confirmPassword.length > 0 &&
        SuperUserCredential.password !== SuperUserCredential.confirmPassword
      )
        ? "warning"
        : null
      }
      help={(
        SuperUserCredential &&
        SuperUserCredential.confirmPassword &&
        SuperUserCredential.confirmPassword.length > 0 &&
        SuperUserCredential.password !== SuperUserCredential.confirmPassword
      )
        ? t("commons.helps.passwordsNotEqual.label")
        : null
      }
    >
      {form.getFieldDecorator("confirmPassword")(
        <Input
          title={form.getFieldValue("confirmPassword")}
          type={"password"}
          autoComplete="new-password"
        />
      )}
    </Form.Item>
  </Form>;

export default compose(
  translate(),
  Form.create({mapPropsToFields, onFieldsChange})
)(SuperUserCredentialForm);
