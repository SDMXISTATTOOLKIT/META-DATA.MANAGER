import React, {Fragment} from 'react';
import {Button, Input, Modal, Select} from 'antd';
import 'flag-icon-css/css/flag-icon.css';
import {translate} from 'react-i18next';
import {compose} from 'redux';
import {connect} from 'react-redux';
import _ from 'lodash';
import {DataLanguageConsumer} from "../../contexts/DataLanguage";
import {getLanguageFlagIconCss, getLanguageLabel} from "../../utils/languages";

import "./style.css";
import EnhancedModal from "../enhanced-modal";
import {MODAL_WIDTH_MD} from "../../styles/constants";

const mapStateToProps = state => ({
  appLanguage: state.app.language,
  dataLanguages: state.config.dataManagement.dataLanguages,
  maxDescriptionLength: state.config.dataManagement.maxDescriptionLength
});

/* Based on https://ant.design/components/form/#components-form-demo-customized-form-controls */
class MultilanguageZoomableTextArea extends React.Component {

  constructor(props) {
    super(props);
    this.state = MultilanguageZoomableTextArea.getInitState(props);
    this.callOnChange = this.callOnChange.bind(this);
    this.setLanguage = this.setLanguage.bind(this);
    this.setValueForLanguage = this.setValueForLanguage.bind(this);
    this.showModal = this.showModal.bind(this);
    this.hideModal = this.hideModal.bind(this);
    this.callOnBlur = this.callOnBlur.bind(this);
  }

  static getInitState(props) {

    return {
      value: _.fromPairs(props.dataLanguages.map(({code}) => ([code, '']))),
      language: (_.find(props.dataLanguages, ({code}) => code === props.appLanguage) || {}).code || 'en',
      isModalVisible: false,
      initialDefaultValue: null
    };
  }

  static getDerivedStateFromProps(props, state) {

    if (props.defaultValue !== null && props.defaultValue !== undefined && state.initialDefaultValue === null) {
      return {
        value: _.merge(MultilanguageZoomableTextArea.getInitState(props).value, props.defaultValue),
        initialDefaultValue: props.defaultValue
      };

    } else if (props.value !== null && props.value !== undefined) {
      return {
        value: _.merge(MultilanguageZoomableTextArea.getInitState(props).value, props.value)
      };

    } else if (state.initialDefaultValue !== null || (props.defaultValue === null && props.value === undefined)) {
      return state;

    } else {
      return MultilanguageZoomableTextArea.getInitState(props);
    }
  }

  callOnChange(value) {
    if (this.props.onChange) {

      if (this.props.disableMaxLength) {
        this.props.onChange(value);

      } else {
        if (value[this.state.language].length > this.props.maxDescriptionLength) {
          Modal.warning({
            title: this.props.t('commons.alerts.fieldTooLong.title'),
            content: this.props.t('commons.alerts.fieldTooLong.content', {maxLen: this.props.maxDescriptionLength})
          });
        } else {
          this.props.onChange(value);
        }
      }
    }
  }

  callOnBlur() {
    if (this.props.onBlur) {

      if (this.props.disableMaxLength) {
        this.props.onBlur(this.state.value);

      } else {
        if (this.state.value[this.state.language].length > this.props.maxDescriptionLength) {
          Modal.warning({
            title: this.props.t('commons.alerts.fieldTooLong.title'),
            content: this.props.t('commons.alerts.fieldTooLong.content', {maxLen: this.props.maxDescriptionLength})
          });
        } else {
          this.props.onBlur(this.state.value);
        }
      }
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

  showModal() {
    this.setState({isModalVisible: true});
  }

  hideModal() {
    this.setState({isModalVisible: false});
  }

  render() {

    const {
      t,
      disabled,
      dataLanguages,
      singleLine
    } = this.props;

    const {
      value,
      isModalVisible,
      language
    } = this.state;

    return (
      <DataLanguageConsumer>
        {contextDataLanguage => {
          const lang = contextDataLanguage || language;
          return (
            <Fragment>
              <Input.Group
                compact
                className="multilanguage-zoomable-textarea__input-group"
                style={{position: "relative"}}
              >
                <Button icon="zoom-in" style={{position: "absolute", height: "100%"}} onClick={this.showModal}/>
                <Input.TextArea
                  autosize={
                    singleLine
                      ? ({
                        minRows: 1,
                        maxRows: 1
                      })
                      : {maxRows: 3}
                  }                  value={value[lang]}
                  onChange={e => this.setValueForLanguage(e.target.value, lang)}
                  onBlur={this.callOnBlur}
                  title={value[lang]}
                  disabled={disabled}
                  style={
                    {
                      width: contextDataLanguage ? 'calc(100% - 32px)' : 'calc(100% - 132px)',
                      resize: 'none',
                      left: 32
                    }
                  }
                />
                {!contextDataLanguage && (
                  <Select
                    value={lang}
                    onChange={this.setLanguage}
                    style={{width: 100, position: "absolute", height: "100%", right: 0}}
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

              <EnhancedModal
                visible={isModalVisible}
                onCancel={this.hideModal}
                footer={
                  <DataLanguageConsumer>
                    {contextDataLanguage => {
                      const lang = contextDataLanguage || language;
                      return (
                        <Fragment>
                          <Button onClick={() => this.setValueForLanguage("", lang)} icon="delete">
                            {t('components.multilanguageZoomableTextarea.modal.reset')}
                          </Button>
                          <Button onClick={this.hideModal} icon="zoom-out">
                            {t('components.multilanguageZoomableTextarea.modal.close')}
                          </Button>
                        </Fragment>
                      );
                    }}
                  </DataLanguageConsumer>
                }
                width={MODAL_WIDTH_MD}
                withDataLanguageSelector
              >
                <DataLanguageConsumer>
                  {contextDataLanguage => {
                    const lang = contextDataLanguage || language;
                    return (
                      <div style={{height: 460}}>
                        <Input.TextArea
                          value={value[lang]}
                          onChange={e => this.setValueForLanguage(e.target.value, lang)}
                          onBlur={this.callOnBlur}
                          title={value[lang]}
                          disabled={disabled}
                          style={{
                            resize: 'none',
                            width: "100%",
                            height: "100%"
                          }}
                        />
                      </div>
                    );
                  }}
                </DataLanguageConsumer>
              </EnhancedModal>
            </Fragment>
          );
        }}
      </DataLanguageConsumer>
    );
  }
}

export default compose(
  translate(),
  connect(mapStateToProps)
)(MultilanguageZoomableTextArea);
