import {
  DERIVED_ITEM_SCHEME_CHECKBOX_CHANGE,
  DERIVED_ITEM_SCHEME_CREATE_CHANGE,
  DERIVED_ITEM_SCHEME_CREATE_HIDE,
  DERIVED_ITEM_SCHEME_CREATE_SHOW,
  DERIVED_ITEM_SCHEME_ITEM_SELECT,
  DERIVED_ITEM_SCHEME_ITEMS_ADD,
  DERIVED_ITEM_SCHEME_ITEMS_REMOVE,
  DERIVED_ITEM_SCHEME_STATE_RESET
} from "./actions";
import {getFilteredTreeWithPaths, getNodes} from "../../utils/tree";
import _ from "lodash";

const derivedItemSchemeReducer = (
  state = {
    derivedItemScheme: null,
    derivedItemSchemeItems: null,
    importCheckbox: {
      preserveHierarchy: true,
      importParents: true,
      importChildren: false,
      importDescendants: false
    },
    isCreateVisible: false,
    selectedSourceItems: null,
    selectedTargetItems: null
  },
  action
) => {
  switch (action.type) {
    case DERIVED_ITEM_SCHEME_ITEM_SELECT: {
      return {
        ...state,
        selectedSourceItems: action.isSource
          ? action.selectedArr
          : state.selectedSourceItems,
        selectedTargetItems: !action.isSource
          ? action.selectedArr
          : state.selectedTargetItems
      };
    }
    case DERIVED_ITEM_SCHEME_ITEMS_ADD: {
      let newDerivedItemSchemeItems = [];
      let newSelectedItemsNodes =
        getNodes(action.itemTree, action.childrenKey, ({id}) => state.selectedSourceItems.includes(id));

      if (!state.importCheckbox.preserveHierarchy) {
        newDerivedItemSchemeItems = _.uniqBy(
          (newSelectedItemsNodes.map(item => ({...item, parent: null}))).concat(state.derivedItemSchemeItems || []),
          "id"
        );

      } else {

        if (!state.importCheckbox.importParents) {
          newSelectedItemsNodes = newSelectedItemsNodes.map(item => ({
            ...item,
            parent: !state.selectedSourceItems.includes(item.parent) ? null : item.parent
          }))
        }

        newDerivedItemSchemeItems = _.uniqBy(newSelectedItemsNodes.concat(state.derivedItemSchemeItems || []), "id");

        if (state.importCheckbox.importParents) {
          const selectedItemsParents = getNodes(
            getFilteredTreeWithPaths(
              action.itemTree,
              action.childrenKey,
              ({id}) => state.selectedSourceItems.includes(id)
            ),
            action.childrenKey,
            () => true
          );
          newDerivedItemSchemeItems = _.uniqBy(selectedItemsParents.concat(newDerivedItemSchemeItems), "id");
        }

        if (state.importCheckbox.importDescendants) {
          newDerivedItemSchemeItems = _.uniqBy(
            getNodes(newSelectedItemsNodes, action.childrenKey, () => true).concat(newDerivedItemSchemeItems),
            "id"
          );
        } else if (state.importCheckbox.importChildren) {
          newSelectedItemsNodes.forEach(item =>
            newDerivedItemSchemeItems = (item.categories || []).concat(newDerivedItemSchemeItems)
          );
          newDerivedItemSchemeItems = _.uniqBy(newDerivedItemSchemeItems, "id");
        }
      }

      return {
        ...state,
        derivedItemSchemeItems: newDerivedItemSchemeItems,
        selectedSourceItems: null
      };
    }
    case DERIVED_ITEM_SCHEME_ITEMS_REMOVE:
      return {
        ...state,
        derivedItemSchemeItems: state.derivedItemSchemeItems.filter(({id}) => !action.items.includes(id)),
        selectedTargetItems: null
      };
    case DERIVED_ITEM_SCHEME_CHECKBOX_CHANGE:
      return {
        ...state,
        importCheckbox: _.merge(state.importCheckbox, action.checkbox)
      };
    case DERIVED_ITEM_SCHEME_CREATE_SHOW:
      return {
        ...state,
        isCreateVisible: true,
        derivedItemScheme: {
          id: null,
          agencyID: null,
          version: null,
          name: null
        }
      };
    case DERIVED_ITEM_SCHEME_CREATE_HIDE:
      return {
        ...state,
        isCreateVisible: false,
        derivedItemScheme: null
      };
    case DERIVED_ITEM_SCHEME_CREATE_CHANGE:
      const derivedItemScheme = _.cloneDeep(state.derivedItemScheme);

      return {
        ...state,
        derivedItemScheme: _.merge(derivedItemScheme, action.fields)
      };
    case DERIVED_ITEM_SCHEME_STATE_RESET:
      return {
        ...state,
        derivedItemScheme: null,
        derivedItemSchemeItems: null,
        importCheckbox: {
          preserveHierarchy: true,
          importParents: true,
          importChildren: false,
          importDescendants: false
        },
        isCreateVisible: false,
        selectedSourceItems: null,
        selectedTargetItems: null
      };
    default:
      return state;
  }
};

export default derivedItemSchemeReducer;