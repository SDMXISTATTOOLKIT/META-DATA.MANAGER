import React from 'react';
import {compose} from 'redux';
import {translate} from 'react-i18next';
import {Form, Icon, Input, Tooltip} from 'antd';
import _ from "lodash";

const mapPropsToFields = ({value}) => ({
  Code: Form.createFormField({value: value !== null ? value.Code : null}),
  Flag: Form.createFormField({value: value !== null ? value.Flag : null}),
});

const onFieldsChange = (props, fields) => props.onChange(_.mapValues(fields, ({value}) => value));

const LanguageForm = ({
                        t,
                        form
                      }) =>
  <Form layout={"inline"}>
    <Form.Item
      label={t("scenes.configuration.appConfig.languageForm.code")}
      className="form-item-required"
      style={{marginBottom: 0}}
    >
      {form.getFieldDecorator("Code")(<Input title={form.getFieldValue("Code")}/>)}
    </Form.Item>
    <Form.Item
      label={t("scenes.configuration.appConfig.languageForm.flag")}
      className="form-item-required"
      style={{marginBottom: 0}}
    >
      {form.getFieldDecorator("Flag")(
        <Input
          title={form.getFieldValue("Flag")}
          suffix={
            <Tooltip
              title={
                <a target="_blank" href="https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2" rel="noopener noreferrer">
                  <u>https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2</u>
                </a>
              }
            >
              <Icon type="info-circle"/>
            </Tooltip>}

        />
      )}
    </Form.Item>
  </Form>;

export default compose(
  translate(),
  Form.create({mapPropsToFields, onFieldsChange})
)(LanguageForm);
