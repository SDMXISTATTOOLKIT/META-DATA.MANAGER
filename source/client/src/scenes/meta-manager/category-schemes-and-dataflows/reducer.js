import {REQUEST_ERROR, REQUEST_START, REQUEST_SUCCESS} from "../../../middlewares/api/actions";
import {
  CATEGORY_SCHEMES_AND_DATAFLOWS_DATAFLOW_CATEGORISATION_DELETE,
  CATEGORY_SCHEMES_AND_DATAFLOWS_DATAFLOW_CATEGORISE,
  CATEGORY_SCHEMES_AND_DATAFLOWS_TREE_READ
} from "./actions";
import {
  CATEGORY_SCHEME_ORDER_ANNOTATION_KEY,
  getArtefactFromSdmxJsonStructure,
  getItemFromSdmxJsonStructure,
  getSdmxStructuresFromSdmxJson,
  getTypeFromArtefact,
  getUrnFromArtefact,
  SDMX_JSON_CATEGORISATION_LIST_KEY,
  SDMX_JSON_CATEGORY_SCHEME_LIST_KEY,
  SDMX_JSON_DATAFLOW_LIST_KEY
} from "../../../utils/sdmxJson";
import {getCategorisedObjectsTree, getMappedTree, UNCATEGORIZED_CATEGORY_CODE} from "../../../utils/tree";
import {getCurrentNodeConfig} from "../../../middlewares/current-node-config/middleware";
import {getOrderedChildren} from "../../../utils/artefacts";
import {categorisationsSorterFactory} from "./utils";
import {APP_LANGUAGE_SET} from "../../../reducers/app/actions";

const categorySchemesAndDataflowsReducer = (
  state = {
    tree: null,
    categorisations: null
  },
  action
) => {
  switch (action.type) {
    case APP_LANGUAGE_SET:
      if (state.tree && state.categorisations) {
        const newTree = getMappedTree(state.tree, "categories", node => {
          if (node.urn && node.categories && node.categories.length) {
            return {
              ...node,
              categories: [
                ...node.categories.filter(({type}) => type !== "dataflow"),
                ...node.categories.filter(({type}) => type === "dataflow").sort((a, b) => {

                  return categorisationsSorterFactory(getCurrentNodeConfig(action).annotations.categorisationsOrder, action.payload.language)(
                    state.categorisations.find(({source, target}) => source === a.urn && target === node.urn),
                    state.categorisations.find(({source, target}) => source === b.urn && target === node.urn)
                  );
                })
              ]
            }
          } else {
            return node;
          }
        });

        return {
          ...state,
          tree: newTree
        };
      } else {
        return state;
      }
    case REQUEST_START:
      switch (action.label) {
        case CATEGORY_SCHEMES_AND_DATAFLOWS_TREE_READ:
          return {
            ...state,
            tree: null
          };
        default:
          return state;
      }
    case REQUEST_SUCCESS:
      switch (action.label) {
        case CATEGORY_SCHEMES_AND_DATAFLOWS_TREE_READ:

          const categorySchemes =
            (getSdmxStructuresFromSdmxJson(action.response[0], SDMX_JSON_CATEGORY_SCHEME_LIST_KEY) || [])
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

          const categorisations =
            (getSdmxStructuresFromSdmxJson(action.response[0], SDMX_JSON_CATEGORISATION_LIST_KEY) || [])
              .map(artefact => getArtefactFromSdmxJsonStructure(artefact, getCurrentNodeConfig(action).annotations));

          const dataflows =
            (getSdmxStructuresFromSdmxJson(action.response[1], SDMX_JSON_DATAFLOW_LIST_KEY) || [])
              .map(artefact => getArtefactFromSdmxJsonStructure(artefact, getCurrentNodeConfig(action).annotations));

          const test = (df, cat) => {

            if (cat)
              return df.categoriesUrns.filter(dfCatUrn =>
                dfCatUrn === getUrnFromArtefact(cat)
              ).length > 0;
            else
              return (df.categoriesUrns.length > 0);
          };

          let tree = getCategorisedObjectsTree(
            dataflows
              .map(dataflow => ({
                ...dataflow,
                categoriesUrns:
                  categorisations
                    .filter(({source}) => source === dataflow.urn)
                    .map(({target}) => target)
              })),
            categorySchemes,
            'categories',
            (a, b) => a.id - b.id,
            test,
            'id',
            'name',
            false
          );

          const root = [{
            isRoot: true,
            categories: tree
          }];

          tree = getMappedTree(root, "categories", node => {
            if (!node.isRoot && node.id !== UNCATEGORIZED_CATEGORY_CODE && getTypeFromArtefact(node) !== "categoryscheme" && node.categories) {
              node.categories = node.categories.map(cat => ({...cat, categoryUrn: getUrnFromArtefact(node)}));
            }
            if (!node.isRoot && node.id !== UNCATEGORIZED_CATEGORY_CODE) {
              node.urn = getUrnFromArtefact(node);
              node.type = getTypeFromArtefact(node);
            }
            return node
          })[0].categories;

          tree = getMappedTree(tree, "categories", node => {
            if (node.urn && node.categories && node.categories.length) {
              return {
                ...node,
                categories: [
                  ...node.categories.filter(({type}) => type !== "dataflow"),
                  ...node.categories.filter(({type}) => type === "dataflow").sort((a, b) => {

                    return categorisationsSorterFactory(getCurrentNodeConfig(action).annotations.categorisationsOrder, action.lang)(
                      categorisations.find(({source, target}) => source === a.urn && target === node.urn),
                      categorisations.find(({source, target}) => source === b.urn && target === node.urn)
                    );
                  })
                ]
              }
            } else {
              return node;
            }
          });

          return {
            ...state,
            tree: tree,
            categorisations: categorisations
          };
        case CATEGORY_SCHEMES_AND_DATAFLOWS_DATAFLOW_CATEGORISE:
          return {
            ...state,
            tree: null
          };
        case CATEGORY_SCHEMES_AND_DATAFLOWS_DATAFLOW_CATEGORISATION_DELETE:
          return {
            ...state,
            tree: null
          };
        default:
          return state;
      }
    case REQUEST_ERROR:
      switch (action.label) {
        default:
          return state;
      }
    default:
      return state;
  }
};

export default categorySchemesAndDataflowsReducer;
