import Call from "../../../hocs/call";
import EnhancedModal from "../../../components/enhanced-modal";
import {MARGIN_MD, MODAL_WIDTH_LG} from "../../../styles/constants";
import {Button} from "antd";
import React, {Fragment} from "react";
import _ from "lodash";
import {compose} from "redux";
import {translate} from "react-i18next";
import {connect} from "react-redux";
import ArtefactSummary from "../../../components/artefact-summary";
import {
  hideDsdDetailConceptSchemeForSelector,
  hideDsdDetailConceptSchemesForSelector,
  readDsdDetailConceptSchemeForSelector,
  setDsdDetailConceptSchemeForSelector,
  showDsdDetailConceptSchemeForSelector
} from "../actions";
import {reuseAction} from "../../../utils/reduxReuse";
import ArtefactList from "../../../components/artefact-list";
import ItemList from "../../../components/item-list";

const mapStateToProps = (state, {instanceState}) => ({
  nodes: state.config.nodes,
  endpointId: state.app.endpointId,
  isConceptSchemesForSelectorVisible: instanceState.isConceptSchemesForSelectorVisible,
  conceptSchemeForSelectorTriplet: instanceState.conceptSchemeForSelectorTriplet,
  conceptSchemes: instanceState.conceptSchemes,
  conceptSchemeForSelector: instanceState.conceptSchemeForSelector,
});

const mapDispatchToProps = (dispatch, {instancePrefix}) => ({
  onConceptSchemesForSelectorHide: () => dispatch(reuseAction(hideDsdDetailConceptSchemesForSelector(), instancePrefix)),
  onConceptSchemeForSelectorShow: conceptSchemeTriplet => dispatch(reuseAction(showDsdDetailConceptSchemeForSelector(conceptSchemeTriplet), instancePrefix)),
  onConceptSchemeForSelectorHide: () => dispatch(reuseAction(hideDsdDetailConceptSchemeForSelector(), instancePrefix)),
  onConceptSchemeForSelectorSet: conceptUrn => dispatch(reuseAction(setDsdDetailConceptSchemeForSelector(conceptUrn), instancePrefix)),
  fetchConceptSchemeForSelector: ({conceptSchemeTriplet, itemOrderAnnotationType}) => dispatch(reuseAction(readDsdDetailConceptSchemeForSelector(conceptSchemeTriplet, itemOrderAnnotationType), instancePrefix)),
});

const DsdsConceptSelector = ({
                               t,
                               endpointId,
                               nodes,
                               isConceptSchemesForSelectorVisible,
                               conceptSchemeForSelectorTriplet,
                               conceptSchemes,
                               conceptSchemeForSelector,
                               onConceptSchemesForSelectorHide,
                               onConceptSchemeForSelectorHide,
                               onConceptSchemeForSelectorShow,
                               onConceptSchemeForSelectorSet,
                               fetchConceptSchemeForSelector,
                             }) => {
  const conceptSchemeItemOrderAnnotationType =
    _.find(nodes, node => node.general.id === endpointId).annotations.conceptSchemesOrder;
  return (
    <Fragment>
      <EnhancedModal
        visible={isConceptSchemesForSelectorVisible && conceptSchemes !== null}
        width={MODAL_WIDTH_LG}
        title={t('reduxComponents.dsdDetail.conceptSchemesSelector.title')}
        onCancel={onConceptSchemesForSelectorHide}
        footer={<Button onClick={onConceptSchemesForSelectorHide}>{t('commons.buttons.close.title')}</Button>}
        withDataLanguageSelector
      >
        <ArtefactList
          artefacts={conceptSchemes}
          onRowClick={({id, agencyID, version}) => onConceptSchemeForSelectorShow({id, agencyID, version})}
          getIsDisabledRow={({isFinal}) => !isFinal}
        />
      </EnhancedModal>
      <Call
        cb={fetchConceptSchemeForSelector}
        cbParam={{
          conceptSchemeTriplet: conceptSchemeForSelectorTriplet,
          itemOrderAnnotationType: conceptSchemeItemOrderAnnotationType
        }}
        disabled={conceptSchemeForSelectorTriplet === null}
      >
        <EnhancedModal
          visible={conceptSchemeForSelector !== null}
          width={MODAL_WIDTH_LG}
          title={t('reduxComponents.dsdDetail.conceptSchemeSelector.title')}
          onCancel={onConceptSchemeForSelectorHide}
          footer={<Button onClick={onConceptSchemeForSelectorHide}>{t('commons.buttons.close.title')}</Button>}
          withDataLanguageSelector
        >
          <div style={{marginBottom: MARGIN_MD}}>
            <ArtefactSummary
              id={conceptSchemeForSelectorTriplet && conceptSchemeForSelectorTriplet.id}
              agencyID={conceptSchemeForSelectorTriplet && conceptSchemeForSelectorTriplet.agencyID}
              version={conceptSchemeForSelectorTriplet && conceptSchemeForSelectorTriplet.version}
            />
          </div>
          <ItemList
            data={conceptSchemeForSelector ? conceptSchemeForSelector.concepts : null}
            onRowClick={
              ({id}) =>
                onConceptSchemeForSelectorSet(`urn:sdmx:org.sdmx.infomodel.conceptscheme.Concept=${conceptSchemeForSelectorTriplet.agencyID}:${conceptSchemeForSelectorTriplet.id}(${conceptSchemeForSelectorTriplet.version}).${id}`)
            }
          />
        </EnhancedModal>
      </Call>
    </Fragment>
  );
};

export default compose(
  translate(),
  connect(mapStateToProps, mapDispatchToProps)
)(DsdsConceptSelector);
