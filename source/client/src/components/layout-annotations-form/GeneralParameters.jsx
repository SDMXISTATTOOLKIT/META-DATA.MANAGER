import React, {forwardRef, Fragment, useEffect, useImperativeHandle, useState} from 'react';
import {Card, Col, Form, Input, InputNumber, Row, Select} from "antd";
import {GUTTER_MD, MARGIN_MD, SPAN_HALF, SPAN_ONE_THIRD, SPAN_TWO_THIRDS} from "../../styles/constants";
import {useForm} from 'react-hook-form/dist/react-hook-form.ie11';
import MultilanguageTagsSelect from "../multilanguage-tags-select";
import {DataLanguageProvider, withDataLanguage} from "../../contexts/DataLanguage";
import {
  getLayoutAnnotationAttachedDataFiles,
  getLayoutAnnotationCriteriaSelection,
  getLayoutAnnotationDataflowKeywords,
  getLayoutAnnotationDataflowNotes,
  getLayoutAnnotationDataflowSource,
  getLayoutAnnotationDecimalSeparator,
  getLayoutAnnotationDefaultPresentation,
  getLayoutAnnotationEmptyCellPlaceholder,
  getLayoutAnnotationNumberOfDecimals,
  getLayoutAnnotationReferenceMetadata,
  getLayoutAnnotationTerritorialDimensionIds,
  setLayoutAnnotationAttachedDataFiles,
  setLayoutAnnotationCriteriaSelection,
  setLayoutAnnotationDataflowKeywords,
  setLayoutAnnotationDataflowNotes,
  setLayoutAnnotationDataflowSource,
  setLayoutAnnotationDecimalSeparator,
  setLayoutAnnotationDefaultPresentation,
  setLayoutAnnotationEmptyCellPlaceholder,
  setLayoutAnnotationNumberOfDecimals,
  setLayoutAnnotationReferenceMetadata,
  setLayoutAnnotationTerritorialDimensionIds
} from "../../utils/annotations";
import MultilanguageZoomableTextArea from "../multilanguage-zoomable-textarea";
import FormList from "../form-list";
import AttachedDataFileForm from "./AttachedDataFileForm";
import DataLanguageSelector from "../data-language-selector";
import {connect} from "react-redux";
import {compose} from "redux";

const formItemLayout = {
  labelCol: {span: SPAN_ONE_THIRD},
  wrapperCol: {span: SPAN_TWO_THIRDS}
};

const DEFAULT_PRESENTATION_OPTION_TABLE = 'Table';
const DEFAULT_PRESENTATION_OPTION_GRAPH = 'Graph';
const DEFAULT_PRESENTATION_OPTION_MAP = 'Map';

const getDefaultPresentationTranslations = t => {

  const defaultPresentationTranslations = t => ({
    [DEFAULT_PRESENTATION_OPTION_TABLE]: t('layoutAnnotations.defaultPresentation.table'),
    [DEFAULT_PRESENTATION_OPTION_GRAPH]: t('layoutAnnotations.defaultPresentation.graph'),
    [DEFAULT_PRESENTATION_OPTION_MAP]: t('layoutAnnotations.defaultPresentation.map')
  });

  return defaultPresentationTranslations(t !== undefined ? t : str => str);
};

const CRITERIA_SELECTION_OPTION_ALL_FULL = 'FullAll';
const CRITERIA_SELECTION_OPTION_ALL_PARTIAL = 'PartialAll';
const CRITERIA_SELECTION_OPTION_STEP_BY_STEP_DYNAMIC = 'Dynamic';
const CRITERIA_SELECTION_OPTION_STEP_BY_STEP_FULL = 'FullStep';
const CRITERIA_SELECTION_OPTION_STEP_BY_STEP_PARTIAL = 'PartialStep';

const getCriteriaSelectionTranslations = t => {

  const criteriaSelectionTranslations = t => ({
    [CRITERIA_SELECTION_OPTION_ALL_FULL]: t('layoutAnnotations.criteriaSelection.allFull'),
    [CRITERIA_SELECTION_OPTION_ALL_PARTIAL]: t('layoutAnnotations.criteriaSelection.allPartial'),
    [CRITERIA_SELECTION_OPTION_STEP_BY_STEP_DYNAMIC]: t('layoutAnnotations.criteriaSelection.stepByStepDynamic'),
    [CRITERIA_SELECTION_OPTION_STEP_BY_STEP_FULL]: t('layoutAnnotations.criteriaSelection.stepByStepFull'),
    [CRITERIA_SELECTION_OPTION_STEP_BY_STEP_PARTIAL]: t('layoutAnnotations.criteriaSelection.stepByStepPartial')
  });

  return criteriaSelectionTranslations(t !== undefined ? t : str => str);
};


const GeneralParameters = ({
                             t,
                             forwardedRef,
                             disabled,
                             dsdDimensions,
                             annotations,
                             annotationsConfig,
                             dataLanguage,
                             appLanguage
                           }) => {

  const [attachedDataFilesLanguage, setAttachedDataFilesLanguage] = useState(dataLanguage || appLanguage);

  const {register, watch, setValue, handleSubmit} = useForm({
    defaultValues: {
      dataflowKeywords: getLayoutAnnotationDataflowKeywords(annotations, annotationsConfig),
      criteriaSelection: getLayoutAnnotationCriteriaSelection(annotations, annotationsConfig),
      defaultPresentation: getLayoutAnnotationDefaultPresentation(annotations, annotationsConfig),
      attachedDataFiles: getLayoutAnnotationAttachedDataFiles(annotations, annotationsConfig) || {},
      decimalSeparator: getLayoutAnnotationDecimalSeparator(annotations, annotationsConfig),
      numberOfDecimals: getLayoutAnnotationNumberOfDecimals(annotations, annotationsConfig),
      referenceMetadata: getLayoutAnnotationReferenceMetadata(annotations, annotationsConfig),
      emptyCellPlaceholder: getLayoutAnnotationEmptyCellPlaceholder(annotations, annotationsConfig),
      dataflowNotes: getLayoutAnnotationDataflowNotes(annotations, annotationsConfig),
      territorialDimensionIds: getLayoutAnnotationTerritorialDimensionIds(annotations, annotationsConfig),
      dataflowSource: getLayoutAnnotationDataflowSource(annotations, annotationsConfig)
    }
  });

  useEffect(() => {
    register({name: 'dataflowKeywords'});
    register({name: 'criteriaSelection'});
    register({name: 'attachedDataFiles'});
    register({name: 'defaultPresentation'});
    register({name: 'decimalSeparator'});
    register({name: 'numberOfDecimals'});
    register({name: 'referenceMetadata'});
    register({name: 'emptyCellPlaceholder'});
    register({name: 'dataflowNotes'});
    register({name: 'territorialDimensionIds'});
    register({name: 'dataflowSource'});
  }, []);

  useImperativeHandle(forwardedRef, () => ({
    submit(annotations, cb) {
      handleSubmit(val => {

        let newLayoutAnnotations = setLayoutAnnotationDataflowKeywords(annotations, annotationsConfig, val.dataflowKeywords);
        newLayoutAnnotations = setLayoutAnnotationCriteriaSelection(newLayoutAnnotations, annotationsConfig, val.criteriaSelection);
        newLayoutAnnotations = setLayoutAnnotationAttachedDataFiles(newLayoutAnnotations, annotationsConfig, val.attachedDataFiles);
        newLayoutAnnotations = setLayoutAnnotationDefaultPresentation(newLayoutAnnotations, annotationsConfig, val.defaultPresentation);
        newLayoutAnnotations = setLayoutAnnotationDecimalSeparator(newLayoutAnnotations, annotationsConfig, val.decimalSeparator);
        newLayoutAnnotations = setLayoutAnnotationNumberOfDecimals(newLayoutAnnotations, annotationsConfig, val.numberOfDecimals);
        newLayoutAnnotations = setLayoutAnnotationReferenceMetadata(newLayoutAnnotations, annotationsConfig, val.referenceMetadata);
        newLayoutAnnotations = setLayoutAnnotationEmptyCellPlaceholder(newLayoutAnnotations, annotationsConfig, val.emptyCellPlaceholder);
        newLayoutAnnotations = setLayoutAnnotationDataflowNotes(newLayoutAnnotations, annotationsConfig, val.dataflowNotes);
        newLayoutAnnotations = setLayoutAnnotationTerritorialDimensionIds(newLayoutAnnotations, annotationsConfig, val.territorialDimensionIds);
        newLayoutAnnotations = setLayoutAnnotationDataflowSource(newLayoutAnnotations, annotationsConfig, val.dataflowSource);

        cb(newLayoutAnnotations);
      })();
    }
  }));


  return (
    <Fragment>
      <Form>
        <DataLanguageProvider value={null}>
          <Row gutter={GUTTER_MD}>
            <Col span={SPAN_HALF}>
              <Form.Item
                label={t('data.nodesConfig.annotations.layoutDataflowKeywords.label')}
                {...formItemLayout}
              >
                <MultilanguageTagsSelect
                  disabled={disabled}
                  value={watch('dataflowKeywords')}
                  onChange={val => setValue('dataflowKeywords', val)}
                />
              </Form.Item>
            </Col>
            <Col span={SPAN_HALF}>
              <Form.Item
                label={t('data.nodesConfig.annotations.layoutCriteriaSelection.label')}
                {...formItemLayout}
              >
                <Select
                  disabled={disabled}
                  title={watch('criteriaSelection')}
                  value={watch('criteriaSelection')}
                  onChange={val => setValue('criteriaSelection', val)}
                >
                  <Select.Option
                    value={null}
                    title={t('layoutAnnotations.empty')}
                  >
                    {t('layoutAnnotations.empty')}
                  </Select.Option>
                  <Select.Option
                    value={CRITERIA_SELECTION_OPTION_ALL_FULL}
                    title={getCriteriaSelectionTranslations(t)[CRITERIA_SELECTION_OPTION_ALL_FULL]}
                  >
                    {getCriteriaSelectionTranslations(t)[CRITERIA_SELECTION_OPTION_ALL_FULL]}
                  </Select.Option>
                  <Select.Option
                    value={CRITERIA_SELECTION_OPTION_ALL_PARTIAL}
                    title={getCriteriaSelectionTranslations(t)[CRITERIA_SELECTION_OPTION_ALL_PARTIAL]}
                  >
                    {getCriteriaSelectionTranslations(t)[CRITERIA_SELECTION_OPTION_ALL_PARTIAL]}
                  </Select.Option>
                  <Select.Option
                    value={CRITERIA_SELECTION_OPTION_STEP_BY_STEP_DYNAMIC}
                    title={getCriteriaSelectionTranslations(t)[CRITERIA_SELECTION_OPTION_STEP_BY_STEP_DYNAMIC]}
                  >
                    {getCriteriaSelectionTranslations(t)[CRITERIA_SELECTION_OPTION_STEP_BY_STEP_DYNAMIC]}
                  </Select.Option>
                  <Select.Option
                    value={CRITERIA_SELECTION_OPTION_STEP_BY_STEP_FULL}
                    title={getCriteriaSelectionTranslations(t)[CRITERIA_SELECTION_OPTION_STEP_BY_STEP_FULL]}
                  >
                    {getCriteriaSelectionTranslations(t)[CRITERIA_SELECTION_OPTION_STEP_BY_STEP_FULL]}
                  </Select.Option>
                  <Select.Option
                    value={CRITERIA_SELECTION_OPTION_STEP_BY_STEP_PARTIAL}
                    title={getCriteriaSelectionTranslations(t)[CRITERIA_SELECTION_OPTION_STEP_BY_STEP_PARTIAL]}
                  >
                    {getCriteriaSelectionTranslations(t)[CRITERIA_SELECTION_OPTION_STEP_BY_STEP_PARTIAL]}
                  </Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={GUTTER_MD}>
            <Col span={SPAN_HALF}>
              <Form.Item
                label={t('data.nodesConfig.annotations.layoutDefaultPresentation.label')}
                {...formItemLayout}
              >
                <Select
                  disabled={disabled}
                  title={watch('defaultPresentation')}
                  value={watch('defaultPresentation')}
                  onChange={val => setValue('defaultPresentation', val)}
                >
                  <Select.Option
                    value={null}
                    title={t('layoutAnnotations.empty')}
                  >
                    {t('layoutAnnotations.empty')}
                  </Select.Option>
                  <Select.Option
                    value={DEFAULT_PRESENTATION_OPTION_TABLE}
                    title={getDefaultPresentationTranslations(t)[DEFAULT_PRESENTATION_OPTION_TABLE]}
                  >
                    {getDefaultPresentationTranslations(t)[DEFAULT_PRESENTATION_OPTION_TABLE]}
                  </Select.Option>
                  <Select.Option
                    value={DEFAULT_PRESENTATION_OPTION_GRAPH}
                    title={getDefaultPresentationTranslations(t)[DEFAULT_PRESENTATION_OPTION_GRAPH]}
                  >
                    {getDefaultPresentationTranslations(t)[DEFAULT_PRESENTATION_OPTION_GRAPH]}
                  </Select.Option>
                  <Select.Option
                    value={DEFAULT_PRESENTATION_OPTION_MAP}
                    title={getDefaultPresentationTranslations(t)[DEFAULT_PRESENTATION_OPTION_MAP]}
                  >
                    {getDefaultPresentationTranslations(t)[DEFAULT_PRESENTATION_OPTION_MAP]}
                  </Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={SPAN_HALF}>
              <Form.Item
                label={t('data.nodesConfig.annotations.layoutDecimalSeparator.label')}
                {...formItemLayout}
              >
                <Select
                  disabled={disabled}
                  title={watch('decimalSeparator')}
                  value={watch('decimalSeparator')}
                  onChange={val => setValue('decimalSeparator', val)}
                >
                  <Select.Option
                    value={null}
                    title={t('layoutAnnotations.empty')}
                  >
                    {t('layoutAnnotations.empty')}
                  </Select.Option>
                  <Select.Option value=".">.</Select.Option>
                  <Select.Option value=",">,</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={GUTTER_MD}>
            <Col span={SPAN_HALF}>
              <Form.Item
                label={t('data.nodesConfig.annotations.layoutNumberOfDecimals.label')}
                {...formItemLayout}
              >
                <InputNumber
                  style={{width: "100%"}}
                  min={0}
                  precision={0}
                  disabled={disabled}
                  title={watch('numberOfDecimals')}
                  value={watch('numberOfDecimals')}
                  onChange={val => setValue('numberOfDecimals', val)}
                />
              </Form.Item>
            </Col>
            <Col span={SPAN_HALF}>
              <Form.Item
                label={t('data.nodesConfig.annotations.layoutReferenceMetadata.label')}
                {...formItemLayout}
              >
                <MultilanguageZoomableTextArea
                  placeholder={t('components.urlInput.placeholder.title')}
                  singleLine
                  disabled={disabled}
                  title={watch('referenceMetadata')}
                  value={watch('referenceMetadata')}
                  onChange={val => setValue('referenceMetadata', val)}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={GUTTER_MD}>
            <Col span={SPAN_HALF}>
              <Form.Item
                label={t('data.nodesConfig.annotations.layoutEmptyCellPlaceholder.label')}
                {...formItemLayout}
              >
                <Input
                  disabled={disabled}
                  title={watch('emptyCellPlaceholder')}
                  value={watch('emptyCellPlaceholder')}
                  onChange={e => setValue('emptyCellPlaceholder', e.target.value)}
                />
              </Form.Item>
            </Col>
            <Col span={SPAN_HALF}>
              <Form.Item
                label={t('data.nodesConfig.annotations.layoutTerritorialDimensionIds.label')}
                {...formItemLayout}
              >
                <Select
                  mode="tags"
                  disabled={disabled}
                  title={watch('territorialDimensionIds')}
                  value={watch('territorialDimensionIds')}
                  onChange={val => setValue('territorialDimensionIds', val)}
                >
                  {(dsdDimensions || []).map(({id}) => <Select.Option key={id} value={id}
                                                                      title={id}>{id}</Select.Option>)}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={GUTTER_MD}>
            <Col span={SPAN_HALF}>
              <Form.Item
                label={t('data.nodesConfig.annotations.layoutDataflowNotes.label')}
                {...formItemLayout}
              >
                <MultilanguageZoomableTextArea
                  placeholder={t('components.urlInput.placeholder.title')}
                  singleLine
                  disabled={disabled}
                  title={watch('dataflowNotes')}
                  value={watch('dataflowNotes')}
                  onChange={val => setValue('dataflowNotes', val)}
                />
              </Form.Item>
            </Col>
            <Col span={SPAN_HALF}>
              <Form.Item
                label={t('data.nodesConfig.annotations.layoutDataflowSource.label')}
                {...formItemLayout}
              >
                <MultilanguageZoomableTextArea
                  placeholder={t('components.urlInput.placeholder.title')}
                  singleLine
                  disabled={disabled}
                  title={watch('dataflowSource')}
                  value={watch('dataflowSource')}
                  onChange={val => setValue('dataflowSource', val)}
                />
              </Form.Item>
            </Col>
          </Row>
        </DataLanguageProvider>
      </Form>
      <Card
        type="inner"
        style={{marginTop: MARGIN_MD}}
      >
        <Row type="flex" justify="space-between">
          <Col>
            <Form.Item label={t('data.nodesConfig.annotations.layoutAttachedDataFiles.label')}/>
          </Col>
          <Col>
            <DataLanguageSelector
              value={attachedDataFilesLanguage}
              size="small"
              onSelect={selected => setAttachedDataFilesLanguage(selected)}
            />
          </Col>
        </Row>
        <FormList
          compact
          disabled={disabled}
          values={watch('attachedDataFiles')[attachedDataFilesLanguage] || []}
          Component={AttachedDataFileForm}
          newItem={{
            format: null,
            url: null
          }}
          addItemLabel={t('components.layoutAnnotationsForm.generalParameters.attachedDataFiles.modal.addButton.title')}
          removeItemLabel={t('components.layoutAnnotationsForm.generalParameters.attachedDataFiles.modal.removeButton.title')}
          onChange={val => {
            const newAttachedDataFiles = watch('attachedDataFiles');
            newAttachedDataFiles[attachedDataFilesLanguage] = val;
            setValue('attachedDataFiles', newAttachedDataFiles);
          }}
        />
      </Card>
    </Fragment>
  );
};

const ConnectedGeneralParameters = compose(
  withDataLanguage(),
  connect(state => ({
    appLanguage: state.app.language
  })))(GeneralParameters);

export default forwardRef(
  (props, ref) =>
    <ConnectedGeneralParameters {...props} forwardedRef={ref}/>
);