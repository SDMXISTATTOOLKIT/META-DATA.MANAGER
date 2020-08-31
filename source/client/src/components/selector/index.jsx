import React from 'react';

import {Icon, Input} from 'antd';

const iconStyle = {
  cursor: 'pointer'
};

/* Based on https://ant.design/components/form/#components-form-demo-customized-form-controls */
class Selector extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      value: null
    };
    this.callOnChange = this.callOnChange.bind(this);
  }

  static getDerivedStateFromProps(nextProps, state) {
    if (nextProps.value !== state.value) {
      return {
        value: nextProps.value
      };
    } else {
      return null;
    }
  }

  callOnChange(value) {
    if (this.props.onChange) {
      this.props.onChange(value);
    }
  }

  //
  // componentDidUpdate(prevProps) {
  //   if (prevProps.value !== this.props.value) {
  //     this.callOnChange(this.props.value);
  //   }
  // }

  render() {

    const {
      disabled,
      detailTitle,
      selectTitle,
      resetTitle,
      onDetail,
      onSelect,
      onReset,
      render,
      size
    } = this.props;

    const {
      value
    } = this.state;

    return (
      <Input
        size={size}
        value={render ? render(value) : value}
        title={render ? render(value) : value}
        onChange={f => f}
        disabled={disabled}
        addonBefore={
          onDetail &&
          value !== null &&
          <Icon type="file-text" onClick={onDetail} title={detailTitle} style={iconStyle}/>
        }
        addonAfter={
          !disabled && (
            value !== null
              ? <Icon type="close" onClick={onReset} title={resetTitle} style={iconStyle}/>
              : <Icon type="plus" onClick={onSelect} title={selectTitle} style={iconStyle}/>
          )
        }
      />
    );
  }
}

export default Selector;
