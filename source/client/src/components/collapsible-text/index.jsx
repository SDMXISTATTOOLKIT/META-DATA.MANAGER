import React from 'react';
import {Collapse} from "antd";
import "./style.css";

class CollapsibleText extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      collapsed:
        this.props.isCollapsedDefault !== undefined
          ? this.props.isCollapsedDefault
          : true
    };
  }

  render() {

    const text = String(this.props.children);
    const lineBreakMatch = /\r|\n/.exec(text);

    return (
      <div className={`collapsible-text ${!lineBreakMatch ? "collapsible-text--single-line" : ""}`}>
        <Collapse
          bordered={false}
          defaultActiveKey={this.props.isCollapsedDefault ? null : "1"}
          onChange={keys => {
            if (keys.includes("1")) {
              this.setState({collapsed: false});
            } else {
              this.setState({collapsed: true});
            }
          }}
        >
          <Collapse.Panel
            key="1"
            header={
              (() => {
                if (!this.state.collapsed) {
                  return text;
                } else {
                  if (lineBreakMatch) {
                    return text.substr(0, lineBreakMatch.index) + "...";
                  } else {
                    return text
                  }
                }
              })()
            }
            style={{border: 0}}
          />
        </Collapse>
      </div>
    );
  }
}

export default CollapsibleText;
