import React from 'react';

import {Icon, Input} from 'antd';

const iconStyle = {
  cursor: 'pointer'
};

/* Based on https://ant.design/components/form/#components-form-demo-customized-form-controls */
class ListInput extends React.Component {

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

  render() {

    const {
      editTitle,
      onEdit,
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
        addonAfter={
          <Icon type="edit" onClick={onEdit} title={editTitle} style={iconStyle}/>
        }
      />
    );
  }
}

export default ListInput;
