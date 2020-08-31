import React from 'react';
import {Icon} from "antd";

const PingIcon = ({isOk}) =>
  <Icon
    type={isOk ? 'check-circle' : 'close-circle'}
    theme="filled"
    style={{color: isOk ? 'green' : 'red'}}
  />;

export default PingIcon;
