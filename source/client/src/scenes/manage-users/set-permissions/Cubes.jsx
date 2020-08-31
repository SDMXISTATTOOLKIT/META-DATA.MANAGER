import React from 'react';
import {connect} from "react-redux";
import {compose} from "redux";
import {translate} from "react-i18next";
import Call from "../../../hocs/call";
import {changeSetPermissionsCategorisedCubesPermissions, readSetPermissionsCategorisedCubes} from "./actions";
import EnhancedTree from "../../../components/enhanced-tree";
import {getMappedTree, getNodes} from "../../../utils/tree";
import {getLocalizedStr} from "../../../middlewares/i18n/utils";
import _ from "lodash";
import {Button, Col, Row} from "antd";
import {GUTTER_SM} from "../../../styles/constants";

const mapStateToProps = state => ({
  appLanguage: state.app.language,
  dataLanguages: state.config.dataManagement.dataLanguages,
  categorisedCubes: state.scenes.manageUsers.setPermissions.categorisedCubes,
  permissions: state.scenes.manageUsers.setPermissions.permissions
});

const mapDispatchToProps = dispatch => ({
  onChange: categorisedCubesPermissions =>
    dispatch(changeSetPermissionsCategorisedCubesPermissions(categorisedCubesPermissions)),
  fetchCategorisedCubes: () => dispatch(readSetPermissionsCategorisedCubes())
});

const onNodeCheck = (checkedNodes, checkedNode, check, onChange) => {
  const ret = [];
  checkedNode = checkedNode.props["data-node"];
  check && checkedNode && checkedNode.children && getMappedTree(checkedNode.children, "children", child => {
      child.Code
        ? ret.push(child.Code)
        : ret.push(child.CatCode);
      return child;
    }
  );
  onChange(checkedNodes.concat(_.difference(ret, checkedNodes)));
};

const SetPermissionsCubes = ({
                               t,
                               appLanguage,
                               dataLanguages,
                               permissions,
                               categorisedCubes,
                               onChange,
                               fetchCategorisedCubes
                             }) => {
  const allCubes = getNodes(categorisedCubes, "children", () => true)
    .map(({Code, CatCode}) => Code || CatCode);

  return (
    <Call cb={fetchCategorisedCubes}>
      <div className="set-permissions__cubes__tree">
        {categorisedCubes && (
          <EnhancedTree
            tree={categorisedCubes}
            childrenKey="children"
            idKey="Code"
            nameKey="labels"
            catIdKey="CatCode"
            catNameKey="labels"
            getFilter={
              searchText =>
                ({Code, CatCode, labels}) => {
                  const search = searchText.toLowerCase();
                  return (Code && Code.toLowerCase()
                      .indexOf(search) >= 0) ||
                    (CatCode && CatCode.toLowerCase()
                      .indexOf(search) >= 0) ||
                    getLocalizedStr(labels, appLanguage, dataLanguages)
                      .toLowerCase()
                      .indexOf(search) >= 0;
                }
            }
            unselectableKeys={allCubes}
            checkable
            checkStrictly
            checkedKeys={
              permissions
                ? [
                  ...permissions.cube,
                  ...permissions.cubeOwner,
                  ...permissions.category
                ]
                : []
            }
            getNodeIsCheckable={({Code}) => Code === undefined || !permissions.cubeOwner.includes(Code)}
            onCheck={
              ({checked}, {node, checked: check}) =>
                onNodeCheck(
                  checked.filter(({Code}) =>
                    Code === undefined || !permissions.cubeOwner.includes(Code) || permissions.cube.includes(Code)
                  ),
                  node,
                  check,
                  onChange
                )
            }
            noPagination
            icon="cube"
            isCustomIcon
            getIconColor={() => "#37a0f4"}
            isRootIconLikeChildrenIcon
            rightActions={
              <Row type="flex" gutter={GUTTER_SM}>
                <Col>
                  <Button onClick={() => onChange(allCubes)} type="primary">
                    {t('commons.buttons.selectAll.title')}
                  </Button>
                </Col>
                <Col>
                  <Button onClick={() => onChange(null)}>
                    {t('commons.buttons.deselectAll.title')}
                  </Button>
                </Col>
              </Row>
            }
          />
        )}
      </div>
    </Call>
  )
};

export default compose(
  translate(),
  connect(mapStateToProps, mapDispatchToProps)
)(SetPermissionsCubes);
