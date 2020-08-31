import EnhancedModal from "../../../components/enhanced-modal";
import {MODAL_WIDTH_LG} from "../../../styles/constants";
import {Button} from "antd";
import React from "react";
import {compose} from "redux";
import {translate} from "react-i18next";
import {connect} from "react-redux";
import {hideDsdDetailCodelistsForSelector, setDsdDetailCodelistsForSelector} from "../actions";
import {reuseAction} from "../../../utils/reduxReuse";
import ArtefactList from "../../../components/artefact-list";

const mapStateToProps = (state, {instanceState}) => ({
  isCodelistsForSelectorVisible: instanceState.isCodelistsForSelectorVisible,
  codelists: instanceState.codelists,
});

const mapDispatchToProps = (dispatch, {instancePrefix}) => ({
  onCodelistsForSelectorHide: () => dispatch(reuseAction(hideDsdDetailCodelistsForSelector(), instancePrefix)),
  onCodelistsForSelectorSet: codelistUrn => dispatch(reuseAction(setDsdDetailCodelistsForSelector(codelistUrn), instancePrefix)),
});

const DsdsCodelistSelector = ({
                                t,
                                isCodelistsForSelectorVisible,
                                codelists,
                                onCodelistsForSelectorHide,
                                onCodelistsForSelectorSet,
                              }) =>
  <EnhancedModal
    visible={isCodelistsForSelectorVisible && codelists !== null}
    width={MODAL_WIDTH_LG}
    title={t('reduxComponents.dsdDetail.codelistsSelector.title')}
    onCancel={onCodelistsForSelectorHide}
    footer={<Button onClick={onCodelistsForSelectorHide}>{t('commons.buttons.close.title')}</Button>}
    withDataLanguageSelector
  >
    <ArtefactList
      artefacts={codelists}
      onRowClick={({urn}) => onCodelistsForSelectorSet(urn)}
      getIsDisabledRow={({isFinal}) => !isFinal}
    />
  </EnhancedModal>;

export default compose(
  translate(),
  connect(mapStateToProps, mapDispatchToProps)
)(DsdsCodelistSelector);
