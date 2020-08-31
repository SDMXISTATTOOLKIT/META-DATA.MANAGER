import React, {Fragment} from 'react';
import EnhancedModal from "../../../components/enhanced-modal";
import {translate} from 'react-i18next';
import {compose} from "redux";
import {connect} from "react-redux";
import ItemForm, {
  ITEM_FORM_MODE_CREATE_PARENT_DISABLED,
  ITEM_FORM_MODE_EDIT_PARENT_DISABLED,
  ITEM_FORM_MODE_READ
} from "../../../components/item-form";
import {
  changeAgencySchemesDetailItemsItemDetail,
  hideAgencySchemesDetailItemsItemDetail,
  submitAgencySchemesDetailItemsItem,
} from "./actions";
import {MODAL_WIDTH_LG} from "../../../styles/constants";
import {Button} from "antd";
import {DataLanguageConsumer} from "../../../contexts/DataLanguage";
import {isDictionaryValid} from "../../../utils/artefactValidators";

const mapStateToProps = state => ({
  appLanguage: state.app.language,
  agencyScheme: state.scenes.metaManager.agencySchemes.agencyScheme,
  item: state.scenes.metaManager.agencySchemes.item,
  isItemEditMode: state.scenes.metaManager.agencySchemes.isItemEditMode,
  nodes: state.config.nodes,
  nodeId: state.app.endpointId,
  permissions: state.app.user.permissions,
  itemsTree: state.scenes.metaManager.agencySchemes.itemsTree,
  isNormalizeNeeded: state.scenes.metaManager.agencySchemes.isNormalizeNeeded,
  cutItem: state.scenes.metaManager.agencySchemes.cutItem
});

const mapDispatchToProps = dispatch => ({
  onItemDetailChange: (fields, lang, itemsOrderAnnotationType) =>
    dispatch(changeAgencySchemesDetailItemsItemDetail(fields, lang, itemsOrderAnnotationType)),
  onItemDetailSubmit: (
    agencyScheme, itemsTree, item, itemsOrderAnnotationType, isItemEditMode, lang, isNormalizeNeeded, cutItem, t
  ) =>
    dispatch(submitAgencySchemesDetailItemsItem(
      agencyScheme, itemsTree, item, itemsOrderAnnotationType, isItemEditMode, lang, isNormalizeNeeded, cutItem, t
    )),
  onItemDetailHide: () => dispatch(hideAgencySchemesDetailItemsItemDetail())
});

const Item = ({
                t,
                appLanguage,
                agencyScheme,
                item,
                isItemEditMode,
                onItemDetailChange,
                onItemDetailSubmit,
                onItemDetailHide,
                nodes,
                nodeId,
                permissions,
                itemsTree,
                isNormalizeNeeded,
                cutItem
              }) => {

  const annotationsConfig = nodes.find(node => node.general.id === nodeId).annotations;
  const itemsOrderAnnotationType = nodes.find(node => node.general.id === nodeId).annotations.codelistsOrder;

  const userHasPermissionsToEdit =
    permissions && agencyScheme && permissions.agencies.filter(agency => agency === agencyScheme.agencyID).length > 0;

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
                            agencyScheme, itemsTree, item, itemsOrderAnnotationType, isItemEditMode, lang, isNormalizeNeeded, cutItem, t
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
                    ? (userHasPermissionsToEdit ? ITEM_FORM_MODE_EDIT_PARENT_DISABLED : ITEM_FORM_MODE_READ)
                    : ITEM_FORM_MODE_CREATE_PARENT_DISABLED
                }
                onChange={fields => onItemDetailChange(fields, lang, itemsOrderAnnotationType)}
                annotationsConfig={annotationsConfig}
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
)(Item);
