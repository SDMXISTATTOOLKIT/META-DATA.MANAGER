import React from 'react';
import {connect} from "react-redux";
import CKEditor from 'ckeditor4-react';
import './style.css'

const mapStateToProps = state => ({
  appLang: state.app.language
});

export const getConfig = lang => ({
  defaultLanguage: 'en',
  language: lang,
  title: false,
  disableNativeSpellChecker: true,
  toolbar: [
    {name: 'styles', items: ['Format', 'Font', 'FontSize']},
    {name: 'basicstyles', items: ['Bold', 'Italic', 'Underline', 'Strike']},
    {name: 'format', items: ['RemoveFormat']},
    {name: 'colors', items: ['TextColor', 'BGColor']},
    {name: 'insert', items: ['Table']},
    {name: 'links', items: ['Link', 'Unlink']},
    {name: 'paragraph', items: ['NumberedList', 'BulletedList']},
    {name: 'indent', items: ['Outdent', 'Indent']},
    {name: 'justify', items: ['JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock']},
    {name: 'clipboard', items: ['Cut', 'Copy', 'Paste']},
    {name: 'source', items: ['Source']}
  ]
});

class HtmlEditor extends React.Component {

  constructor(props) {
    super(props);
    this.state = HtmlEditor.getInitState(props);
    this.handleEditorChange = this.handleEditorChange.bind(this);
  }

  static getInitState(props) {
    return {
      value: props ? (props.value || '') : ''
    };
  }

  static getDerivedStateFromProps(props) {
    if (props.value !== null && props.value !== undefined) {
      return {
        value: props.value
      };

    } else {
      return HtmlEditor.getInitState(props);
    }
  }

  handleEditorChange(event) {
    const data = event.editor.getData();
    if (this.props.onChange) {
      this.props.onChange(data);
    }
  }

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
        onChange={this.handleEditorChange}
        onBeforeLoad={(CKEDITOR) => (CKEDITOR.disableAutoInline = true)} // needed to fix "Error code: editor-element-conflict."
      />
    )
  }
}

export default connect(mapStateToProps)(HtmlEditor);
