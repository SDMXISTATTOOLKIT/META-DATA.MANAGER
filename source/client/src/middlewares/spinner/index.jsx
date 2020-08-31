import React from 'react';
import {Icon} from 'antd';
import {connect} from 'react-redux';
import './style.css';
import LoadingOverlay from 'react-loading-overlay';
import {compose} from 'redux';
import {translate} from 'react-i18next';
import {Z_INDEX_SPINNER} from "../../styles/constants";

const mapStateToProps = state => ({
  actions: state.middlewares.spinner.actions
});

const Spinner = ({t, actions, children}) =>
  <LoadingOverlay
    active={actions.length > 0}
    spinner={
      <Icon
        type="loading"
        style={{
          color: 'white',
          fontSize: 32
        }}
      />
    }
    classNamePrefix="spinner_"
    fadeSpeed={300}
    styles={{
      wrapper: base => ({
        ...base,
        width: '100%',
        height: '100%',
        position: 'absolute'
      }),
      overlay: base => ({
        ...base,
        zIndex: Z_INDEX_SPINNER,
        background: 'rgba(0, 0, 0, 0.65)'
      }),
    }}
  >
    {children}
  </LoadingOverlay>;


export default compose(
  translate(),
  connect(mapStateToProps)
)(Spinner);
