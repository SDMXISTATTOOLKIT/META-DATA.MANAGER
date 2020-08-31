import React, {Fragment} from 'react';
import {Route, Switch} from 'react-router-dom';
import {translate} from 'react-i18next';
import {Card, Divider, Layout} from 'antd';
import './style.css';
import PageHeader from './header';
import Sidebar from './sidebar';
import Home from '../scenes/home';
import PageBreadcrumb from './breadcrumb';
import {superUserMenu, userMenu} from '../constants/menus';
import Footer from './footer';
import {MARGIN_LG, MARGIN_MD, MARGIN_SM, PADDING_MD, PADDING_SM} from '../styles/constants';
import CategorySchemeSelector from '../middlewares/default-category-scheme-selector';
import {compose} from 'redux';
import {hot} from 'react-hot-loader';
import Spinner from '../middlewares/spinner';
import {connect} from 'react-redux';
import NavigatePageDispatcher from "./NavigatePageDispatcher";
import NodesConfig from "../scenes/configuration/nodes-config";
import AppConfig from "../scenes/configuration/app-config";
import {getFilteredTree} from "../utils/tree";
import RemoveTempTables from "../scenes/data-manager/remove-temp-tables/RemoveTempTables";
import {isClassificationsServer, isPageVisible} from "./utils";
import DdbReset from "../scenes/data-manager/ddb-reset/DdbReset";

const cardChildStyle = {
  paddingLeft: PADDING_MD,
  paddingRight: PADDING_MD
};

const Components = connect(
  state => ({
    endpointId: state.app.endpointId,
    isEndpointAvailable: state.app.isEndpointAvailable,
    anonymousPages: state.config.userInterface.anonymousPages,
    permissions: state.app.user.permissions,
    username: state.app.user.username
  })
)(
  ({endpointId, isEndpointAvailable, anonymousPages, t, permissions, username}) =>
    <Fragment>
      {[
        ...getFilteredTree(userMenu(t), "children", isPageVisible(permissions, anonymousPages)),
        ...(
          isClassificationsServer(username, permissions, anonymousPages, t)
            ? []
            : getFilteredTree(superUserMenu(t), "children", isPageVisible(permissions, anonymousPages))
        )
      ].map(parent =>
          parent.children.map(child =>
              !child.isDivider
                ? (
                  <Route
                    key={child.path}
                    path={child.path}
                    exact
                    render={() =>
                      <Card
                        style={{
                          marginTop: MARGIN_MD,
                          marginBottom: MARGIN_SM,
                          borderWidth: 1,
                          borderStyle: "solid",
                          borderColor: "rgb(229, 229, 229)"
                        }}
                        bodyStyle={{
                          paddingTop: PADDING_SM,
                          paddingBottom: PADDING_SM,
                          paddingLeft: 0,
                          paddingRight: 0
                        }}
                      >
                        {child.component !== RemoveTempTables && child.component !== DdbReset && (
                          <div style={cardChildStyle}>
                            <PageBreadcrumb child={child}/>
                          </div>
                        )}
                        {
                          child.component && child.component !== RemoveTempTables && child.component !== DdbReset && (
                            child.component === AppConfig || child.component === NodesConfig ||
                            (endpointId !== null && isEndpointAvailable === true)
                          )
                            ? (
                              <Fragment>
                                <Divider style={{marginTop: MARGIN_SM, marginBottom: MARGIN_MD}}/>
                                <div style={{...cardChildStyle, paddingBottom: PADDING_SM}}>
                                  <child.component/>
                                </div>
                              </Fragment>
                            )
                            : (
                              child.component && (child.component === RemoveTempTables || child.component === DdbReset) &&
                              endpointId !== null && isEndpointAvailable === true
                                ? (
                                  <div style={{...cardChildStyle, paddingBottom: PADDING_SM}}>
                                    <child.component/>
                                  </div>
                                )
                                : null
                            )
                        }
                      </Card>
                    }
                  />
                )
                : null
            )
          )
      }
    </Fragment>);

const Page = ({t}) =>
  <Spinner>
    <CategorySchemeSelector/> {/* TODO: piazzare in un luogo più consono */}
    <NavigatePageDispatcher/>
    <Layout
      className="page"
      style={{
        position: "absolute",
        width: "100%",
        height: "100%"
      }}
    >
      <Route path="/" component={Sidebar}/>
      <Layout>
        <PageHeader/>
        <Fragment>
          <div style={{
            marginLeft: MARGIN_LG,
            marginRight: MARGIN_LG
          }}>
            <Switch>
              <Route component={Home} path='/' exact/>
              <Components t={t}/>
            </Switch>
          </div>
          <Footer/>
        </Fragment>
      </Layout>
    </Layout>
  </Spinner>;

export default compose(
  hot(module),
  translate(),
)(Page);
