import React, {Fragment} from "react";
import {compose} from "redux";
import {connect} from "react-redux";
import {translate} from "react-i18next";
import {Button, Checkbox, Col, Modal, Row} from "antd";
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
  addDerivedItemSchemeItems,
  changeDerivedItemSchemeCheckbox,
  changeDerivedItemSchemeCreate,
  hideDerivedItemSchemeCreate,
  removeDerivedItemSchemeItems,
  resetDerivedItemSchemeState,
  selectDerivedItemSchemeItem,
  showDerivedItemSchemeCreate
} from "./actions";
import {getNodes} from "../../utils/tree";
import InfiniteScrollTable from "../../components/infinite-scroll-table";
import ArtefactMinForm, {ARTEFACT_MIN_FORM_MODE_CREATE} from "../../components/artefact-min-form";

const mapStateToProps = (state, {instanceState}) => ({
  appLang: state.app.language,
  derivedItemScheme: instanceState.derivedItemScheme,
  derivedItemSchemeItems: instanceState.derivedItemSchemeItems,
  selectedSourceItems: instanceState.selectedSourceItems,
  selectedTargetItems: instanceState.selectedTargetItems,
  importCheckbox: instanceState.importCheckbox,
  isCreateVisible: instanceState.isCreateVisible
});

const mapDispatchToProps = (dispatch, {instancePrefix}) => ({
  onItemSelect: (selectedArr, isSource) => dispatch(reuseAction(selectDerivedItemSchemeItem(selectedArr, isSource), instancePrefix)),
  onItemsAdd: (itemTree, childrenKey) => dispatch(reuseAction(addDerivedItemSchemeItems(itemTree, childrenKey), instancePrefix)),
  onItemsRemove: items => dispatch(reuseAction(removeDerivedItemSchemeItems(items), instancePrefix)),
  onCheckboxChange: checkbox => dispatch(reuseAction(changeDerivedItemSchemeCheckbox(checkbox), instancePrefix)),
  onCreateShow: () => dispatch(reuseAction(showDerivedItemSchemeCreate(), instancePrefix)),
  onCreateHide: () => dispatch(reuseAction(hideDerivedItemSchemeCreate(), instancePrefix)),
  onCreateChange: fields => dispatch(reuseAction(changeDerivedItemSchemeCreate(fields), instancePrefix)),
  onStateReset: () => dispatch(reuseAction(resetDerivedItemSchemeState(), instancePrefix))
});

const isItemsRemoveValid = (totalItems, itemsToRemove) => {

  let items = _.cloneDeep(totalItems);
  items = items.filter(({id}) => !itemsToRemove.includes(id));

  const mappedArr = {};
  items.forEach(el => {
    el.children = [];
    mappedArr[el.id] = el;
  });

  let ret = true;
  items.forEach(el => {
    if (el.parent) {
      if (!mappedArr[el.parent]) {
        ret = false
      }
    }
  });

  return ret;
};

const TABLE_HEIGHT = 300;

const ReduxDerivedItemScheme = ({
                                  t,
                                  appLang,
                                  itemTree,
                                  childrenKey,
                                  agencies,
                                  isCreateVisible,
                                  derivedItemScheme,
                                  derivedItemSchemeItems,
                                  selectedSourceItems,
                                  selectedTargetItems,
                                  importCheckbox,
                                  isImportParentDisabled,
                                  onItemSelect,
                                  onItemsAdd,
                                  onItemsRemove,
                                  onCheckboxChange,
                                  onCreateShow,
                                  onCreateChange,
                                  onCreateHide,
                                  onCreateSubmit,
                                  onStateReset
                                }) =>
  <DataLanguageConsumer>
    {dataLanguage => {

      const columns = [
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
        }
      ];

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
              <InfiniteScrollTable
                data={getNodes(itemTree, childrenKey, () => true)}
                getRowKey={({id}) => id}
                columns={columns}
                multilangStrDataIndexes={["name"]}
                height={TABLE_HEIGHT}
                searchBarSpan={10}
                rightActions={
                  <Button
                    onClick={() => onItemsAdd(itemTree, childrenKey)}
                    icon="double-right"
                    type="primary"
                    disabled={!selectedSourceItems || selectedSourceItems.length === 0}
                  >
                    {t('reduxComponents.derivedItemsScheme.buttons.addItems.title')}
                  </Button>
                }
                rowSelection={{
                  selectedRowKeys: (selectedSourceItems || []),
                  onChange: selectedArr => onItemSelect(selectedArr, true)
                }}
                getIsDisabledRow={({id}) => (derivedItemSchemeItems || []).map(({id}) => id).includes(id)}
              />
            </Col>
            <Col span={SPAN_HALF}>
              <InfiniteScrollTable
                data={_.sortBy((derivedItemSchemeItems || []), [`order[${lang}]`])}
                getRowKey={({id}) => id}
                columns={columns}
                multilangStrDataIndexes={["name"]}
                height={TABLE_HEIGHT}
                searchBarSpan={10}
                rightActions={
                  <Button
                    onClick={() => {
                      if (isItemsRemoveValid(derivedItemSchemeItems, selectedTargetItems)) {
                        onItemsRemove(selectedTargetItems);
                      } else {
                        Modal.warning({
                          title: t('reduxComponents.derivedItemsScheme.modals.warning.delete.title')
                        })
                      }
                    }}
                    icon="delete"
                    type="primary"
                    disabled={!selectedTargetItems || selectedTargetItems.length === 0}
                  >
                    {t('reduxComponents.derivedItemsScheme.buttons.removeItems.title')}
                  </Button>
                }
                rowSelection={{
                  selectedRowKeys: (selectedTargetItems || []),
                  onChange: selectedArr => onItemSelect(selectedArr, false)
                }}
              />
            </Col>
          </Row>
          <Row type="flex" justify="end" gutter={GUTTER_SM}>
            <Col>
              <Button
                onClick={() => onItemsRemove(derivedItemSchemeItems.map(({id}) => id))}
                disabled={derivedItemSchemeItems === null || derivedItemSchemeItems.length === 0}
              >
                {t('reduxComponents.derivedItemsScheme.buttons.emptyList.title')}
              </Button>
            </Col>
            <Col>
              <Button
                type="primary"
                onClick={() => {
                  if (isItemsRemoveValid(derivedItemSchemeItems, [])) {
                    onCreateShow();
                  } else {
                    Modal.warning({
                      title: t('reduxComponents.derivedItemsScheme.modals.warning.parentMissing.title')
                    })
                  }
                }}
                disabled={derivedItemSchemeItems === null || derivedItemSchemeItems.length === 0}
              >
                {t('reduxComponents.derivedItemsScheme.buttons.create.title')}
              </Button>
            </Col>
          </Row>
          <EnhancedModal
            visible={isCreateVisible}
            title={t('reduxComponents.derivedItemsScheme.modals.derive.title')}
            width={MODAL_WIDTH_MD}
            withDataLanguageSelector
            onCancel={onCreateHide}
            footer={
              <div>
                <Button onClick={onCreateHide}>{t('commons.buttons.close.title')}</Button>
                <Button
                  type="primary"
                  disabled={!isArtefactValid(derivedItemScheme)}
                  onClick={() => {
                    onCreateSubmit(derivedItemScheme, derivedItemSchemeItems);
                    onStateReset();
                  }}
                >
                  {t('reduxComponents.derivedItemsScheme.buttons.deriveSubmit.title')}
                </Button>
              </div>
            }
          >
            <ArtefactMinForm
              artefact={derivedItemScheme}
              agencies={agencies}
              onChange={onCreateChange}
              mode={ARTEFACT_MIN_FORM_MODE_CREATE}
            />
          </EnhancedModal>
        </Fragment>
      )
    }}
  </DataLanguageConsumer>;

export default compose(
  translate(),
  connect(mapStateToProps, mapDispatchToProps)
)(ReduxDerivedItemScheme);