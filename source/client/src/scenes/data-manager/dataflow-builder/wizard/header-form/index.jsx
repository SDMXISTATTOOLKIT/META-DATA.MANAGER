import {compose} from 'redux';
import React, {Fragment} from 'react';
import {translate} from 'react-i18next';
import {Card, Checkbox, Col, Form, Input, Row} from 'antd';
import {GUTTER_MD, MARGIN_MD, SPAN_HALF, SPAN_ONE_THIRD, SPAN_TWO_THIRDS} from '../../../../../styles/constants';
import {connect} from 'react-redux';
import {
  changeDataflowBuilderWizardHeaderForm,
  hideDataflowBuilderWizardHeaderForm,
  readDataflowBuilderWizardHeaderFormHeader,
  showDataflowBuilderWizardHeaderForm
} from './actions';
import Call from '../../../../../hocs/call';
import _ from 'lodash';
import {normalizeId} from "../../../../../utils/normalizers";

const formItemLayout = {
  labelCol: {span: SPAN_ONE_THIRD},
  wrapperCol: {span: SPAN_TWO_THIRDS}
};

const cardLayout = {
  type: 'inner',
  style: {
    marginBottom: MARGIN_MD
  }
};

const mapStateToProps = state => ({
  hasHeader: state.scenes.dataManager.dataflowBuilder.shared.hasHeader,
  dataflowTriplet: state.scenes.dataManager.dataflowBuilder.shared.dataflowTriplet,
  header: state.scenes.dataManager.dataflowBuilder.shared.header
});

const mapDispatchToProps = dispatch => ({
  onShow: () => dispatch(showDataflowBuilderWizardHeaderForm()),
  onHide: () => dispatch(hideDataflowBuilderWizardHeaderForm()),
  onChange: fields => dispatch(changeDataflowBuilderWizardHeaderForm(fields)),
  fetchHeader: dataflowTriplet => dispatch(readDataflowBuilderWizardHeaderFormHeader(dataflowTriplet))
});

const mapPropsToFields = ({header}) => ({
  test: Form.createFormField({
    value: (header && header.test) || null
  }),
  name: Form.createFormField({
    value: (header && header.name) || null
  }),
  sender: {
    organisationId: Form.createFormField({
      value: (header && header.sender && header.sender.organisationId) || null
    }),
    organisationName: Form.createFormField({
      value: (header && header.sender && header.sender.organisationName) || null
    }),
    contactName: Form.createFormField({
      value: (header && header.sender && header.sender.contactName) || null
    }),
    contactDepartment: Form.createFormField({
      value: (header && header.sender && header.sender.contactDepartment) || null
    }),
    contactRole: Form.createFormField({
      value: (header && header.sender && header.sender.contactRole) || null
    }),
    contactEmail: Form.createFormField({
      value: (header && header.sender && header.sender.contactEmail) || null
    })
  },
  receiver: {
    organisationId: Form.createFormField({
      value: (header && header.receiver && header.receiver.organisationId) || null
    }),
    organisationName: Form.createFormField({
      value: (header && header.receiver && header.receiver.organisationName) || null
    }),
    contactName: Form.createFormField({
      value: (header && header.receiver && header.receiver.contactName) || null
    }),
    contactDepartment: Form.createFormField({
      value: (header && header.receiver && header.receiver.contactDepartment) || null
    }),
    contactRole: Form.createFormField({
      value: (header && header.receiver && header.receiver.contactRole) || null
    }),
    contactEmail: Form.createFormField({
      value: (header && header.receiver && header.receiver.contactEmail) || null
    })
  },
  dataSetAgencyId: Form.createFormField({value: (header && header.dataSetAgencyId) || null}),
  source: Form.createFormField({value: (header && header.source) || null})
});

const onFieldsChange = ({onChange}, fields) =>
  onChange({
    test:
      fields.test !== undefined
        ? fields.test.value
        : undefined,
    name:
      fields.name
        ? fields.name.value
        : undefined,
    sender:
      fields.sender !== undefined
        ? _.mapValues(fields.sender, field => field.value)
        : undefined,
    receiver:
      fields.receiver !== undefined
        ? _.mapValues(fields.receiver, field => field.value)
        : undefined,
    dataSetAgencyId:
      fields.dataSetAgencyId !== undefined
        ? fields.dataSetAgencyId.value
        : undefined,
    source:
      fields.source !== undefined
        ? fields.source.value
        : undefined
  });

const DataflowBuilderWizardHeaderForm = ({
                                           t,
                                           form,
                                           dataflowTriplet,
                                           header,
                                           hasHeader,
                                           onShow,
                                           onHide,
                                           fetchHeader,
                                           disabled
                                         }) =>
  <Call cb={fetchHeader} cbParam={dataflowTriplet} disabled={dataflowTriplet === null}>
    <Form className="advanced-form">
      <Card type="inner">
        <Row style={{marginBottom: MARGIN_MD}}>
          <Col span={SPAN_HALF}>
            <Form.Item
              label={t('scenes.dataManager.dataflowBuilder.wizard.headerForm.isVisibleCheckbox.label')}
            >
              <Checkbox onChange={e => e.target.checked ? onShow() : onHide()} checked={hasHeader} disabled={disabled}/>
            </Form.Item>
          </Col>
        </Row>
        {hasHeader && (
          <Fragment>
            <Row gutter={GUTTER_MD} style={{marginBottom: MARGIN_MD}}>
              <Col span={SPAN_HALF}>
                <Form.Item label={t('data.dataflow.header.test.label')}>
                  {form.getFieldDecorator('test', {valuePropName: 'checked'})(<Checkbox disabled={disabled}/>)}
                </Form.Item>
              </Col>
              <Col span={SPAN_HALF}>
                <Form.Item label={t('data.dataflow.header.name.label')} {...formItemLayout}>
                  {form.getFieldDecorator('name')(<Input title={form.getFieldValue('name')} disabled={disabled}/>)}
                </Form.Item>
              </Col>
            </Row>
            <Card title={t('data.dataflow.header.sender.label')} {...cardLayout}>
              <Row gutter={GUTTER_MD} style={{marginBottom: MARGIN_MD}}>
                <Col span={SPAN_HALF}>
                  <Form.Item
                    className="form-item-required"
                    label={t('data.dataflow.header.organisationId.label')} {...formItemLayout}>
                    {form.getFieldDecorator('sender.organisationId', {normalize: normalizeId})(
                      <Input title={form.getFieldValue('sender.organisationId')} disabled={disabled}/>
                    )}
                  </Form.Item>
                </Col>
                <Col span={SPAN_HALF}>
                  <Form.Item
                    label={t('data.dataflow.header.organisationName.label')} {...formItemLayout}>
                    {form.getFieldDecorator('sender.organisationName')(
                      <Input title={form.getFieldValue('sender.organisationName')} disabled={disabled}/>
                    )}
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={GUTTER_MD} style={{marginBottom: MARGIN_MD}}>
                <Col span={SPAN_HALF}>
                  <Form.Item
                    label={t('data.dataflow.header.contactName.label')} {...formItemLayout}>
                    {form.getFieldDecorator('sender.contactName')(
                      <Input title={form.getFieldValue('sender.contactName')} disabled={disabled}/>
                    )}
                  </Form.Item>
                </Col>
                <Col span={SPAN_HALF}>
                  <Form.Item
                    label={t('data.dataflow.header.contactEmail.label')} {...formItemLayout}>
                    {form.getFieldDecorator('sender.contactEmail')(
                      <Input title={form.getFieldValue('sender.contactEmail')} disabled={disabled}/>
                    )}
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={GUTTER_MD}>
                <Col span={SPAN_HALF}>
                  <Form.Item
                    label={t('data.dataflow.header.contactDepartment.label')} {...formItemLayout}>
                    {form.getFieldDecorator('sender.contactDepartment')(
                      <Input title={form.getFieldValue('sender.contactDepartment')} disabled={disabled}/>
                    )}
                  </Form.Item>
                </Col>
                <Col span={SPAN_HALF}>
                  <Form.Item
                    label={t('data.dataflow.header.contactRole.label')} {...formItemLayout}>
                    {form.getFieldDecorator('sender.contactRole')(
                      <Input title={form.getFieldValue('sender.contactRole')} disabled={disabled}/>
                    )}
                  </Form.Item>
                </Col>
              </Row>
            </Card>
            <Card title={t('data.dataflow.header.receiver.label')} {...cardLayout}>
              <Row gutter={GUTTER_MD} style={{marginBottom: MARGIN_MD}}>
                <Col span={SPAN_HALF}>
                  <Form.Item
                    label={t('data.dataflow.header.organisationId.label')} {...formItemLayout}>
                    {form.getFieldDecorator('receiver.organisationId', {normalize: normalizeId})(
                      <Input title={form.getFieldValue('receiver.organisationId')} disabled={disabled}/>
                    )}
                  </Form.Item>
                </Col>
                <Col span={SPAN_HALF}>
                  <Form.Item
                    label={t('data.dataflow.header.organisationName.label')} {...formItemLayout}>
                    {form.getFieldDecorator('receiver.organisationName')(
                      <Input
                        disabled={
                          header === null || header.receiver === null || header.receiver === undefined ||
                          header.receiver.organisationId === null || header.receiver.organisationId.length === 0 ||
                          disabled
                        }
                        title={form.getFieldValue('receiver.organisationName')}
                      />
                    )}
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={GUTTER_MD} style={{marginBottom: MARGIN_MD}}>
                <Col span={SPAN_HALF}>
                  <Form.Item
                    label={t('data.dataflow.header.contactName.label')} {...formItemLayout}>
                    {form.getFieldDecorator('receiver.contactName')(
                      <Input
                        title={form.getFieldValue('receiver.contactName')}
                        disabled={
                          header === null || header.receiver === null || header.receiver === undefined ||
                          header.receiver.organisationId === null || header.receiver.organisationId.length === 0 ||
                          disabled
                        }
                      />
                    )}
                  </Form.Item>
                </Col>
                <Col span={SPAN_HALF}>
                  <Form.Item
                    label={t('data.dataflow.header.contactEmail.label')} {...formItemLayout}>
                    {form.getFieldDecorator('receiver.contactEmail')(
                      <Input
                        title={form.getFieldValue('receiver.contactEmail')}
                        disabled={
                          header === null || header.receiver === null || header.receiver === undefined ||
                          header.receiver.organisationId === null || header.receiver.organisationId.length === 0 ||
                          disabled
                        }
                      />
                    )}
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={GUTTER_MD}>
                <Col span={SPAN_HALF}>
                  <Form.Item
                    label={t('data.dataflow.header.contactDepartment.label')} {...formItemLayout}>
                    {form.getFieldDecorator('receiver.contactDepartment')(
                      <Input
                        title={form.getFieldValue('receiver.contactDepartment')}
                        disabled={
                          header === null || header.receiver === null || header.receiver === undefined ||
                          header.receiver.organisationId === null || header.receiver.organisationId.length === 0 ||
                          disabled
                        }
                      />
                    )}
                  </Form.Item>
                </Col>
                <Col span={SPAN_HALF}>
                  <Form.Item
                    label={t('data.dataflow.header.contactRole.label')} {...formItemLayout}>
                    {form.getFieldDecorator('receiver.contactRole')(
                      <Input
                        title={form.getFieldValue('receiver.contactRole')}
                        disabled={
                          header === null || header.receiver === null || header.receiver === undefined ||
                          header.receiver.organisationId === null || header.receiver.organisationId.length === 0 ||
                          disabled
                        }
                      />
                    )}
                  </Form.Item>
                </Col>
              </Row>
            </Card>
            <Row gutter={GUTTER_MD}>
              <Col span={SPAN_HALF}>
                <Form.Item
                  label={t('data.dataflow.header.dataSetAgencyId.label')} {...formItemLayout}>
                  {form.getFieldDecorator('dataSetAgencyId', {normalize: normalizeId})(
                    <Input title={form.getFieldValue('dataSetAgencyId')} disabled={disabled}/>
                  )}
                </Form.Item>
              </Col>
              <Col span={SPAN_HALF}>
                <Form.Item label={t('data.dataflow.header.source.label')} {...formItemLayout}>
                  {form.getFieldDecorator('source')(<Input title={form.getFieldValue('source')} disabled={disabled}/>)}
                </Form.Item>
              </Col>
            </Row>
          </Fragment>
        )}
      </Card>
    </Form>
  </Call>;


export default compose(
  translate(),
  connect(mapStateToProps, mapDispatchToProps),
  Form.create({
    mapPropsToFields,
    onFieldsChange
  })
)(DataflowBuilderWizardHeaderForm);
