import React, {Fragment} from 'react';
import {Button, Input, Select} from 'antd';
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

const ON_CHANGE_TIMEOUT = 100;

const mapStateToProps = state => ({
  appLang: state.app.language,
  dataLangs: state.config.dataManagement.dataLanguages
});

/* Based on https://ant.design/components/form/#components-form-demo-customized-form-controls */
class DelayedMultilanguageZoomableTextArea extends React.Component {

  constructor(props) {
    super(props);
    this.state = DelayedMultilanguageZoomableTextArea.getInitState(props);
    this.callOnChange = this.callOnChange.bind(this);
    this.setLanguage = this.setLanguage.bind(this);
    this.setValueForLanguage = this.setValueForLanguage.bind(this);
    this.showModal = this.showModal.bind(this);
    this.hideModal = this.hideModal.bind(this);
  }

  static getInitState(props) {
    const emptyValue = _.fromPairs(props.dataLangs.map(({code}) => ([code, ''])));

    return {
      value: _.merge(emptyValue, props.value),
      language: (_.find(props.dataLangs, ({code}) => code === props.appLang) || {}).code || 'en',
      isModalVisible: false,
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

  setValueForLanguage(newValue, language) {
    let state = _.cloneDeep(this.state);
    state.value[language] = newValue;
    this.callOnChange(state.value);
  };

  showModal() {
    this.setState({isModalVisible: true});
  };

  hideModal() {
    this.setState({isModalVisible: false});
  };

  render() {

    const {
      t,
      disabled,
      dataLangs
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
                className="delayed-multilanguage-zoomable-textarea__input-group"
                style={{position: "relative"}}
              >
                <Button icon="zoom-in" style={{position: "absolute", height: "100%"}} onClick={this.showModal}/>
                <Input.TextArea
                  autosize={{maxRows: 3}}
                  value={value[lang]}
                  onChange={e => this.setValueForLanguage(e.target.value, lang)}
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
                            className={`flag-icon ${getLanguageFlagIconCss(lang, dataLangs)}`}
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
  };
}

export default compose(
  translate(),
  connect(mapStateToProps)
)(DelayedMultilanguageZoomableTextArea);
