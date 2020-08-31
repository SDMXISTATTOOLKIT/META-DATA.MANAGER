import React from 'react';
import {translate} from 'react-i18next';
import {Divider, Form, Input} from 'antd';
import {compose} from 'redux';
import {SPAN_ONE_THIRD, SPAN_TWO_THIRDS} from '../../styles/constants';
import {getArtefactTripletFromUrn, getStringFromArtefactTriplet} from '../../utils/sdmxJson';

const formItemLayout = {
  labelCol: {span: SPAN_ONE_THIRD},
  wrapperCol: {span: SPAN_TWO_THIRDS},
};

const mapPropsToFields = ({measure}) => ({
  id: Form.createFormField({value: measure !== null ? measure.id : null}),
  concept:
    Form.createFormField({
      value: measure !== null
        ? (
          `(${getStringFromArtefactTriplet(getArtefactTripletFromUrn(measure.conceptIdentity))})`
          + ' ' + measure.conceptIdentity.split('.')
            .pop()
        )
        : null
    }),
  codelist:
    Form.createFormField({
      value: measure !== null
        ? (
          measure.localRepresentation &&
          measure.localRepresentation.enumeration &&
          getStringFromArtefactTriplet(getArtefactTripletFromUrn(measure.localRepresentation.enumeration))
        )
        : null
    })
});

const MeasureDetail = ({
                         t,
                         form
                       }) =>
  <Form>
    <Form.Item label={t('data.measure.id.label')} {...formItemLayout}>
      {form.getFieldDecorator('id')(
        <Input title={form.getFieldValue('id')} disabled/>
      )}
    </Form.Item>
    <Divider/>
    <Form.Item label={t('data.measure.concept.label')} {...formItemLayout}>
      {form.getFieldDecorator('concept')(
        <Input title={form.getFieldValue('concept')} disabled/>
      )}
    </Form.Item>
    <Form.Item label={t('data.measure.codelist.label')} {...formItemLayout}>
      {form.getFieldDecorator('codelist')(
        <Input title={form.getFieldValue('codelist')} disabled/>
      )}
    </Form.Item>
  </Form>;

export default compose(
  translate(),
  Form.create({mapPropsToFields})
)(MeasureDetail);
