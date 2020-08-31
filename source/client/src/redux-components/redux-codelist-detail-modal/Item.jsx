import React, {Fragment} from 'react';
import EnhancedModal from "../../components/enhanced-modal";
import ItemList from "../../components/item-list";
import {translate} from 'react-i18next';
import {compose} from "redux";
import {connect} from "react-redux";
import ItemForm, {ITEM_FORM_MODE_CREATE, ITEM_FORM_MODE_EDIT, ITEM_FORM_MODE_READ} from "../../components/item-form";
import {
  changeCodelistDetailItemsItem,
  hideCodelistDetailItemsItem,
  hideCodelistDetailItemsItemParentList,
  readCodelistDetailItemsItemParentListPage,
  setCodelistDetailItemsItemParentList,
  showCodelistDetailItemsItemParentList,
  submitCodelistDetailItemsItem,
  unsetCodelistDetailItemsItemParentList
} from "./actions";
import {MODAL_WIDTH_LG} from "../../styles/constants";
import {Button} from "antd";
import {DataLanguageConsumer} from "../../contexts/DataLanguage";
import {reuseAction} from "../../utils/reduxReuse";
import {isDictionaryValid} from "../../utils/artefactValidators";

const mapStateToProps = (state, {instanceState}) => ({
  appLanguage: state.app.language,
  nodes: state.config.nodes,
  nodeId: state.app.endpointId,
  permissions: state.app.user.permissions,
  codelist: instanceState.codelist,
  codelistTriplet: instanceState.codelistTriplet,
  item: instanceState.item,
  isItemEditMode: instanceState.isItemEditMode,
  isItemsParentListVisible: instanceState.isItemsParentListVisible,
  itemsTree: instanceState.itemsTree,
  cutItem: instanceState.cutItem,
  itemCount: instanceState.itemCount,
  parentPage: instanceState.parentPage,
  autoSave: instanceState.autoSave
});

const mapDispatchToProps = (dispatch, {instancePrefix}) => ({
  onItemDetailChange: (fields, lang, itemsOrderAnnotationType) =>
    dispatch(reuseAction(changeCodelistDetailItemsItem(fields, lang, itemsOrderAnnotationType), instancePrefix)),
  onItemSubmit: (triplet, item, lang, isItemEditMode, autoSave, itemsOrderAnnotationType, itemsTree, cutItem, t) =>
    dispatch(reuseAction(submitCodelistDetailItemsItem(triplet, item, lang, isItemEditMode, autoSave, itemsOrderAnnotationType, itemsTree, cutItem, t), instancePrefix)),
  onItemDetailHide: () => dispatch(reuseAction(hideCodelistDetailItemsItem(), instancePrefix)),
  onItemsParentListShow: () => dispatch(reuseAction(showCodelistDetailItemsItemParentList(), instancePrefix)),
  onItemsParentListHide: () => dispatch(reuseAction(hideCodelistDetailItemsItemParentList(), instancePrefix)),
  onItemsParentListSet: parentId => dispatch(reuseAction(setCodelistDetailItemsItemParentList(parentId), instancePrefix)),
  onItemsParentListUnset: () => dispatch(reuseAction(unsetCodelistDetailItemsItemParentList(), instancePrefix)),
  fetchParentPage: (artefactTriplet, lang, pageNum, pageSize, itemsOrderAnnotationType, searchText, filters, sortCol, sortByDesc) =>
    dispatch(reuseAction(readCodelistDetailItemsItemParentListPage(artefactTriplet, lang, pageNum, pageSize, itemsOrderAnnotationType, searchText, filters, sortCol, sortByDesc), instancePrefix))
});

const CodelistDetailItem = ({
                              t,
                              appLanguage,
                              codelist,
                              codelistTriplet,
                              item,
                              isItemEditMode,
                              onItemDetailChange,
                              onItemSubmit,
                              onItemDetailHide,
                              nodes,
                              nodeId,
                              permissions,
                              isItemsParentListVisible,
                              onItemsParentListShow,
                              onItemsParentListHide,
                              onItemsParentListSet,
                              onItemsParentListUnset,
                              itemsTree,
                              cutItem,
                              fetchParentPage,
                              parentPage,
                              itemCount,
                              autoSave,
                              isEditDisabled
                            }) => {

  const annotationsConfig = nodes.find(node => node.general.id === nodeId).annotations;
  const itemsOrderAnnotationType = nodes.find(node => node.general.id === nodeId).annotations.codelistsOrder;

  const userHasPermissionsToEdit = (
    permissions &&
    codelist &&
    permissions.agencies.filter(agency => agency === codelist.agencyID).length > 0 &&
    !isEditDisabled
  );

  return (
    <DataLanguageConsumer>
      {dataLanguage => {
        const lang = dataLanguage || appLanguage;
        return (
          <Fragment>
            <EnhancedModal
              title={(isItemEditMode && item)
                ? userHasPermissionsToEdit
                  ? t("commons.artefact.tabs.items.item.detail.title.editMode.title", {id: item.id})
                  : t("commons.artefact.tabs.items.item.detail.title.viewMode.title", {id: item.id})
                : t("commons.artefact.tabs.items.item.detail.title.createMode.title")}
              visible={item !== null}
              onCancel={onItemDetailHide}
              width={MODAL_WIDTH_LG}
              footer={
                <div>
                  <Button onClick={onItemDetailHide}>{t('commons.buttons.close.title')}</Button>
                  {(!isItemEditMode || userHasPermissionsToEdit)
                    ? (
                      <Button
                        disabled={
                          item === null ||
                          item.id === null || item.id.length === 0 ||
                          !isDictionaryValid(item.name)
                        }
                        type="primary"
                        onClick={() => onItemSubmit(codelistTriplet, item, dataLanguage, isItemEditMode, autoSave, itemsOrderAnnotationType, itemsTree, cutItem, t)}
                      >
                        {t("commons.buttons.save.title")}
                      </Button>
                    )
                    : null}
                </div>
              }
              withDataLanguageSelector
            >
              <ItemForm
                item={item ? item : null}
                mode={
                  isItemEditMode
                    ? (userHasPermissionsToEdit ? ITEM_FORM_MODE_EDIT : ITEM_FORM_MODE_READ)
                    : ITEM_FORM_MODE_CREATE
                }
                onChange={fields => onItemDetailChange(fields, lang, itemsOrderAnnotationType)}
                itemsParentListShow={onItemsParentListShow}
                itemsParentListUnset={onItemsParentListUnset}
                annotationsConfig={annotationsConfig}
              />
            </EnhancedModal>
            <EnhancedModal
              visible={isItemsParentListVisible ? isItemsParentListVisible : false}
              onCancel={onItemsParentListHide}
              title={t('commons.artefact.tabs.items.item.detail.modals.parentList.title')}
              width={MODAL_WIDTH_LG}
              footer={<Button onClick={onItemsParentListHide}>{t('commons.buttons.close.title')}</Button>}
            >
              <ItemList
                data={parentPage ? parentPage : null}
                rowCount={itemCount}
                isPaginated
                onRowClick={item => onItemsParentListSet(item)}
                onChange={
                  ({pageNum, pageSize, searchText, filters, sortCol, sortByDesc}) =>
                    fetchParentPage(
                      codelistTriplet,
                      item.id,
                      dataLanguage,
                      pageNum,
                      pageSize,
                      itemsOrderAnnotationType,
                      searchText,
                      filters,
                      sortCol,
                      sortByDesc
                    )
                }
              />
            </EnhancedModal>
          </Fragment>
        )
      }}
    </DataLanguageConsumer>
  )
};

export default compose(
  translate(),
  connect(mapStateToProps, mapDispatchToProps)
)(CodelistDetailItem);
