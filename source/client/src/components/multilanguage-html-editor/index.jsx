import React, {Fragment} from 'react';
import {compose} from "redux";
import {translate} from "react-i18next";
import {connect} from "react-redux";
import CKEditor from 'ckeditor4-react';
import {DataLanguageConsumer} from "../../contexts/DataLanguage";
import './style.css'
import {Col, Row, Select} from "antd";
import _ from "lodash";
import {getLanguageFlagIconCss, getLanguageLabel} from "../../utils/languages";
import {getConfig} from "../html-editor";

const mapStateToProps = state => ({
  appLang: state.app.language,
  dataLangs: state.config.dataManagement.dataLanguages
});

class MultilanguageHtmlEditor extends React.Component {

  constructor(props) {
    super(props);
    this.state = MultilanguageHtmlEditor.getInitState(props);
    this.callOnChange = this.callOnChange.bind(this);
    this.setLanguage = this.setLanguage.bind(this);
    this.setValueForLanguage = this.setValueForLanguage.bind(this);
    this.callOnBlur = this.callOnBlur.bind(this);

    if (props.setOnBlur) {
      props.setOnBlur(this.callOnBlur);
    }
  }

  static getInitState(props) {
    return {
      value: _.fromPairs(props.dataLangs.map(({code}) => ([code, '']))),
      language: (_.find(props.dataLangs, ({code}) => code === props.appLang) || {}).code || 'en',
      initialDefaultValue: null
    };
  }

  static getDerivedStateFromProps(props, state) {
    if (props.defaultValue !== null && props.defaultValue !== undefined && state.initialDefaultValue === null) {
      return {
        value: _.merge(MultilanguageHtmlEditor.getInitState(props).value, props.defaultValue),
        initialDefaultValue: props.defaultValue
      };

    } else if (props.value !== null && props.value !== undefined) {
      return {
        value: _.merge(MultilanguageHtmlEditor.getInitState(props).value, props.value)
      };

    } else if (state.initialDefaultValue !== null || (props.defaultValue === null && props.value === undefined)) {
      return state;

    } else {
      return MultilanguageHtmlEditor.getInitState(props);
    }
  }

  callOnChange(value) {
    if (this.props.onChange) {
      this.props.onChange(value);
    }
  }

  callOnBlur() {
    if (this.props.onBlur) {
      this.props.onBlur(this.state.value);
    }
  }

  setLanguage(lang) {
    let state = {...this.state};
    state.language = lang;
    this.setState(state);
    this.callOnChange(state.value);
  }

  setValueForLanguage(event, lang) {
    let state = {...this.state};
    state.value[lang] = event.editor.getData();
    this.setState(state);
    this.callOnChange(state.value);
  }

  render() {

    const {
      value,
      language
    } = this.state;

    const {
      t,
      dataLangs,
      appLang,
      disabled
    } = this.props;

    return (
      <DataLanguageConsumer>
        {contextDataLanguage => {
          const lang = contextDataLanguage || language;
          return (
            <Fragment>
              {!contextDataLanguage && (
                <Row type="flex" justify="end">
                  <Col>
                    <Select
                      value={lang}
                      onChange={this.setLanguage}
                      style={{width: 100}}
                    >
                      {dataLangs.map(({code}) =>
                        <Select.Option
                          key={code}
                          value={code}
                          title={getLanguageLabel(t, code)}
                        >
                          <i
                            className={`flag-icon ${getLanguageFlagIconCss(code, dataLangs)}`}
                            style={{marginRight: 8}}
                          />
                          {code !== null ? code.toUpperCase() : null}
                        </Select.Option>)
                      }
                    </Select>
                  </Col>
                </Row>
              )}
              <CKEditor
                data={value[lang]}
                config={getConfig(appLang)}
                readOnly={disabled || false}
                onChange={event => this.setValueForLanguage(event, lang)}
                onBlur={this.callOnBlur}
                onBeforeLoad={(CKEDITOR) => (CKEDITOR.disableAutoInline = true)} // needed to fix "Error code: editor-element-conflict."
              />
            </Fragment>
          )
        }}
      </DataLanguageConsumer>
    );
  }
}

export default compose(
  translate(),
  connect(mapStateToProps)
)(MultilanguageHtmlEditor);
