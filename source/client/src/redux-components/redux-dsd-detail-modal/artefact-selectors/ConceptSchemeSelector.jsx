import EnhancedModal from "../../../components/enhanced-modal";
import {MODAL_WIDTH_LG} from "../../../styles/constants";
import {Button} from "antd";
import React from "react";
import {compose} from "redux";
import {translate} from "react-i18next";
import {connect} from "react-redux";
import {
  hideDsdDetailMeasureDimensionConceptSchemesForSelector,
  setDsdDetailMeasureDimensionConceptSchemesSelector
} from "../actions";
import {reuseAction} from "../../../utils/reduxReuse";
import ArtefactList from "../../../components/artefact-list";

const mapStateToProps = (state, {instanceState}) => ({
  isMeasureDimensionConceptSchemesForSelectorVisible: instanceState.isMeasureDimensionConceptSchemesForSelectorVisible,
  conceptSchemes: instanceState.conceptSchemes,
});

const mapDispatchToProps = (dispatch, {instancePrefix}) => ({
  onMeasureDimensionConceptSchemesForSelectorHide: () => dispatch(reuseAction(hideDsdDetailMeasureDimensionConceptSchemesForSelector(), instancePrefix)),
  onMeasureDimensionConceptSchemesForSelectorSet: conceptSchemeUrn => dispatch(reuseAction(setDsdDetailMeasureDimensionConceptSchemesSelector(conceptSchemeUrn), instancePrefix)),
});

const DsdsConceptSchemeSelector = ({
                                     t,
                                     isMeasureDimensionConceptSchemesForSelectorVisible,
                                     conceptSchemes,
                                     onMeasureDimensionConceptSchemesForSelectorSet,
                                     onMeasureDimensionConceptSchemesForSelectorHide,
                                   }) =>
  <EnhancedModal
    visible={isMeasureDimensionConceptSchemesForSelectorVisible && conceptSchemes !== null}
    width={MODAL_WIDTH_LG}
    title={t('reduxComponents.dsdDetail.codelistsSelector.title')}
    onCancel={onMeasureDimensionConceptSchemesForSelectorHide}
    footer={<Button
      onClick={onMeasureDimensionConceptSchemesForSelectorHide}>{t('commons.buttons.close.title')}</Button>}
    withDataLanguageSelector
  >
    <ArtefactList
      artefacts={conceptSchemes}
      onRowClick={({urn}) => onMeasureDimensionConceptSchemesForSelectorSet(urn)}
      getIsDisabledRow={({isFinal}) => !isFinal}
    />
  </EnhancedModal>;

export default compose(
  translate(),
  connect(mapStateToProps, mapDispatchToProps)
)(DsdsConceptSchemeSelector);
