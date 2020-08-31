import React from 'react';
import {translate} from 'react-i18next';
import {Divider, Form, Input} from 'antd';
import {compose} from 'redux';
import {SPAN_ONE_THIRD, SPAN_TWO_THIRDS} from '../../styles/constants';
import {getArtefactTripletFromUrn, getStringFromArtefactTriplet} from '../../utils/sdmxJson';
import {getSdmxAttributeAttachmentLevelTranslations} from "../../redux-components/redux-dsd-detail-modal/dsd-detail/getSdmxAttributeAttachmentLevelTranslations";

const formItemLayout = {
  labelCol: {span: SPAN_ONE_THIRD},
  wrapperCol: {span: SPAN_TWO_THIRDS},
};

const mapPropsToFields = ({attribute, t}) => ({
  id: Form.createFormField({value: attribute !== null ? attribute.id : null}),
  assignmentStatus:
    Form.createFormField({value: attribute !== null ? attribute.assignmentStatus : null}),
  attachmentLevel:
    Form.createFormField({value: attribute !== null ? getSdmxAttributeAttachmentLevelTranslations(t)[attribute.attachmentLevel] : null}),
  attachmentGroup:
    Form.createFormField({value: attribute !== null ? attribute.attachmentGroup : null}),
  concept:
    Form.createFormField({
      value: attribute !== null
        ? (
          `(${getStringFromArtefactTriplet(getArtefactTripletFromUrn(attribute.conceptIdentity))})`
          + ' ' + attribute.conceptIdentity.split('.')
            .pop()
        )
        : null
    }),
  codelist:
    Form.createFormField({
      value: attribute !== null
        ? (
          attribute.localRepresentation &&
          attribute.localRepresentation.enumeration &&
          getStringFromArtefactTriplet(getArtefactTripletFromUrn(attribute.localRepresentation.enumeration))
        )
        : null
    })
});

const AttributeDetail = ({
                           t,
                           form
                         }) =>
  <Form>
    <Form.Item label={t('data.attribute.id.label')} {...formItemLayout}>
      {form.getFieldDecorator('id')(
        <Input title={form.getFieldValue('id')} disabled/>
      )}
    </Form.Item>
    <Form.Item label={t('data.attribute.assignmentStatus.label')} {...formItemLayout}>
      {form.getFieldDecorator('assignmentStatus')(
        <Input title={form.getFieldValue('assignmentStatus')} disabled/>
      )}
    </Form.Item>
    <Form.Item label={t('data.attribute.attachmentLevel.label')} {...formItemLayout}>
      {form.getFieldDecorator('attachmentLevel')(
        <Input title={form.getFieldValue('attachmentLevel')} disabled/>
      )}
    </Form.Item>
    {form.getFieldValue('attachmentLevel') === 'Group' && (
      <Form.Item label={t('data.attribute.group.label')} {...formItemLayout}>
        {form.getFieldDecorator('attachmentGroup')(
          <Input title={form.getFieldValue('attachmentGroup')} disabled/>
        )}
      </Form.Item>
    )}
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
  Form.create({mapPropsToFields})
)(AttributeDetail);
