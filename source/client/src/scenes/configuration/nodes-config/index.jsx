import React, {Fragment} from 'react';
import {translate} from 'react-i18next';
import Node from "./node";
import Call from "../../../hocs/call";
import {showSuperUserLoginForm} from "../../../middlewares/authentication/actions";
import {
  addNodesConfigNode,
  changeNodesConfigConfig,
  changeNodesConfigNodeCollapsed,
  getNodesConfigConfig,
  hideNodesConfigMsds,
  readNodesConfigMsds,
  removeNodesConfigNewNode,
  removeNodesConfigNode,
  setNodesConfigMsd,
  sortNodesConfigNode,
  submitNodesConfigNodeConfig
} from "./actions";
import {connect} from "react-redux";
import {compose} from "redux";
import {MARGIN_MD, MODAL_WIDTH_LG} from "../../../styles/constants";
import {Button, Col, Collapse, Divider, Modal, Row} from "antd";
import NodeCredentialsModal from "./NodeCredentialsModal";
import _ from 'lodash';
import {scrollTo} from '../../../middlewares/scrollTo/actions';
import {DragDropContext, Draggable, Droppable} from "react-beautiful-dnd";
import DragHandle from "../../../components/drag-handle";
import EnhancedModal from "../../../components/enhanced-modal";
import {getUrnFromArtefact} from "../../../utils/sdmxJson";
import ArtefactList from "../../../components/artefact-list";
import {isDictionaryValid} from "../../../utils/artefactValidators";

const mapStateToProps = state => ({
  dataLangs: state.config.dataManagement.dataLanguages,
  config: state.scenes.configuration.nodesConfig.config,
  superUserUsername: state.app.superUser.username,
  isMsdsVisible: state.scenes.configuration.nodesConfig.isMsdsVisible,
  msds: state.scenes.configuration.nodesConfig.msds
});

const mapDispatchToProps = dispatch => ({
  onChange: config => dispatch(changeNodesConfigConfig(config)),
  onNodeAdd: dataLangs => dispatch(addNodesConfigNode(dataLangs)),
  onNewNodeRemove: index => dispatch(removeNodesConfigNewNode(index)),
  onNodeRemove: (index, nodeId) => dispatch(removeNodesConfigNode(index, nodeId)),
  onNodeSubmit: (nodeConfig, username, password) =>
    dispatch(submitNodesConfigNodeConfig(nodeConfig, username, password)),
  onNodeSort: orderedNodes => dispatch(sortNodesConfigNode(orderedNodes)),
  showConfigurationSuperUserLoginForm: () => dispatch(showSuperUserLoginForm()),
  scrollToLastNewNode: lastNewNodeElement => dispatch(scrollTo(lastNewNodeElement)),
  onNodeCollapsedChange: (nodeIndex, collapsed) => dispatch(changeNodesConfigNodeCollapsed(nodeIndex, collapsed)),
  fetchConfig: () => dispatch(getNodesConfigConfig()),
  onMsdsHide: () => dispatch(hideNodesConfigMsds()),
  fetchMsds: () => dispatch(readNodesConfigMsds()),
  onMsdSet: obj => dispatch(setNodesConfigMsd(obj))
});

class NodesConfig extends React.Component {

  componentDidUpdate(prevProps) {

    if (prevProps.config && this.props.config && prevProps.config.length < this.props.config.length) {

      const nodeCards = document.getElementsByClassName("nodes-config__node");

      this.props.scrollToLastNewNode(nodeCards[nodeCards.length - 1]);
    }
  }

  render() {
    const {
      t,
      dataLangs,
      config,
      superUserUsername,
      onNodeAdd,
      onNodeRemove,
      onNewNodeRemove,
      onChange,
      showConfigurationSuperUserLoginForm,
      onNodeSubmit,
      onNodeSort,
      onNodeCollapsedChange,
      fetchConfig,
      isMsdsVisible,
      msds,
      onMsdsHide,
      fetchMsds,
      onMsdSet
    } = this.props;

    return (
      <Fragment>
        <Call cb={showConfigurationSuperUserLoginForm} disabled={superUserUsername !== null}>
          {superUserUsername && (
            <Call cb={fetchConfig} disabled={config !== null}>
              {config !== null && (
                <Fragment>
                  <Button onClick={() => onNodeAdd(dataLangs)} type="primary" icon="plus"
                          style={{marginBottom: MARGIN_MD}}>
                    {t('scenes.configuration.nodesConfig.buttons.addNode.title')}
                  </Button>
                  <DragDropContext
                    onDragEnd={
                      ({source: src, destination: dest}) => {

                        const moved = _.cloneDeep(config[src.index]);
                        let orderedNodes = _.cloneDeep(config).filter((node, index) => index !== src.index);
                        orderedNodes = [
                          ...orderedNodes.slice(0, dest.index),
                          moved,
                          ...orderedNodes.slice(dest.index),
                        ];

                        onNodeSort(orderedNodes);
                      }
                    }
                  >
                    <Droppable droppableId="droppable">
                      {(provided) => (
                        <div
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                        >
                          {config.map((node, key) =>
                            <Draggable key={key} draggableId={`${key}`} index={key}>
                              {(provided) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                >
                                  <Collapse
                                    className="nodes-config__node"
                                    key={key}
                                    activeKey={'expanded'}
                                    onChange={() => onNodeCollapsedChange(key, !node.isCollapsed)}
                                  >
                                    <Collapse.Panel
                                      key={node.isCollapsed ? 'collapsed' : 'expanded'}
                                      header={
                                        <Row justify="space-between" type="flex">
                                          <Col>
                                          <span {...provided.dragHandleProps}>
                                            <DragHandle/>
                                          </span>
                                            {
                                              node.isNewNode
                                                ? t('scenes.configuration.nodesConfig.newNodeCard.title')
                                                : (node.General && node.General.Name) || t('scenes.configuration.nodesConfig.noNameNodeCard.title')
                                            }
                                          </Col>
                                          <Col>
                                            <Button
                                              size="small"
                                              icon="delete"
                                              title={t("scenes.configuration.nodesConfig.buttons.removeNode.title")}
                                              style={{marginRight: 8}}
                                              onClick={
                                                event => {
                                                  Modal.confirm({
                                                    title: t("scenes.configuration.nodesConfig.modals.deleteConfirm.title"),
                                                    onOk() {
                                                      node.isNewNode
                                                        ? onNewNodeRemove(key)
                                                        : onNodeRemove(key, node.General.ID)
                                                    },
                                                    cancelText: t('commons.buttons.cancel.title')
                                                  });
                                                  event.stopPropagation();
                                                }
                                              }
                                            />
                                          </Col>
                                        </Row>
                                      }
                                    >
                                      <Node
                                        node={node}
                                        onChange={
                                          node => {
                                            let newConfig = _.cloneDeep(config);
                                            const customizer = (_, src) => {
                                              if (Array.isArray(src))
                                                return src;
                                              else {
                                                return undefined;
                                              }
                                            };
                                            _.mergeWith(newConfig[key], node, customizer);
                                            onChange(newConfig);
                                          }
                                        }
                                        index={key}
                                      />
                                      <Divider/>
                                      <Button
                                        disabled={
                                          !node.General.ID || !node.General.Name || !node.General.DefaultItemsViewMode ||
                                          node.Agencies.find(ag => !ag.Id || ag.Id.length === 0 || !isDictionaryValid(ag.Name)) !== undefined ||
                                          !node.Endpoint.NSIEndpoint || node.Endpoint.NSIEndpoint.length === 0 ||
                                          (node.Endpoint.NSIReadOnlyUsername && !node.Endpoint.NSIReadOnlyPassword) ||
                                          (!node.Endpoint.NSIReadOnlyUsername && node.Endpoint.NSIReadOnlyPassword) ||
                                          !node.Endpoint.NSIEndpointType ||
                                          !node.Endpoint.PingArtefact ||
                                          node.AnnotationTabs.Tabs.filter(at => !at.Name || !at.Annotations || at.Annotations.filter(a => !a.Name).length).length ||
                                          (
                                            node.Proxy.Enabled && (
                                              !node.Proxy.Address || !node.Proxy.Port ||
                                              ((node.Proxy.Username && !node.Proxy.Password) || (!node.Proxy.Username && node.Proxy.Password))
                                            )
                                          ) ||
                                          node.Search.ExcludeCodelists.filter(ex => !ex).length ||
                                          node.Search.ExcludeConceptSchemes.filter(ex => !ex).length ||
                                          !node.Annotations ||
                                          _(node.Annotations)
                                            .pickBy(val => (!val || val.length === 0))
                                            .keys()
                                            .value().length > 0
                                        }
                                        type="primary"
                                        onClick={
                                          () => {

                                            let duplicateAnnotationName;
                                            let annotationNames = [];

                                            node.AnnotationTabs.Tabs.forEach(({Annotations}) => {
                                              if (!duplicateAnnotationName) {

                                                Annotations.forEach(({Name}) => {
                                                  if (!duplicateAnnotationName) {

                                                    if (annotationNames.includes(Name)) {
                                                      duplicateAnnotationName = Name;
                                                    } else {
                                                      annotationNames.push(Name);
                                                    }

                                                  }
                                                });

                                              }
                                            });

                                            if (config.filter((otherNode, index) => index !== key && otherNode.General.ID === node.General.ID).length) {
                                              Modal.warning({
                                                title: t('scenes.configuration.nodesConfig.existsIdWarning.title'),
                                              })
                                            } else if (duplicateAnnotationName) {
                                              Modal.warning({
                                                title: t('scenes.configuration.nodesConfig.duplicateAnnotationNameWarning.title',
                                                  {name: duplicateAnnotationName})
                                              })
                                            } else if (
                                              (!node.Endpoint.MAEndpoint || node.Endpoint.MAEndpoint.length === 0) &&
                                              (!node.Endpoint.DMEndpoint || node.Endpoint.DMEndpoint.length === 0)
                                            ) {
                                              onNodeSubmit(node, null, null);
                                            } else {
                                              let modal = Modal.info();
                                              modal.update({
                                                icon: 'lock',
                                                title: t('scenes.configuration.nodesConfig.nodeCredentialsModal.title'),
                                                content:
                                                  <NodeCredentialsModal
                                                    t={t}
                                                    modal={modal}
                                                    onSubmit={(username, password) => onNodeSubmit(node, username, password)}
                                                  />,
                                                okButtonProps: {style: {display: 'none'}},
                                                keyboard: false
                                              });
                                            }
                                          }
                                        }
                                      >
                                        {t('commons.buttons.save.title')}
                                      </Button>
                                    </Collapse.Panel>
                                  </Collapse>
                                </div>
                              )}
                            </Draggable>
                          )}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </DragDropContext>
                </Fragment>
              )}
            </Call>
          )}
        </Call>
        <EnhancedModal
          visible={isMsdsVisible}
          onCancel={onMsdsHide}
          title={t('scenes.configuration.nodesConfig.modals.metadataSetList.title')}
          width={MODAL_WIDTH_LG}
          footer={<Button onClick={onMsdsHide}>{t('commons.buttons.close.title')}</Button>}
        >
          <Call cb={fetchMsds} disabled={!isMsdsVisible}>
            <ArtefactList
              artefacts={msds}
              onRowClick={artefact => onMsdSet(getUrnFromArtefact(artefact))}
            />
          </Call>
        </EnhancedModal>
      </Fragment>
    )
  }
}


export default compose(
  translate(),
  connect(mapStateToProps, mapDispatchToProps)
)(NodesConfig);
