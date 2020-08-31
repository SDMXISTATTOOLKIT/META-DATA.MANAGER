import React from 'react';
import {Alert, Button, Col, Modal, Row, Steps} from 'antd';
import {CSS_HIDDEN, CSS_POINTER, MARGIN_MD, MODAL_WIDTH_XL} from '../../../../styles/constants';
import {
  hideDataflowBuilderWizard,
  readDataflowBuilderWizardDataflow,
  setDataflowBuilderWizardStep,
  submitDataflowBuilderWizard
} from './actions';
import DataflowBuilderWizardDataflowForm from './dataflow-form';
import DataflowBuilderWizardQuery from './query';
import DataflowBuilderWizardCategorisationTree from './category-tree';
import DataflowBuilderWizardHeader from './header-form';
import {
  DATAFLOW_BUILDER_WIZARD_STEP_CATEGORISATION,
  DATAFLOW_BUILDER_WIZARD_STEP_DATAFLOW,
  DATAFLOW_BUILDER_WIZARD_STEP_HEADER,
  DATAFLOW_BUILDER_WIZARD_STEP_LAYOUT_ANNOTATIONS,
  DATAFLOW_BUILDER_WIZARD_STEP_QUERY
} from '../reducer';
import EnhancedModal from '../../../../components/enhanced-modal';
import Call from '../../../../hocs/call';
import _ from 'lodash';
import {connect} from "react-redux";
import {compose} from "redux";
import {translate} from 'react-i18next';
import {isArtefactValid} from "../../../../utils/artefactValidators";
import {getTreeFilterStrFromObj} from "../../../../components/tree-filter/utils";
import {QUERY_FORM_FILTER_MODE_PLAIN} from "../../../../components/query-form";
import DataflowBuilderWizardLayoutAnnotations from "./layout-annotations";
import {getFilterStrFromObj} from "../../../../utils/filter";

const mapStateToProps = state => ({
  nodes: state.config.nodes,
  nodeId: state.app.endpointId,
  isVisible: state.scenes.dataManager.dataflowBuilder.shared.isWizardVisible,
  step: state.scenes.dataManager.dataflowBuilder.shared.wizardStep,
  ddbDataflow: state.scenes.dataManager.dataflowBuilder.shared.ddbDataflow,
  dataflowTriplet: state.scenes.dataManager.dataflowBuilder.shared.dataflowTriplet,
  dataflow: state.scenes.dataManager.dataflowBuilder.shared.dataflow,
  filter: state.scenes.dataManager.dataflowBuilder.shared.filter,
  treeFilter: state.scenes.dataManager.dataflowBuilder.shared.treeFilter,
  filterMode: state.scenes.dataManager.dataflowBuilder.shared.filterMode,
  cube: state.scenes.dataManager.dataflowBuilder.shared.cube,
  cubeFirstRow: state.scenes.dataManager.dataflowBuilder.shared.cubeFirstRow,
  categoriesUrns: state.scenes.dataManager.dataflowBuilder.shared.categoriesUrns,
  header: state.scenes.dataManager.dataflowBuilder.shared.header,
  hasHeader: state.scenes.dataManager.dataflowBuilder.shared.hasHeader
});

const mapDispatchToProps = dispatch => ({
  onHide: () => dispatch(hideDataflowBuilderWizard()),
  onStepSet: step => dispatch(setDataflowBuilderWizardStep(step)),
  onSubmit: (dataflow, cube, filterObj, categoriesUrns, header, isEditing, cubeCode) =>
    dispatch(submitDataflowBuilderWizard(dataflow, cube, filterObj, categoriesUrns, header, isEditing, cubeCode)),
  fetchDataflow: dataflowTriplet => dispatch(readDataflowBuilderWizardDataflow(dataflowTriplet))
});

function isQueryStepDisabled(dataflow, customAnnotationTabs) {
  return !isArtefactValid(dataflow);
}

function isCategorisationStepDisabled(cubeFirstRow) {
  return cubeFirstRow === undefined || cubeFirstRow === null;
}

function isHeaderStepDisabled(categoriesUrns, cubeFirstRow) {
  return isCategorisationStepDisabled(cubeFirstRow) || categoriesUrns === null || categoriesUrns.length === 0;
}

function isLayoutAnnotationsStepDisabled(categoriesUrns, cubeFirstRow) {
  return isHeaderStepDisabled(categoriesUrns, cubeFirstRow);
}

const DataflowBuilderWizard = ({
                                 t,
                                 nodes,
                                 nodeId,
                                 isVisible,
                                 step,
                                 dataflow,
                                 dataflowTriplet,
                                 ddbDataflow,
                                 cube,
                                 cubeFirstRow,
                                 filter,
                                 treeFilter,
                                 filterMode,
                                 categoriesUrns,
                                 header,
                                 hasHeader,
                                 onHide,
                                 onStepSet,
                                 onSubmit,
                                 fetchDataflow
                               }) => {

  const customAnnotationTabs = nodes.find(node => node.general.id === nodeId).annotationTabs.tabs;

  const disabled =
    dataflowTriplet &&
    dataflow &&
    [...(dataflow.annotations || []), ...(dataflow.autoAnnotations || [])].filter(({type}) => type === 'NonProductionDataflow').length === 0;

  return (
    <EnhancedModal
      visible={isVisible}
      width={MODAL_WIDTH_XL}
      title={
        dataflowTriplet !== null
          ? t('scenes.dataManager.dataflowBuilder.wizard.editMode.title', {triplet: dataflowTriplet})
          : t('scenes.dataManager.dataflowBuilder.wizard.createMode.title')
      }
      onCancel={onHide}
      footer={
        <div>
          <Button onClick={onHide}>{t('commons.buttons.close.title')}</Button>
          {step > DATAFLOW_BUILDER_WIZARD_STEP_DATAFLOW && (
            <Button onClick={() => onStepSet(step - 1)}>
              {t('scenes.dataManager.dataflowBuilder.wizard.prevStepButton.label')}
            </Button>
          )}
          {step < DATAFLOW_BUILDER_WIZARD_STEP_LAYOUT_ANNOTATIONS && (
            <Button
              onClick={() => onStepSet(step + 1)}
              disabled={
                (step === DATAFLOW_BUILDER_WIZARD_STEP_DATAFLOW && isQueryStepDisabled(dataflow, customAnnotationTabs)) ||
                (step === DATAFLOW_BUILDER_WIZARD_STEP_QUERY && isCategorisationStepDisabled(cubeFirstRow)) ||
                (step === DATAFLOW_BUILDER_WIZARD_STEP_CATEGORISATION && isHeaderStepDisabled(categoriesUrns, cubeFirstRow)) ||
                (step === DATAFLOW_BUILDER_WIZARD_STEP_HEADER && isLayoutAnnotationsStepDisabled(categoriesUrns, cubeFirstRow))
              }
              type="primary"
            >
              {t('scenes.dataManager.dataflowBuilder.wizard.nextStepButton.label')}
            </Button>
          )}
          {(
            (ddbDataflow !== null && ddbDataflow.IDDataflow !== null &&
              dataflow &&
              [...(dataflow.annotations || []), ...(dataflow.autoAnnotations || [])].filter(({type}) => type === 'NonProductionDataflow').length > 0)
            ||
            ((ddbDataflow === null || ddbDataflow.IDDataflow === null) && step === DATAFLOW_BUILDER_WIZARD_STEP_LAYOUT_ANNOTATIONS)
          ) && (
            <Button
              onClick={() =>
                (
                  header && header.receiver &&
                  (
                    header.receiver.organisationId === null || header.receiver.organisationId === undefined ||
                    header.receiver.organisationId.length === 0
                  )
                  &&
                  (
                    (header.receiver.organisationName && header.receiver.organisationName.length > 0) ||
                    (header.receiver.contactName && header.receiver.contactName.length > 0) ||
                    (header.receiver.contactDepartment && header.receiver.contactDepartment.length > 0) ||
                    (header.receiver.contactRole && header.receiver.contactRole.length > 0) ||
                    (header.receiver.contactEmail && header.receiver.contactEmail.length > 0)
                  )
                )
                  ? (
                    Modal.error({
                      title: t('scenes.dataManager.dataflowBuilder.wizard.invalidReceiverModal.title'),
                      content: t('scenes.dataManager.dataflowBuilder.wizard.invalidReceiverModal.content')
                    })
                  )
                  : (
                    onSubmit(
                      dataflow,
                      cube,
                      filterMode === QUERY_FORM_FILTER_MODE_PLAIN
                        ?
                        getFilterStrFromObj(
                          filter,
                          cube !== null && cube.columns !== null
                            ? _.flatten(Object.keys(cube.columns)
                              .map(key => cube.columns[key]))
                            : null)
                        :
                        getTreeFilterStrFromObj(
                          treeFilter,
                          cube !== null && cube.columns !== null
                            ? _.flatten(Object.keys(cube.columns)
                              .map(key => cube.columns[key])).map(({name}) => name)
                            : null
                        ),
                      categoriesUrns,
                      hasHeader ? header : null,
                      (ddbDataflow !== null && ddbDataflow.IDDataflow !== null)
                        ? ddbDataflow.IDDataflow
                        : null,
                      <cube className="Code"></cube>
                    )
                  )
              }
              disabled={
                isQueryStepDisabled(dataflow, customAnnotationTabs) ||
                isCategorisationStepDisabled(cubeFirstRow) ||
                isHeaderStepDisabled(categoriesUrns, cubeFirstRow) ||
                (
                  hasHeader &&
                  (
                    header === null ||
                    header.sender === null || header.sender === undefined ||
                    header.sender.organisationId === null || header.sender.organisationId === undefined ||
                    header.sender.organisationId.length === 0
                  )
                )
              }
              type="primary"
            >
              {t('scenes.dataManager.dataflowBuilder.wizard.saveButton.label')}
            </Button>
          )}
        </div>
      }
      withDataLanguageSelector
    >
      <Call cb={fetchDataflow} cbParam={dataflowTriplet} disabled={dataflowTriplet === null}>
        {dataflowTriplet && dataflow && (
          [...(dataflow.annotations || []), ...(dataflow.autoAnnotations || [])].filter(({type}) => type === 'NonProductionDataflow').length === 0
        ) && (
          <Alert
            type="warning"
            showIcon
            message={t('scenes.dataManager.dataflowBuilder.wizard.inProductionAlert.message')}
          />
        )}
        <Row style={{marginBottom: MARGIN_MD}}>
          <Col>
            <Steps current={step} size="small">
              <Steps.Step
                title={
                  <span
                    style={CSS_POINTER}
                    onClick={() => onStepSet(DATAFLOW_BUILDER_WIZARD_STEP_DATAFLOW)}
                  >
                  {t('scenes.dataManager.dataflowBuilder.wizard.steps.dataflow.title')}
                  </span>
                }
                icon={
                  <Button
                    shape="circle"
                    type={step === DATAFLOW_BUILDER_WIZARD_STEP_DATAFLOW ? 'primary' : null}
                    onClick={() => onStepSet(DATAFLOW_BUILDER_WIZARD_STEP_DATAFLOW)}
                    size="small"
                  >
                    1
                  </Button>
                }
              />
              <Steps.Step
                title={
                  <span
                    style={isQueryStepDisabled(dataflow, customAnnotationTabs) ? null : CSS_POINTER}
                    onClick={
                      () => isQueryStepDisabled(dataflow, customAnnotationTabs)
                        ? null
                        : onStepSet(DATAFLOW_BUILDER_WIZARD_STEP_QUERY)
                    }
                  >
                    {t('scenes.dataManager.dataflowBuilder.wizard.steps.query.title')}
                  </span>
                }
                icon={
                  <Button
                    shape="circle"
                    type={step === DATAFLOW_BUILDER_WIZARD_STEP_QUERY ? 'primary' : null}
                    disabled={isQueryStepDisabled(dataflow, customAnnotationTabs)}
                    onClick={
                      () => isQueryStepDisabled(dataflow, customAnnotationTabs)
                        ? null
                        : onStepSet(DATAFLOW_BUILDER_WIZARD_STEP_QUERY)
                    }
                    size="small"
                  >
                    2
                  </Button>
                }
              />
              <Steps.Step
                title={
                  <span
                    style={isCategorisationStepDisabled(cubeFirstRow) ? null : CSS_POINTER}
                    onClick={
                      () => isCategorisationStepDisabled(cubeFirstRow)
                        ? null
                        : onStepSet(DATAFLOW_BUILDER_WIZARD_STEP_CATEGORISATION)
                    }
                  >
                    {t('scenes.dataManager.dataflowBuilder.wizard.steps.categorisation.title')}
                  </span>
                }
                icon={
                  <Button
                    shape="circle"
                    type={step === DATAFLOW_BUILDER_WIZARD_STEP_CATEGORISATION ? 'primary' : null}
                    disabled={isCategorisationStepDisabled(cubeFirstRow)}
                    onClick={
                      () => isCategorisationStepDisabled(cubeFirstRow)
                        ? null
                        : onStepSet(DATAFLOW_BUILDER_WIZARD_STEP_CATEGORISATION)
                    }
                    size="small"
                  >
                    3
                  </Button>
                }
              />
              <Steps.Step
                title={
                  <span
                    style={isHeaderStepDisabled(categoriesUrns, cubeFirstRow) ? null : CSS_POINTER}
                    onClick={
                      () => isHeaderStepDisabled(categoriesUrns, cubeFirstRow)
                        ? null
                        : onStepSet(DATAFLOW_BUILDER_WIZARD_STEP_HEADER)
                    }
                  >
                  {t('scenes.dataManager.dataflowBuilder.wizard.steps.header.title')}
                  </span>
                }
                icon={
                  <Button
                    shape="circle"
                    type={step === DATAFLOW_BUILDER_WIZARD_STEP_HEADER ? 'primary' : null}
                    disabled={isHeaderStepDisabled(categoriesUrns, cubeFirstRow)}
                    onClick={
                      () => isHeaderStepDisabled(categoriesUrns, cubeFirstRow)
                        ? null
                        : onStepSet(DATAFLOW_BUILDER_WIZARD_STEP_HEADER)
                    }
                    size="small"
                  >
                    4
                  </Button>
                }
              />
              <Steps.Step
                title={
                  <span
                    style={isLayoutAnnotationsStepDisabled(categoriesUrns, cubeFirstRow) ? null : CSS_POINTER}
                    onClick={
                      () => isLayoutAnnotationsStepDisabled(categoriesUrns, cubeFirstRow)
                        ? null
                        : onStepSet(DATAFLOW_BUILDER_WIZARD_STEP_LAYOUT_ANNOTATIONS)
                    }
                  >
                  {t('scenes.dataManager.dataflowBuilder.wizard.steps.layoutAnnotations.title')}
                  </span>
                }
                icon={
                  <Button
                    shape="circle"
                    type={step === DATAFLOW_BUILDER_WIZARD_STEP_LAYOUT_ANNOTATIONS ? 'primary' : null}
                    disabled={isLayoutAnnotationsStepDisabled(categoriesUrns, cubeFirstRow)}
                    onClick={
                      () => isLayoutAnnotationsStepDisabled(categoriesUrns, cubeFirstRow)
                        ? null
                        : onStepSet(DATAFLOW_BUILDER_WIZARD_STEP_LAYOUT_ANNOTATIONS)
                    }
                    size="small"
                  >
                    5
                  </Button>
                }
              />
            </Steps>
          </Col>
        </Row>
        <div style={step !== DATAFLOW_BUILDER_WIZARD_STEP_DATAFLOW ? CSS_HIDDEN : null}>
          <DataflowBuilderWizardDataflowForm disabled={disabled}/>
        </div>
        <div style={step !== DATAFLOW_BUILDER_WIZARD_STEP_QUERY ? CSS_HIDDEN : null}>
          <DataflowBuilderWizardQuery disabled={disabled}/>
        </div>
        <div
          style={step !== DATAFLOW_BUILDER_WIZARD_STEP_CATEGORISATION ? CSS_HIDDEN : null}>
          <DataflowBuilderWizardCategorisationTree disabled={disabled}/>
        </div>
        <div style={step !== DATAFLOW_BUILDER_WIZARD_STEP_HEADER ? CSS_HIDDEN : null}>
          <DataflowBuilderWizardHeader disabled={disabled}/>
        </div>
        <div style={step !== DATAFLOW_BUILDER_WIZARD_STEP_LAYOUT_ANNOTATIONS ? CSS_HIDDEN : null}>
          <DataflowBuilderWizardLayoutAnnotations disabled={disabled}/>
        </div>
      </Call>
    </EnhancedModal>
  )
};

export default compose(
  translate(),
  connect(mapStateToProps, mapDispatchToProps)
)(DataflowBuilderWizard);
