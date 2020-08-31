import {
  DATAFLOW_BUILDER_WIZARD_LAYOUT_ANNOTATIONS_FORM_HIDE,
  DATAFLOW_BUILDER_WIZARD_LAYOUT_ANNOTATIONS_FORM_SHOW,
  DATAFLOW_BUILDER_WIZARD_LAYOUT_ANNOTATIONS_FORM_SUBMIT,
  DATAFLOW_BUILDER_WIZARD_LAYOUT_ANNOTATIONS_ITEMS_PAGE_READ,
  DATAFLOW_BUILDER_WIZARD_LAYOUT_ANNOTATIONS_ITEMS_PAGE_RESET
} from "./actions";
import {REQUEST_SUCCESS} from "../../../../../middlewares/api/actions";
import {
  CODELIST_ORDER_ANNOTATION_KEY,
  getItemSchemeFromSdmxJsonFactory,
  getSdmxStructuresFromSdmxJson,
  SDMX_JSON_CODELIST_ITEMS_KEY
} from "../../../../../utils/sdmxJson";
import {getCurrentNodeConfig} from "../../../../../middlewares/current-node-config/middleware";

const dataflowBuilderWizardLayoutAnnotationsReducer = (
  state = {
    isFormVisible: false,
    itemsPage: null
  },
  action
) => {
  switch (action.type) {
    case DATAFLOW_BUILDER_WIZARD_LAYOUT_ANNOTATIONS_FORM_SHOW:
      return {
        ...state,
        isFormVisible: true
      };
    case DATAFLOW_BUILDER_WIZARD_LAYOUT_ANNOTATIONS_FORM_HIDE:
    case DATAFLOW_BUILDER_WIZARD_LAYOUT_ANNOTATIONS_FORM_SUBMIT:
      return {
        ...state,
        isFormVisible: false
      };
    case DATAFLOW_BUILDER_WIZARD_LAYOUT_ANNOTATIONS_ITEMS_PAGE_RESET:
      return {
        ...state,
        itemsPage: null,
      };
    case REQUEST_SUCCESS:
      switch (action.label) {
        case DATAFLOW_BUILDER_WIZARD_LAYOUT_ANNOTATIONS_ITEMS_PAGE_READ:
          return {
            ...state,
            itemsPage: getItemSchemeFromSdmxJsonFactory(
              SDMX_JSON_CODELIST_ITEMS_KEY,
              getCurrentNodeConfig(action).annotations,
              CODELIST_ORDER_ANNOTATION_KEY
            )(getSdmxStructuresFromSdmxJson(action.response)[0]).codes || []
          };
        default:
          return state;
      }
    default:
      return state;
  }
};

export default dataflowBuilderWizardLayoutAnnotationsReducer;