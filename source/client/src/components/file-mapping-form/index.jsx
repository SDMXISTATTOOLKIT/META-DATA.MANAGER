import React from 'react';
import {compose} from 'redux';
import {translate} from 'react-i18next';
import {Form, Input} from 'antd';

import {SPAN_ONE_THIRD, SPAN_TWO_THIRDS} from '../../styles/constants';
import MultilanguageInput from '../multilanguage-input';
import FileMappingComponentList from '../file-mapping-component-list';
import './style.css';

const formItemLayout = {
  labelCol: {span: SPAN_ONE_THIRD},
  wrapperCol: {span: SPAN_TWO_THIRDS},
};

const mapPropsToFields = ({fileMapping, cube}) => ({
  name: Form.createFormField({value: fileMapping !== null ? fileMapping.Name : null}),
  description: Form.createFormField({value: fileMapping !== null ? fileMapping.Description : null}),
  cubeId: Form.createFormField({value: cube !== null ? cube.Code : null}),
  cubeName: Form.createFormField({value: cube !== null ? cube.labels : null}),
});

const FileMappingForm = ({
                           t,
                           form,
                           fileMapping
                         }) =>
  <Form>
    <Form.Item label={t('data.fileMapping.name.label')} {...formItemLayout}>
      {form.getFieldDecorator('name')(
        <Input
          disabled
          title={form.getFieldValue('name')}
        />
      )}
    </Form.Item>
    <Form.Item label={t('data.fileMapping.description.label')} {...formItemLayout}>
      {form.getFieldDecorator('description')(
        <Input
          disabled
          title={form.getFieldValue('description')}
        />
      )}
    </Form.Item>
    <Form.Item label={t('data.fileMapping.cube.id.label')} {...formItemLayout}>
      {form.getFieldDecorator('cubeId')(
        <Input
          disabled
          title={form.getFieldValue('cubeId')}
        />
      )}
    </Form.Item>
    <Form.Item label={t('data.fileMapping.cube.name.label')} {...formItemLayout}>
      {form.getFieldDecorator('cubeName')(
        <MultilanguageInput
          disabled
        />
      )}
    </Form.Item>
    <Form.Item
      label={t('data.fileMapping.components.label')}
      className="file-mapping-form__field__components"
      style={{marginBottom: 8}}
    >
      <span/>
    </Form.Item>
    <div style={{height: 200}}>
      <FileMappingComponentList
        value={fileMapping && fileMapping.Components}
        disabled
        columnNameKey="ColumnName"
        cubeComponentCodeKey="CubeComponentCode"
      />
    </div>
  </Form>;

export default compose(
  translate(),
  Form.create({mapPropsToFields})
)(FileMappingForm);
