import React from 'react';
import {Breadcrumb, Button, Card, Checkbox, Col, Empty, List, Row} from "antd";
import {FixedSizeList} from 'react-window';
import {GUTTER_MD, GUTTER_SM, GUTTER_XS, MARGIN_SM, PADDING_MD, PADDING_SM, PADDING_XS} from "../../styles/constants";
import {translate} from 'react-i18next';
import './style.css';
import _ from "lodash";
import CustomEmpty from "../custom-empty";

const $ = window.jQuery;

class FileSystemTree extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      currentPath: [],
      backStack: [],
      forwardStack: []
    };

    this.navigate = this.navigate.bind(this);
    this.goBack = this.goBack.bind(this);
    this.goForward = this.goForward.bind(this);
    this.onSelect = this.onSelect.bind(this);
  }

  navigate(newPath) {

    const state = _.cloneDeep(this.state);

    state.backStack.push(state.currentPath);
    state.forwardStack = [];
    state.currentPath = newPath;

    this.setState(state);
    this.onSelect(null);

    $('.file-system-tree__list').scrollTop(0);
  }

  goBack() {

    const state = _.cloneDeep(this.state);

    state.forwardStack.push(state.currentPath);
    state.currentPath = state.backStack.pop();
    this.onSelect(null);

    this.setState(state);
  }

  goForward() {

    const state = _.cloneDeep(this.state);

    state.backStack.push(state.currentPath);
    state.currentPath = state.forwardStack.pop();
    this.onSelect(null);

    this.setState(state);
  }

  onSelect(key) {
    if (this.props.onSelect) {
      if (!(key === null && this.props.selected === null)) {
        this.props.onSelect(this.props.selected !== key ? key : null);
      }
    }
  }

  render() {

    const {
      height,
      getItemKey,
      getItemIcon,
      getItemLabel,
      getItemLabelForPath,
      getItemIsLeaf,
      getItems,
      itemActions,
      fixedItemActions,
      actions,
      treeActions,
      selected,
      t
    } = this.props;

    const {
      currentPath,
      backStack,
      forwardStack,
    } = this.state;

    const items = getItems(currentPath.length ? currentPath[currentPath.length - 1].key : null);

    const itemStyle = {
      borderRadius: 2,
      paddingLeft: PADDING_XS,
      paddingRight: PADDING_XS,
    };

    const Item = ({index, style}) => {

      if (index !== undefined) {

        const isItemLeaf = getItemIsLeaf(items[index]);

        const itemLabel = getItemLabel(items[index]);

        const isItemSelected = getItemKey(items[index]) === selected;

        return (
          <List.Item style={style} className="file-system-tree__item">
            <div
              style={{
                marginLeft: GUTTER_SM / 2,
                marginRight: GUTTER_SM / 2,
                width: '100%'
              }}
            >
              <Row
                type="flex"
                justify="space-between"
                onClick={
                  isItemLeaf
                    ? null
                    : () =>
                      this.navigate([
                        ...currentPath,
                        {
                          key: getItemKey(items[index]),
                          label: getItemLabelForPath(items[index])
                        }
                      ])
                }
                style={{
                  ...itemStyle,
                  cursor: isItemLeaf ? 'default' : 'pointer'
                }}
              >
                <Col>
                  <Row type="flex" gutter={GUTTER_SM}>
                    <Col>
                      <Checkbox
                        checked={isItemSelected}
                        onClick={e => {
                          this.onSelect(getItemKey(items[index]));
                          e.stopPropagation();
                        }}
                      />
                    </Col>
                    {getItemIcon && (
                      <Col>
                        <div style={{paddingTop: 2}}>
                          {getItemIcon(items[index])}
                        </div>
                      </Col>
                    )}
                    <Col>
                      <div title={itemLabel}>
                        {itemLabel.length > 80
                          ? itemLabel.substr(0, 80) + '...'
                          : itemLabel
                        }
                      </div>
                    </Col>
                    <Col>
                      <Row type="flex" gutter={GUTTER_SM}>
                        {(fixedItemActions || [])
                          .filter(fixedAction => fixedAction)
                          .map(fixedAction =>
                            typeof (fixedAction) === "function"
                              ? fixedAction(items[index])
                              : fixedAction
                          )
                          .filter(action => action)
                          .map((action, key) =>
                            <Col key={key}>
                              <Button
                                {...action}
                                onClick={e => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  action.onClick(items[index])
                                }}
                                size="small"
                                shape="circle"
                                type="primary"
                              />
                            </Col>
                          )}
                      </Row>
                    </Col>
                  </Row>
                </Col>
                <Col>
                  <div className={"file-system-tree__item__actions"} style={{display: "inline-block"}}>
                    <Row type="flex" gutter={GUTTER_SM}>
                      {(itemActions || [])
                        .filter(action => action)
                        .map(action =>
                          typeof (action) === "function"
                            ? action(items[index])
                            : action
                        )
                        .filter(action => action)
                        .map((action, key) =>
                          <Col key={key}>
                            <Button
                              {...action}
                              onClick={e => {
                                e.preventDefault();
                                e.stopPropagation();
                                action.onClick(items[index])
                              }}
                              size="small"
                              shape="circle"
                              type="primary"
                            />
                          </Col>
                        )}
                    </Row>
                  </div>
                </Col>
              </Row>
            </div>
          </List.Item>
        );

      } else {

        return null;
      }
    };

    return (
      <div className="noselect">
        <Row type="flex" justify="space-between" style={{marginBottom: MARGIN_SM}}>
          <Col>
            <Row type="flex" gutter={GUTTER_MD}>
              <Col>
                <Row type="flex" gutter={GUTTER_XS}>
                  <Col>
                    <Button
                      icon="left"
                      title={t("commons.buttons.goBack.title")}
                      disabled={!backStack.length}
                      onClick={this.goBack}
                    />
                  </Col>
                  <Col>
                    <Button
                      icon="right"
                      title={t("commons.buttons.goForward.title")}
                      disabled={!forwardStack.length}
                      onClick={this.goForward}
                    />
                  </Col>
                </Row>
              </Col>
              <Col>
                <Row type="flex" gutter={GUTTER_SM}>
                  {(treeActions || [])
                    .filter(action => action)
                    .map((action, key) =>
                      <Col key={key}>
                        <Button
                          {...action}
                          onClick={e => {
                            e.preventDefault();
                            e.stopPropagation();
                            action.onClick()
                          }}
                          type="primary"
                        />
                      </Col>
                    )}
                </Row>
              </Col>
            </Row>
          </Col>
          <Col>
            <Row type="flex" gutter={GUTTER_SM}>
              {(actions || [])
                .filter(action => action)
                .map((action, key) =>
                  <Col key={key}>
                    <Button
                      {...action}
                      onClick={e => {
                        e.preventDefault();
                        e.stopPropagation();
                        action.onClick()
                      }}
                    />
                  </Col>
                )}
            </Row>
          </Col>
        </Row>
        <Card
          style={{marginBottom: MARGIN_SM}}
          bodyStyle={{
            padding: 0,
            height
          }}
        >
          {!items && (
            <Empty
              image={<span/>}
              description={t('components.fileSystemTree.placeholder.unknownItem')}
            />
          )}
          {items && items.length === 0 && (
            <CustomEmpty/>
          )}
          {items && items.length > 0 && (
            <FixedSizeList
              className="file-system-tree__list"
              itemCount={items.length}
              itemSize={32}
              height={height}
            >
              {Item}
            </FixedSizeList>
          )}
        </Card>
        <Card
          bodyStyle={{
            paddingLeft: PADDING_MD,
            paddingRight: PADDING_MD,
            paddingTop: PADDING_SM,
            paddingBottom: PADDING_SM
          }}
        >
          <div className="file-system-tree__breadcrumb">
            <Breadcrumb separator=">">
              <Breadcrumb.Item
                className="file-system-tree__item"
                onClick={currentPath.length > 0 ? () => this.navigate([]) : null}
                style={{
                  ...itemStyle,
                  cursor: currentPath.length > 0 ? 'pointer' : 'default'
                }}
              >
                {t('components.fileSystemTree.breadcrumb.rootItem.label')}
              </Breadcrumb.Item>
              {currentPath.map(({label}, index) =>
                <Breadcrumb.Item
                  className="file-system-tree__item"
                  onClick={index < currentPath.length ? () => this.navigate(currentPath.slice(0, index + 1)) : null}
                  key={index}
                  style={{
                    ...itemStyle,
                    cursor: index < currentPath.length - 1 ? 'pointer' : 'default'
                  }}
                >
                  {label}
                </Breadcrumb.Item>
              )}
            </Breadcrumb>
          </div>
        </Card>
      </div>
    );
  }
}

export default translate()(FileSystemTree);

