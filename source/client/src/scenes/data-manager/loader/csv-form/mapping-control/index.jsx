import Selector from '../../../../../components/selector';
import {Button, Form} from 'antd';
import React from 'react';
import {MODAL_WIDTH_LG, MODAL_WIDTH_SM} from '../../../../../styles/constants';
import {translate} from 'react-i18next';
import Call from '../../../../../hocs/call';
import FileMappingForm from '../../../../../components/file-mapping-form';
import FileMappingTable from '../../../../../components/file-mapping-table';
import {
  hideLoaderCsvFormMappingControlDetailMapping,
  hideLoaderCsvFormMappingControlMappings,
  hideLoaderCsvFormMappingControlSelectedMapping,
  readLoaderCsvFormMappingControlDetailMapping,
  readLoaderCsvFormMappingControlDetailMappingCube,
  readLoaderCsvFormMappingControlMappings,
  readLoaderCsvFormMappingControlSelectedMapping,
  readLoaderCsvFormMappingControlSelectedMappingCube,
  setLoaderCsvFormMappingControlMapping,
  showLoaderCsvFormMappingControlDetailMapping,
  showLoaderCsvFormMappingControlMappings,
  showLoaderCsvFormMappingControlSelectedMapping,
  unsetLoaderCsvFormMappingControlMapping
} from './actions';
import {compose} from 'redux';
import {connect} from 'react-redux';
import EnhancedModal from '../../../../../components/enhanced-modal';

const mapStateToProps = state => ({
  selectedMappingId: state.scenes.dataManager.loader.components.csvForm.shared.mappingId,
  selectedMapping: state.scenes.dataManager.loader.components.csvForm.shared.mapping,
  selectedMappingCube: state.scenes.dataManager.loader.components.csvForm.shared.mappingCube,
  isSelectedMappingVisible: state.scenes.dataManager.loader.components.csvForm.components.mappingControl.isSelectedMappingVisible,
  isMappingsVisible: state.scenes.dataManager.loader.components.csvForm.components.mappingControl.isMappingsVisible,
  mappings: state.scenes.dataManager.loader.components.csvForm.components.mappingControl.mappings,
  detailMappingId: state.scenes.dataManager.loader.components.csvForm.components.mappingControl.detailMappingId,
  detailMapping: state.scenes.dataManager.loader.components.csvForm.components.mappingControl.detailMapping,
  detailMappingCube: state.scenes.dataManager.loader.components.csvForm.components.mappingControl.detailMappingCube
});

const mapDispatchToProps = dispatch => ({
  onMappingSet: mappingId => dispatch(setLoaderCsvFormMappingControlMapping(mappingId)),
  onMappingUnset: () => dispatch(unsetLoaderCsvFormMappingControlMapping()),
  onMappingsShow: () => dispatch(showLoaderCsvFormMappingControlMappings()),
  onDetailMappingShow: mappingId => dispatch(showLoaderCsvFormMappingControlDetailMapping(mappingId)),
  onSelectedMappingShow: () => dispatch(showLoaderCsvFormMappingControlSelectedMapping()),
  onMappingsHide: () => dispatch(hideLoaderCsvFormMappingControlMappings()),
  onDetailMappingHide: () => dispatch(hideLoaderCsvFormMappingControlDetailMapping()),
  onSelectedMappingHide: () => dispatch(hideLoaderCsvFormMappingControlSelectedMapping()),
  fetchMappings: () => dispatch(readLoaderCsvFormMappingControlMappings()),
  fetchDetailMapping: mappingId => dispatch(readLoaderCsvFormMappingControlDetailMapping(mappingId)),
  fetchDetailMappingCube: cubeId => dispatch(readLoaderCsvFormMappingControlDetailMappingCube(cubeId)),
  fetchSelectedMapping: mappingId => dispatch(readLoaderCsvFormMappingControlSelectedMapping(mappingId)),
  fetchSelectedMappingCube: cubeId => dispatch(readLoaderCsvFormMappingControlSelectedMappingCube(cubeId))
});

const LoaderCsvFormMappingControl = ({
                                       t,
                                       form,
                                       selectedMappingId,
                                       selectedMapping,
                                       selectedMappingCube,
                                       isSelectedMappingVisible,
                                       isMappingsVisible,
                                       mappings,
                                       detailMappingId,
                                       detailMapping,
                                       detailMappingCube,
                                       onMappingSet,
                                       onMappingUnset,
                                       onMappingsShow,
                                       onDetailMappingShow,
                                       onSelectedMappingShow,
                                       onMappingsHide,
                                       onDetailMappingHide,
                                       onSelectedMappingHide,
                                       fetchMappings,
                                       fetchDetailMapping,
                                       fetchDetailMappingCube,
                                       fetchSelectedMapping,
                                       fetchSelectedMappingCube
                                     }) =>
  <Call cb={fetchSelectedMapping} cbParam={selectedMappingId} disabled={selectedMappingId === null}>
    <Call
      cb={fetchSelectedMappingCube}
      cbParam={selectedMapping !== null && selectedMapping.IDCube}
      disabled={selectedMapping === null}
    >
      <EnhancedModal
        visible={isSelectedMappingVisible}
        onCancel={onSelectedMappingHide}
        title={t('scenes.dataManager.loader.csvForm.mappingControl.selectedMapping.title')}
        width={MODAL_WIDTH_SM}
        footer={<Button onClick={onSelectedMappingHide}>{t('commons.buttons.close.title')}</Button>}
      >
        <FileMappingForm fileMapping={selectedMapping} cube={selectedMappingCube}/>
      </EnhancedModal>
      <EnhancedModal
        visible={isMappingsVisible}
        onCancel={onMappingsHide}
        title={t('scenes.dataManager.loader.csvForm.mappingControl.mappingList.title')}
        width={MODAL_WIDTH_LG}
        footer={<Button onClick={onMappingsHide}>{t('commons.buttons.close.title')}</Button>}
      >
        <Call cb={fetchMappings}>
          <FileMappingTable
            fileMappings={mappings}
            onFileMappingDetail={onDetailMappingShow}
            onFileMappingClick={onMappingSet}
          />
        </Call>
      </EnhancedModal>
      <EnhancedModal
        visible={detailMappingId !== null}
        onCancel={onDetailMappingHide}
        title={t('scenes.dataManager.loader.csvForm.mappingControl.detailMapping.title')}
        width={MODAL_WIDTH_SM}
        footer={<Button onClick={onDetailMappingHide}>{t('commons.buttons.close.title')}</Button>}
      >
        <Call cb={fetchDetailMapping} cbParam={detailMappingId}>
          <Call
            cb={fetchDetailMappingCube}
            cbParam={detailMapping !== null && detailMapping.IDCube}
            disabled={detailMapping === null}
          >
            <FileMappingForm fileMapping={detailMapping} cube={detailMappingCube}/>
          </Call>
        </Call>
      </EnhancedModal>
      <Form.Item>
        {form.getFieldDecorator('mappingId')(
          <Selector
            detailTitle={t('scenes.dataManager.loader.csvForm.mappingControl.detailIcon.title')}
            selectTitle={t('scenes.dataManager.loader.csvForm.mappingControl.selectIcon.title')}
            resetTitle={t('scenes.dataManager.loader.csvForm.mappingControl.resetIcon.title')}
            onDetail={onSelectedMappingShow}
            onSelect={onMappingsShow}
            onReset={onMappingUnset}
          />
        )}
      </Form.Item>
    </Call>
  </Call>;

export default compose(
  translate(),
  connect(mapStateToProps, mapDispatchToProps)
)(LoaderCsvFormMappingControl);
