import React, {Fragment} from 'react';
import {Button, Input} from 'antd';
import 'flag-icon-css/css/flag-icon.css';
import {translate} from 'react-i18next';
import "./style.css";
import EnhancedModal from "../enhanced-modal";
import {MODAL_WIDTH_MD} from "../../styles/constants";

const ON_CHANGE_TIMEOUT = 100;

/* Based on https://ant.design/components/form/#components-form-demo-customized-form-controls */
class DelayedZoomableTextArea extends React.Component {

  constructor(props) {
    super(props);
    this.state = DelayedZoomableTextArea.getInitState(props);
    this.callOnChange = this.callOnChange.bind(this);
    this.showModal = this.showModal.bind(this);
    this.hideModal = this.hideModal.bind(this);
  }

  static getInitState(props) {
    return {
      value: (props.value || ""),
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

  showModal() {
    this.setState({isModalVisible: true});
  };

  hideModal() {
    this.setState({isModalVisible: false});
  };

  render() {

    const {
      t,
      disabled
    } = this.props;

    const {
      value,
      isModalVisible
    } = this.state;

    return (
      <Fragment>
        <EnhancedModal
          visible={isModalVisible}
          onCancel={this.hideModal}
          footer={
            <Button onClick={this.hideModal} icon="zoom-out">
              {t('components.multilanguageZoomableTextarea.modal.close')}
            </Button>
          }
          width={MODAL_WIDTH_MD}
        >
          <div style={{height: 460}}>
            <Input.TextArea
              value={value}
              onChange={e => this.callOnChange(e.target.value)}
              title={value}
              disabled={disabled}
              style={{
                resize: 'none',
                width: "100%",
                height: "100%"
              }}
            />
          </div>
        </EnhancedModal>
        <Input.Group
          compact
          className="delayed-zoomable-textarea__input-group"
          style={{position: "relative", height: '100%'}}
        >
          <Button icon="zoom-in" style={{position: "absolute", height: "100%"}} onClick={this.showModal}/>
          <Input.TextArea
            autosize={{maxRows: 3}}
            value={value}
            onChange={e => this.callOnChange(e.target.value)}
            title={value}
            disabled={disabled}
            style={
              {
                width: 'calc(100% - 32px)',
                height: '100%',
                resize: 'none',
                left: 32
              }
            }
          />
        </Input.Group>
      </Fragment>
    );
  };
}

export default translate()(DelayedZoomableTextArea);
