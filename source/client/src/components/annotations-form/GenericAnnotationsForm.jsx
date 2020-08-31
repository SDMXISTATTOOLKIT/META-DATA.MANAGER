import React, {Fragment} from "react";
import {Button, Card, Col, Divider, Form, Input, Row} from "antd";
import {MARGIN_MD, SPAN_FULL, SPAN_ONE_QUARTER, SPAN_ONE_THIRD, SPAN_THREE_QUARTERS} from "../../styles/constants";
import {normalizeId} from "../../utils/normalizers";
import MultilanguageZoomableTextArea from "../multilanguage-zoomable-textarea";
import _ from "lodash";
import {compose} from "redux";
import {translate} from "react-i18next";
import CustomEmpty from "../custom-empty";

const formItemLayout = {
  labelCol: {span: 9},
  wrapperCol: {span: 15}
};

const rowStyle = {
  marginBottom: MARGIN_MD,
};

const mapPropsToFields = ({annotations}) => ({
  annotations:
    annotations
      ? annotations.map(annotation => ({
        id: Form.createFormField({value: annotation ? annotation.id : null}),
        title: Form.createFormField({value: annotation ? annotation.title : null}),
        type: Form.createFormField({value: annotation ? annotation.type : null}),
        text: Form.createFormField({value: (annotation && annotation.text) ? annotation.text : null})
      }))
      : null
});

const onFieldsChange = (props, fields) => {
  const newAnnotations = _.cloneDeep(props.annotations);
  !props.disabled && props.onChange({
    annotations: _.merge(newAnnotations, fields.annotations.map(el => _.mapValues(el, ({value}) => value)))
  });
};

const GenericAnnotationsForm = ({
                                  t,
                                  form,
                                  annotations,
                                  disabled,
                                  onChange,
                                  isOneLinePerField
                                }) =>
  <Fragment>
    <div>
      {
        annotations && annotations.length > 0
          ? (
            annotations.map((annotation, index) => {

                const oneLinePerFieldItemLayout = {
                  labelCol: {span: SPAN_ONE_QUARTER},
                  wrapperCol: {span: SPAN_THREE_QUARTERS}
                };

                const idField =
                  <Form.Item
                    label={t("data.annotation.id.label")}
                    {...(isOneLinePerField ? oneLinePerFieldItemLayout : formItemLayout)}
                  >
                    {form.getFieldDecorator(`annotations[${index}].id`, {normalize: normalizeId})(
                      <Input
                        disabled={disabled}
                        title={form.getFieldValue(`annotations[${index}].id`)}
                      />
                    )}
                  </Form.Item>;

                const titleField =
                  <Form.Item
                    label={t("data.annotation.title.label")}
                    {...(isOneLinePerField ? oneLinePerFieldItemLayout : formItemLayout)}
                  >
                    {form.getFieldDecorator(`annotations[${index}].title`)(
                      <Input
                        disabled={disabled}
                        title={form.getFieldValue(`annotations[${index}].title`)}
                      />
                    )}
                  </Form.Item>;

                const typeField =
                  <Form.Item
                    label={t("data.annotation.type.label")}
                    {...(isOneLinePerField ? oneLinePerFieldItemLayout : formItemLayout)}
                  >
                    {form.getFieldDecorator(`annotations[${index}].type`)(
                      <Input
                        disabled={disabled}
                        title={form.getFieldValue(`annotations[${index}].type`)}
                      />
                    )}
                  </Form.Item>;

                const textField =
                  <Form.Item
                    label={t("data.annotation.text.label")}
                    labelCol={{span: isOneLinePerField ? SPAN_ONE_QUARTER : 3}}
                    wrapperCol={{span: isOneLinePerField ? SPAN_THREE_QUARTERS : 21}}
                  >
                    {form.getFieldDecorator(`annotations[${index}].text`)(
                      <MultilanguageZoomableTextArea
                        disabled={disabled}
                        title={form.getFieldValue(`annotations[${index}].text`)}
                      />
                    )}
                  </Form.Item>;

                return (
                  <Card key={index} style={{marginTop: MARGIN_MD}}>
                    {isOneLinePerField
                      ?
                      <Fragment>
                        <Row style={rowStyle}>
                          <Col span={SPAN_FULL}>
                            {idField}
                          </Col>
                        </Row>
                        <Row style={rowStyle}>
                          <Col span={SPAN_FULL}>
                            {titleField}
                          </Col>
                        </Row>
                        <Row style={rowStyle}>
                          <Col span={SPAN_FULL}>
                            {typeField}
                          </Col>
                        </Row>
                        <Row style={rowStyle}>
                          <Col span={SPAN_FULL}>
                            {textField}
                          </Col>
                        </Row>
                      </Fragment>
                      : (
                        <Fragment>
                          <Row style={rowStyle}>
                            <Col span={SPAN_ONE_THIRD}>
                              {idField}
                            </Col>
                            <Col span={SPAN_ONE_THIRD}>
                              {titleField}
                            </Col>
                            <Col span={SPAN_ONE_THIRD}>
                              {typeField}
                            </Col>
                          </Row>
                          <Row type="flex" style={{marginTop: MARGIN_MD, marginRight: 1}}>
                            <Col span={SPAN_FULL}>
                              {textField}
                            </Col>
                          </Row>
                        </Fragment>
                      )
                    }
                    {!disabled && (
                      <Fragment>
                        <Divider/>
                        <Row type="flex" justify="end">
                          <Col>
                            <Button
                              icon="delete"
                              disabled={annotations[index].type === 'NonProductionDataflow'}
                              onClick={
                                () => {
                                  let newAnnotations = _.cloneDeep(annotations);
                                  newAnnotations.splice(index, 1);
                                  return (
                                    onChange({
                                      annotations: newAnnotations
                                    })
                                  )
                                }
                              }
                            >
                              {t("components.annotationsForm.cards.annotations.buttons.remove.title")}
                            </Button>
                          </Col>
                        </Row>
                      </Fragment>
                    )}
                  </Card>
                );
              }
            )
          )
          : <CustomEmpty/>
      }
    </div>
    {!disabled && (
      <Fragment>
        <Divider/>
        <Row type="flex" justify="start">
          <Col>
            <Button
              icon="plus"
              onClick={
                () => {
                  let newAnnotations = _.cloneDeep(annotations);
                  if (!newAnnotations) {
                    newAnnotations = [];
                  }
                  newAnnotations.push({
                    id: null,
                    title: null,
                    type: null,
                    text: null
                  });
                  return (
                    onChange({
                      annotations: newAnnotations
                    })
                  )
                }
              }
            >
              {t("components.annotationsForm.cards.annotations.buttons.add.title")}
            </Button>
          </Col>
        </Row>
      </Fragment>
    )}
  </Fragment>;

export default compose(
  translate(),
  Form.create({mapPropsToFields, onFieldsChange})
)(GenericAnnotationsForm);
