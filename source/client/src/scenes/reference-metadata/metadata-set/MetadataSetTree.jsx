import React, {Fragment} from "react";
import {compose} from "redux";
import {translate} from 'react-i18next';
import {connect} from "react-redux";
import EnhancedTree from "../../../components/enhanced-tree";
import {getNode, getNodes, UNCATEGORIZED_CATEGORY_CODE} from "../../../utils/tree";
import {getLocalizedStr} from "../../../middlewares/i18n/utils";
import Call from "../../../hocs/call";
import {
  categoriseMetadataSetMetadataSet,
  changeMetadataSetMetadataSetClone,
  createMetadataSetMetadataSet,
  deleteMetadataSetMetadataSet,
  hideMetadataSetMetadataSetClone,
  hideMetadataSetMetadataSetHtmlPage,
  readMetadataSetCategorizedMetadataSets,
  selectMetadataSetCategory,
  selectMetadataSetMetadataSet,
  showMetadataSetMetadataSetClone,
  showMetadataSetMetadataSetHtmlPage,
  submitMetadataSetMetadataSetClone
} from "./actions";
import {DataLanguageConsumer} from "../../../contexts/DataLanguage";
import {Button, Col, Form, Icon, Input, Modal, Row} from "antd";
import {
  GUTTER_SM,
  MARGIN_MD,
  MARGIN_SM,
  MODAL_HEIGHT_MD,
  MODAL_WIDTH_LG,
  MODAL_WIDTH_MD,
  SPAN_ONE_THIRD,
  SPAN_THREE_QUARTERS,
  SPAN_TWO_THIRDS
} from "../../../styles/constants";
import EnhancedModal from "../../../components/enhanced-modal";
import _ from "lodash";
import {getArtefactTripletFromUrn, getStringFromArtefactTriplet} from "../../../utils/sdmxJson";
import {
  getDcatMetadataSetHtmlPageUrl,
  getMetadataflowTripletFromAnnotations,
  getMetadataSetHtmlPageUrl
} from "../../../utils/referenceMetadata";
import {
  BUTTON_CLONE,
  BUTTON_CREATE,
  BUTTON_DELETE,
  BUTTON_INFO_PAGE,
  BUTTON_UNCATEGORIZE
} from "../../../styles/buttons";
import {normalizeId} from "../../../utils/normalizers";

const mapStateToProps = state => ({
  appLanguage: state.app.language,
  dataLanguages: state.config.dataManagement.dataLanguages,
  nodes: state.config.nodes,
  nodeId: state.app.endpointId,
  permissions: state.app.user.permissions,
  metadataSetTree: state.scenes.referenceMetadata.metadataSet.metadataSetTree,
  metadataSetId: state.scenes.referenceMetadata.metadataSet.metadataSetId,
  metadataSetCategory: state.scenes.referenceMetadata.metadataSet.metadataSetCategory,
  metadataSet: state.scenes.referenceMetadata.metadataSet.metadataSet,
  metadataSets: state.scenes.referenceMetadata.metadataSet.metadataSets,
  categorySchemes: state.scenes.referenceMetadata.metadataSet.categorySchemes,
  categoryId: state.scenes.referenceMetadata.metadataSet.categoryId,
  categoryUrn: state.scenes.referenceMetadata.metadataSet.categoryUrn,
  isCloneVisible: state.scenes.referenceMetadata.metadataSet.isCloneVisible,
  cloneId: state.scenes.referenceMetadata.metadataSet.cloneId,
  metadataSetHtmlPageUrl: state.scenes.referenceMetadata.metadataSet.metadataSetHtmlPageUrl
});

const mapDispatchToProps = dispatch => ({
  fetchMetadataSets: lang => dispatch(readMetadataSetCategorizedMetadataSets(lang)),
  onMetadataSetSelect: (metadataSet, msdTriplet) => dispatch(selectMetadataSetMetadataSet(metadataSet, msdTriplet)),
  onCategorySelect: (categoryId, categoryUrn) => dispatch(selectMetadataSetCategory(categoryId, categoryUrn)),
  onMetadataSetCreate: () => dispatch(createMetadataSetMetadataSet()),
  onMetadataSetCategorise: (metadataSet, categoryUrn) =>
    dispatch(categoriseMetadataSetMetadataSet(metadataSet, categoryUrn)),
  onMetadataSetDelete: metadataSetId => dispatch(deleteMetadataSetMetadataSet(metadataSetId)),
  onCloneShow: () => dispatch(showMetadataSetMetadataSetClone()),
  onCloneHide: () => dispatch(hideMetadataSetMetadataSetClone()),
  onCloneChange: fields => dispatch(changeMetadataSetMetadataSetClone(fields)),
  onCloneSubmit: (metadataSet, newId) => dispatch(submitMetadataSetMetadataSetClone(metadataSet, newId)),
  onHtmlPageShow: htmlPageUrl => dispatch(showMetadataSetMetadataSetHtmlPage(htmlPageUrl)),
  onHtmlPageHide: () => dispatch(hideMetadataSetMetadataSetHtmlPage())
});

const mapPropsToFields = ({cloneId}) => ({
  cloneId: Form.createFormField({value: cloneId})
});

const onFieldsChange = (props, fields) => props.onCloneChange(_.mapValues(fields, ({value}) => value));

const hasLocalPermission = (metadataSetId, metadataSetTree, permissions) => {
  if (!metadataSetId || !metadataSetTree || !permissions) {
    return false
  } else {
    const metadataSet = getNode(metadataSetTree, "categories", node =>
      node.type === "metadataSet" && node.id === metadataSetId);
    return (metadataSet && permissions.metadataflowOwner.includes(
      getStringFromArtefactTriplet(getMetadataflowTripletFromAnnotations(metadataSet))))
  }
};

const onDrop = (ev, metadataSetTree, permissions, onMetadataSetCategorise, t) => {

  if (ev.dragNode.props["data-node"].type === "metadataSet" && !hasLocalPermission(ev.dragNode.props["data-node"].id, metadataSetTree, permissions)) {
    Modal.error({title: t("scenes.referenceMetadata.metadataSet.metadataSetTree.errors.permissionDenied.title")})

  } else {
    if (ev.dragNode.props["data-node"].type === "metadataSet") {

      if (ev.dropToGap) {
        if (ev.dragNode.props["data-node"].categoryUrn !== ev.node.props["data-node"].categoryUrn) {
          (ev.node.props["data-node"].urn && ev.node.props["data-node"].parent)
            ? onMetadataSetCategorise(ev.dragNode.props["data-node"], ev.node.props["data-node"].categoryUrn)
            : (ev.node.props["data-node"].type === "metadataSet"
              ? ev.node.props["data-node"].categoryUrn
                ? onMetadataSetCategorise(ev.dragNode.props["data-node"], ev.node.props["data-node"].categoryUrn)
                : onMetadataSetCategorise(ev.dragNode.props["data-node"], null)
              : Modal.error({title: t("scenes.referenceMetadata.metadataSet.metadataSetTree.errors.notValidCategory.title")})
            );
        }

      } else {
        const nodeUrn = ev.node.props["data-node"].urn;
        if (ev.dragNode.props["data-node"].categoryUrn !== nodeUrn) {
          (nodeUrn && ev.node.props["data-node"].type === "category")
            ? onMetadataSetCategorise(ev.dragNode.props["data-node"], nodeUrn)
            : (ev.node.props["data-node"].id === UNCATEGORIZED_CATEGORY_CODE
              ? onMetadataSetCategorise(ev.dragNode.props["data-node"], null)
              : Modal.error({title: t("scenes.referenceMetadata.metadataSet.metadataSetTree.errors.notValidCategory.title")})
            );
        }
      }

    } else {
      Modal.error({title: t("scenes.referenceMetadata.metadataSet.metadataSetTree.errors.canDragOnlyMetadataSet.title")});
    }
  }
};

const formItemLayout = {
  labelCol: {span: SPAN_ONE_THIRD},
  wrapperCol: {span: SPAN_TWO_THIRDS}
};

const MetadataSetTree = ({
                           t,
                           form,
                           appLanguage,
                           dataLanguages,
                           permissions,
                           hasPermission,
                           nodes,
                           nodeId,
                           metadataSetTree,
                           metadataSetId,
                           metadataSetCategory,
                           metadataSet,
                           metadataSets,
                           categorySchemes,
                           categoryId,
                           categoryUrn,
                           isCloneVisible,
                           cloneId,
                           metadataSetHtmlPageUrl,
                           fetchMetadataSets,
                           onMetadataSetSelect,
                           onCategorySelect,
                           onMetadataSetCreate,
                           onMetadataSetCategorise,
                           onMetadataSetDelete,
                           onCloneShow,
                           onCloneHide,
                           onCloneSubmit,
                           onHtmlPageShow,
                           onHtmlPageHide
                         }) =>
  <DataLanguageConsumer>
    {dataLanguage => {
      const lang = dataLanguage || appLanguage;

      const connectedNode = nodes.find(node => node.general.id === nodeId);
      const dcatMsdUrn = connectedNode.dcatapit.msd;

      const uncategorizedNodeKey =
        (getNode(metadataSetTree, "categories", ({id}) => id === UNCATEGORIZED_CATEGORY_CODE) || {}).nodeKey;

      const getNodeKey = (category, id, isMetadataSet) => isMetadataSet
        ? `ms+${category || "uncategorized"}+${id}`
        : `cat+${category}+${id}`;

      return (
        <Fragment>
          <Call
            cb={fetchMetadataSets}
            cbParam={lang}
            disabled={categorySchemes !== null}
          >
            <div className={"metadata-set-tree__tree"}>
              <Row type="flex" justify="start" gutter={GUTTER_SM} style={{marginBottom: MARGIN_SM}}>
                <Col>
                  <Button
                    {...BUTTON_CREATE}
                    onClick={() => onMetadataSetCreate()}
                    title={t('scenes.referenceMetadata.metadataSet.metadataSetTree.actions.addMetadataSet.title')}
                    disabled={categoryId === null || categoryUrn.split(".")[categoryUrn.split(".").length - 1].includes(")")}
                  >
                    <Icon type="file-text"/>
                  </Button>
                </Col>
                <Col>
                  <Button
                    {...BUTTON_CLONE}
                    onClick={() => onCloneShow()}
                    title={t('scenes.referenceMetadata.metadataSet.metadataSetTree.actions.clone.title')}
                    disabled={metadataSetId === null || !hasPermission}
                  />
                </Col>
                <Col>
                  <Button
                    {...BUTTON_INFO_PAGE}
                    onClick={() => onHtmlPageShow(metadataSet.structureRef === dcatMsdUrn
                      ? getDcatMetadataSetHtmlPageUrl(nodeId, metadataSet.id, lang)
                      : getMetadataSetHtmlPageUrl(nodeId, metadataSet.id, lang)
                    )}
                    title={t('scenes.referenceMetadata.metadataSet.metadataSetTree.actions.navigateHtmlPage.title')}
                    disabled={metadataSetId === null}
                  />
                </Col>
                <Col>
                  <Button
                    {...BUTTON_UNCATEGORIZE}
                    onClick={() => onMetadataSetCategorise(metadataSet, null)}
                    title={t('scenes.referenceMetadata.metadataSet.metadataSetTree.actions.deleteCategorisation.title')}
                    disabled={metadataSetId === null || metadataSet === null || !metadataSet.categoryUrn || !hasPermission}
                  />
                </Col>
                <Col>
                  <Button
                    {...BUTTON_DELETE}
                    onClick={() => Modal.confirm({
                      title: t('scenes.referenceMetadata.metadataSet.metadataSetTree.modals.confirms.delete.title'),
                      onOk() {
                        onMetadataSetDelete(metadataSetId)
                      },
                      cancelText: t('commons.buttons.cancel.title')
                    })}
                    title={t('scenes.referenceMetadata.metadataSet.metadataSetTree.actions.delete.title')}
                    disabled={metadataSetId === null || !hasPermission}
                  />
                </Col>
              </Row>
              <EnhancedTree
                tree={metadataSetTree}
                getNodeKey={node => node.type === "metadataSet"
                  ? getNodeKey(node.categoryUrn, node.id, true)
                  : getNodeKey(node.urn, node.id, false)
                }
                childrenKey="categories"
                idKey="id"
                nameKey="name"
                catIdKey="id"
                catNameKey="name"
                getCatId={({id, version}) => `${id}${version ? `(${version})` : ''}`}
                icon="file-text"
                getIconColor={() => "#37a0f4"}
                getFilter={
                  searchText =>
                    ({id, name}) => {
                      const search = searchText.toLowerCase();
                      return (
                        (id && id.toLowerCase().indexOf(search) >= 0) ||
                        (name && getLocalizedStr(name, lang, dataLanguages).toLowerCase().indexOf(search) >= 0)
                      );
                    }
                }
                draggable
                hiddenIdKeys={getNodes(metadataSetTree, "categories", () => true)
                  .filter(({type}) => type === "category")
                  .map(node => getNodeKey(node.urn, node.id, false))
                }
                unselectableKeys={[uncategorizedNodeKey]}
                expandSelectedOnTreeChange
                onDrop={ev => onDrop(ev, metadataSetTree, permissions, onMetadataSetCategorise, t)}
                selectedKeys={metadataSetId !== null
                  ? [getNodeKey(metadataSetCategory, metadataSetId, true)]
                  : [getNodeKey(categoryUrn, categoryId, false)]
                }
                onSelect={
                  selectedArr => {
                    if (selectedArr !== null && selectedArr.length > 0) {
                      const node = getNode(
                        metadataSetTree,
                        'categories',
                        node => node.type === "metadataSet"
                          ? getNodeKey(node.categoryUrn, node.id, true) === selectedArr[0]
                          : getNodeKey(node.urn, node.id, false) === selectedArr[0]
                      );
                      if (node.type === "metadataSet") {
                        onMetadataSetSelect(node, getArtefactTripletFromUrn(node.structureRef));
                        onCategorySelect(null, null);
                      } else if (node.type === "category") {
                        onMetadataSetSelect(null, null);
                        onCategorySelect(node.id, node.urn);
                      } else if (node.type === "categoryScheme") {
                        onMetadataSetSelect(null, null);
                        onCategorySelect(node.id, node.urn);
                      }
                    } else {
                      onMetadataSetSelect(null, null);
                      onCategorySelect(null, null);
                    }
                  }
                }
                rightClickActions={[
                  node => node.type === "metadataSet"
                    ? ({
                      ...BUTTON_INFO_PAGE,
                      title: t('scenes.referenceMetadata.metadataSet.metadataSetTree.actions.navigateHtmlPage.title'),
                      onClick: ({id, structureRef}) => onHtmlPageShow(structureRef === dcatMsdUrn
                        ? getDcatMetadataSetHtmlPageUrl(nodeId, id, lang)
                        : getMetadataSetHtmlPageUrl(nodeId, id, lang)
                      )
                    })
                    : null,
                  node => node.type === "metadataSet"
                    ? ({
                      ...BUTTON_UNCATEGORIZE,
                      title: t('scenes.referenceMetadata.metadataSet.metadataSetTree.actions.deleteCategorisation.title'),
                      onClick: () => onMetadataSetCategorise(node, null),
                      disabled: !node.categoryUrn || !hasLocalPermission(node.id, metadataSetTree, permissions)
                    })
                    : null,
                  node => node.type === "metadataSet"
                    ? ({
                      ...BUTTON_DELETE,
                      title: t('scenes.referenceMetadata.metadataSet.metadataSetTree.actions.delete.title'),
                      onClick: () => Modal.confirm({
                        title: t('scenes.referenceMetadata.metadataSet.metadataSetTree.modals.confirms.delete.title'),
                        onOk() {
                          onMetadataSetDelete(node.id)
                        },
                        cancelText: t('commons.buttons.cancel.title')
                      }),
                      disabled: !hasLocalPermission(node.id, metadataSetTree, permissions)
                    })
                    : null
                ]}
                searchBarSpan={SPAN_THREE_QUARTERS}
              />
            </div>
          </Call>
          <EnhancedModal
            title={t("scenes.referenceMetadata.metadataSet.modals.metadataSetClone.title")}
            visible={isCloneVisible}
            onCancel={onCloneHide}
            width={MODAL_WIDTH_MD}
            footer={
              <div>
                <Button onClick={onCloneHide}>{t('commons.buttons.close.title')}</Button>
                <Button
                  type="primary"
                  onClick={() => onCloneSubmit(metadataSet, cloneId)}
                  disabled={cloneId === null || cloneId.length === 0 || (metadataSets || []).find(({id}) => id === cloneId)}
                >
                  {t("commons.buttons.save.title")}
                </Button>
              </div>
            }
          >
            <Form.Item
              label={t("scenes.referenceMetadata.metadataSet.metadataSetDetail.id.label")}
              className="form-item-required"
              style={{marginBottom: MARGIN_MD}}
              hasFeedback
              validateStatus={(metadataSets || []).find(({id}) => id === cloneId) ? "warning" : null}
              help={(metadataSets || []).find(({id}) => id === cloneId)
                ? t("scenes.referenceMetadata.metadataSet.metadataSetDetail.id.alreadyUsed.help")
                : undefined
              }
              {...formItemLayout}
            >
              {form.getFieldDecorator("cloneId", {normalize: normalizeId})(
                <Input
                  title={form.getFieldValue("cloneId")}
                />
              )}
            </Form.Item>
          </EnhancedModal>
          <Modal
            visible={metadataSetHtmlPageUrl !== null}
            title={t('scenes.referenceMetadata.commons.modals.htmlPage.title')}
            maskClosable={false}
            onCancel={onHtmlPageHide}
            width={MODAL_WIDTH_LG}
            bodyStyle={{position: "relative", height: MODAL_HEIGHT_MD, padding: 0}}
            footer={<Button onClick={onHtmlPageHide}>{t('commons.buttons.close.title')}</Button>}
          >
            {
              metadataSetHtmlPageUrl && (
                <iframe
                  title={"title"}
                  src={metadataSetHtmlPageUrl}
                  style={{position: "absolute", border: 0, width: "100%", height: "100%"}}
                />
              )
            }
          </Modal>
        </Fragment>
      )
    }}
  </DataLanguageConsumer>;

export default compose(
  translate(),
  connect(mapStateToProps, mapDispatchToProps),
  Form.create({mapPropsToFields, onFieldsChange})
)(MetadataSetTree);
