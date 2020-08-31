import React, {Fragment} from 'react';
import {Button, Card, Col, Form, Input, Modal, Row, Steps} from 'antd';
import {
  GUTTER_SM,
  MARGIN_MD,
  MODAL_WIDTH_SM,
  MODAL_WIDTH_XL,
  PADDING_MD,
  SPAN_FULL,
  SPAN_ONE_QUARTER,
  SPAN_ONE_THIRD,
  SPAN_THREE_QUARTERS,
  SPAN_TWO_THIRDS
} from '../../../../styles/constants';
import {
  changeFileMappingWizardForm,
  createFileMappingWizardFileMapping,
  getFileMappingWizardCsvHeader,
  hideFileMappingWizard,
  hideFileMappingWizardComponents,
  hideFileMappingWizardCubeComponents,
  readFileMappingWizardCube,
  selectFileMappingWizardColumn,
  setFileMappingWizardStep,
  showFileMappingWizardComponents,
  showFileMappingWizardCubeComponents
} from './actions';
import FileMappingWizardCsvUploadForm from './csv-form';
import FileMappingWizardComponentList from './component-list';
import FileMappingWizardCubeSelector from './cube-selector';
import FileMappingWizardCsvRowList from './csv-row-list';
import FileMappingWizardCsvColumnValueList from './csv-column-value-list';
import FileMappingWizardComponentMapper from './component-mapper';
import FileMappingWizardCubeComponentList from './cube-component-list';
import Call from '../../../../hocs/call';
import {showFileMappingWizardCsvRowList} from './csv-row-list/actions';
import {showFileMappingWizardColumnValueList} from './csv-column-value-list/actions';
import './style.css';
import CubeComponentList from '../../../../components/cube-component-list';
import {translate} from 'react-i18next';
import {
  DOT_STAT_COLUMN_NAME,
  FILE_MAPPING_WIZARD_STEP_COMPONENT_MAPPING,
  FILE_MAPPING_WIZARD_STEP_CSV_UPLOAD,
  FILE_MAPPING_WIZARD_STEP_CUBE_SELECTION,
  FILE_MAPPING_WIZARD_STEP_NAME
} from './reducer';
import {compose} from 'redux';
import {connect} from 'react-redux';
import {getLocalizedStr} from '../../../../middlewares/i18n/utils';
import FileMappingComponentList from '../../../../components/file-mapping-component-list';
import EnhancedModal from '../../../../components/enhanced-modal';
import {normalizeId} from "../../../../utils/normalizers";
import {DataLanguageConsumer} from "../../../../contexts/DataLanguage";
import ZoomableTextArea from "../../../../components/zoomable-textarea";
import _ from "lodash";
import {ID_MAX_LEN} from "../../../../constants/numbers";

const mapStateToProps = ({
                           app,
                           config,
                           scenes: {dataManager: {fileMapping: {components: {wizard}}}}
                         }) => ({
  appLanguage: app.language,
  dataLanguages: config.dataManagement.dataLanguages,
  isVisible: wizard.local.isVisible,
  isCubeComponentsVisible: wizard.local.isCubeComponentsVisible,
  isComponentsVisible: wizard.local.isComponentsVisible,
  csvForm: wizard.shared.csvForm,
  csvServerPath: wizard.shared.csvServerPath,
  csvHeader: wizard.shared.csvHeader,
  cubeId: wizard.shared.cubeId,
  cube: wizard.shared.cube,
  selectedColumnName: wizard.shared.selectedColumnName,
  components: wizard.shared.components,
  name: wizard.local.name,
  description: wizard.local.description,
  tid: wizard.local.tid,
  step: wizard.local.step,
});

const mapDispatchToProps = dispatch => ({
  onHide: () => dispatch(hideFileMappingWizard()),
  onCsvRowListShow: () => dispatch(showFileMappingWizardCsvRowList()),
  onCsvColumnValueListShow: columnName => dispatch(showFileMappingWizardColumnValueList(columnName)),
  onColumnSelect: columnName => dispatch(selectFileMappingWizardColumn(columnName)),
  onCreateFileMapping: (name, description, tid, cubeId, components, csvForm) =>
    dispatch(createFileMappingWizardFileMapping(name, description, tid, cubeId, components, csvForm)),
  onStepSet: step => dispatch(setFileMappingWizardStep(step)),
  onFormChange: fields => dispatch(changeFileMappingWizardForm(fields)),
  fetchCsvHeader: ({csvServerPath, csvSeparator, csvDelimiter, csvHasHeader, csvHasDotStatFormat}) =>
    dispatch(getFileMappingWizardCsvHeader(csvSeparator, csvDelimiter, csvHasHeader, csvServerPath, csvHasDotStatFormat)),
  fetchCube: cubeId => dispatch(readFileMappingWizardCube(cubeId)),
  onCubeComponentsShow: () => dispatch(showFileMappingWizardCubeComponents()),
  onCubeComponentsHide: () => dispatch(hideFileMappingWizardCubeComponents()),
  onComponentsShow: () => dispatch(showFileMappingWizardComponents()),
  onComponentsHide: () => dispatch(hideFileMappingWizardComponents()),
});

const mapPropsToFields = ({name, description, tid}) => ({
  name: Form.createFormField({value: name}),
  description: Form.createFormField({value: description}),
  tid: Form.createFormField({value: tid}),
});

// TODO: prevent multiple changes relative to same value
const onFieldsChange = (props, fields) => {

  const newFields = _.mapValues(fields, ({value}) => value);
  if (newFields.name && newFields.name.length > ID_MAX_LEN) {
    Modal.warning({
      title: props.t('commons.alerts.fieldTooLong.title'),
      content: props.t('commons.alerts.fieldTooLong.content', {maxLen: ID_MAX_LEN})
    });
    props.onFormChange({name: props.name, description: props.description, tid: props.tid});
  } else {
    props.onFormChange(newFields);
  }
};

const cardStyle = {
  type: 'inner',
  headStyle: {
    paddingLeft: PADDING_MD,
    paddingRight: PADDING_MD
  },
  bodyStyle: {
    paddingLeft: PADDING_MD,
    paddingRight: PADDING_MD,
    height: 420,
  }
};

const formItemLayout = {
  labelCol: {span: SPAN_ONE_THIRD},
  wrapperCol: {span: SPAN_TWO_THIRDS},
};

const stepNameFormItemLayout = {
  labelCol: {span: SPAN_ONE_QUARTER},
  wrapperCol: {span: SPAN_THREE_QUARTERS},
};

const FileMappingWizard = ({
                             t,
                             appLanguage,
                             dataLanguages,
                             form,
                             isVisible,
                             step,
                             csvForm,
                             csvServerPath,
                             isCubeComponentsVisible,
                             isComponentsVisible,
                             csvHeader,
                             cubeId,
                             cube,
                             name,
                             description,
                             tid,
                             selectedColumnName,
                             components,
                             onHide,
                             onCsvRowListShow,
                             onCsvColumnValueListShow,
                             onColumnSelect,
                             onCreateFileMapping,
                             onStepSet,
                             onCubeComponentsShow,
                             onCubeComponentsHide,
                             onComponentsShow,
                             onComponentsHide,
                             onFormChange,
                             fetchCsvHeader,
                             fetchCube
                           }) =>

  <EnhancedModal
    visible={isVisible}
    onCancel={onHide}
    title={t('scenes.dataManager.fileMapping.wizard.title')}
    width={MODAL_WIDTH_XL}
    footer={
      <div>
        <Button onClick={onHide}>{t('commons.buttons.close.title')}</Button>
        {step > FILE_MAPPING_WIZARD_STEP_CUBE_SELECTION && (
          <Button onClick={() => onStepSet(step - 1)}>
            {t('scenes.dataManager.fileMapping.wizard.prevStepButton.label')}
          </Button>
        )}
        {step < FILE_MAPPING_WIZARD_STEP_NAME && (
          <Button
            onClick={() => onStepSet(step + 1)}
            disabled={
              (step === FILE_MAPPING_WIZARD_STEP_CUBE_SELECTION && cubeId === null) ||
              (step === FILE_MAPPING_WIZARD_STEP_CSV_UPLOAD && csvServerPath === null) ||
              (step === FILE_MAPPING_WIZARD_STEP_COMPONENT_MAPPING && components.length === 0)
            }
            type="primary"
          >
            {t('scenes.dataManager.fileMapping.wizard.nextStepButton.label')}
          </Button>
        )}
        {step === FILE_MAPPING_WIZARD_STEP_NAME && (
          <Button
            onClick={() => onCreateFileMapping(name, description, tid, cubeId, components, csvForm)}
            disabled={name === null || name.length === 0 || components.length === 0}
            type="primary"
          >
            {t('scenes.dataManager.fileMapping.wizard.saveButton.label')}
          </Button>
        )}
      </div>
    }
    withDataLanguageSelector
  >
    <div className="file-mapping__wizard">
      <FileMappingWizardCsvRowList/>
      <Call cb={fetchCube} cbParam={cubeId} disabled={cubeId === null}>
        <Call
          cb={fetchCsvHeader}
          cbParam={{
            csvServerPath,
            csvSeparator: csvForm.separator,
            csvDelimiter: !!csvForm.delimiter ? csvForm.delimiter : null,
            csvHasHeader: csvForm.hasHeader,
            csvHasDotStatFormat: csvForm.hasDotStatFormat
          }}
          disabled={csvServerPath === null}
        >
          <Row style={{marginBottom: MARGIN_MD}}>
            <Col>
              <Steps current={step} size="small">
                <Steps.Step
                  title={
                    <span
                      style={{cursor: 'pointer'}}
                      onClick={() => onStepSet(FILE_MAPPING_WIZARD_STEP_CUBE_SELECTION)}
                    >
                    {t('scenes.dataManager.fileMapping.wizard.steps.cubeSelection.title')}
                  </span>
                  }
                  icon={
                    <Button
                      shape="circle"
                      type={step === FILE_MAPPING_WIZARD_STEP_CUBE_SELECTION ? 'primary' : null}
                      onClick={() => onStepSet(FILE_MAPPING_WIZARD_STEP_CUBE_SELECTION)}
                      size="small"
                    >
                      1
                    </Button>
                  }
                  description={
                    cube !== null
                      ? (
                        <Fragment>
                          <DataLanguageConsumer>
                            {dataLanguage =>
                              <span
                                onClick={onCubeComponentsShow}
                                style={{cursor: 'pointer'}}
                                title={`[${cube.Code}] ${getLocalizedStr(
                                  cube.labels,
                                  dataLanguage || appLanguage,
                                  dataLanguages
                                )}`}
                              >
                            [{cube.Code}] {getLocalizedStr(cube.labels, dataLanguage || appLanguage, dataLanguages)}
                          </span>
                            }
                          </DataLanguageConsumer>
                          <EnhancedModal
                            visible={isCubeComponentsVisible}
                            onCancel={onCubeComponentsHide}
                            footer={<Button onClick={onCubeComponentsHide}>{t('commons.buttons.close.title')}</Button>}
                            width={MODAL_WIDTH_SM}
                            title={t('scenes.dataManager.fileMapping.wizard.steps.cubeSelection.description.cubeComponents')}
                          >
                            <Card type="inner" bodyStyle={{
                              maxHeight: 460,
                              overflow: 'auto'
                            }}>
                              <CubeComponentList
                                disabled
                                value={cube !== null ? cube.components : null}
                              />
                            </Card>
                          </EnhancedModal>
                        </Fragment>
                      )
                      : null
                  }
                />
                <Steps.Step
                  title={
                    <span
                      style={cubeId !== null ? {cursor: 'pointer'} : null}
                      onClick={
                        () => cubeId !== null ? onStepSet(FILE_MAPPING_WIZARD_STEP_CSV_UPLOAD) : null
                      }
                    >
                    {t('scenes.dataManager.fileMapping.wizard.steps.csvUpload.title')}
                  </span>
                  }
                  icon={
                    <Button
                      shape="circle"
                      disabled={cubeId === null}
                      onClick={
                        () => cubeId !== null ? onStepSet(FILE_MAPPING_WIZARD_STEP_CSV_UPLOAD) : null
                      }
                      type={step === FILE_MAPPING_WIZARD_STEP_CSV_UPLOAD ? 'primary' : null}
                      size="small"
                    >
                      2
                    </Button>
                  }
                  description={
                    csvForm.file !== null
                      ? <span title={csvForm.file.name}>{csvForm.file.name}</span>
                      : null
                  }
                />
                <Steps.Step
                  title={
                    <span
                      style={csvServerPath !== null ? {cursor: 'pointer'} : null}
                      onClick={
                        () =>
                          csvServerPath !== null
                            ? onStepSet(FILE_MAPPING_WIZARD_STEP_COMPONENT_MAPPING)
                            : null
                      }
                    >
                    {t('scenes.dataManager.fileMapping.wizard.steps.componentsMapping.title')}
                  </span>
                  }
                  icon={
                    <Button
                      shape="circle"
                      disabled={csvServerPath === null}
                      onClick={
                        () =>
                          csvServerPath !== null
                            ? onStepSet(FILE_MAPPING_WIZARD_STEP_COMPONENT_MAPPING)
                            : null
                      }
                      type={step === FILE_MAPPING_WIZARD_STEP_COMPONENT_MAPPING ? 'primary' : null}
                      size="small"
                    >
                      3
                    </Button>
                  }
                  description={
                    components.length > 0
                      ? (
                        <Fragment>
                          <EnhancedModal
                            className="file-mapping__wizard__components-modal"
                            visible={isComponentsVisible}
                            onCancel={onComponentsHide}
                            footer={<Button onClick={onComponentsHide}>{t('commons.buttons.close.title')}</Button>}
                            width={MODAL_WIDTH_SM}
                            title={t('scenes.dataManager.fileMapping.wizard.steps.componentsMapping.description.components')}
                          >
                            <FileMappingComponentList
                              value={components}
                              columnNameKey="columnName"
                              cubeComponentCodeKey="cubeComponentCode"
                            />
                          </EnhancedModal>
                          <span style={{cursor: 'pointer'}} onClick={onComponentsShow}>
                        {t('scenes.dataManager.fileMapping.wizard.steps.componentsMapping.description.mappedComponents', {
                          count: components.length
                        })}
                        </span>
                        </Fragment>
                      )
                      : null
                  }
                />
                <Steps.Step
                  title={
                    <span
                      style={components.length > 0 ? {cursor: 'pointer'} : null}
                      onClick={
                        () => components.length > 0 ? onStepSet(FILE_MAPPING_WIZARD_STEP_NAME) : null
                      }
                    >
                    {t('scenes.dataManager.fileMapping.wizard.steps.nameForm.title')}
                  </span>
                  }
                  icon={
                    <Button
                      shape="circle"
                      disabled={components.length === 0}
                      onClick={
                        () => components.length > 0 ? onStepSet(FILE_MAPPING_WIZARD_STEP_NAME) : null
                      }
                      type={step === FILE_MAPPING_WIZARD_STEP_NAME ? 'primary' : null}
                      size="small"
                    >
                      4
                    </Button>
                  }
                />
              </Steps>
            </Col>
          </Row>
          <Card
            style={step !== FILE_MAPPING_WIZARD_STEP_CUBE_SELECTION ? {display: 'none'} : null}
            type="inner">
            <div className="file-mapping__wizard__cube-selector">
              <FileMappingWizardCubeSelector/>
            </div>
          </Card>
          {step === FILE_MAPPING_WIZARD_STEP_CSV_UPLOAD && (
            <Row type="flex" justify="center">
              <Col style={{width: MODAL_WIDTH_SM}}>
                <Card type="inner">
                  <FileMappingWizardCsvUploadForm/>
                </Card>
              </Col>
            </Row>
          )}
          <Form>
            {step === FILE_MAPPING_WIZARD_STEP_COMPONENT_MAPPING && (
              <Fragment>
                <Row gutter={GUTTER_SM}>
                  <Col span={7}>
                    <div className="file-mapping__wizard__csv-header">
                      <Card
                        title={t('scenes.dataManager.fileMapping.wizard.cards.csvHeader.title')}{...cardStyle}>
                        <Row style={{marginBottom: MARGIN_MD, height: 330}}>
                          <FileMappingWizardCsvColumnValueList/>
                          <FileMappingWizardComponentList
                            components={
                              csvHeader !== null
                                ? (
                                  csvHeader.map((name, idx) => ({
                                    name: name,
                                    key: idx,
                                    onDetail:
                                      name !== DOT_STAT_COLUMN_NAME
                                        ? () => onCsvColumnValueListShow(name)
                                        : null,
                                    detailTitle: name !== DOT_STAT_COLUMN_NAME
                                      ? t('scenes.dataManager.fileMapping.wizard.cards.csvHeader.csvComponentList.detail.title')
                                      : t('scenes.dataManager.fileMapping.wizard.cards.csvHeader.csvComponentList.dotStatColumnDetail.title')
                                  }))
                                )
                                : []
                            }
                            selected={
                              selectedColumnName !== null
                                ? selectedColumnName
                                : null
                            }
                            onSelect={({name}) => onColumnSelect(name)}
                            disabled={components.map(comp => comp.columnName)}
                          />
                        </Row>
                        <Row>
                          <Col span={SPAN_FULL}>
                            <Button
                              onClick={onCsvRowListShow}
                              icon="table"
                              disabled={csvHeader === null}
                              style={{width: '100%'}}>
                              {t('data.csv.tableShowButton.label')}
                            </Button>
                          </Col>
                        </Row>
                      </Card>
                    </div>
                  </Col>
                  <Col span={10}>
                    <div className="file-mapping__wizard__component-mapper">
                      <Card {...cardStyle}>
                        <FileMappingWizardComponentMapper/>
                      </Card>
                    </div>
                  </Col>
                  <Col span={7}>
                    <div className="file-mapping__wizard__cube-components">
                      <Card
                        title={t('scenes.dataManager.fileMapping.wizard.cards.cubeComponents.title')}{...cardStyle}>
                        <FileMappingWizardCubeComponentList/>
                      </Card>
                    </div>
                  </Col>
                </Row>
                {!(cube === null || cube.components.tidAttributes.length === 0) && (
                  <Card type="inner" style={{marginTop: MARGIN_MD}}>
                    <Row type="flex" justify="center">
                      <Col span={SPAN_ONE_THIRD}>
                        <Form.Item label={t('data.fileMapping.tid.label')} {...formItemLayout}>
                          {form.getFieldDecorator('tid', {normalize: normalizeId})(
                            <Input title={form.getFieldValue('tid')}/>)}
                        </Form.Item>
                      </Col>
                    </Row>
                  </Card>
                )}
              </Fragment>
            )}
            {step === FILE_MAPPING_WIZARD_STEP_NAME && (
              <Row type="flex" justify="center">
                <Col span={SPAN_FULL}>
                  <Card type="inner">
                    <Form.Item className="form-item-required"
                               label={t('data.fileMapping.name.label')} {...stepNameFormItemLayout}>
                      {form.getFieldDecorator('name', {
                        normalize: str => str !== null ? str.toUpperCase() : null
                      })(<Input title={form.getFieldValue('name')}/>)}
                    </Form.Item>
                    <Form.Item label={t('data.fileMapping.description.label')} {...stepNameFormItemLayout}>
                      {form.getFieldDecorator('description')(
                        <ZoomableTextArea title={form.getFieldValue('description')}/>
                      )}
                    </Form.Item>
                  </Card>
                </Col>
              </Row>
            )}
          </Form>
        </Call>
      </Call>
    </div>
  </EnhancedModal>;

export default compose(
  translate(),
  connect(mapStateToProps, mapDispatchToProps),
  Form.create({
    mapPropsToFields,
    onFieldsChange
  })
)(FileMappingWizard);
