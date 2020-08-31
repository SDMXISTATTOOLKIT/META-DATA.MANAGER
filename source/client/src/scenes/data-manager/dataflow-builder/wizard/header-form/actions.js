import { getRequest } from '../../../../../middlewares/api/actions';
import { getDataflowHeader } from '../../../../../constants/urls';

export const DATAFLOW_BUILDER_WIZARD_HEADER_FORM_SHOW = 'DATAFLOW_BUILDER_WIZARD_HEADER_FORM_SHOW';
export const DATAFLOW_BUILDER_WIZARD_HEADER_FORM_HIDE = 'DATAFLOW_BUILDER_WIZARD_HEADER_FORM_HIDE';
export const DATAFLOW_BUILDER_WIZARD_HEADER_FORM_CHANGE = 'DATAFLOW_BUILDER_WIZARD_HEADER_FORM_CHANGE';
export const DATAFLOW_BUILDER_WIZARD_HEADER_FORM_HEADER_READ = 'DATAFLOW_BUILDER_WIZARD_HEADER_FORM_HEADER_READ';

export const showDataflowBuilderWizardHeaderForm = () => ({
  type: DATAFLOW_BUILDER_WIZARD_HEADER_FORM_SHOW
});

export const hideDataflowBuilderWizardHeaderForm = () => ({
  type: DATAFLOW_BUILDER_WIZARD_HEADER_FORM_HIDE
});

export const changeDataflowBuilderWizardHeaderForm = fields => ({
  type: DATAFLOW_BUILDER_WIZARD_HEADER_FORM_CHANGE,
  fields
});

export const readDataflowBuilderWizardHeaderFormHeader = dataflowTriplet =>
  getRequest(
    DATAFLOW_BUILDER_WIZARD_HEADER_FORM_HEADER_READ,
    getDataflowHeader(dataflowTriplet)
  );
