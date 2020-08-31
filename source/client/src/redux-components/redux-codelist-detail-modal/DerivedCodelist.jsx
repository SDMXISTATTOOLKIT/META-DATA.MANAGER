import React, {Fragment} from "react";
import {compose} from "redux";
import {connect} from "react-redux";
import {translate} from "react-i18next";
import {Button, Checkbox, Col, Modal, Row} from "antd";
import InfiniteScrollTable from "../../components/infinite-scroll-table";
import {
  GUTTER_MD,
  GUTTER_SM,
  MARGIN_MD,
  MODAL_WIDTH_MD,
  SPAN_HALF,
  TABLE_COL_MIN_WIDTH_ID,
  TABLE_COL_MIN_WIDTH_NAME
} from "../../styles/constants";
import EnhancedModal from "../../components/enhanced-modal";
import _ from "lodash";
import {DataLanguageConsumer} from "../../contexts/DataLanguage";
import {isArtefactValid} from "../../utils/artefactValidators";
import {reuseAction} from "../../utils/reduxReuse";
import {
  changeCodelistDetailDerivedCodelistCheckbox,
  changeCodelistDetailDerivedCodelistCreate,
  hideCodelistDetailDerivedCodelistCreate,
  readCodelistDetailDerivedCodelistSourceItemPage,
  readCodelistDetailDerivedCodelistTargetItemPage,
  restoreCodelistDetailDerivedCodelistDb,
  selectCodelistDetailDerivedCodelistAllItems,
  selectCodelistDetailDerivedCodelistSourceItem,
  selectCodelistDetailDerivedCodelistTargetItem,
  showCodelistDetailDerivedCodelistCreate,
  storeCodelistDetailDerivedCodelistSelectedItems,
  submitCodelistDetailDerivedCodelistCreate,
  updateCodelistDetailDerivedCodelistSourceItemPageParams,
  updateCodelistDetailDerivedCodelistTargetItemPageParams
} from "./actions";
import Call from "../../hocs/call";
import ArtefactMinForm, {ARTEFACT_MIN_FORM_MODE_CREATE} from "../../components/artefact-min-form";

const mapStateToProps = (state, {instanceState}) => ({
  nodes: state.config.nodes,
  nodeId: state.app.endpointId,
  appLang: state.app.language,
  codelistTriplet: instanceState.codelistTriplet,
  derivedCodelist: instanceState.derivedCodelist,
  dCSourceFetchPageParams: instanceState.dCSourceFetchPageParams,
  dCSourceItemPage: instanceState.dCSourceItemPage,
  dCSourceItemCount: instanceState.dCSourceItemCount,
  dCSourceSelectedItemCount: instanceState.dCSourceSelectedItemCount,
  dCTargetFetchPageParams: instanceState.dCTargetFetchPageParams,
  dCTargetItemPage: instanceState.dCTargetItemPage,
  dCTargetItemCount: instanceState.dCTargetItemCount,
  dCTargetSelectedItemCount: instanceState.dCTargetSelectedItemCount,
  importCheckbox: instanceState.importCheckbox,
  isCreateVisible: instanceState.isCreateVisible,
  currentTab: instanceState.currentTab
});

const mapDispatchToProps = (dispatch, {instancePrefix}) => ({
  onSourceItemPageParamsUpdate: fetchPageParams =>
    dispatch(reuseAction(updateCodelistDetailDerivedCodelistSourceItemPageParams(fetchPageParams), instancePrefix)),
  fetchSourceItemPage: ({codelistTriplet, lang, pageNum, pageSize, itemsOrderAnnotationType, searchText, filters, sortCol, sortByDesc}) =>
    dispatch(reuseAction(readCodelistDetailDerivedCodelistSourceItemPage(codelistTriplet, lang, pageNum, pageSize, itemsOrderAnnotationType, searchText, filters, sortCol, sortByDesc), instancePrefix)),
  onTargetItemPageParamsUpdate: fetchPageParams =>
    dispatch(reuseAction(updateCodelistDetailDerivedCodelistTargetItemPageParams(fetchPageParams), instancePrefix)),
  fetchTargetItemPage: ({codelistTriplet, lang, pageNum, pageSize, itemsOrderAnnotationType, searchText, filters, sortCol, sortByDesc}) =>
    dispatch(reuseAction(readCodelistDetailDerivedCodelistTargetItemPage(codelistTriplet, lang, pageNum, pageSize, itemsOrderAnnotationType, searchText, filters, sortCol, sortByDesc), instancePrefix)),
  onSourceItemSelect: (itemId, codelistTriplet, isSelected, lang) =>
    dispatch(reuseAction(selectCodelistDetailDerivedCodelistSourceItem(itemId, codelistTriplet, isSelected, lang), instancePrefix)),
  onTargetItemSelect: (itemId, codelistTriplet, isSelected, lang) =>
    dispatch(reuseAction(selectCodelistDetailDerivedCodelistTargetItem(itemId, codelistTriplet, isSelected, lang), instancePrefix)),
  onAllItemsSelect: (codelistTriplet, isTarget, isSelected, filter, lang) =>
    dispatch(reuseAction(selectCodelistDetailDerivedCodelistAllItems(codelistTriplet, isTarget, isSelected, filter, lang), instancePrefix)),
  onItemsStore: (isTarget, codelistTriplet, lang, importCheckbox) =>
    dispatch(reuseAction(storeCodelistDetailDerivedCodelistSelectedItems(isTarget, codelistTriplet, lang, importCheckbox), instancePrefix)),
  onCheckboxChange: checkbox => dispatch(reuseAction(changeCodelistDetailDerivedCodelistCheckbox(checkbox), instancePrefix)),
  onCreateShow: (codelistTriplet, lang) =>
    dispatch(reuseAction(showCodelistDetailDerivedCodelistCreate(codelistTriplet, lang), instancePrefix)),
  onCreateHide: () => dispatch(reuseAction(hideCodelistDetailDerivedCodelistCreate(), instancePrefix)),
  onCreateChange: fields => dispatch(reuseAction(changeCodelistDetailDerivedCodelistCreate(fields), instancePrefix)),
  onCreateSubmit: (codelistTriplet, lang, derivedCodelist) =>
    dispatch(reuseAction(submitCodelistDetailDerivedCodelistCreate(codelistTriplet, lang, derivedCodelist), instancePrefix)),
  onDbRestore: (codelistTriplet, fetchTarget) => dispatch(reuseAction(restoreCodelistDetailDerivedCodelistDb(codelistTriplet, fetchTarget), instancePrefix))
});

const TABLE_HEIGHT = 300;

const DerivedCodelist = ({
                           t,
                           nodes,
                           nodeId,
                           appLang,
                           agencies,
                           codelistTriplet,
                           dCSourceFetchPageParams,
                           dCSourceItemPage,
                           dCSourceItemCount,
                           dCSourceSelectedItemCount,
                           dCTargetFetchPageParams,
                           dCTargetItemPage,
                           dCTargetItemCount,
                           dCTargetSelectedItemCount,
                           isCreateVisible,
                           currentTab,
                           derivedCodelist,
                           importCheckbox,
                           isImportParentDisabled,
                           fetchSourceItemPage,
                           onSourceItemPageParamsUpdate,
                           fetchTargetItemPage,
                           onTargetItemPageParamsUpdate,
                           onSourceItemSelect,
                           onTargetItemSelect,
                           onAllItemsSelect,
                           onItemsStore,
                           onCheckboxChange,
                           onCreateShow,
                           onCreateChange,
                           onCreateHide,
                           onCreateSubmit,
                           onDbRestore
                         }) => {

  const itemsOrderAnnotationType =
    _.find(nodes, node => node.general.id === nodeId).annotations.codelistsOrder;

  const columns = [
    {
      title: t('data.item.id.shortLabel'),
      dataIndex: 'code',
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
    }
  ];

  return (
    <DataLanguageConsumer>
      {dataLanguage => {
        const lang = dataLanguage || appLang;
        return (
          <Fragment>
            <Row type="flex" justify="start" align="middle" gutter={32} style={{marginBottom: MARGIN_MD}}>
              <Col>
                <Row type="flex" justify="start" align="middle" gutter={GUTTER_MD}>
                  <Col>
                    {t("reduxComponents.derivedItemsScheme.preservesHierarchy.label") + ":"}
                  </Col>
                  <Col>
                    <Checkbox
                      checked={importCheckbox.preserveHierarchy}
                      onChange={e => onCheckboxChange({preserveHierarchy: e.target.checked})}
                      disabled={isImportParentDisabled}
                    />
                  </Col>
                </Row>
              </Col>
              {
                importCheckbox.preserveHierarchy && (
                  <Col>
                    <Row type="flex" justify="start" align="middle" gutter={GUTTER_MD}>
                      <Col>
                        {t("reduxComponents.derivedItemsScheme.autoImport.label") + ":"}
                      </Col>
                      <Col>
                        {t("reduxComponents.derivedItemsScheme.autoImport.parents.label") + ":"}
                      </Col>
                      <Col>
                        <Checkbox
                          checked={importCheckbox.importParents}
                          onChange={e => onCheckboxChange({importParents: e.target.checked})}
                          disabled={isImportParentDisabled}
                        />
                      </Col>
                      <Col>
                        {t("reduxComponents.derivedItemsScheme.autoImport.children.label") + ":"}
                      </Col>
                      <Col>
                        <Checkbox
                          checked={importCheckbox.importChildren}
                          onChange={e => onCheckboxChange({importChildren: e.target.checked})}
                          disabled={isImportParentDisabled}
                        />
                      </Col>
                      <Col>
                        {t("reduxComponents.derivedItemsScheme.autoImport.descendants.label") + ":"}
                      </Col>
                      <Col>
                        <Checkbox
                          checked={importCheckbox.importDescendants}
                          onChange={e => onCheckboxChange({importDescendants: e.target.checked})}
                          disabled={isImportParentDisabled}
                        />
                      </Col>
                    </Row>
                  </Col>
                )
              }
            </Row>
            <Row type="flex" gutter={GUTTER_MD} style={{marginBottom: MARGIN_MD}}>
              <Col span={SPAN_HALF}>
                <Call
                  cb={fetchSourceItemPage}
                  cbParam={dCSourceFetchPageParams}
                  disabled={dCSourceFetchPageParams === null || currentTab !== "derived"}
                >
                  <InfiniteScrollTable
                    data={dCSourceItemPage}
                    getRowKey={({code}) => code}
                    rowCount={dCSourceItemCount}
                    columns={columns}
                    height={TABLE_HEIGHT}
                    searchBarSpan={10}
                    rowSelection={{
                      selectedRowKeys: dCSourceItemPage
                        ? dCSourceItemPage.filter(({isSelected}) => isSelected).map(({code}) => code)
                        : [],
                      onSelect: (itemCode, selected) =>
                        onSourceItemSelect(itemCode, codelistTriplet, selected, lang),
                      onSelectAll: (selected, filter) => onAllItemsSelect(codelistTriplet, false, selected, filter, lang)
                    }}
                    getIsDisabledRow={({isSelectable}) => !isSelectable}
                    rightActions={
                      <Button
                        onClick={() => onItemsStore(false, codelistTriplet, lang, importCheckbox)}
                        icon="double-right"
                        type="primary"
                        disabled={!dCSourceSelectedItemCount || dCSourceSelectedItemCount === 0}
                      >
                        {t('reduxComponents.derivedItemsScheme.buttons.addItems.title')}
                      </Button>
                    }
                    isPaginated
                    selectedRowCount={dCSourceSelectedItemCount}
                    onChange={({pageNum, pageSize, searchText, filters, sortCol, sortByDesc}) =>
                      onSourceItemPageParamsUpdate({
                        codelistTriplet,
                        lang,
                        pageNum,
                        pageSize,
                        searchText,
                        filters,
                        sortCol,
                        sortByDesc,
                        itemsOrderAnnotationType
                      })
                    }
                  />
                </Call>
              </Col>
              <Col span={SPAN_HALF}>
                <Call
                  cb={fetchTargetItemPage}
                  cbParam={dCTargetFetchPageParams}
                  disabled={dCTargetFetchPageParams === null || dCSourceItemPage === null || currentTab !== "derived"}
                >
                  <InfiniteScrollTable
                    data={dCTargetItemPage}
                    getRowKey={({code}) => code}
                    rowCount={dCTargetItemCount}
                    columns={columns}
                    height={TABLE_HEIGHT}
                    searchBarSpan={10}
                    rowSelection={{
                      selectedRowKeys: dCTargetItemPage
                        ? dCTargetItemPage.filter(({isSelected}) => isSelected).map(({code}) => code)
                        : [],
                      onSelect: (itemCode, selected) =>
                        onTargetItemSelect(itemCode, codelistTriplet, selected, lang),
                      onSelectAll: (selected, filter) => onAllItemsSelect(codelistTriplet, true, selected, filter, lang)
                    }}
                    rightActions={
                      <Button
                        onClick={() => onItemsStore(true, codelistTriplet, lang)}
                        icon="delete"
                        type="primary"
                        disabled={!dCTargetSelectedItemCount || dCTargetSelectedItemCount === 0}
                      >
                        {t('reduxComponents.derivedItemsScheme.buttons.removeItems.title')}
                      </Button>
                    }
                    isPaginated
                    selectedRowCount={dCTargetSelectedItemCount}
                    onChange={({pageNum, pageSize, searchText, filters, sortCol, sortByDesc}) =>
                      onTargetItemPageParamsUpdate({
                        codelistTriplet,
                        lang,
                        pageNum,
                        pageSize,
                        searchText,
                        filters,
                        sortCol,
                        sortByDesc,
                        itemsOrderAnnotationType
                      })
                    }
                  />
                </Call>
              </Col>
            </Row>
            <Row type="flex" justify="end" gutter={GUTTER_SM}>
              <Col>
                <Button
                  onClick={() => onDbRestore(codelistTriplet, true)}
                  disabled={dCTargetItemCount === 0}
                >
                  {t('reduxComponents.derivedItemsScheme.buttons.emptyList.title')}
                </Button>
              </Col>
              <Col>
                <Button
                  type="primary"
                  onClick={() => onCreateShow(codelistTriplet, lang)}
                  disabled={dCTargetItemCount === 0}
                >
                  {t('reduxComponents.derivedItemsScheme.buttons.create.title')}
                </Button>
              </Col>
            </Row>
            <EnhancedModal
              visible={isCreateVisible && derivedCodelist !== null}
              title={t('reduxComponents.derivedItemsScheme.modals.derive.title')}
              width={MODAL_WIDTH_MD}
              withDataLanguageSelector
              onCancel={onCreateHide}
              footer={
                <div>
                  <Button onClick={onCreateHide}>{t('commons.buttons.close.title')}</Button>
                  <Button
                    type="primary"
                    onClick={() => onCreateSubmit(codelistTriplet, lang, derivedCodelist)}
                    disabled={!isArtefactValid(derivedCodelist)}
                  >
                    {t('reduxComponents.derivedItemsScheme.buttons.deriveSubmit.title')}
                  </Button>
                </div>
              }
            >
              <ArtefactMinForm
                artefact={derivedCodelist}
                agencies={agencies}
                onChange={onCreateChange}
                mode={ARTEFACT_MIN_FORM_MODE_CREATE}
              />
            </EnhancedModal>
            <Call
              cb={() => Modal.error({
                title: t('reduxComponents.derivedItemsScheme.modals.warning.parentMissing.title'),
                onOk() {
                  onCreateHide()
                },
                onCancel() {
                  onCreateHide()
                }
              })}
              disabled={!(isCreateVisible && !derivedCodelist)}
            >
              <span/>
            </Call>
          </Fragment>
        )
      }}
    </DataLanguageConsumer>
  )
};

export default compose(
  translate(),
  connect(mapStateToProps, mapDispatchToProps)
)(DerivedCodelist);