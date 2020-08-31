import {
  IMPORT_STRUCTURES_ALL_ITEMS_SELECT,
  IMPORT_STRUCTURES_FILE_UPLOAD,
  IMPORT_STRUCTURES_FORM_CHANGE,
  IMPORT_STRUCTURES_ITEM_SELECT,
  IMPORT_STRUCTURES_REPORT_HIDE,
  IMPORT_STRUCTURES_RESET,
  IMPORT_STRUCTURES_SUBMIT
} from "./actions";
import {REQUEST_SUCCESS} from "../../../middlewares/api/actions";
import {getStringFromArtefactTriplet} from "../../../utils/sdmxJson";
import _ from "lodash"

const importStructuresReducer = (
  state = {
    file: null,
    items: null,
    hash: null,
    report: null,
    selectedItems: null
  },
  action
) => {
  switch (action.type) {
    case IMPORT_STRUCTURES_FORM_CHANGE:
      return {
        ...state,
        file: action.fields.file !== undefined ? action.fields.file : state.file,
        items: null,
        hash: null,
        selectedItems: null
      };
    case IMPORT_STRUCTURES_RESET:
      return {
        ...state,
        file: null,
        items: null,
        hash: null,
        report: null,
        selectedItems: null
      };
    case IMPORT_STRUCTURES_REPORT_HIDE:
      return {
        ...state,
        report: null,
        items: null,
      };
    case IMPORT_STRUCTURES_ITEM_SELECT:
      let selectedItems = _.cloneDeep(state.selectedItems);
      selectedItems = action.selected
        ? (selectedItems || []).concat(action.item)
        : (selectedItems || []).filter(item => getStringFromArtefactTriplet(item) !== getStringFromArtefactTriplet(action.item));

      return {
        ...state,
        selectedItems: selectedItems
      };
    case IMPORT_STRUCTURES_ALL_ITEMS_SELECT:
      return {
        ...state,
        selectedItems: action.items
      };
    case REQUEST_SUCCESS:
      switch (action.label) {
        case IMPORT_STRUCTURES_FILE_UPLOAD:
          return {
            ...state,
            hash: action.response.hashImport,
            items: action.response.importedItem
          };
        case IMPORT_STRUCTURES_SUBMIT:
          return {
            ...state,
            file: null,
            hash: null,
            selectedItems: null,
            report: action.response.itemsMessage
          };
        default:
          return state;
      }
    default:
      return state;
  }
};

export default importStructuresReducer;
