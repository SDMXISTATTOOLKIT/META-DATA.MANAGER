import {Icon} from "antd";
import React from "react";

const DragHandle = () =>
  <span style={{cursor: "move"}}>
    <Icon type="ellipsis" style={{transform: "rotate(90deg) translate(0px, -4px)"}}/>
    <Icon type="ellipsis" style={{transform: "rotate(90deg) translate(0px, 4px)"}}/>
  </span>;

export default DragHandle;
