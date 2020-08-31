import React from 'react';
import {compose} from 'redux';
import {connect} from "react-redux";
import {translate} from 'react-i18next';
import {Form, Input} from 'antd';
import _ from "lodash";
import {changeAppConfigEndpointSettingsForm} from "./actions";
import {normalizeInt} from "../../../utils/normalizers";

const mapStateToProps = state => ({
  EndpointSetting: state.scenes.configuration.appConfig.config.EndpointSetting
});

const mapDispatchToProps = dispatch => ({
  onChange: fields => dispatch(changeAppConfigEndpointSettingsForm(fields))
});

const mapPropsToFields = ({EndpointSetting}) => ({
  NsiTimeOut: Form.createFormField({value: EndpointSetting !== null ? EndpointSetting.NsiTimeOut : null}),
  DmTimeOut: Form.createFormField({value: EndpointSetting !== null ? EndpointSetting.DmTimeOut : null}),
  MaTimeOut: Form.createFormField({value: EndpointSetting !== null ? EndpointSetting.MaTimeOut : null})
});

const onFieldsChange = (props, fields) => props.onChange(_.mapValues(fields, ({value}) => value));

const EndpointSettingsForm = ({
                                t,
                                form
                              }) =>
  <Form>
    <Form.Item
      label={t("data.appConfig.endpointSettingsForm.nsiTimeOut.label")}
      className="form-item-required"
      style={{marginBottom: 0}}
    >
      {form.getFieldDecorator("NsiTimeOut", {normalize: normalizeInt})(
        <Input
          title={form.getFieldValue("NsiTimeOut")}
        />
      )}
    </Form.Item>
    <Form.Item
      label={t("data.appConfig.endpointSettingsForm.dmTimeOut.label")}
      className="form-item-required"
      style={{marginBottom: 0}}
    >
      {form.getFieldDecorator("DmTimeOut", {normalize: normalizeInt})(
        <Input
          title={form.getFieldValue("DmTimeOut")}
        />
      )}
    </Form.Item>
    <Form.Item
      label={t("data.appConfig.endpointSettingsForm.maTimeOut.label")}
      className="form-item-required"
      style={{marginBottom: 0}}
    >
      {form.getFieldDecorator("MaTimeOut", {normalize: normalizeInt})(
        <Input
          title={form.getFieldValue("MaTimeOut")}
        />
      )}
    </Form.Item>
  </Form>;

export default compose(
  translate(),
  connect(mapStateToProps, mapDispatchToProps),
  Form.create({mapPropsToFields, onFieldsChange})
)(EndpointSettingsForm);
