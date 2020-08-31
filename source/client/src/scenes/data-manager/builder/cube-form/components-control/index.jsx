import React, {Fragment} from 'react';
import {MODAL_WIDTH_SM} from '../../../../../styles/constants';
import AttributeDetail from '../../../../../components/attribute-detail';
import {compose} from 'redux';
import {connect} from 'react-redux';
import {translate} from 'react-i18next';

import {
  hideBuilderCubeFormComponentsControlAttribute,
  hideBuilderCubeFormComponentsControlDimension,
  hideBuilderCubeFormComponentsControlMeasure,
  showBuilderCubeFormComponentsControlAttribute,
  showBuilderCubeFormComponentsControlDimension,
  showBuilderCubeFormComponentsControlMeasure
} from './actions';
import CubeComponentList from '../../../../../components/cube-component-list';
import DimensionDetail from '../../../../../components/dimension-detail';
import EnhancedModal from '../../../../../components/enhanced-modal';
import {Button} from "antd";
import MeasureDetail from "../../../../../components/measure-detail";
import ReduxCodelistDetailModal from "../../../../../redux-components/redux-codelist-detail-modal";
import {DM_BUILDER_CUBE_FORM_COMPONENT_CONTROL_CODELIST_DETAIL_PREFIX} from "./reducer";
import {reuseAction} from "../../../../../utils/reduxReuse";
import {showCodelistDetail} from "../../../../../redux-components/redux-codelist-detail-modal/actions";

const mapStateToProps = state => ({
  nodeId: state.app.endpointId,
  nodes: state.config.nodes,
  cubeId: state.scenes.dataManager.builder.shared.cubeId,
  dsd: state.scenes.dataManager.builder.components.cubeForm.shared.dsd,
  codelistDetail: state.scenes.dataManager.builder.components.cubeForm.components.componentsControl.codelistDetail,
  attributeId: state.scenes.dataManager.builder.components.cubeForm.components.componentsControl.attributeId,
  dimensionId: state.scenes.dataManager.builder.components.cubeForm.components.componentsControl.dimensionId,
  isMeasureVisible: state.scenes.dataManager.builder.components.cubeForm.components.componentsControl.isMeasureVisible
});

const mapDispatchToProps = dispatch => ({
  onCodelistShow: (codelistTriplet, defaultItemsViewMode) =>
    dispatch(reuseAction(showCodelistDetail(codelistTriplet, defaultItemsViewMode), DM_BUILDER_CUBE_FORM_COMPONENT_CONTROL_CODELIST_DETAIL_PREFIX)),
  onAttributeShow: attributeId => dispatch(showBuilderCubeFormComponentsControlAttribute(attributeId)),
  onAttributeHide: () => dispatch(hideBuilderCubeFormComponentsControlAttribute()),
  onDimensionShow: dimensionId => dispatch(showBuilderCubeFormComponentsControlDimension(dimensionId)),
  onDimensionHide: () => dispatch(hideBuilderCubeFormComponentsControlDimension()),
  onMeasureShow: () => dispatch(showBuilderCubeFormComponentsControlMeasure()),
  onMeasureHide: () => dispatch(hideBuilderCubeFormComponentsControlMeasure())
});

const BuilderCubeFormComponentsControl = ({
                                            t,
                                            nodeId,
                                            nodes,
                                            form,
                                            cubeId,
                                            dsd,
                                            codelistDetail,
                                            attributeId,
                                            dimensionId,
                                            isMeasureVisible,
                                            onCodelistShow,
                                            onAttributeShow,
                                            onAttributeHide,
                                            onDimensionShow,
                                            onDimensionHide,
                                            onMeasureShow,
                                            onMeasureHide
                                          }) => {

  const defaultItemsViewMode = nodes.find(node => node.general.id === nodeId).general.defaultItemsViewMode;

  return (
    <Fragment>
      <ReduxCodelistDetailModal
        instancePrefix={DM_BUILDER_CUBE_FORM_COMPONENT_CONTROL_CODELIST_DETAIL_PREFIX}
        instanceState={codelistDetail}
      />
      <EnhancedModal
        visible={attributeId !== null}
        onCancel={onAttributeHide}
        title={t('scenes.dataManager.builder.componensControl.attributeModal.title')}
        width={MODAL_WIDTH_SM}
        footer={<Button onClick={onAttributeHide}>{t('commons.buttons.close.title')}</Button>}
      >
        {attributeId !== null && (
          <AttributeDetail
            attribute={
              dsd !== null && dsd.dataStructureComponents.attributeList.attributes
                .filter(attr => attr.id === attributeId)[0]
            }
          />
        )}
      </EnhancedModal>
      <EnhancedModal
        visible={dimensionId !== null}
        onCancel={onDimensionHide}
        title={t('scenes.dataManager.builder.componensControl.dimensionModal.title')}
        width={MODAL_WIDTH_SM}
        footer={<Button onClick={onDimensionHide}>{t('commons.buttons.close.title')}</Button>}
      >
        <DimensionDetail
          dimension={
            dsd !== null && (
              dsd.dataStructureComponents.dimensionList.dimensions
                .filter(dim => dim.id === dimensionId)[0] ||
              (dsd.dataStructureComponents.dimensionList.measureDimensions || [])
                .filter(dim => dim.id === dimensionId)[0] ||
              dsd.dataStructureComponents.dimensionList.timeDimensions
                .filter(dim => dim.id === dimensionId)[0]
            )
          }
        />
      </EnhancedModal>
      <EnhancedModal
        visible={isMeasureVisible}
        onCancel={onMeasureHide}
        title={t('scenes.dataManager.builder.componensControl.measureModal.title')}
        width={MODAL_WIDTH_SM}
        footer={<Button onClick={onMeasureHide}>{t('commons.buttons.close.title')}</Button>}
      >
        <MeasureDetail measure={dsd !== null && dsd.dataStructureComponents.measureList.primaryMeasure}/>
      </EnhancedModal>
      {form.getFieldDecorator('cubeComponents')(
        <CubeComponentList
          disabled={cubeId !== null}
          onCodelistShow={triplet => onCodelistShow(triplet, defaultItemsViewMode)}
          onAttributeShow={onAttributeShow}
          onDimensionShow={onDimensionShow}
          onMeasureShow={onMeasureShow}
        />
      )}
    </Fragment>
  )
};

export default compose(
  translate(),
  connect(mapStateToProps, mapDispatchToProps)
)(BuilderCubeFormComponentsControl);
