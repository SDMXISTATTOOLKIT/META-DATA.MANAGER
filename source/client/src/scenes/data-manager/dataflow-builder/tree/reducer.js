import {
  DATAFLOW_BUILDER_TREE_CATEGORISED_DATAFLOWS_READ,
  DATAFLOW_BUILDER_TREE_HIDE,
  DATAFLOW_BUILDER_TREE_SHOW
} from './actions';
import {REQUEST_ERROR, REQUEST_START, REQUEST_SUCCESS} from '../../../../middlewares/api/actions';
import {getCategorisedObjectsTree, getMappedTree} from '../../../../utils/tree';
import {
  CATEGORY_SCHEME_ORDER_ANNOTATION_KEY,
  getArtefactFromSdmxJsonStructure,
  getItemFromSdmxJsonStructure,
  getSdmxStructuresFromSdmxJson,
  getUrnFromArtefact,
  SDMX_JSON_CATEGORISATION_LIST_KEY,
  SDMX_JSON_CATEGORY_SCHEME_LIST_KEY,
  SDMX_JSON_DATAFLOW_LIST_KEY
} from '../../../../utils/sdmxJson';
import {getCurrentNodeConfig} from "../../../../middlewares/current-node-config/middleware";
import {getOrderedChildren} from "../../../../utils/artefacts";

const dataflowBuilderTreeReducer = (
  state = {
    isVisible: false,
    dataflowTree: null
  },
  action
  ) => {
    switch (action.type) {
      case DATAFLOW_BUILDER_TREE_SHOW:
        return {
          ...state,
          isVisible: true
        };
      case DATAFLOW_BUILDER_TREE_HIDE:
        return {
          ...state,
          isVisible: false
        };
      case REQUEST_START:
        switch (action.label) {
          case DATAFLOW_BUILDER_TREE_CATEGORISED_DATAFLOWS_READ:
            return {
              ...state,
              dataflowTree: null
            };
          default:
            return state;
        }
      case REQUEST_ERROR:
        switch (action.label) {
          case DATAFLOW_BUILDER_TREE_CATEGORISED_DATAFLOWS_READ:
            return {
              ...state,
              dataflowTree: [],
            };
          default:
            return state;
        }
      case REQUEST_SUCCESS:
        switch (action.label) {
          case DATAFLOW_BUILDER_TREE_CATEGORISED_DATAFLOWS_READ:

            const sdmxDataflows =
              (getSdmxStructuresFromSdmxJson(action.response[2], SDMX_JSON_DATAFLOW_LIST_KEY) || [])
                .map(artefact => getArtefactFromSdmxJsonStructure(artefact, getCurrentNodeConfig(action).annotations));

            const ddbDataflows = action.response[0];

            const dataflows =
              sdmxDataflows.filter(({id, agencyID, version}) =>
                ddbDataflows.filter(({ID, Agency, Version}) =>
                  ID === id && Agency === agencyID && Version === version).length > 0);

            const categorisations =
              (getSdmxStructuresFromSdmxJson(action.response[1], SDMX_JSON_CATEGORISATION_LIST_KEY) || [])
                .map(artefact => getArtefactFromSdmxJsonStructure(artefact, getCurrentNodeConfig(action).annotations));

            const categorySchemes =
              (getSdmxStructuresFromSdmxJson(action.response[1], SDMX_JSON_CATEGORY_SCHEME_LIST_KEY) || [])
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

            const test = (df, cat) => {

              if (cat)
                return df.categoriesUrns.filter(dfCatUrn =>
                  dfCatUrn === getUrnFromArtefact(cat)
                ).length > 0;
              else
                return (df.categoriesUrns.length > 0);
            };

            return {
              ...state,
              dataflowTree:
                getCategorisedObjectsTree(
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
                  'name'
                )
            };
          default:
            return state;
        }
      default:
        return state;
    }
  }
;

export default dataflowBuilderTreeReducer;
