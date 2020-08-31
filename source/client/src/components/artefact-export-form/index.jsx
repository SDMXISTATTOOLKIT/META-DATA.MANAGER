import React, {Fragment} from 'react';
import {MARGIN_MD, SPAN_HALF, SPAN_ONE_THIRD, SPAN_TWO_THIRDS} from "../../styles/constants";
import {Card, Checkbox, Col, Divider, Form, Input, Row, Select} from "antd";
import {compose} from "redux";
import {connect} from "react-redux";
import {translate} from 'react-i18next';
import {getSdmxTypesTranslations} from "../../constants/getSdmxTypesTranslations";
import _ from "lodash";
import {DataLanguageConsumer} from "../../contexts/DataLanguage";
import {getLocalizedStr} from "../../middlewares/i18n/utils";
import {normalizeId} from "../../utils/normalizers";
import {isVersionValidWithHelp} from "../../utils/artefactValidators";

const mapStateToProps = state => ({
  endpoints: state.config.nodes,
  endpointId: state.app.endpointId,
  appLanguage: state.app.language,
  dataLanguages: state.config.dataManagement.dataLanguages
});

const mapPropsToFields = ({destination}) => ({
  endpoint: Form.createFormField({value: destination ? destination.endpoint : null}),
  username: Form.createFormField({value: destination ? destination.username : null}),
  password: Form.createFormField({value: destination ? destination.password : null}),
  id: Form.createFormField({value: destination ? destination.id : null}),
  agencyID: Form.createFormField({value: destination ? destination.agencyID : null}),
  version: Form.createFormField({value: destination ? destination.version : null}),
  withReferences: Form.createFormField({value: destination ? destination.withReferences : null})
});

const formItemLayout = {
  labelCol: {span: SPAN_ONE_THIRD},
  wrapperCol: {span: SPAN_TWO_THIRDS}
};

const onFieldsChange = (props, fields) =>
  props.onChange(_.mapValues(fields, ({value}) => value));

const ArtefactExportForm = ({
                              t,
                              form,
                              destination,
                              agencies,
                              appLanguage,
                              dataLanguages,
                              endpoints,
                              endpointId,
                              type,
                              sourceTriplet,
                              isIdDisabled,
                              isVersionDisabled,
                              withReferences
                            }) =>
  <DataLanguageConsumer>
    {dataLanguage => {
      const lang = dataLanguage || appLanguage;
      return (
        <Fragment>
          <Card
            type="inner"
            title={t('components.exportArtefactForm.cards.source.title')}
            size="small"
            style={{marginBottom: MARGIN_MD}}
          >
            <Row style={{marginBottom: MARGIN_MD}}>
              <Col span={SPAN_HALF}>
                <Form.Item
                  className="form-item-required"
                  label={t('components.exportArtefactForm.artefactType.label')}
                  {...formItemLayout}
                >
                  <Input
                    disabled
                    value={
                      type
                        ? getSdmxTypesTranslations(t)[type]
                        : null
                    }
                  />
                </Form.Item>
              </Col>
              <Col span={SPAN_HALF}>
                <Form.Item
                  className="form-item-required"
                  label={t('data.artefact.id.label')}
                  {...formItemLayout}
                >
                  <Input disabled value={sourceTriplet ? sourceTriplet.id : null}/>
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col span={SPAN_HALF}>
                <Form.Item
                  className="form-item-required"
                  label={t('data.artefact.agencyID.label')}
                  {...formItemLayout}
                >
                  <Select
                    showSearch
                    filterOption={(inputValue, {props}) =>
                      props.title.toLowerCase().includes(inputValue.toLowerCase())
                    }
                    disabled
                    style={{width: "100%"}}
                    title={
                      agencies && sourceTriplet.agencyID &&
                      (getLocalizedStr((agencies[sourceTriplet.agencyID]), lang, dataLanguages) || sourceTriplet.agencyID)
                    }
                    value={sourceTriplet && sourceTriplet.agencyID}
                  >
                    {agencies
                      ? Object.keys(agencies).map((agencyID, index) => {

                        const agencyName = getLocalizedStr(agencies[agencyID], lang, dataLanguages);

                        return (
                          <Select.Option
                            key={index}
                            value={agencyID}
                            title={agencyID && agencyName ? `${agencyID} - ${agencyName}` : agencyID}
                          >
                            {agencyID && agencyName ? `${agencyID} - ${agencyName}` : agencyID}
                          </Select.Option>
                        );
                      })
                      : null
                    }
                  </Select>
                </Form.Item>
              </Col>
              <Col span={SPAN_HALF}>
                <Form.Item
                  className="form-item-required"
                  label={t('data.artefact.version.label')}
                  {...formItemLayout}
                >
                  <Input
                    disabled value={sourceTriplet ? sourceTriplet.version : null}
                    title={sourceTriplet ? sourceTriplet.version : null}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Card>
          <Card
            type="inner"
            size="small"
            title={t('components.exportArtefactForm.cards.destination.title')}
          >
            <Row style={{marginBottom: MARGIN_MD}}>
              <Col span={SPAN_HALF}>
                <Form.Item
                  {...formItemLayout}
                  className="form-item-required"
                  label={t('components.exportArtefactForm.destinationEndpoint.label')}
                >
                  {form.getFieldDecorator('endpoint')(
                    <Select
                      showSearch
                      filterOption={(inputValue, {props}) =>
                        props.title.toLowerCase().includes(inputValue.toLowerCase())
                      }
                      style={{width: "100%"}}
                    >
                      {endpoints
                        .filter(endpoint => endpoint.general.id !== endpointId && endpoint.endpoint.haveDMWS)
                        .map(endpoint =>
                          <Select.Option
                            key={endpoint.general.id}
                            value={endpoint.general.id}
                            title={endpoint.general.name}
                          >
                            {endpoint.general.name}
                          </Select.Option>
                        )}
                    </Select>
                  )}
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col span={SPAN_HALF}>
                <Form.Item
                  className="form-item-required"
                  label={t('components.exportArtefactForm.username.label')}
                  {...formItemLayout}
                >
                  {form.getFieldDecorator('username')(<Input/>)}
                </Form.Item>
              </Col>
              <Col span={SPAN_HALF}>
                <Form.Item
                  className="form-item-required"
                  label={t('components.exportArtefactForm.password.label')}
                  {...formItemLayout}
                >
                  {form.getFieldDecorator('password')(<Input type={"password"} autoComplete="new-password"/>)}
                </Form.Item>
              </Col>
            </Row>
            <Divider/>
            <Row style={{marginBottom: MARGIN_MD}}>
              <Col span={SPAN_HALF}>
                <Form.Item
                  className="form-item-required"
                  label={t('components.exportArtefactForm.artefactType.label')}
                  {...formItemLayout}
                >
                  <Input
                    disabled
                    value={
                      type
                        ? getSdmxTypesTranslations(t)[type]
                        : null
                    }
                  />
                </Form.Item>
              </Col>
              <Col span={SPAN_HALF}>
                <Form.Item
                  className="form-item-required"
                  label={t('data.artefact.id.label')}
                  {...formItemLayout}
                >
                  {form.getFieldDecorator('id', {normalize: normalizeId})(<Input disabled={isIdDisabled}/>)}
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col span={SPAN_HALF}>
                <Form.Item
                  className="form-item-required"
                  label={t('data.artefact.agencyID.label')}
                  {...formItemLayout}
                >
                  {form.getFieldDecorator('agencyID')(
                    <Select
                      showSearch
                      filterOption={(inputValue, {props}) =>
                        props.title.toLowerCase().includes(inputValue.toLowerCase())
                      }
                      style={{width: "100%"}}
                      title={
                        agencies && form.getFieldValue('agencyID') &&
                        (getLocalizedStr((agencies[form.getFieldValue('agencyID')]), lang, dataLanguages) || form.getFieldValue('agencyID'))
                      }
                    >
                      {agencies
                        ? Object.keys(agencies).map((agencyID, index) => {

                          const agencyName = getLocalizedStr(agencies[agencyID], lang, dataLanguages);

                          return (
                            <Select.Option
                              key={index}
                              value={agencyID}
                              title={agencyID && agencyName ? `${agencyID} - ${agencyName}` : agencyID}
                            >
                              {agencyID && agencyName ? `${agencyID} - ${agencyName}` : agencyID}
                            </Select.Option>
                          );
                        })
                        : null
                      }
                    </Select>
                  )}
                </Form.Item>
              </Col>
              <Col span={SPAN_HALF}>
                <Form.Item
                  className="form-item-required"
                  label={t('data.artefact.version.label')}
                  {...formItemLayout}
                  hasFeedback
                  validateStatus={destination && isVersionValidWithHelp(t, destination.version).help ? "warning" : null}
                  help={destination && isVersionValidWithHelp(t, destination.version).help}
                >
                  {form.getFieldDecorator('version')(
                    <Input title={form.getFieldValue('version')} disabled={isVersionDisabled}/>
                  )}
                </Form.Item>
              </Col>
            </Row>
            {
              withReferences && (
                <Row type="flex" justify="end" align="middle" style={{marginTop: MARGIN_MD}}>
                  <Col style={{marginRight: MARGIN_MD}}>
                    {t('components.exportArtefactForm.withReferences.label')}
                  </Col>
                  <Col>
                    <Form.Item>
                      {form.getFieldDecorator('withReferences', {valuePropName: 'checked'})(
                        <Checkbox/>
                      )}
                    </Form.Item>
                  </Col>
                </Row>
              )
            }
          </Card>
        </Fragment>
      );
    }}
  </DataLanguageConsumer>;

export default compose(
  translate(),
  Form.create({mapPropsToFields, onFieldsChange}),
  connect(mapStateToProps)
)(ArtefactExportForm);
