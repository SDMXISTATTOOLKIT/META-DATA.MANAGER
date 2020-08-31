import React from 'react';
import {Alert, Card, Col, Modal, Radio, Row, Tabs} from "antd";
import {getNormalizedColumnName} from "../../utils/normalizers";
import Call from "../../hocs/call";
import {FILTER_MODE_IN, FILTER_MODE_NOT_IN, getArtefactTripletFromString} from "../../utils/sdmxJson";
import {connect} from "react-redux";
import {DataLanguageConsumer} from "../../contexts/DataLanguage";
import {compose} from "redux";
import {translate} from 'react-i18next';
import _ from "lodash";
import EnhancedTree from "../enhanced-tree";
import {getLocalizedStr} from "../../middlewares/i18n/utils";
import {getTreeFilterStrFromObj, TREE_NODE_KEY_PREFIX} from "./utils";
import {BUTTON_CHECK_ALL_CHILDS} from "../../styles/buttons";
import {getNodes, getNodesAtDepth} from "../../utils/tree";
import {addSpinnerAction, completeSpinnerAction} from "../../middlewares/spinner/actions";
import {showQueryFormSpinner} from "./actions";
import CustomEmpty from "../custom-empty";

const mapStateToProps = state => ({
  endpointId: state.app.endpointId,
  nodes: state.config.nodes,
  appLanguage: state.app.language,
  maxTreeNodes: state.config.userInterface.maxTreeNodes,
  dataLanguages: state.config.dataManagement.dataLanguages
});

const mapDispatchToProps = dispatch => ({
  showSpinner: uuid => dispatch(addSpinnerAction(showQueryFormSpinner(), uuid)),
  hideSpinner: uuid => dispatch(completeSpinnerAction(showQueryFormSpinner(), uuid))
});

const TREE_NODE_KEY_ALL = TREE_NODE_KEY_PREFIX + 'ALL';
const TREE_NODE_KEY_OF_LEVEL_PREFIX = TREE_NODE_KEY_PREFIX + 'OF_LEVEL_';
const TREE_FILTER_MAX_LENGTH = 6400;

class TreeFilter extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      currentTab: "0"
    }
  };

  render() {

    const {
      t,
      nodes,
      appLanguage,
      dataLanguages,
      endpointId,
      maxTreeNodes,
      fetchColumnCodelistCount,
      fetchColumnCodelistTree,
      fetchColumnFilteredValues,
      columns,
      treeFilter,
      onColumnModeChange,
      onColumnValuesChange,
      showSpinner,
      hideSpinner,
      disabled,
      hideInclusionRadio,
      isCC
    } = this.props;
    const itemsOrderAnnotationType =
      _.find(nodes, node => node.general.id === endpointId).annotations.codelistsOrder;

    const callOnColumnValuesChangeWithSpinner = (colName, values) => {
      showSpinner();
      window.setTimeout(() => {
        hideSpinner();
        onColumnValuesChange(colName, values);
      }, 0);
    };

    const callOnColumnModeChangeWithSpinner = (colName, mode) => {
      showSpinner();
      window.setTimeout(() => {
        hideSpinner();
        onColumnModeChange(colName, mode);
      }, 0);
    };

    return (
      <DataLanguageConsumer>
        {dataLanguage =>
          (columns !== null && columns.filter(({CodelistCode}) => CodelistCode).length > 0)
            ? (
              <Tabs onChange={key => this.setState({currentTab: key})}>
                {(columns || [])
                  .filter(({CodelistCode}) => CodelistCode !== undefined)
                  .filter(({name}) => !isCC || getNormalizedColumnName(name) !== "TID")
                  .map((column, index) =>
                    <Tabs.TabPane
                      tab={<span title={column.name}>{getNormalizedColumnName(column.name)}</span>}
                      key={index}
                    >
                      <Call
                        cb={fetchColumnCodelistCount}
                        cbParam={{
                          codelistTriplet: column.CodelistCode !== null ? getArtefactTripletFromString(column.CodelistCode) : null,
                          language: dataLanguage || appLanguage
                        }}
                        disabled={column.CodelistCode === null || column.codelistCount !== null}
                      >
                        {column.codelistCount !== null && column.codelistCount > maxTreeNodes
                          ? (
                            <Alert
                              type="warning"
                              showIcon
                              message={t('components.treeFilter.warnings.codelistTooBig.title')}
                            />
                          )
                          : (
                            <Call
                              cb={fetchColumnCodelistTree}
                              cbParam={{
                                codelistTriplet: column.CodelistCode === null || getArtefactTripletFromString(column.CodelistCode),
                                language: dataLanguage || appLanguage,
                                itemsOrderAnnotationType
                              }}
                              disabled={column.CodelistCode === null || column.codelistCount === null || column.codelistTree !== null}
                            >
                              <Call
                                cb={fetchColumnFilteredValues}
                                cbParam={{
                                  colNames: columns.map(({name}) => name).splice(0, index + 1),
                                  filterStr: getTreeFilterStrFromObj(treeFilter, columns.slice(0, index).map(({name}) => name))
                                }}
                                disabled={
                                  fetchColumnFilteredValues === null ||
                                  (column.CodelistCode !== null && (column.codelistTree === null || column.filteredCodelistTree !== null)) ||
                                  (column.CodelistCode === null && column.filteredValues === null) ||
                                  this.state.currentTab !== String(index)
                                }
                              >
                                {(() => {
                                    const levelNodesKeys =
                                      [...Array(column.filteredCodelistTreeMaxDepth)]
                                        .map((_, index) => TREE_NODE_KEY_OF_LEVEL_PREFIX + index);
                                    return (
                                      <EnhancedTree
                                        treePrefix={
                                          column.filteredValues && (
                                            (column.filteredCodelistTree && column.filteredCodelistTree.length > 0) ||
                                            column.filteredValues.length > 0
                                          )
                                            ? [
                                              (() => {
                                                const obj = {
                                                  id: TREE_NODE_KEY_OF_LEVEL_PREFIX + 0,
                                                  name: {
                                                    en: t('components.treeFilter.levelNode', {level: 0})
                                                  },
                                                  level: 0,
                                                };
                                                if (column.filteredCodelistTreeMaxDepth !== null && column.filteredCodelistTreeMaxDepth !== 0) {
                                                  [...Array(column.filteredCodelistTreeMaxDepth - 1)]
                                                    .forEach(() => {
                                                      let pointer = obj;
                                                      let counter = 0;
                                                      while (pointer.codes) {
                                                        pointer = pointer.codes[0];
                                                        counter++;
                                                      }
                                                      pointer.codes = [
                                                        {
                                                          id: TREE_NODE_KEY_OF_LEVEL_PREFIX + Number(counter + 1),
                                                          name: {
                                                            en: t('components.treeFilter.levelNode', {level: counter + 1})
                                                          },
                                                          level: counter + 1
                                                        }
                                                      ]
                                                    });
                                                }
                                                return obj;
                                              })()
                                            ]
                                            : null
                                        }
                                        tree={
                                          column.filteredValues
                                            ? (
                                              column.filteredCodelistTree ||
                                              column.filteredValues
                                                .filter(val => val !== null)
                                                .map(val => ({
                                                  id: val,
                                                  name: val
                                                }))
                                            )
                                            : null
                                        }
                                        getNodeKey={({id}) => id}
                                        childrenKey="codes"
                                        idKey="id"
                                        nameKey="name"
                                        catIdKey="id"
                                        catNameKey="name"
                                        icon="file-text"
                                        hiddenIdKeys={[
                                          TREE_NODE_KEY_ALL,
                                          ...levelNodesKeys
                                        ]}
                                        isRootIconLikeChildrenIcon
                                        isEmptyCategoryIconLikeLeafIcon
                                        placeholder={
                                          (
                                            (
                                              column.filteredCodelistTree && column.filteredValues &&
                                              column.filteredCodelistTree.length === 0
                                            ) ||
                                            (column.filteredValues && column.filteredValues.length === 0)
                                          )
                                            ? t("components.treeFilter.noValuesPlaceholder")
                                            : ((
                                                column.filteredCodelistTree === null && column.filteredValues &&
                                                column.filteredValues.filter(val => val !== null).length === 0
                                              )
                                              ? t("components.treeFilter.noValuesInColumnPlaceholder")
                                              : null
                                            )
                                        }
                                        getFilter={
                                          searchText =>
                                            ({id, name}) => {
                                              const search = searchText.toLowerCase();
                                              return (id && id.toLowerCase()
                                                  .indexOf(search) >= 0) ||
                                                getLocalizedStr(name, dataLanguage || appLanguage, dataLanguages)
                                                  .toLowerCase()
                                                  .indexOf(search) >= 0;
                                            }
                                        }
                                        checkable
                                        checkStrictly
                                        onCheck={({checked}, {node, checked: isChecked}) => {

                                          const callOnColumnValuesChange = () => {
                                            let newChecked = [];

                                            if (node.props.eventKey === TREE_NODE_KEY_ALL) {
                                              if (isChecked) {
                                                newChecked = [
                                                  TREE_NODE_KEY_ALL,
                                                  ...levelNodesKeys,
                                                  ...getNodes(column.filteredCodelistTree, "codes", () => true)
                                                    .map(({id}) => id)
                                                ];
                                              } else {
                                                newChecked = [];
                                              }
                                            } else if (levelNodesKeys.includes(node.props.eventKey)) {
                                              const level = Number(node.props.eventKey.replace(TREE_NODE_KEY_OF_LEVEL_PREFIX, ""));

                                              const keysAtDepth = getNodesAtDepth(
                                                column.CodelistCode
                                                  ? column.filteredCodelistTree
                                                  : column.filteredValues.map(val => ({
                                                    id: val,
                                                    name: val
                                                  })),
                                                "codes",
                                                level + 1)
                                                .map(({id}) => id);

                                              if (isChecked) {
                                                newChecked = _.uniq([
                                                  TREE_NODE_KEY_OF_LEVEL_PREFIX + level,
                                                  ...checked,
                                                  ...keysAtDepth
                                                ]);
                                              } else {
                                                newChecked = checked.filter(key => !keysAtDepth.includes(key));
                                              }
                                            } else {
                                              newChecked = checked.filter(key => !key.startsWith(TREE_NODE_KEY_PREFIX));
                                            }

                                            const newTreeFilter = _.cloneDeep(treeFilter);

                                            const columnName = !isCC ? column.name : getNormalizedColumnName(column.name);

                                            newTreeFilter[columnName] = {
                                              mode: newTreeFilter[columnName] && newTreeFilter[columnName].mode
                                                ? newTreeFilter[columnName].mode
                                                : FILTER_MODE_IN,
                                              values: newChecked
                                            };

                                            const colNames = columns.map(({name}) =>
                                              !isCC ? name : getNormalizedColumnName(name));
                                            const colIndex = colNames.indexOf(columnName);
                                            const subsequentColNames = colNames.splice(colIndex + 1);

                                            // delete filters for subsequent cols
                                            subsequentColNames.forEach(name => {
                                              delete newTreeFilter[!isCC ? name : getNormalizedColumnName(name)];
                                            });

                                            if (getTreeFilterStrFromObj(newTreeFilter, colNames).length > TREE_FILTER_MAX_LENGTH) {
                                              Modal.error({
                                                title: t('components.treeFilter.errors.maxLength.title'),
                                                content: t('components.treeFilter.errors.maxLength.content')
                                              });
                                            } else {
                                              callOnColumnValuesChangeWithSpinner(column.name, newChecked);
                                            }
                                          };

                                          const subsequentColumnNames = columns.slice(index + 1).map(({name}) =>
                                            !isCC ? name : getNormalizedColumnName(name));
                                          if (subsequentColumnNames.find(name => treeFilter[name])) {
                                            Modal.confirm({
                                              title: t('components.treeFilter.confirms.filterChange.title'),
                                              content: t('components.treeFilter.confirms.filterChange.content'),
                                              onOk() {
                                                callOnColumnValuesChange();
                                              },
                                              cancelText: t('commons.buttons.cancel.title')
                                            })
                                          } else {
                                            callOnColumnValuesChange();
                                          }
                                        }}
                                        checkedKeys={{
                                          checked: treeFilter[column.name]
                                            ? treeFilter[column.name].values
                                            : treeFilter[getNormalizedColumnName(column.name)]
                                              ? treeFilter[getNormalizedColumnName(column.name)].values
                                              : []
                                        }}
                                        getNodeIsCheckable={
                                          ({id}) => !disabled && (id.startsWith(TREE_NODE_KEY_PREFIX) || column.filteredValues.includes(id))
                                        }
                                        leftActions={hideInclusionRadio !== true
                                          ? (
                                            <Row>
                                              <Col>
                                                <Radio.Group
                                                  disabled={disabled}
                                                  value={
                                                    treeFilter[column.name] && treeFilter[column.name].mode
                                                      ? treeFilter[column.name].mode
                                                      : FILTER_MODE_IN
                                                  }
                                                  onChange={({target}) => {
                                                    const subsequentColumnNames = columns.slice(index + 1).map(({name}) => name);
                                                    if (subsequentColumnNames.find(name => treeFilter[name])) {
                                                      Modal.confirm({
                                                        title: t('components.treeFilter.confirms.filterChange.title'),
                                                        content: t('components.treeFilter.confirms.filterChange.content'),
                                                        onOk() {
                                                          callOnColumnModeChangeWithSpinner(column.name, target.value);
                                                        },
                                                        cancelText: t('commons.buttons.cancel.title')
                                                      })
                                                    } else {
                                                      callOnColumnModeChangeWithSpinner(column.name, target.value);
                                                    }
                                                  }}
                                                >
                                                  <Radio.Button value={FILTER_MODE_IN}>
                                                    {t('components.treeFilter.filterModeRadio.in.title')}
                                                  </Radio.Button>
                                                  <Radio.Button value={FILTER_MODE_NOT_IN}>
                                                    {t('components.treeFilter.filterModeRadio.notIn.title')}
                                                  </Radio.Button>
                                                </Radio.Group>
                                              </Col>
                                            </Row>
                                          )
                                          : null
                                        }
                                        nodeActions={[
                                          ({id, codes}) =>
                                            codes && codes.length > 0 && !id.startsWith(TREE_NODE_KEY_PREFIX)
                                              ? ({
                                                ...BUTTON_CHECK_ALL_CHILDS,
                                                title: t("components.treeFilter.checkUncheckAllChilds.title"),
                                                disabled,
                                                onClick: () => {
                                                  const childIds = codes.map(({id}) => id);
                                                  const checkedColIds = treeFilter[column.name]
                                                    ? treeFilter[column.name].values
                                                    : treeFilter[getNormalizedColumnName(column.name)]
                                                      ? treeFilter[getNormalizedColumnName(column.name)].values
                                                      : [];

                                                  const mergedIds = _.uniq(childIds.concat(checkedColIds));

                                                  const checked =
                                                    mergedIds.length > checkedColIds.length
                                                      ? mergedIds
                                                      : checkedColIds.filter(id => !childIds.includes(id));


                                                  const subsequentColumnNames = columns.slice(index + 1).map(({name}) =>
                                                    !isCC ? name : getNormalizedColumnName(name));
                                                  if (subsequentColumnNames.find(name => treeFilter[name])) {
                                                    Modal.confirm({
                                                      title: t('components.treeFilter.confirms.filterChange.title'),
                                                      content: t('components.treeFilter.confirms.filterChange.content'),
                                                      onOk() {
                                                        callOnColumnValuesChangeWithSpinner(column.name, checked);
                                                      },
                                                      cancelText: t('commons.buttons.cancel.title')
                                                    })
                                                  } else {
                                                    callOnColumnValuesChangeWithSpinner(column.name, checked);
                                                  }
                                                }
                                              })
                                              : null
                                        ]}
                                        disabledCheckboxTitle={
                                          disabled
                                            ? null
                                            : () => t('components.treeFilter.disabledCheckbox.title')
                                        }
                                      />
                                    );
                                  }
                                )()}
                              </Call>
                            </Call>
                          )
                        }
                      </Call>
                    </Tabs.TabPane>
                  )}
              </Tabs>
            )
            : (
              <Card bodyStyle={{height: 526}}>
                <CustomEmpty/>
              </Card>
            )
        }
      </DataLanguageConsumer>
    );
  }
}

export default compose(
  translate(),
  connect(mapStateToProps, mapDispatchToProps)
)(TreeFilter);
