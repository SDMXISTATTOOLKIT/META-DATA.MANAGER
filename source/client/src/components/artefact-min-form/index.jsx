import React from 'react';
import {compose} from 'redux';
import {translate} from 'react-i18next';
import {Form, Input, Modal, Select} from 'antd';
import {SPAN_ONE_THIRD, SPAN_TWO_THIRDS} from '../../styles/constants';
import MultilanguageInput from '../multilanguage-input';
import _ from 'lodash';
import {normalizeId} from "../../utils/normalizers";
import {getLocalizedStr} from "../../middlewares/i18n/utils";
import {connect} from "react-redux";
import {DataLanguageConsumer} from "../../contexts/DataLanguage";
import {isVersionValidWithHelp} from "../../utils/artefactValidators";
import {ID_MAX_LEN} from "../../constants/numbers";

const mapStateToProps = state => ({
  appLanguage: state.app.language,
  dataLanguages: state.config.dataManagement.dataLanguages
});

const mapPropsToFields = ({artefact}) => ({
  id: Form.createFormField({value: artefact ? artefact.id : null}),
  agencyID: Form.createFormField({value: artefact ? artefact.agencyID : null}),
  version: Form.createFormField({value: artefact ? artefact.version : null}),
  name: Form.createFormField({value: artefact ? artefact.name : null})
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

export const ARTEFACT_MIN_FORM_MODE_READ = 'ARTEFACT_MIN_FORM_MODE_READ';
export const ARTEFACT_MIN_FORM_MODE_EDIT = 'ARTEFACT_MIN_FORM_MODE_EDIT';
export const ARTEFACT_MIN_FORM_MODE_CREATE = 'ARTEFACT_MIN_FORM_MODE_CREATE';

const ArtefactMinForm = ({
                           t,
                           form,
                           mode = ARTEFACT_MIN_FORM_MODE_READ,
                           agencies,
                           artefact,
                           dataLanguages,
                           appLanguage,
                         }) => {
  return (
    <DataLanguageConsumer>
      {dataLanguage => {
        const language = dataLanguage || appLanguage;
        return (
          <Form>
            <Form.Item
              className={mode === ARTEFACT_MIN_FORM_MODE_CREATE ? 'form-item-required' : null}
              label={t('data.artefact.id.label')}
              {...formItemLayout}
            >
              {form.getFieldDecorator('id', {normalize: normalizeId})(
                <Input
                  title={form.getFieldValue('id')}
                  disabled={mode !== ARTEFACT_MIN_FORM_MODE_CREATE}
                />
              )}
            </Form.Item>
            <Form.Item
              className={mode === ARTEFACT_MIN_FORM_MODE_CREATE ? 'form-item-required' : null}
              label={t('data.artefact.agencyID.label')}
              {...formItemLayout}
            >
              {form.getFieldDecorator('agencyID')(
                <Select
                  showSearch
                  filterOption={(inputValue, {props}) =>
                    props.title.toLowerCase().includes(inputValue.toLowerCase())
                  }
                  title={
                    agencies && form.getFieldValue('agencyID') && (
                      getLocalizedStr((agencies[form.getFieldValue('agencyID')]), language, dataLanguages) ||
                      form.getFieldValue('agencyID')
                    )
                  }
                  disabled={mode !== ARTEFACT_MIN_FORM_MODE_CREATE}
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
            <Form.Item
              className={mode === ARTEFACT_MIN_FORM_MODE_CREATE ? 'form-item-required' : null}
              label={t('data.artefact.version.label')}
              hasFeedback
              validateStatus={artefact && isVersionValidWithHelp(t, artefact.version).help ? "warning" : null}
              help={artefact && isVersionValidWithHelp(t, artefact.version).help}
              {...formItemLayout}
            >
              {form.getFieldDecorator('version')(
                <Input
                  title={form.getFieldValue('version')}
                  disabled={mode !== ARTEFACT_MIN_FORM_MODE_CREATE}
                />
              )}
            </Form.Item>
            <Form.Item
              className={mode !== ARTEFACT_MIN_FORM_MODE_READ ? 'form-item-required' : null}
              label={t('data.artefact.name.label')}
              {...formItemLayout}
            >
              {form.getFieldDecorator('name')(
                <MultilanguageInput
                  title={form.getFieldValue('name')}
                  disabled={mode === ARTEFACT_MIN_FORM_MODE_READ}/>
              )}
            </Form.Item>
          </Form>
        );
      }}
    </DataLanguageConsumer>
  )
};

export default compose(
  translate(),
  connect(mapStateToProps),
  Form.create({mapPropsToFields, onFieldsChange})
)(ArtefactMinForm);
