import React from 'react';
import {connect} from "react-redux";
import CKEditor from 'ckeditor4-react';
import './style.css'
import {getConfig} from "../html-editor";

const ON_CHANGE_TIMEOUT = 100;

const mapStateToProps = state => ({
  appLang: state.app.language
});

class DelayedHtmlEditor extends React.Component {

  constructor(props) {
    super(props);
    this.state = DelayedHtmlEditor.getInitState(props);
    this.callOnChange = this.callOnChange.bind(this);
  };

  static getInitState(props) {
    return {
      value: (props.value || ""),
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

  render() {

    const {
      value
    } = this.state;

    const {
      appLang,
      disabled
    } = this.props;

    return (
      <CKEditor
        data={value}
        config={getConfig(appLang)}
        readOnly={disabled || false}
        onChange={event => this.callOnChange(event.editor.getData())}
        onBeforeLoad={(CKEDITOR) => (CKEDITOR.disableAutoInline = true)} // needed to fix "Error code: editor-element-conflict."
      />
    );
  };
}

export default connect(mapStateToProps)(DelayedHtmlEditor);
