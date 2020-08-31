import React, {Fragment} from 'react';
import {compose} from 'redux';
import {connect} from "react-redux";
import {translate} from 'react-i18next';
import {Checkbox, Col, Form, Input, Row} from 'antd';
import _ from "lodash";
import {changeAppConfigUserInterfaceForm} from "./actions";
import {normalizeInt} from "../../../utils/normalizers";
import {superUserMenu, userMenu} from "../../../constants/menus";
import EnhancedTree from "../../../components/enhanced-tree";
import {getFilteredTree, getNodes} from "../../../utils/tree";
import {GUTTER_MD} from "../../../styles/constants";
import FormList from "../../../components/form-list";
import LanguageForm from "./LanguageForm";
import {PATH_DATA_MANAGER} from "../../../constants/paths";

const mapStateToProps = state => ({
  UserInterface: state.scenes.configuration.appConfig.config.UserInterface
});

const mapDispatchToProps = dispatch => ({
  onChange: fields => dispatch(changeAppConfigUserInterfaceForm(fields))
});

const mapPropsToFields = ({UserInterface}) => ({
  MaxTreeNodes: Form.createFormField({value: UserInterface !== null ? UserInterface.MaxTreeNodes : null}),
  MaxTreeNodesForPagination:
    Form.createFormField({value: UserInterface !== null ? UserInterface.MaxTreeNodesForPagination : null}),
  MinTreeNodesForPagination:
    Form.createFormField({value: UserInterface !== null ? UserInterface.MinTreeNodesForPagination : null}),
  MaxNodeForExpandAll:
    Form.createFormField({value: UserInterface !== null ? UserInterface.MaxNodeForExpandAll : null}),
  TreePageSize: Form.createFormField({value: UserInterface !== null ? UserInterface.TreePageSize : null}),
  DefaultSidebarCollapsed:
    Form.createFormField({value: UserInterface !== null ? UserInterface.DefaultSidebarCollapsed : null}),
  Languages: Form.createFormField({value: UserInterface !== null ? UserInterface.Languages : null}),
  DefaultLanguage: Form.createFormField({value: UserInterface !== null ? UserInterface.DefaultLanguage : null}),
  AnonymousPages: Form.createFormField({value: UserInterface !== null ? UserInterface.AnonymousPages : null})
});

const onFieldsChange = (props, fields) => props.onChange(_.mapValues(fields, ({value}) => value));

const UserInterfaceForm = ({
                             t,
                             form,
                             UserInterface,
                             onChange
                           }) => {
  const allNodes = getNodes(userMenu(t).concat(superUserMenu(t)), "children", node => !node.isDivider)
    .map(({path}) => path);
  return <Fragment>
    <Form>
      <Form.Item
        label={t("data.appConfig.userInterfaceForm.maxTreeNodes.label")}
        className="form-item-required"
        style={{marginBottom: 0}}
      >
        {form.getFieldDecorator("MaxTreeNodes", {normalize: normalizeInt})(
          <Input
            title={form.getFieldValue("MaxTreeNodes")}
          />
        )}
      </Form.Item>
      <Form.Item
        label={t("data.appConfig.userInterfaceForm.maxTreeNodesForPagination.label")}
        className="form-item-required"
        style={{marginBottom: 0}}
      >
        {form.getFieldDecorator("MaxTreeNodesForPagination", {normalize: normalizeInt})(
          <Input
            title={form.getFieldValue("MaxTreeNodesForPagination")}
          />
        )}
      </Form.Item>
      <Form.Item
        label={t("data.appConfig.userInterfaceForm.minTreeNodesForPagination.label")}
        className="form-item-required"
        style={{marginBottom: 0}}
      >
        {form.getFieldDecorator("MinTreeNodesForPagination", {normalize: normalizeInt})(
          <Input
            title={form.getFieldValue("MinTreeNodesForPagination")}
          />
        )}
      </Form.Item>
      <Form.Item
        label={t("data.appConfig.userInterfaceForm.maxNodeForExpandAll.label")}
        className="form-item-required"
        style={{marginBottom: 0}}
      >
        {form.getFieldDecorator("MaxNodeForExpandAll", {normalize: normalizeInt})(
          <Input
            title={form.getFieldValue("MaxNodeForExpandAll")}
          />
        )}
      </Form.Item>
      <Form.Item
        label={t("data.appConfig.userInterfaceForm.treePageSize.label")}
        className="form-item-required"
        style={{marginBottom: 0}}
      >
        {form.getFieldDecorator("TreePageSize", {normalize: normalizeInt})(
          <Input
            title={form.getFieldValue("TreePageSize")}
          />
        )}
      </Form.Item>
      <Row type="flex" justify="start" align="middle" gutter={GUTTER_MD} style={{marginBottom: 0}}>
        <Col style={{color: 'rgba(0, 0, 0, 0.85)'}}>
          {t("data.appConfig.userInterfaceForm.defaultSidebarCollapsed.label") + ' :'}
        </Col>
        <Col>
          <Form.Item>
            {form.getFieldDecorator("DefaultSidebarCollapsed", {valuePropName: 'checked'})(
              <Checkbox/>
            )}
          </Form.Item>
        </Col>
      </Row>
    </Form>
    <Form.Item
      label={t("data.appConfig.userInterfaceForm.languages.label")}
      className="form-item-required"
      style={{marginBottom: 0}}
    >
      <FormList
        compact
        values={UserInterface ? UserInterface.Languages : null}
        Component={LanguageForm}
        newItem={{
          code: null,
          flag: null
        }}
        minItems={1}
        addItemLabel={t("data.appConfig.userInterfaceForm.languages.buttons.add.label")}
        removeItemLabel={t("data.appConfig.userInterfaceForm.languages.buttons.remove.label")}
        onChange={langs => onChange({Languages: langs})}
      />
    </Form.Item>
    <Form>
      <Form.Item
        label={t("data.appConfig.userInterfaceForm.defaultLanguage.label")}
        className="form-item-required"
        style={{marginBottom: 0}}
      >
        {form.getFieldDecorator("DefaultLanguage")(
          <Input
            title={form.getFieldValue("DefaultLanguage")}
          />
        )}
      </Form.Item>
      <Form.Item
        label={t("data.appConfig.userInterfaceForm.anonymousPages.label")}
        className="form-item-required"
        style={{marginBottom: 0}}
      >
        <EnhancedTree
          tree={getFilteredTree(
            userMenu(t).filter(({path}) => path !== PATH_DATA_MANAGER).concat(superUserMenu(t)),
            "children",
            node => !node.isDivider
          )}
          childrenKey="children"
          idKey="path"
          nameKey="label"
          catIdKey="path"
          catNameKey="label"
          hiddenIdKeys={allNodes}
          getFilter={
            searchText =>
              ({label}) =>
                label && label.toLowerCase().indexOf(searchText.toLowerCase()) >= 0
          }
          isNameMultilanguage={false}
          unselectableKeys={allNodes}
          checkable
          checkStrictly
          checkedKeys={UserInterface ? UserInterface.AnonymousPages : []}
          onCheck={({checked}) => onChange({AnonymousPages: checked})}
          noPagination
          isRootIconLikeChildrenIcon
          icon="file"
        />
      </Form.Item>
    </Form>
  </Fragment>
};

export default compose(
  translate(),
  connect(mapStateToProps, mapDispatchToProps),
  Form.create({mapPropsToFields, onFieldsChange})
)(UserInterfaceForm);
