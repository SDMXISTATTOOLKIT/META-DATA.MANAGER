import React from 'react';
import {compose} from 'redux';
import {translate} from 'react-i18next';
import {Form, Input} from 'antd';
import _ from "lodash";
import {normalizeId} from "../../../../utils/normalizers";
import MultilanguageInput from "../../../../components/multilanguage-input";

const mapPropsToFields = ({value}) => ({
  Id: Form.createFormField({value: value !== null ? value.Id : null}),
  Name: Form.createFormField({value: value !== null ? value.Name : null}),
});

const onFieldsChange = (props, fields) => props.onChange(_.mapValues(fields, ({value}) => value));

const AgencyForm = ({
                      t,
                      form
                    }) =>
  <Form layout={"inline"}>
    <Form.Item
      label={t("scenes.configuration.nodesConfig.agencyForm.id")}
      className="form-item-required"
      style={{marginBottom: 0}}
    >
      {form.getFieldDecorator("Id", {normalize: normalizeId})(
        <Input title={form.getFieldValue("Id")}/>
      )}
    </Form.Item>
    <Form.Item
      label={t("scenes.configuration.nodesConfig.agencyForm.name")}
      className="form-item-required"
      style={{marginBottom: 0}}
    >
      {form.getFieldDecorator("Name")(
        <MultilanguageInput title={form.getFieldValue("Name")}/>
      )}
    </Form.Item>
  </Form>;

export default compose(
  translate(),
  Form.create({mapPropsToFields, onFieldsChange})
)(AgencyForm);
