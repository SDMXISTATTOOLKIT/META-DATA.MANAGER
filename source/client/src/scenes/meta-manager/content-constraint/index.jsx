import React, {Fragment} from 'react';
import ContentConstraintsList from "./List";
import {connect} from "react-redux";
import ReduxContentConstraintDetailModal from "../../../redux-components/redux-content-constraint-modal";
import {MM_CONTENT_CONSTRAINTS_PREFIX} from "./reducer";

const mapStateToProps = state => ({
  contentConstraintDetail: state.scenes.metaManager.contentConstraints.contentConstraintDetail
});

const ContentConstraints = ({
                              contentConstraintDetail
                            }) =>
  <Fragment>
    <ContentConstraintsList/>
    <ReduxContentConstraintDetailModal
      instancePrefix={MM_CONTENT_CONSTRAINTS_PREFIX}
      instanceState={contentConstraintDetail}
    />
  </Fragment>;

export default connect(mapStateToProps)(ContentConstraints);
