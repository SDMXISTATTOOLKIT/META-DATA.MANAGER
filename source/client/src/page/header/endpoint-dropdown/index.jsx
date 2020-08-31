import React, {Fragment} from 'react';
import {connect} from 'react-redux';
import {Button, Dropdown, Icon, Menu} from 'antd';
import {setAppEndpoint} from '../../../reducers/app/actions';
import {pingNode} from './actions';
import {MARGIN_XS} from '../../../styles/constants';
import PingIcon from "../../../components/ping-icon";

const mapStateToProps = state => ({
  endpoints: state.config.nodes,
  endpointId: state.app.endpointId,
  isEndpointAvailable: state.app.isEndpointAvailable
});

const mapDispatchToProps = dispatch => ({
  onEndpointSet: endpointId => dispatch(setAppEndpoint(endpointId)),
  onNodePing: () => dispatch(pingNode())
});

const PageHeaderEndpointDropdown = ({
                                      endpoints,
                                      endpointId,
                                      isEndpointAvailable,
                                      onEndpointSet,
                                      onNodePing
                                    }) =>
  endpoints && endpoints.length > 0 && endpointId
    ? (
      <Fragment>
        <Dropdown
          trigger={['hover']}
          overlay={
            <Menu
              onClick={
                ({key}) => {
                  window.open('./#', '_self');
                  onEndpointSet(key);
                }
              }
            >
              {
                endpoints
                  .map(endpoint =>
                    <Menu.Item key={endpoint.general.id}>
                      <a>{endpoint.general.name} ({endpoint.general.id})</a>
                    </Menu.Item>
                  )
              }
            </Menu>
          }
        >
          <Button htmlType="button">
            <PingIcon isOk={isEndpointAvailable}/>
            {endpoints.filter(endpoint => endpoint.general.id === endpointId)[0].general.name}
            <Icon type="down"/>
          </Button>
        </Dropdown>
        <Button icon="sync" style={{marginLeft: MARGIN_XS}} onClick={onNodePing}/>
      </Fragment>
    )
    : null;

export default connect(mapStateToProps, mapDispatchToProps)(PageHeaderEndpointDropdown);
