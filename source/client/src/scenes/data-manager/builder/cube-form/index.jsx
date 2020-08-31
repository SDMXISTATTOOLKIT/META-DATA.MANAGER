import {Button, Card, Checkbox, Col, Form, Input, Modal, Row} from 'antd';
import React from 'react';
import {MARGIN_MD, SPAN_ONE_THIRD, SPAN_TWO_THIRDS} from '../../../../styles/constants';
import Call from '../../../../hocs/call';
import {changeBuilderCubeForm, readBuilderCubeFormCube, readBuilderCubeFormDsd, submitBuilderCubeForm} from './actions';
import {connect} from 'react-redux';
import {compose} from 'redux';
import {translate} from 'react-i18next';
import MultilanguageInput from '../../../../components/multilanguage-input';
import BuilderCubeFormDsdControl from './dsd-control';
import BuilderCubeFormComponentsControl from './components-control';
import _ from 'lodash';
import {normalizeId} from "../../../../utils/normalizers";
import {ID_MAX_LEN} from "../../../../constants/numbers";

const formItemLayout = {
  labelCol: {span: SPAN_ONE_THIRD},
  wrapperCol: {span: SPAN_TWO_THIRDS}
};

const mapStateToProps = state => ({
  cubeId: state.scenes.dataManager.builder.shared.cubeId,
  cube: state.scenes.dataManager.builder.components.cubeForm.shared.cube,
  cubeCodePrefix: state.config.dataManagement.cubeCodePrefix
});

const mapDispatchToProps = dispatch => ({
  fetchCube: cubeId => dispatch(readBuilderCubeFormCube(cubeId)),
  fetchDsd: dsdCode => dispatch(readBuilderCubeFormDsd(dsdCode)),
  onSubmit: cube => dispatch(submitBuilderCubeForm(cube)),
  onChange: fields => dispatch(changeBuilderCubeForm(fields))
});

const mapPropsToFields = ({cube}) => ({
  Code: Form.createFormField({
    value:
      (cube !== null && cube.Code !== undefined)
        ? cube.Code
        : null
  }),
  labels: Form.createFormField({
    value:
      (cube !== null && cube.labels !== undefined)
        ? cube.labels
        : null
  }),
  DSDCode: Form.createFormField({
    value:
      (cube !== null && cube.DSDCode !== undefined)
        ? cube.DSDCode
        : null
  }),
  observedValueCanBeAlphanumeric: Form.createFormField({
    value:
      (cube !== null && cube.observedValueCanBeAlphanumeric !== undefined)
        ? cube.observedValueCanBeAlphanumeric
        : null
  }),
  cubeComponents: Form.createFormField({
    value:
      (cube !== null && cube.cubeComponents !== undefined)
        ? cube.cubeComponents
        : null
  }),
});

// TODO: prevent multiple changes relative to same value
const onFieldsChange = (props, fields) => {

  const newFields = _.mapValues(fields, ({value}) => value);
  if (newFields.Code && newFields.Code.length > ID_MAX_LEN) {
    Modal.warning({
      title: props.t('commons.alerts.fieldTooLong.title'),
      content: props.t('commons.alerts.fieldTooLong.content', {maxLen: ID_MAX_LEN})
    });
    props.onChange(props.cube);
  } else {
    props.onChange(newFields);
  }
};

const BuilderCubeForm = ({
                           t,
                           form,
                           cubeId,
                           cube,
                           onSubmit,
                           cubeCodePrefix,
                           fetchCube,
                           fetchDsd
                         }) =>
  (cubeId !== null || cube !== null)
    ? (
      <Card type="inner">
        <Call cb={fetchCube} cbParam={cubeId} disabled={cubeId === null}>
          <Form className="advanced-form">
            <Form.Item
              className={cubeId === null ? 'form-item-required' : null}
              label={t('data.cube.id.label')}
              {...formItemLayout}
            >
              {form.getFieldDecorator('Code', {normalize: normalizeId})(
                <Input
                  disabled={cubeId !== null}
                  addonBefore={cubeId === null && cubeCodePrefix}
                  title={form.getFieldValue('Code')}
                />
              )}
            </Form.Item>
            <Form.Item
              className={cubeId === null ? 'form-item-required' : null}
              label={t('data.cube.name.label')}
              {...formItemLayout}
            >
              {form.getFieldDecorator('labels')(<MultilanguageInput disabled={cubeId !== null}/>)}
            </Form.Item>
            <Call cb={fetchDsd} cbParam={cube !== null && cube.DSDCode}
                  disabled={cube === null || cube.DSDCode === null}>
              <Form.Item
                className={cubeId === null ? 'form-item-required' : null}
                label={t('data.cube.dsd.label')}
                {...formItemLayout}
              >
                <BuilderCubeFormDsdControl form={form}/>
              </Form.Item>
              <Row type="flex" justify="end" style={{marginBottom: MARGIN_MD}}>
                <Col>
                  <Form.Item label={t('data.cube.observedValueCanBeAlphanumeric')}>
                    {form.getFieldDecorator('observedValueCanBeAlphanumeric', {
                      valuePropName: 'checked'
                    })(<Checkbox disabled={cubeId !== null}/>)}
                  </Form.Item>
                </Col>
              </Row>
              {cube !== null && cube.DSDCode !== null && (
                <Form.Item
                  className={cubeId === null ? 'form-item-required' : null}
                  label={t('data.cube.components.label')}
                  {...formItemLayout}
                >
                  <Card type="inner" bodyStyle={{
                    maxHeight: 260,
                    overflow: 'auto'
                  }}>
                    <BuilderCubeFormComponentsControl form={form}/>
                  </Card>
                </Form.Item>
              )}
            </Call>
            {cubeId === null && (
              <Form.Item {...formItemLayout}>
                <Button
                  disabled={
                    cube === null || (
                      (cube.Code === undefined || cube.Code === null || cube.Code.length < 1) ||
                      (cube.labels === undefined || cube.labels === null ||
                        _(cube.labels)
                          .pickBy(val => val.length > 0)
                          .keys()
                          .value().length < 1) ||
                      (cube.DSDCode === undefined || cube.DSDCode === null) ||
                      (cube.cubeComponents === undefined || cube.cubeComponents === null)
                    )
                  }
                  type="primary"
                  onClick={
                    () => onSubmit({
                      ...cube,
                      Code: (cubeCodePrefix || '') + cube.Code
                    })
                  }
                >
                  {t('data.cube.saveButton.label')}
                </Button>
              </Form.Item>
            )}
          </Form>
        </Call>
      </Card>
    )
    : null;

export default compose(
  translate(),
  connect(mapStateToProps, mapDispatchToProps),
  Form.create({
    mapPropsToFields,
    onFieldsChange
  })
)(BuilderCubeForm);
