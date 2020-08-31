import React from 'react';
import {Modal} from "antd";
import {compose} from "redux";
import {submitRemoveTempTables} from "./actions";
import {connect} from "react-redux";
import {translate} from 'react-i18next';
import Call from "../../../hocs/call";

const mapDispatchToProps = dispatch => ({
  onOk: () => dispatch(submitRemoveTempTables())
});

const RemoveTempTables = ({t, onOk}) =>
  <Call cb={
    () => Modal.confirm({
      title: t('scenes.dataManager.removeTempTables.modal.title'),
      content: t('scenes.dataManager.removeTempTables.modal.content'),
      onOk() {
        onOk();
      },
      cancelText: t('commons.buttons.cancel.title')
    })
  }>
    <span></span>
  </Call>;

export default compose(
  translate(),
  connect(null, mapDispatchToProps)
)(RemoveTempTables);
