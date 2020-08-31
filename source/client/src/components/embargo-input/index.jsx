import React, {Fragment} from 'react';
import {Card, Form, Modal, Switch, TimePicker} from 'antd';
import {translate} from 'react-i18next';
import LocalizedDatePicker from '../localized-date-picker';
import Call from "../../hocs/call";

/* Based on https://ant.design/components/form/#components-form-demo-customized-form-controls */
class EmbargoInput extends React.Component {

  constructor(props) {
    super(props);
    this.state = EmbargoInput.getInitState();
    this.callOnChange = this.callOnChange.bind(this);
    this.onEnabledChange = this.onEnabledChange.bind(this);
    this.onAutoReleaseDateChange = this.onAutoReleaseDateChange.bind(this);
    this.onAutoReleaseTimeChange = this.onAutoReleaseTimeChange.bind(this);
    this.onAutoReleaseEnabledChange = this.onAutoReleaseEnabledChange.bind(this);
  }

  static getInitState() {
    return {
      value: {
        enabled: false,
        autoReleaseEnabled: false,
        autoReleaseDate: null,
        autoReleaseTime: null
      }
    };
  }

  static getDerivedStateFromProps(nextProps) {
    return nextProps.value !== null
      ? {value: nextProps.value}
      : EmbargoInput.getInitState();
  }

  callOnChange(value) {
    if (this.props.onChange) {
      this.props.onChange(value);
    }
  }

  onAutoReleaseDateChange(value) {
    let state = {...this.state};
    state.value.autoReleaseDate = value;
    this.setState(state);
    this.callOnChange(state.value);
  }

  onAutoReleaseTimeChange(value) {
    let state = {...this.state};
    state.value.autoReleaseTime = value;
    this.setState(state);
    this.callOnChange(state.value);
  }

  onEnabledChange(value) {
    let state = {...this.state};
    state.value.enabled = value;
    if (value === false) {
      state.value.autoReleaseEnabled = false;
      state.value.autoReleaseDate = null;
      state.value.autoReleaseTime = null;
    }
    this.setState(state);
    this.callOnChange(state.value);
  }

  onAutoReleaseEnabledChange(value) {
    let state = {...this.state};
    state.value.autoReleaseEnabled = value;
    this.setState(state);
    this.callOnChange(state.value);
  }

  render() {

    const {
      enabled,
      autoReleaseEnabled,
      autoReleaseDate,
      autoReleaseTime
    } = this.state.value;

    const {
      t,
      disabled
    } = this.props;

    return (
      <Fragment>
        <Card type="inner">
          <Form.Item label={t('components.embargoInput.fields.enabled')}>
            <Switch
              onChange={this.onEnabledChange}
              checked={enabled}
              size="small"
              disabled={disabled}
            />
          </Form.Item>
          {enabled && (
            <Fragment>
              <Form.Item label={t('components.embargoInput.fields.autoReleaseEnabled')}>
                <Switch
                  onChange={this.onAutoReleaseEnabledChange}
                  checked={autoReleaseEnabled}
                  size="small"
                />
              </Form.Item>
              <Form.Item label={t('components.embargoInput.fields.autoReleaseDate')}>
                <LocalizedDatePicker
                  value={autoReleaseDate}
                  onChange={this.onAutoReleaseDateChange}
                  format='DD/MM/YYYY'
                  showToday={false}
                />
              </Form.Item>
              <Form.Item label={t('components.embargoInput.fields.autoReleaseTime')}
              >
                <TimePicker
                  value={autoReleaseTime}
                  onChange={this.onAutoReleaseTimeChange}
                  format='HH:mm'
                  placeholder={t('components.embargoInput.placeholder')}
                  clearText={t('components.embargoInput.clearIcon.title')}
                />
              </Form.Item>
            </Fragment>
          )}
        </Card>
        <Call
          cb={() => {
            Modal.error({title: t('errors.notImplemented')});
            this.onAutoReleaseEnabledChange(false);
          }}
          disabled={autoReleaseEnabled === false}
        >
          <span/>
        </Call>
      </Fragment>
    );
  }
}

export default translate()(EmbargoInput);
