import {
  hideDataflowBuilderWizardLayoutAnnotationsForm,
  readDataflowBuilderWizardLayoutAnnotationsItemsPage,
  resetDataflowBuilderWizardLayoutAnnotationsForm,
  resetDataflowBuilderWizardLayoutAnnotationsItemsPage,
  showDataflowBuilderWizardLayoutAnnotationsForm,
  submitDataflowBuilderWizardLayoutAnnotationsForm
} from "./actions";
import {connect} from "react-redux";
import {compose} from "redux";
import {translate} from 'react-i18next';
import {readDataflowBuilderWizardDsdForLayoutAnnotations} from "../actions";
import Layout from "../../../../../components/annotations-form/Layout";

const mapStateToProps = state => ({
  dataflow: state.scenes.dataManager.dataflowBuilder.shared.dataflow,
  isFormVisible: state.scenes.dataManager.dataflowBuilder.components.wizard.components.layoutAnnotations.isFormVisible,
  dsdForLayoutAnnotations: state.scenes.dataManager.dataflowBuilder.shared.dsdForLayoutAnnotations,
  itemsPage: state.scenes.dataManager.dataflowBuilder.components.wizard.components.layoutAnnotations.itemsPage,
});

const mapDispatchToProps = dispatch => ({
  onFormShow: () => dispatch(showDataflowBuilderWizardLayoutAnnotationsForm()),
  onFormHide: () => dispatch(hideDataflowBuilderWizardLayoutAnnotationsForm()),
  onFormSubmit: annotations => dispatch(submitDataflowBuilderWizardLayoutAnnotationsForm(annotations)),
  onFormReset: () => dispatch(resetDataflowBuilderWizardLayoutAnnotationsForm()),
  fetchDsdForLayoutAnnotations: dsdTriplet => dispatch(readDataflowBuilderWizardDsdForLayoutAnnotations(dsdTriplet)),
  fetchItemsPage: ({
                     codelistTriplet,
                     language,
                     pageNum,
                     pageSize,
                     searchText,
                     filters,
                     sortCol,
                     sortByDesc
                   }) => dispatch(readDataflowBuilderWizardLayoutAnnotationsItemsPage({
    codelistTriplet,
    language,
    pageNum,
    pageSize,
    searchText,
    filters,
    sortCol,
    sortByDesc
  })),
  resetItemsPage: () => dispatch(resetDataflowBuilderWizardLayoutAnnotationsItemsPage())
});

export default compose(
  translate(),
  connect(mapStateToProps, mapDispatchToProps)
)(Layout);