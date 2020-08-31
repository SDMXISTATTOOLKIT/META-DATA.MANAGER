import React, {Fragment} from 'react';
import {Button, Input} from 'antd';
import 'flag-icon-css/css/flag-icon.css';
import {translate} from 'react-i18next';
import {compose} from 'redux';
import {connect} from 'react-redux';

import "./style.css";
import EnhancedModal from "../enhanced-modal";
import {MODAL_WIDTH_MD} from "../../styles/constants";

const mapStateToProps = state => ({
  appLanguage: state.app.language,
  dataLanguages: state.config.dataManagement.dataLanguages,
  maxDescriptionLength: state.config.dataManagement.maxDescriptionLength
});

/* Based on https://ant.design/components/form/#components-form-demo-customized-form-controls */
class ZoomableTextArea extends React.Component {

  constructor(props) {
    super(props);
    this.state = ZoomableTextArea.getInitState();
    this.callOnChange = this.callOnChange.bind(this);
    this.showModal = this.showModal.bind(this);
    this.hideModal = this.hideModal.bind(this);
  }

  static getInitState() {
    return {
      isModalVisible: false
    };
  }

  callOnChange(value) {
    if (this.props.onChange) {
      this.props.onChange(value);
    }
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
      value,
      disabled,
      singleLine,
      placeholder,
      multilanguage = true
    } = this.props;

    const {
      isModalVisible
    } = this.state;

    return (
      <Fragment>
        <EnhancedModal
          visible={isModalVisible}
          onCancel={this.hideModal}
          footer={
            <Button onClick={this.hideModal} icon="zoom-out">
              {t('commons.buttons.close.title')}
            </Button>
          }
          width={MODAL_WIDTH_MD}
          withDataLanguageSelector={multilanguage}
        >
          <div style={{height: 460}}>
            <Input.TextArea
              placeholder={placeholder}
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
          className="zoomable-textarea__input-group"
          style={{position: "relative", height: "100%"}}
        >
          <Button icon="zoom-in" style={{position: "absolute", height: "100%"}} onClick={this.showModal}/>
          <Input.TextArea
            autosize={
              singleLine
                ? ({
                  minRows: 1,
                  maxRows: 1
                })
                : null
            }
            placeholder={placeholder}
            value={value}
            onChange={e => this.callOnChange(e.target.value)}
            title={value}
            disabled={disabled}
            style={
              {
                width: 'calc(100% - 32px)',
                resize: 'none',
                height: '100%',
                left: 32
              }
            }
          />
        </Input.Group>
      </Fragment>
    );
  }
}

export default compose(
  translate(),
  connect(mapStateToProps)
)(ZoomableTextArea);
