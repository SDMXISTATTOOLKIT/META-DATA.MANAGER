import React from 'react';
import {connect} from 'react-redux';
import {translate} from 'react-i18next';
import {Link} from 'react-router-dom';
import {Layout, Menu} from 'antd';

import {superUserMenu, userMenu} from '../../constants/menus';
import SidebarHeader from './Header';
import './style.css';
import uuidv4 from 'uuid';
import {compose} from 'redux';
import {getFilteredTree} from "../../utils/tree";
import {isClassificationsServer, isPageVisible} from "../utils";

const mapStateToProps = state => ({
  isCollapsed: state.app.isSidebarCollapsed,
  anonymousPages: state.config.userInterface.anonymousPages,
  permissions: state.app.user.permissions,
  username: state.app.user.username
});

const SIDEBAR_TITLE_HEIGHT = 64;


const Sidebar = ({
                   isCollapsed,
                   location,
                   anonymousPages,
                   t,
                   permissions,
                   username
                 }) =>
  isClassificationsServer(username, permissions, anonymousPages, t)
    ? null
    : (
      <Layout.Sider
        className="sidebar"
        width={320}
        collapsedWidth={64}
        theme="dark"
        collapsible
        collapsed={isCollapsed !== null ? isCollapsed : true}
        trigger={null}>
        <SidebarHeader/>
        <Menu
          className={`sidebar__menu ${(isCollapsed !== null ? isCollapsed : true) ? 'sidebar__menu--collapsed' : ''}`}
          theme="dark"
          mode="inline"
          forceSubMenuRender
          selectedKeys={[location.pathname]}
          style={{
            height: `calc(100% - ${SIDEBAR_TITLE_HEIGHT}px`,
            overflow: "auto"
          }}
        >
          {[
            ...getFilteredTree(userMenu(t), "children", isPageVisible(permissions, anonymousPages)),
            ...getFilteredTree(superUserMenu(t), "children", isPageVisible(permissions, anonymousPages))
          ].map(parent =>
            parent.children.filter(({isDivider}) => !isDivider).length &&
            <Menu.SubMenu
              className="sidebar__menu__item"
              key={parent.path}
              title={
                <div title={isCollapsed ? t(parent.label) : null}>
                  <div className="sidebar__menu__item__icon__container">
                    <img
                      alt={t(parent.label)}
                      className="sidebar__menu__item__icon"
                      src={parent.redIconPath}
                    />
                  </div>
                  <span className="sidebar__menu__item__label">
                        {t(parent.label)}
                      </span>
                </div>
              }
            >
              {parent.children.map(child =>
                !child.isDivider
                  ? (
                    <Menu.Item key={child.path} className="sidebar__menu__sub__item">
                      <Link to={child.path}>
                        <div className="sidebar__menu__sub__item__icon__container">
                          <img
                            alt={t(child.label)}
                            className="sidebar__menu__sub__item__icon"
                            src={child.redIconPath}
                          />
                        </div>
                        {t(child.label)}
                      </Link>
                    </Menu.Item>
                  )
                  : <Menu.Divider key={uuidv4()}/>)}
            </Menu.SubMenu>)}
        </Menu>
      </Layout.Sider>
    );

export default compose(connect(mapStateToProps), translate())(Sidebar);
