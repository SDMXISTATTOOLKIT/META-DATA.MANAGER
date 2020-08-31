import React from 'react';
import {translate} from 'react-i18next';
import {Icon, Input, Modal, Upload} from 'antd';

/* Based on https://ant.design/components/form/#components-form-demo-customized-form-controls */
class FileInput extends React.Component {

  constructor(props) {
    super(props);
    this.state = FileInput.getInitState();
    this.callOnChange = this.callOnChange.bind(this);
    this.setFile = this.setFile.bind(this);
  }

  static getInitState() {
    return {
      value: null
    };
  }

  static getDerivedStateFromProps(nextProps) {
    return nextProps.value !== null
      ? {value: nextProps.value}
      : FileInput.getInitState();
  }

  callOnChange(value) {
    if (this.props.onChange) {
      this.props.onChange(value);
    }
  }

  setFile(file, isZipAllowed, t) {
    if (!file || file.size < 2147483648) { // 2147483648 bytes = 2 GB
      this.setState({value: file});
      this.callOnChange(file);
    } else {
      Modal.warning({
        title: t('components.fileInput.modals.warning.fileTooBig.title'),
        content: (
          (file.type !== "application/x-zip-compressed" && isZipAllowed)
            ? t('components.fileInput.modals.warning.fileTooBig.zipIt.content')
            : t('components.fileInput.modals.warning.fileTooBig.content')
        )
      });
    }
  }

  render() {

    const {
      t,
      accept,
      disabled,
      isZipAllowed
    } = this.props;

    const {
      value
    } = this.state;

    return (
      <Input
        value={value !== null ? value.name : null}
        onChange={f => f}
        disabled={disabled}
        addonAfter={
          <Upload
            accept={accept}
            customRequest={upload => this.setFile(upload.file, isZipAllowed, t)}
            showUploadList={false}
            style={{cursor: disabled ? 'not-allowed' : 'pointer'}}
            disabled={disabled || value !== null}
          >
            {value !== null
              ? (
                <Icon
                  onClick={
                    disabled
                      ? null
                      : (
                        e => {
                          e.stopPropagation();
                          this.setFile(null, isZipAllowed, t);
                        }
                      )
                  }
                  type="close"
                />
              )
              : <Icon type="paper-clip"/>}
          </Upload>
        }
      />
    );
  }
}

export default translate()(FileInput);
