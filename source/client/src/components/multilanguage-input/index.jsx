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
class MultilanguageInput extends React.Component {

  constructor(props) {
    super(props);
    this.state = MultilanguageInput.getInitState(props);
    this.callOnChange = this.callOnChange.bind(this);
    this.setLanguage = this.setLanguage.bind(this);
    this.setValueForLanguage = this.setValueForLanguage.bind(this);
  }

  static getInitState(props) {
    return {
      value: _.fromPairs(props.dataLanguages.map(({code}) => ([code, '']))),
      language: (_.find(props.dataLanguages, ({code}) => code === props.appLanguage) || {}).code || 'en',
      // isInitialized: false OBSOLETE
    };
  }

  static getDerivedStateFromProps(props) {

    if (props.value !== null && props.value !== undefined) {

      return {
        value: _.merge(MultilanguageInput.getInitState(props).value, props.value),
        // isInitialized: true OBSOLETE
      };

    } else {
      return MultilanguageInput.getInitState(props);
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
      dataLanguages,
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
              <Input
                value={value[language]}
                onChange={e => this.setValueForLanguage(e.target.value, language)}
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
                  {dataLanguages.map(({code}) =>
                    <Select.Option
                      key={code}
                      value={code}
                      title={getLanguageLabel(t, code)}
                    >
                      <i
                        className={`flag-icon ${getLanguageFlagIconCss(code, dataLanguages)}`}
                        style={{marginRight: 8}}
                      />
                      {code !== null ? code.toUpperCase() : null}
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
)(MultilanguageInput);
