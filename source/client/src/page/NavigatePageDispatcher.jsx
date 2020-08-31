import React from 'react';
import {Prompt} from "react-router-dom";
import {navigatePage} from "./actions";
import {connect} from "react-redux";

const mapDispatchToProps = dispatch => ({
  onNavigatePage: () => dispatch(navigatePage())
});

const NavigatePageDispatcher = ({onNavigatePage}) =>
  <Prompt
    message={
      () => {
        onNavigatePage();
        return null;
      }
    }
  />;

export default connect(null, mapDispatchToProps)(NavigatePageDispatcher);
