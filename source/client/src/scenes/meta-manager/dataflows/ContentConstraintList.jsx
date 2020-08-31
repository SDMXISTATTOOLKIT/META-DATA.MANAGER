import React from 'react';
import {hideDataflowsDataflowContentConstraints, readDataflowsDataflowContentConstraints} from "./actions";
import Call from "../../../hocs/call";
import {connect} from "react-redux";
import {compose} from "redux";
import {translate} from 'react-i18next';
import EnhancedModal from '../../../components/enhanced-modal';
import {Button} from "antd";
import {MODAL_WIDTH_LG} from "../../../styles/constants";
import ArtefactList from "../../../components/artefact-list";
import ReduxContentConstraintDetailModal from "../../../redux-components/redux-content-constraint-modal";
import {MM_DATAFLOWS_CC_DETAIL_PREFIX} from "./reducer";
import {reuseAction} from "../../../utils/reduxReuse";
import {showContentConstraintDetail} from "../../../redux-components/redux-content-constraint-modal/actions";

const mapStateToProps = state => ({
  dataflowCCsDataflowTriplet: state.scenes.metaManager.dataflows.dataflowCCsDataflowTriplet,
  dataflowCCsContentConstraints: state.scenes.metaManager.dataflows.dataflowCCsContentConstraints,
  contentConstraintDetail: state.scenes.metaManager.dataflows.contentConstraintDetail,
});

const mapDispatchToProps = dispatch => ({
  onHide: () => dispatch(hideDataflowsDataflowContentConstraints()),
  fetchDataflowsDataflowContentConstraints: dataflowTriplet => dispatch(readDataflowsDataflowContentConstraints(dataflowTriplet)),
  onDetailShow: (contentConstraintTriplet) =>
    dispatch(reuseAction(showContentConstraintDetail(contentConstraintTriplet), MM_DATAFLOWS_CC_DETAIL_PREFIX)),
});

const ContentConstraintList = ({
                                 t,
                                 dataflowCCsDataflowTriplet,
                                 dataflowCCsContentConstraints,
                                 contentConstraintDetail,
                                 onHide,
                                 fetchDataflowsDataflowContentConstraints,
                                 onDetailShow
                               }) =>
  <EnhancedModal
    visible={dataflowCCsDataflowTriplet !== null}
    title={t('scenes.metaManager.dataflows.contentConstraintList.title')}
    onCancel={onHide}
    footer={<Button onClick={onHide}>{t('commons.buttons.close.title')}</Button>}
    width={MODAL_WIDTH_LG}
  >
    <Call
      cb={fetchDataflowsDataflowContentConstraints}
      cbParam={dataflowCCsDataflowTriplet}
      disabled={dataflowCCsDataflowTriplet === null}
    >
      <ArtefactList
        artefacts={dataflowCCsContentConstraints
          ? dataflowCCsContentConstraints.sort((a, b) => (a.id).localeCompare(b.id))
          : dataflowCCsContentConstraints}
        onDetailShow={triplet => onDetailShow(triplet)}
      />
    </Call>
    <ReduxContentConstraintDetailModal
      instancePrefix={MM_DATAFLOWS_CC_DETAIL_PREFIX}
      instanceState={contentConstraintDetail}
    />
  </EnhancedModal>;

export default compose(
  translate(),
  connect(mapStateToProps, mapDispatchToProps)
)(ContentConstraintList);
