import React, {Fragment} from 'react';
import EnhancedModal from "../../components/enhanced-modal";
import {translate} from 'react-i18next';
import {compose} from "redux";
import {connect} from "react-redux";
import ItemForm, {ITEM_FORM_MODE_CREATE, ITEM_FORM_MODE_EDIT, ITEM_FORM_MODE_READ} from "../../components/item-form";
import {
  changeCategorySchemeDetailItemsItem,
  hideCategorySchemeDetailItemsItem,
  hideCategorySchemeDetailItemsItemParentList,
  setCategorySchemeDetailItemsItemParentList,
  showCategorySchemeDetailItemsItemParentList,
  submitCategorySchemeDetailItemsItem,
  unsetCategorySchemeDetailItemsItemParentList
} from "./actions";
import {MODAL_WIDTH_LG} from "../../styles/constants";
import {Button} from "antd";
import {getNodes, testAnchestor} from "../../utils/tree";
import {DataLanguageConsumer} from "../../contexts/DataLanguage";
import {reuseAction} from "../../utils/reduxReuse";
import ItemList from "../../components/item-list";
import {isDictionaryValid} from "../../utils/artefactValidators";

const mapStateToProps = (state, {instanceState}) => ({
  nodes: state.config.nodes,
  nodeId: state.app.endpointId,
  permissions: state.app.user.permissions,
  appLanguage: state.app.language,
  categoryScheme: instanceState.categoryScheme,
  item: instanceState.item,
  isItemEditMode: instanceState.isItemEditMode,
  isItemsParentListVisible: instanceState.isItemsParentListVisible,
  itemsTree: instanceState.itemsTree,
  isNormalizeNeeded: instanceState.isNormalizeNeeded,
  cutItem: instanceState.cutItem
});

const mapDispatchToProps = (dispatch, {instancePrefix}) => ({
  onItemDetailChange: (fields, lang, itemsOrderAnnotationType) =>
    dispatch(reuseAction(changeCategorySchemeDetailItemsItem(fields, lang, itemsOrderAnnotationType), instancePrefix)),
  onItemDetailSubmit: (categoryScheme, itemsTree, item, itemsOrderAnnotationType, isItemEditMode, lang, isNormalizeNeeded, cutItem, t) =>
    dispatch(reuseAction(submitCategorySchemeDetailItemsItem(
      categoryScheme, itemsTree, item, itemsOrderAnnotationType, isItemEditMode, lang, isNormalizeNeeded, cutItem, t
    ), instancePrefix)),
  onItemDetailHide: () => dispatch(reuseAction(hideCategorySchemeDetailItemsItem(), instancePrefix)),
  onItemsParentListShow: () => dispatch(reuseAction(showCategorySchemeDetailItemsItemParentList(), instancePrefix)),
  onItemsParentListHide: () => dispatch(reuseAction(hideCategorySchemeDetailItemsItemParentList(), instancePrefix)),
  onItemsParentListSet: item => dispatch(reuseAction(setCategorySchemeDetailItemsItemParentList(item), instancePrefix)),
  onItemsParentListUnset: () => dispatch(reuseAction(unsetCategorySchemeDetailItemsItemParentList(), instancePrefix))
});

const CategorySchemeDetailItem = ({
                                    t,
                                    nodes,
                                    nodeId,
                                    permissions,
                                    appLanguage,
                                    isEditDisabled,
                                    categoryScheme,
                                    item,
                                    isItemEditMode,
                                    onItemDetailChange,
                                    onItemDetailSubmit,
                                    onItemDetailHide,
                                    isItemsParentListVisible,
                                    onItemsParentListShow,
                                    onItemsParentListHide,
                                    onItemsParentListSet,
                                    onItemsParentListUnset,
                                    itemsTree,
                                    isNormalizeNeeded,
                                    cutItem
                                  }) => {

  const annotationsConfig = nodes.find(node => node.general.id === nodeId).annotations;
  const itemsOrderAnnotationType = nodes.find(node => node.general.id === nodeId).annotations.categorySchemesOrder;

  const userHasPermissionsToEdit =
    permissions &&
    categoryScheme &&
    permissions.agencies.filter(agency => agency === categoryScheme.agencyID).length > 0 &&
    !isEditDisabled;

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
                  {
                    (!isItemEditMode || userHasPermissionsToEdit)
                      ? (
                        <Button
                          disabled={
                            item === null ||
                            item.id === null || item.id.length === 0 ||
                            !isDictionaryValid(item.name)
                          }
                          type="primary"
                          onClick={() => onItemDetailSubmit(
                            categoryScheme, itemsTree, item, itemsOrderAnnotationType, isItemEditMode, lang, isNormalizeNeeded, cutItem, t
                          )}
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
                data={item && getNodes(itemsTree, "categories", node => node.id !== item.id)
                  .filter(node => !testAnchestor(node, item, itemsTree, "categories"))
                }
                onRowClick={item => onItemsParentListSet(item)}
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
)(CategorySchemeDetailItem);
