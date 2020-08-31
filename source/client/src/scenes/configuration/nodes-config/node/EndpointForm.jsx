import React from 'react';
import {translate} from 'react-i18next';
import {Checkbox, Col, Form, Input, Row, Select} from "antd";
import {compose} from "redux";
import _ from "lodash";
import PingIcon from "../../../../components/ping-icon";
import {COLOR_FONT_DISABLED, GUTTER_MD, MARGIN_SM} from "../../../../styles/constants";
import {connect} from "react-redux";
import {checkEndpointDMUrl, checkEndpointMAUrl, checkEndpointMDUrl, checkEndpointNSIUrl} from "../actions";

export const NODES_CONFIG_NODE_ENDPOINT_PING_ARTEFACT_CATEGORY_SCHEME = "CategoryScheme";
export const NODES_CONFIG_NODE_ENDPOINT_PING_ARTEFACT_CODELIST = "Codelist";
export const NODES_CONFIG_NODE_ENDPOINT_PING_ARTEFACT_CONCEPT_SCHEME = "ConceptScheme";

export const NODES_CONFIG_NODE_ENDPOINT_NSI_ENDPOINT_TYPE_SOAP = 'SOAP';
export const NODES_CONFIG_NODE_ENDPOINT_NSI_ENDPOINT_TYPE_REST = 'REST';

const mapPropsToFields = ({node}) => ({
  NSIEndpoint: Form.createFormField({value: node.Endpoint && node.Endpoint.NSIEndpoint ? node.Endpoint.NSIEndpoint : ""}),
  NSIReadOnlyUsername: Form.createFormField({value: node.Endpoint && node.Endpoint.NSIReadOnlyUsername ? node.Endpoint.NSIReadOnlyUsername : ""}),
  NSIReadOnlyPassword: Form.createFormField({value: node.Endpoint && node.Endpoint.NSIReadOnlyPassword ? node.Endpoint.NSIReadOnlyPassword : ""}),
  InitialWSDL: Form.createFormField({value: node.Endpoint && node.Endpoint.InitialWSDL ? node.Endpoint.InitialWSDL : ""}),
  PingArtefact: Form.createFormField({value: node.Endpoint ? node.Endpoint.PingArtefact : null}),
  NSIEndpointType: Form.createFormField({value: node.Endpoint ? node.Endpoint.NSIEndpointType : null}),
  MAEndpoint: Form.createFormField({value: node.Endpoint && node.Endpoint.MAEndpoint ? node.Endpoint.MAEndpoint : ""}),
  DMEndpoint: Form.createFormField({value: node.Endpoint && node.Endpoint.DMEndpoint ? node.Endpoint.DMEndpoint : ""}),
  LDAPEndpoint: Form.createFormField({value: node.Endpoint && node.Endpoint.LDAPEndpoint ? node.Endpoint.LDAPEndpoint : ""}),
  ActiveDirectoryEndpoint: Form.createFormField({value: node.Endpoint && node.Endpoint.ActiveDirectoryEndpoint ? node.Endpoint.ActiveDirectoryEndpoint : ""}),
  DataExplorerBaseURL: Form.createFormField({value: node.Endpoint && node.Endpoint.DataExplorerBaseURL ? node.Endpoint.DataExplorerBaseURL : ""}),
  MetadataBaseURL: Form.createFormField({value: node.Endpoint && node.Endpoint.MetadataBaseURL ? node.Endpoint.MetadataBaseURL : ""}),
  SupportAllCompleteStubs: Form.createFormField({value: node.Endpoint && node.Endpoint.SupportAllCompleteStubs ? node.Endpoint.SupportAllCompleteStubs : null})
});

const onFieldsChange = (props, fields) => props.onChange(_.mapValues(fields, ({value}) => value));

const mapDispatchToProps = dispatch => ({
  onPingNSI: (nodeIndex, config) => dispatch(checkEndpointNSIUrl(nodeIndex, config)),
  onPingMA: (nodeIndex, config) => dispatch(checkEndpointMAUrl(nodeIndex, config)),
  onPingDM: (nodeIndex, config) => dispatch(checkEndpointDMUrl(nodeIndex, config)),
  onPingMD: (nodeIndex, metadataApiUrl) => dispatch(checkEndpointMDUrl(nodeIndex, metadataApiUrl))
});

const EndpointForm = ({
                        t,
                        form,
                        node,
                        nodeIndex,
                        onPingNSI,
                        onPingMA,
                        onPingDM,
                        onPingMD
                      }) => {
  const PingAddOn = ({isOk, onClick, disabled}) =>
    <div>
      <span
        onClick={onClick}
        style={disabled ? {color: COLOR_FONT_DISABLED, cursor: "not-allowed"} : {cursor: "pointer"}}
      >
        Ping
      </span>
      {isOk !== null && (
        <div style={{display: "inline-block", marginLeft: MARGIN_SM}}>
          <PingIcon isOk={isOk}/>
        </div>
      )}
    </div>;

  return (
    <Form>
      <Form.Item
        className="form-item-required"
        label={t('data.nodesConfig.endpoint.nsiEndpointType.label')}
        style={{marginBottom: 0}}
      >
        {form.getFieldDecorator('NSIEndpointType')(
          <Select
            showSearch
            filterOption={(inputValue, {props}) =>
              props.title.toLowerCase().includes(inputValue.toLowerCase())
            }
          >
            <Select.Option
              value={NODES_CONFIG_NODE_ENDPOINT_NSI_ENDPOINT_TYPE_SOAP}
              title={t('data.nodesConfig.endpoint.nsiEndpointType.options.soap.label')}
            >
              {t('data.nodesConfig.endpoint.nsiEndpointType.options.soap.label')}
            </Select.Option>
            <Select.Option
              value={NODES_CONFIG_NODE_ENDPOINT_NSI_ENDPOINT_TYPE_REST}
              title={t('data.nodesConfig.endpoint.nsiEndpointType.options.rest.label')}
            >
              {t('data.nodesConfig.endpoint.nsiEndpointType.options.rest.label')}
            </Select.Option>
          </Select>
        )}
      </Form.Item>
      <Form.Item
        className="form-item-required"
        label={t('data.nodesConfig.endpoint.nsiEndpoint.label')}
        style={{marginBottom: 0}}
      >
        {form.getFieldDecorator('NSIEndpoint')(
          <Input
            placeholder={t("data.nodesConfig.endpoint.nsiEndpoint.placeholder")}
            addonAfter={
              <PingAddOn
                isOk={node.isNSIPingOk}
                onClick={() => onPingNSI(
                  nodeIndex,
                  {
                    EndPointUrl: node.Endpoint.NSIEndpoint,
                    NSIEndpointType: node.Endpoint.NSIEndpointType,
                    PingArtefact: node.Endpoint.PingArtefact,
                    NSIReadOnlyUsername: node.Endpoint.NSIReadOnlyUsername,
                    NSIReadOnlyPassword: node.Endpoint.NSIReadOnlyPassword,
                    Enabled: node.Proxy.Enabled,
                    Address: node.Proxy.Address,
                    Port: node.Proxy.Port,
                    Username: node.Proxy.Username,
                    Password: node.Proxy.Password
                  })}
                disabled={
                  !node.Endpoint.NSIEndpoint || node.Endpoint.NSIEndpoint.length === 0 ||
                  !node.Endpoint.NSIEndpointType ||
                  !node.Endpoint.PingArtefact ||
                  (node.Endpoint.NSIReadOnlyUsername && !node.Endpoint.NSIReadOnlyPassword) ||
                  (!node.Endpoint.NSIReadOnlyUsername && node.Endpoint.NSIReadOnlyPassword) ||
                  (
                    node.Proxy.Enabled && (
                      !node.Proxy.Address || !node.Proxy.Port ||
                      ((node.Proxy.Username && !node.Proxy.Password) || (!node.Proxy.Username && node.Proxy.Password))
                    )
                  )
                }
              />
            }
          />
        )}
      </Form.Item>
      {
        form.getFieldValue("NSIEndpointType") === NODES_CONFIG_NODE_ENDPOINT_NSI_ENDPOINT_TYPE_REST && (
          <Row type="flex" justify="start" align="middle" gutter={GUTTER_MD} style={{marginBottom: 0}}>
            <Col style={{color: 'rgba(0, 0, 0, 0.85)'}}>
              {t("data.nodesConfig.endpoint.supportAllCompleteStubs.label") + ' :'}
            </Col>
            <Col>
              <Form.Item>
                {form.getFieldDecorator("SupportAllCompleteStubs", {valuePropName: 'checked'})(
                  <Checkbox/>
                )}
              </Form.Item>
            </Col>
          </Row>
        )
      }
      <Form.Item
        label={t('data.nodesConfig.endpoint.nsiReadOnlyUsername.label')}
        style={{marginBottom: 0}}
      >
        {form.getFieldDecorator('NSIReadOnlyUsername')(<Input/>)}
      </Form.Item>
      <Form.Item
        label={t('data.nodesConfig.endpoint.nsiReadOnlyPassword.label')}
        style={{marginBottom: 0}}
      >
        {form.getFieldDecorator('NSIReadOnlyPassword')(<Input type={"password"} autoComplete="new-password"/>)}
      </Form.Item>
      <Form.Item
        label={t('data.nodesConfig.endpoint.initialWsdl.label')}
        style={{marginBottom: 0}}
      >
        {form.getFieldDecorator('InitialWSDL')(<Input/>)}
      </Form.Item>
      <Form.Item
        className="form-item-required"
        label={t('data.nodesConfig.endpoint.pingArtefact.label')}
        style={{marginBottom: 0}}
      >
        {form.getFieldDecorator('PingArtefact')(
          <Select
            showSearch
            filterOption={(inputValue, {props}) =>
              props.title.toLowerCase().includes(inputValue.toLowerCase())
            }
          >
            <Select.Option
              value={NODES_CONFIG_NODE_ENDPOINT_PING_ARTEFACT_CATEGORY_SCHEME}
              title={t('data.nodesConfig.endpoint.pingArtefact.options.categoryScheme.label')}
            >
              {t('data.nodesConfig.endpoint.pingArtefact.options.categoryScheme.label')}
            </Select.Option>
            <Select.Option
              value={NODES_CONFIG_NODE_ENDPOINT_PING_ARTEFACT_CODELIST}
              title={t('data.nodesConfig.endpoint.pingArtefact.options.codelist.label')}
            >
              {t('data.nodesConfig.endpoint.pingArtefact.options.codelist.label')}
            </Select.Option>
            <Select.Option
              value={NODES_CONFIG_NODE_ENDPOINT_PING_ARTEFACT_CONCEPT_SCHEME}
              title={t('data.nodesConfig.endpoint.pingArtefact.options.conceptScheme.label')}
            >
              {t('data.nodesConfig.endpoint.pingArtefact.options.conceptScheme.label')}
            </Select.Option>
          </Select>
        )}
      </Form.Item>
      <Form.Item
        label={t('data.nodesConfig.endpoint.maEndpoint.label')}
        style={{marginBottom: 0}}
      >
        {form.getFieldDecorator('MAEndpoint')(
          <Input
            placeholder={t("data.nodesConfig.endpoint.maEndpoint.placeholder")}
            addonAfter={
              <PingAddOn
                isOk={node.isMAPingOk}
                onClick={() => onPingMA(
                  nodeIndex,
                  {
                    EndPointUrl: node.Endpoint.MAEndpoint,
                    PingArtefact: node.Endpoint.PingArtefact,
                    Enabled: node.Proxy.Enabled,
                    Address: node.Proxy.Address,
                    Port: node.Proxy.Port,
                    Username: node.Proxy.Username,
                    Password: node.Proxy.Password
                  })}
                disabled={
                  !node.Endpoint.MAEndpoint || node.Endpoint.MAEndpoint.length === 0 ||
                  !node.Endpoint.PingArtefact ||
                  (
                    node.Proxy.Enabled && (
                      !node.Proxy.Address || !node.Proxy.Port ||
                      ((node.Proxy.Username && !node.Proxy.Password) || (!node.Proxy.Username && node.Proxy.Password))
                    )
                  )
                }
              />
            }
          />
        )}
      </Form.Item>
      <Form.Item
        label={t('data.nodesConfig.endpoint.dmEndpoint.label')}
        style={{marginBottom: 0}}
      >
        {form.getFieldDecorator('DMEndpoint')(
          <Input
            placeholder={t("data.nodesConfig.endpoint.dmEndpoint.placeholder")}
            addonAfter={
              <PingAddOn
                isOk={node.isDMPingOk}
                onClick={() => onPingDM(
                  nodeIndex,
                  {
                    EndPointUrl: node.Endpoint.DMEndpoint,
                    Enabled: node.Proxy.Enabled,
                    Address: node.Proxy.Address,
                    Port: node.Proxy.Port,
                    Username: node.Proxy.Username,
                    Password: node.Proxy.Password
                  })}
                disabled={
                  !node.Endpoint.DMEndpoint || node.Endpoint.DMEndpoint.length === 0 ||
                  (
                    node.Proxy.Enabled && (
                      !node.Proxy.Address || !node.Proxy.Port ||
                      ((node.Proxy.Username && !node.Proxy.Password) || (!node.Proxy.Username && node.Proxy.Password))
                    )
                  )
                }
              />
            }
          />
        )}
      </Form.Item>
      <Form.Item
        className="not-implemented"
        label={t('data.nodesConfig.endpoint.ldapEndpoint.label')}
        style={{marginBottom: 0}}
      >
        {form.getFieldDecorator('LDAPEndpoint')(<Input/>)}
      </Form.Item>
      <Form.Item
        className="not-implemented"
        label={t('data.nodesConfig.endpoint.activeDirectoryEndpoint.label')}
        style={{marginBottom: 0}}
      >
        {form.getFieldDecorator('ActiveDirectoryEndpoint')(<Input/>)}
      </Form.Item>
      <Form.Item
        label={t('data.nodesConfig.endpoint.dataExplorerBaseUrl.label')}
        style={{marginBottom: 0}}
      >
        {form.getFieldDecorator('DataExplorerBaseURL')(<Input/>)}
      </Form.Item>
      <Form.Item
        label={t('data.nodesConfig.endpoint.metadataBaseURL.label')}
        style={{marginBottom: 0}}
      >
        {form.getFieldDecorator('MetadataBaseURL')(
          <Input
            placeholder={t("data.nodesConfig.endpoint.metadataBaseURL.placeholder")}
            addonAfter={
              <PingAddOn
                isOk={node.isMDPingOk}
                onClick={() => onPingMD(nodeIndex, node.Endpoint.MetadataBaseURL)}
                disabled={!node.Endpoint.MetadataBaseURL || node.Endpoint.MetadataBaseURL.length === 0}
              />
            }
          />
        )}
      </Form.Item>
    </Form>
  );
};

export default compose(
  translate(),
  connect(null, mapDispatchToProps),
  Form.create({mapPropsToFields, onFieldsChange}),
)(EndpointForm);
