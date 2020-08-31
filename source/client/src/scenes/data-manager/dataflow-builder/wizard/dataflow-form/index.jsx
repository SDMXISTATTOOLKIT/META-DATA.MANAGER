import React from 'react';
import ArtefactForm, {
  ARTEFACT_FORM_MODE_CREATE,
  ARTEFACT_FORM_MODE_EDIT,
  ARTEFACT_FORM_MODE_READ
} from '../../../../../components/artefact-form';
import {connect} from 'react-redux';
import {Card} from 'antd';
import {
  changeDataflowBuilderWizardDataflowForm,
  readDataflowBuilderWizardDataflowFormAgencies,

} from './actions';
import Call from "../../../../../hocs/call";
import {getArtefactTripletFromUrn} from "../../../../../utils/sdmxJson";
import {readDataflowBuilderWizardDsdForLayoutAnnotations} from "../actions";

const mapStateToProps = state => ({
  dataflowTriplet: state.scenes.dataManager.dataflowBuilder.shared.dataflowTriplet,
  dataflow: state.scenes.dataManager.dataflowBuilder.shared.dataflow,
  agencies: state.scenes.dataManager.dataflowBuilder.shared.agencies,
  permissions: state.app.user.permissions,
  dsdForLayoutAnnotations: state.scenes.dataManager.dataflowBuilder.shared.dsdForLayoutAnnotations
});

const mapDispatchToProps = dispatch => ({
  onChange: fields => dispatch(changeDataflowBuilderWizardDataflowForm(fields)),
  fetchAgencies: allowedAgencies => dispatch(readDataflowBuilderWizardDataflowFormAgencies(allowedAgencies)),
  fetchDsdForLayoutAnnotations: dsdTriplet => dispatch(readDataflowBuilderWizardDsdForLayoutAnnotations(dsdTriplet))
});

const DataflowBuilderWizardDataflowForm = ({
                                             t,
                                             permissions,
                                             dataflowTriplet,
                                             dataflow,
                                             agencies,
                                             onChange,
                                             fetchAgencies,
                                             disabled,
                                             dsdForLayoutAnnotations,
                                             fetchDsdForLayoutAnnotations
                                           }) =>
  <Card type="inner">
    <Call cb={fetchAgencies} cbParam={permissions ? permissions.agencies : undefined}>
      <Call
        cb={fetchDsdForLayoutAnnotations}
        cbParam={dataflow && dataflow.structure ? getArtefactTripletFromUrn(dataflow.structure) : null}
        disabled={!dataflow || !dataflow.structure}
      >
        <ArtefactForm
          artefact={dataflow}
          onChange={onChange}
          mode={
            dataflowTriplet !== null
              ? (disabled
                ? ARTEFACT_FORM_MODE_READ
                : ARTEFACT_FORM_MODE_EDIT
              )
              : ARTEFACT_FORM_MODE_CREATE
          }
          isFinalDisabled
          agencies={agencies}
        />
      </Call>
    </Call>
  </Card>;

export default connect(mapStateToProps, mapDispatchToProps)(DataflowBuilderWizardDataflowForm);
