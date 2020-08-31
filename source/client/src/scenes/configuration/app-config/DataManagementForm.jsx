import React, {Fragment} from 'react';
import {compose} from 'redux';
import {connect} from "react-redux";
import {translate} from 'react-i18next';
import {Form, Input} from 'antd';
import _ from "lodash";
import {changeAppConfigDataManagementForm} from "./actions";
import {normalizeInt} from "../../../utils/normalizers";
import LanguageForm from "./LanguageForm";
import FormList from "../../../components/form-list";

const mapStateToProps = state => ({
  DataManagement: state.scenes.configuration.appConfig.config.DataManagement
});

const mapDispatchToProps = dispatch => ({
  onChange: fields => dispatch(changeAppConfigDataManagementForm(fields))
});

const mapPropsToFields = ({DataManagement}) => ({
  CubeCodePrefix: Form.createFormField({value: DataManagement !== null ? DataManagement.CubeCodePrefix : null}),
  DataLanguages: Form.createFormField({value: DataManagement !== null ? DataManagement.DataLanguages : null}),
  MaxDescriptionLength: Form.createFormField({value: DataManagement !== null ? DataManagement.MaxDescriptionLength : null})
});

const onFieldsChange = (props, fields) => props.onChange(_.mapValues(fields, ({value}) => value));

const DataManagementForm = ({
                              t,
                              form,
                              DataManagement,
                              onChange
                            }) =>
  <Fragment>
    <Form>
      <Form.Item
        label={t("data.appConfig.dataManagementForm.cubeCodePrefix.label")}
        style={{marginBottom: 0}}
      >
        {form.getFieldDecorator("CubeCodePrefix")(
          <Input
            title={form.getFieldValue("CubeCodePrefix")}
          />
        )}
      </Form.Item>
    </Form>
    <Form.Item
      label={t("data.appConfig.dataManagementForm.dataLanguages.label")}
      className="form-item-required"
      style={{marginBottom: 0}}
    >
      <FormList
        compact
        values={DataManagement ? DataManagement.DataLanguages : null}
        Component={LanguageForm}
        newItem={{
          code: null,
          flag: null
        }}
        minItems={1}
        addItemLabel={t("data.appConfig.dataManagementForm.dataLanguages.buttons.add.label")}
        removeItemLabel={t("data.appConfig.dataManagementForm.dataLanguages.buttons.remove.label")}
        onChange={langs => onChange({DataLanguages: langs})}
      />
    </Form.Item>
    <Form.Item
      label={t("data.appConfig.dataManagementForm.maxDescriptionLength.label")}
      className="form-item-required"
      style={{marginBottom: 0}}
    >
      {form.getFieldDecorator("MaxDescriptionLength", {normalize: normalizeInt})(
        <Input title={form.getFieldValue("MaxDescriptionLength")}/>
      )}
    </Form.Item>
  </Fragment>;

export default compose(
  translate(),
  connect(mapStateToProps, mapDispatchToProps),
  Form.create({mapPropsToFields, onFieldsChange})
)(DataManagementForm);
