import React, {Fragment} from 'react';
import {Col, Form, Input, Row, Select} from "antd";
import {GUTTER_MD, MARGIN_MD, SPAN_FULL, SPAN_ONE_QUARTER, SPAN_THREE_QUARTERS} from "../../../styles/constants";
import {normalizeId, normalizeOrder} from "../../../utils/normalizers";
import Selector from "../../../components/selector";
import {compose} from "redux";
import {translate} from 'react-i18next';
import {
  DSD_ATTRIBUTE_ATTACHMENT_LEVEL_DATASET,
  DSD_ATTRIBUTE_ATTACHMENT_LEVEL_GROUP,
  DSD_ATTRIBUTE_ATTACHMENT_LEVEL_OBSERVATION,
  DSD_ATTRIBUTE_ATTACHMENT_LEVEL_SERIES,
  DSD_DIMENSION_TYPE_FREQUENCY,
  DSD_DIMENSION_TYPE_MEASURE,
  DSD_DIMENSION_TYPE_NORMAL,
  DSD_DIMENSION_TYPE_TIME,
  getArtefactTripletFromUrn,
  getStringFromArtefactTriplet,
  getStringFromItemUrn
} from "../../../utils/sdmxJson";
import {ARTEFACT_FORM_MODE_EDIT, ARTEFACT_FORM_MODE_READ} from "../../../components/artefact-form";
import _ from "lodash";
import AnnotationsForm from "../../../components/annotations-form";
import {getSdmxDimensionTypesTranslations} from "./getSdmxDimensionTypesTranslations";
import {getSdmxAttributeAttachmentLevelTranslations} from "./getSdmxAttributeAttachmentLevelTranslations";

const formItemLayout = {
  labelCol: {span: SPAN_ONE_QUARTER},
  wrapperCol: {span: SPAN_THREE_QUARTERS}
};

const mapPropsToFields = ({component}) => ({
  type: Form.createFormField({value: component ? component.type : null}),
  id: Form.createFormField({value: component ? component.id : null}),
  order: Form.createFormField({value: component ? component.order : null}),
  concept: Form.createFormField({
    value: component && component.concept ? getStringFromItemUrn(component.concept) : null
  }),
  representation: Form.createFormField({
    value: component && component.representation
      ? getStringFromArtefactTriplet(getArtefactTripletFromUrn(component.representation))
      : null
  }),
  groupDimensions: Form.createFormField({value: component ? (component.groupDimensions || []) : null}),
  assignmentStatus: Form.createFormField({value: component ? component.assignmentStatus : null}),
  attachmentLevel: Form.createFormField({value: component ? component.attachmentLevel : null}),
  attachedDimensions: Form.createFormField({value: component ? (component.attachedDimensions || []) : null}),
  attachmentGroup: Form.createFormField({value: component ? component.attachmentGroup : null})
});

export const DSD_COMPONENT_TYPE_MEASURE = 'DSD_COMPONENT_TYPE_MEASURE';
export const DSD_COMPONENT_TYPE_DIMENSION = 'DSD_COMPONENT_TYPE_DIMENSION';
export const DSD_COMPONENT_TYPE_GROUP = 'DSD_COMPONENT_TYPE_GROUP';
export const DSD_COMPONENT_TYPE_ATTRIBUTE = 'DSD_COMPONENT_TYPE_ATTRIBUTE';

const onFieldsChange = (props, fields) =>
  props.onChange(_.mapValues(fields, ({value}) => value));

const ComponentForm = ({
                         t,
                         component,
                         mode,
                         type,
                         form,
                         dimensions,
                         groups,
                         onChange,
                         onConceptSelect,
                         onConceptSchemeSelect,
                         onCodelistSelect
                       }) =>
  <Fragment>
    <Form>
      {type === DSD_COMPONENT_TYPE_DIMENSION && (
        <Row gutter={GUTTER_MD} style={{marginBottom: MARGIN_MD}}>
          <Col span={SPAN_FULL}>
            <Form.Item
              className="form-item-required"
              label={t('data.dsd.dimension.type.label')}
              {...formItemLayout}
            >
              {form.getFieldDecorator('type')(
                <Select
                  showSearch
                  filterOption={(inputValue, {props}) =>
                    props.title.toLowerCase().includes(inputValue.toLowerCase())
                  }
                  disabled={mode === ARTEFACT_FORM_MODE_READ || mode === ARTEFACT_FORM_MODE_EDIT}
                  title={form.getFieldValue('type')}
                >
                  {[
                    DSD_DIMENSION_TYPE_NORMAL,
                    DSD_DIMENSION_TYPE_FREQUENCY,
                    DSD_DIMENSION_TYPE_TIME,
                    DSD_DIMENSION_TYPE_MEASURE
                  ].map(opt =>
                    <Select.Option
                      key={opt}
                      value={opt}
                      title={getSdmxDimensionTypesTranslations(t)[opt]}
                    >
                      {getSdmxDimensionTypesTranslations(t)[opt]}
                    </Select.Option>
                  )}
                </Select>
              )}
            </Form.Item>
          </Col>
        </Row>
      )}
      <Row gutter={GUTTER_MD} style={{marginBottom: MARGIN_MD}}>
        <Col span={SPAN_FULL}>
          <Form.Item
            className="form-item-required"
            label={t('data.dsd.component.id.label')}
            {...formItemLayout}
          >
            {form.getFieldDecorator('id', {normalize: normalizeId})(
              <Input
                disabled={
                  mode === ARTEFACT_FORM_MODE_READ || mode === ARTEFACT_FORM_MODE_EDIT ||
                  type === DSD_COMPONENT_TYPE_MEASURE ||
                  (
                    type === DSD_COMPONENT_TYPE_DIMENSION &&
                    (component.type === DSD_DIMENSION_TYPE_FREQUENCY || component.type === DSD_DIMENSION_TYPE_TIME)
                  )
                }
                title={form.getFieldValue('id')}
              />
            )}
          </Form.Item>
        </Col>
      </Row>
      {(type === DSD_COMPONENT_TYPE_DIMENSION || type === DSD_COMPONENT_TYPE_ATTRIBUTE) && (
        <Row gutter={GUTTER_MD} style={{marginBottom: MARGIN_MD}}>
          <Col span={SPAN_FULL}>
            <Form.Item
              label={t('data.dsd.component.order.label')}
              {...formItemLayout}
            >
              {form.getFieldDecorator('order', {normalize: normalizeOrder})(
                <Input
                  disabled={mode === ARTEFACT_FORM_MODE_READ}
                  title={form.getFieldValue('order')}
                />
              )}
            </Form.Item>
          </Col>
        </Row>
      )}
      {(type === DSD_COMPONENT_TYPE_MEASURE ||
        type === DSD_COMPONENT_TYPE_DIMENSION || type === DSD_COMPONENT_TYPE_ATTRIBUTE) && (
        <Fragment>
          <Row gutter={GUTTER_MD} style={{marginBottom: MARGIN_MD}}>
            <Col span={SPAN_FULL}>
              <Form.Item
                className={"form-item-required"}
                label={t('data.dsd.component.concept.label')}
                {...formItemLayout}
              >
                {form.getFieldDecorator('concept')(
                  <Selector
                    disabled={mode === ARTEFACT_FORM_MODE_READ}
                    title={form.getFieldValue('concept')}
                    onSelect={onConceptSelect}
                    onReset={() => onChange({concept: null})}
                  />
                )}
              </Form.Item>
            </Col>
          </Row>
          {(
            type !== DSD_COMPONENT_TYPE_DIMENSION ||
            (component.type === DSD_DIMENSION_TYPE_NORMAL || component.type === DSD_DIMENSION_TYPE_FREQUENCY)
          ) && (
            <Row gutter={GUTTER_MD}>
              <Col span={SPAN_FULL}>
                <Form.Item
                  label={t('data.dsd.component.codelist.label')}
                  {...formItemLayout}
                >
                  {form.getFieldDecorator('representation')(
                    <Selector
                      disabled={mode === ARTEFACT_FORM_MODE_READ}
                      title={form.getFieldValue('representation')}
                      onSelect={onCodelistSelect}
                      onReset={() => onChange({representation: null})}
                    />
                  )}
                </Form.Item>
              </Col>
            </Row>
          )}
          {type === DSD_COMPONENT_TYPE_DIMENSION && component.type === DSD_DIMENSION_TYPE_MEASURE && (
            <Row gutter={GUTTER_MD}>
              <Col span={SPAN_FULL}>
                <Form.Item
                  label={t('data.dsd.component.conceptScheme.label')}
                  className={"form-item-required"}
                  {...formItemLayout}
                >
                  {form.getFieldDecorator('representation')(
                    <Selector
                      disabled={mode === ARTEFACT_FORM_MODE_READ}
                      title={form.getFieldValue('representation')}
                      onSelect={onConceptSchemeSelect}
                      onReset={() => onChange({representation: null})}
                    />
                  )}
                </Form.Item>
              </Col>
            </Row>
          )}
        </Fragment>
      )}
      {type === DSD_COMPONENT_TYPE_GROUP && (
        <Row gutter={GUTTER_MD} style={{marginBottom: MARGIN_MD}}>
          <Col span={SPAN_FULL}>
            <Form.Item
              className="form-item-required"
              label={t('data.dsd.group.dimensions.label')}
              {...formItemLayout}
            >
              {form.getFieldDecorator('groupDimensions')(
                <Select
                  mode="multiple"
                  disabled={mode === ARTEFACT_FORM_MODE_READ}
                  title={form.getFieldValue('groupDimensions')}
                >
                  {(dimensions || []).map(dim =>
                    <Select.Option key={dim.id} value={dim.id}>{dim.id}</Select.Option>
                  )}
                </Select>
              )}
            </Form.Item>
          </Col>
        </Row>
      )}
      {type === DSD_COMPONENT_TYPE_ATTRIBUTE && (
        <Fragment>
          <Row gutter={GUTTER_MD} style={{marginTop: MARGIN_MD, marginBottom: MARGIN_MD}}>
            <Col span={SPAN_FULL}>
              <Form.Item
                className="form-item-required"
                label={t('data.dsd.attribute.assignmentStatus.label')}
                {...formItemLayout}
              >
                {form.getFieldDecorator('assignmentStatus')(
                  <Select
                    showSearch
                    filterOption={(inputValue, {props}) =>
                      props.title.toLowerCase().includes(inputValue.toLowerCase())
                    }
                    disabled={mode === ARTEFACT_FORM_MODE_READ}
                    title={form.getFieldValue('assignmentStatus')}
                  >
                    {["Conditional", "Mandatory"].map(opt =>
                      <Select.Option key={opt} value={opt} title={opt}>{opt}</Select.Option>
                    )}
                  </Select>
                )}
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={GUTTER_MD} style={{marginBottom: MARGIN_MD}}>
            <Col span={SPAN_FULL}>
              <Form.Item
                className="form-item-required"
                label={t('data.dsd.attribute.attachmentLevel.label')}
                {...formItemLayout}
              >
                {form.getFieldDecorator('attachmentLevel')(
                  <Select
                    showSearch
                    filterOption={(inputValue, {props}) =>
                      props.title.toLowerCase().includes(inputValue.toLowerCase())
                    }
                    disabled={mode === ARTEFACT_FORM_MODE_READ}
                    title={form.getFieldValue('attachmentLevel')}
                  >
                    {[
                      DSD_ATTRIBUTE_ATTACHMENT_LEVEL_OBSERVATION,
                      DSD_ATTRIBUTE_ATTACHMENT_LEVEL_DATASET,
                      DSD_ATTRIBUTE_ATTACHMENT_LEVEL_SERIES,
                      DSD_ATTRIBUTE_ATTACHMENT_LEVEL_GROUP
                    ].map(opt =>
                      <Select.Option
                        key={opt}
                        value={opt}
                        title={getSdmxAttributeAttachmentLevelTranslations(t)[opt]}
                      >
                        {getSdmxAttributeAttachmentLevelTranslations(t)[opt]}
                      </Select.Option>
                    )}
                  </Select>
                )}
              </Form.Item>
            </Col>
          </Row>
          {form.getFieldValue("attachmentLevel") === "Series" && (
            <Row gutter={GUTTER_MD} style={{marginBottom: MARGIN_MD}}>
              <Col span={SPAN_FULL}>
                <Form.Item
                  className="form-item-required"
                  label={t('data.dsd.attribute.dimensions.label')}
                  {...formItemLayout}
                >
                  {form.getFieldDecorator('attachedDimensions')(
                    <Select
                      mode="multiple"
                      disabled={mode === ARTEFACT_FORM_MODE_READ}
                      title={form.getFieldValue('attachedDimensions')}
                    >
                      {(dimensions || []).map(({id}) =>
                        <Select.Option key={id} value={id}>{id}</Select.Option>
                      )}
                    </Select>
                  )}
                </Form.Item>
              </Col>
            </Row>
          )}
          {form.getFieldValue("attachmentLevel") === "Group" && (
            <Row gutter={GUTTER_MD} style={{marginBottom: MARGIN_MD}}>
              <Col span={SPAN_FULL}>
                <Form.Item
                  className="form-item-required"
                  label={t('data.dsd.attribute.group.label')}
                  {...formItemLayout}
                >
                  {form.getFieldDecorator('attachmentGroup')(
                    <Select
                      showSearch
                      filterOption={(inputValue, {props}) =>
                        props.title.toLowerCase().includes(inputValue.toLowerCase())
                      }
                      disabled={mode === ARTEFACT_FORM_MODE_READ}
                      title={form.getFieldValue('attachmentGroup')}
                    >
                      {(groups || []).map(({id}) =>
                        <Select.Option key={id} value={id} title={id}>{id}</Select.Option>
                      )}
                    </Select>
                  )}
                </Form.Item>
              </Col>
            </Row>
          )}
        </Fragment>
      )}
    </Form>
    <AnnotationsForm
      annotations={component ? component.annotations : null}
      onChange={onChange}
      disabled={mode === ARTEFACT_FORM_MODE_READ}
    />
  </Fragment>;

export default compose(
  translate(),
  Form.create({mapPropsToFields, onFieldsChange})
)(ComponentForm);
