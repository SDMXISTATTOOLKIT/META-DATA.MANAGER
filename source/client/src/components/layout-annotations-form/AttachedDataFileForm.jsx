import React from 'react';
import {compose} from 'redux';
import {translate} from 'react-i18next';
import {Form, Input} from 'antd';
import _ from "lodash";
import ZoomableTextArea from "../zoomable-textarea";

const mapPropsToFields = ({value}) => ({
  url: Form.createFormField({value: value !== null ? value.url : null}),
  format: Form.createFormField({value: value !== null ? value.format : null}),
});

const onFieldsChange = (props, fields) => props.onChange(_.mapValues(fields, ({value}) => value));

const AttachedDataFileForm = ({
                                t,
                                disabled,
                                form
                              }) =>
  <Form layout={"inline"}>
    <Form.Item
      label={t("components.layoutAnnotationsForm.generalParameters.attachedDataFileForm.url")}
      style={{marginBottom: 0}}
    >
      {form.getFieldDecorator("url")(
        <ZoomableTextArea
          disabled={disabled}
          placeholder={t('components.urlInput.placeholder.title')}
          singleLine
          multilanguage={false}
          title={form.getFieldValue("url")}
        />
      )}

    </Form.Item>
    <Form.Item
      label={t("components.layoutAnnotationsForm.generalParameters.attachedDataFileForm.format")}
      style={{marginBottom: 0}}
    >
      {form.getFieldDecorator("format")(<Input disabled={disabled} title={form.getFieldValue("format")}/>)}
    </Form.Item>
  </Form>;

export default compose(
  translate(),
  Form.create({mapPropsToFields, onFieldsChange})
)(AttachedDataFileForm);
