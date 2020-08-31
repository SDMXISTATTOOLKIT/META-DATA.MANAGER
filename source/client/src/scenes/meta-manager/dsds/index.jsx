import React, {Fragment} from "react";
import DsdsList from "./List";
import {connect} from 'react-redux';
import ReduxDsdDetailModal from "../../../redux-components/redux-dsd-detail-modal"
import {MM_DSDS_PREFIX} from "./reducer";

const mapStateToProps = state => ({
  dsdDetail: state.scenes.metaManager.dsds.dsdDetail
});

const mapDispatchToProps = dispatch => ({
});

const Dsds = ({
                dsdDetail,
              }) =>
  <Fragment>
    <DsdsList/>
    <ReduxDsdDetailModal
      instancePrefix={MM_DSDS_PREFIX}
      instanceState={dsdDetail}
    />
  </Fragment>;

export default connect(mapStateToProps, mapDispatchToProps)(Dsds);
