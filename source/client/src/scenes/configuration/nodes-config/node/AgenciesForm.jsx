import React from 'react';
import {translate} from 'react-i18next';
import {Form} from 'antd';
import {compose} from "redux";
import FormList from "../../../../components/form-list";
import AgencyForm from "./AgencyForm";
import {checkNodesConfigNodeAgencyAssignedToAnyUser} from "../actions";
import {connect} from "react-redux";

const mapStateToProps = state => ({
  nodeId: state.app.endpointId
});

const mapDispatchToProps = dispatch => ({
  onCheckAgencyAssignedToAnyUser: (agencyCode, nodeCode, onSuccess) =>
    dispatch(checkNodesConfigNodeAgencyAssignedToAnyUser(agencyCode, nodeCode, onSuccess))
});

const AgenciesForm = ({
                        t,
                        nodeId,
                        Agencies,
                        onChange,
                        onCheckAgencyAssignedToAnyUser
                      }) =>
  <Form.Item
    label={t('data.nodesConfig.agencies.label')}
  >
    <FormList
      compact
      values={Agencies}
      Component={AgencyForm}
      newItem={{
        ID: null,
        Name: null
      }}
      onChange={newAgencies => {
        if (newAgencies.length < Agencies.length) {
          const deletedAgency =
            Agencies.find(oldAgency =>
              !newAgencies.find(newAgency => newAgency.Id === oldAgency.Id)
            );
          onCheckAgencyAssignedToAnyUser(deletedAgency.Id, nodeId, () => onChange(newAgencies));
        } else {
          onChange(newAgencies);
        }
      }}
      addItemLabel={t('scenes.configuration.nodesConfig.agencies.agencies.addButton.title')}
      removeItemLabel={t('scenes.configuration.nodesConfig.agencies.agencies.removeButton.title')}
    />
  </Form.Item>;

export default compose(
  translate(),
  connect(mapStateToProps, mapDispatchToProps)
)(AgenciesForm);
