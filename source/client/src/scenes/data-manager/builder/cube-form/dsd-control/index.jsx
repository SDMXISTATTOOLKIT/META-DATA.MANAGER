import React, {Fragment} from 'react';
import Call from '../../../../../hocs/call';
import Selector from '../../../../../components/selector';
import {MODAL_WIDTH_LG} from '../../../../../styles/constants';
import {compose} from 'redux';
import {connect} from 'react-redux';
import {translate} from 'react-i18next';
import {
  hideBuilderCUbeFormDsdControlDsds,
  readBuilderCubeFormDsdControlDsds,
  setBuilderCubeFormDsdControlDsd,
  showBuilderCubeFormDsdControlDsds,
  unsetBuilderCubeFormDsdControlDsd
} from './actions';
import EnhancedModal from '../../../../../components/enhanced-modal';
import {Button} from "antd";
import {reuseAction} from "../../../../../utils/reduxReuse";
import {DM_BUILDER_CUBE_FORM_PREFIX} from "../reducer";
import {DM_BUILDER_CUBE_FORM_DSD_CONTROL_PREFIX} from "./reducer";
import ReduxdsdDetailModal from "../../../../../redux-components/redux-dsd-detail-modal";
import {showDsdDetail} from "../../../../../redux-components/redux-dsd-detail-modal/actions";
import ArtefactList from "../../../../../components/artefact-list";

const mapStateToProps = state => ({
  cubeId: state.scenes.dataManager.builder.shared.cubeId,
  cube: state.scenes.dataManager.builder.components.cubeForm.shared.cube,
  cubeDsd: state.scenes.dataManager.builder.components.cubeForm.shared.dsd,
  dsds: state.scenes.dataManager.builder.components.cubeForm.components.dsdControl.dsds,
  isDsdsVisible: state.scenes.dataManager.builder.components.cubeForm.components.dsdControl.isDsdsVisible,
  cubeFormDsd: state.scenes.dataManager.builder.components.cubeForm.shared.cubeFormDsd,
  cubeFormDsdControlDsd: state.scenes.dataManager.builder.components.cubeForm.components.dsdControl.cubeFormDsdControlDsd,
});

const mapDispatchToProps = dispatch => ({
  onCubeDsdShow: dsdTriplet => dispatch(reuseAction(showDsdDetail(dsdTriplet), DM_BUILDER_CUBE_FORM_PREFIX)),
  onCubeDsdSet: dsdTriplet => dispatch(setBuilderCubeFormDsdControlDsd(dsdTriplet)),
  onCubeDsdUnset: () => dispatch(unsetBuilderCubeFormDsdControlDsd()),
  onDsdsShow: () => dispatch(showBuilderCubeFormDsdControlDsds()),
  onDsdsHide: () => dispatch(hideBuilderCUbeFormDsdControlDsds()),
  fetchDsds: () => dispatch(readBuilderCubeFormDsdControlDsds()),
  onDetailDsdShow: dsdTriplet => dispatch(reuseAction(showDsdDetail(dsdTriplet), DM_BUILDER_CUBE_FORM_DSD_CONTROL_PREFIX))
});

const BuilderCubeFormDsdControl = ({
                                     t,
                                     form,
                                     cubeId,
                                     cube,
                                     cubeDsd,
                                     dsds,
                                     isDsdsVisible,
                                     cubeFormDsd,
                                     cubeFormDsdControlDsd,
                                     onCubeDsdShow,
                                     onDsdsShow,
                                     onDsdsHide,
                                     onDetailDsdShow,
                                     onCubeDsdSet,
                                     onCubeDsdUnset,
                                     fetchDsds
                                   }) => {
  return (
    <Fragment>
      {cube !== null && cube.DSDCode !== null && (
        <ReduxdsdDetailModal
          instancePrefix={DM_BUILDER_CUBE_FORM_PREFIX}
          instanceState={cubeFormDsd}
        />
      )}
      <EnhancedModal
        visible={isDsdsVisible}
        onCancel={onDsdsHide}
        title={t('scenes.dataManager.builder.cubeForm.dsdControl.dsdList.title')}
        width={MODAL_WIDTH_LG}
        footer={<Button onClick={onDsdsHide}>{t('commons.buttons.close.title')}</Button>}
        withDataLanguageSelector
      >
        <Call cb={fetchDsds}>
          <ArtefactList
            artefacts={dsds}
            onRowClick={onCubeDsdSet}
            getIsDisabledRow={record => !record.isFinal}
            onDetailShow={onDetailDsdShow}
          />
        </Call>
      </EnhancedModal>
      <ReduxdsdDetailModal
        instancePrefix={DM_BUILDER_CUBE_FORM_DSD_CONTROL_PREFIX}
        instanceState={cubeFormDsdControlDsd}
      />
      {form.getFieldDecorator('DSDCode')(
        <Selector
          disabled={cubeId !== null}
          detailTitle={t('scenes.dataManager.builder.cubeForm.dsdControl.detailIcon.title')}
          selectTitle={t('scenes.dataManager.builder.cubeForm.dsdControl.selectIcon.title')}
          resetTitle={t('scenes.dataManager.builder.cubeForm.dsdControl.resetIcon.title')}
          onDetail={() => onCubeDsdShow({
            id: cubeDsd.id,
            agencyID: cubeDsd.agencyID,
            version: cubeDsd.version
          })}
          onSelect={onDsdsShow}
          onReset={onCubeDsdUnset}
        />
      )}
    </Fragment>
  )
};

export default compose(
  translate(),
  connect(mapStateToProps, mapDispatchToProps)
)(BuilderCubeFormDsdControl);
