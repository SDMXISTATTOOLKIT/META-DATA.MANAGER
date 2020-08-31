import React, {Fragment} from 'react';
import CodelistsList from "./List";
import {connect} from "react-redux";
import ReduxCodelistDetailModal from "../../../redux-components/redux-codelist-detail-modal";
import {MM_CODELISTS_PREFIX} from "./reducer";

const mapStateToProps = state => ({
  codelistDetail: state.scenes.metaManager.codelists.codelistDetail,
});

const Codelists = ({
                     codelistDetail
                   }) =>
  <Fragment>
    <CodelistsList/>
    <ReduxCodelistDetailModal
      instancePrefix={MM_CODELISTS_PREFIX}
      instanceState={codelistDetail}
    />
  </Fragment>;

export default connect(mapStateToProps)(Codelists);
