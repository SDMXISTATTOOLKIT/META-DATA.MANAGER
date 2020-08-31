import React from 'react';
import {Input, Select} from 'antd';
import 'flag-icon-css/css/flag-icon.css';
import {translate} from 'react-i18next';
import {compose} from 'redux';
import {connect} from 'react-redux';
import _ from 'lodash';
import {DataLanguageConsumer} from "../../contexts/DataLanguage";
import {getLanguageFlagIconCss, getLanguageLabel} from "../../utils/languages";

const mapStateToProps = state => ({
  appLanguage: state.app.language,
  dataLanguages: state.config.dataManagement.dataLanguages,
});

/* Based on https://ant.design/components/form/#components-form-demo-customized-form-controls */
class MultilanguageTagsSelect extends React.Component {

  constructor(props) {
    super(props);
    this.state = MultilanguageTagsSelect.getInitState(props);
    this.callOnChange = this.callOnChange.bind(this);
    this.setLanguage = this.setLanguage.bind(this);
    this.setValueForLanguage = this.setValueForLanguage.bind(this);
  }

  static getInitState(props) {
    return {
      value: _.fromPairs(props.dataLanguages.map(({code}) => ([code, []]))),
      language: (_.find(props.dataLanguages, ({code}) => code === props.appLanguage) || {}).code || 'en',
      isInitialized: false
    };
  }

  static getDerivedStateFromProps(props, state) {

    if (props.value !== null) {

      if (!state.isInitialized) {
        return {
          value: _.merge(state.value, props.value),
          isInitialized: true
        };
      } else {
        return state;
      }

    } else {
      return MultilanguageTagsSelect.getInitState(props);
    }
  }

  callOnChange(value) {
    if (this.props.onChange) {
      this.props.onChange(value);
    }
  }

  setLanguage(lang) {
    let state = {...this.state};
    state.language = lang;
    this.setState(state);
    this.callOnChange(state.value);
  }

  setValueForLanguage(newValue, language) {
    let state = {...this.state};
    state.value[language] = newValue;
    this.setState(state);
    this.callOnChange(state.value);
  }

  render() {

    const {
      t,
      disabled,
      dataLanguages
    } = this.props;

    const {
      value
    } = this.state;

    return (
      <DataLanguageConsumer>
        {contextDataLanguage => {
          const language = contextDataLanguage || this.state.language;
          return (
            <Input.Group compact>
              <Select
                mode="tags"
                value={value[language]}
                onChange={selected => this.setValueForLanguage(selected, language)}
                title={value[language]}
                disabled={disabled}
                style={{width: contextDataLanguage ? '100%' : 'calc(100% - 100px)'}}
              />
              {!contextDataLanguage && (
                <Select
                  value={language}
                  onChange={this.setLanguage}
                  style={{width: 100}}
                >
                  {value && Object.keys(value)
                    .map(lang =>
                      <Select.Option
                        key={lang}
                        value={lang}
                        title={getLanguageLabel(t, lang)}
                      >
                        <i
                          className={`flag-icon ${getLanguageFlagIconCss(lang, dataLanguages)}`}
                          style={{marginRight: 8}}
                        />
                        {lang !== null ? lang.toUpperCase() : null}
                      </Select.Option>)
                  }
                </Select>
              )}
            </Input.Group>
          );
        }}
      </DataLanguageConsumer>
    );
  }
}

export default compose(
  translate(),
  connect(mapStateToProps)
)(MultilanguageTagsSelect);
