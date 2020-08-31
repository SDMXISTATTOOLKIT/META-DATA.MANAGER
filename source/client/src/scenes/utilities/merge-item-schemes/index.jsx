import React, {Fragment} from 'react';
import {compose} from "redux";
import {connect} from "react-redux";
import {translate} from 'react-i18next';
import {
  changeMergeItemSchemesArtefactType,
  changeMergeItemSchemesCodelistMergePreviewLang,
  changeMergeItemSchemesCsvProps,
  changeMergeItemSchemesFormat,
  changeMergeItemSchemesMerge,
  changeMergeItemSchemesXmlPreviewLang,
  hideMergeItemSchemesArtefacts,
  hideMergeItemSchemesMerge,
  hideMergeItemSchemesMergePreview,
  hideMergeItemSchemesPreview,
  MERGE_ITEM_SCHEMES_ARTEFACT_TYPE_CATEGORY_SCHEME,
  MERGE_ITEM_SCHEMES_ARTEFACT_TYPE_CODELIST,
  MERGE_ITEM_SCHEMES_ARTEFACT_TYPE_CONCEPT_SCHEME,
  MERGE_ITEM_SCHEMES_FORMAT_TYPE_CSV,
  readMergeItemSchemesArtefacts,
  readMergeItemSchemesCodelistPage,
  readMergeItemSchemesCsvPage,
  readMergeItemSchemesMergePreview,
  readMergeItemSchemesXmlPreview,
  readMergeItemSchemesXmlPreviewPage,
  setMergeItemSchemesArtefact,
  setMergeItemSchemesFile,
  showMergeItemSchemesArtefacts,
  showMergeItemSchemesMerge,
  submitMergeItemSchemesMerge,
  unsetMergeItemSchemesArtefact,
  updateMergeItemSchemesCodelistMergePreviewParams,
  updateMergeItemSchemesXmlPreviewParams,
  uploadMergeItemSchemesCsvFile
} from "./actions";
import {Alert, Button, Col, Icon, Radio, Row} from "antd";
import {
  GUTTER_MD,
  MARGIN_MD,
  MODAL_WIDTH_LG,
  MODAL_WIDTH_MD,
  SPAN_HALF,
  TABLE_COL_MIN_WIDTH_ID,
  TABLE_COL_MIN_WIDTH_NAME
} from "../../../styles/constants";
import ArtefactSelectorCard from "./ArtefactSelectorCard";
import {
  UTILITIES_MERGE_ITEM_SCHEMES_CATEGORY_SCHEME_DETAIL_PREFIX,
  UTILITIES_MERGE_ITEM_SCHEMES_CODELIST_DETAIL_PREFIX,
  UTILITIES_MERGE_ITEM_SCHEMES_CONCEPT_SCHEME_DETAIL_PREFIX
} from "./reducer";
import EnhancedModal from "../../../components/enhanced-modal";
import Call from "../../../hocs/call";
import ArtefactList from "../../../components/artefact-list";
import ReduxCodelistDetailModal from "../../../redux-components/redux-codelist-detail-modal";
import ReduxConceptSchemeDetailModal from "../../../redux-components/redux-concept-scheme-detail-modal";
import ReduxCategorySchemeDetailModal from "../../../redux-components/redux-category-scheme-detail-modal";
import {reuseAction} from "../../../utils/reduxReuse";
import {showCodelistDetail} from "../../../redux-components/redux-codelist-detail-modal/actions";
import {showConceptSchemeDetail} from "../../../redux-components/redux-concept-scheme-detail-modal/actions";
import {showCategorySchemeDetail} from "../../../redux-components/redux-category-scheme-detail-modal/actions";
import ItemList from "../../../components/item-list";
import {DataLanguageConsumer} from "../../../contexts/DataLanguage";
import {isArtefactValid} from "../../../utils/artefactValidators";
import InfiniteScrollDataTable from "../../../components/infinite-scroll-data-table";
import {getFilterObjFromViewerObj} from "../../../utils/filter";
import InfiniteScrollTable from "../../../components/infinite-scroll-table";
import ArtefactMinForm, {ARTEFACT_MIN_FORM_MODE_CREATE} from "../../../components/artefact-min-form";

const mapStateToProps = state => ({
  nodeId: state.app.endpointId,
  nodes: state.config.nodes,
  permissions: state.app.user.permissions,
  appLang: state.app.language,
  artefactType: state.scenes.utilities.mergeItemSchemes.artefactType,
  sourceFormat: state.scenes.utilities.mergeItemSchemes.sourceFormat,
  targetFormat: state.scenes.utilities.mergeItemSchemes.targetFormat,
  source: state.scenes.utilities.mergeItemSchemes.source,
  target: state.scenes.utilities.mergeItemSchemes.target,
  isArtefactsVisible: state.scenes.utilities.mergeItemSchemes.isArtefactsVisible,
  artefacts: state.scenes.utilities.mergeItemSchemes.artefacts,
  codelistDetail: state.scenes.utilities.mergeItemSchemes.codelistDetail,
  conceptSchemeDetail: state.scenes.utilities.mergeItemSchemes.conceptSchemeDetail,
  categorySchemeDetail: state.scenes.utilities.mergeItemSchemes.categorySchemeDetail,
  sourceCsvProps: state.scenes.utilities.mergeItemSchemes.sourceCsvProps,
  targetCsvProps: state.scenes.utilities.mergeItemSchemes.targetCsvProps,
  isMergeVisible: state.scenes.utilities.mergeItemSchemes.isMergeVisible,
  mergedItems: state.scenes.utilities.mergeItemSchemes.mergedItems,
  mergedItemScheme: state.scenes.utilities.mergeItemSchemes.mergedItemScheme,
  mergedItemsFromServer: state.scenes.utilities.mergeItemSchemes.mergedItemsFromServer,
  mergeCodelistTriplet: state.scenes.utilities.mergeItemSchemes.mergeCodelistTriplet,
  mergeCodelistItemCount: state.scenes.utilities.mergeItemSchemes.mergeCodelistItemCount,
  mergeCodelistFetchParams: state.scenes.utilities.mergeItemSchemes.mergeCodelistFetchParams,
  agencies: state.scenes.utilities.mergeItemSchemes.agencies,
  isSourcePreview: state.scenes.utilities.mergeItemSchemes.isSourcePreview,
  isXmlPreviewVisible: state.scenes.utilities.mergeItemSchemes.isXmlPreviewVisible,
  isCsvPreviewVisible: state.scenes.utilities.mergeItemSchemes.isCsvPreviewVisible,
  previewItems: state.scenes.utilities.mergeItemSchemes.previewItems,
  previewItemCount: state.scenes.utilities.mergeItemSchemes.previewItemCount,
  previewCodelistTriplet: state.scenes.utilities.mergeItemSchemes.previewCodelistTriplet,
  previewItemParams: state.scenes.utilities.mergeItemSchemes.previewItemParams,
  csvFilePath: state.scenes.utilities.mergeItemSchemes.csvFilePath,
  allCsvRows: state.scenes.utilities.mergeItemSchemes.allCsvRows,
  mergeConflict: state.scenes.utilities.mergeItemSchemes.mergeConflict,
});

const mapDispatchToProps = dispatch => ({
  onArtefactTypeChange: artefactType => dispatch(changeMergeItemSchemesArtefactType(artefactType)),
  onFormatChange: (isSource, format, lang) => dispatch(changeMergeItemSchemesFormat(isSource, format, lang)),
  onCsvPropsChange: (isSource, fields) => dispatch(changeMergeItemSchemesCsvProps(isSource, fields)),
  onFileSet: (isSource, file) => dispatch(setMergeItemSchemesFile(isSource, file)),
  onArtefactsShow: isSource => dispatch(showMergeItemSchemesArtefacts(isSource)),
  onArtefactsHide: () => dispatch(hideMergeItemSchemesArtefacts()),
  fetchArtefacts: artefactType => dispatch(readMergeItemSchemesArtefacts(artefactType)),
  onArtefactSet: artefactTriplet => dispatch(setMergeItemSchemesArtefact(artefactTriplet)),
  onArtefactUnset: isSource => dispatch(unsetMergeItemSchemesArtefact(isSource)),
  onCodelistDetail: (codelistTriplet, defaultItemsViewMode) =>
    dispatch(reuseAction(showCodelistDetail(codelistTriplet, defaultItemsViewMode), UTILITIES_MERGE_ITEM_SCHEMES_CODELIST_DETAIL_PREFIX)),
  onConceptSchemeDetail: (conceptSchemeTriplet, defaultItemsViewMode) =>
    dispatch(reuseAction(showConceptSchemeDetail(conceptSchemeTriplet, defaultItemsViewMode), UTILITIES_MERGE_ITEM_SCHEMES_CONCEPT_SCHEME_DETAIL_PREFIX)),
  onCategorySchemeDetail: (categorySchemeTriplet, defaultItemsViewMode) =>
    dispatch(reuseAction(showCategorySchemeDetail(categorySchemeTriplet, defaultItemsViewMode), UTILITIES_MERGE_ITEM_SCHEMES_CATEGORY_SCHEME_DETAIL_PREFIX)),
  fetchMergePreview: (artefactType, source, sourceFormat, sourceCsvProps, target, targetFormat, targetCsvProps, lang) =>
    dispatch(readMergeItemSchemesMergePreview(artefactType, source, sourceFormat, sourceCsvProps, target, targetFormat, targetCsvProps, lang)),
  onMergePreviewHide: () => dispatch(hideMergeItemSchemesMergePreview()),
  onCodesParamsUpdate: fetchPageParams => dispatch(updateMergeItemSchemesCodelistMergePreviewParams(fetchPageParams)),
  onCodesLangChange: lang => dispatch(changeMergeItemSchemesCodelistMergePreviewLang(lang)),
  fetchCodesPage: ({triplet, lang, pageNum, pageSize, searchText, filters, sortCol, sortByDesc, rebuildDb}) =>
    dispatch(readMergeItemSchemesCodelistPage(triplet, lang, pageNum, pageSize, searchText, filters, sortCol, sortByDesc, rebuildDb)),
  onMergeShow: () => dispatch(showMergeItemSchemesMerge()),
  onMergeHide: () => dispatch(hideMergeItemSchemesMerge()),
  onMergeChange: fields => dispatch(changeMergeItemSchemesMerge(fields)),
  onMergeSubmit: (artefactType, mergedItemScheme, mergedItemsFromServer, lang) =>
    dispatch(submitMergeItemSchemesMerge(artefactType, mergedItemScheme, mergedItemsFromServer, lang)),
  onPreviewHide: () => dispatch(hideMergeItemSchemesPreview()),
  fetchXmlPreview: ({artefactType, file, lang}) => dispatch(readMergeItemSchemesXmlPreview(artefactType, file, lang)),
  onXmlPreviewParamsUpdate: fetchPageParams => dispatch(updateMergeItemSchemesXmlPreviewParams(fetchPageParams)),
  onXmlPreviewLangChange: lang => dispatch(changeMergeItemSchemesXmlPreviewLang(lang)),
  fetchXmlPreviewPage: ({triplet, lang, pageNum, pageSize, searchText, filters, sortCol, sortByDesc, rebuildDb}) =>
    dispatch(readMergeItemSchemesXmlPreviewPage(triplet, lang, pageNum, pageSize, searchText, filters, sortCol, sortByDesc, rebuildDb)),
  onCsvFileUpload: file => dispatch(uploadMergeItemSchemesCsvFile(file)),
  fetchCsvRows: (pageNum, pageSize, filterTable, sortCols, sortByDesc, separator, delimiter, hasHeader, filePath) =>
    dispatch(readMergeItemSchemesCsvPage(pageNum, pageSize, filterTable, sortCols, sortByDesc, separator, delimiter, hasHeader, filePath)),
});

const MergeItemSchemes = ({
                            t,
                            nodeId,
                            nodes,
                            permissions,
                            appLang,
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
                            isMergeVisible,
                            mergedItems,
                            mergedItemScheme,
                            mergedItemsFromServer,
                            mergeCodelistTriplet,
                            mergeCodelistItemCount,
                            mergeCodelistFetchParams,
                            agencies,
                            isSourcePreview,
                            isXmlPreviewVisible,
                            isCsvPreviewVisible,
                            previewItems,
                            previewItemCount,
                            previewCodelistTriplet,
                            previewItemParams,
                            csvFilePath,
                            allCsvRows,
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
                            fetchMergePreview,
                            onMergePreviewHide,
                            fetchCodesPage,
                            onCodesParamsUpdate,
                            onCodesLangChange,
                            onMergeShow,
                            onMergeHide,
                            onMergeChange,
                            onMergeSubmit,
                            onPreviewHide,
                            fetchXmlPreview,
                            onXmlPreviewParamsUpdate,
                            onXmlPreviewLangChange,
                            fetchXmlPreviewPage,
                            onCsvFileUpload,
                            fetchCsvRows,
                            mergeConflict
                          }) => {

  const defaultItemsViewMode = nodes.find(node => node.general.id === nodeId).general.defaultItemsViewMode;

  return (
    <Fragment>
      <Row type="flex" justify="space-between" style={{marginBottom: MARGIN_MD}}>
        <Col>
          <Row type="flex" gutter={GUTTER_MD} align="middle">
            <Col>
              {t("scenes.utilities.mergeItemSchemes.selectArtefactType.label")}
            </Col>
            <Col>
              <Radio.Group
                value={artefactType}
                onChange={({target}) => onArtefactTypeChange(target.value)}
              >
                <Radio.Button value={MERGE_ITEM_SCHEMES_ARTEFACT_TYPE_CODELIST}>
                  Codelists
                </Radio.Button>
                <Radio.Button value={MERGE_ITEM_SCHEMES_ARTEFACT_TYPE_CATEGORY_SCHEME}>
                  Category Schemes
                </Radio.Button>
                <Radio.Button value={MERGE_ITEM_SCHEMES_ARTEFACT_TYPE_CONCEPT_SCHEME}>
                  Concept Schemes
                </Radio.Button>
              </Radio.Group>
            </Col>
          </Row>
        </Col>
        <Col>
          <Button
            type="primary"
            onClick={
              () => fetchMergePreview(artefactType, source, sourceFormat, sourceCsvProps, target, targetFormat, targetCsvProps, appLang)
            }
            disabled={
              !source || !target || (
                sourceFormat === MERGE_ITEM_SCHEMES_FORMAT_TYPE_CSV &&
                (!sourceCsvProps.lang || !sourceCsvProps.textSeparator || sourceCsvProps.textSeparator.length < 1)
              ) || (
                targetFormat === MERGE_ITEM_SCHEMES_FORMAT_TYPE_CSV &&
                (!targetCsvProps.lang || !targetCsvProps.textSeparator || targetCsvProps.textSeparator.length < 1)
              )
            }
          >
            {t("scenes.utilities.mergeItemSchemes.buttons.merge.title")}
          </Button>
        </Col>
      </Row>
      <Row gutter={GUTTER_MD} style={{marginBottom: MARGIN_MD}}>
        <Col span={SPAN_HALF}>
          <ArtefactSelectorCard
            isSource={true}
            title={
              (artefactType === MERGE_ITEM_SCHEMES_ARTEFACT_TYPE_CODELIST
                  ? "Codelist"
                  : artefactType === MERGE_ITEM_SCHEMES_ARTEFACT_TYPE_CONCEPT_SCHEME
                    ? "Concept Scheme"
                    : "Category Scheme"
              ) + " 1"
            }
            format={sourceFormat}
            onFormatChange={format => onFormatChange(true, format, appLang)}
            artefact={source}
            csvProps={sourceCsvProps}
            onArtefactDetailShow={() => artefactType === MERGE_ITEM_SCHEMES_ARTEFACT_TYPE_CODELIST
              ? onCodelistDetail(source, defaultItemsViewMode)
              : artefactType === MERGE_ITEM_SCHEMES_ARTEFACT_TYPE_CONCEPT_SCHEME
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
            isSource={false}
            title={
              (artefactType === MERGE_ITEM_SCHEMES_ARTEFACT_TYPE_CODELIST
                  ? "Codelist"
                  : artefactType === MERGE_ITEM_SCHEMES_ARTEFACT_TYPE_CONCEPT_SCHEME
                    ? "Concept Scheme"
                    : "Category Scheme"
              ) + " 2"
            }
            format={targetFormat}
            onFormatChange={format => onFormatChange(false, format, appLang)}
            artefact={target}
            csvProps={targetCsvProps}
            onArtefactDetailShow={() => artefactType === MERGE_ITEM_SCHEMES_ARTEFACT_TYPE_CODELIST
              ? onCodelistDetail(target, defaultItemsViewMode)
              : artefactType === MERGE_ITEM_SCHEMES_ARTEFACT_TYPE_CONCEPT_SCHEME
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
        title={t('scenes.utilities.mergeItemSchemes.modals.artefactList.title')}
        width={MODAL_WIDTH_LG}
        footer={<Button onClick={onArtefactsHide}>{t('commons.buttons.close.title')}</Button>}
      >
        <Call cb={fetchArtefacts} cbParam={artefactType}>
          <ArtefactList
            artefacts={artefacts}
            onRowClick={({id, agencyID, version}) => onArtefactSet({id, agencyID, version})}
            onDetailShow={({id, agencyID, version}) => artefactType === MERGE_ITEM_SCHEMES_ARTEFACT_TYPE_CODELIST
              ? onCodelistDetail({id, agencyID, version}, defaultItemsViewMode)
              : artefactType === MERGE_ITEM_SCHEMES_ARTEFACT_TYPE_CONCEPT_SCHEME
                ? onConceptSchemeDetail({id, agencyID, version}, defaultItemsViewMode)
                : onCategorySchemeDetail({id, agencyID, version}, defaultItemsViewMode)
            }
          />
        </Call>
      </EnhancedModal>
      <EnhancedModal
        visible={mergedItems !== null}
        onCancel={onMergePreviewHide}
        title={t('scenes.utilities.mergeItemSchemes.modals.mergePreview.title')}
        width={MODAL_WIDTH_LG}
        footer={
          <div>
            <Button onClick={onMergePreviewHide}>{t('commons.buttons.close.title')}</Button>
            <Button
              type="primary"
              onClick={() => onMergeShow(permissions ? permissions.agencies : undefined)}
            >
              {t('commons.buttons.goForward.title')}
            </Button>
          </div>
        }
        withDataLanguageSelector
        onDataLanguageSelectorChange={
          (lang, changeLang) => {
            onCodesLangChange(lang);
            changeLang();
          }
        }
      >
        {
          mergeConflict && (
            <Alert
              type="warning"
              showIcon
              message={t('scenes.utilities.mergeItemSchemes.modals.mergePreview.mergedWithConflicts.message')}
            />
          )
        }
        <DataLanguageConsumer>
          {dataLanguage => {
            const lang = dataLanguage || appLang;
            return (
              <Call
                cb={fetchCodesPage}
                cbParam={mergeCodelistFetchParams}
                disabled={artefactType !== MERGE_ITEM_SCHEMES_ARTEFACT_TYPE_CODELIST || !mergeCodelistFetchParams}
              >
                <InfiniteScrollTable
                  data={mergedItems}
                  getRowKey={({id}) => id}
                  columns={[
                    {
                      title: t('data.item.id.shortLabel'),
                      dataIndex: 'id',
                      minWidth: TABLE_COL_MIN_WIDTH_ID
                    },
                    {
                      title: t('data.item.name.shortLabel'),
                      dataIndex: 'name',
                      minWidth: TABLE_COL_MIN_WIDTH_NAME
                    },
                    {
                      title: t('data.item.parent.shortLabel'),
                      dataIndex: 'parent',
                      minWidth: TABLE_COL_MIN_WIDTH_ID
                    },
                    mergeConflict
                      ? {
                        title: t('data.artefact.mergeConflict.shortLabel'),
                        dataIndex: "mergeConflict",
                        width: 30,
                        withValuesFilter: true,
                        render: mergeConflict => mergeConflict
                          ? <Icon type="check"/>
                          : null,
                        renderText: mergeConflict => mergeConflict
                          ? t('data.artefact.mergeConflict.values.withMergeConflict')
                          : t('data.artefact.mergeConflict.values.withoutMergeConflict'),
                      }
                      : null
                  ]}
                  multilangStrDataIndexes={["name"]}
                  isPaginated={artefactType === MERGE_ITEM_SCHEMES_ARTEFACT_TYPE_CODELIST}
                  rowCount={artefactType === MERGE_ITEM_SCHEMES_ARTEFACT_TYPE_CODELIST ? mergeCodelistItemCount : null}
                  onChange={({pageNum, pageSize, searchText, filters, sortCol, sortByDesc}) =>
                    onCodesParamsUpdate({
                      triplet: mergeCodelistTriplet,
                      lang,
                      pageNum,
                      pageSize,
                      searchText,
                      filters,
                      sortCol,
                      sortByDesc,
                      rebuildDb: false
                    })
                  }
                />
              </Call>
            )
          }}
        </DataLanguageConsumer>
      </EnhancedModal>
      <EnhancedModal
        visible={isMergeVisible}
        onCancel={onMergeHide}
        title={t('scenes.utilities.mergeItemSchemes.modals.mergedItemScheme.title')}
        withDataLanguageSelector
        width={MODAL_WIDTH_MD}
        footer={
          <DataLanguageConsumer>
            {dataLanguage => {
              const lang = dataLanguage || appLang;
              return (
                <div>
                  <Button onClick={onMergeHide}>{t('commons.buttons.close.title')}</Button>
                  <Button
                    type="primary"
                    disabled={!isArtefactValid(mergedItemScheme)}
                    onClick={() => onMergeSubmit(artefactType, mergedItemScheme, mergedItemsFromServer, lang)}
                  >
                    {t('commons.buttons.create.title')}
                  </Button>
                </div>
              )
            }}
          </DataLanguageConsumer>
        }
      >
        <ArtefactMinForm
          artefact={mergedItemScheme}
          agencies={agencies}
          onChange={onMergeChange}
          mode={ARTEFACT_MIN_FORM_MODE_CREATE}
        />
      </EnhancedModal>
      <Call
        cb={fetchXmlPreview}
        cbParam={{artefactType, file: isSourcePreview ? source : target, lang: appLang}}
        disabled={!isXmlPreviewVisible}
      >
        <EnhancedModal
          visible={isXmlPreviewVisible && previewItems !== null}
          onCancel={onPreviewHide}
          title={t('scenes.utilities.mergeItemSchemes.modals.xmlPreview.title')}
          width={MODAL_WIDTH_LG}
          footer={<Button onClick={onPreviewHide}>{t('commons.buttons.close.title')}</Button>}
          withDataLanguageSelector
          onDataLanguageSelectorChange={
            (lang, changeLang) => {
              onXmlPreviewLangChange(lang);
              changeLang();
            }
          }
        >
          <DataLanguageConsumer>
            {dataLanguage => {
              const lang = dataLanguage || appLang;
              return (
                <Call
                  cb={fetchXmlPreviewPage}
                  cbParam={previewItemParams}
                  disabled={
                    !isXmlPreviewVisible ||
                    artefactType !== MERGE_ITEM_SCHEMES_ARTEFACT_TYPE_CODELIST ||
                    !previewItemParams ||
                    !previewItems
                  }
                >
                  <ItemList
                    data={previewItems}
                    hideOrderCol
                    isPaginated={artefactType === MERGE_ITEM_SCHEMES_ARTEFACT_TYPE_CODELIST}
                    rowCount={artefactType === MERGE_ITEM_SCHEMES_ARTEFACT_TYPE_CODELIST ? previewItemCount : null}
                    onChange={({pageNum, pageSize, searchText, filters, sortCol, sortByDesc}) =>
                      onXmlPreviewParamsUpdate({
                        triplet: previewCodelistTriplet,
                        lang,
                        pageNum,
                        pageSize,
                        searchText,
                        filters,
                        sortCol,
                        sortByDesc,
                        rebuildDb: false
                      })
                    }
                  />
                </Call>
              )
            }}
          </DataLanguageConsumer>
        </EnhancedModal>
      </Call>
      <EnhancedModal
        visible={isCsvPreviewVisible}
        onCancel={onPreviewHide}
        title={t('scenes.utilities.mergeItemSchemes.modals.csvPreview.title')}
        width={MODAL_WIDTH_LG}
        footer={<Button onClick={onPreviewHide}>{t('commons.buttons.close.title')}</Button>}
      >
        <Call
          cb={onCsvFileUpload}
          cbParam={isSourcePreview ? source : target}
          disabled={!isCsvPreviewVisible}
        >
          {csvFilePath && (
            <InfiniteScrollDataTable
              data={allCsvRows && allCsvRows.Data}
              rowTotal={allCsvRows && allCsvRows.Count}
              cols={allCsvRows && allCsvRows.Columns}
              hiddenCols={["NumRow"]}
              onChange={
                ({pageNum, pageSize, searchText, filters, sortCol, sortByDesc}) => fetchCsvRows(
                  pageNum,
                  pageSize,
                  getFilterObjFromViewerObj(
                    allCsvRows && allCsvRows.Columns.filter(colName => colName !== 'NumRow'),
                    searchText,
                    filters
                  ),
                  sortCol ? [sortCol] : null,
                  sortByDesc,
                  isSourcePreview ? sourceCsvProps.textSeparator : targetCsvProps.textSeparator,
                  isSourcePreview ? sourceCsvProps.textDelimiter : targetCsvProps.textDelimiter,
                  isSourcePreview ? sourceCsvProps.firstRowHeader : targetCsvProps.firstRowHeader,
                  csvFilePath
                )
              }
            />
          )}
        </Call>
      </EnhancedModal>
      <ReduxCodelistDetailModal
        instancePrefix={UTILITIES_MERGE_ITEM_SCHEMES_CODELIST_DETAIL_PREFIX}
        instanceState={codelistDetail}
      />
      <ReduxConceptSchemeDetailModal
        instancePrefix={UTILITIES_MERGE_ITEM_SCHEMES_CONCEPT_SCHEME_DETAIL_PREFIX}
        instanceState={conceptSchemeDetail}
      />
      <ReduxCategorySchemeDetailModal
        instancePrefix={UTILITIES_MERGE_ITEM_SCHEMES_CATEGORY_SCHEME_DETAIL_PREFIX}
        instanceState={categorySchemeDetail}
      />
    </Fragment>
  )
};

export default compose(
  translate(),
  connect(mapStateToProps, mapDispatchToProps)
)(MergeItemSchemes);
