import React from 'react';
import {Icon, Input} from 'antd';
import "./style.css"

class SearchInput extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      value: props.value || "",
    };
    this.onChange = this.onChange.bind(this);
    this.onSearch = this.onSearch.bind(this);
    this.onClear = this.onClear.bind(this);
  }

  onChange(value) {
    this.setState({
      value: value
    });
  }

  onSearch(value) {
    this.props.onSearch(value)
  }

  onClear() {
    this.setState({
      value: "",
    });
    this.props.onSearch("");
  }

  render() {

    const {
      placeholder
    } = this.props;

    const {
      value
    } = this.state;

    return (
      <div className={"search-input"}>
        <Input
          onChange={({target}) => this.onChange(target.value)}
          placeholder={placeholder}
          value={value}
          suffix={(value !== null && value.length > 0)
            ? (
              <Icon
                type="close-circle"
                theme="filled"
                style={{cursor: "pointer"}}
                onClick={() => this.onClear()}
              />
            )
            : <span/>
          }
          addonAfter={
            <Icon
              type="search"
              style={{cursor: 'pointer'}}
              onClick={() => this.onSearch(value)}
            />
          }
          onPressEnter={() => this.onSearch(value)}
        />
      </div>
    );
  }
}

export default SearchInput;
