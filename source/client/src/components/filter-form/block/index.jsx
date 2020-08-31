import React, {Fragment} from 'react';
import FilterFormBlockCondition from './condition';
import {Button, Col, Form, Radio, Row, Select} from 'antd';
import {translate} from 'react-i18next';
import {GUTTER_MD, MARGIN_MD,} from '../../../styles/constants';
import Call from '../../../hocs/call';
import {getNormalizedColumnName} from "../../../utils/normalizers";

const FilterFormBlock = ({
                           t,
                           form,
                           index,
                           conditions,
                           column,
                           columns,
                           onDelete,
                           onConditionAdd,
                           onConditionDelete,
                           disabled
                         }) =>
  <Fragment>
    <Row type="flex" justify="space-between" style={{marginBottom: MARGIN_MD}} gutter={GUTTER_MD}>
      <Col span={9}>
        <Form.Item>
          {form.getFieldDecorator(`filter[${index}].column`)(
            <Select
              showSearch
              filterOption={(inputValue, {props}) =>
                props.title.toLowerCase().includes(inputValue.toLowerCase())
              }
              size="small"
              disabled={disabled}
            >
              {columns !== null
                ? (
                  columns
                    .map((column, columnIndex) =>
                      <Select.Option key={columnIndex} value={column.name} title={getNormalizedColumnName(column.name)}>
                        {getNormalizedColumnName(column.name)}
                      </Select.Option>)
                )
                : null
              }
            </Select>
          )}
        </Form.Item>
      </Col>
      <Col span={15}>
        <Row type="flex" justify="end">
          <Col>
            <Form.Item>
              {form.getFieldDecorator(`filter[${index}].logicalOperator`)(
                <Radio.Group size="small" disabled={disabled}>
                  {['AND', 'OR'].map(op =>
                    <Radio.Button key={op} value={op}>{op}</Radio.Button>)
                  }
                </Radio.Group>
              )}
            </Form.Item>
          </Col>
        </Row>
      </Col>
    </Row>
    <Row type="flex" justify="end" style={{marginBottom: MARGIN_MD}}>
      <Col span={15}>
        <div
          style={
            (conditions !== null && conditions.length > 0 &&
              column !== null && column.values === null)
              ? {marginBottom: MARGIN_MD}
              : null
          }>
          {conditions !== null && conditions.length > 0
            ? (
              <Call
                cb={column !== null && column.fetchValues}
                disabled={column === null || column.fetchValues === null || column.values !== null}
              >
                {column !== null && column.values !== null && (
                  conditions.map((_, conditionIndex) =>
                    <div key={conditionIndex} style={{marginBottom: MARGIN_MD}}>
                      <FilterFormBlockCondition
                        form={form}
                        blockIndex={index}
                        values={column.values}
                        isNumeric={column.isNumeric}
                        index={conditionIndex}
                        onDelete={() => onConditionDelete(conditionIndex)}
                        disabled={disabled}
                      />
                    </div>
                  )
                )
                }
              </Call>
            )
            : null
          }
        </div>
        <Button onClick={onConditionAdd} disabled={column === null || disabled} icon="plus" size="small">
          {t('components.whereConditionsForm.block.addConditionButton')}
        </Button>
      </Col>
    </Row>
    <Row type="flex" justify="space-between" style={{marginTop: MARGIN_MD}}>
      <Col>
        <Button onClick={onDelete} icon="delete" size="small" disabled={disabled}>
          {t('components.whereConditionsForm.block.removeButton')}
        </Button>
      </Col>
    </Row>
  </Fragment>;

export default translate()(FilterFormBlock);
