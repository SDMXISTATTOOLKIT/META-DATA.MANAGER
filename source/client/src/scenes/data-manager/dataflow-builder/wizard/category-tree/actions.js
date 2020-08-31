import {getRequest} from '../../../../../middlewares/api/actions';
import {getCategorySchemeUrl} from '../../../../../constants/urls';

export const DATAFLOW_BUILDER_WIZARD_CATEGORY_TREE_SELECTION_CHANGE = 'DATAFLOW_BUILDER_WIZARD_CATEGORY_TREE_SELECTION_CHANGE';
export const DATAFLOW_BUILDER_WIZARD_CATEGORY_TREE_CATEGORISATIONS_READ = 'DATAFLOW_BUILDER_WIZARD_CATEGORY_TREE_CATEGORISATIONS_READ';

export const changeDataflowBuilderWizardCategoryTreeSelection = selection => ({
  type: DATAFLOW_BUILDER_WIZARD_CATEGORY_TREE_SELECTION_CHANGE,
  selection
});

export const readDataflowBuilderWizardCategoryTreeCategorisations = lang => ({
  ...getRequest(
    DATAFLOW_BUILDER_WIZARD_CATEGORY_TREE_CATEGORISATIONS_READ,
    getCategorySchemeUrl(null, true)
  ),
  lang
});
