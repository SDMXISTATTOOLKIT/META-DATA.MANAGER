import React from 'react';
import {Button, Card, Form} from 'antd';
import FilterFormBlock from './block';
import {compose} from 'redux';
import {translate} from 'react-i18next';
import {MARGIN_MD, PADDING_MD} from '../../styles/constants';

const mapPropsToFields = ({filter}) => ({
  filter:
    filter
      ? filter.map(block => ({
        column: Form.createFormField({value: block.column}),
        logicalOperator: Form.createFormField({value: block.logicalOperator}),
        conditions:
          block.conditions !== null
            ? block.conditions.map(condition => ({
              comparisonOperator: Form.createFormField({value: condition.comparisonOperator}),
              value: Form.createFormField({value: condition.value})
            }))
            : null
      }))
      : undefined
});

const onFieldsChange = (props, fields) => props.onChange({
  filter: fields.filter.map(block => ({
    column: block.column !== undefined ? block.column.value : undefined,
    logicalOperator: block.logicalOperator !== undefined ? block.logicalOperator.value : undefined,
    conditions: block.conditions !== undefined
      ? block.conditions.map(condition => ({
        comparisonOperator: condition.comparisonOperator !== undefined
          ? condition.comparisonOperator.value
          : undefined,
        value: condition.value !== undefined
          ? condition.value.value
          : undefined,
      }))
      : undefined
  }))
});

const FilterForm = ({
                      t,
                      form,
                      filter,
                      columns,
                      onBlockAdd,
                      onBlockDelete,
                      onBlockConditionAdd,
                      onBlockConditionDelete,
                      disabled
                    }) =>
  <Form>
    {filter && filter.map((block, blockIndex) =>
      <Card
        key={blockIndex}
        type="inner"
        style={{marginBottom: MARGIN_MD}}
        headStyle={{
          paddingLeft: PADDING_MD,
          paddingRight: PADDING_MD
        }}
        bodyStyle={{
          paddingLeft: PADDING_MD,
          paddingRight: PADDING_MD,
        }}
      >
        <FilterFormBlock
          form={form}
          column={
            block.column !== null && columns !== null
              ? columns.filter(({name}) => name === block.column)[0]
              : null
          }
          conditions={block.conditions}
          columns={columns}
          index={blockIndex}
          onDelete={() => onBlockDelete(blockIndex)}
          onConditionAdd={() => onBlockConditionAdd(blockIndex)}
          onConditionDelete={conditionIndex => onBlockConditionDelete(blockIndex, conditionIndex)}
          disabled={disabled}
        />
      </Card>)}
    <Button onClick={onBlockAdd} icon="plus" disabled={columns === null || columns.length === 0 || disabled}>
      {t('components.whereConditionsForm.addBlockButton')}
    </Button>
  </Form>;

export default compose(
  translate(),
  Form.create({
    mapPropsToFields,
    onFieldsChange
  })
)(FilterForm);
