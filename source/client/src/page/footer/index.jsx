import React from 'react';
import {Icon, Layout} from 'antd';

import {MARGIN_SM, MARGIN_XS} from "../../styles/constants";

const Footer = () =>
  <Layout.Footer
    style={{
      height: 100,
      textAlign: "center",
      fontSize: 12,
      padding: "16px 24px"
    }}
  >
    <img
      src="./static/png/istat_logo_gray.png"
      alt="Logo ISTAT"
      style={{
        width: 80,
        marginBottom: 4
      }}
    />
    <span
      style={{
        display: "block",
        fontSize: 14,
        fontWeight: "bold"
      }}
    >
      Istituto Nazionale di Statistica
    </span>
    <span style={{marginRight: MARGIN_SM}}>
      <Icon type="environment-o" style={{marginRight: MARGIN_XS}}/>
      Via Cesare Balbo, 16 - 00184 - Roma
    </span>
    <span>
      <Icon
        type="phone"
        style={{
          marginRight: MARGIN_XS,
          transform: "rotate(90deg)"
        }}
      />
      +39 06 46731
    </span>
  </Layout.Footer>;

export default Footer;
