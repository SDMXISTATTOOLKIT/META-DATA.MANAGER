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

const ON_CHANGE_TIMEOUT = 100;

const mapStateToProps = state => ({
  appLang: state.app.language,
  dataLangs: state.config.dataManagement.dataLanguages
});

class DelayedMultilanguageHtmlEditor extends React.Component {

  constructor(props) {
    super(props);
    this.state = DelayedMultilanguageHtmlEditor.getInitState(props);
    this.callOnChange = this.callOnChange.bind(this);
    this.setLanguage = this.setLanguage.bind(this);
    this.setValueForLanguage = this.setValueForLanguage.bind(this);
  };

  static getInitState(props) {
    const emptyValue = _.fromPairs(props.dataLangs.map(({code}) => ([code, ''])));

    return {
      value: _.merge(emptyValue, props.value),
      language: (_.find(props.dataLangs, ({code}) => code === props.appLang) || {}).code || 'en',
      timeoutId: null
    };
  };

  componentWillUnmount() {
    if (this.state.timeoutId) {
      clearTimeout(this.state.timeoutId);
    }
  };

  callOnChange(value) {
    if (this.props.onChange) {
      if (this.state.timeoutId) {
        clearTimeout(this.state.timeoutId)
      }
      this.setState({
        value: value,
        timeoutId: setTimeout(
          () => {
            this.props.onChange(value);
          },
          ON_CHANGE_TIMEOUT
        ),
      });
    } else {
      this.setState({value: value})
    }
  };

  setLanguage(lang) {
    let state = _.cloneDeep(this.state);
    state.language = lang;
    this.setState(state);
  };

  setValueForLanguage(event, lang) {
    let state = _.cloneDeep(this.state);
    state.value[lang] = event.editor.getData();
    this.callOnChange(state.value);
  };

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
                onBeforeLoad={(CKEDITOR) => (CKEDITOR.disableAutoInline = true)} // needed to fix "Error code: editor-element-conflict."
              />
            </Fragment>
          )
        }}
      </DataLanguageConsumer>
    );
  };
}

export default compose(
  translate(),
  connect(mapStateToProps)
)(DelayedMultilanguageHtmlEditor);
