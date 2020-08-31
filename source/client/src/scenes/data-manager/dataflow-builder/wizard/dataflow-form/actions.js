import {getRequest} from "../../../../../middlewares/api/actions";
import {getAgencyNamesUrl} from "../../../../../constants/urls";

export const DATAFLOW_BUILDER_WIZARD_DATAFLOW_FORM_DATAFLOW_CHANGE = 'DATAFLOW_BUILDER_WIZARD_DATAFLOW_FORM_DATAFLOW_CHANGE';
export const DATAFLOW_BUILDER_WIZARD_DATAFLOW_FORM_AGENCIES_READ = 'DATAFLOW_BUILDER_WIZARD_DATAFLOW_FORM_AGENCIES_READ';

export const changeDataflowBuilderWizardDataflowForm = fields => ({
  type: DATAFLOW_BUILDER_WIZARD_DATAFLOW_FORM_DATAFLOW_CHANGE,
  fields
});

export const readDataflowBuilderWizardDataflowFormAgencies = allowedAgencies => ({
  ...getRequest(
    DATAFLOW_BUILDER_WIZARD_DATAFLOW_FORM_AGENCIES_READ,
    getAgencyNamesUrl()
  ),
  allowedAgencies
});

