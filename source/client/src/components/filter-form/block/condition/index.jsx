import React, {Fragment} from 'react';
import {Button, Col, Input, Modal, Row, Select} from 'antd';
import {GUTTER_SM} from '../../../../styles/constants';
import _ from 'lodash';
import Call from "../../../../hocs/call";
import {translate} from 'react-i18next';

const FilterFormBlockCondition = ({
                                    t,
                                    form,
                                    blockIndex,
                                    index,
                                    values,
                                    isNumeric,
                                    onDelete,
                                    disabled
                                  }) =>
  <Row type="flex" gutter={GUTTER_SM} justify="space-between">
    <Call
      cb={() => Modal.warning({
        title: t('components.filterForm.alerts.noValues.title'),
        onOk() {
          onDelete()
        }
      })}
      disabled={!values || values.filter(val => val.value !== null).length > 0}
    >
      {values.filter(val => val.value !== null).length !== 0 && (
        <Fragment>
          <Col span={5}>
            {form.getFieldDecorator(`filter[${blockIndex}].conditions[${index}].comparisonOperator`)(
              <Select style={{width: '100%'}} size="small" disabled={disabled}>
                {
                  _.compact([
                    '=',
                    '<>',
                    !isNumeric ? 'like' : null,
                    '<',
                    '>'
                  ])
                    .map(op => <Select.Option key={op} value={op}>{op}</Select.Option>)
                }
              </Select>
            )}
          </Col>
          <Col span={16}>
            {form.getFieldDecorator(`filter[${blockIndex}].conditions[${index}].value`)(
              values !== undefined && (
                form.getFieldValue(`filter[${blockIndex}].conditions[${index}].comparisonOperator`)
                !==
                'like'
              )
                ? (
                  <Select
                    showSearch
                    filterOption={(inputValue, {props}) =>
                      props.children.props.title.toLowerCase().includes(inputValue.toLowerCase())
                    }
                    disabled={
                      form.getFieldValue(`filter[${blockIndex}].conditions[${index}].comparisonOperator`) === null ||
                      disabled
                    }
                    style={{width: '100%'}}
                    size="small"
                  >
                    {values
                      .filter(val => val.value !== null)
                      .map((val, key) =>
                        <Select.Option key={key} value={val.value}>
                          <span title={val.label}>{val.label}</span>
                        </Select.Option>)
                    }
                  </Select>
                )
                : (
                  <Input
                    disabled={
                      form.getFieldValue(`filter[${blockIndex}].conditions[${index}].comparisonOperator`) === null ||
                      disabled
                    }
                    style={{width: '100%'}}
                    size="small"
                  />
                )
            )}
          </Col>
          <Col span={3}>
            <Button onClick={onDelete} icon="delete" size="small" style={{width: '100%'}} disabled={disabled}/>
          </Col>
        </Fragment>
      )}
    </Call>
  </Row>;

export default translate()(FilterFormBlockCondition);
