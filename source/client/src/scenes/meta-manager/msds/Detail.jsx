import React from 'react';
import {MODAL_WIDTH_XL} from "../../../styles/constants";
import EnhancedModal from '../../../components/enhanced-modal';
import {compose} from "redux";
import {connect} from "react-redux";
import {translate} from 'react-i18next';
import {
  changeMsdsMsdDetail,
  hideMsdsMsdDetail,
  readMsdsAgencies,
  readMsdsMsdDetail,
  submitMsdsMsdDetail
} from "./actions";
import {Alert, Button} from "antd";
import ArtefactForm, {ARTEFACT_FORM_MODE_EDIT, ARTEFACT_FORM_MODE_READ} from '../../../components/artefact-form';
import Call from "../../../hocs/call";
import {isArtefactValid} from "../../../utils/artefactValidators";

const mapStateToProps = state => ({
  nodes: state.config.nodes,
  nodeId: state.app.endpointId,
  permissions: state.app.user.permissions,
  isVisible: state.scenes.metaManager.msds.isVisible,
  msdTriplet: state.scenes.metaManager.msds.msdTriplet,
  msd: state.scenes.metaManager.msds.msd,
  agencies: state.scenes.metaManager.msds.agencies,
});

const mapDispatchToProps = dispatch => ({
  onMsdDetailHide: () => dispatch(hideMsdsMsdDetail()),
  onMsdDetailChange: fields => dispatch(changeMsdsMsdDetail(fields)),
  onMsdDetailUpdate: (msd, annotationsConfig) => dispatch(submitMsdsMsdDetail(msd, annotationsConfig)),
  fetchMsd: msdTriplet => dispatch(readMsdsMsdDetail(msdTriplet)),
  fetchAgencies: allowedAgencies => dispatch(readMsdsAgencies(allowedAgencies)),
});

const MsdDetail = ({
                     t,
                     nodes,
                     nodeId,
                     permissions,
                     isVisible,
                     msdTriplet,
                     msd,
                     agencies,
                     onMsdDetailHide,
                     onMsdDetailChange,
                     onMsdDetailUpdate,
                     fetchMsd,
                     fetchAgencies,
                   }) => {

  const currentNode = nodes.find(node => node.general.id === nodeId);
  const annotationsConfig = currentNode.annotations;

  const isSubmitDisabled = !isArtefactValid(msd);

  const userHasPermissionsToEdit = (
    permissions && msdTriplet &&
    permissions.agencies.filter(agency => agency === msdTriplet.agencyID).length > 0
  );

  return (
    <Call cb={fetchMsd} cbParam={msdTriplet} disabled={!msdTriplet || !isVisible || msd !== null}>
      <Call cb={fetchAgencies} disabled={!isVisible}>
        <EnhancedModal
          visible={isVisible}
          width={MODAL_WIDTH_XL}
          title={userHasPermissionsToEdit
            ? t('scenes.metaManager.msds.detail.title.editMode.title', {triplet: msdTriplet})
            : t('scenes.metaManager.msds.detail.title.viewMode.title', {triplet: msdTriplet})
          }
          onCancel={onMsdDetailHide}
          footer={
            <div>
              <Button onClick={onMsdDetailHide}>{t('commons.buttons.close.title')}</Button>
              {userHasPermissionsToEdit
                ? (
                  <Button
                    disabled={isSubmitDisabled}
                    type="primary"
                    onClick={() => onMsdDetailUpdate(msd, annotationsConfig)}
                  >
                    {t("commons.buttons.save.title")}
                  </Button>
                )
                : null}
            </div>
          }
          withDataLanguageSelector
        >
          {permissions && !userHasPermissionsToEdit && (
            <Alert
              type="warning"
              showIcon
              message={t('commons.artefact.alerts.hasNotAgencyPermission')}
            />
          )}
          {msd && (
            <ArtefactForm
              artefact={msd}
              mode={userHasPermissionsToEdit ? ARTEFACT_FORM_MODE_EDIT : ARTEFACT_FORM_MODE_READ}
              agencies={agencies}
              onChange={onMsdDetailChange}
              isMsd
            />
          )}
        </EnhancedModal>
      </Call>
    </Call>
  );
};

export default compose(
  translate(),
  connect(mapStateToProps, mapDispatchToProps),
)(MsdDetail);
