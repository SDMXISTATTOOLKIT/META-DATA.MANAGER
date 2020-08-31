import React, {Fragment} from 'react';
import {translate} from 'react-i18next';
import {connect} from "react-redux";
import {compose} from "redux";
import {changeUserManagementUser} from "./actions";
import {Checkbox, Col, Form, Input, Row} from "antd";
import _ from "lodash";
import {GUTTER_MD, MARGIN_MD, SPAN_ONE_THIRD, SPAN_TWO_THIRDS,} from "../../../styles/constants";

const mapStateToProps = state => ({
  user: state.scenes.manageUsers.userManagement.user,
  editPassword: state.scenes.manageUsers.userManagement.editPassword
});

const mapDispatchToProps = dispatch => ({
  onChange: fields => dispatch(changeUserManagementUser(fields))
});

const mapPropsToFields = ({user}) => ({
  username: Form.createFormField({value: user ? user.username : null}),
  password: Form.createFormField({value: user ? user.password : null}),
  confirmPassword: Form.createFormField({value: user ? user.confirmPassword : null}),
  email: Form.createFormField({value: user ? user.email : null})
});

const onFieldsChange = (props, fields) =>
  props.onChange(_.mapValues(fields, ({value}) => value));

const formItemLayout = {
  labelCol: {span: SPAN_ONE_THIRD},
  wrapperCol: {span: SPAN_TWO_THIRDS}
};

const UserManagementEditUser = ({
                                  t,
                                  form,
                                  user,
                                  editPassword,
                                  onChange
                                }) =>
  <Form>
    <Row gutter={GUTTER_MD} style={{marginBottom: MARGIN_MD}}>
      <Col>
        <Form.Item
          label={t('data.user.username.label')}
          className="form-item-required"
          {...formItemLayout}
        >
          {form.getFieldDecorator('username')(<Input disabled autoComplete="suppress"/>)}
        </Form.Item>
      </Col>
    </Row>
    <Row gutter={GUTTER_MD} style={{marginBottom: MARGIN_MD}} className="form-item-required">
      <Col>
        <Form.Item
          label={t('data.user.email.label')}
          className="form-item-required"
          {...formItemLayout}
        >
          {form.getFieldDecorator('email')(<Input autoComplete="suppress"/>)}
        </Form.Item>
      </Col>
    </Row>
    <Row gutter={GUTTER_MD} style={{marginBottom: MARGIN_MD}} className="form-item-required">
      <Col>
        <Form.Item
          label={t('data.user.editPassword.label')}
          {...formItemLayout}
        >
          <Checkbox
            checked={editPassword}
            onClick={e => onChange({editPassword: e.target.checked})}
          />
        </Form.Item>
      </Col>
    </Row>
    {
      editPassword && (
        <Fragment>
          <Row gutter={GUTTER_MD} style={{marginBottom: MARGIN_MD}}>
            <Col>
              <Form.Item
                label={t('data.user.password.label')}
                className="form-item-required"
                {...formItemLayout}
              >
                {form.getFieldDecorator('password')(<Input type="password" autoComplete="suppress"/>)}
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={GUTTER_MD} style={{marginBottom: MARGIN_MD}}>
            <Col>
              <Form.Item
                label={t('data.user.confirmPassword.label')}
                className="form-item-required"
                hasFeedback
                validateStatus={
                  (user && user.confirmPassword && user.confirmPassword.length > 0 && user.password !== user.confirmPassword)
                    ? "warning"
                    : null
                }
                help={
                  (user && user.confirmPassword && user.confirmPassword.length > 0 && user.password !== user.confirmPassword)
                    ? t("commons.helps.passwordsNotEqual.label")
                    : null
                }
                {...formItemLayout}
              >
                {form.getFieldDecorator('confirmPassword')(<Input type="password" autoComplete="suppress"/>)}
              </Form.Item>
            </Col>
          </Row>
        </Fragment>
      )
    }
  </Form>;

export default compose(
  translate(),
  connect(mapStateToProps, mapDispatchToProps),
  Form.create({mapPropsToFields, onFieldsChange})
)(UserManagementEditUser);
