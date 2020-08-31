import React from 'react';
import {compose} from 'redux';
import {connect} from "react-redux";
import {translate} from 'react-i18next';
import {Form} from 'antd';
import {changeAppConfigAgenciesForm} from "./actions";
import AgencyForm from "./AgencyForm";
import FormList from "../../../components/form-list";

const mapStateToProps = state => ({
  Agencies: state.scenes.configuration.appConfig.config.Agencies
});

const mapDispatchToProps = dispatch => ({
  onChange: fields => dispatch(changeAppConfigAgenciesForm(fields))
});

const AgenciesForm = ({
                        t,
                        Agencies,
                        onChange
                      }) =>
  <Form.Item
    label={t("data.appConfig.agencies.agencies.label")}
  >
    <FormList
      compact
      values={Agencies}
      Component={AgencyForm}
      newItem={{
        Id: null,
        Name: null
      }}
      onChange={onChange}
      addItemLabel={t('data.appConfig.agencies.agencies.buttons.add.label')}
      removeItemLabel={t('data.appConfig.agencies.agencies.buttons.remove.label')}
    />
  </Form.Item>;

export default compose(
  translate(),
  connect(mapStateToProps, mapDispatchToProps)
)(AgenciesForm);
