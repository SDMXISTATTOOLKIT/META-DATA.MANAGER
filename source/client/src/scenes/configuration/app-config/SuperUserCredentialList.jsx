import React from 'react';
import {compose} from 'redux';
import {connect} from "react-redux";
import {translate} from 'react-i18next';
import {changeAppConfigSuperUserCredentialsForm} from "./actions";
import FormList from "../../../components/form-list";
import SuperuserCredentialForm from "./SuperUserCredentialForm";
import {Form} from "antd";

const mapStateToProps = state => ({
  SuperUserCredentials: state.scenes.configuration.appConfig.config.SuperUserCredentials
});

const mapDispatchToProps = dispatch => ({
  onChange: fields => dispatch(changeAppConfigSuperUserCredentialsForm(fields))
});

const SuperUserCredentialList = ({
                                   t,
                                   SuperUserCredentials,
                                   onChange
                                 }) =>
  <Form.Item
    className="form-item-required"
    label={t("data.appConfig.superUserCredentials.superUserCredentials.label")}
  >
    <FormList
      values={SuperUserCredentials}
      Component={SuperuserCredentialForm}
      newItem={{
        username: null,
        password: null,
        confirmPassword: null
      }}
      minItems={1}
      addItemLabel={t("data.appConfig.superUserCredentials.superUserCredentials.buttons.add.label")}
      removeItemLabel={t("data.appConfig.superUserCredentials.superUserCredentials.buttons.remove.label")}
      onChange={onChange}
    />
  </Form.Item>;

export default compose(
  translate(),
  connect(mapStateToProps, mapDispatchToProps)
)(SuperUserCredentialList);
