import EnhancedModal from "../../../components/enhanced-modal";
import {MODAL_WIDTH_MD} from "../../../styles/constants";
import {Button, Modal} from "antd";
import React, {Fragment} from "react";
import {compose} from "redux";
import {translate} from "react-i18next";
import {connect} from "react-redux";
import ComponentForm, {DSD_COMPONENT_TYPE_GROUP} from "../dsd-detail/ComponentForm";
import {
  ARTEFACT_FORM_MODE_CREATE,
  ARTEFACT_FORM_MODE_EDIT,
  ARTEFACT_FORM_MODE_READ
} from "../../../components/artefact-form";
import {existsComponentWithId} from "../../../utils/artefacts";
import {changeDsdDetailGroup, hideDsdDetailGroup, submitDsdDetailGroup} from "../actions";
import {reuseAction} from "../../../utils/reduxReuse";

const mapStateToProps = (state, {instanceState}) => ({
  dsdTriplet: instanceState.dsdTriplet,
  dsd: instanceState.dsd,
  group: instanceState.group,
  isCreatingComponent: instanceState.isCreatingComponent
});

const mapDispatchToProps = (dispatch, {instancePrefix}) => ({
  onHide: () => dispatch(reuseAction(hideDsdDetailGroup(), instancePrefix)),
  onChange: fields => dispatch(reuseAction(changeDsdDetailGroup(fields), instancePrefix)),
  onSubmit: () => dispatch(reuseAction(submitDsdDetailGroup(), instancePrefix)),
});

const DsdsGroupDetail = ({
                           t,
                           group,
                           dsdTriplet,
                           dsd,
                           isCreatingComponent,
                           onHide,
                           onChange,
                           onSubmit,
                           userHasPermissionsToEdit
                         }) =>
  <EnhancedModal
    visible={group !== null}
    width={MODAL_WIDTH_MD}
    title={t('reduxComponents.dsdDetail.groupDetail.title')}
    onCancel={onHide}
    footer={
      <Fragment>
        <Button onClick={onHide}>{t('commons.buttons.close.title')}</Button>
        {(dsdTriplet === null || (dsd && !dsd.remoteIsFinal && userHasPermissionsToEdit)) && (
          <Button
            disabled={!(group && group.id && group.groupDimensions && group.groupDimensions.length)}
            onClick={
              () =>
                isCreatingComponent && existsComponentWithId(dsd, group.id)
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
      type={DSD_COMPONENT_TYPE_GROUP}
      component={group}
      dimensions={dsd && dsd.dimensions}
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
    />
  </EnhancedModal>;

export default compose(
  translate(),
  connect(mapStateToProps, mapDispatchToProps)
)(DsdsGroupDetail);
