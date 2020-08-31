import {MODAL_WIDTH_LG} from '../../../../styles/constants';
import Call from '../../../../hocs/call';
import React from 'react';
import {connect} from 'react-redux';
import {hideBuilderDsdList, readBuilderDsdListDsds} from './actions';
import {compose} from 'redux';
import {translate} from 'react-i18next';
import EnhancedModal from '../../../../components/enhanced-modal';
import {Button} from "antd";
import ReduxdsdDetailModal from "../../../../redux-components/redux-dsd-detail-modal";
import {reuseAction} from "../../../../utils/reduxReuse";
import {DM_BUILDER_DSD_LIST_PREFIX} from "./reducer";
import {showDsdDetail} from "../../../../redux-components/redux-dsd-detail-modal/actions";
import ArtefactList from "../../../../components/artefact-list";

const mapStateToProps = state => ({
  dsds: state.scenes.dataManager.builder.components.dsdList.dsds,
  isVisible: state.scenes.dataManager.builder.components.dsdList.isVisible,
  dsdListDsd: state.scenes.dataManager.builder.components.dsdList.dsdListDsd
});

const mapDispatchToProps = dispatch => ({
  onHide: () => dispatch(hideBuilderDsdList()),
  onDsdShow: dsdTriplet => dispatch(reuseAction(showDsdDetail(dsdTriplet), DM_BUILDER_DSD_LIST_PREFIX)),
  fetchDsds: () => dispatch(readBuilderDsdListDsds())
});

const BuilderDsdList = ({
                          t,
                          dsds,
                          dsdListDsd,
                          isVisible,
                          onHide,
                          onDsdShow,
                          fetchDsds
                        }) =>
  <EnhancedModal
    visible={isVisible}
    onCancel={onHide}
    title={t('scenes.dataManager.builder.dsdList.title')}
    width={MODAL_WIDTH_LG}
    footer={<Button onClick={onHide}>{t('commons.buttons.close.title')}</Button>}
    withDataLanguageSelector
  >
    <Call cb={fetchDsds}>
      <ArtefactList
        artefacts={dsds}
        onDetailShow={onDsdShow}
      />
    </Call>

    <ReduxdsdDetailModal
      instancePrefix={DM_BUILDER_DSD_LIST_PREFIX}
      instanceState={dsdListDsd}
    />
  </EnhancedModal>;

export default compose(
  translate(),
  connect(mapStateToProps, mapDispatchToProps)
)(BuilderDsdList);
