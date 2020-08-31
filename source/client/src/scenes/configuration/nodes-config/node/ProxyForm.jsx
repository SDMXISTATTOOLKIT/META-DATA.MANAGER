import React, {Fragment} from 'react';
import {translate} from 'react-i18next';
import {Checkbox, Col, Form, Input, Row} from "antd";
import {compose} from "redux";
import _ from "lodash";
import {normalizeInt} from "../../../../utils/normalizers";
import {GUTTER_MD} from "../../../../styles/constants";

const mapPropsToFields = ({Proxy}) => ({
  Enabled: Form.createFormField({value: Proxy ? Proxy.Enabled : null}),
  Address: Form.createFormField({value: Proxy && Proxy.Address ? Proxy.Address : ""}),
  Port: Form.createFormField({value: Proxy ? Proxy.Port : null}),
  Username: Form.createFormField({value: Proxy && Proxy.Username ? Proxy.Username : ""}),
  Password: Form.createFormField({value: Proxy && Proxy.Password ? Proxy.Password : ""})
});

const onFieldsChange = (props, fields) => props.onChange(_.mapValues(fields, ({value}) => value));

const ProxyForm = ({
                     t,
                     form
                   }) =>
  <Form>
    <Row type="flex" justify="start" align="middle" gutter={GUTTER_MD} style={{marginBottom: 0}}>
      <Col style={{color: 'rgba(0, 0, 0, 0.85)'}}>
        {t("data.nodesConfig.node.proxy.enabled.label") + ' :'}
      </Col>
      <Col>
        <Form.Item>
          {form.getFieldDecorator("Enabled", {valuePropName: 'checked'})(
            <Checkbox/>
          )}
        </Form.Item>
      </Col>
    </Row>
    {form.getFieldValue('Enabled') && (
      <Fragment>
        <Form.Item
          className="form-item-required"
          label={t('data.nodesConfig.node.proxy.address.label')}
          style={{marginBottom: 0}}
        >
          {form.getFieldDecorator('Address')(<Input/>)}
        </Form.Item>
        <Form.Item
          className="form-item-required"
          label={t('data.nodesConfig.node.proxy.port.label')}
          style={{marginBottom: 0}}
        >
          {form.getFieldDecorator('Port', {normalize: normalizeInt})(<Input/>)}
        </Form.Item>
        <Form.Item
          label={t('data.nodesConfig.node.proxy.username.label')}
          style={{marginBottom: 0}}
        >
          {form.getFieldDecorator('Username')(<Input/>)}
        </Form.Item>
        <Form.Item
          label={t('data.nodesConfig.node.proxy.password.label')}
          style={{marginBottom: 0}}
        >
          {form.getFieldDecorator('Password')(<Input/>)}
        </Form.Item>
      </Fragment>
    )}
  </Form>;

export default compose(
  translate(),
  Form.create({mapPropsToFields, onFieldsChange})
)(ProxyForm);
