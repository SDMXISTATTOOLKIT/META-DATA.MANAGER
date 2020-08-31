import React, {Fragment} from 'react';
import {compose} from 'redux';
import {translate} from 'react-i18next';
import {Button, Checkbox, Form, Input, Select} from 'antd';
import {GUTTER_MD, SPAN_HALF} from "../../styles/constants";
import _ from "lodash";
import {
  DOWNLOAD_FORMAT_TYPE_CSV,
  DOWNLOAD_FORMAT_TYPE_CSV_CUSTOM,
  DOWNLOAD_FORMAT_TYPE_STRUCTURE_SPECIFIC
} from "../../constants/download";
import {getLanguageFlagIconCss, getLanguageLabel} from "../../utils/languages";

const mapPropsToFields = ({downloadArtefactForm}) => ({
  format: Form.createFormField({value: downloadArtefactForm ? downloadArtefactForm.format : null}),
  references: Form.createFormField({value: downloadArtefactForm ? downloadArtefactForm.references : null}),
  compression: Form.createFormField({value: downloadArtefactForm ? downloadArtefactForm.compression : null}),
  csvSeparator: Form.createFormField({value: downloadArtefactForm ? downloadArtefactForm.csvSeparator : null}),
  csvDelimiter: Form.createFormField({value: downloadArtefactForm ? downloadArtefactForm.csvDelimiter : null}),
  csvLanguage: Form.createFormField({value: downloadArtefactForm ? downloadArtefactForm.csvLanguage : null}),
  dimension: Form.createFormField({value: downloadArtefactForm ? downloadArtefactForm.dimension : null})
});

const onFieldsChange = (props, fields) =>
  props.onChange(_.mapValues(fields, ({value}) => value));

const formItemLayout = {
  labelCol: {span: SPAN_HALF},
  wrapperCol: {span: SPAN_HALF}
};

const ArtefactDownloadForm = ({
                                t,
                                form,
                                langs,
                                hasReferences,
                                options,
                                queryFormRead,
                                queryFormShow,
                                queryPreviewShow,
                                isQuerySet,
                                isQueryPreviewShowDisabled,
                                dimensions
                              }) =>
  <Form>
    <Form.Item
      className="form-item-required"
      label={t('components.artefactDownloadForm.format.label')}
      {...formItemLayout}
    >
      {form.getFieldDecorator("format")(
        <Select
          showSearch
          filterOption={(inputValue, {props}) =>
            props.title.toLowerCase().includes(inputValue.toLowerCase())
          }
          title={form.getFieldValue("format")}
        >
          {
            options && options.map((option, index) =>
              <Select.Option key={index} value={option.key} title={option.label}>
                {option.label}
              </Select.Option>
            )
          }
        </Select>
      )}
    </Form.Item>
    {
      queryFormRead && form.getFieldValue("format") === DOWNLOAD_FORMAT_TYPE_CSV_CUSTOM && (
        <Form.Item
          className="form-item-required"
          label={t('components.artefactDownloadForm.query.label')}
          {...formItemLayout}
        >
          <div>
            {
              isQuerySet
                ? <Button
                  style={{width: 96}}
                  onClick={queryFormShow}
                >
                  {t('commons.buttons.edit.title')}
                </Button>
                : <Button
                  style={{width: 96}}
                  type={"primary"}
                  onClick={queryFormRead}
                >
                  {t('commons.buttons.set.title')}
                </Button>
            }
            <Button
              style={{width: 96, marginLeft: GUTTER_MD}}
              onClick={queryPreviewShow}
              disabled={isQueryPreviewShowDisabled}
            >
              {t('commons.buttons.preview.title')}
            </Button>
          </div>
        </Form.Item>
      )
    }
    {
      form.getFieldValue("format") === DOWNLOAD_FORMAT_TYPE_CSV && (
        <Form.Item
          className="form-item-required"
          label={t('data.commons.language.label')}
          {...formItemLayout}
        >
          {form.getFieldDecorator('csvLanguage')(
            <Select
              showSearch
              filterOption={(inputValue, {props}) =>
                props.title.toLowerCase().includes(inputValue.toLowerCase())
              }
              title={form.getFieldValue("csvLanguage")}
            >
              {langs.map(
                ({code}) =>
                  <Select.Option key={code} value={code} title={getLanguageLabel(t, code)}>
                    <i
                      className={`flag-icon ${getLanguageFlagIconCss(code, langs)}`}
                      style={{marginRight: 8}}
                    />
                    {getLanguageLabel(t, code)}
                  </Select.Option>
              )}
            </Select>
          )}
        </Form.Item>
      )
    }
    {
      (form.getFieldValue("format") === DOWNLOAD_FORMAT_TYPE_CSV ||
        form.getFieldValue("format") === DOWNLOAD_FORMAT_TYPE_CSV_CUSTOM) && (
        <Fragment>
          <Form.Item
            className="form-item-required"
            label={t('data.csv.separator.label')}
            {...formItemLayout}
          >
            {form.getFieldDecorator('csvSeparator')(
              <Input
                title={form.getFieldValue("csvSeparator")}
                maxLength={1}
                style={{width: 96}}
              />
            )}
          </Form.Item>
          <Form.Item
            label={t('data.csv.delimiter.label')}
            {...formItemLayout}
          >
            {form.getFieldDecorator('csvDelimiter')(
              <Input
                title={form.getFieldValue("csvDelimiter")}
                maxLength={1}
                style={{width: 96}}
              />
            )}
          </Form.Item>
        </Fragment>
      )
    }
    {
      form.getFieldValue("format") === DOWNLOAD_FORMAT_TYPE_STRUCTURE_SPECIFIC && dimensions && (
        <Form.Item
          label={t('components.artefactDownloadForm.dimension.label')}
          {...formItemLayout}
        >
          {form.getFieldDecorator("dimension")(
            <Select
              showSearch
              filterOption={(inputValue, {props}) =>
                props.title.toLowerCase().includes(inputValue.toLowerCase())
              }
              title={form.getFieldValue("dimension")}
            >
              <Select.Option value={null} title={t('components.artefactDownloadForm.dimension.noDimension.label')}>
                {t('components.artefactDownloadForm.dimension.noDimension.label')}
              </Select.Option>
              {
                dimensions && dimensions.map((dimension, index) =>
                  <Select.Option key={index} value={dimension} title={dimension}>
                    {dimension}
                  </Select.Option>
                )
              }
            </Select>
          )}
        </Form.Item>
      )
    }
    {
      hasReferences && (
        <Form.Item
          label={t('components.artefactDownloadForm.references.label')}
          {...formItemLayout}
        >
          {form.getFieldDecorator("references", {valuePropName: 'checked'})(
            <Checkbox
              title={form.getFieldValue("references")}
            />
          )}
        </Form.Item>
      )
    }
    <Form.Item
      label={t('components.artefactDownloadForm.compression.label')}
      {...formItemLayout}
    >
      {form.getFieldDecorator("compression", {valuePropName: 'checked'})(
        <Checkbox
          title={form.getFieldValue("compression")}
        />
      )}
    </Form.Item>
  </Form>;

export default compose(
  translate(),
  Form.create({mapPropsToFields, onFieldsChange})
)(ArtefactDownloadForm);