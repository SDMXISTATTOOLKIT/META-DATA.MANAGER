import React, {Component, Fragment} from 'react';
import {compose} from 'redux';
import {translate} from 'react-i18next';
import {Card, Checkbox, Col, Form, Input, Modal, Row, Select} from 'antd';
import {GUTTER_MD, MARGIN_MD, SPAN_FULL, SPAN_HALF, SPAN_ONE_THIRD, SPAN_TWO_THIRDS} from '../../styles/constants';
import MultilanguageInput from '../multilanguage-input';
import _ from 'lodash';
import {normalizeId} from "../../utils/normalizers";
import AnnotationsForm from "../annotations-form";
import LocalizedDatePicker from "../localized-date-picker";
import {getLocalizedStr} from "../../middlewares/i18n/utils";
import {connect} from "react-redux";
import {DataLanguageConsumer} from "../../contexts/DataLanguage";
import {isDateValid, isVersionValidWithHelp} from "../../utils/artefactValidators";
import MultilanguageZoomableTextArea from "../multilanguage-zoomable-textarea";
import {ID_MAX_LEN} from "../../constants/numbers";
import {getGenericAnnotations} from "../../utils/annotations";

const mapStateToProps = state => ({
  appLanguage: state.app.language,
  dataLanguages: state.config.dataManagement.dataLanguages,
  endpoints: state.config.nodes,
  endpointId: state.app.endpointId,
  username: state.app.user.username
});

const mapPropsToFields = ({artefact, DSDInput, MSDInput, isMsd}) => ({
  id: Form.createFormField({value: artefact ? artefact.id : null}),
  agencyID: Form.createFormField({value: artefact ? artefact.agencyID : null}),
  version: Form.createFormField({value: artefact ? artefact.version : null}),
  isFinal: Form.createFormField({value: artefact ? artefact.isFinal : null}),
  uri: Form.createFormField({value: artefact ? artefact.uri : null}),
  urn: Form.createFormField({value: artefact ? artefact.urn : null}),
  validFrom: Form.createFormField({value: artefact ? artefact.validFrom : null}),
  validTo: Form.createFormField({value: artefact ? artefact.validTo : null}),
  name: Form.createFormField({value: artefact ? artefact.name : null}),
  description: Form.createFormField({value: (artefact && artefact.description) ? artefact.description : null}),
  dsd: DSDInput ? Form.createFormField({value: artefact ? artefact.dsd : null}) : undefined,
  msd: MSDInput ? Form.createFormField({value: artefact ? artefact.msd : null}) : undefined,
  customIsPresentational: isMsd ? Form.createFormField({value: artefact ? artefact.customIsPresentational : null}) : undefined
});

const onFieldsChange = (props, fields) => {

  if (props.onChange) {
    const newFields = _.mapValues(fields, ({value}) => value);
    if (newFields.id && newFields.id.length > ID_MAX_LEN) {
      Modal.warning({
        title: props.t('commons.alerts.fieldTooLong.title'),
        content: props.t('commons.alerts.fieldTooLong.content', {maxLen: ID_MAX_LEN})
      });
      props.onChange(props.artefact);
    } else {
      props.onChange(newFields);
    }
  }
};

const formItemLayout = {
  labelCol: {span: SPAN_ONE_THIRD},
  wrapperCol: {span: SPAN_TWO_THIRDS}
};

const datePickerProps = {
  format: 'DD/MM/YYYY'
};

const rowStyle = {
  marginBottom: MARGIN_MD,
  marginLeft: MARGIN_MD,
  marginRight: MARGIN_MD
};

export const ARTEFACT_FORM_MODE_READ = 'ARTEFACT_FORM_MODE_READ';
export const ARTEFACT_FORM_MODE_EDIT = 'ARTEFACT_FORM_MODE_EDIT';
export const ARTEFACT_FORM_MODE_CREATE = 'ARTEFACT_FORM_MODE_CREATE';

class ArtefactForm extends Component {

  constructor(props) {
    super(props);
    this.state = {
      initIsFinal: null
    };
  }

  static getDerivedStateFromProps(nextProps, state) {
    if (state.initIsFinal === null && nextProps.artefact) {
      return {
        initIsFinal: nextProps.artefact.isFinal
      };
    } else if (nextProps.artefact === null) {
      return {
        initIsFinal: null
      };
    } else {
      return null;
    }
  }

  render() {

    const {
      t,
      form,
      mode = ARTEFACT_FORM_MODE_READ,
      isIdDisabled,
      isVersionDisabled,
      isFinalDisabled,
      agencies,
      DSDInput,
      MSDInput,
      artefact,
      onChange,
      dataLanguages,
      appLanguage,
      endpoints,
      endpointId,
      username,
      dsdDimensions,
      dsdAttributes,
      isMsd,
      isDataflow,
      isLayoutAnnotationsFormVisible,
      dataflow,
      dsdForLayoutAnnotations,
      onLayoutAnnotationsFormShow,
      onLayoutAnnotationsFormHide,
      onLayoutAnnotationsFormSubmit,
      onLayoutAnnotationsFormReset,
      fetchDsdForLayoutAnnotations,
      itemsPageForLayoutAnnotations,
      fetchItemsPageForLayoutAnnotations,
      resetItemsPageForLayoutAnnotations
    } = this.props;

    const {
      initIsFinal
    } = this.state;

    return (
      <Fragment>
        <Form>
          <Row gutter={GUTTER_MD} style={rowStyle}>
            <Col span={SPAN_HALF}>
              <Form.Item
                className={mode === ARTEFACT_FORM_MODE_CREATE ? 'form-item-required' : null}
                label={t('data.artefact.id.label')}
                {...formItemLayout}
              >
                {form.getFieldDecorator('id', {
                  normalize: normalizeId
                })(
                  <Input
                    title={form.getFieldValue('id')}
                    disabled={mode !== ARTEFACT_FORM_MODE_CREATE || isIdDisabled}
                  />
                )}
              </Form.Item>
            </Col>
            <Col span={SPAN_HALF}>
              <DataLanguageConsumer>
                {dataLanguage => {
                  const language = dataLanguage || appLanguage;
                  return (
                    <Form.Item
                      className={mode === ARTEFACT_FORM_MODE_CREATE ? 'form-item-required' : null}
                      label={t('data.artefact.agencyID.label')}
                      {...formItemLayout}
                    >
                      {form.getFieldDecorator('agencyID')(
                        <Select
                          showSearch
                          filterOption={(inputValue, {props}) =>
                            props.title.toLowerCase().includes(inputValue.toLowerCase())
                          }
                          disabled={mode !== ARTEFACT_FORM_MODE_CREATE}
                          title={
                            agencies && form.getFieldValue('agencyID') &&
                            (getLocalizedStr((agencies[form.getFieldValue('agencyID')]), language, dataLanguages) || form.getFieldValue('agencyID'))
                          }
                        >
                          {agencies
                            ? Object.keys(agencies).map((agencyID, index) => {

                              const agencyName = getLocalizedStr(agencies[agencyID], language, dataLanguages);

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
                  );
                }}
              </DataLanguageConsumer>
            </Col>
          </Row>
          <Row gutter={GUTTER_MD} style={rowStyle}>
            <Col span={SPAN_HALF}>
              <Form.Item
                className={mode === ARTEFACT_FORM_MODE_CREATE ? 'form-item-required' : null}
                label={t('data.artefact.version.label')}
                hasFeedback
                validateStatus={artefact && isVersionValidWithHelp(t, artefact.version).help ? "warning" : null}
                help={artefact && isVersionValidWithHelp(t, artefact.version).help}
                {...formItemLayout}
              >
                {form.getFieldDecorator('version')(
                  <Input
                    title={form.getFieldValue('version')}
                    disabled={mode !== ARTEFACT_FORM_MODE_CREATE || isVersionDisabled}
                  />
                )}
              </Form.Item>
            </Col>
            <Col span={SPAN_HALF}>
              <Form.Item label={t('data.artefact.isFinal.label')} {...formItemLayout}>
                {form.getFieldDecorator('isFinal', {valuePropName: 'checked'})(
                  <Checkbox
                    disabled={
                      mode === ARTEFACT_FORM_MODE_READ ||
                      (mode === ARTEFACT_FORM_MODE_EDIT && initIsFinal === true) ||
                      isFinalDisabled
                    }
                  />
                )}
              </Form.Item>
            </Col>
          </Row>
          {
            DSDInput && (
              <Row gutter={GUTTER_MD} style={rowStyle}>
                <Col span={SPAN_HALF}>
                  <Form.Item
                    className={mode === ARTEFACT_FORM_MODE_CREATE ? 'form-item-required' : null}
                    label={t('data.artefact.dsd.label')}
                    {...formItemLayout}
                  >
                    {form.getFieldDecorator('dsd')(
                      DSDInput
                    )}
                  </Form.Item>
                </Col>
              </Row>
            )
          }
          {
            MSDInput && (
              <Row gutter={GUTTER_MD} style={rowStyle}>
                <Col span={SPAN_HALF}>
                  <Form.Item
                    className={mode === ARTEFACT_FORM_MODE_CREATE ? 'form-item-required' : null}
                    label={t('data.artefact.msd.label')}
                    {...formItemLayout}
                  >
                    {form.getFieldDecorator('msd')(
                      MSDInput
                    )}
                  </Form.Item>
                </Col>
              </Row>
            )
          }
          <Row gutter={GUTTER_MD} style={rowStyle}>
            <Col span={SPAN_HALF}>
              <Form.Item label={t('data.artefact.uri.label')}{...formItemLayout}>
                {form.getFieldDecorator('uri')(
                  <Input disabled={mode === ARTEFACT_FORM_MODE_READ}
                         title={form.getFieldValue('uri')}/>
                )}
              </Form.Item>
            </Col>
            <Col span={SPAN_HALF}>
              <Form.Item label={t('data.artefact.urn.label')}{...formItemLayout}>
                {form.getFieldDecorator('urn')(<Input disabled title={form.getFieldValue('urn')}/>)}
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={GUTTER_MD} style={rowStyle}>
            <Col span={SPAN_HALF}>
              <Form.Item label={t('data.artefact.validFrom.label')}{...formItemLayout}>
                {form.getFieldDecorator('validFrom')(
                  <LocalizedDatePicker disabled={mode === ARTEFACT_FORM_MODE_READ} {...datePickerProps}/>
                )}
              </Form.Item>
            </Col>
            <Col span={SPAN_HALF}>
              <Form.Item
                label={t('data.artefact.validTo.label')}
                {...formItemLayout}
                hasFeedback
                validateStatus={artefact && !isDateValid(artefact.validFrom, artefact.validTo) ? "warning" : null}
                help={artefact && !isDateValid(artefact.validFrom, artefact.validTo) ? t("commons.helps.invalidDateRange.label") : null}
              >
                {form.getFieldDecorator('validTo')(
                  <LocalizedDatePicker disabled={mode === ARTEFACT_FORM_MODE_READ} {...datePickerProps}/>
                )}
              </Form.Item>
            </Col>
          </Row>
          <Card type="inner" bodyStyle={{paddingLeft: 19, paddingRight: 22}}>
            <Row type="flex" gutter={GUTTER_MD} style={{marginBottom: MARGIN_MD}}>
              <Col span={SPAN_FULL}>
                <Form.Item
                  className={mode !== ARTEFACT_FORM_MODE_READ ? 'form-item-required' : null}
                  label={t('data.artefact.name.label')}
                  labelCol={{span: 4}}
                  wrapperCol={{span: 20}}
                >
                  {form.getFieldDecorator('name')(
                    <MultilanguageInput disabled={mode === ARTEFACT_FORM_MODE_READ}/>
                  )}
                </Form.Item>
              </Col>
            </Row>
            <Row type="flex" gutter={GUTTER_MD}>
              <Col span={SPAN_FULL}>
                <Form.Item
                  label={t('data.artefact.description.label')}
                  labelCol={{span: 4}}
                  wrapperCol={{span: 20}}
                >
                  {form.getFieldDecorator('description')(
                    <MultilanguageZoomableTextArea disabled={mode === ARTEFACT_FORM_MODE_READ}/>
                  )}
                </Form.Item>
              </Col>
            </Row>
          </Card>
          {isMsd && (
            <Row type="flex" justify="end" align="middle" gutter={GUTTER_MD} style={{margin: "16px 16px 0"}}>
              <Col>
                {t('data.artefact.isAttributeWithChildrenPresentational.label') + ':'}
              </Col>
              <Col>
                <Form.Item>
                  {form.getFieldDecorator('customIsPresentational', {valuePropName: 'checked'})(
                    <Checkbox disabled={mode === ARTEFACT_FORM_MODE_READ}/>
                  )}
                </Form.Item>
              </Col>
            </Row>
          )}
        </Form>
        {
          (
            mode === ARTEFACT_FORM_MODE_READ && (
              !artefact || !artefact.annotations ||
              (username && artefact.annotations.length === 0) ||
              (username === null && getGenericAnnotations(
                artefact.annotations,
                endpoints.filter(endpoint => endpoint.general.id === endpointId)[0].annotationTabs.tabs,
                endpoints.find(endpoint => endpoint.general.id === endpointId).annotations
              ).length === 0)
            )
          )
            ? null
            : (
              <AnnotationsForm
                annotations={artefact ? artefact.annotations : null}
                onChange={onChange}
                disabled={mode === ARTEFACT_FORM_MODE_READ}
                dsdDimensions={dsdDimensions}
                dsdAttributes={dsdAttributes}
                isDataflow={isDataflow}
                isLayoutAnnotationsFormVisible={isLayoutAnnotationsFormVisible}
                dataflow={dataflow}
                dsdForLayoutAnnotations={dsdForLayoutAnnotations}
                onLayoutAnnotationsFormShow={onLayoutAnnotationsFormShow}
                onLayoutAnnotationsFormHide={onLayoutAnnotationsFormHide}
                onLayoutAnnotationsFormSubmit={onLayoutAnnotationsFormSubmit}
                onLayoutAnnotationsFormReset={onLayoutAnnotationsFormReset}
                fetchDsdForLayoutAnnotations={fetchDsdForLayoutAnnotations}
                itemsPageForLayoutAnnotations={itemsPageForLayoutAnnotations}
                fetchItemsPageForLayoutAnnotations={fetchItemsPageForLayoutAnnotations}
                resetItemsPageForLayoutAnnotations={resetItemsPageForLayoutAnnotations}
              />
            )
        }
      </Fragment>
    );
  }
}

export default compose(
  translate(),
  connect(mapStateToProps),
  Form.create({mapPropsToFields, onFieldsChange})
)(ArtefactForm);
