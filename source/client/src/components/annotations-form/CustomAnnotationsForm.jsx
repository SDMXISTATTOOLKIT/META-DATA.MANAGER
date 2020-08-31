import React, {Fragment} from "react";
import {Form} from "antd";
import {SPAN_ONE_QUARTER, SPAN_THREE_QUARTERS} from "../../styles/constants";
import MultilanguageZoomableTextArea from "../multilanguage-zoomable-textarea";
import _ from "lodash";
import {compose} from "redux";
import {translate} from "react-i18next";
import CustomEmpty from "../custom-empty";
import {getLocalizedStr} from "../../middlewares/i18n/utils";
import {DataLanguageConsumer} from "../../contexts/DataLanguage";
import {connect} from "react-redux";

const formItemLayout = {
  labelCol: {span: SPAN_ONE_QUARTER},
  wrapperCol: {span: SPAN_THREE_QUARTERS}
};

const mapStateToProps = state => ({
  appLanguage: state.app.language,
  dataLanguages: state.config.dataManagement.dataLanguages
});

const mapPropsToFields = ({typesMap}) => ({
  typesMap:
    typesMap
      ? _.mapValues(typesMap, annot => Form.createFormField({value: annot || null}))
      : {}
});

const onFieldsChange = (props, fields) => {
  const newTypeMap = _.cloneDeep(props.typesMap);
  !props.disabled && props.onChange({
    typesMap: _.merge(newTypeMap, _.mapValues(fields.typesMap, ({value}) => value))
  });
};

const CustomAnnotationsForm = ({
                                 form,
                                 appLanguage,
                                 dataLanguages,
                                 config,
                                 disabled
                               }) => {
  const annotationsToShow = config || [];
  return (
    <DataLanguageConsumer>
      {dataLanguage => {
        const lang = dataLanguage || appLanguage;
        return (
          <Fragment>
            {annotationsToShow.length > 0
              ? (
                annotationsToShow
                  .map(({name, label}, key) =>
                    <Form.Item
                      key={key}
                      label={getLocalizedStr(label, lang, dataLanguages) || name}
                      {...formItemLayout}
                    >
                      {form.getFieldDecorator(`typesMap.${name}`)(
                        <MultilanguageZoomableTextArea disabled={disabled}/>
                      )}
                    </Form.Item>
                  )
              )
              : <CustomEmpty/>
            }
          </Fragment>
        )
      }}
    </DataLanguageConsumer>
  );
};

export default compose(
  translate(),
  Form.create({mapPropsToFields, onFieldsChange}),
  connect(mapStateToProps)
)(CustomAnnotationsForm);
