import {combineReducers} from "redux";
import fileMappingListReducer from "./list/reducer";
import fileMappingWizardReducer from "./wizard/reducer";

const fileMappingReducer = combineReducers({
  components: combineReducers({
    list: fileMappingListReducer,
    wizard: fileMappingWizardReducer
  })
});

export default fileMappingReducer;