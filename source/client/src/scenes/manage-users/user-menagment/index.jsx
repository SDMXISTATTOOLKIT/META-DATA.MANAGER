import React, {Fragment} from 'react';
import {Button, Col, Modal, Row} from "antd";
import {GUTTER_MD, MARGIN_MD, MODAL_WIDTH_MD, TABLE_COL_MIN_WIDTH_NAME} from "../../../styles/constants";
import {connect} from "react-redux";
import {compose} from "redux"
import {translate} from 'react-i18next';
import {
  createUserManagementUser,
  deleteUserManagementUser,
  editUserManagementUser,
  hideUserManagementUser,
  readUserManagementUser,
  readUserManagementUsers,
  submitUserManagement,
  synchronizeUserManagement
} from "./actions";
import UserManagementEditUser from "./EditUser";
import UserManagementCreateUser from "./CreateUser";
import Call from "../../../hocs/call";
import EnhancedModal from "../../../components/enhanced-modal";
import {BUTTON_DELETE, BUTTON_DETAIL} from "../../../styles/buttons";
import InfiniteScrollTable from "../../../components/infinite-scroll-table";
import {logoutUserDropdownUser} from "../../../page/header/user-dropdown/actions";

const mapStateToProps = state => ({
  permissions: state.app.user.permissions,
  username: state.app.user.username,
  token: state.app.user.token,
  users: state.scenes.manageUsers.userManagement.users,
  user: state.scenes.manageUsers.userManagement.user,
  isSynchronized: state.scenes.manageUsers.userManagement.isSynchronized,
  editPassword: state.scenes.manageUsers.userManagement.editPassword,
  isLoginValid: state.scenes.manageUsers.userManagement.isLoginValid
});

const mapDispatchToProps = dispatch => ({
  fetchUsers: () => dispatch(readUserManagementUsers()),
  fetchUser: () => dispatch(readUserManagementUser()),
  onUserEdit: ({username, email}) => dispatch(editUserManagementUser(username, email)),
  onUserHide: () => dispatch(hideUserManagementUser()),
  onUserCreate: (username, password, email) => dispatch(createUserManagementUser(username, password, email)),
  onUserSubmit: (user, token, editPassword, isLoginValid) =>
    dispatch(submitUserManagement(user, token, editPassword, isLoginValid)),
  onUserDelete: username => dispatch(deleteUserManagementUser(username)),
  synchronize: () => dispatch(synchronizeUserManagement()),
  onLogout: () => dispatch(logoutUserDropdownUser())
});

const UserManagement = ({
                          t,
                          permissions,
                          username,
                          token,
                          users,
                          user,
                          isSynchronized,
                          fetchUsers,
                          fetchUser,
                          onUserEdit,
                          onUserHide,
                          onUserCreate,
                          onUserSubmit,
                          onUserDelete,
                          synchronize,
                          editPassword,
                          isLoginValid,
                          onLogout
                        }) =>
  <Fragment>
    <Call cb={synchronize}>
      {isSynchronized && (
        (permissions && permissions.rules && permissions.rules.includes("AdminRole"))
          ? (
            <Fragment>
              <Call cb={fetchUsers} disabled={users !== null || isLoginValid === false}>
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
                      onClick: () => onUserEdit({username, email})
                    }),
                    ({username}) => ({
                      ...BUTTON_DELETE,
                      title: t('commons.actions.delete.title'),
                      onClick: () => {
                        Modal.confirm({
                          title: t('scenes.manageUsers.userManagement.confirms.deleteUser.title'),
                          onOk() {
                            onUserDelete(username)
                          },
                          cancelText: t('commons.buttons.cancel.title')
                        })
                      }
                    }),
                  ]}
                  rightActions={
                    <Button
                      type="primary"
                      icon="plus"
                      onClick={
                        () => {
                          let modal = Modal.info();
                          modal.update({
                            icon: 'user',
                            title: t('scenes.manageUsers.userManagement.modals.createUser.title'),
                            content:
                              <UserManagementCreateUser
                                t={t}
                                modal={modal}
                                onSubmit={(username, password, email) => onUserCreate(username, password, email)}
                              />,
                            okButtonProps: {style: {display: 'none'}},
                            keyboard: false
                          });
                        }
                      }
                    >
                      {t('scenes.manageUsers.userManagement.buttons.createUser.title')}
                    </Button>
                  }
                />
              </Call>
              <EnhancedModal
                visible={user !== null}
                width={MODAL_WIDTH_MD}
                title={t("scenes.manageUsers.userManagement.modals.editUser.title", {
                  username: user ? user.username : null
                })}
                onCancel={onUserHide}
                footer={
                  <div>
                    <Button onClick={onUserHide}>{t('commons.buttons.close.title')}</Button>
                    <Button
                      type="primary"
                      onClick={() => onUserSubmit(user, token, editPassword, username !== user.username)}
                      disabled={
                        user === null || (
                          (user.email === null || user.email.length === 0) ||
                          ((user.password || "") !== (user.confirmPassword || ""))
                        )
                      }
                    >
                      {t('commons.buttons.save.title')}
                    </Button>
                  </div>
                }
              >
                <UserManagementEditUser/>
              </EnhancedModal>
            </Fragment>
          )
          : (
            <Call cb={fetchUser} disabled={user !== null || isLoginValid === false}>
              <UserManagementEditUser/>
              <Row type="flex" justify="end" gutter={GUTTER_MD} style={{marginBottom: MARGIN_MD}}>
                <Col>
                  <Button
                    type="primary"
                    onClick={() => onUserSubmit(user, token, editPassword, username !== user.username)}
                    disabled={
                      user === null || (
                        (user.email === null || user.email.length === 0) ||
                        ((user.password || "") !== (user.confirmPassword || ""))
                      )
                    }
                  >
                    {t('commons.buttons.save.title')}
                  </Button>
                </Col>
              </Row>
            </Call>
          )
      )}
    </Call>
    <Call cb={onLogout} disabled={isLoginValid !== false}>
      <span/>
    </Call>
  </Fragment>;

export default compose(
  translate(),
  connect(mapStateToProps, mapDispatchToProps)
)(UserManagement);
