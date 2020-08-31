import {postRequest} from "../../../../../middlewares/api/actions";
import {getPaginatedCodelistUrl} from "../../../../../constants/urls";

export const DATAFLOW_BUILDER_WIZARD_LAYOUT_ANNOTATIONS_FORM_SHOW = "DATAFLOW_BUILDER_WIZARD_LAYOUT_ANNOTATIONS_FORM_SHOW";
export const DATAFLOW_BUILDER_WIZARD_LAYOUT_ANNOTATIONS_FORM_HIDE = "DATAFLOW_BUILDER_WIZARD_LAYOUT_ANNOTATIONS_FORM_HIDE";
export const DATAFLOW_BUILDER_WIZARD_LAYOUT_ANNOTATIONS_FORM_SUBMIT = "DATAFLOW_BUILDER_WIZARD_LAYOUT_ANNOTATIONS_FORM_SUBMIT";
export const DATAFLOW_BUILDER_WIZARD_LAYOUT_ANNOTATIONS_FORM_RESET = "DATAFLOW_BUILDER_WIZARD_LAYOUT_ANNOTATIONS_FORM_RESET";
export const DATAFLOW_BUILDER_WIZARD_LAYOUT_ANNOTATIONS_ITEMS_PAGE_READ = "DATAFLOW_BUILDER_WIZARD_LAYOUT_ANNOTATIONS_ITEMS_PAGE_READ";
export const DATAFLOW_BUILDER_WIZARD_LAYOUT_ANNOTATIONS_ITEMS_PAGE_RESET = "DATAFLOW_BUILDER_WIZARD_LAYOUT_ANNOTATIONS_ITEMS_PAGE_RESET";

export const showDataflowBuilderWizardLayoutAnnotationsForm = () => ({
  type: DATAFLOW_BUILDER_WIZARD_LAYOUT_ANNOTATIONS_FORM_SHOW
});

export const hideDataflowBuilderWizardLayoutAnnotationsForm = () => ({
  type: DATAFLOW_BUILDER_WIZARD_LAYOUT_ANNOTATIONS_FORM_HIDE
});

export const submitDataflowBuilderWizardLayoutAnnotationsForm = annotations => ({
  type: DATAFLOW_BUILDER_WIZARD_LAYOUT_ANNOTATIONS_FORM_SUBMIT,
  annotations
});

export const resetDataflowBuilderWizardLayoutAnnotationsForm = () => ({
  type: DATAFLOW_BUILDER_WIZARD_LAYOUT_ANNOTATIONS_FORM_RESET
});

export const readDataflowBuilderWizardLayoutAnnotationsItemsPage = ({
                                                                      codelistTriplet,
                                                                      language,
                                                                      pageNum,
                                                                      pageSize,
                                                                      searchText,
                                                                      filters,
                                                                      sortCol,
                                                                      sortByDesc
                                                                    }) =>
  postRequest(
    DATAFLOW_BUILDER_WIZARD_LAYOUT_ANNOTATIONS_ITEMS_PAGE_READ,
    getPaginatedCodelistUrl(),
    ({
      Id: codelistTriplet.id,
      AgencyId: codelistTriplet.agencyID,
      Version: codelistTriplet.version,
      Lang: language,
      PageNum: pageNum,
      PageSize: pageSize,
      AllSearch: searchText,
      CodeSearch: filters.id ? filters.id : undefined,
      NameSearch: filters.name ? filters.name : undefined,
      ParentSearch: filters.parent ? filters.parent : undefined,
      SortColumn: sortCol ? sortCol : undefined,
      SortDesc: sortByDesc ? sortByDesc : undefined,
      rebuildDb: false
    })
  );

export const resetDataflowBuilderWizardLayoutAnnotationsItemsPage = () => ({
  type: DATAFLOW_BUILDER_WIZARD_LAYOUT_ANNOTATIONS_ITEMS_PAGE_RESET
});