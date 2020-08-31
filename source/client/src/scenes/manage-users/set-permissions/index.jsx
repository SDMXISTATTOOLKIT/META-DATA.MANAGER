import React, {Fragment} from 'react';
import {Button, Tabs} from "antd";
import SetPermissionsAgencies from './Agencies';
import {MODAL_WIDTH_MD, TABLE_COL_MIN_WIDTH_NAME} from "../../../styles/constants";
import {connect} from "react-redux";
import {compose} from "redux"
import {translate} from 'react-i18next';
import {
  changeSetPermissionsTab,
  editSetPermissionsUser,
  hideSetPermissionsUser,
  readSetPermissionsPermissions,
  readSetPermissionsUsers,
  submitSetPermissionsPermissions,
  synchronizeSetPermissions
} from "./actions";
import {
  SET_PERMISSIONS_TAB_AGENCIES_KEY,
  SET_PERMISSIONS_TAB_CUBES_KEY,
  SET_PERMISSIONS_TAB_FUNCTIONALITIES_KEY,
  SET_PERMISSIONS_TAB_RULES_KEY,
} from "./reducer";
import SetPermissionsFeatures from "./Functionalities";
import SetPermissionsCubes from "./Cubes";
import SetPermissionsRules from "./Rules";
import Call from "../../../hocs/call";
import EnhancedModal from "../../../components/enhanced-modal";
import "./style.css";
import {BUTTON_DETAIL} from "../../../styles/buttons";
import InfiniteScrollTable from "../../../components/infinite-scroll-table";

const mapStateToProps = state => ({
  token: state.app.user.token,
  users: state.scenes.manageUsers.setPermissions.users,
  user: state.scenes.manageUsers.setPermissions.user,
  currentTab: state.scenes.manageUsers.setPermissions.currentTab,
  permissions: state.scenes.manageUsers.setPermissions.permissions,
  isSynchronized: state.scenes.manageUsers.setPermissions.isSynchronized,
});

const mapDispatchToProps = dispatch => ({
  fetchUsers: () => dispatch(readSetPermissionsUsers()),
  onUserEdit: (username, email) => dispatch(editSetPermissionsUser(username, email)),
  fetchPermissions: username => dispatch(readSetPermissionsPermissions(username)),
  onUserHide: () => dispatch(hideSetPermissionsUser()),
  onTabChange: tab => dispatch(changeSetPermissionsTab(tab)),
  onPermissionsSubmit: (username, permissions, token) =>
    dispatch(submitSetPermissionsPermissions(username, permissions, token)),
  synchronize: () => dispatch(synchronizeSetPermissions())
});

const SetPermissions = ({
                          t,
                          token,
                          users,
                          user,
                          currentTab,
                          permissions,
                          isSynchronized,
                          fetchUsers,
                          fetchPermissions,
                          onUserEdit,
                          onUserHide,
                          onTabChange,
                          onPermissionsSubmit,
                          synchronize
                        }) =>
  <Call cb={synchronize} disabled={isSynchronized}>
    {isSynchronized && (
      <Fragment>
        <Call cb={fetchUsers} disabled={users !== null}>
          <InfiniteScrollTable
            data={users}
            getRowKey={({username}) => username}
            columns={[
              {
                title: t('data.user.username.label'),
                dataIndex: 'username',
                minWidth: TABLE_COL_MIN_WIDTH_NAME
              },
              {
                title: t('data.user.email.label'),
                dataIndex: 'email',
                minWidth: TABLE_COL_MIN_WIDTH_NAME
              }
            ]}
            actions={[
              ({username, email}) => ({
                ...BUTTON_DETAIL,
                title: t('commons.actions.detail.title'),
                onClick: () => onUserEdit(username, email)
              })
            ]}
          />
        </Call>
        <Call cb={fetchPermissions} cbParam={user ? user.username : null} disabled={permissions !== null}>
          <EnhancedModal
            visible={user !== null}
            width={MODAL_WIDTH_MD}
            title={t('scenes.manageUsers.setPermissions.modals.setPermissions.title', {
              username: user ? user.username : null
            })}
            onCancel={onUserHide}
            footer={
              <div>
                <Button onClick={onUserHide}>{t('commons.buttons.close.title')}</Button>
                <Button
                  type="primary"
                  onClick={() => onPermissionsSubmit(user.username, permissions, token)}
                >
                  {t('commons.buttons.save.title')}
                </Button>
              </div>
            }
          >
            <Tabs
              onTabClick={
                tab => onTabChange(tab)
              }
              activeKey={currentTab}
            >
              <Tabs.TabPane
                key={SET_PERMISSIONS_TAB_FUNCTIONALITIES_KEY}
                tab={t('scenes.manageUsers.setPermissions.tabs.functionalities.title')}
              >
                {currentTab === SET_PERMISSIONS_TAB_FUNCTIONALITIES_KEY && <SetPermissionsFeatures/>}
              </Tabs.TabPane>
              <Tabs.TabPane
                key={SET_PERMISSIONS_TAB_RULES_KEY}
                tab={t('scenes.manageUsers.setPermissions.tabs.rules.title')}
              >
                {currentTab === SET_PERMISSIONS_TAB_RULES_KEY && <SetPermissionsRules/>}
              </Tabs.TabPane>
              <Tabs.TabPane
                key={SET_PERMISSIONS_TAB_AGENCIES_KEY}
                tab={t('scenes.manageUsers.setPermissions.tabs.agencies.title')}
              >
                {currentTab === SET_PERMISSIONS_TAB_AGENCIES_KEY && <SetPermissionsAgencies/>}
              </Tabs.TabPane>
              <Tabs.TabPane
                key={SET_PERMISSIONS_TAB_CUBES_KEY}
                tab={t('scenes.manageUsers.setPermissions.tabs.cubes.title')}
              >
                {currentTab === SET_PERMISSIONS_TAB_CUBES_KEY && <SetPermissionsCubes/>}
              </Tabs.TabPane>
            </Tabs>
          </EnhancedModal>
        </Call>
      </Fragment>
    )}
  </Call>;

export default compose(
  translate(),
  connect(mapStateToProps, mapDispatchToProps)
)(SetPermissions);
