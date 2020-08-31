import React from 'react';
import {compose} from "redux";
import {translate} from 'react-i18next';
import {connect} from "react-redux";
import {Modal} from "antd";
import Call from "../../../hocs/call";
import {submitDdbReset} from "./actions";

const mapDispatchToProps = dispatch => ({
  onOk: () => dispatch(submitDdbReset())
});

const DdbReset = ({t, onOk}) =>
  <Call
    cb={() => Modal.confirm({
      title: t('scenes.dataManager.ddbReset.modal.title'),
      content: t('scenes.dataManager.ddbReset.modal.content'),
      onOk() {
        onOk();
      },
      cancelText: t('commons.buttons.cancel.title')
    })}
  >
    <span/>
  </Call>;

export default compose(
  translate(),
  connect(null, mapDispatchToProps)
)(DdbReset);
