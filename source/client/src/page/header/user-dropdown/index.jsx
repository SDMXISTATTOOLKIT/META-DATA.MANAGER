import React from 'react';
import {Button, Col, Dropdown, Form, Icon, Input, Menu, Modal, Row} from 'antd';
import {translate} from 'react-i18next';
import {connect} from "react-redux";
import {compose} from "redux";
import {changeAppUserDropdownVisible} from "../../../reducers/app/actions";
import {loginUserDropdownUser, logoutUserDropdownUser, recoverUserDropdownUserPassword} from "./actions";
import {MARGIN_SM, SPAN_FULL} from "../../../styles/constants";
import UserDropdownRecoverPassword from "./RecoverPassword";

const mapStateToProps = state => ({
  username: state.app.user.username,
  isVisible: state.app.user.isDropdownVisible
});

const mapDispatchToProps = dispatch => ({
  onVisibleChange: visibility => dispatch(changeAppUserDropdownVisible(visibility)),
  onLogin: (username, password) => dispatch(loginUserDropdownUser(username, password)),
  onLogout: () => dispatch(logoutUserDropdownUser()),
  onRecoverPassword: (username, email) => dispatch(recoverUserDropdownUserPassword(username, email))
});

const PageHeaderUserDropdown = ({
                                  t,
                                  form,
                                  isVisible,
                                  username,
                                  onVisibleChange,
                                  onLogin,
                                  onLogout,
                                  onRecoverPassword
                                }) =>
  <Dropdown
    visible={isVisible}
    onVisibleChange={onVisibleChange}
    trigger={["click"]}
    style={{minWidth: 120}}
    overlay={
      <Menu style={{width: '100%'}}>
        <Menu.Item disabled style={{cursor: 'auto'}}>
          {
            username
              ? (
                <Button type="primary" onClick={onLogout} style={{width: '100%'}}>
                  {t('page.header.userDropdown.buttons.logout')}
                </Button>
              )
              : (
                <Form layout="vertical">
                  <Form.Item style={{marginBottom: 0}}>
                    {form.getFieldDecorator('username')(
                      <Input
                        autoComplete="username"
                        placeholder={t('page.header.userDropdown.fields.username.placeholder')}
                      />
                    )}
                  </Form.Item>
                  <Form.Item style={{marginBottom: 0}}>
                    {form.getFieldDecorator('password')(
                      <Input
                        type="password"
                        autoComplete="current-password"
                        placeholder={t('page.header.userDropdown.fields.password.placeholder')}
                      />
                    )}
                  </Form.Item>
                  <Form.Item>
                    <Row style={{marginBottom: MARGIN_SM}}>
                      <Col span={SPAN_FULL}>
                        <Button
                          type="primary"
                          onClick={() => onLogin(form.getFieldValue('username'), form.getFieldValue('password'))}
                          disabled={!!!form.getFieldValue('username')}
                          style={{width: '100%'}}
                          htmlType="submit"
                        >
                          {t('page.header.userDropdown.buttons.login')}
                        </Button>
                      </Col>
                    </Row>
                    <Row>
                      <Col span={SPAN_FULL}>
                        <Button
                          onClick={
                            () => {
                              let modal = Modal.info();
                              modal.update({
                                icon: 'user',
                                title: t('page.header.userDropdown.recoverPassword.title'),
                                content:
                                  <UserDropdownRecoverPassword
                                    t={t}
                                    modal={modal}
                                    onSubmit={(username, email) => onRecoverPassword(username, email)}
                                  />,
                                okButtonProps: {style: {display: 'none'}},
                                keyboard: false
                              });
                            }
                          }
                          style={{width: '100%'}}
                        >
                          {t('page.header.userDropdown.buttons.recoverPassword')}
                        </Button>
                      </Col>
                    </Row>
                  </Form.Item>
                </Form>
              )
          }
        </Menu.Item>
      </Menu>
    }
  >
    <Button style={{width: '100%'}}>
      <Icon type={username ? 'logout' : 'login'}/>
      {username || t('page.header.userDropdown.label.anonymous')}
      <Icon type="down"/>
    </Button>
  </Dropdown>;

export default compose(
  translate(),
  connect(mapStateToProps, mapDispatchToProps),
  Form.create()
)(PageHeaderUserDropdown);
