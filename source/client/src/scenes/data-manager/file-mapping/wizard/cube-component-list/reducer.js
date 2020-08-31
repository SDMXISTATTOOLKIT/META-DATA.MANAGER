import {reuseInReducer, reuseReducer} from "../../../../../utils/reduxReuse";
import codelistDetailModalReducer from "../../../../../redux-components/redux-codelist-detail-modal/reducer";

const fileMappingWizardCubeComponentListReducer = state => state;

export const DM_FILE_MAPPING_WIZARD_CUBE_COMPONENT_LIST_PREFIX = "DM_FILE_MAPPING_WIZARD_CUBE_COMPONENT_LIST_PREFIX_";

export default reuseInReducer(fileMappingWizardCubeComponentListReducer, {
  codelistDetail: reuseReducer(codelistDetailModalReducer, DM_FILE_MAPPING_WIZARD_CUBE_COMPONENT_LIST_PREFIX)
});