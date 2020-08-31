import React from 'react';
import {connect} from 'react-redux';
import {Button, Col, Icon, Layout, Row} from 'antd';
import LanguageDropdown from './language-dropdown';
import EndpointDropdown from './endpoint-dropdown';
import UserDropdown from './user-dropdown';
import PageHeaderHelpButton from './help-button';
import {GUTTER_MD, GUTTER_SM, MARGIN_XS} from '../../styles/constants';
import {logoutSuperUser} from "../../middlewares/authentication/actions";
import {compose} from "redux";
import {translate} from 'react-i18next';
import {collapseAppSidebar, expandAppSidebar} from "../../reducers/app/actions";
import {isClassificationsServer} from "../utils";
import _ from "lodash";
import {logo} from "../sidebar/Header";

const mapStateToProps = state => ({
  isSidebarCollapsed: state.app.isSidebarCollapsed,
  superUserUsername: state.app.superUser.username,
  username: state.app.user.username,
  permissions: state.app.user.permissions,
  anonymousPages: state.config.userInterface.anonymousPages,
  nodes: state.config.nodes,
  nodeId: state.app.endpointId,
});

const mapDispatchToProps = dispatch => ({
  onSidebarCollapse: () => dispatch(collapseAppSidebar()),
  onSidebarExpand: () => dispatch(expandAppSidebar()),
  onSuperUserLogout: () => dispatch(logoutSuperUser())
});

const PageHeader = ({
                      t,
                      isSidebarCollapsed,
                      onSidebarCollapse,
                      superUserUsername,
                      onSidebarExpand,
                      onSuperUserLogout,
                      username,
                      permissions,
                      anonymousPages,
                      nodes,
                      nodeId,
                    }) => {

  const isReadOnlyNode = nodeId && !_.find(nodes, node => node.general.id === nodeId).endpoint.haveDMWS;

  return (
    <Layout.Header
      style={{
        background: "white",
        paddingLeft: !isClassificationsServer(username, permissions, anonymousPages, t) ? 24 : 6,
        paddingRight: 24,
        borderBottom: "1px solid lightgrey",
      }}
    >
      <Row type="flex" justify="space-between">
        <Col>
          <Row type="flex" gutter={GUTTER_MD}>
            {isClassificationsServer(username, permissions, anonymousPages, t)
              ? (
                <Col>
                  <div
                    style={{
                      height: 64,
                      width: 314,
                      paddingTop: 6,
                      paddingLeft: 32,
                      borderRight: "rgb(229, 229, 229) 1px solid"
                    }}
                  >
                    {logo()}
                  </div>
                </Col>
              )
              : (
                <Col>
                  {isSidebarCollapsed !== null && (
                    <Icon
                      type={isSidebarCollapsed ? 'menu-unfold' : 'menu-fold'}
                      onClick={isSidebarCollapsed ? onSidebarExpand : onSidebarCollapse}
                      style={{
                        fontSize: 20,
                        cursor: "pointer",
                        paddingTop: 22
                      }}
                    />
                  )}
                </Col>
              )
            }
            <Col>
              <span
                style={{
                  fontSize: 30,
                  color: "red",
                  marginRight: MARGIN_XS,
                  fontFamily: 'Fira Sans',
                  fontWeight: 600
                }}
              >
                M&D Manager
              </span>
              <span
                style={{
                  color: "gray",
                  fontSize: 12
                }}
              >
                v1.3.0
              </span>
            </Col>
          </Row>
        </Col>
        <Col>
          <Row gutter={GUTTER_SM} type="flex">
            <Col>
              <EndpointDropdown/>
            </Col>
            <Col>
              <LanguageDropdown/>
            </Col>
            {
              isReadOnlyNode
                ? null
                : (
                  <Col>
                    <UserDropdown/>
                  </Col>
                )
            }
            {superUserUsername && (
              <Col>
                <Button onClick={onSuperUserLogout} icon="lock">
                  {t('page.header.superUserLogoutButton.title')}
                </Button>
              </Col>
            )}
            <Col>
              <PageHeaderHelpButton/>
            </Col>
          </Row>
        </Col>
      </Row>
    </Layout.Header>
  )
};

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  translate()
)(PageHeader);
