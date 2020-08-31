import React, {Fragment} from 'react';
import {compose} from "redux";
import {connect} from "react-redux";
import {translate} from 'react-i18next';
import {
  changeCompareItemSchemesArtefactType,
  changeCompareItemSchemesCsvProps,
  changeCompareItemSchemesFormat,
  downloadCompareItemSchemesCompare,
  hideCompareItemSchemesArtefacts,
  hideCompareItemSchemesCompare,
  readCompareItemSchemesArtefacts,
  readCompareItemSchemesCompare,
  setCompareItemSchemesArtefact,
  setCompareItemSchemesFile,
  showCompareItemSchemesArtefacts,
  unsetCompareItemSchemesArtefact
} from "./actions";
import {Button, Col, Radio, Row} from "antd";
import {GUTTER_MD, GUTTER_SM, MARGIN_MD, MODAL_WIDTH_LG, SPAN_HALF} from "../../../styles/constants";
import ArtefactSelectorCard from "./ArtefactSelectorCard";
import {
  COMPARE_ITEM_SCHEMES_ARTEFACT_TYPE_CATEGORY_SCHEME,
  COMPARE_ITEM_SCHEMES_ARTEFACT_TYPE_CODELIST,
  COMPARE_ITEM_SCHEMES_ARTEFACT_TYPE_CONCEPT_SCHEME,
  COMPARE_ITEM_SCHEMES_FORMAT_TYPE_CSV,
  UTILITIES_COMPARE_ITEM_SCHEMES_CATEGORY_SCHEME_DETAIL_PREFIX,
  UTILITIES_COMPARE_ITEM_SCHEMES_CODELIST_DETAIL_PREFIX,
  UTILITIES_COMPARE_ITEM_SCHEMES_CONCEPT_SCHEME_DETAIL_PREFIX
} from "./reducer";
import EnhancedModal from "../../../components/enhanced-modal";
import Call from "../../../hocs/call";
import ArtefactList from "../../../components/artefact-list";
import ItemSchemesCompareReport from "../../../components/item-schemes-compare-report";
import ReduxCodelistDetailModal from "../../../redux-components/redux-codelist-detail-modal";
import ReduxConceptSchemeDetailModal from "../../../redux-components/redux-concept-scheme-detail-modal";
import ReduxCategorySchemeDetailModal from "../../../redux-components/redux-category-scheme-detail-modal";
import {reuseAction} from "../../../utils/reduxReuse";
import {showCodelistDetail} from "../../../redux-components/redux-codelist-detail-modal/actions";
import {showConceptSchemeDetail} from "../../../redux-components/redux-concept-scheme-detail-modal/actions";
import {showCategorySchemeDetail} from "../../../redux-components/redux-category-scheme-detail-modal/actions";

const mapStateToProps = state => ({
  nodeId: state.app.endpointId,
  nodes: state.config.nodes,
  lang: state.app.language,
  artefactType: state.scenes.utilities.compareItemSchemes.artefactType,
  sourceFormat: state.scenes.utilities.compareItemSchemes.sourceFormat,
  targetFormat: state.scenes.utilities.compareItemSchemes.targetFormat,
  source: state.scenes.utilities.compareItemSchemes.source,
  target: state.scenes.utilities.compareItemSchemes.target,
  isArtefactsVisible: state.scenes.utilities.compareItemSchemes.isArtefactsVisible,
  artefacts: state.scenes.utilities.compareItemSchemes.artefacts,
  codelistDetail: state.scenes.utilities.compareItemSchemes.codelistDetail,
  conceptSchemeDetail: state.scenes.utilities.compareItemSchemes.conceptSchemeDetail,
  categorySchemeDetail: state.scenes.utilities.compareItemSchemes.categorySchemeDetail,
  sourceCsvProps: state.scenes.utilities.compareItemSchemes.sourceCsvProps,
  targetCsvProps: state.scenes.utilities.compareItemSchemes.targetCsvProps,
  report: state.scenes.utilities.compareItemSchemes.report,
});

const mapDispatchToProps = dispatch => ({
  onArtefactTypeChange: artefactType => dispatch(changeCompareItemSchemesArtefactType(artefactType)),
  onFormatChange: (isSource, format, lang) => dispatch(changeCompareItemSchemesFormat(isSource, format, lang)),
  onCsvPropsChange: (isSource, fields) => dispatch(changeCompareItemSchemesCsvProps(isSource, fields)),
  onFileSet: (isSource, file) => dispatch(setCompareItemSchemesFile(isSource, file)),
  onArtefactsShow: isSource => dispatch(showCompareItemSchemesArtefacts(isSource)),
  onArtefactsHide: () => dispatch(hideCompareItemSchemesArtefacts()),
  fetchArtefacts: artefactType => dispatch(readCompareItemSchemesArtefacts(artefactType)),
  onArtefactSet: artefactTriplet => dispatch(setCompareItemSchemesArtefact(artefactTriplet)),
  onArtefactUnset: isSource => dispatch(unsetCompareItemSchemesArtefact(isSource)),
  onCodelistDetail: (codelistTriplet, defaultItemsViewMode) =>
    dispatch(reuseAction(showCodelistDetail(codelistTriplet, defaultItemsViewMode), UTILITIES_COMPARE_ITEM_SCHEMES_CODELIST_DETAIL_PREFIX)),
  onConceptSchemeDetail: (conceptSchemeTriplet, defaultItemsViewMode) =>
    dispatch(reuseAction(showConceptSchemeDetail(conceptSchemeTriplet, defaultItemsViewMode), UTILITIES_COMPARE_ITEM_SCHEMES_CONCEPT_SCHEME_DETAIL_PREFIX)),
  onCategorySchemeDetail: (categorySchemeTriplet, defaultItemsViewMode) =>
    dispatch(reuseAction(showCategorySchemeDetail(categorySchemeTriplet, defaultItemsViewMode), UTILITIES_COMPARE_ITEM_SCHEMES_CATEGORY_SCHEME_DETAIL_PREFIX)),
  fetchCompare: (artefactType, source, sourceFormat, sourceCsvProps, target, targetFormat, targetCsvProps) =>
    dispatch(readCompareItemSchemesCompare(artefactType, source, sourceFormat, sourceCsvProps, target, targetFormat, targetCsvProps)),
  onCompareHide: () => dispatch(hideCompareItemSchemesCompare()),
  onCompareDownload: (artefactType, lang, source, sourceFormat, sourceCsvProps, target, targetFormat, targetCsvProps) =>
    dispatch(downloadCompareItemSchemesCompare(artefactType, lang, source, sourceFormat, sourceCsvProps, target, targetFormat, targetCsvProps)),
});

const CompareItemSchemes = ({
                              t,
                              nodeId,
                              nodes,
                              lang,
                              artefactType,
                              sourceFormat,
                              targetFormat,
                              source,
                              target,
                              isArtefactsVisible,
                              artefacts,
                              codelistDetail,
                              conceptSchemeDetail,
                              categorySchemeDetail,
                              sourceCsvProps,
                              targetCsvProps,
                              report,
                              onArtefactTypeChange,
                              onFormatChange,
                              onCsvPropsChange,
                              onFileSet,
                              onArtefactsShow,
                              onArtefactsHide,
                              fetchArtefacts,
                              onArtefactSet,
                              onArtefactUnset,
                              onCodelistDetail,
                              onConceptSchemeDetail,
                              onCategorySchemeDetail,
                              fetchCompare,
                              onCompareHide,
                              onCompareDownload
                            }) => {

  const defaultItemsViewMode = nodes.find(node => node.general.id === nodeId).general.defaultItemsViewMode;

  return (
    <Fragment>
      <Row type="flex" justify="space-between" style={{marginBottom: MARGIN_MD}}>
        <Col>
          <Row type="flex" gutter={GUTTER_MD} align="middle">
            <Col>
              {t("scenes.utilities.compareItemSchemes.selectArtefactType.label")}
            </Col>
            <Col>
              <Radio.Group
                value={artefactType}
                onChange={({target}) => onArtefactTypeChange(target.value)}
              >
                <Radio.Button value={COMPARE_ITEM_SCHEMES_ARTEFACT_TYPE_CODELIST}>
                  Codelists
                </Radio.Button>
                <Radio.Button value={COMPARE_ITEM_SCHEMES_ARTEFACT_TYPE_CATEGORY_SCHEME}>
                  Category Schemes
                </Radio.Button>
                <Radio.Button value={COMPARE_ITEM_SCHEMES_ARTEFACT_TYPE_CONCEPT_SCHEME}>
                  Concept Schemes
                </Radio.Button>
              </Radio.Group>
            </Col>
          </Row>
        </Col>
        <Col>
          <Row type="flex" justify="center" gutter={GUTTER_SM}>
            <Col>
              <Button
                type="primary"
                onClick={
                  () => fetchCompare(artefactType, source, sourceFormat, sourceCsvProps, target, targetFormat, targetCsvProps)
                }
                disabled={
                  !source || !target || (
                    sourceFormat === COMPARE_ITEM_SCHEMES_FORMAT_TYPE_CSV &&
                    (!sourceCsvProps.lang || !sourceCsvProps.textSeparator || sourceCsvProps.textSeparator.length < 1)
                  ) || (
                    targetFormat === COMPARE_ITEM_SCHEMES_FORMAT_TYPE_CSV &&
                    (!targetCsvProps.lang || !targetCsvProps.textSeparator || targetCsvProps.textSeparator.length < 1)
                  )
                }
              >
                {t("scenes.utilities.compareItemSchemes.buttons.compare.title")}
              </Button>
            </Col>
            <Col>
              <Button
                type="primary"
                onClick={
                  () => onCompareDownload(artefactType, lang, source, sourceFormat, sourceCsvProps, target, targetFormat, targetCsvProps)
                }
                disabled={
                  !source || !target || (
                    sourceFormat === COMPARE_ITEM_SCHEMES_FORMAT_TYPE_CSV &&
                    (!sourceCsvProps.lang || !sourceCsvProps.textSeparator || sourceCsvProps.textSeparator.length < 1)
                  ) || (
                    targetFormat === COMPARE_ITEM_SCHEMES_FORMAT_TYPE_CSV &&
                    (!targetCsvProps.lang || !targetCsvProps.textSeparator || targetCsvProps.textSeparator.length < 1)
                  )
                }
              >
                {t("scenes.utilities.compareItemSchemes.buttons.generateReport.title")}
              </Button>
            </Col>
          </Row>
        </Col>
      </Row>
      <Row gutter={GUTTER_MD} style={{marginBottom: MARGIN_MD}}>
        <Col span={SPAN_HALF}>
          <ArtefactSelectorCard
            artefactType
            title={
              (artefactType === COMPARE_ITEM_SCHEMES_ARTEFACT_TYPE_CODELIST
                  ? "Codelist"
                  : artefactType === COMPARE_ITEM_SCHEMES_ARTEFACT_TYPE_CONCEPT_SCHEME
                    ? "Concept Scheme"
                    : "Category Scheme"
              ) + " 1"
            }
            format={sourceFormat}
            onFormatChange={format => onFormatChange(true, format, lang)}
            artefact={source}
            csvProps={sourceCsvProps}
            onArtefactDetailShow={() => artefactType === COMPARE_ITEM_SCHEMES_ARTEFACT_TYPE_CODELIST
              ? onCodelistDetail(source, defaultItemsViewMode)
              : artefactType === COMPARE_ITEM_SCHEMES_ARTEFACT_TYPE_CONCEPT_SCHEME
                ? onConceptSchemeDetail(source, defaultItemsViewMode)
                : onCategorySchemeDetail(source, defaultItemsViewMode)
            }
            onArtefactsShow={() => onArtefactsShow(true)}
            onArtefactUnset={() => onArtefactUnset(true)}
            onFileSet={file => onFileSet(true, file)}
            onCsvPropsChange={fields => onCsvPropsChange(true, fields)}
          />
        </Col>
        <Col span={SPAN_HALF}>
          <ArtefactSelectorCard
            artefactType
            title={
              (artefactType === COMPARE_ITEM_SCHEMES_ARTEFACT_TYPE_CODELIST
                  ? "Codelist"
                  : artefactType === COMPARE_ITEM_SCHEMES_ARTEFACT_TYPE_CONCEPT_SCHEME
                    ? "Concept Scheme"
                    : "Category Scheme"
              ) + " 2"
            }
            format={targetFormat}
            onFormatChange={format => onFormatChange(false, format, lang)}
            artefact={target}
            csvProps={targetCsvProps}
            onArtefactDetailShow={() => artefactType === COMPARE_ITEM_SCHEMES_ARTEFACT_TYPE_CODELIST
              ? onCodelistDetail(target, defaultItemsViewMode)
              : artefactType === COMPARE_ITEM_SCHEMES_ARTEFACT_TYPE_CONCEPT_SCHEME
                ? onConceptSchemeDetail(target, defaultItemsViewMode)
                : onCategorySchemeDetail(target, defaultItemsViewMode)
            }
            onArtefactsShow={() => onArtefactsShow(false)}
            onArtefactUnset={() => onArtefactUnset(false)}
            onFileSet={file => onFileSet(false, file)}
            onCsvPropsChange={fields => onCsvPropsChange(false, fields)}
          />
        </Col>
      </Row>
      <EnhancedModal
        visible={isArtefactsVisible}
        onCancel={onArtefactsHide}
        title={t('scenes.utilities.compareItemSchemes.modals.artefactList.title')}
        width={MODAL_WIDTH_LG}
        footer={<Button onClick={onArtefactsHide}>{t('commons.buttons.close.title')}</Button>}
      >
        <Call cb={fetchArtefacts} cbParam={artefactType}>
          <ArtefactList
            artefacts={artefacts}
            onRowClick={({id, agencyID, version}) => onArtefactSet({id, agencyID, version})}
            onDetailShow={({id, agencyID, version}) => artefactType === COMPARE_ITEM_SCHEMES_ARTEFACT_TYPE_CODELIST
              ? onCodelistDetail({id, agencyID, version}, defaultItemsViewMode)
              : artefactType === COMPARE_ITEM_SCHEMES_ARTEFACT_TYPE_CONCEPT_SCHEME
                ? onConceptSchemeDetail({id, agencyID, version}, defaultItemsViewMode)
                : onCategorySchemeDetail({id, agencyID, version}, defaultItemsViewMode)
            }
          />
        </Call>
      </EnhancedModal>
      <EnhancedModal
        visible={report !== null && report !== undefined}
        onCancel={onCompareHide}
        title={t('scenes.utilities.compareItemSchemes.modals.itemSchemeCompareReport.title')}
        width={MODAL_WIDTH_LG}
        footer={<Button onClick={onCompareHide}>{t('commons.buttons.close.title')}</Button>}
        withDataLanguageSelector
      >
        <ItemSchemesCompareReport
          report={report}
          onDetailShow={source => artefactType === COMPARE_ITEM_SCHEMES_ARTEFACT_TYPE_CODELIST
            ? onCodelistDetail(source, defaultItemsViewMode)
            : artefactType === COMPARE_ITEM_SCHEMES_ARTEFACT_TYPE_CONCEPT_SCHEME
              ? onConceptSchemeDetail(source, defaultItemsViewMode)
              : onCategorySchemeDetail(source, defaultItemsViewMode)
          }
        />
      </EnhancedModal>
      <ReduxCodelistDetailModal
        instancePrefix={UTILITIES_COMPARE_ITEM_SCHEMES_CODELIST_DETAIL_PREFIX}
        instanceState={codelistDetail}
      />
      <ReduxConceptSchemeDetailModal
        instancePrefix={UTILITIES_COMPARE_ITEM_SCHEMES_CONCEPT_SCHEME_DETAIL_PREFIX}
        instanceState={conceptSchemeDetail}
      />
      <ReduxCategorySchemeDetailModal
        instancePrefix={UTILITIES_COMPARE_ITEM_SCHEMES_CATEGORY_SCHEME_DETAIL_PREFIX}
        instanceState={categorySchemeDetail}
      />
    </Fragment>
  )
};

export default compose(
  translate(),
  connect(mapStateToProps, mapDispatchToProps)
)(CompareItemSchemes);
