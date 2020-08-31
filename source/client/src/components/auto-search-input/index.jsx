import React from 'react';
import {Icon, Input} from 'antd';

const AUTO_SEARCH_INPUT_TIMEOUT = 500;

class AutoSearchInput extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      tempValue: props.value || "",
      value: props.value || "",
      timeout: null
    };
    this.onChange = this.onChange.bind(this);
    this.onClear = this.onClear.bind(this);
  }

  onClear() {
    if (this.state.timeout) {
      clearTimeout(this.state.timeout)
    }
    this.setState({
      tempValue: null,
      value: "",
      timeout: null
    });
    this.props.onSearch("");
  }

  static getDerivedStateFromProps(nextProps, state) {

    if (nextProps.value !== undefined && (nextProps.value !== state.value)) {
      if (state.timeout) {
        clearTimeout(state.timeout)
      }
      return ({
        tempValue: null,
        value: nextProps.value
      });
    } else {
      return null;
    }

  }

  onChange(value) {
    if (this.state.timeout) {
      clearTimeout(this.state.timeout)
    }
    this.setState({
      tempValue: value,
      timeout: setTimeout(
        () => {
          this.setState({
            tempValue: null,
            value
          });
          this.props.onSearch(value);
        },
        AUTO_SEARCH_INPUT_TIMEOUT
      ),
    });
  }

  componentWillUnmount() {
    if (this.state.timeout) {
      clearTimeout(this.state.timeout)
    }
  }

  render() {

    const {
      placeholder
    } = this.props;

    const {
      tempValue,
      value
    } = this.state;

    return (
      <Input
        onChange={({target}) => this.onChange(target.value)}
        placeholder={placeholder}
        value={tempValue !== null ? tempValue : value}
        suffix={
          (value === null || value.length === 0)
            ? <Icon type="search"/>
            : <Icon type="close-circle" theme="filled" onClick={this.onClear} style={{cursor: "pointer"}}/>
        }
      />
    );
  }
}


export default AutoSearchInput;
