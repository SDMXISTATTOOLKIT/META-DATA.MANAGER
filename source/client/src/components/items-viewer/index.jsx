import {Button, Col, Icon, Modal, Radio, Row} from "antd";
import {MARGIN_SM, MODAL_WIDTH_LG} from "../../styles/constants";
import {getNode, getNodes} from "../../utils/tree";
import EnhancedTree from "../enhanced-tree";
import {getLocalizedStr} from "../../middlewares/i18n/utils";
import React, {Fragment} from "react";
import {DataLanguageConsumer} from "../../contexts/DataLanguage";
import {translate} from "react-i18next";
import {compose} from "redux";
import {connect} from "react-redux";
import "./style.css"
import Call from "../../hocs/call";
import FileSystemTree from "../file-system-tree";
import EnhancedModal from "../enhanced-modal";
import {
  BUTTON_ADD_AGENCY_TO_CONFIG,
  BUTTON_CREATE,
  BUTTON_CUSTOM_ANNOTATIONS,
  BUTTON_CUT,
  BUTTON_DELETE,
  BUTTON_DETAIL,
  BUTTON_LAYOUT_ANNOTATIONS,
  BUTTON_PASTE,
  BUTTON_PASTE_AS_BROTHER,
  BUTTON_SET_DEFAULT,
  BUTTON_SET_DEFAULT_ORDER,
  BUTTON_UNSET_DEFAULT
} from "../../styles/buttons";
import {
  NODES_CONFIG_NODE_GENERAL_ITEMS_VIEW_MODE_TABLE,
  NODES_CONFIG_NODE_GENERAL_ITEMS_VIEW_MODE_TREE
} from "../../scenes/configuration/nodes-config/node/GeneralForm";
import {
  countCustomAnnotations,
  countLayoutAnnotations,
  getLayoutAnnotationDefaultForCodelist
} from "../../utils/annotations";
import ItemList from "../item-list";

const TREE_NODE_COLOR_LAYOUT_ANNOTATION_DEFAULT = "blue";

const mapStateToProps = state => ({
  permissions: state.app.user.permissions,
  appLanguage: state.app.language,
  dataLanguages: state.config.dataManagement.dataLanguages,
  maxTreeNodes: state.config.userInterface.maxTreeNodes,
  endpoints: state.config.nodes,
  endpointId: state.app.endpointId,
  username: state.app.user.username
});

const onDropHandler = (ev, onDrop, artefact, itemTree, itemsOrderAnnotationType, lang, cutItem, t, isNotHierarchical) => {
  const pos = ev.node.props.pos.split('-');
  const dropPos = ev.dropPosition - Number(pos[pos.length - 1]);

  const newParent = isNotHierarchical
    ? ev.node.props["data-node"].parent
    : ev.dropToGap
      ? ev.node.props["data-node"].parent
      : ev.node.props["data-node"].id;

  const newOrder = ev.dropToGap
    ? dropPos > 0
      ? Number(ev.node.props["data-node"].order[lang]) + 0.1 // dropPos = 1 => drag on bottom node gap
      : Number(ev.node.props["data-node"].order[lang]) - 0.1 // dropPos = -1 => drag on top node gap
    : isNotHierarchical
      ? Number(ev.node.props["data-node"].order[lang]) + 0.1
      : Number.MAX_VALUE;

  onDrop(ev.dragNode.props["data-node"], newParent, String(newOrder), artefact, itemTree, itemsOrderAnnotationType, lang, cutItem, t);
};

const onPaginatedDropHandler = (ev, onPaginatedDrop, artefactTriplet, lang, autoSave, itemTree, cutItem, t) => {
  const pos = ev.node.props.pos.split('-');
  const dropPos = ev.dropPosition - Number(pos[pos.length - 1]);

  const newParentId = ev.dropToGap
    ? ev.node.props["data-node"].parent
    : ev.node.props["data-node"].id;

  const gapPos = ev.dropToGap
    ? dropPos > 0
      ? {before: null, after: ev.node.props["data-node"].id} // dropPos = 1 => drag on bottom node gap
      : {before: ev.node.props["data-node"].id, after: null} // dropPos = -1 => drag on top node gap
    : {before: null, after: null};

  onPaginatedDrop(artefactTriplet, ev.dragNode.props["data-node"].id, newParentId, gapPos.before, gapPos.after, lang, autoSave, itemTree, cutItem, t)
};

const ItemsViewer = ({
                       t,
                       permissions,
                       appLanguage,
                       dataLanguages,
                       artefact,
                       artefactTriplet,
                       itemPage,
                       fetchPage,
                       fetchPageParams,
                       fetchPageParamsUpdate,
                       itemTree,
                       fetchTree,
                       itemCount,
                       childrenKey,
                       selectedItem,
                       cutItem,
                       itemsViewMode,
                       itemsOrderAnnotationType,
                       maxOrder,
                       onCreate,
                       onPaginatedCreate,
                       onDelete,
                       onPaginatedDelete,
                       onDetailShow,
                       onSelect,
                       onDrop,
                       onPaginatedDrop,
                       onCut,
                       onPaste,
                       onPaginatedPaste,
                       onAnnotationsShow,
                       onLayoutAnnotationsShow,
                       onSetDefault,
                       onUnsetDefault,
                       onViewModeChange,
                       onImportFormShow,
                       autoSave,
                       isFileSystemTreeVisible,
                       onFileSystemtreeShow,
                       onFileSystemtreeHide,
                       fileSystemSelectedItem,
                       onFileSystemSelect,
                       maxTreeNodes,
                       unsavedChange,
                       rebuildDb,
                       endpoints,
                       endpointId,
                       username,
                       isNotHierarchical,
                       isEditDisabled,
                       isCallDisabled,
                       onSetDefaultOrder,
                       onPaginatedSetDefaultOrder,
                       onAddAgencyToConfig
                     }) =>
  <DataLanguageConsumer>
    {dataLanguage => {
      const lang = dataLanguage || appLanguage;

      const userHasPermissionsToEdit = (
        permissions &&
        artefactTriplet &&
        permissions.agencies.filter(agency => agency === artefactTriplet.agencyID).length > 0 &&
        !isEditDisabled
      );

      const annotationsConfig = endpoints.find(endpoint => endpoint.general.id === endpointId).annotations;
      const customAnnotationsConfig = endpoints.filter(endpoint => endpoint.general.id === endpointId)[0].annotationTabs.tabs;

      const treeNodeActions = [
        node => onDetailShow
          ? {
            ...BUTTON_DETAIL,
            title: userHasPermissionsToEdit
              ? t('components.itemList.actions.edit.title')
              : t('components.itemList.actions.view.title'),
            onClick: () => onDetailShow(node)
          }
          : null,
        node => ((onCreate || onPaginatedCreate) && userHasPermissionsToEdit && !isNotHierarchical)
          ? {
            ...BUTTON_CREATE,
            title: t('components.itemList.actions.add.title'),
            onClick: () => onPaginatedCreate
              ? onPaginatedCreate(node.id, null, lang)
              : onCreate(node.id, String(maxOrder + 1), lang, itemsOrderAnnotationType)
          }
          : null,
        node => ((onDelete || onPaginatedDelete) && userHasPermissionsToEdit)
          ? {
            ...BUTTON_DELETE,
            title: t('components.itemList.actions.delete.title'),
            onClick: () => Modal.confirm({
              title: t('components.itemList.modals.confirms.delete.title'),
              onOk() {
                onPaginatedDelete
                  ? onPaginatedDelete(artefactTriplet, node.id, autoSave, itemTree, cutItem, lang, t)
                  : (((node[childrenKey] && node[childrenKey].length > 0) || (cutItem && node.id === cutItem.parent))
                    ? Modal.warning({
                      title: t('components.itemList.modals.warning.delete.title')
                    })
                    : onDelete(artefact, itemTree, node, cutItem, lang, t, itemsOrderAnnotationType)
                  )
              },
              cancelText: t('commons.buttons.cancel.title')
            }),
            disabled: artefact && artefact.isFinal
          }
          : null,
        node => ((onPaste || onPaginatedPaste) && onCut && userHasPermissionsToEdit && !cutItem)
          ? {
            ...BUTTON_CUT,
            title: t('components.itemList.actions.cut.title'),
            onClick: () => onCut(node)
          }
          : null,
        node => ((onPaste || onPaginatedPaste) && onCut && userHasPermissionsToEdit && cutItem && !isNotHierarchical)
          ? {
            ...BUTTON_PASTE,
            title: t('components.itemList.actions.pasteAsChild.title'),
            onClick: () => onPaginatedPaste
              ? onPaginatedPaste(artefactTriplet, lang, cutItem.id, node.id, null, autoSave)
              : onPaste(cutItem, node, null, artefact, itemTree, lang, itemsOrderAnnotationType)
          }
          : null,
        node => ((onPaste || onPaginatedPaste) && onCut && userHasPermissionsToEdit && cutItem)
          ? {
            ...BUTTON_PASTE_AS_BROTHER,
            title: t('components.itemList.actions.pasteAsBrother.title'),
            onClick: () => onPaginatedPaste
              ? onPaginatedPaste(artefactTriplet, lang, cutItem.id, node.parent, node.id, autoSave)
              : onPaste(cutItem, null, node, artefact, itemTree, lang, itemsOrderAnnotationType)
          }
          : null,
        node => (onSetDefault && onUnsetDefault && userHasPermissionsToEdit)
          ? getLayoutAnnotationDefaultForCodelist(node.annotations, annotationsConfig)
            ? {
              ...BUTTON_UNSET_DEFAULT,
              title: t('components.itemList.actions.unsetDefault.title'),
              onClick: () => onUnsetDefault(node)
            }
            : {
              ...BUTTON_SET_DEFAULT,
              title: t('components.itemList.actions.setDefault.title'),
              onClick: () => onSetDefault(node)
            }
          : null,
        node => onAddAgencyToConfig
          ? {
            ...BUTTON_ADD_AGENCY_TO_CONFIG,
            title: t('components.itemList.actions.addAgencyToConfig.title'),
            onClick: () => onAddAgencyToConfig(node)
          }
          : null
      ];
      const treeNodeFixedActions = [
        ({annotations}) => {
          const customAnnotationsCount = countCustomAnnotations(annotations, customAnnotationsConfig);
          return (onAnnotationsShow && customAnnotationsCount > 0)
            ? ({
              ...BUTTON_CUSTOM_ANNOTATIONS,
              title: t('commons.actions.customAnnotations.title') + ": " + customAnnotationsCount,
              onClick: () => onAnnotationsShow(annotations)
            })
            : null
        },
        ({annotations}) =>
          username
            ? (() => {
              const layoutAnnotationsCount = countLayoutAnnotations(annotations, annotationsConfig);
              return (layoutAnnotationsCount > 0)
                ? ({
                  ...BUTTON_LAYOUT_ANNOTATIONS,
                  title: t('commons.actions.layoutAnnotations.title') + ": " + layoutAnnotationsCount,
                  onClick: () => onLayoutAnnotationsShow(annotations)
                })
                : null;
            })()
            : null
      ];

      const leftActions =
        <Row type="flex" justify="start" gutter={MARGIN_SM}>
          {onViewModeChange && (
            <Col>
              <Radio.Group
                value={itemsViewMode}
                onChange={({target}) =>
                  (target.value === NODES_CONFIG_NODE_GENERAL_ITEMS_VIEW_MODE_TREE && itemCount > maxTreeNodes)
                    ? Modal.error({
                      title: t('components.itemList.modals.treeViewModeUnavailable.title'),
                      content: t('components.itemList.modals.treeViewModeUnavailable.content')
                    })
                    : onViewModeChange(target.value)
                }
              >
                <Radio.Button value={NODES_CONFIG_NODE_GENERAL_ITEMS_VIEW_MODE_TABLE}>
                  <div title={t('components.itemList.buttons.viewModeRadio.table.title')}>
                    <Icon type="table"/>
                  </div>
                </Radio.Button>
                <Radio.Button value={NODES_CONFIG_NODE_GENERAL_ITEMS_VIEW_MODE_TREE}>
                  <div title={t('components.itemList.buttons.viewModeRadio.tree.title')}>
                    <Icon type="branches" style={{transform: "rotate(90deg)"}}/>
                  </div>
                </Radio.Button>
              </Radio.Group>
            </Col>
          )}
          {(onImportFormShow && userHasPermissionsToEdit) && (
            <Col>
              <Button
                icon="upload"
                title={t('components.itemList.buttons.upload.title')}
                onClick={() => {
                  if (unsavedChange) {
                    Modal.confirm({
                      title: t('commons.artefact.modals.unsavedChange.discard.title'),
                      onOk() {
                        onImportFormShow();
                      },
                      cancelText: t('commons.buttons.cancel.title')
                    })
                  } else {
                    onImportFormShow();
                  }
                }}
              />
            </Col>
          )}
          {((onCreate || onPaginatedCreate) && userHasPermissionsToEdit) && (
            <Col>
              <Button
                {...BUTTON_CREATE}
                type="primary"
                title={t('components.itemList.buttons.create.title')}
                onClick={() =>
                  selectedItem
                    ? (onPaginatedCreate
                      ? onPaginatedCreate(selectedItem.parent, selectedItem.order, lang)
                      : onCreate(selectedItem.parent, String(Number(selectedItem.order[lang]) + 0.1), lang, itemsOrderAnnotationType)
                    )
                    : (onPaginatedCreate
                      ? onPaginatedCreate(null, null, lang)
                      : onCreate(null, String(maxOrder + 1), lang, itemsOrderAnnotationType)
                    )
                }
              />
            </Col>
          )}
          {((onSetDefaultOrder || onPaginatedSetDefaultOrder) && userHasPermissionsToEdit) && (
            <Col>
              <Button
                {...BUTTON_SET_DEFAULT_ORDER}
                type="primary"
                title={t('components.itemList.buttons.setDefaultOrder.title')}
                onClick={onPaginatedSetDefaultOrder
                  ? () => {
                    if (unsavedChange) {
                      Modal.confirm({
                        title: t('commons.artefact.modals.unsavedChange.autoSave.title'),
                        onOk() {
                          onPaginatedSetDefaultOrder(artefactTriplet, lang);
                        },
                        cancelText: t('commons.buttons.cancel.title')
                      })
                    } else {
                      onPaginatedSetDefaultOrder(artefactTriplet, lang);
                    }
                  }
                  : () => onSetDefaultOrder(artefact, itemTree, lang, dataLanguages, itemsOrderAnnotationType)
                }
                disabled={!artefact || !artefact.isFinal}
              >
                {t('components.itemList.buttons.setDefaultOrder.label')}
              </Button>
            </Col>
          )}
        </Row>;

      const itemList = (itemTree && !fetchPage) ? getNodes(itemTree, childrenKey, () => true) : [];

      return (
        <Fragment>
          {
            itemsViewMode === NODES_CONFIG_NODE_GENERAL_ITEMS_VIEW_MODE_TABLE
              ? (
                <Call
                  cb={fetchPage}
                  cbParam={{...fetchPageParams, rebuildDb}}
                  disabled={!fetchPage || fetchPageParams === null || isCallDisabled}
                >
                  <ItemList
                    data={itemPage || itemList}
                    rowCount={fetchPage ? itemCount : null}
                    isPaginated={fetchPage ? true : false}
                    actions={[]
                      .concat(onDetailShow
                        ? {
                          ...BUTTON_DETAIL,
                          title: userHasPermissionsToEdit
                            ? t('components.itemList.actions.edit.title')
                            : t('components.itemList.actions.view.title'),
                          onClick: item => onDetailShow(item)
                        }
                        : []
                      )
                      .concat(((onCreate || onPaginatedCreate) && userHasPermissionsToEdit && !isNotHierarchical)
                        ? {
                          ...BUTTON_CREATE,
                          title: t('components.itemList.actions.add.title'),
                          onClick: item => onPaginatedCreate
                            ? onPaginatedCreate(item.id, null, lang)
                            : onCreate(item.id, String(maxOrder + 1), lang, itemsOrderAnnotationType)
                        }
                        : []
                      )
                      .concat((onSetDefault && onUnsetDefault && userHasPermissionsToEdit)
                        ? item => getLayoutAnnotationDefaultForCodelist(item.annotations, annotationsConfig)
                          ? {
                            ...BUTTON_UNSET_DEFAULT,
                            title: t('components.itemList.actions.unsetDefault.title'),
                            onClick: () => onUnsetDefault((itemPage || itemList).find(({id}) => id === item.id))
                          }
                          : {
                            ...BUTTON_SET_DEFAULT,
                            title: t('components.itemList.actions.setDefault.title'),
                            onClick: () => onSetDefault((itemPage || itemList).find(({id}) => id === item.id))
                          }
                        : []
                      ).concat(onAddAgencyToConfig
                        ? {
                          ...BUTTON_ADD_AGENCY_TO_CONFIG,
                          title: t('components.itemList.actions.addAgencyToConfig.title'),
                          onClick: item => onAddAgencyToConfig(item)
                        }
                        : []
                      )
                      .concat(((onDelete || onPaginatedDelete) && userHasPermissionsToEdit)
                        ? {
                          ...BUTTON_DELETE,
                          title: t('components.itemList.actions.delete.title'),
                          onClick: item => Modal.confirm({
                            title: t('components.itemList.modals.confirms.delete.title'),
                            onOk() {
                              onPaginatedDelete
                                ? onPaginatedDelete(artefactTriplet, item.id, autoSave, itemTree, cutItem, lang, t)
                                : (((item[childrenKey] && item[childrenKey].length > 0) || (cutItem && item.id === cutItem.parent))
                                  ? Modal.warning({
                                    title: t('components.itemList.modals.warning.delete.title')
                                  })
                                  : onDelete(artefact, itemTree, item, cutItem, lang, t, itemsOrderAnnotationType)
                                )
                            },
                            cancelText: t('commons.buttons.cancel.title')
                          }),
                          disabled: artefact && artefact.isFinal
                        }
                        : []
                      )}
                    fixedActions={[]
                      .concat(onAnnotationsShow
                        ? ({id, annotations}) => {
                          const customAnnotationsCount = countCustomAnnotations(annotations, customAnnotationsConfig);
                          return (customAnnotationsCount > 0)
                            ? {
                              ...BUTTON_CUSTOM_ANNOTATIONS,
                              title: t('commons.actions.customAnnotations.title') + ": " + customAnnotationsCount,
                              onClick: () => onAnnotationsShow(annotations, id)
                            }
                            : null
                        }
                        : []
                      )
                      .concat((onLayoutAnnotationsShow && username)
                        ? ({id, annotations}) => {
                          const layoutAnnotationsCount = countLayoutAnnotations(annotations, annotationsConfig);
                          return (layoutAnnotationsCount > 0)
                            ? {
                              ...BUTTON_LAYOUT_ANNOTATIONS,
                              title: t('commons.actions.layoutAnnotations.title') + ": " + layoutAnnotationsCount,
                              onClick: () => onLayoutAnnotationsShow(annotations, id)
                            }
                            : null;
                        }
                        : []
                      )
                    }
                    leftActions={leftActions}
                    onChange={({pageNum, pageSize, searchText, filters, sortCol, sortByDesc}) =>
                      fetchPageParamsUpdate
                        ? fetchPageParamsUpdate({
                          artefactTriplet,
                          lang,
                          pageNum,
                          pageSize,
                          itemsOrderAnnotationType,
                          searchText,
                          filters,
                          sortCol,
                          sortByDesc
                        })
                        : null
                    }
                  />
                </Call>
              )
              : (
                <div
                  className={`item-list__tree ${isNotHierarchical ? 'item-list__tree__not-hierarchical-drag-over' : ''}`}
                >
                  <Call
                    cb={fetchTree}
                    cbParam={{artefactTriplet, lang, itemsOrderAnnotationType, rebuildDb}}
                    disabled={(fetchTree ? itemTree !== null : true) || isCallDisabled}
                  >
                    <EnhancedTree
                      tree={itemTree}
                      getNodeKey={({id}) => id}
                      childrenKey={childrenKey}
                      idKey="id"
                      nameKey="name"
                      catIdKey="id"
                      catNameKey="name"
                      icon="file-text"
                      isRootIconLikeChildrenIcon
                      isEmptyCategoryIconLikeLeafIcon
                      getFilter={
                        searchText =>
                          ({id, name}) => {
                            const search = searchText.toLowerCase();
                            return (id && id.toLowerCase()
                                .indexOf(search) >= 0) ||
                              getLocalizedStr(name, lang, dataLanguages)
                                .toLowerCase()
                                .indexOf(search) >= 0;
                          }
                      }
                      draggable={(onDrop || onPaginatedDrop) && userHasPermissionsToEdit}
                      onDrop={ev => onPaginatedDrop
                        ? onPaginatedDropHandler(ev, onPaginatedDrop, artefactTriplet, lang, autoSave, itemTree, cutItem, t)
                        : onDropHandler(ev, onDrop, artefact, itemTree, itemsOrderAnnotationType, lang, cutItem, t, isNotHierarchical)
                      }
                      unselectableKeys={onSelect
                        ? []
                        : getNodes(itemTree, childrenKey, () => true).map(item => item.id)}
                      onSelect={
                        onSelect
                          ? (
                            selectedArr => {
                              if (selectedArr !== null) {
                                onSelect(selectedArr[0]);
                              } else {
                                onSelect(null);
                              }
                            }
                          )
                          : null
                      }
                      treeActions={[
                        onFileSystemtreeShow
                          ? {
                            icon: 'eye',
                            title: t('components.itemList.actions.fileSystemTree.title'),
                            onClick: () => onFileSystemtreeShow()
                          }
                          : null
                      ]}
                      actions={[
                        onDetailShow
                          ? {
                            ...BUTTON_DETAIL,
                            title: userHasPermissionsToEdit
                              ? t('components.itemList.actions.edit.title')
                              : t('components.itemList.actions.view.title'),
                            onClick: () => onDetailShow(selectedItem),
                            disabled: selectedItem === null
                          }
                          : null,
                        ((onCreate || onPaginatedCreate) && userHasPermissionsToEdit && !isNotHierarchical)
                          ? {
                            ...BUTTON_CREATE,
                            title: t('components.itemList.actions.add.title'),
                            onClick: () => onPaginatedCreate
                              ? onPaginatedCreate(selectedItem.id, null, lang)
                              : onCreate(selectedItem.id, String(maxOrder + 1), lang, itemsOrderAnnotationType),
                            disabled: selectedItem === null
                          }
                          : null,
                        ((onDelete || onPaginatedDelete) && userHasPermissionsToEdit)
                          ? {
                            ...BUTTON_DELETE,
                            title: t('components.itemList.actions.delete.title'),
                            onClick: () => Modal.confirm({
                              title: t('components.itemList.modals.confirms.delete.title'),
                              onOk() {
                                onPaginatedDelete
                                  ? onPaginatedDelete(artefactTriplet, selectedItem.id, autoSave, itemTree, cutItem, lang, t)
                                  : (
                                    ((selectedItem[childrenKey] && selectedItem[childrenKey].length > 0) || (cutItem && selectedItem.id === cutItem.parent))
                                      ? Modal.warning({
                                        title: t('components.itemList.modals.warning.delete.title')
                                      })
                                      : onDelete(artefact, itemTree, selectedItem, cutItem, lang, t, itemsOrderAnnotationType)
                                  )
                              },
                              cancelText: t('commons.buttons.cancel.title')
                            }),
                            disabled: (selectedItem === null || (artefact && artefact.isFinal))
                          }
                          : null
                      ]}
                      nodeActions={treeNodeFixedActions}
                      rightClickActions={treeNodeActions}
                      leftActions={leftActions}
                      onShowMoreForbidden={
                        () => {
                          const modal = Modal.warning();
                          modal.update({
                            title: t('components.itemList.modals.maxTreeSizeReached.title'),
                            content:
                              <Fragment>
                                {`${t('components.itemList.modals.maxTreeSizeReached.content')} `}
                                <a
                                  onClick={() => {
                                    modal.destroy();
                                    onFileSystemtreeShow();
                                  }}
                                  style={{textDecoration: "underline"}}
                                >
                                  {t('components.itemList.modals.maxTreeSizeReached.exploreLink')}
                                </a>
                              </Fragment>
                          })
                        }
                      }
                      getNodeTextColor={({annotations}) => getLayoutAnnotationDefaultForCodelist(annotations, annotationsConfig) ? TREE_NODE_COLOR_LAYOUT_ANNOTATION_DEFAULT : null}
                      isTreeVisible={!isFileSystemTreeVisible}
                    />
                  </Call>
                </div>
              )
          }
          <EnhancedModal
            visible={isFileSystemTreeVisible}
            onCancel={onFileSystemtreeHide}
            title={t('components.itemList.modals.parentList.title')}
            width={MODAL_WIDTH_LG}
            footer={<Button onClick={onFileSystemtreeHide}>{t('commons.buttons.close.title')}</Button>}
          >
            <FileSystemTree
              height={390}
              getItemKey={item => item.id}
              getItems={key => key
                ? (getNode(itemTree, "codes", item => item.id === key) || {}).codes
                : itemTree
              }
              getItemIcon={item => (item.codes && item.codes.length > 0)
                ? <Icon type="folder" theme="filled" style={{color: "#f7c427"}}/>
                : <Icon type="file-text"/>
              }
              getItemLabel={item => `[${item.id}] ${getLocalizedStr(item.name, lang, dataLanguages)}`}
              getItemLabelForPath={item => item.id}
              getItemIsLeaf={item => !item.codes || item.codes.length === 0}
              actions={[
                onDetailShow
                  ? {
                    ...BUTTON_DETAIL,
                    title: userHasPermissionsToEdit
                      ? t('components.itemList.actions.edit.title')
                      : t('components.itemList.actions.view.title'),
                    onClick: () => onDetailShow(fileSystemSelectedItem),
                    disabled: fileSystemSelectedItem === null
                  }
                  : null,
                ((onCreate || onPaginatedCreate) && userHasPermissionsToEdit)
                  ? {
                    ...BUTTON_CREATE,
                    title: t('components.itemList.actions.add.title'),
                    onClick: () => onPaginatedCreate
                      ? onPaginatedCreate(fileSystemSelectedItem.id, null, lang)
                      : onCreate(fileSystemSelectedItem.id, String(maxOrder + 1), lang, itemsOrderAnnotationType),
                    disabled: fileSystemSelectedItem === null
                  }
                  : null,
                ((onDelete || onPaginatedDelete) && userHasPermissionsToEdit)
                  ? {
                    ...BUTTON_DELETE,
                    title: t('components.itemList.actions.delete.title'),
                    onClick: () => Modal.confirm({
                      title: t('components.itemList.modals.confirms.delete.title'),
                      onOk() {
                        onPaginatedDelete
                          ? onPaginatedDelete(artefactTriplet, fileSystemSelectedItem.id, autoSave, itemTree, cutItem, lang, t)
                          : (
                            ((fileSystemSelectedItem[childrenKey] && fileSystemSelectedItem[childrenKey].length > 0) || (cutItem && fileSystemSelectedItem.id === cutItem.parent))
                              ? Modal.warning({
                                title: t('components.itemList.modals.warning.delete.title')
                              })
                              : onDelete(artefact, itemTree, fileSystemSelectedItem, cutItem, lang, t, itemsOrderAnnotationType)
                          )
                      },
                      cancelText: t('commons.buttons.cancel.title')
                    }),
                    disabled: (fileSystemSelectedItem === null || (artefact && artefact.isFinal))
                  }
                  : null
              ]}
              treeActions={[
                ((onCreate || onPaginatedCreate) && userHasPermissionsToEdit)
                  ? ({
                    ...BUTTON_CREATE,
                    title: t('components.itemList.buttons.create.title'),
                    onClick: () =>
                      fileSystemSelectedItem
                        ? (onPaginatedCreate
                          ? onPaginatedCreate(fileSystemSelectedItem.parent, fileSystemSelectedItem.order, lang)
                          : onCreate(fileSystemSelectedItem.parent, String(Number(fileSystemSelectedItem.order[lang]) + 0.1), lang, itemsOrderAnnotationType)
                        )
                        : (onPaginatedCreate
                          ? onPaginatedCreate(null, null, lang)
                          : onCreate(null, String(maxOrder + 1), lang, itemsOrderAnnotationType)
                        )
                  })
                  : null
              ]}
              itemActions={treeNodeActions}
              fixedItemActions={treeNodeFixedActions}
              selected={fileSystemSelectedItem ? fileSystemSelectedItem.id : null}
              onSelect={onFileSystemSelect}
            />
          </EnhancedModal>
        </Fragment>
      )
    }}
  </DataLanguageConsumer>;

export default compose(
  translate(),
  connect(mapStateToProps)
)(ItemsViewer);
