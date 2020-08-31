import React from 'react';
import {translate} from 'react-i18next';
import {connect} from "react-redux";
import {compose} from "redux";
import Call from "../../../hocs/call";
import {changeSetPermissionsRulesPermissions, readSetPermissionsRules} from "./actions";
import {Button, Col, Row} from "antd";
import {GUTTER_SM} from "../../../styles/constants";
import InfiniteScrollTable from "../../../components/infinite-scroll-table";

const mapStateToProps = state => ({
  permissions: state.scenes.manageUsers.setPermissions.permissions,
  rules: state.scenes.manageUsers.setPermissions.rules
});

const mapDispatchToProps = dispatch => ({
  onChange: rulesPermissions => dispatch(changeSetPermissionsRulesPermissions(rulesPermissions)),
  fetchRules: () => dispatch(readSetPermissionsRules())
});

const SetPermissionsRules = ({
                               t,
                               rules,
                               permissions,
                               onChange,
                               fetchRules
                             }) =>
  <Call cb={fetchRules}>
    {rules && (
      <InfiniteScrollTable
        showHeader={false}
        height={284}
        data={rules.map(rule => ({name: rule}))}
        getRowKey={({name}) => name}
        columns={[
          {
            dataIndex: 'name',
            minWidht: 150
          }
        ]}
        rowSelection={{
          selectedRowKeys: permissions ? permissions.rules : [],
          onChange
        }}
        rightActions={
          <Row type="flex" gutter={GUTTER_SM}>
            <Col>
              <Button onClick={() => onChange(rules)} type="primary">
                {t('commons.buttons.selectAll.title')}
              </Button>
            </Col>
            <Col>
              <Button onClick={() => onChange([])}>
                {t('commons.buttons.deselectAll.title')}
              </Button>
            </Col>
          </Row>
        }
      />
    )}
  </Call>;

export default compose(
  translate(),
  connect(mapStateToProps, mapDispatchToProps)
)(SetPermissionsRules);
