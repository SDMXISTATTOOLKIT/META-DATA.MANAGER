import EnhancedModal from "../../../components/enhanced-modal";
import {MODAL_WIDTH_MD} from "../../../styles/constants";
import {Button, Modal} from "antd";
import React, {Fragment} from "react";
import {compose} from "redux";
import {translate} from "react-i18next";
import {connect} from "react-redux";
import ComponentForm, {DSD_COMPONENT_TYPE_ATTRIBUTE} from "../dsd-detail/ComponentForm";
import {
  ARTEFACT_FORM_MODE_CREATE,
  ARTEFACT_FORM_MODE_EDIT,
  ARTEFACT_FORM_MODE_READ
} from "../../../components/artefact-form";
import {existsComponentWithId} from "../../../utils/artefacts";
import {
  changeDsdDetailAttribute,
  hideDsdDetailAttribute,
  showDsdDetailCodelistsForSelector,
  showDsdDetailConceptSchemesForSelector,
  submitDsdDetailAttribute
} from "../actions";
import {DSD_ATTRIBUTE_ATTACHMENT_LEVEL_GROUP, DSD_ATTRIBUTE_ATTACHMENT_LEVEL_SERIES} from "../../../utils/sdmxJson";
import {reuseAction} from "../../../utils/reduxReuse";

const mapStateToProps = (state, {instanceState}) => ({
  dsdTriplet: instanceState.dsdTriplet,
  dsd: instanceState.dsd,
  attribute: instanceState.attribute,
  isCreatingComponent: instanceState.isCreatingComponent
});

const mapDispatchToProps = (dispatch, {instancePrefix}) => ({
  onCodelistsForSelectorShow: () => dispatch(reuseAction(showDsdDetailCodelistsForSelector(), instancePrefix)),
  onConceptSchemesForSelectorShow: () => dispatch(reuseAction(showDsdDetailConceptSchemesForSelector(), instancePrefix)),
  onHide: () => dispatch(reuseAction(hideDsdDetailAttribute(), instancePrefix)),
  onChange: fields => dispatch(reuseAction(changeDsdDetailAttribute(fields), instancePrefix)),
  onSubmit: () => dispatch(reuseAction(submitDsdDetailAttribute(), instancePrefix)),
});

const DsdsGroupDetail = ({
                           t,
                           dsdTriplet,
                           dsd,
                           attribute,
                           isCreatingComponent,
                           onHide,
                           onChange,
                           onSubmit,
                           onCodelistsForSelectorShow,
                           onConceptSchemesForSelectorShow,
                           userHasPermissionsToEdit
                         }) =>
  <EnhancedModal
    visible={attribute !== null}
    width={MODAL_WIDTH_MD}
    title={t('reduxComponents.dsdDetail.attributeDetail.title')}
    onCancel={onHide}
    footer={
      <Fragment>
        <Button onClick={onHide}>{t('commons.buttons.close.title')}</Button>
        {(dsdTriplet === null || (dsd && !dsd.remoteIsFinal && userHasPermissionsToEdit)) && (
          <Button
            disabled={
              !(
                attribute && attribute.id && attribute.concept && attribute.assignmentStatus &&
                attribute.attachmentLevel &&
                (
                  attribute.attachmentLevel !== DSD_ATTRIBUTE_ATTACHMENT_LEVEL_GROUP ||
                  attribute.attachmentGroup
                ) &&
                (
                  attribute.attachmentLevel !== DSD_ATTRIBUTE_ATTACHMENT_LEVEL_SERIES ||
                  (attribute.attachedDimensions && attribute.attachedDimensions.length)
                ) &&
                (attribute.annotations || []).filter(annot =>
                  annot.id === null || (annot.id !== undefined && annot.id.length === 0) ||
                  annot.type === null || (annot.type !== undefined && annot.type.length === 0)
                ).length === 0
              )}
            onClick={
              () =>
                isCreatingComponent && existsComponentWithId(dsd, attribute.id)
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
      type={DSD_COMPONENT_TYPE_ATTRIBUTE}
      component={attribute}
      mode={
        isCreatingComponent
          ? ARTEFACT_FORM_MODE_CREATE
          : (
            dsdTriplet === null || (dsd && !dsd.remoteIsFinal && userHasPermissionsToEdit)
              ? ARTEFACT_FORM_MODE_EDIT
              : ARTEFACT_FORM_MODE_READ
          )
      }
      dimensions={dsd && dsd.dimensions}
      groups={dsd && dsd.groups}
      onChange={onChange}
      onCodelistSelect={onCodelistsForSelectorShow}
      onConceptSelect={onConceptSchemesForSelectorShow}
    />
  </EnhancedModal>;

export default compose(
  translate(),
  connect(mapStateToProps, mapDispatchToProps)
)(DsdsGroupDetail);
