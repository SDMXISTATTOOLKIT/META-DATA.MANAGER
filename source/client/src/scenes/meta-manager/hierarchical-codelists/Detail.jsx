import React from 'react';
import {MODAL_WIDTH_XL} from "../../../styles/constants";
import EnhancedModal from '../../../components/enhanced-modal';
import {compose} from "redux";
import {connect} from "react-redux";
import {translate} from 'react-i18next';
import {
  changeHierarchicalCodelistsHierarchicalCodelistDetail,
  hideHierarchicalCodelistsHierarchicalCodelistDetail,
  readHierarchicalCodelistsAgencies,
  readHierarchicalCodelistsHierarchicalCodelistDetail,
  submitHierarchicalCodelistsHierarchicalCodelistDetail
} from "./actions";
import {Alert, Button} from "antd";
import ArtefactForm, {ARTEFACT_FORM_MODE_EDIT, ARTEFACT_FORM_MODE_READ} from '../../../components/artefact-form';
import Call from "../../../hocs/call";
import {isArtefactValid} from "../../../utils/artefactValidators";

const mapStateToProps = state => ({
  nodes: state.config.nodes,
  nodeId: state.app.endpointId,
  permissions: state.app.user.permissions,
  isVisible: state.scenes.metaManager.hierarchicalCodelists.isVisible,
  hierarchicalCodelistTriplet: state.scenes.metaManager.hierarchicalCodelists.hierarchicalCodelistTriplet,
  hierarchicalCodelist: state.scenes.metaManager.hierarchicalCodelists.hierarchicalCodelist,
  agencies: state.scenes.metaManager.hierarchicalCodelists.agencies,
});

const mapDispatchToProps = dispatch => ({
  onHierarchicalCodelistDetailHide: () => dispatch(hideHierarchicalCodelistsHierarchicalCodelistDetail()),
  onHierarchicalCodelistDetailChange: fields => dispatch(changeHierarchicalCodelistsHierarchicalCodelistDetail(fields)),
  onHierarchicalCodelistDetailUpdate: (hierarchicalCodelist, annotationsConfig) => dispatch(submitHierarchicalCodelistsHierarchicalCodelistDetail(hierarchicalCodelist, annotationsConfig)),
  fetchHierarchicalCodelist: hierarchicalCodelistTriplet => dispatch(readHierarchicalCodelistsHierarchicalCodelistDetail(hierarchicalCodelistTriplet)),
  fetchAgencies: allowedAgencies => dispatch(readHierarchicalCodelistsAgencies(allowedAgencies)),
});

const HierarchicalCodelistDetail = ({
                     t,
                     nodes,
                     nodeId,
                     permissions,
                     isVisible,
                     hierarchicalCodelistTriplet,
                     hierarchicalCodelist,
                     agencies,
                     onHierarchicalCodelistDetailHide,
                     onHierarchicalCodelistDetailChange,
                     onHierarchicalCodelistDetailUpdate,
                     fetchHierarchicalCodelist,
                     fetchAgencies,
                   }) => {

  const currentNode = nodes.find(node => node.general.id === nodeId);
  const annotationsConfig = currentNode.annotations;

  const isSubmitDisabled = !isArtefactValid(hierarchicalCodelist);

  const userHasPermissionsToEdit = (
    permissions && hierarchicalCodelistTriplet &&
    permissions.agencies.filter(agency => agency === hierarchicalCodelistTriplet.agencyID).length > 0
  );

  return (
    <Call cb={fetchHierarchicalCodelist} cbParam={hierarchicalCodelistTriplet} disabled={!hierarchicalCodelistTriplet || !isVisible || hierarchicalCodelist !== null}>
      <Call cb={fetchAgencies} disabled={!isVisible}>
        <EnhancedModal
          visible={isVisible}
          width={MODAL_WIDTH_XL}
          title={userHasPermissionsToEdit
            ? t('scenes.metaManager.hierarchicalCodelists.detail.title.editMode.title', {triplet: hierarchicalCodelistTriplet})
            : t('scenes.metaManager.hierarchicalCodelists.detail.title.viewMode.title', {triplet: hierarchicalCodelistTriplet})
          }
          onCancel={onHierarchicalCodelistDetailHide}
          footer={
            <div>
              <Button onClick={onHierarchicalCodelistDetailHide}>{t('commons.buttons.close.title')}</Button>
              {userHasPermissionsToEdit
                ? (
                  <Button
                    disabled={isSubmitDisabled}
                    type="primary"
                    onClick={() => onHierarchicalCodelistDetailUpdate(hierarchicalCodelist, annotationsConfig)}
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
          {hierarchicalCodelist && (
            <ArtefactForm
              artefact={hierarchicalCodelist}
              mode={userHasPermissionsToEdit ? ARTEFACT_FORM_MODE_EDIT : ARTEFACT_FORM_MODE_READ}
              agencies={agencies}
              onChange={onHierarchicalCodelistDetailChange}
              isHierarchicalCodelist
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
)(HierarchicalCodelistDetail);
