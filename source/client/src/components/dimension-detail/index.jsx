import React from 'react';
import { translate } from 'react-i18next';
import { Divider, Form, Input } from 'antd';
import { compose } from 'redux';
import { SPAN_ONE_THIRD, SPAN_TWO_THIRDS } from '../../styles/constants';
import { getArtefactTripletFromUrn, getStringFromArtefactTriplet } from '../../utils/sdmxJson';

const formItemLayout = {
  labelCol: { span: SPAN_ONE_THIRD },
  wrapperCol: { span: SPAN_TWO_THIRDS },
};

const mapPropsToFields = ({ dimension }) => ({
  id: Form.createFormField({ value: dimension !== null ? dimension.id : null }),
  concept:
    Form.createFormField({
      value: dimension !== null
        ? (
          `(${getStringFromArtefactTriplet(getArtefactTripletFromUrn(dimension.conceptIdentity))})`
          + ' ' + dimension.conceptIdentity.split('.')
            .pop()
        )
        : null
    }),
  codelist:
    Form.createFormField({
      value: dimension !== null
        ? (
          dimension.localRepresentation &&
          dimension.localRepresentation.enumeration &&
          getStringFromArtefactTriplet(getArtefactTripletFromUrn(dimension.localRepresentation.enumeration))
        )
        : null
    })
});

const DimensionDetail = ({
                           t,
                           form
                         }) =>
  <Form>
    <Form.Item label={t('data.dimension.id.label')} {...formItemLayout}>
      {form.getFieldDecorator('id')(
        <Input title={form.getFieldValue('id')} disabled/>
      )}
    </Form.Item>
    <Divider/>
    <Form.Item label={t('data.attribute.concept.label')} {...formItemLayout}>
      {form.getFieldDecorator('concept')(
        <Input title={form.getFieldValue('concept')} disabled/>
      )}
    </Form.Item>
    <Form.Item label={t('data.attribute.codelist.label')} {...formItemLayout}>
      {form.getFieldDecorator('codelist')(
        <Input title={form.getFieldValue('codelist')} disabled/>
      )}
    </Form.Item>
  </Form>;

export default compose(
  translate(),
  Form.create({ mapPropsToFields })
)(DimensionDetail);
