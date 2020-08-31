import React, {Fragment} from 'react';
import {Button, Card, Col, Divider, Icon, Row, Tooltip, Tree as AntTree} from 'antd';

import {translate} from 'react-i18next';

import {
  COLOR_FONT_DISABLED,
  GUTTER_MD,
  GUTTER_SM,
  MARGIN_MD,
  MARGIN_SM,
  MARGIN_XS,
  SPAN_FULL,
  SPAN_ONE_QUARTER
} from '../../styles/constants';
import {connect} from 'react-redux';
import {getLocalizedStr} from '../../middlewares/i18n/utils';
import {compose} from 'redux';
import CustomEmpty from '../custom-empty';
import {DataLanguageConsumer} from "../../contexts/DataLanguage";
import uuidv4 from "uuid";
import {countNodes} from "../../utils/tree";
import "./style.css"
import _ from "lodash"
import AutoSearchInput from "../auto-search-input";

const $ = window.jQuery;

const IconFontCNIcon = Icon.createFromIconfontCN({
  scriptUrl: './static/vendor/iconfont_cn/iconfont.js',
});

const MAX_TREE_SIZE_FOR_DEFAULT_EXPANDED_TREE = 100;

class EnhancedTree extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      searchText: '',
      expandedKeys: null,
      uuidClassName: uuidv4(),
      showMoreKeyClicks: {},
      isPaginated: false,
      filteredTree: null,
      filteredTreeLength: null,
      scrollTop: null,
      selectedKeys: null
    };
    this.getKeys = this.getKeys.bind(this);
    this.getKey = this.getKey.bind(this);
    this.getTitle = this.getTitle.bind(this);
    this.getActions = this.getActions.bind(this);
    this.getFilteredTree = this.getFilteredTree.bind(this);
    this.getNode = this.getNode.bind(this);
    this.getShowMoreNode = this.getShowMoreNode.bind(this);
    this.removeDraggableFromShowMoreNodes = this.removeDraggableFromShowMoreNodes.bind(this);
    this.countVisibleNodes = this.countVisibleNodes.bind(this);
    this.addTitleToDisabledCheckbox = this.addTitleToDisabledCheckbox.bind(this);
    this.onSelect = this.onSelect.bind(this);
  }

  removeDraggableFromShowMoreNodes() {
    $('.tree__node__show-more .draggable').removeAttr("draggable");
  }

  addTitleToDisabledCheckbox() {
    if (this.props.disabledCheckboxTitle) {
      $(`.custom-tree__tree-container__${this.state.uuidClassName} .ant-tree-checkbox-disabled`).each((_, el) =>
        $(el).attr('title', this.props.disabledCheckboxTitle)
      );
    }
  }

  componentDidMount() {

    const filteredTree = this.getFilteredTree(this.state.searchText);

    this.setState({
      filteredTree,
      filteredTreeLength: this.countVisibleNodes(filteredTree),
      isPaginated: this.props.noPagination ? false : this.countVisibleNodes(this.props.tree) >= this.props.minTreeNodesForPagination,
      expandedKeys: null,
      selectedKeys: this.props.selectedKeys
    });

    this.removeDraggableFromShowMoreNodes();
    this.addTitleToDisabledCheckbox();
  }

  componentDidUpdate(prevProps) {

    const {
      expandSelectedOnTreeChange,
      defaultSelectedKeys
    } = this.props;

    const {
      uuidClassName,
      scrollTop,
      filteredTree,
      selectedKeys,
      expandedKeys
    } = this.state;

    let newExpandedKeys = expandedKeys;

    if (this.state.expandedKeys === null && this.props.tree !== null && !this.props.defaultCollapsed) {
      const treeKeys = this.getKeys(this.props.tree);
      newExpandedKeys = treeKeys.length > MAX_TREE_SIZE_FOR_DEFAULT_EXPANDED_TREE ? [] : treeKeys;
    }

    if (scrollTop !== null && filteredTree !== null) {
      this.setState({
        scrollTop: null
      });
      $(`.custom-tree__tree-container__${uuidClassName}`).scrollTop(scrollTop);
    }

    if (prevProps.selectedKeys !== this.props.selectedKeys) {
      this.setState({
        selectedKeys: this.props.selectedKeys
      });
    }

    if (prevProps.tree !== this.props.tree) {

      const filteredTree = this.getFilteredTree(this.state.searchText);

      if (scrollTop === null) {
        this.setState({
          scrollTop: $(`.custom-tree__tree-container__${uuidClassName}`).scrollTop()
        });
      }

      if (expandSelectedOnTreeChange === true) {
        newExpandedKeys = _.uniq((newExpandedKeys || []).concat(this.props.selectedKeys || selectedKeys || []).concat(defaultSelectedKeys || []))
      }

      this.setState({
        filteredTree,
        filteredTreeLength: this.countVisibleNodes(filteredTree),
        isPaginated: this.props.noPagination ? false : this.countVisibleNodes(this.props.tree) >= this.props.minTreeNodesForPagination
      });
    }

    if (newExpandedKeys !== expandedKeys) {
      this.setState({
        expandedKeys: newExpandedKeys
      });
    }

    this.removeDraggableFromShowMoreNodes();
    this.addTitleToDisabledCheckbox();
  }

  countVisibleNodes(tree) {
    return countNodes(tree, this.props.childrenKey, node =>
      this.props.hiddenKeys
        ? !this.props.hiddenKeys.includes(this.getKey(node))
        : true
    );
  }

  getKey(node) {
    return this.props.getNodeKey !== undefined
      ? this.props.getNodeKey(node)
      : (
        node[this.props.childrenKey]
          ? (node[this.props.catIdKey] || node[this.props.catNameKey])
          : (node[this.props.idKey] || node[this.props.nameKey])
      );
  }

  getTitle(node, preferredLanguage) {

    const {
      idKey,
      nameKey,
      catIdKey,
      catNameKey,
      hiddenIdKeys,
      unallowedIdKeys,
      dataLanguages,
      childrenKey,
      isNameMultilanguage,
      getNodeTextColor,
      getCatId
    } = this.props;

    return (
      <span
        style={
          (unallowedIdKeys && unallowedIdKeys.indexOf(this.getKey(node))) >= 0
            ? {color: COLOR_FONT_DISABLED}
            : (
              getNodeTextColor
                ? {color: getNodeTextColor(node)}
                : null
            )
        }
      >
      {
        ((hiddenIdKeys && hiddenIdKeys.indexOf(this.getKey(node)) >= 0)
          ? ''
          : (getCatId && node[childrenKey])
            ? `[${getCatId(node)}] `
            : `[${node[node[childrenKey] ? catIdKey : idKey]}] `) +
        (isNameMultilanguage === false
          ? node[node[childrenKey] ? catNameKey : nameKey]
          : getLocalizedStr(node[node[childrenKey] ? catNameKey : nameKey], preferredLanguage, dataLanguages))
      }
      </span>
    );
  }

  getActions(node) {

    if (this.props.nodeActions) {

      const actions =
        this.props.nodeActions
          .filter(act => act)
          .map(act => typeof (act) === "function" ? act(node) : act)
          .filter(act => act);

      return (
        <Fragment>
          {actions.map((action, key) =>
            <Button
              key={key}
              {...action}
              type="primary"
              shape="circle"
              size="small"
              onClick={e => {
                e.stopPropagation();
                action.onClick(node)
              }}
              style={{
                marginLeft: MARGIN_XS,
                transform: 'scale(0.8)'
              }}
            />
          )}
        </Fragment>
      );
    } else {
      return null
    }
  }

  getKeys(tree) {

    const childrenKey = this.props.childrenKey;

    const res = [];

    const recursive = subTree =>
      subTree
        ? subTree.map(node => {
          if (node[childrenKey] && node[childrenKey].length) {
            recursive(node[childrenKey]);
          }
          res.push(this.getKey(node));
          return null;
        })
        : [];

    recursive(tree);

    return res;
  }

  getFilteredTree(searchText) {

    const childrenKey = this.props.childrenKey;
    const filterNode = this.props.getFilter(searchText);
    const hiddenKeys = this.props.hiddenKeys;

    const recursive = subtree =>
      subtree
        ? ([
          ...subtree
            .map(node => ({...node}))
            .filter(node => {
              if (node[childrenKey] && node[childrenKey].length) {
                if ((!hiddenKeys || !hiddenKeys.includes(this.getKey(node))) && filterNode(node)) {
                  return true;
                } else {
                  const filteredChildren = [...recursive(node[childrenKey], filterNode)];
                  if (filteredChildren.length) {
                    node[childrenKey] = filteredChildren;
                    return !hiddenKeys || !hiddenKeys.includes(this.getKey(node));
                  } else {
                    return false;
                  }
                }
              } else {
                return (!hiddenKeys || !hiddenKeys.includes(this.getKey(node))) && filterNode(node);
              }
            })
        ])
        : null;

    return recursive(this.props.tree, filterNode);
  }

  getShowMoreNode(parent) {

    const key = `${parent ? this.getKey(parent) : 'root'}`;

    const remaining = (parent
        ? parent[this.props.childrenKey]
        : this.state.filteredTree.filter(node => node != null)
    ).length - ((this.state.showMoreKeyClicks[key] || 0) + 1) * this.props.treePageSize;

    return (
      <AntTree.TreeNode
        key={`${key}_showMore`}
        className="tree__node tree__node__show-more"
        title={
          <i
            onClick={
              e => {
                e.stopPropagation();
                if (this.props.onShowMoreForbidden &&
                  $(".tree__node:not(.tree__node__show-more)").length >= this.props.maxTreeNodesForPagination
                ) {
                  this.props.onShowMoreForbidden()
                } else {
                  this.setState({
                    showMoreKeyClicks: {
                      ...this.state.showMoreKeyClicks,
                      [key]:
                        this.state.showMoreKeyClicks[key]
                          ? this.state.showMoreKeyClicks[key] + 1
                          : 1
                    }
                  })
                }
              }
            }
          >
            {
              this.props.t('components.tree.showMore', {
                pageSize: Math.min(remaining, this.props.treePageSize),
                remaining
              })
            }
          </i>
        }
        selectable={false}
        disableCheckbox
      />
    );
  }

  getNode(node, isRoot, preferredLanguage) {
    const key = this.getKey(node);
    const isVisible =
      this.props.hiddenKeys
        ? this.props.hiddenKeys.indexOf(key) < 0
        : true;
    const isSelectable =
      this.props.unselectableKeys
        ? this.props.unselectableKeys.indexOf(key) < 0
        : true;
    const isCheckable =
      this.props.getNodeIsCheckable
        ? this.props.getNodeIsCheckable(node)
        : true;

    const {
      childrenKey,
      treePageSize,
      isRootIconLikeChildrenIcon,
      isEmptyCategoryIconLikeLeafIcon,
      icon,
      getIconColor,
      isCustomIcon,
      getIcon
    } = this.props;

    let nodeTitle =
      this.props.rightClickActions && this.props.rightClickActions.filter(action => action(node) !== null).length > 0
        ? (
          <Tooltip
            placement="right"
            title={
              <Row gutter={GUTTER_SM} type="flex">
                {this.props.rightClickActions
                  .map(action => action(node))
                  .filter(action => action !== null)
                  .map((action, index) =>
                    <Col key={index}>
                      <Button
                        {...action}
                        onClick={e => {
                          e.preventDefault();
                          e.stopPropagation();
                          action.onClick(node)
                        }}
                        size="small"
                        shape="circle"
                        type="primary"
                      />
                    </Col>
                  )}
              </Row>
            }
            trigger="contextMenu"
            getPopupContainer={() => $(`.custom-tree__tree-container__${this.state.uuidClassName}`)[0]}
          >
            {this.getTitle(node, preferredLanguage)}
            {this.getActions(node)}
          </Tooltip>
        )
        : (
          <span onContextMenu={e => e.preventDefault()}>
            {this.getTitle(node, preferredLanguage)}
            {this.getActions(node)}
          </span>
        );

    return (
      isVisible
        ? (
          <AntTree.TreeNode
            title={nodeTitle}
            className="tree__node"
            key={key}
            data-node={node}
            icon={({expanded}) => {

              const getIconResult = getIcon ? getIcon(node, expanded, isRoot) : null;

              if (getIconResult !== null) {

                return getIconResult;

              } else {

                if (isRoot && !isRootIconLikeChildrenIcon) {

                  return <IconFontCNIcon type="database"/>;

                } else if (node[childrenKey] && (node[childrenKey].length || !isEmptyCategoryIconLikeLeafIcon)) {

                  return (
                    <Icon
                      theme="filled"
                      style={{color: '#f7c427'}}
                      type={node[childrenKey].length && expanded ? 'folder-open' : 'folder'}
                    />
                  );

                } else {

                  const IconComponent = isCustomIcon ? IconFontCNIcon : Icon;

                  return (
                    <IconComponent
                      type={icon}
                      theme={getIconColor ? "filled" : null}
                      style={getIconColor ? {color: getIconColor(node)} : null}
                    />
                  );
                }
              }
            }}
            selectable={isSelectable}
            disableCheckbox={!isCheckable}
          >
            {node[childrenKey]
              ? node[childrenKey]
                .filter((child, index) =>
                  !this.state.isPaginated || index < treePageSize * ((this.state.showMoreKeyClicks[key] || 0) + 1)
                )
                .map(child => this.getNode(child, false, preferredLanguage))
                .concat(
                  this.state.isPaginated
                  && node[childrenKey].length > treePageSize * ((this.state.showMoreKeyClicks[key] || 0) + 1)
                    ? [this.getShowMoreNode(node)]
                    : []
                )
              : ''
            }
          </AntTree.TreeNode>
        )
        : (isRoot ? null : '')
    );
  };

  onSelect(...params) {

    const {
      onSelect,
      externalControlledSelectedKeys
    } = this.props;

    if (!externalControlledSelectedKeys) {
      this.setState({
        selectedKeys: params[0]
      });
    }

    if (onSelect) {
      onSelect(params[0]);
    }
  }

  render() {

    const {
      t,
      tree,
      treePrefix,
      actions,
      treeActions,
      onSelect,
      multiple,
      checkable,
      checkStrictly,
      checkedKeys,
      onCheck,
      getFilter,
      defaultSelectedKeys,
      draggable,
      onDrop,
      appLanguage,
      treePageSize,
      leftActions,
      rightActions,
      placeholder,
      searchBarSpan = SPAN_ONE_QUARTER,
      isTreeVisible,
      maxNodeForExpandAll
    } = this.props;

    const {
      expandedKeys,
      searchText,
      uuidClassName,
      filteredTree,
      isPaginated,
      filteredTreeLength,
      selectedKeys
    } = this.state;

    const keys = this.getKeys(tree);
    const filteredTreeKeys = this.getKeys(filteredTree);

    const visibleNodesCount = this.countVisibleNodes(filteredTree);

    return (
      <DataLanguageConsumer>
        {dataLanguage => {
          const antTreeChildren =
            filteredTree !== null
              ? filteredTree
                .filter((topLevelNode, index) =>
                  !isPaginated || index < treePageSize * ((this.state.showMoreKeyClicks['root'] || 0) + 1)
                )
                .map(topLevelNode => this.getNode(topLevelNode, true, dataLanguage || appLanguage))
                .filter(node => node !== null)
                .concat(
                  isPaginated && filteredTree.length > treePageSize * ((this.state.showMoreKeyClicks['root'] || 0) + 1)
                    ? [this.getShowMoreNode()]
                    : []
                )
              : null;

          return (
            <Fragment>
              <Row type="flex" gutter={GUTTER_MD} style={{marginBottom: MARGIN_MD}}>
                <Col span={searchBarSpan}>
                  <AutoSearchInput
                    placeholder={t('components.tree.searchInput.placeholder')}
                    onSearch={
                      searchText => {
                        const filteredTree = this.getFilteredTree(searchText);
                        this.setState({
                          searchText,
                          expandedKeys: searchText ? filteredTreeKeys : keys,
                          filteredTree,
                          filteredTreeLength: this.countVisibleNodes(filteredTree),
                        })
                      }
                    }
                  />
                </Col>
                <Col span={SPAN_FULL - searchBarSpan}>
                  <Row gutter={GUTTER_MD} type="flex" justify="space-between">
                    <Col>
                      {leftActions ? leftActions : null}
                    </Col>
                    <Col>
                      <Row gutter={GUTTER_MD} type="flex" justify="end">
                        {rightActions && (
                          <Col>
                            {rightActions}
                          </Col>
                        )}
                        {actions && actions.filter(action => action !== null).length > 0 && (
                          <Col>
                            <Row gutter={GUTTER_SM} type="flex">
                              {actions.filter(action => action !== null).map((action, index) =>
                                <Col key={index}>
                                  <Button {...action}/>
                                </Col>)}
                            </Row>
                          </Col>
                        )}
                        {treeActions && treeActions.filter(action => action !== null).length > 0 && (
                          <Col>
                            <Row gutter={GUTTER_SM} type="flex">
                              {treeActions.filter(action => action !== null).map((action, index) =>
                                <Col key={index}>
                                  <Button {...action}/>
                                </Col>)}
                            </Row>
                          </Col>
                        )}
                        <Col>
                          <Row gutter={GUTTER_SM} type="flex">
                            <Col>
                              <Button
                                onClick={() => this.setState({expandedKeys: [], showMoreKeyClicks: {}})}
                                title={t('components.tree.actions.collapseAll')}
                                icon="folder"
                              />
                            </Col>
                            <Col>
                              <Button
                                onClick={() => this.setState({expandedKeys: keys})}
                                title={t('components.tree.actions.expandAll')}
                                icon="folder-open"
                                disabled={visibleNodesCount > maxNodeForExpandAll}
                              />
                            </Col>
                          </Row>
                        </Col>
                      </Row>
                    </Col>
                  </Row>
                </Col>
              </Row>
              <Card
                type="inner"
                style={{overflow: 'auto'}}
                className={`custom-tree__tree-container custom-tree__tree-container__${uuidClassName}`}
              >
                {(antTreeChildren && antTreeChildren.length > 0 && isTreeVisible !== false)
                  ? (
                    <Fragment>
                      {treePrefix && (
                        <Fragment>
                          <AntTree
                            checkable={checkable}
                            checkStrictly={checkStrictly}
                            checkedKeys={checkedKeys}
                            onCheck={onCheck}
                            multiple={multiple}
                            onSelect={onSelect}
                            draggable={draggable}
                            onDrop={onDrop}
                            defaultExpandAll
                          >
                            {treePrefix.map(node => this.getNode(node, true, dataLanguage || appLanguage))}
                          </AntTree>
                          <Divider style={{marginTop: MARGIN_SM, marginBottom: MARGIN_SM}}/>
                        </Fragment>
                      )}
                      <AntTree
                        showIcon
                        filterTreeNode={
                          searchText
                            ? TreeNode =>
                              TreeNode.props['data-node']
                                ? getFilter(searchText)(TreeNode.props['data-node'])
                                : true
                            : null
                        }
                        checkable={checkable}
                        checkStrictly={checkStrictly}
                        checkedKeys={checkedKeys}
                        onCheck={onCheck}
                        multiple={multiple}
                        onSelect={this.onSelect}
                        selectedKeys={selectedKeys !== null && selectedKeys !== undefined
                          ? selectedKeys
                          : defaultSelectedKeys !== null && defaultSelectedKeys !== undefined
                            ? defaultSelectedKeys
                            : []
                        }
                        expandedKeys={expandedKeys}
                        onExpand={expandedKeys => this.setState({expandedKeys})}
                        draggable={draggable}
                        onDrop={onDrop}
                      >
                        {antTreeChildren}
                      </AntTree>
                    </Fragment>
                  )
                  : <CustomEmpty text={placeholder}/>
                }
              </Card>
              {filteredTreeLength > 0 && (
                <Row type="flex" justify="end" style={{marginTop: MARGIN_SM}}>
                  <Col>
                    {t('components.tree.count', {count: this.state.filteredTreeLength})}
                  </Col>
                </Row>
              )}
            </Fragment>
          )
        }}
      </DataLanguageConsumer>
    );
  }
}

export default compose(
  connect(
    state => ({
      appLanguage: state.app.language,
      dataLanguages: state.config.dataManagement.dataLanguages,
      minTreeNodesForPagination: state.config.userInterface.minTreeNodesForPagination,
      maxTreeNodesForPagination: state.config.userInterface.maxTreeNodesForPagination,
      maxNodeForExpandAll: state.config.userInterface.maxNodeForExpandAll,
      treePageSize: state.config.userInterface.treePageSize
    })
  ),
  translate()
)(EnhancedTree);
