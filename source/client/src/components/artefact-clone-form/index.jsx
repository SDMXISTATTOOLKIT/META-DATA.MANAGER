import React from 'react';
import {compose} from 'redux';
import {connect} from "react-redux";
import {translate} from 'react-i18next';
import {Card, Col, Form, Input, Row, Select} from 'antd';
import {MARGIN_MD, SPAN_HALF, SPAN_ONE_THIRD, SPAN_TWO_THIRDS} from "../../styles/constants";
import _ from "lodash";
import {getSdmxTypesTranslations} from "../../constants/getSdmxTypesTranslations";
import {normalizeId} from "../../utils/normalizers";
import {getTypeFromArtefact} from "../../utils/sdmxJson";
import {getLocalizedStr} from "../../middlewares/i18n/utils";
import {DataLanguageConsumer} from "../../contexts/DataLanguage";
import {isVersionValidWithHelp} from "../../utils/artefactValidators";

const mapStateToProps = state => ({
  appLanguage: state.app.language,
  dataLanguages: state.config.dataManagement.dataLanguages
});

const mapPropsToFields = ({destTriplet}) => ({
  id: Form.createFormField({value: destTriplet ? destTriplet.id : null}),
  agencyID: Form.createFormField({value: destTriplet ? destTriplet.agencyID : null}),
  version: Form.createFormField({value: destTriplet ? destTriplet.version : null})
});

const onFieldsChange = (props, fields) =>
  props.onChange(_.mapValues(fields, ({value}) => value));

const formItemLayout = {
  labelCol: {span: SPAN_ONE_THIRD},
  wrapperCol: {span: SPAN_TWO_THIRDS}
};

const ArtefactCloneForm = ({
                             t,
                             form,
                             destTriplet,
                             appLanguage,
                             dataLanguages,
                             agencies,
                             isIdDisabled,
                             isVersionDisabled,
                             srcArtefact
                           }) =>
  <DataLanguageConsumer>
    {dataLanguage => {
      const lang = dataLanguage || appLanguage;
      return (
        <Form>
          <Card
            title={t('components.artefactCloneForm.cards.source.title')}
            size="small"
            type="inner"
            style={{marginBottom: MARGIN_MD}}
          >
            <Row style={{marginBottom: MARGIN_MD}}>
              <Col span={SPAN_HALF}>
                <Form.Item
                  className="form-item-required"
                  label={t('components.artefactCloneForm.artefactType.label')}
                  {...formItemLayout}
                >
                  <Input
                    disabled
                    value={
                      srcArtefact
                        ? getSdmxTypesTranslations(t)[getTypeFromArtefact(srcArtefact)]
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
                  <Input disabled value={srcArtefact ? srcArtefact.id : null}/>
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
                  <Input disabled value={srcArtefact ? srcArtefact.agencyID : null}/>
                </Form.Item>
              </Col>
              <Col span={SPAN_HALF}>
                <Form.Item
                  className="form-item-required"
                  label={t('data.artefact.version.label')}
                  {...formItemLayout}
                >
                  <Input disabled value={srcArtefact ? srcArtefact.version : null}/>
                </Form.Item>
              </Col>
            </Row>
          </Card>
          <Card
            title={t('components.artefactCloneForm.cards.destination.title')}
            size="small"
            type="inner"
          >
            <Row style={{marginBottom: MARGIN_MD}}>
              <Col span={SPAN_HALF}>
                <Form.Item
                  className="form-item-required"
                  label={t('components.artefactCloneForm.artefactType.label')}
                  {...formItemLayout}
                >
                  <Input
                    disabled
                    value={
                      srcArtefact
                        ? getSdmxTypesTranslations(t)[getTypeFromArtefact(srcArtefact)]
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
                  {form.getFieldDecorator("id", {normalize: normalizeId})(<Input disabled={isIdDisabled}/>)}
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
                  {form.getFieldDecorator("agencyID")(
                    <Select
                      showSearch
                      filterOption={(inputValue, {props}) =>
                        props.title.toLowerCase().includes(inputValue.toLowerCase())
                      }
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
                  validateStatus={destTriplet && isVersionValidWithHelp(t, destTriplet.version).help ? "warning" : null}
                  help={destTriplet && isVersionValidWithHelp(t, destTriplet.version).help}
                >
                  {form.getFieldDecorator("version")(
                    <Input title={form.getFieldValue('version')} disabled={isVersionDisabled}/>
                  )}
                </Form.Item>
              </Col>
            </Row>
          </Card>
        </Form>
      )
    }}
  </DataLanguageConsumer>;

export default compose(
  translate(),
  connect(mapStateToProps),
  Form.create({mapPropsToFields, onFieldsChange})
)(ArtefactCloneForm);
