import React, {Fragment} from 'react';
import {Button, Modal} from 'antd';
import Call from '../../../../hocs/call';
import FileMappingTable from '../../../../components/file-mapping-table';
import {
  deleteFileMappingListFileMapping,
  deleteFileMappingListFileMappingAll,
  hideFileMappingListFileMapping,
  readFileMappingListFileMapping,
  readFileMappingListFileMappingCube,
  readFileMappingListFileMappings,
  showFileMappingListFileMapping
} from './actions';
import {MODAL_WIDTH_SM} from '../../../../styles/constants';
import {compose} from 'redux';
import {connect} from 'react-redux';
import {translate} from 'react-i18next';
import FileMappingForm from '../../../../components/file-mapping-form';
import EnhancedModal from '../../../../components/enhanced-modal';
import {showFileMappingWizard} from "../wizard/actions";

const mapStateToProps = state => ({
  fileMappings: state.scenes.dataManager.fileMapping.components.list.fileMappings,
  fileMappingId: state.scenes.dataManager.fileMapping.components.list.fileMappingId,
  fileMapping: state.scenes.dataManager.fileMapping.components.list.fileMapping,
  fileMappingCube: state.scenes.dataManager.fileMapping.components.list.fileMappingCube
});

const mapDispatchToProps = dispatch => ({
  onWizardShow: () => dispatch(showFileMappingWizard()),
  onFileMappingShow: fileMappingId => dispatch(showFileMappingListFileMapping(fileMappingId)),
  onFileMappingHide: () => dispatch(hideFileMappingListFileMapping()),
  onFileMappingDelete: fileMappingId => dispatch(deleteFileMappingListFileMapping(fileMappingId)),
  onFileMappingDeleteAll: fileMappingIds => dispatch(deleteFileMappingListFileMappingAll(fileMappingIds)),
  fetchFileMappings: () => dispatch(readFileMappingListFileMappings()),
  fetchFileMapping: fileMappingId => dispatch(readFileMappingListFileMapping(fileMappingId)),
  fetchFileMappingCube: cubeId => dispatch(readFileMappingListFileMappingCube(cubeId))
});

const FileMappingList = ({
                           t,
                           fileMappings,
                           fileMappingId,
                           fileMapping,
                           fileMappingCube,
                           onWizardShow,
                           onFileMappingShow,
                           onFileMappingHide,
                           onFileMappingDelete,
                           onFileMappingDeleteAll,
                           fetchFileMappings,
                           fetchFileMapping,
                           fetchFileMappingCube
                         }) =>
  <Fragment>
    <EnhancedModal
      visible={fileMappingId !== null}
      onCancel={onFileMappingHide}
      title={t('scenes.dataManager.fileMapping.list.fileMappingModal.title')}
      width={MODAL_WIDTH_SM}
      footer={<Button onClick={onFileMappingHide}>{t('commons.buttons.close.title')}</Button>}
      withDataLanguageSelector
    >
      <Call cb={fetchFileMapping} cbParam={fileMappingId}>
        <Call
          cb={fetchFileMappingCube}
          cbParam={fileMapping !== null && fileMapping.IDCube}
          disabled={fileMapping === null}
        >
          <FileMappingForm fileMapping={fileMapping} cube={fileMappingCube}/>
        </Call>
      </Call>
    </EnhancedModal>
    <Call cb={fetchFileMappings} disabled={fileMappings !== null}>
      <FileMappingTable
        fileMappings={fileMappings}
        onFileMappingDetail={onFileMappingShow}
        onFileMappingDelete={
          (fileMappingId, deselect) => Modal.confirm({
            title: t('scenes.dataManager.fileMapping.list.deleteButton.confirm'),
            onOk() {
              deselect();
              onFileMappingDelete(fileMappingId);
            },
            cancelText: t('commons.buttons.cancel.title')
          })
        }
        onFileMappingDeleteAll={
          fileMappingIds => Modal.confirm({
            title: t('scenes.dataManager.fileMapping.list.deleteAllButton.confirm'),
            onOk() {
              onFileMappingDeleteAll(fileMappingIds);
            },
            cancelText: t('commons.buttons.cancel.title')
          })
        }
        rightActions={
          <Button icon="plus" onClick={onWizardShow} type="primary">
            {t('scenes.dataManager.fileMapping.wizardShowButton.label')}
          </Button>
        }
      />
    </Call>
  </Fragment>;

export default compose(
  translate(),
  connect(mapStateToProps, mapDispatchToProps)
)(FileMappingList);
