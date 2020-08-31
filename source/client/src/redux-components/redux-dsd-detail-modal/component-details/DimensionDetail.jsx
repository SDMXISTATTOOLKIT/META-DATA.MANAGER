import EnhancedModal from "../../../components/enhanced-modal";
import {MODAL_WIDTH_MD} from "../../../styles/constants";
import {Button, Modal} from "antd";
import React, {Fragment} from "react";
import {compose} from "redux";
import {translate} from "react-i18next";
import {connect} from "react-redux";
import {DSD_DIMENSION_TYPE_MEASURE} from "../../../utils/sdmxJson";
import ComponentForm, {DSD_COMPONENT_TYPE_DIMENSION} from "../dsd-detail/ComponentForm";
import {
  ARTEFACT_FORM_MODE_CREATE,
  ARTEFACT_FORM_MODE_EDIT,
  ARTEFACT_FORM_MODE_READ
} from "../../../components/artefact-form";
import {existsComponentWithId} from "../../../utils/artefacts";
import {
  changeDsdDetailDimension,
  hideDsdDetailDimension,
  showDsdDetailCodelistsForSelector,
  showDsdDetailConceptSchemesForSelector,
  showDsdDetailMeasureDimensionConceptSchemesForSelector,
  submitDsdDetailDimension
} from "../actions";
import {reuseAction} from "../../../utils/reduxReuse";

const mapStateToProps = (state, {instanceState}) => ({
  dimension: instanceState.dimension,
  dsdTriplet: instanceState.dsdTriplet,
  dsd: instanceState.dsd,
  isCreatingComponent: instanceState.isCreatingComponent
});

const mapDispatchToProps = (dispatch, {instancePrefix}) => ({
  onCodelistsForSelectorShow: () => dispatch(reuseAction(showDsdDetailCodelistsForSelector(), instancePrefix)),
  onConceptSchemesForSelectorShow: () => dispatch(reuseAction(showDsdDetailConceptSchemesForSelector(), instancePrefix)),
  onMeasureDimensionConceptSchemesForSelectorShow: () => dispatch(reuseAction(showDsdDetailMeasureDimensionConceptSchemesForSelector(), instancePrefix)),
  onHide: () => dispatch(reuseAction(hideDsdDetailDimension(), instancePrefix)),
  onChange: fields => dispatch(reuseAction(changeDsdDetailDimension(fields), instancePrefix)),
  onSubmit: () => dispatch(reuseAction(submitDsdDetailDimension(), instancePrefix)),
});

const DsdsDimensionDetail = ({
                               t,
                               dimension,
                               dsdTriplet,
                               dsd,
                               userHasPermissionsToEdit,
                               onHide,
                               onChange,
                               onSubmit,
                               isCreatingComponent,
                               onCodelistsForSelectorShow,
                               onConceptSchemesForSelectorShow,
                               onMeasureDimensionConceptSchemesForSelectorShow,
                             }) =>
  <EnhancedModal
    visible={dimension !== null}
    width={MODAL_WIDTH_MD}
    title={t('reduxComponents.dsdDetail.dimensionDetail.title')}
    onCancel={onHide}
    footer={
      <Fragment>
        <Button onClick={onHide}>{t('commons.buttons.close.title')}</Button>
        {(dsdTriplet === null || (dsd && !dsd.remoteIsFinal && userHasPermissionsToEdit)) && (
          <Button
            disabled={
              !(
                dimension && dimension.type && dimension.id && dimension.concept &&
                (dimension.type !== DSD_DIMENSION_TYPE_MEASURE || dimension.representation) &&
                (dimension.annotations || []).filter(annot =>
                  annot.id === null || (annot.id !== undefined && annot.id.length === 0) ||
                  annot.type === null || (annot.type !== undefined && annot.type.length === 0)
                ).length === 0
              )
            }
            onClick={
              () =>
                isCreatingComponent && existsComponentWithId(dsd, dimension.id)
                  ? Modal.warning({
                    title: t('reduxComponents.dsdDetail.component.createWarningModal.title'),
                    content: t('reduxComponents.dsdDetail.component.createWarningModal.content')
                  })
                  : onSubmit()
            }
            type="primary"
          >
            {t('commons.buttons.save.title')}
          </Button>
        )}
      </Fragment>
    }
    withDataLanguageSelector
  >
    <ComponentForm
      type={DSD_COMPONENT_TYPE_DIMENSION}
      component={dimension}
      mode={
        isCreatingComponent
          ? ARTEFACT_FORM_MODE_CREATE
          : (
            dsdTriplet === null || (dsd && !dsd.remoteIsFinal && userHasPermissionsToEdit)
              ? ARTEFACT_FORM_MODE_EDIT
              : ARTEFACT_FORM_MODE_READ
          )
      }
      onChange={onChange}
      onCodelistSelect={onCodelistsForSelectorShow}
      onConceptSelect={onConceptSchemesForSelectorShow}
      onConceptSchemeSelect={onMeasureDimensionConceptSchemesForSelectorShow}
    />
  </EnhancedModal>;

export default compose(
  translate(),
  connect(mapStateToProps, mapDispatchToProps)
)(DsdsDimensionDetail);
