import React from 'react';
import {Button, Checkbox, Col, Form, Input, Row} from 'antd';
import {GUTTER_MD, MARGIN_MD, SPAN_FULL, SPAN_HALF} from '../../../../../styles/constants';
import {compose} from 'redux';
import {translate} from 'react-i18next';
import connect from 'react-redux/es/connect/connect';
import FileInput from '../../../../../components/file-input';
import {changeFileMappingWizardCsvForm, submitFileMappingWizardCsvForm} from './actions';
import {showFileMappingWizardCsvRowList} from "../csv-row-list/actions";

const mapStateToProps = state => ({
  csvForm: state.scenes.dataManager.fileMapping.components.wizard.shared.csvForm,
  csvHeader: state.scenes.dataManager.fileMapping.components.wizard.shared.csvHeader
});

const mapDispatchToProps = dispatch => ({
  onChange: fields => dispatch(changeFileMappingWizardCsvForm(fields)),
  onSubmit: file => dispatch(submitFileMappingWizardCsvForm(file)),
  onCsvRowListShow: () => dispatch(showFileMappingWizardCsvRowList()),
});

const mapPropsToFields = ({csvForm}) => ({
  file: Form.createFormField({value: csvForm.file}),
  separator: Form.createFormField({value: csvForm.separator}),
  delimiter: Form.createFormField({value: csvForm.delimiter}),
  hasHeader: Form.createFormField({value: csvForm.hasHeader}),
  hasDotStatFormat: Form.createFormField({value: csvForm.hasDotStatFormat})
});

// TODO: prevent multiple changes relative to same value
const onFieldsChange = (props, fields) => props.onChange(fields);

const FileMappingWizardCsvForm = ({
                                    t,
                                    form,
                                    csvForm,
                                    csvHeader,
                                    onSubmit,
                                    onCsvRowListShow
                                  }) =>
  <Form className="advanced-form">
    <Row style={{marginBottom: MARGIN_MD}} gutter={GUTTER_MD}>
      <Col span={SPAN_FULL}>
        <Form.Item className="form-item-required" label={t('data.csv.file.label')}>
          {form.getFieldDecorator('file')(<FileInput accept={".csv"}/>)}
        </Form.Item>
      </Col>
    </Row>
    <Row style={{marginBottom: MARGIN_MD}} gutter={GUTTER_MD}>
      <Col span={SPAN_HALF}>
        <Form.Item className="form-item-required" label={t('data.csv.separator.label')}>
          {form.getFieldDecorator('separator')(<Input maxLength={1}/>)}
        </Form.Item>
      </Col>
      <Col span={SPAN_HALF}>
        <Form.Item label={t('data.csv.delimiter.label')}>
          {form.getFieldDecorator('delimiter')(<Input maxLength={1}/>)}
        </Form.Item>
      </Col>
    </Row>
    <Row style={{marginBottom: MARGIN_MD}} gutter={GUTTER_MD}>
      <Col span={SPAN_HALF}>
        <Form.Item className="form-item-required" label={t('data.csv.hasHeader.label')}>
          {form.getFieldDecorator('hasHeader', {valuePropName: 'checked'})(<Checkbox/>)}
        </Form.Item>
      </Col>
      <Col span={SPAN_HALF}>
        <Form.Item className="form-item-required" label={t('data.csv.hasDotStatFormat.label')}>
          {form.getFieldDecorator('hasDotStatFormat', {valuePropName: 'checked'})(<Checkbox/>)}
        </Form.Item>
      </Col>
    </Row>
    <Row type="flex" gutter={GUTTER_MD}>
      <Col>
        <Button
          disabled={csvForm.file === null || csvForm.separator === null || csvForm.separator.length !== 1}
          icon="upload"
          type="primary"
          onClick={() => onSubmit(csvForm.file)}
        >
          {t('data.csv.uploadButton.label')}
        </Button>
      </Col>
      <Col>
        <Button
          onClick={onCsvRowListShow}
          icon="table"
          disabled={csvHeader === null}
          style={{width: '100%'}}>
          {t('scenes.dataManager.fileMapping.wizard.csvForm.buttons.csvRowListShow')}
        </Button>
      </Col>
    </Row>
  </Form>;

export default compose(
  translate(),
  connect(mapStateToProps, mapDispatchToProps),
  Form.create({mapPropsToFields, onFieldsChange})
)(FileMappingWizardCsvForm);
