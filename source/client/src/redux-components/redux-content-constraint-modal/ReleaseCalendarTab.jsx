import React from 'react';
import {compose} from "redux";
import {translate} from 'react-i18next';
import {Col, Form, Input, Row, Select} from 'antd';
import {SPAN_HALF, SPAN_ONE_THIRD, SPAN_TWO_THIRDS} from "../../styles/constants";
import _ from "lodash";
import {normalizeInt} from "../../utils/normalizers";

const mapPropsToFields = ({releaseCalendar}) => ({
  periodicity: {
    value: Form.createFormField({value: releaseCalendar.periodicity.value}),
    measureUnit: Form.createFormField({value: releaseCalendar.periodicity.measureUnit}),
  },
  offset: {
    value: Form.createFormField({value: releaseCalendar.offset.value}),
    measureUnit: Form.createFormField({value: releaseCalendar.offset.measureUnit}),
  },
  tolerance: {
    value: Form.createFormField({value: releaseCalendar.tolerance.value}),
    measureUnit: Form.createFormField({value: releaseCalendar.tolerance.measureUnit}),
  }
});

const onFieldsChange = (props, fields) =>
  props.onReleaseCalendarChange(_.mapValues(fields, value => _.mapValues(value, ({value}) => value)));

const CONTENT_CONSTRAINTS_MEASURE_UNIT_DAYS = "days";
const CONTENT_CONSTRAINTS_MEASURE_UNIT_WEEKS = "weeks";
const CONTENT_CONSTRAINTS_MEASURE_UNIT_MONTHS = "months";
const CONTENT_CONSTRAINTS_MEASURE_UNIT_YEARS = "years";

const formItemLayout = {
  labelCol: {span: SPAN_TWO_THIRDS},
  wrapperCol: {span: SPAN_ONE_THIRD}
};

const MeasureUnitSelect = (t, disabled) => (
  <Select
    showSearch
    filterOption={(inputValue, {props}) =>
      props.title.toLowerCase().includes(inputValue.toLowerCase())
    }
    disabled={disabled}
  >
    <Select.Option
      value={CONTENT_CONSTRAINTS_MEASURE_UNIT_DAYS}
      title={t("scenes.metaManager.commons.detail.tabs.releaseCalendar.measureUnit.days.label")}
    >
      {t("scenes.metaManager.commons.detail.tabs.releaseCalendar.measureUnit.days.label")}
    </Select.Option>
    <Select.Option
      value={CONTENT_CONSTRAINTS_MEASURE_UNIT_WEEKS}
      title={t("scenes.metaManager.commons.detail.tabs.releaseCalendar.measureUnit.weeks.label")}
    >
      {t("scenes.metaManager.commons.detail.tabs.releaseCalendar.measureUnit.weeks.label")}
    </Select.Option>
    <Select.Option
      value={CONTENT_CONSTRAINTS_MEASURE_UNIT_MONTHS}
      title={t("scenes.metaManager.commons.detail.tabs.releaseCalendar.measureUnit.months.label")}
    >
      {t("scenes.metaManager.commons.detail.tabs.releaseCalendar.measureUnit.months.label")}
    </Select.Option>
    <Select.Option
      value={CONTENT_CONSTRAINTS_MEASURE_UNIT_YEARS}
      title={t("scenes.metaManager.commons.detail.tabs.releaseCalendar.measureUnit.years.label")}
    >
      {t("scenes.metaManager.commons.detail.tabs.releaseCalendar.measureUnit.years.label")}
    </Select.Option>
  </Select>
);

const ReleaseCalendarTab = ({
                              t,
                              form,
                              disabled
                            }) =>
  <Form>
    <Row type="flex" justify="center">
      <Col span={SPAN_HALF}>
        <Row type="flex" align="middle">
          <Col span={SPAN_HALF}>
            <Form.Item
              label={t('scenes.metaManager.commons.detail.tabs.releaseCalendar.periodicity.title')}
              {...formItemLayout}
            >
              {form.getFieldDecorator('periodicity.value', {normalize: normalizeInt})(<Input disabled={disabled}/>)}
            </Form.Item>
          </Col>
          <Col span={SPAN_HALF}>
            {form.getFieldDecorator('periodicity.measureUnit')(
              MeasureUnitSelect(t, disabled)
            )}
          </Col>
        </Row>
        <Row type="flex" align="middle">
          <Col span={SPAN_HALF}>
            <Form.Item
              label={t('scenes.metaManager.commons.detail.tabs.releaseCalendar.offset.title')}
              {...formItemLayout}
            >
              {form.getFieldDecorator('offset.value', {normalize: normalizeInt})(<Input disabled={disabled}/>)}
            </Form.Item>
          </Col>
          <Col span={SPAN_HALF}>
            {form.getFieldDecorator('offset.measureUnit')(
              MeasureUnitSelect(t, disabled)
            )}
          </Col>
        </Row>
        <Row type="flex" align="middle">
          <Col span={SPAN_HALF}>
            <Form.Item
              label={t('scenes.metaManager.commons.detail.tabs.releaseCalendar.tolerance.title')}
              {...formItemLayout}
            >
              {form.getFieldDecorator('tolerance.value', {normalize: normalizeInt})(<Input disabled={disabled}/>)}
            </Form.Item>
          </Col>
          <Col span={SPAN_HALF}>
            {form.getFieldDecorator('tolerance.measureUnit')(
              MeasureUnitSelect(t, disabled)
            )}
          </Col>
        </Row>
      </Col>
    </Row>
  </Form>;

export default compose(
  translate(),
  Form.create({mapPropsToFields, onFieldsChange})
)(ReleaseCalendarTab);
