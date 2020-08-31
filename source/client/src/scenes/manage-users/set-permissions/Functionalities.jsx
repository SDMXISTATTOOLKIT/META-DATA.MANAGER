import React from 'react';
import {translate} from 'react-i18next';
import {connect} from "react-redux";
import {compose} from "redux";
import EnhancedTree from '../../../components/enhanced-tree';
import {changeSetPermissionsFunctionalitiesPermissions, readSetPermissionsFunctionalities} from "./actions";
import Call from "../../../hocs/call";
import {getNodes} from "../../../utils/tree";
import {superUserMenu, userMenu} from "../../../constants/menus";
import _ from "lodash"
import {Button} from "antd";
import Row from "antd/es/grid/row";
import Col from "antd/es/grid/col";
import {GUTTER_SM} from "../../../styles/constants";

const mapStateToProps = state => ({
  permissions: state.scenes.manageUsers.setPermissions.permissions,
  functionalities: state.scenes.manageUsers.setPermissions.functionalities
});

const mapDispatchToProps = dispatch => ({
  onChange: functionalitiesPermissions =>
    dispatch(changeSetPermissionsFunctionalitiesPermissions(functionalitiesPermissions)),
  fetchFunctionalities: menu => dispatch(readSetPermissionsFunctionalities(menu))
});

const onNodeCheck = (checkedNodes, checkedNode, check, onChange) => {
  const ret = [];
  checkedNode = checkedNode.props["data-node"];
  check && checkedNode && checkedNode.Children && checkedNode.Children.map(child => ret.push(child.Functionality));
  onChange(checkedNodes.concat(_.difference(ret, checkedNodes)));
};

const SetPermissionsFunctionalities = ({
                                         t,
                                         functionalities,
                                         permissions,
                                         onChange,
                                         fetchFunctionalities
                                       }) => {
  const allFunctionalities = getNodes(functionalities, "Children", () => true)
    .map(({Functionality}) => Functionality);

  return (
    <Call cb={fetchFunctionalities} cbParam={[...userMenu(t), ...superUserMenu(t)]}>
      <div className="set-permissions__functionalities__tree">
        {functionalities && (
          <EnhancedTree
            tree={functionalities}
            childrenKey="Children"
            idKey="Functionality"
            nameKey="name"
            catIdKey="Functionality"
            catNameKey="name"
            hiddenIdKeys={allFunctionalities}
            getFilter={
              searchText =>
                ({name}) => name && name.toLowerCase().indexOf(searchText.toLowerCase()) >= 0
            }
            isNameMultilanguage={false}
            checkable
            checkStrictly
            checkedKeys={permissions ? permissions.functionality : []}
            onCheck={({checked}, {node, checked: check}) => onNodeCheck(checked, node, check, onChange)}
            noPagination
            unselectableKeys={allFunctionalities}
            isEmptyCategoryIconLikeLeafIcon
            isRootIconLikeChildrenIcon
            icon="file"
            rightActions={
              <Row type="flex" gutter={GUTTER_SM}>
                <Col>
                  <Button onClick={() => onChange(allFunctionalities)} type="primary">
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
)(SetPermissionsFunctionalities);
