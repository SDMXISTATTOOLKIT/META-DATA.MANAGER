import React from "react";
import {connect} from "react-redux";
import {Link} from "react-router-dom";

const mapStateToProps = state => ({
  isSidebarCollapsed: state.app.isSidebarCollapsed,
});

export const logo = isSidebarCollapsed => (
  <Link
    to='/'
    style={{
      textDecoration: "none",
      cursor: "pointer"
    }}
  >
    <div style={{width: "100%", height: "100%"}}>
      <img
        src={isSidebarCollapsed
          ? "./static/png/istat_logo_mini.png"
          : "./static/png/istat_logo_full.png"
        }
        alt="Logo ISTAT"
        style={{
          height: 32,
          position: "relative",
          verticalAlign: "top",
          top: 8,
          left: 2,
          marginRight: 24,
        }}
      />
    </div>
  </Link>
);

const SidebarHeader = ({
                         isSidebarCollapsed
                       }) =>
  <div
    style={{
      height: 64,
      background: "white",
      paddingLeft: isSidebarCollapsed ? 6 : 22,
      paddingTop: 6
    }}
  >
    {logo(isSidebarCollapsed)}
  </div>;

export default connect(mapStateToProps)(SidebarHeader);
