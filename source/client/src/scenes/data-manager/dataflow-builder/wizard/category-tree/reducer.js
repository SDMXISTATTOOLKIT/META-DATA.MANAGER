import {REQUEST_ERROR, REQUEST_START, REQUEST_SUCCESS} from '../../../../../middlewares/api/actions';
import {DATAFLOW_BUILDER_WIZARD_CATEGORY_TREE_CATEGORISATIONS_READ} from './actions';
import {
  CATEGORY_SCHEME_ORDER_ANNOTATION_KEY,
  getArtefactFromSdmxJsonStructure,
  getItemFromSdmxJsonStructure,
  getSdmxStructuresFromSdmxJson,
  SDMX_JSON_CATEGORY_SCHEME_LIST_KEY
} from '../../../../../utils/sdmxJson';
import {getMappedTree} from "../../../../../utils/tree";
import {getCurrentNodeConfig} from "../../../../../middlewares/current-node-config/middleware";
import {getOrderedChildren} from "../../../../../utils/artefacts";
import {DATAFLOW_BUILDER_WIZARD_HIDE} from "../actions";

const dataflowBuilderWizardCategoryTreeReducer = (
  state = {
    categorySchemes: null
  },
  action
) => {
  switch (action.type) {
    case REQUEST_START:
      switch (action.label) {
        case DATAFLOW_BUILDER_WIZARD_CATEGORY_TREE_CATEGORISATIONS_READ:
          return {
            ...state,
            categorySchemes: null
          };
        case DATAFLOW_BUILDER_WIZARD_HIDE:
          return {
            ...state,
            categorySchemes: null
          };
        default:
          return state;
      }
    case REQUEST_ERROR:
      switch (action.label) {
        case DATAFLOW_BUILDER_WIZARD_CATEGORY_TREE_CATEGORISATIONS_READ:
          return {
            ...state,
            categorySchemes: []
          };
        default:
          return state;
      }
    case REQUEST_SUCCESS:
      switch (action.label) {
        case DATAFLOW_BUILDER_WIZARD_CATEGORY_TREE_CATEGORISATIONS_READ:
          const categorySchemes =
            (getSdmxStructuresFromSdmxJson(action.response, SDMX_JSON_CATEGORY_SCHEME_LIST_KEY) || [])
              .map(artefact => {
                let categoryScheme = getArtefactFromSdmxJsonStructure(artefact, getCurrentNodeConfig(action).annotations);
                categoryScheme.categories = categoryScheme.categories
                  ? getMappedTree(
                    categoryScheme.categories,
                    "categories",
                    node => getItemFromSdmxJsonStructure(node, getCurrentNodeConfig(action).annotations, CATEGORY_SCHEME_ORDER_ANNOTATION_KEY)
                  )
                  : [];

                return getMappedTree(
                  [categoryScheme],
                  "categories",
                  node => {
                    node.categories = getOrderedChildren(
                      node.categories,
                      node.id,
                      action.lang,
                      getCurrentNodeConfig(action).annotations[CATEGORY_SCHEME_ORDER_ANNOTATION_KEY]
                    );
                    return node
                  }
                )[0];
              });

          return {
            ...state,
            categorySchemes: categorySchemes
          };
        default:
          return state;
      }
    default:
      return state;
  }
};

export default dataflowBuilderWizardCategoryTreeReducer;
